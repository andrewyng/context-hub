---
name: backup
description: "AWS SDK for JavaScript v3 client for managing AWS Backup vaults, plans, selections, backup jobs, and restore jobs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,backup,javascript,nodejs,recovery,backup-vault,restore"
---

# AWS Backup SDK for JavaScript (v3)

Use `@aws-sdk/client-backup` for the AWS Backup control plane in JavaScript or TypeScript. Common tasks include creating backup vaults, defining backup plans, attaching protected resources to a plan, starting on-demand backup jobs, listing recovery points, and starting restore jobs.

This package manages AWS Backup resources and jobs in AWS. It does not back up local files by itself.

## Golden Rules

- Install `@aws-sdk/client-backup`, not the legacy `aws-sdk` v2 package.
- Prefer `BackupClient` plus individual command imports over broader service wrappers.
- Set `region` explicitly in code or standard AWS config before creating the client.
- `CreateBackupPlanCommand` defines rules, but resources are not protected until you also call `CreateBackupSelectionCommand`.
- `StartBackupJobCommand` and `StartRestoreJobCommand` are asynchronous. Poll `DescribeBackupJobCommand` or `DescribeRestoreJobCommand` for terminal state.
- `StartRestoreJobCommand` requires a `Metadata` map. Call `GetRecoveryPointRestoreMetadataCommand` first instead of guessing restore keys.

## Install

```bash
npm install @aws-sdk/client-backup
```

If you need named-profile or assume-role helpers in application code:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

AWS Backup is regional. Configure credentials and region before creating the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional
```

If you use shared AWS profiles locally, `AWS_PROFILE` also works with the standard AWS SDK for JavaScript v3 credential chain.

## Client Setup

### Minimal Node.js client

```javascript
import { BackupClient } from "@aws-sdk/client-backup";

const backup = new BackupClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { BackupClient } from "@aws-sdk/client-backup";

