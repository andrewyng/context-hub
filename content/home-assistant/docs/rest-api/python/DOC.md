---
name: rest-api
description: "Home Assistant REST API for smart home automation, device control, state management, and accessibility-focused independent living"
metadata:
  languages: "python"
  versions: "2024.1+"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "home-assistant,smart-home,iot,automation,accessibility,api"
---

# Home Assistant REST API Coding Guidelines (Python)

You are a Home Assistant REST API coding expert. Help me with writing code using httpx async to interact with the Home Assistant REST API for smart home automation, device control, and accessibility-focused solutions.

You can find the official documentation here: https://developers.home-assistant.io/docs/api/rest

## Golden Rule: Use httpx Async for All API Calls

Always use `httpx` with async/await for all Home Assistant REST API interactions.

- **Correct:** `import httpx` / `async with httpx.AsyncClient() as client:` / `response = await client.get(url, headers=headers)`
- **Incorrect:** Using `requests` (synchronous, blocks event loop)

## Installation

```bash
pip install httpx
```

## Base URL

```
http://<HA_IP>:8123/api/
```

Default port is 8123. All responses are JSON unless otherwise noted.

## Authentication

Home Assistant uses Long-Lived Access Tokens for REST API authentication.

1. Open Home Assistant web interface
2. Navigate to your user profile (bottom-left)
3. Scroll to "Long-Lived Access Tokens"
4. Click "Create Token" and copy it immediately (shown only once)

Never hardcode tokens. Always use environment variables:

```bash
export HASS_URL="http://192.168.1.100:8123"
export HASS_TOKEN="your_long_lived_access_token_here"
```

```python
import os
import httpx

HASS_URL = os.environ["HASS_URL"]
HASS_TOKEN = os.environ["HASS_TOKEN"]

HEADERS = {
    "Authorization": f"Bearer {HASS_TOKEN}",
    "Content-Type": "application/json",
}
```

## Rate Limiting

Home Assistant does not impose explicit rate limits on the REST API, but the instance is single-threaded. Avoid flooding with concurrent requests. Use the WebSocket API for real-time subscriptions.

## Methods

### Get Entity State

```python
async def get_entity_state(entity_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{HASS_URL}/api/states/{entity_id}", headers=HEADERS
        )
        response.raise_for_status()
        return response.json()
```

Returns `entity_id`, `state`, `last_changed`, and `attributes`.

---

### Get All Entity States

```python
async def get_all_states():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{HASS_URL}/api/states", headers=HEADERS)
        response.raise_for_status()
        return response.json()
```

---

### Create or Update Entity State

Returns 201 for new entities, 200 for updates:

```python
async def set_entity_state(entity_id: str, state: str, attributes: dict = None):
    payload = {"state": state}
    if attributes:
        payload["attributes"] = attributes
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{HASS_URL}/api/states/{entity_id}", headers=HEADERS, json=payload,
        )
        response.raise_for_status()
        return response.json()
```

---

### Call Service

Services are the primary way to control devices. Use `POST /api/services/<domain>/<service>`:

```python
async def call_service(domain: str, service: str, data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{HASS_URL}/api/services/{domain}/{service}",
            headers=HEADERS, json=data,
        )
        response.raise_for_status()
        return response.json()

# Turn on/off any entity
await call_service("light", "turn_on", {"entity_id": "light.bedroom"})
await call_service("switch", "turn_off", {"entity_id": "switch.fan"})

# Control lights with parameters
await call_service("light", "turn_on", {
    "entity_id": "light.bedroom",
    "brightness": 100,        # 0-255
    "color_temp": 300,         # mireds (153-500)
    "rgb_color": [0, 0, 255],  # RGB tuple
    "transition": 5,           # seconds
})

# Set thermostat
await call_service("climate", "set_temperature", {
    "entity_id": "climate.thermostat",
    "temperature": 72.0,
    "hvac_mode": "heat",
})

# Lock/unlock doors
await call_service("lock", "lock", {"entity_id": "lock.front_door"})

# Trigger automation or script
await call_service("automation", "trigger", {"entity_id": "automation.morning"})
await call_service("script", "turn_on", {"entity_id": "script.goodnight"})

# Send notification
await call_service("notify", "notify", {"message": "Door opened", "title": "Alert"})
```

---

### Render a Jinja2 Template

```python
async def render_template(template: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{HASS_URL}/api/template", headers=HEADERS,
            json={"template": template},
        )
        response.raise_for_status()
        return response.text

# Example: "The temperature is {{ states('sensor.temperature') }}."
```

---

### Get State History

```python
from datetime import datetime, timedelta

async def get_history(
    entity_id: str, start_time: datetime = None, end_time: datetime = None,
    minimal: bool = True,
):
    if start_time is None:
        start_time = datetime.utcnow() - timedelta(hours=24)
    url = f"{HASS_URL}/api/history/period/{start_time.isoformat()}"
    params = {"filter_entity_id": entity_id}
    if end_time:
        params["end_time"] = end_time.isoformat()
    if minimal:
        params["minimal_response"] = ""
        params["no_attributes"] = ""
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS, params=params)
        response.raise_for_status()
        return response.json()
```

---

### Fire a Custom Event

```python
async def fire_event(event_type: str, event_data: dict = None):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{HASS_URL}/api/events/{event_type}",
            headers=HEADERS, json=event_data or {},
        )
        response.raise_for_status()
        return response.json()
```

## Error Handling

```python
async def safe_api_call(method: str, url: str, **kwargs):
    async with httpx.AsyncClient() as client:
        try:
            response = await getattr(client, method)(url, headers=HEADERS, **kwargs)
            response.raise_for_status()
            ct = response.headers.get("content-type", "")
            return response.json() if ct.startswith("application/json") else response.text
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            if status == 401:
                print("Error: Invalid or expired access token")
            elif status == 404:
                print(f"Error: Resource not found at {url}")
            elif status == 405:
                print(f"Error: Method {method.upper()} not allowed")
            else:
                print(f"HTTP error {status}: {e.response.text}")
            raise
        except httpx.ConnectError:
            print(f"Error: Cannot connect to Home Assistant at {HASS_URL}")
            raise
```

### Common Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success (existing resource updated) |
| 201 | Success (new resource created) |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (invalid or missing token) |
| 404 | Entity or resource not found |
| 405 | Method not allowed for endpoint |

## Common Pitfalls

1. **Token must be Long-Lived** -- Tokens do not expire but can be revoked from the user profile. The `api` integration must be enabled (enabled by default with the frontend).

2. **Service call domain must match entity** -- Use `light/turn_on` for lights, `switch/turn_off` for switches. The domain is the prefix before the dot in the entity ID.

3. **REST API is synchronous** -- For real-time subscriptions and streaming, use the WebSocket API instead.

4. **Services return changed state objects** -- The response is an array of state objects that were affected by the service call.

5. **History endpoint performance** -- Use `minimal_response` and `no_attributes` query params for better performance on large datasets.

6. **Timestamps use ISO 8601** -- Format: `YYYY-MM-DDThh:mm:ssTZD`.

7. **Home Assistant Cloud (Nabu Casa)** -- Provides remote API access without port forwarding.
