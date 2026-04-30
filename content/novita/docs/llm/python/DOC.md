---
name: llm
description: "Novita AI OpenAI-compatible LLM API coding guide for Python applications using the official OpenAI SDK"
metadata:
  languages: "python"
  versions: "2.28.0"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "novita,llm,openai-compatible,python,ai"
---

# Novita AI Python LLM Coding Guide

You are a Novita AI coding expert. Help me write Python code that calls Novita's LLM API correctly.

Primary references:
- https://novita.ai/docs/guides/llm-api.md
- https://novita.ai/docs/guides/llm-batch-api.md
- https://novita.ai/docs/guides/openai-agents-sdk.md

## Golden Rule

Use the official OpenAI Python SDK against Novita's OpenAI-compatible base URL.

- **SDK:** OpenAI Python SDK
- **Package:** `openai`
- **Base URL:** `https://api.novita.ai/openai`
- **Auth:** `Authorization: Bearer <NOVITA_API_KEY>`

Novita does not require a Novita-specific Python client for basic LLM inference. Use `OpenAI` or `AsyncOpenAI` and override `base_url`.

```bash
pip install openai
```

## Initialization and API Key

Set `NOVITA_API_KEY` in the environment and create an OpenAI client with Novita's base URL.

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.novita.ai/openai",
    api_key=os.environ["NOVITA_API_KEY"],
)
```

Do not use the default OpenAI base URL when targeting Novita.

## Model Naming

Use Novita model IDs exactly as published by Novita. They are typically provider-prefixed.

Examples:
- `deepseek/deepseek-v3-0324`
- `deepseek/deepseek-r1`

Do not shorten model names to `deepseek-v3-0324` or similar aliases unless Novita's model list explicitly shows that exact ID.

## Primary API Surface

For LLM work, default to Chat Completions.

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.novita.ai/openai",
    api_key=os.environ["NOVITA_API_KEY"],
)

completion = client.chat.completions.create(
    model="deepseek/deepseek-v3-0324",
    messages=[
        {"role": "system", "content": "You are a concise coding assistant."},
        {"role": "user", "content": "Explain what a Python context manager does."},
    ],
    max_tokens=512,
)

print(completion.choices[0].message.content)
```

Novita also supports the legacy Completions endpoint for prompt-style requests:

```python
completion = client.completions.create(
    model="deepseek/deepseek-r1",
    prompt="Write a three-line summary of rate limiting.",
    max_tokens=256,
)

print(completion.choices[0].text)
```

## Streaming

Use streaming for interactive output and long responses.

```python
stream = client.chat.completions.create(
    model="deepseek/deepseek-r1",
    messages=[
        {"role": "user", "content": "Give me a step-by-step debugging checklist."},
    ],
    max_tokens=1024,
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content or ""
    print(delta, end="", flush=True)
```

## Async Usage

```python
import asyncio
import os
from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url="https://api.novita.ai/openai",
    api_key=os.environ["NOVITA_API_KEY"],
)

async def main():
    completion = await client.chat.completions.create(
        model="deepseek/deepseek-v3-0324",
        messages=[{"role": "user", "content": "List three Python testing tips."}],
        max_tokens=256,
    )
    print(completion.choices[0].message.content)

asyncio.run(main())
```

## Common Parameters

Common Novita LLM request parameters match the OpenAI-compatible schema:

- `model`: required model ID
- `messages`: required for chat completions
- `prompt`: required for legacy completions
- `max_tokens`: output cap
- `stream`: enable token streaming
- `temperature`, `top_p`, `top_k`: generation controls
- `presence_penalty`, `frequency_penalty`, `repetition_penalty`: repetition controls
- `stop`: stop sequences

Prefer changing `temperature` or `top_p`, not both at once, unless you have a specific reason.

## OpenAI Agents SDK Compatibility

Novita works with OpenAI Agents SDK in compatibility mode, but there is one important caveat:

- Novita does **not** support the OpenAI `responses` API for that integration path
- configure the Agents SDK to use `chat_completions`

See `references/openai-agents-sdk.md` for the exact setup pattern.

## Batch API

Use the Batch API when you need asynchronous processing for many requests and can wait up to 48 hours for results.

See `references/batch.md` for:
- JSONL request format
- file upload flow
- batch creation and polling
- output retrieval and retention rules

## Gotchas

- Always set `base_url="https://api.novita.ai/openai"`.
- Always send auth as a Bearer token.
- Use Novita model IDs exactly as listed by Novita.
- Batch input files must use JSONL, with one request per line and a unique `custom_id`.
- All requests in one batch file must target the same model.
- Batch output files should be downloaded promptly after completion; official docs say output files are not retained indefinitely.
- If an integration example assumes OpenAI Responses API, verify Novita compatibility before copying it.

## When Not to Use This Entry

This entry is for Novita's OpenAI-compatible LLM APIs only.

Do not use it for:
- image, audio, or video generation
- serverless GPU endpoints
- GPU instance lifecycle management
- Agent Sandbox runtime operations

## Additional Files

For deeper workflows, use:
- `references/batch.md`
- `references/openai-agents-sdk.md`
