---
name: video-intelligence
description: "Google Cloud Video Intelligence Node.js client for asynchronous video annotation from Cloud Storage or in-memory bytes"
metadata:
  languages: "javascript"
  versions: "6.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,video-intelligence,video,annotation,javascript,nodejs"
---

# `@google-cloud/video-intelligence` JavaScript Package Guide

Use `@google-cloud/video-intelligence` in Node.js code that needs to analyze video with Google Cloud Video Intelligence, including label detection, shot-change detection, text detection, object tracking, and speech transcription.

## Golden Rule

- Import the GA client from the `v1` namespace.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass credentials explicitly.
- Treat `annotateVideo()` as an asynchronous long-running operation and wait on `operation.promise()`.
- Prefer `inputUri` with a `gs://...` object for normal workloads; use `inputContent` only for smaller inputs you can safely hold in memory.
- Only read response sections that match the features you requested.
- Use `outputUri` when another system should consume the results later or when the response payload can be large.

This guide covers `6.2.1`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/video-intelligence@6.2.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key.

Enable the API in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable videointelligence.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
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

1. Enable the Video Intelligence API in the target project.
2. Make sure the credential resolves to the project and principal you expect.
3. Store source videos in Cloud Storage when they are too large to load comfortably into memory.

## Initialize The Client

CommonJS:

```javascript
const {v1: videoIntelligence} = require('@google-cloud/video-intelligence');

const client = new videoIntelligence.VideoIntelligenceServiceClient();
```

ES modules:

```javascript
import {v1 as videoIntelligence} from '@google-cloud/video-intelligence';

const client = new videoIntelligence.VideoIntelligenceServiceClient();
```

With explicit project ID and key file:

```javascript
const {v1: videoIntelligence} = require('@google-cloud/video-intelligence');

const client = new videoIntelligence.VideoIntelligenceServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Core Workflows

### Detect Labels From Cloud Storage

Use `inputUri` for production-style jobs so the client does not need to hold the video bytes in memory.

```javascript
const {v1: videoIntelligence} = require('@google-cloud/video-intelligence');

const client = new videoIntelligence.VideoIntelligenceServiceClient();

async function detectLabels(inputUri) {
  const [operation] = await client.annotateVideo({
    inputUri,
    features: ['LABEL_DETECTION'],
  });

  const [response] = await operation.promise();
  const result = response.annotationResults?.[0];

  for (const annotation of result?.segmentLabelAnnotations ?? []) {
    console.log(annotation.entity?.description);
  }
}

detectLabels('gs://my-bucket/example.mp4').catch(console.error);
```

### Detect Shot Changes From A Local File

Use `inputContent` for smaller files or test fixtures.

```javascript
const fs = require('node:fs/promises');
const {v1: videoIntelligence} = require('@google-cloud/video-intelligence');

const client = new videoIntelligence.VideoIntelligenceServiceClient();

async function detectShots(filePath) {
  const inputContent = await fs.readFile(filePath);

  const [operation] = await client.annotateVideo({
    inputContent,
    features: ['SHOT_CHANGE_DETECTION'],
  });

  const [response] = await operation.promise();
  const result = response.annotationResults?.[0];

  for (const shot of result?.shotAnnotations ?? []) {
    const startSeconds =
      Number(shot.startTimeOffset?.seconds ?? 0) +
      Number(shot.startTimeOffset?.nanos ?? 0) / 1e9;
    const endSeconds =
      Number(shot.endTimeOffset?.seconds ?? 0) +
      Number(shot.endTimeOffset?.nanos ?? 0) / 1e9;

    console.log(`${startSeconds.toFixed(2)}s -> ${endSeconds.toFixed(2)}s`);
  }
}

detectShots('./sample.mp4').catch(console.error);
```

### Transcribe Speech

Speech transcription needs `videoContext.speechTranscriptionConfig` in addition to the feature flag.

```javascript
const {v1: videoIntelligence} = require('@google-cloud/video-intelligence');

const client = new videoIntelligence.VideoIntelligenceServiceClient();

async function transcribeVideo(inputUri) {
  const [operation] = await client.annotateVideo({
    inputUri,
    features: ['SPEECH_TRANSCRIPTION'],
    videoContext: {
      speechTranscriptionConfig: {
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
      },
    },
  });

  const [response] = await operation.promise();
  const result = response.annotationResults?.[0];

  for (const transcription of result?.speechTranscriptions ?? []) {
    for (const alternative of transcription.alternatives ?? []) {
      console.log(alternative.transcript);
    }
  }
}

transcribeVideo('gs://my-bucket/example.mp4').catch(console.error);
```

### Write Results To Cloud Storage

Set `outputUri` when you want downstream systems to read the result JSON from Cloud Storage.

```javascript
const {v1: videoIntelligence} = require('@google-cloud/video-intelligence');

const client = new videoIntelligence.VideoIntelligenceServiceClient();

async function annotateToGcs(inputUri, outputUri) {
  const [operation] = await client.annotateVideo({
    inputUri,
    outputUri,
    features: ['TEXT_DETECTION'],
  });

  await operation.promise();
}

annotateToGcs(
  'gs://my-bucket/example.mp4',
  'gs://my-bucket/results/example.json'
).catch(console.error);
```

## Response Handling

The common shape is:

```javascript
const [operation] = await client.annotateVideo(request);
const [response] = await operation.promise();
const result = response.annotationResults?.[0];
```

Then inspect only the sections for the features you requested, for example:

- `segmentLabelAnnotations`
- `shotAnnotations`
- `textAnnotations`
- `speechTranscriptions`
- `objectAnnotations`
- `explicitAnnotation`

Do not assume every section is present. The result is sparse and feature-dependent.

## Common Pitfalls

- `annotateVideo()` is not a synchronous request-response method. It returns a long-running operation.
- `inputContent` reads the entire file into memory. Use `inputUri` for larger videos.
- The response only fills fields for the features you requested. Guard property access accordingly.
- `annotationResults` is an array. Most single-input flows read `annotationResults[0]`.
- Product examples and generated references may show beta namespaces for preview-era features. Keep the import, request types, and result handling in the same namespace family instead of mixing `v1` with `v1p*beta*` snippets.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/video-intelligence/latest`
- Video Intelligence product docs: `https://cloud.google.com/video-intelligence/docs`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- npm package page: `https://www.npmjs.com/package/@google-cloud/video-intelligence`
