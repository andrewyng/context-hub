---
name: marketing-automation
description: "Marketo REST API via Python requests — leads, campaigns, emails, forms, programs, smart lists, bulk operations, and custom objects"
metadata:
  languages: "python"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-18"
  source: community
  tags: "marketo,adobe,marketing-automation,crm,leads,campaigns,email,rest-api"
---

# Marketo REST API Python Guide

You are a Marketo API coding expert. Help me write Python code that integrates with Adobe Marketo Engage using the REST API.

Official API documentation:
https://developers.marketo.com/rest-api/

## Golden Rule: Always Auto-Refresh OAuth Tokens

Use the OAuth 2.0 client credentials flow. Tokens expire every 3600 seconds. Never hardcode them. Build a client that auto-refreshes before expiry.

- **HTTP Client:** `requests`
- **Auth:** OAuth 2.0 client credentials (client_id + client_secret)
- **REST API base URL:** found in Admin > Integration > Web Services, labeled "Endpoint:"
- **Identity URL:** found in the same page, labeled "Identity:" — used only for OAuth token requests
- These are **separate URLs**. Do not assume one from the other.

**Installation:**

```bash
pip install requests python-dotenv
```

**Do NOT use:**
- `marketorestpython` (abandoned, incomplete coverage)
- `pymarketo` (outdated)
- Hard-coded access tokens (they expire hourly)

## Environment Variables

```bash
export MARKETO_CLIENT_ID="your_client_id"
export MARKETO_CLIENT_SECRET="your_client_secret"
export MARKETO_BASE_URL="https://123-ABC-456.mktorest.com"
export MARKETO_IDENTITY_URL="https://123-ABC-456.mktorest.com/identity"
```

Or create a `.env` file:

```
MARKETO_CLIENT_ID=your_client_id
MARKETO_CLIENT_SECRET=your_client_secret
MARKETO_BASE_URL=https://123-ABC-456.mktorest.com
MARKETO_IDENTITY_URL=https://123-ABC-456.mktorest.com/identity
```

Find these in Marketo Admin:
- **Client ID & Secret:** Admin > Integration > LaunchPoint > View Details
- **Endpoint (REST base URL):** Admin > Integration > Web Services > REST API section
- **Identity URL:** Same page, labeled "Identity:" — this is a separate URL used only for OAuth

## Authentication

### Token Request

```python
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

class MarketoClient:
    def __init__(self):
        self.base_url = os.getenv("MARKETO_BASE_URL").rstrip("/")
        self.identity_url = os.getenv("MARKETO_IDENTITY_URL", f"{self.base_url}/identity").rstrip("/")
        self.client_id = os.getenv("MARKETO_CLIENT_ID")
        self.client_secret = os.getenv("MARKETO_CLIENT_SECRET")
        self.token = None
        self.token_expiry = 0

    def _get_token(self):
        if self.token and time.time() < self.token_expiry - 60:
            return self.token

        resp = requests.get(
            f"{self.identity_url}/oauth/token",
            params={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
        )
        resp.raise_for_status()
        data = resp.json()

        if "access_token" not in data:
            raise Exception(f"Auth failed: {data}")

        self.token = data["access_token"]
        self.token_expiry = time.time() + data.get("expires_in", 3600)
        return self.token

    def _headers(self):
        return {"Authorization": f"Bearer {self._get_token()}"}

    def _url(self, path, prefix="rest"):
        return f"{self.base_url}/{prefix}{path}"

    def get(self, path, params=None):
        resp = requests.get(self._url(path), headers=self._headers(), params=params)
        resp.raise_for_status()
        return self._check_response(resp.json())

    def post(self, path, json=None):
        resp = requests.post(self._url(path), headers=self._headers(), json=json)
        resp.raise_for_status()
        return self._check_response(resp.json())

    def post_file(self, path, files, data=None):
        resp = requests.post(self._url(path), headers=self._headers(), files=files, data=data)
        resp.raise_for_status()
        return self._check_response(resp.json())

    def delete(self, path, json=None):
        resp = requests.delete(self._url(path), headers=self._headers(), json=json)
        resp.raise_for_status()
        return self._check_response(resp.json())

    # Bulk API uses /bulk/ prefix instead of /rest/
    def bulk_get(self, path, params=None):
        resp = requests.get(self._url(path, "bulk"), headers=self._headers(), params=params)
        resp.raise_for_status()
        return self._check_response(resp.json())

    def bulk_post(self, path, json=None):
        resp = requests.post(self._url(path, "bulk"), headers=self._headers(), json=json)
        resp.raise_for_status()
        return self._check_response(resp.json())

    def bulk_post_file(self, path, files, data=None):
        resp = requests.post(self._url(path, "bulk"), headers=self._headers(), files=files, data=data)
        resp.raise_for_status()
        return self._check_response(resp.json())

    def bulk_get_raw(self, path):
        """Returns raw response (for downloading export files)."""
        resp = requests.get(self._url(path, "bulk"), headers=self._headers())
        resp.raise_for_status()
        return resp

    def _check_response(self, data):
        if not data.get("success", True):
            errors = data.get("errors", [])
            code = errors[0]["code"] if errors else "unknown"
            msg = errors[0]["message"] if errors else str(data)
            raise MarketoAPIError(code, msg)
        return data

class MarketoAPIError(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(f"Marketo API error {code}: {message}")
```

