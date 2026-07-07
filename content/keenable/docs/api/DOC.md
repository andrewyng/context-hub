---
name: api
description: "Keenable web search API for AI agents: keyless-by-default search and clean-markdown page fetch over HTTP"
metadata:
  languages: "http,python,javascript"
  versions: "v1"
  revision: 1
  updated-on: "2026-07-07"
  source: maintainer
  tags: "keenable,search,fetch,web-search,ai,agents,rag,http,api,keyless"
---
# Keenable API

Keenable is a web search API built for AI agents. Two endpoints: **search** (live web search with site and date filters) and **fetch** (turn a URL into clean markdown).

**Base URL:** `https://api.keenable.ai`

**Keyless by default.** Every endpoint has a public variant that works with no account or API key (rate-limited). An optional `KEENABLE_API_KEY` (`keen_...`, from <https://keenable.ai/console>) switches to the authenticated endpoint and lifts the hourly cap. A key is never required to start.

| Operation | Keyless (no key) | Authenticated (with key) |
|---|---|---|
| Search | `POST /v1/search/public` | `POST /v1/search` |
| Fetch  | `GET /v1/fetch/public`   | `GET /v1/fetch` |

Auth: send the key in the `X-API-Key` header on the authenticated endpoints. No header for the public ones.

## Search

`POST /v1/search/public` (keyless) or `POST /v1/search` (keyed).

Request body (JSON):

| Field | Type | Notes |
|---|---|---|
| `query` | string (required) | The search query. |
| `mode` | string | Search mode, defaults to `"pro"`. |
| `site` | string | Restrict to a single domain, e.g. `"techcrunch.com"`. |
| `published_after` / `published_before` | string | Filter by publication date, `YYYY-MM-DD`. |
| `acquired_after` / `acquired_before` | string | Filter by index date, `YYYY-MM-DD`. |

Response: `{ "results": [ { "title", "url", "description", "published_at", "acquired_at" } ] }`.

```bash
curl -s https://api.keenable.ai/v1/search/public \
  -H 'Content-Type: application/json' \
  -d '{"query": "typescript best practices", "mode": "pro"}'
```

```javascript
const res = await fetch("https://api.keenable.ai/v1/search/public", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "typescript best practices", mode: "pro" }),
});
const { results } = await res.json();

// With a key, to lift the rate limit:
await fetch("https://api.keenable.ai/v1/search", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-API-Key": process.env.KEENABLE_API_KEY },
  body: JSON.stringify({ query: "latest AI agents", site: "arxiv.org" }),
});
```

```python
import os, requests

# Keyless
r = requests.post("https://api.keenable.ai/v1/search/public",
                  json={"query": "typescript best practices", "mode": "pro"})
results = r.json()["results"]

# Keyed
r = requests.post("https://api.keenable.ai/v1/search",
                  headers={"X-API-Key": os.environ["KEENABLE_API_KEY"]},
                  json={"query": "latest AI agents", "published_after": "2026-01-01"})
```

## Fetch

`GET /v1/fetch/public?url=...` (keyless) or `GET /v1/fetch?url=...` (keyed). Returns the main page content as markdown.

Response: `{ "url", "title", "content", "description", "author", "published_at" }` (extra fields appear when the page exposes them).

```bash
curl -s "https://api.keenable.ai/v1/fetch/public?url=https://example.com/article"
```

```python
import requests
page = requests.get("https://api.keenable.ai/v1/fetch/public",
                    params={"url": "https://example.com/article"}).json()
print(page["title"], page["content"][:200])
```

The typical agent loop is search then fetch: discover URLs with search, then read the full page content of the most relevant ones with fetch.

## Errors and rate limits

- Non-2xx responses carry a JSON body with a `message` (or `error` / `detail`) field; surface it to the caller.
- `429` means the keyless rate limit was hit. Set `KEENABLE_API_KEY` and use the authenticated endpoints to lift the cap.
- `401` on an authenticated endpoint means the key was rejected.

## Official integrations

Keenable ships first-party packages so you rarely call the HTTP API by hand. See **[../../skills/keenable-best-practices/references/integrations.md](../../skills/keenable-best-practices/references/integrations.md)** for LangChain, LlamaIndex, Haystack, Langflow, Pi, OpenClaw, Mastra, and the hosted MCP server.
