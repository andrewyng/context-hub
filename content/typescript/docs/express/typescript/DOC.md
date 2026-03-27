---
name: express
description: "TypeScript declarations for Express applications, routers, middleware, request and response generics, and declaration merging."
metadata:
  languages: "typescript"
  versions: "5.0.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,express,node,http,middleware,types,definitelytyped"
---

# Express TypeScript Guide

## Golden Rule

Install `@types/express` alongside the real `express` runtime package.

`@types/express` only provides TypeScript declarations. Your application imports and runs `express`; the declaration package supplies the types for `express()`, `Router()`, `Request`, `Response`, `RequestHandler`, built-in middleware such as `express.json()`, and the global `Express` namespace used for declaration merging.

## Install

Install the runtime package in your app, then add the declaration package and Node.js types for TypeScript.

```bash
npm install express
npm install -D typescript @types/express @types/node
```

If your project already has `express`, add only the missing declarations:

```bash
npm install -D @types/express @types/node
```

`@types/express` pulls in its own related declaration dependencies, including `@types/express-serve-static-core`, `@types/body-parser`, and `@types/serve-static`.

## Initialization

There are no environment variables, credentials, or client objects to configure.

The practical setup points are your import style, your TypeScript compiler options, and how you type route handlers.

### Import `express`

The declaration package uses `export =`, so the safest CommonJS-style import is:

```typescript
import express = require("express");

const app = express();
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, you can use the more common default import form:

```typescript
import express from "express";

const app = express();
```

For type-only imports in handlers and helpers, import from `express`, not from `@types/express`:

```typescript
import type { NextFunction, Request, Response } from "express";
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

If you explicitly restrict loaded ambient type packages with `compilerOptions.types`, include at least `node` and `express` in the list used by the project that compiles your server code:

```json
{
  "compilerOptions": {
    "types": ["node", "express"]
  }
}
```

### Create an app and enable built-in middleware

The declarations expose the built-in middleware helpers on the top-level `express` export.

```typescript
import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
```

## Common Workflows

### Use route literal inference for `req.params`

The core typings infer route parameters from string literal paths passed directly to `app.get()`, `app.post()`, and other router methods.

```typescript
import express from "express";

const app = express();

app.get("/users/:userId/books/:bookId", (req, res) => {
  const { userId, bookId } = req.params;

  res.json({ userId, bookId });
});
```

In this pattern, `req.params.userId` and `req.params.bookId` are typed as `string`.

### Add explicit generics for params, body, query, and response

When you need stronger typing than the defaults, use the generics on `Request` and `Response`.

The generic order is:

`Request<Params, ResBody, ReqBody, ReqQuery, Locals>`

```typescript
import express, { type Request, type Response } from "express";

const app = express();
app.use(express.json());

type CreateUserParams = {
  orgId: string;
};

type CreateUserBody = {
  email: string;
  displayName: string;
};

type CreateUserQuery = {
  invite?: "true" | "false";
};

type CreateUserResponse = {
  id: string;
  email: string;
};

app.post(
  "/orgs/:orgId/users",
  (
    req: Request<CreateUserParams, CreateUserResponse, CreateUserBody, CreateUserQuery>,
    res: Response<CreateUserResponse>,
  ) => {
    const { orgId } = req.params;
    const { email, displayName } = req.body;
    const shouldInvite = req.query.invite === "true";

    res.status(201).json({
      id: `${orgId}-${displayName}`,
      email: shouldInvite ? email.toLowerCase() : email,
    });
  },
);
```

This is the most useful pattern when your route body or query shape matters to the rest of your app.

### Type middleware and `res.locals`

`RequestHandler` and `Response` both accept a `Locals` generic so middleware can populate `res.locals` in a typed way.

```typescript
import express, {
  type RequestHandler,
  type Response,
} from "express";

const app = express();

type AuthLocals = {
  requestId: string;
  userId: string;
};

const requireAuth: RequestHandler<any, any, any, any, AuthLocals> = (
  req,
  res,
  next,
) => {
  const userId = req.header("x-user-id");

  if (!userId) {
    res.status(401).json({ error: "missing x-user-id" });
    return;
  }

  res.locals.requestId = req.header("x-request-id") ?? "generated-request-id";
  res.locals.userId = userId;
  next();
};

app.get(
  "/me",
  requireAuth,
  (_req, res: Response<{ userId: string; requestId: string }, AuthLocals>) => {
    res.json({
      userId: res.locals.userId,
      requestId: res.locals.requestId,
    });
  },
);
```

Use this when multiple middleware layers need to share typed request-scoped state without falling back to `any`.

### Extend `Express.Request` or `Express.Locals` with declaration merging

The core declarations intentionally expose open interfaces in the global `Express` namespace so applications can add their own fields.

Create a `.d.ts` file that your TypeScript project includes, for example `src/types/express.d.ts`:

```typescript
export {};

declare global {
  namespace Express {
    interface Request {
      authToken?: string;
    }

    interface Locals {
      tenantId?: string;
    }
  }
}
```

Then use the merged fields in middleware and handlers:

```typescript
import express from "express";

const app = express();

app.use((req, res, next) => {
  req.authToken = req.header("authorization") ?? undefined;
  res.locals.tenantId = req.header("x-tenant-id") ?? undefined;
  next();
});

app.get("/context", (req, res) => {
  res.json({
    authToken: req.authToken ?? null,
    tenantId: res.locals.tenantId ?? null,
  });
});
```

This is usually the cleanest option for application-wide request or locals extensions.

### Type error-handling middleware

The package also exposes `ErrorRequestHandler` with the same generic order as `RequestHandler`.

```typescript
import express, { type ErrorRequestHandler } from "express";

const app = express();

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : "unexpected error";
  res.status(500).json({ error: message });
};

app.use(onError);
```

This keeps your terminal error middleware compatible with Express while preserving typed access to `req`, `res`, and `res.locals` when you need it.

## Important Pitfalls

- `@types/express` is a declaration package only. Install and import `express` at runtime.
- Import code and types from `express`, not from `@types/express`.
- The default import form depends on TypeScript interop settings. Without interop, use `import express = require("express")`.
- Route-param inference works best when the route path is an inline string literal. If you widen the path to a plain `string`, TypeScript can no longer infer named params from it.
- `req.query` defaults to the parsed query-object type from `qs`; if you want an application-specific query shape, pass the `ReqQuery` generic explicitly.
- `req.body` is not validated by these declarations. The generic only tells TypeScript what shape your handler expects.
- If you rely on custom `req` or `res.locals` properties across the whole app, prefer declaration merging over repeated local type assertions.
- If your project uses `compilerOptions.types`, make sure `node` and `express` are still included or the declarations may appear to disappear.

## Version-Sensitive Notes

- This guide targets `@types/express==5.0.6`.
- The published package declares a minimum TypeScript version of `5.2`.
- `@types/express==5.0.6` depends on `@types/express-serve-static-core` `^5.0.0`, `@types/body-parser`, and `@types/serve-static`.
- The top-level export includes typed helpers for `express.json()`, `express.raw()`, `express.text()`, `express.urlencoded()`, `express.static()`, and `express.Router()`.
- The core router typings include string-literal route parameter inference and open `Express.Request` / `Express.Locals` interfaces for declaration merging.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/express
- DefinitelyTyped source for `@types/express`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express
- `@types/express` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express/index.d.ts
- DefinitelyTyped source for `@types/express-serve-static-core`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express-serve-static-core
- Express runtime documentation: https://expressjs.com/
