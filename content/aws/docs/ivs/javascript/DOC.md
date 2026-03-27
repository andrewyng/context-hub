---
name: ivs
description: "AWS SDK for JavaScript v3 client for managing Amazon IVS channels, stream keys, recording configurations, and live stream metadata."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,ivs,live-streaming,video,javascript"
---

# `@aws-sdk/client-ivs`

Use `@aws-sdk/client-ivs` for the Amazon IVS low-latency streaming control plane in JavaScript or TypeScript. This client creates and manages channels, stream keys, recording configurations, playback key pairs, playback restriction policies, and live-stream metadata.

It does not publish video by itself. Your encoder sends video to the channel ingest endpoint that IVS creates for you, and viewers play the returned playback URL.

## Golden Rules

- Prefer `IVSClient` with explicit command imports.
- Set `region` explicitly or provide it through standard AWS configuration.
- `CreateChannelCommand` creates the channel and its initial stream key in one call.
- Treat `streamKey.value` like a secret; anyone who has it can stream to the channel.
- A channel can have only one stream key at a time. To rotate it, delete the existing key and create a new one.
- `UpdateChannelCommand` cannot update a live channel; stop the stream first.
- `PutMetadataCommand` only works on an active stream and is limited to 1 KB per request, 5 requests per second per channel, and 155 requests per second per account.
- `GetStreamCommand` may signal an offline channel with `ChannelNotBroadcasting`; do not depend on `stream.state === "OFFLINE"`.
- If you create a recording configuration, keep its S3 bucket in the same AWS region as the IVS configuration.

## Install

```bash
npm install @aws-sdk/client-ivs
```

## Prerequisites

Amazon IVS is regional. Set AWS credentials and a region before creating the client.

```bash
export AWS_REGION="us-west-2"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional

export IVS_CHANNEL_ARN="arn:aws:ivs:us-west-2:123456789012:channel/abcdEFGHijkl"
export IVS_RECORDING_BUCKET="my-ivs-recordings"
```

If you already use shared AWS config or named profiles locally, you can omit the explicit `credentials` block and let the SDK resolve credentials from your environment.

## Client Setup

### Minimal client

```javascript
import { IVSClient } from "@aws-sdk/client-ivs";

const ivs = new IVSClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

### Explicit credentials

```javascript
import { IVSClient } from "@aws-sdk/client-ivs";

