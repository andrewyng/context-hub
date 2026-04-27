---
name: chat
description: "OpenAI API for text generation, chat completions, streaming, function calling, vision, embeddings, and assistants"
metadata:
  languages: "python"
  versions: "2.26.0"
  updated-on: "2026-04-27"
  source: maintainer
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

## Latest Official OpenAI Docs Update (April 2026)

OpenAI's current official API docs list `gpt-5.5` as the recommended starting point for complex reasoning and coding. The same docs recommend smaller `gpt-5.4` variants when latency or cost is more important.

Use this update as API/model guidance layered on top of the SDK version pin in this document:

- **Default for new Responses API work:** `gpt-5.5`
- **More affordable frontier option:** `gpt-5.4`
- **Fast and cost-efficient:** `gpt-5.4-mini`
- **Cheapest high-volume GPT-5.4-class option:** `gpt-5.4-nano`
- **Non-reasoning compatibility option:** `gpt-4.1`
- **Image API generation and editing:** `gpt-image-2`

The official text-generation guide now shows `client.responses.create(model="gpt-5.5", ...)` for the basic Python example. Continue to use the Responses API for new work unless an existing codebase already depends on Chat Completions.

## Models (as of April 2026)

Default choices:
- **General Text Tasks:** `gpt-5.5` (frontier) or `gpt-4.1` (non-reasoning)
- **Complex Reasoning Tasks:** `gpt-5.5` or `gpt-5.5-pro`
- **Fast & Cost-Efficient:** `gpt-5.4-mini` or `gpt-4.1-mini`
- **Cheapest / Fastest:** `gpt-5.4-nano` or `gpt-4.1-nano`
- **Audio Processing:** `gpt-audio` or `gpt-audio-mini`
- **Vision Tasks:** `gpt-5.5` or `gpt-4.1`
- **Agentic Coding:** `gpt-5.3-codex`
- **Search (Chat Completions):** `gpt-5-search-api`, `gpt-4o-search-preview`, or `gpt-4o-mini-search-preview`

Frontier (reasoning, configurable effort):
- `gpt-5.5`, `gpt-5.5-pro`
- `gpt-5.4`, `gpt-5.4-2026-03-05`, `gpt-5.4-pro`, `gpt-5.4-pro-2026-03-05`
- `gpt-5.2`, `gpt-5.2-2025-12-11`, `gpt-5.2-pro`
- `gpt-5.1`, `gpt-5.1-2025-11-13`, `gpt-5.1-pro`
- `gpt-5`, `gpt-5-2025-08-07`, `gpt-5-pro`
- `gpt-5.4-mini`, `gpt-5.4-nano`
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
Image generation: `gpt-image-2`, `gpt-image-2-2026-04-21`, `gpt-image-1.5`, `gpt-image-1.5-2025-12-16`, `gpt-image-1`, `gpt-image-1-mini`, `chatgpt-image-latest`
Embeddings: `text-embedding-3-large`, `text-embedding-3-small`, `text-embedding-ada-002`
Moderation: `omni-moderation-latest`
Search (Chat Completions only): `gpt-5-search-api`, `gpt-4o-search-preview`, `gpt-4o-mini-search-preview`

Legacy (still available): `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`

Deprecated (shutdown scheduled):
- `dall-e-3`, `dall-e-2` → May 12, 2026 (use `gpt-image-2`)
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
    model="gpt-5.5",
    instructions="You are a helpful coding assistant.",
    input="How do I reverse a string in Python?",
)

print(response.output_text)
```

### Legacy Method: Chat Completions API

```python
from openai import OpenAI

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "How do I reverse a string in Python?"},
    ],
)

print(completion.choices[0].message.content)
```

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
        model="gpt-5.5",
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
    model="gpt-5.5",
    input="Write a short story about a robot.",
    stream=True,
)

for event in stream:
    print(event)
```

### Chat Completions Streaming

```python
from openai import OpenAI
client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "Tell me a joke"}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

## Function Calling (Tools)

Type-safe function calling with Pydantic helpers.

```python
from pydantic import BaseModel
from openai import OpenAI
import openai

class WeatherQuery(BaseModel):
    """Get the current weather for a location"""
    location: str
    unit: str = "celsius"

client = OpenAI()

completion = client.chat.completions.parse(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "What's the weather like in Paris?"}],
    tools=[openai.pydantic_function_tool(WeatherQuery)],
)

if completion.choices[0].message.tool_calls:
    for tool_call in completion.choices[0].message.tool_calls:
        if getattr(tool_call, "parsed_arguments", None):
            print(tool_call.parsed_arguments.location)
```

## Structured Outputs

Auto-parse JSON into Pydantic models.

```python
from typing import List
from pydantic import BaseModel
from openai import OpenAI

class Step(BaseModel):
    explanation: str
    output: str

class MathResponse(BaseModel):
    steps: List[Step]
    final_answer: str

client = OpenAI()
completion = client.chat.completions.parse(
    model="gpt-4.1",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor."},
        {"role": "user", "content": "solve 8x + 31 = 2"},
    ],
    response_format=MathResponse,
)

message = completion.choices[0].message
if message.parsed:
    print(message.parsed.final_answer)
```

## Audio Capabilities

### Speech Synthesis (Text-to-Speech)

```python
from openai import OpenAI
client = OpenAI()

response = client.audio.speech.create(
    model="gpt-4o-mini-tts",
    voice="alloy",
    input="Hello, this is a test of the text to speech API."
)

with open("output.mp3", "wb") as f:
    f.write(response.content)
