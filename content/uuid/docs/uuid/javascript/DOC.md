---
name: uuid
description: "Install and use the `uuid` package in JavaScript to generate, validate, and transform UUID values."
metadata:
  languages: "javascript"
  versions: "13.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "javascript,uuid,utility,identifiers,npm"
---

# uuid JavaScript Guide

`uuid` generates UUID strings and provides helpers for validation, deterministic IDs, and byte conversion.

## Install

Install the package into your app:

```bash
npm install uuid
```

## Initialization

There are no package-specific environment variables, auth steps, or client objects.

Use top-level named imports from `uuid` in application code:

```javascript
import {
  NIL,
  parse as uuidParse,
  stringify as uuidStringify,
  v4 as uuidv4,
  v5 as uuidv5,
  validate as uuidValidate,
  version as uuidVersion,
} from "uuid";
```

## Common Workflows

### Generate random IDs with `v4()`

Use `v4()` when you need a random UUID for a database record, job, or request identifier.

```javascript
import { v4 as uuidv4 } from "uuid";

export function createJob(payload) {
  return {
    id: uuidv4(),
    payload,
    status: "queued",
  };
}
```

### Generate deterministic IDs with `v5()`

Use `v5()` when the same input should always produce the same UUID within a namespace.

```javascript
import { v5 as uuidv5 } from "uuid";

const APP_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export function customerUuid(customerKey) {
  return uuidv5(customerKey, APP_NAMESPACE);
}

const pageUuid = uuidv5("https://example.com/users/42", uuidv5.URL);
```

The built-in RFC namespaces are exposed as `uuidv5.URL` and `uuidv5.DNS`.

### Validate inbound UUID strings

Use `validate()` before trusting values from API routes, CLI flags, or message payloads. If your code requires a specific UUID version, check `version()` too.

```javascript
import { validate as uuidValidate, version as uuidVersion } from "uuid";

export function assertUuidV4(value) {
  if (!uuidValidate(value) || uuidVersion(value) !== 4) {
    throw new Error("Expected a UUIDv4 string");
  }
}
```

### Convert between UUID strings and raw bytes

Use `parse()` and `stringify()` when your storage layer or protocol uses a 16-byte UUID representation.

```javascript
import {
  parse as uuidParse,
  stringify as uuidStringify,
  v4 as uuidv4,
} from "uuid";

const id = uuidv4();
const bytes = uuidParse(id);
const roundTrip = uuidStringify(bytes);

console.log({ id, bytes, roundTrip });
```

### Use `NIL` as an all-zero sentinel UUID

`NIL` is the all-zero UUID string.

```javascript
import { NIL } from "uuid";

if (sessionId === NIL) {
  throw new Error("Session has not been assigned a UUID yet");
}
```

## React Native and Expo

If your runtime does not provide `crypto.getRandomValues()`, add the React Native polyfill before importing `uuid`.

```bash
npm install uuid react-native-get-random-values
```

```javascript
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const id = uuidv4();
```

Import the polyfill before `uuid` so random UUID generation works reliably.

## Important Pitfalls

- `validate()` only tells you whether a value is a valid UUID. If your contract requires a specific version such as v4, also check `version()`.
- `version()` throws when the input is not a valid UUID, so validate the string first.
- `parse()` throws when the input string is not a valid UUID.
- `stringify()` expects a 16-byte array and preserves the left-to-right byte order used in UUID strings.
- Prefer top-level named imports from `uuid` rather than deep subpath imports.

## Version-Sensitive Notes

- This guide targets `uuid@13.0.0`.
- The package still requires no service configuration: install it, import the helpers you need, and call them directly.
- If your codebase depends on APIs beyond the helpers shown here, check the upstream README for the exact release you ship.

## Official Sources

- https://github.com/uuidjs/uuid
- https://github.com/uuidjs/uuid/blob/main/README.md
- https://www.npmjs.com/package/uuid
