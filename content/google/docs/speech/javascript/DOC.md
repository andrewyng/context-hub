---
name: speech
description: "Google Cloud Speech-to-Text Node.js client library for v1 and v2 transcription workflows"
metadata:
  languages: "javascript"
  versions: "7.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,speech,speech-to-text,transcription,audio,javascript,nodejs"
---

# `@google-cloud/speech` JavaScript Package Guide

Use `@google-cloud/speech` in Node.js code that needs Google Cloud Speech-to-Text. The package ships multiple API surfaces, so decide up front whether your code is using the classic `v1` client or the newer `v2` client.

## Golden Rule

- Choose `v1` or `v2` explicitly in your imports and keep the request types consistent with that choice.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass credentials explicitly.
- Use `v1.recognize()` for short synchronous requests, `v1.longRunningRecognize()` for longer Cloud Storage jobs, and `v1.streamingRecognize()` for live or chunked audio streams.
- Use `v2` for new integrations that need recognizers, auto-decoding, or batch workflows.
- For `v2`, always set the `recognizer` resource name; the `_` recognizer is the usual one-off path.
- Prefer `gs://...` inputs for longer audio instead of sending large local payloads.

This guide covers `7.3.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/speech@7.3.0
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key.

Enable the API in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable speech.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Minimum setup:

1. Enable the Speech-to-Text API in the target project.
2. Make sure the credential resolves to the project and principal you expect.
3. Set `GOOGLE_CLOUD_PROJECT` for `v2` code so recognizer resource names are easy to build.

## Choose The Right Surface

### Use `v1` when

- you already have code built around `audio` plus `config` request objects
- you need classic synchronous, long-running, or streaming recognition samples
- you are maintaining an older integration and want the smallest change set

### Use `v2` when

- you are building a new integration
- you want `autoDecodingConfig`
- you need recognizer resources or batch recognition workflows
- you need regional endpoints and recognizer locations to line up explicitly

Do not mix `v1` request shapes with a `v2` client, or vice versa.

## Initialize The Client

### `v1` client

CommonJS:

```javascript
const {v1: speech} = require('@google-cloud/speech');

const client = new speech.SpeechClient();
```

ES modules:

```javascript
import {v1 as speech} from '@google-cloud/speech';

const client = new speech.SpeechClient();
```

### `v2` client

CommonJS:

```javascript
const {v2: speechV2} = require('@google-cloud/speech');

const client = new speechV2.SpeechClient();
```

ES modules:

```javascript
import {v2 as speechV2} from '@google-cloud/speech';

const client = new speechV2.SpeechClient();
```

With explicit project ID and key file:

```javascript
const {v2: speechV2} = require('@google-cloud/speech');

const client = new speechV2.SpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Core Workflows

### `v1`: Transcribe A Short Local File

Use `recognize()` for short request-response jobs. For raw PCM input, make sure the encoding and sample rate match the source audio.

```javascript
const fs = require('node:fs/promises');
const {v1: speech} = require('@google-cloud/speech');

const client = new speech.SpeechClient();

async function recognizeFile(filePath) {
  const content = await fs.readFile(filePath);

  const [response] = await client.recognize({
    audio: {content},
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
    },
  });

  for (const result of response.results ?? []) {
    const alternative = result.alternatives?.[0];
    if (alternative) {
      console.log(alternative.transcript);
    }
  }

  return response;
}

recognizeFile('./audio.raw').catch(console.error);
```

### `v1`: Transcribe Longer Audio From Cloud Storage

Use `longRunningRecognize()` when the source audio is already in Cloud Storage or the job should run asynchronously.

```javascript
const {v1: speech} = require('@google-cloud/speech');

const client = new speech.SpeechClient();

async function recognizeFromGcs(uri) {
  const [operation] = await client.longRunningRecognize({
    audio: {uri},
    config: {
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
    },
  });

  const [response] = await operation.promise();

  for (const result of response.results ?? []) {
    const alternative = result.alternatives?.[0];
    if (alternative) {
      console.log(alternative.transcript);
    }
  }

  return response;
}

recognizeFromGcs('gs://my-bucket/audio.flac').catch(console.error);
```

### `v1`: Stream Chunked Audio

Use `streamingRecognize()` for microphone-style or chunked audio flows. The stream must match the config you send.

