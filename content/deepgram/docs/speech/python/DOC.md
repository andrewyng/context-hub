---
name: speech
description: "Deepgram Python SDK coding guidelines for speech recognition, text-to-speech, and audio intelligence"
metadata:
  languages: "python"
  versions: "7.2.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "deepgram,speech,transcription,tts,audio"
---

# Deepgram Python SDK Coding Guidelines

You are a Deepgram Python SDK coding expert. Help me with writing code using the Deepgram API calling the official Python SDK.

Please follow the following guidelines when generating code.

You can find the official SDK documentation and code samples here:
https://developers.deepgram.com/docs

## Golden Rule: Use the Correct and Current SDK

Always use the official Deepgram Python SDK for all Deepgram API interactions.

- **Library Name:** Deepgram Python SDK
- **Python Package:** `deepgram-sdk`
- **Repository:** https://github.com/deepgram/deepgram-python-sdk

**Installation:**

- **Correct:** `pip install deepgram-sdk`

**Requirements:**

- Python 3.10 or higher

**APIs and Usage:**

- **Correct:** `from deepgram import DeepgramClient`
- **Correct:** `from deepgram.core.events import EventType`

## Initialization and API Key

The `deepgram-sdk` library requires creating a client object for all API calls.

- Always use `client = DeepgramClient()` to create a client object
- Set `DEEPGRAM_API_KEY` environment variable, which will be picked up automatically
- Alternatively, pass the API key directly: `client = DeepgramClient(api_key="YOUR_API_KEY")`

```python
from deepgram import DeepgramClient

# Using environment variable DEEPGRAM_API_KEY
client = DeepgramClient()

# Or direct API key
client = DeepgramClient(api_key="YOUR_API_KEY")
```

## Authentication Methods

The Deepgram Python SDK supports multiple authentication methods:

### API Key Authentication (Traditional)
```python
from deepgram import DeepgramClient

# Direct API key
client = DeepgramClient(api_key="YOUR_API_KEY")

# Or using environment variable DEEPGRAM_API_KEY
client = DeepgramClient()  # Auto-detects from environment
```

### Bearer Token Authentication (OAuth 2.0)
```python
from deepgram import DeepgramClient

# Direct access token
client = DeepgramClient(access_token="YOUR_ACCESS_TOKEN")

# Or using environment variable DEEPGRAM_ACCESS_TOKEN
client = DeepgramClient()  # Auto-detects from environment
```

## Models

By default, use the following models when using the Deepgram SDK:

- **Speech-to-Text (general, prerecorded):** `nova-3` (latest general model)
- **Speech-to-Text (real-time, low latency):** `flux-general-en`
- **Text-to-Speech Tasks:** `aura-2-thalia-en` (default TTS model)
- **Text Intelligence Tasks:** `nova-3`

## Speech-to-Text (Transcription)

### Pre-Recorded Audio from URL

```python
from deepgram import DeepgramClient

client = DeepgramClient()

response = client.listen.v1.media.transcribe_url(
    request={"url": "https://example.com/audio.wav"},
    model="nova-3",
    smart_format=True,
    language="en",
)

print(response.results.channels[0].alternatives[0].transcript)
```

### Pre-Recorded Audio from File / Buffer

```python
from deepgram import DeepgramClient

client = DeepgramClient()

with open("audio.wav", "rb") as audio_file:
    response = client.listen.v1.media.transcribe_file(
        request=audio_file.read(),
        model="nova-3",
        smart_format=True,
        diarize=True,
        utterances=True,
        language="en",
    )

print(response.results.channels[0].alternatives[0].transcript)
```

### Common Transcription Options

- `model`: `nova-3`, `nova-3-general`, `nova-3-medical`, `nova-2`, etc.
- `language`: BCP-47 language code (e.g., `"en"`, `"es"`, `"fr"`) or `"multi"` for multilingual
- `smart_format`: Automatic punctuation, numerals, dates, and more
- `diarize`: Speaker identification
- `utterances`: Group transcript into utterances
- `punctuate`: Add punctuation
- `keyterm`: Keyword detection (Nova 3 only)

### Streaming Audio (Real-time WebSocket)

For real-time audio transcription, the v7 SDK uses a context-managed WebSocket
connection with event handlers registered via `EventType`.

```python
from deepgram import DeepgramClient
from deepgram.core.events import EventType

client = DeepgramClient()

with client.listen.v2.connect(
    model="flux-general-en",
    encoding="linear16",
    sample_rate=16000,
) as connection:
    def on_message(message):
        # Inspect message.type to determine the kind of event
        print(f"Received {message.type} event")

    connection.on(EventType.OPEN, lambda _: print("Connection opened"))
    connection.on(EventType.MESSAGE, on_message)
    connection.on(EventType.CLOSE, lambda _: print("Connection closed"))
    connection.on(EventType.ERROR, lambda error: print(f"Error: {error}"))

    connection.start_listening()

    # Send raw audio bytes
    # connection.send_media(audio_chunk)

    # Send control messages when needed
    # connection.send_keep_alive()
    # connection.send_finalize()
```

Use `send_media(audio_bytes)` to transmit audio frames. Control messages have
dedicated methods such as `send_keep_alive()`, `send_finalize()`, and
`send_flush()` rather than the v5 `send_control()` API.

