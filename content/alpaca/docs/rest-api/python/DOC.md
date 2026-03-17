---
name: rest-api
description: "Alpaca Trading & Market Data REST API Python coding guidelines using httpx async"
metadata:
  languages: "python"
  versions: "3.12.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "alpaca,trading,stocks,crypto,market-data,commission-free,usa,api"
---

# Alpaca REST API Python Coding Guidelines

You are an Alpaca API coding expert. Help me with writing code that calls the Alpaca Trading and Market Data REST APIs using httpx async in Python.

Official documentation: https://docs.alpaca.markets/

## Golden Rule: Use httpx Async for All REST Calls

Always use `httpx.AsyncClient` for all Alpaca REST API interactions. Do not use the `alpaca-py` SDK or `requests`. All code must be async-first using `httpx`.

- **HTTP Library:** httpx (async)
- **Correct:** `async with httpx.AsyncClient() as client:`
- **Incorrect:** Using `requests`, `alpaca-py`, `alpaca-trade-api`, or synchronous httpx

## Installation

```bash
pip install httpx python-dotenv
```

**Environment Variables:**

```bash
export ALPACA_API_KEY='your_api_key_here'
export ALPACA_API_SECRET='your_api_secret_here'
```

Or create a `.env` file:

```bash
ALPACA_API_KEY=your_api_key_here
ALPACA_API_SECRET=your_api_secret_here
```

Load in Python:

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ALPACA_API_KEY")
api_secret = os.getenv("ALPACA_API_SECRET")
```

## Base URLs

| Environment      | Trading API                           | Market Data API                  |
|------------------|---------------------------------------|----------------------------------|
| **Live**         | `https://api.alpaca.markets`          | `https://data.alpaca.markets`    |
| **Paper**        | `https://paper-api.alpaca.markets`    | `https://data.alpaca.markets`    |

Paper trading uses the same market data endpoint as live. Only the trading base URL differs.

## Authentication

Alpaca uses two custom headers for API key + secret authentication:

| Header                  | Value            |
|-------------------------|------------------|
| `APCA-API-KEY-ID`       | Your API key ID  |
| `APCA-API-SECRET-KEY`   | Your secret key  |

Alternatively, HTTP Basic Auth is supported (key ID as username, secret as password).

```python
import httpx

TRADING_BASE = "https://paper-api.alpaca.markets"
DATA_BASE = "https://data.alpaca.markets"

HEADERS = {
    "APCA-API-KEY-ID": api_key,
    "APCA-API-SECRET-KEY": api_secret,
}

async def get_account():
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/account")
        resp.raise_for_status()
        return resp.json()
```

## Rate Limiting

- **Default:** 200 requests per minute per API key
- **Paid data plans:** Up to 1,000 requests per minute
- Exceeding the limit returns HTTP `429 Too Many Requests`
- Implement exponential backoff on 429 responses

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

### Account

```python
async def get_account():
    """GET /v2/account - Get account info (buying power, equity, status)."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/account")
        resp.raise_for_status()
        return resp.json()
```

### Orders

```python
async def create_order(symbol: str, qty: float, side: str, order_type: str, time_in_force: str = "day", limit_price: float | None = None):
    """POST /v2/orders - Submit a new order."""
    payload = {
        "symbol": symbol,
        "qty": str(qty),
        "side": side,           # "buy" or "sell"
        "type": order_type,     # "market", "limit", "stop", "stop_limit", "trailing_stop"
        "time_in_force": time_in_force,  # "day", "gtc", "opg", "cls", "ioc", "fok"
    }
    if limit_price is not None:
        payload["limit_price"] = str(limit_price)
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.post("/v2/orders", json=payload)
        resp.raise_for_status()
        return resp.json()

async def list_orders(status: str = "open", limit: int = 50):
    """GET /v2/orders - List orders filtered by status."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/orders", params={"status": status, "limit": limit})
        resp.raise_for_status()
        return resp.json()

async def get_order(order_id: str):
    """GET /v2/orders/{order_id} - Get a specific order."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get(f"/v2/orders/{order_id}")
        resp.raise_for_status()
        return resp.json()

async def cancel_order(order_id: str):
    """DELETE /v2/orders/{order_id} - Cancel an order."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.delete(f"/v2/orders/{order_id}")
        resp.raise_for_status()

async def cancel_all_orders():
    """DELETE /v2/orders - Cancel all open orders."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.delete("/v2/orders")
        resp.raise_for_status()
        return resp.json()

async def replace_order(order_id: str, qty: float | None = None, limit_price: float | None = None):
    """PATCH /v2/orders/{order_id} - Replace/modify an existing order."""
    payload = {}
    if qty is not None:
        payload["qty"] = str(qty)
    if limit_price is not None:
        payload["limit_price"] = str(limit_price)
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.patch(f"/v2/orders/{order_id}", json=payload)
        resp.raise_for_status()
        return resp.json()
```

