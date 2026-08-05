---
name: package
description: "redis-py package guide for Python projects using Redis sync, asyncio, TLS, Sentinel, and cluster clients"
metadata:
  languages: "python"
  versions: "8.0.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "redis,python,cache,key-value,pubsub,asyncio,cluster"
---

# redis Python Package Guide

## Golden Rule

Use the official `redis` package (`redis-py`) for both synchronous and asynchronous Redis access. As of May 29, 2026, PyPI lists `redis 8.0.0`, requires Python `>=3.10`, and points to `https://redis.readthedocs.io/en/stable/` as the official docs root. The older `redis-py.readthedocs.io` URL is stale.

## Install

Pin the package version your project expects:

```bash
python -m pip install "redis==8.0.0"
```

Useful extras:

```bash
python -m pip install "redis[hiredis]==8.0.0"
python -m pip install "redis[ocsp]==8.0.0"
python -m pip install "redis[otel]==8.0.0"
```

- `hiredis`: faster response parser
- `ocsp`: OCSP validation for TLS connections
- `otel`: OpenTelemetry instrumentation helpers

If your runtime is still on Python 3.9, `redis 8.0.0` will not install. PyPI metadata for `8.0.0` requires Python `>=3.10`; pin to the 7.x line if you need Python 3.9 support.

## Initialize A Client

### Sync client

Prefer a URL so local, TLS, ACL, and managed-service setups use the same entry point:

```python
import os
import redis

client = redis.from_url(
    os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    decode_responses=True,
    health_check_interval=30,
)

client.ping()
```

Supported URL schemes include:

- `redis://` for plain TCP
- `rediss://` for TLS
- `unix://` for Unix domain sockets

### Async client

Async support lives in the same package under `redis.asyncio`:

```python
import os
import asyncio
import redis.asyncio as redis

async def main() -> None:
    client = redis.from_url(
        os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
        decode_responses=True,
        health_check_interval=30,
    )
    try:
        await client.set("job:1", "queued", ex=60)
        print(await client.get("job:1"))
    finally:
        await client.aclose()

asyncio.run(main())
```

Close async clients explicitly with `await client.aclose()` so connection pools are released.

### RESP3

`redis-py` uses RESP2 unless you opt into RESP3:

```python
import redis

client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True,
    protocol=3,
)
```

Use RESP3 only when your server and the features you need expect it.

## Core Usage

### Basic key-value operations

```python
import redis

client = redis.from_url("redis://localhost:6379/0", decode_responses=True)

client.set("session:42", "active", ex=300)
status = client.get("session:42")
ttl = client.ttl("session:42")

client.hset("user:42", mapping={"name": "Ada", "role": "admin"})
user = client.hgetall("user:42")
```

### Pipelines and transactions

Use pipelines to batch commands. Use `transaction=True` when you need `MULTI/EXEC` semantics:

```python
import redis

client = redis.Redis(decode_responses=True)

with client.pipeline(transaction=True) as pipe:
    pipe.incr("counters:pageviews")
    pipe.expire("counters:pageviews", 3600)
    result = pipe.execute()

print(result)
```

For optimistic locking, use `WATCH`:

```python
import redis

client = redis.Redis(decode_responses=True)

with client.pipeline() as pipe:
    while True:
        try:
            pipe.watch("inventory:sku-1")
            current = int(pipe.get("inventory:sku-1") or 0)
            pipe.multi()
            pipe.set("inventory:sku-1", current - 1)
            pipe.execute()
            break
        except redis.WatchError:
            continue
```

### Pub/Sub

```python
import redis

client = redis.Redis(decode_responses=True)
pubsub = client.pubsub()
pubsub.subscribe("events")

for message in pubsub.listen():
    if message["type"] == "message":
        print(message["data"])
```

Do not share one `PubSub` object across unrelated threads or long-lived app components.

## Config And Auth

### ACL username and password

```python
import redis

client = redis.Redis(
    host="redis.example.com",
    port=6379,
    username="default",
    password="secret",
    decode_responses=True,
)
```

The equivalent URL form is:

```text
redis://default:secret@redis.example.com:6379/0
```

### Credential providers

Use a credential provider when credentials are fetched dynamically:

```python
import redis
from redis.credentials import UsernamePasswordCredentialProvider

provider = UsernamePasswordCredentialProvider(
    username="default",
    password="secret",
)

client = redis.Redis(
    host="redis.example.com",
    port=6379,
    credential_provider=provider,
    decode_responses=True,
)
```

### TLS

For managed Redis deployments, prefer a `rediss://` URL or explicit TLS settings:

```python
import redis
import ssl

client = redis.Redis(
    host="redis.example.com",
    port=6380,
    username="default",
    password="secret",
    ssl=True,
    ssl_cert_reqs=ssl.CERT_REQUIRED,
    ssl_ca_certs="/etc/ssl/certs/ca-certificates.crt",
    decode_responses=True,
)
```

Relevant connection settings in the upstream API reference include `socket_timeout`, `socket_connect_timeout`, `retry`, `retry_on_timeout`, `health_check_interval`, and TLS certificate options.

## Sentinel And Cluster

### Sentinel

```python
from redis.sentinel import Sentinel

sentinel = Sentinel(
    [("sentinel-1", 26379), ("sentinel-2", 26379)],
    socket_timeout=0.5,
    username="default",
    password="secret",
)

client = sentinel.master_for("mymaster", decode_responses=True)
client.ping()
```

### Cluster

Cluster support is built into `redis`; do not add `redis-py-cluster`:

```python
from redis.cluster import RedisCluster

client = RedisCluster(
    host="redis-cluster.example.com",
    port=6379,
    decode_responses=True,
)

client.set("user-profile:{42}", "ready")
print(client.get("user-profile:{42}"))
```

Use hash tags like `{42}` when multi-key operations must land in the same slot.

## Common Pitfalls

- Responses are `bytes` by default. Set `decode_responses=True` if your app expects strings.
- `redis.asyncio` is the supported async API. Do not add the deprecated standalone `aioredis` package.
- Cluster support is built in. Do not add the deprecated `redis-py-cluster` package.
- `SELECT` is not implemented on Redis client instances. Choose the database in the URL or connection parameters and create separate clients if you need different DB numbers.
- RESP3 is opt-in with `protocol=3`; do not assume RESP3-only behavior on a default client.
- Pub/Sub, pipelines, and pubsub listeners are stateful objects; keep their ownership explicit instead of sharing them broadly.
- In cluster mode, multi-key commands only work when keys hash to the same slot. Hash tags are the usual fix.
- Query, search, JSON, time series, and vector commands depend on server-side modules or Redis Stack features. Package install alone does not enable those commands.

## Version-Sensitive Notes

- `redis 8.0.0` is the current PyPI release as of May 29, 2026.
- The official docs root is `https://redis.readthedocs.io/en/stable/`; the older `redis-py.readthedocs.io` URL is stale.
- PyPI metadata for `8.0.0` requires Python `>=3.10`. That is the first constraint to check before suggesting an upgrade.
- The 7.x line (most recently `7.3.0`) is the last branch supporting Python 3.9; older releases such as `7.0.1` are also documented as 3.9-compatible if you must stay on the 7.0 line.
- `redis-py` continues to unify sync, asyncio, Sentinel, and Cluster support in one package, so older package splits from blog posts are usually wrong.
- If you use RediSearch helpers (`ft()` APIs), check the current query dialect behavior in the upstream docs instead of relying on older examples.

## Official Sources

- Docs root: `https://redis.readthedocs.io/en/stable/`
- Examples: `https://redis.readthedocs.io/en/stable/examples.html`
- Async examples: `https://redis.readthedocs.io/en/stable/examples/asyncio_examples.html`
- Connections API: `https://redis.readthedocs.io/en/stable/connections.html`
- Advanced features: `https://redis.readthedocs.io/en/stable/advanced_features.html`
- Cluster guide: `https://redis.readthedocs.io/en/stable/clustering.html`
- PyPI registry: `https://pypi.org/project/redis/`
