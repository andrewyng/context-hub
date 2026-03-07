---
name: account-reports
description: "Generate and retrieve usage reports for billing, analytics, and reconciliation."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,account,reports,usage,analytics,billing"
---

# Telnyx Account Reports Go SDK Coding Guidelines

You are a Telnyx Account Reports API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

## Golden Rule: Use the Official SDK

Always use the official `github.com/team-telnyx/telnyx-go` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import "github.com/team-telnyx/telnyx-go"`
- **Incorrect:** unofficial Go clients or raw HTTP calls

## Installation

```bash
go get github.com/team-telnyx/telnyx-go
```

## Setup

```go
import (
  "context"
  "fmt"
  "os"

  "github.com/team-telnyx/telnyx-go"
  "github.com/team-telnyx/telnyx-go/option"
)

client := telnyx.NewClient(
  option.WithAPIKey(os.Getenv("TELNYX_API_KEY")),
)
```

All examples below assume `client` is already initialized as shown above.

## List call events

Filters call events by given filter parameters. Events are ordered by `occurred_at`. If filter for `leg_id` or `application_session_id` is not present, it only filters events from the last 24 hours.

`GET /call_events`

```go
	page, err := client.CallEvents.List(context.TODO(), telnyx.CallEventListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `call_leg_id` (string), `call_session_id` (string), `event_timestamp` (string), `metadata` (object), `name` (string), `record_type` (enum: call_event), `type` (enum: command, webhook)

## Create a ledger billing group report

`POST /ledger_billing_group_reports`

Optional: `month` (integer), `year` (integer)

```go
	ledgerBillingGroupReport, err := client.LedgerBillingGroupReports.New(context.TODO(), telnyx.LedgerBillingGroupReportNewParams{
		Month: telnyx.Int(10),
		Year:  telnyx.Int(2019),
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", ledgerBillingGroupReport.Data)
```

Returns: `created_at` (date-time), `id` (uuid), `organization_id` (uuid), `record_type` (enum: ledger_billing_group_report), `report_url` (uri), `status` (enum: pending, complete, failed, deleted), `updated_at` (date-time)

## Get a ledger billing group report

`GET /ledger_billing_group_reports/{id}`

```go
	ledgerBillingGroupReport, err := client.LedgerBillingGroupReports.Get(context.TODO(), "f5586561-8ff0-4291-a0ac-84fe544797bd")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", ledgerBillingGroupReport.Data)
```

Returns: `created_at` (date-time), `id` (uuid), `organization_id` (uuid), `record_type` (enum: ledger_billing_group_report), `report_url` (uri), `status` (enum: pending, complete, failed, deleted), `updated_at` (date-time)

## Get all MDR detailed report requests

Retrieves all MDR detailed report requests for the authenticated user

`GET /legacy/reporting/batch_detail_records/messaging`

```go
	messagings, err := client.Legacy.Reporting.BatchDetailRecords.Messaging.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messagings.Data)
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Create a new MDR detailed report request

Creates a new MDR detailed report request with the specified filters

`POST /legacy/reporting/batch_detail_records/messaging` — Required: `start_time`, `end_time`

Optional: `connections` (array[integer]), `directions` (array[integer]), `filters` (array[object]), `include_message_body` (boolean), `managed_accounts` (array[string]), `profiles` (array[string]), `record_types` (array[integer]), `report_name` (string), `select_all_managed_accounts` (boolean), `timezone` (string)

```go
	messaging, err := client.Legacy.Reporting.BatchDetailRecords.Messaging.New(context.TODO(), telnyx.LegacyReportingBatchDetailRecordMessagingNewParams{
		EndTime:   time.Now(),
		StartTime: time.Now(),
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messaging.Data)
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Get a specific MDR detailed report request

Retrieves a specific MDR detailed report request by ID

`GET /legacy/reporting/batch_detail_records/messaging/{id}`

```go
	messaging, err := client.Legacy.Reporting.BatchDetailRecords.Messaging.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messaging.Data)
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Delete a MDR detailed report request

Deletes a specific MDR detailed report request by ID

`DELETE /legacy/reporting/batch_detail_records/messaging/{id}`

```go
	messaging, err := client.Legacy.Reporting.BatchDetailRecords.Messaging.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messaging.Data)
```

Returns: `connections` (array[integer]), `created_at` (date-time), `directions` (array[string]), `end_date` (date-time), `filters` (array[object]), `id` (uuid), `profiles` (array[string]), `record_type` (string), `record_types` (array[string]), `report_name` (string), `report_url` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Get all CDR report requests

Retrieves all CDR report requests for the authenticated user

`GET /legacy/reporting/batch_detail_records/voice`

```go
	voices, err := client.Legacy.Reporting.BatchDetailRecords.Voice.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voices.Data)
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## Create a new CDR report request

