---
name: docdb
description: "AWS SDK for JavaScript v3 client for managing Amazon DocumentDB clusters, instances, snapshots, and related control-plane resources."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,documentdb,docdb,javascript,nodejs,mongodb,db-cluster,db-instance"
---

# `@aws-sdk/client-docdb`

Use this package for Amazon DocumentDB with MongoDB compatibility control-plane operations in AWS SDK for JavaScript v3. It manages clusters, instances, snapshots, subnet groups, tagging, failover, start/stop, and related infrastructure settings.

This package does not run database queries against your DocumentDB endpoint. Use a MongoDB-compatible driver against the cluster endpoint for application reads and writes.

## Install

```bash
npm install @aws-sdk/client-docdb
```

If you want explicit profile helpers in application code:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites and AWS Configuration

DocumentDB is regional. Configure credentials and a region before creating the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional
export DOCDB_MASTER_USERNAME="clusteradmin"
export DOCDB_MASTER_PASSWORD="replace-me"
```

If you use a shared AWS profile locally:

```bash
export AWS_PROFILE="docdb-dev"
export AWS_REGION="us-east-1"
```

Your IAM identity needs the DocumentDB actions required by the calls you make, such as `docdb:DescribeDBClusters`, `docdb:CreateDBCluster`, `docdb:CreateDBInstance`, `docdb:ModifyDBCluster`, and `docdb:DeleteDBCluster`.

You also need the VPC networking inputs your cluster will use:

- a security group that allows the traffic you expect
- a DB subnet group if you are not using an existing default or shared network setup
- KMS permissions if you enable encryption with a customer-managed key

## Initialize the Client

### Minimal Node.js client

```javascript
import { DocDBClient } from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { DocDBClient } from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({
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
import { DocDBClient } from "@aws-sdk/client-docdb";
import { fromIni } from "@aws-sdk/credential-providers";

const docdb = new DocDBClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "docdb-dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if AWS access already comes from environment variables, shared config, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  DescribeDBClustersCommand,
  DocDBClient,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

const response = await docdb.send(
  new DescribeDBClustersCommand({
    Filters: [{ Name: "engine", Values: ["docdb"] }],
    MaxRecords: 20,
  }),
);

for (const cluster of response.DBClusters ?? []) {
  console.log({
    id: cluster.DBClusterIdentifier,
    status: cluster.Status,
    engine: cluster.Engine,
    engineVersion: cluster.EngineVersion,
    endpoint: cluster.Endpoint,
    readerEndpoint: cluster.ReaderEndpoint,
    port: cluster.Port,
  });
}
```

`DescribeDBClusters` supports pagination with `Marker` and `MaxRecords`.

## Common Workflows

### List all clusters with the paginator

For fleet inventory, prefer the generated paginator instead of manually looping on `Marker`.

```javascript
import {
  DocDBClient,
  paginateDescribeDBClusters,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

for await (const page of paginateDescribeDBClusters(
  { client: docdb },
  {
    Filters: [{ Name: "engine", Values: ["docdb"] }],
    MaxRecords: 100,
  },
)) {
  for (const cluster of page.DBClusters ?? []) {
    console.log(cluster.DBClusterIdentifier, cluster.Status);
  }
}
```

AWS documents the `engine=docdb` filter for cluster inventory because some management features share underlying operational technology with Amazon RDS and Amazon Neptune.

### Discover supported engine versions and instance classes

Use `DescribeDBEngineVersions` and `DescribeOrderableDBInstanceOptions` before hard-coding an engine version or instance class in automation.

```javascript
import {
  DescribeDBEngineVersionsCommand,
  DescribeOrderableDBInstanceOptionsCommand,
  DocDBClient,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

const versions = await docdb.send(
  new DescribeDBEngineVersionsCommand({
    Engine: "docdb",
    DefaultOnly: true,
  }),
);

const engineVersion = versions.DBEngineVersions?.[0]?.EngineVersion;

const options = await docdb.send(
  new DescribeOrderableDBInstanceOptionsCommand({
    Engine: "docdb",
    EngineVersion: engineVersion,
    Vpc: true,
  }),
);

for (const option of options.OrderableDBInstanceOptions ?? []) {
  console.log(option.DBInstanceClass, option.EngineVersion);
}
```

### Create a cluster

Provisioning normally starts with a cluster, then one or more instances attached to that cluster.

```javascript
import {
  CreateDBClusterCommand,
  DocDBClient,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

await docdb.send(
  new CreateDBClusterCommand({
    DBClusterIdentifier: "orders-prod-cluster",
    Engine: "docdb",
    MasterUsername: process.env.DOCDB_MASTER_USERNAME,
    MasterUserPassword: process.env.DOCDB_MASTER_PASSWORD,
    DBSubnetGroupName: "docdb-private-subnets",
    VpcSecurityGroupIds: ["sg-0123456789abcdef0"],
    BackupRetentionPeriod: 7,
    StorageEncrypted: true,
    DeletionProtection: true,
    Tags: [
      { Key: "Environment", Value: "prod" },
      { Key: "Service", Value: "orders" },
    ],
  }),
);
```

### Add an instance to the cluster

Creating the cluster is not the whole provisioning flow. Add at least one DB instance so the cluster can serve traffic.

```javascript
import {
  CreateDBInstanceCommand,
  DocDBClient,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

await docdb.send(
  new CreateDBInstanceCommand({
    DBInstanceIdentifier: "orders-prod-instance-1",
    DBInstanceClass: "db.r6g.large",
    Engine: "docdb",
    DBClusterIdentifier: "orders-prod-cluster",
    AutoMinorVersionUpgrade: true,
    Tags: [
      { Key: "Environment", Value: "prod" },
      { Key: "Role", Value: "writer-candidate" },
    ],
  }),
);
```

### Wait until the instance is available

The client publishes instance waiters. Use them after create or delete flows when later steps require the instance to have reached a stable state.

```javascript
import {
  DocDBClient,
  waitUntilDBInstanceAvailable,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

await waitUntilDBInstanceAvailable(
  {
    client: docdb,
    maxWaitTime: 1800,
  },
  {
    DBInstanceIdentifier: "orders-prod-instance-1",
  },
);
```

### Poll until the cluster is usable

The generated waiters cover DB instances. For cluster readiness, use a describe loop and wait for the cluster status you need.

```javascript
import {
  DescribeDBClustersCommand,
  DocDBClient,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

async function waitForClusterStatus(DBClusterIdentifier, desiredStatus) {
  for (;;) {
    const { DBClusters } = await docdb.send(
      new DescribeDBClustersCommand({ DBClusterIdentifier }),
    );

    const cluster = DBClusters?.[0];

    if (!cluster) {
      throw new Error(`Cluster not found: ${DBClusterIdentifier}`);
    }

    console.log(cluster.Status);

    if (cluster.Status === desiredStatus) {
      return cluster;
    }

    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
}

const cluster = await waitForClusterStatus("orders-prod-cluster", "available");

console.log(cluster.Endpoint, cluster.ReaderEndpoint, cluster.Port);
```

### Read cluster endpoints

Use the cluster endpoint for the primary writer path and the reader endpoint for read-scaling scenarios.

```javascript
import {
  DescribeDBClustersCommand,
  DocDBClient,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

const { DBClusters } = await docdb.send(
  new DescribeDBClustersCommand({
    DBClusterIdentifier: "orders-prod-cluster",
  }),
);

const cluster = DBClusters?.[0];

if (!cluster) {
  throw new Error("Cluster not found");
}

console.log({
  writerEndpoint: cluster.Endpoint,
  readerEndpoint: cluster.ReaderEndpoint,
  port: cluster.Port,
  status: cluster.Status,
});
```

### Stop and start a cluster

`StopDBCluster` applies to a running cluster and `StartDBCluster` restarts a stopped cluster.

```javascript
import {
  DocDBClient,
  StartDBClusterCommand,
  StopDBClusterCommand,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

await docdb.send(
  new StopDBClusterCommand({
    DBClusterIdentifier: "orders-prod-cluster",
  }),
);

await docdb.send(
  new StartDBClusterCommand({
    DBClusterIdentifier: "orders-prod-cluster",
  }),
);
```

### Force a failover

Use this when you want to promote a replica to primary, or when you need to simulate failover behavior in automation tests.

```javascript
import {
  DocDBClient,
  FailoverDBClusterCommand,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

await docdb.send(
  new FailoverDBClusterCommand({
    DBClusterIdentifier: "orders-prod-cluster",
    TargetDBInstanceIdentifier: "orders-prod-instance-2",
  }),
);
```

### Restore a cluster from a snapshot

Snapshot restore creates a new cluster. After the restore, create at least one DB instance in the restored cluster before treating it as ready for traffic.

```javascript
import {
  DocDBClient,
  RestoreDBClusterFromSnapshotCommand,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

await docdb.send(
  new RestoreDBClusterFromSnapshotCommand({
    DBClusterIdentifier: "orders-restore-cluster",
    SnapshotIdentifier: "orders-prod-manual-2026-03-13",
    Engine: "docdb",
    DBSubnetGroupName: "docdb-private-subnets",
    VpcSecurityGroupIds: ["sg-0123456789abcdef0"],
  }),
);
```

### Tag a cluster or instance by ARN

Tagging uses the resource ARN, not the short identifier.

```javascript
import {
  AddTagsToResourceCommand,
  DescribeDBClustersCommand,
  DocDBClient,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

const { DBClusters } = await docdb.send(
  new DescribeDBClustersCommand({
    DBClusterIdentifier: "orders-prod-cluster",
  }),
);

const clusterArn = DBClusters?.[0]?.DBClusterArn;

if (!clusterArn) {
  throw new Error("Cluster ARN not found");
}

await docdb.send(
  new AddTagsToResourceCommand({
    ResourceName: clusterArn,
    Tags: [
      { Key: "Environment", Value: "prod" },
      { Key: "ManagedBy", Value: "automation" },
    ],
  }),
);
```

### Delete an instance and then delete the cluster

Delete flows are explicit. Wait for instance deletion to finish, then delete the cluster and make an intentional final-snapshot choice.

```javascript
import {
  DeleteDBClusterCommand,
  DeleteDBInstanceCommand,
  DocDBClient,
  waitUntilDBInstanceDeleted,
} from "@aws-sdk/client-docdb";

const docdb = new DocDBClient({ region: "us-east-1" });

await docdb.send(
  new DeleteDBInstanceCommand({
    DBInstanceIdentifier: "orders-prod-instance-1",
  }),
);

await waitUntilDBInstanceDeleted(
  {
    client: docdb,
    maxWaitTime: 1800,
  },
  {
    DBInstanceIdentifier: "orders-prod-instance-1",
  },
);

await docdb.send(
  new DeleteDBClusterCommand({
    DBClusterIdentifier: "orders-prod-cluster",
    SkipFinalSnapshot: false,
    FinalDBSnapshotIdentifier: `orders-prod-final-${Date.now()}`,
  }),
);
```

If your workflow intentionally skips the final snapshot, set `SkipFinalSnapshot: true` instead.

## Practical Notes

- `CreateDBCluster` creates the cluster resource, but provisioning usually also requires `CreateDBInstance` before you have a usable writer.
- `DescribeDBClusters` paginates with `Marker` and `MaxRecords`; do not assume one response contains the full inventory.
- AWS documents using `Filters: [{ Name: "engine", Values: ["docdb"] }]` when listing clusters.
- Create, restore, modify, failover, start, stop, and delete flows are asynchronous. Re-read status before assuming the resource is ready.
- Cluster and instance endpoint fields can be absent or incomplete while provisioning, restoring, starting, stopping, or deleting.
- `StopDBCluster` only works when the cluster is in the `available` state.
- Temporary AWS credentials require `AWS_SESSION_TOKEN` in addition to the access key and secret key.
- Import from the package root only. Do not deep-import package internals.

## Common Pitfalls

- Expecting this package to execute MongoDB wire-protocol queries.
- Creating a cluster and then forgetting to create at least one DB instance in it.
- Treating a successful create or restore response as proof that the endpoint is already ready for traffic.
- Forgetting to make an explicit final-snapshot decision when deleting a cluster.
- Reading cluster inventory without handling pagination.
- Using the wrong region and then debugging the result as if the resource were missing.

## Version Notes

- This guide targets `@aws-sdk/client-docdb` version `3.1007.0`.
- AWS publishes the JavaScript SDK service docs under a rolling `latest` URL. Use the npm package version for dependency pinning and the AWS docs for command names and request shapes.

## Official Sources

- AWS SDK for JavaScript v3 DocDB client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/docdb/`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- AWS SDK for JavaScript v3 region configuration: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html`
- Amazon DocumentDB stop/start guide: `https://docs.aws.amazon.com/documentdb/latest/developerguide/db-cluster-stop-start.html`
- AWS SDK for JavaScript v3 DocDB client source: `https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-docdb`
- npm package page: `https://www.npmjs.com/package/@aws-sdk/client-docdb`
