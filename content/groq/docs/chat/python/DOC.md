---
name: chat
description: "Groq API for fast LLM inference with chat completions, streaming, and function calling using an OpenAI-compatible interface"
metadata:
  languages: "python"
  versions: "0.15.0"
  revision: 1
  updated-on: "2026-03-07"
  source: community
  tags: "groq,chat,llm,ai,inference"
---

# Groq API Coding Guidelines (Python)

You are a Groq API coding expert. Help me write code using the Groq API via the official SDK.

## Golden Rule: Use the Correct and Current SDK

Always use the official Groq Python SDK.

- **PyPI Package:** `groq`

**Installation:**
```bash
pip install groq
```

**Import Pattern:**
```python
from groq import Groq
```

## Initialization and API Key
```python
import os
from groq import Groq

# Uses GROQ_API_KEY environment variable automatically
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
```

Get a free API key at https://console.groq.com/keys

## Models

Default choices:
- **General tasks:** `llama-3.3-70b-versatile`
- **Low latency / simple tasks:** `llama-3.1-8b-instant`
- **Instruction following:** `mixtral-8x7b-32768`

## Chat Completions
```python
from groq import Groq

client = Groq()

completion = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain fast LLM inference in one sentence."},
    ],
    max_completion_tokens=1024,
)

print(completion.choices[0].message.content)
```

## Streaming
```python
stream = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Count to 5."}],
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")
```

## Async
```python
import asyncio
from groq import AsyncGroq

async def main():
    client = AsyncGroq()
    completion = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Hello"}],
    )
    print(completion.choices[0].message.content)

asyncio.run(main())
```

## Function Calling (Tools)
```python
completion = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "What is the weather in London?"}],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get current weather for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "City and country"},
                    },
                    "required": ["location"],
                },
            },
        }
    ],
    tool_choice="auto",
)
```

## Error Handling
```python
import groq

try:
    client.chat.completions.create(...)
except groq.RateLimitError:
    # Back off and retry
    pass
except groq.AuthenticationError:
    print("Invalid API key")
except groq.APIError as e:
    print(e.status_code, e.message)
```

## Gotchas

- `n > 1` (multiple completions) is not supported
- Use `max_completion_tokens`, not `max_tokens` (deprecated)
- Check `x-ratelimit-*` response headers for per-model rate limits
- `logprobs` and `logit_bias` are not supported

## Useful Links

- **Documentation:** https://console.groq.com/docs
- **API Keys:** https://console.groq.com/keys
- **Models:** https://console.groq.com/docs/models
- **Rate Limits:** https://console.groq.com/docs/rate-limits