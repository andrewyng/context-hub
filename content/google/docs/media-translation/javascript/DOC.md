---
name: media-translation
description: "Google Cloud Media Translation Node.js client for bidirectional streaming speech translation"
metadata:
  languages: "javascript"
  versions: "5.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud-media-translation,google-cloud,media-translation,translation,speech,streaming,gcp,javascript,nodejs"
---

# `@google-cloud/media-translation` JavaScript Package Guide

Use `@google-cloud/media-translation` when your Node.js app needs Google Cloud Media Translation for bidirectional streaming speech translation. This package is narrow by design: it is for live audio translation streams, not for general text translation or batch document translation.

If you need text translation, glossaries, or document translation, use `@google-cloud/translate` instead.

## Golden Rule

- Use the `v1beta1` client surface for this package.
- Authenticate with Google Cloud Application Default Credentials (ADC), not an API key.
- Send one config message first, then send audio chunks in later messages.
- Make `audioEncoding` and `sampleRateHertz` match the actual bytes you stream.
- Treat `streamingTranslateSpeech()` as an event-driven bidirectional stream.

This guide covers `5.2.1`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/media-translation@5.2.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key.

Enable the Media Translation API in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable mediatranslation.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

If you need to use a service account key file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Prefer attached service-account credentials on Google Cloud over shipping JSON key files.

## Initialize The Client

CommonJS:

```javascript
const {v1beta1} = require('@google-cloud/media-translation');

const client = new v1beta1.SpeechTranslationServiceClient();
```

ES modules:

```javascript
import {v1beta1} from '@google-cloud/media-translation';

const client = new v1beta1.SpeechTranslationServiceClient();
```

If you need to override the default endpoint or pass explicit credentials, provide standard client options when constructing the client:

```javascript
const {v1beta1} = require('@google-cloud/media-translation');

const client = new v1beta1.SpeechTranslationServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  apiEndpoint: 'mediatranslation.googleapis.com',
});
```

## Core Workflow: Stream Audio And Read Translations

`streamingTranslateSpeech()` is the main API call. The request stream has one important rule:

- The first message must contain `streamingConfig` and no audio bytes.
- All later messages must contain `audioContent` and no config.

This example streams raw 16 kHz mono PCM (`LINEAR16`) from a local file and logs both interim recognition text and translated text when those fields are present in the response stream:

```javascript
const fs = require('node:fs');
const {v1beta1} = require('@google-cloud/media-translation');

function translateAudioFile(filePath) {
  const client = new v1beta1.SpeechTranslationServiceClient();

  const stream = client
    .streamingTranslateSpeech()
    .on('error', err => {
      console.error('Media Translation stream error:', err.message);
    })
    .on('data', response => {
      if (response.error) {
        console.error('API error:', response.error.message);
        return;
      }

      const result = response.result;
      if (!result) {
        return;
      }

      const status = result.isFinal ? 'final' : 'interim';

      if (result.recognitionResult?.text) {
        console.log(`[${status}] transcript: ${result.recognitionResult.text}`);
      }

      if (result.textTranslationResult?.translation) {
        console.log(
          `[${status}] translation: ${result.textTranslationResult.translation}`
        );
      }
    })
    .on('end', () => {
      console.log('Translation stream finished');
    });

  stream.write({
    streamingConfig: {
      audioConfig: {
        audioEncoding: 'LINEAR16',
        sampleRateHertz: 16000,
      },
      sourceLanguageCode: 'en-US',
      targetLanguageCode: 'es-ES',
      singleUtterance: false,
    },
  });

  fs.createReadStream(filePath, {highWaterMark: 4096})
    .on('data', chunk => {
      stream.write({audioContent: chunk});
    })
    .on('end', () => {
      stream.end();
    })
    .on('error', err => {
      stream.destroy(err);
    });

  return stream;
}

translateAudioFile('./speech.raw');
```

Adjust these fields to match your real stream:

- `audioEncoding`: must match the bytes you actually send
- `sampleRateHertz`: must match the source stream sample rate
- `sourceLanguageCode`: BCP-47 language tag for the spoken input
- `targetLanguageCode`: BCP-47 language tag for translated output
- `singleUtterance`: set `true` if the server should stop after one utterance

## Response Handling Notes

This API is a bidirectional stream, so the normal usage pattern is event-based rather than `const [response] = await ...`.

The response stream can contain:

- `response.error` for request-level failures
- `response.result.recognitionResult.text` for recognized speech text
- `response.result.textTranslationResult.translation` for translated text
- `response.result.isFinal` to distinguish interim from final results

If your app only needs the translated output, ignore `recognitionResult` and read `textTranslationResult.translation`.

## Common Pitfalls

- Do not send audio bytes in the first request. Start with `streamingConfig` only.
- Do not resend `streamingConfig` after the first message. Later writes should only include `audioContent`.
- `audioContent` is raw bytes. Do not base64-encode it.
- Do not stream a WAV or other container format unless the bytes and config match what the API expects.
- Bad `audioEncoding` or `sampleRateHertz` values usually show up as poor transcripts, poor translations, or request failures.
- This package is for streaming speech translation. It is not the right client for general text translation workflows.
- The package surface is beta-oriented (`v1beta1`), so check the maintainer reference before upgrading across package versions.

## Version Notes For 5.2.1

- This guide targets `@google-cloud/media-translation` version `5.2.1`.
- The practical client surface is the `v1beta1` namespace.
- The core integration pattern is still `streamingTranslateSpeech()` with a config-first request stream.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/media-translation/latest`
- npm package page: `https://www.npmjs.com/package/@google-cloud/media-translation`
- Media Translation product docs: `https://cloud.google.com/media-translation/docs`
- Application Default Credentials: `https://cloud.google.com/docs/authentication/application-default-credentials`
