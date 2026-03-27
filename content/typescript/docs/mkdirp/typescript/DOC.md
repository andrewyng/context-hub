---
name: mkdirp
description: "TypeScript setup for `mkdirp`, including imports, Node.js compiler settings, and migrating off separate `@types/mkdirp` installs in modern projects."
metadata:
  languages: "typescript"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,mkdirp,node,filesystem,directories,types,npm"
---

# mkdirp TypeScript Guide

## Golden Rule

This entry tracks `@types/mkdirp@2.0.0`, but modern TypeScript projects should install and import `mkdirp` itself.

Current `mkdirp` npm metadata publishes declaration files from the runtime package through its `types` field and typed `exports` entry points. In practice, that means application code should import from `"mkdirp"`, not from `"@types/mkdirp"`.

If an older project still lists `@types/mkdirp`, remove it when that project is using a modern `mkdirp` runtime release.

## Install

For a current Node.js project, install the runtime package plus the normal TypeScript toolchain:

```bash
npm install mkdirp
npm install -D typescript @types/node
```

If your project already added the separate type package, remove it:

```bash
npm uninstall @types/mkdirp
```

There are no package-specific credentials, API keys, or service initialization steps.

## Initialization

The practical setup points are your Node.js compiler settings and your import style.

### Recommended `tsconfig.json`

`mkdirp` publishes typed import and require entry points. A practical Node.js setup is:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "types": ["node"],
    "skipLibCheck": false
  }
}
```

`@types/node` matters here because `mkdirp`'s declarations reference Node's `fs` types and `NodeJS.ErrnoException`.

If your project does not restrict `compilerOptions.types`, installing `@types/node` is usually enough.

### Import `mkdirp`

Use the runtime package as the TypeScript import boundary:

```ts
import { mkdirp } from "mkdirp";
```

In CommonJS code, require the runtime package:

```ts
const { mkdirp } = require("mkdirp");
```

Do not import from `@types/mkdirp` in application code.

## Common Workflows

### Create an application data directory before writing files

`mkdirp()` returns a promise that resolves to the first directory created, or `undefined` when the path already exists.

```ts
import { mkdirp } from "mkdirp";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const appDataDir = process.env.APP_DATA_DIR ?? "./var/app-data";

await mkdirp(appDataDir);

await writeFile(
  join(appDataDir, "settings.json"),
  JSON.stringify({ theme: "dark" }, null, 2),
  "utf8",
);
```

This is the most common TypeScript integration point: ensure a directory exists, then continue with normal Node.js file operations.

### Create directories synchronously during startup

Use `mkdirp.sync()` when startup code must finish directory creation before proceeding.

```ts
import { mkdirp } from "mkdirp";
import { createWriteStream } from "node:fs";
import { join } from "node:path";

const logDir = process.env.LOG_DIR ?? "./var/log";

mkdirp.sync(logDir);

const stream = createWriteStream(join(logDir, "app.log"), { flags: "a" });
stream.write("server started\n");
stream.end();
```

### Reuse a typed options object

The package root exports the functions you call directly. When you want a reusable options type in app code, derive it from the function signature instead of reaching into internal declaration files.

```ts
import { mkdirp } from "mkdirp";

type MkdirpOptions = NonNullable<Parameters<typeof mkdirp>[1]>;

const options: MkdirpOptions = {
  mode: 0o755,
};

await mkdirp("./var/cache", options);
```

This keeps your code coupled to the public function surface rather than to internal file paths inside the package.

### Force the native or manual implementation

The runtime package also exposes explicit `native` and `manual` variants.

```ts
import { mkdirp } from "mkdirp";

await mkdirp.native("./var/native-cache");
await mkdirp.manual("./var/manual-cache");
```

Use these only when you specifically need to choose one implementation path. The default `mkdirp()` entry point is the usual choice.

## Important Pitfalls

- Install and import `mkdirp`; do not point application imports at `@types/mkdirp`.
- If your project is intentionally pinned to older `mkdirp` 0.x or 1.x releases, verify that runtime line before removing older type-package setup. Current `mkdirp` 2.x and 3.x metadata publishes declarations, while older 1.x metadata does not.
- `mkdirp()` resolves to the first directory actually created, not always to the full target path.
- If `compilerOptions.types` is set, keep `node` in the list or Node-specific declarations used by `mkdirp` may disappear.
- Prefer inline option objects or `Parameters<typeof mkdirp>[1]` for reusable option typing instead of importing internal declaration paths.

## Version Note For `@types/mkdirp` 2.0.0

For the package version tracked here, the useful TypeScript workflow is centered on the `mkdirp` runtime package rather than on a separate declaration import path.

For modern projects, install `mkdirp`, import from `"mkdirp"`, and let TypeScript read the declarations published by that runtime package.