Use this `MarketoClient` in all subsequent examples:

```python
mkto = MarketoClient()
```

## Lead Operations

### Create or Update Leads (syncLeads)

```python
result = mkto.post("/v1/leads.json", json={
    "action": "createOrUpdate",
    "lookupField": "email",
    "input": [
        {
            "email": "[email protected]",
            "firstName": "Jane",
            "lastName": "Doe",
            "company": "Acme Corp",
        },
        {
            "email": "[email protected]",
            "firstName": "John",
            "lastName": "Smith",
            "company": "Acme Corp",
        },
    ],
})

for record in result["result"]:
    print(f"Lead {record['id']}: {record['status']}")
```

The `action` field controls behavior:
- `createOrUpdate` — default, upserts by lookupField
- `createOnly` — fails if lead exists
- `updateOnly` — fails if lead doesn't exist
- `createDuplicate` — always creates new

### Get Lead by ID

```python
result = mkto.get("/v1/lead/12345.json", params={
    "fields": "email,firstName,lastName,company"
})

lead = result["result"][0]
print(f"{lead['firstName']} {lead['lastName']} — {lead['email']}")
```

### Get Leads by Filter

```python
result = mkto.get("/v1/leads.json", params={
    "filterType": "email",
    "filterValues": "[email protected],[email protected]",
    "fields": "email,firstName,lastName,company,score",
})

for lead in result["result"]:
    print(f"{lead['email']}: score={lead.get('score', 'N/A')}")
```

Common filter types: `email`, `id`, `company`, `updatedAt`, and any custom field marked as searchable.

### Describe Lead Fields

```python
result = mkto.get("/v1/leads/describe2.json")

for field in result["result"]:
    print(f"{field['name']} ({field['dataType']}) — {field.get('displayName', '')}")
```

### Merge Leads

```python
# Merge lead 5678 into lead 1234 (1234 wins)
result = mkto.post("/v1/leads/1234/merge.json", json={
    "leadIds": [5678],
    "mergeInCRM": False,
})

print(f"Merge success: {result['success']}")
```

### Delete Leads

```python
result = mkto.delete("/v1/leads.json", json={
    "input": [{"id": 1234}, {"id": 5678}]
})

for record in result["result"]:
    print(f"Lead {record['id']}: {record['status']}")
```

## Bulk Operations

### Bulk Import Leads from CSV

```python
import time

# Step 1: Create import job (bulk API uses /bulk/ prefix)
with open("leads.csv", "rb") as f:
    result = mkto.bulk_post_file(
        "/v1/leads.json",
        files={"file": ("leads.csv", f, "text/csv")},
        data={"format": "csv", "lookupField": "email"},
    )

batch_id = result["result"][0]["batchId"]
print(f"Import job created: {batch_id}")

# Step 2: Poll until complete
while True:
    status = mkto.bulk_get(f"/v1/leads/batch/{batch_id}.json")
    state = status["result"][0]["status"]
    print(f"Status: {state}")

    if state in ("Complete", "Failed"):
        break
    time.sleep(10)

# Step 3: Check results
info = status["result"][0]
print(f"Imported: {info['numOfLeadsProcessed']} leads")
print(f"Failed: {info['numOfRowsFailed']} rows")

# Step 4: Download failures if any
if info["numOfRowsFailed"] > 0:
    resp = mkto.bulk_get_raw(f"/v1/leads/batch/{batch_id}/failures.json")
    print("Failed rows:\n", resp.text)
```

