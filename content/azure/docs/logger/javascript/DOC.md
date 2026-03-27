---
name: logger
description: "@azure/logger JavaScript utilities for enabling Azure SDK logs, setting log levels, and redirecting logger output"
metadata:
  languages: "javascript"
  versions: "1.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,logger,logging,javascript,diagnostics"
---

# @azure/logger JavaScript Package Guide

## What It Is

`@azure/logger` is the small shared logging package used by Azure SDK libraries in JavaScript. It does not create clients, authenticate to Azure, or send telemetry by itself. Use it when you need to turn Azure SDK diagnostic logging on or off in your application, or when you need to redirect Azure SDK log output to your own sink.

The public APIs you will usually use are:

- `setLogLevel(...)`: enable or disable Azure SDK logging immediately
- `getLogLevel()`: inspect the active log level
- `AzureLogger.log = ...`: redirect where log messages are written

`createClientLogger(...)` is also exported, but it is marked hidden in the package API and is mainly useful for SDK-style library authors.

## Version Scope

- Package: `@azure/logger`
- Version covered: `1.3.0`
- Language: JavaScript
- Docs root: `https://learn.microsoft.com/en-us/javascript/api/@azure/logger/`
- Registry page: `https://www.npmjs.com/package/@azure/logger`
- Source repository: `https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/core/logger`

## Install

```bash
npm install @azure/logger@1.3.0
```

`1.3.0` declares `node >=20.0.0` in its published package metadata.

If your application wants to call `setLogLevel(...)` directly, install `@azure/logger` as a direct dependency in that application instead of relying on it only as a transitive dependency of another Azure SDK package.

## Initialization And Configuration

There is no endpoint, credential, or client object.

You can enable logging either with the `AZURE_LOG_LEVEL` environment variable before process startup, or in code with `setLogLevel(...)`.

```bash
export AZURE_LOG_LEVEL="info"
node app.mjs
```

```js
import { getLogLevel, setLogLevel } from "@azure/logger";

console.log(getLogLevel());

setLogLevel("warning");

console.log(getLogLevel());
```

Accepted log levels, from most verbose to least verbose:

- `verbose`
- `info`
- `warning`
- `error`

Call `setLogLevel()` with no argument to disable logging again:

```js
import { setLogLevel } from "@azure/logger";

setLogLevel();
```

If `AZURE_LOG_LEVEL` is set to an unsupported value, logging stays disabled and the package writes an error explaining the accepted values.

## Common Workflows

### Enable Azure SDK logs at startup

This is the normal application-level pattern: configure logging once during startup, then create and use Azure SDK clients.

```js
import { setLogLevel } from "@azure/logger";

setLogLevel(process.env.NODE_ENV === "production" ? "warning" : "info");
```

For Azure SDK packages that integrate with `@azure/logger`, this takes effect immediately for the current runtime.

### Redirect Azure SDK logs to your own logger

`AzureLogger` is the root logger object. Override its `log` method when you want Azure SDK logs to flow through your application's logging pipeline.

```js
import { AzureLogger, setLogLevel } from "@azure/logger";

AzureLogger.log = (...args) => {
  console.log("[azure-sdk]", ...args);
};

setLogLevel("info");
```

In Node, the default sink writes to standard error. The browser and React Native builds route through console methods unless you override `AzureLogger.log`.

### Enable sanitized HTTP pipeline logging

Azure SDK HTTP pipeline packages use the same logging package. For example, `@azure/core-rest-pipeline` enables its log policy only after you set a log level:

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

This is the practical pattern when you want Azure SDK request and response diagnostics without changing each client individually.

### Create a namespaced logger for a client library

Use `createClientLogger(...)` only if you are building an Azure SDK-style library and want the same namespace and level behavior as other Azure packages.

```js
import { createClientLogger, setLogLevel } from "@azure/logger";

setLogLevel("verbose");

const logger = createClientLogger("my-package");

logger.info("Starting operation");
logger.verbose("Request options: %o", { retries: 3 });
logger.warning("Retrying after throttling");
logger.error("Operation failed");
```

These loggers use Azure-style namespaces under the `azure` root, such as `azure:my-package:info`.

## Common Pitfalls

- Expecting log output without setting `AZURE_LOG_LEVEL` or calling `setLogLevel(...)`.
- Passing an unsupported level such as `debug`; the only accepted values are `verbose`, `info`, `warning`, and `error`.
- Treating logging as per-client configuration. The log level is shared by this package instance in the current runtime.
- Importing `@azure/logger` from application code without declaring it as a direct dependency.
- Using `createClientLogger(...)` as a general-purpose app logger; it is intended for Azure SDK-style libraries.

## Runtime Notes For 1.3.0

- This guide targets `@azure/logger` `1.3.0`.
- The package publishes conditional exports for ESM import, CommonJS require, browser, and React Native builds.
- The package-level environment variable is `AZURE_LOG_LEVEL`.
- `setLogLevel(...)` changes the active level immediately, and `getLogLevel()` returns the current value or `undefined` when logging is disabled.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/logger/`
- Azure SDK source root: `https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/core/logger`
- npm package page: `https://www.npmjs.com/package/@azure/logger`
