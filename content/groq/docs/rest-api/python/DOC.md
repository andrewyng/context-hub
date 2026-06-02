---
name: rest-api
description: "Groq - Fast LLM Inference REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "groq,inference,llm,fast-inference,chat,completions,whisper,vision,api"
---

# Groq REST API Guide (Python / httpx)

## Golden Rule

Use this entry when you need direct HTTP access to Groq's inference API without the official SDK. All examples use `httpx` with async. For the SDK approach, see `groq/docs/package/`.

## Installation

```bash
pip install httpx
```

Or with `uv`:

```bash
uv add httpx
```

## Base URL

```
https://api.groq.com/openai/v1
```

Groq exposes an OpenAI-compatible REST surface. All endpoint paths below are relative to this base.

## Authentication

Every request requires a Bearer token in the `Authorization` header. Obtain your key from the GroqCloud console at `console.groq.com/keys`.

```bash
export GROQ_API_KEY="gsk_..."
```

```python
import os

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json",
}
```

## Rate Limiting

Groq enforces rate limits at the organization level using multiple metrics:

| Metric | Meaning |
|--------|---------|
| RPM | Requests per minute |
| RPD | Requests per day |
| TPM | Tokens per minute |
| TPD | Tokens per day |
| ASH | Audio seconds per hour |
| ASD | Audio seconds per day |

Limits vary by plan tier and model. Free-tier examples:

| Model | RPM | RPD | TPM | TPD |
|-------|-----|-----|-----|-----|
| llama-3.1-8b-instant | 30 | 14,400 | 6,000 | 500,000 |
| llama-3.3-70b-versatile | 30 | 1,000 | 12,000 | 100,000 |

**Rate limit headers** returned on every response:

| Header | Description |
|--------|-------------|
| `x-ratelimit-limit-requests` | Daily request quota |
| `x-ratelimit-limit-tokens` | Per-minute token quota |
| `x-ratelimit-remaining-requests` | Requests remaining today |
| `x-ratelimit-remaining-tokens` | Tokens remaining this minute |
| `x-ratelimit-reset-requests` | Time until daily quota resets |
| `x-ratelimit-reset-tokens` | Time until minute quota resets |
| `retry-after` | Seconds to wait (only on 429) |

Cached tokens do not count toward rate limits.

## Methods

### Chat Completions

**POST** `/chat/completions`

The primary endpoint for text generation. Accepts a conversation history and returns a model response.

```python
import httpx
import os

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
BASE_URL = "https://api.groq.com/openai/v1"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json",
}


async def chat_completion():
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a concise assistant."},
            {"role": "user", "content": "What is LoRA fine-tuning?"},
        ],
        "temperature": 0.7,
        "max_completion_tokens": 512,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/chat/completions",
            headers=HEADERS,
            json=payload,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
```

**Key request parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model` | string | required | Model ID (e.g. `llama-3.3-70b-versatile`) |
| `messages` | array | required | Conversation history with `role` and `content` |
| `temperature` | number | 1 | Randomness (0-2). Lower is more deterministic |
| `top_p` | number | 1 | Nucleus sampling threshold (0-1) |
| `max_completion_tokens` | integer | varies | Upper bound on generated tokens |
| `stop` | string/array | null | Up to 4 stop sequences |
| `stream` | boolean | false | Enable server-sent events streaming |
| `tools` | array | null | Function definitions (max 128) |
| `tool_choice` | string/object | auto | `none`, `auto`, `required`, or specific function |
| `parallel_tool_calls` | boolean | true | Allow simultaneous tool invocations |
| `response_format` | object | null | `{"type": "json_object"}` or JSON schema |
| `reasoning_format` | string | null | `hidden`, `raw`, or `parsed` |

**Response structure:**

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "llama-3.3-70b-versatile",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "LoRA (Low-Rank Adaptation) is..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 100,
    "total_tokens": 125
  },
  "system_fingerprint": "fp_..."
}
```

### Chat Completions with Streaming

**POST** `/chat/completions` with `"stream": true`

Returns server-sent events. Each chunk contains a delta of the response.

```python
import httpx
import os

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
BASE_URL = "https://api.groq.com/openai/v1"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json",
}


async def chat_stream():
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "user", "content": "Explain gradient descent in three sentences."},
        ],
        "stream": True,
    }
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            f"{BASE_URL}/chat/completions",
            headers=HEADERS,
            json=payload,
            timeout=60.0,
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    import json
                    chunk = json.loads(line[6:])
                    delta = chunk["choices"][0]["delta"].get("content", "")
                    print(delta, end="", flush=True)
```

### Chat Completions with Tool Calling

**POST** `/chat/completions` with `tools` array

