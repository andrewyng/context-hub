---
name: messaging
description: "Send and receive SMS/MMS messages, manage messaging-enabled phone numbers, and handle opt-outs. Use when building messaging applications, implementing 2FA, or sending notifications."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,sms,mms,messaging,telecom,whatsapp"
---

# Telnyx Messaging JavaScript SDK Coding Guidelines

You are a Telnyx Messaging API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import Telnyx from 'telnyx'`
- **Incorrect:** unofficial or outdated Telnyx packages

## Installation

```bash
npm install telnyx
```

## Setup

```javascript
import Telnyx from 'telnyx';

const client = new Telnyx({
  apiKey: process.env['TELNYX_API_KEY'], // This is the default and can be omitted
});
```

All examples below assume `client` is already initialized as shown above.

## List alphanumeric sender IDs

List all alphanumeric sender IDs for the authenticated user.

`GET /alphanumeric_sender_ids`

```javascript
// Automatically fetches more pages as needed.
for await (const alphanumericSenderID of client.alphanumericSenderIDs.list()) {
  console.log(alphanumericSenderID.id);
}
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Create an alphanumeric sender ID

Create a new alphanumeric sender ID associated with a messaging profile.

`POST /alphanumeric_sender_ids` — Required: `alphanumeric_sender_id`, `messaging_profile_id`

Optional: `us_long_code_fallback` (string)

```javascript
const alphanumericSenderID = await client.alphanumericSenderIDs.create({
  alphanumeric_sender_id: 'MyCompany',
  messaging_profile_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(alphanumericSenderID.data);
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Retrieve an alphanumeric sender ID

Retrieve a specific alphanumeric sender ID.

`GET /alphanumeric_sender_ids/{id}`

```javascript
const alphanumericSenderID = await client.alphanumericSenderIDs.retrieve('id');

console.log(alphanumericSenderID.data);
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Delete an alphanumeric sender ID

Delete an alphanumeric sender ID and disassociate it from its messaging profile.

`DELETE /alphanumeric_sender_ids/{id}`

```javascript
const alphanumericSenderID = await client.alphanumericSenderIDs.delete('id');

console.log(alphanumericSenderID.data);
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Send a message

Send a message with a Phone Number, Alphanumeric Sender ID, Short Code or Number Pool. This endpoint allows you to send a message with any messaging resource. Current messaging resources include: long-code, short-code, number-pool, and
alphanumeric-sender-id.

`POST /messages` — Required: `to`

Optional: `auto_detect` (boolean), `encoding` (enum: auto, gsm7, ucs2), `from` (string), `media_urls` (array[string]), `messaging_profile_id` (string), `send_at` (date-time), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```javascript
const response = await client.messages.send({ to: '+18445550001' });

console.log(response.data);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a message using an alphanumeric sender ID

Send an SMS message using an alphanumeric sender ID. This is SMS only.

`POST /messages/alphanumeric_sender_id` — Required: `from`, `to`, `text`, `messaging_profile_id`

Optional: `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```javascript
const response = await client.messages.sendWithAlphanumericSender({
  from: 'MyCompany',
  messaging_profile_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  text: 'text',
  to: '+E.164',
});

console.log(response.data);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Retrieve group MMS messages

Retrieve all messages in a group MMS conversation by the group message ID.

`GET /messages/group/{message_id}`

```javascript
const response = await client.messages.retrieveGroupMessages(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(response.data);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a group MMS message

`POST /messages/group_mms` — Required: `from`, `to`

Optional: `media_urls` (array[string]), `subject` (string), `text` (string), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```javascript
const response = await client.messages.sendGroupMms({
  from: '+13125551234',
  to: ['+18655551234', '+14155551234'],
});

console.log(response.data);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a long code message

`POST /messages/long_code` — Required: `from`, `to`

Optional: `auto_detect` (boolean), `encoding` (enum: auto, gsm7, ucs2), `media_urls` (array[string]), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```javascript
const response = await client.messages.sendLongCode({ from: '+18445550001', to: '+13125550002' });

console.log(response.data);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a message using number pool

`POST /messages/number_pool` — Required: `to`, `messaging_profile_id`

Optional: `auto_detect` (boolean), `encoding` (enum: auto, gsm7, ucs2), `media_urls` (array[string]), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```javascript
const response = await client.messages.sendNumberPool({
  messaging_profile_id: 'abc85f64-5717-4562-b3fc-2c9600000000',
  to: '+13125550002',
});

