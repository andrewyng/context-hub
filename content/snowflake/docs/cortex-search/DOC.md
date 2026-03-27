---
name: cortex-search
description: "Snowflake Cortex Search — managed hybrid search service for RAG applications, enterprise search, with automatic indexing and refresh"
metadata:
  languages: "sql,python"
  versions: "2026-03"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "snowflake,cortex,search,rag,hybrid-search,vector-search,embeddings,retrieval"
---

# Cortex Search

Cortex Search is a fully managed hybrid (vector + keyword) search engine for Snowflake data. It powers RAG applications and enterprise search with automatic embedding, index management, and refresh — no infrastructure to maintain.

## Use Cases

- **RAG engine for LLM chatbots**: Semantic retrieval for grounding LLM responses in your data
- **Enterprise search**: High-quality search bar backend for applications

## Quick Start

### 1. Create Source Data

```sql
CREATE DATABASE IF NOT EXISTS cortex_search_db;
CREATE OR REPLACE SCHEMA cortex_search_db.services;

CREATE OR REPLACE TABLE support_transcripts (
  transcript_text VARCHAR,
  region VARCHAR,
  agent_id VARCHAR
);

INSERT INTO support_transcripts VALUES
  ('My internet has been down since yesterday, can you help?', 'North America', 'AG1001'),
  ('I was overcharged for my last bill, need an explanation.', 'Europe', 'AG1002'),
  ('How do I reset my password? The email link is not working.', 'Asia', 'AG1003'),
  ('I received a faulty router, can I get it replaced?', 'North America', 'AG1004');
```

### 2. Create Search Service

```sql
CREATE OR REPLACE CORTEX SEARCH SERVICE transcript_search_service
  ON transcript_text
  ATTRIBUTES region
  WAREHOUSE = cortex_search_wh
  TARGET_LAG = '1 day'
  EMBEDDING_MODEL = 'snowflake-arctic-embed-l-v2.0'
  AS (
    SELECT transcript_text, region, agent_id
    FROM support_transcripts
  );
```

Key parameters:
- `ON`: Column to search against
- `ATTRIBUTES`: Columns available as filter attributes and returned in results
- `TARGET_LAG`: How often the index refreshes from base data (e.g., `'1 hour'`, `'1 day'`)
- `EMBEDDING_MODEL`: Model used to generate embeddings
- `WAREHOUSE`: Used for materializing the source query

### 3. Grant Access

```sql
GRANT USAGE ON DATABASE cortex_search_db TO ROLE customer_support;
GRANT USAGE ON SCHEMA services TO ROLE customer_support;
GRANT USAGE ON CORTEX SEARCH SERVICE transcript_search_service TO ROLE customer_support;
```

### 4. Preview Results (SQL)

```sql
SELECT PARSE_JSON(
  SNOWFLAKE.CORTEX.SEARCH_PREVIEW(
    'cortex_search_db.services.transcript_search_service',
    '{
      "query": "internet issues",
      "columns": ["transcript_text", "region"],
      "filter": {"@eq": {"region": "North America"}},
      "limit": 1
    }'
  )
)['results'] AS results;
```

### 5. Query from Python

```python
from snowflake.core import Root
from snowflake.snowpark import Session

session = Session.builder.configs(CONNECTION_PARAMS).create()
root = Root(session)

search_service = (
    root
    .databases["cortex_search_db"]
    .schemas["services"]
    .cortex_search_services["transcript_search_service"]
)

results = search_service.search(
    query="internet issues",
    columns=["transcript_text", "region"],
    filter={"@eq": {"region": "North America"}},
    limit=5
)
print(results.to_json())
```

## Creating via Snowsight

1. Navigate to **AI & ML → AI Studio**
2. Select **+ Create** from the Cortex Search Service box
3. Choose role, warehouse, database, and schema
4. Select the source table and search columns
5. Set filter columns and target lag
6. Create the service

## Query Filters

Filter search results using attribute columns:

```json
{
  "query": "billing problem",
  "columns": ["transcript_text", "region", "agent_id"],
  "filter": {
    "@and": [
      {"@eq": {"region": "North America"}},
      {"@eq": {"agent_id": "AG1001"}}
    ]
  },
  "limit": 10
}
```

Supported operators: `@eq`, `@and`, `@or`, `@not`, `@gte`, `@lte`, `@gt`, `@lt`.

## Inspecting Service Data

```sql
SELECT * FROM TABLE(
  CORTEX_SEARCH_DATA_SCAN(SERVICE_NAME => 'transcript_search_service')
);
```

## RAG Architecture

Combine Cortex Search with Cortex AI Functions for RAG:

```python
# 1. Retrieve relevant context
results = search_service.search(query=user_question, columns=["text"], limit=5)
context = "\n".join([r["text"] for r in results.results])

# 2. Generate grounded response
from snowflake.cortex import Complete
response = Complete("claude-4-sonnet", f"Answer based on this context:\n{context}\n\nQuestion: {user_question}")
```

## Access Control

- Creating a service requires `SNOWFLAKE.CORTEX_USER` database role
- The warehouse specified is used during index build and refresh
- Grant `USAGE` on the service to allow other roles to query it

## Key Considerations

- Index build time depends on dataset size and warehouse size (use dedicated warehouse, size MEDIUM or smaller)
- `TARGET_LAG` controls freshness vs. cost tradeoff
- Columns in `ATTRIBUTES` must be included in the source query
- Services automatically refresh when base data changes
- Supports both SQL and Python query interfaces

## Prerequisites

- Snowflake account with `SNOWFLAKE.CORTEX_USER` database role
- A warehouse for index materialization
- Source table with text data to search
