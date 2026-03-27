---
name: mediastore
description: "AWS SDK for JavaScript v3 client for creating and managing AWS Elemental MediaStore containers, policies, logging, metrics, and tags"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,mediastore,javascript,nodejs,media,storage,video"
---

# `@aws-sdk/client-mediastore`

Use `@aws-sdk/client-mediastore` for the AWS Elemental MediaStore control plane in JavaScript or TypeScript. This client manages containers and their policies, access logging, metric policies, and tags.

It is not the object data-plane client. The common control-plane flow is:

1. create or locate a container
2. call `DescribeContainerCommand` to get the stable container `Endpoint`
3. manage access policy, CORS, lifecycle, metrics, logging, and tags

## Install

```bash
npm install @aws-sdk/client-mediastore
```

If you want to force a shared AWS profile in code:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-mediastore@3.1007.0`.

## Prerequisites And Authentication

MediaStore requests need AWS credentials and a region. Most operations also need a container name, and tagging operations need the container ARN.

Typical local environment variables:

```bash
export AWS_PROFILE="media"
export AWS_REGION="us-west-2"
export AWS_MEDIASTORE_CONTAINER_NAME="live-events"
```

The SDK can use the default AWS credential chain, or you can provide credentials explicitly.

## Client Setup

### Minimal client

```javascript
import { MediaStoreClient } from "@aws-sdk/client-mediastore";

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

### Use a named shared profile

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { MediaStoreClient } from "@aws-sdk/client-mediastore";

const profile = process.env.AWS_PROFILE;

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  ...(profile ? { credentials: fromIni({ profile }) } : {}),
});
```

## Common Workflows

### Create a container

Container names must be unique to your AWS account within a region.

```javascript
import {
  CreateContainerCommand,
  MediaStoreClient,
} from "@aws-sdk/client-mediastore";

const containerName = process.env.AWS_MEDIASTORE_CONTAINER_NAME;

if (!containerName) {
  throw new Error("Set AWS_MEDIASTORE_CONTAINER_NAME first.");
}

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const { Container } = await client.send(
  new CreateContainerCommand({
    ContainerName: containerName,
    Tags: [
      { Key: "environment", Value: "dev" },
      { Key: "team", Value: "media" },
    ],
  }),
);

console.log(Container?.Name);
console.log(Container?.ARN);
console.log(Container?.Status);
```

`CreateContainerCommand` returns metadata such as `Name`, `ARN`, `Status`, and `AccessLoggingEnabled`, but not the data-plane endpoint. Use `DescribeContainerCommand` next.

### Describe a container and get its endpoint

The container endpoint is assigned by the service and does not change after it is assigned.

```javascript
import {
  DescribeContainerCommand,
  MediaStoreClient,
} from "@aws-sdk/client-mediastore";

const containerName = process.env.AWS_MEDIASTORE_CONTAINER_NAME;

if (!containerName) {
  throw new Error("Set AWS_MEDIASTORE_CONTAINER_NAME first.");
}

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const { Container } = await client.send(
  new DescribeContainerCommand({
    ContainerName: containerName,
  }),
);

console.log("arn:", Container?.ARN);
console.log("status:", Container?.Status);
console.log("endpoint:", Container?.Endpoint);
console.log("access logging:", Container?.AccessLoggingEnabled);
```

Use `Container.Endpoint` for MediaStore object operations on the data plane.

### List containers with pagination

`ListContainersCommand` can return `NextToken`. Do not assume one call returns every container.

```javascript
import {
  ListContainersCommand,
  MediaStoreClient,
} from "@aws-sdk/client-mediastore";

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

let nextToken;

do {
  const response = await client.send(
    new ListContainersCommand({
      MaxResults: 20,
      NextToken: nextToken,
    }),
  );

  for (const container of response.Containers ?? []) {
    console.log(container.Name, container.Status, container.Endpoint);
  }

  nextToken = response.NextToken;
} while (nextToken);
```

### Put and read a container policy

Container policies are JSON documents, but the service model uses a string field for `Policy`. Serialize on write and parse on read.

```javascript
import {
  GetContainerPolicyCommand,
  MediaStoreClient,
  PutContainerPolicyCommand,
} from "@aws-sdk/client-mediastore";

const containerName = process.env.AWS_MEDIASTORE_CONTAINER_NAME;

if (!containerName) {
  throw new Error("Set AWS_MEDIASTORE_CONTAINER_NAME first.");
}

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const policyDocument = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "ReadOverHttps",
      Effect: "Allow",
      Principal: {
        AWS: "arn:aws:iam::123456789012:root",
      },
      Action: ["mediastore:GetObject", "mediastore:DescribeObject"],
      Resource: `arn:aws:mediastore:${process.env.AWS_REGION ?? "us-west-2"}:123456789012:container/${containerName}/*`,
      Condition: {
        Bool: {
          "aws:SecureTransport": "true",
        },
      },
    },
  ],
};

