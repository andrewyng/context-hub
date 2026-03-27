---
name: rekognition
description: "AWS SDK for JavaScript v3 client for Rekognition image analysis, face collections, text detection, and asynchronous video jobs"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,rekognition,vision,images,video,faces"
---

# AWS Rekognition SDK for JavaScript (v3)

Use `@aws-sdk/client-rekognition` from trusted server-side JavaScript or TypeScript code when you need image analysis, face collection workflows, text detection, moderation checks, or asynchronous video analysis.

## Golden Rule

- Install `@aws-sdk/client-rekognition`, not the legacy `aws-sdk` v2 package.
- This doc covers package version `3.1007.0`.
- Prefer `RekognitionClient` plus individual commands over the aggregated `Rekognition` service class.
- Set `region` explicitly in code or through standard AWS shared config.
- Use `Image.S3Object` for objects already in S3 and `Image.Bytes` for in-memory image bytes.
- Treat video analysis APIs such as `StartLabelDetectionCommand` as asynchronous jobs that return a `JobId`.
- Use this client from backend code or AWS-hosted workloads. Browser use needs a deliberate credential setup such as Cognito identity pools.

## Install

```bash
npm install @aws-sdk/client-rekognition
```

Common companion packages:

```bash
npm install @aws-sdk/credential-providers dotenv
```

## Prerequisites

- AWS credentials with Rekognition permissions and access to any S3 buckets you reference.
- An AWS region where you will create the Rekognition client.
- For asynchronous video jobs, an SNS topic and an IAM role that allows Rekognition to publish job completion notifications.

Common environment variables:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...

export AWS_REKOGNITION_BUCKET=my-rekognition-bucket
export AWS_REKOGNITION_COLLECTION=employees
export REKOGNITION_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:rekognition-jobs
export REKOGNITION_ROLE_ARN=arn:aws:iam::123456789012:role/RekognitionPublishToSns
```

If you use shared AWS config instead of raw keys, set `AWS_PROFILE` and `AWS_REGION` and let the SDK resolve credentials through the default provider chain.

## Client Setup

### Minimal client

```javascript
import { RekognitionClient } from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Named profile

```javascript
import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { fromIni } from "@aws-sdk/credential-providers";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "default" }),
});
```

## Core Usage Pattern

AWS SDK v3 calls use `client.send(new Command(input))`.

```javascript
import {
  DetectLabelsCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({ region: "us-east-1" });

const response = await rekognition.send(
  new DetectLabelsCommand({
    Image: {
      S3Object: {
        Bucket: process.env.AWS_REKOGNITION_BUCKET,
        Name: "images/city.jpg",
      },
    },
    MaxLabels: 10,
    MinConfidence: 80,
  }),
);

for (const label of response.Labels ?? []) {
  console.log(label.Name, label.Confidence);
}
```

## Common Workflows

### Detect labels in an S3 image

```javascript
import {
  DetectLabelsCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const result = await rekognition.send(
  new DetectLabelsCommand({
    Image: {
      S3Object: {
        Bucket: process.env.AWS_REKOGNITION_BUCKET,
        Name: "photos/warehouse.jpg",
      },
    },
    MaxLabels: 15,
    MinConfidence: 80,
  }),
);

for (const label of result.Labels ?? []) {
  console.log(label.Name, label.Confidence);
}
```

### Detect text from local image bytes

In Node.js, pass raw bytes from `readFile`. Do not pass a base64 string unless you decode it first.

```javascript
import { readFile } from "node:fs/promises";
import {
  DetectTextCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const imageBytes = await readFile("./receipt.jpg");

const result = await rekognition.send(
  new DetectTextCommand({
    Image: {
      Bytes: imageBytes,
    },
  }),
);

for (const detection of result.TextDetections ?? []) {
  if (detection.Type === "LINE") {
    console.log(detection.DetectedText, detection.Confidence);
  }
}
```

### Compare faces between two S3 images

```javascript
import {
  CompareFacesCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const result = await rekognition.send(
  new CompareFacesCommand({
    SourceImage: {
      S3Object: {
        Bucket: process.env.AWS_REKOGNITION_BUCKET,
        Name: "faces/source.jpg",
      },
    },
    TargetImage: {
      S3Object: {
        Bucket: process.env.AWS_REKOGNITION_BUCKET,
        Name: "faces/group-photo.jpg",
      },
    },
    SimilarityThreshold: 90,
  }),
);

for (const match of result.FaceMatches ?? []) {
  console.log(match.Similarity, match.Face?.BoundingBox);
}
```

`SimilarityThreshold` filters returned matches. It does not create a face collection or persist anything for later searches.

### Create a face collection, index faces, and search by image

Use collections when you need repeated face search over a known set of indexed faces.

