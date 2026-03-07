---
name: sip
description: "Configure SIP trunking connections and outbound voice profiles. Use when connecting PBX systems or managing SIP infrastructure."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,sip,trunking,pbx,voice"
---

# Telnyx SIP REST API Coding Guidelines

You are a Telnyx SIP API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

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

## List all Access IP Ranges

`GET /access_ip_ranges`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/access_ip_ranges"
```

Returns: `cidr_block` (string), `created_at` (date-time), `description` (string), `id` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Create new Access IP Range

`POST /access_ip_ranges` — Required: `cidr_block`

Optional: `description` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "cidr_block": "string"
}' \
  "https://api.telnyx.com/v2/access_ip_ranges"
```

Returns: `cidr_block` (string), `created_at` (date-time), `description` (string), `id` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Delete access IP ranges

`DELETE /access_ip_ranges/{access_ip_range_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/access_ip_ranges/{access_ip_range_id}"
```

Returns: `cidr_block` (string), `created_at` (date-time), `description` (string), `id` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## List connections

Returns a list of your connections irrespective of type.

`GET /connections`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/connections?sort=connection_name"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `connection_name` (string), `created_at` (string), `id` (string), `outbound_voice_profile_id` (string), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri)

## Retrieve a connection

Retrieves the high-level details of an existing connection. To retrieve specific authentication information, use the endpoint for the specific connection type.

`GET /connections/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/connections/{id}"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `connection_name` (string), `created_at` (string), `id` (string), `outbound_voice_profile_id` (string), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri)

## List credential connections

Returns a list of your credential connections.

`GET /credential_connections`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/credential_connections?sort=connection_name"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Create a credential connection

Creates a credential connection.

`POST /credential_connections` — Required: `user_name`, `password`, `connection_name`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `webhook_api_version` (enum: 1, 2, texml), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "user_name": "myusername123",
  "password": "my123secure456password789",
  "anchorsite_override": "Amsterdam, Netherlands",
  "connection_name": "office-connection",
  "dtmf_type": "Inband",
  "encrypted_media": "SRTP",
  "ios_push_credential_id": "ec0c8e5d-439e-4620-a0c1-9d9c8d02a836",
  "android_push_credential_id": "06b09dfd-7154-4980-8b75-cebf7a9d4f8e",
  "webhook_event_url": "https://example.com",
  "webhook_event_failover_url": "https://failover.example.com",
  "webhook_api_version": "1",
  "webhook_timeout_secs": 25,
  "tags": [
    "tag1",
    "tag2"
  ],
  "rtcp_settings": {
    "port": "rtcp-mux",
    "capture_enabled": true,
    "report_frequency_secs": 10
  },
  "inbound": {
    "ani_number_format": "+E.164",
    "dnis_number_format": "+e164",
    "codecs": [
      "G722"
    ],
    "default_routing_method": "sequential",
    "channel_limit": 10,
    "generate_ringback_tone": true,
    "isup_headers_enabled": true,
    "prack_enabled": true,
    "sip_compact_headers_enabled": true,
    "timeout_1xx_secs": 10,
    "timeout_2xx_secs": 20,
    "shaken_stir_enabled": true,
    "simultaneous_ringing": "enabled"
  },
  "outbound": {
    "call_parking_enabled": true,
    "ani_override": "always",
    "channel_limit": 10,
    "instant_ringback_enabled": true,
    "generate_ringback_tone": true,
    "localization": "US",
    "t38_reinvite_source": "customer",
    "outbound_voice_profile_id": "1293384261075731499"
  },
  "noise_suppression": "both"
}' \
  "https://api.telnyx.com/v2/credential_connections"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve a credential connection

Retrieves the details of an existing credential connection.

`GET /credential_connections/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/credential_connections/{id}"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update a credential connection

Updates settings of an existing credential connection.

