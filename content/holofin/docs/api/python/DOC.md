---
name: api
description: "Document intelligence API for financial PDFs — upload documents, get structured JSON with bank transactions, fraud analysis, and custom extraction schemas"
metadata:
  languages: "python"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-12"
  source: official
  tags: "holofin,api,document-processing,extraction,fraud-detection,bank-statements,pdf"
---
# Holofin API Coding Guide

## 1. Golden Rule

**Always use the REST API at `https://app.holofin.ai/api/v1.1/`.** There is no Python SDK — use `httpx` or `requests` directly. All requests require the `X-API-Key` header.

**Current API Version:** v1.1
**Base URL:** `https://app.holofin.ai/api/v1.1/`

## 2. Authentication

```python
import httpx

client = httpx.Client(
    base_url="https://app.holofin.ai/api/v1.1",
    headers={"X-API-Key": "sk-holo-api01-YOUR_KEY"},
    timeout=30.0,
)
```

- Header: `X-API-Key: sk-holo-api01-...`
- Create keys at: https://app.holofin.ai/settings/api-keys/
- Keys are workspace-scoped. Optional IP allowlisting and expiration.
- All requests must be HTTPS.

## 3. Core Workflow: Upload → Poll → Get Results

Everything runs through **workflow runs**. A workflow is a pre-configured pipeline (classify → segment → extract → fraud analysis) that you trigger via API.

### Step 1: Upload a document

```python
import base64

with open("statement.pdf", "rb") as f:
    doc_b64 = base64.b64encode(f.read()).decode()

resp = client.post("/workflow-runs/", json={
    "workflow_id": "wf_abc123",       # from your dashboard
    "document_b64": doc_b64,          # base64-encoded PDF
    "document_name": "statement.pdf", # optional, must end in .pdf
    "metadata": {"client_id": "42"},  # optional, stored as-is
})
run = resp.json()
# {"run_id": "wr_xyz789", "status": "pending", "document_id": "doc_...", ...}
```

**Constraints:** PDF only, max 50MB, document must start with `%PDF` magic bytes.

### Step 2: Poll for completion (or use webhooks)

```python
import time

while True:
    resp = client.get(f"/workflow-runs/{run['run_id']}")
    data = resp.json()
    if data["status"] in ("completed", "failed", "cancelled"):
        break
    # data["progress"] has {current_step, total_steps, percentage}
    time.sleep(2)
```

### Step 3: Read results

```python
result = client.get(f"/workflow-runs/{run['run_id']}").json()

# Classification
print(result["classification"])
# {"class": "bank_statement", "confidence": 0.97, "reasoning": "..."}

# Extraction — array of document parts (one per segment)
for part in result["extraction"]["document_parts"]:
    print(part["key"], part["part_type"], part["validation_status"])
    print(part["data"])  # structured JSON per document type

# Fraud analysis
print(result["fraud_analysis"])
# {"status": "completed", "risk_level": "normal", "risk_score": 12,
#  "risk_factors": [...], "trust_factors": [...]}
```

## 4. List and Filter Runs

```python
# Cursor-paginated, max 100 per page
resp = client.get("/workflow-runs/", params={
    "workflow_id": "wf_abc123",           # optional filter
    "status": "completed",                 # completed | failed | cancelled
    "created_after": "2026-01-01T00:00:00Z",
    "limit": 50,
})
data = resp.json()
# {"runs": [...], "next_token": "...", "has_more": true}

# Next page
resp = client.get("/workflow-runs/", params={
    "next_token": data["next_token"],
    "limit": 50,
})
```

## 5. Cancel a Run

```python
client.get(f"/workflow-runs/{run_id}/cancel")
```

## 6. Node-Level Details

```python
resp = client.get(f"/workflow-runs/{run_id}/node-runs/")
nodes = resp.json()
# [{"node_run_id": "...", "node_type": "classifier", "status": "completed",
#   "duration_ms": 1200, "config": {...}, "results": {...}}, ...]
```

## 7. Usage Stats

```python
resp = client.get("/usage")
usage = resp.json()
# {"last_30_days": 1234, "since_month_start": 456,
#  "period_start": "2026-03-01", "period_end": "2026-03-31",
#  "organization": "Acme Corp"}
```

## 8. Webhooks (Alternative to Polling)

Configure webhook endpoints in your dashboard at https://app.holofin.ai/settings/webhooks/

Events: `workflow-run.completed`, `workflow-run.failed`, `workflow-run.paused`, `node-run.completed`, `node-run.failed`

Payload includes HMAC signature in `X-Holofin-Signature` header for verification.

```python
import hmac, hashlib

def verify_webhook(payload_bytes: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), payload_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

## 9. MCP Server (for AI Assistants)

The `holofin-mcp` package provides 6 read-only MCP tools for Claude Code, Cursor, and Windsurf.

```bash
# Claude Code
claude mcp add holofin -- uvx holofin-mcp --api-key $HOLOFIN_API_KEY

# Cursor / Windsurf (mcp.json)
{
  "mcpServers": {
    "holofin": {
      "command": "uvx",
      "args": ["holofin-mcp", "--api-key", "YOUR_KEY"]
    }
  }
}
```

Tools: `list_workflow_runs`, `get_workflow_run`, `get_extraction_data`, `get_fraud_analysis`, `get_usage`, `list_node_runs`.

## 10. Error Handling

All errors return consistent JSON:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "request_id": "req_abc123"
}
```

| Code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_ERROR | 400 | Missing/invalid parameters |
| INVALID_API_KEY | 401 | Bad or revoked key |
| INSUFFICIENT_CREDITS | 402 | Top up credits |
| INSUFFICIENT_PERMISSIONS | 403 | Wrong workspace or feature not in plan |
| JOB_NOT_FOUND | 404 | Run ID doesn't exist |
| INVALID_DOCUMENT | 422 | Not a valid PDF |
| SANDBOX_LIMIT_EXCEEDED | 429 | Sandbox page quota hit |
| INTERNAL_ERROR | 500 | Server error, retry with backoff |

## 11. Rate Limits

- 100 requests per 60-second sliding window per API key
- 429 response includes `Retry-After` header
- Sandbox orgs have a page processing quota (typically 500 pages)

## 12. Extraction Response Shape

Bank statement extraction returns per-segment data:

```json
{
  "document_parts": [
    {
      "key": "segment_1",
      "part_type": "bank_statement",
      "label": "Account FR76 3000 1234",
      "validation_status": "OK",
      "pages": [1, 2, 3],
      "data": {
        "properties": {
          "bank_name": "BNP Paribas",
          "account_number": "FR76 3000 1234 5678",
          "currency": "EUR",
          "start_date": "2026-01-01",
          "end_date": "2026-01-31",
          "start_balance": 1500.00,
          "end_balance": 2300.50
        },
        "transactions": [
          {
            "transaction_date": "2026-01-05",
            "value_date": "2026-01-05",
            "description": "VIREMENT SALAIRE",
            "amount": 3200.00,
            "transaction_type": "credit"
          }
        ]
      }
    }
  ]
}
```

Custom extraction schemas return whatever fields you defined in your workflow configuration.
