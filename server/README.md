# Context Hub Server

Self-hosted HTTP API server + MCP SSE bridge + web management console for [Context Hub](https://github.com/nicepkg/context-hub).

This package is a **zero-intrusion extension** — it imports upstream `cli/` code through an adapter layer and never modifies any upstream file.

## Quick Start

```bash
# From the repository root

# 1. Install all dependencies
npm install
npm install --prefix server/web

# 2. Build content into registry
node cli/bin/chub build content -o cli/dist

# 3. Build the web console
npm run build --prefix server/web

# 4. Start the server
node server/src/index.js --port 3000
```

Open http://localhost:3000 to access the web console.

## Architecture

```
server/
├── src/
│   ├── index.js          # Express entry point
│   ├── adapter.js        # Isolation layer — all upstream imports go here
│   ├── rest/
│   │   ├── router.js     # API route definitions
│   │   └── handlers.js   # Request handlers
│   ├── mcp/
│   │   └── sse-server.js # MCP over SSE transport
│   └── web/              # Built React console (gitignored)
└── web/                  # React console source
```

## API Endpoints

### REST API (`/api/v1`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/search?q=&tags=&lang=&limit=` | Search docs and skills |
| GET | `/api/v1/entries?tags=&lang=&limit=` | List all entries |
| GET | `/api/v1/entries/:author/:name` | Get entry metadata |
| GET | `/api/v1/entries/:author/:name/content?lang=&version=&file=&full=` | Get document content |
| GET | `/api/v1/registry` | Full registry JSON |
| GET | `/api/v1/tree` | Content directory tree |
| GET | `/api/v1/stats` | Source and entry statistics |
| POST | `/api/v1/build` | Trigger content rebuild |

### MCP over SSE

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sse` | Establish SSE stream for MCP |
| POST | `/messages?sessionId=` | Send JSON-RPC message |

MCP tools exposed: `chub_search`, `chub_get`, `chub_list`, `chub_annotate`, `chub_feedback`.

### Other

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/` | Web management console |

## Development

```bash
# Terminal 1: Start API server
node server/src/index.js --port 3001

# Terminal 2: Start Vite dev server with proxy
npm run dev --prefix server/web
```

The Vite dev server on port 5173 proxies `/api`, `/sse`, `/messages` to port 3001.

## Upstream Sync

This package is designed to stay in sync with the upstream project:

```bash
git fetch upstream && git merge upstream/main
# Resolve package.json workspaces conflict (one line) if any
npm install
node cli/bin/chub build content -o cli/dist
```

Only the root `package.json` workspaces field is modified from upstream.
All extension code lives in `server/` which upstream does not touch.

## How Isolation Works

The `server/src/adapter.js` file is the single point of contact with upstream code.
It re-exports functions from `cli/src/lib/` and `cli/src/mcp/tools.js`.
If upstream changes a function signature, only `adapter.js` needs updating.
