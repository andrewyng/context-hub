---
name: route53-recovery-control-config
description: "AWS SDK for JavaScript v3 client for Route 53 Application Recovery Controller configuration APIs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,route53,application-recovery-controller,arc,javascript,nodejs"
---

# `@aws-sdk/client-route53-recovery-control-config`

Use this package for Amazon Route 53 Application Recovery Controller (ARC) configuration APIs in AWS SDK for JavaScript v3. It covers clusters, control panels, routing controls, safety rules, tags, and resource policies.

This is the ARC configuration plane. It does not turn routing controls on or off. Cluster state reads and writes happen through the separate ARC recovery-cluster data plane APIs.

## Install

```bash
npm install @aws-sdk/client-route53-recovery-control-config
```

## Credentials and region

In Node.js, the default AWS credential provider chain is usually enough if credentials are already configured through environment variables, shared AWS config files, IAM roles, or IAM Identity Center.

Typical local setup:

```bash
export AWS_REGION=us-west-2
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...   # only when using temporary credentials
```

Use `us-west-2` explicitly for this client. The service endpoint rules resolve the standard configuration endpoint in the AWS partition to `route53-recovery-control-config.us-west-2.amazonaws.com`.

For browser runtimes, use a browser-safe credential provider. Do not ship long-lived AWS keys to the browser.

## Initialize the client

```javascript
import { Route53RecoveryControlConfigClient } from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

Prefer the command-based client and explicit imports. The package also exposes an aggregated service client, but command imports keep dependencies clearer and bundle size smaller.

## Core usage pattern

```javascript
import {
  ListClustersCommand,
  Route53RecoveryControlConfigClient,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });

const response = await arcConfig.send(
  new ListClustersCommand({ MaxResults: 20 }),
);

for (const cluster of response.Clusters ?? []) {
  console.log(cluster.Name, cluster.ClusterArn, cluster.Status);
}
```

## Common workflows

### Create a cluster

`CreateCluster` returns the cluster ARN plus five regional cluster endpoints. Those endpoints are what you use later with ARC data plane APIs to read or update routing control state.

```javascript
import {
  CreateClusterCommand,
  Route53RecoveryControlConfigClient,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });

const { Cluster } = await arcConfig.send(
  new CreateClusterCommand({
    ClusterName: "payments-prod",
    NetworkType: "IPV4",
    Tags: {
      app: "payments",
      environment: "prod",
    },
  }),
);

console.log(Cluster?.ClusterArn);

for (const endpoint of Cluster?.ClusterEndpoints ?? []) {
  console.log(endpoint.Region, endpoint.Endpoint);
}
```

`NetworkType` supports `IPV4` and `DUALSTACK`.

### Find the default control panel for a cluster

When you create a cluster, ARC also creates a default control panel for it. Fetch the cluster's control panels and look for `DefaultControlPanel`.

```javascript
import {
  ListControlPanelsCommand,
  Route53RecoveryControlConfigClient,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });
const clusterArn = "arn:aws:route53-recovery-control::123456789012:cluster/abc123";

const { ControlPanels } = await arcConfig.send(
  new ListControlPanelsCommand({
    ClusterArn: clusterArn,
    MaxResults: 20,
  }),
);

const defaultPanel = ControlPanels?.find(
  (panel) => panel.DefaultControlPanel,
);

console.log(defaultPanel?.Name, defaultPanel?.ControlPanelArn);
```

If you need an additional panel instead of the default one:

```javascript
import {
  CreateControlPanelCommand,
  Route53RecoveryControlConfigClient,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });

const { ControlPanel } = await arcConfig.send(
  new CreateControlPanelCommand({
    ClusterArn: clusterArn,
    ControlPanelName: "manual-failover",
  }),
);

console.log(ControlPanel?.ControlPanelArn);
```

### Create routing controls

Routing controls belong to a cluster and can optionally be attached to a specific control panel. In practice, pass the `ControlPanelArn` explicitly so the relationship is obvious in code.

```javascript
import {
  CreateRoutingControlCommand,
  Route53RecoveryControlConfigClient,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });

const clusterArn = "arn:aws:route53-recovery-control::123456789012:cluster/abc123";
const controlPanelArn = "arn:aws:route53-recovery-control::123456789012:controlpanel/def456";

const { RoutingControl } = await arcConfig.send(
  new CreateRoutingControlCommand({
    ClusterArn: clusterArn,
    ControlPanelArn: controlPanelArn,
    RoutingControlName: "payments-us-east-1",
  }),
);

console.log(RoutingControl?.RoutingControlArn, RoutingControl?.Status);
```

### Create an assertion safety rule

Safety rules let you guard state changes. Create either an `AssertionRule` or a `GatingRule` in the request body, depending on the behavior you need.

```javascript
import {
  CreateSafetyRuleCommand,
  Route53RecoveryControlConfigClient,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });

const controlPanelArn = "arn:aws:route53-recovery-control::123456789012:controlpanel/def456";
const eastRoutingControlArn = "arn:aws:route53-recovery-control::123456789012:routingcontrol/rc-east";
const westRoutingControlArn = "arn:aws:route53-recovery-control::123456789012:routingcontrol/rc-west";

const response = await arcConfig.send(
  new CreateSafetyRuleCommand({
    AssertionRule: {
      ControlPanelArn: controlPanelArn,
      Name: "keep-one-region-on",
      AssertedControls: [eastRoutingControlArn, westRoutingControlArn],
      RuleConfig: {
        Type: "ATLEAST",
        Threshold: 1,
        Inverted: false,
      },
      WaitPeriodMs: 5000,
    },
  }),
);

console.log(response.AssertionRule?.SafetyRuleArn, response.AssertionRule?.Status);
```

If you need a gating rule instead, pass `GatingRule` with `GatingControls`, `TargetControls`, `RuleConfig`, `WaitPeriodMs`, and `Name`.

### List routing controls and associated Route 53 health checks

```javascript
import {
  ListAssociatedRoute53HealthChecksCommand,
  ListRoutingControlsCommand,
  Route53RecoveryControlConfigClient,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });
const controlPanelArn = "arn:aws:route53-recovery-control::123456789012:controlpanel/def456";

const { RoutingControls } = await arcConfig.send(
  new ListRoutingControlsCommand({
    ControlPanelArn: controlPanelArn,
    MaxResults: 50,
  }),
);

for (const routingControl of RoutingControls ?? []) {
  console.log(routingControl.Name, routingControl.RoutingControlArn);

  const { HealthCheckIds } = await arcConfig.send(
    new ListAssociatedRoute53HealthChecksCommand({
      RoutingControlArn: routingControl.RoutingControlArn,
    }),
  );

  console.log(HealthCheckIds ?? []);
}
```

### Update a safety rule

You can update only the rule name and wait period. If you need to change the controls or rule configuration, delete the safety rule and create a new one.

```javascript
import {
  Route53RecoveryControlConfigClient,
  UpdateSafetyRuleCommand,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });
const safetyRuleArn = "arn:aws:route53-recovery-control::123456789012:safetyrule/ghi789";

const response = await arcConfig.send(
  new UpdateSafetyRuleCommand({
    AssertionRuleUpdate: {
      SafetyRuleArn: safetyRuleArn,
      Name: "keep-one-region-on",
      WaitPeriodMs: 10000,
    },
  }),
);

console.log(response.AssertionRule?.WaitPeriodMs);
```

### Tag a resource and read its tags

Create operations accept tags, and you can also add or inspect tags later.

```javascript
import {
  ListTagsForResourceCommand,
  Route53RecoveryControlConfigClient,
  TagResourceCommand,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });
const resourceArn = "arn:aws:route53-recovery-control::123456789012:cluster/abc123";

await arcConfig.send(
  new TagResourceCommand({
    ResourceArn: resourceArn,
    Tags: {
      owner: "platform",
      environment: "prod",
    },
  }),
);

const { Tags } = await arcConfig.send(
  new ListTagsForResourceCommand({
    ResourceArn: resourceArn,
  }),
);

console.log(Tags);
```

## Manual pagination pattern

The list operations use `NextToken` and `MaxResults`.

```javascript
import {
  ListClustersCommand,
  Route53RecoveryControlConfigClient,
} from "@aws-sdk/client-route53-recovery-control-config";

const arcConfig = new Route53RecoveryControlConfigClient({ region: "us-west-2" });

let nextToken;

do {
  const page = await arcConfig.send(
    new ListClustersCommand({
      MaxResults: 50,
      NextToken: nextToken,
    }),
  );

  for (const cluster of page.Clusters ?? []) {
    console.log(cluster.Name);
  }

  nextToken = page.NextToken;
} while (nextToken);
```

## ARC config gotchas

- This package configures ARC resources. It does not get or update routing control ON/OFF state.
- `CreateCluster` returns five regional cluster endpoints. Keep them if later automation needs the ARC data plane.
- New clusters include a default control panel. You often need to look it up before creating or organizing routing controls.
- `CreateSafetyRule` and `UpdateSafetyRule` work with one rule type at a time: assertion or gating.
- `UpdateSafetyRule` only supports renaming the rule and changing `WaitPeriodMs`.
- Create operations accept an optional `ClientToken` if you want explicit idempotency on retries.
- Expect `ValidationException`, `ResourceNotFoundException`, `ConflictException`, `ThrottlingException`, and `InternalServerException` in real integrations.
- Retry throttling and temporary server errors with backoff instead of treating them as permanent failures.
