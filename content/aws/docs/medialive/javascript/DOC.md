---
name: medialive
description: "AWS SDK for JavaScript v3 client for AWS Elemental MediaLive channels, inputs, input security groups, tagging, and channel control-plane operations."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,medialive,javascript,nodejs,video,streaming,live-video"
---

# `@aws-sdk/client-medialive`

Use `@aws-sdk/client-medialive` to manage AWS Elemental MediaLive resources from JavaScript or TypeScript. This is the MediaLive control-plane client: you use it to list and inspect channels and inputs, start and stop channels, manage input security groups, update schedules, and tag MediaLive resources.

Prefer `MediaLiveClient` with explicit command imports for new code.

## Golden Rules

- Set `region` and credentials before creating `MediaLiveClient`; MediaLive resources are regional.
- Treat `StartChannelCommand` and `StopChannelCommand` as asynchronous operations. Use `waitUntilChannelRunning` and `waitUntilChannelStopped`, or poll `DescribeChannelCommand`.
- `ListChannels` and `ListInputs` paginate with `NextToken`; AWS SDK v3 also exports `paginateListChannels` and `paginateListInputs`.
- Input security group whitelist rules are IPv4 CIDR blocks.
- `DescribeInputCommand` returns `AttachedChannels` as a list, but MediaLive currently documents an input as attachable to one channel at a time.
- If you automate create flows, pass `RequestId` on retryable operations such as `CreateChannelCommand` and `CreateInputCommand`.

## Install

```bash
npm install @aws-sdk/client-medialive
```

If you want explicit shared-profile or SSO helpers in application code:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-medialive@3.1007.0`.

## Prerequisites And Authentication

Configure AWS credentials and a region before calling MediaLive.

Typical local setup:

```bash
aws configure

export AWS_PROFILE="video"
export AWS_REGION="us-west-2"

export AWS_MEDIALIVE_CHANNEL_ID="1234567"
export AWS_MEDIALIVE_INPUT_ID="7654321"
```

Or with direct credentials:

```bash
export AWS_REGION="us-west-2"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional, only for temporary credentials
```

In Node.js, AWS SDK v3 usually resolves credentials from the default provider chain, including environment variables, shared config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

Your credentials must allow the MediaLive operations you call, and create/update flows may also require permission to pass any IAM role ARN you include in the request.

## Client Setup

### Minimal client

```javascript
import { MediaLiveClient } from "@aws-sdk/client-medialive";

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

### Explicit shared profile with `fromIni`

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { MediaLiveClient } from "@aws-sdk/client-medialive";

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "video" }),
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  DescribeChannelCommand,
  MediaLiveClient,
} from "@aws-sdk/client-medialive";

const channelId = process.env.AWS_MEDIALIVE_CHANNEL_ID;

if (!channelId) {
  throw new Error("Set AWS_MEDIALIVE_CHANNEL_ID");
}

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const response = await medialive.send(
  new DescribeChannelCommand({
    ChannelId: channelId,
  }),
);

console.log(response.Id, response.Name, response.State);
```

## Common Workflows

### List channels with the built-in paginator

```javascript
import {
  MediaLiveClient,
  paginateListChannels,
} from "@aws-sdk/client-medialive";

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

for await (const page of paginateListChannels(
  { client: medialive },
  { MaxResults: 25 },
)) {
  for (const channel of page.Channels ?? []) {
    console.log({
      id: channel.Id,
      name: channel.Name,
      state: channel.State,
      channelClass: channel.ChannelClass,
      pipelinesRunningCount: channel.PipelinesRunningCount,
    });
  }
}
```

### Inspect one channel in detail

`ListChannels` returns summaries. Use `DescribeChannelCommand` when you need the full channel configuration and runtime state.

```javascript
import {
  DescribeChannelCommand,
  MediaLiveClient,
} from "@aws-sdk/client-medialive";

const channelId = process.env.AWS_MEDIALIVE_CHANNEL_ID;

if (!channelId) {
  throw new Error("Set AWS_MEDIALIVE_CHANNEL_ID");
}

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const { Id, Name, State, PipelinesRunningCount, InputAttachments, EgressEndpoints } =
  await medialive.send(
    new DescribeChannelCommand({
      ChannelId: channelId,
    }),
  );

console.log({
  Id,
  Name,
  State,
  PipelinesRunningCount,
  inputIds: (InputAttachments ?? []).map((attachment) => attachment.InputId),
  egressSourceIps: (EgressEndpoints ?? []).map((endpoint) => endpoint.SourceIp),
});
```

### Start a channel and wait until it is running

```javascript
import {
  MediaLiveClient,
  StartChannelCommand,
  waitUntilChannelRunning,
} from "@aws-sdk/client-medialive";

const channelId = process.env.AWS_MEDIALIVE_CHANNEL_ID;

if (!channelId) {
  throw new Error("Set AWS_MEDIALIVE_CHANNEL_ID");
}

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await medialive.send(
  new StartChannelCommand({
    ChannelId: channelId,
  }),
);

await waitUntilChannelRunning(
  { client: medialive, maxWaitTime: 600 },
  {
    ChannelId: channelId,
  },
);

