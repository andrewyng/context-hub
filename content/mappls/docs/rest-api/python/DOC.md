---
name: rest-api
description: "Mappls (MapMyIndia) - Indian Maps, Geocoding & Navigation REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "mappls,mapmyindia,maps,geocoding,directions,india,navigation,api"
---

# Mappls (MapMyIndia) REST API - Python Reference

Mappls is India's leading mapping and location platform, offering geocoding, routing, search, and navigation APIs with coverage across India and 238 countries. It serves as a regional alternative to Google Maps with deep address-level coverage in India.

## Golden Rule

Always obtain an OAuth 2.0 access token before making API calls. The token endpoint uses `client_credentials` grant type and returns a bearer token valid for 24 hours. Search/places APIs use `search.mappls.com`, routing/distance APIs use `route.mappls.com`, and tile/static map APIs use `tile.mappls.com`. Coordinates are `latitude,longitude` for search APIs but `longitude,latitude` for routing APIs. The `eLoc` is Mappls' proprietary 6-character place identifier and can be used interchangeably with coordinates in many endpoints.

## Installation

```bash
pip install httpx
```

## Base URLs

| Service | Base URL |
|---------|----------|
| Token/Auth | `https://outpost.mappls.com/api/security/oauth/token` |
| Search/Geocoding/Places | `https://search.mappls.com/search/` |
| Routing/Directions | `https://route.mappls.com/route/` |
| Static Map Tiles | `https://tile.mappls.com/map/raster_tile/` |
| Atlas (Legacy/Alternate) | `https://atlas.mappls.com/api/` |

## Authentication

Mappls uses OAuth 2.0 client credentials flow. Obtain `client_id` and `client_secret` from the Mappls Console at `https://apis.mappls.com/console/`.

Some endpoints also accept a static `access_token` query parameter (API key from the console) without requiring the OAuth flow. The OAuth bearer token approach is recommended for production use.

```python
import httpx

TOKEN_URL = "https://outpost.mappls.com/api/security/oauth/token"

async def get_access_token(client_id: str, client_secret: str) -> dict:
    """Obtain OAuth 2.0 bearer token. Valid for 24 hours by default."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        data = resp.json()
        # Returns: access_token, token_type ("bearer"), expires_in
        return data

def auth_headers(token_type: str, access_token: str) -> dict:
    """Build Authorization header from token response."""
    return {"Authorization": f"{token_type} {access_token}"}
```

For endpoints that accept the static API key approach (query parameter):

```python
# Static key auth - pass as query parameter
params = {"access_token": "YOUR_STATIC_API_KEY", ...}
```

## Rate Limiting

Rate limits depend on your plan tier. When rate-limited, the API returns HTTP 403. Implement exponential backoff. Free-tier accounts have lower limits; check your console for specifics. Each static map request counts as one transaction.

## Methods

### Forward Geocoding

Convert a text address to geographic coordinates.

**Endpoint:** `GET https://search.mappls.com/search/address/geocode`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | Address to geocode, e.g. "237 Okhla Industrial Estate Phase 3 New Delhi" |
| `access_token` | string | Yes | API key or OAuth token |
| `itemCount` | int | No | Max results (default: 1) |
| `bias` | int | No | 0 = default, -1 = rural, 1 = urban |
| `podFilter` | string | No | Restrict to admin level: hno, poi, street, village, city, dist, pincode, state |
| `bound` | string | No | Admin boundary eLoc (mutually exclusive with podFilter) |
| `region` | string | No | Country code; mandatory for non-India queries |

```python
import httpx

GEOCODE_URL = "https://search.mappls.com/search/address/geocode"

async def forward_geocode(
    access_token: str,
    address: str,
    item_count: int = 1,
    region: str = "IND",
) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GEOCODE_URL,
            params={
                "access_token": access_token,
                "address": address,
                "itemCount": item_count,
                "region": region,
            },
        )
        resp.raise_for_status()
        return resp.json()
        # Response includes: copResults.houseNumber, .locality, .city,
        # .state, .pincode, .formattedAddress, .eLoc,
        # .geocodeLevel, .confidenceScore, lat/lng
```

