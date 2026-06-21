# Map API Reference

Map returns a list of URLs for a site without scraping their content. It is the
fastest way to discover a site's structure and decide what to scrape or crawl.

## Table of Contents

- [When to Use Map](#when-to-use-map)
- [Basic Usage](#basic-usage)
- [Key Parameters](#key-parameters)
- [Map-then-Scrape Pattern](#map-then-scrape-pattern)
- [Response Fields](#response-fields)

---

## When to Use Map

| Goal | Method |
|------|--------|
| See every URL on a site, fast | `map` |
| Get the content of those pages | `crawl` or `scrape` |

Use `map` to plan: inspect the URL list, filter to the paths you want, then scrape
only those. This is cheaper and faster than crawling everything.

---

## Basic Usage

```python
from firecrawl import Firecrawl

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")

res = firecrawl.map("https://docs.firecrawl.dev", limit=100)
for link in res.links:
    print(link.url)
```

```javascript
const res = await firecrawl.map('https://docs.firecrawl.dev', { limit: 100 });
for (const link of res.links) {
  console.log(link.url);
}
```

---

## Key Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` **(required)** | `str` | Site to map |
| `search` | `str` | Only return URLs whose path/text matches this keyword |
| `limit` | `int` | Max number of URLs to return |

The `search` filter is handy for narrowing a big site to a topic in one call:

```python
res = firecrawl.map("https://docs.firecrawl.dev", search="sdk")
```

---

## Map-then-Scrape Pattern

The recommended workflow for ingesting a focused slice of a site:

```python
# 1. Discover URLs
res = firecrawl.map("https://docs.firecrawl.dev", search="features")
urls = [link.url for link in res.links]

# 2. Scrape only the pages you want
docs = firecrawl.batch_scrape(urls[:20], formats=["markdown"])
```

This avoids a full crawl when you only need a handful of pages, and gives you
explicit control over which URLs are fetched.

---

## Response Fields

```json
{
  "links": [
    { "url": "https://docs.firecrawl.dev/features/scrape" },
    { "url": "https://docs.firecrawl.dev/sdks/python" }
  ]
}
```

In the SDK the URLs are available as `res.links`. Depending on options, each entry
may also carry a title/description.

For the canonical, always-current parameter list see the
[Firecrawl map docs](https://docs.firecrawl.dev/features/map).
