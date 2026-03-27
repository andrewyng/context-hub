---
name: entityresolution
description: "AWS SDK for JavaScript v3 Entity Resolution client for schema mappings, matching workflows, match lookups, and job execution."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,entityresolution,javascript,nodejs,identity,matching,glue,s3"
---

# `@aws-sdk/client-entityresolution`

Use this package for Amazon Entity Resolution from JavaScript or TypeScript code. It covers schema mappings, matching workflows, matching jobs, match ID lookups, ID generation, provider integrations, tagging, and related control-plane APIs.

Prefer `EntityResolutionClient` plus explicit command imports for new code.

## Install

```bash
npm install @aws-sdk/client-entityresolution
```

If you want explicit profile, IAM Identity Center, or assume-role credential resolution in application code, install the credential helpers you actually use:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Entity Resolution workflows depend on other AWS resources. For a typical rule-based workflow, have these ready before you call the SDK:

- An AWS region where you will create the schema mapping and workflow.
- A source table ARN for your input data. In common setups this is an AWS Glue table ARN.
- An S3 path for workflow output.
- An IAM role ARN that Entity Resolution can assume for workflow execution.
- Optional: a customer KMS key ARN if you do not want to use the service-managed key for output encryption.

Typical local setup:

```bash
export AWS_REGION="us-east-1"
export AWS_PROFILE="dev"

export CUSTOMER_GLUE_TABLE_ARN="arn:aws:glue:us-east-1:123456789012:table/customerdb/customers"
export ENTITYRESOLUTION_ROLE_ARN="arn:aws:iam::123456789012:role/entityresolution-workflow-role"
export ENTITYRESOLUTION_OUTPUT_S3="s3://my-entityresolution-output/customer-dedup/"
```

Or with direct credentials:

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

In Node.js, the default AWS SDK credential provider chain is usually enough if credentials already come from environment variables, shared AWS config, ECS, EC2 instance metadata, or IAM Identity Center.

## Client Setup

### Minimal Node.js client

```javascript
import { EntityResolutionClient } from "@aws-sdk/client-entityresolution";

const entityResolution = new EntityResolutionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit profile-based credentials

```javascript
import { EntityResolutionClient } from "@aws-sdk/client-entityresolution";
import { fromIni } from "@aws-sdk/credential-providers";

const entityResolution = new EntityResolutionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "dev" }),
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  EntityResolutionClient,
  ListMatchingWorkflowsCommand,
} from "@aws-sdk/client-entityresolution";

const entityResolution = new EntityResolutionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await entityResolution.send(
  new ListMatchingWorkflowsCommand({
    maxResults: 25,
  }),
);

for (const workflow of response.workflowSummaries ?? []) {
  console.log(workflow.workflowName, workflow.resolutionType);
}
```

## Common Workflows

### Create a schema mapping

Create the schema mapping before you create a matching workflow. Each mapped input field describes a source column, its attribute type, and whether it participates in matching.

```javascript
import {
  CreateSchemaMappingCommand,
  EntityResolutionClient,
} from "@aws-sdk/client-entityresolution";

const entityResolution = new EntityResolutionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const schema = await entityResolution.send(
  new CreateSchemaMappingCommand({
    schemaName: "customers-v1",
    description: "Customer table for rule-based matching",
    mappedInputFields: [
      {
        fieldName: "first_name",
        type: "NAME_FIRST",
        groupName: "NAME",
        matchKey: "name",
      },
      {
        fieldName: "last_name",
        type: "NAME_LAST",
        groupName: "NAME",
        matchKey: "name",
      },
      {
        fieldName: "email",
        type: "EMAIL_ADDRESS",
        matchKey: "email",
      },
      {
        fieldName: "phone",
        type: "PHONE_NUMBER",
        matchKey: "phone",
      },
      {
        fieldName: "customer_id",
        type: "UNIQUE_ID",
      },
    ],
  }),
);

