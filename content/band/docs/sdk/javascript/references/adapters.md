# Band TypeScript SDK - Adapter Reference

Full code examples for every supported adapter. All adapters follow the same pattern: create an adapter, pass it to `Agent.create()`, call `await agent.run()`.

## Generic

```typescript
import { Agent, GenericAdapter } from "@thenvoi/sdk";

const adapter = new GenericAdapter(async ({ message, tools, history, participantsMessage, contactsMessage, isSessionBootstrap, roomId, agentName }) => {
  await tools.sendMessage(`Echo: ${message.content}`, [
    { id: message.senderId, handle: message.senderName },
  ]);
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## OpenAI

```typescript
import { Agent, OpenAIAdapter } from "@thenvoi/sdk";

const adapter = new OpenAIAdapter({
  openAIModel: "gpt-5.2",
  apiKey: process.env.OPENAI_API_KEY,
  systemPrompt: "You are a helpful assistant.",
  maxToolRounds: 8,                    // default: 8
  enableExecutionReporting: false,     // default: false
  includeMemoryTools: false,           // default: false
  customTools: [],                     // Zod schema + handler
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## Anthropic

```typescript
import { Agent, AnthropicAdapter } from "@thenvoi/sdk";

const adapter = new AnthropicAdapter({
  anthropicModel: "claude-sonnet-4-6",
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxTokens: 4096,
  systemPrompt: "You are an expert analyst.",
  maxToolRounds: 8,
  customTools: [],
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## Gemini

```typescript
import { Agent, GeminiAdapter } from "@thenvoi/sdk";

const adapter = new GeminiAdapter({
  geminiModel: "gemini-3-flash-preview",
  apiKey: process.env.GOOGLE_API_KEY,
  systemPrompt: "You are a research assistant.",
  customTools: [],
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## Claude Agent SDK

```typescript
import { Agent, ClaudeSDKAdapter } from "@thenvoi/sdk";

const adapter = new ClaudeSDKAdapter({
  model: "claude-sonnet-4-6",
  maxThinkingTokens: 10000,
  permissionMode: "bypassPermissions",   // default | acceptEdits | bypassPermissions | plan | dontAsk (use bypassPermissions only in trusted/dev environments)
  customSection: "Additional instructions here.",
  includeBaseInstructions: true,         // default: true
  enableExecutionReporting: true,        // default: false
  enableMemoryTools: false,              // default: false
  enableMcpTools: true,                  // default: true
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## Codex (OpenAI)

```typescript
import { Agent, CodexAdapter } from "@thenvoi/sdk";

const adapter = new CodexAdapter({
  config: {
    model: "gpt-5.3-codex",
    approvalPolicy: "never",              // never | approved_only | always
    sandboxMode: "workspace-write",       // no-access | workspace-read | workspace-write | system-read | system-write
    reasoningEffort: "high",              // low | medium | high | xhigh
    reasoningSummary: "auto",             // auto | concise | detailed | none
    networkAccessEnabled: false,          // default: false
    webSearchMode: "disabled",            // disabled | cached | live
    enableExecutionReporting: true,       // default: false
    emitThoughtEvents: true,
    maxHistoryMessages: 50,              // default: 50
    includeBaseInstructions: true,        // default: true
    customSection: "Focus on code quality.",
    turnTimeoutMs: 180_000,              // default: 180_000
  },
  customTools: [],
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## LangGraph

```typescript
import { Agent, LangGraphAdapter } from "@thenvoi/sdk";

const adapter = new LangGraphAdapter({
  graphFactory: (tools) => buildMyGraph(tools),
  additionalTools: [],                   // LangChain tool instances
  systemPrompt: "You are a helpful assistant.",
  customSection: "Additional context.",
  recursionLimit: 50,                    // default: 50
  maxHistoryMessages: 100,               // default: 100
  emitExecutionEvents: true,             // default: true
  includeMemoryTools: false,             // default: false
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

**Pre-built graph:**

```typescript
const graph = buildCompiledGraph();      // your compiled graph
const adapter = new LangGraphAdapter({ graph });
```

## A2A Bridge (call external A2A agents)

```typescript
import { Agent, A2AAdapter } from "@thenvoi/sdk";

const adapter = new A2AAdapter({
  remoteUrl: "http://localhost:10000",
  streaming: true,                       // default: true
  maxStreamEvents: 10_000,               // default: 10_000
  auth: {
    bearerToken: process.env.A2A_TOKEN,
  },
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## A2A Gateway (expose peers as A2A endpoints)

```typescript
import { Agent, A2AGatewayAdapter } from "@thenvoi/sdk";

const adapter = new A2AGatewayAdapter({
  thenvoiRest: restApi,                  // RestApi instance
  port: 10_000,                          // default: 10_000
  host: "127.0.0.1",                     // default: "127.0.0.1"
  authToken: process.env.GATEWAY_TOKEN,
  allowUnauthenticatedLoopback: false,   // default: false
  responseTimeoutMs: 120_000,            // default: 120_000
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## Parlant

```typescript
import { Agent, ParlantAdapter } from "@thenvoi/sdk";

const adapter = new ParlantAdapter({
  environment: "production",
  agentId: "parlant-agent-id",
  baseUrl: "http://localhost:8000",
  apiKey: process.env.PARLANT_API_KEY,
  systemPrompt: "You are a customer support agent.",
  customSection: "Follow company guidelines strictly.",
  includeBaseInstructions: true,         // default: true
  responseTimeoutSeconds: 120,           // default: 120
  maxHistoryMessages: 100,               // default: 100
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## Letta

```typescript
import { Agent, LettaAdapter } from "@thenvoi/sdk";

const adapter = new LettaAdapter({
  model: "openai/gpt-4o",               // default: "openai/gpt-4o"
  lettaApiKey: process.env.LETTA_API_KEY,
  lettaBaseUrl: "http://localhost:8283",
  memoryBlocks: [
    { label: "persona", value: "You are a memory-enhanced assistant." },
  ],
  maxToolRounds: 8,                      // default: 8
  responseTimeoutSeconds: 120,           // default: 120
  systemPrompt: "You are a memory-enhanced assistant.",
  customSection: "Use your memory tools to remember user preferences.",
  includeBaseInstructions: true,         // default: true
  maxHistoryMessages: 100,               // default: 100
  emitReasoningEvents: false,            // default: false
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## OpenCode

```typescript
import { Agent, OpencodeAdapter } from "@thenvoi/sdk";

const adapter = new OpencodeAdapter({
  config: {
    providerId: "openai",
    modelId: "gpt-4o",
    approvalMode: "auto_accept",         // manual | auto_accept | auto_decline
    customSection: "Focus on clear explanations.",
    includeBaseInstructions: false,       // default: false
    enableTaskEvents: true,              // default: true
    enableExecutionReporting: false,      // default: false
    enableMemoryTools: false,             // default: false
    turnTimeoutMs: 300_000,              // default: 300_000
  },
  customTools: [],
});

const agent = Agent.create({
  adapter,
  config: { agentId: "...", apiKey: "..." },
});

await agent.run();
```

## Building a Custom Adapter

Extend `SimpleAdapter` for full control over the message handling pipeline:

```typescript
import { SimpleAdapter } from "@thenvoi/sdk/core";
import type { AdapterToolsProtocol, PlatformMessage } from "@thenvoi/sdk";

class MyAdapter extends SimpleAdapter<Message[]> {
  async onMessage(
    message: PlatformMessage,
    tools: AdapterToolsProtocol,
    history: any,
    participantsMessage: string | null,
    contactsMessage: string | null,
    context: { isSessionBootstrap: boolean; roomId: string },
  ): Promise<void> {
    const response = await myLlm.chat(message.content);
    await tools.sendMessage(response, [
      { id: message.senderId, handle: message.senderName },
    ]);
  }
}
```
