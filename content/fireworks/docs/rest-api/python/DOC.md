---
name: rest-api
description: "Fireworks AI - Enterprise Fast Inference API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "fireworks,inference,llm,fast-inference,chat,embeddings,function-calling,api"
---

# Fireworks AI REST API - Python (httpx)

## Golden Rule

Fireworks AI exposes an **OpenAI-compatible** REST API. Any code targeting the OpenAI `/v1/chat/completions`, `/v1/completions`, or `/v1/embeddings` endpoints works with Fireworks by swapping the base URL and API key. All examples below use **`httpx`** (async) for HTTP calls -- do NOT use `requests` or the Fireworks SDK.

---

## Installation

```bash
pip install httpx
```

---

## Base URL

```
https://api.fireworks.ai/inference/v1
```

All endpoint paths are appended to this base (e.g., `/chat/completions`).

---

## Authentication

Every request must include a **Bearer** token in the `Authorization` header. Obtain an API key from the Fireworks dashboard at <https://app.fireworks.ai/settings/users/api-keys>.

```python
import os

FIREWORKS_API_KEY = os.environ["FIREWORKS_API_KEY"]

headers = {
    "Authorization": f"Bearer {FIREWORKS_API_KEY}",
    "Content-Type": "application/json",
}
```

---

## Rate Limiting

### Serverless Tier Limits

| Condition | RPM (spike arrest max) |
|---|---|
| No payment method | 10 RPM |
| With payment method | Up to 6,000 RPM (dynamic) |

Soft baseline limits (scale up with sustained usage):
- 1 request/second
- 1,000 input tokens/second
- 200 output tokens/second

### Spending Tiers

| Tier | Cumulative Spend | Monthly Budget Cap |
|---|---|---|
| 1 | Valid payment method | $50 |
| 2 | $50 | $500 |
| 3 | $500 | $5,000 |
| 4 | $5,000 | $50,000 |
| Unlimited | Contact support | Unlimited |

### Response Headers

Monitor rate-limit state via these headers:
- `x-ratelimit-limit-requests` -- current minimum limit
- `x-ratelimit-remaining-requests` -- remaining capacity
- `x-ratelimit-over-limit: yes` -- near-capacity warning

When rate-limited, the API returns **HTTP 429**. Use exponential backoff with jitter for retries.

---

## Methods

### 1. Chat Completions

**Endpoint:** `POST /chat/completions`

#### Basic Request

```python
import httpx
import os

FIREWORKS_API_KEY = os.environ["FIREWORKS_API_KEY"]
BASE_URL = "https://api.fireworks.ai/inference/v1"

async def chat_completion():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {FIREWORKS_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "accounts/fireworks/models/deepseek-v3p1",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Explain quantum entanglement briefly."},
                ],
                "max_tokens": 256,
                "temperature": 0.7,
                "top_p": 1.0,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
```

#### Streaming Request

```python
import httpx
import json
import os

FIREWORKS_API_KEY = os.environ["FIREWORKS_API_KEY"]
BASE_URL = "https://api.fireworks.ai/inference/v1"

async def chat_completion_stream():
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {FIREWORKS_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "accounts/fireworks/models/deepseek-v3p1",
                "messages": [
                    {"role": "user", "content": "Write a haiku about fast inference."},
                ],
                "max_tokens": 128,
                "temperature": 0.7,
                "stream": True,
            },
            timeout=60.0,
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    payload = line[len("data: "):]
                    if payload.strip() == "[DONE]":
                        break
                    chunk = json.loads(payload)
                    delta = chunk["choices"][0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        print(content, end="", flush=True)
```

#### Parameters Reference

