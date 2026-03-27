---
name: cortex-code
description: "Snowflake Cortex Code CLI — AI-powered coding assistant with native Snowflake integration, SQL execution, semantic views, MCP support, skills, and subagents"
metadata:
  languages: "bash"
  versions: "1.0.36"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "snowflake,cortex,cli,ai,coding-assistant,sql,mcp,agents,skills"
---

# Cortex Code CLI

Cortex Code (CoCo) is Snowflake's AI-powered coding assistant CLI. It connects directly to your Snowflake account and orchestrates SQL execution, object discovery, semantic views, Cortex Analyst, MCP integrations, skills, and subagents from your terminal.

## Install

```bash
# Linux / macOS / WSL
curl -LsS https://ai.snowflake.com/static/cc-scripts/install.sh | sh

# Windows (PowerShell)
irm https://ai.snowflake.com/static/cc-scripts/install.ps1 | iex
```

The `cortex` binary installs to `~/.local/bin` (Linux/macOS) or `%LOCALAPPDATA%\cortex` (Windows).

## Connect to Snowflake

Run `cortex` to launch the setup wizard. It reads connections from `~/.snowflake/connections.toml`:

```toml
[default]
account = "myaccount"
user = "myuser"
authenticator = "externalbrowser"
database = "MYDB"
schema = "PUBLIC"
warehouse = "COMPUTE_WH"
role = "DEVELOPER"
```

Supported auth methods: `externalbrowser` (SSO), `snowflake_jwt` (key-pair), `snowflake` (password), `oauth`, `PROGRAMMATIC_ACCESS_TOKEN`.

## Quick Start

```bash
cortex                              # Start interactive REPL
cortex -p "summarize README.md"     # Non-interactive (print) mode
cortex --resume last                # Resume last session
cortex -c my-connection             # Use specific Snowflake connection
cortex --plan                       # Start in plan mode
```

## Core Concepts

### Special Input Syntax

| Syntax | Action | Example |
|--------|--------|---------|
| `@path` | Include file context | `@src/app.ts` |
| `@path$N-M` | Include line range | `@src/app.ts$10-50` |
| `$skill` | Invoke a skill | `$ml-guide help` |
| `#TABLE` | Inject Snowflake table metadata | `#MY_DB.PUBLIC.USERS` |
| `!cmd` | Run bash (output goes to agent) | `!git status` |
| `/cmd` | Slash command | `/help` |
| `?` | Quick help overlay | `?` |

### Operational Modes

| Mode | Activate | Description |
|------|----------|-------------|
| Confirm Actions | default | Normal with permission checks |
| Plan Mode | `/plan` or `Ctrl+P` | Review actions before execution |
| Bypass Safeguards | `/bypass` | Auto-approve all tool calls |

Cycle modes with `Shift+Tab`.

### Essential Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Submit message |
| `Ctrl+J` | Insert newline |
| `Ctrl+C` | Cancel / Exit |
| `Shift+Tab` | Cycle operational modes |
| `Ctrl+P` | Toggle plan mode |
| `Ctrl+O` | Cycle display mode |
| `Ctrl+R` | Search prompt history |
| `Ctrl+B` | Background bash process |
| `Ctrl+D` | Fullscreen todo view |
| `Ctrl+T` | SQL table view |
| `Escape` | Cancel streaming |

## Snowflake Integration

Cortex Code connects natively to Snowflake. No separate SDK needed.

### #TABLE Context Injection

Type `#` followed by a fully-qualified table name to auto-inject metadata (columns, types, sample rows):

```
Analyze the data in #MY_DB.PUBLIC.USERS
```

### SQL Execution

```
/sql SELECT COUNT(*) FROM my_table
```

Use `/table` to view results in a fullscreen table. The agent also executes SQL autonomously when needed.

### Object Search

```bash
cortex search object "user activity tables"
```

Semantic search across databases, schemas, tables, views, and functions.

### Cortex Analyst

```bash
cortex analyst query "What was revenue last month?" --model=revenue.yaml
cortex analyst query "Top customers by spend" --view=ANALYTICS.CORE.REVENUE_METRICS
cortex reflect revenue.yaml    # Validate semantic model
```

### Semantic Views

```bash
cortex semantic-views discover          # Find all semantic views
cortex semantic-views describe <view>   # Show dimensions, facts, metrics
cortex semantic-views search "revenue"  # Search by keyword
```

### Product Docs Search

```bash
cortex search docs "how to create a stored procedure"
```

## Session Management

| Command | Description |
|---------|-------------|
| `/resume` | Resume a previous session |
| `/fork` | Fork conversation from a specific point |
| `/rewind` | Roll back to a previous state |
| `/compact` | Summarize and clear history (frees context) |
| `/rename <name>` | Name the session for easy retrieval |
| `/diff` | Fullscreen git diff viewer |

```bash
cortex -r last                  # Resume last session from CLI
cortex resume                   # Interactive session picker
```

## Key Slash Commands

| Command | Description |
|---------|-------------|
| `/help` | Show help |
| `/status` | Session status |
| `/model <name>` | Switch model |
| `/sql <query>` | Execute SQL |
| `/settings` | Interactive settings editor |
| `/connections` | Connection manager |
| `/mcp` | MCP server manager |
| `/skill` | Skill manager |
| `/hooks` | Hook manager |
| `/agents` | Subagent manager |
| `/theme` | Theme selector |

## Skills

Skills are reusable instruction sets invoked with the `$` prefix:

```
$developing-with-streamlit build a dashboard for my sales data
```

Skill locations (priority order): project (`.cortex/skills/`) > global (`~/.snowflake/cortex/skills/`) > remote > bundled.

## Subagents

Cortex Code spawns autonomous child agents for complex tasks:

| Agent Type | Description |
|------------|-------------|
| `general-purpose` | Full tool access for multi-step tasks |
| `Explore` | Fast read-only codebase exploration |
| `Plan` | Architecture and implementation planning (read-only) |

Agents can run in background. Use `/agents` to manage them.

## MCP (Model Context Protocol)

Extend Cortex Code by connecting external services:

```bash
cortex mcp add github -e GITHUB_TOKEN=$GITHUB_TOKEN -- npx -y @modelcontextprotocol/server-github
cortex mcp list
```

Config: `~/.snowflake/cortex/mcp.json`. Supports `stdio`, `sse`, and `http` transports.

## Supported Models

| Model | Identifier |
|-------|------------|
| Auto (recommended) | `auto` |
| Claude Opus 4.6 | `claude-opus-4-6` |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` |
| Claude Opus 4.5 | `claude-opus-4-5` |
| Claude Sonnet 4.5 | `claude-sonnet-4-5` |
| Claude Sonnet 4.0 | `claude-4-sonnet` |
| OpenAI GPT 5.2 | `openai-gpt-5.2` |

Switch models: `/model claude-opus-4-6`

## Prerequisites

- Snowflake account with `SNOWFLAKE.CORTEX_USER` database role
- At least one supported model available in your account
- Supported platforms: macOS (arm64/x64), Linux (x64/arm64), Windows WSL, Windows native (preview)
- If your model is not in-region, enable cross-region inference:
  ```sql
  ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'AWS_US';
  ```

## Reference Files

For detailed documentation, see:

- `references/commands.md` — Full CLI commands, slash commands, and flags
- `references/snowflake-tools.md` — SQL execution, #TABLE, object search, Cortex Analyst, semantic views, artifacts
- `references/mcp-and-agents.md` — MCP configuration, transport types, subagent system, custom agents
- `references/configuration.md` — Settings, environment variables, connections, skills, hooks
