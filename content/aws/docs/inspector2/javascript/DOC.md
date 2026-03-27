---
name: inspector2
description: "AWS SDK for JavaScript v3 client for Amazon Inspector account status, findings, coverage, deep inspection, and findings report workflows"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,inspector,inspector2,security,vulnerability,ec2,ecr,lambda,javascript,nodejs"
---

# `@aws-sdk/client-inspector2`

Use this package to work with Amazon Inspector from JavaScript or TypeScript. The client covers account enablement and status, findings, coverage, EC2 deep inspection configuration, findings reports, organization/member operations, and newer code security and SBOM APIs.

Amazon Inspector is regional. Set `region` explicitly or provide it through the normal AWS SDK configuration chain.

## Golden Rules

- Install `@aws-sdk/client-inspector2`, not the legacy `aws-sdk` v2 package.
- Use the standard AWS SDK v3 credential chain; this package does not handle credentials by itself.
- The service name is `inspector2`.
- Enable Inspector in the target account and region before expecting coverage or findings.
- `ListFindingsCommand` and `ListCoverageCommand` paginate with `nextToken`.
- `CreateFindingsReportCommand` requires both an S3 destination and a KMS key ARN.
- Findings reports return only `ACTIVE` findings by default; add a `findingStatus` filter if you need `SUPPRESSED` or `CLOSED` findings too.

## Install

```bash
npm install @aws-sdk/client-inspector2
```

Typical environment variables:

```bash
export AWS_REGION="us-east-1"
export AWS_PROFILE="dev" # optional when using shared AWS config
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional, for temporary credentials
export AWS_ACCOUNT_ID="123456789012"
export INSPECTOR_REPORT_BUCKET="example-inspector-reports"
export INSPECTOR_REPORT_KMS_KEY_ARN="arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012"
```

`AWS_ACCOUNT_ID` is not required by the SDK, but it is useful for account-status and account-targeted enablement calls.

## Prerequisites

Inspector uses the normal AWS SDK for JavaScript v3 authentication flow in Node.js. Environment variables, shared config files, IAM Identity Center, ECS task roles, and EC2 instance roles all work with the usual SDK behavior.

Your IAM principal also needs Inspector permissions for the operations you call. Common setup problems are usually one of these:

- Inspector is not enabled in the target region yet
- the caller lacks Inspector or KMS or S3 permissions
- the code points at the wrong AWS account or region

## Client Setup

### Minimal client

```javascript
import { Inspector2Client } from "@aws-sdk/client-inspector2";

const inspector2 = new Inspector2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { Inspector2Client } from "@aws-sdk/client-inspector2";

const inspector2 = new Inspector2Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  BatchGetAccountStatusCommand,
  Inspector2Client,
} from "@aws-sdk/client-inspector2";

const accountId = process.env.AWS_ACCOUNT_ID;

if (!accountId) {
  throw new Error("Set AWS_ACCOUNT_ID.");
}

const inspector2 = new Inspector2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await inspector2.send(
  new BatchGetAccountStatusCommand({
    accountIds: [accountId],
  }),
);

console.log(response.accounts?.[0]);
```

## Common Workflows

### Inspect account status and enable scan types

Use `BatchGetAccountStatusCommand` to read current account state. Use `EnableCommand` to enable specific resource scan types.

```javascript
import {
  BatchGetAccountStatusCommand,
  EnableCommand,
  Inspector2Client,
} from "@aws-sdk/client-inspector2";

const accountId = process.env.AWS_ACCOUNT_ID;

if (!accountId) {
  throw new Error("Set AWS_ACCOUNT_ID.");
}

const inspector2 = new Inspector2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const before = await inspector2.send(
  new BatchGetAccountStatusCommand({
    accountIds: [accountId],
  }),
);

console.log(before.accounts?.[0]);

await inspector2.send(
  new EnableCommand({
    accountIds: [accountId],
    resourceTypes: ["EC2", "ECR", "LAMBDA"],
  }),
);
```

`resourceTypes` currently supports `EC2`, `ECR`, `LAMBDA`, `LAMBDA_CODE`, and `CODE_REPOSITORY`.