CSV format — first row must be field API names:

```csv
email,firstName,lastName,company
[email protected],Jane,Doe,Acme Corp
[email protected],John,Smith,Globex
```

### Bulk Export Leads

Date range filters are limited to **31 days max**.

```python
import time
from datetime import datetime, timedelta

# Step 1: Create export job (bulk API uses /bulk/ prefix, max 31-day range)
end = datetime.utcnow()
start = end - timedelta(days=30)
result = mkto.bulk_post("/v1/leads/export/create.json", json={
    "fields": ["email", "firstName", "lastName", "company", "createdAt"],
    "filter": {
        "createdAt": {
            "startAt": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "endAt": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
    },
    "format": "CSV",
})

export_id = result["result"][0]["exportId"]

# Step 2: Enqueue
mkto.bulk_post(f"/v1/leads/export/{export_id}/enqueue.json")

# Step 3: Poll until complete
while True:
    status = mkto.bulk_get(f"/v1/leads/export/{export_id}/status.json")
    state = status["result"][0]["status"]
    print(f"Export status: {state}")

    if state in ("Completed", "Failed", "Cancelled"):
        break
    time.sleep(15)

# Step 4: Download
resp = mkto.bulk_get_raw(f"/v1/leads/export/{export_id}/file.json")

with open("exported_leads.csv", "w") as f:
    f.write(resp.text)

print(f"Exported to exported_leads.csv")
```

## Smart Lists & Static Lists

**Workspace/partition gotcha:** Leads and lists must be in the same workspace. If `add to list` returns `"Lead not found"` (error 1004) but the lead exists, the list is in a different workspace than the lead's partition. Check `leadPartitionId` on the lead and `workspaceId` on the list.

### Get Smart List by ID

```python
result = mkto.get("/v1/smartLists/1001.json")

smart_list = result["result"][0]
print(f"Smart List: {smart_list['name']}")
```

### Get Leads by Smart List

```python
result = mkto.get("/v1/list/1001/leads.json", params={
    "fields": "email,firstName,lastName",
    "batchSize": 300,
})

for lead in result["result"]:
    print(f"{lead['email']}")

# Handle pagination
while result.get("nextPageToken"):
    result = mkto.get("/v1/list/1001/leads.json", params={
        "fields": "email,firstName,lastName",
        "batchSize": 300,
        "nextPageToken": result["nextPageToken"],
    })
    for lead in result["result"]:
        print(f"{lead['email']}")
```

### Add Leads to Static List

```python
result = mkto.post("/v1/lists/2001/leads.json", json={
    "input": [{"id": 1234}, {"id": 5678}, {"id": 9012}]
})

for record in result["result"]:
    print(f"Lead {record['id']}: {record['status']}")
```

### Remove Leads from Static List

```python
result = mkto.delete("/v1/lists/2001/leads.json", json={
    "input": [{"id": 1234}]
})

print(f"Removed: {result['result'][0]['status']}")
```

### Check List Membership

```python
result = mkto.get("/v1/lists/2001/leads/ismember.json", params={
    "id": "1234,5678",
})

for record in result["result"]:
    print(f"Lead {record['id']} member: {record['membership']}")
```

## Campaigns

### Get Campaigns

```python
result = mkto.get("/v1/campaigns.json", params={
    "batchSize": 200,
})

for campaign in result["result"]:
    print(f"{campaign['id']}: {campaign['name']} (active={campaign['active']})")
```

### Trigger Campaign

Trigger a campaign for specific leads. The campaign must have a "Campaign is Requested" trigger in its smart list.

```python
result = mkto.post("/v1/campaigns/3001/trigger.json", json={
    "input": {
        "leads": [{"id": 1234}, {"id": 5678}],
        "tokens": [
            {
                "name": "{{my.discount_code}}",
                "value": "SAVE20",
            }
        ],
    }
})

print(f"Campaign triggered: {result['success']}")
```

### Request Campaign

Add leads to a batch campaign's processing queue.

```python
result = mkto.post("/v1/campaigns/3002/request.json", json={
    "input": {
        "leads": [{"id": 1234}, {"id": 5678}],
    }
})

print(f"Requested: {result['success']}")
```

