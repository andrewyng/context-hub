---
name: account-reports
description: "Generate and retrieve usage reports for billing, analytics, and reconciliation."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,account,reports,usage,analytics,billing"
---

# Telnyx Account Reports Java SDK Coding Guidelines

You are a Telnyx Account Reports API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

## Golden Rule: Use the Official SDK

Always use the official `com.telnyx.sdk:telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import com.telnyx.sdk.client.TelnyxClient`
- **Incorrect:** unofficial Java clients or raw HTTP calls

## Installation

```text
<!-- Maven -->
<dependency>
    <groupId>com.telnyx.sdk</groupId>
    <artifactId>telnyx-java</artifactId>
    <version>6.26.0</version>
</dependency>

// Gradle
implementation("com.telnyx.sdk:telnyx-java:6.26.0")
```

## Setup

```java
import com.telnyx.sdk.client.TelnyxClient;
import com.telnyx.sdk.client.okhttp.TelnyxOkHttpClient;

TelnyxClient client = TelnyxOkHttpClient.fromEnv();
```

All examples below assume `client` is already initialized as shown above.

## List call events

Filters call events by given filter parameters. Events are ordered by `occurred_at`. If filter for `leg_id` or `application_session_id` is not present, it only filters events from the last 24 hours.

`GET /call_events`

```java
import com.telnyx.sdk.models.callevents.CallEventListPage;
import com.telnyx.sdk.models.callevents.CallEventListParams;

CallEventListPage page = client.callEvents().list();
```

Returns: `call_leg_id` (string), `call_session_id` (string), `event_timestamp` (string), `metadata` (object), `name` (string), `record_type` (enum: call_event), `type` (enum: command, webhook)

## Create a ledger billing group report

`POST /ledger_billing_group_reports`

Optional: `month` (integer), `year` (integer)

```java
import com.telnyx.sdk.models.ledgerbillinggroupreports.LedgerBillingGroupReportCreateParams;
import com.telnyx.sdk.models.ledgerbillinggroupreports.LedgerBillingGroupReportCreateResponse;

LedgerBillingGroupReportCreateResponse ledgerBillingGroupReport = client.ledgerBillingGroupReports().create();
```

Returns: `created_at` (date-time), `id` (uuid), `organization_id` (uuid), `record_type` (enum: ledger_billing_group_report), `report_url` (uri), `status` (enum: pending, complete, failed, deleted), `updated_at` (date-time)

## Get a ledger billing group report

`GET /ledger_billing_group_reports/{id}`

```java
import com.telnyx.sdk.models.ledgerbillinggroupreports.LedgerBillingGroupReportRetrieveParams;
import com.telnyx.sdk.models.ledgerbillinggroupreports.LedgerBillingGroupReportRetrieveResponse;

LedgerBillingGroupReportRetrieveResponse ledgerBillingGroupReport = client.ledgerBillingGroupReports().retrieve("f5586561-8ff0-4291-a0ac-84fe544797bd");
```

Returns: `created_at` (date-time), `id` (uuid), `organization_id` (uuid), `record_type` (enum: ledger_billing_group_report), `report_url` (uri), `status` (enum: pending, complete, failed, deleted), `updated_at` (date-time)

## Get all MDR detailed report requests

Retrieves all MDR detailed report requests for the authenticated user

`GET /legacy/reporting/batch_detail_records/messaging`

```java
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.messaging.MessagingListParams;
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.messaging.MessagingListResponse;

MessagingListResponse messagings = client.legacy().reporting().batchDetailRecords().messaging().list();
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Create a new MDR detailed report request

Creates a new MDR detailed report request with the specified filters

`POST /legacy/reporting/batch_detail_records/messaging` — Required: `start_time`, `end_time`

Optional: `connections` (array[integer]), `directions` (array[integer]), `filters` (array[object]), `include_message_body` (boolean), `managed_accounts` (array[string]), `profiles` (array[string]), `record_types` (array[integer]), `report_name` (string), `select_all_managed_accounts` (boolean), `timezone` (string)

```java
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.messaging.MessagingCreateParams;
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.messaging.MessagingCreateResponse;
import java.time.OffsetDateTime;

MessagingCreateParams params = MessagingCreateParams.builder()
    .endTime(OffsetDateTime.parse("2024-02-12T23:59:59Z"))
    .startTime(OffsetDateTime.parse("2024-02-01T00:00:00Z"))
    .build();
MessagingCreateResponse messaging = client.legacy().reporting().batchDetailRecords().messaging().create(params);
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Get a specific MDR detailed report request

