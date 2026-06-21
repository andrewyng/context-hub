# Search API Reference

Search the web by query and optionally scrape the results in the same call. This
turns "find pages about X" and "give me their content" into one request — ideal
for RAG and agent workflows.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Key Parameters](#key-parameters)
- [Sources](#sources)
- [Search-then-Scrape in One Call](#search-then-scrape-in-one-call)
- [Filtering](#filtering)
- [Response Fields](#response-fields)

---

## Basic Usage

```python
from firecrawl import Firecrawl

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")

res = firecrawl.search("best open source web scrapers", limit=5)
for item in res.web or []:
    print(item.title, item.url)
```

```javascript
const res = await firecrawl.search('best open source web scrapers', { limit: 5 });
for (const item of res.web ?? []) {
  console.log(item.title, item.url);
}
```

---

## Key Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` **(required)** | `str` | Search query |
| `limit` | `int` | Results per source |
| `sources` | `list[str]` | `"web"` (default), `"news"`, `"images"` — request several at once |
| `tbs` | `str` | Time filter: `"qdr:d"` (past day), `"qdr:w"` (week), `"qdr:m"` (month), `"qdr:y"` (year) |
| `location` | `str` | Geographic context (e.g. `"Germany"`) |
| `scrape_options` | `dict` | Scrape each result inline (`formats`, `only_main_content`, etc.) |

In the JS SDK: `scrapeOptions` (camelCase). `limit` applies **per source**.

---

## Sources

Request one or more result types in a single call. The response groups results by
source, accessible as `res.web`, `res.news`, and `res.images`.

```python
res = firecrawl.search("AI agents", sources=["web", "news"], limit=5)
print(len(res.web or []), "web,", len(res.news or []), "news")
```

---

## Search-then-Scrape in One Call

Add `scrape_options` to get full page content for every result without a second
round-trip — the common pattern for feeding fresh web content to an LLM.

```python
res = firecrawl.search(
    "firecrawl changelog 2026",
    limit=5,
    scrape_options={"formats": ["markdown"]},
)
for item in res.web or []:
    print(item.url)
    print(item.markdown[:500])
```

```javascript
const res = await firecrawl.search('firecrawl changelog 2026', {
  limit: 5,
  scrapeOptions: { formats: ['markdown'] },
});
```

---

## Filtering

```python
# Recent results only
res = firecrawl.search("openai release notes", tbs="qdr:w")

# Localized results
res = firecrawl.search("data privacy law", location="Germany")
```

---

## Response Fields

```json
{
  "web": [
    {
      "url": "https://...",
      "title": "...",
      "description": "...",
      "markdown": "..."
    }
  ],
  "news": [],
  "images": []
}
```

When `scrape_options` is set, each result also carries the requested scrape
formats (e.g. `markdown`, `links`, `metadata`).

For the canonical, always-current parameter list see the
[Firecrawl search docs](https://docs.firecrawl.dev/features/search).
