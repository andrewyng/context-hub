---
name: rest-api
description: "Indian Railway - Train Schedule, PNR Status & Live Tracking API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "indian-railway,irctc,trains,pnr,schedule,india,transport,api"
---

# Indian Railway REST API (Python / httpx)

## Golden Rule

There is **no official public IRCTC API**. IRCTC restricts API access to approved
partners and travel agencies. All publicly available Indian Railway APIs are
**community / third-party** services that scrape or aggregate data from Indian
Railways sources. Treat every third-party provider as potentially unstable --
endpoints break without notice when upstream sites change. Always wrap calls in
retry logic with exponential back-off and cache aggressively.

The best-documented, most feature-complete community option available on RapidAPI
is the **IRCTC1 API** (provider: IRCTCAPI). This document uses that as the
primary reference. A secondary option, **IndianRailAPI.com**, is documented in
the appendix.

---

## Installation

```bash
pip install httpx
```

All examples use `httpx.AsyncClient` for non-blocking I/O.  Indian Railway
endpoints are notoriously slow (1-10 s response times) so async is strongly
recommended.

```python
import httpx
import asyncio
```

---

## Base URL

### Primary: IRCTC1 on RapidAPI

| Item          | Value |
|---------------|-------|
| Host header   | `irctc1.p.rapidapi.com` |
| Base URL      | `https://irctc1.p.rapidapi.com` |
| Protocol      | HTTPS (required) |
| Response      | JSON |

### Secondary: IndianRailAPI.com

| Item          | Value |
|---------------|-------|
| Base URL      | `http://indianrailapi.com/api/v1` |
| Protocol      | HTTP (some endpoints also on HTTPS) |
| Response      | JSON |

---

## Authentication

### IRCTC1 (RapidAPI)

Authentication is via two required headers on every request:

```python
RAPIDAPI_KEY = "your-rapidapi-key-here"

HEADERS = {
    "x-rapidapi-host": "irctc1.p.rapidapi.com",
    "x-rapidapi-key": RAPIDAPI_KEY,
}
```

Get your key: sign up at <https://rapidapi.com>, subscribe to the **IRCTC1**
API (free tier available), and copy the key from the dashboard.

### IndianRailAPI.com

API key is embedded in the URL path:

```
/api/v1/{endpoint}/apikey/{YOUR_API_KEY}/...
```

Register at <https://indianrailapi.com> to obtain a key.

---

## Rate Limiting

### IRCTC1 (RapidAPI)

| Tier     | Requests / month | Rate          | Cost       |
|----------|-----------------|---------------|------------|
| Free     | ~500            | Soft limit    | $0         |
| Basic    | ~5,000          | Moderate      | ~$10/mo    |
| Pro      | ~50,000         | Higher        | varies     |

Exact limits are set by the provider and visible on the RapidAPI pricing page.
RapidAPI returns `429 Too Many Requests` when you exceed your quota.

### IndianRailAPI.com

Rate limits are not publicly documented. Expect throttling on the free tier.
Contact `info@indianrailapi.com` for commercial plans.

### Defensive Defaults

```python
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=2, max=30))
async def railway_get(client: httpx.AsyncClient, url: str, headers: dict) -> dict:
    resp = await client.get(url, headers=headers, timeout=30.0)
    resp.raise_for_status()
    return resp.json()
```

---

## Methods

All examples below target the **IRCTC1 RapidAPI** endpoints.

### 1. Trains Between Stations

```python
async def trains_between_stations(
    client: httpx.AsyncClient,
    from_code: str,
    to_code: str,
    date: str,  # "YYYY-MM-DD"
) -> dict:
    url = "https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations"
    params = {
        "fromStationCode": from_code,  # e.g. "NDLS"
        "toStationCode": to_code,      # e.g. "BRC"
        "dateOfJourney": date,         # e.g. "2026-04-15"
    }
    resp = await client.get(url, headers=HEADERS, params=params, timeout=30.0)
    resp.raise_for_status()
    return resp.json()
```

