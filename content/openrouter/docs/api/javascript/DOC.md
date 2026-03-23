---
name: api
description: "OpenRouter unified API for accessing hundreds of AI models through a single endpoint, with automatic fallbacks, provider routing, streaming, tool calling, and structured outputs"
metadata:
  languages: "javascript"
  versions: "0.9.11"
  revision: 1
  updated-on: "2026-03-23"
  source: community
  tags: "openrouter,api,llm,ai,multi-model,streaming,tools"
---

# OpenRouter JavaScript/TypeScript SDK Coding Guide

## Golden Rule

Always use the official `@openrouter/sdk` package. Do not use the OpenAI SDK with `baseURL` override unless explicitly asked — the OpenRouter SDK provides better type safety, automatic tool execution, and OpenRouter-specific features.

- **Package:** `@openrouter/sdk`
- **Correct:** `import { OpenRouter } from '@openrouter/sdk'`
- **Avoid:** Using `openai` package with `baseURL: 'https://openrouter.ai/api/v1'`

## Installation

```bash
npm install @openrouter/sdk
```

```bash
yarn add @openrouter/sdk
```

```bash
pnpm add @openrouter/sdk
```

## Environment Variables

```bash
OPENROUTER_API_KEY=sk-or-v1-...   # Required — get from https://openrouter.ai/keys
```

## Initialization

```typescript
import { OpenRouter } from '@openrouter/sdk';

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://yoursite.com',       // Optional. For rankings on openrouter.ai.
    'X-OpenRouter-Title': 'Your App Name',         // Optional. For rankings on openrouter.ai.
  },
});
```

## Models

OpenRouter provides access to hundreds of models from all major providers. Specify models with the `provider/model` format:

```typescript
// Examples of model identifiers
'anthropic/claude-opus-4-6'
'anthropic/claude-sonnet-4-6'
'openai/gpt-5.2'
'openai/gpt-5-nano'
'google/gemini-2.5-pro'
'meta-llama/llama-4-maverick'
```

Browse available models at https://openrouter.ai/models

## Two APIs

The SDK provides two interfaces:

1. **`chat.send()`** — OpenAI-compatible chat completions (simpler, familiar)
2. **`callModel()`** — OpenRouter's Responses API with items-based streaming, auto tool execution, and typed tools (more powerful)

## Basic Chat Completion (chat.send)

```typescript
const completion = await openrouter.chat.send({
  model: 'anthropic/claude-sonnet-4-6',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' },
  ],
  stream: false,
});

console.log(completion.choices[0].message.content);
```

## Streaming (chat.send)

```typescript
const stream = await openrouter.chat.send({
  model: 'anthropic/claude-sonnet-4-6',
  messages: [{ role: 'user', content: 'Write a short poem.' }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices?.[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

### Stream Cancellation

```typescript
const controller = new AbortController();

const stream = await openrouter.chat.send({
  model: 'anthropic/claude-sonnet-4-6',
  messages: [{ role: 'user', content: 'Write a story' }],
  stream: true,
}, {
  signal: controller.signal,
});

// Cancel anytime:
controller.abort();
```

## callModel API (Recommended for Complex Tasks)

`callModel` returns a `ModelResult` with multiple consumption patterns:

```typescript
const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'What is the capital of France?',
});

// Get text (simplest)
const text = await result.getText();

// Get full response with usage data
const response = await result.getResponse();
console.log(response.usage); // { inputTokens, outputTokens, cachedTokens }
```

### Streaming with callModel

```typescript
const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'Explain quantum computing.',
});

// Stream text deltas
for await (const delta of result.getTextStream()) {
  process.stdout.write(delta);
}
```

### System Instructions

```typescript
const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  instructions: 'You are a helpful coding assistant.',
  input: 'How do I read a file in Node.js?',
});
```

### Model Fallbacks

Provide multiple models for automatic failover:

```typescript
const result = openrouter.callModel({
  models: ['anthropic/claude-sonnet-4-6', 'openai/gpt-5.2', 'google/gemini-2.5-pro'],
  input: 'Hello!',
});
```

### Multimodal Input

Send images alongside text:

```typescript
const result = openrouter.callModel({
  model: 'openai/gpt-5.2',
  input: [
    {
      type: 'message',
      role: 'user',
      content: [
        { type: 'input_text', text: 'What is in this image?' },
        { type: 'input_image', imageUrl: 'https://example.com/image.jpg', detail: 'auto' },
      ],
    },
  ],
});
```

### Reasoning Streaming

For models with extended thinking (o1, Claude with thinking):

```typescript
const result = openrouter.callModel({
  model: 'openai/o1-preview',
  input: 'Solve step by step: If x + 5 = 12, what is x?',
});

