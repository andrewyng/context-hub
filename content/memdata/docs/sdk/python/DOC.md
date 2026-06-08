---
name: sdk
description: "MemData persistent memory SDK for AI agents — ingest, query, relationships, sessions, and identity via MCP or HTTP API"
metadata:
  languages: "python"
  versions: "1.7.1"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "memory,knowledge-graph,ai-agents,structured-data,relationships,temporal-queries,memdata"
---

# MemData SDK — Persistent Memory for AI Agents

MemData provides long-term semantic memory for AI agents. Store documents, notes, and context as searchable vector embeddings. Query by meaning, filter by time, explore entity relationships, and maintain identity across sessions.

**Two integration paths:**
- **MCP Server** (`memdata-mcp` npm package) — plug directly into Claude, Cursor, or any MCP-compatible client
- **HTTP API** (`memdata.ai`) — call from any language via REST

**Two auth modes:**
- **API Key** — subscription-based (`md_` prefixed keys)
- **Wallet** — pay-per-use with USDC on Base via x402 protocol

## Installation

### MCP Server (recommended for AI agents)

```bash
npm install -g memdata-mcp
# or run directly
npx memdata-mcp
```

Configure in your MCP client (Claude Desktop, Claude Code, etc.):

```json
{
  "mcpServers": {
    "memdata": {
      "command": "npx",
      "args": ["memdata-mcp"],
      "env": {
        "MEMDATA_API_KEY": "md_your_key_here"
      }
    }
  }
}
```

For wallet-based auth (autonomous agents):

```json
{
  "mcpServers": {
    "memdata": {
      "command": "npx",
      "args": ["memdata-mcp"],
      "env": {
        "X402_WALLET_KEY": "0x_your_private_key"
      }
    }
  }
}
```

### HTTP API (Python)

```bash
pip install requests
```

```python
import requests

BASE_URL = "https://memdata.ai"
API_KEY = "md_your_key_here"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
```

Get an API key at: https://memdata.ai/dashboard/api-keys

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MEMDATA_API_KEY` | One of these | API key for subscriber auth (starts with `md_`) |
| `X402_WALLET_KEY` | required | Wallet private key for pay-per-use auth |
| `MEMDATA_API_URL` | No | API base URL (default: `https://memdata.ai`) |

## MCP Tools Reference

MemData exposes 9 MCP tools. Below is each tool with its exact parameters.

### memdata_session_start

Call this first at the start of every session. Returns your identity, what you were working on, last session handoff, recent activity, and memory stats.

**Parameters:** None

```python
# HTTP equivalent
response = requests.get(
    f"{BASE_URL}/api/memdata/identity",
    headers=HEADERS
)
result = response.json()
# Returns:
# {
#   "success": true,
#   "identity": {
#     "agent_name": "ResearchBot",
#     "identity_summary": "Research assistant for market analysis",
#     "session_count": 12
#   },
#   "working_on": "Analyzing Q1 competitor pricing",
#   "last_session": {"summary": "...", "ended_at": "..."},
#   "memory_stats": {
#     "total_memories": 47,
#     "oldest_memory": "2026-01-15",
#     "newest_memory": "2026-03-17"
#   },
#   "recent_activity": [
#     {"source": "competitor-analysis-q1", "date": "2026-03-15"}
#   ]
# }
```

### memdata_ingest

Store text content in long-term memory. Content is chunked, embedded, and indexed for semantic search. AI tagging and narrative extraction run asynchronously after ingestion (~2 min).

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `content` | string | Yes | Text content to store in memory |
| `name` | string | Yes | Source identifier (e.g. `"meeting-notes-2026-03-17"`, `"project-decision"`) |

```python
# HTTP API
response = requests.post(
    f"{BASE_URL}/api/memdata/ingest",
    headers=HEADERS,
    json={
        "content": "We decided to use PostgreSQL for the main database. Key reasons: pgvector support, ACID compliance, and team familiarity.",
        "sourceName": "architecture-decision-db"
    }
)
result = response.json()
# {
#   "success": true,
#   "artifact_id": "a1b2c3d4-...",
#   "chunk_count": 1
# }
```

### memdata_query

Search memory using natural language. Returns semantically similar content ranked by similarity score.

