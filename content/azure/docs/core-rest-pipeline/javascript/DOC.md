---
name: core-rest-pipeline
description: "@azure/core-rest-pipeline JavaScript primitives for building low-level HTTP pipelines with policies, retries, auth, and transport customization"
metadata:
  languages: "javascript"
  versions: "1.23.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,core-rest-pipeline,javascript,http,pipeline,policies,retry,auth,transport"
---

# @azure/core-rest-pipeline JavaScript Guide

## Golden Rule

Use `@azure/core-rest-pipeline` when you are building or customizing a low-level HTTP client in the Azure SDK style. Most application code should use a service client such as Storage, Key Vault, or Search instead of constructing raw requests by hand. If you do use this package directly, create the pipeline once, reuse it, and add only the policies your client actually needs.

## Install

Install the pipeline package directly:

```bash
npm install @azure/core-rest-pipeline@1.23.0
```

If you need Microsoft Entra ID bearer tokens, add `@azure/identity` too:

```bash
npm install @azure/core-rest-pipeline@1.23.0 @azure/identity
```

If you want Azure SDK request/response logging, add `@azure/logger` as a direct dependency:

```bash
npm install @azure/core-rest-pipeline@1.23.0 @azure/logger
```

## What This Package Does

The main exports you will usually use are:

- `createPipelineFromOptions(...)`: builds a pipeline with Azure's default policy set
- `createEmptyPipeline()`: starts from a blank pipeline when you want full control
- `createDefaultHttpClient()`: chooses the right HTTP transport for the current runtime
- `createPipelineRequest(...)`: creates a request object with defaults such as method, headers, timeout, and request ID
- `createHttpHeaders(...)`: creates a mutable header collection
- `bearerTokenAuthenticationPolicy(...)`: adds `Authorization: Bearer ...` from a `TokenCredential`
- `RestError` and `isRestError(...)`: catch and inspect pipeline failures consistently

`createPipelineFromOptions(...)` is the right default. It adds the standard user-agent, request ID, multipart/form-data, retry, tracing, and logging policies. In Node-like runtimes it also adds proxy, decompression, TLS, and redirect handling.

## Minimal Setup

Use environment variables for endpoints and credentials:

```bash
export API_BASE_URL="https://management.azure.com"
export ARM_SCOPE="https://management.azure.com/.default"
export ARM_API_VERSION="2020-01-01"

export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

For local development, `DefaultAzureCredential` also works with `az login` instead of service-principal environment variables.

## Core Usage

### Build A Reusable Pipeline And Send A Request

This is the common pattern when you need low-level control but still want Azure SDK retry, headers, and transport behavior:

```js
import {
  createDefaultHttpClient,
  createHttpHeaders,
  createPipelineFromOptions,
  createPipelineRequest,
} from "@azure/core-rest-pipeline";

const apiBaseUrl = process.env.API_BASE_URL;
const apiVersion = process.env.ARM_API_VERSION || "2020-01-01";

if (!apiBaseUrl) {
  throw new Error("API_BASE_URL is required");
}

const pipeline = createPipelineFromOptions({
  userAgentOptions: {
    userAgentPrefix: "my-app/1.0.0",
  },
  retryOptions: {
    maxRetries: 5,
    retryDelayInMs: 1_000,
    maxRetryDelayInMs: 8_000,
  },
  loggingOptions: {
    additionalAllowedQueryParameters: ["api-version"],
  },
});

const httpClient = createDefaultHttpClient();

const request = createPipelineRequest({
  url: `${apiBaseUrl}/subscriptions?api-version=${apiVersion}`,
  method: "GET",
  headers: createHttpHeaders({
    Accept: "application/json",
  }),
});

const response = await pipeline.sendRequest(httpClient, request);

console.log(response.status);
console.log(response.bodyAsText);
```

Reuse the same `pipeline` and `httpClient` across calls instead of recreating them for every request.

### Add Bearer Token Authentication

`createPipelineFromOptions(...)` does not add auth automatically. Add a signing policy explicitly when the target service expects bearer tokens.

```js
import {
  bearerTokenAuthenticationPolicy,
  createDefaultHttpClient,
  createPipelineFromOptions,
  createPipelineRequest,
} from "@azure/core-rest-pipeline";
import { DefaultAzureCredential } from "@azure/identity";

const scope = process.env.ARM_SCOPE || "https://management.azure.com/.default";

const pipeline = createPipelineFromOptions({
  retryOptions: { maxRetries: 3 },
});

pipeline.addPolicy(
  bearerTokenAuthenticationPolicy({
    credential: new DefaultAzureCredential(),
    scopes: [scope],
  }),
  { phase: "Sign" },
);

const request = createPipelineRequest({
  url: "https://management.azure.com/subscriptions?api-version=2020-01-01",
  method: "GET",
});

const response = await pipeline.sendRequest(
  createDefaultHttpClient(),
  request,
);

console.log(response.status);
console.log(response.bodyAsText);
```

Important behavior:

- `bearerTokenAuthenticationPolicy(...)` only permits `https://` URLs
- The policy caches and refreshes access tokens for you through the credential
- Put bearer auth in the `Sign` phase so retries and earlier policies run before signing

### Add A Custom Policy

