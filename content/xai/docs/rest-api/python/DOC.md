---
name: rest-api
description: "xAI (Grok) API Integration"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "xai,grok,llm,ai,chat,completions,api,integration"
---

# xAI (Grok) API

> **Golden Rule:** xAI has no official Python SDK. Use `httpx` (async) or `requests` (sync) for direct REST API access. The API is OpenAI-compatible. Always handle rate limits, retries, and error responses explicitly.

## Installation

```bash
pip install httpx
```

## Base URL

`https://api.x.ai/v1`

## Authentication

**Type:** Bearer Token (API Key)

```python
import httpx

API_KEY = "your-xai-api-key"
BASE_URL = "https://api.x.ai/v1"

headers = {"Authorization": f"Bearer {API_KEY}"}
client = httpx.AsyncClient(headers=headers)
```

## Rate Limiting

**Limit:** 100 requests/minute

The API enforces rate limits. Check `X-RateLimit-Remaining` and `Retry-After` response headers. Implement exponential backoff on 429 responses.

## Methods

### `list_models`

**Endpoint:** `GET /models`

List available Grok models

**Returns:** JSON response with `data` array of model objects

```python
response = await client.get(f"{BASE_URL}/models")
response.raise_for_status()
data = response.json()
models = data.get("data", [])
```

### `create_chat_completion`

**Endpoint:** `POST /chat/completions`

Create a chat completion (OpenAI-compatible format)

| Parameter | Type | Default |
|---|---|---|
| `model` | `str` | **required** |
| `messages` | `list` | **required** |

**Returns:** JSON response with `choices` array

```python
payload = {
    "model": "grok-2",
    "messages": [
        {"role": "user", "content": "Hello, Grok!"}
    ]
}
response = await client.post(f"{BASE_URL}/chat/completions", json=payload)
response.raise_for_status()
data = response.json()
reply = data["choices"][0]["message"]["content"]
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/chat/completions", json=payload)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check your API key")
    elif e.response.status_code == 429:
        retry_after = e.response.headers.get("Retry-After", "60")
        print(f"Rate limited -- retry after {retry_after}s")
    else:
        print(f"xAI API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Always call `response.raise_for_status()` to catch HTTP errors
- Use `async with httpx.AsyncClient() as client:` to auto-close connections
- Handle 429 (rate limit) responses with exponential backoff
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
- For POST requests, pass data via `json=` parameter (not `data=`) to auto-set Content-Type
- The API follows OpenAI's chat completions format -- `messages` must be a list of `{"role": ..., "content": ...}` objects
