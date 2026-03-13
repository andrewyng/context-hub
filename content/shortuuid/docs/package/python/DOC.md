---
name: package
description: "shortuuid package guide for generating, encoding, and decoding compact UUID-based identifiers in Python"
metadata:
  languages: "python"
  versions: "1.0.13"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "shortuuid,python,uuid,identifiers,tokens"
---

# shortuuid Python Package Guide

## Golden Rule

Use `shortuuid` when your application needs shorter UUID-based identifiers as strings. Generate new IDs with `shortuuid.uuid()`, round-trip existing `uuid.UUID` values with `shortuuid.encode()` and `shortuuid.decode()`, and keep any custom alphabet consistent anywhere you create or decode IDs.

## Install

Pin the package version your project expects:

```bash
python -m pip install "shortuuid==1.0.13"
```

Common alternatives:

```bash
uv add "shortuuid==1.0.13"
poetry add "shortuuid==1.0.13"
```

Notes:

- The PyPI package is `shortuuid`, and the main import is also `shortuuid`.
- `shortuuid` is a pure Python utility package. It has no service client, no auth flow, and no required environment variables.
- If your app wants a custom alphabet, treat that as app configuration and initialize one `ShortUUID` instance with it.

## Initialize

The package works without setup, but creating one configured `ShortUUID` instance is the cleanest pattern when your app needs a custom alphabet for all generated IDs.

```python
import os

import shortuuid

alphabet = os.getenv("SHORTUUID_ALPHABET")
ids = shortuuid.ShortUUID(alphabet=alphabet) if alphabet else shortuuid.ShortUUID()

new_id = ids.uuid()
invite_code = ids.random(length=10)

print(new_id)
print(invite_code)
```

Use the default instance when you do not need custom behavior:

```python
import shortuuid

order_id = shortuuid.uuid()
print(order_id)
```

## Core Workflows

### Generate a new short UUID

`shortuuid.uuid()` returns a compact string identifier derived from a UUID.

```python
import shortuuid

user_id = shortuuid.uuid()
session_id = shortuuid.uuid()

print(user_id)
print(session_id)
```

Use this when your application wants a shorter string ID but still wants UUID-style uniqueness.

### Encode and decode standard UUID values

Use `encode()` when you already have a `uuid.UUID` value and want the short form. Use `decode()` when another part of your system needs the standard UUID object again.

```python
import uuid

import shortuuid

canonical = uuid.uuid4()
short_value = shortuuid.encode(canonical)
decoded = shortuuid.decode(short_value)

print(canonical)
print(short_value)
print(decoded)
assert decoded == canonical
```

This is the safest pattern when one system stores compact IDs but another expects standard UUID objects.

### Generate a deterministic value from a name

Pass `name=` when you need the same input name to produce the same short UUID string.

```python
import shortuuid

customer_key = shortuuid.uuid(name="customer:42")
same_customer_key = shortuuid.uuid(name="customer:42")

assert customer_key == same_customer_key
```

Use this for stable derived identifiers, not for secrets or one-time tokens.

### Generate fixed-length random tokens

Use `ShortUUID().random(length=...)` when you need a short random string and do not need UUID decode/encode round-tripping.

```python
import shortuuid

ids = shortuuid.ShortUUID()

invite_code = ids.random(length=8)
reset_code = ids.random(length=12)

print(invite_code)
print(reset_code)
```

This is a better fit for user-facing codes than manually truncating a UUID string.

### Use a custom alphabet

If you want IDs with a restricted character set, configure a dedicated instance and use that same alphabet everywhere you generate or decode values.

```python
import uuid

import shortuuid

ids = shortuuid.ShortUUID(alphabet="23456789ABCDEFGHJKLMNPQRSTUVWXYZ")

ticket_id = ids.uuid()
encoded = ids.encode(uuid.uuid4())
decoded = ids.decode(encoded)

print(ticket_id)
print(encoded)
print(decoded)
```

Keep custom alphabets stable across services, workers, and scripts that share these IDs.

## Important Pitfalls

- `shortuuid.uuid()` returns a string, not a `uuid.UUID` object.
- `ShortUUID().random(length=...)` gives you a random string, not an encoded UUID value you can round-trip with `decode()`.
- If you customize the alphabet, use the same alphabet for both encoding and decoding.
- Prefer a dedicated `ShortUUID(alphabet=...)` instance over changing global behavior in reusable library code.
- Use standard `uuid.UUID` values when an external API or database field requires canonical UUID formatting.

## Official Sources

- Maintainer repository: `https://github.com/skorokithakis/shortuuid`
- PyPI package page: `https://pypi.org/project/shortuuid/`
