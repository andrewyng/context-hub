---
name: package
description: "LangChain package guide for Python with v1 agent patterns, model initialization, provider setup, and 1.3.2 notes"
metadata:
  languages: "python"
  versions: "1.3.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "langchain,python,agents,llm,rag,langgraph,langsmith"
---

# LangChain Python Package Guide

## When To Use LangChain

Use `langchain` when Python code needs:

- a standard interface for chat models, tools, messages, and agent execution
- v1 agent building on top of LangGraph
- provider-swappable model setup without rewriting the whole app
- optional observability with LangSmith

`langchain` is the high-level framework package. It does not bundle every model provider. For real model calls you usually install `langchain` plus a provider integration such as `langchain-openai` or `langchain-anthropic`.

## Version-Sensitive Notes

- This entry is pinned to the version used here `1.3.2`.
- PyPI lists `1.3.2` as the current `langchain` release on 2026-05-29.
- The docs site is a live v1 documentation site, not a patch-versioned archive. If an example behaves differently in `1.3.2`, check the LangChain release notes before assuming the docs exactly match that patch.
- PyPI metadata for `1.3.2` requires Python `>=3.10,<4.0`.
- In v1, many older pre-1.0 chains, agents, and memory helpers were moved into `langchain-classic`. Use `langchain-classic` only when maintaining legacy code. For new code, prefer the v1 `create_agent(...)` and LangGraph-based patterns.
- LangChain's versioning policy says `langchain` and `langchain-core` share major and minor versions. Integration packages such as `langchain-openai`, `langchain-anthropic`, and `langchain-community` are separately versioned. Do not assume all companion packages should match `1.3.2`.

## Install

For reproducible behavior, pin `langchain` and install the provider integration you actually use:

```bash
python -m pip install "langchain==1.3.2" "langchain-openai"
```

Other common integrations follow the same pattern:

```bash
python -m pip install "langchain==1.3.2" "langchain-anthropic"
python -m pip install "langchain==1.3.2" "langchain-community"
```

If you need production memory or checkpoint persistence, install the relevant LangGraph checkpoint package separately. The official install docs use packages such as `langgraph-checkpoint-postgres`.

## Recommended Setup

Set provider credentials in environment variables. The exact variable depends on the model provider package you install.

OpenAI example:

```bash
export OPENAI_API_KEY="sk-..."
```

Optional LangSmith tracing:

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="lsv2_..."
```

LangChain can initialize a model from a provider-qualified string:

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("openai:gpt-4.1-mini")
```

That requires the corresponding provider package to be installed. If `langchain-openai` is missing, model initialization will fail even though `langchain` itself is installed.

## Core Usage

### Initialize And Call A Chat Model

Use `init_chat_model(...)` for direct model access when you do not need an agent loop:

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("openai:gpt-4.1-mini")

response = model.invoke("Write a one-sentence summary of LangChain.")
print(response.content)
```

This gives you the standard LangChain chat-model interface and keeps provider-specific client setup behind the integration package.

### Create A Basic Agent

For tool-using workflows, use `create_agent(...)` in v1:

```python
from langchain.agents import create_agent

def get_weather(city: str) -> str:
    return f"It is always sunny in {city}!"

agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[get_weather],
    system_prompt="You are a concise assistant.",
)

result = agent.invoke(
    {
        "messages": [
            {"role": "user", "content": "What is the weather in San Francisco?"}
        ]
    }
)

print(result["messages"][-1].content)
```

Practical notes:

- Pass a provider-qualified model string like `openai:gpt-4.1-mini`, or pass a model object created with `init_chat_model(...)`.
- Agent input is message-based. For agent flows, the stable shape to reach for is a dict with a `messages` list.
- Tool functions should have clear type hints and simple signatures. LangChain uses those to build tool schemas.

### Model And Provider Configuration

Two setup patterns are most useful:

1. Initialize the model once and reuse it.
2. Keep provider credentials outside source code.

Example with explicit configuration:

```python
from langchain.chat_models import init_chat_model

model = init_chat_model(
    "openai:gpt-4.1-mini",
    temperature=0,
)

reply = model.invoke("Return exactly three bullet points about Python packaging.")
print(reply.content)
```

If your team switches providers, change the model string and install the new integration package. The surrounding LangChain code can often stay the same.

### LangSmith Tracing

If you set `LANGSMITH_TRACING=true` and `LANGSMITH_API_KEY`, LangChain will emit traces to LangSmith for supported workflows. Use this when you need to inspect prompts, model calls, tool steps, and agent state transitions.

Tracing is optional. Do not hard-code LangSmith credentials into application code or example files.

## Common Pitfalls

- Installing only `langchain` is not enough for real provider calls. Also install the provider package such as `langchain-openai`.
- Many search results still show pre-v1 imports and abstractions such as `LLMChain`, older agent executors, or legacy memory classes. Treat those as migration material, not the default pattern for new code.
- The docs site is current-state documentation. When you are pinned to `1.3.2`, verify behavior against PyPI release history and LangChain release notes if you hit a mismatch.
- Companion packages are versioned independently. Avoid blanket pinning every `langchain-*` package to `1.3.2` unless that package actually uses that version line.
- Agent code expects message-oriented state. If you pass the wrong input shape to `agent.invoke(...)`, failures are often schema or state errors rather than model errors.
- LangSmith tracing is useful in development, but it can leak sensitive inputs if you enable it indiscriminately in production environments.

## What To Reach For First

- Use `init_chat_model(...)` when you only need direct model invocation.
- Use `create_agent(...)` when the workflow needs tools or a ReAct-style loop.
- Use provider integration packages for actual model access.
- Use `langchain-classic` only to keep older code running while you migrate.

## Official Sources Used

- LangChain Python docs root: `https://python.langchain.com/docs/`
- LangChain install docs: `https://python.langchain.com/docs/how_to/installation/`
- LangChain quickstart: `https://python.langchain.com/docs/tutorials/llm_chain/`
- LangChain models guide: `https://python.langchain.com/docs/how_to/chat_models_universal_init/`
- LangChain v1 release notes: `https://docs.langchain.com/oss/python/releases/langchain-v1`
- LangChain versioning policy: `https://docs.langchain.com/oss/python/release-policy`
- LangChain GitHub README: `https://github.com/langchain-ai/langchain`
- PyPI package page: `https://pypi.org/project/langchain/`
- PyPI release history: `https://pypi.org/project/langchain/#history`
