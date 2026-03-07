---
name: voice-conferencing
description: "Create and manage conference calls, queues, and multi-party sessions. Use when building call centers or conferencing applications."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,voice,conference,call-center,queue"
---

# Telnyx Voice Conferencing JavaScript SDK Coding Guidelines

You are a Telnyx Voice Conferencing API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

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

## Enqueue call

Put the call in a queue.

`POST /calls/{call_control_id}/actions/enqueue` — Required: `queue_name`

Optional: `client_state` (string), `command_id` (string), `keep_after_hangup` (boolean), `max_size` (integer), `max_wait_time_secs` (integer)

```javascript
const response = await client.calls.actions.enqueue('call_control_id', { queue_name: 'support' });

console.log(response.data);
```

Returns: `result` (string)

## Remove call from a queue

Removes the call from a queue.

`POST /calls/{call_control_id}/actions/leave_queue`

Optional: `client_state` (string), `command_id` (string)

```javascript
const response = await client.calls.actions.leaveQueue('call_control_id');

console.log(response.data);
```

Returns: `result` (string)

## List conferences

Lists conferences. Conferences are created on demand, and will expire after all participants have left the conference or after 4 hours regardless of the number of active participants. Conferences are listed in descending order by `expires_at`.

`GET /conferences`

```javascript
// Automatically fetches more pages as needed.
for await (const conference of client.conferences.list()) {
  console.log(conference.id);
}
```

Returns: `connection_id` (string), `created_at` (string), `end_reason` (enum: all_left, ended_via_api, host_left, time_exceeded), `ended_by` (object), `expires_at` (string), `id` (string), `name` (string), `record_type` (enum: conference), `region` (string), `status` (enum: init, in_progress, completed), `updated_at` (string)

## Create conference

Create a conference from an existing call leg using a `call_control_id` and a conference name. Upon creating the conference, the call will be automatically bridged to the conference. Conferences will expire after all participants have left the conference or after 4 hours regardless of the number of active participants.

`POST /conferences` — Required: `call_control_id`, `name`

Optional: `beep_enabled` (enum: always, never, on_enter, on_exit), `client_state` (string), `comfort_noise` (boolean), `command_id` (string), `duration_minutes` (integer), `hold_audio_url` (string), `hold_media_name` (string), `max_participants` (integer), `region` (enum: Australia, Europe, Middle East, US), `start_conference_on_create` (boolean)

```javascript
const conference = await client.conferences.create({
  call_control_id: 'v3:MdI91X4lWFEs7IgbBEOT9M4AigoY08M0WWZFISt1Yw2axZ_IiE4pqg',
  name: 'Business',
});

console.log(conference.data);
```

Returns: `connection_id` (string), `created_at` (string), `end_reason` (enum: all_left, ended_via_api, host_left, time_exceeded), `ended_by` (object), `expires_at` (string), `id` (string), `name` (string), `record_type` (enum: conference), `region` (string), `status` (enum: init, in_progress, completed), `updated_at` (string)

## List conference participants

Lists conference participants

`GET /conferences/{conference_id}/participants`

```javascript
// Automatically fetches more pages as needed.
for await (const conferenceListParticipantsResponse of client.conferences.listParticipants(
  'conference_id',
)) {
  console.log(conferenceListParticipantsResponse.id);
}
```

Returns: `call_control_id` (string), `call_leg_id` (string), `conference` (object), `created_at` (string), `end_conference_on_exit` (boolean), `id` (string), `muted` (boolean), `on_hold` (boolean), `record_type` (enum: participant), `soft_end_conference_on_exit` (boolean), `status` (enum: joining, joined, left), `updated_at` (string), `whisper_call_control_ids` (array[string])

## Retrieve a conference

Retrieve an existing conference

`GET /conferences/{id}`

```javascript
const conference = await client.conferences.retrieve('id');

console.log(conference.data);
```

Returns: `connection_id` (string), `created_at` (string), `end_reason` (enum: all_left, ended_via_api, host_left, time_exceeded), `ended_by` (object), `expires_at` (string), `id` (string), `name` (string), `record_type` (enum: conference), `region` (string), `status` (enum: init, in_progress, completed), `updated_at` (string)

## End a conference

End a conference and terminate all active participants.

