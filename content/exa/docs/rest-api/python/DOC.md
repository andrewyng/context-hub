---
name: rest-api
description: "Exa - Neural Search API for AI Agents"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "exa,search,neural-search,semantic-search,ai-agents,web-search,rag,api"
---

# Exa Neural Search API

> **Golden Rule:** Exa is a neural search engine built for AI agents. All endpoints use POST requests to `https://api.exa.ai` with JSON bodies and authenticate via the `x-api-key` header. There are four core endpoints: `/search` for web queries, `/contents` for extracting page content from URLs, `/findSimilar` for discovering related pages, and `/answer` for getting grounded LLM answers with citations. Content retrieval (text, highlights, summaries) can be requested inline with search via the `contents` parameter, or separately via the `/contents` endpoint. Search supports multiple speed/quality modes: `instant` (~200ms), `fast` (~450ms), `auto` (~1s default), and `deep` (5-60s with structured output support).

## Installation

```bash
pip install httpx
```

## Base URL

```
https://api.exa.ai
```

## Authentication

All requests require an API key passed in the `x-api-key` header. Obtain your key from the [Exa Dashboard](https://dashboard.exa.ai/api-keys).

```python
import httpx

EXA_API_KEY = "your-api-key"
HEADERS = {
    "x-api-key": EXA_API_KEY,
    "Content-Type": "application/json",
}

async def exa_request(endpoint: str, payload: dict) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.exa.ai{endpoint}",
            headers=HEADERS,
            json=payload,
            timeout=60.0,
        )
        response.raise_for_status()
        return response.json()
```

## Rate Limiting

- **Free / MCP tier:** 3 requests per second, 150 requests per day.
- **Paid tiers:** Higher limits; contact hello@exa.ai for production rate limit details.
- Responses include a `costDollars` object with billing breakdown.

## Methods

### POST /search

Perform a web search and optionally retrieve page contents inline.

**Endpoint:** `POST https://api.exa.ai/search`

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | -- | The search query |
| `type` | string | No | `"auto"` | Search mode: `"instant"`, `"fast"`, `"auto"`, `"neural"`, `"deep"`, `"deep-reasoning"` |
| `numResults` | integer | No | `10` | Number of results (max 100, varies by type) |
| `category` | string | No | -- | Filter: `"company"`, `"people"`, `"research paper"`, `"news"`, `"tweet"`, `"personal site"`, `"financial report"` |
| `userLocation` | string | No | -- | ISO 3166-1 alpha-2 country code for geographic biasing |
| `includeDomains` | string[] | No | -- | Restrict results to these domains (max 1200). Supports paths, e.g. `"stripe.com/blog"` |
| `excludeDomains` | string[] | No | -- | Exclude these domains (max 1200). Supports wildcard `"*.domain.com"` |
| `startPublishedDate` | string | No | -- | ISO 8601 minimum publication date |
| `endPublishedDate` | string | No | -- | ISO 8601 maximum publication date |
| `startCrawlDate` | string | No | -- | ISO 8601 minimum crawl/discovery date |
| `endCrawlDate` | string | No | -- | ISO 8601 maximum crawl/discovery date |
| `includeText` | string[] | No | -- | Strings that must appear in results (max 1 string, 5 words) |
| `excludeText` | string[] | No | -- | Strings to exclude (checked in first 1000 words) |
| `moderation` | boolean | No | `false` | Filter unsafe content |
| `contents` | object | No | -- | Inline content retrieval options (see Contents Parameters below) |
| `additionalQueries` | string[] | No | -- | Query variations (deep search only) |
| `systemPrompt` | string | No | -- | Custom instructions (deep search only) |
| `outputSchema` | object | No | -- | JSON Schema for structured output (deep search only) |

#### Contents Parameters (nested under `contents`)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | bool or object | -- | `true` for full text; or object with `maxCharacters`, `includeHtmlTags`, `verbosity` |
| `highlights` | bool or object | -- | `true` for highlights; or object with `maxCharacters`, `query`, `numSentences` |
| `summary` | object | -- | Object with optional `query` (string) and `schema` (JSON Schema) |
| `livecrawl` | string | -- | `"never"`, `"fallback"`, `"preferred"`, `"always"` (deprecated; use `maxAgeHours`) |
| `maxAgeHours` | integer | -- | Cache freshness: positive = use cache if fresher, `0` = always livecrawl, `-1` = cache only |
| `livecrawlTimeout` | integer | `10000` | Livecrawl timeout in milliseconds |
| `subpages` | integer | `0` | Number of subpages to crawl per result |
| `subpageTarget` | string or string[] | -- | Terms to identify specific subpages |
| `extras` | object | -- | `{"links": <int>, "imageLinks": <int>}` for additional data |

#### Example

```python
import httpx
import asyncio

async def search_exa():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.exa.ai/search",
            headers={
                "x-api-key": "your-api-key",
                "Content-Type": "application/json",
            },
            json={
                "query": "best practices for RAG pipelines",
                "type": "auto",
                "numResults": 5,
                "contents": {
                    "text": {"maxCharacters": 2000},
                    "highlights": {"maxCharacters": 500},
                },
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

        for result in data["results"]:
            print(f"{result['title']}: {result['url']}")
            if result.get("highlights"):
                for h in result["highlights"]:
                    print(f"  - {h[:100]}...")

        return data

asyncio.run(search_exa())
```

#### Response Shape

```json
{
  "requestId": "string",
  "searchType": "neural | deep | deep-reasoning",
  "results": [
    {
      "id": "string",
      "url": "string",
      "title": "string",
      "publishedDate": "ISO 8601 | null",
      "author": "string | null",
      "image": "URI | null",
      "favicon": "URI | null",
      "text": "string (if requested)",
      "highlights": ["string"],
      "highlightScores": [0.0],
      "summary": "string (if requested)"
    }
  ],
  "costDollars": { "total": 0.0 }
}
```

For `deep` / `deep-reasoning` types, the response also includes:

```json
{
  "output": {
    "content": "string or object",
    "grounding": [
      {
        "field": "string",
        "citations": [{"url": "string", "title": "string"}],
        "confidence": "low | medium | high"
      }
    ]
  }
}
```

---

### POST /contents

Retrieve clean page content, summaries, and metadata for a list of URLs.

**Endpoint:** `POST https://api.exa.ai/contents`

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `urls` | string[] | Yes* | -- | Array of URLs to crawl |
| `ids` | string[] | No | -- | Array of document IDs from prior search results (alternative to `urls`) |
| `text` | bool or object | No | -- | `true` for defaults; or object: `{maxCharacters, includeHtmlTags, verbosity, includeSections, excludeSections}` |
| `highlights` | bool or object | No | -- | `true` for defaults; or object: `{maxCharacters, query, numSentences}` |
| `summary` | object | No | -- | `{query, schema}` for LLM-generated summaries |
| `maxAgeHours` | integer | No | -- | Cache freshness control |
| `livecrawlTimeout` | integer | No | `10000` | Timeout in ms |
| `subpages` | integer | No | `0` | Number of subpages to crawl |
| `subpageTarget` | string or string[] | No | -- | Terms to find specific subpages |
| `extras` | object | No | -- | `{"links": <int>, "imageLinks": <int>}` |

*Either `urls` or `ids` must be provided.

#### Example

```python
import httpx
import asyncio

async def get_contents():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.exa.ai/contents",
            headers={
                "x-api-key": "your-api-key",
                "Content-Type": "application/json",
            },
            json={
                "urls": [
                    "https://example.com/article-1",
                    "https://example.com/article-2",
                ],
                "text": {"maxCharacters": 5000},
                "highlights": True,
                "summary": {"query": "What is the main argument?"},
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

        for result in data["results"]:
            print(f"{result['title']}: {result.get('summary', 'N/A')}")

        # Check per-URL status
        for status in data.get("statuses", []):
            if status["status"] == "error":
                print(f"Failed: {status['id']} - {status['error']['tag']}")

        return data

asyncio.run(get_contents())
```

#### Response Shape

```json
{
  "requestId": "string",
  "results": [
    {
      "id": "string",
      "url": "string",
      "title": "string",
      "publishedDate": "ISO 8601 | null",
      "author": "string | null",
      "text": "string",
      "highlights": ["string"],
      "highlightScores": [0.0],
      "summary": "string",
      "subpages": [],
      "extras": {"links": [], "imageLinks": []}
    }
  ],
  "statuses": [
    {
      "id": "string",
      "status": "success | error",
      "error": {"tag": "CRAWL_NOT_FOUND | CRAWL_TIMEOUT | ...", "httpStatusCode": 404}
    }
  ],
  "costDollars": { "total": 0.0 }
}
```

---

### POST /answer

Get an LLM-generated answer grounded in real-time web search results with citations.

**Endpoint:** `POST https://api.exa.ai/answer`

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | -- | The question to answer (min 1 character) |
| `stream` | boolean | No | `false` | Return response as server-sent events stream |
| `text` | boolean | No | `false` | Include full text content in citation results |
| `outputSchema` | object | No | -- | JSON Schema Draft 7 for structured answer output |

#### Example

```python
import httpx
import asyncio

async def ask_exa():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.exa.ai/answer",
            headers={
                "x-api-key": "your-api-key",
                "Content-Type": "application/json",
            },
            json={
                "query": "What are the latest advances in protein folding?",
                "text": True,
            },
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()

        print("Answer:", data["answer"])
        print("\nCitations:")
        for cite in data["citations"]:
            print(f"  - {cite['title']}: {cite['url']}")

        return data

asyncio.run(ask_exa())
```

#### Response Shape

```json
{
  "answer": "string (or object if outputSchema provided)",
  "citations": [
    {
      "id": "string",
      "url": "string",
      "title": "string",
      "author": "string | null",
      "publishedDate": "ISO 8601 | null",
      "text": "string (if text=true)",
      "image": "URI | null",
      "favicon": "URI | null"
    }
  ],
  "costDollars": { "total": 0.0 }
}
```

## Error Handling

Exa returns standard HTTP status codes. Common errors:

| Status | Meaning |
|--------|---------|
| `400` | Bad request -- invalid parameters or malformed JSON |
| `401` | Unauthorized -- missing or invalid API key |
| `403` | Forbidden -- insufficient permissions |
| `429` | Rate limited -- too many requests |
| `500` | Internal server error |

```python
import httpx
import asyncio

async def search_with_error_handling():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.exa.ai/search",
                headers={
                    "x-api-key": "your-api-key",
                    "Content-Type": "application/json",
                },
                json={"query": "example search"},
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            body = e.response.text
            if status == 401:
                print("Invalid API key. Check your x-api-key header.")
            elif status == 429:
                print("Rate limited. Back off and retry.")
            else:
                print(f"HTTP {status}: {body}")
            raise

        except httpx.TimeoutException:
            print("Request timed out. Use a longer timeout for deep searches.")
            raise

        except httpx.RequestError as e:
            print(f"Network error: {e}")
            raise

asyncio.run(search_with_error_handling())
```

## Common Pitfalls

- **Forgetting `Content-Type` header:** All POST requests require `"Content-Type": "application/json"`.
- **Using `type: "deep"` without sufficient timeout:** Deep searches can take 5-60 seconds. Set `timeout=60.0` or higher on your httpx client.
- **`outputSchema` only works with deep search:** The `outputSchema` parameter is ignored unless `type` is `"deep"` or `"deep-reasoning"`.
- **`category` limits filtering:** The `"company"` and `"people"` categories do not support date or text filters.
- **`includeText` is restrictive:** Max 1 string, max 5 words. It filters on exact presence, not semantic match.
- **`livecrawl` is deprecated:** Use `maxAgeHours` instead for cache freshness control. `0` forces a live crawl, `-1` forces cache-only.
- **Contents endpoint requires `urls` or `ids`:** You must provide at least one. Use `ids` from a prior `/search` response or `urls` directly.
- **Highlights vs. text for token efficiency:** Use `highlights` with a `maxCharacters` limit (e.g., 4000) for RAG pipelines instead of full `text` to reduce token usage.
- **Free tier is heavily throttled:** 3 QPS and 150 calls/day. Plan for rate limiting in development.
- **Check `statuses` in `/contents` response:** Individual URLs can fail (CRAWL_NOT_FOUND, CRAWL_TIMEOUT) even when the request succeeds overall.
- **`findSimilar` endpoint path is camelCase:** The path is `/findSimilar`, not `/find_similar` or `/find-similar`.
- **Streaming for `/answer` returns SSE:** When `stream: true`, parse as `text/event-stream`, not JSON.
