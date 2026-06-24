---
name: api
description: "Exa search API (exa-js) — web search, content extraction, and Q&A built for AI agents"
metadata:
  languages: "javascript"
  versions: "2.14.0"
  revision: 1
  updated-on: "2026-06-25"
  source: community
  tags: "exa,search,retrieval,ai-agents,web,rag,contents"
---

# Exa JavaScript/TypeScript SDK (`exa-js`)

Exa is a search engine built for AIs. Three core calls cover ~90% of work:
`search` (find pages), `getContents` (extract clean content from URLs), and
`answer` (LLM answer grounded in search results).

## Install & auth

```bash
npm install exa-js
```

```javascript
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);   // get a key: https://dashboard.exa.ai/api-keys
```

## search — `POST /search`

Find pages. Content params (`text`/`highlights`/`summary`) MUST be nested under `contents`.

```javascript
// Recommended for agent workflows: highlights return ~10x fewer tokens than full text
const res = await exa.search("latest breakthroughs in LLM reasoning", {
  type: "auto",                 // default. "fast"/"instant" = lower latency; "deep" = multi-step
  numResults: 5,
  contents: { highlights: true },
});
for (const r of res.results) {
  console.log(r.title, r.url, r.highlights);   // r.id === r.url; pass r.id to getContents
}
```

Common params (camelCase): `query` (required), `type`, `numResults` (1-100, default 10),
`category` (`"company"`, `"people"`, `"research paper"`, `"news"`, `"personal site"`,
`"financial report"`), `includeDomains`, `excludeDomains`, `startPublishedDate`,
`endPublishedDate`.

Contents modes (nest under `contents`): `text` (full page markdown), `highlights`
(key excerpts — prefer for agents), `summary` (LLM summary). Combine freely.

## getContents — `POST /contents`

Extract clean content from any URL (handles JS-rendered pages + PDFs). Here
`text`/`highlights`/`summary` are **top-level** (NOT nested — opposite of `/search`).

```javascript
const out = await exa.getContents(["https://example.com"], {   // also accepts result IDs from search()
  text: { maxCharacters: 8000 },
  highlights: { query: "funding and revenue" },
});
// CRITICAL: returns HTTP 200 even when individual URLs fail — always check statuses
for (const s of out.statuses) {
  if (s.status === "error") console.log("failed", s.id, s.error?.tag);  // e.g. CRAWL_TIMEOUT
}
```

Freshness via `maxAgeHours`: omit = livecrawl only when no cache (recommended);
`0` = always livecrawl (fresh but slower); `-1` = cache only. Pair `maxAgeHours: 0`
with `livecrawlTimeout: 15000` for slow sites.

## answer / streamAnswer — `POST /answer`

LLM answer grounded in Exa results, with citations.

```javascript
const ans = await exa.answer("What is the population of Tokyo?", { text: true });
console.log(ans.answer);
console.log(ans.citations.map((c) => c.url));

for await (const chunk of exa.streamAnswer("...", { text: true })) {   // streaming
  if (chunk.content) process.stdout.write(chunk.content);
  if (chunk.citations) console.log("\ncitations:", chunk.citations);
}
```

Params: `query`, `text`, `systemPrompt`, `outputSchema` (JSON schema for structured output).

## Critical gotchas

- **`/search` nests content under `contents`; `/contents` keeps them top-level.** This is
  the #1 source of bugs. `exa.search("q", { contents: { highlights: true } })` vs
  `exa.getContents(["url"], { highlights: true })`.
- **JS SDK uses camelCase** (`numResults`, `maxCharacters`, `maxAgeHours`, `subpageTarget`,
  `includeDomains`, `outputSchema`, ...). Raw JSON/cURL also uses camelCase.
- **`/contents` returns 200 even on per-URL failure.** Always iterate `statuses`.
- **Prefer `highlights` over `text` for agents** — ~10x fewer tokens, most relevant excerpts.
- **Deprecated — do not use:** `useAutoprompt` (no-op), `numSentences`, `highlightsPerUrl`,
  `livecrawl: "always"` (use `maxAgeHours: 0`), `tokensNum`, and the `findSimilar` method.
  `type: "neural"` is legacy — use `"auto"`.
- **`category: "company"` / `"people"` disable filters.** `excludeDomains`,
  `startPublishedDate`, `endPublishedDate` are unsupported and return HTTP 400.
- **Rate limits (QPS):** `/search` 10, `/contents` 100, `/answer` 10.

## Raw HTTP (no SDK)

```bash
curl -X POST https://api.exa.ai/search \
  -H "x-api-key: $EXA_API_KEY" -H "Content-Type: application/json" \
  -d '{"query": "...", "contents": {"highlights": true}}'
```
