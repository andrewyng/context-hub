---
name: video
description: "Create and manage video rooms for real-time video communication and conferencing."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,video,rooms,conferencing,real-time"
---

# Telnyx Video Java SDK Coding Guidelines

You are a Telnyx Video API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## View a list of room compositions.

`GET /room_compositions`

```java
import com.telnyx.sdk.models.roomcompositions.RoomCompositionListPage;
import com.telnyx.sdk.models.roomcompositions.RoomCompositionListParams;

RoomCompositionListPage page = client.roomCompositions().list();
```

Returns: `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `format` (enum: mp4), `id` (uuid), `record_type` (string), `resolution` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, enqueued, processing), `updated_at` (date-time), `user_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Create a room composition.

Asynchronously create a room composition.

`POST /room_compositions`

Optional: `format` (string), `resolution` (string), `session_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

```java
import com.telnyx.sdk.models.roomcompositions.RoomCompositionCreateParams;
import com.telnyx.sdk.models.roomcompositions.RoomCompositionCreateResponse;

RoomCompositionCreateResponse roomComposition = client.roomCompositions().create();
```

Returns: `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `format` (enum: mp4), `id` (uuid), `record_type` (string), `resolution` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, enqueued, processing), `updated_at` (date-time), `user_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## View a room composition.

`GET /room_compositions/{room_composition_id}`

```java
import com.telnyx.sdk.models.roomcompositions.RoomCompositionRetrieveParams;
import com.telnyx.sdk.models.roomcompositions.RoomCompositionRetrieveResponse;

RoomCompositionRetrieveResponse roomComposition = client.roomCompositions().retrieve("5219b3af-87c6-4c08-9b58-5a533d893e21");
```

Returns: `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `format` (enum: mp4), `id` (uuid), `record_type` (string), `resolution` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, enqueued, processing), `updated_at` (date-time), `user_id` (uuid), `video_layout` (object), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Delete a room composition.

Synchronously delete a room composition.

`DELETE /room_compositions/{room_composition_id}`

```java
import com.telnyx.sdk.models.roomcompositions.RoomCompositionDeleteParams;

client.roomCompositions().delete("5219b3af-87c6-4c08-9b58-5a533d893e21");
```

## View a list of room participants.

`GET /room_participants`

```java
import com.telnyx.sdk.models.roomparticipants.RoomParticipantListPage;
import com.telnyx.sdk.models.roomparticipants.RoomParticipantListParams;

RoomParticipantListPage page = client.roomParticipants().list();
```

Returns: `context` (string), `id` (uuid), `joined_at` (date-time), `left_at` (date-time), `record_type` (string), `session_id` (uuid), `updated_at` (date-time)

## View a room participant.

`GET /room_participants/{room_participant_id}`

```java
import com.telnyx.sdk.models.roomparticipants.RoomParticipantRetrieveParams;
import com.telnyx.sdk.models.roomparticipants.RoomParticipantRetrieveResponse;

RoomParticipantRetrieveResponse roomParticipant = client.roomParticipants().retrieve("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

Returns: `context` (string), `id` (uuid), `joined_at` (date-time), `left_at` (date-time), `record_type` (string), `session_id` (uuid), `updated_at` (date-time)

## View a list of room recordings.

`GET /room_recordings`

```java
import com.telnyx.sdk.models.roomrecordings.RoomRecordingListPage;
import com.telnyx.sdk.models.roomrecordings.RoomRecordingListParams;

RoomRecordingListPage page = client.roomRecordings().list();
```

Returns: `codec` (string), `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `id` (uuid), `participant_id` (uuid), `record_type` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, processing), `type` (enum: audio, video), `updated_at` (date-time)

## Delete several room recordings in a bulk.

`DELETE /room_recordings`

```java
import com.telnyx.sdk.models.roomrecordings.RoomRecordingDeleteBulkParams;
import com.telnyx.sdk.models.roomrecordings.RoomRecordingDeleteBulkResponse;

RoomRecordingDeleteBulkResponse response = client.roomRecordings().deleteBulk();
```

Returns: `room_recordings` (integer)

## View a room recording.

`GET /room_recordings/{room_recording_id}`

```java
import com.telnyx.sdk.models.roomrecordings.RoomRecordingRetrieveParams;
import com.telnyx.sdk.models.roomrecordings.RoomRecordingRetrieveResponse;

RoomRecordingRetrieveResponse roomRecording = client.roomRecordings().retrieve("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

Returns: `codec` (string), `completed_at` (date-time), `created_at` (date-time), `download_url` (string), `duration_secs` (integer), `ended_at` (date-time), `id` (uuid), `participant_id` (uuid), `record_type` (string), `room_id` (uuid), `session_id` (uuid), `size_mb` (float), `started_at` (date-time), `status` (enum: completed, processing), `type` (enum: audio, video), `updated_at` (date-time)

## Delete a room recording.

Synchronously delete a Room Recording.

`DELETE /room_recordings/{room_recording_id}`

```java
import com.telnyx.sdk.models.roomrecordings.RoomRecordingDeleteParams;

