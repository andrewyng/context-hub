---
name: rest-api
description: "Klarna REST API Coding Guidelines for Python using httpx async HTTP client"
metadata:
  languages: "python"
  versions: "v1"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "klarna,bnpl,checkout,payments,europe,sweden,api"
---

# Klarna REST API Coding Guidelines (Python)

You are a Klarna API coding expert. Help me with writing code using the Klarna REST API with httpx async HTTP client.

## Golden Rule: Use httpx Async for All API Calls

Always use `httpx.AsyncClient` for all Klarna API interactions. Never use `requests` or synchronous HTTP clients.

- **Library Name:** httpx
- **PyPI Package:** `httpx`

Klarna provides Buy Now Pay Later (BNPL), checkout, and payment processing APIs. The main APIs are: **Klarna Payments** (create sessions and authorize), **Order Management** (capture, refund, cancel), and **Hosted Payment Page** (Klarna-hosted checkout).

## Installation

```bash
pip install httpx python-dotenv
```

## Base URL

### Production

| Region   | Base URL |
|----------|----------|
| Europe   | `https://api.klarna.com` |
| North America | `https://api-na.klarna.com` |
| Oceania  | `https://api-oc.klarna.com` |

### Playground (Sandbox)

| Region   | Base URL |
|----------|----------|
| Europe   | `https://api.playground.klarna.com` |
| North America | `https://api-na.playground.klarna.com` |
| Oceania  | `https://api-oc.playground.klarna.com` |

URL structure is the same for both environments -- the domain determines the target environment.

## Authentication

Klarna uses HTTP Basic Authentication. Credentials consist of a **username** (linked to your Merchant ID) and a **password** (API key) obtained from the Klarna Merchant Portal.

```python
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

KLARNA_BASE_URL = os.environ.get(
    "KLARNA_BASE_URL", "https://api.playground.klarna.com"
)
KLARNA_USERNAME = os.environ["KLARNA_USERNAME"]  # e.g., "K123456_abcdef"
KLARNA_PASSWORD = os.environ["KLARNA_PASSWORD"]  # API key

def get_auth() -> tuple[str, str]:
    return (KLARNA_USERNAME, KLARNA_PASSWORD)

def get_headers() -> dict:
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
```

## Rate Limiting

Klarna does not publicly document specific rate limits. Monitor for HTTP 429 responses and implement exponential backoff:

```python
import asyncio

async def request_with_retry(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    max_retries: int = 3,
    **kwargs,
) -> httpx.Response:
    for attempt in range(max_retries):
        response = await client.request(method, url, **kwargs)
        if response.status_code == 429:
            delay = 2 ** (attempt + 1)
            await asyncio.sleep(delay)
            continue
        response.raise_for_status()
        return response
    raise httpx.HTTPStatusError(
        "Rate limit exceeded after retries",
        request=response.request,
        response=response,
    )
```

## Methods

### Klarna Payments -- Create Session

```python
async def create_payment_session(
    purchase_country: str,
    purchase_currency: str,
    locale: str,
    order_amount: int,
    order_tax_amount: int,
    order_lines: list[dict],
) -> dict:
    """
    Create a Klarna Payment session. Amounts in minor units (cents/pence).
    order_lines: [{"name": "Widget", "quantity": 1, "unit_price": 1000,
                   "tax_rate": 2000, "total_amount": 1000, "total_tax_amount": 167}]
    Session lifetime: 48 hours.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{KLARNA_BASE_URL}/payments/v1/sessions",
            auth=get_auth(),
            headers=get_headers(),
            json={
                "purchase_country": purchase_country,
                "purchase_currency": purchase_currency,
                "locale": locale,
                "order_amount": order_amount,
                "order_tax_amount": order_tax_amount,
                "order_lines": order_lines,
            },
        )
        response.raise_for_status()
        return response.json()
        # {"session_id": "...", "client_token": "...", "payment_method_categories": [...]}
```

### Create Order (from Authorization Token)

```python
async def create_order(
    authorization_token: str,
    purchase_country: str,
    purchase_currency: str,
    locale: str,
    order_amount: int,
    order_tax_amount: int,
    order_lines: list[dict],
    merchant_reference1: str | None = None,
    auto_capture: bool = False,
) -> dict:
    """
    Create an order from an authorization token.
    Authorization token is valid for 60 minutes after customer approval.
    Set auto_capture=True to skip manual capture step.
    """
    body = {
        "purchase_country": purchase_country,
        "purchase_currency": purchase_currency,
        "locale": locale,
        "order_amount": order_amount,
        "order_tax_amount": order_tax_amount,
        "order_lines": order_lines,
        "auto_capture": auto_capture,
    }
    if merchant_reference1:
        body["merchant_reference1"] = merchant_reference1

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{KLARNA_BASE_URL}/payments/v1/authorizations/{authorization_token}/order",
            auth=get_auth(),
            headers=get_headers(),
            json=body,
        )
        response.raise_for_status()
        return response.json()
        # {"order_id": "...", "fraud_status": "ACCEPTED", ...}
```

### Capture Order

