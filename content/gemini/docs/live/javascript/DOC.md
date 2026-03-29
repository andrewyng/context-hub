---
name: live
description: "Google Gemini Live API for real-time bidirectional voice, video, and text streaming over WebSocket in JavaScript/TypeScript"
metadata:
  languages: "javascript"
  versions: "1.43.0"
  revision: 1
  updated-on: "2026-03-29"
  source: community
  tags: "gemini,google,live,realtime,voice,audio,streaming,websocket,vad,speech"
---

# Gemini Live API Coding Guidelines (JavaScript/TypeScript)

You are a Gemini Live API coding expert. Help me write real-time voice and
multimodal streaming code using the official Google Gen AI SDK.

Official docs: https://ai.google.dev/gemini-api/docs/live-api

## Golden Rule: Use the Correct and Current SDK

Always use the Google Gen AI SDK (`@google/genai`). Do not use legacy libraries.

- **Correct:** `npm install @google/genai`
- **Incorrect:** `npm install @google/generative-ai`

**Imports:**

- **Correct:** `import { GoogleGenAI, Modality } from '@google/genai'`
- **Incorrect:** `const { GenerativeModel } = require('@google/generative-ai')`

## Models

Use these models for the Live API as of March 2026:

| Model | ID | Notes |
|---|---|---|
| **Gemini 3.1 Flash Live** (newest) | `gemini-3.1-flash-live-preview` | Recommended default |
| **Gemini 2.5 Flash Live** | `gemini-2.5-flash-live-preview` | Supports async tools, proactive audio, affective dialog |

**Key differences:**

- **3.1 Flash Live**: Uses `thinkingLevel` (minimal/low/medium/high). `sendClientContent` only for seeding initial history. No async function calling.
- **2.5 Flash Live**: Uses `thinkingBudget` (token count). `sendClientContent` works throughout conversation. Supports async function calling.

Do not use non-Live models with `ai.live.connect`. Only `-live-preview` model IDs work.

## Audio Format

| Direction | Format | Sample Rate | Bit Depth | MIME Type |
|---|---|---|---|---|
| **Input** | Raw PCM, mono, little-endian | 16 kHz | 16-bit | `audio/pcm;rate=16000` |
| **Output** | Raw PCM, mono, little-endian | 24 kHz | 16-bit | — |

## Connecting to a Live Session

The JavaScript SDK uses a callback-based connection model.

```typescript
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-3.1-flash-live-preview';

const session = await ai.live.connect({
    model,
    callbacks: {
        onopen() {
            console.log('Session opened');
        },
        onmessage(message) {
            handleServerMessage(message);
        },
        onerror(e) {
            console.error('Error:', e.message);
        },
        onclose(e) {
            console.log('Closed:', e.reason);
        },
    },
    config: {
        responseModalities: [Modality.AUDIO],
    },
});

// When done:
session.close();
```

**Important:** Unlike Python, the JS SDK is not async-iterator based. You
handle all responses in the `onmessage` callback.

## Sending Input

### Audio

Send base64-encoded PCM chunks (20-40ms each). Do not buffer more than 1s.

```typescript
session.sendRealtimeInput({
    audio: {
        data: chunk.toString('base64'),  // raw 16-bit PCM
        mimeType: 'audio/pcm;rate=16000',
    },
});
```

### Text

```typescript
session.sendRealtimeInput({ text: 'Hello, how are you?' });
```

### Video (Images)

Send base64-encoded JPEG frames at max 1 FPS.

```typescript
session.sendRealtimeInput({
    video: {
        data: jpegBuffer.toString('base64'),
        mimeType: 'image/jpeg',
    },
});
```

## Receiving Responses

Handle responses inside the `onmessage` callback:

```typescript
function handleServerMessage(response: any) {
    const content = response.serverContent;
    if (!content) return;

    // Audio from the model
    if (content.modelTurn?.parts) {
        for (const part of content.modelTurn.parts) {
            if (part.inlineData) {
                const audioBase64 = part.inlineData.data;
                // Decode and play this 24kHz PCM audio
            }
        }
    }

    // Transcription of what the user said
    if (content.inputTranscription) {
        console.log('User:', content.inputTranscription.text);
    }

    // Transcription of what the model said
    if (content.outputTranscription) {
        console.log('Model:', content.outputTranscription.text);
    }

    // Model was interrupted by user speech
    if (content.interrupted) {
        // Stop playback immediately, discard buffered audio
    }

    // Model finished its response
    if (content.generationComplete) {
        // Response complete
    }

    // Tool calls
    if (response.toolCall) {
        handleToolCall(response.toolCall);
    }
}
```

## Full Config Object

