---
name: chime-sdk-messaging
description: "AWS SDK for JavaScript v3 client for Amazon Chime SDK Messaging channels, memberships, messages, and channel flows"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,chime-sdk,messaging,javascript,nodejs,channels"
---

# `@aws-sdk/client-chime-sdk-messaging`

Use `@aws-sdk/client-chime-sdk-messaging` to manage Amazon Chime SDK messaging channels, channel memberships, channel messages, read markers, and channel flows from JavaScript or TypeScript.

This package is for the messaging layer. It does not create app instances or app instance users. For that setup work, use the Chime SDK identity APIs, then use this package with the resulting `AppInstanceArn`, `AppInstanceUserArn`, `ChannelArn`, and related ARNs.

## Golden Rule

- Install `@aws-sdk/client-chime-sdk-messaging`, not the legacy `aws-sdk` v2 package.
- Prefer `ChimeSDKMessagingClient` with explicit command imports.
- Pass `ChimeBearer` on the calls that require it, using the acting `AppInstanceUserArn` or `AppInstanceBotArn`.
- Keep the client `region` aligned with the Chime SDK app instance region.
- Use full ARNs such as `AppInstanceArn`, `AppInstanceUserArn`, `ChannelArn`, and `ChannelFlowArn`.
- Handle pagination yourself with `NextToken`.

## Install

```bash
npm install @aws-sdk/client-chime-sdk-messaging
```

If you want to force a named shared AWS profile in code:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-chime-sdk-messaging@3.1007.0`.

## Prerequisites And Authentication

Before using the client, make sure all of the following are true:

- AWS credentials are available to the SDK.
- Your IAM policy allows the Chime SDK messaging actions your code calls.
- You already have a Chime SDK app instance and app instance users or bots.
- Your code knows the acting user or bot ARN that should be sent as `ChimeBearer`.
- Your client region matches the app instance region.

Typical local setup:

```bash
aws configure --profile chime-dev

export AWS_PROFILE=chime-dev
export AWS_REGION=us-east-1
export APP_INSTANCE_ARN=arn:aws:chime:us-east-1:123456789012:app-instance/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
export APP_INSTANCE_USER_ARN=arn:aws:chime:us-east-1:123456789012:app-instance/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/user/alice
export TARGET_MEMBER_ARN=arn:aws:chime:us-east-1:123456789012:app-instance/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/user/bob
export SECOND_TARGET_MEMBER_ARN=arn:aws:chime:us-east-1:123456789012:app-instance/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/user/carol
export CHANNEL_ARN=arn:aws:chime:us-east-1:123456789012:channel/ffffffff-1111-2222-3333-444444444444
export MESSAGE_ID=12345678-90ab-cdef-1234-567890abcdef
export MODERATION_LAMBDA_ARN=arn:aws:lambda:us-east-1:123456789012:function:chime-message-moderator
```

Minimal client setup:

```javascript
import { ChimeSDKMessagingClient } from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to pin a shared profile explicitly:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { ChimeSDKMessagingClient } from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "chime-dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if you already use environment variables, shared AWS config files, IAM Identity Center, ECS task roles, or EC2 instance profiles.

## Shared Helpers

```javascript
function mustEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const region = process.env.AWS_REGION ?? "us-east-1";
const appInstanceArn = mustEnv("APP_INSTANCE_ARN");
const bearerArn = mustEnv("APP_INSTANCE_USER_ARN");
```

## Core Usage Pattern

The normal v3 flow is `client.send(new Command(input))`.

The snippets below assume `mustEnv`, `region`, `appInstanceArn`, and `bearerArn` from the shared-helper block.

```javascript
import {
  ChimeSDKMessagingClient,
  ListChannelsCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

const page = await client.send(
  new ListChannelsCommand({
    AppInstanceArn: appInstanceArn,
    Privacy: "PUBLIC",
    MaxResults: 20,
    ChimeBearer: bearerArn,
  }),
);

for (const channel of page.Channels ?? []) {
  console.log(channel.ChannelArn, channel.Name, channel.Privacy);
}
```

