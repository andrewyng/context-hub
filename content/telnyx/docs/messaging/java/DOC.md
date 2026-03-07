---
name: messaging
description: "Send and receive SMS/MMS messages, manage messaging-enabled phone numbers, and handle opt-outs. Use when building messaging applications, implementing 2FA, or sending notifications."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,sms,mms,messaging,telecom,whatsapp"
---

# Telnyx Messaging Java SDK Coding Guidelines

You are a Telnyx Messaging API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## List alphanumeric sender IDs

List all alphanumeric sender IDs for the authenticated user.

`GET /alphanumeric_sender_ids`

```java
import com.telnyx.sdk.models.alphanumericsenderids.AlphanumericSenderIdListPage;
import com.telnyx.sdk.models.alphanumericsenderids.AlphanumericSenderIdListParams;

AlphanumericSenderIdListPage page = client.alphanumericSenderIds().list();
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Create an alphanumeric sender ID

Create a new alphanumeric sender ID associated with a messaging profile.

`POST /alphanumeric_sender_ids` — Required: `alphanumeric_sender_id`, `messaging_profile_id`

Optional: `us_long_code_fallback` (string)

```java
import com.telnyx.sdk.models.alphanumericsenderids.AlphanumericSenderIdCreateParams;
import com.telnyx.sdk.models.alphanumericsenderids.AlphanumericSenderIdCreateResponse;

AlphanumericSenderIdCreateParams params = AlphanumericSenderIdCreateParams.builder()
    .alphanumericSenderId("MyCompany")
    .messagingProfileId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
AlphanumericSenderIdCreateResponse alphanumericSenderId = client.alphanumericSenderIds().create(params);
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Retrieve an alphanumeric sender ID

Retrieve a specific alphanumeric sender ID.

`GET /alphanumeric_sender_ids/{id}`

```java
import com.telnyx.sdk.models.alphanumericsenderids.AlphanumericSenderIdRetrieveParams;
import com.telnyx.sdk.models.alphanumericsenderids.AlphanumericSenderIdRetrieveResponse;

AlphanumericSenderIdRetrieveResponse alphanumericSenderId = client.alphanumericSenderIds().retrieve("id");
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Delete an alphanumeric sender ID

Delete an alphanumeric sender ID and disassociate it from its messaging profile.

`DELETE /alphanumeric_sender_ids/{id}`

```java
import com.telnyx.sdk.models.alphanumericsenderids.AlphanumericSenderIdDeleteParams;
import com.telnyx.sdk.models.alphanumericsenderids.AlphanumericSenderIdDeleteResponse;

AlphanumericSenderIdDeleteResponse alphanumericSenderId = client.alphanumericSenderIds().delete("id");
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Send a message

Send a message with a Phone Number, Alphanumeric Sender ID, Short Code or Number Pool. This endpoint allows you to send a message with any messaging resource. Current messaging resources include: long-code, short-code, number-pool, and
alphanumeric-sender-id.

`POST /messages` — Required: `to`

Optional: `auto_detect` (boolean), `encoding` (enum: auto, gsm7, ucs2), `from` (string), `media_urls` (array[string]), `messaging_profile_id` (string), `send_at` (date-time), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```java
import com.telnyx.sdk.models.messages.MessageSendParams;
import com.telnyx.sdk.models.messages.MessageSendResponse;

MessageSendParams params = MessageSendParams.builder()
    .to("+18445550001")
    .build();
MessageSendResponse response = client.messages().send(params);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a message using an alphanumeric sender ID

Send an SMS message using an alphanumeric sender ID. This is SMS only.

`POST /messages/alphanumeric_sender_id` — Required: `from`, `to`, `text`, `messaging_profile_id`

Optional: `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```java
import com.telnyx.sdk.models.messages.MessageSendWithAlphanumericSenderParams;
import com.telnyx.sdk.models.messages.MessageSendWithAlphanumericSenderResponse;

MessageSendWithAlphanumericSenderParams params = MessageSendWithAlphanumericSenderParams.builder()
    .from("MyCompany")
    .messagingProfileId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .text("text")
    .to("+E.164")
    .build();
MessageSendWithAlphanumericSenderResponse response = client.messages().sendWithAlphanumericSender(params);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Retrieve group MMS messages

Retrieve all messages in a group MMS conversation by the group message ID.

`GET /messages/group/{message_id}`

```java
import com.telnyx.sdk.models.messages.MessageRetrieveGroupMessagesParams;
import com.telnyx.sdk.models.messages.MessageRetrieveGroupMessagesResponse;

