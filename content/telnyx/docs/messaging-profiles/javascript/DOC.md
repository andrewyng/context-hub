---
name: messaging-profiles
description: "Create and manage messaging profiles with number pools, sticky sender, and geomatch features. Configure short codes for high-volume messaging."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,messaging,profiles,number-pool,short-codes"
---

# Telnyx Messaging Profiles JavaScript SDK Coding Guidelines

You are a Telnyx Messaging Profiles API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

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

## List messaging profiles

`GET /messaging_profiles`

```javascript
// Automatically fetches more pages as needed.
for await (const messagingProfile of client.messagingProfiles.list()) {
  console.log(messagingProfile.id);
}
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## Create a messaging profile

`POST /messaging_profiles` — Required: `name`, `whitelisted_destinations`

Optional: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `number_pool_settings` (object | null), `resource_group_id` (string | null), `smart_encoding` (boolean), `url_shortener_settings` (object | null), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url)

```javascript
const messagingProfile = await client.messagingProfiles.create({
  name: 'My name',
  whitelisted_destinations: ['US'],
});

console.log(messagingProfile.data);
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## Retrieve a messaging profile

`GET /messaging_profiles/{id}`

```javascript
const messagingProfile = await client.messagingProfiles.retrieve(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(messagingProfile.data);
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## Update a messaging profile

`PATCH /messaging_profiles/{id}`

Optional: `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `record_type` (enum: messaging_profile), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

```javascript
const messagingProfile = await client.messagingProfiles.update(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(messagingProfile.data);
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## Delete a messaging profile

`DELETE /messaging_profiles/{id}`

```javascript
const messagingProfile = await client.messagingProfiles.delete(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(messagingProfile.data);
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## List phone numbers associated with a messaging profile

`GET /messaging_profiles/{id}/phone_numbers`

```javascript
// Automatically fetches more pages as needed.
for await (const phoneNumberWithMessagingSettings of client.messagingProfiles.listPhoneNumbers(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
)) {
  console.log(phoneNumberWithMessagingSettings.id);
}
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## List short codes associated with a messaging profile

`GET /messaging_profiles/{id}/short_codes`

```javascript
// Automatically fetches more pages as needed.
for await (const shortCode of client.messagingProfiles.listShortCodes(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
)) {
  console.log(shortCode.messaging_profile_id);
}
```

Returns: `country_code` (string), `created_at` (date-time), `id` (uuid), `messaging_profile_id` (string | null), `record_type` (enum: short_code), `short_code` (string), `tags` (array), `updated_at` (date-time)

## List short codes

`GET /short_codes`

```javascript
// Automatically fetches more pages as needed.
for await (const shortCode of client.shortCodes.list()) {
  console.log(shortCode.messaging_profile_id);
}
```

Returns: `country_code` (string), `created_at` (date-time), `id` (uuid), `messaging_profile_id` (string | null), `record_type` (enum: short_code), `short_code` (string), `tags` (array), `updated_at` (date-time)

## Retrieve a short code

`GET /short_codes/{id}`

```javascript
const shortCode = await client.shortCodes.retrieve('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e');

console.log(shortCode.data);
```

Returns: `country_code` (string), `created_at` (date-time), `id` (uuid), `messaging_profile_id` (string | null), `record_type` (enum: short_code), `short_code` (string), `tags` (array), `updated_at` (date-time)

## Update short code

Update the settings for a specific short code. To unbind a short code from a profile, set the `messaging_profile_id` to `null` or an empty string. To add or update tags, include the tags field as an array of strings.

`PATCH /short_codes/{id}` — Required: `messaging_profile_id`

Optional: `tags` (array)

```javascript
const shortCode = await client.shortCodes.update('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  messaging_profile_id: 'abc85f64-5717-4562-b3fc-2c9600000000',
});

console.log(shortCode.data);
```

Returns: `country_code` (string), `created_at` (date-time), `id` (uuid), `messaging_profile_id` (string | null), `record_type` (enum: short_code), `short_code` (string), `tags` (array), `updated_at` (date-time)
