---
name: video
description: "Create and manage video rooms for real-time video communication and conferencing."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,video,rooms,conferencing,real-time"
---

# Telnyx Video Python SDK Coding Guidelines

You are a Telnyx Video API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

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

## View a list of room compositions.

`GET /room_compositions`

```python
page = client.room_compositions.list()
page = page.data[0]
print(page.id)
```

Returns: `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `format` (enum: mp4), `id` (uuid), `record_type` (string), `resolution` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, enqueued, processing), `updated_at` (date-time), `user_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Create a room composition.

Asynchronously create a room composition.

`POST /room_compositions`

Optional: `format` (string), `resolution` (string), `session_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

```python
room_composition = client.room_compositions.create()
print(room_composition.data)
```

Returns: `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `format` (enum: mp4), `id` (uuid), `record_type` (string), `resolution` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, enqueued, processing), `updated_at` (date-time), `user_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## View a room composition.

`GET /room_compositions/{room_composition_id}`

```python
room_composition = client.room_compositions.retrieve(
    "5219b3af-87c6-4c08-9b58-5a533d893e21",
)
print(room_composition.data)
```

Returns: `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `format` (enum: mp4), `id` (uuid), `record_type` (string), `resolution` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, enqueued, processing), `updated_at` (date-time), `user_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Delete a room composition.

Synchronously delete a room composition.

`DELETE /room_compositions/{room_composition_id}`

```python
client.room_compositions.delete(
    "5219b3af-87c6-4c08-9b58-5a533d893e21",
)
```

## View a list of room participants.

`GET /room_participants`

```python
page = client.room_participants.list()
page = page.data[0]
print(page.id)
```

Returns: `context` (string), `id` (uuid), `joined_at` (date-time), `left_at` (date-time), `record_type` (string), `session_id` (uuid), `updated_at` (date-time)

## View a room participant.

`GET /room_participants/{room_participant_id}`

```python
room_participant = client.room_participants.retrieve(
    "0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(room_participant.data)
```

Returns: `context` (string), `id` (uuid), `joined_at` (date-time), `left_at` (date-time), `record_type` (string), `session_id` (uuid), `updated_at` (date-time)

## View a list of room recordings.

`GET /room_recordings`

```python
page = client.room_recordings.list()
page = page.data[0]
print(page.id)
```

Returns: `codec` (string), `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `id` (uuid), `participant_id` (uuid), `record_type` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, processing), `type` (enum: audio, video), `updated_at` (date-time)

## Delete several room recordings in a bulk.

`DELETE /room_recordings`

```python
response = client.room_recordings.delete_bulk()
print(response.data)
```

Returns: `room_recordings` (integer)

## View a room recording.

`GET /room_recordings/{room_recording_id}`

```python
room_recording = client.room_recordings.retrieve(
    "0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(room_recording.data)
```

