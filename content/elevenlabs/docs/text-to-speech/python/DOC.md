---
name: text-to-speech
description: "ElevenLabs Python SDK for text-to-speech synthesis, voice cloning, audio generation, and real-time streaming"
metadata:
  languages: "python"
  versions: "2.50.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "elevenlabs,text-to-speech,tts,audio,voice"
---

# ElevenLabs Python SDK Coding Guidelines

You are an ElevenLabs API coding expert. Help me with writing code using the ElevenLabs Python SDK and API.

Please follow the following guidelines when generating code.

You can find the official SDK documentation and code samples here:
https://elevenlabs.io/docs/api-reference

## Golden Rule: Use the Correct and Current SDK

Always use the official ElevenLabs Python SDK for all ElevenLabs API interactions. This is the standard and recommended library for accessing ElevenLabs services.

- **Library Name:** ElevenLabs Python SDK
- **Python Package:** `elevenlabs`

**Installation:**

- **Correct:** `pip install elevenlabs`

**APIs and Usage:**

- **Correct:** `from elevenlabs.client import ElevenLabs`
- **Correct:** `from elevenlabs.client import AsyncElevenLabs`
- **Correct:** `from elevenlabs import play, save, stream`

## Initialization and API Key

The `elevenlabs` library requires creating a client object for all API calls.

- Always use `client = ElevenLabs()` to create a client object.
- Set `ELEVENLABS_API_KEY` environment variable, which will be picked up automatically.
- Alternatively, pass the API key directly: `client = ElevenLabs(api_key="YOUR_API_KEY")`

```python
from elevenlabs.client import ElevenLabs

# Reads ELEVENLABS_API_KEY from the environment
client = ElevenLabs()

# Or pass the API key explicitly
client = ElevenLabs(api_key="YOUR_API_KEY")
```

## Main Models

By default, use the following models when using the ElevenLabs SDK:

- **General Text-to-Speech (Recommended):** `eleven_multilingual_v2`
    - Excels in stability, language diversity, and accent accuracy
    - Supports 29 languages
    - Recommended for most use cases

- **Ultra-Low Latency:** `eleven_flash_v2_5`
    - Supports 32 languages
    - Faster model, 50% lower price per character

- **Balanced Quality and Speed:** `eleven_turbo_v2_5`
    - Good balance of quality and latency
    - Ideal for developer use cases where speed is crucial
    - Supports 32 languages

## Basic Text-to-Speech Conversion

Here's how to convert text to speech using a voice of your choice:

```python
from elevenlabs.client import ElevenLabs
from elevenlabs import play

client = ElevenLabs()

audio = client.text_to_speech.convert(
    text="The first move is what sets everything in motion.",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_multilingual_v2",
    output_format="mp3_44100_128",
)

play(audio)
```

The `convert` method returns an iterator of bytes that represents the generated audio file.

## Audio Output Formats

The SDK supports various audio formats specified as `codec_sample_rate_bitrate`:

- **MP3 formats:** `mp3_22050_32`, `mp3_44100_32`, `mp3_44100_64`, `mp3_44100_96`, `mp3_44100_128`, `mp3_44100_192`
- **PCM formats:** `pcm_8000`, `pcm_16000`, `pcm_22050`, `pcm_24000`, `pcm_44100`, `pcm_48000`
- **Other formats:** `ulaw_8000`, `alaw_8000`, `opus_48000_32`, `opus_48000_64`, `opus_48000_96`, `opus_48000_128`, `opus_48000_192`

**Note:** MP3 with 192kbps bitrate requires Creator tier or above. PCM with 44.1kHz sample rate requires Pro tier or above.

## Audio Handling

The SDK provides three main functions for handling generated audio:

### Play Audio
```python
from elevenlabs import play

# Play audio directly
play(audio)

# Play in a Jupyter notebook
play(audio, notebook=True)

# Use the alternative audio backend (no ffmpeg)
play(audio, use_ffmpeg=False)
```

### Save Audio
```python
from elevenlabs import save

save(audio, "output.mp3")
```

`save` accepts either raw `bytes` or an `Iterator[bytes]` and writes the
concatenated audio to disk.

### Stream Audio
```python
from elevenlabs import stream

stream(audio_stream)
```

`stream` requires `mpv` to be installed on the host system.

## Voice Management

### List Available Voices

```python
from elevenlabs.client import ElevenLabs

client = ElevenLabs(api_key="YOUR_API_KEY")

# Search voices with pagination (recommended)
response = client.voices.search()
print(response.voices)
```

## Voice Cloning

Clone a voice using audio samples via the Instant Voice Clone (IVC) API:

```python
from elevenlabs.client import ElevenLabs

client = ElevenLabs(api_key="YOUR_API_KEY")

voice = client.voices.ivc.create(
    name="Alex",
    description="An old American male voice with a slight hoarseness in his throat. Perfect for news",
    files=["./sample_0.mp3", "./sample_1.mp3", "./sample_2.mp3"],
)

print(voice.voice_id)
```

The `create` method accepts a list of audio file paths and optional parameters
including `remove_background_noise`, `description`, and `labels`.

## Streaming Audio

Stream audio in real-time as it's being generated:

```python
from elevenlabs import stream
from elevenlabs.client import ElevenLabs

client = ElevenLabs()

audio_stream = client.text_to_speech.stream(
    text="This is a test",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_multilingual_v2",
)

# Option 1: play the streamed audio locally
stream(audio_stream)

# Option 2: process the audio bytes manually
for chunk in audio_stream:
    if isinstance(chunk, bytes):
        print(len(chunk))
```

The `stream` method returns an iterator of bytes for real-time audio processing.

### Latency Optimization

Control streaming latency with `optimize_streaming_latency` (0-4):

- 0 - default (no optimizations)
- 1 - normal optimizations (~50% of max improvement)
- 2 - strong optimizations (~75% of max improvement)
- 3 - max optimizations
- 4 - max optimizations with text normalizer disabled (can mispronounce numbers/dates)

## Async Client

Use `AsyncElevenLabs` for asynchronous API calls:

```python
import asyncio
from elevenlabs.client import AsyncElevenLabs

client = AsyncElevenLabs(api_key="YOUR_API_KEY")

async def generate_speech():
    audio = await client.text_to_speech.convert(
        text="Hello, world!",
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        model_id="eleven_multilingual_v2",
    )
    return audio

asyncio.run(generate_speech())
```

## Advanced Features

### Text-to-Speech with Timestamps

```python
response = client.text_to_speech.convert_with_timestamps(
    voice_id="21m00Tcm4TlvDq8ikWAM",
    text="This is a test for the API of ElevenLabs.",
)

# response contains audio plus character-level alignment data
```

### Voice Settings Customization

Override voice settings on a per-request basis by passing a `VoiceSettings`
object via the `voice_settings` parameter to `convert` or `stream`.

## Error Handling

The SDK exposes specific error types under `elevenlabs.errors`:

```python
from elevenlabs.errors import (
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    TooEarlyError,
    UnprocessableEntityError,
)
```

Wrap API calls in `try/except` and handle these errors as appropriate for your
application.

## Useful Links

- **Documentation:** https://elevenlabs.io/docs/api-reference
- **Models:** https://elevenlabs.io/docs/models
- **GitHub Repository:** https://github.com/elevenlabs/elevenlabs-python
- **API Pricing:** https://elevenlabs.io/pricing

## Notes

- The SDK automatically handles API authentication when the `ELEVENLABS_API_KEY` environment variable is set
- Voice cloning requires an API key and appropriate subscription tier
- Some output formats and features require specific subscription tiers
- The SDK supports both synchronous and asynchronous operations
- Audio is returned as byte iterators for efficient memory usage; collect with `b"".join(audio)` or pass to `save()` / `stream()` / `play()`

## API Reference Quick Notes

**`client.text_to_speech.convert(voice_id, *, text, model_id=..., output_format=..., voice_settings=..., language_code=..., seed=..., ...) -> Iterator[bytes]`**

Returns an iterator of audio bytes. Accepts any standard
`TextToSpeechConvertRequestOutputFormat` value (e.g. `"mp3_44100_128"`,
`"pcm_24000"`, `"ulaw_8000"`).

**`client.text_to_speech.stream(voice_id, *, text, model_id=..., output_format=..., optimize_streaming_latency=..., ...) -> Iterator[bytes]`**

Same shape as `convert` but streams chunks as the server produces them.

**`client.text_to_speech.convert_with_timestamps(voice_id, *, text, ...) -> AudioWithTimestampsResponse`**

Returns audio plus character-level timing alignment.

**`client.voices.search() -> GetVoicesResponse`**

Paginated list of available voices.

**`client.voices.ivc.create(*, name, files, description=None, remove_background_noise=None, labels=None) -> AddVoiceIvcResponseModel`**

Instant Voice Clone from one or more audio sample files.

**Utility helpers:**

```python
def play(audio: Union[bytes, Iterator[bytes]], notebook: bool = False, use_ffmpeg: bool = True) -> None: ...
def save(audio: Union[bytes, Iterator[bytes]], filename: str) -> None: ...
def stream(audio_stream: Iterator[bytes]) -> bytes: ...
```

`play` and `stream` require `mpv` (and optionally `ffmpeg`) to be installed on
the host machine.
