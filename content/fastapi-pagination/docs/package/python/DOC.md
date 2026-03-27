---
name: package
description: "FastAPI pagination helpers for page models, query params, and database integrations in Python FastAPI apps"
metadata:
  languages: "python"
  versions: "0.15.10"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "fastapi,pagination,python,sqlalchemy,api"
---

# fastapi-pagination Python Package Guide

## Golden Rule

Use `fastapi-pagination` to define the response model and request params for paginated FastAPI endpoints, but use the right paginator for your data source:

- `fastapi_pagination.paginate(...)` for in-memory lists and sequences
- `fastapi_pagination.ext.sqlalchemy.paginate(...)` for SQLAlchemy queries
- other `fastapi_pagination.ext.*` modules for supported integrations such as SQLModel, Tortoise ORM, Django, and Mongo-style backends

The package does not need an API key or a client object. The core setup is importing the page type you want and registering pagination with `add_pagination(app)`.

## Install

`fastapi-pagination 0.15.10` requires Python 3.10 or later.

Base install:

```bash
python -m pip install "fastapi-pagination==0.15.10"
```

If you paginate SQLAlchemy queries, install the SQLAlchemy extra:

```bash
python -m pip install "fastapi-pagination[sqlalchemy]==0.15.10"
```

The package itself does not use environment variables. If your app paginates database queries, configure the database exactly as that integration expects. For example:

```bash
DATABASE_URL=sqlite:///./app.db
```

## Basic FastAPI Setup

`Page[T]` is the default page model. `Params` uses `page` and `size` query parameters.

```python
from fastapi import FastAPI
from pydantic import BaseModel

from fastapi_pagination import Page, add_pagination, paginate

app = FastAPI()


class UserOut(BaseModel):
    id: int
    email: str


users = [
    UserOut(id=1, email="ada@example.com"),
    UserOut(id=2, email="grace@example.com"),
    UserOut(id=3, email="linus@example.com"),
]


@app.get("/users")
async def list_users() -> Page[UserOut]:
    return paginate(users)


add_pagination(app)
```

Request example:

```http
GET /users?page=1&size=50
```

## SQLAlchemy Query Pagination

Do not pass a SQLAlchemy query to the generic `fastapi_pagination.paginate`. Use the SQLAlchemy extension instead.

```python
import os
from collections.abc import Generator

from fastapi import Depends, FastAPI
from pydantic import BaseModel, ConfigDict
from sqlalchemy import Integer, String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from fastapi_pagination import Page, add_pagination
from fastapi_pagination.ext.sqlalchemy import paginate

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./app.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


def get_session() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


app = FastAPI()


@app.get("/users")
def list_users(session: Session = Depends(get_session)) -> Page[UserOut]:
    query = select(User).order_by(User.id)
    return paginate(session, query)


add_pagination(app)
```

This extension paginates at the query level instead of loading every row into memory first.

## Limit-Offset Pagination

Use `LimitOffsetPage[T]` if the API should accept `limit` and `offset` instead of `page` and `size`.

```python
from fastapi import FastAPI
from pydantic import BaseModel

from fastapi_pagination import add_pagination, paginate
from fastapi_pagination.limit_offset import LimitOffsetPage

app = FastAPI()


class UserOut(BaseModel):
    id: int
    email: str


@app.get("/users")
async def list_users() -> LimitOffsetPage[UserOut]:
    data = [
        UserOut(id=1, email="ada@example.com"),
        UserOut(id=2, email="grace@example.com"),
        UserOut(id=3, email="linus@example.com"),
    ]
    return paginate(data)


add_pagination(app)
```

Request example:

```http
GET /users?limit=20&offset=40
```

## Cursor Pagination

Use `CursorPage[T]` when you need stable pagination over an ordered dataset. The docs show cursor pagination with the SQLAlchemy extension.

```python
from fastapi import Depends, FastAPI
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi_pagination import add_pagination
from fastapi_pagination.cursor import CursorPage
from fastapi_pagination.ext.sqlalchemy import paginate

app = FastAPI()


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


@app.get("/users")
def list_users(session: Session = Depends(get_session)) -> CursorPage[UserOut]:
    query = select(User).order_by(User.id)
    return paginate(session, query)


add_pagination(app)
```

