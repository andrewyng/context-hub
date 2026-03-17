---
name: rest-api
description: "Zerodha Kite Connect - Indian Stock Trading API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "zerodha,kite,trading,stocks,india,algo-trading,market-data,portfolio,api"
---

# Zerodha Kite Connect REST API

Kite Connect is the trading and investment API platform from Zerodha, India's largest stockbroker. It provides REST-like HTTP APIs for programmatic trading on NSE, BSE, NFO, MCX, and other Indian exchanges.

## Golden Rule

Always use async `httpx` for all HTTP calls. Never use the `kiteconnect` Python SDK or `requests` library. All form-encoded POST/PUT bodies use `data=` (not `json=`). All responses are JSON with a top-level `status` field (`"success"` or `"error"`). The access token expires daily at 6:00 AM IST -- re-authenticate each trading day.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://api.kite.trade
```

All endpoints are relative to this base. Responses are JSON. The API is not CORS-enabled.

## Authentication

Kite Connect uses a three-step OAuth-like login flow:

### Step 1: Redirect User to Kite Login

```
https://kite.zerodha.com/connect/login?v=3&api_key=YOUR_API_KEY
```

After login, the user is redirected to your `redirect_url` with a `request_token` query parameter.

### Step 2: Exchange Request Token for Access Token

```python
import hashlib, httpx

API_KEY = "your_api_key"
API_SECRET = "your_api_secret"
REQUEST_TOKEN = "token_from_redirect"

checksum = hashlib.sha256(f"{API_KEY}{REQUEST_TOKEN}{API_SECRET}".encode()).hexdigest()

async def get_access_token():
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.kite.trade/session/token",
            data={"api_key": API_KEY, "request_token": REQUEST_TOKEN, "checksum": checksum},
        )
        return resp.json()["data"]["access_token"]
```

### Step 3: Use Access Token in All Requests

```python
HEADERS = {"Authorization": f"token {API_KEY}:{ACCESS_TOKEN}", "X-Kite-Version": "3"}
```

The access token is valid until 6:00 AM IST the next day.

## Rate Limiting

| Endpoint Category | Limit |
|---|---|
| Order placement | 10 req/s, 200 orders/min |
| Quote endpoints | 1 req/s |
| Historical candle data | 3 req/s |
| Instruments list | 1 req/min |
| All other endpoints | 10 req/s |
| Daily order cap | 3,000 orders/day per user |

Exceeding limits returns HTTP `429`. A sliding 10-second cooldown window applies.

## Methods

### Place Order

```python
async def place_order(client: httpx.AsyncClient, variety: str, params: dict) -> str:
    """Place an order. Varieties: regular, amo, co, iceberg, auction."""
    resp = await client.post(f"https://api.kite.trade/orders/{variety}", headers=HEADERS, data=params)
    resp.raise_for_status()
    return resp.json()["data"]["order_id"]

# Example: Buy 1 share of INFY at market price
order_id = await place_order(client, "regular", {
    "tradingsymbol": "INFY", "exchange": "NSE", "transaction_type": "BUY",
    "order_type": "MARKET", "quantity": 1, "product": "CNC", "validity": "DAY",
})
```

**Required:** `tradingsymbol`, `exchange`, `transaction_type` (BUY/SELL), `order_type` (MARKET/LIMIT/SL/SL-M), `quantity`, `product` (CNC/NRML/MIS).
**Optional:** `price`, `trigger_price`, `disclosed_quantity`, `validity` (DAY/IOC/TTL), `tag`, `iceberg_legs`, `iceberg_quantity`.

### Modify Order

```python
async def modify_order(client: httpx.AsyncClient, variety: str, order_id: str, params: dict) -> str:
    resp = await client.put(f"https://api.kite.trade/orders/{variety}/{order_id}", headers=HEADERS, data=params)
    resp.raise_for_status()
    return resp.json()["data"]["order_id"]
