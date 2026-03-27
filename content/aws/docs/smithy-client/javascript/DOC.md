---
name: smithy-client
description: "Low-level AWS SDK for JavaScript v3 Smithy runtime for building custom clients, commands, and middleware stacks."
metadata:
  languages: "javascript"
  versions: "3.374.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,javascript,smithy,sdk,client,commands,middleware"
---

# `@aws-sdk/smithy-client`

Use `@aws-sdk/smithy-client` when you are building a low-level custom client or command on top of the AWS SDK for JavaScript v3 runtime.

Most application code should **not** install this package directly. If you are calling AWS services such as S3, DynamoDB, or STS, install the relevant `@aws-sdk/client-*` package instead. Reach for `@aws-sdk/smithy-client` when you need to define your own `Client`, `Command`, middleware stack behavior, or generated-style convenience methods.

## Install

For a custom Node.js client, install the Smithy runtime pieces you need explicitly:

```bash
npm install @aws-sdk/smithy-client@3.374.0 @aws-sdk/node-http-handler @aws-sdk/protocol-http @aws-sdk/middleware-serde
```

If the endpoint is an AWS-authenticated endpoint, also install credential and signing support:

```bash
npm install @aws-sdk/credential-provider-node @aws-sdk/middleware-signing @aws-crypto/sha256-js
```

## Environment and credentials

For local development, set an endpoint and, if the endpoint requires AWS SigV4 signing, the usual AWS region and credentials:

```env
SMITHY_ENDPOINT=https://example.execute-api.us-east-1.amazonaws.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
AWS_PROFILE=default
```

`SMITHY_ENDPOINT` is the main package-specific input. The AWS credential variables are only needed when the target endpoint expects signed AWS requests.

## Initialize a custom client

`Client` gives you the shared middleware stack and the `send()` method. At minimum, provide a request handler, an endpoint provider, and an internal API version string.

```javascript
import { Client, NoOpLogger } from "@aws-sdk/smithy-client";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";

export class ExampleClient extends Client {
  constructor(input = {}) {
    const endpointUrl = new URL(
      input.endpoint ?? process.env.SMITHY_ENDPOINT ?? "http://localhost:3000",
    );

    super({
      ...input,
      apiVersion: "2023-01-01",
      requestHandler: input.requestHandler ?? new NodeHttpHandler(),
      logger: input.logger ?? new NoOpLogger(),
      endpoint: async () => ({
        protocol: endpointUrl.protocol,
        hostname: endpointUrl.hostname,
        port: endpointUrl.port ? Number(endpointUrl.port) : undefined,
        path: endpointUrl.pathname,
      }),
    });
  }
}
```

When you are done with a Node.js client, call `client.destroy()` to release the underlying HTTP handler resources.

## Define and send a custom command

Commands attach their own middleware to the shared client stack. For a normal HTTP command, add the serde plugin and implement `serialize()` and `deserialize()`.

```javascript
import { Command } from "@aws-sdk/smithy-client";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { HttpRequest, HttpResponse } from "@aws-sdk/protocol-http";

export class PingCommand extends Command {
  constructor(input = {}) {
    super();
    this.input = input;
  }

  resolveMiddleware(clientStack, configuration, options) {
    this.middlewareStack.use(
      getSerdePlugin(configuration, this.serialize, this.deserialize),
    );

    return this.resolveMiddlewareWithContext(clientStack, configuration, options, {
      middlewareFn: () => [],
      clientName: "ExampleClient",
      commandName: "PingCommand",
      inputFilterSensitiveLog: (value) => value,
      outputFilterSensitiveLog: (value) => value,
      smithyContext: {
        service: "ExampleService",
        operation: "Ping",
      },
      additionalContext: {},
      CommandCtor: PingCommand,
    });
  }

  async serialize(input, context) {
    const endpoint = await context.endpoint();
    const basePath = endpoint.path?.replace(/\/$/, "") ?? "";

    return new HttpRequest({
      protocol: endpoint.protocol,
      hostname: endpoint.hostname,
      port: endpoint.port,
      method: "GET",
      path: `${basePath}/ping`,
      headers: {
        host: endpoint.hostname,
      },
    });
  }

  async deserialize(response) {
    if (!HttpResponse.isInstance(response)) {
      throw new Error("Expected an HttpResponse");
    }

    return {
      $metadata: {
        httpStatusCode: response.statusCode,
      },
      ok: response.statusCode === 200,
    };
  }
}
```

