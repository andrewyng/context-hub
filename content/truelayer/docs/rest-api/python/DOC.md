---
name: rest-api
description: "TrueLayer Open Banking REST API Coding Guidelines for Python using httpx async HTTP client"
metadata:
  languages: "python"
  versions: "v3"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "truelayer,open-banking,psd2,uk,europe,payments,data,api"
---

# TrueLayer REST API Coding Guidelines (Python)

You are a TrueLayer API coding expert. Help me with writing code using the TrueLayer Open Banking REST API with httpx async HTTP client.

## Golden Rule: Use httpx Async for All API Calls

Always use `httpx.AsyncClient` for all TrueLayer API interactions. Never use `requests` or synchronous HTTP clients.

- **Library Name:** httpx
- **PyPI Package:** `httpx`

TrueLayer is an Open Banking API aggregator enabling access to bank accounts and payment initiation across UK and EU banks under PSD2 regulation. It provides two main APIs: the **Data API** (read account/transaction data) and the **Payments API v3** (initiate payments, payouts, refunds, and mandates).

## Installation

```bash
pip install httpx python-dotenv
```

## Base URL

| Environment | API Base URL | Auth Base URL |
|-------------|-------------|---------------|
| Production  | `https://api.truelayer.com` | `https://auth.truelayer.com` |
| Sandbox     | `https://api.truelayer-sandbox.com` | `https://auth.truelayer-sandbox.com` |

All Payments API v3 endpoints start with `/v3/`. Data API endpoints start with `/data/v1/`.

## Authentication

TrueLayer uses OAuth 2.0. You obtain an access token via client credentials (for Payments API) or authorization code (for Data API user consent).

```python
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TRUELAYER_CLIENT_ID = os.environ["TRUELAYER_CLIENT_ID"]
TRUELAYER_CLIENT_SECRET = os.environ["TRUELAYER_CLIENT_SECRET"]
TRUELAYER_AUTH_URL = os.environ.get("TRUELAYER_AUTH_URL", "https://auth.truelayer-sandbox.com")
TRUELAYER_API_URL = os.environ.get("TRUELAYER_API_URL", "https://api.truelayer-sandbox.com")
```

### Client Credentials Token (Payments API)

```python
async def get_client_token() -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TRUELAYER_AUTH_URL}/connect/token",
            data={
                "grant_type": "client_credentials",
                "client_id": TRUELAYER_CLIENT_ID,
                "client_secret": TRUELAYER_CLIENT_SECRET,
                "scope": "payments",
            },
        )
        response.raise_for_status()
        return response.json()["access_token"]
```

### Authorization Code Exchange (Data API)

```python
async def exchange_auth_code(auth_code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TRUELAYER_AUTH_URL}/connect/token",
            data={
                "grant_type": "authorization_code",
                "client_id": TRUELAYER_CLIENT_ID,
                "client_secret": TRUELAYER_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "code": auth_code,
            },
        )
        response.raise_for_status()
        return response.json()
```

### Helper Headers

```python
def get_headers(access_token: str) -> dict:
    return {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
```

## Rate Limiting

TrueLayer monitors API call volume. HTTP 429 responses include rate limit details:

```python
import asyncio

async def request_with_retry(
    client: httpx.AsyncClient, method: str, url: str, max_retries: int = 3, **kwargs,
) -> httpx.Response:
    for attempt in range(max_retries):
        response = await client.request(method, url, **kwargs)
        if response.status_code == 429:
            retry_after = int(response.headers.get("Retry-After", 2 ** (attempt + 1)))
            await asyncio.sleep(retry_after)
            continue
        response.raise_for_status()
        return response
    raise httpx.HTTPStatusError("Rate limit exceeded after retries", request=response.request, response=response)
```

## Methods

### Data API -- Account Information

#### List Accounts

```python
async def list_accounts(access_token: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TRUELAYER_API_URL}/data/v1/accounts",
            headers=get_headers(access_token),
        )
        response.raise_for_status()
        return response.json()["results"]
```

#### Get Account Balance

```python
async def get_account_balance(access_token: str, account_id: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TRUELAYER_API_URL}/data/v1/accounts/{account_id}/balance",
            headers=get_headers(access_token),
        )
        response.raise_for_status()
        return response.json()["results"]
```

#### List Account Transactions

```python
async def list_account_transactions(
    access_token: str, account_id: str,
    from_date: str | None = None, to_date: str | None = None,
) -> list[dict]:
    """from_date/to_date: ISO 8601 (e.g. '2025-01-01T00:00:00Z')."""
    params = {}
    if from_date:
        params["from"] = from_date
    if to_date:
        params["to"] = to_date
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TRUELAYER_API_URL}/data/v1/accounts/{account_id}/transactions",
            headers=get_headers(access_token),
            params=params,
        )
        response.raise_for_status()
        return response.json()["results"]
```

Additional Data API endpoints follow the same pattern: `/data/v1/cards`, `/data/v1/accounts/{id}/direct-debits`, `/data/v1/accounts/{id}/standing-orders`, `/data/v1/providers`.

