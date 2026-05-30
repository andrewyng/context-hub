---
name: text-to-speech
description: "ElevenLabs JS library coding guidelines for text-to-speech, TTS, and audio voice generation"
metadata:
  languages: "javascript"
  versions: "2.49.1"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "elevenlabs,text-to-speech,tts,audio,voice"
---

# ElevenLabs JS Library Coding Guidelines (JavaScript/TypeScript)

You are an ElevenLabs API coding expert. Help me with writing code using the ElevenLabs API calling the official libraries and SDKs.

Please follow the following guidelines when generating code.

You can find the official SDK documentation and code samples here:
https://elevenlabs.io/docs/api-reference

## Golden Rule: Use the Correct and Current SDK

Always use the official ElevenLabs JS SDK to call the ElevenLabs models and services, which is the standard library for all ElevenLabs API interactions.

- **Library Name:** ElevenLabs JS
- **NPM Package:** `@elevenlabs/elevenlabs-js`
- **Browser SDK:** `@elevenlabs/client` (for browser applications)
- **React SDK:** `@elevenlabs/react` (for React applications)

**Installation:**

- **Correct:** `npm install @elevenlabs/elevenlabs-js`
- **Correct:** `yarn add @elevenlabs/elevenlabs-js`

**APIs and Usage:**

- **Correct:** `import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"`
- **Correct:** `const elevenlabs = new ElevenLabsClient({ apiKey: "YOUR_API_KEY" })`
- **Correct:** `await elevenlabs.textToSpeech.convert(voiceId, { text: "...", modelId: "..." })`
- **Correct:** `await elevenlabs.voices.search()`

## Initialization and API Key

The `@elevenlabs/elevenlabs-js` library requires creating an `ElevenLabsClient` instance for all API calls.

- Always use `const elevenlabs = new ElevenLabsClient({})` to create an instance.
- Set the `ELEVENLABS_API_KEY` environment variable, which will be picked up automatically.
- Alternatively, pass the API key directly in the constructor.

```javascript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Uses the ELEVENLABS_API_KEY environment variable
const elevenlabs = new ElevenLabsClient();

// Or pass the API key directly
// const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
```

## Models

By default, use the following models when using ElevenLabs:

- **General Use (Stability & Quality):** `eleven_multilingual_v2`
    - Excels in stability, language diversity, and accent accuracy
    - Supports 29 languages
    - Recommended for most use cases

- **Ultra-Low Latency:** `eleven_flash_v2_5`
    - Fastest model available
    - Supports 32 languages
    - 50% lower price per character

- **Balanced Quality/Latency:** `eleven_turbo_v2_5`
    - Good balance of quality and latency
    - Ideal for developer use cases where speed is crucial
    - Supports 32 languages

## Basic Text-to-Speech

Here's how to convert text to speech using a voice:

```javascript
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
    apiKey: "YOUR_API_KEY", // Defaults to process.env.ELEVENLABS_API_KEY
});

const audio = await elevenlabs.textToSpeech.convert("VOICE_ID", {
    text: "Hello! This is a test of ElevenLabs text-to-speech.",
    modelId: "eleven_multilingual_v2",
});

await play(audio);
```

**Important Note:** elevenlabs-js requires MPV and ffmpeg to play audio locally.

## Voices

List all available voices and get voice details:

```javascript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient();

// List all voices
const voices = await elevenlabs.voices.search();

// Get specific voice details
const voice = await elevenlabs.voices.get("VOICE_ID");
```

## Voice Cloning (Instant Voice Clone)

Clone a voice from audio sample files. In Node.js you can pass `Blob`s or
`fs.ReadStream` instances as files.

```javascript
import * as fs from "fs";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient();

const voice = await elevenlabs.voices.ivc.create({
    name: "Alex",
    description: "An old American male voice with a slight hoarseness in his throat.",
    files: [
        new Blob([fs.readFileSync("./sample_0.mp3")], { type: "audio/mp3" }),
        new Blob([fs.readFileSync("./sample_1.mp3")], { type: "audio/mp3" }),
    ],
});

console.log("New voice id:", voice.voiceId);
```

## Saving Audio to Disk

`textToSpeech.convert` returns a `ReadableStream` of audio bytes. Pipe it to a
file or collect it into a `Buffer`.

```javascript
import * as fs from "fs";
import { Readable } from "stream";

const audio = await elevenlabs.textToSpeech.convert("VOICE_ID", {
    text: "Save me to disk.",
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
});

// Pipe a Web ReadableStream to a Node writable stream
Readable.fromWeb(audio).pipe(fs.createWriteStream("output.mp3"));
```

## Streaming Audio

Stream audio in real-time as it's being generated for lower latency:

```javascript
const audioStream = await elevenlabs.textToSpeech.stream("VOICE_ID", {
    text: "This is streaming text-to-speech",
    modelId: "eleven_multilingual_v2",
});

// Use the stream helper function to play
await stream(audioStream);
```

## Advanced Configurations

### Voice Settings

Customize voice parameters by providing voice settings:

