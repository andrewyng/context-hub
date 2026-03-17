---
name: rest-api
description: "Chargebee - Subscription Billing & Revenue Management REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "chargebee,billing,subscriptions,invoicing,revenue,saas,api"
---

# Chargebee REST API - Python (httpx) Coding Guidelines

You are a Chargebee REST API coding expert. Help me interact with the Chargebee subscription billing platform using direct HTTP calls via `httpx` (async). Chargebee manages subscriptions, customers, invoices, payment sources, and hosted checkout pages for SaaS and recurring billing businesses.

Official API reference: https://apidocs.chargebee.com/docs/api

## Golden Rule: Use httpx for All HTTP Calls

Always use the `httpx` async client for direct REST API interactions with Chargebee. Do NOT use `requests` or the `chargebee` Python SDK.

**Library:** `httpx`
**Installation:** `pip install httpx`

## API Fundamentals

- **Base URL:** `https://{site}.chargebee.com/api/v2` (replace `{site}` with your Chargebee site name)
- **Authentication:** HTTP Basic Auth with your API key as the username and an empty password
- **Request Format:** Form-encoded (`application/x-www-form-urlencoded`) for write operations
- **Response Format:** JSON
- **HTTP Methods:** GET for reads, POST for writes (create, update, delete actions)
- **Pagination:** Cursor-based using `offset` returned in responses; pass as query param for next page
- **List Limits:** Use `limit` param (default 10, max 100)
- **Timestamps:** Unix epoch seconds
- **Amounts:** In the smallest currency unit (cents for USD, pence for GBP)

### Important: Form-Encoded Requests

Chargebee uses form-encoded request bodies (not JSON). For nested objects, use bracket notation:
- `customer[first_name]=John`
- `subscription_items[item_price_id][0]=premium-monthly`

## Authentication and Client Setup

```python
import httpx, os
from contextlib import asynccontextmanager

@asynccontextmanager
async def chargebee_client():
    site = os.environ["CHARGEBEE_SITE"]
    async with httpx.AsyncClient(
        base_url=f"https://{site}.chargebee.com/api/v2",
        auth=(os.environ["CHARGEBEE_API_KEY"], ""),
        timeout=30.0,
    ) as client:
        yield client
```

## Subscriptions API

Subscriptions are the core billing entity in Chargebee.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subscriptions/create_with_items` | Create with item-based model |
| GET | `/subscriptions/{sub_id}` | Retrieve a subscription |
| GET | `/subscriptions` | List subscriptions |
| POST | `/subscriptions/{sub_id}/cancel_for_items` | Cancel item-based subscription |
| POST | `/subscriptions/{sub_id}/pause` | Pause a subscription |
| POST | `/subscriptions/{sub_id}/resume` | Resume a paused subscription |

Statuses: `future`, `in_trial`, `active`, `non_renewing`, `paused`, `cancelled`, `transferred`

### Create Subscription (Item-Based Model)

```python
async def create_subscription(customer_id: str, item_price_id: str, quantity: int = 1) -> dict:
    data = {
        "customer_id": customer_id,
        "subscription_items[item_price_id][0]": item_price_id,
        "subscription_items[quantity][0]": str(quantity),
    }
    async with chargebee_client() as client:
        resp = await client.post("/subscriptions/create_with_items", data=data)
        resp.raise_for_status()
        return resp.json()
```

### List Subscriptions with Filtering

```python
async def list_subscriptions(status: str | None = None, limit: int = 10, offset: str | None = None) -> dict:
    params: dict = {"limit": limit}
    if status:
        params["status[is]"] = status
    if offset:
        params["offset"] = offset
    async with chargebee_client() as client:
        resp = await client.get("/subscriptions", params=params)
        resp.raise_for_status()
        return resp.json()
# Response: {"list": [{"subscription": {...}, "customer": {...}}, ...], "next_offset": "..."}
```

### Cancel Subscription

```python
async def cancel_subscription(subscription_id: str, end_of_term: bool = True) -> dict:
    data = {"end_of_term": str(end_of_term).lower()}
    async with chargebee_client() as client:
        resp = await client.post(f"/subscriptions/{subscription_id}/cancel_for_items", data=data)
        resp.raise_for_status()
        return resp.json()
```

## Customers API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create a customer |
| GET | `/customers/{cust_id}` | Retrieve a customer |
| GET | `/customers` | List customers |
| POST | `/customers/{cust_id}` | Update a customer |
| POST | `/customers/{cust_id}/delete` | Delete a customer |

Key attributes: `id`, `first_name`, `last_name`, `email`, `phone`, `company`, `auto_collection` (on/off), `net_term_days`, `taxability`, `meta_data` (custom JSON).

### Create Customer

```python
async def create_customer(first_name: str, last_name: str, email: str, **extra) -> dict:
    import json
    data = {"first_name": first_name, "last_name": last_name, "email": email}
    if "meta_data" in extra:
        extra["meta_data"] = json.dumps(extra["meta_data"])
    data.update({k: str(v) for k, v in extra.items()})
    async with chargebee_client() as client:
        resp = await client.post("/customers", data=data)
        resp.raise_for_status()
        return resp.json()