## Common Operations

### Get the messaging session endpoint

Use this when you need the messaging session endpoint URL for a Chime SDK messaging session.

```javascript
import {
  ChimeSDKMessagingClient,
  GetMessagingSessionEndpointCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

const response = await client.send(
  new GetMessagingSessionEndpointCommand({
    NetworkType: "DUAL_STACK",
  }),
);

console.log(response.Endpoint?.Url);
```

`NetworkType` accepts `"IPV4_ONLY"` or `"DUAL_STACK"`.

### Create a channel

`CreateChannel` requires `AppInstanceArn`, a channel `Name`, a `ClientRequestToken`, and `ChimeBearer`.

```javascript
import { randomUUID } from "node:crypto";
import {
  ChimeSDKMessagingClient,
  CreateChannelCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

const created = await client.send(
  new CreateChannelCommand({
    AppInstanceArn: appInstanceArn,
    Name: "support-room",
    Mode: "UNRESTRICTED",
    Privacy: "PRIVATE",
    ClientRequestToken: randomUUID(),
    ChimeBearer: bearerArn,
  }),
);

console.log(created.ChannelArn);
```

Channel privacy cannot be changed later, so pick `"PUBLIC"` vs `"PRIVATE"` up front.

### Add members to a channel

Add a single member:

```javascript
import {
  ChimeSDKMessagingClient,
  CreateChannelMembershipCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });
const channelArn = mustEnv("CHANNEL_ARN");
const targetMemberArn = mustEnv("TARGET_MEMBER_ARN");

const membership = await client.send(
  new CreateChannelMembershipCommand({
    ChannelArn: channelArn,
    MemberArn: targetMemberArn,
    Type: "DEFAULT",
    ChimeBearer: bearerArn,
  }),
);

console.log(membership.Member?.Arn);
```

Add multiple members in one request:

```javascript
import {
  BatchCreateChannelMembershipCommand,
  ChimeSDKMessagingClient,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

const result = await client.send(
  new BatchCreateChannelMembershipCommand({
    ChannelArn: mustEnv("CHANNEL_ARN"),
    MemberArns: [
      mustEnv("TARGET_MEMBER_ARN"),
      mustEnv("SECOND_TARGET_MEMBER_ARN"),
    ],
    Type: "DEFAULT",
    ChimeBearer: bearerArn,
  }),
);

console.log(result.BatchChannelMemberships);
console.log(result.Errors);
```

For public channels, callers do not need to be a member to list messages, but they must be a member to send messages. For private channels, callers must be a member to list or send messages.

### List channels under an app instance

`ListChannels` returns `NextToken`, so loop until it is empty.

```javascript
import {
  ChimeSDKMessagingClient,
  ListChannelsCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

let nextToken;

do {
  const page = await client.send(
    new ListChannelsCommand({
      AppInstanceArn: appInstanceArn,
      Privacy: "PUBLIC",
      MaxResults: 50,
      NextToken: nextToken,
      ChimeBearer: bearerArn,
    }),
  );

  for (const channel of page.Channels ?? []) {
    console.log(channel.ChannelArn, channel.Name, channel.LastMessageTimestamp);
  }

  nextToken = page.NextToken;
} while (nextToken);
```

Use `Privacy: "PUBLIC"` to retrieve all public channels in the app instance. Listing all private channels at the account level requires an `AppInstanceAdmin` caller.

### Search channels by member

`SearchChannels` searches by channel member. The supported field key is `"MEMBERS"`.

```javascript
import {
  ChimeSDKMessagingClient,
  SearchChannelsCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });
const targetMemberArn = mustEnv("TARGET_MEMBER_ARN");

const response = await client.send(
  new SearchChannelsCommand({
    ChimeBearer: bearerArn,
    Fields: [
      {
        Key: "MEMBERS",
        Operator: "EQUALS",
        Values: [targetMemberArn],
      },
    ],
    MaxResults: 20,
  }),
);

for (const channel of response.Channels ?? []) {
  console.log(channel.ChannelArn, channel.Name);
}
```

