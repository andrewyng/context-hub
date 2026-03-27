---
name: jsonwebtoken
description: "TypeScript declarations for jsonwebtoken signing, verification, decoded JWT payloads, error classes, and callback-based key lookup in Node.js."
metadata:
  languages: "typescript"
  versions: "9.0.10"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,jsonwebtoken,jwt,auth,nodejs,types,definitelytyped"
---

# jsonwebtoken TypeScript Guide

`@types/jsonwebtoken` adds TypeScript declarations for the `jsonwebtoken` runtime package.

Install it when your Node.js app signs, verifies, or decodes JWTs with `jsonwebtoken` and you want typed access to `sign()`, `verify()`, `decode()`, JWT option objects, and error classes such as `TokenExpiredError`.

This package only ships declarations. Your application still runs the real `jsonwebtoken` package.

## Golden Rule

Install `@types/jsonwebtoken` alongside `jsonwebtoken`.

Import runtime code from `"jsonwebtoken"`, not from `"@types/jsonwebtoken"`.

## Install

Install the runtime package first, then add TypeScript support:

```bash
npm install jsonwebtoken
npm install -D typescript @types/jsonwebtoken @types/node
```

If `jsonwebtoken` and TypeScript are already present, add only the missing declarations:

```bash
npm install -D @types/jsonwebtoken
```

`@types/jsonwebtoken` depends on `@types/ms` and `@types/node`, so duration strings used in options such as `expiresIn` and `notBefore` are typed in TypeScript.

## TypeScript Setup

The `jsonwebtoken` runtime package is CommonJS. A portable TypeScript import style is a namespace import:

```typescript
import * as jwt from "jsonwebtoken";
import type { JwtPayload, Secret } from "jsonwebtoken";
```

If your project compiles to CommonJS, named imports from `"jsonwebtoken"` can also be convenient, but the namespace import is the safest default across Node.js module setups.

Recommended `tsconfig.json` settings for a Node app:

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

If your project restricts `compilerOptions.types`, keep `node` in that list so `Buffer`, `process.env`, and Node crypto key types remain available.

## Initialization

There is no client object and no package-specific authentication step.

The practical setup is loading your signing secret or key material from application configuration and typing it as a `Secret`.

```bash
export JWT_SECRET='replace-with-a-long-random-secret'
export JWT_ISSUER='example-app'
export JWT_AUDIENCE='web'
```

```typescript
import type { Secret } from "jsonwebtoken";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export const jwtSecret: Secret = requiredEnv("JWT_SECRET");
export const jwtIssuer = requiredEnv("JWT_ISSUER");
export const jwtAudience = requiredEnv("JWT_AUDIENCE");
```

For asymmetric algorithms such as `RS256` or `ES256`, the key parameter types also accept Node crypto key input or a `KeyObject`.

## Common Workflows

### Sign a token with typed claims

`sign()` accepts `string`, `Buffer`, or object payloads. Use an object payload when you want JWT claims like `exp`, `nbf`, `iss`, `sub`, or `aud` to be managed through the payload or options object.

```typescript
import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

type SessionClaims = JwtPayload & {
  sub: string;
  role: "admin" | "member";
};

export function issueAccessToken(userId: string, role: SessionClaims["role"]) {
  const payload: SessionClaims = {
    sub: userId,
    role,
  };

  return jwt.sign(payload, jwtSecret, {
    algorithm: "HS256",
    issuer: jwtIssuer,
    audience: jwtAudience,
    expiresIn: "15m",
  });
}
```

The declaration package types `algorithm`, `expiresIn`, `notBefore`, `issuer`, `audience`, `subject`, and `jwtid` for the runtime `sign()` call.

### Verify a token and narrow the payload shape

The synchronous `verify()` overload returns `JwtPayload | string` unless you request `complete: true`. Narrow the result before reading custom claims.

```typescript
import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

type SessionClaims = JwtPayload & {
  sub: string;
  role: "admin" | "member";
};

function isSessionClaims(value: string | JwtPayload): value is SessionClaims {
  return (
    typeof value !== "string" &&
    typeof value.sub === "string" &&
    (value.role === "admin" || value.role === "member")
  );
}

export function readAccessToken(token: string): SessionClaims {
  const decoded = jwt.verify(token, jwtSecret, {
    algorithms: ["HS256"],
    issuer: jwtIssuer,
    audience: jwtAudience,
  });

  if (!isSessionClaims(decoded)) {
    throw new Error("Unexpected token payload");
  }

  return decoded;
}
```

