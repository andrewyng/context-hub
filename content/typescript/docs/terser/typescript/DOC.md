---
name: terser
description: "TypeScript setup for Terser minification scripts and build pipelines. `@types/terser@3.12.0` is compile-time only; import and run `terser` itself."
metadata:
  languages: "typescript"
  versions: "3.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,terser,minify,build,source-maps,types,npm"
---

# Terser TypeScript Guide

## Golden Rule

`@types/terser` only provides TypeScript declarations. The runtime API and CLI come from `terser`.

In application code and build scripts, import from `"terser"`. Current `terser` releases publish their own declarations through `tools/terser.d.ts`, and the official README documents both `require("terser")` and `import { minify } from "terser"`.

## Install

Install the runtime package and your normal TypeScript toolchain:

```bash
npm install terser
npm install -D typescript
```

If your minification script runs in Node.js and uses built-in modules such as `node:fs` or `process.env`, add Node's declarations too:

```bash
npm install -D @types/node
```

If you are maintaining an older project that explicitly pins the DefinitelyTyped package, keep it as a dev dependency only:

```bash
npm install -D @types/terser
```

There are no required credentials, auth flows, or service-specific environment variables.

## TypeScript Setup

Use a normal Node-oriented `tsconfig.json` for build scripts and tooling:

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

If your project uses `compilerOptions.types`, include only ambient packages such as `node` there. Do not add `terser` to `types`; its declarations are module exports resolved from the runtime package import.

Import runtime functions and types from `terser` itself:

```typescript
import {
  minify,
  minify_sync,
  type MinifyOptions,
  type MinifyOutput,
} from "terser";
```

Do not import anything from `@types/terser` in application code.

## Initialization

There is no client object or one-time initialization step.

The practical setup boundary is the options object you pass to `minify()` or `minify_sync()`, plus your own file-system code for reading inputs and writing outputs.

Terser also documents one optional environment variable for debugging calls made by other tools:

```bash
export TERSER_DEBUG_DIR="/tmp/terser-debug"
```

When this variable is set, Terser writes debug logs containing the input code and options for each `minify()` call.

## Common Workflows

### Minify ES module input with typed options

`minify()` accepts a string, a string array, or a `{ [fileName]: code }` object and returns `Promise<MinifyOutput>`.

```typescript
import { writeFile } from "node:fs/promises";
import { minify, type MinifyOptions } from "terser";

const options: MinifyOptions = {
  module: true,
  compress: {
    passes: 2,
    drop_console: true,
  },
  mangle: true,
  format: {
    comments: false,
  },
  sourceMap: {
    filename: "dist/app.min.js",
    url: "app.min.js.map",
  },
};

const result = await minify(
  {
    "src/app.js": "export function add(first, second) { return first + second; }",
  },
  options,
);

if (!result.code) {
  throw new Error("Terser did not return output code");
}

await writeFile("dist/app.min.js", result.code, "utf8");

if (result.map) {
  const mapText = typeof result.map === "string"
    ? result.map
    : JSON.stringify(result.map);

  await writeFile("dist/app.min.js.map", mapText, "utf8");
}
```

Use `module: true` when the input is an ES module. The README notes that this implies strict mode and enables top-level mangling when compression or mangling is active.

### Reuse `MinifyOptions` in a helper

The runtime package exports the option interfaces, so you can centralize your Terser configuration without duplicating option shapes by hand.

```typescript
import { type MinifyOptions } from "terser";

export function makeTerserOptions(isProduction: boolean): MinifyOptions {
  return {
    module: true,
    compress: isProduction
      ? {
          passes: 2,
          drop_debugger: true,
        }
      : false,
    mangle: isProduction,
    format: {
      comments: false,
    },
  };
}
```

This keeps your build pipeline aligned with Terser's actual TypeScript surface, including nested options such as `compress`, `mangle`, `format`, and `sourceMap`.

