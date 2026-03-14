---
name: account-reports
description: "Generate and retrieve usage reports for billing, analytics, and reconciliation."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,account,reports,usage,analytics,billing"
---

# Telnyx Account Reports Python SDK Coding Guidelines

You are a Telnyx Account Reports API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

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

## List call events

Filters call events by given filter parameters. Events are ordered by `occurred_at`. If filter for `leg_id` or `application_session_id` is not present, it only filters events from the last 24 hours.

`GET /call_events`

```python
page = client.call_events.list()
page = page.data[0]
print(page.call_leg_id)
```

Returns: `call_leg_id` (string), `call_session_id` (string), `event_timestamp` (string), `metadata` (object), `name` (string), `record_type` (enum: call_event), `type` (enum: command, webhook)

## Create a ledger billing group report

`POST /ledger_billing_group_reports`

Optional: `month` (integer), `year` (integer)

```python
ledger_billing_group_report = client.ledger_billing_group_reports.create(
    month=10,
    year=2019,
)
print(ledger_billing_group_report.data)
```

Returns: `created_at` (date-time), `id` (uuid), `organization_id` (uuid), `record_type` (enum: ledger_billing_group_report), `report_url` (uri), `status` (enum: pending, complete, failed, deleted), `updated_at` (date-time)

## Get a ledger billing group report

`GET /ledger_billing_group_reports/{id}`

```python
ledger_billing_group_report = client.ledger_billing_group_reports.retrieve(
    "f5586561-8ff0-4291-a0ac-84fe544797bd",
)
print(ledger_billing_group_report.data)
```

Returns: `created_at` (date-time), `id` (uuid), `organization_id` (uuid), `record_type` (enum: ledger_billing_group_report), `report_url` (uri), `status` (enum: pending, complete, failed, deleted), `updated_at` (date-time)

## Get all MDR detailed report requests

Retrieves all MDR detailed report requests for the authenticated user

`GET /legacy/reporting/batch_detail_records/messaging`

```python
messagings = client.legacy.reporting.batch_detail_records.messaging.list()
print(messagings.data)
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Create a new MDR detailed report request

Creates a new MDR detailed report request with the specified filters

`POST /legacy/reporting/batch_detail_records/messaging` — Required: `start_time`, `end_time`

Optional: `connections` (array[integer]), `directions` (array[integer]), `filters` (array[object]), `include_message_body` (boolean), `managed_accounts` (array[string]), `profiles` (array[string]), `record_types` (array[integer]), `report_name` (string), `select_all_managed_accounts` (boolean), `timezone` (string)

```python
from datetime import datetime

messaging = client.legacy.reporting.batch_detail_records.messaging.create(
    end_time=datetime.fromisoformat("2024-02-12T23:59:59"),
    start_time=datetime.fromisoformat("2024-02-01T00:00:00"),
)
print(messaging.data)
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Get a specific MDR detailed report request

Retrieves a specific MDR detailed report request by ID

`GET /legacy/reporting/batch_detail_records/messaging/{id}`

