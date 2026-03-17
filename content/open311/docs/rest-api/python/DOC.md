---
name: rest-api
description: "Open311 GeoReport v2 - Civic issue reporting standard for potholes, graffiti, broken lights, and other non-emergency municipal issues."
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "open311,civic,community,issue-reporting,government,municipal,api"
---

# Open311 GeoReport v2 API - Python Reference (httpx)

## Golden Rule

Open311 is an **open standard**, not a single API. Each city/municipality runs its own server with its own base URL. GET endpoints (reading services and requests) require no API key. POST endpoints (creating service requests) require an API key obtained from the specific city's portal. Responses support JSON and XML -- always request JSON via the `.json` extension in the URL path. Location is required when submitting requests: provide `lat`/`long`, `address_string`, or `address_id`. See http://wiki.open311.org/GeoReport_v2/Servers for a list of cities implementing the spec.

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
        resp = await client.get(f"{BASE_URL}/services.json")
        print(resp.json())

asyncio.run(main())
```

## Base URL

Each city has its own endpoint. Common examples:

```
# Chicago
https://311api.cityofchicago.org/open311/v2

# San Francisco
https://mobile311.sfgov.org/open311/v2

# Toronto
https://secure.toronto.ca/webwizard/ws

# Washington D.C.
https://311.dc.gov/open311/v2

# Helsinki
https://asiointi.hel.fi/palautews/rest/v1
```

```python
import os

# Configure for your target city
BASE_URL = os.environ.get("OPEN311_BASE_URL", "https://311api.cityofchicago.org/open311/v2")
API_KEY = os.environ.get("OPEN311_API_KEY", "")  # Required only for POST
JURISDICTION_ID = os.environ.get("OPEN311_JURISDICTION_ID", "")  # Optional for single-jurisdiction
```

## Authentication

- **GET requests:** No API key required.
- **POST requests:** API key required, passed as `api_key` query parameter or form field.

Each city has its own API key registration process. Check the specific city's developer portal.

```python
def post_params(**extra) -> dict:
    params = {**extra}
    if API_KEY:
        params["api_key"] = API_KEY
    if JURISDICTION_ID:
        params["jurisdiction_id"] = JURISDICTION_ID
    return params
```

## Rate Limiting

Rate limits vary by city implementation. The Open311 standard does not specify rate limits. Implement reasonable throttling.

```python
import asyncio

async def open311_get(
    client: httpx.AsyncClient,
    path: str,
    params: dict = None,
    max_retries: int = 3,
) -> list | dict:
    url = f"{BASE_URL}/{path}.json"
    request_params = {**(params or {})}
    if JURISDICTION_ID:
        request_params["jurisdiction_id"] = JURISDICTION_ID

    for attempt in range(max_retries):
        try:
            resp = await client.get(url, params=request_params)
        except httpx.RequestError:
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            return resp.json()

        if resp.status_code == 429:
            await asyncio.sleep(min(2 ** attempt, 30))
            continue

        resp.raise_for_status()

    raise Exception("Max retries exceeded")
```

## Methods

### Get Service List

Retrieve available service request types for the city. No API key required.

**Response fields:**
- `service_code` -- Unique identifier for the service type
- `service_name` -- Human-readable name
- `description` -- Description of the service
- `type` -- `realtime` (instant ID), `batch` (returns token), or `blackbox` (no ID returned)
- `keywords` -- Comma-separated tags
- `group` -- Category grouping

```python
async def get_services(client: httpx.AsyncClient) -> list:
    return await open311_get(client, "services")

# Usage
services = await get_services(client)
for svc in services:
    print(f"{svc['service_code']}: {svc['service_name']} ({svc['type']})")
    # e.g., "001": "Clogged Drain" (realtime)
```

### Get Service Definition

Retrieve extended attributes (form fields) required when submitting a request for a specific service.

```python
async def get_service_definition(client: httpx.AsyncClient, service_code: str) -> dict:
    return await open311_get(client, f"services/{service_code}")

