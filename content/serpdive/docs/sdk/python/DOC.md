---
name: sdk
description: "Web search API for AI agents that returns extracted, answer-ready page content instead of links"
metadata:
  languages: "python"
  versions: "0.1.1"
  revision: 1
  updated-on: "2026-07-21"
  source: maintainer
  tags: "serpdive,search,web-search,ai,agents,rag,llm,mcp,tavily-alternative"
---
# SERPdive Python SDK

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
pip install serpdive
```

## Authentication

Create a key at https://serpdive.com/dashboard/keys. Every account gets 1,000
free credits per month, no card required. The SDK reads `SERPDIVE_API_KEY`
from the environment when no key is passed.

```bash
export SERPDIVE_API_KEY="sd_live_..."
```

## Quickstart

```python
from serpdive import SerpDive

client = SerpDive()  # or SerpDive(api_key="sd_live_...")

response = client.search("what changed in the EU AI Act this month")

for result in response.results:
    print(result.title, result.url)
    print(result.content)  # extracted page content, not a snippet
```

## Async

```python
import asyncio
from serpdive import AsyncSerpDive

async def main():
    async with AsyncSerpDive() as client:
        response = await client.search("who won the 2026 Champions League final")
        print(response.results[0].content)

asyncio.run(main())
```

## Parameters

`search(query, *, model=None, answer=None, max_results=None, **extra)`

| Parameter | Type | Description |
|---|---|---|
| `query` | `str`, required | The question, phrased as you would ask it. Up to 300 characters; longer queries are truncated, not rejected. |
| `model` | `"krill"` \| `"mako"` \| `"moby"` | Retrieval depth. `mako` (default) returns the fact-carrying sentences of each source. `moby` returns the full readable content of every page. `krill` is the free tier: unlimited under fair use, the smallest useful payload, one request at a time, at low priority, with no written answer. Unknown values fall back to `mako`. |
| `answer` | `bool` | Opt-in written answer built from the sources: concise on Mako, detailed with `[n]` citations on Moby. Included in the price, never extra credits; adds a few hundred milliseconds. |
| `max_results` | `int`, 1-10 | Hard cap on delivered results, keeping the best-ranked ones. Trims the response and the downstream token bill, but does not speed up the search: the engine always does its full read. Omit it to get everything considered relevant. |

**Localization is automatic.** The query's language decides where the search
runs: a German query searches the German-language web, a Japanese one the
Japanese web, wherever the caller is. There is no country parameter.

## Response

```python
response.query             # your query, echoed untouched
response.model             # "krill", "mako" or "moby"
response.response_time_ms  # wall-clock time in milliseconds
response.answer            # only when answer=True, may be None
response.results           # list[SearchResult], best first
```

Each `SearchResult` has `url`, `title`, `content` (the extraction) and `date`
when a publication date is known, always ISO `YYYY-MM-DD`.

Results are real page extractions only: a source that could not be read is
simply absent, with no snippet padding and no placeholders. Tracking
parameters are stripped from URLs, so what you cite is clean.

## Timeouts

Mako answers in a few seconds. Moby reads whole pages and can take
substantially longer on heavy sources. Use a generous client timeout; 80
seconds is what the official playground uses.

```python
client = SerpDive(timeout=80.0)
```

## Errors

Every failure raises a typed exception carrying a stable machine-readable
code.

```python
from serpdive import (
    SerpDive,
    AuthenticationError,
    InvalidRequestError,
    RateLimitError,
    QuotaExceededError,
    ServerError,
)

try:
    response = client.search("...")
except RateLimitError:
    ...   # back off and retry
except QuotaExceededError:
    ...   # monthly credits exhausted
except AuthenticationError:
    ...   # missing, expired or revoked key
```

A failed search is never billed.

## Credits

One Mako search costs 1 credit, one Moby search 1.5, and a Krill search costs nothing — it is free and unlimited under fair use. Pay as you go is $5 per
1,000 credits at the launch rate. The 1,000 monthly free credits require no
card.

## Related

- API reference: https://serpdive.com/docs
- Agent-readable docs: https://serpdive.com/llms.txt
- Hosted MCP server: https://mcp.serpdive.com
- Benchmark: https://github.com/edendalexis/serpdive-benchmark
