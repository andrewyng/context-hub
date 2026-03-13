# context-hub

Curated, versioned API docs and agent skills for 80+ services — fetched on-demand by coding agents via the `chub` CLI and MCP server.

## Overview

Context Hub gives coding agents accurate, up-to-date API documentation instead of relying on training data that goes stale. Agents search, fetch, annotate, and rate docs in a continuous feedback loop that makes them smarter over time.

Content covers services like OpenAI, Anthropic, Stripe, AWS, GitHub, and many more — all open markdown, inspectable and community-contributed.

## Installation

Requires: Node.js ≥ 18

```bash
atk add github.com/andrewyng/context-hub
```

No environment variables required — Context Hub is a free, public service.

After install, register the MCP server with your coding agent:

```bash
atk mcp show context-hub          # inspect the generated MCP config
atk mcp add context-hub --claude --codex --gemini    # pick your agents
```

## Usage

The plugin exposes the `chub` MCP server to your agent. Once connected, the agent can call:

| Tool | Purpose |
|------|---------|
| `chub_search` | Search for docs or skills by keyword, tag, or language |
| `chub_get` | Fetch a doc or skill by ID (e.g. `openai/chat`) |
| `chub_list` | List all available entries |
| `chub_annotate` | Read, write, or clear local agent annotations |
| `chub_feedback` | Send quality ratings back to doc authors |

Your agent is automatically instructed how to use these tools via the bundled `SKILL.md`.

## Links

- [Repository](https://github.com/andrewyng/context-hub)
- [CLI Reference](https://github.com/andrewyng/context-hub/blob/main/docs/cli-reference.md)
- [Content Guide](https://github.com/andrewyng/context-hub/blob/main/docs/content-guide.md)

