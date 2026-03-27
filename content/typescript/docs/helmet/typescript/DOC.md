---
name: helmet
description: "TypeScript guidance for Helmet projects that encounter the @types/helmet 4.0.0 stub package"
metadata:
  languages: "typescript"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,helmet,express,security,middleware,types"
---

# Helmet TypeScript Guide

`@types/helmet@4.0.0` is the type-package entry point many projects still encounter in dependency history, but current application code should install and import the `helmet` runtime package itself.

For TypeScript users, the practical rule is simple: import from `"helmet"`, not from `"@types/helmet"`.

## Install

Install Helmet with Express, then add the TypeScript and Express declarations your server needs:

```bash
npm install express helmet
npm install --save-dev typescript @types/express @types/node
```

If your project still lists `@types/helmet`, remove it and keep `helmet`:

```bash
npm uninstall @types/helmet
npm install helmet
```

Helmet does not require credentials, API keys, or environment variables.

## TypeScript Setup

No special Helmet-specific `tsconfig.json` settings are required. In a normal server project, importing `helmet` is enough.

A typical strict Node.js setup looks like this:

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

If your project restricts ambient type packages with `compilerOptions.types`, keep the server-side types that your app actually uses:

```json
{
  "compilerOptions": {
    "types": ["node", "express"]
  }
}
```

You still import Helmet from `"helmet"`; there is no separate runtime import path for `@types/helmet`.

## Add Helmet To An Express App

Use the middleware returned by `helmet()` near the top of your middleware stack so security headers are applied to most responses.

```typescript
import express from "express";
import helmet from "helmet";

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(3000);
```

This is the main integration point for TypeScript code: `helmet()` returns Express-compatible middleware, so you compose it with `app.use()` just like other request handlers.

## Reuse Helmet As Typed Middleware

When you wrap middleware setup in helpers, type the return value as an Express `RequestHandler` instead of reaching into any declaration-package internals.

```typescript
import type { RequestHandler } from "express";
import helmet from "helmet";

export function createSecurityHeaders(): RequestHandler {
  return helmet();
}
```

This keeps your application boundary stable even if your project upgrades the runtime package later.

## Apply Helmet To Part Of An App

You can create the middleware once and mount it on a sub-path or router.

```typescript
import express from "express";
import helmet from "helmet";

const app = express();
const apiSecurity = helmet();

app.use("/api", apiSecurity);

app.get("/", (_req, res) => {
  res.send("public landing page");
});

app.get("/api/users", (_req, res) => {
  res.json([{ id: 1, name: "Ada" }]);
});
```

## Common Pitfalls

- Install `helmet` for runtime behavior; `@types/helmet` is not a runtime library.
- Import from `"helmet"`, not from `"@types/helmet"`.
- If TypeScript cannot resolve Express symbols such as `RequestHandler`, add `@types/express` and `@types/node` to the project that compiles your server.
- If older project docs tell you to install both `helmet` and `@types/helmet`, prefer the runtime package first and keep your imports pointed at `helmet`.

## Version Note For `@types/helmet` 4.0.0

For this package version, the useful TypeScript workflow is centered on the `helmet` runtime package rather than on a standalone declaration API. Treat `@types/helmet` as a transitional declaration package you may still see in older dependency trees, not as the package your application code should import.
