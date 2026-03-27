---
name: healthlake
description: "AWS SDK for JavaScript v3 client for Amazon HealthLake datastore management and bulk data jobs"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,healthlake,fhir,healthcare,javascript,nodejs"
---

# `@aws-sdk/client-healthlake`

Use `@aws-sdk/client-healthlake` for the **HealthLake control plane** in JavaScript: creating, listing, describing, and deleting FHIR datastores, plus starting and tracking bulk import and export jobs.

This package does **not** replace the FHIR REST endpoint exposed by an active datastore. After a datastore is active, use its `DatastoreEndpoint` for FHIR reads and writes.

## Install

```bash
npm install @aws-sdk/client-healthlake
```

If you need explicit profile-based credential loading in code, also install:

```bash
npm install @aws-sdk/credential-providers
```

## Credentials and region

HealthLake uses the standard AWS SDK for JavaScript v3 credential chain. In local development, the simplest setup is usually a named profile plus a region:

```bash
export AWS_PROFILE=dev
export AWS_REGION=us-east-1
```

Direct environment credentials also work:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
```

For import and export examples, set these too:

```bash
export HEALTHLAKE_DATASTORE_ID=your-datastore-id
export HEALTHLAKE_DATA_ACCESS_ROLE_ARN=arn:aws:iam::123456789012:role/HealthLakeDataAccessRole
export HEALTHLAKE_INPUT_S3_URI=s3://your-input-bucket/path/
export HEALTHLAKE_OUTPUT_S3_URI=s3://your-output-bucket/path/
```

## Initialize the client

```javascript
import { HealthLakeClient } from "@aws-sdk/client-healthlake";

export const healthlake = new HealthLakeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

The normal v3 pattern is:

```javascript
const response = await healthlake.send(new SomeCommand(input));
```

## Common workflows

### Create a FHIR datastore

HealthLake datastore creation is asynchronous. Start the create call, keep the returned datastore ID, then poll until the datastore becomes active.

```javascript
import { setTimeout as sleep } from "node:timers/promises";
import {
  CreateFHIRDatastoreCommand,
  DescribeFHIRDatastoreCommand,
  HealthLakeClient,
} from "@aws-sdk/client-healthlake";

const client = new HealthLakeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const created = await client.send(
  new CreateFHIRDatastoreCommand({
    DatastoreName: "claims-r4-demo",
    DatastoreTypeVersion: "R4",
  }),
);

const datastoreId = created.DatastoreId;

if (!datastoreId) {
  throw new Error("CreateFHIRDatastore did not return a DatastoreId");
}

for (;;) {
  const described = await client.send(
    new DescribeFHIRDatastoreCommand({
      DatastoreId: datastoreId,
    }),
  );

  const properties = described.DatastoreProperties ?? described;
  const status = properties.DatastoreStatus;

  console.log({
    datastoreId,
    status,
    endpoint: properties.DatastoreEndpoint,
  });

  if (status === "ACTIVE") {
    break;
  }

  if (typeof status === "string" && status.endsWith("_FAILED")) {
    throw new Error(`Datastore creation failed with status ${status}`);
  }

  await sleep(15000);
}
```

Use `DatastoreTypeVersion: "R4"` for a FHIR R4 datastore.

### List existing datastores

```javascript
import {
  HealthLakeClient,
  ListFHIRDatastoresCommand,
} from "@aws-sdk/client-healthlake";

const client = new HealthLakeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new ListFHIRDatastoresCommand({
    MaxResults: 20,
  }),
);

for (const datastore of response.DatastorePropertiesList ?? []) {
  console.log({
    datastoreId: datastore.DatastoreId,
    name: datastore.DatastoreName,
    status: datastore.DatastoreStatus,
    createdAt: datastore.CreatedAt,
  });
}
```

### Inspect one datastore and get its endpoint

Use `DescribeFHIRDatastoreCommand` when you need the endpoint, status, or other details for one datastore.

