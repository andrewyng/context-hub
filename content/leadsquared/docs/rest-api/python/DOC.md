---
name: rest-api
description: "LeadSquared - Sales Execution & Marketing Automation REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "leadsquared,crm,sales,marketing,leads,automation,india,api"
---

# LeadSquared REST API - Python Guide

## Overview

LeadSquared is a sales execution and marketing automation CRM platform. Its REST API provides access to leads, activities, tasks, opportunities, and users. All endpoints use JSON over HTTPS.

- **Base URL**: `https://{host}/v2/` (host varies by account, found in Settings)
- **Authentication**: Access Key + Secret Key as query parameters or headers
- **HTTP Methods**: GET (read) and POST (create/update)
- **Rate Limit**: 25 requests per 5 seconds
- **Date Format**: UTC `YYYY-MM-DD HH:MM:SS`
- **Official docs**: https://apidocs.leadsquared.com/

## Authentication

LeadSquared authenticates via `accessKey` and `secretKey` passed as query string parameters on every request. Obtain these from **My Account > Settings > API and Webhooks**.

All requests must use HTTPS. Plain HTTP calls will fail.

## Installation

```bash
pip install httpx
```

## Python Client

```python
import httpx
from typing import Any
from urllib.parse import urlencode


class LeadSquaredClient:
    """Async client for LeadSquared REST API."""

    def __init__(
        self,
        host: str,
        access_key: str,
        secret_key: str,
    ):
        """Initialize the client.

        Args:
            host: Your LeadSquared API host (e.g., 'api.leadsquared.com').
            access_key: API access key from Settings.
            secret_key: API secret key from Settings.
        """
        self.base_url = f"https://{host}/v2"
        self.auth_params = {
            "accessKey": access_key,
            "secretKey": secret_key,
        }
        self.headers = {"Content-Type": "application/json"}

    def _url(self, path: str, extra_params: dict | None = None) -> str:
        params = {**self.auth_params, **(extra_params or {})}
        return f"{self.base_url}/{path}?{urlencode(params)}"

    async def _get(self, path: str, params: dict | None = None) -> Any:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                self._url(path, params),
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def _post(
        self, path: str, body: Any, params: dict | None = None
    ) -> Any:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self._url(path, params),
                headers=self.headers,
                json=body,
            )
            response.raise_for_status()
            return response.json()

    # --- Lead Management ---

    async def capture_lead(
        self,
        attributes: dict[str, str],
        search_by: str = "EmailAddress",
        update_behavior: str | None = None,
    ) -> dict:
        """Create or update a lead.

        Args:
            attributes: Dict of field name to value (e.g., {"FirstName": "Raj"}).
            search_by: Field to match existing leads: EmailAddress, Phone, etc.
            update_behavior: One of DoNotUpdate, UpdateOnlyEmptyFields,
                             DoNotUpdateUniqueFields, or None (default update all).
        """
        body = [
            {"Attribute": k, "Value": v} for k, v in attributes.items()
        ]
        body.append({"Attribute": "SearchBy", "Value": search_by})

        extra = {}
        if update_behavior:
            extra["LeadUpdateBehavior"] = update_behavior

        return await self._post(
            "LeadManagement.svc/Lead.Capture", body, extra
        )

    async def get_lead_by_id(self, lead_id: str) -> list[dict]:
        """Get a lead by its ProspectID."""
        return await self._get(
            "LeadManagement.svc/Leads.GetById",
            {"id": lead_id},
        )

    async def get_lead_by_email(self, email: str) -> list[dict]:
        """Get a lead by email address."""
        return await self._get(
            "LeadManagement.svc/Leads.GetByEmailaddress",
            {"emailaddress": email},
        )

    async def search_leads(
        self,
        lookup_name: str,
        lookup_value: str,
        operator: str = "=",
        columns: list[str] | None = None,
        page_index: int = 1,
        page_size: int = 100,
        sort_by: str | None = None,
        sort_desc: bool = True,
    ) -> list[dict]:
        """Search leads by criteria.

        Args:
            lookup_name: Field schema name to filter on.
            lookup_value: Value to match.
            operator: SQL operator: =, LIKE, >, <, <=, >=, <>.
            columns: Fields to include in results.
            page_index: Page number (starts at 1).
            page_size: Results per page (max 1000).
            sort_by: Field to sort by.
            sort_desc: True for descending, False for ascending.
        """
        body: dict[str, Any] = {
            "Parameter": {
                "LookupName": lookup_name,
                "LookupValue": lookup_value,
                "SqlOperator": operator,
            },
            "Paging": {
                "PageIndex": page_index,
                "PageSize": page_size,
            },
        }
        if columns:
            body["Columns"] = {"Include_CSV": ", ".join(columns)}
        if sort_by:
            body["Sorting"] = {
                "ColumnName": sort_by,
                "Direction": "1" if sort_desc else "0",
            }

        return await self._post("LeadManagement.svc/Leads.Get", body)

    async def update_lead(
        self, lead_id: str, attributes: dict[str, str]
    ) -> dict:
        """Update an existing lead by ProspectID."""
        body = [
            {"Attribute": k, "Value": v} for k, v in attributes.items()
        ]
        return await self._post(
            "LeadManagement.svc/Lead.Update",
            body,
            {"leadId": lead_id},
        )

    # --- Activity Management ---

    async def get_lead_activities(
        self, lead_id: str, activity_event: int | None = None
    ) -> list[dict]:
        """Get activities for a lead.

        Args:
            lead_id: The ProspectID.
            activity_event: Specific activity type code, or None for all.
        """
        body = {}
        if activity_event is not None:
            body = {"Parameter": {"ActivityEvent": activity_event}}

        return await self._post(
            "ProspectActivity.svc/Retrieve",
            body,
            {"leadId": lead_id},
        )

    async def create_activity(
        self,
        lead_id: str,
        activity_event: int,
        activity_note: str = "",
        fields: dict[str, str] | None = None,
    ) -> dict:
        """Post a new activity on a lead."""
        body: dict[str, Any] = {
            "RelatedProspectId": lead_id,
            "ActivityEvent": activity_event,
            "ActivityNote": activity_note,
        }
        if fields:
            body["Fields"] = [
                {"SchemaName": k, "Value": v} for k, v in fields.items()
            ]
        return await self._post(
            "ProspectActivity.svc/Create", body
        )

    # --- Quick Search ---

    async def quick_search(
        self,
        key: str,
        value: str,
    ) -> list[dict]:
        """Search leads by a single key-value pair."""
        return await self._get(
            "LeadManagement.svc/Leads.GetByQuickSearch",
            {"key": key, "value": value},
        )
```

