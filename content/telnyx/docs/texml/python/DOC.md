---
name: texml
description: "Build voice applications using TeXML markup language (TwiML-compatible). Manage applications, calls, conferences, recordings, queues, and streams."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,texml,twiml,voice,xml"
---

# Telnyx TeXML Python SDK Coding Guidelines

You are a Telnyx TeXML API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

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

## Fetch multiple call resources

Returns multiple call resources for an account. This endpoint is eventually consistent.

`GET /texml/Accounts/{account_sid}/Calls`

```python
response = client.texml.accounts.calls.retrieve_calls(
    account_sid="account_sid",
)
print(response.calls)
```

Returns: `calls` (array[object]), `end` (integer), `first_page_uri` (string), `next_page_uri` (string), `page` (integer), `page_size` (integer), `start` (integer), `uri` (string)

## Initiate an outbound call

Initiate an outbound TeXML call. Telnyx will request TeXML from the XML Request URL configured for the connection in the Mission Control Portal.

`POST /texml/Accounts/{account_sid}/Calls` — Required: `To`, `From`, `ApplicationSid`

Optional: `AsyncAmd` (boolean), `AsyncAmdStatusCallback` (string), `AsyncAmdStatusCallbackMethod` (enum: GET, POST), `CallerId` (string), `CancelPlaybackOnDetectMessageEnd` (boolean), `CancelPlaybackOnMachineDetection` (boolean), `CustomHeaders` (array[object]), `DetectionMode` (enum: Premium, Regular), `FallbackUrl` (string), `MachineDetection` (enum: Enable, Disable, DetectMessageEnd), `MachineDetectionSilenceTimeout` (integer), `MachineDetectionSpeechEndThreshold` (integer), `MachineDetectionSpeechThreshold` (integer), `MachineDetectionTimeout` (integer), `PreferredCodecs` (string), `Record` (boolean), `RecordingChannels` (enum: mono, dual), `RecordingStatusCallback` (string), `RecordingStatusCallbackEvent` (string), `RecordingStatusCallbackMethod` (enum: GET, POST), `RecordingTimeout` (integer), `RecordingTrack` (enum: inbound, outbound, both), `SendRecordingUrl` (boolean), `SipAuthPassword` (string), `SipAuthUsername` (string), `SipRegion` (enum: US, Europe, Canada, Australia, Middle East), `StatusCallback` (string), `StatusCallbackEvent` (enum: initiated, ringing, answered, completed), `StatusCallbackMethod` (enum: GET, POST), `SuperviseCallSid` (string), `SupervisingRole` (enum: barge, whisper, monitor), `Texml` (string), `TimeLimit` (integer), `Timeout` (integer), `Trim` (enum: trim-silence, do-not-trim), `Url` (string), `UrlMethod` (enum: GET, POST)

```python
response = client.texml.accounts.calls.calls(
    account_sid="account_sid",
    application_sid="example-app-sid",
    from_="+13120001234",
    to="+13121230000",
)
print(response.from_)
```

Returns: `from` (string), `status` (string), `to` (string)

## Fetch a call

Returns an individual call identified by its CallSid. This endpoint is eventually consistent.

`GET /texml/Accounts/{account_sid}/Calls/{call_sid}`

```python
call = client.texml.accounts.calls.retrieve(
    call_sid="call_sid",
    account_sid="account_sid",
)
print(call.account_sid)
```

Returns: `account_sid` (string), `answered_by` (enum: human, machine, not_sure), `caller_name` (string), `date_created` (string), `date_updated` (string), `direction` (enum: inbound, outbound), `duration` (string), `end_time` (string), `from` (string), `from_formatted` (string), `price` (string), `price_unit` (string), `sid` (string), `start_time` (string), `status` (enum: ringing, in-progress, canceled, completed, failed, busy, no-answer), `to` (string), `to_formatted` (string), `uri` (string)

## Update call

Update TeXML call. Please note that the keys present in the payload MUST BE formatted in CamelCase as specified in the example.

`POST /texml/Accounts/{account_sid}/Calls/{call_sid}`