`POST /conferences/{id}/actions/end`

Optional: `command_id` (string)

```javascript
const response = await client.conferences.actions.endConference(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(response.data);
```

Returns: `result` (string)

## Gather DTMF using audio prompt in a conference

Play an audio file to a specific conference participant and gather DTMF input.

`POST /conferences/{id}/actions/gather_using_audio` — Required: `call_control_id`

Optional: `audio_url` (string), `client_state` (string), `gather_id` (string), `initial_timeout_millis` (integer), `inter_digit_timeout_millis` (integer), `invalid_audio_url` (string), `invalid_media_name` (string), `maximum_digits` (integer), `maximum_tries` (integer), `media_name` (string), `minimum_digits` (integer), `stop_playback_on_dtmf` (boolean), `terminating_digit` (string), `timeout_millis` (integer), `valid_digits` (string)

```javascript
const response = await client.conferences.actions.gatherDtmfAudio(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { call_control_id: 'v3:MdI91X4lWFEs7IgbBEOT9M4AigoY08M0WWZFISt1Yw2axZ_IiE4pqg' },
);

console.log(response.data);
```

Returns: `result` (string)

## Hold conference participants

Hold a list of participants in a conference call

`POST /conferences/{id}/actions/hold`

Optional: `audio_url` (string), `call_control_ids` (array[string]), `media_name` (string), `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.hold('id');

console.log(response.data);
```

Returns: `result` (string)

## Join a conference

Join an existing call leg to a conference. Issue the Join Conference command with the conference ID in the path and the `call_control_id` of the leg you wish to join to the conference as an attribute. The conference can have up to a certain amount of active participants, as set by the `max_participants` parameter in conference creation request.

`POST /conferences/{id}/actions/join` — Required: `call_control_id`

Optional: `beep_enabled` (enum: always, never, on_enter, on_exit), `client_state` (string), `command_id` (string), `end_conference_on_exit` (boolean), `hold` (boolean), `hold_audio_url` (string), `hold_media_name` (string), `mute` (boolean), `region` (enum: Australia, Europe, Middle East, US), `soft_end_conference_on_exit` (boolean), `start_conference_on_enter` (boolean), `supervisor_role` (enum: barge, monitor, none, whisper), `whisper_call_control_ids` (array[string])

```javascript
const response = await client.conferences.actions.join('id', {
  call_control_id: 'v3:MdI91X4lWFEs7IgbBEOT9M4AigoY08M0WWZFISt1Yw2axZ_IiE4pqg',
});

console.log(response.data);
```

Returns: `result` (string)

## Leave a conference

Removes a call leg from a conference and moves it back to parked state. **Expected Webhooks:**

- `conference.participant.left`

`POST /conferences/{id}/actions/leave` — Required: `call_control_id`

Optional: `beep_enabled` (enum: always, never, on_enter, on_exit), `command_id` (string), `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.leave('id', {
  call_control_id: 'c46e06d7-b78f-4b13-96b6-c576af9640ff',
});

console.log(response.data);
```

Returns: `result` (string)

## Mute conference participants

Mute a list of participants in a conference call

`POST /conferences/{id}/actions/mute`

Optional: `call_control_ids` (array[string]), `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.mute('id');

console.log(response.data);
```

Returns: `result` (string)

## Play audio to conference participants

Play audio to all or some participants on a conference call.

`POST /conferences/{id}/actions/play`

Optional: `audio_url` (string), `call_control_ids` (array[string]), `loop` (object), `media_name` (string), `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.play('id');

console.log(response.data);
```

Returns: `result` (string)

## Conference recording pause

Pause conference recording.

`POST /conferences/{id}/actions/record_pause`

Optional: `command_id` (string), `recording_id` (string), `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.recordPause('id');

console.log(response.data);
```

Returns: `result` (string)

## Conference recording resume

Resume conference recording.

`POST /conferences/{id}/actions/record_resume`

Optional: `command_id` (string), `recording_id` (string), `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.recordResume('id');

console.log(response.data);
```

Returns: `result` (string)

## Conference recording start

Start recording the conference. Recording will stop on conference end, or via the Stop Recording command. **Expected Webhooks:**

- `conference.recording.saved`

`POST /conferences/{id}/actions/record_start` — Required: `format`

