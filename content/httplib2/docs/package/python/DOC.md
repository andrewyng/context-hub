---
name: package
description: "httplib2 HTTP client for Python with request, authentication, caching, proxy, and TLS configuration examples"
metadata:
  languages: "python"
  versions: "0.31.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "httplib2,http,https,client,cache,proxy,python"
---

# httplib2 Python Package Guide

## Golden Rule

Use `httplib2.Http` as the main client and build requests through `Http.request(...)`.

The maintainer docs on Read the Docs still render as `httplib2 0.4 documentation`, but PyPI currently publishes `0.31.2`. For current version notes, check the repository `README.md` and `CHANGELOG` alongside the API docs.

## Install

Use a virtual environment and pin the version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "httplib2==0.31.2"
```

Example environment variables used in the snippets below:

```bash
export API_BASE_URL="https://api.example.com"
export API_USERNAME="alice"
export API_PASSWORD="secret"
export HTTPLIB2_CA_CERTS="/etc/ssl/certs/ca-certificates.crt"
export HTTPS_PROXY="http://proxy.example:8080"
export NO_PROXY="localhost,127.0.0.1,.internal.example"
```

`HTTPLIB2_CA_CERTS` is supported by current releases for custom CA bundles. Proxy settings are picked up from the environment by default.

## Initialize A Client

Create one `Http` instance and reuse it across requests so connection pooling and caching can work for you:

```python
import os
import httplib2

http = httplib2.Http(
    cache=".cache/httplib2",
    timeout=20,
    ca_certs=os.getenv("HTTPLIB2_CA_CERTS"),
)
```

If you need to ignore proxy environment variables for a specific client, pass `proxy_info=None`:

```python
import httplib2

http = httplib2.Http(proxy_info=None, timeout=20)
```

## Make Requests

### GET JSON

`request()` returns `(response, content)`. `content` is bytes in current releases, so decode it before loading JSON.

```python
import json
import os
import httplib2

http = httplib2.Http(
    cache=".cache/httplib2",
    timeout=20,
    ca_certs=os.getenv("HTTPLIB2_CA_CERTS"),
)

response, content = http.request(
    f"{os.environ['API_BASE_URL']}/v1/widgets",
    method="GET",
    headers={
        "accept": "application/json",
        "user-agent": "my-app/1.0",
    },
)

if response.status != 200:
    raise RuntimeError(f"request failed: {response.status} {response.reason}")

payload = json.loads(content.decode("utf-8"))
print(payload)
```

### POST JSON

```python
import json
import os
import httplib2

http = httplib2.Http(timeout=20, ca_certs=os.getenv("HTTPLIB2_CA_CERTS"))

body = json.dumps(
    {
        "name": "widget-1",
        "enabled": True,
    }
)

response, content = http.request(
    f"{os.environ['API_BASE_URL']}/v1/widgets",
    method="POST",
    body=body,
    headers={
        "content-type": "application/json",
        "accept": "application/json",
    },
)

if response.status not in (200, 201):
    raise RuntimeError(f"create failed: {response.status} {response.reason}")

created = json.loads(content.decode("utf-8"))
print(created["id"])
```

### Send Form Data

```python
import urllib.parse
import os
import httplib2

http = httplib2.Http(timeout=20, ca_certs=os.getenv("HTTPLIB2_CA_CERTS"))

form_body = urllib.parse.urlencode(
    {
        "grant_type": "client_credentials",
        "scope": "read:widgets",
    }
)

response, content = http.request(
    f"{os.environ['API_BASE_URL']}/oauth/token",
    method="POST",
    body=form_body,
    headers={"content-type": "application/x-www-form-urlencoded"},
)
```

## Authentication

### Basic Auth

Use `add_credentials()` before calling protected endpoints:

```python
import os
import httplib2

http = httplib2.Http(timeout=20, ca_certs=os.getenv("HTTPLIB2_CA_CERTS"))
http.add_credentials(
    os.environ["API_USERNAME"],
    os.environ["API_PASSWORD"],
)

