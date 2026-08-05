---
name: package
description: "PydanticAI framework for building typed Python agents with tools, structured output, message history, and multi-provider model support"
metadata:
  languages: "python"
  versions: "1.104.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "pydantic-ai,python,agents,llm,pydantic,tools,structured-output,streaming"
---

# pydantic-ai Python Package Guide

Use `pydantic-ai` as an orchestration layer for typed agent workflows in Python. It provides `Agent`, tool registration, dependency injection, structured output validation, message history, testing utilities, and provider abstractions, but you still need to choose a model backend and configure that provider's credentials.

## Install

Install the main package when you want the default provider integrations:

```bash
python -m pip install "pydantic-ai==1.104.0"
```

Common alternatives:

```bash
uv add "pydantic-ai==1.104.0"
poetry add "pydantic-ai==1.104.0"
```

If you want a smaller install, use `pydantic-ai-slim` and add extras for the providers you actually use:

```bash
python -m pip install "pydantic-ai-slim[openai]==1.104.0"
python -m pip install "pydantic-ai-slim[anthropic]==1.104.0"
python -m pip install "pydantic-ai-slim[logfire]==1.104.0"
```

The most common setup mistake is installing `pydantic-ai-slim` without the provider extra you need, then trying to use a model integration that is not installed.

## Choose A Model And Configure Credentials

The shortest path is to use the `provider:model_name` shorthand:

```python
from pydantic_ai import Agent

agent = Agent("openai:gpt-4o")
```

For OpenAI-backed models, set `OPENAI_API_KEY` before running the agent:

```bash
export OPENAI_API_KEY="sk-..."
```

Then initialize the agent with instructions and run it:

```python
from pydantic_ai import Agent

agent = Agent(
    "openai:gpt-4o",
    instructions="Be concise and return plain text.",
)

result = agent.run_sync("Write a slugify function in Python.")
print(result.output)
```

If you need a custom base URL or a preconfigured provider client, build the model explicitly:

```python
import os

from openai import AsyncOpenAI
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIResponsesModel
from pydantic_ai.providers.openai import OpenAIProvider

client = AsyncOpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url="https://my-proxy.example/v1",
)

model = OpenAIResponsesModel(
    "gpt-4o",
    provider=OpenAIProvider(openai_client=client),
)

agent = Agent(
    model,
    instructions="Answer as a helpful Python assistant.",
)
```

Each provider has its own auth and configuration rules. `pydantic-ai` does not supply provider credentials for you.

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

Use `run_sync()` for scripts and CLIs. In async applications, prefer `await agent.run(...)`.

### Structured output

Use `output_type` when downstream code needs validated data instead of free-form text:

```python
from pydantic import BaseModel
from pydantic_ai import Agent


class City(BaseModel):
    name: str
    country_code: str


agent = Agent(
    "openai:gpt-4o",
    output_type=City,
    instructions="Return a city object.",
)

result = agent.run_sync("Return London with its ISO country code.")
print(result.output.name)
print(result.output.country_code)
```

The output docs also cover `NativeOutput`, `ToolOutput`, `PromptedOutput`, and `TextOutput` when you need tighter control over how results are enforced.

### Tools with shared dependencies

Use `@agent.tool` when the tool needs a `RunContext` and typed dependencies:

```python
from dataclasses import dataclass

from pydantic_ai import Agent, RunContext


@dataclass
class SupportDeps:
    customer_tier: str


agent = Agent(
    "openai:gpt-4o",
    deps_type=SupportDeps,
    instructions="Use the available tools to answer support questions.",
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

Pass `message_history` from one run into the next run when you want multi-turn behavior:

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

The message history docs also cover serializing messages to JSON and restoring them later.

### Stream model output

Use `agent.run_stream()` for incremental text or structured deltas as the model produces them:

```python
import asyncio

from pydantic_ai import Agent

agent = Agent(
    "openai:gpt-4o",
    instructions="Answer concisely.",
)


async def main() -> None:
    async with agent.run_stream("List three primary colors.") as result:
        async for chunk in result.stream_text(delta=True):
            print(chunk, end="", flush=True)
        print()


asyncio.run(main())
```

For lower-level access to model events (tool calls, partial outputs, run-graph nodes), use `agent.run_stream_events()` or `agent.iter()`. The streaming docs describe how to combine streamed text with validated structured output.

## Testing Agents

Use the built-in test models instead of calling live providers in unit tests:

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent(TestModel(), instructions="Return a greeting.")

result = agent.run_sync("Say hello.")
assert result.output is not None
```

Use `FunctionModel` when you need deterministic behavior for tool execution or output validation logic.

## Common Pitfalls

- The PyPI package is `pydantic-ai`, but the import path is `pydantic_ai`.
- `pydantic-ai` is not the same package as `pydantic`; installing one does not replace the other.
- If you install `pydantic-ai-slim`, add the provider extras you need or provider integrations can fail at runtime.
- Older examples may use `result_type` or `result.data`; current docs use `output_type` and `result.output`.
- `message_history` expects compatible PydanticAI message objects, not arbitrary chat dictionaries from another SDK.
- Tool schemas come from type hints and docstrings; vague `dict` or `Any` types reduce tool-calling quality.
- `run_sync()` blocks the current thread. In FastAPI or other async runtimes, use `await agent.run(...)` instead.
- Provider credentials are separate from the framework itself. Installing the package does not configure `OPENAI_API_KEY` or any other provider secret.

## Version Notes For 1.104.0

- This guide targets `pydantic-ai` `1.104.0`.
- PyPI metadata for `1.104.0` requires Python `>=3.10` and lists support through `3.14`.
- The official version policy describes the `1.x` line as stable and avoids intentional breaking changes in minor releases.
- Some ecosystem surfaces (MCP integration, graph execution, Logfire evals) are documented separately and may have different stability notes than the core `Agent` APIs.
- If you are migrating from older examples, prefer the current naming and result-handling patterns: `Agent`, `instructions`, `output_type`, `RunContext`, and `result.output`. Older `result_type` / `result.data` examples predate the rename and should not be copied.

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
