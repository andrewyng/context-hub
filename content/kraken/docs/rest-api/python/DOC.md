---
name: rest-api
description: "Kraken Exchange REST API Python coding guidelines using httpx async"
metadata:
  languages: "python"
  versions: "3.12.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "kraken,crypto,trading,exchange,bitcoin,api"
---

# Kraken Exchange REST API Python Coding Guidelines

You are a Kraken Exchange REST API coding expert. Help me with writing code using the Kraken REST API with httpx async in Python.

You can find the official documentation here:
https://docs.kraken.com/api/

## Golden Rule: Use httpx Async with HMAC-SHA512 Signed Requests

Always use `httpx` with async/await for all Kraken REST API interactions. Authenticate private endpoints using HMAC-SHA512 signatures with nonce. Never send your API secret in plaintext. Always use increasing nonces to avoid replay attacks.

## Installation

```bash
pip install httpx
```

**Environment Variables:**

```bash
export KRAKEN_API_KEY='your_api_key_here'
export KRAKEN_API_SECRET='your_base64_encoded_secret_here'
```

Load environment variables in Python:

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("KRAKEN_API_KEY")
api_secret = os.getenv("KRAKEN_API_SECRET")
```

## Base URL

```
https://api.kraken.com
```

- Public endpoints: `/0/public/{method}`
- Private endpoints: `/0/private/{method}`

## Authentication

Kraken uses HMAC-SHA512 signatures for private endpoint authentication.

```python
import base64
import hashlib
import hmac
import time
import urllib.parse


def generate_kraken_signature(
    url_path: str, data: dict, secret: str
) -> str:
    """Generate Kraken API signature.

    Signature = HMAC-SHA512(url_path + SHA256(nonce + POST_data), base64_decode(secret))
    """
    post_data = urllib.parse.urlencode(data)
    encoded = (str(data["nonce"]) + post_data).encode()
    message = url_path.encode() + hashlib.sha256(encoded).digest()
    mac = hmac.new(base64.b64decode(secret), message, hashlib.sha512)
    return base64.b64encode(mac.digest()).decode()


def get_nonce() -> int:
    """Return a nonce as millisecond timestamp."""
    return int(time.time() * 1000)
```

### Authenticated Client Helper

```python
import httpx


class KrakenClient:
    BASE_URL = "https://api.kraken.com"

    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret

    async def public(self, method: str, params: dict | None = None) -> dict:
        """Call a public endpoint."""
        url = f"{self.BASE_URL}/0/public/{method}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params or {})
            resp.raise_for_status()
            return resp.json()

    async def private(self, method: str, data: dict | None = None) -> dict:
        """Call a private endpoint with authentication."""
        url_path = f"/0/private/{method}"
        url = f"{self.BASE_URL}{url_path}"
        post_data = data or {}
        post_data["nonce"] = get_nonce()

        signature = generate_kraken_signature(url_path, post_data, self.api_secret)

        headers = {
            "API-Key": self.api_key,
            "API-Sign": signature,
            "Content-Type": "application/x-www-form-urlencoded",
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, data=post_data)
            resp.raise_for_status()
            return resp.json()
```

## Rate Limiting

Kraken uses a call counter system per API key that increases per request and decays over time.

| Verification Tier | Max Counter | Decay Rate |
|---|---|---|
| Starter | 15 | -0.33/sec |
| Intermediate | 20 | -0.5/sec |
| Pro | 20 | -1/sec |

Counter costs:
- Most calls: +1
- Ledger/trade history: +2
- AddOrder/CancelOrder: separate matching engine limiter

```python
import asyncio

class RateLimiter:
    def __init__(self, max_counter: int = 15, decay_rate: float = 0.33):
        self.counter = 0.0
        self.max_counter = max_counter
        self.decay_rate = decay_rate
        self.last_time = time.time()
        self._lock = asyncio.Lock()

    async def acquire(self, cost: int = 1):
        async with self._lock:
            now = time.time()
            elapsed = now - self.last_time
            self.counter = max(0, self.counter - elapsed * self.decay_rate)
            self.last_time = now

            while self.counter + cost > self.max_counter:
                wait = (self.counter + cost - self.max_counter) / self.decay_rate
                await asyncio.sleep(wait)
                now = time.time()
                elapsed = now - self.last_time
                self.counter = max(0, self.counter - elapsed * self.decay_rate)
                self.last_time = now

            self.counter += cost
```

## Methods

### Get Server Time

```python
async def get_server_time(client: KrakenClient) -> dict:
    """Get server time (useful for checking connectivity)."""
    return await client.public("Time")

