---
name: hapi-hapi
description: "TypeScript declarations for @hapi/hapi server creation, routes, handlers, plugins, and request/response types."
metadata:
  languages: "typescript"
  versions: "21.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,hapi,node,http,server,types,definitelytyped"
---

# @hapi/hapi TypeScript Guide

## Golden Rule

Install `@types/hapi__hapi` alongside the real `@hapi/hapi` runtime package.

`@types/hapi__hapi` only provides TypeScript declarations. Your application still imports and runs `@hapi/hapi`; the declaration package adds typings for server creation, route definitions, handlers, plugins, requests, responses, and related configuration objects.

## Install

Install the runtime package first, then the TypeScript packages your project depends on:

```bash
npm install @hapi/hapi
npm install --save-dev typescript @types/hapi__hapi @types/node
```

The type package does not require authentication or any external service setup. Typical server settings come from environment variables:

```bash
export HOST="127.0.0.1"
export PORT="3000"
```

## TypeScript Setup

Import runtime values and types from `@hapi/hapi`, not from `@types/hapi__hapi`.

The declaration package follows the standard DefinitelyTyped naming convention for scoped packages:

- runtime package: `@hapi/hapi`
- declaration package: `@types/hapi__hapi`
- `compilerOptions.types` entry: `hapi__hapi`

`@hapi/hapi` uses a CommonJS-compatible export style in the declaration package.

Without TypeScript interop flags, use:

```ts
import Hapi = require("@hapi/hapi");
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```ts
import Hapi from "@hapi/hapi";
```

If your project restricts ambient type loading with `compilerOptions.types`, include `hapi__hapi` explicitly:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "types": ["node", "hapi__hapi"]
  },
  "include": ["src/**/*.ts"]
}
```

## Create And Start A Typed Server

There is no client object or credentials to configure. The practical setup is creating a server with `Hapi.server(...)`, adding routes, and then calling `await server.start()`.

```ts
import Hapi from "@hapi/hapi";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "127.0.0.1";

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a positive integer");
}

async function main() {
  const server = Hapi.server({
    port,
    host,
  });

  server.route({
    method: "GET",
    path: "/health",
    handler: () => ({ ok: true }),
  });

  await server.start();
  console.log(`Server running at ${server.info.uri}`);
}

void main();
```

## Common Workflows

### Reuse typed route objects

Use `Hapi.ServerRoute` when you want to define routes outside the `server.route(...)` call site.

```ts
import Hapi from "@hapi/hapi";

const healthRoute: Hapi.ServerRoute = {
  method: "GET",
  path: "/health",
  handler: (_request, h) => {
    return h.response({ ok: true }).code(200);
  },
};

const echoRoute: Hapi.ServerRoute = {
  method: "POST",
  path: "/echo",
  handler: (request) => {
    return { payload: request.payload ?? null };
  },
};

const server = Hapi.server({ port: 3000 });
server.route([healthRoute, echoRoute]);
```

This keeps route configuration reusable while still letting TypeScript check the supported route fields.

### Type handler parameters explicitly when needed

When a handler is extracted into a separate function, annotate `Hapi.Request` and `Hapi.ResponseToolkit` directly.

```ts
import Hapi = require("@hapi/hapi");

const helloRoute: Hapi.ServerRoute = {
  method: "GET",
  path: "/hello/{name}",
  handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const params = request.params as { name: string };

    return h.response({
      message: `Hello, ${params.name}`,
    });
  },
};
```

Request params, query values, and payloads are runtime data. Narrow or validate them before treating them as application-specific types.

### Register a plugin with typed server access

Plugins receive the same `Hapi.Server` type as the main application.

```ts
import Hapi from "@hapi/hapi";

async function buildServer() {
  const server = Hapi.server({ port: 3000 });

  await server.register({
    name: "health-routes",
    register: async (registeredServer: Hapi.Server) => {
      registeredServer.route({
        method: "GET",
        path: "/ready",
        handler: () => ({ ready: true }),
      });
    },
  });

  return server;
}
```

This is a straightforward pattern when you want plugin code to stay type-safe without importing internal app helpers.

## Important Pitfalls

- `@types/hapi__hapi` does not install or run the server framework. Install `@hapi/hapi` itself.
- Import from `@hapi/hapi`, not from `@types/hapi__hapi`.
- Without `esModuleInterop` or `allowSyntheticDefaultImports`, prefer `import Hapi = require("@hapi/hapi")`.
- If your project uses `compilerOptions.types`, include `hapi__hapi` or TypeScript may not load the declarations.
- Route inputs such as `request.params`, `request.query`, and `request.payload` come from runtime data; narrow or validate them before using application-specific fields.
- Parse and validate `PORT` before passing it to `Hapi.server(...)` so your configuration stays typed and predictable.

## Version-Sensitive Notes

- This guide targets `@types/hapi__hapi==21.0.0`.
- The package name uses the standard DefinitelyTyped mapping for scoped packages: `@types/hapi__hapi` describes imports from `@hapi/hapi`.
- Use `@hapi/hapi` in application code and reserve `hapi__hapi` for TypeScript configuration that refers to declaration package names.
- The declarations are published separately from the runtime package, so keep `@hapi/hapi` and `@types/hapi__hapi` aligned to the same major API you want to use.

## Official Sources

- https://www.npmjs.com/package/@types/hapi__hapi
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/hapi__hapi
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/hapi__hapi/index.d.ts
- https://www.npmjs.com/package/@hapi/hapi
