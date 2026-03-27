---
name: macie2
description: "AWS SDK for JavaScript v3 client for enabling Amazon Macie, inspecting S3 bucket coverage, running classification jobs, and working with findings"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,macie,macie2,s3,security,data-classification,javascript,nodejs"
---

# `@aws-sdk/client-macie2`

Use this package to manage Amazon Macie from JavaScript or TypeScript. The client covers Macie account setup, S3 bucket inventory and search, classification jobs, findings, sensitive-data reveal, allow lists, custom data identifiers, tagging, and organization or member workflows.

Macie is regional. The SDK requires a region, and the service model resolves endpoints as `macie2.<region>.<dnsSuffix>`. If you override the endpoint, do not combine that with FIPS or dual-stack settings.

## Golden Rules

- Install `@aws-sdk/client-macie2`, not the legacy `aws-sdk` v2 package.
- Set `region` explicitly or provide it through the normal AWS SDK configuration chain.
- Macie must be enabled for the account in the target region before most account-scoped APIs are useful.
- Most list-style APIs paginate with `nextToken`; build pagination into scripts from the start.
- `CreateClassificationJobCommand` requires a `clientToken` and explicit S3 bucket owner account IDs.
- `GetSensitiveDataOccurrencesCommand` is asynchronous; check availability first, then poll until the status becomes `SUCCESS` or `ERROR`.

## Install

```bash
npm install @aws-sdk/client-macie2
```

Typical local environment variables:

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional
export AWS_ACCOUNT_ID="123456789012"
export MACIE_BUCKET_NAME="example-sensitive-data-bucket"
```

`AWS_ACCOUNT_ID` is not required by the SDK itself, but it is convenient for classification job requests because Macie expects bucket owner account IDs in `s3JobDefinition.bucketDefinitions`.

## Prerequisites

Macie uses the standard AWS SDK for JavaScript v3 credential chain in Node.js. Environment variables, shared AWS config files, IAM Identity Center, ECS task roles, and EC2 instance roles all work with the normal SDK behavior.

Your IAM principal also needs Macie permissions for the operations you call. Common setup issues are not package issues: they are usually missing IAM permissions, Macie not being enabled in the region yet, or targeting the wrong region for the S3 buckets and findings you expect.

## Client Setup

### Minimal client

```javascript
import { Macie2Client } from "@aws-sdk/client-macie2";

const macie = new Macie2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { Macie2Client } from "@aws-sdk/client-macie2";

const macie = new Macie2Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## What This Client Covers

Common areas in the generated client surface:

- Account lifecycle: `EnableMacieCommand`, `GetMacieSessionCommand`, `UpdateMacieSessionCommand`
- S3 inventory: `DescribeBucketsCommand`, `SearchResourcesCommand`, `GetBucketStatisticsCommand`
- Classification jobs: `CreateClassificationJobCommand`, `DescribeClassificationJobCommand`, `ListClassificationJobsCommand`
- Findings: `ListFindingsCommand`, `GetFindingsCommand`, `CreateSampleFindingsCommand`
- Sensitive-data reveal: `GetSensitiveDataOccurrencesAvailabilityCommand`, `GetSensitiveDataOccurrencesCommand`
- Detection tuning: allow lists, managed data identifiers, custom data identifiers, findings filters, and sensitivity inspection templates

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  GetMacieSessionCommand,
  Macie2Client,
} from "@aws-sdk/client-macie2";

const macie = new Macie2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const session = await macie.send(new GetMacieSessionCommand({}));

console.log({
  status: session.status,
  findingPublishingFrequency: session.findingPublishingFrequency,
  serviceRole: session.serviceRole,
});
```

## Common Workflows

### Enable Macie or inspect the current session

`GetMacieSessionCommand` reads the current account status. `EnableMacieCommand` enables Macie and lets you choose the policy-finding publishing frequency.

```javascript
import { randomUUID } from "node:crypto";
import {
  EnableMacieCommand,
  GetMacieSessionCommand,
  Macie2Client,
} from "@aws-sdk/client-macie2";

