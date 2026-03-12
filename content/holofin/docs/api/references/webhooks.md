# Webhooks Reference

## Setup

Configure endpoints at https://app.holofin.ai/settings/webhooks/. Each endpoint has a signing secret for HMAC verification.

## Event Types

| Event | When |
|-------|------|
| `workflow-run.completed` | All nodes finished, extraction ready |
| `workflow-run.failed` | Unrecoverable error |
| `workflow-run.paused` | Waiting for human review approval |
| `node-run.completed` | Individual node (classifier/extractor/etc.) done |
| `node-run.failed` | Individual node failed |

## Payload Structure

```json
{
  "id": "whev_abc123",
  "event": "workflow-run.completed",
  "created_at": "2026-01-15T14:30:00Z",
  "data": {
    "object": {
      "run_id": "wr_xyz789",
      "workflow_id": "wf_abc123",
      "workflow_name": "Bank Statement Processing",
      "document_id": "doc_abc123",
      "status": "completed",
      "validation_status": "OK",
      "timestamp": "2026-01-15T14:30:00Z"
    }
  }
}
```

### Event-specific fields in `data.object`

**workflow-run.completed:**
- `validation_status`: `"OK"` | `"ERROR"` | `"WARN"` | `null`

**workflow-run.paused:**
- `pause_reason`: e.g. `"approval"`
- `paused_at_node`: node ID waiting for input

**workflow-run.failed:**
- `error`: error message string

**node-run.completed:**
- `node_id`, `node_type` (classifier, segmenter, extractor, humanReview, validator)
- `result`: node-type-specific output data

## Signature Verification

Verify the `X-Holofin-Signature` header using HMAC-SHA256 with your endpoint's signing secret:

```python
import hmac, hashlib

def verify_webhook(payload_bytes: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), payload_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

## Delivery

- POST to your endpoint URL
- Must respond with 2xx within 30 seconds
- Retried on failure with exponential backoff
- Endpoint auto-disabled after repeated failures
