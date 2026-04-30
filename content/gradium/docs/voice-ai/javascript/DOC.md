---
name: voice-ai
description: "Gradium Voice AI API for low-latency text-to-speech and speech-to-text with WebSocket streaming"
metadata:
  languages: "javascript"
  versions: "0.1.0"
  revision: 1
  source: community
  tags: "gradium,tts,stt,voice,speech,websocket,streaming"
  updated-on: "2026-03-10"
---

# Gradium Voice AI API Coding Guide

You are a Gradium API coding expert. Help with writing code that integrates the Gradium Text-to-Speech (TTS) and Speech-to-Text (STT) APIs.

Please follow the following guidelines when generating code.

You can find the official API documentation and code samples here:
https://docs.gradium.ai/

## Golden Rule: Use the Correct SDK or API

There is no official Gradium JavaScript/TypeScript SDK. Call the REST/WebSocket API directly using standard `fetch` and `WebSocket` APIs.

- **Incorrect:** Do not look for an `@gradium/sdk` or `gradium-js` npm package — none exists
- **Correct:** `fetch("https://eu.api.gradium.ai/api/post/speech/tts", { headers: { "x-api-key": apiKey } })`
- **Correct:** `new WebSocket("wss://eu.api.gradium.ai/api/speech/tts", { headers: { "x-api-key": apiKey } })`

## Initialization and API Key

All requests require an API key passed via the `x-api-key` header.

```javascript
const headers = { "x-api-key": process.env.GRADIUM_API_KEY };
```

## Base URLs

| Region | REST API | WebSocket |
|--------|----------|-----------|
| EU | `https://eu.api.gradium.ai/api` | `wss://eu.api.gradium.ai/api` |
| US | `https://us.api.gradium.ai/api` | `wss://us.api.gradium.ai/api` |

## Models

Use `"default"` as the model name for both TTS and STT:

- **TTS:** `model_name: "default"` — Low-latency, high-quality speech synthesis with time-to-first-token below 300ms
- **STT:** `model_name: "default"` — Real-time speech recognition with built-in Voice Activity Detection (VAD)

## Supported Languages

Gradium supports 5 languages across 200+ voices:

- English (US and GB accents)
- French
- German
- Spanish (European and Mexican)
- Portuguese (Brazilian)

## Audio Output Formats

**TTS output formats:**

| Format | Sample Rate | Details |
|--------|-------------|---------|
| `wav` | 48kHz | 16-bit signed integer, mono |
| `pcm` | 48kHz | 16-bit signed integer, mono, 3840 samples/chunk (80ms) |
| `opus` | — | Ogg-wrapped Opus |
| `ulaw_8000` | 8kHz | μ-law (for telephony/Twilio) |
| `alaw_8000` | 8kHz | A-law (for telephony) |
| `pcm_8000` | 8kHz | PCM |
| `pcm_16000` | 16kHz | PCM |
| `pcm_24000` | 24kHz | PCM |

**STT input formats:** `pcm` (24kHz, 16-bit mono), `wav` (16/24/32-bit PCM), `opus` (Ogg-wrapped)

## Basic Text-to-Speech

Convert text to speech using the POST endpoint:

```javascript
const response = await fetch("https://eu.api.gradium.ai/api/post/speech/tts", {
    method: "POST",
    headers: { "x-api-key": gradiumApiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
        text: "Hello, world!",
        voice_id: "YTpq7expH9539ERJ",
        output_format: "wav",
        only_audio: true,
    }),
});
const audioBuffer = await response.arrayBuffer();
```

**POST request body parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to convert to speech |
| `voice_id` | string | Yes | Voice ID from the catalog or a custom voice |
| `output_format` | string | Yes | Audio format (see table above) |
| `model_name` | string | No | TTS model (default: `"default"`) |
| `only_audio` | boolean | No | `true` returns raw audio bytes; `false` returns JSON message stream |
| `json_config` | string | No | JSON string with advanced settings (see [TTS Reference](references/tts-api.md)) |
| `pronunciation_id` | string | No | UID of a pronunciation dictionary to apply |

