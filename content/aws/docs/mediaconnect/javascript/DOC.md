---
name: mediaconnect
description: "AWS SDK for JavaScript v3 client for listing, inspecting, starting, stopping, and tagging AWS Elemental MediaConnect resources"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,mediaconnect,javascript,nodejs,video,live-streaming,media"
---

# `@aws-sdk/client-mediaconnect`

Use `@aws-sdk/client-mediaconnect` to work with AWS Elemental MediaConnect flows, entitlements, bridges, and gateways from JavaScript or TypeScript. For most application code, the common flow is: create a client for the correct AWS region, identify the target flow by ARN, inspect it with `DescribeFlowCommand`, then start, stop, or tag it with explicit commands.

This package manages MediaConnect resources in AWS. It does not transport video locally or replace the MediaConnect control plane.

## Golden Rules

- Set `region` deliberately. MediaConnect resources are region-scoped.
- Use the exact resource ARN for the operation you are calling. Flow, output, entitlement, and gateway ARNs are different resource types.
- Treat `StartFlowCommand` and `StopFlowCommand` as asynchronous control actions. Poll `DescribeFlowCommand` until the flow reaches the status you need.
- Paginate list operations with `NextToken` when you may have more than one page of results.
- Keep credentials out of source code. Use the default AWS credential provider chain or a shared profile.
- Expect flow creation and update payloads to be much larger than simple lifecycle operations; start from AWS request shapes or console-exported values instead of inventing nested config by hand.

## Install

```bash
npm install @aws-sdk/client-mediaconnect
```

If you want to force a shared AWS profile in code instead of relying on the default provider chain:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-mediaconnect@3.1007.0`.

## Prerequisites And Authentication

MediaConnect requests need AWS credentials and a region. Most operational calls also need a resource ARN, especially a flow ARN.

Typical environment variables for local development:

```bash
export AWS_PROFILE="media"
export AWS_REGION="us-east-1"

export AWS_MEDIACONNECT_FLOW_ARN="arn:aws:mediaconnect:us-east-1:123456789012:flow:1-23aBC45dEF67hiJ8-12AbC34DE5fG:AwardsShow"
export AWS_MEDIACONNECT_RESOURCE_ARN="$AWS_MEDIACONNECT_FLOW_ARN"
```

In Node.js, AWS SDK v3 usually resolves credentials from the default provider chain, including environment variables, shared config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

## Client Setup

### Minimal client

```javascript
import { MediaConnectClient } from "@aws-sdk/client-mediaconnect";

const mediaconnect = new MediaConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Named shared profile with `fromIni`

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { MediaConnectClient } from "@aws-sdk/client-mediaconnect";

const mediaconnect = new MediaConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "media" }),
});
```

## Core Usage Pattern

AWS SDK v3 uses `client.send(new Command(input))`.

```javascript
import {
  ListFlowsCommand,
  MediaConnectClient,
} from "@aws-sdk/client-mediaconnect";

const mediaconnect = new MediaConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await mediaconnect.send(
  new ListFlowsCommand({
    MaxResults: 20,
  }),
);

for (const flow of response.Flows ?? []) {
  console.log(flow.Name, flow.Status, flow.FlowArn);
}
```

## Common Workflows

### List flows with pagination

`ListFlowsCommand` returns summaries and may include `NextToken`.

```javascript
import {
  ListFlowsCommand,
  MediaConnectClient,
} from "@aws-sdk/client-mediaconnect";

const mediaconnect = new MediaConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken;

do {
  const response = await mediaconnect.send(
    new ListFlowsCommand({
      MaxResults: 20,
      NextToken: nextToken,
    }),
  );

  for (const flow of response.Flows ?? []) {
    console.log(`${flow.Name} [${flow.Status}]`);
  }

  nextToken = response.NextToken;
} while (nextToken);
```

### Inspect a flow before changing it

`DescribeFlowCommand` returns the current status plus source, output, and entitlement details for the flow.

```javascript
import {
  DescribeFlowCommand,
  MediaConnectClient,
} from "@aws-sdk/client-mediaconnect";

