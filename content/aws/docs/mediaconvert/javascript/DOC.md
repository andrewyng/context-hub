---
name: mediaconvert
description: "AWS SDK for JavaScript v3 client for creating, monitoring, and canceling AWS Elemental MediaConvert jobs"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,mediaconvert,javascript,nodejs,video,transcoding,s3"
---

# `@aws-sdk/client-mediaconvert`

Use `@aws-sdk/client-mediaconvert` to create and manage AWS Elemental MediaConvert jobs from JavaScript or TypeScript. The normal workflow is: choose the correct AWS region, provide an IAM role ARN and S3 input/output locations, submit a job with `CreateJobCommand`, then poll `GetJobCommand` until the job reaches a terminal state.

This package manages MediaConvert resources and jobs in AWS. It does not transcode media locally.

## Golden Rules

- Set `region` deliberately. MediaConvert jobs, queues, presets, and templates are region-scoped.
- Pass a valid IAM role ARN in `Role` when creating jobs. `CreateJobCommand` requires it.
- Keep your source media in S3 and write outputs to S3 URIs.
- Treat MediaConvert job settings as real configuration, not something to improvise from memory. Start from a known-good payload or console-generated JSON when possible.
- New code should not build around `DescribeEndpointsCommand`. AWS documents that operation as deprecated and no longer required.
- A successful `CreateJobCommand` response means the job was accepted, not that transcoding finished.

## Install

```bash
npm install @aws-sdk/client-mediaconvert
```

If you want to force a shared AWS profile in code instead of relying on the default provider chain:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-mediaconvert@3.1007.0`.

## Prerequisites And Authentication

MediaConvert requests need AWS credentials, a region, and S3 locations for inputs and outputs. Job creation also needs an IAM role that MediaConvert can assume.

Typical environment variables for local development:

```bash
export AWS_PROFILE="media"
export AWS_REGION="us-west-2"

export AWS_MEDIACONVERT_ROLE_ARN="arn:aws:iam::123456789012:role/MediaConvertServiceRole"
export AWS_MEDIACONVERT_INPUT_S3_URI="s3://my-input-bucket/source/video.mov"
export AWS_MEDIACONVERT_OUTPUT_S3_URI="s3://my-output-bucket/outputs/"

# Optional: target a non-default queue or explicit endpoint
export AWS_MEDIACONVERT_QUEUE_ARN="arn:aws:mediaconvert:us-west-2:123456789012:queues/Default"
export AWS_MEDIACONVERT_ENDPOINT="https://abcd1234.mediaconvert.us-west-2.amazonaws.com"
```

In Node.js, AWS SDK v3 usually resolves credentials from the default provider chain, including environment variables, shared config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

## Client Setup

### Minimal client

```javascript
import { MediaConvertClient } from "@aws-sdk/client-mediaconvert";

const mediaconvert = new MediaConvertClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  ...(process.env.AWS_MEDIACONVERT_ENDPOINT
    ? { endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT }
    : {}),
});
```

If you already have an explicit MediaConvert endpoint or VPC endpoint for your account, pass it in `endpoint`. For new code, prefer direct regional client configuration instead of calling the deprecated `DescribeEndpoints` operation.

### Named shared profile with `fromIni`

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { MediaConvertClient } from "@aws-sdk/client-mediaconvert";

const mediaconvert = new MediaConvertClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "media" }),
  ...(process.env.AWS_MEDIACONVERT_ENDPOINT
    ? { endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT }
    : {}),
});
```

## Core Usage Pattern

AWS SDK v3 uses `client.send(new Command(input))`.

```javascript
import {
  ListQueuesCommand,
  MediaConvertClient,
} from "@aws-sdk/client-mediaconvert";

const mediaconvert = new MediaConvertClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const response = await mediaconvert.send(
  new ListQueuesCommand({
    ListBy: "NAME",
    Order: "ASCENDING",
  }),
);

for (const queue of response.Queues ?? []) {
  console.log(queue.Name, queue.Arn);
}
```

## Common Workflows

### Submit a basic file-to-file transcoding job

This example reads one source object from S3 and writes an H.264/AAC MP4 output to an S3 destination prefix.

