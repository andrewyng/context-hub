---
name: live
description: "Google Gemini Live API for real-time bidirectional voice, video, and text streaming over WebSocket in Python"
metadata:
  languages: "python"
  versions: "1.56.0"
  revision: 1
  updated-on: "2026-03-29"
  source: community
  tags: "gemini,google,live,realtime,voice,audio,streaming,websocket,vad,speech"
---

# Gemini Live API Coding Guidelines (Python)

You are a Gemini Live API coding expert. Help me write real-time voice and
multimodal streaming code using the official Google GenAI SDK.

Official docs: https://ai.google.dev/gemini-api/docs/live-api

## Golden Rule: Use the Correct and Current SDK

Always use the Google GenAI SDK (`google-genai`). Do not use legacy libraries.

- **Correct:** `pip install google-genai`
- **Incorrect:** `pip install google-generativeai`

**Imports:**

- **Correct:** `from google import genai` and `from google.genai import types`
- **Incorrect:** `import google.generativeai as genai`

## Models

Use these models for the Live API as of March 2026:

| Model | ID | Notes |
|---|---|---|
| **Gemini 3.1 Flash Live** (newest) | `gemini-3.1-flash-live-preview` | Recommended default |
| **Gemini 2.5 Flash Live** | `gemini-2.5-flash-live-preview` | Supports async tools, proactive audio, affective dialog |

**Key differences:**

- **3.1 Flash Live**: Uses `thinkingLevel` (minimal/low/medium/high). `send_client_content` only for seeding initial history. No async function calling.
- **2.5 Flash Live**: Uses `thinkingBudget` (token count). `send_client_content` works throughout conversation. Supports async function calling.

Do not use non-Live models (e.g., `gemini-2.5-flash`) with `client.aio.live.connect`. Only the `-live-preview` model IDs work.

## Audio Format

| Direction | Format | Sample Rate | Bit Depth | MIME Type |
|---|---|---|---|---|
| **Input** | Raw PCM, mono, little-endian | 16 kHz | 16-bit | `audio/pcm;rate=16000` |
| **Output** | Raw PCM, mono, little-endian | 24 kHz | 16-bit | — |

The API will resample if you send other rates, but 16 kHz is optimal.

## Connecting to a Live Session

The Live API uses an async context manager over a WebSocket connection.

```python
import asyncio
from google import genai
from google.genai import types

client = genai.Client()  # reads GEMINI_API_KEY from env
model = "gemini-3.1-flash-live-preview"

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
)

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        # Session is now open — send and receive here
        pass

asyncio.run(main())
```

**Important:** The connection is `client.aio.live.connect`, not
`client.live.connect`. The Live API is async-only.

## Sending Input

### Audio

Send small PCM chunks (20-40ms each). Do not buffer more than 1 second.

```python
await session.send_realtime_input(
    audio=types.Blob(
        data=audio_bytes,  # raw 16-bit PCM bytes
        mime_type="audio/pcm;rate=16000",
    )
)
```

### Text

```python
await session.send_realtime_input(text="Hello, how are you?")
```

### Video (Images)

Send JPEG frames at max 1 FPS.

```python
await session.send_realtime_input(
    video=types.Blob(
        data=jpeg_bytes,
        mime_type="image/jpeg",
    )
)
```

## Receiving Responses

Iterate over `session.receive()` to get server messages.

```python
async for response in session.receive():
    content = response.server_content
    if not content:
        continue

    # Audio from the model
    if content.model_turn:
        for part in content.model_turn.parts:
            if part.inline_data:
                pcm_24khz = part.inline_data.data
                # Play or buffer this audio

    # Transcription of what the user said
    if content.input_transcription:
        print(f"User: {content.input_transcription.text}")

    # Transcription of what the model said
    if content.output_transcription:
        print(f"Model: {content.output_transcription.text}")

    # Model was interrupted by user speech
    if content.interrupted is True:
        # Stop playback immediately, discard buffered audio
        pass

    # Model finished its response
    if content.generation_complete is True:
        pass
```

## Full LiveConnectConfig

```python
config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],

    # Voice selection
    speech_config={
        "voice_config": {
            "prebuilt_voice_config": {"voice_name": "Kore"}
        }
    },

    # Enable transcriptions
    output_audio_transcription={},
    input_audio_transcription={},

    # System instructions
    system_instruction=types.Content(
        parts=[types.Part.from_text("You are a helpful voice assistant.")]
    ),

    # Thinking (3.1: thinkingLevel; 2.5: thinkingBudget)
    thinking_config=types.ThinkingConfig(
        thinking_level="low",       # minimal, low, medium, high
        include_thoughts=True,
    ),

    # Voice Activity Detection
    realtime_input_config={
        "automatic_activity_detection": {
            "disabled": False,
            "start_of_speech_sensitivity": types.StartSensitivity.START_SENSITIVITY_LOW,
            "end_of_speech_sensitivity": types.EndSensitivity.END_SENSITIVITY_LOW,
            "prefix_padding_ms": 20,
            "silence_duration_ms": 100,
        }
    },

    # Extend sessions beyond default limits
    context_window_compression=types.ContextWindowCompressionConfig(
        sliding_window=types.SlidingWindow(),
    ),

    # Resume after disconnection
    session_resumption=types.SessionResumptionConfig(
        handle=None,  # pass previous handle to resume
    ),

    # Video resolution
    media_resolution=types.MediaResolution.MEDIA_RESOLUTION_LOW,

    # Tools
    tools=[
        {"function_declarations": [...]},
        {"google_search": {}},
    ],
)
```