### 2. PNR Status

```python
async def get_pnr_status(client: httpx.AsyncClient, pnr: str) -> dict:
    """pnr: 10-digit PNR number from your ticket."""
    url = "https://irctc1.p.rapidapi.com/api/v3/getPNRStatus"
    params = {"pnrNumber": pnr}
    resp = await client.get(url, headers=HEADERS, params=params, timeout=30.0)
    resp.raise_for_status()
    return resp.json()
```

### 3. Live Train Status

```python
async def live_train_status(
    client: httpx.AsyncClient, train_no: str, start_day: int = 1
) -> dict:
    """start_day: 1 = today, 2 = started yesterday, etc."""
    url = "https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus"
    params = {"trainNo": train_no, "startDay": str(start_day)}
    resp = await client.get(url, headers=HEADERS, params=params, timeout=30.0)
    resp.raise_for_status()
    return resp.json()
```

### 4. Check Seat Availability

```python
async def check_seat_availability(
    client: httpx.AsyncClient,
    train_no: str,
    from_code: str,
    to_code: str,
    date: str,
    class_type: str = "SL",
    quota: str = "GN",
) -> dict:
    """
    class_type: SL, 3A, 2A, 1A, CC, EC, 2S, etc.
    quota: GN (General), TQ (Tatkal), PT (Premium Tatkal), etc.
    """
    url = "https://irctc1.p.rapidapi.com/api/v1/checkSeatAvailability"
    params = {
        "trainNo": train_no,
        "fromStationCode": from_code,
        "toStationCode": to_code,
        "date": date,
        "classType": class_type,
        "quota": quota,
    }
    resp = await client.get(url, headers=HEADERS, params=params, timeout=30.0)
    resp.raise_for_status()
    return resp.json()
```

### 5. Get Fare

```python
async def get_fare(
    client: httpx.AsyncClient,
    train_no: str,
    from_code: str,
    to_code: str,
) -> dict:
    url = "https://irctc1.p.rapidapi.com/api/v2/getFare"
    params = {
        "trainNo": train_no,
        "fromStationCode": from_code,
        "toStationCode": to_code,
    }
    resp = await client.get(url, headers=HEADERS, params=params, timeout=30.0)
    resp.raise_for_status()
    return resp.json()
```

Additional endpoints: `searchStation`, `searchTrain`, `getTrainSchedule`, `getTrainClasses`, `getTrainsByStation`, `getLiveStation` -- all follow the same GET pattern with `HEADERS` and `timeout=30.0`.

---

## Error Handling

### HTTP Status Codes

| Code | Meaning                  | Action                              |
|------|--------------------------|-------------------------------------|
| 200  | Success                  | Parse JSON body                     |
| 400  | Bad request / invalid params | Check param names & values      |
| 401  | Unauthorized             | Verify API key is valid             |
| 403  | Forbidden                | Check subscription tier             |
| 404  | Not found                | Train/PNR/station does not exist    |
| 429  | Rate limit exceeded      | Back off; wait before retrying      |
| 500  | Server error             | Upstream IRCTC may be down; retry   |
| 502  | Bad gateway              | Upstream timeout; retry with longer timeout |
| 503  | Service unavailable      | Maintenance window; retry later     |

### Recommended Error Handler

```python
import httpx

class RailwayAPIError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"HTTP {status_code}: {detail}")

async def safe_railway_get(
    client: httpx.AsyncClient,
    url: str,
    params: dict | None = None,
) -> dict:
    try:
        resp = await client.get(
            url, headers=HEADERS, params=params, timeout=30.0
        )
        resp.raise_for_status()
        data = resp.json()
        # Some endpoints wrap errors inside a 200 response
        if isinstance(data, dict) and data.get("status") is False:
            raise RailwayAPIError(200, data.get("message", "Unknown API error"))
        return data
    except httpx.HTTPStatusError as exc:
        raise RailwayAPIError(
            exc.response.status_code,
            exc.response.text[:300],
        ) from exc
    except httpx.TimeoutException as exc:
        raise RailwayAPIError(504, "Request timed out") from exc
```

