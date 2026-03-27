---
name: lodash.clonedeep
description: "TypeScript guidance for `lodash.clonedeep`, including installation of the runtime package and `@types/lodash.clonedeep`, CommonJS-friendly imports, and practical `cloneDeep()` workflows."
metadata:
  languages: "typescript"
  versions: "4.5.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,lodash,clonedeep,types,definitelytyped,npm"
---

# lodash.clonedeep TypeScript Guide

## Golden Rule

Install `lodash.clonedeep` for runtime behavior and `@types/lodash.clonedeep` for TypeScript declarations.

Import from `"lodash.clonedeep"` in application code. Do not import from `"@types/lodash.clonedeep"` directly.

There is no client initialization step, authentication flow, CLI setup, or package-specific environment variable.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install lodash.clonedeep
npm install -D typescript @types/lodash.clonedeep@4.5.9
```

If your project already uses TypeScript, add just the declarations:

```bash
npm install -D @types/lodash.clonedeep@4.5.9
```

## Import Style And `tsconfig.json`

The published module uses CommonJS-style exports. The most direct TypeScript import form is:

```typescript
import cloneDeep = require("lodash.clonedeep");
```

If your project already enables default-import interop, this also works:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true
  }
}
```

```typescript
import cloneDeep from "lodash.clonedeep";
```

Pick one import style and use it consistently.

## Common Workflows

### Clone nested configuration before mutation

`cloneDeep()` is most useful when you need a writable copy of nested application data without changing the original value.

```typescript
import cloneDeep = require("lodash.clonedeep");

type FeatureFlags = {
  auditLogs: boolean;
  exports: {
    csv: boolean;
    json: boolean;
  };
};

type AppConfig = {
  region: string;
  retries: number;
  flags: FeatureFlags;
};

const baseConfig: AppConfig = {
  region: "us-east-1",
  retries: 3,
  flags: {
    auditLogs: false,
    exports: { csv: true, json: false },
  },
};

const previewConfig = cloneDeep(baseConfig);
previewConfig.flags.auditLogs = true;
previewConfig.flags.exports.json = true;

console.log(baseConfig.flags.auditLogs);
console.log(previewConfig.flags.auditLogs);
```

The cloned value keeps the same static TypeScript shape as the original value.

### Return updated state from helper functions

When you want immutable-style updates in service code or reducers, clone first and then update the copy.

```typescript
import cloneDeep = require("lodash.clonedeep");

type CartItem = {
  sku: string;
  quantity: number;
};

type Cart = {
  customerId: string;
  items: CartItem[];
  metadata: {
    currency: "USD" | "EUR";
    updatedBy: string;
  };
};

function addItem(cart: Cart, item: CartItem, updatedBy: string): Cart {
  const next = cloneDeep(cart);
  next.items.push(item);
  next.metadata.updatedBy = updatedBy;
  return next;
}

const original: Cart = {
  customerId: "cus_123",
  items: [{ sku: "starter", quantity: 1 }],
  metadata: {
    currency: "USD",
    updatedBy: "system",
  },
};

const updated = addItem(original, { sku: "pro", quantity: 1 }, "agent");

console.log(original.items.length);
console.log(updated.items.length);
```

This pattern works well when your application types already describe the nested data you want to copy.

### Wrap `cloneDeep()` in typed utilities

The declaration package preserves the input type, so local helpers can stay generic.

```typescript
import cloneDeep = require("lodash.clonedeep");

function duplicateTemplate<T>(value: T): T {
  return cloneDeep(value);
}

const template = {
  id: "tmpl_1",
  schedule: {
    cron: "0 * * * *",
    enabled: true,
  },
};

const copy = duplicateTemplate(template);
copy.schedule.enabled = false;
```

This is the main type-system benefit in day-to-day use: the cloned value flows through your code as the same `T` you passed in.

## Important Pitfalls

- `@types/lodash.clonedeep` does not provide runtime code. Keep `lodash.clonedeep` in your production dependencies.
- Do not import from `@types/lodash.clonedeep`; import from `lodash.clonedeep`.
- If `import cloneDeep from "lodash.clonedeep"` fails, enable `esModuleInterop` or switch to `import cloneDeep = require("lodash.clonedeep")`.
- `cloneDeep()` preserves the static TypeScript type you supply, but it does not validate unknown input. Parse or validate untrusted data before relying on its shape.
- If your project already uses the full `lodash` package, keep your imports consistent across the codebase instead of mixing full-package and single-function module styles casually.

## Version-Sensitive Notes

- This guide targets `@types/lodash.clonedeep==4.5.9`.
- The declarations are maintained in DefinitelyTyped and are intended for the standalone `lodash.clonedeep` npm module.
- In application code, the important module specifier is still `lodash.clonedeep`; the `@types` package only adds compile-time information.

## Official Sources

- https://www.npmjs.com/package/@types/lodash.clonedeep
- https://www.npmjs.com/package/lodash.clonedeep
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/lodash.clonedeep
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/lodash.clonedeep/index.d.ts
- https://lodash.com/docs/#cloneDeep
