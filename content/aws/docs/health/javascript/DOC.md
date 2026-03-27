---
name: health
description: "AWS SDK for JavaScript v3 client for AWS Health account and organization event APIs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,health,javascript,nodejs,operations,events"
---

# `@aws-sdk/client-health`

Use this package for the AWS Health API in JavaScript or Node.js. It lets you list AWS Health events, fetch detailed descriptions, and inspect affected entities for your account. It also includes organization-scoped operations for AWS Organizations setups.

This package is for **AWS Health service events**. It is not the SDK for Route 53 health checks, application health endpoints, or CloudWatch alarms.

## Install

```bash
npm install @aws-sdk/client-health
```

Prefer `HealthClient` with explicit command imports.

## Prerequisites

- AWS credentials that the SDK can resolve.
- A configured AWS region. The examples below use `us-east-1`.
- Access to AWS Health. Accounts without the required AWS Support plan can receive `SubscriptionRequiredException`.

Typical local environment:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

In Node.js, the AWS SDK v3 can also load credentials from the shared config files, IAM Identity Center, ECS task roles, or EC2 instance roles.

## Initialize the client

```javascript
import { HealthClient } from "@aws-sdk/client-health";

const health = new HealthClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

## Core usage pattern

Every call follows the v3 client-plus-command pattern:

```javascript
import {
  HealthClient,
  DescribeEventsCommand,
} from "@aws-sdk/client-health";

const health = new HealthClient({ region: "us-east-1" });

const response = await health.send(
  new DescribeEventsCommand({
    filter: {
      services: ["EC2"],
      eventStatusCodes: ["open", "upcoming"],
      regions: ["us-east-1"],
    },
    maxResults: 10,
  }),
);

for (const event of response.events ?? []) {
  console.log(event.arn, event.service, event.eventTypeCode, event.statusCode);
}
```

## Common operations

### List recent AWS Health events

Use `DescribeEventsCommand` for account-scoped events.

```javascript
import {
  HealthClient,
  DescribeEventsCommand,
} from "@aws-sdk/client-health";

const health = new HealthClient({ region: "us-east-1" });

const { events = [] } = await health.send(
  new DescribeEventsCommand({
    filter: {
      services: ["RDS"],
      eventStatusCodes: ["open", "upcoming"],
    },
    maxResults: 20,
  }),
);

for (const event of events) {
  console.log({
    arn: event.arn,
    service: event.service,
    type: event.eventTypeCode,
    status: event.statusCode,
    start: event.startTime,
  });
}
```

Put filters under `filter`. Common filters include service names, event status codes, event type codes, regions, and time ranges.

### Get full descriptions for one or more events

`DescribeEventsCommand` gives summary metadata. Use `DescribeEventDetailsCommand` when you need the full human-readable description.

```javascript
import {
  HealthClient,
  DescribeEventDetailsCommand,
} from "@aws-sdk/client-health";

const health = new HealthClient({ region: "us-east-1" });

const eventArns = [
  "arn:aws:health:us-east-1::event/AWS_EC2_OPERATIONAL_ISSUE/AWS_EC2_OPERATIONAL_ISSUE_1234567890",
];

const { successfulSet = [], failedSet = [] } = await health.send(
  new DescribeEventDetailsCommand({ eventArns }),
);

for (const item of successfulSet) {
  console.log(item.event?.arn);
  console.log(item.eventDescription?.latestDescription);
}

for (const item of failedSet) {
  console.error(item.eventArn, item.errorName, item.errorMessage);
}
```

### List affected entities for an event

Use `DescribeAffectedEntitiesCommand` to see which resources are affected by a specific event.

```javascript
import {
  HealthClient,
  DescribeAffectedEntitiesCommand,
} from "@aws-sdk/client-health";

const health = new HealthClient({ region: "us-east-1" });

const { entities = [] } = await health.send(
  new DescribeAffectedEntitiesCommand({
    filter: {
      eventArns: [
        "arn:aws:health:us-east-1::event/AWS_EC2_OPERATIONAL_ISSUE/AWS_EC2_OPERATIONAL_ISSUE_1234567890",
      ],
    },
    maxResults: 50,
  }),
);

for (const entity of entities) {
  console.log({
    entityArn: entity.entityArn,
    entityValue: entity.entityValue,
    status: entity.statusCode,
    lastUpdatedTime: entity.lastUpdatedTime,
  });
}
```

If you already know the resource identifiers you care about, add `entityValues` to the filter to narrow the result set.

### Read organization-wide events

If AWS Health organizational view is enabled, use the organization operations instead of the account-scoped ones.

```javascript
import {
  HealthClient,
  DescribeEventsForOrganizationCommand,
} from "@aws-sdk/client-health";

const health = new HealthClient({ region: "us-east-1" });

const { events = [] } = await health.send(
  new DescribeEventsForOrganizationCommand({
    filter: {
      services: ["S3"],
      eventStatusCodes: ["open"],
    },
    maxResults: 20,
  }),
);

for (const event of events) {
  console.log(event.arn, event.service, event.statusCode);
}
```

Organization APIs are for the management account or a delegated administrator account with AWS Health organizational access enabled.

## Error handling

`SubscriptionRequiredException` is the first error to check when an otherwise valid request fails immediately.

```javascript
import {
  HealthClient,
  DescribeEventsCommand,
} from "@aws-sdk/client-health";

const health = new HealthClient({ region: "us-east-1" });

try {
  await health.send(
    new DescribeEventsCommand({
      filter: { eventStatusCodes: ["open"] },
      maxResults: 5,
    }),
  );
} catch (error) {
  if (error?.name === "SubscriptionRequiredException") {
    console.error("AWS Health API access requires a supported AWS Support plan.");
  }

  throw error;
}
```

## AWS Health gotchas

- This client is for AWS-originated health events. It does not create health checks for your own URLs or services.
- Use account-scoped commands such as `DescribeEventsCommand` for the current account, and organization-scoped commands such as `DescribeEventsForOrganizationCommand` only when organizational view is enabled.
- Event descriptions are a separate read. Fetch summaries with `DescribeEventsCommand`, then call `DescribeEventDetailsCommand` when you need the long description text.
- Affected resources are a separate read too. Use `DescribeAffectedEntitiesCommand` after you have the event ARN.
- Health responses are filter-driven. Put service names, status codes, regions, and time filters inside the nested `filter` object.
- Do not deep-import package internals from generated build paths.

## When to use other packages

- `@aws-sdk/client-route-53`: Route 53 DNS and Route 53 health checks.
- `@aws-sdk/client-cloudwatch`: metrics, alarms, and dashboards.
- `@aws-sdk/credential-providers`: explicit credential providers such as shared config, IAM Identity Center, Cognito, or assume-role helpers.
