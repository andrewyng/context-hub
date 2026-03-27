---
name: cleanrooms
description: "AWS SDK for JavaScript v3 client for creating collaborations, joining memberships, configuring tables, inspecting schemas, and running protected queries in AWS Clean Rooms"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,cleanrooms,javascript,nodejs,sql,analytics,collaboration"
---

# AWS Clean Rooms SDK for JavaScript (v3)

Use `@aws-sdk/client-cleanrooms` to manage AWS Clean Rooms collaborations and memberships, register tables for collaboration use, inspect schemas, and start protected SQL queries.

This package is the Clean Rooms control-plane client. It creates and manages Clean Rooms resources in AWS. It does not execute queries locally.

## Golden Rules

- Install `@aws-sdk/client-cleanrooms`, not the legacy `aws-sdk` v2 package.
- Set `region` explicitly or through the standard AWS SDK credential and region chain.
- Most write operations use UUID-style resource identifiers such as `collaborationIdentifier`, `membershipIdentifier`, and `configuredTableIdentifier`, not display names.
- `CreateConfiguredTableAssociationCommand` gives a table an alias inside the collaboration. That alias is the relation name you use with `GetSchemaCommand` and in protected SQL.
- Query execution depends on analysis rules being configured for the shared schema. Check `schemaStatusDetails` and wait for `READY` before assuming a query can run.
- Clean Rooms does not provide modeled waiters for protected queries. Poll `GetProtectedQueryCommand` until the query reaches a terminal status.

## Install

```bash
npm install @aws-sdk/client-cleanrooms
```

If you want to load a named AWS profile directly in code, also install the credential helpers:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Before you create the client, make sure you already have:

- AWS credentials with permission to call Clean Rooms and any related IAM, Glue, Athena, or S3 resources you use
- an AWS region where your Clean Rooms collaboration resources live
- a collaboration invitation or collaboration owner account, depending on whether you are joining or creating a collaboration
- an IAM role for table access when creating configured table associations
- an IAM role for protected query result delivery if you want results written to S3

Typical local environment variables:

```bash
export AWS_REGION="us-east-1"
export AWS_PROFILE="dev"

export PARTNER_ACCOUNT_ID="123456789012"
export COLLABORATION_ID="11111111-2222-3333-4444-555555555555"
export MEMBERSHIP_ID="66666666-7777-8888-9999-000000000000"

export CLEANROOMS_TABLE_ROLE_ARN="arn:aws:iam::123456789012:role/CleanRoomsTableAccessRole"
export CLEANROOMS_RESULTS_ROLE_ARN="arn:aws:iam::123456789012:role/CleanRoomsResultsWriteRole"
export CLEANROOMS_RESULTS_BUCKET="my-cleanrooms-results"
```

## Client Setup

### Minimal client

```javascript
import { CleanRoomsClient } from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Named profile with `fromIni`

```javascript
import { CleanRoomsClient } from "@aws-sdk/client-cleanrooms";
import { fromIni } from "@aws-sdk/credential-providers";

const cleanrooms = new CleanRoomsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if you already use environment variables, shared AWS config, ECS task credentials, or EC2 instance credentials.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  CleanRoomsClient,
  ListCollaborationsCommand,
} from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({ region: "us-east-1" });

const response = await cleanrooms.send(
  new ListCollaborationsCommand({
    memberStatus: "ACTIVE",
    maxResults: 25,
  }),
);

for (const collaboration of response.collaborationList ?? []) {
  console.log(collaboration.id, collaboration.name, collaboration.memberStatus);
}
```

## Common Workflows

### List active memberships with pagination

```javascript
import {
  CleanRoomsClient,
  ListMembershipsCommand,
} from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({ region: "us-east-1" });

let nextToken;

do {
  const page = await cleanrooms.send(
    new ListMembershipsCommand({
      status: "ACTIVE",
      maxResults: 50,
      nextToken,
    }),
  );

  for (const membership of page.membershipSummaries ?? []) {
    console.log(
      membership.id,
      membership.collaborationName,
      membership.status,
      membership.memberAbilities,
    );
  }

  nextToken = page.nextToken;
} while (nextToken);
```

The list operations in Clean Rooms are paginated. Keep following `nextToken` until it is absent.

### Create a collaboration

Use this from the collaboration owner account. The initial `members` list does not include the creator.

```javascript
import {
  CleanRoomsClient,
  CreateCollaborationCommand,
} from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({ region: "us-east-1" });