| Parameter | Type | Default | Description |
|---|---|---|---|
| `model` | string | **required** | Model identifier, e.g. `accounts/fireworks/models/deepseek-v3p1` |
| `messages` | array | **required** | Conversation messages (`role` + `content`) |
| `temperature` | float | 1.0 | Sampling temperature (0-2) |
| `top_p` | float | 1.0 | Nucleus sampling threshold (0-1) |
| `top_k` | int | -- | Top-k filtering (0-100) |
| `max_tokens` | int | -- | Maximum tokens to generate |
| `n` | int | 1 | Number of completions (1-128) |
| `stop` | string/array | -- | Up to 4 stop sequences |
| `stream` | bool | false | Enable SSE streaming |
| `frequency_penalty` | float | 0.0 | Penalize repeated tokens (-2 to 2) |
| `presence_penalty` | float | 0.0 | Penalize tokens already present (-2 to 2) |
| `tools` | array | -- | Function definitions for tool calling |
| `tool_choice` | string/object | "auto" | Control tool invocation: `auto`, `none`, `required` |
| `response_format` | object | -- | Force output: `json_object`, `json_schema`, `grammar`, `text` |
| `seed` | int | -- | For deterministic sampling |

#### Response Shape

```json
{
  "id": "cmpl-abc123",
  "object": "chat.completion",
  "created": 1711234567,
  "model": "accounts/fireworks/models/deepseek-v3p1",
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
    "prompt_tokens": 42,
    "completion_tokens": 100,
    "total_tokens": 142
  }
}
```

---

### 2. Text Completions

**Endpoint:** `POST /completions`

Uses raw string prompts instead of structured messages. Useful for lower-level prompt control.

```python
import httpx
import os

FIREWORKS_API_KEY = os.environ["FIREWORKS_API_KEY"]
BASE_URL = "https://api.fireworks.ai/inference/v1"

async def text_completion():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/completions",
            headers={
                "Authorization": f"Bearer {FIREWORKS_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "accounts/fireworks/models/deepseek-v3p1",
                "prompt": "The three laws of thermodynamics are:\n1.",
                "max_tokens": 256,
                "temperature": 0.3,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["text"]
```

Additional parameters beyond chat completions: `prompt` (string, array, or token IDs), `echo` (repeat prompt in response), `logprobs` (include log probabilities).

---

### 3. Embeddings

**Endpoint:** `POST /embeddings`

```python
import httpx
import os

FIREWORKS_API_KEY = os.environ["FIREWORKS_API_KEY"]
BASE_URL = "https://api.fireworks.ai/inference/v1"

async def get_embeddings(texts: list[str]):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/embeddings",
            headers={
                "Authorization": f"Bearer {FIREWORKS_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "accounts/fireworks/models/qwen3-embedding-8b",
                "input": texts,
                "dimensions": 512,  # optional: variable-length embeddings
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return [item["embedding"] for item in data["data"]]
```

Available embedding models include:
- `accounts/fireworks/models/qwen3-embedding-8b` (and 4b, 0p6b variants)
- BAAI, nomic-ai, mixedbread-ai, sentence-transformers hosted models
- Any LLM on Fireworks can also be queried for embeddings

The `dimensions` parameter allows generating variable-length embedding vectors.

---

### 4. Function Calling (Tool Use)

Fireworks supports OpenAI-compatible function calling. Use models that support the `tools` parameter (check `supportsTools` in model metadata). Use low temperature (0.0-0.3) for reliable function calling.

```python
import httpx
import json
import os

FIREWORKS_API_KEY = os.environ["FIREWORKS_API_KEY"]
BASE_URL = "https://api.fireworks.ai/inference/v1"

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name"},
                    "units": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit",
                    },
                },
                "required": ["city"],
            },
        },
    }
]

async def function_calling_example():
    async with httpx.AsyncClient() as client:
        # Step 1: Send request with tools
        response = await client.post(
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {FIREWORKS_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "accounts/fireworks/models/kimi-k2-instruct-0905",
                "messages": [
                    {"role": "user", "content": "What's the weather in Tokyo?"},
                ],
                "tools": tools,
                "tool_choice": "auto",
                "temperature": 0.1,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

        assistant_message = data["choices"][0]["message"]
        tool_calls = assistant_message.get("tool_calls", [])

        if not tool_calls:
            return assistant_message["content"]

        # Step 2: Execute tool and return result
        tool_call = tool_calls[0]
        args = json.loads(tool_call["function"]["arguments"])

        # Simulate tool execution
        weather_result = {"temp": 22, "condition": "sunny", "city": args["city"]}

        # Step 3: Send tool result back
        response = await client.post(
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {FIREWORKS_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "accounts/fireworks/models/kimi-k2-instruct-0905",
                "messages": [
                    {"role": "user", "content": "What's the weather in Tokyo?"},
                    assistant_message,
                    {
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "content": json.dumps(weather_result),
                    },
                ],
                "tools": tools,
                "temperature": 0.1,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        final = response.json()
        return final["choices"][0]["message"]["content"]
```

