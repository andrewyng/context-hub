---
name: speech
description: "Deepgram JavaScript SDK coding guidelines for speech recognition, text-to-speech, and audio intelligence"
metadata:
  languages: "javascript"
  versions: "5.3.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "deepgram,speech,transcription,tts,audio"
---

# Deepgram JavaScript SDK Coding Guidelines

You are a Deepgram API coding expert. Help me with writing code using the Deepgram JavaScript SDK for speech recognition, text-to-speech, voice agents, and text intelligence.

Please follow the following guidelines when generating code.

You can find the official SDK documentation and code samples here:
https://developers.deepgram.com/

## Golden Rule: Use the Current Official SDK

Always use the official Deepgram JavaScript SDK, which is the standard library for all Deepgram API interactions.

- **Library Name:** Deepgram JavaScript SDK
- **NPM Package:** `@deepgram/sdk`
- **Minimum Node.js Version:** 18.0.0

**Installation:**

```bash
npm install @deepgram/sdk
```

**APIs and Usage:**

- **Correct (v5):** `import { DeepgramClient } from "@deepgram/sdk"`
- **Correct (v5):** `const client = new DeepgramClient({ apiKey: DEEPGRAM_API_KEY })`

## Initialization and API Key

The `@deepgram/sdk` library requires creating a `DeepgramClient` instance for all API calls.

- Always construct with `new DeepgramClient(...)`
- Pass your Deepgram API key in the constructor, or set the `DEEPGRAM_API_KEY` environment variable
- Get your free API key from: https://console.deepgram.com/signup?jump=keys

```javascript
import { DeepgramClient } from "@deepgram/sdk";

// Reads DEEPGRAM_API_KEY from env if no options are passed
const client = new DeepgramClient();

// Or pass the API key explicitly
const explicit = new DeepgramClient({ apiKey: "YOUR_API_KEY" });
```

## Models

### Speech Recognition Models

By default, use the following models for speech recognition:

- **General Purpose (Recommended):** `nova-3` or `nova-3-general`
- **Medical Applications:** `nova-3-medical` or `nova-2-medical`
- **Phone Call Audio:** `nova-2-phonecall`
- **Highest Accuracy / Latest:** `nova-3`

### Text-to-Speech Models

For text-to-speech, use the Aura model series:

- **Recommended Default:** `aura-2-thalia-en`
- **Available Voices:** All `aura-2-*` models for various voice characteristics

## Speech Recognition (Transcription)

### Prerecorded - Transcribe from URL

```javascript
import { DeepgramClient } from "@deepgram/sdk";

const client = new DeepgramClient();

const response = await client.listen.v1.media.transcribeUrl(
  { url: "https://example.com/audio.wav" },
  { model: "nova-3", smartFormat: true, language: "en" }
);

console.log(response.results.channels[0].alternatives[0].transcript);
```

### Prerecorded - Transcribe from File / Buffer

```javascript
import { createReadStream, readFileSync } from "fs";
import { DeepgramClient } from "@deepgram/sdk";

const client = new DeepgramClient();

// From a readable stream
const fromStream = await client.listen.v1.media.transcribeFile(
  createReadStream("./audio.wav"),
  { model: "nova-3", smartFormat: true, diarize: true, utterances: true }
);

// From a buffer
const fromBuffer = await client.listen.v1.media.transcribeFile(
  readFileSync("./audio.wav"),
  { model: "nova-3" }
);

console.log(fromStream.results.channels[0].alternatives[0].transcript);
```

### Common Transcription Options

- `model`: Speech recognition model to use
- `language`: Language code (e.g., `"en"`, `"es"`, `"fr"`) or `"multi"`
- `punctuate`: Add punctuation
- `diarize`: Speaker identification
- `smartFormat`: Automatic punctuation, numerals, dates, etc.
- `utterances`: Group transcripts into utterances
- `keyterm`: Keyword detection (Nova 3 only)

### Live Streaming Transcription (WebSocket)

```javascript
import { DeepgramClient } from "@deepgram/sdk";

const client = new DeepgramClient();

const connection = await client.listen.v1.connect({
  model: "nova-3",
  language: "en",
  smartFormat: true,
  interimResults: true,
});

connection.on("open", () => console.log("Connection opened"));

connection.on("message", (data) => {
  if (data.type === "Results") {
    console.log(data.channel.alternatives[0].transcript);
  }
});

connection.on("error", (error) => console.error("Error:", error));
connection.on("close", () => console.log("Connection closed"));

connection.connect();
await connection.waitForOpen();

// Send raw 16-bit PCM audio frames
connection.socket.send(audioData);
```

