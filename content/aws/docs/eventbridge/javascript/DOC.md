---
name: eventbridge
description: "AWS SDK for JavaScript v3 EventBridge client for publishing events and managing buses, rules, and targets."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,eventbridge,javascript,nodejs,events,event-bus,rules"
---

# `@aws-sdk/client-eventbridge`

Use this package for Amazon EventBridge in AWS SDK for JavaScript v3. It covers two common jobs:

- publish application events to an event bus
- manage EventBridge resources such as event buses, rules, and rule targets

Prefer `EventBridgeClient` plus explicit command imports for new code.

## Install

```bash
npm install @aws-sdk/client-eventbridge
```

If you need non-default credential providers in application code, install the credential helper package you actually use:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

EventBridge is regional. Configure AWS credentials and a region before you create the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

If you use shared AWS profiles locally, `AWS_PROFILE` also works with the standard AWS SDK credential chain.

## Client Setup

### Minimal Node.js client

```javascript
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

In Node.js, the default credential provider chain is usually enough if your AWS access is already configured through environment variables, shared config, ECS, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  DescribeRuleCommand,
  EventBridgeClient,
} from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({ region: "us-east-1" });

const response = await eventbridge.send(
  new DescribeRuleCommand({
    Name: "route-order-created",
    EventBusName: "default",
  }),
);

console.log(response.Name, response.State, response.EventPattern);
```

## Common Workflows

### Publish a custom event

`PutEventsCommand` sends one or more entries to EventBridge. For custom application events, `Detail` must be a JSON string.

```javascript
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({ region: "us-east-1" });

const response = await eventbridge.send(
  new PutEventsCommand({
    Entries: [
      {
        Source: "com.example.orders",
        DetailType: "order.created",
        Detail: JSON.stringify({
          orderId: "ord_123",
          customerId: "cus_456",
          total: 4200,
        }),
        EventBusName: "default",
      },
    ],
  }),
);

if ((response.FailedEntryCount ?? 0) > 0) {
  throw new Error(JSON.stringify(response.Entries));
}
```

If you publish to a custom bus, set `EventBusName` to that bus name or ARN consistently in your publishers and rules.

### Create or update a rule with an event pattern

`PutRuleCommand` creates a new rule or updates an existing rule with the same name. `EventPattern` is a JSON string, not a JavaScript object.

```javascript
import {
  EventBridgeClient,
  PutRuleCommand,
} from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({ region: "us-east-1" });

const eventPattern = JSON.stringify({
  source: ["com.example.orders"],
  "detail-type": ["order.created"],
});

const response = await eventbridge.send(
  new PutRuleCommand({
    Name: "route-order-created",
    Description: "Match order.created events from the orders app",
    EventBusName: "default",
    EventPattern: eventPattern,
    State: "ENABLED",
  }),
);

console.log(response.RuleArn);
```

You can also create scheduled rules with `ScheduleExpression` instead of an event pattern.

### Attach a target to a rule

Creating a rule does not attach any destination. Use `PutTargetsCommand` to send matched events to a Lambda function, SQS queue, SNS topic, Step Functions state machine, or another supported target.

```javascript
import {
  EventBridgeClient,
  PutTargetsCommand,
} from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({ region: "us-east-1" });

const response = await eventbridge.send(
  new PutTargetsCommand({
    Rule: "route-order-created",
    EventBusName: "default",
    Targets: [
      {
        Id: "order-processor",
        Arn: "arn:aws:lambda:us-east-1:123456789012:function:process-order",
      },
    ],
  }),
);

if ((response.FailedEntryCount ?? 0) > 0) {
  throw new Error(JSON.stringify(response.FailedEntries));
}
```

For some targets, the target resource also needs separate permissions or a `RoleArn`. For Lambda targets, EventBridge target attachment does not replace the Lambda resource-based permission that allows `events.amazonaws.com` to invoke the function.

### List targets for a rule

`ListTargetsByRuleCommand` is the easiest way to inspect which targets are currently attached.

```javascript
import {
  EventBridgeClient,
  ListTargetsByRuleCommand,
} from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({ region: "us-east-1" });

let nextToken;

do {
  const response = await eventbridge.send(
    new ListTargetsByRuleCommand({
      Rule: "route-order-created",
      EventBusName: "default",
      NextToken: nextToken,
      Limit: 100,
    }),
  );

  for (const target of response.Targets ?? []) {
    console.log(target.Id, target.Arn);
  }

  nextToken = response.NextToken;
} while (nextToken);
```

### Remove targets and delete a rule

You must remove a rule's targets before deleting the rule.

```javascript
import {
  DeleteRuleCommand,
  EventBridgeClient,
  ListTargetsByRuleCommand,
  RemoveTargetsCommand,
} from "@aws-sdk/client-eventbridge";

const eventbridge = new EventBridgeClient({ region: "us-east-1" });
const ruleName = "route-order-created";
const eventBusName = "default";

const targetIds = [];
let nextToken;

do {
  const response = await eventbridge.send(
    new ListTargetsByRuleCommand({
      Rule: ruleName,
      EventBusName: eventBusName,
      NextToken: nextToken,
      Limit: 100,
    }),
  );

  for (const target of response.Targets ?? []) {
    if (target.Id) {
      targetIds.push(target.Id);
    }
  }

  nextToken = response.NextToken;
} while (nextToken);

if (targetIds.length > 0) {
  await eventbridge.send(
    new RemoveTargetsCommand({
      Rule: ruleName,
      EventBusName: eventBusName,
      Ids: targetIds,
    }),
  );
}

await eventbridge.send(
  new DeleteRuleCommand({
    Name: ruleName,
    EventBusName: eventBusName,
  }),
);
```

## Pitfalls

- `Detail` for `PutEventsCommand` is a serialized JSON string. Do not pass a raw object.
- `EventPattern` for `PutRuleCommand` is also a JSON string.
- `PutEventsCommand` and `PutTargetsCommand` can partially fail. Always check `FailedEntryCount` and inspect the per-entry results.
- Creating a rule is not enough by itself. Rules only deliver anywhere after you attach one or more targets.
- Deleting a rule requires target cleanup first.
- EventBridge resources are regional. A rule, bus, or target lookup in the wrong region looks like a missing resource.
- If you use a non-default bus, include `EventBusName` on related calls instead of relying on the default bus implicitly.

## When To Reach For Other Packages

- `@aws-sdk/client-lambda`: add or manage Lambda invoke permissions for EventBridge targets.
- `@aws-sdk/client-scheduler`: use the separate EventBridge Scheduler service when you need one-time or flexible-time-window schedules rather than EventBridge rules.
- `@aws-sdk/credential-providers`: configure Cognito, assume-role, SSO, or other explicit credential flows.

## Version Notes

- This guide targets `@aws-sdk/client-eventbridge` version `3.1007.0`.
- The AWS SDK for JavaScript v3 package exports the low-level `EventBridgeClient` and individual commands; this is the import style to prefer in application code.

## Official Sources

- AWS SDK for JavaScript v3 EventBridge client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/eventbridge/`
- Amazon EventBridge API Reference: `https://docs.aws.amazon.com/eventbridge/latest/APIReference/Welcome.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-eventbridge`
