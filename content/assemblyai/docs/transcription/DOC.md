---
name: transcription
description: "AssemblyAI JavaScript SDK coding guide for speech-to-text transcription"
metadata:
  languages: "javascript"
  versions: "4.33.3"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "assemblyai,transcription,speech-to-text,audio,ai"
---

# AssemblyAI JavaScript SDK Coding Guide

## 1. Golden Rule

**Always use the official AssemblyAI JavaScript SDK:**

Package name: `assemblyai`

To check the latest version, run:
```bash
npm view assemblyai version
```

**Never use deprecated, unofficial, or direct HTTP clients.** The official
`assemblyai` package is the only supported JavaScript/TypeScript SDK maintained
by AssemblyAI. It provides type-safe interfaces, automatic polling, streaming
support, and simplified error handling.

## 2. Installation

### npm
```bash
npm install assemblyai
```

### yarn
```bash
yarn add assemblyai
```

### pnpm
```bash
pnpm add assemblyai
```

**Environment Variables (Required):**
```bash
ASSEMBLYAI_API_KEY=your_api_key_here
```

**Get your API key:**

Sign up at https://www.assemblyai.com, navigate to the AssemblyAI Dashboard, and
copy your API key.

## 3. Initialization

### Basic Client Initialization
```javascript
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});
```

### With Custom Configuration
```javascript
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
  // Optional: custom base URL (for testing or proxy)
  baseUrl: "https://api.assemblyai.com",
});
```

**Authentication Best Practice:**
Always store API keys in environment variables, never hardcode them in source
code.

## 4. Core API Surfaces

### 4.1 Async Transcription

Async transcription processes pre-recorded audio files. `transcribe()`
automatically polls the transcription status until completion.

**Minimal Example (Transcribe from URL):**
```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/audio.mp3",
  speech_models: ["universal-3-pro", "universal-2"],
});

console.log(transcript.text);
```

**Minimal Example (Transcribe from Local File):**
```javascript
const transcript = await client.transcripts.transcribe({
  audio: "./path/to/local/audio.mp3",
  speech_models: ["universal-3-pro", "universal-2"],
});

console.log(transcript.text);
```

**Speech Model Selection:**

AssemblyAI lets you pass an ordered list of preferred models via
`speech_models`. The first available model that supports the audio's language
will be used. Recommended defaults:

- `universal-3-pro` - highest accuracy general-purpose model
- `universal-2` - reliable fallback with broad language coverage

**Advanced Example with Audio Intelligence:**
```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/meeting.mp3",
  speech_models: ["universal-3-pro", "universal-2"],

  // Speaker identification
  speaker_labels: true,
  speakers_expected: 2,

  // Audio intelligence features
  sentiment_analysis: true,
  entity_detection: true,
  auto_highlights: true,
  content_safety: true,
  iab_categories: true,

  // Language detection
  language_detection: true,

  // Formatting options
  format_text: true,
  punctuate: true,
  disfluencies: false,

  // Custom vocabulary
  word_boost: ["AssemblyAI", "JavaScript", "Node.js"],
  boost_param: "high",
});

console.log(transcript.text);
console.log(transcript.sentiment_analysis_results);
console.log(transcript.entities);
console.log(transcript.auto_highlights_result);
```

**Transcribe Without Waiting (Submit + Manual Retrieve):**
```javascript
// Submit transcription without waiting
const submitted = await client.transcripts.submit({
  audio: "https://example.com/audio.mp3",
  speech_models: ["universal-3-pro", "universal-2"],
  webhook_url: "https://your-domain.com/webhook",
});

console.log(submitted.id); // Use this ID to check status later

// Later, retrieve the transcript
const result = await client.transcripts.get(submitted.id);
if (result.status === "completed") {
  console.log(result.text);
} else if (result.status === "error") {
  console.error(result.error);
}
```

**Polling Helper:**
```javascript
const submitted = await client.transcripts.submit({
  audio: "https://example.com/audio.mp3",
});

// Wait until the transcript is ready (polls automatically)
const transcript = await client.transcripts.waitUntilReady(submitted.id, {
  pollingInterval: 1000,
});
console.log(transcript.text);
```

### 4.2 Real-Time Streaming Transcription

Real-time transcription is exposed through `client.streaming.transcriber(...)`.
It provides live speech-to-text with low latency.

