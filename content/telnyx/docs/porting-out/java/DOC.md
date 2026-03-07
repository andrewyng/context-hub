---
name: porting-out
description: "Manage port-out requests when numbers are being ported away from Telnyx. List, view, and update port-out status."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,porting,port-out,number-transfer"
---

# Telnyx Porting Out Java SDK Coding Guidelines

You are a Telnyx Porting Out API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## List portout requests

Returns the portout requests according to filters

`GET /portouts`

```java
import com.telnyx.sdk.models.portouts.PortoutListPage;
import com.telnyx.sdk.models.portouts.PortoutListParams;

PortoutListPage page = client.portouts().list();
```

Returns: `already_ported` (boolean), `authorized_name` (string), `carrier_name` (string), `city` (string), `created_at` (string), `current_carrier` (string), `end_user_name` (string), `foc_date` (string), `host_messaging` (boolean), `id` (string), `inserted_at` (string), `lsr` (array[string]), `phone_numbers` (array[string]), `pon` (string), `reason` (string | null), `record_type` (string), `rejection_code` (integer), `requested_foc_date` (string), `service_address` (string), `spid` (string), `state` (string), `status` (enum: pending, authorized, ported, rejected, rejected-pending, canceled), `support_key` (string), `updated_at` (string), `user_id` (uuid), `vendor` (uuid), `zip` (string)

## List all port-out events

Returns a list of all port-out events.

`GET /portouts/events`

```java
import com.telnyx.sdk.models.portouts.events.EventListPage;
import com.telnyx.sdk.models.portouts.events.EventListParams;

EventListPage page = client.portouts().events().list();
```

Returns: `data` (array[object]), `meta` (object)

## Show a port-out event

Show a specific port-out event.

`GET /portouts/events/{id}`

```java
import com.telnyx.sdk.models.portouts.events.EventRetrieveParams;
import com.telnyx.sdk.models.portouts.events.EventRetrieveResponse;

EventRetrieveResponse event = client.portouts().events().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `data` (object)

## Republish a port-out event

Republish a specific port-out event.

`POST /portouts/events/{id}/republish`

```java
import com.telnyx.sdk.models.portouts.events.EventRepublishParams;

