---
name: rest-api
description: "Nominatim / OpenStreetMap API - Free geocoding, reverse geocoding, and address lookup"
metadata:
  languages: "python"
  versions: "v1"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "nominatim,openstreetmap,geocoding,mapping,accessibility,open-data,api"
---

# Nominatim API - Python Reference (httpx)

## Golden Rule

Nominatim is the **free geocoding service** for OpenStreetMap. The public instance at `https://nominatim.openstreetmap.org` requires: (1) a **descriptive User-Agent** header identifying your application, (2) a maximum of **1 request per second**, and (3) **no autocomplete/typeahead** usage (this will get you banned). There is no API key -- just follow the usage policy. For higher throughput, self-host Nominatim or use a commercial OSM provider.

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
            f"{BASE_URL}/search",
            headers=HEADERS,
            params={"q": "Seattle, WA", "format": "jsonv2", "limit": 1},
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://nominatim.openstreetmap.org
```

```python
import os

BASE_URL = os.environ.get("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
HEADERS = {
    "User-Agent": "MyGeoApp/1.0 (contact@example.com)",
}
```

## Authentication

Nominatim requires **no authentication**. The only mandatory requirement is a descriptive `User-Agent` header:

```
User-Agent: MyAppName/Version (contact@email.com)
```

Generic or library-default User-Agent strings (e.g., `python-httpx/0.27`) will be blocked. Your User-Agent must identify your specific application.

For high-volume usage, include an `email` query parameter as well:

```python
params["email"] = "your@email.com"
```

## Rate Limiting

| Rule | Limit |
|---|---|
| Requests per second | 1 (absolute max for public instance) |
| Autocomplete/typeahead | Strictly forbidden (results in ban) |
| Bulk geocoding | Strongly discouraged (use database dump instead) |
| Caching | Expected -- cache results for repeated queries |

The public server runs on **donated hardware with limited capacity**. Respect these limits or self-host.

```python
import asyncio
import time

_last_request_time = 0.0

async def nominatim_request(
    client: httpx.AsyncClient,
    path: str,
    params: dict = None,
) -> httpx.Response:
    global _last_request_time

    # Enforce 1 request per second
    now = time.monotonic()
    elapsed = now - _last_request_time
    if elapsed < 1.0:
        await asyncio.sleep(1.0 - elapsed)

    _last_request_time = time.monotonic()

    resp = await client.get(
        f"{BASE_URL}{path}",
        headers=HEADERS,
        params=params,
    )
    resp.raise_for_status()
    return resp
```

## Methods

### Search (Forward Geocoding)

Convert a place name or address to coordinates.

**Free-form query parameters:**
- `q` (str) -- Free-form search string (e.g., `"Seattle, WA"`, `"Eiffel Tower"`)

**Structured query parameters (alternative to `q`):**
- `amenity` (str) -- Name of POI
- `street` (str) -- House number and street
- `city` (str) -- City name
- `county` (str) -- County name
- `state` (str) -- State name
- `country` (str) -- Country name
- `postalcode` (str) -- Postal code

**Common parameters:**
- `format` (str) -- Response format: `jsonv2` (recommended), `json`, `geojson`, `geocodejson`, `xml`
- `limit` (int) -- Max results (default 10, max 40)
- `addressdetails` (int) -- Include address breakdown (0 or 1)
- `extratags` (int) -- Include extra tags like Wikipedia links (0 or 1)
- `namedetails` (int) -- Include all name variants (0 or 1)
- `countrycodes` (str) -- Restrict to countries (comma-separated ISO 3166-1 codes)
- `viewbox` (str) -- Focus area: `lon1,lat1,lon2,lat2`
- `bounded` (int) -- Restrict to viewbox (0 or 1)
- `layer` (str) -- Filter by type: `address`, `poi`, `railway`, `natural`, `manmade`
- `featuretype` (str) -- Narrow by: `country`, `state`, `city`, `settlement`
- `accept-language` (str) -- Preferred result language

```python
async def search(
    client: httpx.AsyncClient,
    query: str = None,
    limit: int = 5,
    addressdetails: bool = True,
    countrycodes: str = None,
    **structured_params,
) -> list:
    params = {
        "format": "jsonv2",
        "limit": limit,
        "addressdetails": 1 if addressdetails else 0,
    }
    if query:
        params["q"] = query
    else:
        params.update(structured_params)
    if countrycodes:
        params["countrycodes"] = countrycodes
    resp = await nominatim_request(client, "/search", params)
    return resp.json()

# Usage -- free-form search
results = await search(client, "Central Park, New York")
if results:
    r = results[0]
    print(f"{r['display_name']}")
    print(f"Lat: {r['lat']}, Lon: {r['lon']}")
```

### Structured Search

```python
# Usage -- structured search for a specific address
results = await search(
    client,
    street="1600 Pennsylvania Avenue NW",
    city="Washington",
    state="DC",
    country="United States",
)
```

### Reverse Geocoding

Convert coordinates to an address.

**Parameters:**
- `lat` (float) -- Latitude (required)
- `lon` (float) -- Longitude (required)
- `zoom` (int) -- Detail level 0-18 (3=country, 5=state, 8=county, 10=city, 14=suburb, 18=building)
- `format` (str) -- Response format (default `xml`, use `jsonv2`)
- `addressdetails` (int) -- Include address breakdown (default 1)
- `layer` (str) -- Filter: `address`, `poi`, `railway`, `natural`, `manmade`
- `accept-language` (str) -- Preferred language

```python
async def reverse_geocode(
    client: httpx.AsyncClient,
    lat: float,
    lon: float,
    zoom: int = 18,
    addressdetails: bool = True,
) -> dict:
    params = {
        "lat": lat,
        "lon": lon,
        "zoom": zoom,
        "format": "jsonv2",
        "addressdetails": 1 if addressdetails else 0,
    }
    resp = await nominatim_request(client, "/reverse", params)
    return resp.json()

# Usage
location = await reverse_geocode(client, lat=40.7484, lon=-73.9857)
print(f"Address: {location['display_name']}")
address = location.get("address", {})
print(f"City: {address.get('city')}, State: {address.get('state')}")
```

### Lookup (OSM IDs to Addresses)

Look up address details for one or more OSM objects by their IDs.

**Parameters:**
- `osm_ids` (str) -- Comma-separated list of OSM IDs with type prefix: `N` (node), `W` (way), `R` (relation)

```python
async def lookup(
    client: httpx.AsyncClient,
    osm_ids: list[str],
    addressdetails: bool = True,
) -> list:
    params = {
        "osm_ids": ",".join(osm_ids),  # e.g., ["R146656", "W104393803", "N240109189"]
        "format": "jsonv2",
        "addressdetails": 1 if addressdetails else 0,
    }
    resp = await nominatim_request(client, "/lookup", params)
    return resp.json()

# Usage -- look up multiple places by OSM ID
places = await lookup(client, ["R146656", "N240109189"])
for p in places:
    print(f"{p['display_name']} (OSM {p['osm_type']} {p['osm_id']})")
```

### Status Check

```python
async def check_status(client: httpx.AsyncClient) -> dict:
    resp = await nominatim_request(client, "/status", params={"format": "json"})
    return resp.json()

# Returns: {"status": 0, "message": "OK", "data_updated": "2026-03-17T..."}
```

### Batch Geocoding Helper

Since rate limit is 1/second, batch operations need throttling:

```python
async def batch_geocode(
    client: httpx.AsyncClient,
    addresses: list[str],
) -> list[dict | None]:
    results = []
    for addr in addresses:
        try:
            matches = await search(client, addr, limit=1)
            results.append(matches[0] if matches else None)
        except httpx.HTTPStatusError:
            results.append(None)
    return results

# Usage -- geocode a list of school addresses (respects 1/sec limit)
schools = ["PS 234, New York", "Lincoln Elementary, Seattle", "Central High School, Philadelphia"]
coords = await batch_geocode(client, schools)
for addr, result in zip(schools, coords):
    if result:
        print(f"{addr}: ({result['lat']}, {result['lon']})")
    else:
        print(f"{addr}: not found")
```

## Error Handling

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request -- missing or invalid parameters |
| 403 | Forbidden -- blocked due to usage policy violation |
| 404 | Not Found -- invalid endpoint |
| 429 | Too Many Requests -- rate limit exceeded |
| 503 | Service Unavailable -- server overloaded |

```python
class NominatimError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def safe_nominatim_request(
    client: httpx.AsyncClient,
    path: str,
    params: dict = None,
) -> dict | list:
    try:
        resp = await nominatim_request(client, path, params)
        return resp.json()
    except httpx.HTTPStatusError as e:
        raise NominatimError(e.response.status_code, str(e)) from e
```

## Common Pitfalls

1. **1 request per second is enforced.** Exceeding this on the public server will get your IP blocked. The rate limiter in the examples above handles this, but be careful with concurrent code.

2. **Autocomplete is banned.** Do not send requests on every keystroke. Wait until the user has finished typing and explicitly triggers a search. Violating this results in a permanent ban.

3. **User-Agent is mandatory and must be specific.** Generic User-Agent strings are rejected. Use `AppName/Version (email@example.com)` format.

4. **Default format is XML, not JSON.** Always pass `format=jsonv2` (recommended) or `format=json`. Without this, you get XML which is harder to parse.

5. **Coordinates are returned as strings.** The `lat` and `lon` fields in JSON responses are strings, not floats. Cast them: `float(result["lat"])`.

6. **Structured search cannot be combined with `q`.** Use either `q` for free-form or the structured parameters (`street`, `city`, etc.) -- not both.

7. **`viewbox` uses lon,lat order.** The viewbox parameter is `lon1,lat1,lon2,lat2` (longitude first), which is opposite to the `lat,lon` convention used elsewhere in the API.

8. **Reverse geocoding zoom controls detail level.** Zoom 3 returns country, zoom 10 returns city, zoom 18 returns building. Use an appropriate zoom for your use case.

9. **Cache aggressively.** Nominatim data changes slowly. Cache geocoding results for at least 24 hours. For static addresses, cache indefinitely.

10. **For bulk geocoding, use a local instance.** If you need to geocode more than a few hundred addresses, download the OSM data and run your own Nominatim instance. The public server is not designed for bulk use.
