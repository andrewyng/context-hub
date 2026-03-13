---
name: package
description: "pymemcache package guide for Python projects using Memcached clients, pooling, sharding, and explicit value serialization"
metadata:
  languages: "python"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "pymemcache,memcached,python,cache,client,pooling,sharding"
---

# pymemcache Python Package Guide

## Golden Rule

Use `pymemcache` as a thin client for a running Memcached server, not as a data model layer. Reuse client objects instead of reconnecting for every cache call, and decide up front how your application will encode and decode values. If you do not configure a serializer and deserializer, reads come back as raw `bytes`.

## Install And Prerequisites

Install the package version this guide targets:

```bash
python -m pip install "pymemcache==4.0.0"
```

Your application also needs a reachable Memcached server. A conventional local setup uses `127.0.0.1:11211`.

Example environment variables:

```bash
export MEMCACHED_HOST=127.0.0.1
export MEMCACHED_PORT=11211
```

`pymemcache` does not use an API key or token-based auth flow. You connect directly to a Memcached host and port, so production security usually comes from private networking, firewalls, and any connection controls provided by your platform.

## Create A Client

Use `pymemcache.client.base.Client` for a single Memcached server:

```python
import os

from pymemcache.client.base import Client

host = os.getenv("MEMCACHED_HOST", "127.0.0.1")
port = int(os.getenv("MEMCACHED_PORT", "11211"))

client = Client((host, port))

try:
    client.set("healthcheck", b"ok", expire=10)
    value = client.get("healthcheck")
    print(value)
finally:
    client.close()
```

Without a deserializer, `value` is `bytes`.

## Serialize Strings And Python Objects

Memcached stores bytes. If your app wants strings, JSON, or other Python objects back from the cache, configure serialization when you create the client.

```python
import json

from pymemcache.client.base import Client


def json_serializer(key, value):
    if isinstance(value, bytes):
        return value, 0
    if isinstance(value, str):
        return value.encode("utf-8"), 1
    return json.dumps(value).encode("utf-8"), 2


def json_deserializer(key, value, flags):
    if flags == 1:
        return value.decode("utf-8")
    if flags == 2:
        return json.loads(value.decode("utf-8"))
    return value


client = Client(
    ("127.0.0.1", 11211),
    serializer=json_serializer,
    deserializer=json_deserializer,
)

try:
    client.set(
        "user:42",
        {"name": "Ada", "active": True, "roles": ["admin"]},
        expire=300,
    )
    user = client.get("user:42")
    print(user["name"])
finally:
    client.close()
```

If you use helpers from `pymemcache.serde`, treat pickle-based serialization as trusted-data-only behavior.

## Common Workflows

### Basic Cache Operations

```python
from pymemcache.client.base import Client

client = Client(("127.0.0.1", 11211))

try:
    client.set("session:123", b"active", expire=300)
    status = client.get("session:123")

    client.touch("session:123", 600)
    client.delete("session:123")
finally:
    client.close()
```

### Batch Reads And Writes

```python
from pymemcache.client.base import Client

client = Client(("127.0.0.1", 11211))

try:
    client.set_many(
        {
            "feature:alpha": b"on",
            "feature:beta": b"off",
        },
        expire=60,
    )

    values = client.get_many(["feature:alpha", "feature:beta"])
    print(values)

    client.delete_many(["feature:alpha", "feature:beta"])
finally:
    client.close()
```

### Counters

Use increment and decrement only for keys whose stored value is a decimal integer.

```python
from pymemcache.client.base import Client

client = Client(("127.0.0.1", 11211))

try:
    client.set("jobs:queued", b"0")
    client.incr("jobs:queued", 1)
    client.decr("jobs:queued", 1)
finally:
    client.close()
```

### Shard Across Multiple Memcached Servers

Use `HashClient` when your cache layer is spread across multiple Memcached nodes.

```python
from pymemcache.client.hash import HashClient

client = HashClient(
    [
        ("10.0.0.11", 11211),
        ("10.0.0.12", 11211),
    ]
)

try:
    client.set("user:42", b"cached")
    value = client.get("user:42")
    print(value)
finally:
    client.close()
```

### Reuse Pooled Connections

If your app makes many requests to one Memcached server, use `PooledClient` instead of opening a fresh connection for each operation.

```python
from pymemcache.client.base import PooledClient

client = PooledClient(("127.0.0.1", 11211), max_pool_size=4)

try:
    client.set("task:1", b"done", expire=60)
    print(client.get("task:1"))
finally:
    client.close()
```

## Important Pitfalls

- `get()` returns `bytes` unless you configure a deserializer.
- Keep cache keys simple and protocol-safe; invalid keys are rejected by Memcached.
- `incr()` and `decr()` do not work for arbitrary serialized objects.
- Memcached is an in-memory cache. Keys can disappear because of eviction, expiration, or server restart.
- Reuse client objects and call `close()` on shutdown so sockets are released cleanly.
- Keep untrusted data out of pickle-based serializers.

## Version Notes

- This guide targets `pymemcache 4.0.0`.
- If you pin a different major version, re-check constructor options and helper modules before copying code unchanged.

## Official Sources

- Maintainer docs: https://pymemcache.readthedocs.io/en/latest/
- PyPI project page: https://pypi.org/project/pymemcache/