**Parameters:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `query` | string | Yes | — | Natural language search query |
| `limit` | number | No | 5 | Max results to return (max: 20) |

```python
# HTTP API
response = requests.post(
    f"{BASE_URL}/api/memdata/query",
    headers=HEADERS,
    json={
        "query": "What database did we choose?",
        "limit": 5
    }
)
result = response.json()
# {
#   "success": true,
#   "results": [
#     {
#       "chunk_text": "We decided to use PostgreSQL...",
#       "source_name": "architecture-decision-db",
#       "similarity_score": 0.847
#     }
#   ],
#   "narrative": {
#     "decisions": [
#       {
#         "type": "decision",
#         "content": "PostgreSQL selected as main database",
#         "confidence": 0.95,
#         "evidence": "...",
#         "chunk_id": "..."
#       }
#     ],
#     "patterns": [],
#     "causality": [],
#     "implications": [],
#     "gaps": []
#   },
#   "narrative_count": 1
# }
```

**Score interpretation:**
- 0.70+ — Strong match
- 0.50–0.69 — Good match
- 0.35–0.49 — Partial match
- Below 0.35 — Weak match

### memdata_query_timerange

Search memory within a specific date range. Useful for queries like "what did I work on last week" or "meetings from January".

**Parameters:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `query` | string | Yes | — | Natural language search query |
| `since` | string | No | — | ISO date — only results after this date (e.g. `"2026-01-01"`) |
| `until` | string | No | — | ISO date — only results before this date (e.g. `"2026-01-31"`) |
| `limit` | number | No | 5 | Max results (max: 20) |

```python
# HTTP API
response = requests.post(
    f"{BASE_URL}/api/memdata/query",
    headers=HEADERS,
    json={
        "query": "project updates",
        "since": "2026-03-01",
        "until": "2026-03-17",
        "limit": 10
    }
)
# Response includes "created_at" field per result for time context
```

### memdata_list

List all stored memories/artifacts with chunk counts and dates. Use this to see what is in memory or to find artifact IDs for deletion.

**Parameters:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `limit` | number | No | 20 | Max artifacts to return (max: 50) |

```python
# HTTP API
response = requests.get(
    f"{BASE_URL}/api/memdata/artifacts?limit=20",
    headers=HEADERS
)
result = response.json()
# {
#   "success": true,
#   "artifacts": [
#     {
#       "id": "a1b2c3d4-...",
#       "source_name": "architecture-decision-db",
#       "type": "text",
#       "chunk_count": 3,
#       "created_at": "2026-03-17T10:30:00Z"
#     }
#   ]
# }
```

### memdata_delete

Permanently delete a memory/artifact and all associated chunks.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `artifact_id` | string | Yes | UUID of the artifact (get from `memdata_list`) |

```python
# HTTP API
response = requests.delete(
    f"{BASE_URL}/api/memdata/artifacts/{artifact_id}",
    headers=HEADERS
)
# {"success": true, "deleted_chunks": 3}
```

### memdata_relationships

Find entities related to a person, company, or concept. Returns entities that co-occur in the same context with co-occurrence strength.

**Parameters:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `entity` | string | Yes | — | Entity name (e.g. `"John Smith"`, `"Acme Corp"`) |
| `type` | string | No | — | Filter by entity type: `person`, `company`, `project`, `topic`, `concept` |
| `limit` | number | No | 10 | Max relationships to return |

```python
# HTTP API
response = requests.post(
    f"{BASE_URL}/api/memdata/relationships",
    headers=HEADERS,
    json={
        "entity": "PostgreSQL",
        "type": "concept",
        "limit": 10
    }
)
# {
#   "success": true,
#   "entity": "PostgreSQL",
#   "entity_type": "concept",
#   "results": [
#     {"name": "pgvector", "type": "concept", "co_occurrence_count": 5},
#     {"name": "Neon", "type": "company", "co_occurrence_count": 3}
#   ]
# }
```

### memdata_set_identity

Set or update your agent identity. Establishes who you are for session continuity.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `agent_name` | string | No | Agent name (e.g. `"ResearchBot"`) |
| `identity_summary` | string | No | Brief description of purpose |

