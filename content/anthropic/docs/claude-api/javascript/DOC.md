---
name: claude-api
description: "Claude AI assistant API for text generation, analysis, conversation, streaming, tool use, vision, and batch processing"
metadata:
  languages: "javascript"
  versions: "0.100.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "anthropic,sdk,llm,ai,claude"
---

# Anthropic JavaScript/TypeScript SDK Coding Guidelines

You are an Anthropic API coding expert. Help me with writing code using the Anthropic API calling the official libraries and SDKs.

You can find the official SDK documentation and code samples here:
https://platform.claude.com/docs/en/api/client-sdks

## Golden Rule: Use the Correct and Current SDK

Always use the Anthropic TypeScript SDK to call the Claude models, which is the standard library for all Anthropic API interactions. Do not use legacy libraries or unofficial SDKs.

- **Library Name:** Anthropic TypeScript SDK
- **NPM Package:** `@anthropic-ai/sdk`
- **Runtime:** Node.js 18+, Deno, Bun, Cloudflare Workers, browsers (with explicit `dangerouslyAllowBrowser: true`).

**Installation:**

```bash
npm install @anthropic-ai/sdk
```

**APIs and Usage:**

- **Correct:** `import Anthropic from '@anthropic-ai/sdk'`
- **Correct:** `const client = new Anthropic()`
- **Correct:** `await client.messages.create(...)`
- **Correct:** `await client.messages.stream(...)`
- **Incorrect:** `AnthropicClient` or `AnthropicAPI`
- **Incorrect:** `client.generate` or `client.completions` (legacy text-completion endpoint, do not use)

## Initialization and API Key

The `@anthropic-ai/sdk` library requires creating an `Anthropic` instance for all API calls.

- Always use `const client = new Anthropic()` to create an instance.
- Set the `ANTHROPIC_API_KEY` environment variable, which will be picked up automatically.

```javascript
import Anthropic from '@anthropic-ai/sdk';

// Uses ANTHROPIC_API_KEY environment variable if apiKey not specified
const client = new Anthropic();

// Or pass the API key directly
// const client = new Anthropic({ apiKey: process.env.MY_API_KEY });
```

## Models

Use the following models as of May 2026:

- **Most capable (reasoning, agentic coding):** `claude-opus-4-7`
- **Balanced (speed + intelligence):** `claude-sonnet-4-6`
- **Fast and efficient:** `claude-haiku-4-5`

Claude 4.6+ model IDs are dateless and pin to a specific snapshot. Older models still resolve via aliases (e.g. `claude-opus-4-1`, `claude-sonnet-4-5`).

Deprecated and scheduled for retirement on 2026-06-15: `claude-sonnet-4-20250514`, `claude-opus-4-20250514`. Migrate off these now.

Query the live model list programmatically when unsure:

```javascript
const models = await client.models.list();
for (const m of models.data) console.log(m.id);
```

## Basic Inference (Text Generation)

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
});

// content is an array of typed blocks, not a string
for (const block of message.content) {
  if (block.type === 'text') console.log(block.text);
}
```

`max_tokens` is required. The response `content` is always an array of typed blocks (`text`, `tool_use`, `thinking`, etc.).

## Multi-Turn Conversations

Append the assistant's full content blocks back into `messages` to continue a conversation.

```javascript
const conversation = [{ role: 'user', content: "What's the capital of France?" }];

const reply = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 512,
  messages: conversation,
});

conversation.push({ role: 'assistant', content: reply.content });
conversation.push({ role: 'user', content: 'And its population?' });

const followup = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 512,
  messages: conversation,
});
```

## Multimodal Inputs

Multimodal inputs are supported by passing image data in the messages array. You can include images by URL or base64.

```javascript
const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: 'https://example.com/image.jpg' } },
        { type: 'text', text: "What's in this image?" },
      ],
    },
  ],
});
```

For file uploads (beta), use `client.beta.files.upload`:

```javascript
import fs from 'fs';
import Anthropic, { toFile } from '@anthropic-ai/sdk';

