---
name: claude-api
description: "Claude AI assistant API for text generation, analysis, conversation, streaming, tool use, vision, and batch processing"
metadata:
  languages: "javascript"
  versions: "0.78.0"
  updated-on: "2026-05-12"
  source: maintainer
  tags: "anthropic,sdk,llm,ai,claude"
---

# Anthropic JavaScript/TypeScript SDK Coding Guidelines

You are an Anthropic API coding expert. Help me with writing code using the Anthropic API calling the official libraries and SDKs.

You can find the official SDK documentation and code samples here:
https://docs.anthropic.com/claude/reference/

## Golden Rule: Use the Correct and Current SDK

Always use the Anthropic TypeScript SDK to call the Claude models, which is the standard library for all Anthropic API interactions. Do not use legacy libraries or unofficial SDKs.

- **Library Name:** Anthropic TypeScript SDK
- **NPM Package:** `@anthropic-ai/sdk`
- **Legacy Libraries**: Other unofficial packages are not recommended

**Installation:**

- **Correct:** `npm install @anthropic-ai/sdk`

**APIs and Usage:**

- **Correct:** `import Anthropic from '@anthropic-ai/sdk'`
- **Correct:** `const client = new Anthropic({})`
- **Correct:** `await client.messages.create(...)`
- **Correct:** `await client.messages.stream(...)`
- **Incorrect:** `AnthropicClient` or `AnthropicAPI`
- **Incorrect:** `client.generate` or `client.completions`
- **Incorrect:** Legacy completion endpoints

## Initialization and API key

The `@anthropic-ai/sdk` library requires creating an `Anthropic` instance for all API calls.

- Always use `const client = new Anthropic({})` to create an instance.
- Set the `ANTHROPIC_API_KEY` environment variable, which will be picked up automatically.

```javascript
import Anthropic from '@anthropic-ai/sdk';

// Uses the ANTHROPIC_API_KEY environment variable if apiKey not specified
const client = new Anthropic({});

// Or pass the API key directly
// const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
```

## Models

- By default, use the following models as of May 2026:
  - **High-performance / Agentic coding:** `claude-opus-4-7` (flagship; step-change improvement in agentic coding over Opus 4.6)
  - **General Tasks (best speed/intelligence balance):** `claude-sonnet-4-6`
  - **Fast and Efficient:** `claude-haiku-4-5-20251001` (alias: `claude-haiku-4-5`)

- Note: starting with the 4.6 generation, Anthropic uses dateless model IDs as the canonical pinned snapshot (e.g. `claude-opus-4-7`, `claude-sonnet-4-6`). For older generations the alias is a pointer that resolves to a dated ID.

- Legacy models (still supported, consider migrating):
  - `claude-opus-4-6`, `claude-sonnet-4-5-20250929` (alias `claude-sonnet-4-5`)
  - `claude-opus-4-5-20251101`, `claude-opus-4-1-20250805`
  - `claude-3-5-haiku-20241022`

- Deprecated — retiring June 15, 2026 (migrate now):
  - `claude-sonnet-4-20250514` → migrate to `claude-sonnet-4-6`
  - `claude-opus-4-20250514` → migrate to `claude-opus-4-7`

- Do not use deprecated models: `claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-opus`

## Basic Inference (Text Generation)

Here's how to generate a response from a text prompt.

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({}); // Assumes ANTHROPIC_API_KEY is set

async function run() {
  const message = await client.messages.create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello, Claude' }],
    model: 'claude-sonnet-4-6',
  });

  console.log(message.content);
}

run();
```

Multimodal inputs are supported by passing image data in the messages array. You can include images, documents, and other file types using base64 encoding or file uploads.

For file uploads, use the `client.beta.files.upload` method:

```javascript
import fs from 'fs';
import Anthropic, { toFile } from '@anthropic-ai/sdk';

const client = new Anthropic();

// File upload example
await client.beta.files.upload({
  file: await toFile(fs.createReadStream('/path/to/file'), undefined, { type: 'application/json' }),
  betas: ['files-api-2025-04-14'],
});
```

## Streaming Responses

We provide comprehensive support for streaming responses using Server Sent Events (SSE).

### Basic Streaming

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const stream = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  model: 'claude-sonnet-4-6',
  stream: true,
});

for await (const messageStreamEvent of stream) {
  console.log(messageStreamEvent.type);
}
```

### Advanced Streaming with Helpers

The SDK provides powerful streaming helpers for convenience:

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function main() {
  const stream = client.messages
    .stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'Say hello there!',
        },
      ],
    })
    .on('text', (text) => {
      console.log(text);
    });

  const message = await stream.finalMessage();
  console.log(message);
}

main();
```

You can cancel streams by calling `stream.controller.abort()` or breaking from loops.

## Tool Use (Function Calling)

The SDK supports tool use (function calling) for extending Claude's capabilities.

### Custom Tools

Define custom functions that Claude can call:

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function run() {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: "What's the weather like in San Francisco?" }],
    tools: [
      {
        name: 'get_weather',
        description: 'Get the current weather in a given location',
        input_schema: {
          type: 'object',
          properties: {
            location: { description: 'The city and state, e.g. San Francisco, CA', type: 'string' },
            unit: { description: 'Unit for the output - one of (celsius, fahrenheit)', type: 'string' },
          },
          required: ['location'],
        },
        type: 'custom',
      },
    ],
    tool_choice: { type: 'auto' },
  });

  // Handle tool use in the response
  if (response.content.some((block) => block.type === 'tool_use')) {
    // Process tool calls and provide results back to Claude
    console.log('Claude wants to use a tool!');
  }
}

run();
```