```python
messaging = client.legacy.reporting.batch_detail_records.messaging.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(messaging.data)
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Delete a MDR detailed report request

Deletes a specific MDR detailed report request by ID

`DELETE /legacy/reporting/batch_detail_records/messaging/{id}`

```python
messaging = client.legacy.reporting.batch_detail_records.messaging.delete(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(messaging.data)
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Get all CDR report requests

Retrieves all CDR report requests for the authenticated user

`GET /legacy/reporting/batch_detail_records/voice`

```python
voices = client.legacy.reporting.batch_detail_records.voice.list()
print(voices.data)
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## Create a new CDR report request

Creates a new CDR report request with the specified filters

`POST /legacy/reporting/batch_detail_records/voice` — Required: `start_time`, `end_time`

Optional: `call_types` (array[integer]), `connections` (array[integer]), `fields` (array[string]), `filters` (array[object]), `include_all_metadata` (boolean), `managed_accounts` (array[string]), `record_types` (array[integer]), `report_name` (string), `select_all_managed_accounts` (boolean), `source` (string), `timezone` (string)

```python
from datetime import datetime

voice = client.legacy.reporting.batch_detail_records.voice.create(
    end_time=datetime.fromisoformat("2024-02-12T23:59:59"),
    start_time=datetime.fromisoformat("2024-02-01T00:00:00"),
)
print(voice.data)
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## Get available CDR report fields

Retrieves all available fields that can be used in CDR reports

`GET /legacy/reporting/batch_detail_records/voice/fields`

```python
response = client.legacy.reporting.batch_detail_records.voice.retrieve_fields()
print(response.billing)
```

Returns: `Billing` (array[string]), `Interaction Data` (array[string]), `Number Information` (array[string]), `Telephony Data` (array[string])

## Get a specific CDR report request

Retrieves a specific CDR report request by ID

`GET /legacy/reporting/batch_detail_records/voice/{id}`

```python
voice = client.legacy.reporting.batch_detail_records.voice.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(voice.data)
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## Delete a CDR report request

Deletes a specific CDR report request by ID

`DELETE /legacy/reporting/batch_detail_records/voice/{id}`

```python
voice = client.legacy.reporting.batch_detail_records.voice.delete(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(voice.data)
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## List MDR usage reports

Fetch all previous requests for MDR usage reports.

`GET /legacy/reporting/usage_reports/messaging`

```python
page = client.legacy.reporting.usage_reports.messaging.list()
page = page.data[0]
print(page.id)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Create a new legacy usage V2 MDR report request

Creates a new legacy usage V2 MDR report request with the specified filters

`POST /legacy/reporting/usage_reports/messaging`

```python
messaging = client.legacy.reporting.usage_reports.messaging.create(
    aggregation_type=0,
)
print(messaging.data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Get an MDR usage report

Fetch single MDR usage report by id.

`GET /legacy/reporting/usage_reports/messaging/{id}`

```python
messaging = client.legacy.reporting.usage_reports.messaging.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(messaging.data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Delete a V2 legacy usage MDR report request

Deletes a specific V2 legacy usage MDR report request by ID

`DELETE /legacy/reporting/usage_reports/messaging/{id}`

```python
messaging = client.legacy.reporting.usage_reports.messaging.delete(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(messaging.data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## List telco data usage reports

Retrieve a paginated list of telco data usage reports

`GET /legacy/reporting/usage_reports/number_lookup`

```python
number_lookups = client.legacy.reporting.usage_reports.number_lookup.list()
print(number_lookups.data)
```

Returns: `aggregation_type` (string), `created_at` (date-time), `end_date` (date), `id` (uuid), `managed_accounts` (array[string]), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date), `status` (string), `updated_at` (date-time)

## Submit telco data usage report

Submit a new telco data usage report

`POST /legacy/reporting/usage_reports/number_lookup`

```python
number_lookup = client.legacy.reporting.usage_reports.number_lookup.create()
print(number_lookup.data)
```

Returns: `aggregation_type` (string), `created_at` (date-time), `end_date` (date), `id` (uuid), `managed_accounts` (array[string]), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date), `status` (string), `updated_at` (date-time)

## Get telco data usage report by ID

Retrieve a specific telco data usage report by its ID

`GET /legacy/reporting/usage_reports/number_lookup/{id}`

```python
number_lookup = client.legacy.reporting.usage_reports.number_lookup.retrieve(
    "id",
)
print(number_lookup.data)
```

Returns: `aggregation_type` (string), `created_at` (date-time), `end_date` (date), `id` (uuid), `managed_accounts` (array[string]), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date), `status` (string), `updated_at` (date-time)

## Delete telco data usage report

Delete a specific telco data usage report by its ID

`DELETE /legacy/reporting/usage_reports/number_lookup/{id}`

```python
client.legacy.reporting.usage_reports.number_lookup.delete(
    "id",
)
```

## List CDR usage reports

Fetch all previous requests for cdr usage reports.

`GET /legacy/reporting/usage_reports/voice`

```python
page = client.legacy.reporting.usage_reports.voice.list()
page = page.data[0]
print(page.id)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Create a new legacy usage V2 CDR report request

Creates a new legacy usage V2 CDR report request with the specified filters

`POST /legacy/reporting/usage_reports/voice`

```python
from datetime import datetime

voice = client.legacy.reporting.usage_reports.voice.create(
    end_time=datetime.fromisoformat("2024-02-01T00:00:00"),
    start_time=datetime.fromisoformat("2024-02-01T00:00:00"),
)
print(voice.data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Get a CDR usage report

Fetch single cdr usage report by id.

`GET /legacy/reporting/usage_reports/voice/{id}`

```python
voice = client.legacy.reporting.usage_reports.voice.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(voice.data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Delete a V2 legacy usage CDR report request

Deletes a specific V2 legacy usage CDR report request by ID

`DELETE /legacy/reporting/usage_reports/voice/{id}`

```python
voice = client.legacy.reporting.usage_reports.voice.delete(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(voice.data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## List CSV downloads

`GET /phone_numbers/csv_downloads`

```python
page = client.phone_numbers.csv_downloads.list()
page = page.data[0]
print(page.id)
```

Returns: `id` (string), `record_type` (string), `status` (enum: pending, complete, failed, expired), `url` (string)

## Create a CSV download

`POST /phone_numbers/csv_downloads`

```python
csv_download = client.phone_numbers.csv_downloads.create()
print(csv_download.data)
```

Returns: `id` (string), `record_type` (string), `status` (enum: pending, complete, failed, expired), `url` (string)

## Retrieve a CSV download

`GET /phone_numbers/csv_downloads/{id}`

```python
csv_download = client.phone_numbers.csv_downloads.retrieve(
    "id",
)
print(csv_download.data)
```

Returns: `id` (string), `record_type` (string), `status` (enum: pending, complete, failed, expired), `url` (string)

## Generates and fetches CDR Usage Reports

Generate and fetch voice usage report synchronously. This endpoint will both generate and fetch the voice report over a specified time period. No polling is necessary but the response may take up to a couple of minutes.

`GET /reports/cdr_usage_reports/sync`

```python
response = client.reports.cdr_usage_reports.fetch_sync(
    aggregation_type="NO_AGGREGATION",
    product_breakdown="NO_BREAKDOWN",
)
print(response.data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, CONNECTION, TAG, BILLING_GROUP), `connections` (array[integer]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (enum: NO_BREAKDOWN, DID_VS_TOLL_FREE, COUNTRY, DID_VS_TOLL_FREE_PER_COUNTRY), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Fetch all Messaging usage reports

Fetch all messaging usage reports. Usage reports are aggregated messaging data for specified time period and breakdown

`GET /reports/mdr_usage_reports`

```python
page = client.reports.mdr_usage_reports.list()
page = page.data[0]
print(page.id)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Create MDR Usage Report

Submit request for new new messaging usage report. This endpoint will pull and aggregate messaging data in specified time period.

`POST /reports/mdr_usage_reports`

```python
from datetime import datetime

mdr_usage_report = client.reports.mdr_usage_reports.create(
    aggregation_type="NO_AGGREGATION",
    end_date=datetime.fromisoformat("2020-07-01T00:00:00-06:00"),
    start_date=datetime.fromisoformat("2020-07-01T00:00:00-06:00"),
)
print(mdr_usage_report.data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Generate and fetch MDR Usage Report

Generate and fetch messaging usage report synchronously. This endpoint will both generate and fetch the messaging report over a specified time period. No polling is necessary but the response may take up to a couple of minutes.

`GET /reports/mdr_usage_reports/sync`

```python
response = client.reports.mdr_usage_reports.fetch_sync(
    aggregation_type="PROFILE",
)
print(response.data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Retrieve messaging report

Fetch a single messaging usage report by id

`GET /reports/mdr_usage_reports/{id}`

```python
mdr_usage_report = client.reports.mdr_usage_reports.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(mdr_usage_report.data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Delete MDR Usage Report

Delete messaging usage report by id

`DELETE /reports/mdr_usage_reports/{id}`

```python
mdr_usage_report = client.reports.mdr_usage_reports.delete(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(mdr_usage_report.data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Fetch all Mdr records

`GET /reports/mdrs`

```python
response = client.reports.list_mdrs()
print(response.data)
```

Returns: `cld` (string), `cli` (string), `cost` (string), `created_at` (date-time), `currency` (enum: AUD, CAD, EUR, GBP, USD), `direction` (string), `id` (string), `message_type` (enum: SMS, MMS), `parts` (number), `profile_name` (string), `rate` (string), `record_type` (string), `status` (enum: GW_TIMEOUT, DELIVERED, DLR_UNCONFIRMED, DLR_TIMEOUT, RECEIVED, GW_REJECT, FAILED)

## Fetches all Wdr records

Fetch all Wdr records

`GET /reports/wdrs`

```python
page = client.reports.list_wdrs()
page = page.data[0]
print(page.id)
```

Returns: `cost` (object), `created_at` (date-time), `downlink_data` (object), `duration_seconds` (number), `id` (string), `imsi` (string), `mcc` (string), `mnc` (string), `phone_number` (string), `rate` (object), `record_type` (string), `sim_card_id` (string), `sim_group_id` (string), `sim_group_name` (string), `uplink_data` (object)

## Get metadata overview

Returns all available record types and supported query parameters for session analysis.

`GET /session_analysis/metadata`

```python
metadata = client.session_analysis.metadata.retrieve()
print(metadata.meta)
```

Returns: `meta` (object), `query_parameters` (object), `record_types` (array[object])

## Get record type metadata

Returns detailed metadata for a specific record type, including relationships and examples.

`GET /session_analysis/metadata/{record_type}`

```python
response = client.session_analysis.metadata.retrieve_record_type(
    "record_type",
)
print(response.aliases)
```

Returns: `aliases` (array[string]), `child_relationships` (array[object]), `event` (string), `examples` (object), `meta` (object), `parent_relationships` (array[object]), `product` (string), `record_type` (string)

## Get session analysis

Retrieves a full session analysis tree for a given event, including costs, child events, and product linkages.

`GET /session_analysis/{record_type}/{event_id}`

```python
session_analysis = client.session_analysis.retrieve(
    event_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    record_type="record_type",
)
print(session_analysis.session_id)
```

Returns: `completed_at` (date-time), `cost` (object), `created_at` (date-time), `meta` (object), `root` (object), `session_id` (string), `status` (string)

## Get Telnyx product usage data (BETA)

Get Telnyx usage data by product, broken out by the specified dimensions

`GET /usage_reports`

```python
page = client.usage_reports.list(
    dimensions=["string"],
    metrics=["string"],
    product="product",
)
page = page.data[0]
print(page)
```

Returns: `data` (array[object]), `meta` (object)

## Get Usage Reports query options (BETA)

Get the Usage Reports options for querying usage, including the products available and their respective metrics and dimensions

`GET /usage_reports/options`

```python
response = client.usage_reports.get_options()
print(response.data)
```

Returns: `product` (string), `product_dimensions` (array[string]), `product_metrics` (array[string]), `record_types` (array[object])
