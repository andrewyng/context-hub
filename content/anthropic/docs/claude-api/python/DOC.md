---
name: claude-api
description: "Claude AI assistant API for text generation, analysis, conversation, streaming, tool use, vision, and batch processing"
metadata:
  languages: "python"
  versions: "0.105.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "anthropic,sdk,llm,ai,claude"
---


# Anthropic Python SDK Guidelines

You are an Anthropic API coding expert. Help me with writing code using the Anthropic API calling the official libraries and SDKs.

You can find the official SDK documentation and code samples here:
https://platform.claude.com/docs/en/api/client-sdks

## Golden Rule: Use the Correct and Current SDK

Always use the Anthropic Python SDK to call Claude models, which is the standard library for all Anthropic API interactions.

- **Library Name:** Anthropic Python SDK
- **Python Package:** `anthropic`
- **Installation:** `pip install anthropic`
- **Python Requirement:** `>=3.9`

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

- **Most capable (reasoning, agentic coding):** `claude-opus-4-7`
- **Balanced (speed + intelligence):** `claude-sonnet-4-6`
- **Fast and efficient:** `claude-haiku-4-5`

Claude 4.6+ model IDs are dateless and pin to a specific snapshot. Older models still resolve via aliases (e.g. `claude-opus-4-1`, `claude-sonnet-4-5`).

Deprecated and scheduled for retirement on 2026-06-15: `claude-sonnet-4-20250514`, `claude-opus-4-20250514`. Migrate off these now.

Do not invent model names. If unsure, query the registry:

```python
# List all available models
models = client.models.list()
for m in models.data:
    print(m.id)
```

```python
# Inspect deprecated models bundled with the SDK
from anthropic.resources.messages.messages import DEPRECATED_MODELS
for model, deprecation_date in DEPRECATED_MODELS.items():
    print(f"{model}: deprecated {deprecation_date}")
```

## Basic Inference (Text Generation)

```python
from anthropic import Anthropic

client = Anthropic()

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude"}
    ],
)

# message.content is a list of content blocks, not a string
for block in message.content:
    if block.type == "text":
        print(block.text)
```

`max_tokens` is required. The response `content` is always a list of typed blocks (`text`, `tool_use`, `thinking`, etc.).

## Multi-Turn Conversations

Append assistant responses back into `messages` to continue a conversation.

```python
conversation = [
    {"role": "user", "content": "What's the capital of France?"}
]

reply = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=512,
    messages=conversation,
)

# Append the full assistant message (the SDK content blocks roundtrip cleanly)
conversation.append({"role": "assistant", "content": reply.content})
conversation.append({"role": "user", "content": "And its population?"})

followup = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=512,
    messages=conversation,
)
```

## Multimodal Inputs

### Image Inputs (base64)

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
                        "data": "/9j/4AAQSkZJRgABAQ...",
                    },
                },
                {"type": "text", "text": "What's in this image?"},
            ],
        }
    ],
)
```

### Image Inputs (URL)

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
                    "source": {"type": "url", "url": "https://example.com/image.jpg"},
                },
                {"type": "text", "text": "Describe this."},
            ],
        }
    ],
)
```

### File Uploads (beta)

```python
from pathlib import Path

uploaded = client.beta.files.upload(file=Path("/path/to/document.pdf"))

message = client.beta.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "document", "source": {"type": "file", "file_id": uploaded.id}},
                {"type": "text", "text": "Summarize this document."},
            ],
        }
    ],
    betas=["files-api-2025-04-14"],
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
        messages=[{"role": "user", "content": "Hello, Claude"}],
    )
    print(message.content)

asyncio.run(main())
```

To use `aiohttp` instead of the default `httpx` transport for the async client:

```python
from anthropic import AsyncAnthropic, DefaultAioHttpClient

client = AsyncAnthropic(http_client=DefaultAioHttpClient())
```

Install with `pip install "anthropic[aiohttp]"`.

## Advanced Capabilities

### System Instructions

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="You are a helpful assistant that speaks like a pirate.",
    messages=[{"role": "user", "content": "Hello!"}],
)
```

### Extended Thinking

Available on Sonnet 4.6 and Haiku 4.5. Opus 4.7 uses adaptive thinking (no explicit `thinking` parameter required).

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{"role": "user", "content": "Solve this complex problem step by step."}],
)

for block in message.content:
    if block.type == "thinking":
        print("REASONING:", block.thinking)
    elif block.type == "text":
        print("ANSWER:", block.text)
```

### Prompt Caching