```python
call = client.texml.accounts.calls.update(
    call_sid="call_sid",
    account_sid="account_sid",
)
print(call.account_sid)
```

Returns: `account_sid` (string), `answered_by` (enum: human, machine, not_sure), `caller_name` (string), `date_created` (string), `date_updated` (string), `direction` (enum: inbound, outbound), `duration` (string), `end_time` (string), `from` (string), `from_formatted` (string), `price` (string), `price_unit` (string), `sid` (string), `start_time` (string), `status` (enum: ringing, in-progress, canceled, completed, failed, busy, no-answer), `to` (string), `to_formatted` (string), `uri` (string)

## Fetch recordings for a call

Returns recordings for a call identified by call_sid.

`GET /texml/Accounts/{account_sid}/Calls/{call_sid}/Recordings.json`

```python
response = client.texml.accounts.calls.recordings_json.retrieve_recordings_json(
    call_sid="call_sid",
    account_sid="account_sid",
)
print(response.end)
```

Returns: `end` (integer), `first_page_uri` (uri), `next_page_uri` (string), `page` (integer), `page_size` (integer), `previous_page_uri` (uri), `recordings` (array[object]), `start` (integer), `uri` (string)

## Request recording for a call

Starts recording with specified parameters for call identified by call_sid.

`POST /texml/Accounts/{account_sid}/Calls/{call_sid}/Recordings.json`

```python
response = client.texml.accounts.calls.recordings_json.recordings_json(
    call_sid="call_sid",
    account_sid="account_sid",
)
print(response.account_sid)
```

Returns: `account_sid` (string), `call_sid` (string), `channels` (enum: 1, 2), `conference_sid` (uuid), `date_created` (date-time), `date_updated` (date-time), `duration` (string | null), `error_code` (string | null), `price` (string | null), `price_unit` (string | null), `sid` (string), `source` (enum: StartCallRecordingAPI, StartConferenceRecordingAPI, OutboundAPI, DialVerb, Conference, RecordVerb, Trunking), `start_time` (date-time), `track` (enum: inbound, outbound, both), `uri` (string)

## Update recording on a call

Updates recording resource for particular call.

`POST /texml/Accounts/{account_sid}/Calls/{call_sid}/Recordings/{recording_sid}.json`

```python
response = client.texml.accounts.calls.recordings.recording_sid_json(
    recording_sid="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
    account_sid="account_sid",
    call_sid="call_sid",
)
print(response.account_sid)
```

Returns: `account_sid` (string), `call_sid` (string), `channels` (enum: 1, 2), `conference_sid` (uuid), `date_created` (date-time), `date_updated` (date-time), `duration` (string | null), `error_code` (string | null), `price` (string | null), `price_unit` (string | null), `sid` (string), `source` (enum: StartCallRecordingAPI, StartConferenceRecordingAPI, OutboundAPI, DialVerb, Conference, RecordVerb, Trunking), `start_time` (date-time), `track` (enum: inbound, outbound, both), `uri` (string)

## Request siprec session for a call

Starts siprec session with specified parameters for call identified by call_sid.

`POST /texml/Accounts/{account_sid}/Calls/{call_sid}/Siprec.json`

```python
response = client.texml.accounts.calls.siprec_json(
    call_sid="call_sid",
    account_sid="account_sid",
)
print(response.account_sid)
```

Returns: `account_sid` (string), `call_sid` (string), `date_created` (string), `date_updated` (string), `error_code` (string), `sid` (string), `start_time` (string), `status` (enum: in-progress, stopped), `track` (enum: both_tracks, inbound_track, outbound_track), `uri` (string)

## Updates siprec session for a call

Updates siprec session identified by siprec_sid.

`POST /texml/Accounts/{account_sid}/Calls/{call_sid}/Siprec/{siprec_sid}.json`

```python
response = client.texml.accounts.calls.siprec.siprec_sid_json(
    siprec_sid="siprec_sid",
    account_sid="account_sid",
    call_sid="call_sid",
)
print(response.account_sid)
```

