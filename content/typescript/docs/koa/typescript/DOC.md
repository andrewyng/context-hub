---
name: koa
description: "TypeScript declarations for Koa applications, middleware, context, state, and module augmentation."
metadata:
  languages: "typescript"
  versions: "3.0.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,koa,node,http,middleware,types,definitelytyped"
---

# Koa TypeScript Guide

## Golden Rule

Install `@types/koa` alongside the real `koa` runtime package.

`@types/koa` only provides TypeScript declarations. Your application imports and runs `koa`; the declaration package supplies the types for `new Koa()`, `app.use()`, `ctx`, `ctx.state`, `app.context`, `Middleware`, `Next`, and `ParameterizedContext`.

## Install

Install the runtime package first, then add the declaration package and Node.js types for TypeScript.

```bash
npm install koa
npm install -D typescript @types/koa @types/node
```

If your project already has `koa`, add only the missing declarations:

```bash
npm install -D @types/koa @types/node
```

No credentials, API keys, or framework-specific environment variables are required for `@types/koa` itself.

## Initialization

The important setup points are your import style, your TypeScript compiler options, and how you model app-wide state and context.

### Import `koa`

The declaration package uses `export =`, so the most portable import form is:

```typescript
import Koa = require("koa");

const app = new Koa();
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import Koa from "koa";

const app = new Koa();
```

Import from `koa`, never from `@types/koa`.

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

If you explicitly restrict ambient type packages with `compilerOptions.types`, include at least `node` and `koa` in the server project that compiles your Koa app:

```json
{
  "compilerOptions": {
    "types": ["node", "koa"]
  }
}
```

### Create an app and return a response

```typescript
import Koa = require("koa");

const app = new Koa();

app.use(async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    ok: true,
    path: ctx.path,
  };
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port);
```

`PORT` is a normal application setting, not something required by the type package.

## Common Workflows

### Type app state, custom context, and response bodies

The main Koa generics are:

- `new Koa<StateT, ContextT>()`
- `Koa.Middleware<StateT, ContextT, ResponseBodyT>`
- `Koa.ParameterizedContext<StateT, ContextT, ResponseBodyT>`

Use them when request-scoped state or response body shape matters to the rest of your app.

```typescript
import Koa = require("koa");

type State = {
  requestId: string;
  userId?: string;
};

type Context = {
  startTime: number;
};

type HealthResponse = {
  ok: true;
  requestId: string;
};

const app = new Koa<State, Context>();

const assignRequestMetadata: Koa.Middleware<State, Context> = async (ctx, next) => {
  ctx.state.requestId = ctx.get("x-request-id") || "generated-request-id";
  ctx.startTime = Date.now();
  await next();
};

const healthcheck: Koa.Middleware<State, Context, HealthResponse> = async (ctx) => {
  ctx.body = {
    ok: true,
    requestId: ctx.state.requestId,
  };
};

app.use(assignRequestMetadata);
app.use(healthcheck);
```

This is the most direct way to make `ctx.state`, extra `ctx` properties, and `ctx.body` line up with your application code.

### Reuse strongly typed middleware in helpers

`Koa.ParameterizedContext` is useful when a helper or standalone function needs the same typed `ctx` shape as your middleware pipeline.

```typescript
import Koa = require("koa");

type State = {
  userId?: string;
};

type ResponseBody = {
  id: string;
  email: string;
};

async function loadCurrentUser(
  ctx: Koa.ParameterizedContext<State, Koa.DefaultContext, ResponseBody>,
): Promise<ResponseBody | null> {
  if (!ctx.state.userId) {
    return null;
  }

  return {
    id: ctx.state.userId,
    email: `${ctx.state.userId}@example.com`,
  };
}

const app = new Koa<State>();

app.use(async (ctx) => {
  const user = await loadCurrentUser(ctx);

  if (!user) {
    ctx.status = 401;
    ctx.body = { id: "anonymous", email: "anonymous@example.com" };
    return;
  }

  ctx.body = user;
});
```

Use this pattern when you want helper functions to stay aligned with the same `ctx.state` and response-body types as your middleware.

### Extend `DefaultState` and `DefaultContext` for app-wide fields

For fields that should exist across the whole application, module augmentation is usually simpler than threading generics through every file.

Create a declaration file such as `src/types/koa.d.ts`:

```typescript
import "koa";

interface Services {
  audit(message: string): Promise<void>;
}

declare module "koa" {
  interface DefaultState {
    requestId: string;
    userId?: string;
  }

  interface DefaultContext {
    services: Services;
  }
}
```

Make sure the file is included by your TypeScript project, for example:

```json
{
  "include": ["src/**/*.ts", "src/types/**/*.d.ts"]
}
```

Then populate the runtime property and use it in middleware:

```typescript
import Koa from "koa";

const app = new Koa();

app.context.services = {
  async audit(message) {
    console.log(message);
  },
};

app.use(async (ctx, next) => {
  ctx.state.requestId = ctx.get("x-request-id") || "generated-request-id";
  await ctx.services.audit(`${ctx.method} ${ctx.path}`);
  await next();
});
```

This is the most practical pattern when every handler needs the same custom `ctx.state` or `ctx` fields.

### Handle errors with typed `ctx`

Koa applications commonly centralize errors in top-level middleware and on the app error event.

```typescript
import Koa = require("koa");

const app = new Koa();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: "internal_server_error" };
    ctx.app.emit("error", err as Error, ctx);
  }
});

app.on("error", (err, ctx) => {
  console.error(err.message, ctx.path);
});
```

The declaration package types both the `error` event callback and the middleware `ctx` object, so you can centralize logging without dropping to `any`.

## Important Pitfalls

- Install `koa` as well as `@types/koa`; the declaration package contains no executable code.
- Import from `koa`, not from `@types/koa`.
- If you want to write `import Koa from "koa"`, enable `esModuleInterop` or `allowSyntheticDefaultImports`; otherwise use `import Koa = require("koa")`.
- `ctx.request.body` is not part of Koa core. If you add request-body parsing middleware, that middleware package controls the runtime behavior and any extra typings.
- TypeScript generics describe your application contracts, but they do not validate headers, bodies, or authentication at runtime.
- The `use<NewStateT, NewContextT>()` signature returns a widened `Application` type. If you rely on that widening, keep the returned type in a chained expression or use module augmentation for app-wide fields.

## Version-Sensitive Notes

- This guide targets `@types/koa==3.0.1`.
- The package is a DefinitelyTyped declaration package for the `koa` runtime module.
- The published declarations use `export =`, which is why import style depends on your TypeScript interop settings.
- The declarations cover application, middleware, request, response, context, and context-parameterization types; request-body parsing still comes from separate runtime middleware.

## Official Sources

- https://www.npmjs.com/package/@types/koa
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/koa
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/koa/index.d.ts
- https://www.npmjs.com/package/koa
- https://github.com/koajs/koa#readme
