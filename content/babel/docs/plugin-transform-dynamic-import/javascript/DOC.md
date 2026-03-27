---
name: plugin-transform-dynamic-import
description: "Babel plugin for rewriting import() expressions when compiling ES modules to CommonJS, AMD, or SystemJS"
metadata:
  languages: "javascript"
  versions: "7.27.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,dynamic-import,modules"
---

# @babel/plugin-transform-dynamic-import

`@babel/plugin-transform-dynamic-import` rewrites `import()` expressions during Babel builds. Use it only when Babel is also converting ES modules to `commonjs`, `amd`, or `systemjs`. It is a compile-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install Babel core, this plugin, and a companion module transform. CommonJS is the most common setup:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-dynamic-import @babel/plugin-transform-modules-commonjs
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json` and pair the plugin with a supported modules transform:

```json
{
  "plugins": [
    "@babel/plugin-transform-dynamic-import",
    "@babel/plugin-transform-modules-commonjs"
  ]
}
```

Supported companion module transforms are:

- `@babel/plugin-transform-modules-commonjs`
- `@babel/plugin-transform-modules-amd`
- `@babel/plugin-transform-modules-systemjs`

If you target AMD or SystemJS instead of CommonJS, swap the second plugin name.

## Use it from the CLI

Compile a source directory to CommonJS:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-dynamic-import,@babel/plugin-transform-modules-commonjs
```

Compile a single file:

```bash
npx babel src/load-widget.js --out-file lib/load-widget.js --plugins @babel/plugin-transform-dynamic-import,@babel/plugin-transform-modules-commonjs
```

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const source = `
export function loadWidget() {
  return import("./widget.js");
}
`;

const result = transformSync(source, {
  filename: "src/load-widget.js",
  configFile: false,
  babelrc: false,
  plugins: [
    "@babel/plugin-transform-dynamic-import",
    "@babel/plugin-transform-modules-commonjs",
  ],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

In a CommonJS build, the rewritten `import()` call has this shape:

```javascript
Promise.resolve().then(() => _interopRequireWildcard(require("./widget.js")));
```

That means the transformed code expects a CommonJS-style `require()` at runtime.

## Keep bundlers in charge when you want native `import()`

Do not use this plugin when your bundler should handle dynamic imports for code splitting. Babel's own error guidance for this plugin points bundler users to `@babel/plugin-syntax-dynamic-import` instead.

Use that parser-only plugin when you need Babel to accept `import()` syntax without rewriting it:

```bash
npm install --save-dev @babel/core @babel/plugin-syntax-dynamic-import
```

```json
{
  "plugins": ["@babel/plugin-syntax-dynamic-import"]
}
```

This is the safer setup for tools such as Webpack or Rollup when they are responsible for loading split chunks.

## Important notes

- This plugin throws unless Babel also enables `@babel/plugin-transform-modules-commonjs`, `@babel/plugin-transform-modules-amd`, or `@babel/plugin-transform-modules-systemjs`.
- Interop and module-output behavior come from the companion modules transform plugin. `@babel/plugin-transform-dynamic-import` only rewrites the `import()` expression itself.
- CommonJS output uses `Promise.resolve()` and `require()`. If your runtime target needs additional compatibility transforms or polyfills, add them separately.
- No environment variables are required.
