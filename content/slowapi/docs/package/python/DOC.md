---
name: package
description: "SlowAPI rate limiting for FastAPI and Starlette applications"
metadata:
  languages: "python"
  versions: "0.1.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "slowapi,python,fastapi,starlette,rate-limiting,redis"
---

# SlowAPI Python Package Guide

## Golden Rule

Use `slowapi` as request-time middleware and decorators inside a FastAPI or Starlette app. The limiter only works when your endpoint signature and decorator order match the package's documented requirements.

`slowapi` 0.1.9 supports Python `>=3.7,<4.0` and ships an optional `redis` extra.

## Install

Install the package version your app expects:

```bash
python -m pip install "slowapi==0.1.9"
```

If you want Redis-backed limits instead of in-memory storage:

```bash
python -m pip install "slowapi[redis]==0.1.9"
```

Optional environment variables for a Redis-backed setup:

```env
REDIS_URL=redis://localhost:6379/0
```

## FastAPI Setup

Create one `Limiter`, attach it to `app.state`, and register the built-in 429 handler:

```python
import os

from fastapi import FastAPI, Request, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    headers_enabled=True,
    storage_uri=os.getenv("REDIS_URL"),
)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.get("/health")
@limiter.limit("5/minute")
async def healthcheck(request: Request) -> dict[str, str]:
    return {"status": "ok"}


@app.get("/items/{item_id}")
@limiter.limit("30/minute")
async def read_item(
    request: Request,
    response: Response,
    item_id: str,
) -> dict[str, str]:
    return {"item_id": item_id}
```

Two details matter:

- The route decorator must be above `@limiter.limit(...)`.
- `request: Request` must be in the endpoint signature or SlowAPI cannot check the limit.

If you enable `headers_enabled=True` and return a plain dict that FastAPI turns into a response later, include `response: Response` in the function signature so SlowAPI can write the rate-limit headers.

## Starlette Setup

The same initialization pattern works for Starlette:

```python
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import PlainTextResponse

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

app = Starlette()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@limiter.limit("5/minute")
async def homepage(request: Request) -> PlainTextResponse:
    return PlainTextResponse("ok")


app.add_route("/", homepage)
```

## Common Workflows

### Add a per-route limit

Use `limit()` on individual endpoints:

```python
@app.get("/login")
@limiter.limit("10/minute")
async def login(request: Request, response: Response) -> dict[str, str]:
    return {"result": "allowed"}
```

`limit()` also supports `methods`, `per_method`, `error_message`, `exempt_when`, and `override_defaults`.

### Share one limit across multiple routes

Use `shared_limit()` when several endpoints should draw from the same bucket:

```python
shared_search_limit = limiter.shared_limit("20/minute", scope="search")


@app.get("/search")
@shared_search_limit
async def search(request: Request) -> dict[str, str]:
    return {"route": "search"}


@app.get("/search/advanced")
@shared_search_limit
async def advanced_search(request: Request) -> dict[str, str]:
    return {"route": "advanced"}
```

### Apply default global limits

For app-wide defaults, configure `default_limits` and add the SlowAPI middleware:

```python
from slowapi.middleware import SlowAPIMiddleware

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
```

Routes can opt out:

```python
@app.get("/metrics")
@limiter.exempt
async def metrics(request: Request) -> dict[str, bool]:
    return {"ok": True}
```

If you want a route-specific limit in addition to the defaults instead of replacing them, set `override_defaults=False`.

### Disable limiting entirely

This is useful in tests or local development:

```python
limiter = Limiter(key_func=get_remote_address, enabled=False)
```

You can also toggle it later:

```python
limiter.enabled = False
```

## Storage And Client Identity

By default, SlowAPI can use in-memory storage. For multi-process or multi-instance deployments, use a shared backend such as Redis:

```python
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379/0",
    headers_enabled=True,
)
```

The utility functions differ:

- `get_remote_address(request)` uses the request's client address.
- `get_ipaddr(request)` reads `X-Forwarded-For`; the API reference notes that Uvicorn's `ProxyHeadersMiddleware` is a more robust way to determine client IPs behind a proxy.

Choose the key function that matches your deployment topology. If your app sits behind a reverse proxy or load balancer, configure trusted proxy handling before basing limits on forwarded headers.

## Important Pitfalls

- `request` is mandatory in limited endpoints. Without it, the decorator cannot hook into the request lifecycle.
- Decorator order is mandatory: put `@app.get(...)` or `@router.get(...)` above `@limiter.limit(...)`.
- WebSocket endpoints are not supported.
- If you need `X-RateLimit-*` headers on FastAPI routes that return dicts, include `response: Response` in the signature and set `headers_enabled=True`.
- Global defaults require middleware. The docs example uses `SlowAPIMiddleware` together with `default_limits`.
- Redis is optional. If you pass a Redis `storage_uri`, install the `redis` extra as well.

## Version Notes For 0.1.9

- The maintainer's changelog for `0.1.9` lists type-hint fixes for `limit()` and `shared_limit()`, plus a fix so Starlette `Config` only receives `".env"` when that file exists.
- The latest published changelog in the repo also includes `0.1.10` as a later release. This guide is pinned to the requested `0.1.9` package version.

## Official Sources

- PyPI package: https://pypi.org/project/slowapi/
- Documentation root: https://slowapi.readthedocs.io/en/latest/
- Quick start and limitations: https://slowapi.readthedocs.io/en/latest/
- Examples: https://slowapi.readthedocs.io/en/latest/examples/
- API reference: https://slowapi.readthedocs.io/en/latest/api/
- Source repository: https://github.com/laurentS/slowapi
- `pyproject.toml` for package metadata and extras: https://raw.githubusercontent.com/laurentS/slowapi/master/pyproject.toml
- Changelog: https://raw.githubusercontent.com/laurentS/slowapi/master/CHANGELOG.md
