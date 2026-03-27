---
name: application-auto-scaling
description: "AWS Application Auto Scaling SDK for JavaScript v3 guide for registering scalable targets, attaching scaling policies, and scheduling capacity changes"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,application-auto-scaling,autoscaling,ecs,dynamodb,javascript,nodejs"
---

# AWS Application Auto Scaling SDK for JavaScript v3 Guide

## Golden Rule

Use `@aws-sdk/client-application-auto-scaling` when you need to scale an AWS service that integrates with **Application Auto Scaling** rather than EC2 Auto Scaling groups.

Common examples include:

- ECS service desired count
- DynamoDB read or write capacity
- Aurora read replica count
- Lambda provisioned concurrency
- SageMaker production variant capacity

Do **not** use this package for EC2 Auto Scaling groups. That uses `@aws-sdk/client-auto-scaling` instead.

## Install

```bash
npm install @aws-sdk/client-application-auto-scaling
```

Common companion packages:

```bash
npm install @aws-sdk/credential-providers @aws-sdk/client-ecs
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

Application Auto Scaling is regional. Use the same region for the scalable resource and the Application Auto Scaling client.

## Initialize The Client

```javascript
import { ApplicationAutoScalingClient } from "@aws-sdk/client-application-auto-scaling";

export const applicationAutoScaling = new ApplicationAutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

For most server-side applications, one shared client instance per region is enough.

## Core Usage

### Register A Scalable Target

Before you add a scaling policy, register the resource and its scalable dimension with `RegisterScalableTargetCommand`.

This example registers an ECS service so Application Auto Scaling can adjust its task count:

```javascript
import {
  ApplicationAutoScalingClient,
  RegisterScalableTargetCommand,
} from "@aws-sdk/client-application-auto-scaling";

const applicationAutoScaling = new ApplicationAutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await applicationAutoScaling.send(
  new RegisterScalableTargetCommand({
    ServiceNamespace: "ecs",
    ResourceId: "service/default/web-api",
    ScalableDimension: "ecs:service:DesiredCount",
    MinCapacity: 2,
    MaxCapacity: 10,
  }),
);
```

For ECS, the `ResourceId` format is `service/<cluster-name>/<service-name>`.

### Add A Target Tracking Scaling Policy

Use `PutScalingPolicyCommand` with `PolicyType: "TargetTrackingScaling"` when you want AWS to adjust capacity toward a target metric.

```javascript
import {
  ApplicationAutoScalingClient,
  PutScalingPolicyCommand,
} from "@aws-sdk/client-application-auto-scaling";

const applicationAutoScaling = new ApplicationAutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await applicationAutoScaling.send(
  new PutScalingPolicyCommand({
    PolicyName: "web-api-cpu-target-50",
    PolicyType: "TargetTrackingScaling",
    ServiceNamespace: "ecs",
    ResourceId: "service/default/web-api",
    ScalableDimension: "ecs:service:DesiredCount",
    TargetTrackingScalingPolicyConfiguration: {
      PredefinedMetricSpecification: {
        PredefinedMetricType: "ECSServiceAverageCPUUtilization",
      },
      TargetValue: 50,
      ScaleInCooldown: 60,
      ScaleOutCooldown: 60,
    },
  }),
);

console.log(response.PolicyARN);
```

For ECS service target tracking, predefined metrics such as `ECSServiceAverageCPUUtilization` let you attach a policy without creating CloudWatch alarms yourself.

### List Registered Targets

Use `DescribeScalableTargetsCommand` to confirm the resource, dimension, and capacity bounds that are currently registered.

```javascript
import {
  ApplicationAutoScalingClient,
  DescribeScalableTargetsCommand,
} from "@aws-sdk/client-application-auto-scaling";

const applicationAutoScaling = new ApplicationAutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await applicationAutoScaling.send(
  new DescribeScalableTargetsCommand({
    ServiceNamespace: "ecs",
    ResourceIds: ["service/default/web-api"],
    ScalableDimension: "ecs:service:DesiredCount",
  }),
);

for (const target of response.ScalableTargets ?? []) {
  console.log({
    resourceId: target.ResourceId,
    dimension: target.ScalableDimension,
    minCapacity: target.MinCapacity,
    maxCapacity: target.MaxCapacity,
    roleArn: target.RoleARN,
  });
}
```

### Inspect Scaling Policies

Use `DescribeScalingPoliciesCommand` when you need to confirm which target tracking or step scaling policies exist for a resource.

```javascript
import {
  ApplicationAutoScalingClient,
  DescribeScalingPoliciesCommand,
} from "@aws-sdk/client-application-auto-scaling";

const applicationAutoScaling = new ApplicationAutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await applicationAutoScaling.send(
  new DescribeScalingPoliciesCommand({
    ServiceNamespace: "ecs",
    ResourceId: "service/default/web-api",
    ScalableDimension: "ecs:service:DesiredCount",
  }),
);

for (const policy of response.ScalingPolicies ?? []) {
  console.log({
    name: policy.PolicyName,
    type: policy.PolicyType,
    arn: policy.PolicyARN,
  });
}
```

### Add A Scheduled Scaling Action

Use `PutScheduledActionCommand` when you want to change capacity bounds on a schedule, such as raising minimum capacity during business hours.

