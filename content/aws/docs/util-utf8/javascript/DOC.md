---
name: util-utf8
description: "AWS SDK UTF-8 utility helpers for JavaScript - convert strings, Uint8Array values, ArrayBuffer inputs, and typed-array views"
metadata:
  languages: "javascript"
  versions: "3.374.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,aws-sdk,utf8,encoding,bytes,uint8array,typedarray"
---

# `@aws-sdk/util-utf8` JavaScript Guide

## What This Package Does

`@aws-sdk/util-utf8` is a small AWS SDK v3 utility package for converting between JavaScript strings and byte arrays.

Use it when you need to:

- turn a UTF-8 string into a `Uint8Array`
- turn SDK byte output back into a JavaScript string
- normalize `string`, `ArrayBuffer`, or typed-array input into `Uint8Array`

This package does not create AWS clients, does not read credentials, and does not require any environment variables on its own.

In many AWS SDK v3 clients, UTF-8 helpers are already wired into the runtime. Reach for this package when your application code needs the same conversions directly.

## Installation

```bash
npm install @aws-sdk/util-utf8@3.374.0
```

## Import

```javascript
import { fromUtf8, toUtf8, toUint8Array } from "@aws-sdk/util-utf8";
```

If your project is still using CommonJS:

```javascript
const { fromUtf8, toUtf8, toUint8Array } = require("@aws-sdk/util-utf8");
```

## Quick Start

### Encode a string to bytes

Use `fromUtf8()` when you have text and need a `Uint8Array`.

```javascript
import { fromUtf8 } from "@aws-sdk/util-utf8";

const bytes = fromUtf8("Hello from AWS SDK v3");

console.log(bytes instanceof Uint8Array); // true
console.log(bytes);
```

### Decode bytes to a string

Use `toUtf8()` when you already have `Uint8Array` data and want text.

```javascript
import { fromUtf8, toUtf8 } from "@aws-sdk/util-utf8";

const original = "café";
const bytes = fromUtf8(original);
const decoded = toUtf8(bytes);

console.log(decoded); // "café"
```

### Normalize input to `Uint8Array`

Use `toUint8Array()` when your code may receive different byte-like inputs.

```javascript
import { toUint8Array } from "@aws-sdk/util-utf8";

const fromString = toUint8Array("hello");

const buffer = new ArrayBuffer(4);
new Uint8Array(buffer).set([65, 66, 67, 68]);
const fromBuffer = toUint8Array(buffer);

const view = new Uint16Array([500, 600]);
const fromView = toUint8Array(view);

console.log(fromString);
console.log(fromBuffer);
console.log(fromView);
```

## Common Workflows

### Hash a JSON payload

AWS signing and checksum code often works on raw bytes, not plain strings.

```javascript
import { createHash } from "node:crypto";
import { fromUtf8 } from "@aws-sdk/util-utf8";

const payload = JSON.stringify({ hello: "world" });

const digest = createHash("sha256")
  .update(fromUtf8(payload))
  .digest("hex");

console.log(digest);
```

### Decode an SDK byte payload

When middleware or lower-level SDK code gives you bytes, decode them before parsing.

```javascript
import { toUtf8 } from "@aws-sdk/util-utf8";

const bodyBytes = new Uint8Array([123, 34, 111, 107, 34, 58, 116, 114, 117, 101, 125]);
const bodyText = toUtf8(bodyBytes);
const body = JSON.parse(bodyText);

console.log(body.ok); // true
```

### Accept mixed input safely

`toUint8Array()` is the easiest way to normalize data before hashing, signing, compressing, or forwarding to another API.

```javascript
import { toUint8Array, toUtf8 } from "@aws-sdk/util-utf8";

function readText(input) {
  const bytes = toUint8Array(input);
  return toUtf8(bytes);
}

console.log(readText("plain text"));
console.log(readText(new Uint8Array([65, 87, 83])));
```

## Using It With AWS SDK Clients

Most AWS SDK v3 clients already provide default UTF-8 helpers internally, so you usually do not need to pass these functions yourself.

If you are building custom runtime configuration, use the helpers like this:

```javascript
import { SSOClient } from "@aws-sdk/client-sso";
import { fromUtf8, toUtf8 } from "@aws-sdk/util-utf8";

const client = new SSOClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  utf8Decoder: fromUtf8,
  utf8Encoder: toUtf8,
});
```

Environment variable example:

```bash
export AWS_REGION=us-east-1
```

Use this pattern only if you are intentionally overriding the runtime defaults.

## Runtime Notes

- In browser builds, the package uses `TextEncoder` and `TextDecoder("utf-8")`.
- In Node.js builds, the package uses Buffer-backed UTF-8 conversion.
- The public API stays the same across runtimes: `fromUtf8`, `toUtf8`, and `toUint8Array`.

## Important Pitfalls

### `toUtf8()` passes strings through unchanged

If you call `toUtf8()` with a string, it returns that string as-is.

```javascript
import { toUtf8 } from "@aws-sdk/util-utf8";

console.log(toUtf8("already text")); // "already text"
```

That means `toUtf8()` is a decode helper for byte input, not a general-purpose string transcoder.

### `toUtf8()` expects string or byte-like input

Do not pass plain objects, numbers, or other arbitrary values.

```javascript
import { toUtf8 } from "@aws-sdk/util-utf8";

try {
  console.log(toUtf8({ value: "nope" }));
} catch (error) {
  console.error(error.message);
}
```

If your input may be `string`, `ArrayBuffer`, or a typed-array view, normalize it with `toUint8Array()` first.

### Normalize typed-array views carefully

If you already have a typed-array view with an offset into a larger buffer, `toUint8Array()` preserves the view window instead of reading the whole underlying buffer.

That makes it safer than manually calling `new Uint8Array(view.buffer)` when the original view starts partway into the buffer.

## Version Notes

This guide is for `@aws-sdk/util-utf8` version `3.374.0`.

In newer AWS SDK v3 internals, you may also see the same UTF-8 helpers provided from `@smithy/util-utf8`. The application-level usage shown here stays the same: convert text with `fromUtf8()`, decode bytes with `toUtf8()`, and normalize mixed inputs with `toUint8Array()`.
