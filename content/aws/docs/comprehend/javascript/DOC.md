---
name: comprehend
description: "AWS SDK for JavaScript v3 client for Amazon Comprehend text analysis APIs and asynchronous detection jobs"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,comprehend,javascript,nodejs,nlp,sentiment,pii"
---

# `@aws-sdk/client-comprehend`

Use this package to call Amazon Comprehend from JavaScript or TypeScript with AWS SDK for JavaScript v3. The same client covers real-time text analysis APIs such as language detection, sentiment, entities, key phrases, and PII detection, plus asynchronous S3-backed batch jobs for larger datasets.

## Install

```bash
npm install @aws-sdk/client-comprehend
```

If you want to load a named AWS profile in code, also install the credential helpers package:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Set AWS credentials and a region before creating the client:

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional
```

If you use shared AWS config locally, `AWS_PROFILE` also works with the standard AWS SDK for JavaScript v3 credential chain:

```bash
export AWS_PROFILE="my-dev-profile"
export AWS_REGION="us-east-1"
```

For asynchronous detection jobs, you also need an IAM role that Amazon Comprehend can assume and S3 locations for input and output:

```bash
export COMPREHEND_DATA_ACCESS_ROLE_ARN="arn:aws:iam::123456789012:role/ComprehendDataAccessRole"
export COMPREHEND_INPUT_S3_URI="s3://my-input-bucket/comprehend/input/"
export COMPREHEND_OUTPUT_S3_URI="s3://my-output-bucket/comprehend/output/"
```

## Initialize the client

### Minimal Node.js client

```javascript
import { ComprehendClient } from "@aws-sdk/client-comprehend";

const client = new ComprehendClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { ComprehendClient } from "@aws-sdk/client-comprehend";

const client = new ComprehendClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

### Named profile with `fromIni`

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { ComprehendClient } from "@aws-sdk/client-comprehend";

const client = new ComprehendClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "my-dev-profile" }),
});
```

In Node.js, the default credential provider chain is usually enough if your AWS access already comes from environment variables, shared config, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core usage pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  ComprehendClient,
  DetectSentimentCommand,
} from "@aws-sdk/client-comprehend";

const client = new ComprehendClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new DetectSentimentCommand({
    Text: "The delivery was fast and the packaging was excellent.",
    LanguageCode: "en",
  }),
);

console.log(response.Sentiment, response.SentimentScore);
```

## Common workflows

### Detect language, then analyze sentiment

Most text analysis APIs require a `LanguageCode`. If the language is not already known, detect it first and pass that code into the next request.

```javascript
import {
  ComprehendClient,
  DetectDominantLanguageCommand,
  DetectSentimentCommand,
} from "@aws-sdk/client-comprehend";

const client = new ComprehendClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const text = "The delivery was fast and the packaging was excellent.";

const languageResult = await client.send(
  new DetectDominantLanguageCommand({
    Text: text,
  }),
);

const languageCode = languageResult.Languages?.[0]?.LanguageCode;

if (!languageCode) {
  throw new Error("Comprehend did not return a dominant language");
}

const sentimentResult = await client.send(
  new DetectSentimentCommand({
    Text: text,
    LanguageCode: languageCode,
  }),
);

console.log(sentimentResult.Sentiment);
console.log(sentimentResult.SentimentScore);
```

### Run sentiment on multiple short documents with one language code

Use a batch API when you already know that every document in the request uses the same language.

```javascript
import {
  BatchDetectSentimentCommand,
  ComprehendClient,
} from "@aws-sdk/client-comprehend";

const client = new ComprehendClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new BatchDetectSentimentCommand({
    LanguageCode: "en",
    TextList: [
      "This product solved the problem quickly.",
      "Setup was confusing and took too long.",
      "Support answered within five minutes.",
    ],
  }),
);

for (const result of response.ResultList ?? []) {
  console.log(result.Index, result.Sentiment, result.SentimentScore);
}

for (const error of response.ErrorList ?? []) {
  console.error(error.Index, error.ErrorCode, error.ErrorMessage);
}
```

### Extract entities from a document

```javascript
import {
  ComprehendClient,
  DetectEntitiesCommand,
} from "@aws-sdk/client-comprehend";

const client = new ComprehendClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new DetectEntitiesCommand({
    Text: "Jane Doe from Example Corp met the AWS team in Seattle on Tuesday.",
    LanguageCode: "en",
  }),
);

for (const entity of response.Entities ?? []) {
  console.log(entity.Text, entity.Type, entity.Score);
}
```

Use the same pattern for other synchronous text APIs such as `DetectKeyPhrasesCommand` and `DetectSyntaxCommand` when those are a better match for your application.

### Gate on PII, then get exact offsets when needed

`ContainsPiiEntitiesCommand` is useful when you only need to know whether the text contains PII labels. `DetectPiiEntitiesCommand` returns the entity spans.

