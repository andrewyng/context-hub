---
name: rest-api
description: "Paystack - African Payment Processor REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "paystack,payments,africa,nigeria,ghana,south-africa,api"
---

# Paystack REST API — Python (httpx)

## Golden Rule

All amounts are in the **smallest currency unit** — kobo for NGN (divide by 100 for naira), pesewas for GHS, cents for ZAR. Always **verify transactions server-side** using the transaction reference before fulfilling orders. Never expose your Secret Key in client-side code. All requests require HTTPS.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://api.paystack.co
```

## Authentication

Paystack uses a Secret Key passed as a Bearer token in the `Authorization` header.

```python
import httpx
import os

SECRET_KEY = os.environ["PAYSTACK_SECRET_KEY"]

headers = {
    "Authorization": f"Bearer {SECRET_KEY}",
    "Content-Type": "application/json",
}

async def get_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url="https://api.paystack.co",
        headers=headers,
        timeout=30.0,
    )
```

**Key prefixes:**
- `sk_test_...` — Test secret key
- `pk_test_...` — Test public key
- `sk_live_...` — Live secret key
- `pk_live_...` — Live public key

## Rate Limiting

Paystack does not publish a fixed rate-limit number, but aggressive request patterns trigger HTTP **429 Too Many Requests**. Guidelines:
- Bulk charges: max 100 items per batch, 5-second interval between batches.
- Bulk transfers: max 100 per batch.
- General: avoid more than ~50 requests/second sustained.

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

### Initialize Transaction

Start a payment — returns an authorization URL to redirect the customer.

```python
async def initialize_transaction(client: httpx.AsyncClient, email: str,
                                  amount_kobo: int, reference: str | None = None,
                                  currency: str = "NGN",
                                  callback_url: str | None = None):
    """amount_kobo: amount in smallest unit (e.g., 50000 = NGN 500)"""
    payload = {
        "email": email,
        "amount": amount_kobo,
        "currency": currency,
    }
    if reference:
        payload["reference"] = reference
    if callback_url:
        payload["callback_url"] = callback_url

    resp = await client.post("/transaction/initialize", json=payload)
    resp.raise_for_status()
    data = resp.json()
    return data["data"]  # {"authorization_url": "...", "access_code": "...", "reference": "..."}
```

### Verify Transaction

Always verify after redirect or webhook. Match amount and currency.

```python
async def verify_transaction(client: httpx.AsyncClient, reference: str):
    resp = await client.get(f"/transaction/verify/{reference}")
    resp.raise_for_status()
    data = resp.json()["data"]
    assert data["status"] == "success"
    # assert data["amount"] == expected_amount_kobo
    # assert data["currency"] == "NGN"
    return data
```

### List Transactions

```python
async def list_transactions(client: httpx.AsyncClient, page: int = 1,
                             per_page: int = 50, status: str | None = None):
    params = {"page": page, "perPage": per_page}
    if status:
        params["status"] = status  # "success", "failed", "abandoned"
    resp = await client.get("/transaction", params=params)
    resp.raise_for_status()
    return resp.json()["data"]
```

### Charge Authorization (Recurring)

Charge a previously authorized card (for subscriptions/recurring).

```python
async def charge_authorization(client: httpx.AsyncClient, email: str,
                                amount_kobo: int, authorization_code: str,
                                reference: str | None = None):
    payload = {
        "email": email,
        "amount": amount_kobo,
        "authorization_code": authorization_code,
    }
    if reference:
        payload["reference"] = reference
    resp = await client.post("/transaction/charge_authorization", json=payload)
    resp.raise_for_status()
    return resp.json()["data"]
```

### Create Transfer Recipient

Register a bank account before sending money.

```python
async def create_transfer_recipient(client: httpx.AsyncClient, name: str,
                                     account_number: str, bank_code: str,
                                     currency: str = "NGN"):
    payload = {
        "type": "nuban",  # "ghipss" for Ghana, "basa" for South Africa
        "name": name,
        "account_number": account_number,
        "bank_code": bank_code,
        "currency": currency,
    }
    resp = await client.post("/transferrecipient", json=payload)
    resp.raise_for_status()
    return resp.json()["data"]