#### tool_choice Options

| Value | Behavior |
|---|---|
| `"auto"` | Model decides whether to call tools (default) |
| `"none"` | Disables tool invocation |
| `"required"` | Forces at least one tool call |
| `{"type": "function", "function": {"name": "..."}}` | Forces a specific function |

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|---|---|---|
| 400 | Bad Request -- invalid input or malformed request | Validate parameters |
| 401 | Unauthorized -- invalid API key | Check API key |
| 402 | Payment Required -- no paid plan or exceeded usage | Check billing |
| 403 | Forbidden -- insufficient permissions | Verify API key permissions |
| 404 | Not Found -- bad endpoint or unavailable model | Check URL and model name |
| 408 | Request Timeout | Retry with backoff |
| 413 | Payload Too Large | Reduce input size |
| 422 | Validation Error | Fix request body schema |
| 429 | Too Many Requests -- rate limited | Exponential backoff with jitter |
| 500 | Internal Server Error | Contact Fireworks support |
| 502 | Bad Gateway | Retry; check status page |
| 503 | Service Unavailable | Retry later |
| 504 | Gateway Timeout | Retry; shorten prompts |

### Retry Pattern with Exponential Backoff

```python
import httpx
import asyncio
import random
import os

FIREWORKS_API_KEY = os.environ["FIREWORKS_API_KEY"]
BASE_URL = "https://api.fireworks.ai/inference/v1"

async def request_with_retry(
    payload: dict,
    endpoint: str = "/chat/completions",
    max_retries: int = 5,
    base_delay: float = 1.0,
):
    headers = {
        "Authorization": f"Bearer {FIREWORKS_API_KEY}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            try:
                response = await client.post(
                    f"{BASE_URL}{endpoint}",
                    headers=headers,
                    json=payload,
                    timeout=60.0,
                )
                if response.status_code == 429:
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    await asyncio.sleep(delay)
                    continue
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                if e.response.status_code in (500, 502, 503, 504) and attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    await asyncio.sleep(delay)
                    continue
                raise
    raise RuntimeError(f"Request failed after {max_retries} retries")
```

---

## Common Pitfalls

1. **Model name format** -- Fireworks model identifiers use the `accounts/fireworks/models/<name>` prefix. Omitting the prefix results in a 404.

2. **Streaming parse errors** -- SSE lines are prefixed with `data: `. The stream ends with `data: [DONE]`. Always check for `[DONE]` before parsing JSON.

3. **Timeout too low** -- Long generations can exceed default httpx timeouts (5s). Set `timeout=60.0` or higher for large `max_tokens` values.

4. **Function calling temperature** -- Use low temperature (0.0-0.3) for tool-calling requests. Higher values cause hallucinated arguments.

5. **Rate limit soft scaling** -- Soft limits start low (1 req/s) and double roughly hourly with sustained usage. New accounts hitting 429 early should ramp up gradually.

6. **No payment method** -- Without a payment method on file, the account is capped at 10 RPM. Add a payment method for dynamic scaling up to 6,000 RPM.

7. **Token counting** -- The `usage` object in responses reports `prompt_tokens`, `completion_tokens`, and `total_tokens`. Monitor these for cost control.

8. **Content-Type header** -- Always include `Content-Type: application/json`. Missing it causes 400 errors.

9. **Embeddings dimensions** -- The `dimensions` parameter is optional. If omitted, the model returns its native vector length. Not all models support truncated dimensions.

10. **tool_call_id mismatch** -- When returning tool results, the `tool_call_id` in the tool message must match the `id` from the model's `tool_calls` response. Mismatches cause validation errors.
