# Band TypeScript SDK - Custom Tools Reference

Custom tools let agents call your own functions alongside the built-in platform tools. Define tools with Zod schemas and async handlers.

## Zod Schema + Handler

Used by: `CodexAdapter`, `OpenAIAdapter`, `AnthropicAdapter`, `GeminiAdapter`, `ClaudeSDKAdapter`

```typescript
import { z } from "zod";

const customTools = [
  {
    name: "search_database",
    description: "Search the internal database for matching records.",
    schema: z.object({
      query: z.string().describe("Search query"),
      limit: z.number().optional().default(10).describe("Max results"),
    }),
    handler: async ({ query, limit }) => {
      return `Found ${limit} results for: ${query}`;
    },
  },
  {
    name: "deploy",
    description: "Deploy the application.",
    schema: z.object({
      environment: z.enum(["staging", "production"]),
      version: z.string(),
    }),
    handler: async ({ environment, version }) => {
      return `Deployed ${version} to ${environment}`;
    },
  },
];

const adapter = new CodexAdapter({
  config: { model: "gpt-5.3-codex" },
  customTools,
});
```

## LangGraph Tools

Used by: `LangGraphAdapter`

LangGraph in TypeScript uses LangChain-style tool definitions:

```typescript
import { LangGraphAdapter } from "@thenvoi/sdk";

const adapter = new LangGraphAdapter({
  graphFactory: (tools) => buildMyGraph(tools),
  additionalTools: [],        // LangChain tool instances
  systemPrompt: "You are a helpful assistant.",
});
```

## Tool Errors

When a custom tool fails, the SDK wraps the error:

- `CustomToolValidationError` — Zod validation failed (bad arguments)
- `CustomToolExecutionError` — handler threw an exception

The error message is returned to the LLM so it can retry or report the failure.

## Accessing Tool Schemas

Retrieve registered tool schemas in LLM-native formats:

```typescript
const openaiSchemas = tools.getOpenAIToolSchemas();   // OpenAI format
const anthropicSchemas = tools.getAnthropicToolSchemas(); // Anthropic format
```

## Best Practices

- Keep tool descriptions concise and action-oriented
- Use `.describe(...)` on every Zod field for clear parameter documentation
- Return strings from handlers (LLMs work with text)
- Throw errors with clear messages on failure
- Avoid side effects in tool handlers when possible
