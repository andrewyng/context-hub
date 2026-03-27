---
name: plugin-transform-modules-commonjs
description: "Babel plugin for rewriting ES module syntax to CommonJS with configurable interop, lazy imports, and strict-mode behavior"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,commonjs,modules,javascript,build"
---

`@babel/plugin-transform-modules-commonjs` rewrites `import` and `export` syntax into CommonJS output. Use it when your source is written as ES modules but your runtime, test environment, or published build still needs `require(...)` and `exports`.

No environment variables or runtime authentication are required. This is a build-time Babel plugin.

## Install

Install the plugin with `@babel/core`:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-modules-commonjs
```

If you want to run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli @babel/core @babel/plugin-transform-modules-commonjs
```

The package declares `@babel/core` as a peer dependency, so the plugin is not enough on its own.

## Add the plugin to Babel

Use a Babel config file when you want every transform to emit CommonJS:

```json
{
  "plugins": ["@babel/plugin-transform-modules-commonjs"]
}
```

Run the same transform from the CLI:

```bash
npx babel src --out-dir dist --plugins @babel/plugin-transform-modules-commonjs
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a script, codemod, test helper, or custom build step:

```javascript
import { transformSync } from "@babel/core";

const source = `
import answer, { double } from "./math.js";

export const result = double(answer);
`;

const output = transformSync(source, {
  filename: "src/example.js",
  plugins: ["@babel/plugin-transform-modules-commonjs"],
});

if (!output?.code) {
  throw new Error("Babel did not return transformed code");
}

console.log(output.code);
```

## Choose how default imports interoperate with CommonJS

The plugin accepts `importInterop` with three string modes:

- `"babel"` — default behavior unless `noInterop: true` is set
- `"node"` — Node-style interop
- `"none"` — no interop helper wrapping

Use a JSON config when a single mode works for the whole project:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        "importInterop": "node"
      }
    ]
  ]
}
```

Use a JavaScript config when you want to decide per import source:

```javascript
module.exports = {
  plugins: [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        importInterop(source, filename) {
          if (source.startsWith(".")) {
            return "none";
          }

          return "node";
        },
      },
    ],
  ],
};
```

If you maintain an older config that still uses `noInterop: true`, Babel resolves that the same way as `importInterop: "none"`.

## Lazy-load selected dependencies

Set `lazy` when you want generated `require(...)` calls to happen on first use instead of at module initialization time.

Lazy-load bare package imports:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        "lazy": true
      }
    ]
  ]
}
```

Lazy-load only specific packages:

```javascript
module.exports = {
  plugins: [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        lazy: ["chalk", "lodash"],
      },
    ],
  ],
};
```

Important details from the plugin implementation:

- `lazy: true` only lazy-loads non-relative imports such as `chalk`; relative imports such as `./utils.js` stay eager
- side-effect imports and `export * from ...` are not wrapped lazily
- `lazy` may be `true`, an array of module specifiers, or a function

## Control strict-mode output and top-level `this`

By default, the transform inserts `"use strict"` if the file does not already have it, and it rewrites top-level `this` to `undefined`.

Turn both behaviors off explicitly when you need legacy CommonJS semantics:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        "strictMode": false,
        "allowTopLevelThis": true
      }
    ]
  ]
}
```

Use this carefully: it changes emitted runtime behavior, not just formatting.

## Fail fast on accidental `module` or `exports` usage

ES module source that still refers to top-level CommonJS globals can be hard to spot during a migration. Set `allowCommonJSExports: false` to make those references throw instead of silently behaving like CommonJS code.

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        "allowCommonJSExports": false
      }
    ]
  ]
}
```

When this option is disabled, Babel guards top-level `module` and `exports` access in ES module files and points you toward `sourceType: "script"` or `sourceType: "unambiguous"` if the file should not be treated as a module.

## Advanced interop flags

Two less common namespace options are available when CommonJS default-vs-namespace behavior matters:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        "strictNamespace": true,
        "mjsStrictNamespace": true
      }
    ]
  ]
}
```

- `strictNamespace` applies stricter `.default` handling for non-`.mjs` files
- `mjsStrictNamespace` defaults to `strictNamespace` and lets you set different behavior for `.mjs` files

If you need to suppress Babel's generated `__esModule` marker, set `strict: true`:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        "strict": true
      }
    ]
  ]
}
```

## Important pitfalls

- Install `@babel/core` alongside the plugin; it is a peer dependency, not a bundled runtime
- Use `babel.config.js` or `babel.config.cjs` for function-valued options such as `importInterop(source, filename)` or `lazy(source)`
- `lazy: true` does not make relative imports lazy; it only affects bare package imports
- `strictMode: false` stops Babel from injecting `"use strict"`, and `allowTopLevelThis: true` stops Babel from rewriting top-level `this`
- `strict: true` suppresses the generated `__esModule` header, which can affect downstream consumers that rely on that marker

## Version-sensitive notes

- This guide targets `@babel/plugin-transform-modules-commonjs@7.28.6`
- The package declares `@babel/core` peer compatibility as `^7.0.0-0`
- The published package declares `node >= 6.9.0` in `engines`, but your effective support matrix still depends on the rest of your Babel toolchain
- In `7.28.6`, `allowCommonJSExports` defaults to `true`, `lazy` defaults to `false`, `strictNamespace` defaults to `false`, and `mjsStrictNamespace` defaults to `strictNamespace`
- If you already set Babel assumptions such as `constantReexports` or `enumerableModuleMeta`, those assumptions take precedence over this plugin's `loose` fallback

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-transform-modules-commonjs
- npm package page: https://www.npmjs.com/package/@babel/plugin-transform-modules-commonjs
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-transform-modules-commonjs
