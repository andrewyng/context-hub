---
name: rest-api
description: "fal.ai - Generative Media Model API (Image/Video/Audio)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "fal,image-generation,video,audio,flux,stable-diffusion,generative-ai,api"
---

# fal.ai REST API Reference (Python / httpx)

## Golden Rule

Always use the **queue-based async pattern** for production workloads. Submit a request, poll for status, then fetch the result. Direct synchronous calls (`fal.run`) lack automatic retries and should only be used for quick prototyping. The queue guarantees delivery -- requests are never dropped, retried automatically up to 10 times on transient failures (503, 504, connection errors), and the queue size is unlimited.

## Installation

```bash
pip install httpx python-dotenv
```

All examples in this document use `httpx` with `asyncio`. Do **not** use `requests` (blocking) or the `fal-client` SDK -- this guide covers raw HTTP calls only.

## Base URL

| Purpose | Base URL |
|---------|----------|
| Queue submit / status / result | `https://queue.fal.run` |
| Synchronous (direct) call | `https://fal.run` |

Endpoint pattern: `https://queue.fal.run/{owner}/{model}` (e.g., `fal-ai/flux/schnell`).

## Authentication

Every request must include the API key in the `Authorization` header:

```
Authorization: Key {FAL_KEY}
```

Obtain a key at <https://fal.ai/dashboard/keys>. Store it in the `FAL_KEY` environment variable:

```bash
export FAL_KEY="your-api-key-here"
```

There are two key scopes:

| Scope | Permissions |
|-------|------------|
| **API** | Model inference and deployed endpoints; platform API access |
| **ADMIN** | Everything in API plus CLI operations, app management, admin platform APIs |

Start with **API** scope. Only create ADMIN keys when you need deployment capabilities.

## Rate Limiting

fal enforces **concurrency limits** on in-progress requests (queued requests do not count):

| Account Tier | Concurrent Requests |
|-------------|---------------------|
| New account | 2 |
| Self-serve max | 40 (scales with credit purchases over last 4 weeks) |
| Enterprise | Custom (contact sales) |

When you exceed the limit, the API returns **HTTP 429** with:
- Body field `type`: `concurrent_requests_limit`
- Header `X-Fal-needs-retry: 1`

Retry with exponential backoff.

## Methods

### 1. Synchronous Submit (Direct Call)

Sends a blocking request and returns the result directly. No queue, no automatic retries.

```python
import httpx
import os

FAL_KEY = os.environ["FAL_KEY"]
BASE = "https://fal.run"
MODEL = "fal-ai/flux/schnell"

async def generate_sync():
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{BASE}/{MODEL}",
            headers={
                "Authorization": f"Key {FAL_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "prompt": "a sunset over mountains, cinematic lighting",
                "image_size": "landscape_4_3",
                "num_inference_steps": 4,
                "num_images": 1,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        print(data["images"][0]["url"])
```

### 2. Queue Submit

Submit work to the queue and receive a `request_id` for tracking.

**Endpoint:** `POST https://queue.fal.run/{model_id}`

```python
import httpx
import os

FAL_KEY = os.environ["FAL_KEY"]
QUEUE_BASE = "https://queue.fal.run"
MODEL = "fal-ai/flux/schnell"

async def queue_submit():
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{QUEUE_BASE}/{MODEL}",
            headers={
                "Authorization": f"Key {FAL_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "prompt": "a sunset over mountains, cinematic lighting",
                "image_size": "landscape_4_3",
                "num_inference_steps": 4,
                "num_images": 1,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        # data contains: request_id, response_url, status_url, cancel_url, queue_position
        return data["request_id"]
```

**Response:**

```json
{
  "request_id": "abc-123-def",
  "response_url": "https://queue.fal.run/fal-ai/flux/schnell/requests/abc-123-def",
  "status_url": "https://queue.fal.run/fal-ai/flux/schnell/requests/abc-123-def/status",
  "cancel_url": "https://queue.fal.run/fal-ai/flux/schnell/requests/abc-123-def/cancel",
  "queue_position": 0
}
```

