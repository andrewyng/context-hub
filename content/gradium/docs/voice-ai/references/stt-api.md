# Gradium STT API Reference

## WebSocket Endpoint

**URL:** `wss://{region}.api.gradium.ai/api/speech/asr`

**Authentication:** `x-api-key` header on connection.

### Message Flow

```
Client                          Server
  |--- Setup ------------------>|
  |<------------------ Ready ---|
  |--- Audio ------------------>|
  |<------------------ Step  ---|  (VAD every 80ms)
  |--- Audio ------------------>|
  |<------------------ Text  ---|  (transcription)
  |<-------------- EndText   ---|
  |--- Flush ------------------>|
  |<--------------- Flushed  ---|
  |--- EndOfStream ------------>|
  |<------------ EndOfStream ---|
```

### Setup Message (Client → Server)

Must be the first message.

```json
{
  "type": "setup",
  "model_name": "default",
  "input_format": "pcm",
  "json_config": "{\"language\": \"en\"}"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"setup"` |
| `model_name` | string | Yes | STT model (default: `"default"`) |
| `input_format` | string | Yes | `pcm`, `wav`, or `opus` |
| `json_config` | string | No | JSON string with advanced STT settings (see below) |

**STT `json_config` parameters:**

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `text` | 0 to 1 | — | Temperature for text generation |
| `language` | string | — | Expected language (e.g., `"en"`, `"fr"`, `"de"`, `"es"`, `"pt"`) |
| `delay_in_frames` | int | — | Context gathering delay. Valid values: 7, 8, 10, 12, 14, 16, 20, 24, 36, 48 |

### Ready Message (Server → Client)

```json
{
  "type": "ready",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "model_name": "default",
  "sample_rate": 24000,
  "frame_size": 1920,
  "delay_in_frames": 0,
  "text_stream_names": []
}
```

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | string | Unique session identifier |
| `model_name` | string | STT model in use |
| `sample_rate` | int | Expected sample rate (typically 24000 Hz) |
| `frame_size` | int | Samples per processing frame (typically 1920 = 80ms at 24kHz) |
| `delay_in_frames` | int | Model processing delay in frames |
| `text_stream_names` | array | Available text stream names |

### Audio Message (Client → Server)

```json
{
  "type": "audio",
  "audio": "base64_encoded_audio_data..."
}
```

**PCM audio requirements:**

| Spec | Value |
|------|-------|
| Sample Rate | 24,000 Hz |
| Format | PCM 16-bit signed integer (little-endian) |
| Channels | Mono |
| Recommended chunk | 1,920 samples (80ms at 24kHz) = 3,840 bytes |

**WAV input:** Must use PCM format (`AudioFormat=1`). Supports 16, 24, and 32 bits per sample.

**Opus input:** Ogg-wrapped Opus data stream.

### Text Response (Server → Client)

```json
{
  "type": "text",
  "text": "Hello world",
  "start_s": 0.5,
  "stream_id": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Transcribed text |
| `start_s` | float | Start time in seconds |
| `stream_id` | int/null | Stream identifier for concurrent streams |

### EndText Response (Server → Client)

Sent when a text segment's end timestamp is available.

```json
{
  "type": "end_text",
  "stop_s": 2.5,
  "stream_id": null
}
```

### VAD (Voice Activity Detection) Response (Server → Client)

Emitted every 80ms (one per audio frame).

```json
{
  "type": "step",
  "vad": [
    {"horizon_s": 0.5, "inactivity_prob": 0.05},
    {"horizon_s": 1.0, "inactivity_prob": 0.08},
    {"horizon_s": 2.0, "inactivity_prob": 0.12}
  ],
  "step_idx": 5,
  "step_duration_s": 0.08,
  "total_duration_s": 0.4
}
```

| Field | Type | Description |
|-------|------|-------------|
| `vad` | array | VAD predictions at different time horizons |
| `vad[].horizon_s` | float | Lookahead duration in seconds |
| `vad[].inactivity_prob` | float | Probability that speech has ended by this horizon |
| `step_idx` | int | Step index (increments every 80ms) |
| `step_duration_s` | float | Duration of this step (typically 0.08s) |
| `total_duration_s` | float | Total audio processed so far |

#### Using VAD for Turn-Taking

The recommended approach for detecting end-of-turn:

```python
# Use the third prediction (2-second horizon) as turn-taking indicator
turn_ended = msg["vad"][2]["inactivity_prob"] > 0.5
```

**Reactive turn-around with flush:**

When VAD indicates turn end, the model may still have `delay_in_frames` of audio buffered. To get faster responses:

1. Send `delay_in_frames` chunks of silence (zero-filled audio)
2. If sent faster than real-time, the API processes them faster
3. This significantly reduces turn-around latency

### Flush Message (Client → Server)

Request the server to flush buffered audio and return all pending transcriptions.

```json
{
  "type": "flush",
  "flush_id": "1"
}
```

### Flushed Response (Server → Client)

```json
{
  "type": "flushed",
  "flush_id": "1"
}
```

### EndOfStream (Bidirectional)

```json
{
  "type": "end_of_stream"
}
```

**Client → Server:** No more audio will be sent. Server processes remaining audio and returns final results.

**Server → Client:** All transcription results have been sent. Connection will close.

### Error Message (Server → Client)

```json
{
  "type": "error",
  "message": "Error description",
  "code": 1008
}
```

| Code | Meaning |
|------|---------|
| 1008 | Policy violation (invalid API key, missing setup, invalid audio format) |
| 1011 | Internal server error |

---

## Complete STT Example with VAD

```python
import asyncio
import websockets
import json
import base64
import struct

async def stt_with_vad(audio_data, api_key):
    uri = "wss://eu.api.gradium.ai/api/speech/asr"
    headers = {"x-api-key": api_key}

    async with websockets.connect(uri, extra_headers=headers) as ws:
        # Setup
        await ws.send(json.dumps({
            "type": "setup",
            "model_name": "default",
            "input_format": "pcm"
        }))

        ready = json.loads(await ws.recv())
        frame_size = ready["frame_size"]  # 1920
        delay_in_frames = ready["delay_in_frames"]

        # Send audio in chunks
        chunk_bytes = frame_size * 2  # 16-bit = 2 bytes/sample
        for i in range(0, len(audio_data), chunk_bytes):
            chunk = audio_data[i:i + chunk_bytes]
            await ws.send(json.dumps({
                "type": "audio",
                "audio": base64.b64encode(chunk).decode()
            }))

            # Process any incoming messages (non-blocking)
            try:
                while True:
                    msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=0.01))
                    if msg["type"] == "text":
                        print(f"Transcript: {msg['text']} (at {msg['start_s']}s)")
                    elif msg["type"] == "step":
                        vad_prob = msg["vad"][2]["inactivity_prob"]
                        if vad_prob > 0.5:
                            print(f"Turn ended (prob={vad_prob:.2f})")
            except asyncio.TimeoutError:
                pass

        # End stream
        await ws.send(json.dumps({"type": "end_of_stream"}))

        # Collect remaining results
        while True:
            msg = json.loads(await ws.recv())
            if msg["type"] == "text":
                print(f"Final: {msg['text']}")
            elif msg["type"] == "end_of_stream":
                break
```
