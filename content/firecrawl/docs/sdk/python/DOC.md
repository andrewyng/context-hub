---
name: sdk
description: "Firecrawl Python SDK: scrape, crawl, map, search, and extract web content as clean, LLM-ready data"
metadata:
  languages: "python"
  versions: "4.30.2"
  revision: 1
  updated-on: "2026-06-21"
  source: maintainer
  tags: "firecrawl,scrape,crawl,map,search,extract,ai,agents,rag,web-scraping,web-search,python"
---
# Firecrawl Python SDK

Turn any website into clean, LLM-ready data — markdown, structured JSON,
screenshots, or links — through one SDK. Provides scrape, crawl, map, search, and
extract.

**Package:** `firecrawl-py` on PyPI
**Docs:** https://docs.firecrawl.dev/sdks/python

## Installation

```bash
pip install firecrawl-py
```

With `uv`:

```bash
uv add firecrawl-py
```

## Initialization

Set `FIRECRAWL_API_KEY` in your environment, or pass it directly.

### Synchronous Client

```python
from firecrawl import Firecrawl

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")
```

### Asynchronous Client

```python
from firecrawl import AsyncFirecrawl

firecrawl = AsyncFirecrawl(api_key="fc-YOUR_API_KEY")
```

All async methods share the same names and signatures as the sync client and are
awaitable.

## Scrape

Get clean content from a single URL. Firecrawl renders JavaScript and strips
boilerplate.

```python
doc = firecrawl.scrape("https://firecrawl.dev", formats=["markdown", "html"])
print(doc.markdown)
print(doc.metadata.title)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` **(required)** | `str` | — | Page to scrape |
| `formats` | `list` | `["markdown"]` | `markdown`, `html`, `rawHtml`, `links`, `screenshot`, `summary`, `json` |
| `only_main_content` | `bool` | — | Strip nav/footer; keep the main body |
| `include_tags` | `list[str]` | — | Only keep these tags/selectors |
| `exclude_tags` | `list[str]` | — | Drop these tags/selectors |
| `wait_for` | `int` | — | Milliseconds to wait for JS to render |
| `actions` | `list` | — | Browser interactions before scraping |
| `max_age` | `int` | — | Accept cached content up to this many ms old |
| `timeout` | `int` | — | Request timeout in milliseconds |

### Structured JSON

```python
from pydantic import BaseModel

class CompanyInfo(BaseModel):
    mission: str
    is_open_source: bool

doc = firecrawl.scrape(
    "https://firecrawl.dev",
    formats=[{"type": "json", "schema": CompanyInfo.model_json_schema()}],
)
print(doc.json)
```

## Crawl

Traverse a whole site and scrape every discovered page.

```python
job = firecrawl.crawl(
    "https://docs.firecrawl.dev",
    limit=100,
    scrape_options={"formats": ["markdown"]},
)
for page in job.data:
    print(page.metadata.source_url)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` **(required)** | `str` | — | Starting URL |
| `limit` | `int` | — | Max pages to crawl |
| `max_discovery_depth` | `int` | — | Link levels deep to follow |
| `include_paths` | `list[str]` | — | Only crawl matching paths |
| `exclude_paths` | `list[str]` | — | Skip matching paths |
| `scrape_options` | `dict` | — | Per-page scrape options |

### Async crawl jobs

```python
started = firecrawl.start_crawl("https://docs.firecrawl.dev", limit=500)
status = firecrawl.get_crawl_status(started.id)
while status.status not in ("completed", "failed"):
    status = firecrawl.get_crawl_status(started.id)
firecrawl.cancel_crawl(started.id)  # optional
```

## Map

Discover a site's URLs without scraping content.

```python
res = firecrawl.map("https://docs.firecrawl.dev", limit=100)
for link in res.links:
    print(link.url)
```

Key parameters: `url`, `search` (filter URLs by keyword), `limit`.

## Search

Search the web by query, optionally scraping results in the same call.

```python
res = firecrawl.search(
    "best open source web scrapers",
    limit=5,
    sources=["web"],
    scrape_options={"formats": ["markdown"]},
)
for item in res.web or []:
    print(item.title, item.url)
```

Key parameters: `query`, `limit`, `sources` (`web`/`news`/`images`), `tbs`
(time filter), `location`, `scrape_options`.

## Extract

Pull structured data from one or many URLs (wildcards allowed) using an LLM.

> **Note:** The standalone `extract` endpoint is in maintenance mode in v4. For a
> single known page, prefer `scrape` with the `json` format. Reach for `extract`
> when you need structured data across many URLs or wildcard patterns.

```python
schema = {
    "type": "object",
    "properties": {"mission": {"type": "string"}},
    "required": ["mission"],
}
res = firecrawl.extract(
    urls=["https://firecrawl.dev"],
    prompt="Extract the company mission",
    schema=schema,
)
print(res.data["mission"])
```

Key parameters: `urls` (wildcards like `example.com/*`), `prompt`, `schema`,
`enable_web_search`.

## Batch Scrape

Scrape many known URLs efficiently.

```python
docs = firecrawl.batch_scrape(
    ["https://a.com", "https://b.com"],
    formats=["markdown"],
)
```

Non-blocking variant: `start_batch_scrape(urls)` returns a job id; poll with
`get_batch_scrape_status(job_id)`.

## Async Usage

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

## Error Handling

```python
try:
    doc = firecrawl.scrape("https://example.com", formats=["markdown"])
except Exception as e:
    print(f"Scrape failed: {e}")
```

For the canonical, always-current reference, see the
[Firecrawl Python SDK docs](https://docs.firecrawl.dev/sdks/python).