console.log(`Channel ${channelId} is running`);
```

### Stop a channel and wait until it is idle

The MediaLive channel-stopped waiter succeeds when the channel state returns to `IDLE`.

```javascript
import {
  MediaLiveClient,
  StopChannelCommand,
  waitUntilChannelStopped,
} from "@aws-sdk/client-medialive";

const channelId = process.env.AWS_MEDIALIVE_CHANNEL_ID;

if (!channelId) {
  throw new Error("Set AWS_MEDIALIVE_CHANNEL_ID");
}

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await medialive.send(
  new StopChannelCommand({
    ChannelId: channelId,
  }),
);

await waitUntilChannelStopped(
  { client: medialive, maxWaitTime: 300 },
  {
    ChannelId: channelId,
  },
);

console.log(`Channel ${channelId} is idle`);
```

### List inputs and see which channel each input is attached to

```javascript
import {
  MediaLiveClient,
  paginateListInputs,
} from "@aws-sdk/client-medialive";

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

for await (const page of paginateListInputs(
  { client: medialive },
  { MaxResults: 25 },
)) {
  for (const input of page.Inputs ?? []) {
    console.log({
      id: input.Id,
      name: input.Name,
      type: input.Type,
      state: input.State,
      attachedChannels: input.AttachedChannels ?? [],
    });
  }
}
```

### Inspect one input in detail

```javascript
import {
  DescribeInputCommand,
  MediaLiveClient,
} from "@aws-sdk/client-medialive";

const inputId = process.env.AWS_MEDIALIVE_INPUT_ID;

if (!inputId) {
  throw new Error("Set AWS_MEDIALIVE_INPUT_ID");
}

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const input = await medialive.send(
  new DescribeInputCommand({
    InputId: inputId,
  }),
);

console.log({
  id: input.Id,
  name: input.Name,
  type: input.Type,
  state: input.State,
  inputClass: input.InputClass,
  securityGroups: input.SecurityGroups ?? [],
  sources: (input.Sources ?? []).map((source) => source.Url),
  destinations: (input.Destinations ?? []).map((destination) => destination.Url),
});
```

### Create an input security group

Input security group whitelist rules are CIDR allow-lists for incoming traffic.

```javascript
import {
  CreateInputSecurityGroupCommand,
  MediaLiveClient,
} from "@aws-sdk/client-medialive";

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const response = await medialive.send(
  new CreateInputSecurityGroupCommand({
    Tags: {
      Environment: "dev",
      Service: "live-stream",
    },
    WhitelistRules: [
      { Cidr: "203.0.113.0/24" },
      { Cidr: "198.51.100.10/32" },
    ],
  }),
);

console.log(response.SecurityGroup?.Id, response.SecurityGroup?.Arn);
```

### Tag a MediaLive resource by ARN

MediaLive tagging uses the resource ARN, not the numeric channel or input ID.

```javascript
import {
  CreateTagsCommand,
  DescribeChannelCommand,
  ListTagsForResourceCommand,
  MediaLiveClient,
} from "@aws-sdk/client-medialive";

const channelId = process.env.AWS_MEDIALIVE_CHANNEL_ID;

if (!channelId) {
  throw new Error("Set AWS_MEDIALIVE_CHANNEL_ID");
}

const medialive = new MediaLiveClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const channel = await medialive.send(
  new DescribeChannelCommand({
    ChannelId: channelId,
  }),
);

if (!channel.Arn) {
  throw new Error(`Channel ${channelId} did not return an ARN`);
}

await medialive.send(
  new CreateTagsCommand({
    ResourceArn: channel.Arn,
    Tags: {
      Environment: "prod",
      Owner: "video-platform",
    },
  }),
);

const tags = await medialive.send(
  new ListTagsForResourceCommand({
    ResourceArn: channel.Arn,
  }),
);

console.log(tags.Tags);
```

## MediaLive-Specific Gotchas

- `StartChannelCommand` and `StopChannelCommand` return before the channel reaches its final runtime state. Wait explicitly if later steps depend on `RUNNING` or `IDLE`.
- `ChannelClass: "STANDARD"` means two pipelines; `"SINGLE_PIPELINE"` means one pipeline.
- MediaLive documents `DescribeInput.InputClass` so that `STANDARD` inputs expect two sources for redundancy. If the attached channel is `SINGLE_PIPELINE`, only the first source is ingested.
- `CreateInputCommand` distinguishes pull and push inputs: pull inputs use `Sources`, while push inputs use `Destinations`.
- `BatchStartCommand` and `BatchStopCommand` can report per-resource failures in `Failed`, so inspect the response instead of assuming a 200 response means every requested resource changed state.
- The current MediaLive waiter model includes waiters for channel creation, running, stopped, and deleted states, plus input attached, detached, and deleted states.

## When To Reach For Other Packages

- `@aws-sdk/credential-providers`: shared config, IAM Identity Center, and assume-role helpers for explicit credential setup.
- `@aws-sdk/client-mediaconvert`: file-based transcoding jobs before or after live pipelines.
- `@aws-sdk/client-s3`: source and destination object management for adjacent video workflows.
