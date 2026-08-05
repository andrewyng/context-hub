---
name: package
description: "Groq Python SDK for chat completions, streaming, async clients, and audio transcription"
metadata:
  languages: "python"
  versions: "1.4.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "groq,llm,inference,chat,streaming,audio"
---

# groq Python Package Guide

## When To Use

Use `groq` when you want the official Groq Python SDK for server-side text generation, streaming chat completions, async calls, and speech-to-text requests.

This entry is pinned to package version `1.4.0`.

## Install

Install the pinned version when you need this exact SDK surface:

```bash
pip install groq==1.4.0
```

If you are not pinning strictly, install the latest compatible release for the project and then confirm the API surface against the installed version:

```bash
pip install groq
```

## Authentication And Setup

Groq uses an API key. In Python, the SDK reads `GROQ_API_KEY` from the environment if you do not pass `api_key` explicitly.

```bash
export GROQ_API_KEY="your-api-key"
```

```python
import os

from groq import Groq

client = Groq(
    api_key=os.environ["GROQ_API_KEY"],
)
```

This also works:

```python
from groq import Groq

client = Groq()
```

That implicit style depends on `GROQ_API_KEY` already being set in the environment.

## Core Usage

### Chat Completions

`groq` `1.4.0` uses the `client.chat.completions.create(...)` pattern.

```python
from groq import Groq

client = Groq()

completion = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": "You are a concise assistant."},
        {"role": "user", "content": "Summarize the benefits of HTTP keep-alive."},
    ],
)

print(completion.choices[0].message.content)
```

Current production models (verified May 2026) include `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `openai/gpt-oss-120b`, and `openai/gpt-oss-20b`. Confirm available model IDs in the Groq Console before deploying — the model catalog changes faster than the SDK does.

Response objects are typed models rather than plain dictionaries. Access fields with attributes such as `completion.choices[0].message.content`. If you need plain data for logging or serialization, use the model helpers shown in the upstream README, such as `to_json()` and `to_dict()`.

### Streaming

Set `stream=True` and iterate over the chunks:

```python
from groq import Groq

client = Groq()

stream = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "user", "content": "Count from 1 to 5."},
    ],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content or ""
    if delta:
        print(delta, end="", flush=True)
print()
```

### Async Client

Use `AsyncGroq` inside async code:

```python
import asyncio

from groq import AsyncGroq

client = AsyncGroq()

async def main() -> None:
    completion = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": "Give me three commit message tips."},
        ],
    )
    print(completion.choices[0].message.content)

asyncio.run(main())
```

Do not `await` the synchronous `Groq` client, and do not call `AsyncGroq` from sync code without an event loop.

### Tool / Function Calling

Pass OpenAI-compatible tool definitions and inspect `tool_calls` on the response message:

```python
from groq import Groq

client = Groq()

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"},
                },
                "required": ["city"],
            },
        },
    }
]

completion = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "What is the weather in Berkeley?"}],
    tools=tools,
    tool_choice="auto",
)

message = completion.choices[0].message
if message.tool_calls:
    for call in message.tool_calls:
        print(call.function.name, call.function.arguments)
```

The arguments field is a JSON string; parse it with `json.loads(...)` before calling your function. Append a `{"role": "tool", "tool_call_id": ..., "content": ...}` message and re-call `chat.completions.create` to complete the round trip.

### Audio Transcription

The SDK also supports speech-to-text requests:

```python
from pathlib import Path

from groq import Groq

client = Groq()

transcription = client.audio.transcriptions.create(
    file=Path("speech.wav"),
    model="whisper-large-v3-turbo",
)

print(transcription.text)
```

For translation instead of transcription, use `client.audio.translations.create(...)`.

## Configuration And Reliability

### Timeout And Retries

The client supports request timeout and retry configuration:

```python
from groq import Groq

client = Groq(
    timeout=20.0,
    max_retries=2,
)
```

According to the upstream SDK README, retries are enabled by default for connection problems, HTTP `408`, `409`, `429`, and `>=500` responses. Set `max_retries=0` if you need strict single-attempt behavior.

### Error Handling

Handle Groq SDK exceptions explicitly when you need reliable control flow:

```python
from groq import APIConnectionError, APIStatusError, Groq

client = Groq()

try:
    client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Ping"}],
    )
except APIConnectionError as exc:
    print(f"Connection error: {exc}")
except APIStatusError as exc:
    print(f"Status {exc.status_code}: {exc.response}")
```

The SDK README also documents specific subclasses such as `RateLimitError`.

## Common Pitfalls

- `groq` is the package name and the import namespace. Use `from groq import Groq`, not `import groq as client`.
- The SDK version and the available hosted models are separate concerns. Verify current model IDs in Groq Console docs before hard-coding them.
- Some Groq docs pages still show older setup text. For package `1.4.0`, rely on package metadata and the SDK repo for Python compatibility: `>=3.10`.
- Responses are typed objects, not raw dictionaries. Attribute access is the default path.
- Streaming chunks can contain empty deltas. Guard against `None` or empty strings before concatenating output.
- If you rely on implicit environment loading, missing `GROQ_API_KEY` failures can be delayed until runtime. In deployed code, `os.environ["GROQ_API_KEY"]` is usually the safer setup.
- Default retries can mask whether a failure was transient. For debugging or idempotency-sensitive workflows, set `max_retries=0`.

## Version-Sensitive Notes For `1.4.0`

- This doc is intentionally pinned to version used here `1.4.0`.
- The package surface verified from official sources includes sync and async clients, chat completions, streaming, tool/function calling, audio transcriptions, translations, typed responses, retries, and timeout configuration.
- Groq Console docs describe the live platform and can drift ahead of a pinned SDK release. If an example from the console does not match installed code, confirm the local SDK version first.
- The current `1.x` line targets Python `>=3.10`. Codebases on 3.9 should pin an older `groq` release or upgrade the runtime before adopting `1.4.0`.

## Official Sources Used

- Groq Python libraries doc: `https://console.groq.com/docs/libraries`
- Groq quickstart: `https://console.groq.com/docs/quickstart`
- PyPI package page: `https://pypi.org/project/groq/`
- Groq Python SDK repository: `https://github.com/groq/groq-python`
