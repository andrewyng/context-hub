---
name: connect
description: "AWS SDK for JavaScript v3 client for Amazon Connect instance, user, metrics, and outbound contact APIs"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,connect,javascript,nodejs,contact-center,ccp,metrics"
---

# `@aws-sdk/client-connect`

Use `@aws-sdk/client-connect` to call Amazon Connect control-plane and real-time metrics APIs from JavaScript or TypeScript. Typical tasks include inspecting an instance, listing or searching users, creating users, reading current queue metrics, and starting outbound voice contacts.

Prefer `ConnectClient` plus explicit command imports. Amazon Connect resources are regional, and many operations require an `InstanceId`, so set the client region to the same region as the Connect instance you are targeting.

## Golden Rule

- Install `@aws-sdk/client-connect`, not the legacy `aws-sdk` v2 package.
- Prefer `ConnectClient` with `client.send(new Command(input))`.
- Set `region` explicitly or through standard AWS config.
- Expect to pass `InstanceId` on most operations.
- Keep Connect API calls on the server side unless you already have a browser-safe temporary credential flow.

## Install

```bash
npm install @aws-sdk/client-connect
```

If you want to pin a named shared AWS profile in code:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-connect@3.1007.0`.

## Prerequisites And Authentication

Before sending requests, make sure all of the following are true:

- your AWS credentials are available to the SDK
- your IAM policy allows the Amazon Connect actions your code uses
- your client region matches the Amazon Connect instance region
- you know the target Connect `InstanceId`

Typical local setup:

```bash
aws configure --profile connect-dev

export AWS_PROFILE=connect-dev
export AWS_REGION=us-east-1
export CONNECT_INSTANCE_ID=your-connect-instance-id
export CONNECT_QUEUE_ID=your-queue-id
export CONNECT_CONTACT_FLOW_ID=your-contact-flow-id
export CONNECT_ROUTING_PROFILE_ID=your-routing-profile-id
export CONNECT_SECURITY_PROFILE_ID=your-security-profile-id
```

Minimal client setup:

```javascript
import { ConnectClient } from "@aws-sdk/client-connect";

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to force a shared profile explicitly in code:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { ConnectClient } from "@aws-sdk/client-connect";

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "connect-dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if you already use environment variables, shared AWS config files, IAM Identity Center, ECS task roles, or EC2 instance profiles.

## Core Usage Pattern

The normal v3 flow is `client.send(new Command(input))`.

```javascript
import {
  ConnectClient,
  DescribeInstanceCommand,
} from "@aws-sdk/client-connect";

const instanceId = process.env.CONNECT_INSTANCE_ID;

if (!instanceId) {
  throw new Error("Set CONNECT_INSTANCE_ID before calling Amazon Connect");
}

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new DescribeInstanceCommand({
    InstanceId: instanceId,
  }),
);

console.log(response.Instance?.InstanceStatus);
console.log(response.Instance?.InstanceAccessUrl);
console.log(response.Instance?.IdentityManagementType);
```

## Common Operations

### List users with pagination

`ListUsers` returns summaries and uses `NextToken` pagination.

```javascript
import {
  ConnectClient,
  ListUsersCommand,
} from "@aws-sdk/client-connect";

const instanceId = process.env.CONNECT_INSTANCE_ID;

if (!instanceId) {
  throw new Error("Set CONNECT_INSTANCE_ID before listing users");
}

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken;

do {
  const page = await client.send(
    new ListUsersCommand({
      InstanceId: instanceId,
      MaxResults: 100,
      NextToken: nextToken,
    }),
  );

  for (const user of page.UserSummaryList ?? []) {
    console.log(user.Id, user.Username, user.Arn);
  }

  nextToken = page.NextToken;
} while (nextToken);
```

### Search users by username prefix

Use `SearchUsers` when you need filtering instead of walking the full user list.

```javascript
import {
  ConnectClient,
  SearchUsersCommand,
} from "@aws-sdk/client-connect";

const instanceId = process.env.CONNECT_INSTANCE_ID;

if (!instanceId) {
  throw new Error("Set CONNECT_INSTANCE_ID before searching users");
}

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new SearchUsersCommand({
    InstanceId: instanceId,
    MaxResults: 25,
    SearchCriteria: {
      StringCondition: {
        FieldName: "Username",
        Value: "alex",
        ComparisonType: "STARTS_WITH",
      },
    },
  }),
);

for (const user of response.Users ?? []) {
  console.log(user.Id, user.Username, user.IdentityInfo?.Email);
}
```

Supported string-search fields include `Username`, `FirstName`, `LastName`, `RoutingProfileId`, `SecurityProfileId`, and `resourceId`.

### Read a full user record

`DescribeUser` gives you the expanded user document after you already know the user ID.

```javascript
import {
  ConnectClient,
  DescribeUserCommand,
} from "@aws-sdk/client-connect";

const instanceId = process.env.CONNECT_INSTANCE_ID;
const userId = process.env.CONNECT_USER_ID;

if (!instanceId || !userId) {
  throw new Error("Set CONNECT_INSTANCE_ID and CONNECT_USER_ID before describing a user");
}

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new DescribeUserCommand({
    InstanceId: instanceId,
    UserId: userId,
  }),
);

console.log(response.User?.Username);
console.log(response.User?.IdentityInfo?.Email);
console.log(response.User?.RoutingProfileId);
console.log(response.User?.SecurityProfileIds);
```

### Create a user in a Connect-managed instance

This example uses `CONNECT_MANAGED` identity management, where `Password` is required. For SAML or existing-directory setups, do not blindly reuse the same identity fields; see the gotchas section below.

