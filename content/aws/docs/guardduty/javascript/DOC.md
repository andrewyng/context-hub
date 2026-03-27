---
name: guardduty
description: "AWS SDK for JavaScript v3 client for Amazon GuardDuty detectors, findings, filters, trusted IP sets, and publishing destinations."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,guardduty,javascript,nodejs,security,findings,threat-detection"
---

# `@aws-sdk/client-guardduty`

Use this package to manage Amazon GuardDuty from JavaScript with AWS SDK v3. The most common workflow is: find or create the detector for the current AWS Region, list findings for that detector, fetch full finding details, then optionally manage saved filters, trusted IP sets, or an S3 publishing destination for exported findings.

GuardDuty is regional. A detector, its findings, its filters, and its related resources are all scoped to the client region you configure.

## Install

```bash
npm install @aws-sdk/client-guardduty
```

## Prerequisites

You need AWS credentials with GuardDuty permissions in the target account and region. For some workflows you also need access to related AWS resources:

- S3 access for trusted IP sets and exported findings
- KMS access when exporting findings to an encrypted S3 destination
- permission to create or update the GuardDuty detector in that region

Typical local setup in Node.js:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

If you use a shared AWS profile, set `AWS_PROFILE` before starting your app.

## Initialize the client

```javascript
import { GuardDutyClient } from "@aws-sdk/client-guardduty";

const guardduty = new GuardDutyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

In Node.js, AWS SDK v3 uses the default credential provider chain, so you usually do not need to pass credentials explicitly when your environment or shared AWS config is already set up.

## Find or create the detector for this region

GuardDuty requires a detector in each region where you enable the service. The service allows only one detector per account per region.

```javascript
import {
  CreateDetectorCommand,
  GuardDutyClient,
  ListDetectorsCommand,
} from "@aws-sdk/client-guardduty";

const guardduty = new GuardDutyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function getOrCreateDetectorId() {
  const listed = await guardduty.send(new ListDetectorsCommand({}));
  const existingDetectorId = listed.DetectorIds?.[0];

  if (existingDetectorId) {
    return existingDetectorId;
  }

  const created = await guardduty.send(
    new CreateDetectorCommand({
      Enable: true,
      FindingPublishingFrequency: "FIFTEEN_MINUTES",
    }),
  );

  if (!created.DetectorId) {
    throw new Error("GuardDuty did not return a detector ID");
  }

  return created.DetectorId;
}
```

`FindingPublishingFrequency` accepts `FIFTEEN_MINUTES`, `ONE_HOUR`, or `SIX_HOURS`.

## Inspect or update detector settings

Use `GetDetector` to inspect the current detector status, enabled data sources, and feature configuration. Use `UpdateDetector` to change the enabled state, publishing frequency, or configured features.

```javascript
import {
  GetDetectorCommand,
  GuardDutyClient,
  UpdateDetectorCommand,
} from "@aws-sdk/client-guardduty";

const guardduty = new GuardDutyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function inspectAndUpdateDetector(detectorId) {
  const before = await guardduty.send(
    new GetDetectorCommand({ DetectorId: detectorId }),
  );

  console.log({
    status: before.Status,
    findingPublishingFrequency: before.FindingPublishingFrequency,
    createdAt: before.CreatedAt,
    updatedAt: before.UpdatedAt,
  });

  await guardduty.send(
    new UpdateDetectorCommand({
      DetectorId: detectorId,
      Enable: true,
      FindingPublishingFrequency: "ONE_HOUR",
    }),
  );
}
```

## List findings and fetch full details

`ListFindings` returns finding IDs. Use `GetFindings` with those IDs when you need the full finding payload.

```javascript
import {
  GetFindingsCommand,
  GuardDutyClient,
  ListFindingsCommand,
} from "@aws-sdk/client-guardduty";

const guardduty = new GuardDutyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function listHighSeverityFindings(detectorId) {
  const listed = await guardduty.send(
    new ListFindingsCommand({
      DetectorId: detectorId,
      FindingCriteria: {
        Criterion: {
          severity: {
            Gte: 7,
          },
        },
      },
      MaxResults: 20,
    }),
  );

  const findingIds = listed.FindingIds ?? [];

  if (findingIds.length === 0) {
    return [];
  }

  const details = await guardduty.send(
    new GetFindingsCommand({
      DetectorId: detectorId,
      FindingIds: findingIds,
    }),
  );

  return (details.Findings ?? []).map((finding) => ({
    id: finding.Id,
    type: finding.Type,
    title: finding.Title,
    severity: finding.Severity,
    resourceType: finding.Resource?.ResourceType,
    archived: finding.Service?.Archived,
    updatedAt: finding.UpdatedAt,
  }));
}
```

GuardDuty finding criteria supports many nested attributes. For severity bands, GuardDuty documents these numeric ranges:

- low: `1` to `3`
- medium: `4` to `6`
- high: `7` to `8`
- critical: `9` to `10`

If you need every page of results, keep following `NextToken` until it is absent.

## Generate sample findings

Sample findings are useful when you need test data for dashboards, alerting, or downstream processing.

```javascript
import {
  CreateSampleFindingsCommand,
  GuardDutyClient,
} from "@aws-sdk/client-guardduty";

const guardduty = new GuardDutyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createSampleFindings(detectorId) {
  await guardduty.send(
    new CreateSampleFindingsCommand({
      DetectorId: detectorId,
    }),
  );
}
```

## Create a saved filter

Filters let you store reusable finding criteria. `Action` can be `NOOP` or `ARCHIVE`.

```javascript
import {
  CreateFilterCommand,
  GuardDutyClient,
} from "@aws-sdk/client-guardduty";