Mark prefix content as cacheable to reuse it across requests. Cached input tokens are billed at a discount.

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "<long system prompt or document>",
            "cache_control": {"type": "ephemeral"},
        }
    ],
    messages=[{"role": "user", "content": "Question about the document?"}],
)

print(message.usage.cache_creation_input_tokens)
print(message.usage.cache_read_input_tokens)
```

### Tool Use (Function Calling)

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "What's the weather in San Francisco?"}],
    tools=[
        {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    }
                },
                "required": ["location"],
            },
        }
    ],
)

# Inspect tool_use blocks and feed results back as tool_result blocks
for block in message.content:
    if block.type == "tool_use":
        result = f"Weather in {block.input['location']}: 72F"
        followup = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": "What's the weather in San Francisco?"},
                {"role": "assistant", "content": message.content},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result,
                        }
                    ],
                },
            ],
            tools=[...],
        )
```

### Streaming Responses

Low-level event stream:

```python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Tell me a story"}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
    final_message = stream.get_final_message()
```

Async streaming helper:

```python
async with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Say hello there!"}],
) as stream:
    async for text in stream.text_stream:
        print(text, end="", flush=True)
    final = await stream.get_final_message()
```

Raw event iteration (`stream=True`):

```python
stream = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True,
)
for event in stream:
    if event.type == "content_block_delta" and event.delta.type == "text_delta":
        print(event.delta.text, end="", flush=True)
```

### Token Counting

```python
count = client.messages.count_tokens(
    model="claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Hello, world"}],
)
print(f"Input tokens: {count.input_tokens}")
```

### Message Batches

Batches run asynchronously at a 50% discount.

```python
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": "request-1",
            "params": {
                "model": "claude-sonnet-4-6",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "Hello"}],
            },
        }
    ]
)

# Poll until processing_status == "ended", then stream results
for entry in client.messages.batches.results(batch.id):
    if entry.result.type == "succeeded":
        print(entry.custom_id, entry.result.message.content)
```

## Specialized Deployments

### Claude Platform on AWS

Uses the same model IDs as the direct Claude API (not Bedrock-style IDs).

```python
from anthropic import AnthropicAWS

client = AnthropicAWS(aws_region="us-east-1")

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
```

Install with `pip install "anthropic[aws]"`.

### AWS Bedrock

```python
from anthropic import AnthropicBedrock

client = AnthropicBedrock(aws_region="us-east-1")

message = client.messages.create(
    model="anthropic.claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
```

Install with `pip install "anthropic[bedrock]"`.

### Google Vertex AI

```python
from anthropic import AnthropicVertex

client = AnthropicVertex(project_id="my-gcp-project", region="us-east5")

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
```

Install with `pip install "anthropic[vertex]"`.

## Error Handling

```python
import anthropic

try:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello, Claude"}],
    )
except anthropic.APIConnectionError as e:
    print("Connection error occurred")
except anthropic.RateLimitError as e:
    print("Rate limit exceeded, retry-after:", e.response.headers.get("retry-after"))
except anthropic.BadRequestError as e:
    print("Bad request:", e.message)
except anthropic.AuthenticationError as e:
    print("Auth failed")
except anthropic.APIStatusError as e:
    print(f"API error: {e.status_code} {e.message}")
```

Every response object exposes `_request_id` (also surfaced as `request-id` response header) for support debugging.

## Configuration Options

### Retries

The SDK retries connection errors, `408`, `409`, `429`, and `>=500` responses by default (2 retries).

```python
client = Anthropic(max_retries=3)

# Per-request override
client.with_options(max_retries=5).messages.create(...)
```

### Timeouts

Default timeout is 10 minutes.

```python
import httpx

client = Anthropic(timeout=30.0)
client = Anthropic(timeout=httpx.Timeout(60.0, connect=5.0))

# Per-request override
client.with_options(timeout=60.0).messages.create(...)
```

### Custom HTTP Client

```python
import httpx
from anthropic import Anthropic, DefaultHttpxClient

client = Anthropic(
    http_client=DefaultHttpxClient(
        proxy="http://proxy.internal:8080",
        transport=httpx.HTTPTransport(local_address="0.0.0.0"),
    )
)
```

## Useful Links

- **Documentation:** https://platform.claude.com/docs/en/api/overview
- **Models:** https://platform.claude.com/docs/en/about-claude/models/overview
- **API Keys:** https://platform.claude.com/settings/keys
- **SDK Repository:** https://github.com/anthropics/anthropic-sdk-python
- **Rate Limits:** https://platform.claude.com/docs/en/api/rate-limits
- **Beta Headers:** https://platform.claude.com/docs/en/api/beta-headers
