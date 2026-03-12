---
name: sdk
description: "Web search API for AI agents with search, extract, crawl, map, and research endpoints"
metadata:
  languages: "python"
  versions: "0.7.23"
  revision: 1
  updated-on: "2026-03-11"
  source: maintainer
  tags: "tavily,search,extract,crawl,research,ai,agents,rag,web-search,web-scraping"
---
# Tavily Python SDK

Web search API built for AI agents and RAG pipelines. Provides search, extract, crawl, map, and research through a single SDK.

**Package:** `tavily-python` on PyPI
**Repo:** github.com/tavily-ai/tavily-python

## Installation

```bash
pip install tavily-python
```

If using `uv`, you can add the package to your project with:
```bash
uv add tavily-python
```

## Initialization

Set `TAVILY_API_KEY` in your environment, or pass it directly.

### Synchronous Client

```python
from tavily import TavilyClient

client = TavilyClient(api_key="tvly-YOUR_API_KEY")
```

### Asynchronous Client

```python
from tavily import AsyncTavilyClient

client = AsyncTavilyClient(api_key="tvly-YOUR_API_KEY")
```

### Project Tracking

Attach a project ID to organize usage across projects:

```python
client = TavilyClient(api_key="tvly-YOUR_API_KEY", project_id="my-project")
```

Or set `TAVILY_PROJECT` environment variable.

## Search

The core endpoint. Returns ranked web results with content snippets.

```python
response = client.search("latest developments in quantum computing")
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` **(required)** | `str` | — | Search query (keep under 400 chars) |
| `search_depth` | `str` | `"basic"` | `"ultra-fast"`, `"fast"`, `"basic"`, or `"advanced"` |
| `topic` | `str` | `"general"` | `"general"`, `"news"`, or `"finance"` |
| `max_results` | `int` | `5` | Number of results (0–20) |
| `chunks_per_source` | `int` | `3` | Chunks per result (1–3, only with `"fast"` or `"advanced"` depth) |
| `include_answer` | `bool`/`str` | `False` | `True`/`"basic"` for quick answer, `"advanced"` for detailed |
| `include_raw_content` | `bool`/`str` | `False` | `True`/`"markdown"` for markdown, `"text"` for plain text |
| `include_images` | `bool` | `False` | Include query-related images |
| `include_image_descriptions` | `bool` | `False` | AI-generated descriptions for images |
| `include_favicon` | `bool` | `False` | Favicon URL per result |
| `include_domains` | `list[str]` | `[]` | Restrict to specific domains (max 300, supports wildcards like `*.com`) |
| `exclude_domains` | `list[str]` | `[]` | Exclude specific domains (max 150) |
| `time_range` | `str` | — | `"day"`, `"week"`, `"month"`, `"year"` |
| `start_date` | `str` | — | Filter from date (`YYYY-MM-DD`) |
| `end_date` | `str` | — | Filter until date (`YYYY-MM-DD`) |
| `country` | `str` | — | Boost results from a country (general topic only) |
| `auto_parameters` | `bool` | `False` | Auto-configure params based on query intent (may upgrade depth) |
| `exact_match` | `bool` | `False` | Require exact quoted phrases in results |
| `include_usage` | `bool` | `False` | Include credit usage info in response |

**Search depth tradeoffs:**

| Depth | Latency | Content Type | Credits |
|-------|---------|--------------|---------|
| `ultra-fast` | Lowest | NLP content summary | 1 |
| `fast` | Low | Reranked chunks | 1 |
| `basic` | Medium | NLP content summary | 1 |
| `advanced` | Higher | Reranked chunks | 2 |

### Response

```python
{
    "query": "latest developments in quantum computing",
    "results": [
        {
            "title": "...",
            "url": "https://...",
            "content": "Most relevant snippet...",
            "score": 0.99,
            "raw_content": "...",         # if include_raw_content
            "published_date": "...",       # if topic="news"
            "favicon": "...",             # if include_favicon
        }
    ],
    "answer": "...",          # if include_answer
    "images": [...],          # if include_images
    "response_time": 1.09,
    "request_id": "...",
    "usage": {"credits": 1}  # if include_usage
}
```

### Advanced Search Example

