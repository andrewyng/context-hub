---
name: numbers-config
description: "Configure phone number settings including caller ID, call forwarding, messaging enablement, and connection assignments."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,configuration,caller-id,forwarding"
---

# Telnyx Numbers Config REST API Coding Guidelines

You are a Telnyx Numbers Config API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

## Golden Rule: Use the Correct API Endpoints

Always use the documented Telnyx API v2 endpoints at `https://api.telnyx.com/v2/`. Do not fabricate API endpoints or request parameters.

- **Correct:** `curl` with `Authorization: Bearer $TELNYX_API_KEY` header
- **Incorrect:** fabricated endpoints or incorrect authentication headers

## Installation

```text
# curl is pre-installed on macOS, Linux, and Windows 10+
```

## Setup

```bash
export TELNYX_API_KEY="YOUR_API_KEY_HERE"
```

All examples below use `$TELNYX_API_KEY` for authentication.

## Bulk update phone number profiles

`POST /messaging_numbers_bulk_updates` — Required: `messaging_profile_id`, `numbers`

Optional: `assign_only` (boolean)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "messaging_profile_id": "string",
  "numbers": [
    "string"
  ]
}' \
  "https://api.telnyx.com/v2/messaging_numbers_bulk_updates"
```

Returns: `failed` (array[string]), `order_id` (uuid), `pending` (array[string]), `record_type` (enum: messaging_numbers_bulk_update), `success` (array[string])

## Retrieve bulk update status

`GET /messaging_numbers_bulk_updates/{order_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/messaging_numbers_bulk_updates/{order_id}"
```

Returns: `failed` (array[string]), `order_id` (uuid), `pending` (array[string]), `record_type` (enum: messaging_numbers_bulk_update), `success` (array[string])

## List mobile phone numbers with messaging settings

`GET /mobile_phone_numbers/messaging`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/mobile_phone_numbers/messaging"
```

Returns: `country_code` (string), `created_at` (date-time), `features` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: longcode), `updated_at` (date-time)

## Retrieve a mobile phone number with messaging settings

`GET /mobile_phone_numbers/{id}/messaging`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/mobile_phone_numbers/{id}/messaging"
```

Returns: `country_code` (string), `created_at` (date-time), `features` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: longcode), `updated_at` (date-time)

## List phone numbers

`GET /phone_numbers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers?sort=connection_name&handle_messaging_profile_error=false"
```

Returns: `billing_group_id` (string | null), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string | null), `connection_name` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `deletion_lock_enabled` (boolean), `emergency_address_id` (string | null), `emergency_enabled` (boolean), `emergency_status` (enum: active, deprovisioning, disabled, provisioning, provisioning-failed), `external_pin` (string | null), `hd_voice_enabled` (boolean), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `messaging_profile_id` (string | null), `messaging_profile_name` (string | null), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline, tollfree, shortcode, longcode), `purchased_at` (string), `record_type` (string), `source_type` (object), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending, requirement-info-pending, requirement-info-under-review, requirement-info-exception, provision-pending), `t38_fax_gateway_enabled` (boolean), `tags` (array[string]), `updated_at` (string)

## Verify ownership of phone numbers

Verifies ownership of the provided phone numbers and returns a mapping of numbers to their IDs, plus a list of numbers not found in the account.

`POST /phone_numbers/actions/verify_ownership` — Required: `phone_numbers`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "phone_numbers": [
    "+15551234567"
  ]
}' \
  "https://api.telnyx.com/v2/phone_numbers/actions/verify_ownership"
```

Returns: `found` (array[object]), `not_found` (array[string]), `record_type` (string)

## Lists the phone numbers jobs

`GET /phone_numbers/jobs`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers/jobs?sort=created_at"
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## Delete a batch of numbers

Creates a new background job to delete a batch of numbers. At most one thousand numbers can be updated per API call.

`POST /phone_numbers/jobs/delete_phone_numbers` — Required: `phone_numbers`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "phone_numbers": [
    "string"
  ]
}' \
  "https://api.telnyx.com/v2/phone_numbers/jobs/delete_phone_numbers"
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## Update the emergency settings from a batch of numbers

Creates a background job to update the emergency settings of a collection of phone numbers. At most one thousand numbers can be updated per API call.

`POST /phone_numbers/jobs/update_emergency_settings` — Required: `emergency_enabled`, `phone_numbers`