```javascript
import {
  DescribeFHIRDatastoreCommand,
  HealthLakeClient,
} from "@aws-sdk/client-healthlake";

const client = new HealthLakeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const datastoreId = process.env.HEALTHLAKE_DATASTORE_ID;

if (!datastoreId) {
  throw new Error("Set HEALTHLAKE_DATASTORE_ID first");
}

const response = await client.send(
  new DescribeFHIRDatastoreCommand({
    DatastoreId: datastoreId,
  }),
);

const properties = response.DatastoreProperties ?? response;

console.log({
  datastoreId: properties.DatastoreId,
  status: properties.DatastoreStatus,
  endpoint: properties.DatastoreEndpoint,
  datastoreArn: properties.DatastoreArn,
});
```

The `DatastoreEndpoint` is the base URL for FHIR API traffic after the datastore is active.

### Start and poll a bulk import job

Use HealthLake import jobs when your FHIR data already lives in Amazon S3.

```javascript
import { setTimeout as sleep } from "node:timers/promises";
import {
  DescribeFHIRImportJobCommand,
  HealthLakeClient,
  StartFHIRImportJobCommand,
} from "@aws-sdk/client-healthlake";

const client = new HealthLakeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const datastoreId = process.env.HEALTHLAKE_DATASTORE_ID;
const dataAccessRoleArn = process.env.HEALTHLAKE_DATA_ACCESS_ROLE_ARN;
const inputS3Uri = process.env.HEALTHLAKE_INPUT_S3_URI;
const outputS3Uri = process.env.HEALTHLAKE_OUTPUT_S3_URI;

if (!datastoreId || !dataAccessRoleArn || !inputS3Uri || !outputS3Uri) {
  throw new Error(
    "Set HEALTHLAKE_DATASTORE_ID, HEALTHLAKE_DATA_ACCESS_ROLE_ARN, HEALTHLAKE_INPUT_S3_URI, and HEALTHLAKE_OUTPUT_S3_URI",
  );
}

const started = await client.send(
  new StartFHIRImportJobCommand({
    DatastoreId: datastoreId,
    JobName: "initial-import",
    DataAccessRoleArn: dataAccessRoleArn,
    InputDataConfig: {
      S3Uri: inputS3Uri,
    },
    JobOutputDataConfig: {
      S3Configuration: {
        S3Uri: outputS3Uri,
      },
    },
  }),
);

const jobId = started.JobId;

if (!jobId) {
  throw new Error("StartFHIRImportJob did not return a JobId");
}

for (;;) {
  const detail = await client.send(
    new DescribeFHIRImportJobCommand({
      DatastoreId: datastoreId,
      JobId: jobId,
    }),
  );

  const job = detail.ImportJobProperties ?? detail;
  const status = job.JobStatus;

  console.log({ jobId, status, message: job.Message });

  if (status === "COMPLETED") {
    break;
  }

  if (status === "FAILED" || status === "CANCELLED") {
    throw new Error(`Import job ended with status ${status}`);
  }

  await sleep(15000);
}
```

The caller needs permission to start the job, and `DataAccessRoleArn` must grant HealthLake access to the S3 locations used by the job.

### Start and poll a bulk export job

```javascript
import { setTimeout as sleep } from "node:timers/promises";
import {
  DescribeFHIRExportJobCommand,
  HealthLakeClient,
  StartFHIRExportJobCommand,
} from "@aws-sdk/client-healthlake";

const client = new HealthLakeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const datastoreId = process.env.HEALTHLAKE_DATASTORE_ID;
const dataAccessRoleArn = process.env.HEALTHLAKE_DATA_ACCESS_ROLE_ARN;
const outputS3Uri = process.env.HEALTHLAKE_OUTPUT_S3_URI;

if (!datastoreId || !dataAccessRoleArn || !outputS3Uri) {
  throw new Error(
    "Set HEALTHLAKE_DATASTORE_ID, HEALTHLAKE_DATA_ACCESS_ROLE_ARN, and HEALTHLAKE_OUTPUT_S3_URI",
  );
}

const started = await client.send(
  new StartFHIRExportJobCommand({
    DatastoreId: datastoreId,
    JobName: "daily-export",
    DataAccessRoleArn: dataAccessRoleArn,
    OutputDataConfig: {
      S3Configuration: {
        S3Uri: outputS3Uri,
      },
    },
  }),
);

const jobId = started.JobId;

if (!jobId) {
  throw new Error("StartFHIRExportJob did not return a JobId");
}

for (;;) {
  const detail = await client.send(
    new DescribeFHIRExportJobCommand({
      DatastoreId: datastoreId,
      JobId: jobId,
    }),
  );

  const job = detail.ExportJobProperties ?? detail;
  const status = job.JobStatus;

  console.log({ jobId, status, message: job.Message });

  if (status === "COMPLETED") {
    break;
  }

  if (status === "FAILED" || status === "CANCELLED") {
    throw new Error(`Export job ended with status ${status}`);
  }

  await sleep(15000);
}
```

