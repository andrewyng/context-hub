---
name: voice-conferencing
description: "Create and manage conference calls, queues, and multi-party sessions. Use when building call centers or conferencing applications."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,voice,conference,call-center,queue"
---

# Telnyx Voice Conferencing REST API Coding Guidelines

You are a Telnyx Voice Conferencing API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

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

## Enqueue call

Put the call in a queue.

`POST /calls/{call_control_id}/actions/enqueue` — Required: `queue_name`

Optional: `client_state` (string), `command_id` (string), `keep_after_hangup` (boolean), `max_size` (integer), `max_wait_time_secs` (integer)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "queue_name": "tier_1_support",
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "max_wait_time_secs": 600,
  "max_size": 200,
  "keep_after_hangup": true
}' \
  "https://api.telnyx.com/v2/calls/{call_control_id}/actions/enqueue"
```

Returns: `result` (string)

## Remove call from a queue

Removes the call from a queue.

`POST /calls/{call_control_id}/actions/leave_queue`

Optional: `client_state` (string), `command_id` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901"
}' \
  "https://api.telnyx.com/v2/calls/{call_control_id}/actions/leave_queue"
```

Returns: `result` (string)

## List conferences

Lists conferences. Conferences are created on demand, and will expire after all participants have left the conference or after 4 hours regardless of the number of active participants. Conferences are listed in descending order by `expires_at`.

`GET /conferences`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/conferences"
```

Returns: `connection_id` (string), `created_at` (string), `end_reason` (enum: all_left, ended_via_api, host_left, time_exceeded), `ended_by` (object), `expires_at` (string), `id` (string), `name` (string), `record_type` (enum: conference), `region` (string), `status` (enum: init, in_progress, completed), `updated_at` (string)

## Create conference

Create a conference from an existing call leg using a `call_control_id` and a conference name. Upon creating the conference, the call will be automatically bridged to the conference. Conferences will expire after all participants have left the conference or after 4 hours regardless of the number of active participants.

`POST /conferences` — Required: `call_control_id`, `name`

Optional: `beep_enabled` (enum: always, never, on_enter, on_exit), `client_state` (string), `comfort_noise` (boolean), `command_id` (string), `duration_minutes` (integer), `hold_audio_url` (string), `hold_media_name` (string), `max_participants` (integer), `region` (enum: Australia, Europe, Middle East, US), `start_conference_on_create` (boolean)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "call_control_id": "v2:T02llQxIyaRkhfRKxgAP8nY511EhFLizdvdUKJiSw8d6A9BborherQczRrZvZakpWxBlpw48KyZQ==",
  "name": "Business",
  "beep_enabled": "on_exit",
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "comfort_noise": false,
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "duration_minutes": 5,
  "hold_audio_url": "http://example.com/message.wav",
  "hold_media_name": "my_media_uploaded_to_media_storage_api",
  "max_participants": 3,
  "start_conference_on_create": false,
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences"
```

Returns: `connection_id` (string), `created_at` (string), `end_reason` (enum: all_left, ended_via_api, host_left, time_exceeded), `ended_by` (object), `expires_at` (string), `id` (string), `name` (string), `record_type` (enum: conference), `region` (string), `status` (enum: init, in_progress, completed), `updated_at` (string)

## List conference participants

Lists conference participants

`GET /conferences/{conference_id}/participants`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/conferences/{conference_id}/participants"
```

Returns: `call_control_id` (string), `call_leg_id` (string), `conference` (object), `created_at` (string), `end_conference_on_exit` (boolean), `id` (string), `muted` (boolean), `on_hold` (boolean), `record_type` (enum: participant), `soft_end_conference_on_exit` (boolean), `status` (enum: joining, joined, left), `updated_at` (string), `whisper_call_control_ids` (array[string])

## Retrieve a conference

Retrieve an existing conference

`GET /conferences/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/conferences/{id}"
```

Returns: `connection_id` (string), `created_at` (string), `end_reason` (enum: all_left, ended_via_api, host_left, time_exceeded), `ended_by` (object), `expires_at` (string), `id` (string), `name` (string), `record_type` (enum: conference), `region` (string), `status` (enum: init, in_progress, completed), `updated_at` (string)

## End a conference

End a conference and terminate all active participants.

`POST /conferences/{id}/actions/end`

Optional: `command_id` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/end"
```