console.log(schema.schemaArn);
```

Important details from the API model:

- `mappedInputFields` requires at least 2 fields and allows up to 35.
- If you omit `matchKey` for a column, that field is not used for matching, but it can still appear in output.
- Normalization only applies to `NAME`, `ADDRESS`, `PHONE`, and `EMAIL_ADDRESS` groups.
- If your source splits names across `NAME_FIRST`, `NAME_MIDDLE`, and `NAME_LAST`, assign the same `groupName`, such as `NAME`, so Entity Resolution can treat them as one normalized value.

### Read a schema mapping back

```javascript
import {
  EntityResolutionClient,
  GetSchemaMappingCommand,
} from "@aws-sdk/client-entityresolution";

const entityResolution = new EntityResolutionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const schema = await entityResolution.send(
  new GetSchemaMappingCommand({
    schemaName: "customers-v1",
  }),
);

console.log(schema.schemaName);
console.log(schema.mappedInputFields?.map((field) => [field.fieldName, field.type]));
```

### Create a rule-based matching workflow

This is the most direct workflow to automate from application or internal tooling. The workflow points at your input source, writes results to S3, and defines matching rules using the `matchKey` names from the schema mapping.

```javascript
import {
  CreateMatchingWorkflowCommand,
  EntityResolutionClient,
} from "@aws-sdk/client-entityresolution";

const entityResolution = new EntityResolutionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const workflow = await entityResolution.send(
  new CreateMatchingWorkflowCommand({
    workflowName: "customer-dedup-v1",
    description: "Rule-based customer deduplication",
    inputSourceConfig: [
      {
        inputSourceARN: process.env.CUSTOMER_GLUE_TABLE_ARN,
        schemaName: "customers-v1",
        applyNormalization: true,
      },
    ],
    outputSourceConfig: [
      {
        outputS3Path: process.env.ENTITYRESOLUTION_OUTPUT_S3,
        output: [
          { name: "customer_id", hashed: false },
          { name: "first_name", hashed: false },
          { name: "last_name", hashed: false },
          { name: "email", hashed: true },
          { name: "phone", hashed: true },
        ],
        applyNormalization: true,
      },
    ],
    resolutionTechniques: {
      resolutionType: "RULE_MATCHING",
      ruleBasedProperties: {
        rules: [
          {
            ruleName: "email-exact",
            matchingKeys: ["email"],
          },
          {
            ruleName: "name-and-phone",
            matchingKeys: ["name", "phone"],
          },
        ],
        attributeMatchingModel: "MANY_TO_MANY",
        matchPurpose: "IDENTIFIER_GENERATION",
      },
    },
    incrementalRunConfig: {
      incrementalRunType: "IMMEDIATE",
    },
    roleArn: process.env.ENTITYRESOLUTION_ROLE_ARN,
  }),
);

console.log(workflow.workflowArn);
```

Key inputs to understand:

- `inputSourceConfig[].inputSourceARN` is commonly a Glue table ARN.
- `outputSourceConfig[].output[].name` must be an input field name from the schema mapping.
- `matchingKeys` refer to `matchKey` values from the schema mapping, not raw column names unless you used the same strings for both.
- `attributeMatchingModel: "ONE_TO_ONE"` only matches exact sub-type pairs. `"MANY_TO_MANY"` allows matching across sub-types of the same attribute type.
- `matchPurpose: "IDENTIFIER_GENERATION"` generates match IDs and indexes the data. `"INDEXING"` indexes without generating IDs.

### Start a matching job and poll until completion

`StartMatchingJobCommand` returns a job ID. Poll `GetMatchingJobCommand` until the status becomes `SUCCEEDED` or `FAILED`.

```javascript
import {
  EntityResolutionClient,
  GetMatchingJobCommand,
  StartMatchingJobCommand,
} from "@aws-sdk/client-entityresolution";

const entityResolution = new EntityResolutionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const start = await entityResolution.send(
  new StartMatchingJobCommand({
    workflowName: "customer-dedup-v1",
  }),
);

const jobId = start.jobId;

if (!jobId) {
  throw new Error("Entity Resolution did not return a job ID");
}

let status = "QUEUED";