Returns: `account_sid` (string), `call_sid` (string), `date_updated` (string), `error_code` (string), `sid` (string), `status` (enum: in-progress, stopped), `uri` (string)

## Start streaming media from a call.

Starts streaming media from a call to a specific WebSocket address.

`POST /texml/Accounts/{account_sid}/Calls/{call_sid}/Streams.json`

```python
response = client.texml.accounts.calls.streams_json(
    call_sid="call_sid",
    account_sid="account_sid",
)
print(response.account_sid)
```

Returns: `account_sid` (string), `call_sid` (string), `date_updated` (date-time), `name` (string), `sid` (string), `status` (enum: in-progress), `uri` (string)

## Update streaming on a call

Updates streaming resource for particular call.

`POST /texml/Accounts/{account_sid}/Calls/{call_sid}/Streams/{streaming_sid}.json`

```python
response = client.texml.accounts.calls.streams.streaming_sid_json(
    streaming_sid="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
    account_sid="account_sid",
    call_sid="call_sid",
)
print(response.account_sid)
```

Returns: `account_sid` (string), `call_sid` (string), `date_updated` (date-time), `sid` (string), `status` (enum: stopped), `uri` (string)

## List conference resources

Lists conference resources.

`GET /texml/Accounts/{account_sid}/Conferences`

```python
response = client.texml.accounts.conferences.retrieve_conferences(
    account_sid="account_sid",
)
print(response.conferences)
```

Returns: `conferences` (array[object]), `end` (integer), `first_page_uri` (string), `next_page_uri` (string), `page` (integer), `page_size` (integer), `start` (integer), `uri` (string)

## Fetch a conference resource

Returns a conference resource.

`GET /texml/Accounts/{account_sid}/Conferences/{conference_sid}`

```python
conference = client.texml.accounts.conferences.retrieve(
    conference_sid="conference_sid",
    account_sid="account_sid",
)
print(conference.account_sid)
```

Returns: `account_sid` (string), `api_version` (string), `call_sid_ending_conference` (string), `date_created` (string), `date_updated` (string), `friendly_name` (string), `reason_conference_ended` (enum: participant-with-end-conference-on-exit-left, last-participant-left, conference-ended-via-api, time-exceeded), `region` (string), `sid` (string), `status` (enum: init, in-progress, completed), `subresource_uris` (object), `uri` (string)

## Update a conference resource

Updates a conference resource.

`POST /texml/Accounts/{account_sid}/Conferences/{conference_sid}`

```python
conference = client.texml.accounts.conferences.update(
    conference_sid="conference_sid",
    account_sid="account_sid",
)
print(conference.account_sid)
```

Returns: `account_sid` (string), `api_version` (string), `call_sid_ending_conference` (string), `date_created` (string), `date_updated` (string), `friendly_name` (string), `reason_conference_ended` (enum: participant-with-end-conference-on-exit-left, last-participant-left, conference-ended-via-api, time-exceeded), `region` (string), `sid` (string), `status` (enum: init, in-progress, completed), `subresource_uris` (object), `uri` (string)

## List conference participants

Lists conference participants

`GET /texml/Accounts/{account_sid}/Conferences/{conference_sid}/Participants`

```python
response = client.texml.accounts.conferences.participants.retrieve_participants(
    conference_sid="conference_sid",
    account_sid="account_sid",
)
print(response.end)
```

Returns: `end` (integer), `first_page_uri` (string), `next_page_uri` (string), `page` (integer), `page_size` (integer), `participants` (array[object]), `start` (integer), `uri` (string)

## Dial a new conference participant

Dials a new conference participant

`POST /texml/Accounts/{account_sid}/Conferences/{conference_sid}/Participants`

```python
response = client.texml.accounts.conferences.participants.participants(
    conference_sid="conference_sid",
    account_sid="account_sid",
)
print(response.account_sid)
```

Returns: `account_sid` (string), `call_sid` (string), `coaching` (boolean), `coaching_call_sid` (string), `conference_sid` (uuid), `end_conference_on_exit` (boolean), `hold` (boolean), `muted` (boolean), `status` (enum: connecting, connected, completed), `uri` (string)