Optional: `emergency_address_id` (string | null)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "phone_numbers": [
    "string"
  ],
  "emergency_enabled": true
}' \
  "https://api.telnyx.com/v2/phone_numbers/jobs/update_emergency_settings"
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## Update a batch of numbers

Creates a new background job to update a batch of numbers. At most one thousand numbers can be updated per API call. At least one of the updateable fields must be submitted.

`POST /phone_numbers/jobs/update_phone_numbers` — Required: `phone_numbers`

Optional: `billing_group_id` (string), `connection_id` (string), `customer_reference` (string), `deletion_lock_enabled` (boolean), `external_pin` (string), `hd_voice_enabled` (boolean), `tags` (array[string]), `voice` (object)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "phone_numbers": [
    "string"
  ],
  "customer_reference": "MY REF 001",
  "voice": {
    "tech_prefix_enabled": true,
    "translated_number": "+13035559999",
    "caller_id_name_enabled": true,
    "call_forwarding": {
      "call_forwarding_enabled": true,
      "forwards_to": "+13035559123",
      "forwarding_type": "always"
    },
    "cnam_listing": {
      "cnam_listing_enabled": true,
      "cnam_listing_details": "example"
    },
    "usage_payment_method": "pay-per-minute",
    "media_features": {
      "rtp_auto_adjust_enabled": true,
      "accept_any_rtp_packets_enabled": true,
      "t38_fax_gateway_enabled": true
    },
    "call_recording": {
      "inbound_call_recording_enabled": true,
      "inbound_call_recording_format": "wav",
      "inbound_call_recording_channels": "single"
    },
    "inbound_call_screening": "disabled"
  }
}' \
  "https://api.telnyx.com/v2/phone_numbers/jobs/update_phone_numbers"
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## Retrieve a phone numbers job

`GET /phone_numbers/jobs/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers/jobs/{id}"
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## List phone numbers with messaging settings

`GET /phone_numbers/messaging`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers/messaging"
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Slim List phone numbers

List phone numbers, This endpoint is a lighter version of the /phone_numbers endpoint having higher performance and rate limit.

`GET /phone_numbers/slim`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers/slim?sort=connection_name"
```

Returns: `billing_group_id` (string), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string), `country_iso_alpha2` (string), `created_at` (string), `customer_reference` (string), `emergency_address_id` (string), `emergency_enabled` (boolean), `emergency_status` (enum: active, deprovisioning, disabled, provisioning, provisioning-failed), `external_pin` (string), `hd_voice_enabled` (boolean), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline, tollfree, shortcode, longcode), `purchased_at` (string), `record_type` (string), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending, requirement-info-pending, requirement-info-under-review, requirement-info-exception, provision-pending), `t38_fax_gateway_enabled` (boolean), `updated_at` (string)

## List phone numbers with voice settings

`GET /phone_numbers/voice`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers/voice?sort=connection_name"
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## Retrieve a phone number

`GET /phone_numbers/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers/1293384261075731499"
```

Returns: `billing_group_id` (string | null), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string | null), `connection_name` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `deletion_lock_enabled` (boolean), `emergency_address_id` (string | null), `emergency_enabled` (boolean), `emergency_status` (enum: active, deprovisioning, disabled, provisioning, provisioning-failed), `external_pin` (string | null), `hd_voice_enabled` (boolean), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `messaging_profile_id` (string | null), `messaging_profile_name` (string | null), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline, tollfree, shortcode, longcode), `purchased_at` (string), `record_type` (string), `source_type` (object), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending, requirement-info-pending, requirement-info-under-review, requirement-info-exception, provision-pending), `t38_fax_gateway_enabled` (boolean), `tags` (array[string]), `updated_at` (string)

## Update a phone number

`PATCH /phone_numbers/{id}`

Optional: `address_id` (string), `billing_group_id` (string), `connection_id` (string), `customer_reference` (string), `external_pin` (string), `hd_voice_enabled` (boolean), `id` (string), `tags` (array[string])

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "hd_voice_enabled": true,
  "customer_reference": "MY REF 001"
}' \
  "https://api.telnyx.com/v2/phone_numbers/1293384261075731499"
