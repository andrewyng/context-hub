---
name: middleware-signing
description: "AWS SDK for JavaScript v3 signing middleware for attaching SigV4 auth to custom Smithy client stacks."
metadata:
  languages: "javascript"
  versions: "3.972.7"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,javascript,aws-sdk,smithy,middleware,signing,sigv4,credentials"
---

# `@aws-sdk/middleware-signing`

Use this package when you are building a custom AWS SDK for JavaScript v3 or Smithy-based client and need AWS SigV4 request signing added to the middleware stack.

Most application code should not install this package directly. Generated `@aws-sdk/client-*` packages already wire request signing into their client stacks. Reach for `@aws-sdk/middleware-signing` when you are composing your own client, replacing signing behavior, or attaching AWS auth to a custom middleware stack.

## Install

Install the package plus the pieces needed for credentials and hashing:

```bash
npm install @aws-sdk/middleware-signing@3.972.7 @aws-sdk/credential-providers @aws-crypto/sha256-js @smithy/smithy-client
```

This package does not create AWS service clients on its own. It only installs signing middleware.

## Environment and credentials

For local development, set region and credentials the same way you would for other AWS SDK v3 code:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
AWS_PROFILE=default
```

In Node.js, you can usually let the default credential chain resolve credentials from environment variables, shared AWS config, ECS, EC2, or IAM Identity Center.

## Add signing middleware to a custom client

`resolveAwsAuthConfig()` normalizes the auth configuration, and `getAwsAuthPlugin()` installs the signing middleware on the client stack.

```javascript
import { Client as SmithyClient } from "@smithy/smithy-client";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import {
  getAwsAuthPlugin,
  resolveAwsAuthConfig,
} from "@aws-sdk/middleware-signing";
import { Sha256 } from "@aws-crypto/sha256-js";

class ExampleAwsClient extends SmithyClient {
  constructor(input = {}) {
    const region = input.region ?? process.env.AWS_REGION ?? "us-east-1";

    const config = resolveAwsAuthConfig({
      ...input,
      region: async () => region,
      credentials: input.credentials ?? fromNodeProviderChain(),
      sha256: Sha256,
      signingName: input.signingName ?? "execute-api",
      signingRegion: input.signingRegion ?? (async () => region),
    });

    super(config);
    this.middlewareStack.use(getAwsAuthPlugin(config));
  }
}

const client = new ExampleAwsClient();
```

Use this pattern inside your own Smithy client constructor after you have decided how region, credentials, and the SigV4 service name should resolve.

## Use an explicit shared-profile credential source

Continuing the `ExampleAwsClient` above, swap in `fromIni()` when the client should sign with a named shared config profile instead of the default chain.

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
 
const client = new ExampleAwsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "default" }),
  signingName: "execute-api",
});
```

Use the same approach with any other AWS credential provider you want to plug into the stack.

## Override the SigV4 service name or signing region

Continuing the same custom client pattern, override `signingName` or `signingRegion` when the endpoint you are calling needs a specific signing identity.

```javascript
const client = new ExampleAwsClient({
  region: "us-east-1",
  signingName: "execute-api",
  signingRegion: async () => "us-west-2",
});
```

`signingName` is the SigV4 service identifier, not the npm package name. Keep it aligned with the AWS service you are calling.

## Important pitfalls

- Most generated `@aws-sdk/client-*` packages already include signing middleware. Do not add this package on top of a generated client unless you are intentionally replacing or overriding auth behavior.
- This package does not serialize commands, create HTTP requests, or send network traffic by itself. Your client still needs a real transport and request serialization layer.
- Credentials and region still must resolve at runtime. Installing the middleware does not load them automatically unless you provide credential and region providers.
- `signingName` must match the SigV4 service name expected by the target service. A wrong value leads to authentication failures even when the credentials are valid.
- Browser code needs browser-safe credential providers such as Cognito-based flows. Do not expose long-lived IAM secrets in frontend code.
- Import from the package root. Do not deep-import package internals from build directories.

## When not to use this package

- If you are calling normal AWS service APIs such as S3, DynamoDB, or STS, install the relevant `@aws-sdk/client-*` package instead.
- If your existing AWS client already signs requests correctly, do not add this middleware just to make a request authenticated.
- If you need a one-off signing primitive rather than a middleware plugin, use a signer package directly instead of rewriting a whole client stack around this middleware.

## Version notes

- This guide covers `@aws-sdk/middleware-signing` version `3.972.7`.
- The maintainer source for this package lives under the AWS SDK for JavaScript v3 repository's internal package tree.
- Treat this package as low-level SDK plumbing: useful for custom integrations, unnecessary for ordinary service-client usage.

## Official sources

- AWS SDK for JavaScript v3 maintainer source: https://github.com/aws/aws-sdk-js-v3/tree/main/packages-internal/middleware-signing
- npm package page: https://www.npmjs.com/package/@aws-sdk/middleware-signing
