---
name: rest-api
description: "MercadoPago - Latin America Payment Platform REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "mercadopago,payments,latam,brazil,argentina,mexico,checkout,api"
---

# MercadoPago REST API — Python (httpx)

## Golden Rule

Always include the `X-Idempotency-Key` header on POST requests — MercadoPago will reject duplicate keys with HTTP 422. Amounts use **major currency units** with up to 2 decimal places (e.g., 100.50 = BRL 100.50). Every payment request must include a unique `external_reference` for reconciliation. Access tokens are per-country — a Brazilian token cannot process Argentine payments.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://api.mercadopago.com
```

All endpoints are versioned in the path (e.g., `/v1/payments`).

## Authentication

MercadoPago uses an **Access Token** (OAuth 2.0 Bearer) passed in the `Authorization` header.

```python
import httpx
import os
import uuid

ACCESS_TOKEN = os.environ["MERCADOPAGO_ACCESS_TOKEN"]

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json",
}

async def get_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url="https://api.mercadopago.com",
        headers=headers,
        timeout=30.0,
    )

def idempotency_key() -> str:
    return str(uuid.uuid4())
```

**Token types:**
- `APP_USR-...` — Production access token
- `TEST-...` — Test/sandbox access token

Tokens are obtained from the MercadoPago dashboard or via OAuth flow for marketplace integrations.

### OAuth Token Exchange (Marketplace)

```python
async def exchange_oauth_code(client: httpx.AsyncClient, auth_code: str,
                               client_id: str, client_secret: str,
                               redirect_uri: str):
    payload = {
        "grant_type": "authorization_code",
        "client_id": client_id,
        "client_secret": client_secret,
        "code": auth_code,
        "redirect_uri": redirect_uri,
    }
    resp = await client.post("/oauth/token", json=payload)
    resp.raise_for_status()
    return resp.json()  # {"access_token": "...", "refresh_token": "...", "expires_in": ...}
```

## Rate Limiting

MercadoPago does not publish exact rate limits but returns HTTP **429** when exceeded. General guidance:
- Avoid bursts above ~50 requests/second.
- Use idempotency keys to safely retry without creating duplicates.
- Implement exponential backoff on 429 responses.

```python
import asyncio

