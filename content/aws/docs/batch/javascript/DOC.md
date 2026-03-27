---
name: batch
description: "AWS SDK for JavaScript v3 client for submitting, listing, inspecting, canceling, and terminating AWS Batch jobs"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,batch,javascript,nodejs,job-queue,containers"
---

# AWS Batch SDK for JavaScript (v3)

Use `@aws-sdk/client-batch` to manage AWS Batch jobs and related Batch resources from JavaScript or TypeScript. Common tasks include describing job queues, submitting jobs, polling job status, listing queued or running jobs, and canceling or terminating work.

This package is the Batch control-plane client. It submits and manages jobs in AWS, but it does not run the container or job process locally.

## Golden Rules

- Install `@aws-sdk/client-batch`, not the legacy `aws-sdk` v2 package.
- Prefer `BatchClient` plus individual command imports over broader service wrappers.
- Set `region` explicitly in code or through standard AWS configuration.
- `SubmitJobCommand` only accepts the job into Batch. It does not wait for completion.
- Use `DescribeJobsCommand` for detailed status and container-level details. `ListJobsCommand` is a summary API.
- Use `CancelJobCommand` for work that has not started running yet. Use `TerminateJobCommand` once the job is starting or running.
- Pin the job definition revision with `name:revision` or a full ARN when exact runtime behavior matters.

## Install

```bash
npm install @aws-sdk/client-batch
```

If you need shared-profile, IAM Identity Center, or assume-role helpers in code, install the credential provider package you actually use:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

AWS Batch is regional. Configure AWS credentials and a region before creating the client.

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
import { BatchClient } from "@aws-sdk/client-batch";

const batch = new BatchClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { BatchClient } from "@aws-sdk/client-batch";

