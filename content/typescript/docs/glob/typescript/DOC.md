---
name: glob
description: "TypeScript guide for the `glob` package: install the runtime package, import its bundled types, and use typed glob patterns, options, and results correctly."
metadata:
  languages: "typescript"
  versions: "9.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,glob,node,filesystem,types,definitelytyped"
---

# glob TypeScript Guide

## Golden Rule

Use `glob` as the runtime package and import all values and types from `"glob"`.

The maintained `glob` package publishes its own TypeScript declarations and typed export map. In application code, the practical boundary is the runtime package: `glob`, `globSync`, `globStream`, `globIterate`, `Glob`, and `GlobOptions` all come from `glob`.

Do not import anything from `@types/glob` in source files.

## Install

Install the runtime package, then add TypeScript and Node.js declarations for your project:

```bash
npm install glob
npm install -D typescript @types/node
```

If your project previously added `@types/glob` directly, remove that direct dependency and keep `glob`:

```bash
npm uninstall @types/glob
```

## Initialization

There are no environment variables, credentials, or client objects to configure.

The practical setup is your TypeScript compiler configuration and the way you import from `glob`.

### Recommended `tsconfig.json`

For Node.js projects, a Node-oriented compiler setup keeps the module boundary clear:

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

### Import values and types from `glob`

Use named imports from the runtime package:

```typescript
import {
  glob,
  globSync,
  globStream,
  Glob,
  type GlobOptions,
} from "glob";
```

CommonJS works as documented as well:

```typescript
const { glob, globSync, globStream, Glob } = require("glob");
```

## Common Workflows

### Find files asynchronously

`glob()` returns a `Promise<string[]>` when `withFileTypes` is not enabled.

```typescript
import { glob } from "glob";

const sourceFiles = await glob("src/**/*.ts", {
  cwd: process.cwd(),
  ignore: ["dist/**", "node_modules/**"],
  nodir: true,
});

console.log(sourceFiles);
```

This is the most common integration point for build scripts, CLIs, and code generation tasks.

### Reuse typed options in helpers

`GlobOptions` is exported from `glob`, so helper functions can share one typed options object.

```typescript
import { glob, type GlobOptions } from "glob";

const commonOptions: GlobOptions = {
  cwd: new URL("../", import.meta.url),
  nodir: true,
  ignore: ["coverage/**", "dist/**"],
};

export function findMarkdownFiles() {
  return glob("**/*.md", commonOptions);
}
```

The `cwd` option accepts either a string path or a `file://` URL.

### Return typed `Path` objects with `withFileTypes: true`

When you need richer filesystem data, enable `withFileTypes`. The return type switches from `string[]` to `Path[]`.

```typescript
import { glob } from "glob";

const entries = await glob("src/**/*", {
  withFileTypes: true,
  stat: true,
});

for (const entry of entries) {
  console.log({
    path: entry.fullpath(),
    isDirectory: entry.isDirectory(),
    modifiedAtMs: entry.mtimeMs,
  });
}
```

This is the right mode when you need `Dirent`-like behavior or file metadata while keeping the result type precise.

### Use sync and stream APIs when they fit better

The package ships separate sync and stream entry points with matching declarations.

```typescript
import { globStream, globSync } from "glob";

const configFiles = globSync("{src,test}/**/*.json", {
  nodir: true,
});

console.log(configFiles);

const stream = globStream("logs/**/*.log");
stream.on("data", match => {
  console.log(match);
});
```

Use `globSync()` for setup code and small directory walks. Use `globStream()` when you want incremental results instead of collecting the full match list first.

### Reuse caches with `Glob`

If you walk similar directory trees repeatedly, construct a `Glob` instance and reuse it.

```typescript
import { Glob } from "glob";

const shared = new Glob("src/**/*.ts", {
  ignore: "dist/**",
});

const sourceFiles = await shared.walk();

const tests = new Glob("test/**/*.ts", shared);
const testFiles = tests.walkSync();

console.log({ sourceFiles, testFiles });
```

The documented constructor pattern lets a later `Glob` reuse the earlier instance's settings and caches.

### Cancel a long-running walk

`GlobOptions` accepts an `AbortSignal`, so cancellation is typed at the call site.

```typescript
import { glob } from "glob";

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 100);

try {
  const matches = await glob("**/*.css", {
    signal: controller.signal,
  });

  console.log(matches);
} finally {
  clearTimeout(timer);
}
```

## CLI Boundary

The command-line tool comes from the `glob` runtime package, not from `@types/glob`.

Quote patterns so your shell does not expand them before `glob` receives them:

```bash
npx glob "src/**/*.ts" --ignore "dist/**" --ignore "node_modules/**"
```

If you intentionally want `glob` itself to treat every positional argument as a glob expression even when it already matches a file on disk, use `--all`:

```bash
npx glob --all "app/*.ts"
```

## Important Pitfalls

- Import from `glob`, not from `@types/glob`.
- `withFileTypes: true` changes the return type to `Path[]` and conflicts with `absolute`, `mark`, and `posix`.
- `ignore` patterns are always evaluated in dot mode, even if your main pattern does not set `dot: true`.
- `root` changes where absolute `/...` patterns start, but it does not sandbox traversal; patterns containing `..` can still walk outside that root.
- On Windows, only enable `windowsPathsNoEscape` when you explicitly want backslashes treated as path separators instead of escape characters.
