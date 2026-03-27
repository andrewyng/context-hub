---
name: omics
description: "AWS SDK for JavaScript v3 client for Amazon Omics workflows, runs, sequence stores, reference stores, and import jobs"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,omics,healthomics,genomics,javascript,nodejs"
---

# `@aws-sdk/client-omics`

Use `@aws-sdk/client-omics` for the Amazon Omics control plane in JavaScript: creating workflows, starting runs, managing run groups, creating sequence and reference stores, and tracking import jobs.

This client manages Omics resources. Your workflow definitions and data still live in Amazon S3, and most create or import operations are asynchronous, so plan to poll `Get*` APIs until the resource reaches a terminal state.

## Install

```bash
npm install @aws-sdk/client-omics
```

If you want to load a named AWS profile in code instead of relying on the default credential chain:

```bash
npm install @aws-sdk/credential-providers
```

## Credentials and region

Amazon Omics uses standard AWS SDK v3 credentials and SigV4 signing. For local development, the usual setup is a named profile plus region:

```bash
export AWS_PROFILE=omics-dev
export AWS_REGION=us-east-1
```

Direct environment credentials also work:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
```

Useful variables for the examples below:

```bash
export AWS_OMICS_SERVICE_ROLE_ARN=arn:aws:iam::123456789012:role/OmicsServiceRole
export AWS_OMICS_WORKFLOW_ZIP_URI=s3://your-bucket/workflows/example.zip
export AWS_OMICS_OUTPUT_S3_URI=s3://your-bucket/omics-runs/
export AWS_OMICS_REFERENCE_FASTA_URI=s3://your-bucket/references/hg38.fa.gz
export AWS_OMICS_READS_1_URI=s3://your-bucket/reads/sample_R1.fastq.gz
export AWS_OMICS_READS_2_URI=s3://your-bucket/reads/sample_R2.fastq.gz
export AWS_OMICS_RUN_PARAMETERS_JSON='{"YOUR_WORKFLOW_INPUT":"s3://your-bucket/input"}'
```

The `roleArn` values used by run and import operations must point to an IAM role that Omics can assume and that can read the referenced S3 inputs and write the configured outputs.

## Initialize the client

```javascript
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { OmicsClient } from "@aws-sdk/client-omics";

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const omics = new OmicsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you do not pass `credentials`, the SDK uses its normal default provider chain.

If you want to force a named shared-credentials profile in code, use `fromIni` from `@aws-sdk/credential-providers`:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { OmicsClient } from "@aws-sdk/client-omics";

const omics = new OmicsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({
    profile: process.env.AWS_PROFILE ?? "omics-dev",
  }),
});
```

## Common workflows

### Create and inspect a run group

Run groups let you cap resources for runs assigned to that group.

```javascript
import {
  CreateRunGroupCommand,
  GetRunGroupCommand,
} from "@aws-sdk/client-omics";

const created = await omics.send(
  new CreateRunGroupCommand({
    name: "standard-analysis",
    maxCpus: 256,
    maxRuns: 10,
    requestId: randomUUID(),
  }),
);

if (!created.id) {
  throw new Error("CreateRunGroup did not return an id");
}

const runGroup = await omics.send(
  new GetRunGroupCommand({
    id: created.id,
  }),
);

console.log({
  id: runGroup.id,
  name: runGroup.name,
  maxCpus: runGroup.maxCpus,
  maxRuns: runGroup.maxRuns,
});
```

Keep the returned `id`; `StartRun` accepts `runGroupId`, not the ARN.

### Create a private workflow from a zipped definition in S3

`CreateWorkflow` creates **private** workflows. The workflow definition file must be a `.zip` archive. Use `engine` for the workflow type (`"WDL"`, `"NEXTFLOW"`, `"CWL"`, or `"WDL_LENIENT"`), and set `main` to the entrypoint inside the archive.

```javascript
import {
  CreateWorkflowCommand,
  GetWorkflowCommand,
} from "@aws-sdk/client-omics";

const created = await omics.send(
  new CreateWorkflowCommand({
    name: "tumor-normal-wdl",
    engine: "WDL",
    definitionUri: requireEnv("AWS_OMICS_WORKFLOW_ZIP_URI"),
    main: "main.wdl",
    requestId: randomUUID(),
  }),
);

if (!created.id) {
  throw new Error("CreateWorkflow did not return an id");
}