### Schedule Campaign

```python
result = mkto.post("/v1/campaigns/3002/schedule.json", json={
    "input": {
        "runAt": "2026-03-20T10:00:00Z",
        "cloneToProgramName": "March Campaign Clone",
    }
})

print(f"Scheduled: {result['success']}")
```

## Email & Email Templates

### List Emails

```python
result = mkto.get("/asset/v1/emails.json", params={
    "status": "approved",
    "maxReturn": 50,
})

for email in result["result"]:
    print(f"{email['id']}: {email['name']} — {email['status']}")
```

### Get Email by ID

```python
result = mkto.get("/asset/v1/email/4001.json")

email = result["result"][0]
print(f"Email: {email['name']}")
print(f"Subject: {email['subject']['value']}")
print(f"From: {email['fromName']['value']} <{email['fromEmail']['value']}>")
```

### Get Email Content

```python
result = mkto.get("/asset/v1/email/4001/content.json")

for section in result["result"]:
    print(f"Section: {section['htmlId']} — type: {section['contentType']}")
    if section.get("value"):
        print(f"  Content: {section['value'][:100]}...")
```

### Update Email Content Section

```python
result = mkto.post("/asset/v1/email/4001/content/heroSection.json", json={
    "type": "Text",
    "value": "<h1>Spring Sale!</h1><p>Save 20% on everything.</p>",
})

print(f"Updated: {result['success']}")
```

### Send Sample Email

```python
result = mkto.post("/asset/v1/email/4001/send.json", json={
    "emailAddress": "[email protected]",
    "textOnly": False,
    "leadId": 1234,  # optional — renders tokens for this lead
})

print(f"Sample sent: {result['success']}")
```

### Approve Email

```python
result = mkto.post("/asset/v1/email/4001/approveDraft.json")
print(f"Approved: {result['success']}")
```

### Unapprove Email

```python
result = mkto.post("/asset/v1/email/4001/unapprove.json")
print(f"Unapproved: {result['success']}")
```

### List Email Templates

```python
result = mkto.get("/asset/v1/emailTemplates.json", params={
    "status": "approved",
    "maxReturn": 50,
})

for template in result["result"]:
    print(f"{template['id']}: {template['name']}")
```

## Forms

### List Forms

```python
result = mkto.get("/asset/v1/forms.json", params={
    "maxReturn": 50,
    "status": "approved",
})

for form in result["result"]:
    print(f"{form['id']}: {form['name']} — {form['status']}")
```

### Get Form by ID

```python
result = mkto.get("/asset/v1/form/5001.json")

form = result["result"][0]
print(f"Form: {form['name']}")
print(f"URL: {form['url']}")
```

### Get Form Fields

```python
result = mkto.get("/asset/v1/form/5001/fields.json")

for field in result["result"]:
    print(f"{field['id']}: {field['label']} ({field['dataType']}) required={field.get('required', False)}")
```

### Clone Form

```python
result = mkto.post("/asset/v1/form/5001/clone.json", json={
    "name": "Cloned Form",
    "folder": {"id": 100, "type": "Folder"},
    "description": "Cloned from Form 5001",
})

new_form = result["result"][0]
print(f"Cloned form ID: {new_form['id']}")
```

## Programs

### List Programs

```python
result = mkto.get("/asset/v1/programs.json", params={
    "maxReturn": 50,
})

for program in result["result"]:
    print(f"{program['id']}: {program['name']} ({program['type']})")
```

### Get Program by ID

```python
result = mkto.get("/asset/v1/program/6001.json")

program = result["result"][0]
print(f"Program: {program['name']}")
print(f"Type: {program['type']}")
print(f"Channel: {program['channel']}")
print(f"Status: {program['status']}")
```

### Create Program

```python
result = mkto.post("/asset/v1/programs.json", json={
    "name": "Q1 2026 Email Campaign",
    "folder": {"id": 100, "type": "Folder"},
    "type": "Default",
    "channel": "Email Send",
    "description": "Q1 promotional email campaign",
})

new_program = result["result"][0]
print(f"Created program: {new_program['id']}")
```

### Clone Program

