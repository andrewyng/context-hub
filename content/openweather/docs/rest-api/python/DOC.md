---
name: rest-api
description: "OpenWeatherMap - Weather Data and Forecasts API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "openweather,weather,forecast,climate,geolocation,api"
---

# OpenWeatherMap API - Python Reference (httpx)

## Golden Rule

Authentication uses an `appid` **query parameter** on every request. The free tier allows 60 calls/minute and 1,000 calls/day. New API keys take up to 2 hours to activate after creation -- if you get a 401 immediately after signup, wait and try again. Always geocode city names to lat/lon first using the Geocoding API rather than passing city names directly.

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
            f"{BASE_URL}/weather",
            params={"lat": 35.6762, "lon": 139.6503, "appid": API_KEY, "units": "metric"},
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://api.openweathermap.org/data/2.5
```

For the One Call API 3.0 (all-in-one current + forecast + historical):

```
https://api.openweathermap.org/data/3.0
```

For the Geocoding API:

```
https://api.openweathermap.org/geo/1.0
```

```python
import os

API_KEY = os.environ["OPENWEATHER_API_KEY"]
BASE_URL = "https://api.openweathermap.org/data/2.5"
ONECALL_URL = "https://api.openweathermap.org/data/3.0"
GEO_URL = "https://api.openweathermap.org/geo/1.0"
```

## Authentication

OpenWeatherMap uses **API key as a query parameter** on every request:

```
https://api.openweathermap.org/data/2.5/weather?lat=35.68&lon=139.65&appid=YOUR_API_KEY
```

There are no authorization headers. The key is always the `appid` parameter.

## Rate Limiting

| Plan | Calls/Minute | Calls/Day |
|---|---|---|
| Free | 60 | 1,000 |
| One Call 3.0 | 60 | 2,000 (default, configurable) |
| Paid tiers | Higher limits | Configurable |

When you exceed limits, the API returns HTTP `429 Too Many Requests`.

```python
import asyncio

async def weather_request(client: httpx.AsyncClient, url: str, params: dict, max_retries: int = 3) -> dict:
    for attempt in range(max_retries):
        resp = await client.get(url, params={**params, "appid": API_KEY})
        if resp.status_code == 429:
            wait = min(2 ** attempt, 30)
            await asyncio.sleep(wait)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("Max retries exceeded due to rate limiting")
```

## Methods

### Geocoding (City Name to Coordinates)

Convert city names to lat/lon coordinates. Use this before calling weather endpoints.

**Parameters:**
- `q` (str) -- City name, state code, and country code (e.g., `Tokyo,JP` or `London,GB`)
- `limit` (int) -- Max results (default: 5)

```python
async def geocode(client: httpx.AsyncClient, city: str, limit: int = 5) -> list:
    resp = await client.get(
        f"{GEO_URL}/direct",
        params={"q": city, "limit": limit, "appid": API_KEY},
    )
    resp.raise_for_status()
    return resp.json()
    # Returns: [{"name": "Tokyo", "lat": 35.6762, "lon": 139.6503, "country": "JP", ...}]

# Usage
locations = await geocode(client, "Tokyo,JP")
lat, lon = locations[0]["lat"], locations[0]["lon"]
```

### Reverse Geocoding

Convert coordinates to location names.

```python
async def reverse_geocode(client: httpx.AsyncClient, lat: float, lon: float, limit: int = 5) -> list:
    resp = await client.get(
        f"{GEO_URL}/reverse",
        params={"lat": lat, "lon": lon, "limit": limit, "appid": API_KEY},
    )
    resp.raise_for_status()
    return resp.json()
```

### Current Weather

Get current weather for a location.

**Required parameters:**
- `lat` (float) -- Latitude
- `lon` (float) -- Longitude

**Optional parameters:**
- `units` (str) -- `standard` (Kelvin), `metric` (Celsius), or `imperial` (Fahrenheit). Default: `standard`
- `lang` (str) -- Language code for descriptions (e.g., `en`, `ja`, `zh_cn`)

```python
async def get_current_weather(
    client: httpx.AsyncClient,
    lat: float,
    lon: float,
    units: str = "metric",
    lang: str = "en",
) -> dict:
    resp = await client.get(
        f"{BASE_URL}/weather",
        params={"lat": lat, "lon": lon, "units": units, "lang": lang, "appid": API_KEY},
    )
    resp.raise_for_status()
    return resp.json()

# Usage
weather = await get_current_weather(client, lat=35.6762, lon=139.6503)
temp = weather["main"]["temp"]
desc = weather["weather"][0]["description"]
print(f"Tokyo: {temp}C, {desc}")
```

### 5-Day / 3-Hour Forecast

Get weather forecast in 3-hour intervals for up to 5 days.

```python
async def get_forecast(
    client: httpx.AsyncClient,
    lat: float,
    lon: float,
    units: str = "metric",
    cnt: int = None,
) -> dict:
    params = {"lat": lat, "lon": lon, "units": units, "appid": API_KEY}
    if cnt:
        params["cnt"] = cnt  # Number of 3-hour intervals to return
    resp = await client.get(f"{BASE_URL}/forecast", params=params)
    resp.raise_for_status()
    return resp.json()

