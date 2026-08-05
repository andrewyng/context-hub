---
name: core
description: "langchain-core package guide for Python covering runnables, prompt templates, messages, tools, config, and tracing handoff points"
metadata:
  languages: "python"
  versions: "1.4.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "langchain-core,langchain,python,llm,runnables,prompts,tools,langsmith"
---

# langchain-core Python Package Guide

## What It Is

`langchain-core` is the base abstractions package for LangChain Python apps.

Use it when you need:

- prompt templates and message objects
- runnable composition with the LangChain Expression Language (LCEL)
- tool definitions and schemas
- output parsers, documents, callbacks, and shared config plumbing

Important boundary: `langchain-core` does not ship provider clients, embeddings, or vector store integrations. For real model calls, pair it with an integration package such as `langchain-openai`, `langchain-anthropic`, or another provider package.

Common imports:

- `langchain_core.prompts`
- `langchain_core.messages`
- `langchain_core.runnables`
- `langchain_core.tools`
- `langchain_core.output_parsers`

## Version Covered

- Package: `langchain-core`
- Ecosystem: `pypi`
- Target version: `1.4.0`
- PyPI latest on 2026-05-29: `1.4.0`
- Requires Python: `>=3.10,<4.0`
- Registry URL: `https://pypi.org/project/langchain-core/`
- Canonical API reference root used for this entry: `https://reference.langchain.com/python/langchain_core/`

Version note:

- The docs URL `https://python.langchain.com/api_reference/core/` now redirects to the canonical reference site under `reference.langchain.com`.
- The package is on the LangChain `1.x` line. Prefer current `langchain_core.*` imports and current reference docs over older `0.x` blog posts.

## Install

Pin the version used here when you need reproducible behavior:

```bash
python -m pip install "langchain-core==1.4.0"
```

If you are building an actual application, you will usually install at least one provider integration too:

```bash
python -m pip install "langchain-core==1.4.0" "langchain-openai"
```

## Recommended Setup

Start by separating concerns:

- use `langchain-core` for composition and types
- use an integration package for model or embedding access
- keep provider credentials in environment variables owned by the integration package

For pure `langchain-core` experiments, no API key is required.

## Core Usage

### Prompt Templates And Messages

`ChatPromptTemplate` builds a chat prompt from message-like tuples and returns a prompt value that downstream runnables can consume.

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate(
    [
        ("system", "Reply in one short sentence."),
        ("human", "Explain {topic}."),
    ]
)

prompt_value = prompt.invoke({"topic": "Python context managers"})

for message in prompt_value.to_messages():
    print(type(message).__name__, message.content)
```

Use this when you want prompt construction to stay explicit and testable before you attach a model.

### Runnable Composition With LCEL

`RunnableLambda` turns a Python callable into a runnable, and the `|` operator composes runnables into a sequence.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

prompt = ChatPromptTemplate(
    [
        ("system", "Be concise."),
        ("human", "Summarize {topic} in one sentence."),
    ]
)

def mock_model(prompt_value) -> str:
    last_message = prompt_value.to_messages()[-1].content
    return f"Stub answer for: {last_message}"

chain = prompt | RunnableLambda(mock_model)

print(chain.invoke({"topic": "LCEL"}))
```

Practical interface to remember:

- `invoke(...)` for one input
- `ainvoke(...)` for async use
- `batch([...])` for many inputs
- `stream(...)` and `astream(...)` when the runnable supports streaming

### Parallel Fan-Out

Use `RunnableParallel` when the same input should feed multiple branches.

```python
from langchain_core.runnables import RunnableLambda, RunnableParallel

analysis = RunnableParallel(
    original=RunnableLambda(lambda x: x["text"]),
    upper=RunnableLambda(lambda x: x["text"].upper()),
    word_count=RunnableLambda(lambda x: len(x["text"].split())),
)

result = analysis.invoke({"text": "langchain core keeps abstractions reusable"})
print(result)
```

