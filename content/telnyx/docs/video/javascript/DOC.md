---
name: video
description: "Create and manage video rooms for real-time video communication and conferencing."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,video,rooms,conferencing,real-time"
---

# Telnyx Video JavaScript SDK Coding Guidelines

You are a Telnyx Video API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

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

## View a list of room compositions.

`GET /room_compositions`

```javascript
// Automatically fetches more pages as needed.
for await (const roomComposition of client.roomCompositions.list()) {
  console.log(roomComposition.id);
}
```

Returns: `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `format` (enum: mp4), `id` (uuid), `record_type` (string), `resolution` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, enqueued, processing), `updated_at` (date-time), `user_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Create a room composition.

Asynchronously create a room composition.

`POST /room_compositions`

Optional: `format` (string), `resolution` (string), `session_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

```javascript
const roomComposition = await client.roomCompositions.create();

console.log(roomComposition.data);
```

Returns: `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `format` (enum: mp4), `id` (uuid), `record_type` (string), `resolution` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, enqueued, processing), `updated_at` (date-time), `user_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## View a room composition.

`GET /room_compositions/{room_composition_id}`

```javascript
const roomComposition = await client.roomCompositions.retrieve(
  '5219b3af-87c6-4c08-9b58-5a533d893e21',
);

console.log(roomComposition.data);
```

Returns: `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `format` (enum: mp4), `id` (uuid), `record_type` (string), `resolution` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, enqueued, processing), `updated_at` (date-time), `user_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Delete a room composition.

Synchronously delete a room composition.

`DELETE /room_compositions/{room_composition_id}`

```javascript
await client.roomCompositions.delete('5219b3af-87c6-4c08-9b58-5a533d893e21');
```

## View a list of room participants.

`GET /room_participants`

```javascript
// Automatically fetches more pages as needed.
for await (const roomParticipant of client.roomParticipants.list()) {
  console.log(roomParticipant.id);
}
```

Returns: `context` (string), `id` (uuid), `joined_at` (date-time), `left_at` (date-time), `record_type` (string), `session_id` (uuid), `updated_at` (date-time)

## View a room participant.

`GET /room_participants/{room_participant_id}`

```javascript
const roomParticipant = await client.roomParticipants.retrieve(
  '0ccc7b54-4df3-4bca-a65a-3da1ecc777f0',
);

console.log(roomParticipant.data);
```

Returns: `context` (string), `id` (uuid), `joined_at` (date-time), `left_at` (date-time), `record_type` (string), `session_id` (uuid), `updated_at` (date-time)

## View a list of room recordings.

`GET /room_recordings`

```javascript
// Automatically fetches more pages as needed.
for await (const roomRecordingListResponse of client.roomRecordings.list()) {
  console.log(roomRecordingListResponse.id);
}
```

Returns: `codec` (string), `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `id` (uuid), `participant_id` (uuid), `record_type` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, processing), `type` (enum: audio, video), `updated_at` (date-time)

## Delete several room recordings in a bulk.

`DELETE /room_recordings`

```javascript
const response = await client.roomRecordings.deleteBulk();

console.log(response.data);
```

Returns: `room_recordings` (integer)

## View a room recording.

`GET /room_recordings/{room_recording_id}`

```javascript
const roomRecording = await client.roomRecordings.retrieve('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');

console.log(roomRecording.data);
```

Returns: `codec` (string), `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `id` (uuid), `participant_id` (uuid), `record_type` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, processing), `type` (enum: audio, video), `updated_at` (date-time)

## Delete a room recording.

Synchronously delete a Room Recording.

`DELETE /room_recordings/{room_recording_id}`

```javascript
await client.roomRecordings.delete('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');
```

## View a list of room sessions.

`GET /room_sessions`

```javascript
// Automatically fetches more pages as needed.
for await (const roomSession of client.rooms.sessions.list0()) {
  console.log(roomSession.id);
}
```

Returns: `active` (boolean), `created_at` (date-time), `ended_at` (date-time), `id` (uuid), `participants` (array[object]), `record_type` (string), `room_id` (uuid), `updated_at` (date-time)

## View a room session.

`GET /room_sessions/{room_session_id}`

```javascript
const session = await client.rooms.sessions.retrieve('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');

console.log(session.data);
```

Returns: `active` (boolean), `created_at` (date-time), `ended_at` (date-time), `id` (uuid), `participants` (array[object]), `record_type` (string), `room_id` (uuid), `updated_at` (date-time)

## End a room session.

Note: this will also kick all participants currently present in the room

`POST /room_sessions/{room_session_id}/actions/end`

```javascript
const response = await client.rooms.sessions.actions.end('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');

console.log(response.data);
```

Returns: `result` (string)

## Kick participants from a room session.

`POST /room_sessions/{room_session_id}/actions/kick`

Optional: `exclude` (array[string]), `participants` (object)

```javascript
const response = await client.rooms.sessions.actions.kick('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');

console.log(response.data);
```

Returns: `result` (string)

## Mute participants in room session.

`POST /room_sessions/{room_session_id}/actions/mute`

Optional: `exclude` (array[string]), `participants` (object)

```javascript
const response = await client.rooms.sessions.actions.mute('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');

