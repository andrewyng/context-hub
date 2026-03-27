---
name: neptune
description: "AWS SDK for JavaScript v3 client for inspecting and managing Amazon Neptune DB clusters and DB instances."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,neptune,javascript,nodejs,graph-database,db-cluster,db-instance"
---

# Amazon Neptune SDK for JavaScript (v3)

Use `@aws-sdk/client-neptune` for Amazon Neptune control-plane APIs from JavaScript or TypeScript. Common tasks include listing Neptune clusters and instances, reading status and endpoint metadata, and automating cluster lifecycle operations.

This package manages Neptune infrastructure. It does not execute Gremlin, SPARQL, or openCypher queries against your graph endpoint.

## Golden Rules

- Use `NeptuneClient` plus explicit command imports.
- Set `region` explicitly in code or through standard AWS configuration.
- Treat create, modify, start, stop, reboot, failover, and delete flows as asynchronous operations.
- Re-read cluster or instance state before assuming an endpoint is ready.
- Use a graph protocol client against the Neptune endpoint for application queries.

## Install

```bash
npm install @aws-sdk/client-neptune
```

If you want explicit profile or assume-role helpers in code:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites and AWS Configuration

Neptune is regional. Configure credentials and a region before creating the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional
```

If you use shared AWS profiles locally, this also works with the standard AWS SDK for JavaScript v3 credential chain:

```bash
export AWS_PROFILE="graph-dev"
export AWS_REGION="us-east-1"
```

Your IAM identity needs the Neptune actions required by the calls you make, such as `neptune:DescribeDBClusters` and `neptune:DescribeDBInstances`, plus any create, modify, delete, or tagging permissions used by your automation.

## Client Setup

### Minimal Node.js client

```javascript
import { NeptuneClient } from "@aws-sdk/client-neptune";

const neptune = new NeptuneClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { NeptuneClient } from "@aws-sdk/client-neptune";

