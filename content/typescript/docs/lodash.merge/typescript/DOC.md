---
name: lodash.merge
description: "TypeScript guidance for `lodash.merge`, including installation of the runtime package and `@types/lodash.merge`, CommonJS-friendly imports, and practical `merge()` workflows."
metadata:
  languages: "typescript"
  versions: "4.6.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,lodash,lodash.merge,merge,types,definitelytyped,npm"
---

# lodash.merge TypeScript Guide

## Golden Rule

Install `lodash.merge` for runtime behavior and `@types/lodash.merge` for TypeScript declarations.

Import from `"lodash.merge"` in application code. Do not import from `"@types/lodash.merge"` directly.

There is no client initialization step, authentication flow, CLI setup, or package-specific environment variable.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install lodash.merge
npm install -D typescript @types/lodash.merge@4.6.9
```

If your project already uses TypeScript, add just the declarations:

```bash
npm install -D @types/lodash.merge@4.6.9
```

## Import Style And `tsconfig.json`

The published module uses CommonJS-style exports. The most direct TypeScript import form is:

```typescript
import merge = require("lodash.merge");
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
import merge from "lodash.merge";
```

Pick one import style and use it consistently.

## Common Workflows

### Merge layered configuration without mutating the inputs

`merge()` mutates its first argument. Pass `{}` as the destination when you want a new merged object instead of changing an existing value.

```typescript
import merge = require("lodash.merge");

type AppConfig = {
  region: string;
  retries: {
    maxAttempts: number;
    backoffMs: number;
  };
  features: {
    auditLogs: boolean;
    exports: {
      csv: boolean;
      json: boolean;
    };
  };
};

const defaults: AppConfig = {
  region: "us-east-1",
  retries: {
    maxAttempts: 3,
    backoffMs: 250,
  },
  features: {
    auditLogs: false,
    exports: {
      csv: true,
      json: false,
    },
  },
};

const environmentOverrides = {
  retries: {
    maxAttempts: 5,
  },
};

const requestOverrides = {
  features: {
    auditLogs: true,
  },
};

const effectiveConfig = merge({}, defaults, environmentOverrides, requestOverrides);

console.log(effectiveConfig.retries.maxAttempts);
console.log(effectiveConfig.features.auditLogs);
console.log(defaults.features.auditLogs);
```

This is the most practical day-to-day pattern: keep your source objects typed, and merge them into a fresh object at the boundary where you assemble configuration.

### Apply nested overrides in helper functions

For typed application settings, `merge()` is useful when an override only updates part of a nested object.

```typescript
import merge = require("lodash.merge");

type NotificationSettings = {
  email: {
    enabled: boolean;
    fromAddress: string;
  };
  webhooks: {
    enabled: boolean;
    endpoint: string;
  };
};

type NotificationOverride = {
  email?: {
    enabled?: boolean;
    fromAddress?: string;
  };
  webhooks?: {
    enabled?: boolean;
    endpoint?: string;
  };
};

function applyOverride(
  current: NotificationSettings,
  override: NotificationOverride,
): NotificationSettings {
  return merge({}, current, override);
}

const settings = applyOverride(
  {
    email: {
      enabled: true,
      fromAddress: "noreply@example.com",
    },
    webhooks: {
      enabled: false,
      endpoint: "https://example.com/hooks/default",
    },
  },
  {
    webhooks: {
      enabled: true,
      endpoint: "https://example.com/hooks/orders",
    },
  },
);

console.log(settings.webhooks.enabled);
console.log(settings.email.fromAddress);
```

The important integration boundary is still your own application type. `merge()` combines values at runtime, but the safety comes from the types you define for `current` and `override`.

### Be careful when merging arrays

`merge()` recursively merges arrays by index. It does not concatenate them.

```typescript
import merge = require("lodash.merge");

const defaults = {
  stages: ["draft", "review", "publish"],
};

const override = {
  stages: ["queued"],
};

const result = merge({}, defaults, override);

console.log(result.stages);
```

The result is `['queued', 'review', 'publish']`, not `['queued']` and not a concatenated array. If you want replacement or concatenation semantics, handle arrays explicitly before or after the merge.

## Important Pitfalls

- `@types/lodash.merge` does not provide runtime code. Keep `lodash.merge` in your production dependencies.
- Do not import from `@types/lodash.merge`; import from `lodash.merge`.
- `merge()` mutates the first argument. Use `merge({}, ...)` when you need an immutable-style result.
- Later source properties with value `undefined` do not clear an existing destination value.
- Arrays are merged by index, which is often surprising when you expected replacement.
- `merge()` preserves the static TypeScript types you provide, but it does not validate untrusted input.
- If your project already uses the full `lodash` package, keep imports consistent across the codebase instead of mixing full-package and single-function module styles casually.

## Minimal End-to-End Example

```typescript
import merge = require("lodash.merge");

type ServerConfig = {
  host: string;
  port: number;
  cors: {
    enabled: boolean;
    origins: string[];
  };
};

const defaults: ServerConfig = {
  host: "127.0.0.1",
  port: 3000,
  cors: {
    enabled: true,
    origins: ["http://localhost:3000"],
  },
};

const envOverrides = {
  port: process.env.PORT ? Number(process.env.PORT) : undefined,
};

const userOverrides = {
  cors: {
    enabled: false,
  },
};

const config = merge({}, defaults, envOverrides, userOverrides);

console.log(config.host);
console.log(config.port);
console.log(config.cors.enabled);
```

This is the practical boundary for `@types/lodash.merge`: install the runtime package, let TypeScript resolve the declarations automatically, and call `merge()` on typed objects in your own application code.

## Version-Sensitive Notes

- This guide targets `@types/lodash.merge==4.6.9`.
- The declarations are maintained in DefinitelyTyped for the standalone `lodash.merge` npm module.
- In application code, the important module specifier is still `lodash.merge`; the `@types` package only adds compile-time information.

## Official Sources

- https://www.npmjs.com/package/@types/lodash.merge
- https://www.npmjs.com/package/lodash.merge
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/lodash.merge
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/lodash.merge/index.d.ts
- https://lodash.com/docs/#merge
