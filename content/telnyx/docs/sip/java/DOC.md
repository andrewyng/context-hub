---
name: sip
description: "Configure SIP trunking connections and outbound voice profiles. Use when connecting PBX systems or managing SIP infrastructure."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,sip,trunking,pbx,voice"
---

# Telnyx SIP Java SDK Coding Guidelines

You are a Telnyx SIP API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## List all Access IP Ranges

`GET /access_ip_ranges`

```java
import com.telnyx.sdk.models.accessipranges.AccessIpRangeListPage;
import com.telnyx.sdk.models.accessipranges.AccessIpRangeListParams;

AccessIpRangeListPage page = client.accessIpRanges().list();
```

Returns: `cidr_block` (string), `created_at` (date-time), `description` (string), `id` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Create new Access IP Range

`POST /access_ip_ranges` — Required: `cidr_block`

Optional: `description` (string)

```java
import com.telnyx.sdk.models.accessipranges.AccessIpRange;
import com.telnyx.sdk.models.accessipranges.AccessIpRangeCreateParams;

AccessIpRangeCreateParams params = AccessIpRangeCreateParams.builder()
    .cidrBlock("cidr_block")
    .build();
AccessIpRange accessIpRange = client.accessIpRanges().create(params);
```

Returns: `cidr_block` (string), `created_at` (date-time), `description` (string), `id` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Delete access IP ranges

`DELETE /access_ip_ranges/{access_ip_range_id}`

```java
import com.telnyx.sdk.models.accessipranges.AccessIpRange;
import com.telnyx.sdk.models.accessipranges.AccessIpRangeDeleteParams;

AccessIpRange accessIpRange = client.accessIpRanges().delete("access_ip_range_id");
```

Returns: `cidr_block` (string), `created_at` (date-time), `description` (string), `id` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## List connections

Returns a list of your connections irrespective of type.

`GET /connections`

```java
import com.telnyx.sdk.models.connections.ConnectionListPage;
import com.telnyx.sdk.models.connections.ConnectionListParams;

ConnectionListPage page = client.connections().list();
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `connection_name` (string), `created_at` (string), `id` (string), `outbound_voice_profile_id` (string), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri)

## Retrieve a connection

Retrieves the high-level details of an existing connection. To retrieve specific authentication information, use the endpoint for the specific connection type.

`GET /connections/{id}`

```java
import com.telnyx.sdk.models.connections.ConnectionRetrieveParams;
import com.telnyx.sdk.models.connections.ConnectionRetrieveResponse;

ConnectionRetrieveResponse connection = client.connections().retrieve("id");
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `connection_name` (string), `created_at` (string), `id` (string), `outbound_voice_profile_id` (string), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri)

## List credential connections

Returns a list of your credential connections.

`GET /credential_connections`

```java
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionListPage;
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionListParams;

CredentialConnectionListPage page = client.credentialConnections().list();
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Create a credential connection

Creates a credential connection.

`POST /credential_connections` — Required: `user_name`, `password`, `connection_name`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `webhook_api_version` (enum: 1, 2, texml), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```java
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionCreateParams;
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionCreateResponse;

CredentialConnectionCreateParams params = CredentialConnectionCreateParams.builder()
    .connectionName("my name")
    .password("my123secure456password789")
    .userName("myusername123")
    .build();
CredentialConnectionCreateResponse credentialConnection = client.credentialConnections().create(params);
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve a credential connection

Retrieves the details of an existing credential connection.

`GET /credential_connections/{id}`

```java
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionRetrieveParams;
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionRetrieveResponse;

CredentialConnectionRetrieveResponse credentialConnection = client.credentialConnections().retrieve("id");
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update a credential connection

Updates settings of an existing credential connection.

`PATCH /credential_connections/{id}`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```java
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionUpdateParams;
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionUpdateResponse;

CredentialConnectionUpdateResponse credentialConnection = client.credentialConnections().update("id");
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Delete a credential connection

Deletes an existing credential connection.

`DELETE /credential_connections/{id}`