`PATCH /credential_connections/{id}`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "user_name": "myusername123",
  "password": "my123secure456password789",
  "anchorsite_override": "Amsterdam, Netherlands",
  "connection_name": "office-connection",
  "dtmf_type": "Inband",
  "encrypted_media": "SRTP",
  "ios_push_credential_id": "ec0c8e5d-439e-4620-a0c1-9d9c8d02a836",
  "android_push_credential_id": "06b09dfd-7154-4980-8b75-cebf7a9d4f8e",
  "webhook_event_url": "https://example.com",
  "webhook_event_failover_url": "https://failover.example.com",
  "webhook_api_version": "1",
  "webhook_timeout_secs": 25,
  "tags": [
    "tag1",
    "tag2"
  ],
  "rtcp_settings": {
    "port": "rtcp-mux",
    "capture_enabled": true,
    "report_frequency_secs": 10
  },
  "inbound": {
    "ani_number_format": "+E.164",
    "dnis_number_format": "+e164",
    "codecs": [
      "G722"
    ],
    "default_routing_method": "sequential",
    "channel_limit": 10,
    "generate_ringback_tone": true,
    "isup_headers_enabled": true,
    "prack_enabled": true,
    "sip_compact_headers_enabled": true,
    "timeout_1xx_secs": 10,
    "timeout_2xx_secs": 20,
    "shaken_stir_enabled": true,
    "simultaneous_ringing": "enabled"
  },
  "outbound": {
    "call_parking_enabled": true,
    "ani_override": "always",
    "channel_limit": 10,
    "instant_ringback_enabled": true,
    "generate_ringback_tone": true,
    "localization": "US",
    "t38_reinvite_source": "customer",
    "outbound_voice_profile_id": "1293384261075731499"
  },
  "noise_suppression": "both"
}' \
  "https://api.telnyx.com/v2/credential_connections/{id}"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Delete a credential connection

Deletes an existing credential connection.

`DELETE /credential_connections/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/credential_connections/{id}"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Check a Credential Connection Registration Status

Checks the registration_status for a credential connection, (`registration_status`) as well as the timestamp for the last SIP registration event (`registration_status_updated_at`)

`POST /credential_connections/{id}/actions/check_registration_status`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/credential_connections/{id}/actions/check_registration_status"
```

Returns: `ip_address` (string), `last_registration` (string), `port` (integer), `record_type` (string), `sip_username` (string), `status` (enum: Not Applicable, Not Registered, Failed, Expired, Registered, Unregistered), `transport` (string), `user_agent` (string)

## List FQDN connections

Returns a list of your FQDN connections.

`GET /fqdn_connections`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/fqdn_connections?sort=connection_name"
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Create an FQDN connection

Creates a FQDN connection.

`POST /fqdn_connections` — Required: `connection_name`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "anchorsite_override": "Amsterdam, Netherlands",
  "connection_name": "office-connection",
  "dtmf_type": "Inband",
  "encrypted_media": "SRTP",
  "tags": [
    "tag1",
    "tag2"
  ],
  "ios_push_credential_id": "ec0c8e5d-439e-4620-a0c1-9d9c8d02a836",
  "android_push_credential_id": "06b09dfd-7154-4980-8b75-cebf7a9d4f8e",
  "webhook_event_url": "https://example.com",
  "webhook_event_failover_url": "https://failover.example.com",
  "webhook_api_version": "1",
  "webhook_timeout_secs": 25,
  "rtcp_settings": {
    "port": "rtcp-mux",
    "capture_enabled": true,
    "report_frequency_secs": 10
  },
  "inbound": {
    "ani_number_format": "+E.164",
    "dnis_number_format": "+e164",
    "codecs": [
      "G722"
    ],
    "default_routing_method": "sequential",
    "default_primary_fqdn_id": "1293384261075731497",
    "default_secondary_fqdn_id": "1293384261075731498",
    "default_tertiary_fqdn_id": "1293384261075731499",
    "channel_limit": 10,
    "generate_ringback_tone": true,
    "isup_headers_enabled": true,
    "prack_enabled": true,
    "sip_compact_headers_enabled": true,
    "sip_region": "US",
    "sip_subdomain": "test",
    "sip_subdomain_receive_settings": "only_my_connections",
    "timeout_1xx_secs": 10,
    "timeout_2xx_secs": 20,
    "shaken_stir_enabled": true
  },
  "noise_suppression": "both"
}' \
  "https://api.telnyx.com/v2/fqdn_connections"
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve an FQDN connection