response, content = http.request(
    f"{os.environ['API_BASE_URL']}/private/profile",
    method="GET",
    headers={"accept": "application/json"},
)
```

### Client Certificates

For mTLS-style endpoints, register the certificate and key for the target domain:

```python
import os
import httplib2

http = httplib2.Http(timeout=20, ca_certs=os.getenv("HTTPLIB2_CA_CERTS"))
http.add_certificate(
    "/path/to/client-key.pem",
    "/path/to/client-cert.pem",
    "api.example.com",
)

response, content = http.request(
    "https://api.example.com/secure/health",
    method="GET",
)
```

## Caching, Redirects, And TLS

### File-based caching

Passing a cache directory stores cache entries on disk:

```python
import httplib2

http = httplib2.Http(cache=".cache/httplib2", timeout=20)
response, content = http.request("https://api.example.com/v1/widgets", "GET")

if getattr(response, "fromcache", False):
    print("served from cache")
```

### Redirect behavior

`httplib2` follows redirects for `GET` and `HEAD` by default. If you need redirect handling for other methods, enable it explicitly:

```python
import httplib2

http = httplib2.Http(follow_all_redirects=True, timeout=20)
response, content = http.request(
    "https://api.example.com/legacy-endpoint",
    method="POST",
    body="x=1",
    headers={"content-type": "application/x-www-form-urlencoded"},
)
```

Keep the default `forward_authorization_headers=False` unless you fully trust redirect targets.

### TLS validation

Leave certificate validation enabled in production. If your environment uses a private CA, point `ca_certs` or `HTTPLIB2_CA_CERTS` at the bundle that should be trusted.

```python
import os
import httplib2

http = httplib2.Http(
    timeout=20,
    ca_certs=os.environ["HTTPLIB2_CA_CERTS"],
)
```

## Common Pitfalls

- `Http.request()` expects an absolute URI. Relative URLs raise `RelativeURIError`.
- `content` is bytes in current releases. Decode it before calling `json.loads(...)` or string operations.
- `httplib2` reads proxy settings from the environment by default. If that is breaking local development or internal calls, create the client with `proxy_info=None`.
- Redirects are not blanket-enabled for every method. If your API returns `307` or `308` for `POST` or `PUT`, set `follow_all_redirects=True` deliberately.
- `forward_authorization_headers` is off by default for safety. Do not switch it on unless you are certain redirected requests should carry credentials.
- `force_exception_to_status_code=True` changes transport and SSL failures into synthetic response objects instead of raising exceptions. If you enable it, always inspect `response.status` before assuming the request succeeded.

## Version-Sensitive Notes For 0.31.x

- PyPI currently lists `httplib2 0.31.2` as the latest release.
- The maintainer changelog explicitly says not to use `0.31.1`.
- The changelog for `0.30.0` says support changed to Python 3.7+ only, but the current PyPI metadata still shows `Requires: Python >=3.6`. Treat Python 3.7+ as the safer baseline for `0.31.x`.
- `0.30.1` notes a fix for SOCKS proxy support that was broken in `0.30.0`.
- The `HTTPLIB2_CA_CERTS` environment variable support is documented in the `0.31.0` changelog, which is useful when system trust stores are not enough for your environment.

## Official Sources

- Maintainer docs root: https://httplib2.readthedocs.io/en/latest/
- API reference: https://httplib2.readthedocs.io/en/latest/libhttplib2.html
- Authentication guide: https://httplib2.readthedocs.io/en/latest/authentication.html
- Caching guide: https://httplib2.readthedocs.io/en/latest/caching.html
- Repository README: https://github.com/httplib2/httplib2/blob/master/README.md
- Repository changelog: https://github.com/httplib2/httplib2/blob/master/CHANGELOG
- PyPI project page: https://pypi.org/project/httplib2/