```java
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionDeleteParams;
import com.telnyx.sdk.models.credentialconnections.CredentialConnectionDeleteResponse;

CredentialConnectionDeleteResponse credentialConnection = client.credentialConnections().delete("id");
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `sip_uri_calling_preference` (enum: disabled, unrestricted, internal), `tags` (array[string]), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Check a Credential Connection Registration Status

Checks the registration_status for a credential connection, (`registration_status`) as well as the timestamp for the last SIP registration event (`registration_status_updated_at`)

`POST /credential_connections/{id}/actions/check_registration_status`

```java
import com.telnyx.sdk.models.credentialconnections.actions.ActionCheckRegistrationStatusParams;
import com.telnyx.sdk.models.credentialconnections.actions.ActionCheckRegistrationStatusResponse;

ActionCheckRegistrationStatusResponse response = client.credentialConnections().actions().checkRegistrationStatus("id");
```

Returns: `ip_address` (string), `last_registration` (string), `port` (integer), `record_type` (string), `sip_username` (string), `status` (enum: Not Applicable, Not Registered, Failed, Expired, Registered, Unregistered), `transport` (string), `user_agent` (string)

## List FQDN connections

Returns a list of your FQDN connections.

`GET /fqdn_connections`

```java
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionListPage;
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionListParams;

FqdnConnectionListPage page = client.fqdnConnections().list();
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Create an FQDN connection

Creates a FQDN connection.

`POST /fqdn_connections` — Required: `connection_name`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```java
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionCreateParams;
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionCreateResponse;

FqdnConnectionCreateParams params = FqdnConnectionCreateParams.builder()
    .connectionName("string")
    .build();
FqdnConnectionCreateResponse fqdnConnection = client.fqdnConnections().create(params);
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve an FQDN connection

Retrieves the details of an existing FQDN connection.

`GET /fqdn_connections/{id}`

```java
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionRetrieveParams;
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionRetrieveResponse;

FqdnConnectionRetrieveResponse fqdnConnection = client.fqdnConnections().retrieve("1293384261075731499");
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update an FQDN connection

Updates settings of an existing FQDN connection.

`PATCH /fqdn_connections/{id}`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```java
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionUpdateParams;
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionUpdateResponse;

FqdnConnectionUpdateResponse fqdnConnection = client.fqdnConnections().update("1293384261075731499");
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Delete an FQDN connection

Deletes an FQDN connection.

`DELETE /fqdn_connections/{id}`

```java
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionDeleteParams;
import com.telnyx.sdk.models.fqdnconnections.FqdnConnectionDeleteResponse;

FqdnConnectionDeleteResponse fqdnConnection = client.fqdnConnections().delete("1293384261075731499");
```

Returns: `active` (boolean), `adjust_dtmf_timestamp` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_enabled` (boolean), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `ignore_dtmf_duration` (boolean), `ignore_mark_bit` (boolean), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `microsoft_teams_sbc` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `password` (string), `record_type` (string), `rtcp_settings` (object), `rtp_pass_codecs_on_stream_change` (boolean), `send_normalized_timestamps` (boolean), `tags` (array[string]), `third_party_control_enabled` (boolean), `transport_protocol` (enum: UDP, TCP, TLS), `txt_name` (string), `txt_ttl` (integer), `txt_value` (string), `updated_at` (string), `user_name` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List FQDNs

Get all FQDNs belonging to the user that match the given filters.

`GET /fqdns`

```java
import com.telnyx.sdk.models.fqdns.FqdnListPage;
import com.telnyx.sdk.models.fqdns.FqdnListParams;

FqdnListPage page = client.fqdns().list();
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Create an FQDN

Create a new FQDN object.

`POST /fqdns` — Required: `fqdn`, `dns_record_type`, `connection_id`

Optional: `port` (integer | null)

```java
import com.telnyx.sdk.models.fqdns.FqdnCreateParams;
import com.telnyx.sdk.models.fqdns.FqdnCreateResponse;

FqdnCreateParams params = FqdnCreateParams.builder()
    .connectionId("1516447646313612565")
    .dnsRecordType("a")
    .fqdn("example.com")
    .build();