## Get conference participant resource

Gets conference participant resource

`GET /texml/Accounts/{account_sid}/Conferences/{conference_sid}/Participants/{call_sid_or_participant_label}`

```python
participant = client.texml.accounts.conferences.participants.retrieve(
    call_sid_or_participant_label="call_sid_or_participant_label",
    account_sid="account_sid",
    conference_sid="conference_sid",
)
print(participant.account_sid)
```

Returns: `account_sid` (string), `api_version` (string), `call_sid` (string), `call_sid_legacy` (string), `coaching` (boolean), `coaching_call_sid` (string), `coaching_call_sid_legacy` (string), `conference_sid` (uuid), `date_created` (string), `date_updated` (string), `end_conference_on_exit` (boolean), `hold` (boolean), `muted` (boolean), `status` (enum: connecting, connected, completed), `uri` (string)

## Update a conference participant

Updates a conference participant

`POST /texml/Accounts/{account_sid}/Conferences/{conference_sid}/Participants/{call_sid_or_participant_label}`

```python
participant = client.texml.accounts.conferences.participants.update(
    call_sid_or_participant_label="call_sid_or_participant_label",
    account_sid="account_sid",
    conference_sid="conference_sid",
)
print(participant.account_sid)
```

Returns: `account_sid` (string), `api_version` (string), `call_sid` (string), `call_sid_legacy` (string), `coaching` (boolean), `coaching_call_sid` (string), `coaching_call_sid_legacy` (string), `conference_sid` (uuid), `date_created` (string), `date_updated` (string), `end_conference_on_exit` (boolean), `hold` (boolean), `muted` (boolean), `status` (enum: connecting, connected, completed), `uri` (string)

## Delete a conference participant

Deletes a conference participant

`DELETE /texml/Accounts/{account_sid}/Conferences/{conference_sid}/Participants/{call_sid_or_participant_label}`

```python
client.texml.accounts.conferences.participants.delete(
    call_sid_or_participant_label="call_sid_or_participant_label",
    account_sid="account_sid",
    conference_sid="conference_sid",
)
```

## List conference recordings

Lists conference recordings

`GET /texml/Accounts/{account_sid}/Conferences/{conference_sid}/Recordings`

```python
response = client.texml.accounts.conferences.retrieve_recordings(
    conference_sid="conference_sid",
    account_sid="account_sid",
)
print(response.end)
```

Returns: `end` (integer), `first_page_uri` (string), `next_page_uri` (string), `page` (integer), `page_size` (integer), `participants` (array[object]), `recordings` (array[object]), `start` (integer), `uri` (string)

## Fetch recordings for a conference

Returns recordings for a conference identified by conference_sid.

`GET /texml/Accounts/{account_sid}/Conferences/{conference_sid}/Recordings.json`

```python
response = client.texml.accounts.conferences.retrieve_recordings_json(
    conference_sid="conference_sid",
    account_sid="account_sid",
)
print(response.end)
```

Returns: `end` (integer), `first_page_uri` (uri), `next_page_uri` (string), `page` (integer), `page_size` (integer), `previous_page_uri` (uri), `recordings` (array[object]), `start` (integer), `uri` (string)

## List queue resources

Lists queue resources.

`GET /texml/Accounts/{account_sid}/Queues`

```python
page = client.texml.accounts.queues.list(
    account_sid="account_sid",
)
page = page.queues[0]
print(page.account_sid)
```

Returns: `end` (integer), `first_page_uri` (string), `next_page_uri` (string), `page` (integer), `page_size` (integer), `queues` (array[object]), `start` (integer), `uri` (string)

## Create a new queue

Creates a new queue resource.

`POST /texml/Accounts/{account_sid}/Queues`

```python
queue = client.texml.accounts.queues.create(
    account_sid="account_sid",
)
print(queue.account_sid)
```

Returns: `account_sid` (string), `average_wait_time` (integer), `current_size` (integer), `date_created` (string), `date_updated` (string), `max_size` (integer), `sid` (string), `subresource_uris` (object), `uri` (string)

## Fetch a queue resource

Returns a queue resource.

