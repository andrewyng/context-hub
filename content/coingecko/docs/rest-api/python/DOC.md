---
name: rest-api
description: "CoinGecko REST API Python coding guidelines using httpx async"
metadata:
  languages: "python"
  versions: "3.12.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "coingecko,crypto,market-data,prices,coins,defi,nft,api"
---

# CoinGecko REST API Python Coding Guidelines

You are a CoinGecko API coding expert. Help me with writing code using the CoinGecko REST API with httpx async in Python.

You can find the official documentation here:
https://docs.coingecko.com/reference/introduction

## Golden Rule: Use httpx Async with API Key Authentication

Always use `httpx` with async/await for all CoinGecko API interactions. Use the Pro API base URL with an API key for production. The free (demo) tier is available for testing but has strict rate limits. Never hardcode API keys in source code.

## Installation

```bash
pip install httpx
```

**Environment Variables:**

```bash
# For Pro API (paid plans)
export COINGECKO_API_KEY='your_pro_api_key_here'

# For Demo/Free API
export COINGECKO_DEMO_API_KEY='your_demo_api_key_here'
```

Load environment variables in Python:

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("COINGECKO_API_KEY")
```

## Base URL

| Tier | Base URL | Auth Header |
|---|---|---|
| Pro (paid) | `https://pro-api.coingecko.com/api/v3` | `x-cg-pro-api-key` |
| Demo (free) | `https://api.coingecko.com/api/v3` | `x-cg-demo-api-key` |

## Authentication

CoinGecko uses API key authentication via a custom header or query parameter.

```python
import httpx


class CoinGeckoClient:
    def __init__(self, api_key: str, pro: bool = True):
        if pro:
            self.base_url = "https://pro-api.coingecko.com/api/v3"
            self.headers = {"x-cg-pro-api-key": api_key, "accept": "application/json"}
        else:
            self.base_url = "https://api.coingecko.com/api/v3"
            self.headers = {"x-cg-demo-api-key": api_key, "accept": "application/json"}

    async def get(self, path: str, params: dict | None = None) -> dict | list:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers, params=params or {})
            resp.raise_for_status()
            return resp.json()
```

## Rate Limiting

| Plan | Rate Limit | Cache/Update Frequency |
|---|---|---|
| Demo (free) | ~10-30 calls/min | 30-60 seconds |
| Analyst | 500 calls/min | 20 seconds |
| Lite | 500 calls/min | 20 seconds |
| Pro | 1000 calls/min | 20 seconds |
| Enterprise | Custom | 20 seconds |

```python
import asyncio
import time


class RateLimiter:
    def __init__(self, calls_per_minute: int = 25):
        self.interval = 60.0 / calls_per_minute
        self.last_call = 0.0
        self._lock = asyncio.Lock()

    async def acquire(self):
        async with self._lock:
            now = time.time()
            wait = self.interval - (now - self.last_call)
            if wait > 0:
                await asyncio.sleep(wait)
            self.last_call = time.time()
```

## Methods

### Ping (Check API Status)

```python
async def ping(client: CoinGeckoClient) -> dict:
    """Check API server status."""
    return await client.get("/ping")

# Usage
import asyncio

async def main():
    cg = CoinGeckoClient(api_key, pro=True)
    result = await ping(cg)
    print(result)  # {"gecko_says": "(V3) To the Moon!"}

asyncio.run(main())
```

### Simple Price

```python
async def get_simple_price(
    client: CoinGeckoClient,
    ids: str,
    vs_currencies: str = "usd",
    include_market_cap: bool = False,
    include_24hr_vol: bool = False,
    include_24hr_change: bool = False,
    include_last_updated_at: bool = False,
    precision: str | None = None,
) -> dict:
    """Get current price of coins.

    Args:
        ids: Comma-separated coin IDs (e.g., "bitcoin,ethereum").
        vs_currencies: Comma-separated target currencies (e.g., "usd,eur").
        precision: Decimal places - "full" or 0-18.
    """
    params = {
        "ids": ids,
        "vs_currencies": vs_currencies,
        "include_market_cap": str(include_market_cap).lower(),
        "include_24hr_vol": str(include_24hr_vol).lower(),
        "include_24hr_change": str(include_24hr_change).lower(),
        "include_last_updated_at": str(include_last_updated_at).lower(),
    }
    if precision:
        params["precision"] = precision
    return await client.get("/simple/price", params=params)

# Get BTC and ETH prices in USD with market cap
# result = await get_simple_price(cg, "bitcoin,ethereum", "usd", include_market_cap=True)
# print(result["bitcoin"]["usd"])
```

