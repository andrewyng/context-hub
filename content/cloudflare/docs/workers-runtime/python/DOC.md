---
name: workers-runtime
description: "Cloudflare Workers runtime for building edge functions in Python with D1 databases, R2 storage, KV key-value, Durable Objects, and Queues bindings"
metadata:
  languages: "python"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-11"
  source: community
  tags: "cloudflare,workers,edge,python,d1,r2,kv,durable-objects,queues"
---

# Cloudflare Workers Runtime Coding Guidelines (Python)

You are a Cloudflare Workers expert. Help write Python code that runs on the Cloudflare Workers edge runtime.

## Golden Rule: Use Python Workers with Wrangler

Python Workers run natively on the Cloudflare edge using Pyodide (CPython compiled to WebAssembly).

**Tooling:** `wrangler` CLI (npm) for deploying Python Workers

**Installation:**
```bash
npm install -D wrangler
```

**CRITICAL:** Do NOT confuse these:
- Python Workers via `wrangler` = Python code that **runs on** the Cloudflare edge (this guide)
- `cloudflare` PyPI package = REST API SDK for **managing** Cloudflare resources — a different surface entirely

**IMPORTANT:** Do NOT use:
- `python-cloudflare` (third-party, deprecated)
- `cloudflare` PyPI package for edge compute (that is for API management only)

## Worker Entry Point

Python Workers use the `workers` module with a class-based handler:

```python
from workers import Response, Request

async def on_fetch(request, env):
    url = request.url
    if "/api/data" in url:
        return Response.json({"ok": True})
    return Response("Not Found", status=404)
```

**Alternative class-based syntax:**

```python
from workers import WorkerEntrypoint, Response

class Worker(WorkerEntrypoint):
    async def on_fetch(self, request):
        return Response("Hello from Python Workers!")
```

**Key concepts:**
- `request` — Standard Request object (similar to Web API)
- `env` — Contains all bindings (D1, R2, KV, etc.) as attributes
- `on_fetch` — The handler function invoked for each HTTP request

## Configuration (wrangler.toml)

```toml
name = "my-python-worker"
main = "src/entry.py"
compatibility_date = "2024-12-01"
compatibility_flags = ["python_workers"]

[vars]
API_URL = "https://api.example.com"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "my-bucket"

[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**IMPORTANT:** The `compatibility_flags = ["python_workers"]` flag is required for Python Workers.

## D1 Database Binding

```python
async def on_fetch(request, env):
    # Single row
    user = await env.DB.prepare(
        "SELECT * FROM users WHERE id = ?"
    ).bind(user_id).first()

    # All rows
    result = await env.DB.prepare(
        "SELECT * FROM users WHERE active = ?"
    ).bind(1).all()
    users = result.results

    # Write operation
    meta = await env.DB.prepare(
        "INSERT INTO users (name, email) VALUES (?, ?)"
    ).bind("Alice", "alice@example.com").run()
    print(meta.meta.last_row_id, meta.meta.changes)

    return Response.json({"users": users})
```

### Batch Operations

```python
async def on_fetch(request, env):
    results = await env.DB.batch([
        env.DB.prepare("INSERT INTO users (name) VALUES (?)").bind("Alice"),
        env.DB.prepare("INSERT INTO users (name) VALUES (?)").bind("Bob"),
        env.DB.prepare("SELECT COUNT(*) as count FROM users"),
    ])
    count = results[2].results[0]["count"]
    return Response.json({"count": count})
```

### Raw Queries

```python
await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)"
)
```

## R2 Object Storage Binding

```python
async def on_fetch(request, env):
    # Upload
    body = await request.bytes()
    await env.BUCKET.put("uploads/file.bin", body)

    # Download
    obj = await env.BUCKET.get("uploads/file.bin")
    if obj is None:
        return Response("Not Found", status=404)
    data = await obj.bytes()
    return Response(data, headers={"Content-Type": "application/octet-stream"})

    # Check existence
    head = await env.BUCKET.head("uploads/file.bin")

    # Delete
    await env.BUCKET.delete("uploads/file.bin")
```

### Listing Objects

```python
listed = await env.BUCKET.list(prefix="uploads/", limit=100)
for obj in listed.objects:
    print(obj.key, obj.size, obj.uploaded)

