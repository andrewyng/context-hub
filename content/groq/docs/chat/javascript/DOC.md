---
name: chat
description: "Groq API for fast LLM inference with chat completions, streaming, and function calling using an OpenAI-compatible interface"
metadata:
  languages: "javascript"
  versions: "0.15.0"
  revision: 1
  updated-on: "2026-03-07"
  source: community
  tags: "groq,chat,llm,ai,inference"
---

# Groq API Coding Guidelines (JavaScript/TypeScript)

You are a Groq API coding expert. Help me write code using the Groq API via the official SDK.

## Golden Rule: Use the Correct and Current SDK

Always use the official Groq Node.js SDK.

- **NPM Package:** `groq-sdk`

**Installation:**
```bash
npm install groq-sdk
```

**Import Pattern:**
```typescript
import Groq from 'groq-sdk';
```

## Initialization and API Key
```typescript
import Groq from 'groq-sdk';

// Uses GROQ_API_KEY environment variable automatically
const client = new Groq({
  apiKey: process.env['GROQ_API_KEY'],
});
```

Get a free API key at https://console.groq.com/keys

## Models

Default choices:
- **General tasks:** `llama-3.3-70b-versatile`
- **Low latency / simple tasks:** `llama-3.1-8b-instant`
- **Instruction following:** `mixtral-8x7b-32768`

Do not use deprecated models: `llama2-70b-4096`, `mixtral-8x7b-32768` (check console for current availability)

## Chat Completions
```typescript
import Groq from 'groq-sdk';

const client = new Groq();

const completion = await client.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain fast LLM inference in one sentence.' },
  ],
  max_completion_tokens: 1024,
});

console.log(completion.choices[0].message.content);
```

## Streaming
```typescript
const stream = await client.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: 'Count to 5.' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}
```

## Function Calling (Tools)
```typescript
const completion = await client.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: 'What is the weather in London?' }],
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get current weather for a location',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'City and country' },
          },
          required: ['location'],
        },
      },
    },
  ],
  tool_choice: 'auto',
});
```

## Error Handling
```typescript
import Groq from 'groq-sdk';

try {
  await client.chat.completions.create({ ... });
} catch (err) {
  if (err instanceof Groq.RateLimitError) {
    // Back off and retry
  } else if (err instanceof Groq.AuthenticationError) {
    console.log('Invalid API key');
  } else if (err instanceof Groq.APIError) {
    console.log(err.status, err.message);
  }
}
```

## Gotchas

- `n > 1` (multiple completions) is not supported
- Use `max_completion_tokens`, not `max_tokens` (deprecated)
- Check `x-ratelimit-*` response headers for per-model rate limit info
- `logprobs` and `logit_bias` are not supported

## Useful Links

- **Documentation:** https://console.groq.com/docs
- **API Keys:** https://console.groq.com/keys
- **Models:** https://console.groq.com/docs/models
- **Rate Limits:** https://console.groq.com/docs/rate-limits