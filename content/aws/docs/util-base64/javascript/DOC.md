---
name: util-base64
description: "AWS SDK for JavaScript v3 base64 helpers for converting UTF-8 strings and Uint8Array values to and from standard base64 text."
metadata:
  languages: "javascript"
  versions: "3.374.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,aws-sdk,javascript,base64,encoding,decoding,bytes,uint8array"
---

# `@aws-sdk/util-base64`

Use this package when AWS SDK v3 code needs to convert between standard base64 strings and raw bytes. It exposes two helpers:

- `toBase64()` to encode a UTF-8 string or `Uint8Array` as base64 text
- `fromBase64()` to decode a base64 string into a `Uint8Array`

This package is a local utility. It does not create AWS service clients, load credentials, or read package-specific environment variables.

## Install

Install the package version your project expects:

```bash
npm install @aws-sdk/util-base64@3.374.0
```

## Initialization

There are no environment variables, credentials, or client objects to initialize.

Import the helpers directly:

```javascript
import { fromBase64, toBase64 } from "@aws-sdk/util-base64";
```

## Common Workflows

### Encode a UTF-8 string as base64

`toBase64()` accepts a JavaScript string and encodes its UTF-8 bytes.

```javascript
import { toBase64 } from "@aws-sdk/util-base64";

const encoded = toBase64("hello world");

console.log(encoded);
// aGVsbG8gd29ybGQ=
```

Use this when an application boundary needs textual base64 instead of raw bytes.

### Encode binary data

Pass a `Uint8Array` when the value is already binary.

```javascript
import { toBase64 } from "@aws-sdk/util-base64";

const bytes = Uint8Array.from([0xde, 0xad, 0xbe, 0xef]);
const encoded = toBase64(bytes);

console.log(encoded);
// 3q2+7w==
```

In Node.js, `Buffer` also works because it is a `Uint8Array`.

### Decode base64 to bytes

`fromBase64()` returns raw bytes as a `Uint8Array`.

```javascript
import { fromBase64 } from "@aws-sdk/util-base64";

const bytes = fromBase64("aGVsbG8gd29ybGQ=");

console.log(bytes);
// Uint8Array([...])
```

### Decode base64 to text

If the decoded bytes represent UTF-8 text, run them through `TextDecoder`.

```javascript
import { fromBase64 } from "@aws-sdk/util-base64";

const bytes = fromBase64("aGVsbG8gd29ybGQ=");
const text = new TextDecoder().decode(bytes);

console.log(text);
// hello world
```

### Start from an `ArrayBuffer`

`toBase64()` expects `string | Uint8Array`. If your code has an `ArrayBuffer`, wrap it first.

```javascript
import { toBase64 } from "@aws-sdk/util-base64";

const arrayBuffer = new Uint8Array([1, 2, 3, 4]).buffer;
const encoded = toBase64(new Uint8Array(arrayBuffer));

console.log(encoded);
```

## Important Pitfalls

- `fromBase64()` expects standard base64, not base64url. Inputs that use `-` and `_` must be normalized before decoding.
- `fromBase64()` rejects invalid characters and incorrect padding instead of trying to recover.
- `toBase64()` only accepts a string or a `Uint8Array`. Wrap `ArrayBuffer` values with `new Uint8Array(...)` first.
- `fromBase64()` returns bytes, not a string. Use `TextDecoder` only when the decoded bytes are actually UTF-8 text.
- `toBase64("...")` encodes the string's UTF-8 bytes. If you already have binary data, pass a `Uint8Array` instead of converting the bytes to a JavaScript string first.

## Base64url Interop

If another system gives you base64url instead of standard base64, normalize it before calling `fromBase64()`:

```javascript
import { fromBase64 } from "@aws-sdk/util-base64";

const fromBase64Url = (input) => {
  const normalized = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");

  return fromBase64(normalized);
};

const bytes = fromBase64Url("aGVsbG8td29ybGQ");
console.log(new TextDecoder().decode(bytes));
```

## Official Sources

- AWS SDK for JavaScript v3 package docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-util-base64/
- npm package page: https://www.npmjs.com/package/@aws-sdk/util-base64
