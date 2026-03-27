---
name: body-parser
description: "TypeScript definitions for body-parser middleware factories, parser options, and Express request-body integration"
metadata:
  languages: "typescript"
  versions: "1.19.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,body-parser,express,http,middleware,types,definitelytyped"
---

# body-parser TypeScript Guide

## Golden Rule

Install `body-parser` for runtime behavior and `@types/body-parser` for TypeScript declarations.

`@types/body-parser` only adds `.d.ts` files for the `body-parser` module. Your application still imports and runs `body-parser` itself.

## Install

For a typical Express app, install the runtime packages first, then the TypeScript declarations:

```bash
npm install express body-parser
npm install -D typescript @types/node @types/express @types/body-parser
```

No environment variables, credentials, or client initialization are required.

## Initialize In TypeScript

`@types/body-parser` uses `export = bodyParser`, so the most portable import form is:

```typescript
import bodyParser = require("body-parser");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import bodyParser from "body-parser";
```

If you restrict loaded declaration packages with `compilerOptions.types`, keep the relevant Node and Express types available to the server project:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "types": ["node", "express", "body-parser"]
  }
}
```

## Common Workflows

### Parse JSON Bodies With A Typed Handler

Use `bodyParser.json()` for JSON requests, then give your Express handler an explicit `ReqBody` type.

```typescript
import express, { type RequestHandler } from "express";
import bodyParser from "body-parser";

type CreateUserBody = {
  email: string;
  name: string;
};

function isCreateUserBody(value: unknown): value is CreateUserBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  return typeof body.email === "string" && typeof body.name === "string";
}

const app = express();
const jsonParser = bodyParser.json({
  limit: "1mb",
  strict: true,
});

const createUser: RequestHandler<{}, {}, CreateUserBody> = (req, res) => {
  if (!isCreateUserBody(req.body)) {
    res.status(400).json({ error: "invalid request body" });
    return;
  }

  res.status(201).json({
    email: req.body.email,
    name: req.body.name,
  });
};

app.post("/users", jsonParser, createUser);
```

The generic type tells TypeScript what your route expects. It does not validate untrusted input at runtime, so keep a guard or validation step before using `req.body`.

### Parse URL-Encoded Form Bodies

Use `bodyParser.urlencoded()` for HTML forms and other `application/x-www-form-urlencoded` requests.

```typescript
import express, { type RequestHandler } from "express";
import bodyParser from "body-parser";

type LoginForm = {
  username?: string;
  password?: string;
};

const app = express();
const formParser = bodyParser.urlencoded({
  extended: false,
  limit: "50kb",
  parameterLimit: 100,
});

const login: RequestHandler<{}, {}, LoginForm> = (req, res) => {
  if (typeof req.body.username !== "string" || typeof req.body.password !== "string") {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  res.json({ ok: true, username: req.body.username });
};

app.post("/login", formParser, login);
```

The declarations expose `extended` and `parameterLimit`, which are the main form-parsing options you will usually configure in TypeScript apps.

### Model `text()` And `raw()` With Express Generics

The parser you choose determines the runtime shape of `req.body`. Reflect that in the `ReqBody` generic you give the handler.

```typescript
import express, { type RequestHandler } from "express";
import bodyParser from "body-parser";

const app = express();

const textParser = bodyParser.text({
  type: "text/plain",
  limit: "100kb",
});

const receiveText: RequestHandler<{}, {}, string> = (req, res) => {
  res.json({ length: req.body.length });
};

const rawParser = bodyParser.raw({
  type: "application/octet-stream",
  limit: "10mb",
});

const receiveBinary: RequestHandler<{}, {}, Buffer> = (req, res) => {
  res.json({ bytes: req.body.byteLength });
};

app.post("/plain-text", textParser, receiveText);
app.post("/upload", rawParser, receiveBinary);
```

This is the most important integration boundary for `@types/body-parser`: the middleware factory is typed here, but your handler decides the application-specific `req.body` shape.

### Use `type` And `verify` When Content Negotiation Matters

All parser option types include `type`, `limit`, `inflate`, and `verify`.

```typescript
import bodyParser from "body-parser";

const webhookJson = bodyParser.json({
  type: ["application/json", "application/*+json"],
  limit: "256kb",
  verify: (req, _res, buf, encoding) => {
    if (buf.length === 0) {
      throw new Error("request body is required");
    }

    console.log(req.headers["content-type"], encoding);
  },
});
```

In the published declaration file, `type` accepts a string, an array of strings, or a function that receives `http.IncomingMessage`. `verify` receives the raw `Buffer` and request encoding before parsing completes.

## Important Pitfalls

- Install `body-parser` as well as `@types/body-parser`; the declaration package contains no executable code.
- Import from `body-parser`, never from `@types/body-parser`.
- Prefer `bodyParser.json()`, `bodyParser.urlencoded()`, `bodyParser.text()`, or `bodyParser.raw()`; the top-level callable signature is marked deprecated in `@types/body-parser`.
- Register the middleware before the routes that read `req.body`.
- Treat `req.body` as untrusted input even when TypeScript says it has a specific shape.
- Do not stack multiple body readers on the same request unless you know exactly which middleware reads the stream first; the runtime docs describe `stream.not.readable` as a common failure mode when the body was already consumed.

## Version-Sensitive Notes

- This guide targets `@types/body-parser==1.19.6`.
- The published package depends on `@types/connect` and `@types/node`.
- The published package metadata declares `typeScriptVersion: 5.1`.
- The declaration package exposes `json`, `raw`, `text`, and `urlencoded` parser factories, plus a deprecated top-level callable signature.
- The current `body-parser` runtime README documents additional options that are not present in `@types/body-parser@1.19.6`, including `defaultCharset` for `json`, plus `defaultCharset`, `charsetSentinel`, `interpretNumericEntities`, and `depth` for `urlencoded`. If you use those runtime options, you will need a local type assertion or declaration patch.

## Official Sources

- https://www.npmjs.com/package/@types/body-parser
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/body-parser
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/body-parser/index.d.ts
- https://www.npmjs.com/package/body-parser
- https://github.com/expressjs/body-parser#readme
