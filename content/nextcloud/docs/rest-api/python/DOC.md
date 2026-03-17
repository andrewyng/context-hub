---
name: rest-api
description: "Nextcloud OCS and WebDAV REST API for file management, sharing, user provisioning, calendars, and self-hosted personal organization"
metadata:
  languages: "python"
  versions: "29+"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "nextcloud,calendar,contacts,files,self-hosted,privacy,organization,api"
---

# Nextcloud REST API Coding Guidelines (Python)

You are a Nextcloud API coding expert. Help me with writing code using httpx async to interact with the Nextcloud OCS API and WebDAV endpoints for file management, sharing, user administration, and personal organization.

You can find the official documentation here: https://docs.nextcloud.com/server/stable/developer_manual/client_apis/

## Golden Rule: Use httpx Async for All API Calls

Always use `httpx` with async/await for all Nextcloud REST API interactions.

- **Correct:** `import httpx` / `async with httpx.AsyncClient() as client:` / `response = await client.request("PROPFIND", url, headers=headers)`
- **Incorrect:** Using `requests`, `webdavclient3`, or `caldav` libraries for REST calls

## Installation

```bash
pip install httpx
```

## Base URLs

Nextcloud provides two main API types: OCS API and WebDAV.

- **OCS API Base:** `https://<nextcloud>/ocs/v2.php/`
- **WebDAV Base:** `https://<nextcloud>/remote.php/dav/`

## Authentication

Basic Auth with username + app password. Required OCS header: `OCS-APIRequest: true`.

For security, use app passwords (Settings > Security > Devices & sessions) instead of your main password.

```bash
export NEXTCLOUD_URL="https://cloud.example.com"
export NEXTCLOUD_USER="your_username"
export NEXTCLOUD_PASS="your_app_password"
```

```python
import os
import httpx

NC_URL = os.environ["NEXTCLOUD_URL"]
NC_USER = os.environ["NEXTCLOUD_USER"]
NC_PASS = os.environ["NEXTCLOUD_PASS"]
NC_AUTH = httpx.BasicAuth(NC_USER, NC_PASS)

OCS_HEADERS = {"OCS-APIRequest": "true", "Accept": "application/json"}
WEBDAV_BASE = f"{NC_URL}/remote.php/dav"
OCS_BASE = f"{NC_URL}/ocs/v2.php"
```

## Rate Limiting

Nextcloud does not impose strict API rate limits, but performance depends on your server's resources. Use pagination parameters (`limit`, `offset`) for large result sets.

## Methods

### List Folder Contents (WebDAV PROPFIND)

```python
import xml.etree.ElementTree as ET

async def list_folder(path: str = "/"):
    url = f"{WEBDAV_BASE}/files/{NC_USER}{path}"
    body = """<?xml version="1.0" encoding="UTF-8"?>
    <d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
        <d:prop>
            <d:getlastmodified/><d:getcontentlength/>
            <d:getcontenttype/><d:resourcetype/><oc:fileid/><oc:size/>
        </d:prop>
    </d:propfind>"""
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        response = await client.request("PROPFIND", url, headers={"Depth": "1"}, content=body)
        response.raise_for_status()
    ns = {"d": "DAV:", "oc": "http://owncloud.org/ns"}
    root = ET.fromstring(response.text)
    items = []
    for resp in root.findall("d:response", ns):
        href = resp.find("d:href", ns).text
        props = resp.find("d:propstat/d:prop", ns)
        is_dir = props.find("d:resourcetype/d:collection", ns) is not None
        size = props.find("d:getcontentlength", ns)
        items.append({
            "href": href, "is_directory": is_dir,
            "size": int(size.text) if size is not None and size.text else 0,
        })
    return items
```

---

### Download a File

```python
async def download_file(remote_path: str, local_path: str):
    url = f"{WEBDAV_BASE}/files/{NC_USER}{remote_path}"
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        response = await client.get(url)
        response.raise_for_status()
        with open(local_path, "wb") as f:
            f.write(response.content)
```

---

### Upload a File

```python
async def upload_file(local_path: str, remote_path: str):
    url = f"{WEBDAV_BASE}/files/{NC_USER}{remote_path}"
    with open(local_path, "rb") as f:
        content = f.read()
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        response = await client.put(url, content=content)
        response.raise_for_status()
```

---

### Create Folder / Delete / Move / Copy (WebDAV)

```python
async def create_folder(path: str):
    url = f"{WEBDAV_BASE}/files/{NC_USER}{path}"
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        response = await client.request("MKCOL", url, headers={"X-NC-WebDAV-AutoMkcol": "1"})
        response.raise_for_status()

async def delete_item(path: str):
    url = f"{WEBDAV_BASE}/files/{NC_USER}{path}"
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        response = await client.delete(url)
        response.raise_for_status()

async def move_item(source_path: str, dest_path: str, overwrite: bool = False):
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        response = await client.request(
            "MOVE", f"{WEBDAV_BASE}/files/{NC_USER}{source_path}",
            headers={
                "Destination": f"{WEBDAV_BASE}/files/{NC_USER}{dest_path}",
                "Overwrite": "T" if overwrite else "F",
            },
        )
        response.raise_for_status()
```