### Reverse Geocoding

Convert latitude/longitude to a human-readable address.

**Endpoint:** `GET https://search.mappls.com/search/address/rev-geocode`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | float | Yes | Latitude |
| `lng` | float | Yes | Longitude |
| `access_token` | string | Yes | API key |
| `region` | string | No | Country code (default: IND) |
| `lang` | string | No | Language code, e.g. "hi" for Hindi |

```python
REV_GEOCODE_URL = "https://search.mappls.com/search/address/rev-geocode"

async def reverse_geocode(
    access_token: str,
    lat: float,
    lng: float,
    region: str = "IND",
) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            REV_GEOCODE_URL,
            params={
                "access_token": access_token,
                "lat": lat,
                "lng": lng,
                "region": region,
            },
        )
        resp.raise_for_status()
        return resp.json()
        # Response: results[].houseNumber, .houseName, .poi, .poi_dist,
        # .street, .village, .district, .subDistrict, .city, .state,
        # .pincode, .lat, .lng, .formatted_address
```

### Autosuggest (Autocomplete)

Type-ahead search returning location suggestions as the user types.

**Endpoint:** `GET https://search.mappls.com/search/places/autosuggest/json`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search term (POI name, address, keyword) |
| `access_token` | string | Yes | API key |
| `location` | string | No | Bias center as "lat,lng" |
| `zoom` | float | No | Map zoom level 4-18 (India only) |
| `region` | string | No | Country code (default: IND) |
| `tokenizeAddress` | valueless | No | Include structured address fields |
| `pod` | string | No | Place type filter: SLC, LC, CITY, VLG, SDIST, DIST, STATE |
| `filter` | string | No | Bounds/PIN/eLoc filter |
| `bridge` | valueless | No | Enable nearby API suggestions |
| `hyperLocal` | valueless | No | Strong location bias (requires location param) |

```python
AUTOSUGGEST_URL = "https://search.mappls.com/search/places/autosuggest/json"

async def autosuggest(
    access_token: str,
    query: str,
    location: str | None = None,
    region: str = "IND",
) -> dict:
    params = {
        "access_token": access_token,
        "query": query,
        "region": region,
    }
    if location:
        params["location"] = location  # "28.631460,77.217423"
    async with httpx.AsyncClient() as client:
        resp = await client.get(AUTOSUGGEST_URL, params=params)
        resp.raise_for_status()
        return resp.json()
        # Response: suggestedLocations[].type, .placeName, .placeAddress,
        # .eLoc, .keywords[], .orderIndex, .distance
        # Also: suggestedSearches[], userAddedLocations[]
```

### Nearby Search (POI)

Search for places near a reference location by category or keyword.

**Endpoint:** `GET https://search.mappls.com/search/places/nearby/json`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keywords` | string | Yes | Category name or code (e.g. "coffee", "FODCOF") |
| `refLocation` | string | Yes | Center point as "lat,lng" or eLoc code |
| `access_token` | string | Yes | API key |
| `page` | int | No | Result page number |
| `region` | string | No | Country code (IND, LKA, BTN, BGD, NPL) |
| `radius` | int | No | Search radius in meters (500-10000, default: 1000) |
| `bounds` | string | No | Rectangular bounds "x1,y1;x2,y2" |
| `filter` | string | No | Key-value filter, e.g. "categoryCode:FODCOF" |
| `sortBy` | string | No | Sort: "dist:asc", "dist:desc", or "imp" |
| `pod` | string | No | Place type: SLC, LC, CITY, STATE |

```python
NEARBY_URL = "https://search.mappls.com/search/places/nearby/json"

