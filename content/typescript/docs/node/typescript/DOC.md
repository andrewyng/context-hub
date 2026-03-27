---
name: node
description: "TypeScript declarations for Node.js built-in modules, globals, environment variables, and Node-specific compiler setup."
metadata:
  languages: "typescript"
  versions: "25.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,node,nodejs,types,definitelytyped,ambient-types"
---

# Node.js TypeScript Guide

## Golden Rule

Install `@types/node` for compile-time declarations only.

Your application code imports Node built-ins such as `node:fs`, `node:path`, and `node:module`. The `@types/node` package supplies the TypeScript definitions for those modules and for Node globals such as `process`, `Buffer`, `fetch`, and the `NodeJS` namespace.

It does not install the Node.js runtime itself.

## Install

Add TypeScript and the Node declaration package to your project:

```bash
npm install -D typescript @types/node
```

If TypeScript is already installed, add only the missing Node declarations:

```bash
npm install -D @types/node
```

`@types/node@25.4.0` depends on `undici-types`, so modern Node web-platform globals such as `fetch`, `Headers`, `Request`, and `Response` come from the package setup automatically.

## Initialization

There are no package-specific environment variables, credentials, or client objects to initialize.

The practical setup is your TypeScript compiler configuration and the way you import Node built-ins.

### Recommended `tsconfig.json`

Use Node-oriented module settings for Node applications:

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

If your project explicitly restricts ambient type packages with `compilerOptions.types`, include `node`:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

`@types/node@25.4.0` declares `typeScriptVersion: "5.2"` and ships `typesVersions` mappings for TypeScript `<=5.6` and `<=5.7`, so use TypeScript 5.2 or newer and let the compiler select the matching declaration tree.

## Common Workflows

### Import built-in modules and use Node globals

Import runtime APIs from Node module specifiers such as `node:fs/promises` and `node:path`. Globals such as `process` and `Buffer` are available through the installed declarations.

```typescript
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type PackageJson = {
  name: string;
  version: string;
};

export async function readPackageJson(): Promise<PackageJson> {
  const packageJsonPath = join(process.cwd(), "package.json");
  const raw = await readFile(packageJsonPath, "utf8");

  return JSON.parse(raw) as PackageJson;
}

const bytes = Buffer.from("context-hub", "utf8");
console.log(bytes.toString("hex"));
```

The declarations also cover bare specifiers such as `fs`, but `node:` imports make the runtime boundary explicit.

### Type `process.env` with declaration merging

Extend `NodeJS.ProcessEnv` in a `.d.ts` file that is included in your project compilation.

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT?: `${number}`;
    NODE_ENV?: "development" | "test" | "production";
  }
}
```

Then consume the variables with normal Node globals:

```typescript
const databaseUrl = process.env.DATABASE_URL;
const port = Number(process.env.PORT ?? "3000");

export const config = {
  databaseUrl,
  port,
};
```

This is the main customization point most Node TypeScript apps use with `@types/node`.

### Use Node's `fetch` types without DOM imports

The package includes web-platform fetch declarations and models them through `undici-types`, so you can type helper functions against `RequestInit`, `Response`, and related globals in Node code.

```typescript
type Healthcheck = {
  ok: boolean;
};

export async function getHealthcheck(url: string, init?: RequestInit): Promise<Healthcheck> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return (await response.json()) as Healthcheck;
}
```

### Bridge ESM code to CommonJS with `createRequire`

When an ESM file still needs `require()` semantics, use `createRequire()` from `node:module`.

```typescript
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type PackageJson = {
  name: string;
  version: string;
};

const packageJson = require("../package.json") as PackageJson;

console.log(`${packageJson.name}@${packageJson.version}`);
```

### Use Node timer types explicitly

Node timers return `NodeJS.Timeout`, not the browser's numeric timer ID.

```typescript
let heartbeat: NodeJS.Timeout | undefined;

export function startHeartbeat() {
  heartbeat = setInterval(() => {
    process.stdout.write(".");
  }, 1000);

  heartbeat.unref();
}

export function stopHeartbeat() {
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = undefined;
  }
}
```

## Common Pitfalls

- Install the real Node.js runtime separately; `@types/node` only provides declarations.
- Import from runtime module specifiers such as `node:fs` or `node:module`, not from `@types/node`.
- If your `tsconfig.json` uses `compilerOptions.types`, include `node` there or Node globals and built-in module typings will appear to disappear.
- `@types/node@25.4.0` requires TypeScript 5.2 or newer.
- Modern fetch-related globals in this package are modeled through the `undici-types` dependency.
- Keep custom `.d.ts` files such as your `ProcessEnv` augmentation inside the files matched by your project's `include` or `files` settings.

## Official Sources

- https://www.npmjs.com/package/@types/node
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node
- https://nodejs.org/api/fs.html
- https://nodejs.org/api/module.html
- https://nodejs.org/api/process.html
- https://nodejs.org/api/globals.html#fetch
