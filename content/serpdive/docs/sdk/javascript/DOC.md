---
name: sdk
description: "Web search API for AI agents that returns extracted, answer-ready page content instead of links"
metadata:
  languages: "javascript,typescript"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-07-21"
  source: maintainer
  tags: "serpdive,search,web-search,ai,agents,rag,llm,mcp,tavily-alternative"
---
# SERPdive TypeScript SDK

Web search built for AI agents. You send a question, the API returns the
sentences that answer it, already extracted from the live pages, sized for a
context window. There is no list of links to fetch and no scraping loop to
maintain.

On a public 1,000-question benchmark judged blind by an independent model,
SERPdive wins 60.7% of decided duels against Tavily's default search while
returning 20.2% fewer tokens (1,001 vs 1,255 on average), at comparable
latency. The harness, prompts and per-question results are public and the run
can be replayed: https://github.com/edendalexis/serpdive-benchmark

## Install

```bash
npm install serpdive
```

Zero runtime dependencies, ESM and CJS, types included.

## Authentication

Create a key at https://serpdive.com/dashboard/keys. Every account gets 1,000
free credits per month, no card required. The SDK reads `SERPDIVE_API_KEY`
from the environment when no key is passed.

## Quickstart

```ts
import { SerpDive } from "serpdive";

const client = new SerpDive(); // or new SerpDive({ apiKey: "sd_live_..." })

const response = await client.search("what changed in the EU AI Act this month");

for (const result of response.results) {
  console.log(result.title, result.url);
  console.log(result.content); // extracted page content, not a snippet
}
```

## Parameters

`search(query, options?)`

| Option | Type | Description |
|---|---|---|
| `model` | `"krill"` \| `"mako"` \| `"moby"` | Retrieval depth. `mako` (default) returns the fact-carrying sentences of each source. `moby` returns the full readable content of every page. `krill` is the free tier: unlimited under fair use, the smallest useful payload, one request at a time, at low priority, with no written answer. Unknown values fall back to `mako`. |
| `answer` | `boolean` | Opt-in written answer built from the sources: concise on Mako, detailed with `[n]` citations on Moby. Included in the price, never extra credits; adds a few hundred milliseconds. |
| `maxResults` | `number`, 1-10 | Hard cap on delivered results, keeping the best-ranked ones. Trims the response and the downstream token bill, but does not speed up the search: the engine always does its full read. Omit it to get everything considered relevant. Sent as `max_results`. |

The query is capped at 300 characters; longer queries are truncated, not
rejected.

**Localization is automatic.** The query's language decides where the search
runs: a German query searches the German-language web, a Japanese one the
Japanese web, wherever the caller is. There is no country option.

## Response

```ts
response.query            // your query, echoed untouched
response.model            // "krill", "mako" or "moby"
response.response_time_ms // wall-clock time in milliseconds
response.answer           // only when answer: true, may be null
response.results          // SearchResult[], best first
```

Response fields keep the API's own names verbatim (snake_case). Each
`SearchResult` has `url`, `title`, `content` (the extraction) and `date` when a
publication date is known, always ISO `YYYY-MM-DD`.

Results are real page extractions only: a source that could not be read is
simply absent, with no snippet padding and no placeholders. Tracking
parameters are stripped from URLs, so what you cite is clean.

## Timeouts

Mako answers in a few seconds. Moby reads whole pages and can take
substantially longer on heavy sources. Use a generous client timeout; 80
seconds is what the official playground uses.

```ts
const client = new SerpDive({ timeoutMs: 80_000 });
```

## Errors

Every failure throws a typed error carrying a stable machine-readable code.

```ts
import {
  SerpDive,
  AuthenticationError,
  InvalidRequestError,
  RateLimitError,
  QuotaExceededError,
  ServerError,
} from "serpdive";

try {
  const response = await client.search("...");
} catch (err) {
  if (err instanceof RateLimitError) {
    // back off and retry
  }
}
```

A failed search is never billed.

## Vercel AI SDK

```ts
import { tool } from "ai";
import { z } from "zod";
import { SerpDive } from "serpdive";

const client = new SerpDive();

export const webSearch = tool({
  description: "Search the live web and return extracted, answer-ready content.",
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const { results } = await client.search(query, { maxResults: 5 });
    return results.map((r) => ({ url: r.url, title: r.title, content: r.content }));
  },
});
```

## Credits

One Mako search costs 1 credit, one Moby search 1.5, and a Krill search costs nothing — it is free and unlimited under fair use. Pay as you go is $5 per
1,000 credits at the launch rate. The 1,000 monthly free credits require no
card.

## Related

- API reference: https://serpdive.com/docs
- Agent-readable docs: https://serpdive.com/llms.txt
- Hosted MCP server: https://mcp.serpdive.com
- Benchmark: https://github.com/edendalexis/serpdive-benchmark
