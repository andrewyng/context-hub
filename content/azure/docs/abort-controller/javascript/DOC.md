---
name: abort-controller
description: "@azure/abort-controller guide for JavaScript abort error handling and platform AbortController usage"
metadata:
  languages: "javascript"
  versions: "2.1.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,abort-controller,javascript,abort,abortsignal,cancellation"
---

# @azure/abort-controller JavaScript Package Guide

## What It Is

`@azure/abort-controller` is a small Azure SDK support package for cancellation flows.

In `2.1.2`, the published JavaScript entry point exports `AbortError`. Use the platform `AbortController` and `AbortSignal` provided by Node.js, browsers, or React Native for the controller and signal objects themselves.

Use this package when:

- the codebase already imports `AbortError` from `@azure/abort-controller`
- you want your own async helpers to reject with an Azure-style abort error
- you need one cancellation pattern that works alongside other Azure SDK packages

This guide targets package version `2.1.2`.

## Install

```bash
npm install @azure/abort-controller@2.1.2
```

`2.1.2` declares `node >=18.0.0` in the published package metadata.

The package also publishes browser, React Native, ESM, and CommonJS entry points through conditional exports.

## Initialization And Configuration

There is no client object, endpoint, authentication step, or required environment variable.

Typical imports:

```js
import { AbortError } from "@azure/abort-controller";

const controller = new AbortController();
const { signal } = controller;
```

If you only need to create or pass a signal, the platform `AbortController` is enough. Import `AbortError` when you want to throw or normalize an abort-specific error in your own code.

## Common Workflows

### Reject your own async work with `AbortError`

Use `AbortError` when you build an async helper that should stop immediately after cancellation.

```js
import { AbortError } from "@azure/abort-controller";

function waitForReady({ signal, timeoutInMs = 5_000 } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AbortError("The operation was aborted."));
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      resolve("ready");
    }, timeoutInMs);

    const onAbort = () => {
      cleanup();
      reject(new AbortError("The operation was aborted."));
    };

    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

const controller = new AbortController();
setTimeout(() => controller.abort(), 250);

try {
  await waitForReady({ signal: controller.signal, timeoutInMs: 2_000 });
} catch (error) {
  if (error?.name === "AbortError") {
    console.log("Cancelled cleanly");
  } else {
    throw error;
  }
}
```

The package documentation for `AbortError` recommends checking `error.name === "AbortError"` when handling cancellation.

### Cancel platform APIs with `AbortController`

`@azure/abort-controller` does not replace the runtime controller. Create a normal `AbortController`, pass its signal into an abort-aware API, and treat `AbortError` as the cancellation case.

```js
const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 1_000);

try {
  const response = await fetch("https://example.com/api/tasks", {
    signal: controller.signal,
  });

  const data = await response.json();
  console.log(data);
} catch (error) {
  if (error?.name === "AbortError") {
    console.log("Request cancelled");
  } else {
    throw error;
  }
} finally {
  clearTimeout(timeout);
}
```

Use the same pattern when another library accepts an `AbortSignal`.

### Fail fast when a signal is already aborted

If your helper takes a signal, check the aborted state before you start new work.

```js
import { AbortError } from "@azure/abort-controller";

function throwIfAborted(signal) {
  if (signal?.aborted) {
    throw new AbortError("The operation was aborted before it started.");
  }
}

function startJob(signal) {
  throwIfAborted(signal);
  return { started: true };
}

const controller = new AbortController();
controller.abort();

try {
  startJob(controller.signal);
} catch (error) {
  if (error?.name === "AbortError") {
    console.log("Skipped cancelled job");
  }
}
```

This avoids starting timers, requests, or listeners for work that the caller already cancelled.

## Practical Notes

- Prefer the runtime `AbortController` and `AbortSignal` APIs in Node.js 18+, browsers, and React Native.
- Import `AbortError` when you need to reject your own promise-based helpers with a consistent cancellation error.
- Check `error.name === "AbortError"` when interoperating with platform APIs and Azure helpers, since cancellation errors do not always share the same concrete class.
- Keep one parent signal and pass it through nested helpers so cancellation reaches every layer.

## Common Pitfalls

- Expecting `@azure/abort-controller` to provide a runtime `AbortController` implementation in Node.js 18+ projects.
- Catching only `instanceof AbortError` instead of handling the broader `error.name === "AbortError"` case.
- Starting work after `signal.aborted` is already `true`.
- Forgetting that this package does not configure retries, timeouts, or HTTP requests by itself.

## Version Notes For 2.1.2

- This guide targets `@azure/abort-controller` `2.1.2`.
- The published package metadata requires Node.js `>=18.0.0`.
- The package publishes conditional exports for browser, React Native, ESM, and CommonJS consumers.
- The published JavaScript entry point exports `AbortError`.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/abort-controller/`
- npm package page: `https://www.npmjs.com/package/@azure/abort-controller`
- Azure SDK for JavaScript package homepage: `https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/core/abort-controller/README.md`
