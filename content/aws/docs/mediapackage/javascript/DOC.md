---
name: mediapackage
description: "AWS SDK for JavaScript v3 client for managing AWS Elemental MediaPackage channels, origin endpoints, ingest credentials, and related settings"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,mediapackage,javascript,nodejs,streaming,video,hls,dash,cmaf"
---

# `@aws-sdk/client-mediapackage`

Use `@aws-sdk/client-mediapackage` to create and manage AWS Elemental MediaPackage channels, origin endpoints, access controls, log configuration, and ingest credential rotation from JavaScript or TypeScript.

This package manages MediaPackage resources in AWS. It does not upload, encode, or package media locally. Your encoder pushes a live stream to the ingest URLs that MediaPackage creates for a channel.

## Golden Rules

- Set `region` deliberately. MediaPackage channels, endpoints, and harvest jobs are region-scoped.
- Choose stable IDs up front. Channel IDs, origin endpoint IDs, and harvest job IDs must be unique within a region and cannot be changed after creation.
- Treat the returned ingest credentials as secrets. `CreateChannelCommand` and `DescribeChannelCommand` return WebDAV ingest usernames and passwords.
- Lock down playback explicitly when needed with `Authorization`, `Whitelist`, and `Origination` on origin endpoints.
- Configure the packaging block you actually need on the origin endpoint, such as `HlsPackage`, `DashPackage`, `CmafPackage`, or `MssPackage`.

## Install

```bash
npm install @aws-sdk/client-mediapackage
```

If you want to force a named shared profile in code:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-mediapackage@3.1007.0`.

## Prerequisites And Authentication

MediaPackage requests need AWS credentials and a region. Common local-development variables:

```bash
export AWS_PROFILE="media"
export AWS_REGION="us-west-2"

export AWS_MEDIAPACKAGE_CHANNEL_ID="sportschannel"
export AWS_MEDIAPACKAGE_ENDPOINT_ID="sports-hls"

export AWS_MEDIAPACKAGE_CDN_SECRET_ARN="arn:aws:secretsmanager:us-west-2:123456789012:secret:mediapackage/cdn"
export AWS_MEDIAPACKAGE_SECRETS_ROLE_ARN="arn:aws:iam::123456789012:role/MediaPackageSecretsRole"

export AWS_MEDIAPACKAGE_INGRESS_LOG_GROUP="/aws/mediapackage/ingress"
export AWS_MEDIAPACKAGE_EGRESS_LOG_GROUP="/aws/mediapackage/egress"
```

In Node.js, AWS SDK v3 usually resolves credentials from the default provider chain, including environment variables, shared config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

## Client Setup

### Minimal client

```javascript
import { MediaPackageClient } from "@aws-sdk/client-mediapackage";

export const mediaPackage = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

### Named shared profile with `fromIni`

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { MediaPackageClient } from "@aws-sdk/client-mediapackage";

export const mediaPackage = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "media" }),
});
```

### Small helper for required environment variables

```javascript
function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}
```

## Create A Channel

`CreateChannelCommand` requires an `Id`. The response includes `HlsIngest.IngestEndpoints`, which contain the ingest URLs and generated WebDAV credentials for your encoder.

```javascript
import {
  CreateChannelCommand,
  MediaPackageClient,
} from "@aws-sdk/client-mediapackage";

const client = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const channel = await client.send(
  new CreateChannelCommand({
    Id: required("AWS_MEDIAPACKAGE_CHANNEL_ID"),
    Description: "24x7 sports feed",
    Tags: {
      environment: "dev",
      workload: "live-streaming",
    },
  }),
);

for (const ingest of channel.HlsIngest?.IngestEndpoints ?? []) {
  console.log({
    id: ingest.Id,
    url: ingest.Url,
    username: ingest.Username,
    password: ingest.Password,
  });
}
```

If the channel already exists, use `DescribeChannelCommand` to re-read the current ingest endpoints:

```javascript
import {
  DescribeChannelCommand,
  MediaPackageClient,
} from "@aws-sdk/client-mediapackage";

