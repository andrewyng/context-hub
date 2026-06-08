---
name: fax
description: "Send and receive faxes programmatically. Manage fax applications and media."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,fax,send,receive"
---

# Telnyx Fax Java SDK Coding Guidelines

You are a Telnyx Fax API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## List all Fax Applications

This endpoint returns a list of your Fax Applications inside the 'data' attribute of the response. You can adjust which applications are listed by using filters. Fax Applications are used to configure how you send and receive faxes using the Programmable Fax API with Telnyx.

`GET /fax_applications`

```java
import com.telnyx.sdk.models.faxapplications.FaxApplicationListPage;
import com.telnyx.sdk.models.faxapplications.FaxApplicationListParams;

FaxApplicationListPage page = client.faxApplications().list();
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `application_name` (string), `created_at` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Creates a Fax Application

Creates a new Fax Application based on the parameters sent in the request. The application name and webhook URL are required. Once created, you can assign phone numbers to your application using the `/phone_numbers` endpoint.

`POST /fax_applications` — Required: `application_name`, `webhook_event_url`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_event_failover_url` (uri), `webhook_timeout_secs` (integer | null)

```java
import com.telnyx.sdk.models.faxapplications.FaxApplicationCreateParams;
import com.telnyx.sdk.models.faxapplications.FaxApplicationCreateResponse;

FaxApplicationCreateParams params = FaxApplicationCreateParams.builder()
    .applicationName("fax-router")
    .webhookEventUrl("https://example.com")
    .build();
FaxApplicationCreateResponse faxApplication = client.faxApplications().create(params);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `application_name` (string), `created_at` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve a Fax Application

Return the details of an existing Fax Application inside the 'data' attribute of the response.

`GET /fax_applications/{id}`

```java
import com.telnyx.sdk.models.faxapplications.FaxApplicationRetrieveParams;
import com.telnyx.sdk.models.faxapplications.FaxApplicationRetrieveResponse;

FaxApplicationRetrieveResponse faxApplication = client.faxApplications().retrieve("1293384261075731499");
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `application_name` (string), `created_at` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update a Fax Application

Updates settings of an existing Fax Application based on the parameters of the request.

`PATCH /fax_applications/{id}` — Required: `application_name`, `webhook_event_url`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `fax_email_recipient` (string | null), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_event_failover_url` (uri), `webhook_timeout_secs` (integer | null)

```java
import com.telnyx.sdk.models.faxapplications.FaxApplicationUpdateParams;
import com.telnyx.sdk.models.faxapplications.FaxApplicationUpdateResponse;

FaxApplicationUpdateParams params = FaxApplicationUpdateParams.builder()
    .id("1293384261075731499")
    .applicationName("fax-router")
    .webhookEventUrl("https://example.com")
    .build();
FaxApplicationUpdateResponse faxApplication = client.faxApplications().update(params);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `application_name` (string), `created_at` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Deletes a Fax Application

Permanently deletes a Fax Application. Deletion may be prevented if the application is in use by phone numbers.

`DELETE /fax_applications/{id}`

```java
import com.telnyx.sdk.models.faxapplications.FaxApplicationDeleteParams;
import com.telnyx.sdk.models.faxapplications.FaxApplicationDeleteResponse;

FaxApplicationDeleteResponse faxApplication = client.faxApplications().delete("1293384261075731499");
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `application_name` (string), `created_at` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## View a list of faxes

`GET /faxes`

```java
import com.telnyx.sdk.models.faxes.FaxListPage;
import com.telnyx.sdk.models.faxes.FaxListParams;

FaxListPage page = client.faxes().list();
```

Returns: `client_state` (string), `connection_id` (string), `created_at` (date-time), `direction` (enum: inbound, outbound), `from` (string), `from_display_name` (string), `id` (uuid), `media_name` (string), `media_url` (string), `preview_url` (string), `quality` (enum: normal, high, very_high, ultra_light, ultra_dark), `record_type` (enum: fax), `status` (enum: queued, media.processed, originated, sending, delivered, failed, initiated, receiving, media.processing, received), `store_media` (boolean), `stored_media_url` (string), `to` (string), `updated_at` (date-time), `webhook_failover_url` (string), `webhook_url` (string)

## Send a fax

Send a fax. Files have size limits and page count limit validations. If a file is bigger than 50MB or has more than 350 pages it will fail with `file_size_limit_exceeded` and `page_count_limit_exceeded` respectively.

`POST /faxes` — Required: `connection_id`, `from`, `to`

Optional: `black_threshold` (integer), `client_state` (string), `from_display_name` (string), `media_name` (string), `media_url` (string), `monochrome` (boolean), `preview_format` (enum: pdf, tiff), `quality` (enum: normal, high, very_high, ultra_light, ultra_dark), `store_media` (boolean), `store_preview` (boolean), `t38_enabled` (boolean), `webhook_url` (string)

```java
import com.telnyx.sdk.models.faxes.FaxCreateParams;
import com.telnyx.sdk.models.faxes.FaxCreateResponse;

