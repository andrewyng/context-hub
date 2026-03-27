---
name: passport
description: "TypeScript declarations for Passport's core middleware, request helpers, session hooks, and Express user augmentation."
metadata:
  languages: "typescript"
  versions: "1.0.17"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,passport,authentication,express,sessions,types,definitelytyped"
---

# Passport TypeScript Guide

`@types/passport` adds TypeScript declarations for the `passport` runtime package. In practice, it matters most in three places:

- typing the `passport` module itself
- augmenting `Express.Request` with `req.user`, `req.login()`, `req.logout()`, and `req.isAuthenticated()`
- letting your app define the actual shape of `Express.User`

This package only ships `.d.ts` files. Install `passport` itself for runtime behavior.

## Install

Install the runtime package and the type package together:

```bash
npm install passport
npm install --save-dev @types/passport
```

If you use Passport with Express sessions, install the surrounding runtime and type packages as well:

```bash
npm install express express-session passport
npm install --save-dev typescript @types/express @types/express-session @types/passport
```

Passport itself does not require environment variables, but session-based apps usually do. A minimal local setup is:

```bash
export SESSION_SECRET="replace-this-with-a-long-random-secret"
```

## TypeScript Setup

`passport` is a CommonJS package. If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, use a default import:

```ts
import passport from "passport";
```

Otherwise use the CommonJS-compatible import form:

```ts
import passport = require("passport");
```

If your `tsconfig.json` restricts loaded ambient type packages with `compilerOptions.types`, include `passport` there:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "types": ["node", "express", "express-session", "passport"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"]
}
```

If you do not restrict `compilerOptions.types`, you usually do not need this snippet.

## Define Your `Express.User` Shape

`@types/passport` intentionally leaves `Express.User` open so your app can describe the authenticated user object it stores on `req.user`.

Create a project declaration file such as `src/types/express-passport.d.ts`:

```ts
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      displayName: string;
    }
  }
}

export {};
```

Make sure this `.d.ts` file is included by TypeScript. After that, `req.user` and Passport callbacks use your application-specific user type.

## Initialize Passport In An Express App

For session-based authentication, wire `express-session`, `passport.initialize()`, and `passport.session()` in that order:

```ts
import express from "express";
import session from "express-session";
import passport from "passport";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is required");
}

const app = express();

app.use(express.json());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
```

If you are using Passport without sessions, omit `passport.session()` and pass `{ session: false }` where appropriate in `passport.authenticate()`.

## Common Workflows

### Narrow `req.user` with `req.isAuthenticated()`

The declaration package types `req.isAuthenticated()` as a type guard. After the check passes, `req.user` is treated as a defined `Express.User`.

```ts
import express from "express";

const app = express();

app.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "authentication required" });
    return;
  }

  res.json({
    id: req.user.id,
    email: req.user.email,
    displayName: req.user.displayName,
  });
});
```

This is the safest way to read `req.user` in route handlers without extra non-null assertions.

### Log a user in with `req.login()`

Use `req.login()` after your own credential or token verification step when you want Passport to establish a login session.

```ts
import express from "express";

const app = express();

app.post("/session-login", async (req, res, next) => {
  const user = await verifyCredentials(req.body.email, req.body.password);

  if (!user) {
    res.status(401).json({ error: "invalid credentials" });
    return;
  }

  req.login(user, (err) => {
    if (err) {
      next(err);
      return;
    }

    res.status(204).end();
  });
});

async function verifyCredentials(email: string, password: string): Promise<Express.User | null> {
  if (email === "demo@example.com" && password === "correct-horse-battery-staple") {
    return {
      id: "user_123",
      email,
      displayName: "Demo User",
    };
  }

  return null;
}
```

The callback is part of the typed API. Handle errors there instead of assuming a synchronous return value.

### Log a user out with `req.logout()`

`@types/passport` models logout as a callback-based API as well:

```ts
import express from "express";

const app = express();

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
      return;
    }

    res.status(204).end();
  });
});
```

### Serialize and deserialize session users

When you enable session support, define how Passport stores a user identifier in the session and how it rebuilds `req.user` on later requests.

```ts
import passport from "passport";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  findUserById(id)
    .then((user) => done(null, user ?? false))
    .catch((err: unknown) => done(err));
});

async function findUserById(id: string): Promise<Express.User | null> {
  if (id === "user_123") {
    return {
      id,
      email: "demo@example.com",
      displayName: "Demo User",
    };
  }

  return null;
}
```

Because `Express.User` is your own merged interface, the same type flows through `serializeUser()`, `deserializeUser()`, and authenticated route handlers.

### Use `passport.authenticate()` as Express middleware

Core Passport types include `passport.authenticate()`, but strategy names and strategy-specific options come from the runtime strategy package you install.

```ts
import express from "express";
import passport from "passport";

const app = express();

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successReturnToOrRedirect: "/account",
  }),
);
```

For a real app, install the matching strategy package as well, for example `passport-local` plus its type package if it publishes separate typings.

## Integration Boundary

`@types/passport` covers Passport core. You often need additional packages around it:

- `passport` for the runtime middleware and request helpers
- `express` and `express-session` when you use session-based login flows
- a strategy package such as `passport-local`, `passport-jwt`, or `passport-google-oauth20`
- that strategy package's own type definitions when they are separate from the runtime package

Use `@types/passport` for the shared core layer, then add strategy-specific typings separately.

## Important Pitfalls

- Install `passport` as well as `@types/passport`; the type package does not include runtime JavaScript.
- Define `Express.User` yourself or `req.user` stays too generic to be useful in application code.
- Include your custom `.d.ts` file in TypeScript compilation or the `Express.User` merge will not take effect.
- If you restrict `compilerOptions.types`, add `passport` or the request augmentation will not load.
- `passport` uses CommonJS export syntax; without `esModuleInterop`, prefer `import passport = require("passport")`.
- Handle `req.login()` and `req.logout()` through their callbacks rather than treating them as synchronous helpers.
- `passport.authenticate()` does not install a strategy for you; add the runtime strategy package separately.

## Official Sources

- https://www.npmjs.com/package/@types/passport
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/passport
- https://www.npmjs.com/package/passport
- https://www.passportjs.org/