## Voice Activity Detection (VAD)

### Automatic VAD (default)

Server detects speech start/end. When the user interrupts, ongoing generation
is canceled. Configure sensitivity:

- `start_of_speech_sensitivity`: `START_SENSITIVITY_LOW` or `START_SENSITIVITY_HIGH`
- `end_of_speech_sensitivity`: `END_SENSITIVITY_LOW` or `END_SENSITIVITY_HIGH`
- `prefix_padding_ms`: Audio retained before speech start (e.g., 20)
- `silence_duration_ms`: Silence before end-of-speech (e.g., 100)

### Manual VAD

Disable automatic detection and control turn boundaries yourself:

```python
config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    realtime_input_config={
        "automatic_activity_detection": {"disabled": True}
    },
)

async with client.aio.live.connect(model=model, config=config) as session:
    await session.send_realtime_input(activity_start=types.ActivityStart())
    await session.send_realtime_input(
        audio=types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000")
    )
    await session.send_realtime_input(activity_end=types.ActivityEnd())
```

### Audio Stream Pause

When the mic is off for more than 1 second (automatic VAD mode):

```python
await session.send_realtime_input(audio_stream_end=True)
```

## Tool Calling (Function Calling)

Define tools in config, handle `tool_call` responses:

```python
config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    tools=[{
        "function_declarations": [{
            "name": "get_weather",
            "description": "Get current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name"}
                },
                "required": ["city"],
            },
        }]
    }],
)

async with client.aio.live.connect(model=model, config=config) as session:
    # ... send input, then in receive loop:
    async for response in session.receive():
        if response.tool_call:
            function_responses = []
            for fc in response.tool_call.function_calls:
                result = await my_tool_handler(fc.name, fc.args)
                function_responses.append(types.FunctionResponse(
                    name=fc.name,
                    id=fc.id,
                    response={"result": result},
                ))
            await session.send_tool_response(
                function_responses=function_responses
            )
```

## Seeding Conversation History (send_client_content)

Pre-load context before the live session begins:

```python
turns = [
    types.Content(role="user", parts=[types.Part.from_text("What is Echo?")]),
    types.Content(role="model", parts=[types.Part.from_text("Echo is a story-to-3D-world app.")]),
]
await session.send_client_content(turns=turns, turn_complete=True)
```

**Gemini 3.1 Flash Live:** `send_client_content` is only for initial history
seeding. You must set `initial_history_in_client_content: true` in the config's
`history_config`. After the first model turn, use `send_realtime_input(text=...)`
for mid-conversation text.

**Gemini 2.5 Flash Live:** `send_client_content` works throughout the
conversation.

## Session Management

### Session Duration Limits

| Mode | Duration |
|---|---|
| Audio only | 15 min |
| Audio + video | 2 min |
| WebSocket connection | ~10 min |

### Context Window Compression

Enable sliding window to extend sessions beyond default limits:

```python
config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    context_window_compression=types.ContextWindowCompressionConfig(
        sliding_window=types.SlidingWindow(),
    ),
)
```

### Session Resumption

Handle server-initiated disconnects by storing the resume handle:

```python
session_handle = None

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    session_resumption=types.SessionResumptionConfig(handle=session_handle),
)

async with client.aio.live.connect(model=model, config=config) as session:
    async for response in session.receive():
        # Store resume handle from server updates
        if hasattr(response, 'session_resumption_update'):
            update = response.session_resumption_update
            if update and update.new_handle:
                session_handle = update.new_handle
```

Tokens are valid for 2 hours after session termination. The server sends a
`GoAway` message with `timeLeft` before disconnecting.

## Best Practices

- **Audio chunks:** Send 20-40ms chunks. Do not buffer more than 1 second.
- **Resampling:** Browser mic input (44.1/48 kHz) must be resampled to 16 kHz before sending.
- **Interruption handling:** When `interrupted: true`, immediately discard buffered audio.
- **Session management:** Always enable context window compression for production.
- **Non-English:** Add `RESPOND IN {LANGUAGE}. YOU MUST RESPOND UNMISTAKABLY IN {LANGUAGE}.` to system instructions.
- **System instructions:** Use "unmistakably" for precision when defining persona or rules.

## Advanced Topics

See [references/advanced.md](references/advanced.md) for:
- Raw WebSocket API (no SDK)
- Ephemeral tokens for browser clients
- Async function calling (Gemini 2.5 Flash Live only)
- Model-specific feature matrix

## Useful Links

- Live API overview: ai.google.dev/gemini-api/docs/live-api
- SDK tutorial: ai.google.dev/gemini-api/docs/live-api/get-started-sdk
- Capabilities: ai.google.dev/gemini-api/docs/live-api/capabilities
- Session management: ai.google.dev/gemini-api/docs/live-api/session-management