const client = new Anthropic();

const uploaded = await client.beta.files.upload(
  { file: await toFile(fs.createReadStream('/path/to/document.pdf')) },
  { headers: { 'anthropic-beta': 'files-api-2025-04-14' } },
);
```

## Streaming Responses

The SDK supports streaming via Server-Sent Events (SSE).

### Basic Streaming

```javascript
const stream = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
  stream: true,
});

for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    process.stdout.write(event.delta.text);
  }
}
```

### Streaming Helper

The `client.messages.stream()` helper exposes typed events and the final assembled message.

```javascript
const stream = client.messages
  .stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Say hello there!' }],
  })
  .on('text', (text) => process.stdout.write(text));

const message = await stream.finalMessage();
console.log('\n\nDone. Stop reason:', message.stop_reason);
```

Cancel a stream with `stream.controller.abort()` or by breaking from the loop.

## Tool Use (Function Calling)

Define tools Claude can request to invoke. Run the tool yourself and feed the result back as a `tool_result` block.

```javascript
const tools = [
  {
    name: 'get_weather',
    description: 'Get the current weather in a given location',
    input_schema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City and state, e.g. San Francisco, CA' },
        unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
      },
      required: ['location'],
    },
  },
];

const userMessage = { role: 'user', content: "What's the weather in San Francisco?" };

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  tools,
  messages: [userMessage],
});

if (response.stop_reason === 'tool_use') {
  const toolUse = response.content.find((b) => b.type === 'tool_use');
  const toolResult = `72F and sunny in ${toolUse.input.location}`;

  const followup = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools,
    messages: [
      userMessage,
      { role: 'assistant', content: response.content },
      {
        role: 'user',
        content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: toolResult }],
      },
    ],
  });
}
```

### Tool Choice

- `{ type: 'auto' }` (default) — Claude decides when to use tools
- `{ type: 'any' }` — Claude must use a tool
- `{ type: 'tool', name: 'specific_tool' }` — Force a specific tool
- `{ type: 'auto', disable_parallel_tool_use: true }` — Disable parallel tool execution

### Built-in Beta Tools

These tools require beta headers and the `client.beta.messages.create` namespace.

```javascript
// Computer use
await client.beta.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Take a screenshot' }],
  tools: [
    { type: 'computer_20250124', name: 'computer', display_width_px: 1920, display_height_px: 1080 },
  ],
  betas: ['computer-use-2025-01-24'],
});

// Bash
await client.beta.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'List the files' }],
  tools: [{ type: 'bash_20250124', name: 'bash' }],
  betas: ['computer-use-2025-01-24'],
});

// Text editor
await client.beta.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Create a Python script' }],
  tools: [{ type: 'text_editor_20250124', name: 'str_replace_editor' }],
});
```

## Prompt Caching

Mark a prefix as cacheable to reuse it across requests at a discount.

```javascript
const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: '<long system prompt or reference document>',
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [{ role: 'user', content: 'Question about the document?' }],
});

console.log(message.usage.cache_creation_input_tokens);
console.log(message.usage.cache_read_input_tokens);
```

## Extended Thinking

Available on Sonnet 4.6 and Haiku 4.5. Opus 4.7 uses adaptive thinking and does not take an explicit `thinking` block.

```javascript
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 16000,
  thinking: { type: 'enabled', budget_tokens: 10000 },
  messages: [{ role: 'user', content: 'Solve this complex problem...' }],
});

for (const block of response.content) {
  if (block.type === 'thinking') console.log('REASONING:', block.thinking);
  if (block.type === 'text') console.log('ANSWER:', block.text);
}
```

## Message Batches

Batches run asynchronously at a 50% discount and support up to 256 MB of requests.

```javascript
const batch = await client.messages.batches.create({
  requests: [
    {
      custom_id: 'request-1',
      params: {
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello, world' }],
      },
    },
    {
      custom_id: 'request-2',
      params: {
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hi again, friend' }],
      },
    },
  ],
});

