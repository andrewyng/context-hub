---
name: resolve
description: "resolve package guide for Node-style module resolution from a chosen base directory"
metadata:
  languages: "javascript"
  versions: "1.22.11"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "resolve,module-resolution,nodejs,require,cli"
---

# resolve JavaScript Guide

## Golden Rule

Use `resolve` when you need Node's `require.resolve()` algorithm, but you need to run it on behalf of another file or directory. The package exposes an async API, a sync API, and a small CLI.

`resolve` has no environment variables, no credentials, and no client initialization step. The only required setup is installing the package and passing an existing `basedir`.

## Install

```bash
npm install resolve
```

Use the entry point that matches your workflow:

```javascript
const resolve = require('resolve');
const resolveAsync = require('resolve/async');
const resolveSync = require('resolve/sync');

const alsoSync = require('resolve').sync;
```

`require('resolve')` is the async API.

## Resolve A Package From Another Directory

Async resolution returns `cb(err, resolvedPath, pkg)`.

```javascript
const path = require('path');
const resolve = require('resolve');

function resolveFrom(importerFile, specifier, callback) {
  resolve(specifier, { basedir: path.dirname(importerFile) }, callback);
}

resolveFrom('/workspace/src/index.js', 'resolve', (err, resolvedPath, pkg) => {
  if (err) throw err;

  console.log(resolvedPath);
  console.log(pkg && pkg.name);
});
```

Pass a directory, not a file path, as `basedir`. If `basedir` does not exist or is not a directory, `resolve` reports `INVALID_BASEDIR`.

## Resolve Synchronously

`resolve.sync()` returns the resolved path or throws.

```javascript
const resolveSync = require('resolve/sync');

try {
  const resolvedPath = resolveSync('resolve', { basedir: __dirname });
  console.log(resolvedPath);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('Dependency not found');
  } else {
    throw err;
  }
}
```

## Common Options

### Add File Extensions

By default, `resolve` checks `['.js']`. Add extensions explicitly when your project resolves other file types.

```javascript
const resolve = require('resolve');

resolve('./config', {
  basedir: __dirname,
  extensions: ['.js', '.json']
}, (err, resolvedPath) => {
  if (err) throw err;
  console.log(resolvedPath);
});
```

### Treat Core Modules As External

With the default `includeCoreModules: true`, core modules like `fs` resolve to the module id itself.

```javascript
const resolveSync = require('resolve/sync');

console.log(resolveSync('fs', { basedir: __dirname }));
// => 'fs'
```

Set `includeCoreModules: false` when you want file-only resolution behavior.

```javascript
const resolveSync = require('resolve/sync');

try {
  resolveSync('fs', {
    basedir: __dirname,
    includeCoreModules: false
  });
} catch (err) {
  console.error(err.code);
}
```

### Search Custom Module Directories

`moduleDirectory` defaults to `node_modules`, but it can be a string or an array.

```javascript
const resolve = require('resolve');

resolve('aaa', {
  basedir: __dirname,
  moduleDirectory: ['xmodules', 'node_modules']
}, (err, resolvedPath) => {
  if (err) throw err;
  console.log(resolvedPath);
});
```

### Rewrite `package.json` Before Resolution

Use `packageFilter` when you need to override the parsed `package.json` before `resolve` reads its `main` field.

```javascript
const resolve = require('resolve');

resolve('./baz', {
  basedir: __dirname,
  packageFilter(pkg) {
    pkg.main = 'server';
    return pkg;
  }
}, (err, resolvedPath) => {
  if (err) throw err;
  console.log(resolvedPath);
});
```

In `1.x`, the async `packageFilter` receives `(pkg, pkgfile, dir)`. The sync API differs: in `1.x`, `resolve.sync()` passes `(pkg, dir)`, and the maintainer README notes that this argument shape changes in `v2`.

### Rewrite Deep Package Paths

Use `pathFilter` to map a subpath inside a package to a different relative file.

```javascript
const resolve = require('resolve');

resolve('deep/ref', {
  basedir: __dirname,
  pathFilter(pkg, fullPath, relativePath) {
    if (relativePath === 'ref') {
      return 'alt';
    }
  }
}, (err, resolvedPath) => {
  if (err) throw err;
  console.log(resolvedPath);
});
```

Return a path relative to the package root. Do not return an absolute path from `pathFilter`.

## CLI

The package publishes a `resolve` executable.

Resolve from the current working directory:

```bash
npx resolve resolve
```

Preserve symlink paths explicitly:

```bash
npx resolve --preserve-symlinks resolve
```

The CLI accepts a single specifier and resolves it relative to `process.cwd()`.

## Errors And Pitfalls

- `MODULE_NOT_FOUND` means the specifier could not be resolved from the supplied base directory.
- `INVALID_BASEDIR` means `opts.basedir` is missing, does not exist, or is not a directory.
- `INVALID_PACKAGE_MAIN` means `resolve` found a `package.json` with a non-string `main` field.
- `preserveSymlinks` defaults to `true` in `1.22.11`, even though the maintainer README says Node's default resolution behavior does not preserve symlinks. In monorepos or symlinked workspaces, set `preserveSymlinks: false` when you want behavior closer to normal Node resolution.
- `paths` and `packageIterator` exist for advanced custom lookup flows, but most application code should prefer `basedir`, `extensions`, `moduleDirectory`, `packageFilter`, and `pathFilter`.

## Practical Defaults

Use this shape for most tool integrations:

```javascript
const resolve = require('resolve');

resolve('some-package', {
  basedir: __dirname,
  extensions: ['.js', '.json'],
  includeCoreModules: true,
  preserveSymlinks: false
}, (err, resolvedPath) => {
  if (err) throw err;
  console.log(resolvedPath);
});
```

Use `resolve.sync()` only when your code path must stay synchronous, such as inside a config loader or a synchronous build step.
