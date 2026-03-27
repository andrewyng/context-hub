---
name: package
description: "FastAPI Users package guide for FastAPI authentication, user management, JWT and cookie auth, and SQLAlchemy integration"
metadata:
  languages: "python"
  versions: "15.0.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "fastapi-users,fastapi,python,auth,users,jwt,cookies,sqlalchemy"
---

# FastAPI Users Python Package Guide

## Golden Rule

Use `fastapi-users` to generate auth and user-management routes on top of your own FastAPI models, schemas, and database adapter. The library is configurable, but it is not zero-config: you still need to define a user model, a `UserManager`, at least one authentication backend, and the routers you actually want to expose.

As of March 13, 2026, PyPI lists `fastapi-users 15.0.4`, requires Python `>=3.10`, and marks the project as in maintenance mode. The package is still supported for security and dependency updates, but the maintainers are not adding new features.

## Install

For a typical FastAPI + SQLAlchemy setup:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "fastapi-users[sqlalchemy]==15.0.4"
python -m pip install "sqlalchemy[asyncio]"
python -m pip install aiosqlite
```

Use the async driver that matches your database:

- PostgreSQL: `pip install asyncpg`
- SQLite: `pip install aiosqlite`

Optional extras published on PyPI:

- `fastapi-users[oauth]` for OAuth providers via `httpx-oauth`
- `fastapi-users[redis]` for Redis-backed tokens
- `fastapi-users[beanie]` for Beanie instead of SQLAlchemy

Environment variables used in the examples below:

```bash
export DATABASE_URL="sqlite+aiosqlite:///./app.db"
export FASTAPI_USERS_SECRET="change-me"
```

## Minimal SQLAlchemy Setup

The official docs use async SQLAlchemy with `SQLAlchemyBaseUserTableUUID` and `SQLAlchemyUserDatabase`. Keep `expire_on_commit=False`; the SQLAlchemy adapter docs call this out explicitly for async sessions.

### `app/db.py`

```python
import os
from collections.abc import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    pass


async def create_db_and_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(
    session: AsyncSession = Depends(get_async_session),
) -> AsyncGenerator[SQLAlchemyUserDatabase, None]:
    yield SQLAlchemyUserDatabase(session, User)
```

### `app/schemas.py`

```python
import uuid

from fastapi_users import schemas


class UserRead(schemas.BaseUser[uuid.UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass
```

### `app/users.py`

```python
import os
import uuid

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, InvalidPasswordException, UUIDIDMixin
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy

from .db import User, get_user_db
from .schemas import UserCreate

SECRET = os.environ["FASTAPI_USERS_SECRET"]


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def validate_password(self, password: str, user: UserCreate | User) -> None:
        if len(password) < 8:
            raise InvalidPasswordException(
                reason="Password should be at least 8 characters"
            )
        if user.email in password:
            raise InvalidPasswordException(
                reason="Password should not contain e-mail"
            )

    async def on_after_register(self, user: User, request: Request | None = None) -> None:
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ) -> None:
        print(f"Reset token for {user.id}: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ) -> None:
        print(f"Verify token for {user.id}: {token}")


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])
current_active_user = fastapi_users.current_user(active=True)
current_verified_user = fastapi_users.current_user(active=True, verified=True)
```

### `app/main.py`

```python
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI

from .db import User, create_db_and_tables
from .schemas import UserCreate, UserRead, UserUpdate
from .users import auth_backend, current_active_user, current_verified_user, fastapi_users


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)


@app.get("/protected-route")
async def protected_route(user: User = Depends(current_active_user)):
    return {"id": str(user.id), "email": user.email}


@app.get("/verified-only")
async def verified_only(user: User = Depends(current_verified_user)):
    return {"email": user.email, "verified": user.is_verified}
```

Run the app:

```bash
uvicorn app.main:app --reload
```

For production schema changes, use Alembic migrations instead of relying on `Base.metadata.create_all()`.

## Auth Backends: Bearer vs Cookie

An authentication backend is `transport + strategy`.

- `BearerTransport` is the simplest choice for APIs and mobile clients. It expects `Authorization: Bearer <token>`.
- `CookieTransport` is better for browser-based flows because the browser stores and resends the auth cookie automatically.
- `JWTStrategy` is stateless. The official JWT docs note that logout does not invalidate an issued JWT on the server side; it remains valid until it expires.
- If you need server-side revocation, use a stateful strategy such as Redis instead of JWT.

Cookie transport example:

```python
from fastapi_users.authentication import CookieTransport

cookie_transport = CookieTransport(
    cookie_max_age=3600,
    cookie_secure=True,
    cookie_samesite="lax",
)
```

Important cookie defaults from the official docs:

- `cookie_secure=True`
- `cookie_httponly=True`
- `cookie_samesite="lax"`

For local HTTP development, set secure cookie flags to `False` where needed. The OAuth docs call this out for the CSRF cookie as well.

## Common Route Flow

FastAPI Users only exposes the routers you include. The usual set is:

- auth router: `/auth/jwt/login`, `/auth/jwt/logout`
- register router: `/auth/register`
- reset password router: `/auth/forgot-password`, `/auth/reset-password`
- verify router: `/auth/request-verify-token`, `/auth/verify`
- users router: `/users/me` and superuser-only `/users/{user_id}` routes

### Register

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"strong-password"}'
```