**Optional request headers:**

| Header | Purpose |
|--------|---------|
| `X-Fal-Request-Timeout` | Server-side deadline in seconds |
| `X-Fal-Queue-Priority` | Set to `"low"` for deprioritized jobs |
| `X-Fal-Runner-Hint` | Route to same runner (session affinity) |
| `X-Fal-No-Retry` | Set to `1` to skip automatic retries |

### 3. Queue Status

Poll for the current state of a queued request.

**Endpoint:** `GET https://queue.fal.run/{model_id}/requests/{request_id}/status`

Add `?logs=1` to include runner log output.

```python
async def queue_status(client: httpx.AsyncClient, request_id: str):
    resp = await client.get(
        f"{QUEUE_BASE}/{MODEL}/requests/{request_id}/status",
        headers={"Authorization": f"Key {FAL_KEY}"},
        params={"logs": 1},
    )
    resp.raise_for_status()
    return resp.json()
```

**Status lifecycle:**

| Status | Meaning | Notable Fields |
|--------|---------|----------------|
| `IN_QUEUE` | Waiting for a runner | `queue_position` |
| `IN_PROGRESS` | Actively processing | `logs[]` |
| `COMPLETED` | Result ready to fetch | `logs[]`, `metrics.inference_time` |

**Streaming status** (SSE) is also available at:
`GET https://queue.fal.run/{model_id}/requests/{request_id}/status/stream?logs=1`

### 4. Queue Result

Fetch the final output once status is `COMPLETED`.

**Endpoint:** `GET https://queue.fal.run/{model_id}/requests/{request_id}`

```python
async def queue_result(client: httpx.AsyncClient, request_id: str):
    resp = await client.get(
        f"{QUEUE_BASE}/{MODEL}/requests/{request_id}",
        headers={"Authorization": f"Key {FAL_KEY}"},
    )
    resp.raise_for_status()
    return resp.json()
```

**Image model response (e.g., flux/schnell):**

```json
{
  "images": [
    {
      "url": "https://fal.media/files/...",
      "width": 1024,
      "height": 768,
      "content_type": "image/jpeg"
    }
  ],
  "prompt": "a sunset over mountains, cinematic lighting",
  "seed": 42,
  "timings": {},
  "has_nsfw_concepts": [false]
}
```

### 5. Cancel Request

**Endpoint:** `PUT https://queue.fal.run/{model_id}/requests/{request_id}/cancel`

| Response Code | Body Status | Meaning |
|---------------|-------------|---------|
| 202 | `CANCELLATION_REQUESTED` | Cancel accepted |
| 400 | `ALREADY_COMPLETED` | Too late to cancel |
| 404 | `NOT_FOUND` | Unknown request ID |

## Complete Queue Workflow Example

```python
import asyncio
import httpx
import os

FAL_KEY = os.environ["FAL_KEY"]
QUEUE_BASE = "https://queue.fal.run"
MODEL = "fal-ai/flux/schnell"


async def generate_image(prompt: str) -> dict:
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=300) as client:
        # 1. Submit to queue
        submit_resp = await client.post(
            f"{QUEUE_BASE}/{MODEL}",
            headers=headers,
            json={
                "prompt": prompt,
                "image_size": "landscape_4_3",
                "num_inference_steps": 4,
                "num_images": 1,
            },
        )
        submit_resp.raise_for_status()
        request_id = submit_resp.json()["request_id"]
        print(f"Submitted: {request_id}")

        # 2. Poll for completion
        while True:
            status_resp = await client.get(
                f"{QUEUE_BASE}/{MODEL}/requests/{request_id}/status",
                headers={"Authorization": f"Key {FAL_KEY}"},
                params={"logs": 1},
            )
            status_resp.raise_for_status()
            status_data = status_resp.json()
            status = status_data["status"]
            print(f"Status: {status}")

            if status == "COMPLETED":
                break
            elif status == "IN_QUEUE":
                await asyncio.sleep(0.5)
            elif status == "IN_PROGRESS":
                await asyncio.sleep(0.3)
            else:
                raise RuntimeError(f"Unexpected status: {status}")

        # 3. Fetch result
        result_resp = await client.get(
            f"{QUEUE_BASE}/{MODEL}/requests/{request_id}",
            headers={"Authorization": f"Key {FAL_KEY}"},
        )
        result_resp.raise_for_status()
        return result_resp.json()


async def main():
    result = await generate_image("a sunset over mountains, cinematic lighting")
    for img in result["images"]:
        print(f"Image URL: {img['url']} ({img['width']}x{img['height']})")


if __name__ == "__main__":
    asyncio.run(main())
```