```python
import httpx
import json
import os

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
BASE_URL = "https://api.groq.com/openai/v1"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json",
}


async def chat_with_tools():
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "City name"},
                    },
                    "required": ["location"],
                },
            },
        }
    ]
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "user", "content": "What is the weather in Tokyo?"},
        ],
        "tools": tools,
        "tool_choice": "auto",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/chat/completions",
            headers=HEADERS,
            json=payload,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        message = data["choices"][0]["message"]
        if message.get("tool_calls"):
            for tc in message["tool_calls"]:
                print(f"Function: {tc['function']['name']}")
                print(f"Args: {tc['function']['arguments']}")
```

### Audio Transcription

**POST** `/audio/transcriptions`

Converts speech audio to text using Whisper models. Uses multipart form data.

```python
import httpx
import os

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
BASE_URL = "https://api.groq.com/openai/v1"


async def transcribe_audio(file_path: str):
    async with httpx.AsyncClient() as client:
        with open(file_path, "rb") as f:
            resp = await client.post(
                f"{BASE_URL}/audio/transcriptions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                files={"file": (os.path.basename(file_path), f, "audio/wav")},
                data={
                    "model": "whisper-large-v3",
                    "response_format": "json",
                    "language": "en",
                },
                timeout=60.0,
            )
            resp.raise_for_status()
            return resp.json()["text"]
```

### List Models

**GET** `/models`

Returns all models available to your account.

```python
import httpx
import os

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
BASE_URL = "https://api.groq.com/openai/v1"
HEADERS = {"Authorization": f"Bearer {GROQ_API_KEY}"}


async def list_models():
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/models",
            headers=HEADERS,
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return [m["id"] for m in data["data"]]
```

## Error Handling

Groq returns standard HTTP status codes with a JSON error body.

**Error response structure:**

```json
{
  "error": {
    "message": "Descriptive error message",
    "type": "invalid_request_error"
  }
}
```

**Status codes:**

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | No action needed |
| 400 | Bad Request | Fix request syntax or parameters |
| 401 | Unauthorized | Check API key |
| 403 | Forbidden | Check resource permissions |
| 404 | Not Found | Verify endpoint URL or resource ID |
| 413 | Payload Too Large | Reduce request body size |
| 422 | Unprocessable Entity | Fix semantic errors in request |
| 429 | Rate Limited | Back off and retry after `retry-after` seconds |
| 498 | Flex Capacity Exceeded | Retry later |
| 500 | Internal Server Error | Retry later |
| 502 | Bad Gateway | Retry later |
| 503 | Service Unavailable | Wait and retry |

**Robust error handling with retry:**

```python
import httpx
import asyncio
import os

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
BASE_URL = "https://api.groq.com/openai/v1"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json",
}


async def chat_with_retry(payload: dict, max_retries: int = 3):
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            resp = await client.post(
                f"{BASE_URL}/chat/completions",
                headers=HEADERS,
                json=payload,
                timeout=30.0,
            )
            if resp.status_code == 429:
                retry_after = float(resp.headers.get("retry-after", 2))
                await asyncio.sleep(retry_after)
                continue
            if resp.status_code >= 500:
                await asyncio.sleep(2 ** attempt)
                continue
            resp.raise_for_status()
            return resp.json()
    raise RuntimeError("Max retries exceeded")
```

## Common Pitfalls

1. **Missing `Content-Type` header.** POST requests must include `Content-Type: application/json`. The `httpx` `json=` parameter sets this automatically, but if you use `content=` or `data=`, set it manually.

2. **Confusing `max_tokens` with `max_completion_tokens`.** The Groq API uses `max_completion_tokens`. Using `max_tokens` may work for backward compatibility but `max_completion_tokens` is the canonical parameter.

3. **Not handling streaming termination.** Streamed responses end with `data: [DONE]`. Always check for this sentinel before parsing JSON.

4. **Audio endpoints require multipart form data.** Do not send JSON to `/audio/transcriptions` or `/audio/translations`. Use `files=` and `data=` parameters in httpx.

5. **Rate limit scope is per-organization, not per-key.** Multiple API keys under the same org share the same rate limits.

6. **Timeout too short for large completions.** Default httpx timeout is 5 seconds. Always set an explicit `timeout=` for inference calls (30-60 seconds recommended).

7. **Forgetting to check `finish_reason`.** A response with `finish_reason: "length"` means the output was truncated. Check this field and increase `max_completion_tokens` if needed.

8. **Using the wrong base URL.** The base is `https://api.groq.com/openai/v1`, not `https://api.groq.com/v1`. The `/openai` prefix is required for the OpenAI-compatible surface.
