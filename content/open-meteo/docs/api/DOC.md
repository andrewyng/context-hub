---
name: api
description: "Open-Meteo free weather API — forecasts, current conditions, historical data, geocoding; no API key required"
metadata:
  languages: "javascript"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-07-19"
  source: community
  tags: "open-meteo,weather,forecast,geocoding,free,keyless"
---
# Open-Meteo Weather API

Free, keyless weather API. No signup, no API key, no auth header — just HTTP GET with query parameters. Free for **non-commercial use** within rate limits; commercial use requires a paid API plan (different host, `customer-` prefixed subdomains, API key).

Base URL (forecast): `https://api.open-meteo.com/v1/forecast`

## The core call

```javascript
const url = new URL("https://api.open-meteo.com/v1/forecast");
url.searchParams.set("latitude", "52.52");
url.searchParams.set("longitude", "13.41");
url.searchParams.set("current", "temperature_2m,apparent_temperature,weather_code");
url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max");
url.searchParams.set("hourly", "temperature_2m,precipitation");
url.searchParams.set("temperature_unit", "fahrenheit"); // default: celsius
url.searchParams.set("timezone", "auto");               // resolves from coordinates
url.searchParams.set("forecast_days", "3");             // 1-16, default 7

const j = await (await fetch(url)).json();
```

You select variables per time-resolution bucket: `current`, `hourly`, `daily` — each a comma-separated list. Only what you ask for is returned.

## Response shape

Data comes back as **parallel arrays keyed by variable name**, with a sibling `*_units` object:

```json
{
  "latitude": 52.52, "longitude": 13.42,
  "timezone": "Europe/Berlin", "utc_offset_seconds": 7200,
  "current_units": { "temperature_2m": "°C", "weather_code": "wmo code" },
  "current": { "time": "2026-01-01T12:00", "interval": 900, "temperature_2m": 17.2, "weather_code": 80 },
  "daily_units": { "temperature_2m_max": "°C" },
  "daily": {
    "time": ["2026-01-01", "2026-01-02"],
    "temperature_2m_max": [17.8, 21.3]
  }
}
```

- `daily`/`hourly` values are arrays index-aligned with the `time` array: day N's max is `daily.temperature_2m_max[N]`.
- `current` values are scalars, refreshed on a ~15-minute model interval (`interval: 900`).
- Timestamps are ISO 8601 **without timezone suffix**, in the requested timezone (`timezone=auto` localizes to the coordinates).
- Returned `latitude`/`longitude` are the nearest model grid point, not your exact input.

## Commonly used parameters

| Parameter | Notes |
|---|---|
| `latitude`, `longitude` | Required. Comma-separated lists allowed for multi-location in one call. |
| `current` / `hourly` / `daily` | Variable lists, e.g. `temperature_2m`, `apparent_temperature`, `precipitation`, `precipitation_probability_max`, `weather_code`, `wind_speed_10m`, `relative_humidity_2m`, `uv_index_max`, `sunrise`, `sunset` |
| `temperature_unit` | `celsius` (default) or `fahrenheit` |
| `wind_speed_unit` | `kmh` (default), `ms`, `mph`, `kn` |
| `precipitation_unit` | `mm` (default) or `inch` |
| `timezone` | IANA name or `auto`; default is GMT |
| `forecast_days` | 1–16 (default 7) |
| `past_days` | 0–92 — prepend recent past to the same response |
| `start_date` / `end_date` | `YYYY-MM-DD` range as an alternative to forecast_days |

## Weather codes

`weather_code` is a **WMO code** (0 = clear, 1–3 = partly cloudy, 45/48 = fog, 51–67 = drizzle/rain, 71–77 = snow, 80–82 = showers, 95–99 = thunderstorm). The API returns only the number — map codes to labels/icons client-side.

## Other endpoints (same query style, same response shape)

| Endpoint | Purpose |
|---|---|
| `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=5` | Name → coordinates. Results include `latitude`, `longitude`, `country_code`, `admin1`, `timezone`. |
| `https://archive-api.open-meteo.com/v1/archive` | Historical weather (1940–present), `start_date`/`end_date` required |
| `https://air-quality-api.open-meteo.com/v1/air-quality` | PM2.5, PM10, ozone, AQI |
| `https://marine-api.open-meteo.com/v1/marine` | Wave height/direction/period |
| `https://api.open-meteo.com/v1/elevation` | Elevation lookup |

## Rate limits and terms (free tier, non-commercial)

- **600 calls/minute, 5,000/hour, 10,000/day, 300,000/month.** No headers advertise remaining quota — self-throttle.
- Non-commercial use only on the free host; attribution to Open-Meteo is required (data is CC BY 4.0).
- No SLA on the free tier. Cache aggressively — weather models update at most hourly, so re-fetching current conditions more than every 10–30 minutes is waste. A server-side cache with 30-minute revalidation is a good default for dashboards.

## Error handling

Errors return HTTP 400 with `{ "error": true, "reason": "..." }` (e.g. malformed coordinates or unknown variable names). A misspelled variable name fails the whole request rather than being silently dropped — validate variable lists when building them dynamically.

## Gotchas summary

1. Values arrive as index-aligned parallel arrays, not row objects — zip `time[i]` with `variable[i]`.
2. Timestamps have no timezone suffix; they're already in the requested timezone. Don't parse them as UTC.
3. Ask only for variables you need — response size and compute scale with the variable list.
4. `timezone=auto` + `forecast_days=1` gives "today" in local time; without `timezone`, days are GMT-bounded and "today's high" can be off near midnight.
5. The grid resolution is ~1–11 km depending on model — returned coordinates differ slightly from the request.
6. Multi-location requests (comma-separated lat/lon lists) return an array of response objects instead of one object.
