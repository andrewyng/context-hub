---
name: package
description: "fastapi-limiter request rate limiting for FastAPI routes, middleware, and websockets using pyrate-limiter"
metadata:
  languages: "python"
  versions: "0.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "fastapi,rate-limiting,pyrate-limiter,websocket,middleware,python"
---

# fastapi-limiter Python Package Guide

## Golden Rule

Use the current `0.2.0` API built around `pyrate_limiter.Limiter`.

Install:

```bash
python -m pip install "fastapi-limiter==0.2.0"
```

`fastapi-limiter 0.2.0` requires Python 3.9+ and depends on FastAPI 0.115.8+ and `pyrate-limiter 3.9+`.

Do not copy older `0.1.x` examples that import `FastAPILimiter` and call `FastAPILimiter.init(...)` with Redis. The current maintainer README and source use route dependencies, middleware, and websocket limiters backed by `pyrate-limiter`.

## Minimal Route Limit

This is the smallest working setup for an HTTP route.

```python
import os

from fastapi import Depends, FastAPI
from fastapi_limiter.depends import RateLimiter
from pyrate_limiter import Duration, Limiter, Rate

REQUESTS_PER_WINDOW = int(os.getenv("RATE_LIMIT_TIMES", "20"))
WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))

rate = Rate(REQUESTS_PER_WINDOW, Duration.SECOND * WINDOW_SECONDS)
limiter = Limiter(rate)

app = FastAPI()


@app.get(
    "/search",
    dependencies=[
        Depends(
            RateLimiter(
                limiter=limiter,
                times=REQUESTS_PER_WINDOW,
                seconds=WINDOW_SECONDS,
            )
        )
    ],
)
async def search(q: str) -> dict[str, str]:
    return {"q": q}
```

`RateLimiter` is an async dependency. Attach it with `dependencies=[Depends(...)]` when you want to reject requests before your handler runs.

## Custom Identifier

By default, the package identifies clients from `X-Forwarded-For` when present, otherwise `request.client.host`, and appends the request path. Override `identifier` if you want per-user limits or different keying.

```python
from fastapi import Depends, FastAPI, Request
from fastapi_limiter.depends import RateLimiter
from pyrate_limiter import Duration, Limiter, Rate

app = FastAPI()
limiter = Limiter(Rate(5, Duration.SECOND * 60))


async def user_or_ip_identifier(request: Request) -> str:
    user_id = request.headers.get("x-user-id")
    if user_id:
        return f"user:{user_id}"
    if request.client:
        return f"ip:{request.client.host}"
    return "anonymous"


@app.get(
    "/profile",
    dependencies=[
        Depends(
            RateLimiter(
                limiter=limiter,
                times=5,
                seconds=60,
                identifier=user_or_ip_identifier,
            )
        )
    ],
)
async def profile() -> dict[str, bool]:
    return {"ok": True}
```

If you replace the default identifier, add `request.url.path` yourself when you still want separate budgets per route.

## Custom Rejection Callback

The dependency callback is awaited with `(request, response)`. Use an async function.

```python
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi_limiter.depends import RateLimiter
from pyrate_limiter import Duration, Limiter, Rate

app = FastAPI()
limiter = Limiter(Rate(2, Duration.SECOND * 60))


async def rate_limit_callback(request: Request, response: Response) -> None:
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail="Rate limit exceeded",
        headers={"Retry-After": "60"},
    )


@app.get(
    "/reports",
    dependencies=[
        Depends(
            RateLimiter(
                limiter=limiter,
                times=2,
                seconds=60,
                callback=rate_limit_callback,
            )
        )
    ],
)
async def reports() -> dict[str, str]:
    return {"status": "ready"}
```

## Skip Selected Requests

Use `skip` for routes that should stay public for health checks or internal probes.

```python
from fastapi import Depends, FastAPI, Request
from fastapi_limiter.depends import RateLimiter
from pyrate_limiter import Duration, Limiter, Rate

app = FastAPI()
limiter = Limiter(Rate(10, Duration.SECOND * 60))


async def skip_health_checks(request: Request) -> bool:
    return request.url.path in {"/healthz", "/readyz"}


@app.get(
    "/api",
    dependencies=[
        Depends(
            RateLimiter(
                limiter=limiter,
                times=10,
                seconds=60,
                skip=skip_health_checks,
            )
        )
    ],
)
async def api() -> dict[str, bool]:
    return {"ok": True}
```

