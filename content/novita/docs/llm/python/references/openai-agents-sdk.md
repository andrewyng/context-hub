# Novita with OpenAI Agents SDK

Use this reference when integrating Novita's LLM endpoint with the OpenAI Agents SDK.

Primary source: https://novita.ai/docs/guides/openai-agents-sdk.md

## Compatibility Rule

Novita supports the OpenAI Agents SDK through the chat-completions path.

Important caveat:
- Novita does **not** support the `responses` API for this integration pattern
- explicitly switch the Agents SDK to `chat_completions`

## Minimal Setup

```python
import os
from openai import AsyncOpenAI
from agents import (
    Agent,
    Runner,
    set_default_openai_api,
    set_default_openai_client,
    set_tracing_disabled,
)

set_default_openai_api("chat_completions")
set_default_openai_client(
    AsyncOpenAI(
        base_url="https://api.novita.ai/openai",
        api_key=os.environ["NOVITA_API_KEY"],
    )
)
set_tracing_disabled(disabled=True)

agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant.",
    model=os.environ["MODEL_NAME"],
)

result = Runner.run_sync(agent, "Write a haiku about recursion.")
print(result.final_output)
```

## Required Environment Variables

- `NOVITA_API_KEY`
- `MODEL_NAME`

Use a real Novita model ID such as `deepseek/deepseek-v3-0324`.

## Common Mistakes

- forgetting to set `set_default_openai_api("chat_completions")`
- leaving the client pointed at OpenAI instead of Novita
- using a model name that omits the provider prefix
- assuming every OpenAI Agents SDK example works unchanged against Novita

## When to Reach for This

Use this reference when:
- you are wiring Novita into an existing Agents SDK app
- you need handoffs, tools, or multi-agent orchestration
- standard chat-completions usage is already working and you want to layer agents on top
