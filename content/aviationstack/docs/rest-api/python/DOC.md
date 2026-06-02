---
name: rest-api
description: "AviationStack - Real-time Flight Tracking and Aviation Data"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "aviationstack,flights,aviation,tracking,airports,airlines,api"
---

# AviationStack API - Python Reference (httpx)

## Golden Rule

Authentication uses an `access_key` **query parameter** on every request -- not a header. The free tier is HTTP only (no HTTPS) and limited to real-time flights. Historical data, future schedules, and HTTPS require a paid plan. Always check your plan's capabilities before building features that depend on paid endpoints.

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
            f"{BASE_URL}/flights",
            params={"access_key": ACCESS_KEY},
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
http://api.aviationstack.com/v1
```

**HTTPS** (paid plans only):

```
https://api.aviationstack.com/v1
```

```python
import os

ACCESS_KEY = os.environ["AVIATIONSTACK_ACCESS_KEY"]
# Use http for free tier, https for paid plans
BASE_URL = "http://api.aviationstack.com/v1"
```

## Authentication

AviationStack uses **API key as a query parameter** on every request:

```
http://api.aviationstack.com/v1/flights?access_key=YOUR_ACCESS_KEY
```

There are no authorization headers. The key is passed as the `access_key` parameter.

```python
def auth_params(**kwargs) -> dict:
    """Build params dict with access_key included."""
    return {"access_key": ACCESS_KEY, **kwargs}
```

## Rate Limiting

| Plan | Monthly Requests |
|---|---|
| Free | 100 requests/month |
| Basic | 500 requests/month |
| Professional | 5,000 requests/month |
| Business | 50,000 requests/month |
| Enterprise | Custom |

When you exceed your monthly quota, the API returns an error in the JSON response body (not via HTTP status code). Always check the response for an `error` key.

## Methods

### Real-time Flights

Get real-time flight status data. This is the primary endpoint.

**Optional parameters:**
- `flight_iata` (str) -- IATA flight number (e.g., `AA100`)
- `flight_icao` (str) -- ICAO flight number
- `dep_iata` (str) -- Departure airport IATA code (e.g., `JFK`)
- `arr_iata` (str) -- Arrival airport IATA code
- `airline_iata` (str) -- Airline IATA code (e.g., `AA`)
- `airline_icao` (str) -- Airline ICAO code
- `flight_status` (str) -- Filter by status: `scheduled`, `active`, `landed`, `cancelled`, `incident`, `diverted`
- `limit` (int) -- Results per page (default: 100)
- `offset` (int) -- Pagination offset

```python
async def get_flights(
    client: httpx.AsyncClient,
    flight_iata: str = None,
    dep_iata: str = None,
    arr_iata: str = None,
    airline_iata: str = None,
    flight_status: str = None,
    limit: int = 100,
    offset: int = 0,
) -> dict:
    params = auth_params(limit=limit, offset=offset)
    if flight_iata:
        params["flight_iata"] = flight_iata
    if dep_iata:
        params["dep_iata"] = dep_iata
    if arr_iata:
        params["arr_iata"] = arr_iata
    if airline_iata:
        params["airline_iata"] = airline_iata
    if flight_status:
        params["flight_status"] = flight_status
    resp = await client.get(f"{BASE_URL}/flights", params=params)
    resp.raise_for_status()
    return resp.json()

# Usage -- look up a specific flight
data = await get_flights(client, flight_iata="AA100")
for flight in data["data"]:
    print(f"{flight['flight']['iata']}: {flight['flight_status']}")
```

### Historical Flights (Paid)

Get historical flight data for a specific date.

**Additional parameters:**
- `flight_date` (str) -- Date in `YYYY-MM-DD` format

```python
async def get_historical_flights(
    client: httpx.AsyncClient,
    flight_date: str,
    dep_iata: str = None,
    arr_iata: str = None,
) -> dict:
    params = auth_params(flight_date=flight_date)
    if dep_iata:
        params["dep_iata"] = dep_iata
    if arr_iata:
        params["arr_iata"] = arr_iata
    resp = await client.get(f"{BASE_URL}/flights", params=params)
    resp.raise_for_status()
    return resp.json()
```

### Future Flight Schedules (Paid)

Look up scheduled future flights.

```python
async def get_future_flights(
    client: httpx.AsyncClient,
    iata_code: str,
    flight_type: str = "departure",
    date: str = None,
) -> dict:
    params = auth_params(iataCode=iata_code, type=flight_type)
    if date:
        params["date"] = date
    resp = await client.get(f"{BASE_URL}/flightsFuture", params=params)
    resp.raise_for_status()
    return resp.json()
```

### Airports

Look up airport data.

**Optional parameters:**
- `search` (str) -- Search by airport name
- `iata_code` (str) -- Filter by IATA code
- `country_iso2` (str) -- Filter by country ISO2 code

```python
async def get_airports(
    client: httpx.AsyncClient,
    search: str = None,
    iata_code: str = None,
    country_iso2: str = None,
) -> dict:
    params = auth_params()
    if search:
        params["search"] = search
    if iata_code:
        params["iata_code"] = iata_code
    if country_iso2:
        params["country_iso2"] = country_iso2
    resp = await client.get(f"{BASE_URL}/airports", params=params)
    resp.raise_for_status()
    return resp.json()

