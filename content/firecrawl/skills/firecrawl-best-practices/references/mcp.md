# Firecrawl MCP Server

Firecrawl ships an official [Model Context Protocol](https://modelcontextprotocol.io)
server, so an MCP-capable coding agent (Claude Code, Cursor, Windsurf, VS Code,
Claude Desktop, n8n, …) can scrape, search, crawl, and extract without any SDK
code. It is open source ([firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server),
MIT) and runs either as a remote hosted URL or locally.

## Two ways to connect

### 1. Remote hosted URL (no install)

```
# With an API key — unlocks every tool plus higher limits
https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp

# Keyless — scrape, search, and interact only, rate-limited per IP
https://mcp.firecrawl.dev/v2/mcp
```

The keyless endpoint is the fastest way to try it: `firecrawl_scrape`,
`firecrawl_search`, and `firecrawl_interact` work with no key (free, rate-limited
per IP). Set an API key to unlock `crawl`, `extract`, `map`, and the rest.

### 2. Local (stdio via npx)

```bash
env FIRECRAWL_API_KEY=fc-YOUR_API_KEY npx -y firecrawl-mcp
# or install globally
npm install -g firecrawl-mcp
```

Run it over streamable HTTP instead of stdio (e.g. for n8n):

```bash
env HTTP_STREAMABLE_SERVER=true FIRECRAWL_API_KEY=fc-YOUR_API_KEY npx -y firecrawl-mcp
# serves http://localhost:3000/v2/mcp
```

## Client setup

**Claude Code:**
```bash
# Remote hosted (recommended)
claude mcp add --transport http firecrawl https://mcp.firecrawl.dev/your-api-key/v2/mcp

# Or local via npx
claude mcp add firecrawl -e FIRECRAWL_API_KEY=your-api-key -- npx -y firecrawl-mcp
```

**Cursor / Windsurf / VS Code / Claude Desktop** — add a standard `mcpServers`
entry:
```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "fc-YOUR_API_KEY" }
    }
  }
}
```

Claude Desktop also accepts the remote URL directly with a bearer header:
```json
{
  "mcpServers": {
    "firecrawl": {
      "url": "https://mcp.firecrawl.dev/v2/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

## Tools exposed

| Tool | Purpose |
|------|---------|
| `firecrawl_scrape` | Scrape one URL → markdown/HTML/JSON/screenshot |
| `firecrawl_search` | Web search, optionally scraping each result |
| `firecrawl_map` | Discover all indexed URLs on a site |
| `firecrawl_crawl` / `firecrawl_check_crawl_status` | Async crawl + status polling |
| `firecrawl_extract` | LLM structured extraction from one or many URLs |
| `firecrawl_agent` / `firecrawl_agent_status` | Autonomous research agent (async) |
| `firecrawl_interact` / `firecrawl_interact_stop` | Drive a live page (click, fill, navigate) after a scrape |
| `firecrawl_browser_create` / `_execute` / `_delete` / `_list` | Persistent CDP browser sessions for code execution |

## Configuration

- `FIRECRAWL_API_KEY` — required for the cloud API (optional with a self-hosted instance).
- `FIRECRAWL_API_URL` — point at a self-hosted instance, e.g. `https://firecrawl.your-domain.com`.
- Retry tuning: `FIRECRAWL_RETRY_MAX_ATTEMPTS` (default 3), `FIRECRAWL_RETRY_INITIAL_DELAY` (1000 ms), `FIRECRAWL_RETRY_MAX_DELAY` (10000 ms), `FIRECRAWL_RETRY_BACKOFF_FACTOR` (2).
- Credit alerts: `FIRECRAWL_CREDIT_WARNING_THRESHOLD` (1000), `FIRECRAWL_CREDIT_CRITICAL_THRESHOLD` (100).

The server handles rate limiting with exponential backoff and retries transient
errors automatically.

## When to prefer MCP over the SDK

- Your agent host speaks MCP and you want web data with **zero integration code**.
- You want to start instantly on the **keyless** tier (scrape/search/interact).
- You need the **interact** / **browser session** tools (live click/fill/navigate),
  which go beyond the plain SDK scrape surface.

Reach for the [SDK](sdk.md) instead when you need tight programmatic control,
custom retry/concurrency, or to embed Firecrawl inside a larger service.
