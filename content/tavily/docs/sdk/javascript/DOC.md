---
name: sdk
description: "Web search API for AI agents with search, extract, crawl, map, and research endpoints"
metadata:
  languages: "javascript"
  versions: "0.7.2"
  revision: 1
  updated-on: "2026-03-11"
  source: maintainer
  tags: "tavily,search,extract,crawl,research,ai,agents,rag,web-search,web-scraping"
---
# Tavily JavaScript SDK

Web search API built for AI agents and RAG pipelines. Provides search, extract, crawl, map, and research through a single SDK. The client is async by default.

**Package:** `@tavily/core` on npm
**Repo:** github.com/tavily-ai/tavily-js

## Installation

```bash
npm install @tavily/core
```

## Initialization

Set `TAVILY_API_KEY` in your environment, or pass it directly.

```javascript
const { tavily } = require("@tavily/core");

const client = tavily({ apiKey: "tvly-YOUR_API_KEY" });
```

Or with ES modules:

```javascript
import { tavily } from "@tavily/core";

const client = tavily({ apiKey: "tvly-YOUR_API_KEY" });
```

### Project Tracking

Attach a project ID to organize usage:

```javascript
const client = tavily({
  apiKey: "tvly-YOUR_API_KEY",
  projectId: "my-project"
});
```

Or set `TAVILY_PROJECT` environment variable.

## Search

The core endpoint. Returns ranked web results with content snippets.

```javascript
const response = await client.search("latest developments in quantum computing");
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` **(required)** | `string` | — | Search query (keep under 400 chars) |
| `searchDepth` | `string` | `"basic"` | `"ultra-fast"`, `"fast"`, `"basic"`, or `"advanced"` |
| `topic` | `string` | `"general"` | `"general"`, `"news"`, or `"finance"` |
| `maxResults` | `number` | `5` | Number of results (0–20) |
| `chunksPerSource` | `number` | `3` | Chunks per result (1–3, only with `"fast"` or `"advanced"` depth) |
| `includeAnswer` | `boolean`/`string` | `false` | `true`/`"basic"` for quick answer, `"advanced"` for detailed |
| `includeRawContent` | `boolean`/`string` | `false` | `true`/`"markdown"` for markdown, `"text"` for plain text |
| `includeImages` | `boolean` | `false` | Include query-related images |
| `includeImageDescriptions` | `boolean` | `false` | AI-generated descriptions for images |
| `includeFavicon` | `boolean` | `false` | Favicon URL per result |
| `includeDomains` | `string[]` | `[]` | Restrict to specific domains (max 300, supports wildcards like `*.com`) |
| `excludeDomains` | `string[]` | `[]` | Exclude specific domains (max 150) |
| `timeRange` | `string` | — | `"day"`, `"week"`, `"month"`, `"year"` |
| `startDate` | `string` | — | Filter from date (`YYYY-MM-DD`) |
| `endDate` | `string` | — | Filter until date (`YYYY-MM-DD`) |
| `country` | `string` | — | Boost results from a country (general topic only) |
| `autoParameters` | `boolean` | `false` | Auto-configure params based on query intent (may upgrade depth) |
| `exactMatch` | `boolean` | `false` | Require exact quoted phrases in results |
| `includeUsage` | `boolean` | `false` | Include credit usage info in response |

**Search depth tradeoffs:**

| Depth | Latency | Content Type | Credits |
|-------|---------|--------------|---------|
| `ultra-fast` | Lowest | NLP content summary | 1 |
| `fast` | Low | Reranked chunks | 1 |
| `basic` | Medium | NLP content summary | 1 |
| `advanced` | Higher | Reranked chunks | 2 |

### Response

```javascript
{
  query: "latest developments in quantum computing",
  results: [
    {
      title: "...",
      url: "https://...",
      content: "Most relevant snippet...",
      score: 0.99,
      rawContent: "...",          // if includeRawContent
      publishedDate: "...",       // if topic="news"
      favicon: "...",             // if includeFavicon
    }
  ],
  answer: "...",          // if includeAnswer
  images: [...],          // if includeImages
  responseTime: 1.09,
  requestId: "...",
  usage: { credits: 1 }  // if includeUsage
}
```

### Advanced Search Example

