---
name: rest-api
description: "GoCardless - Direct debit and bank payment collection via SEPA, Bacs, and ACH"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "gocardless,direct-debit,bank-payments,sepa,europe,recurring,api"
---

# GoCardless REST API - Python (`httpx`)

## Golden Rule

Always include both `Authorization` and `GoCardless-Version` headers on every request. GoCardless uses date-based API versioning (e.g., `2015-07-06`) -- pin your integration to a specific version. All resources are wrapped in an envelope object (e.g., `{"payments": {...}}`). Direct debit payments are asynchronous -- use webhooks to track status changes, not polling. Always use idempotency keys on create operations.

## Installation

```bash
pip install httpx python-dotenv
```

## Base URL

| Environment | URL |
|-------------|-----|
| Production  | `https://api.gocardless.com` |
| Sandbox     | `https://api-sandbox.gocardless.com` |

## Authentication

GoCardless uses Bearer token authentication. Create access tokens from the GoCardless Dashboard under Developers.

```python
import httpx
import os

GC_ACCESS_TOKEN = os.environ["GOCARDLESS_ACCESS_TOKEN"]
BASE_URL = os.environ.get("GOCARDLESS_BASE_URL", "https://api-sandbox.gocardless.com")

headers = {
    "Authorization": f"Bearer {GC_ACCESS_TOKEN}",
    "GoCardless-Version": "2015-07-06",
    "Content-Type": "application/json",
}
```

## Rate Limiting

- **1,000 requests per minute** per access token.
- Partner integrations: 1,000 requests per minute per merchant.
- Response headers: `ratelimit-limit`, `ratelimit-remaining`, `ratelimit-reset`.

```python
import asyncio

async def gc_request(
    client: httpx.AsyncClient, method: str, url: str, **kwargs
) -> dict:
    for attempt in range(5):
        resp = await client.request(method, url, headers=headers, **kwargs)
        if resp.status_code == 429:
            reset = resp.headers.get("ratelimit-reset")
            wait = int(reset) if reset else 2 ** attempt
            await asyncio.sleep(wait)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("Rate limit exceeded after retries")
```

## Methods

### Create Customer

```python
async def create_customer(
    client: httpx.AsyncClient,
    email: str,
    given_name: str,
    family_name: str,
    country_code: str,
    idempotency_key: str,
) -> dict:
    payload = {
        "customers": {
            "email": email,
            "given_name": given_name,
            "family_name": family_name,
            "country_code": country_code,
        }
    }
    req_headers = {**headers, "Idempotency-Key": idempotency_key}
    resp = await client.post(
        f"{BASE_URL}/customers", headers=req_headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()["customers"]
```

### Create Mandate (Direct Debit Authorization)

Mandates authorize you to collect payments from a customer's bank account.

```python
async def create_mandate(
    client: httpx.AsyncClient,
    customer_bank_account_id: str,
    scheme: str,
    idempotency_key: str,
) -> dict:
    payload = {
        "mandates": {
            "links": {"customer_bank_account": customer_bank_account_id},
            "scheme": scheme,  # "sepa_core", "bacs", "ach", "autogiro", etc.
        }
    }
    req_headers = {**headers, "Idempotency-Key": idempotency_key}
    resp = await client.post(
        f"{BASE_URL}/mandates", headers=req_headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()["mandates"]
```

### Create Payment

Collect a payment against an active mandate.

```python
async def create_payment(
    client: httpx.AsyncClient,
    amount: int,
    currency: str,
    mandate_id: str,
    description: str,
    charge_date: str | None = None,
    idempotency_key: str | None = None,
) -> dict:
    payload = {
        "payments": {
            "amount": amount,  # In minor units (pence, cents)
            "currency": currency,
            "description": description,
            "links": {"mandate": mandate_id},
        }
    }
    if charge_date:
        payload["payments"]["charge_date"] = charge_date  # "2026-04-01"

    req_headers = {**headers}
    if idempotency_key:
        req_headers["Idempotency-Key"] = idempotency_key

    resp = await client.post(
        f"{BASE_URL}/payments", headers=req_headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()["payments"]
```

### List Payments

