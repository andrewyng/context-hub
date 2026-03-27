---
name: mkdirp
description: "Use `mkdirp` to create nested directories from JavaScript or the CLI, with promise and sync APIs, mode options, and implementation-selection notes."
metadata:
  languages: "javascript"
  versions: "3.0.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "mkdirp,node,filesystem,directories,cli,javascript,npm"
---

# mkdirp JavaScript Guide

`mkdirp` creates a directory and any missing parent directories, similar to `mkdir -p`.

It works in both ESM and CommonJS projects, ships async and sync APIs, and includes a CLI. There are no credentials, network settings, or package-specific initialization steps.

## Install

Library usage:

```bash
npm install mkdirp
```

CLI usage without a local install:

```bash
npx mkdirp --help
```

`mkdirp@3.0.1` declares `node >=10` in `package.json`. The package uses Node's native recursive `fs.mkdir()` path on Node `10.12.0+` when possible.

## Import And Basic Usage

ESM:

```js
import { mkdirp } from 'mkdirp'
```

CommonJS:

```js
const { mkdirp } = require('mkdirp')
```

Create an application data directory before writing a file:

```js
import { mkdirp } from 'mkdirp'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const appDataDir = process.env.APP_DATA_DIR ?? './var/app-data'

await mkdirp(appDataDir)

await writeFile(
  join(appDataDir, 'settings.json'),
  JSON.stringify({ theme: 'dark' }, null, 2),
  'utf8'
)
```

`mkdirp()` resolves to the first directory it actually created, or `undefined` when the full path already exists.

## Common Workflows

### Create a nested directory and inspect what was created

```js
import { mkdirp } from 'mkdirp'

const made = await mkdirp('./var/cache/images')

if (made) {
  console.log(`created starting at ${made}`)
} else {
  console.log('directory tree already existed')
}
```

The returned `made` value is the first directory that did not already exist.

### Create directories synchronously during startup

Use the sync API when later startup work must not begin until the directory exists.

```js
import { mkdirp } from 'mkdirp'
import { createWriteStream } from 'node:fs'
import { join } from 'node:path'

const logDir = process.env.LOG_DIR ?? './var/log'

mkdirp.sync(logDir)

const stream = createWriteStream(join(logDir, 'app.log'), { flags: 'a' })
stream.write('server started\n')
stream.end()
```

### Set a directory mode

Pass either an options object, a number, or an octal string.

```js
import { mkdirp } from 'mkdirp'

await mkdirp('./var/shared/uploads', { mode: 0o775 })
await mkdirp('./var/private/cache', 0o700)
await mkdirp('./var/releases', '755')
```

If you omit `mode`, `mkdirp` uses `0o777` and lets the operating system apply the process umask.

### Force the native or manual implementation

The default `mkdirp()` entry point selects an implementation for you. Use an explicit variant only when you need to control that choice.

```js
import { mkdirp } from 'mkdirp'

await mkdirp.native('./var/native-cache')
await mkdirp.manual('./var/manual-cache')
```

At `3.0.1`, the package uses the native recursive implementation on Node `10.12.0+` unless you override the filesystem methods through options.

### Use a custom `fs` implementation

You can swap in another filesystem implementation, or override just the methods that `mkdirp` uses.

```js
import { mkdirp } from 'mkdirp'
import { mkdir, stat } from 'node:fs'

await mkdirp('./sandbox/output', {
  fs: {
    mkdir,
    stat,
  },
})
```

For async usage, the package expects `mkdir(path, opts, cb)` and `stat(path, cb)`. For sync usage, provide `mkdirSync(path, opts)` and `statSync(path)`.

## CLI

The package ships a `mkdirp` command.

Create one or more directories:

```bash
npx mkdirp ./var/cache ./var/log
```

Print the first created path for each argument and set a mode:

```bash
npx mkdirp --print --mode=755 ./var/cache ./var/log
```

Force the manual implementation:

```bash
npx mkdirp --manual ./var/cache
```

Available flags from the packaged CLI are:

- `-m<mode>` or `--mode=<mode>`
- `-p` or `--print`
- `--manual`
- `-v` or `--version`
- `-h` or `--help`

## Important Pitfalls

- `mkdirp()` returns the first directory created, not always the final target path.
- The package resolves input paths before creating directories, so relative input paths produce absolute resolved return values.
- Recursive creation is not atomic. If a call fails partway through, some parent directories may already exist.
- Root-directory behavior differs by platform. On Windows, attempting to create a drive root or UNC root can fail with `EPERM` or `ENOENT`; on POSIX, recursive creation of `/` is treated as already existing.
- The package retries with its manual implementation when the native recursive path hits `ENOENT`, because Node's native error reporting can be misleading in some cases.
- If you override filesystem methods, provide the async or sync methods that match the API you are calling.

## Version Notes For `3.0.1`

- The package is a hybrid module: the maintainer README shows both `import { mkdirp } from 'mkdirp'` and `const { mkdirp } = require('mkdirp')`.
- `3.0.1` publishes declaration files and `exports` metadata from the runtime package itself.
- The package still includes the `mkdirp` CLI in this release.