for await (const delta of result.getReasoningStream()) {
  process.stdout.write(delta);
}

const answer = await result.getText();
```

### Items Streaming (Recommended)

Stream structured items by type — messages, tool calls, reasoning:

```typescript
const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'Hello!',
  tools: [myTool],
});

for await (const item of result.getItemsStream()) {
  switch (item.type) {
    case 'message':
      console.log('Message:', item.content);
      break;
    case 'function_call':
      console.log('Tool call:', item.name, item.arguments);
      break;
    case 'reasoning':
      console.log('Thinking:', item.summary);
      break;
    case 'function_call_output':
      console.log('Tool result:', item.output);
      break;
  }
}
```

### Concurrent Requests

Each `callModel` invocation is independent:

```typescript
const [r1, r2, r3] = await Promise.all([
  openrouter.callModel({ model: 'openai/gpt-5-nano', input: 'Question 1' }).getText(),
  openrouter.callModel({ model: 'openai/gpt-5-nano', input: 'Question 2' }).getText(),
  openrouter.callModel({ model: 'openai/gpt-5-nano', input: 'Question 3' }).getText(),
]);
```

### Cancellation

Cancel a callModel stream mid-generation:

```typescript
const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'Write a very long essay...',
});

let charCount = 0;
for await (const delta of result.getTextStream()) {
  process.stdout.write(delta);
  charCount += delta.length;
  if (charCount > 500) {
    await result.cancel();
    break;
  }
}
```

### Generation Parameters (callModel)

```typescript
const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'Write a creative story.',
  temperature: 0.7,
  maxOutputTokens: 1000,
  topP: 0.9,
});
```

## Tool Calling with callModel

Define type-safe tools with Zod schemas. The SDK handles execution loops automatically.

```typescript
import { OpenRouter, tool } from '@openrouter/sdk';
import { z } from 'zod';

const weatherTool = tool({
  name: 'get_weather',
  description: 'Get the current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name, e.g., "San Francisco, CA"'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
  }),
  execute: async (params) => {
    const weather = await fetchWeather(params.location);
    return { temperature: weather.temp, conditions: weather.description };
  },
});

const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'What is the weather in Tokyo?',
  tools: [weatherTool],
});

// Tools auto-execute. getText() waits for completion.
const text = await result.getText();
```

### Manual Tool Handling

For tools that need user confirmation:

```typescript
const emailTool = tool({
  name: 'send_email',
  description: 'Send an email (requires confirmation)',
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  execute: false, // Manual handling
});

const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'Send an email to alice@example.com',
  tools: [emailTool],
  maxToolRounds: 0,
});

const toolCalls = await result.getToolCalls();
```

### Generator Tools (Progress Events)

Tools can yield progress updates during execution using `eventSchema` and `async function*`:

```typescript
const searchTool = tool({
  name: 'search_database',
  description: 'Search documents with progress updates',
  inputSchema: z.object({ query: z.string() }),
  eventSchema: z.object({
    progress: z.number().min(0).max(100),
    message: z.string(),
  }),
  outputSchema: z.object({ results: z.array(z.string()) }),
  execute: async function* (params) {
    yield { progress: 0, message: 'Starting search...' };
    const results = await searchBatch(params.query);
    yield { progress: 100, message: 'Complete!' };
    return { results };
  },
});

// Stream progress events
const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'Search for TypeScript tutorials',
  tools: [searchTool],
});

for await (const event of result.getToolStream()) {
  if (event.type === 'preliminary_result') {
    console.log(`Progress: ${event.result.progress}%`);
  }
}
```

### Controlling Tool Rounds

```typescript
const result = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'Research this topic',
  tools: [searchTool],
  maxToolRounds: 3, // Stop after 3 rounds. 0 = don't auto-execute.
});