```python
response = client.search(
    query="How many countries use Daylight Saving Time?",
    search_depth="advanced",
    max_results=10,
    include_answer="advanced",
    include_raw_content=True,
    chunks_per_source=3
)

print(response["answer"])
for result in response["results"]:
    print(f"{result['title']} ({result['score']:.2f})")
    print(f"  {result['url']}")
```

### Domain Filtering

```python
# Restrict to specific sources
response = client.search(
    query="CEO background at Google",
    include_domains=["linkedin.com/in"]
)

# Exclude irrelevant domains
response = client.search(
    query="US economy trends",
    exclude_domains=["espn.com", "vogue.com"]
)
```

### News Search

```python
response = client.search(
    query="AI regulation updates",
    topic="news",
    time_range="week",
    max_results=10
)

for result in response["results"]:
    print(f"{result['title']} - {result.get('published_date', 'N/A')}")
```

## Extract

Extract content from specific URLs. Returns cleaned markdown or plain text.

```python
response = client.extract(urls=["https://en.wikipedia.org/wiki/Quantum_computing"])
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `urls` **(required)** | `list[str]` | — | URLs to extract (max 20) |
| `extract_depth` | `str` | `"basic"` | `"basic"` or `"advanced"` (JS-heavy pages, tables) |
| `format` | `str` | `"markdown"` | `"markdown"` or `"text"` |
| `query` | `str` | — | Rerank chunks by relevance to this query |
| `chunks_per_source` | `int` | `3` | Chunks per URL (1–5, requires `query`) |
| `include_images` | `bool` | `False` | Include extracted image URLs |
| `include_favicon` | `bool` | `False` | Favicon URL per result |
| `timeout` | `float` | — | Timeout in seconds (1.0–60.0) |
| `include_usage` | `bool` | `False` | Include credit usage info in response |

### Example with Query Filtering

```python
response = client.extract(
    urls=[
        "https://en.wikipedia.org/wiki/FA_Cup",
        "https://en.wikipedia.org/wiki/UEFA_Champions_League"
    ],
    query="past champions",
    chunks_per_source=2,
    extract_depth="advanced"
)

for result in response["results"]:
    print(f"URL: {result['url']}")
    print(f"Content: {result['raw_content'][:200]}...")

for failed in response["failed_results"]:
    print(f"Failed: {failed['url']} - {failed['error']}")
```

## Crawl

Intelligently traverse a website and extract content from discovered pages.

```python
response = client.crawl(
    url="https://docs.tavily.com",
    instructions="Find all pages about the Python SDK"
)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` **(required)** | `str` | — | Starting URL |
| `max_depth` | `int` | `1` | Levels deep to crawl (1–5, each level increases time exponentially) |
| `max_breadth` | `int` | `20` | Max links to follow per page (1–500) |
| `limit` | `int` | `50` | Total max pages to crawl |
| `instructions` | `str` | — | Natural language guidance to focus the crawl |
| `chunks_per_source` | `int` | `3` | Chunks per page (1–5, requires `instructions`) |
| `select_paths` | `list[str]` | — | Regex patterns for paths to include |
| `exclude_paths` | `list[str]` | — | Regex patterns for paths to exclude |
| `select_domains` | `list[str]` | — | Regex patterns for domains to include |
| `exclude_domains` | `list[str]` | — | Regex patterns for domains to exclude |
| `allow_external` | `bool` | `True` | Include links to external domains |
| `extract_depth` | `str` | `"basic"` | `"basic"` or `"advanced"` |
| `format` | `str` | `"markdown"` | `"markdown"` or `"text"` |
| `include_images` | `bool` | `False` | Include extracted image URLs |
| `include_favicon` | `bool` | `False` | Favicon URL per result |
| `timeout` | `float` | `150` | Max wait time in seconds (10–150) |
| `include_usage` | `bool` | `False` | Include credit usage info in response |

### Focused Crawl Example

```python
response = client.crawl(
    url="https://docs.tavily.com",
    max_depth=2,
    limit=100,
    instructions="Find all pages about the Python SDK",
    select_paths=["/docs/.*", "/api/.*"],
    extract_depth="advanced"
)

for page in response["results"]:
    print(f"{page['url']}: {len(page['raw_content'])} chars")
