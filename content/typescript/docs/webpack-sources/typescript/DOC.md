---
name: webpack-sources
description: "TypeScript declarations for webpack-sources Source objects, source maps, code replacement, and build-time asset composition."
metadata:
  languages: "typescript"
  versions: "3.2.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,webpack,webpack-sources,source-map,build-tools,types,definitelytyped"
---

# webpack-sources TypeScript Guide

## Golden Rule

Install `@types/webpack-sources` for compile-time declarations only, and import the runtime APIs from `webpack-sources`.

The runtime package exposes the classes you actually use in build tooling: `Source`, `RawSource`, `OriginalSource`, `SourceMapSource`, `CachedSource`, `ConcatSource`, `ReplaceSource`, `PrefixSource`, and `CompatSource`. The declaration package supplies the TypeScript shapes for those exports.

## Install

`webpack-sources` is a Node-oriented build-time library. Its type declarations reference `Buffer`, so most TypeScript projects should also keep Node types available.

```bash
npm install webpack-sources
npm install -D typescript @types/webpack-sources @types/node
```

If TypeScript and Node types are already installed, add only the missing declaration package:

```bash
npm install -D @types/webpack-sources
```

No environment variables, credentials, or client initialization are required.

## Initialization

The main setup is your TypeScript compiler configuration and your import style.

### Recommended `tsconfig.json`

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

If your project restricts ambient packages with `compilerOptions.types`, include `node` so the `Buffer` references used by `webpack-sources` stay available:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Import from `webpack-sources`

The declarations use `export =`, so the most portable TypeScript import form is:

```typescript
import webpackSources = require("webpack-sources");
```

Use the runtime package name in imports, never `@types/webpack-sources`.

## Common Workflows

### Create generated assets with `RawSource`, `OriginalSource`, and `ConcatSource`

Use `RawSource` for generated content that has no source map, `OriginalSource` when the content maps back to a real file name, and `ConcatSource` when you need to assemble a final asset from multiple pieces.

```typescript
import webpackSources = require("webpack-sources");

const asset = new webpackSources.ConcatSource(
  new webpackSources.RawSource("/* generated during build */\n"),
  new webpackSources.OriginalSource(
    "export const answer = 42;\n",
    "src/answer.ts",
  ),
);

const { source, map } = asset.sourceAndMap({ columns: true });
const text = typeof source === "string" ? source : source.toString("utf8");

console.log(text);
console.log(map);
```

If you need both the emitted content and its source map, prefer `sourceAndMap()` over separate `source()` and `map()` calls.

### Wrap generated code with an existing source map

Use `SourceMapSource` when you already have generated output plus a source map and want to keep that mapping information typed.

```typescript
import webpackSources = require("webpack-sources");

const generatedCode = "const answer = 42;\n";
const originalCode = "export const answer = 42;\n";

const sourceMap: webpackSources.RawSourceMap = {
  version: 3,
  file: "dist/answer.js",
  sources: ["src/answer.ts"],
  names: [],
  sourcesContent: [originalCode],
  mappings: "AAAA",
};

const asset = new webpackSources.SourceMapSource(
  generatedCode,
  "src/answer.ts",
  sourceMap,
  originalCode,
);

const result = asset.sourceAndMap({ columns: true });

console.log(result.map?.sources);
```

The `name` argument is the original file name that should appear in the mapping data.

### Patch source text with `ReplaceSource`

`ReplaceSource` is the main editing API when a plugin or loader needs to replace or insert text while preserving source-map-aware behavior.

```typescript
import webpackSources = require("webpack-sources");

const code = "export const answer = 41;\n";
const original = new webpackSources.OriginalSource(code, "src/answer.ts");
const patched = new webpackSources.ReplaceSource(original, "src/answer.ts");

const start = code.indexOf("41");
const end = start + "41".length - 1;

patched.replace(start, end, "42");
patched.insert(0, "// rewritten by a build step\n");

const output = patched.source();
console.log(typeof output === "string" ? output : output.toString("utf8"));
```

Replacement and insertion positions are based on the original source, not on text that earlier edits already changed.

### Reuse expensive results with `CachedSource`

Every `Source` method can require computation. Wrap expensive sources in `CachedSource` when you will ask for `source()`, `map()`, `size()`, or `sourceAndMap()` more than once.

```typescript
import webpackSources = require("webpack-sources");

const original = new webpackSources.OriginalSource(
  "export const answer = 42;\n",
  "src/answer.ts",
);

const cached = new webpackSources.CachedSource(original);

const firstRead = cached.sourceAndMap({ columns: false });
const secondRead = cached.sourceAndMap({ columns: false });
const snapshot = cached.getCachedData();

console.log(firstRead.map);
console.log(secondRead.map);
console.log(snapshot.size);
```

`CachedSource` caches `map`, `source`, `buffer`, `size`, and `sourceAndMap` results in memory. `updateHash()` is not cached.

## Important Pitfalls

- Import from `webpack-sources`, not from `@types/webpack-sources`.
- `Source.source()` returns `string | Buffer`; handle both when your code may process text and binary assets.
- `ReplaceSource.replace(start, end, value)` uses zero-based indexes and an inclusive `end` position.
- `Source` methods can be expensive; prefer `sourceAndMap()` when you need both outputs and use `CachedSource` for repeated reads.
- If `compilerOptions.types` is set, include `node` so the package's `Buffer` references resolve correctly.
- Official `webpack-sources@2.3.1` publishes only `lib/`, while official `webpack-sources@3.3.3` publishes both a `types` field and `types.d.ts`. If your installed runtime already ships declarations, do not keep a second copy of `@types/webpack-sources` unless you intentionally need the external package.

## Official Sources

- https://www.npmjs.com/package/@types/webpack-sources
- https://www.npmjs.com/package/webpack-sources
- https://github.com/webpack/webpack-sources#readme
- https://github.com/webpack/webpack-sources/blob/main/types.d.ts