// Dynamic control with a function:
const result2 = openrouter.callModel({
  model: 'anthropic/claude-sonnet-4-6',
  input: 'Research and analyze',
  tools: [searchTool],
  maxToolRounds: (context) => context.numberOfTurns < 5,
});
```

## Tool Calling with chat.send

OpenAI-compatible tool calling format:

```typescript
const completion = await openrouter.chat.send({
  model: 'anthropic/claude-sonnet-4-6',
  messages: [{ role: 'user', content: 'What is the weather in Paris?' }],
  tools: [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City name' },
        },
        required: ['location'],
      },
    },
  }],
  stream: false,
});

// Check for tool calls in response
const message = completion.choices[0].message;
if (message.tool_calls) {
  for (const toolCall of message.tool_calls) {
    console.log(toolCall.function.name, toolCall.function.arguments);
  }
}
```

## Structured Outputs

Force responses to follow a JSON schema:

```typescript
const response = await openrouter.chat.send({
  model: 'anthropic/claude-sonnet-4-6',
  messages: [
    { role: 'user', content: 'What is the weather in London?' },
  ],
  responseFormat: {
    type: 'json_schema',
    jsonSchema: {
      name: 'weather',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          temperature: { type: 'number' },
          conditions: { type: 'string' },
        },
        required: ['location', 'temperature', 'conditions'],
        additionalProperties: false,
      },
    },
  },
  stream: false,
});

const weather = JSON.parse(response.choices[0].message.content);
```

## Parameters

Key parameters for chat completions:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `temperature` | float 0-2 | 1.0 | Randomness. Lower = more predictable |
| `max_tokens` | int | — | Maximum tokens in response |
| `top_p` | float 0-1 | 1.0 | Nucleus sampling threshold |
| `frequency_penalty` | float -2 to 2 | 0 | Reduce token repetition |
| `presence_penalty` | float -2 to 2 | 0 | Encourage topic diversity |
| `stop` | string[] | — | Stop sequences |
| `seed` | int | — | For deterministic output |
| `response_format` | object | — | Force JSON or schema output |
| `tools` | array | — | Tool definitions |
| `tool_choice` | string/object | — | `'none'`, `'auto'`, `'required'`, or specific tool |
| `parallel_tool_calls` | boolean | true | Allow model to call multiple tools simultaneously |
| `verbosity` | enum | medium | `'low'`, `'medium'`, `'high'`, `'max'` — controls response detail level |

## Error Handling

```typescript
try {
  const completion = await openrouter.chat.send({
    model: 'anthropic/claude-sonnet-4-6',
    messages: [{ role: 'user', content: 'Hello' }],
    stream: false,
  });
} catch (error) {
  // Common error codes:
  // 400 - Bad request (invalid parameters)
  // 401 - Invalid API key
  // 402 - Insufficient credits
  // 429 - Rate limited
  // 502 - Provider error
  // 503 - No available providers
  console.error(error.message);
}
```

### Mid-Stream Errors

When streaming, errors after tokens have been sent arrive as SSE events with `finish_reason: "error"`:

```typescript
for await (const chunk of stream) {
  if ('error' in chunk) {
    console.error(`Stream error: ${chunk.error.message}`);
    break;
  }
  const content = chunk.choices?.[0]?.delta?.content;
  if (content) process.stdout.write(content);
}
```

## Tree-Shakable Imports

For minimal bundle size:

```typescript
import { OpenRouterCore } from '@openrouter/sdk/core.js';
import { chatSend } from '@openrouter/sdk/funcs/chatSend.js';

const openrouter = new OpenRouterCore({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const res = await chatSend(openrouter, { messages: [] });
if (res.ok) {
  console.log(res.value);
}
```

## Notes

- OpenRouter is OpenAI-compatible — existing OpenAI SDK code works with a `baseURL` swap, but the native SDK is preferred
- SSE streams may include `: OPENROUTER PROCESSING` comments to prevent timeouts — these can be safely ignored
- Stream cancellation stops billing for supported providers (OpenAI, Anthropic, many others)
- The `callModel` API supports auto tool execution, generator tools with progress events, and typed context — prefer it for complex agent workflows