### Payments API v3

#### Create Payment

```python
async def create_payment(
    access_token: str, amount_minor_units: int, currency: str,
    merchant_account_id: str, beneficiary_name: str,
    beneficiary_sort_code: str | None = None,
    beneficiary_account_number: str | None = None,
    beneficiary_iban: str | None = None,
    reference: str = "Payment",
) -> dict:
    """Create a payment. Provide sort_code+account_number (UK) or iban (EU)."""
    beneficiary = {"type": "external_account", "account_holder_name": beneficiary_name, "reference": reference}
    if beneficiary_iban:
        beneficiary["account_identifier"] = {"type": "iban", "iban": beneficiary_iban}
    else:
        beneficiary["account_identifier"] = {
            "type": "sort_code_account_number",
            "sort_code": beneficiary_sort_code,
            "account_number": beneficiary_account_number,
        }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TRUELAYER_API_URL}/v3/payments",
            headers=get_headers(access_token),
            json={
                "amount_in_minor": amount_minor_units,
                "currency": currency,
                "payment_method": {
                    "type": "bank_transfer",
                    "provider_selection": {"type": "user_selected"},
                    "beneficiary": beneficiary,
                },
            },
        )
        response.raise_for_status()
        return response.json()
```

#### Get Payment Status

```python
async def get_payment(access_token: str, payment_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TRUELAYER_API_URL}/v3/payments/{payment_id}",
            headers=get_headers(access_token),
        )
        response.raise_for_status()
        return response.json()
```

#### Start Authorization Flow

```python
async def start_auth_flow(access_token: str, payment_id: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TRUELAYER_API_URL}/v3/payments/{payment_id}/authorization-flow",
            headers=get_headers(access_token),
            json={"provider_selection": {}, "redirect": {"return_uri": redirect_uri}},
        )
        response.raise_for_status()
        return response.json()
```

Additional Payments API v3 endpoints: `POST /v3/payments/{id}/cancel`, `POST /v3/payments/{id}/refunds`, `POST /v3/payouts`, `GET /v3/payouts/{id}`, `POST /v3/mandates`, `GET /v3/mandates/{id}`.

## Error Handling

TrueLayer Payments API v3 errors follow the IETF Problem Details standard. Each error includes a `trace_id` for support requests. Data API errors use `{"error": "...", "error_description": "..."}`.

```python
async def safe_truelayer_request(method: str, path: str, access_token: str, **kwargs) -> dict | None:
    async with httpx.AsyncClient(base_url=TRUELAYER_API_URL) as client:
        try:
            response = await client.request(method, path, headers=get_headers(access_token), **kwargs)
            response.raise_for_status()
            return response.json() if response.content else None
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            try:
                error_body = e.response.json()
            except Exception:
                error_body = {"detail": e.response.text}
            trace_id = error_body.get("trace_id", "unknown")
            if status == 400:
                raise ValueError(f"Bad request (trace: {trace_id}): {error_body}")
            elif status == 401:
                raise PermissionError(f"Unauthorized (trace: {trace_id}). Refresh token.")
            elif status == 403:
                raise PermissionError(f"Forbidden (trace: {trace_id}): {error_body}")
            elif status == 404:
                raise LookupError(f"Not found (trace: {trace_id}): {path}")
            elif status == 429:
                raise RuntimeError(f"Rate limited (trace: {trace_id}). Implement backoff.")
            elif status >= 500:
                raise ConnectionError(f"Server error {status} (trace: {trace_id}): {error_body}")
            raise
        except httpx.RequestError as e:
            raise ConnectionError(f"Network error: {e}")
```

## Common Pitfalls

1. **Two Separate APIs:** Data API (`/data/v1/`) uses authorization code tokens (user consent). Payments API (`/v3/`) uses client credentials tokens. Do not mix them.
2. **Amounts in Minor Units:** All Payments API amounts are in minor units (`amount_in_minor`). 1000 = 10.00 GBP/EUR.
3. **Sandbox vs Production URLs:** Both API and Auth URLs change between environments. Use `truelayer-sandbox.com` for testing, `truelayer.com` for production.
4. **Auth Token for Data:** Use `data={...}` (form-encoded) for `/connect/token`, but `json={...}` for all other API calls.
5. **trace_id:** Always log the `trace_id` from error responses -- TrueLayer support requires it for debugging.
6. **Token Expiry:** Data API access tokens expire. Use refresh tokens to maintain access without requiring the user to re-authorize.
7. **Response Wrapping:** Data API responses wrap results in `{"results": [...]}`. Payments API responses return the object directly.
8. **Webhook Verification:** Verify webhook signatures using your webhook secret for payment status changes.

## Useful Links

- **API Reference:** https://docs.truelayer.com/
- **Payments API v3:** https://docs.truelayer.com/reference/create-payment
- **Data API:** https://docs.truelayer.com/docs/data-api-basics
- **Console (Dashboard):** https://console.truelayer.com/
- **Sandbox Testing:** https://docs.truelayer.com/docs/test-payments-in-sandbox
