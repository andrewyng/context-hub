---
name: sip
description: "Configure SIP trunking connections and outbound voice profiles. Use when connecting PBX systems or managing SIP infrastructure."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,sip,trunking,pbx,voice"
---

# Telnyx SIP JavaScript SDK Coding Guidelines

You are a Telnyx SIP API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

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

## List all Access IP Ranges

`GET /access_ip_ranges`

```javascript
// Automatically fetches more pages as needed.
for await (const accessIPRange of client.accessIPRanges.list()) {
  console.log(accessIPRange.id);
}
```

Returns: `cidr_block` (string), `created_at` (date-time), `description` (string), `id` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Create new Access IP Range

`POST /access_ip_ranges` — Required: `cidr_block`

Optional: `description` (string)

```javascript
const accessIPRange = await client.accessIPRanges.create({ cidr_block: 'cidr_block' });

console.log(accessIPRange.id);
```

Returns: `cidr_block` (string), `created_at` (date-time), `description` (string), `id` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Delete access IP ranges

`DELETE /access_ip_ranges/{access_ip_range_id}`

```javascript
const accessIPRange = await client.accessIPRanges.delete('access_ip_range_id');

console.log(accessIPRange.id);
```

Returns: `cidr_block` (string), `created_at` (date-time), `description` (string), `id` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## List connections

Returns a list of your connections irrespective of type.

`GET /connections`

```javascript
// Automatically fetches more pages as needed.
for await (const connectionListResponse of client.connections.list()) {
  console.log(connectionListResponse.id);
}
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `connection_name` (string), `created_at` (string), `id` (string), `outbound_voice_profile_id` (string), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri)

## Retrieve a connection

Retrieves the high-level details of an existing connection. To retrieve specific authentication information, use the endpoint for the specific connection type.

`GET /connections/{id}`

```javascript
const connection = await client.connections.retrieve('id');

console.log(connection.data);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `connection_name` (string), `created_at` (string), `id` (string), `outbound_voice_profile_id` (string), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri)

## List credential connections

Returns a list of your credential connections.

`GET /credential_connections`

```javascript
// Automatically fetches more pages as needed.
for await (const credentialConnection of client.credentialConnections.list()) {
  console.log(credentialConnection.id);
}
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Create a credential connection

Creates a credential connection.

`POST /credential_connections` — Required: `user_name`, `password`, `connection_name`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `webhook_api_version` (enum: 1, 2, texml), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```javascript
const credentialConnection = await client.credentialConnections.create({
  connection_name: 'my name',
  password: 'my123secure456password789',
  user_name: 'myusername123',
});

console.log(credentialConnection.data);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve a credential connection

Retrieves the details of an existing credential connection.

`GET /credential_connections/{id}`

```javascript
const credentialConnection = await client.credentialConnections.retrieve('id');

console.log(credentialConnection.data);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update a credential connection

Updates settings of an existing credential connection.

`PATCH /credential_connections/{id}`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```javascript
const credentialConnection = await client.credentialConnections.update('id');

console.log(credentialConnection.data);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Delete a credential connection

Deletes an existing credential connection.

`DELETE /credential_connections/{id}`

```javascript
const credentialConnection = await client.credentialConnections.delete('id');

console.log(credentialConnection.data);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Check a Credential Connection Registration Status

Checks the registration_status for a credential connection, (`registration_status`) as well as the timestamp for the last SIP registration event (`registration_status_updated_at`)

`POST /credential_connections/{id}/actions/check_registration_status`

```javascript
const response = await client.credentialConnections.actions.checkRegistrationStatus('id');

console.log(response.data);
```

Returns: `ip_address` (string), `last_registration` (string), `port` (integer), `record_type` (string), `sip_username` (string), `status` (enum: Not Applicable, Not Registered, Failed, Expired, Registered, Unregistered), `transport` (string), `user_agent` (string)

## List FQDN connections

Returns a list of your FQDN connections.

`GET /fqdn_connections`

```javascript
// Automatically fetches more pages as needed.
for await (const fqdnConnection of client.fqdnConnections.list()) {
  console.log(fqdnConnection.id);
}
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Create an FQDN connection

Creates a FQDN connection.

`POST /fqdn_connections` — Required: `connection_name`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```javascript
const fqdnConnection = await client.fqdnConnections.create({ connection_name: 'string' });

console.log(fqdnConnection.data);
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve an FQDN connection

Retrieves the details of an existing FQDN connection.

`GET /fqdn_connections/{id}`

```javascript
const fqdnConnection = await client.fqdnConnections.retrieve('1293384261075731499');

console.log(fqdnConnection.data);
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update an FQDN connection

Updates settings of an existing FQDN connection.

`PATCH /fqdn_connections/{id}`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```javascript
const fqdnConnection = await client.fqdnConnections.update('1293384261075731499');

console.log(fqdnConnection.data);
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Delete an FQDN connection

Deletes an FQDN connection.

`DELETE /fqdn_connections/{id}`

```javascript
const fqdnConnection = await client.fqdnConnections.delete('1293384261075731499');

