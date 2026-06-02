---
name: rest-api
description: "ISRO API - Indian Space Research Organisation Spacecraft, Launcher & Mission Data"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "isro,india,space,spacecraft,rockets,launchers,satellites,missions,open-data,api"
---

# ISRO API

> **Golden Rule:** The ISRO API is a **free, open-source, no-auth** REST API serving data about ISRO's spacecrafts, launchers, customer satellites, centres, and missions. Use `httpx` for async access. Base URL is `https://isro.vercel.app`. No API key required. Returns JSON. Community-maintained (not official ISRO).

## Installation

```bash
pip install httpx
```

## Base URL

```
https://isro.vercel.app
```

Source code: https://github.com/isro/api

## Authentication

**Type:** None required. The API is completely open and free to use.

```python
import httpx

BASE_URL = "https://isro.vercel.app"

client = httpx.AsyncClient(base_url=BASE_URL, timeout=30.0)
```

## Rate Limiting

Not formally documented. The API is hosted on Vercel's free tier. Use responsibly and implement basic rate limiting on your end to avoid being throttled by the hosting platform.

## Methods

### `list_spacecrafts`

**Endpoint:** `GET /api/spacecrafts`

Retrieve all ISRO spacecrafts with their details.

```python
import httpx

async def list_spacecrafts():
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{BASE_URL}/api/spacecrafts")
        response.raise_for_status()
        data = response.json()
        spacecrafts = data["spacecrafts"]
        for sc in spacecrafts[:5]:
            print(f"{sc['name']} - {sc.get('id', 'N/A')}")
        return spacecrafts
```

### `list_launchers`

**Endpoint:** `GET /api/launchers`

Retrieve all ISRO launch vehicles (PSLV, GSLV, etc.).

```python
async def list_launchers():
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{BASE_URL}/api/launchers")
        response.raise_for_status()
        data = response.json()
        launchers = data["launchers"]
        for launcher in launchers:
            print(f"{launcher['id']} - {launcher.get('name', 'Unknown')}")
        return launchers
```

### `list_customer_satellites`

**Endpoint:** `GET /api/customer_satellites`

Retrieve satellites launched by ISRO for other countries/organizations.

```python
async def list_customer_satellites():
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{BASE_URL}/api/customer_satellites")
        response.raise_for_status()
        data = response.json()
        satellites = data["customer_satellites"]
        for sat in satellites[:5]:
            print(f"{sat.get('country', 'N/A')}: {sat.get('satellite', 'N/A')} ({sat.get('launch_date', 'N/A')})")
        return satellites
```

### `list_centres`

**Endpoint:** `GET /api/centres`

Retrieve all ISRO research centres and facilities.

```python
async def list_centres():
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{BASE_URL}/api/centres")
        response.raise_for_status()
        data = response.json()
        centres = data["centres"]
        for centre in centres:
            print(f"{centre.get('name', 'N/A')} - {centre.get('Place', 'N/A')}, {centre.get('State', 'N/A')}")
        return centres
```

### `list_spacecraft_missions`

**Endpoint:** `GET /api/spacecraft_missions`

Retrieve ISRO spacecraft mission details.

```python
async def list_spacecraft_missions():
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{BASE_URL}/api/spacecraft_missions")
        response.raise_for_status()
        data = response.json()
        return data
```

### Full Example: Search and Display

```python
import httpx

BASE_URL = "https://isro.vercel.app"

async def search_spacecrafts(keyword: str):
    """Search spacecrafts by name keyword."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{BASE_URL}/api/spacecrafts")
        response.raise_for_status()
        data = response.json()
        matches = [
            sc for sc in data["spacecrafts"]
            if keyword.lower() in sc.get("name", "").lower()
        ]
        return matches

async def get_all_data():
    """Fetch all ISRO data in parallel."""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        import asyncio
        spacecrafts, launchers, satellites, centres = await asyncio.gather(
            client.get("/api/spacecrafts"),
            client.get("/api/launchers"),
            client.get("/api/customer_satellites"),
            client.get("/api/centres"),
        )
        return {
            "spacecrafts": spacecrafts.json(),
            "launchers": launchers.json(),
            "customer_satellites": satellites.json(),
            "centres": centres.json(),
        }
```

## Error Handling

```python
import httpx

try:
    response = await client.get(f"{BASE_URL}/api/spacecrafts")
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 404:
        print("Endpoint not found -- check the path")
    elif e.response.status_code == 429:
        print("Too many requests -- slow down")
    elif e.response.status_code >= 500:
        print("Server error -- Vercel hosting may be temporarily down")
    else:
        print(f"ISRO API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- **Community-maintained, not official ISRO**: This API is an open-source project hosted on Vercel, not an official ISRO government service
- **No authentication needed**: Do not send API keys or auth headers
- **All endpoints are GET**: There are no POST/PUT/DELETE operations (read-only data)
- **Vercel free tier hosting**: May have cold starts (first request can be slow) and implicit rate limits
- **Data is static/curated**: Not real-time telemetry; data is manually curated from public ISRO records
- **Response structure varies**: Each endpoint wraps data in a different key (`spacecrafts`, `launchers`, `customer_satellites`, `centres`)
- **No pagination**: All data is returned in a single response
- **No filtering parameters on the server**: Filtering must be done client-side after fetching full datasets
- **CORS is not enabled**: May not work from browser-based JavaScript; works fine from server-side Python
- **HTTPS only**: All requests must use HTTPS
- For official ISRO satellite imagery data, use the separate Bhoonidhi API at https://bhoonidhi.nrsc.gov.in/ (requires registration)
