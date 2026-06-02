---
name: rest-api
description: "Skyscanner - Flight, Hotel & Car Hire Search API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "skyscanner,flights,travel,search,comparison,api"
---

# Skyscanner Travel API (Python / httpx)

## Golden Rule

This is a **partner-only API**. You must apply at <https://www.partners.skyscanner.net/contact/general> and be approved before receiving an API key. There is no public self-serve signup. All flight searches are **two-step**: call `/create` to initiate, then `/poll` with the session token to get complete results. Always poll until `status` is `RESULT_STATUS_COMPLETE`.

## Installation

```bash
pip install httpx
```

No official Python SDK exists. Use raw `httpx` async calls against the REST endpoints.

## Base URL

```
https://partners.api.skyscanner.net/apiservices/v3/
```

All requests must use **HTTPS**.

## Authentication

API key passed via the `x-api-key` request header. Obtain your key by applying through the Skyscanner Partners portal and being approved by their partnerships team.

```python
import httpx

BASE_URL = "https://partners.api.skyscanner.net/apiservices/v3"

def skyscanner_headers(api_key: str) -> dict[str, str]:
    return {
        "x-api-key": api_key,
        "Content-Type": "application/json",
    }
```

## Rate Limiting

Rate limits are set per partner agreement and are not publicly documented. Exceeding your allocation will result in HTTP **429** responses. Contact your account manager for specific thresholds.

## Methods

### Flights Live Search -- Create

Initiates a real-time flight search. Returns a `sessionToken` and an initial (possibly incomplete) set of cached results.

```python
async def create_flight_search(
    api_key: str,
    origin_iata: str,
    destination_iata: str,
    year: int,
    month: int,
    day: int,
    adults: int = 1,
    cabin_class: str = "CABIN_CLASS_ECONOMY",
    *,
    market: str = "US",
    locale: str = "en-US",
    currency: str = "USD",
) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/flights/live/search/create",
            headers=skyscanner_headers(api_key),
            json={
                "query": {
                    "market": market,
                    "locale": locale,
                    "currency": currency,
                    "queryLegs": [
                        {
                            "originPlaceId": {"iata": origin_iata},
                            "destinationPlaceId": {"iata": destination_iata},
                            "date": {"year": year, "month": month, "day": day},
                        }
                    ],
                    "adults": adults,
                    "cabinClass": cabin_class,
                }
            },
        )
        resp.raise_for_status()
        return resp.json()
```

### Flights Live Search -- Poll

Polls for the complete set of results using the session token from the create step.

```python
import asyncio

async def poll_flight_search(
    api_key: str,
    session_token: str,
    max_polls: int = 10,
    poll_interval: float = 1.0,
) -> dict:
    async with httpx.AsyncClient() as client:
        for _ in range(max_polls):
            resp = await client.post(
                f"{BASE_URL}/flights/live/search/poll/{session_token}",
                headers=skyscanner_headers(api_key),
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("status") == "RESULT_STATUS_COMPLETE":
                return data
            await asyncio.sleep(poll_interval)
        return data  # Return last partial result
```

### Full Flight Search Convenience

```python
async def search_flights(
    api_key: str,
    origin: str,
    destination: str,
    year: int,
    month: int,
    day: int,
    **kwargs,
) -> dict:
    create_resp = await create_flight_search(
        api_key, origin, destination, year, month, day, **kwargs
    )
    session_token = create_resp["sessionToken"]
    return await poll_flight_search(api_key, session_token)
```

### Flights Indicative Prices

Returns estimated/historical prices without querying live inventory. More flexible date ranges.

```python
async def indicative_search(
    api_key: str,
    origin_iata: str,
    destination_iata: str,
    year: int,
    month: int,
    *,
    market: str = "US",
    locale: str = "en-US",
    currency: str = "USD",
) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/flights/indicative/search",
            headers=skyscanner_headers(api_key),
            json={
                "query": {
                    "market": market,
                    "locale": locale,
                    "currency": currency,
                    "dateTimeGroupingType": "DATE_TIME_GROUPING_TYPE_BY_MONTH",
                    "queryLegs": [
                        {
                            "originPlace": {"queryPlace": {"iata": origin_iata}},
                            "destinationPlace": {"queryPlace": {"iata": destination_iata}},
                            "anytime": True,
                        }
                    ],
                }
            },
        )
        resp.raise_for_status()
        return resp.json()
```

### Key Endpoint Reference

| Category               | Endpoint                                              | Method |
|------------------------|-------------------------------------------------------|--------|
| Flights Live Create    | `/v3/flights/live/search/create`                      | POST   |
| Flights Live Poll      | `/v3/flights/live/search/poll/{sessionToken}`          | POST   |
| Flights Indicative     | `/v3/flights/indicative/search`                       | POST   |
| Car Hire Live          | `/v3/carhire/live/search/create`                      | POST   |
| Car Hire Indicative    | `/v3/carhire/indicative/search`                       | POST   |
| Car Hire Agents        | `/v3/carhire/agents`                                  | GET    |
| Hotels Live            | `/v3/hotels/live/search/create`                       | POST   |
| Hotels Indicative      | `/v3/hotels/indicative/search`                        | POST   |
| Hotels Content         | `/v3/hotels/content`                                  | GET    |
| Hotels Reviews         | `/v3/hotels/reviews`                                  | GET    |
| Culture                | `/v3/culture/markets/{locale}`                        | GET    |
| Geo                    | `/v3/geo/hierarchy/flights/{locale}`                  | GET    |
| Carriers               | `/v3/carriers`                                        | GET    |
| Autosuggest Flights    | `/v3/autosuggest/flights`                             | POST   |

## Error Handling

```python
async def safe_skyscanner_request(
    api_key: str,
    method: str,
    path: str,
    **kwargs,
) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await getattr(client, method)(
            f"{BASE_URL}{path}",
            headers=skyscanner_headers(api_key),
            **kwargs,
        )
        if resp.status_code == 401:
            raise PermissionError("Invalid or missing API key")
        if resp.status_code == 403:
            raise PermissionError("Access forbidden -- check partner permissions")
        if resp.status_code == 429:
            raise RuntimeError("Rate limit exceeded -- back off and retry")
        resp.raise_for_status()
        return resp.json()
```

### HTTP Status Codes

| Status | Meaning                                    |
|--------|--------------------------------------------|
| 200    | Success                                    |
| 400    | Bad request (malformed query)              |
| 401    | Invalid or missing API key                 |
| 403    | Forbidden (insufficient partner access)    |
| 429    | Rate limit exceeded                        |
| 500    | Internal server error                      |

## Common Pitfalls

1. **Partner-only access.** There is no public API key. You must be an approved Skyscanner partner. Application at <https://www.partners.skyscanner.net/contact/general>.
2. **Two-step search pattern.** Live searches require `/create` then `/poll`. The first response from `/create` is often incomplete. Always poll until `status` is `RESULT_STATUS_COMPLETE`.
3. **Session tokens expire after ~1 hour.** Do not cache session tokens across user sessions.
4. **Market, locale, and currency are required** on every search request. These control response localization and available routes.
5. **Place IDs use IATA codes** wrapped in `{"iata": "LHR"}` objects, not plain strings.
6. **Dates use structured objects** `{"year": 2026, "month": 3, "day": 17}`, not ISO date strings.
7. **All endpoints are POST** for search operations (even reads). GET is used only for reference data (carriers, geo, culture).
8. **Never expose your API key** in client-side code. All requests must be server-side.
