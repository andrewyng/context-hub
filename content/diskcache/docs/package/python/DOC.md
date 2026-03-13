---
name: package
description: "diskcache Python package guide for local persistent caching, TTL-based lookups, memoization, and multi-worker cache access"
metadata:
  languages: "python"
  versions: "5.6.3"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "diskcache,python,caching,sqlite,persistence,memoization"
---

# diskcache Python Package Guide

## Golden Rule

Use `diskcache` when you need a local, disk-backed cache with a dictionary-like API. Start with `Cache` for normal application caching, and switch to `FanoutCache` when multiple worker processes will write to the same cache directory.

`diskcache` is a local library, not a hosted service: there are no API keys or remote endpoints to configure. The main setup decision is choosing a writable cache directory that matches your deployment model.

## Install

Pin the package version your project expects:

```bash
python -m pip install "diskcache==5.6.3"
```

## Configure A Cache Directory

Use an environment variable so local development, containers, and production can each choose an appropriate writable path:

```bash
export DISKCACHE_DIR="./.cache/diskcache"
```

In production, point `DISKCACHE_DIR` at a persistent directory owned by the app user.

## Initialize The Cache

```python
import os
from diskcache import Cache

CACHE_DIR = os.getenv("DISKCACHE_DIR", "./.cache/diskcache")

cache = Cache(CACHE_DIR)
```

Close the cache cleanly during shutdown:

```python
cache.close()
```

## Common Workflows

### Store and read values with TTL

```python
import os
from diskcache import Cache

cache = Cache(os.getenv("DISKCACHE_DIR", "./.cache/diskcache"))

cache.set("user:42", {"id": 42, "name": "Ada"}, expire=300)
user = cache.get("user:42")

if user is None:
    user = {"id": 42, "name": "Ada"}
    cache.set("user:42", user, expire=300)

print(user["name"])
cache.close()
```

`expire` is in seconds. Use `get()` with a default when cache misses are expected:

```python
count = cache.get("pageviews", default=0)
```

### Use dictionary-style access

`Cache` supports dictionary-style reads and writes for simple cases:

```python
from diskcache import Cache

cache = Cache("./.cache/diskcache")

cache["healthcheck"] = "ok"

if "healthcheck" in cache:
    print(cache["healthcheck"])

del cache["healthcheck"]
cache.close()
```

Use `set(..., expire=...)` instead of item assignment when you need TTLs or other write options.

### Memoize expensive function calls

Use the built-in decorator when function inputs map cleanly to cached outputs:

```python
import os
from diskcache import Cache

cache = Cache(os.getenv("DISKCACHE_DIR", "./.cache/diskcache"))

@cache.memoize(expire=60)
def load_profile(user_id: int) -> dict:
    print("cache miss")
    return {"id": user_id, "name": f"user-{user_id}"}

print(load_profile(42))
print(load_profile(42))

cache.close()
```

This is the simplest way to cache repeated reads from a database, filesystem, or slow local computation.

### Use `FanoutCache` for multi-worker writes

If your app uses multiple worker processes and they all write into the same cache directory, prefer `FanoutCache`:

```python
import os
from diskcache import FanoutCache

cache = FanoutCache(
    os.getenv("DISKCACHE_DIR", "./.cache/diskcache"),
    shards=8,
    timeout=1,
)

cache.set("job:123", "queued", expire=600)
status = cache.get("job:123")

print(status)
cache.close()
```

Start with the default behavior unless you know your workload needs different shard counts. Reach for `FanoutCache` when background workers, task queues, or prefork web servers share one cache path.

### Remove expired entries during maintenance

If your application uses many TTL-based keys, run expiration cleanup as part of a maintenance path:

```python
from diskcache import Cache

cache = Cache("./.cache/diskcache")
cache.expire()
cache.close()
```

To remove everything and start over:

```python
cache.clear()
```

## Important Pitfalls

- Choose the cache directory deliberately. A relative path is fine for local development, but production containers often need an explicit persistent volume or writable app data directory.
- Use `FanoutCache` instead of `Cache` when many worker processes will write concurrently to the same location.
- Prefer `set()` and `get()` in application code when you need TTLs, defaults, or more explicit cache behavior. Dictionary syntax is convenient, but it is easier to miss expiration behavior there.
- Cached values are Python objects stored locally. Treat the cache directory as application data and avoid sharing it across trust boundaries.
- Call `close()` on shutdown in long-running processes so file handles and SQLite resources are released cleanly.

## Version Notes For 5.6.3

- The examples here pin `diskcache==5.6.3` because that is the target package version for this doc.
- `diskcache` is intentionally local-first. If you actually need a remote shared cache across hosts, use a networked cache service instead of trying to stretch one on-disk directory across machines.

## Official Sources

- Maintainer docs: https://grantjenks.com/docs/diskcache/
- PyPI package: https://pypi.org/project/diskcache/
