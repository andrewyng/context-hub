---
name: core-util
description: "@azure/core-util guide for JavaScript abort helpers, retry delay calculation, hashing, encoding, type guards, and runtime detection utilities"
metadata:
  languages: "javascript"
  versions: "1.13.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,core-util,javascript,utilities,abort,retry,hashing"
---

# @azure/core-util JavaScript Package Guide

## What It Is

`@azure/core-util` is a low-level Azure SDK helper package. In `1.13.1`, its public surface is a small set of utilities for:

- abortable async flows
- exponential retry delay calculation
- SHA-256 hashing and HMAC helpers
- byte/string encoding helpers
- error and object type guards
- runtime detection and UUID generation

This package does not create Azure service clients, open network connections, or use Azure credentials by itself. Use it when you specifically need these helpers in shared application or SDK-adjacent code.

## Version Scope

- Package: `@azure/core-util`
- Version covered: `1.13.1`
- Language: JavaScript
- Docs root: `https://learn.microsoft.com/en-us/javascript/api/@azure/core-util/`
- Registry page: `https://www.npmjs.com/package/@azure/core-util`

## Install

```bash
npm install @azure/core-util
```

`1.13.1` declares `node >=20.0.0` in its published package metadata.

The package publishes conditional exports for standard ESM imports plus CommonJS, browser, and React Native builds. The examples below use ESM syntax.

## Initialization And Configuration

There is no client object, endpoint, or authentication step.

```js
import {
  calculateRetryDelay,
  cancelablePromiseRace,
  computeSha256Hash,
  computeSha256Hmac,
  createAbortablePromise,
  delay,
  getErrorMessage,
  isBrowser,
  isDefined,
  isError,
  isNodeLike,
  isNodeRuntime,
  isObject,
  isObjectWithProperties,
  objectHasProperty,
  randomUUID,
  stringToUint8Array,
  uint8ArrayToString,
} from "@azure/core-util";
```

Environment variables are not required.

## Common Workflows

### Pause with cancellation support

`delay(...)` wraps `setTimeout(...)` in a promise and accepts abort options.

```js
import { delay } from "@azure/core-util";

const abortController = new AbortController();

const pendingDelay = delay(5_000, {
  abortSignal: abortController.signal,
  abortErrorMsg: "Backoff wait was cancelled",
});

setTimeout(() => abortController.abort(), 1_000);

try {
  await pendingDelay;
} catch (error) {
  console.error(error.message);
}
```

This is the normal pattern for retry sleeps, polling loops, or any wait that should stop when a parent operation is cancelled.

### Calculate exponential backoff with jitter

`calculateRetryDelay(...)` returns an object with `retryAfterInMs`.

```js
import { calculateRetryDelay } from "@azure/core-util";

const { retryAfterInMs } = calculateRetryDelay(2, {
  retryDelayInMs: 800,
  maxRetryDelayInMs: 8_000,
});

console.log(retryAfterInMs);
```

The calculation increases the base delay exponentially, clamps it at `maxRetryDelayInMs`, and adds jitter so concurrent clients do not all retry at the same instant.

### Build your own abortable promise

`createAbortablePromise(...)` is useful when you need to bridge timers, event listeners, or callback-style code into an abort-aware promise.

```js
import { createAbortablePromise } from "@azure/core-util";

function waitForReady(ms, abortSignal) {
  let timer;

  return createAbortablePromise((resolve) => {
    timer = setTimeout(() => resolve("ready"), ms);
  }, {
    abortSignal,
    abortErrorMsg: "Ready wait aborted",
    cleanupBeforeAbort: () => clearTimeout(timer),
  });
}

const abortController = new AbortController();
const result = await waitForReady(250, abortController.signal);

console.log(result);
```

If the signal is already aborted, the promise rejects immediately with an `AbortError`.

### Race multiple abortable operations

`cancelablePromiseRace(...)` expects an array of builder functions. Each builder receives an object with `abortSignal`, and the helper aborts the remaining builders when the first one settles.