## Streaming TTS (WebSocket)

Stream audio in real-time as it's generated for lower latency.

**Connection:** `wss://{region}.api.gradium.ai/api/speech/tts`

**Flow:** Setup → Ready → Text/Audio streaming → EndOfStream

```javascript
const WebSocket = require("ws"); // Node.js; browsers use native WebSocket

const ws = new WebSocket("wss://eu.api.gradium.ai/api/speech/tts", {
    headers: { "x-api-key": gradiumApiKey },
});

ws.on("open", () => {
    ws.send(JSON.stringify({
        type: "setup", voice_id: "YTpq7expH9539ERJ",
        model_name: "default", output_format: "wav",
    }));
});

const audioChunks = [];
ws.on("message", (data) => {
    const msg = JSON.parse(data);
    if (msg.type === "ready") {
        ws.send(JSON.stringify({ type: "text", text: "Hello, world!" }));
        ws.send(JSON.stringify({ type: "end_of_stream" }));
    } else if (msg.type === "audio") {
        audioChunks.push(Buffer.from(msg.audio, "base64"));
    } else if (msg.type === "end_of_stream") {
        const fullAudio = Buffer.concat(audioChunks);
    }
});
```

**Setup parameters:** `voice_id`, `model_name`, `output_format`, `pronunciation_id` (optional), `close_ws_on_eos` (set `false` for multiplexing), `json_config` (optional).

See [TTS API Reference](references/tts-api.md) for message types, text control tags, multiplexing, and advanced configuration.

## Streaming STT (WebSocket)

Real-time speech-to-text with Voice Activity Detection.

**Connection:** `wss://{region}.api.gradium.ai/api/speech/asr`

**Flow:** Setup → Ready → Audio/Text streaming → EndOfStream

```javascript
const ws = new WebSocket("wss://eu.api.gradium.ai/api/speech/asr", {
    headers: { "x-api-key": gradiumApiKey },
});

ws.on("open", () => {
    ws.send(JSON.stringify({ type: "setup", model_name: "default", input_format: "pcm" }));
});

const transcripts = [];
ws.on("message", (data) => {
    const msg = JSON.parse(data);
    if (msg.type === "ready") {
        ws.send(JSON.stringify({ type: "audio", audio: base64Audio }));
        ws.send(JSON.stringify({ type: "end_of_stream" }));
    } else if (msg.type === "text") {
        transcripts.push(msg.text);
    } else if (msg.type === "end_of_stream") {
        console.log("Transcription:", transcripts.join(" "));
    }
});
```

**STT audio input requirements (PCM):** 24kHz, 16-bit signed integer, mono. Recommended 1,920 samples (80ms) per chunk.

See [STT API Reference](references/stt-api.md) for VAD usage, flush mechanism, and all message types.

## Voice Cloning

Clone a voice by uploading an audio file. **Minimum sample: 10 seconds** of clear speech.

```javascript
// Browser: from a recorded audio blob
const file = new File([wavBlob], "recording.wav", { type: "audio/wav" });
const response = await fetch("https://eu.api.gradium.ai/api/voice/clone", {
    method: "POST", headers: { "x-api-key": gradiumApiKey }, body: file,
});
const { voice_id } = await response.json();
```

```javascript
// Server-side (e.g., Next.js API route)
const formData = await req.formData();
const file = formData.get("audio");
const apiKey = req.headers.get("x-gradium-api-key") || process.env.GRADIUM_API_KEY;
const gradiumRes = await fetch("https://eu.api.gradium.ai/api/voice/clone", {
    method: "POST", headers: { "x-api-key": apiKey }, body: file,
});
const { voice_id } = await gradiumRes.json();
```

## Voice Management

Manage voices via the REST API. See [Voices API Reference](references/voices-api.md) for full details.

