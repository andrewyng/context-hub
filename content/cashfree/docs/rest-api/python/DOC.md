---
name: rest-api
description: "Cashfree Payments - Indian Payment Gateway & Payouts API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "cashfree,payments,india,upi,payment-gateway,payouts,refunds,orders,api,integration"
---

# Cashfree Payments API

> **Golden Rule:** Cashfree has an official Python SDK (`cashfree-pg` on PyPI), but you can also use `httpx` for direct REST API access. Auth uses `x-client-id` and `x-client-secret` headers. The `x-api-version` header is required on every request. PG and Payouts use separate credentials.

## Installation

```bash
pip install httpx
# Or use the official SDK: pip install cashfree-pg
```

## Base URL

| Environment | Payment Gateway | Payouts |
|---|---|---|
| Production | `https://api.cashfree.com/pg` | `https://payout-api.cashfree.com/payout` |
| Sandbox | `https://sandbox.cashfree.com/pg` | `https://payout-gamma.cashfree.com/payout` |

## Authentication

**Type:** Client ID + Secret (custom headers)

```python
import httpx

CLIENT_ID = "your-cashfree-app-id"
CLIENT_SECRET = "your-cashfree-secret-key"
BASE_URL = "https://sandbox.cashfree.com/pg"  # Use sandbox for testing

headers = {
    "x-client-id": CLIENT_ID,
    "x-client-secret": CLIENT_SECRET,
    "x-api-version": "2025-01-01",
    "Content-Type": "application/json"
}
client = httpx.AsyncClient(headers=headers)
```

**Important:** Never expose `x-client-secret` in client-side code. Server-to-server only.

## Rate Limiting

Per-account, per-IP, per-minute limits (viewable in dashboard). Response headers: `x-ratelimit-limit`, `x-ratelimit-remaining`. HTTP 429 blocks requests for up to one minute.

## Methods

### `create_order`

**Endpoint:** `POST /orders`

Create a payment order. Returns a `payment_session_id` for client-side payment flow.

| Parameter | Type | Default |
|---|---|---|
| `order_amount` | `float` | **required** |
| `order_currency` | `str` | **required** (`INR`) |
| `customer_details.customer_id` | `str` | **required** |
| `customer_details.customer_phone` | `str` | **required** |
| `customer_details.customer_email` | `str` | `None` |
| `order_meta.return_url` | `str` | `None` |

**Returns:** JSON with `cf_order_id`, `order_id`, `order_status`, `payment_session_id`

```python
payload = {
    "order_amount": 100.00,
    "order_currency": "INR",
    "customer_details": {
        "customer_id": "cust_123",
        "customer_phone": "9876543210",
        "customer_email": "customer@example.com"
    },
    "order_meta": {
        "return_url": "https://yoursite.com/return?order_id={order_id}"
    }
}
response = await client.post(f"{BASE_URL}/orders", json=payload)
response.raise_for_status()
order = response.json()
session_id = order["payment_session_id"]
```

### `get_order`

**Endpoint:** `GET /orders/{order_id}`

Retrieve order details and status.

**Returns:** JSON with order details. Statuses: `ACTIVE`, `PAID`, `EXPIRED`, `TERMINATED`

```python
order_id = "order_123"
response = await client.get(f"{BASE_URL}/orders/{order_id}")
response.raise_for_status()
order = response.json()
status = order["order_status"]
```

### `get_payments_for_order`

**Endpoint:** `GET /orders/{order_id}/payments`

List all payment attempts for an order.

```python
response = await client.get(f"{BASE_URL}/orders/{order_id}/payments")
response.raise_for_status()
payments = response.json()
```

### `create_refund`

**Endpoint:** `POST /orders/{order_id}/refunds`

Initiate a refund for a paid order.

| Parameter | Type | Default |
|---|---|---|
| `refund_amount` | `float` | **required** |
| `refund_id` | `str` | **required** (3-40 alphanumeric chars) |
| `refund_note` | `str` | `None` |
| `refund_speed` | `str` | `STANDARD` (or `INSTANT`) |

**Returns:** JSON with `cf_refund_id`, `refund_status`. Statuses: `SUCCESS`, `PENDING`, `CANCELLED`, `FAILED`

```python
payload = {
    "refund_amount": 50.00,
    "refund_id": "refund_abc123",
    "refund_note": "Customer requested refund",
    "refund_speed": "STANDARD"
}
response = await client.post(f"{BASE_URL}/orders/{order_id}/refunds", json=payload)
response.raise_for_status()
refund = response.json()
```

### `create_payment_link`

**Endpoint:** `POST /links`

Generate a shareable payment link.

| Parameter | Type | Default |
|---|---|---|
| `link_amount` | `float` | **required** |
| `link_currency` | `str` | **required** (`INR`) |
| `link_purpose` | `str` | **required** |
| `customer_details.customer_phone` | `str` | **required** |
| `link_expiry_time` | `str` | `None` (ISO 8601 with timezone) |

**Returns:** JSON with `link_url`, `cf_link_id`, `link_status`

```python
payload = {
    "link_amount": 500.00,
    "link_currency": "INR",
    "link_purpose": "Monthly subscription",
    "customer_details": {
        "customer_phone": "9876543210",
        "customer_name": "Jane Doe"
    },
    "link_expiry_time": "2024-12-31T23:59:59+05:30"
}
response = await client.post(f"{BASE_URL}/links", json=payload)
response.raise_for_status()
link = response.json()
payment_url = link["link_url"]
```

### `create_payout`

**Endpoint:** `POST /v2/transfers` (on Payouts base URL)

Transfer funds to bank account, UPI, or card. Uses separate Payouts credentials.

```python
PAYOUT_URL = "https://payout-api.cashfree.com/payout"
payout_headers = {
    "x-client-id": "your-payout-app-id",
    "x-client-secret": "your-payout-secret",
    "x-api-version": "2025-01-01",
    "Content-Type": "application/json"
}
payload = {
    "transfer_id": "txn_001",
    "transfer_amount": 1000.00,
    "transfer_currency": "INR",
    "beneficiary_details": {
        "beneficiary_id": "ben_123",
        "transfer_mode": "upi",
        "beneficiary_vpa": "user@upi"
    }
}
response = await client.post(
    f"{PAYOUT_URL}/v2/transfers", json=payload, headers=payout_headers
)
response.raise_for_status()
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/orders", json=payload)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Auth failed -- check x-client-id and x-client-secret")
    elif e.response.status_code == 429:
        print("Rate limited -- blocked for up to 1 minute")
    elif e.response.status_code == 409:
        print("Duplicate operation -- use x-idempotency-key header")
    else:
        error = e.response.json()
        print(f"Cashfree error: {error.get('message')} ({error.get('code')})")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- `x-api-version` header is **required** on every request (current: `2025-01-01`)
- PG and Payouts use **different** API credentials -- don't mix them
- Never expose `x-client-secret` in client-side/frontend code
- Use `x-idempotency-key` header on create operations to prevent duplicates on retries
- Use sandbox URLs for testing -- no real money is moved
- Order amounts are in INR by default; use `order_currency` for international
- `return_url` supports `{order_id}` placeholder which Cashfree replaces automatically
- Check `x-ratelimit-remaining` response header to avoid hitting rate limits
- Refund `refund_id` must be 3-40 alphanumeric characters
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
