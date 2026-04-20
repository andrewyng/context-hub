# Vectara Data Management API

## Document Operations

### List Documents

```python
resp = requests.get(
    f"{BASE_URL}/corpora/my-corpus/documents",
    headers=headers,
    params={"limit": 20},
)
for doc in resp.json()["documents"]:
    print(f"{doc['id']}: {doc.get('metadata', {})}")
```

### Pagination

All list endpoints use cursor-based pagination with `limit` + `page_key`:

```python
page_key = None
all_docs = []
while True:
    params = {"limit": 100}
    if page_key:
        params["page_key"] = page_key
    resp = requests.get(
        f"{BASE_URL}/corpora/my-corpus/documents",
        headers=headers,
        params=params,
    )
    data = resp.json()
    all_docs.extend(data["documents"])
    page_key = data.get("metadata", {}).get("page_key")
    if not page_key:
        break
```

This pattern works for all list endpoints (`/corpora`, `/documents`, `/agents`, `/sessions`, etc.).

### Get Document Details

```python
resp = requests.get(
    f"{BASE_URL}/corpora/my-corpus/documents/doc-001",
    headers=headers,
)
doc = resp.json()
```

### Delete a Document

```python
resp = requests.delete(
    f"{BASE_URL}/corpora/my-corpus/documents/doc-001",
    headers=headers,
)
# 204 = success
```

### Bulk Delete Documents

Async operation — accepts document IDs, metadata filters, or both:

```python
resp = requests.delete(
    f"{BASE_URL}/corpora/my-corpus/documents",
    headers=headers,
    json={
        "document_ids": ["doc-001", "doc-002", "doc-003"],
    },
)
# Async — returns a job. Poll via GET /v2/jobs/{job_id}
```

### Summarize a Document

Generate a summary of a specific document:

```python
resp = requests.post(
    f"{BASE_URL}/corpora/my-corpus/documents/doc-001/summarize",
    headers=headers,
    json={
        "generation_preset_name": "mockingbird-2.0",
        "max_tokens": 512,
    },
)
print(resp.json()["summary"])
```

### Update Document Metadata

Partial update — only specified metadata fields change:

```python
resp = requests.patch(
    f"{BASE_URL}/corpora/my-corpus/documents/doc-001",
    headers=headers,
    json={
        "metadata": {"category": "updated-category", "reviewed": True},
    },
)
```

### Replace Document Metadata

Full replacement — all existing metadata is overwritten:

```python
resp = requests.put(
    f"{BASE_URL}/corpora/my-corpus/documents/doc-001/metadata",
    headers=headers,
    json={
        "metadata": {"category": "new-category", "author": "team-b"},
    },
)
```

### Retrieve Images from Documents

```python
resp = requests.get(
    f"{BASE_URL}/corpora/my-corpus/documents/doc-001/images",
    headers=headers,
)
for image in resp.json()["images"]:
    print(f"Image: {image['id']} — {image['content_type']}")
```

### Get a Specific Image

```python
resp = requests.get(
    f"{BASE_URL}/corpora/my-corpus/documents/doc-001/images/{image_id}",
    headers=headers,
)
```

## Corpus Management

### Update a Corpus

Partial update — modify name, description, or enabled status:

```python
resp = requests.patch(
    f"{BASE_URL}/corpora/my-corpus",
    headers=headers,
    json={
        "name": "Updated Corpus Name",
        "description": "New description",
        "enabled": True,
    },
)
```

### Compute Corpus Size

Trigger an async size computation:

```python
resp = requests.post(
    f"{BASE_URL}/corpora/my-corpus/compute_size",
    headers=headers,
)
# Returns a job object — poll via GET /v2/jobs/{job_id}
job_id = resp.json()["job_id"]
```

### Get Filter Attribute Statistics

Retrieve statistics about filter attribute values in a corpus:

```python
resp = requests.get(
    f"{BASE_URL}/corpora/my-corpus/filter_attribute_stats",
    headers=headers,
)
for attr in resp.json()["filter_attributes"]:
    print(f"{attr['name']}: {attr['type']} — {attr.get('unique_values', 'N/A')}")
```

### Filter Attributes

Define metadata fields at corpus creation for efficient filtering:

```python
resp = requests.post(
    f"{BASE_URL}/corpora",
    headers=headers,
    json={
        "key": "products",
        "name": "Product Catalog",
        "filter_attributes": [
            {"name": "category", "level": "document", "type": "text", "indexed": True},
            {"name": "price", "level": "document", "type": "real", "indexed": True},
            {"name": "in_stock", "level": "document", "type": "boolean", "indexed": True},
            {"name": "tags", "level": "document", "type": "text_list", "indexed": True},
            {"name": "section", "level": "part", "type": "text", "indexed": True},
        ],
    },
)
```