const macie = new Macie2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await macie.send(
  new EnableMacieCommand({
    status: "ENABLED",
    findingPublishingFrequency: "FIFTEEN_MINUTES",
    clientToken: randomUUID(),
  }),
);

const session = await macie.send(new GetMacieSessionCommand({}));

console.log({
  status: session.status,
  findingPublishingFrequency: session.findingPublishingFrequency,
});
```

Use `GetMacieSessionCommand` by itself when you only want to inspect the existing account configuration. If you want to pause or resume Macie later, use `UpdateMacieSessionCommand` with `status: "PAUSED"` or `status: "ENABLED"`.

### List S3 buckets that Macie monitors

`DescribeBucketsCommand` returns Macie bucket metadata such as the bucket ARN, region, object counts, classifiable object counts, encryption details, public access information, and the most recent job or automated-discovery metadata.

```javascript
import {
  DescribeBucketsCommand,
  Macie2Client,
} from "@aws-sdk/client-macie2";

const macie = new Macie2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken;

do {
  const page = await macie.send(
    new DescribeBucketsCommand({
      maxResults: 50,
      nextToken,
      sortCriteria: {
        attributeName: "bucketName",
        orderBy: "ASC",
      },
    }),
  );

  for (const bucket of page.buckets ?? []) {
    console.log({
      name: bucket.bucketName,
      arn: bucket.bucketArn,
      region: bucket.region,
      objectCount: bucket.objectCount,
      classifiableObjectCount: bucket.classifiableObjectCount,
      automatedDiscoveryMonitoringStatus:
        bucket.automatedDiscoveryMonitoringStatus,
      allowsUnencryptedObjectUploads: bucket.allowsUnencryptedObjectUploads,
      errorCode: bucket.errorCode,
    });
  }

  nextToken = page.nextToken;
} while (nextToken);
```

If a bucket shows `errorCode: "ACCESS_DENIED"`, Macie found the bucket but could not retrieve the metadata it needs for analysis.

### Create and poll a one-time classification job

For a one-time job, set `jobType: "ONE_TIME"` and omit `scheduleFrequency`. The minimal request is `name`, `clientToken`, `jobType`, and `s3JobDefinition`.

```javascript
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import {
  CreateClassificationJobCommand,
  DescribeClassificationJobCommand,
  Macie2Client,
} from "@aws-sdk/client-macie2";

const accountId = process.env.AWS_ACCOUNT_ID;
const bucketName = process.env.MACIE_BUCKET_NAME;

if (!accountId || !bucketName) {
  throw new Error("Set AWS_ACCOUNT_ID and MACIE_BUCKET_NAME.");
}

const macie = new Macie2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const created = await macie.send(
  new CreateClassificationJobCommand({
    name: `scan-${bucketName}`,
    description: "One-time Macie scan created from the SDK",
    clientToken: randomUUID(),
    jobType: "ONE_TIME",
    managedDataIdentifierSelector: "RECOMMENDED",
    s3JobDefinition: {
      bucketDefinitions: [
        {
          accountId,
          buckets: [bucketName],
        },
      ],
    },
    tags: {
      environment: "dev",
    },
  }),
);

console.log({
  jobId: created.jobId,
  jobArn: created.jobArn,
});

const terminalStates = new Set([
  "COMPLETE",
  "CANCELLED",
  "USER_PAUSED",
  "PAUSED",
  "IDLE",
]);

while (true) {
  const job = await macie.send(
    new DescribeClassificationJobCommand({
      jobId: created.jobId,
    }),
  );

  console.log({
    jobId: job.jobId,
    jobStatus: job.jobStatus,
    objectsScanned: job.statistics?.objectsScanned,
    bytesProcessed: job.statistics?.bytesProcessed,
  });

  if (job.jobStatus && terminalStates.has(job.jobStatus)) {
    break;
  }

  await sleep(10_000);
}
```

For recurring jobs, switch to `jobType: "SCHEDULED"` and provide `scheduleFrequency` with a daily, weekly, or monthly schedule.

### Create sample findings, then fetch full finding details

`CreateSampleFindingsCommand` is a safe way to exercise finding workflows without waiting for a real classification result. `ListFindingsCommand` returns finding IDs; call `GetFindingsCommand` to retrieve the actual finding objects.

```javascript
import {
  CreateSampleFindingsCommand,
  GetFindingsCommand,
  ListFindingsCommand,
  Macie2Client,
} from "@aws-sdk/client-macie2";

