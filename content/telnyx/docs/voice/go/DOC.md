---
name: voice
description: "Make and receive calls, transfer, bridge, and manage call lifecycle with Call Control. Includes application management and call events."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,voice,call-control,telephony,sip,calls"
---

# Telnyx Voice Go SDK Coding Guidelines

You are a Telnyx Voice API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

## Golden Rule: Use the Official SDK

Always use the official `github.com/team-telnyx/telnyx-go` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import "github.com/team-telnyx/telnyx-go"`
- **Incorrect:** unofficial Go clients or raw HTTP calls

## Installation

```bash
go get github.com/team-telnyx/telnyx-go
```

## Setup

```go
import (
  "context"
  "fmt"
  "os"

  "github.com/team-telnyx/telnyx-go"
  "github.com/team-telnyx/telnyx-go/option"
)

client := telnyx.NewClient(
  option.WithAPIKey(os.Getenv("TELNYX_API_KEY")),
)
```

All examples below assume `client` is already initialized as shown above.

## List call control applications

Return a list of call control applications.

`GET /call_control_applications`

```go
	page, err := client.CallControlApplications.List(context.TODO(), telnyx.CallControlApplicationListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, London, UK, Chennai, IN, Amsterdam, Netherlands, Toronto, Canada, Sydney, Australia), `application_name` (string), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: call_control_application), `redact_dtmf_debug_logging` (boolean), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (url), `webhook_event_url` (url), `webhook_timeout_secs` (integer | null)

## Create a call control application

Create a call control application.

`POST /call_control_applications` — Required: `application_name`, `webhook_event_url`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, London, UK, Chennai, IN, Amsterdam, Netherlands, Toronto, Canada, Sydney, Australia), `call_cost_in_webhooks` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `inbound` (object), `outbound` (object), `redact_dtmf_debug_logging` (boolean), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (url), `webhook_timeout_secs` (integer | null)

```go
	callControlApplication, err := client.CallControlApplications.New(context.TODO(), telnyx.CallControlApplicationNewParams{
		ApplicationName: "call-router",
		WebhookEventURL: "https://example.com",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", callControlApplication.Data)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, London, UK, Chennai, IN, Amsterdam, Netherlands, Toronto, Canada, Sydney, Australia), `application_name` (string), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: call_control_application), `redact_dtmf_debug_logging` (boolean), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (url), `webhook_event_url` (url), `webhook_timeout_secs` (integer | null)

## Retrieve a call control application

Retrieves the details of an existing call control application.

`GET /call_control_applications/{id}`

```go
	callControlApplication, err := client.CallControlApplications.Get(context.TODO(), "1293384261075731499")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", callControlApplication.Data)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, London, UK, Chennai, IN, Amsterdam, Netherlands, Toronto, Canada, Sydney, Australia), `application_name` (string), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: call_control_application), `redact_dtmf_debug_logging` (boolean), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (url), `webhook_event_url` (url), `webhook_timeout_secs` (integer | null)

## Update a call control application

Updates settings of an existing call control application.

`PATCH /call_control_applications/{id}` — Required: `application_name`, `webhook_event_url`

Optional: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, London, UK, Chennai, IN, Amsterdam, Netherlands, Toronto, Canada, Sydney, Australia), `call_cost_in_webhooks` (boolean), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `inbound` (object), `outbound` (object), `redact_dtmf_debug_logging` (boolean), `tags` (array[string]), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (url), `webhook_timeout_secs` (integer | null)

```go
	callControlApplication, err := client.CallControlApplications.Update(
		context.TODO(),
		"1293384261075731499",
		telnyx.CallControlApplicationUpdateParams{
			ApplicationName: "call-router",
			WebhookEventURL: "https://example.com",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", callControlApplication.Data)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, London, UK, Chennai, IN, Amsterdam, Netherlands, Toronto, Canada, Sydney, Australia), `application_name` (string), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: call_control_application), `redact_dtmf_debug_logging` (boolean), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (url), `webhook_event_url` (url), `webhook_timeout_secs` (integer | null)

## Delete a call control application

Deletes a call control application.

`DELETE /call_control_applications/{id}`

```go
	callControlApplication, err := client.CallControlApplications.Delete(context.TODO(), "1293384261075731499")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", callControlApplication.Data)
