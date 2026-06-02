---
name: rest-api
description: "Monzo Bank REST API Coding Guidelines for Python using httpx async HTTP client"
metadata:
  languages: "python"
  versions: "v1"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "monzo,banking,uk,neobank,accounts,transactions,api"
---

# Monzo REST API Coding Guidelines (Python)

You are a Monzo Bank API coding expert. Help me with writing code using the Monzo REST API with httpx async HTTP client.

## Golden Rule: Use httpx Async for All API Calls

Always use `httpx.AsyncClient` for all Monzo API interactions. Never use `requests` or synchronous HTTP clients.

- **Library Name:** httpx
- **PyPI Package:** `httpx`

**IMPORTANT ACCESS RESTRICTION:** The Monzo Developer API is not suitable for building public applications. API access is limited to personal use or explicitly authorized OAuth clients. Strong Customer Authentication (SCA) is required -- users must approve access via a push notification in the Monzo app. After 5 minutes of initial authentication, transaction history access is limited to the last 90 days.

## Installation

```bash
pip install httpx python-dotenv
```

## Base URL

```
https://api.monzo.com
```

There is no separate sandbox environment. Testing is done against real accounts with the developer API.

## Authentication

Monzo uses OAuth 2.0 with Bearer token authentication. All requests require an `Authorization: Bearer {access_token}` header.

### OAuth 2.0 Flow

1. Register an OAuth client at https://developers.monzo.com/
2. Redirect user to Monzo authorization URL
3. Exchange authorization code for access token
4. User approves via push notification in the Monzo app (SCA)
5. Access token expires after several hours; refresh tokens are available only for confidential clients

```python
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

MONZO_BASE_URL = "https://api.monzo.com"
MONZO_ACCESS_TOKEN = os.environ["MONZO_ACCESS_TOKEN"]

def get_headers() -> dict:
    return {
        "Authorization": f"Bearer {MONZO_ACCESS_TOKEN}",
        "Content-Type": "application/x-www-form-urlencoded",
    }
```

### Token Exchange

```python
async def exchange_auth_code(
    client_id: str,
    client_secret: str,
    redirect_uri: str,
    auth_code: str,
) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{MONZO_BASE_URL}/oauth2/token",
            data={
                "grant_type": "authorization_code",
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "code": auth_code,
            },
        )
        response.raise_for_status()
        return response.json()  # {"access_token": "...", "refresh_token": "...", ...}
```

### Token Refresh

```python
async def refresh_access_token(
    client_id: str,
    client_secret: str,
    refresh_token: str,
) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{MONZO_BASE_URL}/oauth2/token",
            data={
                "grant_type": "refresh_token",
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
            },
        )
        response.raise_for_status()
        return response.json()
```

### Verify Token

```python
async def whoami() -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MONZO_BASE_URL}/ping/whoami",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()  # {"authenticated": true, "client_id": "...", "user_id": "..."}
```

## Rate Limiting

Monzo does not publicly document specific rate limits. However, HTTP 429 responses indicate rate limiting. Implement exponential backoff:

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

### List Accounts

```python
async def list_accounts(account_type: str | None = None) -> list[dict]:
    """List user accounts. account_type: 'uk_retail', 'uk_retail_joint', etc."""
    params = {}
    if account_type:
        params["account_type"] = account_type
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MONZO_BASE_URL}/accounts",
            headers=get_headers(),
            params=params,
        )
        response.raise_for_status()
        return response.json()["accounts"]
```

### Get Balance

```python
async def get_balance(account_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MONZO_BASE_URL}/balance",
            headers=get_headers(),
            params={"account_id": account_id},
        )
        response.raise_for_status()
        return response.json()
        # {"balance": 5000, "total_balance": 6000, "currency": "GBP", "spend_today": -200}
```

### List Transactions

```python
async def list_transactions(
    account_id: str,
    since: str | None = None,
    before: str | None = None,
    limit: int = 100,
    expand_merchant: bool = False,
) -> list[dict]:
    """
    List transactions. Pagination uses time-based cursors.
    since/before: ISO 8601 timestamps or transaction IDs.
    NOTE: After 5 min of auth, only last 90 days available.
    """
    params = {"account_id": account_id, "limit": limit}
    if since:
        params["since"] = since
    if before:
        params["before"] = before
    if expand_merchant:
        params["expand[]"] = "merchant"
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MONZO_BASE_URL}/transactions",
            headers=get_headers(),
            params=params,
        )
        response.raise_for_status()
        return response.json()["transactions"]
```

### Get Single Transaction

```python
async def get_transaction(
    transaction_id: str,
    expand_merchant: bool = True,
) -> dict:
    params = {}
    if expand_merchant:
        params["expand[]"] = "merchant"
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MONZO_BASE_URL}/transactions/{transaction_id}",
            headers=get_headers(),
            params=params,
        )
        response.raise_for_status()
        return response.json()["transaction"]
```

### Annotate Transaction (Metadata)

```python
async def annotate_transaction(
    transaction_id: str,
    metadata: dict[str, str],
) -> dict:
    """Add key-value metadata to a transaction."""
    data = {f"metadata[{k}]": v for k, v in metadata.items()}
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{MONZO_BASE_URL}/transactions/{transaction_id}",
            headers=get_headers(),
            data=data,
        )
        response.raise_for_status()
        return response.json()["transaction"]
```