client.roomRecordings().delete("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

## View a list of room sessions.

`GET /room_sessions`

```java
import com.telnyx.sdk.models.rooms.sessions.SessionList0Page;
import com.telnyx.sdk.models.rooms.sessions.SessionList0Params;

SessionList0Page page = client.rooms().sessions().list0();
```

Returns: `active` (boolean), `created_at` (date-time), `ended_at` (date-time), `id` (uuid), `participants` (array[object]), `record_type` (string), `room_id` (uuid), `updated_at` (date-time)

## View a room session.

`GET /room_sessions/{room_session_id}`

```java
import com.telnyx.sdk.models.rooms.sessions.SessionRetrieveParams;
import com.telnyx.sdk.models.rooms.sessions.SessionRetrieveResponse;

SessionRetrieveResponse session = client.rooms().sessions().retrieve("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

Returns: `active` (boolean), `created_at` (date-time), `ended_at` (date-time), `id` (uuid), `participants` (array[object]), `record_type` (string), `room_id` (uuid), `updated_at` (date-time)

## End a room session.

Note: this will also kick all participants currently present in the room

`POST /room_sessions/{room_session_id}/actions/end`

```java
import com.telnyx.sdk.models.rooms.sessions.actions.ActionEndParams;
import com.telnyx.sdk.models.rooms.sessions.actions.ActionEndResponse;

ActionEndResponse response = client.rooms().sessions().actions().end("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

Returns: `result` (string)

## Kick participants from a room session.

`POST /room_sessions/{room_session_id}/actions/kick`

Optional: `exclude` (array[string]), `participants` (object)

```java
import com.telnyx.sdk.models.rooms.sessions.actions.ActionKickParams;
import com.telnyx.sdk.models.rooms.sessions.actions.ActionKickResponse;
import com.telnyx.sdk.models.rooms.sessions.actions.ActionsParticipantsRequest;

ActionKickParams params = ActionKickParams.builder()
    .roomSessionId("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0")
    .actionsParticipantsRequest(ActionsParticipantsRequest.builder().build())
    .build();
ActionKickResponse response = client.rooms().sessions().actions().kick(params);
```

Returns: `result` (string)

## Mute participants in room session.

`POST /room_sessions/{room_session_id}/actions/mute`

Optional: `exclude` (array[string]), `participants` (object)

```java
import com.telnyx.sdk.models.rooms.sessions.actions.ActionMuteParams;
import com.telnyx.sdk.models.rooms.sessions.actions.ActionMuteResponse;
import com.telnyx.sdk.models.rooms.sessions.actions.ActionsParticipantsRequest;

ActionMuteParams params = ActionMuteParams.builder()
    .roomSessionId("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0")
    .actionsParticipantsRequest(ActionsParticipantsRequest.builder().build())
    .build();
ActionMuteResponse response = client.rooms().sessions().actions().mute(params);
```

Returns: `result` (string)

## Unmute participants in room session.

`POST /room_sessions/{room_session_id}/actions/unmute`

Optional: `exclude` (array[string]), `participants` (object)

```java
import com.telnyx.sdk.models.rooms.sessions.actions.ActionUnmuteParams;
import com.telnyx.sdk.models.rooms.sessions.actions.ActionUnmuteResponse;
import com.telnyx.sdk.models.rooms.sessions.actions.ActionsParticipantsRequest;

ActionUnmuteParams params = ActionUnmuteParams.builder()
    .roomSessionId("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0")
    .actionsParticipantsRequest(ActionsParticipantsRequest.builder().build())
    .build();
ActionUnmuteResponse response = client.rooms().sessions().actions().unmute(params);
```

Returns: `result` (string)

## View a list of room participants.

`GET /room_sessions/{room_session_id}/participants`

```java
import com.telnyx.sdk.models.rooms.sessions.SessionRetrieveParticipantsPage;
import com.telnyx.sdk.models.rooms.sessions.SessionRetrieveParticipantsParams;

SessionRetrieveParticipantsPage page = client.rooms().sessions().retrieveParticipants("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

Returns: `context` (string), `id` (uuid), `joined_at` (date-time), `left_at` (date-time), `record_type` (string), `session_id` (uuid), `updated_at` (date-time)

## View a list of rooms.

`GET /rooms`

```java
import com.telnyx.sdk.models.rooms.RoomListPage;
import com.telnyx.sdk.models.rooms.RoomListParams;

RoomListPage page = client.rooms().list();
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Create a room.

Synchronously create a Room.

`POST /rooms`

Optional: `enable_recording` (boolean), `max_participants` (integer), `unique_name` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

```java
import com.telnyx.sdk.models.rooms.RoomCreateParams;
import com.telnyx.sdk.models.rooms.RoomCreateResponse;

RoomCreateResponse room = client.rooms().create();
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## View a room.

`GET /rooms/{room_id}`

```java
import com.telnyx.sdk.models.rooms.RoomRetrieveParams;
import com.telnyx.sdk.models.rooms.RoomRetrieveResponse;

RoomRetrieveResponse room = client.rooms().retrieve("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Update a room.

Synchronously update a Room.

`PATCH /rooms/{room_id}`

Optional: `enable_recording` (boolean), `max_participants` (integer), `unique_name` (string), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

```java
import com.telnyx.sdk.models.rooms.RoomUpdateParams;
import com.telnyx.sdk.models.rooms.RoomUpdateResponse;

RoomUpdateResponse room = client.rooms().update("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

Returns: `active_session_id` (uuid), `created_at` (date-time), `enable_recording` (boolean), `id` (uuid), `max_participants` (integer), `record_type` (string), `sessions` (array[object]), `unique_name` (string), `updated_at` (date-time), `webhook_event_failover_url` (uri), `webhook_event_url` (uri), `webhook_timeout_secs` (integer)

## Delete a room.

Synchronously delete a Room. Participants from that room will be kicked out, they won't be able to join that room anymore, and you won't be charged anymore for that room.

`DELETE /rooms/{room_id}`

```java
import com.telnyx.sdk.models.rooms.RoomDeleteParams;

client.rooms().delete("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

## Create Client Token to join a room.

Synchronously create an Client Token to join a Room. Client Token is necessary to join a Telnyx Room. Client Token will expire after `token_ttl_secs`, a Refresh Token is also provided to refresh a Client Token, the Refresh Token expires after `refresh_token_ttl_secs`.

`POST /rooms/{room_id}/actions/generate_join_client_token`

Optional: `refresh_token_ttl_secs` (integer), `token_ttl_secs` (integer)

```java
import com.telnyx.sdk.models.rooms.actions.ActionGenerateJoinClientTokenParams;
import com.telnyx.sdk.models.rooms.actions.ActionGenerateJoinClientTokenResponse;

ActionGenerateJoinClientTokenResponse response = client.rooms().actions().generateJoinClientToken("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

Returns: `refresh_token` (string), `refresh_token_expires_at` (date-time), `token` (string), `token_expires_at` (date-time)

## Refresh Client Token to join a room.

Synchronously refresh an Client Token to join a Room. Client Token is necessary to join a Telnyx Room. Client Token will expire after `token_ttl_secs`.

`POST /rooms/{room_id}/actions/refresh_client_token` — Required: `refresh_token`

Optional: `token_ttl_secs` (integer)

```java
import com.telnyx.sdk.models.rooms.actions.ActionRefreshClientTokenParams;
import com.telnyx.sdk.models.rooms.actions.ActionRefreshClientTokenResponse;

ActionRefreshClientTokenParams params = ActionRefreshClientTokenParams.builder()
    .roomId("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0")
    .refreshToken("eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0ZWxueXhfdGVsZXBob255IiwiZXhwIjoxNTkwMDEwMTQzLCJpYXQiOjE1ODc1OTA5NDMsImlzcyI6InRlbG55eF90ZWxlcGhvbnkiLCJqdGkiOiJiOGM3NDgzNy1kODllLTRhNjUtOWNmMi0zNGM3YTZmYTYwYzgiLCJuYmYiOjE1ODc1OTA5NDIsInN1YiI6IjVjN2FjN2QwLWRiNjUtNGYxMS05OGUxLWVlYzBkMWQ1YzZhZSIsInRlbF90b2tlbiI6InJqX1pra1pVT1pNeFpPZk9tTHBFVUIzc2lVN3U2UmpaRmVNOXMtZ2JfeENSNTZXRktGQUppTXlGMlQ2Q0JSbWxoX1N5MGlfbGZ5VDlBSThzRWlmOE1USUlzenl6U2xfYURuRzQ4YU81MHlhSEd1UlNZYlViU1ltOVdJaVEwZz09IiwidHlwIjoiYWNjZXNzIn0.gNEwzTow5MLLPLQENytca7pUN79PmPj6FyqZWW06ZeEmesxYpwKh0xRtA0TzLh6CDYIRHrI8seofOO0YFGDhpQ")
    .build();
ActionRefreshClientTokenResponse response = client.rooms().actions().refreshClientToken(params);
```

Returns: `token` (string), `token_expires_at` (date-time)

## View a list of room sessions.

`GET /rooms/{room_id}/sessions`

```java
import com.telnyx.sdk.models.rooms.sessions.SessionList1Page;
import com.telnyx.sdk.models.rooms.sessions.SessionList1Params;

SessionList1Page page = client.rooms().sessions().list1("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0");
```

Returns: `active` (boolean), `created_at` (date-time), `ended_at` (date-time), `id` (uuid), `participants` (array[object]), `record_type` (string), `room_id` (uuid), `updated_at` (date-time)
