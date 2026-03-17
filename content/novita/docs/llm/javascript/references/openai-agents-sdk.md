# Novita with OpenAI Agents SDK

Use this reference when integrating Novita's LLM endpoint with the OpenAI Agents SDK.

Primary source: https://novita.ai/docs/guides/openai-agents-sdk.md

## Compatibility Rule

Novita supports the OpenAI Agents SDK through the chat-completions path.

Important caveat:
- Novita does **not** support the `responses` API for this integration pattern
- explicitly switch the Agents SDK to `chat_completions`

Novita's official guide is Python-based, but the compatibility rule matters even if your surrounding application has JavaScript or TypeScript components.

## Integration Guidance

Novita's official compatibility guide for OpenAI Agents SDK is Python-based. For JavaScript/TypeScript teams, the important takeaway is not a separate Novita JavaScript agents client, but the protocol constraint:

- use Novita through an OpenAI-compatible client pointed at `https://api.novita.ai/openai`
- force the agent framework onto the chat-completions path
- do not assume a Responses API-based integration will work unchanged

If your stack includes a JavaScript application layer and a Python-based agent runtime, apply Novita configuration at the agent runtime boundary rather than trying to translate the official example into a different API mode.

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