```javascript
const audio = await elevenlabs.textToSpeech.convert("VOICE_ID", {
    text: "Custom voice settings example",
    modelId: "eleven_multilingual_v2",
    voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75
    }
});
```

### Output Formats

Specify different audio output formats:

```javascript
const audio = await elevenlabs.textToSpeech.convert("VOICE_ID", {
    text: "High quality audio example",
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128" // High quality MP3
});
```

Available formats include: `mp3_44100_128`, `pcm_44100`, `opus_48000_128`, and many others.

### Text-to-Speech with Timestamps

Generate speech with precise character-level timing information:

```javascript
const result = await elevenlabs.textToSpeech.convertWithTimestamps("VOICE_ID", {
    text: "This is a test for timing information.",
    modelId: "eleven_multilingual_v2"
});

// Result contains audioBase64 and alignment data
console.log(result.audioBase64); // Base64 encoded audio
console.log(result.alignment);   // Timing information
```

### Language Code Enforcement

Enforce specific languages for supported models:

```javascript
const audio = await elevenlabs.textToSpeech.convert("VOICE_ID", {
    text: "Bonjour! Comment allez-vous?",
    modelId: "eleven_turbo_v2_5", // Supports language enforcement
    languageCode: "fr" // French
});
```

### Pronunciation Dictionaries

Apply pronunciation dictionaries to improve speech accuracy:

```javascript
const audio = await elevenlabs.textToSpeech.convert("VOICE_ID", {
    text: "This text uses custom pronunciations",
    modelId: "eleven_multilingual_v2",
    pronunciationDictionaryLocators: [
        { pronunciationDictionaryId: "DICT_ID", versionId: "VERSION_ID" }
    ]
});
```

## Other Capabilities

### Speech-to-Speech

Convert audio from one voice to another:

```javascript
import * as fs from "fs";

const audioFile = fs.readFileSync("input_audio.mp3");
const audioStream = await elevenlabs.speechToSpeech.convert("TARGET_VOICE_ID", {
    audio: new Blob([audioFile], { type: "audio/mp3" }),
});
```

### Text-to-Voice Generation

Generate new voices from text descriptions:

```javascript
const previews = await elevenlabs.textToVoice.createPreviews({
    voiceDescription: "A warm and friendly female voice with a slight British accent",
    text: "This is a sample text that is at least one hundred characters long for voice generation."
});
```

### Sound Effects Generation

Create sound effects from text descriptions:

```javascript
const audioStream = await elevenlabs.textToSoundEffects.convert({
    text: "Thunder and rain sound effect",
    durationSeconds: 5,
});
```

### Speech-to-Text

Transcribe audio to text:

```javascript
const audioFile = fs.readFileSync("audio.mp3");
const transcription = await elevenlabs.speechToText.convert({
    file: new Blob([audioFile], { type: "audio/mp3" }),
    modelId: "scribe_v1",
});
```

### Audio Isolation

Remove background noise from audio:

```javascript
const audioFile = fs.readFileSync("noisy_audio.mp3");
const cleanAudio = await elevenlabs.audioIsolation.convert({
    audio: new Blob([audioFile], { type: "audio/mp3" }),
});
```

## Request Options and Error Handling

### Timeouts and Retries

Configure request timeouts and retry behavior:

```javascript
const audio = await elevenlabs.textToSpeech.convert(
    "VOICE_ID",
    {
        text: "Hello world",
        modelId: "eleven_multilingual_v2",
    },
    {
        timeoutInSeconds: 30, // Custom timeout
        maxRetries: 3,       // Custom retry count
    }
);
```

### Error Types

The library throws specific error types:

- `ElevenLabsError` - General API errors
- `UnprocessableEntityError` - Validation errors
- `ElevenLabsTimeoutError` - Timeout errors

## Webhooks

Handle ElevenLabs webhooks securely:

```javascript
const event = await elevenlabs.webhooks.constructEvent(
    requestBody,
    signatureHeader,
    webhookSecret
);
```

## Runtime Compatibility

The SDK works in multiple JavaScript runtimes:

- Node.js 15+
- Vercel
- Cloudflare Workers  
- Deno v1.25+
- Bun 1.0+

## API Errors

Handle API errors appropriately. The library includes automatic retries for specific HTTP status codes:

- 408 (Timeout)
- 409 (Conflict)  
- 429 (Too Many Requests)
- 5XX (Internal Server Errors)

## Useful Links

- Documentation: https://elevenlabs.io/docs/api-reference
- Models: https://elevenlabs.io/docs/models
- NPM Package: https://www.npmjs.com/package/@elevenlabs/elevenlabs-js
- Browser SDK: https://www.npmjs.com/package/@elevenlabs/client
- React SDK: https://www.npmjs.com/package/@elevenlabs/react

## Notes

- Always ensure you have valid API keys and sufficient credits
- For production applications, implement proper error handling and retry logic
- Consider using streaming for real-time applications to reduce perceived latency
- The `play` and `stream` functions require FFmpeg and MPV for local audio playback
- Voice IDs can be obtained from the voices endpoint or the ElevenLabs web interface