Retrieves a specific MDR detailed report request by ID

`GET /legacy/reporting/batch_detail_records/messaging/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.messaging.MessagingRetrieveParams;
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.messaging.MessagingRetrieveResponse;

MessagingRetrieveResponse messaging = client.legacy().reporting().batchDetailRecords().messaging().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Delete a MDR detailed report request

Deletes a specific MDR detailed report request by ID

`DELETE /legacy/reporting/batch_detail_records/messaging/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.messaging.MessagingDeleteParams;
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.messaging.MessagingDeleteResponse;

MessagingDeleteResponse messaging = client.legacy().reporting().batchDetailRecords().messaging().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Get all CDR report requests

Retrieves all CDR report requests for the authenticated user

`GET /legacy/reporting/batch_detail_records/voice`

```java
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceListParams;
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceListResponse;

VoiceListResponse voices = client.legacy().reporting().batchDetailRecords().voice().list();
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## Create a new CDR report request

Creates a new CDR report request with the specified filters

`POST /legacy/reporting/batch_detail_records/voice` — Required: `start_time`, `end_time`

Optional: `call_types` (array[integer]), `connections` (array[integer]), `fields` (array[string]), `filters` (array[object]), `include_all_metadata` (boolean), `managed_accounts` (array[string]), `record_types` (array[integer]), `report_name` (string), `select_all_managed_accounts` (boolean), `source` (string), `timezone` (string)

```java
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceCreateParams;
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceCreateResponse;
import java.time.OffsetDateTime;

VoiceCreateParams params = VoiceCreateParams.builder()
    .endTime(OffsetDateTime.parse("2024-02-12T23:59:59Z"))
    .startTime(OffsetDateTime.parse("2024-02-01T00:00:00Z"))
    .build();
VoiceCreateResponse voice = client.legacy().reporting().batchDetailRecords().voice().create(params);
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## Get available CDR report fields

Retrieves all available fields that can be used in CDR reports

`GET /legacy/reporting/batch_detail_records/voice/fields`

```java
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceRetrieveFieldsParams;
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceRetrieveFieldsResponse;

VoiceRetrieveFieldsResponse response = client.legacy().reporting().batchDetailRecords().voice().retrieveFields();
```

Returns: `Billing` (array[string]), `Interaction Data` (array[string]), `Number Information` (array[string]), `Telephony Data` (array[string])

## Get a specific CDR report request

Retrieves a specific CDR report request by ID

`GET /legacy/reporting/batch_detail_records/voice/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceRetrieveParams;
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceRetrieveResponse;

VoiceRetrieveResponse voice = client.legacy().reporting().batchDetailRecords().voice().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## Delete a CDR report request

Deletes a specific CDR report request by ID

`DELETE /legacy/reporting/batch_detail_records/voice/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceDeleteParams;
import com.telnyx.sdk.models.legacy.reporting.batchdetailrecords.voice.VoiceDeleteResponse;

VoiceDeleteResponse voice = client.legacy().reporting().batchDetailRecords().voice().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## List MDR usage reports

Fetch all previous requests for MDR usage reports.

`GET /legacy/reporting/usage_reports/messaging`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.messaging.MessagingListPage;
import com.telnyx.sdk.models.legacy.reporting.usagereports.messaging.MessagingListParams;

MessagingListPage page = client.legacy().reporting().usageReports().messaging().list();
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Create a new legacy usage V2 MDR report request

Creates a new legacy usage V2 MDR report request with the specified filters

`POST /legacy/reporting/usage_reports/messaging`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.messaging.MessagingCreateParams;
import com.telnyx.sdk.models.legacy.reporting.usagereports.messaging.MessagingCreateResponse;

MessagingCreateParams params = MessagingCreateParams.builder()
    .aggregationType(0)
    .build();
MessagingCreateResponse messaging = client.legacy().reporting().usageReports().messaging().create(params);
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Get an MDR usage report

Fetch single MDR usage report by id.

`GET /legacy/reporting/usage_reports/messaging/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.messaging.MessagingRetrieveParams;
import com.telnyx.sdk.models.legacy.reporting.usagereports.messaging.MessagingRetrieveResponse;

MessagingRetrieveResponse messaging = client.legacy().reporting().usageReports().messaging().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Delete a V2 legacy usage MDR report request

Deletes a specific V2 legacy usage MDR report request by ID

`DELETE /legacy/reporting/usage_reports/messaging/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.messaging.MessagingDeleteParams;
import com.telnyx.sdk.models.legacy.reporting.usagereports.messaging.MessagingDeleteResponse;

