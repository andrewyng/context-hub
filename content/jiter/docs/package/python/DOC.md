---
name: package
description: "jiter JSON parser for Python with partial parsing, duplicate-key detection, configurable float handling, and string-cache controls"
metadata:
  languages: "python"
  versions: "0.13.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "jiter,json,python,pydantic,parser"
---

# jiter Python Package Guide

## Golden Rule

Use `jiter` when you need fast JSON parsing in Python and you want features the standard `json` module does not provide directly, especially partial parsing, duplicate-key detection, and configurable float parsing.

If you are already using Pydantic for JSON parsing, the maintainer recommends relying on Pydantic's built-in JSON handling instead of calling `jiter` directly.

## Install

`jiter` 0.13.0 requires Python 3.9 or newer.

```bash
python -m pip install "jiter==0.13.0"
```

Common alternatives:

```bash
uv add "jiter==0.13.0"
poetry add "jiter==0.13.0"
```

## Initialization

There is no client object, authentication step, or required environment variable. Import the module and call `jiter.from_json(...)`.

```python
import jiter
```

## Parse JSON

`from_json` accepts JSON bytes and returns normal Python values such as `dict`, `list`, `str`, `int`, `float`, `bool`, and `None`.

```python
import jiter

payload = b'{"name":"Ada","active":true,"roles":["admin","editor"]}'
data = jiter.from_json(payload)

print(data["name"])
print(data["roles"])
```

If your JSON starts as a Python string, encode it first:

```python
import jiter

text = '{"count": 3, "ok": true}'
data = jiter.from_json(text.encode("utf-8"))
```

A practical file-loading pattern:

```python
import jiter
from pathlib import Path

raw = Path("data.json").read_bytes()
data = jiter.from_json(raw)
```

## Parse Incomplete JSON Streams

Use `partial_mode` when you want the parser to return the valid prefix of an incomplete JSON payload instead of raising an error immediately.

```python
import jiter

chunk = b'["alpha", "beta", "gam'
items = jiter.from_json(chunk, partial_mode=True)

print(items)
```

For object-shaped input, `jiter` returns the keys and values it could parse before the document became incomplete:

```python
import jiter

chunk = b'{"name":"Ada","team":"platf'
data = jiter.from_json(chunk, partial_mode="on")

print(data)
```

Use this only when truncated input is expected, such as progressive network reads or partially generated model output. For normal request bodies or files, keep partial parsing off so malformed JSON fails fast.

## Reject Duplicate Object Keys

By default, duplicate keys use the last value seen. Enable `catch_duplicate_keys` if you want `jiter` to raise instead.

```python
import jiter

payload = b'{"role":"user","role":"admin"}'

data = jiter.from_json(payload)
print(data["role"])  # "admin"
```

```python
import jiter

payload = b'{"role":"user","role":"admin"}'

try:
    jiter.from_json(payload, catch_duplicate_keys=True)
except ValueError as exc:
    print(exc)
```

Turn this on for configuration files, security-sensitive payloads, or any input where duplicate keys should be treated as invalid.

## Control How Numbers Are Returned

The default `float_mode` is `"float"`, which returns Python `float` values.

```python
import jiter

data = jiter.from_json(b'{"price": 12.5}')
print(type(data["price"]))
```

Use `float_mode="decimal"` when you need `Decimal` objects for money or exact decimal arithmetic.

```python
from decimal import Decimal
import jiter

data = jiter.from_json(b'{"price": 12.5}', float_mode="decimal")

assert isinstance(data["price"], Decimal)
```

Use `float_mode="lossless-float"` when you need access to the original float representation before converting it yourself.

```python
import jiter

data = jiter.from_json(b'{"value": 1.234567890123456789}', float_mode="lossless-float")
value = data["value"]

print(type(value))
print(str(value))
print(float(value))
print(value.as_decimal())
```

## Manage The String Cache

`jiter` can cache parsed strings. The default `cache_mode` is `"all"`.

Use `cache_mode="keys"` if you mainly want to reuse object keys, or `cache_mode="none"` if you do not want string caching for a given parse.

```python
import jiter

payload = b'{"user":"ada","role":"admin"}'

data = jiter.from_json(payload, cache_mode="keys")
print(data)
```

You can inspect and clear the process-wide cache:

```python
import jiter

print(jiter.cache_usage())
jiter.cache_clear()
print(jiter.cache_usage())
```

If you parse many unrelated documents with mostly unique strings, disabling caching for those calls can be simpler than carrying cache state for the whole process.

## Handle Non-Standard Numbers

`allow_inf_nan` defaults to `True`, which means non-standard JSON numbers such as `Infinity`, `-Infinity`, and `NaN` are accepted.

```python
import jiter

data = jiter.from_json(b'{"value": NaN}')
print(data)
```

Set `allow_inf_nan=False` if you need stricter JSON parsing:

```python
import jiter

try:
    jiter.from_json(b'{"value": NaN}', allow_inf_nan=False)
except ValueError as exc:
    print(exc)
```

## Common Pitfalls

- `jiter.from_json(...)` is documented around JSON bytes input. If you have a text string, encode it before parsing.
- `partial_mode` is for intentionally incomplete input. Leaving it on for normal API requests can hide truncation bugs.
- Duplicate keys do not raise by default; the last value wins unless you set `catch_duplicate_keys=True`.
- `allow_inf_nan=True` is more permissive than strict JSON parsers. Disable it if interoperability matters.
- If you only need standard JSON parsing and none of `jiter`'s extra controls, Python's built-in `json` module may be simpler.

## Official Sources

- GitHub repository: https://github.com/pydantic/jiter
- PyPI project page: https://pypi.org/project/jiter/
- API docs for `from_json`: https://docs.rs/jiter/latest/jiter/fn.from_json.html
- API docs for `LosslessFloat`: https://docs.rs/jiter/latest/jiter/struct.LosslessFloat.html
- API docs for `cache_usage`: https://docs.rs/jiter/latest/jiter/fn.cache_usage.html