## Text-to-Speech

### REST API (Batch Conversion)

```python
from deepgram import DeepgramClient

client = DeepgramClient()

response = client.speak.v1.audio.generate(
    text="Hello, world.",
    model="aura-2-thalia-en",
    encoding="linear16",
    container="wav",
    sample_rate=24000,
)

# Stream the audio bytes to a file
with open("output.wav", "wb") as f:
    for chunk in response:
        f.write(chunk)
```

### WebSocket API (Streaming TTS)

```python
from deepgram import DeepgramClient
from deepgram.core.events import EventType

client = DeepgramClient()

with client.speak.v1.connect(
    model="aura-2-thalia-en",
    encoding="linear16",
    sample_rate=16000,
) as connection:
    def on_audio(data):
        with open("output.wav", "ab") as f:
            f.write(data)

    connection.on(EventType.OPEN, lambda _: print("Connection opened"))
    connection.on(EventType.MESSAGE, on_audio)
    connection.on(EventType.CLOSE, lambda _: print("Connection closed"))

    connection.start_listening()

    # Send text to be synthesized
    connection.send_text("Hello, this is a text to speech example using Deepgram.")

    # Flush to force generation of any buffered text
    connection.send_flush()
```

## Voice Agent

Configure a Voice Agent for conversational AI. In v7 the agent uses domain
types under `deepgram.agent.v1.types`.

```python
from deepgram import DeepgramClient
from deepgram.core.events import EventType

client = DeepgramClient()

with client.agent.v1.connect() as connection:
    connection.on(EventType.OPEN, lambda _: print("Agent connected"))
    connection.on(EventType.MESSAGE, lambda msg: print(msg))
    connection.on(EventType.CLOSE, lambda _: print("Agent closed"))

    # Send a Settings message to configure the agent
    connection.send_settings({
        "language": "en",
        "agent": {
            "listen": {"provider": {"type": "deepgram", "model": "nova-3"}},
            "think": {
                "provider": {"type": "open_ai", "model": "gpt-4o-mini"},
                "prompt": "You are a helpful AI assistant.",
            },
            "speak": {"provider": {"type": "deepgram", "model": "aura-2-thalia-en"}},
        },
        "greeting": "Hello, I'm your AI assistant.",
    })

    connection.start_listening()
```

## Text Intelligence

Analyze text for insights using the Read API.

```python
from deepgram import DeepgramClient

client = DeepgramClient()

response = client.read.v1.text.analyze(
    request={"text": "The quick brown fox jumps over the lazy dog."},
    language="en",
    sentiment=True,
    topics=True,
)

print(response.results)
```

## Captions Generation

Convert transcription results to caption formats using the companion
`deepgram-captions` package.

### WebVTT
```python
from deepgram_captions import DeepgramConverter, webvtt

transcription = DeepgramConverter(dg_response)
captions = webvtt(transcription)
```

### SRT
```python
from deepgram_captions import DeepgramConverter, srt

transcription = DeepgramConverter(dg_response)
captions = srt(transcription)
```

## Error Handling

Always implement proper error handling:

```python
from deepgram import DeepgramClient
from deepgram.errors import DeepgramError

client = DeepgramClient()

try:
    response = client.listen.v1.media.transcribe_url(
        request={"url": "https://example.com/audio.wav"},
        model="nova-3",
    )
    print(response.results.channels[0].alternatives[0].transcript)
except DeepgramError as e:
    print(f"Deepgram Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Type System (v7)

Version 7 reorganizes types under domain-specific namespaces:

- `deepgram.listen.v1.types` and `deepgram.listen.v2.types` for speech-to-text
- `deepgram.speak.v1.types` for text-to-speech
- `deepgram.agent.v1.types` for Voice Agent

Prefer importing types from these domain namespaces rather than from the legacy
shared modules.

## Migration Notes (v5 → v7)

If you are upgrading from v5:

- WebSocket connections are now opened via `client.listen.v2.connect(...)` and
  `client.speak.v1.connect(...)` and used as context managers.
- Event handling uses `from deepgram.core.events import EventType` with
  `EventType.OPEN`, `EventType.MESSAGE`, `EventType.CLOSE`, `EventType.ERROR`.
- Send raw audio with `send_media(bytes)`; use dedicated control methods
  (`send_keep_alive`, `send_finalize`, `send_flush`) instead of the v5 generic
  `send_control()`.
- REST prerecorded transcription moved to `client.listen.v1.media.transcribe_url`
  and `client.listen.v1.media.transcribe_file`.
- REST TTS moved to `client.speak.v1.audio.generate(...)`.
- Agent settings types were renamed (e.g., `AgentV1SettingsMessage` →
  `AgentV1Settings`).

## Useful Links

- Documentation: https://developers.deepgram.com/docs
- Python SDK Repository: https://github.com/deepgram/deepgram-python-sdk
- API Reference: https://developers.deepgram.com/reference
- Discord Community: https://discord.gg/xWRaCDBtW4

## Notes

This SDK provides comprehensive support for all Deepgram APIs including
Speech-to-Text (both pre-recorded and streaming), Text-to-Speech (both REST and
WebSocket), Text Intelligence, and Voice Agent functionality. The SDK follows
semantic versioning; v7 introduced a fully generated WebSocket client and a
restructured type system relative to v5.