console.log(response.data);
```

Returns: `result` (string)

## Unmute participants in room session.

`POST /room_sessions/{room_session_id}/actions/unmute`

Optional: `exclude` (array[string]), `participants` (object)

```javascript
const response = await client.rooms.sessions.actions.unmute('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');

console.log(response.data);
```

Returns: `result` (string)

## View a list of room participants.

`GET /room_sessions/{room_session_id}/participants`

```javascript
// Automatically fetches more pages as needed.
for await (const roomParticipant of client.rooms.sessions.retrieveParticipants(
  '0ccc7b54-4df3-4bca-a65a-3da1ecc777f0',
)) {
  console.log(roomParticipant.id);
}
```

Returns: `context` (string), `id` (uuid), `joined_at` (date-time), `left_at` (date-time), `record_type` (string), `session_id` (uuid), `updated_at` (date-time)

## View a list of rooms.

`GET /rooms`

```javascript
// Automatically fetches more pages as needed.
for await (const room of client.rooms.list()) {
  console.log(room.id);
}
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Create a room.

Synchronously create a Room.

`POST /rooms`

Optional: `enable_recording` (boolean), `max_participants` (integer), `unique_name` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

```javascript
const room = await client.rooms.create();

console.log(room.data);
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## View a room.

`GET /rooms/{room_id}`

```javascript
const room = await client.rooms.retrieve('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');

console.log(room.data);
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Update a room.

Synchronously update a Room.

`PATCH /rooms/{room_id}`

Optional: `enable_recording` (boolean), `max_participants` (integer), `unique_name` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

```javascript
const room = await client.rooms.update('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');

console.log(room.data);
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Delete a room.

Synchronously delete a Room. Participants from that room will be kicked out, they won't be able to join that room anymore, and you won't be charged anymore for that room.

`DELETE /rooms/{room_id}`

```javascript
await client.rooms.delete('0ccc7b54-4df3-4bca-a65a-3da1ecc777f0');
```

## Create Client Token to join a room.

Synchronously create an Client Token to join a Room. Client Token is necessary to join a Telnyx Room. Client Token will expire after `token_ttl_secs`, a Refresh Token is also provided to refresh a Client Token, the Refresh Token expires after `refresh_token_ttl_secs`.

`POST /rooms/{room_id}/actions/generate_join_client_token`

Optional: `refresh_token_ttl_secs` (integer), `token_ttl_secs` (integer)

```javascript
const response = await client.rooms.actions.generateJoinClientToken(
  '0ccc7b54-4df3-4bca-a65a-3da1ecc777f0',
);

console.log(response.data);
```

Returns: `refresh_token` (string), `refresh_token_expires_at` (date-time), `token` (string), `token_expires_at` (date-time)

## Refresh Client Token to join a room.

Synchronously refresh an Client Token to join a Room. Client Token is necessary to join a Telnyx Room. Client Token will expire after `token_ttl_secs`.

`POST /rooms/{room_id}/actions/refresh_client_token` — Required: `refresh_token`

Optional: `token_ttl_secs` (integer)

```javascript
const response = await client.rooms.actions.refreshClientToken(
  '0ccc7b54-4df3-4bca-a65a-3da1ecc777f0',
  {
    refresh_token:
      'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0ZWxueXhfdGVsZXBob255IiwiZXhwIjoxNTkwMDEwMTQzLCJpYXQiOjE1ODc1OTA5NDMsImlzcyI6InRlbG55eF90ZWxlcGhvbnkiLCJqdGkiOiJiOGM3NDgzNy1kODllLTRhNjUtOWNmMi0zNGM3YTZmYTYwYzgiLCJuYmYiOjE1ODc1OTA5NDIsInN1YiI6IjVjN2FjN2QwLWRiNjUtNGYxMS05OGUxLWVlYzBkMWQ1YzZhZSIsInRlbF90b2tlbiI6InJqX1pra1pVT1pNeFpPZk9tTHBFVUIzc2lVN3U2UmpaRmVNOXMtZ2JfeENSNTZXRktGQUppTXlGMlQ2Q0JSbWxoX1N5MGlfbGZ5VDlBSThzRWlmOE1USUlzenl6U2xfYURuRzQ4YU81MHlhSEd1UlNZYlViU1ltOVdJaVEwZz09IiwidHlwIjoiYWNjZXNzIn0.gNEwzTow5MLLPLQENytca7pUN79PmPj6FyqZWW06ZeEmesxYpwKh0xRtA0TzLh6CDYIRHrI8seofOO0YFGDhpQ',
  },
);

console.log(response.data);
```

Returns: `token` (string), `token_expires_at` (date-time)

## View a list of room sessions.

`GET /rooms/{room_id}/sessions`

```javascript
// Automatically fetches more pages as needed.
for await (const roomSession of client.rooms.sessions.list1(
  '0ccc7b54-4df3-4bca-a65a-3da1ecc777f0',
)) {
  console.log(roomSession.id);
}
```

Returns: `active` (boolean), `created_at` (date-time), `ended_at` (date-time), `id` (uuid), `participants` (array[object]), `record_type` (string), `room_id` (uuid), `updated_at` (date-time)