# Usage -- find airports in Japan
airports = await get_airports(client, country_iso2="JP")
```

### Airlines

Look up airline data.

```python
async def get_airlines(
    client: httpx.AsyncClient,
    search: str = None,
    iata_code: str = None,
) -> dict:
    params = auth_params()
    if search:
        params["search"] = search
    if iata_code:
        params["iata_code"] = iata_code
    resp = await client.get(f"{BASE_URL}/airlines", params=params)
    resp.raise_for_status()
    return resp.json()
```

### Routes

Look up airline route information.

```python
async def get_routes(
    client: httpx.AsyncClient,
    dep_iata: str = None,
    arr_iata: str = None,
    airline_iata: str = None,
) -> dict:
    params = auth_params()
    if dep_iata:
        params["dep_iata"] = dep_iata
    if arr_iata:
        params["arr_iata"] = arr_iata
    if airline_iata:
        params["airline_iata"] = airline_iata
    resp = await client.get(f"{BASE_URL}/routes", params=params)
    resp.raise_for_status()
    return resp.json()
```

### Aircraft Types and Airplanes

Look up aircraft information.

```python
async def get_aircraft_types(client: httpx.AsyncClient) -> dict:
    resp = await client.get(f"{BASE_URL}/aircraft_types", params=auth_params())
    resp.raise_for_status()
    return resp.json()

async def get_airplanes(client: httpx.AsyncClient, airline_iata: str = None) -> dict:
    params = auth_params()
    if airline_iata:
        params["airline_iata"] = airline_iata
    resp = await client.get(f"{BASE_URL}/airplanes", params=params)
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

Successful responses return HTTP 200 with a JSON body containing `pagination` and `data` fields:

```json
{
    "pagination": {"limit": 100, "offset": 0, "count": 100, "total": 15432},
    "data": [...]
}
```

On failure, the response includes an `error` object:

```json
{
    "error": {
        "code": "usage_limit_reached",
        "message": "Your monthly API request volume has been reached. Please upgrade your plan."
    }
}
```

**Common error codes:**

| Error Code | Meaning |
|---|---|
| `missing_access_key` | No `access_key` parameter provided |
| `invalid_access_key` | The access key is not valid |
| `inactive_user` | Account is inactive |
| `usage_limit_reached` | Monthly request quota exceeded |
| `function_access_restricted` | Endpoint not available on your plan (e.g., historical on free tier) |
| `https_access_restricted` | HTTPS not available on free plan |
| `404_not_found` | Invalid endpoint path |

**Robust error handling pattern:**

```python
import asyncio
import httpx
import logging

logger = logging.getLogger(__name__)

class AviationStackError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(f"[{code}] {message}")

async def aviation_request(
    client: httpx.AsyncClient,
    endpoint: str,
    params: dict = None,
    max_retries: int = 3,
) -> dict:
    url = f"{BASE_URL}/{endpoint}"
    request_params = auth_params(**(params or {}))

    for attempt in range(max_retries):
        try:
            resp = await client.get(url, params=request_params)
        except httpx.RequestError as e:
            logger.warning(f"Network error on {endpoint} (attempt {attempt+1}): {e}")
            await asyncio.sleep(2 ** attempt)
            continue

        data = resp.json()

        # AviationStack returns errors in the JSON body, not always via HTTP status
        if "error" in data:
            error = data["error"]
            code = error.get("code", "unknown")
            message = error.get("message", "Unknown error")
            if code == "usage_limit_reached":
                raise AviationStackError(code, message)  # No point retrying
            raise AviationStackError(code, message)

        return data

    raise AviationStackError("network_error", f"Max retries exceeded for {endpoint}")
```

## Common Pitfalls

1. **Free tier is HTTP only.** The free plan does not support HTTPS. If you use `https://` in the base URL on a free plan, you get a `https_access_restricted` error. Use `http://` or upgrade.

2. **Free tier is limited to 100 requests/month.** That is roughly 3 per day. Cache results aggressively. Consider storing flight data in a local database.

3. **Historical and future schedules require paid plans.** The free tier only supports real-time flight data. Passing `flight_date` on a free plan returns `function_access_restricted`.

4. **Errors are in the JSON body, not HTTP status codes.** The API often returns HTTP 200 even for errors. Always check for an `error` key in the response JSON before processing `data`.

5. **Pagination is essential for large result sets.** The default limit is 100. Use `offset` to page through results. The `pagination.total` field tells you the total count.

6. **API key is in the URL.** Since `access_key` is a query parameter, it appears in server logs, browser history, and network traces. Never expose this in client-side code.

7. **Flight IATA codes are not unique per day.** The same flight number can appear multiple times (codeshares, connecting flights). Filter by departure/arrival airport to narrow results.

8. **Timezone handling.** Departure and arrival times include timezone information. Parse them carefully -- do not assume all times are UTC.

9. **Rate limits are monthly, not per-second.** There is no burst rate limit, but hitting your monthly cap locks you out until the next billing cycle.

10. **The `search` parameter on lookup endpoints is a text search.** Searching for "New" on the airports endpoint returns New York, New Delhi, Newark, etc. Use specific IATA codes when you know the exact airport.
