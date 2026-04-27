---
name: rest-api
description: "Revolut Business API - European neobank accounts, payments, and transfers"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "revolut,banking,payments,europe,neobank,transfers,api"
---

# Revolut Business REST API - Python (`httpx`)

## Golden Rule

Always use the correct API version prefix in your endpoint paths (`/api/1.0/` or `/api/2.0/`). Access tokens expire after 40 minutes -- implement automatic refresh using the refresh token. Never hardcode tokens. All requests must include the `Authorization: Bearer` header. Use the sandbox environment for all development and testing.

## Installation

```bash
pip install httpx python-dotenv pyjwt cryptography
```

`pyjwt` and `cryptography` are needed to sign JWT tokens for the OAuth consent flow.

## Base URL

| Environment | URL |
|-------------|-----|
| Production  | `https://b2b.revolut.com/api/1.0` |
| Sandbox     | `https://sandbox-b2b.revolut.com/api/1.0` |

Some newer endpoints use `/api/2.0` (e.g., Webhooks v2).

## Authentication

Revolut uses OAuth 2.0 with JWT-signed consent. The flow:
1. Generate an RSA key pair and upload the public key in the Revolut Business portal.
2. Create a signed JWT assertion.
3. Exchange it for an access token.

```python
import httpx
import os
import jwt
import time
import uuid

BASE_URL = os.environ.get("REVOLUT_BASE_URL", "https://sandbox-b2b.revolut.com/api/1.0")
CLIENT_ID = os.environ["REVOLUT_CLIENT_ID"]
PRIVATE_KEY = os.environ["REVOLUT_PRIVATE_KEY"]  # PEM-encoded RSA private key

def create_jwt_assertion(client_id: str, private_key: str, issuer_url: str) -> str:
    now = int(time.time())
    payload = {
        "iss": issuer_url,
        "sub": client_id,
        "aud": "https://revolut.com",
        "iat": now,
        "exp": now + 2400,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, private_key, algorithm="RS256")


async def get_access_token(client: httpx.AsyncClient, refresh_token: str) -> dict:
    assertion = create_jwt_assertion(CLIENT_ID, PRIVATE_KEY, "revolut.com")
    resp = await client.post(
        f"{BASE_URL}/auth/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            "client_assertion": assertion,
        },
    )
    resp.raise_for_status()
    return resp.json()  # {"access_token": "...", "token_type": "bearer", "expires_in": 2400}
```

Use the access token in all subsequent requests:

```python
def auth_headers(access_token: str) -> dict:
    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
```

## Rate Limiting

Revolut enforces rate limits per endpoint. When rate-limited, you receive HTTP 429. Implement exponential backoff:

```python
import asyncio

async def revolut_request(
    client: httpx.AsyncClient, method: str, url: str, token: str, **kwargs
) -> dict:
    for attempt in range(5):
        resp = await client.request(method, url, headers=auth_headers(token), **kwargs)
        if resp.status_code == 429:
            await asyncio.sleep(2 ** attempt)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("Rate limit exceeded after retries")
```

## Methods

### List Accounts

Retrieve all accounts with their balances.

```python
async def list_accounts(client: httpx.AsyncClient, token: str) -> list[dict]:
    resp = await client.get(f"{BASE_URL}/accounts", headers=auth_headers(token))
    resp.raise_for_status()
    return resp.json()
```

### Get Account Balance

