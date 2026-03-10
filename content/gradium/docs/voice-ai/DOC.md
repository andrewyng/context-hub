---
name: voice-ai
description: "Gradium Voice AI API for low-latency text-to-speech and speech-to-text with WebSocket streaming"
metadata:
  languages: "python,rust,javascript,typescript,curl"
  versions: "0.1.0"
  source: community
  tags: "gradium,tts,stt,voice,speech,websocket,streaming"
  updated-on: "2026-03-10"
---

# Gradium Voice AI API Guide

You are a Gradium API expert. Help with writing code that integrates the Gradium Text-to-Speech (TTS) and Speech-to-Text (STT) APIs.

Official documentation: https://gradium.ai/api_docs.html

## Overview

Gradium provides low-latency TTS and STT models via REST and WebSocket APIs. Key features:

- Time-to-first-token below 300ms when streaming
- 200+ voices across 5 languages (English, French, German, Spanish, Portuguese)
- WebSocket streaming for real-time applications
- HTTP POST endpoint for simple TTS conversions
- Voice Activity Detection (VAD) for STT
- Custom voice cloning from audio files
- Pronunciation dictionaries for text normalization

## Installation

**Python SDK:**

```bash
pip install gradium
```

**Rust SDK:** Available via crates.io.

**JavaScript/TypeScript:** No SDK — use standard `fetch` and `WebSocket` APIs directly.

## Authentication

All requests require an API key via the `x-api-key` header.

```bash
# Header-based authentication
x-api-key: your_api_key
```

```python
from gradium.client import GradiumClient

# Using API key directly
client = GradiumClient(api_key="gd_your_api_key_here")

# Or set the GRADIUM_API_KEY environment variable and omit the key
client = GradiumClient()
```

## Base URLs

| Region | REST API | WebSocket |
|--------|----------|-----------|
| EU | `https://eu.api.gradium.ai/api` | `wss://eu.api.gradium.ai/api` |
| US | `https://us.api.gradium.ai/api` | `wss://us.api.gradium.ai/api` |

## Text-to-Speech (TTS)

### POST Endpoint (Simple TTS)

For non-streaming, complete text-to-speech conversion.

**Endpoint:** `POST /api/post/speech/tts`

```bash
curl -L -X POST https://eu.api.gradium.ai/api/post/speech/tts \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of the text to speech system.",
    "voice_id": "YTpq7expH9539ERJ",
    "output_format": "wav",
    "only_audio": true
  }' > output.wav
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to convert to speech |
| `voice_id` | string | Yes | Voice ID from the library or custom voice |
| `output_format` | string | Yes | `wav`, `pcm`, `opus`, `ulaw_8000`, `alaw_8000`, `pcm_8000`, `pcm_16000`, `pcm_24000` |
| `model_name` | string | No | TTS model (default: `"default"`) |
| `only_audio` | boolean | No | `true` returns raw audio bytes; `false` returns JSON stream |
| `json_config` | string | No | JSON string with advanced settings (see [TTS Reference](references/tts-api.md)) |
| `pronunciation_id` | string | No | UID of a pronunciation dictionary to apply |

**Audio Output Specs (WAV/PCM):** 48kHz, 16-bit signed integer, mono.

### WebSocket Endpoint (Streaming TTS)

For real-time, low-latency streaming TTS. Supports async generator input for streaming text.

**Connection:** `wss://eu.api.gradium.ai/api/speech/tts` (or `us.` for US region)

The WebSocket flow is: **Setup → Ready → Text/Audio streaming → EndOfStream**.

**Setup parameters:** `voice_id`, `model_name`, `output_format`, `pronunciation_id` (optional), `close_ws_on_eos` (set `false` for multiplexing), `json_config` (optional).

```python
import asyncio
import websockets
import json
import base64

async def tts_stream(text, api_key, voice_id="YTpq7expH9539ERJ"):
    uri = "wss://eu.api.gradium.ai/api/speech/tts"
    headers = {"x-api-key": api_key}

    async with websockets.connect(uri, extra_headers=headers) as ws:
        # 1. Send setup message (must be first)
        await ws.send(json.dumps({
            "type": "setup",
            "voice_id": voice_id,
            "model_name": "default",
            "output_format": "wav"
        }))

        # 2. Wait for ready
        ready = json.loads(await ws.recv())
        assert ready["type"] == "ready"

        # 3. Send text
        await ws.send(json.dumps({"type": "text", "text": text}))

        # 4. Signal end of input
        await ws.send(json.dumps({"type": "end_of_stream"}))

        # 5. Receive audio chunks
        audio_chunks = []
        while True:
            msg = json.loads(await ws.recv())
            if msg["type"] == "audio":
                audio_chunks.append(base64.b64decode(msg["audio"]))
            elif msg["type"] == "end_of_stream":
                break

    return b"".join(audio_chunks)
```

**JavaScript/TypeScript (using fetch for POST):**

```javascript
const response = await fetch("https://eu.api.gradium.ai/api/post/speech/tts", {
    method: "POST",
    headers: {
        "x-api-key": gradiumApiKey,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        text: "Hello, this is a test.",
        voice_id: "YTpq7expH9539ERJ",
        output_format: "wav",
    }),
});
const audioBuffer = await response.arrayBuffer();
```

