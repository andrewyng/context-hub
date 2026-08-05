---
name: package
description: "SQLAlchemy package guide for Python 2.0.50, covering engine setup, ORM/Core usage, transactions, and asyncio"
metadata:
  languages: "python"
  versions: "2.0.50"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "sqlalchemy,orm,sql,database,python,asyncio"
---

# SQLAlchemy Python Package Guide

## What It Is

`SQLAlchemy` is the main Python database toolkit and ORM. In 2.0, the intended style is:

- Core for SQL expression construction and connection-level work
- ORM for mapped classes and unit-of-work persistence
- `select()` plus `Session.execute()` / `Session.scalars()` instead of legacy `Query`-first patterns

This guide is for SQLAlchemy `2.0.50`, using the official 2.0 docs at `https://docs.sqlalchemy.org/en/20/`.

## Install

Install the package itself:

```bash
pip install SQLAlchemy==2.0.50
```

SQLAlchemy also needs a DBAPI driver for the database you actually use. Common choices:

```bash
pip install psycopg[binary]
pip install PyMySQL
pip install aiosqlite
```

PyPI also exposes extras for several backends and async support, for example:

```bash
pip install "SQLAlchemy[asyncio]==2.0.50"
pip install "SQLAlchemy[postgresql-asyncpg]==2.0.50"
```

Notes:

- `pip install SQLAlchemy` installs SQLAlchemy itself, not every database driver.
- SQLAlchemy's `asyncio` support depends on `greenlet`; this is installed automatically on common platforms but may need extra attention on less common architectures.
- If your project is already pinned, match that version instead of blindly taking latest examples from the web.

## Choose the Right Surface

Use Core when you want direct SQL expression work:

```python
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///app.db")

with engine.begin() as conn:
    conn.execute(text("CREATE TABLE IF NOT EXISTS ping (id integer primary key)"))
```

Use ORM when you want typed mapped classes, sessions, and identity tracking:

```python
from typing import Optional

from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user_account"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    fullname: Mapped[Optional[str]]

engine = create_engine("sqlite:///app.db")
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(User(name="squidward", fullname="Squidward Tentacles"))
    session.commit()

with Session(engine) as session:
    user = session.scalar(select(User).where(User.name == "squidward"))
    print(user)
```

## Engine and Connection Setup

Create one long-lived `Engine` per database configuration and reuse it across the app. `create_engine()` does not open a real DBAPI connection immediately; the first connection is established on first use.

Typical URL forms:

```python
from sqlalchemy import create_engine

sqlite_engine = create_engine("sqlite:///app.db")
postgres_engine = create_engine("postgresql://user:password@localhost/app")
mysql_engine = create_engine("mysql+pymysql://user:password@localhost/app")
```

If credentials contain characters like `@` or `/`, either URL-encode them or build the URL programmatically:

```python
from sqlalchemy import URL, create_engine

url = URL.create(
    "postgresql+psycopg",
    username="dbuser",
    password="kx@jj5/g",
    host="db.internal",
    database="appdb",
)

engine = create_engine(url)
```

Useful setup options:

```python
engine = create_engine(
    "postgresql://user:password@localhost/app",
    echo=False,
    pool_pre_ping=True,
)
```

Use `echo=True` only for local debugging; it logs SQL and parameters to stdout.

## ORM Model Setup

For new 2.0 code, prefer typed declarative mappings with:

- `DeclarativeBase`
- `Mapped[...]`
- `mapped_column()`
- `relationship()` for ORM links

Example with a one-to-many relationship:

```python
from __future__ import annotations

from typing import List, Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user_account"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    fullname: Mapped[Optional[str]]
    addresses: Mapped[List["Address"]] = relationship(back_populates="user")

class Address(Base):
    __tablename__ = "address"

    id: Mapped[int] = mapped_column(primary_key=True)
    email_address: Mapped[str]
    user_id: Mapped[int] = mapped_column(ForeignKey("user_account.id"))
    user: Mapped[User] = relationship(back_populates="addresses")
```

For prototypes and tests, create tables directly:

```python
Base.metadata.create_all(engine)
```

For production schema evolution, use migrations instead of relying on repeated `create_all()` calls. The standard tool is Alembic, maintained by the SQLAlchemy authors:

