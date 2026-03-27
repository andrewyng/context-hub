---
name: lodash.omit
description: "TypeScript guidance for `lodash.omit`, including installation of the standalone runtime package and `@types/lodash.omit`, CommonJS-friendly imports, and practical object-redaction workflows."
metadata:
  languages: "typescript"
  versions: "4.5.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,lodash,lodash.omit,omit,object-shaping,types,definitelytyped,npm"
---

# lodash.omit TypeScript Guide

## Golden Rule

Install `lodash.omit` for runtime behavior and `@types/lodash.omit` for TypeScript declarations.

Import from `"lodash.omit"` in application code. Do not import from `"@types/lodash.omit"` directly.

There is no client initialization step, authentication flow, CLI, or package-defined environment variable.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install lodash.omit
npm install -D typescript @types/lodash.omit@4.5.9
```

If your project already uses TypeScript, add just the declarations:

```bash
npm install -D @types/lodash.omit@4.5.9
```

## Initialization And `tsconfig.json`

The published module uses CommonJS-style exports. The most direct TypeScript import form is:

```typescript
import omit = require("lodash.omit");
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
import omit from "lodash.omit";
```

Pick one import style and use it consistently.

## Common Workflows

### Remove sensitive fields before logging or returning data

`omit()` is most useful at API and logging boundaries where one or two fields must be stripped from an otherwise valid object.

```typescript
import omit = require("lodash.omit");

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  refreshToken: string;
  createdAt: string;
};

const user: UserRecord = {
  id: "u_123",
  email: "ada@example.com",
  passwordHash: "hashed-value",
  refreshToken: "rt_123",
  createdAt: "2026-03-13T00:00:00Z",
};

const safeForLogs = omit(user, ["passwordHash", "refreshToken"]);

console.log(safeForLogs.email);
console.log(safeForLogs.createdAt);
```

### Strip generated fields before inserts or updates

This pattern is useful when your application keeps a full database record in memory but needs a smaller write payload.

```typescript
import omit = require("lodash.omit");

type InvoiceRow = {
  id: string;
  customerId: string;
  amountCents: number;
  status: "draft" | "sent";
  createdAt: string;
  updatedAt: string;
};

const invoice: InvoiceRow = {
  id: "inv_001",
  customerId: "cus_123",
  amountCents: 2500,
  status: "draft",
  createdAt: "2026-03-13T00:00:00Z",
  updatedAt: "2026-03-13T00:00:00Z",
};

const insertableInvoice = omit(invoice, ["id", "createdAt", "updatedAt"]);

console.log(insertableInvoice.customerId);
console.log(insertableInvoice.status);
```

### Wrap `omit()` in a typed redaction helper

If you remove the same fields in many places, centralize the call in a helper so the runtime behavior and the type boundary stay together.

```typescript
import omit = require("lodash.omit");

function redactKeys<T extends object, K extends keyof T>(value: T, keys: K[]) {
  return omit(value, keys);
}

type ApiSecret = {
  id: string;
  label: string;
  apiKey: string;
  createdAt: string;
};

const secret: ApiSecret = {
  id: "sec_123",
  label: "production",
  apiKey: "sk_live_123",
  createdAt: "2026-03-13T00:00:00Z",
};

const safeSecret = redactKeys(secret, ["apiKey"]);

console.log(safeSecret.label);
```

Use literal key arrays when possible. They are the clearest fit for `omit()` and keep the callsite easy to read.

## Minimal End-to-End Example

This example uses an app-defined environment variable to add extra redacted fields before writing an audit event. The package itself does not require any environment variables.

```typescript
import omit = require("lodash.omit");

type AuditEvent = {
  id: string;
  actorEmail: string;
  apiKey: string;
  sessionToken: string;
  action: "create" | "update" | "delete";
  createdAt: string;
};

const extraFields = (process.env.AUDIT_REDACT_FIELDS ?? "")
  .split(",")
  .map((field) => field.trim())
  .filter(Boolean);

const event: AuditEvent = {
  id: "evt_123",
  actorEmail: "ops@example.com",
  apiKey: "sk_live_123",
  sessionToken: "sess_123",
  action: "update",
  createdAt: "2026-03-13T00:00:00Z",
};

const safeEvent = omit(event, ["apiKey", "sessionToken", ...extraFields]);

console.log(JSON.stringify(safeEvent, null, 2));
```

Run the compiled program with an extra application-specific redaction field if needed:

```bash
AUDIT_REDACT_FIELDS=actorEmail node dist/index.js
```

## Important Pitfalls

- `@types/lodash.omit` is a declaration package only. Install `lodash.omit` separately for runtime behavior.
- Do not import from `@types/lodash.omit` in application code.
- If `import omit from "lodash.omit"` fails, enable `esModuleInterop` or switch to `import omit = require("lodash.omit")`.
- `omit()` returns a new object; it does not mutate the original input.
- Lodash documents `omit()` as slower than `pick()`. If you already know the fields to keep, prefer `pick()` or another allowlist-style transform.
- If your project already uses the full `lodash` package, keep imports consistent across the codebase instead of mixing `_.omit()` and `lodash.omit` without a reason.

## Version-Sensitive Notes

- This guide targets `@types/lodash.omit==4.5.9`.
- The declarations are maintained in DefinitelyTyped and are intended for the standalone `lodash.omit` npm module.
- In application code, the important module specifier is `lodash.omit`; the `@types` package only adds compile-time information.

## Official Sources

- https://www.npmjs.com/package/@types/lodash.omit
- https://www.npmjs.com/package/lodash.omit
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/lodash.omit
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/lodash.omit/index.d.ts
- https://lodash.com/docs/4.17.21#omit