```javascript
const response = await client.search("How many countries use Daylight Saving Time?", {
  searchDepth: "advanced",
  maxResults: 10,
  includeAnswer: "advanced",
  includeRawContent: true,
  chunksPerSource: 3
});

console.log(response.answer);
for (const result of response.results) {
  console.log(`${result.title} (${result.score.toFixed(2)})`);
  console.log(`  ${result.url}`);
}
```

### Domain Filtering

```javascript
// Restrict to specific sources
const response = await client.search("CEO background at Google", {
  includeDomains: ["linkedin.com/in"]
});

// Exclude irrelevant domains
const response2 = await client.search("US economy trends", {
  excludeDomains: ["espn.com", "vogue.com"]
});
```

### News Search

```javascript
const response = await client.search("AI regulation updates", {
  topic: "news",
  timeRange: "week",
  maxResults: 10
});

for (const result of response.results) {
  console.log(`${result.title} - ${result.publishedDate || "N/A"}`);
}
```

## Extract

Extract content from specific URLs. Returns cleaned markdown or plain text.

```javascript
const response = await client.extract(["https://en.wikipedia.org/wiki/Quantum_computing"]);
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `urls` **(required)** | `string[]` | — | URLs to extract (max 20) |
| `extractDepth` | `string` | `"basic"` | `"basic"` or `"advanced"` (JS-heavy pages, tables) |
| `format` | `string` | `"markdown"` | `"markdown"` or `"text"` |
| `query` | `string` | — | Rerank chunks by relevance to this query |
| `chunksPerSource` | `number` | `3` | Chunks per URL (1–5, requires `query`) |
| `includeImages` | `boolean` | `false` | Include extracted image URLs |
| `includeFavicon` | `boolean` | `false` | Favicon URL per result |
| `timeout` | `number` | — | Timeout in seconds (1.0–60.0) |
| `includeUsage` | `boolean` | `false` | Include credit usage info in response |

### Example with Query Filtering

```javascript
const response = await client.extract(
  ["https://en.wikipedia.org/wiki/FA_Cup", "https://en.wikipedia.org/wiki/UEFA_Champions_League"],
  {
    query: "past champions",
    chunksPerSource: 2,
    extractDepth: "advanced"
  }
);

for (const result of response.results) {
  console.log(`URL: ${result.url}`);
  console.log(`Content: ${result.rawContent.slice(0, 200)}...`);
}

for (const failed of response.failedResults) {
  console.log(`Failed: ${failed.url} - ${failed.error}`);
}
```

## Crawl

Intelligently traverse a website and extract content from discovered pages.

```javascript
const response = await client.crawl("https://docs.tavily.com", {
  instructions: "Find all pages about the JavaScript SDK"
});
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` **(required)** | `string` | — | Starting URL |
| `maxDepth` | `number` | `1` | Levels deep to crawl (1–5, each level increases time exponentially) |
| `maxBreadth` | `number` | `20` | Max links to follow per page (1–500) |
| `limit` | `number` | `50` | Total max pages to crawl |
| `instructions` | `string` | — | Natural language guidance to focus the crawl |
| `chunksPerSource` | `number` | `3` | Chunks per page (1–5, requires `instructions`) |
| `selectPaths` | `string[]` | — | Regex patterns for paths to include |
| `excludePaths` | `string[]` | — | Regex patterns for paths to exclude |
| `selectDomains` | `string[]` | — | Regex patterns for domains to include |
| `excludeDomains` | `string[]` | — | Regex patterns for domains to exclude |
| `allowExternal` | `boolean` | `true` | Include links to external domains |
| `extractDepth` | `string` | `"basic"` | `"basic"` or `"advanced"` |
| `format` | `string` | `"markdown"` | `"markdown"` or `"text"` |
| `includeImages` | `boolean` | `false` | Include extracted image URLs |
| `includeFavicon` | `boolean` | `false` | Favicon URL per result |
| `timeout` | `number` | `150` | Max wait time in seconds (10–150) |
| `includeUsage` | `boolean` | `false` | Include credit usage info in response |

### Focused Crawl Example

```javascript
const response = await client.crawl("https://docs.tavily.com", {
  maxDepth: 2,
  limit: 100,
  instructions: "Find all pages about the JavaScript SDK",
  selectPaths: ["/docs/.*", "/api/.*"],
  excludePaths: ["/private/.*", "/admin/.*"],
  extractDepth: "advanced"
});