Creates a new CDR report request with the specified filters

`POST /legacy/reporting/batch_detail_records/voice` — Required: `start_time`, `end_time`

Optional: `call_types` (array[integer]), `connections` (array[integer]), `fields` (array[string]), `filters` (array[object]), `include_all_metadata` (boolean), `managed_accounts` (array[string]), `record_types` (array[integer]), `report_name` (string), `select_all_managed_accounts` (boolean), `source` (string), `timezone` (string)

```go
	voice, err := client.Legacy.Reporting.BatchDetailRecords.Voice.New(context.TODO(), telnyx.LegacyReportingBatchDetailRecordVoiceNewParams{
		EndTime:   time.Now(),
		StartTime: time.Now(),
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voice.Data)
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## Get available CDR report fields

Retrieves all available fields that can be used in CDR reports

`GET /legacy/reporting/batch_detail_records/voice/fields`

```go
	response, err := client.Legacy.Reporting.BatchDetailRecords.Voice.GetFields(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Billing)
```

Returns: `Billing` (array[string]), `Interaction Data` (array[string]), `Number Information` (array[string]), `Telephony Data` (array[string])

## Get a specific CDR report request

Retrieves a specific CDR report request by ID

`GET /legacy/reporting/batch_detail_records/voice/{id}`

```go
	voice, err := client.Legacy.Reporting.BatchDetailRecords.Voice.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voice.Data)
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## Delete a CDR report request

Deletes a specific CDR report request by ID

`DELETE /legacy/reporting/batch_detail_records/voice/{id}`

```go
	voice, err := client.Legacy.Reporting.BatchDetailRecords.Voice.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voice.Data)
```

Returns: `call_types` (array[integer]), `connections` (array[integer]), `created_at` (string), `end_time` (string), `filters` (array[object]), `id` (string), `managed_accounts` (array[string]), `record_type` (string), `record_types` (array[integer]), `report_name` (string), `report_url` (string), `retry` (int32), `source` (string), `start_time` (string), `status` (int32), `timezone` (string), `updated_at` (string)

## List MDR usage reports

Fetch all previous requests for MDR usage reports.

`GET /legacy/reporting/usage_reports/messaging`

```go
	page, err := client.Legacy.Reporting.UsageReports.Messaging.List(context.TODO(), telnyx.LegacyReportingUsageReportMessagingListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Create a new legacy usage V2 MDR report request

Creates a new legacy usage V2 MDR report request with the specified filters

`POST /legacy/reporting/usage_reports/messaging`

```go
	messaging, err := client.Legacy.Reporting.UsageReports.Messaging.New(context.TODO(), telnyx.LegacyReportingUsageReportMessagingNewParams{
		AggregationType: 0,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messaging.Data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Get an MDR usage report

Fetch single MDR usage report by id.

`GET /legacy/reporting/usage_reports/messaging/{id}`

```go
	messaging, err := client.Legacy.Reporting.UsageReports.Messaging.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messaging.Data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Delete a V2 legacy usage MDR report request

Deletes a specific V2 legacy usage MDR report request by ID

`DELETE /legacy/reporting/usage_reports/messaging/{id}`

```go
	messaging, err := client.Legacy.Reporting.UsageReports.Messaging.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messaging.Data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `profiles` (array[string]), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## List telco data usage reports

Retrieve a paginated list of telco data usage reports

`GET /legacy/reporting/usage_reports/number_lookup`

```go
	numberLookups, err := client.Legacy.Reporting.UsageReports.NumberLookup.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", numberLookups.Data)
```

Returns: `aggregation_type` (string), `created_at` (date-time), `end_date` (date), `id` (uuid), `managed_accounts` (array[string]), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date), `status` (string), `updated_at` (date-time)

## Submit telco data usage report

Submit a new telco data usage report

`POST /legacy/reporting/usage_reports/number_lookup`

```go
	numberLookup, err := client.Legacy.Reporting.UsageReports.NumberLookup.New(context.TODO(), telnyx.LegacyReportingUsageReportNumberLookupNewParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", numberLookup.Data)
```

Returns: `aggregation_type` (string), `created_at` (date-time), `end_date` (date), `id` (uuid), `managed_accounts` (array[string]), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date), `status` (string), `updated_at` (date-time)

## Get telco data usage report by ID

Retrieve a specific telco data usage report by its ID

`GET /legacy/reporting/usage_reports/number_lookup/{id}`

