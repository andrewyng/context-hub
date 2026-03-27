---
name: lodash.pick
description: "TypeScript guidance for `lodash.pick`, including installation of the standalone runtime package and `@types/lodash.pick`, CommonJS-friendly imports, and practical object-shaping workflows."
metadata:
  languages: "typescript"
  versions: "4.4.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,lodash,lodash.pick,pick,object-shaping,types,definitelytyped,npm"
---

# lodash.pick TypeScript Guide

## Golden Rule

Install `lodash.pick` for runtime behavior and `@types/lodash.pick` for TypeScript declarations.

Import from `"lodash.pick"` in application code. Do not import from `"@types/lodash.pick"` directly.

There is no client initialization step, authentication flow, CLI setup, or package-specific environment variable.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install lodash.pick
npm install -D typescript @types/lodash.pick@4.4.9
```

If your project already uses TypeScript, add just the declarations:

```bash
npm install -D @types/lodash.pick@4.4.9
```

## Import Style And `tsconfig.json`

The published module uses CommonJS-style exports. The most direct TypeScript import form is:

```typescript
import pick = require("lodash.pick");
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
import pick from "lodash.pick";
```

Pick one import style and use it consistently.

## Common Workflows

### Return a public subset of a wider record

`pick()` is most useful at API boundaries where you want an allowlist of fields instead of manually rebuilding a new object.

```typescript
import pick = require("lodash.pick");

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

const user: UserRecord = {
  id: "u_123",
  email: "ada@example.com",
  passwordHash: "hashed-value",
  createdAt: "2026-03-13T00:00:00Z",
  updatedAt: "2026-03-13T00:00:00Z",
};

const publicUser = pick(user, ["id", "email", "createdAt"]);

console.log(publicUser.id);
console.log(publicUser.email);
```

This keeps the code focused on the fields you want to keep instead of the fields you want to remove.

### Build typed payloads for downstream helpers

`pick()` works well when another layer expects a smaller object shape.

```typescript
import pick = require("lodash.pick");

type Invoice = {
  id: string;
  customerId: string;
  amountCents: number;
  status: "draft" | "sent" | "paid";
  createdAt: string;
};

function sendInvoiceSummary(summary: Pick<Invoice, "id" | "customerId" | "status">): void {
  console.log(summary);
}

const invoice: Invoice = {
  id: "inv_001",
  customerId: "cus_123",
  amountCents: 2500,
  status: "sent",
  createdAt: "2026-03-13T00:00:00Z",
};

const summary = pick(invoice, ["id", "customerId", "status"]);

sendInvoiceSummary(summary);
```

In practice, this is the main integration boundary: `lodash.pick` shapes the runtime object while TypeScript checks that the picked result still matches the smaller contract you pass onward.

### Expose only safe application config

The package does not define environment variables, but it is common to use `pick()` on application config built from `process.env`.

```typescript
import pick = require("lodash.pick");

type AppConfig = {
  NODE_ENV: "development" | "test" | "production";
  API_BASE_URL: string;
  INTERNAL_TOKEN: string;
};

const config: AppConfig = {
  NODE_ENV: (process.env.NODE_ENV as AppConfig["NODE_ENV"] | undefined) ?? "development",
  API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:3000",
  INTERNAL_TOKEN: process.env.INTERNAL_TOKEN ?? "",
};

const clientConfig = pick(config, ["NODE_ENV", "API_BASE_URL"]);

console.log(clientConfig);
```

This keeps secret or server-only values out of payloads intended for browsers, logs, or templates.

## Minimal End-to-End Example

This example reads an incoming request body, keeps only the fields your update path accepts, and forwards the smaller typed object.

```typescript
import pick = require("lodash.pick");

type ProfileRecord = {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  role: "member" | "admin";
};

type ProfileUpdate = Pick<ProfileRecord, "displayName" | "timezone">;

function persistProfileUpdate(userId: string, update: ProfileUpdate): void {
  console.log(userId, update);
}

const requestBody: ProfileRecord = {
  id: "u_123",
  email: "ada@example.com",
  displayName: "Ada",
  timezone: "UTC",
  role: "admin",
};

const update = pick(requestBody, ["displayName", "timezone"]);

persistProfileUpdate(requestBody.id, update);
```

## Important Pitfalls

- `@types/lodash.pick` is a declaration package only. Keep `lodash.pick` in your runtime dependencies.
- Do not import from `@types/lodash.pick`; import from `lodash.pick`.
- If `import pick from "lodash.pick"` fails, enable `esModuleInterop` or switch to `import pick = require("lodash.pick")`.
- `pick()` shapes a value you already trust; it does not validate unknown input or coerce untyped data into a safe schema.
- If your key list comes from a generic `string[]`, TypeScript usually has less precise information than when you pass explicit property names.
- If your project already uses the full `lodash` package, decide whether to standardize on full-package imports or standalone per-method modules instead of mixing styles casually.

## Version-Sensitive Notes

- This guide targets `@types/lodash.pick==4.4.9`.
- The declarations are maintained in DefinitelyTyped and are intended for the standalone `lodash.pick` npm module.
- In application code, the important module specifier is still `lodash.pick`; the `@types` package only adds compile-time information.

## Official Sources

- https://www.npmjs.com/package/@types/lodash.pick
- https://www.npmjs.com/package/lodash.pick
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/lodash.pick
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/lodash.pick/index.d.ts
- https://lodash.com/docs/#pick
- https://www.typescriptlang.org/tsconfig#esModuleInterop