const backup = new BackupClient({
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
import { BackupClient } from "@aws-sdk/client-backup";
import { fromIni } from "@aws-sdk/credential-providers";

const backup = new BackupClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if your AWS access already comes from environment variables, shared config, ECS task credentials, EC2 instance metadata, web identity, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  BackupClient,
  ListBackupVaultsCommand,
} from "@aws-sdk/client-backup";

const backup = new BackupClient({ region: "us-east-1" });

const { BackupVaultList } = await backup.send(
  new ListBackupVaultsCommand({
    MaxResults: 20,
  }),
);

for (const vault of BackupVaultList ?? []) {
  console.log(vault.BackupVaultName, vault.BackupVaultArn);
}
```

## Common Workflows

### Create a backup vault

```javascript
import {
  BackupClient,
  CreateBackupVaultCommand,
  DescribeBackupVaultCommand,
} from "@aws-sdk/client-backup";

const backup = new BackupClient({ region: "us-east-1" });

const { BackupVaultName, BackupVaultArn } = await backup.send(
  new CreateBackupVaultCommand({
    BackupVaultName: "primary-vault",
    EncryptionKeyArn: "arn:aws:kms:us-east-1:123456789012:key/11111111-2222-3333-4444-555555555555",
    BackupVaultTags: {
      Environment: "prod",
      ManagedBy: "app",
    },
  }),
);

const vault = await backup.send(
  new DescribeBackupVaultCommand({
    BackupVaultName: BackupVaultName,
  }),
);

console.log(BackupVaultArn);
console.log(vault.NumberOfRecoveryPoints, vault.EncryptionKeyArn, vault.Locked);
```

Use `DescribeBackupVaultCommand` when you need current vault settings such as recovery-point count, KMS key ARN, or vault-lock retention fields.

### Configure SNS notifications for a vault

```javascript
import {
  BackupClient,
  GetBackupVaultNotificationsCommand,
  PutBackupVaultNotificationsCommand,
} from "@aws-sdk/client-backup";

const backup = new BackupClient({ region: "us-east-1" });

await backup.send(
  new PutBackupVaultNotificationsCommand({
    BackupVaultName: "primary-vault",
    SNSTopicArn: "arn:aws:sns:us-east-1:123456789012:backup-events",
    BackupVaultEvents: [
      "BACKUP_JOB_STARTED",
      "BACKUP_JOB_COMPLETED",
      "BACKUP_JOB_FAILED",
      "RESTORE_JOB_COMPLETED",
      "RESTORE_JOB_FAILED",
    ],
  }),
);

const notifications = await backup.send(
  new GetBackupVaultNotificationsCommand({
    BackupVaultName: "primary-vault",
  }),
);

console.log(notifications.SNSTopicArn, notifications.BackupVaultEvents);
```

Use vault notifications when you want push-style job events instead of tight polling loops.

### Create a backup plan and attach resources

Create the plan first, then create a selection that points AWS Backup at concrete resources.

```javascript
import {
  BackupClient,
  CreateBackupPlanCommand,
  CreateBackupSelectionCommand,
} from "@aws-sdk/client-backup";

const backup = new BackupClient({ region: "us-east-1" });

const plan = await backup.send(
  new CreateBackupPlanCommand({
    BackupPlan: {
      BackupPlanName: "daily-ebs-plan",
      Rules: [
        {
          RuleName: "daily-ebs",
          TargetBackupVaultName: "primary-vault",
          ScheduleExpression: "cron(0 5 ? * * *)",
          StartWindowMinutes: 60,
          CompletionWindowMinutes: 180,
          Lifecycle: {
            DeleteAfterDays: 30,
          },
          RecoveryPointTags: {
            Environment: "prod",
            Policy: "daily",
          },
        },
      ],
    },
  }),
);

await backup.send(
  new CreateBackupSelectionCommand({
    BackupPlanId: plan.BackupPlanId,
    BackupSelection: {
      SelectionName: "production-ebs-volumes",
      IamRoleArn: "arn:aws:iam::123456789012:role/service-role/AWSBackupDefaultServiceRole",
      Resources: [
        "arn:aws:ec2:us-east-1:123456789012:volume/vol-0123456789abcdef0",
      ],
    },
  }),
);
```

If you only create the plan, nothing is actually assigned to it yet. `CreateBackupSelectionCommand` is the step that binds resources and the IAM role AWS Backup should use.

### Start an on-demand backup job and poll for completion

```javascript
import {
  BackupClient,
  DescribeBackupJobCommand,
  StartBackupJobCommand,
} from "@aws-sdk/client-backup";

const backup = new BackupClient({ region: "us-east-1" });

const { BackupJobId, RecoveryPointArn } = await backup.send(
  new StartBackupJobCommand({
    BackupVaultName: "primary-vault",
    ResourceArn: "arn:aws:ec2:us-east-1:123456789012:volume/vol-0123456789abcdef0",
    IamRoleArn: "arn:aws:iam::123456789012:role/service-role/AWSBackupDefaultServiceRole",
    Lifecycle: {
      DeleteAfterDays: 30,
    },
    RecoveryPointTags: {
      Environment: "prod",
      Trigger: "manual",
    },
    IdempotencyToken: "manual-ebs-backup-20260313",
  }),
);

console.log(BackupJobId, RecoveryPointArn);

async function waitForBackupJob(backupJobId) {
  const doneStates = new Set(["COMPLETED", "ABORTED", "FAILED", "EXPIRED", "PARTIAL"]);

  for (;;) {
    const job = await backup.send(
      new DescribeBackupJobCommand({
        BackupJobId: backupJobId,
      }),
    );

    console.log(job.State, job.PercentDone, job.StatusMessage);

    if (!doneStates.has(job.State)) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    if (job.State !== "COMPLETED") {
      throw new Error(`Backup job ended in state ${job.State}: ${job.StatusMessage ?? "unknown"}`);
    }

    return job;
  }
}

await waitForBackupJob(BackupJobId);
```

`StartBackupJobCommand` requires three core inputs: `BackupVaultName`, `ResourceArn`, and `IamRoleArn`. Use `IdempotencyToken` when retries could otherwise create duplicate work.

### List recovery points in a vault

```javascript
import {
  BackupClient,
  ListRecoveryPointsByBackupVaultCommand,
} from "@aws-sdk/client-backup";

const backup = new BackupClient({ region: "us-east-1" });

let NextToken;

do {
  const page = await backup.send(
    new ListRecoveryPointsByBackupVaultCommand({
      BackupVaultName: "primary-vault",
      MaxResults: 100,
      NextToken,
    }),
  );

  for (const point of page.RecoveryPoints ?? []) {
    console.log(point.RecoveryPointArn, point.ResourceType, point.Status, point.CreationDate);
  }

  NextToken = page.NextToken;
} while (NextToken);
```

Use `ByResourceArn`, `ByResourceType`, `ByBackupPlanId`, or date filters if you only need a narrower subset.

### Start a restore job from a recovery point

Restore metadata is resource-specific. Fetch it first, adjust any values your restore target needs, then pass that map into `StartRestoreJobCommand`.

```javascript
import {
  BackupClient,
  DescribeRestoreJobCommand,
  GetRecoveryPointRestoreMetadataCommand,
  StartRestoreJobCommand,
} from "@aws-sdk/client-backup";

const backup = new BackupClient({ region: "us-east-1" });

const recoveryPointArn = "arn:aws:backup:us-east-1:123456789012:recovery-point:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const restoreMetadata = await backup.send(
  new GetRecoveryPointRestoreMetadataCommand({
    BackupVaultName: "primary-vault",
    RecoveryPointArn: recoveryPointArn,
  }),
);