```

### Cancel Order

```python
async def cancel_order(client: httpx.AsyncClient, variety: str, order_id: str) -> str:
    resp = await client.delete(f"https://api.kite.trade/orders/{variety}/{order_id}", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()["data"]["order_id"]
```

### Get Orders

```python
async def get_orders(client: httpx.AsyncClient) -> list:
    resp = await client.get("https://api.kite.trade/orders", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()["data"]
```

### Get Holdings

```python
async def get_holdings(client: httpx.AsyncClient) -> list:
    resp = await client.get("https://api.kite.trade/portfolio/holdings", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()["data"]
```

### Get Positions

```python
async def get_positions(client: httpx.AsyncClient) -> dict:
    resp = await client.get("https://api.kite.trade/portfolio/positions", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()["data"]  # {"net": [...], "day": [...]}
```

### Get Market Quotes

```python
async def get_quotes(client: httpx.AsyncClient, instruments: list[str]) -> dict:
    """Full quotes for up to 500 instruments. Format: EXCHANGE:SYMBOL (e.g., NSE:INFY)."""
    resp = await client.get(
        "https://api.kite.trade/quote", headers=HEADERS,
        params=[("i", inst) for inst in instruments],
    )
    resp.raise_for_status()
    return resp.json()["data"]
```

Lighter alternatives: `GET /quote/ohlc` (OHLC only, up to 1,000 instruments), `GET /quote/ltp` (last price only, up to 1,000).

### Get Historical Data

```python
async def get_historical_data(
    client: httpx.AsyncClient, instrument_token: int, interval: str,
    from_dt: str, to_dt: str, continuous: bool = False, oi: bool = False,
) -> list:
    """Intervals: minute, 3minute, 5minute, 10minute, 15minute, 30minute, 60minute, day.
    Date format: yyyy-mm-dd HH:MM:SS"""
    resp = await client.get(
        f"https://api.kite.trade/instruments/historical/{instrument_token}/{interval}",
        headers=HEADERS,
        params={"from": from_dt, "to": to_dt, "continuous": int(continuous), "oi": int(oi)},
    )
    resp.raise_for_status()
    return resp.json()["data"]["candles"]
    # Each candle: [timestamp, open, high, low, close, volume] (+ oi if oi=True)
```

Additional endpoints: `GET /user/profile`, `GET /user/margins`, `GET /user/margins/{segment}`,
`GET /orders/{order_id}` (history), `GET /trades`, `GET /orders/{order_id}/trades`,
`PUT /portfolio/positions` (convert), `GET /instruments` (CSV dump), `DELETE /session/token` (logout).

## Error Handling

All error responses follow this structure:

```json
{"status": "error", "message": "Human-readable description", "error_type": "ExceptionClassName"}
```

| Exception | Meaning |
|---|---|
| `TokenException` | Session expired or invalid (HTTP 403) |
| `InputException` | Missing or invalid parameters (HTTP 400) |
| `OrderException` | Order placement/retrieval failure |
| `MarginException` | Insufficient funds |
| `NetworkException` | API cannot reach OMS |

```python
import asyncio

async def safe_request(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    try:
        resp = await client.request(method, url, **kwargs)
        resp.raise_for_status()
        body = resp.json()
        if body.get("status") == "error":
            error_type = body.get("error_type", "GeneralException")
            if error_type == "TokenException":
                raise RuntimeError(f"Session expired: {body.get('message')}")
            raise RuntimeError(f"{error_type}: {body.get('message')}")
        return body["data"]
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 429:
            await asyncio.sleep(10)
            return await safe_request(client, method, url, **kwargs)
        raise
```

## Common Pitfalls

1. **Token format** -- `Authorization: token api_key:access_token` (not `Bearer`). Wrong format returns 403.
2. **Form-encoded bodies** -- POST/PUT use `data=`, not `json=`. JSON bodies cause silent failures or 400 errors.
3. **Daily re-authentication** -- Access tokens expire at 6:00 AM IST daily. No refresh token mechanism.
4. **Request token is single-use** -- The `request_token` can only be exchanged once and expires within minutes.
5. **Instruments CSV, not JSON** -- `/instruments` returns gzipped CSV, not JSON. Parse accordingly.
6. **Rate limit cooldown is sliding** -- After 429, the 10-second window resets if you send more requests. Use exponential backoff.
7. **Instrument identification** -- Quotes use `EXCHANGE:SYMBOL`, historical data uses numeric `instrument_token`. Map via instruments CSV.
8. **Indian market hours** -- NSE/BSE equity: 9:15 AM - 3:30 PM IST. Use AMO variety for after-hours orders.
9. **Quote instrument limits** -- Full quotes: max 500. OHLC/LTP: max 1,000. Exceeding returns an error.
