---
name: auto-scaling
description: "Amazon EC2 Auto Scaling SDK for JavaScript v3 guide for inspecting groups, updating capacity, and managing scaling policies"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,auto-scaling,ec2,javascript,nodejs,scaling,autoscaling"
---

# Amazon EC2 Auto Scaling SDK for JavaScript v3 Guide

## Golden Rule

Use `@aws-sdk/client-auto-scaling` for **EC2 Auto Scaling group** management in JavaScript: listing groups, changing desired capacity, updating group settings, attaching target groups, creating scaling policies, and starting instance refreshes.

Do **not** use this package for other AWS scaling systems:

- Use `@aws-sdk/client-application-auto-scaling` for services such as ECS, DynamoDB, Aurora, Lambda provisioned concurrency, and SageMaker variants that integrate with Application Auto Scaling.
- Use `@aws-sdk/client-ec2` to create or update launch templates and inspect the underlying instances.
- Use `@aws-sdk/client-elastic-load-balancing-v2` to create target groups and load balancers before attaching them to an Auto Scaling group.

## Install

```bash
npm install @aws-sdk/client-auto-scaling
```

Common companion packages:

```bash
npm install @aws-sdk/client-ec2 @aws-sdk/client-elastic-load-balancing-v2 @aws-sdk/credential-providers
```

Examples in this guide use ESM imports and the AWS SDK v3 command pattern: `client.send(new Command(input))`.

## Credentials And Region

The client uses the standard AWS SDK for JavaScript v3 credential provider chain. For local development, set a region and either a profile or direct credentials.

Preferred local setup:

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=dev
```

Direct environment credentials also work:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
```

EC2 Auto Scaling is regional. Use the same region for the Auto Scaling group, launch template, subnets, and any attached target groups.

## Initialize The Client

```javascript
import { AutoScalingClient } from "@aws-sdk/client-auto-scaling";

export const autoScaling = new AutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

For most server-side applications, one shared client instance per region is enough.

## Core Usage

### List And Inspect Auto Scaling Groups

`DescribeAutoScalingGroupsCommand` is the quickest way to confirm that the account and region contain the groups your application expects.

```javascript
import {
  AutoScalingClient,
  DescribeAutoScalingGroupsCommand,
} from "@aws-sdk/client-auto-scaling";

const autoScaling = new AutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken;