console.log(response.data);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Schedule a message

Schedule a message with a Phone Number, Alphanumeric Sender ID, Short Code or Number Pool. This endpoint allows you to schedule a message with any messaging resource. Current messaging resources include: long-code, short-code, number-pool, and
alphanumeric-sender-id.

`POST /messages/schedule` — Required: `to`

Optional: `auto_detect` (boolean), `from` (string), `media_urls` (array[string]), `messaging_profile_id` (string), `send_at` (date-time), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```javascript
const response = await client.messages.schedule({ to: '+18445550001' });

console.log(response.data);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a short code message

`POST /messages/short_code` — Required: `from`, `to`

Optional: `auto_detect` (boolean), `encoding` (enum: auto, gsm7, ucs2), `media_urls` (array[string]), `subject` (string), `text` (string), `type` (enum: SMS, MMS), `use_profile_webhooks` (boolean), `webhook_failover_url` (url), `webhook_url` (url)

```javascript
const response = await client.messages.sendShortCode({ from: '+18445550001', to: '+18445550001' });

console.log(response.data);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `wait_seconds` (float), `webhook_failover_url` (url), `webhook_url` (url)

## Send a WhatsApp message

`POST /messages/whatsapp` — Required: `from`, `to`, `whatsapp_message`

Optional: `type` (enum: WHATSAPP), `webhook_url` (url)

```javascript
const response = await client.messages.sendWhatsapp({
  from: '+13125551234',
  to: '+13125551234',
  whatsapp_message: {},
});

console.log(response.data);
```

Returns: `body` (object), `direction` (string), `encoding` (string), `from` (object), `id` (string), `messaging_profile_id` (string), `organization_id` (string), `received_at` (date-time), `record_type` (string), `to` (array[object]), `type` (string), `wait_seconds` (float)

## Retrieve a message