FqdnCreateResponse fqdn = client.fqdns().create(params);
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Retrieve an FQDN

Return the details regarding a specific FQDN.

`GET /fqdns/{id}`

```java
import com.telnyx.sdk.models.fqdns.FqdnRetrieveParams;
import com.telnyx.sdk.models.fqdns.FqdnRetrieveResponse;

FqdnRetrieveResponse fqdn = client.fqdns().retrieve("1517907029795014409");
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Update an FQDN

Update the details of a specific FQDN.

`PATCH /fqdns/{id}`

Optional: `connection_id` (string), `dns_record_type` (string), `fqdn` (string), `port` (integer | null)

```java
import com.telnyx.sdk.models.fqdns.FqdnUpdateParams;
import com.telnyx.sdk.models.fqdns.FqdnUpdateResponse;

FqdnUpdateResponse fqdn = client.fqdns().update("1517907029795014409");
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Delete an FQDN

Delete an FQDN.

`DELETE /fqdns/{id}`

```java
import com.telnyx.sdk.models.fqdns.FqdnDeleteParams;
import com.telnyx.sdk.models.fqdns.FqdnDeleteResponse;

FqdnDeleteResponse fqdn = client.fqdns().delete("1517907029795014409");
```

Returns: `connection_id` (string), `created_at` (string), `dns_record_type` (string), `fqdn` (string), `id` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## List Ip connections

Returns a list of your IP connections.

`GET /ip_connections`

```java
import com.telnyx.sdk.models.ipconnections.IpConnectionListPage;
import com.telnyx.sdk.models.ipconnections.IpConnectionListParams;

IpConnectionListPage page = client.ipConnections().list();
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Create an Ip connection

Creates an IP connection.

`POST /ip_connections`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```java
import com.telnyx.sdk.models.ipconnections.IpConnectionCreateParams;
import com.telnyx.sdk.models.ipconnections.IpConnectionCreateResponse;

IpConnectionCreateResponse ipConnection = client.ipConnections().create();
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Retrieve an Ip connection

Retrieves the details of an existing ip connection.

`GET /ip_connections/{id}`

```java
import com.telnyx.sdk.models.ipconnections.IpConnectionRetrieveParams;
import com.telnyx.sdk.models.ipconnections.IpConnectionRetrieveResponse;

IpConnectionRetrieveResponse ipConnection = client.ipConnections().retrieve("id");
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update an Ip connection

Updates settings of an existing IP connection.

`PATCH /ip_connections/{id}`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```java
import com.telnyx.sdk.models.ipconnections.IpConnectionUpdateParams;
import com.telnyx.sdk.models.ipconnections.IpConnectionUpdateResponse;

IpConnectionUpdateResponse ipConnection = client.ipConnections().update("id");
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Delete an Ip connection

Deletes an existing IP connection.

`DELETE /ip_connections/{id}`

```java
import com.telnyx.sdk.models.ipconnections.IpConnectionDeleteParams;
import com.telnyx.sdk.models.ipconnections.IpConnectionDeleteResponse;

IpConnectionDeleteResponse ipConnection = client.ipConnections().delete("id");
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `android_push_credential_id` (string | null), `call_cost_in_webhooks` (boolean), `connection_name` (string), `created_at` (string), `default_on_hold_comfort_noise_enabled` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `encode_contact_header_enabled` (boolean), `encrypted_media` (enum: SRTP, None), `id` (string), `inbound` (object), `ios_push_credential_id` (string | null), `jitter_buffer` (object), `noise_suppression` (enum: inbound, outbound, both, disabled), `noise_suppression_details` (object), `onnet_t38_passthrough_enabled` (boolean), `outbound` (object), `record_type` (string), `rtcp_settings` (object), `tags` (array[string]), `transport_protocol` (enum: UDP, TCP, TLS), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List Ips

Get all IPs belonging to the user that match the given filters.

`GET /ips`

```java
import com.telnyx.sdk.models.ips.IpListPage;
import com.telnyx.sdk.models.ips.IpListParams;

IpListPage page = client.ips().list();
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Create an Ip

Create a new IP object.

`POST /ips` — Required: `ip_address`

