# Gradium TTS API Reference

## POST Endpoint

**URL:** `POST https://{region}.api.gradium.ai/api/post/speech/tts`

**Headers:**
- `x-api-key: your_api_key` (required)
- `Content-Type: application/json`

### Request Body

```json
{
  "text": "Hello, this is a test.",
  "voice_id": "YTpq7expH9539ERJ",
  "output_format": "wav",
  "model_name": "default",
  "json_config": "{\"padding_bonus\": -1.2}",
  "only_audio": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Text to convert to speech |
| `voice_id` | string | Yes | Voice ID (e.g., `YTpq7expH9539ERJ` for Emma) |
| `output_format` | string | Yes | Audio format: `wav`, `pcm`, `opus`, `ulaw_8000`, `alaw_8000`, `pcm_8000`, `pcm_16000`, `pcm_24000` |
| `model_name` | string | No | TTS model name (default: `"default"`) |
| `json_config` | string | No | JSON string with advanced parameters |
| `only_audio` | boolean | No | `true` returns raw audio bytes; `false`/omitted returns JSON message stream |

### Response

When `only_audio` is `true`: raw audio bytes in the requested format.

Content types by format:
- `audio/wav` for WAV
- `audio/ogg` for Opus (Ogg-wrapped)
- `audio/pcm` for raw PCM

When `only_audio` is `false`: streaming JSON messages in the same format as the WebSocket endpoint.

### POST vs WebSocket

| Feature | POST | WebSocket |
|---------|------|-----------|
| Input | Complete text in one request | Streamed text chunks |
| Output | Streamed audio response | Streamed audio response |
| Latency | Higher (waits for full text) | Lower (processes as text arrives) |
| Use case | Batch/simple conversions | Interactive/real-time apps |

---

## WebSocket Endpoint

**URL:** `wss://{region}.api.gradium.ai/api/speech/tts`

**Authentication:** `x-api-key` header on connection.

### Message Flow

```
Client                          Server
  |--- Setup ------------------>|
  |<------------------ Ready ---|
  |--- Text ------------------->|
  |<------------------ Audio ---|
  |<------------------ Audio ---|
  |<------------------ Text  ---|
  |--- Text ------------------->|
  |<------------------ Audio ---|
  |--- EndOfStream ------------>|
  |<------------------ Audio ---|
  |<------------ EndOfStream ---|
```

### Setup Message (Client → Server)

Must be the first message sent after connection.

```json
{
  "type": "setup",
  "model_name": "default",
  "voice_id": "YTpq7expH9539ERJ",
  "output_format": "wav",
  "pronunciation_id": "dict_abc123",
  "close_ws_on_eos": false,
  "json_config": "{\"padding_bonus\": -1.2}"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"setup"` |
| `model_name` | string | Yes | TTS model (default: `"default"`) |
| `voice_id` | string | Yes | Voice ID from library or custom voice |
| `output_format` | string | Yes | `wav`, `pcm`, or `opus` |
| `pronunciation_id` | string | No | UID of a pronunciation dictionary to apply |
| `close_ws_on_eos` | boolean | No | Set `false` to keep connection open for multiplexing (default: `true`) |
| `json_config` | string | No | JSON string with advanced TTS parameters |

### Ready Message (Server → Client)

