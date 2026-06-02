---
name: rest-api
description: "Firecrawl - Web Scraping and Crawling API for AI"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "firecrawl,scraping,crawling,web-data,extraction,ai,rag,api"
---

# Firecrawl REST API Reference (Python / httpx)

## Golden Rule

Always use the REST API directly with `httpx` for full control over requests, retries, and async patterns. Do not use the `firecrawl` Python SDK -- it adds abstraction that hides rate-limit headers and makes debugging harder. The API is versioned at `v1` (current production path maps v1 -> v2 internally). All endpoints accept JSON and return JSON.

## Installation

```bash
pip install httpx
```

All examples below use `httpx.AsyncClient` for non-blocking I/O. For synchronous usage, replace `async`/`await` with `httpx.Client` and drop the `async` keyword.

## Base URL

```
https://api.firecrawl.dev
```

All endpoint paths below are relative to this base.

## Authentication

Every request must include a Bearer token in the `Authorization` header.

```python
import httpx

FIRECRAWL_API_KEY = "fc-..."  # your API key

headers = {
    "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
    "Content-Type": "application/json",
}
```

## Rate Limiting

Limits are per-plan and per-endpoint (requests/minute):

| Plan     | /scrape | /map   | /crawl | /search | /extract |
|----------|---------|--------|--------|---------|----------|
| Free     | 10      | 10     | 1      | 5       | 10       |
| Hobby    | 100     | 100    | 15     | 50      | 100      |
| Standard | 500     | 500    | 50     | 250     | 500      |
| Growth   | 5,000   | 5,000  | 250    | 2,500   | 1,000    |
| Scale    | 7,500   | 7,500  | 750    | 7,500   | 1,000    |

When rate-limited, the API returns HTTP `429`. Implement exponential backoff.

Status-polling endpoints (`/crawl/{id}`, `/extract/{id}`) have much higher limits (1,500-25,000 req/min).

---

## Methods

### POST /v1/scrape

Scrape a single URL and return its content in one or more formats.

**Request Body:**

| Parameter          | Type     | Required | Default | Description                                      |
|--------------------|----------|----------|---------|--------------------------------------------------|
| `url`              | string   | Yes      | --      | The URL to scrape                                |
| `formats`          | string[] | No       | `["markdown"]` | Output formats: `markdown`, `html`, `rawHtml`, `links`, `screenshot`, `json` |
| `onlyMainContent`  | boolean  | No       | `true`  | Strip navs, footers, sidebars                    |
| `includeTags`      | string[] | No       | --      | HTML tags to include                             |
| `excludeTags`      | string[] | No       | --      | HTML tags to exclude                             |
| `waitFor`          | integer  | No       | `0`     | Milliseconds to wait before scraping (for JS-rendered pages) |
| `timeout`          | integer  | No       | `30000` | Request timeout in ms (1000-300000)              |
| `mobile`           | boolean  | No       | `false` | Emulate mobile device                            |
| `headers`          | object   | No       | --      | Custom HTTP headers                              |
| `actions`          | array    | No       | --      | Browser actions: `wait`, `click`, `write`, `scroll`, `screenshot`, `executeJavascript` |
| `removeBase64Images` | boolean | No     | `true`  | Strip base64 images from markdown output         |
| `blockAds`         | boolean  | No       | `true`  | Enable ad-blocking                               |
| `location`         | object   | No       | --      | Country code and language preferences            |

**Example:**

```python
import httpx

async def scrape_url(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers=headers,
            json={
                "url": url,
                "formats": ["markdown", "html", "links"],
                "onlyMainContent": True,
                "timeout": 30000,
            },
        )
        resp.raise_for_status()
        return resp.json()
        # {success, data: {markdown, html, links, metadata: {title, url, statusCode}}}
```

---

### POST /v1/crawl

Start an asynchronous crawl job. Returns a job ID -- you must poll for results.

**Request Body:**

| Parameter             | Type     | Required | Default  | Description                                     |
|-----------------------|----------|----------|----------|-------------------------------------------------|
| `url`                 | string   | Yes      | --       | Starting URL for the crawl                      |
| `limit`               | integer  | No       | `10000`  | Max pages to crawl                              |
| `maxDiscoveryDepth`   | integer  | No       | --       | Max link-depth from start URL                   |
| `includePaths`        | string[] | No       | --       | Regex patterns for URLs to include              |
| `excludePaths`        | string[] | No       | --       | Regex patterns for URLs to exclude              |
| `allowExternalLinks`  | boolean  | No       | `false`  | Follow links to other domains                   |
| `allowSubdomains`     | boolean  | No       | `false`  | Follow subdomain links                          |
| `delay`               | number   | No       | --       | Seconds to wait between page scrapes            |
| `maxConcurrency`      | integer  | No       | --       | Max concurrent scrapes                          |
| `sitemap`             | string   | No       | `"include"` | Sitemap strategy: `skip`, `include`, `only`  |
| `scrapeOptions`       | object   | No       | --       | Nested scrape config (formats, headers, etc.)   |
| `webhook`             | object   | No       | --       | Webhook URL, headers, and event types           |

**Example -- submit a crawl job:**