async def request_with_retry(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    for attempt in range(5):
        resp = await client.request(method, url, **kwargs)
        if resp.status_code == 429:
            wait = 2 ** attempt
            await asyncio.sleep(wait)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("Rate limit exceeded after retries")
```

## Methods

### Create Payment

Process a card payment (requires a card token from the frontend SDK).

```python
async def create_payment(client: httpx.AsyncClient, amount: float,
                          token: str, description: str, email: str,
                          payment_method_id: str, installments: int = 1,
                          external_reference: str | None = None):
    payload = {
        "transaction_amount": amount,
        "token": token,
        "description": description,
        "payment_method_id": payment_method_id,
        "installments": installments,
        "payer": {"email": email},
    }
    if external_reference:
        payload["external_reference"] = external_reference

    resp = await client.post(
        "/v1/payments",
        json=payload,
        headers={"X-Idempotency-Key": idempotency_key()},
    )
    resp.raise_for_status()
    return resp.json()
```

### Get Payment

```python
async def get_payment(client: httpx.AsyncClient, payment_id: int):
    resp = await client.get(f"/v1/payments/{payment_id}")
    resp.raise_for_status()
    return resp.json()
```

### Search Payments

```python
async def search_payments(client: httpx.AsyncClient, external_reference: str | None = None,
                           status: str | None = None, offset: int = 0, limit: int = 30):
    params = {"offset": offset, "limit": limit}
    if external_reference:
        params["external_reference"] = external_reference
    if status:
        params["status"] = status  # "approved", "pending", "rejected"
    resp = await client.get("/v1/payments/search", params=params)
    resp.raise_for_status()
    return resp.json()["results"]
```

### Create Checkout Preference

Generate a hosted checkout (Checkout Pro) link.

```python
async def create_preference(client: httpx.AsyncClient, title: str,
                              unit_price: float, quantity: int = 1,
                              currency_id: str = "BRL",
                              back_urls: dict | None = None,
                              external_reference: str | None = None):
    payload = {
        "items": [
            {
                "title": title,
                "unit_price": unit_price,
                "quantity": quantity,
                "currency_id": currency_id,
            }
        ],
    }
    if back_urls:
        payload["back_urls"] = back_urls  # {"success": "...", "failure": "...", "pending": "..."}
    if external_reference:
        payload["external_reference"] = external_reference

    resp = await client.post(
        "/checkout/preferences",
        json=payload,
        headers={"X-Idempotency-Key": idempotency_key()},
    )
    resp.raise_for_status()
    data = resp.json()
    return data  # data["init_point"] = checkout URL, data["sandbox_init_point"] for testing
```

### Refund Payment

```python
async def refund_payment(client: httpx.AsyncClient, payment_id: int,
                          amount: float | None = None):
    """Full refund if amount is None, partial refund otherwise."""
    payload = {}
    if amount is not None:
        payload["amount"] = amount

    resp = await client.post(
        f"/v1/payments/{payment_id}/refunds",
        json=payload,
        headers={"X-Idempotency-Key": idempotency_key()},
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Customer

```python
async def create_customer(client: httpx.AsyncClient, email: str,
                           first_name: str = "", last_name: str = ""):
    payload = {"email": email, "first_name": first_name, "last_name": last_name}
    resp = await client.post("/v1/customers", json=payload,
                              headers={"X-Idempotency-Key": idempotency_key()})
    resp.raise_for_status()
    return resp.json()
```

### Create Order (newer API)

```python
async def create_order(client: httpx.AsyncClient, amount: float,
                        currency: str, description: str,
                        external_reference: str):
    payload = {
        "total_amount": amount,
        "currency_id": currency,
        "description": description,
        "external_reference": external_reference,
    }
    resp = await client.post(
        "/v1/orders",
        json=payload,
        headers={"X-Idempotency-Key": idempotency_key()},
    )
    resp.raise_for_status()
    return resp.json()
```

### Refund Order (Full)

```python
async def refund_order(client: httpx.AsyncClient, order_id: str):
    resp = await client.post(
        f"/v1/orders/{order_id}/refund",
        headers={"X-Idempotency-Key": idempotency_key()},
    )
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

MercadoPago returns structured error responses:

```json
{
  "message": "Invalid card number",
  "error": "bad_request",
  "status": 400,
  "cause": [
    {"code": "325", "description": "Invalid card number"}
  ]
}
```

HTTP status codes:
- **200/201** — Success
- **400** — Bad request / validation error
- **401** — Invalid or expired access token
- **403** — Forbidden (wrong country token, insufficient permissions)
- **404** — Resource not found
- **422** — Idempotency key already used (code 422001), or unprocessable entity
- **429** — Rate limited
- **5xx** — MercadoPago server error

```python
class MercadoPagoError(Exception):
    def __init__(self, status_code: int, message: str, causes: list | None = None):
        self.status_code = status_code
        self.message = message
        self.causes = causes or []
        super().__init__(f"[{status_code}] {message}")

async def safe_request(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    resp = await client.request(method, url, **kwargs)
    if resp.status_code >= 400:
        body = resp.json()
        raise MercadoPagoError(
            resp.status_code,
            body.get("message", "Unknown error"),
            body.get("cause", []),
        )
    return resp.json()
```

## Common Pitfalls

1. **Missing X-Idempotency-Key** — POST requests without this header risk creating duplicates on retries. Always generate a UUID per unique operation.
2. **Country-specific access tokens** — A Brazilian access token cannot process payments in Argentina. Each country integration needs its own credentials.
3. **Installments (parcelas)** — In Brazil and Argentina, installment payments are standard. Omitting `installments` defaults to 1. The `payment_method_id` must support installments.
4. **Currency precision** — Use 2 decimal places max. Amounts like `10.999` cause 400 errors.
5. **Payment status flow** — Payments can be `approved`, `pending`, `in_process`, `rejected`, or `refunded`. Webhook notifications (`payment.created`, `payment.updated`) are essential for async methods like Boleto or Pix.
6. **Pix payments** — For Pix (Brazil), create a payment with `payment_method_id: "pix"` and no card token. The response includes a `point_of_interaction.transaction_data.qr_code` for display.
7. **Sandbox vs. production URLs** — Both use the same base URL (`api.mercadopago.com`). The token type determines the environment.
8. **Webhook verification** — Validate webhooks by fetching the payment/order by ID from the API rather than trusting the webhook payload directly.
9. **Preference expiration** — Checkout Pro preferences expire after 30 days by default. Set `expires` and `expiration_date_to` for shorter windows.
