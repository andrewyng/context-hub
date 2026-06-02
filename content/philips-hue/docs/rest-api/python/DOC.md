---
name: rest-api
description: "Philips Hue CLIP API v2 for smart lighting control, sensory environment management, and accessibility-focused ambient automation"
metadata:
  languages: "python"
  versions: "2.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "philips-hue,lighting,smart-home,sensory,autism,accessibility,api"
---

# Philips Hue REST API Coding Guidelines (Python)

You are a Philips Hue API coding expert. Help me with writing code using httpx async to control Philips Hue smart lights via the local bridge REST API (CLIP API v2) for lighting automation, sensory environment control, and accessibility solutions.

You can find the official documentation here: https://developers.meethue.com/develop/hue-api-v2/

## Golden Rule: Use httpx Async for All API Calls

Always use `httpx` with async/await for all Philips Hue REST API interactions.

- **Correct:** `import httpx` / `async with httpx.AsyncClient(verify=False) as client:`
- **Incorrect:** Using `requests` or `phue` library

**Important:** The local bridge uses a self-signed HTTPS certificate. You must set `verify=False` for local API calls.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://<bridge_ip>/clip/v2/resource/
```

API v2 uses resource IDs (UUIDs) instead of sequential integer IDs from v1.

## Authentication

The Philips Hue API operates locally via the Hue Bridge using an application key.

### Bridge Discovery and Key Generation

```python
import httpx

async def discover_bridges():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://discovery.meethue.com/")
        response.raise_for_status()
        return response.json()  # [{"id": "...", "internalipaddress": "..."}]

async def create_app_key(bridge_ip: str, app_name: str = "python_app"):
    """Press the bridge link button first! Must be called within 30 seconds."""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.post(
            f"https://{bridge_ip}/api",
            json={"devicetype": f"{app_name}#desktop", "generateclientkey": True},
        )
        result = response.json()
        if "error" in result[0]:
            print(f"Error: {result[0]['error']['description']}")
            return None
        return result[0]["success"]  # {"username": "...", "clientkey": "..."}
```

### Environment Variable Configuration

```bash
export HUE_BRIDGE_IP="192.168.1.50"
export HUE_APP_KEY="your-application-key-here"
```

```python
import os
import httpx

BRIDGE_IP = os.environ["HUE_BRIDGE_IP"]
HUE_APP_KEY = os.environ["HUE_APP_KEY"]
HUE_BASE_URL = f"https://{BRIDGE_IP}/clip/v2/resource"
HUE_HEADERS = {"hue-application-key": HUE_APP_KEY}
```

## Rate Limiting

The bridge processes commands sequentially. Avoid sending more than ~10 requests/second. No formal rate limit response -- commands are queued and may be dropped under heavy load.

## API v2 Resource Types

| Resource | Path | Description |
|----------|------|-------------|
| `light` | `/light` | Individual light devices |
| `grouped_light` | `/grouped_light` | Light groups (rooms/zones) |
| `room` | `/room` | Physical rooms |
| `zone` | `/zone` | Logical zones (can span rooms) |
| `scene` | `/scene` | Saved light configurations |
| `device` | `/device` | Physical devices |
| `motion` | `/motion` | Motion sensors |
| `temperature` | `/temperature` | Temperature sensors |
| `button` | `/button` | Button/switch devices |

## Methods

### List All Lights

```python
async def get_lights():
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(f"{HUE_BASE_URL}/light", headers=HUE_HEADERS)
        response.raise_for_status()
        return response.json()["data"]
```

Each light has: `id`, `on.on` (bool), `dimming.brightness` (0-100), `color_temperature.mirek`, `color.xy`, `metadata.name`.

---

### Turn Light On/Off

```python
async def set_light_on(light_id: str, on: bool = True):
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.put(
            f"{HUE_BASE_URL}/light/{light_id}",
            headers=HUE_HEADERS, json={"on": {"on": on}},
        )
        response.raise_for_status()
        return response.json()