for (const page of response.results) {
  console.log(`${page.url}: ${page.rawContent.length} chars`);
}
```

## Map

Discover site structure without extracting content. Returns a list of URLs.

```javascript
const response = await client.map("https://docs.tavily.com", {
  instructions: "Find all pages on the JavaScript SDK"
});
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` **(required)** | `string` | — | Starting URL |
| `maxDepth` | `number` | `1` | Levels deep to map (1–5) |
| `maxBreadth` | `number` | `20` | Max links per page (1–500) |
| `limit` | `number` | `50` | Total max URLs |
| `instructions` | `string` | — | Focus the mapping with natural language |
| `selectPaths` | `string[]` | — | Regex path patterns to include |
| `excludePaths` | `string[]` | — | Regex path patterns to exclude |
| `selectDomains` | `string[]` | — | Regex patterns for domains to include |
| `excludeDomains` | `string[]` | — | Regex patterns for domains to exclude |
| `allowExternal` | `boolean` | `true` | Include links to external domains |
| `timeout` | `number` | `150` | Max wait time in seconds (10–150) |
| `includeUsage` | `boolean` | `false` | Include credit usage info in response |

### Response

```javascript
{
  baseUrl: "https://docs.tavily.com",
  results: [
    "https://docs.tavily.com/sdk/javascript/reference",
    "https://docs.tavily.com/sdk/javascript/quick-start"
  ],
  responseTime: 8.43,
  requestId: "..."
}
```

**Tip:** Use Map first to discover structure, then Crawl with discovered paths for focused extraction.

## Research

End-to-end AI-powered research with automatic source gathering and synthesis. Research tasks are asynchronous — start with `research()`, poll with `getResearch()`.

```javascript
const result = await client.research({
  input: "Analyze competitive landscape for AI search APIs in 2026",
  model: "pro"
});

const requestId = result.requestId;

let response = await client.getResearch(requestId);
while (!["completed", "failed"].includes(response.status)) {
  await new Promise(r => setTimeout(r, 10000));
  response = await client.getResearch(requestId);
}

console.log(response.content);
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `input` **(required)** | `string` | — | The research topic or question |
| `model` | `string` | `"auto"` | `"mini"` (focused), `"pro"` (comprehensive), or `"auto"` |
| `stream` | `boolean` | `false` | Enable streaming responses (SSE) |
| `outputSchema` | `object` | — | JSON Schema for structured output |
| `citationFormat` | `string` | `"numbered"` | `"numbered"`, `"mla"`, `"apa"`, or `"chicago"` |

**Credits:** 4–110 per request (mini), 15–250 per request (pro).

## Search Then Extract Pattern

A common RAG pattern: search to find URLs, then extract full content from the best ones.

```javascript
async function searchThenExtract(topic) {
  // 1. Search for relevant URLs
  const searchResponse = await client.search(topic, {
    searchDepth: "advanced",
    maxResults: 10
  });

  // 2. Filter by relevance score
  const urls = searchResponse.results
    .filter(r => r.score > 0.5)
    .map(r => r.url)
    .slice(0, 20);

  // 3. Extract full content
  const extractResponse = await client.extract(urls, {
    query: topic,
    chunksPerSource: 3,
    extractDepth: "advanced"
  });

  return extractResponse.results;
}

const results = await searchThenExtract("AI in healthcare diagnostics");
```

## Parallel Searches

Run multiple independent searches concurrently:

```javascript
const queries = ["latest AI trends", "quantum computing breakthroughs"];

const responses = await Promise.allSettled(
  queries.map(q => client.search(q))
);

for (const response of responses) {
  if (response.status === "fulfilled") {
    console.log(`Results: ${response.value.results.length}`);
  } else {
    console.log(`Failed: ${response.reason}`);
  }
}
```

## Error Handling

```javascript
try {
  const response = await client.search("test query");
} catch (error) {
  if (error.message.includes("API key")) {
    console.log("Invalid or missing API key");
  } else if (error.message.includes("rate limit")) {
    console.log("Rate limit exceeded, retry later");
  } else {
    console.log(`Error: ${error.message}`);
  }
}
```
