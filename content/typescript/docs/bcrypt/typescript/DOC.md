---
name: bcrypt
description: "TypeScript declarations for bcrypt password hashing in Node.js, including async and sync hashing, salt generation, password comparison, and work-factor inspection"
metadata:
  languages: "typescript"
  versions: "6.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,bcrypt,passwords,hashing,security,node,types,definitelytyped"
---

# bcrypt TypeScript Guide

`@types/bcrypt` adds TypeScript declarations for the `bcrypt` runtime package. Install it when your Node.js app hashes passwords with `bcrypt` and you want typed access to the async and sync APIs for `genSalt`, `hash`, `compare`, and `getRounds`.

This package only provides declarations. Import and execute code from `bcrypt`, not from `@types/bcrypt`.

## Golden Rule

Install `@types/bcrypt` alongside the real `bcrypt` runtime package.

`@types/bcrypt` does not include hashing code, native bindings, or any password-storage behavior by itself. It only describes the runtime API to TypeScript.

## Install

Install the runtime package first, then add the declaration package and standard Node.js TypeScript support:

```bash
npm install bcrypt
npm install -D typescript @types/bcrypt @types/node
```

If `bcrypt` is already in your app, add only the missing declarations:

```bash
npm install -D @types/bcrypt
```

`bcrypt` does not require API keys, service credentials, or package-defined environment variables.

If you want the work factor to be configurable across environments, define an application variable such as:

```bash
export BCRYPT_SALT_ROUNDS=12
```

## TypeScript Setup

The declaration package uses `export =`, so the most portable import form is:

```typescript
import bcrypt = require("bcrypt");
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import bcrypt from "bcrypt";
```

Recommended `tsconfig.json` settings for a Node.js app:

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

If your project restricts loaded global type packages, keep `node` available to the same project that imports `bcrypt`.

## Initialization

There is no client object to create and no authentication step.

The practical setup is choosing a cost factor and deciding whether to use the async Promise-based API or the sync API.

For server request handlers, prefer the async functions so password hashing does not block the event loop.

```typescript
import bcrypt from "bcrypt";

const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10);

if (!Number.isInteger(saltRounds) || saltRounds <= 0) {
  throw new Error("BCRYPT_SALT_ROUNDS must be a positive integer");
}
```

## Common Workflows

### Hash a password with a cost factor

Pass a number as the second argument to `hash()` when you want `bcrypt` to generate the salt for you.

```typescript
import bcrypt from "bcrypt";

const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, saltRounds);
}
```

This is the simplest typed integration for application code that stores a full bcrypt hash string in a database.

### Compare a candidate password to a stored hash

Use `compare()` during sign-in or password verification.

```typescript
import bcrypt from "bcrypt";

export async function verifyPassword(
  candidatePassword: string,
  storedHash: string,
) {
  return bcrypt.compare(candidatePassword, storedHash);
}
```

Store the full hash returned by `hash()` and pass that stored value back into `compare()`.

### Generate a salt explicitly

Use `genSalt()` when you want to separate salt generation from hashing.

```typescript
import bcrypt from "bcrypt";

const saltRounds = 12;

export async function hashWithExplicitSalt(password: string) {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}
```

The same API shape also supports callback-based usage, but Promise-returning calls are the most practical fit for modern TypeScript apps.

### Use the sync API in scripts or one-off tools

The declarations also cover the synchronous helpers.

```typescript
import bcrypt from "bcrypt";

const salt = bcrypt.genSaltSync(12);
const passwordHash = bcrypt.hashSync("correct horse battery staple", salt);
const matches = bcrypt.compareSync("correct horse battery staple", passwordHash);

console.log({ passwordHash, matches });
```

Use the sync functions carefully in long-lived servers because they block the Node.js event loop while hashing work is in progress.

### Inspect the work factor on an existing hash

Use `getRounds()` when you need to see whether an older stored hash should be replaced with a stronger cost factor.

```typescript
import bcrypt from "bcrypt";

export function needsRehash(storedHash: string, minimumRounds: number) {
  return bcrypt.getRounds(storedHash) < minimumRounds;
}
```

This is useful when you want to rehash on successful login after increasing your application's target cost factor.

## Important Pitfalls

- `@types/bcrypt` does not install or execute the runtime package. Install `bcrypt` itself.
- Import from `bcrypt`, not from `@types/bcrypt`.
- Without TypeScript interop flags, prefer `import bcrypt = require("bcrypt")` over a default import.
- Prefer async `genSalt()`, `hash()`, and `compare()` in server code; the sync variants block the event loop.
- Store the full bcrypt hash string returned by `hash()`; later verification and round inspection expect that complete value.
- If you read the cost factor from an environment variable, parse and validate it before passing it to `genSalt()` or `hash()`.

## Version-Sensitive Notes

- This guide targets `@types/bcrypt==6.0.0`.
- The declaration package models the `bcrypt` runtime API with Promise-based, callback-based, and synchronous overloads for salt generation, hashing, and comparison.
- The declaration entrypoint uses `export =`, so your import style depends on your TypeScript interop settings.
- These declarations are for the `bcrypt` package. They do not replace the runtime package and do not apply to other bcrypt-compatible libraries unless those libraries document the same API.

## Official Sources

- https://www.npmjs.com/package/@types/bcrypt
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/bcrypt
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/bcrypt/index.d.ts
- https://www.npmjs.com/package/bcrypt
- https://github.com/kelektiv/node.bcrypt.js
