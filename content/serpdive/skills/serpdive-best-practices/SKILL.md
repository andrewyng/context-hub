---
name: serpdive-best-practices
description: "Give an agent live web knowledge with SERPdive: pick between the krill, mako and moby models, keep context small, wire it through REST, the SDKs or the hosted MCP server, and handle errors and credits correctly"
metadata:
  revision: 1
  updated-on: "2026-07-21"
  source: maintainer
  tags: "serpdive,search,web-search,ai,agents,rag,llm,mcp,context,tokens"
---

# SERPdive

SERPdive is a web search API for AI agents. It takes a question and returns
the sentences that answer it, already extracted from the live pages it read,
sized for a context window. It does not return a ranked list of links for the
agent to go fetch.

That difference is the whole design: the expensive part of "search the web" in
an agent loop is not the search, it is choosing URLs, fetching them, stripping
boilerplate and truncating to fit. SERPdive does that server side and bills it
as one call.

## When to reach for it

Use SERPdive when the agent needs facts from the current web: prices,
releases, filings, documentation, news, anything that postdates the model.

Do not use it to fetch one URL the agent already knows; that is a scraper's
job. It is also not a SERP API: it returns no rank positions, no ads and no
shopping boxes, so SEO tooling needs a different product.

## Two models, and how to choose

| Model | What it returns | Credits | Use it when |
|---|---|---|---|
| `mako` (default) | The fact-carrying sentences of each source | 1 | Almost always. Fast, and the smallest context footprint. |
| `krill` | The same, on a tighter budget — fewer sources, no written answer | **free** | Token budget matters more than depth, or you are building and do not want to spend. Unlimited under fair use, one request at a time, low priority. |
| `moby` | The full readable content of every page | 1.5 | The answer depends on document structure: long analyses, deep research, reading a spec end to end. |

Start with `mako`. Move a query to `moby` only when you can name what mako's
sentences are missing. Moby is slower and multiplies the tokens the model then
has to read, which is usually the real cost.

## Keeping context small

`max_results` (1-10) caps how many sources come back, keeping the best-ranked
ones. It trims the response and the downstream token bill, but it does not
speed up the search: the engine always does its full read either way.

A practical default for an agent loop is `mako` with `max_results` between 3
and 5. Omit `max_results` when recall matters more than context size.

## The written answer

`answer: true` adds a prose answer built from the sources: concise on mako,
detailed with `[n]` citations on moby. It is included in the price, never
extra credits, and adds a few hundred milliseconds.

Use it when the agent will surface an answer to a human. Skip it when the
agent does its own reasoning over the sources, since paying for prose the
model then rewrites is waste.

## Localization is automatic

The query's language decides where the search runs. A German query searches
the German-language web, a Japanese one the Japanese web, wherever the caller
is. There is no country parameter to set, so do not translate the user's query
into English before searching: doing so changes which web gets searched.

## Wiring it up

Four surfaces, same engine. Pick by where the agent lives.

- **REST**: `POST https://api.serpdive.com/v1/search`, `Authorization: Bearer sd_live_...`
- **SDKs**: `pip install serpdive`, `npm install serpdive`
- **Frameworks**: `langchain-serpdive`, `llama-index-tools-serpdive`
- **MCP**: hosted at `https://mcp.serpdive.com`, or `npx serpdive-mcp` for stdio-only clients

Full snippets are in [references/integrations.md](references/integrations.md).

## Errors and credits

Every failure returns a stable machine-readable code, and a failed search is
never billed. Retry on `rate_limit` with backoff; stop and surface the problem
on `invalid_api_key` and `quota_exceeded`, because retrying those never helps.

One mako search costs 1 credit, one moby search 1.5, and a krill search costs nothing — it is free and unlimited under fair use. Every account gets 1,000
free credits per month with no card, so an agent doing about 30 searches a day
stays inside the free tier indefinitely.

See [references/errors.md](references/errors.md) for the full list.

## Why it is worth measuring

Search API output is LLM input: every token it returns is billed again by the
model on every turn that reads it. On a public 1,000-question benchmark judged
blind by an independent model, SERPdive won 60.7% of decided duels against
Tavily's default search while returning 20.2% fewer tokens (1,001 vs 1,255 on
average), at comparable latency.

The harness, prompts, raw payloads and per-question verdicts are public, so
the run can be replayed with your own keys and your own judge:
https://github.com/edendalexis/serpdive-benchmark

Scope note, because an honest benchmark states its limits: the comparison is
against Tavily's default (basic) search, the tier in the same price class.
Tavily's advanced mode was not tested and no claim is made about it.