### Log in with the JWT backend

The login route expects `application/x-www-form-urlencoded`, not JSON, and the email goes in a field named `username`.

```bash
curl -X POST http://127.0.0.1:8000/auth/jwt/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=user@example.com&password=strong-password'
```

Successful bearer login returns:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer"
}
```

### Call an authenticated route

```bash
curl http://127.0.0.1:8000/users/me \
  -H 'Authorization: Bearer jwt-token'
```

### Request email verification and password reset

```bash
curl -X POST http://127.0.0.1:8000/auth/request-verify-token \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com"}'

curl -X POST http://127.0.0.1:8000/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com"}'
```

Both routes intentionally return `202 Accepted` even when the account does not exist, to avoid leaking which emails are registered.

If you want to block login and user routes until the email is verified, enable `requires_verification=True` when generating those routers:

```python
app.include_router(
    fastapi_users.get_auth_router(auth_backend, requires_verification=True),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(
        UserRead,
        UserUpdate,
        requires_verification=True,
    ),
    prefix="/users",
    tags=["users"],
)
```

## OAuth

FastAPI Users can generate OAuth routers, but OAuth support is optional and requires the `oauth` extra:

```bash
python -m pip install "fastapi-users[sqlalchemy,oauth]==15.0.4"
```

The official docs use `httpx-oauth` clients and generate a router like this:

```python
app.include_router(
    fastapi_users.get_oauth_router(google_oauth_client, auth_backend, SECRET),
    prefix="/auth/google",
    tags=["auth"],
)
```

The OAuth flow sets a CSRF cookie. In local development without HTTPS, the docs recommend setting the OAuth CSRF cookie's `secure` flag to `False` so the browser actually sends it.

## Password Hashing

Current FastAPI Users docs use `pwdlib`. By default, the library hashes passwords with Argon2 and keeps backwards compatibility with Bcrypt hashes.

If you need to customize the password helper:

```python
from fastapi_users.password import PasswordHelper
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

password_hash = PasswordHash((Argon2Hasher(),))
password_helper = PasswordHelper(password_hash)


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db, password_helper)
```

This is version-sensitive: older FastAPI Users articles often show Passlib and BCrypt-only configuration. That does not match the current password-hash docs.

## Common Pitfalls

- Do not forget the database driver. `fastapi-users[sqlalchemy]` does not replace `asyncpg` or `aiosqlite`.
- Keep `expire_on_commit=False` for async SQLAlchemy sessions or you will hit confusing expired-instance behavior.
- `UserManager` owns password validation, verification tokens, reset tokens, and lifecycle hooks. Do not try to bolt those back onto router callbacks from old examples.
- `POST /auth/jwt/login` uses form data with `username=<email>`, not a JSON body.
- `current_user(active=True, verified=True, superuser=True)` changes the response status on failure: unauthenticated or inactive requests become `401`, while verified and superuser checks fail with `403`.
- With JWT, logout is not token revocation. Keep `lifetime_seconds` short enough for your threat model or switch to Redis/database-backed sessions.
- `create_all()` is acceptable for a minimal demo, not for long-lived production schema management.

## Version Notes For 15.0.4

- PyPI shows `15.0.4` released on February 5, 2026.
- PyPI currently requires Python `>=3.10`.
- Published extras are `sqlalchemy`, `beanie`, `redis`, and `oauth`.
- The project is in maintenance mode, so plan around stability rather than new feature work.

## Official Sources

- Documentation root: https://fastapi-users.github.io/fastapi-users/latest/
- Installation: https://fastapi-users.github.io/fastapi-users/latest/installation/
- SQLAlchemy adapter: https://fastapi-users.github.io/fastapi-users/latest/configuration/databases/sqlalchemy/
- Full example: https://fastapi-users.github.io/fastapi-users/latest/configuration/full-example/
- User manager: https://fastapi-users.github.io/fastapi-users/latest/configuration/user-manager/
- Schemas: https://fastapi-users.github.io/fastapi-users/latest/configuration/schemas/
- Auth router: https://fastapi-users.github.io/fastapi-users/latest/configuration/routers/auth/
- Register router: https://fastapi-users.github.io/fastapi-users/latest/configuration/routers/register/
- Verify router: https://fastapi-users.github.io/fastapi-users/latest/configuration/routers/verify/
- Routes usage: https://fastapi-users.github.io/fastapi-users/latest/usage/routes/
- Current user dependency: https://fastapi-users.github.io/fastapi-users/latest/usage/current-user/
- Cookie transport: https://fastapi-users.github.io/fastapi-users/latest/configuration/authentication/transports/cookie/
- JWT strategy: https://fastapi-users.github.io/fastapi-users/latest/configuration/authentication/strategies/jwt/
- OAuth: https://fastapi-users.github.io/fastapi-users/latest/configuration/oauth/
- Password hash: https://fastapi-users.github.io/fastapi-users/latest/configuration/password-hash/
- PyPI package page: https://pypi.org/project/fastapi-users/