For multi-account or organization workflows, the delegated-administrator and member APIs are separate operations on the same client.

### List findings with filters and pagination

`ListFindingsCommand` already returns finding objects, so you can usually work directly from the response without a second fetch.

```javascript
import {
  Inspector2Client,
  ListFindingsCommand,
} from "@aws-sdk/client-inspector2";

const inspector2 = new Inspector2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function listCriticalEc2Findings() {
  const findings = [];
  let nextToken;

  do {
    const page = await inspector2.send(
      new ListFindingsCommand({
        maxResults: 100,
        nextToken,
        filterCriteria: {
          severity: [{ comparison: "EQUALS", value: "CRITICAL" }],
          resourceType: [
            { comparison: "EQUALS", value: "AWS_EC2_INSTANCE" },
          ],
        },
        sortCriteria: {
          field: "LAST_OBSERVED_AT",
          sortOrder: "DESC",
        },
      }),
    );

    for (const finding of page.findings ?? []) {
      findings.push({
        findingArn: finding.findingArn,
        title: finding.title,
        severity: finding.severity,
        status: finding.status,
        inspectorScore: finding.inspectorScore,
        vulnerabilityId:
          finding.packageVulnerabilityDetails?.vulnerabilityId,
        resourceType: finding.resources?.[0]?.type,
        resourceId: finding.resources?.[0]?.id,
        lastObservedAt: finding.lastObservedAt,
      });
    }

    nextToken = page.nextToken;
  } while (nextToken);

  return findings;
}
```

Common string filters use `comparison` values `EQUALS`, `PREFIX`, or `NOT_EQUALS`. The findings filter model also supports date ranges, numeric ranges, tags, vulnerable package fields, EPSS score, and code repository fields.

### List scan coverage for resources

Use `ListCoverageCommand` when you need to know which resources Inspector is scanning and their scan status.

```javascript
import {
  Inspector2Client,
  ListCoverageCommand,
} from "@aws-sdk/client-inspector2";

const inspector2 = new Inspector2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function listEc2PackageCoverage() {
  const coveredResources = [];
  let nextToken;

  do {
    const page = await inspector2.send(
      new ListCoverageCommand({
        maxResults: 100,
        nextToken,
        filterCriteria: {
          resourceType: [
            { comparison: "EQUALS", value: "AWS_EC2_INSTANCE" },
          ],
          scanType: [{ comparison: "EQUALS", value: "PACKAGE" }],
        },
      }),
    );

    for (const item of page.coveredResources ?? []) {
      coveredResources.push({
        accountId: item.accountId,
        resourceType: item.resourceType,
        resourceId: item.resourceId,
        scanType: item.scanType,
        scanStatusCode: item.scanStatus?.statusCode,
        scanStatusReason: item.scanStatus?.reason,
        scanMode: item.scanMode,
        lastScannedAt: item.lastScannedAt,
      });
    }

    nextToken = page.nextToken;
  } while (nextToken);

  return coveredResources;
}
```

Coverage filters are separate from findings filters. For coverage, common fields include `resourceType`, `scanType`, `scanStatusCode`, `accountId`, `lastScannedAt`, ECR metadata, Lambda metadata, and code repository metadata.

### Read or update EC2 deep inspection configuration

Use `GetEc2DeepInspectionConfigurationCommand` to read the current configuration and `UpdateEc2DeepInspectionConfigurationCommand` to activate or update custom package paths.

```javascript
import {
  GetEc2DeepInspectionConfigurationCommand,
  Inspector2Client,
  UpdateEc2DeepInspectionConfigurationCommand,
} from "@aws-sdk/client-inspector2";

const inspector2 = new Inspector2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const current = await inspector2.send(
  new GetEc2DeepInspectionConfigurationCommand({}),
);

console.log({
  status: current.status,
  packagePaths: current.packagePaths,
  orgPackagePaths: current.orgPackagePaths,
  errorMessage: current.errorMessage,
});

await inspector2.send(
  new UpdateEc2DeepInspectionConfigurationCommand({
    activateDeepInspection: true,
    packagePaths: ["/usr/lib", "/usr/local/lib"],
  }),
);
```

