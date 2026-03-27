---
name: glob
description: "JavaScript guide for `glob`, covering async and sync filesystem matching, `cwd` and `ignore` usage, `Path` results, and Windows-specific pattern rules."
metadata:
  languages: "javascript"
  versions: "13.0.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "glob,javascript,node,filesystem,patterns"
---

# glob Guide for JavaScript

## Golden Rule

Install `glob`, not `node-glob`, write glob expressions with forward slashes, and choose the result shape you want up front:

- strings from `glob()`, `globSync()`, `globIterate()`, and `globStream()`
- `Path` objects from `withFileTypes: true`

`glob@13.0.6` is a Node.js filesystem utility. It does not use authentication, does not require a client object, and does not have package-specific environment variables. The package declares support for Node `18 || 20 || >=22`.

## Install

```bash
npm install glob@13.0.6
```

## Imports and Initialization

### ECMAScript modules

```js
import {
  Glob,
  escape,
  glob,
  globIterate,
  globSync,
  hasMagic,
} from 'glob';
```

### CommonJS

```js
const {
  Glob,
  escape,
  glob,
  globIterate,
  globSync,
  hasMagic,
} = require('glob');
```

There is no service client to initialize. Import the helpers you need and call them directly.

## Common Workflows

### Find matching files asynchronously

`glob()` resolves to an array of matches. For relative patterns, results are relative to `cwd` unless you set `absolute: true`.

```js
import { glob } from 'glob';

const files = await glob('src/**/*.js', {
  cwd: process.cwd(),
  ignore: ['**/node_modules/**', '**/dist/**'],
  nodir: true,
  absolute: true,
});

console.log(files);
```

### Match multiple patterns

Pass a string array when you want to search several patterns in one call.

```js
import { glob } from 'glob';

const assets = await glob([
  'public/**/*.{png,jpg,jpeg,svg}',
  'src/**/*.{png,jpg,jpeg,svg}',
], {
  cwd: process.cwd(),
  nodir: true,
});

console.log(assets);
```

### Stop a long walk with `AbortSignal`

```js
import { glob } from 'glob';

const styles = await glob('**/*.css', {
  cwd: process.cwd(),
  signal: AbortSignal.timeout(250),
});

console.log(styles);
```

### Iterate without building a full result array

Use `globIterate()` when you want to process matches as they are discovered.

```js
import { globIterate } from 'glob';

for await (const file of globIterate('logs/**/*.log', {
  cwd: process.cwd(),
  nodir: true,
})) {
  console.log(file);
}
```

Use `globSync()` for short scripts and startup work where blocking I/O is acceptable.

```js
import { globSync } from 'glob';

const configFiles = globSync('packages/*/package.json', {
  cwd: process.cwd(),
  nodir: true,
});

console.log(configFiles);
```

### Return rich `Path` objects

Set `withFileTypes: true` to get `Path` objects instead of strings. Add `stat: true` when you need fields such as `mtimeMs` or `mode`.

```js
import { glob } from 'glob';

const entries = await glob('packages/*', {
  cwd: process.cwd(),
  withFileTypes: true,
  stat: true,
});

for (const entry of entries) {
  console.log({
    name: entry.name,
    fullpath: entry.fullpath(),
    isDirectory: entry.isDirectory(),
    modifiedMs: entry.mtimeMs,
  });
}
```

Do not combine `withFileTypes: true` with `absolute: true`. If you need an absolute path from a `Path` result, call `entry.fullpath()`.

### Reuse caches across related searches

Construct a `Glob` instance when you need to search the same tree repeatedly. You can pass an existing `Glob` object as the options argument to reuse its settings and caches.

```js
import { Glob } from 'glob';

const base = new Glob('packages/*/src/**/*.ts', {
  cwd: process.cwd(),
  ignore: ['**/node_modules/**'],
  nodir: true,
});

const sourceFiles = await base.walk();
const testFiles = await new Glob('packages/*/test/**/*.ts', base).walk();

console.log({ sourceFiles, testFiles });
```

### Treat user input as a literal filename

Use `escape()` when a user-supplied string should match literally instead of being interpreted as a glob pattern. Use `hasMagic()` to decide whether a pattern contains glob metacharacters.

```js
import { escape, glob, hasMagic } from 'glob';

const input = process.argv[2];
const pattern = hasMagic(input) ? input : escape(input);

const matches = await glob(pattern, {
  cwd: process.cwd(),
  nodir: true,
});

console.log(matches);
```

Brace expansion is not treated as “magic” by `hasMagic()` unless you pass `magicalBraces: true`.

## Pattern Rules and Pitfalls

- Use `/` in glob expressions on every platform. In patterns, `\` is an escape character, not a path separator.
- If you must pass a Windows-style pattern built with `path.join()` or `path.resolve()`, set `windowsPathsNoEscape: true`. In that mode, literal glob metacharacters such as `*` and `?` cannot be escaped.
- Use the `ignore` option for exclusions. Leading `!pattern` negation and `#comment` handling were removed in v6.
- `ignore` patterns always run in `dot:true` mode. To exclude a directory and everything below it, use a pattern like `node_modules/**`.
- `matchBase: true` makes a pattern with no slash, such as `*.js`, behave like `**/*.js`.
- `nodir: true` removes directories from results. To match only directories, end the pattern with `/`.
- `root` only changes how absolute patterns beginning with `/` are resolved. It does not sandbox traversal, and a pattern containing `..` can still walk outside that root.
- `follow: true` makes `**` follow symlinked directories, which can introduce duplicates and slow traversal.

## Version Notes

### No bundled CLI in v13

As of `glob` v13, the CLI moved to a separate package:

```bash
npm install glob-bin
```

Use `glob` for library code and install `glob-bin` separately only when you need a command-line interface.

### Windows behavior

On Windows, always write glob expressions with forward slashes. For example, use `src/**/*.js`, not `src\**\*.js`.

If you set `posix: true` on Windows, returned string paths use `/` separators and absolute results are returned in UNC form such as `//?/C:/path/to/file`.