This pattern is useful for enrichment pipelines, feature extraction, or preparing multiple prompt inputs from one request payload.

### Tools

Use `@tool` when you need a callable with a name, description, and argument schema that an agent or model integration can consume.

```python
from langchain_core.tools import tool

@tool
def lookup_order(order_id: str) -> str:
    """Return a stub shipping status for an order."""
    return f"{order_id}: shipped"

print(lookup_order.name)
print(lookup_order.invoke({"order_id": "A-100"}))
```

Practical rule: include type hints and a useful docstring. That gives the tool a better schema and description.

### Runnable Config

Use `with_config(...)` to attach run metadata, tags, callbacks, or configurable values without rewriting the runnable itself.

```python
from langchain_core.runnables import RunnableLambda

uppercase = RunnableLambda(lambda text: text.upper()).with_config(
    run_name="uppercase_demo",
    tags=["demo", "langchain-core"],
    metadata={"package": "langchain-core"},
)

print(uppercase.invoke("hello"))
```

Common config keys worth knowing:

- `run_name`
- `tags`
- `metadata`
- `callbacks`
- `max_concurrency`
- `recursion_limit`
- `configurable`

## Auth And Configuration

### No Provider Auth In langchain-core Itself

`langchain-core` is intentionally provider-agnostic. It does not define an API key environment variable of its own for model access.

For actual model calls:

1. install the matching integration package
2. set that provider's environment variables
3. compose the provider runnable with your `langchain_core` prompt or tool pipeline

Example with the official LangChain OpenAI integration:

```bash
python -m pip install "langchain-openai"
export OPENAI_API_KEY="sk-..."
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate(
    [
        ("system", "Reply tersely."),
        ("human", "Summarize {topic} in one sentence."),
    ]
)

model = ChatOpenAI(model="gpt-4.1-mini")
chain = prompt | model

print(chain.invoke({"topic": "LangChain"}).content)
```

### Optional LangSmith Tracing

If you want tracing and observability, LangChain's docs point to LangSmith environment variables:

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="lsv2_..."
export LANGSMITH_PROJECT="my-project"
```

This is optional. Pure `langchain-core` composition does not require LangSmith.

## Common Pitfalls

- `langchain-core` is not the full application stack. If you need a hosted model, vector store, or retriever integration, install the relevant integration package too.
- `ChatPromptTemplate.invoke(...)` returns a prompt value with message objects, not a plain string. Downstream code must accept prompt values or messages.
- `RunnableLambda` is convenient for normal Python logic, but the official reference notes it is best for code that does not need token-by-token streaming support.
- Tool schemas are only as good as the underlying function signature and docstring. Untyped or poorly described callables produce weaker tool metadata.
- Older LangChain examples on the web may still target pre-`1.0` imports or the older docs hostname. Prefer the current `reference.langchain.com` pages for `1.4.0`.

## Version-Sensitive Notes

- This entry is pinned to `1.4.0`, and that version matches the current PyPI latest on 2026-05-29.
- LangChain's install docs emphasize a package split: keep `langchain-core` for abstractions and add integrations separately.
- When copying examples, check whether the snippet depends only on `langchain-core` or also on `langchain`, `langgraph`, LangSmith, or a provider package. Many official examples span more than one package.

## Official Sources Used For This Entry

- PyPI package page: `https://pypi.org/project/langchain-core/`
- PyPI release history: `https://pypi.org/project/langchain-core/#history`
- Install docs: `https://docs.langchain.com/oss/python/langchain/install`
- Canonical API reference root: `https://reference.langchain.com/python/langchain_core/`
- `RunnableLambda` reference: `https://reference.langchain.com/python/langchain_core/runnables/#langchain_core.runnables.base.RunnableLambda`
- `ChatPromptTemplate` reference: `https://reference.langchain.com/python/langchain_core/prompts/#langchain_core.prompts.chat.ChatPromptTemplate`
- LangSmith observability quickstart: `https://docs.langchain.com/langsmith/observability-quickstart`