```python
async def get_account(client: httpx.AsyncClient, token: str, account_id: str) -> dict:
    resp = await client.get(
        f"{BASE_URL}/accounts/{account_id}", headers=auth_headers(token)
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Counterparty

Add a payment recipient (internal Revolut user or external bank account).

```python
async def create_counterparty_external(
    client: httpx.AsyncClient,
    token: str,
    company_name: str,
    currency: str,
    iban: str,
    bic: str,
) -> dict:
    payload = {
        "company_name": company_name,
        "bank_country": "GB",
        "currency": currency,
        "iban": iban,
        "bic": bic,
    }
    resp = await client.post(
        f"{BASE_URL}/counterparty", headers=auth_headers(token), json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Create Payment

Send money to a counterparty.

```python
async def create_payment(
    client: httpx.AsyncClient,
    token: str,
    account_id: str,
    counterparty_id: str,
    amount: float,
    currency: str,
    reference: str,
    request_id: str,
) -> dict:
    payload = {
        "request_id": request_id,  # Idempotency key
        "account_id": account_id,
        "receiver": {
            "counterparty_id": counterparty_id,
        },
        "amount": amount,
        "currency": currency,
        "reference": reference,
    }
    resp = await client.post(
        f"{BASE_URL}/pay", headers=auth_headers(token), json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### Transfer Between Accounts

Move money between your own Revolut accounts.

```python
async def create_transfer(
    client: httpx.AsyncClient,
    token: str,
    source_account_id: str,
    target_account_id: str,
    amount: float,
    currency: str,
    request_id: str,
) -> dict:
    payload = {
        "request_id": request_id,
        "source_account_id": source_account_id,
        "target_account_id": target_account_id,
        "amount": amount,
        "currency": currency,
    }
    resp = await client.post(
        f"{BASE_URL}/transfer", headers=auth_headers(token), json=payload
    )
    resp.raise_for_status()
    return resp.json()
```

### List Transactions

```python
async def list_transactions(
    client: httpx.AsyncClient,
    token: str,
    from_date: str | None = None,
    to_date: str | None = None,
    count: int = 50,
) -> list[dict]:
    params = {"count": count}
    if from_date:
        params["from"] = from_date
    if to_date:
        params["to"] = to_date
    resp = await client.get(
        f"{BASE_URL}/transactions", headers=auth_headers(token), params=params
    )
    resp.raise_for_status()
    return resp.json()
```

### Get Exchange Rate

```python
async def get_exchange_rate(
    client: httpx.AsyncClient, token: str, source: str, target: str, amount: float
) -> dict:
    params = {"from": source, "to": target, "amount": amount}
    resp = await client.get(
        f"{BASE_URL}/rate", headers=auth_headers(token), params=params
    )
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

Revolut returns JSON error bodies with a `message` and sometimes a `code` field:

```python
class RevolutAPIError(Exception):
    def __init__(self, status: int, body: dict):
        self.status = status
        self.code = body.get("code", "UNKNOWN")
        self.message = body.get("message", str(body))
        super().__init__(f"HTTP {status} [{self.code}]: {self.message}")


async def revolut_request_safe(
    client: httpx.AsyncClient, method: str, url: str, token: str, **kwargs
) -> dict:
    resp = await client.request(method, url, headers=auth_headers(token), **kwargs)
    if resp.status_code >= 400:
        raise RevolutAPIError(resp.status_code, resp.json())
    return resp.json()
```

Common status codes: 400 (bad request), 401 (unauthorized/expired token), 403 (insufficient permissions), 404 (not found), 405 (method not allowed), 429 (rate limit), 500/503 (server errors).

## Common Pitfalls

1. **Token expiry (40 min)** -- Access tokens expire quickly. Always implement automatic refresh using the refresh token before making requests.
2. **JWT signing** -- The initial OAuth consent requires signing a JWT with your RSA private key. Ensure the key is in PEM format and the `kid` matches what you uploaded.
3. **request_id idempotency** -- Every payment and transfer must include a unique `request_id`. Reusing it returns the original result, which is by design for idempotency.
4. **Sandbox limitations** -- Sandbox does not process real payments. Use the simulation endpoints (`/sandbox/topup`, `/sandbox/transactions/{id}/{action}`) to test state transitions.
5. **API version mixing** -- Some endpoints are v1.0, others v2.0. Always check the docs for the correct version prefix for each resource.
6. **Scopes** -- Tokens are scoped (READ, WRITE, PAY). Ensure your token has the correct scope for the operation. A READ-only token cannot create payments.
7. **Date format** -- Use ISO 8601 format (`2026-01-15T00:00:00Z`) for all date parameters in transaction queries.
