---
name: keyspaces
description: "AWS SDK for JavaScript v3 client for Amazon Keyspaces keyspace, table, restore, and type management"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,keyspaces,cassandra,database,nosql"
---

# Amazon Keyspaces SDK for JavaScript

## Golden Rule

Use `@aws-sdk/client-keyspaces` for Amazon Keyspaces control-plane operations such as creating keyspaces, creating tables, updating table settings, restoring tables, and managing user-defined types.

Do not use this package for application reads and writes with CQL. Amazon Keyspaces supports CQL through Cassandra-compatible drivers; this SDK client is for the service API that manages keyspaces and tables.

```bash
npm install @aws-sdk/client-keyspaces
```

If you want to load a named AWS profile explicitly in code:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

- An AWS account with Amazon Keyspaces enabled in the target region.
- IAM permissions for the Keyspaces operations you call.
- AWS credentials and a region available through environment variables, shared config files, or another supported AWS SDK credential source.

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SESSION_TOKEN=your-session-token
AWS_PROFILE=default
KEYSPACES_KEYSPACE=app
KEYSPACES_TABLE=events
```

`AWS_SESSION_TOKEN` is only needed for temporary credentials. `AWS_PROFILE` is only needed if you want to load a named profile from shared AWS config files.

## Create the client

The default setup uses the standard AWS SDK credential chain and the configured region.

```javascript
import "dotenv/config";
import { KeyspacesClient } from "@aws-sdk/client-keyspaces";

export const keyspaces = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to force a shared-config profile in code, pass an explicit credentials provider:

```javascript
import "dotenv/config";
import { fromIni } from "@aws-sdk/credential-providers";
import { KeyspacesClient } from "@aws-sdk/client-keyspaces";

const keyspaces = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "default" }),
});
```

## Create and inspect a keyspace

`CreateKeyspace` is asynchronous. Keyspace names must be unique within a region.

```javascript
import "dotenv/config";
import {
  CreateKeyspaceCommand,
  GetKeyspaceCommand,
  KeyspacesClient,
  ListKeyspacesCommand,
} from "@aws-sdk/client-keyspaces";

const client = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const keyspaceName = process.env.KEYSPACES_KEYSPACE ?? "app";

await client.send(
  new CreateKeyspaceCommand({
    keyspaceName,
    replicationSpecification: {
      replicationStrategy: "SINGLE_REGION",
    },
    tags: [{ key: "env", value: "dev" }],
  }),
);

const details = await client.send(
  new GetKeyspaceCommand({ keyspaceName }),
);

console.log(details.keyspaceName);
console.log(details.resourceArn);
console.log(details.replicationStrategy);

const page = await client.send(
  new ListKeyspacesCommand({ maxResults: 25 }),
);

console.log(page.keyspaces ?? []);
```

For a multi-region keyspace, create it with `replicationStrategy: "MULTI_REGION"` and a `regionList`.

```javascript
await client.send(
  new CreateKeyspaceCommand({
    keyspaceName: "app-global",
    replicationSpecification: {
      replicationStrategy: "MULTI_REGION",
      regionList: ["us-east-1", "us-west-2"],
    },
  }),
);
```

## Create a table and wait for `ACTIVE`

`CreateTable` is asynchronous. After the request is accepted, the table status becomes `CREATING`. Use `GetTable` and wait until the status is `ACTIVE` before treating the table as ready.

```javascript
import "dotenv/config";
import { setTimeout as delay } from "node:timers/promises";
import {
  CreateTableCommand,
  GetTableCommand,
  KeyspacesClient,
} from "@aws-sdk/client-keyspaces";

const client = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function waitForTableActive(keyspaceName, tableName, timeoutMs = 10 * 60_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await client.send(
        new GetTableCommand({ keyspaceName, tableName }),
      );

      if (response.status === "ACTIVE") {
        return response;
      }

      if (
        response.status === "DELETING" ||
        response.status === "DELETED" ||
        response.status === "INACCESSIBLE_ENCRYPTION_CREDENTIALS"
      ) {
        throw new Error(`Unexpected table status: ${response.status}`);
      }
    } catch (error) {
      if (error.name !== "ResourceNotFoundException") {
        throw error;
      }
    }

    await delay(5000);
  }

  throw new Error(`Timed out waiting for ${keyspaceName}.${tableName} to become ACTIVE`);
}

const keyspaceName = process.env.KEYSPACES_KEYSPACE ?? "app";
const tableName = process.env.KEYSPACES_TABLE ?? "events";

await client.send(
  new CreateTableCommand({
    keyspaceName,
    tableName,
    schemaDefinition: {
      allColumns: [
        { name: "tenant_id", type: "text" },
        { name: "event_id", type: "uuid" },
        { name: "created_at", type: "timestamp" },
        { name: "event_type", type: "text" },
        { name: "payload", type: "text" },
      ],
      partitionKeys: [{ name: "tenant_id" }],
      clusteringKeys: [{ name: "event_id", orderBy: "ASC" }],
    },
    capacitySpecification: {
      throughputMode: "PAY_PER_REQUEST",
    },
    pointInTimeRecovery: {
      status: "ENABLED",
    },
    ttl: {
      status: "ENABLED",
    },
    comment: {
      message: "Application event log",
    },
  }),
);

const table = await waitForTableActive(keyspaceName, tableName);
console.log(table.status);
```

`capacitySpecification` supports two modes:

- `PAY_PER_REQUEST` for on-demand throughput.
- `PROVISIONED` for provisioned RCUs and WCUs.

If you use `PROVISIONED`, include `readCapacityUnits` and `writeCapacityUnits`.

