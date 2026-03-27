---
name: package
description: "Serialize Python dataclasses to and from JSON and dictionaries with field mapping, validation, and custom encoders"
metadata:
  languages: "python"
  versions: "0.6.7"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "python,dataclasses,json,serialization,marshmallow"
---

# dataclasses-json Python Package Guide

## Golden Rule

Use `dataclasses-json` on standard-library dataclasses. There is no client object, no auth flow, and no environment-variable setup. Import the decorator or mixin in the module that defines your dataclass and call `from_json`, `to_json`, `from_dict`, `to_dict`, or `schema()` on the dataclass itself.

## Install

```bash
python -m pip install "dataclasses-json==0.6.7"
```

PyPI metadata for `0.6.7` requires Python `>=3.7,<4.0`. The maintainer README lists the `0.6.x` line as supporting Python 3.7 through 3.12 and not officially supporting Python 3.13 or newer yet.

## Basic Usage

Decorator order matters: apply `@dataclass_json` above `@dataclass`.

```python
from dataclasses import dataclass

from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class User:
    id: int
    email: str
    is_active: bool = True


payload = '{"id": 1, "email": "ada@example.com"}'

user = User.from_json(payload)
print(user)
print(user.to_dict())
print(user.to_json())
```

Use `from_dict` and `to_dict` when your app already has parsed Python objects:

```python
user = User.from_dict({"id": 2, "email": "grace@example.com"})
body = user.to_dict()
```

## Use The Mixin When You Prefer Inheritance

The library also exposes `DataClassJsonMixin`. This keeps the same API and can work better with static analysis tools.

```python
from dataclasses import dataclass

from dataclasses_json import DataClassJsonMixin


@dataclass
class Product(DataClassJsonMixin):
    sku: str
    price_cents: int


product = Product.from_json('{"sku": "book-1", "price_cents": 2599}')
print(product.to_json())
```

## Validate Input With `schema()`

`from_json` and `from_dict` construct the dataclass directly. If you need marshmallow validation, use `schema().loads()` or `schema().load()`.

```python
from dataclasses import dataclass

from dataclasses_json import dataclass_json
from marshmallow import ValidationError


@dataclass_json
@dataclass
class Person:
    name: str


person = Person.from_json('{"name": 42}')
print(person)  # Person(name=42)

try:
    Person.schema().loads('{"name": 42}')
except ValidationError as exc:
    print(exc.messages)
```

You can also use the generated schema for lists:

```python
people = Person.schema().loads('[{"name": "Ada"}, {"name": "Grace"}]', many=True)
```

## Map JSON Names To Python Fields

Use `LetterCase` for consistent naming transforms, and `config(field_name=...)` when one field needs an explicit external name.

```python
from dataclasses import dataclass, field

from dataclasses_json import LetterCase, config, dataclass_json


@dataclass_json(letter_case=LetterCase.CAMEL)
@dataclass
class Account:
    given_name: str
    family_name: str
    external_id: str = field(metadata=config(field_name="externalId"))


account = Account.from_dict(
    {
        "givenName": "Ada",
        "familyName": "Lovelace",
        "externalId": "acct_123",
    }
)

print(account.to_dict())
```

The maintainer docs warn that the automatic casing helpers assume your Python fields are `snake_case`. Results are undefined for dataclass fields that are not snake_case to begin with.

## Missing Values And Optional Fields

Prefer normal dataclass defaults for fields that may be omitted.

```python
from dataclasses import dataclass, field
from typing import List, Optional

from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class Job:
    id: int
    status: str = "queued"
    tags: List[str] = field(default_factory=list)
    owner: Optional[str] = None


job = Job.from_json('{"id": 7}')
print(job)
```

If you need missing optional fields without defining a default, the library supports `infer_missing=True`:

```python
from dataclasses import dataclass
from typing import Optional

from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class Enrollment:
    id: int
    cohort: Optional[str]


enrollment = Enrollment.from_json('{"id": 10}', infer_missing=True)
print(enrollment)
```

The maintainer README recommends using dataclass defaults instead of relying on `infer_missing=True` for most code.

## Unknown Fields

Unknown input fields behave differently depending on which API you call:

- `from_dict` ignores unknown keys by default.
- `schema().load()` raises a marshmallow `ValidationError` by default.

If you need to preserve unknown fields from an upstream API, opt into `Undefined.INCLUDE` and add exactly one `CatchAll` field:

```python
from dataclasses import dataclass
from typing import Any, Dict

from dataclasses_json import CatchAll, Undefined, dataclass_json


@dataclass_json(undefined=Undefined.INCLUDE)
@dataclass
class Event:
    type: str
    payload: Dict[str, Any]
    extras: CatchAll


event = Event.from_dict(
    {
        "type": "invoice.paid",
        "payload": {"id": "in_123"},
        "trace_id": "abc-123",
        "request_id": "req_456",
    }
)

print(event.extras["trace_id"])
```

Use `Undefined.EXCLUDE` to drop unknown fields explicitly, or `Undefined.RAISE` to reject them early.

## Custom Encoding For `datetime`

By default, the library encodes `datetime` values as POSIX timestamps and decodes them into timezone-aware datetimes using the local timezone. If you need ISO 8601 strings instead, configure the field explicitly.

```python
from dataclasses import dataclass, field
from datetime import datetime

from dataclasses_json import config, dataclass_json
from marshmallow import fields


@dataclass_json
@dataclass
class AuditRecord:
    created_at: datetime = field(
        metadata=config(
            encoder=datetime.isoformat,
            decoder=datetime.fromisoformat,
            mm_field=fields.DateTime(format="iso"),
        )
    )


record = AuditRecord.from_json('{"created_at": "2026-03-13T15:30:00+00:00"}')
print(record.to_json())
```

## Important Pitfalls

- Put `@dataclass_json` above `@dataclass`. Reversing the order breaks the generated methods.
- There is no package-level initialization step. Import the decorator or mixin where you declare the dataclass.
- Use `schema()` when you need validation. `from_json` and `from_dict` do not give you marshmallow validation behavior.
- Store `MyDataclass.schema()` if you reuse it in a hot path. The maintainer docs say schema generation is not cached.
- The README says recursive dataclasses are supported, but not when you use `from __future__ import annotations`. Avoid that import in modules that rely on recursive `dataclasses-json` models.
- Default `datetime` handling uses timestamps and may change naive values when they round-trip through local timezone conversion. Override the field config if your API expects ISO strings or strict timezone handling.

## Version Notes For 0.6.7

- `dataclasses-json` is still a pre-1.0 package, and the maintainer docs say minor releases may include breaking changes.
- The `0.6.x` compatibility table in the maintainer README is the safest guide for interpreter support when your project is pinned to `0.6.7`.

## Official Sources

- GitHub repository and README: https://github.com/lidatong/dataclasses-json
- PyPI package page: https://pypi.org/project/dataclasses-json/
