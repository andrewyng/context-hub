---
name: package
description: "cbor2 package guide for Python projects encoding and decoding CBOR data"
metadata:
  languages: "python"
  versions: "5.8.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "cbor2,cbor,python,serialization,binary"
---

# cbor2 Python Package Guide

## Golden Rule

Use the official `cbor2` package when you need CBOR encoding and decoding in Python. `cbor2` is a local serialization library, not a service client, so there is no authentication step, no runtime environment configuration, and no client object to initialize.

## Install

Pin the package version your project expects:

```bash
python -m pip install "cbor2==5.8.0"
```

`cbor2` is usable without compiled extensions, but the docs note that it can build an optional C extension for better performance when a compiler toolchain is available.

If you want installation to fail instead of silently falling back to the pure Python implementation, set `CBOR2_BUILD_C_EXTENSION=1` before installing:

```bash
CBOR2_BUILD_C_EXTENSION=1 python -m pip install "cbor2==5.8.0"
```

## Runtime Setup

There are no runtime environment variables for normal use.

```python
import cbor2
```

For most applications, call the top-level helpers directly:

- `cbor2.dumps(obj)` and `cbor2.dump(obj, fp)` to encode
- `cbor2.loads(data)` and `cbor2.load(fp)` to decode

## Encode And Decode In Memory

```python
import cbor2

payload = {
    "message": "hello",
    "count": 3,
    "ok": True,
    "tags": ["alpha", "beta"],
}

encoded = cbor2.dumps(payload)
decoded = cbor2.loads(encoded)

print(type(encoded))   # <class 'bytes'>
print(decoded["message"])
```

Use `dumps()` when you already have the whole object in memory and need the encoded `bytes`.

## Encode And Decode Files

Open files in binary mode:

```python
import cbor2

payload = {"job": "sync", "attempt": 1}

with open("payload.cbor", "wb") as fp:
    cbor2.dump(payload, fp)

with open("payload.cbor", "rb") as fp:
    decoded = cbor2.load(fp)

print(decoded)
```

`dump()` and `load()` work with any binary file-like object, including `io.BytesIO`.

## Canonical Encoding

If another system expects deterministic CBOR output, enable canonical encoding:

```python
import cbor2

payload = {"b": 2, "a": 1}
encoded = cbor2.dumps(payload, canonical=True)
```

The API reference documents `canonical=True` for preferred, deterministic CBOR encoding.

## Datetime And Date Handling

`cbor2` can encode `datetime` values either as RFC 3339 text or as numeric timestamps.

```python
from datetime import datetime, timezone
import cbor2

event_time = datetime(2026, 3, 13, 12, 0, tzinfo=timezone.utc)

as_text = cbor2.dumps(event_time)
as_timestamp = cbor2.dumps(event_time, datetime_as_timestamp=True)

print(cbor2.loads(as_text))
print(cbor2.loads(as_timestamp))
```

For naive `datetime` values, pass a fallback timezone or make the value timezone-aware first:

```python
from datetime import datetime, timezone
import cbor2

naive = datetime(2026, 3, 13, 12, 0)
encoded = cbor2.dumps(naive, timezone=timezone.utc)
```

For `date` objects, the docs warn that the default representation uses an earlier RFC draft and may not be understood by other CBOR tools. If interoperability matters more than preserving the exact Python type, use `date_as_datetime=True`.

```python
from datetime import date
import cbor2

encoded = cbor2.dumps(date(2026, 3, 13), date_as_datetime=True)
decoded = cbor2.loads(encoded)
print(decoded)
```

## Custom Type Encoding With `default`

Use the `default` callback when `cbor2` does not know how to serialize one of your objects.

```python
from dataclasses import dataclass
import cbor2

@dataclass
class Point:
    x: int
    y: int

def default_encoder(encoder, value):
    if isinstance(value, Point):
        encoder.encode({"__type__": "point", "x": value.x, "y": value.y})
        return
    raise TypeError(f"cannot encode {type(value)!r}")

payload = {"origin": Point(0, 0)}
encoded = cbor2.dumps(payload, default=default_encoder)
print(encoded)
```

The encoder callback receives the active encoder instance, so you can emit plain CBOR structures or semantic tags.

## Custom Decoding With `object_hook` And `tag_hook`

Use `object_hook` to post-process decoded maps and `tag_hook` to handle semantic tags.

```python
from dataclasses import dataclass
import cbor2

@dataclass
class Point:
    x: int
    y: int

def object_hook(decoder, value):
    if value.get("__type__") == "point":
        return Point(x=value["x"], y=value["y"])
    return value

encoded = cbor2.dumps({"origin": {"__type__": "point", "x": 2, "y": 4}})
decoded = cbor2.loads(encoded, object_hook=object_hook)

print(decoded["origin"])
```

```python
from dataclasses import dataclass
import cbor2
from cbor2 import CBORTag

@dataclass
class Point:
    x: int
    y: int

def default_encoder(encoder, value):
    if isinstance(value, Point):
        encoder.encode(CBORTag(3000, [value.x, value.y]))
        return
    raise TypeError(f"cannot encode {type(value)!r}")

def tag_hook(decoder, tag):
    if tag.tag == 3000:
        return Point(*tag.value)
    return tag

encoded = cbor2.dumps(Point(5, 8), default=default_encoder)
decoded = cbor2.loads(encoded, tag_hook=tag_hook)

print(decoded)
```

## Command-Line Inspection

`cbor2` ships a small CLI similar to `json.tool` that converts CBOR input to JSON for inspection:

```bash
python -m cbor2.tool payload.cbor
```

Use it to inspect captured payloads or fixture files before writing decode logic.

## Common Pitfalls

- Open files in binary mode. `cbor2.load()` and `cbor2.dump()` expect byte streams, not text files.
- There is no client object or connection step. Import the module and call the encode/decode helpers directly.
- Naive `datetime` values need a `timezone=` fallback or explicit `tzinfo`; otherwise encoding can fail.
- `date` values are not universally portable in CBOR. Use `date_as_datetime=True` when another implementation needs to read them reliably.
- Use `default`, `object_hook`, and `tag_hook` for custom types instead of manually pre-serializing everything to JSON-compatible structures.

## Version Notes For 5.8.0

- The official version history for `5.8.0` notes new support for CPython 3.8.
- `5.8.0` also adds `decode_sortable_key()`, tag 256 stringref namespace support, and support for mutable shared references in `shareable_encoder()`.
- The live `latest` API reference includes newer kwargs such as `max_depth` on `load()` and `loads()`, but the version history lists `max_depth` under unreleased changes. If your project is pinned to `5.8.0`, do not assume `max_depth` is available.

## Official Sources

- Maintainer docs root: https://cbor2.readthedocs.io/en/latest/
- Usage guide: https://cbor2.readthedocs.io/en/latest/usage.html
- API reference: https://cbor2.readthedocs.io/en/latest/api.html
- Customizing encoding and decoding: https://cbor2.readthedocs.io/en/latest/customizing.html
- Version history: https://cbor2.readthedocs.io/en/latest/versionhistory.html
- PyPI package: https://pypi.org/project/cbor2/
