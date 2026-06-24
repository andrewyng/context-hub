---
name: claude-agent-sdk
description: "Claude Agent SDK (TypeScript) — build production AI agents with Claude Code as a library: query(), tools, MCP, permissions, hooks, sessions"
metadata:
  languages: "typescript"
  versions: "0.3.190"
  revision: 1
  updated-on: "2026-06-25"
  source: community
  tags: "anthropic,claude,agent-sdk,agents,typescript,mcp,claude-code"
---

# Claude Agent SDK — TypeScript (`@anthropic-ai/claude-agent-sdk`)

Build AI agents that use Claude Code as a library: the agent runs the agentic loop,
calls tools (file edits, bash, your custom functions, MCP), and you consume a stream
of messages. Package: `@anthropic-ai/claude-agent-sdk`. Requires Node.js 18+.
(A native Claude Code binary is bundled as an optional dependency — no separate install.)

## Install & auth

```bash
npm install @anthropic-ai/claude-agent-sdk
```

```bash
ANTHROPIC_API_KEY=sk-...              # .env or shell. Cloud providers:
# Bedrock: CLAUDE_CODE_USE_BEDROCK=1  •  Vertex: CLAUDE_CODE_USE_VERTEX=1  •  Foundry: CLAUDE_CODE_USE_FOUNDRY=1
```

## Minimal agent — `query()`

`query()` is the entry point. It's an async iterator yielding messages.

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Review utils.py for crash bugs and fix them.",
  options: {
    allowedTools: ["Read", "Edit", "Glob"],
    permissionMode: "acceptEdits",
  },
})) {
  if (message.type === "assistant" && message.message?.content) {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);
      else if ("name" in block) console.log(`Tool: ${block.name}`);
    }
  } else if (message.type === "result") {
    console.log(`Done: ${message.subtype}`);   // 'result' / 'error'
  }
}
```

Run with `npx tsx agent.ts`.

## Key options fields

| Field | Type | Purpose |
| --- | --- | --- |
| `allowedTools` | `string[]` | tools auto-approved without prompting (does NOT restrict to only these) |
| `disallowedTools` | `string[]` | tools to deny, e.g. `"Bash(rm *)"`, `"mcp__*"` |
| `permissionMode` | `PermissionMode` | `default`/`acceptEdits`/`plan`/`auto`/`dontAsk`/`bypassPermissions` |
| `systemPrompt` | `string \| { type:'preset', preset:'claude_code', append?: string }` | custom or the Claude Code preset |
| `mcpServers` | `Record<string, McpServerConfig>` | in-process or external MCP servers |
| `model` | `string` | e.g. `"claude-sonnet-4-6"` |
| `maxTurns` | `number` | cap agentic turns |
| `cwd` | `string` | working directory |
| `settingSources` | `('user'\|'project'\|'local')[]` | `[]` skips all ambient settings |
| `canUseTool` | `CanUseTool` | custom permission callback |
| `hooks` | object | lifecycle hooks |
| `resume` / `continue` | `string` / `boolean` | session resume / multi-turn continue |
| `skills` | `string[] \| 'all'` | enable specific or all discovered skills |
| `outputSchema` / structured output | — | see structured-outputs guide |

## Custom tools (in-process MCP)

Define a tool with `tool(name, description, zodSchema, handler)` (positional args), wrap
it in an in-process MCP server, pass to `mcpServers`. Tool name becomes `mcp__<server>__<tool>`.

```typescript
import { tool, createSdkMcpServer, query } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const add = tool(
  "add",                       // name
  "Add two numbers",           // description (Claude sees this)
  { a: z.number(), b: z.number() },                 // Zod raw shape = input schema
  async (args) => ({ content: [{ type: "text", text: String(args.a + args.b) }] }),  // handler
);

const calc = createSdkMcpServer({ name: "calc", version: "1.0.0", tools: [add] });

for await (const m of query({
  prompt: "What is 2 + 2?",
  options: {
    mcpServers: { calc },
    allowedTools: ["mcp__calc__add"],
    permissionMode: "acceptEdits",
  },
})) {
  /* ... */
}
```

## External MCP servers

Pass a config record (same shape as `.mcp.json`):

```typescript
options: {
  mcpServers: {
    db: { command: "npx", args: ["-y", "db-mcp"], env: { URL: "..." } },
  },
  allowedTools: ["mcp__db__query"],
}
```

## Sessions (multi-turn)

```typescript
// First turn — capture result.session_id from the final 'result' message.
// Continue the SAME session (shared history):
query({ prompt: "...", options: { resume: "<session-id>" } });
// same-process chaining: options: { continue: true }
```

## Gotchas

- **`allowedTools` auto-approves but doesn't restrict.** To restrict tools, use
  `disallowedTools` (or `tools` to list exactly the built-ins you want). Unlisted tools
  fall through to the permission mode / `canUseTool`.
- **`bypassPermissions` is the only fully non-interactive mode besides `dontAsk`/`auto`.**
  For autonomous agents in a sandbox, use `permissionMode: "bypassPermissions"`.
- **`systemPrompt` default is minimal.** Pass `{ type: "preset", preset: "claude_code" }`
  to get Claude Code's full system prompt (with tool guidance).
- **Use `settingSources: []`** in production/embedded use to avoid picking up the user's
  ambient `~/.claude` settings and MCP servers; add `strictMcpConfig: true` to use only
  the servers you pass in `mcpServers`.
- **`auto` mode is TypeScript-only** in the SDK (a classifier approves/denies each call).
