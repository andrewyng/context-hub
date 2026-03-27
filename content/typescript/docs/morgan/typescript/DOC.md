---
name: morgan
description: "TypeScript declarations for Morgan HTTP request logging middleware, built-in formats, custom tokens, custom formatters, and logging options."
metadata:
  languages: "typescript"
  versions: "1.9.10"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,morgan,express,node,http,middleware,logging,types,definitelytyped"
---

# Morgan TypeScript Guide

## Golden Rule

Install `@types/morgan` alongside the real `morgan` runtime package.

`@types/morgan` only provides TypeScript declarations. Your application imports and runs `morgan`; the declaration package adds types for the middleware factory, built-in format names, custom tokens, custom format functions, and options such as `skip`, `stream`, and `immediate`.

## Install

For a typical Express app, install the runtime packages first and then add the TypeScript declarations:

```bash
npm install express morgan
npm install -D typescript @types/express @types/morgan @types/node
```

If your project already has `morgan` and TypeScript set up, add only the missing declaration package:

```bash
npm install -D @types/morgan
```

Import code from `morgan`, not from `@types/morgan`.

## Initialization

There are no package-specific environment variables, credentials, or client objects to initialize.

The practical setup points are your import style, your TypeScript compiler options, and your middleware order.

### Import `morgan`

The declaration package uses `export =`, so the safest import form is:

```typescript
import morgan = require("morgan");
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, you can use the default import form:

```typescript
import morgan from "morgan";
```

If you are using Express in the same file, import it normally from `express`:

```typescript
import express from "express";
import morgan from "morgan";
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

If your project already restricts loaded type packages with `compilerOptions.types`, keep `node` available to the same project that compiles your server code.

### Register request logging middleware

`morgan` is standard Express middleware. Choose a built-in format name or pass your own format function.

```typescript
import express from "express";
import morgan from "morgan";

const app = express();

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
```

The built-in format names documented by `morgan` are `combined`, `common`, `dev`, `short`, and `tiny`.

## Common Workflows

### Skip noisy requests and write to a custom stream

Use `skip` to suppress logs for routes you do not care about, and `stream` when you want to forward access logs somewhere other than the default output.

```typescript
import express from "express";
import morgan from "morgan";

const app = express();

const accessLogStream = {
  write(message: string) {
    process.stdout.write(message);
  },
};

app.use(
  morgan("combined", {
    skip: (req) => req.url === "/health",
    stream: accessLogStream,
  }),
);

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});
```

This is the simplest typed pattern when you want one-line access logs but do not want probes or load-balancer checks to flood the output.

### Add a custom token

Custom tokens let you pull values from the request or response into a format string.

```typescript
import express from "express";
import morgan from "morgan";

const app = express();

morgan.token("request-id", (req) => {
  const value = req.headers["x-request-id"];

  if (Array.isArray(value)) {
    return value[0] ?? "-";
  }

  return value ?? "-";
});

app.use(morgan(":request-id :method :url :status :response-time ms"));

app.get("/users/:userId", (req, res) => {
  res.json({ userId: req.params.userId });
});
```

This keeps the integration boundary simple: your token reads the same Node/Express request object that the rest of your middleware stack sees.

### Use a custom format function

When a format string is not enough, pass a formatter callback. The token indexer exposes the same token helpers used by the built-in string formats.

```typescript
import express from "express";
import morgan from "morgan";

const app = express();

app.use(
  morgan((tokens, req, res) => {
    const method = tokens.method(req, res) ?? "-";
    const url = tokens.url(req, res) ?? "-";
    const status = tokens.status(req, res) ?? "-";
    const responseTime = tokens["response-time"](req, res) ?? "-";

    return JSON.stringify({
      method,
      url,
      status,
      responseTimeMs: responseTime,
    });
  }),
);
```

This pattern is useful when you want structured output but still want to reuse Morgan's request and response token helpers.

## Important Pitfalls

- `@types/morgan` does not include runtime code. Install `morgan` itself.
- Import from `morgan`, not from `@types/morgan`.
- Without TypeScript interop settings, prefer `import morgan = require("morgan")` over a default import.
- Middleware order matters. Register any middleware that attaches request-specific data before `morgan` if your custom tokens depend on it.
- `skip` returns `true` to suppress a log line, not to force one.
- `morgan` logs every matched request unless you filter it, so health checks and readiness probes often need an explicit `skip` rule.

## Version-Sensitive Notes

- This guide targets `@types/morgan==1.9.10`.
- The published declaration package models the classic `morgan` middleware API: `morgan(format, options)`, `morgan.token(...)`, `morgan.format(...)`, and `morgan.compile(...)`.
- The declaration entrypoint uses `export =`, so your preferred import form depends on your TypeScript interop settings.

## Official Sources

- npm package page for `@types/morgan`: https://www.npmjs.com/package/@types/morgan
- DefinitelyTyped source for `@types/morgan`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/morgan
- `@types/morgan` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/morgan/index.d.ts
- Morgan runtime documentation: https://expressjs.com/en/resources/middleware/morgan.html
- Morgan runtime package page: https://www.npmjs.com/package/morgan
