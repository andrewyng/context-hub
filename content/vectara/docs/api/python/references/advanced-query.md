# Vectara Advanced Query Features

## Rerankers

Rerankers re-score initial search results using a more powerful model for better relevance.

### Neural Reranker

```python
resp = requests.post(
    f"{BASE_URL}/query",
    headers=headers,
    json={
        "query": "database optimization",
        "search": {
            "corpora": [{"corpus_key": "my-corpus"}],
            "limit": 100,  # Fetch more candidates for reranking
            "reranker": {
                "type": "customer_reranker",
                "reranker_name": "Rerank_Multilingual_v1",
                "limit": 10,     # Return top 10 after reranking
                "cutoff": 0.3,   # Minimum relevance score (0.0–1.0)
            },
        },
    },
)
```

Rerankers can be identified by name or ID:
- `"reranker_name": "Rerank_Multilingual_v1"` — by name
- `"reranker_id": "rnk_272725719"` — by ID

### Qwen3 Reranker with Instructions

The `qwen3-reranker` supports natural language `instructions` to steer reranking behavior — useful for domain-specific queries:

```python
resp = requests.post(
    f"{BASE_URL}/query",
    headers=headers,
    json={
        "query": "How does HHEM work?",
        "search": {
            "corpora": [
                {
                    "corpus_key": "my-corpus",
                    "lexical_interpolation": 0.005,
                }
            ],
            "limit": 100,
            "context_configuration": {
                "sentences_before": 2,
                "sentences_after": 2,
            },
            "reranker": {
                "type": "customer_reranker",
                "reranker_name": "qwen3-reranker",
                "instructions": (
                    "HHEM stands for Hughes Hallucination Evaluation Model. "
                    "Prioritize results that explain the model architecture "
                    "and evaluation methodology."
                ),
                "limit": 30,
                "cutoff": 0.2,
            },
        },
        "generation": {
            "generation_preset_name": "vectara-summary-ext-24-05-med-omni",
            "max_used_search_results": 10,
            "response_language": "eng",
            "enable_factual_consistency_score": True,
        },
    },
)
```

Use `instructions` to:
- **Resolve abbreviations** — expand domain jargon so the reranker understands context
- **Steer intent** — e.g., "prioritize practical how-to guides over academic papers"
- **Add domain context** — e.g., "this query is about network security, not physical security"

### Chain Reranker

Combine multiple rerankers in sequence — e.g., neural reranking followed by diversity:

```python
"reranker": {
    "type": "chain",
    "rerankers": [
        {
            "type": "customer_reranker",
            "reranker_name": "qwen3-reranker",
            "instructions": "Focus on practical implementation details",
            "limit": 100,
            "cutoff": 0.2,
        },
        {
            "type": "mmr",
            "diversity_bias": 0.05,
        },
    ],
}
```

### MMR Reranker (Diversity)

Maximal Marginal Relevance reduces redundancy in results:

```python
# Use within a query request's search object:
"reranker": {
    "type": "mmr",
    "diversity_bias": 0.3,  # 0.0 = pure relevance, 1.0 = max diversity
    "limit": 10,
}
```

### User-Defined Function Reranker (`userfn`)

Score results with a custom expression or a built-in utility function. The most common use is the **knee-point** function, which automatically detects where relevance scores drop off and cuts the result list there:

```python
"reranker": {
    "type": "userfn",
    "user_function": "knee()",
}
```

`userfn` also accepts arbitrary expressions over result fields (e.g., `"0.7 * get('$.score') + 0.3 * get('$.document_metadata.recency')"`) for per-tenant scoring logic. Pair with chain reranking to run knee-based truncation after a neural pass:

```python
"reranker": {
    "type": "chain",
    "rerankers": [
        {"type": "customer_reranker", "reranker_name": "Rerank_Multilingual_v1", "limit": 100},
        {"type": "userfn", "user_function": "knee()"},
    ],
}
```

### Disable Reranking

```python
"reranker": {
    "type": "none",
}
```

**Best practice:** Set `search.limit` higher (50–100) when using a reranker, so it has more candidates to work with. The reranker's own `limit` controls the final result count.

## Filter Expressions

SQL-like expressions that filter results by document and part metadata.