### Positions

```python
async def list_positions():
    """GET /v2/positions - List all open positions."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/positions")
        resp.raise_for_status()
        return resp.json()

async def get_position(symbol: str):
    """GET /v2/positions/{symbol} - Get position for a symbol."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get(f"/v2/positions/{symbol}")
        resp.raise_for_status()
        return resp.json()

async def close_position(symbol: str):
    """DELETE /v2/positions/{symbol} - Close a position."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.delete(f"/v2/positions/{symbol}")
        resp.raise_for_status()
        return resp.json()

async def close_all_positions():
    """DELETE /v2/positions - Close all positions."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.delete("/v2/positions")
        resp.raise_for_status()
        return resp.json()
```

### Assets

```python
async def list_assets(status: str = "active", asset_class: str = "us_equity"):
    """GET /v2/assets - List tradeable assets."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/assets", params={"status": status, "asset_class": asset_class})
        resp.raise_for_status()
        return resp.json()

async def get_asset(symbol: str):
    """GET /v2/assets/{symbol} - Get asset details."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get(f"/v2/assets/{symbol}")
        resp.raise_for_status()
        return resp.json()
```

### Market Clock and Calendar

```python
async def get_clock():
    """GET /v2/clock - Get market open/close status."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/clock")
        resp.raise_for_status()
        return resp.json()

async def get_calendar(start: str, end: str):
    """GET /v2/calendar - Get market calendar. Dates in YYYY-MM-DD format."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/calendar", params={"start": start, "end": end})
        resp.raise_for_status()
        return resp.json()
```

### Portfolio History

```python
async def get_portfolio_history(period: str = "1M", timeframe: str = "1D"):
    """GET /v2/account/portfolio/history - Get portfolio value over time."""
    async with httpx.AsyncClient(base_url=TRADING_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/account/portfolio/history", params={
            "period": period,        # "1D", "1W", "1M", "3M", "1A", "all"
            "timeframe": timeframe,  # "1Min", "5Min", "15Min", "1H", "1D"
        })
        resp.raise_for_status()
        return resp.json()
```

### Market Data - Stock Bars (OHLCV)

```python
async def get_stock_bars(symbol: str, timeframe: str = "1Day", start: str | None = None, end: str | None = None, limit: int = 100):
    """GET /v2/stocks/{symbol}/bars - Get historical OHLCV bars."""
    params = {"timeframe": timeframe, "limit": limit}
    if start:
        params["start"] = start  # RFC3339 format: "2024-01-01T00:00:00Z"
    if end:
        params["end"] = end
    async with httpx.AsyncClient(base_url=DATA_BASE, headers=HEADERS) as client:
        resp = await client.get(f"/v2/stocks/{symbol}/bars", params=params)
        resp.raise_for_status()
        return resp.json()

async def get_multi_stock_bars(symbols: list[str], timeframe: str = "1Day", start: str | None = None, limit: int = 100):
    """GET /v2/stocks/bars - Get bars for multiple symbols."""
    params = {"symbols": ",".join(symbols), "timeframe": timeframe, "limit": limit}
    if start:
        params["start"] = start
    async with httpx.AsyncClient(base_url=DATA_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/stocks/bars", params=params)
        resp.raise_for_status()
        return resp.json()
```

### Market Data - Latest Quotes and Trades

```python
async def get_latest_quote(symbol: str):
    """GET /v2/stocks/{symbol}/quotes/latest - Get latest NBBO quote."""
    async with httpx.AsyncClient(base_url=DATA_BASE, headers=HEADERS) as client:
        resp = await client.get(f"/v2/stocks/{symbol}/quotes/latest")
        resp.raise_for_status()
        return resp.json()

async def get_latest_trade(symbol: str):
    """GET /v2/stocks/{symbol}/trades/latest - Get latest trade."""
    async with httpx.AsyncClient(base_url=DATA_BASE, headers=HEADERS) as client:
        resp = await client.get(f"/v2/stocks/{symbol}/trades/latest")
        resp.raise_for_status()
        return resp.json()

async def get_snapshot(symbol: str):
    """GET /v2/stocks/{symbol}/snapshot - Get full snapshot (latest trade, quote, bar)."""
    async with httpx.AsyncClient(base_url=DATA_BASE, headers=HEADERS) as client:
        resp = await client.get(f"/v2/stocks/{symbol}/snapshot")
        resp.raise_for_status()
        return resp.json()

async def get_snapshots(symbols: list[str]):
    """GET /v2/stocks/snapshots - Get snapshots for multiple symbols."""
    async with httpx.AsyncClient(base_url=DATA_BASE, headers=HEADERS) as client:
        resp = await client.get("/v2/stocks/snapshots", params={"symbols": ",".join(symbols)})
        resp.raise_for_status()
        return resp.json()
```

