---
name: rest-api
description: "CurrencyAPI - Foreign Exchange Rates and Currency Conversion"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "currency,exchange-rates,forex,conversion,global,api"
---

# CurrencyAPI - Python Reference (httpx)

## Golden Rule

The API key goes in the `apikey` header (or as a query parameter). The free tier updates rates **daily** and has a monthly request quota. Cache responses aggressively -- exchange rates do not change every second on the free plan. Never call the API in a tight loop or on every page load.

## Installation

```bash
pip install httpx
```

All examples use `httpx` with async/await. For scripts that need a synchronous entrypoint:

```python
import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/latest",
            headers=HEADERS,
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://api.currencyapi.com/v3
```

```python
import os

API_KEY = os.environ["CURRENCYAPI_KEY"]
BASE_URL = "https://api.currencyapi.com/v3"
HEADERS = {"apikey": API_KEY}
```

## Authentication

CurrencyAPI supports two authentication methods:

1. **Header** (recommended): `apikey: YOUR-API-KEY`
2. **Query parameter**: `?apikey=YOUR-API-KEY`

```python
# Header-based (recommended)
resp = await client.get(f"{BASE_URL}/latest", headers={"apikey": API_KEY})

# Query parameter alternative
resp = await client.get(f"{BASE_URL}/latest", params={"apikey": API_KEY})
```

## Rate Limiting

| Plan | Monthly Requests | Update Frequency |
|---|---|---|
| Free | 300 requests/month | Daily |
| Paid tiers | Higher quotas | Hourly to minute-level |

When you exceed your rate limit or monthly quota, the API returns HTTP `429`. The `/status` endpoint does **not** count toward your quota.

```python
async def check_status(client: httpx.AsyncClient) -> dict:
    """Check account quota and rate limit status (free, does not count toward quota)."""
    resp = await client.get(f"{BASE_URL}/status", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()
```

## Methods

### Latest Exchange Rates

Get the most recent exchange rates for all or selected currencies.

**Optional parameters:**
- `base_currency` (str) -- Reference currency code. Default: `USD`
- `currencies` (str) -- Comma-separated currency codes to return (e.g., `EUR,GBP,JPY`)
- `type` (str) -- Filter by type: `fiat`, `metal`, or `crypto`

```python
async def get_latest(
    client: httpx.AsyncClient,
    base_currency: str = "USD",
    currencies: str = None,
) -> dict:
    params = {"base_currency": base_currency}
    if currencies:
        params["currencies"] = currencies
    resp = await client.get(f"{BASE_URL}/latest", headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()
    # Returns: {"meta": {"last_updated_at": "2026-03-17..."}, "data": {"EUR": {"code": "EUR", "value": 0.923}}}

# Usage
rates = await get_latest(client, base_currency="USD", currencies="EUR,GBP,JPY")
eur_rate = rates["data"]["EUR"]["value"]
```

### Historical Exchange Rates

Get exchange rates for a specific date.

**Required parameters:**
- `date` (str) -- Date in `YYYY-MM-DD` format

**Optional parameters:**
- `base_currency` (str) -- Reference currency. Default: `USD`
- `currencies` (str) -- Comma-separated currency codes

```python
async def get_historical(
    client: httpx.AsyncClient,
    date: str,
    base_currency: str = "USD",
    currencies: str = None,
) -> dict:
    params = {"date": date, "base_currency": base_currency}
    if currencies:
        params["currencies"] = currencies
    resp = await client.get(f"{BASE_URL}/historical", headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()

# Usage
rates = await get_historical(client, date="2026-01-15", currencies="EUR,GBP")
```

### Range Historical Exchange Rates

Get exchange rates for a date range.

**Required parameters:**
- `datetime_start` (str) -- Start datetime in ISO8601 format (e.g., `2026-01-01T00:00:00Z`)
- `datetime_end` (str) -- End datetime in ISO8601 format

```python
async def get_range(
    client: httpx.AsyncClient,
    datetime_start: str,
    datetime_end: str,
    base_currency: str = "USD",
    currencies: str = None,
    accuracy: str = "day",
) -> dict:
    params = {
        "datetime_start": datetime_start,
        "datetime_end": datetime_end,
        "base_currency": base_currency,
        "accuracy": accuracy,
    }
    if currencies:
        params["currencies"] = currencies
    resp = await client.get(f"{BASE_URL}/range", headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()

# Usage -- daily rates for January 2026
data = await get_range(
    client,
    datetime_start="2026-01-01T00:00:00Z",
    datetime_end="2026-01-31T23:59:59Z",
    currencies="EUR",
    accuracy="day",
)
```

### Convert Currency

Convert an amount between currencies.

