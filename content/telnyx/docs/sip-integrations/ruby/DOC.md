---
name: sip-integrations
description: "Manage call recordings, media storage, Dialogflow integration, and external connections for SIP trunking."
metadata:
  languages: "ruby"
  versions: "5.52.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,sip,recordings,dialogflow,media-storage"
---

# Telnyx SIP Integrations Ruby SDK Coding Guidelines

You are a Telnyx SIP Integrations API expert. Help the user write correct, production-ready code using the official Telnyx Ruby SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `require "telnyx"`
- **Incorrect:** unofficial gems or raw HTTP calls

## Installation

```bash
gem install telnyx
```

## Setup

```ruby
require "telnyx"

client = Telnyx::Client.new(
  api_key: ENV["TELNYX_API_KEY"], # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## Retrieve a stored credential

Returns the information about custom storage credentials.

`GET /custom_storage_credentials/{connection_id}`

```ruby
custom_storage_credential = client.custom_storage_credentials.retrieve("connection_id")

puts(custom_storage_credential)
```

Returns: `backend` (enum: gcs, s3, azure), `configuration` (object)

## Create a custom storage credential

Creates a custom storage credentials configuration.

`POST /custom_storage_credentials/{connection_id}`

```ruby
custom_storage_credential = client.custom_storage_credentials.create("connection_id", backend: :gcs, configuration: {backend: :gcs})

puts(custom_storage_credential)
```

Returns: `backend` (enum: gcs, s3, azure), `configuration` (object)

## Update a stored credential

Updates a stored custom credentials configuration.

`PUT /custom_storage_credentials/{connection_id}`

```ruby
custom_storage_credential = client.custom_storage_credentials.update("connection_id", backend: :gcs, configuration: {backend: :gcs})

puts(custom_storage_credential)
```

Returns: `backend` (enum: gcs, s3, azure), `configuration` (object)

## Delete a stored credential

Deletes a stored custom credentials configuration.

`DELETE /custom_storage_credentials/{connection_id}`

```ruby
result = client.custom_storage_credentials.delete("connection_id")

puts(result)
```

## Retrieve stored Dialogflow Connection

Return details of the Dialogflow connection associated with the given CallControl connection.

`GET /dialogflow_connections/{connection_id}`

```ruby
dialogflow_connection = client.dialogflow_connections.retrieve("connection_id")

puts(dialogflow_connection)
```

Returns: `connection_id` (string), `conversation_profile_id` (string), `environment` (string), `record_type` (string), `service_account` (string)

## Create a Dialogflow Connection

Save Dialogflow Credentiails to Telnyx, so it can be used with other Telnyx services.

`POST /dialogflow_connections/{connection_id}`

```ruby
dialogflow_connection = client.dialogflow_connections.create(
  "connection_id",
  service_account: {
    type: "bar",
    project_id: "bar",
    private_key_id: "bar",
    private_key: "bar",
    client_email: "bar",
    client_id: "bar",
    auth_uri: "bar",
    token_uri: "bar",
    auth_provider_x509_cert_url: "bar",
    client_x509_cert_url: "bar"
  }
)

puts(dialogflow_connection)
```

Returns: `connection_id` (string), `conversation_profile_id` (string), `environment` (string), `record_type` (string), `service_account` (string)

## Update stored Dialogflow Connection

Updates a stored Dialogflow Connection.

`PUT /dialogflow_connections/{connection_id}`

```ruby
dialogflow_connection = client.dialogflow_connections.update(
  "connection_id",
  service_account: {
    type: "bar",
    project_id: "bar",
    private_key_id: "bar",
    private_key: "bar",
    client_email: "bar",
    client_id: "bar",
    auth_uri: "bar",
    token_uri: "bar",
    auth_provider_x509_cert_url: "bar",
    client_x509_cert_url: "bar"
  }
)

puts(dialogflow_connection)
```

Returns: `connection_id` (string), `conversation_profile_id` (string), `environment` (string), `record_type` (string), `service_account` (string)

## Delete stored Dialogflow Connection

Deletes a stored Dialogflow Connection.

`DELETE /dialogflow_connections/{connection_id}`

```ruby
result = client.dialogflow_connections.delete("connection_id")

