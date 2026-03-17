---
name: rest-api
description: "Amadeus - Flight Search, Hotel Search & Travel Intelligence REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "amadeus,travel,flights,hotels,booking,airline,api"
---

# Amadeus Self-Service REST API (Python / httpx)

## Golden Rule

Always use the **test environment** (`test.api.amadeus.com`) during development. OAuth tokens expire after **30 minutes** -- cache and refresh them. Every booking flow is three steps: **Search -> Price -> Book**. Never skip the Price confirmation step before booking.

## Installation

```bash
pip install httpx
```

The official `amadeus` Python SDK exists (`pip install amadeus`), but this guide uses raw `httpx` async calls for full control.

## Base URL

| Environment | Base URL                          |
|-------------|-----------------------------------|
| Test        | `https://test.api.amadeus.com`    |
| Production  | `https://api.amadeus.com`         |

## Authentication

OAuth 2.0 **client_credentials** grant. Obtain `client_id` and `client_secret` by creating a free account at <https://developers.amadeus.com/register>.

### Token Request

```python
import httpx
from datetime import datetime, timedelta

class AmadeusAuth:
    def __init__(self, client_id: str, client_secret: str, *, test: bool = True):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base = "https://test.api.amadeus.com" if test else "https://api.amadeus.com"
        self._token: str | None = None
        self._expires_at: datetime = datetime.min

    async def get_token(self, client: httpx.AsyncClient) -> str:
        if self._token and datetime.now() < self._expires_at:
            return self._token
        resp = await client.post(
            f"{self.base}/v1/security/oauth2/token",
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        body = resp.json()
        self._token = body["access_token"]
        self._expires_at = datetime.now() + timedelta(seconds=body["expires_in"] - 60)
        return self._token

    async def auth_headers(self, client: httpx.AsyncClient) -> dict[str, str]:
        token = await self.get_token(client)
        return {"Authorization": f"Bearer {token}"}
```

## Rate Limiting

| Environment | Limit                       |
|-------------|-----------------------------|
| Test        | 10 requests/sec per user    |
| Production  | 40 requests/sec per user    |
| AI/Partner  | 20 requests/sec per user    |

No more than 1 request every 100 ms (50 ms for AI/Partner APIs). Test environment also has a monthly free-tier call quota. Exceeding limits returns HTTP **429**.

## Methods

### Flight Offers Search

```python
async def search_flights(
    auth: AmadeusAuth,
    origin: str,
    destination: str,
    departure_date: str,
    adults: int = 1,
    *,
    return_date: str | None = None,
    max_results: int = 10,
) -> dict:
    async with httpx.AsyncClient() as client:
        headers = await auth.auth_headers(client)
        params = {
            "originLocationCode": origin,
            "destinationLocationCode": destination,
            "departureDate": departure_date,
            "adults": adults,
            "max": max_results,
        }
        if return_date:
            params["returnDate"] = return_date
        resp = await client.get(
            f"{auth.base}/v2/shopping/flight-offers",
            headers=headers,
            params=params,
        )
        resp.raise_for_status()
        return resp.json()
```

### Flight Price Confirmation

```python
async def confirm_price(auth: AmadeusAuth, flight_offer: dict) -> dict:
    async with httpx.AsyncClient() as client:
        headers = await auth.auth_headers(client)
        headers["Content-Type"] = "application/json"
        resp = await client.post(
            f"{auth.base}/v1/shopping/flight-offers/pricing",
            headers=headers,
            json={"data": {"type": "flight-offers-pricing", "flightOffers": [flight_offer]}},
        )
        resp.raise_for_status()
        return resp.json()
```

### Flight Order (Booking)

```python
async def book_flight(
    auth: AmadeusAuth,
    flight_offer: dict,
    travelers: list[dict],
) -> dict:
    async with httpx.AsyncClient() as client:
        headers = await auth.auth_headers(client)
        headers["Content-Type"] = "application/json"
        resp = await client.post(
            f"{auth.base}/v1/booking/flight-orders",
            headers=headers,
            json={
                "data": {
                    "type": "flight-order",
                    "flightOffers": [flight_offer],
                    "travelers": travelers,
                }
            },
        )
        resp.raise_for_status()
        return resp.json()
```

### Hotel Search by City

```python
async def search_hotels_by_city(
    auth: AmadeusAuth,
    city_code: str,
    radius: int = 5,
    radius_unit: str = "KM",
) -> dict:
    async with httpx.AsyncClient() as client:
        headers = await auth.auth_headers(client)
        resp = await client.get(
            f"{auth.base}/v1/reference-data/locations/hotels/by-city",
            headers=headers,
            params={
                "cityCode": city_code,
                "radius": radius,
                "radiusUnit": radius_unit,
            },
        )
        resp.raise_for_status()
        return resp.json()
```

### Hotel Offers (Pricing/Availability)

```python
async def get_hotel_offers(
    auth: AmadeusAuth,
    hotel_ids: list[str],
    check_in: str,
    check_out: str,
    adults: int = 1,
) -> dict:
    async with httpx.AsyncClient() as client:
        headers = await auth.auth_headers(client)
        resp = await client.get(
            f"{auth.base}/v3/shopping/hotel-offers",
            headers=headers,
            params={
                "hotelIds": ",".join(hotel_ids),
                "checkInDate": check_in,
                "checkOutDate": check_out,
                "adults": adults,
            },
        )
        resp.raise_for_status()
        return resp.json()
```

