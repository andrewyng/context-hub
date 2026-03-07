---
name: sip-integrations
description: "Manage call recordings, media storage, Dialogflow integration, and external connections for SIP trunking."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,sip,recordings,dialogflow,media-storage"
---

# Telnyx SIP Integrations REST API Coding Guidelines

You are a Telnyx SIP Integrations API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

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

## Retrieve a stored credential

Returns the information about custom storage credentials.

`GET /custom_storage_credentials/{connection_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/custom_storage_credentials/{connection_id}"
```

Returns: `backend` (enum: gcs, s3, azure), `configuration` (object)

## Create a custom storage credential

Creates a custom storage credentials configuration.

`POST /custom_storage_credentials/{connection_id}`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/custom_storage_credentials/{connection_id}"
```

Returns: `backend` (enum: gcs, s3, azure), `configuration` (object)

## Update a stored credential

Updates a stored custom credentials configuration.

`PUT /custom_storage_credentials/{connection_id}`

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/custom_storage_credentials/{connection_id}"
```

Returns: `backend` (enum: gcs, s3, azure), `configuration` (object)

## Delete a stored credential

Deletes a stored custom credentials configuration.

`DELETE /custom_storage_credentials/{connection_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/custom_storage_credentials/{connection_id}"
```

## Retrieve stored Dialogflow Connection

Return details of the Dialogflow connection associated with the given CallControl connection.

`GET /dialogflow_connections/{connection_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/dialogflow_connections/{connection_id}"
```

Returns: `connection_id` (string), `conversation_profile_id` (string), `environment` (string), `record_type` (string), `service_account` (string)

## Create a Dialogflow Connection

Save Dialogflow Credentiails to Telnyx, so it can be used with other Telnyx services.

`POST /dialogflow_connections/{connection_id}`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/dialogflow_connections/{connection_id}"
```

Returns: `connection_id` (string), `conversation_profile_id` (string), `environment` (string), `record_type` (string), `service_account` (string)

## Update stored Dialogflow Connection

Updates a stored Dialogflow Connection.

`PUT /dialogflow_connections/{connection_id}`

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/dialogflow_connections/{connection_id}"
```

Returns: `connection_id` (string), `conversation_profile_id` (string), `environment` (string), `record_type` (string), `service_account` (string)

## Delete stored Dialogflow Connection

Deletes a stored Dialogflow Connection.

`DELETE /dialogflow_connections/{connection_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/dialogflow_connections/{connection_id}"
```

## List all External Connections

This endpoint returns a list of your External Connections inside the 'data' attribute of the response. External Connections are used by Telnyx customers to seamless configure SIP trunking integrations with Telnyx Partners, through External Voice Integrations in Mission Control Portal.

`GET /external_connections`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections"
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Creates an External Connection

Creates a new External Connection based on the parameters sent in the request. The external_sip_connection and outbound voice profile id are required. Once created, you can assign phone numbers to your application using the `/phone_numbers` endpoint.

`POST /external_connections` — Required: `external_sip_connection`, `outbound`

Optional: `active` (boolean), `inbound` (object), `tags` (array[string]), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "active": false,
  "external_sip_connection": "zoom",
  "tags": [
    "tag1",
    "tag2"
  ],
  "webhook_event_url": "https://example.com",
  "webhook_event_failover_url": "https://failover.example.com",
  "webhook_timeout_secs": 25,
  "outbound": {}
}' \
  "https://api.telnyx.com/v2/external_connections"
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List all log messages

Retrieve a list of log messages for all external connections associated with your account.

`GET /external_connections/log_messages`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/log_messages"
```

Returns: `log_messages` (array[object]), `meta` (object)

## Retrieve a log message

Retrieve a log message for an external connection associated with your account.

`GET /external_connections/log_messages/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/log_messages/1293384261075731499"
```

Returns: `log_messages` (array[object])

## Dismiss a log message

Dismiss a log message for an external connection associated with your account.

`DELETE /external_connections/log_messages/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/external_connections/log_messages/1293384261075731499"
```

Returns: `success` (boolean)

## Retrieve an External Connection

Return the details of an existing External Connection inside the 'data' attribute of the response.

`GET /external_connections/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499"
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Update an External Connection

Updates settings of an existing External Connection based on the parameters of the request.

`PATCH /external_connections/{id}` — Required: `outbound`

