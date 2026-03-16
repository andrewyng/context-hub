---
name: mcp
description: "MCP server for live flight search across 400+ airlines. 75 direct airline connectors run locally (no API key), plus GDS/NDC sources (Amadeus, Duffel, Sabre) with optional API key. Search, compare, unlock, and book flights."
metadata:
  languages: "javascript"
  versions: "1.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: maintainer
  tags: "letsfg,mcp,flights,travel,airlines,booking,search"
---
# LetsFG MCP Server

MCP server for real-time flight search and booking. 75 airline connectors run locally via Playwright (Ryanair, EasyJet, Wizz Air, Southwest, AirAsia, Norwegian, and 69 more). Optional API key adds GDS/NDC sources (Amadeus, Duffel, Sabre, Travelport) covering 400+ airlines total.

## Installation

```bash
npm install -g letsfg-mcp
```

Requires Playwright browsers:

```bash
npx playwright install chromium
```

## MCP Configuration

Add to your MCP client config (Claude Desktop, VS Code, Cursor, etc.):

```json
{
  "mcpServers": {
    "letsfg": {
      "command": "npx",
      "args": ["-y", "letsfg-mcp"],
      "env": {
        "LETSFG_API_KEY": ""
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LETSFG_API_KEY` | No | API key for GDS/NDC sources. Free registration: `letsfg register --email you@example.com`. Without it, only local connectors run. |
| `LETSFG_MAX_BROWSERS` | No | Max concurrent browser instances (1–32). Auto-detected from system RAM. |
| `LETSFG_BASE_URL` | No | API endpoint override. Default: `https://api.letsfg.co` |

## Tools

### search_flights

Search live flight availability and prices. Fires 75 airline connectors in parallel on the local machine — no API key needed.

```javascript
// Minimal search
const result = await mcp.callTool("search_flights", {
  origin: "LON",
  destination: "BCN",
  date_from: "2026-06-15"
});

// Round trip with options
const result = await mcp.callTool("search_flights", {
  origin: "JFK",
  destination: "LAX",
  date_from: "2026-07-01",
  return_from: "2026-07-08",
  adults: 2,
  cabin_class: "M",
  currency: "USD",
  max_results: 5
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `origin` | string | Yes | IATA code (e.g., `LON`, `JFK`). Use `resolve_location` if you have a city name. |
| `destination` | string | Yes | IATA code (e.g., `BCN`, `LAX`) |
| `date_from` | string | Yes | Departure date `YYYY-MM-DD` |
| `return_from` | string | No | Return date `YYYY-MM-DD`. Omit for one-way. |
| `adults` | integer | No | Number of adults. Default: 1 |
| `children` | integer | No | Children aged 2-11. Default: 0 |
| `cabin_class` | string | No | `M` economy, `W` premium, `C` business, `F` first |
| `currency` | string | No | `EUR`, `USD`, `GBP`, etc. Default: `EUR` |
| `max_results` | integer | No | Max offers returned. Default: 10 |
| `max_browsers` | integer | No | Concurrent browser processes (1-32). Auto-detected. |

**Response structure:**

```json
{
  "search_id": "srch_abc123",
  "total_results": 42,
  "offers": [
    {
      "offer_id": "off_xyz789",
      "price": 45.99,
      "currency": "EUR",
      "airlines": ["FR"],
      "outbound": {
        "segments": [
          {
            "airline": "FR",
            "flight_no": "FR1234",
            "origin": "STN",
            "destination": "BCN",
            "departure": "2026-06-15T06:30:00",
            "arrival": "2026-06-15T09:45:00"
          }
        ],
        "total_duration_seconds": 9900,
        "stopovers": 0
      },
      "booking_url": "https://www.ryanair.com/..."
    }
  ],
  "passenger_ids": ["pas_001"]
}
```

Multi-airport expansion: searching `LON` automatically checks Heathrow, Gatwick, Stansted, Luton, Southend. Works for 25+ major cities.

### resolve_location

Convert city/airport name to IATA codes. Always call this before `search_flights` when you only have a city name.

```javascript
const result = await mcp.callTool("resolve_location", {
  query: "London"
});
// Returns: [{ code: "LON", name: "London", type: "city" },
//           { code: "LHR", name: "Heathrow", type: "airport" }, ...]
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | City or airport name |

### unlock_flight_offer

Confirm latest price and reserve an offer for 30 minutes. $1 proof-of-intent fee. Call `setup_payment` first.

