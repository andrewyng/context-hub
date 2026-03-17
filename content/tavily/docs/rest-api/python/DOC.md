---
name: rest-api
description: "Tavily - Web Search API for AI Agents (REST)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "tavily,search,web-search,extract,crawl,research,ai-agents,rag,api"
---

# Tavily REST API Guide (Python / httpx)

## Golden Rule

Use this entry when you need direct HTTP access to the Tavily web search API without the official SDK. All examples use `httpx` with async. For the SDK approach, see `tavily/docs/sdk/`.

## Installation

```bash
pip install httpx
```

Or with `uv`:

```bash
uv add httpx
```

## Base URL

```
https://api.tavily.com
```

All endpoint paths below are relative to this base.

## Authentication

Every request requires a Bearer token in the `Authorization` header. Obtain your key from the Tavily dashboard at `app.tavily.com`. Keys are prefixed with `tvly-`.

```bash
export TAVILY_API_KEY="tvly-..."
```

```python
import os

TAVILY_API_KEY = os.environ["TAVILY_API_KEY"]
HEADERS = {
    "Authorization": f"Bearer {TAVILY_API_KEY}",
    "Content-Type": "application/json",
}
```

**Optional project tracking header:**

```python
HEADERS["X-Project-ID"] = "my-project"
```

This organizes usage by project for filtering and billing visibility.

## Rate Limiting

Rate limits depend on your environment (determined by your API key):

| Environment | Limit |
|-------------|-------|
| Development | 100 RPM |
| Production | 1,000 RPM |

**Endpoint-specific limits:**

| Endpoint | Limit |
|----------|-------|
| `/crawl` | 100 RPM (both dev and prod) |
| `/research` | 20 RPM (both dev and prod) |

When rate limits are exceeded, the API returns HTTP 429 with a `retry-after` header indicating the number of seconds to wait before retrying.

Production keys require an active paid plan or PAYGO enabled.

## Methods

### Search

**POST** `/search`

The core endpoint. Executes a web search and returns ranked results with content snippets. Optionally generates an LLM-powered answer.

```python
import httpx
import os

TAVILY_API_KEY = os.environ["TAVILY_API_KEY"]
BASE_URL = "https://api.tavily.com"
HEADERS = {
    "Authorization": f"Bearer {TAVILY_API_KEY}",
    "Content-Type": "application/json",
}


async def search(query: str, max_results: int = 5):
    payload = {
        "query": query,
        "search_depth": "basic",
        "max_results": max_results,
        "include_answer": True,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/search",
            headers=HEADERS,
            json=payload,
            timeout=30.0,
        )
        resp.raise_for_status()
        return resp.json()
```

**Request parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query (keep under 400 chars) |
| `search_depth` | string | `"basic"` | `"ultra-fast"`, `"fast"`, `"basic"`, or `"advanced"` |
| `max_results` | integer | 5 | Number of results (0-20) |
| `topic` | string | `"general"` | `"general"` or `"news"` |
| `chunks_per_source` | integer | 3 | Content chunks per source (1-3, advanced depth only) |
| `include_answer` | bool/string | false | `true`/`"basic"` for quick answer, `"advanced"` for detailed |
| `include_raw_content` | bool/string | false | `true`/`"markdown"` for markdown, `"text"` for plain text |
| `include_images` | boolean | false | Include image results |
| `include_image_descriptions` | boolean | false | AI-generated image descriptions |
| `include_favicon` | boolean | false | Include favicon URL per result |
| `include_domains` | array | [] | Restrict to these domains (max 300) |
| `exclude_domains` | array | [] | Exclude these domains (max 150) |
| `time_range` | string | null | `"day"`, `"week"`, `"month"`, or `"year"` |
| `start_date` | string | null | Results after this date (YYYY-MM-DD) |
| `end_date` | string | null | Results before this date (YYYY-MM-DD) |
| `country` | string | null | Boost results from a specific country |
| `include_usage` | boolean | false | Include credit usage in response |

**Credit costs:** `"ultra-fast"`, `"fast"`, and `"basic"` cost 1 credit per search. `"advanced"` costs 2 credits.

**Response structure:**

```json
{
  "query": "latest AI frameworks 2026",
  "answer": "The most prominent AI frameworks in 2026 include...",
  "results": [
    {
      "title": "Top AI Frameworks",
      "url": "https://example.com/ai-frameworks",
      "content": "A comprehensive overview of...",
      "score": 0.92,
      "raw_content": null,
      "favicon": null
    }
  ],
  "images": [],
  "response_time": 1.45,
  "request_id": "abc-123-def"
}
```

### Search with Domain Filtering

