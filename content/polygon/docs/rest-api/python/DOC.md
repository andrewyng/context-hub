---
name: rest-api
description: "Polygon.io Financial Market Data REST API Python coding guidelines using httpx async"
metadata:
  languages: "python"
  versions: "3.12.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "polygon,market-data,stocks,options,forex,crypto,financial,api"
---

# Polygon.io REST API Python Coding Guidelines

You are a Polygon.io API coding expert. Help me with writing code that calls the Polygon.io Market Data REST API using httpx async in Python.

Official documentation: https://polygon.io/docs

## Golden Rule: Use httpx Async for All REST Calls

Always use `httpx.AsyncClient` for all Polygon.io REST API interactions. Do not use the `polygon-api-client` SDK or `requests`. All code must be async-first using `httpx`.

- **HTTP Library:** httpx (async)
- **Correct:** `async with httpx.AsyncClient() as client:`
- **Incorrect:** Using `requests`, `polygon`, `polygon-api-client`, or synchronous httpx

## Installation

```bash
pip install httpx python-dotenv
```

**Environment Variables:**

```bash
export POLYGON_API_KEY='your_api_key_here'
```

Or create a `.env` file:

```bash
POLYGON_API_KEY=your_api_key_here
```

Load in Python:

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("POLYGON_API_KEY")
```

## Base URL

All Polygon.io REST API endpoints use a single base URL:

```
https://api.polygon.io
```

## Authentication

Polygon.io supports two authentication methods:

1. **Bearer Token (recommended):** `Authorization: Bearer {apiKey}`
2. **Query Parameter:** `?apiKey={apiKey}`

Always prefer the Authorization header over query parameters.

```python
import httpx

BASE_URL = "https://api.polygon.io"

HEADERS = {
    "Authorization": f"Bearer {api_key}",
}

async def get_ticker_details(ticker: str):
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v3/reference/tickers/{ticker}")
        resp.raise_for_status()
        return resp.json()
```

## Rate Limiting

Rate limits vary by subscription plan:

| Plan          | Requests/Minute | Data Access               |
|---------------|-----------------|---------------------------|
| **Free**      | 5               | End-of-day, 2yr history   |
| **Starter**   | Unlimited       | 15-min delayed, 5yr hist  |
| **Developer** | Unlimited       | 15-min delayed            |
| **Advanced**  | Unlimited       | Real-time tick-level      |

- Free plan: HTTP `429` returned when exceeding 5 req/min
- Paid plans: Effectively unlimited REST calls

```python
import asyncio
import httpx

async def request_with_retry(client: httpx.AsyncClient, url: str, params: dict | None = None):
    for attempt in range(5):
        resp = await client.get(url, params=params)
        if resp.status_code == 429:
            wait = 2 ** attempt
            await asyncio.sleep(wait)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("Rate limit exceeded after retries")
```

## Methods

### Reference Data - Tickers

```python
async def list_tickers(market: str = "stocks", active: bool = True, limit: int = 100):
    """GET /v3/reference/tickers - List all tickers with optional filters."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/v3/reference/tickers", params={
            "market": market,    # "stocks", "crypto", "fx", "otc", "indices"
            "active": str(active).lower(),
            "limit": limit,
        })
        resp.raise_for_status()
        return resp.json()

async def get_ticker_details(ticker: str):
    """GET /v3/reference/tickers/{ticker} - Get detailed info about a ticker."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v3/reference/tickers/{ticker}")
        resp.raise_for_status()
        return resp.json()

async def get_ticker_types():
    """GET /v3/reference/tickers/types - List all ticker types."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/v3/reference/tickers/types")
        resp.raise_for_status()
        return resp.json()
```

### Stock Aggregates (Bars / OHLCV)

```python
async def get_aggregates(ticker: str, multiplier: int, timespan: str, from_date: str, to_date: str, adjusted: bool = True, sort: str = "asc", limit: int = 5000):
    """GET /v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}

    Get OHLCV bars for a ticker over a date range.
    timespan: "second", "minute", "hour", "day", "week", "month", "quarter", "year"
    Dates in YYYY-MM-DD format.
    """
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(
            f"/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from_date}/{to_date}",
            params={"adjusted": str(adjusted).lower(), "sort": sort, "limit": limit},
        )
        resp.raise_for_status()
        return resp.json()

async def get_grouped_daily(date: str):
    """GET /v2/aggs/grouped/locale/us/market/stocks/{date} - All tickers' daily bars."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v2/aggs/grouped/locale/us/market/stocks/{date}")
        resp.raise_for_status()
        return resp.json()