---

### Create a Share (OCS)

```python
async def create_share(
    path: str, share_type: int = 3, permissions: int = 1,
    password: str = None, expire_date: str = None,
):
    """share_type: 0=user, 1=group, 3=public link, 4=email, 6=federated.
    permissions: 1=read, 2=update, 4=create, 8=delete, 16=share (bitmask)."""
    data = {"path": path, "shareType": share_type, "permissions": permissions}
    if password:
        data["password"] = password
    if expire_date:
        data["expireDate"] = expire_date
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        response = await client.post(
            f"{OCS_BASE}/apps/files_sharing/api/v1/shares",
            headers=OCS_HEADERS, data=data,
        )
        response.raise_for_status()
        return response.json()["ocs"]["data"]
```

---

### Create a Calendar Event (CalDAV)

```python
import uuid

async def create_event(
    calendar_name: str, summary: str, start: str, end: str,
    description: str = None, location: str = None,
):
    """start/end format: '20260315T090000Z'"""
    event_uid = str(uuid.uuid4())
    url = f"{WEBDAV_BASE}/calendars/{NC_USER}/{calendar_name}/{event_uid}.ics"
    vcal = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Python//httpx//EN
BEGIN:VEVENT
UID:{event_uid}
DTSTART:{start}
DTEND:{end}
SUMMARY:{summary}"""
    if description:
        vcal += f"\nDESCRIPTION:{description}"
    if location:
        vcal += f"\nLOCATION:{location}"
    vcal += "\nEND:VEVENT\nEND:VCALENDAR"
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        response = await client.put(
            url, content=vcal,
            headers={"Content-Type": "text/calendar; charset=utf-8"},
        )
        response.raise_for_status()
        return event_uid
```

---

### Get Calendar Events (CalDAV REPORT)

```python
async def get_events(calendar_name: str, start: str, end: str):
    """start/end format: '20260101T000000Z'"""
    url = f"{WEBDAV_BASE}/calendars/{NC_USER}/{calendar_name}/"
    body = f"""<?xml version="1.0" encoding="UTF-8"?>
    <c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
        <d:prop><d:getetag/><c:calendar-data/></d:prop>
        <c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT">
            <c:time-range start="{start}" end="{end}"/>
        </c:comp-filter></c:comp-filter></c:filter>
    </c:calendar-query>"""
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        response = await client.request("REPORT", url, content=body, headers={"Depth": "1"})
        response.raise_for_status()
        return response.text
```

## Error Handling

```python
async def safe_ocs_call(method: str, path: str, **kwargs):
    async with httpx.AsyncClient(auth=NC_AUTH) as client:
        try:
            response = await getattr(client, method)(
                f"{OCS_BASE}{path}", headers=OCS_HEADERS, **kwargs,
            )
            response.raise_for_status()
            data = response.json()
            status_code = data["ocs"]["meta"]["statuscode"]
            if status_code >= 400:
                print(f"OCS error {status_code}: {data['ocs']['meta'].get('message')}")
                return None
            return data["ocs"]["data"]
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                print("Authentication failed -- check credentials or app password")
            elif e.response.status_code == 404:
                print(f"Resource not found: {path}")
            else:
                print(f"HTTP error {e.response.status_code}")
            raise
        except httpx.ConnectError:
            print(f"Cannot connect to Nextcloud at {NC_URL}")
            raise
```

### OCS Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (OCS v2) |
| 400 | Bad request / invalid parameter |
| 403 | Forbidden / insufficient permissions |
| 404 | Resource not found |
| 997 | Unauthorized |

### WebDAV Status Codes

| Code | Meaning |
|------|---------|
| 201 | Created |
| 204 | No content (successful delete/move) |
| 207 | Multi-status (PROPFIND response) |
| 401 | Unauthorized |
| 404 | Not found |
| 409 | Conflict (missing parent folder) |
| 507 | Insufficient storage |

## Common Pitfalls

1. **`OCS-APIRequest: true` header is mandatory** -- All OCS requests require it. Without it, requests are rejected.

2. **Use `Accept: application/json`** -- Default OCS response format is XML. Add this header for JSON.

3. **OCS v2 vs v1** -- Use `/ocs/v2.php/` (returns standard HTTP status codes). v1 always returns 200 with status in body.

4. **App passwords required with 2FA** -- When two-factor authentication is enabled, API calls must use app passwords.

5. **WebDAV uses HTTP methods** -- `PROPFIND`, `MKCOL`, `MOVE`, `COPY`, `PROPPATCH` are standard WebDAV methods. httpx supports them via `client.request("METHOD", url)`.

6. **`X-NC-WebDAV-AutoMkcol: 1`** -- Auto-creates parent directories on upload (NC 29+).

7. **CalDAV/CardDAV endpoints** -- Calendars: `/remote.php/dav/calendars/<user>/<calendar>/`. Contacts: `/remote.php/dav/addressbooks/users/<user>/<addressbook>/`.

8. **Chunked uploads** -- For large files, use `/remote.php/dav/uploads/` endpoint.