Returns: `result` (string)

## Gather DTMF using audio prompt in a conference

Play an audio file to a specific conference participant and gather DTMF input.

`POST /conferences/{id}/actions/gather_using_audio` — Required: `call_control_id`

Optional: `audio_url` (string), `client_state` (string), `gather_id` (string), `initial_timeout_millis` (integer), `inter_digit_timeout_millis` (integer), `invalid_audio_url` (string), `invalid_media_name` (string), `maximum_digits` (integer), `maximum_tries` (integer), `media_name` (string), `minimum_digits` (integer), `stop_playback_on_dtmf` (boolean), `terminating_digit` (string), `timeout_millis` (integer), `valid_digits` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "call_control_id": "v3:MdI91X4lWFEs7IgbBEOT9M4AigoY08M0WWZFISt1Yw2axZ_IiE4pqg",
  "audio_url": "http://example.com/gather_prompt.wav",
  "minimum_digits": 1,
  "maximum_digits": 10,
  "maximum_tries": 3,
  "timeout_millis": 30000,
  "terminating_digit": "#",
  "valid_digits": "0123456789",
  "inter_digit_timeout_millis": 3000,
  "initial_timeout_millis": 10000,
  "stop_playback_on_dtmf": true,
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/gather_using_audio"
```

Returns: `result` (string)

## Hold conference participants

Hold a list of participants in a conference call

`POST /conferences/{id}/actions/hold`

Optional: `audio_url` (string), `call_control_ids` (array[string]), `media_name` (string), `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "audio_url": "http://example.com/message.wav",
  "media_name": "my_media_uploaded_to_media_storage_api",
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/hold"
```

Returns: `result` (string)

## Join a conference

Join an existing call leg to a conference. Issue the Join Conference command with the conference ID in the path and the `call_control_id` of the leg you wish to join to the conference as an attribute. The conference can have up to a certain amount of active participants, as set by the `max_participants` parameter in conference creation request.

`POST /conferences/{id}/actions/join` — Required: `call_control_id`

Optional: `beep_enabled` (enum: always, never, on_enter, on_exit), `client_state` (string), `command_id` (string), `end_conference_on_exit` (boolean), `hold` (boolean), `hold_audio_url` (string), `hold_media_name` (string), `mute` (boolean), `region` (enum: Australia, Europe, Middle East, US), `soft_end_conference_on_exit` (boolean), `start_conference_on_enter` (boolean), `supervisor_role` (enum: barge, monitor, none, whisper), `whisper_call_control_ids` (array[string])

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "call_control_id": "v2:T02llQxIyaRkhfRKxgAP8nY511EhFLizdvdUKJiSw8d6A9BborherQczRrZvZakpWxBlpw48KyZQ==",
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "end_conference_on_exit": true,
  "soft_end_conference_on_exit": true,
  "hold": true,
  "hold_audio_url": "http://example.com/message.wav",
  "hold_media_name": "my_media_uploaded_to_media_storage_api",
  "mute": true,
  "start_conference_on_enter": true,
  "supervisor_role": "whisper",
  "whisper_call_control_ids": [
    "v2:Sg1xxxQ_U3ixxxyXT_VDNI3xxxazZdg6Vxxxs4-GNYxxxVaJPOhFMRQ",
    "v2:qqpb0mmvd-ovhhBr0BUQQn0fld5jIboaaX3-De0DkqXHzbf8d75xkw"
  ],
  "beep_enabled": "on_exit",
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/join"
```

Returns: `result` (string)

## Leave a conference

Removes a call leg from a conference and moves it back to parked state. **Expected Webhooks:**

- `conference.participant.left`

`POST /conferences/{id}/actions/leave` — Required: `call_control_id`

Optional: `beep_enabled` (enum: always, never, on_enter, on_exit), `command_id` (string), `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "call_control_id": "f91269aa-61d1-417f-97b3-10e020e8bc47",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "beep_enabled": "on_exit",
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/leave"
```