```

Returns: `active` (boolean), `anchorsite_override` (enum: Latency, Chicago, IL, Ashburn, VA, San Jose, CA, London, UK, Chennai, IN, Amsterdam, Netherlands, Toronto, Canada, Sydney, Australia), `application_name` (string), `call_cost_in_webhooks` (boolean), `created_at` (string), `dtmf_type` (enum: RFC 2833, Inband, SIP INFO), `first_command_timeout` (boolean), `first_command_timeout_secs` (integer), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: call_control_application), `redact_dtmf_debug_logging` (boolean), `tags` (array[string]), `updated_at` (string), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (url), `webhook_event_url` (url), `webhook_timeout_secs` (integer | null)

## Dial

Dial a number or SIP URI from a given connection. A successful response will include a `call_leg_id` which can be used to correlate the command with subsequent webhooks.

`POST /calls` — Required: `connection_id`, `to`, `from`

Optional: `answering_machine_detection` (enum: premium, detect, detect_beep, detect_words, greeting_end, disabled), `answering_machine_detection_config` (object), `audio_url` (string), `billing_group_id` (uuid), `bridge_intent` (boolean), `bridge_on_answer` (boolean), `client_state` (string), `command_id` (string), `conference_config` (object), `custom_headers` (array[object]), `dialogflow_config` (object), `enable_dialogflow` (boolean), `from_display_name` (string), `link_to` (string), `media_encryption` (enum: disabled, SRTP, DTLS), `media_name` (string), `park_after_unbridge` (string), `preferred_codecs` (string), `record` (enum: record-from-answer), `record_channels` (enum: single, dual), `record_custom_file_name` (string), `record_format` (enum: wav, mp3), `record_max_length` (int32), `record_timeout_secs` (int32), `record_track` (enum: both, inbound, outbound), `record_trim` (enum: trim-silence), `send_silence_when_idle` (boolean), `sip_auth_password` (string), `sip_auth_username` (string), `sip_headers` (array[object]), `sip_region` (enum: US, Europe, Canada, Australia, Middle East), `sip_transport_protocol` (enum: UDP, TCP, TLS), `sound_modifications` (object), `stream_auth_token` (string), `stream_bidirectional_codec` (enum: PCMU, PCMA, G722, OPUS, AMR-WB, L16), `stream_bidirectional_mode` (enum: mp3, rtp), `stream_bidirectional_sampling_rate` (enum: 8000, 16000, 22050, 24000, 48000), `stream_bidirectional_target_legs` (enum: both, self, opposite), `stream_codec` (enum: PCMU, PCMA, G722, OPUS, AMR-WB, L16, default), `stream_establish_before_call_originate` (boolean), `stream_track` (enum: inbound_track, outbound_track, both_tracks), `stream_url` (string), `supervise_call_control_id` (string), `supervisor_role` (enum: barge, whisper, monitor), `time_limit_secs` (int32), `timeout_secs` (int32), `transcription` (boolean), `transcription_config` (object), `webhook_url` (string), `webhook_url_method` (enum: POST, GET)

```go
	response, err := client.Calls.Dial(context.TODO(), telnyx.CallDialParams{
		ConnectionID: "7267xxxxxxxxxxxxxx",
		From:         "+18005550101",
		To: telnyx.CallDialParamsToUnion{
			OfString: telnyx.String("+18005550100"),
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `call_control_id` (string), `call_duration` (integer), `call_leg_id` (string), `call_session_id` (string), `client_state` (string), `end_time` (string), `is_alive` (boolean), `record_type` (enum: call), `recording_id` (uuid), `start_time` (string)

## Retrieve a call status

Returns the status of a call (data is available 10 minutes after call ended).

`GET /calls/{call_control_id}`

```go
	response, err := client.Calls.GetStatus(context.TODO(), "call_control_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `call_control_id` (string), `call_duration` (integer), `call_leg_id` (string), `call_session_id` (string), `client_state` (string), `end_time` (string), `is_alive` (boolean), `record_type` (enum: call), `start_time` (string)

## Answer call

Answer an incoming call. You must issue this command before executing subsequent commands on an incoming call. **Expected Webhooks:**

- `call.answered`
- `streaming.started`, `streaming.stopped` or `streaming.failed` if `stream_url` was set

When the `record` parameter is set to `record-from-answer`, the response will include a `recording_id` field.

`POST /calls/{call_control_id}/actions/answer`

Optional: `billing_group_id` (uuid), `client_state` (string), `command_id` (string), `custom_headers` (array[object]), `preferred_codecs` (enum: G722,PCMU,PCMA,G729,OPUS,VP8,H264), `record` (enum: record-from-answer), `record_channels` (enum: single, dual), `record_custom_file_name` (string), `record_format` (enum: wav, mp3), `record_max_length` (int32), `record_timeout_secs` (int32), `record_track` (enum: both, inbound, outbound), `record_trim` (enum: trim-silence), `send_silence_when_idle` (boolean), `sip_headers` (array[object]), `sound_modifications` (object), `stream_bidirectional_codec` (enum: PCMU, PCMA, G722, OPUS, AMR-WB, L16), `stream_bidirectional_mode` (enum: mp3, rtp), `stream_bidirectional_target_legs` (enum: both, self, opposite), `stream_codec` (enum: PCMU, PCMA, G722, OPUS, AMR-WB, L16, default), `stream_track` (enum: inbound_track, outbound_track, both_tracks), `stream_url` (string), `transcription` (boolean), `transcription_config` (object), `webhook_retries_policies` (object), `webhook_url` (string), `webhook_url_method` (enum: POST, GET), `webhook_urls` (object), `webhook_urls_method` (enum: POST, GET)

```go
	response, err := client.Calls.Actions.Answer(
		context.TODO(),
		"call_control_id",
		telnyx.CallActionAnswerParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `recording_id` (uuid), `result` (string)

## Bridge calls

Bridge two call control calls. **Expected Webhooks:**

- `call.bridged` for Leg A
- `call.bridged` for Leg B

`POST /calls/{call_control_id}/actions/bridge` — Required: `call_control_id`

Optional: `client_state` (string), `command_id` (string), `hold_after_unbridge` (boolean), `mute_dtmf` (enum: none, both, self, opposite), `park_after_unbridge` (string), `play_ringtone` (boolean), `prevent_double_bridge` (boolean), `queue` (string), `record` (enum: record-from-answer), `record_channels` (enum: single, dual), `record_custom_file_name` (string), `record_format` (enum: wav, mp3), `record_max_length` (int32), `record_timeout_secs` (int32), `record_track` (enum: both, inbound, outbound), `record_trim` (enum: trim-silence), `ringtone` (enum: at, au, be, bg, br, ch, cl, cn, cz, de, dk, ee, es, fi, fr, gr, hu, il, in, it, jp, lt, mx, my, nl, no, nz, ph, pl, pt, ru, se, sg, th, tw, uk, us-old, us, ve, za), `video_room_context` (string), `video_room_id` (uuid)

```go
	response, err := client.Calls.Actions.Bridge(
		context.TODO(),
		"call_control_id",
		telnyx.CallActionBridgeParams{
			CallControlIDToBridgeWith: "v3:MdI91X4lWFEs7IgbBEOT9M4AigoY08M0WWZFISt1Yw2axZ_IiE4pqg",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `result` (string)

## Hangup call

Hang up the call. **Expected Webhooks:**

- `call.hangup`
- `call.recording.saved`

`POST /calls/{call_control_id}/actions/hangup`

Optional: `client_state` (string), `command_id` (string), `custom_headers` (array[object])

```go
	response, err := client.Calls.Actions.Hangup(
		context.TODO(),
		"call_control_id",
		telnyx.CallActionHangupParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `result` (string)

## SIP Refer a call

Initiate a SIP Refer on a Call Control call. You can initiate a SIP Refer at any point in the duration of a call. **Expected Webhooks:**

- `call.refer.started`
- `call.refer.completed`
- `call.refer.failed`

`POST /calls/{call_control_id}/actions/refer` — Required: `sip_address`

Optional: `client_state` (string), `command_id` (string), `custom_headers` (array[object]), `sip_auth_password` (string), `sip_auth_username` (string), `sip_headers` (array[object])

```go
	response, err := client.Calls.Actions.Refer(
		context.TODO(),
		"call_control_id",
		telnyx.CallActionReferParams{
			SipAddress: "sip:username@sip.non-telnyx-address.com",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `result` (string)

## Reject a call

Reject an incoming call. **Expected Webhooks:**

- `call.hangup`

`POST /calls/{call_control_id}/actions/reject` — Required: `cause`

Optional: `client_state` (string), `command_id` (string)

```go
	response, err := client.Calls.Actions.Reject(
		context.TODO(),
		"call_control_id",
		telnyx.CallActionRejectParams{
			Cause: telnyx.CallActionRejectParamsCauseUserBusy,
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `result` (string)

## Send SIP info

Sends SIP info from this leg. **Expected Webhooks:**

- `call.sip_info.received` (to be received on the target call leg)

`POST /calls/{call_control_id}/actions/send_sip_info` — Required: `content_type`, `body`

Optional: `client_state` (string), `command_id` (string)

```go
	response, err := client.Calls.Actions.SendSipInfo(
		context.TODO(),
		"call_control_id",
		telnyx.CallActionSendSipInfoParams{
			Body:        `{"key": "value", "numValue": 100}`,
			ContentType: "application/json",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `result` (string)

## Transfer call

Transfer a call to a new destination. If the transfer is unsuccessful, a `call.hangup` webhook for the other call (Leg B) will be sent indicating that the transfer could not be completed. The original call will remain active and may be issued additional commands, potentially transferring the call to an alternate destination.

`POST /calls/{call_control_id}/actions/transfer` — Required: `to`

Optional: `answering_machine_detection` (enum: premium, detect, detect_beep, detect_words, greeting_end, disabled), `answering_machine_detection_config` (object), `audio_url` (string), `client_state` (string), `command_id` (string), `custom_headers` (array[object]), `early_media` (boolean), `from` (string), `from_display_name` (string), `media_encryption` (enum: disabled, SRTP, DTLS), `media_name` (string), `mute_dtmf` (enum: none, both, self, opposite), `park_after_unbridge` (string), `preferred_codecs` (string), `record` (enum: record-from-answer), `record_channels` (enum: single, dual), `record_custom_file_name` (string), `record_format` (enum: wav, mp3), `record_max_length` (int32), `record_timeout_secs` (int32), `record_track` (enum: both, inbound, outbound), `record_trim` (enum: trim-silence), `sip_auth_password` (string), `sip_auth_username` (string), `sip_headers` (array[object]), `sip_region` (enum: US, Europe, Canada, Australia, Middle East), `sip_transport_protocol` (enum: UDP, TCP, TLS), `sound_modifications` (object), `target_leg_client_state` (string), `time_limit_secs` (int32), `timeout_secs` (int32), `webhook_retries_policies` (object), `webhook_url` (string), `webhook_url_method` (enum: POST, GET), `webhook_urls` (object), `webhook_urls_method` (enum: POST, GET)

```go
	response, err := client.Calls.Actions.Transfer(
		context.TODO(),
		"call_control_id",
		telnyx.CallActionTransferParams{
			To: "+18005550100",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `result` (string)

## List all active calls for given connection

Lists all active calls for given connection. Acceptable connections are either SIP connections with webhook_url or xml_request_url, call control or texml. Returned results are cursor paginated.

`GET /connections/{connection_id}/active_calls`

```go
	page, err := client.Connections.ListActiveCalls(
		context.TODO(),
		"1293384261075731461",
		telnyx.ConnectionListActiveCallsParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `call_control_id` (string), `call_duration` (integer), `call_leg_id` (string), `call_session_id` (string), `client_state` (string), `record_type` (enum: call)

---

## Webhooks

The following webhook events are sent to your configured webhook URL.
All webhooks include `telnyx-timestamp` and `telnyx-signature-ed25519` headers for verification (Standard Webhooks compatible).

| Event | Description |
|-------|-------------|
| `callAnswered` | Call Answered |
| `callBridged` | Call Bridged |
| `callHangup` | Call Hangup |
| `callInitiated` | Call Initiated |

### Webhook payload fields

**`callAnswered`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: call.answered | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.custom_headers` | array[object] | Custom headers set on answer command |
| `data.payload.sip_headers` | array[object] | User-to-User and Diversion headers from sip invite. |
| `data.payload.from` | string | Number or SIP URI placing the call. |
| `data.payload.to` | string | Destination number or SIP URI of the call. |
| `data.payload.start_time` | date-time | ISO 8601 datetime of when the call started. |
| `data.payload.state` | enum: answered | State received from a command. |
| `data.payload.tags` | array[string] | Array of tags associated to number. |

**`callBridged`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: call.bridged | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.from` | string | Number or SIP URI placing the call. |
| `data.payload.to` | string | Destination number or SIP URI of the call. |

**`callHangup`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: call.hangup | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.custom_headers` | array[object] | Custom headers set on answer command |
| `data.payload.sip_headers` | array[object] | User-to-User and Diversion headers from sip invite. |
| `data.payload.from` | string | Number or SIP URI placing the call. |
| `data.payload.to` | string | Destination number or SIP URI of the call. |
| `data.payload.start_time` | date-time | ISO 8601 datetime of when the call started. |
| `data.payload.state` | enum: hangup | State received from a command. |
| `data.payload.tags` | array[string] | Array of tags associated to number. |
| `data.payload.hangup_cause` | enum: call_rejected, normal_clearing, originator_cancel, timeout, time_limit, user_busy, not_found, no_answer, unspecified | The reason the call was ended (`call_rejected`, `normal_clearing`, `originator_cancel`, `timeout`, `time_limit`, `use... |
| `data.payload.hangup_source` | enum: caller, callee, unknown | The party who ended the call (`callee`, `caller`, `unknown`). |
| `data.payload.sip_hangup_cause` | string | The reason the call was ended (SIP response code). |
| `data.payload.call_quality_stats` | object | null | Call quality statistics aggregated from the CHANNEL_HANGUP_COMPLETE event. |

**`callInitiated`**

| Field | Type | Description |
|-------|------|-------------|
| `data.record_type` | enum: event | Identifies the type of the resource. |
| `data.event_type` | enum: call.initiated | The type of event being delivered. |
| `data.id` | uuid | Identifies the type of resource. |
| `data.occurred_at` | date-time | ISO 8601 datetime of when the event occurred. |
| `data.payload.call_control_id` | string | Call ID used to issue commands via Call Control API. |
| `data.payload.connection_id` | string | Call Control App ID (formerly Telnyx connection ID) used in the call. |
| `data.payload.connection_codecs` | string | The list of comma-separated codecs enabled for the connection. |
| `data.payload.offered_codecs` | string | The list of comma-separated codecs offered by caller. |
| `data.payload.call_leg_id` | string | ID that is unique to the call and can be used to correlate webhook events. |
| `data.payload.custom_headers` | array[object] | Custom headers from sip invite |
| `data.payload.sip_headers` | array[object] | User-to-User and Diversion headers from sip invite. |
| `data.payload.shaken_stir_attestation` | string | SHAKEN/STIR attestation level. |
| `data.payload.shaken_stir_validated` | boolean | Whether attestation was successfully validated or not. |
| `data.payload.call_session_id` | string | ID that is unique to the call session and can be used to correlate webhook events. |
| `data.payload.client_state` | string | State received from a command. |
| `data.payload.caller_id_name` | string | Caller id. |
| `data.payload.call_screening_result` | string | Call screening result. |
| `data.payload.from` | string | Number or SIP URI placing the call. |
| `data.payload.to` | string | Destination number or SIP URI of the call. |
| `data.payload.direction` | enum: incoming, outgoing | Whether the call is `incoming` or `outgoing`. |
| `data.payload.state` | enum: parked, bridging | State received from a command. |
| `data.payload.start_time` | date-time | ISO 8601 datetime of when the call started. |
| `data.payload.tags` | array[string] | Array of tags associated to number. |
