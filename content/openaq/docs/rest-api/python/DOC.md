---
name: rest-api
description: "OpenAQ - Open air quality data API providing worldwide pollution measurements, locations, sensors, and environmental monitoring data."
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "openaq,air-quality,environment,health,pollution,community,api"
---

# OpenAQ REST API v3 - Python Reference (httpx)

## Golden Rule

Authentication uses an `X-API-Key` **request header** on every request. Register at https://explore.openaq.org/register to obtain a free API key. The free tier allows **60 requests/minute** and **2,000 requests/hour**. Rate limit headers (`x-ratelimit-remaining`, `x-ratelimit-reset`) are returned on every response. Data is organized hierarchically: Providers -> Locations -> Sensors -> Measurements. Always start by finding locations, then drill into their sensors for measurement data.

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
            f"{BASE_URL}/locations",
            params={"iso": "US", "limit": 10},
            headers=HEADERS,
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://api.openaq.org/v3
```

```python
import os

API_KEY = os.environ["OPENAQ_API_KEY"]
BASE_URL = "https://api.openaq.org/v3"
HEADERS = {
    "X-API-Key": API_KEY,
    "Accept": "application/json",
}
```

## Authentication

OpenAQ uses an **API key in the request header**:

```
X-API-Key: YOUR_OPENAQ_API_KEY
```

Register at https://explore.openaq.org/register. Manage and rotate your key at https://explore.openaq.org/account.

## Rate Limiting

| Plan | Requests/Minute | Requests/Hour |
|---|---|---|
| Free | 60 | 2,000 |
| Custom | Higher | Contact platform@openaq.org |

**Response headers:**
- `x-ratelimit-used` -- Requests made in current period
- `x-ratelimit-remaining` -- Requests remaining before limit
- `x-ratelimit-limit` -- Maximum requests per period
- `x-ratelimit-reset` -- Unix timestamp when period resets

When exceeded, the API returns HTTP `429 Too Many Requests`. Repeatedly exceeding limits may result in suspension.

```python
import asyncio

async def oaq_request(
    client: httpx.AsyncClient,
    path: str,
    params: dict = None,
    max_retries: int = 3,
) -> dict:
    url = f"{BASE_URL}{path}"

    for attempt in range(max_retries):
        try:
            resp = await client.get(url, params=params, headers=HEADERS)
        except httpx.RequestError:
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            return resp.json()

        if resp.status_code == 429:
            reset = resp.headers.get("x-ratelimit-reset")
            if reset:
                import time
                wait = max(int(reset) - int(time.time()), 1)
            else:
                wait = min(2 ** attempt, 60)
            await asyncio.sleep(wait)
            continue

        resp.raise_for_status()

    raise Exception("Max retries exceeded")
```

## Methods

### List Locations

Retrieve air quality monitoring locations with extensive filtering.

**Parameters:**
- `iso` (str) -- ISO 3166-1 alpha-2 country code (e.g., `US`, `GB`, `IN`)
- `countries_id` (int) -- Country ID
- `coordinates` (str) -- Center point as `lat,lon`
- `radius` (int) -- Radius in meters from coordinates
- `bbox` (str) -- Bounding box as `min_lon,min_lat,max_lon,max_lat`
- `parameters_id` (int) -- Filter by measured parameter
- `providers_id` (int) -- Filter by data provider
- `monitor` (bool) -- Filter to reference-grade monitors
- `mobile` (bool) -- Filter to mobile/stationary
- `limit` (int) -- Results per page (default: 100)
- `page` (int) -- Page number
- `order_by` (str) -- Sort field
- `sort_order` (str) -- `asc` or `desc`

```python
async def list_locations(
    client: httpx.AsyncClient,
    iso: str = None,
    coordinates: str = None,
    radius: int = None,
    parameters_id: int = None,
    monitor: bool = None,
    limit: int = 100,
    page: int = 1,
) -> dict:
    params = {"limit": limit, "page": page}
    if iso:
        params["iso"] = iso
    if coordinates:
        params["coordinates"] = coordinates
    if radius:
        params["radius"] = radius
    if parameters_id:
        params["parameters_id"] = parameters_id
    if monitor is not None:
        params["monitor"] = str(monitor).lower()
    return await oaq_request(client, "/locations", params)

# Usage -- find PM2.5 monitors in London
locations = await list_locations(
    client,
    coordinates="51.5074,-0.1278",
    radius=25000,
    parameters_id=2,  # PM2.5
)
for loc in locations["results"]:
    print(f"{loc['id']}: {loc['name']} - {loc['locality']}")
```

### Get Location

Retrieve details for a specific monitoring location.

```python
async def get_location(client: httpx.AsyncClient, location_id: int) -> dict:
    return await oaq_request(client, f"/locations/{location_id}")

