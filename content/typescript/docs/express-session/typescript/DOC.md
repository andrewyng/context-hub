---
name: express-session
description: "TypeScript declarations for express-session middleware, request augmentation, SessionData merging, cookie options, and store APIs."
metadata:
  languages: "typescript"
  versions: "1.18.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,express,express-session,cookies,node,authentication,types,definitelytyped"
---

# express-session TypeScript Guide

## Golden Rule

Install `@types/express-session` alongside the real `express-session` runtime package.

`@types/express-session` only provides TypeScript declarations. Your application still imports and runs `express-session`; the declaration package adds typings for:

- the `session()` middleware factory
- `Express.Request` properties such as `req.session`, `req.sessionID`, and `req.sessionStore`
- `SessionData`, which is the intended extension point for your app-specific session fields
- session cookie options and store interfaces

## Install

Install the runtime package first, then the declaration packages your server code depends on:

```bash
npm install express express-session
npm install --save-dev typescript @types/express @types/express-session @types/node
```

The middleware itself does not create credentials, but most apps should provide a secret through the environment rather than hard-coding it:

```bash
export SESSION_SECRET="replace-this-with-a-long-random-secret"
export NODE_ENV="development"
```

The declarations document that `secret` can be a single value or an array of values, and note that HMAC-256 signing means the secret should contain at least 32 bytes of entropy.

## TypeScript Setup

`express-session` uses `export =` in its type declarations.

Without `esModuleInterop`, use the CommonJS-compatible import form:

```ts
import session = require("express-session");
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, a default import works:

```ts
import session from "express-session";
```

If your project restricts ambient type loading with `compilerOptions.types`, include `express-session` explicitly and make sure your custom `.d.ts` files are part of the compilation:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "types": ["node", "express", "express-session"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"]
}
```

Import runtime values and types from `express-session`, not from `@types/express-session`.

## Initialize The Middleware

There is no client object to create. The practical setup is an Express app with `express-session` middleware configured before the routes that use `req.session`.

```ts
import express from "express";
import session from "express-session";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is required");
}

const app = express();

app.use(express.json());

app.use(
  session({
    name: "sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === "production",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" ? "auto" : false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);
```

Choose `resave` and `saveUninitialized` explicitly. In the declarations, both still describe a default of `true`, but also mark relying on that default as deprecated because it may change.

If you run behind a reverse proxy and rely on secure cookies, configure proxy handling before assuming `cookie.secure` will work the way you expect. The type declarations support both the middleware's `proxy` option and `cookie.secure: "auto"`.

## Add Application Fields To `SessionData`

`SessionData` is the supported extension point for your app's own session values.

Create a declaration file such as `src/types/express-session.d.ts`:

```ts
declare module "express-session" {
  interface SessionData {
    userId?: string;
    returnTo?: string;
    flash?: {
      type: "error" | "success";
      message: string;
    };
  }
}

export {};
```

This follows the declaration-merging pattern documented directly in the package's `SessionData` comments.

After the merge, `req.session.userId`, `req.session.returnTo`, and `req.session.flash` become known to TypeScript anywhere the augmentation file is included.

One important detail from the request typing: `req.session` is declared as `session.Session & Partial<session.SessionData>`. That means custom fields still need normal undefined checks until your code initializes them.

## Common Workflows

### Read And Write Typed Session Values

Once you augment `SessionData`, route handlers can read and write those fields through `req.session`.

```ts
import express from "express";

const app = express();

app.get("/me", (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "not signed in" });
    return;
  }

  res.json({
    userId: req.session.userId,
    expiresAt: req.session.cookie.expires,
  });
});
```

`req.session.cookie` is always available on the typed session object, even when your own merged fields are still unset.

### Regenerate The Session Before Setting Identity

The `Session` class exposes callback-based lifecycle methods including `regenerate()`, `save()`, `reload()`, and `destroy()`.

```ts
import express from "express";

const app = express();

app.post("/login", (req, res, next) => {
  const userId = "user_123";

  req.session.regenerate((err) => {
    if (err) {
      next(err);
      return;
    }

    req.session.userId = userId;

    req.session.save((saveErr) => {
      if (saveErr) {
        next(saveErr);
        return;
      }

      res.status(204).end();
    });
  });
});
```

The type declarations document `save()` as useful for cases such as redirects and other flows where you do not want to rely only on the automatic save at the end of the HTTP response.

### Destroy The Session On Logout

`destroy()` is also callback-based and unsets `req.session` when it completes.

```ts
import express from "express";

const app = express();

app.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }

    res.clearCookie("sid");
    res.status(204).end();
  });
});
```

If you customize the cookie name with the `name` option, clear the same cookie name on logout.

### Adjust Cookie Settings With Typed Literals

The declarations model cookie settings directly on `req.session.cookie`, including `maxAge`, `httpOnly`, `secure`, `sameSite`, `domain`, `path`, `priority`, and `partitioned`.

```ts
import express from "express";

const app = express();

app.post("/remember-me", (req, res) => {
  req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
  req.session.cookie.sameSite = "lax";
  req.session.cookie.priority = "high";
  req.session.touch();

  res.status(204).end();
});
```

Use `maxAge` rather than setting `expires` directly. In the declarations, `expires` is marked deprecated in favor of `maxAge`.

## Integration Boundary

`@types/express-session` covers the shared TypeScript layer around the runtime middleware. In a typical app you still need:

- `express-session` for the actual middleware behavior
- `express` and `@types/express` for the request/response types that get augmented
- your own `.d.ts` file to define the shape of application-specific session data
- a separate store package if you do not want the default in-memory store

The type declarations expose `session.Store` and `session.MemoryStore`, and model store methods such as `get()`, `set()`, `destroy()`, and optional helpers like `touch()`.

## Important Pitfalls

- Install `express-session` as well as `@types/express-session`; the type package does not include runtime JavaScript.
- Do not import from `@types/express-session`; import from `express-session`.
- If you restrict `compilerOptions.types`, include `express-session` or the `Express.Request` augmentation will not load.
- Keep your `declare module "express-session"` file inside the paths matched by your project's `include` or `files` settings.
- `req.session`, `req.sessionID`, and `req.sessionStore` are only present at runtime after the middleware has run.
- Because `req.session` includes `Partial<SessionData>`, your custom properties are usually optional until you initialize them.
- `MemoryStore` is typed, but the declarations explicitly warn that it is only meant for debugging and development and is not suitable for production.
- If you change the `secret`, existing signed cookies stop validating; provide an array when you need secret rotation without immediately invalidating existing cookies.
- If multiple apps share the same hostname, set a distinct `name` instead of relying on the default `connect.sid` cookie name.

## Version-Sensitive Notes

- `@types/express-session@1.18.2` declares `typeScriptVersion: "5.1"` in its package metadata.
- In this version, `CookieOptions` includes modern attributes such as `partitioned`, `priority`, `sameSite`, and `secure: "auto"`.
- In this version, `req.sessionStore` is typed as `session.Store & { generate: (req: Request) => void }`.

## Official Sources

- https://www.npmjs.com/package/@types/express-session
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express-session
- https://github.com/expressjs/session
- https://www.typescriptlang.org/docs/handbook/declaration-merging.html
