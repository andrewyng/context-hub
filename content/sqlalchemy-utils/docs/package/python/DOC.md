---
name: package
description: "SQLAlchemy-Utils package guide for Python projects using custom data types, listeners, generic relationships, aggregates, and database helpers"
metadata:
  languages: "python"
  versions: "0.42.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "sqlalchemy,sqlalchemy-utils,python,orm,database,types"
---

# SQLAlchemy-Utils Python Package Guide

## Golden Rule

Use `sqlalchemy-utils` to extend normal SQLAlchemy models, not as a separate client layer. Import the helpers you need directly into your model module, and call `force_auto_coercion()` before defining models if you want supported custom types to coerce plain Python values automatically.

## Install

Base package:

```bash
python -m pip install "sqlalchemy-utils==0.42.1"
```

Common optional extras published on PyPI:

```bash
python -m pip install "sqlalchemy-utils[phone]==0.42.1"
python -m pip install "sqlalchemy-utils[encrypted]==0.42.1"
```

Use the `phone` extra if you need `PhoneNumberType`. Use the `encrypted` extra if you need encrypted column types. The package has no service-side authentication; the only runtime configuration you usually need is your SQLAlchemy database URL and, for encrypted columns, an application-managed encryption key.

```bash
export DATABASE_URL="postgresql+psycopg://app:secret@localhost/appdb"
export APP_ENCRYPTION_KEY="replace-this-with-a-real-secret"
```

## Minimal Setup

This is the smallest practical setup for a SQLAlchemy app that uses `sqlalchemy-utils` types and coercion:

```python
import os
import uuid

import sqlalchemy as sa
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy_utils import EmailType, UUIDType, force_auto_coercion

DATABASE_URL = os.environ["DATABASE_URL"]

engine = sa.create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
Base = declarative_base()

# Enable automatic coercion for supported SQLAlchemy-Utils scalar types.
force_auto_coercion()


class User(Base):
    __tablename__ = "user"

    id = sa.Column(UUIDType(binary=False), primary_key=True, default=uuid.uuid4)
    email = sa.Column(EmailType, nullable=False, unique=True)


Base.metadata.create_all(engine)

with Session() as session:
    user = User(email="person@example.com")
    session.add(user)
    session.commit()
```

`UUIDType` stores `uuid.UUID` values and can use native UUID support where the backend provides it. `EmailType` normalizes email values through SQLAlchemy-Utils instead of leaving them as plain strings.

## Common Workflows

### Use typed columns for UUIDs, phone numbers, and encrypted values

```python
import os
import uuid

import sqlalchemy as sa
from sqlalchemy.orm import declarative_base
from sqlalchemy_utils import PhoneNumberType, StringEncryptedType, UUIDType, force_auto_coercion
from sqlalchemy_utils.types.encrypted.encrypted_type import AesGcmEngine

Base = declarative_base()
force_auto_coercion()


class Contact(Base):
    __tablename__ = "contact"

    id = sa.Column(UUIDType(binary=False), primary_key=True, default=uuid.uuid4)
    phone = sa.Column(PhoneNumberType(region="US"))
    api_token = sa.Column(
        StringEncryptedType(
            sa.String(),
            key=os.environ["APP_ENCRYPTION_KEY"],
            engine=AesGcmEngine,
        ),
        nullable=False,
    )
```

`PhoneNumberType` stores `PhoneNumber` objects and accepts a default region. `StringEncryptedType` is the maintained encrypted type; upstream marks `EncryptedType` as deprecated since `0.36.6`.

### Add created/updated timestamps automatically

```python
import sqlalchemy as sa
from sqlalchemy.orm import declarative_base
from sqlalchemy_utils import Timestamp

Base = declarative_base()


class Article(Base, Timestamp):
    __tablename__ = "article"

    id = sa.Column(sa.Integer, primary_key=True)
    title = sa.Column(sa.Unicode(255), nullable=False)
```

`Timestamp` adds `created` and `updated` columns. The mixin updates `updated` automatically on flush when the row changes.

### Use generic relationships when a row can point at different model types