## Text-to-Speech

### REST API (One-off requests)

```javascript
import { DeepgramClient } from "@deepgram/sdk";
import { createWriteStream } from "fs";

const client = new DeepgramClient();

const response = await client.speak.v1.audio.generate({
  text: "Hello, how are you today?",
  model: "aura-2-thalia-en",
  encoding: "linear16",
  container: "wav",
});

// Pipe the audio stream to a file
const audioStream = response.stream();
audioStream.pipe(createWriteStream("output.wav"));
```

### WebSocket (Streaming TTS)

```javascript
const connection = await client.speak.v1.connect({
  model: "aura-2-thalia-en",
  encoding: "linear16",
  sampleRate: 24000,
});

connection.on("open", () => {
  connection.sendText("Hello world from Deepgram streaming TTS.");
  // Important: flush after sending text so the server begins synthesis
  connection.flush();
});

connection.on("message", (audioChunk) => {
  // audioChunk contains raw audio bytes
});

connection.connect();
```

## Voice Agent

```javascript
import { DeepgramClient } from "@deepgram/sdk";

const client = new DeepgramClient();
const agent = client.agent.v1.connect();

agent.on("open", () => {
  agent.configure({
    audio: {
      input: { encoding: "linear16", sampleRate: 16000 },
      output: { encoding: "linear16", container: "wav", sampleRate: 24000 },
    },
    agent: {
      listen: { provider: { type: "deepgram", model: "nova-3" } },
      speak: { provider: { type: "deepgram", model: "aura-2-thalia-en" } },
      think: {
        provider: { type: "anthropic", model: "claude-3-haiku-20240307" },
        prompt: "You are a helpful AI assistant.",
      },
    },
  });
});

agent.on("audio", (audio) => {
  // Handle audio bytes from the agent
});

agent.on("conversationText", (message) => {
  console.log(`${message.role} said: ${message.content}`);
});

agent.connect();
```

## Error Handling

The v5 SDK throws on error rather than returning `{ result, error }`. Wrap calls
in `try/catch`.

```javascript
try {
  const response = await client.listen.v1.media.transcribeUrl(
    { url: "https://example.com/audio.wav" },
    { model: "nova-3" }
  );
  console.log(response.results.channels[0].alternatives[0].transcript);
} catch (error) {
  console.error("Deepgram error:", error);
}
```

## Text Intelligence

```javascript
const response = await client.read.v1.text.analyze(
  { text: "Your text content here" },
  { language: "en", topics: true, sentiment: true }
);
```

## Captions Generation

```javascript
import { webvtt, srt } from "@deepgram/captions";

// After a prerecorded transcription
const vttOutput = webvtt(response);
const srtOutput = srt(response);
```

## Migration Notes (v4 → v5)

- Client construction: use `new DeepgramClient(...)` instead of `createClient(...)`.
- Prerecorded transcription moved under `client.listen.v1.media.transcribeUrl`
  and `client.listen.v1.media.transcribeFile`.
- Live transcription uses `client.listen.v1.connect(options)` and emits
  `"open" | "message" | "error" | "close"` events. Use `connection.connect()`
  and `connection.waitForOpen()` before sending audio.
- TTS REST moved to `client.speak.v1.audio.generate(...)`. The response exposes
  a `stream()` method returning a readable stream of audio bytes.
- TTS streaming uses `client.speak.v1.connect(options)` with `sendText()` /
  `flush()`.
- Responses are returned directly (or throw) rather than wrapped in
  `{ result, error }`.

## Common Mistakes to Avoid

- Don't use deprecated v4 APIs like `deepgram.listen.prerecorded.transcribeUrl`
- Don't forget to call `flush()` when using live text-to-speech
- Don't use keyterm detection with non-Nova-3 models
- Don't hardcode API keys in your source code - use environment variables
- Always handle errors with try/catch on every async API call

## Browser Support

The SDK works in browsers with UMD and ESM support:

```html
<!-- ESM -->
<script type="module">
  import { DeepgramClient } from "https://cdn.jsdelivr.net/npm/@deepgram/sdk/+esm";
  const client = new DeepgramClient({ apiKey: "your-api-key" });
</script>
```

## Useful Links

- Documentation: https://developers.deepgram.com/
- API Reference: https://developers.deepgram.com/reference/
- Models Guide: https://developers.deepgram.com/docs/model
- Getting API Keys: https://console.deepgram.com/signup?jump=keys

## Notes

- The SDK strictly follows semantic versioning
- The SDK supports both Node.js (18+) and browser environments
- For production applications, implement proper error handling and logging
- Consider using environment variables for API key management
