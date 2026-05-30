---
name: chat
description: "OpenAI API for text generation, chat completions, streaming, function calling, vision, embeddings, and assistants"
metadata:
  languages: "javascript"
  versions: "6.39.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "openai,chat,llm,ai"
---

# OpenAI API Coding Guidelines (JavaScript/TypeScript)

You are an OpenAI API coding expert. Help me with writing code using the OpenAI API calling the official libraries and SDKs.

## Golden Rule: Use the Correct and Current SDK

Always use the official OpenAI Node.js SDK for all OpenAI API interactions.

- **Library Name:** OpenAI Node.js SDK
- **NPM Package:** `openai`
- **JSR Package:** `@openai/openai`

**Installation:**

```bash
# NPM
npm install openai

# JSR (Deno/Node.js)
deno add jsr:@openai/openai
npx jsr add @openai/openai
```

**Import Patterns:**

```typescript
// Correct - ES6 import
import OpenAI from 'openai';

// Correct - with additional utilities
import OpenAI, { toFile } from 'openai';

// JSR import for Deno
import OpenAI from 'jsr:@openai/openai';
```

## Initialization and API Key

The OpenAI library requires creating an `OpenAI` client instance for all API calls.

```typescript
import OpenAI from 'openai';

// Uses OPENAI_API_KEY environment variable automatically
const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

// Or pass API key directly
const client = new OpenAI({
  apiKey: 'your-api-key-here'
});
```

## Models (as of May 2026)

Default choices:
- **General Text / Coding:** `gpt-5.5` (flagship, 1M context) or `gpt-5.4` (more affordable, same capabilities)
- **Complex Reasoning Tasks:** `gpt-5.5`
- **Fast & Cost-Efficient:** `gpt-5.4-mini`
- **Cheapest / Fastest:** `gpt-5.4-nano`
- **Vision / Multimodal:** `gpt-5.5` or `gpt-5.4-mini`
- **Image Generation:** `gpt-image-2`

Frontier (Responses API recommended):
- `gpt-5.5` — flagship, 1M context window
- `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`
- Previous `gpt-5.x` snapshots remain accessible for pinning

Realtime: `gpt-realtime-2`, `gpt-realtime-1.5`, `gpt-realtime-mini`, `gpt-realtime-whisper`
TTS: `gpt-4o-mini-tts`, `tts-1`, `tts-1-hd`
STT: `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-realtime-whisper`, `whisper-1`
Image generation: `gpt-image-2`
Embeddings: `text-embedding-3-large`, `text-embedding-3-small`, `text-embedding-ada-002`
Moderation: `omni-moderation-latest`

Legacy (still available): `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `gpt-4o`, `gpt-4o-mini`

Deprecated:
- `dall-e-3`, `dall-e-2` (use `gpt-image-2`)
- `o1`, `o1-preview`, `o1-mini`, `o3-mini` (succeeded by GPT-5 series)
- `gpt-4o-realtime-preview` (use `gpt-realtime-2`)
- `gpt-4.5-preview`
- Assistants API → sunset Aug 26, 2026 (migrate to Responses API)

## Primary APIs

### Responses API (Recommended)

The Responses API is the primary interface for text generation.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const response = await client.responses.create({
  model: 'gpt-5.5',
  instructions: 'You are a coding assistant that talks like a pirate',
  input: 'Are semicolons optional in JavaScript?',
});

console.log(response.output_text);
```

### Chat Completions API (Legacy but Supported)

The Chat Completions API remains fully supported for existing applications.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const completion = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [
    { role: 'developer', content: 'Talk like a pirate.' },
    { role: 'user', content: 'Are semicolons optional in JavaScript?' },
  ],
});

console.log(completion.choices[0].message.content);
```

## API Resources Structure

The OpenAI client organizes endpoints into logical resource groupings:

```typescript
// Core API resources available on client
client.completions     // Text completions
client.chat           // Chat completions
client.embeddings     // Text embeddings
client.files          // File management
client.images         // Image generation
client.audio          // Audio processing
client.moderations    // Content moderation
client.models         // Model information
client.fineTuning     // Fine-tuning jobs
client.graders        // Model evaluation
```

## Streaming Responses

Both Responses and Chat Completions APIs support streaming for real-time output.

### Responses API Streaming

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const stream = await client.responses.create({
  model: 'gpt-5.5',
  input: 'Say "Sheep sleep deep" ten times fast!',
  stream: true,
});

for await (const event of stream) {
  console.log(event);
}
```

### Chat Completions Streaming

