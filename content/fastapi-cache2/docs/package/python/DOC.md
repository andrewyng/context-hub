---
name: package
description: "FastAPI response and function caching with Redis, Memcached, DynamoDB, and in-memory backends"
metadata:
  languages: "python"
  versions: "0.2.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "fastapi,python,cache,redis,memcached,dynamodb,asgi"
---

# fastapi-cache2 Python Package Guide

## What It Is

`fastapi-cache2` adds decorator-based caching for FastAPI route handlers and regular Python functions. The package name on PyPI is `fastapi-cache2`, but the import package is `fastapi_cache`.

The maintainer docs for `0.2.2` document these backends:

- `RedisBackend`
- `MemcacheBackend`
- `DynamoBackend`
- `InMemoryBackend`

For most FastAPI apps, start with Redis.

## Install

`0.2.2` publishes extras for backend-specific dependencies and declares Python `^3.8` in package metadata.

### Base install

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "fastapi-cache2==0.2.2"
```

### Redis backend

```bash
python -m pip install "fastapi-cache2[redis]==0.2.2"
```

### Memcached backend

```bash
python -m pip install "fastapi-cache2[memcache]==0.2.2"
```

### DynamoDB backend

```bash
python -m pip install "fastapi-cache2[dynamodb]==0.2.2"
```

### Install everything

```bash
python -m pip install "fastapi-cache2[all]==0.2.2"
```

## Initialize The Cache Once At Startup

Call `FastAPICache.init(...)` during FastAPI startup or lifespan setup before any decorated endpoint is used.

Typical environment variables:

```bash
export REDIS_URL="redis://localhost:6379/0"
export FASTAPI_CACHE_PREFIX="fastapi-cache"
```

Redis-backed setup:

```python
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from redis import asyncio as redis

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_PREFIX = os.getenv("FASTAPI_CACHE_PREFIX", "fastapi-cache")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    redis_client = redis.from_url(REDIS_URL, decode_responses=False)
    FastAPICache.init(
        RedisBackend(redis_client),
        prefix=CACHE_PREFIX,
        expire=60,
    )
    yield


app = FastAPI(lifespan=lifespan)
```

Important Redis detail:

- Keep `decode_responses=False` on the Redis client. The cache stores raw `bytes`, and response decoding breaks cache reads.

For local development or tests, you can initialize an in-memory backend instead:

```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
```

## Cache A FastAPI Route

Place `@cache(...)` between the FastAPI router decorator and the function. The common arguments are:

- `expire`: TTL in seconds
- `namespace`: logical grouping for related keys
- `coder`: serializer/deserializer class
- `key_builder`: custom cache-key function

```python
from fastapi import FastAPI
from pydantic import BaseModel

from fastapi_cache.decorator import cache

app = FastAPI()


class UserOut(BaseModel):
    id: int
    email: str


@app.get("/users/{user_id}")
@cache(expire=300, namespace="users")
async def get_user(user_id: int) -> UserOut:
    return UserOut(id=user_id, email=f"user-{user_id}@example.com")
```

What the decorator does for HTTP endpoints:

- Adds `Cache-Control`
- Adds `ETag`
- Adds `X-FastAPI-Cache` with `HIT` or `MISS`
- Returns `304 Not Modified` when the request sends a matching `If-None-Match`

## Return Types Matter

With the default `JsonCoder`, cached values round-trip correctly for JSON-compatible types, Pydantic models, and dataclasses only when the function itself has the right return annotation.

Use this:

```python
@app.get("/profile")
@cache(expire=60)
async def profile() -> UserOut:
    return UserOut(id=1, email="a@example.com")
```

Do not rely on only `response_model=...` in the route decorator. The cache decodes using the function return type, not the FastAPI route metadata.

## Cache Regular Functions Too

The same decorator can wrap non-route functions. This is useful for expensive service-layer work shared by multiple endpoints.

```python
from fastapi_cache.decorator import cache


@cache(expire=30, namespace="reports")
def build_report(user_id: int) -> dict[str, int]:
    return {"user_id": user_id, "score": 42}
```

The implementation runs sync functions in FastAPI's threadpool so the decorator can be awaited consistently.

## Custom Serialization

If your return value needs different JSON encoding behavior, define a custom coder by subclassing `fastapi_cache.Coder`.

```python
from typing import Any

import orjson
from fastapi.encoders import jsonable_encoder

from fastapi_cache import Coder
from fastapi_cache.decorator import cache


class ORJsonCoder(Coder):
    @classmethod
    def encode(cls, value: Any) -> bytes:
        return orjson.dumps(
            value,
            default=jsonable_encoder,
            option=orjson.OPT_NON_STR_KEYS | orjson.OPT_SERIALIZE_NUMPY,
        )

    @classmethod
    def decode(cls, value: bytes) -> Any:
        return orjson.loads(value)


@app.get("/stats")
@cache(expire=60, coder=ORJsonCoder)
async def stats() -> dict[str, int]:
    return {"hits": 10}
```

## Custom Cache Keys

The built-in key builder hashes the function module, function name, positional args, and keyword args. If you want URL-shaped keys instead, provide a custom `key_builder`.

```python
from typing import Any

from fastapi import Request, Response

from fastapi_cache.decorator import cache


def request_key_builder(
    func: Any,
    namespace: str = "",
    *,
    request: Request | None = None,
    response: Response | None = None,
    args: tuple[Any, ...],
    kwargs: dict[str, Any],
) -> str:
    assert request is not None
    return ":".join(
        [
            namespace,
            request.method.lower(),
            request.url.path,
            repr(sorted(request.query_params.items())),
        ]
    )


@app.get("/search")
@cache(expire=120, key_builder=request_key_builder)
async def search(q: str) -> dict[str, str]:
    return {"query": q}
```

You can pass a key builder per route, or set one globally in `FastAPICache.init(...)`.

## Common Pitfalls

- Initialize `FastAPICache` before the first cached call. The package raises if you use cache access before `init(...)`.
- Keep `@cache(...)` below `@app.get(...)` or the equivalent router decorator.
- Route-handler caching is HTTP-oriented. Non-`GET` requests bypass the cache.
- A request with `Cache-Control: no-store` bypasses caching entirely.
- A request with `Cache-Control: no-cache` refreshes the cached value instead of serving the current stored value.
- If you use `InMemoryBackend`, expired entries are only removed when the key is accessed again.
- Remember that the PyPI package is `fastapi-cache2` but the import path is `fastapi_cache`.

## Version Notes For 0.2.2

- PyPI lists `0.2.2` as the current release, published on July 24, 2024.
- The maintainer metadata for `0.2.2` declares Python `^3.8`.
- The published extras for `0.2.2` are `redis`, `memcache`, `dynamodb`, and `all`.

## Official Sources

- Maintainer repository: https://github.com/long2ice/fastapi-cache
- PyPI project page: https://pypi.org/project/fastapi-cache2/
- `0.2.2` package metadata: https://raw.githubusercontent.com/long2ice/fastapi-cache/v0.2.2/pyproject.toml
- Current package source for cache initialization: https://raw.githubusercontent.com/long2ice/fastapi-cache/main/fastapi_cache/__init__.py
- Current decorator implementation: https://raw.githubusercontent.com/long2ice/fastapi-cache/main/fastapi_cache/decorator.py
- Current default key builder: https://raw.githubusercontent.com/long2ice/fastapi-cache/main/fastapi_cache/key_builder.py
- Current coder implementations: https://raw.githubusercontent.com/long2ice/fastapi-cache/main/fastapi_cache/coder.py