Returns: `result` (string)

## Mute conference participants

Mute a list of participants in a conference call

`POST /conferences/{id}/actions/mute`

Optional: `call_control_ids` (array[string]), `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/mute"
```

Returns: `result` (string)

## Play audio to conference participants

Play audio to all or some participants on a conference call.

`POST /conferences/{id}/actions/play`

Optional: `audio_url` (string), `call_control_ids` (array[string]), `loop` (object), `media_name` (string), `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "audio_url": "http://example.com/message.wav",
  "media_name": "my_media_uploaded_to_media_storage_api",
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/play"
```

Returns: `result` (string)

## Conference recording pause

Pause conference recording.

`POST /conferences/{id}/actions/record_pause`

Optional: `command_id` (string), `recording_id` (string), `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "recording_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/record_pause"
```

Returns: `result` (string)

## Conference recording resume

Resume conference recording.

`POST /conferences/{id}/actions/record_resume`

Optional: `command_id` (string), `recording_id` (string), `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "recording_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/record_resume"
```

Returns: `result` (string)

## Conference recording start

Start recording the conference. Recording will stop on conference end, or via the Stop Recording command. **Expected Webhooks:**

- `conference.recording.saved`

`POST /conferences/{id}/actions/record_start` — Required: `format`

Optional: `channels` (enum: single, dual), `command_id` (string), `custom_file_name` (string), `play_beep` (boolean), `region` (enum: Australia, Europe, Middle East, US), `trim` (enum: trim-silence)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "format": "mp3",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "channels": "dual",
  "play_beep": true,
  "trim": "trim-silence",
  "custom_file_name": "my_recording_file_name",
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/record_start"
```

Returns: `result` (string)

## Conference recording stop

Stop recording the conference. **Expected Webhooks:**

- `conference.recording.saved`

`POST /conferences/{id}/actions/record_stop`

Optional: `client_state` (string), `command_id` (string), `recording_id` (uuid), `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "recording_id": "6e00ab49-9487-4364-8ad6-23965965afb2",
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/record_stop"
```

Returns: `result` (string)

## Send DTMF to conference participants

Send DTMF tones to one or more conference participants.

`POST /conferences/{id}/actions/send_dtmf` — Required: `digits`

Optional: `call_control_ids` (array[string]), `client_state` (string), `duration_millis` (integer)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "digits": "1234#",
  "call_control_ids": [
    "v3:MdI91X4lWFEs7IgbBEOT9M4AigoY08M0WWZFISt1Yw2axZ_IiE4pqg"
  ],
  "duration_millis": 250,
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/send_dtmf"
```

Returns: `result` (string)

## Speak text to conference participants

Convert text to speech and play it to all or some participants.

`POST /conferences/{id}/actions/speak` — Required: `payload`, `voice`

Optional: `call_control_ids` (array[string]), `command_id` (string), `language` (enum: arb, cmn-CN, cy-GB, da-DK, de-DE, en-AU, en-GB, en-GB-WLS, en-IN, en-US, es-ES, es-MX, es-US, fr-CA, fr-FR, hi-IN, is-IS, it-IT, ja-JP, ko-KR, nb-NO, nl-NL, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, sv-SE, tr-TR), `payload_type` (enum: text, ssml), `region` (enum: Australia, Europe, Middle East, US), `voice_settings` (object)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "payload": "Say this to participants",
  "payload_type": "ssml",
  "voice": "Telnyx.KokoroTTS.af",
  "language": "en-US",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/speak"
```

Returns: `result` (string)

## Stop audio being played on the conference

Stop audio being played to all or some participants on a conference call.

`POST /conferences/{id}/actions/stop`

Optional: `call_control_ids` (array[string]), `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/stop"
```

Returns: `result` (string)

## Unhold conference participants

Unhold a list of participants in a conference call

`POST /conferences/{id}/actions/unhold` — Required: `call_control_ids`

Optional: `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "call_control_ids": [
    "string"
  ],
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/unhold"
```

Returns: `result` (string)

## Unmute conference participants

Unmute a list of participants in a conference call

`POST /conferences/{id}/actions/unmute`

Optional: `call_control_ids` (array[string]), `region` (enum: Australia, Europe, Middle East, US)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/unmute"
```