```python
import httpx
import os

TAVILY_API_KEY = os.environ["TAVILY_API_KEY"]
BASE_URL = "https://api.tavily.com"
HEADERS = {
    "Authorization": f"Bearer {TAVILY_API_KEY}",
    "Content-Type": "application/json",
}


async def search_specific_domains(query: str):
    payload = {
        "query": query,
        "search_depth": "advanced",
        "max_results": 10,
        "include_answer": "advanced",
        "include_raw_content": "markdown",
        "include_domains": ["arxiv.org", "github.com"],
        "time_range": "month",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/search",
            headers=HEADERS,
            json=payload,
            timeout=30.0,
        )
        resp.raise_for_status()
        return resp.json()
```

### Extract

**POST** `/extract`

Extracts clean, readable content from one or more URLs. Useful for feeding full page content into LLMs.

```python
import httpx
import os

TAVILY_API_KEY = os.environ["TAVILY_API_KEY"]
BASE_URL = "https://api.tavily.com"
HEADERS = {
    "Authorization": f"Bearer {TAVILY_API_KEY}",
    "Content-Type": "application/json",
}


async def extract(urls: list[str]):
    payload = {
        "urls": urls,
        "extract_depth": "basic",
        "format": "markdown",
        "include_images": False,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/extract",
            headers=HEADERS,
            json=payload,
            timeout=60.0,
        )
        resp.raise_for_status()
        return resp.json()
```

**Request parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `urls` | string/array | required | Single URL or list of URLs (max 20) |
| `query` | string | null | User intent for reranking extracted chunks |
| `chunks_per_source` | integer | 3 | Relevant chunks per source (1-5, only with query) |
| `extract_depth` | string | `"basic"` | `"basic"` or `"advanced"` |
| `format` | string | `"markdown"` | `"markdown"` or `"text"` |
| `include_images` | boolean | false | Include extracted images |
| `include_favicon` | boolean | false | Include favicon URL |
| `timeout` | number | varies | Request timeout in seconds (1.0-60.0) |
| `include_usage` | boolean | false | Include credit usage in response |

**Response structure:**

```json
{
  "results": [
    {
      "url": "https://example.com/article",
      "raw_content": "# Article Title\n\nFull extracted content...",
      "images": [],
      "favicon": null
    }
  ],
  "failed_results": [
    {
      "url": "https://example.com/broken",
      "error": "Failed to extract content"
    }
  ],
  "response_time": 2.3,
  "request_id": "abc-123-def"
}
```

### Extract with Relevance Reranking

```python
import httpx
import os

TAVILY_API_KEY = os.environ["TAVILY_API_KEY"]
BASE_URL = "https://api.tavily.com"
HEADERS = {
    "Authorization": f"Bearer {TAVILY_API_KEY}",
    "Content-Type": "application/json",
}


async def extract_with_query(urls: list[str], query: str):
    payload = {
        "urls": urls,
        "query": query,
        "chunks_per_source": 5,
        "extract_depth": "advanced",
        "format": "markdown",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/extract",
            headers=HEADERS,
            json=payload,
            timeout=60.0,
        )
        resp.raise_for_status()
        return resp.json()
```

### Crawl

**POST** `/crawl`

Crawls a website starting from a root URL, following links up to a configurable depth and breadth. Returns extracted content from all discovered pages.

```python
import httpx
import os

TAVILY_API_KEY = os.environ["TAVILY_API_KEY"]
BASE_URL = "https://api.tavily.com"
HEADERS = {
    "Authorization": f"Bearer {TAVILY_API_KEY}",
    "Content-Type": "application/json",
}


async def crawl(url: str, max_depth: int = 2, limit: int = 20):
    payload = {
        "url": url,
        "max_depth": max_depth,
        "max_breadth": 20,
        "limit": limit,
        "format": "markdown",
        "extract_depth": "basic",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/crawl",
            headers=HEADERS,
            json=payload,
            timeout=180.0,
        )
        resp.raise_for_status()
        return resp.json()
```

**Request parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | Root URL to begin crawling |
| `instructions` | string | null | Natural language guidance for crawl (costs 2 credits/10 pages) |
| `max_depth` | integer | 1 | Levels from base URL (1-5) |
| `max_breadth` | integer | 20 | Links per page to follow (1-500) |
| `limit` | integer | 50 | Total links to process |
| `select_paths` | array | null | Regex patterns for URL inclusion |
| `select_domains` | array | null | Regex patterns for domain inclusion |
| `exclude_paths` | array | null | Regex patterns for URL exclusion |
| `exclude_domains` | array | null | Regex patterns for domain exclusion |
| `allow_external` | boolean | true | Follow links to external domains |
| `include_images` | boolean | false | Include images in results |
| `extract_depth` | string | `"basic"` | `"basic"` or `"advanced"` |
| `format` | string | `"markdown"` | `"markdown"` or `"text"` |
| `include_favicon` | boolean | false | Include favicon URLs |
| `timeout` | number | 150 | Request timeout (10-150 seconds) |
| `include_usage` | boolean | false | Include credit usage in response |

