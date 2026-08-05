---
name: package
description: "Cohere Python SDK guide for chat, embeddings, rerank, classification, and async usage"
metadata:
  languages: "python"
  versions: "7.0.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "cohere,python,llm,chat,embeddings,rerank"
---

# Cohere Python Package Guide

## When To Use This

Use the official `cohere` PyPI package when a Python project needs Cohere-hosted chat, embeddings, reranking, or classification APIs.

- Ecosystem: `pypi`
- Package: `cohere`
- Import: `import cohere`
- Version covered here: `7.0.2`
- Official docs root: `https://docs.cohere.com/`
- Reference landing page: `https://docs.cohere.com/reference/about`

## Installation

Install the package directly:

```bash
pip install cohere==7.0.2
```

If the project does not need an exact pin, `pip install cohere` is the normal install path.

## Authentication And Setup

The official Python SDK examples use the `CO_API_KEY` environment variable.

```bash
export CO_API_KEY="your-cohere-api-key"
```

Create a sync or async v2 client:

```python
import os
import cohere

co = cohere.ClientV2(api_key=os.environ["CO_API_KEY"])
```

```python
import os
import cohere

co = cohere.AsyncClientV2(api_key=os.environ["CO_API_KEY"])
```

Notes:

- Prefer environment variables over hardcoded API keys.
- Treat `ClientV2` and `AsyncClientV2` as the default entry points for new code.
- For request failures, catch `cohere.core.api_error.ApiError`.

## Core Usage

### Chat

Use `messages=[...]` with explicit roles. Newer v2 examples are message-based, not a single prompt string.

```python
import os
import cohere

co = cohere.ClientV2(api_key=os.environ["CO_API_KEY"])

response = co.chat(
    model="command-a-03-2025",
    messages=[
        {"role": "user", "content": "Summarize why vector search is useful."}
    ],
)

print(response.message.content[0].text)
```

### Async Chat

Use `AsyncClientV2` inside an async function and `await` the request.

```python
import asyncio
import os
import cohere

async def main() -> None:
    co = cohere.AsyncClientV2(api_key=os.environ["CO_API_KEY"])
    response = await co.chat(
        model="command-a-03-2025",
        messages=[
            {"role": "user", "content": "Give me a two-line release note summary."}
        ],
    )
    print(response.message.content[0].text)

asyncio.run(main())
```

### Streaming Chat

Use `chat_stream` to consume tokens as they arrive. Events are typed; check the `type` field before reading deltas.

```python
import os
import cohere

co = cohere.ClientV2(api_key=os.environ["CO_API_KEY"])

stream = co.chat_stream(
    model="command-a-03-2025",
    messages=[{"role": "user", "content": "Count from 1 to 5."}],
)

for event in stream:
    if event.type == "content-delta":
        text = event.delta.message.content.text
        if text:
            print(text, end="", flush=True)
print()
```

### Tool / Function Calling

Pass JSON-schema tool definitions and inspect `tool_calls` on the returned message.

```python
import os
import cohere

co = cohere.ClientV2(api_key=os.environ["CO_API_KEY"])

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

response = co.chat(
    model="command-a-03-2025",
    messages=[{"role": "user", "content": "What is the weather in Berkeley?"}],
    tools=tools,
)

if response.message.tool_calls:
    for call in response.message.tool_calls:
        print(call.function.name, call.function.arguments)
```

The `arguments` value is a JSON string. To finish a tool round trip, append a `{"role": "tool", "tool_call_id": call.id, "content": ...}` message and call `co.chat(...)` again with the same `tools` list.

### Embeddings

For v2 embeddings, the official SDK exposes typed inputs. Set the `input_type` deliberately so retrieval code uses the correct embedding mode.

```python
import os
import cohere
from cohere.types import EmbedInput

co = cohere.ClientV2(api_key=os.environ["CO_API_KEY"])

response = co.embed(
    model="embed-v4.0",
    inputs=[
        EmbedInput(text="Store package docs for coding assistants.")
    ],
    embedding_types=["float"],
    input_type="search_document",
)

vector = response.embeddings.float_[0]
print(len(vector))
```