while (status === "QUEUED" || status === "RUNNING") {
  const job = await entityResolution.send(
    new GetMatchingJobCommand({
      workflowName: "customer-dedup-v1",
      jobId,
    }),
  );

  status = job.status ?? "FAILED";

  console.log({
    status,
    metrics: job.metrics,
  });

  if (status === "FAILED") {
    throw new Error(job.errorDetails?.errorMessage ?? "Matching job failed");
  }

  if (status !== "SUCCEEDED") {
    await sleep(5000);
  }
}
```

`GetMatchingJobCommand` returns metrics including input records, total processed records, records not processed, delete records processed, and generated match IDs.

### Look up a single match ID for a rule-based workflow

Use `GetMatchIdCommand` when you want the corresponding match ID for one record against an existing rule-based workflow. The API reference describes this as a dry run of an incremental load.

```javascript
import {
  EntityResolutionClient,
  GetMatchIdCommand,
} from "@aws-sdk/client-entityresolution";

const entityResolution = new EntityResolutionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const result = await entityResolution.send(
  new GetMatchIdCommand({
    workflowName: "customer-dedup-v1",
    record: {
      first_name: "Alice",
      last_name: "Ng",
      email: "alice@example.com",
      phone: "1234567890",
    },
    applyNormalization: true,
  }),
);

console.log(result.matchId, result.matchRule);
```

The `record` map uses your source field names. If you enable `applyNormalization`, Entity Resolution normalizes supported field groups before evaluating the rule-based workflow.

### Generate or retrieve a match ID for one record

Use `GenerateMatchIdCommand` when you want Entity Resolution to process one record against a rule-based workflow and return grouped results directly. The API accepts exactly one record per call and also saves results to S3.

```javascript
import {
  EntityResolutionClient,
  GenerateMatchIdCommand,
} from "@aws-sdk/client-entityresolution";

const entityResolution = new EntityResolutionClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const result = await entityResolution.send(
  new GenerateMatchIdCommand({
    workflowName: "customer-dedup-v1",
    records: [
      {
        inputSourceARN: process.env.CUSTOMER_GLUE_TABLE_ARN,
        uniqueId: "customer-123",
        recordAttributeMap: {
          first_name: "Alice",
          last_name: "Ng",
          email: "alice@example.com",
          phone: "1234567890",
        },
      },
    ],
    processingType: "CONSISTENT",
  }),
);

console.log(result.matchGroups);
console.log(result.failedRecords);
```

`processingType` controls the trade-off between accuracy and speed:

- `CONSISTENT` does immediate lookup and matching against all existing records, with synchronous results. This is the default.
- `EVENTUAL` returns an initial result quickly, then finishes updates asynchronously in the background.
- `EVENTUAL_NO_LOOKUP` generates new match IDs without checking existing matches first. Use it only when you already know the incoming record is unique.

## Common Pitfalls

- Rule-based workflow rules match on `matchKey` values from the schema mapping. If a source field has no `matchKey`, it is not used for matching.
- `applyNormalization` only helps for supported attribute groups. Split name and address fields need the correct shared `groupName` if you want normalized grouping behavior.
- `incrementalRunConfig` only supports `IMMEDIATE`, and incremental processing is not supported for `ML_MATCHING` or `PROVIDER` workflows.
- `GenerateMatchIdCommand` accepts a single record per call. It is not a batch backfill API.
- `StartMatchingJobCommand` starts the workflow run, but you still need to poll `GetMatchingJobCommand` for `QUEUED`, `RUNNING`, `SUCCEEDED`, or `FAILED`.
- If you specify `outputSourceConfig[].output[].name`, those names must already exist in the schema mapping.

## Related Packages

- `@aws-sdk/credential-providers`: explicit profile, IAM Identity Center, and assume-role credential flows.
- `@aws-sdk/client-glue`: inspect or manage the Glue tables you use as input sources.
- `@aws-sdk/client-s3`: manage the buckets and prefixes where matching workflow results are written.

## Version Notes

- This guide targets `@aws-sdk/client-entityresolution` version `3.1007.0`.
- The current Entity Resolution API surface includes schema mappings, matching workflows, matching jobs, ID mapping workflows, ID namespaces, provider services, policy operations, and tagging commands.

## Official Sources

- AWS SDK for JavaScript v3 Entity Resolution client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/entityresolution/`
- Amazon Entity Resolution API Reference: `https://docs.aws.amazon.com/entityresolution/latest/apireference/Welcome.html`
- Amazon Entity Resolution User Guide: `https://docs.aws.amazon.com/entityresolution/latest/userguide/`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- AWS SDK for JavaScript v3 source package: `https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-entityresolution`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-entityresolution`
