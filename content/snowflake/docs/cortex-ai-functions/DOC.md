---
name: cortex-ai-functions
description: "Snowflake Cortex AI Functions — SQL and Python functions for text generation, classification, sentiment analysis, extraction, summarization, translation, embedding, and document parsing"
metadata:
  languages: "sql,python"
  versions: "2026-03"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "snowflake,cortex,ai,llm,sql,functions,nlp,embeddings,rag,document-processing"
---

# Cortex AI Functions

Snowflake Cortex AI Functions are SQL-callable AI functions that run LLMs directly inside Snowflake. No external APIs, no data movement — call them in SQL or Python on your Snowflake data.

## Access Control

```sql
-- Required role (run as ACCOUNTADMIN)
GRANT DATABASE ROLE SNOWFLAKE.CORTEX_USER TO ROLE my_role;
```

## Function Reference

### AI_COMPLETE — Text Generation

Generate text from a prompt using your choice of model.

```sql
-- Simple completion
SELECT AI_COMPLETE('claude-4-sonnet', 'Summarize: ' || my_text) FROM documents;

-- With system prompt and options
SELECT AI_COMPLETE(
  'claude-4-sonnet',
  [
    {'role': 'system', 'content': 'You are a helpful assistant.'},
    {'role': 'user', 'content': 'Analyze this data trend.'}
  ],
  {'temperature': 0.7, 'max_tokens': 1024, 'guardrails': TRUE}
);
```

**Options**: `temperature` (0-1), `top_p` (0-1), `max_tokens` (default 4096, max 8192), `guardrails` (TRUE/FALSE — uses Cortex Guard), `response_format` (JSON schema for structured output).

**Supported models**: `claude-4-opus`, `claude-4-sonnet`, `claude-3-7-sonnet`, `claude-3-5-sonnet`, `deepseek-r1`, `llama3.1-8b`, `llama3.1-70b`, `llama3.1-405b`, `llama3.3-70b`, `llama4-maverick`, `llama4-scout`, `mistral-large2`, `openai-gpt-4.1`, `openai-o4-mini`, `snowflake-llama-3.3-70b`, and more.

### AI_CLASSIFY — Text/Image Classification

Categorize text into predefined buckets with zero training data.

```sql
SELECT
  feedback_text,
  AI_CLASSIFY(
    feedback_text,
    ['billing issue', 'product bug', 'feature request', 'praise', 'other']
  ) AS category
FROM customer_feedback;
```

### AI_SENTIMENT — Sentiment Analysis

Returns a score from -1 (negative) to 1 (positive).

```sql
SELECT
  review_text,
  AI_SENTIMENT(review_text) AS score,
  CASE
    WHEN AI_SENTIMENT(review_text) > 0.3 THEN 'Positive'
    WHEN AI_SENTIMENT(review_text) < -0.3 THEN 'Negative'
    ELSE 'Neutral'
  END AS label
FROM product_reviews;

-- Multi-dimension sentiment
SELECT AI_SENTIMENT(call_text, ['Professionalism', 'Resolution', 'Wait Time'])
FROM support_calls;
```

### AI_EXTRACT — Structured Extraction

Pull specific fields from unstructured text, images, or documents.

```sql
SELECT AI_EXTRACT(
  invoice_text,
  {'vendor_name': 'STRING', 'total_amount': 'NUMBER', 'invoice_date': 'DATE'}
) AS extracted
FROM invoices;
```

### AI_SUMMARIZE — Text Summarization

```sql
SELECT AI_SUMMARIZE(article_content) AS summary FROM articles;
```

### AI_TRANSLATE — Translation

```sql
SELECT AI_TRANSLATE(description, 'en', 'fr') AS french_description
FROM products;
```

Supports dozens of language pairs. Specify source and target language codes.

### AI_EMBED — Vector Embeddings

Create embeddings for semantic search, similarity, and RAG.

```sql
SELECT AI_EMBED('snowflake-arctic-embed-l-v2.0', product_description)
FROM products;
```

### AI_FILTER — Boolean Condition Check

Evaluate text/images against a condition, returning TRUE/FALSE.

```sql
SELECT * FROM emails
WHERE AI_FILTER(body, 'Contains a meeting request') = TRUE;
```

### AI_AGG — Aggregate Insights

Aggregate text across rows and generate insights.

```sql
SELECT AI_AGG(feedback_text, 'Summarize the top 3 themes') AS themes
FROM customer_feedback
GROUP BY product_id;
```

### AI_PARSE_DOCUMENT — Document Intelligence

Extract text and structured data from PDF, images, and documents stored in stages.

```sql
SELECT AI_PARSE_DOCUMENT(
  TO_FILE('@my_stage', 'contract.pdf'),
  {'mode': 'LAYOUT'}
) AS parsed
FROM DUAL;
```

### AI_REDACT — PII Redaction

Redact personally identifiable information from text.

```sql
SELECT AI_REDACT(customer_notes) AS redacted FROM support_tickets;
```

## Cortex REST API

Access the same models via REST for application integration.

### Chat Completions API (OpenAI-compatible)

```python
from openai import OpenAI

client = OpenAI(
    api_key="<SNOWFLAKE_PAT>",
    base_url="https://<account>.snowflakecomputing.com/api/v2/cortex/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "How does a snowflake form?"}]
)
print(response.choices[0].message.content)
```

### Messages API (Anthropic-compatible, Claude models only)

```python
import httpx, anthropic

PAT = "<SNOWFLAKE_PAT>"
http_client = httpx.Client(headers={"Authorization": f"Bearer {PAT}"})

client = anthropic.Anthropic(
    api_key="not-used",
    base_url="https://<account>.snowflakecomputing.com/api/v2/cortex",
    http_client=http_client,
    default_headers={"Authorization": f"Bearer {PAT}"}
)

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "How does a snowflake form?"}]
)
```

### curl

```bash
curl "https://<account>.snowflakecomputing.com/api/v2/cortex/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SNOWFLAKE_PAT" \
  -d '{"model": "claude-sonnet-4-5", "messages": [{"role": "user", "content": "Hello"}]}'
```

Both APIs support **streaming** via `stream: true` / `"stream": true`.

## Python SDK

```python
from snowflake.cortex import Complete, Sentiment, Summarize, Translate, ExtractAnswer

# In a Snowpark session
result = Complete("claude-4-sonnet", "Write a brief intro about Snowflake Cortex")
score = Sentiment("I really enjoyed this. Fantastic service!")
summary = Summarize(long_text)
translated = Translate(text, "en", "fr")
```

## Cross-Region Inference

```sql
-- Enable access to models not in your region (run as ACCOUNTADMIN)
ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'AWS_US';
```

Options: `AWS_US`, `AWS_EU`, `AWS_APJ`, `ANY_REGION`.

## Cost and Billing

- Token-based billing: input + output tokens for generative functions (AI_COMPLETE, AI_SUMMARIZE, AI_TRANSLATE); input tokens only for extraction functions (AI_SENTIMENT, AI_EXTRACT)
- Monitor usage:
  ```sql
  SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.METERING_DAILY_HISTORY
  WHERE SERVICE_TYPE = 'AI_SERVICES';
  ```

## Limitations

- Cortex AI Functions do not support dynamic tables
- Usage quotas apply per account
- Model availability varies by region — use cross-region inference for full access