### Coins List

```python
async def get_coins_list(
    client: CoinGeckoClient, include_platform: bool = False
) -> list:
    """Get list of all supported coins with id, name, and symbol.

    Note: No pagination needed. Returns full list.
    """
    params = {"include_platform": str(include_platform).lower()}
    return await client.get("/coins/list", params=params)
```

### Coins Markets

```python
async def get_coins_markets(
    client: CoinGeckoClient,
    vs_currency: str = "usd",
    ids: str | None = None,
    category: str | None = None,
    order: str = "market_cap_desc",
    per_page: int = 100,
    page: int = 1,
    sparkline: bool = False,
    price_change_percentage: str | None = None,
) -> list:
    """Get coin market data (price, market cap, volume) with pagination.

    Args:
        order: Sort by - market_cap_desc, market_cap_asc, volume_desc, volume_asc, id_asc, id_desc.
        price_change_percentage: Comma-separated intervals - "1h,24h,7d,14d,30d,200d,1y".
    """
    params = {
        "vs_currency": vs_currency,
        "order": order,
        "per_page": per_page,
        "page": page,
        "sparkline": str(sparkline).lower(),
    }
    if ids:
        params["ids"] = ids
    if category:
        params["category"] = category
    if price_change_percentage:
        params["price_change_percentage"] = price_change_percentage
    return await client.get("/coins/markets", params=params)

# Top 10 coins by market cap with 24h change
# result = await get_coins_markets(cg, per_page=10, price_change_percentage="24h")
```

### Coin by ID

```python
async def get_coin(
    client: CoinGeckoClient,
    coin_id: str,
    localization: bool = False,
    tickers: bool = False,
    market_data: bool = True,
    community_data: bool = False,
    developer_data: bool = False,
    sparkline: bool = False,
) -> dict:
    """Get detailed data for a specific coin.

    Args:
        coin_id: Coin ID from /coins/list (e.g., "bitcoin").
    """
    params = {
        "localization": str(localization).lower(),
        "tickers": str(tickers).lower(),
        "market_data": str(market_data).lower(),
        "community_data": str(community_data).lower(),
        "developer_data": str(developer_data).lower(),
        "sparkline": str(sparkline).lower(),
    }
    return await client.get(f"/coins/{coin_id}", params=params)
```

### Coin Historical Data

```python
async def get_coin_history(
    client: CoinGeckoClient, coin_id: str, date: str, localization: bool = False
) -> dict:
    """Get historical data for a coin on a specific date.

    Args:
        coin_id: Coin ID (e.g., "bitcoin").
        date: Date in dd-mm-yyyy format (e.g., "30-12-2025").
    """
    params = {"date": date, "localization": str(localization).lower()}
    return await client.get(f"/coins/{coin_id}/history", params=params)
```

### Coin Market Chart

```python
async def get_coin_market_chart(
    client: CoinGeckoClient,
    coin_id: str,
    vs_currency: str = "usd",
    days: str = "30",
    interval: str | None = None,
    precision: str | None = None,
) -> dict:
    """Get historical market data (price, market cap, volume) over time.

    Args:
        days: Number of days (1, 7, 14, 30, 90, 180, 365, "max").
        interval: Data interval - "daily", "hourly", or auto.
    """
    params = {"vs_currency": vs_currency, "days": days}
    if interval:
        params["interval"] = interval
    if precision:
        params["precision"] = precision
    return await client.get(f"/coins/{coin_id}/market_chart", params=params)
```

