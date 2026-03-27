---
name: memorydb
description: "AWS SDK for JavaScript v3 client for Amazon MemoryDB users, ACLs, subnet groups, clusters, snapshots, and related control-plane APIs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,memorydb,javascript,nodejs,redis,cache,acl"
---

# `@aws-sdk/client-memorydb`

Use this package for Amazon MemoryDB control-plane APIs in AWS SDK for JavaScript v3. Typical workflows are: create or inspect users and ACLs, create a subnet group, create or update a cluster, poll until the cluster is usable, and manage snapshots.

This package does not speak the Redis wire protocol. Use it to provision and inspect MemoryDB resources, then pass the returned endpoint into your Redis-compatible application client.

## Install

```bash
npm install @aws-sdk/client-memorydb
```

## Initialize the client

```javascript
import { MemoryDBClient } from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

In Node.js, the default credential provider chain is usually enough if AWS access is already configured through environment variables, shared AWS config files, ECS task roles, EC2 instance metadata, or IAM Identity Center.

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...

export MEMORYDB_SUBNET_GROUP=memorydb-private-subnets
export MEMORYDB_SECURITY_GROUP_ID=sg-0123456789abcdef0
export MEMORYDB_USER_PASSWORD='replace-with-a-strong-password'
```

Set the region deliberately. MemoryDB clusters, subnet groups, snapshots, and security groups are regional resources.

## What this client covers

Use `@aws-sdk/client-memorydb` for:

- users and ACLs
- subnet groups
- cluster create, describe, update, and delete operations
- snapshots and snapshot restores
- tags, service updates, and multi-Region cluster APIs

Do not use this client for:

- `GET`, `SET`, pub/sub, streams, or other Redis data-plane commands
- opening or pooling application connections to the cache

After `DescribeClusters` returns a `ClusterEndpoint`, connect to that endpoint with your Redis-compatible client and enable TLS when the cluster has `TLSEnabled` set.

## Common workflow

For a new cluster, the usual order is:

1. Create or reuse a subnet group in the target VPC.
2. Create a MemoryDB user.
3. Create an ACL that includes that user.
4. Create the cluster with `ACLName`, `SubnetGroupName`, and security groups.
5. Poll `DescribeClusters` until the cluster status is `available`.
6. Read `ClusterEndpoint` and hand it to your Redis-compatible client.

Most create, update, snapshot, and delete operations are asynchronous. A successful API call usually means the request was accepted, not that the resource is ready for the next step.

## Common operations

### Create a subnet group

MemoryDB subnet groups are collections of VPC subnets that MemoryDB can place cluster nodes into.

```javascript
import {
  CreateSubnetGroupCommand,
  MemoryDBClient,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const subnetIds = [
  "subnet-0123456789abcdef0",
  "subnet-abcdef01234567890",
];

const { SubnetGroup } = await memorydb.send(
  new CreateSubnetGroupCommand({
    SubnetGroupName: process.env.MEMORYDB_SUBNET_GROUP ?? "memorydb-private-subnets",
    Description: "Private subnets for MemoryDB clusters",
    SubnetIds: subnetIds,
    Tags: [{ Key: "service", Value: "orders" }],
  }),
);

console.log(SubnetGroup?.Name, SubnetGroup?.VpcId, SubnetGroup?.SupportedNetworkTypes);
```

### Create a user

`CreateUser` requires `UserName`, `AuthenticationMode`, and `AccessString`.

```javascript
import {
  CreateUserCommand,
  MemoryDBClient,
} from "@aws-sdk/client-memorydb";

const password = process.env.MEMORYDB_USER_PASSWORD;

if (!password) {
  throw new Error("Set MEMORYDB_USER_PASSWORD before creating a MemoryDB user.");
}

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const { User } = await memorydb.send(
  new CreateUserCommand({
    UserName: "orders-app-user",
    AuthenticationMode: {
      Type: "password",
      Passwords: [password],
    },
    AccessString: "on ~* +@all",
    Tags: [{ Key: "service", Value: "orders" }],
  }),
);

console.log(User?.Name, User?.Status);
```

If you already manage users outside application code, reuse the existing user name instead of creating one during deploy.

### Create an ACL

Clusters attach to an ACL by name. Keep the required `default` user in the ACL unless you have a specific replacement plan; ACL operations can fail with `DefaultUserRequired` if you remove it.

```javascript
import {
  CreateACLCommand,
  MemoryDBClient,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const { ACL } = await memorydb.send(
  new CreateACLCommand({
    ACLName: "orders-app-acl",
    UserNames: ["default", "orders-app-user"],
    Tags: [{ Key: "service", Value: "orders" }],
  }),
);

console.log(ACL?.Name, ACL?.Status, ACL?.UserNames);
```