Users and bots can search across channels they belong to. `AppInstanceAdmin` callers can search across all channels. AWS documents that this operation is not supported for `AppInstanceUser` identities with a large number of memberships.

### Send a channel message

`SendChannelMessage` requires explicit `Type`, `Persistence`, `ClientRequestToken`, and `ChimeBearer`.

```javascript
import { randomUUID } from "node:crypto";
import {
  ChimeSDKMessagingClient,
  SendChannelMessageCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });
const channelArn = mustEnv("CHANNEL_ARN");

const sent = await client.send(
  new SendChannelMessageCommand({
    ChannelArn: channelArn,
    Content: JSON.stringify({ text: "hello from the AWS SDK v3" }),
    ContentType: "application/json",
    Type: "STANDARD",
    Persistence: "PERSISTENT",
    ClientRequestToken: randomUUID(),
    ChimeBearer: bearerArn,
  }),
);

console.log(sent.MessageId, sent.Status?.Value, sent.Status?.Detail);
```

`Type` accepts `"STANDARD"` or `"CONTROL"`. `Persistence` accepts `"PERSISTENT"` or `"NON_PERSISTENT"`.

### List and inspect channel messages

`ListChannelMessages` returns the latest version of each message. Redacted messages stay in the list with empty content. Deleted messages do not appear.

```javascript
import {
  ChimeSDKMessagingClient,
  GetChannelMessageCommand,
  ListChannelMessagesCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });
const channelArn = mustEnv("CHANNEL_ARN");

const listed = await client.send(
  new ListChannelMessagesCommand({
    ChannelArn: channelArn,
    ChimeBearer: bearerArn,
    SortOrder: "ASCENDING",
    MaxResults: 20,
  }),
);

for (const message of listed.ChannelMessages ?? []) {
  console.log(message.MessageId, message.Content, message.Redacted, message.Status?.Value);
}

const firstMessageId = listed.ChannelMessages?.[0]?.MessageId;

if (firstMessageId) {
  const full = await client.send(
    new GetChannelMessageCommand({
      ChannelArn: channelArn,
      MessageId: firstMessageId,
      ChimeBearer: bearerArn,
    }),
  );

  console.log(full.ChannelMessage);
}
```

### Update, redact, or delete a message

Update a message body:

```javascript
import {
  ChimeSDKMessagingClient,
  UpdateChannelMessageCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

const updated = await client.send(
  new UpdateChannelMessageCommand({
    ChannelArn: mustEnv("CHANNEL_ARN"),
    MessageId: mustEnv("MESSAGE_ID"),
    Content: JSON.stringify({ text: "edited message" }),
    ContentType: "application/json",
    ChimeBearer: bearerArn,
  }),
);

console.log(updated.Status?.Value, updated.Status?.Detail);
```

Redact a message so the record remains but the content is removed:

```javascript
import {
  ChimeSDKMessagingClient,
  RedactChannelMessageCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

await client.send(
  new RedactChannelMessageCommand({
    ChannelArn: mustEnv("CHANNEL_ARN"),
    MessageId: mustEnv("MESSAGE_ID"),
    ChimeBearer: bearerArn,
  }),
);
```

Delete a message entirely:

```javascript
import {
  ChimeSDKMessagingClient,
  DeleteChannelMessageCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

await client.send(
  new DeleteChannelMessageCommand({
    ChannelArn: mustEnv("CHANNEL_ARN"),
    MessageId: mustEnv("MESSAGE_ID"),
    ChimeBearer: bearerArn,
  }),
);
```

AWS documents `DeleteChannelMessage` as an admin-only action.

### Update the read marker

Use `UpdateChannelReadMarker` when the current user has consumed messages and you want the server-side read position updated.

```javascript
import {
  ChimeSDKMessagingClient,
  UpdateChannelReadMarkerCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

const response = await client.send(
  new UpdateChannelReadMarkerCommand({
    ChannelArn: mustEnv("CHANNEL_ARN"),
    ChimeBearer: bearerArn,
  }),
);

console.log(response.ChannelArn);
```