```bash
pip install alembic
alembic init alembic
```

Wire Alembic's `env.py` to your `Base.metadata` so it can autogenerate migrations:

```python
# alembic/env.py
from myapp.db import Base
target_metadata = Base.metadata
```

Then generate and apply migrations:

```bash
alembic revision --autogenerate -m "add user_account table"
alembic upgrade head
```

Autogenerate detects new columns, indexes, and constraints, but always review the generated script before applying it.

## Sessions and Transactions

Create one shared `sessionmaker` in application setup, then create short-lived `Session` objects per request, job, or command.

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("postgresql://user:password@localhost/app")
SessionLocal = sessionmaker(engine, expire_on_commit=False)
```

Preferred transaction shape:

```python
from sqlalchemy import select

with SessionLocal.begin() as session:
    session.add(User(name="patrick", fullname="Patrick Star"))

with SessionLocal() as session:
    user = session.scalar(select(User).where(User.name == "patrick"))
    print(user)
```

Practical rules:

- Keep the session lifecycle outside helper functions when possible.
- Put the main `begin` / `commit` boundary at the outermost layer.
- Reuse the `sessionmaker`; do not recreate it on every query.
- Call `Session.rollback()` after a flush or commit failure before trying to reuse that session.

## Querying in 2.0 Style

Prefer `select()` everywhere for new code.

Load ORM rows:

```python
from sqlalchemy import select

stmt = select(User).where(User.name.in_(["sandy", "patrick"]))

with SessionLocal() as session:
    users = session.scalars(stmt).all()
```

Load one object:

```python
with SessionLocal() as session:
    user = session.scalar(select(User).where(User.id == 1))
```

Get by primary key:

```python
with SessionLocal() as session:
    user = session.get(User, 1)
```

Join across relationships:

```python
stmt = (
    select(Address)
    .join(Address.user)
    .where(User.name == "sandy")
)

with SessionLocal() as session:
    addresses = session.scalars(stmt).all()
```

When you use joined eager loading for collections, call `.unique()` before materializing ORM objects:

```python
from sqlalchemy.orm import joinedload

stmt = select(User).options(joinedload(User.addresses))

with SessionLocal() as session:
    users = session.scalars(stmt).unique().all()
```

## Core SQL Execution

For raw SQL or expression-language work, execute against a `Connection`, not the `Engine` directly:

```python
from sqlalchemy import create_engine, select, table, column, text

engine = create_engine("sqlite:///app.db")
foo = table("foo", column("id"))

with engine.begin() as conn:
    conn.execute(text("CREATE TABLE IF NOT EXISTS foo (id integer primary key)"))
    conn.execute(text("INSERT INTO foo (id) VALUES (1)"))

with engine.connect() as conn:
    rows = conn.execute(select(foo.c.id)).fetchall()
```

If you need textual SQL, wrap it in `text(...)`.

## AsyncIO Setup

Use the async extension only with an async-compatible dialect/driver such as `postgresql+asyncpg` or `sqlite+aiosqlite`.

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

engine = create_async_engine("sqlite+aiosqlite:///app.db")
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async with AsyncSessionLocal() as session:
    result = await session.execute(select(User))
    users = result.scalars().all()
```

Creating tables from async code:

```python
async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
```

Async rules that matter:

- Use a separate `AsyncSession` per concurrent task.
- Avoid implicit lazy loading under asyncio.
- Prefer eager loading such as `selectinload(...)` when you know related data is needed.
- `expire_on_commit=False` is usually the safer default for async ORM usage.
- If you need awaitable relationship access, use `AsyncAttrs` and `awaitable_attrs`.

Example eager load:

```python
from sqlalchemy import select
from sqlalchemy.orm import selectinload

stmt = select(User).options(selectinload(User.addresses))

async with AsyncSessionLocal() as session:
    result = await session.execute(stmt)
    users = result.scalars().all()
```

## Configuration and Auth Notes

Treat the database URL as configuration, not hardcoded source text.

```python
import os
from sqlalchemy import create_engine

DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
```

Common examples:

```text
postgresql://user:password@localhost/app
postgresql+psycopg://user:password@localhost/app
mysql+pymysql://user:password@localhost/app
sqlite:///./app.db
sqlite+aiosqlite:///./app.db
```

