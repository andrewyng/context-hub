---
name: rest-api
description: "Upstash - Serverless Redis, Vector DB & QStash REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "upstash,redis,vector,qstash,serverless,edge,cache,message-queue,api"
---

# Upstash REST API Reference (Python / httpx)

Upstash provides three HTTP-native serverless products: **Redis** (key-value cache/store),
**Vector** (vector database for AI/embeddings), and **QStash** (message queue & scheduler).
All three are accessed entirely over HTTPS REST APIs -- no persistent connections, no TCP sockets,
no VPC peering required. Ideal for serverless, edge, and Lambda environments.

## Golden Rule

> Every Upstash operation is a plain HTTPS request with a Bearer token.
> There is no proprietary binary protocol. If your runtime can make an HTTP call, it can talk to Upstash.

Never hard-code tokens in source. Always load them from environment variables or a secrets manager.

## Installation

```bash
pip install httpx
```

```python
import httpx, os

client = httpx.AsyncClient(timeout=10.0)
```

## Base URLs

Each product has its own base URL format, found in the [Upstash Console](https://console.upstash.com).

| Product | Base URL Pattern |
|---------|-----------------|
| **Redis** | `https://<region>-<name>-<id>.upstash.io` (instance-specific) |
| **Vector** | `https://<name>-<id>.upstash.io` (instance-specific) |
| **QStash** | `https://qstash.upstash.io` (fixed, global) |

```python
REDIS_URL   = os.environ["UPSTASH_REDIS_REST_URL"]
REDIS_TOKEN = os.environ["UPSTASH_REDIS_REST_TOKEN"]
VECTOR_URL   = os.environ["UPSTASH_VECTOR_REST_URL"]
VECTOR_TOKEN = os.environ["UPSTASH_VECTOR_REST_TOKEN"]
QSTASH_URL   = "https://qstash.upstash.io"
QSTASH_TOKEN = os.environ["QSTASH_TOKEN"]
```

## Authentication

All three products use a **Bearer token** in the `Authorization` header.

```python
def redis_headers():
    return {"Authorization": f"Bearer {REDIS_TOKEN}"}
def vector_headers():
    return {"Authorization": f"Bearer {VECTOR_TOKEN}"}
def qstash_headers():
    return {"Authorization": f"Bearer {QSTASH_TOKEN}"}
```

Redis also provides a read-only token restricted to GET, MGET, LRANGE, etc.

## Rate Limiting

Upstash uses **pay-per-request** pricing rather than traditional rate limits.

| Product | Free Tier | Throttling Behavior |
|---------|-----------|---------------------|
| **Redis** | 10,000 commands/day | Exceeding limits blocks writes or all traffic |
| **Vector** | 10,000 queries/day | Similar throttling on plan limits |
| **QStash** | 500 messages/day | Messages rejected with 429 |

No per-second rate limits on paid plans. Enable **auto-upgrade** to avoid hard throttling.

## Methods

### Redis Commands over HTTP

Redis commands are sent as **URL path segments** or as a **JSON array in a POST body**.

#### Path-Segment Style (simple commands)

```python
async def redis_set(key: str, value: str, ex: int | None = None) -> dict:
    path = f"/set/{key}/{value}"
    if ex is not None:
        path += f"/EX/{ex}"
    resp = await client.get(f"{REDIS_URL}{path}", headers=redis_headers())
    resp.raise_for_status()
    return resp.json()

async def redis_get(key: str) -> dict:
    resp = await client.get(f"{REDIS_URL}/get/{key}", headers=redis_headers())
    resp.raise_for_status()
    return resp.json()
```

#### POST Body Style (complex commands)

Required for values containing special characters, spaces, or binary data.

```python
async def redis_post(command: list) -> dict:
    resp = await client.post(REDIS_URL, headers=redis_headers(), json=command)
    resp.raise_for_status()
    return resp.json()

# Examples:
# await redis_post(["SET", "greeting", "hello world", "EX", 3600])
# await redis_post(["HSET", "user:1", "name", "Alice", "age", "30"])
# await redis_post(["LPUSH", "queue", "item1", "item2"])
```

#### Pipelining (batch non-atomic)

```python
async def redis_pipeline(commands: list[list]) -> list[dict]:
    resp = await client.post(f"{REDIS_URL}/pipeline", headers=redis_headers(), json=commands)
    resp.raise_for_status()
    return resp.json()
```

For atomic execution, use `/multi-exec` instead of `/pipeline`.

Redis REST responses return `{"result": "<value>"}` on success, `{"error": "..."}` on error.
For binary safety, add header `"Upstash-Encoding": "base64"`.

### Vector Operations

The Vector API uses POST/DELETE with JSON bodies. All endpoints optionally accept a `/{namespace}` suffix.

#### Upsert Vectors

```python
async def vector_upsert(vectors: list[dict], namespace: str = "") -> dict:
    """Each vector: {"id": str, "vector": list[float], "metadata": dict (opt), "data": str (opt)}"""
    path = f"/upsert/{namespace}" if namespace else "/upsert"
    resp = await client.post(f"{VECTOR_URL}{path}", headers=vector_headers(), json=vectors)
    resp.raise_for_status()
    return resp.json()
```

#### Query Vectors

```python
async def vector_query(
    vector: list[float], top_k: int = 10, filter: str = "",
    include_metadata: bool = True, include_vectors: bool = False, namespace: str = "",
) -> dict:
    path = f"/query/{namespace}" if namespace else "/query"
    body = {"vector": vector, "topK": top_k, "includeMetadata": include_metadata, "includeVectors": include_vectors}
    if filter:
        body["filter"] = filter
    resp = await client.post(f"{VECTOR_URL}{path}", headers=vector_headers(), json=body)
    resp.raise_for_status()
    return resp.json()
```

Additional Vector endpoints: `POST /fetch` (fetch by IDs), `DELETE /delete` (delete by IDs or filter).

### QStash Publishing & Scheduling

QStash base URL is always `https://qstash.upstash.io`. API version prefix: `/v2`.

#### Publish a Message

```python
async def qstash_publish(
    destination_url: str, body: dict | str, *,
    retries: int = 3, delay: str | None = None,
    callback_url: str | None = None, method: str = "POST",
    forward_headers: dict | None = None,
) -> dict:
    headers = {**qstash_headers(), "Content-Type": "application/json", "Upstash-Method": method, "Upstash-Retries": str(retries)}
    if delay: headers["Upstash-Delay"] = delay
    if callback_url: headers["Upstash-Callback"] = callback_url
    if forward_headers:
        for key, val in forward_headers.items():
            headers[f"Upstash-Forward-{key}"] = val
    resp = await client.post(
        f"{QSTASH_URL}/v2/publish/{destination_url}", headers=headers,
        json=body if isinstance(body, dict) else None,
        content=body if isinstance(body, str) else None,
    )
    resp.raise_for_status()
    return resp.json()
```

#### Create a Schedule (recurring)

```python
async def qstash_create_schedule(
    destination_url: str, cron: str, body: dict | str | None = None, *,
    retries: int = 3, method: str = "POST",
) -> dict:
    """Cron evaluated in UTC by default. Use "CRON_TZ=America/New_York 0 9 * * *" for other timezones."""
    headers = {**qstash_headers(), "Content-Type": "application/json",
               "Upstash-Cron": cron, "Upstash-Method": method, "Upstash-Retries": str(retries)}
    resp = await client.post(
        f"{QSTASH_URL}/v2/schedules/{destination_url}", headers=headers,
        json=body if isinstance(body, dict) else None,
        content=body if isinstance(body, str) else None,
    )
    resp.raise_for_status()
    return resp.json()
```

#### QStash Custom Headers Reference

| Header | Description |
|--------|-------------|
| `Upstash-Method` | HTTP method for the destination |
| `Upstash-Retries` | Retry attempts (default 3) |
| `Upstash-Delay` | Delay before first delivery (max 90 days) |
| `Upstash-Timeout` | Destination request timeout |
| `Upstash-Callback` / `Upstash-Failure-Callback` | URLs called on success/failure |
| `Upstash-Deduplication-Id` | Deduplicate identical messages |
| `Upstash-Cron` | Cron expression (schedules endpoint only) |
| `Upstash-Forward-*` | Headers forwarded to the destination |

## Error Handling

All three products return errors as JSON. HTTP status codes are consistent:

| Status | Meaning | Action |
|--------|---------|--------|
| **200** | Success | Parse `result` from JSON body |
| **400** | Bad request | Fix the request syntax |
| **401** | Invalid or missing token | Check `Authorization` header |
| **422** | Unprocessable entity (Vector) | Check vector dimensions match index |
| **429** | Rate limited / quota exceeded | Back off and retry |
| **500** | Server error | Retry with exponential backoff |

```python
class UpstashError(Exception):
    def __init__(self, status: int, message: str):
        self.status, self.message = status, message
        super().__init__(f"Upstash [{status}]: {message}")

async def checked_request(method: str, url: str, **kwargs) -> dict:
    import asyncio
    for attempt in range(3):
        try:
            resp = await client.request(method, url, **kwargs)
            if resp.status_code == 429:
                await asyncio.sleep(2 ** attempt)
                continue
            data = resp.json()
            if "error" in data:
                raise UpstashError(resp.status_code, data["error"])
            resp.raise_for_status()
            return data
        except httpx.TimeoutException:
            if attempt == 2: raise
    raise UpstashError(429, "Rate limited after max retries")
```

## Common Pitfalls

1. **URL-encoding in path segments** -- If Redis key/value contains `/`, `?`, `#`, or spaces, use the POST body style instead.
2. **Forgetting the Bearer prefix** -- Token must be `"Bearer <token>"`, not just `"<token>"`. Omitting "Bearer" results in a silent 401.
3. **Mixing up base URLs** -- Redis and Vector URLs are instance-specific. QStash is always `https://qstash.upstash.io`.
4. **Vector dimension mismatch** -- Upserting a vector with wrong dimensions returns 422. Match your embedding model's output.
5. **QStash cron timezone** -- Defaults to UTC. Prepend `CRON_TZ=America/New_York` for local time.
6. **QStash message size limit** -- Bodies limited to 1 MB. Store larger payloads elsewhere and send a reference URL.
7. **Not reusing httpx client** -- Creating a new `httpx.AsyncClient()` per request wastes connections. Instantiate once and reuse.
8. **Redis pipeline is non-atomic** -- `/pipeline` executes in order but not transactionally. Use `/multi-exec` for atomicity.
9. **Read-only tokens on write commands** -- Using a read-only token for SET/DEL silently fails. Use the standard token for writes.
