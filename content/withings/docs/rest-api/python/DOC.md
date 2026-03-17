---
name: rest-api
description: "Withings API for connected health devices (scales, blood pressure, sleep trackers)"
metadata:
  languages: "python"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "withings,health,devices,blood-pressure,weight,sleep,api"
---

# Withings API

> **Golden Rule:** Withings has no official Python SDK for REST. Use `httpx` (async) for direct API access. All data endpoints are POST to `https://wbsapi.withings.net` with `action` parameter specifying the operation. Authentication uses OAuth 2.0. Responses use a `status` field (0 = success) instead of HTTP status codes for application errors.

## Installation

```bash
pip install httpx
```

## Base URL

`https://wbsapi.withings.net`

OAuth authorization URL: `https://account.withings.com/oauth2_user/authorize2`
OAuth token endpoint: `https://wbsapi.withings.net/v2/oauth2`

Register your app at: https://developer.withings.com/

## Authentication

**Type:** OAuth 2.0 Authorization Code Grant

### Step 1: Build Authorization URL

```python
CLIENT_ID = "your-client-id"
REDIRECT_URI = "https://your-app.com/callback"
SCOPES = "user.info,user.metrics,user.activity,user.sleepevents"
STATE = "random-csrf-token"

auth_url = (
    f"https://account.withings.com/oauth2_user/authorize2"
    f"?response_type=code"
    f"&client_id={CLIENT_ID}"
    f"&redirect_uri={REDIRECT_URI}"
    f"&scope={SCOPES}"
    f"&state={STATE}"
)
# Direct user to auth_url in browser
```

### Step 2: Exchange Code for Tokens

```python
import httpx

CLIENT_SECRET = "your-client-secret"
BASE_URL = "https://wbsapi.withings.net"

async def exchange_code(authorization_code: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/v2/oauth2",
            data={
                "action": "requesttoken",
                "grant_type": "authorization_code",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": authorization_code,
                "redirect_uri": REDIRECT_URI,
            },
        )
        response.raise_for_status()
        data = response.json()
        if data["status"] != 0:
            raise Exception(f"Withings error: {data['status']} - {data.get('error', 'unknown')}")
        return data["body"]
        # Returns: access_token, refresh_token, userid, expires_in
```

### Step 3: Make Authenticated Requests

```python
ACCESS_TOKEN = "your-access-token"

client = httpx.AsyncClient(
    headers={"Authorization": f"Bearer {ACCESS_TOKEN}"},
    timeout=30.0,
)
```

### Refresh Token

```python
async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient() as c:
        response = await c.post(
            f"{BASE_URL}/v2/oauth2",
            data={
                "action": "requesttoken",
                "grant_type": "refresh_token",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "refresh_token": refresh_token,
            },
        )
        response.raise_for_status()
        data = response.json()
        if data["status"] != 0:
            raise Exception(f"Refresh error: {data['status']}")
        return data["body"]
```

## Rate Limiting

Withings applies rate limiting but does not publish specific numbers. Recommended best practices:
- Limit to 120 requests per minute
- Use webhooks (notifications) instead of polling when possible
- Check API status at: https://status.withings.com

## Methods

### Get Measurements (Weight, BP, etc.)

**Endpoint:** `POST /measure`
**Action:** `getmeas`

Retrieve body measurements from scales and blood pressure monitors.

| Parameter | Type | Default |
|---|---|---|
| `action` | `str` | **required** (`getmeas`) |
| `meastype` | `int` | `None` (filter by type) |
| `category` | `int` | `None` (1=real, 2=user-objective) |
| `startdate` | `int` | `None` (Unix timestamp) |
| `enddate` | `int` | `None` (Unix timestamp) |
| `lastupdate` | `int` | `None` (Unix timestamp) |

Measurement types:
- `1` -- Weight (kg)
- `4` -- Height (m)
- `5` -- Fat Free Mass (kg)
- `6` -- Fat Ratio (%)
- `8` -- Fat Mass Weight (kg)
- `9` -- Diastolic Blood Pressure (mmHg)
- `10` -- Systolic Blood Pressure (mmHg)
- `11` -- Heart Pulse (bpm)
- `76` -- Muscle Mass (kg)
- `77` -- Hydration (kg)
- `88` -- Bone Mass (kg)

```python
import time

params = {
    "action": "getmeas",
    "meastype": 1,  # Weight
    "category": 1,  # Real measurements only
    "startdate": int(time.time()) - 86400 * 30,  # Last 30 days
    "enddate": int(time.time()),
}
response = await client.post(f"{BASE_URL}/measure", data=params)
response.raise_for_status()
data = response.json()

if data["status"] == 0:
    for group in data["body"]["measuregrps"]:
        for measure in group["measures"]:
            if measure["type"] == 1:
                weight = measure["value"] * 10 ** measure["unit"]
                print(f"Weight: {weight:.1f} kg")
```