Request example:

```http
GET /users?cursor=<opaque-cursor>
```

Cursor pagination depends on deterministic ordering. Always apply an explicit `order_by(...)` to the query you paginate.

## Customize Query Parameters Or Page Shape

Use `CustomizedPage[...]` and customizers when the default page model is close, but not exactly what you want.

This example keeps the normal `Page[T]` payload shape and constrains the `page` and `size` query parameters:

```python
from typing import TypeVar

from fastapi import FastAPI, Query
from pydantic import BaseModel

from fastapi_pagination import Page, add_pagination, paginate
from fastapi_pagination.customization import CustomizedPage, UseParamsFields

T = TypeVar("T")

CustomPage = CustomizedPage[
    Page[T],
    UseParamsFields(
        page=Query(1, ge=1, description="1-based page number"),
        size=Query(25, ge=1, le=100, description="Items per page"),
    ),
]

app = FastAPI()


class UserOut(BaseModel):
    id: int
    email: str


@app.get("/users")
async def list_users() -> CustomPage[UserOut]:
    return paginate(
        [
            UserOut(id=1, email="ada@example.com"),
            UserOut(id=2, email="grace@example.com"),
        ]
    )


add_pagination(app)
```

Other documented customizers include renaming the generated page model, moving metadata into response headers, and disabling total-count calculation.

## Common Pitfalls

- The top-level `paginate(...)` helper is for in-memory data. For ORM and database integrations, import `paginate` from the matching `fastapi_pagination.ext.*` module.
- If you want cursor pagination with SQLAlchemy, install the `sqlalchemy` extra and paginate an ordered query.
- `Page[T]` and `LimitOffsetPage[T]` use different query parameter names. Pick the page type that matches your public API before clients integrate with it.
- If your response items come from ORM objects, make sure the response schema can read attributes from those objects. With Pydantic v2, `ConfigDict(from_attributes=True)` is the common fix.
- For low-level or manual integration, the docs expose `pagination_ctx`, `set_page`, `set_params`, and `create_page`, but most FastAPI routes should use `add_pagination(app)` and a page return type first.

## Version-Sensitive Notes

- In the 0.14 migration guide, `total` became required by default for `Page`, `LimitOffsetPage`, and `CursorPage`. If you intentionally want to skip total-count calculation, use the documented `UseIncludeTotal(False)` customizer.
- In the 0.13 migration guide, the async paginator function was renamed from `paginate` to `apaginate`. Older async usage still works, but the project recommends updating imports in new code.
- `fastapi-pagination 0.15.10` still documents Pydantic v1 compatibility through a customization helper, but new FastAPI projects should prefer Pydantic v2-style models.

## Official Sources

- Maintainer docs root: https://uriyyo-fastapi-pagination.netlify.app/
- First Steps: https://uriyyo-fastapi-pagination.netlify.app/learn/tutorial_user_guide/first_steps/
- Add to Route: https://uriyyo-fastapi-pagination.netlify.app/learn/tutorial_user_guide/add_to_route/
- Available page types: https://uriyyo-fastapi-pagination.netlify.app/learn/pagination/techniques/
- SQLAlchemy integration: https://uriyyo-fastapi-pagination.netlify.app/integrations/sqlalchemy/paginate/
- Customizers: https://uriyyo-fastapi-pagination.netlify.app/customization/customizers/use_params_fields/
- Low-level API: https://uriyyo-fastapi-pagination.netlify.app/learn/tutorial_advanced/low_level_api/
- Migration from v0.14.x: https://uriyyo-fastapi-pagination.netlify.app/migration/0_14_x/
- Migration from v0.13.x: https://uriyyo-fastapi-pagination.netlify.app/migration/0_13_x/
- PyPI package page: https://pypi.org/project/fastapi-pagination/
- Project metadata (`pyproject.toml`): https://raw.githubusercontent.com/uriyyo/fastapi-pagination/main/pyproject.toml
