---
name: fs-extra
description: "TypeScript declarations for fs-extra's extended filesystem helpers, promise-based workflows, and Node fs-compatible imports."
metadata:
  languages: "typescript"
  versions: "11.0.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,fs-extra,nodejs,filesystem,types,definitelytyped"
---

# fs-extra TypeScript Guide

`@types/fs-extra` adds TypeScript declarations for the `fs-extra` runtime package.

Install it when your project imports `fs-extra` for helpers such as `copy`, `ensureDir`, `move`, `outputFile`, `readJson`, `writeJson`, `pathExists`, and `remove`.

This package only provides `.d.ts` files. Your application code still runs the real `fs-extra` package.

## Install

Install the runtime package and the declaration package together:

```bash
npm install fs-extra
npm install -D typescript @types/fs-extra
```

If `fs-extra` and TypeScript are already present, add only the missing declarations:

```bash
npm install -D @types/fs-extra
```

Import runtime code from `"fs-extra"`, not from `"@types/fs-extra"`.

## Initialization

There are no package-specific environment variables, credentials, or client objects to initialize.

The important setup points are your import style and your TypeScript compiler options.

### Import `fs-extra`

The safest import form for CommonJS-style typings is:

```typescript
import fs = require("fs-extra");
```

If your project enables interoperability for default imports from CommonJS packages, you can use:

```typescript
import fs from "fs-extra";
```

### Recommended `tsconfig.json`

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

If you prefer `import fs = require("fs-extra")`, `esModuleInterop` is not required for this package.

## Common Workflows

### Ensure a directory and persist JSON

`fs-extra` adds filesystem helpers on top of Node's `fs` API. A common pattern is creating a directory, writing a JSON file, then loading it later.

```typescript
import fs from "fs-extra";
import { join } from "node:path";

type AppConfig = {
  outDir: string;
  retries: number;
};

const configDir = join(process.cwd(), ".example-app");
const configPath = join(configDir, "config.json");

export async function writeDefaultConfig() {
  const config = {
    outDir: "dist",
    retries: 3,
  } satisfies AppConfig;

  await fs.ensureDir(configDir);
  await fs.writeJson(configPath, config);
}

export async function loadConfig(): Promise<AppConfig | null> {
  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  return (await fs.readJson(configPath)) as AppConfig;
}
```

At the type boundary, treat data loaded from JSON as untrusted runtime input and narrow or validate it in your own code before relying on its shape.

### Copy generated files and clean up build output

The extra helpers are promise-friendly when you omit a callback, so they fit naturally into `async` build and setup scripts.

```typescript
import fs from "fs-extra";
import { join } from "node:path";

const sourceDir = join(process.cwd(), "public");
const outputDir = join(process.cwd(), "dist", "public");
const cacheDir = join(process.cwd(), ".cache");

export async function publishAssets() {
  await fs.copy(sourceDir, outputDir);
}

export async function clearLocalCache() {
  await fs.remove(cacheDir);
}
```

### Use Node `fs` methods from the same import

The main `fs-extra` package re-exports Node `fs` methods, so a single import can cover both standard operations and the extra helpers.

```typescript
import fs from "fs-extra";

export async function readBanner(path: string): Promise<string> {
  return fs.readFile(path, "utf8");
}

export async function writeBanner(path: string, banner: string) {
  await fs.outputFile(path, banner);
}
```

This is usually the simplest import pattern for Node scripts, CLIs, and server-side tooling.

### Prefer promise-returning overloads in TypeScript

`fs-extra` supports callbacks and promise-returning calls. In TypeScript, the promise overload is usually easier to compose and infer.

```typescript
import fs = require("fs-extra");

export async function backupFile(sourcePath: string, backupPath: string) {
  await fs.copy(sourcePath, backupPath);
}

export function backupFileWithCallback(
  sourcePath: string,
  backupPath: string,
  done: (error: Error | null) => void,
) {
  fs.copy(sourcePath, backupPath, (error) => {
    done(error ?? null);
  });
}
```

Use the callback form only when you need to integrate with an older API that already expects callbacks.

## Common Pitfalls

- Install `fs-extra` as well as `@types/fs-extra`; the declaration package does not include the runtime implementation.
- Import from `"fs-extra"`, not from `"@types/fs-extra"`.
- If you use `import fs from "fs-extra"`, enable `esModuleInterop` or `allowSyntheticDefaultImports`; otherwise use `import fs = require("fs-extra")`.
- The main `fs-extra` import includes Node `fs` methods, but the runtime docs note that `fs-extra/esm` does not include those `fs` methods.
- Async helpers return promises when you omit the callback; if you pass a callback, use the callback-based overload consistently.
- JSON helper methods load runtime data, not validated application types; add your own narrowing or validation where the shape matters.

## Official Sources

- https://www.npmjs.com/package/@types/fs-extra
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/fs-extra
- https://www.npmjs.com/package/fs-extra
- https://github.com/jprichardson/node-fs-extra
