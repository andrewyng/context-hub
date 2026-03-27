---
name: deadline
description: "AWS SDK for JavaScript v3 client for managing AWS Deadline Cloud farms, queues, fleets, jobs, steps, and tasks"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,deadline,deadline-cloud,javascript,nodejs,rendering,job-scheduling"
---

# `@aws-sdk/client-deadline`

Use `@aws-sdk/client-deadline` to manage AWS Deadline Cloud control-plane resources from JavaScript or TypeScript. The normal workflow is: find or create a farm, create queues and fleets inside that farm, associate a queue with a fleet, submit a job from a JSON or YAML template string, then inspect jobs, steps, and tasks until the render finishes.

This package talks to the Deadline Cloud API. Worker agent setup, IAM role creation, storage profiles, and the contents of your render job template are separate concerns.

## Golden Rules

- Set `region` deliberately. Farms, queues, fleets, and jobs are region-scoped.
- Most operations use resource IDs such as `farmId`, `queueId`, `fleetId`, `jobId`, `stepId`, and `taskId`, not display names.
- `CreateQueueFleetAssociationCommand` is a separate step. Creating a queue and a fleet does not connect them automatically.
- `CreateJobCommand` requires `farmId`, `queueId`, `priority`, `template`, and `templateType`.
- Job priority is `1` to `100`, and `1` is the highest priority.
- List APIs use `nextToken` pagination. `SearchJobsCommand` uses `itemOffset` and `pageSize` instead.
- The generated service model exposes paginators for list operations, but no generated waiters. Poll with `GetJobCommand` or list related resources yourself.

## Install

```bash
npm install @aws-sdk/client-deadline
```

If you want to select a shared AWS profile in code:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-deadline@3.1007.0`.

## Prerequisites And Authentication

You need AWS credentials, a region, and existing Deadline Cloud permissions for the farms and queues you want to manage. Creating queues and fleets also usually means you already have IAM roles prepared for workers and queue execution.

Typical local environment variables:

```bash
export AWS_PROFILE="deadline"
export AWS_REGION="us-west-2"

export DEADLINE_FARM_ID="farm-1234567890abcdef"
export DEADLINE_QUEUE_ID="queue-1234567890abcdef"

export DEADLINE_QUEUE_ROLE_ARN="arn:aws:iam::123456789012:role/DeadlineQueueRole"
export DEADLINE_FLEET_ROLE_ARN="arn:aws:iam::123456789012:role/DeadlineFleetRole"

export DEADLINE_ATTACHMENTS_BUCKET="my-deadline-attachments"
export DEADLINE_JOB_TEMPLATE_JSON_PATH="./job-template.json"
```

In Node.js, AWS SDK v3 usually resolves credentials from the default provider chain, including environment variables, shared config files, IAM Identity Center, ECS task roles, and EC2 instance roles.

## Client Setup

### Minimal client

```javascript
import { DeadlineClient } from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

### Shared profile with `fromIni`

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { DeadlineClient } from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "deadline" }),
});
```

## Core Usage Pattern

AWS SDK v3 uses `client.send(new Command(input))`.

```javascript
import {
  DeadlineClient,
  ListFarmsCommand,
} from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const response = await deadline.send(
  new ListFarmsCommand({
    maxResults: 20,
  }),
);

for (const farm of response.farms ?? []) {
  console.log(farm.farmId, farm.displayName, farm.createdAt);
}
```

## Common Workflows

### Create a farm

Use a farm as the top-level container for queues, fleets, budgets, and permissions.

```javascript
import {
  CreateFarmCommand,
  DeadlineClient,
} from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const { farmId } = await deadline.send(
  new CreateFarmCommand({
    displayName: "studio-main",
    description: "Primary Deadline Cloud farm for production renders",
    tags: {
      environment: "production",
      team: "rendering",
    },
  }),
);

console.log(farmId);
```

The response returns the new `farmId`. Save it, because later queue, fleet, and job calls use the ID rather than the display name.

### Create a queue

Queues control where jobs are submitted and can carry job attachment and run-as settings.

```javascript
import {
  CreateQueueCommand,
  DeadlineClient,
} from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const farmId = process.env.DEADLINE_FARM_ID;
const roleArn = process.env.DEADLINE_QUEUE_ROLE_ARN;
const bucket = process.env.DEADLINE_ATTACHMENTS_BUCKET;

