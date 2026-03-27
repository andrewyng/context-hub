---
name: compression
description: "TypeScript declarations for the compression Express middleware factory, option objects, filter callbacks, and streamed response flushing"
metadata:
  languages: "typescript"
  versions: "1.8.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,compression,express,node,http,middleware,types,definitelytyped"
---

# compression TypeScript Guide

## Golden Rule

Install `compression` for runtime behavior and `@types/compression` for TypeScript declarations.

`@types/compression` only adds `.d.ts` files for the `compression` module. Your application still imports and runs `compression` itself.

The declaration package covers the middleware factory, `compression.CompressionOptions`, the `filter` callback shape, the default `compression.filter()` helper, and the `res.flush()` method added to Express responses for streaming use cases.

## Install

For a typical Express app, install the runtime packages first, then the TypeScript declarations:

```bash
npm install express compression
npm install -D typescript @types/node @types/express @types/compression
```

If your project already has `express` and `compression`, add only the missing declaration packages:

```bash
npm install -D @types/node @types/express @types/compression
```

No credentials or package-specific environment variables are required. If you want environment-driven configuration, define your own app settings:

```bash
export PORT=3000
export COMPRESSION_THRESHOLD=1kb
```

## TypeScript Setup

`@types/compression` uses `export = compression`, so the most portable import form is:

```typescript
import compression = require("compression");
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import compression from "compression";
```

Use the runtime import as the namespace for option and callback types:

```typescript
import compression from "compression";

const options: compression.CompressionOptions = {
  threshold: process.env.COMPRESSION_THRESHOLD ?? "1kb",
};
```

If your project restricts ambient declaration packages with `compilerOptions.types`, keep the relevant server-side packages available:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "types": ["node", "express", "compression"]
  }
}
```

Including `compression` in that list matters when you want the Express `Response` augmentation for `res.flush()`.

## Common Workflows

### Enable compression for the whole app

The standard Express setup is to register the middleware near the top of your app so later routes can send compressed responses.

```typescript
import express from "express";
import compression from "compression";

const app = express();

app.use(compression());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(Number(process.env.PORT ?? 3000), () => {
  console.log("server started");
});
```

Mount `compression()` before routes or static middleware that you want it to wrap.

### Type a custom filter and options object

Use a typed `CompressionOptions` object when you want per-request control over whether a response should be compressed.

```typescript
import express from "express";
import compression from "compression";

const app = express();

const shouldCompress: compression.CompressionFilter = (req, res) => {
  if (req.headers["x-no-compression"]) {
    return false;
  }

  return compression.filter(req, res);
};

const compressionOptions: compression.CompressionOptions = {
  threshold: process.env.COMPRESSION_THRESHOLD ?? "1kb",
  filter: shouldCompress,
};

app.use(compression(compressionOptions));

app.get("/report", (_req, res) => {
  res.json({ generatedAt: new Date().toISOString() });
});
```

Calling `compression.filter(req, res)` inside your custom filter keeps the runtime package's normal content-type checks and only adds your application-specific rule.

### Stream Server-Sent Events and flush chunks

The `compression` middleware adds `res.flush()` to Express responses. Use it when you stream data and want buffered compressed output sent to the client before the response ends.

```typescript
import express from "express";
import compression from "compression";

const app = express();

app.use(compression());

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const timer = setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
    res.flush();
  }, 1000);

  req.on("close", () => {
    clearInterval(timer);
    res.end();
  });
});
```

If your project restricts `compilerOptions.types` and you do not include `compression`, TypeScript can report that `flush` does not exist on `Response` even though the middleware adds it at runtime.

### Use `compression` with `express.static()`

`compression()` returns ordinary Express middleware, so it composes normally with built-in static-file serving.

```typescript
import express from "express";
import compression from "compression";

const app = express();

app.use(compression());
app.use("/assets", express.static("public"));

app.listen(3000);
```

Register compression first if you want static responses to go through the middleware.

## Common Pitfalls

- Install `compression` as well as `@types/compression`; the type package does not include runtime code.
- Import from `"compression"`, never from `"@types/compression"`.
- Use `import compression = require("compression")` unless your project enables `esModuleInterop` or `allowSyntheticDefaultImports`.
- Mount `compression()` before the routes or `express.static()` handlers whose responses you want compressed.
- When you write a custom filter, call `compression.filter(req, res)` unless you intentionally want to replace the package's default filtering logic.
- If you use `compilerOptions.types`, include `"compression"` so the `Response.flush()` augmentation is visible to TypeScript.

## Version Notes

- This guide targets `@types/compression==1.8.1`.
- The declaration package models the standalone `compression` middleware package. It does not replace the runtime dependency.

## Official Sources

- https://www.npmjs.com/package/@types/compression
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/compression
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/compression/index.d.ts
- https://www.npmjs.com/package/compression
- https://github.com/expressjs/compression