**Required parameters:**
- `value` (float) -- Amount to convert
- `base_currency` (str) -- Source currency code
- `currencies` (str) -- Target currency code(s)

```python
async def convert(
    client: httpx.AsyncClient,
    value: float,
    base_currency: str,
    currencies: str,
) -> dict:
    params = {
        "value": str(value),
        "base_currency": base_currency,
        "currencies": currencies,
    }
    resp = await client.get(f"{BASE_URL}/convert", headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()

# Usage -- convert 100 USD to EUR
result = await convert(client, value=100.0, base_currency="USD", currencies="EUR")
converted = result["data"]["EUR"]["value"]
```

### List Currencies

Get metadata for all supported currencies.

**Optional parameters:**
- `currencies` (str) -- Filter to specific currency codes
- `type` (str) -- Filter by type: `fiat`, `metal`, or `crypto`

```python
async def list_currencies(client: httpx.AsyncClient, currency_type: str = None) -> dict:
    params = {}
    if currency_type:
        params["type"] = currency_type
    resp = await client.get(f"{BASE_URL}/currencies", headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

Successful responses return HTTP 200 with a JSON body containing `meta` and `data` objects.

On failure, the API returns an error response:

```json
{
    "message": "Validation error",
    "errors": {
        "currencies": ["The selected currencies is invalid."]
    }
}
```

**Status codes:**

| Code | Meaning |
|---|---|
| 200 | Success |
| 403 | Forbidden -- plan does not include this endpoint, upgrade required |
| 404 | Not Found -- endpoint does not exist |
| 422 | Validation Error -- invalid parameters (bad currency code, invalid date format, etc.) |
| 429 | Too Many Requests -- rate limit or monthly quota exceeded |
| 500 | Internal Server Error |

**Common 422 validation errors:**
- Invalid currency code in `currencies` or `base_currency`
- Invalid date format (must be `YYYY-MM-DD`)
- `datetime_start` must be before or equal to `datetime_end`
- Invalid `accuracy` value (must be `day`, `hour`, `quarter_hour`, or `minute`)

**Robust error handling pattern:**

```python
import asyncio
import httpx
import logging

logger = logging.getLogger(__name__)

class CurrencyAPIError(Exception):
    def __init__(self, status_code: int, message: str, errors: dict = None):
        self.status_code = status_code
        self.message = message
        self.errors = errors or {}
        super().__init__(f"[{status_code}] {message}")

async def currency_request(
    client: httpx.AsyncClient,
    endpoint: str,
    params: dict = None,
    max_retries: int = 3,
) -> dict:
    url = f"{BASE_URL}/{endpoint}"
    for attempt in range(max_retries):
        try:
            resp = await client.get(url, headers=HEADERS, params=params or {})
        except httpx.RequestError as e:
            logger.warning(f"Network error on {endpoint} (attempt {attempt+1}): {e}")
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            return resp.json()

        if resp.status_code == 429:
            wait = min(2 ** attempt, 60)
            logger.warning(f"Rate limited on {endpoint}, retrying in {wait}s")
            await asyncio.sleep(wait)
            continue

        data = resp.json() if resp.content else {}
        raise CurrencyAPIError(
            resp.status_code,
            data.get("message", "Unknown error"),
            data.get("errors", {}),
        )

    raise CurrencyAPIError(429, f"Max retries exceeded for {endpoint}")
```

## Common Pitfalls

1. **Free tier is 300 requests/month.** That is roughly 10 per day. Cache results locally and avoid calling the API on every user request. Store rates in a database or in-memory cache with a TTL matching your plan's update frequency.

2. **Free tier updates daily, not real-time.** If you need minute-level or hourly rates, you must upgrade. Do not assume the free tier provides live forex data.

3. **Base currency defaults to USD.** If you omit `base_currency`, all rates are relative to USD. Always specify it explicitly to avoid confusion.

4. **Date format is strict.** Historical dates must be `YYYY-MM-DD`. Range datetimes must be full ISO8601 with timezone (e.g., `2026-01-01T00:00:00Z`). Other formats return 422.

5. **The `accuracy` parameter affects data granularity and plan access.** `minute` and `quarter_hour` accuracy require higher-tier plans. Using them on a free plan returns 403.

6. **Empty `currencies` returns all currencies.** This is convenient but returns a large payload. Filter to only the currencies you need to reduce response size and processing time.

7. **Metal and crypto codes differ from ISO 4217.** Gold is `XAU`, Silver is `XAG`, Bitcoin is `BTC`. Use the `/currencies` endpoint with `type=metal` or `type=crypto` to discover valid codes.

8. **The status endpoint is free.** Use `/status` to check your remaining quota before making data requests. It does not count toward your monthly limit.