Returns: `codec` (string), `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `id` (uuid), `participant_id` (uuid), `record_type` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, processing), `type` (enum: audio, video), `updated_at` (date-time)

## Delete a room recording.

Synchronously delete a Room Recording.

`DELETE /room_recordings/{room_recording_id}`

```python
client.room_recordings.delete(
    "0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
```

## View a list of room sessions.

`GET /room_sessions`

```python
page = client.rooms.sessions.list_0()
page = page.data[0]
print(page.id)
```

Returns: `active` (boolean), `created_at` (date-time), `ended_at` (date-time), `id` (uuid), `participants` (array[object]), `record_type` (string), `room_id` (uuid), `updated_at` (date-time)

## View a room session.

`GET /room_sessions/{room_session_id}`

```python
session = client.rooms.sessions.retrieve(
    room_session_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(session.data)
```

Returns: `active` (boolean), `created_at` (date-time), `ended_at` (date-time), `id` (uuid), `participants` (array[object]), `record_type` (string), `room_id` (uuid), `updated_at` (date-time)

## End a room session.

Note: this will also kick all participants currently present in the room

`POST /room_sessions/{room_session_id}/actions/end`

```python
response = client.rooms.sessions.actions.end(
    "0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(response.data)
```

Returns: `result` (string)

## Kick participants from a room session.

`POST /room_sessions/{room_session_id}/actions/kick`

Optional: `exclude` (array[string]), `participants` (object)

```python
response = client.rooms.sessions.actions.kick(
    room_session_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(response.data)
```

Returns: `result` (string)

## Mute participants in room session.

`POST /room_sessions/{room_session_id}/actions/mute`

Optional: `exclude` (array[string]), `participants` (object)

```python
response = client.rooms.sessions.actions.mute(
    room_session_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(response.data)
```

Returns: `result` (string)

## Unmute participants in room session.

`POST /room_sessions/{room_session_id}/actions/unmute`

Optional: `exclude` (array[string]), `participants` (object)

```python
response = client.rooms.sessions.actions.unmute(
    room_session_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(response.data)
```

Returns: `result` (string)

## View a list of room participants.

`GET /room_sessions/{room_session_id}/participants`

```python
page = client.rooms.sessions.retrieve_participants(
    room_session_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
page = page.data[0]
print(page.id)
```

Returns: `context` (string), `id` (uuid), `joined_at` (date-time), `left_at` (date-time), `record_type` (string), `session_id` (uuid), `updated_at` (date-time)

## View a list of rooms.

`GET /rooms`

```python
page = client.rooms.list()
page = page.data[0]
print(page.id)
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Create a room.

Synchronously create a Room.

`POST /rooms`

Optional: `enable_recording` (boolean), `max_participants` (integer), `unique_name` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

```python
room = client.rooms.create()
print(room.data)
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## View a room.

`GET /rooms/{room_id}`

```python
room = client.rooms.retrieve(
    room_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(room.data)
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Update a room.

Synchronously update a Room.

`PATCH /rooms/{room_id}`

Optional: `enable_recording` (boolean), `max_participants` (integer), `unique_name` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

```python
room = client.rooms.update(
    room_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(room.data)
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Delete a room.

Synchronously delete a Room. Participants from that room will be kicked out, they won't be able to join that room anymore, and you won't be charged anymore for that room.

`DELETE /rooms/{room_id}`

```python
client.rooms.delete(
    "0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
```

## Create Client Token to join a room.

Synchronously create an Client Token to join a Room. Client Token is necessary to join a Telnyx Room. Client Token will expire after `token_ttl_secs`, a Refresh Token is also provided to refresh a Client Token, the Refresh Token expires after `refresh_token_ttl_secs`.

`POST /rooms/{room_id}/actions/generate_join_client_token`

Optional: `refresh_token_ttl_secs` (integer), `token_ttl_secs` (integer)

```python
response = client.rooms.actions.generate_join_client_token(
    room_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(response.data)
```

Returns: `refresh_token` (string), `refresh_token_expires_at` (date-time), `token` (string), `token_expires_at` (date-time)

## Refresh Client Token to join a room.

Synchronously refresh an Client Token to join a Room. Client Token is necessary to join a Telnyx Room. Client Token will expire after `token_ttl_secs`.

`POST /rooms/{room_id}/actions/refresh_client_token` — Required: `refresh_token`

Optional: `token_ttl_secs` (integer)

```python
response = client.rooms.actions.refresh_client_token(
    room_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
    refresh_token="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0ZWxueXhfdGVsZXBob255IiwiZXhwIjoxNTkwMDEwMTQzLCJpYXQiOjE1ODc1OTA5NDMsImlzcyI6InRlbG55eF90ZWxlcGhvbnkiLCJqdGkiOiJiOGM3NDgzNy1kODllLTRhNjUtOWNmMi0zNGM3YTZmYTYwYzgiLCJuYmYiOjE1ODc1OTA5NDIsInN1YiI6IjVjN2FjN2QwLWRiNjUtNGYxMS05OGUxLWVlYzBkMWQ1YzZhZSIsInRlbF90b2tlbiI6InJqX1pra1pVT1pNeFpPZk9tTHBFVUIzc2lVN3U2UmpaRmVNOXMtZ2JfeENSNTZXRktGQUppTXlGMlQ2Q0JSbWxoX1N5MGlfbGZ5VDlBSThzRWlmOE1USUlzenl6U2xfYURuRzQ4YU81MHlhSEd1UlNZYlViU1ltOVdJaVEwZz09IiwidHlwIjoiYWNjZXNzIn0.gNEwzTow5MLLPLQENytca7pUN79PmPj6FyqZWW06ZeEmesxYpwKh0xRtA0TzLh6CDYIRHrI8seofOO0YFGDhpQ",
)
print(response.data)
```

Returns: `token` (string), `token_expires_at` (date-time)

## View a list of room sessions.

`GET /rooms/{room_id}/sessions`

```python
page = client.rooms.sessions.list_1(
    room_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
page = page.data[0]
print(page.id)
```

Returns: `active` (boolean), `created_at` (date-time), `ended_at` (date-time), `id` (uuid), `participants` (array[object]), `record_type` (string), `room_id` (uuid), `updated_at` (date-time)
