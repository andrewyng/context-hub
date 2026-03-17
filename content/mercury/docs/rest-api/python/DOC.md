---
name: rest-api
description: "Mercury Banking REST API Python coding guidelines using httpx async"
metadata:
  languages: "python"
  versions: "3.12.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "mercury,banking,startup,fintech,usa,api"
---

# Mercury REST API Python Coding Guidelines

You are a Mercury Banking API coding expert. Help me with writing code that calls the Mercury REST API using httpx async in Python.

Official documentation: https://docs.mercury.com/

## Golden Rule: Use httpx Async for All REST Calls

Always use `httpx.AsyncClient` for all Mercury REST API interactions. Do not use `requests` or synchronous HTTP libraries. All code must be async-first using `httpx`.

- **HTTP Library:** httpx (async)
- **Correct:** `async with httpx.AsyncClient() as client:`
- **Incorrect:** Using `requests` or synchronous httpx

## Installation

```bash
pip install httpx python-dotenv
```

**Environment Variables:**

```bash
export MERCURY_API_TOKEN='your_api_token_here'
```

Or create a `.env` file:

```bash
MERCURY_API_TOKEN=your_api_token_here
```

Load in Python:

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("MERCURY_API_TOKEN")
```

**Generating a token:** Log into Mercury dashboard, navigate to Settings, and generate an API token. Tokens are only shown once at creation time. Store securely.

## Base URL

```
https://api.mercury.com/api/v1
```

A v2 beta also exists but v1 is the stable version.

## Authentication

Mercury supports two authentication methods:

1. **Bearer Token (recommended):** `Authorization: Bearer {token}`
2. **HTTP Basic Auth:** Username = API token, Password = empty string

```python
import httpx

BASE_URL = "https://api.mercury.com/api/v1"

HEADERS = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json",
}

async def get_accounts():
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/accounts")
        resp.raise_for_status()
        return resp.json()
```

### Token Permission Tiers

| Tier              | Capabilities                                    | IP Whitelist Required |
|-------------------|------------------------------------------------|-----------------------|
| **Read Only**     | Fetch accounts, transactions, recipients        | No                    |
| **Read and Write**| All reads + initiate payments, manage recipients | Yes                   |
| **Custom**        | Scoped to specific operations (e.g. `RequestSendMoney`) | Depends on scope |

## Rate Limiting

Mercury does not publicly document specific rate limits. However:

- Tokens expire after prolonged inactivity (making any API call resets the timer)
- Implement reasonable backoff on 429 responses
- Avoid polling more frequently than once per minute for transaction updates

```python
import asyncio
import httpx

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

### Accounts

```python
async def list_accounts():
    """GET /accounts - List all accounts in the organization."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/accounts")
        resp.raise_for_status()
        return resp.json()

async def get_account(account_id: str):
    """GET /account/{id} - Get a specific account (balance, routing number, etc.)."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/account/{account_id}")
        resp.raise_for_status()
        return resp.json()
```

### Transactions

```python
async def list_all_transactions(limit: int = 50, offset: int = 0, status: str | None = None, search: str | None = None):
    """GET /transactions - List all transactions across all accounts.

    Supports filtering, pagination, and search.
    """
    params: dict = {"limit": limit, "offset": offset}
    if status:
        params["status"] = status  # "pending", "sent", "cancelled", "failed"
    if search:
        params["search"] = search
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/transactions", params=params)
        resp.raise_for_status()
        return resp.json()

async def list_account_transactions(account_id: str, limit: int = 50, offset: int = 0):
    """GET /account/{id}/transactions - List transactions for a specific account."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/account/{account_id}/transactions", params={
            "limit": limit,
            "offset": offset,
        })
        resp.raise_for_status()
        return resp.json()

async def get_transaction(transaction_id: str):
    """GET /transactions/{id} - Get a single transaction by ID."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/transactions/{transaction_id}")
        resp.raise_for_status()
        return resp.json()
```

### Recipients

```python
async def list_recipients():
    """GET /recipients - List all payment recipients."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/recipients")
        resp.raise_for_status()
        return resp.json()

async def create_recipient(name: str, emails: list[str], payment_method: str = "ach"):
    """POST /recipients - Create a new payment recipient."""
    payload = {
        "name": name,
        "emails": emails,
        "paymentMethod": payment_method,  # "ach", "domesticWire", "internationalWire", "check"
    }
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.post("/recipients", json=payload)
        resp.raise_for_status()
        return resp.json()
```

### Payments (Send Money)