const macie = new Macie2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await macie.send(
  new CreateSampleFindingsCommand({
    findingTypes: ["SensitiveData:S3Object/Financial"],
  }),
);

const list = await macie.send(
  new ListFindingsCommand({
    maxResults: 10,
    sortCriteria: {
      attributeName: "createdAt",
      orderBy: "DESC",
    },
  }),
);

if (!list.findingIds?.length) {
  throw new Error("No findings returned.");
}

const details = await macie.send(
  new GetFindingsCommand({
    findingIds: list.findingIds,
  }),
);

for (const finding of details.findings ?? []) {
  console.log({
    id: finding.id,
    sample: finding.sample,
    category: finding.category,
    type: finding.type,
    title: finding.title,
    severity: finding.severity?.description,
    bucketName: finding.resourcesAffected?.s3Bucket?.name,
    objectKey: finding.resourcesAffected?.s3Object?.key,
  });
}
```

### Reveal sensitive data occurrences for a finding

Before requesting the reveal, call `GetSensitiveDataOccurrencesAvailabilityCommand`. If availability is `UNAVAILABLE`, inspect the returned reasons instead of polling blindly.

```javascript
import { setTimeout as sleep } from "node:timers/promises";
import {
  GetSensitiveDataOccurrencesAvailabilityCommand,
  GetSensitiveDataOccurrencesCommand,
  Macie2Client,
} from "@aws-sdk/client-macie2";

const macie = new Macie2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const findingId = process.env.MACIE_FINDING_ID;

if (!findingId) {
  throw new Error("Set MACIE_FINDING_ID.");
}

const availability = await macie.send(
  new GetSensitiveDataOccurrencesAvailabilityCommand({
    findingId,
  }),
);

if (availability.code !== "AVAILABLE") {
  console.log("Reveal is unavailable:", availability.reasons);
} else {
  while (true) {
    const result = await macie.send(
      new GetSensitiveDataOccurrencesCommand({
        findingId,
      }),
    );

    if (result.status === "SUCCESS") {
      console.dir(result.sensitiveDataOccurrences, { depth: null });
      break;
    }

    if (result.status === "ERROR") {
      throw new Error(result.error ?? "Macie failed to reveal occurrences.");
    }

    await sleep(2_000);
  }
}
```

The generated service model also defines a `FindingRevealed` waiter. If you prefer not to manage polling yourself, check the waiter exports available in the exact SDK version you ship.

## Pitfalls

- Macie is enabled per account and region. A client configured for the wrong region will not see the buckets, jobs, or findings you expect.
- `ListFindingsCommand` returns only finding IDs. Use `GetFindingsCommand` for the actual finding payloads.
- `GetSensitiveDataOccurrencesCommand` is not an immediate read. The response status can be `PROCESSING` before the reveal is ready.
- `CreateClassificationJobCommand` needs the bucket owner account ID in `s3JobDefinition.bucketDefinitions`, not just a bucket name.
- Many list and search APIs default to partial result sets. Keep `maxResults` and `nextToken` in every inventory script.
- Custom endpoints cannot be combined with FIPS or dual-stack endpoint settings for this service model.

## Version Notes

- This guide is pinned to `@aws-sdk/client-macie2` version `3.1007.0`.
- The Macie service model used by the generated client is `2020-01-01`.
- The AWS JavaScript SDK v3 docs site is a rolling latest view. When exact command exports matter, check the installed package version in `package.json` alongside the maintainer docs.

## Official Sources

- AWS SDK for JavaScript v3 Macie client: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/macie2/`
- Amazon Macie API Reference: `https://docs.aws.amazon.com/macie/latest/APIReference/`
- Amazon Macie User Guide: `https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html`
- npm package page: `https://www.npmjs.com/package/@aws-sdk/client-macie2`