do {
  const page = await autoScaling.send(
    new DescribeAutoScalingGroupsCommand({
      MaxRecords: 20,
      NextToken: nextToken,
    }),
  );

  for (const group of page.AutoScalingGroups ?? []) {
    console.log({
      name: group.AutoScalingGroupName,
      minSize: group.MinSize,
      maxSize: group.MaxSize,
      desiredCapacity: group.DesiredCapacity,
      instances: group.Instances?.length ?? 0,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);
```

To inspect one specific group, pass `AutoScalingGroupNames`:

```javascript
const response = await autoScaling.send(
  new DescribeAutoScalingGroupsCommand({
    AutoScalingGroupNames: ["web-prod-asg"],
  }),
);

const group = response.AutoScalingGroups?.[0];
console.log(group?.AutoScalingGroupName, group?.LaunchTemplate, group?.VPCZoneIdentifier);
```

### Change Desired Capacity Immediately

Use `SetDesiredCapacityCommand` when you want to scale the group to a known size now.

```javascript
import {
  AutoScalingClient,
  SetDesiredCapacityCommand,
} from "@aws-sdk/client-auto-scaling";

const autoScaling = new AutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await autoScaling.send(
  new SetDesiredCapacityCommand({
    AutoScalingGroupName: "web-prod-asg",
    DesiredCapacity: 6,
    HonorCooldown: true,
  }),
);
```

Keep `DesiredCapacity` inside the group's `MinSize` and `MaxSize` range.

### Update Group Capacity Limits Or Launch Template Settings

Use `UpdateAutoScalingGroupCommand` to change steady-state settings such as min size, max size, desired capacity, health check grace period, subnets, or launch template reference.

```javascript
import {
  AutoScalingClient,
  UpdateAutoScalingGroupCommand,
} from "@aws-sdk/client-auto-scaling";

const autoScaling = new AutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await autoScaling.send(
  new UpdateAutoScalingGroupCommand({
    AutoScalingGroupName: "web-prod-asg",
    MinSize: 2,
    MaxSize: 10,
    DesiredCapacity: 4,
    HealthCheckType: "EC2",
    HealthCheckGracePeriod: 300,
    LaunchTemplate: {
      LaunchTemplateName: "web-prod-template",
      Version: "$Latest",
    },
  }),
);
```

If you reference a launch template here, that launch template must already exist in EC2.

### Attach Existing Target Groups

Use `AttachLoadBalancerTargetGroupsCommand` after the target groups already exist in Elastic Load Balancing v2.

```javascript
import {
  AttachLoadBalancerTargetGroupsCommand,
  AutoScalingClient,
} from "@aws-sdk/client-auto-scaling";

const autoScaling = new AutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await autoScaling.send(
  new AttachLoadBalancerTargetGroupsCommand({
    AutoScalingGroupName: "web-prod-asg",
    TargetGroupARNs: [
      "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/web-blue/0123456789abcdef",
    ],
  }),
);
```

### Create A Target Tracking Scaling Policy

Use `PutScalingPolicyCommand` with `PolicyType: "TargetTrackingScaling"` when you want Auto Scaling to adjust capacity toward a metric target.

```javascript
import {
  AutoScalingClient,
  PutScalingPolicyCommand,
} from "@aws-sdk/client-auto-scaling";

const autoScaling = new AutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await autoScaling.send(
  new PutScalingPolicyCommand({
    AutoScalingGroupName: "web-prod-asg",
    PolicyName: "cpu-target-50",
    PolicyType: "TargetTrackingScaling",
    EstimatedInstanceWarmup: 300,
    TargetTrackingConfiguration: {
      PredefinedMetricSpecification: {
        PredefinedMetricType: "ASGAverageCPUUtilization",
      },
      TargetValue: 50,
    },
  }),
);

console.log(response.PolicyARN);
```

### Roll Out A New Launch Template Version With Instance Refresh

After updating a group's launch template or mixed instances policy, use `StartInstanceRefreshCommand` to replace instances gradually.

```javascript
import {
  AutoScalingClient,
  DescribeInstanceRefreshesCommand,
  StartInstanceRefreshCommand,
} from "@aws-sdk/client-auto-scaling";

const autoScaling = new AutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const started = await autoScaling.send(
  new StartInstanceRefreshCommand({
    AutoScalingGroupName: "web-prod-asg",
    Strategy: "Rolling",
    Preferences: {
      MinHealthyPercentage: 90,
      InstanceWarmup: 300,
    },
  }),
);

console.log(started.InstanceRefreshId);

const refreshes = await autoScaling.send(
  new DescribeInstanceRefreshesCommand({
    AutoScalingGroupName: "web-prod-asg",
    InstanceRefreshIds: [started.InstanceRefreshId],
  }),
);

for (const refresh of refreshes.InstanceRefreshes ?? []) {
  console.log(
    refresh.InstanceRefreshId,
    refresh.Status,
    refresh.PercentageComplete,
    refresh.StatusReason,
  );
}
```

`StartInstanceRefreshCommand` starts the rollout and returns immediately. Poll `DescribeInstanceRefreshesCommand` if you need completion status.

### Inspect Recent Scaling Activity

Use `DescribeScalingActivitiesCommand` when you need to understand why a scale-out, scale-in, launch, terminate, or refresh step happened.

```javascript
import {
  AutoScalingClient,
  DescribeScalingActivitiesCommand,
} from "@aws-sdk/client-auto-scaling";

const autoScaling = new AutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await autoScaling.send(
  new DescribeScalingActivitiesCommand({
    AutoScalingGroupName: "web-prod-asg",
    MaxRecords: 20,
  }),
);

for (const activity of response.Activities ?? []) {
  console.log({
    id: activity.ActivityId,
    status: activity.StatusCode,
    description: activity.Description,
    cause: activity.Cause,
    startTime: activity.StartTime,
    endTime: activity.EndTime,
  });
}
```

## Common Pitfalls

- Do not confuse EC2 Auto Scaling with Application Auto Scaling. The package names are similar, but they manage different AWS services.
- Do not assume this package creates launch templates, target groups, or load balancers. Those are separate resources managed through other AWS services.
- Do not set `DesiredCapacity` outside the group's `MinSize` and `MaxSize` bounds.
- Do not hardcode AWS credentials in source files. Use environment variables, shared config, or IAM roles.
- Do not expect `StartInstanceRefreshCommand` or scaling policy changes to block until the group becomes steady. Check `DescribeInstanceRefreshesCommand` and `DescribeScalingActivitiesCommand` for progress.
- Do not mix regions across the Auto Scaling group, launch template, and attached target groups.

## Version Scope

- This guide targets `@aws-sdk/client-auto-scaling@3.1007.0`.
- Examples use the modular AWS SDK for JavaScript v3 client and explicit command imports.
- The npm package slug is `@aws-sdk/client-auto-scaling`, while the runtime client class is `AutoScalingClient`.

## Official Sources

- AWS SDK for JavaScript v3 Auto Scaling client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/auto-scaling/`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- Amazon EC2 Auto Scaling API Reference: `https://docs.aws.amazon.com/autoscaling/ec2/APIReference/Welcome.html`
- `DescribeAutoScalingGroups` API: `https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_DescribeAutoScalingGroups.html`
- `SetDesiredCapacity` API: `https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_SetDesiredCapacity.html`
- `UpdateAutoScalingGroup` API: `https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_UpdateAutoScalingGroup.html`
- `PutScalingPolicy` API: `https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_PutScalingPolicy.html`
- `AttachLoadBalancerTargetGroups` API: `https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_AttachLoadBalancerTargetGroups.html`
- `StartInstanceRefresh` API: `https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_StartInstanceRefresh.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-auto-scaling`