# Usage
location = await get_location(client, 2178)
print(f"{location['results'][0]['name']}")
print(f"Provider: {location['results'][0]['provider']['name']}")
```

### Get Location Sensors

Retrieve sensors installed at a specific location.

```python
async def get_location_sensors(client: httpx.AsyncClient, location_id: int) -> dict:
    return await oaq_request(client, f"/locations/{location_id}/sensors")

# Usage
sensors = await get_location_sensors(client, 2178)
for sensor in sensors["results"]:
    print(f"Sensor {sensor['id']}: {sensor['parameter']['name']} ({sensor['parameter']['units']})")
```

### Get Latest Measurements for Location

Retrieve the most recent measurements at a location.

```python
async def get_location_latest(client: httpx.AsyncClient, location_id: int) -> dict:
    return await oaq_request(client, f"/locations/{location_id}/latest")

# Usage
latest = await get_location_latest(client, 2178)
for m in latest["results"]:
    print(f"{m['parameter']['name']}: {m['value']} {m['parameter']['units']}")
```

### Get Sensor Measurements

Retrieve raw measurements for a specific sensor with date filtering.

**Parameters:**
- `date_from` (str) -- ISO 8601 start date
- `date_to` (str) -- ISO 8601 end date
- `limit` (int) -- Results per page
- `page` (int) -- Page number

```python
async def get_sensor_measurements(
    client: httpx.AsyncClient,
    sensor_id: int,
    date_from: str = None,
    date_to: str = None,
    limit: int = 100,
    page: int = 1,
) -> dict:
    params = {"limit": limit, "page": page}
    if date_from:
        params["date_from"] = date_from
    if date_to:
        params["date_to"] = date_to
    return await oaq_request(client, f"/sensors/{sensor_id}/measurements", params)

# Usage -- get last week's PM2.5 data
measurements = await get_sensor_measurements(
    client,
    sensor_id=12345,
    date_from="2026-03-10",
    date_to="2026-03-17",
)
for m in measurements["results"]:
    print(f"{m['period']['datetimeFrom']['utc']}: {m['value']}")
```

### Get Hourly Aggregated Measurements

Retrieve hourly averaged measurement data for a sensor.

```python
async def get_sensor_hourly(
    client: httpx.AsyncClient,
    sensor_id: int,
    date_from: str = None,
    date_to: str = None,
    limit: int = 100,
    page: int = 1,
) -> dict:
    params = {"limit": limit, "page": page}
    if date_from:
        params["date_from"] = date_from
    if date_to:
        params["date_to"] = date_to
    return await oaq_request(client, f"/sensors/{sensor_id}/measurements/hourly", params)
```

### Get Daily Aggregated Measurements

Retrieve daily averaged measurement data for a sensor.

```python
async def get_sensor_daily(
    client: httpx.AsyncClient,
    sensor_id: int,
    date_from: str = None,
    date_to: str = None,
    limit: int = 100,
    page: int = 1,
) -> dict:
    params = {"limit": limit, "page": page}
    if date_from:
        params["date_from"] = date_from
    if date_to:
        params["date_to"] = date_to
    return await oaq_request(client, f"/sensors/{sensor_id}/measurements/daily", params)
```

### Get Temporal Patterns

Retrieve measurement patterns by hour-of-day, day-of-week, or month-of-year.

```python
async def get_sensor_pattern(
    client: httpx.AsyncClient,
    sensor_id: int,
    aggregation: str = "hours",
    pattern: str = "hourofday",
) -> dict:
    """
    aggregation: 'hours' or 'days'
    pattern: 'hourofday', 'dayofweek', 'monthofyear', 'monthly', 'yearly'
    """
    return await oaq_request(client, f"/sensors/{sensor_id}/{aggregation}/{pattern}")

# Usage -- get hourly pollution patterns
hourly_pattern = await get_sensor_pattern(client, 12345, "hours", "hourofday")
for entry in hourly_pattern["results"]:
    print(f"Hour {entry['label']}: {entry['value']} avg")
```

### List Parameters

Retrieve available measurement parameters (PM2.5, PM10, O3, NO2, CO, SO2, etc.).

```python
async def list_parameters(
    client: httpx.AsyncClient,
    parameter_type: str = None,
    iso: str = None,
    limit: int = 100,
) -> dict:
    params = {"limit": limit}
    if parameter_type:
        params["parameter_type"] = parameter_type
    if iso:
        params["iso"] = iso
    return await oaq_request(client, "/parameters", params)

# Usage
parameters = await list_parameters(client)
for p in parameters["results"]:
    print(f"{p['id']}: {p['name']} ({p['units']})")
```

### List Countries

Retrieve countries with air quality data available.

```python
async def list_countries(client: httpx.AsyncClient, limit: int = 200) -> dict:
    return await oaq_request(client, "/countries", {"limit": limit})