This is the main type boundary in everyday use: TypeScript can tell you the return type is a union, but your application still needs a runtime check for the payload shape it expects.

### Handle `verify()` errors explicitly

The declarations expose the runtime error classes so you can branch on expiration, activation time, or general verification failures.

```typescript
import * as jwt from "jsonwebtoken";

export function tryReadAccessToken(token: string) {
  try {
    return readAccessToken(token);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return null;
    }

    if (error instanceof jwt.NotBeforeError) {
      throw new Error("Token is not active yet");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Token verification failed");
    }

    throw error;
  }
}
```

This works with the synchronous `verify()` overloads, which throw on invalid input or failed validation.

### Inspect the full token with `complete: true`

When you need the JWT header as well as the payload, use `complete: true`. The return type becomes `Jwt`, which includes `header`, `payload`, and `signature`.

```typescript
import * as jwt from "jsonwebtoken";

export function inspectToken(token: string) {
  const decoded = jwt.verify(token, jwtSecret, {
    algorithms: ["HS256"],
    complete: true,
  });

  console.log(decoded.header.alg);
  console.log(decoded.header.kid);

  if (typeof decoded.payload !== "string") {
    console.log(decoded.payload.sub);
  }
}
```

This is useful when your app needs header fields such as `kid` during key rotation or debugging.

### Fetch the verification key asynchronously

The asynchronous `verify()` forms are callback-based. They matter when your app selects a public key from the token header before verification.

```typescript
import * as jwt from "jsonwebtoken";
import { createPublicKey } from "node:crypto";
import type { GetPublicKeyOrSecret, JwtPayload } from "jsonwebtoken";

const publicKeys = new Map<string, string>([
  ["current", process.env.JWT_PUBLIC_KEY ?? ""],
]);

const getKey: GetPublicKeyOrSecret = (header, done) => {
  const kid = header.kid;
  const pem = kid ? publicKeys.get(kid) : undefined;

  if (!pem) {
    done(new Error("Unknown signing key"));
    return;
  }

  done(null, createPublicKey(pem));
};

export function verifyWithKeyLookup(token: string) {
  return new Promise<JwtPayload | string>((resolve, reject) => {
    jwt.verify(token, getKey, { algorithms: ["RS256"] }, (error, decoded) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(decoded as JwtPayload | string);
    });
  });
}
```

The package types the `header` parameter, the signing-key callback, and the callback result. There is no Promise-returning `verify()` overload in this package; wrap the callback form yourself if you want `await` in application code.

### Decode a token without verifying it

`decode()` is typed separately from `verify()` and returns `null` when the token cannot be decoded.

```typescript
import * as jwt from "jsonwebtoken";

export function readTokenBody(token: string) {
  return jwt.decode(token, { json: true });
}
```

Use `decode()` only for non-authentication tasks such as logging or debugging. It does not validate the signature.

## Common Pitfalls

- Install `jsonwebtoken` as well as `@types/jsonwebtoken`; the declaration package does not include signing or verification code.
- Import from `jsonwebtoken`, never from `@types/jsonwebtoken`.
- Prefer object payloads when using `expiresIn`, `notBefore`, `issuer`, `subject`, `audience`, or `jwtid`; the runtime rejects those options for string or `Buffer` payloads.
- Do not set both `payload.exp` and `options.expiresIn`, or both `payload.nbf` and `options.notBefore`; the runtime treats those combinations as errors.
- `verify()` returns a union type, so narrow `string | JwtPayload` before reading custom claims.
- `decode()` does not verify a signature and must not be used as an authentication check.
- The async `sign()` and `verify()` APIs are callback-based, not Promise-based.
- If you use `maxAge` during verification, the runtime requires an `iat` claim to be present.
- Keep the runtime package on the same major line as the declaration package; `@types/jsonwebtoken@9.0.10` is written for the `jsonwebtoken` v9 API surface.

## Official Sources

- https://www.npmjs.com/package/@types/jsonwebtoken
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/jsonwebtoken
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jsonwebtoken/index.d.ts
- https://www.npmjs.com/package/jsonwebtoken
- https://github.com/auth0/node-jsonwebtoken
