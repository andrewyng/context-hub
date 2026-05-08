---
name: meeting-intelligence
description: "Demodesk REST API for managing meetings, users, recordings, and scheduling via api-key header auth."
metadata:
  languages: "python"
  versions: "v1"
  updated-on: "2026-05-08"
  source: community
  tags: "demodesk,meetings,scheduling,recordings,sales,demo"
---

# Demodesk REST API — Python Guide

You are a Demodesk API coding expert. Help me write Python code using the Demodesk REST API.

Official API documentation: https://help.demodesk.com/en/articles/8518816-api-reference

## API Versions

Demodesk has two API versions:

- **v1** (covered in this guide) — REST API for scheduling, meetings, users, and webhooks. **Will be discontinued in the future.** Avoid v1 for new integrations where v2 is available.
- **v2** (recommended) — Covers recordings, transcripts, AI summaries, and additional features. Use v2 for any meeting intelligence / transcript / AI use cases.

v2 API reference: https://demodesk.com/api/docs/index.html

## Authentication

Auth is via the `api-key` header. Three key types exist:

| Key type | Use |
|---|---|
| `COMPANY_ADMIN_USER_API_KEY` | Full company access — meetings, users, groups |
| `USER_API_KEY` | Single user scope — own meetings only |
| `MASTER_3RD_PARTY_API_KEY` | Whitelabel only — create new accounts |

Generate keys in Demodesk dashboard: Settings → Integrations → scroll to "Demodesk API".

```python
import httpx

API_KEY = "YOUR_COMPANY_ADMIN_API_KEY"
BASE_URL = "https://demodesk.com/api/v1"

headers = {
    "api-key": API_KEY,
    "Content-Type": "application/json",
}
```

## Error Response Format

```json
{
  "errors": [{"detail": "The provided API key is invalid."}],
  "status": "unauthorized"
}
```

| HTTP | Status string | Meaning |
|---|---|---|
| 401 | `unauthorized` | Invalid API key |
| 403 | `forbidden` | Not authorized for this action |
| 404 | `not_found` | Resource not found |
| 422 | `unprocessable_entity` | Invalid request body |

## Core Resources

### List Meetings

```python
async with httpx.AsyncClient() as client:
    r = await client.get(
        f"{BASE_URL}/demos",
        headers=headers,
        params={
            "page": 1,
            "filter[schedule_eq]": "past",          # "past" or "upcoming"
            "filter[all_team_members_dashboard]": "true",
        },
    )
    r.raise_for_status()
    payload = r.json()
    meetings = payload["data"]
    meta = payload["meta"]  # currentPage, hasNextPage, pageSize (25)
```

Available filters:
- `filter[schedule_eq]` — `past` or `upcoming`
- `filter[all_team_members_dashboard]` — `true` / `false`
- `filter[start_date_gteq]` — e.g. `2024-01-01`
- `filter[start_date_lteq]` — e.g. `2024-12-31`
- `filter[account_i_cont]` — meeting name substring
- `filter[template_name_i_cont]` — meeting type name substring
- `filter[recordings_present]` — `true` / `false`

When `filter[recordings_present]=true`, recordings are in the `included` key of the response:

```python
payload = r.json()
for item in payload.get("included", []):
    if item.get("type") == "recording":
        media_url = item["attributes"].get("customerUrl")
```

> **Note**: Transcripts and AI summaries are only available via the **v2 API** — see https://demodesk.com/api/docs/index.html
- `filter[group_id_eq]` — group id

Meeting object fields: `id`, `token`, `status` (`scheduled`/`starting`/`started`/`ending`/`ended`/`canceled`), `duration`, `account`, `link`, `startDate`, `userFirstName`, `userLastName`.

### Get a Single Meeting

```python
async with httpx.AsyncClient() as client:
    # Use the meeting token (not ID)
    r = await client.get(
        f"{BASE_URL}/scheduled_demos/{demo_token}",
        headers=headers,
    )
    meeting = r.json()["data"]
```

### Create a Meeting

```python
async with httpx.AsyncClient() as client:
    r = await client.post(
        f"{BASE_URL}/scheduled_demos",
        headers=headers,
        json={
            "data": {
                "type": "demos",
                "attributes": {
                    "account": "Acme Corp",
                    "startDate": "2026-06-01T10:00:00.000+01:00",
                    "duration": 1800,
                    "timeZone": "Europe/London",
                    "user_id": USER_ID,
                },
            }
        },
    )
    meeting_id = r.json()["data"]["id"]
```

### Cancel / Delete a Meeting

```python
async with httpx.AsyncClient() as client:
    # Cancel (keeps record)
    await client.post(f"{BASE_URL}/scheduled_demos/{demo_id}/cancel", headers=headers)

    # Delete (removes record)
    await client.delete(f"{BASE_URL}/scheduled_demos/{demo_id}", headers=headers)
```

### Users

Your `company_id` is available in Demodesk dashboard → Settings → Company Info, or from the `company_id` field in any user object returned by the API.

```python
async with httpx.AsyncClient() as client:
    # List users in a company
    r = await client.get(
        f"{BASE_URL}/companies/{company_id}/users", headers=headers
    )

    # Create user
    r = await client.post(
        f"{BASE_URL}/users",
        headers=headers,
        json={
            "data": {
                "type": "users",
                "attributes": {
                    "firstName": "Jane",
                    "lastName": "Smith",
                    "email": "jane@example.com",
                    "locale": "en",
                },
            }
        },
    )
    user_id = r.json()["data"]["id"]
    user_api_key = r.json()["data"]["apiKey"]
```

### Meeting Types

```python
async with httpx.AsyncClient() as client:
    r = await client.get(f"{BASE_URL}/demo_templates", headers=headers)
    templates = r.json()["data"]
```

## Common Pattern: Fetch All Past Meetings

```python
import httpx

async def fetch_all_past_meetings(api_key: str) -> list:
    headers = {"api-key": api_key, "Content-Type": "application/json"}
    results = []
    page = 1

    async with httpx.AsyncClient() as client:
        while True:
            r = await client.get(
                "https://demodesk.com/api/v1/demos",
                headers=headers,
                params={
                    "page": page,
                    "filter[schedule_eq]": "past",
                    "filter[all_team_members_dashboard]": "true",
                },
            )
            r.raise_for_status()
            payload = r.json()
            results.extend(payload["data"])
            if not payload["meta"]["hasNextPage"]:
                break
            page += 1

    return results
```

## Webhooks

Enable by emailing support@demodesk.com with your endpoint URL.

Supported events:
- `demo.scheduled`, `demo.rescheduled`, `demo.canceled`
- `demo.started`, `demo.ended`, `demo.handovered`
- `recording.uploaded`, `recording.transcription_postprocessed`

Full webhook payload schema: https://demodesk.com/api/docs/index.html

## Customer Booking (No Auth Required)

These endpoints require no API key — designed for embedding in chatbots, voice agents, and booking widgets.

```python
import httpx

async def get_available_slots(owner: str, slug: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://demodesk.com/api/v1/customer-booking-calendar",
            params={"owner": owner, "slug": slug},
        )
        r.raise_for_status()
        return r.json()

async def book_meeting(owner: str, slug: str, booking_data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"https://demodesk.com/api/v1/book/{owner}/{slug}",
            json=booking_data,
        )
        r.raise_for_status()
        return r.json()
```

## Installation

```bash
pip install httpx
```