Returns: `result` (string)

## Update conference participant

Update conference participant supervisor_role

`POST /conferences/{id}/actions/update` — Required: `call_control_id`, `supervisor_role`

Optional: `command_id` (string), `region` (enum: Australia, Europe, Middle East, US), `whisper_call_control_ids` (array[string])

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "call_control_id": "v2:T02llQxIyaRkhfRKxgAP8nY511EhFLizdvdUKJiSw8d6A9BborherQczRrZvZakpWxBlpw48KyZQ==",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "supervisor_role": "whisper",
  "whisper_call_control_ids": [
    "v2:Sg1xxxQ_U3ixxxyXT_VDNI3xxxazZdg6Vxxxs4-GNYxxxVaJPOhFMRQ",
    "v2:qqpb0mmvd-ovhhBr0BUQQn0fld5jIboaaX3-De0DkqXHzbf8d75xkw"
  ],
  "region": "US"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/actions/update"
```

Returns: `result` (string)

## Retrieve a conference participant

Retrieve details of a specific conference participant by their ID or label.

`GET /conferences/{id}/participants/{participant_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/conferences/{id}/participants/{participant_id}"
```

Returns: `call_control_id` (string), `call_leg_id` (string), `conference_id` (string), `created_at` (date-time), `end_conference_on_exit` (boolean), `id` (string), `label` (string), `muted` (boolean), `on_hold` (boolean), `soft_end_conference_on_exit` (boolean), `status` (enum: joining, joined, left), `updated_at` (date-time), `whisper_call_control_ids` (array[string])

## Update a conference participant

Update properties of a conference participant.

`PATCH /conferences/{id}/participants/{participant_id}`

Optional: `beep_enabled` (enum: always, never, on_enter, on_exit), `end_conference_on_exit` (boolean), `soft_end_conference_on_exit` (boolean)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "end_conference_on_exit": false,
  "soft_end_conference_on_exit": false,
  "beep_enabled": "always"
}' \
  "https://api.telnyx.com/v2/conferences/{id}/participants/{participant_id}"
```

Returns: `call_control_id` (string), `call_leg_id` (string), `conference_id` (string), `created_at` (date-time), `end_conference_on_exit` (boolean), `id` (string), `label` (string), `muted` (boolean), `on_hold` (boolean), `soft_end_conference_on_exit` (boolean), `status` (enum: joining, joined, left), `updated_at` (date-time), `whisper_call_control_ids` (array[string])

## List queues

List all queues for the authenticated user.

`GET /queues`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/queues"
```

Returns: `average_wait_time_secs` (integer), `created_at` (string), `current_size` (integer), `id` (string), `max_size` (integer), `name` (string), `record_type` (enum: queue), `updated_at` (string)

## Create a queue

Create a new call queue.

`POST /queues` — Required: `queue_name`

Optional: `max_size` (integer)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "queue_name": "tier_1_support",
  "max_size": 100
}' \
  "https://api.telnyx.com/v2/queues"
```

Returns: `average_wait_time_secs` (integer), `created_at` (string), `current_size` (integer), `id` (string), `max_size` (integer), `name` (string), `record_type` (enum: queue), `updated_at` (string)

## Retrieve a call queue

Retrieve an existing call queue

`GET /queues/{queue_name}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/queues/{queue_name}"
```

Returns: `average_wait_time_secs` (integer), `created_at` (string), `current_size` (integer), `id` (string), `max_size` (integer), `name` (string), `record_type` (enum: queue), `updated_at` (string)

## Update a queue

Update properties of an existing call queue.

`POST /queues/{queue_name}` — Required: `max_size`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "max_size": 200
}' \
  "https://api.telnyx.com/v2/queues/{queue_name}"