**Minimal Example:**
```javascript
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const transcriber = client.streaming.transcriber({
  speechModel: "u3-rt-pro",
  sampleRate: 16000,
  formatTurns: true,
});

transcriber.on("open", ({ id }) => {
  console.log("Session opened:", id);
});

transcriber.on("turn", ({ transcript }) => {
  if (transcript) console.log("Transcript:", transcript);
});

transcriber.on("error", (error) => {
  console.error("Error:", error);
});

transcriber.on("close", (code, reason) => {
  console.log("Session closed:", code, reason);
});

// Connect to the streaming service
await transcriber.connect();

// Send audio data (16-bit PCM)
transcriber.sendAudio(audioChunk);

// Close when done
await transcriber.close();
```

**Streaming from a Microphone Stream:**
```javascript
const transcriber = client.streaming.transcriber({
  speechModel: "u3-rt-pro",
  sampleRate: 16000,
  formatTurns: true,
});

await transcriber.connect();

const stream = getMicrophoneStream(); // Your audio source
stream.on("data", (chunk) => {
  transcriber.sendAudio(chunk);
});
```

**Streaming with a Temporary Token (Client-Side Security):**
```javascript
// Server-side: mint a short-lived token
const { token } = await client.streaming.createTemporaryToken({
  expires_in_seconds: 3600,
});

// Client-side: use the token instead of your API key
const transcriber = client.streaming.transcriber({
  token,
  speechModel: "u3-rt-pro",
  sampleRate: 16000,
});
```

### 4.3 PII Redaction

Automatically detect and redact categories of Personally Identifiable
Information (PII).

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/audio.mp3",
  redact_pii: true,
  redact_pii_policies: [
    "us_social_security_number",
    "credit_card_number",
    "credit_card_cvv",
    "date_of_birth",
    "drivers_license",
    "email_address",
    "phone_number",
    "medical_condition",
    "medication",
    "person_name",
  ],
  redact_pii_sub: "hash", // "hash" or "entity_name"

  // Optionally also produce a redacted audio file
  redact_pii_audio: true,
  redact_pii_audio_quality: "mp3", // "mp3" or "wav"
});

console.log(transcript.text);
console.log(transcript.redacted_audio_url);
```

See the official documentation for the full list of supported PII policies:
https://www.assemblyai.com/docs/audio-intelligence/pii-redaction

### 4.4 Speaker Diarization

Identify and label different speakers in audio.

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/meeting.mp3",
  speaker_labels: true,
  speakers_expected: 4, // optional hint
});

for (const utterance of transcript.utterances) {
  console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
}
```

### 4.5 LeMUR - Apply LLMs to Audio

LeMUR (Leveraging Large Language Models to Understand Recordings) applies LLMs
to transcribed speech for summarization, Q&A, action items, and custom tasks.

**Question & Answer:**
```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/meeting.mp3",
});

const { response } = await client.lemur.question({
  transcript_ids: [transcript.id],
  questions: [
    { question: "What were the main action items discussed?", answer_format: "bullet points" },
    { question: "Who was assigned to work on the new feature?" },
  ],
});

console.log(response);
```

**Summarization:**
```javascript
const { response } = await client.lemur.summary({
  transcript_ids: [transcript.id],
  answer_format: "one sentence",
  context: "This is a sales call between a sales rep and a potential customer",
});
```

**Action Items:**
```javascript
const { response } = await client.lemur.actionItems({
  transcript_ids: [transcript.id],
});
```

**Custom Task:**
```javascript
const { response } = await client.lemur.task({
  transcript_ids: [transcript.id],
  prompt: "Identify the key risks discussed and categorize them as technical, financial, or operational.",
  final_model: "anthropic/claude-3-5-sonnet",
});
```

### 4.6 Content Moderation

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/content.mp3",
  content_safety: true,
  content_safety_confidence: 75,
});

for (const result of transcript.content_safety_labels.results) {
  console.log(`${result.text}: ${result.labels.map((l) => l.label).join(", ")}`);
}
```

### 4.7 Topic Detection (IAB Classification)

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/podcast.mp3",
  iab_categories: true,
});

console.log("Detected topics:", transcript.iab_categories_result.summary);
```

### 4.8 Sentiment Analysis

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/customer-call.mp3",
  sentiment_analysis: true,
});

for (const result of transcript.sentiment_analysis_results) {
  console.log(`"${result.text}": ${result.sentiment}`);
}
```

### 4.9 Entity Detection

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/news.mp3",
  entity_detection: true,
});

for (const entity of transcript.entities) {
  console.log(`${entity.text} (${entity.entity_type})`);
}
```

### 4.10 Auto Highlights

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/meeting.mp3",
  auto_highlights: true,
});

