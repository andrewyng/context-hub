---
name: rest-api
description: "Cerebras - Ultra-Fast LLM Inference API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "cerebras,inference,llm,fast-inference,chat,completions,ai,api"
---

# Cerebras Inference REST API (Python / httpx)

## Golden Rule

Cerebras provides an **OpenAI-compatible** REST API running on custom Wafer-Scale Engine hardware, delivering inference speeds of 2,000-3,000+ tokens/sec. The API surface mirrors OpenAI's Chat Completions format, so if you know the OpenAI API, you already know this one. Use `httpx` (async) for all HTTP calls. Always stream responses for the best latency experience. Never hardcode your API key; use environment variables.

---

## Installation

```bash
pip install httpx
```

No Cerebras SDK is required. The REST API is fully accessible with any HTTP client. We use `httpx` for its native async/streaming support.

---

## Base URL

```
https://api.cerebras.ai/v1
```

All endpoints are relative to this base.

---

## Authentication

Cerebras uses Bearer token authentication via an API key.

1. Sign up at [https://cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Navigate to **API Keys** and create a new key
3. Export it as an environment variable:

```bash
export CEREBRAS_API_KEY="csk-your-key-here"
```

Every request must include the header:

```
Authorization: Bearer <CEREBRAS_API_KEY>
```

---

## Available Models

| Model | Speed | Input Price | Output Price | Notes |
|---|---|---|---|---|
| `llama3.1-8b` | ~2,200 tok/s | $0.10/M | $0.10/M | Fast, lightweight |
| `gpt-oss-120b` | ~3,000 tok/s | $0.35/M | $0.75/M | Strong general-purpose |
| `qwen-3-235b-a22b-instruct-2507` | ~1,400 tok/s | $0.60/M | $1.20/M | Preview |
| `zai-glm-4.7` | ~1,000 tok/s | $2.25/M | $2.75/M | Preview, reasoning support |

Use the `/v1/models` endpoint to fetch the current list programmatically.

---

## Rate Limiting

Rate limits are applied at the **organization level** (not per-user) using a **token bucket algorithm** that continuously replenishes quota.

### Free Tier

| Model | TPM | RPM | TPH | RPH | TPD | RPD |
|---|---|---|---|---|---|---|
| `gpt-oss-120b` | 64K | 30 | 1M | 900 | 1M | 14.4K |
| `llama3.1-8b` | 60K | 30 | 1M | 900 | 1M | 14.4K |
| `qwen-3-235b-a22b-instruct-2507` | 60K | 30 | 1M | 900 | 1M | 14.4K |
| `zai-glm-4.7` | 60K | 10 | 1M | 100 | 1M | 100 |

### PayGo (Developer) Tier

| Model | TPM | RPM |
|---|---|---|
| `gpt-oss-120b` | 1M | 1K |
| `llama3.1-8b` | 2M | 2K |
| `qwen-3-235b-a22b-instruct-2507` | 250K | 250 |
| `zai-glm-4.7` | 500K | 500 |

When a rate limit is hit, the API returns HTTP `429`. Requests are pre-rejected if the estimated token consumption exceeds available quota. Response headers provide real-time usage visibility.

---

## Methods

### Chat Completions (Non-Streaming)

**POST** `/v1/chat/completions`

```python
import httpx
import os

CEREBRAS_API_KEY = os.environ["CEREBRAS_API_KEY"]
BASE_URL = "https://api.cerebras.ai/v1"

async def chat_completion():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {CEREBRAS_API_KEY}",
            },
            json={
                "model": "llama3.1-8b",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Explain quantum computing in two sentences."},
                ],
                "temperature": 0.7,
                "max_completion_tokens": 256,
                "top_p": 1.0,
            },
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()

        content = data["choices"][0]["message"]["content"]
        usage = data["usage"]
        time_info = data["time_info"]

        print(f"Response: {content}")
        print(f"Tokens: {usage['prompt_tokens']} in, {usage['completion_tokens']} out")
        print(f"Total time: {time_info['total_time']:.3f}s")
        return data
```

#### Response Shape

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "llama3.1-8b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 48,
    "total_tokens": 73
  },
  "time_info": {
    "queue_time": 0.001,
    "prompt_time": 0.005,
    "completion_time": 0.018,
    "total_time": 0.024,
    "created": 1710000000
  }
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `model` | string | Yes | Model ID (e.g., `llama3.1-8b`, `gpt-oss-120b`) |
| `messages` | array | Yes | Conversation messages (`role` + `content`) |
| `temperature` | float | No | Randomness 0-1.5 (default model-dependent) |
| `top_p` | float | No | Nucleus sampling (alternative to temperature) |
| `max_completion_tokens` | int | No | Max tokens in the response |
| `stream` | bool | No | Enable streaming (default `false`) |
| `seed` | int | No | For deterministic output attempts |
| `stop` | array | No | Up to 4 stop sequences |
| `response_format` | object | No | `text` (default), `json_schema`, or `json_object` |
| `tools` | array | No | Function/tool definitions |
| `tool_choice` | string/object | No | `none`, `auto`, `required`, or specific function |
| `reasoning_effort` | string | No | `low`, `medium`, `high` (`gpt-oss-120b` only) |
| `logprobs` | bool | No | Return token log probabilities |
| `top_logprobs` | int | No | 0-20 most likely tokens per position |
| `user` | string | No | End-user identifier for abuse monitoring |

---

### Chat Completions (Streaming)