Use a custom policy when every request needs the same header, query parameter, or mutation.

```js
import {
  createDefaultHttpClient,
  createPipelineFromOptions,
  createPipelineRequest,
} from "@azure/core-rest-pipeline";

const pipeline = createPipelineFromOptions({});

pipeline.addPolicy(
  {
    name: "apiVersionPolicy",
    async sendRequest(request, next) {
      const url = new URL(request.url);

      if (!url.searchParams.has("api-version")) {
        url.searchParams.set(
          "api-version",
          process.env.ARM_API_VERSION || "2020-01-01",
        );
      }

      request.url = url.toString();
      request.headers.set("Accept", "application/json");

      return next(request);
    },
  },
  { phase: "Serialize" },
);

const request = createPipelineRequest({
  url: "https://management.azure.com/subscriptions",
  method: "GET",
});

const response = await pipeline.sendRequest(
  createDefaultHttpClient(),
  request,
);

console.log(response.status);
```

If you need a fully custom stack, start with `createEmptyPipeline()` instead of `createPipelineFromOptions()`.

### Catch `RestError` Cleanly

Use `isRestError(...)` when you want access to `statusCode`, the original request, and the raw response.

```js
import {
  createDefaultHttpClient,
  createPipelineFromOptions,
  createPipelineRequest,
  isRestError,
} from "@azure/core-rest-pipeline";

try {
  const pipeline = createPipelineFromOptions({});
  const request = createPipelineRequest({
    url: "https://management.azure.com/subscriptions?api-version=2020-01-01",
    method: "GET",
  });

  const response = await pipeline.sendRequest(
    createDefaultHttpClient(),
    request,
  );

  if (response.status >= 400) {
    throw new Error(`Unexpected status ${response.status}`);
  }
} catch (error) {
  if (isRestError(error)) {
    console.error(error.code, error.statusCode, error.message);
    console.error(error.response?.headers.get("x-ms-request-id"));
  }

  throw error;
}
```

## Logging, Retries, And Transport

### Enable Sanitized Request/Response Logs

The log policy is part of `createPipelineFromOptions(...)`, but Azure SDK logging is disabled until you set a log level.

```js
import { createPipelineFromOptions } from "@azure/core-rest-pipeline";
import { setLogLevel } from "@azure/logger";

setLogLevel("info");

const pipeline = createPipelineFromOptions({
  loggingOptions: {
    additionalAllowedHeaderNames: ["x-ms-request-id"],
    additionalAllowedQueryParameters: ["api-version"],
  },
});
```

The log policy sanitizes headers and query parameters by default, and it does not log request bodies.

### Proxy Support In Node

In Node-like runtimes, the proxy policy is included automatically by `createPipelineFromOptions(...)`. If you do not pass explicit proxy settings, it reads standard environment variables.

```bash
export HTTPS_PROXY="http://proxy.internal:8080"
export ALL_PROXY="http://proxy.internal:8080"
export NO_PROXY=".blob.core.windows.net,localhost,127.0.0.1"
```

You can also pass `proxyOptions` to `createPipelineFromOptions(...)`, or set `request.proxySettings` on an individual request.

### Redirects And Retry Behavior

- Default retry handling covers throttling responses, transport-layer failures, and exponential backoff retries
- Retry configuration is passed through `retryOptions` on `createPipelineFromOptions(...)`
- Redirect handling is only added in Node-like runtimes
- For low-level HTTP-only integrations, use `createEmptyPipeline()` if you want to remove default retry or redirect behavior entirely

## Practical Notes

- `createPipelineRequest(...)` defaults the method to `GET` and generates a request ID if you do not provide one.
- Requests are HTTPS-only by default. To call a local HTTP endpoint, set `allowInsecureConnection: true` on the request.
- Bearer token auth is stricter: it does not allow non-HTTPS URLs even if `allowInsecureConnection` is true.
- In Node, proxy handling honors `HTTPS_PROXY`, `ALL_PROXY`, `HTTP_PROXY`, and `NO_PROXY` when you do not pass explicit settings.
- Use `createEmptyPipeline()` for test doubles, very small custom clients, or cases where Azure's default policy stack is the wrong fit.

## Common Pitfalls

- Expecting `createPipelineFromOptions(...)` to add authentication automatically.
- Adding a bearer token policy to an `http://` endpoint.
- Recreating the pipeline for every request instead of reusing it.
- Turning on logging without allowing the headers or query parameters you actually need to inspect.
- Using this package where a higher-level Azure service client would be simpler and safer.
- Forgetting that Node-only behavior such as proxy, TLS, decompression, and redirect handling is not added in browser runtimes.

## Version Notes For 1.23.0

- This guide targets `@azure/core-rest-pipeline` `1.23.0`.
- `@azure/identity` and `@azure/logger` are versioned separately; pin them according to your application's Azure SDK policy.
- If you copy older low-level Azure examples, prefer `createPipelineFromOptions(...)`, `createDefaultHttpClient()`, and `createPipelineRequest(...)` over ad-hoc request objects.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/core-rest-pipeline/`
- Azure SDK source root: `https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/core/core-rest-pipeline`
- npm package page: `https://www.npmjs.com/package/@azure/core-rest-pipeline`