## Usage Examples

### Capture a New Lead

```python
import asyncio


async def main():
    lsq = LeadSquaredClient(
        host="api.leadsquared.com",
        access_key="YOUR_ACCESS_KEY",
        secret_key="YOUR_SECRET_KEY",
    )

    result = await lsq.capture_lead(
        attributes={
            "FirstName": "Rahul",
            "LastName": "Verma",
            "EmailAddress": "rahul.verma@example.com",
            "Phone": "+919876543210",
            "Company": "TechCorp India",
            "mx_City": "Bangalore",
            "Source": "Website",
        },
        search_by="EmailAddress",
    )
    print(f"Lead ID: {result['Message']['Id']}")
    print(f"New lead created: {result['Message']['IsCreated']}")


asyncio.run(main())
```

### Get a Lead by ID

```python
async def get_lead():
    lsq = LeadSquaredClient(
        host="api.leadsquared.com",
        access_key="YOUR_ACCESS_KEY",
        secret_key="YOUR_SECRET_KEY",
    )

    lead = await lsq.get_lead_by_id("abc12345-def6-7890-ghij-klmnopqrstuv")
    if lead:
        for field in lead:
            print(f"  {field.get('Attribute')}: {field.get('Value')}")
    else:
        print("Lead not found")


asyncio.run(get_lead())
```

### Search Leads by Criteria

```python
async def search_recent_leads():
    lsq = LeadSquaredClient(
        host="api.leadsquared.com",
        access_key="YOUR_ACCESS_KEY",
        secret_key="YOUR_SECRET_KEY",
    )

    leads = await lsq.search_leads(
        lookup_name="CreatedOn",
        lookup_value="2026-03-01 00:00:00",
        operator=">",
        columns=[
            "ProspectID",
            "FirstName",
            "LastName",
            "EmailAddress",
            "Phone",
            "ProspectStage",
        ],
        sort_by="CreatedOn",
        sort_desc=True,
        page_size=50,
    )

    for lead in leads:
        name = f"{lead.get('FirstName', '')} {lead.get('LastName', '')}"
        print(f"  {name} - {lead.get('EmailAddress', '')}")

    return leads


asyncio.run(search_recent_leads())
```

### Update a Lead

