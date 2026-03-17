---
name: rest-api
description: "Wise (TransferWise) - International money transfer and multi-currency account REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "wise,transferwise,money-transfer,international,fx,payments,europe,api"
---

# Wise REST API - Python (`httpx`)

## Golden Rule

Always use API version paths as documented (v1, v2, v3, v4 depending on endpoint). The Wise API returns two different error formats (key/value and array) -- your code must handle both. Never store API tokens in source code; use environment variables. All monetary amounts use minor units or decimal strings depending on the endpoint -- always check the docs for each resource.

## Installation

```bash
pip install httpx python-dotenv
```

## Base URL

| Environment | URL |
|-------------|-----|
| Production  | `https://api.wise.com` |
| Sandbox     | `https://api.sandbox.transferwise.tech` |

## Authentication

Wise supports multiple auth methods. The most common for server integrations is a Personal Token or OAuth 2.0 Bearer token.

```python
import httpx
import os

WISE_API_TOKEN = os.environ["WISE_API_TOKEN"]
BASE_URL = os.environ.get("WISE_BASE_URL", "https://api.wise.com")

headers = {
    "Authorization": f"Bearer {WISE_API_TOKEN}",
    "Content-Type": "application/json",
}
```

OAuth 2.0 tokens (UserToken) expire after 12 hours and must be refreshed. Personal tokens do not expire but have limited scope.

## Rate Limiting

- **100 requests per second** and **1,000 requests per minute** (default thresholds).
- On HTTP 429, check the `Retry-After` header and implement exponential backoff.

```python
import asyncio

async def wise_request(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    for attempt in range(5):
        resp = await client.request(method, url, **kwargs)
        if resp.status_code == 429:
            retry_after = int(resp.headers.get("Retry-After", 2 ** attempt))
            await asyncio.sleep(retry_after)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("Rate limit exceeded after retries")
```

## Methods

### Get Profiles

Retrieve your personal and business profiles (needed for most subsequent calls).

```python
async def get_profiles(client: httpx.AsyncClient) -> list[dict]:
    resp = await client.get(f"{BASE_URL}/v2/profiles", headers=headers)
    resp.raise_for_status()
    return resp.json()
```

### Create Quote

Create a quote for a transfer with exchange rate and fees.

```python
async def create_quote(
    client: httpx.AsyncClient,
    profile_id: int,
    source_currency: str,
    target_currency: str,
    source_amount: float | None = None,
    target_amount: float | None = None,
) -> dict:
    payload = {
        "sourceCurrency": source_currency,
        "targetCurrency": target_currency,
        "profileId": profile_id,
    }
    if source_amount:
        payload["sourceAmount"] = source_amount
    elif target_amount:
        payload["targetAmount"] = target_amount

    resp = await client.post(
        f"{BASE_URL}/v3/profiles/{profile_id}/quotes",
        headers=headers,
        json=payload,
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Recipient

Add a beneficiary account for transfers.

```python
async def create_recipient(
    client: httpx.AsyncClient,
    profile_id: int,
    account_holder: str,
    currency: str,
    recipient_type: str,
    details: dict,
) -> dict:
    payload = {
        "profile": profile_id,
        "accountHolderName": account_holder,
        "currency": currency,
        "type": recipient_type,
        "details": details,
    }
    resp = await client.post(
        f"{BASE_URL}/v1/accounts", headers=headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Transfer

Initiate a transfer against an existing quote and recipient.

```python
async def create_transfer(
    client: httpx.AsyncClient,
    target_account_id: int,
    quote_id: str,
    reference: str,
    idempotency_uuid: str,
) -> dict:
    payload = {
        "targetAccount": target_account_id,
        "quoteUuid": quote_id,
        "customerTransactionId": idempotency_uuid,
        "details": {"reference": reference},
    }
    resp = await client.post(
        f"{BASE_URL}/v1/transfers", headers=headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Fund Transfer

Fund a transfer from your Wise balance.

```python
async def fund_transfer(
    client: httpx.AsyncClient, profile_id: int, transfer_id: int
) -> dict:
    payload = {"type": "BALANCE"}
    resp = await client.post(
        f"{BASE_URL}/v3/profiles/{profile_id}/transfers/{transfer_id}/payments",
        headers=headers,
        json=payload,
    )
    resp.raise_for_status()
    return resp.json()
```

### Get Balances

List multi-currency balances on your account.

```python
async def get_balances(client: httpx.AsyncClient, profile_id: int) -> list[dict]:
    resp = await client.get(
        f"{BASE_URL}/v4/profiles/{profile_id}/balances?types=STANDARD",
        headers=headers,
    )
    resp.raise_for_status()
    return resp.json()
```

### Get Exchange Rate

Fetch live exchange rates.

```python
async def get_rate(
    client: httpx.AsyncClient, source: str, target: str
) -> list[dict]:
    resp = await client.get(
        f"{BASE_URL}/v1/rates",
        headers=headers,
        params={"source": source, "target": target},
    )
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

Wise returns two error response formats:

**Key/Value format:**
```json
{"error": "INVALID_REQUEST", "error_description": "Quote has expired"}
```

**Array format:**
```json
{
  "errors": [
    {"code": "NOT_VALID", "message": "Field is required", "path": "details.iban", "arguments": ["iban"]}
  ]
}
```

Handle both:

```python
class WiseAPIError(Exception):
    def __init__(self, status: int, body: dict):
        self.status = status
        self.body = body
        if "error" in body:
            msg = f"{body['error']}: {body.get('error_description', '')}"
        elif "errors" in body:
            msgs = [f"{e['path']}: {e['message']}" for e in body["errors"]]
            msg = "; ".join(msgs)
        else:
            msg = str(body)
        super().__init__(f"HTTP {status} - {msg}")


async def wise_request_safe(client: httpx.AsyncClient, method: str, url: str, **kwargs) -> dict:
    resp = await client.request(method, url, **kwargs)
    if resp.status_code >= 400:
        raise WiseAPIError(resp.status_code, resp.json())
    return resp.json()
```

Key HTTP status codes: 400/422 (validation), 401 (auth), 403 (forbidden), 404 (not found), 408 (timeout), 429 (rate limit), 500 (server error).

## Common Pitfalls

1. **Quote expiry** -- Quotes have a limited TTL. Always create a fresh quote before initiating a transfer. Do not cache quote IDs.
2. **Two error formats** -- The API returns either key/value or array-based errors depending on the endpoint. Handle both structures.
3. **Profile ID required everywhere** -- Most endpoints require a `profileId`. Fetch profiles first and cache the ID.
4. **Idempotency** -- Always provide a unique `customerTransactionId` (UUID) per transfer to avoid duplicate payments.
5. **Sandbox vs Production URLs** -- The sandbox uses a completely different domain (`sandbox.transferwise.tech`), not a subdomain of `wise.com`.
6. **SCA (Strong Customer Authentication)** -- Certain operations (large transfers, sensitive changes) may trigger SCA challenges requiring additional user interaction.
7. **Currency precision** -- Different currencies have different decimal precisions. Always check the quote response for the exact amounts.