```

Returns: `average_wait_time_secs` (integer), `created_at` (string), `current_size` (integer), `id` (string), `max_size` (integer), `name` (string), `record_type` (enum: queue), `updated_at` (string)

## Delete a queue

Delete an existing call queue.

`DELETE /queues/{queue_name}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/queues/{queue_name}"
```

## Retrieve calls from a queue

Retrieve the list of calls in an existing queue

`GET /queues/{queue_name}/calls`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/queues/{queue_name}/calls"
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `connection_id` (string), `enqueued_at` (string), `from` (string), `is_alive` (boolean), `queue_id` (string), `queue_position` (integer), `record_type` (enum: queue_call), `to` (string), `wait_time_secs` (integer)

## Retrieve a call from a queue

Retrieve an existing call from an existing queue

`GET /queues/{queue_name}/calls/{call_control_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/queues/{queue_name}/calls/{call_control_id}"
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `connection_id` (string), `enqueued_at` (string), `from` (string), `is_alive` (boolean), `queue_id` (string), `queue_position` (integer), `record_type` (enum: queue_call), `to` (string), `wait_time_secs` (integer)

## Update queued call

Update queued call's keep_after_hangup flag

`PATCH /queues/{queue_name}/calls/{call_control_id}`

Optional: `keep_after_hangup` (boolean)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "keep_after_hangup": true
}' \
  "https://api.telnyx.com/v2/queues/{queue_name}/calls/{call_control_id}"