await client.send(
  new PutContainerPolicyCommand({
    ContainerName: containerName,
    Policy: JSON.stringify(policyDocument),
  }),
);

const { Policy } = await client.send(
  new GetContainerPolicyCommand({
    ContainerName: containerName,
  }),
);

const parsedPolicy = Policy ? JSON.parse(Policy) : undefined;

console.log(parsedPolicy);
```

To remove the policy:

```javascript
import {
  DeleteContainerPolicyCommand,
  MediaStoreClient,
} from "@aws-sdk/client-mediastore";

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new DeleteContainerPolicyCommand({
    ContainerName: process.env.AWS_MEDIASTORE_CONTAINER_NAME,
  }),
);
```

### Configure CORS

Each CORS rule needs at least one `AllowedOrigins` value and at least one `AllowedMethods` value. Supported methods are `PUT`, `GET`, `DELETE`, and `HEAD`.

```javascript
import {
  GetCorsPolicyCommand,
  MediaStoreClient,
  PutCorsPolicyCommand,
} from "@aws-sdk/client-mediastore";

const containerName = process.env.AWS_MEDIASTORE_CONTAINER_NAME;

if (!containerName) {
  throw new Error("Set AWS_MEDIASTORE_CONTAINER_NAME first.");
}

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new PutCorsPolicyCommand({
    ContainerName: containerName,
    CorsPolicy: [
      {
        AllowedOrigins: ["https://app.example.com"],
        AllowedMethods: ["GET", "HEAD"],
        AllowedHeaders: ["*"],
        ExposeHeaders: ["ETag"],
        MaxAgeSeconds: 3000,
      },
    ],
  }),
);

const { CorsPolicy } = await client.send(
  new GetCorsPolicyCommand({
    ContainerName: containerName,
  }),
);

console.log(CorsPolicy);
```

To remove the CORS policy:

```javascript
import {
  DeleteCorsPolicyCommand,
  MediaStoreClient,
} from "@aws-sdk/client-mediastore";

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new DeleteCorsPolicyCommand({
    ContainerName: process.env.AWS_MEDIASTORE_CONTAINER_NAME,
  }),
);
```

### Put and read an object lifecycle policy

Lifecycle policies are also passed as strings.

```javascript
import {
  GetLifecyclePolicyCommand,
  MediaStoreClient,
  PutLifecyclePolicyCommand,
} from "@aws-sdk/client-mediastore";

const containerName = process.env.AWS_MEDIASTORE_CONTAINER_NAME;

if (!containerName) {
  throw new Error("Set AWS_MEDIASTORE_CONTAINER_NAME first.");
}

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const lifecyclePolicy = {
  rules: [
    {
      definition: {
        path: [{ prefix: "archive/" }],
        days_since_create: [{ numeric: [">", 30] }],
      },
      action: "EXPIRE",
    },
  ],
};

await client.send(
  new PutLifecyclePolicyCommand({
    ContainerName: containerName,
    LifecyclePolicy: JSON.stringify(lifecyclePolicy),
  }),
);

const { LifecyclePolicy } = await client.send(
  new GetLifecyclePolicyCommand({
    ContainerName: containerName,
  }),
);

const parsedLifecyclePolicy = LifecyclePolicy ? JSON.parse(LifecyclePolicy) : undefined;

console.log(parsedLifecyclePolicy);
```

To remove the lifecycle policy:

```javascript
import {
  DeleteLifecyclePolicyCommand,
  MediaStoreClient,
} from "@aws-sdk/client-mediastore";

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new DeleteLifecyclePolicyCommand({
    ContainerName: process.env.AWS_MEDIASTORE_CONTAINER_NAME,
  }),
);
```

`DeleteLifecyclePolicyCommand` can take up to 20 minutes to take effect.

### Enable metric collection

Metric policies are structured objects, not strings. You must set `ContainerLevelMetrics`, and object-level rules need both `ObjectGroup` and `ObjectGroupName`.

```javascript
import {
  GetMetricPolicyCommand,
  MediaStoreClient,
  PutMetricPolicyCommand,
} from "@aws-sdk/client-mediastore";

const containerName = process.env.AWS_MEDIASTORE_CONTAINER_NAME;

if (!containerName) {
  throw new Error("Set AWS_MEDIASTORE_CONTAINER_NAME first.");
}

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new PutMetricPolicyCommand({
    ContainerName: containerName,
    MetricPolicy: {
      ContainerLevelMetrics: "ENABLED",
      MetricPolicyRules: [
        {
          ObjectGroup: "archive/*",
          ObjectGroupName: "archive_objects",
        },
      ],
    },
  }),
);

const { MetricPolicy } = await client.send(
  new GetMetricPolicyCommand({
    ContainerName: containerName,
  }),
);

