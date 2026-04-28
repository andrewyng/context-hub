---
name: api
description: "Vectara REST API v2 for semantic search, RAG, agents, reranking, document indexing, and hallucination detection"
metadata:
  languages: "python"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-24"
  source: official
  tags: "vectara,search,rag,semantic-search,vector,retrieval,reranking,agents,llm,ai"
---

# Vectara REST API v2 — Python Guidelines

You are a Vectara API coding expert. Help me with writing code that calls the Vectara REST API v2.

Official API reference: https://docs.vectara.com/docs/rest-api

## Golden Rule: Use the REST API v2

Always use the Vectara REST API v2. The base URL is:

```
https://api.vectara.io/v2
```

Use the `requests` library for API calls:

```bash
pip install requests
```

## Authentication

Vectara supports two auth methods: **API keys** and **OAuth 2.0 client credentials**.

### API Key (recommended for most use cases)

Pass your API key in the `x-api-key` header. Three key types exist:
- **QueryService keys** — read-only (search and query)
- **IndexService keys** — indexing and document management
- **Personal keys** — full account access (admin operations, agent management)

```python
import requests

BASE_URL = "https://api.vectara.io/v2"
API_KEY = "your_api_key"  # Use env var in production

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
}
```

### OAuth 2.0 Client Credentials

For server-to-server integrations, use OAuth 2.0:

```python
import requests

def get_oauth_token(client_id: str, client_secret: str) -> str:
    """Exchange client credentials for an access token."""
    resp = requests.post(
        "https://auth.vectara.com/oauth2/token",
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

token = get_oauth_token("your_client_id", "your_client_secret")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
}
```

## Query API — Search and RAG

`POST /v2/query` is the core endpoint. It supports multi-corpus semantic search with optional RAG generation.

### Simple Semantic Search

```python
resp = requests.post(
    f"{BASE_URL}/query",
    headers=headers,
    json={
        "query": "What is retrieval augmented generation?",
        "search": {
            "corpora": [
                {"corpus_key": "my-corpus"}
            ],
            "limit": 10,
        },
    },
)
results = resp.json()
for result in results["search_results"]:
    print(f"Score: {result['score']:.3f} — {result['text']}")
```

### Simple Single Corpus Query (GET)

For quick searches without generation or reranking:

```python
resp = requests.get(
    f"{BASE_URL}/corpora/my-corpus/query",
    headers=headers,
    params={"query": "How does reranking work?", "limit": 10},
)
```

### Advanced Single Corpus Query (POST)

For full control over search, reranking, and generation on a single corpus:

```python
resp = requests.post(
    f"{BASE_URL}/corpora/my-corpus/query",
    headers=headers,
    json={
        "query": "How does reranking work?",
        "search": {
            "limit": 10,
        },
    },
)
```

### RAG — Search with Generated Answer

Add the `generation` object to enable RAG. Omit it for pure search.

```python
resp = requests.post(
    f"{BASE_URL}/query",
    headers=headers,
    json={
        "query": "Explain the benefits of hybrid search",
        "search": {
            "corpora": [
                {"corpus_key": "my-corpus"}
            ],
            "limit": 10,
        },
        "generation": {
            "generation_preset_name": "mockingbird-2.0",
            "max_used_search_results": 5,
            "response_language": "eng",
            "enable_factual_consistency_score": True,
            "citations": {
                "style": "numeric",
            },
        },
    },
)
data = resp.json()
print(data["summary"])          # Generated answer with citations
print(data["factual_consistency_score"])  # 0.0–1.0
for r in data["search_results"]:
    print(f"[{r['score']:.3f}] {r['text']}")
```

### Generation Presets

| Preset | Model | Best For |
|--------|-------|----------|
| `mockingbird-2.0` | Vectara Mockingbird | RAG (recommended) |
| `vectara-summary-ext-24-05-med-omni` | GPT-4o | General summarization |
| `vectara-summary-ext-24-05-large` | GPT-4.0-turbo | Longer summaries |
| `vectara-summary-ext-24-05-sml` | GPT-3.5-turbo | Fast, low-cost |
| `vectara-summary-table-query-ext-dec-2024-gpt-4o` | GPT-4o | Tabular data |

### Hybrid Search (Lexical + Neural)

Control the balance between neural and keyword search with `lexical_interpolation`:
- `0.0` = pure neural (semantic) search
- `1.0` = pure keyword (lexical) search
- `0.005` = recommended starting point (mostly neural with slight keyword boost)