for (const highlight of transcript.auto_highlights_result.results) {
  console.log(`${highlight.text} (rank: ${highlight.rank})`);
}
```

### 4.11 Export Subtitles (SRT / VTT)

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/video-audio.mp3",
});

const srt = await client.transcripts.subtitles(transcript.id, "srt");
const vtt = await client.transcripts.subtitles(transcript.id, "vtt");

// Optional chars-per-caption argument
const srtCustom = await client.transcripts.subtitles(transcript.id, "srt", 40);
```

### 4.12 Paragraphs and Sentences

```javascript
const paragraphs = await client.transcripts.paragraphs(transcript.id);
for (const para of paragraphs.paragraphs) {
  console.log(`[${para.start}ms - ${para.end}ms] ${para.text}`);
}

const sentences = await client.transcripts.sentences(transcript.id);
for (const s of sentences.sentences) {
  console.log({ text: s.text, start: s.start, end: s.end });
}
```

### 4.13 Word-Level Timestamps

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/speech.mp3",
});

for (const word of transcript.words) {
  console.log({
    text: word.text,
    start: word.start, // milliseconds
    end: word.end,
    confidence: word.confidence,
    speaker: word.speaker,
  });
}
```

## 5. Advanced Features

### 5.1 Language Detection and Multilingual Support

**Automatic Language Detection:**
```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/multilingual.mp3",
  language_detection: true,
});

console.log("Detected language:", transcript.language_code);
```

**Specify a Language:**
```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/spanish-audio.mp3",
  language_code: "es",
});
```

AssemblyAI supports 100+ languages. See the official documentation for the full
list of supported language codes:
https://www.assemblyai.com/docs/concepts/supported-languages

### 5.2 Custom Vocabulary and Word Boost

```javascript
const transcript = await client.transcripts.transcribe({
  audio: "https://example.com/tech-talk.mp3",
  word_boost: ["AssemblyAI", "Kubernetes", "GraphQL", "TypeScript"],
  boost_param: "high", // "low", "default", or "high"
});
```

### 5.3 Webhook Configuration

```javascript
const submitted = await client.transcripts.submit({
  audio: "https://example.com/audio.mp3",
  webhook_url: "https://your-domain.com/webhook/assemblyai",
  webhook_auth_header_name: "X-Webhook-Secret",
  webhook_auth_header_value: process.env.WEBHOOK_SECRET,
});
```

**Webhook Handler (Express Example):**
```javascript
import express from "express";

const app = express();
app.use(express.json());

app.post("/webhook/assemblyai", async (req, res) => {
  if (req.headers["x-webhook-secret"] !== process.env.WEBHOOK_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  const { transcript_id, status } = req.body;

  if (status === "completed") {
    const transcript = await client.transcripts.get(transcript_id);
    console.log(transcript.text);
  } else if (status === "error") {
    console.error("Transcription failed:", req.body.error);
  }

  res.sendStatus(200);
});
```

### 5.4 Delete Transcripts

```javascript
await client.transcripts.delete(transcript.id);
```

### 5.5 List Transcripts

```javascript
const page = await client.transcripts.list({
  limit: 10,
  status: "completed",
});

for (const t of page.transcripts) {
  console.log({ id: t.id, status: t.status, audio_duration: t.audio_duration });
}
```

## 6. TypeScript Usage

The AssemblyAI SDK is written in TypeScript and provides comprehensive type
definitions.

```typescript
import {
  AssemblyAI,
  TranscribeParams,
  Transcript,
  SentimentAnalysisResult,
  Entity,
  LemurTaskParams,
} from "assemblyai";

const params: TranscribeParams = {
  audio: "https://example.com/audio.mp3",
  speech_models: ["universal-3-pro", "universal-2"],
  speaker_labels: true,
  sentiment_analysis: true,
  entity_detection: true,
};

const transcript: Transcript = await client.transcripts.transcribe(params);

if (transcript.status === "completed") {
  const text: string = transcript.text;
  const sentiments: SentimentAnalysisResult[] | undefined =
    transcript.sentiment_analysis_results;
  const entities: Entity[] | undefined = transcript.entities;
}
```

**Type-Safe Streaming:**
```typescript
const transcriber = client.streaming.transcriber({
  speechModel: "u3-rt-pro",
  sampleRate: 16000,
  formatTurns: true,
});

transcriber.on("turn", ({ transcript, end_of_turn }) => {
  console.log({ transcript, end_of_turn });
});
```
