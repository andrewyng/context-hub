---
name: porting-out
description: "Manage port-out requests when numbers are being ported away from Telnyx. List, view, and update port-out status."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,porting,port-out,number-transfer"
---

# Telnyx Porting Out Go SDK Coding Guidelines

You are a Telnyx Porting Out API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

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

## List portout requests

Returns the portout requests according to filters

`GET /portouts`

```go
	page, err := client.Portouts.List(context.TODO(), telnyx.PortoutListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `already_ported` (boolean), `authorized_name` (string), `carrier_name` (string), `city` (string), `created_at` (string), `current_carrier` (string), `end_user_name` (string), `foc_date` (string), `host_messaging` (boolean), `id` (string), `inserted_at` (string), `lsr` (array[string]), `phone_numbers` (array[string]), `pon` (string), `reason` (string | null), `record_type` (string), `rejection_code` (integer), `requested_foc_date` (string), `service_address` (string), `spid` (string), `state` (string), `status` (enum: pending, authorized, ported, rejected, rejected-pending, canceled), `support_key` (string), `updated_at` (string), `user_id` (uuid), `vendor` (uuid), `zip` (string)

## List all port-out events

Returns a list of all port-out events.

`GET /portouts/events`

```go
	page, err := client.Portouts.Events.List(context.TODO(), telnyx.PortoutEventListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Show a port-out event

Show a specific port-out event.

`GET /portouts/events/{id}`

```go
	event, err := client.Portouts.Events.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", event.Data)
```

Returns: `data` (object)

## Republish a port-out event

Republish a specific port-out event.

`POST /portouts/events/{id}/republish`

```go
	err := client.Portouts.Events.Republish(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
```

## List eligible port-out rejection codes for a specific order

Given a port-out ID, list rejection codes that are eligible for that port-out

`GET /portouts/rejections/{portout_id}`

```go
	response, err := client.Portouts.ListRejectionCodes(
		context.TODO(),
		"329d6658-8f93-405d-862f-648776e8afd7",
		telnyx.PortoutListRejectionCodesParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `code` (integer), `description` (string), `reason_required` (boolean)

## List port-out related reports

List the reports generated about port-out operations.

`GET /portouts/reports`

```go
	page, err := client.Portouts.Reports.List(context.TODO(), telnyx.PortoutReportListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_portouts_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Create a port-out related report

Generate reports about port-out operations.

`POST /portouts/reports`

```go
	report, err := client.Portouts.Reports.New(context.TODO(), telnyx.PortoutReportNewParams{
		Params: telnyx.ExportPortoutsCsvReportParam{
			Filters: telnyx.ExportPortoutsCsvReportFiltersParam{},
		},
		ReportType: telnyx.PortoutReportNewParamsReportTypeExportPortoutsCsv,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", report.Data)
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_portouts_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Retrieve a report

Retrieve a specific report generated.

`GET /portouts/reports/{id}`

```go
	report, err := client.Portouts.Reports.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", report.Data)
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_portouts_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Get a portout request

Returns the portout request based on the ID provided

`GET /portouts/{id}`

```go
	portout, err := client.Portouts.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", portout.Data)
```

Returns: `already_ported` (boolean), `authorized_name` (string), `carrier_name` (string), `city` (string), `created_at` (string), `current_carrier` (string), `end_user_name` (string), `foc_date` (string), `host_messaging` (boolean), `id` (string), `inserted_at` (string), `lsr` (array[string]), `phone_numbers` (array[string]), `pon` (string), `reason` (string | null), `record_type` (string), `rejection_code` (integer), `requested_foc_date` (string), `service_address` (string), `spid` (string), `state` (string), `status` (enum: pending, authorized, ported, rejected, rejected-pending, canceled), `support_key` (string), `updated_at` (string), `user_id` (uuid), `vendor` (uuid), `zip` (string)

## List all comments for a portout request

Returns a list of comments for a portout request.

`GET /portouts/{id}/comments`

```go
	comments, err := client.Portouts.Comments.List(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", comments.Data)
```

Returns: `body` (string), `created_at` (string), `id` (string), `portout_id` (string), `record_type` (string), `user_id` (string)

## Create a comment on a portout request

Creates a comment on a portout request.

`POST /portouts/{id}/comments`

Optional: `body` (string)

```go
	comment, err := client.Portouts.Comments.New(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.PortoutCommentNewParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", comment.Data)
```

Returns: `body` (string), `created_at` (string), `id` (string), `portout_id` (string), `record_type` (string), `user_id` (string)

## List supporting documents on a portout request

List every supporting documents for a portout request.

`GET /portouts/{id}/supporting_documents`

```go
	supportingDocuments, err := client.Portouts.SupportingDocuments.List(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", supportingDocuments.Data)
```

Returns: `created_at` (string), `document_id` (uuid), `id` (uuid), `portout_id` (uuid), `record_type` (string), `type` (enum: loa, invoice), `updated_at` (string)

## Create a list of supporting documents on a portout request

Creates a list of supporting documents on a portout request.

`POST /portouts/{id}/supporting_documents`

Optional: `documents` (array[object])

```go
	supportingDocument, err := client.Portouts.SupportingDocuments.New(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.PortoutSupportingDocumentNewParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", supportingDocument.Data)
```

Returns: `created_at` (string), `document_id` (uuid), `id` (uuid), `portout_id` (uuid), `record_type` (string), `type` (enum: loa, invoice), `updated_at` (string)

## Update Status

Authorize or reject portout request

`PATCH /portouts/{id}/{status}` — Required: `reason`

Optional: `host_messaging` (boolean)

```go
	response, err := client.Portouts.UpdateStatus(
		context.TODO(),
		telnyx.PortoutUpdateStatusParamsStatusAuthorized,
		telnyx.PortoutUpdateStatusParams{
			ID:     "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
			Reason: "I do not recognize this transaction",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `already_ported` (boolean), `authorized_name` (string), `carrier_name` (string), `city` (string), `created_at` (string), `current_carrier` (string), `end_user_name` (string), `foc_date` (string), `host_messaging` (boolean), `id` (string), `inserted_at` (string), `lsr` (array[string]), `phone_numbers` (array[string]), `pon` (string), `reason` (string | null), `record_type` (string), `rejection_code` (integer), `requested_foc_date` (string), `service_address` (string), `spid` (string), `state` (string), `status` (enum: pending, authorized, ported, rejected, rejected-pending, canceled), `support_key` (string), `updated_at` (string), `user_id` (uuid), `vendor` (uuid), `zip` (string)
