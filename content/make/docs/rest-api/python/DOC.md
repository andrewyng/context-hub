---
name: rest-api
description: "Make.com (Integromat) Workflow Automation API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "make,integromat,automation,workflows,scenarios,webhooks,api,integration"
---

# Make.com API

> **Golden Rule:** Make.com has no official Python SDK. Use `httpx` (async) or `requests` (sync) for direct REST API access. Authentication uses `Token` (not Bearer). Base URL is zone-specific. Always handle rate limits explicitly.

## Installation

```bash
pip install httpx
```

## Base URL

`https://{zone}.make.com/api/v2`

Zones: `eu1`, `eu2`, `us1`, `us2` (check your account settings for your zone).

## Authentication

**Type:** API Token

```python
import httpx

API_TOKEN = "your-make-api-token"  # UUID format
ZONE = "us1"  # or eu1, eu2, us2
BASE_URL = f"https://{ZONE}.make.com/api/v2"

headers = {
    "Authorization": f"Token {API_TOKEN}",
    "Content-Type": "application/json"
}
client = httpx.AsyncClient(headers=headers)
```

**Important:** Make uses `Token` prefix (not `Bearer`). Tokens are UUID format.

## Rate Limiting

| Plan | Requests/minute |
|---|---|
| Core | 60 |
| Pro | 120 |
| Teams | 240 |
| Enterprise | 1,000 |

Returns HTTP 429 when exceeded. Pagination uses `pg[offset]` query parameter.

## Methods

### `list_scenarios`

**Endpoint:** `GET /scenarios`

List all scenarios for a team.

| Parameter | Type | Default |
|---|---|---|
| `teamId` | `int` | **required** (query param) |
| `pg[offset]` | `int` | `0` |

**Returns:** JSON with `scenarios` array

```python
params = {"teamId": 12345}
response = await client.get(f"{BASE_URL}/scenarios", params=params)
response.raise_for_status()
data = response.json()
scenarios = data.get("scenarios", [])
```

### `run_scenario`

**Endpoint:** `POST /scenarios/{scenarioId}/run`

Trigger a scenario to run immediately. Scenario must be active.

| Parameter | Type | Default |
|---|---|---|
| `scenarioId` | `int` | **required** (path param) |

**Returns:** JSON with execution details

```python
scenario_id = 12345
response = await client.post(f"{BASE_URL}/scenarios/{scenario_id}/run")
response.raise_for_status()
data = response.json()
```

### `start_scenario`

**Endpoint:** `POST /scenarios/{scenarioId}/start`

Activate a scenario (enables scheduling and triggers).

```python
response = await client.post(f"{BASE_URL}/scenarios/{scenario_id}/start")
response.raise_for_status()
```

### `stop_scenario`

**Endpoint:** `POST /scenarios/{scenarioId}/stop`

Deactivate a scenario.

```python
response = await client.post(f"{BASE_URL}/scenarios/{scenario_id}/stop")
response.raise_for_status()
```

### `get_scenario`

**Endpoint:** `GET /scenarios/{scenarioId}`

Get scenario details including blueprint, scheduling, and status.

```python
response = await client.get(f"{BASE_URL}/scenarios/{scenario_id}")
response.raise_for_status()
scenario = response.json().get("scenario", {})
```

### `create_hook`

**Endpoint:** `POST /hooks`

Create a webhook that can receive external data and trigger scenarios.

| Parameter | Type | Default |
|---|---|---|
| `name` | `str` | **required** |
| `teamId` | `int` | **required** |
| `typeName` | `str` | **required** (e.g., `"web"`) |

**Returns:** JSON with hook details including webhook URL

```python
payload = {
    "name": "My Webhook",
    "teamId": 12345,
    "typeName": "web"
}
response = await client.post(f"{BASE_URL}/hooks", json=payload)
response.raise_for_status()
hook = response.json().get("hook", {})
webhook_url = hook.get("url")
```

### `list_hooks`

**Endpoint:** `GET /hooks`

List all webhooks for a team.

```python
params = {"teamId": 12345}
response = await client.get(f"{BASE_URL}/hooks", params=params)
response.raise_for_status()
hooks = response.json().get("hooks", [])
```

### `list_data_store_records`

**Endpoint:** `GET /data-stores/{dataStoreId}/data`

List all records in a data store.

```python
data_store_id = 67890
response = await client.get(f"{BASE_URL}/data-stores/{data_store_id}/data")
response.raise_for_status()
records = response.json().get("records", [])
```

### `create_data_store_record`

**Endpoint:** `POST /data-stores/{dataStoreId}/data`

Create a record in a data store.

```python
payload = {"key": "user_123", "data": {"name": "Jane", "score": 95}}
response = await client.post(
    f"{BASE_URL}/data-stores/{data_store_id}/data", json=payload
)
response.raise_for_status()
```

### Other Endpoints

| Method | Path | Description |
|---|---|---|
| `POST /scenarios` | Create a new scenario |
| `PATCH /scenarios/{id}` | Update scenario properties |
| `DELETE /scenarios/{id}` | Delete a scenario |
| `POST /scenarios/{id}/clone` | Clone a scenario |
| `GET /scenarios/{id}/blueprint` | Get scenario blueprint |
| `GET /connections` | List connections |
| `POST /connections/{id}/test` | Test a connection |
| `GET /dlqs` | List incomplete executions |
| `POST /dlqs/{id}/retry` | Retry failed execution |

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/scenarios/{scenario_id}/run")
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check your API token")
    elif e.response.status_code == 429:
        print("Rate limited -- back off and retry")
    elif e.response.status_code == 403:
        print("Forbidden -- check token permissions/scopes")
    else:
        print(f"Make API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Auth header is `Token` (not `Bearer`) -- format: `Authorization: Token {uuid}`
- Base URL is zone-specific -- use the zone matching your account (`eu1`, `eu2`, `us1`, `us2`)
- Scenarios must be activated (`/start`) before they can be run (`/run`)
- Pagination uses `pg[offset]` query parameter (not `page` or `cursor`)
- Data store records use a `key` field as the primary identifier
- Rate limits vary significantly by plan (60-1000 RPM)
- Always call `response.raise_for_status()` to catch HTTP errors
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
