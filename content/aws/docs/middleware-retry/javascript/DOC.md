---
name: middleware-retry
description: "AWS SDK for JavaScript v3 retry middleware package for configuring max attempts, retry mode, and explicit retry strategies on AWS clients."
metadata:
  languages: "javascript"
  versions: "3.374.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,javascript,nodejs,sdk,retry,middleware"
---

# `@aws-sdk/middleware-retry`

Use `@aws-sdk/middleware-retry` when you need to control how an AWS SDK for JavaScript v3 client retries failed requests. In most apps, the simplest path is setting `maxAttempts` or `retryMode` on the client config. Import this package directly when you want to pass an explicit retry strategy instance.

AWS SDK v3 clients already include retry handling by default. This package is mainly for configuration, not for manually attaching retry middleware in normal application code.

## Install

```bash
npm install @aws-sdk/middleware-retry @aws-sdk/client-sts
```

`@aws-sdk/client-sts` is only here as a concrete client for the examples. Use the same retry configuration with other AWS SDK v3 clients such as S3, DynamoDB, or SQS.

## Retry Configuration Sources

The SDK can resolve retry settings from explicit client config, environment variables, or the shared AWS config file.

Typical shell setup:

```bash
export AWS_REGION=us-east-1
export AWS_RETRY_MODE=standard
export AWS_MAX_ATTEMPTS=4
```

Shared AWS config file:

```ini
[default]
region = us-east-1
retry_mode = standard
max_attempts = 4
```

Important defaults and precedence:

- Default retry mode is `standard`.
- Default max attempts is `3`.
- `AWS_RETRY_MODE` maps to shared config key `retry_mode`.
- `AWS_MAX_ATTEMPTS` maps to shared config key `max_attempts`.
- Explicit client config wins over environment variables and shared config.

## Basic Client Setup

For most applications, set `maxAttempts` directly on the client.

```javascript
import {
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";

const client = new STSClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  maxAttempts: 4,
});

const response = await client.send(new GetCallerIdentityCommand({}));

console.log(response.Account);
console.log(response.Arn);
```

This keeps the SDK's built-in retry behavior and only changes the attempt limit.

## Choose a Retry Mode

The two retry modes exposed through client config are `standard` and `adaptive`.

### Standard mode

`standard` is the default and is the safest choice unless you have a specific reason to change it.

```javascript
import { STSClient } from "@aws-sdk/client-sts";

const client = new STSClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  retryMode: "standard",
  maxAttempts: 4,
});
```

### Adaptive mode

Use `adaptive` when you want the SDK to resolve to `AdaptiveRetryStrategy` instead of the standard strategy.

```javascript
import { STSClient } from "@aws-sdk/client-sts";

const client = new STSClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  retryMode: "adaptive",
  maxAttempts: 6,
});
```

When `retryMode` resolves to `adaptive`, the retry config resolver creates `AdaptiveRetryStrategy`. Otherwise it creates `StandardRetryStrategy`.

## Pass an Explicit Retry Strategy

Use an explicit strategy object when the calling code needs to choose the strategy directly rather than through `retryMode`.

### `StandardRetryStrategy`

```javascript
import {
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { StandardRetryStrategy } from "@aws-sdk/middleware-retry";

const client = new STSClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  retryStrategy: new StandardRetryStrategy(async () => 5),
});

await client.send(new GetCallerIdentityCommand({}));
```

The constructor takes a provider function for the maximum attempt count.

### `AdaptiveRetryStrategy`

```javascript
import {
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { AdaptiveRetryStrategy } from "@aws-sdk/middleware-retry";

const client = new STSClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  retryStrategy: new AdaptiveRetryStrategy(async () => 6),
});

await client.send(new GetCallerIdentityCommand({}));
```

## Important Behavior

- Prefer `maxAttempts` for normal application code. AWS's retry utilities recommend this over replacing the whole strategy when you only need to change the attempt count.
- If you set both `maxAttempts` and `retryStrategy`, the explicit `retryStrategy` takes precedence.
- `AWS_MAX_ATTEMPTS` must parse as a number. Invalid values in the environment or shared config cause configuration loading to fail.
- `getRetryPlugin`, `retryMiddleware`, and `omitRetryHeadersMiddleware` are internal helpers. Do not build application code against them.

## Version Note

Current AWS-maintained Smithy retry packages also expose equivalent retry configuration through `@smithy/middleware-retry` and point advanced backoff customization to `@smithy/util-retry`. If your application is pinned to `@aws-sdk/middleware-retry`, the practical client-level patterns remain the same: use `maxAttempts`, `retryMode`, or an explicit retry strategy instance.