```

### Initiate Transfer (Payout)

```python
async def initiate_transfer(client: httpx.AsyncClient, amount_kobo: int,
                              recipient_code: str, reason: str,
                              reference: str | None = None):
    payload = {
        "source": "balance",
        "amount": amount_kobo,
        "recipient": recipient_code,
        "reason": reason,
    }
    if reference:
        payload["reference"] = reference
    resp = await client.post("/transfer", json=payload)
    resp.raise_for_status()
    return resp.json()["data"]
```

### Create Customer

```python
async def create_customer(client: httpx.AsyncClient, email: str,
                           first_name: str = "", last_name: str = ""):
    payload = {"email": email, "first_name": first_name, "last_name": last_name}
    resp = await client.post("/customer", json=payload)
    resp.raise_for_status()
    return resp.json()["data"]
```

### List Banks

Useful for populating bank selection dropdowns.

```python
async def list_banks(client: httpx.AsyncClient, country: str = "nigeria"):
    resp = await client.get("/bank", params={"country": country})
    resp.raise_for_status()
    return resp.json()["data"]
```

### Create Dedicated Virtual Account

```python
async def create_dedicated_virtual_account(client: httpx.AsyncClient,
                                            customer_code: str,
                                            preferred_bank: str = "wema-bank"):
    payload = {
        "customer": customer_code,
        "preferred_bank": preferred_bank,
    }
    resp = await client.post("/dedicated_account", json=payload)
    resp.raise_for_status()
    return resp.json()["data"]
```

## Error Handling

Paystack returns a consistent response envelope:

```json
{
  "status": false,
  "message": "Invalid key",
  "data": null,
  "meta": {
    "next_step": "Check your API key and try again"
  }
}
```

HTTP status codes:
- **200** — Success (`"status": true`)
- **400** — Bad request / validation error
- **401** — Invalid or missing authorization key
- **404** — Resource not found
- **429** — Rate limited
- **5xx** — Paystack server error

```python
class PaystackError(Exception):
    def __init__(self, status_code: int, message: str, meta=None):
        self.status_code = status_code
        self.message = message
        self.meta = meta
        super().__init__(f"[{status_code}] {message}")

async def safe_request(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    resp = await client.request(method, url, **kwargs)
    body = resp.json()
    if not body.get("status"):
        raise PaystackError(
            resp.status_code,
            body.get("message", "Unknown error"),
            body.get("meta"),
        )
    return body
```

## Common Pitfalls

1. **Amounts in major units instead of kobo** — `amount: 500` means NGN 5.00, not NGN 500. Multiply naira by 100.
2. **Not verifying transactions** — Always call `/transaction/verify/{reference}` before fulfilling. Redirect params can be spoofed.
3. **Wrong transfer recipient type** — Use `"nuban"` for Nigeria, `"ghipss"` for Ghana, `"basa"` for South Africa. Wrong type returns 400.
4. **Test vs. live keys** — Test keys (prefixed `sk_test_`) simulate transactions. No real money moves. Ensure you switch for production.
5. **Webhook IP whitelisting** — Paystack sends webhooks from specific IPs. Verify the `x-paystack-signature` header (HMAC SHA512 of body with your secret key).
6. **Bulk charge pacing** — Sending batches too fast (< 5s apart) triggers 429. Use a 5-second delay between batch submissions.
7. **Currency support** — Paystack supports NGN, GHS, ZAR, and USD. Passing an unsupported currency silently fails or errors.
8. **Dedicated virtual accounts** — Only available for registered Nigerian businesses. Requires BVN validation of the customer.
9. **Transfer OTP** — First-time transfers or large amounts may require OTP confirmation via the dashboard. Disable OTP for automated flows through Paystack dashboard settings.
