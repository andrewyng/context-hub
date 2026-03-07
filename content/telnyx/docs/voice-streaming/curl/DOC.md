---
name: voice-streaming
description: "Stream call audio in real-time, fork media to external destinations, and transcribe speech live. Use for real-time analytics and AI integrations."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,voice,streaming,transcription,real-time"
---

# Telnyx Voice Streaming REST API Coding Guidelines

You are a Telnyx Voice Streaming API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

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

## Forking start

Call forking allows you to stream the media from a call to a specific target in realtime. This stream can be used to enable realtime audio analysis to support a 
variety of use cases, including fraud detection, or the creation of AI-generated audio responses. Requests must specify either the `target` attribute or the `rx` and `tx` attributes.

`POST /calls/{call_control_id}/actions/fork_start`

Optional: `client_state` (string), `command_id` (string), `rx` (string), `stream_type` (enum: decrypted), `tx` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "rx": "udp:192.0.2.1:9000",
  "stream_type": "decrypted",
  "tx": "udp:192.0.2.1:9001",
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901"
}' \
  "https://api.telnyx.com/v2/calls/{call_control_id}/actions/fork_start"
```

Returns: `result` (string)

## Forking stop

Stop forking a call. **Expected Webhooks:**

- `call.fork.stopped`

`POST /calls/{call_control_id}/actions/fork_stop`

Optional: `client_state` (string), `command_id` (string), `stream_type` (enum: raw, decrypted)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "stream_type": "decrypted"
}' \
  "https://api.telnyx.com/v2/calls/{call_control_id}/actions/fork_stop"
```

Returns: `result` (string)

## Streaming start

Start streaming the media from a call to a specific WebSocket address or Dialogflow connection in near-realtime. Audio will be delivered as base64-encoded RTP payload (raw audio), wrapped in JSON payloads. Please find more details about media streaming messages specification under the [link](https://developers.telnyx.com/docs/voice/programmable-voice/media-streaming).

`POST /calls/{call_control_id}/actions/streaming_start`

Optional: `client_state` (string), `command_id` (string), `custom_parameters` (array[object]), `dialogflow_config` (object), `enable_dialogflow` (boolean), `stream_auth_token` (string), `stream_bidirectional_codec` (enum: PCMU, PCMA, G722, OPUS, AMR-WB, L16), `stream_bidirectional_mode` (enum: mp3, rtp), `stream_bidirectional_sampling_rate` (enum: 8000, 16000, 22050, 24000, 48000), `stream_bidirectional_target_legs` (enum: both, self, opposite), `stream_codec` (enum: PCMU, PCMA, G722, OPUS, AMR-WB, L16, default), `stream_track` (enum: inbound_track, outbound_track, both_tracks), `stream_url` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "stream_url": "wss://www.example.com/websocket",
  "stream_track": "both_tracks",
  "stream_codec": "PCMA",
  "stream_bidirectional_mode": "rtp",
  "stream_bidirectional_codec": "G722",
  "stream_bidirectional_target_legs": "both",
  "stream_bidirectional_sampling_rate": 16000,
  "enable_dialogflow": true,
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "custom_parameters": [
    {
      "name": "param1",
      "value": "value1"
    },
    {
      "name": "param2",
      "value": "value2"
    }
  ],
  "stream_auth_token": "your-auth-token"
}' \
  "https://api.telnyx.com/v2/calls/{call_control_id}/actions/streaming_start"
```

Returns: `result` (string)

## Streaming stop

Stop streaming a call to a WebSocket. **Expected Webhooks:**

- `streaming.stopped`

`POST /calls/{call_control_id}/actions/streaming_stop`

Optional: `client_state` (string), `command_id` (string), `stream_id` (uuid)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901",
  "stream_id": "1edb94f9-7ef0-4150-b502-e0ebadfd9491"
}' \
  "https://api.telnyx.com/v2/calls/{call_control_id}/actions/streaming_stop"
```

Returns: `result` (string)

## Transcription start

Start real-time transcription. Transcription will stop on call hang-up, or can be initiated via the Transcription stop command. **Expected Webhooks:**

- `call.transcription`

`POST /calls/{call_control_id}/actions/transcription_start`

Optional: `client_state` (string), `command_id` (string), `transcription_engine` (enum: Google, Telnyx, Deepgram, Azure, A, B), `transcription_engine_config` (object), `transcription_tracks` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "transcription_engine": "Google",
  "client_state": "aGF2ZSBhIG5pY2UgZGF5ID1d",
  "transcription_tracks": "both",
  "command_id": "891510ac-f3e4-11e8-af5b-de00688a4901"
}' \
  "https://api.telnyx.com/v2/calls/{call_control_id}/actions/transcription_start"
```

Returns: `result` (string)

## Transcription stop

Stop real-time transcription.

`POST /calls/{call_control_id}/actions/transcription_stop`

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
  "https://api.telnyx.com/v2/calls/{call_control_id}/actions/transcription_stop"
```

Returns: `result` (string)

---

## Webhooks

The following webhook events are sent to your configured webhook URL.
All webhooks include `telnyx-timestamp` and `telnyx-signature-ed25519` headers for verification (Standard Webhooks compatible).

| Event | Description |
|-------|-------------|
| `callForkStarted` | Call Fork Started |
| `callForkStopped` | Call Fork Stopped |
| `callStreamingFailed` | Call Streaming Failed |
| `callStreamingStarted` | Call Streaming Started |
| `callStreamingStopped` | Call Streaming Stopped |
| `transcription` | Transcription |

### Webhook payload fields

**`callForkStarted`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: call.fork.started | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_control_id` | string | Unique ID for controlling the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.stream_type` | enum: decrypted | Type of media streamed. |

**`callForkStopped`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: call.fork.stopped | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_control_id` | string | Unique ID for controlling the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.stream_type` | enum: decrypted | Type of media streamed. |

**`callStreamingFailed`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the resource. |
| `data.event_type` | enum: streaming.failed | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.failure_reason` | string | A short description explaning why the media streaming failed. |
| `data.payload.stream_id` | uuid | Identifies the streaming. |
| `data.payload.stream_type` | enum: websocket, dialogflow | The type of stream connection the stream is performing. |

**`callStreamingStarted`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: streaming.started | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.stream_url` | string | Destination WebSocket address where the stream is going to be delivered. |

**`callStreamingStopped`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: streaming.stopped | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.stream_url` | string | Destination WebSocket address where the stream is going to be delivered. |

**`transcription`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: call.transcription | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Unique identifier and token for controlling the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | Use this field to add state to every subsequent webhook. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
