---
name: supertest
description: "TypeScript declarations for SuperTest request builders, agents, and response objects when testing Node HTTP servers and Express apps."
metadata:
  languages: "typescript"
  versions: "7.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,supertest,testing,node,http,express,superagent,types,definitelytyped"
---

# SuperTest TypeScript Guide

## Golden Rule

Install the real `supertest` runtime package and the `@types/supertest` declaration package together.

`@types/supertest` only provides TypeScript declarations. Your test code imports and executes `supertest`; the declaration package gives the compiler and editor type information for `request()`, `request.agent()`, chained request builders such as `.get()`, `.post()`, `.query()`, `.set()`, `.send()`, `.expect()`, and the response object you get back from awaited requests.

## Install

```bash
npm install --save-dev supertest
npm install --save-dev typescript @types/supertest @types/node
```

If your project already has `supertest`, add only the missing declarations:

```bash
npm install --save-dev @types/supertest @types/node
```

If you are testing an Express app, you usually also want the framework types in the same project:

```bash
npm install --save-dev @types/express
```

## Initialization

There are no environment variables, credentials, or client objects to configure.

The practical setup points are your import style, your TypeScript compiler options, and whether you target an in-process app or a real server.

### Import `supertest`

The declaration package uses `export =`, so the safest import form is:

```typescript
import request = require("supertest");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, the more common default import form also works:

```typescript
import request from "supertest";
```

Import code from `supertest`, not from `@types/supertest`.

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

`@types/supertest` does not need any runtime bootstrap. Once the package is installed, importing `supertest` is enough.

## Common Workflows

### Test an in-process Express app

The usual SuperTest pattern is to pass your app directly to `request(app)` instead of listening on a port.

```typescript
import express from "express";
import request from "supertest";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

async function checkHealth() {
  await request(app)
    .get("/health")
    .expect("Content-Type", /json/)
    .expect(200);
}
```

This keeps tests fast and avoids managing a separate port for simple integration tests.

### Send headers, query parameters, and JSON bodies

SuperTest request builders are chainable, so common HTTP setup reads naturally in TypeScript.

```typescript
import express from "express";
import request from "supertest";

const app = express();

app.use(express.json());

app.post("/users", (req, res) => {
  res.status(201).json({
    id: "user_123",
    email: req.body.email,
    admin: req.query.admin === "true",
    requestId: req.header("x-request-id") ?? null,
  });
});

async function createUser() {
  const res = await request(app)
    .post("/users")
    .query({ admin: "true" })
    .set("x-request-id", "req_123")
    .send({ email: "ada@example.com" })
    .expect(201);

  return res.body;
}
```

Use `.query()` for URL parameters, `.set()` for headers, and `.send()` for request bodies.

### Reuse cookies with `request.agent()`

Use an agent when a test flow depends on cookies or other session state carried across requests.

```typescript
import express from "express";
import request from "supertest";

const app = express();

app.use(express.json());

app.post("/login", (_req, res) => {
  res.cookie("session", "s_123").status(204).end();
});

app.get("/me", (req, res) => {
  const authenticated = req.header("cookie")?.includes("session=s_123");

  if (!authenticated) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  res.json({ id: "user_123" });
});

async function readSessionBack() {
  const agent = request.agent(app);

  await agent.post("/login").expect(204);

  const res = await agent.get("/me").expect(200);
  return res.body;
}
```

Use a fresh agent per test when you want isolation between test cases.

### Type your response bodies at the application boundary

SuperTest can describe the HTTP interaction, but it cannot infer your app's JSON schema automatically. Narrow `res.body` in your test code when the response shape matters.

```typescript
import express from "express";
import request from "supertest";

type MeResponse = {
  id: string;
};

function isMeResponse(value: unknown): value is MeResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id: unknown }).id === "string"
  );
}

const app = express();

app.get("/me", (_req, res) => {
  res.json({ id: "user_123" });
});

async function getCurrentUser() {
  const res = await request(app).get("/me").expect(200);
  const body: unknown = res.body;

  if (!isMeResponse(body)) {
    throw new Error("Unexpected response shape");
  }

  return body.id;
}
```

This keeps transport assertions and application-shape checks separate, which is usually the cleanest TypeScript boundary.

### Target a real `http.Server` when needed

If your app must be initialized exactly as production code starts it, you can pass a server object instead of an app instance.

```typescript
import express from "express";
import { createServer } from "node:http";
import request from "supertest";

const app = express();
const server = createServer(app);

app.get("/health", (_req, res) => {
  res.status(200).end();
});

async function checkServer() {
  try {
    await request(server).get("/health").expect(200);
  } finally {
    server.close();
  }
}
```

Use this form only when you need server-level behavior; `request(app)` is simpler for most tests.

## Important Pitfalls

- `@types/supertest` is a declaration package only. Install `supertest` separately for the runtime.
- Import from `supertest`, not from `@types/supertest`.
- If you do not enable `esModuleInterop` or `allowSyntheticDefaultImports`, prefer `import request = require("supertest")` over a default import.
- `request(app)` usually does not need `app.listen()`. Starting a real listener unnecessarily can slow tests and leave open handles.
- `request.agent()` persists cookies across calls. Reuse it only when you want shared session state.
- `res.body` is not automatically narrowed to your application's JSON type. Add a local interface, schema, or type guard when response shape matters.

## Version-Sensitive Notes

- This guide targets `@types/supertest==7.2.0`.
- The package documents TypeScript declarations only; the runtime behavior still comes from the `supertest` package you execute in tests.
- Keep `supertest` and `@types/supertest` current together so the declared request-builder surface matches the runtime you are actually using.

## Official Sources

- https://www.npmjs.com/package/@types/supertest
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/supertest
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/supertest/index.d.ts
- https://www.npmjs.com/package/supertest
- https://github.com/ladjs/supertest