```python
resp = requests.post(
    f"{BASE_URL}/query",
    headers=headers,
    json={
        "query": "machine learning pipelines",
        "search": {
            "corpora": [
                {
                    "corpus_key": "my-corpus",
                    "lexical_interpolation": 0.025,
                }
            ],
            "limit": 10,
        },
    },
)
```

### Multi-Corpus Search

Query across multiple corpora in a single request:

```python
resp = requests.post(
    f"{BASE_URL}/query",
    headers=headers,
    json={
        "query": "deployment best practices",
        "search": {
            "corpora": [
                {"corpus_key": "engineering-docs"},
                {"corpus_key": "runbooks"},
                {"corpus_key": "incident-reports"},
            ],
            "limit": 15,
        },
        "generation": {
            "generation_preset_name": "mockingbird-2.0",
        },
    },
)
```

### Metadata Filtering

Filter results using SQL-like expressions on `doc.*` and `part.*` fields:

```python
resp = requests.post(
    f"{BASE_URL}/query",
    headers=headers,
    json={
        "query": "security vulnerabilities",
        "search": {
            "corpora": [
                {
                    "corpus_key": "my-corpus",
                    "metadata_filter": "doc.category = 'security' AND doc.year >= 2024",
                }
            ],
            "limit": 10,
        },
    },
)
```

Filter expression syntax:
- Comparison: `=`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `AND`, `OR`, `NOT`
- Null checks: `IS NULL`, `IS NOT NULL`
- Sets: `doc.status IN ('active', 'review')`
- Default fields: `doc.id`, `part.lang`, `part.is_title`

### Reranking

Add a `reranker` to improve result quality:

```python
resp = requests.post(
    f"{BASE_URL}/query",
    headers=headers,
    json={
        "query": "database optimization techniques",
        "search": {
            "corpora": [{"corpus_key": "my-corpus"}],
            "limit": 50,
            "reranker": {
                "type": "customer_reranker",
                "reranker_name": "Rerank_Multilingual_v1",
                "limit": 10,
                "cutoff": 0.3,
            },
        },
    },
)
```

Reranker types:
- `customer_reranker` — Vectara's neural reranker (`Rerank_Multilingual_v1` or `qwen3-reranker`)
- `mmr` — Maximal Marginal Relevance (diversifies results)
- `chain` — combine multiple rerankers in sequence
- `none` — skip reranking

### Streaming Responses

Add `stream_response: true` and set `Accept: text/event-stream` to receive SSE chunks:

```python
import json
resp = requests.post(
    f"{BASE_URL}/query",
    headers={**headers, "Accept": "text/event-stream"},
    json={
        "query": "Explain vector databases",
        "search": {
            "corpora": [{"corpus_key": "my-corpus"}],
            "limit": 10,
        },
        "generation": {
            "generation_preset_name": "mockingbird-2.0",
        },
        "stream_response": True,
    },
    stream=True,
)
for line in resp.iter_lines():
    if line and line.startswith(b"data:"):
        event = json.loads(line[5:])
        if event["type"] == "generation_chunk":
            print(event["generation_chunk"], end="")
        elif event["type"] == "search_results":
            pass  # Search results arrive first
        elif event["type"] == "factual_consistency_score":
            print(f"\nScore: {event['factual_consistency_score']}")
```

SSE event types: `search_results`, `generation_chunk`, `factual_consistency_score`, `generation_end`, `end`.

## Corpus Management

### Create a Corpus

```python
resp = requests.post(
    f"{BASE_URL}/corpora",
    headers=headers,
    json={
        "key": "my-new-corpus",
        "name": "My New Corpus",
        "description": "Product documentation for search",
        "filter_attributes": [
            {
                "name": "category",
                "level": "document",
                "type": "text",
                "indexed": True,
            },
            {
                "name": "year",
                "level": "document",
                "type": "integer",
                "indexed": True,
            },
        ],
    },
)
corpus = resp.json()  # Returns corpus with system-generated id
```

### List Corpora

```python
resp = requests.get(f"{BASE_URL}/corpora", headers=headers)
for corpus in resp.json()["corpora"]:
    print(f"{corpus['key']}: {corpus['name']}")
```

### Get Corpus Details

```python
resp = requests.get(f"{BASE_URL}/corpora/my-corpus", headers=headers)
corpus = resp.json()
print(f"Documents: {corpus['limits']['used_docs']}")
print(f"Characters: {corpus['limits']['used_characters']}")
```