puts(result)
```

## List all External Connections

This endpoint returns a list of your External Connections inside the 'data' attribute of the response. External Connections are used by Telnyx customers to seamless configure SIP trunking integrations with Telnyx Partners, through External Voice Integrations in Mission Control Portal.

`GET /external_connections`

```ruby
page = client.external_connections.list

puts(page)
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Creates an External Connection

Creates a new External Connection based on the parameters sent in the request. The external_sip_connection and outbound voice profile id are required. Once created, you can assign phone numbers to your application using the `/phone_numbers` endpoint.

`POST /external_connections` — Required: `external_sip_connection`, `outbound`

Optional: `active` (boolean), `inbound` (object), `tags` (array[string]), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```ruby
external_connection = client.external_connections.create(external_sip_connection: :zoom, outbound: {})

puts(external_connection)
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List all log messages

Retrieve a list of log messages for all external connections associated with your account.

`GET /external_connections/log_messages`

```ruby
page = client.external_connections.log_messages.list

puts(page)
```

Returns: `log_messages` (array[object]), `meta` (object)

## Retrieve a log message

Retrieve a log message for an external connection associated with your account.

`GET /external_connections/log_messages/{id}`

```ruby
log_message = client.external_connections.log_messages.retrieve("1293384261075731499")

puts(log_message)
```

Returns: `log_messages` (array[object])

## Dismiss a log message

Dismiss a log message for an external connection associated with your account.

`DELETE /external_connections/log_messages/{id}`

```ruby
response = client.external_connections.log_messages.dismiss("1293384261075731499")

puts(response)
```

Returns: `success` (boolean)

## Retrieve an External Connection

Return the details of an existing External Connection inside the 'data' attribute of the response.

`GET /external_connections/{id}`

```ruby
external_connection = client.external_connections.retrieve("1293384261075731499")

puts(external_connection)
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update an External Connection

Updates settings of an existing External Connection based on the parameters of the request.

`PATCH /external_connections/{id}` — Required: `outbound`

Optional: `active` (boolean), `inbound` (object), `tags` (array[string]), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```ruby
external_connection = client.external_connections.update(
  "1293384261075731499",
  outbound: {outbound_voice_profile_id: "1911630617284445511"}
)

puts(external_connection)
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Deletes an External Connection

Permanently deletes an External Connection. Deletion may be prevented if the application is in use by phone numbers, is active, or if it is an Operator Connect connection. To remove an Operator Connect integration please contact Telnyx support.

`DELETE /external_connections/{id}`

```ruby
external_connection = client.external_connections.delete("1293384261075731499")

puts(external_connection)
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List all civic addresses and locations

Returns the civic addresses and locations from Microsoft Teams.

`GET /external_connections/{id}/civic_addresses`

```ruby
civic_addresses = client.external_connections.civic_addresses.list("1293384261075731499")

puts(civic_addresses)
```

Returns: `city_or_town` (string), `city_or_town_alias` (string), `company_name` (string), `country` (string), `country_or_district` (string), `default_location_id` (uuid), `description` (string), `house_number` (string), `house_number_suffix` (string), `id` (uuid), `locations` (array[object]), `postal_or_zip_code` (string), `record_type` (string), `state_or_province` (string), `street_name` (string), `street_suffix` (string)

## Retrieve a Civic Address

Return the details of an existing Civic Address with its Locations inside the 'data' attribute of the response.

`GET /external_connections/{id}/civic_addresses/{address_id}`

```ruby
civic_address = client.external_connections.civic_addresses.retrieve(
  "318fb664-d341-44d2-8405-e6bfb9ced6d9",
  id: "1293384261075731499"
)

puts(civic_address)
```

Returns: `city_or_town` (string), `city_or_town_alias` (string), `company_name` (string), `country` (string), `country_or_district` (string), `default_location_id` (uuid), `description` (string), `house_number` (string), `house_number_suffix` (string), `id` (uuid), `locations` (array[object]), `postal_or_zip_code` (string), `record_type` (string), `state_or_province` (string), `street_name` (string), `street_suffix` (string)

## Update a location's static emergency address

`PATCH /external_connections/{id}/locations/{location_id}` — Required: `static_emergency_address_id`

