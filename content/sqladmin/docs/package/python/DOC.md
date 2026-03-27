---
name: package
description: "SQLAdmin package guide for FastAPI and Starlette apps using SQLAlchemy model admins, authentication, and custom views"
metadata:
  languages: "python"
  versions: "0.23.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "sqladmin,sqlalchemy,fastapi,starlette,admin,python"
---

# SQLAdmin Python Package Guide

## What It Is

`sqladmin` adds an admin UI for SQLAlchemy models in Starlette and FastAPI applications. The maintainer docs describe support for sync and async SQLAlchemy engines, WTForms-based form generation, and SQLModel-backed models.

By default, the admin UI is mounted at `/admin`.

This guide covers `0.23.0`.

## Install

Install the package version this guide covers:

```bash
python -m pip install "sqladmin==0.23.0"
```

PyPI also publishes a `full` extra for optional dependencies:

```bash
python -m pip install "sqladmin[full]==0.23.0"
```

For the FastAPI examples below you also need your ASGI framework, SQLAlchemy, and a server:

```bash
python -m pip install "fastapi>=0.110" "sqlalchemy>=2.0" "uvicorn[standard]"
```

If you use PostgreSQL, MySQL, or async SQLite, install the matching SQLAlchemy driver separately.

### Example environment variables

SQLAdmin does not define env var names itself; these are app-level values used by the examples in this guide:

```env
DATABASE_URL=sqlite:///./app.db
ADMIN_SECRET_KEY=change-me
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
```

## Minimal FastAPI Setup

This is the smallest useful setup: define a SQLAlchemy model, create the `Admin` object, register a `ModelView`, and run the app.

```python
import os

from fastapi import FastAPI
from sqlalchemy import Boolean, Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base
from sqladmin import Admin, ModelView

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

Base = declarative_base()
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    is_active = Column(Boolean, default=True, nullable=False)


Base.metadata.create_all(engine)

app = FastAPI()
admin = Admin(app, engine, base_url="/admin", title="Backoffice")


class UserAdmin(ModelView, model=User):
    name = "User"
    name_plural = "Users"
    column_list = [User.id, User.email, User.is_active]
    column_searchable_list = [User.email]
    column_sortable_list = [User.id, User.email]
    can_view_details = True
    can_export = True


admin.add_view(UserAdmin)
```

Run it:

```bash
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000/admin`.

Important default: if you do not set `column_list`, SQLAdmin only shows the model primary key in the list page.

## Use Your Existing `sessionmaker`

`Admin(...)` accepts either `engine=` or `session_maker=`. Use `session_maker=` when your app already has a configured session factory, when you need async sessions, or when one session is bound to multiple databases.

```python
import os

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqladmin import Admin

engine = create_async_engine(os.environ["DATABASE_URL"])
Session = sessionmaker(bind=engine, class_=AsyncSession)

app = FastAPI()
admin = Admin(app=app, session_maker=Session)
```

This preserves your own session configuration instead of letting SQLAdmin build a session factory from an engine.

## Authentication

SQLAdmin does not enforce authentication by itself. The documented way to protect the admin is to provide an `AuthenticationBackend`.

`AuthenticationBackend` requires `itsdangerous`. Install it directly or use `sqladmin[full]`.

```python
import os

from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form["username"]
        password = form["password"]

        if (
            username != os.environ["ADMIN_USERNAME"]
            or password != os.environ["ADMIN_PASSWORD"]
        ):
            return False

        request.session.update({"admin_token": "authenticated"})
        return True

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return bool(request.session.get("admin_token"))


authentication_backend = AdminAuth(secret_key=os.environ["ADMIN_SECRET_KEY"])
admin = Admin(app=app, engine=engine, authentication_backend=authentication_backend)
```

For OAuth-style flows, the upstream docs show adding Starlette `SessionMiddleware` and returning a redirect from `authenticate(...)` when the user is not logged in.

## Common `ModelView` Configuration

Most day-to-day customization happens on the `ModelView` class.

```python
from sqladmin import ModelView


class UserAdmin(ModelView, model=User):
    can_create = True
    can_edit = True
    can_delete = False
    can_view_details = True

    column_list = [User.id, User.email, User.is_active]
    column_searchable_list = [User.email]
    column_sortable_list = [User.id, User.email]
    column_labels = {User.email: "Email"}

    page_size = 25
    page_size_options = [25, 50, 100]

    form_excluded_columns = []
```

Useful documented options:

- `column_searchable_list` enables list-page search.
- `column_sortable_list` enables sortable columns.
- `page_size` and `page_size_options` control list pagination.
- `form_ajax_refs` loads related models asynchronously for large relationship tables.
- `can_export`, `column_export_list`, and `export_max_rows` control list exports.

The configuration guide says export support is currently CSV-only.

## Custom Admin Pages

Use `BaseView` and `@expose(...)` when you need a dashboard or a non-model page inside the admin UI.

```python
from sqladmin import BaseView, expose
from starlette.requests import Request


class ReportView(BaseView):
    name = "Reports"
    icon = "fa-solid fa-chart-line"

    @expose("/reports", methods=["GET"])
    async def reports(self, request: Request):
        return await self.templates.TemplateResponse(request, "report.html")


admin.add_view(ReportView)
```

By default SQLAdmin looks for templates in a `templates` directory. If your app keeps them elsewhere, pass `templates_dir="my_templates"` to `Admin(...)`.

## Sensitive Fields And Form Rules

The upstream password example uses three SQLAdmin features together:

- `column_labels` to rename a stored field like `hashed_password` to a friendlier label
- `form_create_rules` and `form_edit_rules` to show different fields on create vs edit
- `on_model_change(...)` to transform data before saving it

Use that pattern for password hashing or other write-time transformations.

Important constraint from the API reference: `form_create_rules` and `form_edit_rules` cannot be combined with `form_rules`.

## Common Pitfalls

- SQLAdmin does not secure your app automatically. If you do not pass `authentication_backend=...`, `/admin` is available without a login flow.
- `AuthenticationBackend` needs `itsdangerous`; install it explicitly or use the `full` extra.
- Only the primary key is shown by default in list pages. Set `column_list` on every `ModelView` you care about.
- Use `session_maker=` instead of `engine=` if your app already has a configured session factory or multiple binds.
- `form_create_rules` and `form_edit_rules` are mutually exclusive with `form_rules`.
- Use `form_ajax_refs` for relationships with many rows; otherwise admin forms can become unwieldy.

## Official Sources

- Maintainer docs root: https://aminalaee.github.io/sqladmin/
- Quickstart: https://aminalaee.github.io/sqladmin/
- Configuration guide: https://aminalaee.github.io/sqladmin/configurations/
- Authentication guide: https://aminalaee.github.io/sqladmin/authentication/
- Custom views: https://aminalaee.github.io/sqladmin/writing_custom_views/
- Multiple databases / `session_maker`: https://aminalaee.github.io/sqladmin/cookbook/multiple_databases/
- Password workflow example: https://aminalaee.github.io/sqladmin/cookbook/working_with_passwords/
- Application API reference: https://aminalaee.github.io/sqladmin/api_reference/application/
- `ModelView` API reference: https://aminalaee.github.io/sqladmin/api_reference/model_view/
- PyPI package page: https://pypi.org/project/sqladmin/