To add or remove users later, use `UpdateACLCommand`.

```javascript
import {
  MemoryDBClient,
  UpdateACLCommand,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

await memorydb.send(
  new UpdateACLCommand({
    ACLName: "orders-app-acl",
    UserNamesToAdd: ["reporting-user"],
    UserNamesToRemove: ["old-user"],
  }),
);
```

### Create a cluster

`CreateCluster` requires `ClusterName`, `NodeType`, and `ACLName`. In normal VPC deployments you also set `SubnetGroupName` and one or more security groups.

```javascript
import {
  CreateClusterCommand,
  MemoryDBClient,
} from "@aws-sdk/client-memorydb";

const securityGroupId = process.env.MEMORYDB_SECURITY_GROUP_ID;

if (!securityGroupId) {
  throw new Error("Set MEMORYDB_SECURITY_GROUP_ID before creating a cluster.");
}

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const { Cluster } = await memorydb.send(
  new CreateClusterCommand({
    ClusterName: "orders-cache",
    NodeType: process.env.MEMORYDB_NODE_TYPE ?? "db.r6g.large",
    ACLName: "orders-app-acl",
    SubnetGroupName: process.env.MEMORYDB_SUBNET_GROUP ?? "memorydb-private-subnets",
    SecurityGroupIds: [securityGroupId],
    NumShards: 1,
    NumReplicasPerShard: 1,
    Port: 6379,
    TLSEnabled: true,
    AutoMinorVersionUpgrade: true,
    SnapshotRetentionLimit: 7,
    Tags: [{ Key: "service", Value: "orders" }],
  }),
);

console.log(Cluster?.Name, Cluster?.Status, Cluster?.ARN);
```

`CreateCluster` also supports restore-style inputs such as `SnapshotName` and `SnapshotArns` when you want to seed a new cluster from snapshot data.

### Poll until a cluster is available

The current MemoryDB service model includes paginators for `Describe*` operations, but it does not publish waiter definitions. For create, update, restore, or delete flows, poll `DescribeClusters` yourself.

```javascript
import {
  DescribeClustersCommand,
  MemoryDBClient,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForClusterAvailable(clusterName, timeoutMs = 30 * 60 * 1000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { Clusters } = await memorydb.send(
      new DescribeClustersCommand({
        ClusterName: clusterName,
      }),
    );

    const cluster = Clusters?.[0];
    const status = cluster?.Status;

    if (status === "available") {
      return cluster;
    }

    if (status === "deleting") {
      throw new Error(`Cluster ${clusterName} is deleting.`);
    }

    await sleep(30_000);
  }

  throw new Error(`Timed out waiting for cluster ${clusterName} to become available.`);
}

const cluster = await waitForClusterAvailable("orders-cache");

console.log(cluster?.ClusterEndpoint?.Address, cluster?.ClusterEndpoint?.Port);
```

### Read the cluster endpoint and shard details

Set `ShowShardDetails: true` when you need per-shard and per-node endpoint data.

```javascript
import {
  DescribeClustersCommand,
  MemoryDBClient,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const { Clusters } = await memorydb.send(
  new DescribeClustersCommand({
    ClusterName: "orders-cache",
    ShowShardDetails: true,
  }),
);

const cluster = Clusters?.[0];

console.log(cluster?.Status);
console.log(cluster?.ClusterEndpoint?.Address, cluster?.ClusterEndpoint?.Port);

for (const shard of cluster?.Shards ?? []) {
  console.log(shard.Name, shard.Status, shard.Slots);

  for (const node of shard.Nodes ?? []) {
    console.log(node.Name, node.Endpoint?.Address, node.Endpoint?.Port, node.AvailabilityZone);
  }
}
```

### Paginate cluster inventory

The client publishes paginators for cluster, snapshot, subnet-group, ACL, user, engine-version, service-update, and related describe operations.

```javascript
import {
  MemoryDBClient,
  paginateDescribeClusters,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

for await (const page of paginateDescribeClusters(
  { client: memorydb },
  { MaxResults: 50, ShowShardDetails: false },
)) {
  for (const cluster of page.Clusters ?? []) {
    console.log(cluster.Name, cluster.Status, cluster.NodeType);
  }
}
```

### Create and inspect snapshots

