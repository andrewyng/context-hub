---
name: ai
description: "PydanticAI framework for building typed Python agents with tools, structured output, message history, and multi-provider model support"
metadata:
  languages: "python"
  versions: "1.104.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "pydantic-ai,python,agents,llm,pydantic,tools,structured-output"
---

# PydanticAI Python Package Guide

## Golden Rule

Use `pydantic-ai` when you want typed agent workflows in Python, but treat it as an orchestration layer, not a model provider. The package gives you `Agent`, tool registration, dependency injection, structured output validation, message history, and provider abstractions; you still need to pick a model backend and configure its credentials separately.

## Install

Install the full package when you want the default provider integrations and optional observability dependencies:

```bash
python -m pip install "pydantic-ai==1.104.0"
```

Common alternatives:

```bash
uv add "pydantic-ai==1.104.0"
poetry add "pydantic-ai==1.104.0"
```

If you want a smaller install and only the providers you actually use, install `pydantic-ai-slim` with extras:

```bash
python -m pip install "pydantic-ai-slim[openai]==1.104.0"
python -m pip install "pydantic-ai-slim[anthropic]==1.104.0"
python -m pip install "pydantic-ai-slim[logfire]==1.104.0"
```

Use the non-slim package unless dependency size is a real constraint. Agents often fail by installing `pydantic-ai-slim` with no provider extras, then trying to use a provider client that was never installed.

## Model And Credential Setup

The shortest path is to choose a model with the `provider:model_name` shorthand:

```python
from pydantic_ai import Agent

agent = Agent("openai:gpt-4o")
```

For OpenAI-backed models, set `OPENAI_API_KEY` before running the agent:

```bash
export OPENAI_API_KEY="sk-..."
```

Then use the agent normally:

```python
from pydantic_ai import Agent

agent = Agent(
    "openai:gpt-4o",
    instructions="Be concise and return plain text.",
)
```

If you need a custom base URL or a preconfigured provider client, instantiate the provider explicitly:

```python
from openai import AsyncOpenAI
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIResponsesModel
from pydantic_ai.providers.openai import OpenAIProvider

client = AsyncOpenAI(
    api_key="token-from-secret-store",
    base_url="https://my-proxy.example/v1",
)

model = OpenAIResponsesModel(
    "gpt-4o",
    provider=OpenAIProvider(openai_client=client),
)

agent = Agent(model)
```

Notes:

- `pydantic-ai` supports multiple providers; each provider has its own auth rules and environment variables.
- Use provider shorthand only when the provider can be inferred cleanly from the model string.
- For OpenAI-compatible gateways, the docs distinguish native OpenAI models from gateway-style provider routing such as `gateway/openai:...`; copy the provider syntax from the relevant provider page, not from blog posts.

## Core Usage

### Minimal agent

```python
from pydantic_ai import Agent

agent = Agent(
    "openai:gpt-4o",
    instructions="You are a helpful Python assistant.",
)

result = agent.run_sync("Write a slugify function.")
print(result.output)
```

`run_sync()` is fine for scripts and CLIs. In async applications, prefer `await agent.run(...)`.

### Typed structured output

Use `output_type` to validate the final output against a Pydantic model:

```python
from pydantic import BaseModel
from pydantic_ai import Agent

class City(BaseModel):
    name: str
    country_code: str

agent = Agent(
    "openai:gpt-4o",
    instructions="Extract a city from the prompt.",
    output_type=City,
)

result = agent.run_sync("The conference is in Berlin, Germany.")
print(result.output.name)
print(result.output.country_code)
```

When you need more control over how output is enforced, `pydantic-ai` also documents `NativeOutput`, `ToolOutput`, `PromptedOutput`, and `TextOutput`.

### Tools with typed context

Use `@agent.tool` when the tool needs a `RunContext` and shared dependencies:

```python
from dataclasses import dataclass

from pydantic_ai import Agent, RunContext

@dataclass
class SupportDeps:
    customer_tier: str

agent = Agent(
    "openai:gpt-4o",
    deps_type=SupportDeps,
    instructions="Answer using the available support lookup tools.",
)

@agent.tool
def current_tier(ctx: RunContext[SupportDeps]) -> str:
    return ctx.deps.customer_tier

result = agent.run_sync(
    "What support level does this customer have?",
    deps=SupportDeps(customer_tier="gold"),
)
print(result.output)
```

Use `@agent.tool_plain` only for tools that do not need `ctx`.