async def nearby_search(
    access_token: str,
    keywords: str,
    ref_location: str,
    radius: int = 1000,
    sort_by: str = "dist:asc",
    page: int = 1,
) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            NEARBY_URL,
            params={
                "access_token": access_token,
                "keywords": keywords,
                "refLocation": ref_location,  # "28.631460,77.217423" or "MMI000"
                "radius": radius,
                "sortBy": sort_by,
                "page": page,
            },
        )
        resp.raise_for_status()
        return resp.json()
        # Response: suggestedLocations[].distance, .eLoc, .placeName,
        # .placeAddress, .type, .keywords[], .orderIndex
        # Also: pageInfo.pageCount, .totalHits, .totalPages, .pageSize
```

### Directions / Routing

Calculate driving, biking, walking, or trucking routes between waypoints.

**Endpoint:** `GET https://route.mappls.com/route/direction/{resource}/{profile}/{coordinates}`

**URL path segments:**

| Segment | Values | Description |
|---------|--------|-------------|
| `resource` | `route_adv`, `route_eta`, `route_traffic` | route_adv = no traffic; route_eta = live traffic durations (India); route_traffic = live traffic routing (India) |
| `profile` | `driving`, `biking`, `walking`, `trucking` | Transport mode |
| `coordinates` | `lng1,lat1;lng2,lat2` | Semicolon-separated waypoints; can mix coords and eLoc codes |

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `access_token` | string | Yes | API key |
| `geometries` | string | No | "polyline" (default), "polyline6", "geojson" |
| `steps` | bool | No | Include turn-by-turn steps (default: false) |
| `exclude` | string | No | Avoid road types: "toll", "motorway", "ferry" (period-separated) |
| `rtype` | int | No | 0 = optimal (default), 1 = shortest |
| `region` | string | No | Country code (mandatory outside India) |
| `alternatives` | int | No | Number of alternative routes |
| `overview` | string | No | "simplified" (default), "full", "false" |

**IMPORTANT:** Routing coordinates are `longitude,latitude` (not lat,lng like search APIs).

```python
DIRECTIONS_URL = "https://route.mappls.com/route/direction"

async def get_directions(
    access_token: str,
    start: tuple[float, float],  # (lng, lat)
    end: tuple[float, float],    # (lng, lat)
    profile: str = "driving",
    resource: str = "route_adv",
    steps: bool = False,
    alternatives: int = 0,
    rtype: int = 0,
    exclude: str | None = None,
    region: str = "ind",
) -> dict:
    coords = f"{start[0]},{start[1]};{end[0]},{end[1]}"
    url = f"{DIRECTIONS_URL}/{resource}/{profile}/{coords}"
    params = {
        "access_token": access_token,
        "steps": str(steps).lower(),
        "rtype": rtype,
        "region": region,
    }
    if alternatives:
        params["alternatives"] = alternatives
    if exclude:
        params["exclude"] = exclude  # "toll.motorway"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()
        # Response: code ("Ok"), routes[].distance (meters),
        # .duration (seconds), .geometry (encoded polyline),
        # .legs[].steps[], waypoints[].name, .location
```

### Distance Matrix

Compute distance and duration between multiple origins and destinations.

**Endpoint:** `GET https://route.mappls.com/route/dm/{resource}/{profile}/{coordinates}`

**URL path segments:**

| Segment | Values | Description |
|---------|--------|-------------|
| `resource` | `distance_matrix`, `distance_matrix_eta`, `distance_matrix_traffic` | Standard, with ETA, or with traffic (ETA/traffic India only) |
| `profile` | `driving`, `biking`, `trucking` | Transport mode |
| `coordinates` | `lng1,lat1;lng2,lat2;...` | All points semicolon-separated (max 100 total) |

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `access_token` | string | Yes | API key |
| `sources` | string | No | Index numbers of source points, e.g. "0;1" |
| `destinations` | string | No | Index numbers of destination points, e.g. "2;3" |
| `rtype` | int | No | 0 = optimal (default), 1 = shortest |
| `region` | string | No | Country code (mandatory outside India) |