## List tables with pagination

`ListTables` uses `nextToken` pagination.

```javascript
import "dotenv/config";
import {
  KeyspacesClient,
  ListTablesCommand,
} from "@aws-sdk/client-keyspaces";

const client = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const keyspaceName = process.env.KEYSPACES_KEYSPACE ?? "app";

let nextToken;

do {
  const page = await client.send(
    new ListTablesCommand({
      keyspaceName,
      maxResults: 25,
      nextToken,
    }),
  );

  for (const table of page.tables ?? []) {
    console.log(`${table.keyspaceName}.${table.tableName}`);
  }

  nextToken = page.nextToken;
} while (nextToken);
```

## Update a table

`UpdateTable` lets you add columns or change one table setting such as capacity mode, auto scaling, encryption, point-in-time recovery, or TTL.

Important: update only one specific table setting per `UpdateTable` request.

Add a new column:

```javascript
import "dotenv/config";
import {
  KeyspacesClient,
  UpdateTableCommand,
} from "@aws-sdk/client-keyspaces";

const client = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new UpdateTableCommand({
    keyspaceName: process.env.KEYSPACES_KEYSPACE ?? "app",
    tableName: process.env.KEYSPACES_TABLE ?? "events",
    addColumns: [{ name: "source", type: "text" }],
  }),
);
```

Enable point-in-time recovery in a separate request:

```javascript
await client.send(
  new UpdateTableCommand({
    keyspaceName: process.env.KEYSPACES_KEYSPACE ?? "app",
    tableName: process.env.KEYSPACES_TABLE ?? "events",
    pointInTimeRecovery: {
      status: "ENABLED",
    },
  }),
);
```

Switch to provisioned throughput in a separate request:

```javascript
await client.send(
  new UpdateTableCommand({
    keyspaceName: process.env.KEYSPACES_KEYSPACE ?? "app",
    tableName: process.env.KEYSPACES_TABLE ?? "events",
    capacitySpecification: {
      throughputMode: "PROVISIONED",
      readCapacityUnits: 200,
      writeCapacityUnits: 100,
    },
  }),
);
```

If you use provisioned throughput with auto scaling, inspect the current settings with `GetTableAutoScalingSettings`.

```javascript
import {
  GetTableAutoScalingSettingsCommand,
  KeyspacesClient,
} from "@aws-sdk/client-keyspaces";

const client = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new GetTableAutoScalingSettingsCommand({
    keyspaceName: process.env.KEYSPACES_KEYSPACE ?? "app",
    tableName: process.env.KEYSPACES_TABLE ?? "events",
  }),
);

console.log(response);
```

## Restore a table from point-in-time recovery

`RestoreTable` restores a source table to a new table. It does not overwrite the original table.

```javascript
import "dotenv/config";
import {
  KeyspacesClient,
  RestoreTableCommand,
} from "@aws-sdk/client-keyspaces";

const client = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new RestoreTableCommand({
    sourceKeyspaceName: "app",
    sourceTableName: "events",
    targetKeyspaceName: "app",
    targetTableName: "events_restored",
    restoreTimestamp: new Date("2026-03-13T12:00:00Z"),
  }),
);
```

What restore keeps and changes:

- The restored table is created as a new table.
- Schema, data, and TTL state are restored based on the selected timestamp.
- Capacity mode, auto scaling, encryption, and PITR settings are restored from the source table's current settings unless you override them in the restore request.
- IAM policies and CloudWatch metrics or alarms are not restored.
- Amazon Keyspaces allows up to 4 concurrent restores per account.

## Add a region to a keyspace

Use `UpdateKeyspace` to add a region to a single-region or multi-region keyspace. When you add a region, Amazon Keyspaces replicates all tables in that keyspace to the new region.

To replicate tables successfully, they must use client-side timestamps for conflict resolution.

```javascript
import "dotenv/config";
import {
  KeyspacesClient,
  UpdateKeyspaceCommand,
} from "@aws-sdk/client-keyspaces";

const client = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new UpdateKeyspaceCommand({
    keyspaceName: "app-global",
    replicationSpecification: {
      replicationStrategy: "MULTI_REGION",
      regionList: ["us-east-1", "us-west-2"],
    },
    clientSideTimestamps: {
      status: "ENABLED",
    },
  }),
);
```

## Create a user-defined type

If your schema uses Cassandra user-defined types, create them with `CreateType`.

```javascript
import "dotenv/config";
import {
  CreateTypeCommand,
  KeyspacesClient,
} from "@aws-sdk/client-keyspaces";

const client = new KeyspacesClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new CreateTypeCommand({
    keyspaceName: process.env.KEYSPACES_KEYSPACE ?? "app",
    typeName: "address",
    fieldDefinitions: [
      { name: "street", type: "text" },
      { name: "postal_code", type: "text" },
    ],
  }),
);
```

Field definitions can use supported Cassandra data types, including collections and user-defined types in the same keyspace.

## Pitfalls and version-sensitive behavior

- This package manages Amazon Keyspaces resources; it does not execute CQL application queries.
- `CreateKeyspace` and `CreateTable` are asynchronous. Retry `GetKeyspace` after creating a keyspace, and only treat a table as ready when `GetTable` returns `status: "ACTIVE"`.
- `ListKeyspaces`, `ListTables`, `ListTypes`, and `ListTagsForResource` paginate with `nextToken`.
- `UpdateTable` can add columns or update one table setting per request; split unrelated changes into separate calls.
- `RestoreTable` always creates a new table and does not restore IAM policies or CloudWatch alarms.
- If you add a region with `UpdateKeyspace`, make sure replicated tables use client-side timestamps.