Optional: `connection_id` (string), `port` (integer)

```java
import com.telnyx.sdk.models.ips.IpCreateParams;
import com.telnyx.sdk.models.ips.IpCreateResponse;

IpCreateParams params = IpCreateParams.builder()
    .ipAddress("192.168.0.0")
    .build();
IpCreateResponse ip = client.ips().create(params);
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Retrieve an Ip

Return the details regarding a specific IP.

`GET /ips/{id}`

```java
import com.telnyx.sdk.models.ips.IpRetrieveParams;
import com.telnyx.sdk.models.ips.IpRetrieveResponse;

IpRetrieveResponse ip = client.ips().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Update an Ip

Update the details of a specific IP.

`PATCH /ips/{id}` — Required: `ip_address`

Optional: `connection_id` (string), `port` (integer)

```java
import com.telnyx.sdk.models.ips.IpUpdateParams;
import com.telnyx.sdk.models.ips.IpUpdateResponse;

IpUpdateParams params = IpUpdateParams.builder()
    .id("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .ipAddress("192.168.0.0")
    .build();
IpUpdateResponse ip = client.ips().update(params);
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Delete an Ip

Delete an IP.

`DELETE /ips/{id}`

```java
import com.telnyx.sdk.models.ips.IpDeleteParams;
import com.telnyx.sdk.models.ips.IpDeleteResponse;

IpDeleteResponse ip = client.ips().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `connection_id` (string), `created_at` (string), `id` (string), `ip_address` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Get all outbound voice profiles

Get all outbound voice profiles belonging to the user that match the given filters.

`GET /outbound_voice_profiles`

```java
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileListPage;
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileListParams;

OutboundVoiceProfileListPage page = client.outboundVoiceProfiles().list();
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Create an outbound voice profile

Create an outbound voice profile.

`POST /outbound_voice_profiles` — Required: `name`

Optional: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `max_destination_rate` (number), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

```java
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileCreateParams;
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileCreateResponse;

OutboundVoiceProfileCreateParams params = OutboundVoiceProfileCreateParams.builder()
    .name("office")
    .build();
OutboundVoiceProfileCreateResponse outboundVoiceProfile = client.outboundVoiceProfiles().create(params);
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Retrieve an outbound voice profile

Retrieves the details of an existing outbound voice profile.

`GET /outbound_voice_profiles/{id}`

```java
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileRetrieveParams;
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileRetrieveResponse;

OutboundVoiceProfileRetrieveResponse outboundVoiceProfile = client.outboundVoiceProfiles().retrieve("1293384261075731499");
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Updates an existing outbound voice profile.

`PATCH /outbound_voice_profiles/{id}` — Required: `name`

Optional: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `max_destination_rate` (number), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

```java
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileUpdateParams;
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileUpdateResponse;

OutboundVoiceProfileUpdateParams params = OutboundVoiceProfileUpdateParams.builder()
    .id("1293384261075731499")
    .name("office")
    .build();
OutboundVoiceProfileUpdateResponse outboundVoiceProfile = client.outboundVoiceProfiles().update(params);
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])

## Delete an outbound voice profile

Deletes an existing outbound voice profile.

`DELETE /outbound_voice_profiles/{id}`

```java
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileDeleteParams;
import com.telnyx.sdk.models.outboundvoiceprofiles.OutboundVoiceProfileDeleteResponse;

OutboundVoiceProfileDeleteResponse outboundVoiceProfile = client.outboundVoiceProfiles().delete("1293384261075731499");
```

Returns: `billing_group_id` (uuid), `call_recording` (object), `calling_window` (object), `concurrent_call_limit` (integer | null), `connections_count` (integer), `created_at` (string), `daily_spend_limit` (string), `daily_spend_limit_enabled` (boolean), `enabled` (boolean), `id` (string), `max_destination_rate` (number), `name` (string), `record_type` (string), `service_plan` (enum: global), `tags` (array[string]), `traffic_type` (enum: conversational), `updated_at` (string), `usage_payment_method` (enum: rate-deck), `whitelisted_destinations` (array[string])
