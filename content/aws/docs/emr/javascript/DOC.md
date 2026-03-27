---
name: emr
description: "AWS SDK for JavaScript v3 client for creating, inspecting, updating, and terminating Amazon EMR clusters and steps"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,emr,javascript,nodejs,spark,hadoop,clusters"
---

# AWS EMR SDK for JavaScript (v3)

Use `@aws-sdk/client-emr` to manage classic Amazon EMR clusters and steps from JavaScript or TypeScript.

This package is the EMR control-plane client. Use it to create clusters, inspect cluster state, add steps, and terminate clusters. It does not run Spark code locally, upload your application artifacts, or replace the tooling you use inside the cluster.

## Golden Rules

- Install `@aws-sdk/client-emr`, not the legacy `aws-sdk` v2 package.
- Prefer `EMRClient` plus individual command imports.
- Set `region` explicitly in code or through standard AWS configuration.
- `RunJobFlowCommand` accepts cluster creation; it does not wait for the cluster to become ready.
- If you want to attach steps later, set `KeepJobFlowAliveWhenNoSteps: true` when you create the cluster.
- Cluster creation depends on existing IAM roles, instance profile, subnet or networking configuration, release label, and instance sizing.

## Install

```bash
npm install @aws-sdk/client-emr
```

Common companion package:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Configure AWS credentials and a region before creating the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional
```

If you use shared AWS profiles locally, `AWS_PROFILE` also works with the standard AWS SDK for JavaScript v3 credential chain.

For cluster creation, make sure you already have:

- an EMR service role such as `EMR_DefaultRole_V2` or your own replacement
- an EC2 instance profile for cluster nodes such as `EMR_EC2_DefaultRole` or your own replacement
- a subnet and instance types that are valid in the target region
- an S3 location for logs and job artifacts if your workflow depends on them

## Client Setup

### Minimal Node.js client

```javascript
import { EMRClient } from "@aws-sdk/client-emr";

const emr = new EMRClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { EMRClient } from "@aws-sdk/client-emr";

