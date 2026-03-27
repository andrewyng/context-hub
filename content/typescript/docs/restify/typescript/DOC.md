---
name: restify
description: "TypeScript declarations for Restify servers, requests, responses, plugins, and application-level request augmentation."
metadata:
  languages: "typescript"
  versions: "8.5.12"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,restify,node,http,server,types,definitelytyped"
---

# Restify TypeScript Guide

`@types/restify` adds TypeScript declarations for the `restify` runtime package. In practice, it matters most in four places:

- creating and configuring a Restify server with `restify.createServer()`
- typing handlers with `Request`, `Response`, `Next`, and `Server`
- using the built-in plugins namespace such as `restify.plugins.queryParser()` and `restify.plugins.bodyParser()`
- extending the request shape in your own app with module augmentation

This package only ships `.d.ts` files. Install `restify` itself for runtime behavior.

## Install

Install the runtime package first, then add TypeScript and the declarations:

```bash
npm install restify
npm install -D typescript @types/node @types/restify
```

If your project already has `restify`, add only the missing type packages:

```bash
npm install -D @types/node @types/restify
```

`@types/restify` does not require package-specific environment variables or credentials. A typical local setup still uses application-level network settings:

```bash
export PORT=8080
export HOST=0.0.0.0
```

## TypeScript Setup

The declaration package models a CommonJS-style export. If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import is fine:

```typescript
import restify from "restify";
```

Without interop, use the CommonJS-compatible import form:

```typescript
import restify = require("restify");
```

If your project restricts loaded type packages with `compilerOptions.types`, include the packages your server build depends on:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "types": ["node", "restify"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"]
}
```

If you do not use `compilerOptions.types`, you usually do not need to add anything special.

## Initialize A Restify Server

There is no separate client or auth object to initialize. The runtime boundary is the `restify` server itself.

```typescript
import restify = require("restify");

const port = Number(process.env.PORT ?? "8080");
const host = process.env.HOST ?? "0.0.0.0";

const server = restify.createServer({
  name: "example-api",
  version: "1.0.0",
});

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get("/health", (_req, res, next) => {
  res.send({ ok: true });
  return next();
});

server.listen(port, host, () => {
  console.log("%s listening at %s", server.name, server.url);
});
```

This is the basic pattern the declarations are designed around: create a server, register plugins, add routes, and listen.

## Common Workflows

### Type route params and request bodies at the app boundary

Restify request data is dynamic at runtime. A practical pattern is to define your application types and narrow `req.params` or `req.body` before using them.

```typescript
import restify = require("restify");

type CreateUserBody = {
  email: string;
  role: "admin" | "member";
};

function isCreateUserBody(value: unknown): value is CreateUserBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  return typeof body.email === "string"
    && (body.role === "admin" || body.role === "member");
}

const server = restify.createServer();

server.use(restify.plugins.bodyParser());

server.post("/accounts/:accountId/users", (req, res, next) => {
  const { accountId } = req.params as { accountId: string };
  const body = req.body as unknown;

  if (!isCreateUserBody(body)) {
    return next(new restify.errors.BadRequestError("Invalid request body"));
  }

  res.send(201, {
    accountId,
    email: body.email,
    role: body.role,
  });

  return next();
});
```

This keeps the type boundary explicit: Restify parses the request, and your application decides when the parsed data is trustworthy enough to use.

### Augment `Request` for app-specific middleware

When middleware attaches data to the request object, extend the exported `Request` interface in a project `.d.ts` file.

Create a declaration file such as `src/types/restify.d.ts`:

```typescript
declare module "restify" {
  interface Request {
    requestId?: string;
  }
}

export {};
```

Then use the augmented property in middleware and handlers:

```typescript
import { randomUUID } from "node:crypto";
import restify = require("restify");

const server = restify.createServer();

server.use((req, _res, next) => {
  const headerValue = req.headers["x-request-id"];
  const requestId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  req.requestId = requestId ?? randomUUID();
  return next();
});

server.get("/ping", (req, res, next) => {
  res.send({ requestId: req.requestId });
  return next();
});
```

This is the main customization point most Restify TypeScript apps need.

### Use the typed plugin namespace

The declarations include the built-in plugin helpers exposed under `restify.plugins`.

```typescript
import restify = require("restify");

const server = restify.createServer();

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
```

Register only the parsers your routes depend on. For example, `req.query` is only useful if your app enables query parsing, and `req.body` depends on the body parser running before the route.

## Important Pitfalls

- Install `restify` as well as `@types/restify`; the declaration package does not include runtime code.
- Import from `restify`, not from `@types/restify`.
- Without TypeScript interop settings, prefer `import restify = require("restify")` over a default import.
- Keep your project `.d.ts` files inside the paths matched by `tsconfig.json` `include` or `files`, or module augmentation will appear not to work.
- Treat `req.params`, `req.query`, and `req.body` as application input, not as already-validated domain objects.
- The request properties available at runtime depend on the Restify plugins and options you register before your routes.

## Version-Sensitive Notes

- This guide targets `@types/restify==8.5.12`.
- The published declarations model the classic Restify server API built around `createServer()`, route handlers, the `plugins` namespace, and the exported request and response types.
- The declaration package is separate from the `restify` runtime, so keep your runtime version aligned with the API surface the typings model.
- The declaration entrypoint uses a CommonJS export style, so your preferred import form depends on your TypeScript interop settings.

## Official Sources

- npm package page for `@types/restify`: https://www.npmjs.com/package/@types/restify
- DefinitelyTyped source for `@types/restify`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/restify
- `@types/restify` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/restify/index.d.ts
- Restify runtime package page: https://www.npmjs.com/package/restify
- Restify documentation home: https://restify.com/docs/home/
- Restify server API: https://restify.com/docs/server-api/
- Restify plugins API: https://restify.com/docs/plugins-api/