const batch = new BatchClient({
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
import { BatchClient } from "@aws-sdk/client-batch";
import { fromIni } from "@aws-sdk/credential-providers";

const batch = new BatchClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if your AWS access already comes from environment variables, shared config, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  BatchClient,
  DescribeJobQueuesCommand,
} from "@aws-sdk/client-batch";

const batch = new BatchClient({ region: "us-east-1" });

const response = await batch.send(
  new DescribeJobQueuesCommand({
    jobQueues: ["high-priority"],
  }),
);

console.log(response.jobQueues?.[0]?.jobQueueName, response.jobQueues?.[0]?.state);
```

## Common Workflows

### Submit a job

```javascript
import {
  BatchClient,
  SubmitJobCommand,
} from "@aws-sdk/client-batch";

const batch = new BatchClient({ region: "us-east-1" });

const { jobId, jobName } = await batch.send(
  new SubmitJobCommand({
    jobName: "daily-etl-2026-03-13",
    jobQueue: "high-priority",
    jobDefinition: "etl-job:3",
    containerOverrides: {
      command: ["node", "dist/jobs/daily-etl.js"],
      environment: [
        { name: "RUN_DATE", value: "2026-03-13" },
        { name: "LOG_LEVEL", value: "info" },
      ],
    },
    retryStrategy: {
      attempts: 3,
    },
    timeout: {
      attemptDurationSeconds: 3600,
    },
  }),
);

console.log(jobId, jobName);
```

`jobQueue` and `jobDefinition` can be names or ARNs. For deployment automation, prefer a fixed job definition revision such as `etl-job:3` so a later active revision does not change behavior unexpectedly.

### Poll a job until it finishes

`SubmitJobCommand` returns immediately after the job is accepted. Poll `DescribeJobsCommand` until the status reaches a terminal state.

```javascript
import {
  BatchClient,
  DescribeJobsCommand,
} from "@aws-sdk/client-batch";

const batch = new BatchClient({ region: "us-east-1" });

async function waitForJob(jobId) {
  for (;;) {
    const { jobs } = await batch.send(
      new DescribeJobsCommand({
        jobs: [jobId],
      }),
    );

    const job = jobs?.[0];

    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    console.log(job.status, job.statusReason);

    if (job.status === "SUCCEEDED") {
      return job;
    }

    if (job.status === "FAILED") {
      throw new Error(job.statusReason ?? "Batch job failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
```

For container jobs, `DescribeJobsCommand` is also the place to inspect fields such as `container.exitCode`, `container.reason`, and attempt history after a failure.

### List jobs in a queue with pagination

```javascript
import {
  BatchClient,
  ListJobsCommand,
} from "@aws-sdk/client-batch";

const batch = new BatchClient({ region: "us-east-1" });

let nextToken;

do {
  const response = await batch.send(
    new ListJobsCommand({
      jobQueue: "high-priority",
      jobStatus: "RUNNING",
      maxResults: 100,
      nextToken,
    }),
  );

  for (const summary of response.jobSummaryList ?? []) {
    console.log(summary.jobId, summary.jobName, summary.status, summary.createdAt);
  }

  nextToken = response.nextToken;
} while (nextToken);
```

`ListJobsCommand` returns summary records. If you need detailed container, retry, or attempt information, pass the returned job IDs to `DescribeJobsCommand`.

### Cancel or terminate a job

AWS Batch distinguishes between canceling queued work and terminating work that has already started.

```javascript
import {
  BatchClient,
  CancelJobCommand,
  TerminateJobCommand,
} from "@aws-sdk/client-batch";

const batch = new BatchClient({ region: "us-east-1" });

await batch.send(
  new CancelJobCommand({
    jobId: "0d9f0f32-1234-5678-90ab-cdef12345678",
    reason: "Superseded by a newer run",
  }),
);

await batch.send(
  new TerminateJobCommand({
    jobId: "7de1b7b9-1234-5678-90ab-cdef12345678",
    reason: "Manual rollback",
  }),
);
```

If you are not sure whether the job has started, read the current status first with `DescribeJobsCommand` and choose the operation accordingly.

## Practical Notes

- Batch is regional. The client region must match the region where the job queue, job definition, and compute environment exist.
- Browser use is uncommon because this package manages AWS infrastructure and needs AWS credentials with Batch permissions.
- `SubmitJobCommand` does not prove the job completed successfully. Always follow with status checks when the result matters.
- `ListJobsCommand` is useful for dashboards and polling loops, but it does not replace `DescribeJobsCommand` for debugging a failure.
- Batch resource names and ARNs are both accepted in many APIs. Be consistent inside one code path to avoid mixing regions, accounts, or revisions.

## Common Pitfalls

- Sending a job definition name without a revision when your deployment expects a specific revision.
- Treating a successful `SubmitJobCommand` response as job success instead of queue acceptance.
- Calling `CancelJobCommand` on a job that is already starting or running.
- Forgetting to set the region explicitly in scripts and workers, which usually turns into resource-not-found errors against the wrong region.
- Debugging only from `ListJobsCommand` output instead of loading full job details with `DescribeJobsCommand`.

## Version Notes

- This guide targets `@aws-sdk/client-batch` version `3.1007.0`.
- The current package surface includes the command-oriented client pattern shown here, including `SubmitJobCommand`, `DescribeJobsCommand`, `ListJobsCommand`, `CancelJobCommand`, `TerminateJobCommand`, and `DescribeJobQueuesCommand`.

## Official Sources

- AWS SDK for JavaScript v3 Batch client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/batch/`
- AWS Batch API Reference: `https://docs.aws.amazon.com/batch/latest/APIReference/Welcome.html`
- AWS Batch `SubmitJob` API: `https://docs.aws.amazon.com/batch/latest/APIReference/API_SubmitJob.html`
- AWS Batch `DescribeJobs` API: `https://docs.aws.amazon.com/batch/latest/APIReference/API_DescribeJobs.html`
- AWS Batch `ListJobs` API: `https://docs.aws.amazon.com/batch/latest/APIReference/API_ListJobs.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