```python
# HTTP API
response = requests.post(
    f"{BASE_URL}/api/memdata/identity",
    headers=HEADERS,
    json={
        "agent_name": "ResearchBot",
        "identity_summary": "Market research assistant for competitor analysis"
    }
)
```

### memdata_session_end

Save a session handoff before ending. Preserves what you were working on for the next session.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `summary` | string | Yes | Brief summary of this session |
| `working_on` | string | No | Current task (shown at next session start) |
| `context` | object | No | Additional context to preserve (JSON) |

```python
# HTTP API
response = requests.post(
    f"{BASE_URL}/api/memdata/identity",
    headers=HEADERS,
    json={
        "working_on": "Finalizing Q1 competitor report",
        "session_handoff": {
            "summary": "Analyzed 3 competitors, drafted pricing comparison",
            "context": {"competitors": ["Acme", "Globex", "Initech"]},
            "ended_at": "2026-03-17T18:00:00Z"
        }
    }
)
```

### memdata_status

Check API health and storage usage.

**Parameters:** None

```python
# HTTP API
response = requests.get(
    f"{BASE_URL}/api/memdata/health",
    headers=HEADERS
)
# {"status": "ok"}

response = requests.get(
    f"{BASE_URL}/api/memdata/usage",
    headers=HEADERS
)
# {"success": true, "usage": {"storage_used_mb": 12.5, "storage_limit_mb": 100}}
```

## API Endpoints Summary

### Subscriber endpoints (`/api/memdata/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/memdata/ingest` | Ingest content |
| POST | `/api/memdata/query` | Semantic query |
| GET | `/api/memdata/artifacts` | List artifacts |
| DELETE | `/api/memdata/artifacts/{id}` | Delete artifact |
| GET | `/api/memdata/identity` | Get identity + session info |
| POST | `/api/memdata/identity` | Update identity / end session |
| POST | `/api/memdata/relationships` | Query relationships |
| GET | `/api/memdata/health` | Health check |
| GET | `/api/memdata/usage` | Storage usage |

### Wallet/agent endpoints (`/api/x402/`)

Same operations available at `/api/x402/ingest`, `/api/x402/query`, etc. No auth header needed — payment is handled automatically via x402 protocol.

**x402 pricing (USDC on Base):**
- Query: $0.001
- Ingest: $0.005
- Identity: $0.001
- Artifacts: $0.001

## Common Patterns

### Session lifecycle

```python
# 1. Start session — get context from previous sessions
session = call_tool("memdata_session_start")

# 2. Set identity (first time only)
call_tool("memdata_set_identity",
    agent_name="DataBot",
    identity_summary="Data analysis assistant"
)

# 3. Do work — ingest and query as needed
call_tool("memdata_ingest",
    content="Meeting notes: decided to switch to weekly sprints...",
    name="standup-2026-03-17"
)

results = call_tool("memdata_query", query="sprint decisions")

# 4. End session — preserve context
call_tool("memdata_session_end",
    summary="Ingested standup notes, analyzed sprint velocity",
    working_on="Sprint velocity trend report"
)
```

### Naming conventions for ingested content

Use descriptive, dated source names:
- `"meeting-notes-2026-03-17"` — timestamped events
- `"architecture-decision-database"` — decisions
- `"user-feedback-onboarding-flow"` — categorized feedback
- `"research-competitor-pricing"` — research artifacts

### Building context from multiple queries

```python
# Combine semantic search with relationship exploration
decisions = call_tool("memdata_query", query="database decisions")
related = call_tool("memdata_relationships", entity="PostgreSQL")
recent = call_tool("memdata_query_timerange",
    query="infrastructure changes",
    since="2026-03-01"
)
```

## Error Handling

All responses include a `success` boolean. On failure:

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

Common errors:
- `401` — Invalid or missing API key
- `403` — API key lacks required scope (e.g. `write` scope needed for ingest)
- `404` — Artifact not found
- `429` — Rate limit exceeded
- `500` — Server error

## Links

- **Dashboard & API Keys:** https://memdata.ai/dashboard/api-keys
- **MCP Registry:** `io.github.thelabvenice/memdata`
- **npm:** https://www.npmjs.com/package/memdata-mcp
- **GitHub:** https://github.com/thelabvenice/memdata-mcp
