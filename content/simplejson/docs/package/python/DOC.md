---
name: package
description: "simplejson Python package guide for JSON serialization and parsing with stdlib-style APIs and Decimal-friendly workflows"
metadata:
  languages: "python"
  versions: "3.20.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "simplejson,json,serialization,deserialization,python,decimal"
---

# simplejson Python Package Guide

## Golden Rule

Use `simplejson` when a Python project already depends on it or when you want a JSON library with the familiar `json` module API plus explicit helpers for workflows like `Decimal` serialization. It is a local encoding and decoding library, not a network client, so there is no authentication, service endpoint, or client object to configure.

## Install

Pin the package version your project expects:

```bash
python -m pip install "simplejson==3.20.2"
```

Common alternatives:

```bash
uv add "simplejson==3.20.2"
poetry add "simplejson==3.20.2"
```

Quick verification:

```bash
python - <<'PY'
from importlib.metadata import version
import simplejson

print(version("simplejson"))
print(simplejson.__version__)
PY
```

## Environment And Initialization

`simplejson` does not use environment variables.

There is no client initialization step. Import the module and call `dump()`, `dumps()`, `load()`, or `loads()` directly.

If you want code that reads like the standard library `json` module, alias it during import:

```python
import simplejson as json
```

## Core Usage

### Serialize a Python object to a JSON string

```python
import simplejson as json

payload = {
    "name": "Ada",
    "active": True,
    "scores": [3, 7, 11],
}

body = json.dumps(payload)
print(body)
```

### Parse a JSON string

```python
import simplejson as json

raw = '{"name": "Ada", "active": true, "scores": [3, 7, 11]}'
data = json.loads(raw)

print(data["name"])
print(data["scores"][0])
```

### Read and write JSON files

```python
from pathlib import Path
import simplejson as json

payload = {
    "ok": True,
    "items": [1, 2, 3],
}

path = Path("data.json")

with path.open("w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2, ensure_ascii=False)

with path.open("r", encoding="utf-8") as f:
    loaded = json.load(f)

print(loaded)
```

Use text mode with an explicit UTF-8 encoding unless you have a reason to manage bytes separately.

## Preserve Decimal Values

One of the most common reasons to choose `simplejson` is explicit `Decimal` support.

```python
from decimal import Decimal
import simplejson as json

payload = {
    "subtotal": Decimal("19.99"),
    "tax": Decimal("1.50"),
}

body = json.dumps(payload, use_decimal=True)
parsed = json.loads(body, use_decimal=True)

print(body)
print(parsed["subtotal"], type(parsed["subtotal"]))
```

When precision matters for money or rates, prefer `Decimal` values in application code instead of converting through binary floating point.

## Serialize Custom Python Objects

Use `default=` to convert unsupported objects into standard JSON-compatible data structures.

```python
from dataclasses import asdict, dataclass
import simplejson as json

@dataclass
class User:
    id: int
    email: str

def to_jsonable(obj):
    if isinstance(obj, User):
        return asdict(obj)
    raise TypeError(f"Unsupported type: {type(obj)!r}")

body = json.dumps(User(id=1, email="ada@example.com"), default=to_jsonable)
print(body)
```

If your application already has dataclasses, Pydantic models, or ORM objects, keep the conversion logic close to the serialization call so it is obvious which JSON shape is produced.

## Control Output Format

The most useful output options for application code are the same ones most Python developers already know from the standard library:

- `indent` for pretty-printing
- `sort_keys=True` for stable key order
- `ensure_ascii=False` for readable UTF-8 output
- `separators=(",", ":")` for compact JSON when payload size matters

```python
import simplejson as json

payload = {
    "title": "café",
    "url": "https://example.com/docs",
}

body = json.dumps(
    payload,
    ensure_ascii=False,
    indent=2,
    sort_keys=True,
)

print(body)
```

## Decode Hooks

If you need to shape decoded objects during parsing, use the same hook pattern you would use with the standard library.

```python
import simplejson as json

def as_user(obj):
    if {"id", "email"} <= obj.keys():
        return {"kind": "user", **obj}
    return obj

raw = '{"id": 1, "email": "ada@example.com"}'
parsed = json.loads(raw, object_hook=as_user)

print(parsed)
```

Use `object_hook` only when every object at that parse boundary should be examined. For one-off transformations, parse to normal dictionaries first and then map them in plain Python.

## Error Handling

Handle malformed JSON close to the parse boundary:

```python
import simplejson as json

try:
    json.loads('{"broken": }')
except json.JSONDecodeError as exc:
    print(f"Invalid JSON: {exc}")
```

If your code accepts untrusted JSON from files, queues, or HTTP requests, catch decode errors before the data reaches the rest of your application.

## Common Pitfalls

- `simplejson` is local-only. Do not design configuration around API keys, hosts, or retry settings.
- Importing `simplejson as json` is often the cleanest migration path, but do not assume every project-wide `json` call can be swapped blindly without checking tests.
- `default=` only affects values the encoder does not already know how to serialize. It is not a general post-processing hook.
- Use `ensure_ascii=False` if you want readable UTF-8 output instead of escaped non-ASCII characters.
- When exact numeric precision matters, pass `use_decimal=True` and keep values as `Decimal` in your own code.

## Minimal Drop-In Pattern

For applications that already use the stdlib interface, this is the smallest practical integration pattern:

```python
import simplejson as json

def encode_payload(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=False)

def decode_payload(raw: str) -> dict:
    return json.loads(raw)
```

Use this style when you want the package change to stay narrow and obvious.