```json
{
  "type": "ready",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Text Message (Client → Server)

```json
{
  "type": "text",
  "text": "Hello, world!"
}
```

Send multiple text messages in sequence. The server streams audio as it processes.

### Audio Response (Server → Client)

```json
{
  "type": "audio",
  "audio": "base64_encoded_audio_data..."
}
```

**Audio specs by format:**

| Format | Sample Rate | Bit Depth | Channels | Chunk Size |
|--------|-------------|-----------|----------|------------|
| `wav` | 48kHz | 16-bit signed int | Mono | WAV-wrapped chunks |
| `pcm` | 48kHz | 16-bit signed int | Mono | 3840 samples (80ms) |
| `opus` | — | — | — | Ogg-wrapped Opus |

Additional telephony formats: `ulaw_8000`, `alaw_8000`, `pcm_8000`, `pcm_16000`, `pcm_24000`.

### Text Response (Server → Client)

Word-level timestamps for the generated audio.

```json
{
  "type": "text",
  "text": "Hello",
  "start_s": 0.2,
  "stop_s": 0.6
}
```

### EndOfStream (Bidirectional)

```json
{
  "type": "end_of_stream"
}
```

**Client → Server:** Signals no more text will be sent. Server processes remaining text, sends final audio chunks, then its own `end_of_stream`, and closes the connection.

**Server → Client:** Indicates all audio has been sent.

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
| 1008 | Policy violation (invalid API key, missing setup) |
| 1011 | Internal server error |

---

## Advanced Configuration (json_config)

Pass as a JSON string in both POST and WebSocket setup:

```json
{
  "padding_bonus": -1.2,
  "temp": 0.7,
  "cfg_coef": 2.0,
  "rewrite_rules": "en"
}
```

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `padding_bonus` | -4.0 to 4.0 | 0 | Speech pace (negative = faster, positive = slower) |
| `temp` | 0 to 1.4 | 0.7 | Variation/expressiveness |
| `cfg_coef` | 1.0 to 4.0 | 2.0 | How closely output matches the voice |
| `rewrite_rules` | string | — | Language alias for text normalization |

### Rewrite Rules

Language aliases enable automatic normalization of dates, times, numbers, emails, URLs, and phone numbers:

| Alias | Rules Applied |
|-------|---------------|
| `en` | TimeEn, Date, AlNum, NumberEn, EmailEn, UrlEn, PhoneEn |
| `fr` | TimeFr, Date, AlNum, NumberFr, EmailFr, UrlFr, PhoneFr |
| `de` | TimeDe, Date, AlNum, NumberDe, EmailDe, UrlDe, PhoneDe |
| `es` | Date, AlNum, NumberEs, EmailEs, UrlEs, PhoneEs |
| `pt` | Date, AlNum, NumberPt, EmailPt, UrlPt, PhonePt |

**Individual rules** can also be specified directly instead of using a language alias. Available rules: `Date`, `TimeEn`, `TimeFr`, `TimeDe`, `AlNum`, `NumberEn`, `NumberFr`, `NumberDe`, `NumberEs`, `NumberPt`, `EmailEn`, `EmailFr`, `EmailDe`, `EmailEs`, `EmailPt`, `UrlEn`, `UrlFr`, `UrlDe`, `UrlEs`, `UrlPt`, `PhoneEn`, `PhoneFr`, `PhoneDe`, `PhoneEs`, `PhonePt`.

These rules normalize dates, times, numbers, email addresses, URLs, and phone numbers into speakable text before synthesis.

### Text Control Tags

Inline tags for fine-grained control within text:

- `<flush>` — Forces immediate audio generation for text accumulated so far
- `<break time="X.Xs" />` — Inserts silence (0.1s to 2.0s)

Example:
```
"Welcome to Gradium.<break time=\"1.0s\" />Let me tell you about our features.<flush>More text here."
```

---

## Multiplexing

Send concurrent requests over a single WebSocket using `close_ws_on_eos: false` in setup and `client_req_id` for tracking:

```json
{
  "type": "setup",
  "voice_id": "YTpq7expH9539ERJ",
  "model_name": "default",
  "output_format": "wav",
  "close_ws_on_eos": false
}
```

Then include `client_req_id` in text and end_of_stream messages to match requests with responses. The server echoes `client_req_id` in all corresponding response messages (audio, text, end_of_stream).

```json
{
  "type": "text",
  "text": "Hello, world!",
  "client_req_id": "req-001"
}
```

---

## Word-Level Timestamps

The server returns `text` messages alongside audio chunks containing word-level timing:

```json
{
  "type": "text",
  "text": "Hello",
  "start_s": 0.2,
  "stop_s": 0.6
}
```

Use the `text_with_timestamps` feature for precise synchronization between audio and text (e.g., for subtitles or lip-sync).

---

## Flagship Voices

14 flagship voices across 5 languages, plus 200+ additional catalog voices.

| Name | Language |
|------|----------|
| Emma | US English |
| Kent | US English |
| Sydney | US English |
| John | US English |
| Eva | GB English |
| Jack | GB English |
| Elise | French |
| Leo | French |
| Mia | German |
| Maximilian | German |
| Valentina | Mexican Spanish |
| Sergio | Spanish |
| Alice | Brazilian Portuguese |
| Davi | Brazilian Portuguese |

Use `GET /voices/?include_catalog=true` to retrieve voice IDs for the full catalog.
