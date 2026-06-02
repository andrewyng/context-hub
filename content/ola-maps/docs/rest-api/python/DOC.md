---
name: rest-api
description: "Ola Maps - India-Optimized Mapping, Geocoding & Routing API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "ola-maps,maps,geocoding,routing,directions,places,india,distance-matrix,autocomplete,api,integration"
---

# Ola Maps API

> **Golden Rule:** Ola Maps has no official Python SDK (unofficial `py_olamaps` exists). Use `httpx` for direct REST access. Auth supports either `api_key` query parameter or OAuth 2.0 Bearer token. All coordinates use `lat,lng` format. Multiple points use pipe (`|`) separator. Free tier: 500K calls/month for the first year.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://api.olamaps.io
```

## Authentication

**Type:** API Key (query param) or OAuth 2.0 Bearer Token

```python
import httpx

API_KEY = "your-ola-maps-api-key"
BASE_URL = "https://api.olamaps.io"

# Option 1: API Key (simplest)
client = httpx.AsyncClient(params={"api_key": API_KEY}, timeout=30.0)

# Option 2: OAuth 2.0 Bearer Token
token_response = await httpx.AsyncClient().post(
    "https://account.olamaps.io/realms/olamaps/protocol/openid-connect/token",
    data={
        "grant_type": "client_credentials",
        "scope": "openid",
        "client_id": "your-client-id",
        "client_secret": "your-client-secret"
    }
)
token_response.raise_for_status()
access_token = token_response.json()["access_token"]
client = httpx.AsyncClient(
    headers={"Authorization": f"Bearer {access_token}"},
    timeout=30.0
)
```

**Important:** Sign up at https://cloud.olakrutrim.com to get credentials. Domains must be whitelisted for OAuth.

## Rate Limiting

Per-minute and monthly limits (tier-specific, not publicly documented). HTTP 429 returned when exceeded.

## Methods

### `geocode`

**Endpoint:** `GET /places/v1/geocode`

Convert an address to geographic coordinates.

| Parameter | Type | Default |
|---|---|---|
| `address` | `str` | **required** |
| `bounds` | `str` | `None` (pipe-separated lat,lng pairs) |
| `language` | `str` | `None` |

**Returns:** JSON with geocoded results including coordinates

```python
params = {"address": "Connaught Place, New Delhi"}
response = await client.get(f"{BASE_URL}/places/v1/geocode", params=params)
response.raise_for_status()
results = response.json()
```

### `reverse_geocode`

**Endpoint:** `GET /places/v1/reverse-geocode`

Convert coordinates to a human-readable address.

| Parameter | Type | Default |
|---|---|---|
| `latlng` | `str` | **required** (`lat,lng` format) |

```python
params = {"latlng": "28.6315,77.2167"}
response = await client.get(f"{BASE_URL}/places/v1/reverse-geocode", params=params)
response.raise_for_status()
address = response.json()
```

### `autocomplete`

**Endpoint:** `GET /places/v1/autocomplete`

Get real-time location search suggestions.

| Parameter | Type | Default |
|---|---|---|
| `input` | `str` | **required** (search text) |
| `location` | `str` | `None` (bias near `lat,lng`) |
| `radius` | `int` | `None` (meters) |
| `strictbounds` | `bool` | `None` |

```python
params = {"input": "Indiranagar Bangalore", "location": "12.9716,77.5946"}
response = await client.get(f"{BASE_URL}/places/v1/autocomplete", params=params)
response.raise_for_status()
suggestions = response.json()
```

### `place_details`

**Endpoint:** `GET /places/v1/details`

Get detailed information about a place by its ID.

```python
params = {"place_id": "ola-place-id-here"}
response = await client.get(f"{BASE_URL}/places/v1/details", params=params)
response.raise_for_status()
place = response.json()
```

### `nearby_search`

**Endpoint:** `GET /places/v1/nearbysearch`

Search for places near a location.

| Parameter | Type | Default |
|---|---|---|
| `layers` | `str` | **required** |
| `location` | `str` | **required** (`lat,lng`) |
| `types` | `str` | `None` |
| `radius` | `int` | `None` (meters) |
| `limit` | `int` | `None` (5-50) |

```python
params = {
    "layers": "venue",
    "location": "12.9716,77.5946",
    "types": "restaurant",
    "radius": 1000,
    "limit": 10
}
response = await client.get(f"{BASE_URL}/places/v1/nearbysearch", params=params)
response.raise_for_status()
places = response.json()
```

### `text_search`

**Endpoint:** `GET /places/v1/textsearch`

Search for places using a text query.

```python
params = {"input": "coffee shops in Koramangala", "location": "12.9352,77.6245"}
response = await client.get(f"{BASE_URL}/places/v1/textsearch", params=params)
response.raise_for_status()
results = response.json()
```

### `directions`

**Endpoint:** `POST /routing/v1/directions`

Get optimized routes with turn-by-turn directions.

| Parameter | Type | Default |
|---|---|---|
| `origin` | `str` | **required** (`lat,lng`) |
| `destination` | `str` | **required** (`lat,lng`) |
| `waypoints` | `str` | `None` (pipe-separated `lat,lng` pairs) |
| `mode` | `str` | `driving` (`driving` or `walking`) |
| `alternatives` | `bool` | `None` |
| `steps` | `bool` | `None` |
| `language` | `str` | `en` (`en`, `hi`, `kn`) |
| `traffic_metadata` | `bool` | `None` |

```python
params = {
    "origin": "12.9352,77.6245",
    "destination": "12.9716,77.5946",
    "alternatives": "true",
    "steps": "true",
    "traffic_metadata": "true"
}
response = await client.post(f"{BASE_URL}/routing/v1/directions", params=params)
response.raise_for_status()
route = response.json()
```

### `distance_matrix`

**Endpoint:** `GET /routing/v1/distanceMatrix`

Calculate travel distance and time between multiple origins and destinations.

| Parameter | Type | Default |
|---|---|---|
| `origins` | `str` | **required** (pipe-separated `lat,lng` pairs) |
| `destinations` | `str` | **required** (pipe-separated `lat,lng` pairs) |

```python
params = {
    "origins": "12.9352,77.6245|12.9716,77.5946",
    "destinations": "13.0827,80.2707|12.2958,76.6394"
}
response = await client.get(f"{BASE_URL}/routing/v1/distanceMatrix", params=params)
response.raise_for_status()
matrix = response.json()
```

### `snap_to_road`

**Endpoint:** `GET /routing/v1/snapToRoad`

Snap GPS coordinates to nearest road segments.

```python
params = {
    "points": "12.9352,77.6245|12.9360,77.6250|12.9370,77.6260",
    "enhancePath": "true"
}
response = await client.get(f"{BASE_URL}/routing/v1/snapToRoad", params=params)
response.raise_for_status()
snapped = response.json()
```

## Error Handling

```python
import httpx

try:
    response = await client.get(f"{BASE_URL}/places/v1/geocode", params=params)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Auth failed -- check API key or refresh OAuth token")
    elif e.response.status_code == 429:
        print("Rate limited -- monthly or per-minute limit exceeded")
    else:
        print(f"Ola Maps error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Coordinates use **`lat,lng` format** consistently (not `lng,lat`)
- Multiple points are separated by **pipe (`|`)** character (not comma)
- API key is passed as a **query parameter** (`?api_key=...`), not a header
- Directions endpoint is **POST** (not GET)
- Distance matrix endpoint is **GET** (not POST)
- Directions support `driving` and `walking` modes only (no transit/cycling)
- Direction instructions available in `en` (English), `hi` (Hindi), `kn` (Kannada)
- Free tier: **500K API calls/month** for the first year
- OAuth tokens require domain whitelisting
- Use debounce on autocomplete to avoid excessive API calls during typing
- An MCP server is available: https://maps.olakrutrim.com/docs/ola-maps-mcp/ola-maps-mcp-server