### Airport/City Autocomplete

```python
async def location_search(
    auth: AmadeusAuth,
    keyword: str,
    sub_type: str = "CITY,AIRPORT",
) -> dict:
    async with httpx.AsyncClient() as client:
        headers = await auth.auth_headers(client)
        resp = await client.get(
            f"{auth.base}/v1/reference-data/locations",
            headers=headers,
            params={"keyword": keyword, "subType": sub_type},
        )
        resp.raise_for_status()
        return resp.json()
```

### Key Endpoint Reference

| Category        | Endpoint                                                  | Method |
|-----------------|-----------------------------------------------------------|--------|
| Flight Search   | `/v2/shopping/flight-offers`                              | GET    |
| Flight Pricing  | `/v1/shopping/flight-offers/pricing`                      | POST   |
| Flight Booking  | `/v1/booking/flight-orders`                               | POST   |
| Flight Order    | `/v1/booking/flight-orders/{orderId}`                     | GET    |
| Seat Maps       | `/v1/shopping/seatmaps`                                   | GET/POST |
| Cheapest Dates  | `/v1/shopping/flight-dates`                               | GET    |
| Inspiration     | `/v1/shopping/flight-destinations`                        | GET    |
| Hotels by City  | `/v1/reference-data/locations/hotels/by-city`             | GET    |
| Hotels by Geo   | `/v1/reference-data/locations/hotels/by-geocode`          | GET    |
| Hotel Offers    | `/v3/shopping/hotel-offers`                               | GET    |
| Hotel Booking   | `/v2/booking/hotel-orders`                                | POST   |
| Hotel Ratings   | `/v2/e-reputation/hotel-sentiments`                       | GET    |
| Location Search | `/v1/reference-data/locations`                            | GET    |
| Airlines        | `/v1/reference-data/airlines`                             | GET    |
| Check-in Links  | `/v2/reference-data/urls/checkin-links`                   | GET    |
| Activities      | `/v1/shopping/activities`                                 | GET    |
| Transfers       | `/v1/shopping/transfer-offers`                            | POST   |
| Trip Purpose    | `/v1/travel/predictions/trip-purpose`                     | GET    |
| Flight Delay    | `/v1/travel/predictions/flight-delay`                     | GET    |
| Air Traffic     | `/v1/travel/analytics/air-traffic/booked`                 | GET    |

## Error Handling

```python
import httpx

async def safe_amadeus_request(auth: AmadeusAuth, method: str, path: str, **kwargs) -> dict:
    async with httpx.AsyncClient() as client:
        headers = await auth.auth_headers(client)
        headers.update(kwargs.pop("headers", {}))
        resp = await getattr(client, method)(
            f"{auth.base}{path}", headers=headers, **kwargs
        )
        if resp.status_code == 401:
            # Token expired -- force refresh and retry once
            auth._token = None
            headers = await auth.auth_headers(client)
            headers.update(kwargs.pop("headers", {}))
            resp = await getattr(client, method)(
                f"{auth.base}{path}", headers=headers, **kwargs
            )
        if resp.status_code == 429:
            raise RuntimeError("Rate limit exceeded -- back off and retry")
        resp.raise_for_status()
        return resp.json()
```

### HTTP Status Code Reference

| Status | Amadeus Code | Meaning                        |
|--------|--------------|--------------------------------|
| 400    | 477          | Invalid format (bad IATA code) |
| 401    | 38190        | Invalid/expired access token   |
| 401    | 38192        | Access token expired           |
| 403    | 38197        | HTTPS required or forbidden    |
| 404    | 38196        | Resource/endpoint not found    |
| 429    | 38194        | Rate limit exceeded            |
| 429    | 38195        | Monthly quota exceeded         |
| 500    | 38189        | Internal server error          |

Error response body format:

```json
{
  "errors": [
    {
      "status": 400,
      "code": 477,
      "title": "INVALID FORMAT",
      "detail": "invalid city/airport code",
      "source": { "parameter": "originLocationCode" }
    }
  ]
}
```

## Common Pitfalls

1. **Tokens expire after 30 minutes.** Always cache the token and check expiry before each request. Do not request a new token on every call.
2. **Test environment has a monthly free-tier quota.** Exceeding it returns 429 until the next month. Monitor usage in the developer dashboard.
3. **IATA codes are required**, not city names. Use the Location Search endpoint to resolve city names to IATA codes first.
4. **The booking flow is three steps.** Search returns offers, but prices are not guaranteed until you call the Pricing endpoint. Only then call the Booking endpoint.
5. **Dates must be ISO 8601 format** (`YYYY-MM-DD`). Past dates return error code 4926.
6. **Hotel IDs must be obtained first** from the hotel-list endpoints (by-city, by-geocode, by-hotels) before querying offers.
7. **Production requires a separate key.** Test keys do not work on `api.amadeus.com`. You must request production access through the developer portal.
8. **All requests must use HTTPS.** HTTP requests return 403.
