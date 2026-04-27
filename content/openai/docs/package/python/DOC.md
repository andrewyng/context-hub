---
name: package
description: "openai package guide for Python with OpenAI(), AsyncOpenAI(), Responses API, streaming, webhooks, pagination, and AzureOpenAI notes"
metadata:
  languages: "python"
  versions: "2.26.0"
  revision: 1
  updated-on: "2026-04-27"
  source: maintainer
  tags: "openai,python,sdk,llm,responses,chat,streaming,webhooks"
---

# openai Python Package Guide

## Golden Rule

- Use the official `openai` package and instantiate an explicit client with `OpenAI()` or `AsyncOpenAI()`.
- Prefer `client.responses.create(...)` for new text, multimodal, and tool-using workflows.
- Keep secrets in environment variables, not source code. For core API usage that usually means `OPENAI_API_KEY`. For webhook verification it also means `OPENAI_WEBHOOK_SECRET`.

## Version-Sensitive Notes

- This entry is pinned to the version used here `2.26.0`.
- Do not treat this package entry as "latest SDK" without refreshing the package-release binding. The API/model guidance below is current as of April 27, 2026, but the SDK pin remains intentionally version-specific.
- `openai` requires Python `>=3.9`.
- The maintainers describe the package as generally following SemVer, but they reserve some backwards-incompatible changes for minor releases when the impact is limited to static typing, internals, or low-impact runtime behavior. Do not assume every `2.x` minor bump is completely frictionless.
- The SDK README describes the Responses API as the primary API for model interaction. Chat Completions remains supported, but it is no longer the default shape to copy for new code.
- `AzureOpenAI` is a separate client class, and the README explicitly warns that Azure API shapes differ from the core OpenAI API shapes, so static response and parameter types may not always line up perfectly.

## Latest Official API/Model Update (April 2026)

OpenAI's current official API docs recommend starting new complex reasoning and coding work with `gpt-5.5`. The docs also recommend `gpt-5.4-mini` and `gpt-5.4-nano` when latency or cost is more important.

For new Python SDK examples in this entry:

- Prefer `client.responses.create(...)`.
- Use `model="gpt-5.5"` as the default current model for high-quality text, coding, multimodal, and reasoning work.
- Use `model="gpt-5.4-mini"` or `model="gpt-5.4-nano"` for lower-latency or lower-cost workloads.
- Use `model="gpt-image-2"` for direct Image API generation or editing. For conversational image generation through the Responses API, use a mainline model such as `gpt-5.5` with the `image_generation` tool instead of putting `gpt-image-2` in the Responses `model` field.
- Keep Chat Completions examples only for existing codebases or SDK helpers that are explicitly documented there.

## Install

Pin the version when you need reproducible behavior:

```bash
python -m pip install "openai==2.26.0"
```

If you want the optional `aiohttp` backend for the async client:

```bash
python -m pip install "openai[aiohttp]==2.26.0"
```

## Recommended Setup

Start with environment variables and a single long-lived client per process or request scope.

```bash
export OPENAI_API_KEY="sk-..."
```

```python
from openai import OpenAI

client = OpenAI()
```

If you need to manage connection cleanup explicitly, use a context manager:

```python
from openai import OpenAI

with OpenAI() as client:
    response = client.responses.create(
        model="gpt-5.5",
        input="Ping",
    )
    print(response.output_text)
```

## Core Usage

### Responses API For New Code

Use `responses.create()` for new projects unless you have a specific reason to stay on Chat Completions.

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    instructions="You are a concise coding assistant.",
    input="How do I reverse a list in Python?",
)

print(response.output_text)
print(response._request_id)
```

Useful request fields to reach for first:

- `model`
- `input`
- `instructions`
- `tools`
- `previous_response_id`
- `stream=True`

The official Responses API reference is the right place to confirm request shapes for built-in tools, conversation state, structured outputs, and multimodal inputs.

### Chat Completions For Existing Code

The SDK still supports Chat Completions. Keep using it when the codebase already depends on it or when you want the SDK parsing helpers documented under `helpers.md`.

```python
from openai import OpenAI

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {"role": "developer", "content": "Be concise."},
        {"role": "user", "content": "Give me a Python dict comprehension example."},
    ],
)

