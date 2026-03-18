---
name: chat
description: "MiniMax API for chat completions, streaming, function calling, and vision via OpenAI-compatible endpoint"
metadata:
  languages: "python"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-14"
  source: community
  tags: "minimax,llm,chat,streaming,openai-compatible"
---

# MiniMax Chat API — Python Guide

## When To Use

Use the MiniMax API when you need high-performance text generation with large context windows (up to 204K tokens). MiniMax exposes an OpenAI-compatible endpoint, so you can use the standard `openai` Python SDK with a custom `base_url`.

## Install

MiniMax uses the OpenAI Python SDK. No additional package is needed.

```bash
pip install openai
```

## Authentication And Setup

Get an API key from the MiniMax platform at `https://platform.minimaxi.com`. Set it as an environment variable:

```bash
export MINIMAX_API_KEY="your-api-key"
```

Create the client with the MiniMax base URL:

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["MINIMAX_API_KEY"],
    base_url="https://api.minimax.io/v1",
)
```

## Models

| Model | Context Window | Notes |
|-------|---------------|-------|
| `MiniMax-M2.7` | 204K tokens | Latest flagship model with enhanced reasoning and coding |
| `MiniMax-M2.7-highspeed` | 204K tokens | High-speed version of M2.7 for low-latency scenarios |
| `MiniMax-M2.5` | 204K tokens | Previous generation flagship model |
| `MiniMax-M2.5-highspeed` | 204K tokens | Previous generation high-speed model |

Use `MiniMax-M2.7` for quality-sensitive tasks. Use `MiniMax-M2.7-highspeed` when latency matters more than peak quality.

## Core Usage

### Chat Completions

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["MINIMAX_API_KEY"],
    base_url="https://api.minimax.io/v1",
)

completion = client.chat.completions.create(
    model="MiniMax-M2.7",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain the difference between TCP and UDP."},
    ],
    temperature=0.7,
)

print(completion.choices[0].message.content)
```

### Streaming

Set `stream=True` and iterate over the chunks:

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["MINIMAX_API_KEY"],
    base_url="https://api.minimax.io/v1",
)

stream = client.chat.completions.create(
    model="MiniMax-M2.7",
    messages=[
        {"role": "user", "content": "Write a haiku about programming."},
    ],
    stream=True,
    temperature=0.7,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content or ""
    if delta:
        print(delta, end="", flush=True)
print()
```

### Async Client

Use `AsyncOpenAI` inside async code:

```python
import asyncio
import os
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=os.environ["MINIMAX_API_KEY"],
    base_url="https://api.minimax.io/v1",
)

async def main():
    completion = await client.chat.completions.create(
        model="MiniMax-M2.7",
        messages=[
            {"role": "user", "content": "What are three tips for writing clean code?"},
        ],
        temperature=0.7,
    )
    print(completion.choices[0].message.content)

asyncio.run(main())
```

## Function Calling (Tools)

MiniMax supports OpenAI-style function calling:

```python
import json
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["MINIMAX_API_KEY"],
    base_url="https://api.minimax.io/v1",
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name, e.g. San Francisco",
                    },
                },
                "required": ["location"],
            },
        },
    }
]

completion = client.chat.completions.create(
    model="MiniMax-M2.7",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools,
    temperature=0.7,
)

message = completion.choices[0].message
if message.tool_calls:
    for tool_call in message.tool_calls:
        print(f"Function: {tool_call.function.name}")
        print(f"Arguments: {tool_call.function.arguments}")
```

## Configuration Options

### Temperature

MiniMax requires `temperature` to be strictly between 0.0 (exclusive) and 1.0 (inclusive). A value of exactly `0.0` is rejected.

```python
# Valid
completion = client.chat.completions.create(
    model="MiniMax-M2.7",
    messages=[{"role": "user", "content": "Hello"}],
    temperature=0.01,  # near-deterministic
)

# Invalid — will be rejected
# temperature=0.0
```

For near-deterministic output, use a very small value like `0.01`.

### Top-P and Max Tokens

```python
completion = client.chat.completions.create(
    model="MiniMax-M2.7",
    messages=[{"role": "user", "content": "Summarize this text."}],
    temperature=0.7,
    top_p=0.9,
    max_tokens=1024,
)
```

## Error Handling

Since MiniMax uses the OpenAI SDK, error handling follows the same patterns:

```python
import openai
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.minimax.io/v1",
)

try:
    completion = client.chat.completions.create(
        model="MiniMax-M2.7",
        messages=[{"role": "user", "content": "Hello"}],
        temperature=0.7,
    )
except openai.AuthenticationError:
    print("Invalid API key.")
except openai.RateLimitError:
    print("Rate limit exceeded. Wait before retrying.")
except openai.APIConnectionError:
    print("Failed to connect to MiniMax API.")
except openai.APIStatusError as e:
    print(f"API error: {e.status_code}")
```

## Common Pitfalls

- **Temperature must be > 0.** Setting `temperature=0.0` raises an error. Use `0.01` for near-deterministic behavior.
- **Model names are case-sensitive.** Use `MiniMax-M2.7`, not `minimax-m2.7`.
- **Always set `base_url`.** Without `base_url="https://api.minimax.io/v1"`, requests go to OpenAI instead of MiniMax.
- **Use a dedicated env var.** Store the key in `MINIMAX_API_KEY` (not `OPENAI_API_KEY`) to avoid confusion when working with multiple providers.
- **Large context window.** MiniMax supports up to 204K tokens, but longer inputs cost more and take longer to process. Only send what you need.

## Official Resources

- MiniMax platform: `https://platform.minimaxi.com`
- MiniMax API documentation: `https://platform.minimaxi.com/document/introduction`
- MiniMax website: `https://www.minimaxi.com`