```javascript
import {
  CreateCollectionCommand,
  IndexFacesCommand,
  RekognitionClient,
  SearchFacesByImageCommand,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const collectionId = process.env.AWS_REKOGNITION_COLLECTION ?? "employees";

await rekognition.send(
  new CreateCollectionCommand({
    CollectionId: collectionId,
  }),
);

await rekognition.send(
  new IndexFacesCommand({
    CollectionId: collectionId,
    Image: {
      S3Object: {
        Bucket: process.env.AWS_REKOGNITION_BUCKET,
        Name: "known-faces/alice.jpg",
      },
    },
    ExternalImageId: "alice",
    MaxFaces: 1,
  }),
);

const search = await rekognition.send(
  new SearchFacesByImageCommand({
    CollectionId: collectionId,
    Image: {
      S3Object: {
        Bucket: process.env.AWS_REKOGNITION_BUCKET,
        Name: "queries/visitor.jpg",
      },
    },
    MaxFaces: 5,
    FaceMatchThreshold: 90,
  }),
);

for (const match of search.FaceMatches ?? []) {
  console.log(match.Face?.ExternalImageId, match.Similarity);
}
```

If `CreateCollectionCommand` has already been run for the collection ID you want, skip that step and reuse the existing collection.

### Start an asynchronous video label job and fetch results

Video analysis jobs return a `JobId`. Production flows usually wait for the SNS completion notification before calling `GetLabelDetectionCommand`.

```javascript
import {
  GetLabelDetectionCommand,
  RekognitionClient,
  StartLabelDetectionCommand,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const start = await rekognition.send(
  new StartLabelDetectionCommand({
    Video: {
      S3Object: {
        Bucket: process.env.AWS_REKOGNITION_BUCKET,
        Name: "videos/storefront.mp4",
      },
    },
    NotificationChannel: {
      SNSTopicArn: process.env.REKOGNITION_SNS_TOPIC_ARN,
      RoleArn: process.env.REKOGNITION_ROLE_ARN,
    },
    MinConfidence: 80,
  }),
);

const jobId = start.JobId;

if (!jobId) {
  throw new Error("StartLabelDetection did not return a JobId");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let nextToken;

for (;;) {
  const page = await rekognition.send(
    new GetLabelDetectionCommand({
      JobId: jobId,
      SortBy: "TIMESTAMP",
      MaxResults: 1000,
      NextToken: nextToken,
    }),
  );

  if (page.JobStatus === "IN_PROGRESS") {
    await sleep(5000);
    continue;
  }

  if (page.JobStatus !== "SUCCEEDED") {
    throw new Error(`Label detection job failed with status ${page.JobStatus}`);
  }

  for (const item of page.Labels ?? []) {
    console.log(item.Timestamp, item.Label?.Name, item.Label?.Confidence);
  }

  if (!page.NextToken) {
    break;
  }

  nextToken = page.NextToken;
}
```

## Error Handling

Rekognition returns normal AWS SDK service exceptions. For app-level handling, check `error.name` and decide whether the problem is bad input, missing AWS permissions, or missing collection and S3 resources.

```javascript
import {
  DetectLabelsCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({ region: "us-east-1" });

try {
  await rekognition.send(
    new DetectLabelsCommand({
      Image: {
        S3Object: {
          Bucket: "missing-bucket",
          Name: "missing.jpg",
        },
      },
    }),
  );
} catch (error) {
  if (error?.name === "InvalidS3ObjectException") {
    console.error("The image could not be loaded from S3");
  } else if (error?.name === "AccessDeniedException") {
    console.error("The caller does not have permission for this Rekognition request");
  } else if (error?.name === "ResourceNotFoundException") {
    console.error("The requested Rekognition resource was not found");
  } else {
    console.error(error);
  }
}
```

## Rekognition-Specific Pitfalls

- `Image.Bytes` expects binary image data. In Node.js, a `Buffer` from `readFile` works.
- `CompareFacesCommand` is a one-off comparison call. It does not create searchable state.
- `SearchFacesByImageCommand` only works against a collection that already contains indexed faces.
- `Start*` video APIs are asynchronous. Persist the `JobId` if another worker will fetch results later.
- `Get*` video result APIs are paginated with `NextToken`; keep reading until it is absent.
- Missing S3 permissions or a wrong region often show up as service exceptions even when the request shape is correct.

## When To Reach For Other Packages

- `@aws-sdk/credential-providers`: shared config profiles, Cognito identity pools, and other explicit credential provider setups.
- `@aws-sdk/client-s3`: upload source images and videos before passing them to Rekognition through `S3Object` references.
- `@aws-sdk/client-sns`: manage the SNS topic used for asynchronous video job notifications.

## Official Docs

- AWS SDK for JavaScript v3 Rekognition client: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/rekognition/`
- AWS SDK for JavaScript v3 credentials guide: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-rekognition`