Retrieves the details of an existing FQDN connection.

`GET /fqdn_connections/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/fqdn_connections/1293384261075731499"
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update an FQDN connection

Updates settings of an existing FQDN connection.

`PATCH /fqdn_connections/{id}`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "anchorsite_override": "Amsterdam, Netherlands",
  "connection_name": "office-connection",
  "dtmf_type": "Inband",
  "encrypted_media": "SRTP",
  "tags": [
    "tag1",
    "tag2"
  ],
  "ios_push_credential_id": "ec0c8e5d-439e-4620-a0c1-9d9c8d02a836",
  "android_push_credential_id": "06b09dfd-7154-4980-8b75-cebf7a9d4f8e",
  "webhook_event_url": "https://example.com",
  "webhook_event_failover_url": "https://failover.example.com",
  "webhook_api_version": "1",
  "webhook_timeout_secs": 25,
  "rtcp_settings": {
    "port": "rtcp-mux",
    "capture_enabled": true,
    "report_frequency_secs": 10
  },
  "inbound": {
    "ani_number_format": "+E.164",
    "dnis_number_format": "+e164",
    "codecs": [
      "G722"
    ],
    "default_routing_method": "sequential",
    "default_primary_fqdn_id": "1293384261075731497",
    "default_secondary_fqdn_id": "1293384261075731498",
    "default_tertiary_fqdn_id": "1293384261075731499",
    "channel_limit": 10,
    "generate_ringback_tone": true,
    "isup_headers_enabled": true,
    "prack_enabled": true,
    "sip_compact_headers_enabled": true,
    "sip_region": "US",
    "sip_subdomain": "test",
    "sip_subdomain_receive_settings": "only_my_connections",
    "timeout_1xx_secs": 10,
    "timeout_2xx_secs": 20,
    "shaken_stir_enabled": true
  },
  "noise_suppression": "both"
}' \
  "https://api.telnyx.com/v2/fqdn_connections/1293384261075731499"
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Delete an FQDN connection

Deletes an FQDN connection.

`DELETE /fqdn_connections/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/fqdn_connections/1293384261075731499"
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List FQDNs

Get all FQDNs belonging to the user that match the given filters.

`GET /fqdns`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/fqdns"
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Create an FQDN

Create a new FQDN object.

`POST /fqdns` — Required: `fqdn`, `dns_record_type`, `connection_id`

Optional: `port` (integer | null)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "connection_id": "string",
  "fqdn": "example.com",
  "port": 5060,
  "dns_record_type": "a"
}' \
  "https://api.telnyx.com/v2/fqdns"
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Retrieve an FQDN

Return the details regarding a specific FQDN.

`GET /fqdns/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/fqdns/1517907029795014409"
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Update an FQDN

Update the details of a specific FQDN.

`PATCH /fqdns/{id}`

Optional: `connection_id` (string), `dns_record_type` (string), `fqdn` (string), `port` (integer | null)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "fqdn": "example.com",
  "port": 5060,
  "dns_record_type": "a"
}' \
  "https://api.telnyx.com/v2/fqdns/1517907029795014409"
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Delete an FQDN

Delete an FQDN.

`DELETE /fqdns/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/fqdns/1517907029795014409"
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## List Ip connections

Returns a list of your IP connections.

`GET /ip_connections`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ip_connections?sort=connection_name"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Create an Ip connection

Creates an IP connection.

