---
name: package
description: "Set up the SigNoz MCP Server and Agent Skills to let AI assistants query observability data (traces, logs, metrics, alerts, dashboards) through natural language"
metadata:
  languages: "general"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "signoz,mcp,model-context-protocol,ai,agent,claude,cursor,observability,skills"
---

# SigNoz MCP Server & Agent Skills

## Golden Rule

The SigNoz MCP Server exposes observability tools to AI assistants (Claude, Cursor, GitHub Copilot, Codex) through the Model Context Protocol. Agent Skills are lightweight Claude Code plugins that give AI agents domain-specific SigNoz knowledge without running a separate server. Use the MCP server when you need live data queries; use Agent Skills when you want auto-activated documentation and ClickHouse query assistance.

The MCP server is under active development—expect breaking changes between releases.

## When To Use

- **MCP Server**: Let your AI assistant search traces, query logs, list alerts, inspect dashboards, or call the SigNoz query builder using natural language.
- **Agent Skills**: Automatically surface SigNoz instrumentation docs or generate correct ClickHouse queries inside Claude Code without manual prompting.

## MCP Server: Install

### Build from source (Go)

```bash
git clone https://github.com/SigNoz/signoz-mcp-server.git
cd signoz-mcp-server
go build -o bin/signoz-mcp-server ./cmd/server/
```

Requirements: Go 1.25+. The `go build` command has no extra dependencies; `make build` requires `goimports`.

### Docker

```bash
git clone https://github.com/SigNoz/signoz-mcp-server.git
cd signoz-mcp-server
cat > .env <<'EOF'
SIGNOZ_URL=<your-signoz-url>
SIGNOZ_API_KEY=<your-api-key>
LOG_LEVEL=info
EOF
docker-compose up -d
```

Default HTTP port: 8000. Override with `MCP_SERVER_PORT=<port>`.

## MCP Server: API Key Setup

1. Log into your SigNoz instance
2. Navigate to **Settings → API Keys**
3. Click **Create API Key** and copy the value

Only users with the **Admin** role can create API keys. Never commit the key to version control—use environment variables or a secrets manager.

## MCP Server: Client Configuration

### Claude Code (recommended: stdio)

```bash
# Global scope
claude mcp add --scope user signoz "<path-to-binary>/signoz-mcp-server" \
  -e SIGNOZ_URL="<your-signoz-url>" \
  -e SIGNOZ_API_KEY="<your-api-key>" \
  -e LOG_LEVEL=info

# Project scope (run from project root)
claude mcp add --scope project signoz "<path-to-binary>/signoz-mcp-server" \
  -e SIGNOZ_URL="<your-signoz-url>" \
  -e SIGNOZ_API_KEY="<your-api-key>" \
  -e LOG_LEVEL=info

# HTTP mode
claude mcp add --scope user --transport http signoz http://localhost:8000/mcp

# Manage
claude mcp list
claude mcp remove signoz
```

### Claude Desktop (~/.config/claude/claude_desktop_config.json)

```json
{
  "mcpServers": {
    "signoz": {
      "command": "<path-to-binary>/signoz-mcp-server",
      "args": [],
      "env": {
        "SIGNOZ_URL": "<your-signoz-url>",
        "SIGNOZ_API_KEY": "<your-api-key>",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

HTTP alternative: replace the object body with `{"url": "http://localhost:8000/mcp"}`.

### Cursor (.cursor/mcp.json)

Same JSON shape as Claude Desktop under `"mcpServers"`.

### GitHub Copilot (.vscode/mcp.json)

```json
{
  "servers": {
    "signoz": {
      "type": "stdio",
      "command": "<path-to-binary>/signoz-mcp-server",
      "args": [],
      "env": {
        "SIGNOZ_URL": "<your-signoz-url>",
        "SIGNOZ_API_KEY": "<your-api-key>",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## MCP Server: Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SIGNOZ_URL` | SigNoz instance URL | Required |
| `SIGNOZ_API_KEY` | Authentication key | Required (stdio mode) |
| `TRANSPORT_MODE` | `stdio` or `http` | `stdio` |
| `MCP_SERVER_PORT` | HTTP server port | `8000` |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` | `info` |

HTTP server: `SIGNOZ_URL=<url> SIGNOZ_API_KEY=<key> TRANSPORT_MODE=http ./signoz-mcp-server`

## MCP Server: Available Tools

**Metrics**: List/search metric keys, get field values and available fields

**Alerts**: List alerts, get details, history, and related logs

**Logs**: Search error logs, search by service, aggregate logs, list/get saved views

**Dashboards**: List, get, create, and update dashboards

**Traces**: List services, top operations, search/aggregate traces, trace details, error analysis, span hierarchy

**Query**: General query builder for ad-hoc queries

Validate: ask your assistant *"List all alerts"* or *"Show me all available services"*.

## Agent Skills: Install

```bash
# Via skills.sh
npx skills add SigNoz/agent-skills
npx skills add SigNoz/agent-skills --skill signoz-docs
npx skills add SigNoz/agent-skills --skill signoz-clickhouse-query

# Via Claude Code
/plugin marketplace add SigNoz/agent-skills
/reload-plugins
```

### Available Skills

| Skill | Purpose |
|---|---|
| `signoz-docs` | Guides AI agents to fetch and explore SigNoz docs for setup, config, and feature questions |
| `signoz-clickhouse-query` | Helps AI agents write and debug ClickHouse queries for SigNoz dashboards, alerts, and analysis |

## Common Pitfalls

- **Binary path must be absolute**: relative paths in JSON config fail silently. Use the full path to the compiled binary.
- **Restart AI client after config changes**: MCP config is read at startup; edits are not picked up without a restart.
- **HTTP header auth format**: `Bearer <your-api-key>` (with the `Bearer` prefix). Missing it causes 401 errors.
- **Admin-only API keys**: only Admin-role users can create keys. If key creation is grayed out, check your role.
- **Active development**: breaking changes between releases are expected. Pin to a specific commit or tag in production.
- **`LOG_LEVEL=debug`**: use this when tools are not appearing or returning unexpected errors to get detailed diagnostics.

## Official Sources

- SigNoz MCP Server docs: https://signoz.io/docs/ai/signoz-mcp-server/
- SigNoz Agent Skills docs: https://signoz.io/docs/ai/agent-skills/
- MCP Server GitHub: https://github.com/SigNoz/signoz-mcp-server
- Agent Skills GitHub: https://github.com/SigNoz/agent-skills
