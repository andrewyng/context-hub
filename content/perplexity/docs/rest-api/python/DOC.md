---
name: rest-api
description: "Perplexity - Search-Grounded LLM API (Sonar)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "perplexity,sonar,search,llm,citations,grounded-search,rag,api"
---

# Perplexity Sonar REST API (Python / httpx)

## Golden Rule

Every Sonar response is grounded in live web search results. **Always consume the `citations` array** returned alongside `choices` -- these URLs are the provenance chain for the generated text. If you discard citations you lose the primary value proposition of the API.

---

## Installation

```bash
pip install httpx
```

All examples in this document use **`httpx`** with `async`/`await`. No SDK or `requests` library is needed.

---

## Base URL

```
https://api.perplexity.ai
```

---

## Authentication

All requests require a **Bearer token** in the `Authorization` header. Obtain an API key from the [Perplexity API Settings](https://www.perplexity.ai/settings/api).

```python
headers = {
    "Authorization": "Bearer pplx-xxxxxxxxxxxxxxxxxxxx",
    "Content-Type": "application/json",
}
```

Store the key in an environment variable (`PERPLEXITY_API_KEY`) and load it at runtime:

```python
import os

API_KEY = os.environ["PERPLEXITY_API_KEY"]
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}
```

---

## Rate Limiting

Perplexity uses a **leaky-bucket** algorithm allowing short bursts while enforcing a sustained rate.

| Tier | Sonar RPM | Sonar Pro RPM |
|------|-----------|---------------|
| 0    | 50        | 50            |
| 1    | 50        | 50            |
| 2    | 100       | 100           |
| 3+   | Higher    | Higher        |

*RPM = requests per minute. Limits vary by model and tier. The Search API allows up to 50 req/s across all tiers.*

When you hit a limit the API returns **HTTP 429**. Implement exponential backoff with jitter:

```python
import asyncio
import random

async def backoff_request(client, url, headers, payload, max_retries=5):
    for attempt in range(max_retries):
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 429:
            return resp
        wait = (2 ** attempt) + random.uniform(0, 1)
        await asyncio.sleep(wait)
    raise Exception("Max retries exceeded")
```

---

## Models

| Model ID                 | Context Window | Best For                                      |
|--------------------------|----------------|-----------------------------------------------|
| `sonar`                  | 128 000 tokens | Fast, lightweight Q&A with citations          |
| `sonar-pro`              | 200 000 tokens | Complex multi-step queries, more citations     |
| `sonar-reasoning-pro`    | 128 000 tokens | Chain-of-thought reasoning with web grounding  |
| `sonar-deep-research`    | 128 000 tokens | Exhaustive multi-query research reports         |

### Pricing (per 1M tokens / per 1K requests)

| Model                 | Input Tokens | Output Tokens | Request Fee (medium context) |
|-----------------------|--------------|---------------|------------------------------|
| `sonar`               | $1           | $1            | $8                           |
| `sonar-pro`           | $3           | $15           | $10                          |
| `sonar-reasoning-pro` | $2           | $8            | $10                          |
| `sonar-deep-research` | $2           | $8            | varies                       |

*Request fees vary by `search_context_size` (low / medium / high). Citation tokens are no longer billed for standard Sonar and Sonar Pro.*

---

## Methods

### POST `/v1/sonar` -- Chat Completions

The primary endpoint. Sends a conversation to a Sonar model and receives a search-grounded completion with citations.

#### Minimal Example

```python
import httpx
import os
import asyncio

API_KEY = os.environ["PERPLEXITY_API_KEY"]
BASE_URL = "https://api.perplexity.ai"

async def chat():
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": "Be precise and cite sources."},
            {"role": "user", "content": "What are the latest advances in solid-state batteries?"},
        ],
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/v1/sonar",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()

        # The generated answer
        answer = data["choices"][0]["message"]["content"]
        print(answer)

        # Citations -- list of source URLs
        citations = data.get("citations", [])
        for i, url in enumerate(citations, 1):
            print(f"[{i}] {url}")

asyncio.run(chat())
```

#### Full Request Parameters

```python
payload = {
    # Required
    "model": "sonar-pro",                          # Model ID (see Models table)
    "messages": [                                   # Conversation history
        {"role": "system", "content": "..."},
        {"role": "user", "content": "..."},
    ],

    # Generation control
    "max_tokens": 4096,                             # 1 - 128000
    "temperature": 0.2,                             # 0.0 - 2.0
    "top_p": 0.9,                                   # 0.0 - 1.0
    "stop": ["\n\n"],                               # Stop sequences (string or list)
    "stream": False,                                # Enable streaming
    "stream_mode": "full",                          # "full" | "concise"

    # Search configuration
    "search_domain_filter": ["arxiv.org", "nature.com"],  # Restrict to these domains
    "search_recency_filter": "month",               # "hour" | "day" | "week" | "month" | "year"
    "search_after_date_filter": "01/01/2025",       # MM/DD/YYYY
    "search_before_date_filter": "03/17/2026",      # MM/DD/YYYY
    "search_language_filter": ["en"],                # ISO 639-1 codes
    "search_mode": "web",                           # "web" | "academic" | "sec"
    "disable_search": False,                        # Set True to skip web search

    # Web search options (object)
    "web_search_options": {
        "search_context_size": "medium",            # "low" | "medium" | "high"
    },

    # Response enrichment
    "return_images": False,                         # Include image results
    "return_related_questions": False,              # Include follow-up suggestions

    # Structured output
    "response_format": {
        "type": "text",                             # "text" or "json_schema"
    },
}
```

#### Response Shape

```json
{
  "id": "cmpl-xxxxxxxx",
  "model": "sonar-pro",
  "created": 1742169600,
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "content": "Solid-state batteries have seen breakthroughs in ..."
      }
    }
  ],
  "citations": [
    "https://www.nature.com/articles/s41586-025-example",
    "https://arxiv.org/abs/2025.12345"
  ],
  "search_results": [
    {
      "title": "Advances in Solid-State Battery Technology",
      "url": "https://www.nature.com/articles/s41586-025-example",
      "date": "2025-11-10",
      "snippet": "Recent developments show ..."
    }
  ],
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 310,
    "total_tokens": 352,
    "citation_tokens": 1200,
    "num_search_queries": 1
  }
}
```

Key fields in the response:

- **`choices[0].message.content`** -- The generated answer text.
- **`citations`** -- Ordered list of source URLs. In-text references like `[1]` map to this array by index.
- **`search_results`** -- Richer metadata per source (title, date, snippet).
- **`usage`** -- Token counts and search query counts for cost tracking.

#### Streaming Example

```python
import httpx
import os
import asyncio

API_KEY = os.environ["PERPLEXITY_API_KEY"]
BASE_URL = "https://api.perplexity.ai"

async def stream_chat():
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": "Explain quantum computing in simple terms."},
        ],
        "stream": True,
    }
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            f"{BASE_URL}/v1/sonar",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60.0,
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    chunk = line[6:]
                    if chunk == "[DONE]":
                        break
                    import json
                    data = json.loads(chunk)
                    delta = data["choices"][0].get("delta", {})
                    if "content" in delta:
                        print(delta["content"], end="", flush=True)
            print()  # newline after stream ends

asyncio.run(stream_chat())
```

#### Domain-Filtered Academic Search

```python
async def academic_search(query: str):
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "system", "content": "You are a research assistant. Cite all claims."},
            {"role": "user", "content": query},
        ],
        "search_domain_filter": ["arxiv.org", "scholar.google.com", "pubmed.ncbi.nlm.nih.gov"],
        "search_recency_filter": "year",
        "search_mode": "academic",
        "return_related_questions": True,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/v1/sonar",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "answer": data["choices"][0]["message"]["content"],
            "citations": data.get("citations", []),
            "related": data.get("related_questions", []),
        }
```

#### Structured JSON Output

```python
async def structured_query():
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": "List the top 3 EV companies by 2025 market cap."},
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "ev_companies",
                "schema": {
                    "type": "object",
                    "properties": {
                        "companies": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "market_cap_usd": {"type": "string"},
                                    "country": {"type": "string"},
                                },
                                "required": ["name", "market_cap_usd", "country"],
                            },
                        }
                    },
                    "required": ["companies"],
                },
            },
        },
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/v1/sonar",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        import json
        return json.loads(data["choices"][0]["message"]["content"])
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning            | Action                                          |
|------|--------------------|--------------------------------------------------|
| 200  | Success            | Parse response normally                          |
| 400  | Bad Request        | Check payload structure and parameter values     |
| 401  | Authentication     | Verify API key is valid and correctly set        |
| 403  | Permission Denied  | Check tier access for the requested model        |
| 404  | Not Found          | Verify endpoint URL                              |
| 422  | Validation Error   | Inspect `detail` field for parameter issues      |
| 429  | Rate Limited       | Back off with exponential delay + jitter         |
| 500+ | Server Error       | Retry after a brief delay; report if persistent  |

### Robust Error Handling Pattern

```python
import httpx
import asyncio
import random

class PerplexityError(Exception):
    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message
        super().__init__(f"HTTP {status_code}: {message}")

async def sonar_request(payload: dict, max_retries: int = 3) -> dict:
    """Send a request with retry logic for transient errors."""
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            try:
                resp = await client.post(
                    f"{BASE_URL}/v1/sonar",
                    headers={
                        "Authorization": f"Bearer {API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                    timeout=30.0,
                )
                if resp.status_code == 200:
                    return resp.json()
                if resp.status_code == 429:
                    wait = (2 ** attempt) + random.uniform(0, 1)
                    await asyncio.sleep(wait)
                    continue
                if resp.status_code >= 500:
                    await asyncio.sleep(2 ** attempt)
                    continue
                # Client errors -- do not retry
                raise PerplexityError(resp.status_code, resp.text)
            except httpx.ConnectError:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(1)
    raise PerplexityError(429, "Rate limit retries exhausted")
```

---

## Common Pitfalls

1. **Ignoring citations.** The `citations` array is the proof chain for every claim. Always store and surface it. Without citations the output is just an ungrounded LLM generation.

2. **Using `requests` instead of `httpx`.** The `requests` library is synchronous and blocks the event loop. Use `httpx.AsyncClient` for non-blocking I/O, especially if you are running multiple queries concurrently.

3. **Omitting timeouts.** Sonar queries hit the live web. Always set an explicit `timeout` (30-60s) to avoid hanging indefinitely, especially with `sonar-deep-research` which can take longer.

4. **Not handling 429 errors.** Rate limits are per-minute. A tight loop without backoff will get progressively worse. Always implement exponential backoff with jitter.

5. **Sending excessive `search_domain_filter` entries.** The filter accepts a maximum of ~20 domains. Passing more may cause a 422 validation error.

6. **Confusing `search_recency_filter` values.** Valid values are `"hour"`, `"day"`, `"week"`, `"month"`, `"year"`. Passing other strings (e.g., `"recent"`, `"30d"`) will silently fail or error.

7. **Not setting `Content-Type`.** The API expects `application/json`. Missing this header results in a 400 or 415 error.

8. **Forgetting `search_context_size` affects cost.** The per-request fee scales with context size (low/medium/high). Default is medium. Use `"low"` for simple lookups to reduce cost.

9. **Streaming without handling `[DONE]`.** The SSE stream ends with `data: [DONE]`. Attempting to JSON-parse this sentinel will crash your consumer.

10. **Using `sonar-deep-research` for simple questions.** Deep research is designed for multi-query exhaustive reports and costs significantly more. Use plain `sonar` for quick factual queries.
