---
name: package
description: "PostgREST Python client for sync and async queries, filters, CRUD operations, and RPC calls"
metadata:
  languages: "python"
  versions: "2.28.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "postgrest,python,postgres,rest,api"
---

# PostgREST Python Package Guide

## Golden Rule

Use the `postgrest` package from PyPI. The published Read the Docs site still reflects the older `postgrest-py` package and a `0.15.0` API reference, but PyPI currently publishes `postgrest 2.28.0`.

The maintainers document two client classes with the same query-builder interface:

- `SyncPostgrestClient` for synchronous code
- `AsyncPostgrestClient` for async code

The package metadata currently requires:

- Python 3.9+
- PostgreSQL 13+
- PostgREST 11+

## Install

```bash
python -m pip install "postgrest==2.28.0"
```

Common alternatives:

```bash
uv add "postgrest==2.28.0"
poetry add "postgrest==2.28.0"
```

Environment variables used in the examples below:

```bash
POSTGREST_URL=http://localhost:3000
POSTGREST_BEARER_TOKEN=your-jwt-or-service-token
POSTGREST_SCHEMA=public
```

`POSTGREST_URL` should be the base URL for your PostgREST server.

## Initialize A Client

### Async client

```python
import os

from postgrest import AsyncPostgrestClient

client = AsyncPostgrestClient(
    os.environ["POSTGREST_URL"],
    schema=os.getenv("POSTGREST_SCHEMA", "public"),
    timeout=10,
)

client.auth(f"Bearer {os.environ['POSTGREST_BEARER_TOKEN']}")
```

If you are already inside an async app, prefer the async client. The maintainer README uses it in an `async with` block so connections are closed automatically:

```python
import asyncio
import os

from postgrest import AsyncPostgrestClient


async def main() -> None:
    async with AsyncPostgrestClient(
        os.environ["POSTGREST_URL"],
        schema=os.getenv("POSTGREST_SCHEMA", "public"),
    ) as client:
        client.auth(f"Bearer {os.environ['POSTGREST_BEARER_TOKEN']}")

        response = await (
            client.from_("countries")
            .select("id", "name", "capital")
            .order("name")
            .limit(10)
            .execute()
        )

        print(response.data)


asyncio.run(main())
```

### Sync client

```python
import os

from postgrest import SyncPostgrestClient

client = SyncPostgrestClient(
    os.environ["POSTGREST_URL"],
    schema=os.getenv("POSTGREST_SCHEMA", "public"),
    timeout=10,
)

client.auth(f"Bearer {os.environ['POSTGREST_BEARER_TOKEN']}")

try:
    response = client.from_("countries").select("id", "name").limit(5).execute()
    print(response.data)
finally:
    client.aclose()
```

## Authentication And Schema Selection

The client exposes `auth()` for bearer-token or basic-auth configuration and `schema()` to switch the active schema.

Bearer token:

```python
client.auth(f"Bearer {os.environ['POSTGREST_BEARER_TOKEN']}")
```

Basic auth:

```python
client.auth(None, username="postgrest_user", password="secret-password")
```

Switch schema for a request chain:

```python
analytics = client.schema("analytics")
response = analytics.from_("daily_metrics").select("*").limit(1).execute()
```

The auth example in the maintainer docs includes the `"Bearer "` prefix. Do not pass only the raw token string unless your server expects a custom authorization value.

## Common Query Patterns

### Read rows

```python
response = (
    client.from_("countries")
    .select("id", "name", "capital")
    .eq("name", "France")
    .execute()
)

print(response.data)
```

### Read one row

Use `single()` when exactly one row should match:

```python
response = (
    client.from_("countries")
    .select("id", "name", "capital")
    .eq("id", 1)
    .single()
    .execute()
)

country = response.data
```

Use `maybe_single()` when zero rows is also acceptable:

```python
response = (
    client.from_("countries")
    .select("id", "name")
    .eq("iso_code", "fr")
    .maybe_single()
    .execute()
)
```

### Filter, search, sort, and paginate

```python
response = (
    client.from_("countries")
    .select("id", "name")
    .ilike("name", "%land%")
    .order("name")
    .limit(20)
    .execute()
)
```

Use `or_()` when you need a raw PostgREST OR expression:

```python
response = (
    client.from_("countries")
    .select("id", "name")
    .or_("name.eq.France,name.eq.Spain")
    .execute()
)
```

### Insert rows

```python
response = (
    client.from_("countries")
    .insert(
        {
            "id": 1,
            "name": "France",
            "capital": "Paris",
        }
    )
    .execute()
)
```

Insert multiple rows:

```python
response = (
    client.from_("countries")
    .insert(
        [
            {"id": 1, "name": "France"},
            {"id": 2, "name": "Spain"},
        ]
    )
    .execute()
)
```

### Upsert rows

```python
response = (
    client.from_("countries")
    .upsert(
        {"id": 1, "name": "France", "capital": "Paris"},
        on_conflict="id",
    )
    .execute()
)
```

### Update rows

```python
response = (
    client.from_("countries")
    .update({"capital": "Paris"})
    .eq("id", 1)
    .execute()
)
```

### Delete rows

```python
response = (
    client.from_("countries")
    .delete()
    .eq("id", 1)
    .execute()
)
```

### Call PostgreSQL functions with RPC

```python
response = client.rpc("hello_world").execute()
print(response.data)
```

With parameters:

```python
response = client.rpc(
    "search_countries",
    {"prefix": "fr"},
).execute()
```

## Responses And Errors

The API reference documents these response and error types:

- `APIResponse.data`: returned rows
- `APIResponse.count`: populated when the request asks PostgREST to return a count
- `APIError`: exposes `message`, `code`, `hint`, and `details`

Minimal error handling:

```python
from postgrest import APIError, SyncPostgrestClient

client = SyncPostgrestClient("http://localhost:3000")

try:
    response = client.from_("countries").select("*").execute()
except APIError as exc:
    print(exc.message)
    print(exc.code)
    print(exc.hint)
    print(exc.details)
finally:
    client.aclose()
```

## Important Pitfalls

- Install `postgrest`, not `postgrest-py`. The hosted docs still mention the old package name.
- Call `execute()` at the end of a query chain. The builder methods only define the request.
- For bearer auth, pass the full header value, for example `Bearer <token>`, because that is how the maintainer docs demonstrate `auth()`.
- Use `from_()` or `table()`. The API reference marks `from_table()` as deprecated.
- Close sync clients with `aclose()` when you do not use an async context manager.
- Keep the base URL pointed at your PostgREST endpoint. The client does not discover it for you.

## Version Notes For 2.28.0

- PyPI shows `postgrest 2.28.0` released on February 10, 2026.
- The official docs URL still serves an older `0.15.0` documentation set under the historic `postgrest-py` name.
- The current maintainer README and PyPI metadata are the safest sources for package name, supported runtime versions, and the current async client examples.

## Official Sources

- PyPI package: https://pypi.org/project/postgrest/
- Maintainer docs root: https://postgrest-py.readthedocs.io/en/latest/
- Client API reference: https://postgrest-py.readthedocs.io/en/latest/api/client.html
- Request builder API reference: https://postgrest-py.readthedocs.io/en/latest/api/request_builder.html
- Response API reference: https://postgrest-py.readthedocs.io/en/latest/api/responses.html
- Exceptions API reference: https://postgrest-py.readthedocs.io/en/latest/api/exceptions.html
- Maintainer repository: https://github.com/supabase/postgrest-py