```python
async def list_payments(
    client: httpx.AsyncClient,
    limit: int = 50,
    cursor: str | None = None,
    status: str | None = None,
) -> dict:
    params: dict = {"limit": limit}
    if cursor:
        params["after"] = cursor
    if status:
        params["status"] = status
    resp = await client.get(
        f"{BASE_URL}/payments", headers=headers, params=params
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Subscription

Set up recurring payments collected automatically on a schedule.

```python
async def create_subscription(
    client: httpx.AsyncClient,
    mandate_id: str,
    amount: int,
    currency: str,
    interval_unit: str,
    interval: int,
    name: str,
    idempotency_key: str,
) -> dict:
    payload = {
        "subscriptions": {
            "amount": amount,
            "currency": currency,
            "interval_unit": interval_unit,  # "weekly", "monthly", "yearly"
            "interval": interval,  # e.g., 1 for every month
            "name": name,
            "links": {"mandate": mandate_id},
        }
    }
    req_headers = {**headers, "Idempotency-Key": idempotency_key}
    resp = await client.post(
        f"{BASE_URL}/subscriptions", headers=req_headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()["subscriptions"]
```

### Create Redirect Flow (Hosted Mandate Setup)

Use redirect flows to set up mandates via a hosted page.

```python
async def create_redirect_flow(
    client: httpx.AsyncClient,
    description: str,
    session_token: str,
    success_redirect_url: str,
    scheme: str,
) -> dict:
    payload = {
        "redirect_flows": {
            "description": description,
            "session_token": session_token,
            "success_redirect_url": success_redirect_url,
            "scheme": scheme,
        }
    }
    resp = await client.post(
        f"{BASE_URL}/redirect_flows", headers=headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()["redirect_flows"]
```

### Get Payout

```python
async def get_payout(client: httpx.AsyncClient, payout_id: str) -> dict:
    resp = await client.get(
        f"{BASE_URL}/payouts/{payout_id}", headers=headers
    )
    resp.raise_for_status()
    return resp.json()["payouts"]
```

### Cancel Mandate

```python
async def cancel_mandate(client: httpx.AsyncClient, mandate_id: str) -> dict:
    resp = await client.post(
        f"{BASE_URL}/mandates/{mandate_id}/actions/cancel", headers=headers
    )
    resp.raise_for_status()
    return resp.json()["mandates"]
```

## Error Handling

GoCardless wraps errors in an `error` envelope:

```json
{
  "error": {
    "message": "amount must be greater than or equal to 1",
    "type": "validation_failed",
    "code": 422,
    "errors": [
      {
        "field": "amount",
        "message": "must be greater than or equal to 1",
        "request_pointer": "/payments/amount"
      }
    ],
    "request_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

```python
class GoCardlessAPIError(Exception):
    def __init__(self, status: int, body: dict):
        self.status = status
        err = body.get("error", {})
        self.error_type = err.get("type", "unknown")
        self.message = err.get("message", str(body))
        self.request_id = err.get("request_id")
        self.field_errors = err.get("errors", [])
        super().__init__(
            f"HTTP {status} [{self.error_type}]: {self.message} (req: {self.request_id})"
        )


async def gc_request_safe(
    client: httpx.AsyncClient, method: str, url: str, **kwargs
) -> dict:
    resp = await client.request(method, url, headers=headers, **kwargs)
    if resp.status_code >= 400:
        raise GoCardlessAPIError(resp.status_code, resp.json())
    return resp.json()
```

Error types: `validation_failed` (422), `invalid_api_usage` (400), `authentication_error` (401), `forbidden` (403), `invalid_state` (409), `rate_limit` (429), `internal_error` (500).

## Common Pitfalls

1. **Envelope wrapping** -- All request and response bodies are wrapped in a resource key (e.g., `{"payments": {...}}`). Forgetting the wrapper on requests causes 400 errors.
2. **GoCardless-Version header** -- Required on every request. Omitting it may result in unexpected behavior or use of a different API version.
3. **Asynchronous payments** -- Direct debit payments are not instant. A created payment starts as `pending_submission` and transitions through states over days. Always use webhooks for status tracking.
4. **Charge date timing** -- Payments can only be charged on banking days. The `charge_date` must be at least 2 banking days in the future for SEPA, 3 for Bacs. The API will adjust if you provide a non-banking day.
5. **Idempotency keys** -- Always provide an `Idempotency-Key` header on create operations. GoCardless returns the original response for duplicate keys within 24 hours.
6. **Mandate schemes** -- Different countries use different schemes (SEPA for EU, Bacs for UK, ACH for US). Ensure the scheme matches the customer's bank account country.
7. **Webhook signature verification** -- Always verify webhook signatures using the secret from your GoCardless dashboard. Never trust webhook payloads without verification.
8. **Cursor-based pagination** -- Use the `after` parameter with the last resource ID. Do not use offset-based pagination.