### Built-in Beta Tools

The beta API provides specialized built-in tools.

#### Bash Tool

```javascript
const response = await client.beta.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'List the files in the current directory' }],
  tools: [{ type: 'bash_20250124', name: 'bash' }],
});
```

#### Computer Use Tool

```javascript
const response = await client.beta.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Take a screenshot' }],
  tools: [
    {
      type: 'computer_20250124',
      name: 'computer',
      display_width_px: 1920,
      display_height_px: 1080,
    },
  ],
});
```

#### Text Editor Tool

```javascript
const response = await client.beta.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Create a Python script' }],
  tools: [{ type: 'text_editor_20250124', name: 'str_replace_editor' }],
});
```

### Tool Choice Configuration

Control how Claude uses tools:

- `{ type: 'auto' }` - Claude decides when to use tools
- `{ type: 'any' }` - Claude must use a tool
- `{ type: 'tool', name: 'specific_tool' }` - Force a specific tool
- `{ disable_parallel_tool_use: true }` - Disable parallel tool execution

## Message Batches

The SDK supports the Message Batches API for processing multiple requests efficiently.

### Creating a Batch

```javascript
await client.messages.batches.create({
  requests: [
    {
      custom_id: 'my-first-request',
      params: {
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello, world' }],
      },
    },
    {
      custom_id: 'my-second-request',
      params: {
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hi again, friend' }],
      },
    },
  ],
});
```

### Getting Batch Results

```javascript
const results = await client.messages.batches.results(batch_id);
for await (const entry of results) {
  if (entry.result.type === 'succeeded') {
    console.log(entry.result.message.content);
  }
}
```

## Additional Capabilities

### System Instructions

Guide Claude's behavior with system instructions:

```javascript
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
  system: [{ text: 'You are a helpful assistant that responds in a pirate voice.', type: 'text' }],
});
```

### Thinking

Configure Claude's extended thinking (reasoning process). Supported on Sonnet 4.6 and Haiku 4.5. **Opus 4.7 uses adaptive thinking only** (no manual `budget_tokens` — omit the `thinking` parameter for Opus 4.7).

```javascript
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 16000,
  messages: [{ role: 'user', content: 'Solve this complex problem...' }],
  thinking: { type: 'enabled', budget_tokens: 10000 },
});
```

### Temperature and Generation Parameters

Control randomness and output:

```javascript
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Write a creative story' }],
  temperature: 0.7,
  top_k: 5,
  top_p: 0.9,
});
```

### Token Counting

Count tokens before making requests:

```javascript
const tokenCount = await client.messages.countTokens({
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  model: 'claude-sonnet-4-6',
});
console.log(tokenCount); // { input_tokens: 25, output_tokens: 13 }
```

### Auto-pagination

Handle paginated responses automatically:

```javascript
async function fetchAllMessageBatches(params) {
  const allMessageBatches = [];
  // Automatically fetches more pages as needed.
  for await (const messageBatch of client.messages.batches.list({ limit: 20 })) {
    allMessageBatches.push(messageBatch);
  }
  return allMessageBatches;
}
```

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

try {
  const message = await client.messages.create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello, Claude' }],
    model: 'claude-sonnet-4-6',
  });
} catch (err) {
  if (err instanceof Anthropic.APIError) {
    console.log(err.status); // 400
    console.log(err.name); // BadRequestError
    console.log(err.headers); // {server: 'nginx', ...}
    console.log(err.requestID); // request id string
  } else {
    throw err;
  }
}
```

### Error Types

| Status Code | Error Type                 |
| ----------- | -------------------------- |
| 400         | `BadRequestError`          |
| 401         | `AuthenticationError`      |
| 403         | `PermissionDeniedError`    |
| 404         | `NotFoundError`            |
| 422         | `UnprocessableEntityError` |
| 429         | `RateLimitError`           |
| >=500       | `InternalServerError`      |
| N/A         | `APIConnectionError`       |

All errors extend from `AnthropicError` which extends the standard `Error` class.

### Request IDs

All responses include a `_request_id` property for debugging:

```javascript
const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  model: 'claude-sonnet-4-6',
});
console.log(message._request_id);
```

## Advanced Configuration

### Retries

Configure automatic retry behavior:

```javascript
// Configure default retries for all requests
const client = new Anthropic({
  maxRetries: 3, // default is 2
});

// Or configure per-request
await client.messages.create(
  { max_tokens: 1024, messages: [{ role: 'user', content: 'Hello, Claude' }], model: 'claude-sonnet-4-6' },
  { maxRetries: 5 },
);
```

### Timeouts

Set custom timeout values:

```javascript
// Configure default timeout for all requests
const client = new Anthropic({
  timeout: 20 * 1000, // 20 seconds (default is 10 minutes)
});

// Override per-request
await client.messages.create(
  { max_tokens: 1024, messages: [{ role: 'user', content: 'Hello, Claude' }], model: 'claude-sonnet-4-6' },
  { timeout: 5 * 1000 },
);
```

### Logging

Enable debug logging:

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  logLevel: 'debug', // Show all log messages
});

// Or use environment variable
// ANTHROPIC_LOG=debug
```

### Custom Fetch Options

Customize the underlying fetch behavior:

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  fetchOptions: {
    // Custom RequestInit options
  },
});
```

## Useful Links

- Documentation: https://docs.anthropic.com/
- API Reference: https://docs.anthropic.com/claude/reference/
- Models: https://docs.anthropic.com/claude/docs/models-overview
- API Pricing: https://www.anthropic.com/pricing
- Rate Limits: https://docs.anthropic.com/claude/reference/rate-limits

