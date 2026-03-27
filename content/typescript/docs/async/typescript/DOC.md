---
name: async
description: "TypeScript declarations for async collection helpers, control-flow utilities, and queue-style workflows used through the `async` runtime package."
metadata:
  languages: "typescript"
  versions: "3.2.25"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,async,node,callbacks,promises,types,definitelytyped"
---

# Async TypeScript Guide

## Golden Rule

Install `@types/async` alongside the real `async` runtime package.

`@types/async` only provides TypeScript declarations. Your application imports and executes `async`; the declaration package supplies types for collection helpers such as `mapLimit()` and `forEachOf()`, control-flow helpers such as `parallel()` and `auto()`, and the callback-optional promise forms documented for the v3 runtime.

## Install

Install the runtime package first, then add TypeScript and the declaration package.

```bash
npm install async
npm install -D typescript @types/async @types/node
```

If your project already depends on `async`, add only the missing declarations:

```bash
npm install -D @types/async @types/node
```

`@types/async` does not require credentials, API keys, or package-specific environment variables.

## Initialization

The important setup points are your import style, your compiler options, and whether you use callback-based or promise-based call sites.

### Import `async`

The safest import form for these declarations is:

```typescript
import async = require("async");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import async from "async";
```

Import from `async`, never from `@types/async`.

### Recommended `tsconfig.json`

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

If you restrict ambient type packages with `compilerOptions.types`, include `async` and any platform types your app needs:

```json
{
  "compilerOptions": {
    "types": ["node", "async"]
  }
}
```

## Common Workflows

### Limit concurrency with `mapLimit()`

The maintainer docs describe `mapLimit(coll, limit, iteratee, callback)` as a bounded variant of `map()`. When you omit the final callback, it returns a promise, which is usually the cleanest TypeScript boundary.

```typescript
import async = require("async");

type UserJob = {
  userId: string;
};

type UserSummary = {
  userId: string;
  ok: boolean;
  status: number;
};

const apiBaseUrl = process.env.API_BASE_URL ?? "https://example.internal";
const concurrency = Number(process.env.ASYNC_CONCURRENCY ?? "4");

export async function fetchUsers(jobs: UserJob[]): Promise<UserSummary[]> {
  return async.mapLimit(jobs, concurrency, async (job) => {
    const response = await fetch(`${apiBaseUrl}/users/${job.userId}`);

    return {
      userId: job.userId,
      ok: response.ok,
      status: response.status,
    };
  });
}
```

`API_BASE_URL` and `ASYNC_CONCURRENCY` are normal application settings, not package requirements.

### Run independent tasks with `parallel()`

`parallel()` accepts either an array or an object of tasks. The object form is usually easier to work with in TypeScript because the result stays keyed by task name.

```typescript
import async = require("async");

type FeatureFlags = {
  auditLogs: boolean;
  betaSearch: boolean;
};

type CurrentUser = {
  id: string;
  email: string;
};

export async function loadDashboardData(): Promise<{
  flags: FeatureFlags;
  currentUser: CurrentUser;
}> {
  return async.parallel({
    flags: async () => {
      return {
        auditLogs: true,
        betaSearch: false,
      } satisfies FeatureFlags;
    },
    currentUser: async () => {
      return {
        id: "u_123",
        email: "ada@example.com",
      } satisfies CurrentUser;
    },
  });
}
```

This keeps the typed integration boundary small: the rest of your app can consume `flags` and `currentUser` directly instead of indexing into an array result.

### Iterate keyed objects with `forEachOf()`

`forEachOf()` is the right choice when the key matters. The maintainer README uses it for environment-specific config loading, and the type declarations model the `item`, `key`, and completion callback parameters together.

```typescript
import async = require("async");
import { readFile } from "node:fs";

const configFiles = {
  dev: "./config/dev.json",
  test: "./config/test.json",
  prod: "./config/prod.json",
};

type AppConfig = {
  baseUrl: string;
};

export function loadConfigs(): Promise<Record<string, AppConfig>> {
  const loaded: Record<string, AppConfig> = {};

  return async.forEachOf(configFiles, (filePath, environment, callback) => {
    readFile(filePath, "utf8", (error, contents) => {
      if (error) {
        callback(error);
        return;
      }

      try {
        loaded[environment] = JSON.parse(contents) as AppConfig;
        callback(null);
      } catch (parseError) {
        callback(parseError as Error);
      }
    });
  }).then(() => loaded);
}
```

This is a practical pattern when your project still uses Node-style callbacks at the file-system boundary but wants promise-based composition at the function boundary.

### Build dependency-aware steps with `auto()`

`auto()` lets you declare task dependencies by name. Omit the final callback and `await` the result object when you want a typed pipeline output.

```typescript
import async = require("async");

type UserRecord = {
  id: string;
};

export async function buildUserReport(): Promise<{
  settings: { timeoutMs: number };
  users: UserRecord[];
  summary: { timeoutMs: number; userCount: number };
}> {
  return async.auto({
    settings(callback) {
      callback(null, { timeoutMs: 5_000 });
    },
    users(callback) {
      callback(null, [{ id: "u_1" }, { id: "u_2" }]);
    },
    summary: ["settings", "users", (results, callback) => {
      callback(null, {
        timeoutMs: results.settings.timeoutMs,
        userCount: results.users.length,
      });
    }],
  });
}
```

Use `auto()` when later steps depend on earlier results by name. Use `parallel()` when tasks are independent.

## Minimal End-to-End Example

This example reads an app-specific concurrency setting from the environment, processes jobs with `mapLimit()`, and returns plain typed results.

```typescript
import async = require("async");

type EmailJob = {
  email: string;
};

type EmailCheck = {
  email: string;
  accepted: boolean;
};

const concurrency = Number(process.env.ASYNC_CONCURRENCY ?? "3");

async function verifyEmails(jobs: EmailJob[]): Promise<EmailCheck[]> {
  return async.mapLimit(jobs, concurrency, async (job) => {
    return {
      email: job.email,
      accepted: job.email.endsWith("@example.com"),
    };
  });
}

async function main(): Promise<void> {
  const results = await verifyEmails([
    { email: "ada@example.com" },
    { email: "grace@example.org" },
    { email: "linus@example.com" },
  ]);

  console.log(results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Run the built file with an optional concurrency override:

```bash
ASYNC_CONCURRENCY=5 node dist/index.js
```

## Important Pitfalls

- `@types/async` is a declaration package only. Install `async` separately for the runtime.
- Import from `async`, not from `@types/async`.
- `import async from "async"` depends on `esModuleInterop` or `allowSyntheticDefaultImports`; `import async = require("async")` is the most portable form.
- If you use `compilerOptions.types`, include `async` or TypeScript will not automatically load the package declarations.
- Prefer one completion style per call site: either pass the final callback, or omit it and `await` the returned promise.
- Keep your runtime on the async v3 API surface these declarations describe.

## Version-Sensitive Notes

- This guide targets `@types/async==3.2.25`.
- The examples here follow the async v3 runtime documentation and README examples for `mapLimit()`, `parallel()`, `forEachOf()`, and `auto()`.
