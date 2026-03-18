# hookpipe REST API Reference

Base URL: `https://your-hookpipe.workers.dev`

## Authentication

All `/api/v1/*` endpoints (except bootstrap) require a Bearer token:

```
Authorization: Bearer hf_sk_xxx
```

**Bootstrap flow** (first-time setup):

```bash
curl -X POST https://your-hookpipe.workers.dev/api/v1/bootstrap
# Returns: { "key": "hf_sk_xxx", "id": "key_abc123" }
```

Bootstrap is one-time and self-locks after first use.

## Webhook Ingestion (Public)

```
POST /webhooks/:source_id
```

Accepts webhooks from providers. No authentication required. Returns `202 Accepted`.

```
GET /health
```

Returns health status with `setup_required` flag.

## Sources

```
GET    /api/v1/sources           # List all sources
GET    /api/v1/sources/:id       # Get source details
POST   /api/v1/sources           # Create source
PUT    /api/v1/sources/:id       # Update source
DELETE /api/v1/sources/:id       # Delete source
```

### Create source

```json
{
  "name": "stripe-prod",
  "provider": "stripe",
  "verification": {
    "type": "stripe-signature",
    "secret": "whsec_xxx"
  }
}
```

**Verification types**: `stripe-signature`, `slack-signature`, `hmac-sha256`, `hmac-sha1`

Response includes the webhook ingestion URL:

```json
{
  "id": "src_abc123",
  "name": "stripe-prod",
  "provider": "stripe",
  "verification_type": "stripe-signature",
  "verification_secret": "****wxyz",
  "created_at": "2026-03-17T00:00:00Z",
  "updated_at": "2026-03-17T00:00:00Z"
}
```

Secrets are masked in GET responses (`****xxxx`). The full secret is only returned on creation.

## Destinations

```
GET    /api/v1/destinations              # List all destinations
GET    /api/v1/destinations/:id          # Get destination details
POST   /api/v1/destinations              # Create destination
PUT    /api/v1/destinations/:id          # Update destination
DELETE /api/v1/destinations/:id          # Delete destination
GET    /api/v1/destinations/:id/circuit  # Circuit breaker state
GET    /api/v1/destinations/:id/failed   # DLQ (failed deliveries)
POST   /api/v1/destinations/:id/replay-failed  # Replay all failed
```

### Create destination

```json
{
  "name": "app-primary",
  "url": "https://app.com/webhook",
  "retry_policy": {
    "strategy": "exponential",
    "max_retries": 10,
    "interval_ms": 60000,
    "max_interval_ms": 86400000,
    "timeout_ms": 30000,
    "on_status": [500, 502, 503, 504]
  }
}
```

**Retry strategies**: `exponential` (default), `linear`, `fixed`

### DLQ query parameters

```
GET /api/v1/destinations/:id/failed?limit=100&offset=0
```

## Subscriptions

```
GET    /api/v1/subscriptions      # List all subscriptions
POST   /api/v1/subscriptions      # Create subscription
DELETE /api/v1/subscriptions/:id  # Delete subscription
```

### Create subscription

```json
{
  "source_id": "src_abc123",
  "destination_id": "dst_def456",
  "event_types": ["payment_intent.*", "charge.failed"]
}
```

`event_types` defaults to `["*"]` (all events). Supports wildcard matching.

## Events

```
GET  /api/v1/events                    # List events
GET  /api/v1/events/:id                # Get event with full payload
GET  /api/v1/events/:id/deliveries     # Delivery attempts for an event
GET  /api/v1/events/deliveries         # All deliveries (for tailing)
POST /api/v1/events/:id/replay         # Replay event
```

### List events query parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `source_id` | — | Filter by source |
| `after` | — | Cursor for pagination |
| `limit` | 50 | Max results |
| `offset` | 0 | Offset |

### Event object

```json
{
  "id": "evt_abc123",
  "source_id": "src_abc123",
  "event_type": "payment_intent.succeeded",
  "idempotency_key": null,
  "payload": { "...full webhook payload from R2..." },
  "headers": { "stripe-signature": "..." },
  "received_at": "2026-03-17T00:00:00Z"
}
```

Full payload is fetched from R2 only on `GET /api/v1/events/:id`.

### Delivery object

```json
{
  "id": "dlv_abc123",
  "event_id": "evt_abc123",
  "destination_id": "dst_def456",
  "status": "success",
  "attempt": 1,
  "status_code": 200,
  "latency_ms": 150,
  "response_body": "OK",
  "next_retry_at": null,
  "created_at": "2026-03-17T00:00:00Z",
  "updated_at": "2026-03-17T00:00:00Z"
}
```

**Delivery statuses**: `pending`, `success`, `failed`, `dlq`

## API Keys

```
GET    /api/v1/keys      # List API keys
POST   /api/v1/keys      # Create API key
DELETE /api/v1/keys/:id  # Revoke API key
```

### Create API key

```json
{
  "name": "ci-deploy",
  "scopes": ["admin"],
  "expires_at": "2027-01-01T00:00:00Z"
}
```

## Export / Import

```
GET  /api/v1/export   # Export all configuration (sources, destinations, subscriptions)
POST /api/v1/import   # Import configuration (skips existing resources by name)
```

## Error Response Format

All errors return:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid URL: must use HTTPS"
  }
}
```

| Code | HTTP | Description |
|------|------|-------------|
| `BAD_REQUEST` | 400 | Invalid input |
| `VALIDATION_ERROR` | 400 | Schema validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `SETUP_REQUIRED` | 401 | Instance not bootstrapped yet |
| `BOOTSTRAP_COMPLETED` | 409 | Bootstrap already done |
| `NOT_FOUND` | 404 | Resource not found |
| `SOURCE_NOT_FOUND` | 404 | Source ID in webhook URL is invalid |
| `RATE_LIMITED` | 429 | Too many requests |

## Security

- SSRF protection: destination URLs block private IPs, localhost, non-HTTPS
- Payload size limit: 256KB max on ingestion
- Timing-safe signature comparison for all HMAC verification
- API key hashes stored as SHA-256 (plain text never stored)