const { collaboration } = await cleanrooms.send(
  new CreateCollaborationCommand({
    name: "retail-measurement",
    description: "Shared campaign measurement collaboration",
    creatorDisplayName: "Acme Retail",
    creatorMemberAbilities: ["CAN_QUERY", "CAN_RECEIVE_RESULTS"],
    members: [
      {
        accountId: process.env.PARTNER_ACCOUNT_ID,
        displayName: "Contoso Ads",
        memberAbilities: ["CAN_QUERY", "CAN_RECEIVE_RESULTS"],
      },
    ],
    queryLogStatus: "ENABLED",
    tags: {
      project: "retail-measurement",
    },
  }),
);

console.log(collaboration?.id, collaboration?.arn, collaboration?.name);
```

The returned collaboration object includes the collaboration ID and, for the caller, the membership ID and ARN when applicable.

### Join an invited collaboration and set default query result delivery

Use `CreateMembershipCommand` from the invited member account after the collaboration exists.

```javascript
import {
  CleanRoomsClient,
  CreateMembershipCommand,
} from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({ region: "us-east-1" });

const { membership } = await cleanrooms.send(
  new CreateMembershipCommand({
    collaborationIdentifier: process.env.COLLABORATION_ID,
    queryLogStatus: "ENABLED",
    defaultResultConfiguration: {
      outputConfiguration: {
        s3: {
          resultFormat: "CSV",
          bucket: process.env.CLEANROOMS_RESULTS_BUCKET,
          keyPrefix: "protected-queries/",
          singleFileOutput: true,
        },
      },
      roleArn: process.env.CLEANROOMS_RESULTS_ROLE_ARN,
    },
  }),
);

console.log(membership?.id, membership?.status, membership?.collaborationName);
```

When you want query results written to S3, set the membership's default result configuration and result-writing role. That role is separate from the table access role used by configured table associations.

### Create a configured table for a Glue table

The current API can model multiple table reference types. This example uses a Glue table because it is the most common Clean Rooms setup.

```javascript
import {
  CleanRoomsClient,
  CreateConfiguredTableCommand,
} from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({ region: "us-east-1" });

const { configuredTable } = await cleanrooms.send(
  new CreateConfiguredTableCommand({
    name: "orders_configured",
    description: "Order facts shared into the collaboration",
    tableReference: {
      glue: {
        region: process.env.AWS_REGION ?? "us-east-1",
        databaseName: "analytics",
        tableName: "orders",
      },
    },
    allowedColumns: ["customer_id", "order_date", "order_total"],
    analysisMethod: "DIRECT_QUERY",
  }),
);

console.log(configuredTable?.id, configuredTable?.name, configuredTable?.analysisMethod);
```

`analysisMethod` is currently `DIRECT_QUERY` for configured tables.

### Associate the configured table with a membership

The configured table association creates the relation alias used inside the collaboration.

```javascript
import {
  CleanRoomsClient,
  CreateConfiguredTableAssociationCommand,
} from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({ region: "us-east-1" });

const { configuredTableAssociation } = await cleanrooms.send(
  new CreateConfiguredTableAssociationCommand({
    name: "orders_shared",
    description: "Orders available to collaboration members",
    membershipIdentifier: process.env.MEMBERSHIP_ID,
    configuredTableIdentifier: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    roleArn: process.env.CLEANROOMS_TABLE_ROLE_ARN,
  }),
);

console.log(
  configuredTableAssociation?.id,
  configuredTableAssociation?.name,
  configuredTableAssociation?.configuredTableId,
);
```

Use the association `name` such as `orders_shared` as the table name in protected SQL. Clean Rooms returns the association name in lowercase for querying.

### Inspect shared schemas and readiness

Before running SQL, inspect the schema exposed inside the collaboration and make sure the schema status is ready for the analysis rule you expect to use.

```javascript
import {
  CleanRoomsClient,
  GetSchemaCommand,
  ListSchemasCommand,
} from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({ region: "us-east-1" });

const list = await cleanrooms.send(
  new ListSchemasCommand({
    collaborationIdentifier: process.env.COLLABORATION_ID,
    maxResults: 50,
  }),
);

for (const schema of list.schemaSummaries ?? []) {
  console.log(schema.name, schema.type, schema.analysisMethod);
}

const detail = await cleanrooms.send(
  new GetSchemaCommand({
    collaborationIdentifier: process.env.COLLABORATION_ID,
    name: "orders_shared",
  }),
);

console.table(
  (detail.schema?.columns ?? []).map((column) => ({
    name: column.name,
    type: column.type,
  })),
);