```python
async def capture_order(
    order_id: str,
    captured_amount: int,
    description: str = "",
    order_lines: list[dict] | None = None,
    shipping_info: list[dict] | None = None,
) -> None:
    """
    Capture (part of) an order. captured_amount in minor units.
    shipping_info: [{"tracking_number": "...", "shipping_company": "..."}]
    """
    body: dict = {"captured_amount": captured_amount}
    if description:
        body["description"] = description
    if order_lines:
        body["order_lines"] = order_lines
    if shipping_info:
        body["shipping_info"] = shipping_info

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{KLARNA_BASE_URL}/ordermanagement/v1/orders/{order_id}/captures",
            auth=get_auth(),
            headers=get_headers(),
            json=body,
        )
        response.raise_for_status()
```

### Refund Order

```python
async def refund_order(
    order_id: str,
    refunded_amount: int,
    description: str = "",
    order_lines: list[dict] | None = None,
) -> None:
    """Refund (part of) an order. refunded_amount in minor units."""
    body: dict = {"refunded_amount": refunded_amount}
    if description:
        body["description"] = description
    if order_lines:
        body["order_lines"] = order_lines

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{KLARNA_BASE_URL}/ordermanagement/v1/orders/{order_id}/refunds",
            auth=get_auth(),
            headers=get_headers(),
            json=body,
        )
        response.raise_for_status()
```

Additional endpoints: Cancel Authorization (`DELETE /payments/v1/authorizations/{token}`), Get Order (`GET /ordermanagement/v1/orders/{id}`), Cancel Order (`POST .../cancel`), Release Remaining Authorization, Extend Authorization Time, Update Merchant References, Hosted Payment Page (`POST /hpp/v1/sessions`), Customer Tokens. All follow the same `auth=get_auth(), headers=get_headers()` pattern.

## Error Handling

```python
async def safe_klarna_request(
    method: str,
    path: str,
    **kwargs,
) -> dict | None:
    async with httpx.AsyncClient(base_url=KLARNA_BASE_URL) as client:
        try:
            response = await client.request(
                method,
                path,
                auth=get_auth(),
                headers=get_headers(),
                **kwargs,
            )
            response.raise_for_status()
            if response.content:
                return response.json()
            return None
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            try:
                error_body = e.response.json()
            except Exception:
                error_body = {"error_message": e.response.text}

            correlation_id = error_body.get("correlation_id", "unknown")
            error_messages = error_body.get("error_messages", [])

            if status == 400:
                raise ValueError(
                    f"Bad request (correlation: {correlation_id}): {error_messages}"
                )
            elif status == 401:
                raise PermissionError("Invalid API credentials.")
            elif status == 403:
                raise PermissionError(f"Forbidden: {error_body}")
            elif status == 404:
                raise LookupError(f"Not found: {path}")
            elif status == 409:
                raise RuntimeError(f"Conflict: {error_body}")
            elif status == 429:
                raise RuntimeError("Rate limited. Implement backoff.")
            elif status >= 500:
                raise ConnectionError(
                    f"Klarna server error ({status}, correlation: {correlation_id}): {error_body}"
                )
            raise
        except httpx.RequestError as e:
            raise ConnectionError(f"Network error: {e}")
```

### Klarna Error Response Format

```json
{
  "correlation_id": "abc-123-def",
  "error_code": "BAD_VALUE",
  "error_messages": ["'order_amount' is required."],
  "error_type": "validation_error"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 204  | No Content (success, no response body) |
| 400  | Bad Request -- validation errors |
| 401  | Unauthorized -- invalid credentials |
| 403  | Forbidden -- insufficient permissions |
| 404  | Not Found |
| 409  | Conflict -- order state prevents action |
| 429  | Too Many Requests |
| 500  | Internal Server Error |

## Common Pitfalls

1. **Amounts in Minor Units:** All amounts are in the smallest currency unit (cents for EUR/USD, pence for GBP). 1000 = 10.00.
2. **Tax Calculations:** Order lines must include `tax_rate` (in hundredths of a percent, e.g., 2000 = 20%), `total_amount`, and `total_tax_amount`. These must be mathematically consistent.
3. **Regional Base URLs:** Use the correct regional URL for your merchant account. EU merchants must use `api.klarna.com`, not the NA or OC endpoints.
4. **Authorization Token Expiry:** The KP Authorization Token is valid for only 60 minutes. Create the order promptly after customer approval.
5. **Session Lifetime:** Payment sessions expire after 48 hours. Create a new session if expired.
6. **Basic Auth, Not Bearer:** Klarna uses HTTP Basic Auth (username:password), not Bearer tokens. Use `auth=(username, password)` with httpx.
7. **Auto-Capture:** Set `auto_capture: true` when creating orders to skip the separate capture step. Otherwise, you must call the capture endpoint before the authorization expires.
8. **Order Line Requirements:** Every order line needs: `name`, `quantity`, `unit_price`, `tax_rate`, `total_amount`, `total_tax_amount`. Missing fields cause validation errors.
9. **Playground vs Production:** The playground environment uses separate credentials from production. URL structure is identical -- only the domain differs.
10. **Correlation ID:** Always log the `correlation_id` from error responses for debugging with Klarna support.
11. **Capture Before Refund:** You can only refund captured amounts. Uncaptured orders should be cancelled, not refunded.
12. **Partial Captures/Refunds:** Both captures and refunds support partial amounts. Track cumulative totals to avoid exceeding the order amount.

**Docs:** https://docs.klarna.com/ | **Payments API:** https://docs.klarna.com/api/payments/ | **Order Management:** https://docs.klarna.com/api/ordermanagement/
