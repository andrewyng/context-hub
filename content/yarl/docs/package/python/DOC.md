---
name: package
description: "yarl package guide for immutable URL parsing and construction in Python"
metadata:
  languages: "python"
  versions: "1.23.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "yarl,python,url,querystring,encoding,pydantic"
---

# yarl Python Package Guide

## Golden Rule

Use `yarl.URL` when you need an immutable URL value with correct percent-encoding for path, query, fragment, and IDNA host handling. Treat every change as "create a new URL", not "mutate the existing one".

## Install

`yarl 1.23.0` requires Python 3.10 or newer.

```bash
python -m pip install "yarl==1.23.0"
```

`yarl` ships wheels for common Linux, macOS, and Windows environments. If your platform falls back to a source build, you need a C compiler and Python headers. To force the slower pure-Python build instead:

```bash
YARL_NO_EXTENSIONS=1 python -m pip install "yarl==1.23.0"
```

## Initialize URLs

There is no auth step, client object, or required environment variable. Import `URL` and construct values directly:

```python
from yarl import URL

absolute_url = URL("https://api.example.com/v1/items?limit=10#results")
relative_url = URL("/v1/items?page=2")

print(absolute_url.host)        # api.example.com
print(absolute_url.path)        # /v1/items
print(absolute_url.query_string)  # limit=10
print(relative_url.is_absolute())  # False
```

`yarl` stores URL parts in encoded form internally. `str(url)` gives the encoded wire form; `human_repr()` gives a decoded display form.

```python
from yarl import URL

url = URL("https://εxample.com/шлях/這裡")

print(str(url))
print(url.human_repr())
print(url.raw_path)
```

## Build URLs Safely

Use `URL.build()` when you already have structured pieces such as scheme, host, path, and query parameters:

```python
from yarl import URL

url = URL.build(
    scheme="https",
    host="api.example.com",
    path="/v1/search",
    query={"q": "red shoes", "page": 2},
)

print(url)
# https://api.example.com/v1/search?q=red+shoes&page=2
```

If you already have a serialized query string, pass `query_string=` instead of `query=`. Do not pass both in the same call.

## Common Mutation Workflows

### Replace or merge query parameters

`with_query()` replaces the full query string, `update_query()` overwrites matching keys while keeping the rest, and `extend_query()` appends new values without removing duplicates.

```python
from yarl import URL

base = URL("https://api.example.com/items?category=books&tag=sale")

print(base.with_query(page=2))
print(base.update_query(page=2, category="games"))
print(base.extend_query(tag="featured"))
```

Use strings, integers, floats, sequences, or mappings for query values. `bool` is intentionally rejected, so convert it yourself:

```python
from yarl import URL

include_archived = True
url = URL("https://api.example.com/items").with_query(
    include_archived="true" if include_archived else "false"
)
```

### Replace or append path segments

Path helpers return a new URL and normally drop the current query and fragment unless you keep them explicitly.

```python
from yarl import URL

url = URL("https://api.example.com/files/report.csv?download=1#latest")

print(url.with_path("/files/archive/report.csv", keep_query=True, keep_fragment=True))
print(url.with_name("summary.csv"))
print(url.with_suffix(".json"))
print(url / "exports")
print(url.joinpath("2026", "03"))
```

If you already have percent-encoded path segments, `joinpath(..., encoded=True)` skips auto-encoding for the provided pieces.

### Join a relative URL to a base URL

Use `join()` when you have a base URL and a separate relative URL:

```python
from yarl import URL

base = URL("https://docs.example.com/guides/index.html")
page = URL("python/quickstart.html")

print(base.join(page))
```

Useful derived forms:

```python
from yarl import URL

url = URL("https://user:pass@example.com:8443/path/to/file.txt?download=1#top")

print(url.origin())    # https://example.com:8443
print(url.relative())  # /path/to/file.txt?download=1#top
```

## Use In Pydantic Models

`yarl 1.23.0` adds seamless `pydantic` field support for `URL`.

```python
from pydantic import BaseModel
from yarl import URL


class ServiceConfig(BaseModel):
    base_url: URL


config = ServiceConfig(base_url="https://api.example.com/v1")
print(config.base_url / "users")
```

## Useful Accessors

Use decoded properties for application logic and `raw_` properties when you need the exact encoded form:

```python
from yarl import URL

url = URL("https://xn--n1agdj.xn--d1acufc/%D1%88%D0%BB%D1%8F%D1%85?a=1#frag")

print(url.host)        # decoded host
print(url.raw_host)    # IDNA form
print(url.path)        # decoded path
print(url.raw_path)    # encoded path
print(url.query)
print(url.fragment)
```

## Common Pitfalls

- `URL` is immutable. Always capture the returned value from `with_query()`, `with_path()`, `join()`, `/`, and similar helpers.
- `with_path()`, `with_name()`, `with_suffix()`, `/`, and `joinpath()` clean up query and fragment data unless you use the `keep_query` and `keep_fragment` options where supported.
- Do not pass Python booleans as query values. Convert them to your own string convention such as `"true"` or `"1"`.
- `encoded=True` is an escape hatch for already-encoded input. The docs warn that later URL manipulations can still re-quote parts of the URL, so do not assume it freezes every segment forever.
- `str(url)` is the encoded URL for HTTP requests and storage. Use `human_repr()` for logs or UI when you want readable Unicode.
- Since `yarl 1.13`, `URL.path` no longer decodes `%2F` into `/`. Do not treat encoded slashes as interchangeable with real path separators.

## Cache Controls

`yarl` caches IDNA conversion and host encoding globally. Most applications should ignore this, but long-running systems with unusual hostname churn can inspect or adjust cache behavior:

```python
import yarl

print(yarl.cache_info())
yarl.cache_configure(encode_host_size=1024)
```

## Official Sources

- Docs root: https://yarl.aio-libs.org/en/latest/
- Public API: https://yarl.aio-libs.org/en/stable/api/
- Changelog: https://yarl.aio-libs.org/en/stable/changes/
- PyPI package: https://pypi.org/project/yarl/
