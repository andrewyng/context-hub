---
name: bcryptjs
description: "TypeScript guidance for `bcryptjs`, including the `@types/bcryptjs` package boundary, imports, password hashing, hash verification, and browser fallback setup."
metadata:
  languages: "typescript"
  versions: "3.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,bcryptjs,bcrypt,passwords,hashing,security,node,browser,npm"
---

# bcryptjs TypeScript Guide

## Golden Rule

For a current TypeScript project, install and import `bcryptjs`.

`@types/bcryptjs` is not the package you import in application code. The practical runtime boundary is `bcryptjs`, which exposes the hashing APIs you call from Node.js or browser-oriented code.

In practice:

- install `bcryptjs`
- remove `@types/bcryptjs` if it was added directly to your project
- import from `bcryptjs`, never from `@types/bcryptjs`

## Install

Install the runtime package and your normal TypeScript toolchain:

```bash
npm install bcryptjs
npm install -D typescript @types/node
```

If your project already added `@types/bcryptjs` directly, remove it:

```bash
npm uninstall @types/bcryptjs
```

`bcryptjs` does not require credentials, API keys, or service initialization.

If you want the bcrypt cost factor to vary by environment, define an application variable such as:

```bash
export BCRYPT_SALT_ROUNDS=12
```

## TypeScript Setup

`bcryptjs` is commonly used as a module object in the official runtime examples, so a practical TypeScript import is:

```typescript
import * as bcrypt from "bcryptjs";
```

Recommended `tsconfig.json` settings for a Node.js project:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": false
  }
}
```

If your code reads `process.env`, keep `@types/node` available to that project. If your framework injects config another way, replace the environment-variable examples with your framework's config API.

Do not add `bcryptjs` or `@types/bcryptjs` to `compilerOptions.types`. Importing from `bcryptjs` is enough.

## Initialization

There is no client object to create and no authentication step.

The practical setup is choosing a cost factor and deciding whether to use the async API or the sync API. The official README notes that the async API splits work into small chunks and places the next chunk on the event loop queue, which is the safer choice for request-driven server code.

```typescript
import * as bcrypt from "bcryptjs";

const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10);

if (!Number.isInteger(saltRounds) || saltRounds <= 0) {
  throw new Error("BCRYPT_SALT_ROUNDS must be a positive integer");
}

export { bcrypt, saltRounds };
```

## Common Workflows

### Hash a password with an application-defined cost factor

Pass a number as the second argument to `hash()` when you want `bcryptjs` to generate the salt for you.

```typescript
import * as bcrypt from "bcryptjs";

const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}
```

Store the returned 60-character hash string in your database and reuse that stored value during verification.

### Compare a plaintext password with a stored hash

Use `compare()` during sign-in or password verification.

```typescript
import * as bcrypt from "bcryptjs";

export async function verifyPassword(
  candidatePassword: string,
  storedHash: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, storedHash);
}
```

The README documents both callback-based and Promise-based async forms. In TypeScript application code, the Promise-returning form is usually the simplest fit.

### Generate a salt explicitly

Use `genSalt()` when you want to separate salt generation from hashing.

```typescript
import * as bcrypt from "bcryptjs";

export async function hashWithExplicitSalt(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}
```

### Use the sync API in scripts or one-off tools

The runtime also exposes synchronous helpers.

```typescript
import * as bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(12);
const passwordHash = bcrypt.hashSync("correct horse battery staple", salt);
const matches = bcrypt.compareSync("correct horse battery staple", passwordHash);

console.log({ passwordHash, matches });
```

Prefer the async functions in long-lived servers. The sync variants block the event loop while hashing work is in progress.

### Inspect the rounds or salt in an existing hash

Use `getRounds()` when you need to decide whether to rehash with a stronger cost factor, and `getSalt()` when you need the salt portion from a valid stored hash.

```typescript
import * as bcrypt from "bcryptjs";

export function inspectHash(storedHash: string) {
  return {
    rounds: bcrypt.getRounds(storedHash),
    salt: bcrypt.getSalt(storedHash),
  };
}
```

`getSalt()` expects a valid 60-character bcrypt hash string.

### Provide a secure random fallback in constrained runtimes

The runtime uses Node's `crypto` module on Node.js and Web Crypto in browsers. If your host has neither source available, configure `setRandomFallback()` with a cryptographically secure byte generator provided by that host.

```typescript
import * as bcrypt from "bcryptjs";

declare function secureRandomBytes(length: number): number[];

bcrypt.setRandomFallback((length: number) => secureRandomBytes(length));
```

Only use this with a cryptographically secure source of randomness. The maintainer README explicitly warns against weak fallback generators.

## Important Pitfalls

- Do not import from `@types/bcryptjs`; import from `bcryptjs`.
- Remove a direct `@types/bcryptjs` dependency from modern projects before debugging duplicate or stale types.
- Prefer async `genSalt()`, `hash()`, and `compare()` in server code; the sync variants block the event loop.
- BCrypt only uses the first 72 bytes of input. Multi-byte UTF-8 characters count toward that byte limit.
- Store the full hash returned by `hash()`; later calls to `compare()`, `getRounds()`, and `getSalt()` expect that stored bcrypt hash string.
- `setRandomFallback()` must use a cryptographically secure source. Do not substitute `Math.random()` or other non-cryptographic generators.

## Version Notes

- This guide targets `@types/bcryptjs==3.0.0`.
- The relevant runtime package is `bcryptjs`.
- The documented API surface includes async and sync helpers for `genSalt`, `hash`, and `compare`, plus `getRounds`, `getSalt`, and `setRandomFallback`.
- The official runtime README documents Promise-returning async calls when the callback argument is omitted.

## Official Sources

- https://www.npmjs.com/package/@types/bcryptjs
- https://www.npmjs.com/package/bcryptjs
- https://github.com/dcodeIO/bcrypt.js
- https://github.com/dcodeIO/bcrypt.js/blob/master/README.md