```javascript
import {
  ConnectClient,
  CreateUserCommand,
} from "@aws-sdk/client-connect";

const instanceId = process.env.CONNECT_INSTANCE_ID;
const routingProfileId = process.env.CONNECT_ROUTING_PROFILE_ID;
const securityProfileId = process.env.CONNECT_SECURITY_PROFILE_ID;

if (!instanceId || !routingProfileId || !securityProfileId) {
  throw new Error(
    "Set CONNECT_INSTANCE_ID, CONNECT_ROUTING_PROFILE_ID, and CONNECT_SECURITY_PROFILE_ID before creating a user",
  );
}

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new CreateUserCommand({
    InstanceId: instanceId,
    Username: "alex.lee",
    Password: "TempPassword123!",
    IdentityInfo: {
      FirstName: "Alex",
      LastName: "Lee",
      Email: "alex.lee@example.com",
    },
    PhoneConfig: {
      PhoneType: "SOFT_PHONE",
      AutoAccept: false,
      AfterContactWorkTimeLimit: 0,
    },
    RoutingProfileId: routingProfileId,
    SecurityProfileIds: [securityProfileId],
  }),
);

console.log(response.UserId);
console.log(response.UserArn);
```

### Read current queue metrics

`GetCurrentMetricData` returns real-time metrics. The example below asks for queue-level values for the voice channel.

```javascript
import {
  ConnectClient,
  GetCurrentMetricDataCommand,
} from "@aws-sdk/client-connect";

const instanceId = process.env.CONNECT_INSTANCE_ID;
const queueId = process.env.CONNECT_QUEUE_ID;

if (!instanceId || !queueId) {
  throw new Error("Set CONNECT_INSTANCE_ID and CONNECT_QUEUE_ID before reading metrics");
}

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new GetCurrentMetricDataCommand({
    InstanceId: instanceId,
    Filters: {
      Queues: [queueId],
      Channels: ["VOICE"],
    },
    Groupings: ["QUEUE"],
    CurrentMetrics: [
      { Name: "AGENTS_AVAILABLE", Unit: "COUNT" },
      { Name: "CONTACTS_IN_QUEUE", Unit: "COUNT" },
      { Name: "OLDEST_CONTACT_AGE", Unit: "SECONDS" },
    ],
  }),
);

for (const result of response.MetricResults ?? []) {
  const queue = result.Dimensions?.Queue?.Id;

  for (const metric of result.Collections ?? []) {
    console.log(queue, metric.Metric?.Name, metric.Value);
  }
}
```

### Start an outbound voice contact

Use `StartOutboundVoiceContact` to place an outbound call and run the specified contact flow.

```javascript
import {
  ConnectClient,
  StartOutboundVoiceContactCommand,
} from "@aws-sdk/client-connect";

const instanceId = process.env.CONNECT_INSTANCE_ID;
const contactFlowId = process.env.CONNECT_CONTACT_FLOW_ID;

if (!instanceId || !contactFlowId) {
  throw new Error("Set CONNECT_INSTANCE_ID and CONNECT_CONTACT_FLOW_ID before starting an outbound contact");
}

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new StartOutboundVoiceContactCommand({
    InstanceId: instanceId,
    ContactFlowId: contactFlowId,
    DestinationPhoneNumber: "+12065550100",
    SourcePhoneNumber: "+12065550199",
    Name: "Order follow-up",
    Attributes: {
      orderId: "12345",
      customerTier: "gold",
    },
    RingTimeoutInSeconds: 30,
  }),
);

console.log(response.ContactId);
```

If you need to stop a queued callback or another stoppable contact later:

```javascript
import {
  ConnectClient,
  StopContactCommand,
} from "@aws-sdk/client-connect";

const instanceId = process.env.CONNECT_INSTANCE_ID;
const contactId = process.env.CONNECT_CONTACT_ID;

if (!instanceId || !contactId) {
  throw new Error("Set CONNECT_INSTANCE_ID and CONNECT_CONTACT_ID before stopping a contact");
}

const client = new ConnectClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new StopContactCommand({
    InstanceId: instanceId,
    ContactId: contactId,
  }),
);
```

## Connect-Specific Gotchas

- Most Connect APIs require `InstanceId`; forgetting it is one of the fastest ways to get blocked.
- Keep the SDK `region` aligned with the Connect instance region. A region mismatch often looks like a missing resource or access problem.
- `CreateUserCommand` rules depend on the instance identity-management mode. `Password` is required for `CONNECT_MANAGED`, must be omitted otherwise, and `DirectoryUserId` is invalid for SAML identities.
- `CreateUserCommand` does not let you mix `PhoneConfig` fields with the corresponding channel-specific config families such as `AutoAcceptConfigs`, `AfterContactWorkConfigs`, `PhoneNumberConfigs`, or `PersistentConnectionConfigs`.
- `StartOutboundVoiceContactCommand` expects E.164 phone numbers such as `+12065550100`. If you omit `RingTimeoutInSeconds`, Amazon Connect uses a 60-second dialing timeout.
- `GetCurrentMetricDataCommand` has request-shape rules: grouping by `CHANNEL` should include a `Channels` filter, and some groupings require a queue filter or queue-first grouping.
- `StopContactCommand` does not stop every voice contact type. It is intended for stoppable contacts such as queued callbacks, while some voice initiation methods are explicitly unsupported.

## When To Reach For Other Packages

- `@aws-sdk/credential-providers`: explicit shared-profile, Cognito, and assume-role credential flows.
- `@aws-sdk/client-connectcases`: Amazon Connect Cases is a separate service client.
- `@aws-sdk/client-connectparticipant`: use this for participant messaging APIs instead of the Connect control-plane client.