async def get_daily_open_close(ticker: str, date: str):
    """GET /v1/open-close/{ticker}/{date} - Single day OHLCV for a ticker."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v1/open-close/{ticker}/{date}")
        resp.raise_for_status()
        return resp.json()

async def get_previous_close(ticker: str):
    """GET /v2/aggs/ticker/{ticker}/prev - Previous day's daily bar."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v2/aggs/ticker/{ticker}/prev")
        resp.raise_for_status()
        return resp.json()
```

### Stock Trades and Quotes

```python
async def get_trades(ticker: str, timestamp: str | None = None, limit: int = 100):
    """GET /v3/trades/{ticker} - Get historical trades."""
    params = {"limit": limit}
    if timestamp:
        params["timestamp"] = timestamp  # Nanosecond timestamp or RFC3339
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v3/trades/{ticker}", params=params)
        resp.raise_for_status()
        return resp.json()

async def get_quotes(ticker: str, timestamp: str | None = None, limit: int = 100):
    """GET /v3/quotes/{ticker} - Get historical NBBO quotes."""
    params = {"limit": limit}
    if timestamp:
        params["timestamp"] = timestamp
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v3/quotes/{ticker}", params=params)
        resp.raise_for_status()
        return resp.json()

async def get_last_trade(ticker: str):
    """GET /v2/last/trade/{ticker} - Get last trade for a ticker."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v2/last/trade/{ticker}")
        resp.raise_for_status()
        return resp.json()

async def get_last_quote(ticker: str):
    """GET /v2/last/nbbo/{ticker} - Get last NBBO quote for a ticker."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v2/last/nbbo/{ticker}")
        resp.raise_for_status()
        return resp.json()
```

### Snapshots

```python
async def get_all_snapshots():
    """GET /v2/snapshot/locale/us/markets/stocks/tickers - All stock snapshots."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/v2/snapshot/locale/us/markets/stocks/tickers")
        resp.raise_for_status()
        return resp.json()

async def get_ticker_snapshot(ticker: str):
    """GET /v2/snapshot/locale/us/markets/stocks/tickers/{ticker} - Single stock snapshot."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v2/snapshot/locale/us/markets/stocks/tickers/{ticker}")
        resp.raise_for_status()
        return resp.json()

async def get_gainers_losers(direction: str = "gainers"):
    """GET /v2/snapshot/locale/us/markets/stocks/{direction} - Top movers."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v2/snapshot/locale/us/markets/stocks/{direction}")
        resp.raise_for_status()
        return resp.json()

async def get_universal_snapshot(tickers: list[str]):
    """GET /v3/snapshot - Cross-asset snapshot (stocks, options, forex, crypto)."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/v3/snapshot", params={
            "ticker.any_of": ",".join(tickers),
        })
        resp.raise_for_status()
        return resp.json()
```

### Options

```python
async def get_options_contracts(underlying_ticker: str, expiration_date: str | None = None, limit: int = 100):
    """GET /v3/reference/options/contracts - List options contracts."""
    params = {"underlying_ticker": underlying_ticker, "limit": limit}
    if expiration_date:
        params["expiration_date"] = expiration_date
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/v3/reference/options/contracts", params=params)
        resp.raise_for_status()
        return resp.json()

async def get_options_aggregates(options_ticker: str, multiplier: int, timespan: str, from_date: str, to_date: str):
    """GET /v2/aggs/ticker/{options_ticker}/range/... - Options OHLCV bars.
    Options ticker format: O:AAPL230120C00150000
    """
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(
            f"/v2/aggs/ticker/{options_ticker}/range/{multiplier}/{timespan}/{from_date}/{to_date}"
        )
        resp.raise_for_status()
        return resp.json()
```

### Forex

```python
async def get_forex_aggregates(ticker: str, multiplier: int, timespan: str, from_date: str, to_date: str):
    """GET /v2/aggs/ticker/{ticker}/range/... - Forex OHLCV bars.
    Ticker format: C:EURUSD
    """
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(
            f"/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from_date}/{to_date}"
        )
        resp.raise_for_status()
        return resp.json()

async def get_forex_snapshot(ticker: str):
    """GET /v2/snapshot/locale/global/markets/forex/tickers/{ticker}"""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v2/snapshot/locale/global/markets/forex/tickers/{ticker}")
        resp.raise_for_status()
        return resp.json()