MessagingDeleteResponse messaging = client.legacy().reporting().usageReports().messaging().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## List telco data usage reports

Retrieve a paginated list of telco data usage reports

`GET /legacy/reporting/usage_reports/number_lookup`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.numberlookup.NumberLookupListParams;
import com.telnyx.sdk.models.legacy.reporting.usagereports.numberlookup.NumberLookupListResponse;

NumberLookupListResponse numberLookups = client.legacy().reporting().usageReports().numberLookup().list();
```

Returns: `aggregation_type` (string), `created_at` (date-time), `end_date` (date), `id` (uuid), `managed_accounts` (array[string]), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date), `status` (string), `updated_at` (date-time)

## Submit telco data usage report

Submit a new telco data usage report

`POST /legacy/reporting/usage_reports/number_lookup`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.numberlookup.NumberLookupCreateParams;
import com.telnyx.sdk.models.legacy.reporting.usagereports.numberlookup.NumberLookupCreateResponse;

NumberLookupCreateResponse numberLookup = client.legacy().reporting().usageReports().numberLookup().create();
```

Returns: `aggregation_type` (string), `created_at` (date-time), `end_date` (date), `id` (uuid), `managed_accounts` (array[string]), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date), `status` (string), `updated_at` (date-time)

## Get telco data usage report by ID

Retrieve a specific telco data usage report by its ID

`GET /legacy/reporting/usage_reports/number_lookup/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.numberlookup.NumberLookupRetrieveParams;
import com.telnyx.sdk.models.legacy.reporting.usagereports.numberlookup.NumberLookupRetrieveResponse;

NumberLookupRetrieveResponse numberLookup = client.legacy().reporting().usageReports().numberLookup().retrieve("id");
```

Returns: `aggregation_type` (string), `created_at` (date-time), `end_date` (date), `id` (uuid), `managed_accounts` (array[string]), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date), `status` (string), `updated_at` (date-time)

## Delete telco data usage report

Delete a specific telco data usage report by its ID

`DELETE /legacy/reporting/usage_reports/number_lookup/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.numberlookup.NumberLookupDeleteParams;

client.legacy().reporting().usageReports().numberLookup().delete("id");
```

## List CDR usage reports

Fetch all previous requests for cdr usage reports.

`GET /legacy/reporting/usage_reports/voice`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.voice.VoiceListPage;
import com.telnyx.sdk.models.legacy.reporting.usagereports.voice.VoiceListParams;

VoiceListPage page = client.legacy().reporting().usageReports().voice().list();
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Create a new legacy usage V2 CDR report request

Creates a new legacy usage V2 CDR report request with the specified filters

`POST /legacy/reporting/usage_reports/voice`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.voice.VoiceCreateParams;
import com.telnyx.sdk.models.legacy.reporting.usagereports.voice.VoiceCreateResponse;
import java.time.OffsetDateTime;

VoiceCreateParams params = VoiceCreateParams.builder()
    .endTime(OffsetDateTime.parse("2024-02-01T00:00:00Z"))
    .startTime(OffsetDateTime.parse("2024-02-01T00:00:00Z"))
    .build();
VoiceCreateResponse voice = client.legacy().reporting().usageReports().voice().create(params);
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Get a CDR usage report

Fetch single cdr usage report by id.

`GET /legacy/reporting/usage_reports/voice/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.voice.VoiceRetrieveParams;
import com.telnyx.sdk.models.legacy.reporting.usagereports.voice.VoiceRetrieveResponse;

VoiceRetrieveResponse voice = client.legacy().reporting().usageReports().voice().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Delete a V2 legacy usage CDR report request

Deletes a specific V2 legacy usage CDR report request by ID

`DELETE /legacy/reporting/usage_reports/voice/{id}`

```java
import com.telnyx.sdk.models.legacy.reporting.usagereports.voice.VoiceDeleteParams;
import com.telnyx.sdk.models.legacy.reporting.usagereports.voice.VoiceDeleteResponse;

VoiceDeleteResponse voice = client.legacy().reporting().usageReports().voice().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## List CSV downloads

`GET /phone_numbers/csv_downloads`

```java
import com.telnyx.sdk.models.phonenumbers.csvdownloads.CsvDownloadListPage;
import com.telnyx.sdk.models.phonenumbers.csvdownloads.CsvDownloadListParams;

CsvDownloadListPage page = client.phoneNumbers().csvDownloads().list();
```

Returns: `id` (string), `record_type` (string), `status` (enum: pending, complete, failed, expired), `url` (string)