Set `"stream": true` to receive Server-Sent Events (SSE). The `usage` and `time_info` fields are included only in the **final chunk**.

```python
import httpx
import os
import json

CEREBRAS_API_KEY = os.environ["CEREBRAS_API_KEY"]
BASE_URL = "https://api.cerebras.ai/v1"

async def chat_completion_stream():
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            f"{BASE_URL}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {CEREBRAS_API_KEY}",
            },
            json={
                "model": "llama3.1-8b",
                "messages": [
                    {"role": "user", "content": "Write a haiku about fast inference."},
                ],
                "stream": True,
                "temperature": 0.7,
                "max_completion_tokens": 128,
            },
            timeout=60.0,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                payload = line.removeprefix("data: ")
                if payload.strip() == "[DONE]":
                    break
                chunk = json.loads(payload)
                delta = chunk["choices"][0].get("delta", {})
                content = delta.get("content", "")
                if content:
                    print(content, end="", flush=True)
            print()  # newline at end
```

---

### List Models

**GET** `/v1/models`

```python
import httpx
import os

CEREBRAS_API_KEY = os.environ["CEREBRAS_API_KEY"]
BASE_URL = "https://api.cerebras.ai/v1"

async def list_models():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/models",
            headers={"Authorization": f"Bearer {CEREBRAS_API_KEY}"},
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

        for model in data["data"]:
            print(f"{model['id']} (owned by {model['owned_by']})")
        return data
```

#### Response Shape

```json
{
  "object": "list",
  "data": [
    {
      "id": "llama3.1-8b",
      "object": "model",
      "created": 1721692800,
      "owned_by": "Meta"
    }
  ]
}
```

---

## Error Handling

The API returns standard HTTP status codes. Implement retry logic with exponential backoff for transient errors.

| HTTP Status | Error Type | Description |
|---|---|---|
| 400 | BadRequestError | Malformed request or invalid parameters |
| 401 | AuthenticationError | Missing or invalid API key |
| 402 | PaymentRequired | Billing issue on your account |
| 403 | PermissionDeniedError | Insufficient permissions |
| 404 | NotFoundError | Invalid endpoint or model not found |
| 422 | UnprocessableEntityError | Valid JSON but semantically invalid |
| 429 | RateLimitError | Rate limit exceeded; back off and retry |
| 500 | InternalServerError | Server-side issue; retry with backoff |
| 503 | ServiceUnavailable | Temporary overload; retry with backoff |

### Retry-Eligible Errors

Automatically retry these with exponential backoff: `408`, `429`, `500+`, and connection errors.

```python
import httpx
import os
import json
import asyncio

CEREBRAS_API_KEY = os.environ["CEREBRAS_API_KEY"]
BASE_URL = "https://api.cerebras.ai/v1"

async def chat_with_retries(messages: list, max_retries: int = 3):
    """Chat completion with exponential backoff retry."""
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries + 1):
            try:
                response = await client.post(
                    f"{BASE_URL}/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {CEREBRAS_API_KEY}",
                    },
                    json={
                        "model": "llama3.1-8b",
                        "messages": messages,
                        "temperature": 0,
                    },
                    timeout=60.0,
                )
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError as e:
                status = e.response.status_code
                if status in (429, 500, 502, 503) and attempt < max_retries:
                    wait = 2 ** attempt  # 1s, 2s, 4s
                    print(f"HTTP {status}, retrying in {wait}s...")
                    await asyncio.sleep(wait)
                    continue
                raise
            except httpx.ConnectError:
                if attempt < max_retries:
                    wait = 2 ** attempt
                    await asyncio.sleep(wait)
                    continue
                raise
```

---

## Common Pitfalls

1. **Using `requests` instead of `httpx`** -- The `requests` library has no native async or streaming support. Always use `httpx` with `AsyncClient` for non-blocking I/O and `client.stream()` for SSE consumption.

2. **Not streaming by default** -- Cerebras delivers tokens at 2,000-3,000+ tok/s. If you wait for the full response, you add unnecessary latency. Always set `"stream": true` for user-facing applications.

3. **Ignoring `time_info`** -- Unlike OpenAI, Cerebras returns a `time_info` object with `queue_time`, `prompt_time`, `completion_time`, and `total_time`. Use these to monitor performance and detect queue congestion.

4. **Hardcoding the API key** -- Never embed `csk-...` keys in source code. Use `os.environ["CEREBRAS_API_KEY"]` or a secrets manager.

5. **Not handling SSE `[DONE]` sentinel** -- The stream terminates with `data: [DONE]`. If you try to JSON-parse this, you will get an error. Always check for it before parsing.

6. **Assuming OpenAI parity for all features** -- While the API is OpenAI-compatible, not all OpenAI features are supported (e.g., vision, embeddings, fine-tuning endpoints). Check the models endpoint for current capabilities.

7. **Confusing `max_tokens` with `max_completion_tokens`** -- Cerebras uses `max_completion_tokens` (matching newer OpenAI convention). Using the old `max_tokens` parameter may not work as expected.

8. **Ignoring organization-level rate limits** -- Rate limits are per-organization, not per-key. Multiple services sharing one org will share the same token and request budgets.

9. **Not setting timeouts** -- The default `httpx` timeout may be too short or too long. Set explicit `timeout=60.0` to match the API's default behavior and avoid hanging requests.

10. **Free tier `zai-glm-4.7` limits** -- This model has significantly lower free-tier RPM/RPH/RPD limits (10/100/100) compared to other models. Plan your usage accordingly.
