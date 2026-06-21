---
name: sdk
description: "Firecrawl Python & JavaScript SDK reference: clients, scrape/crawl/map/search/extract, async, status polling"
metadata:
  languages: "python,javascript"
  revision: 1
  updated-on: "2026-06-21"
  source: maintainer
  tags: "firecrawl,sdk,python,javascript,scrape,crawl,map,search,extract,web-scraping"
---
# Firecrawl SDK Reference

Single SDK for scrape, crawl, map, search, and extract, available for Python and
JavaScript/TypeScript.

## Table of Contents

- [Python SDK](#python-sdk)
- [JavaScript SDK](#javascript-sdk)
- [Async and Concurrency](#async-and-concurrency)
- [Batch Scrape](#batch-scrape)
- [Status Polling](#status-polling)
- [Error Handling](#error-handling)

---

## Python SDK

**Package:** `firecrawl-py` on PyPI

```bash
pip install firecrawl-py
```

### Client

The API key is read from `FIRECRAWL_API_KEY` if not passed explicitly.

```python
from firecrawl import Firecrawl

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")
```

### Methods

```python
# Scrape one page
doc = firecrawl.scrape("https://firecrawl.dev", formats=["markdown", "html"])

# Crawl a site (blocking)
job = firecrawl.crawl("https://docs.firecrawl.dev", limit=100,
                      scrape_options={"formats": ["markdown"]})

# Crawl a site (async job + polling)
started = firecrawl.start_crawl("https://docs.firecrawl.dev", limit=500)
status = firecrawl.get_crawl_status(started.id)
firecrawl.cancel_crawl(started.id)

# Map URLs
res = firecrawl.map("https://docs.firecrawl.dev", limit=100)

# Search the web
res = firecrawl.search("web scrapers", limit=5, sources=["web"])

# Extract structured data
res = firecrawl.extract(urls=["https://firecrawl.dev"],
                        prompt="Extract the mission", schema={...})

# Batch scrape many URLs
docs = firecrawl.batch_scrape(["https://a.com", "https://b.com"],
                              formats=["markdown"])
started = firecrawl.start_batch_scrape(["https://a.com", "https://b.com"])
status = firecrawl.get_batch_scrape_status(started.id)
```

---

## JavaScript SDK

**Package:** `firecrawl` on npm

```bash
npm install firecrawl
```

### Client

```javascript
import { Firecrawl } from 'firecrawl';

const firecrawl = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });
```

### Methods

```javascript
// Scrape one page
const doc = await firecrawl.scrape('https://firecrawl.dev', { formats: ['markdown'] });

// Crawl a site (blocking)
const job = await firecrawl.crawl('https://docs.firecrawl.dev', {
  limit: 100,
  scrapeOptions: { formats: ['markdown'] },
});

// Crawl a site (async job + polling)
const started = await firecrawl.startCrawl('https://docs.firecrawl.dev', { limit: 500 });
const status = await firecrawl.getCrawlStatus(started.id);

// Map URLs
const map = await firecrawl.map('https://docs.firecrawl.dev', { limit: 100 });

// Search the web
const search = await firecrawl.search('web scrapers', { limit: 5 });

// Extract structured data
const extracted = await firecrawl.extract({
  urls: ['https://firecrawl.dev'],
  prompt: 'Extract the mission',
  schema: { /* ... */ },
});

// Batch scrape
const batch = await firecrawl.startBatchScrape(['https://a.com', 'https://b.com']);
const batchStatus = await firecrawl.getBatchScrapeStatus(batch.id);
```

Method names are camelCase in JS (`startCrawl`, `getCrawlStatus`, `startBatchScrape`,
`getBatchScrapeStatus`) and snake_case in Python (`start_crawl`, `get_crawl_status`,
`start_batch_scrape`, `get_batch_scrape_status`).

---

## Async and Concurrency

Python ships an async client with the same method names, all awaitable:

```python
import asyncio
from firecrawl import AsyncFirecrawl

firecrawl = AsyncFirecrawl(api_key="fc-YOUR_API_KEY")

async def scrape_many(urls):
    results = await asyncio.gather(
        *(firecrawl.scrape(u, formats=["markdown"]) for u in urls),
        return_exceptions=True,
    )
    return [r for r in results if not isinstance(r, Exception)]

asyncio.run(scrape_many(["https://a.com", "https://b.com"]))
```

The JS client is async by default — run concurrent calls with `Promise.all` /
`Promise.allSettled`.

---

## Batch Scrape

When you already have a list of URLs, `batch_scrape` is more efficient than calling
`scrape` in a loop. Use the blocking form for small lists, or
`start_batch_scrape` + status polling for large ones.

```python
docs = firecrawl.batch_scrape(
    ["https://docs.firecrawl.dev/features/scrape",
     "https://docs.firecrawl.dev/features/crawl"],
    formats=["markdown"],
)
for doc in docs.data:
    print(doc.metadata.source_url)
```

---

## Status Polling

`crawl` and `batch_scrape` have non-blocking variants that return a job id. Poll
the status endpoint until `status` is `completed` or `failed`:

```python
started = firecrawl.start_crawl("https://docs.firecrawl.dev", limit=500)
status = firecrawl.get_crawl_status(started.id)
while status.status not in ("completed", "failed"):
    status = firecrawl.get_crawl_status(started.id)
print(status.status, len(status.data))
```

---

## Error Handling

Wrap calls and handle network/timeouts and auth errors:

```python
try:
    doc = firecrawl.scrape("https://example.com", formats=["markdown"])
except Exception as e:
    print(f"Scrape failed: {e}")
```

```javascript
try {
  const doc = await firecrawl.scrape('https://example.com', { formats: ['markdown'] });
} catch (err) {
  console.error('Scrape failed:', err.message);
}
```

For the canonical, always-current SDK reference see the
[Firecrawl Python SDK docs](https://docs.firecrawl.dev/sdks/python) and the
[Firecrawl Node SDK docs](https://docs.firecrawl.dev/sdks/node).