## Create a CSV download

`POST /phone_numbers/csv_downloads`

```java
import com.telnyx.sdk.models.phonenumbers.csvdownloads.CsvDownloadCreateParams;
import com.telnyx.sdk.models.phonenumbers.csvdownloads.CsvDownloadCreateResponse;

CsvDownloadCreateResponse csvDownload = client.phoneNumbers().csvDownloads().create();
```

Returns: `id` (string), `record_type` (string), `status` (enum: pending, complete, failed, expired), `url` (string)

## Retrieve a CSV download

`GET /phone_numbers/csv_downloads/{id}`

```java
import com.telnyx.sdk.models.phonenumbers.csvdownloads.CsvDownloadRetrieveParams;
import com.telnyx.sdk.models.phonenumbers.csvdownloads.CsvDownloadRetrieveResponse;

CsvDownloadRetrieveResponse csvDownload = client.phoneNumbers().csvDownloads().retrieve("id");
```

Returns: `id` (string), `record_type` (string), `status` (enum: pending, complete, failed, expired), `url` (string)

## Generates and fetches CDR Usage Reports

Generate and fetch voice usage report synchronously. This endpoint will both generate and fetch the voice report over a specified time period. No polling is necessary but the response may take up to a couple of minutes.

`GET /reports/cdr_usage_reports/sync`

```java
import com.telnyx.sdk.models.reports.cdrusagereports.CdrUsageReportFetchSyncParams;
import com.telnyx.sdk.models.reports.cdrusagereports.CdrUsageReportFetchSyncResponse;

CdrUsageReportFetchSyncParams params = CdrUsageReportFetchSyncParams.builder()
    .aggregationType(CdrUsageReportFetchSyncParams.AggregationType.NO_AGGREGATION)
    .productBreakdown(CdrUsageReportFetchSyncParams.ProductBreakdown.NO_BREAKDOWN)
    .build();
CdrUsageReportFetchSyncResponse response = client.reports().cdrUsageReports().fetchSync(params);
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, CONNECTION, TAG, BILLING_GROUP), `connections` (array[integer]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (enum: NO_BREAKDOWN, DID_VS_TOLL_FREE, COUNTRY, DID_VS_TOLL_FREE_PER_COUNTRY), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Fetch all Messaging usage reports

Fetch all messaging usage reports. Usage reports are aggregated messaging data for specified time period and breakdown

`GET /reports/mdr_usage_reports`

```java
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportListPage;
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportListParams;

MdrUsageReportListPage page = client.reports().mdrUsageReports().list();
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Create MDR Usage Report

Submit request for new new messaging usage report. This endpoint will pull and aggregate messaging data in specified time period.

`POST /reports/mdr_usage_reports`

```java
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportCreateParams;
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportCreateResponse;
import java.time.OffsetDateTime;

MdrUsageReportCreateParams params = MdrUsageReportCreateParams.builder()
    .aggregationType(MdrUsageReportCreateParams.AggregationType.NO_AGGREGATION)
    .endDate(OffsetDateTime.parse("2020-07-01T00:00:00-06:00"))
    .startDate(OffsetDateTime.parse("2020-07-01T00:00:00-06:00"))
    .build();
MdrUsageReportCreateResponse mdrUsageReport = client.reports().mdrUsageReports().create(params);
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Generate and fetch MDR Usage Report

Generate and fetch messaging usage report synchronously. This endpoint will both generate and fetch the messaging report over a specified time period. No polling is necessary but the response may take up to a couple of minutes.

`GET /reports/mdr_usage_reports/sync`

```java
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportFetchSyncParams;
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportFetchSyncResponse;

MdrUsageReportFetchSyncParams params = MdrUsageReportFetchSyncParams.builder()
    .aggregationType(MdrUsageReportFetchSyncParams.AggregationType.PROFILE)
    .build();
MdrUsageReportFetchSyncResponse response = client.reports().mdrUsageReports().fetchSync(params);
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Retrieve messaging report

Fetch a single messaging usage report by id

`GET /reports/mdr_usage_reports/{id}`

```java
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportRetrieveParams;
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportRetrieveResponse;

MdrUsageReportRetrieveResponse mdrUsageReport = client.reports().mdrUsageReports().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Delete MDR Usage Report

Delete messaging usage report by id

`DELETE /reports/mdr_usage_reports/{id}`

```java
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportDeleteParams;
import com.telnyx.sdk.models.reports.mdrusagereports.MdrUsageReportDeleteResponse;