### List Pots

```python
async def list_pots(current_account_id: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MONZO_BASE_URL}/pots",
            headers=get_headers(),
            params={"current_account_id": current_account_id},
        )
        response.raise_for_status()
        return response.json()["pots"]
```

### Deposit Into Pot

```python
import uuid

async def deposit_into_pot(
    pot_id: str,
    source_account_id: str,
    amount_pence: int,
) -> dict:
    """Move money into a pot. Amount is in pence (e.g., 1000 = 10.00 GBP)."""
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{MONZO_BASE_URL}/pots/{pot_id}/deposit",
            headers=get_headers(),
            data={
                "source_account_id": source_account_id,
                "amount": amount_pence,
                "dedupe_id": str(uuid.uuid4()),
            },
        )
        response.raise_for_status()
        return response.json()
```

### Withdraw From Pot

```python
async def withdraw_from_pot(
    pot_id: str,
    destination_account_id: str,
    amount_pence: int,
) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{MONZO_BASE_URL}/pots/{pot_id}/withdraw",
            headers=get_headers(),
            data={
                "destination_account_id": destination_account_id,
                "amount": amount_pence,
                "dedupe_id": str(uuid.uuid4()),
            },
        )
        response.raise_for_status()
        return response.json()
```

### Create Feed Item

```python
async def create_feed_item(
    account_id: str,
    title: str,
    body: str,
    image_url: str = "",
) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{MONZO_BASE_URL}/feed",
            headers=get_headers(),
            data={
                "account_id": account_id,
                "type": "basic",
                "params[title]": title,
                "params[body]": body,
                "params[image_url]": image_url or "https://monzo.com/static/images/favicon.png",
            },
        )
        response.raise_for_status()
```

### Webhooks

```python
async def register_webhook(account_id: str, url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{MONZO_BASE_URL}/webhooks",
            headers=get_headers(),
            data={"account_id": account_id, "url": url},
        )
        response.raise_for_status()
        return response.json()["webhook"]

async def list_webhooks(account_id: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MONZO_BASE_URL}/webhooks",
            headers=get_headers(),
            params={"account_id": account_id},
        )
        response.raise_for_status()
        return response.json()["webhooks"]

async def delete_webhook(webhook_id: str) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{MONZO_BASE_URL}/webhooks/{webhook_id}",
            headers=get_headers(),
        )
        response.raise_for_status()
```

## Error Handling

```python
async def safe_monzo_request(
    method: str,
    path: str,
    **kwargs,
) -> dict | None:
    async with httpx.AsyncClient(base_url=MONZO_BASE_URL) as client:
        try:
            response = await client.request(
                method, path, headers=get_headers(), **kwargs
            )
            response.raise_for_status()
            return response.json() if response.content else None
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            if status == 400:
                raise ValueError(f"Bad request: {e.response.text}")
            elif status == 401:
                raise PermissionError("Token expired or invalid. Re-authenticate.")
            elif status == 403:
                raise PermissionError("Insufficient permissions or SCA required.")
            elif status == 404:
                raise LookupError(f"Resource not found: {path}")
            elif status == 429:
                raise RuntimeError("Rate limited. Implement backoff.")
            elif status >= 500:
                raise ConnectionError(f"Monzo server error ({status}): {e.response.text}")
            raise
        except httpx.RequestError as e:
            raise ConnectionError(f"Network error: {e}")
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Bad Request -- missing or malformed arguments |
| 401  | Unauthorized -- invalid or expired token |
| 403  | Forbidden -- insufficient permissions or SCA needed |
| 404  | Not Found |
| 405  | Method Not Allowed |
| 429  | Rate Limited -- back off and retry |
| 500  | Internal Server Error |
| 504  | Gateway Timeout |

## Common Pitfalls

1. **SCA Timeout:** After 5 minutes of initial authentication, transaction history is limited to the last 90 days. Plan data fetches accordingly.
2. **Not a Public API:** Monzo explicitly states the developer API is not for building public apps. Access is restricted to personal use or pre-approved OAuth clients.
3. **Form-Encoded Bodies:** Most POST/PUT/PATCH endpoints expect `application/x-www-form-urlencoded`, NOT JSON. Use `data=` not `json=` with httpx.
4. **Amounts in Pence:** All monetary values are in the smallest currency unit (pence for GBP). 1000 = 10.00 GBP.
5. **Idempotency:** Use `dedupe_id` for pot deposit/withdraw operations to prevent duplicate transactions.
6. **Object Expansion:** Use `expand[]=merchant` query parameter to inline merchant details in transaction responses.
7. **Pagination:** Uses `since`, `before`, and `limit` parameters. `since` can be a timestamp or transaction ID.
8. **Token Expiry:** Access tokens expire after several hours. Only confidential clients get refresh tokens.
9. **Webhook Events:** Only `transaction.created` event is currently supported.
10. **Pot Withdrawals:** May be blocked if the user has enabled additional security on the pot.

## Useful Links

- **API Documentation:** https://docs.monzo.com/
- **Developer Portal:** https://developers.monzo.com/
- **OAuth Playground:** https://developers.monzo.com/api/playground
