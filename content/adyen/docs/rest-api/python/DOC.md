---
name: rest-api
description: "Adyen - Global payment platform, checkout, payouts, and recurring payments"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "adyen,payments,checkout,global,europe,psp,api"
---

# Adyen REST API - Python (`httpx`)

## Golden Rule

Always use the `X-API-Key` header for authentication -- never Basic Auth for Checkout API. Live URLs are merchant-specific with a unique prefix (not the same as test URLs). Version your endpoints explicitly (e.g., `/v71/`). All amounts are in **minor units** (cents): EUR 10.00 = 1000. Never log full card numbers or API keys.

## Installation

```bash
pip install httpx python-dotenv
```

## Base URL

| Environment | API | URL |
|-------------|-----|-----|
| Test | Checkout | `https://checkout-test.adyen.com/v71` |
| Live | Checkout | `https://{PREFIX}-checkout-live.adyenpayments.com/checkout/v71` |
| Test | Payouts | `https://pal-test.adyen.com/pal/servlet/Payout/v68` |
| Test | Management | `https://management-test.adyen.com/v3` |

The `{PREFIX}` for live is found in Customer Area under Developers > API URLs.

```python
import os

# Test environment
BASE_URL = os.environ.get("ADYEN_BASE_URL", "https://checkout-test.adyen.com/v71")
```

## Authentication

Adyen uses an API key passed in the `X-API-Key` header. Generate keys from the Customer Area under Developers > API credentials.

```python
import httpx
import os

API_KEY = os.environ["ADYEN_API_KEY"]
MERCHANT_ACCOUNT = os.environ["ADYEN_MERCHANT_ACCOUNT"]

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
}
```

After generating a new API key, the previous key remains active for 24 hours to allow seamless rotation.

## Rate Limiting

Adyen enforces rate limits and returns HTTP 429 when exceeded. Implement backoff:

```python
import asyncio

async def adyen_request(
    client: httpx.AsyncClient, method: str, url: str, **kwargs
) -> dict:
    for attempt in range(5):
        resp = await client.request(method, url, headers=headers, **kwargs)
        if resp.status_code == 429:
            await asyncio.sleep(2 ** attempt)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("Rate limit exceeded after retries")
```

## Methods

### Create Payment Session (Checkout)

Start a payment transaction. This is the primary endpoint for accepting payments.