```ruby
response = client.external_connections.update_location(
  "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
  id: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
  static_emergency_address_id: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e"
)

puts(response)
```

Returns: `accepted_address_suggestions` (boolean), `location_id` (uuid), `static_emergency_address_id` (uuid)

## List all phone numbers

Returns a list of all active phone numbers associated with the given external connection.

`GET /external_connections/{id}/phone_numbers`

```ruby
page = client.external_connections.phone_numbers.list("1293384261075731499")

puts(page)
```

Returns: `acquired_capabilities` (array[string]), `civic_address_id` (uuid), `displayed_country_code` (string), `location_id` (uuid), `number_id` (string), `telephone_number` (string), `ticket_id` (uuid)

## Retrieve a phone number

Return the details of a phone number associated with the given external connection.

`GET /external_connections/{id}/phone_numbers/{phone_number_id}`

```ruby
phone_number = client.external_connections.phone_numbers.retrieve("1234567889", id: "1293384261075731499")

puts(phone_number)
```

Returns: `acquired_capabilities` (array[string]), `civic_address_id` (uuid), `displayed_country_code` (string), `location_id` (uuid), `number_id` (string), `telephone_number` (string), `ticket_id` (uuid)

## Update a phone number

Asynchronously update settings of the phone number associated with the given external connection.

`PATCH /external_connections/{id}/phone_numbers/{phone_number_id}`

Optional: `location_id` (uuid)

```ruby
phone_number = client.external_connections.phone_numbers.update("1234567889", id: "1293384261075731499")

puts(phone_number)
```

Returns: `acquired_capabilities` (array[string]), `civic_address_id` (uuid), `displayed_country_code` (string), `location_id` (uuid), `number_id` (string), `telephone_number` (string), `ticket_id` (uuid)

## List all Releases

Returns a list of your Releases for the given external connection. These are automatically created when you change the `connection_id` of a phone number that is currently on Microsoft Teams.

`GET /external_connections/{id}/releases`

```ruby
page = client.external_connections.releases.list("1293384261075731499")

puts(page)
```

Returns: `created_at` (string), `error_message` (string), `status` (enum: pending_upload, pending, in_progress, complete, failed, expired, unknown), `telephone_numbers` (array[object]), `tenant_id` (uuid), `ticket_id` (uuid)

## Retrieve a Release request

Return the details of a Release request and its phone numbers.

`GET /external_connections/{id}/releases/{release_id}`

```ruby
release = client.external_connections.releases.retrieve(
  "7b6a6449-b055-45a6-81f6-f6f0dffa4cc6",
  id: "1293384261075731499"
)

puts(release)
```

Returns: `created_at` (string), `error_message` (string), `status` (enum: pending_upload, pending, in_progress, complete, failed, expired, unknown), `telephone_numbers` (array[object]), `tenant_id` (uuid), `ticket_id` (uuid)

## List all Upload requests

Returns a list of your Upload requests for the given external connection.

`GET /external_connections/{id}/uploads`

```ruby
page = client.external_connections.uploads.list("1293384261075731499")

puts(page)
```

Returns: `available_usages` (array[string]), `error_code` (string), `error_message` (string), `location_id` (uuid), `status` (enum: pending_upload, pending, in_progress, partial_success, success, error), `tenant_id` (uuid), `ticket_id` (uuid), `tn_upload_entries` (array[object])

## Creates an Upload request

Creates a new Upload request to Microsoft teams with the included phone numbers. Only one of civic_address_id or location_id must be provided, not both. The maximum allowed phone numbers for the numbers_ids array is 1000.

`POST /external_connections/{id}/uploads` — Required: `number_ids`

Optional: `additional_usages` (array[string]), `civic_address_id` (uuid), `location_id` (uuid), `usage` (enum: calling_user_assignment, first_party_app_assignment)

```ruby
upload = client.external_connections.uploads.create(
  "1293384261075731499",
  number_ids: ["3920457616934164700", "3920457616934164701", "3920457616934164702", "3920457616934164703"]
)

puts(upload)
```

Returns: `success` (boolean), `ticket_id` (uuid)

## Refresh the status of all Upload requests

Forces a recheck of the status of all pending Upload requests for the given external connection in the background.

