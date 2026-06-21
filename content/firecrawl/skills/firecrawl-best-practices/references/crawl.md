# Crawl API Reference

Crawl traverses a site starting from a URL, discovers its pages, and scrapes each
one. Use it to ingest whole documentation sites, blogs, or product sections into
a RAG pipeline.

## Table of Contents

- [Crawl vs Map vs Scrape](#crawl-vs-map-vs-scrape)
- [Basic Usage](#basic-usage)
- [Key Parameters](#key-parameters)
- [Path Filtering](#path-filtering)
- [Async Jobs and Status Polling](#async-jobs-and-status-polling)
- [Best Practices](#best-practices)
- [Response Fields](#response-fields)

---

## Crawl vs Map vs Scrape

| Method | Returns | Use when |
|--------|---------|----------|
| `scrape` | One page's content | You have the exact URL |
| `map` | A list of URLs (no content) | You want to discover structure fast |
| `crawl` | Content for many discovered pages | You want a whole site/section ingested |

A common, efficient pattern is **map first** to inspect the URL list, then
`crawl` (or batch `scrape`) only the paths you actually need.

---

## Basic Usage

Blocking crawl — waits for completion and returns all pages:

```python
from firecrawl import Firecrawl

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")

job = firecrawl.crawl(
    "https://docs.firecrawl.dev",
    limit=100,
    scrape_options={"formats": ["markdown"]},
)

for page in job.data:
    print(page.metadata.source_url, len(page.markdown))
```

```javascript
const job = await firecrawl.crawl('https://docs.firecrawl.dev', {
  limit: 100,
  scrapeOptions: { formats: ['markdown'] },
});

for (const page of job.data) {
  console.log(page.metadata.sourceURL);
}
```

---

## Key Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` **(required)** | `str` | Starting URL |
| `limit` | `int` | Max number of pages to crawl |
| `max_discovery_depth` | `int` | How many link levels deep to follow |
| `include_paths` | `list[str]` | Only crawl URLs matching these path patterns |
| `exclude_paths` | `list[str]` | Skip URLs matching these path patterns |
| `scrape_options` | `dict` | Per-page scrape options (`formats`, `only_main_content`, etc.) |

In the JS SDK: `maxDiscoveryDepth`, `includePaths`, `excludePaths`, `scrapeOptions`.

---

## Path Filtering

Focus the crawl on the sections you care about. Always pair `limit` with path
filters to avoid runaway crawls.

```python
job = firecrawl.crawl(
    "https://docs.firecrawl.dev",
    limit=200,
    include_paths=["/features/.*", "/sdks/.*"],
    exclude_paths=["/changelog/.*"],
    scrape_options={"formats": ["markdown"]},
)
```

---

## Async Jobs and Status Polling

For large sites, start the crawl without blocking and poll for status. This lets
you stream results and survive long-running jobs.

```python
started = firecrawl.start_crawl("https://docs.firecrawl.dev", limit=500)
crawl_id = started.id

status = firecrawl.get_crawl_status(crawl_id)
while status.status not in ("completed", "failed"):
    status = firecrawl.get_crawl_status(crawl_id)

print(status.status, len(status.data))

# Cancel a running crawl if needed
firecrawl.cancel_crawl(crawl_id)
```

```javascript
const started = await firecrawl.startCrawl('https://docs.firecrawl.dev', { limit: 500 });
let status = await firecrawl.getCrawlStatus(started.id);
while (!['completed', 'failed'].includes(status.status)) {
  status = await firecrawl.getCrawlStatus(started.id);
}
```

The status object reports `status`, the accumulated `data` (pages scraped so
far), and pagination info for large result sets.

---

## Best Practices

1. **Always set a `limit`** — crawls can otherwise expand unexpectedly.
2. **Start with path filters** (`include_paths` / `exclude_paths`) to stay on-topic.
3. **Map before you crawl** when you're unsure of a site's structure.
4. **Use `start_crawl` + polling** for large sites instead of a blocking call.
5. **Set `only_main_content` in `scrape_options`** to drop nav/footer boilerplate.
6. **Pick minimal `formats`** (usually just `markdown`) to keep tokens and cost down.

---

## Response Fields

A completed crawl returns a list of page documents, each with the same shape as a
single [`scrape`](scrape.md) result:

```json
{
  "status": "completed",
  "total": 100,
  "completed": 100,
  "data": [
    {
      "markdown": "...",
      "metadata": { "title": "...", "sourceURL": "...", "statusCode": 200 }
    }
  ]
}
```

For the canonical, always-current parameter list see the
[Firecrawl crawl docs](https://docs.firecrawl.dev/features/crawl).
