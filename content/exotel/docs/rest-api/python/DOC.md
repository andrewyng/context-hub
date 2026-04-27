---
name: rest-api
description: "Exotel - Indian Cloud Telephony & SMS API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "exotel,telephony,voice,sms,ivr,cloud-calling,india,click-to-call,call-recording,api,integration"
---

# Exotel Cloud Telephony API

> **Golden Rule:** Exotel has no official Python SDK for REST API access. Use `httpx` with HTTP Basic Auth (`api_key:api_token`). Default response format is **XML** -- always append `.json` to endpoint paths. Base URL includes your account SID. Voice and SMS are separate endpoint families.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://<subdomain>/v1/Accounts/<your_sid>/
```

| Cluster | Subdomain |
|---|---|
| Mumbai (India) | `api.in.exotel.com` |
| Singapore | `api.exotel.com` |

## Authentication

**Type:** HTTP Basic Auth (API Key + API Token)

```python
import httpx

API_KEY = "your-exotel-api-key"
API_TOKEN = "your-exotel-api-token"
SID = "your-account-sid"
SUBDOMAIN = "api.in.exotel.com"  # or api.exotel.com
BASE_URL = f"https://{SUBDOMAIN}/v1/Accounts/{SID}"

client = httpx.AsyncClient(auth=(API_KEY, API_TOKEN), timeout=30.0)
```

**Important:** Get credentials from Exotel Dashboard > API Settings.

## Rate Limiting

| API Type | Limit |
|---|---|
| Voice APIs | 200 calls/minute |
| SMS APIs | Platform-dependent (HTTP 503 when exceeded) |

## Methods

### `make_call`

**Endpoint:** `POST /v1/Accounts/{sid}/Calls/connect.json`

Connect two phone numbers. Calls the `From` number first; once answered, connects to `To`.

| Parameter | Type | Default |
|---|---|---|
| `From` | `str` | **required** (agent number) |
| `To` | `str` | **required** (customer number) |
| `CallerId` | `str` | **required** (ExoPhone virtual number) |
| `CallType` | `str` | `None` (`trans` for transactional) |
| `TimeLimit` | `int` | `None` (max 14400 = 4 hours) |
| `TimeOut` | `int` | `None` (ring timeout in seconds) |
| `Record` | `bool` | `None` |
| `StatusCallback` | `str` | `None` (webhook URL) |

**Returns:** JSON with `Call` object containing `Sid`, `Status`, `Direction`

```python
data = {
    "From": "09876543210",
    "To": "09123456789",
    "CallerId": "0XXXXXXX4890",
    "Record": "true"
}
response = await client.post(f"{BASE_URL}/Calls/connect.json", data=data)
response.raise_for_status()
call = response.json()
call_sid = call["Call"]["Sid"]
call_status = call["Call"]["Status"]  # "queued"
```

### `connect_to_ivr`

**Endpoint:** `POST /v1/Accounts/{sid}/Calls/connect.json`

Call a number and connect to an IVR/Applet flow.

```python
data = {
    "From": "09876543210",
    "CallerId": "0XXXXXXX4890",
    "Url": f"http://my.exotel.com/{SID}/exoml/start_voice/your_app_id"
}
response = await client.post(f"{BASE_URL}/Calls/connect.json", data=data)
response.raise_for_status()
```

### `get_call_details`

**Endpoint:** `GET /v1/Accounts/{sid}/Calls/{call_sid}.json`

Retrieve details and status of a specific call.

| Parameter | Type | Default |
|---|---|---|
| `details` | `str` | `None` (`true` for leg-wise breakdown) |
| `RecordingUrlValidity` | `int` | `None` (5-60 minutes for pre-signed URL) |

**Returns:** JSON with `Call` object including `Duration`, `Price`, `RecordingUrl`, `Status`

```python
call_sid = "unique-call-id"
response = await client.get(
    f"{BASE_URL}/Calls/{call_sid}.json",
    params={"details": "true"}
)
response.raise_for_status()
call = response.json()
status = call["Call"]["Status"]  # "completed", "failed", "busy", "no-answer"
duration = call["Call"]["Duration"]
recording = call["Call"]["RecordingUrl"]
```

### `list_calls`

**Endpoint:** `GET /v1/Accounts/{sid}/Calls.json`

Query calls with filters and pagination.

| Parameter | Type | Default |
|---|---|---|
| `Status` | `str` | `None` (`completed`, `failed`, `busy`, `no-answer`) |
| `DateCreated` | `str` | `None` (range: `gte:YYYY-MM-DD`, `lte:YYYY-MM-DD`) |
| `PageSize` | `int` | `50` (max 100) |
| `SortBy` | `str` | `DateCreated:desc` |

```python
params = {
    "Status": "completed",
    "PageSize": 50,
    "SortBy": "DateCreated:desc"
}
response = await client.get(f"{BASE_URL}/Calls.json", params=params)
response.raise_for_status()
data = response.json()
calls = data["Calls"]
total = data["Metadata"]["Total"]
```

### `send_sms`

**Endpoint:** `POST /v1/Accounts/{sid}/Sms/send.json`

Send an SMS message.

| Parameter | Type | Default |
|---|---|---|
| `From` | `str` | **required** (ExoPhone or Sender ID) |
| `To` | `str` | **required** (recipient number) |
| `Body` | `str` | **required** (max 2000 chars) |
| `DltEntityId` | `str` | **required for India** (DLT registration ID) |
| `Priority` | `str` | `normal` (`high` for OTP only) |
| `StatusCallback` | `str` | `None` (webhook URL) |

**Returns:** JSON with `SMSMessage` containing `Sid`, `Status`, `SmsUnits`

```python
data = {
    "From": "0XXXXXXX4890",
    "To": "09123456789",
    "Body": "Your OTP is 123456",
    "DltEntityId": "your-dlt-entity-id"
}
response = await client.post(f"{BASE_URL}/Sms/send.json", data=data)
response.raise_for_status()
sms = response.json()
sms_sid = sms["SMSMessage"]["Sid"]
sms_status = sms["SMSMessage"]["Status"]  # "queued"
```

### `get_number_info`

**Endpoint:** `GET /v1/Accounts/{sid}/Numbers/{phone_number}.json`

Look up metadata for a phone number (operator, circle, DND status).

```python
phone = "09123456789"
response = await client.get(f"{BASE_URL}/Numbers/{phone}.json")
response.raise_for_status()
info = response.json()
operator = info["Number"]["OperatorName"]  # "Reliance Jio"
circle = info["Number"]["CircleName"]      # "Maharashtra"
is_dnd = info["Number"]["DND"]             # "Yes" or "No"
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/Calls/connect.json", data=data)
    response.raise_for_status()
    result = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Auth failed -- check API key and token")
    elif e.response.status_code == 402:
        print("Payment required -- plan limit exceeded")
    elif e.response.status_code == 429:
        print("Rate limited -- max 200 calls/minute")
    elif e.response.status_code == 503:
        print("SMS platform limit exceeded -- retry later")
    else:
        print(f"Exotel error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- **Default response is XML** -- always append `.json` to endpoint paths (e.g., `Calls/connect.json`, not `Calls/connect`)
- HTTP 200 does **not** mean a successful call -- it only means the API accepted the request; check the `Status` field
- Call details (`Duration`, `Price`, `EndTime`) are populated **~2 minutes after call ends** -- use StatusCallback or poll
- **ExoPhones** are virtual numbers from the Exotel dashboard -- you need one as `CallerId`
- Phone numbers use E.164 format; landlines need STD code prefix (e.g., `080XXXX2400`)
- **DLT compliance is mandatory for SMS in India** -- include `DltEntityId` and use DLT-approved templates
- Call recordings are returned as MP3 URLs; use `RecordingUrlValidity` (5-60 min) for pre-signed secure URLs
- `TimeLimit` max is 14400 seconds (4 hours)
- SMS status values: `queued` → `sending` → `submitted` → `sent` or `failed`/`failed-dnd`
- Set `StatusCallbackContentType` to `application/json` if you want JSON webhook payloads (default is `multipart/form-data`)