Optional: `active` (boolean), `inbound` (object), `tags` (array[string]), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "active": false,
  "webhook_event_url": "https://example.com",
  "webhook_event_failover_url": "https://failover.example.com",
  "tags": [
    "tag1",
    "tag2"
  ],
  "webhook_timeout_secs": 25,
  "outbound": {}
}' \
  "https://api.telnyx.com/v2/external_connections/1293384261075731499"
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## Deletes an External Connection

Permanently deletes an External Connection. Deletion may be prevented if the application is in use by phone numbers, is active, or if it is an Operator Connect connection. To remove an Operator Connect integration please contact Telnyx support.

`DELETE /external_connections/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/external_connections/1293384261075731499"
```

Returns: `active` (boolean), `created_at` (string), `credential_active` (boolean), `external_sip_connection` (enum: zoom, operator_connect), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer | null)

## List all civic addresses and locations

Returns the civic addresses and locations from Microsoft Teams.

`GET /external_connections/{id}/civic_addresses`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499/civic_addresses"
```

Returns: `city_or_town` (string), `city_or_town_alias` (string), `company_name` (string), `country` (string), `country_or_district` (string), `default_location_id` (uuid), `description` (string), `house_number` (string), `house_number_suffix` (string), `id` (uuid), `locations` (array[object]), `postal_or_zip_code` (string), `record_type` (string), `state_or_province` (string), `street_name` (string), `street_suffix` (string)

## Retrieve a Civic Address

Return the details of an existing Civic Address with its Locations inside the 'data' attribute of the response.

`GET /external_connections/{id}/civic_addresses/{address_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499/civic_addresses/318fb664-d341-44d2-8405-e6bfb9ced6d9"
```

Returns: `city_or_town` (string), `city_or_town_alias` (string), `company_name` (string), `country` (string), `country_or_district` (string), `default_location_id` (uuid), `description` (string), `house_number` (string), `house_number_suffix` (string), `id` (uuid), `locations` (array[object]), `postal_or_zip_code` (string), `record_type` (string), `state_or_province` (string), `street_name` (string), `street_suffix` (string)

## Update a location's static emergency address

`PATCH /external_connections/{id}/locations/{location_id}` — Required: `static_emergency_address_id`

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "static_emergency_address_id": "550e8400-e29b-41d4-a716-446655440000"
}' \
  "https://api.telnyx.com/v2/external_connections/{id}/locations/{location_id}"
```

Returns: `accepted_address_suggestions` (boolean), `location_id` (uuid), `static_emergency_address_id` (uuid)

## List all phone numbers

Returns a list of all active phone numbers associated with the given external connection.

`GET /external_connections/{id}/phone_numbers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499/phone_numbers"
```

Returns: `acquired_capabilities` (array[string]), `civic_address_id` (uuid), `displayed_country_code` (string), `location_id` (uuid), `number_id` (string), `telephone_number` (string), `ticket_id` (uuid)

## Retrieve a phone number

Return the details of a phone number associated with the given external connection.

`GET /external_connections/{id}/phone_numbers/{phone_number_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499/phone_numbers/1234567889"
```

Returns: `acquired_capabilities` (array[string]), `civic_address_id` (uuid), `displayed_country_code` (string), `location_id` (uuid), `number_id` (string), `telephone_number` (string), `ticket_id` (uuid)

## Update a phone number

Asynchronously update settings of the phone number associated with the given external connection.

`PATCH /external_connections/{id}/phone_numbers/{phone_number_id}`

Optional: `location_id` (uuid)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/external_connections/1293384261075731499/phone_numbers/1234567889"
```

Returns: `acquired_capabilities` (array[string]), `civic_address_id` (uuid), `displayed_country_code` (string), `location_id` (uuid), `number_id` (string), `telephone_number` (string), `ticket_id` (uuid)

## List all Releases

Returns a list of your Releases for the given external connection. These are automatically created when you change the `connection_id` of a phone number that is currently on Microsoft Teams.

`GET /external_connections/{id}/releases`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499/releases"
```

Returns: `created_at` (string), `error_message` (string), `status` (enum: pending_upload, pending, in_progress, complete, failed, expired, unknown), `telephone_numbers` (array[object]), `tenant_id` (uuid), `ticket_id` (uuid)

## Retrieve a Release request

Return the details of a Release request and its phone numbers.

`GET /external_connections/{id}/releases/{release_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499/releases/7b6a6449-b055-45a6-81f6-f6f0dffa4cc6"
```

Returns: `created_at` (string), `error_message` (string), `status` (enum: pending_upload, pending, in_progress, complete, failed, expired, unknown), `telephone_numbers` (array[object]), `tenant_id` (uuid), `ticket_id` (uuid)

## List all Upload requests

Returns a list of your Upload requests for the given external connection.

`GET /external_connections/{id}/uploads`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499/uploads"
```

Returns: `available_usages` (array[string]), `error_code` (string), `error_message` (string), `location_id` (uuid), `status` (enum: pending_upload, pending, in_progress, partial_success, success, error), `tenant_id` (uuid), `ticket_id` (uuid), `tn_upload_entries` (array[object])

## Creates an Upload request

Creates a new Upload request to Microsoft teams with the included phone numbers. Only one of civic_address_id or location_id must be provided, not both. The maximum allowed phone numbers for the numbers_ids array is 1000.

`POST /external_connections/{id}/uploads` — Required: `number_ids`

Optional: `additional_usages` (array[string]), `civic_address_id` (uuid), `location_id` (uuid), `usage` (enum: calling_user_assignment, first_party_app_assignment)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "number_ids": [
    "string"
  ]
}' \
  "https://api.telnyx.com/v2/external_connections/1293384261075731499/uploads"
```

Returns: `success` (boolean), `ticket_id` (uuid)

## Refresh the status of all Upload requests

Forces a recheck of the status of all pending Upload requests for the given external connection in the background.

`POST /external_connections/{id}/uploads/refresh`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/external_connections/1293384261075731499/uploads/refresh"
```

Returns: `success` (boolean)

## Get the count of pending upload requests

Returns the count of all pending upload requests for the given external connection.

`GET /external_connections/{id}/uploads/status`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499/uploads/status"
```

Returns: `pending_numbers_count` (integer), `pending_orders_count` (integer)

## Retrieve an Upload request

Return the details of an Upload request and its phone numbers.

`GET /external_connections/{id}/uploads/{ticket_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/external_connections/1293384261075731499/uploads/7b6a6449-b055-45a6-81f6-f6f0dffa4cc6"
```

Returns: `available_usages` (array[string]), `error_code` (string), `error_message` (string), `location_id` (uuid), `status` (enum: pending_upload, pending, in_progress, partial_success, success, error), `tenant_id` (uuid), `ticket_id` (uuid), `tn_upload_entries` (array[object])

## Retry an Upload request

If there were any errors during the upload process, this endpoint will retry the upload request. In some cases this will reattempt the existing upload request, in other cases it may create a new upload request. Please check the ticket_id in the response to determine if a new upload request was created.

`POST /external_connections/{id}/uploads/{ticket_id}/retry`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/external_connections/1293384261075731499/uploads/7b6a6449-b055-45a6-81f6-f6f0dffa4cc6/retry"
```

Returns: `available_usages` (array[string]), `error_code` (string), `error_message` (string), `location_id` (uuid), `status` (enum: pending_upload, pending, in_progress, partial_success, success, error), `tenant_id` (uuid), `ticket_id` (uuid), `tn_upload_entries` (array[object])

## List uploaded media

Returns a list of stored media files.

`GET /media`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/media"
```

Returns: `content_type` (string), `created_at` (string), `expires_at` (string), `media_name` (string), `updated_at` (string)

## Upload media

Upload media file to Telnyx so it can be used with other Telnyx services

`POST /media` — Required: `media_url`

Optional: `media_name` (string), `ttl_secs` (integer)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -F "media=@/path/to/file" \
  -F "ttl_secs=86400" \
  -F "media_name=my_file" \
  "https://api.telnyx.com/v2/media"
```

Returns: `content_type` (string), `created_at` (string), `expires_at` (string), `media_name` (string), `updated_at` (string)

## Retrieve stored media

Returns the information about a stored media file.

`GET /media/{media_name}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/media/{media_name}"
```

Returns: `content_type` (string), `created_at` (string), `expires_at` (string), `media_name` (string), `updated_at` (string)

## Update stored media

Updates a stored media file.

`PUT /media/{media_name}`

Optional: `media_url` (string), `ttl_secs` (integer)

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -F "media=@/path/to/file" \
  -F "ttl_secs=86400" \
  "https://api.telnyx.com/v2/media/{media_name}"
```

Returns: `content_type` (string), `created_at` (string), `expires_at` (string), `media_name` (string), `updated_at` (string)

## Deletes stored media

Deletes a stored media file.

`DELETE /media/{media_name}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/media/{media_name}"
```

## Download stored media

Downloads a stored media file.

`GET /media/{media_name}/download`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/media/{media_name}/download"
```

## Refresh Operator Connect integration

This endpoint will make an asynchronous request to refresh the Operator Connect integration with Microsoft Teams for the current user. This will create new external connections on the user's account if needed, and/or report the integration results as [log messages](https://developers.telnyx.com/api-reference/external-connections/list-all-log-messages#list-all-log-messages).

`POST /operator_connect/actions/refresh`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/operator_connect/actions/refresh"
```

Returns: `message` (string), `success` (boolean)

## List all recording transcriptions

Returns a list of your recording transcriptions.

`GET /recording_transcriptions`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/recording_transcriptions"
```

Returns: `created_at` (string), `duration_millis` (int32), `id` (string), `record_type` (enum: recording_transcription), `recording_id` (string), `status` (enum: in-progress, completed), `transcription_text` (string), `updated_at` (string)

## Retrieve a recording transcription

Retrieves the details of an existing recording transcription.

`GET /recording_transcriptions/{recording_transcription_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/recording_transcriptions/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `created_at` (string), `duration_millis` (int32), `id` (string), `record_type` (enum: recording_transcription), `recording_id` (string), `status` (enum: in-progress, completed), `transcription_text` (string), `updated_at` (string)

## Delete a recording transcription

Permanently deletes a recording transcription.

`DELETE /recording_transcriptions/{recording_transcription_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/recording_transcriptions/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `created_at` (string), `duration_millis` (int32), `id` (string), `record_type` (enum: recording_transcription), `recording_id` (string), `status` (enum: in-progress, completed), `transcription_text` (string), `updated_at` (string)

## List all call recordings

Returns a list of your call recordings.

`GET /recordings`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/recordings"
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `channels` (enum: single, dual), `conference_id` (string), `created_at` (string), `download_urls` (object), `duration_millis` (int32), `id` (string), `record_type` (enum: recording), `recording_ended_at` (string), `recording_started_at` (string), `source` (enum: conference, call), `status` (enum: completed), `updated_at` (string)

## Delete a list of call recordings

Permanently deletes a list of call recordings.

`POST /recordings/actions/delete`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/recordings/actions/delete"
```

## Retrieve a call recording

Retrieves the details of an existing call recording.

`GET /recordings/{recording_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/recordings/{recording_id}"
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `channels` (enum: single, dual), `conference_id` (string), `created_at` (string), `download_urls` (object), `duration_millis` (int32), `id` (string), `record_type` (enum: recording), `recording_ended_at` (string), `recording_started_at` (string), `source` (enum: conference, call), `status` (enum: completed), `updated_at` (string)

## Delete a call recording

Permanently deletes a call recording.

`DELETE /recordings/{recording_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/recordings/{recording_id}"
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `channels` (enum: single, dual), `conference_id` (string), `created_at` (string), `download_urls` (object), `duration_millis` (int32), `id` (string), `record_type` (enum: recording), `recording_ended_at` (string), `recording_started_at` (string), `source` (enum: conference, call), `status` (enum: completed), `updated_at` (string)

## Create a SIPREC connector

Creates a new SIPREC connector configuration.

`POST /siprec_connectors`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/siprec_connectors"
```

Returns: `app_subdomain` (string), `created_at` (string), `host` (string), `name` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Retrieve a SIPREC connector

Returns details of a stored SIPREC connector.

`GET /siprec_connectors/{connector_name}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/siprec_connectors/{connector_name}"
```

Returns: `app_subdomain` (string), `created_at` (string), `host` (string), `name` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Update a SIPREC connector

Updates a stored SIPREC connector configuration.

`PUT /siprec_connectors/{connector_name}`

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/siprec_connectors/{connector_name}"
```

Returns: `app_subdomain` (string), `created_at` (string), `host` (string), `name` (string), `port` (integer), `record_type` (string), `updated_at` (string)

## Delete a SIPREC connector

Deletes a stored SIPREC connector.

`DELETE /siprec_connectors/{connector_name}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/siprec_connectors/{connector_name}"
```