```javascript
const result = await mcp.callTool("unlock_flight_offer", {
  offer_id: "off_xyz789"
});
// Returns: { confirmed_price: 45.99, currency: "EUR", checkout_token: "tok_...", expires_at: "..." }
```

If the confirmed price differs from the search price, inform the user before proceeding.

### book_flight

Book an unlocked flight — creates a real airline reservation with PNR.

```javascript
const result = await mcp.callTool("book_flight", {
  offer_id: "off_xyz789",
  passengers: [
    {
      id: "pas_001",
      given_name: "John",
      family_name: "Doe",
      born_on: "1990-01-15",
      gender: "m",
      title: "mr",
      email: "john@example.com",
      phone_number: "+44123456789"
    }
  ],
  contact_email: "john@example.com",
  idempotency_key: "booking-uuid-12345"
});
```

Always provide `idempotency_key` to prevent double-bookings on retry.

**Error categories:**
- `transient` (`SUPPLIER_TIMEOUT`, `RATE_LIMITED`) — safe to retry
- `validation` (`INVALID_IATA`, `INVALID_DATE`) — fix input, retry
- `business` (`OFFER_EXPIRED`, `PAYMENT_DECLINED`) — requires human decision

### start_checkout

Automate airline checkout up to the payment page — never submits payment. Returns a screenshot and booking URL so the user can complete manually.

```javascript
const result = await mcp.callTool("start_checkout", {
  offer_id: "off_xyz789",
  checkout_token: "tok_from_unlock"
});
```

Supported airlines for full automation: Ryanair, Wizz Air, EasyJet. Others return booking URL only.

### setup_payment

Set up payment method. Required once before `unlock_flight_offer` or `book_flight`.

```javascript
await mcp.callTool("setup_payment", { token: "tok_visa" });
```

### get_agent_profile

Get agent profile, payment status, and usage stats.

```javascript
const profile = await mcp.callTool("get_agent_profile", {});
```

### system_info

Get system resource info and recommended concurrency settings.

```javascript
const info = await mcp.callTool("system_info", {});
// Returns: { ram_total_gb, ram_available_gb, cpu_cores, recommended_max_browsers, tier }
```

Use this to determine optimal `max_browsers` for `search_flights`.

## Typical Agent Flow

```
1. resolve_location("Paris")           → PAR
2. resolve_location("Tokyo")           → TYO
3. search_flights(PAR, TYO, 2026-08-01) → offers[]
4. Present cheapest offers to user
5. User picks offer off_abc
6. setup_payment(token: "tok_visa")     → payment ready
7. unlock_flight_offer(off_abc)         → confirmed price + checkout_token
8. If price OK → book_flight(off_abc, passengers, idempotency_key)
   OR → start_checkout(off_abc, checkout_token) for manual completion
```

## Covered Airlines (75 Local Connectors)

Ryanair, EasyJet, Wizz Air, Norwegian, Vueling, Transavia, Eurowings, Volotea, Pegasus, SunExpress, Condor, airBaltic, Play, SmartWings, Flyr, AirAsia, Scoot, Cebu Pacific, IndiGo, SpiceJet, Spring Airlines, Lucky Air, 9 Air, Jeju Air, T'way Air, Peach, Jetstar, Southwest, Spirit, Frontier, Allegiant, JetBlue, Avelo, Sun Country, Flair, WestJet, Porter, Flybondi, JetSMART, Viva Aerobus, Volaris, SKY Airline, Azul, GOL, Copa, LATAM, Jazeera Airways, flynas, Air Arabia, Salam Air, flydubai, Emirates, Cathay Pacific, ANA, Singapore Airlines, Turkish Airlines, Biman Bangladesh, US-Bangla, Batik Air, Nok Air, Lion Air, Thai AirAsia, VietJet, Bamboo Airways, FlySafair, fastjet, Air Austral, Fiji Airways, Rex Airlines, and more.

With `LETSFG_API_KEY`, adds GDS/NDC sources covering 400+ airlines including all major full-service carriers.

## Python SDK

Also available as a Python package:

```bash
pip install letsfg
```

```python
from letsfg import search_flights

results = search_flights(
    origin="LON",
    destination="BCN",
    date_from="2026-06-15",
    max_browsers=4
)
for offer in results.offers:
    print(f"{offer.airlines} {offer.price} {offer.currency}")
```