## Apply Global Limits With Middleware

Use `RateLimiterMiddleware` when you want one shared limit across the whole app instead of per-route dependencies.

```python
from fastapi import FastAPI
from fastapi_limiter.middleware import RateLimiterMiddleware
from pyrate_limiter import Duration, Limiter, Rate

app = FastAPI()

app.add_middleware(
    RateLimiterMiddleware,
    limiter=Limiter(Rate(100, Duration.SECOND * 60)),
    ignore_if_private_loopback=True,
)


@app.get("/")
async def index() -> dict[str, str]:
    return {"message": "ok"}
```

The middleware callback is different from the dependency callback: it receives only `request` and must return a `Response`. The default middleware response is HTTP 429 with `{"detail": "Too Many Requests"}`.

## Rate Limit WebSocket Messages

`WebSocketRateLimiter` is not registered as a dependency. Create it in the handler and await it after each message you want to count.

```python
from fastapi import FastAPI, WebSocket
from fastapi_limiter.depends import WebSocketRateLimiter
from pyrate_limiter import Duration, Limiter, Rate

app = FastAPI()
limiter = Limiter(Rate(1, Duration.SECOND * 5))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    rate_limit = WebSocketRateLimiter(limiter=limiter, times=1, seconds=5)

    while True:
        data = await websocket.receive_text()
        await rate_limit(websocket, context_key=data)
        await websocket.send_text(f"echo: {data}")
```

`context_key` is optional. Use it when distinct message types should have separate rate buckets.

## Multiple Limits On One Route

You can stack dependencies:

```python
from fastapi import Depends, FastAPI
from fastapi_limiter.depends import RateLimiter
from pyrate_limiter import Duration, Limiter, Rate

app = FastAPI()
limiter = Limiter(Rate(2, Duration.SECOND * 15))


@app.get(
    "/burst-and-sustained",
    dependencies=[
        Depends(RateLimiter(limiter=limiter, times=1, seconds=5)),
        Depends(RateLimiter(limiter=limiter, times=2, seconds=15)),
    ],
)
async def burst_and_sustained() -> dict[str, bool]:
    return {"ok": True}
```

Keep the smaller `seconds / times` ratio first. The maintainer README calls this out explicitly.

## Common Pitfalls

- `0.2.0` is a different setup model from the Redis-based `0.1.x` line. If a snippet imports `from fastapi_limiter import FastAPILimiter`, it is not the current API.
- The default identifier includes the request path. A custom identifier does not, unless you add it.
- `X-Forwarded-For` is only safe when your proxy setup is trusted and normalized. Otherwise, use your own identifier function.
- Dependency callbacks and `skip` callables are awaited. Write them as `async def`.
- Middleware callbacks have a different signature from dependency callbacks.
- If you share one limiter across several routes, your key strategy determines whether traffic is isolated per route or pooled across routes.

## Version Notes For 0.2.0

- PyPI lists `0.2.0` as the current release and the maintainer README now describes the package as being powered by `pyrate-limiter`.
- The older GitHub release history and older README snapshots refer to Redis, Lua scripts, and `FastAPILimiter.init(...)`. Treat those as pre-`0.2.x` documentation.

## Official Sources

- GitHub repository: https://github.com/long2ice/fastapi-limiter
- Current maintainer README: https://github.com/long2ice/fastapi-limiter#readme
- PyPI project page: https://pypi.org/project/fastapi-limiter/
- Dependency limiter source: https://github.com/long2ice/fastapi-limiter/blob/main/fastapi_limiter/depends.py
- Middleware source: https://github.com/long2ice/fastapi-limiter/blob/main/fastapi_limiter/middleware.py
- Default identifier source: https://github.com/long2ice/fastapi-limiter/blob/main/fastapi_limiter/identifier.py
- GitHub releases page for older `0.1.x` behavior: https://github.com/long2ice/fastapi-limiter/releases
