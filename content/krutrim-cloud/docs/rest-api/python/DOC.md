---
name: rest-api
description: "Krutrim Cloud - Ola's Indian AI LLM Inference API (OpenAI-compatible)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "krutrim,ola,indian-ai,llm,inference,chat-completions,openai-compatible,multilingual,indic,cloud,api"
---

# Krutrim Cloud API

> **Golden Rule:** Krutrim Cloud (by Ola) provides an **OpenAI-compatible** REST API for LLM inference. You can use `httpx` directly or the `openai` Python client pointed at Krutrim's base URL. The API supports chat completions, image generation, and TTS. Auth is via API key from the Krutrim Cloud console. Models include Krutrim-2 (12B, 128K context, 22 Indian languages + English).

## Installation

```bash
pip install httpx
```

Alternatively, since the API is OpenAI-compatible:

```bash
pip install openai
```

## Base URL

```
https://cloud.olakrutrim.com/v1
```

Environment variable override: `KRUTRIM_CLOUD_BASE_URL`

## Authentication

**Type:** API Key (Bearer token)

```python
import httpx

API_KEY = "your-krutrim-api-key"  # From https://cloud.olakrutrim.com console
BASE_URL = "https://cloud.olakrutrim.com/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

client = httpx.AsyncClient(
    base_url=BASE_URL,
    headers=headers,
    timeout=60.0
)
```

Sign up at: https://cloud.olakrutrim.com (redirects to https://www.olakrutrim.com/cloud)

API keys are managed in the Krutrim Cloud console under your account settings.

## Available Models

| Model | Parameters | Context | Languages |
|---|---|---|---|
| `Krutrim-spectre-v2` | — | 4K tokens | English + Indic |
| `Meta-Llama-3-8B-Instruct` | 8B | 8K tokens | English |
| `Mistral-7B-Instruct` | 7B | 8K tokens | English |
| `Krutrim-2-12B` | 12B | 128K tokens | English + 22 Indian languages |

Krutrim-2 is natively multilingual, trained on web data, code, math, and Indic language corpora.

## Rate Limiting

Not publicly documented. Expect HTTP 429 responses when limits are exceeded. Contact Krutrim support for plan-specific limits.

## Methods

### `chat_completions` (OpenAI-compatible)

**Endpoint:** `POST /chat/completions`

Generate text completions using chat-style messaging. Follows the OpenAI Chat Completions API format.

| Parameter | Type | Default |
|---|---|---|
| `model` | `str` | **required** (e.g., `"Krutrim-spectre-v2"`) |
| `messages` | `list` | **required** (array of `{"role": ..., "content": ...}`) |
| `max_tokens` | `int` | model default |
| `temperature` | `float` | `1.0` |
| `top_p` | `float` | `1.0` |
| `stream` | `bool` | `false` |

```python
import httpx

API_KEY = "your-krutrim-api-key"
BASE_URL = "https://cloud.olakrutrim.com/v1"

async def chat_completion():
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "Krutrim-spectre-v2",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant fluent in Indian languages."},
                    {"role": "user", "content": "Translate 'Good morning' to Hindi, Tamil, and Telugu."}
                ],
                "max_tokens": 256,
                "temperature": 0.7
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
```

### `chat_completions_streaming`

**Endpoint:** `POST /chat/completions` (with `stream: true`)

Stream responses token-by-token using Server-Sent Events (SSE).

```python
import httpx

async def stream_chat():
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "Krutrim-spectre-v2",
                "messages": [
                    {"role": "user", "content": "Write a short poem in Hindi about monsoon."}
                ],
                "max_tokens": 512,
                "stream": True
            }
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    import json
                    chunk = json.loads(line[6:])
                    delta = chunk["choices"][0].get("delta", {})
                    if "content" in delta:
                        print(delta["content"], end="", flush=True)
```

### Using OpenAI Client (Alternative)

Since Krutrim is OpenAI-compatible, you can use the `openai` library directly:

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key="your-krutrim-api-key",
    base_url="https://cloud.olakrutrim.com/v1"
)

response = await client.chat.completions.create(
    model="Krutrim-spectre-v2",
    messages=[
        {"role": "user", "content": "What are the major festivals of India?"}
    ],
    max_tokens=512
)
print(response.choices[0].message.content)
```

## Error Handling

```python
import httpx

try:
    response = await client.post(
        f"{BASE_URL}/chat/completions",
        headers=headers,
        json=payload
    )
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Invalid API key -- check KRUTRIM_CLOUD_API_KEY")
    elif e.response.status_code == 429:
        print("Rate limited -- back off and retry")
    elif e.response.status_code == 400:
        print(f"Bad request (invalid model or params): {e.response.text}")
    elif e.response.status_code == 404:
        print("Model not found -- check available models")
    else:
        print(f"Krutrim API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- **OpenAI-compatible format**: Use standard OpenAI chat completion request structure (`messages` array with `role`/`content`)
- **Model names are case-sensitive**: Use exact model names (e.g., `"Krutrim-spectre-v2"`, not `"krutrim-spectre-v2"`)
- **Python version requirement**: Official SDK requires Python 3.10-3.12; httpx works on any Python 3.7+
- **Base URL**: The cloud console URL `cloud.olakrutrim.com` redirects to `olakrutrim.com/cloud` for the web UI, but the API base URL is `https://cloud.olakrutrim.com/v1`
- **Set generous timeouts**: LLM inference can be slow, use `timeout=60.0` or higher
- **Krutrim-2 context window**: 128K tokens, but respect the model-specific max token limits
- **Indian language support**: Krutrim-2 natively supports 22 scheduled Indian languages; other hosted models (Llama, Mistral) are primarily English
- **No public rate limit docs**: Monitor for 429 responses and implement exponential backoff
- **Official Python SDK exists** (`pip install krutrim-cloud`) but is less documented than using httpx/openai directly
- Sign up at https://www.olakrutrim.com/cloud to get API credentials
