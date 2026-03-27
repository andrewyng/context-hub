---
name: cookie-parser
description: "TypeScript definitions for cookie-parser middleware, signed cookies, and Express request cookie properties"
metadata:
  languages: "typescript"
  versions: "1.4.10"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,cookie-parser,express,cookies,middleware,types"
---

# cookie-parser TypeScript Guide

`@types/cookie-parser` adds TypeScript declarations for the `cookie-parser` runtime package. Use it in Express apps that parse the `Cookie` header, read `req.cookies`, or validate signed cookies through `req.signedCookies`.

This package only provides `.d.ts` files. Install `cookie-parser` itself for runtime behavior.

## Install

Install the Express runtime, the cookie parser middleware, and the type packages together:

```bash
npm install express cookie-parser
npm install --save-dev typescript @types/express @types/cookie-parser
```

No remote service setup or authentication is required. If you use signed cookies, configure an application secret in your environment:

```bash
export COOKIE_SECRET='current-secret,previous-secret'
```

## TypeScript Setup

`cookie-parser` is a CommonJS module. The most portable import form is:

```typescript
import cookieParser = require("cookie-parser");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import cookieParser from "cookie-parser";
```

In a normal project, installing `@types/cookie-parser` is enough. Only add it to `compilerOptions.types` when your project already restricts which declaration packages TypeScript loads:

```json
{
  "compilerOptions": {
    "types": ["node", "express", "cookie-parser"]
  }
}
```

## Add The Middleware

The middleware factory accepts an optional signing secret and an optional options object that is forwarded to `cookie.parse`.

```typescript
import express from "express";
import cookieParser = require("cookie-parser");

const app = express();

const secrets = process.env.COOKIE_SECRET
  ?.split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cookieParser(secrets && secrets.length > 0 ? secrets : undefined)
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
```

After this middleware runs:

- `req.cookies` contains parsed cookies keyed by cookie name.
- `req.signedCookies` contains cookies that were successfully unsigned.
- `req.secret` is set when you pass a signing secret.

If you pass an array of secrets, `cookie-parser` tries each secret in order when unsigning cookies, and `req.secret` is set to the first secret in the array.

## Read Plain Cookies Safely

Cookie values are dynamic at runtime, so guard the value before using it as a string or object.

```typescript
import express, { Request, Response } from "express";
import cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());

app.get("/preferences", (req: Request, res: Response) => {
  const theme = typeof req.cookies.theme === "string"
    ? req.cookies.theme
    : "light";

  res.json({ theme });
});
```

If a cookie value has the `j:` prefix and contains valid JSON, the middleware parses it with `JSON.parse` before exposing it on `req.cookies`.

## Read Signed Cookies Safely

Signed cookies are removed from `req.cookies` and moved to `req.signedCookies`. When signature validation fails, the value becomes `false`.

```typescript
import express, { Request, Response } from "express";
import cookieParser = require("cookie-parser");

type SessionCookie = {
  userId: string;
  role: "admin" | "member";
};

function isSessionCookie(value: unknown): value is SessionCookie {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Record<string, unknown>;

  return typeof session.userId === "string"
    && (session.role === "admin" || session.role === "member");
}

const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET));

app.get("/me", (req: Request, res: Response) => {
  const session = req.signedCookies.session;

  if (session === false) {
    res.status(400).json({ error: "invalid signed cookie" });
    return;
  }

  if (!isSessionCookie(session)) {
    res.status(401).json({ error: "missing session" });
    return;
  }

  res.json({
    userId: session.userId,
    role: session.role,
  });
});
```

This pattern keeps the TypeScript boundary explicit: treat cookie data as untrusted input until you check its shape.

## Use The Helper Exports

The runtime package also exports helper functions, and the type package includes declarations for them.

```typescript
import cookieParser = require("cookie-parser");

const parsedJson = cookieParser.JSONCookie('j:{"darkMode":true}');

const unsigned = cookieParser.signedCookie(
  "s:example-value.signature",
  process.env.COOKIE_SECRET ?? "dev-secret"
);

if (unsigned === false) {
  throw new Error("Cookie signature is invalid");
}

console.log(parsedJson, unsigned);
```

Use these helpers when you need to parse or unsign cookie values outside the normal Express middleware flow.

## Common Pitfalls

- Install `cookie-parser` as well as `@types/cookie-parser`; the type package does not include runtime code.
- Register `app.use(cookieParser(...))` before routes that read `req.cookies` or `req.signedCookies`.
- Guard signed cookie values against `false`; that value means signature verification failed.
- Guard cookie values before treating them as strings or structured objects.
- Add `"cookie-parser"` to `compilerOptions.types` only if your project already restricts loaded type packages.
