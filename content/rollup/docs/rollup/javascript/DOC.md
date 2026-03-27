---
name: rollup
description: "JavaScript guide for installing Rollup 4, authoring a minimal config, using the CLI and JavaScript API, and handling watch mode and library externals."
metadata:
  languages: "javascript"
  versions: "4.59.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "rollup,bundler,build,javascript,cli,node-api"
---

# rollup for JavaScript

`rollup` is the core bundler package. It provides the `rollup` CLI, config helpers such as `defineConfig`, and the JavaScript API for one-off builds, in-memory generation, and watch mode.

There is no authentication step and no required package-specific environment variable.

## Prerequisites

- Node.js. Use a current Node LTS for modern ESM-based build tooling.
- `rollup@4.59.0`
- Optional plugins such as TypeScript, CommonJS, or Node resolution plugins when your project needs them

## Install

Install Rollup locally in the project that owns the build:

```bash
npm install --save-dev rollup
```

Rollup also supports a global install, but local project installs are easier to keep reproducible:

```bash
npm install --global rollup
```

## Minimal project setup

Add scripts in `package.json`:

```json
{
  "scripts": {
    "build": "rollup -c",
    "build:prod": "rollup -c --environment BUILD:production",
    "watch": "rollup -c --watch"
  }
}
```

Create `rollup.config.mjs`:

```javascript
import { defineConfig } from "rollup";

const isProduction = process.env.BUILD === "production";

export default defineConfig({
  input: "src/index.js",
  output: {
    file: "dist/bundle.js",
    format: "es",
    sourcemap: !isProduction,
  },
});
```

Create a matching entry file:

```javascript
// src/index.js
export function greet(name) {
  return `Hello, ${name}`;
}

console.log(greet("Rollup"));
```

Run the build:

```bash
npm run build
```

If you run `rollup -c` without a filename, Rollup looks for config files in this order: `rollup.config.mjs`, `rollup.config.cjs`, then `rollup.config.js`.

## Run from the CLI

For simple bundles, you can skip the config file and pass options directly:

```bash
npx rollup src/index.js --format es --file dist/bundle.js --sourcemap
```

Common output formats:

```bash
# CommonJS output for Node.js consumers
npx rollup src/index.js --format cjs --file dist/bundle.cjs

# Browser bundle that exposes a global name
npx rollup src/index.js --format iife --name MyBundle --file dist/bundle.iife.js

# UMD bundle for browsers and module loaders
npx rollup src/index.js --format umd --name MyBundle --file dist/bundle.umd.js
```

For config-driven builds, `--environment` sets variables on `process.env` inside the config file:

```bash
npx rollup -c --environment INCLUDE_DEPS,BUILD:production
```

With that command, `process.env.INCLUDE_DEPS === "true"` and `process.env.BUILD === "production"` inside `rollup.config.*`.

## Use the JavaScript API

Use `rollup(...)` when your app, dev server, or custom tool needs to control bundling directly.

```javascript
import { rollup } from "rollup";

const bundle = await rollup({
  input: "src/index.js",
});

try {
  await bundle.write({
    file: "dist/bundle.js",
    format: "es",
    sourcemap: true,
  });
} finally {
  await bundle.close();
}
```

`bundle.write(...)` writes files to disk. Use `bundle.generate(...)` when you need the generated chunks and assets in memory instead:

```javascript
import { rollup } from "rollup";

const bundle = await rollup({
  input: "src/index.js",
});

try {
  const { output } = await bundle.generate({
    format: "es",
    sourcemap: true,
  });

  for (const item of output) {
    if (item.type === "chunk") {
      console.log(item.fileName, item.code.length);
    } else {
      console.log(item.fileName, item.source);
    }
  }
} finally {
  await bundle.close();
}
```

## Watch builds from Node

Use `watch(...)` when another Node process should manage rebuilds.

```javascript
import { watch } from "rollup";

const watcher = watch({
  input: "src/index.js",
  output: {
    file: "dist/bundle.js",
    format: "es",
    sourcemap: true,
  },
  watch: {
    buildDelay: 200,
  },
});

watcher.on("event", async (event) => {
  switch (event.code) {
    case "START":
      console.log("starting build");
      break;
    case "BUNDLE_START":
      console.log("bundling", event.output);
      break;
    case "BUNDLE_END":
      console.log(`built in ${event.duration}ms`);
      break;
    case "ERROR":
      console.error(event.error);
      break;
    case "END":
      console.log("waiting for changes");
      break;
  }

  if ("result" in event && event.result) {
    await event.result.close();
  }
});

process.on("SIGINT", async () => {
  await watcher.close();
  process.exit(0);
});
```

The watcher emits `START`, `BUNDLE_START`, `BUNDLE_END`, `END`, and `ERROR` events.

## Common workflow: library build with externals

For libraries, mark peer dependencies or runtime-provided packages as external so they are not bundled.

```javascript
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/index.js",
  external: ["react"],
  output: {
    file: "dist/my-library.umd.js",
    format: "umd",
    name: "MyLibrary",
    globals: {
      react: "React",
    },
    sourcemap: true,
  },
});
```

For UMD and IIFE browser builds that expose exports, set `output.name` or pass `--name` on the CLI.

## Important pitfalls

- Use `output.file` for a single bundle and `output.dir` when Rollup needs to emit multiple chunks.
- Call `await bundle.close()` after JavaScript API builds so plugins and file handles can clean up.
- In watch mode, keep the watcher handle and call `await watcher.close()` during shutdown.
- When handling `BUNDLE_END` events programmatically, close `event.result` after you are done with it.
- When you pipe bundle output to stdout, only inline sourcemaps are supported.
- `--environment` affects the config file process, not application code unless you inject values into the bundle yourself.

## Version notes

- This guide targets `rollup@4.59.0`.
- The package exports `defineConfig`, `rollup`, and `watch` from `rollup`.
- The package also exports `rollup/loadConfigFile`, `rollup/getLogFilter`, and `rollup/parseAst` as subpaths for tooling integrations.