```

### Audio Transcription

```python
from openai import OpenAI
client = OpenAI()

with open("audio.mp3", "rb") as audio_file:
    transcription = client.audio.transcriptions.create(
        model="gpt-4o-transcribe",
        file=audio_file
    )
print(transcription.text)
```

### Audio Translation

```python
from openai import OpenAI
client = OpenAI()

with open("audio.mp3", "rb") as audio_file:
    translation = client.audio.translations.create(
        model="whisper-1",
        file=audio_file
    )
print(translation.text)
```

## File Operations

### Upload Files

```python
from pathlib import Path
from openai import OpenAI
client = OpenAI()

file_response = client.files.create(
    file=Path("training_data.jsonl"),
    purpose="fine-tune"
)

print(f"File ID: {file_response.id}")
```

### Retrieve, Download, Delete Files

```python
from openai import OpenAI
client = OpenAI()

# List files
files = client.files.list()

# Retrieve a specific file
file_info = client.files.retrieve("file-abc123")

# Download file content
file_content = client.files.content("file-abc123")

# Delete a file
client.files.delete("file-abc123")
```

## Embeddings

```python
from openai import OpenAI
client = OpenAI()

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="The quick brown fox jumps over the lazy dog."
)

embeddings = response.data[0].embedding
print(f"Embedding dimensions: {len(embeddings)}")
```

## Image Generation

Use the Image API with `gpt-image-2` for direct image generation or editing from one prompt. For conversational image generation with the Responses API, keep the request model on a mainline model such as `gpt-5.5` and add the hosted `image_generation` tool.

```python
from openai import OpenAI
client = OpenAI()

response = client.images.generate(
    model="gpt-image-2",
    prompt="A futuristic city skyline at sunset",
    size="1024x1024",
    quality="standard",
    n=1,
)

image_url = response.data[0].url
print(f"Generated image: {image_url}")
```

## Error Handling

```python
import openai
from openai import OpenAI
client = OpenAI()

try:
    response = client.responses.create(model="gpt-5.5", input="Hello, world!")
except openai.RateLimitError:
    print("Rate limit exceeded. Please wait before retrying.")
except openai.APIConnectionError:
    print("Failed to connect to OpenAI API.")
except openai.AuthenticationError:
    print("Invalid API key provided.")
except openai.APIStatusError as e:
    print(f"API error occurred: {e.status_code}")
    print(f"Error response: {e.response}")
```

## Request IDs and Debugging

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(model="gpt-5.5", input="Test message")
print(f"Request ID: {response._request_id}")
```

## Retries and Timeouts

```python
from openai import OpenAI

# Configure retries
client = OpenAI(max_retries=5)

# Configure timeouts
client = OpenAI(timeout=30.0)

# Per-request configuration
response = client.with_options(
    max_retries=3,
    timeout=60.0
).responses.create(
    model="gpt-5.5",
    input="Hello"
)
```

## Realtime API

```python
import asyncio
from openai import AsyncOpenAI

async def main():
    client = AsyncOpenAI()

    async with client.realtime.connect(model="gpt-realtime") as connection:
        await connection.session.update(session={'modalities': ['text']})

        await connection.conversation.item.create(
            item={
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "Say hello!"}],
            }
        )
        await connection.response.create()

        async for event in connection:
            if event.type == "response.output_text.delta":
                print(event.delta, end="")
            elif event.type == "response.done":
                break

asyncio.run(main())
```

## Microsoft Azure OpenAI

```python
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint="https://your-endpoint.openai.azure.com",
)

completion = client.chat.completions.create(
    model="deployment-name",  # Your deployment name
    messages=[{"role": "user", "content": "Hello, Azure OpenAI!"}],
)
print(completion.choices[0].message.content)
```

## Webhook Verification

```python
from flask import Flask, request
from openai import OpenAI

app = Flask(__name__)
client = OpenAI()  # Uses OPENAI_WEBHOOK_SECRET environment variable

@app.route("/webhook", methods=["POST"])
def webhook():
    request_body = request.get_data(as_text=True)

    try:
        event = client.webhooks.unwrap(request_body, request.headers)

        if event.type == "response.completed":
            print("Response completed:", event.data)

        return "ok"
    except Exception as e:
        print("Invalid signature:", e)
        return "Invalid signature", 400
```

## Pagination

```python
from openai import OpenAI

client = OpenAI()

# Automatic pagination
all_files = []
for file in client.files.list(limit=20):
    all_files.append(file)

# Manual pagination
first_page = client.files.list(limit=20)
if first_page.has_next_page():
    next_page = first_page.get_next_page()
```

## Notes

- Prefer the Responses API for new work; Chat Completions remains supported.
- Start new complex reasoning and coding work on `gpt-5.5`; choose `gpt-5.4-mini` or `gpt-5.4-nano` when latency or cost dominates.
- Keep API keys in env vars or a secret manager.
- Both sync and async clients are available; interfaces mirror each other.
- Use streaming for lower latency UX.
- Pydantic-based structured outputs and function calling provide type safety.

## Official Sources Used For This Update

- OpenAI models guide: `https://developers.openai.com/api/docs/models`
- OpenAI GPT-5.5 model page: `https://developers.openai.com/api/docs/models/gpt-5.5`
- OpenAI text generation guide: `https://developers.openai.com/api/docs/guides/text`
- OpenAI GPT Image 2 model page: `https://developers.openai.com/api/docs/models/gpt-image-2`
- OpenAI image generation guide: `https://developers.openai.com/api/docs/guides/image-generation`
- OpenAI API reference: `https://developers.openai.com/api/reference`