Note: This API endpoint can only retrieve messages that are no older than 10 days since their creation. If you require messages older than this, please generate an [MDR report.](https://developers.telnyx.com/api-reference/mdr-usage-reports/create-mdr-usage-report)

`GET /messages/{id}`

```javascript
const message = await client.messages.retrieve('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e');

console.log(message.data);
```

Returns: `data` (object)

## Cancel a scheduled message

Cancel a scheduled message that has not yet been sent. Only messages with `status=scheduled` and `send_at` more than a minute from now can be cancelled.

`DELETE /messages/{id}`

```javascript
const response = await client.messages.cancelScheduled('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e');

console.log(response.id);
```

Returns: `cc` (array[object]), `completed_at` (date-time), `cost` (object | null), `cost_breakdown` (object | null), `direction` (enum: outbound), `encoding` (string), `errors` (array[object]), `from` (object), `id` (uuid), `media` (array[object]), `messaging_profile_id` (string), `organization_id` (uuid), `parts` (integer), `received_at` (date-time), `record_type` (enum: message), `sent_at` (date-time), `smart_encoding_applied` (boolean), `subject` (string | null), `tags` (array[string]), `tcr_campaign_billable` (boolean), `tcr_campaign_id` (string | null), `tcr_campaign_registered` (string | null), `text` (string), `to` (array[object]), `type` (enum: SMS, MMS), `valid_until` (date-time), `webhook_failover_url` (url), `webhook_url` (url)

## List messaging hosted numbers

List all hosted numbers associated with the authenticated user.

`GET /messaging_hosted_numbers`

```javascript
// Automatically fetches more pages as needed.
for await (const phoneNumberWithMessagingSettings of client.messagingHostedNumbers.list()) {
  console.log(phoneNumberWithMessagingSettings.id);
}
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Retrieve a messaging hosted number

Retrieve a specific messaging hosted number by its ID or phone number.

`GET /messaging_hosted_numbers/{id}`

```javascript
const messagingHostedNumber = await client.messagingHostedNumbers.retrieve('id');

console.log(messagingHostedNumber.data);
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Update a messaging hosted number

Update the messaging settings for a hosted number.

`PATCH /messaging_hosted_numbers/{id}`

Optional: `messaging_product` (string), `messaging_profile_id` (string), `tags` (array[string])

```javascript
const messagingHostedNumber = await client.messagingHostedNumbers.update('id');

console.log(messagingHostedNumber.data);
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## List opt-outs

Retrieve a list of opt-out blocks.

`GET /messaging_optouts`

```javascript
// Automatically fetches more pages as needed.
for await (const messagingOptoutListResponse of client.messagingOptouts.list()) {
  console.log(messagingOptoutListResponse.messaging_profile_id);
}
```

Returns: `created_at` (date-time), `from` (string), `keyword` (string | null), `messaging_profile_id` (string | null), `to` (string)

## List high-level messaging profile metrics

List high-level metrics for all messaging profiles belonging to the authenticated user.

`GET /messaging_profile_metrics`

```javascript
const messagingProfileMetrics = await client.messagingProfileMetrics.list();

console.log(messagingProfileMetrics.data);
```

Returns: `data` (array[object]), `meta` (object)

## Regenerate messaging profile secret

Regenerate the v1 secret for a messaging profile.

`POST /messaging_profiles/{id}/actions/regenerate_secret`

```javascript
const response = await client.messagingProfiles.actions.regenerateSecret(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(response.data);
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## List alphanumeric sender IDs for a messaging profile

List all alphanumeric sender IDs associated with a specific messaging profile.

`GET /messaging_profiles/{id}/alphanumeric_sender_ids`

```javascript
// Automatically fetches more pages as needed.
for await (const alphanumericSenderID of client.messagingProfiles.listAlphanumericSenderIDs(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
)) {
  console.log(alphanumericSenderID.id);
}
```

Returns: `alphanumeric_sender_id` (string), `id` (uuid), `messaging_profile_id` (uuid), `organization_id` (string), `record_type` (enum: alphanumeric_sender_id), `us_long_code_fallback` (string)

## Get detailed messaging profile metrics

Get detailed metrics for a specific messaging profile, broken down by time interval.

`GET /messaging_profiles/{id}/metrics`

```javascript
const response = await client.messagingProfiles.retrieveMetrics(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(response.data);
```

Returns: `data` (object)

## List Auto-Response Settings

`GET /messaging_profiles/{profile_id}/autoresp_configs`

```javascript
const autorespConfigs = await client.messagingProfiles.autorespConfigs.list(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(autorespConfigs.data);
```

Returns: `country_code` (string), `created_at` (date-time), `id` (string), `keywords` (array[string]), `op` (enum: start, stop, info), `resp_text` (string), `updated_at` (date-time)

## Create auto-response setting

`POST /messaging_profiles/{profile_id}/autoresp_configs` — Required: `op`, `keywords`, `country_code`

Optional: `resp_text` (string)

```javascript
const autoRespConfigResponse = await client.messagingProfiles.autorespConfigs.create('profile_id', {
  country_code: 'US',
  keywords: ['keyword1', 'keyword2'],
  op: 'start',
});

console.log(autoRespConfigResponse.data);
```

Returns: `country_code` (string), `created_at` (date-time), `id` (string), `keywords` (array[string]), `op` (enum: start, stop, info), `resp_text` (string), `updated_at` (date-time)

## Get Auto-Response Setting

`GET /messaging_profiles/{profile_id}/autoresp_configs/{autoresp_cfg_id}`

```javascript
const autoRespConfigResponse = await client.messagingProfiles.autorespConfigs.retrieve(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { profile_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e' },
);

console.log(autoRespConfigResponse.data);
```

Returns: `country_code` (string), `created_at` (date-time), `id` (string), `keywords` (array[string]), `op` (enum: start, stop, info), `resp_text` (string), `updated_at` (date-time)

## Update Auto-Response Setting

`PUT /messaging_profiles/{profile_id}/autoresp_configs/{autoresp_cfg_id}` — Required: `op`, `keywords`, `country_code`

Optional: `resp_text` (string)

```javascript
const autoRespConfigResponse = await client.messagingProfiles.autorespConfigs.update(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  {
    profile_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
    country_code: 'US',
    keywords: ['keyword1', 'keyword2'],
    op: 'start',
  },
);

console.log(autoRespConfigResponse.data);
```

Returns: `country_code` (string), `created_at` (date-time), `id` (string), `keywords` (array[string]), `op` (enum: start, stop, info), `resp_text` (string), `updated_at` (date-time)

## Delete Auto-Response Setting

`DELETE /messaging_profiles/{profile_id}/autoresp_configs/{autoresp_cfg_id}`

```javascript
const autorespConfig = await client.messagingProfiles.autorespConfigs.delete(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { profile_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e' },
);

console.log(autorespConfig);
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
