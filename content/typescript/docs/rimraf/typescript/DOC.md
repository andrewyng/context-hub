---
name: rimraf
description: "TypeScript guidance for `rimraf`, including the `@types/rimraf` package entry, typed imports, Promise-based deletion, and opt-in glob usage."
metadata:
  languages: "typescript"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,rimraf,node,filesystem,types,npm"
---

# rimraf TypeScript Guide

## Golden Rule

Use `rimraf` in application code.

The practical TypeScript integration boundary is the runtime package: current `rimraf` publishes its own declarations, a `types` entry, and typed ESM/CommonJS exports. Import values and types from `"rimraf"`, not from `@types/rimraf`.

## Install

Install the runtime package and the normal TypeScript toolchain for a Node.js project:

```bash
npm install rimraf
npm install -D typescript @types/node
```

If your project already lists `@types/rimraf` directly, you usually do not need to import or reference it in code. The important dependency for current projects is `rimraf` itself.

## Initialization

There are no package-specific environment variables, credentials, or client objects to initialize.

The setup that matters is your TypeScript compiler configuration and your import style.

### Recommended `tsconfig.json`

`rimraf` publishes typed ESM and CommonJS entry points. For a Node.js project, a practical compiler setup is:

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

If your project restricts ambient packages with `compilerOptions.types`, include `node`:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

## Import Patterns

Use named imports from `rimraf`:

```ts
import {
  rimraf,
  rimrafSync,
  native,
  type RimrafAsyncOptions,
  type RimrafSyncOptions,
} from "rimraf";
```

In CommonJS, require the runtime package:

```ts
const { rimraf, rimrafSync, native } = require("rimraf");
```

Do not rely on a default import for current `rimraf` releases.

## Common Workflows

### Remove build output asynchronously

`rimraf()` accepts a path or an array of paths and returns a `Promise<boolean>`.

```ts
import { rimraf, type RimrafAsyncOptions } from "rimraf";

const options: RimrafAsyncOptions = {
  glob: false,
  preserveRoot: true,
};

const removed = await rimraf(["dist", "coverage"], options);

if (!removed) {
  throw new Error("Some paths were preserved by a filter");
}
```

For normal deletions without a `filter`, the resolved value is typically `true`.

### Opt in to glob patterns

Since `rimraf` v4, globbing is not implicit. Set `glob: true` or pass a `glob` options object when you want pattern matching.

```ts
import { rimraf } from "rimraf";

await rimraf("packages/*/dist", { glob: true });
```

If you do not opt in to globbing, treat the path as literal.

### Keep selected files with a typed filter

The async API accepts a typed `filter` callback. When a filter keeps some entries, the returned boolean can be `false`.

```ts
import { rimraf, type RimrafAsyncOptions } from "rimraf";

const options: RimrafAsyncOptions = {
  filter: (path, entry) => {
    if (entry.isDirectory()) {
      return true;
    }

    return !path.endsWith(".keep");
  },
};

const removedAll = await rimraf("tmp", options);

console.log({ removedAll });
```

The filter receives the path plus a `Dirent` or `Stats` object for that entry.

### Use the synchronous API in scripts

`rimrafSync()` uses the same path and options model, but returns a boolean directly.

```ts
import { rimrafSync, type RimrafSyncOptions } from "rimraf";

const options: RimrafSyncOptions = {
  glob: false,
};

const removed = rimrafSync(".cache", options);

console.log({ removed });
```

Use the async API when possible. The README notes that synchronous recursive deletion is typically slower than async deletion.

### Run the CLI from package scripts

The package also ships a CLI.

```bash
npx rimraf dist coverage
npx rimraf --glob "packages/*/dist"
```

Quote glob patterns so your shell does not expand them before `rimraf` receives them.

## Important Pitfalls

### Old callback examples are for pre-v4 code

If you find examples such as `rimraf(path, callback)`, they are from older versions. The v4+ API returns a `Promise` for async use instead of taking a callback.

### Globbing is opt-in

`rimraf("build/*")` does not mean "delete matching directories" unless you also enable `glob`.

Use one of these forms explicitly:

```ts
await rimraf("build/*", { glob: true });
await rimraf("build/output", { glob: false });
```

### `filter` and `signal` can change the implementation path

The README notes that using `filter` or `signal` prevents `rimraf` from using Node's built-in `fs.rm`, because that implementation does not support those features.

If you need filtering or abort support, that is expected behavior.

### Treat root deletion overrides with care

The CLI preserves `/` by default, and the API also protects root deletion unless you explicitly disable that safeguard with `preserveRoot: false`.

Only override this when you fully control the target path.

## Version Note

This guide is written for the `@types/rimraf` `4.0.5` package entry on npm.

For practical TypeScript use, the important version-sensitive points are:

- current `rimraf` publishes the declarations your project consumes
- current `rimraf` uses named exports rather than a default export
- v4 changed async removal from callback style to `Promise` style
- v4 requires explicit glob opt-in
- as documented in the maintainer README, the return value is boolean starting in `4.3`
