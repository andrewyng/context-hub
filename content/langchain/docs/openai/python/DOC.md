---
name: openai
description: "langchain-openai package guide for Python covering ChatOpenAI, OpenAIEmbeddings, Responses API, Azure setup, and 1.2.2 notes"
metadata:
  languages: "python"
  versions: "1.2.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "langchain-openai,langchain,openai,python,llm,embeddings,azure-openai"
---

# langchain-openai Python Package Guide

## What It Is

`langchain-openai` is LangChain's maintained Python integration for OpenAI and Azure OpenAI models.

Use it when you need:

- `ChatOpenAI` for chat and responses-style model calls
- `OpenAIEmbeddings` for embeddings
- `AzureChatOpenAI` or `AzureOpenAIEmbeddings` for traditional Azure-specific setup
- LangChain-native features such as tool binding, structured output, async calls, and streaming on top of OpenAI models

Important boundary: `langchain-openai` is an integration package, not the full framework. Install `langchain` or `langchain-core` alongside it when your app also needs prompts, runnables, agents, or graph orchestration.

## Version-Sensitive Notes

- This entry is pinned to the version used here `1.2.2`.
- PyPI shows `1.2.2` as the current release on 2026-05-29, so the version used here matches upstream for review.
- The docs URL `https://python.langchain.com/api_reference/openai/` is a legacy LangChain API-reference landing page. Current conceptual guides live under `docs.langchain.com`, and the current Python API reference is under `reference.langchain.com`.
- LangChain's release policy treats integration packages such as `langchain-openai` as separately versioned packages. Do not assume they should match `langchain` or `langchain-core` patch versions.
- Official docs note that `ChatOpenAI` can automatically use the OpenAI Responses API in some cases and can be forced with `use_responses_api=True`. If behavior matters, test against the exact model and request shape you use.
- Official docs also note that, as of `langchain-openai >= 1.0.1`, `ChatOpenAI` and `OpenAIEmbeddings` can target Azure OpenAI's v1 API directly. Older Azure-specific examples may still use `AzureChatOpenAI` and `AzureOpenAIEmbeddings`.
- The current chat integration guide marks OpenAI tool search and related newer features as requiring recent `langchain-openai >= 1.1.x` versions, so this pinned version is new enough for those features.

## Install

Pin the integration package and whichever LangChain package your app actually uses:

```bash
python -m pip install "langchain-openai==1.2.2" "langchain-core"
```

Typical application install:

```bash
python -m pip install "langchain==1.3.2" "langchain-openai==1.2.2"
```

If you are using Azure and want to stay close to LangChain's Azure-specific examples, the same package provides those classes:

```bash
python -m pip install "langchain-openai==1.2.2"
```

## Auth And Setup

### OpenAI

Set credentials in the environment before constructing models or embeddings:

```bash
export OPENAI_API_KEY="sk-..."
```

Basic model setup:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4.1-mini",
    temperature=0,
)
```

You can also pass request/client settings directly:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4.1-mini",
    organization="org_...",
    timeout=30,
    max_retries=2,
)
```

### Azure OpenAI

For traditional Azure-specific setup, use the Azure classes and Azure environment variables:

```bash
export AZURE_OPENAI_API_KEY="..."
export AZURE_OPENAI_ENDPOINT="https://my-resource.openai.azure.com/"
export AZURE_OPENAI_API_VERSION="2024-10-21"
```

```python
from langchain_openai import AzureChatOpenAI

llm = AzureChatOpenAI(
    azure_deployment="gpt-4.1-mini",
    api_version="2024-10-21",
    temperature=0,
)
```

For Azure's newer v1 API shape, official docs say `ChatOpenAI` and `OpenAIEmbeddings` can also be pointed at an Azure `.../openai/v1/` base URL directly in modern `1.x` releases.

## Core Usage

### Basic Chat Invocation

Use `invoke(...)` for a single request and read the returned `AIMessage`:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0)

response = llm.invoke("Give me a one-sentence summary of LangChain.")
print(response.content)
```

Message-based input works too:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0)

response = llm.invoke(
    [
        ("system", "Reply in JSON."),
        ("human", "Return the keys name and role for Ada Lovelace."),
    ]
)
print(response.content)
```

### Tool Calling

`ChatOpenAI` supports LangChain tool binding:

```python
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

@tool
def get_weather(city: str) -> str:
    """Return a stub weather string."""
    return f"{city}: sunny"

llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0)
llm_with_tools = llm.bind_tools([get_weather])

response = llm_with_tools.invoke("What is the weather in San Francisco?")
print(response.tool_calls)
```

