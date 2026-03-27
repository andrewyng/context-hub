---
name: rimraf
description: "JavaScript guide for `rimraf`, covering named imports, Promise-based deletion, CLI usage, glob opt-in, filters, and safe removal defaults."
metadata:
  languages: "javascript"
  versions: "6.1.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "rimraf,javascript,node,filesystem,cli,deletion"
---

# rimraf Guide for JavaScript

## Golden Rule

Use named exports from `rimraf`, prefer the async API in application code, and opt in to globbing only when you actually want pattern matching.

`rimraf()` removes a path or an array of paths recursively and resolves to a boolean. `rimrafSync()` does the same work synchronously and returns a boolean directly.

There are no package-specific environment variables, credentials, or authentication steps.

## Install

```bash
npm install rimraf@6.1.3
```

`rimraf` is a Node.js package. You do not need to configure a client object before using it.

## Imports and Initialization

### ECMAScript modules

```js
import { rimraf, rimrafSync, native, manual } from 'rimraf';
```

### CommonJS

```js
const { rimraf, rimrafSync, native, manual } = require('rimraf');
```

Use named imports or named properties from `require()`. Do not rely on a default import.

## Common Workflows

### Remove build output asynchronously

Use the async API by default. It accepts a single path or an array of paths.

```js
import { rimraf } from 'rimraf';

const removed = await rimraf(['dist', 'coverage'], {
  preserveRoot: true,
});

if (!removed) {
  throw new Error('Some entries were kept by a filter.');
}
```

### Remove a literal directory synchronously

Use the sync API for short scripts or startup cleanup, not for the hot path of an app.

```js
import { rimrafSync } from 'rimraf';

const removed = rimrafSync('.cache', {
  preserveRoot: true,
});

console.log({ removed });
```

### Opt in to glob patterns

Globbing is not implicit. Set `glob: true` or pass a `glob` options object when you want pattern matching.

```js
import { rimraf } from 'rimraf';

await rimraf('packages/*/dist', {
  glob: true,
});
```

If you omit `glob`, the path is treated as a literal string.

### Keep selected files with a filter

`filter` lets you skip entries during deletion. When anything is kept, the return value can be `false` and parent directories may remain because they are no longer empty.

```js
import { rimraf } from 'rimraf';
import { basename } from 'node:path';

const removed = await rimraf('build', {
  filter: (entryPath) => basename(entryPath) !== '.gitkeep',
});

console.log({ removed });
```

### Cancel a long-running deletion

Pass an `AbortSignal` when you want to stop a large recursive delete.

```js
import { rimraf } from 'rimraf';

const controller = new AbortController();

setTimeout(() => controller.abort(), 250);

await rimraf('tmp/large-tree', {
  signal: controller.signal,
});
```

### Force a specific implementation

`rimraf()` chooses an implementation for you. If you need a specific strategy, call it explicitly.

```js
import { native, manual } from 'rimraf';

await native('dist');
await manual('dist');
```

Use `native()` when you specifically want Node's built-in `fs.rm()` behavior. Use `manual()` when you want the JavaScript implementation chosen for the current platform.

## CLI

The package also ships a CLI.

```bash
npx rimraf dist coverage
npx rimraf --glob 'packages/*/dist'
npx rimraf --impl=manual .cache
```

Useful flags:

- `--glob` or `--no-glob` to control pattern matching
- `--impl=rimraf|native|manual|posix|windows|move-remove` to choose the implementation
- `--preserve-root` or `--no-preserve-root` to control root-directory protection
- `--` to stop option parsing before path arguments

Example for a path that starts with `-`:

```bash
npx rimraf -- --tmp-output
```

## Important Pitfalls

### Use named exports

Current `rimraf` releases export functions directly. Prefer:

```js
import { rimraf } from 'rimraf';
```

not:

```js
import rimraf from 'rimraf';
```

### `glob` is opt-in

These two calls do different things:

```js
import { rimraf } from 'rimraf';

await rimraf('build/*', { glob: true });
await rimraf('build/*');
```

The first treats `build/*` as a pattern. The second treats it as a literal path string.

### `filter` changes both behavior and return value

If your filter keeps any entry, `rimraf()` can resolve to `false`. Parent directories that still contain preserved entries are not removed.

### `filter` and `signal` disable the native fast path

When you pass `filter` or `signal`, `rimraf` cannot use Node's built-in `fs.rm()` implementation for that call because `fs.rm()` does not support those features.

### Root deletion is protected by default

`preserveRoot` is enabled unless you explicitly set `preserveRoot: false` or pass `--no-preserve-root` in the CLI.

## Strategy Notes

If you need lower-level control, `rimraf` also exposes `posix()`, `windows()`, and `moveRemove()` alongside their sync variants.

`moveRemove()` is the slowest strategy and is intended as a reliable Windows fallback. If you set `tmp` for that workflow, it must be on the same physical device as the path being deleted.