```javascript
// List all voices
const voices = await fetch("https://eu.api.gradium.ai/api/voices/?include_catalog=true", {
    headers: { "x-api-key": gradiumApiKey },
}).then((r) => r.json());

// Get a specific voice
const voice = await fetch("https://eu.api.gradium.ai/api/voices/abc123", {
    headers: { "x-api-key": gradiumApiKey },
}).then((r) => r.json());

// Delete a voice
await fetch("https://eu.api.gradium.ai/api/voices/abc123", {
    method: "DELETE",
    headers: { "x-api-key": gradiumApiKey },
});
```

**REST endpoints:** `POST /voices/`, `GET /voices/`, `GET /voices/{uid}`, `PUT /voices/{uid}`, `DELETE /voices/{uid}`

**Flagship voices:** Emma, Kent, Sydney, John (US English), Eva, Jack (GB English), Elise, Leo (French), Mia, Maximilian (German), Valentina (Mexican Spanish), Sergio (Spanish), Alice, Davi (Brazilian Portuguese) — plus 200+ catalog voices. Use `GET /voices/?include_catalog=true` to list all.

## Pronunciation Dictionaries

Custom text normalization rules for TTS. See [Pronunciations API Reference](references/pronunciations-api.md).

```javascript
const response = await fetch("https://eu.api.gradium.ai/api/pronunciations/", {
    method: "POST",
    headers: { "x-api-key": gradiumApiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
        name: "tech-terms",
        language: "en",
        rules: [{ original: "API", rewrite: "A P I", case_sensitive: true }],
    }),
});
```

**REST endpoints:** `POST /pronunciations/`, `GET /pronunciations/`, `GET /pronunciations/{uid}`, `PUT /pronunciations/{uid}`, `DELETE /pronunciations/{uid}`

## Advanced TTS Configuration

Pass `json_config` as a JSON string for fine-tuning:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `padding_bonus` | -4.0 to 4.0 | 0 | Speech pace (negative = faster) |
| `temp` | 0 to 1.4 | 0.7 | Temperature / expressiveness |
| `cfg_coef` | 1.0 to 4.0 | 2.0 | Voice similarity strength |
| `rewrite_rules` | string | — | Language alias for text normalization (`en`, `fr`, `de`, `es`, `pt`) |

### Text Control Tags

Use inline tags in your text for fine-grained control:

- `<flush>` — Forces immediate audio generation for accumulated text
- `<break time="1.5s" />` — Inserts a pause (0.1–2.0 seconds)

```json
{"text": "Hello.<break time=\"1.0s\" /> How are you today?<flush>"}
```

## Credits & Usage

```javascript
const credits = await fetch("https://eu.api.gradium.ai/api/usages/credits", {
    headers: { "x-api-key": gradiumApiKey },
}).then((r) => r.json());
```

TTS consumes 1 credit per character (~750 characters per minute, ~45,000 per hour).

## Error Handling

**WebSocket errors:** Server sends an error JSON before closing the connection.

```json
{"type": "error", "message": "Error description", "code": 1008}
```

| Code | Meaning |
|------|---------|
| 1008 | Policy violation (invalid API key, missing setup, invalid format) |
| 1011 | Internal server error |

**HTTP errors (POST/REST endpoints):**

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing fields, invalid voice ID) |
| 401 | Unauthorized (invalid/missing API key) |
| 422 | Validation error |
| 500 | Internal server error |

## Useful Links

- API Documentation: https://docs.gradium.ai/
- Support: support@gradium.ai

## Notes

- Always ensure you have a valid API key and sufficient credits before making requests
- For production applications, implement reconnection with exponential backoff for WebSocket connections
- Use the POST endpoint for simple, complete text; use WebSocket for streaming/interactive use cases
- TTS outputs audio at 48kHz; STT expects input at 24kHz — do not mix these up
- Use VAD for turn-taking in STT: `vad[2]["inactivity_prob"] > 0.5` indicates end of speech
- Always send `end_of_stream` before closing WebSocket connections for clean shutdown
- Voice IDs can be obtained from the voices list endpoint or after cloning
- The `only_audio: true` flag on the POST endpoint returns raw bytes suitable for direct file saving