for (const status of detail.schema?.schemaStatusDetails ?? []) {
  console.log(status.analysisRuleType, status.analysisType, status.status);
}
```

`schemaStatusDetails.status` is the important readiness signal. A status of `READY` means Clean Rooms considers the schema properly configured for queries of that analysis rule type.

### Start a protected SQL query and poll until it finishes

This example writes results to S3. It assumes the membership already has compatible analysis rules and an S3 result role configured.

```javascript
import {
  CleanRoomsClient,
  GetProtectedQueryCommand,
  StartProtectedQueryCommand,
} from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({ region: "us-east-1" });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const started = await cleanrooms.send(
  new StartProtectedQueryCommand({
    type: "SQL",
    membershipIdentifier: process.env.MEMBERSHIP_ID,
    sqlParameters: {
      queryString: `
        SELECT customer_id, SUM(order_total) AS total_revenue
        FROM orders_shared
        GROUP BY customer_id
      `,
    },
    resultConfiguration: {
      outputConfiguration: {
        s3: {
          resultFormat: "CSV",
          bucket: process.env.CLEANROOMS_RESULTS_BUCKET,
          keyPrefix: "protected-queries/run-001/",
          singleFileOutput: true,
        },
      },
    },
  }),
);

const protectedQueryId = started.protectedQuery?.id;

if (!protectedQueryId) {
  throw new Error("Clean Rooms did not return a protected query ID");
}

async function waitForProtectedQuery(id) {
  for (;;) {
    const { protectedQuery } = await cleanrooms.send(
      new GetProtectedQueryCommand({
        membershipIdentifier: process.env.MEMBERSHIP_ID,
        protectedQueryIdentifier: id,
      }),
    );

    console.log(protectedQuery?.status, protectedQuery?.statistics?.totalDurationInMillis);

    if (protectedQuery?.status === "SUCCESS") {
      return protectedQuery;
    }

    if (protectedQuery?.status === "FAILED" || protectedQuery?.status === "TIMED_OUT") {
      throw new Error(
        protectedQuery?.error?.message ?? `Protected query failed with status ${protectedQuery?.status}`,
      );
    }

    if (protectedQuery?.status === "CANCELLED") {
      throw new Error("Protected query was cancelled");
    }

    await sleep(5000);
  }
}

const finished = await waitForProtectedQuery(protectedQueryId);

console.log(finished.result?.output?.s3?.location);
```

`StartProtectedQueryCommand` currently uses `type: "SQL"`.

### Cancel a running protected query

```javascript
import {
  CleanRoomsClient,
  UpdateProtectedQueryCommand,
} from "@aws-sdk/client-cleanrooms";

const cleanrooms = new CleanRoomsClient({ region: "us-east-1" });

await cleanrooms.send(
  new UpdateProtectedQueryCommand({
    membershipIdentifier: process.env.MEMBERSHIP_ID,
    protectedQueryIdentifier: "ffffffff-1111-2222-3333-444444444444",
    targetStatus: "CANCELLED",
  }),
);
```

For protected queries, the modeled update target status is `CANCELLED`.

## Important Pitfalls

- `CreateConfiguredTableCommand` registers metadata and allowed columns, but protected queries still depend on analysis rules. If `GetSchemaCommand` shows `NOT_READY`, fix the rule configuration before querying.
- `CreateConfiguredTableAssociationCommand` needs a `roleArn` for table access. That role is different from the membership-level `roleArn` used for S3 query results.
- Query results do not appear inline in the `StartProtectedQueryCommand` response. Poll `GetProtectedQueryCommand` and read the result output location from the finished query object.
- `ListSchemasCommand` and `GetSchemaCommand` address schemas by collaboration ID plus relation name, not by configured table ID.
- `DeleteMembershipCommand` only succeeds after resources under that membership are removed. `DeleteCollaborationCommand` can only be called by the collaboration owner.
- Display names are not unique. Persist the IDs and ARNs returned by create calls instead of re-looking up resources by name.

## Useful Commands To Pair With This SDK

If you need to inspect the current API shape from AWS without leaving the terminal, the AWS CLI exposes the same service model:

```bash
aws cleanrooms help
aws cleanrooms create-configured-table --generate-cli-skeleton input
aws cleanrooms start-protected-query --generate-cli-skeleton input
```

These are useful when you need a quick JSON template for less common fields such as analysis templates, distributed outputs, Athena or Snowflake table references, or newer Clean Rooms features that your app wants to adopt.
