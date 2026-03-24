# Vectara Advanced Query Features

## Rerankers

Rerankers re-score initial search results using a more powerful model for better relevance.

### Neural Reranker (Recommended)

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

### MMR Reranker (Diversity)

Maximal Marginal Relevance reduces redundancy in results:

```python
"reranker": {
    "type": "mmr",
    "diversity_bias": 0.3,  # 0.0 = pure relevance, 1.0 = max diversity
    "limit": 10,
}
```

### No Reranker

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

Override the default prompt with a Velocity template:

```python
"generation": {
    "generation_preset_name": "mockingbird-2.0",
    "prompt_template": (
        "Given the search results: $results\n\n"
        "Answer the question: $query\n\n"
        "Be concise and cite sources."
    ),
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
