---
name: textract
description: "AWS SDK for JavaScript v3 Textract client for OCR, form and table analysis, and asynchronous document-processing jobs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,textract,javascript,nodejs,ocr,documents,forms,tables"
---

# `@aws-sdk/client-textract`

Use this package for Amazon Textract operations in AWS SDK for JavaScript v3. It covers synchronous text extraction, form and table analysis, specialized expense and identity-document APIs, and asynchronous document jobs for files stored in S3.

Textract is a low-level API surface. Most useful responses come back as `Blocks` plus relationships between those blocks, not as a prebuilt plain-text or form-object model.

## Install

```bash
npm install @aws-sdk/client-textract
```

If you need to force a named shared-credentials profile in code instead of relying on the default AWS provider chain:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-textract@3.1007.0`.

## Prerequisites And Authentication

Textract calls need normal AWS credentials plus a region. In Node.js, the SDK can usually resolve credentials from the default provider chain, including environment variables, shared AWS config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

Typical local setup:

```bash
export AWS_PROFILE=dev
export AWS_REGION=us-east-1

export AWS_TEXTRACT_BUCKET=incoming-documents
export AWS_TEXTRACT_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:textract-jobs
export AWS_TEXTRACT_ROLE_ARN=arn:aws:iam::123456789012:role/TextractPublishToSNS
```

Minimal client setup:

```javascript
import { TextractClient } from "@aws-sdk/client-textract";

const textract = new TextractClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to pin a shared profile explicitly in code:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { TextractClient } from "@aws-sdk/client-textract";

const textract = new TextractClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "dev" }),
});
```

For browser applications, do not embed long-lived AWS access keys. Textract is usually called from trusted backend code or behind a federation flow with tightly scoped temporary credentials.

## Request Shapes You Need To Get Right

- Synchronous operations such as `DetectDocumentTextCommand` and `AnalyzeDocumentCommand` use `Document`.
- Asynchronous start operations such as `StartDocumentTextDetectionCommand` and `StartDocumentAnalysisCommand` use `DocumentLocation`.
- In Node.js, pass a `Buffer` or other `Uint8Array` to `Bytes`. Do not base64-encode the payload yourself before sending it through the SDK.
- Asynchronous document jobs take an S3 object location, not raw local bytes.

## Detect Text From A Local Image

Use `DetectDocumentTextCommand` when you want OCR output without form or table analysis.

```javascript
import { readFile } from "node:fs/promises";
import {
  DetectDocumentTextCommand,
  TextractClient,
} from "@aws-sdk/client-textract";

const textract = new TextractClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const imageBytes = await readFile("./example.png");

const { Blocks } = await textract.send(
  new DetectDocumentTextCommand({
    Document: {
      Bytes: imageBytes,
    },
  }),
);

const lines = (Blocks ?? [])
  .filter((block) => block.BlockType === "LINE" && block.Text)
  .map((block) => block.Text);

console.log(lines.join("\n"));
```

If the document is already in S3, you can use `Document.S3Object` instead of `Document.Bytes`.

## Analyze Forms And Tables

Use `AnalyzeDocumentCommand` when you need form fields or table structure instead of OCR alone.

```javascript
import {
  AnalyzeDocumentCommand,
  TextractClient,
} from "@aws-sdk/client-textract";

const textract = new TextractClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Blocks } = await textract.send(
  new AnalyzeDocumentCommand({
    Document: {
      S3Object: {
        Bucket: process.env.AWS_TEXTRACT_BUCKET,
        Name: "forms/application.png",
      },
    },
    FeatureTypes: ["FORMS", "TABLES"],
  }),
);

const keyValueBlocks = (Blocks ?? []).filter(
  (block) => block.BlockType === "KEY_VALUE_SET",
);
const tableBlocks = (Blocks ?? []).filter(
  (block) => block.BlockType === "TABLE",
);

console.log({
  keyValueBlocks: keyValueBlocks.length,
  tableBlocks: tableBlocks.length,
});
```

`FeatureTypes` is the switch that tells Textract which analysis features to run. If you only want plain OCR, use `DetectDocumentText` instead.

## Run An Asynchronous Document Job

Use the asynchronous start/get pairs for S3-based workflows where you do not want to block on a single synchronous response.

This example starts a text-detection job for an S3 document, then polls until the job succeeds and paginates through all result pages.

```javascript
import { setTimeout as delay } from "node:timers/promises";
import {
  GetDocumentTextDetectionCommand,
  StartDocumentTextDetectionCommand,
  TextractClient,
} from "@aws-sdk/client-textract";

