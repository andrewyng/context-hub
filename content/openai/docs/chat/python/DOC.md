---
name: chat
description: "OpenAI API for text generation, responses, conversations, streaming, function calling, vision, structured outputs, embeddings, and assistants"
metadata:
  languages: "python"
  versions: "2.26.0"
  revision: 1
  updated-on: "2026-03-27"
  source: community
  tags: "openai,chat,llm,ai"
---

# OpenAI Python SDK Coding Guidelines

You are an OpenAI API coding expert. Help me with writing code using the OpenAI API calling the official Python SDK.

You can find the official SDK documentation and code samples here:
https://platform.openai.com/docs/api-reference

## Golden Rule: Use the Correct and Current SDK

Always use the official OpenAI Python SDK to call OpenAI models, which is the standard library for all OpenAI API interactions.

**Library Name:** OpenAI Python SDK
**PyPI Package:** `openai`

**Installation:**
- **Correct:** `pip install openai`

**APIs and Usage:**
- **Correct:** `from openai import OpenAI`
- **Correct:** `client = OpenAI()`
- **Primary API (Recommended):** `client.responses.create(...)`
- **Legacy API (Still Supported):** `client.chat.completions.create(...)`

## Initialization and API Key

Set the `OPENAI_API_KEY` environment variable; the SDK will pick it up automatically.

```python
import os
from openai import OpenAI

# Uses the OPENAI_API_KEY environment variable
client = OpenAI()

# Or pass the API key directly (not recommended for production)
# client = OpenAI(api_key="your-api-key-here")
```

Use `python-dotenv` or your secret manager of choice to keep keys out of source control.

## Models (as of March 2026)

Default choices:
- **General Text Tasks:** `gpt-5.4` (frontier) or `gpt-4.1` (non-reasoning)
- **Complex Reasoning Tasks:** `gpt-5.4` or `gpt-5.4-pro`
- **Fast & Cost-Efficient:** `gpt-5-mini` or `gpt-4.1-mini`
- **Cheapest / Fastest:** `gpt-5-nano` or `gpt-4.1-nano`
- **Audio Processing:** `gpt-audio` or `gpt-audio-mini`
- **Vision Tasks:** `gpt-5.4` or `gpt-4.1`
- **Agentic Coding:** `gpt-5.3-codex`
- **Search (Chat Completions):** `gpt-5-search-api`, `gpt-4o-search-preview`, or `gpt-4o-mini-search-preview`

Frontier (reasoning, configurable effort):
- `gpt-5.4`, `gpt-5.4-2026-03-05`, `gpt-5.4-pro`, `gpt-5.4-pro-2026-03-05`
- `gpt-5.2`, `gpt-5.2-2025-12-11`, `gpt-5.2-pro`
- `gpt-5.1`, `gpt-5.1-2025-11-13`, `gpt-5.1-pro`
- `gpt-5`, `gpt-5-2025-08-07`, `gpt-5-pro`
- `gpt-5-mini`, `gpt-5-mini-2025-08-07`
- `gpt-5-nano`, `gpt-5-nano-2025-08-07`

Non-reasoning:
- `gpt-4.1`, `gpt-4.1-2025-04-14`
- `gpt-4.1-mini`, `gpt-4.1-mini-2025-04-14`
- `gpt-4.1-nano`, `gpt-4.1-nano-2025-04-14`

Reasoning (o-series, succeeded by GPT-5):
- `o3`, `o3-2025-04-16`, `o3-pro`, `o3-pro-2025-06-10`
- `o4-mini`, `o4-mini-2025-04-16`
- `o3-mini`, `o3-mini-2025-01-31`
- `o1`, `o1-2024-12-17`

Deep research: `o3-deep-research`, `o4-mini-deep-research`

Codex (agentic coding, Responses API only):
- `gpt-5.3-codex`, `gpt-5.2-codex`, `gpt-5.1-codex`, `gpt-5.1-codex-max`, `gpt-5.1-codex-mini`, `gpt-5-codex`

Audio chat: `gpt-audio`, `gpt-audio-2025-08-28`, `gpt-audio-mini`
Realtime: `gpt-realtime`, `gpt-realtime-2025-08-28`, `gpt-realtime-mini`
TTS: `gpt-4o-mini-tts`, `gpt-4o-mini-tts-2025-12-15`, `tts-1`, `tts-1-hd`
STT: `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-4o-mini-transcribe-2025-12-15`, `gpt-4o-transcribe-diarize`, `whisper-1`
Image generation: `gpt-image-1.5`, `gpt-image-1.5-2025-12-16`, `gpt-image-1`, `gpt-image-1-mini`, `chatgpt-image-latest`
Embeddings: `text-embedding-3-large`, `text-embedding-3-small`, `text-embedding-ada-002`
Moderation: `omni-moderation-latest`
Search (Chat Completions only): `gpt-5-search-api`, `gpt-4o-search-preview`, `gpt-4o-mini-search-preview`

Legacy (still available): `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`

Deprecated (shutdown scheduled):
- `dall-e-3`, `dall-e-2` → May 12, 2026 (use `gpt-image-1`)
- `o1-preview`, `o1-mini` → deprecated (use `o3` or `gpt-5`)
- `codex-mini-latest` → shut down Feb 12, 2026
- `chatgpt-4o-latest` → shut down Feb 17, 2026
- `gpt-4o-realtime-preview` → Mar 24, 2026 (use `gpt-realtime`)
- `gpt-4o-mini-audio-preview` → Mar 24, 2026 (use `gpt-audio-mini`)
- `gpt-4.5-preview` → deprecated
- Assistants API → sunset Aug 26, 2026 (migrate to Responses API)