```

---

### Set Light State (Brightness, Color Temperature, Color, Transition)

```python
async def set_light_state(
    light_id: str, brightness: float = None, mirek: int = None,
    color_xy: tuple = None, transition_ms: int = None,
):
    """Control light with optional parameters.
    brightness: 0-100%. mirek: 153 (6500K daylight) to 500 (2000K candle).
    color_xy: CIE (x, y) tuple. transition_ms: 100-60000ms."""
    payload = {"on": {"on": True}}
    if brightness is not None:
        payload["dimming"] = {"brightness": max(0.0, min(100.0, brightness))}
    if mirek is not None:
        payload["color_temperature"] = {"mirek": max(153, min(500, mirek))}
    if color_xy is not None:
        payload["color"] = {"xy": {"x": color_xy[0], "y": color_xy[1]}}
    if transition_ms is not None:
        payload["dynamics"] = {"duration": transition_ms}
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.put(
            f"{HUE_BASE_URL}/light/{light_id}",
            headers=HUE_HEADERS, json=payload,
        )
        response.raise_for_status()
        return response.json()

# Common mirek values: 153=Daylight, 250=Cool white, 350=Neutral, 454=Warm, 500=Candle
# Common CIE xy: Red=(0.675,0.322), Green=(0.409,0.518), Blue=(0.167,0.040), White=(0.323,0.329)
```

---

### Control Room/Zone (Grouped Light)

```python
async def set_grouped_light(grouped_light_id: str, on: bool = True, brightness: float = None):
    payload = {"on": {"on": on}}
    if brightness is not None:
        payload["dimming"] = {"brightness": brightness}
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.put(
            f"{HUE_BASE_URL}/grouped_light/{grouped_light_id}",
            headers=HUE_HEADERS, json=payload,
        )
        response.raise_for_status()
        return response.json()
```

---

### Activate a Scene

```python
async def activate_scene(scene_id: str):
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.put(
            f"{HUE_BASE_URL}/scene/{scene_id}",
            headers=HUE_HEADERS, json={"recall": {"action": "active"}},
        )
        response.raise_for_status()
        return response.json()
```

---

### List Resources (Generic)

```python
async def list_resources(resource_type: str):
    """List any resource type: light, room, zone, scene, device, motion, etc."""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(
            f"{HUE_BASE_URL}/{resource_type}", headers=HUE_HEADERS
        )
        response.raise_for_status()
        return response.json()["data"]
```

## Error Handling

```python
async def safe_hue_call(method: str, path: str, payload: dict = None):
    url = f"{HUE_BASE_URL}/{path}"
    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.request(
                method, url, headers=HUE_HEADERS,
                json=payload if method in ("PUT", "POST") else None,
            )
            response.raise_for_status()
            data = response.json()
            errors = data.get("errors", [])
            if errors:
                for error in errors:
                    print(f"Hue API error: {error.get('description')}")
                return None
            return data.get("data", data)
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            msgs = {401: "Unauthorized -- check application key",
                    403: "Forbidden -- press link button and re-authenticate",
                    404: f"Resource not found: {path}",
                    429: "Rate limited -- too many requests"}
            print(msgs.get(status, f"HTTP error {status}"))
            raise
        except httpx.ConnectError:
            print(f"Cannot connect to Hue Bridge at {BRIDGE_IP}")
            raise
```

## Common Pitfalls

1. **Self-signed certificate** -- The bridge uses HTTPS with a self-signed cert. Always use `verify=False` for local access.

2. **Link button for initial setup only** -- Physical button press is required once during key generation, not for subsequent API calls.

3. **Color temperature range varies** -- Check `mirek_schema` in the light resource for the supported range of each bulb model.

4. **CIE xy color space** -- Hue uses CIE xy, not RGB. Use online converters or the formula for RGB-to-xy conversion.

5. **Bridge command queue** -- The bridge is sequential. Rapid-fire requests may be dropped. Keep under ~10 req/s.

6. **Scenes are stored on the bridge** -- They survive power outages and can be activated without the app.

7. **EventStream for real-time updates** -- Use SSE at `/eventstream/clip/v2` for state change notifications instead of polling.

8. **Max 63 accessories per bridge** -- Plan accordingly for large installations.