```javascript
import {
  CreateJobCommand,
  MediaConvertClient,
} from "@aws-sdk/client-mediaconvert";

const roleArn = process.env.AWS_MEDIACONVERT_ROLE_ARN;
const inputUri = process.env.AWS_MEDIACONVERT_INPUT_S3_URI;
const outputUri = process.env.AWS_MEDIACONVERT_OUTPUT_S3_URI;
const queueArn = process.env.AWS_MEDIACONVERT_QUEUE_ARN;

if (!roleArn || !inputUri || !outputUri) {
  throw new Error("Set AWS_MEDIACONVERT_ROLE_ARN, AWS_MEDIACONVERT_INPUT_S3_URI, and AWS_MEDIACONVERT_OUTPUT_S3_URI");
}

const mediaconvert = new MediaConvertClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  ...(process.env.AWS_MEDIACONVERT_ENDPOINT
    ? { endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT }
    : {}),
});

const response = await mediaconvert.send(
  new CreateJobCommand({
    Role: roleArn,
    ...(queueArn ? { Queue: queueArn } : {}),
    Settings: {
      TimecodeConfig: {
        Source: "ZEROBASED",
      },
      Inputs: [
        {
          FileInput: inputUri,
          TimecodeSource: "ZEROBASED",
          AudioSelectors: {
            "Audio Selector 1": {
              DefaultSelection: "DEFAULT",
            },
          },
        },
      ],
      OutputGroups: [
        {
          Name: "File Group",
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: outputUri,
            },
          },
          Outputs: [
            {
              NameModifier: "-mp4",
              ContainerSettings: {
                Container: "MP4",
              },
              VideoDescription: {
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    MaxBitrate: 5000000,
                    QvbrSettings: {
                      QvbrQualityLevel: 7,
                    },
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 96000,
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  }),
);

console.log(response.Job?.Id);
console.log(response.Job?.Status);
```

MediaConvert job settings can become much larger than this. If your team already uses custom presets or job templates, keep those JSON settings under version control and send them through `CreateJobCommand` instead of rebuilding every nested field by hand.

### Poll until the job finishes

`CreateJobCommand` returns quickly. Use `GetJobCommand` to watch the job until it reaches a terminal status.

```javascript
import {
  GetJobCommand,
  MediaConvertClient,
} from "@aws-sdk/client-mediaconvert";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mediaconvert = new MediaConvertClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  ...(process.env.AWS_MEDIACONVERT_ENDPOINT
    ? { endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT }
    : {}),
});

async function waitForJob(jobId) {
  while (true) {
    const result = await mediaconvert.send(
      new GetJobCommand({
        Id: jobId,
      }),
    );

    const status = result.Job?.Status ?? "UNKNOWN";
    console.log(status, result.Job?.JobPercentComplete ?? 0);

    if (status === "COMPLETE") {
      return result.Job;
    }

    if (status === "ERROR" || status === "CANCELED") {
      throw new Error(`MediaConvert job ${jobId} finished with status ${status}`);
    }

    await delay(15000);
  }
}

await waitForJob("1678901234567-abcde");
```

### Cancel a job

Use `CancelJobCommand` when the current transcode is no longer needed.

```javascript
import {
  CancelJobCommand,
  MediaConvertClient,
} from "@aws-sdk/client-mediaconvert";

const mediaconvert = new MediaConvertClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  ...(process.env.AWS_MEDIACONVERT_ENDPOINT
    ? { endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT }
    : {}),
});

await mediaconvert.send(
  new CancelJobCommand({
    Id: "1678901234567-abcde",
  }),
);
```

## Practical Notes

- MediaConvert job payloads are large enough that many teams store them as JSON checked into the repo or derived from the MediaConvert console, then inject only the input and output locations at runtime.
- Keep the client region, queue ARN, job template, preset names, and S3 buckets aligned. Cross-region mismatches are a common cause of confusing failures.
- The output destination shown above is an S3 prefix such as `s3://bucket/outputs/`, not a local filesystem path.
- Browser use is uncommon because MediaConvert usually needs broad AWS permissions, service roles, and direct access to account resources.

## Common Pitfalls

- Forgetting the required `Role` field on `CreateJobCommand`.
- Pointing the client at the wrong AWS region for the queue, preset, or template you want to use.
- Copying older code that still calls `DescribeEndpointsCommand` for every run.
- Treating job acceptance as successful transcoding instead of polling `GetJobCommand`.
- Hand-writing complex job settings once in code and never preserving the known-good JSON that produced them.
- Using S3 URIs that the MediaConvert service role cannot read from or write to.

## Version Notes For `3.1007.0`

- This guide targets `@aws-sdk/client-mediaconvert@3.1007.0`.
- The AWS SDK for JavaScript v3 service docs are published under a rolling `latest` URL. Use the npm package version for dependency pinning and the AWS docs for operation names and request shapes.
- `DescribeEndpointsCommand` remains part of the client surface for compatibility, but AWS documents `DescribeEndpoints` as deprecated and says it is no longer required for new code.

## Official Sources

- AWS SDK for JavaScript v3 MediaConvert client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/mediaconvert/`
- AWS Elemental MediaConvert API Reference: `https://docs.aws.amazon.com/mediaconvert/latest/apireference/`
- AWS boto3 MediaConvert service reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/mediaconvert.html`
- AWS boto3 `create_job` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/mediaconvert/client/create_job.html`
- AWS boto3 `get_job` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/mediaconvert/client/get_job.html`
- AWS boto3 `cancel_job` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/mediaconvert/client/cancel_job.html`
- AWS boto3 `list_queues` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/mediaconvert/client/list_queues.html`
- AWS boto3 `describe_endpoints` reference: `https://docs.aws.amazon.com/boto3/latest/reference/services/mediaconvert/client/describe_endpoints.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