## Error Handling

| HTTP Code | Meaning | Action |
|-----------|---------|--------|
| 400 | Bad request / invalid parameters | Fix the request body |
| 401 | Invalid or missing API key | Check `FAL_KEY` and `Authorization` header |
| 404 | Model or request ID not found | Verify model path and request ID |
| 422 | Validation error (wrong types, missing fields) | Check input schema for the model |
| 429 | Concurrency limit exceeded | Retry with exponential backoff; check `X-Fal-needs-retry` header |
| 500 | Internal server error | Automatic retry if using queue; otherwise retry manually |
| 503/504 | Service unavailable / gateway timeout | Queue auto-retries up to 10 times; for sync calls, retry manually |

Example error handling with httpx:

```python
import httpx

async def safe_request(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    try:
        resp = await client.request(method, url, **kwargs)
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            # Concurrency limit -- back off and retry
            raise
        elif e.response.status_code == 401:
            raise ValueError("Invalid FAL_KEY -- check your API key")
        else:
            print(f"HTTP {e.response.status_code}: {e.response.text}")
            raise
    except httpx.TimeoutException:
        print("Request timed out -- consider increasing timeout or using queue")
        raise
```

## Common Pitfalls

1. **Using `requests` instead of `httpx`** -- The `requests` library is synchronous and blocks the event loop. Use `httpx.AsyncClient` for async workflows.

2. **Polling the result endpoint before COMPLETED** -- The result endpoint (`GET .../requests/{request_id}`) only returns data after the status is `COMPLETED`. Always check status first.

3. **Forgetting `Content-Type: application/json`** -- The submit endpoint expects JSON. Omitting this header can cause 400 errors.

4. **Using `Bearer` instead of `Key`** -- The auth header format is `Authorization: Key {FAL_KEY}`, not `Bearer`. Using Bearer will return 401.

5. **Not handling 429 concurrency limits** -- New accounts start with only 2 concurrent requests. Queue submissions still succeed (they wait), but direct sync calls will fail with 429.

6. **Polling too aggressively** -- Use 300-500ms intervals. For long-running models (video generation), increase to 1-2 seconds. Alternatively, use the SSE streaming status endpoint or webhooks.

7. **Ignoring `sync_mode` vs queue** -- Setting `sync_mode: true` in the request body is a model-level parameter that returns base64 data URIs instead of CDN URLs. It is not the same as calling the synchronous `fal.run` endpoint.

8. **Hardcoding model paths** -- Model IDs can change. Use the model page on fal.ai to confirm the current endpoint path (e.g., `fal-ai/flux/schnell`, `fal-ai/stable-diffusion-v35-large`).

9. **Not setting timeouts** -- Always configure `httpx.AsyncClient(timeout=...)`. Image models typically complete in 2-10 seconds; video models can take minutes.

10. **Missing `num_inference_steps`** -- Each model has a default, but explicitly setting this (e.g., 4 for flux/schnell) ensures predictable speed and quality tradeoffs.