### Get Activity

**Endpoint:** `POST /v2/measure`
**Action:** `getactivity`

Retrieve daily activity data (steps, calories, distance).

```python
params = {
    "action": "getactivity",
    "startdateymd": "2025-01-01",
    "enddateymd": "2025-01-07",
}
response = await client.post(f"{BASE_URL}/v2/measure", data=params)
response.raise_for_status()
data = response.json()

if data["status"] == 0:
    for activity in data["body"]["activities"]:
        print(f"{activity['date']}: {activity.get('steps', 0)} steps, "
              f"{activity.get('calories', 0)} cal")
```

### Get Sleep Data

**Endpoint:** `POST /v2/sleep`
**Action:** `get`

Retrieve detailed sleep data.

```python
params = {
    "action": "get",
    "startdate": int(time.time()) - 86400,  # Yesterday
    "enddate": int(time.time()),
}
response = await client.post(f"{BASE_URL}/v2/sleep", data=params)
response.raise_for_status()
data = response.json()

if data["status"] == 0:
    for series in data["body"]["series"]:
        state_map = {0: "awake", 1: "light", 2: "deep", 3: "REM"}
        state = state_map.get(series.get("state", -1), "unknown")
        print(f"State: {state}, Duration: {series.get('enddate', 0) - series.get('startdate', 0)}s")
```

### Get Sleep Summary

**Endpoint:** `POST /v2/sleep`
**Action:** `getsummary`

```python
params = {
    "action": "getsummary",
    "startdateymd": "2025-01-01",
    "enddateymd": "2025-01-07",
}
response = await client.post(f"{BASE_URL}/v2/sleep", data=params)
response.raise_for_status()
data = response.json()

if data["status"] == 0:
    for night in data["body"]["series"]:
        duration_h = night.get("data", {}).get("total_sleep_time", 0) / 3600
        print(f"{night['date']}: {duration_h:.1f} hours sleep")
```

### Get Heart Rate (ECG)

**Endpoint:** `POST /v2/heart`
**Action:** `list`

```python
params = {
    "action": "list",
    "startdate": int(time.time()) - 86400 * 7,
    "enddate": int(time.time()),
}
response = await client.post(f"{BASE_URL}/v2/heart", data=params)
response.raise_for_status()
data = response.json()

if data["status"] == 0:
    for entry in data["body"].get("series", []):
        hr = entry.get("heart_rate", "N/A")
        print(f"HR: {hr} bpm")
```

### Get User Devices

**Endpoint:** `POST /v2/user`
**Action:** `getdevice`

```python
params = {"action": "getdevice"}
response = await client.post(f"{BASE_URL}/v2/user", data=params)
response.raise_for_status()
data = response.json()

if data["status"] == 0:
    for device in data["body"]["devices"]:
        print(f"{device['model']}: Battery {device.get('battery', 'N/A')}%")
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/measure", data={"action": "getmeas"})
    response.raise_for_status()
    data = response.json()

    # Withings uses status codes in the JSON body, not HTTP status codes
    if data["status"] != 0:
        status = data["status"]
        if status == 401:
            print("Invalid or expired access token -- refresh token")
        elif status == 293:
            print("Invalid action parameter")
        elif status == 2554:
            print("Rate limited -- slow down requests")
        elif status == 2555:
            print("IP blocked temporarily")
        elif status in (100, 101, 200, 300):
            print(f"Parameter error (status {status}): check required fields")
        else:
            print(f"Withings API error status: {status}")
except httpx.HTTPStatusError as e:
    print(f"HTTP error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- All data endpoints use **POST** (not GET) with form-encoded data
- Every request requires an `action` parameter specifying the operation
- API errors return HTTP 200 with error info in the JSON `status` field (0 = success)
- Dates use **Unix timestamps** (integers) for most endpoints, but some use `YYYY-MM-DD` (the `ymd` variants)
- Measurement values use scientific notation: `value * 10^unit` (e.g., weight 7200 with unit -2 = 72.00 kg)
- OAuth tokens are sent via `Bearer` token in Authorization header
- Token endpoint uses the `action: requesttoken` parameter (not standard OAuth paths)
- The v2 endpoints (`/v2/measure`, `/v2/sleep`, `/v2/heart`) differ from v1 (`/measure`)
- Scopes are comma-separated (not space-separated like standard OAuth)
- Heart v2 List API may return empty results for some devices
- Regional availability: some metrics are EU-only or US-only
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