```typescript
import {
    GoogleGenAI,
    Modality,
    StartSensitivity,
    EndSensitivity,
} from '@google/genai';

const config = {
    responseModalities: [Modality.AUDIO],

    // Voice selection
    speechConfig: {
        voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
    },

    // Enable transcriptions
    outputAudioTranscription: {},
    inputAudioTranscription: {},

    // System instructions
    systemInstruction: {
        parts: [{ text: 'You are a helpful voice assistant.' }],
    },

    // Thinking (3.1: thinkingLevel; 2.5: thinkingBudget)
    thinkingConfig: {
        thinkingLevel: 'low',       // minimal, low, medium, high
        includeThoughts: true,
    },

    // Voice Activity Detection
    realtimeInputConfig: {
        automaticActivityDetection: {
            disabled: false,
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
            prefixPaddingMs: 20,
            silenceDurationMs: 100,
        },
    },

    // Extend sessions beyond default limits
    contextWindowCompression: {
        slidingWindow: {},
    },

    // Resume after disconnection
    sessionResumption: {
        handle: null,  // pass previous handle to resume
    },

    // Video resolution
    mediaResolution: 'MEDIA_RESOLUTION_LOW',

    // Tools
    tools: [
        { functionDeclarations: [/* ... */] },
        { googleSearch: {} },
    ],
};
```

## Voice Activity Detection (VAD)

### Automatic VAD (default)

Server detects speech start/end. Configure sensitivity:

```typescript
realtimeInputConfig: {
    automaticActivityDetection: {
        startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
        endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
        prefixPaddingMs: 20,
        silenceDurationMs: 100,
    },
},
```

### Manual VAD

Disable automatic detection and control turn boundaries:

```typescript
const config = {
    responseModalities: [Modality.AUDIO],
    realtimeInputConfig: {
        automaticActivityDetection: { disabled: true },
    },
};

// Mark speech boundaries manually
session.sendRealtimeInput({ activityStart: {} });
session.sendRealtimeInput({
    audio: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' },
});
session.sendRealtimeInput({ activityEnd: {} });
```

### Audio Stream Pause

When the mic is off for more than 1 second (automatic VAD mode):

```typescript
session.sendRealtimeInput({ audioStreamEnd: true });
```

## Tool Calling (Function Calling)

Define tools in config, handle in `onmessage`:

```typescript
const config = {
    responseModalities: [Modality.AUDIO],
    tools: [{
        functionDeclarations: [{
            name: 'get_weather',
            description: 'Get current weather for a city',
            parameters: {
                type: 'object',
                properties: {
                    city: { type: 'string', description: 'City name' },
                },
                required: ['city'],
            },
        }],
    }],
};

function handleToolCall(toolCall: any) {
    const functionResponses = toolCall.functionCalls.map((fc: any) => ({
        name: fc.name,
        id: fc.id,
        response: { result: myToolHandler(fc.name, fc.args) },
    }));
    session.sendToolResponse({ functionResponses });
}
```

## Seeding Conversation History

Pre-load context before the live session begins:

```typescript
session.sendClientContent({
    turns: [
        { role: 'user', parts: [{ text: 'What is Echo?' }] },
        { role: 'model', parts: [{ text: 'Echo is a story-to-3D-world app.' }] },
    ],
    turnComplete: true,
});
```

**Gemini 3.1 Flash Live:** `sendClientContent` is only for initial history
seeding. After the first model turn, use `sendRealtimeInput({ text: ... })`.

**Gemini 2.5 Flash Live:** `sendClientContent` works throughout the conversation.

## Session Management

### Session Duration Limits

| Mode | Duration |
|---|---|
| Audio only | 15 min |
| Audio + video | 2 min |
| WebSocket connection | ~10 min |

### Context Window Compression

```typescript
contextWindowCompression: { slidingWindow: {} }
```

### Session Resumption

Store the handle from server updates and pass it when reconnecting:

```typescript
let sessionHandle: string | null = null;

// In onmessage callback:
if (response.sessionResumptionUpdate?.newHandle) {
    sessionHandle = response.sessionResumptionUpdate.newHandle;
}

// When reconnecting:
const config = {
    responseModalities: [Modality.AUDIO],
    sessionResumption: { handle: sessionHandle },
};
```

## Best Practices

- **Audio chunks:** Send 20-40ms chunks. Do not buffer more than 1 second.
- **Resampling:** Browser mic input (44.1/48 kHz) must be resampled to 16 kHz. Use AudioWorklet or OfflineAudioContext.
- **Interruption handling:** When `interrupted: true`, immediately discard buffered audio.
- **Session management:** Always enable context window compression for production.
- **Non-English:** Add `RESPOND IN {LANGUAGE}. YOU MUST RESPOND UNMISTAKABLY IN {LANGUAGE}.` to system instructions.

## Advanced Topics

See [references/advanced.md](references/advanced.md) for:
- Raw WebSocket API (no SDK)
- Ephemeral tokens for browser clients
- Async function calling (Gemini 2.5 Flash Live only)

## Useful Links

- Live API overview: ai.google.dev/gemini-api/docs/live-api
- JS SDK docs: googleapis.github.io/js-genai/
- WebSocket tutorial: ai.google.dev/gemini-api/docs/live-api/get-started-websocket
- Session management: ai.google.dev/gemini-api/docs/live-api/session-management