# Usage
import asyncio

async def main():
    kraken = KrakenClient(api_key, api_secret)
    result = await get_server_time(kraken)
    print(result["result"]["unixtime"])

asyncio.run(main())
```

### Get Asset Info

```python
async def get_assets(client: KrakenClient, assets: str | None = None) -> dict:
    """Get info about specific or all assets.

    Args:
        assets: Comma-delimited list like "XBT,ETH" or None for all.
    """
    params = {}
    if assets:
        params["asset"] = assets
    return await client.public("Assets", params=params)
```

### Get Tradable Asset Pairs

```python
async def get_asset_pairs(client: KrakenClient, pair: str | None = None) -> dict:
    """Get tradable asset pairs.

    Args:
        pair: Comma-delimited list like "XXBTZUSD,XETHZUSD" or None for all.
    """
    params = {}
    if pair:
        params["pair"] = pair
    return await client.public("AssetPairs", params=params)
```

### Get Ticker Information

```python
async def get_ticker(client: KrakenClient, pair: str) -> dict:
    """Get ticker information for one or more pairs.

    Args:
        pair: Comma-delimited pair list, e.g., "XBTUSD" or "XBTUSD,ETHUSD".
    """
    return await client.public("Ticker", params={"pair": pair})

# Usage
# result = await get_ticker(kraken, "XBTUSD")
# ticker = result["result"]["XXBTZUSD"]
# print(f"Last price: {ticker['c'][0]}, Volume: {ticker['v'][1]}")
```

### Get OHLC Data

```python
async def get_ohlc(
    client: KrakenClient,
    pair: str,
    interval: int = 60,
    since: int | None = None,
) -> dict:
    """Get OHLC (candlestick) data.

    Args:
        pair: Asset pair, e.g., "XBTUSD".
        interval: Time frame in minutes (1, 5, 15, 30, 60, 240, 1440, 10080, 21600).
        since: Return data since given Unix timestamp.
    """
    params = {"pair": pair, "interval": interval}
    if since:
        params["since"] = since
    return await client.public("OHLC", params=params)
```

### Get Order Book

```python
async def get_order_book(client: KrakenClient, pair: str, count: int = 100) -> dict:
    """Get order book for a pair.

    Args:
        pair: Asset pair, e.g., "XBTUSD".
        count: Maximum number of asks/bids (1-500).
    """
    return await client.public("Depth", params={"pair": pair, "count": count})
```

### Get Recent Trades

```python
async def get_recent_trades(
    client: KrakenClient, pair: str, since: str | None = None, count: int = 1000
) -> dict:
    """Get recent trades.

    Args:
        pair: Asset pair.
        since: Timestamp for trades since (nanosecond timestamp as string).
        count: Number of trades to return (max 1000).
    """
    params = {"pair": pair, "count": count}
    if since:
        params["since"] = since
    return await client.public("Trades", params=params)
```

### Get Account Balance

```python
async def get_balance(client: KrakenClient) -> dict:
    """Get account balances for all assets."""
    return await client.private("Balance")

# Usage
# result = await get_balance(kraken)
# for asset, balance in result["result"].items():
#     print(f"{asset}: {balance}")
```

### Get Trade Balance

```python
async def get_trade_balance(client: KrakenClient, asset: str = "ZUSD") -> dict:
    """Get trade balance info.

    Args:
        asset: Base asset to determine balance (default ZUSD).
    """
    return await client.private("TradeBalance", data={"asset": asset})
```

### Get Open Orders

```python
async def get_open_orders(client: KrakenClient, trades: bool = False) -> dict:
    """Get open orders.

    Args:
        trades: Whether to include trades in output.
    """
    data = {}
    if trades:
        data["trades"] = True
    return await client.private("OpenOrders", data=data)
```

### Add Order

```python
async def add_order(
    client: KrakenClient,
    pair: str,
    type: str,
    ordertype: str,
    volume: str,
    price: str | None = None,
    leverage: str | None = None,
    validate: bool = False,
) -> dict:
    """Place a new order.

    Args:
        pair: Asset pair, e.g., "XBTUSD".
        type: "buy" or "sell".
        ordertype: "market", "limit", "stop-loss", "take-profit",
                   "stop-loss-limit", "take-profit-limit".
        volume: Order volume in base currency (as string).
        price: Limit price (required for limit orders, as string).
        leverage: Leverage amount (e.g., "2:1").
        validate: If True, validate only without placing order.
    """
    data = {
        "pair": pair,
        "type": type,
        "ordertype": ordertype,
        "volume": volume,
    }
    if price:
        data["price"] = price
    if leverage:
        data["leverage"] = leverage
    if validate:
        data["validate"] = True
    return await client.private("AddOrder", data=data)