# Pagination
if listed.truncated:
    next_page = await env.BUCKET.list(prefix="uploads/", cursor=listed.cursor)
```

## KV Key-Value Store Binding

```python
async def on_fetch(request, env):
    # Write
    await env.KV.put("session:abc123", '{"userId": 1, "role": "admin"}')
    await env.KV.put("cache:page", html_content, expiration_ttl=3600)

    # Read
    value = await env.KV.get("session:abc123")
    json_value = await env.KV.get("config:settings", type="json")

    # Read with metadata
    result = await env.KV.get_with_metadata("user:1")
    value, metadata = result.value, result.metadata

    # Delete
    await env.KV.delete("session:abc123")

    # List keys
    keys = await env.KV.list(prefix="session:", limit=50)
    for key in keys.keys:
        print(key.name, key.expiration)

    return Response.json({"value": value})
```

**IMPORTANT:** KV is eventually consistent. Writes may take up to 60 seconds to propagate globally.

## Durable Objects Binding

### Defining a Durable Object

```python
from workers import DurableObject, Response

class Counter(DurableObject):
    async def increment(self):
        count = await self.ctx.storage.get("count") or 0
        count += 1
        await self.ctx.storage.put("count", count)
        return count

    async def get_count(self):
        return await self.ctx.storage.get("count") or 0
```

### Accessing from a Worker

```python
async def on_fetch(request, env):
    obj_id = env.COUNTER.id_from_name("global")
    stub = env.COUNTER.get(obj_id)

    count = await stub.increment()
    return Response(f"Count: {count}")
```

### Alarms

```python
import time

class Scheduler(DurableObject):
    async def schedule(self, delay_ms):
        await self.ctx.storage.set_alarm(time.time() * 1000 + delay_ms)

    async def alarm(self):
        await self.process_scheduled_work()
```

## Queues Binding

### Producer

```python
async def on_fetch(request, env):
    await env.MY_QUEUE.send({"user_id": 123, "action": "signup"})

    await env.MY_QUEUE.send_batch([
        {"body": {"event": "page_view", "page": "/home"}},
        {"body": {"event": "page_view", "page": "/about"}},
    ])

    return Response("Queued")
```

### Consumer

```python
async def queue(batch, env):
    for msg in batch.messages:
        try:
            await process_event(msg.body)
            msg.ack()
        except Exception:
            msg.retry()
```

## Error Handling

```python
async def on_fetch(request, env):
    try:
        data = await env.DB.prepare("SELECT * FROM users").all()
        return Response.json(data.results)
    except Exception as e:
        print(f"Error: {e}")
        return Response("Internal Server Error", status=500)
```

**Common pitfalls:**
- **Floating async calls:** Always `await` async operations or they will be silently dropped
- **CPU time limits:** Free plan = 10ms, Paid = 30s
- **Python package limitations:** Only pure-Python packages and select compiled packages via Pyodide are supported
- **No filesystem access:** Workers run in a sandboxed environment — use KV, R2, or D1 for persistence

**Supported Python packages (via Pyodide):**
- Standard library modules (json, re, datetime, collections, etc.)
- `micropip` for installing pure-Python packages at runtime
- Select compiled packages: numpy, pandas, scipy, etc. (check Pyodide compatibility)

## Testing

### Local Development

```bash
wrangler dev              # Starts local dev server
wrangler dev --remote     # Run against real Cloudflare APIs
```

### Unit Testing

```python
import pytest

@pytest.mark.asyncio
async def test_handler():
    # Create mock request and env
    request = MockRequest("http://localhost/api/data")
    env = MockEnv()

    response = await on_fetch(request, env)
    assert response.status == 200
```

**IMPORTANT:** Python Workers testing is best done via `wrangler dev` with integration-style tests. The Vitest pool (`@cloudflare/vitest-pool-workers`) is designed for JavaScript — for Python, use `wrangler dev --remote` with HTTP client tests.

## Useful Links

- Python Workers documentation: https://developers.cloudflare.com/workers/languages/python/
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- Wrangler CLI reference: https://developers.cloudflare.com/workers/wrangler/
- D1 documentation: https://developers.cloudflare.com/d1/
- R2 documentation: https://developers.cloudflare.com/r2/
- KV documentation: https://developers.cloudflare.com/kv/
- Pyodide packages: https://pyodide.org/en/stable/usage/packages-in-pyodide.html