```python
async def create_payment(
    client: httpx.AsyncClient,
    amount_minor_units: int,
    currency: str,
    reference: str,
    return_url: str,
    payment_method: dict,
    shopper_reference: str | None = None,
) -> dict:
    payload = {
        "merchantAccount": MERCHANT_ACCOUNT,
        "amount": {"value": amount_minor_units, "currency": currency},
        "reference": reference,
        "returnUrl": return_url,
        "paymentMethod": payment_method,
    }
    if shopper_reference:
        payload["shopperReference"] = shopper_reference

    resp = await client.post(
        f"{BASE_URL}/payments", headers=headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Submit Payment Details (3D Secure)

Handle additional authentication details (e.g., 3DS redirect).

```python
async def submit_payment_details(
    client: httpx.AsyncClient, details: dict, payment_data: str | None = None
) -> dict:
    payload = {"details": details}
    if payment_data:
        payload["paymentData"] = payment_data

    resp = await client.post(
        f"{BASE_URL}/payments/details", headers=headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Payment Session (Drop-in)

Create a session for Adyen Drop-in/Components (recommended flow).

```python
async def create_session(
    client: httpx.AsyncClient,
    amount_minor_units: int,
    currency: str,
    reference: str,
    return_url: str,
    shopper_reference: str | None = None,
) -> dict:
    payload = {
        "merchantAccount": MERCHANT_ACCOUNT,
        "amount": {"value": amount_minor_units, "currency": currency},
        "reference": reference,
        "returnUrl": return_url,
    }
    if shopper_reference:
        payload["shopperReference"] = shopper_reference

    resp = await client.post(
        f"{BASE_URL}/sessions", headers=headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Capture Payment

Capture a previously authorized payment.

```python
async def capture_payment(
    client: httpx.AsyncClient,
    payment_psp_reference: str,
    amount_minor_units: int,
    currency: str,
) -> dict:
    payload = {
        "merchantAccount": MERCHANT_ACCOUNT,
        "amount": {"value": amount_minor_units, "currency": currency},
    }
    resp = await client.post(
        f"{BASE_URL}/payments/{payment_psp_reference}/captures",
        headers=headers,
        json=payload,
    )
    resp.raise_for_status()
    return resp.json()
```

### Refund Payment

```python
async def refund_payment(
    client: httpx.AsyncClient,
    payment_psp_reference: str,
    amount_minor_units: int,
    currency: str,
    reference: str,
) -> dict:
    payload = {
        "merchantAccount": MERCHANT_ACCOUNT,
        "amount": {"value": amount_minor_units, "currency": currency},
        "reference": reference,
    }
    resp = await client.post(
        f"{BASE_URL}/payments/{payment_psp_reference}/refunds",
        headers=headers,
        json=payload,
    )
    resp.raise_for_status()
    return resp.json()
```

### Cancel Payment

```python
async def cancel_payment(
    client: httpx.AsyncClient, payment_psp_reference: str
) -> dict:
    payload = {"merchantAccount": MERCHANT_ACCOUNT}
    resp = await client.post(
        f"{BASE_URL}/payments/{payment_psp_reference}/cancels",
        headers=headers,
        json=payload,
    )
    resp.raise_for_status()
    return resp.json()
```

### List Payment Methods

Retrieve available payment methods for a given context.

```python
async def get_payment_methods(
    client: httpx.AsyncClient,
    country_code: str,
    currency: str,
    amount_minor_units: int,
) -> dict:
    payload = {
        "merchantAccount": MERCHANT_ACCOUNT,
        "countryCode": country_code,
        "amount": {"value": amount_minor_units, "currency": currency},
    }
    resp = await client.post(
        f"{BASE_URL}/paymentMethods", headers=headers, json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

Adyen errors include a `status`, `errorCode`, `message`, and `errorType`:

```json
{
  "status": 422,
  "errorCode": "14_006",
  "message": "Required field 'merchantAccount' is not provided.",
  "errorType": "validation"
}
```

```python
class AdyenAPIError(Exception):
    def __init__(self, status: int, body: dict):
        self.status = status
        self.error_code = body.get("errorCode", "unknown")
        self.error_type = body.get("errorType", "unknown")
        self.message = body.get("message", str(body))
        super().__init__(
            f"HTTP {status} [{self.error_code}] ({self.error_type}): {self.message}"
        )


async def adyen_request_safe(
    client: httpx.AsyncClient, method: str, url: str, **kwargs
) -> dict:
    resp = await client.request(method, url, headers=headers, **kwargs)
    if resp.status_code >= 400:
        raise AdyenAPIError(resp.status_code, resp.json())
    return resp.json()
```

Common error types: `validation` (bad input), `security` (auth issues), `configuration` (account setup), `internal` (Adyen server error).

## Common Pitfalls

1. **Minor units for amounts** -- EUR 10.00 must be sent as `1000`. JPY 500 is sent as `500` (no decimals). Always check currency exponent.
2. **Live URL prefix** -- The live Checkout URL is merchant-specific (`{PREFIX}-checkout-live.adyenpayments.com`). Test and live URLs are completely different domains.
3. **merchantAccount required** -- Nearly every request needs the `merchantAccount` field. Forgetting it is the most common validation error.
4. **Idempotency** -- Use the `Idempotency-Key` header for payment requests to avoid duplicate charges.
5. **Webhook verification** -- Adyen sends payment result notifications via webhooks. Always verify the HMAC signature on incoming webhooks.
6. **3DS handling** -- Many European payments require 3D Secure. Check the `resultCode` for `RedirectShopper` or `ChallengeShopper` and handle the redirect flow.
7. **API versioning** -- Adyen increments API versions frequently. Pin your integration to a specific version and test before upgrading.
