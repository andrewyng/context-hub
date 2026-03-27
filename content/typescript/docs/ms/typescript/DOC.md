---
name: ms
description: "TypeScript declarations for the ms runtime package, including typed duration strings, parsing, and formatting"
metadata:
  languages: "typescript"
  versions: "2.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,ms,duration,time,npm,types"
---

# ms TypeScript Guide

`@types/ms` provides the TypeScript declarations for the `ms` runtime package. Use it when your project imports `ms` to parse human-readable duration strings such as `"5m"` or `"2 days"`, or to format millisecond values back into short or long strings.

This package only ships `.d.ts` files. It does not install the `ms` runtime.

## Install

Install the runtime package and the declarations together:

```bash
npm install ms
npm install --save-dev @types/ms
```

`@types/ms@2.1.0` declares `typeScriptVersion: "5.0"`, so use TypeScript 5.0 or newer.

No environment variables, authentication, or client initialization are required.

## Import `ms` In TypeScript

The declaration file ends with `export = ms`, so the configuration-independent import style is:

```ts
import ms = require("ms");
```

The package also declares the namespace types `ms.StringValue`, `ms.Unit`, and `ms.UnitAnyCase`, which are useful when you want config objects to accept only valid duration strings.

## Parse Duration Strings

`ms()` returns a `number` when you pass a typed duration string.

```ts
import ms = require("ms");

const retryDelay: ms.StringValue = "5s";
const lockTtl: ms.StringValue = "2 days";
const rawMilliseconds: ms.StringValue = "100";

const retryDelayMs = ms(retryDelay);
const lockTtlMs = ms(lockTtl);
const rawValueMs = ms(rawMilliseconds);

console.log({ retryDelayMs, lockTtlMs, rawValueMs });
```

`ms.StringValue` accepts:

- Bare numeric strings such as `"100"`
- Numeric strings followed by a unit such as `"15m"`
- Numeric strings followed by a space and a unit such as `"2 days"`

The declared units cover years, weeks, days, hours, minutes, seconds, and milliseconds in multiple spellings and letter case combinations.

## Format Milliseconds Back To Strings

`ms()` returns a `string` when you pass a `number`.

```ts
import ms = require("ms");

const short = ms(7_200_000);
const long = ms(7_200_000, { long: true });
const negative = ms(-180_000, { long: true });

console.log(short);
console.log(long);
console.log(negative);
```

Use the optional `{ long: true }` flag only with the numeric overload. It switches formatted output from compact values such as `"2h"` to written-out values such as `"2 hours"`.

## Use `ms.StringValue` In Application Config

If your own config is static or checked at compile time, prefer `ms.StringValue` instead of plain `string`.

```ts
import ms = require("ms");

type CacheConfig = {
  ttl: ms.StringValue;
  revalidateAfter: ms.StringValue;
};

const cacheConfig = {
  ttl: "15m",
  revalidateAfter: "1h",
} satisfies CacheConfig;

export const cacheTtlMs = ms(cacheConfig.ttl);
export const revalidateAfterMs = ms(cacheConfig.revalidateAfter);
```

This catches misspelled units during type checking instead of waiting for runtime input to fail.

## Handle Environment Variables And Other Untyped Strings

The main integration boundary is `string` input that comes from `process.env`, CLI flags, JSON, or user input. Those values are not automatically `ms.StringValue`, even if they happen to be valid at runtime.

If you accept untyped input, validate it before narrowing it to `ms.StringValue`.

```ts
import ms = require("ms");

const durationPattern = /^-?(?:\d+)?\.?\d+(?: ?(?:milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y))?$/i;

function isDurationString(value: string): value is ms.StringValue {
  return value.length <= 100 && durationPattern.test(value);
}

export function readDuration(
  value: string | undefined,
  fallback: ms.StringValue,
): number {
  const candidate = value ?? fallback;

  if (!isDurationString(candidate)) {
    throw new Error(`Invalid duration: ${candidate}`);
  }

  return ms(candidate);
}

const ttlMs = readDuration(process.env.CACHE_TTL, "10m");
```

This keeps the type system honest while still working with the runtime package's string parser.

## Version Notes

- This guide targets `@types/ms==2.1.0`.
- The declaration package includes `ms.Unit`, `ms.UnitAnyCase`, and `ms.StringValue`, with comments noting that those types are backported from `ms@3`.
- The runtime API described here is still the single `ms(value, options?)` function with parse and format overloads.

## Common Pitfalls

- `@types/ms` is declarations only. Install `ms` separately for runtime code.
- Import from `"ms"`, not from `"@types/ms"`.
- Because the declarations use `export = ms`, `import ms = require("ms")` is the safest import style across TypeScript configurations.
- `ms.StringValue` is narrower than `string`. Treat env vars and user input as untrusted strings until you validate them.
- The return type changes with the input type: strings parse to `number`, while numbers format to `string`.
- The numeric overload only accepts `{ long: boolean }`; the string overload does not take formatting options.

## Official Sources

- https://www.npmjs.com/package/@types/ms
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ms
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ms/index.d.ts
- https://github.com/vercel/ms
- https://github.com/vercel/ms/blob/main/readme.md
