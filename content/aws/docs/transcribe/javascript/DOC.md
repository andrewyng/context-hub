---
name: transcribe
description: "AWS SDK for JavaScript v3 Transcribe client for Amazon Transcribe batch transcription jobs and custom vocabularies."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,transcribe,javascript,nodejs,speech-to-text,audio,s3"
---

# `@aws-sdk/client-transcribe`

Use this package for Amazon Transcribe batch jobs and service-management operations in AWS SDK for JavaScript v3. The most common workflow is: put media in S3, start a transcription job, poll `GetTranscriptionJob`, then read the transcript from the returned transcript URI.

This package is for asynchronous Transcribe APIs. For live streaming transcription, use `@aws-sdk/client-transcribe-streaming` instead.

## Install

```bash
npm install @aws-sdk/client-transcribe
```

If you want to force a named shared-credentials profile in code instead of relying on the default AWS provider chain:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-transcribe@3.1007.0`.

## Prerequisites And Authentication

Transcribe requests need AWS credentials and a region. In Node.js, the AWS SDK v3 usually resolves credentials from the default provider chain, including environment variables, shared config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

Typical local setup:

```bash
export AWS_PROFILE=dev
export AWS_REGION=us-east-1

export AWS_TRANSCRIBE_MEDIA_URI=s3://my-input-bucket/audio/support-call.mp3
export AWS_TRANSCRIBE_VOCABULARY=support-terms
```

Batch transcription jobs typically read media from S3 with `Media.MediaFileUri`.

Minimal client setup:

```javascript
import { TranscribeClient } from "@aws-sdk/client-transcribe";

const transcribe = new TranscribeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to pin a shared profile explicitly in code:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { TranscribeClient } from "@aws-sdk/client-transcribe";

const transcribe = new TranscribeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "dev" }),
});
```

For browser applications, do not embed long-lived AWS access keys. Transcribe is usually called from trusted backend code or through tightly scoped temporary credentials.

## Start A Batch Transcription Job

Use `StartTranscriptionJobCommand` for standard asynchronous transcription. A job needs a unique `TranscriptionJobName`, a media URI, a matching `MediaFormat`, and exactly one language selector.

```javascript
import {
  StartTranscriptionJobCommand,
  TranscribeClient,
} from "@aws-sdk/client-transcribe";

const transcribe = new TranscribeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const jobName = `support-call-${Date.now()}`;

const response = await transcribe.send(
  new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: "en-US",
    MediaFormat: "mp3",
    Media: {
      MediaFileUri: process.env.AWS_TRANSCRIBE_MEDIA_URI,
    },
    ...(process.env.AWS_TRANSCRIBE_VOCABULARY
      ? {
          Settings: {
            VocabularyName: process.env.AWS_TRANSCRIBE_VOCABULARY,
          },
        }
      : {}),
  }),
);

console.log(response.TranscriptionJob?.TranscriptionJobName ?? jobName);
console.log(response.TranscriptionJob?.TranscriptionJobStatus ?? "QUEUED");
```

Language selection rules:

- Use `LanguageCode` when you already know the language.
- Use `IdentifyLanguage: true` when the language is unknown.
- Use `IdentifyMultipleLanguages: true` only for multi-language audio.
- Do not send more than one of those options in the same request.

If you want automatic language identification instead of a fixed language code, change the request like this:

```javascript
const response = await transcribe.send(
  new StartTranscriptionJobCommand({
    TranscriptionJobName: `support-call-${Date.now()}`,
    IdentifyLanguage: true,
    MediaFormat: "mp3",
    Media: {
      MediaFileUri: process.env.AWS_TRANSCRIBE_MEDIA_URI,
    },
  }),
);
```

## Poll For Completion And Read The Transcript

`StartTranscriptionJobCommand` only queues the work. Use `GetTranscriptionJobCommand` to check `TranscriptionJobStatus`, inspect `FailureReason`, and read `Transcript.TranscriptFileUri` after the job completes.

These examples assume Node.js 18+ so `fetch` is available globally.

```javascript
import { setTimeout as delay } from "node:timers/promises";
import {
  GetTranscriptionJobCommand,
  TranscribeClient,
} from "@aws-sdk/client-transcribe";

const transcribe = new TranscribeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const jobName = process.argv[2];

if (!jobName) {
  throw new Error("Pass the transcription job name as the first argument");
}

let transcriptUri;

