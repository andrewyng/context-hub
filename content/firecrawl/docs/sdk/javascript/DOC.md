---
name: sdk
description: "Firecrawl JavaScript/TypeScript SDK: scrape, crawl, map, search, and extract web content as clean, LLM-ready data"
metadata:
  languages: "javascript"
  versions: "4.28.2"
  revision: 1
  updated-on: "2026-06-21"
  source: maintainer
  tags: "firecrawl,scrape,crawl,map,search,extract,ai,agents,rag,web-scraping,web-search,javascript"
---
# Firecrawl JavaScript SDK

Turn any website into clean, LLM-ready data — markdown, structured JSON,
screenshots, or links — through one SDK. Provides scrape, crawl, map, search, and
extract. The client is async by default.

**Package:** `firecrawl` on npm
**Docs:** https://docs.firecrawl.dev/sdks/node

## Installation

```bash
npm install firecrawl
```

## Initialization

Set `FIRECRAWL_API_KEY` in your environment, or pass it directly.

```javascript
import { Firecrawl } from 'firecrawl';

const firecrawl = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });
```

## Scrape

Get clean content from a single URL. Firecrawl renders JavaScript and strips
boilerplate.

```javascript
const doc = await firecrawl.scrape('https://firecrawl.dev', {
  formats: ['markdown', 'html'],
});
console.log(doc.markdown);
console.log(doc.metadata.title);
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` **(required)** | `string` | — | Page to scrape |
| `formats` | `array` | `['markdown']` | `markdown`, `html`, `rawHtml`, `links`, `screenshot`, `summary`, `json` |
| `onlyMainContent` | `boolean` | — | Strip nav/footer; keep the main body |
| `includeTags` | `string[]` | — | Only keep these tags/selectors |
| `excludeTags` | `string[]` | — | Drop these tags/selectors |
| `waitFor` | `number` | — | Milliseconds to wait for JS to render |
| `actions` | `array` | — | Browser interactions before scraping |
| `maxAge` | `number` | — | Accept cached content up to this many ms old |
| `timeout` | `number` | — | Request timeout in milliseconds |

### Structured JSON

```javascript
const doc = await firecrawl.scrape('https://firecrawl.dev', {
  formats: [{
    type: 'json',
    prompt: 'Extract the company mission statement',
  }],
});
console.log(doc.json);
```

## Crawl

Traverse a whole site and scrape every discovered page.

```javascript
const job = await firecrawl.crawl('https://docs.firecrawl.dev', {
  limit: 100,
  scrapeOptions: { formats: ['markdown'] },
});
for (const page of job.data) {
  console.log(page.metadata.sourceURL);
}
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` **(required)** | `string` | — | Starting URL |
| `limit` | `number` | — | Max pages to crawl |
| `maxDiscoveryDepth` | `number` | — | Link levels deep to follow |
| `includePaths` | `string[]` | — | Only crawl matching paths |
| `excludePaths` | `string[]` | — | Skip matching paths |
| `scrapeOptions` | `object` | — | Per-page scrape options |

### Async crawl jobs

```javascript
const started = await firecrawl.startCrawl('https://docs.firecrawl.dev', { limit: 500 });
let status = await firecrawl.getCrawlStatus(started.id);
while (!['completed', 'failed'].includes(status.status)) {
  status = await firecrawl.getCrawlStatus(started.id);
}
```

## Map

Discover a site's URLs without scraping content.

```javascript
const res = await firecrawl.map('https://docs.firecrawl.dev', { limit: 100 });
for (const link of res.links) {
  console.log(link.url);
}
```

Key parameters: `url`, `search` (filter URLs by keyword), `limit`.

## Search

Search the web by query, optionally scraping results in the same call.

```javascript
const res = await firecrawl.search('best open source web scrapers', {
  limit: 5,
  sources: ['web'],
  scrapeOptions: { formats: ['markdown'] },
});
for (const item of res.web ?? []) {
  console.log(item.title, item.url);
}
```

Key parameters: `query`, `limit`, `sources` (`web`/`news`/`images`), `tbs`
(time filter), `location`, `scrapeOptions`.

## Extract

Pull structured data from one or many URLs (wildcards allowed) using an LLM.

```javascript
const schema = {
  type: 'object',
  properties: { mission: { type: 'string' } },
  required: ['mission'],
};

const res = await firecrawl.extract({
  urls: ['https://firecrawl.dev'],
  prompt: 'Extract the company mission',
  schema,
});
console.log(res.data);
```

Key parameters: `urls` (wildcards like `example.com/*`), `prompt`, `schema`,
`enableWebSearch`.

## Batch Scrape

Scrape many known URLs efficiently.

```javascript
const started = await firecrawl.startBatchScrape(['https://a.com', 'https://b.com'], {
  options: { formats: ['markdown'] },
});
const status = await firecrawl.getBatchScrapeStatus(started.id);
```

## Concurrency

The client is async by default — run independent calls in parallel:

```javascript
const urls = ['https://a.com', 'https://b.com'];
const results = await Promise.allSettled(
  urls.map((u) => firecrawl.scrape(u, { formats: ['markdown'] }))
);
```

## Error Handling

```javascript
try {
  const doc = await firecrawl.scrape('https://example.com', { formats: ['markdown'] });
} catch (err) {
  console.error('Scrape failed:', err.message);
}
```

For the canonical, always-current reference, see the
[Firecrawl Node SDK docs](https://docs.firecrawl.dev/sdks/node).
