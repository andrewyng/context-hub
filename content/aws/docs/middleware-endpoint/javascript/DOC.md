---
name: middleware-endpoint
description: "AWS SDK for JavaScript v3 endpoint resolution middleware for custom clients and endpoint-aware service configuration"
metadata:
  languages: "javascript"
  versions: "3.374.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,aws-sdk,javascript,endpoints,middleware"
---

# `@aws-sdk/middleware-endpoint`

`@aws-sdk/middleware-endpoint` is the AWS SDK for JavaScript v3 middleware that resolves which endpoint a request should use. In normal application code, you usually consume it indirectly through a service client such as `@aws-sdk/client-s3`. Install and import it directly only when you are building or extending a custom Smithy/AWS client stack.

## When to Use It Directly

Use this package directly when you need to:

- add endpoint resolution to a custom client or middleware stack
- resolve built-in endpoint settings like `region`, `endpoint`, `useFipsEndpoint`, and `useDualstackEndpoint`
- attach the standard endpoint plugin with `getEndpointPlugin(...)`

If you are writing regular application code against AWS services, prefer configuring the service client and let that client add this middleware for you.

## Installation

Install the middleware package directly only if you are wiring a custom client:

```bash
npm install @aws-sdk/middleware-endpoint
```

For typical app code, install the service client you actually call. Example with S3:

```bash
npm install @aws-sdk/client-s3
```

## Credentials and Region

This package does not authenticate requests by itself. Your service client or custom stack still needs AWS credentials and a region for SigV4 signing.

Common environment variables:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SESSION_TOKEN=your-session-token
```

If you use a generated AWS client in Node.js, the standard AWS credential provider chain can load credentials from environment variables, shared config, IAM roles, and other supported sources.

## Common App Usage: Configure the Service Client

Most users should configure endpoint behavior on the service client and not import `@aws-sdk/middleware-endpoint` directly.

### Default AWS Endpoint Resolution

```javascript
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(new ListBucketsCommand({}));
console.log(response.Buckets ?? []);
```

### Override the Endpoint

Use `endpoint` when you need a fixed host, such as LocalStack or another S3-compatible endpoint.

```javascript
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT ?? "http://localhost:4566",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
  },
});

const response = await client.send(new ListBucketsCommand({}));
console.log(response.Buckets ?? []);
```

Even with a custom endpoint, keep `region` configured so request signing works correctly.

### Enable FIPS or Dual-Stack Endpoints

When a service supports these endpoint variants, set them on the client config:

```javascript
import { S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  useFipsEndpoint: true,
  useDualstackEndpoint: true,
});
```

Support for FIPS, dual-stack, or a specific combination depends on the service and region endpoint rules.

## Direct Package API

If you are building a custom client stack, the two main entry points are `resolveEndpointConfig(...)` and `getEndpointPlugin(...)`.

```javascript
import {
  getEndpointPlugin,
  resolveEndpointConfig,
} from "@aws-sdk/middleware-endpoint";

const endpointParameterInstructions = {
  Region: { type: "builtInParams", name: "region" },
  Endpoint: { type: "builtInParams", name: "endpoint" },
  UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
  UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
};

const resolvedConfig = resolveEndpointConfig({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.CUSTOM_ENDPOINT,
  useFipsEndpoint: false,
  useDualstackEndpoint: false,
});

middlewareStack.use(
  getEndpointPlugin(resolvedConfig, endpointParameterInstructions)
);
```

Use this pattern inside a client or command implementation that already has a Smithy-compatible `middlewareStack`. Generated AWS SDK v3 clients already do this internally.

## Practical Rules

- Install a service client such as `@aws-sdk/client-s3` for normal application code.
- Install `@aws-sdk/middleware-endpoint` directly only when you are authoring client infrastructure.
- Set `endpoint` when you need a fixed host override.
- Set `useFipsEndpoint` and `useDualstackEndpoint` on the client config when the target service supports them.
- Keep `region` configured even when you override `endpoint`.

## Pitfalls

- `@aws-sdk/middleware-endpoint` does not provide service commands like `ListBucketsCommand`; it only resolves endpoints.
- A custom `endpoint` does not replace AWS credentials or region configuration.
- Do not add the endpoint plugin twice to a generated AWS client; generated clients already register it.
- Service-specific endpoint behavior can still require additional client settings outside this package.
- Unsupported FIPS or dual-stack combinations fail according to the service's endpoint rules.