### Trending Coins

```python
async def get_trending(client: CoinGeckoClient) -> dict:
    """Get trending search coins, NFTs, and categories."""
    return await client.get("/search/trending")
```

### Search

```python
async def search(client: CoinGeckoClient, query: str) -> dict:
    """Search for coins, categories, and exchanges.

    Args:
        query: Search string (e.g., "bitcoin", "defi").
    """
    return await client.get("/search", params={"query": query})
```

### Global Data

```python
async def get_global(client: CoinGeckoClient) -> dict:
    """Get cryptocurrency global data (total market cap, volume, dominance)."""
    return await client.get("/global")
```

### Exchange List

```python
async def get_exchanges(
    client: CoinGeckoClient, per_page: int = 100, page: int = 1
) -> list:
    """Get list of exchanges ranked by trading volume."""
    return await client.get("/exchanges", params={"per_page": per_page, "page": page})
```

### Categories

```python
async def get_categories(client: CoinGeckoClient, order: str = "market_cap_desc") -> list:
    """Get list of coin categories with market data."""
    return await client.get("/coins/categories", params={"order": order})
```

## Error Handling

```python
async def safe_request(client: CoinGeckoClient, path: str, params: dict | None = None) -> dict | list | None:
    """Make a request with error handling."""
    try:
        return await client.get(path, params=params)
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        if status == 401:
            print("Invalid API key")
        elif status == 429:
            retry_after = e.response.headers.get("retry-after", "60")
            print(f"Rate limited - retry after {retry_after}s")
            await asyncio.sleep(int(retry_after))
        elif status == 403:
            print("Access forbidden - check your plan tier")
        elif status == 404:
            print("Endpoint or resource not found")
        elif status >= 500:
            print(f"CoinGecko server error ({status})")
        else:
            print(f"HTTP {status}: {e.response.text}")
        return None
    except httpx.RequestError as e:
        print(f"Network error: {e}")
        return None
```

### Common HTTP Error Codes

| Status | Description |
|---|---|
| 400 | Bad request - invalid parameters |
| 401 | Unauthorized - invalid or missing API key |
| 403 | Forbidden - endpoint not available on your plan |
| 404 | Not found - invalid coin ID or endpoint |
| 429 | Too many requests - rate limit exceeded |
| 500 | Internal server error |
| 503 | Service unavailable |

## Common Pitfalls

1. **Coin IDs vs Symbols** - CoinGecko uses unique string IDs (e.g., `"bitcoin"`, `"ethereum"`), not ticker symbols. Use `/coins/list` to find the correct ID. Multiple coins can share the same symbol.

2. **Free Tier Limitations** - The demo API has aggressive rate limiting (~10-30 calls/min) and slower cache updates (30-60s). Data may also be delayed compared to the Pro tier.

3. **Boolean Parameters** - Pass booleans as lowercase strings (`"true"`, `"false"`) in query parameters, not Python booleans.

4. **Date Format** - The `/coins/{id}/history` endpoint expects dates in `dd-mm-yyyy` format, not ISO 8601.

5. **Pagination** - Market endpoints use `page` and `per_page` parameters. Max `per_page` is 250. Not all endpoints support pagination.

6. **vs_currency vs vs_currencies** - The `/simple/price` endpoint uses `vs_currencies` (plural), while `/coins/markets` uses `vs_currency` (singular). Mixing them up returns empty results.

7. **Rate Limit Headers** - Check `retry-after` headers when receiving 429 responses. Do not retry immediately.

8. **Large Responses** - Endpoints like `/coins/{id}` return very large JSON objects. Use query parameters to disable unnecessary data sections (tickers, community_data, etc.).

## Useful Links

- Official Documentation: https://docs.coingecko.com/reference/introduction
- API Status: https://status.coingecko.com/
- Supported Coins List: https://docs.coingecko.com/reference/coins-list
- Supported Currencies: https://docs.coingecko.com/reference/simple-supported-currencies
- API Key Dashboard: https://www.coingecko.com/en/developers/dashboard