```go
	numberLookup, err := client.Legacy.Reporting.UsageReports.NumberLookup.Get(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", numberLookup.Data)
```

Returns: `aggregation_type` (string), `created_at` (date-time), `end_date` (date), `id` (uuid), `managed_accounts` (array[string]), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date), `status` (string), `updated_at` (date-time)

## Delete telco data usage report

Delete a specific telco data usage report by its ID

`DELETE /legacy/reporting/usage_reports/number_lookup/{id}`

```go
	err := client.Legacy.Reporting.UsageReports.NumberLookup.Delete(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
```

## List CDR usage reports

Fetch all previous requests for cdr usage reports.

`GET /legacy/reporting/usage_reports/voice`

```go
	page, err := client.Legacy.Reporting.UsageReports.Voice.List(context.TODO(), telnyx.LegacyReportingUsageReportVoiceListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Create a new legacy usage V2 CDR report request

Creates a new legacy usage V2 CDR report request with the specified filters

`POST /legacy/reporting/usage_reports/voice`

```go
	voice, err := client.Legacy.Reporting.UsageReports.Voice.New(context.TODO(), telnyx.LegacyReportingUsageReportVoiceNewParams{
		EndTime:   time.Now(),
		StartTime: time.Now(),
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voice.Data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Get a CDR usage report

Fetch single cdr usage report by id.

`GET /legacy/reporting/usage_reports/voice/{id}`

```go
	voice, err := client.Legacy.Reporting.UsageReports.Voice.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voice.Data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## Delete a V2 legacy usage CDR report request

Deletes a specific V2 legacy usage CDR report request by ID

`DELETE /legacy/reporting/usage_reports/voice/{id}`

```go
	voice, err := client.Legacy.Reporting.UsageReports.Voice.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voice.Data)
```

Returns: `aggregation_type` (int32), `connections` (array[string]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (int32), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (int32), `updated_at` (date-time)

## List CSV downloads

`GET /phone_numbers/csv_downloads`

```go
	page, err := client.PhoneNumbers.CsvDownloads.List(context.TODO(), telnyx.PhoneNumberCsvDownloadListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `id` (string), `record_type` (string), `status` (enum: pending, complete, failed, expired), `url` (string)

## Create a CSV download

`POST /phone_numbers/csv_downloads`

```go
	csvDownload, err := client.PhoneNumbers.CsvDownloads.New(context.TODO(), telnyx.PhoneNumberCsvDownloadNewParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", csvDownload.Data)
```

Returns: `id` (string), `record_type` (string), `status` (enum: pending, complete, failed, expired), `url` (string)

## Retrieve a CSV download

`GET /phone_numbers/csv_downloads/{id}`

```go
	csvDownload, err := client.PhoneNumbers.CsvDownloads.Get(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", csvDownload.Data)
```

Returns: `id` (string), `record_type` (string), `status` (enum: pending, complete, failed, expired), `url` (string)

## Generates and fetches CDR Usage Reports

Generate and fetch voice usage report synchronously. This endpoint will both generate and fetch the voice report over a specified time period. No polling is necessary but the response may take up to a couple of minutes.

`GET /reports/cdr_usage_reports/sync`

```go
	response, err := client.Reports.CdrUsageReports.FetchSync(context.TODO(), telnyx.ReportCdrUsageReportFetchSyncParams{
		AggregationType:  telnyx.ReportCdrUsageReportFetchSyncParamsAggregationTypeNoAggregation,
		ProductBreakdown: telnyx.ReportCdrUsageReportFetchSyncParamsProductBreakdownNoBreakdown,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, CONNECTION, TAG, BILLING_GROUP), `connections` (array[integer]), `created_at` (date-time), `end_time` (date-time), `id` (uuid), `product_breakdown` (enum: NO_BREAKDOWN, DID_VS_TOLL_FREE, COUNTRY, DID_VS_TOLL_FREE_PER_COUNTRY), `record_type` (string), `report_url` (string), `result` (object), `start_time` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Fetch all Messaging usage reports

Fetch all messaging usage reports. Usage reports are aggregated messaging data for specified time period and breakdown

`GET /reports/mdr_usage_reports`

```go
	page, err := client.Reports.MdrUsageReports.List(context.TODO(), telnyx.ReportMdrUsageReportListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Create MDR Usage Report

Submit request for new new messaging usage report. This endpoint will pull and aggregate messaging data in specified time period.

`POST /reports/mdr_usage_reports`

```go
	mdrUsageReport, err := client.Reports.MdrUsageReports.New(context.TODO(), telnyx.ReportMdrUsageReportNewParams{
		AggregationType: telnyx.ReportMdrUsageReportNewParamsAggregationTypeNoAggregation,
		EndDate:         time.Now(),
		StartDate:       time.Now(),
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mdrUsageReport.Data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Generate and fetch MDR Usage Report

Generate and fetch messaging usage report synchronously. This endpoint will both generate and fetch the messaging report over a specified time period. No polling is necessary but the response may take up to a couple of minutes.

`GET /reports/mdr_usage_reports/sync`

```go
	response, err := client.Reports.MdrUsageReports.FetchSync(context.TODO(), telnyx.ReportMdrUsageReportFetchSyncParams{
		AggregationType: telnyx.ReportMdrUsageReportFetchSyncParamsAggregationTypeProfile,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Retrieve messaging report

Fetch a single messaging usage report by id

`GET /reports/mdr_usage_reports/{id}`

```go
	mdrUsageReport, err := client.Reports.MdrUsageReports.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mdrUsageReport.Data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Delete MDR Usage Report

Delete messaging usage report by id

`DELETE /reports/mdr_usage_reports/{id}`

```go
	mdrUsageReport, err := client.Reports.MdrUsageReports.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mdrUsageReport.Data)
```

Returns: `aggregation_type` (enum: NO_AGGREGATION, PROFILE, TAGS), `connections` (array[integer]), `created_at` (date-time), `end_date` (date-time), `id` (uuid), `profiles` (string), `record_type` (string), `report_url` (string), `result` (array[object]), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED), `updated_at` (date-time)

## Fetch all Mdr records

`GET /reports/mdrs`

```go
	response, err := client.Reports.ListMdrs(context.TODO(), telnyx.ReportListMdrsParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `cld` (string), `cli` (string), `cost` (string), `created_at` (date-time), `currency` (enum: AUD, CAD, EUR, GBP, USD), `direction` (string), `id` (string), `message_type` (enum: SMS, MMS), `parts` (number), `profile_name` (string), `rate` (string), `record_type` (string), `status` (enum: GW_TIMEOUT, DELIVERED, DLR_UNCONFIRMED, DLR_TIMEOUT, RECEIVED, GW_REJECT, FAILED)

## Fetches all Wdr records

Fetch all Wdr records

`GET /reports/wdrs`

```go
	page, err := client.Reports.ListWdrs(context.TODO(), telnyx.ReportListWdrsParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `cost` (object), `created_at` (date-time), `downlink_data` (object), `duration_seconds` (number), `id` (string), `imsi` (string), `mcc` (string), `mnc` (string), `phone_number` (string), `rate` (object), `record_type` (string), `sim_card_id` (string), `sim_group_id` (string), `sim_group_name` (string), `uplink_data` (object)

## Get metadata overview

Returns all available record types and supported query parameters for session analysis.

`GET /session_analysis/metadata`

```go
	metadata, err := client.SessionAnalysis.Metadata.Get(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", metadata.Meta)
```

Returns: `meta` (object), `query_parameters` (object), `record_types` (array[object])

## Get record type metadata

Returns detailed metadata for a specific record type, including relationships and examples.

`GET /session_analysis/metadata/{record_type}`

```go
	response, err := client.SessionAnalysis.Metadata.GetRecordType(context.TODO(), "record_type")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Aliases)
```

Returns: `aliases` (array[string]), `child_relationships` (array[object]), `event` (string), `examples` (object), `meta` (object), `parent_relationships` (array[object]), `product` (string), `record_type` (string)

## Get session analysis

Retrieves a full session analysis tree for a given event, including costs, child events, and product linkages.

`GET /session_analysis/{record_type}/{event_id}`

```go
	sessionAnalysis, err := client.SessionAnalysis.Get(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.SessionAnalysisGetParams{
			RecordType: "record_type",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", sessionAnalysis.SessionID)
```

Returns: `completed_at` (date-time), `cost` (object), `created_at` (date-time), `meta` (object), `root` (object), `session_id` (string), `status` (string)

## Get Telnyx product usage data (BETA)

Get Telnyx usage data by product, broken out by the specified dimensions

`GET /usage_reports`

```go
	page, err := client.UsageReports.List(context.TODO(), telnyx.UsageReportListParams{
		Dimensions: []string{"string"},
		Metrics:    []string{"string"},
		Product:    "product",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Get Usage Reports query options (BETA)

Get the Usage Reports options for querying usage, including the products available and their respective metrics and dimensions

`GET /usage_reports/options`

```go
	response, err := client.UsageReports.GetOptions(context.TODO(), telnyx.UsageReportGetOptionsParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `product` (string), `product_dimensions` (array[string]), `product_metrics` (array[string]), `record_types` (array[object])
