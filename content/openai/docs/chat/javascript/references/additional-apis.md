# Additional APIs and Legacy Patterns (JavaScript/TypeScript)

## Legacy Chat Completions Function Calling

```typescript
const completion = await client.chat.completions.create({
  model: 'gpt-5.4',
  messages: [{ role: 'user', content: 'What is the weather like today?' }],
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get the current weather in a given location',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'City and state' },
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

## Legacy Chat Completions Structured Outputs (JSON Mode)

```typescript
const completion = await client.chat.completions.create({
  model: 'gpt-5.4',
  messages: [
    { role: 'user', content: 'Extract the name and age from: "John is 30 years old"' },
  ],
  response_format: { type: 'json_object' },
});

const result = JSON.parse(completion.choices[0].message.content);
```

## Error Handling

The library provides specific error types for different failure scenarios:

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

try {
  const completion = await client.chat.completions.create({
    model: 'gpt-5.4',
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
        model: 'gpt-5.4',
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

### Conversation Management (Legacy)

For manual conversation management with Chat Completions. Prefer the Conversations API for new code.

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
      model: 'gpt-5.4',
      messages: this.messages,
    });

    const response = completion.choices[0].message;
    this.messages.push(response);

    return response.content;
  }
}
```
