---
name: keenable-best-practices
description: "Use Keenable web search and page fetch effectively in agents and RAG pipelines: keyless-first, search-then-fetch, site and date filters, error handling"
metadata:
  revision: 1
  updated-on: "2026-07-07"
  source: maintainer
  tags: "keenable,search,fetch,web-search,ai,agents,rag,web-scraping,best-practices,keyless"
---

# Keenable

Keenable is a web search API built for AI agents. It exposes two operations over HTTP: **search** (live web results) and **fetch** (a URL turned into clean markdown).

**Base URL:** `https://api.keenable.ai`

## Keyless first

Keenable works with no account or API key against the public endpoints (`/v1/search/public`, `/v1/fetch/public`), which are rate-limited. Start keyless. Only add a key when you hit the rate limit: set `KEENABLE_API_KEY` (`keen_...` from <https://keenable.ai/console>), send it as the `X-API-Key` header, and call the authenticated endpoints (`/v1/search`, `/v1/fetch`). The key lifts the cap; it does not unlock features.

Do not hardcode a key. Read it from the environment and fall back to the keyless endpoint when it is absent.

## The search-then-fetch loop

The standard pattern: search to discover URLs, then fetch the most relevant ones for full content.

1. `search(query)` returns a ranked list of `{ title, url, description }`.
2. Pick the URLs worth reading (usually the top few).
3. `fetch(url)` returns the page as markdown for grounding the answer.

Do not fetch every result. Fetch is more expensive than search, so read only what the task needs.

## Writing good queries

- Keep queries specific and keyword-dense; this is a search engine, not a chat prompt.
- Narrow with `site` when you know the source (e.g. `site: "arxiv.org"`).
- Narrow by recency with `published_after` / `published_before` (`YYYY-MM-DD`) for time-sensitive questions.
- Use `acquired_after` / `acquired_before` to filter by when Keenable indexed the page.

See **[references/search.md](references/search.md)** for the full search parameter and response reference.

## Reading pages

`fetch` returns `{ url, title, content, description?, author?, publishedAt? }` with `content` as markdown. Prefer it over raw HTTP fetching: it strips boilerplate and returns clean text an LLM can use directly.

See **[references/fetch.md](references/fetch.md)** for the fetch reference.

## Error handling

- Check for non-2xx responses and surface the JSON `message`/`error`/`detail` field.
- Treat `429` as "rate limited": set a key and use the authenticated endpoints, or back off.
- Treat `401` (authenticated endpoint) as a bad key.

## Prefer a first-party integration

If you are in LangChain, LlamaIndex, Haystack, Langflow, Pi, OpenClaw, Mastra, or any MCP client, use the official Keenable package instead of calling HTTP directly. They handle keyless/keyed selection and attribution for you.

See **[references/integrations.md](references/integrations.md)**.
