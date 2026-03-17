---
name: rest-api
description: "NHS Service Search API for UK healthcare organisation and service data"
metadata:
  languages: "python"
  versions: "3.0.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "nhs,health,uk,gp,prescriptions,organizations,api"
---

# NHS Service Search API

> **Golden Rule:** The NHS API has no official Python SDK. Use `httpx` (async) for direct REST API access. All endpoints are GET or POST returning JSON. Authentication requires a `subscription-key` header obtained from the NHS developer portal. Use v3 endpoints -- v1/v2 were deprecated on 2 February 2026.

## Installation

```bash
pip install httpx
```

## Base URL

`https://api.nhs.uk/service-search`

Documentation and key registration: https://digital.nhs.uk/developer

## Authentication

**Type:** Subscription Key (custom header)

Register at the NHS developer portal to get a subscription key.

```python
import httpx

SUBSCRIPTION_KEY = "your-nhs-subscription-key"
BASE_URL = "https://api.nhs.uk/service-search"

headers = {
    "subscription-key": SUBSCRIPTION_KEY,
    "Content-Type": "application/json"
}
client = httpx.AsyncClient(headers=headers, timeout=30.0)
```

**Important:** The `subscription-key` header is required for all requests. There is no anonymous/keyless access.

## Rate Limiting

| Tier | Rate Limit |
|---|---|
| Trial | 10 requests/minute, 1,000/month |
| Full subscription | 4,000 requests/hour |

## Methods

### Search Organisations

**Endpoint:** `GET /search`

Search for NHS organisations (GP practices, hospitals, pharmacies, dentists, etc.) by name or postcode.

| Parameter | Type | Default |
|---|---|---|
| `search` | `str` | **required** (name or postcode) |
| `$filter` | `str` | `None` (OData filter expression) |
| `$top` | `int` | `25` (max results per page) |
| `$skip` | `int` | `0` |
| `$orderby` | `str` | `None` |
| `api-version` | `str` | `3` |

```python
# Search for GP practices near a postcode
params = {
    "search": "SW1A 1AA",
    "$filter": "OrganisationTypeId eq 'GPB'",
    "$top": 10,
    "api-version": "3"
}
response = await client.get(f"{BASE_URL}/search", params=params)
response.raise_for_status()
data = response.json()
for org in data.get("value", []):
    print(f"{org['OrganisationName']} - {org.get('Address1', 'N/A')}")
```

### Get Organisation Types

**Endpoint:** `GET /search/organisationtypes`

List all available organisation type codes.

```python
params = {"api-version": "3"}
response = await client.get(f"{BASE_URL}/search/organisationtypes", params=params)
response.raise_for_status()
data = response.json()
for org_type in data.get("value", []):
    print(f"{org_type['OrganisationTypeId']}: {org_type['OrganisationTypeName']}")
```

Common organisation type codes:
- `GPB` -- GP practices
- `HOS` -- Hospitals
- `PHA` -- Pharmacies
- `DEN` -- Dentists
- `OPT` -- Opticians
- `CLI` -- Clinics

### Search by Postcode

**Endpoint:** `GET /search`

Find nearby services by postcode with distance ordering.

```python
params = {
    "search": "EC1A 1BB",
    "$filter": "OrganisationTypeId eq 'PHA'",
    "$top": 5,
    "$orderby": "Geocode/distance",
    "api-version": "3"
}
response = await client.get(f"{BASE_URL}/search", params=params)
response.raise_for_status()
data = response.json()
for pharmacy in data.get("value", []):
    name = pharmacy.get("OrganisationName", "Unknown")
    postcode = pharmacy.get("Postcode", "N/A")
    print(f"{name} ({postcode})")
```

### Search by Service

**Endpoint:** `POST /search`

Search with complex filters using POST body.

```python
body = {
    "search": "mental health",
    "filter": "OrganisationTypeId eq 'CLI'",
    "top": 10,
    "api-version": "3"
}
response = await client.post(f"{BASE_URL}/search", json=body)
response.raise_for_status()
data = response.json()
```

### Organisation Data Service (ODS) - Open Access

**Base URL:** `https://directory.spineservices.nhs.uk/ORD/2-0-0`

The ODS ORD API is **open access** and requires no authentication or subscription key.

```python
# Look up a specific organisation by ODS code
ods_client = httpx.AsyncClient(timeout=30.0)
response = await ods_client.get(
    "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations/RJY"
)
response.raise_for_status()
data = response.json()
org = data.get("Organisation", {})
print(f"Name: {org.get('Name', 'N/A')}")
```

```python
# Search ODS organisations by name
response = await ods_client.get(
    "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations",
    params={"Name": "Royal", "Limit": 10}
)
response.raise_for_status()
data = response.json()
for org in data.get("Organisations", []):
    print(f"{org['Name']} ({org['OrgId']})")
```

## Error Handling

```python
import httpx

try:
    response = await client.get(f"{BASE_URL}/search", params={"search": "test", "api-version": "3"})
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Invalid or missing subscription-key header")
    elif e.response.status_code == 403:
        print("Subscription key not authorized for this API")
    elif e.response.status_code == 429:
        print("Rate limited -- reduce request frequency or upgrade subscription")
    elif e.response.status_code == 400:
        print(f"Bad request (invalid filter syntax): {e.response.text}")
    elif e.response.status_code == 404:
        print("Endpoint not found -- check API version parameter")
    else:
        print(f"NHS API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Auth header is `subscription-key` (not `Authorization: Bearer`)
- Always include `api-version=3` parameter -- v1/v2 were deprecated February 2026
- OData filter expressions use single quotes for strings: `OrganisationTypeId eq 'GPB'`
- The `$filter`, `$top`, `$skip`, `$orderby` parameters use OData syntax with `$` prefix
- Postcode searches work best with spaces (e.g., `SW1A 1AA` not `SW1A1AA`)
- Results are paginated; use `$skip` to get subsequent pages
- The ODS ORD API at `directory.spineservices.nhs.uk` is separate and needs no auth
- Trial subscriptions are severely limited (10/min, 1000/month)
- Response structure uses `value` array (OData convention), not `results`
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
