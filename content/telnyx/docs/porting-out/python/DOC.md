---
name: porting-out
description: "Manage port-out requests when numbers are being ported away from Telnyx. List, view, and update port-out status."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,porting,port-out,number-transfer"
---

# Telnyx Porting Out Python SDK Coding Guidelines

You are a Telnyx Porting Out API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `from telnyx import Telnyx`
- **Incorrect:** `import telnyx` without using the client class

## Installation

```bash
pip install telnyx
```

## Setup

```python
import os
from telnyx import Telnyx

client = Telnyx(
    api_key=os.environ.get("TELNYX_API_KEY"),  # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## List portout requests

Returns the portout requests according to filters

`GET /portouts`

```python
page = client.portouts.list()
page = page.data[0]
print(page.id)
```

Returns: `already_ported` (boolean), `authorized_name` (string), `carrier_name` (string), `city` (string), `created_at` (string), `current_carrier` (string), `end_user_name` (string), `foc_date` (string), `host_messaging` (boolean), `id` (string), `inserted_at` (string), `lsr` (array[string]), `phone_numbers` (array[string]), `pon` (string), `reason` (string | null), `record_type` (string), `rejection_code` (integer), `requested_foc_date` (string), `service_address` (string), `spid` (string), `state` (string), `status` (enum: pending, authorized, ported, rejected, rejected-pending, canceled), `support_key` (string), `updated_at` (string), `user_id` (uuid), `vendor` (uuid), `zip` (string)

## List all port-out events

Returns a list of all port-out events.

`GET /portouts/events`

```python
page = client.portouts.events.list()
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Show a port-out event

Show a specific port-out event.

`GET /portouts/events/{id}`

```python
event = client.portouts.events.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(event.data)
```

Returns: `data` (object)

## Republish a port-out event

Republish a specific port-out event.

`POST /portouts/events/{id}/republish`

```python
client.portouts.events.republish(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
```

## List eligible port-out rejection codes for a specific order

Given a port-out ID, list rejection codes that are eligible for that port-out

`GET /portouts/rejections/{portout_id}`

```python
response = client.portouts.list_rejection_codes(
    portout_id="329d6658-8f93-405d-862f-648776e8afd7",
)
print(response.data)
```

Returns: `code` (integer), `description` (string), `reason_required` (boolean)

## List port-out related reports

List the reports generated about port-out operations.

`GET /portouts/reports`

```python
page = client.portouts.reports.list()
page = page.data[0]
print(page.id)
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_portouts_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Create a port-out related report

Generate reports about port-out operations.

`POST /portouts/reports`

```python
report = client.portouts.reports.create(
    params={
        "filters": {}
    },
    report_type="export_portouts_csv",
)
print(report.data)
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_portouts_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Retrieve a report

Retrieve a specific report generated.

`GET /portouts/reports/{id}`

```python
report = client.portouts.reports.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(report.data)
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_portouts_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Get a portout request

Returns the portout request based on the ID provided

`GET /portouts/{id}`

```python
portout = client.portouts.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(portout.data)
```

Returns: `already_ported` (boolean), `authorized_name` (string), `carrier_name` (string), `city` (string), `created_at` (string), `current_carrier` (string), `end_user_name` (string), `foc_date` (string), `host_messaging` (boolean), `id` (string), `inserted_at` (string), `lsr` (array[string]), `phone_numbers` (array[string]), `pon` (string), `reason` (string | null), `record_type` (string), `rejection_code` (integer), `requested_foc_date` (string), `service_address` (string), `spid` (string), `state` (string), `status` (enum: pending, authorized, ported, rejected, rejected-pending, canceled), `support_key` (string), `updated_at` (string), `user_id` (uuid), `vendor` (uuid), `zip` (string)

## List all comments for a portout request

Returns a list of comments for a portout request.

`GET /portouts/{id}/comments`

```python
comments = client.portouts.comments.list(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(comments.data)
```

Returns: `body` (string), `created_at` (string), `id` (string), `portout_id` (string), `record_type` (string), `user_id` (string)

## Create a comment on a portout request

Creates a comment on a portout request.

`POST /portouts/{id}/comments`

Optional: `body` (string)

```python
comment = client.portouts.comments.create(
    id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(comment.data)
```

Returns: `body` (string), `created_at` (string), `id` (string), `portout_id` (string), `record_type` (string), `user_id` (string)

## List supporting documents on a portout request

List every supporting documents for a portout request.

`GET /portouts/{id}/supporting_documents`

```python
supporting_documents = client.portouts.supporting_documents.list(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(supporting_documents.data)
```

Returns: `created_at` (string), `document_id` (uuid), `id` (uuid), `portout_id` (uuid), `record_type` (string), `type` (enum: loa, invoice), `updated_at` (string)

## Create a list of supporting documents on a portout request

Creates a list of supporting documents on a portout request.

`POST /portouts/{id}/supporting_documents`

Optional: `documents` (array[object])

```python
supporting_document = client.portouts.supporting_documents.create(
    id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(supporting_document.data)
```

Returns: `created_at` (string), `document_id` (uuid), `id` (uuid), `portout_id` (uuid), `record_type` (string), `type` (enum: loa, invoice), `updated_at` (string)

## Update Status

Authorize or reject portout request

`PATCH /portouts/{id}/{status}` — Required: `reason`

Optional: `host_messaging` (boolean)

```python
response = client.portouts.update_status(
    status="authorized",
    id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    reason="I do not recognize this transaction",
)
print(response.data)
```

Returns: `already_ported` (boolean), `authorized_name` (string), `carrier_name` (string), `city` (string), `created_at` (string), `current_carrier` (string), `end_user_name` (string), `foc_date` (string), `host_messaging` (boolean), `id` (string), `inserted_at` (string), `lsr` (array[string]), `phone_numbers` (array[string]), `pon` (string), `reason` (string | null), `record_type` (string), `rejection_code` (integer), `requested_foc_date` (string), `service_address` (string), `spid` (string), `state` (string), `status` (enum: pending, authorized, ported, rejected, rejected-pending, canceled), `support_key` (string), `updated_at` (string), `user_id` (uuid), `vendor` (uuid), `zip` (string)