---

## Common Pitfalls

### 1. Station codes, not names
All endpoints expect **uppercase station codes** (e.g. `NDLS`, `BCT`, `HWH`),
not city names. Use `searchStation` first to resolve names to codes.

### 2. Date format varies
The `trainBetweenStations` endpoint expects `YYYY-MM-DD`. Other endpoints may
accept `DD-MM-YYYY`. Always check the specific endpoint docs.

### 3. Upstream timeouts
Indian Railway servers are slow. Set `timeout=30.0` minimum. During peak hours
(8-10 AM IST / Tatkal booking window) expect even longer latencies or outright
failures.

### 4. 200 OK with error body
Some endpoints return HTTP 200 but include `"status": false` in the JSON body.
Always check the `status` field before processing results.

### 5. stale data on Live Status
`liveTrainStatus` data can lag 10-30 minutes behind real position. Do not use
for safety-critical decisions.

### 6. Tatkal window blackouts
During the Tatkal booking window (10:00-12:00 IST), IRCTC upstream servers are
under extreme load. Seat availability and PNR endpoints may return errors or
stale data. Avoid polling during this window if possible.

### 7. PNR validity
PNR numbers are **10 digits**. An invalid or expired PNR returns a 200 with an
error message, not a 404. Validate format client-side before calling.

### 8. Free tier quota burns fast
The free RapidAPI tier is limited (~500 req/month). A single user session
exploring trains can burn 10-20 requests. Implement aggressive caching
(train schedules rarely change within a day).

### 9. No booking capability
These community APIs are **read-only**. They provide schedule, status, and
availability data. Actual ticket booking requires official IRCTC partner
integration which is not publicly available.

### 10. Class type codes
Use standard Indian Railway class codes:

| Code | Class                        |
|------|------------------------------|
| 1A   | First AC                     |
| 2A   | Second AC                    |
| 3A   | Third AC                     |
| 3E   | Third AC Economy             |
| SL   | Sleeper                      |
| CC   | AC Chair Car                 |
| EC   | Executive Chair Car          |
| 2S   | Second Sitting               |
| GN   | General (unreserved)         |

---

## Appendix A: IndianRailAPI.com Endpoints

An alternative community API at `indianrailapi.com`. Registration required.

### Base URL

```
http://indianrailapi.com/api/v1
```

### Authentication

API key embedded in URL path:

```python
INDIAN_RAIL_API_KEY = "your-key-here"
BASE = "http://indianrailapi.com/api/v1"

async def ira_pnr_status(client: httpx.AsyncClient, pnr: str) -> dict:
    url = f"{BASE}/pnrstatus/apikey/{INDIAN_RAIL_API_KEY}/pnr/{pnr}/"
    resp = await client.get(url, timeout=30.0)
    resp.raise_for_status()
    return resp.json()

async def ira_train_route(client: httpx.AsyncClient, train_no: str) -> dict:
    url = f"{BASE}/trainroute/apikey/{INDIAN_RAIL_API_KEY}/trainno/{train_no}/"
    resp = await client.get(url, timeout=30.0)
    resp.raise_for_status()
    return resp.json()
```

### Available Endpoints (30+)

- Live Train Status
- PNR Check
- Live Station
- Station Search / Auto-Complete
- Seat Availability
- Train Fare
- Station Name/Code Conversion
- Train Information & Schedule
- Trains Between Stations
- Cancelled / Rescheduled / Diverted Trains
- Coach Layout & Position
- Special, Heritage & Fog-Affected Trains

### Status

The service is marked "UNDER LIMITED USE" as of March 2026. Reliability may
vary. Contact `info@indianrailapi.com` for current status.

**References:** [RapidAPI IRCTC1](https://rapidapi.com/IRCTCAPI/api/irctc1) | [IndianRailAPI.com](https://indianrailapi.com) | [GitHub topic](https://github.com/topics/indian-railways-api)