console.log(MetricPolicy);
```

To remove the metric policy:

```javascript
import {
  DeleteMetricPolicyCommand,
  MediaStoreClient,
} from "@aws-sdk/client-mediastore";

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new DeleteMetricPolicyCommand({
    ContainerName: process.env.AWS_MEDIASTORE_CONTAINER_NAME,
  }),
);
```

### Start and stop access logging

When access logging is enabled, MediaStore delivers access logs for objects in the container to Amazon CloudWatch Logs.

```javascript
import {
  MediaStoreClient,
  StartAccessLoggingCommand,
  StopAccessLoggingCommand,
} from "@aws-sdk/client-mediastore";

const containerName = process.env.AWS_MEDIASTORE_CONTAINER_NAME;

if (!containerName) {
  throw new Error("Set AWS_MEDIASTORE_CONTAINER_NAME first.");
}

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new StartAccessLoggingCommand({
    ContainerName: containerName,
  }),
);

await client.send(
  new StopAccessLoggingCommand({
    ContainerName: containerName,
  }),
);
```

### Tag a container by ARN

Tagging APIs use the container ARN, not the container name.

```javascript
import {
  ListTagsForResourceCommand,
  MediaStoreClient,
  TagResourceCommand,
  UntagResourceCommand,
} from "@aws-sdk/client-mediastore";

const resourceArn = process.env.AWS_MEDIASTORE_CONTAINER_ARN;

if (!resourceArn) {
  throw new Error("Set AWS_MEDIASTORE_CONTAINER_ARN first.");
}

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new TagResourceCommand({
    Resource: resourceArn,
    Tags: [
      { Key: "environment", Value: "dev" },
      { Key: "owner", Value: "media-team" },
    ],
  }),
);

const { Tags } = await client.send(
  new ListTagsForResourceCommand({
    Resource: resourceArn,
  }),
);

console.log(Tags);

await client.send(
  new UntagResourceCommand({
    Resource: resourceArn,
    TagKeys: ["owner"],
  }),
);
```

### Delete an empty container

You can delete only empty containers. Remove any objects and folders from the container before calling `DeleteContainerCommand`.

```javascript
import {
  DeleteContainerCommand,
  MediaStoreClient,
} from "@aws-sdk/client-mediastore";

const containerName = process.env.AWS_MEDIASTORE_CONTAINER_NAME;

if (!containerName) {
  throw new Error("Set AWS_MEDIASTORE_CONTAINER_NAME first.");
}

const client = new MediaStoreClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await client.send(
  new DeleteContainerCommand({
    ContainerName: containerName,
  }),
);
```

## Practical Notes

- This client covers MediaStore container management. Use the container `Endpoint` for object-level MediaStore operations.
- `GetContainerPolicyCommand` and `GetLifecyclePolicyCommand` return string fields that usually need `JSON.parse(...)` in application code.
- `ListContainersCommand` is paginated via `NextToken`.
- CORS rules are ordered. If more than one rule applies, MediaStore uses the first applicable rule.
- `PutMetricPolicyCommand` requires `ContainerLevelMetrics`. Object-level metric rules are optional, but if you include them each rule needs both `ObjectGroup` and `ObjectGroupName`.
- `StartAccessLoggingCommand` writes MediaStore access logs to CloudWatch Logs.

## Common Pitfalls

- Creating a policy document as an object and passing it directly instead of `JSON.stringify(...)`.
- Using a container name where the API expects a container ARN for tagging.
- Forgetting to read `Container.Endpoint` before making object-level requests.
- Ignoring `NextToken` and only processing the first page of `ListContainersCommand` results.
- Expecting `DeleteContainerCommand` to work before the container is empty.
- Expecting lifecycle policy deletion to take effect immediately.

## Version Notes For `3.1007.0`

- This guide targets `@aws-sdk/client-mediastore@3.1007.0`.
- The AWS SDK for JavaScript v3 docs use a rolling `latest` documentation URL. Pin the npm package version in your app if you need reproducible installs.
- At this version, the control-plane client includes container, policy, CORS, lifecycle, metric, access logging, and tagging operations.

## Official Sources

- AWS SDK for JavaScript v3 MediaStore client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/mediastore/`
- AWS CLI MediaStore command reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/`
- AWS CLI `create-container` reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/create-container.html`
- AWS CLI `describe-container` reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/describe-container.html`
- AWS CLI `list-containers` reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/list-containers.html`
- AWS CLI `put-container-policy` reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/put-container-policy.html`
- AWS CLI `put-cors-policy` reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/put-cors-policy.html`
- AWS CLI `put-lifecycle-policy` reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/put-lifecycle-policy.html`
- AWS CLI `put-metric-policy` reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/put-metric-policy.html`
- AWS CLI `start-access-logging` reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/start-access-logging.html`
- AWS CLI `list-tags-for-resource` reference: `https://docs.aws.amazon.com/cli/latest/reference/mediastore/list-tags-for-resource.html`