```python
result = mkto.post("/asset/v1/program/6001/clone.json", json={
    "name": "Q2 2026 Email Campaign",
    "folder": {"id": 100, "type": "Folder"},
    "description": "Cloned from Q1 campaign",
})

print(f"Cloned program ID: {result['result'][0]['id']}")
```

### Get Programs by Tag

```python
result = mkto.get("/asset/v1/program/byTag.json", params={
    "tagType": "Region",
    "tagValue": "North America",
})

for program in result["result"]:
    print(f"{program['name']} ({program['type']})")
```

### List Channels

```python
result = mkto.get("/asset/v1/channels.json")

for channel in result["result"]:
    statuses = ", ".join(s["name"] for s in channel.get("progressionStatuses", []))
    print(f"{channel['name']}: {statuses}")
```

## Custom Objects

### List Custom Object Types

```python
result = mkto.get("/v1/customobjects.json")

for obj in result["result"]:
    print(f"{obj['name']}: {obj['displayName']} (state={obj['state']})")
```

### Describe Custom Object

```python
result = mkto.get("/v1/customobjects/myCustomObject_c/describe.json")

obj = result["result"][0]
print(f"Object: {obj['displayName']}")
print("Fields:")
for field in obj["fields"]:
    print(f"  {field['name']} ({field['dataType']})")
```

### Create or Update Custom Object Records

```python
result = mkto.post("/v1/customobjects/myCustomObject_c.json", json={
    "action": "createOrUpdate",
    "dedupeBy": "dedupeFields",
    "input": [
        {
            "externalId": "ext-001",
            "leadId": 1234,
            "fieldA": "value1",
            "fieldB": 42,
        }
    ],
})

for record in result["result"]:
    print(f"Record: {record['seq']} — {record['status']}")
```

### Get Custom Object Records

```python
result = mkto.get("/v1/customobjects/myCustomObject_c.json", params={
    "filterType": "externalId",
    "filterValues": "ext-001,ext-002",
    "fields": "externalId,leadId,fieldA,fieldB",
})

for record in result["result"]:
    print(f"{record['externalId']}: {record['fieldA']}")
```

### Delete Custom Object Records

```python
result = mkto.delete("/v1/customobjects/myCustomObject_c/delete.json", json={
    "deleteBy": "dedupeFields",
    "input": [{"externalId": "ext-001"}],
})

for record in result["result"]:
    print(f"Deleted: {record['status']}")
```

## Pagination

Marketo uses `nextPageToken` for paginating lead API results. Asset APIs use `offset` and `maxReturn`.

### Lead API Pagination

```python
all_leads = []
params = {
    "filterType": "company",
    "filterValues": "Acme Corp",
    "fields": "email,firstName,lastName",
    "batchSize": 300,
}

result = mkto.get("/v1/leads.json", params=params)
all_leads.extend(result.get("result", []))

while result.get("nextPageToken"):
    params["nextPageToken"] = result["nextPageToken"]
    result = mkto.get("/v1/leads.json", params=params)
    all_leads.extend(result.get("result", []))

print(f"Total leads: {len(all_leads)}")
```

### Asset API Pagination

```python
all_emails = []
offset = 0
max_return = 200

while True:
    result = mkto.get("/asset/v1/emails.json", params={
        "offset": offset,
        "maxReturn": max_return,
        "status": "approved",
    })

    batch = result.get("result", [])
    if not batch:
        break

    all_emails.extend(batch)
    offset += len(batch)

print(f"Total emails: {len(all_emails)}")
```

## Rate Limits

Marketo enforces these limits:

| Limit | Value |
|-------|-------|
| API calls per 20 seconds | 100 |
| Daily API quota | 50,000 (varies by tier) |
| Bulk import file size | 10 MB |
| Bulk export rows | 500K per job |
| Concurrent bulk exports | 2 |
| Concurrent bulk imports | 10 |

### Rate Limit Retry Pattern

```python
import time

def call_with_retry(fn, *args, max_retries=3, **kwargs):
    for attempt in range(max_retries):
        try:
            return fn(*args, **kwargs)
        except MarketoAPIError as e:
            if e.code in ("606", "615") and attempt < max_retries - 1:
                wait = 2 ** attempt * 5
                print(f"Rate limited, retrying in {wait}s...")
                time.sleep(wait)
            else:
                raise

# Usage
result = call_with_retry(mkto.get, "/v1/leads.json", params={
    "filterType": "email",
    "filterValues": "[email protected]",
})
```