`POST /external_connections/{id}/uploads/refresh`

```ruby
response = client.external_connections.uploads.refresh_status("1293384261075731499")

puts(response)
```

Returns: `success` (boolean)

## Get the count of pending upload requests

Returns the count of all pending upload requests for the given external connection.

`GET /external_connections/{id}/uploads/status`

```ruby
response = client.external_connections.uploads.pending_count("1293384261075731499")

puts(response)
```

Returns: `pending_numbers_count` (integer), `pending_orders_count` (integer)

## Retrieve an Upload request

Return the details of an Upload request and its phone numbers.

`GET /external_connections/{id}/uploads/{ticket_id}`

```ruby
upload = client.external_connections.uploads.retrieve(
  "7b6a6449-b055-45a6-81f6-f6f0dffa4cc6",
  id: "1293384261075731499"
)

puts(upload)
```

Returns: `available_usages` (array[string]), `error_code` (string), `error_message` (string), `location_id` (uuid), `status` (enum: pending_upload, pending, in_progress, partial_success, success, error), `tenant_id` (uuid), `ticket_id` (uuid), `tn_upload_entries` (array[object])

## Retry an Upload request

If there were any errors during the upload process, this endpoint will retry the upload request. In some cases this will reattempt the existing upload request, in other cases it may create a new upload request. Please check the ticket_id in the response to determine if a new upload request was created.

`POST /external_connections/{id}/uploads/{ticket_id}/retry`

```ruby
response = client.external_connections.uploads.retry_(
  "7b6a6449-b055-45a6-81f6-f6f0dffa4cc6",
  id: "1293384261075731499"
)

puts(response)
```

Returns: `available_usages` (array[string]), `error_code` (string), `error_message` (string), `location_id` (uuid), `status` (enum: pending_upload, pending, in_progress, partial_success, success, error), `tenant_id` (uuid), `ticket_id` (uuid), `tn_upload_entries` (array[object])

## List uploaded media

Returns a list of stored media files.

`GET /media`

```ruby
media = client.media.list

puts(media)
```

Returns: `content_type` (string), `created_at` (string), `expires_at` (string), `media_name` (string), `updated_at` (string)

## Upload media

Upload media file to Telnyx so it can be used with other Telnyx services

`POST /media` — Required: `media_url`

Optional: `media_name` (string), `ttl_secs` (integer)

```ruby
response = client.media.upload(media_url: "http://www.example.com/audio.mp3")

puts(response)
```

Returns: `content_type` (string), `created_at` (string), `expires_at` (string), `media_name` (string), `updated_at` (string)

## Retrieve stored media

Returns the information about a stored media file.

`GET /media/{media_name}`

```ruby
media = client.media.retrieve("media_name")

puts(media)
```

Returns: `content_type` (string), `created_at` (string), `expires_at` (string), `media_name` (string), `updated_at` (string)

## Update stored media

Updates a stored media file.

`PUT /media/{media_name}`

Optional: `media_url` (string), `ttl_secs` (integer)

```ruby
media = client.media.update("media_name")

puts(media)
```

Returns: `content_type` (string), `created_at` (string), `expires_at` (string), `media_name` (string), `updated_at` (string)

## Deletes stored media

Deletes a stored media file.

`DELETE /media/{media_name}`

```ruby
result = client.media.delete("media_name")

puts(result)
```

## Download stored media

Downloads a stored media file.

`GET /media/{media_name}/download`

```ruby
response = client.media.download("media_name")

puts(response)
```

## Refresh Operator Connect integration

This endpoint will make an asynchronous request to refresh the Operator Connect integration with Microsoft Teams for the current user. This will create new external connections on the user's account if needed, and/or report the integration results as [log messages](https://developers.telnyx.com/api-reference/external-connections/list-all-log-messages#list-all-log-messages).

`POST /operator_connect/actions/refresh`

```ruby
response = client.operator_connect.actions.refresh

puts(response)
```

Returns: `message` (string), `success` (boolean)

## List all recording transcriptions

Returns a list of your recording transcriptions.

`GET /recording_transcriptions`

```ruby
recording_transcriptions = client.recording_transcriptions.list

puts(recording_transcriptions)
```

