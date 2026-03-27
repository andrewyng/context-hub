---
name: connect
description: "TypeScript declarations for Connect middleware servers, request handlers, mount paths, and error-handling callbacks."
metadata:
  languages: "typescript"
  versions: "3.4.38"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,connect,node,http,middleware,types,definitelytyped"
---

# connect TypeScript Guide

## Golden Rule

Install `@types/connect` alongside the real `connect` runtime package.

`@types/connect` only provides TypeScript declarations. Your application imports and runs `connect`; the declaration package supplies the types for `connect()`, `app.use()`, `app.listen()`, `connect.IncomingMessage`, and the middleware callback signatures.

## Install

Install the runtime package first, then add TypeScript and Node.js type declarations.

```bash
npm install connect
npm install --save-dev typescript @types/connect @types/node
```

If your project already has `connect`, add only the missing type packages:

```bash
npm install --save-dev @types/connect @types/node
```

No package-specific credentials or authentication setup are required. If you want a configurable port, use a normal app-level environment variable:

```bash
export PORT=3000
```

## TypeScript Setup

`@types/connect` uses `export = createServer`, so the most portable import form is CommonJS-style:

```ts
import connect = require("connect");
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```ts
import connect from "connect";
```

If your project restricts ambient declaration packages with `compilerOptions.types`, include both Node.js and Connect:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "types": ["node", "connect"]
  }
}
```

The published package metadata declares `@types/node` as a dependency and sets a TypeScript support floor of `4.5`.

## Create A Typed Connect App

The declaration entrypoint is the `connect()` factory. It returns a `Server` value that is both callable as a Node request handler and exposes middleware methods such as `use()`, `handle()`, and `listen()`.

```ts
import http from "node:http";
import connect = require("connect");

const app = connect();
const port = Number(process.env.PORT ?? 3000);

app.use((req, res, next) => {
  res.setHeader("x-request-id", req.headers["x-request-id"] ?? "generated");
  next();
});

app.use("/health", (_req, res) => {
  res.statusCode = 200;
  res.end("ok");
});

http.createServer(app).listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
```

Because the `Server` type is also a request handler, you can pass `app` directly to `http.createServer(app)`. The declarations also expose `app.listen(...)` with the same overload shapes as Node's `http.Server#listen()`.

## Type Middleware Explicitly

The package exports three middleware function aliases that match the classic Connect callback forms:

- `connect.SimpleHandleFunction`: `(req, res) => void`
- `connect.NextHandleFunction`: `(req, res, next) => void`
- `connect.ErrorHandleFunction`: `(err, req, res, next) => void`

Use them when you want reusable middleware values with stable, checked signatures.

```ts
import connect = require("connect");

const logger: connect.NextHandleFunction = (req, _res, next) => {
  console.log(req.method, req.originalUrl ?? req.url);
  next();
};

const notFound: connect.SimpleHandleFunction = (_req, res) => {
  res.statusCode = 404;
  res.end("Not found");
};

const onError: connect.ErrorHandleFunction = (err, _req, res, _next) => {
  res.statusCode = 500;
  res.end(err instanceof Error ? err.message : "Internal Server Error");
};

const app = connect();

app.use(logger);
app.use("/boom", (_req, _res, next) => {
  next(new Error("unexpected failure"));
});
app.use(notFound);
app.use(onError);
```

The error-handling form is the four-argument callback. Keep it after middleware that may call `next(err)`.

## Use Mount Paths Correctly

`app.use(route, fn)` is typed for a string mount path plus a middleware function. The declaration comments describe prefix matching: mounting at `/admin` applies to `/admin` and `/admin/settings`, but not to `/` or `/posts`.

```ts
import connect = require("connect");

const app = connect();

app.use("/admin", (req, res, next) => {
  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    res.statusCode = 401;
    res.end("Unauthorized");
    return;
  }

  next();
});

app.use("/admin/users", (_req, res) => {
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ users: [] }));
});
```

This is the simplest typed pattern for grouping middleware by URL prefix without introducing a larger framework.

## Work With `connect.IncomingMessage`

`connect.IncomingMessage` extends Node's `http.IncomingMessage` and adds an optional `originalUrl` property. Use that type when you need helpers that know about Connect's request shape.

```ts
import type { ServerResponse } from "node:http";
import connect = require("connect");

function auditRequest(req: connect.IncomingMessage, res: ServerResponse) {
  const url = req.originalUrl ?? req.url ?? "/";

  res.setHeader("x-audited-url", url);
}

const app = connect();

app.use((req, res, next) => {
  auditRequest(req, res);
  next();
});
```

If you only need standard Node request fields, `req` and `res` are still compatible with `http.IncomingMessage` and `http.ServerResponse`.

## Common Workflows

### Listen directly from the Connect app

Use `app.listen(...)` when you only need one HTTP server:

```ts
import connect = require("connect");

const app = connect();

app.use("/health", (_req, res) => {
  res.end("ok");
});

app.listen(Number(process.env.PORT ?? 3000), () => {
  console.log("server started");
});
```

### Reuse the same app with multiple Node servers

The declaration comments call out that a Connect app is just a JavaScript function, so you can wrap it with different Node servers.

```ts
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import connect = require("connect");

const app = connect();

app.use((_req, res) => {
  res.end("hello");
});

http.createServer(app).listen(80);

https
  .createServer(
    {
      key: fs.readFileSync("./certs/server.key"),
      cert: fs.readFileSync("./certs/server.crt"),
    },
    app,
  )
  .listen(443);
```

### Call `handle()` from a custom server

Use `handle(req, res, next)` when you need a fallback inside your own Node server wiring.

```ts
import http from "node:http";
import connect = require("connect");

const app = connect();

app.use("/api", (_req, res) => {
  res.end("from connect");
});

http
  .createServer((req, res) => {
    app.handle(req, res, () => {
      res.statusCode = 404;
      res.end("no matching middleware");
    });
  })
  .listen(3000);
```

## Important Pitfalls

- `@types/connect` does not include runtime code. Install `connect` itself.
- Import from `connect`, not from `@types/connect`.
- Without TypeScript interop settings, prefer `import connect = require("connect")` over a default import.
- If you use `compilerOptions.types`, include both `node` and `connect` or TypeScript may not load the declarations you expect.
- Error middleware is the four-argument form. A normal `(req, res, next)` function is not typed as an error handler.
- `req.originalUrl` is optional in the declarations, so handle the undefined case.

## Version-Sensitive Notes

- This guide targets `@types/connect==3.4.38`.
- The published package metadata lists `typeScriptVersion: 4.5`.
- The current declaration entrypoint models the classic CommonJS API with `export = createServer`.
- The published declarations depend only on `@types/node`.

## Official Sources

- npm package page for `@types/connect`: https://www.npmjs.com/package/@types/connect
- DefinitelyTyped source for `@types/connect`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/connect
- `@types/connect` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/connect/index.d.ts
