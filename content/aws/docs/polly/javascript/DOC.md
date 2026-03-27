---
name: polly
description: "AWS SDK for JavaScript v3 client for Amazon Polly voice discovery, text-to-speech synthesis, speech marks, lexicons, and asynchronous synthesis tasks."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,polly,javascript,nodejs,text-to-speech,ssml,speech-marks,lexicons"
---

# `@aws-sdk/client-polly`

Use this package for Amazon Polly text-to-speech workflows in AWS SDK for JavaScript v3. It covers:

- listing voices with `DescribeVoices`
- direct synthesis with `SynthesizeSpeech`
- asynchronous S3 output with `StartSpeechSynthesisTask`
- lexicon management with `PutLexicon`, `GetLexicon`, `ListLexicons`, and `DeleteLexicon`

This guide targets `@aws-sdk/client-polly@3.1007.0`.

## Install

```bash
npm install @aws-sdk/client-polly
```

If you want to force a named shared-credentials profile in code instead of relying on the default AWS provider chain:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites And Authentication

Polly needs normal AWS credentials plus a region. In Node.js, the SDK can usually resolve credentials from the default provider chain, including environment variables, shared AWS config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

Typical local setup:

```bash
export AWS_PROFILE=dev
export AWS_REGION=us-east-1

export AWS_POLLY_VOICE_ID=Joanna
export AWS_POLLY_OUTPUT_BUCKET=my-polly-output-bucket
```

Minimal client setup:

```javascript
import { PollyClient } from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to pin a shared profile explicitly in code:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { PollyClient } from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "dev" }),
});
```

For browser apps, do not embed long-lived AWS access keys. Polly is usually safer behind backend code or a federation flow that issues tightly scoped temporary credentials.

## Core Request Rules

- `Text`, `OutputFormat`, and `VoiceId` are required for `SynthesizeSpeech`.
- `Text`, `OutputFormat`, `VoiceId`, and `OutputS3BucketName` are required for `StartSpeechSynthesisTask`.
- `TextType` defaults to plain text; set `TextType: "ssml"` for SSML input.
- `SpeechMarkTypes` only makes sense when `OutputFormat` is `"json"`.
- Voice support is engine-specific. Call `DescribeVoices` before hardcoding a `VoiceId` plus `Engine` combination.
- If you use a bilingual voice such as `Aditi`, set `LanguageCode` when you need the non-default language.

## List Available Voices

Use `DescribeVoicesCommand` to discover which voices and engines are available before you synthesize anything.

```javascript
import {
  DescribeVoicesCommand,
  PollyClient,
} from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken;

do {
  const response = await polly.send(
    new DescribeVoicesCommand({
      Engine: "neural",
      LanguageCode: "en-US",
      IncludeAdditionalLanguageCodes: true,
      NextToken: nextToken,
    }),
  );

  for (const voice of response.Voices ?? []) {
    console.log({
      id: voice.Id,
      name: voice.Name,
      language: voice.LanguageCode,
      additionalLanguages: voice.AdditionalLanguageCodes,
      supportedEngines: voice.SupportedEngines,
    });
  }

  nextToken = response.NextToken;
} while (nextToken);
```

Use this as the source of truth for which voices work with `standard`, `neural`, `long-form`, or `generative` synthesis in your region.

## Synthesize Audio And Save It Locally

Use `SynthesizeSpeechCommand` when you want the audio bytes returned directly in the response.

```javascript
import { writeFile } from "node:fs/promises";
import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await polly.send(
  new SynthesizeSpeechCommand({
    Engine: "neural",
    OutputFormat: "mp3",
    Text: "Hello from Amazon Polly.",
    VoiceId: process.env.AWS_POLLY_VOICE_ID ?? "Joanna",
  }),
);

if (!response.AudioStream) {
  throw new Error("Polly returned no audio stream.");
}

const audioBytes = await response.AudioStream.transformToByteArray();

await writeFile("./hello.mp3", Buffer.from(audioBytes));

console.log({
  contentType: response.ContentType,
  requestCharacters: response.RequestCharacters,
});
```

Use `TextType: "ssml"` when sending SSML:

```javascript
import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await polly.send(
  new SynthesizeSpeechCommand({
    Engine: "neural",
    OutputFormat: "mp3",
    Text: "<speak><break time=\"300ms\"/>Hello from SSML.</speak>",
    TextType: "ssml",
    VoiceId: "Joanna",
  }),
);
```

AWS requires valid, well-formed SSML when `TextType` is `"ssml"`.

## Request Speech Marks Instead Of Audio

Use `OutputFormat: "json"` with `SpeechMarkTypes` when you need timing metadata instead of an audio file.