**IMPORTANT:** Coordinates are `longitude,latitude` (same as routing).

```python
DM_URL = "https://route.mappls.com/route/dm"

async def distance_matrix(
    access_token: str,
    coordinates: list[tuple[float, float]],  # [(lng, lat), ...]
    profile: str = "driving",
    resource: str = "distance_matrix",
    sources: list[int] | None = None,
    destinations: list[int] | None = None,
    rtype: int = 0,
    region: str = "ind",
) -> dict:
    coords_str = ";".join(f"{lng},{lat}" for lng, lat in coordinates)
    url = f"{DM_URL}/{resource}/{profile}/{coords_str}"
    params = {
        "access_token": access_token,
        "rtype": rtype,
        "region": region,
    }
    if sources is not None:
        params["sources"] = ";".join(str(s) for s in sources)
    if destinations is not None:
        params["destinations"] = ";".join(str(d) for d in destinations)
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()
        # Response: responseCode, results.code ("Ok"),
        # results.distances[][] (meters), results.durations[][] (seconds)
```

Additional endpoints: Text Search (`GET .../textsearch/json`), Static Map Image (`GET https://tile.mappls.com/map/raster_tile/still_image` -- returns PNG bytes, not JSON). Both follow the same `access_token` query parameter pattern.

## Error Handling

All JSON endpoints return standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 204 | Success but no results found |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (invalid or expired token/key) |
| 403 | Forbidden (rate limit exceeded or IP/domain not whitelisted) |
| 412 | Precondition failed (missing mandatory parameter) |
| 500 | Internal server error |
| 503 | Service unavailable |

```python
import httpx

class MapplsAPIError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"Mappls API error {status_code}: {detail}")

async def handle_response(resp: httpx.Response) -> dict:
    if resp.status_code == 204:
        return {"results": []}
    if resp.status_code == 401:
        raise MapplsAPIError(401, "Invalid or expired access token. Re-authenticate.")
    if resp.status_code == 403:
        raise MapplsAPIError(403, "Rate limit exceeded or IP/domain not whitelisted.")
    resp.raise_for_status()
    return resp.json()
```

## Common Pitfalls

1. **Coordinate order varies by endpoint.** Search/geocoding APIs use `latitude,longitude` while routing/distance APIs use `longitude,latitude`. Mixing them up produces results in the wrong location or errors.

2. **Token expiry.** OAuth tokens expire after 24 hours. Cache and refresh proactively. Static API keys do not expire but have IP/domain whitelisting restrictions.

3. **Region parameter.** For queries outside India, the `region` parameter is mandatory. Omitting it defaults to `IND` and returns no results for international queries.

4. **eLoc codes.** Mappls uses proprietary 6-character eLoc identifiers (e.g. "MMI000") as place IDs. These can be used in place of coordinates in many endpoints. They are not interchangeable with Google Place IDs or OSM IDs.

5. **Routing exclude syntax.** Multiple road exclusions are separated by periods (not commas): `exclude=toll.motorway.ferry`.

6. **Search vs Atlas base URLs.** The current production search endpoints use `search.mappls.com`. Some older documentation references `atlas.mappls.com/api/places/` which also works but may point to legacy endpoints. Use the `search.mappls.com` URLs documented above.

7. **Static map coordinates.** The static map API uses `lat,lng` format (matching search APIs), not `lng,lat` like routing.

8. **Distance matrix limit.** Maximum 100 total points (sources + destinations combined) per request.

9. **Live traffic endpoints.** The `route_eta`, `route_traffic`, `distance_matrix_eta`, and `distance_matrix_traffic` resources only work for India (`region=ind`). Using them for other regions returns errors.

10. **OAuth Content-Type.** The token endpoint requires `application/x-www-form-urlencoded` content type. Sending JSON will fail silently or return an error.
