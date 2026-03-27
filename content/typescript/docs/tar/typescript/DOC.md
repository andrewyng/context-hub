---
name: tar
description: "TypeScript guide for the `tar` package: install the Node runtime package, import its exported types from `tar`, and use typed archive create, extract, and list workflows correctly."
metadata:
  languages: "typescript"
  versions: "7.0.87"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,tar,node,archive,filesystem,types,npm"
---

# tar TypeScript Guide

## Golden Rule

Use the runtime package `tar` in your code and import values and types from `"tar"`.

The current `tar` 7.x package publishes TypeScript declaration files in its export map for both `import` and `require` entry points. In practice, your TypeScript boundary is the runtime package: `create`, `extract`, `list`, `update`, `replace`, `ReadEntry`, and the exported `TarOptionsWithAliases*` types all come from `"tar"`.

Do not import anything from `@types/tar` in application source files.

## Install

`tar` is a Node.js package. The published runtime package declares `node: >=18`.

```bash
npm install tar
npm install -D typescript @types/node
```

If your dependency graph already includes `@types/tar`, keep `tar` installed as the runtime dependency your app actually executes.

## Initialization

There are no environment variables, credentials, or client objects to configure.

The practical setup is your TypeScript compiler configuration and the way you import from `tar`.

### Recommended `tsconfig.json`

`tar` uses Node built-in modules and a conditional export map. A Node-oriented compiler configuration keeps module resolution predictable:

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

If your project does not restrict `compilerOptions.types`, you can omit the `types` field entirely.

### Import values and types from `tar`

Use named imports from the runtime package:

```typescript
import {
  create,
  extract,
  list,
  update,
  type ReadEntry,
  type TarOptionsWithAliasesAsyncFile,
} from "tar";
```

## Common Workflows

### Create a gzipped archive file

Use `create()` with a `file` option when you want a `Promise<void>` that resolves after the archive is written.

```typescript
import {
  create,
  type TarOptionsWithAliasesAsyncFile,
} from "tar";

const archiveOptions: TarOptionsWithAliasesAsyncFile = {
  cwd: "dist",
  file: "artifacts/app.tar.gz",
  gzip: true,
  portable: true,
};

await create(archiveOptions, ["server.js", "package.json", "public"]);
```

`portable: true` omits system-specific metadata and is useful when you want archives that are less dependent on the machine that created them.

### Extract into a target directory

Use `extract()` with `cwd` and `strip` to control where files land, and `filter` to skip entries you do not want to write.

```typescript
import { extract } from "tar";

await extract({
  file: "artifacts/app.tar.gz",
  cwd: "vendor/app",
  strip: 1,
  filter: (path, entry) => {
    return !path.startsWith("node_modules/") && entry.type !== "SymbolicLink";
  },
});
```

### List entries and capture typed metadata

`onReadEntry` receives `ReadEntry` objects, so you can safely work with `path`, `size`, `type`, and other entry metadata.

```typescript
import { list, type ReadEntry } from "tar";

const entries: Array<Pick<ReadEntry, "path" | "size" | "type">> = [];

await list({
  file: "artifacts/app.tar.gz",
  onReadEntry(entry) {
    entries.push({
      path: entry.path,
      size: entry.size,
      type: entry.type,
    });
  },
});

console.log(entries);
```

### Update an existing archive only when files are newer

Use `update()` when the archive already exists and you only want to append changed files.

```typescript
import { update } from "tar";

await update(
  {
    file: "artifacts/app.tar",
    cwd: "dist",
  },
  ["package.json", "templates"],
);
```

### Pipe a tarball stream into the extractor

Without a `file` option, `extract()` returns a writable `Unpack` stream.

```typescript
import { createReadStream } from "node:fs";
import { extract } from "tar";

createReadStream("downloads/package.tgz").pipe(
  extract({
    cwd: "tmp/package",
    strip: 1,
  }),
);
```

## Important Pitfalls

- Import from `tar`, not from `@types/tar`.
- `file` changes the return type. Async calls with `file` return `Promise<void>`, while calls without `file` return streams.
- `update()` and `replace()` only work on existing archive files and require the `file` option.
- Leave `preservePaths` off for untrusted archives. The maintainer docs explicitly warn that it is almost always unsafe on untrusted input.
- `noResume: true` on listing or parsing means you must consume or resume entry streams yourself, or the operation will not finish.
- `noMtime: true` disables `mtime`-based behaviors such as `update()` and extraction with `newer`.