```typescript
const stream = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [{ role: 'user', content: 'Count to 10' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## File Uploads

The library supports multiple file upload formats for various use cases.

```typescript
import fs from 'fs';
import OpenAI, { toFile } from 'openai';

const client = new OpenAI();

// Method 1: Node.js fs.ReadStream (recommended for Node.js)
await client.files.create({
  file: fs.createReadStream('input.jsonl'),
  purpose: 'fine-tune'
});

// Method 2: Web File API
await client.files.create({
  file: new File(['my bytes'], 'input.jsonl'),
  purpose: 'fine-tune'
});

// Method 3: Fetch Response
await client.files.create({
  file: await fetch('https://somesite/input.jsonl'),
  purpose: 'fine-tune'
});

// Method 4: toFile helper utility
await client.files.create({
  file: await toFile(Buffer.from('my bytes'), 'input.jsonl'),
  purpose: 'fine-tune',
});
```

## Advanced Configuration

### Function Calling (Tools)

```typescript
const completion = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [{ role: 'user', content: 'What is the weather like today?' }],
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_current_weather',
        description: 'Get the current weather in a given location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g. San Francisco, CA',
            },
            unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
          },
          required: ['location'],
        },
      },
    },
  ],
  tool_choice: 'auto',
});
```

### Temperature and Sampling Parameters

Configure model behavior using parameters in the chat completions API:

```typescript
const completion = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [{ role: 'user', content: 'Write a creative story' }],
  temperature: 0.8,        // Higher = more creative (0-2)
  max_tokens: 1000,        // Maximum response length
  top_p: 0.9,             // Nucleus sampling
  frequency_penalty: 0.1,  // Reduce repetition
  presence_penalty: 0.1,   // Encourage new topics
});
```

### Structured Outputs (JSON Schema with Zod)

Use `client.chat.completions.parse()` with a Zod schema for type-safe parsed output.

```typescript
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const Person = z.object({
  name: z.string(),
  age: z.number(),
});

const client = new OpenAI();

const completion = await client.chat.completions.parse({
  model: 'gpt-5.5',
  messages: [
    { role: 'user', content: 'Extract the name and age from: "John is 30 years old"' },
  ],
  response_format: zodResponseFormat(Person, 'person'),
});

const person = completion.choices[0].message.parsed;
console.log(person?.name, person?.age);
```

### JSON Mode (Loose JSON)

For free-form JSON output without a schema:

```typescript
const completion = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [
    { role: 'system', content: 'Always respond with JSON.' },
    { role: 'user', content: 'Extract the name and age from: "John is 30 years old"' },
  ],
  response_format: { type: 'json_object' },
});

const result = JSON.parse(completion.choices[0].message.content!);
```

## Error Handling

The library provides specific error types for different failure scenarios:

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

try {
  const completion = await client.chat.completions.create({
    model: 'gpt-5.5',
    messages: [{ role: 'user', content: 'Hello!' }],
  });
} catch (error) {
  if (error instanceof OpenAI.RateLimitError) {
    console.log('Rate limit exceeded');
  } else if (error instanceof OpenAI.AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof OpenAI.APIError) {
    console.log(error.status);  // HTTP status code
    console.log(error.name);    // Error name
    console.log(error.headers); // Response headers
  } else {
    console.log('Unexpected error:', error);
  }
}
```

## Common Patterns

### Retry Logic with Exponential Backoff

```typescript
async function createCompletionWithRetry(messages: any[], maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.chat.completions.create({
        model: 'gpt-5.5',
        messages,
      });
    } catch (error) {
      if (error instanceof OpenAI.RateLimitError && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### Conversation Management

```typescript
class ChatSession {
  private messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor(private client: OpenAI, systemPrompt?: string) {
    if (systemPrompt) {
      this.messages.push({ role: 'system', content: systemPrompt });
    }
  }

  async sendMessage(content: string) {
    this.messages.push({ role: 'user', content });

    const completion = await this.client.chat.completions.create({
      model: 'gpt-5.5',
      messages: this.messages,
    });

    const response = completion.choices[0].message;
    this.messages.push(response);

    return response.content;
  }
}
```

## Useful Links

- **NPM Package:** https://www.npmjs.com/package/openai
- **GitHub:** https://github.com/openai/openai-node
- **API Reference:** https://developers.openai.com/api/reference
- **Models Guide:** https://developers.openai.com/api/docs/models
- **Responses API Guide:** https://developers.openai.com/api/docs/guides/responses
- **API Keys:** https://platform.openai.com/api-keys
- **Pricing:** https://openai.com/pricing
- **Rate Limits:** https://platform.openai.com/docs/guides/rate-limits