const neptune = new NeptuneClient({
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
import { NeptuneClient } from "@aws-sdk/client-neptune";
import { fromIni } from "@aws-sdk/credential-providers";

const neptune = new NeptuneClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "graph-dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if your AWS access already comes from environment variables, shared config, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  DescribeDBClustersCommand,
  NeptuneClient,
} from "@aws-sdk/client-neptune";

const neptune = new NeptuneClient({ region: "us-east-1" });

const response = await neptune.send(
  new DescribeDBClustersCommand({
    MaxRecords: 20,
  }),
);

for (const cluster of response.DBClusters ?? []) {
  console.log({
    id: cluster.DBClusterIdentifier,
    status: cluster.Status,
    endpoint: cluster.Endpoint,
    readerEndpoint: cluster.ReaderEndpoint,
    port: cluster.Port,
  });
}
```

## Common Workflows

### List clusters with pagination

`DescribeDBClustersCommand` uses `MaxRecords` and `Marker` for pagination.

```javascript
import {
  DescribeDBClustersCommand,
  NeptuneClient,
} from "@aws-sdk/client-neptune";

const neptune = new NeptuneClient({ region: "us-east-1" });

let marker;

do {
  const page = await neptune.send(
    new DescribeDBClustersCommand({
      MaxRecords: 100,
      Marker: marker,
    }),
  );

  for (const cluster of page.DBClusters ?? []) {
    console.log(cluster.DBClusterIdentifier, cluster.Status);
  }

  marker = page.Marker;
} while (marker);
```

### Inspect one cluster by identifier

```javascript
import {
  DescribeDBClustersCommand,
  NeptuneClient,
} from "@aws-sdk/client-neptune";

const neptune = new NeptuneClient({ region: "us-east-1" });

const { DBClusters } = await neptune.send(
  new DescribeDBClustersCommand({
    DBClusterIdentifier: "graph-prod-cluster",
  }),
);

const cluster = DBClusters?.[0];

if (!cluster) {
  throw new Error("Cluster not found");
}

console.log({
  id: cluster.DBClusterIdentifier,
  status: cluster.Status,
  endpoint: cluster.Endpoint,
  readerEndpoint: cluster.ReaderEndpoint,
  port: cluster.Port,
});
```

### Poll until a cluster becomes available

After a create, restore, modify, failover, start, or stop operation, read the cluster again until it reaches the state your code expects.

```javascript
import {
  DescribeDBClustersCommand,
  NeptuneClient,
} from "@aws-sdk/client-neptune";

const neptune = new NeptuneClient({ region: "us-east-1" });

async function waitForClusterAvailable(DBClusterIdentifier) {
  for (;;) {
    const { DBClusters } = await neptune.send(
      new DescribeDBClustersCommand({
        DBClusterIdentifier,
      }),
    );

    const cluster = DBClusters?.[0];

    if (!cluster) {
      throw new Error(`Cluster not found: ${DBClusterIdentifier}`);
    }

    console.log(cluster.Status);

    if (cluster.Status === "available") {
      return cluster;
    }

    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
}

const cluster = await waitForClusterAvailable("graph-prod-cluster");
console.log(cluster.Endpoint, cluster.ReaderEndpoint);
```

### List Neptune DB instances

```javascript
import {
  DescribeDBInstancesCommand,
  NeptuneClient,
} from "@aws-sdk/client-neptune";

const neptune = new NeptuneClient({ region: "us-east-1" });

const response = await neptune.send(
  new DescribeDBInstancesCommand({
    MaxRecords: 100,
  }),
);

for (const instance of response.DBInstances ?? []) {
  console.log({
    id: instance.DBInstanceIdentifier,
    cluster: instance.DBClusterIdentifier,
    status: instance.DBInstanceStatus,
    endpoint: instance.Endpoint?.Address,
    port: instance.Endpoint?.Port,
  });
}
```

### Inspect one Neptune DB instance

```javascript
import {
  DescribeDBInstancesCommand,
  NeptuneClient,
} from "@aws-sdk/client-neptune";

const neptune = new NeptuneClient({ region: "us-east-1" });

const { DBInstances } = await neptune.send(
  new DescribeDBInstancesCommand({
    DBInstanceIdentifier: "graph-prod-instance-1",
  }),
);

const instance = DBInstances?.[0];

if (!instance) {
  throw new Error("Instance not found");
}

console.log({
  id: instance.DBInstanceIdentifier,
  status: instance.DBInstanceStatus,
  endpoint: instance.Endpoint?.Address,
  port: instance.Endpoint?.Port,
});
```

## Practical Notes

- `@aws-sdk/client-neptune` is the management client for Neptune resources. Your application query path is separate and uses the cluster endpoint with a graph protocol client.
- Region mismatches often look like missing resources. Keep the client region aligned with the cluster region.
- `DescribeDBClustersCommand` paginates with `Marker` and `MaxRecords`; do not assume one response contains your full fleet.
- Endpoint fields can be absent or incomplete while a cluster or instance is still provisioning, restoring, stopping, starting, or deleting.
- Temporary AWS credentials require `AWS_SESSION_TOKEN` in addition to the access key and secret key.
- Import from the package root only. Do not deep-import internal package files.

## Common Pitfalls

- Expecting this package to execute Gremlin, SPARQL, or openCypher queries.
- Treating a successful control-plane response as proof that the cluster or instance is already ready.
- Forgetting to set `AWS_REGION`, which often turns into resource-not-found or endpoint-resolution errors against the wrong region.
- Reading only cluster inventory when you actually need instance-level state such as `DBInstanceStatus` or instance endpoint details.
- Assuming a single `DescribeDBClustersCommand` call returns every cluster in larger accounts.

## Version Notes

- This guide targets `@aws-sdk/client-neptune` version `3.1007.0`.
- AWS publishes the JavaScript SDK service docs under a rolling `latest` URL. Use the npm package version for dependency pinning and the AWS docs for command names and request shapes.

## Official Sources

- AWS SDK for JavaScript v3 Neptune client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/neptune/`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- AWS SDK for JavaScript v3 region configuration: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html`
- npm package page: `https://www.npmjs.com/package/@aws-sdk/client-neptune`