if (!farmId || !roleArn || !bucket) {
  throw new Error("Set DEADLINE_FARM_ID, DEADLINE_QUEUE_ROLE_ARN, and DEADLINE_ATTACHMENTS_BUCKET");
}

const { queueId } = await deadline.send(
  new CreateQueueCommand({
    farmId,
    displayName: "linux-render-queue",
    description: "Main Linux render queue",
    defaultBudgetAction: "NONE",
    roleArn,
    jobAttachmentSettings: {
      s3BucketName: bucket,
      rootPrefix: "deadline/jobs/",
    },
    jobRunAsUser: {
      runAs: "QUEUE_CONFIGURED_USER",
      posix: {
        user: "render",
        group: "render",
      },
    },
    tags: {
      os: "linux",
    },
  }),
);

console.log(queueId);
```

For Windows workers, use the `windows` form inside `jobRunAsUser` instead of `posix`.

### Create a service-managed EC2 fleet

Deadline Cloud fleets can be customer-managed or service-managed. This example creates a service-managed EC2 fleet with basic Linux capability requirements.

```javascript
import {
  CreateFleetCommand,
  DeadlineClient,
} from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const farmId = process.env.DEADLINE_FARM_ID;
const roleArn = process.env.DEADLINE_FLEET_ROLE_ARN;

if (!farmId || !roleArn) {
  throw new Error("Set DEADLINE_FARM_ID and DEADLINE_FLEET_ROLE_ARN");
}

const { fleetId } = await deadline.send(
  new CreateFleetCommand({
    farmId,
    displayName: "linux-spot-fleet",
    description: "Service-managed Linux fleet using spot capacity",
    roleArn,
    minWorkerCount: 0,
    maxWorkerCount: 20,
    configuration: {
      serviceManagedEc2: {
        instanceCapabilities: {
          cpuArchitectureType: "x86_64",
          osFamily: "LINUX",
          memoryMiB: { min: 8192 },
          vCpuCount: { min: 4 },
        },
        instanceMarketOptions: {
          type: "spot",
        },
      },
    },
    tags: {
      capacity: "spot",
    },
  }),
);

console.log(fleetId);
```

If you manage workers yourself, create the fleet with `configuration.customerManaged` instead.

### Associate a queue with a fleet

Jobs will not flow from a queue to a fleet until you create the association.

```javascript
import {
  CreateQueueFleetAssociationCommand,
  DeadlineClient,
} from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const farmId = process.env.DEADLINE_FARM_ID;
const queueId = process.env.DEADLINE_QUEUE_ID;
const fleetId = process.env.DEADLINE_FLEET_ID;

if (!farmId || !queueId || !fleetId) {
  throw new Error("Set DEADLINE_FARM_ID, DEADLINE_QUEUE_ID, and DEADLINE_FLEET_ID");
}

await deadline.send(
  new CreateQueueFleetAssociationCommand({
    farmId,
    queueId,
    fleetId,
  }),
);
```

### Submit a job from a JSON template

`CreateJobCommand` expects the job template as a raw string plus a `templateType` of `"JSON"` or `"YAML"`. Read the template from disk rather than trying to embed a large template inline.

```javascript
import { readFile } from "node:fs/promises";
import {
  CreateJobCommand,
  DeadlineClient,
} from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const farmId = process.env.DEADLINE_FARM_ID;
const queueId = process.env.DEADLINE_QUEUE_ID;
const templatePath = process.env.DEADLINE_JOB_TEMPLATE_JSON_PATH;

if (!farmId || !queueId || !templatePath) {
  throw new Error("Set DEADLINE_FARM_ID, DEADLINE_QUEUE_ID, and DEADLINE_JOB_TEMPLATE_JSON_PATH");
}

const template = await readFile(templatePath, "utf8");

const { jobId } = await deadline.send(
  new CreateJobCommand({
    farmId,
    queueId,
    priority: 50,
    template,
    templateType: "JSON",
    targetTaskRunStatus: "READY",
    parameters: {
      ShotName: { string: "shot-010" },
      FrameStart: { int: "1001" },
      SceneFile: { path: "/projects/show-a/scenes/shot-010.mb" },
    },
  }),
);

console.log(jobId);
```

The keys under `parameters` must match parameters defined by your Deadline Cloud job template. Each parameter value is typed as exactly one of `string`, `int`, `float`, or `path`.

If you send `attachments`, the `attachments.manifests` list is required, and each manifest requires at least `rootPath` and `rootPathFormat`.

### List jobs in a queue

`ListJobsCommand` is the simplest way to enumerate jobs for one queue.

```javascript
import {
  DeadlineClient,
  ListJobsCommand,
} from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const farmId = process.env.DEADLINE_FARM_ID;
const queueId = process.env.DEADLINE_QUEUE_ID;