```python
async def send_payment(account_id: str, recipient_id: str, amount: float, payment_method: str = "ach", note: str | None = None, idempotency_key: str | None = None):
    """POST /account/{id}/transactions - Send money to a recipient.

    Requires Read and Write token tier with IP whitelist.
    Custom tokens need RequestSendMoney scope (payment requires admin approval).
    """
    payload = {
        "recipientId": recipient_id,
        "amount": amount,
        "paymentMethod": payment_method,  # "ach", "domesticWire", "internationalWire", "check"
    }
    if note:
        payload["note"] = note
    if idempotency_key:
        payload["idempotencyKey"] = idempotency_key
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.post(f"/account/{account_id}/transactions", json=payload)
        resp.raise_for_status()
        return resp.json()
```

### Internal Transfers

```python
async def transfer_between_accounts(from_account_id: str, to_account_id: str, amount: float, note: str | None = None):
    """POST /transfer - Move money between your own Mercury accounts.

    Requires SendMoney write scope.
    """
    payload = {
        "fromAccountId": from_account_id,
        "toAccountId": to_account_id,
        "amount": amount,
    }
    if note:
        payload["note"] = note
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.post("/transfer", json=payload)
        resp.raise_for_status()
        return resp.json()
```

### Organization and Users

```python
async def get_organization():
    """GET /organization - Get org info (EIN, legal name, DBAs)."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/organization")
        resp.raise_for_status()
        return resp.json()

async def list_users():
    """GET /users - List users in the organization."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/users")
        resp.raise_for_status()
        return resp.json()
```

## Error Handling

Mercury returns standard HTTP status codes with JSON error bodies.

| Status | Meaning                                         |
|--------|------------------------------------------------|
| 200    | Success                                         |
| 400    | Bad request / validation error                  |
| 401    | Unauthorized (invalid or expired token)         |
| 403    | Forbidden (insufficient token permissions)      |
| 404    | Resource not found                              |
| 409    | Conflict (duplicate idempotency key)            |
| 429    | Rate limit exceeded                             |
| 500    | Internal server error                           |

```python
import httpx

async def safe_request(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    try:
        resp = await client.request(method, url, **kwargs)
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        error_body = {}
        try:
            error_body = e.response.json()
        except Exception:
            pass
        msg = error_body.get("errors", error_body.get("message", e.response.text))
        if e.response.status_code == 401:
            raise Exception("Unauthorized: check your MERCURY_API_TOKEN or regenerate it")
        elif e.response.status_code == 403:
            raise Exception(f"Forbidden: token lacks required permissions. {msg}")
        elif e.response.status_code == 429:
            raise Exception(f"Rate limited: {msg}")
        else:
            raise Exception(f"Mercury API error {e.response.status_code}: {msg}")
    except httpx.RequestError as e:
        raise Exception(f"Network error: {e}")
```

## Common Pitfalls

1. **Token shown only once.** When you create an API token in Mercury's dashboard, it is displayed only at creation time. Store it immediately in a secure location.

2. **Write operations require IP whitelist.** Read and Write tokens require IP whitelisting in the Mercury dashboard. Calls from non-whitelisted IPs get 403.

3. **Token inactivity expiration.** Tokens may be deleted after prolonged inactivity. Making any API call resets the inactivity timer.

4. **ACH payment limits.** Mercury provides 100 free programmatic ACH payments per month. Additional payments may incur fees.

5. **Payments may require approval.** Using a Custom token with `RequestSendMoney` scope creates transactions that require admin approval in the Mercury dashboard before they are processed.

6. **Idempotency keys for payments.** Always include an `idempotencyKey` when creating payments to prevent duplicate transactions on retries.

7. **Account vs accounts endpoint.** List all accounts: `GET /accounts` (plural). Get single account: `GET /account/{id}` (singular). This inconsistency is in Mercury's API design.

8. **Amounts are floats, not cents.** Mercury uses dollar amounts as floats (e.g., `100.50`), not integer cents like Stripe.

9. **Recipient attachments use pre-signed URLs.** Attachment URLs in recipient responses are ephemeral pre-signed URLs that expire. Download them promptly.

10. **Sandbox for testing.** Mercury provides a sandbox environment for testing. Check the docs for sandbox-specific base URLs and test credentials.

## Useful Links

- Official Documentation: https://docs.mercury.com/
- API Reference: https://docs.mercury.com/reference/getting-started-with-your-api
- Getting Started: https://docs.mercury.com/docs/getting-started
- OAuth2 Integration: https://docs.mercury.com/docs/oauth2
- Mercury Dashboard: https://app.mercury.com/
- API Features Page: https://mercury.com/api
