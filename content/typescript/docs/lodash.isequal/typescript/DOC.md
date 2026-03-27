---
name: lodash.isequal
description: "TypeScript guidance for `lodash.isequal`, including the `@types/lodash.isequal` stub package, imports, deep equality checks, and common integration pitfalls."
metadata:
  languages: "typescript"
  versions: "4.5.8"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,lodash,lodash.isequal,deep-equality,types,definitelytyped,npm"
---

# lodash.isequal TypeScript Guide

## Golden Rule

`@types/lodash.isequal` `4.5.8` is a stub declaration package. The published package entry points TypeScript users to `lodash.isequal`, which provides the declarations you should use in application code.

Install and import `lodash.isequal`. Do not import anything from `@types/lodash.isequal`.

## Install

Install the runtime package and your normal TypeScript toolchain:

```bash
npm install lodash.isequal
npm install -D typescript @types/node
```

If your project added `@types/lodash.isequal` directly, remove it:

```bash
npm uninstall @types/lodash.isequal
```

If a transitive dependency still installs `@types/lodash.isequal`, you usually do not need to do anything. Import from `lodash.isequal`, and let TypeScript resolve the declarations from the runtime package.

## Initialization

There are no environment variables, credentials, client objects, or service initialization steps for this package.

The practical setup steps are:

- install `lodash.isequal`
- import from `lodash.isequal`
- use a TypeScript module configuration that matches your runtime

### Recommended `tsconfig.json`

If you want a default import in a typical Node.js project, enable interop:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

## Import Patterns

With `esModuleInterop`, use a default import:

```typescript
import isEqual from "lodash.isequal";
```

In CommonJS-oriented TypeScript without interop, use:

```typescript
import isEqual = require("lodash.isequal");
```

Do not import from `@types/lodash.isequal`.

## Common Workflows

### Compare typed settings before writing updates

`isEqual()` is most useful when you want to skip an update unless a nested object actually changed.

```typescript
import isEqual from "lodash.isequal";

type FeatureFlags = {
  auditLogs: boolean;
  exports: {
    csv: boolean;
    json: boolean;
  };
};

type AppSettings = {
  region: string;
  retries: number;
  flags: FeatureFlags;
};

const previous: AppSettings = {
  region: "us-east-1",
  retries: 3,
  flags: {
    auditLogs: true,
    exports: { csv: true, json: false },
  },
};

const next: AppSettings = {
  region: "us-east-1",
  retries: 3,
  flags: {
    auditLogs: true,
    exports: { csv: true, json: false },
  },
};

if (isEqual(previous, next)) {
  console.log("No settings update required");
} else {
  console.log("Persist updated settings");
}
```

This avoids false positives from reference inequality when two separately created objects contain the same values.

### Detect nested payload changes in API code

When your code receives JSON-like data from requests or queues, define the shape in your app and compare values with that type.

```typescript
import isEqual from "lodash.isequal";

type LineItem = {
  sku: string;
  quantity: number;
};

type OrderPayload = {
  orderId: string;
  customerId: string;
  items: LineItem[];
  metadata?: Record<string, string>;
};

function shouldRebuildInvoice(
  previousPayload: OrderPayload,
  nextPayload: OrderPayload,
): boolean {
  return !isEqual(previousPayload, nextPayload);
}

console.log(
  shouldRebuildInvoice(
    {
      orderId: "ord_1",
      customerId: "cus_1",
      items: [{ sku: "starter", quantity: 1 }],
    },
    {
      orderId: "ord_1",
      customerId: "cus_1",
      items: [{ sku: "starter", quantity: 2 }],
    },
  ),
);
```

The type safety comes from your `OrderPayload` definition. `isEqual()` checks values at runtime, but it does not validate unknown input against a schema.

### Compare optional nested values safely

If a field is optional, model that in TypeScript and compare the fully typed objects directly.

```typescript
import isEqual from "lodash.isequal";

type CacheConfig = {
  provider: "memory" | "redis";
  ttlSeconds?: number;
};

const baseline: CacheConfig = {
  provider: "memory",
};

const candidate: CacheConfig = {
  provider: "memory",
  ttlSeconds: undefined,
};

console.log(isEqual(baseline, candidate));
```

Keep the compared values typed at the application boundary so that missing and optional properties are visible in your editor and compiler.

## Important Pitfalls

- `@types/lodash.isequal` is a stub package. Install `lodash.isequal` instead.
- Import from `lodash.isequal`, not from `@types/lodash.isequal`.
- If `import isEqual from "lodash.isequal"` fails, enable `esModuleInterop` or switch to `import isEqual = require("lodash.isequal")`.
- `isEqual()` returns only `boolean`. It does not narrow union types or validate untrusted data.
- Deep equality is not the same as schema validation. Parse and validate external input before relying on its shape.
- If you are comparing large nested objects on hot paths, measure the cost in your application instead of assuming it is free.

## Version-Sensitive Notes

- This guide targets `@types/lodash.isequal==4.5.8`.
- The published `@types/lodash.isequal` package is a stub entry, not the recommended direct dependency for new projects.
- For modern TypeScript code, depend on `lodash.isequal` and use the declarations resolved from that runtime package.
- If an older lockfile still includes `@types/lodash.isequal`, remove the stub package before debugging duplicate or stale type issues.

## Official Sources

- https://www.npmjs.com/package/@types/lodash.isequal
- https://www.npmjs.com/package/lodash.isequal
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/lodash.isequal