Filter attribute types: `integer`, `real`, `text`, `boolean`, `integer_list`, `real_list`, `text_list`.

Levels:
- `document` — document-level metadata (consistent across all parts)
- `part` — part-level metadata (varies per chunk/section)

### Replace Filter Attributes

Replaces all filter attributes on a corpus (async operation — returns a job):

```python
resp = requests.post(
    f"{BASE_URL}/corpora/my-corpus/replace_filter_attributes",
    headers=headers,
    json={
        "filter_attributes": [
            {"name": "category", "level": "document", "type": "text", "indexed": True},
            {"name": "status", "level": "document", "type": "text", "indexed": True},
        ],
    },
)
# Returns a job — poll via GET /v2/jobs/{job_id}
```

### Corpus Statistics

```python
resp = requests.get(
    f"{BASE_URL}/corpora/my-corpus/statistics",
    headers=headers,
)
stats = resp.json()
print(f"Documents: {stats['document_count']}")
print(f"Parts: {stats['part_count']}")
print(f"Characters: {stats['character_count']}")
```

### Reset Corpus

Remove all documents but keep the corpus configuration:

```python
resp = requests.post(
    f"{BASE_URL}/corpora/my-corpus/reset",
    headers=headers,
)
# 204 = all documents removed, corpus config preserved
```

## Encoders

Encoders convert text into vector embeddings. Vectara manages these automatically, but you can list and configure them.

```python
resp = requests.get(f"{BASE_URL}/encoders", headers=headers)
for encoder in resp.json()["encoders"]:
    print(f"{encoder['name']}: {encoder['description']}")
```

The default encoder is **Boomerang**, Vectara's multilingual embedding model.

## LLM Management

Bring your own OpenAI-compatible LLM:

```python
# List available LLMs
resp = requests.get(f"{BASE_URL}/llms", headers=headers)

# Register a custom LLM
resp = requests.post(
    f"{BASE_URL}/llms",
    headers=headers,
    json={
        "name": "my-llm",
        "description": "Custom GPT-4 endpoint",
        "api_base_url": "https://my-llm-endpoint.example.com/v1",
        "api_key": "my-llm-api-key",
        "model_name": "gpt-4",
    },
)
```

## Table Extraction

Extract structured tables from uploaded PDFs:

```python
with open("report.pdf", "rb") as f:
    resp = requests.post(
        f"{BASE_URL}/corpora/my-corpus/upload_file",
        headers={"x-api-key": API_KEY},
        files={"file": ("report.pdf", f, "application/pdf")},
        data={
            "table_extraction_config": '{"extract_tables": true}',
        },
    )
```

## Factual Consistency Evaluation

Score how well generated text is grounded in source material. Uses the HHEM (Hughes Hallucination Evaluation Model) v2.2 by default.

```python
resp = requests.post(
    f"{BASE_URL}/evaluate_factual_consistency",
    headers=headers,
    json={
        "generated_text": "The company was founded in 2020 and has 500 employees.",
        "source_texts": [
            "The company was founded in 2019.",
            "The company currently employs 487 people.",
        ],
        "language": "eng",
        "model_parameters": {"model": "hhem_v2.2"},
    },
)
result = resp.json()
print(f"Score: {result['score']}")            # 0.0–1.0
print(f"Consistent: {result['p_consistent']}")
print(f"Inconsistent: {result['p_inconsistent']}")
```

This is also available inline during RAG queries via `enable_factual_consistency_score: true` in the generation config.

## Jobs (Async Operations)

Some operations run asynchronously. Track their status:

```python
resp = requests.get(f"{BASE_URL}/jobs", headers=headers)
for job in resp.json()["jobs"]:
    print(f"{job['id']}: {job['state']} — {job['type']}")

# Get specific job status
resp = requests.get(f"{BASE_URL}/jobs/{job_id}", headers=headers)
```

## API Keys Management

### List API Keys

```python
resp = requests.get(f"{BASE_URL}/api_keys", headers=headers)
for key in resp.json()["api_keys"]:
    print(f"{key['name']}: {key['api_key_type']} — enabled: {key['enabled']}")
```

### Create an API Key

```python
resp = requests.post(
    f"{BASE_URL}/api_keys",
    headers=headers,
    json={
        "name": "search-service-key",
        "api_key_type": "query_service",  # or "personal"
        "corpus_keys": ["my-corpus"],     # scope to specific corpora
    },
)
new_key = resp.json()["api_key"]
```

### Delete an API Key

```python
resp = requests.delete(f"{BASE_URL}/api_keys/{key_id}", headers=headers)
# 204 = success
```