```

### List Customers

```python
async def list_customers(email: str | None = None, limit: int = 10, offset: str | None = None) -> dict:
    params: dict = {"limit": limit}
    if email:
        params["email[is]"] = email
    if offset:
        params["offset"] = offset
    async with chargebee_client() as client:
        resp = await client.get("/customers", params=params)
        resp.raise_for_status()
        return resp.json()
```

## Invoices API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/invoices` | Create an invoice |
| GET | `/invoices/{inv_id}` | Retrieve an invoice |
| GET | `/invoices` | List invoices |
| POST | `/invoices/{inv_id}/collect_payment` | Collect payment |
| POST | `/invoices/{inv_id}/void` | Void an invoice |

Statuses: `pending`, `paid`, `posted`, `payment_due`, `not_paid`, `voided`

### Create One-Time Invoice

```python
async def create_invoice(customer_id: str, charges: list[dict], currency_code: str = "USD") -> dict:
    data: dict = {"customer_id": customer_id, "currency_code": currency_code}
    for i, charge in enumerate(charges):
        data[f"charges[amount][{i}]"] = str(charge["amount"])
        data[f"charges[description][{i}]"] = charge["description"]
    async with chargebee_client() as client:
        resp = await client.post("/invoices", data=data)
        resp.raise_for_status()
        return resp.json()
```

### List Invoices

```python
async def list_invoices(customer_id: str | None = None, status: str | None = None, limit: int = 10, offset: str | None = None) -> dict:
    params: dict = {"limit": limit}
    if customer_id:
        params["customer_id[is]"] = customer_id
    if status:
        params["status[is]"] = status
    if offset:
        params["offset"] = offset
    async with chargebee_client() as client:
        resp = await client.get("/invoices", params=params)
        resp.raise_for_status()
        return resp.json()
```

## Error Handling

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 401 | Authentication failure |
| 404 | Resource not found |
| 409 | Conflict (duplicate ID, concurrent update) |
| 429 | Rate limited |
| 500 | Internal server error |

Error response: `{"message": "...", "type": "invalid_request", "api_error_code": "resource_not_found", "param": "subscription_id", "http_status_code": 404}`

```python
import asyncio

class ChargebeeAPIError(Exception):
    def __init__(self, status_code: int, error_type: str, api_error_code: str, message: str, param: str | None = None):
        self.status_code = status_code
        self.error_type = error_type
        self.api_error_code = api_error_code
        self.param = param
        super().__init__(f"[{status_code}] {api_error_code}: {message}")

async def chargebee_request(method: str, endpoint: str, data: dict | None = None, params: dict | None = None, max_retries: int = 3) -> dict:
    """Make an authenticated Chargebee API request with error handling and retry."""
    async with chargebee_client() as client:
        for attempt in range(max_retries):
            try:
                resp = await client.request(method, endpoint, data=data, params=params)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPStatusError as e:
                body = e.response.json() if e.response.content else {}
                if e.response.status_code == 429 and attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                    continue
                if e.response.status_code >= 500 and attempt < max_retries - 1:
                    await asyncio.sleep(1)
                    continue
                raise ChargebeeAPIError(
                    status_code=e.response.status_code,
                    error_type=body.get("type", "unknown"),
                    api_error_code=body.get("api_error_code", "unknown"),
                    message=body.get("message", str(e)),
                    param=body.get("param"),
                ) from e
    raise RuntimeError("Max retries exceeded")
```

## Pagination Helper

```python
async def paginate_chargebee(endpoint: str, params: dict | None = None, max_pages: int = 10) -> list[dict]:
    """Auto-paginate through Chargebee list endpoints."""
    all_items = []
    current_params = dict(params or {})
    current_params.setdefault("limit", 100)
    for _ in range(max_pages):
        result = await chargebee_request("GET", endpoint, params=current_params)
        items = result.get("list", [])
        all_items.extend(items)
        next_offset = result.get("next_offset")
        if not next_offset or not items:
            break
        current_params["offset"] = next_offset
    return all_items
```

## Filter Operators

Chargebee supports rich filtering on list endpoints using bracket notation:

| Operator | Syntax | Example |
|----------|--------|---------|
| is | `field[is]=value` | `status[is]=active` |
| is_not | `field[is_not]=value` | `status[is_not]=cancelled` |
| in | `field[in]=[val1,val2]` | `status[in]=["active","in_trial"]` |
| starts_with | `field[starts_with]=prefix` | `email[starts_with]=john` |
| between | `field[between]=[start,end]` | `created_at[between]=[1704067200,1706745600]` |
| after / before | `field[after]=value` | `created_at[after]=1704067200` |

## Common Pitfalls

1. **Form-encoded, not JSON.** POST requests use `application/x-www-form-urlencoded`, not JSON. Use `data=` not `json=` in httpx.
2. **Bracket notation for nested params.** Use `subscription_items[item_price_id][0]` for array/nested fields.
3. **Amounts in smallest unit.** 50000 cents = $500.00 USD.
4. **Timestamps are Unix seconds.** Not milliseconds.
5. **Cursor pagination.** Use `offset` from previous response, not page numbers.

## Useful Links

- **API Reference:** https://apidocs.chargebee.com/docs/api
- **Webhook Events:** https://apidocs.chargebee.com/docs/api/events
- **Test Environment:** Use your test site at `{site}-test.chargebee.com`