const flowArn = process.env.AWS_MEDIACONNECT_FLOW_ARN;

if (!flowArn) {
  throw new Error("Set AWS_MEDIACONNECT_FLOW_ARN first.");
}

const mediaconnect = new MediaConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Flow: flow } = await mediaconnect.send(
  new DescribeFlowCommand({
    FlowArn: flowArn,
  }),
);

console.log("name:", flow?.Name);
console.log("status:", flow?.Status);
console.log("source:", flow?.Source?.Name, flow?.Source?.IngestIp, flow?.Source?.IngestPort);

for (const output of flow?.Outputs ?? []) {
  console.log("output:", output.Name, output.OutputArn, output.Destination, output.Port);
}
```

### Start a standby flow and wait for `ACTIVE`

`StartFlowCommand` starts the flow but does not wait for it to become active. Poll `DescribeFlowCommand` until `Flow.Status` is `ACTIVE`.

```javascript
import {
  DescribeFlowCommand,
  MediaConnectClient,
  StartFlowCommand,
} from "@aws-sdk/client-mediaconnect";

const flowArn = process.env.AWS_MEDIACONNECT_FLOW_ARN;

if (!flowArn) {
  throw new Error("Set AWS_MEDIACONNECT_FLOW_ARN first.");
}

const mediaconnect = new MediaConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForFlowStatus(flowArn, expectedStatus, timeoutMs = 10 * 60 * 1000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { Flow: flow } = await mediaconnect.send(
      new DescribeFlowCommand({
        FlowArn: flowArn,
      }),
    );

    const status = flow?.Status;
    console.log("current status:", status);

    if (status === expectedStatus) {
      return flow;
    }

    if (status === "ERROR") {
      throw new Error("Flow entered ERROR state.");
    }

    await delay(15000);
  }

  throw new Error(`Timed out waiting for ${expectedStatus}.`);
}

await mediaconnect.send(
  new StartFlowCommand({
    FlowArn: flowArn,
  }),
);

await waitForFlowStatus(flowArn, "ACTIVE");
```

### Stop a flow and wait for `STANDBY`

```javascript
import {
  DescribeFlowCommand,
  MediaConnectClient,
  StopFlowCommand,
} from "@aws-sdk/client-mediaconnect";

const flowArn = process.env.AWS_MEDIACONNECT_FLOW_ARN;

if (!flowArn) {
  throw new Error("Set AWS_MEDIACONNECT_FLOW_ARN first.");
}

const mediaconnect = new MediaConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForStandby(flowArn, timeoutMs = 10 * 60 * 1000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { Flow: flow } = await mediaconnect.send(
      new DescribeFlowCommand({
        FlowArn: flowArn,
      }),
    );

    const status = flow?.Status;
    console.log("current status:", status);

    if (status === "STANDBY") {
      return flow;
    }

    if (status === "ERROR") {
      throw new Error("Flow entered ERROR state.");
    }

    await delay(15000);
  }

  throw new Error("Timed out waiting for STANDBY.");
}

await mediaconnect.send(
  new StopFlowCommand({
    FlowArn: flowArn,
  }),
);

await waitForStandby(flowArn);
```

### List entitlements granted to your account

Use `ListEntitlementsCommand` when your account consumes sources shared from another AWS account.

```javascript
import {
  ListEntitlementsCommand,
  MediaConnectClient,
} from "@aws-sdk/client-mediaconnect";

const mediaconnect = new MediaConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await mediaconnect.send(
  new ListEntitlementsCommand({
    MaxResults: 20,
  }),
);