print(completion.choices[0].message.content)
```

### Async Client

The async surface mirrors the sync surface.

```python
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def main() -> None:
    response = await client.responses.create(
        model="gpt-5.5",
        input="Explain what an event loop does in Python.",
    )
    print(response.output_text)

asyncio.run(main())
```

For higher-concurrency async workloads, the maintainers document `aiohttp` as an optional backend:

```python
import asyncio
from openai import AsyncOpenAI, DefaultAioHttpClient

async def main() -> None:
    async with AsyncOpenAI(http_client=DefaultAioHttpClient()) as client:
        response = await client.responses.create(
            model="gpt-5.5",
            input="Say hello.",
        )
        print(response.output_text)

asyncio.run(main())
```

### Streaming

For simple streaming, set `stream=True` and iterate over events.

```python
from openai import OpenAI

client = OpenAI()

stream = client.responses.create(
    model="gpt-5.5",
    input="Write a one-sentence bedtime story about a unicorn.",
    stream=True,
)

for event in stream:
    print(event)
```

If you need more structured streaming helpers for Chat Completions, the SDK also documents `client.chat.completions.stream(...)` in `helpers.md`.

### Vision And Multimodal Inputs

The Responses API accepts multimodal input content arrays:

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
                {"type": "input_image", "image_url": "https://example.com/cat.png"},
            ],
        }
    ],
)

print(response.output_text)
```

### Structured Outputs With Pydantic

The SDK's documented auto-parsing helper is on Chat Completions, not on the Responses API. Use it when you want parsed Pydantic output.

```python
from pydantic import BaseModel
from openai import OpenAI

class Summary(BaseModel):
    title: str
    bullets: list[str]

client = OpenAI()

completion = client.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "Return a short structured summary."},
        {"role": "user", "content": "Summarize how Python context managers work."},
    ],
    response_format=Summary,
)

message = completion.choices[0].message
if message.parsed:
    print(message.parsed.title)
    print(message.parsed.bullets)
else:
    print(message.refusal)
```

Important helper restrictions documented by upstream:

- `chat.completions.parse()` may raise special errors when the finish reason is `length` or `content_filter`.
- Tool parsing requires strict function tools. Use `openai.pydantic_function_tool(...)` or provide `"strict": True` in the tool schema.

## Config And Authentication

### Core OpenAI API

Default auth path:

- `OPENAI_API_KEY`

Useful optional configuration:

- `base_url=` or `OPENAI_BASE_URL` for a compatible API endpoint
- `max_retries=` for retry policy
- `timeout=` for request timeouts
- `OPENAI_LOG=info` or `debug` for SDK logging

Example:

```python
from openai import OpenAI

client = OpenAI(
    max_retries=2,
    timeout=30.0,
)
```

Per-request overrides use `with_options(...)`:

```python
response = client.with_options(timeout=5.0, max_retries=0).responses.create(
    model="gpt-5.5",
    input="Quick health check.",
)
```

### Azure OpenAI

Use `AzureOpenAI`, not `OpenAI`, when targeting Azure-hosted deployments.

```python
from openai import AzureOpenAI

client = AzureOpenAI(
    api_version="2023-07-01-preview",
    azure_endpoint="https://example-endpoint.openai.azure.com",
)

completion = client.chat.completions.create(
    model="deployment-name",
    messages=[{"role": "user", "content": "Say hello"}],
)

print(completion.to_json())
```

Azure-specific options documented in the README include:

- `azure_endpoint` or `AZURE_OPENAI_ENDPOINT`
- `azure_deployment`
- `api_version` or `OPENAI_API_VERSION`
- `azure_ad_token` or `AZURE_OPENAI_AD_TOKEN`
- `azure_ad_token_provider`

## Common Operational Patterns

### Pagination

List endpoints are auto-paginating iterators:

```python
from openai import OpenAI

client = OpenAI()

for job in client.fine_tuning.jobs.list(limit=20):
    print(job.id)
```

If you need page-level control, use:

- `.has_next_page()`
- `.next_page_info()`
- `.get_next_page()`

### File Uploads

Upload parameters accept bytes, path-like objects, or `(filename, contents, media_type)` tuples.

```python
from pathlib import Path
from openai import OpenAI

client = OpenAI()

uploaded = client.files.create(
    file=Path("training.jsonl"),
    purpose="fine-tune",
)

print(uploaded.id)
```

### Webhook Verification

Pass the raw request body string to the webhook helpers. Do not JSON-decode it before verification.

```python
from flask import Flask, request
from openai import OpenAI

app = Flask(__name__)
client = OpenAI()

@app.post("/webhook")
def webhook() -> tuple[str, int] | str:
    body = request.get_data(as_text=True)

    try:
        event = client.webhooks.unwrap(body, request.headers)
        print(event.type)
        return "ok"
    except Exception:
        return "invalid signature", 400
```

If you only want signature verification, use `client.webhooks.verify_signature(...)` and parse the JSON yourself afterward.

### Error Handling

The main exception families to branch on are:

- `openai.APIConnectionError`
- `openai.APIStatusError`
- `openai.RateLimitError`
- `openai.APITimeoutError`

```python
import openai
from openai import OpenAI

client = OpenAI()

try:
    client.responses.create(model="gpt-5.5", input="Hello")
except openai.RateLimitError:
    # Back off and retry later.
    raise
except openai.APIStatusError as exc:
    print(exc.status_code)
    print(exc.request_id)
    raise
```

## Realtime API

The async client exposes a WebSocket-based realtime interface:

```python
import asyncio
from openai import AsyncOpenAI

async def main() -> None:
    client = AsyncOpenAI()

    async with client.realtime.connect(model="gpt-realtime") as connection:
        await connection.session.update(
            session={"type": "realtime", "output_modalities": ["text"]}
        )
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
                print(event.delta, end="", flush=True)
            elif event.type == "response.done":
                break

asyncio.run(main())
```

Realtime pitfall: upstream documents that `error` events are delivered on the open connection and are not automatically raised as Python exceptions. You must handle `event.type == "error"` in your loop.

## Common Pitfalls

- Do not copy old pre-1.x examples that call module-level APIs like `openai.ChatCompletion.create(...)`. For `2.x`, instantiate `OpenAI()` or `AsyncOpenAI()`.
- Prefer the Responses API for new code. Many third-party blog posts still default to older Chat Completions examples.
- Do not parse webhook JSON before `unwrap()` or `verify_signature()`. The helper expects the raw request body string.
- The default timeout is 10 minutes and default retry count is 2. Tight latency budgets often need smaller timeouts and explicit retry policy.
- `_request_id` is intentionally public for debugging. Most other underscore-prefixed internals are not public API.
- `AzureOpenAI` is not a drop-in type-perfect substitute for `OpenAI`; expect some shape mismatches because Azure differs from the core API.
- `chat.completions.parse()` has extra restrictions compared with `chat.completions.create()`. Use it deliberately.

## Official Sources Used For This Entry

- OpenAI Python SDK README: `https://github.com/openai/openai-python`
- OpenAI Python SDK helpers: `https://github.com/openai/openai-python/blob/main/helpers.md`
- OpenAI models guide: `https://developers.openai.com/api/docs/models`
- OpenAI GPT-5.5 model page: `https://developers.openai.com/api/docs/models/gpt-5.5`
- OpenAI text generation guide: `https://developers.openai.com/api/docs/guides/text`
- OpenAI GPT Image 2 model page: `https://developers.openai.com/api/docs/models/gpt-image-2`
- OpenAI image generation guide: `https://developers.openai.com/api/docs/guides/image-generation`
- OpenAI Responses API reference: `https://developers.openai.com/api/reference/responses`
- PyPI package page: `https://pypi.org/project/openai/2.26.0/`
