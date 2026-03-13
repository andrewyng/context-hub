---
name: package
description: "Type stubs for the requests HTTP client, published from typeshed for Python type checkers"
metadata:
  languages: "python"
  versions: "2.32.4.20260107"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python,typing,stubs,requests,mypy,pyright"
---

# types-requests

`types-requests` is the `typeshed` stub package for `requests`. Install it when your project uses `requests` and you want mypy, pyright, or another type checker to understand the `requests` API.

This package does not add a new runtime client and it does not change how you import `requests`. Keep using `import requests` in application code.

## Install

Install `types-requests` alongside the runtime package:

```bash
python -m pip install "requests==2.32.*" "types-requests==2.32.4.20260107"
```

If you also want a CLI type checker:

```bash
python -m pip install mypy
# or
python -m pip install pyright
```

`types-requests` is a PEP 561 stub package, so supported type checkers pick it up automatically once it is installed.

## No Separate Initialization

There are no package-specific environment variables, authentication steps, or client constructors for `types-requests`.

- Do not import `types_requests`
- Do not create a special stub client
- Continue using the normal `requests` module and `requests.Session()`

## Basic Typed Requests

Use the same `requests` API you already use at runtime:

```python
import requests

response = requests.get(
    "https://api.github.com/repos/psf/requests",
    headers={"Accept": "application/vnd.github+json"},
    timeout=(5, 30),
)
response.raise_for_status()

print(response.status_code)
print(response.headers["content-type"])
print(response.text)
```

The stubs cover the top-level request helpers, including `requests.request()`, `get()`, `post()`, `put()`, `patch()`, `delete()`, `head()`, and `options()`.

Common typed keyword arguments include:

- `params`
- `data`
- `json`
- `headers`
- `cookies`
- `files`
- `auth`
- `timeout`
- `proxies`
- `stream`
- `verify`
- `cert`

## Reuse A Typed Session

For applications that keep base URLs or tokens in environment variables, use `requests.Session()` exactly as you would without stubs:

```python
import os

import requests

API_BASE_URL = os.environ["API_BASE_URL"]
API_TOKEN = os.environ["API_TOKEN"]

session = requests.Session()
session.headers.update(
    {
        "Authorization": f"Bearer {API_TOKEN}",
        "Accept": "application/json",
    }
)

response = session.post(
    f"{API_BASE_URL}/users",
    json={"name": "Ada Lovelace", "role": "admin"},
    timeout=(5, 30),
)
response.raise_for_status()

print(response.status_code)
print(response.json())
```

For error handling, catch the normal `requests` exceptions:

```python
import requests

try:
    response = requests.get("https://api.example.com/health", timeout=5)
    response.raise_for_status()
except requests.Timeout:
    print("request timed out")
except requests.RequestException as exc:
    print(f"request failed: {exc}")
```

## Treat `response.json()` As A Typed Boundary

The stubs model `Response.json()` as returning `Any`. That is useful and intentional: the checker cannot know the schema your service returns.

If you know the expected shape, cast or validate the result at the boundary:

```python
from typing import TypedDict, cast

import requests


class UserRecord(TypedDict):
    id: int
    login: str


response = requests.get("https://api.github.com/users/octocat", timeout=30)
response.raise_for_status()

user = cast(UserRecord, response.json())
print(user["login"])
```

For stricter code, replace `cast()` with schema validation in your application layer.

## Version Notes

`typeshed` uses stub versions with a date suffix. For `types-requests==2.32.4.20260107`:

- `2.32.4` tracks the targeted `requests` runtime version
- `20260107` is the stub release date

Two safe dependency strategies from the `typeshed` guidance are:

- keep stub bounds aligned with your `requests` bounds, for example `requests>=2.32,<2.33` and `types-requests>=2.32,<2.33`
- pin an exact `types-requests` version if you need stable type-checking results across dependency updates

## Important Pitfalls

- `types-requests` is only for static typing; it is not a replacement for installing `requests`
- keep importing `requests`, not `types_requests`
- `response.json()` is not strongly typed for you; validate or cast it yourself
- `types-requests` has required `urllib3>=2` since `2.31.0.7`; if your environment must stay on `urllib3<2`, use `types-requests<2.31.0.7`
- stub packages can change type-checking results even when runtime behavior is unchanged, so pin when you need repeatable CI output
