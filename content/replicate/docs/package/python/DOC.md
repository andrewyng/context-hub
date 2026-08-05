---
name: package
description: "Replicate Python SDK guide for running models, streaming output, and handling file inputs with the official replicate package"
metadata:
  languages: "python"
  versions: "1.0.7"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "replicate,python,ml,inference,ai,predictions"
---

# replicate Python Package Guide

## Golden Rule

Use the official PyPI package: `replicate`.

- Import it as `import replicate`.
- Use the Replicate API token from `REPLICATE_API_TOKEN` unless you are explicitly constructing a client with `api_token=...`.
- Prefer pinned model versions for production workflows so output behavior does not change when a model owner updates their latest version.

## Installation

`replicate` 1.0.7 requires Python `>=3.8`.

```bash
pip install replicate==1.0.7
```

With Poetry:

```bash
poetry add replicate==1.0.7
```

With uv:

```bash
uv add replicate==1.0.7
```

## Authentication And Setup

The simplest path is to export `REPLICATE_API_TOKEN` and use the module-level helpers.

```bash
export REPLICATE_API_TOKEN=r8_...
```

```python
import replicate

output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "studio photo of a red fox in a blue jacket"},
)
```

If you do not want to rely on process-global environment, construct a client explicitly:

```python
import os
import replicate

client = replicate.Client(api_token=os.environ["REPLICATE_API_TOKEN"])
```

Use an explicit client when you need clearer dependency injection, per-request auth separation, or custom transport setup.

## Core Usage

### Run a model and wait for output

`replicate.run()` is the shortest path for "submit a prediction and wait for the final output".

```python
import replicate

output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={
        "prompt": "a watercolor postcard of San Francisco at sunrise",
    },
)

print(output)
```

You can pass either:

- `owner/model`
- `owner/model:version_id`
- a raw version ID

For production code, prefer `owner/model:version_id`.

### Create and inspect predictions directly

Use the predictions API when you need prediction IDs, status polling, webhook support, or finer lifecycle control.

```python
import replicate

prediction = replicate.predictions.create(
    model="black-forest-labs/flux-schnell",
    input={"prompt": "architectural rendering of a small cabin in snow"},
)

print(prediction.id)
print(prediction.status)

prediction = replicate.predictions.get(prediction.id)
print(prediction.status)
```

### Stream incremental output

Use `replicate.stream()` for models that emit incremental tokens or events.

```python
import replicate

for event in replicate.stream(
    "meta/meta-llama-3-70b-instruct",
    input={"prompt": "List three practical uses for a vector database."},
):
    print(str(event), end="")
```

Streaming is the better fit for chat or text-generation UX. `run()` is simpler for one-shot jobs such as image generation.

## Async Usage

`replicate` 1.x also exposes async helpers.

```python
import asyncio
import replicate

async def main() -> None:
    output = await replicate.async_run(
        "black-forest-labs/flux-schnell",
        input={"prompt": "pixel art spaceship over a desert"},
    )
    print(output)

asyncio.run(main())
```

Async streaming works the same way:

```python
import asyncio
import replicate

async def main() -> None:
    async for event in replicate.async_stream(
        "meta/meta-llama-3-70b-instruct",
        input={"prompt": "Write a two-line haiku about Python packaging."},
    ):
        print(str(event), end="")

asyncio.run(main())
```

Use the async API if the rest of your app already uses `asyncio`. Do not wrap sync helpers inside thread executors unless you have to.

## Files And Binary Outputs

File inputs can be passed as open binary file handles.

```python
import replicate

with open("input.jpg", "rb") as image_file:
    output = replicate.run(
        "stability-ai/stable-diffusion",
        input={
            "image": image_file,
            "prompt": "cinematic portrait lighting",
        },
    )
```

Many image or media models return `FileOutput` objects instead of plain strings. Treat them like file-like objects and write them to disk.

```python
import replicate

output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "minimalist poster of a mountain ridge"},
)

first_file = output[0]

with open("poster.webp", "wb") as f:
    f.write(first_file.read())
```

If a model returns text tokens, lists, or JSON-like structures, the output shape depends on the model. Check that model's schema before assuming the return type.

## Transport Configuration

If you need custom connection pooling, proxies, or shared timeouts, `1.0.7` added support for passing your own `httpx.Client` or `httpx.AsyncClient`.

```python
import httpx
import os
import replicate

http_client = httpx.Client(timeout=30.0)

client = replicate.Client(
    api_token=os.environ["REPLICATE_API_TOKEN"],
    http_client=http_client,
)
```

This is the supported way in `1.0.7` to control lower-level HTTP behavior.

## Common Pitfalls

- Module-level helpers such as `replicate.run()` use the default client. If `REPLICATE_API_TOKEN` is missing, auth will fail.
- Do not assume `run()` always returns text. Image and media models commonly return `FileOutput` objects.
- Do not assume model identifiers are stable when you omit the version suffix. Pin the version for reproducible builds and tests.
- Use `predictions.create()` instead of `run()` when you need webhooks, IDs, or explicit polling.
- Keep file handles open until the request is sent. Passing a closed file object will fail.
- Check each model card for required input names. `replicate` is only the client; input schemas come from the specific model you call.

## Version-Sensitive Notes For 1.0.7

- The version used here for this entry is `1.0.7`, and the examples here are aligned to the `1.x` Python client surface.
- Replicate's GitHub README tracks the repository and can move ahead of the pinned PyPI release. When examples disagree, prefer the `1.0.7` PyPI package page and the `v1.0.7` release note.
- `1.0.7` specifically added support for custom `httpx` sync and async clients.

## Official Sources

- GitHub repository: https://github.com/replicate/replicate-python
- PyPI package page for `1.0.7`: https://pypi.org/project/replicate/1.0.7/
- `v1.0.7` release note: https://github.com/replicate/replicate-python/releases/tag/v1.0.7