for (const entitlement of response.Entitlements ?? []) {
  console.log(entitlement.EntitlementName, entitlement.EntitlementArn);
}
```

### Tag a resource and read the current tags

`TagResourceCommand` applies or updates the specified keys. `ListTagsForResourceCommand` reads the full key/value map back.

```javascript
import {
  ListTagsForResourceCommand,
  MediaConnectClient,
  TagResourceCommand,
} from "@aws-sdk/client-mediaconnect";

const resourceArn = process.env.AWS_MEDIACONNECT_RESOURCE_ARN;

if (!resourceArn) {
  throw new Error("Set AWS_MEDIACONNECT_RESOURCE_ARN first.");
}

const mediaconnect = new MediaConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await mediaconnect.send(
  new TagResourceCommand({
    ResourceArn: resourceArn,
    Tags: {
      stage: "prod",
      team: "media-ops",
    },
  }),
);

const { Tags } = await mediaconnect.send(
  new ListTagsForResourceCommand({
    ResourceArn: resourceArn,
  }),
);

console.log(Tags);
```

## Practical Notes

- Flow lifecycle operations are simple, but resource creation and update calls can have deeply nested request bodies. For `CreateFlow` and `UpdateFlow`, work from the AWS API reference or a known-good console configuration.
- `Flow.Status` transitions asynchronously. `STARTING` and `STOPPING` are normal intermediate states; check again before assuming the stream is ready.
- `ListFlowsCommand` and `ListEntitlementsCommand` are paginated operations. Do not assume one call returns everything in larger accounts.
- The service also exposes bridge and gateway operations in the same client, but many day-to-day automations only need flow, entitlement, and tagging commands.
- Server-side usage is the common case. Browser usage is uncommon because MediaConnect operations usually need broad account permissions and direct access to AWS resources.

## Common Pitfalls

- Pointing the client at the wrong region for the flow ARN you are operating on.
- Passing an entitlement or output ARN to a command that expects a flow ARN.
- Treating a successful `StartFlowCommand` or `StopFlowCommand` call as the final state instead of polling `DescribeFlowCommand`.
- Ignoring `NextToken` and silently missing resources in larger accounts.
- Hardcoding access keys in code instead of using the AWS credential provider chain.
- Building large `CreateFlow` payloads from memory instead of starting from documented request shapes.

## Version Notes For `3.1007.0`

- This guide targets `@aws-sdk/client-mediaconnect@3.1007.0`.
- The AWS SDK for JavaScript v3 service docs are published under a rolling `latest` URL. Use the npm package version for dependency pinning and the AWS docs for operation names and request shapes.
- The examples here focus on operations that are straightforward to wire into scripts and services: listing flows, describing flows, starting and stopping flows, listing entitlements, and managing tags.

## Official Sources

- AWS SDK for JavaScript v3 MediaConnect client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/mediaconnect/`
- AWS Elemental MediaConnect API Reference: `https://docs.aws.amazon.com/mediaconnect/latest/api/`
- MediaConnect `ListFlows` API reference: `https://docs.aws.amazon.com/mediaconnect/latest/api/API_ListFlows.html`
- MediaConnect `DescribeFlow` API reference: `https://docs.aws.amazon.com/mediaconnect/latest/api/API_DescribeFlow.html`
- MediaConnect `StartFlow` API reference: `https://docs.aws.amazon.com/mediaconnect/latest/api/API_StartFlow.html`
- MediaConnect `StopFlow` API reference: `https://docs.aws.amazon.com/mediaconnect/latest/api/API_StopFlow.html`
- MediaConnect `ListEntitlements` API reference: `https://docs.aws.amazon.com/mediaconnect/latest/api/API_ListEntitlements.html`
- MediaConnect `TagResource` API reference: `https://docs.aws.amazon.com/mediaconnect/latest/api/API_TagResource.html`
- MediaConnect `ListTagsForResource` API reference: `https://docs.aws.amazon.com/mediaconnect/latest/api/API_ListTagsForResource.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- AWS SDK for JavaScript v3 region configuration: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html`
