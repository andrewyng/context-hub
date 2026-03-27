---
name: lodash
description: "TypeScript declarations for Lodash 4, including safe installation, CommonJS-friendly imports, typed utility helpers, and the boundary between the `lodash` runtime and `@types/lodash`."
metadata:
  languages: "typescript"
  versions: "4.17.24"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,lodash,utility,types,definitelytyped,npm"
---

# lodash TypeScript Guide

## Golden Rule

Install `lodash` for runtime behavior and `@types/lodash` for compile-time declarations.

Import from `"lodash"` in application code. Do not import from `"@types/lodash"` directly.

This package tracks the Lodash 4 API surface. Use it when your project calls helpers such as `_.groupBy()`, `_.keyBy()`, `_.pick()`, `_.debounce()`, and `_.get()` from the `lodash` runtime package.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install lodash
npm install -D typescript @types/lodash@4.17.24
```

If your project already has TypeScript, add only the Lodash declarations:

```bash
npm install -D @types/lodash@4.17.24
```

There is no client object, authentication flow, or package-specific environment variable.

## Import Style And `tsconfig.json`

The declaration package is designed for the `lodash` module, not for a separate `@types/lodash` import path.

The most direct import form in TypeScript is the CommonJS-compatible syntax:

```typescript
import _ = require("lodash");
```

If your project already enables interop for default imports, this also works:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true
  }
}
```

```typescript
import _ from "lodash";
```

Use one import style consistently across the project.

## Common Workflows

### Group, index, and reshape collections

Lodash's collection helpers preserve useful type information for common array-to-object and array-to-array transforms.

```typescript
import _ = require("lodash");

type User = {
  id: string;
  orgId: string;
  email: string;
  active: boolean;
};

const users: User[] = [
  { id: "u_1", orgId: "org_a", email: "ada@example.com", active: true },
  { id: "u_2", orgId: "org_a", email: "grace@example.com", active: false },
  { id: "u_3", orgId: "org_b", email: "linus@example.com", active: true },
];

const usersById = _.keyBy(users, "id");
const usersByOrg = _.groupBy(users, "orgId");
const activeEmails = _.map(_.filter(users, { active: true }), "email");

console.log(usersById.u_1.email);
console.log(usersByOrg.org_a.length);
console.log(activeEmails);
```

### Read nested values with a typed fallback

`_.get()` is most useful in TypeScript when you provide a default value for optional nested data.

```typescript
import _ = require("lodash");

type AppConfig = {
  cache?: {
    ttlSeconds?: number;
  };
  flags?: {
    auditLogs?: boolean;
  };
};

const config: AppConfig = {};

const ttlSeconds = _.get(config, "cache.ttlSeconds", 60);
const auditLogsEnabled = _.get(config, "flags.auditLogs", false);

console.log(ttlSeconds);
console.log(auditLogsEnabled);
```

Without a fallback, nested lookups often include `undefined` in the result type and require an extra runtime check.

### Create smaller payloads with `pick()` and `omit()`

These helpers are convenient at API boundaries where you need to shape data before sending it to another layer.

```typescript
import _ = require("lodash");

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const user: UserRecord = {
  id: "u_1",
  email: "ada@example.com",
  passwordHash: "hashed",
  createdAt: "2026-03-13T00:00:00Z",
};

const publicUser = _.pick(user, ["id", "email", "createdAt"]);
const safeForLogs = _.omit(user, ["passwordHash"]);

console.log(publicUser);
console.log(safeForLogs);
```

### Debounce event-driven work

`_.debounce()` is a common place where the Lodash types matter in real apps because the returned function also exposes `cancel()` and `flush()`.

```typescript
import _ = require("lodash");

type SearchInput = {
  query: string;
};

const sendSearch = _.debounce((input: SearchInput) => {
  console.log(`Searching for ${input.query}`);
}, 250, { maxWait: 1000 });

sendSearch({ query: "typescript lodash" });
sendSearch.flush();
sendSearch.cancel();
```

## Minimal End-to-End Example

This example uses a small in-memory dataset, reads a search prefix from the environment, and returns grouped results with Lodash helpers.

```typescript
import _ = require("lodash");

type PackageRow = {
  name: string;
  scope: "runtime" | "types";
};

const rows: PackageRow[] = [
  { name: "lodash", scope: "runtime" },
  { name: "@types/lodash", scope: "types" },
  { name: "lodash-es", scope: "runtime" },
];

const prefix = process.env.PACKAGE_PREFIX ?? "lod";

const grouped = _.groupBy(
  rows.filter((row) => row.name.startsWith(prefix)),
  "scope",
);

console.log(grouped);
```

Run it with an app-specific environment variable if you want a different filter:

```bash
PACKAGE_PREFIX=@types node dist/index.js
```

## Important Pitfalls

- `@types/lodash` is a declaration package only. Install `lodash` separately for the runtime.
- Do not import from `@types/lodash` in application code.
- `import _ = require("lodash")` is the safest import form when you want to match the CommonJS-oriented declarations directly.
- If you prefer `import _ from "lodash"`, enable `compilerOptions.esModuleInterop` in TypeScript.
- `_.get()` without a default value often produces a type that still includes `undefined`.
- Keep the Lodash runtime on the Lodash 4 API surface that these declarations describe.

## Version-Sensitive Notes

- This guide targets `@types/lodash==4.17.24`.
- These declarations are intended for the `lodash` package, not as a standalone runtime.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/lodash
- DefinitelyTyped source for `@types/lodash`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/lodash
- `@types/lodash` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/lodash/index.d.ts
- Lodash documentation: https://lodash.com/docs/
- TypeScript `esModuleInterop` reference: https://www.typescriptlang.org/tsconfig#esModuleInterop