### Market Data - Crypto

```python
async def get_crypto_bars(symbol: str, timeframe: str = "1Day", start: str | None = None, limit: int = 100):
    """GET /v1beta3/crypto/us/bars - Get crypto OHLCV bars. Symbol format: BTC/USD."""
    params = {"symbols": symbol, "timeframe": timeframe, "limit": limit}
    if start:
        params["start"] = start
    async with httpx.AsyncClient(base_url=DATA_BASE, headers=HEADERS) as client:
        resp = await client.get("/v1beta3/crypto/us/bars", params=params)
        resp.raise_for_status()
        return resp.json()

async def get_crypto_latest_quote(symbol: str):
    """GET /v1beta3/crypto/us/latest/quotes - Get latest crypto quote."""
    async with httpx.AsyncClient(base_url=DATA_BASE, headers=HEADERS) as client:
        resp = await client.get("/v1beta3/crypto/us/latest/quotes", params={"symbols": symbol})
        resp.raise_for_status()
        return resp.json()
```

## Error Handling

Alpaca returns standard HTTP status codes. Errors include a JSON body with a `message` field.

| Status | Meaning                                      |
|--------|----------------------------------------------|
| 200    | Success                                      |
| 207    | Multi-status (partial success for batch ops)  |
| 400    | Bad request / validation error               |
| 401    | Unauthorized (invalid API key)               |
| 403    | Forbidden (insufficient permissions)         |
| 404    | Resource not found                           |
| 422    | Unprocessable entity (order rejected)        |
| 429    | Rate limit exceeded                          |
| 500    | Internal server error                        |

```python
import httpx

async def safe_request(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    try:
        resp = await client.request(method, url, **kwargs)
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        error_body = e.response.json() if e.response.headers.get("content-type", "").startswith("application/json") else {}
        msg = error_body.get("message", e.response.text)
        if e.response.status_code == 429:
            raise Exception(f"Rate limited: {msg}")
        elif e.response.status_code == 422:
            raise Exception(f"Order rejected: {msg}")
        elif e.response.status_code == 401:
            raise Exception(f"Unauthorized: check APCA-API-KEY-ID and APCA-API-SECRET-KEY headers")
        else:
            raise Exception(f"Alpaca API error {e.response.status_code}: {msg}")
    except httpx.RequestError as e:
        raise Exception(f"Network error: {e}")
```

## Common Pitfalls

1. **Wrong base URL for paper vs live.** Paper trading uses `paper-api.alpaca.markets`. Market data always uses `data.alpaca.markets` for both paper and live.

2. **Header names are custom.** Use `APCA-API-KEY-ID` and `APCA-API-SECRET-KEY`, not `Authorization: Bearer`. These are non-standard header names unique to Alpaca.

3. **Quantity must be a string.** When submitting orders, `qty` and `limit_price` must be strings, not floats or ints.

4. **Market data timeframe format.** Use values like `"1Min"`, `"5Min"`, `"1Hour"`, `"1Day"`, `"1Week"`, `"1Month"` -- not `"1m"` or `"1d"`.

5. **Crypto symbol format.** Crypto pairs use slash notation: `"BTC/USD"`, `"ETH/USD"` -- not `"BTCUSD"`.

6. **Timestamps are RFC3339.** Market data start/end params require RFC3339 format: `"2024-01-01T00:00:00Z"`.

7. **Rate limits are per API key, not per IP.** Sharing keys across services will share the rate limit.

8. **Paper trading orders are not real.** Paper trades execute against simulated fills. Market data is real, but fills are synthetic.

9. **Market hours matter.** Equity orders outside market hours (9:30 AM - 4:00 PM ET) require `extended_hours: true` for limit orders. Market orders will be queued.

10. **Pagination.** List endpoints use `next_page_token` in the response. Pass it as a query param to get the next page.

## Useful Links

- Official Documentation: https://docs.alpaca.markets/
- Trading API Reference: https://docs.alpaca.markets/reference/
- Market Data API: https://docs.alpaca.markets/docs/about-market-data-api
- Authentication: https://docs.alpaca.markets/docs/authentication
- Paper Trading: https://docs.alpaca.markets/docs/paper-trading
- API Dashboard: https://app.alpaca.markets/