const ivs = new IVSClient({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  GetChannelCommand,
  IVSClient,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

const { channel } = await ivs.send(
  new GetChannelCommand({
    arn: process.env.IVS_CHANNEL_ARN,
  }),
);

console.log({
  arn: channel?.arn,
  name: channel?.name,
  ingestEndpoint: channel?.ingestEndpoint,
  playbackUrl: channel?.playbackUrl,
});
```

## Common Workflows

### Create a channel and get the ingest endpoint

`CreateChannelCommand` returns both the channel details and the initial stream key.

```javascript
import {
  CreateChannelCommand,
  IVSClient,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

const { channel, streamKey } = await ivs.send(
  new CreateChannelCommand({
    name: "live-app",
    latencyMode: "LOW",
    type: "STANDARD",
    tags: {
      environment: "dev",
    },
  }),
);

console.log("Channel ARN:", channel?.arn);
console.log("RTMPS ingest endpoint:", channel?.ingestEndpoint);
console.log("Playback URL:", channel?.playbackUrl);
console.log("Stream key:", streamKey?.value);
```

Use the returned `ingestEndpoint` and `streamKey.value` in your broadcasting software. Do not expose the stream key in browser code or logs.

### Create a recording configuration in S3

Use a recording configuration when you want IVS to write recorded output to S3.

```javascript
import {
  CreateRecordingConfigurationCommand,
  IVSClient,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

const { recordingConfiguration } = await ivs.send(
  new CreateRecordingConfigurationCommand({
    name: "record-live-app",
    destinationConfiguration: {
      s3: {
        bucketName: process.env.IVS_RECORDING_BUCKET,
      },
    },
    recordingReconnectWindowSeconds: 60,
  }),
);

console.log(recordingConfiguration?.arn);
console.log(recordingConfiguration?.state);
```

If you want recording enabled from the start, pass the returned `recordingConfiguration.arn` as `recordingConfigurationArn` when you create the channel.

```javascript
import {
  CreateChannelCommand,
  IVSClient,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

const recordingConfigurationArn = "arn:aws:ivs:us-west-2:123456789012:recording-configuration/abcdEFGHijkl";

const { channel } = await ivs.send(
  new CreateChannelCommand({
    name: "live-app-with-recording",
    recordingConfigurationArn,
  }),
);

console.log(channel?.arn);
```

### List channels with pagination

```javascript
import {
  IVSClient,
  ListChannelsCommand,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

let nextToken;

do {
  const response = await ivs.send(
    new ListChannelsCommand({
      maxResults: 25,
      nextToken,
    }),
  );

  for (const channel of response.channels ?? []) {
    console.log(channel.arn, channel.name, channel.playbackUrl);
  }

  nextToken = response.nextToken;
} while (nextToken);
```

You can also filter `ListChannelsCommand` requests by `filterByName`, `filterByRecordingConfigurationArn`, or `filterByPlaybackRestrictionPolicyArn`.

### Check whether a channel is live

Use `GetStreamCommand` for the active stream on a channel.

```javascript
import {
  GetStreamCommand,
  IVSClient,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

try {
  const { stream } = await ivs.send(
    new GetStreamCommand({
      channelArn: process.env.IVS_CHANNEL_ARN,
    }),
  );

  console.log({
    streamId: stream?.streamId,
    health: stream?.health,
    state: stream?.state,
    viewerCount: stream?.viewerCount,
    playbackUrl: stream?.playbackUrl,
  });
} catch (error) {
  if (error.name === "ChannelNotBroadcasting") {
    console.log("Channel is not live.");
  } else {
    throw error;
  }
}
```

### Read the latest stream session

`GetStreamSessionCommand` returns the most recent session if you omit `streamId`.

```javascript
import {
  GetStreamSessionCommand,
  IVSClient,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

const { streamSession } = await ivs.send(
  new GetStreamSessionCommand({
    channelArn: process.env.IVS_CHANNEL_ARN,
  }),
);

console.log({
  streamId: streamSession?.streamId,
  startTime: streamSession?.startTime,
  endTime: streamSession?.endTime,
  channelType: streamSession?.channel?.type,
  recordingState: streamSession?.recordingConfiguration?.state,
});
```

Pass a specific `streamId` when you need one historical session instead of the most recent one.

### Put timed metadata into the active stream

`PutMetadataCommand` inserts small metadata messages into the active stream for downstream consumers such as players or analytics.

```javascript
import {
  IVSClient,
  PutMetadataCommand,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

await ivs.send(
  new PutMetadataCommand({
    channelArn: process.env.IVS_CHANNEL_ARN,
    metadata: JSON.stringify({
      event: "score-update",
      home: 2,
      away: 1,
    }),
  }),
);
```

Keep the payload under 1 KB and only call this while the channel is actively broadcasting.

### Stop a live stream

```javascript
import {
  IVSClient,
  StopStreamCommand,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

await ivs.send(
  new StopStreamCommand({
    channelArn: process.env.IVS_CHANNEL_ARN,
  }),
);
```

Some encoders reconnect automatically after a dropped RTMPS session. If you need to stop publishing permanently, rotate or delete the current stream key as part of the shutdown flow.

## Private Playback And Playback Restrictions

Amazon IVS has two related but separate features:

- Set `authorized: true` on a channel when you want a private channel that requires playback-authorization tokens.
- Use `playbackRestrictionPolicyArn` on a channel when you want to restrict playback by country and-or origin.

To enable private playback, import the public key material that your auth service will use for viewer token verification.

```javascript
import { readFile } from "node:fs/promises";
import {
  CreateChannelCommand,
  IVSClient,
  ImportPlaybackKeyPairCommand,
} from "@aws-sdk/client-ivs";

const ivs = new IVSClient({ region: "us-west-2" });

const publicKeyMaterial = await readFile("./ivs-playback-public.pem", "utf8");

const { playbackKeyPair } = await ivs.send(
  new ImportPlaybackKeyPairCommand({
    name: "viewer-auth",
    publicKeyMaterial,
  }),
);

const { channel } = await ivs.send(
  new CreateChannelCommand({
    name: "private-live-app",
    authorized: true,
  }),
);

console.log(playbackKeyPair?.arn);
console.log(channel?.authorized);
```

This package manages playback key pairs, but it does not generate viewer authorization tokens for you. Keep the private key in your own auth service.

## Pitfalls

- This is a control-plane client. Your encoder publishes media to the IVS ingest endpoint; application viewers use the playback URL.
- `CreateStreamKeyCommand` fails if the channel already has a stream key. Delete the current key first if you need to rotate it.
- `UpdateChannelCommand` fails on a live channel. Stop the stream, update the channel, then start broadcasting again.
- If you enable `multitrackInputConfiguration.enabled`, channel type must be `STANDARD`, `policy` and `maximumResolution` are required, and `containerFormat` must be `FRAGMENTED_MP4`.
- Recording configurations can land in `CREATE_FAILED` if the target S3 bucket is in a different region from the IVS configuration.
- `GetStreamCommand` is for active streams only. For offline channels, expect `ChannelNotBroadcasting` instead of relying on an `OFFLINE` response.
- `PutMetadataCommand` requires an active stream and throttles aggressively enough that you should batch small events together when possible.
- Private channels and playback restriction policies solve different problems: signed viewer authorization versus geographic or origin restrictions.

## Version Notes

- This guide targets `@aws-sdk/client-ivs` version `3.1007.0`.
- The current service model exposes channel types `BASIC`, `STANDARD`, `ADVANCED_SD`, and `ADVANCED_HD`.
- The current paginated list operations are `ListChannels`, `ListPlaybackKeyPairs`, `ListRecordingConfigurations`, `ListStreamKeys`, and `ListStreams`.

## Official Sources

- AWS SDK for JavaScript v3 IVS client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ivs/`
- Amazon IVS Low-Latency Streaming API Reference: `https://docs.aws.amazon.com/ivs/latest/LowLatencyAPIReference/Welcome.html`
- Amazon IVS Getting Started guide: `https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/getting-started.html`
- Amazon IVS private channels guide: `https://docs.aws.amazon.com/ivs/latest/userguide/private-channels.html`
- Amazon IVS timed metadata guide: `https://docs.aws.amazon.com/ivs/latest/userguide/metadata.html`
- Amazon IVS channel types reference: `https://docs.aws.amazon.com/ivs/latest/LowLatencyAPIReference/channel-types.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