while (true) {
  const result = await transcribe.send(
    new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName,
    }),
  );

  const job = result.TranscriptionJob;

  if (!job) {
    throw new Error(`Transcription job ${jobName} was not found`);
  }

  if (job.TranscriptionJobStatus === "FAILED") {
    throw new Error(job.FailureReason ?? "Transcription job failed");
  }

  if (job.TranscriptionJobStatus !== "COMPLETED") {
    await delay(5000);
    continue;
  }

  transcriptUri = job.Transcript?.TranscriptFileUri;

  if (!transcriptUri) {
    throw new Error("Completed job did not include TranscriptFileUri");
  }

  break;
}

const transcriptResponse = await fetch(transcriptUri);

if (!transcriptResponse.ok) {
  throw new Error(`Failed to download transcript: ${transcriptResponse.status}`);
}

const transcript = await transcriptResponse.json();

console.log(transcript.results.transcripts[0]?.transcript ?? "");
```

Important detail: the full transcript text is not returned inline by `GetTranscriptionJobCommand`. Read the transcript file from `Transcript.TranscriptFileUri` after the job finishes.

## Create And Wait For A Custom Vocabulary

Custom vocabularies help when the default model misses product names, acronyms, or domain-specific terms.

```javascript
import { setTimeout as delay } from "node:timers/promises";
import {
  CreateVocabularyCommand,
  GetVocabularyCommand,
  TranscribeClient,
} from "@aws-sdk/client-transcribe";

const transcribe = new TranscribeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const vocabularyName = process.env.AWS_TRANSCRIBE_VOCABULARY ?? "support-terms";

await transcribe.send(
  new CreateVocabularyCommand({
    VocabularyName: vocabularyName,
    LanguageCode: "en-US",
    Phrases: ["OpenAI", "PostgreSQL", "Kubernetes", "libSQL"],
  }),
);

while (true) {
  const result = await transcribe.send(
    new GetVocabularyCommand({
      VocabularyName: vocabularyName,
    }),
  );

  if (result.VocabularyState === "FAILED") {
    throw new Error(result.FailureReason ?? "Vocabulary creation failed");
  }

  if (result.VocabularyState === "READY") {
    break;
  }

  await delay(3000);
}

console.log(`Vocabulary ${vocabularyName} is ready`);
```

Use the vocabulary in transcription jobs through `Settings.VocabularyName`.

For larger domain dictionaries, Transcribe also supports supplying a vocabulary file URI instead of inline `Phrases`.

## Common Pitfalls

- `@aws-sdk/client-transcribe` is for batch jobs and service-management APIs. Live streaming uses `@aws-sdk/client-transcribe-streaming`.
- `MediaFormat` should match the actual media file type you store at `Media.MediaFileUri`.
- `StartTranscriptionJobCommand` needs exactly one of `LanguageCode`, `IdentifyLanguage`, or `IdentifyMultipleLanguages`.
- `TranscriptionJobName` must be unique for a new job. Reusing an existing name causes conflicts instead of replacing the old job.
- A successful credentials lookup does not guarantee the request is going to the correct regional endpoint. Keep `region` explicit.
- `GetTranscriptionJobCommand` tells you job state, not the final transcript text. Read the transcript file after completion.
- Custom vocabularies are regional resources. Create and use them in the same region as the transcription job.

## Version Notes For `3.1007.0`

- This guide targets `@aws-sdk/client-transcribe@3.1007.0`.
- The AWS SDK for JavaScript v3 service docs are published under a rolling `latest` URL. Use the npm package version for dependency pinning and the AWS docs for operation names and request shapes.

## Official Sources

- AWS SDK for JavaScript v3 Transcribe client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/transcribe/`
- Amazon Transcribe `StartTranscriptionJob` API reference: `https://docs.aws.amazon.com/transcribe/latest/APIReference/API_StartTranscriptionJob.html`
- Amazon Transcribe `GetTranscriptionJob` API reference: `https://docs.aws.amazon.com/transcribe/latest/APIReference/API_GetTranscriptionJob.html`
- Amazon Transcribe `CreateVocabulary` API reference: `https://docs.aws.amazon.com/transcribe/latest/APIReference/API_CreateVocabulary.html`
- Amazon Transcribe `GetVocabulary` API reference: `https://docs.aws.amazon.com/transcribe/latest/APIReference/API_GetVocabulary.html`
