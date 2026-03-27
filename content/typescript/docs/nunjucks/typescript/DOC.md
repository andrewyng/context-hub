---
name: nunjucks
description: "TypeScript declarations for configuring Nunjucks environments, rendering templates, and typing the integration boundary with the Nunjucks runtime."
metadata:
  languages: "typescript"
  versions: "3.2.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,nunjucks,templates,node,express,types,definitelytyped"
---

# Nunjucks TypeScript Guide

Install `@types/nunjucks` alongside the real `nunjucks` runtime package.

`@types/nunjucks` provides TypeScript declarations only. Your application imports and runs `nunjucks`; the declaration package supplies types for `configure()`, `Environment`, loaders, filters, globals, `render()`, and `renderString()`.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install nunjucks
npm install -D typescript @types/node @types/nunjucks
```

If your project already depends on `nunjucks`, add only the missing declarations:

```bash
npm install -D @types/node @types/nunjucks
```

Nunjucks does not require API keys, credentials, or package-specific environment variables.

## TypeScript Setup

The declarations are for the `nunjucks` module itself. Import from `"nunjucks"`, never from `"@types/nunjucks"`.

### Import `nunjucks`

With `esModuleInterop` or `allowSyntheticDefaultImports`, use the default import form:

```typescript
import nunjucks from "nunjucks";
```

If your project keeps CommonJS-style imports, use `import = require()`:

```typescript
import nunjucks = require("nunjucks");
```

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

If your project restricts ambient type packages with `compilerOptions.types`, include the packages used by the code that renders templates:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

## Create A Reusable Environment

Use `configure()` when you want a simple file-based setup for server-side templates.

```typescript
import path from "node:path";
import nunjucks from "nunjucks";

const viewsDir = path.join(process.cwd(), "views");

export const env = nunjucks.configure(viewsDir, {
  autoescape: true,
  noCache: process.env.NODE_ENV !== "production",
  watch: process.env.NODE_ENV === "development",
  throwOnUndefined: true,
  trimBlocks: true,
  lstripBlocks: true,
});
```

This returns a typed `Environment` instance that you can reuse across route handlers, email rendering helpers, and background jobs.

If you want explicit loader construction, create the loader yourself and pass it to `Environment`:

```typescript
import nunjucks from "nunjucks";

const loader = new nunjucks.FileSystemLoader(["views", "shared/views"], {
  noCache: process.env.NODE_ENV !== "production",
});

export const env = new nunjucks.Environment(loader, {
  autoescape: true,
  throwOnUndefined: true,
});
```

## Render Templates

### Render a template file

```typescript
import { env } from "./nunjucks-env";

const html = env.render("emails/welcome.njk", {
  user: {
    firstName: "Ada",
  },
  productName: "Project Atlas",
});
```

### Render from a string

```typescript
import { env } from "./nunjucks-env";

const preview = env.renderString("Hello {{ name }}!", {
  name: "Ada",
});
```

If you already have an `Environment`, prefer `env.render()` and `env.renderString()` so your configured loaders, globals, and filters are used consistently.

## Type The Data You Pass Into Templates

The declaration package types the Nunjucks API surface, not the contents of your template files. The safest pattern is to type each view model at the application boundary.

```typescript
import { env } from "./nunjucks-env";

interface WelcomeEmailView {
  user: {
    firstName: string;
  };
  productName: string;
  loginUrl: string;
}

export function renderWelcomeEmail(view: WelcomeEmailView): string {
  return env.render("emails/welcome.njk", view);
}
```

This keeps the data you send to templates checked by TypeScript even though template variable names are not statically verified.

## Add Custom Filters And Globals

Register filters and globals on the shared environment before rendering.

```typescript
import { env } from "./nunjucks-env";

env.addFilter("currency", (amountCents: number) => {
  return `$${(amountCents / 100).toFixed(2)}`;
});

env.addGlobal("cdnBaseUrl", process.env.CDN_BASE_URL ?? "");

const html = env.renderString(
  "<img src=\"{{ cdnBaseUrl }}/logo.svg\"> {{ total | currency }}",
  { total: 2599 },
);
```

For asynchronous filters, use Nunjucks' callback-based async filter API and pass `true` as the third argument to `addFilter()`.

```typescript
import { env } from "./nunjucks-env";

env.addFilter(
  "loadDisplayName",
  (userId: string, callback: (err: Error | null, result?: string) => void) => {
    lookupDisplayName(userId)
      .then((displayName) => callback(null, displayName))
      .catch((error: unknown) => {
        callback(error instanceof Error ? error : new Error("lookup failed"));
      });
  },
  true,
);

async function lookupDisplayName(userId: string): Promise<string> {
  return `user:${userId}`;
}
```

## Use Nunjucks With Express

When you integrate Nunjucks into an Express app, pass the app instance in the `express` option during configuration.

```typescript
import express from "express";
import nunjucks from "nunjucks";

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.get("/hello", (_req, res) => {
  res.render("hello.njk", { name: "Ada" });
});
```

Keep the rendering import pointed at `nunjucks`; `@types/nunjucks` is only there so TypeScript understands the runtime API.

## Common Pitfalls

- Install both `nunjucks` and `@types/nunjucks`; the declaration package is not a runtime dependency by itself.
- Import from `"nunjucks"`, not from `"@types/nunjucks"`.
- If `esModuleInterop` is off, switch to `import nunjucks = require("nunjucks")`.
- TypeScript checks the objects you pass into `render()` and `renderString()`, but it does not validate template variable names inside `.njk` files.
- Register async filters with the third `true` argument or Nunjucks treats them as synchronous filters.

## Version Notes For `@types/nunjucks` 3.2.6

For this declaration-package version, the practical integration boundary is the `nunjucks` runtime module. Keep application imports, environment setup, filters, and rendering calls centered on `nunjucks`, and use `@types/nunjucks` only to supply TypeScript declarations for that runtime API.
