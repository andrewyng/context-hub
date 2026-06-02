---
name: rest-api
description: "Mollie - European payment service provider for iDEAL, Bancontact, cards, and more"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "mollie,payments,europe,ideal,bancontact,checkout,api"
---

# Mollie REST API - Python (`httpx`)

## Golden Rule

Always use Bearer token authentication with your API key. Mollie uses HAL+JSON for responses -- follow `_links` for pagination and related resources. All amounts are strings with two decimal places (e.g., `"10.00"`), not numbers. Use test API keys (prefixed `test_`) during development and live keys (prefixed `live_`) in production. Support idempotency via the `Idempotency-Key` header to avoid duplicate operations.

## Installation

```bash
pip install httpx python-dotenv
```

## Base URL

| Environment | URL |
|-------------|-----|
| Production  | `https://api.mollie.com/v2` |
| Test        | `https://api.mollie.com/v2` (same URL, use `test_` API key) |

Mollie uses the same base URL for both environments. The API key prefix (`test_` vs `live_`) determines the mode.

## Authentication

```python
import httpx
import os

MOLLIE_API_KEY = os.environ["MOLLIE_API_KEY"]  # test_xxxx or live_xxxx
BASE_URL = "https://api.mollie.com/v2"

headers = {
    "Authorization": f"Bearer {MOLLIE_API_KEY}",
    "Content-Type": "application/json",
}
```

Mollie also supports OAuth2 for partner/marketplace integrations (Mollie Connect).

## Rate Limiting

Mollie returns HTTP 429 when rate limits are exceeded. The response may include a `Retry-After` header.

```python
import asyncio

async def mollie_request(
    client: httpx.AsyncClient, method: str, url: str, **kwargs
) -> dict:
    for attempt in range(5):
        resp = await client.request(method, url, headers=headers, **kwargs)
        if resp.status_code == 429:
            retry_after = int(resp.headers.get("Retry-After", 2 ** attempt))
            await asyncio.sleep(retry_after)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("Rate limit exceeded after retries")
```

## Methods

### Create Payment

Create a payment with a specified method or let the customer choose.

```python
async def create_payment(
    client: httpx.AsyncClient,
    amount: str,
    currency: str,
    description: str,
    redirect_url: str,
    webhook_url: str,
    method: str | list[str] | None = None,
    idempotency_key: str | None = None,
) -> dict:
    payload = {
        "amount": {"currency": currency, "value": amount},  # e.g., "10.00"
        "description": description,
        "redirectUrl": redirect_url,
        "webhookUrl": webhook_url,
    }
    if method:
        payload["method"] = method  # "ideal", "bancontact", "creditcard", etc.

    req_headers = {**headers}
    if idempotency_key:
        req_headers["Idempotency-Key"] = idempotency_key

    resp = await client.post(
        f"{BASE_URL}/payments", headers=req_headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Get Payment

```python
async def get_payment(client: httpx.AsyncClient, payment_id: str) -> dict:
    resp = await client.get(f"{BASE_URL}/payments/{payment_id}", headers=headers)
    resp.raise_for_status()
    return resp.json()