```

## Force remove a call from a queue

Removes an inactive call from a queue. If the call is no longer active, use this command to remove it from the queue.

`DELETE /queues/{queue_name}/calls/{call_control_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/queues/{queue_name}/calls/{call_control_id}"
```

---

## Webhooks

The following webhook events are sent to your configured webhook URL.
All webhooks include `telnyx-timestamp` and `telnyx-signature-ed25519` headers for verification (Standard Webhooks compatible).

| Event | Description |
|-------|-------------|
| `callEnqueued` | Call Enqueued |
| `callLeftQueue` | Call Left Queue |
| `conferenceCreated` | Conference Created |
| `conferenceEnded` | Conference Ended |
| `conferenceFloorChanged` | Conference Floor Changed |
| `conferenceParticipantJoined` | Conference Participant Joined |
| `conferenceParticipantLeft` | Conference Participant Left |
| `conferenceParticipantPlaybackEnded` | Conference Participant Playback Ended |
| `conferenceParticipantPlaybackStarted` | Conference Participant Playback Started |
| `conferenceParticipantSpeakEnded` | Conference Participant Speak Ended |
| `conferenceParticipantSpeakStarted` | Conference Participant Speak Started |
| `conferencePlaybackEnded` | Conference Playback Ended |
| `conferencePlaybackStarted` | Conference Playback Started |
| `conferenceRecordingSaved` | Conference Recording Saved |
| `conferenceSpeakEnded` | Conference Speak Ended |
| `conferenceSpeakStarted` | Conference Speak Started |

### Webhook payload fields

**`callEnqueued`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: call.enqueued | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.queue` | string | The name of the queue |
| `data.payload.current_position` | integer | Current position of the call in the queue. |
| `data.payload.queue_avg_wait_time_secs` | integer | Average time call spends in the queue in seconds. |

**`callLeftQueue`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: call.dequeued | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.queue` | string | The name of the queue |
| `data.payload.queue_position` | integer | Last position of the call in the queue. |
| `data.payload.reason` | enum: bridged, bridging-in-process, hangup, leave, timeout | The reason for leaving the queue |
| `data.payload.wait_time_secs` | integer | Time call spent in the queue in seconds. |

**`conferenceCreated`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.created | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.conference_id` | string | Conference ID that the participant joined. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |

**`conferenceEnded`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.ended | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.conference_id` | string | Conference ID that the participant joined. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.reason` | enum: all_left, host_left, time_exceeded | Reason the conference ended. |

**`conferenceFloorChanged`**

| Field | Type | Description |
|-------|------|-------------|
| `record_type` | enum: event | Identifies the type of the resource. |
| `event_type` | enum: conference.floor.changed | The type of event being delivered. |
| `id` | uuid | Identifies the type of resource. |
| `payload.call_control_id` | string | Call Control ID of the new speaker. |
| `payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `payload.call_leg_id` | string | Call Leg ID of the new speaker. |
| `payload.call_session_id` | string | Call Session ID of the new speaker. |
| `payload.client_state` | string | State received from a command. |
| `payload.conference_id` | string | Conference ID that had a speaker change event. |
| `payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |

**`conferenceParticipantJoined`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.participant.joined | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.conference_id` | string | Conference ID that the participant joined. |

**`conferenceParticipantLeft`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.participant.left | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.conference_id` | string | Conference ID that the participant joined. |

**`conferenceParticipantPlaybackEnded`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.participant.playback.ended | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.call_control_id` | string | Participant's call ID used to issue commands via Call Control API. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.creator_call_session_id` | string | ID that is unique to the call session that started the conference. |
| `data.payload.conference_id` | string | ID of the conference the text was spoken in. |
| `data.payload.media_url` | string | The audio URL being played back, if audio_url has been used to start. |
| `data.payload.media_name` | string | The name of the audio media file being played back, if media_name has been used to start. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |

**`conferenceParticipantPlaybackStarted`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.participant.playback.started | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.call_control_id` | string | Participant's call ID used to issue commands via Call Control API. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.creator_call_session_id` | string | ID that is unique to the call session that started the conference. |
| `data.payload.conference_id` | string | ID of the conference the text was spoken in. |
| `data.payload.media_url` | string | The audio URL being played back, if audio_url has been used to start. |
| `data.payload.media_name` | string | The name of the audio media file being played back, if media_name has been used to start. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |

**`conferenceParticipantSpeakEnded`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.participant.speak.ended | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.call_control_id` | string | Participant's call ID used to issue commands via Call Control API. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.creator_call_session_id` | string | ID that is unique to the call session that started the conference. |
| `data.payload.conference_id` | string | ID of the conference the text was spoken in. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |

**`conferenceParticipantSpeakStarted`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.participant.speak.started | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.call_control_id` | string | Participant's call ID used to issue commands via Call Control API. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.creator_call_session_id` | string | ID that is unique to the call session that started the conference. |
| `data.payload.conference_id` | string | ID of the conference the text was spoken in. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |

**`conferencePlaybackEnded`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.playback.ended | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.creator_call_session_id` | string | ID that is unique to the call session that started the conference. |
| `data.payload.conference_id` | string | ID of the conference the text was spoken in. |
| `data.payload.media_url` | string | The audio URL being played back, if audio_url has been used to start. |
| `data.payload.media_name` | string | The name of the audio media file being played back, if media_name has been used to start. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |

**`conferencePlaybackStarted`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.playback.started | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.creator_call_session_id` | string | ID that is unique to the call session that started the conference. |
| `data.payload.conference_id` | string | ID of the conference the text was spoken in. |
| `data.payload.media_url` | string | The audio URL being played back, if audio_url has been used to start. |
| `data.payload.media_name` | string | The name of the audio media file being played back, if media_name has been used to start. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |

**`conferenceRecordingSaved`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.recording.saved | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.call_control_id` | string | Participant's call ID used to issue commands via Call Control API. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.channels` | enum: single, dual | Whether recording was recorded in `single` or `dual` channel. |
| `data.payload.conference_id` | uuid | ID of the conference that is being recorded. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.format` | enum: wav, mp3 | The audio file format used when storing the call recording. |
| `data.payload.recording_ended_at` | date-time | ISO 8601 datetime of when recording ended. |
| `data.payload.recording_id` | uuid | ID of the conference recording. |
| `data.payload.recording_started_at` | date-time | ISO 8601 datetime of when recording started. |

**`conferenceSpeakEnded`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.speak.ended | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.creator_call_session_id` | string | ID that is unique to the call session that started the conference. |
| `data.payload.conference_id` | string | ID of the conference the text was spoken in. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |

**`conferenceSpeakStarted`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: conference.speak.started | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.creator_call_session_id` | string | ID that is unique to the call session that started the conference. |
| `data.payload.conference_id` | string | ID of the conference the text was spoken in. |
| `data.payload.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
