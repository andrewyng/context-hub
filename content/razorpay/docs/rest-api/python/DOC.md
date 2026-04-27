---
name: rest-api
description: "Razorpay - Indian Payment Gateway REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "razorpay,payments,india,upi,orders,refunds,settlements,api"
---

# Razorpay REST API - Python (httpx) Coding Guidelines

You are a Razorpay REST API coding expert. Help me interact with the Razorpay payment gateway using direct HTTP calls via `httpx` (async).

Official API reference: https://razorpay.com/docs/api/

## Golden Rule: Use httpx for All HTTP Calls

Always use the `httpx` async client for direct REST API interactions with Razorpay. Do NOT use `requests` or the `razorpay` SDK.

**Installation:** `pip install httpx`

## API Fundamentals

- **Base URL:** `https://api.razorpay.com/v1`
- **Authentication:** HTTP Basic Auth using `key_id` as username and `key_secret` as password
- **Content-Type:** `application/json` for request bodies
- **Response Format:** JSON
- **Amounts:** Always in smallest currency unit (paise for INR, cents for USD). 50000 paise = 500 INR.
- **Pagination:** Use `count` (max 100) and `skip` query parameters
- **Idempotency:** Supported via `X-Razorpay-Idempotency-Key` header (recommended for POST requests)

## Authentication and Client Setup

```python
import httpx, os
from contextlib import asynccontextmanager

@asynccontextmanager
async def razorpay_client():
    async with httpx.AsyncClient(
        base_url="https://api.razorpay.com/v1",
        auth=(os.environ["RAZORPAY_KEY_ID"], os.environ["RAZORPAY_KEY_SECRET"]),
        headers={"Content-Type": "application/json"},
        timeout=30.0,
    ) as client:
        yield client
```

## Orders API

Orders represent payment intents. Create an order before accepting a payment.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create an order |
| GET | `/orders/{order_id}` | Fetch an order by ID |
| GET | `/orders` | Fetch all orders |
| GET | `/orders/{order_id}/payments` | Fetch payments for an order |

### Create Order

```python
import uuid

async def create_order(amount: int, currency: str = "INR", receipt: str | None = None, notes: dict | None = None) -> dict:
    payload: dict = {"amount": amount, "currency": currency}
    if receipt:
        payload["receipt"] = receipt
    if notes:
        payload["notes"] = notes
    async with razorpay_client() as client:
        resp = await client.post("/orders", json=payload,
            headers={"X-Razorpay-Idempotency-Key": str(uuid.uuid4())})
        resp.raise_for_status()
        return resp.json()
```

### Fetch / List Orders

```python
async def fetch_order(order_id: str) -> dict:
    async with razorpay_client() as client:
        resp = await client.get(f"/orders/{order_id}")
        resp.raise_for_status()
        return resp.json()

async def list_orders(count: int = 10, skip: int = 0) -> dict:
    async with razorpay_client() as client:
        resp = await client.get("/orders", params={"count": count, "skip": skip})
        resp.raise_for_status()
        return resp.json()
```

## Payments API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/{payment_id}` | Fetch a payment |
| GET | `/payments` | Fetch all payments |
| POST | `/payments/{payment_id}/capture` | Capture an authorized payment |

### Capture Payment

Payments in `authorized` status must be captured to complete the transaction.

```python
async def capture_payment(payment_id: str, amount: int, currency: str = "INR") -> dict:
    async with razorpay_client() as client:
        resp = await client.post(f"/payments/{payment_id}/capture",
            json={"amount": amount, "currency": currency})
        resp.raise_for_status()
        return resp.json()
```

### Fetch Payment

```python
async def fetch_payment(payment_id: str) -> dict:
    async with razorpay_client() as client:
        resp = await client.get(f"/payments/{payment_id}")
        resp.raise_for_status()
        return resp.json()
```

## Refunds API

Refunds can be full or partial. Only `captured` payments can be refunded.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/{payment_id}/refund` | Create a refund |
| GET | `/refunds/{refund_id}` | Fetch a refund |
| GET | `/refunds` | List all refunds |

### Create Refund

```python
async def create_refund(payment_id: str, amount: int | None = None, speed: str = "normal") -> dict:
    """Create a full or partial refund. amount=None for full refund. speed: 'normal' or 'optimum' (instant if eligible)."""
    payload: dict = {"speed": speed}
    if amount is not None:
        payload["amount"] = amount
    async with razorpay_client() as client:
        resp = await client.post(f"/payments/{payment_id}/refund", json=payload)
        resp.raise_for_status()
        return resp.json()
```

## Additional API Endpoints

| Module | Key Endpoints |
|--------|---------------|
| Customers | `POST /customers`, `GET /customers/{id}`, `GET /customers` |
| Invoices | `POST /invoices`, `GET /invoices/{id}`, `POST /invoices/{id}/issue`, `POST /invoices/{id}/cancel` |
| Settlements | `GET /settlements`, `GET /settlements/{id}`, `POST /settlements/ondemand` |
| Virtual Accounts | `POST /virtual_accounts`, `GET /virtual_accounts/{id}`, `POST /virtual_accounts/{id}/close` |
| QR Codes (UPI) | `POST /payments/qr_codes`, `GET /payments/qr_codes/{id}`, `POST /payments/qr_codes/{id}/close` |

## Error Handling

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 401 | Authentication failure |
| 404 | Resource not found |
| 500/502 | Server / gateway error |

Error response structure: `{"error": {"code": "BAD_REQUEST_ERROR", "description": "...", "field": "amount"}}`

```python
import asyncio

class RazorpayAPIError(Exception):
    def __init__(self, status_code: int, error_code: str, description: str):
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(f"[{status_code}] {error_code}: {description}")

async def razorpay_request(method: str, endpoint: str, json_data: dict | None = None, params: dict | None = None) -> dict:
    async with razorpay_client() as client:
        try:
            resp = await client.request(method, endpoint, json=json_data, params=params)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            body = e.response.json() if e.response.content else {}
            error = body.get("error", {})
            raise RazorpayAPIError(
                status_code=e.response.status_code,
                error_code=error.get("code", "UNKNOWN"),
                description=error.get("description", str(e)),
            ) from e
        except httpx.TimeoutException as e:
            raise RazorpayAPIError(408, "TIMEOUT", "Request timed out") from e
```

## Webhook & Payment Signature Verification

```python
import hmac, hashlib

def verify_razorpay_webhook(webhook_body: bytes, signature: str, webhook_secret: str) -> bool:
    expected = hmac.new(webhook_secret.encode(), webhook_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

def verify_payment_signature(order_id: str, payment_id: str, signature: str, key_secret: str) -> bool:
    message = f"{order_id}|{payment_id}"
    expected = hmac.new(key_secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

## Common Pitfalls

1. **Amounts in paise, not rupees.** 50000 paise = INR 500. Always multiply by 100.
2. **Capture is required.** Authorized payments must be explicitly captured or they auto-refund after a configurable window.
3. **Use idempotency keys** for POST requests to prevent duplicate orders/refunds.
4. **UPI Collect is deprecated** (Feb 2026 per NPCI). Use QR codes or UPI Intent instead.
5. **Test mode keys** are prefixed `rzp_test_*`. Never mix test and live keys.
6. **Always verify** both webhook signatures and payment signatures server-side.

## Useful Links

- **API Reference:** https://razorpay.com/docs/api/
- **Dashboard:** https://dashboard.razorpay.com/
- **Webhooks:** https://razorpay.com/docs/webhooks/
- **UPI Docs:** https://razorpay.com/docs/payments/payment-methods/upi/