```javascript
import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await polly.send(
  new SynthesizeSpeechCommand({
    OutputFormat: "json",
    SpeechMarkTypes: ["sentence", "word"],
    Text: "Hello from Amazon Polly.",
    VoiceId: "Joanna",
  }),
);

if (!response.AudioStream) {
  throw new Error("Polly returned no speech-mark stream.");
}

const jsonLines = await response.AudioStream.transformToString();
const speechMarks = jsonLines
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

console.log(speechMarks);
```

The response field is still named `AudioStream`, but for speech marks the content type is JSON stream data rather than playable audio.

## Start An Asynchronous Synthesis Task To S3

Use `StartSpeechSynthesisTaskCommand` when you want Polly to write output to S3 instead of returning a streaming body directly.

```javascript
import {
  GetSpeechSynthesisTaskCommand,
  PollyClient,
  StartSpeechSynthesisTaskCommand,
} from "@aws-sdk/client-polly";

const bucketName = process.env.AWS_POLLY_OUTPUT_BUCKET;

if (!bucketName) {
  throw new Error("Set AWS_POLLY_OUTPUT_BUCKET.");
}

const polly = new PollyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const startResponse = await polly.send(
  new StartSpeechSynthesisTaskCommand({
    Engine: "neural",
    OutputFormat: "mp3",
    OutputS3BucketName: bucketName,
    OutputS3KeyPrefix: "polly/jobs/",
    Text: "Hello from an asynchronous Polly task.",
    VoiceId: "Joanna",
  }),
);

const taskId = startResponse.SynthesisTask?.TaskId;

if (!taskId) {
  throw new Error("Polly did not return a task id.");
}

while (true) {
  const taskResponse = await polly.send(
    new GetSpeechSynthesisTaskCommand({ TaskId: taskId }),
  );

  const task = taskResponse.SynthesisTask;

  if (!task) {
    throw new Error("Polly did not return task details.");
  }

  if (task.TaskStatus === "completed") {
    console.log({
      taskId: task.TaskId,
      outputUri: task.OutputUri,
      status: task.TaskStatus,
    });
    break;
  }

  if (task.TaskStatus === "failed") {
    throw new Error(task.TaskStatusReason ?? "Speech synthesis task failed.");
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));
}
```

Polly documents that a `SpeechSynthesisTask` remains available for 72 hours after the asynchronous task starts.

## Manage Pronunciation Lexicons

Lexicons let you override pronunciation for specific words or phrases. Lexicons are regional and Polly documents eventual consistency for lexicon operations, so a newly written lexicon might not be available immediately for synthesis.

```javascript
import {
  GetLexiconCommand,
  PollyClient,
  PutLexiconCommand,
} from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const lexiconName = "acronyms";

const lexiconContent = `<?xml version="1.0" encoding="UTF-8"?>
<lexicon
  version="1.0"
  xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.w3.org/2005/01/pronunciation-lexicon http://www.w3.org/TR/2007/CR-pronunciation-lexicon-20071212/pls.xsd"
  alphabet="ipa"
  xml:lang="en-US">
  <lexeme>
    <grapheme>W3C</grapheme>
    <alias>World Wide Web Consortium</alias>
  </lexeme>
</lexicon>`;

await polly.send(
  new PutLexiconCommand({
    Name: lexiconName,
    Content: lexiconContent,
  }),
);

const lexiconResponse = await polly.send(
  new GetLexiconCommand({ Name: lexiconName }),
);

console.log(lexiconResponse.Lexicon?.Name);
console.log(lexiconResponse.LexiconAttributes?.LanguageCode);
console.log(lexiconResponse.Lexicon?.Content);
```

To apply a lexicon during synthesis, pass its name in `LexiconNames`:

```javascript
import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await polly.send(
  new SynthesizeSpeechCommand({
    LexiconNames: ["acronyms"],
    OutputFormat: "mp3",
    Text: "The W3C published a new recommendation.",
    VoiceId: "Joanna",
  }),
);
```

## Common Pitfalls

- Do not assume a voice supports every engine. Check `DescribeVoices` first.
- Do not send SSML without `TextType: "ssml"`.
- Do not request speech marks with an audio output format. Use `OutputFormat: "json"`.
- Do not assume `AudioStream` always means binary audio bytes; speech-mark responses also use `AudioStream`.
- Do not expect immediate lexicon availability right after `PutLexiconCommand`; Polly documents eventual consistency.
- Do not expect built-in waiters for async synthesis tasks in the current service model; poll `GetSpeechSynthesisTask` yourself.
- Do not forget `LanguageCode` when using bilingual voices and you need a non-default language.

## Version-Sensitive Notes

- This guide tracks `@aws-sdk/client-polly@3.1007.0`.
- The generated service model for this release exposes engine values `standard`, `neural`, `long-form`, and `generative`.
- The generated service model exposes output formats `json`, `mp3`, `ogg_opus`, `ogg_vorbis`, and `pcm`.
- The service model includes pagination for `DescribeVoices`, `ListLexicons`, and `ListSpeechSynthesisTasks`.
- The current service model does not publish Polly waiters.
