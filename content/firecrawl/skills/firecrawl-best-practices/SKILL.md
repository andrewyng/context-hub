---
name: firecrawl-best-practices
description: "Build production web-data pipelines with Firecrawl: scrape single pages, crawl whole sites, map URLs, search the web, and extract structured data for LLMs, RAG, and agents"
metadata:
  revision: 2
  updated-on: "2026-06-21"
  source: maintainer
  tags: "firecrawl,scrape,crawl,map,search,extract,mcp,integrations,langchain,llamaindex,web-scraping,web-search,ai,agents,rag,best-practices"
---

# Firecrawl

Firecrawl turns websites into clean, LLM-ready data. Give it a URL and get back
markdown, structured JSON, screenshots, or links — without writing per-site
parsers, rotating proxies, or rendering JavaScript yourself.

## Installation

**Python:**
```bash
pip install firecrawl-py
```

**JavaScript / TypeScript:**
```bash
npm install firecrawl
```

See **[references/sdk.md](references/sdk.md)** for the complete SDK reference (client
classes, async usage, status polling).

## Client Initialization

```python
from firecrawl import Firecrawl

# Reads FIRECRAWL_API_KEY from the environment if api_key is omitted
firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")

# Async client for concurrent requests
from firecrawl import AsyncFirecrawl
async_firecrawl = AsyncFirecrawl(api_key="fc-YOUR_API_KEY")
```

```javascript
import { Firecrawl } from 'firecrawl';

const firecrawl = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });
```

## Choosing the Right Method

| Need | Method |
|------|--------|
| Clean content from one known URL | `scrape()` |
| Content from an entire site / docs section | `crawl()` |
| Discover every URL on a site (no content) | `map()` |
| Find pages across the web by query | `search()` |
| Structured fields from one or many pages (LLM) | `extract()` |
| Many known URLs at once | `batch_scrape()` |

Rules of thumb:

- **Know the URL?** Use `scrape`. **Know the data shape?** Add a `json` format or use `extract`.
- **Want a whole site?** `map` first to see the structure, then `crawl` or `scrape` the URLs you actually need.
- **Don't know the URL?** Use `search`, optionally with `scrapeOptions` to get content in the same call.

## Quick Reference

### scrape() — Single Page

```python
doc = firecrawl.scrape("https://firecrawl.dev", formats=["markdown", "html"])
print(doc.markdown)
print(doc.metadata.title)
```
Key parameters: `url`, `formats` (`markdown`, `html`, `rawHtml`, `links`, `screenshot`, `summary`, `json`), `only_main_content`, `wait_for`, `actions`, `max_age` (cache).

See **[references/scrape.md](references/scrape.md)**.

### crawl() — Whole Site

```python
job = firecrawl.crawl("https://docs.firecrawl.dev", limit=100,
                      scrape_options={"formats": ["markdown"]})
for page in job.data:
    print(page.metadata.source_url)
```
Key parameters: `url`, `limit`, `max_discovery_depth`, `include_paths`, `exclude_paths`, `scrape_options`. Blocking `crawl()` waits; `start_crawl()` returns a job id to poll.

See **[references/crawl.md](references/crawl.md)**.

### map() — URL Discovery

```python
res = firecrawl.map("https://docs.firecrawl.dev", limit=100)
for link in res.links:
    print(link.url)
```
Key parameters: `url`, `search` (filter URLs by keyword), `limit`.

See **[references/map.md](references/map.md)**.

### search() — Web Search

```python
res = firecrawl.search("best open source web scrapers", limit=5,
                       scrape_options={"formats": ["markdown"]})
for item in res.web or []:
    print(item.url, item.title)
```
Key parameters: `query`, `limit`, `sources` (`web`, `news`, `images`), `tbs` (time filter), `location`, `scrape_options`.

See **[references/search.md](references/search.md)**.

### extract() — Structured Data

```python
schema = {
    "type": "object",
    "properties": {"mission": {"type": "string"}},
    "required": ["mission"],
}
res = firecrawl.extract(urls=["https://firecrawl.dev"],
                        prompt="Extract the company mission", schema=schema)
print(res.data["mission"])
```
Key parameters: `urls` (wildcards like `example.com/*` allowed), `prompt`, `schema`, `enable_web_search`. For a single page, prefer `scrape` with the `json` format — the standalone `extract` endpoint is in maintenance mode in v4.

See **[references/extract.md](references/extract.md)**.

## Detailed Guides

- **[references/scrape.md](references/scrape.md)** — formats, JSON extraction, actions for interactive pages, caching with `max_age`
- **[references/crawl.md](references/crawl.md)** — path filters, depth, async jobs, status polling, crawl vs map
- **[references/map.md](references/map.md)** — fast URL discovery, the map-then-scrape pattern
- **[references/search.md](references/search.md)** — sources, time/domain filters, search-then-scrape in one call
- **[references/extract.md](references/extract.md)** — prompt vs schema, multi-URL and wildcard extraction, web-search-augmented extraction
- **[references/sdk.md](references/sdk.md)** — Python & JS clients, async patterns, status polling, error handling
- **[references/mcp.md](references/mcp.md)** — use Firecrawl via the Model Context Protocol (hosted or local), tool list, client setup, keyless free tier
- **[references/integrations.md](references/integrations.md)** — native Firecrawl components for LangChain, LlamaIndex, CrewAI, Dify, Flowise, Langflow, and more
