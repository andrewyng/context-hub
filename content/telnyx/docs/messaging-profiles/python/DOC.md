---
name: messaging-profiles
description: "Create and manage messaging profiles with number pools, sticky sender, and geomatch features. Configure short codes for high-volume messaging."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,messaging,profiles,number-pool,short-codes"
---

# Telnyx Messaging Profiles Python SDK Coding Guidelines

You are a Telnyx Messaging Profiles API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

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

## List messaging profiles

`GET /messaging_profiles`

```python
page = client.messaging_profiles.list()
page = page.data[0]
print(page.id)
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## Create a messaging profile

`POST /messaging_profiles` — Required: `name`, `whitelisted_destinations`

Optional: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `number_pool_settings` (object | null), `resource_group_id` (string | null), `smart_encoding` (boolean), `url_shortener_settings` (object | null), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url)

```python
messaging_profile = client.messaging_profiles.create(
    name="My name",
    whitelisted_destinations=["US"],
)
print(messaging_profile.data)
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## Retrieve a messaging profile

`GET /messaging_profiles/{id}`

```python
messaging_profile = client.messaging_profiles.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(messaging_profile.data)
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## Update a messaging profile

`PATCH /messaging_profiles/{id}`

Optional: `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `record_type` (enum: messaging_profile), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

```python
messaging_profile = client.messaging_profiles.update(
    messaging_profile_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(messaging_profile.data)
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## Delete a messaging profile

`DELETE /messaging_profiles/{id}`

```python
messaging_profile = client.messaging_profiles.delete(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(messaging_profile.data)
```

Returns: `ai_assistant_id` (string | null), `alpha_sender` (string | null), `created_at` (date-time), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `health_webhook_url` (url), `id` (uuid), `mms_fall_back_to_sms` (boolean), `mms_transcoding` (boolean), `mobile_only` (boolean), `name` (string), `number_pool_settings` (object | null), `organization_id` (string), `record_type` (enum: messaging_profile), `redaction_enabled` (boolean), `redaction_level` (integer), `resource_group_id` (string | null), `smart_encoding` (boolean), `updated_at` (date-time), `url_shortener_settings` (object | null), `v1_secret` (string), `webhook_api_version` (enum: 1, 2, 2010-04-01), `webhook_failover_url` (url), `webhook_url` (url), `whitelisted_destinations` (array[string])

## List phone numbers associated with a messaging profile

`GET /messaging_profiles/{id}/phone_numbers`

```python
page = client.messaging_profiles.list_phone_numbers(
    messaging_profile_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
page = page.data[0]
print(page.id)
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## List short codes associated with a messaging profile

`GET /messaging_profiles/{id}/short_codes`

```python
page = client.messaging_profiles.list_short_codes(
    messaging_profile_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
page = page.data[0]
print(page.messaging_profile_id)
```

Returns: `country_code` (string), `created_at` (date-time), `id` (uuid), `messaging_profile_id` (string | null), `record_type` (enum: short_code), `short_code` (string), `tags` (array), `updated_at` (date-time)

## List short codes

`GET /short_codes`

```python
page = client.short_codes.list()
page = page.data[0]
print(page.messaging_profile_id)
```

Returns: `country_code` (string), `created_at` (date-time), `id` (uuid), `messaging_profile_id` (string | null), `record_type` (enum: short_code), `short_code` (string), `tags` (array), `updated_at` (date-time)

## Retrieve a short code

`GET /short_codes/{id}`

```python
short_code = client.short_codes.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(short_code.data)
```

Returns: `country_code` (string), `created_at` (date-time), `id` (uuid), `messaging_profile_id` (string | null), `record_type` (enum: short_code), `short_code` (string), `tags` (array), `updated_at` (date-time)

## Update short code

Update the settings for a specific short code. To unbind a short code from a profile, set the `messaging_profile_id` to `null` or an empty string. To add or update tags, include the tags field as an array of strings.

`PATCH /short_codes/{id}` — Required: `messaging_profile_id`

Optional: `tags` (array)

```python
short_code = client.short_codes.update(
    id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    messaging_profile_id="abc85f64-5717-4562-b3fc-2c9600000000",
)
print(short_code.data)
```

Returns: `country_code` (string), `created_at` (date-time), `id` (uuid), `messaging_profile_id` (string | null), `record_type` (enum: short_code), `short_code` (string), `tags` (array), `updated_at` (date-time)