**Combined submit + poll pattern:**

```python
async def crawl_and_wait(
    url: str, max_pages: int = 100, poll_interval: float = 2.0,
) -> list[dict]:
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            "https://api.firecrawl.dev/v1/crawl",
            headers=headers,
            json={
                "url": url,
                "limit": max_pages,
                "scrapeOptions": {"formats": ["markdown"], "onlyMainContent": True},
            },
        )
        resp.raise_for_status()
        job_id = resp.json()["id"]

        all_data = []
        while True:
            status_resp = await client.get(
                f"https://api.firecrawl.dev/v1/crawl/{job_id}", headers=headers,
            )
            status_resp.raise_for_status()
            result = status_resp.json()
            if result["status"] == "completed":
                all_data.extend(result.get("data", []))
                next_url = result.get("next")
                while next_url:
                    page_resp = await client.get(next_url, headers=headers)
                    page_resp.raise_for_status()
                    page_result = page_resp.json()
                    all_data.extend(page_result.get("data", []))
                    next_url = page_result.get("next")
                return all_data
            if result["status"] == "failed":
                raise RuntimeError(f"Crawl {job_id} failed")
            await asyncio.sleep(poll_interval)
```

`GET /v1/crawl/{id}` returns: `status` (scraping/completed/failed), `total`, `completed`, `creditsUsed`, `expiresAt`, `next` (pagination URL if >10MB), `data` (array of page objects).

---

### POST /v1/map

Discover all URLs on a website without scraping content. Fast site-map generation.

**Request Body:**

| Parameter              | Type    | Required | Default    | Description                                |
|------------------------|---------|----------|------------|--------------------------------------------|
| `url`                  | string  | Yes      | --         | Base URL to map                            |
| `search`               | string  | No       | --         | Order results by relevance to this query   |
| `sitemap`              | string  | No       | `"include"`| `skip`, `include`, or `only`               |
| `includeSubdomains`    | boolean | No       | `true`     | Include subdomain URLs                     |
| `ignoreQueryParameters`| boolean | No       | `true`     | Deduplicate URLs ignoring query params     |
| `limit`                | integer | No       | `5000`     | Max links to return (max 100,000)          |
| `timeout`              | integer | No       | --         | Timeout in milliseconds                    |

**Example:**

```python
async def map_site(url: str, search: str | None = None) -> list[dict]:
    async with httpx.AsyncClient() as client:
        payload = {"url": url, "limit": 5000}
        if search:
            payload["search"] = search
        resp = await client.post(
            "https://api.firecrawl.dev/v1/map",
            headers=headers,
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()["links"]
        # {success, links: [{url, title, description}, ...]}
```

---

Additional endpoints (`/v1/search`, `/v1/extract`, `GET /v1/extract/{id}`) follow the same patterns. See the [Firecrawl docs](https://docs.firecrawl.dev) for details.

---

## Error Handling

All endpoints return consistent error shapes:

| Status | Meaning                  | Action                                      |
|--------|--------------------------|---------------------------------------------|
| `200`  | Success                  | Parse `response.json()`                     |
| `400`  | Bad request              | Check request body and parameters           |
| `401`  | Unauthorized             | Verify API key                              |
| `402`  | Payment required         | Check plan credits / billing                |
| `429`  | Rate limit exceeded      | Back off and retry with exponential delay    |
| `500`  | Server error             | Retry with backoff; contact support if persistent |

**Recommended retry wrapper:**

```python
import httpx
import asyncio
from typing import Any

async def firecrawl_request(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    max_retries: int = 3,
    **kwargs: Any,
) -> dict:
    """Make a Firecrawl API request with exponential backoff on 429/5xx."""
    for attempt in range(max_retries):
        resp = await client.request(method, url, headers=headers, **kwargs)

        if resp.status_code == 200:
            return resp.json()

        if resp.status_code == 429 or resp.status_code >= 500:
            wait = 2 ** attempt
            await asyncio.sleep(wait)
            continue

        # Non-retryable error
        resp.raise_for_status()

    raise httpx.HTTPStatusError(
        f"Failed after {max_retries} retries",
        request=resp.request,
        response=resp,
    )
```

---

## Common Pitfalls

1. **Crawl/extract are async.** `POST /v1/crawl` and `/v1/extract` return a job ID immediately. You must poll until `status == "completed"`. Use 2-5 second poll intervals.

2. **Handle pagination on large crawls.** When results exceed 10MB, the response includes a `next` URL. Follow it to get all pages.

3. **Ignoring rate limits.** Free-tier allows only 10 scrapes/min. Always implement backoff on HTTP 429.

4. **Use `markdown` format for LLM consumption.** The `html` format returns cleaned HTML; `rawHtml` is unmodified source. Keep `onlyMainContent: true` (default) for cleaner output.

5. **Use `map` before `crawl`.** If you only need URLs from a site (e.g., to filter before crawling), `POST /v1/map` is instant and costs fewer credits than a full crawl.

6. **Set `timeout`/`waitFor` for JS-heavy pages.** Pages relying on client-side rendering need longer timeouts to ensure content loads.

7. **Results expire.** Download and store crawl/extract results before the `expiresAt` timestamp.
