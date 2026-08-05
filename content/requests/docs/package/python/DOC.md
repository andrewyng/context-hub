---
name: package
description: "Requests HTTP client for Python with practical guidance for sessions, auth, timeouts, retries, streaming, and uploads"
metadata:
  languages: "python"
  versions: "2.34.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "requests,http,python,client,auth,session,retries"
---

# Requests Python Package Guide

## What It Is

`requests` is a synchronous HTTP/1.1 client for Python. It provides:

- per-method helpers: `get`, `post`, `put`, `patch`, `delete`, `head`, `options`
- `Session` objects for shared headers, cookies, and connection pooling
- Basic and Digest auth support
- TLS verification, proxies, multipart uploads, and streamed responses
- pluggable `HTTPAdapter` for retries and transport tuning via `urllib3`

Use it for straightforward blocking HTTP calls from Python.

## Version Covered

- Package: `requests`
- Ecosystem: `pypi`
- Version: `2.34.2`
- Python support: `>=3.10`
- Registry: https://pypi.org/project/requests/
- Docs root: https://requests.readthedocs.io/en/stable/

## Install

```bash
python -m pip install requests==2.34.2
```

Optional SOCKS proxy support:

```bash
python -m pip install "requests[socks]==2.34.2"
```

## Method Helpers

Use the per-method helpers and always pass `timeout=`.

```python
import requests

response = requests.get(
    "https://api.github.com/events",
    params={"per_page": 10},
    timeout=(3.05, 30),
)
response.raise_for_status()

events = response.json()
print(events[0]["type"])
```

- `params=` builds the query string.
- `timeout=` can be a float or `(connect_timeout, read_timeout)` tuple. Omitting it blocks indefinitely.
- `response.json()` does not check the HTTP status. Pair it with `raise_for_status()` or check `response.status_code`.

### POST JSON

Use `json=` for JSON bodies.

```python
import requests

payload = {"name": "example", "enabled": True}

response = requests.post(
    "https://httpbin.org/post",
    json=payload,
    timeout=30,
)
response.raise_for_status()
print(response.json()["json"])
```

`json=` is ignored if you also pass `data=` or `files=`.

### Form Data

```python
import requests

response = requests.post(
    "https://httpbin.org/post",
    data={"source": "daily-job", "count": "3"},
    timeout=30,
)
response.raise_for_status()
```

Pass `data=` as a dict for `application/x-www-form-urlencoded`, or as bytes/string for a raw body.

### Headers

```python
import requests

response = requests.get(
    "https://api.example.com/items",
    headers={
        "Accept": "application/json",
        "Authorization": "Bearer YOUR_TOKEN",
        "User-Agent": "my-service/1.0",
    },
    timeout=30,
)
response.raise_for_status()
```

## Response Objects

```python
import requests

response = requests.get("https://api.github.com/events", timeout=30)

response.status_code        # int, e.g. 200
response.ok                 # True when status_code < 400
response.reason             # e.g. "OK"
response.headers["Content-Type"]
response.text               # decoded body using response.encoding
response.content            # raw bytes
response.json()             # parsed JSON, raises requests.JSONDecodeError on failure
response.url                # final URL after redirects
response.history            # list of intermediate responses
response.cookies            # RequestsCookieJar
response.elapsed            # timedelta from request to response headers
response.raise_for_status() # raises HTTPError when status_code >= 400
```

`response.text` decodes with `response.encoding`. If the server omits a charset, Requests may guess; set `response.encoding = "utf-8"` explicitly when you know the encoding.

## Sessions

Use `Session` for repeated calls to the same host. A session persists cookies, reuses TCP/TLS connections via `urllib3`, and centralizes headers, auth, and TLS settings.

```python
import requests

with requests.Session() as session:
    session.headers.update({
        "User-Agent": "my-service/1.0",
        "Accept": "application/json",
    })
    session.params = {"api_version": "2026-01-01"}
    session.auth = ("user", "pass")

    response = session.get(
        "https://httpbin.org/get",
        timeout=(3.05, 30),
    )
    response.raise_for_status()
```

Per-request values merge with session-level values. Use a session for:

- shared headers, auth, or cookies across requests
- connection reuse for lower latency to the same host

## File Upload

Use `files=` for multipart uploads. Provide a tuple of `(filename, fileobj, content_type)` for explicit control.

```python
import requests

with open("report.csv", "rb") as fh:
    response = requests.post(
        "https://httpbin.org/post",
        data={"source": "daily-job"},
        files={"file": ("report.csv", fh, "text/csv")},
        timeout=30,
    )
    response.raise_for_status()
```

Multiple files:

```python
import requests

files = [
    ("attachments", ("a.txt", open("a.txt", "rb"), "text/plain")),
    ("attachments", ("b.txt", open("b.txt", "rb"), "text/plain")),
]
response = requests.post("https://httpbin.org/post", files=files, timeout=30)
response.raise_for_status()
```

## Basic Auth

```python
import requests

response = requests.get(
    "https://httpbin.org/basic-auth/user/pass",
    auth=("user", "pass"),
    timeout=30,
)
response.raise_for_status()
```

Digest auth via `requests.auth.HTTPDigestAuth`:

```python
import requests
from requests.auth import HTTPDigestAuth

response = requests.get(
    "https://httpbin.org/digest-auth/auth/user/pass",
    auth=HTTPDigestAuth("user", "pass"),
    timeout=30,
)
response.raise_for_status()
```

