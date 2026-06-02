---
name: rest-api
description: "Fitbit Web API for health and fitness data (activity, heart rate, sleep, SpO2)"
metadata:
  languages: "python"
  versions: "1.2.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "fitbit,health,fitness,wearable,sleep,heart-rate,steps,api"
---

# Fitbit Web API

> **Golden Rule:** Fitbit has no official Python REST client. Use `httpx` (async) for direct REST API access. All data endpoints are GET returning JSON. Authentication uses OAuth 2.0 Authorization Code Grant with PKCE. Rate limit is 150 requests/hour per user. Access tokens last 8 hours; use refresh tokens for renewal.

## Installation

```bash
pip install httpx
```

## Base URL

`https://api.fitbit.com`

OAuth authorize URL: `https://www.fitbit.com/oauth2/authorize`
Token endpoint: `https://api.fitbit.com/oauth2/token`

Register your app at: https://dev.fitbit.com/apps/new

## Authentication

**Type:** OAuth 2.0 Authorization Code Grant with PKCE (RFC 7636)

### Step 1: Generate PKCE Credentials

```python
import hashlib
import base64
import secrets

code_verifier = secrets.token_urlsafe(64)[:128]
code_challenge = base64.urlsafe_b64encode(
    hashlib.sha256(code_verifier.encode()).digest()
).rstrip(b"=").decode()
```

### Step 2: Build Authorization URL

```python
CLIENT_ID = "your-client-id"
REDIRECT_URI = "https://your-app.com/callback"
SCOPES = "activity heartrate sleep oxygen_saturation profile weight temperature respiratory_rate"

auth_url = (
    f"https://www.fitbit.com/oauth2/authorize"
    f"?response_type=code"
    f"&client_id={CLIENT_ID}"
    f"&redirect_uri={REDIRECT_URI}"
    f"&scope={SCOPES}"
    f"&code_challenge={code_challenge}"
    f"&code_challenge_method=S256"
)
# Direct user to auth_url in browser
```

### Step 3: Exchange Code for Tokens

```python
import httpx

CLIENT_SECRET = "your-client-secret"

async def exchange_code(authorization_code: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.fitbit.com/oauth2/token",
            data={
                "grant_type": "authorization_code",
                "code": authorization_code,
                "redirect_uri": REDIRECT_URI,
                "code_verifier": code_verifier,
                "client_id": CLIENT_ID,
            },
            auth=(CLIENT_ID, CLIENT_SECRET),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        return response.json()
        # Returns: access_token, refresh_token, user_id, expires_in (28800s = 8h)
```

### Step 4: Make Authenticated Requests

```python
ACCESS_TOKEN = "your-access-token"

client = httpx.AsyncClient(
    base_url="https://api.fitbit.com",
    headers={"Authorization": f"Bearer {ACCESS_TOKEN}"},
    timeout=30.0,
)
```

### Refresh Token

```python
async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.fitbit.com/oauth2/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": CLIENT_ID,
            },
            auth=(CLIENT_ID, CLIENT_SECRET),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        return response.json()
```

## Rate Limiting

| Scope | Limit |
|---|---|
| Per user | 150 requests/hour |
| Reset | Top of each hour |

Rate limit headers (approximate, async-updated):
- `Fitbit-Rate-Limit-Limit`: Max requests per hour
- `Fitbit-Rate-Limit-Remaining`: Remaining requests
- `Fitbit-Rate-Limit-Reset`: Seconds until reset

## Methods

### Activity (Daily Summary)

**Endpoint:** `GET /1/user/-/activities/date/{date}.json`

```python
# Get today's activity summary
response = await client.get("/1/user/-/activities/date/today.json")
response.raise_for_status()
data = response.json()
summary = data.get("summary", {})
print(f"Steps: {summary.get('steps', 0)}")
print(f"Calories: {summary.get('caloriesOut', 0)}")
print(f"Active minutes: {summary.get('fairlyActiveMinutes', 0) + summary.get('veryActiveMinutes', 0)}")
```

### Activity Time Series

**Endpoint:** `GET /1/user/-/activities/{resource}/date/{start}/{end}.json`

Resources: `steps`, `calories`, `distance`, `floors`, `minutesSedentary`, `minutesLightlyActive`, `minutesFairlyActive`, `minutesVeryActive`

```python
# Get steps for the past week
response = await client.get("/1/user/-/activities/steps/date/today/7d.json")
response.raise_for_status()
data = response.json()
for day in data.get("activities-steps", []):
    print(f"{day['dateTime']}: {day['value']} steps")
```

### Heart Rate Time Series

**Endpoint:** `GET /1/user/-/activities/heart/date/{start}/{end}.json`