`POST /ip_connections`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "active": true,
  "anchorsite_override": "Amsterdam, Netherlands",
  "connection_name": "string",
  "transport_protocol": "UDP",
  "default_on_hold_comfort_noise_enabled": true,
  "dtmf_type": "Inband",
  "encode_contact_header_enabled": true,
  "encrypted_media": "SRTP",
  "onnet_t38_passthrough_enabled": false,
  "ios_push_credential_id": "ec0c8e5d-439e-4620-a0c1-9d9c8d02a836",
  "android_push_credential_id": "06b09dfd-7154-4980-8b75-cebf7a9d4f8e",
  "webhook_event_url": "https://example.com",
  "webhook_event_failover_url": "https://failover.example.com",
  "webhook_api_version": "1",
  "webhook_timeout_secs": 25,
  "tags": [
    "tag1",
    "tag2"
  ],
  "rtcp_settings": {
    "port": "rtcp-mux",
    "capture_enabled": true,
    "report_frequency_secs": 10
  },
  "inbound": {
    "ani_number_format": "+E.164",
    "dnis_number_format": "+e164",
    "codecs": [
      "G722"
    ],
    "default_routing_method": "sequential",
    "channel_limit": 10,
    "generate_ringback_tone": true,
    "isup_headers_enabled": true,
    "prack_enabled": true,
    "sip_compact_headers_enabled": true,
    "sip_region": "US",
    "sip_subdomain": "test",
    "sip_subdomain_receive_settings": "only_my_connections",
    "timeout_1xx_secs": 10,
    "timeout_2xx_secs": 20,
    "shaken_stir_enabled": true
  },
  "outbound": {
    "call_parking_enabled": true,
    "ani_override": "string",
    "ani_override_type": "always",
    "channel_limit": 10,
    "instant_ringback_enabled": true,
    "generate_ringback_tone": true,
    "localization": "string",
    "t38_reinvite_source": "customer",
    "tech_prefix": "string",
    "ip_authentication_method": "token",
    "ip_authentication_token": "string",
    "outbound_voice_profile_id": "1293384261075731499"
  },
  "noise_suppression": "both"
}' \
  "https://api.telnyx.com/v2/ip_connections"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve an Ip connection

Retrieves the details of an existing ip connection.

`GET /ip_connections/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ip_connections/{id}"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update an Ip connection

Updates settings of an existing IP connection.

`PATCH /ip_connections/{id}`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "anchorsite_override": "Amsterdam, Netherlands",
  "dtmf_type": "Inband",
  "encrypted_media": "SRTP",
  "ios_push_credential_id": "ec0c8e5d-439e-4620-a0c1-9d9c8d02a836",
  "android_push_credential_id": "06b09dfd-7154-4980-8b75-cebf7a9d4f8e",
  "webhook_event_url": "https://example.com",
  "webhook_event_failover_url": "https://failover.example.com",
  "webhook_api_version": "1",
  "webhook_timeout_secs": 25,
  "tags": [
    "tag1",
    "tag2"
  ],
  "rtcp_settings": {
    "port": "rtcp-mux",
    "capture_enabled": true,
    "report_frequency_secs": 10
  },
  "inbound": {
    "ani_number_format": "+E.164",
    "dnis_number_format": "+e164",
    "codecs": [
      "G722"
    ],
    "default_primary_ip_id": "192.168.0.0",
    "default_tertiary_ip_id": "192.168.0.0",
    "default_secondary_ip_id": "192.168.0.0",
    "default_routing_method": "sequential",
    "channel_limit": 10,
    "generate_ringback_tone": true,
    "isup_headers_enabled": true,
    "prack_enabled": true,
    "sip_compact_headers_enabled": true,
    "sip_region": "US",
    "sip_subdomain": "test",
    "sip_subdomain_receive_settings": "only_my_connections",
    "timeout_1xx_secs": 10,
    "timeout_2xx_secs": 20,
    "shaken_stir_enabled": true
  },
  "outbound": {
    "call_parking_enabled": true,
    "ani_override": "string",
    "ani_override_type": "always",
    "channel_limit": 10,
    "instant_ringback_enabled": true,
    "generate_ringback_tone": true,
    "localization": "string",
    "t38_reinvite_source": "customer",
    "tech_prefix": "string",
    "ip_authentication_method": "token",
    "ip_authentication_token": "string",
    "outbound_voice_profile_id": "1293384261075731499"
  },
  "noise_suppression": "both"
}' \
  "https://api.telnyx.com/v2/ip_connections/{id}"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Delete an Ip connection

Deletes an existing IP connection.

`DELETE /ip_connections/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ip_connections/{id}"
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List Ips