# Usage -- next 24 hours (8 x 3-hour intervals)
forecast = await get_forecast(client, lat=35.6762, lon=139.6503, cnt=8)
for entry in forecast["list"]:
    print(f"{entry['dt_txt']}: {entry['main']['temp']}C")
```

### Air Pollution

Get current air quality data.

```python
async def get_air_pollution(client: httpx.AsyncClient, lat: float, lon: float) -> dict:
    resp = await client.get(
        f"{BASE_URL}/air_pollution",
        params={"lat": lat, "lon": lon, "appid": API_KEY},
    )
    resp.raise_for_status()
    return resp.json()
    # Returns AQI (1-5 scale) and component concentrations (CO, NO2, O3, PM2.5, etc.)
```

### One Call API 3.0 (Paid)

All-in-one endpoint for current, minutely (1h), hourly (48h), daily (8d) forecasts, and weather alerts.

```python
async def get_onecall(
    client: httpx.AsyncClient,
    lat: float,
    lon: float,
    units: str = "metric",
    exclude: str = None,
) -> dict:
    params = {"lat": lat, "lon": lon, "units": units, "appid": API_KEY}
    if exclude:
        params["exclude"] = exclude  # e.g., "minutely,hourly"
    resp = await client.get(f"{ONECALL_URL}/onecall", params=params)
    resp.raise_for_status()
    return resp.json()

# Usage -- get daily forecast only
data = await get_onecall(client, lat=35.6762, lon=139.6503, exclude="minutely,hourly,current,alerts")
for day in data["daily"]:
    print(f"{day['dt']}: {day['temp']['day']}C")
```

## Error Handling

Successful responses return HTTP 200 with a JSON body.

On failure:

```json
{
    "cod": 401,
    "message": "Invalid API key. Please see https://openweathermap.org/faq#error401 for more info."
}
```

**Common status codes:**

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request -- missing or invalid parameters (e.g., missing lat/lon) |
| 401 | Unauthorized -- invalid API key, or key not yet activated (wait up to 2 hours) |
| 404 | Not Found -- invalid endpoint or city not found |
| 429 | Too Many Requests -- exceeded calls/minute or calls/day limit |
| 500 | Internal Server Error |

**Robust error handling pattern:**

```python
import asyncio
import httpx
import logging

logger = logging.getLogger(__name__)

class OpenWeatherError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def owm_request(
    client: httpx.AsyncClient,
    url: str,
    params: dict = None,
    max_retries: int = 3,
) -> dict:
    request_params = {**(params or {}), "appid": API_KEY}

    for attempt in range(max_retries):
        try:
            resp = await client.get(url, params=request_params)
        except httpx.RequestError as e:
            logger.warning(f"Network error (attempt {attempt+1}): {e}")
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            return resp.json()

        if resp.status_code == 429:
            wait = min(2 ** attempt, 30)
            logger.warning(f"Rate limited, retrying in {wait}s")
            await asyncio.sleep(wait)
            continue

        data = resp.json() if resp.content else {}
        raise OpenWeatherError(
            resp.status_code,
            data.get("message", "Unknown error"),
        )

    raise OpenWeatherError(429, "Max retries exceeded")
```

## Common Pitfalls

1. **New API keys take up to 2 hours to activate.** You will get 401 errors immediately after creating a key. This is normal -- wait and retry.

2. **Default temperature is Kelvin.** Always pass `units=metric` (Celsius) or `units=imperial` (Fahrenheit) unless you specifically want Kelvin. Forgetting this is the most common mistake.

3. **Use lat/lon, not city names.** The current weather endpoint accepts `lat` and `lon`. The old `q=CityName` parameter is deprecated for most endpoints. Use the Geocoding API to convert city names to coordinates first.

4. **Free tier is 60 calls/minute.** This sounds generous but adds up quickly if you have multiple users or poll frequently. Implement caching with a 10-minute TTL for weather data.

5. **One Call API 3.0 requires separate subscription.** Even with a paid plan for 2.5 endpoints, One Call 3.0 is a separate product requiring its own subscription in your account dashboard.

6. **The `cod` field in error responses is sometimes a string.** The API inconsistently returns `"cod": "404"` (string) or `"cod": 404` (integer). Handle both types when parsing errors.

7. **Weather icon URLs follow a pattern.** Icon codes from the response (e.g., `"10d"`) map to `https://openweathermap.org/img/wn/{icon}@2x.png`. Use `@2x` for retina-quality images.

8. **Forecast timestamps are UTC.** The `dt` field in forecast responses is a Unix timestamp in UTC. Convert to local time using the `timezone` offset provided in the response.

9. **Air pollution AQI scale is 1-5, not 0-500.** OpenWeather uses its own 1-5 scale (1=Good, 5=Very Poor), not the US EPA 0-500 AQI. Do not confuse these scales in your UI.

10. **Geocoding returns multiple results.** Searching for "London" returns London GB, London CA, London US, etc. Always include the country code (e.g., `London,GB`) and verify the result matches your intent.