## Basic Inference (Text Generation)

### Primary Method: Responses API (Recommended)

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.4",
    instructions="You are a helpful coding assistant.",
    input="How do I reverse a string in Python?",
)

print(response.output_text)
```

For the legacy Chat Completions approach, see [references/additional-apis.md](references/additional-apis.md).

## Vision (Multimodal Inputs)

### With Image URL (Responses API)

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-4.1-mini",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "What is in this image?"},
                {"type": "input_image", "image_url": "https://example.com/image.jpg"},
            ],
        }
    ],
)
```

### With Base64 Encoded Image

```python
import base64
from openai import OpenAI

client = OpenAI()

with open("path/to/image.png", "rb") as image_file:
    b64_image = base64.b64encode(image_file.read()).decode("utf-8")

response = client.responses.create(
    model="gpt-4.1-mini",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "What is in this image?"},
                {"type": "input_image", "image_url": f"data:image/png;base64,{b64_image}"},
            ],
        }
    ],
)
```

## Async Usage

```python
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def main():
    response = await client.responses.create(
        model="gpt-5.4",
        input="Explain quantum computing to a beginner."
    )
    print(response.output_text)

asyncio.run(main())
```

Optionally use `aiohttp` backend via `pip install openai[aiohttp]` and instantiate with `DefaultAioHttpClient()`.

## Streaming Responses

### Responses API Streaming

```python
from openai import OpenAI
client = OpenAI()

stream = client.responses.create(
    model="gpt-5.4",
    input="Write a short story about a robot.",
    stream=True,
)

for event in stream:
    print(event)
```

For Chat Completions streaming, see [references/additional-apis.md](references/additional-apis.md).

## Function Calling (Tools)

### Primary Method: Responses API (Recommended)

```python
import json
from openai import OpenAI

client = OpenAI()

tools = [
    {
        "type": "function",
        "name": "get_weather",
        "description": "Get the current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string", "description": "City name"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
            },
            "required": ["location"],
        },
    },
]

response = client.responses.create(
    model="gpt-5.4",
    tools=tools,
    input=[{"role": "user", "content": "What's the weather like in Paris?"}],
)

# Handle tool calls
for item in response.output:
    if item.type == "function_call":
        args = json.loads(item.arguments)
        print(f"Call {item.name} with {args}")
        # Execute your function, then return results:
        # input.append({"type": "function_call_output", "call_id": item.call_id, "output": result})
```

For legacy Chat Completions function calling with Pydantic, see [references/additional-apis.md](references/additional-apis.md).

## Structured Outputs

Auto-parse JSON into Pydantic models.

### Primary Method: Responses API (Recommended)

```python
from pydantic import BaseModel
from openai import OpenAI

class Step(BaseModel):
    explanation: str
    output: str

class MathResponse(BaseModel):
    steps: list[Step]
    final_answer: str

client = OpenAI()
response = client.responses.parse(
    model="gpt-5.4",
    input=[
        {"role": "system", "content": "You are a helpful math tutor."},
        {"role": "user", "content": "solve 8x + 31 = 2"},
    ],
    text_format=MathResponse,
)

if response.output_parsed:
    print(response.output_parsed.final_answer)
```

Key differences from Chat Completions:
- Use `client.responses.parse()` instead of `client.chat.completions.parse()`
- Use `text_format=` instead of `response_format=`
- Access result via `response.output_parsed` instead of `message.parsed`
- Use `input=` instead of `messages=`

For legacy Chat Completions structured outputs, see [references/additional-apis.md](references/additional-apis.md).

## Conversations API

Persistent multi-turn conversations managed server-side by OpenAI. No need to manually pass message history — the API tracks it automatically.

```python
from openai import OpenAI

client = OpenAI()

# Create a conversation (once per session)
conversation = client.conversations.create()

# First turn
response = client.responses.create(
    model="gpt-5.4",
    input="Tell me a joke about programming.",
    conversation=conversation.id,
)
print(response.output_text)

# Follow-up — context is preserved automatically
response = client.responses.create(
    model="gpt-5.4",
    input="Explain why that's funny.",
    conversation=conversation.id,
)
print(response.output_text)
```

Works with `responses.parse()` for structured outputs in multi-turn conversations:

```python
from pydantic import BaseModel
from openai import OpenAI

class EditResult(BaseModel):
    modified_text: str
    explanation: str

client = OpenAI()
conversation = client.conversations.create()

response = client.responses.parse(
    model="gpt-5.4",
    input="Make the first paragraph bold.",
    text_format=EditResult,
    conversation=conversation.id,
)
print(response.output_parsed.explanation)
```

Use Conversations API when building multi-turn chat UIs or agents that need persistent context. Use manual message history (`input=[...]`) for simple single-request interactions.

## Additional APIs

For audio, files, embeddings, image generation, error handling, retries, realtime API, Azure, webhooks, and pagination, see [references/additional-apis.md](references/additional-apis.md).

## Notes

- Prefer the Responses API for new work; Chat Completions remains supported.
- Keep API keys in env vars or a secret manager.
- Both sync and async clients are available; interfaces mirror each other.
- Use streaming for lower latency UX.
- Pydantic-based structured outputs and function calling provide type safety.
