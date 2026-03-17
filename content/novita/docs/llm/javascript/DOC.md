---
name: llm
description: "Novita AI OpenAI-compatible LLM API coding guide for JavaScript and TypeScript using the official OpenAI SDK"
metadata:
  languages: "javascript"
  versions: "6.31.0"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "novita,llm,openai-compatible,javascript,typescript,ai"
---

# Novita AI JavaScript/TypeScript LLM Coding Guide

You are a Novita AI coding expert. Help me write JavaScript or TypeScript code that calls Novita's LLM API correctly.

Primary references:
- https://novita.ai/docs/guides/llm-api.md
- https://novita.ai/docs/guides/llm-batch-api.md
- https://novita.ai/docs/guides/openai-agents-sdk.md

## Golden Rule

Use the official OpenAI JavaScript SDK against Novita's OpenAI-compatible base URL.

- **SDK:** OpenAI Node.js SDK
- **Package:** `openai`
- **Base URL:** `https://api.novita.ai/openai`
- **Auth:** `Authorization: Bearer <NOVITA_API_KEY>`

For standard LLM inference, do not build raw HTTP wrappers unless you specifically need custom transport behavior.

```bash
npm install openai
```

## Initialization and API Key

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.novita.ai/openai",
  apiKey: process.env.NOVITA_API_KEY,
});
```

Do not leave the client pointed at the default OpenAI endpoint when you mean to call Novita.

## Model Naming

Use Novita model IDs exactly as Novita publishes them.

Examples:
- `deepseek/deepseek-v3-0324`
- `deepseek/deepseek-r1`

Do not strip the provider prefix from model names.

## Primary API Surface

Default to Chat Completions for Novita LLM calls.

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.novita.ai/openai",
  apiKey: process.env.NOVITA_API_KEY,
});

const completion = await client.chat.completions.create({
  model: "deepseek/deepseek-v3-0324",
  messages: [
    { role: "system", content: "You are a concise coding assistant." },
    { role: "user", content: "Explain what a JavaScript event loop does." },
  ],
  max_tokens: 512,
});

console.log(completion.choices[0]?.message?.content);
```

Novita also supports legacy prompt-style completions:

```typescript
const completion = await client.completions.create({
  model: "deepseek/deepseek-r1",
  prompt: "Summarize the purpose of TypeScript in three bullet points.",
  max_tokens: 256,
});

console.log(completion.choices[0]?.text);
```

## Streaming

```typescript
const stream = await client.chat.completions.create({
  model: "deepseek/deepseek-r1",
  messages: [
    { role: "user", content: "Give me a debugging checklist for a failing API integration." },
  ],
  max_tokens: 1024,
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```

## TypeScript Notes

Prefer running Novita through the typed OpenAI client rather than manually building JSON payloads. This keeps request shapes close to the SDK types and reduces schema mistakes.

For server-side apps, keep `NOVITA_API_KEY` in environment variables or a secrets manager. Avoid exposing it in browser bundles.

## Common Parameters

Common Novita LLM request parameters match the OpenAI-compatible schema:

- `model`
- `messages`
- `prompt`
- `max_tokens`
- `stream`
- `temperature`, `top_p`, `top_k`
- `presence_penalty`, `frequency_penalty`, `repetition_penalty`
- `stop`

## OpenAI Agents SDK Compatibility

Novita has explicit compatibility guidance for OpenAI Agents SDK, but the important constraint is:

- use the chat-completions integration path
- do not assume `responses` API support in that workflow

See `references/openai-agents-sdk.md` for the exact setup pattern and caveat.

## Batch API

Use batch when you need large asynchronous LLM workloads instead of immediate responses.

See `references/batch.md` for:
- JSONL input requirements
- file upload and batch creation
- status polling
- output retrieval and file retention notes

## Gotchas

- Set `baseURL` to `https://api.novita.ai/openai`.
- Authenticate with a Bearer token, not a query parameter.
- Use full Novita model IDs, including provider prefixes.
- Batch files must be valid JSONL with unique `custom_id` values.
- All requests in one batch file must target the same model.
- If you copy OpenAI examples that use newer APIs, verify that Novita supports the same surface before reusing them.

## When Not to Use This Entry

This entry is for Novita's OpenAI-compatible LLM APIs only.

Do not use it for:
- image, audio, or video generation
- GPU infrastructure APIs
- Agent Sandbox operations

## Additional Files

For deeper workflows, use:
- `references/batch.md`
- `references/openai-agents-sdk.md`
