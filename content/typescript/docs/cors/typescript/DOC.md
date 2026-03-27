---
name: cors
description: "TypeScript declarations for the cors middleware factory, CORS option objects, and per-request policy callbacks"
metadata:
  languages: "typescript"
  versions: "2.8.19"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,cors,express,node,http,middleware,types,definitelytyped"
---

# cors TypeScript Guide

`@types/cors` provides TypeScript declarations for the `cors` runtime package. Install `cors` for runtime behavior, then use the types exposed by the runtime import for configuration objects and request-aware callbacks.

The declaration package models the middleware factory, `cors.CorsOptions`, `cors.CorsOptionsDelegate`, and the minimal `cors.CorsRequest` shape used by request-based policies.

## Install

Install the runtime middleware first, then add TypeScript and the declaration packages your server project needs:

```bash
npm install express cors
npm install --save-dev typescript @types/cors @types/express @types/node
```

If your project already has `express` and `cors`, add only the missing type packages:

```bash
npm install --save-dev @types/cors @types/express @types/node
```

No credentials or service-specific environment variables are required. If you want environment-driven policy, define the allowed origin values in your app configuration:

```bash
export CORS_ORIGIN='https://app.example.com'
export CORS_ORIGINS='https://app.example.com,https://admin.example.com'
```

## TypeScript Setup

`@types/cors` uses `export =`, so the most portable import form is CommonJS-style:

```typescript
import cors = require("cors");
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import cors from "cors";
```

Use the runtime import as the namespace for the exported types:

```typescript
import cors from "cors";
import type { Request } from "express";

const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN ?? "*",
  credentials: true,
};

const corsOptionsDelegate: cors.CorsOptionsDelegate<Request> = (req, callback) => {
  callback(null, { origin: req.headers.origin ?? false });
};
```

If your project restricts ambient declaration packages with `compilerOptions.types`, include the server-side packages you expect TypeScript to load:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "types": ["node", "express", "cors"]
  }
}
```

## Enable CORS For All Routes

The default middleware enables CORS with the package defaults: `origin: "*"`, `methods: "GET,HEAD,PUT,PATCH,POST,DELETE"`, `preflightContinue: false`, and `optionsSuccessStatus: 204`.

```typescript
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(3000);
```

This is the simplest setup when every route can be called cross-origin.

## Configure A Static Policy

Type your options object as `cors.CorsOptions` when you want TypeScript to verify supported fields such as `origin`, `methods`, `allowedHeaders`, `exposedHeaders`, `credentials`, `maxAge`, `preflightContinue`, and `optionsSuccessStatus`.

```typescript
import express from "express";
import cors from "cors";

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN ?? "https://app.example.com",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range"],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

Set `optionsSuccessStatus` to `200` when you need a successful `OPTIONS` response code that works better with older browsers or embedded clients that do not handle `204` well.

If you omit `allowedHeaders`, the runtime reflects the request's `Access-Control-Request-Headers` header.

## Use A Request-Aware Policy

For allowlists or tenant-specific rules, type the callback as `cors.CorsOptionsDelegate<Request>` so the request parameter stays compatible with Express.

```typescript
import express, { type Request } from "express";
import cors from "cors";

const app = express();

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);

const corsOptionsDelegate: cors.CorsOptionsDelegate<Request> = (req, callback) => {
  const requestOrigin = req.headers.origin;

  if (!requestOrigin || allowedOrigins.has(requestOrigin)) {
    callback(null, {
      origin: true,
      credentials: true,
    });
    return;
  }

  callback(null, { origin: false });
};

app.use(cors(corsOptionsDelegate));
```

In the `cors` runtime, `origin: true` reflects the request origin back in the response, while `origin: false` disables CORS for that request.

If you prefer to keep the request-aware logic inside `CorsOptions`, the `origin` field also accepts a callback:

```typescript
import cors from "cors";

const allowedOrigins = new Set(["https://app.example.com"]);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
};
```

## Handle Preflight Requests

Complex cross-origin requests often need an `OPTIONS` preflight route. Register `cors()` on the `OPTIONS` handler before the corresponding route handler.

```typescript
import express from "express";
import cors from "cors";

const app = express();

app.options("/products/:id", cors());

app.delete("/products/:id", cors(), (req, res) => {
  res.json({ deleted: req.params.id });
});
```

To enable preflight across the whole app, add a global `OPTIONS` handler before other routes:

```typescript
app.options("*", cors());
```

Set `preflightContinue: true` only when you want the preflight request to continue to the next middleware instead of ending inside `cors`.

## Type Reusable Middleware Helpers

When you wrap CORS setup in an application helper, keep the config typed as `cors.CorsOptions` and return normal Express middleware.

```typescript
import type { RequestHandler } from "express";
import cors from "cors";

export function createCorsMiddleware(origin: string): RequestHandler {
  const options: cors.CorsOptions = {
    origin,
    credentials: true,
  };

  return cors(options);
}
```

This keeps your code importing from `"cors"` while still getting the declaration package's type checking.

## Common Pitfalls

- Install `cors` as well as `@types/cors`; the declaration package does not include runtime code.
- Import from `"cors"`, not from `"@types/cors"`.
- Use `cors.CorsOptionsDelegate<Request>` when you want the request callback typed as an Express request instead of the minimal `cors.CorsRequest` interface.
- If your project sets `compilerOptions.types`, include `node`, `cors`, and `express` in the project that compiles your server.
- `optionsSuccessStatus` defaults to `204`; set it explicitly when you need a different successful preflight status.

## Version Notes For `@types/cors` 2.8.19

`@types/cors@2.8.19` depends on `@types/node`, and its package metadata declares `typeScriptVersion: 5.1`. Keep your compiler and Node.js type packages aligned with that declaration release.

## Official Sources

- https://www.npmjs.com/package/@types/cors
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/cors
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/cors/index.d.ts
- https://www.npmjs.com/package/cors
- https://github.com/expressjs/cors#readme