**Response structure:**

```json
{
  "base_url": "docs.example.com",
  "results": [
    {
      "url": "https://docs.example.com/getting-started",
      "raw_content": "# Getting Started\n\nWelcome to..."
    }
  ],
  "response_time": 12.5,
  "usage": {"credits": 5},
  "request_id": "abc-123-def"
}
```

### Crawl with Path Filtering

```python
import httpx
import os

TAVILY_API_KEY = os.environ["TAVILY_API_KEY"]
BASE_URL = "https://api.tavily.com"
HEADERS = {
    "Authorization": f"Bearer {TAVILY_API_KEY}",
    "Content-Type": "application/json",
}


async def crawl_docs_only(url: str):
    payload = {
        "url": url,
        "max_depth": 3,
        "limit": 100,
        "select_paths": ["/docs/.*", "/api/.*"],
        "exclude_paths": ["/blog/.*", "/changelog/.*"],
        "allow_external": False,
        "format": "markdown",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/crawl",
            headers=HEADERS,
            json=payload,
            timeout=180.0,
        )
        resp.raise_for_status()
        return resp.json()
```

## Error Handling

Tavily returns standard HTTP status codes. On error, the response body contains a JSON object with error details.

**Status codes:**

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | No action needed |
| 400 | Bad Request | Fix parameters (e.g. too many URLs for extract) |
| 401 | Unauthorized | Check API key is valid and included |
| 403 | Forbidden | URL not supported for extraction |
| 429 | Rate Limited | Wait `retry-after` seconds and retry |
| 432 | Plan Limit Exceeded | Upgrade plan or wait for limit reset |
| 433 | PayGo Limit Exceeded | Increase PayGo spending limit |
| 500 | Server Error | Retry later |

**Robust error handling with retry:**

```python
import httpx
import asyncio
import os

TAVILY_API_KEY = os.environ["TAVILY_API_KEY"]
BASE_URL = "https://api.tavily.com"
HEADERS = {
    "Authorization": f"Bearer {TAVILY_API_KEY}",
    "Content-Type": "application/json",
}


async def search_with_retry(payload: dict, max_retries: int = 3):
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            resp = await client.post(
                f"{BASE_URL}/search",
                headers=HEADERS,
                json=payload,
                timeout=30.0,
            )
            if resp.status_code == 429:
                retry_after = float(resp.headers.get("retry-after", 2))
                await asyncio.sleep(retry_after)
                continue
            if resp.status_code >= 500:
                await asyncio.sleep(2 ** attempt)
                continue
            resp.raise_for_status()
            return resp.json()
    raise RuntimeError("Max retries exceeded")
```

## Common Pitfalls

1. **Extract URL limit is 20.** Sending more than 20 URLs to `/extract` in a single request returns a 400 error. Batch your requests if you have more.

2. **Crawl timeout is long but finite.** The `/crawl` endpoint default timeout is 150 seconds. Large sites with high `limit` values may time out. Set an appropriate `timeout` parameter and httpx client timeout.

3. **Credit costs vary by depth.** `"advanced"` search depth costs 2 credits instead of 1. Crawl with `instructions` costs 2 credits per 10 pages. Monitor usage with `include_usage: true`.

4. **The `query` parameter on `/extract` enables reranking.** Without it, you get full raw content. With it, content is chunked and ranked by relevance to your query. Use it when you need targeted extraction.

5. **Bearer prefix is required.** The Authorization header must be `Bearer tvly-...`, not just the raw key. Omitting the `Bearer` prefix returns 401.

6. **`search_depth` values have different latency profiles.** `"ultra-fast"` and `"fast"` are significantly faster than `"basic"` and `"advanced"`. Choose based on your latency vs. relevance requirements.

7. **`failed_results` in extract responses.** Always check the `failed_results` array. Some URLs may fail silently while others succeed. Your code should handle partial failures.

8. **Crawl path filters use regex, not glob.** The `select_paths` and `exclude_paths` parameters take regex patterns (e.g. `/docs/.*`), not shell globs (e.g. `/docs/*`).

9. **httpx default timeout is too short for crawl.** The httpx default timeout is 5 seconds. Always set an explicit `timeout=` on the client call, especially for `/crawl` (recommend 180+ seconds).

10. **Development vs. Production keys.** Rate limits differ significantly between environments. Ensure you are using a production key if you need higher throughput (1,000 RPM vs. 100 RPM).
