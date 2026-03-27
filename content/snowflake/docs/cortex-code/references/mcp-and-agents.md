# MCP and Agents Reference

Extending Cortex Code with MCP servers and autonomous subagents.

## MCP (Model Context Protocol)

MCP connects Cortex Code to external services, databases, APIs, and tools.

### Managing Servers

```bash
cortex mcp add <name> <command>         # Add server
cortex mcp list                         # List all servers
cortex mcp remove <name>                # Remove server
cortex mcp show <name>                  # Show server details
/mcp                                    # Interactive manager
```

### Configuration

MCP servers are configured in `~/.snowflake/cortex/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" },
      "transport": "stdio",
      "timeout": 60000
    }
  }
}
```

### Config Fields

| Field | Description |
|-------|-------------|
| `command` | Command to start server |
| `args` | Command arguments |
| `env` | Environment variables (`${VAR}` for expansion) |
| `transport` | `stdio` (default), `sse`, or `http` |
| `timeout` | Connection timeout in ms |
| `url` | Server URL (for SSE/HTTP) |
| `headers` | HTTP headers (for SSE/HTTP) |

### Transport Types

| Type | Use Case | Key Config |
|------|----------|------------|
| `stdio` | Local process | `command`, `args` |
| `sse` | Remote SSE server | `url`, `headers` |
| `http` | Remote HTTP API | `url`, `headers` |

### Adding Servers

```bash
# stdio
cortex mcp add my-server -- npx -y @scope/mcp-server

# With env vars
cortex mcp add my-server -e API_KEY=secret -- npx -y @scope/mcp-server

# SSE
cortex mcp add my-server --transport sse https://example.com/sse

# HTTP with auth header
cortex mcp add my-server --transport http -H "Authorization: Bearer token" https://example.com/api
```

### Common MCP Servers

```bash
# GitHub
cortex mcp add github -e GITHUB_TOKEN=$GITHUB_TOKEN -- npx -y @modelcontextprotocol/server-github

# Filesystem
cortex mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem ~/Documents

# PostgreSQL
cortex mcp add postgres -e DATABASE_URL=$DATABASE_URL -- npx -y @modelcontextprotocol/server-postgres
```

### MCP Tool Naming

Tools follow the pattern `mcp__<server>__<tool>`. Example: `mcp__github__create_issue`.

### Disabling MCP

```bash
cortex --no-mcp                         # Start without MCP
```

## Subagents

Cortex Code spawns autonomous child agents for complex, multi-step tasks.

### Built-in Agent Types

| Type | Description | Capabilities |
|------|-------------|--------------|
| `general-purpose` | Multi-step tasks, code changes | All tools |
| `Explore` | Fast codebase exploration | Read-only |
| `Plan` | Architecture and implementation planning | Read-only |
| `feedback` | Collect and process user feedback | Ask questions |
| `dbt-verify` | dbt project verification | All tools |

### Explore Agent Thoroughness

When asking for exploration, specify a level:
- `"quick"` — basic file/keyword search
- `"medium"` — moderate exploration across related files
- `"very thorough"` — comprehensive multi-location analysis

### Background Execution

Agents can run in background while you continue working:
- Use `/agents` to view status and manage running agents
- Background agents return an `agent_id` for retrieving results later
- Background agents cannot spawn other background agents

### Custom Agents

Define custom agents as Markdown files with YAML frontmatter:

```markdown
---
name: my-agent
description: "What this agent does. Triggers: relevant keywords."
tools: ["Bash", "Read", "Edit"]
---

# My Agent

Instructions for the agent (used as the system prompt).
```

### Loading Locations (Priority Order)

| Priority | Location |
|----------|----------|
| 1 | `~/.snowflake/cortex/agents/` (global) |
| 2 | `~/.claude/agents/` (global, compatibility) |
| 3 | `.cortex/agents/` (project-local) |
| 4 | `.claude/agents/` (project-local, compatibility) |

### Worktree Isolation

For parallel agent work without file conflicts:

```bash
cortex worktree create <name>           # Create worktree
cortex worktree list                    # List worktrees
cortex --worktree <name>               # Start session in worktree
```

### /agents Command

```
/agents
```

Opens a fullscreen tabbed interface showing available agent types, active sessions, and management options.
