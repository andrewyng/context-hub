---
name: voice-ai
description: "Gradium Voice AI API for low-latency text-to-speech and speech-to-text with WebSocket streaming"
metadata:
  languages: "python"
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

Use the official Gradium Python SDK for Python projects.

- **Python Package:** `gradium`

**Installation:**

```bash
pip install gradium
```

**Correct Python usage:**

- **Correct:** `from gradium.client import GradiumClient`
- **Correct:** `client = GradiumClient(api_key="gd_your_api_key_here")`
- **Correct:** `client = GradiumClient()` (reads `GRADIUM_API_KEY` env var)

## Initialization and API Key

All requests require an API key passed via the `x-api-key` header.

```python
from gradium.client import GradiumClient

# Using environment variable GRADIUM_API_KEY
client = GradiumClient()

# Or pass the API key directly
client = GradiumClient(api_key="gd_your_api_key_here")
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

```python
import requests

response = requests.post(
    "https://eu.api.gradium.ai/api/post/speech/tts",
    headers={"x-api-key": api_key, "Content-Type": "application/json"},
    json={
        "text": "Hello, world!",
        "voice_id": "YTpq7expH9539ERJ",
        "output_format": "wav",
        "only_audio": True,
    },
)
with open("output.wav", "wb") as f:
    f.write(response.content)
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

Stream audio in real-time as it's generated for lower latency. Supports async generator input for streaming text.

**Connection:** `wss://{region}.api.gradium.ai/api/speech/tts`

**Flow:** Setup → Ready → Text/Audio streaming → EndOfStream

```python
import asyncio, websockets, json, base64

async def tts_stream(text, api_key, voice_id="YTpq7expH9539ERJ"):
    uri = "wss://eu.api.gradium.ai/api/speech/tts"
    async with websockets.connect(uri, extra_headers={"x-api-key": api_key}) as ws:
        # 1. Setup (must be first message)
        await ws.send(json.dumps({
            "type": "setup", "voice_id": voice_id,
            "model_name": "default", "output_format": "wav"
        }))
        ready = json.loads(await ws.recv())
        assert ready["type"] == "ready"

        # 2. Send text and signal end
        await ws.send(json.dumps({"type": "text", "text": text}))
        await ws.send(json.dumps({"type": "end_of_stream"}))

        # 3. Receive audio chunks
        audio_chunks = []
        while True:
            msg = json.loads(await ws.recv())
            if msg["type"] == "audio":
                audio_chunks.append(base64.b64decode(msg["audio"]))
            elif msg["type"] == "end_of_stream":
                break
    return b"".join(audio_chunks)
```

**Setup parameters:** `voice_id`, `model_name`, `output_format`, `pronunciation_id` (optional), `close_ws_on_eos` (set `false` for multiplexing), `json_config` (optional).

See [TTS API Reference](references/tts-api.md) for message types, text control tags, multiplexing, and advanced configuration.

## Streaming STT (WebSocket)

Real-time speech-to-text with Voice Activity Detection.

**Connection:** `wss://{region}.api.gradium.ai/api/speech/asr`

**Flow:** Setup → Ready → Audio/Text streaming → EndOfStream

```python
import asyncio, websockets, json, base64

async def stt_stream(audio_data, api_key):
    uri = "wss://eu.api.gradium.ai/api/speech/asr"
    async with websockets.connect(uri, extra_headers={"x-api-key": api_key}) as ws:
        # 1. Setup
        await ws.send(json.dumps({
            "type": "setup", "model_name": "default", "input_format": "pcm"
        }))
        ready = json.loads(await ws.recv())
        assert ready["type"] == "ready"

        # 2. Send audio in chunks (1920 samples = 80ms at 24kHz)
        chunk_size = 1920 * 2  # 16-bit = 2 bytes per sample
        for i in range(0, len(audio_data), chunk_size):
            chunk = audio_data[i:i + chunk_size]
            await ws.send(json.dumps({
                "type": "audio", "audio": base64.b64encode(chunk).decode()
            }))

        # 3. End stream and collect results
        await ws.send(json.dumps({"type": "end_of_stream"}))
        transcripts = []
        while True:
            msg = json.loads(await ws.recv())
            if msg["type"] == "text":
                transcripts.append(msg["text"])
            elif msg["type"] == "end_of_stream":
                break
    return " ".join(transcripts)
```

**STT audio input requirements (PCM):** 24kHz, 16-bit signed integer, mono. Recommended 1,920 samples (80ms) per chunk.

See [STT API Reference](references/stt-api.md) for VAD usage, flush mechanism, and all message types.

## Voice Cloning

Clone a voice by uploading an audio file. **Minimum sample: 10 seconds** of clear speech.

```python
with open("recording.wav", "rb") as f:
    response = requests.post("https://eu.api.gradium.ai/api/voice/clone",
                             headers={"x-api-key": api_key}, data=f)
voice_id = response.json()["voice_id"]
```

## Voice Management

Manage voices via the Python SDK or REST API. See [Voices API Reference](references/voices-api.md) for full details.

```python
import gradium

voice = gradium.voices.create(client, audio_file="sample.wav", name="my-voice")
voices = gradium.voices.get(client)                          # list all
voice = gradium.voices.get(client, voice_uid="abc123")       # get one
gradium.voices.update(client, voice_uid="abc123", name="new-name")
gradium.voices.delete(client, voice_uid="abc123")
```

**REST endpoints:** `POST /voices/`, `GET /voices/`, `GET /voices/{uid}`, `PUT /voices/{uid}`, `DELETE /voices/{uid}`

**Flagship voices:** Emma, Kent, Sydney, John (US English), Eva, Jack (GB English), Elise, Leo (French), Mia, Maximilian (German), Valentina (Mexican Spanish), Sergio (Spanish), Alice, Davi (Brazilian Portuguese) — plus 200+ catalog voices. Use `GET /voices/?include_catalog=true` to list all.

## Pronunciation Dictionaries

Custom text normalization rules for TTS. See [Pronunciations API Reference](references/pronunciations-api.md).

```python
import requests

response = requests.post(
    "https://eu.api.gradium.ai/api/pronunciations/",
    headers={"x-api-key": api_key, "Content-Type": "application/json"},
    json={
        "name": "tech-terms",
        "language": "en",
        "rules": [{"original": "API", "rewrite": "A P I", "case_sensitive": True}],
    },
)
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

```python
credits = gradium.usages.get(client)
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
