---
name: api
description: "Exa search API (exa_py) — web search, content extraction, and Q&A built for AI agents"
metadata:
  languages: "python"
  versions: "2.14.0"
  revision: 1
  updated-on: "2026-06-25"
  source: community
  tags: "exa,search,retrieval,ai-agents,web,rag,contents"
---

# Exa Python SDK (`exa_py`)

Exa is a search engine built for AIs. Three core calls cover ~90% of work:
`search` (find pages), `get_contents` (extract clean content from URLs), and
`answer` (LLM answer grounded in search results).

## Install & auth

```bash
pip install exa-py
```

```python
import os
from exa_py import Exa

exa = Exa(api_key=os.environ["EXA_API_KEY"])   # get a key: https://dashboard.exa.ai/api-keys
```

## search — `POST /search`

Find pages. Content params (`text`/`highlights`/`summary`) MUST be nested under `contents`.

```python
# Recommended for agent workflows: highlights return ~10x fewer tokens than full text
res = exa.search(
    "latest breakthroughs in LLM reasoning",
    type="auto",                 # default. "fast"/"instant" = lower latency; "deep" = multi-step
    num_results=5,
    contents={"highlights": True},
)
for r in res.results:
    print(r.title, r.url, r.highlights)   # r.id == r.url; pass r.id to get_contents
```

Common params (all snake_case in the Python SDK, **including dict keys**):
`query` (required), `type`, `num_results` (1-100, default 10), `category`
(`"company"`, `"people"`, `"research paper"`, `"news"`, `"personal site"`,
`"financial report"`), `include_domains`, `exclude_domains`,
`start_published_date`, `end_published_date`.

Contents modes (nest under `contents`): `text` (full page markdown), `highlights`
(key excerpts — prefer for agents), `summary` (LLM summary). Combine freely.

## get_contents — `POST /contents`

Extract clean content from any URL (handles JS-rendered pages + PDFs). Here
`text`/`highlights`/`summary` are **top-level** (NOT nested — opposite of `/search`).

```python
out = exa.get_contents(
    ["https://example.com"],                  # also accepts result IDs from search()
    text={"max_characters": 8000},
    highlights={"query": "funding and revenue"},
)
# CRITICAL: returns HTTP 200 even when individual URLs fail — always check statuses
for s in out.statuses:
    if s.status == "error":
        print("failed", s.id, s.error.tag)    # e.g. CRAWL_TIMEOUT, CRAWL_NOT_FOUND
```

Freshness via `max_age_hours`: omit = livecrawl only when no cache (recommended);
`0` = always livecrawl (fresh but slower); `-1` = cache only. Pair `max_age_hours=0`
with `livecrawl_timeout=15000` for slow sites.

## answer / stream_answer — `POST /answer`

LLM answer grounded in Exa results, with citations.

```python
ans = exa.answer("What is the population of Tokyo?", text=True)
print(ans.answer)
print([c.url for c in ans.citations])

for chunk in exa.stream_answer("...", text=True):   # streaming
    if chunk.content: print(chunk.content, end="")
```

Params: `query`, `text`, `system_prompt`, `output_schema` (JSON schema for structured output).

## Critical gotchas

- **`/search` nests content under `contents`; `/contents` keeps them top-level.** This is
  the #1 source of bugs. `exa.search("q", contents={"highlights": True})` vs
  `exa.get_contents(["url"], highlights=True)`.
- **Python SDK is snake_case everywhere — including inside option dicts.** Write
  `{"max_characters": 4000}`, not `{"maxCharacters": ...}`. Same for `num_results`,
  `max_age_hours`, `subpage_target`, `include_domains`, `output_schema`, etc.
- **`/contents` returns 200 even on per-URL failure.** Always iterate `statuses`.
- **Prefer `highlights` over `text` for agents** — ~10x fewer tokens, most relevant excerpts.
- **Deprecated — do not use:** `use_autoprompt`/`use_autoprompt=True` (no-op),
  `num_sentences`, `highlights_per_url`, `livecrawl="always"` (use `max_age_hours=0`),
  `tokens_num`, and the whole `find_similar` method. `type="neural"` is legacy — use `"auto"`.
- **`category="company"` / `"people"` disable filters.** `exclude_domains`,
  `start_published_date`, `end_published_date` are unsupported and return HTTP 400.
- **Rate limits (QPS):** `/search` 10, `/contents` 100, `/answer` 10.

## Raw HTTP (no SDK)

```bash
curl -X POST https://api.exa.ai/search \
  -H "x-api-key: $EXA_API_KEY" -H "Content-Type: application/json" \
  -d '{"query": "...", "contents": {"highlights": true}}'
```