**JavaScript/TypeScript (WebSocket streaming TTS):**

```javascript
const WebSocket = require("ws"); // Node.js; browsers use native WebSocket

const ws = new WebSocket("wss://eu.api.gradium.ai/api/speech/tts", {
    headers: { "x-api-key": gradiumApiKey },
});

ws.on("open", () => {
    // 1. Send setup (must be first message)
    ws.send(JSON.stringify({
        type: "setup",
        voice_id: "YTpq7expH9539ERJ",
        model_name: "default",
        output_format: "wav",
    }));
});

const audioChunks = [];
ws.on("message", (data) => {
    const msg = JSON.parse(data);
    if (msg.type === "ready") {
        // 2. Send text after ready
        ws.send(JSON.stringify({ type: "text", text: "Hello, world!" }));
        ws.send(JSON.stringify({ type: "end_of_stream" }));
    } else if (msg.type === "audio") {
        audioChunks.push(Buffer.from(msg.audio, "base64"));
    } else if (msg.type === "end_of_stream") {
        const fullAudio = Buffer.concat(audioChunks);
        // Process fullAudio (e.g., save to file, play back)
    }
});
```

See [TTS API Reference](references/tts-api.md) for full message type details, text control tags, and advanced configuration.

## Speech-to-Text (STT)

### WebSocket Endpoint (Streaming STT)

**Connection:** `wss://eu.api.gradium.ai/api/speech/asr` (or `us.` for US region)

The WebSocket flow is: **Setup → Ready → Audio/Text streaming → EndOfStream**.

```python
import asyncio
import websockets
import json
import base64

async def stt_stream(audio_data, api_key):
    uri = "wss://eu.api.gradium.ai/api/speech/asr"
    headers = {"x-api-key": api_key}

    async with websockets.connect(uri, extra_headers=headers) as ws:
        # 1. Setup
        await ws.send(json.dumps({
            "type": "setup",
            "model_name": "default",
            "input_format": "pcm"
        }))

        ready = json.loads(await ws.recv())
        assert ready["type"] == "ready"
        sample_rate = ready["sample_rate"]  # typically 24000

        # 2. Send audio in chunks (1920 samples = 80ms at 24kHz)
        chunk_size = 1920 * 2  # 16-bit = 2 bytes per sample
        for i in range(0, len(audio_data), chunk_size):
            chunk = audio_data[i:i + chunk_size]
            await ws.send(json.dumps({
                "type": "audio",
                "audio": base64.b64encode(chunk).decode()
            }))

        # 3. Signal end of input
        await ws.send(json.dumps({"type": "end_of_stream"}))

        # 4. Collect transcriptions
        transcripts = []
        while True:
            msg = json.loads(await ws.recv())
            if msg["type"] == "text":
                transcripts.append(msg["text"])
            elif msg["type"] == "end_of_stream":
                break

    return " ".join(transcripts)
```

**JavaScript/TypeScript (WebSocket STT):**

```javascript
const WebSocket = require("ws"); // Node.js; browsers use native WebSocket

const ws = new WebSocket("wss://eu.api.gradium.ai/api/speech/asr", {
    headers: { "x-api-key": gradiumApiKey },
});

ws.on("open", () => {
    // 1. Send setup (must be first message)
    ws.send(JSON.stringify({
        type: "setup",
        model_name: "default",
        input_format: "pcm",
    }));
});

const transcripts = [];
ws.on("message", (data) => {
    const msg = JSON.parse(data);
    if (msg.type === "ready") {
        // 2. Send audio chunks (base64-encoded PCM: 24kHz, 16-bit mono)
        ws.send(JSON.stringify({ type: "audio", audio: base64Audio }));
        // Send more chunks as needed...
        ws.send(JSON.stringify({ type: "end_of_stream" }));
    } else if (msg.type === "text") {
        transcripts.push(msg.text);
    } else if (msg.type === "end_of_stream") {
        console.log("Transcription:", transcripts.join(" "));
    }
});
```

**STT Audio Input Requirements (PCM):**

| Spec | Value |
|------|-------|
| Sample Rate | 24,000 Hz |
| Format | PCM 16-bit signed integer (little-endian) |
| Channels | Mono |
| Recommended chunk | 1,920 samples (80ms) |

Input formats: `pcm`, `wav`, `opus`

See [STT API Reference](references/stt-api.md) for VAD details, flush mechanism, and message types.

## Voice Management

Manage custom voices via REST API endpoints. See [Voices API Reference](references/voices-api.md) for full details.

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Clone voice | `POST` | `/api/voice/clone` |
| Create voice | `POST` | `/voices/` |
| List voices | `GET` | `/voices/` |
| Get voice | `GET` | `/voices/{voice_uid}` |
| Update voice | `PUT` | `/voices/{voice_uid}` |
| Delete voice | `DELETE` | `/voices/{voice_uid}` |

### Clone a Voice

Clone a voice by uploading an audio file directly. Returns the new voice ID.

**Endpoint:** `POST /api/voice/clone`