```python
import sqlalchemy as sa
from sqlalchemy.orm import declarative_base
from sqlalchemy_utils import generic_relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "user"
    id = sa.Column(sa.Integer, primary_key=True)


class Organization(Base):
    __tablename__ = "organization"
    id = sa.Column(sa.Integer, primary_key=True)


class Event(Base):
    __tablename__ = "event"

    id = sa.Column(sa.Integer, primary_key=True)
    object_type = sa.Column(sa.Unicode(255))
    object_id = sa.Column(sa.Integer, nullable=False)
    object = generic_relationship(object_type, object_id)
```

Assign either model directly:

```python
event.object = user
event.object = organization
```

Filter by the related object or by model type:

```python
session.query(Event).filter_by(object=user).first()
session.query(Event).filter(Event.object.is_type(User)).all()
```

### Keep denormalized counters in sync with `aggregated`

Use `aggregated()` when a parent row needs a value derived from related rows:

```python
import sqlalchemy as sa
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy_utils import aggregated

Base = declarative_base()


class Thread(Base):
    __tablename__ = "thread"

    id = sa.Column(sa.Integer, primary_key=True)
    comment_count = sa.Column(sa.Integer, default=0)
    comments = relationship("Comment", back_populates="thread")

    @aggregated("comments", sa.Column(sa.Integer))
    def comment_count(self):
        return sa.func.count("1")


class Comment(Base):
    __tablename__ = "comment"

    id = sa.Column(sa.Integer, primary_key=True)
    thread_id = sa.Column(sa.Integer, sa.ForeignKey("thread.id"))
    thread = relationship("Thread", back_populates="comments")
```

Upstream positions `aggregated()` as the efficient option for aggregate values over large collections, while `observes()` is more suitable for simple object-graph updates.

### Create a database before building tables

```python
import os

import sqlalchemy as sa
from sqlalchemy_utils import create_database, database_exists

url = os.environ["DATABASE_URL"]

if not database_exists(url):
    create_database(url)

engine = sa.create_engine(url)
```

The same helper module also provides `drop_database()` for teardown scripts.

## Important Pitfalls

- Call `force_auto_coercion()` before mapping models. If you forget it, custom types still work, but you lose automatic Python-value coercion for supported types.
- `StringEncryptedType` needs a stable application key. Rotating the key without a migration plan makes existing encrypted values unreadable.
- Upstream notes that the `AesGcmEngine` and `FernetEngine` backends are more secure, but encrypted values cannot be searched with SQL operators because the ciphertext changes every time.
- If you encrypt `Date` or `DateTime` values, upstream requires `python-dateutil` so encrypted datetime values can be processed correctly.
- `PhoneNumberType` depends on the optional `phonenumbers` package; install the `phone` extra or the import will fail.
- Generic relationships trade away database-level foreign keys. Use them only when one association really can target multiple tables.

## Version-Sensitive Notes

- PyPI currently lists `0.42.1`, while the Read the Docs pages still identify themselves as `0.42.0` documentation. The core APIs in the maintainer docs and source still match the `0.42.1` package line.
- PyPI metadata for `0.42.1` requires Python `>=3.9`.
- Upstream deprecates `EncryptedType` in favor of `StringEncryptedType`; new code should use `StringEncryptedType`.

## Official Sources

- Maintainer docs root: https://sqlalchemy-utils.readthedocs.io/en/latest/
- Data types: https://sqlalchemy-utils.readthedocs.io/en/latest/data_types.html
- Listeners: https://sqlalchemy-utils.readthedocs.io/en/latest/listeners.html
- Generic relationships: https://sqlalchemy-utils.readthedocs.io/en/latest/generic_relationship.html
- Aggregates: https://sqlalchemy-utils.readthedocs.io/en/latest/aggregates.html
- Database helpers: https://sqlalchemy-utils.readthedocs.io/en/latest/database_helpers.html
- Models and mixins: https://sqlalchemy-utils.readthedocs.io/en/latest/models.html
- Stable PDF index with API signatures: https://sqlalchemy-utils.readthedocs.io/_/downloads/en/stable/pdf/
- PyPI package metadata and extras: https://pypi.org/project/sqlalchemy-utils/
- Maintainer source repository: https://github.com/kvesteri/sqlalchemy-utils
