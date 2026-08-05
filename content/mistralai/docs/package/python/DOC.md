---
name: package
description: "Mistral AI Python SDK for chat completions, embeddings, files, OCR, and related platform APIs"
metadata:
  languages: "python"
  versions: "2.4.8"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "mistral,mistralai,llm,chat,embeddings,ocr,agents"
---

# mistralai Python Package Guide

## Golden Rule

For `mistralai==2.4.8`, use the current official v2 SDK patterns and check the migration guide before copying older code.

- New code can follow the official README import style: `from mistralai import Mistral`
- If you are migrating v1 code, replace `MistralClient` with `Mistral`
- Treat responses as typed models, not plain dictionaries

## Installation

```bash
pip install mistralai==2.4.8
```

```bash
uv add mistralai==2.4.8
```

```bash
poetry add mistralai==2.4.8
```

Optional extras exposed by the package metadata:

- `mistralai[agents]`
- `mistralai[gcp]`
- `mistralai[realtime]`

Use an extra only if you need that surface. The base package is enough for normal chat, embeddings, files, and OCR calls.

## Authentication And Client Setup

Set a Mistral API key in the environment:

```bash
export MISTRAL_API_KEY="your_api_key"
```

Basic client setup:

```python
import os

from mistralai import Mistral

client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
```

Practical setup notes:

- Fail fast if `MISTRAL_API_KEY` is missing instead of silently constructing a broken client.
- Keep the client as a shared object in your app instead of recreating it per request.
- If you are targeting Azure, GCP, Cloudflare, or Mistral Europe deployments, use the official migration guide for provider-specific initialization instead of adapting generic OpenAI examples.

## Core Usage

### Chat Completion

```python
import os

from mistralai import Mistral

client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

response = client.chat.complete(
    model="mistral-small-latest",
    messages=[
        {
            "role": "user",
            "content": "Summarize HTTP caching in 3 bullets.",
        }
    ],
)

print(response.choices[0].message.content)
```

Use model aliases like `mistral-small-latest` only when you want the provider-selected latest model for that family. For reproducible behavior, pin a concrete model name from the official model docs instead of relying on a moving alias.

### Streaming

```python
import os

from mistralai import Mistral

client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

stream = client.chat.stream(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "Count from 1 to 5."}],
)

for event in stream:
    delta = event.data.choices[0].delta.content
    if delta is not None:
        print(delta, end="", flush=True)
print()
```

When streaming, assemble text incrementally from `delta.content`. Do not assume each event contains a full message.

### Embeddings

```python
import os

from mistralai import Mistral

client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

response = client.embeddings.create(
    model="mistral-embed",
    inputs=["first text", "second text"],
)

vectors = [item.embedding for item in response.data]
print(len(vectors), len(vectors[0]))
```

The response is model-backed data, so use attribute access like `response.data` and `item.embedding`.

### Tool / Function Calling

Pass JSON-schema tool definitions and inspect `tool_calls` on the assistant message.

```python
import os

from mistralai import Mistral

client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
            },
        },
    }
]

response = client.chat.complete(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "What is the weather in Berkeley?"}],
    tools=tools,
    tool_choice="auto",
)

message = response.choices[0].message
if message.tool_calls:
    for call in message.tool_calls:
        print(call.function.name, call.function.arguments)
```

The `arguments` field is a JSON string; parse it before invoking your function. To complete a tool round trip, append a `{"role": "tool", "tool_call_id": call.id, "name": ..., "content": ...}` message and call `chat.complete` again.

### File Upload And OCR

OCR requires an upload step first.

```python
import os

from mistralai import Mistral

client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

with open("invoice.pdf", "rb") as handle:
    uploaded = client.files.upload(
        file={"file_name": "invoice.pdf", "content": handle},
        purpose="ocr",
    )

ocr_response = client.ocr.process(
    model="mistral-ocr-latest",
    document={
        "type": "file",
        "file_id": uploaded.id,
    },
)

print(ocr_response.pages[0].markdown)
```

If you skip the upload and pass a local path directly to `ocr.process`, the call will fail. Upload first, then pass the returned file id.

## Configuration Notes

### Version-Sensitive Imports

Official sources currently show two valid-looking v2 styles:

- README examples use `from mistralai import Mistral`
- The migration guide describes the v1 to v2 class rename as `MistralClient` to `mistralai.client.Mistral`

Use one v2 style consistently in a codebase and do not mix in `MistralClient` or old async-client imports from v1 examples.

### Typed Responses

The migration guide explicitly calls out that responses are now Pydantic-based models instead of plain dictionaries.

Use:

```python
text = response.choices[0].message.content
payload = response.model_dump()
```

Do not write:

```python
text = response["choices"][0]["message"]["content"]
```

### Cloud And Provider Routing

The v2 migration guide documents provider-specific initialization for:

- hosted Mistral API
- Mistral Europe
- Cloudflare
- Azure
- GCP

If your project uses a non-default provider, check the migration guide before adding base URLs, auth headers, or provider-specific environment variables. The setup is not interchangeable with OpenAI-compatible clients.

## Common Pitfalls

- Mixing v1 and v2 examples. `MistralClient`, `ChatMessage`, and dict-style response handling are migration clues that you are looking at older code.
- Assuming the SDK version pins a model version. SDK version `2.4.8` and model aliases like `mistral-small-latest` are separate concerns.
- Treating streamed events like final responses. Build the output from deltas.
- Forgetting the file upload step for OCR and other file-based workflows.
- Copying third-party snippets that use unofficial import paths or outdated async helpers.

## Recommended Agent Workflow

1. Install `mistralai==2.4.8` and confirm Python `>=3.10` (current SDK line dropped 3.9 support).
2. Set `MISTRAL_API_KEY` and create a single shared `Mistral` client.
3. Start with `chat.complete` or `chat.stream` for normal LLM calls.
4. Add `embeddings.create`, `files.upload`, or `ocr.process` only when the task actually needs them.
5. Check the migration guide before reusing any example that mentions `MistralClient`, `ChatMessage`, or dict indexing.

## Official Sources Used For This Entry

- Docs root: `https://docs.mistral.ai/`
- PyPI project: `https://pypi.org/project/mistralai/`
- PyPI JSON metadata: `https://pypi.org/pypi/mistralai/json`
- Official Python SDK repository: `https://github.com/mistralai/client-python`
- Official migration guide: `https://github.com/mistralai/client-python/blob/main/MIGRATION.md`