FaxCreateParams params = FaxCreateParams.builder()
    .connectionId("234423")
    .from("+13125790015")
    .to("+13127367276")
    .build();
FaxCreateResponse fax = client.faxes().create(params);
```

Returns: `client_state` (string), `connection_id` (string), `created_at` (date-time), `direction` (enum: inbound, outbound), `from` (string), `from_display_name` (string), `id` (uuid), `media_name` (string), `media_url` (string), `preview_url` (string), `quality` (enum: normal, high, very_high, ultra_light, ultra_dark), `record_type` (enum: fax), `status` (enum: queued, media.processed, originated, sending, delivered, failed, initiated, receiving, media.processing, received), `store_media` (boolean), `stored_media_url` (string), `to` (string), `updated_at` (date-time), `webhook_failover_url` (string), `webhook_url` (string)

## View a fax

`GET /faxes/{id}`

```java
import com.telnyx.sdk.models.faxes.FaxRetrieveParams;
import com.telnyx.sdk.models.faxes.FaxRetrieveResponse;

FaxRetrieveResponse fax = client.faxes().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `client_state` (string), `connection_id` (string), `created_at` (date-time), `direction` (enum: inbound, outbound), `from` (string), `from_display_name` (string), `id` (uuid), `media_name` (string), `media_url` (string), `preview_url` (string), `quality` (enum: normal, high, very_high, ultra_light, ultra_dark), `record_type` (enum: fax), `status` (enum: queued, media.processed, originated, sending, delivered, failed, initiated, receiving, media.processing, received), `store_media` (boolean), `stored_media_url` (string), `to` (string), `updated_at` (date-time), `webhook_failover_url` (string), `webhook_url` (string)

## Delete a fax

`DELETE /faxes/{id}`

```java
import com.telnyx.sdk.models.faxes.FaxDeleteParams;

client.faxes().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

## Cancel a fax

Cancel the outbound fax that is in one of the following states: `queued`, `media.processed`, `originated` or `sending`

`POST /faxes/{id}/actions/cancel`

```java
import com.telnyx.sdk.models.faxes.actions.ActionCancelParams;
import com.telnyx.sdk.models.faxes.actions.ActionCancelResponse;