```python
async def update_lead_stage():
    lsq = LeadSquaredClient(
        host="api.leadsquared.com",
        access_key="YOUR_ACCESS_KEY",
        secret_key="YOUR_SECRET_KEY",
    )

    result = await lsq.update_lead(
        lead_id="abc12345-def6-7890-ghij-klmnopqrstuv",
        attributes={
            "ProspectStage": "Qualified",
            "mx_Score": "85",
            "mx_LastContactedOn": "2026-03-17 10:30:00",
        },
    )
    print(f"Update result: {result}")


asyncio.run(update_lead_stage())
```

### Log an Activity on a Lead

```python
async def log_call_activity():
    lsq = LeadSquaredClient(
        host="api.leadsquared.com",
        access_key="YOUR_ACCESS_KEY",
        secret_key="YOUR_SECRET_KEY",
    )

    result = await lsq.create_activity(
        lead_id="abc12345-def6-7890-ghij-klmnopqrstuv",
        activity_event=208,  # Phone call activity type
        activity_note="Discussed pricing. Client interested in enterprise plan.",
        fields={
            "mx_CallDuration": "15",
            "mx_CallOutcome": "Interested",
        },
    )
    print(f"Activity created: {result}")


asyncio.run(log_call_activity())
```

### Paginated Lead Export

```python
async def export_all_leads():
    """Retrieve all leads with pagination."""
    lsq = LeadSquaredClient(
        host="api.leadsquared.com",
        access_key="YOUR_ACCESS_KEY",
        secret_key="YOUR_SECRET_KEY",
    )

    all_leads = []
    page = 1
    page_size = 1000

    while True:
        batch = await lsq.search_leads(
            lookup_name="CreatedOn",
            lookup_value="2020-01-01 00:00:00",
            operator=">",
            columns=["ProspectID", "FirstName", "LastName", "EmailAddress"],
            page_index=page,
            page_size=page_size,
        )
        if not batch:
            break
        all_leads.extend(batch)
        print(f"  Page {page}: fetched {len(batch)} leads")
        if len(batch) < page_size:
            break
        page += 1

    print(f"Total leads exported: {len(all_leads)}")
    return all_leads


asyncio.run(export_all_leads())
```

## Key API Endpoints Summary

| Operation | Method | Endpoint Path |
|-----------|--------|---------------|
| Capture Lead | POST | `LeadManagement.svc/Lead.Capture` |
| Get Lead by ID | GET | `LeadManagement.svc/Leads.GetById` |
| Get Lead by Email | GET | `LeadManagement.svc/Leads.GetByEmailaddress` |
| Search Leads | POST | `LeadManagement.svc/Leads.Get` |
| Quick Search | GET | `LeadManagement.svc/Leads.GetByQuickSearch` |
| Update Lead | POST | `LeadManagement.svc/Lead.Update` |
| Get Activities | POST | `ProspectActivity.svc/Retrieve` |
| Create Activity | POST | `ProspectActivity.svc/Create` |
| Create Lead + Activity | POST | `LeadManagement.svc/Lead.CreateOrUpdateLeadAndActivity` |

## Error Handling

```python
import httpx


async def safe_leadsquared_request(lsq: LeadSquaredClient):
    try:
        result = await lsq.get_lead_by_id("some-id")
        return result
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        if status == 401:
            print("Authentication failed. Check accessKey and secretKey.")
        elif status == 404:
            print("Endpoint not found. Verify your API host URL.")
        elif status == 429:
            print("Rate limited (25 req/5sec). Back off and retry.")
        elif status == 400:
            print(f"Bad request: {e.response.text}")
        else:
            print(f"HTTP error {status}: {e.response.text}")
        return None
    except httpx.ConnectError:
        print("Cannot connect. Check host URL and network.")
        return None
    except httpx.TimeoutException:
        print("Request timed out.")
        return None
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid request body or format |
| 401 | Invalid access credentials |
| 404 | API endpoint not found |
| 429 | Rate limit exceeded (25 calls per 5 seconds) |
| 500 | Server error |

## References

- API Overview: https://apidocs.leadsquared.com/overview/
- Authentication: https://apidocs.leadsquared.com/authentication/
- Lead Management: https://apidocs.leadsquared.com/lead-management/
- Capture Lead: https://apidocs.leadsquared.com/capture-lead/
- Search by Criteria: https://apidocs.leadsquared.com/search-by-lead-criteria/
- Activity Management: https://apidocs.leadsquared.com/activity-management/
- Get Lead by ID: https://apidocs.leadsquared.com/get-lead-by-id/
