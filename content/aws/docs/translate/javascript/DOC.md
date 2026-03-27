---
name: translate
description: "Amazon Translate SDK for JavaScript v3 guide for translating text, documents, and batch jobs"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,amazon-translate,translate,translation,i18n,javascript,nodejs"
---

# Amazon Translate SDK for JavaScript v3 Guide

## Golden Rule

Use `@aws-sdk/client-translate` for Amazon Translate calls in JavaScript. Create one `TranslateClient` for the AWS region you use, let the AWS SDK resolve credentials from the normal provider chain, and choose the API that matches your input shape:

- `TranslateTextCommand` for short text already in memory.
- `TranslateDocumentCommand` for one file you already have as bytes.
- `StartTextTranslationJobCommand` for larger asynchronous translation work that reads from and writes to Amazon S3.

## Install

```bash
npm install @aws-sdk/client-translate
```

Examples in this guide use ESM imports and the standard AWS SDK v3 `client.send(new Command(...))` pattern.

## Credentials And Region

Set the AWS region and provide credentials with the normal AWS SDK mechanisms such as environment variables, shared config files, or IAM roles.

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=dev
```

If you prefer direct environment credentials:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
```

For local development, a named profile is usually safer than hardcoding credentials in source files.

## Initialize The Client

```javascript
import { TranslateClient } from "@aws-sdk/client-translate";

export const translate = new TranslateClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If the process already has `AWS_REGION` and valid credentials, that is enough for most server-side apps.

## Core Usage

### Translate Plain Text

```javascript
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";

const client = new TranslateClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new TranslateTextCommand({
    Text: "Hello, world!",
    SourceLanguageCode: "en",
    TargetLanguageCode: "es",
  }),
);

console.log(response.TranslatedText);
```

Use explicit language codes when you already know the source and target languages.

### Apply A Custom Terminology

If you already created a custom terminology resource in Amazon Translate, pass its name with `TerminologyNames`.

```javascript
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";

const client = new TranslateClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new TranslateTextCommand({
    Text: "The order ships tomorrow.",
    SourceLanguageCode: "en",
    TargetLanguageCode: "fr",
    TerminologyNames: ["commerce-terms"],
  }),
);

console.log(response.TranslatedText);
console.log(response.AppliedTerminologies);
```

### Translate A Document

Use `TranslateDocumentCommand` when you already have the file content in memory. The document payload must include both the bytes and the content type.

```javascript
import { readFile, writeFile } from "node:fs/promises";
import {
  TranslateClient,
  TranslateDocumentCommand,
} from "@aws-sdk/client-translate";

const client = new TranslateClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const sourceBytes = await readFile("./docs/message.txt");

const response = await client.send(
  new TranslateDocumentCommand({
    SourceLanguageCode: "en",
    TargetLanguageCode: "de",
    Document: {
      Content: sourceBytes,
      ContentType: "text/plain",
    },
  }),
);

const translatedBytes = Buffer.from(
  response.TranslatedDocument?.Content ?? new Uint8Array(),
);

await writeFile("./docs/message.de.txt", translatedBytes);
```

Set `Document.ContentType` to the real MIME type for the file you send.

### List Supported Languages

`ListLanguagesCommand` returns the languages Amazon Translate currently exposes, with names localized to the display language you request.

```javascript
import {
  ListLanguagesCommand,
  TranslateClient,
} from "@aws-sdk/client-translate";

const client = new TranslateClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new ListLanguagesCommand({
    DisplayLanguageCode: "en",
  }),
);

for (const language of response.Languages ?? []) {
  console.log(language.LanguageCode, language.LanguageName);
}
```

### List Existing Terminologies

```javascript
import {
  ListTerminologiesCommand,
  TranslateClient,
} from "@aws-sdk/client-translate";

const client = new TranslateClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new ListTerminologiesCommand({
    MaxResults: 25,
  }),
);

for (const item of response.TerminologyPropertiesList ?? []) {
  console.log(item.Name);
}
```

### Start An Asynchronous Text Translation Job

Batch text translation jobs read input from Amazon S3, write results to Amazon S3, and require an IAM role that Amazon Translate can assume to access those buckets.

```javascript
import {
  StartTextTranslationJobCommand,
  TranslateClient,
} from "@aws-sdk/client-translate";

const client = new TranslateClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new StartTextTranslationJobCommand({
    JobName: "site-copy-es-fr",
    DataAccessRoleArn: process.env.TRANSLATE_DATA_ACCESS_ROLE_ARN,
    InputDataConfig: {
      S3Uri: "s3://my-translate-input/site-copy/",
      ContentType: "text/plain",
    },
    OutputDataConfig: {
      S3Uri: "s3://my-translate-output/site-copy/",
    },
    SourceLanguageCode: "en",
    TargetLanguageCodes: ["es", "fr"],
  }),
);

console.log(response.JobId, response.JobStatus);
```

Check status with `DescribeTextTranslationJobCommand`:

```javascript
import {
  DescribeTextTranslationJobCommand,
  TranslateClient,
} from "@aws-sdk/client-translate";

const client = new TranslateClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new DescribeTextTranslationJobCommand({
    JobId: process.env.TRANSLATE_JOB_ID,
  }),
);

console.log(response.TextTranslationJobProperties?.JobStatus);
```

Stop a running job if needed:

```javascript
import {
  StopTextTranslationJobCommand,
  TranslateClient,
} from "@aws-sdk/client-translate";

const client = new TranslateClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new StopTextTranslationJobCommand({
    JobId: process.env.TRANSLATE_JOB_ID,
  }),
);
```

## Config And Auth Notes

- `TranslateClient` uses the standard AWS SDK for JavaScript v3 credential resolution chain.
- `region` should match the Amazon Translate region where you created terminologies or other related resources.
- Reuse one client instance instead of constructing a new client for every request.
- For server apps running on AWS, prefer IAM roles over long-lived access keys.
- For `StartTextTranslationJobCommand`, the IAM role in `DataAccessRoleArn` must be able to read the input S3 location and write the output S3 location.

## Common Pitfalls

### Missing Region Or Credentials

If the SDK cannot resolve a region or credentials, the request fails before it reaches Amazon Translate. Set `AWS_REGION` and use a working AWS profile, environment credentials, or an attached IAM role.

### Using The Wrong API For The Input Size

Use `TranslateTextCommand` for direct text strings already in memory. Use `TranslateDocumentCommand` for one file payload. Use `StartTextTranslationJobCommand` when the workflow is asynchronous and S3-backed.

### Forgetting The Document MIME Type

`TranslateDocumentCommand` needs the raw bytes and the matching `Document.ContentType`. If the MIME type is wrong, the service cannot reliably process the document.

### Assuming Batch Jobs Work Without S3 And IAM Setup

Text translation jobs are not self-contained request bodies. They depend on S3 input and output locations plus `DataAccessRoleArn`.

### Expecting Terminology Names To Work Automatically Everywhere

`TerminologyNames` only works when the named terminology resource already exists and is available to the client in the region you are calling.

## Version Scope

This guide targets `@aws-sdk/client-translate` version `3.1007.0` and the AWS SDK for JavaScript v3 command-based API shape.

## Official Sources

- AWS SDK for JavaScript v3 Translate client docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/translate/
- Amazon Translate developer guide: https://docs.aws.amazon.com/translate/latest/dg/what-is.html
- Amazon Translate API reference: https://docs.aws.amazon.com/translate/latest/APIReference/Welcome.html
- npm package: https://www.npmjs.com/package/@aws-sdk/client-translate