```javascript
import {
  CreateSnapshotCommand,
  DescribeSnapshotsCommand,
  MemoryDBClient,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

await memorydb.send(
  new CreateSnapshotCommand({
    ClusterName: "orders-cache",
    SnapshotName: "orders-cache-2026-03-13",
  }),
);

const { Snapshots } = await memorydb.send(
  new DescribeSnapshotsCommand({
    ClusterName: "orders-cache",
    ShowDetail: true,
  }),
);

for (const snapshot of Snapshots ?? []) {
  console.log(snapshot.Name, snapshot.Status, snapshot.Source, snapshot.ARN);
}
```

### Update cluster settings

Use `UpdateCluster` for changes such as snapshot retention, engine version, node type, replica count, shard count, or the attached ACL.

```javascript
import {
  MemoryDBClient,
  UpdateClusterCommand,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

await memorydb.send(
  new UpdateClusterCommand({
    ClusterName: "orders-cache",
    SnapshotRetentionLimit: 14,
    ReplicaConfiguration: {
      ReplicaCount: 2,
    },
    ACLName: "orders-app-acl",
  }),
);
```

If you want to change node type, call `ListAllowedNodeTypeUpdates` first and only pass a `NodeType` value returned by that API.

```javascript
import {
  ListAllowedNodeTypeUpdatesCommand,
  MemoryDBClient,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const { ScaleUpNodeTypes, ScaleDownNodeTypes } = await memorydb.send(
  new ListAllowedNodeTypeUpdatesCommand({
    ClusterName: "orders-cache",
  }),
);

console.log("scale up:", ScaleUpNodeTypes);
console.log("scale down:", ScaleDownNodeTypes);
```

### Delete a cluster with a final snapshot

```javascript
import {
  DeleteClusterCommand,
  MemoryDBClient,
} from "@aws-sdk/client-memorydb";

const memorydb = new MemoryDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

await memorydb.send(
  new DeleteClusterCommand({
    ClusterName: "orders-cache",
    FinalSnapshotName: "orders-cache-final-2026-03-13",
  }),
);
```

If you pass `FinalSnapshotName`, the caller also needs permission to create snapshots. Otherwise `DeleteCluster` can fail with an access denied error.

## Important gotchas

- This is a control-plane package. Use a Redis-compatible client for actual cache reads and writes.
- `CreateCluster` requires `ACLName`. In normal VPC deployments you also need a subnet group and security groups ready first.
- `DescribeClusters` only returns shard and node detail when `ShowShardDetails` is true.
- MemoryDB mutations are asynchronous. Poll `DescribeClusters` or `DescribeSnapshots` until a terminal state instead of assuming the resource is ready immediately.
- The current service model publishes paginators for many `Describe*` APIs, but not waiter definitions.
- `DeleteCluster` with `FinalSnapshotName` needs snapshot creation permission in addition to delete permission.
- `UpdateCluster` can change replica count, shard count, node type, engine version, snapshot settings, and ACL association, but node type changes must use values returned by `ListAllowedNodeTypeUpdates`.
- Data tiering is only supported on `r6gd` node types. If you use those nodes, set `DataTiering` explicitly.

## Version notes

- This guide targets `@aws-sdk/client-memorydb` version `3.1007.0`.
- The current MemoryDB service model includes multi-Region cluster operations such as `CreateMultiRegionCluster`, `DescribeMultiRegionClusters`, and `UpdateMultiRegionCluster`.
- The current service model also includes paginators for `DescribeACLs`, `DescribeClusters`, `DescribeEngineVersions`, `DescribeEvents`, `DescribeMultiRegionClusters`, `DescribeParameterGroups`, `DescribeParameters`, `DescribeReservedNodes`, `DescribeReservedNodesOfferings`, `DescribeServiceUpdates`, `DescribeSnapshots`, `DescribeSubnetGroups`, and `DescribeUsers`.

## Official sources

- AWS SDK for JavaScript v3 MemoryDB client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/memorydb/`
- Amazon MemoryDB API Reference: `https://docs.aws.amazon.com/memorydb/latest/APIReference/Welcome.html`
- `CreateCluster` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_CreateCluster.html`
- `DescribeClusters` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_DescribeClusters.html`
- `CreateSubnetGroup` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_CreateSubnetGroup.html`
- `CreateUser` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_CreateUser.html`
- `CreateACL` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_CreateACL.html`
- `UpdateACL` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_UpdateACL.html`
- `CreateSnapshot` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_CreateSnapshot.html`
- `DescribeSnapshots` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_DescribeSnapshots.html`
- `UpdateCluster` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_UpdateCluster.html`
- `DeleteCluster` API: `https://docs.aws.amazon.com/memorydb/latest/APIReference/API_DeleteCluster.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- AWS SDK for JavaScript v3 region configuration: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html`