`GET /texml/Accounts/{account_sid}/Queues/{queue_sid}`

```python
queue = client.texml.accounts.queues.retrieve(
    queue_sid="queue_sid",
    account_sid="account_sid",
)
print(queue.account_sid)
```

Returns: `account_sid` (string), `average_wait_time` (integer), `current_size` (integer), `date_created` (string), `date_updated` (string), `max_size` (integer), `sid` (string), `subresource_uris` (object), `uri` (string)

## Update a queue resource

Updates a queue resource.

`POST /texml/Accounts/{account_sid}/Queues/{queue_sid}`

```python
queue = client.texml.accounts.queues.update(
    queue_sid="queue_sid",
    account_sid="account_sid",
)
print(queue.account_sid)
```

Returns: `account_sid` (string), `average_wait_time` (integer), `current_size` (integer), `date_created` (string), `date_updated` (string), `max_size` (integer), `sid` (string), `subresource_uris` (object), `uri` (string)

## Delete a queue resource

Delete a queue resource.

`DELETE /texml/Accounts/{account_sid}/Queues/{queue_sid}`

```python
client.texml.accounts.queues.delete(
    queue_sid="queue_sid",
    account_sid="account_sid",
)
```

## Fetch multiple recording resources

Returns multiple recording resources for an account.

`GET /texml/Accounts/{account_sid}/Recordings.json`

```python
response = client.texml.accounts.retrieve_recordings_json(
    account_sid="account_sid",
)
print(response.end)
```

Returns: `end` (integer), `first_page_uri` (uri), `next_page_uri` (string), `page` (integer), `page_size` (integer), `previous_page_uri` (uri), `recordings` (array[object]), `start` (integer), `uri` (string)

## Fetch recording resource

Returns recording resource identified by recording id.

`GET /texml/Accounts/{account_sid}/Recordings/{recording_sid}.json`

```python
texml_get_call_recording_response_body = client.texml.accounts.recordings.json.retrieve_recording_sid_json(
    recording_sid="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
    account_sid="account_sid",
)
print(texml_get_call_recording_response_body.account_sid)
```

Returns: `account_sid` (string), `call_sid` (string), `channels` (enum: 1, 2), `conference_sid` (uuid), `date_created` (date-time), `date_updated` (date-time), `duration` (string | null), `error_code` (string | null), `media_url` (uri), `sid` (string), `source` (enum: StartCallRecordingAPI, StartConferenceRecordingAPI, OutboundAPI, DialVerb, Conference, RecordVerb, Trunking), `start_time` (date-time), `status` (enum: in-progress, completed, paused, stopped), `subresources_uris` (object), `uri` (string)

## Delete recording resource

Deletes recording resource identified by recording id.

`DELETE /texml/Accounts/{account_sid}/Recordings/{recording_sid}.json`

```python
client.texml.accounts.recordings.json.delete_recording_sid_json(
    recording_sid="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
    account_sid="account_sid",
)
```

## List recording transcriptions

Returns multiple recording transcription resources for an account.

`GET /texml/Accounts/{account_sid}/Transcriptions.json`

```python
response = client.texml.accounts.retrieve_transcriptions_json(
    account_sid="account_sid",
)
print(response.end)
```

Returns: `end` (integer), `first_page_uri` (uri), `next_page_uri` (string), `page` (integer), `page_size` (integer), `previous_page_uri` (uri), `start` (integer), `transcriptions` (array[object]), `uri` (string)

## Fetch a recording transcription resource

Returns the recording transcription resource identified by its ID.

`GET /texml/Accounts/{account_sid}/Transcriptions/{recording_transcription_sid}.json`

```python
response = client.texml.accounts.transcriptions.json.retrieve_recording_transcription_sid_json(
    recording_transcription_sid="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
    account_sid="account_sid",
)
print(response.account_sid)
```

Returns: `account_sid` (string), `api_version` (string), `call_sid` (string), `date_created` (date-time), `date_updated` (date-time), `duration` (string | null), `recording_sid` (string), `sid` (string), `status` (enum: in-progress, completed), `transcription_text` (string), `uri` (string)

