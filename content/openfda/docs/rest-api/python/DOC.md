---
name: rest-api
description: "OpenFDA REST API for US FDA drug, device, and food safety data"
metadata:
  languages: "python"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "openfda,health,drugs,medical-devices,food-safety,adverse-events,api"
---

# OpenFDA REST API

> **Golden Rule:** OpenFDA has no official Python SDK. Use `httpx` (async) for direct REST API access. All endpoints are GET with query parameters. Authentication via optional API key (`api_key` query param) increases daily rate limits from 1,000 to 120,000. Returns JSON with `meta` and `results` sections.

## Installation

```bash
pip install httpx
```

## Base URL

`https://api.fda.gov`

## Authentication

**Type:** API Key (query parameter, optional but recommended)

Get a free API key at: https://open.fda.gov/apis/authentication/

```python
import httpx

API_KEY = "your-openfda-api-key"  # Optional but recommended
BASE_URL = "https://api.fda.gov"

client = httpx.AsyncClient(
    base_url=BASE_URL,
    params={"api_key": API_KEY},
    timeout=30.0
)
```

Alternatively, pass as basic auth username in the Authorization header:

```python
client = httpx.AsyncClient(
    base_url=BASE_URL,
    auth=(API_KEY, ""),
    timeout=30.0
)
```

**Important:** The API works without a key but at severely reduced rate limits.

## Rate Limiting

| Authentication | Per Minute | Per Day |
|---|---|---|
| Without API key | 240 (per IP) | 1,000 (per IP) |
| With API key | 240 (per key) | 120,000 (per key) |

For higher limits, contact open@fda.hhs.gov.

## Methods

### Drug Adverse Events

**Endpoint:** `GET /drug/event.json`

Search FDA Adverse Event Reporting System (FAERS) for drug side effects.

| Parameter | Type | Default |
|---|---|---|
| `search` | `str` | `None` (field:term syntax) |
| `count` | `str` | `None` (field to count unique values) |
| `limit` | `int` | `1` (max 1000) |
| `skip` | `int` | `0` |

```python
# Search adverse events for a specific drug
params = {
    "search": 'patient.drug.medicinalproduct:"ibuprofen"',
    "limit": 5
}
response = await client.get("/drug/event.json", params=params)
response.raise_for_status()
data = response.json()
for result in data.get("results", []):
    reactions = [r["reactionmeddrapt"] for r in result.get("patient", {}).get("reaction", [])]
    print(f"Reactions: {reactions}")
```

### Drug Labeling

**Endpoint:** `GET /drug/label.json`

Search structured product labeling (package inserts) for drugs.

```python
# Search drug labels for warnings about drowsiness
params = {
    "search": 'warnings:"drowsiness"',
    "limit": 3
}
response = await client.get("/drug/label.json", params=params)
response.raise_for_status()
data = response.json()
for label in data.get("results", []):
    brand = label.get("openfda", {}).get("brand_name", ["Unknown"])
    print(f"Brand: {brand[0]}")
```

### Drug Recalls (Enforcement)

**Endpoint:** `GET /drug/enforcement.json`

Search drug recall and enforcement reports.

```python
params = {
    "search": 'classification:"Class I"+AND+status:"Ongoing"',
    "limit": 5
}
response = await client.get("/drug/enforcement.json", params=params)
response.raise_for_status()
data = response.json()
for recall in data.get("results", []):
    print(f"Recall: {recall.get('reason_for_recall', 'N/A')}")
```

### Drug NDC Directory

**Endpoint:** `GET /drug/ndc.json`

Search the National Drug Code directory.

```python
params = {
    "search": 'brand_name:"aspirin"',
    "limit": 5
}
response = await client.get("/drug/ndc.json", params=params)
response.raise_for_status()
data = response.json()
```

### Medical Device Reports

**Endpoint:** `GET /device/event.json`

Search medical device adverse event reports (MDR).