for (;;) {
  const workflow = await omics.send(
    new GetWorkflowCommand({
      id: created.id,
    }),
  );

  console.log({
    workflowId: workflow.id,
    status: workflow.status,
    parameterTemplate: workflow.parameterTemplate,
  });

  if (workflow.status === "ACTIVE") {
    break;
  }

  if (workflow.status === "FAILED") {
    throw new Error(workflow.statusMessage ?? "Workflow creation failed");
  }

  await sleep(3000);
}
```

`GetWorkflow` returns `parameterTemplate`, which is the safest source for the input names your later `StartRun` call must use.

### Start a run and poll until it finishes

To start a run, pass the workflow ID, a service role ARN, an S3 output URI, and workflow parameters that match the workflow's parameter template exactly. `StartRun` accepts a free-form JSON document for `parameters`, but Omics rejects keys that are not defined by the workflow.

```javascript
import {
  GetRunCommand,
  StartRunCommand,
} from "@aws-sdk/client-omics";

const workflowId = requireEnv("AWS_OMICS_WORKFLOW_ID");
const roleArn = requireEnv("AWS_OMICS_SERVICE_ROLE_ARN");
const outputUri = requireEnv("AWS_OMICS_OUTPUT_S3_URI");
const parameters = JSON.parse(process.env.AWS_OMICS_RUN_PARAMETERS_JSON ?? "{}");

const input = {
  workflowId,
  workflowType: "PRIVATE",
  roleArn,
  outputUri,
  requestId: randomUUID(),
  name: "example-run",
  parameters,
  logLevel: "ERROR",
  retentionMode: "REMOVE",
};

if (process.env.AWS_OMICS_RUN_GROUP_ID) {
  input.runGroupId = process.env.AWS_OMICS_RUN_GROUP_ID;
}

if (process.env.AWS_OMICS_STORAGE_CAPACITY_GIB) {
  input.storageCapacity = Number(process.env.AWS_OMICS_STORAGE_CAPACITY_GIB);
} else {
  input.storageType = "DYNAMIC";
}

const started = await omics.send(new StartRunCommand(input));

if (!started.id) {
  throw new Error("StartRun did not return an id");
}

for (;;) {
  const run = await omics.send(
    new GetRunCommand({
      id: started.id,
    }),
  );

  console.log({
    runId: run.id,
    status: run.status,
    statusMessage: run.statusMessage,
    runOutputUri: run.runOutputUri,
    logLocation: run.logLocation,
  });

  if (run.status === "COMPLETED") {
    break;
  }

  if (run.status === "FAILED" || run.status === "CANCELLED") {
    throw new Error(run.failureReason ?? run.statusMessage ?? `Run ended with ${run.status}`);
  }

  await sleep(30000);
}
```

Important details:

- `workflowId` must be the workflow ID, not the workflow UUID.
- If your run uses `STATIC` storage, provide `storageCapacity`. Omics does not require `storageCapacity` for `DYNAMIC` storage.
- Reuse the same `requestId` when retrying the same logical submission so Omics can deduplicate it.

### Create a reference store and import a reference genome from S3

Reference stores hold FASTA reference genomes. After the import job completes, fetch reference metadata if you need the `referenceArn` for aligned read set imports.

```javascript
import {
  CreateReferenceStoreCommand,
  GetReferenceImportJobCommand,
  GetReferenceMetadataCommand,
  StartReferenceImportJobCommand,
} from "@aws-sdk/client-omics";

const referenceStore = await omics.send(
  new CreateReferenceStoreCommand({
    name: "human-reference-store",
    clientToken: randomUUID(),
  }),
);

if (!referenceStore.id) {
  throw new Error("CreateReferenceStore did not return an id");
}

const started = await omics.send(
  new StartReferenceImportJobCommand({
    referenceStoreId: referenceStore.id,
    roleArn: requireEnv("AWS_OMICS_SERVICE_ROLE_ARN"),
    clientToken: randomUUID(),
    sources: [
      {
        sourceFile: requireEnv("AWS_OMICS_REFERENCE_FASTA_URI"),
        name: "hg38",
      },
    ],
  }),
);

if (!started.id) {
  throw new Error("StartReferenceImportJob did not return an id");
}

