# Scrape API Reference

Scrape a single URL and get back clean, LLM-ready content. Firecrawl renders
JavaScript, follows redirects, and strips boilerplate, so you get the page
content instead of raw HTML noise.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Formats](#formats)
- [Key Parameters](#key-parameters)
- [Structured Extraction with JSON](#structured-extraction-with-json)
- [Interactive Pages with Actions](#interactive-pages-with-actions)
- [Caching with max_age](#caching-with-max_age)
- [Response Fields](#response-fields)

---

## Basic Usage

```python
from firecrawl import Firecrawl

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")

doc = firecrawl.scrape("https://firecrawl.dev", formats=["markdown"])
print(doc.markdown)
print(doc.metadata.title)
```

```javascript
import { Firecrawl } from 'firecrawl';

const firecrawl = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });

const doc = await firecrawl.scrape('https://firecrawl.dev', {
  formats: ['markdown'],
});
console.log(doc.markdown);
```

---

## Formats

Request one or more output formats in a single call:

| Format | Returns |
|--------|---------|
| `markdown` | Clean markdown (the default workhorse) |
| `html` | Processed HTML |
| `rawHtml` | Unmodified HTML |
| `links` | All links found on the page |
| `screenshot` | A screenshot of the page (full-page option available) |
| `summary` | A short LLM-generated summary of the page |
| `json` | Structured data extracted against a schema or prompt (see below) |

```python
doc = firecrawl.scrape("https://firecrawl.dev", formats=["markdown", "html", "links"])
```

---

## Key Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` **(required)** | `str` | Page to scrape |
| `formats` | `list` | Output formats (see table above) |
| `only_main_content` | `bool` | Strip nav, footer, and chrome; keep the article body |
| `include_tags` | `list[str]` | Only keep these HTML tags/selectors |
| `exclude_tags` | `list[str]` | Drop these HTML tags/selectors |
| `wait_for` | `int` | Milliseconds to wait for JS to render before scraping |
| `actions` | `list` | Browser interactions to run before scraping (see below) |
| `max_age` | `int` | Serve cached content up to this many ms old (see below) |
| `timeout` | `int` | Request timeout in milliseconds |
| `location` | `dict` | `{ "country": "US", "languages": ["en"] }` for geo-specific content |

In the JS SDK these are camelCase: `onlyMainContent`, `includeTags`, `excludeTags`, `waitFor`, `maxAge`.

PDFs are auto-detected — pass a PDF URL directly to `scrape` and Firecrawl parses it.

---

## Structured Extraction with JSON

Use the `json` format to pull structured fields out of a single page. Provide a
JSON schema, a Pydantic/Zod model, or a natural-language prompt.

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

Prompt-only (no schema):

```python
doc = firecrawl.scrape(
    "https://firecrawl.dev",
    formats=[{"type": "json", "prompt": "Extract the company mission statement"}],
)
```

For structured data across **many** pages or with wildcards, use
[`extract`](extract.md) instead of per-page `scrape`.

---

## Interactive Pages with Actions

`actions` let you drive the page before scraping — click, type, scroll, wait, or
capture a screenshot. Useful for content behind a button, a search box, or
infinite scroll.

```python
doc = firecrawl.scrape(
    "https://example.com/search",
    formats=["markdown"],
    actions=[
        {"type": "write", "text": "firecrawl"},
        {"type": "press", "key": "Enter"},
        {"type": "wait", "milliseconds": 2000},
    ],
)
```

Supported action types include `click`, `write`, `press`, `wait`, `scroll`, and `screenshot`.

---

## Caching with max_age

Firecrawl caches scraped pages. Pass `max_age` (milliseconds) to accept a cached
copy that is at most that old — much faster and cheaper than a fresh fetch. Set
`max_age=0` to force a fresh scrape.

```python
# Accept a cached copy up to 1 hour old
doc = firecrawl.scrape("https://firecrawl.dev", formats=["markdown"], max_age=3_600_000)

# Always fetch fresh
doc = firecrawl.scrape("https://firecrawl.dev", formats=["markdown"], max_age=0)
```

---

## Response Fields

The scrape response carries the requested formats plus page metadata:

```json
{
  "markdown": "...",
  "html": "...",
  "links": ["..."],
  "json": { "...": "..." },
  "metadata": {
    "title": "...",
    "description": "...",
    "sourceURL": "...",
    "statusCode": 200
  }
}
```

In the SDKs these are surfaced as attributes/properties: `doc.markdown`,
`doc.html`, `doc.json`, `doc.metadata.title`, `doc.metadata.source_url`.

For the canonical, always-current parameter list see the
[Firecrawl scrape docs](https://docs.firecrawl.dev/features/scrape).
