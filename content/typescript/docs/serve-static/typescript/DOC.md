---
name: serve-static
description: "TypeScript declarations for the serve-static middleware factory, option objects, and Express-compatible static file handlers"
metadata:
  languages: "typescript"
  versions: "2.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,serve-static,express,node,http,middleware,static-files,types,definitelytyped"
---

# serve-static TypeScript Guide

`@types/serve-static` provides TypeScript declarations for the `serve-static` runtime package. It models the `serveStatic(root, options?)` factory, the `serveStatic.ServeStaticOptions` object, and the middleware types used directly by `serve-static` and indirectly by `express.static()`.

Install the runtime package for actual static-file behavior. `@types/serve-static` only adds declarations for the TypeScript compiler.

## Install

If your app imports `serve-static` directly, install the runtime package and the declarations together:

```bash
npm install serve-static
npm install --save-dev typescript @types/node @types/serve-static
```

If you are using Express, install the server packages you actually compile against:

```bash
npm install express serve-static
npm install --save-dev typescript @types/express @types/node
```

`@types/express` already depends on `@types/serve-static`, so `express.static()` is usually typed without adding a separate direct dependency on `@types/serve-static`.

No credentials or service-specific environment variables are required. A typical app-level setup is just the static directory and port:

```bash
export STATIC_DIR=public
export PORT=3000
```

## TypeScript Setup

`@types/serve-static` 2.2.0 is published with `typeScriptVersion: "5.2"`, so use TypeScript 5.2 or newer.

The declarations use `export = serveStatic`. If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import works:

```typescript
import serveStatic from "serve-static";
```

Without those interop settings, use the CommonJS-style import form:

```typescript
import serveStatic = require("serve-static");
```

A strict Node.js setup that works well with `serve-static` looks like this:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "types": ["node", "express"]
  }
}
```

If your project does not use Express, omit `"express"` from `compilerOptions.types`.

## Mount Static Files In Express

The main API is `serveStatic(root, options?)`. It returns middleware that you mount with `app.use()`.

```typescript
import express from "express";
import path from "node:path";
import serveStatic from "serve-static";

const app = express();
const staticDir = path.resolve(process.env.STATIC_DIR ?? "public");
const port = Number(process.env.PORT ?? "3000");

app.use(
  "/assets",
  serveStatic(staticDir, {
    index: ["index.html"],
    maxAge: "1d",
    fallthrough: true,
  }),
);

app.listen(port);
```

By default, missing files fall through to the next middleware instead of producing a 404 immediately, which makes this pattern work well in layered Express apps.

## Type Options And Middleware Explicitly

When you want compile-time checks on the options object, annotate it as `serveStatic.ServeStaticOptions`. The declarations also export `serveStatic.RequestHandler` if you want a named middleware type.

```typescript
import path from "node:path";
import type { ServerResponse } from "node:http";
import serveStatic from "serve-static";

const staticOptions: serveStatic.ServeStaticOptions<ServerResponse> = {
  dotfiles: "ignore",
  extensions: ["html", "htm"],
  fallthrough: false,
  index: ["index.html", "index.htm"],
  maxAge: "1d",
  redirect: true,
  setHeaders(res, filePath) {
    if (path.extname(filePath) === ".html") {
      res.setHeader("Cache-Control", "public, max-age=0");
    }
  },
};

export const servePublic: serveStatic.RequestHandler<ServerResponse> = serveStatic(
  path.resolve(process.env.STATIC_DIR ?? "public"),
  staticOptions,
);
```

The published declarations type `maxAge` as `number | string`, so both milliseconds and `ms`-style strings such as `"1d"` are valid.

## Stack Multiple Static Roots

Because the default `fallthrough` behavior is `true`, you can mount more than one static directory and let later middleware act as a fallback.

```typescript
import express from "express";
import path from "node:path";
import serveStatic from "serve-static";

const app = express();

app.use(serveStatic(path.resolve("public-optimized")));
app.use(serveStatic(path.resolve("public")));

app.listen(3000);
```

This serves files from `public-optimized` first and uses `public` only when the earlier middleware does not find a matching file.

## Express Integration Boundary

If you call `express.static()` instead of importing `serve-static` yourself, you are still using these declarations. `@types/express` references `serve-static` and types `express.static` as a `serveStatic.RequestHandlerConstructor<Response>`.

```typescript
import express from "express";

const app = express();

app.use(
  express.static(process.env.STATIC_DIR ?? "public", {
    immutable: true,
    maxAge: "1y",
  }),
);
```

Use a direct `serve-static` import when you want to share middleware factories outside Express-specific setup code. Use `express.static()` when you prefer the framework convenience API.

## Common Pitfalls

- Install `serve-static` for runtime behavior; `@types/serve-static` does not serve files by itself.
- Import from `"serve-static"`, never from `"@types/serve-static"`.
- If you rely on a default import, enable `esModuleInterop` or `allowSyntheticDefaultImports`; otherwise use `import serveStatic = require("serve-static")`.
- `setHeaders` must update headers synchronously.
- `immutable: true` should be paired with a non-zero `maxAge`.
- `fallthrough: false` changes missing-file handling from `next()` to `next(err)`, including 404-style misses.
- For `dotfiles`, stick to the documented runtime values `"allow"`, `"deny"`, or `"ignore"`.

## Official Sources

- https://www.npmjs.com/package/@types/serve-static
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/serve-static
- https://www.npmjs.com/package/serve-static
- https://github.com/expressjs/serve-static#readme