### Delete a datastore

Deletion is also asynchronous. After you call delete, keep polling until the datastore is gone.

```javascript
import { setTimeout as sleep } from "node:timers/promises";
import {
  DeleteFHIRDatastoreCommand,
  DescribeFHIRDatastoreCommand,
  HealthLakeClient,
} from "@aws-sdk/client-healthlake";

const client = new HealthLakeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const datastoreId = process.env.HEALTHLAKE_DATASTORE_ID;

if (!datastoreId) {
  throw new Error("Set HEALTHLAKE_DATASTORE_ID first");
}

await client.send(
  new DeleteFHIRDatastoreCommand({
    DatastoreId: datastoreId,
  }),
);

for (;;) {
  try {
    const described = await client.send(
      new DescribeFHIRDatastoreCommand({
        DatastoreId: datastoreId,
      }),
    );

    const properties = described.DatastoreProperties ?? described;
    console.log(properties.DatastoreStatus);
    await sleep(15000);
  } catch (error) {
    console.log("Datastore no longer available", error);
    break;
  }
}
```

## Important gotchas

- `@aws-sdk/client-healthlake` manages datastores and batch jobs. It does not expose FHIR resource CRUD commands; use the datastore endpoint for FHIR API requests.
- Datastore creation, deletion, imports, and exports are asynchronous. Do not assume the resource is ready immediately after `CreateFHIRDatastoreCommand`, `DeleteFHIRDatastoreCommand`, `StartFHIRImportJobCommand`, or `StartFHIRExportJobCommand`.
- Import and export jobs need `DataAccessRoleArn` in addition to the AWS credentials your application uses to call HealthLake.
- Use S3 URIs such as `s3://bucket/prefix/` for import and export locations. Local file paths are not valid job inputs.
- HealthLake is regional. Use the same region consistently for the client, the datastore, the S3 buckets you reference, and any KMS keys or IAM roles tied to the workflow.
- Wait for `DatastoreStatus` to become `ACTIVE` before using `DatastoreEndpoint`.

## When to reach for other packages

- `@aws-sdk/credential-providers` for explicit `fromIni`, SSO, or assume-role credential loading.
- Other AWS SDK v3 clients such as S3, IAM, or KMS when your HealthLake workflow also provisions storage, IAM roles, or encryption resources.

## Version notes

- This guide targets `@aws-sdk/client-healthlake` version `3.1007.0`.
- Examples use the AWS SDK for JavaScript v3 command pattern: `client.send(new Command(input))`.

## Official sources

- AWS SDK for JavaScript v3 HealthLake client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/healthlake/`
- Amazon HealthLake API Reference: `https://docs.aws.amazon.com/healthlake/latest/APIReference/Welcome.html`
- `CreateFHIRDatastore`: `https://docs.aws.amazon.com/healthlake/latest/APIReference/API_CreateFHIRDatastore.html`
- `DescribeFHIRDatastore`: `https://docs.aws.amazon.com/healthlake/latest/APIReference/API_DescribeFHIRDatastore.html`
- `ListFHIRDatastores`: `https://docs.aws.amazon.com/healthlake/latest/APIReference/API_ListFHIRDatastores.html`
- `DeleteFHIRDatastore`: `https://docs.aws.amazon.com/healthlake/latest/APIReference/API_DeleteFHIRDatastore.html`
- `StartFHIRImportJob`: `https://docs.aws.amazon.com/healthlake/latest/APIReference/API_StartFHIRImportJob.html`
- `DescribeFHIRImportJob`: `https://docs.aws.amazon.com/healthlake/latest/APIReference/API_DescribeFHIRImportJob.html`
- `StartFHIRExportJob`: `https://docs.aws.amazon.com/healthlake/latest/APIReference/API_StartFHIRExportJob.html`
- `DescribeFHIRExportJob`: `https://docs.aws.amazon.com/healthlake/latest/APIReference/API_DescribeFHIRExportJob.html`