if (!restoreMetadata.RestoreMetadata) {
  throw new Error("AWS Backup did not return restore metadata for this recovery point.");
}

const { RestoreJobId } = await backup.send(
  new StartRestoreJobCommand({
    RecoveryPointArn: recoveryPointArn,
    ResourceType: restoreMetadata.ResourceType,
    Metadata: {
      ...restoreMetadata.RestoreMetadata,
    },
    IamRoleArn: "arn:aws:iam::123456789012:role/service-role/AWSBackupDefaultServiceRole",
    IdempotencyToken: "restore-ebs-20260313",
  }),
);

async function waitForRestoreJob(restoreJobId) {
  const doneStates = new Set(["COMPLETED", "ABORTED", "FAILED"]);

  for (;;) {
    const job = await backup.send(
      new DescribeRestoreJobCommand({
        RestoreJobId: restoreJobId,
      }),
    );

    console.log(job.Status, job.PercentDone, job.StatusMessage);

    if (!doneStates.has(job.Status)) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    if (job.Status !== "COMPLETED") {
      throw new Error(`Restore job ended in status ${job.Status}: ${job.StatusMessage ?? "unknown"}`);
    }

    return job;
  }
}

const restoreJob = await waitForRestoreJob(RestoreJobId);
console.log(restoreJob.CreatedResourceArn);
```

For many workloads you must edit some metadata values before restore, such as destination identifiers or networking-related fields. Do not hard-code those keys unless you have confirmed the resource type's restore requirements.

### Update a recovery point lifecycle

```javascript
import {
  BackupClient,
  UpdateRecoveryPointLifecycleCommand,
} from "@aws-sdk/client-backup";

const backup = new BackupClient({ region: "us-east-1" });

const response = await backup.send(
  new UpdateRecoveryPointLifecycleCommand({
    BackupVaultName: "primary-vault",
    RecoveryPointArn: "arn:aws:backup:us-east-1:123456789012:recovery-point:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    Lifecycle: {
      MoveToColdStorageAfterDays: 30,
      DeleteAfterDays: 365,
    },
  }),
);

console.log(response.Lifecycle, response.CalculatedLifecycle);
```

## Practical Notes

- AWS Backup is a regional control-plane API. Region mismatches often look like missing vaults, plans, or recovery points.
- The service model exposes many list operations with `NextToken` and `MaxResults`. Do not assume a single list response is complete in larger accounts.
- Backup jobs and restore jobs are asynchronous. Treat `Start*Job` responses as accepted work, not finished work.
- `ListProtectedResourcesCommand` is useful when you need the inventory AWS Backup currently knows about before choosing a resource ARN to back up or restore.
- `GetRecoveryPointRestoreMetadataCommand` is the safest starting point for restores because the `Metadata` map is resource-specific.
- Temporary AWS credentials require `AWS_SESSION_TOKEN` in addition to access key ID and secret access key.

## Common Pitfalls

- Creating a backup plan and forgetting to create a selection, which leaves the plan with no protected resources.
- Treating `ListBackupJobsCommand` or `ListRestoreJobsCommand` as a detailed status API. Use the matching `Describe*JobCommand` call for the full job record.
- Hand-writing restore metadata without first calling `GetRecoveryPointRestoreMetadataCommand`.
- Using an IAM role ARN that AWS Backup cannot assume for the target resource.
- Looking in the wrong region when a vault or recovery point appears to be missing.

## Version Notes

- This guide targets `@aws-sdk/client-backup` version `3.1007.0`.
- AWS publishes the JavaScript SDK service docs under a rolling `latest` URL. Use the npm package version for dependency pinning and the AWS docs for current command names and request shapes.

## Official Sources

- AWS SDK for JavaScript v3 Backup client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/backup/`
- AWS Backup `CreateBackupVault` API: `https://docs.aws.amazon.com/aws-backup/latest/devguide/API_CreateBackupVault.html`
- AWS Backup `CreateBackupPlan` API: `https://docs.aws.amazon.com/aws-backup/latest/devguide/API_CreateBackupPlan.html`
- AWS Backup `CreateBackupSelection` API: `https://docs.aws.amazon.com/aws-backup/latest/devguide/API_CreateBackupSelection.html`
- AWS Backup `StartBackupJob` API: `https://docs.aws.amazon.com/aws-backup/latest/devguide/API_StartBackupJob.html`
- AWS Backup `GetRecoveryPointRestoreMetadata` API: `https://docs.aws.amazon.com/aws-backup/latest/devguide/API_GetRecoveryPointRestoreMetadata.html`
- AWS Backup `StartRestoreJob` API: `https://docs.aws.amazon.com/aws-backup/latest/devguide/API_StartRestoreJob.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- AWS SDK for JavaScript v3 region configuration: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html`
- npm package page: `https://www.npmjs.com/package/@aws-sdk/client-backup`