MdrUsageReportDeleteResponse mdrUsageReport = client.reports().mdrUsageReports().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Fetch all Mdr records

`GET /reports/mdrs`

```java
import com.telnyx.sdk.models.reports.ReportListMdrsParams;
import com.telnyx.sdk.models.reports.ReportListMdrsResponse;

ReportListMdrsResponse response = client.reports().listMdrs();
```

Returns: `cld` (string), `cli` (string), `cost` (string), `created_at` (date-time), `currency` (enum: AUD, CAD, EUR, GBP, USD), `direction` (string), `id` (string), `message_type` (enum: SMS, MMS), `parts` (number), `profile_name` (string), `rate` (string), `record_type` (string), `status` (enum: GW_TIMEOUT, DELIVERED, DLR_UNCONFIRMED, DLR_TIMEOUT, RECEIVED, GW_REJECT, FAILED)

## Fetches all Wdr records

Fetch all Wdr records

`GET /reports/wdrs`

```java
import com.telnyx.sdk.models.reports.ReportListWdrsPage;
import com.telnyx.sdk.models.reports.ReportListWdrsParams;

ReportListWdrsPage page = client.reports().listWdrs();
```

Returns: `cost` (object), `created_at` (date-time), `downlink_data` (object), `duration_seconds` (number), `id` (string), `imsi` (string), `mcc` (string), `mnc` (string), `phone_number` (string), `rate` (object), `record_type` (string), `sim_card_id` (string), `sim_group_id` (string), `sim_group_name` (string), `uplink_data` (object)

## Get metadata overview

Returns all available record types and supported query parameters for session analysis.

`GET /session_analysis/metadata`

```java
import com.telnyx.sdk.models.sessionanalysis.metadata.MetadataRetrieveParams;
import com.telnyx.sdk.models.sessionanalysis.metadata.MetadataRetrieveResponse;

MetadataRetrieveResponse metadata = client.sessionAnalysis().metadata().retrieve();
```

Returns: `meta` (object), `query_parameters` (object), `record_types` (array[object])

## Get record type metadata

Returns detailed metadata for a specific record type, including relationships and examples.

`GET /session_analysis/metadata/{record_type}`

```java
import com.telnyx.sdk.models.sessionanalysis.metadata.MetadataRetrieveRecordTypeParams;
import com.telnyx.sdk.models.sessionanalysis.metadata.MetadataRetrieveRecordTypeResponse;

MetadataRetrieveRecordTypeResponse response = client.sessionAnalysis().metadata().retrieveRecordType("record_type");
```

Returns: `aliases` (array[string]), `child_relationships` (array[object]), `event` (string), `examples` (object), `meta` (object), `parent_relationships` (array[object]), `product` (string), `record_type` (string)

## Get session analysis

Retrieves a full session analysis tree for a given event, including costs, child events, and product linkages.

`GET /session_analysis/{record_type}/{event_id}`

```java
import com.telnyx.sdk.models.sessionanalysis.SessionAnalysisRetrieveParams;
import com.telnyx.sdk.models.sessionanalysis.SessionAnalysisRetrieveResponse;

SessionAnalysisRetrieveParams params = SessionAnalysisRetrieveParams.builder()
    .recordType("record_type")
    .eventId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
SessionAnalysisRetrieveResponse sessionAnalysis = client.sessionAnalysis().retrieve(params);
```

Returns: `completed_at` (date-time), `cost` (object), `created_at` (date-time), `meta` (object), `root` (object), `session_id` (string), `status` (string)

## Get Telnyx product usage data (BETA)

Get Telnyx usage data by product, broken out by the specified dimensions

`GET /usage_reports`

```java
import com.telnyx.sdk.models.usagereports.UsageReportListPage;
import com.telnyx.sdk.models.usagereports.UsageReportListParams;

UsageReportListParams params = UsageReportListParams.builder()
    .addDimension("string")
    .addMetric("string")
    .product("product")
    .build();
UsageReportListPage page = client.usageReports().list(params);
```

Returns: `data` (array[object]), `meta` (object)

## Get Usage Reports query options (BETA)

Get the Usage Reports options for querying usage, including the products available and their respective metrics and dimensions

`GET /usage_reports/options`

```java
import com.telnyx.sdk.models.usagereports.UsageReportGetOptionsParams;
import com.telnyx.sdk.models.usagereports.UsageReportGetOptionsResponse;

UsageReportGetOptionsResponse response = client.usageReports().getOptions();
```

Returns: `product` (string), `product_dimensions` (array[string]), `product_metrics` (array[string]), `record_types` (array[object])