```python
params = {
    "search": 'device.generic_name:"wheelchair"',
    "limit": 5
}
response = await client.get("/device/event.json", params=params)
response.raise_for_status()
data = response.json()
for event in data.get("results", []):
    print(f"Event type: {event.get('event_type', 'N/A')}")
```

### Device Recalls

**Endpoint:** `GET /device/recall.json`

```python
params = {
    "search": 'openfda.device_name:"hearing aid"',
    "limit": 5
}
response = await client.get("/device/recall.json", params=params)
response.raise_for_status()
data = response.json()
```

### Device Classifications

**Endpoint:** `GET /device/classification.json`

```python
params = {
    "search": 'device_name:"glucose monitor"',
    "limit": 5
}
response = await client.get("/device/classification.json", params=params)
response.raise_for_status()
data = response.json()
```

### Food Adverse Events

**Endpoint:** `GET /food/event.json`

Search food and dietary supplement adverse events.

```python
params = {
    "search": 'products.name_brand:"supplement"',
    "limit": 5
}
response = await client.get("/food/event.json", params=params)
response.raise_for_status()
data = response.json()
```

### Food Recalls (Enforcement)

**Endpoint:** `GET /food/enforcement.json`

```python
params = {
    "search": 'reason_for_recall:"allergen"',
    "limit": 5
}
response = await client.get("/food/enforcement.json", params=params)
response.raise_for_status()
data = response.json()
```

### Count Queries

Use `count` parameter to aggregate unique values across results.

```python
# Count top 10 drugs with most adverse events
params = {
    "search": 'patient.drug.medicinalproduct:"*"',
    "count": "patient.drug.medicinalproduct.exact"
}
response = await client.get("/drug/event.json", params=params)
response.raise_for_status()
data = response.json()
for item in data.get("results", [])[:10]:
    print(f"{item['term']}: {item['count']}")
```

### Other Endpoints

| Endpoint | Description |
|---|---|
| `GET /drug/drugsfda.json` | FDA-approved drug products |
| `GET /drug/drugshortages.json` | Drug shortage data |
| `GET /device/510k.json` | 510(k) premarket submissions |
| `GET /device/pma.json` | Premarket approval (PMA) data |
| `GET /device/udi.json` | Unique Device Identifiers |
| `GET /device/enforcement.json` | Device enforcement reports |
| `GET /food/enforcement.json` | Food enforcement reports |

## Search Syntax

- **Single field:** `search=field:term`
- **AND logic:** `search=field1:term1+AND+field2:term2`
- **OR logic:** `search=field1:term1+OR+field2:term2`
- **Exact match:** `search=field.exact:"value"`
- **Wildcard:** `search=field:val*`
- **Date range:** `search=date:[20200101+TO+20231231]`

## Error Handling

```python
import httpx

try:
    response = await client.get("/drug/event.json", params={"search": "test", "limit": 5})
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 404:
        error = e.response.json().get("error", {})
        print(f"No matches found: {error.get('message', 'N/A')}")
    elif e.response.status_code == 429:
        print("Rate limited -- reduce request frequency or add API key")
    elif e.response.status_code == 400:
        print(f"Bad request (invalid search syntax): {e.response.text}")
    elif e.response.status_code == 409:
        print("Search timed out -- simplify your query")
    else:
        print(f"OpenFDA error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- All endpoints use **GET** (not POST) with query string parameters
- A `404` means **no matching results**, not that the endpoint is invalid
- The `limit` parameter max is **1000** per request; use `skip` for pagination
- Search terms with spaces must be quoted: `search=field:"two words"`
- Date fields use `YYYYMMDD` format without dashes: `[20200101+TO+20231231]`
- The `count` parameter cannot be combined with `limit` or `skip`
- Response `meta.results.total` gives total matches; use for pagination logic
- Wildcard (`*`) searches cannot be combined with exact-match quoted strings
- The `openfda` sub-object on results provides standardized drug/device identifiers
- HTTPS is required; HTTP requests will fail
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)` -- some queries are slow