Optional: `channels` (enum: single, dual), `command_id` (string), `custom_file_name` (string), `play_beep` (boolean), `region` (enum: Australia, Europe, Middle East, US), `trim` (enum: trim-silence)

```javascript
const response = await client.conferences.actions.recordStart('id', { format: 'wav' });

console.log(response.data);
```

Returns: `result` (string)

## Conference recording stop

Stop recording the conference. **Expected Webhooks:**

- `conference.recording.saved`

`POST /conferences/{id}/actions/record_stop`

Optional: `client_state` (string), `command_id` (string), `recording_id` (uuid), `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.recordStop('id');

console.log(response.data);
```

Returns: `result` (string)

## Send DTMF to conference participants

Send DTMF tones to one or more conference participants.

`POST /conferences/{id}/actions/send_dtmf` — Required: `digits`

Optional: `call_control_ids` (array[string]), `client_state` (string), `duration_millis` (integer)

```javascript
const response = await client.conferences.actions.sendDtmf('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  digits: '1234#',
});

console.log(response.data);
```

Returns: `result` (string)

## Speak text to conference participants

Convert text to speech and play it to all or some participants.

`POST /conferences/{id}/actions/speak` — Required: `payload`, `voice`

Optional: `call_control_ids` (array[string]), `command_id` (string), `language` (enum: arb, cmn-CN, cy-GB, da-DK, de-DE, en-AU, en-GB, en-GB-WLS, en-IN, en-US, es-ES, es-MX, es-US, fr-CA, fr-FR, hi-IN, is-IS, it-IT, ja-JP, ko-KR, nb-NO, nl-NL, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, sv-SE, tr-TR), `payload_type` (enum: text, ssml), `region` (enum: Australia, Europe, Middle East, US), `voice_settings` (object)

```javascript
const response = await client.conferences.actions.speak('id', {
  payload: 'Say this to participants',
  voice: 'female',
});

console.log(response.data);
```

Returns: `result` (string)

## Stop audio being played on the conference

Stop audio being played to all or some participants on a conference call.

`POST /conferences/{id}/actions/stop`

Optional: `call_control_ids` (array[string]), `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.stop('id');

console.log(response.data);
```

Returns: `result` (string)

## Unhold conference participants

Unhold a list of participants in a conference call

`POST /conferences/{id}/actions/unhold` — Required: `call_control_ids`

Optional: `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.unhold('id', {
  call_control_ids: ['v3:MdI91X4lWFEs7IgbBEOT9M4AigoY08M0WWZFISt1Yw2axZ_IiE4pqg'],
});

console.log(response.data);
```

Returns: `result` (string)

## Unmute conference participants

Unmute a list of participants in a conference call

`POST /conferences/{id}/actions/unmute`

Optional: `call_control_ids` (array[string]), `region` (enum: Australia, Europe, Middle East, US)

```javascript
const response = await client.conferences.actions.unmute('id');

console.log(response.data);
```

Returns: `result` (string)

## Update conference participant

Update conference participant supervisor_role

`POST /conferences/{id}/actions/update` — Required: `call_control_id`, `supervisor_role`

Optional: `command_id` (string), `region` (enum: Australia, Europe, Middle East, US), `whisper_call_control_ids` (array[string])

```javascript
const action = await client.conferences.actions.update('id', {
  call_control_id: 'v3:MdI91X4lWFEs7IgbBEOT9M4AigoY08M0WWZFISt1Yw2axZ_IiE4pqg',
  supervisor_role: 'whisper',
});

console.log(action.data);
```

Returns: `result` (string)

## Retrieve a conference participant

Retrieve details of a specific conference participant by their ID or label.

`GET /conferences/{id}/participants/{participant_id}`

```javascript
const response = await client.conferences.retrieveParticipant('participant_id', {
  id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(response.data);
```

Returns: `call_control_id` (string), `call_leg_id` (string), `conference_id` (string), `created_at` (date-time), `end_conference_on_exit` (boolean), `id` (string), `label` (string), `muted` (boolean), `on_hold` (boolean), `soft_end_conference_on_exit` (boolean), `status` (enum: joining, joined, left), `updated_at` (date-time), `whisper_call_control_ids` (array[string])

## Update a conference participant