const emr = new EMRClient({
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
import { EMRClient } from "@aws-sdk/client-emr";
import { fromIni } from "@aws-sdk/credential-providers";

const emr = new EMRClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if credentials already come from environment variables, shared AWS config, ECS task roles, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

Read cluster details with `DescribeClusterCommand`.

```javascript
import {
  DescribeClusterCommand,
  EMRClient,
} from "@aws-sdk/client-emr";

const emr = new EMRClient({ region: "us-east-1" });

const { Cluster } = await emr.send(
  new DescribeClusterCommand({
    ClusterId: "j-2AXXXXXXGAPLF",
  }),
);

if (!Cluster) {
  throw new Error("Cluster not found");
}

console.log({
  id: Cluster.Id,
  name: Cluster.Name,
  state: Cluster.Status?.State,
  releaseLabel: Cluster.ReleaseLabel,
  logUri: Cluster.LogUri,
});
```

## Common Workflows

### List active clusters with pagination

```javascript
import {
  EMRClient,
  paginateListClusters,
} from "@aws-sdk/client-emr";

const emr = new EMRClient({ region: "us-east-1" });

for await (const page of paginateListClusters(
  { client: emr },
  {
    ClusterStates: ["STARTING", "BOOTSTRAPPING", "RUNNING", "WAITING"],
  },
)) {
  for (const cluster of page.Clusters ?? []) {
    console.log(cluster.Id, cluster.Name, cluster.Status?.State);
  }
}
```

Use `ClusterStates` to limit the results you page through. That is usually better than listing every terminated cluster in the account and filtering later.

### Create a cluster

`RunJobFlowCommand` starts cluster creation. A successful response means EMR accepted the request, not that the cluster is ready for steps yet.

```javascript
import {
  EMRClient,
  RunJobFlowCommand,
} from "@aws-sdk/client-emr";

const emr = new EMRClient({ region: "us-east-1" });

const { JobFlowId } = await emr.send(
  new RunJobFlowCommand({
    Name: "analytics-dev",
    ReleaseLabel: "emr-7.0.0",
    LogUri: "s3://my-emr-logs/",
    ServiceRole: "EMR_DefaultRole_V2",
    JobFlowRole: "EMR_EC2_DefaultRole",
    Instances: {
      Ec2SubnetId: "subnet-0123456789abcdef0",
      KeepJobFlowAliveWhenNoSteps: true,
      InstanceGroups: [
        {
          Name: "Primary",
          InstanceRole: "MASTER",
          InstanceType: "m5.xlarge",
          InstanceCount: 1,
          Market: "ON_DEMAND",
        },
        {
          Name: "Core",
          InstanceRole: "CORE",
          InstanceType: "m5.xlarge",
          InstanceCount: 2,
          Market: "ON_DEMAND",
        },
      ],
    },
    Applications: [{ Name: "Spark" }],
    VisibleToAllUsers: true,
  }),
);

console.log(JobFlowId);
```

Replace the role names, subnet ID, log bucket, release label, and instance types with values that exist in your account and region.

### Poll cluster state until it is usable

For step-based workflows, a common target state is `WAITING`. Some automation may also treat `RUNNING` as ready depending on how the cluster was created.

```javascript
import {
  DescribeClusterCommand,
  EMRClient,
} from "@aws-sdk/client-emr";

const emr = new EMRClient({ region: "us-east-1" });

async function waitForCluster(clusterId) {
  for (;;) {
    const { Cluster } = await emr.send(
      new DescribeClusterCommand({
        ClusterId: clusterId,
      }),
    );

    const state = Cluster?.Status?.State;
    console.log(state);

    if (state === "WAITING" || state === "RUNNING") {
      return Cluster;
    }

    if (state === "TERMINATED" || state === "TERMINATED_WITH_ERRORS") {
      throw new Error(`Cluster failed with state ${state}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
}
```

### Add a Spark step to an existing cluster

Use `AddJobFlowStepsCommand` to submit work to a cluster that is already running.

```javascript
import {
  AddJobFlowStepsCommand,
  EMRClient,
} from "@aws-sdk/client-emr";

const emr = new EMRClient({ region: "us-east-1" });

const { StepIds } = await emr.send(
  new AddJobFlowStepsCommand({
    JobFlowId: "j-2AXXXXXXGAPLF",
    Steps: [
      {
        Name: "daily-spark-job",
        ActionOnFailure: "CANCEL_AND_WAIT",
        HadoopJarStep: {
          Jar: "command-runner.jar",
          Args: [
            "spark-submit",
            "s3://my-emr-jobs/jobs/daily-etl.py",
            "--input",
            "s3://my-data/input/2026-03-13/",
            "--output",
            "s3://my-data/output/2026-03-13/",
          ],
        },
      },
    ],
  }),
);

console.log(StepIds?.[0]);
```

The SDK sends the step definition to EMR. It does not upload your script, dependencies, or data. Store those in S3 or another location your cluster can already access.

### Poll a step until completion

```javascript
import {
  DescribeStepCommand,
  EMRClient,
} from "@aws-sdk/client-emr";

const emr = new EMRClient({ region: "us-east-1" });

async function waitForStep(clusterId, stepId) {
  for (;;) {
    const { Step } = await emr.send(
      new DescribeStepCommand({
        ClusterId: clusterId,
        StepId: stepId,
      }),
    );

    const state = Step?.Status?.State;
    console.log(state);

    if (state === "COMPLETED") {
      return Step;
    }

    if (
      state === "CANCELLED" ||
      state === "FAILED" ||
      state === "INTERRUPTED"
    ) {
      throw new Error(`Step failed with state ${state}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
}
```

### Protect or terminate a cluster

Use termination protection when you want to block accidental shutdown, and remove it before you intentionally delete the cluster.

```javascript
import {
  EMRClient,
  SetTerminationProtectionCommand,
  TerminateJobFlowsCommand,
} from "@aws-sdk/client-emr";

const emr = new EMRClient({ region: "us-east-1" });

await emr.send(
  new SetTerminationProtectionCommand({
    JobFlowIds: ["j-2AXXXXXXGAPLF"],
    TerminationProtected: false,
  }),
);

await emr.send(
  new TerminateJobFlowsCommand({
    JobFlowIds: ["j-2AXXXXXXGAPLF"],
  }),
);
```

`TerminateJobFlowsCommand` starts termination asynchronously. Use `DescribeClusterCommand` if your automation needs to wait until the cluster is actually gone.

## Practical Notes

- This client manages classic EMR clusters and steps. It does not cover every EMR-adjacent service surface.
- The request field names are not fully uniform across operations. Cluster reads use `ClusterId`, step submission uses `JobFlowId`, and termination protection or cluster termination use `JobFlowIds`.
- `JobFlowRole` is the EC2 instance profile for cluster nodes. It is not the same field as `ServiceRole`.
- If you create a cluster with `KeepJobFlowAliveWhenNoSteps: false`, EMR can terminate it after the submitted steps finish, which prevents later `AddJobFlowStepsCommand` calls.
- `ActionOnFailure` controls what EMR does after a step fails. Choose the behavior intentionally for unattended pipelines.
- If you set `LogUri`, the target S3 bucket or prefix must already be writable by the cluster.

## Common Pitfalls

- Treating a successful `RunJobFlowCommand` response as proof that the cluster is ready.
- Reusing example default role names when your account uses custom IAM roles or instance profiles.
- Mixing `ClusterId`, `JobFlowId`, and `JobFlowIds` across commands.
- Adding steps to a cluster that was not configured to stay alive after earlier work completed.
- Assuming the SDK uploads your Spark script or JAR automatically.
- Forgetting that EMR is regional and then looking for clusters in the wrong region.

## Version Notes

- This guide targets `@aws-sdk/client-emr@3.1007.0`.
- The AWS SDK for JavaScript v3 service reference is published under a rolling `latest` URL. Use the npm package version for dependency pinning and the AWS docs for operation names and request shapes.

## Official Sources

- AWS SDK for JavaScript v3 EMR client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/emr/`
- Amazon EMR API Reference: `https://docs.aws.amazon.com/emr/latest/APIReference/Welcome.html`
- Amazon EMR `RunJobFlow` API: `https://docs.aws.amazon.com/emr/latest/APIReference/API_RunJobFlow.html`
- Amazon EMR `AddJobFlowSteps` API: `https://docs.aws.amazon.com/emr/latest/APIReference/API_AddJobFlowSteps.html`
- Amazon EMR `DescribeCluster` API: `https://docs.aws.amazon.com/emr/latest/APIReference/API_DescribeCluster.html`
- Amazon EMR `DescribeStep` API: `https://docs.aws.amazon.com/emr/latest/APIReference/API_DescribeStep.html`
- Amazon EMR `TerminateJobFlows` API: `https://docs.aws.amazon.com/emr/latest/APIReference/API_TerminateJobFlows.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