```

Returns: `billing_group_id` (string | null), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string | null), `connection_name` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `deletion_lock_enabled` (boolean), `emergency_address_id` (string | null), `emergency_enabled` (boolean), `emergency_status` (enum: active, deprovisioning, disabled, provisioning, provisioning-failed), `external_pin` (string | null), `hd_voice_enabled` (boolean), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `messaging_profile_id` (string | null), `messaging_profile_name` (string | null), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline, tollfree, shortcode, longcode), `purchased_at` (string), `record_type` (string), `source_type` (object), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending, requirement-info-pending, requirement-info-under-review, requirement-info-exception, provision-pending), `t38_fax_gateway_enabled` (boolean), `tags` (array[string]), `updated_at` (string)

## Delete a phone number

`DELETE /phone_numbers/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/phone_numbers/1293384261075731499"
```

Returns: `billing_group_id` (string), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string), `connection_name` (string), `created_at` (string), `customer_reference` (string), `deletion_lock_enabled` (boolean), `emergency_address_id` (string), `emergency_enabled` (boolean), `external_pin` (string), `hd_voice_enabled` (boolean), `id` (string), `messaging_profile_id` (string), `messaging_profile_name` (string), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `purchased_at` (string), `record_type` (string), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending), `t38_fax_gateway_enabled` (boolean), `tags` (array[string]), `updated_at` (string)

## Change the bundle status for a phone number (set to being in a bundle or remove from a bundle)

`PATCH /phone_numbers/{id}/actions/bundle_status_change` — Required: `bundle_id`

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "bundle_id": "string"
}' \
  "https://api.telnyx.com/v2/phone_numbers/1293384261075731499/actions/bundle_status_change"
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## Enable emergency for a phone number

`POST /phone_numbers/{id}/actions/enable_emergency` — Required: `emergency_enabled`, `emergency_address_id`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "emergency_enabled": true,
  "emergency_address_id": "string"
}' \
  "https://api.telnyx.com/v2/phone_numbers/1293384261075731499/actions/enable_emergency"
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## Retrieve a phone number with messaging settings

`GET /phone_numbers/{id}/messaging`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers/{id}/messaging"
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Update the messaging profile and/or messaging product of a phone number

`PATCH /phone_numbers/{id}/messaging`

Optional: `messaging_product` (string), `messaging_profile_id` (string), `tags` (array[string])

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "messaging_product": "P2P"
}' \
  "https://api.telnyx.com/v2/phone_numbers/{id}/messaging"
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Retrieve a phone number with voice settings

`GET /phone_numbers/{id}/voice`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers/1293384261075731499/voice"
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## Update a phone number with voice settings

`PATCH /phone_numbers/{id}/voice`

Optional: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "call_forwarding": {
    "call_forwarding_enabled": true,
    "forwards_to": "+13035559123",
    "forwarding_type": "always"
  },
  "cnam_listing": {
    "cnam_listing_enabled": true,
    "cnam_listing_details": "example"
  },
  "media_features": {
    "rtp_auto_adjust_enabled": true,
    "accept_any_rtp_packets_enabled": true,
    "t38_fax_gateway_enabled": true
  },
  "call_recording": {
    "inbound_call_recording_enabled": true,
    "inbound_call_recording_format": "wav",
    "inbound_call_recording_channels": "single"
  }
}' \
  "https://api.telnyx.com/v2/phone_numbers/1293384261075731499/voice"
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## List Mobile Phone Numbers

`GET /v2/mobile_phone_numbers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/v2/mobile_phone_numbers"
```

Returns: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `connection_id` (string | null), `connection_name` (string | null), `connection_type` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `id` (string), `inbound` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `mobile_voice_enabled` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `outbound` (object), `phone_number` (string), `record_type` (string), `sim_card_id` (uuid), `status` (string), `tags` (array[string]), `updated_at` (date-time)

## Retrieve a Mobile Phone Number

`GET /v2/mobile_phone_numbers/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/v2/mobile_phone_numbers/{id}"
```

Returns: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `connection_id` (string | null), `connection_name` (string | null), `connection_type` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `id` (string), `inbound` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `mobile_voice_enabled` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `outbound` (object), `phone_number` (string), `record_type` (string), `sim_card_id` (uuid), `status` (string), `tags` (array[string]), `updated_at` (date-time)

## Update a Mobile Phone Number

`PATCH /v2/mobile_phone_numbers/{id}`

Optional: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `connection_id` (string | null), `customer_reference` (string | null), `inbound` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `noise_suppression` (boolean), `outbound` (object), `tags` (array[string])

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/v2/mobile_phone_numbers/{id}"
```

Returns: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `connection_id` (string | null), `connection_name` (string | null), `connection_type` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `id` (string), `inbound` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `mobile_voice_enabled` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `outbound` (object), `phone_number` (string), `record_type` (string), `sim_card_id` (uuid), `status` (string), `tags` (array[string]), `updated_at` (date-time)
