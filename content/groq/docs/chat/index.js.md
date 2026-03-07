---
id: groq/chat
title: Groq Chat Completions
version: "1.0"
lang: js
---

# Groq Chat Completions — JavaScript/TypeScript

## Install
```bash
npm install groq-sdk
```

## Basic usage
```typescript
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const response = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain fast LLM inference." },
  ],
  max_completion_tokens: 1024,
});

console.log(response.choices[0].message.content);
```

## Streaming
```typescript
const stream = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: "Count to 5." }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}
```

## Error handling
```typescript
import Groq from "groq-sdk";

try {
  await client.chat.completions.create({ ... });
} catch (err) {
  if (err instanceof Groq.RateLimitError) {
    // Back off and retry
  } else if (err instanceof Groq.APIConnectionError) {
    console.error(err.cause);
  }
}
```