```bash
curl -X POST https://eu.api.gradium.ai/api/voice/clone \
  -H "x-api-key: your_api_key" \
  --data-binary @recording.wav
```

**Python:**

```python
with open("recording.wav", "rb") as f:
    response = requests.post(
        "https://eu.api.gradium.ai/api/voice/clone",
        headers={"x-api-key": api_key},
        data=f,
    )
voice_id = response.json()["voice_id"]
```

**JavaScript/TypeScript:**

```javascript
// Browser: from a recorded audio blob
const file = new File([wavBlob], "recording.wav", { type: "audio/wav" });

const response = await fetch("https://eu.api.gradium.ai/api/voice/clone", {
    method: "POST",
    headers: { "x-api-key": gradiumApiKey },
    body: file,
});
const data = await response.json();
const voiceId = data.voice_id;
```

```javascript
// Server-side (e.g., Next.js API route): forwarding an uploaded file
const formData = await req.formData();
const file = formData.get("audio");
const apiKey = req.headers.get("x-gradium-api-key") || process.env.GRADIUM_API_KEY;

const gradiumRes = await fetch("https://eu.api.gradium.ai/api/voice/clone", {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body: file,
});
const data = await gradiumRes.json();
// data.voice_id contains the cloned voice ID
```

**Minimum audio sample:** 10 seconds of clear speech.

### Python SDK Voice Management

```python
import gradium

voice = gradium.voices.create(client, audio_file="sample.wav", name="my-voice")
voices = gradium.voices.get(client)                          # list all
voice = gradium.voices.get(client, voice_uid="abc123")       # get one
gradium.voices.update(client, voice_uid="abc123", name="new-name")
gradium.voices.delete(client, voice_uid="abc123")
```

14 flagship voices (Emma, Kent, Sydney, John, Eva, Jack, Elise, Leo, Mia, Maximilian, Valentina, Sergio, Alice, Davi) plus 200+ catalog voices. See [Voices API Reference](references/voices-api.md) for the full catalog and REST examples.

## Pronunciation Dictionaries

Custom text normalization rules for TTS. See [Pronunciations API Reference](references/pronunciations-api.md).

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Create dictionary | `POST` | `/pronunciations/` |
| List dictionaries | `GET` | `/pronunciations/` |
| Get dictionary | `GET` | `/pronunciations/{uid}` |
| Update dictionary | `PUT` | `/pronunciations/{uid}` |
| Delete dictionary | `DELETE` | `/pronunciations/{uid}` |

```bash
curl -X POST https://eu.api.gradium.ai/api/pronunciations/ \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "tech-terms",
    "language": "en",
    "rules": [
      {"original": "API", "rewrite": "A P I", "case_sensitive": true}
    ]
  }'
```

## Credits & Usage

```python
credits = gradium.usages.get(client)
```

```bash
curl https://eu.api.gradium.ai/api/usages/credits \
  -H "x-api-key: your_api_key"
```

Returns remaining and allocated credits, billing period, and plan info. TTS consumes 1 credit per character (~750 characters per minute, ~45,000 per hour).

## Advanced TTS Configuration

Pass `json_config` as a JSON string for fine-tuning:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `padding_bonus` | -4.0 to 4.0 | 0 | Speed control (negative = faster) |
| `temp` | 0 to 1.4 | 0.7 | Temperature for variation |
| `cfg_coef` | 1.0 to 4.0 | 2.0 | Voice similarity strength |
| `rewrite_rules` | string | — | Language alias for text normalization (`en`, `fr`, `de`, `es`, `pt`) |

### Text Control Tags

Use inline tags in your text for fine-grained control:

- `<flush>` — Forces immediate audio generation for accumulated text
- `<break time="1.5s" />` — Inserts a pause (0.1–2.0 seconds)

```json
{"text": "Hello.<break time=\"1.0s\" /> How are you today?"}
```

## Error Handling

**WebSocket errors:**
```json
{"type": "error", "message": "Error description", "code": 1008}
```

| Code | Meaning |
|------|---------|
| 1008 | Policy violation (invalid API key, missing setup, invalid format) |
| 1011 | Internal server error |

**HTTP errors (POST endpoint):**
```json
{"error": "Error description", "code": 400}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing fields, invalid voice ID) |
| 401 | Unauthorized (invalid/missing API key) |
| 422 | Validation error |
| 500 | Internal server error |

## Best Practices

1. **Always send setup first** — WebSocket connections expect a setup message immediately
2. **Use POST for simple jobs** — Use the POST endpoint for complete text blocks; use WebSocket for streaming/interactive use
3. **Match audio specs** — TTS outputs 48kHz; STT expects 24kHz input
4. **Use VAD for turn-taking** — In STT, check `vad[2]["inactivity_prob"] > 0.5` to detect end of speech
5. **Implement reconnection** — Build exponential backoff for WebSocket reconnections
6. **Close cleanly** — Always send `end_of_stream` before closing WebSocket connections
7. **Reuse connections** — For multiple utterances, keep the WebSocket alive and send multiple text messages

## Useful Links

- API Documentation: https://gradium.ai/api_docs.html
- Support: support@gradium.ai