### List the channels a user belongs to

This is the most direct way to rebuild a user’s channel list.

```javascript
import {
  ChimeSDKMessagingClient,
  ListChannelMembershipsForAppInstanceUserCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

let nextToken;

do {
  const page = await client.send(
    new ListChannelMembershipsForAppInstanceUserCommand({
      AppInstanceUserArn: bearerArn,
      MaxResults: 50,
      NextToken: nextToken,
      ChimeBearer: bearerArn,
    }),
  );

  for (const membership of page.ChannelMemberships ?? []) {
    console.log(
      membership.ChannelSummary?.ChannelArn,
      membership.ChannelSummary?.Name,
      membership.AppInstanceUserMembershipSummary?.Type,
    );
  }

  nextToken = page.NextToken;
} while (nextToken);
```

An `AppInstanceAdmin` can call this for another user. Non-admin callers should use their own user ARN.

### Set per-channel notification preferences

`PutChannelMembershipPreferences` updates the preferences for a single membership.

```javascript
import {
  ChimeSDKMessagingClient,
  PutChannelMembershipPreferencesCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

const response = await client.send(
  new PutChannelMembershipPreferencesCommand({
    ChannelArn: mustEnv("CHANNEL_ARN"),
    MemberArn: bearerArn,
    ChimeBearer: bearerArn,
    Preferences: {
      PushNotifications: {
        AllowNotifications: "NONE",
      },
    },
  }),
);

console.log(response.Preferences);
```

Only the user or bot that owns the membership can set its preferences.

### Create and associate a channel flow

Channel flows let you run Lambda processors on new and updated standard messages.

```javascript
import { randomUUID } from "node:crypto";
import {
  AssociateChannelFlowCommand,
  ChimeSDKMessagingClient,
  CreateChannelFlowCommand,
} from "@aws-sdk/client-chime-sdk-messaging";

const client = new ChimeSDKMessagingClient({ region });

const created = await client.send(
  new CreateChannelFlowCommand({
    AppInstanceArn: appInstanceArn,
    Name: "moderation-flow",
    ClientRequestToken: randomUUID(),
    Processors: [
      {
        Name: "message-moderator",
        ExecutionOrder: 1,
        FallbackAction: "CONTINUE",
        Configuration: {
          Lambda: {
            ResourceArn: mustEnv("MODERATION_LAMBDA_ARN"),
            InvocationType: "ASYNC",
          },
        },
      },
    ],
  }),
);

await client.send(
  new AssociateChannelFlowCommand({
    ChannelArn: mustEnv("CHANNEL_ARN"),
    ChannelFlowArn: created.ChannelFlowArn,
    ChimeBearer: bearerArn,
  }),
);
```

Channel flows process new and updated standard messages, including persistent and non-persistent messages. They do not process control or system messages. Associating a channel flow requires an administrator or channel moderator caller.

## Chime SDK Messaging Gotchas

- `ChimeBearer` is mandatory on most real operations. Use the acting `AppInstanceUserArn` or `AppInstanceBotArn`.
- This package is not the app-instance bootstrap package. Create app instances and app instance users elsewhere, then pass their ARNs here.
- Use full ARNs, not short IDs.
- `CreateChannel` requires a client request token, and channel privacy cannot be changed later.
- `SendChannelMessage` also requires a client request token and an explicit `Persistence` mode.
- There are no generated v3 paginators for this service in the local AWS model metadata, so loop on `NextToken` yourself.
- `SearchChannels` only searches by members. The supported field key is `MEMBERS`.
- `ListChannelMessages` returns edited messages in their latest form. Redacted messages remain in results with empty content, while deleted messages disappear.
- Keep these calls server-side unless you already have a browser-safe temporary credential flow for the acting user or bot.

## Related Packages

- `@aws-sdk/client-chime-sdk-identity` for app instances, app instance users, and other identity setup.
- `@aws-sdk/credential-providers` if you want `fromIni` or other explicit credential-provider helpers.