## Delete a recording transcription

Permanently deletes a recording transcription.

`DELETE /texml/Accounts/{account_sid}/Transcriptions/{recording_transcription_sid}.json`

```python
client.texml.accounts.transcriptions.json.delete_recording_transcription_sid_json(
    recording_transcription_sid="6a09cdc3-8948-47f0-aa62-74ac943d6c58",
    account_sid="account_sid",
)
```

## Create a TeXML secret

Create a TeXML secret which can be later used as a Dynamic Parameter for TeXML when using Mustache Templates in your TeXML. In your TeXML you will be able to use your secret name, and this name will be replaced by the actual secret value when processing the TeXML on Telnyx side. The secrets are not visible in any logs.

`POST /texml/secrets` — Required: `name`, `value`

```python
response = client.texml.secrets(
    name="My Secret Name",
    value="My Secret Value",
)
print(response.data)
```

Returns: `name` (string), `value` (enum: REDACTED)

## List all TeXML Applications

Returns a list of your TeXML Applications.

`GET /texml_applications`

```python
page = client.texml_applications.list()
page = page.data[0]
print(page.id)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `friendly_name` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `status_callback` (uri), `status_callback_method` (enum: get, post), `tags` (array[string]), `updated_at` (string), `voice_fallback_url` (uri), `voice_method` (enum: get, post), `voice_url` (uri)

## Creates a TeXML Application

Creates a TeXML Application.

`POST /texml_applications` — Required: `friendly_name`, `voice_url`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `call_cost_in_webhooks` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `inbound` (object), `outbound` (object), `status_callback` (uri), `status_callback_method` (enum: get, post), `tags` (array[string]), `voice_fallback_url` (uri), `voice_method` (enum: get, post)

```python
texml_application = client.texml_applications.create(
    friendly_name="call-router",
    voice_url="https://example.com",
)
print(texml_application.data)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `friendly_name` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `status_callback` (uri), `status_callback_method` (enum: get, post), `tags` (array[string]), `updated_at` (string), `voice_fallback_url` (uri), `voice_method` (enum: get, post), `voice_url` (uri)

## Retrieve a TeXML Application

Retrieves the details of an existing TeXML Application.

`GET /texml_applications/{id}`

```python
texml_application = client.texml_applications.retrieve(
    "1293384261075731499",
)
print(texml_application.data)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `friendly_name` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `status_callback` (uri), `status_callback_method` (enum: get, post), `tags` (array[string]), `updated_at` (string), `voice_fallback_url` (uri), `voice_method` (enum: get, post), `voice_url` (uri)

## Update a TeXML Application

Updates settings of an existing TeXML Application.

`PATCH /texml_applications/{id}` — Required: `friendly_name`, `voice_url`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `call_cost_in_webhooks` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `inbound` (object), `outbound` (object), `status_callback` (uri), `status_callback_method` (enum: get, post), `tags` (array[string]), `voice_fallback_url` (uri), `voice_method` (enum: get, post)

```python
texml_application = client.texml_applications.update(
    id="1293384261075731499",
    friendly_name="call-router",
    voice_url="https://example.com",
)
print(texml_application.data)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `friendly_name` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `status_callback` (uri), `status_callback_method` (enum: get, post), `tags` (array[string]), `updated_at` (string), `voice_fallback_url` (uri), `voice_method` (enum: get, post), `voice_url` (uri)

## Deletes a TeXML Application

Deletes a TeXML Application.

`DELETE /texml_applications/{id}`

```python
texml_application = client.texml_applications.delete(
    "1293384261075731499",
)
print(texml_application.data)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, Sydney, Australia, Amsterdam, Netherlands, London, UK, Toronto, Canada, Vancouver, Canada, Frankfurt, Germany), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `friendly_name` (string), `id` (string), `inbound` (object), `outbound` (object), `record_type` (string), `status_callback` (uri), `status_callback_method` (enum: get, post), `tags` (array[string]), `updated_at` (string), `voice_fallback_url` (uri), `voice_method` (enum: get, post), `voice_url` (uri)