```javascript
import {
  ApplicationAutoScalingClient,
  PutScheduledActionCommand,
} from "@aws-sdk/client-application-auto-scaling";

const applicationAutoScaling = new ApplicationAutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await applicationAutoScaling.send(
  new PutScheduledActionCommand({
    ScheduledActionName: "weekday-business-hours",
    ServiceNamespace: "ecs",
    ResourceId: "service/default/web-api",
    ScalableDimension: "ecs:service:DesiredCount",
    Schedule: "cron(0 13 ? * MON-FRI *)",
    ScalableTargetAction: {
      MinCapacity: 4,
      MaxCapacity: 12,
    },
  }),
);
```

`PutScheduledActionCommand` updates the action if you reuse the same scheduled action name for the same target.

### Inspect Recent Scaling Activity

Use `DescribeScalingActivitiesCommand` when you need to understand why a resource scaled or why a scaling action failed.

```javascript
import {
  ApplicationAutoScalingClient,
  DescribeScalingActivitiesCommand,
} from "@aws-sdk/client-application-auto-scaling";

const applicationAutoScaling = new ApplicationAutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await applicationAutoScaling.send(
  new DescribeScalingActivitiesCommand({
    ServiceNamespace: "ecs",
    ResourceId: "service/default/web-api",
    ScalableDimension: "ecs:service:DesiredCount",
    MaxResults: 20,
  }),
);

for (const activity of response.ScalingActivities ?? []) {
  console.log({
    id: activity.ActivityId,
    statusCode: activity.StatusCode,
    statusMessage: activity.StatusMessage,
    cause: activity.Cause,
    startTime: activity.StartTime,
    endTime: activity.EndTime,
  });
}
```

### Remove A Scaling Policy Or Scalable Target

Delete the policy first, then deregister the scalable target if you no longer want the resource managed by Application Auto Scaling.

```javascript
import {
  ApplicationAutoScalingClient,
  DeleteScalingPolicyCommand,
  DeregisterScalableTargetCommand,
} from "@aws-sdk/client-application-auto-scaling";

const applicationAutoScaling = new ApplicationAutoScalingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await applicationAutoScaling.send(
  new DeleteScalingPolicyCommand({
    PolicyName: "web-api-cpu-target-50",
    ServiceNamespace: "ecs",
    ResourceId: "service/default/web-api",
    ScalableDimension: "ecs:service:DesiredCount",
  }),
);

await applicationAutoScaling.send(
  new DeregisterScalableTargetCommand({
    ServiceNamespace: "ecs",
    ResourceId: "service/default/web-api",
    ScalableDimension: "ecs:service:DesiredCount",
  }),
);
```

## Common Pitfalls

- Do not confuse Application Auto Scaling with EC2 Auto Scaling. `@aws-sdk/client-application-auto-scaling` manages scalable targets for other AWS services, not Auto Scaling groups.
- Do not guess the `ResourceId` or `ScalableDimension` format. They are service-specific and must exactly match the target service integration.
- Register the scalable target before attaching scaling policies or scheduled actions.
- Application Auto Scaling does not create the underlying ECS service, DynamoDB table, Lambda alias, or other resource. It only manages scaling for an existing resource.
- Keep the AWS region consistent across the scalable resource, the Application Auto Scaling client, and any metrics or alarms the policy depends on.
- Do not hardcode AWS credentials in source files. Use environment variables, shared AWS config, or IAM roles.

## Version Scope

- This guide targets `@aws-sdk/client-application-auto-scaling@3.1007.0`.
- Examples use the modular AWS SDK for JavaScript v3 client and explicit command imports.
- The npm package slug is `@aws-sdk/client-application-auto-scaling`, while the runtime client class is `ApplicationAutoScalingClient`.

## Official Sources

- AWS SDK for JavaScript v3 Application Auto Scaling client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/application-auto-scaling/`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- Application Auto Scaling API Reference: `https://docs.aws.amazon.com/autoscaling/application/APIReference/Welcome.html`
- `RegisterScalableTarget` API: `https://docs.aws.amazon.com/autoscaling/application/APIReference/API_RegisterScalableTarget.html`
- `DescribeScalableTargets` API: `https://docs.aws.amazon.com/autoscaling/application/APIReference/API_DescribeScalableTargets.html`
- `PutScalingPolicy` API: `https://docs.aws.amazon.com/autoscaling/application/APIReference/API_PutScalingPolicy.html`
- `DescribeScalingPolicies` API: `https://docs.aws.amazon.com/autoscaling/application/APIReference/API_DescribeScalingPolicies.html`
- `PutScheduledAction` API: `https://docs.aws.amazon.com/autoscaling/application/APIReference/API_PutScheduledAction.html`
- `DescribeScalingActivities` API: `https://docs.aws.amazon.com/autoscaling/application/APIReference/API_DescribeScalingActivities.html`
- `DeleteScalingPolicy` API: `https://docs.aws.amazon.com/autoscaling/application/APIReference/API_DeleteScalingPolicy.html`
- `DeregisterScalableTarget` API: `https://docs.aws.amazon.com/autoscaling/application/APIReference/API_DeregisterScalableTarget.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-application-auto-scaling`