console.log(fqdnConnection.data);
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List FQDNs

Get all FQDNs belonging to the user that match the given filters.

`GET /fqdns`

```javascript
// Automatically fetches more pages as needed.
for await (const fqdn of client.fqdns.list()) {
  console.log(fqdn.id);
}
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Create an FQDN

Create a new FQDN object.

`POST /fqdns` — Required: `fqdn`, `dns_record_type`, `connection_id`

Optional: `port` (integer | null)

```javascript
const fqdn = await client.fqdns.create({
  connection_id: '1516447646313612565',
  dns_record_type: 'a',
  fqdn: 'example.com',
});

console.log(fqdn.data);
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Retrieve an FQDN

Return the details regarding a specific FQDN.

`GET /fqdns/{id}`

```javascript
const fqdn = await client.fqdns.retrieve('1517907029795014409');

console.log(fqdn.data);
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Update an FQDN

Update the details of a specific FQDN.

`PATCH /fqdns/{id}`

Optional: `connection_id` (string), `dns_record_type` (string), `fqdn` (string), `port` (integer | null)

```javascript
const fqdn = await client.fqdns.update('1517907029795014409');

console.log(fqdn.data);
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Delete an FQDN

Delete an FQDN.

`DELETE /fqdns/{id}`

```javascript
const fqdn = await client.fqdns.delete('1517907029795014409');

console.log(fqdn.data);
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## List Ip connections

Returns a list of your IP connections.

`GET /ip_connections`

```javascript
// Automatically fetches more pages as needed.
for await (const ipConnection of client.ipConnections.list()) {
  console.log(ipConnection.id);
}
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Create an Ip connection

Creates an IP connection.

`POST /ip_connections`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```javascript
const ipConnection = await client.ipConnections.create();

console.log(ipConnection.data);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve an Ip connection

Retrieves the details of an existing ip connection.

`GET /ip_connections/{id}`

```javascript
const ipConnection = await client.ipConnections.retrieve('id');

console.log(ipConnection.data);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update an Ip connection

Updates settings of an existing IP connection.

`PATCH /ip_connections/{id}`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```javascript
const ipConnection = await client.ipConnections.update('id');

console.log(ipConnection.data);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Delete an Ip connection

Deletes an existing IP connection.

`DELETE /ip_connections/{id}`

```javascript
const ipConnection = await client.ipConnections.delete('id');

console.log(ipConnection.data);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List Ips

Get all IPs belonging to the user that match the given filters.

`GET /ips`

```javascript
// Automatically fetches more pages as needed.
for await (const ip of client.ips.list()) {
  console.log(ip.id);
}
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Create an Ip

Create a new IP object.

`POST /ips` — Required: `ip_address`

Optional: `connection_id` (string), `port` (integer)

```javascript
const ip = await client.ips.create({ ip_address: '192.168.0.0' });

console.log(ip.data);
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Retrieve an Ip

Return the details regarding a specific IP.

`GET /ips/{id}`

```javascript
const ip = await client.ips.retrieve('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(ip.data);
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Update an Ip

Update the details of a specific IP.

`PATCH /ips/{id}` — Required: `ip_address`

Optional: `connection_id` (string), `port` (integer)

```javascript
const ip = await client.ips.update('6a09cdc3-8948-47f0-aa62-74ac943d6c58', {
  ip_address: '192.168.0.0',
});

console.log(ip.data);
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Delete an Ip

Delete an IP.

`DELETE /ips/{id}`

```javascript
const ip = await client.ips.delete('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(ip.data);
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Get all outbound voice profiles

Get all outbound voice profiles belonging to the user that match the given filters.

`GET /outbound_voice_profiles`

```javascript
// Automatically fetches more pages as needed.
for await (const outboundVoiceProfile of client.outboundVoiceProfiles.list()) {
  console.log(outboundVoiceProfile.id);
}
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Create an outbound voice profile

Create an outbound voice profile.

`POST /outbound_voice_profiles` — Required: `name`

Optional: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `max_destination_rate` (number), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

```javascript
const outboundVoiceProfile = await client.outboundVoiceProfiles.create({ name: 'office' });

console.log(outboundVoiceProfile.data);
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Retrieve an outbound voice profile

Retrieves the details of an existing outbound voice profile.

`GET /outbound_voice_profiles/{id}`

```javascript
const outboundVoiceProfile = await client.outboundVoiceProfiles.retrieve('1293384261075731499');

console.log(outboundVoiceProfile.data);
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Updates an existing outbound voice profile.

`PATCH /outbound_voice_profiles/{id}` — Required: `name`

Optional: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `max_destination_rate` (number), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

```javascript
const outboundVoiceProfile = await client.outboundVoiceProfiles.update('1293384261075731499', {
  name: 'office',
});

console.log(outboundVoiceProfile.data);
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Delete an outbound voice profile

Deletes an existing outbound voice profile.

`DELETE /outbound_voice_profiles/{id}`

```javascript
const outboundVoiceProfile = await client.outboundVoiceProfiles.delete('1293384261075731499');

console.log(outboundVoiceProfile.data);
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])