const client = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const channel = await client.send(
  new DescribeChannelCommand({
    Id: required("AWS_MEDIAPACKAGE_CHANNEL_ID"),
  }),
);

console.log(channel.HlsIngest?.IngestEndpoints ?? []);
```

## Create An Origin Endpoint

An origin endpoint attaches packaging and playback settings to a channel. `CreateOriginEndpointCommand` requires `ChannelId` and `Id`.

This example creates an HLS endpoint and returns the playback URL in `endpoint.Url`:

```javascript
import {
  CreateOriginEndpointCommand,
  MediaPackageClient,
} from "@aws-sdk/client-mediapackage";

const client = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const endpoint = await client.send(
  new CreateOriginEndpointCommand({
    ChannelId: required("AWS_MEDIAPACKAGE_CHANNEL_ID"),
    Id: required("AWS_MEDIAPACKAGE_ENDPOINT_ID"),
    Description: "Public HLS playback",
    ManifestName: "index",
    Origination: "ALLOW",
    StartoverWindowSeconds: 300,
    TimeDelaySeconds: 0,
    HlsPackage: {
      PlaylistType: "EVENT",
      PlaylistWindowSeconds: 60,
      ProgramDateTimeIntervalSeconds: 0,
      SegmentDurationSeconds: 6,
      IncludeIframeOnlyStream: false,
      UseAudioRenditionGroup: false,
    },
  }),
);

console.log(endpoint.Url);
```

If you use CMAF, MediaPackage exposes HLS manifest URLs under `CmafPackage.HlsManifests`. In the AWS CLI example for `create-origin-endpoint`, the top-level `Url` is empty while `CmafPackage.HlsManifests[].Url` contains the playable manifest URL.

```javascript
import {
  CreateOriginEndpointCommand,
  MediaPackageClient,
} from "@aws-sdk/client-mediapackage";

const client = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const endpoint = await client.send(
  new CreateOriginEndpointCommand({
    ChannelId: required("AWS_MEDIAPACKAGE_CHANNEL_ID"),
    Id: `${required("AWS_MEDIAPACKAGE_ENDPOINT_ID")}-cmaf`,
    Description: "CMAF output",
    ManifestName: "sports_channel",
    StartoverWindowSeconds: 300,
    TimeDelaySeconds: 10,
    CmafPackage: {
      SegmentDurationSeconds: 2,
      SegmentPrefix: required("AWS_MEDIAPACKAGE_CHANNEL_ID"),
      HlsManifests: [
        {
          Id: "cmaf_sports_endpoint",
          ManifestName: "index",
          AdMarkers: "PASSTHROUGH",
          IncludeIframeOnlyStream: true,
          PlaylistType: "EVENT",
          PlaylistWindowSeconds: 300,
          ProgramDateTimeIntervalSeconds: 300,
        },
      ],
    },
  }),
);

console.log(endpoint.CmafPackage?.HlsManifests?.[0]?.Url ?? null);
```

## Restrict Access To An Endpoint

`UpdateOriginEndpointCommand` lets you control playback access after creation.

- `Origination: "ALLOW"` or `"DENY"` controls whether the endpoint can be requested.
- `Whitelist` accepts source IP CIDR blocks.
- `Authorization` uses a Secrets Manager secret ARN plus an IAM role ARN that lets MediaPackage read the secret.

```javascript
import {
  MediaPackageClient,
  UpdateOriginEndpointCommand,
} from "@aws-sdk/client-mediapackage";

const client = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const endpoint = await client.send(
  new UpdateOriginEndpointCommand({
    Id: required("AWS_MEDIAPACKAGE_ENDPOINT_ID"),
    Origination: "ALLOW",
    Whitelist: ["203.0.113.0/24", "198.51.100.10/32"],
    Authorization: {
      CdnIdentifierSecret: required("AWS_MEDIAPACKAGE_CDN_SECRET_ARN"),
      SecretsRoleArn: required("AWS_MEDIAPACKAGE_SECRETS_ROLE_ARN"),
    },
  }),
);