```javascript
import {
  ComprehendClient,
  ContainsPiiEntitiesCommand,
  DetectPiiEntitiesCommand,
} from "@aws-sdk/client-comprehend";

const client = new ComprehendClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const text = "Contact me at jane@example.com or 206-555-0100.";

const contains = await client.send(
  new ContainsPiiEntitiesCommand({
    Text: text,
    LanguageCode: "en",
  }),
);

console.log(contains.Labels);

const detailed = await client.send(
  new DetectPiiEntitiesCommand({
    Text: text,
    LanguageCode: "en",
  }),
);

for (const entity of detailed.Entities ?? []) {
  console.log(entity.Type, entity.BeginOffset, entity.EndOffset, entity.Score);
}
```

### Start and poll an asynchronous sentiment job

Use the asynchronous job APIs when your input already lives in S3 or when the dataset is too large for the real-time text APIs.

```javascript
import {
  ComprehendClient,
  DescribeSentimentDetectionJobCommand,
  StartSentimentDetectionJobCommand,
} from "@aws-sdk/client-comprehend";

const client = new ComprehendClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const roleArn = process.env.COMPREHEND_DATA_ACCESS_ROLE_ARN;
const inputS3Uri = process.env.COMPREHEND_INPUT_S3_URI;
const outputS3Uri = process.env.COMPREHEND_OUTPUT_S3_URI;

if (!roleArn || !inputS3Uri || !outputS3Uri) {
  throw new Error("Set COMPREHEND_DATA_ACCESS_ROLE_ARN, COMPREHEND_INPUT_S3_URI, and COMPREHEND_OUTPUT_S3_URI");
}

const start = await client.send(
  new StartSentimentDetectionJobCommand({
    JobName: "support-ticket-sentiment",
    LanguageCode: "en",
    DataAccessRoleArn: roleArn,
    InputDataConfig: {
      S3Uri: inputS3Uri,
      InputFormat: "ONE_DOC_PER_LINE",
    },
    OutputDataConfig: {
      S3Uri: outputS3Uri,
    },
  }),
);

const jobId = start.JobId;

if (!jobId) {
  throw new Error("Comprehend did not return a JobId");
}

for (;;) {
  const detail = await client.send(
    new DescribeSentimentDetectionJobCommand({
      JobId: jobId,
    }),
  );

  const properties = detail.SentimentDetectionJobProperties;
  const status = properties?.JobStatus;

  console.log(status);

  if (status === "COMPLETED") {
    console.log(properties?.OutputDataConfig?.S3Uri);
    break;
  }

  if (status === "FAILED" || status === "STOPPED") {
    throw new Error(`Sentiment job ended with status ${status}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 10000));
}
```

The other asynchronous Comprehend job APIs follow the same pattern: `Start*JobCommand` to launch work in S3, then `Describe*JobCommand` to poll status.

## Important gotchas

- Most synchronous Comprehend text APIs require `LanguageCode`. If your application does not already know the language, detect it first.
- Batch APIs still take a single `LanguageCode` for the whole request. Group texts by language before sending a batch request.
- Synchronous text APIs take raw `Text` in the request. Asynchronous job APIs read from S3 and write results back to S3.
- Asynchronous jobs require `DataAccessRoleArn` in addition to the credentials your application uses to call AWS.
- `ContainsPiiEntitiesCommand` tells you which PII label types are present; `DetectPiiEntitiesCommand` is the API that returns offsets for exact matches.
- `StartSentimentDetectionJobCommand` only starts the job. Use `DescribeSentimentDetectionJobCommand` to wait for a terminal status and locate the output S3 path.
- Amazon Comprehend is regional. Region mismatches often look like permission or missing-resource problems.

## When to reach for other packages

- `@aws-sdk/credential-providers` for explicit credential loading such as `fromIni`, assume-role flows, or other profile-based setup.
- Other AWS SDK v3 service clients when your Comprehend workflow depends on S3, IAM, or surrounding infrastructure automation.

## Version notes

- This guide targets `@aws-sdk/client-comprehend` version `3.1007.0`.
- The current package surface uses the standard AWS SDK v3 command pattern shown here: `client.send(new Command(input))`.

## Official sources

- AWS SDK for JavaScript v3 Comprehend client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/comprehend/`
- Amazon Comprehend API Reference: `https://docs.aws.amazon.com/comprehend/latest/APIReference/Welcome.html`
- Amazon Comprehend `DetectDominantLanguage` API: `https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DetectDominantLanguage.html`
- Amazon Comprehend `DetectSentiment` API: `https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DetectSentiment.html`
- Amazon Comprehend `BatchDetectSentiment` API: `https://docs.aws.amazon.com/comprehend/latest/APIReference/API_BatchDetectSentiment.html`
- Amazon Comprehend `DetectEntities` API: `https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DetectEntities.html`
- Amazon Comprehend `ContainsPiiEntities` API: `https://docs.aws.amazon.com/comprehend/latest/APIReference/API_ContainsPiiEntities.html`
- Amazon Comprehend `DetectPiiEntities` API: `https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DetectPiiEntities.html`
- Amazon Comprehend `StartSentimentDetectionJob` API: `https://docs.aws.amazon.com/comprehend/latest/APIReference/API_StartSentimentDetectionJob.html`
- Amazon Comprehend `DescribeSentimentDetectionJob` API: `https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DescribeSentimentDetectionJob.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- AWS SDK for JavaScript v3 region configuration: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html`