ActionCancelResponse response = client.faxes().actions().cancel("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `result` (string)

## Refresh a fax

Refreshes the inbound fax's media_url when it has expired

`POST /faxes/{id}/actions/refresh`

```java
import com.telnyx.sdk.models.faxes.actions.ActionRefreshParams;
import com.telnyx.sdk.models.faxes.actions.ActionRefreshResponse;

ActionRefreshResponse response = client.faxes().actions().refresh("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `result` (string)

---

## Webhooks

The following webhook events are sent to your configured webhook URL.
All webhooks include `telnyx-timestamp` and `telnyx-signature-ed25519` headers for verification (Standard Webhooks compatible).

| Event | Description |
|-------|-------------|
| `fax.delivered` | Fax Delivered |
| `fax.failed` | Fax Failed |
| `fax.media.processed` | Fax Media Processed |
| `fax.queued` | Fax Queued |
| `fax.sending.started` | Fax Sending Started |

### Webhook payload fields

**`fax.delivered`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.event_type` | enum: fax.delivered | The type of event being delivered. |
| `data.payload.call_duration_secs` | integer | The duration of the call in seconds. |
| `data.payload.connection_id` | string | The ID of the connection used to send the fax. |
| `data.payload.direction` | enum: inbound, outbound | The direction of the fax. |
| `data.payload.fax_id` | uuid | Identifies the fax. |
| `data.payload.original_media_url` | string | The original URL to the PDF used for the fax's media. |
| `data.payload.media_name` | string | The media_name used for the fax's media. |
| `data.payload.to` | string | The phone number, in E.164 format, the fax will be sent to or SIP URI |
| `data.payload.from` | string | The phone number, in E.164 format, the fax will be sent from. |
| `data.payload.user_id` | uuid | Identifier of the user to whom the fax belongs |
| `data.payload.page_count` | integer | Number of transferred pages |
| `data.payload.status` | enum: delivered | The status of the fax. |
| `data.payload.client_state` | string | State received from a command. |
| `meta.attempt` | integer | The delivery attempt number. |
| `meta.delivered_to` | uri | The URL the webhook was delivered to. |

**`fax.failed`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.event_type` | enum: fax.failed | The type of event being delivered. |
| `data.payload.connection_id` | string | The ID of the connection used to send the fax. |
| `data.payload.direction` | enum: inbound, outbound | The direction of the fax. |
| `data.payload.fax_id` | uuid | Identifies the fax. |
| `data.payload.original_media_url` | string | The original URL to the PDF used for the fax's media. |
| `data.payload.media_name` | string | The media_name used for the fax's media. |
| `data.payload.to` | string | The phone number, in E.164 format, the fax will be sent to or SIP URI |
| `data.payload.from` | string | The phone number, in E.164 format, the fax will be sent from. |
| `data.payload.user_id` | uuid | Identifier of the user to whom the fax belongs |
| `data.payload.failure_reason` | enum: rejected | Cause of the sending failure |
| `data.payload.status` | enum: failed | The status of the fax. |
| `data.payload.client_state` | string | State received from a command. |
| `meta.attempt` | integer | The delivery attempt number. |
| `meta.delivered_to` | uri | The URL the webhook was delivered to. |

**`fax.media.processed`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.event_type` | enum: fax.media.processed | The type of event being delivered. |
| `data.payload.connection_id` | string | The ID of the connection used to send the fax. |
| `data.payload.direction` | enum: inbound, outbound | The direction of the fax. |
| `data.payload.fax_id` | uuid | Identifies the fax. |
| `data.payload.original_media_url` | string | The original URL to the PDF used for the fax's media. |
| `data.payload.media_name` | string | The media_name used for the fax's media. |
| `data.payload.to` | string | The phone number, in E.164 format, the fax will be sent to or SIP URI |
| `data.payload.from` | string | The phone number, in E.164 format, the fax will be sent from. |
| `data.payload.user_id` | uuid | Identifier of the user to whom the fax belongs |
| `data.payload.status` | enum: media.processed | The status of the fax. |
| `data.payload.client_state` | string | State received from a command. |
| `meta.attempt` | integer | The delivery attempt number. |
| `meta.delivered_to` | uri | The URL the webhook was delivered to. |

**`fax.queued`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.event_type` | enum: fax.queued | The type of event being delivered. |
| `data.payload.connection_id` | string | The ID of the connection used to send the fax. |
| `data.payload.direction` | enum: inbound, outbound | The direction of the fax. |
| `data.payload.fax_id` | uuid | Identifies the fax. |
| `data.payload.original_media_url` | string | The original URL to the PDF used for the fax's media. |
| `data.payload.media_name` | string | The media_name used for the fax's media. |
| `data.payload.to` | string | The phone number, in E.164 format, the fax will be sent to or SIP URI |
| `data.payload.from` | string | The phone number, in E.164 format, the fax will be sent from. |
| `data.payload.user_id` | uuid | Identifier of the user to whom the fax belongs |
| `data.payload.status` | enum: queued | The status of the fax. |
| `data.payload.client_state` | string | State received from a command. |
| `meta.attempt` | integer | The delivery attempt number. |
| `meta.delivered_to` | uri | The URL the webhook was delivered to. |

**`fax.sending.started`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.event_type` | enum: fax.sending.started | The type of event being delivered. |
| `data.payload.connection_id` | string | The ID of the connection used to send the fax. |
| `data.payload.direction` | enum: inbound, outbound | The direction of the fax. |
| `data.payload.fax_id` | uuid | Identifies the fax. |
| `data.payload.original_media_url` | string | The original URL to the PDF used for the fax's media. |
| `data.payload.media_name` | string | The media_name used for the fax's media. |
| `data.payload.to` | string | The phone number, in E.164 format, the fax will be sent to or SIP URI |
| `data.payload.from` | string | The phone number, in E.164 format, the fax will be sent from. |
| `data.payload.user_id` | uuid | Identifier of the user to whom the fax belongs |
| `data.payload.status` | enum: sending | The status of the fax. |
| `data.payload.client_state` | string | State received from a command. |
| `meta.attempt` | integer | The delivery attempt number. |
| `meta.delivered_to` | uri | The URL the webhook was delivered to. |