Returns: `created_at` (string), `duration_millis` (int32), `id` (string), `record_type` (enum: recording_transcription), `recording_id` (string), `status` (enum: in-progress, completed), `transcription_text` (string), `updated_at` (string)

## Retrieve a recording transcription

Retrieves the details of an existing recording transcription.

`GET /recording_transcriptions/{recording_transcription_id}`

```ruby
recording_transcription = client.recording_transcriptions.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(recording_transcription)
```

Returns: `created_at` (string), `duration_millis` (int32), `id` (string), `record_type` (enum: recording_transcription), `recording_id` (string), `status` (enum: in-progress, completed), `transcription_text` (string), `updated_at` (string)

## Delete a recording transcription

Permanently deletes a recording transcription.

`DELETE /recording_transcriptions/{recording_transcription_id}`

```ruby
recording_transcription = client.recording_transcriptions.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(recording_transcription)
```

Returns: `created_at` (string), `duration_millis` (int32), `id` (string), `record_type` (enum: recording_transcription), `recording_id` (string), `status` (enum: in-progress, completed), `transcription_text` (string), `updated_at` (string)

## List all call recordings

Returns a list of your call recordings.

`GET /recordings`

```ruby
page = client.recordings.list

puts(page)
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `channels` (enum: single, dual), `conference_id` (string), `created_at` (string), `download_urls` (object), `duration_millis` (int32), `id` (string), `record_type` (enum: recording), `recording_ended_at` (string), `recording_started_at` (string), `source` (enum: conference, call), `status` (enum: completed), `updated_at` (string)

## Delete a list of call recordings

Permanently deletes a list of call recordings.

`POST /recordings/actions/delete`

```ruby
result = client.recordings.actions.delete(
  ids: ["428c31b6-7af4-4bcb-b7f5-5013ef9657c1", "428c31b6-7af4-4bcb-b7f5-5013ef9657c2"]
)

puts(result)
```

## Retrieve a call recording

Retrieves the details of an existing call recording.

`GET /recordings/{recording_id}`

```ruby
recording = client.recordings.retrieve("recording_id")

puts(recording)
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `channels` (enum: single, dual), `conference_id` (string), `created_at` (string), `download_urls` (object), `duration_millis` (int32), `id` (string), `record_type` (enum: recording), `recording_ended_at` (string), `recording_started_at` (string), `source` (enum: conference, call), `status` (enum: completed), `updated_at` (string)

## Delete a call recording

Permanently deletes a call recording.

`DELETE /recordings/{recording_id}`

```ruby
recording = client.recordings.delete("recording_id")

puts(recording)
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `channels` (enum: single, dual), `conference_id` (string), `created_at` (string), `download_urls` (object), `duration_millis` (int32), `id` (string), `record_type` (enum: recording), `recording_ended_at` (string), `recording_started_at` (string), `source` (enum: conference, call), `status` (enum: completed), `updated_at` (string)

## Create a SIPREC connector

Creates a new SIPREC connector configuration.

`POST /siprec_connectors`

```ruby
siprec_connector = client.siprec_connectors.create(host: "siprec.client.com", name: "my-siprec-connector", port: 5060)

puts(siprec_connector)
```

Returns: `app_subdomain` (string), `created_at` (string), `host` (string), `name` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Retrieve a SIPREC connector

Returns details of a stored SIPREC connector.

`GET /siprec_connectors/{connector_name}`

```ruby
siprec_connector = client.siprec_connectors.retrieve("connector_name")

puts(siprec_connector)
```

Returns: `app_subdomain` (string), `created_at` (string), `host` (string), `name` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Update a SIPREC connector

Updates a stored SIPREC connector configuration.

`PUT /siprec_connectors/{connector_name}`

```ruby
siprec_connector = client.siprec_connectors.update(
  "connector_name",
  host: "siprec.client.com",
  name: "my-siprec-connector",
  port: 5060
)

puts(siprec_connector)
```

Returns: `app_subdomain` (string), `created_at` (string), `host` (string), `name` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Delete a SIPREC connector

Deletes a stored SIPREC connector.

`DELETE /siprec_connectors/{connector_name}`

```ruby
result = client.siprec_connectors.delete("connector_name")

puts(result)
```