// Poll batch.processing_status until 'ended', then stream results
const results = await client.messages.batches.results(batch.id);
for await (const entry of results) {
  if (entry.result.type === 'succeeded') {
    console.log(entry.custom_id, entry.result.message.content);
  }
}
```

## Additional Capabilities

### System Instructions

```javascript
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: 'You are a helpful assistant that responds in a pirate voice.',
  messages: [{ role: 'user', content: 'Hello' }],
});
```

### Generation Parameters

```javascript
await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Write a creative story' }],
  temperature: 0.7,
  top_p: 0.9,
});
```

Do not set both `temperature` and `top_p` simultaneously.

### Token Counting

```javascript
const count = await client.messages.countTokens({
  model: 'claude-sonnet-4-6',
  messages: [{ role: 'user', content: 'Hello, Claude' }],
});
console.log(count.input_tokens);
```

### Auto-pagination

```javascript
for await (const batch of client.messages.batches.list({ limit: 20 })) {
  console.log(batch.id, batch.processing_status);
}
```

## Error Handling

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

try {
  await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello, Claude' }],
  });
} catch (err) {
  if (err instanceof Anthropic.APIError) {
    console.log(err.status); // 400
    console.log(err.name); // BadRequestError
    console.log(err.headers); // { server: 'nginx', ... }
    console.log(err.requestID); // request id string for support
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

All errors extend `AnthropicError`, which extends the standard `Error` class.

### Request IDs

Every response includes a `_request_id` property mirroring the `request-id` HTTP response header.

```javascript
const message = await client.messages.create({ /* ... */ });
console.log(message._request_id);
```

## Advanced Configuration

### Retries

Connection errors, `408`, `409`, `429`, and `>=500` are retried by default (2 retries).

```javascript
// Configure default retries for all requests
const client = new Anthropic({ maxRetries: 3 });

// Per-request override
await client.messages.create(
  {
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello, Claude' }],
  },
  { maxRetries: 5 },
);
```

### Timeouts

Default timeout is 10 minutes.

```javascript
const client = new Anthropic({ timeout: 20 * 1000 });

await client.messages.create(
  {
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello, Claude' }],
  },
  { timeout: 5 * 1000 },
);
```

### Logging

```javascript
const client = new Anthropic({
  logLevel: 'debug', // 'debug' | 'info' | 'warn' | 'error' | 'off'
});

// Or via env var
// ANTHROPIC_LOG=debug
```

### Custom Fetch

```javascript
const client = new Anthropic({
  fetchOptions: {
    // Standard RequestInit options
  },
});
```

## Cloud Deployments

### Claude Platform on AWS

Uses the same model IDs as the direct Claude API.

```javascript
import { AnthropicAWS } from '@anthropic-ai/sdk';

const client = new AnthropicAWS({ awsRegion: 'us-east-1' });
```

### AWS Bedrock

```javascript
import { AnthropicBedrock } from '@anthropic-ai/sdk';

const client = new AnthropicBedrock({ awsRegion: 'us-east-1' });

await client.messages.create({
  model: 'anthropic.claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### Google Vertex AI

```javascript
import { AnthropicVertex } from '@anthropic-ai/sdk';

const client = new AnthropicVertex({ projectId: 'my-gcp-project', region: 'us-east5' });

await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

## Useful Links

- Documentation: https://platform.claude.com/docs/en/api/overview
- Models: https://platform.claude.com/docs/en/about-claude/models/overview
- SDK Repository: https://github.com/anthropics/anthropic-sdk-typescript
- API Keys: https://platform.claude.com/settings/keys
- Rate Limits: https://platform.claude.com/docs/en/api/rate-limits
- Beta Headers: https://platform.claude.com/docs/en/api/beta-headers