## Error Handling

Marketo returns errors in a consistent format:

```json
{
    "success": false,
    "errors": [{"code": "606", "message": "Max rate limit exceeded"}]
}
```

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 601 | Access token invalid | Re-authenticate |
| 602 | Access token expired | Auto-refresh token |
| 604 | Request timeout | Retry |
| 606 | Rate limit exceeded | Back off and retry |
| 611 | System error | Retry with backoff |
| 615 | Concurrent access limit | Back off and retry |
| 702 | Record not found | Check ID |
| 1003 | Missing required field | Check input |
| 1004 | Duplicate lead found | Use different action |
| 1007 | Lead not found | Check filter |

### Robust Error Handling

```python
try:
    result = mkto.post("/v1/leads.json", json={
        "action": "createOrUpdate",
        "lookupField": "email",
        "input": [{"email": "[email protected]", "firstName": "Test"}],
    })

    for record in result["result"]:
        if record["status"] == "skipped":
            reasons = record.get("reasons", [])
            for r in reasons:
                print(f"Skipped lead: {r['code']} — {r['message']}")
        else:
            print(f"Lead {record['id']}: {record['status']}")

except MarketoAPIError as e:
    if e.code == "606":
        print("Rate limited — implement backoff")
    elif e.code in ("601", "602"):
        print("Auth error — token will auto-refresh on next call")
    else:
        print(f"API error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Complete Example

End-to-end: authenticate, bulk import leads from CSV, then trigger a campaign.

```python
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# --- Setup (uses MarketoClient from Authentication section above) ---
mkto = MarketoClient()

# --- Step 1: Bulk import leads ---
print("Starting bulk import...")

with open("new_leads.csv", "rb") as f:
    result = mkto.bulk_post_file(
        "/v1/leads.json",
        files={"file": ("new_leads.csv", f, "text/csv")},
        data={"format": "csv", "lookupField": "email"},
    )

batch_id = result["result"][0]["batchId"]
print(f"Import job: {batch_id}")

# Poll for completion
while True:
    status = mkto.bulk_get(f"/v1/leads/batch/{batch_id}.json")
    state = status["result"][0]["status"]
    print(f"  Import status: {state}")
    if state in ("Complete", "Failed"):
        break
    time.sleep(10)

info = status["result"][0]
print(f"Processed: {info['numOfLeadsProcessed']}, Failed: {info['numOfRowsFailed']}")

# --- Step 2: Get imported leads ---
print("\nFetching imported leads...")

result = mkto.get("/v1/leads.json", params={
    "filterType": "email",
    "filterValues": "[email protected],[email protected]",
    "fields": "id,email,firstName,lastName",
})

lead_ids = [{"id": lead["id"]} for lead in result["result"]]
print(f"Found {len(lead_ids)} leads")

# --- Step 3: Add to a static list ---
print("\nAdding to campaign list...")

mkto.post("/v1/lists/2001/leads.json", json={"input": lead_ids})
print("Added to list")

# --- Step 4: Trigger campaign ---
print("\nTriggering welcome campaign...")

mkto.post("/v1/campaigns/3001/trigger.json", json={
    "input": {
        "leads": lead_ids,
        "tokens": [
            {"name": "{{my.welcome_message}}", "value": "Welcome to Acme!"}
        ],
    }
})

print("Campaign triggered successfully!")
```

## Useful Links

- REST API reference: https://developers.marketo.com/rest-api/
- Authentication: https://developers.marketo.com/rest-api/authentication/
- Lead database: https://developers.marketo.com/rest-api/lead-database/
- Bulk import/export: https://developers.marketo.com/rest-api/bulk-import/
- Asset API (emails, forms, programs): https://developers.marketo.com/rest-api/assets/
- Error codes: https://developers.marketo.com/rest-api/error-codes/
- Rate limits: https://developers.marketo.com/rest-api/marketo-integration-best-practices/


---
After using this doc, share your experience:
  chub feedback marketo/marketing-automation up --lang py
  chub feedback marketo/marketing-automation down --lang py --label outdated
Available labels: accurate, well-structured, helpful, good-examples, outdated, inaccurate, incomplete, wrong-examples, wrong-version, poorly-structured
Do NOT include any code, architecture details, or project-specific information in your feedback.
