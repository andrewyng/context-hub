---
name: http-errors
description: "TypeScript declarations for the http-errors runtime package, including the error factory, named HTTP constructors, and error narrowing with isHttpError."
metadata:
  languages: "typescript"
  versions: "2.0.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,http-errors,node,http,express,errors,types,definitelytyped"
---

# http-errors TypeScript Guide

## Golden Rule

Install `@types/http-errors` alongside the real `http-errors` runtime package.

`@types/http-errors` only provides TypeScript declarations. Your application imports and runs `http-errors`; the declaration package adds types for the callable `createError()` factory, status-specific constructors such as `NotFound` and `Unauthorized`, and the `isHttpError()` type guard.

## Install

Install the runtime package first, then add the declaration package for TypeScript:

```bash
npm install http-errors
npm install -D typescript @types/http-errors
```

If your server project does not already include Node.js types, add them as well:

```bash
npm install -D @types/node
```

`@types/http-errors@2.0.5` declares `typeScriptVersion: "5.1"`, so use TypeScript 5.1 or newer.

There are no environment variables, credentials, or client objects to initialize.

## Initialization

The practical setup points are your import style and how you model custom error fields in your own code.

### Import `http-errors`

The declaration entrypoint uses `export =`, so the configuration-independent import form is:

```typescript
import createHttpError = require("http-errors");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import createHttpError from "http-errors";
```

For example:

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

Import runtime code from `"http-errors"`, not from `"@types/http-errors"`.

## Common Workflows

### Create errors with status-specific types

The main factory infers the status code literal when the first argument is a numeric literal.

```typescript
import createHttpError = require("http-errors");

const notFound = createHttpError(404, "User not found");
const tooManyRequests = createHttpError(429, "Slow down", {
  expose: true,
  headers: {
    "retry-after": "60",
  },
});

const status: 404 = notFound.status;
const statusCode: 429 = tooManyRequests.statusCode;
```

The runtime documents `status`, `statusCode`, `message`, `expose`, and optional `headers` on the resulting error object. When you set `headers`, keep the header names lower-cased.

### Use named constructors

The declarations expose named constructors and numeric constructor properties for the documented 4xx and 5xx status codes.

```typescript
import createHttpError = require("http-errors");

const unauthorized = new createHttpError.Unauthorized("Sign in required");
const conflict = createHttpError[409]("Version conflict");

const unauthorizedStatus: 401 = unauthorized.status;
const conflictStatus: 409 = conflict.status;
```

Use named constructors when the status is fixed and you want that literal type to follow the error value.

### Wrap an existing error

You can turn an existing `Error` into an HTTP error and attach extra properties in the same call.

```typescript
import { readFile } from "node:fs/promises";
import createHttpError = require("http-errors");

export async function loadTemplate(): Promise<string> {
  try {
    return await readFile("email.html", "utf8");
  } catch (error) {
    throw createHttpError(500, error as Error, {
      expose: false,
      operation: "loadTemplate",
    });
  }
}
```

The runtime README documents this as extending the given error object with `HttpError` properties such as `status`, `statusCode`, and `expose`.

### Narrow `unknown` with `isHttpError`

Use `createHttpError.isHttpError()` at the boundary where your code catches `unknown` values.

```typescript
import createHttpError = require("http-errors");

export function toHttpResponse(error: unknown) {
  if (createHttpError.isHttpError(error)) {
    return {
      status: error.status,
      body: {
        error: error.expose ? error.message : "Internal Server Error",
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "Internal Server Error",
    },
  };
}
```

The type guard narrows the value to `createHttpError.HttpError`, which includes `status`, `statusCode`, `expose`, `headers`, and an index signature for additional fields.

### Model application-specific fields explicitly

The declarations allow arbitrary extra properties on `HttpError`, but your own code is easier to maintain if you define an app-specific intersection type.

```typescript
import createHttpError = require("http-errors");

type ApiError<Code extends number = number> = createHttpError.HttpError<Code> & {
  code: "USER_NOT_FOUND" | "PLAN_REQUIRED";
  details?: Record<string, unknown>;
};

export function userNotFound(userId: string): ApiError<404> {
  return createHttpError(404, `User ${userId} not found`, {
    code: "USER_NOT_FOUND",
    details: { userId },
  }) as ApiError<404>;
}
```

This keeps the useful literal status type from the package while making your own `code` and `details` fields explicit to the compiler.

### Use `http-errors` in Express middleware

`http-errors` is commonly used with Express error handling.

```typescript
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import createHttpError from "http-errors";

const app = express();

app.get("/users/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await findUser(req.params.userId);

    if (!user) {
      next(createHttpError.NotFound("User not found"));
      return;
    }

    res.json(user);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (!createHttpError.isHttpError(error)) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }

  if (error.headers) {
    res.set(error.headers);
  }

  res.status(error.status).json({
    error: error.expose ? error.message : "Internal Server Error",
  });
});

async function findUser(userId: string) {
  return userId === "123"
    ? { id: "123", name: "Ada" }
    : null;
}
```

This example uses default imports, so it assumes `esModuleInterop` or `allowSyntheticDefaultImports` is enabled.

## Version Notes

- This guide targets `@types/http-errors==2.0.5`.
- The declaration package has no dependencies and points to the DefinitelyTyped source tree at `types/http-errors`.
- The exported API shape is a callable CommonJS factory with attached constructor properties and `isHttpError()`.
- In `@types/http-errors@2.0.5`, the 511 constructor name is declared as `NetworkAuthenticationRequire` in `index.d.ts`, while the runtime README lists `NetworkAuthenticationRequired`. If you need a 511 error, prefer `createHttpError(511, ...)` or `createHttpError[511](...)`.

## Common Pitfalls

- Install `http-errors` as well as `@types/http-errors`; the type package does not include runtime code.
- Import from `"http-errors"`, not from `"@types/http-errors"`.
- Without TypeScript interop flags, prefer `import createHttpError = require("http-errors")` over a default import.
- Use 4xx or 5xx status codes. The runtime README documents constructors for those ranges, and the runtime source falls back to `500` for invalid values.
- Treat `headers` as string-valued response headers and keep the keys lower-cased.
- `createHttpError.isHttpError()` narrows to the library's `HttpError` type, not to your app-specific extra fields; add your own intersection type or custom guard when you need stronger typing.

## Official Sources

- https://www.npmjs.com/package/@types/http-errors
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/http-errors
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/http-errors/index.d.ts
- https://www.npmjs.com/package/http-errors
- https://github.com/jshttp/http-errors
- https://github.com/jshttp/http-errors/blob/master/README.md