# Usage
definition = await get_service_definition(client, "001")
for attr in definition.get("attributes", []):
    print(f"  {attr['code']}: {attr['description']} (required={attr['required']})")
    if attr.get("values"):
        for val in attr["values"]:
            print(f"    - {val['key']}: {val['name']}")
```

### Create Service Request (POST)

Submit a new civic issue report. **Requires API key.** Must include location via lat/long, address string, or address ID.

**Required parameters:**
- `service_code` (str) -- Service type code from service list
- Location: `lat` + `long` (WGS84), OR `address_string`, OR `address_id`

**Optional parameters:**
- `description` (str) -- Issue description (max 4,000 chars)
- `email` (str) -- Reporter's email
- `first_name` (str) -- Reporter's first name
- `last_name` (str) -- Reporter's last name
- `phone` (str) -- Reporter's phone number
- `media_url` (str) -- URL to a photo of the issue
- `device_id` (str) -- Device identifier
- `account_id` (str) -- User account ID
- `attribute[CODE]` (str) -- Dynamic attributes from service definition

```python
async def create_service_request(
    client: httpx.AsyncClient,
    service_code: str,
    lat: float = None,
    long: float = None,
    address_string: str = None,
    description: str = None,
    email: str = None,
    first_name: str = None,
    last_name: str = None,
    phone: str = None,
    media_url: str = None,
    attributes: dict = None,
) -> list:
    url = f"{BASE_URL}/requests.json"
    data = post_params(service_code=service_code)

    if lat is not None and long is not None:
        data["lat"] = lat
        data["long"] = long
    elif address_string:
        data["address_string"] = address_string

    if description:
        data["description"] = description
    if email:
        data["email"] = email
    if first_name:
        data["first_name"] = first_name
    if last_name:
        data["last_name"] = last_name
    if phone:
        data["phone"] = phone
    if media_url:
        data["media_url"] = media_url

    if attributes:
        for code, value in attributes.items():
            if isinstance(value, list):
                for v in value:
                    data[f"attribute[{code}][]"] = v
            else:
                data[f"attribute[{code}]"] = value

    resp = await client.post(
        url,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"},
    )
    resp.raise_for_status()
    return resp.json()

# Usage
result = await create_service_request(
    client,
    service_code="001",
    lat=41.8781,
    long=-87.6298,
    description="Large pothole on Main Street near the intersection with Oak Ave",
    email="reporter@example.com",
)
# Returns: [{"service_request_id": "293944", "service_notice": "..."}]
# OR for batch systems: [{"token": "abc123"}]
```

### Get Service Request ID from Token

For batch-processing systems that return a token instead of an immediate ID.

```python
async def get_request_id_from_token(client: httpx.AsyncClient, token: str) -> list:
    return await open311_get(client, f"tokens/{token}")

# Usage
result = await get_request_id_from_token(client, "abc123")
service_request_id = result[0]["service_request_id"]
```

### Get Service Requests (Multiple)

Retrieve multiple service requests with filtering. No API key required.

**Parameters:**
- `service_request_id` (str) -- Comma-delimited IDs (overrides other filters)
- `service_code` (str) -- Filter by service type (comma-delimited)
- `start_date` (str) -- ISO 8601 start date (max 90-day span)
- `end_date` (str) -- ISO 8601 end date
- `status` (str) -- `open`, `closed`, or comma-delimited

```python
async def get_service_requests(
    client: httpx.AsyncClient,
    service_code: str = None,
    start_date: str = None,
    end_date: str = None,
    status: str = None,
    service_request_ids: str = None,
) -> list:
    params = {}
    if service_request_ids:
        params["service_request_id"] = service_request_ids
    if service_code:
        params["service_code"] = service_code
    if start_date:
        params["start_date"] = start_date
    if end_date:
        params["end_date"] = end_date
    if status:
        params["status"] = status
    return await open311_get(client, "requests", params)

# Usage -- get open pothole reports from last week
requests = await get_service_requests(
    client,
    service_code="001",
    status="open",
    start_date="2026-03-10T00:00:00Z",
    end_date="2026-03-17T00:00:00Z",
)
for req in requests:
    print(f"{req['service_request_id']}: {req['description']} - {req['status']}")
    print(f"  Location: {req.get('address', 'N/A')} ({req.get('lat')}, {req.get('long')})")
