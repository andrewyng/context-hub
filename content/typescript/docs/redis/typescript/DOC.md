---
name: redis
description: "TypeScript guidance for Redis projects, including when `@types/redis` matters and when the `redis` runtime package already provides the types you need"
metadata:
  languages: "typescript"
  versions: "4.0.11"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,redis,node-redis,types,definitelytyped"
---

# Redis TypeScript Guide

`@types/redis` is a declaration package for Redis usage in TypeScript, but modern Node Redis projects should write application code against the `redis` runtime package itself.

Use this rule in practice:

- Install `redis` when your app actually connects to Redis.
- Import from `"redis"`, not from `"@types/redis"`.
- Add `@types/redis@4.0.11` only when an existing codebase, dependency, or build setup explicitly requires that separate declaration package.

The declaration package does not install a Redis server or the Node Redis runtime client.

## Install

For a normal TypeScript application, install the runtime package and the Node declarations your project usually needs:

```bash
npm install redis
npm install --save-dev typescript @types/node
```

Only add the separate declaration package when you have a specific compatibility reason to keep it:

```bash
npm install --save-dev @types/redis@4.0.11
```

If you are starting a new project on current `redis`, prefer the runtime package's own TypeScript support and skip the extra `@types/redis` dependency.

## TypeScript Setup

No special Redis-specific `tsconfig.json` setting is required just to consume the client types.

If your project restricts loaded global type packages, keep Node globals available:

```json
{
  "compilerOptions": {
    "strict": true,
    "types": ["node"]
  }
}
```

The important boundary is that module typings come from the `redis` package you import in application code.

## Initialization

Load connection settings from the environment and create the client from `redis`:

```env
REDIS_URL=redis://default:secret@localhost:6379/0
```

```ts
import "dotenv/config";
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379/0",
});

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

await client.connect();
```

Do not import anything from `@types/redis` directly. The package exists for declarations only.

## Common Workflow: Typed JSON Helpers

Redis stores strings and binary values. In TypeScript code, the practical pattern is to add small typed wrappers at the application boundary.

```ts
import "dotenv/config";
import { createClient } from "redis";

type Session = {
  userId: string;
  roles: string[];
};

const client = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379/0",
});

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

await client.connect();

async function setJson(key: string, value: unknown, ttlSeconds?: number) {
  const payload = JSON.stringify(value);

  if (ttlSeconds !== undefined) {
    await client.set(key, payload, { EX: ttlSeconds });
    return;
  }

  await client.set(key, payload);
}

async function getJson<T>(key: string): Promise<T | null> {
  const value = await client.get(key);

  return value ? (JSON.parse(value) as T) : null;
}

await setJson("session:123", { userId: "u_123", roles: ["admin"] }, 900);

const session = await getJson<Session>("session:123");

if (session) {
  console.log(session.userId);
  console.log(session.roles.includes("admin"));
}

await client.quit();
```

This keeps Redis calls simple while preserving strong types in the rest of your code.

## Common Workflow: Narrow Command Results Before Use

Redis command results are often nullable. Guard them before passing values deeper into your app.

```ts
import { createClient } from "redis";

const client = createClient();
await client.connect();

const rawCount = await client.get("retry-count");

const retryCount = rawCount === null ? 0 : Number.parseInt(rawCount, 10);

if (Number.isNaN(retryCount)) {
  throw new Error("retry-count is not an integer");
}

await client.quit();
```

Treat `string | null` and parsed JSON as boundary types. Convert them once and keep the rest of your code strongly typed.

## Pitfalls

### Do not import from `@types/redis`

This is wrong:

```ts
import "@types/redis";
```

Use the runtime package instead:

```ts
import { createClient } from "redis";
```

### Do not install the type package instead of the runtime package

This package does not create network connections, expose Redis commands at runtime, or start a Redis server. Your app still needs the `redis` dependency.

### Avoid duplicate type sources

If your project already uses a `redis` release that ships its own declarations, adding `@types/redis` can create unnecessary duplication. Prefer the runtime package's bundled typings for new work.

## Version Notes

This guide is scoped to `@types/redis@4.0.11`.

For current application code, the practical TypeScript integration point is still the `redis` package API:

- `createClient()` to create a client
- `client.connect()` before issuing commands
- `client.get()` and `client.set()` for key-value access
- `client.quit()` for graceful shutdown

If you are updating an older project that still carries `@types/redis`, keep your imports and runtime usage centered on `redis`, then remove the extra declaration package once the project no longer depends on it.
