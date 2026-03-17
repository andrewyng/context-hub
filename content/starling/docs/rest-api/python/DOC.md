---
name: rest-api
description: "Starling Bank REST API Coding Guidelines for Python using httpx async HTTP client"
metadata:
  languages: "python"
  versions: "v2"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "starling,banking,uk,neobank,accounts,payments,savings,api"
---

# Starling Bank REST API Coding Guidelines (Python)

You are a Starling Bank API coding expert. Help me with writing code using the Starling Bank REST API with httpx async HTTP client.

## Golden Rule: Use httpx Async for All API Calls

Always use `httpx.AsyncClient` for all Starling Bank API interactions. Never use `requests` or synchronous HTTP clients.

- **Library Name:** httpx
- **PyPI Package:** `httpx`

## Installation

```bash
pip install httpx python-dotenv
```

## Base URL

| Environment | Base URL |
|-------------|----------|
| Production  | `https://api.starlingbank.com` |
| Sandbox     | `https://api-sandbox.starlingbank.com` |

The sandbox provides a full testing environment with simulated bank data. Register at https://developer.starlingbank.com to get sandbox credentials.

## Authentication

Starling supports two authentication methods:

1. **Personal Access Token** -- for personal integrations (generated in the developer portal)
2. **OAuth 2.0** -- for applications that access other users' accounts

All requests require a Bearer token in the `Authorization` header.

```python
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

STARLING_BASE_URL = os.environ.get(
    "STARLING_BASE_URL", "https://api-sandbox.starlingbank.com"
)
STARLING_ACCESS_TOKEN = os.environ["STARLING_ACCESS_TOKEN"]

def get_headers() -> dict:
    return {
        "Authorization": f"Bearer {STARLING_ACCESS_TOKEN}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "my-app/1.0",
    }
```

### OAuth 2.0 Token Exchange

```python
async def exchange_auth_code(
    client_id: str,
    client_secret: str,
    redirect_uri: str,
    auth_code: str,
) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STARLING_BASE_URL}/oauth/access-token",
            json={
                "grant_type": "authorization_code",
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "code": auth_code,
            },
        )
        response.raise_for_status()
        return response.json()  # {"access_token": "...", "refresh_token": "...", "token_type": "Bearer"}
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
            f"{STARLING_BASE_URL}/oauth/access-token",
            json={
                "grant_type": "refresh_token",
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
            },
        )
        response.raise_for_status()
        return response.json()
```

## Rate Limiting

Starling does not publicly document exact rate limits. Monitor for HTTP 429 responses and implement exponential backoff:

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
            retry_after = int(response.headers.get("Retry-After", 2 ** (attempt + 1)))
            await asyncio.sleep(retry_after)
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
async def list_accounts() -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/accounts",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()["accounts"]
        # Each account has: accountUid, accountType, defaultCategory, currency, name
```

### Get Account Identifiers

```python
async def get_account_identifiers(account_uid: str) -> dict:
    """Get sort code, account number, IBAN, BIC for an account."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/accounts/{account_uid}/identifiers",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()
```

### Get Balance

```python
async def get_balance(account_uid: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/accounts/{account_uid}/balance",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()
        # {"clearedBalance": {"currency": "GBP", "minorUnits": 50000}, ...}
```

### List Transactions (Feed Items)

```python
async def list_transactions(
    account_uid: str,
    category_uid: str,
    since: str,
    until: str | None = None,
) -> list[dict]:
    """
    List settled transactions between dates.
    since/until: ISO 8601 timestamps (e.g. '2025-01-01T00:00:00.000Z').
    category_uid: from account's defaultCategory.
    """
    params = {"minTransactionTimestamp": since}
    if until:
        params["maxTransactionTimestamp"] = until
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/feed/account/{account_uid}/category/{category_uid}/transactions-between",
            headers=get_headers(),
            params=params,
        )
        response.raise_for_status()
        return response.json()["feedItems"]
```

### Get Single Feed Item

```python
async def get_feed_item(
    account_uid: str,
    category_uid: str,
    feed_item_uid: str,
) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/feed/account/{account_uid}/category/{category_uid}/{feed_item_uid}",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()["feedItem"]
```

### Savings Goals

```python
import uuid

async def list_savings_goals(account_uid: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/account/{account_uid}/savings-goals",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()["savingsGoalList"]

async def create_savings_goal(
    account_uid: str,
    name: str,
    target_minor_units: int,
    currency: str = "GBP",
) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{STARLING_BASE_URL}/api/v2/account/{account_uid}/savings-goals",
            headers=get_headers(),
            json={
                "name": name,
                "currency": currency,
                "target": {"currency": currency, "minorUnits": target_minor_units},
            },
        )
        response.raise_for_status()
        return response.json()

async def add_money_to_savings_goal(
    account_uid: str,
    savings_goal_uid: str,
    amount_minor_units: int,
    currency: str = "GBP",
) -> dict:
    transfer_uid = str(uuid.uuid4())
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{STARLING_BASE_URL}/api/v2/account/{account_uid}/savings-goals/{savings_goal_uid}/add-money/{transfer_uid}",
            headers=get_headers(),
            json={
                "amount": {"currency": currency, "minorUnits": amount_minor_units},
            },
        )
        response.raise_for_status()
        return response.json()

async def withdraw_from_savings_goal(
    account_uid: str,
    savings_goal_uid: str,
    amount_minor_units: int,
    currency: str = "GBP",
) -> dict:
    transfer_uid = str(uuid.uuid4())
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{STARLING_BASE_URL}/api/v2/account/{account_uid}/savings-goals/{savings_goal_uid}/withdraw-money/{transfer_uid}",
            headers=get_headers(),
            json={
                "amount": {"currency": currency, "minorUnits": amount_minor_units},
            },
        )
        response.raise_for_status()
        return response.json()
```

### Spaces (Spending Spaces)

```python
async def list_spaces(account_uid: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/account/{account_uid}/spaces",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()["spaceItems"]
```

### Direct Debits

```python
async def list_direct_debits() -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/direct-debit/mandates",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()["mandates"]
```

### Standing Orders

```python
async def list_standing_orders(account_uid: str, category_uid: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/payments/local/account/{account_uid}/category/{category_uid}/standing-orders",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()["standingOrders"]
```

### Payees and Payments

```python
async def list_payees() -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STARLING_BASE_URL}/api/v2/payees",
            headers=get_headers(),
        )
        response.raise_for_status()
        return response.json()["payees"]

async def make_local_payment(
    account_uid: str,
    category_uid: str,
    payee_uid: str,
    payee_account_uid: str,
    amount_minor_units: int,
    reference: str,
    currency: str = "GBP",
) -> dict:
    """Make a domestic (Faster Payments) payment."""
    payment_uid = str(uuid.uuid4())
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{STARLING_BASE_URL}/api/v2/payments/local/account/{account_uid}/category/{category_uid}",
            headers=get_headers(),
            json={
                "externalIdentifier": payment_uid,
                "paymentRecipient": {
                    "payeeUid": payee_uid,
                    "payeeAccountUid": payee_account_uid,
                },
                "reference": reference,
                "amount": {"currency": currency, "minorUnits": amount_minor_units},
            },
        )
        response.raise_for_status()
        return response.json()
```

### Webhooks

```python
async def create_webhook(account_uid: str, url: str) -> dict:
    """Note: Use the developer portal to manage webhooks. This is for Payment Services API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STARLING_BASE_URL}/api/v2/feed-hooks",
            headers=get_headers(),
            json={"url": url},
        )
        response.raise_for_status()
        return response.json()
