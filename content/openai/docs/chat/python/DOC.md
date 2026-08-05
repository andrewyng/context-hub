---
name: chat
description: "OpenAI API for text generation, chat completions, streaming, function calling, vision, embeddings, and assistants"
metadata:
  languages: "python"
  versions: "2.38.0"
  revision: 2
  updated-on: "2026-05-29"
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

## Latest Official OpenAI Docs Update (May 2026)

OpenAI's current official API docs list `gpt-5.5` as the recommended starting point for complex reasoning and coding. The same docs recommend smaller `gpt-5.4` variants when latency or cost is more important.

Use this update as API/model guidance layered on top of the SDK version pin in this document:

- **Default for new Responses API work:** `gpt-5.5`
- **More affordable frontier option:** `gpt-5.4`
- **Fast and cost-efficient:** `gpt-5.4-mini`
- **Cheapest high-volume option:** `gpt-5.4-nano`
- **Image API generation and editing:** `gpt-image-2`

The official text-generation guide shows `client.responses.create(model="gpt-5.5", ...)` for the basic Python example. The Responses API is the primary surface for new code; Chat Completions remains supported for existing codebases.

## Models (as of May 2026)

Default choices:
- **General Text Tasks:** `gpt-5.5` (1M context, flagship) or `gpt-5.4` (more affordable, same capabilities)
- **Complex Reasoning / Coding:** `gpt-5.5`
- **Fast & Cost-Efficient:** `gpt-5.4-mini`
- **Cheapest / Fastest:** `gpt-5.4-nano`
- **Vision / Multimodal:** `gpt-5.5` or `gpt-5.4-mini`
- **Image Generation:** `gpt-image-2`

Frontier (Responses API recommended):
- `gpt-5.5` — flagship, 1M context window
- `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`
- Previous `gpt-5.x` snapshots remain accessible for pinning

Realtime: `gpt-realtime-2`, `gpt-realtime-1.5`, `gpt-realtime-mini`, `gpt-realtime-whisper`
TTS: `gpt-4o-mini-tts`, `tts-1`, `tts-1-hd`
STT: `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-realtime-whisper`, `whisper-1`
Image generation: `gpt-image-2`
Embeddings: `text-embedding-3-large`, `text-embedding-3-small`, `text-embedding-ada-002`
Moderation: `omni-moderation-latest`

Legacy (still available): `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `gpt-4o`, `gpt-4o-mini`

Deprecated:
- `dall-e-3`, `dall-e-2` (use `gpt-image-2`)
- `o1`, `o1-preview`, `o1-mini`, `o3-mini` (succeeded by GPT-5 series)
- `gpt-4o-realtime-preview` (use `gpt-realtime-2`)
- `gpt-4.5-preview`
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
    model="gpt-5.5",
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
    model="gpt-5.4-mini",
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
    model="gpt-5.4-mini",
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
    model="gpt-5.5",
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
    model="gpt-5.5",
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
    model="gpt-5.5",
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

    async with client.realtime.connect(model="gpt-realtime-2") as connection:
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

- OpenAI Python SDK on PyPI: `https://pypi.org/project/openai/2.38.0/`
- OpenAI Python SDK README: `https://github.com/openai/openai-python`
- OpenAI models guide: `https://developers.openai.com/api/docs/models`
- OpenAI text generation guide: `https://developers.openai.com/api/docs/guides/text`
- OpenAI API reference: `https://developers.openai.com/api/reference`