### Continue a conversation with message history

Persist message history from one run and pass it back into the next run:

```python
from pydantic_ai import Agent

agent = Agent("openai:gpt-4o")

first = agent.run_sync("My name is Sam.")
second = agent.run_sync(
    "What is my name?",
    message_history=first.all_messages(),
)

print(second.output)
```

For storage or replay, the docs also cover serializing messages to JSON and restoring them later.

## Output And Tooling Patterns

- Prefer `output_type=MyModel` when downstream code needs typed data instead of free-form text.
- Keep tool signatures simple and well-typed. `pydantic-ai` uses schema generation from type hints and docstrings, so vague signatures degrade tool calling quality.
- Add parameter descriptions in docstrings when a tool has multiple arguments or ambiguous names.
- Use plain text output only when you truly want prose. Most automation flows are easier to test and safer to maintain with typed output.

## Testing

The testing docs provide purpose-built model doubles such as `TestModel` and `FunctionModel`, which are better than hitting real providers in unit tests.

Typical test pattern:

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent(TestModel(), instructions="Return a greeting.")

result = agent.run_sync("Say hello.")
assert result.output is not None
```

Practical guidance:

- Keep real model calls out of unit tests.
- Use `FunctionModel` when you want deterministic behavior for tool and output validation logic.
- If your test suite imports modules that construct agents at import time, make sure model requests are disabled unless the test explicitly opts into live calls.

## MCP And Ecosystem Features

`pydantic-ai` can expose Model Context Protocol toolsets via stdio or HTTP transports. Use the built-in MCP support when your agent should call external tool servers instead of registering every tool locally.

The package also integrates with Pydantic Logfire for tracing and observability. If you want built-in instrumentation, install the appropriate extra and enable instrumentation from the Logfire docs before debugging production agent behavior.

## Common Pitfalls

- `pydantic-ai` is not the same package as `pydantic`. Installing one does not install the other workflow assumptions you may need.
- The package name is `pydantic-ai`, but imports are from `pydantic_ai`.
- If you use `pydantic-ai-slim`, install the provider extras you need or your provider integration may fail at runtime.
- Older examples may use deprecated terminology like `result_type` or refer to `result.data`; current docs use `output_type` and `result.output`.
- `message_history` must come from compatible message objects; do not pass arbitrary chat dicts from another SDK without adapting them first.
- Tool schemas come from annotations and docstrings. Missing descriptions or overly broad `dict`/`Any` types make tool calling worse.
- `run_sync()` blocks. In FastAPI, asyncio workers, or other async runtimes, use `await agent.run(...)` instead.
- Provider credentials are separate from `pydantic-ai` itself. `pip install pydantic-ai` does not configure `OPENAI_API_KEY`, Anthropic keys, or any gateway tokens.

## Version-Sensitive Notes For 1.104.0

- PyPI and the official docs currently align on `1.104.0` as of 2026-05-29; the package requires Python `>=3.10`.
- `1.104.0` is in the stable `1.x` line. The official version policy says `v1` should avoid intentional breaking changes in minor releases; treat pre-v1 blog posts and old examples as suspect.
- The `1.x` line has moved quickly since `1.0`; minor version jumps add provider integrations, MCP transports, and observability surfaces rather than breaking the agent API.
- The docs still call out some beta surfaces in the broader ecosystem, especially around `pydantic_graph`. Do not assume beta-marked pieces have the same stability guarantees as the core agent APIs.
- If you are migrating from older `0.x` examples, prefer the current docs for naming and result handling. The modern API centers on `Agent`, `instructions`, `output_type`, `RunContext`, and `result.output`.

## Official Sources

- Docs root: `https://ai.pydantic.dev/`
- Installation: `https://ai.pydantic.dev/install/`
- Agent API: `https://ai.pydantic.dev/agent/`
- Models overview: `https://ai.pydantic.dev/models/overview/`
- OpenAI provider: `https://ai.pydantic.dev/models/openai/`
- Tools: `https://ai.pydantic.dev/tools/`
- Dependencies: `https://ai.pydantic.dev/dependencies/`
- Message history: `https://ai.pydantic.dev/message-history/`
- Output: `https://ai.pydantic.dev/output/`
- MCP: `https://ai.pydantic.dev/mcp/`
- Testing: `https://ai.pydantic.dev/testing/`
- Version policy: `https://ai.pydantic.dev/version-policy/`
- PyPI: `https://pypi.org/project/pydantic-ai/`