console.log(endpoint.Authorization);
```

## Rotate Ingest Credentials

If an encoder credential leaks or you are rotating secrets during maintenance, use `RotateIngestEndpointCredentialsCommand`. It requires the channel `Id` and the specific `IngestEndpointId`.

```javascript
import {
  DescribeChannelCommand,
  MediaPackageClient,
  RotateIngestEndpointCredentialsCommand,
} from "@aws-sdk/client-mediapackage";

const client = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const current = await client.send(
  new DescribeChannelCommand({
    Id: required("AWS_MEDIAPACKAGE_CHANNEL_ID"),
  }),
);

const ingestEndpointId = current.HlsIngest?.IngestEndpoints?.[0]?.Id;

if (!ingestEndpointId) {
  throw new Error("No ingest endpoint found on the channel.");
}

const rotated = await client.send(
  new RotateIngestEndpointCredentialsCommand({
    Id: required("AWS_MEDIAPACKAGE_CHANNEL_ID"),
    IngestEndpointId: ingestEndpointId,
  }),
);

console.log(rotated.HlsIngest?.IngestEndpoints ?? []);
```

The response is the updated channel object, so re-read the returned `Username` and `Password` before reconnecting your encoder.

## Configure Access Logs

`ConfigureLogsCommand` sets CloudWatch log group names for ingress and egress access logs on a channel.

```javascript
import {
  ConfigureLogsCommand,
  MediaPackageClient,
} from "@aws-sdk/client-mediapackage";

const client = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new ConfigureLogsCommand({
    Id: required("AWS_MEDIAPACKAGE_CHANNEL_ID"),
    IngressAccessLogs: {
      LogGroupName: required("AWS_MEDIAPACKAGE_INGRESS_LOG_GROUP"),
    },
    EgressAccessLogs: {
      LogGroupName: required("AWS_MEDIAPACKAGE_EGRESS_LOG_GROUP"),
    },
  }),
);
```

## List And Tag Resources

Most list operations use `MaxResults` and `NextToken` for pagination.

```javascript
import {
  ListChannelsCommand,
  ListOriginEndpointsCommand,
  ListTagsForResourceCommand,
  MediaPackageClient,
  TagResourceCommand,
} from "@aws-sdk/client-mediapackage";

const client = new MediaPackageClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const { Channels, NextToken } = await client.send(
  new ListChannelsCommand({
    MaxResults: 20,
  }),
);

console.log(Channels?.map((channel) => channel.Id) ?? [], NextToken ?? null);

const endpoints = await client.send(
  new ListOriginEndpointsCommand({
    ChannelId: required("AWS_MEDIAPACKAGE_CHANNEL_ID"),
    MaxResults: 20,
  }),
);

const channelArn = Channels?.[0]?.Arn;

if (channelArn) {
  await client.send(
    new TagResourceCommand({
      ResourceArn: channelArn,
      Tags: {
        owner: "video-platform",
      },
    }),
  );

  const tags = await client.send(
    new ListTagsForResourceCommand({
      ResourceArn: channelArn,
    }),
  );

  console.log(tags.Tags ?? {});
}

console.log(endpoints.OriginEndpoints?.map((endpoint) => endpoint.Id) ?? []);
```

## Harvest Jobs

If you use MediaPackage live-to-VOD harvesting, the client exposes `CreateHarvestJobCommand`, `ListHarvestJobsCommand`, and `DescribeHarvestJobCommand`.

`CreateHarvestJobCommand` requires:

- `Id`
- `OriginEndpointId`
- `StartTime`
- `EndTime`
- `S3Destination.BucketName`
- `S3Destination.ManifestKey`
- `S3Destination.RoleArn`

## Important Pitfalls

- `CreateChannelCommand` returns ingest credentials immediately. Store them securely and expect your encoder configuration to depend on them.
- `CreateOriginEndpointCommand` can return different URL shapes depending on the packaging mode. For CMAF, inspect `CmafPackage.HlsManifests[].Url` instead of assuming `Url` is populated.
- `RotateIngestEndpointCredentialsCommand` changes the targeted ingest endpoint credentials. Update the encoder before reconnecting.
- `Origination: "DENY"` blocks playback requests even if other access settings look correct.
- `Whitelist` expects CIDR blocks, not arbitrary hostnames.