Get all IPs belonging to the user that match the given filters.

`GET /ips`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ips"
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Create an Ip

Create a new IP object.

`POST /ips` — Required: `ip_address`

Optional: `connection_id` (string), `port` (integer)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ip_address": "192.168.0.0",
  "port": 5060
}' \
  "https://api.telnyx.com/v2/ips"
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Retrieve an Ip

Return the details regarding a specific IP.

`GET /ips/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ips/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Update an Ip

Update the details of a specific IP.

`PATCH /ips/{id}` — Required: `ip_address`

Optional: `connection_id` (string), `port` (integer)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ip_address": "192.168.0.0",
  "port": 5060
}' \
  "https://api.telnyx.com/v2/ips/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Delete an Ip

Delete an IP.

`DELETE /ips/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ips/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Get all outbound voice profiles

Get all outbound voice profiles belonging to the user that match the given filters.

`GET /outbound_voice_profiles`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/outbound_voice_profiles?sort=name"
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Create an outbound voice profile

Create an outbound voice profile.

`POST /outbound_voice_profiles` — Required: `name`

Optional: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `max_destination_rate` (number), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "office",
  "traffic_type": "conversational",
  "service_plan": "global",
  "concurrent_call_limit": 10,
  "enabled": true,
  "tags": [
    "office-profile"
  ],
  "usage_payment_method": "rate-deck",
  "whitelisted_destinations": [
    "US",
    "BR",
    "AU"
  ],
  "daily_spend_limit": "100.00",
  "daily_spend_limit_enabled": true,
  "call_recording": {
    "call_recording_type": "by_caller_phone_number",
    "call_recording_caller_phone_numbers": [
      "+19705555098"
    ],
    "call_recording_channels": "dual",
    "call_recording_format": "mp3"
  },
  "billing_group_id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  "calling_window": {
    "start_time": "08:00:00.00Z",
    "end_time": "20:00:00.00Z",
    "calls_per_cld": 5
  }
}' \
  "https://api.telnyx.com/v2/outbound_voice_profiles"
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Retrieve an outbound voice profile

Retrieves the details of an existing outbound voice profile.

`GET /outbound_voice_profiles/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/outbound_voice_profiles/1293384261075731499"
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Updates an existing outbound voice profile.

`PATCH /outbound_voice_profiles/{id}` — Required: `name`

Optional: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `max_destination_rate` (number), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "office",
  "traffic_type": "conversational",
  "service_plan": "global",
  "concurrent_call_limit": 10,
  "enabled": true,
  "tags": [
    "office-profile"
  ],
  "usage_payment_method": "rate-deck",
  "whitelisted_destinations": [
    "US",
    "BR",
    "AU"
  ],
  "daily_spend_limit": "100.00",
  "daily_spend_limit_enabled": true,
  "call_recording": {
    "call_recording_type": "by_caller_phone_number",
    "call_recording_caller_phone_numbers": [
      "+19705555098"
    ],
    "call_recording_channels": "dual",
    "call_recording_format": "mp3"
  },
  "billing_group_id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  "calling_window": {
    "start_time": "08:00:00.00Z",
    "end_time": "20:00:00.00Z",
    "calls_per_cld": 5
  }
}' \
  "https://api.telnyx.com/v2/outbound_voice_profiles/1293384261075731499"
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Delete an outbound voice profile

Deletes an existing outbound voice profile.

`DELETE /outbound_voice_profiles/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/outbound_voice_profiles/1293384261075731499"
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])