Deep inspection status values are `ACTIVATED`, `DEACTIVATED`, `PENDING`, and `FAILED`.

If you manage custom paths, read the current configuration first and then write the full path list you want to keep.

### Export a findings report to S3 and poll for completion

Use `CreateFindingsReportCommand` to start the export and `GetFindingsReportStatusCommand` to poll until the report finishes.

```javascript
import { setTimeout as sleep } from "node:timers/promises";
import {
  CreateFindingsReportCommand,
  GetFindingsReportStatusCommand,
  Inspector2Client,
} from "@aws-sdk/client-inspector2";

const bucketName = process.env.INSPECTOR_REPORT_BUCKET;
const kmsKeyArn = process.env.INSPECTOR_REPORT_KMS_KEY_ARN;

if (!bucketName || !kmsKeyArn) {
  throw new Error(
    "Set INSPECTOR_REPORT_BUCKET and INSPECTOR_REPORT_KMS_KEY_ARN.",
  );
}

const inspector2 = new Inspector2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { reportId } = await inspector2.send(
  new CreateFindingsReportCommand({
    reportFormat: "JSON",
    s3Destination: {
      bucketName,
      keyPrefix: "inspector2/reports",
      kmsKeyArn,
    },
    filterCriteria: {
      severity: [{ comparison: "EQUALS", value: "CRITICAL" }],
    },
  }),
);

if (!reportId) {
  throw new Error("Inspector did not return a report ID.");
}

while (true) {
  const status = await inspector2.send(
    new GetFindingsReportStatusCommand({ reportId }),
  );

  console.log(status.status, status.destination);

  if (status.status === "SUCCEEDED") {
    break;
  }

  if (status.status === "FAILED" || status.status === "CANCELLED") {
    throw new Error(
      `${status.errorCode ?? "REPORT_FAILED"}: ${status.errorMessage ?? "Findings report did not complete."}`,
    );
  }

  await sleep(2000);
}
```

`reportFormat` accepts `CSV` or `JSON`.

## Common Pitfalls

- The package and service name are `inspector2`. Do not guess older names like `inspector`.
- Empty result sets are often a region or account mismatch, not an SDK problem.
- Findings and coverage list operations paginate; keep following `nextToken` until it is absent.
- Findings report exports need S3 write permissions and a valid KMS key ARN.
- Report status errors can include `INVALID_PERMISSIONS`, `BUCKET_NOT_FOUND`, `INCOMPATIBLE_BUCKET_REGION`, and `MALFORMED_KMS_KEY`.
- `CreateFindingsReportCommand` returns only `ACTIVE` findings unless you explicitly filter for other finding statuses.
- Updating deep inspection configuration writes the package path list you provide; fetch current settings first if you need merge behavior.

## Version Notes

- This guide targets `@aws-sdk/client-inspector2` version `3.1007.0`.
- At this version line, the client surface includes account status APIs, coverage and findings APIs, report export APIs, EC2 deep inspection APIs, and additional code-security, CIS, and SBOM operations.

## Official Sources

- `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/inspector2/`
- `https://docs.aws.amazon.com/cli/latest/reference/inspector2/index.html`
- `https://docs.aws.amazon.com/cli/latest/reference/inspector2/batch-get-account-status.html`
- `https://docs.aws.amazon.com/cli/latest/reference/inspector2/enable.html`
- `https://docs.aws.amazon.com/cli/latest/reference/inspector2/list-findings.html`
- `https://docs.aws.amazon.com/cli/latest/reference/inspector2/list-coverage.html`
- `https://docs.aws.amazon.com/cli/latest/reference/inspector2/get-ec2-deep-inspection-configuration.html`
- `https://docs.aws.amazon.com/cli/latest/reference/inspector2/update-ec2-deep-inspection-configuration.html`
- `https://docs.aws.amazon.com/cli/latest/reference/inspector2/create-findings-report.html`
- `https://docs.aws.amazon.com/cli/latest/reference/inspector2/get-findings-report-status.html`