### Operators

| Operator | Example |
|----------|---------|
| `=`, `!=` | `doc.category = 'security'` |
| `<`, `>`, `<=`, `>=` | `doc.year >= 2024` |
| `AND`, `OR`, `NOT` | `doc.status = 'active' AND doc.priority > 3` |
| `IS NULL`, `IS NOT NULL` | `doc.author IS NOT NULL` |
| `IN` | `doc.category IN ('security', 'compliance')` |

### Data Types

- **Text:** `doc.category = 'Science'` (single quotes)
- **Integer:** `doc.publication_year = 2024`
- **Real:** `part.sentiment_score > 0.7`
- **Boolean:** `doc.is_featured = true`

### Default Metadata Fields

- `doc.id` — unique document identifier
- `part.lang` — ISO 639-2 language code (3 chars)
- `part.is_title` — boolean, indicates title sections

### Combining Filters

```python
"metadata_filter": (
    "doc.category = 'engineering' "
    "AND doc.year >= 2024 "
    "AND part.lang = 'eng'"
)
```

### List Membership

For list-type attributes, use the reverse `IN` syntax:

```python
"metadata_filter": "'python' IN doc.tags"
```

## Generation Presets

Generation presets bundle an LLM, a prompt template, and model parameters.

### Using a Preset

```python
"generation": {
    "generation_preset_name": "mockingbird-2.0",
}
```

### Custom Prompt Template

Override the default prompt with a Velocity template. The `prompt_template` is a JSON-stringified array of message objects using Velocity variables:

- `$vectaraQuery` — the user's query text
- `$vectaraQueryResults` — iterable of search results
- `$qResult.text()` — result text
- `$qResult.docMetadata().get('title')` — access document metadata

```python
import json

prompt = json.dumps([
    {"role": "system", "content": "You are a research assistant. Cite sources."},
    {"role": "user", "content": (
        "Question: $vectaraQuery\n\n"
        "Sources:\n"
        "#foreach ($qResult in $vectaraQueryResults)\n"
        "Title: $qResult.docMetadata().get('title')\n"
        "Content: $qResult.text()\n"
        "#end"
    )},
])

"generation": {
    "generation_preset_name": "mockingbird-2.0",
    "prompt_template": prompt,
    "max_used_search_results": 5,
    "model_parameters": {
        "temperature": 0.3,
        "max_tokens": 1024,
        "frequency_penalty": 0.1,
    },
}
```

### Citation Styles

```python
# Numeric: [1], [2], [3]
"citations": {"style": "numeric"}

# HTML: <cite data-ref="1">text</cite>
"citations": {"style": "html"}

# Markdown: [text](url)
"citations": {"style": "markdown", "url_pattern": "https://example.com/doc/{doc.id}"}
```

### Factual Consistency Score

Enable to get a 0.0–1.0 score measuring how well the generated answer is grounded in the search results:

```python
"generation": {
    "generation_preset_name": "mockingbird-2.0",
    "enable_factual_consistency_score": True,
}

# In response:
# data["factual_consistency_score"] → 0.95
```

## Context Configuration

Control how much surrounding text is included with each search result:

```python
"search": {
    "corpora": [{"corpus_key": "my-corpus"}],
    "limit": 10,
    "context_configuration": {
        "sentences_before": 2,
        "sentences_after": 2,
        "start_tag": "<b>",
        "end_tag": "</b>",
    },
}
```

Alternative: use `characters_before` / `characters_after` for character-level control.

## Metadata Query

Fuzzy match on metadata fields across a corpus (not full-text search):

```python
resp = requests.post(
    f"{BASE_URL}/corpora/my-corpus/query_metadata",
    headers=headers,
    json={
        "query": "machine learning",
        "metadata_fields": ["doc.title", "doc.category"],
        "limit": 20,
    },
)
```

## Query History (Observability)

Retrieve past queries with latency and pipeline details:

```python
resp = requests.get(
    f"{BASE_URL}/query_history",
    headers=headers,
    params={
        "corpus_key": "my-corpus",
        "limit": 50,
    },
)
for entry in resp.json()["queries"]:
    print(f"{entry['query']} — {entry['latency_ms']}ms")
```