for (;;) {
  const job = await omics.send(
    new GetReferenceImportJobCommand({
      referenceStoreId: referenceStore.id,
      id: started.id,
    }),
  );

  console.log({
    jobId: job.id,
    status: job.status,
    statusMessage: job.statusMessage,
  });

  if (job.status === "COMPLETED") {
    const referenceId = job.sources?.[0]?.referenceId;

    if (referenceId) {
      const reference = await omics.send(
        new GetReferenceMetadataCommand({
          referenceStoreId: referenceStore.id,
          id: referenceId,
        }),
      );

      console.log({
        referenceId: reference.id,
        referenceArn: reference.arn,
        status: reference.status,
      });
    }

    break;
  }

  if (
    job.status === "FAILED" ||
    job.status === "CANCELLED" ||
    job.status === "COMPLETED_WITH_FAILURES"
  ) {
    throw new Error(job.statusMessage ?? `Reference import ended with ${job.status}`);
  }

  await sleep(30000);
}
```

### Create a sequence store and import read sets from S3

Sequence stores hold read sets in `FASTQ`, `BAM`, `CRAM`, or `UBAM` format. For aligned formats (`BAM` and `CRAM`), include `referenceArn` so Omics can associate the read set with the correct reference genome.

```javascript
import {
  CreateSequenceStoreCommand,
  GetReadSetImportJobCommand,
  GetSequenceStoreCommand,
  StartReadSetImportJobCommand,
} from "@aws-sdk/client-omics";

const sequenceStore = await omics.send(
  new CreateSequenceStoreCommand({
    name: "example-sequence-store",
    clientToken: randomUUID(),
  }),
);

if (!sequenceStore.id) {
  throw new Error("CreateSequenceStore did not return an id");
}

for (;;) {
  const store = await omics.send(
    new GetSequenceStoreCommand({
      id: sequenceStore.id,
    }),
  );

  console.log({
    sequenceStoreId: store.id,
    status: store.status,
    statusMessage: store.statusMessage,
  });

  if (store.status === "ACTIVE") {
    break;
  }

  if (store.status === "FAILED") {
    throw new Error(store.statusMessage ?? "Sequence store creation failed");
  }

  await sleep(30000);
}

const sourceFileType = process.env.AWS_OMICS_READ_SET_FILE_TYPE ?? "FASTQ";
const readSetSource = {
  sourceFiles: {
    source1: requireEnv("AWS_OMICS_READS_1_URI"),
    ...(process.env.AWS_OMICS_READS_2_URI
      ? { source2: process.env.AWS_OMICS_READS_2_URI }
      : {}),
  },
  sourceFileType,
  subjectId: "subject-001",
  sampleId: "sample-001",
  name: "sample-001",
};

if (process.env.AWS_OMICS_REFERENCE_ARN) {
  readSetSource.referenceArn = process.env.AWS_OMICS_REFERENCE_ARN;
}

const started = await omics.send(
  new StartReadSetImportJobCommand({
    sequenceStoreId: sequenceStore.id,
    roleArn: requireEnv("AWS_OMICS_SERVICE_ROLE_ARN"),
    clientToken: randomUUID(),
    sources: [readSetSource],
  }),
);

if (!started.id) {
  throw new Error("StartReadSetImportJob did not return an id");
}

for (;;) {
  const job = await omics.send(
    new GetReadSetImportJobCommand({
      sequenceStoreId: sequenceStore.id,
      id: started.id,
    }),
  );

  console.log({
    jobId: job.id,
    status: job.status,
    statusMessage: job.statusMessage,
  });

  if (job.status === "COMPLETED") {
    console.log(job.sources);
    break;
  }

  if (
    job.status === "FAILED" ||
    job.status === "CANCELLED" ||
    job.status === "COMPLETED_WITH_FAILURES"
  ) {
    throw new Error(job.statusMessage ?? `Read set import ended with ${job.status}`);
  }

  await sleep(30000);
}
```

## Important notes

- `requestId` and `clientToken` are the idempotency keys for write operations. Generate them once per logical request and reuse them if you retry.
- Most Omics provisioning and import APIs are asynchronous. Poll `GetWorkflow`, `GetRun`, `GetSequenceStore`, `GetReadSetImportJob`, or `GetReferenceImportJob` instead of assuming the initial create call is finished.
- `StartRun` can either start a new run from `workflowId` or duplicate an existing run from `runId`. Do not mix up workflow IDs, workflow UUIDs, run IDs, and ARNs.
- `GetRun` returns `statusMessage`, `failureReason`, `logLocation`, and `runOutputUri`; these are the first fields to inspect when a run does not reach `COMPLETED`.
- Direct multipart uploads use `CreateMultipartReadSetUpload`, `UploadReadSetPart`, and `CompleteMultipartReadSetUpload`. Each uploaded part must be no larger than 100 MB.
- Variant stores and annotation stores are not open to new customers starting on 2025-11-07. Existing customers can continue using those APIs.