Update properties of a conference participant.

`PATCH /conferences/{id}/participants/{participant_id}`

Optional: `beep_enabled` (enum: always, never, on_enter, on_exit), `end_conference_on_exit` (boolean), `soft_end_conference_on_exit` (boolean)

```javascript
const response = await client.conferences.updateParticipant('participant_id', {
  id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(response.data);
```

Returns: `call_control_id` (string), `call_leg_id` (string), `conference_id` (string), `created_at` (date-time), `end_conference_on_exit` (boolean), `id` (string), `label` (string), `muted` (boolean), `on_hold` (boolean), `soft_end_conference_on_exit` (boolean), `status` (enum: joining, joined, left), `updated_at` (date-time), `whisper_call_control_ids` (array[string])

## List queues

List all queues for the authenticated user.

`GET /queues`

```javascript
// Automatically fetches more pages as needed.
for await (const queue of client.queues.list()) {
  console.log(queue.id);
}
```

Returns: `average_wait_time_secs` (integer), `created_at` (string), `current_size` (integer), `id` (string), `max_size` (integer), `name` (string), `record_type` (enum: queue), `updated_at` (string)

## Create a queue

Create a new call queue.

`POST /queues` — Required: `queue_name`

Optional: `max_size` (integer)

```javascript
const queue = await client.queues.create({ queue_name: 'tier_1_support' });

console.log(queue.data);
```

Returns: `average_wait_time_secs` (integer), `created_at` (string), `current_size` (integer), `id` (string), `max_size` (integer), `name` (string), `record_type` (enum: queue), `updated_at` (string)

## Retrieve a call queue

Retrieve an existing call queue

`GET /queues/{queue_name}`

```javascript
const queue = await client.queues.retrieve('queue_name');

console.log(queue.data);
```

Returns: `average_wait_time_secs` (integer), `created_at` (string), `current_size` (integer), `id` (string), `max_size` (integer), `name` (string), `record_type` (enum: queue), `updated_at` (string)

## Update a queue

Update properties of an existing call queue.

`POST /queues/{queue_name}` — Required: `max_size`

```javascript
const queue = await client.queues.update('queue_name', { max_size: 200 });

console.log(queue.data);
```

Returns: `average_wait_time_secs` (integer), `created_at` (string), `current_size` (integer), `id` (string), `max_size` (integer), `name` (string), `record_type` (enum: queue), `updated_at` (string)

## Delete a queue

Delete an existing call queue.

`DELETE /queues/{queue_name}`

```javascript
await client.queues.delete('queue_name');
```

## Retrieve calls from a queue

Retrieve the list of calls in an existing queue

`GET /queues/{queue_name}/calls`

```javascript
// Automatically fetches more pages as needed.
for await (const callListResponse of client.queues.calls.list('queue_name')) {
  console.log(callListResponse.call_control_id);
}
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `connection_id` (string), `enqueued_at` (string), `from` (string), `is_alive` (boolean), `queue_id` (string), `queue_position` (integer), `record_type` (enum: queue_call), `to` (string), `wait_time_secs` (integer)

## Retrieve a call from a queue

Retrieve an existing call from an existing queue

`GET /queues/{queue_name}/calls/{call_control_id}`

```javascript
const call = await client.queues.calls.retrieve('call_control_id', { queue_name: 'queue_name' });

console.log(call.data);
```

Returns: `call_control_id` (string), `call_leg_id` (string), `call_session_id` (string), `connection_id` (string), `enqueued_at` (string), `from` (string), `is_alive` (boolean), `queue_id` (string), `queue_position` (integer), `record_type` (enum: queue_call), `to` (string), `wait_time_secs` (integer)

## Update queued call

Update queued call's keep_after_hangup flag

`PATCH /queues/{queue_name}/calls/{call_control_id}`

Optional: `keep_after_hangup` (boolean)

```javascript
await client.queues.calls.update('call_control_id', { queue_name: 'queue_name' });
```

## Force remove a call from a queue

Removes an inactive call from a queue. If the call is no longer active, use this command to remove it from the queue.

`DELETE /queues/{queue_name}/calls/{call_control_id}`

```javascript
await client.queues.calls.remove('call_control_id', { queue_name: 'queue_name' });
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