```

### Crypto

```python
async def get_crypto_aggregates(ticker: str, multiplier: int, timespan: str, from_date: str, to_date: str):
    """GET /v2/aggs/ticker/{ticker}/range/... - Crypto OHLCV bars.
    Ticker format: X:BTCUSD
    """
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(
            f"/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from_date}/{to_date}"
        )
        resp.raise_for_status()
        return resp.json()

async def get_crypto_snapshot(ticker: str):
    """GET /v2/snapshot/locale/global/markets/crypto/tickers/{ticker}"""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get(f"/v2/snapshot/locale/global/markets/crypto/tickers/{ticker}")
        resp.raise_for_status()
        return resp.json()
```

### Market Status and Holidays

```python
async def get_market_status():
    """GET /v1/marketstatus/now - Current market status (open/closed)."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/v1/marketstatus/now")
        resp.raise_for_status()
        return resp.json()

async def get_market_holidays():
    """GET /v1/marketstatus/upcoming - Upcoming market holidays."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS) as client:
        resp = await client.get("/v1/marketstatus/upcoming")
        resp.raise_for_status()
        return resp.json()
```

## Error Handling

Polygon.io returns standard HTTP status codes with a JSON body containing `status`, `request_id`, and `error` fields.

| Status | Meaning                                      |
|--------|----------------------------------------------|
| 200    | Success                                      |
| 400    | Bad request / invalid parameters             |
| 401    | Unauthorized (invalid or missing API key)    |
| 403    | Forbidden (endpoint not in plan)             |
| 404    | Resource not found                           |
| 429    | Rate limit exceeded (free plan)              |
| 500    | Internal server error                        |

```python
import httpx

async def safe_request(client: httpx.AsyncClient, url: str, params: dict | None = None):
    try:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") == "ERROR":
            raise Exception(f"Polygon API error: {data.get('error', 'Unknown error')}")
        return data
    except httpx.HTTPStatusError as e:
        error_body = e.response.json() if e.response.headers.get("content-type", "").startswith("application/json") else {}
        msg = error_body.get("error", e.response.text)
        if e.response.status_code == 429:
            raise Exception(f"Rate limited: {msg}")
        elif e.response.status_code == 403:
            raise Exception(f"Plan upgrade required: {msg}")
        elif e.response.status_code == 401:
            raise Exception("Unauthorized: check your POLYGON_API_KEY")
        else:
            raise Exception(f"Polygon API error {e.response.status_code}: {msg}")
    except httpx.RequestError as e:
        raise Exception(f"Network error: {e}")
```

## Common Pitfalls

1. **Ticker prefixes for non-stock assets.** Forex uses `C:` prefix (`C:EURUSD`), crypto uses `X:` prefix (`X:BTCUSD`), options use `O:` prefix (`O:AAPL230120C00150000`). Stocks have no prefix.

2. **Free plan is severely rate-limited.** Only 5 requests/minute on the free tier. Build in aggressive retry/backoff logic or upgrade.

3. **Aggregates endpoint date format.** Use `YYYY-MM-DD` for date parameters, not timestamps.

4. **Pagination with next_url.** List endpoints return a `next_url` field for pagination. Follow it directly (it includes the auth param).

5. **Adjusted vs unadjusted data.** The `adjusted` parameter on aggregates defaults to `true`. Set `adjusted=false` if you need raw split-unadjusted data.

6. **Results limit.** The aggregates endpoint caps at 50,000 results per request. For longer ranges, paginate or reduce the timespan.

7. **API key in query string leaks.** Always use the `Authorization: Bearer` header instead of `?apiKey=` to avoid leaking keys in logs and referrer headers.

8. **Response structure varies by endpoint version.** v2 endpoints return `{"results": [...]}`, v3 endpoints return `{"results": [...], "next_url": "..."}`. Always check the version prefix.

9. **Snapshot endpoints require paid plan.** Real-time snapshot endpoints return 403 on the free plan.

10. **Options ticker format is strict.** Options tickers follow the OCC format: `O:{TICKER}{YYMMDD}{C/P}{STRIKE*1000}`. Example: `O:AAPL230120C00150000` for AAPL Jan 20 2023 $150 Call.

## Useful Links

- Official Documentation: https://polygon.io/docs
- Stocks API: https://polygon.io/docs/stocks
- Options API: https://polygon.io/docs/options
- Forex API: https://polygon.io/docs/forex
- Crypto API: https://polygon.io/docs/crypto
- Python Client (reference): https://github.com/polygon-io/client-python
- Pricing/Plans: https://polygon.io/pricing
- API Dashboard: https://polygon.io/dashboard