```

### Get Single Service Request

Retrieve a specific service request by ID.

```python
async def get_service_request(client: httpx.AsyncClient, request_id: str) -> list:
    return await open311_get(client, f"requests/{request_id}")

# Usage
request = (await get_service_request(client, "293944"))[0]
print(f"Status: {request['status']}")
print(f"Service: {request['service_name']}")
print(f"Submitted: {request['requested_datetime']}")
print(f"Updated: {request['updated_datetime']}")
print(f"Agency: {request.get('agency_responsible', 'N/A')}")
```

## Error Handling

Successful responses return HTTP 200 with a JSON array.

Errors return a JSON array of error objects:

```json
[
    {
        "code": 400,
        "description": "jurisdiction_id was not provided"
    }
]
```

**Common status codes:**

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request -- missing or invalid parameters |
| 403 | Forbidden -- missing or invalid API key (POST only) |
| 404 | Not Found -- jurisdiction or resource not found |
| 500 | Internal Server Error |

```python
import logging

logger = logging.getLogger(__name__)

class Open311Error(Exception):
    def __init__(self, status_code: int, errors: list):
        self.status_code = status_code
        self.errors = errors
        desc = "; ".join(e.get("description", "Unknown") for e in errors)
        super().__init__(f"[{status_code}] {desc}")

async def open311_request_safe(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    params: dict = None,
    data: dict = None,
    max_retries: int = 3,
) -> list | dict:
    url = f"{BASE_URL}/{path}.json"
    request_params = {**(params or {})}
    if JURISDICTION_ID:
        request_params["jurisdiction_id"] = JURISDICTION_ID

    for attempt in range(max_retries):
        try:
            if method == "GET":
                resp = await client.get(url, params=request_params)
            else:
                resp = await client.post(url, data={**request_params, **(data or {})})
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

        try:
            errors = resp.json()
        except Exception:
            errors = [{"code": resp.status_code, "description": resp.text}]
        raise Open311Error(resp.status_code, errors)

    raise Open311Error(429, [{"code": 429, "description": "Max retries exceeded"}])
```

## Common Pitfalls

1. **Each city has a different base URL.** There is no central Open311 server. You must configure the endpoint for each city. Check http://wiki.open311.org/GeoReport_v2/Servers for the list.

2. **API keys are city-specific.** An API key for Chicago will not work for San Francisco. Register separately with each city.

3. **GET requests do not need API keys.** Only POST (creating requests) requires authentication. Do not send API keys on GET requests unnecessarily.

4. **Use `.json` extension for JSON responses.** Append `.json` to the path (e.g., `/services.json`). Without it, many servers default to XML.

5. **Default result set is 1,000 requests or 90 days.** The API returns whichever limit is reached first. For older data, narrow your date range.

6. **Dates must be ISO 8601 with timezone.** Use the format `2026-03-17T00:00:00-05:00` or `2026-03-17T05:00:00Z`. Missing timezone can cause unexpected results.

7. **Location is required for POST.** You must provide at least one of: `lat`+`long`, `address_string`, or `address_id`. The request will fail without location data.

8. **Batch systems return tokens, not IDs.** If the service `type` is `batch`, the POST returns a `token` instead of `service_request_id`. Poll the token endpoint to get the ID.

9. **`jurisdiction_id` is optional for single-jurisdiction endpoints.** Most city endpoints serve a single jurisdiction. Only multi-jurisdiction servers require this parameter.

10. **Multivaluelist attributes use array syntax.** For service definition attributes that accept multiple values, use `attribute[code][]=value1&attribute[code][]=value2` format.

11. **Not all fields are returned by all cities.** The spec defines optional fields. Some cities return minimal data. Always check for `None`/missing keys.

12. **Coordinates use WGS84 (GPS standard).** Latitude/longitude values should be standard GPS coordinates in decimal degrees.