# Usage
countries = await list_countries(client)
for c in countries["results"]:
    print(f"{c['code']}: {c['name']} ({c['locationsCount']} locations)")
```

### List Providers

Retrieve data providers contributing air quality data.

```python
async def list_providers(
    client: httpx.AsyncClient,
    iso: str = None,
    limit: int = 100,
) -> dict:
    params = {"limit": limit}
    if iso:
        params["iso"] = iso
    return await oaq_request(client, "/providers", params)
```

### List Manufacturers

Retrieve instrument manufacturers.

```python
async def list_manufacturers(client: httpx.AsyncClient, limit: int = 100) -> dict:
    return await oaq_request(client, "/manufacturers", {"limit": limit})
```

### List Instruments

Retrieve monitoring instruments.

```python
async def list_instruments(client: httpx.AsyncClient, limit: int = 100) -> dict:
    return await oaq_request(client, "/instruments", {"limit": limit})
```

### Get Manufacturer Instruments

Retrieve instruments from a specific manufacturer.

```python
async def get_manufacturer_instruments(
    client: httpx.AsyncClient,
    manufacturer_id: int,
) -> dict:
    return await oaq_request(client, f"/manufacturers/{manufacturer_id}/instruments")
```

## Error Handling

Successful responses return HTTP 200 with a JSON body containing `meta` and `results` fields.

**Common status codes:**

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request -- invalid parameters |
| 401 | Unauthorized -- missing or invalid API key |
| 404 | Not Found -- resource does not exist |
| 422 | Validation Error -- parameter format issues |
| 429 | Too Many Requests -- rate limit exceeded |
| 500 | Internal Server Error |

```python
import logging
import time

logger = logging.getLogger(__name__)

class OpenAQError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def oaq_request_safe(
    client: httpx.AsyncClient,
    path: str,
    params: dict = None,
    max_retries: int = 3,
) -> dict:
    url = f"{BASE_URL}{path}"

    for attempt in range(max_retries):
        try:
            resp = await client.get(url, params=params, headers=HEADERS)
        except httpx.RequestError as e:
            logger.warning(f"Network error (attempt {attempt+1}): {e}")
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            remaining = resp.headers.get("x-ratelimit-remaining")
            if remaining and int(remaining) < 5:
                logger.warning(f"Rate limit nearly exhausted: {remaining} remaining")
            return resp.json()

        if resp.status_code == 429:
            reset = resp.headers.get("x-ratelimit-reset")
            if reset:
                wait = max(int(reset) - int(time.time()), 1)
            else:
                wait = min(2 ** attempt, 60)
            logger.warning(f"Rate limited, waiting {wait}s")
            await asyncio.sleep(wait)
            continue

        raise OpenAQError(resp.status_code, resp.text)

    raise OpenAQError(429, "Max retries exceeded")
```

## Common Pitfalls

1. **API key goes in the header, not query parameters.** Use `X-API-Key` header. Unlike many APIs, the key is not a query parameter.

2. **Free tier is 60 req/min and 2,000 req/hour.** This is strict. Use the `x-ratelimit-remaining` header to throttle proactively rather than waiting for 429 errors.

3. **Data is hierarchical: Location -> Sensor -> Measurement.** You cannot query measurements directly by location. First get the location's sensors, then query measurements per sensor.

4. **Parameter IDs are not obvious.** Common IDs: PM2.5 = 2, PM10 = 1, O3 = 3, NO2 = 5, CO = 7, SO2 = 9. Use the `/parameters` endpoint to get the full list.

5. **Coordinates format is `lat,lon` as a single string.** Not separate parameters. Example: `coordinates=51.5074,-0.1278`.

6. **Bounding box format is `min_lon,min_lat,max_lon,max_lat`.** Note the order: longitude first, then latitude. This follows GeoJSON convention.

7. **Date parameters accept ISO 8601.** Use `2026-03-17` or `2026-03-17T00:00:00Z`. Missing timezone defaults to UTC.

8. **Results are wrapped in a standard envelope.** All responses have `meta` (pagination info) and `results` (data array) fields. Access data via `response["results"]`.

9. **Source attribution is required.** The Terms of Use require attributing data sources. Use the provider information from locations to credit data providers.

10. **Not all locations have all parameters.** A PM2.5 sensor at one location does not mean all locations have PM2.5. Filter locations by `parameters_id` to find relevant stations.

11. **Repeated rate limit violations can result in suspension.** Implement exponential backoff and respect the `x-ratelimit-reset` header to avoid account suspension.

12. **Measurement aggregations are pre-computed.** Hourly, daily, and pattern endpoints return pre-aggregated data that is faster and more efficient than fetching raw measurements and computing yourself.
