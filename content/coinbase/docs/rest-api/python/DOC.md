---
name: rest-api
description: "Coinbase Advanced Trade REST API Python coding guidelines using httpx async"
metadata:
  languages: "python"
  versions: "3.12.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "coinbase,crypto,trading,bitcoin,ethereum,exchange,api"
---

# Coinbase Advanced Trade REST API Python Coding Guidelines

You are a Coinbase Advanced Trade API coding expert. Help me with writing code using the Coinbase Advanced Trade REST API with httpx async in Python.

You can find the official documentation here:
https://docs.cdp.coinbase.com/advanced-trade/reference

## Golden Rule: Use httpx Async with JWT Authentication

Always use `httpx` with async/await for all Coinbase Advanced Trade API interactions. Authenticate using JWT (JSON Web Token) generated from your CDP API key and secret. Never send your API secret directly in requests. Never use deprecated API key authentication methods.

## Installation

```bash
pip install httpx PyJWT cryptography
```

**Environment Variables:**

```bash
export COINBASE_API_KEY='organizations/{org_id}/apiKeys/{key_id}'
export COINBASE_API_SECRET='-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----'
```

Load environment variables in Python:

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("COINBASE_API_KEY")
api_secret = os.getenv("COINBASE_API_SECRET").replace("\\n", "\n")
```

## Base URL

```
https://api.coinbase.com
```

All Advanced Trade endpoints are prefixed with `/api/v3/brokerage/`.

## Authentication

Coinbase Advanced Trade uses JWT (JSON Web Token) authentication signed with ES256 (ECDSA).

```python
import time
import secrets
import jwt


def generate_jwt(api_key: str, api_secret: str, request_method: str = "", request_path: str = "") -> str:
    """Generate a JWT for Coinbase Advanced Trade API."""
    uri = ""
    if request_method and request_path:
        uri = f"{request_method} {request_path}"

    payload = {
        "sub": api_key,
        "iss": "cdp",
        "aud": ["cdp_service"],
        "nbf": int(time.time()),
        "exp": int(time.time()) + 120,
        "uris": [uri] if uri else [],
    }
    headers = {
        "kid": api_key,
        "nonce": secrets.token_hex(16),
        "typ": "JWT",
    }
    return jwt.encode(payload, api_secret, algorithm="ES256", headers=headers)
```

### Authenticated Client Helper

```python
import httpx


class CoinbaseClient:
    BASE_URL = "https://api.coinbase.com"

    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret

    def _headers(self, method: str, path: str) -> dict:
        token = generate_jwt(self.api_key, self.api_secret, method, path)
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    async def _request(self, method: str, path: str, **kwargs) -> dict:
        url = f"{self.BASE_URL}{path}"
        headers = self._headers(method.upper(), path.split("?")[0])
        async with httpx.AsyncClient() as client:
            resp = await client.request(method, url, headers=headers, **kwargs)
            resp.raise_for_status()
            return resp.json()

    async def get(self, path: str, params: dict | None = None) -> dict:
        return await self._request("GET", path, params=params)

    async def post(self, path: str, json_data: dict | None = None) -> dict:
        return await self._request("POST", path, json=json_data)
```

## Rate Limiting

| Endpoint Type | Limit |
|---|---|
| Private endpoints | 30 requests/second per user |
| Public endpoints | 10 requests/second per IP |

Implement rate limiting:

```python
import asyncio

semaphore = asyncio.Semaphore(25)  # Stay under 30/s limit

async def rate_limited_request(client: CoinbaseClient, path: str) -> dict:
    async with semaphore:
        result = await client.get(path)
        await asyncio.sleep(0.04)  # ~25 req/s pacing
        return result
```

## Methods

### List Accounts

```python
async def list_accounts(client: CoinbaseClient, limit: int = 49, cursor: str = "") -> dict:
    """List trading accounts."""
    params = {"limit": limit}
    if cursor:
        params["cursor"] = cursor
    return await client.get("/api/v3/brokerage/accounts", params=params)

# Usage
import asyncio

async def main():
    cb = CoinbaseClient(api_key, api_secret)
    accounts = await list_accounts(cb)
    for acct in accounts.get("accounts", []):
        print(f"{acct['currency']}: {acct['available_balance']['value']}")

asyncio.run(main())
```

### Get Account

```python
async def get_account(client: CoinbaseClient, account_uuid: str) -> dict:
    """Get a specific account by UUID."""
    return await client.get(f"/api/v3/brokerage/accounts/{account_uuid}")
```

### Create Order

```python
import uuid

async def create_order(
    client: CoinbaseClient,
    product_id: str,
    side: str,
    order_type: str = "market",
    base_size: str | None = None,
    quote_size: str | None = None,
    limit_price: str | None = None,
) -> dict:
    """Create a new order."""
    client_order_id = str(uuid.uuid4())
    order_config = {}

    if order_type == "market":
        if side == "BUY":
            order_config = {"market_market_ioc": {"quote_size": quote_size}}
        else:
            order_config = {"market_market_ioc": {"base_size": base_size}}
    elif order_type == "limit":
        order_config = {
            "limit_limit_gtc": {
                "base_size": base_size,
                "limit_price": limit_price,
            }
        }

    payload = {
        "client_order_id": client_order_id,
        "product_id": product_id,
        "side": side,
        "order_configuration": order_config,
    }
    return await client.post("/api/v3/brokerage/orders", json_data=payload)

# Market buy $100 of BTC
# await create_order(cb, "BTC-USD", "BUY", "market", quote_size="100")