client.portouts().events().republish("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

## List eligible port-out rejection codes for a specific order

Given a port-out ID, list rejection codes that are eligible for that port-out

`GET /portouts/rejections/{portout_id}`

```java
import com.telnyx.sdk.models.portouts.PortoutListRejectionCodesParams;
import com.telnyx.sdk.models.portouts.PortoutListRejectionCodesResponse;

PortoutListRejectionCodesResponse response = client.portouts().listRejectionCodes("329d6658-8f93-405d-862f-648776e8afd7");
```

Returns: `code` (integer), `description` (string), `reason_required` (boolean)

## List port-out related reports

List the reports generated about port-out operations.

`GET /portouts/reports`

```java
import com.telnyx.sdk.models.portouts.reports.ReportListPage;
import com.telnyx.sdk.models.portouts.reports.ReportListParams;

ReportListPage page = client.portouts().reports().list();
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_portouts_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Create a port-out related report

Generate reports about port-out operations.

`POST /portouts/reports`

```java
import com.telnyx.sdk.models.portouts.reports.ExportPortoutsCsvReport;
import com.telnyx.sdk.models.portouts.reports.ReportCreateParams;
import com.telnyx.sdk.models.portouts.reports.ReportCreateResponse;

ReportCreateParams params = ReportCreateParams.builder()
    .params(ExportPortoutsCsvReport.builder()
        .filters(ExportPortoutsCsvReport.Filters.builder().build())
        .build())
    .reportType(ReportCreateParams.ReportType.EXPORT_PORTOUTS_CSV)
    .build();
ReportCreateResponse report = client.portouts().reports().create(params);
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_portouts_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Retrieve a report

Retrieve a specific report generated.

`GET /portouts/reports/{id}`

```java
import com.telnyx.sdk.models.portouts.reports.ReportRetrieveParams;
import com.telnyx.sdk.models.portouts.reports.ReportRetrieveResponse;

ReportRetrieveResponse report = client.portouts().reports().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_portouts_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Get a portout request

Returns the portout request based on the ID provided

`GET /portouts/{id}`

```java
import com.telnyx.sdk.models.portouts.PortoutRetrieveParams;
import com.telnyx.sdk.models.portouts.PortoutRetrieveResponse;

PortoutRetrieveResponse portout = client.portouts().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `already_ported` (boolean), `authorized_name` (string), `carrier_name` (string), `city` (string), `created_at` (string), `current_carrier` (string), `end_user_name` (string), `foc_date` (string), `host_messaging` (boolean), `id` (string), `inserted_at` (string), `lsr` (array[string]), `phone_numbers` (array[string]), `pon` (string), `reason` (string | null), `record_type` (string), `rejection_code` (integer), `requested_foc_date` (string), `service_address` (string), `spid` (string), `state` (string), `status` (enum: pending, authorized, ported, rejected, rejected-pending, canceled), `support_key` (string), `updated_at` (string), `user_id` (uuid), `vendor` (uuid), `zip` (string)

## List all comments for a portout request

Returns a list of comments for a portout request.

`GET /portouts/{id}/comments`

```java
import com.telnyx.sdk.models.portouts.comments.CommentListParams;
import com.telnyx.sdk.models.portouts.comments.CommentListResponse;

CommentListResponse comments = client.portouts().comments().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `body` (string), `created_at` (string), `id` (string), `portout_id` (string), `record_type` (string), `user_id` (string)

## Create a comment on a portout request

Creates a comment on a portout request.

`POST /portouts/{id}/comments`

Optional: `body` (string)

```java
import com.telnyx.sdk.models.portouts.comments.CommentCreateParams;
import com.telnyx.sdk.models.portouts.comments.CommentCreateResponse;

CommentCreateResponse comment = client.portouts().comments().create("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `body` (string), `created_at` (string), `id` (string), `portout_id` (string), `record_type` (string), `user_id` (string)

## List supporting documents on a portout request

List every supporting documents for a portout request.

`GET /portouts/{id}/supporting_documents`

```java
import com.telnyx.sdk.models.portouts.supportingdocuments.SupportingDocumentListParams;
import com.telnyx.sdk.models.portouts.supportingdocuments.SupportingDocumentListResponse;

SupportingDocumentListResponse supportingDocuments = client.portouts().supportingDocuments().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `created_at` (string), `document_id` (uuid), `id` (uuid), `portout_id` (uuid), `record_type` (string), `type` (enum: loa, invoice), `updated_at` (string)

## Create a list of supporting documents on a portout request

Creates a list of supporting documents on a portout request.

`POST /portouts/{id}/supporting_documents`

Optional: `documents` (array[object])

```java
import com.telnyx.sdk.models.portouts.supportingdocuments.SupportingDocumentCreateParams;
import com.telnyx.sdk.models.portouts.supportingdocuments.SupportingDocumentCreateResponse;

SupportingDocumentCreateResponse supportingDocument = client.portouts().supportingDocuments().create("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `created_at` (string), `document_id` (uuid), `id` (uuid), `portout_id` (uuid), `record_type` (string), `type` (enum: loa, invoice), `updated_at` (string)

## Update Status

Authorize or reject portout request

`PATCH /portouts/{id}/{status}` — Required: `reason`

Optional: `host_messaging` (boolean)

```java
import com.telnyx.sdk.models.portouts.PortoutUpdateStatusParams;
import com.telnyx.sdk.models.portouts.PortoutUpdateStatusResponse;

PortoutUpdateStatusParams params = PortoutUpdateStatusParams.builder()
    .id("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .status(PortoutUpdateStatusParams.Status.AUTHORIZED)
    .reason("I do not recognize this transaction")
    .build();
PortoutUpdateStatusResponse response = client.portouts().updateStatus(params);
```

Returns: `already_ported` (boolean), `authorized_name` (string), `carrier_name` (string), `city` (string), `created_at` (string), `current_carrier` (string), `end_user_name` (string), `foc_date` (string), `host_messaging` (boolean), `id` (string), `inserted_at` (string), `lsr` (array[string]), `phone_numbers` (array[string]), `pon` (string), `reason` (string | null), `record_type` (string), `rejection_code` (integer), `requested_foc_date` (string), `service_address` (string), `spid` (string), `state` (string), `status` (enum: pending, authorized, ported, rejected, rejected-pending, canceled), `support_key` (string), `updated_at` (string), `user_id` (uuid), `vendor` (uuid), `zip` (string)