if (!farmId || !queueId) {
  throw new Error("Set DEADLINE_FARM_ID and DEADLINE_QUEUE_ID");
}

let nextToken;

do {
  const page = await deadline.send(
    new ListJobsCommand({
      farmId,
      queueId,
      maxResults: 50,
      nextToken,
    }),
  );

  for (const job of page.jobs ?? []) {
    console.log(job.jobId, job.name, job.lifecycleStatus, job.taskRunStatus);
  }

  nextToken = page.nextToken;
} while (nextToken);
```

### Inspect one job, then walk steps and tasks

Use `GetJobCommand` for the current job state, then drill into steps and tasks.

```javascript
import {
  DeadlineClient,
  GetJobCommand,
  ListStepsCommand,
  ListTasksCommand,
} from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const farmId = process.env.DEADLINE_FARM_ID;
const queueId = process.env.DEADLINE_QUEUE_ID;
const jobId = process.env.DEADLINE_JOB_ID;

if (!farmId || !queueId || !jobId) {
  throw new Error("Set DEADLINE_FARM_ID, DEADLINE_QUEUE_ID, and DEADLINE_JOB_ID");
}

const job = await deadline.send(
  new GetJobCommand({
    farmId,
    queueId,
    jobId,
  }),
);

console.log({
  jobId: job.jobId,
  name: job.name,
  lifecycleStatus: job.lifecycleStatus,
  taskRunStatus: job.taskRunStatus,
  taskRunStatusCounts: job.taskRunStatusCounts,
});

const { steps = [] } = await deadline.send(
  new ListStepsCommand({
    farmId,
    queueId,
    jobId,
  }),
);

for (const step of steps) {
  console.log(step.stepId, step.name, step.lifecycleStatus, step.taskRunStatus);

  const { tasks = [] } = await deadline.send(
    new ListTasksCommand({
      farmId,
      queueId,
      jobId,
      stepId: step.stepId,
    }),
  );

  for (const task of tasks) {
    console.log("  ", task.taskId, task.runStatus, task.failureRetryCount ?? 0);
  }
}
```

### Search jobs with offset pagination

Use `SearchJobsCommand` when you need the search endpoint instead of simple queue listing. Unlike the list APIs, this operation uses `itemOffset` and returns `nextItemOffset`.

```javascript
import {
  DeadlineClient,
  SearchJobsCommand,
} from "@aws-sdk/client-deadline";

const deadline = new DeadlineClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const farmId = process.env.DEADLINE_FARM_ID;
const queueId = process.env.DEADLINE_QUEUE_ID;

if (!farmId || !queueId) {
  throw new Error("Set DEADLINE_FARM_ID and DEADLINE_QUEUE_ID");
}

const page = await deadline.send(
  new SearchJobsCommand({
    farmId,
    queueIds: [queueId],
    itemOffset: 0,
    pageSize: 25,
  }),
);

console.log({
  totalResults: page.totalResults,
  nextItemOffset: page.nextItemOffset,
});

for (const job of page.jobs ?? []) {
  console.log(job.jobId, job.name, job.lifecycleStatus, job.taskRunStatus);
}
```

## Deadline-Specific Gotchas

- Save resource IDs when you create farms, queues, fleets, and jobs. Later commands use IDs, not display names.
- Queue creation and fleet creation are not enough by themselves; you must also call `CreateQueueFleetAssociationCommand`.
- `priority` is inverted from what many schedulers use: `1` is highest priority.
- `template` on `CreateJobCommand` is the full template body as a string. The SDK does not load files for you.
- `List*` operations page with `nextToken`; `SearchJobsCommand` pages with numeric offsets.
- If you pass `attachments`, include at least one manifest, and each manifest must include `rootPath` plus `rootPathFormat` (`"posix"` or `"windows"`).
- The service model does not define waiters for Deadline Cloud. If you need progress tracking, poll `GetJobCommand` and list steps or tasks as needed.
- Do not hard-code long-lived AWS credentials into browser or frontend code.

## When To Reach For Other Packages

- `@aws-sdk/credential-providers`: shared profiles, IAM Identity Center, and explicit credential selection.
- `@aws-sdk/client-s3`: upload or manage S3 content referenced by queue job attachment settings or job manifests.
