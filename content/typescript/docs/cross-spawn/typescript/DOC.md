---
name: cross-spawn
description: "TypeScript declarations for cross-spawn's drop-in spawn and spawnSync APIs"
metadata:
  languages: "typescript"
  versions: "6.0.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,cross-spawn,node,child-process,spawn,types"
---

# cross-spawn TypeScript Guide

`@types/cross-spawn` adds TypeScript declarations for the `cross-spawn` runtime package. Use it when your Node.js project imports `cross-spawn` and you want typed access to the same `spawn()` and `spawn.sync()` API shape described in the runtime package README.

`cross-spawn` is documented as a drop-in replacement for Node's `child_process.spawn()` and `child_process.spawnSync()` with cross-platform fixes for Windows command resolution, shebang handling, and related quoting issues.

This package only provides `.d.ts` files. It does not install the `cross-spawn` runtime.

## Install

Install the runtime package, the declaration package, and Node.js types together:

```bash
npm install cross-spawn
npm install --save-dev @types/cross-spawn @types/node typescript
```

There are no package-specific environment variables, authentication steps, or client initialization calls.

## TypeScript Setup

`cross-spawn` runs in Node.js and returns the same kinds of objects as the built-in `child_process` APIs, so `@types/node` is part of the practical setup.

A typical `tsconfig.json` for Node code looks like this:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

If your project restricts ambient type packages with `compilerOptions.types`, include at least `node` in that list:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

## Import `cross-spawn`

The runtime package exports a CommonJS function with extra properties attached to it. The safest configuration-independent import form in TypeScript is:

```ts
import spawn = require("cross-spawn");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, this default import style may also be convenient:

```ts
import spawn from "cross-spawn";
```

For Node child-process option and return types, import from `node:child_process`:

```ts
import spawn = require("cross-spawn");
import type {
  SpawnOptions,
  SpawnSyncOptionsWithStringEncoding,
} from "node:child_process";
```

## Spawn A Process

Use `spawn()` exactly as you would use Node's `child_process.spawn()`.

```ts
import spawn = require("cross-spawn");

const child = spawn("npm", ["run", "build"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    FORCE_COLOR: "1",
  },
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error("Failed to start command", error);
});

child.on("close", (code) => {
  if (code !== 0) {
    console.error(`Build exited with code ${code}`);
  }
});
```

This is the main integration boundary for the type package: the returned child process and the option objects follow Node's child-process typings, while `cross-spawn` handles the cross-platform command launching behavior.

## Use `spawn.sync()` For Blocking Commands

Use the `.sync()` property when you need a blocking call.

```ts
import spawn = require("cross-spawn");
import type { SpawnSyncOptionsWithStringEncoding } from "node:child_process";

const options: SpawnSyncOptionsWithStringEncoding = {
  cwd: process.cwd(),
  encoding: "utf8",
};

const result = spawn.sync("node", ["--version"], options);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  throw new Error(result.stderr || `Command failed with status ${result.status}`);
}

console.log(result.stdout.trim());
```

Using a string encoding keeps `stdout` and `stderr` typed as strings instead of raw buffers.

## Reuse Node Spawn Option Types

When you write helpers around `cross-spawn`, type the options with Node's built-in child-process types.

```ts
import spawn = require("cross-spawn");
import type { SpawnOptions } from "node:child_process";

export function run(command: string, args: string[], options: SpawnOptions = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    ...options,
  });
}
```

This keeps your wrapper aligned with the runtime contract documented for Node's `spawn()` API.

## Common Pitfalls

- Install `cross-spawn` as well as `@types/cross-spawn`; the type package does not include executable runtime code.
- Add `@types/node` in Node.js projects, because the process, options, and return types come from Node's child-process declarations.
- Prefer `import spawn = require("cross-spawn")` if you want an import form that does not depend on `esModuleInterop`.
- Treat `options.shell` carefully. The `cross-spawn` README states that when `shell` is used, its extra enhancements are disabled and behavior intentionally follows Node's shell spawning behavior.
- Keep Windows shebang expectations modest. The runtime README documents support for `#!/usr/bin/env <program>` shebangs, but not shebangs that include extra arguments.

## Official Sources

- https://www.npmjs.com/package/@types/cross-spawn
- https://www.npmjs.com/package/cross-spawn
- https://github.com/moxystudio/node-cross-spawn
- https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
- https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options
