---
name: rest-api
description: "Jina AI Reader, Search & Grounding APIs"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "jina,reader,search,grounding,web-scraping,markdown,llm,rag,api,integration"
---

# Jina AI Reader & Search API

> **Golden Rule:** Jina Reader has no dedicated Python SDK for its REST APIs. Use `httpx` (async) or `requests` (sync) for direct HTTP access. The APIs convert web content into LLM-friendly Markdown. Free tier includes 10M tokens per new API key.

## Installation

```bash
pip install httpx
```

## Base URLs

| Endpoint | URL | Purpose |
|---|---|---|
| Reader | `https://r.jina.ai/` | Extract content from a URL as Markdown |
| Search | `https://s.jina.ai/` | Web search returning LLM-friendly results |
| Grounding | `https://g.jina.ai/` | Fact-check statements against web sources |

EU region variants available: `https://eu.r.jina.ai/`, `https://eu.s.jina.ai/`

## Authentication

**Type:** Bearer Token (optional but recommended)

```python
import httpx

JINA_API_KEY = "your-jina-api-key"  # Get free key at https://jina.ai/?sui=apikey

headers = {
    "Authorization": f"Bearer {JINA_API_KEY}",
    "Accept": "application/json"
}
client = httpx.AsyncClient(headers=headers, timeout=30.0)
```

Without a key: 20 RPM limit (IP-based). With a free key: 500 RPM Reader, 100 RPM Search. Every new key gets 10M free tokens.

## Rate Limiting

| Tier | Reader RPM | Search RPM |
|---|---|---|
| No Key | 20 | N/A |
| Free/Paid Key | 500 | 100 |
| Premium | 5,000 | 1,000 |

## Methods

### `read_url` (Reader API)

**Endpoint:** `GET https://r.jina.ai/{target_url}` or `POST https://r.jina.ai/`

Extract content from any URL as clean Markdown. Supports HTML pages, PDFs, and dynamic JS-rendered content.

**Returns:** Markdown text (default) or JSON with `data.content`, `data.links`, `data.images`

```python
# Simple GET -- append URL to path
url = "https://r.jina.ai/https://example.com"
response = await client.get(url)
response.raise_for_status()
data = response.json()
markdown = data["data"]["content"]
title = data["data"]["title"]
```

```python
# POST -- required for URLs with hash fragments (#)
response = await client.post(
    "https://r.jina.ai/",
    json={"url": "https://example.com/#/some-route"},
    headers={**headers, "Content-Type": "application/json"}
)
response.raise_for_status()
data = response.json()
```

**Key request headers for controlling output:**

| Header | Values | Purpose |
|---|---|---|
| `X-Return-Format` | `markdown`, `html`, `text`, `screenshot` | Output format (default: markdown) |
| `X-Target-Selector` | CSS selector | Extract only matching elements |
| `X-Wait-For-Selector` | CSS selector | Wait for element before extracting |
| `X-Remove-Selector` | CSS selector | Remove elements from output |
| `X-No-Cache` | `true` | Bypass cache (default TTL: 3600s) |
| `X-With-Links-Summary` | `true` | Include all page links in response |
| `X-With-Images-Summary` | `true` | Include all images in response |
| `X-Engine` | `browser`, `direct` | `direct` is fastest; `browser` renders JS |

### `search_web` (Search API)

**Endpoint:** `GET https://s.jina.ai/{query}` or `POST https://s.jina.ai/`

Live web search returning results in LLM-friendly format. Each request consumes minimum 10,000 tokens.

| Parameter | Type | Default |
|---|---|---|
| `q` | `str` | **required** |
| `num` | `int` | `5` |
| `gl` | `str` | `None` (country code, e.g., `us`) |
| `hl` | `str` | `None` (language code, e.g., `en`) |
| `page` | `int` | `1` |

**Returns:** JSON with array of results, each containing `title`, `url`, `content` (Markdown)

```python
# POST search
response = await client.post(
    "https://s.jina.ai/",
    json={"q": "best practices for RAG pipelines", "num": 5},
    headers={**headers, "Content-Type": "application/json"}
)
response.raise_for_status()
data = response.json()
results = data["data"]  # list of {title, url, content}
```

```python
# Search within a specific site
response = await client.get(
    "https://s.jina.ai/asyncio tutorial",
    headers={**headers, "X-Site": "https://docs.python.org"}
)
```

### `fact_check` (Grounding API)

**Endpoint:** `POST https://g.jina.ai/`

Fact-check a statement against live web sources. Uses multi-hop reasoning. ~30s per request, ~300K tokens consumed.

| Parameter | Type | Default |
|---|---|---|
| `statement` | `str` | **required** |
| `references` | `list` | `None` (restrict to specific source URLs) |

**Returns:** JSON with `factuality` (0-1 score), `result` (bool), `reason`, `references`

```python
response = await client.post(
    "https://g.jina.ai/",
    json={
        "statement": "Python 3.12 was released in October 2023.",
        "references": ["https://en.wikipedia.org/wiki/Python_(programming_language)"]
    },
    headers={**headers, "Content-Type": "application/json"}
)
response.raise_for_status()
data = response.json()
is_true = data["result"]         # True/False
confidence = data["factuality"]  # 0.0 to 1.0
reasoning = data["reason"]       # Detailed explanation
```

## Error Handling

```python
import httpx

try:
    response = await client.get(f"https://r.jina.ai/https://example.com")
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check your API key")
    elif e.response.status_code == 429:
        print("Rate limited -- reduce request frequency")
    elif e.response.status_code == 402:
        print("Insufficient tokens -- top up your account")
    else:
        print(f"Jina API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Use `Accept: application/json` to get structured JSON; without it, raw Markdown text is returned
- POST is **required** for URLs containing `#` fragments (GET strips fragments)
- Reader averages ~7.9s latency; set `timeout=30.0` on your client
- Search consumes a fixed minimum of 10,000 tokens per request regardless of result count
- Grounding API takes ~30s and ~300K tokens per request -- use selectively
- Use `X-Target-Selector` to extract specific page sections and reduce token usage
- `X-Engine: direct` is fastest but won't render JavaScript-heavy pages; use `browser` for SPAs
- Tokens are NOT deducted for failed requests
- Cache is enabled by default (3600s TTL); use `X-No-Cache: true` for fresh content