const textract = new TextractClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const start = await textract.send(
  new StartDocumentTextDetectionCommand({
    DocumentLocation: {
      S3Object: {
        Bucket: process.env.AWS_TEXTRACT_BUCKET,
        Name: "incoming/report.pdf",
      },
    },
    NotificationChannel: {
      RoleArn: process.env.AWS_TEXTRACT_ROLE_ARN,
      SNSTopicArn: process.env.AWS_TEXTRACT_SNS_TOPIC_ARN,
    },
  }),
);

if (!start.JobId) {
  throw new Error("Textract did not return a JobId");
}

const allBlocks = [];
let nextToken;

while (true) {
  const page = await textract.send(
    new GetDocumentTextDetectionCommand({
      JobId: start.JobId,
      NextToken: nextToken,
    }),
  );

  if (page.JobStatus === "FAILED") {
    throw new Error(page.StatusMessage ?? "Textract job failed");
  }

  if (page.JobStatus !== "SUCCEEDED") {
    await delay(5000);
    continue;
  }

  allBlocks.push(...(page.Blocks ?? []));

  if (!page.NextToken) {
    break;
  }

  nextToken = page.NextToken;
}

const lines = allBlocks
  .filter((block) => block.BlockType === "LINE" && block.Text)
  .map((block) => block.Text);

console.log(lines.join("\n"));
```

The start operation and get operation must match:

- `StartDocumentTextDetectionCommand` ↔ `GetDocumentTextDetectionCommand`
- `StartDocumentAnalysisCommand` ↔ `GetDocumentAnalysisCommand`

If you need asynchronous form or table analysis instead of OCR only, use the analysis pair and pass `FeatureTypes` to the start command.

## Other High-Value Operations

- `AnalyzeExpenseCommand`: specialized extraction for receipts and invoices.
- `AnalyzeIDCommand`: specialized extraction for identity documents.
- `StartDocumentAnalysisCommand`: asynchronous analysis for S3 documents when you need the same block graph as `AnalyzeDocument` without a single synchronous request.

Choose the narrowest operation that matches your workload. Expense and ID APIs return more task-specific structures than generic block analysis.

## Textract-Specific Gotchas

- `Blocks` is a graph, not a finished document model. Real form extraction often means following block relationships instead of reading only `LINE` text.
- `Document` and `DocumentLocation` are different request shapes. The synchronous and asynchronous APIs do not use the same input field names.
- `FeatureTypes` belongs on document-analysis operations, not on plain text-detection calls.
- Asynchronous result APIs paginate with `NextToken`. Keep fetching until the token is absent.
- The `NotificationChannel` role for asynchronous jobs must allow Textract to publish to the SNS topic you provide.
- `Bytes` should be raw binary data in the SDK request. Do not pre-encode it as a base64 string unless you are calling the raw HTTP API yourself.
- Keep the client region explicit. Credential resolution can succeed while the request still fails because you are talking to the wrong regional endpoint for your workload.

## Version Notes For `3.1007.0`

- This guide targets `@aws-sdk/client-textract@3.1007.0`.
- The AWS JavaScript SDK service documentation is published under a rolling `latest` URL. Use the installed npm version for pinning and the AWS docs for operation names and request/response shapes.

## Official Sources

- AWS SDK for JavaScript v3 Textract client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/textract/`
- Amazon Textract `DetectDocumentText` API reference: `https://docs.aws.amazon.com/textract/latest/dg/API_DetectDocumentText.html`
- Amazon Textract `AnalyzeDocument` API reference: `https://docs.aws.amazon.com/textract/latest/dg/API_AnalyzeDocument.html`
- Amazon Textract `StartDocumentTextDetection` API reference: `https://docs.aws.amazon.com/textract/latest/dg/API_StartDocumentTextDetection.html`
- Amazon Textract `GetDocumentTextDetection` API reference: `https://docs.aws.amazon.com/textract/latest/dg/API_GetDocumentTextDetection.html`