```python
# Get heart rate data for the past 7 days
response = await client.get("/1/user/-/activities/heart/date/today/7d.json")
response.raise_for_status()
data = response.json()
for day in data.get("activities-heart", []):
    resting = day.get("value", {}).get("restingHeartRate", "N/A")
    print(f"{day['dateTime']}: Resting HR {resting} bpm")
```

### Heart Rate Intraday

**Endpoint:** `GET /1/user/-/activities/heart/date/{date}/1d/1min.json`

```python
# Get minute-by-minute heart rate for today
response = await client.get("/1/user/-/activities/heart/date/today/1d/1min.json")
response.raise_for_status()
data = response.json()
intraday = data.get("activities-heart-intraday", {}).get("dataset", [])
for entry in intraday[:5]:
    print(f"{entry['time']}: {entry['value']} bpm")
```

### Sleep Log

**Endpoint:** `GET /1.2/user/-/sleep/date/{date}.json`

```python
# Get last night's sleep data
response = await client.get("/1.2/user/-/sleep/date/today.json")
response.raise_for_status()
data = response.json()
for sleep in data.get("sleep", []):
    print(f"Duration: {sleep.get('duration', 0) / 3600000:.1f} hours")
    print(f"Efficiency: {sleep.get('efficiency', 'N/A')}%")
    levels = sleep.get("levels", {}).get("summary", {})
    for stage, info in levels.items():
        print(f"  {stage}: {info.get('minutes', 0)} min")
```

### Sleep Time Series

**Endpoint:** `GET /1.2/user/-/sleep/date/{start}/{end}.json`

```python
# Get sleep data for the past week
response = await client.get("/1.2/user/-/sleep/date/2025-01-01/2025-01-07.json")
response.raise_for_status()
data = response.json()
```

### SpO2 (Blood Oxygen)

**Endpoint:** `GET /1/user/-/spo2/date/{date}.json`

```python
response = await client.get("/1/user/-/spo2/date/today.json")
response.raise_for_status()
data = response.json()
print(f"SpO2: {data.get('value', {}).get('avg', 'N/A')}%")
```

### Breathing Rate

**Endpoint:** `GET /1/user/-/br/date/{date}.json`

```python
response = await client.get("/1/user/-/br/date/today.json")
response.raise_for_status()
data = response.json()
for entry in data.get("br", []):
    rate = entry.get("value", {}).get("breathingRate", "N/A")
    print(f"Breathing rate: {rate} breaths/min")
```

### Temperature (Skin)

**Endpoint:** `GET /1/user/-/temp/skin/date/{date}.json`

```python
response = await client.get("/1/user/-/temp/skin/date/today.json")
response.raise_for_status()
data = response.json()
```

### User Profile

**Endpoint:** `GET /1/user/-/profile.json`

```python
response = await client.get("/1/user/-/profile.json")
response.raise_for_status()
data = response.json()
user = data.get("user", {})
print(f"Name: {user.get('displayName', 'N/A')}")
print(f"Age: {user.get('age', 'N/A')}")
```

### Devices

**Endpoint:** `GET /1/user/-/devices.json`

```python
response = await client.get("/1/user/-/devices.json")
response.raise_for_status()
devices = response.json()
for device in devices:
    print(f"{device['deviceVersion']} - Battery: {device['battery']}")
```

## Error Handling

```python
import httpx

try:
    response = await client.get("/1/user/-/activities/date/today.json")
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Access token expired -- refresh with refresh_token")
    elif e.response.status_code == 429:
        reset = e.response.headers.get("Fitbit-Rate-Limit-Reset", "unknown")
        print(f"Rate limited -- retry after {reset} seconds")
    elif e.response.status_code == 403:
        print("Insufficient scope -- check OAuth scopes requested")
    elif e.response.status_code == 400:
        print(f"Bad request: {e.response.text}")
    else:
        print(f"Fitbit API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- All data endpoints use **GET** (not POST)
- The `-` in `/user/-/` means "current authenticated user"
- Date format is `YYYY-MM-DD` or the string `today`
- Period shortcuts: `1d`, `7d`, `30d`, `1w`, `1m`, `3m`, `6m`, `1y`
- Sleep endpoints use API version **1.2** (`/1.2/user/...`), others use **1**
- Access tokens expire after 8 hours; always implement refresh token flow
- Rate limit is **per user** (150/hour), not per app -- track per-user usage
- Rate limit headers are approximate and asynchronously updated
- OAuth requires PKCE (code_challenge) -- plain authorization code flow is not supported
- Intraday data (minute-level) requires special app permissions or personal app type
- Scopes must be explicitly requested at authorization time -- cannot be added later
- Token endpoint requires `Content-Type: application/x-www-form-urlencoded` (not JSON)
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
