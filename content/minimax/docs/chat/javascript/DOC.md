---
name: chat
description: "MiniMax API for chat completions, streaming, function calling, and vision via OpenAI-compatible endpoint"
metadata:
  languages: "javascript"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-14"
  source: community
  tags: "minimax,llm,chat,streaming,openai-compatible"
---

# MiniMax Chat API — JavaScript Guide

## When To Use

Use the MiniMax API when you need high-performance text generation with large context windows (up to 204K tokens). MiniMax exposes an OpenAI-compatible endpoint, so you can use the standard `openai` Node.js SDK with a custom `baseURL`.

## Install

MiniMax uses the OpenAI Node.js SDK. No additional package is needed.

```bash
npm install openai
```

## Authentication And Setup

Get an API key from the MiniMax platform at `https://platform.minimaxi.com`. Set it as an environment variable:

```bash
export MINIMAX_API_KEY="your-api-key"
```

Create the client with the MiniMax base URL:

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://api.minimax.io/v1",
});
```

## Models

| Model | Context Window | Notes |
|-------|---------------|-------|
| `MiniMax-M2.7` | 204K tokens | Latest flagship model with enhanced reasoning and coding |
| `MiniMax-M2.7-highspeed` | 204K tokens | High-speed version of M2.7 for low-latency scenarios |
| `MiniMax-M2.5` | 204K tokens | Previous generation flagship model |
| `MiniMax-M2.5-highspeed` | 204K tokens | Previous generation high-speed model |

Use `MiniMax-M2.7` for quality-sensitive tasks. Use `MiniMax-M2.7-highspeed` when latency matters more than peak quality.

## Core Usage

### Chat Completions

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://api.minimax.io/v1",
});

const completion = await client.chat.completions.create({
  model: "MiniMax-M2.7",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain the difference between TCP and UDP." },
  ],
  temperature: 0.7,
});

console.log(completion.choices[0].message.content);
```

### Streaming

Set `stream: true` and iterate over the chunks:

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://api.minimax.io/v1",
});

const stream = await client.chat.completions.create({
  model: "MiniMax-M2.7",
  messages: [{ role: "user", content: "Write a haiku about programming." }],
  stream: true,
  temperature: 0.7,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || "";
  if (delta) {
    process.stdout.write(delta);
  }
}
console.log();
```

## Function Calling (Tools)

MiniMax supports OpenAI-style function calling:

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://api.minimax.io/v1",
});

const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get the current weather for a location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City name, e.g. San Francisco",
          },
        },
        required: ["location"],
      },
    },
  },
];

const completion = await client.chat.completions.create({
  model: "MiniMax-M2.7",
  messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  tools,
  temperature: 0.7,
});

const message = completion.choices[0].message;
if (message.tool_calls) {
  for (const toolCall of message.tool_calls) {
    console.log(`Function: ${toolCall.function.name}`);
    console.log(`Arguments: ${toolCall.function.arguments}`);
  }
}
```

## Configuration Options

### Temperature

MiniMax requires `temperature` to be strictly between 0.0 (exclusive) and 1.0 (inclusive). A value of exactly `0.0` is rejected.

```javascript
// Valid
const completion = await client.chat.completions.create({
  model: "MiniMax-M2.7",
  messages: [{ role: "user", content: "Hello" }],
  temperature: 0.01, // near-deterministic
});

// Invalid — will be rejected
// temperature: 0.0
```

For near-deterministic output, use a very small value like `0.01`.

## Error Handling

Since MiniMax uses the OpenAI SDK, error handling follows the same patterns:

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://api.minimax.io/v1",
});

try {
  const completion = await client.chat.completions.create({
    model: "MiniMax-M2.7",
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0.7,
  });
  console.log(completion.choices[0].message.content);
} catch (error) {
  if (error instanceof OpenAI.AuthenticationError) {
    console.error("Invalid API key.");
  } else if (error instanceof OpenAI.RateLimitError) {
    console.error("Rate limit exceeded.");
  } else if (error instanceof OpenAI.APIConnectionError) {
    console.error("Failed to connect to MiniMax API.");
  } else if (error instanceof OpenAI.APIError) {
    console.error(`API error: ${error.status}`);
  }
}
```

## Common Pitfalls

- **Temperature must be > 0.** Setting `temperature: 0.0` raises an error. Use `0.01` for near-deterministic behavior.
- **Model names are case-sensitive.** Use `MiniMax-M2.7`, not `minimax-m2.7`.
- **Always set `baseURL`.** Without `baseURL: "https://api.minimax.io/v1"`, requests go to OpenAI instead of MiniMax.
- **Use a dedicated env var.** Store the key in `MINIMAX_API_KEY` (not `OPENAI_API_KEY`) to avoid confusion when working with multiple providers.
- **Large context window.** MiniMax supports up to 204K tokens, but longer inputs cost more and take longer to process. Only send what you need.

## Official Resources

- MiniMax platform: `https://platform.minimaxi.com`
- MiniMax API documentation: `https://platform.minimaxi.com/document/introduction`
- MiniMax website: `https://www.minimaxi.com`
