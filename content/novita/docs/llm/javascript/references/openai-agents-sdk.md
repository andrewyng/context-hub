# Novita with OpenAI Agents SDK

Use this reference when integrating Novita's LLM endpoint with the OpenAI Agents SDK.

Primary source: https://novita.ai/docs/guides/openai-agents-sdk.md

## Compatibility Rule

Novita supports the OpenAI Agents SDK through the chat-completions path.

Important caveat:
- Novita does **not** support the `responses` API for this integration pattern
- explicitly switch the Agents SDK to `chat_completions`

Novita's official guide is Python-based, but the compatibility rule matters even if your surrounding application has JavaScript or TypeScript components.

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
```

## Common Mistakes

- assuming the Agents SDK can use the Responses API unchanged
- pointing the OpenAI client at the wrong base URL
- using a model name without the Novita provider prefix

## When to Reach for This

Use this reference when:
- you are wiring Novita into an Agents SDK workflow
- you need handoffs, tools, or multi-agent orchestration
- standard chat-completions usage is already working and you want to layer agents on top

If your integration is entirely JavaScript, verify the agent framework and SDK combination first; Novita's official compatibility page currently documents the Python Agents SDK path.