### Delete a Corpus

```python
resp = requests.delete(f"{BASE_URL}/corpora/my-corpus", headers=headers)
# 204 = success, corpus and all data permanently removed
```

## Document Indexing

### Upload a File

Upload PDF, Word, PowerPoint, HTML, Markdown, or plain text files (max 10 MB):

```python
import json

with open("document.pdf", "rb") as f:
    resp = requests.post(
        f"{BASE_URL}/corpora/my-corpus/upload_file",
        headers={"x-api-key": API_KEY, "Accept": "application/json"},
        files={
            "file": ("document.pdf", f, "application/pdf"),
            "filename": (None, "doc-001"),  # Required — sets the document ID
            "metadata": (None, json.dumps({"category": "engineering", "year": 2024}), "application/json"),
        },
    )
# 201 = document parsed, chunked, and indexed
```

The `filename` multipart field is **required** and becomes the document ID inside the corpus — set it explicitly rather than relying on the uploaded file's name.

Do **not** set `Content-Type` header manually for multipart uploads — let `requests` set the boundary.

Supported file types: Markdown, PDF/A, OpenOffice (.odt), Word (.doc, .docx), PowerPoint (.ppt, .pptx), HTML, LXML, RTF, EPUB, plain text, email (RFC 822).

### Structured Document Indexing

For precise control over document structure, use the structured index API with recursive `sections`:

```python
resp = requests.post(
    f"{BASE_URL}/corpora/my-corpus/documents",
    headers=headers,
    json={
        "id": "doc-001",
        "type": "structured",
        "title": "Getting Started Guide",
        "metadata": {"category": "tutorial", "author": "team"},
        "sections": [
            {
                "title": "Introduction",
                "text": "This guide covers the basics of setting up your environment.",
                "metadata": {"section": "introduction"},
            },
            {
                "title": "Setup",
                "text": "First, install the required dependencies using pip.",
                "metadata": {"section": "setup"},
                "sections": [  # Sections can be nested recursively
                    {
                        "text": "Run: pip install requests",
                        "metadata": {"section": "setup-python"},
                    },
                ],
            },
        ],
    },
)
```

### Core Document (Pre-chunked)

When you've already split text into chunks, use `"type": "core"` with `document_parts`:

```python
resp = requests.post(
    f"{BASE_URL}/corpora/my-corpus/documents",
    headers=headers,
    json={
        "id": "doc-002",
        "type": "core",
        "metadata": {"source": "wiki"},
        "document_parts": [
            {
                "text": "Vectara provides semantic search capabilities.",
                "context": "From the product overview page",
                "metadata": {"section": "overview"},
            },
            {
                "text": "RAG combines retrieval with generation.",
                "metadata": {"section": "rag"},
            },
        ],
    },
)
```

## OpenAI-Compatible Chat Completions

Drop-in replacement for OpenAI's Chat Completions API:

```python
resp = requests.post(
    f"{BASE_URL}/llms/chat/completions",
    headers=headers,
    json={
        "model": "mockingbird-2.0",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "What is semantic search?"},
        ],
        "temperature": 0.7,
    },
)
data = resp.json()
print(data["choices"][0]["message"]["content"])
# Response includes: id, object, created, model, choices, usage
```

Works with any OpenAI-compatible client library by changing the base URL.

## Error Handling

```python
resp = requests.post(f"{BASE_URL}/query", headers=headers, json=payload)

if resp.status_code == 200:
    data = resp.json()
elif resp.status_code == 400:
    print(f"Bad request: {resp.json()}")
elif resp.status_code == 403:
    print("Permission denied — check API key type and scope")
elif resp.status_code == 404:
    print("Corpus not found — verify corpus_key")
elif resp.status_code == 429:
    print("Rate limited — back off and retry")
    retry_after = resp.headers.get("Retry-After", 1)
else:
    resp.raise_for_status()
```

Common status codes:
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (corpus, document) |
| 204 | Deleted |
| 400 | Malformed request |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 415 | Unsupported file type (upload) |
| 429 | Rate limited |

## Useful Links

- API Reference: https://docs.vectara.com/docs/rest-api
- Developer Quickstart: https://docs.vectara.com/docs/developer-quickstart
- Vectara Console: https://console.vectara.com
- Filter Expressions: https://docs.vectara.com/docs/learn/metadata-search-filtering/filter-overview
