---
name: types
description: "Shared AWS SDK for JavaScript v3 type definitions for credentials, middleware, paginators, waiters, and response metadata."
metadata:
  languages: "javascript"
  versions: "3.973.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,javascript,typescript,sdk,types,middleware,credentials"
---

# `@aws-sdk/types`

Use `@aws-sdk/types` when you need the shared TypeScript contracts behind AWS SDK for JavaScript v3 clients. Most application code does not need to install it directly because service clients already depend on it transitively. Install it yourself when you are writing typed helpers, custom credential providers, middleware, paginator helpers, or waiter wrappers around AWS SDK clients.

This package is mostly a type surface. In practice, import its contracts with `import type` and pair them with a real AWS client such as `@aws-sdk/client-s3`.

## Install

```bash
npm install @aws-sdk/types @aws-sdk/client-s3
```

If you need to inspect or mutate low-level HTTP requests inside middleware, also install the Smithy runtime HTTP package:

```bash
npm install @smithy/protocol-http
```

Package metadata declares Node.js `>=18.0.0`.

## Environment and AWS credentials

For local development, set a region and whatever credentials your AWS account setup requires:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
AWS_S3_BUCKET=my-bucket
```

If you already use the default AWS credential chain in Node.js, you can usually omit the explicit `credentials` field and let the client resolve credentials from environment variables, shared config files, ECS, EC2 instance metadata, or IAM Identity Center.

## Initialize a client with typed credentials

The most common direct use of `@aws-sdk/types` is typing credential objects and providers.

```ts
import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import type {
  AwsCredentialIdentity,
  AwsCredentialIdentityProvider,
} from "@aws-sdk/types";

const staticCredentials: AwsCredentialIdentity = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  sessionToken: process.env.AWS_SESSION_TOKEN,
};

const credentials: AwsCredentialIdentityProvider = async () => staticCredentials;

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials,
});

const response = await s3.send(new ListBucketsCommand({}));

for (const bucket of response.Buckets ?? []) {
  console.log(bucket.Name);
}
```

If your credentials expire, include `expiration` on the returned identity and make your provider refresh before it expires.

## Type custom middleware safely

`@aws-sdk/types` exports middleware contracts such as `FinalizeRequestMiddleware`, `HandlerExecutionContext`, and `MetadataBearer`. The request and response objects inside middleware are typed as `unknown`, so use a concrete runtime guard before reading or mutating them.

```ts
import { randomUUID } from "node:crypto";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import type {
  FinalizeRequestMiddleware,
  MetadataBearer,
} from "@aws-sdk/types";
import { HttpRequest } from "@smithy/protocol-http";

const addTraceHeader: FinalizeRequestMiddleware<any, MetadataBearer> =
  (next, context) => async (args) => {
    if (HttpRequest.isInstance(args.request)) {
      args.request.headers["x-trace-id"] = randomUUID();
    }

    context.logger?.info?.(`sending ${context.commandName ?? "AWS command"}`);
    return next(args);
  };

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

s3.middlewareStack.add(addTraceHeader, {
  step: "finalizeRequest",
  name: "addTraceHeader",
});

await s3.send(
  new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET!,
  }),
);
```

Use the middleware step that matches what you are changing:

- `initialize`: derive or normalize command input.
- `serialize`: act before the input becomes a concrete request.
- `build`: add stable request details that should survive retries.
- `finalizeRequest`: sign or add hop-by-hop request details right before send.
- `deserialize`: inspect the raw response and final output.

## Type paginator and waiter helpers

Generated AWS SDK clients already provide paginator and waiter functions. `@aws-sdk/types` is useful when you want to type config objects that wrap those helpers.

```ts
import {
  paginateListObjectsV2,
  S3Client,
  waitUntilBucketExists,
} from "@aws-sdk/client-s3";
import type {
  PaginationConfiguration,
  WaiterConfiguration,
} from "@aws-sdk/types";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const bucket = process.env.AWS_S3_BUCKET!;

const pagination: PaginationConfiguration = {
  client: s3,
  pageSize: 1000,
};

for await (const page of paginateListObjectsV2(pagination, { Bucket: bucket })) {
  for (const object of page.Contents ?? []) {
    console.log(object.Key);
  }
}

const waiter: WaiterConfiguration<S3Client> = {
  client: s3,
  maxWaitTime: 60,
  abortSignal: AbortSignal.timeout(65_000),
};

await waitUntilBucketExists(waiter, { Bucket: bucket });
```

`WaiterConfiguration.maxWaitTime` is required and expressed in seconds. Prefer `abortSignal` over the older `abortController` property.

## Read response metadata consistently

Every generated AWS SDK v3 command output implements `MetadataBearer`, which gives you access to request IDs, HTTP status, retry attempts, and retry delay.

```ts
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { MetadataBearer } from "@aws-sdk/types";

function logAwsMetadata(output: MetadataBearer) {
  console.log({
    httpStatusCode: output.$metadata.httpStatusCode,
    requestId: output.$metadata.requestId,
    attempts: output.$metadata.attempts,
    totalRetryDelay: output.$metadata.totalRetryDelay,
  });
}

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const output = await s3.send(
  new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: "example.txt",
  }),
);

logAwsMetadata(output);
```

## Common pitfalls

- Use `import type` for `@aws-sdk/types` imports whenever possible. Most commonly used exports are type definitions rather than runtime utilities.
- Prefer `AwsCredentialIdentity` and `AwsCredentialIdentityProvider`. The older `Credentials` and `CredentialProvider` aliases are deprecated.
- Prefer `TokenIdentity` over the older deprecated `Token` alias.
- Do not assume middleware `args.request` or `result.response` already has a concrete HTTP class. Guard them with runtime helpers such as `HttpRequest.isInstance()` or `HttpResponse.isInstance()` from `@smithy/protocol-http`.
- Do not use this package as a replacement for a service client. It does not give you `S3Client`, `DynamoDBClient`, or command classes.
- Prefer `EndpointV2`-style endpoint typing when you need endpoint types. The older `Endpoint` interface is deprecated.

## Version notes

- This guide covers `@aws-sdk/types` version `3.973.5`.
- The package depends on `@smithy/types` and re-exports much of that public type surface.
- If you are only writing normal AWS service calls, install the specific `@aws-sdk/client-*` package you need and treat `@aws-sdk/types` as an implementation detail.
