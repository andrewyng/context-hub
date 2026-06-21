# Extract API Reference

Extract pulls structured data from one or many URLs using an LLM. Give it URLs (or
wildcard patterns) plus a prompt and/or JSON schema, and it returns typed fields —
no per-site parsing.

> **Note:** As of the v4 SDK the standalone `extract` endpoint is in maintenance
> mode. For a single page, prefer `scrape` with the `json` format (see
> [scrape.md](scrape.md)). `extract` remains the path for multi-URL and
> whole-domain wildcard extraction.

## Table of Contents

- [Extract vs scrape json](#extract-vs-scrape-json)
- [Basic Usage](#basic-usage)
- [Key Parameters](#key-parameters)
- [Prompt vs Schema](#prompt-vs-schema)
- [Wildcards and Multiple URLs](#wildcards-and-multiple-urls)
- [Web-Search-Augmented Extraction](#web-search-augmented-extraction)
- [Response Fields](#response-fields)

---

## Extract vs scrape json

| Need | Use |
|------|-----|
| Structured fields from **one** known page | `scrape` with the `json` format |
| Structured fields across **many** pages or a **wildcard** | `extract` |

Both use an LLM and accept a schema or prompt; `extract` is built for breadth
(multiple URLs, whole-domain wildcards) while `scrape`'s `json` format is the
single-page path. See [scrape.md](scrape.md) for the single-page case.

---

## Basic Usage

```python
from firecrawl import Firecrawl

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")

schema = {
    "type": "object",
    "properties": {"description": {"type": "string"}},
    "required": ["description"],
}

res = firecrawl.extract(
    urls=["https://docs.firecrawl.dev"],
    prompt="Extract the page description",
    schema=schema,
)
print(res.data["description"])
```

```javascript
import { Firecrawl } from 'firecrawl';

const firecrawl = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });

const schema = {
  type: 'object',
  properties: { title: { type: 'string' } },
  required: ['title'],
};

const res = await firecrawl.extract({
  urls: ['https://docs.firecrawl.dev'],
  prompt: 'Extract the page title',
  schema,
});

console.log(res.data);
```

---

## Key Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `urls` **(required)** | `list[str]` | URLs to extract from; wildcards allowed (`example.com/*`) |
| `prompt` | `str` | Natural-language description of the data you want |
| `schema` | `dict` | JSON schema (or Pydantic/Zod model) defining the output shape |
| `enable_web_search` | `bool` | Let extraction follow links beyond the given pages for more context |

In the JS SDK: `enableWebSearch`. You can pass a `prompt`, a `schema`, or both.

---

## Prompt vs Schema

- **Schema** — when you know the exact fields and types you want. Most reliable
  for pipelines; the output conforms to your structure.
- **Prompt** — when the shape is fuzzy or exploratory. Firecrawl infers a
  structure from your description.
- **Both** — a schema for structure plus a prompt to guide interpretation.

```python
# Schema-driven (recommended for pipelines)
schema = {
    "type": "object",
    "properties": {
        "company_mission": {"type": "string"},
        "is_open_source": {"type": "boolean"},
    },
    "required": ["company_mission"],
}
res = firecrawl.extract(urls=["https://firecrawl.dev"], schema=schema)
```

---

## Wildcards and Multiple URLs

Pass several URLs, or use a wildcard to extract the same shape across a whole
section of a site:

```python
res = firecrawl.extract(
    urls=["https://docs.firecrawl.dev/features/*"],
    prompt="For each page, extract its title and a one-sentence summary",
    schema={
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "summary": {"type": "string"},
        },
        "required": ["title", "summary"],
    },
)
```

---

## Web-Search-Augmented Extraction

Set `enable_web_search=True` to let Firecrawl pull in supporting context from
linked or related pages when the answer isn't fully present on the given URLs.

```python
res = firecrawl.extract(
    urls=["https://firecrawl.dev"],
    prompt="What pricing tiers are offered and what does each include?",
    enable_web_search=True,
)
```

---

## Response Fields

```json
{
  "success": true,
  "data": {
    "company_mission": "...",
    "is_open_source": true
  }
}
```

In the SDKs the extracted object is available as `res.data`.

For the canonical, always-current parameter list see the
[Firecrawl extract docs](https://docs.firecrawl.dev/features/extract).
