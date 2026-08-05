---
name: package
description: "HTTPX package guide for Python with sync Client, AsyncClient, timeouts, streaming, HTTP/2, and transports"
metadata:
  languages: "python"
  versions: "0.28.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "httpx,http,client,async,python,http2,transports"
---

# HTTPX Python Package Guide

## When To Use HTTPX

`httpx` is a modern HTTP client with both sync and async APIs. It offers:

- `Client` (sync) and `AsyncClient` (async) with shared configuration
- connection pooling, configurable timeouts, streaming, redirects, cookies, and auth
- HTTP/2 via the `http2` extra
- pluggable transports including `WSGITransport`, `ASGITransport`, and `MockTransport`

Use it when you want a `requests`-like API plus async support and explicit client configuration.

## Version Covered

- Package: `httpx`
- Ecosystem: `pypi`
- Version: `0.28.1`
- Python support: `>=3.8` (per PyPI metadata for `0.28.1`)
- Registry: https://pypi.org/project/httpx/
- Docs root: https://www.python-httpx.org/

## Install

```bash
pip install httpx==0.28.1
```

Common extras:

```bash
pip install "httpx[http2]==0.28.1"
pip install "httpx[socks]==0.28.1"
pip install "httpx[brotli]==0.28.1"
pip install "httpx[zstd]==0.28.1"
```

## Golden Rules

- Use `httpx.Client()` or `httpx.AsyncClient()` for anything beyond a one-off request.
- Reuse one client; do not construct a fresh client inside a hot loop.
- Call `response.raise_for_status()` when non-2xx must fail.
- Redirects are off by default. Pass `follow_redirects=True` to enable.
- Use `proxy=` or `mounts=`. The `proxies=` argument was removed in `0.28.0`.
- For in-process app testing, use `WSGITransport` or `ASGITransport`. The `app=` shortcut was removed in `0.28.0`.

## Sync Client

```python
import httpx

with httpx.Client(
    base_url="https://api.example.com",
    headers={"Accept": "application/json"},
    params={"api_version": "2026-01-01"},
    timeout=httpx.Timeout(10.0, connect=5.0),
    follow_redirects=True,
) as client:
    response = client.get("/items", params={"limit": 20})
    response.raise_for_status()
    items = response.json()
    print(items)
```

Client behavior:

- `base_url` lets you call relative paths.
- Client-level headers, params, and cookies merge with request-level values.
- Connections are pooled and reused across requests.

### Top-Level Helpers

```python
import httpx

response = httpx.get("https://api.example.com/items", timeout=10.0)
response.raise_for_status()
```

The top-level `httpx.get` / `httpx.post` helpers create a temporary client per call. Use them only for ad-hoc scripts.

## Sending JSON, Form Data, And Files

```python
import httpx

payload = {"name": "example", "enabled": True}

with httpx.Client() as client:
    response = client.post("https://api.example.com/items", json=payload)
    response.raise_for_status()
```

```python
import httpx

with httpx.Client() as client:
    response = client.post(
        "https://api.example.com/search",
        data={"q": "python", "page": "1"},
    )
    response.raise_for_status()
```

```python
import httpx

with open("report.csv", "rb") as f:
    files = {"file": ("report.csv", f, "text/csv")}
    with httpx.Client() as client:
        response = client.post("https://api.example.com/upload", files=files)
        response.raise_for_status()
```

Body argument map:

- `json=` for JSON bodies
- `data=` for HTML form data
- `files=` for multipart uploads
- `content=` for raw bytes or text when you need full control
- `params=` for query string parameters

## Headers

```python
import httpx

with httpx.Client(
    base_url="https://api.example.com",
    headers={"Authorization": "Bearer YOUR_TOKEN"},
) as client:
    response = client.get("/me", headers={"X-Request-Id": "abc-123"})
    response.raise_for_status()
```

Per-request headers merge with client-level headers; per-request keys override client keys.

## Response Objects

```python
import httpx

response = httpx.get("https://api.example.com/items", timeout=10.0)

response.status_code            # int
response.is_success             # status_code < 400
response.headers["content-type"]
response.text                   # decoded body
response.content                # raw bytes
response.json()                 # parsed JSON
response.url                    # httpx.URL, not a str
response.http_version           # e.g. "HTTP/2"
response.elapsed                # timedelta
response.cookies
response.raise_for_status()
```

`response.url` is an `httpx.URL`. Convert with `str(response.url)` when you need a plain string.

## Async Client

```python
import asyncio
import httpx

async def main() -> None:
    async with httpx.AsyncClient(
        base_url="https://api.example.com",
        timeout=httpx.Timeout(10.0, connect=5.0),
    ) as client:
        response = await client.get("/items")
        response.raise_for_status()
        print(response.json())

asyncio.run(main())
```

Concurrent requests with one client:

```python
import asyncio
import httpx

async def fetch(client: httpx.AsyncClient, path: str) -> dict:
    response = await client.get(path)
    response.raise_for_status()
    return response.json()

async def main() -> None:
    async with httpx.AsyncClient(base_url="https://api.example.com") as client:
        results = await asyncio.gather(
            fetch(client, "/a"),
            fetch(client, "/b"),
            fetch(client, "/c"),
        )
        print(results)

asyncio.run(main())
```

Async pitfalls:

- Keep one long-lived `AsyncClient` per service when possible.
- Always use `async with` (or call `aclose()` explicitly) so connections close cleanly.
- Mixing sync `Client` and async `AsyncClient` in the same code path is fine; pick one per call site.

## Streaming

Sync streaming:

```python
import httpx

with httpx.Client() as client:
    with client.stream("GET", "https://example.com/large.bin") as response:
        response.raise_for_status()
        with open("large.bin", "wb") as f:
            for chunk in response.iter_bytes():
                f.write(chunk)
```

Async streaming:

```python
import asyncio
import httpx

async def download(url: str, output_path: str) -> None:
    async with httpx.AsyncClient() as client:
        async with client.stream("GET", url) as response:
            response.raise_for_status()
            with open(output_path, "wb") as f:
                async for chunk in response.aiter_bytes():
                    f.write(chunk)

asyncio.run(download("https://example.com/large.bin", "large.bin"))
```

Streaming iterators:

- `iter_bytes()` / `aiter_bytes()` for raw chunks
- `iter_text()` / `aiter_text()` for decoded text
- `iter_lines()` / `aiter_lines()` for line iteration
- `iter_raw()` / `aiter_raw()` for undecoded content

If you call `stream()` without a context manager, you must call `response.close()` (or `aclose()`) when done.

## Authentication

Basic auth via a tuple:

```python
import httpx

response = httpx.get(
    "https://api.example.com/me",
    auth=("username", "password"),
)
response.raise_for_status()
```

Client-scoped auth:

```python
import httpx

with httpx.Client(
    base_url="https://api.example.com",
    auth=("username", "password"),
) as client:
    response = client.get("/me")
    response.raise_for_status()
```

Other auth options:

- `httpx.BasicAuth(username, password)`
- `httpx.DigestAuth(username, password)`
- `httpx.NetRCAuth()` for local `.netrc`
- subclass `httpx.Auth` for custom flows (e.g. OAuth refresh)

For bearer tokens, set a client header:

```python
import httpx

with httpx.Client(
    base_url="https://api.example.com",
    headers={"Authorization": "Bearer YOUR_TOKEN"},
) as client:
    response = client.get("/me")
    response.raise_for_status()
```

## Timeouts

HTTPX has default timeouts. Configure them explicitly in production.

```python
import httpx

timeout = httpx.Timeout(
    10.0,            # default for all categories
    connect=2.0,
    read=20.0,
    write=20.0,
    pool=5.0,
)

with httpx.Client(timeout=timeout) as client:
    response = client.get("https://api.example.com/health")
    response.raise_for_status()
```

Categories:

- `connect`: time to establish a TCP connection
- `read`: time to read a chunk from the socket
- `write`: time to write a chunk to the socket
- `pool`: time to acquire a connection from the pool

`httpx.Timeout(None)` disables timeouts; do not use that in production.

Per-request override:

```python
response = client.get("/slow", timeout=30.0)
```

HTTPX timeouts are inactivity timeouts, not a single end-to-end deadline. HTTPX does not provide a built-in retry layer.

## Connection Limits

```python
import httpx

limits = httpx.Limits(
    max_connections=100,
    max_keepalive_connections=20,
    keepalive_expiry=5.0,
)

with httpx.Client(limits=limits) as client:
    response = client.get("https://api.example.com/health")
    response.raise_for_status()
```

## Error Handling

```python
import httpx

try:
    response = httpx.get("https://api.example.com/items", timeout=5.0)
    response.raise_for_status()
except httpx.HTTPStatusError as exc:
    print(f"Bad status {exc.response.status_code}")
except httpx.TimeoutException:
    print("Request timed out")
except httpx.ConnectError as exc:
    print(f"Connection failed: {exc}")
except httpx.RequestError as exc:
    print(f"Transport error: {exc}")
```

Key types:

- `httpx.HTTPError`: top-level base
- `httpx.RequestError`: transport-layer base (`ConnectError`, `ReadError`, `WriteError`, `PoolTimeout`, etc.)
- `httpx.TimeoutException`: base for `ConnectTimeout`, `ReadTimeout`, `WriteTimeout`, `PoolTimeout`
- `httpx.HTTPStatusError`: raised by `raise_for_status()`
- `httpx.InvalidURL`, `httpx.CookieConflict`, `httpx.StreamError`

## HTTP/2

Install the extra and enable per-client:

```python
import httpx

with httpx.Client(http2=True) as client:
    response = client.get("https://example.com")
    print(response.http_version)  # "HTTP/2" when negotiated
```

HTTP/2 negotiation requires ALPN over TLS. `http2=True` is a no-op unless the `http2` extra is installed.

## Transports

Transports sit beneath the client and execute requests. Override them to route in-process or mock the network.

### HTTPTransport

The default transport. Use it to tune low-level behavior:

```python
import httpx

transport = httpx.HTTPTransport(
    retries=1,            # connection-establish retries only (not response retries)
    http2=True,
    local_address="0.0.0.0",
)

with httpx.Client(transport=transport) as client:
    response = client.get("https://example.com")
    response.raise_for_status()
```

`retries` on the transport only retries connection failures during establishment, not response status codes.

### Mounts For Per-Scheme Routing

```python
import httpx

mounts = {
    "http://": httpx.HTTPTransport(),
    "https://internal.example.com": httpx.HTTPTransport(verify="/path/ca.pem"),
}

with httpx.Client(mounts=mounts) as client:
    response = client.get("https://internal.example.com/health")
    response.raise_for_status()
```

### WSGITransport And ASGITransport

For in-process tests of Python web apps:

```python
import httpx
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route

async def homepage(request):
    return JSONResponse({"ok": True})

app = Starlette(routes=[Route("/", homepage)])
transport = httpx.ASGITransport(app=app)

async def main() -> None:
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/")
        response.raise_for_status()
        print(response.json())
```

For a sync WSGI app, use `httpx.WSGITransport(app=wsgi_app)` with `httpx.Client`.

### MockTransport

```python
import httpx

def handler(request: httpx.Request) -> httpx.Response:
    return httpx.Response(200, json={"ok": True})

transport = httpx.MockTransport(handler)

with httpx.Client(transport=transport, base_url="https://api.example.com") as client:
    response = client.get("/anything")
    assert response.json() == {"ok": True}
```

## Proxies And Environment Variables

```python
import httpx

with httpx.Client(proxy="http://localhost:8030") as client:
    response = client.get("https://example.com")
    response.raise_for_status()
```

`trust_env=True` (the default) honors `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `NO_PROXY`, `SSL_CERT_FILE`, and `SSL_CERT_DIR`. Set `trust_env=False` for deterministic behavior.

## SSL / TLS

`0.28.x` deprecates string-style `verify=` and the `cert=` shortcut. Prefer an explicit `ssl.SSLContext`:

```python
import ssl
import certifi
import httpx

ctx = ssl.create_default_context(cafile=certifi.where())

with httpx.Client(verify=ctx) as client:
    response = client.get("https://example.com")
    response.raise_for_status()
```

To use the OS trust store on newer Python:

```python
import ssl
import httpx
import truststore

ctx = truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)

with httpx.Client(verify=ctx) as client:
    response = client.get("https://example.com")
    response.raise_for_status()
```

## Requests Compatibility Notes

- Redirects are off by default in HTTPX.
- `response.url` is an `httpx.URL` object, not a string.
- Cookies should usually live on the client; pass per-request only when needed.
- Streaming uses `Client.stream(...)` / `AsyncClient.stream(...)`, not `stream=True`.

## Version Notes For 0.28.1

- `0.28.0` removed the deprecated `proxies=` argument. Use `proxy=` or `mounts=`.
- `0.28.0` removed the deprecated `app=` shortcut. Use `WSGITransport` or `ASGITransport`.
- `0.28.0` deprecated string-style `verify=` and the `cert=` argument. Prefer `ssl.SSLContext`.
- `0.28.0` changed JSON request body serialization to a more compact form.
- `0.28.1` fixed a bug involving `verify=False` together with client-side certificates and reintroduced the `URLTypes` shortcut.
- `0.28.1` remains the current PyPI release as of 2026-05-29.

## Official Sources

- Docs root: https://www.python-httpx.org/
- Quickstart: https://www.python-httpx.org/quickstart/
- Clients: https://www.python-httpx.org/advanced/clients/
- Authentication: https://www.python-httpx.org/advanced/authentication/
- Timeouts: https://www.python-httpx.org/advanced/timeouts/
- Resource limits: https://www.python-httpx.org/advanced/resource-limits/
- Proxies: https://www.python-httpx.org/advanced/proxies/
- SSL: https://www.python-httpx.org/advanced/ssl/
- Environment variables: https://www.python-httpx.org/environment_variables/
- Async support: https://www.python-httpx.org/async/
- HTTP/2: https://www.python-httpx.org/http2/
- Transports: https://www.python-httpx.org/advanced/transports/
- Requests compatibility: https://www.python-httpx.org/compatibility/
- Exceptions: https://www.python-httpx.org/exceptions/
- PyPI: https://pypi.org/project/httpx/
- Releases: https://github.com/encode/httpx/releases