Use this when you want the model to choose tools through LangChain's standard tool interface instead of calling the OpenAI SDK directly.

### Structured Output

For typed extraction, use `with_structured_output(...)`:

```python
from pydantic import BaseModel
from langchain_openai import ChatOpenAI

class Person(BaseModel):
    name: str
    role: str

llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0)
structured_llm = llm.with_structured_output(Person)

person = structured_llm.invoke("Ada Lovelace was an early computing pioneer.")
print(person)
```

Official docs call out modern methods such as `json_schema` for OpenAI's structured output support. Prefer current structured-output helpers over older prompt-only JSON parsing.

### Responses API And Conversation State

Official docs describe two patterns worth knowing:

- force the Responses API path with `use_responses_api=True` when you need Responses-specific behavior
- use `previous_response_id` or automatic conversation-state management when you want the model to continue from a prior response in supported flows

Example:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4.1-mini",
    use_responses_api=True,
)

response = llm.invoke("List three uses for embeddings.")
print(response.content)
```

If you rely on Responses-specific content blocks or reasoning output, verify the exact response shape in your tests before hard-coding assumptions.

### Streaming

Use `.stream(...)` for incremental tokens. If you need token usage with streaming, the docs call out `stream_usage=True`.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4.1-mini",
    stream_usage=True,
)

for chunk in llm.stream("Write a short haiku about Python packaging."):
    print(chunk.content, end="")
```

### Embeddings

Use `OpenAIEmbeddings` for text/vector generation:

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

vector = embeddings.embed_query("LangChain integrates models into one interface.")
print(len(vector))
```

Batch embedding:

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vectors = embeddings.embed_documents(
    [
        "first document",
        "second document",
    ]
)
print(len(vectors), len(vectors[0]))
```

For `text-embedding-3-*` models, the official reference documents a `dimensions` option when you need smaller vectors:

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
    dimensions=1024,
)
```

## Common Configuration Choices

- `model`: OpenAI or Azure deployment/model identifier
- `temperature`: randomness for chat models
- `timeout`: request timeout
- `max_retries`: client retry count
- `base_url`: alternate API base, including modern Azure v1 endpoints
- `organization`: OpenAI org when applicable
- `stream_usage`: include usage metadata during streaming
- `reasoning`: reasoning controls for supported OpenAI reasoning-capable models

Keep these in constructor arguments or environment variables, not hard-coded inside prompts or helper functions.

## Common Pitfalls

- Installing `langchain-openai` alone is not enough if your code also imports `langchain` or `langchain_core` abstractions.
- Do not assume every `langchain-*` package should share the same version number. `langchain-openai` is separately versioned.
- Older blog posts often show legacy `OpenAI` completion classes or pre-Responses OpenAI behavior. For new code, prefer `ChatOpenAI` unless you specifically need older completion behavior.
- The hosted docs are live product docs, not an archive pinned to `1.2.2`. If you are debugging a version-specific mismatch, check PyPI release history and the LangChain release policy before copying a newer example verbatim.
- When streaming, usage metadata is not automatic in all paths. If your code depends on token counts, enable the documented usage option and test it.
- If you are targeting Azure, do not mix OpenAI and Azure environment variables casually. Pick either the Azure-specific class pattern or the Azure v1 `base_url` pattern and keep the configuration consistent.
- `OpenAIEmbeddings.dimensions` applies to the newer embedding models; do not assume every model supports custom dimensions.
- `langchain-openai` is designed around OpenAI's API semantics. OpenAI-compatible third-party providers may need extra parameters or different behavior that LangChain intentionally does not preserve.

## What To Reach For First

- Use `ChatOpenAI` for most OpenAI model calls in LangChain.
- Use `OpenAIEmbeddings` for retrieval, semantic search, and vector indexing.
- Use `with_structured_output(...)` for typed extraction.
- Use `bind_tools(...)` when you need model-driven tool selection.
- Use `AzureChatOpenAI` or `AzureOpenAIEmbeddings` when your codebase already follows the Azure-specific configuration pattern.

## Official Sources Used

- `https://python.langchain.com/api_reference/openai/`
- `https://docs.langchain.com/oss/python/integrations/chat/openai`
- `https://docs.langchain.com/oss/python/integrations/text_embedding/openai`
- `https://reference.langchain.com/python/integrations/langchain_openai`
- `https://docs.langchain.com/oss/python/release-policy`
- `https://pypi.org/project/langchain-openai/`