# Market buy 0.01 BTC
# await add_order(kraken, "XBTUSD", "buy", "market", "0.01")

# Limit sell 0.5 ETH at $4000
# await add_order(kraken, "ETHUSD", "sell", "limit", "0.5", price="4000")
```

### Cancel Order

```python
async def cancel_order(client: KrakenClient, txid: str) -> dict:
    """Cancel an open order.

    Args:
        txid: Transaction ID of the order to cancel.
    """
    return await client.private("CancelOrder", data={"txid": txid})
```

### Cancel All Orders

```python
async def cancel_all_orders(client: KrakenClient) -> dict:
    """Cancel all open orders."""
    return await client.private("CancelAll")
```

## Error Handling

```python
async def safe_request(client: KrakenClient, method: str, data: dict | None = None) -> dict | None:
    """Make a private request with error handling."""
    try:
        result = await client.private(method, data=data)

        # Kraken returns errors in the response body, not HTTP status
        if result.get("error") and len(result["error"]) > 0:
            for err in result["error"]:
                if err.startswith("EAPI:Rate limit"):
                    print("Rate limited - waiting before retry")
                    await asyncio.sleep(5)
                elif err.startswith("EAPI:Invalid nonce"):
                    print("Invalid nonce - ensure nonces are always increasing")
                elif err.startswith("EOrder:"):
                    print(f"Order error: {err}")
                elif err.startswith("EGeneral:"):
                    print(f"General error: {err}")
                elif err.startswith("EService:"):
                    print(f"Service error: {err}")
                else:
                    print(f"Kraken error: {err}")
            return None

        return result
    except httpx.HTTPStatusError as e:
        print(f"HTTP error {e.response.status_code}: {e}")
        return None
    except httpx.RequestError as e:
        print(f"Network error: {e}")
        return None
```

### Common Kraken Error Prefixes

| Prefix | Description |
|---|---|
| EAPI:Rate limit exceeded | REST API call counter exceeded tier maximum |
| EAPI:Invalid nonce | Nonce is not greater than previous nonce |
| EAPI:Invalid key | API key is invalid or inactive |
| EGeneral:Invalid arguments | Missing or malformed parameters |
| EGeneral:Permission denied | API key lacks required permissions |
| EOrder:Insufficient funds | Not enough balance to place order |
| EOrder:Order minimum not met | Order size below minimum for pair |
| EService:Unavailable | Kraken service temporarily unavailable |
| EService:Throttled | Too many concurrent requests |

## Common Pitfalls

1. **Nonce Must Always Increase** - Use millisecond timestamps. Never reuse or decrement nonces. Too many invalid nonce requests can result in temporary IP bans.

2. **Errors in Response Body** - Kraken returns HTTP 200 even for errors. Always check the `error` array in the response JSON before accessing `result`.

3. **Asset Naming Conventions** - Kraken uses X-prefixed names for crypto (e.g., `XXBT` for Bitcoin, `XETH` for Ethereum) and Z-prefixed for fiat (e.g., `ZUSD`). Pairs combine these: `XXBTZUSD`. Some endpoints also accept `XBT/USD` or `XBTUSD`.

4. **POST for Private Endpoints** - All private endpoints use POST with `application/x-www-form-urlencoded` content type, not JSON.

5. **Volume as String** - Always pass order volumes and prices as strings, not numbers.

6. **Signature Encoding** - The API secret is base64-encoded. You must base64-decode it before using it for HMAC signing. The resulting signature must be base64-encoded.

7. **Pair Names in Responses** - Response pair keys may differ from request keys (e.g., request `XBTUSD`, response key `XXBTZUSD`). Handle both formats.

8. **OTP for 2FA** - If two-factor authentication is enabled on the API key, include the `otp` parameter in private requests.

## Useful Links

- Official API Documentation: https://docs.kraken.com/api/
- Spot REST API Guide: https://docs.kraken.com/api/docs/guides/spot-rest-intro
- Authentication Guide: https://docs.kraken.com/api/docs/guides/spot-rest-auth
- Rate Limits: https://docs.kraken.com/api/docs/guides/spot-rest-ratelimits
- API Key Management: https://www.kraken.com/u/security/api
- Kraken Status: https://status.kraken.com/
