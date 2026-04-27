---
name: rest-api
description: "Flutterwave - African Payment Gateway REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "flutterwave,payments,africa,nigeria,mobile-money,cards,api"
---

# Flutterwave REST API — Python (httpx)

## Golden Rule

Always use your **Secret Key** for server-side API calls — never expose it in client code. Amounts are in the **smallest currency unit** of the target country (e.g., NGN kobo = NGN * 100 is NOT required — Flutterwave uses major units). All requests must be over HTTPS. Include `Content-Type: application/json` and `Authorization: Bearer <SECRET_KEY>` on every request. Use `tx_ref` (your unique transaction reference) to reconcile payments.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://api.flutterwave.com/v3
```

Flutterwave v3 is the current stable version. A v4 public beta exists with OAuth 2.0 auth, but v3 remains fully supported with no deprecation plans.

## Authentication

Flutterwave v3 uses a static **Secret Key** passed as a Bearer token.

```python
import httpx
import os

SECRET_KEY = os.environ["FLUTTERWAVE_SECRET_KEY"]

headers = {
    "Authorization": f"Bearer {SECRET_KEY}",
    "Content-Type": "application/json",
}

async def get_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url="https://api.flutterwave.com/v3",
        headers=headers,
        timeout=30.0,
    )
```

**Key types:**
- `FLWSECK-...` — Secret key (server-side only)
- `FLWPUBK-...` — Public key (client-side, e.g., inline checkout)
- Test keys contain `_TEST-`, live keys contain `_LIVE-`

## Rate Limiting

Flutterwave does not publish fixed rate limits. In practice, sustained bursts above ~100 req/s trigger HTTP 429 responses. Implement exponential backoff:

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

### Collect Payment (Standard)

Initiate a payment — returns a hosted checkout link.

```python
async def initiate_payment(client: httpx.AsyncClient, amount: float, currency: str,
                           email: str, tx_ref: str, redirect_url: str):
    payload = {
        "tx_ref": tx_ref,
        "amount": amount,
        "currency": currency,
        "redirect_url": redirect_url,
        "customer": {"email": email},
        "payment_options": "card,mobilemoney,ussd,banktransfer",
    }
    resp = await client.post("/payments", json=payload)
    resp.raise_for_status()
    data = resp.json()
    return data["data"]["link"]  # redirect customer here
```

### Verify Transaction

Always verify server-side after redirect or webhook.

```python
async def verify_transaction(client: httpx.AsyncClient, transaction_id: int):
    resp = await client.get(f"/transactions/{transaction_id}/verify")
    resp.raise_for_status()
    data = resp.json()
    tx = data["data"]
    assert tx["status"] == "successful"
    assert tx["currency"] == "NGN"  # match expected currency
    # assert tx["amount"] >= expected_amount
    return tx
```

### Charge via Mobile Money

Direct charge for mobile money (Ghana, Uganda, Rwanda, Francophone, etc.).

```python
async def charge_mobile_money(client: httpx.AsyncClient, amount: float,
                               phone: str, currency: str, tx_ref: str,
                               network: str, email: str):
    """currency examples: GHS, UGX, RWF, XOF"""
    type_map = {
        "GHS": "mobile_money_ghana",
        "UGX": "mobile_money_uganda",
        "RWF": "mobile_money_rwanda",
        "XOF": "mobile_money_franco",
        "KES": "mpesa",
    }
    payload = {
        "tx_ref": tx_ref,
        "amount": amount,
        "currency": currency,
        "phone_number": phone,
        "network": network,
        "email": email,
    }
    resp = await client.post(
        f"/charges?type={type_map[currency]}", json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Transfer (Payout)

Send money to a bank account or mobile wallet.

```python
async def create_transfer(client: httpx.AsyncClient, account_bank: str,
                           account_number: str, amount: float,
                           currency: str, reference: str, narration: str):
    payload = {
        "account_bank": account_bank,
        "account_number": account_number,
        "amount": amount,
        "currency": currency,
        "reference": reference,
        "narration": narration,
        "debit_currency": currency,
    }
    resp = await client.post("/transfers", json=payload)
    resp.raise_for_status()
    return resp.json()
```

### Create Virtual Account

Generate a bank account number for collecting payments.

```python
async def create_virtual_account(client: httpx.AsyncClient, email: str,
                                  tx_ref: str, amount: float, currency: str = "NGN"):
    payload = {
        "email": email,
        "tx_ref": tx_ref,
        "amount": amount,
        "is_permanent": False,
    }
    resp = await client.post("/virtual-account-numbers", json=payload)
    resp.raise_for_status()
    return resp.json()["data"]
```

### List Transactions

```python
async def list_transactions(client: httpx.AsyncClient, page: int = 1,
                             status: str = "successful"):
    resp = await client.get("/transactions", params={"page": page, "status": status})
    resp.raise_for_status()
    return resp.json()["data"]
```

## Error Handling

Flutterwave returns structured error responses:

```json
{
  "status": "error",
  "message": "Invalid card number",
  "data": null
}
```

HTTP status codes:
- **200** — Success
- **400** — Bad request (validation error, missing fields)
- **401** — Invalid or missing secret key
- **403** — Forbidden (IP whitelist, permissions)
- **404** — Resource not found
- **429** — Rate limited
- **500** — Flutterwave server error

```python
class FlutterwaveError(Exception):
    def __init__(self, status_code: int, message: str, data=None):
        self.status_code = status_code
        self.message = message
        self.data = data
        super().__init__(f"[{status_code}] {message}")

async def safe_request(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    resp = await client.request(method, url, **kwargs)
    body = resp.json()
    if resp.status_code >= 400 or body.get("status") == "error":
        raise FlutterwaveError(resp.status_code, body.get("message", "Unknown error"), body.get("data"))
    return body
```

## Common Pitfalls

1. **Not verifying transactions server-side** — Never trust client-side redirect params alone. Always call `/transactions/{id}/verify`.
2. **Wrong charge type for mobile money** — Each country has its own `?type=` query param (e.g., `mobile_money_ghana`, `mpesa`). Using the wrong type returns a 400.
3. **Currency mismatch** — The `currency` in charge must match the payment method's country. You cannot charge GHS on a Nigerian card.
4. **Duplicate `tx_ref`** — Each payment must have a unique `tx_ref`. Reusing one returns the old transaction.
5. **Test vs. live keys** — Test keys (containing `_TEST-`) only work in sandbox. Transactions appear successful but no real money moves.
6. **Webhook signature verification** — Always verify the `verif-hash` header on webhooks matches your secret hash configured in the dashboard.
7. **Encryption for direct card charges** — Direct card tokenization in v3 requires encrypting the card payload with your encryption key before sending. Use the standard payment flow when possible.
8. **Transfer debit currency** — When sending cross-border transfers, set `debit_currency` to specify which wallet to debit.