```

## Error Handling

```python
async def safe_starling_request(
    method: str,
    path: str,
    **kwargs,
) -> dict | None:
    async with httpx.AsyncClient(base_url=STARLING_BASE_URL) as client:
        try:
            response = await client.request(
                method, path, headers=get_headers(), **kwargs
            )
            response.raise_for_status()
            return response.json() if response.content else None
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            body = e.response.text
            if status == 400:
                raise ValueError(f"Bad request: {body}")
            elif status == 401:
                raise PermissionError("Invalid or expired token.")
            elif status == 403:
                raise PermissionError(f"Forbidden: {body}")
            elif status == 404:
                raise LookupError(f"Resource not found: {path}")
            elif status == 409:
                raise RuntimeError(f"Conflict (duplicate transfer UID?): {body}")
            elif status == 429:
                raise RuntimeError("Rate limited. Implement backoff.")
            elif status >= 500:
                raise ConnectionError(f"Starling server error ({status}): {body}")
            raise
        except httpx.RequestError as e:
            raise ConnectionError(f"Network error: {e}")
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Bad Request |
| 401  | Unauthorized -- invalid token |
| 403  | Forbidden -- insufficient scope |
| 404  | Not Found |
| 409  | Conflict -- duplicate idempotency key |
| 429  | Too Many Requests |
| 500  | Internal Server Error |

## Common Pitfalls

1. **Amounts in Minor Units:** All monetary values are in minor units (pence for GBP). `{"currency": "GBP", "minorUnits": 1000}` = 10.00 GBP.
2. **UUID Path Parameters:** Many endpoints require UUIDs (accountUid, categoryUid, savingsGoalUid). Always get these from the accounts endpoint first.
3. **Transfer UIDs for Idempotency:** Savings goal transfers and payments require a unique `transferUid` in the URL path. Generate with `uuid.uuid4()`. Reusing a UID returns the original result (idempotent).
4. **Default Category:** Each account has a `defaultCategory` UID. Most feed/transaction endpoints require both `accountUid` AND `categoryUid`.
5. **JSON Bodies:** Unlike Monzo, Starling uses JSON request bodies (`Content-Type: application/json`). Use `json=` not `data=` with httpx.
6. **PUT for Creates:** Starling uses PUT (not POST) for creating savings goals and making transfers, with the resource ID in the URL.
7. **Sandbox Data:** The sandbox auto-generates test data. Use it for development before switching to production.
8. **Timestamp Format:** Use full ISO 8601 with timezone: `2025-01-01T00:00:00.000Z`.
9. **Personal vs OAuth Tokens:** Personal access tokens are for single-user integrations. Use OAuth for multi-user apps.
10. **API Version:** All endpoints use `/api/v2/` prefix. The v1 API is deprecated.

## Useful Links

- **Developer Portal:** https://developer.starlingbank.com
- **API Documentation:** https://developer.starlingbank.com/docs
- **Sandbox:** https://developer.starlingbank.com/sandbox
- **API Samples (GitHub):** https://github.com/starlingbank/api-samples
- **Status Page:** https://starlingbank.statuspage.io
