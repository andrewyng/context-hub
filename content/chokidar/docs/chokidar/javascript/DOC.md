---
name: chokidar
description: "chokidar JavaScript package guide for recursive file watching, ignore filters, polling, and stable write handling"
metadata:
  languages: "javascript"
  versions: "4.0.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "chokidar,javascript,nodejs,filesystem,file-watching"
---

# chokidar JavaScript Package Guide

## Golden Rule

Use `chokidar` to watch concrete files and directories, not glob patterns. In the current v4 line, watch a real root such as `src` or `uploads`, then narrow what you receive with `ignored`, `cwd`, `depth`, and event handlers.

## Install

```bash
npm install chokidar@4.0.3
```

`chokidar@4` requires Node `>=14.16.0` and publishes both ESM and CommonJS entry points.

```js
import chokidar from 'chokidar'
```

```js
const chokidar = require('chokidar')
```

## Setup And Configuration

`chokidar` is a local filesystem library. There is no auth flow, service endpoint, or required environment variable.

Optional environment variables from the maintainer docs:

- `CHOKIDAR_USEPOLLING=1` forces polling instead of `fs.watch`
- `CHOKIDAR_INTERVAL=250` changes the polling interval in milliseconds

Use those only when you need them. Polling is useful for some network filesystems and bind mounts, but it uses more CPU than the default watcher.

## Start A Watcher

```js
import chokidar from 'chokidar'

const watcher = chokidar.watch(['src', 'package.json'], {
  persistent: true,
  ignoreInitial: true,
  cwd: process.cwd(),
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
})

watcher
  .on('add', path => {
    console.log(`file added: ${path}`)
  })
  .on('change', path => {
    console.log(`file changed: ${path}`)
  })
  .on('unlink', path => {
    console.log(`file removed: ${path}`)
  })
  .on('addDir', path => {
    console.log(`directory added: ${path}`)
  })
  .on('unlinkDir', path => {
    console.log(`directory removed: ${path}`)
  })
  .on('error', error => {
    console.error('watch error', error)
  })
  .on('ready', () => {
    console.log('initial scan complete')
  })

process.on('SIGINT', async () => {
  await watcher.close()
  process.exit(0)
})
```

Key points:

- `ignoreInitial: true` skips the startup `add` and `addDir` events for files already present
- `cwd` makes emitted paths relative to that directory
- `ready` fires after the initial scan finishes
- `close()` is asynchronous, so `await` it before exiting or replacing the watcher

## Watch A Directory Without Globs

v4 removes glob support. Instead of watching `src/**/*.js`, watch `src` and filter what you do not want.

```js
import chokidar from 'chokidar'

const watcher = chokidar.watch('src', {
  ignoreInitial: true,
  depth: 3,
  ignored: (watchedPath, stats) => {
    if (watchedPath.includes('/node_modules/') || watchedPath.includes('\\node_modules\\')) {
      return true
    }

    if (watchedPath.endsWith('.map')) {
      return true
    }

    if (stats?.isFile() && !watchedPath.endsWith('.js')) {
      return true
    }

    return false
  },
})

watcher.on('all', (event, path) => {
  console.log(event, path)
})
```

`ignored` receives the full relative or absolute path. If you provide a two-argument function, chokidar may also pass `fs.Stats` for that path.

## Wait For Stable Writes

When an editor or upload process writes a file in chunks, `add` and `change` can happen before the final bytes are on disk. Use `awaitWriteFinish` when your code must read the finished file.

```js
import chokidar from 'chokidar'

const watcher = chokidar.watch('uploads', {
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 5000,
    pollInterval: 250,
  },
})

watcher.on('add', async path => {
  console.log(`safe to process ${path}`)
})
```

This delays events until file size stays unchanged for the configured threshold. Use it carefully because it makes detection less responsive.

## Handle Atomic Writes

Some editors write by replacing a file instead of modifying it in place. `atomic` helps collapse a fast delete-and-recreate sequence into a single `change` event.

```js
import chokidar from 'chokidar'

const watcher = chokidar.watch('src', {
  ignoreInitial: true,
  atomic: 200,
})
```

Set `atomic` to a custom millisecond value when the default delay is too short for your editor or filesystem.

## Use Polling For Network Or Virtualized Filesystems

If file events are unreliable over a network share, Docker bind mount, or another non-standard filesystem, switch to polling.

```bash
CHOKIDAR_USEPOLLING=1 CHOKIDAR_INTERVAL=250 node scripts/watch.js
```

You can also set the same behavior in code:

```js
import chokidar from 'chokidar'

const watcher = chokidar.watch('shared', {
  usePolling: true,
  interval: 250,
  binaryInterval: 300,
})
```

Prefer the default non-polling mode when it works. Polling increases CPU usage.

## Read Stats And Inspect Watched Paths

```js
import chokidar from 'chokidar'

const watcher = chokidar.watch('src', {
  ignoreInitial: true,
  alwaysStat: true,
})

watcher.on('change', (path, stats) => {
  if (stats) {
    console.log(`${path} is now ${stats.size} bytes`)
  }
})

console.log(watcher.getWatched())
```

`alwaysStat: true` asks chokidar to provide `fs.Stats` for `add`, `addDir`, and `change` events even when the underlying watcher would not normally include them.

## Add And Remove Paths Dynamically

```js
import chokidar from 'chokidar'

const watcher = chokidar.watch('src', {
  ignoreInitial: true,
})

watcher.add(['templates', 'config/local.json'])

await watcher.unwatch('config/local.json')

console.log(watcher.getWatched())

await watcher.close()
```

Use `add()` to expand an existing watcher without creating a second `FSWatcher` instance.

## Events And Methods You Will Use Most

Common events:

- `add`
- `addDir`
- `change`
- `unlink`
- `unlinkDir`
- `ready`
- `error`
- `all`

Important methods:

- `chokidar.watch(paths, options)` creates an `FSWatcher`
- `watcher.add(paths)` adds new files or directories to an existing watcher
- `watcher.unwatch(paths)` stops watching specific paths
- `watcher.getWatched()` returns the current directory-to-entries map
- `await watcher.close()` shuts the watcher down cleanly

`raw` is also available, but the maintainer docs describe it as internal. Use the normalized events above for app logic unless you specifically need low-level watcher details.

## Common Pitfalls

- Do not pass glob patterns such as `src/**/*.js` to v4. Watch concrete roots instead.
- Do not forget to `await watcher.close()`. Closing is asynchronous.
- Do not watch your whole repository unless you need to. Chokidar watches recursively, so broad roots can consume a lot of system resources.
- Use `depth` to cap recursion when you only care about a few nested levels.
- Use `awaitWriteFinish` only when you need fully written files. It trades latency for correctness.
- Use `usePolling` only when native file events are unreliable. It trades CPU for reliability.

On Linux, `ENOSPC` usually means the inotify watch limit is too low. The maintainer README suggests increasing it with:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
