---
name: package
description: "cattrs package guide for structuring and unstructuring Python dataclasses and attrs classes"
metadata:
  languages: "python"
  versions: "26.1.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "cattrs,python,serialization,dataclasses,attrs"
---

# cattrs Python Package Guide

## What It Is

`cattrs` converts between typed Python objects and plain unstructured data.

The two core operations are:

- `converter.structure(data, TargetType)` to turn inbound `dict` / `list` / scalar data into dataclasses, `attrs` classes, and typed collections
- `converter.unstructure(obj)` to turn typed objects back into plain Python data you can pass to `json.dumps()`, an HTTP client, or a queue

Prefer creating an explicit `Converter()` instance in application code so your hooks and format rules live in one place.

## Installation

Pin the package version your project expects:

```bash
python -m pip install "cattrs==26.1.0"
```

With Poetry:

```bash
poetry add "cattrs==26.1.0"
```

With uv:

```bash
uv add "cattrs==26.1.0"
```

`cattrs` has no service credentials or runtime environment variables.

## Initialize A Converter

```python
from cattrs import Converter

converter = Converter()
```

Keep the configured converter near your application boundary code instead of constructing new converters in every request handler or utility function.

## Core Workflows

### Structure inbound data into typed objects

```python
from dataclasses import dataclass

from cattrs import Converter


@dataclass
class Address:
    city: str
    postal_code: str


@dataclass
class User:
    id: int
    email: str
    address: Address
    tags: list[str]


payload = {
    "id": 42,
    "email": "ada@example.com",
    "address": {"city": "London", "postal_code": "SW1A 1AA"},
    "tags": ["admin", "beta"],
}

converter = Converter()
user = converter.structure(payload, User)

print(user.address.city)
```

### Unstructure typed objects before JSON serialization

```python
import json

body = json.dumps(converter.unstructure(user))
```

### Structure typed collections, not just single objects

```python
raw_users = [payload, payload]
users = converter.structure(raw_users, list[User])

raw_index = {"primary": payload}
user_index = converter.structure(raw_index, dict[str, User])
```

### Use the same API with `attrs` classes

```python
from attrs import define

from cattrs import Converter


@define
class Settings:
    region: str
    retries: int = 3


converter = Converter()
settings = converter.structure({"region": "us-east-1"}, Settings)
```

## Custom Hooks For Non-Primitive Types

Register hooks when external data does not already match the Python type you want in memory.

```python
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

from cattrs import Converter


@dataclass
class Invoice:
    id: str
    created_at: datetime
    total: Decimal


converter = Converter()

converter.register_structure_hook(
    datetime,
    lambda value, _: datetime.fromisoformat(value),
)
converter.register_unstructure_hook(
    datetime,
    lambda value: value.isoformat(),
)

converter.register_structure_hook(
    Decimal,
    lambda value, _: Decimal(value),
)
converter.register_unstructure_hook(
    Decimal,
    lambda value: str(value),
)

invoice = converter.structure(
    {
        "id": "inv_123",
        "created_at": "2026-03-12T09:30:00+00:00",
        "total": "19.99",
    },
    Invoice,
)

payload = converter.unstructure(invoice)
```

These hooks apply only to this `converter` instance. Reuse the configured instance anywhere the same wire format appears.

## JSON And HTTP Boundaries

`cattrs` does not parse JSON text or emit JSON bytes by itself. Pair it with `json`, `orjson`, or your framework's request/response layer.

```python
import json
from dataclasses import dataclass

from cattrs import Converter


@dataclass
class Event:
    type: str
    id: str


converter = Converter()

raw_body = '{"type": "user.created", "id": "evt_123"}'
event = converter.structure(json.loads(raw_body), Event)

response_body = json.dumps(converter.unstructure(event))
```

## Config And Auth

`cattrs` has no authentication, API keys, or package-specific environment variables.

The main project-level decisions are:

- where the shared converter instance is created
- which structure and unstructure hooks are registered
- whether one converter is enough for the whole app or whether different external payload formats need separate converters

## Common Pitfalls

- Use typed targets like `list[User]` and `dict[str, User]`; bare `list` and `dict` lose element type information.
- Register hooks for values like `datetime`, `Decimal`, enums, or domain-specific IDs when the inbound representation is a string or number.
- Hooks are attached to a converter instance, not globally. If you create a fresh `Converter()`, you also lose the hooks registered on the previous one.
- Keep conversion at the boundary of your app. Parse inbound HTTP or message payloads into typed objects early, then unstructure only when you need to cross back into JSON or another wire format.
- If two upstream systems encode the same type differently, use different configured converters instead of one converter with ambiguous rules.

## Version-Sensitive Notes

- This guide targets `cattrs 26.1.0`.
- If you are copying examples from older code, re-check advanced helper imports and customization snippets against the docs for the version installed in your project.

## Official Sources

- Documentation root: `https://catt.rs/en/stable/`
- Project history: `https://catt.rs/en/stable/history.html`
- PyPI package page: `https://pypi.org/project/cattrs/`
