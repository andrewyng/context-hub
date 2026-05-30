---
name: claude-api
description: "Claude AI assistant API for text generation, analysis, conversation, streaming, tool use, vision, and batch processing"
metadata:
  languages: "python"
  versions: "0.84.0"
  updated-on: "2026-05-12"
  source: maintainer
  tags: "anthropic,sdk,llm,ai,claude"
---


# Anthropic Python SDK Guidelines

You are an Anthropic API coding expert. Help me with writing code using the Anthropic API calling the official libraries and SDKs.

You can find the official SDK documentation and code samples here:
https://docs.anthropic.com/claude/reference/

## Golden Rule: Use the Correct and Current SDK

Always use the Anthropic Python SDK to call Claude models, which is the standard library for all Anthropic API interactions.

- **Library Name:** Anthropic Python SDK
- **Python Package:** `anthropic`
- **Installation:** `pip install anthropic`

**APIs and Usage:**

- **Correct:** `from anthropic import Anthropic`
- **Correct:** `from anthropic import AsyncAnthropic` (for async usage)
- **Correct:** `client = Anthropic(api_key="...")`
- **Correct:** `client.messages.create(...)`

## Initialization and API Key

The `anthropic` library requires creating a client object for all API calls.

- Always use `client = Anthropic()` to create a client object.
- Set `ANTHROPIC_API_KEY` environment variable, which will be picked up automatically.
- Alternatively, pass the API key directly: `client = Anthropic(api_key="your-key-here")`

## Models

By default, use the following models as of May 2026:

- **High-performance / Agentic coding:** `claude-opus-4-7` (flagship; step-change improvement in agentic coding over Opus 4.6)
- **General Tasks (best speed/intelligence balance):** `claude-sonnet-4-6`
- **Fast and Efficient:** `claude-haiku-4-5-20251001` (alias: `claude-haiku-4-5`)

Note: starting with the 4.6 generation, Anthropic uses dateless model IDs as the canonical pinned snapshot (e.g. `claude-opus-4-7`, `claude-sonnet-4-6`). For older generations the alias is a pointer that resolves to a dated ID.

Legacy models (still supported, consider migrating):
- `claude-opus-4-6`, `claude-sonnet-4-5-20250929` (alias `claude-sonnet-4-5`)
- `claude-opus-4-5-20251101`, `claude-opus-4-1-20250805`
- `claude-3-5-haiku-20241022`

Deprecated — retiring June 15, 2026 (migrate now):
- `claude-sonnet-4-20250514` → migrate to `claude-sonnet-4-6`
- `claude-opus-4-20250514` → migrate to `claude-opus-4-7`

Do not use deprecated models: `claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-opus`

```python
# List all available models
models = client.models.list()
```
```python
# List all deprecated models
from anthropic.resources.messages.messages import DEPRECATED_MODELS
for model, deprecation_date in DEPRECATED_MODELS.items():
    print(f"{model}: deprecated {deprecation_date}")
```

- It is acceptable to use specific dated versions if consistency is required.
- Avoid using deprecated models - check the SDK documentation for deprecation notices.

## Basic Inference (Text Generation)

```python
from anthropic import Anthropic

client = Anthropic()

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello, Claude"
        }
    ]
)
print(message.content)
```

## Multimodal Inputs

### Image Inputs

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": "/9j/4AAQSkZJRgABAQ..."
                    }
                },
                {
                    "type": "text",
                    "text": "What's in this image?"
                }
            ]
        }
    ]
)
```

### File Uploads

```python
from pathlib import Path

client.beta.files.upload(
    file=Path("/path/to/file"),
)
```

## Async Usage

```python
import asyncio
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

async def main():
    message = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": "Hello, Claude"
            }
        ]
    )
    print(message.content)

asyncio.run(main())
```

## Advanced Capabilities and Configurations

### System Instructions

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="You are a helpful assistant that speaks like a pirate.",
    messages=[
        {
            "role": "user",
            "content": "Hello!"
        }
    ]
)
```

### Thinking

Configure Claude's extended thinking (reasoning process). Supported on Sonnet 4.6 and Haiku 4.5. **Opus 4.7 uses adaptive thinking only** (no manual `budget_tokens` — drop the `thinking` parameter for Opus 4.7).

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    messages=[
        {
            "role": "user",
            "content": "Solve this complex problem step by step."
        }
    ],
    thinking={
        "type": "enabled",
        "budget_tokens": 10000
    }
)
```

### Tool Use (Function Calling)

```python
def get_weather(location: str) -> str:
    return f"Weather in {location}: 72°F and sunny"

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "What's the weather in San Francisco?"
        }
    ],
    tools=[
        {
            "type": "custom",
            "name": "get_weather",
            "description": "Get current weather for a location",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    }
                },
                "required": ["location"]
            }
        }
    ]
)
```

### Streaming Responses

```python
stream = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Tell me a story"
        }
    ],
    stream=True
)

for event in stream:
    if event.type == "content_block_delta":
        print(event.delta.text, end="", flush=True)
```

### Streaming Helpers

```python
async with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Say hello there!"
        }
    ]
) as stream:
    async for text in stream.text_stream:
        print(text, end="", flush=True)
    print()

message = await stream.get_final_message()
```

### Token Counting

```python
count = client.messages.count_tokens(
    model="claude-sonnet-4-6",
    messages=[
        {"role": "user", "content": "Hello, world"}
    ]
)
print(f"Input tokens: {count.input_tokens}")
```

### Message Batches

```python
batch = await client.messages.batches.create(
    requests=[
        {
            "custom_id": "request-1",
            "params": {
                "model": "claude-sonnet-4-6",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "Hello"}]
            }
        }
    ]
)
```

## Specialized Deployments

### AWS Bedrock

```python
from anthropic import AnthropicBedrock

client = AnthropicBedrock(
    aws_region="us-east-1",
    aws_profile="default"
)

message = client.messages.create(
    model="anthropic.claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello!"
        }
    ]
)
```

### Google Vertex AI

```python
from anthropic import AnthropicVertex

client = AnthropicVertex()

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello!"
        }
    ]
)
```

## Error Handling

```python
import anthropic

try:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": "Hello, Claude"
            }
        ]
    )
except anthropic.APIConnectionError as e:
    print("Connection error occurred")
except anthropic.RateLimitError as e:
    print("Rate limit exceeded")
except anthropic.APIStatusError as e:
    print(f"API error: {e.status_code}")
```

## Configuration Options

### Retries

```python
client = Anthropic(max_retries=3)

client.with_options(max_retries=5).messages.create(...)
```

### Timeouts

```python
client = Anthropic(timeout=30.0)

client.with_options(timeout=60.0).messages.create(...)
```

## Useful Links

- **Documentation:** https://docs.anthropic.com/claude/reference/
- **API Keys:** https://console.anthropic.com/
- **SDK Repository:** https://github.com/anthropics/anthropic-sdk-python
- **Rate Limits:** https://docs.anthropic.com/claude/reference/rate-limits
- **Error Codes:** https://docs.anthropic.com/claude/reference/errors