const guardduty = new GuardDutyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createHighSeverityFilter(detectorId) {
  const response = await guardduty.send(
    new CreateFilterCommand({
      DetectorId: detectorId,
      Name: "high-severity-findings",
      Description: "Saved filter for GuardDuty findings with severity 7 or higher",
      Action: "NOOP",
      Rank: 1,
      FindingCriteria: {
        Criterion: {
          severity: {
            Gte: 7,
          },
        },
      },
    }),
  );

  console.log(response.Name);
}
```

Use `ARCHIVE` only when you intentionally want matching findings archived by the filter.

## Create a trusted IP set from S3

`CreateIPSet` creates what the GuardDuty console calls a trusted IP list. The source file must be in S3, and the request uses the file URI.

```javascript
import {
  CreateIPSetCommand,
  GuardDutyClient,
} from "@aws-sdk/client-guardduty";

const guardduty = new GuardDutyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createTrustedIpSet(detectorId) {
  const response = await guardduty.send(
    new CreateIPSetCommand({
      DetectorId: detectorId,
      Name: "corp-egress-trusted-ips",
      Format: "TXT",
      Location: "s3://my-guardduty-lists/trusted-ips.txt",
      Activate: true,
      ExpectedBucketOwner: "123456789012",
    }),
  );

  return response.IpSetId;
}
```

Supported IP set formats include `TXT`, `STIX`, `OTX_CSV`, `ALIEN_VAULT`, `PROOF_POINT`, and `FIRE_EYE`.

## Export findings to S3

GuardDuty can export findings to an S3 publishing destination. Today the destination type is `S3`, and you must provide both the destination ARN and the KMS key ARN used for encryption.

```javascript
import {
  CreatePublishingDestinationCommand,
  DescribePublishingDestinationCommand,
  GuardDutyClient,
} from "@aws-sdk/client-guardduty";

const guardduty = new GuardDutyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createPublishingDestination(detectorId) {
  const created = await guardduty.send(
    new CreatePublishingDestinationCommand({
      DetectorId: detectorId,
      DestinationType: "S3",
      DestinationProperties: {
        DestinationArn: "arn:aws:s3:::my-guardduty-exports/findings/",
        KmsKeyArn:
          "arn:aws:kms:us-east-1:123456789012:key/11111111-2222-3333-4444-555555555555",
      },
    }),
  );

  if (!created.DestinationId) {
    throw new Error("GuardDuty did not return a publishing destination ID");
  }

  const destination = await guardduty.send(
    new DescribePublishingDestinationCommand({
      DetectorId: detectorId,
      DestinationId: created.DestinationId,
    }),
  );

  console.log({
    destinationId: destination.DestinationId,
    status: destination.Status,
    destinationArn: destination.DestinationProperties?.DestinationArn,
  });
}
```

For an S3 folder destination, AWS documents the ARN format as `arn:aws:s3:::DOC-EXAMPLE-BUCKET/myFolder/`.

## Important GuardDuty gotchas

- GuardDuty is regional. If you switch `region`, you are talking to a different detector and a different findings set.
- `CreateDetector` does not create detectors globally. You must enable GuardDuty separately in each region you use.
- GuardDuty supports only one detector per account per region, so call `ListDetectors` before creating a new one.
- Data source availability can differ by region.
- If you configure features on `CreateDetector` or `UpdateDetector`, do not specify both `EKS_RUNTIME_MONITORING` and `RUNTIME_MONITORING`; GuardDuty returns an error because runtime monitoring already includes EKS runtime threat detection.
- When you specify some detector features, GuardDuty enables unspecified optional features by default, except `RUNTIME_MONITORING`.
- `CreatePublishingDestination` requires the destination resource to exist first, and the destination type is currently only `S3`.
- For S3-backed IP sets and exports, make sure the bucket and KMS permissions are correct for the GuardDuty service in that account and region.
- Create-style APIs accept `ClientToken` idempotency tokens. Use them in retry-prone automation if duplicate creation would be a problem.

## Minimal end-to-end example

```javascript
import {
  CreateDetectorCommand,
  GetFindingsCommand,
  GuardDutyClient,
  ListDetectorsCommand,
  ListFindingsCommand,
} from "@aws-sdk/client-guardduty";

const guardduty = new GuardDutyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function main() {
  const listed = await guardduty.send(new ListDetectorsCommand({}));

  let detectorId = listed.DetectorIds?.[0];

  if (!detectorId) {
    const created = await guardduty.send(
      new CreateDetectorCommand({
        Enable: true,
      }),
    );

    detectorId = created.DetectorId;
  }

  if (!detectorId) {
    throw new Error("Unable to resolve a GuardDuty detector ID");
  }

  const findingIdsPage = await guardduty.send(
    new ListFindingsCommand({
      DetectorId: detectorId,
      MaxResults: 10,
    }),
  );

  const findingIds = findingIdsPage.FindingIds ?? [];

  if (findingIds.length === 0) {
    console.log("No findings in this region");
    return;
  }

  const findings = await guardduty.send(
    new GetFindingsCommand({
      DetectorId: detectorId,
      FindingIds: findingIds,
    }),
  );

  for (const finding of findings.Findings ?? []) {
    console.log({
      id: finding.Id,
      type: finding.Type,
      severity: finding.Severity,
      title: finding.Title,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```
