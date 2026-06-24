---
name: claude-agent-sdk
description: "Claude Agent SDK (Python) — build production AI agents with Claude Code as a library: query(), tools, MCP, permissions, hooks, sessions"
metadata:
  languages: "python"
  versions: "0.2.109"
  revision: 1
  updated-on: "2026-06-25"
  source: community
  tags: "anthropic,claude,agent-sdk,agents,python,mcp,claude-code"
---

# Claude Agent SDK — Python (`claude-agent-sdk`)

Build AI agents that use Claude Code as a library: the agent runs the agentic loop,
calls tools (file edits, bash, your custom functions, MCP), and you consume a stream
of messages. Package: `claude-agent-sdk`. Requires Python 3.10+.

## Install & auth

```bash
pip install claude-agent-sdk          # or: uv add claude-agent-sdk
```

```bash
ANTHROPIC_API_KEY=sk-...              # in .env or shell. Cloud providers:
# Bedrock: CLAUDE_CODE_USE_BEDROCK=1  •  Vertex: CLAUDE_CODE_USE_VERTEX=1  •  Foundry: CLAUDE_CODE_USE_FOUNDRY=1
```

## Minimal agent — `query()`

`query()` is the entry point. It's an async iterator yielding messages.

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ResultMessage

async def main():
    async for message in query(
        prompt="Review utils.py for crash bugs and fix them.",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Edit", "Glob"],
            permission_mode="acceptEdits",
        ),
    ):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if hasattr(block, "text"):    print(block.text)
                elif hasattr(block, "name"):  print(f"Tool: {block.name}")
        elif isinstance(message, ResultMessage):
            print(f"Done: {message.subtype}")   # 'result' / 'error'

asyncio.run(main())
```

## Key `ClaudeAgentOptions` fields

| Field | Type | Purpose |
| --- | --- | --- |
| `allowed_tools` | `list[str]` | tools auto-approved without prompting (does NOT restrict to only these) |
| `disallowed_tools` | `list[str]` | tools to deny, e.g. `"Bash(rm *)"` |
| `permission_mode` | `str` | `default`/`acceptEdits`/`plan`/`dontAsk`/`bypassPermissions` |
| `system_prompt` | `str \| {'type':'preset','preset':'claude_code'}` | custom or the Claude Code preset |
| `append_system_prompt` | `str` | add to the default prompt |
| `mcp_servers` | `dict[str, McpServerConfig] \| path` | in-process or external MCP servers |
| `model` | `str` | e.g. `"claude-sonnet-4-6"` |
| `max_turns` | `int` | cap agentic turns |
| `cwd` | `str \| Path` | working directory |
| `setting_sources` | `list` | which settings to load: `[]` skips all (user/project/local) |
| `can_use_tool` | `callable` | custom permission callback |
| `hooks` | `dict` | lifecycle hooks |
| `resume` / `continue_conversation` | `str` / `bool` | session resume / multi-turn continue |
| `output_format` | `dict` | JSON schema for structured output |

## Custom tools (in-process MCP)

Define a tool with `@tool(name, description, schema)`, wrap it in an in-process MCP
server, pass to `mcp_servers`. Tool name becomes `mcp__<server>__<tool>`. The handler
returns a **content array** (what Claude sees as the result).

```python
from claude_agent_sdk import tool, create_sdk_mcp_server, query, ClaudeAgentOptions

@tool(
    "add",
    "Add two numbers",
    {"a": float, "b": float},          # schema: {field: python type}
)
async def add(args: dict) -> dict:
    return {"content": [{"type": "text", "text": str(args["a"] + args["b"])}]}

calc = create_sdk_mcp_server(name="calc", version="1.0.0", tools=[add])

async for m in query(
    prompt="What is 2 + 2?",
    options=ClaudeAgentOptions(
        mcp_servers={"calc": calc},
        allowed_tools=["mcp__calc__add"],
        permission_mode="acceptEdits",
    ),
):
    ...
```

The schema dict maps field names to Python types (`int`, `float`, `str`, `bool`); each key is required.

## External MCP servers

Pass a config dict (same shape as `.mcp.json`):

```python
options = ClaudeAgentOptions(
    mcp_servers={"db": {"command": "npx", "args": ["-y", "db-mcp"], "env": {"URL": "..."}}},
    allowed_tools=["mcp__db__query"],
)
```

## Structured output

Pass a JSON schema to `output_format`; the SDK validates and re-prompts on mismatch:

```python
options = ClaudeAgentOptions(
    allowed_tools=["WebSearch"],
    permission_mode="acceptEdits",
    output_format={
        "type": "object",
        "properties": {"name": {"type": "string"}, "employee_count": {"type": "integer"}},
        "required": ["name"],
    },
)
```

## Sessions (multi-turn)

```python
# First turn
options = ClaudeAgentOptions(...)
# ... run query(), capture result.session_id

# Continue the SAME session (shared history)
options2 = ClaudeAgentOptions(resume="<session_id>")          # resume by id
# or for same-process chaining: continue_conversation=True
```

## Gotchas

- **`allowed_tools` auto-approves but doesn't restrict.** To actually restrict tools,
  use `disallowed_tools`, or rely on `permission_mode`. Unlisted tools fall through to
  the permission mode / `can_use_tool`.
- **`bypassPermissions` is the only fully non-interactive mode besides `dontAsk`.** For
  autonomous agents in a sandbox, use `permission_mode="bypassPermissions"`.
- **`system_prompt` default is minimal.** Pass `{"type":"preset","preset":"claude_code"}`
  to get Claude Code's full system prompt (with tool guidance) instead of a bare one.
- **Opus 4.7 needs SDK ≥ 0.2.111** (`thinking.type.adaptive`). If you hit
  `thinking.type.enabled is not supported`, upgrade.
- **Use `setting_sources=[]`** in production/embedded use to avoid picking up the user's
  ambient `~/.claude` settings and MCP servers.