```javascript
const fs = require('node:fs');
const {v1: speech} = require('@google-cloud/speech');

const client = new speech.SpeechClient();

function streamAudio(filePath) {
  const recognizeStream = client
    .streamingRecognize({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
      interimResults: true,
    })
    .on('error', console.error)
    .on('data', data => {
      const transcript = data.results?.[0]?.alternatives?.[0]?.transcript;
      if (transcript) {
        console.log(transcript);
      }
    });

  fs.createReadStream(filePath).pipe(recognizeStream);
  return recognizeStream;
}

streamAudio('./audio.raw');
```

If you start from a WAV, MP3, or other containerized file instead of raw chunks, prefer `recognize()` or `longRunningRecognize()` unless you decode the stream first.

### `v2`: Recognize A Local File With Auto-Decoding

This is the cleanest `v2` quickstart. The `_` recognizer avoids creating a dedicated recognizer resource for one-off requests.

```javascript
const fs = require('node:fs/promises');
const {v2: speechV2} = require('@google-cloud/speech');

const client = new speechV2.SpeechClient();

async function recognizeV2(filePath) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const content = await fs.readFile(filePath);

  const [response] = await client.recognize({
    recognizer: `projects/${projectId}/locations/global/recognizers/_`,
    config: {
      autoDecodingConfig: {},
      languageCodes: ['en-US'],
      model: 'short',
    },
    content,
  });

  for (const result of response.results ?? []) {
    const alternative = result.alternatives?.[0];
    if (alternative) {
      console.log(alternative.transcript);
    }
  }

  return response;
}

recognizeV2('./audio.wav').catch(console.error);
```

### `v2`: Batch Recognize Audio From Cloud Storage

Use `batchRecognize()` for asynchronous `v2` processing from Cloud Storage. Write results to Cloud Storage when another system needs to read the output later.

```javascript
const {v2: speechV2} = require('@google-cloud/speech');

const client = new speechV2.SpeechClient();

async function batchRecognizeToGcs(audioUri, outputUri) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;

  const [operation] = await client.batchRecognize({
    recognizer: `projects/${projectId}/locations/global/recognizers/_`,
    config: {
      autoDecodingConfig: {},
      languageCodes: ['en-US'],
      model: 'long',
    },
    files: [{uri: audioUri}],
    recognitionOutputConfig: {
      gcsOutputConfig: {
        uri: outputUri,
      },
    },
  });

  await operation.promise();
}

batchRecognizeToGcs(
  'gs://my-bucket/audio.wav',
  'gs://my-bucket/transcripts/'
).catch(console.error);
```

## Regional Endpoints For `v2`

If you need a regional endpoint, keep the API endpoint and recognizer location aligned.

```javascript
const {v2: speechV2} = require('@google-cloud/speech');

const client = new speechV2.SpeechClient({
  apiEndpoint: 'us-speech.googleapis.com',
});

const recognizer = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/us/recognizers/_`;
```

Do not pair `us-speech.googleapis.com` with `locations/global`.

## Response Handling

The common shapes are:

```javascript
const [response] = await client.recognize(request);
```

and for long-running operations:

```javascript
const [operation] = await client.longRunningRecognize(request);
const [response] = await operation.promise();
```

or in `v2`:

```javascript
const [operation] = await client.batchRecognize(request);
const [response] = await operation.promise();
```

For transcript text, most flows read `response.results` and then the first alternative from each result.

## Common Pitfalls

- The package exports multiple surfaces. Be explicit with `v1` or `v2` imports instead of mixing examples.
- `v2` requests need a `recognizer` field. `GOOGLE_CLOUD_PROJECT` is usually the easiest way to build that path.
- `streamingRecognize()` expects chunked audio that matches the request config. Do not pipe arbitrary file formats into it and expect automatic decoding.
- `recognize()` is the synchronous path. Move longer jobs to `longRunningRecognize()` or `batchRecognize()` instead of forcing large inline payloads.
- Regional `v2` endpoints and recognizer locations must match.
- This client uses Google Cloud credentials, not an API key.
- The package also includes `v1p1beta1`. Use it only when you specifically need that surface; do not choose it by default for new code.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/speech/latest`
- Speech-to-Text client library quickstart: `https://cloud.google.com/speech-to-text/docs/transcribe-client-libraries`
- Speech-to-Text migration guide: `https://cloud.google.com/speech-to-text/docs/migration`
- Application Default Credentials: `https://cloud.google.com/docs/authentication/application-default-credentials`
- npm package page: `https://www.npmjs.com/package/@google-cloud/speech`