If you do not pass `auth=`, Requests may load Basic credentials from `~/.netrc`. Set `session.trust_env = False` to disable that.

## Timeouts

```python
import requests

# single value: applies to both connect and read
requests.get("https://example.com", timeout=10)

# tuple: (connect_timeout, read_timeout)
requests.get("https://example.com", timeout=(3.05, 30))
```

Notes:

- Without `timeout=`, the request blocks indefinitely.
- Timeouts are per-read inactivity, not a total deadline.
- A connect timeout slightly larger than a multiple of 3 (e.g. `3.05`) avoids racing TCP retransmit windows.

## Streaming Responses

Set `stream=True` to avoid loading the whole body into memory.

```python
import requests

with requests.get("https://httpbin.org/stream/20", stream=True, timeout=30) as response:
    response.raise_for_status()
    if response.encoding is None:
        response.encoding = "utf-8"
    for line in response.iter_lines(decode_unicode=True):
        if line:
            print(line)
```

File download:

```python
import requests

with requests.get("https://example.com/archive.tar.gz", stream=True, timeout=30) as response:
    response.raise_for_status()
    with open("archive.tar.gz", "wb") as fh:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                fh.write(chunk)
```

- Prefer `iter_content()` over `response.raw`.
- Always close the response (the `with` block does this) or the connection will not be returned to the pool.
- `iter_lines()` is not reentrant safe. Create the iterator once.

## Retries With HTTPAdapter

Requests does not retry by default. Mount a custom `HTTPAdapter` backed by `urllib3.util.Retry`.

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

retry = Retry(
    total=5,
    backoff_factor=0.5,
    status_forcelist=(429, 500, 502, 503, 504),
    allowed_methods=frozenset(["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]),
    respect_retry_after_header=True,
    raise_on_status=False,
)
adapter = HTTPAdapter(max_retries=retry)

with requests.Session() as session:
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    response = session.get("https://httpbin.org/status/503", timeout=(3.05, 30))
    response.raise_for_status()
```

Notes:

- `backoff_factor=0.5` produces sleeps of `0.5, 1.0, 2.0, 4.0, ...` seconds between retries.
- `allowed_methods` excludes `POST` by default; add it deliberately for idempotent endpoints.
- `Retry` lives in `urllib3.util.retry`. Requests `2.30+` supports `urllib3 2.x`.

## Errors

```python
import requests
from requests.exceptions import (
    ConnectionError,
    HTTPError,
    JSONDecodeError,
    RequestException,
    SSLError,
    Timeout,
)

try:
    response = requests.get("https://api.github.com/events", timeout=(3.05, 30))
    response.raise_for_status()
    data = response.json()
except Timeout:
    print("Request timed out.")
except SSLError as exc:
    print(f"TLS error: {exc}")
except ConnectionError as exc:
    print(f"Connection error: {exc}")
except HTTPError as exc:
    print(f"HTTP {exc.response.status_code}")
except JSONDecodeError:
    print("Response body was not valid JSON.")
except RequestException as exc:
    print(f"Requests error: {exc}")
```

Hierarchy to remember:

- `RequestException`: base for Requests errors
- `Timeout`: split into `ConnectTimeout` and `ReadTimeout`
- `ConnectionError`: DNS, TCP, connection reset
- `SSLError`: TLS verification or certificate problems
- `HTTPError`: raised by `raise_for_status()`
- `JSONDecodeError`: invalid JSON in `response.json()`
- `TooManyRedirects`: redirect cap exceeded

## TLS And Proxies

TLS verification is on by default.

```python
import requests

# custom CA bundle
requests.get("https://example.com", verify="/path/to/ca-bundle.pem", timeout=30)

# client certificate (key must be unencrypted)
requests.get(
    "https://example.com",
    cert=("/path/client.cert", "/path/client.key"),
    timeout=30,
)
```

Per-request proxies:

```python
import requests

proxies = {
    "http": "http://proxy.internal:3128",
    "https": "http://proxy.internal:3128",
}
requests.get("https://example.com", proxies=proxies, timeout=30)
```

Requests honors `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `NO_PROXY`, `REQUESTS_CA_BUNDLE`, and `CURL_CA_BUNDLE`. Disable env lookup with `session.trust_env = False`.

## Common Pitfalls

- Always set `timeout=`. There is no default.
- `response.json()` does not check status. Use `raise_for_status()` first.
- Do not use `verify=False` in production.
- Streaming responses must be closed; use `with` blocks.
- `Retry.allowed_methods` excludes `POST` by default.
- `session.proxies` can be overridden by environment proxies; pass `proxies=` per request for deterministic behavior.

## Version Notes For 2.34.x

- `2.34.2` is the current PyPI release as of 2026-05-29.
- The `2.34.x` series drops Python `3.9` and requires Python `>=3.10`.
- Requests `2.30.0+` supports `urllib3 2.x`. If you are still on `urllib3 1.x`, retest after upgrade.
- If you subclass `HTTPAdapter`, use `get_connection_with_tls_context` (introduced in `2.32.2`) instead of the deprecated `get_connection`.

## Official Sources

- Stable docs: https://requests.readthedocs.io/en/stable/
- Quickstart: https://requests.readthedocs.io/en/stable/user/quickstart/
- Advanced usage: https://requests.readthedocs.io/en/stable/user/advanced/
- Authentication: https://requests.readthedocs.io/en/stable/user/authentication/
- API reference: https://requests.readthedocs.io/en/stable/api/
- PyPI: https://pypi.org/project/requests/
- Releases: https://github.com/psf/requests/releases