# Limit sell 0.01 BTC at $70,000
# await create_order(cb, "BTC-USD", "SELL", "limit", base_size="0.01", limit_price="70000")
```

### List Orders

```python
async def list_orders(
    client: CoinbaseClient,
    product_id: str = "",
    order_status: list[str] | None = None,
    limit: int = 100,
) -> dict:
    """List orders with optional filters."""
    params = {"limit": limit}
    if product_id:
        params["product_id"] = product_id
    if order_status:
        params["order_status"] = order_status
    return await client.get("/api/v3/brokerage/orders/historical/batch", params=params)
```

### Get Order

```python
async def get_order(client: CoinbaseClient, order_id: str) -> dict:
    """Get a specific order by ID."""
    return await client.get(f"/api/v3/brokerage/orders/historical/{order_id}")
```

### Cancel Orders

```python
async def cancel_orders(client: CoinbaseClient, order_ids: list[str]) -> dict:
    """Cancel one or more orders."""
    return await client.post(
        "/api/v3/brokerage/orders/batch_cancel",
        json_data={"order_ids": order_ids},
    )
```

### List Products

```python
async def list_products(
    client: CoinbaseClient,
    product_type: str = "SPOT",
    limit: int = 100,
) -> dict:
    """List available trading products."""
    params = {"product_type": product_type, "limit": limit}
    return await client.get("/api/v3/brokerage/products", params=params)
```

### Get Product

```python
async def get_product(client: CoinbaseClient, product_id: str) -> dict:
    """Get details for a specific product (e.g., BTC-USD)."""
    return await client.get(f"/api/v3/brokerage/products/{product_id}")
```

### Get Product Candles

```python
async def get_candles(
    client: CoinbaseClient,
    product_id: str,
    start: str,
    end: str,
    granularity: str = "ONE_HOUR",
) -> dict:
    """Get candle (OHLCV) data for a product.

    Granularity options: ONE_MINUTE, FIVE_MINUTE, FIFTEEN_MINUTE,
    THIRTY_MINUTE, ONE_HOUR, TWO_HOUR, SIX_HOUR, ONE_DAY.
    start/end are Unix timestamps as strings.
    """
    params = {
        "start": start,
        "end": end,
        "granularity": granularity,
    }
    return await client.get(f"/api/v3/brokerage/products/{product_id}/candles", params=params)
```

### Get Market Ticker

```python
async def get_ticker(client: CoinbaseClient, product_id: str, limit: int = 100) -> dict:
    """Get recent trades (ticker) for a product."""
    params = {"limit": limit}
    return await client.get(f"/api/v3/brokerage/products/{product_id}/ticker", params=params)
```

### Get Best Bid/Ask

```python
async def get_best_bid_ask(client: CoinbaseClient, product_ids: list[str] | None = None) -> dict:
    """Get best bid/ask for products."""
    params = {}
    if product_ids:
        params["product_ids"] = product_ids
    return await client.get("/api/v3/brokerage/best_bid_ask", params=params)
```

## Error Handling

```python
import httpx

async def safe_request(client: CoinbaseClient, path: str) -> dict | None:
    """Make a request with error handling."""
    try:
        return await client.get(path)
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        body = e.response.json() if e.response.headers.get("content-type", "").startswith("application/json") else {}
        error_msg = body.get("error", "")
        error_detail = body.get("message", "")

        if status == 401:
            print(f"Authentication failed: {error_detail}")
        elif status == 403:
            print(f"Forbidden - check API key permissions: {error_detail}")
        elif status == 404:
            print(f"Resource not found: {error_detail}")
        elif status == 429:
            print("Rate limited - backing off")
            await asyncio.sleep(1)
        elif status >= 500:
            print(f"Server error ({status}): {error_detail}")
        else:
            print(f"HTTP {status}: {error_msg} - {error_detail}")
        return None
    except httpx.RequestError as e:
        print(f"Network error: {e}")
        return None
```

### Common Error Responses

| HTTP Status | Error | Description |
|---|---|---|
| 400 | INVALID_ARGUMENT | Bad request parameters |
| 401 | UNAUTHENTICATED | Invalid or expired JWT |
| 403 | PERMISSION_DENIED | API key lacks required permission |
| 404 | NOT_FOUND | Resource does not exist |
| 429 | RESOURCE_EXHAUSTED | Rate limit exceeded |
| 500 | INTERNAL | Server-side error |

## Common Pitfalls

1. **JWT Expiration** - JWTs expire after 2 minutes. Generate a fresh JWT for each request. Do not cache tokens for longer than ~90 seconds.

2. **API Secret Format** - The API secret is a PEM-encoded EC private key. Ensure newline characters (`\n`) are properly preserved when loading from environment variables. Use `.replace("\\n", "\n")`.

3. **Product ID Format** - Coinbase uses hyphenated pairs like `BTC-USD`, not `BTCUSD` or `BTC_USD`.

4. **Order Configuration Nesting** - Order parameters are nested inside `order_configuration` with a key specific to the order type (e.g., `market_market_ioc`, `limit_limit_gtc`). This is a common source of 400 errors.

5. **Client Order ID** - Every order requires a unique `client_order_id`. Use `uuid.uuid4()` to generate one per order.

6. **String Amounts** - All monetary amounts (`base_size`, `quote_size`, `limit_price`) must be strings, not floats or integers.

7. **Pagination** - List endpoints use cursor-based pagination. Check for a `cursor` field in the response and pass it in subsequent requests.

8. **URI in JWT** - The JWT `uris` claim must match the request method and path exactly. A mismatch causes 401 errors.

## Useful Links

- Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference
- Authentication Guide: https://docs.cdp.coinbase.com/advanced-trade/docs/rest-api-auth
- Python SDK (alternative): https://github.com/coinbase/coinbase-advanced-py
- Rate Limits: https://docs.cloud.coinbase.com/advanced-trade/docs/rest-api-rate-limits
- API Key Management: https://www.coinbase.com/settings/api