```

## Map

Discover site structure without extracting content. Returns a list of URLs.

```python
response = client.map(
    url="https://docs.tavily.com",
    instructions="Find all pages on the Python SDK"
)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` **(required)** | `str` | — | Starting URL |
| `max_depth` | `int` | `1` | Levels deep to map (1–5) |
| `max_breadth` | `int` | `20` | Max links per page (1–500) |
| `limit` | `int` | `50` | Total max URLs |
| `instructions` | `str` | — | Focus the mapping with natural language |
| `select_paths` | `list[str]` | — | Regex path patterns to include |
| `exclude_paths` | `list[str]` | — | Regex path patterns to exclude |
| `select_domains` | `list[str]` | — | Regex patterns for domains to include |
| `exclude_domains` | `list[str]` | — | Regex patterns for domains to exclude |
| `allow_external` | `bool` | `True` | Include links to external domains |
| `timeout` | `float` | `150` | Max wait time in seconds (10–150) |
| `include_usage` | `bool` | `False` | Include credit usage info in response |

### Response

```python
{
    "base_url": "https://docs.tavily.com",
    "results": [
        "https://docs.tavily.com/sdk/python/reference",
        "https://docs.tavily.com/sdk/python/quick-start"
    ],
    "response_time": 8.43,
    "request_id": "..."
}
```

**Tip:** Use Map first to discover structure, then Crawl with discovered paths for focused extraction.

## Research

End-to-end AI-powered research with automatic source gathering and synthesis. Research tasks are asynchronous — start with `research()`, poll with `get_research()`.

```python
import time

result = client.research(
    input="Analyze competitive landscape for AI search APIs in 2026",
    model="pro"
)
request_id = result["request_id"]

response = client.get_research(request_id)
while response["status"] not in ["completed", "failed"]:
    time.sleep(10)
    response = client.get_research(request_id)

print(response["content"])
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `input` **(required)** | `str` | — | The research topic or question |
| `model` | `str` | `"auto"` | `"mini"` (focused), `"pro"` (comprehensive), or `"auto"` |
| `stream` | `bool` | `False` | Enable streaming responses (SSE) |
| `output_schema` | `dict` | — | JSON Schema for structured output |
| `citation_format` | `str` | `"numbered"` | `"numbered"`, `"mla"`, `"apa"`, or `"chicago"` |

### Streaming

```python
stream = client.research(
    input="Latest developments in quantum computing",
    model="pro",
    stream=True
)

for chunk in stream:
    print(chunk.decode('utf-8'))
```

**Credits:** 4–110 per request (mini), 15–250 per request (pro).

## Async Usage

Use `AsyncTavilyClient` for concurrent requests:

```python
import asyncio
from tavily import AsyncTavilyClient

client = AsyncTavilyClient(api_key="tvly-YOUR_API_KEY")

async def parallel_search():
    queries = ["latest AI trends", "quantum computing breakthroughs"]
    responses = await asyncio.gather(
        *(client.search(q) for q in queries),
        return_exceptions=True
    )
    for response in responses:
        if isinstance(response, Exception):
            print(f"Failed: {response}")
        else:
            print(f"Results: {len(response['results'])}")

asyncio.run(parallel_search())
```

## Search Then Extract Pattern

A common RAG pattern: search to find URLs, then extract full content from the best ones.

```python
import asyncio
from tavily import AsyncTavilyClient

client = AsyncTavilyClient(api_key="tvly-YOUR_API_KEY")

async def search_then_extract(topic):
    # 1. Search for relevant URLs
    search_response = await client.search(
        query=topic,
        search_depth="advanced",
        max_results=10
    )

    # 2. Filter by relevance score
    urls = [
        r["url"] for r in search_response["results"]
        if r["score"] > 0.5
    ][:20]

    # 3. Extract full content
    extract_response = await client.extract(
        urls=urls,
        query=topic,
        chunks_per_source=3,
        extract_depth="advanced"
    )

    return extract_response["results"]

results = asyncio.run(search_then_extract("AI in healthcare diagnostics"))
```

## Error Handling

```python
from tavily import TavilyClient, MissingAPIKeyError, InvalidAPIKeyError, UsageLimitExceededError

try:
    client = TavilyClient(api_key="tvly-YOUR_API_KEY")
    response = client.search("test query")
except MissingAPIKeyError:
    print("API key not provided")
except InvalidAPIKeyError:
    print("Invalid API key")
except UsageLimitExceededError:
    print("API credit limit exceeded")
```