Notes:

- SQLAlchemy handles connection logic; actual auth support comes from the driver and database backend.
- Backend-specific SSL, token auth, and socket options usually go in the URL query string, `connect_args`, or dialect-specific options.
- If passwords include reserved URL characters, prefer `URL.create(...)`.

## Common Pitfalls

### Mixing 1.x and 2.0 Query Patterns

For new code, prefer:

- `select(User)` instead of building everything around `session.query(User)`
- `session.execute(...)`, `session.scalars(...)`, `session.scalar(...)`

Legacy `Query` APIs still exist in parts of 2.0, but the official migration target is the unified `select()` pattern.

### Using `engine.execute()`

Do not generate new code with `engine.execute()`. In 2.0, statement execution belongs on:

- `Connection.execute()` for Core
- `Session.execute()` for ORM

### Forgetting Rollback After Flush Failure

If a flush fails, the underlying transaction is already rolled back, but the `Session` still must be explicitly rolled back before reuse:

```python
try:
    session.flush()
except Exception:
    session.rollback()
    raise
```

### Unexpected SQL from Autoflush

`Session.execute()`, lazy loads, refreshes, and commit boundaries can trigger flushes automatically. If you are constructing graphs of related objects and need a short protected window, use `session.no_autoflush`.

### Object Expiration After Commit

`Session.commit()` expires ORM objects by default. If your code needs to read recently committed attributes without issuing more SQL, set `expire_on_commit=False` on the `Session` or `sessionmaker`.

### Treating `create_all()` as Migrations

`Base.metadata.create_all()` is useful for bootstrapping or tests. It is not a schema migration system for production change management.

### Async Lazy Loading

Async ORM code fails when attribute access tries to emit implicit IO. Solve this by:

- eager loading with `selectinload(...)`
- setting `lazy="raise"` where appropriate
- using `AsyncAttrs.awaitable_attrs` when you intentionally want awaitable attribute access

## Version-Sensitive Notes for 2.0.50

- The docs root `https://docs.sqlalchemy.org/en/20/` is the correct stable series for `2.0.50`.
- PyPI shows `2.0.50` as the latest stable release on `2026-05-29`.
- PyPI may also list `2.1.x` prereleases. Do not mix 2.1 beta examples into a project pinned to `2.0.50`.
- `create_engine(..., future=True)` is a legacy 1.4 transition flag. In 2.0 it stays at the default and should not be added to new examples.
- Async `AsyncAttrs.awaitable_attrs` was added in `2.0.13`; it is available in `2.0.50`.
- SQLAlchemy 2.0 removed legacy autocommit and connectionless patterns. Use explicit transactions with `Session.begin()` / `engine.begin()` and execute statements via `Session` or `Connection`.
- The 1.x `session.query(...)` API still exists in 2.0 for compatibility, but the recommended pattern for new code is `session.execute(select(...))`, `session.scalars(select(...))`, and `session.scalar(select(...))`.

## Minimal Working Patterns

### Fast ORM Bootstrap

```python
from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class Item(Base):
    __tablename__ = "item"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

engine = create_engine("sqlite:///items.db")
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(Item(name="example"))
    session.commit()

with Session(engine) as session:
    items = session.scalars(select(Item)).all()
    print(items)
```

### Fast Core Bootstrap

```python
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///items.db")

with engine.begin() as conn:
    conn.execute(text("CREATE TABLE IF NOT EXISTS item (id integer primary key, name text)"))
    conn.execute(text("INSERT INTO item (name) VALUES (:name)"), {"name": "example"})
```

## Official Sources

- SQLAlchemy 2.0 docs: `https://docs.sqlalchemy.org/en/20/`
- Overview and installation: `https://docs.sqlalchemy.org/en/20/intro.html`
- Engine configuration and database URLs: `https://docs.sqlalchemy.org/en/20/core/engines.html`
- ORM quick start: `https://docs.sqlalchemy.org/en/20/orm/quickstart.html`
- AsyncIO extension: `https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html`
- 2.0 migration guide: `https://docs.sqlalchemy.org/en/20/changelog/migration_20.html`
- Alembic migrations: `https://alembic.sqlalchemy.org/en/latest/`
- PyPI package page: `https://pypi.org/project/SQLAlchemy/`