Use `input_type="search_query"` for the query side of retrieval and `input_type="search_document"` for indexed content.

### Rerank

Rerank is useful after an initial retrieval step. It returns relevance scores plus original indexes, so keep the original document list around.

```python
import os
import cohere

co = cohere.ClientV2(api_key=os.environ["CO_API_KEY"])

documents = [
    "Cohere provides chat models and embedding models.",
    "S3 is an object storage service.",
    "Reranking improves search result ordering.",
]

response = co.rerank(
    model="rerank-v3.5",
    query="Which document is about improving retrieval quality?",
    documents=documents,
    top_n=2,
)

for result in response.results:
    print(result.index, result.relevance_score, documents[result.index])
```

### Classification

The Python SDK still exposes classification. The API is example-driven, so pass labeled examples instead of free-form instruction text.

```python
import os
import cohere
from cohere.types import ClassifyExample

co = cohere.ClientV2(api_key=os.environ["CO_API_KEY"])

response = co.classify(
    inputs=["Confirm the meeting is still on for tomorrow."],
    examples=[
        ClassifyExample(text="Schedule a calendar event for Friday.", label="calendar"),
        ClassifyExample(text="Reply to the customer about the outage.", label="support"),
    ],
)

print(response.classifications[0].prediction)
```

## Configuration And Operational Notes

- The package name and import name are both `cohere`.
- Pin the SDK version when a project depends on generated types or exact response shapes.
- Verify model IDs in the current docs before copying an old snippet. Model names evolve independently of the SDK package version.
- Separate sync and async codepaths cleanly. Do not mix `ClientV2` and `AsyncClientV2` call patterns.
- Keep rerank input documents in memory or in a parallel structure because the API returns indexes into your submitted list.

## Common Pitfalls

- Using older examples that instantiate `cohere.Client` or older v1-style request shapes. For new work, prefer the v2 client surface.
- Passing a plain string prompt to `chat` instead of a `messages` list with roles.
- Using the wrong embedding `input_type`, which hurts retrieval quality even if the request succeeds.
- Assuming the embed response is always a plain list. In v2, embeddings are typed, for example `response.embeddings.float_`.
- Catching broad exceptions only. Use `cohere.core.api_error.ApiError` for request failures you expect from the SDK.

## Version-Sensitive Notes For `7.0.2`

- This doc is pinned to `cohere` `7.0.2`, but the official docs site is organized around the current v2 API docs rather than versioned per package release.
- `cohere` 7.x continues to expose `ClientV2` and `AsyncClientV2` as the default entry points; legacy `cohere.Client` (v1) snippets should be migrated.
- The official `cohere-python` repository includes a v4-to-v5 migration guide. If a codebase still uses pre-v5 snippets, check that guide before rewriting imports or error handling. The 6.x and 7.x lines have been incremental on top of the v5 surface.
- The docs URL points to the API reference landing page. For implementation work, the most useful current pages are under `https://docs.cohere.com/v2/docs/`.

## Official Sources

- Docs landing: https://docs.cohere.com/reference/about
- Quickstart: https://docs.cohere.com/v2/docs/quickstart
- Text generation: https://docs.cohere.com/v2/docs/text-generation
- Embeddings: https://docs.cohere.com/v2/docs/embeddings
- Rerank quickstart: https://docs.cohere.com/v2/docs/reranking-quickstart
- Classification quickstart: https://docs.cohere.com/v2/docs/classify-quickstart
- API keys: https://docs.cohere.com/v2/docs/api-keys
- PyPI: https://pypi.org/project/cohere/
- SDK repo: https://github.com/cohere-ai/cohere-python
- SDK reference markdown: https://raw.githubusercontent.com/cohere-ai/cohere-python/main/reference.md
- v4 to v5 migration guide: https://raw.githubusercontent.com/cohere-ai/cohere-python/main/migrating_v4-v5.md
