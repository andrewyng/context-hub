---
name: package
description: "Together Python SDK for chat, completions, embeddings, images, rerank, and fine-tuning"
metadata:
  languages: "python"
  versions: "2.16.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "together,python,llm,chat,embeddings,images,rerank,fine-tuning"
---

# together Python Package Guide

## What This Package Is

`together` is Together AI's official Python SDK. Use it when you need Together-hosted chat/completions models, embeddings, image generation, reranking, file upload, or fine-tuning from Python.

## Install

```bash
pip install together==2.16.0
```

Common project-tool variants:

```bash
poetry add together==2.16.0
uv add together==2.16.0
```

## Authentication

Together uses an API key. The SDK reads `TOGETHER_API_KEY` by default.

```bash
export TOGETHER_API_KEY="your-api-key"
```

You can also pass the key explicitly:

```python
from together import Together

client = Together(api_key="your-api-key")
```

If you already exported `TOGETHER_API_KEY`, this is enough:

```python
from together import Together

client = Together()
```

## Core Usage

### Chat Completions

Use `client.chat.completions.create(...)` for the OpenAI-style chat flow.

```python
from together import Together

client = Together()

response = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages=[
        {"role": "system", "content": "Answer briefly and clearly."},
        {"role": "user", "content": "Write a haiku about distributed systems."},
    ],
    temperature=0.7,
    max_tokens=128,
)

print(response.choices[0].message.content)
```

### Text Completions

Older prompt-style models use `client.completions.create(...)`.

```python
from together import Together

client = Together()

response = client.completions.create(
    model="your-completions-model-id",
    prompt="Write three commit message options for fixing a flaky test.",
    max_tokens=80,
)

print(response.choices[0].text)
```

### Streaming Chat Output

Set `stream=True` and iterate over chunks.

```python
from together import Together

client = Together()

stream = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages=[{"role": "user", "content": "Summarize event-driven architecture in 3 bullets."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
print()
```

### Structured Output / JSON Mode

The Together docs show `response_format` support on chat completions. Use it when your caller expects machine-readable JSON.

```python
from together import Together

client = Together()

response = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages=[{"role": "user", "content": "Return a JSON object with keys title and priority."}],
    response_format={"type": "json_object"},
)

print(response.choices[0].message.content)
```

### Embeddings

Use `client.embeddings.create(...)` for vector search or retrieval pipelines.

```python
from together import Together

client = Together()

response = client.embeddings.create(
    model="togethercomputer/m2-bert-80M-32k-retrieval",
    input=["Package docs help coding assistants answer questions."],
)

embedding = response.data[0].embedding
print(len(embedding))
```

### Image Generation

Use `client.images.generate(...)` for text-to-image generation.

```python
from together import Together

client = Together()

response = client.images.generate(
    model="black-forest-labs/FLUX.1-schnell-Free",
    prompt="A pencil sketch of a robot reading API docs",
)

print(response.data[0].url)
```

### Reranking

Use `client.rerank.create(...)` to score a set of candidate documents against a query.

```python
from together import Together

client = Together()

response = client.rerank.create(
    model="Salesforce/Llama-Rank-V1",
    query="python sdk authentication",
    documents=[
        "Set TOGETHER_API_KEY before creating the client.",
        "Use rerank for semantic document sorting.",
        "Image generation is available through client.images.generate.",
    ],
)

for item in response.results:
    print(item.index, item.relevance_score)
```

## Async Usage

Use `AsyncTogether` inside async apps, workers, or FastAPI endpoints.

```python
import asyncio
from together import AsyncTogether

async def main() -> None:
    client = AsyncTogether()
    response = await client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        messages=[{"role": "user", "content": "Say hello in one sentence."}],
    )
    print(response.choices[0].message.content)

asyncio.run(main())
```

## Files And Fine-Tuning

The SDK also exposes file upload and fine-tuning APIs. The official repo examples use `client.files.upload(...)` followed by `client.fine_tuning.create(...)`.

```python
from together import Together

client = Together()

with open("training.jsonl", "rb") as handle:
    uploaded = client.files.upload(file=handle)

job = client.fine_tuning.create(
    training_file=uploaded.id,
    model="your-fine-tunable-base-model",
    n_epochs=1,
    n_checkpoints=1,
)

print(job.id)
```

Use the current Together fine-tuning docs before copying this flow into production. File purpose requirements and accepted training formats can change.

## Configuration Notes

- `Together()` reads `TOGETHER_API_KEY` automatically.
- `api_key=` is the simplest override for multi-tenant or per-request key routing.
- The official SDK examples also show `base_url=` support, which is useful for proxying or local compatibility layers.
- Model names are string IDs; do not guess them. Pull them from current Together docs or your account's supported-model list.
- Response objects are OpenAI-style for chat/completions, but endpoint-specific fields differ for images, embeddings, files, rerank, and fine-tuning.

## Common Pitfalls

- Do not import `OpenAI` from this package. The Together SDK uses `Together` and `AsyncTogether`.
- Do not assume every endpoint is available on every model. Chat, embeddings, rerank, image generation, and fine-tuning use different model families.
- Do not hardcode stale model IDs from blog posts. Together's docs and catalog change frequently.
- Streaming responses are iterators of chunks, not one final response object.
- Rerank expects a query plus candidate documents; it is not the same API shape as embeddings.
- Fine-tuning examples often require JSONL training data and uploaded file IDs. Validate the file format first.

## Version-Sensitive Notes

- This doc is pinned to the version used here `2.16.0`, which PyPI lists as the current latest release for this session.
- The Together docs are not version-pinned per SDK release. Treat the docs site as current-product guidance and verify any newly documented arguments against the installed package if code fails.
- The docs site is organized around Together's current v2 platform docs. For package work, prefer the Python SDK page and quickstart over the broader REST reference landing page.
- Together's catalog changes frequently. Recent quickstart examples have used `openai/gpt-oss-20b` and `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`; pull current model IDs from the Together docs or your account's supported-model list rather than hardcoding stale IDs from blog posts.

## Official Source URLs

- Python SDK docs: `https://docs.together.ai/docs/python-sdk`
- Quickstart and auth: `https://docs.together.ai/docs/quickstart`
- API reference landing page: `https://docs.together.ai/reference/`
- PyPI package: `https://pypi.org/project/together/`
- Official repository: `https://github.com/togethercomputer/together-python`