MessageRetrieveGroupMessagesResponse response = client.messages().retrieveGroupMessages("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a group MMS message

`POST /messages/group_mms` — Required: `from`, `to`

Optional: `media_urls` (array[string]), `subject` (string), `text` (string), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```java
import com.telnyx.sdk.models.messages.MessageSendGroupMmsParams;
import com.telnyx.sdk.models.messages.MessageSendGroupMmsResponse;

MessageSendGroupMmsParams params = MessageSendGroupMmsParams.builder()
    .from("+13125551234")
    .addTo("+18655551234")
    .addTo("+14155551234")
    .build();
MessageSendGroupMmsResponse response = client.messages().sendGroupMms(params);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a long code message

`POST /messages/long_code` — Required: `from`, `to`

Optional: `auto_detect` (boolean), `encoding` (enum: auto, gsm7, ucs2), `media_urls` (array[string]), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```java
import com.telnyx.sdk.models.messages.MessageSendLongCodeParams;
import com.telnyx.sdk.models.messages.MessageSendLongCodeResponse;

MessageSendLongCodeParams params = MessageSendLongCodeParams.builder()
    .from("+18445550001")
    .to("+13125550002")
    .build();
MessageSendLongCodeResponse response = client.messages().sendLongCode(params);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a message using number pool

`POST /messages/number_pool` — Required: `to`, `messaging_profile_id`

Optional: `auto_detect` (boolean), `encoding` (enum: auto, gsm7, ucs2), `media_urls` (array[string]), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```java
import com.telnyx.sdk.models.messages.MessageSendNumberPoolParams;
import com.telnyx.sdk.models.messages.MessageSendNumberPoolResponse;

MessageSendNumberPoolParams params = MessageSendNumberPoolParams.builder()
    .messagingProfileId("abc85f64-5717-4562-b3fc-2c9600000000")
    .to("+13125550002")
    .build();
MessageSendNumberPoolResponse response = client.messages().sendNumberPool(params);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Schedule a message

Schedule a message with a Phone Number, Alphanumeric Sender ID, Short Code or Number Pool. This endpoint allows you to schedule a message with any messaging resource. Current messaging resources include: long-code, short-code, number-pool, and
alphanumeric-sender-id.

`POST /messages/schedule` — Required: `to`

Optional: `auto_detect` (boolean), `from` (string), `media_urls` (array[string]), `messaging_profile_id` (string), `send_at` (date-time), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```java
import com.telnyx.sdk.models.messages.MessageScheduleParams;
import com.telnyx.sdk.models.messages.MessageScheduleResponse;

MessageScheduleParams params = MessageScheduleParams.builder()
    .to("+18445550001")
    .build();
MessageScheduleResponse response = client.messages().schedule(params);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a short code message

`POST /messages/short_code` — Required: `from`, `to`

Optional: `auto_detect` (boolean), `encoding` (enum: auto, gsm7, ucs2), `media_urls` (array[string]), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```java
import com.telnyx.sdk.models.messages.MessageSendShortCodeParams;
import com.telnyx.sdk.models.messages.MessageSendShortCodeResponse;

MessageSendShortCodeParams params = MessageSendShortCodeParams.builder()
    .from("+18445550001")
    .to("+18445550001")
    .build();
MessageSendShortCodeResponse response = client.messages().sendShortCode(params);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a WhatsApp message

`POST /messages/whatsapp` — Required: `from`, `to`, `whatsapp_message`

Optional: `type` (enum: WHATSAPP), `webhook_url` (url)

```java
import com.telnyx.sdk.models.messages.MessageSendWhatsappParams;
import com.telnyx.sdk.models.messages.MessageSendWhatsappResponse;
import com.telnyx.sdk.models.messages.WhatsappMessageContent;

MessageSendWhatsappParams params = MessageSendWhatsappParams.builder()
    .from("+13125551234")
    .to("+13125551234")
    .whatsappMessage(WhatsappMessageContent.builder().build())
    .build();
MessageSendWhatsappResponse response = client.messages().sendWhatsapp(params);
```

Returns: `body` (object), `direction` (string), `encoding` (string), `from` (object), `id` (string), `messaging_profile_id` (string), `organization_id` (string), `received_at` (date-time), `record_type` (string), `to` (array[object]), `type` (string), `wait_seconds` (float)

## Retrieve a message

Note: This API endpoint can only retrieve messages that are no older than 10 days since their creation. If you require messages older than this, please generate an [MDR report.](https://developers.telnyx.com/api-reference/mdr-usage-reports/create-mdr-usage-report)

`GET /messages/{id}`

```java
import com.telnyx.sdk.models.messages.MessageRetrieveParams;
import com.telnyx.sdk.models.messages.MessageRetrieveResponse;

MessageRetrieveResponse message = client.messages().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `data` (object)

## Cancel a scheduled message

Cancel a scheduled message that has not yet been sent. Only messages with `status=scheduled` and `send_at` more than a minute from now can be cancelled.

`DELETE /messages/{id}`

```java
import com.telnyx.sdk.models.messages.MessageCancelScheduledParams;
import com.telnyx.sdk.models.messages.MessageCancelScheduledResponse;

MessageCancelScheduledResponse response = client.messages().cancelScheduled("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `webhook_failover_url` (url), `webhook_url` (url)

## List messaging hosted numbers

List all hosted numbers associated with the authenticated user.

`GET /messaging_hosted_numbers`

```java
import com.telnyx.sdk.models.messaginghostednumbers.MessagingHostedNumberListPage;
import com.telnyx.sdk.models.messaginghostednumbers.MessagingHostedNumberListParams;

MessagingHostedNumberListPage page = client.messagingHostedNumbers().list();
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Retrieve a messaging hosted number

Retrieve a specific messaging hosted number by its ID or phone number.

`GET /messaging_hosted_numbers/{id}`

```java
import com.telnyx.sdk.models.messaginghostednumbers.MessagingHostedNumberRetrieveParams;
import com.telnyx.sdk.models.messaginghostednumbers.MessagingHostedNumberRetrieveResponse;

MessagingHostedNumberRetrieveResponse messagingHostedNumber = client.messagingHostedNumbers().retrieve("id");
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Update a messaging hosted number

Update the messaging settings for a hosted number.

`PATCH /messaging_hosted_numbers/{id}`

Optional: `messaging_product` (string), `messaging_profile_id` (string), `tags` (array[string])

```java
import com.telnyx.sdk.models.messaginghostednumbers.MessagingHostedNumberUpdateParams;
import com.telnyx.sdk.models.messaginghostednumbers.MessagingHostedNumberUpdateResponse;

MessagingHostedNumberUpdateResponse messagingHostedNumber = client.messagingHostedNumbers().update("id");
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## List opt-outs

Retrieve a list of opt-out blocks.

`GET /messaging_optouts`

```java
import com.telnyx.sdk.models.messagingoptouts.MessagingOptoutListPage;
import com.telnyx.sdk.models.messagingoptouts.MessagingOptoutListParams;

MessagingOptoutListPage page = client.messagingOptouts().list();
```

Returns: `created_at` (date-time), `from` (string), `keyword` (string | null), `messaging_profile_id` (string | null), `to` (string)

## List high-level messaging profile metrics

List high-level metrics for all messaging profiles belonging to the authenticated user.

`GET /messaging_profile_metrics`

```java
import com.telnyx.sdk.models.messagingprofilemetrics.MessagingProfileMetricListParams;
import com.telnyx.sdk.models.messagingprofilemetrics.MessagingProfileMetricListResponse;

MessagingProfileMetricListResponse messagingProfileMetrics = client.messagingProfileMetrics().list();
```

Returns: `data` (array[object]), `meta` (object)

## Regenerate messaging profile secret

Regenerate the v1 secret for a messaging profile.

`POST /messaging_profiles/{id}/actions/regenerate_secret`

```java
import com.telnyx.sdk.models.messagingprofiles.actions.ActionRegenerateSecretParams;
import com.telnyx.sdk.models.messagingprofiles.actions.ActionRegenerateSecretResponse;

ActionRegenerateSecretResponse response = client.messagingProfiles().actions().regenerateSecret("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## List alphanumeric sender IDs for a messaging profile

List all alphanumeric sender IDs associated with a specific messaging profile.

`GET /messaging_profiles/{id}/alphanumeric_sender_ids`

```java
import com.telnyx.sdk.models.messagingprofiles.MessagingProfileListAlphanumericSenderIdsPage;
import com.telnyx.sdk.models.messagingprofiles.MessagingProfileListAlphanumericSenderIdsParams;

MessagingProfileListAlphanumericSenderIdsPage page = client.messagingProfiles().listAlphanumericSenderIds("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Get detailed messaging profile metrics

Get detailed metrics for a specific messaging profile, broken down by time interval.

`GET /messaging_profiles/{id}/metrics`

```java
import com.telnyx.sdk.models.messagingprofiles.MessagingProfileRetrieveMetricsParams;
import com.telnyx.sdk.models.messagingprofiles.MessagingProfileRetrieveMetricsResponse;

MessagingProfileRetrieveMetricsResponse response = client.messagingProfiles().retrieveMetrics("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `data` (object)

## List Auto-Response Settings

`GET /messaging_profiles/{profile_id}/autoresp_configs`

```java
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutorespConfigListParams;
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutorespConfigListResponse;

AutorespConfigListResponse autorespConfigs = client.messagingProfiles().autorespConfigs().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `country_code` (string), `created_at` (date-time), `id` (string), `keywords` (array[string]), `op` (enum: start, stop, info), `resp_text` (string), `updated_at` (date-time)

## Create auto-response setting

`POST /messaging_profiles/{profile_id}/autoresp_configs` — Required: `op`, `keywords`, `country_code`

Optional: `resp_text` (string)

```java
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutoRespConfigCreate;
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutoRespConfigResponse;
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutorespConfigCreateParams;

AutorespConfigCreateParams params = AutorespConfigCreateParams.builder()
    .profileId("profile_id")
    .autoRespConfigCreate(AutoRespConfigCreate.builder()
        .countryCode("US")
        .addKeyword("keyword1")
        .addKeyword("keyword2")
        .op(AutoRespConfigCreate.Op.START)
        .build())
    .build();
AutoRespConfigResponse autoRespConfigResponse = client.messagingProfiles().autorespConfigs().create(params);
```

Returns: `country_code` (string), `created_at` (date-time), `id` (string), `keywords` (array[string]), `op` (enum: start, stop, info), `resp_text` (string), `updated_at` (date-time)

## Get Auto-Response Setting

`GET /messaging_profiles/{profile_id}/autoresp_configs/{autoresp_cfg_id}`

```java
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutoRespConfigResponse;
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutorespConfigRetrieveParams;

AutorespConfigRetrieveParams params = AutorespConfigRetrieveParams.builder()
    .profileId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .autorespCfgId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
AutoRespConfigResponse autoRespConfigResponse = client.messagingProfiles().autorespConfigs().retrieve(params);
```

Returns: `country_code` (string), `created_at` (date-time), `id` (string), `keywords` (array[string]), `op` (enum: start, stop, info), `resp_text` (string), `updated_at` (date-time)

## Update Auto-Response Setting

`PUT /messaging_profiles/{profile_id}/autoresp_configs/{autoresp_cfg_id}` — Required: `op`, `keywords`, `country_code`

Optional: `resp_text` (string)

```java
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutoRespConfigCreate;
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutoRespConfigResponse;
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutorespConfigUpdateParams;

AutorespConfigUpdateParams params = AutorespConfigUpdateParams.builder()
    .profileId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .autorespCfgId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .autoRespConfigCreate(AutoRespConfigCreate.builder()
        .countryCode("US")
        .addKeyword("keyword1")
        .addKeyword("keyword2")
        .op(AutoRespConfigCreate.Op.START)
        .build())
    .build();
AutoRespConfigResponse autoRespConfigResponse = client.messagingProfiles().autorespConfigs().update(params);
```

Returns: `country_code` (string), `created_at` (date-time), `id` (string), `keywords` (array[string]), `op` (enum: start, stop, info), `resp_text` (string), `updated_at` (date-time)

## Delete Auto-Response Setting

`DELETE /messaging_profiles/{profile_id}/autoresp_configs/{autoresp_cfg_id}`

```java
import com.telnyx.sdk.models.messagingprofiles.autorespconfigs.AutorespConfigDeleteParams;

AutorespConfigDeleteParams params = AutorespConfigDeleteParams.builder()
    .profileId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .autorespCfgId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
String autorespConfig = client.messagingProfiles().autorespConfigs().delete(params);
```

---

## Webhooks

The following webhook events are sent to your configured webhook URL.
All webhooks include `telnyx-timestamp` and `telnyx-signature-ed25519` headers for verification (Standard Webhooks compatible).

| Event | Description |
|-------|-------------|
| `deliveryUpdate` | Delivery Update |
| `inboundMessage` | Inbound Message |
| `replacedLinkClick` | Replaced Link Click |

### Webhook payload fields

**`deliveryUpdate`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.event_type` | enum: message.sent, message.finalized | The type of event being delivered. |
| `data.occurred_at` | date-time | ISO 8601 formatted date indicating when the resource was created. |
| `data.payload.record_type` | enum: message | Identifies the type of the resource. |
| `data.payload.direction` | enum: outbound | The direction of the message. |
| `data.payload.id` | uuid | Identifies the type of resource. |
| `data.payload.type` | enum: SMS, MMS | The type of message. |
| `data.payload.messaging_profile_id` | string | Unique identifier for a messaging profile. |
| `data.payload.organization_id` | uuid | The id of the organization the messaging profile belongs to. |
| `data.payload.to` | array[object] |  |
| `data.payload.cc` | array[object] |  |
| `data.payload.text` | string | Message body (i.e., content) as a non-empty string. |
| `data.payload.subject` | ['string', 'null'] | Subject of multimedia message |
| `data.payload.media` | array[object] |  |
| `data.payload.webhook_url` | url | The URL where webhooks related to this message will be sent. |
| `data.payload.webhook_failover_url` | url | The failover URL where webhooks related to this message will be sent if sending to the primary URL fails. |
| `data.payload.encoding` | string | Encoding scheme used for the message body. |
| `data.payload.parts` | integer | Number of parts into which the message's body must be split. |
| `data.payload.tags` | array[string] | Tags associated with the resource. |
| `data.payload.cost` | ['object', 'null'] |  |
| `data.payload.cost_breakdown` | ['object', 'null'] | Detailed breakdown of the message cost components. |
| `data.payload.tcr_campaign_id` | ['string', 'null'] | The Campaign Registry (TCR) campaign ID associated with the message. |
| `data.payload.tcr_campaign_billable` | boolean | Indicates whether the TCR campaign is billable. |
| `data.payload.tcr_campaign_registered` | ['string', 'null'] | The registration status of the TCR campaign. |
| `data.payload.received_at` | date-time | ISO 8601 formatted date indicating when the message request was received. |
| `data.payload.sent_at` | date-time | ISO 8601 formatted date indicating when the message was sent. |
| `data.payload.completed_at` | date-time | ISO 8601 formatted date indicating when the message was finalized. |
| `data.payload.valid_until` | date-time | Message must be out of the queue by this time or else it will be discarded and marked as 'sending_failed'. |
| `data.payload.errors` | array[object] | These errors may point at addressees when referring to unsuccessful/unconfirmed delivery statuses. |
| `data.payload.smart_encoding_applied` | boolean | Indicates whether smart encoding was applied to this message. |
| `data.payload.wait_seconds` | float | Seconds the message is queued due to rate limiting before being sent to the carrier. |
| `meta.attempt` | integer | Number of attempts to deliver the webhook event. |
| `meta.delivered_to` | url | The webhook URL the event was delivered to. |

**`inboundMessage`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.event_type` | enum: message.received | The type of event being delivered. |
| `data.occurred_at` | date-time | ISO 8601 formatted date indicating when the resource was created. |
| `data.payload.record_type` | enum: message | Identifies the type of the resource. |
| `data.payload.direction` | enum: inbound | The direction of the message. |
| `data.payload.id` | uuid | Identifies the type of resource. |
| `data.payload.type` | enum: SMS, MMS | The type of message. |
| `data.payload.messaging_profile_id` | string | Unique identifier for a messaging profile. |
| `data.payload.organization_id` | string | Unique identifier for a messaging profile. |
| `data.payload.to` | array[object] |  |
| `data.payload.cc` | array[object] |  |
| `data.payload.text` | string | Message body (i.e., content) as a non-empty string. |
| `data.payload.subject` | ['string', 'null'] | Message subject. |
| `data.payload.media` | array[object] |  |
| `data.payload.webhook_url` | url | The URL where webhooks related to this message will be sent. |
| `data.payload.webhook_failover_url` | url | The failover URL where webhooks related to this message will be sent if sending to the primary URL fails. |
| `data.payload.encoding` | string | Encoding scheme used for the message body. |
| `data.payload.parts` | integer | Number of parts into which the message's body must be split. |
| `data.payload.tags` | array[string] | Tags associated with the resource. |
| `data.payload.cost` | ['object', 'null'] |  |
| `data.payload.cost_breakdown` | ['object', 'null'] | Detailed breakdown of the message cost components. |
| `data.payload.tcr_campaign_id` | ['string', 'null'] | The Campaign Registry (TCR) campaign ID associated with the message. |
| `data.payload.tcr_campaign_billable` | boolean | Indicates whether the TCR campaign is billable. |
| `data.payload.tcr_campaign_registered` | ['string', 'null'] | The registration status of the TCR campaign. |
| `data.payload.received_at` | date-time | ISO 8601 formatted date indicating when the message request was received. |
| `data.payload.sent_at` | date-time | Not used for inbound messages. |
| `data.payload.completed_at` | date-time | Not used for inbound messages. |
| `data.payload.valid_until` | date-time | Not used for inbound messages. |
| `data.payload.errors` | array[object] | These errors may point at addressees when referring to unsuccessful/unconfirmed delivery statuses. |

**`replacedLinkClick`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | string | Identifies the type of the resource. |
| `data.url` | string | The original link that was sent in the message. |
| `data.to` | string | Sending address (+E.164 formatted phone number, alphanumeric sender ID, or short code). |
| `data.message_id` | uuid | The message ID associated with the clicked link. |
| `data.time_clicked` | date-time | ISO 8601 formatted date indicating when the message request was received. |