```js
import { cancelablePromiseRace, delay } from "@azure/core-util";

const winner = await cancelablePromiseRace([
  async ({ abortSignal }) => {
    await delay(200, { abortSignal });
    return "fast";
  },
  async ({ abortSignal }) => {
    await delay(2_000, { abortSignal });
    return "slow";
  },
]);

console.log(winner);
```

This only works correctly when each builder passes the supplied `abortSignal` into the async work it starts.

### Hash content and encode bytes

The hash helpers are async and return the digest in the encoding you request.

```js
import {
  computeSha256Hash,
  computeSha256Hmac,
  stringToUint8Array,
  uint8ArrayToString,
} from "@azure/core-util";

const digestHex = await computeSha256Hash("hello world", "hex");

const hmacBase64 = await computeSha256Hmac(
  "c2VjcmV0LWtleQ==",
  "hello world",
  "base64",
);

const bytes = stringToUint8Array("hello world", "utf-8");
const roundTrip = uint8ArrayToString(bytes, "utf-8");

console.log({ digestHex, hmacBase64, roundTrip });
```

For portable code across Node and browser builds, use the encodings exposed by the package helpers: `utf-8`, `base64`, `base64url`, and `hex`.

### Normalize thrown errors and inspect unknown values

```js
import {
  getErrorMessage,
  isDefined,
  isError,
  isObject,
  isObjectWithProperties,
  objectHasProperty,
} from "@azure/core-util";

try {
  throw { code: "E_FAIL" };
} catch (error) {
  console.error(getErrorMessage(error));

  if (isError(error)) {
    console.error(error.name, error.message);
  }
}

const value = JSON.parse('{"id":"42","status":"ok"}');

if (
  isDefined(value) &&
  isObject(value) &&
  isObjectWithProperties(value, ["id", "status"]) &&
  objectHasProperty(value, "id")
) {
  console.log(value.id, value.status);
}
```

`isObject(...)` is intentionally narrow: it excludes `null`, arrays, `RegExp`, and `Date`.

### Generate request IDs and branch on runtime

```js
import {
  isBrowser,
  isNodeLike,
  isNodeRuntime,
  randomUUID,
} from "@azure/core-util";

const requestId = randomUUID();

if (isNodeRuntime) {
  console.log("Running in Node.js", requestId);
} else if (isBrowser) {
  console.log("Running in the browser", requestId);
} else if (isNodeLike) {
  console.log("Running in a Node-compatible runtime", requestId);
}
```

Use `isNodeLike` for compatibility checks. `isNode` is still exported in `1.13.1`, but it is deprecated in favor of `isNodeLike`.

## Practical Notes

- Reuse `AbortSignal` from the parent operation so delay and custom promise helpers stop promptly when callers cancel work.
- Treat `calculateRetryDelay(...)` as a math helper only. You still need your own retry loop and retryable error policy.
- Keep HMAC keys in base64 form when passing them to `computeSha256Hmac(...)`.
- Use the byte conversion helpers when you need the same content encoded consistently across Node and browser builds.
- Prefer `getErrorMessage(...)` when you are catching `unknown` values and need a safe log string.

## Common Pitfalls

- Importing `@azure/core-util` and expecting an Azure client, endpoint handling, or credential flow.
- Passing already-started promises into `cancelablePromiseRace(...)` instead of builder functions that accept `{ abortSignal }`.
- Forgetting that `computeSha256Hash(...)` and `computeSha256Hmac(...)` return promises.
- Using `getRandomIntegerInclusive(...)` for security-sensitive randomness.
- Using `isNode` in new code instead of `isNodeLike`.
- Assuming browser hashing works without Web Crypto support.

## Version Notes For 1.13.1

- This guide targets `@azure/core-util` `1.13.1`.
- The published package manifest requires Node `>=20.0.0`.
- The package exports ESM, CommonJS, browser, and React Native entry points.
- `isNode` is a deprecated alias of `isNodeLike` in this version.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/core-util/`
- npm package page: `https://www.npmjs.com/package/@azure/core-util`
- Azure SDK for JavaScript package homepage: `https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/core/core-util/`