```

### List Payments

```python
async def list_payments(
    client: httpx.AsyncClient, limit: int = 50, cursor: str | None = None
) -> dict:
    params = {"limit": limit}
    if cursor:
        params["from"] = cursor
    resp = await client.get(
        f"{BASE_URL}/payments", headers=headers, params=params
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Refund

```python
async def create_refund(
    client: httpx.AsyncClient,
    payment_id: str,
    amount: str,
    currency: str,
    description: str | None = None,
) -> dict:
    payload = {"amount": {"currency": currency, "value": amount}}
    if description:
        payload["description"] = description
    resp = await client.post(
        f"{BASE_URL}/payments/{payment_id}/refunds",
        headers=headers,
        json=payload,
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Customer

```python
async def create_customer(
    client: httpx.AsyncClient,
    name: str,
    email: str,
    locale: str | None = None,
) -> dict:
    payload = {"name": name, "email": email}
    if locale:
        payload["locale"] = locale
    resp = await client.post(
        f"{BASE_URL}/customers", headers=headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Subscription (Recurring)

Requires a customer with a valid mandate (first payment completed).

```python
async def create_subscription(
    client: httpx.AsyncClient,
    customer_id: str,
    amount: str,
    currency: str,
    interval: str,
    description: str,
    webhook_url: str,
) -> dict:
    payload = {
        "amount": {"currency": currency, "value": amount},
        "interval": interval,  # "1 month", "2 weeks", "1 year", etc.
        "description": description,
        "webhookUrl": webhook_url,
    }
    resp = await client.post(
        f"{BASE_URL}/customers/{customer_id}/subscriptions",
        headers=headers,
        json=payload,
    )
    resp.raise_for_status()
    return resp.json()
```

### List Payment Methods

```python
async def list_methods(
    client: httpx.AsyncClient,
    amount: str | None = None,
    currency: str | None = None,
) -> dict:
    params = {}
    if amount and currency:
        params["amount[value]"] = amount
        params["amount[currency]"] = currency
    resp = await client.get(
        f"{BASE_URL}/methods", headers=headers, params=params
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Order

For order-based payments (required for Klarna, pay-later methods).

```python
async def create_order(
    client: httpx.AsyncClient,
    amount: str,
    currency: str,
    order_number: str,
    lines: list[dict],
    billing_address: dict,
    redirect_url: str,
    webhook_url: str,
    locale: str = "en_US",
) -> dict:
    payload = {
        "amount": {"currency": currency, "value": amount},
        "orderNumber": order_number,
        "lines": lines,
        "billingAddress": billing_address,
        "redirectUrl": redirect_url,
        "webhookUrl": webhook_url,
        "locale": locale,
    }
    resp = await client.post(
        f"{BASE_URL}/orders", headers=headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

Mollie returns HAL-formatted JSON errors:

```json
{
  "status": 422,
  "title": "Unprocessable Entity",
  "detail": "The amount is higher than the maximum",
  "field": "amount",
  "_links": {
    "documentation": {
      "href": "https://docs.mollie.com/errors",
      "type": "text/html"
    }
  }
}
```

```python
class MollieAPIError(Exception):
    def __init__(self, status: int, body: dict):
        self.status = status
        self.title = body.get("title", "Unknown")
        self.detail = body.get("detail", str(body))
        self.field = body.get("field")
        super().__init__(f"HTTP {status} [{self.title}]: {self.detail}")
        if self.field:
            self.args = (f"{self.args[0]} (field: {self.field})",)


async def mollie_request_safe(
    client: httpx.AsyncClient, method: str, url: str, **kwargs
) -> dict:
    resp = await client.request(method, url, headers=headers, **kwargs)
    if resp.status_code >= 400:
        raise MollieAPIError(resp.status_code, resp.json())
    return resp.json()
```

Key status codes: 200 (OK), 201 (created), 204 (deleted), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict/duplicate), 422 (validation), 429 (rate limit), 500/502/503/504 (server errors).

## Common Pitfalls

1. **Amounts are strings** -- Always pass amounts as `"10.00"` (string), never as a number. The API rejects numeric amounts.
2. **Test vs Live keys** -- Same base URL for both. The key prefix (`test_` / `live_`) determines the mode. Do not mix keys across environments.
3. **Webhook required** -- Most payment flows require a `webhookUrl`. Mollie sends POST requests to notify you of status changes. Always verify the payment status server-side after receiving a webhook.
4. **HAL pagination** -- Use `_links.next.href` to paginate. Do not construct pagination URLs manually.
5. **Recurring payments setup** -- Before creating subscriptions, you must: (a) create a customer, (b) create a "first" payment with `sequenceType: "first"` to establish a mandate, (c) then create subscriptions against that customer.
6. **Idempotency** -- Use the `Idempotency-Key` header on create operations to prevent duplicate payments/orders on retries.
7. **Order vs Payment API** -- Use the Orders API for Klarna and other pay-later methods that require order line details. Use the Payments API for simple card/iDEAL/Bancontact flows.
