---
name: firehose
description: "AWS SDK for JavaScript v3 client for Amazon Data Firehose delivery stream writes and stream inspection APIs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,firehose,data-firehose,streaming,javascript,nodejs"
---

# `@aws-sdk/client-firehose`

Use this package to write records to Amazon Data Firehose delivery streams and inspect delivery stream configuration from JavaScript or TypeScript. AWS branding often says Amazon Data Firehose, but the SDK package, client class, and API names still use `firehose` and `DeliveryStream`.

## Install

```bash
npm install @aws-sdk/client-firehose
```

Prefer `FirehoseClient` plus explicit command imports. The package also exports an aggregated `Firehose` client, but command-based imports are the safer default for smaller bundles and clearer application code.

## Credentials and region

In Node.js, the default credential provider chain is usually enough if AWS access is already configured through environment variables, shared config files, ECS or EC2 instance metadata, or IAM Identity Center.

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

If you use temporary credentials, also set `AWS_SESSION_TOKEN`.

## Initialize the client

```javascript
import { FirehoseClient } from "@aws-sdk/client-firehose";

const firehose = new FirehoseClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

Explicit credentials:

```javascript
import { FirehoseClient } from "@aws-sdk/client-firehose";

const firehose = new FirehoseClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

Firehose is usually called from trusted backend code. Browser usage needs explicit credential configuration and tight IAM scoping because the client can write directly to your delivery stream.

## Core usage pattern

Application code usually writes to an existing delivery stream with `PutRecord` or `PutRecordBatch`. Firehose record data is binary, so encode structured payloads yourself before sending them. JSON Lines is a practical default for S3-based downstream processing.

```javascript
import {
  FirehoseClient,
  PutRecordCommand,
} from "@aws-sdk/client-firehose";

const firehose = new FirehoseClient({ region: "us-east-1" });
const event = { event: "signup", userId: 123 };

const response = await firehose.send(
  new PutRecordCommand({
    DeliveryStreamName: "events-stream",
    Record: {
      Data: new TextEncoder().encode(`${JSON.stringify(event)}\n`),
    },
  }),
);

console.log(response.RecordId);
```

Unlike Kinesis Data Streams, Firehose direct puts do not take a `PartitionKey`. Use `DeliveryStreamName`, not `StreamName`.

## Common operations

### Write multiple records in one request

`PutRecordBatch` can succeed partially, so always inspect `FailedPutCount` and retry only the failed records.

```javascript
import {
  FirehoseClient,
  PutRecordBatchCommand,
} from "@aws-sdk/client-firehose";

const firehose = new FirehoseClient({ region: "us-east-1" });
const encoder = new TextEncoder();

const payloads = [
  { event: "signup", userId: 123 },
  { event: "purchase", userId: 123, total: 49.99 },
];

const records = payloads.map((payload) => ({
  Data: encoder.encode(`${JSON.stringify(payload)}\n`),
}));

const response = await firehose.send(
  new PutRecordBatchCommand({
    DeliveryStreamName: "events-stream",
    Records: records,
  }),
);

if ((response.FailedPutCount ?? 0) > 0) {
  const failedPayloads = (response.RequestResponses ?? [])
    .map((result, index) => ({ result, payload: payloads[index] }))
    .filter(({ result }) => result.ErrorCode || result.ErrorMessage);

  console.log("retry these payloads", failedPayloads);
}
```

### Inspect a delivery stream

Use `DescribeDeliveryStream` when your app needs stream metadata or when you need to confirm that a newly created or updated stream is ready before writing to it.

```javascript
import {
  DescribeDeliveryStreamCommand,
  FirehoseClient,
} from "@aws-sdk/client-firehose";

const firehose = new FirehoseClient({ region: "us-east-1" });

const response = await firehose.send(
  new DescribeDeliveryStreamCommand({
    DeliveryStreamName: "events-stream",
  }),
);

console.log(response.DeliveryStreamDescription?.DeliveryStreamStatus);
console.log(response.DeliveryStreamDescription?.DeliveryStreamType);
console.log(response.DeliveryStreamDescription?.VersionId);
```

### List delivery streams

```javascript
import {
  FirehoseClient,
  ListDeliveryStreamsCommand,
} from "@aws-sdk/client-firehose";

const firehose = new FirehoseClient({ region: "us-east-1" });

const response = await firehose.send(
  new ListDeliveryStreamsCommand({
    Limit: 25,
  }),
);

console.log(response.DeliveryStreamNames ?? []);
console.log(response.HasMoreDeliveryStreams ?? false);
```

If `HasMoreDeliveryStreams` is `true`, request the next page with `ExclusiveStartDeliveryStreamName` set to the last stream name from the previous page.

## Firehose-specific gotchas

- `Record.Data` must be bytes. Use `TextEncoder`, `Buffer`, or another byte conversion step instead of passing plain objects.
- For line-oriented downstream consumers, add your own newline delimiter. Firehose does not convert objects into JSON or JSON Lines for you.
- `PutRecordBatch` can return partial success. Retry only the failed records from `RequestResponses` instead of resending the full batch.
- Firehose write APIs use `DeliveryStreamName`; they do not use Kinesis Data Streams fields like `PartitionKey`.
- Delivery stream creation and destination updates are destination-specific. If you manage streams programmatically, validate those request shapes against the Firehose API reference for your destination type.

## Official sources

- AWS SDK for JavaScript v3 Firehose client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/firehose/`
- Amazon Data Firehose API Reference: `https://docs.aws.amazon.com/firehose/latest/APIReference/Welcome.html`
- `PutRecord` API reference: `https://docs.aws.amazon.com/firehose/latest/APIReference/API_PutRecord.html`
- `PutRecordBatch` API reference: `https://docs.aws.amazon.com/firehose/latest/APIReference/API_PutRecordBatch.html`
- `DescribeDeliveryStream` API reference: `https://docs.aws.amazon.com/firehose/latest/APIReference/API_DescribeDeliveryStream.html`
- `ListDeliveryStreams` API reference: `https://docs.aws.amazon.com/firehose/latest/APIReference/API_ListDeliveryStreams.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