Use the client and command together with `send()`:

```javascript
import { ExampleClient } from "./example-client.js";
import { PingCommand } from "./ping-command.js";

const client = new ExampleClient({
  endpoint: process.env.SMITHY_ENDPOINT,
});

const output = await client.send(new PingCommand({}));

console.log(output.ok);
console.log(output.$metadata.httpStatusCode);

client.destroy();
```

## Add AWS SigV4 signing

`@aws-sdk/smithy-client` does not resolve credentials or sign requests by itself. If your custom client calls an AWS-authenticated endpoint, layer signing middleware into the client configuration.

```javascript
import { Client, NoOpLogger } from "@aws-sdk/smithy-client";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import {
  getAwsAuthPlugin,
  resolveAwsAuthConfig,
} from "@aws-sdk/middleware-signing";
import { Sha256 } from "@aws-crypto/sha256-js";

export class ExampleAwsClient extends Client {
  constructor(input = {}) {
    const endpointUrl = new URL(input.endpoint ?? process.env.SMITHY_ENDPOINT);
    const region = input.region ?? process.env.AWS_REGION ?? "us-east-1";

    const config = resolveAwsAuthConfig({
      ...input,
      apiVersion: "2023-01-01",
      requestHandler: input.requestHandler ?? new NodeHttpHandler(),
      logger: input.logger ?? new NoOpLogger(),
      endpoint: async () => ({
        protocol: endpointUrl.protocol,
        hostname: endpointUrl.hostname,
        port: endpointUrl.port ? Number(endpointUrl.port) : undefined,
        path: endpointUrl.pathname,
      }),
      region: async () => region,
      credentials: input.credentials ?? defaultProvider(),
      sha256: Sha256,
      signingName: input.signingName ?? "execute-api",
      signingRegion: input.signingRegion ?? (async () => region),
    });

    super(config);
    this.middlewareStack.use(getAwsAuthPlugin(config));
  }
}
```

Set `signingName` to the SigV4 service name expected by the target endpoint. For example, API Gateway commonly uses `execute-api`.

## Add generated-style convenience methods

`createAggregatedClient()` adds convenience methods to a client prototype by turning command class names into lower-camel-case methods and stripping the `Command` suffix.

```javascript
import { createAggregatedClient } from "@aws-sdk/smithy-client";
import { ExampleClient } from "./example-client.js";
import { PingCommand } from "./ping-command.js";

createAggregatedClient({ PingCommand }, ExampleClient);

const client = new ExampleClient({
  endpoint: process.env.SMITHY_ENDPOINT,
});

const output = await client.ping({});
console.log(output.ok);

client.destroy();
```

This matches how generated AWS SDK clients expose methods such as `client.listTables()` in addition to `client.send(new ListTablesCommand(...))`.

## Handle service exceptions

The package exports `ServiceException`, which gives you a consistent base shape for modeled or decorated service-side errors.

```javascript
import { ServiceException } from "@aws-sdk/smithy-client";

try {
  await client.send(new PingCommand({}));
} catch (error) {
  if (ServiceException.isInstance(error)) {
    console.error(error.name);
    console.error(error.$metadata.httpStatusCode);
  }

  throw error;
}
```

## Common pitfalls

- Do not use this package instead of a real `@aws-sdk/client-*` service client unless you are intentionally building custom Smithy runtime code.
- Do not forget to attach `getSerdePlugin(...)` inside each command's `resolveMiddleware()`; without it, `serialize()` and `deserialize()` are not wired into the stack.
- Do not assume requests are automatically signed. Add `@aws-sdk/middleware-signing` and a credential provider when the endpoint requires AWS SigV4 auth.
- If you enable `cacheMiddleware: true`, middleware resolution is cached per command class. Middleware changes made after the first request are not picked up until you create a new client or clear the cache with `destroy()`.
- Call `client.destroy()` when using Node.js request handlers so sockets and related resources can be released.

## Version notes

- This guide covers `@aws-sdk/smithy-client` version `3.374.0`.
- The most important public runtime pieces are `Client`, `Command`, `createAggregatedClient`, `NoOpLogger`, and the Smithy exception helpers.
- Keep companion runtime packages on the same AWS SDK v3 family when following examples for this package version.

## Official sources

- AWS SDK for JavaScript v3 package reference: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-smithy-client/
- npm package page: https://www.npmjs.com/package/@aws-sdk/smithy-client
