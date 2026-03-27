---
name: tslib
description: "Runtime helper library that TypeScript imports for emitted helpers such as __assign, __extends, __awaiter, and decorator support"
metadata:
  languages: "typescript"
  versions: "2.8.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,tslib,compiler,helpers,tsconfig,runtime"
---

# tslib TypeScript Guide

`tslib` is the runtime package that contains the helper functions TypeScript emits for transformed code, including helpers such as `__assign`, `__extends`, `__awaiter`, `__decorate`, and related module interop helpers.

Use `tslib` when you enable `importHelpers` so TypeScript imports shared helpers from the package instead of inlining the same helper implementation into every compiled file.

`tslib` is not a replacement for the TypeScript compiler. Install `typescript` separately, and keep `tslib` available at runtime anywhere your compiled JavaScript imports it.

No environment variables, authentication, or client initialization are required.

## Install

Install `tslib` as a runtime dependency and `typescript` as a development dependency:

```bash
npm install tslib
npm install --save-dev typescript
```

This guide targets `tslib 2.8.1`. The upstream `tslib` README says:

- use the current `tslib` line for TypeScript `3.9.2` or later
- use `tslib@^1` for TypeScript `3.8.4` or earlier
- use `tslib@1.6.1` for TypeScript `2.3.2` or earlier

If your application or published library runs compiled JavaScript that imports `tslib`, do not move `tslib` to `devDependencies`.

## Configure TypeScript To Import Helpers

Turn on `importHelpers` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "importHelpers": true,
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

TypeScript documents `importHelpers` as: "Allow importing helper functions from tslib once per project, instead of including them per-file."

Compile normally:

```bash
./node_modules/.bin/tsc -p tsconfig.json
```

You usually do not import `tslib` yourself in application code. The compiler inserts the helper imports in emitted JavaScript when your source code and compiler target require them.

## What Changes In The Emitted JavaScript

The `tslib` README shows the core behavior of `importHelpers`.

Given TypeScript source like this:

```ts
export const x = {};
export const y = { ...x };
```

TypeScript can emit helper code inline in every file, or, with `importHelpers`, emit an import from `tslib` instead. A representative CommonJS output looks like this:

```js
var tslib_1 = require("tslib");
exports.x = {};
exports.y = tslib_1.__assign({}, exports.x);
```

Which helpers appear depends on the language features in your source and the compiler options you use. Typical helpers include object spread, class inheritance, async/await downleveling, decorator support, and CommonJS/ES module interop helpers.

## Common Workflows

### Publish compiled JavaScript that depends on `tslib`

If you publish a library that compiles TypeScript to JavaScript with `importHelpers`, keep `tslib` in `dependencies` so consumers get the runtime helper package automatically.

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "tslib": "^2.8.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

This is the most important runtime boundary for `tslib`: the compiler emits the import, but Node.js, your bundler, or your browser build still has to resolve the `tslib` package at runtime.

### Import a helper directly when you really need one

Most projects should let TypeScript emit helper imports automatically. If you are writing generated code, runtime glue, or another tool that wants the helpers directly, import them from the package root:

```ts
import { __assign } from "tslib";

const defaults = { region: "us-east-1", retries: 2 };
const overrides = { retries: 5 };

export const config = __assign({}, defaults, overrides);
```

`tslib 2.8.1` publishes its type declarations from the package itself, so no separate `@types` package is needed.

### Use the package root, not internal files

`tslib 2.8.1` publishes conditional exports for CommonJS, ESM, and type declarations. Import from `"tslib"`, not from internal paths such as `tslib/tslib.js` or `tslib/modules/index.js`.

```ts
import { __awaiter, __generator } from "tslib";
```

Using the package root lets Node.js, bundlers, and TypeScript resolve the correct entrypoint from the package `exports` map.

## Important Pitfalls

- `importHelpers: true` does not install `tslib` for you. If the package is missing, emitted JavaScript can fail with a module resolution error for `tslib`.
- `tslib` is a runtime package. Keep it in `dependencies` when built output imports it.
- `tslib` does not replace `typescript`; you still need the compiler in your toolchain.
- `noEmitHelpers` is a different compiler option. TypeScript describes it as disabling generated helpers like `__extends` in emitted output, so do not turn it on unless your runtime or build pipeline is supplying those helpers another way.
- Manual helper imports are an advanced case. In normal application code, let the compiler decide which helpers to emit.
- The upstream README documents older compatibility lines. If you are pinned to TypeScript `3.8.4` or earlier, use the older `tslib` version it recommends instead of `2.8.1`.

## Official Sources

- https://www.npmjs.com/package/tslib
- https://github.com/microsoft/tslib
- https://github.com/microsoft/tslib/blob/main/README.md
- https://www.typescriptlang.org/tsconfig/importHelpers.html
- https://www.typescriptlang.org/tsconfig/noEmitHelpers.html
- https://www.typescriptlang.org/docs/