### Persist `nameCache` across multiple minify runs

Terser documents `nameCache` as a read/write object. Reuse the same object across calls and persist it yourself if you want stable mangled names between runs.

```typescript
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { minify, type MinifyOptions } from "terser";

const cachePath = ".cache/terser-name-cache.json";
const nameCache: Record<string, unknown> = existsSync(cachePath)
  ? (JSON.parse(readFileSync(cachePath, "utf8")) as Record<string, unknown>)
  : {};

const options: MinifyOptions = {
  mangle: {
    properties: true,
  },
  nameCache,
};

const first = await minify({
  "part1.js": "function add(first, second) { return first + second; }",
}, options);

const second = await minify({
  "part2.js": "console.log(add(1 + 2, 3 + 4));",
}, options);

writeFileSync("dist/part1.min.js", first.code ?? "", "utf8");
writeFileSync("dist/part2.min.js", second.code ?? "", "utf8");
writeFileSync(cachePath, JSON.stringify(nameCache), "utf8");
```

Because the type of `nameCache` is just `object`, it is common to keep the local variable as `Record<string, unknown>` and pass that object through `MinifyOptions`.

### Use `minify_sync()` in a synchronous build script

The declarations export both `minify()` and `minify_sync()`.

```typescript
import { readFileSync, writeFileSync } from "node:fs";
import { minify_sync, type MinifyOptions } from "terser";

const input = readFileSync("dist/server.js", "utf8");

const options: MinifyOptions = {
  compress: true,
  mangle: true,
  sourceMap: true,
};

const result = minify_sync({ "dist/server.js": input }, options);

if (!result.code) {
  throw new Error("Terser did not return output code");
}

writeFileSync("dist/server.min.js", result.code, "utf8");

if (typeof result.map === "string") {
  writeFileSync("dist/server.min.js.map", result.map, "utf8");
}
```

Use the synchronous API only when your surrounding tool is already synchronous. For most Node build scripts, `await minify(...)` is easier to compose with file I/O.

### Run the CLI from a package script

The Terser CLI is part of the `terser` package, not `@types/terser`.

```json
{
  "scripts": {
    "build:minify": "terser dist/app.js -o dist/app.min.js -c -m --source-map"
  }
}
```

The README states that `--source-map --output output.js` writes the map to `output.js.map`. If you need an explicit source-map URL, use the documented option form:

```bash
npx terser dist/app.js \
  -o dist/app.min.js \
  -c -m \
  --source-map "url='app.min.js.map'"
```

## Important Pitfalls

- `minify()` is asynchronous and returns `Promise<MinifyOutput>`.
- `MinifyOutput.code` is optional in the type definitions, so check it before writing files.
- `sourceMap: true` or `sourceMap: { ... }` returns map data in `result.map`; it does not save the map for you.
- `nameCache` is mutated in place. Reuse the same object across calls if you want stable mangled names.
- `module: true` changes minification behavior for ES module input and enables top-level mangling when compression or mangling is enabled.
- `MinifyOptions.output` is marked deprecated in the declarations. Prefer `format`.
- Import from `terser`, not from `@types/terser`.

## Version-Sensitive Notes

- This guide targets the `@types/terser` package entry at version `3.12.0`.
- The practical runtime boundary is still the `terser` package: its package metadata exports both runtime entry points and `tools/terser.d.ts` for TypeScript consumers.
- The official README documents both CommonJS and ESM imports: `require("terser")` and `import { minify } from "terser"`.
- The exported declaration surface includes `minify`, `minify_sync`, `MinifyOptions`, `MinifyOutput`, `CompressOptions`, `MangleOptions`, `FormatOptions`, and `SourceMapOptions`.

## Official Sources

- https://www.npmjs.com/package/@types/terser
- https://www.npmjs.com/package/terser
- https://github.com/terser/terser/blob/master/README.md
- https://github.com/terser/terser/blob/master/tools/terser.d.ts
