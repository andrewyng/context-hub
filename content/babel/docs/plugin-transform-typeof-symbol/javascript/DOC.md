---
name: plugin-transform-typeof-symbol
description: "Babel plugin for rewriting typeof expressions so Symbol values keep native-like \"symbol\" behavior in compiled output"
metadata:
  languages: "javascript"
  versions: "7.27.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,transpile,symbol,typeof"
---

# @babel/plugin-transform-typeof-symbol

`@babel/plugin-transform-typeof-symbol` rewrites `typeof` expressions so compiled code can preserve native-like Symbol behavior, especially checks that should return or compare against `"symbol"`.

This is a build-time Babel transform only. There are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with `@babel/core`:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-typeof-symbol
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli
```

The published package declares `@babel/core` as a peer dependency, so install both packages.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-typeof-symbol"]
}
```

This is enough to transform `typeof` expressions in the files Babel compiles.

## Run it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-typeof-symbol
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-typeof-symbol
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a script, test helper, or custom build step:

```javascript
import { transformSync } from "@babel/core";

const source = [
  'console.log(typeof Symbol("id") === "symbol");',
  'console.log(typeof maybeMissing);',
].join("\n");

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-typeof-symbol"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With this plugin enabled, Babel injects a `typeof` helper and rewrites call sites in this shape:

```javascript
console.log(_typeof(Symbol("id")) === "symbol");
console.log(typeof maybeMissing === "undefined" ? "undefined" : _typeof(maybeMissing));
```

That second rewrite matters because plain JavaScript allows `typeof maybeMissing` even when `maybeMissing` is undeclared. The plugin keeps that behavior instead of turning it into a direct helper call that would throw.

## What the transform changes

In `7.27.1`, the plugin implementation does three important things:

- injects Babel's `typeof` helper so Symbol values can still be identified as `"symbol"`
- preserves `typeof undeclaredName` behavior by guarding unresolved identifiers before calling the helper
- skips rewriting equality checks when the other side is a string literal other than `"symbol"` or `"object"`

That means a comparison like this stays as-is:

```javascript
if (typeof value === "string") {
  console.log(value);
}
```

But checks that involve `"symbol"` or `"object"` are still rewritten because those are the cases where Symbol behavior affects the result.

## Important pitfalls

- This plugin rewrites `typeof`; it does not provide a `Symbol` runtime or polyfill older environments that do not implement `Symbol`
- Install `@babel/core` alongside the plugin; the package is not a standalone compiler
- The plugin has no plugin-specific options in the published `7.27.1` implementation; enable it as a plain string in `plugins`
- If your source code binds `Symbol` in local scope, Babel may rename that binding in output before inserting its helper; seeing names such as `_Symbol` is expected

## Version-sensitive notes

- This guide targets `@babel/plugin-transform-typeof-symbol@7.27.1`
- The published package declares `@babel/core` peer compatibility as `^7.0.0-0`
- The published package declares `node >= 6.9.0` in `engines`
- In `7.27.1`, the plugin implementation exposes no plugin-specific options

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-transform-typeof-symbol
- npm package page: https://www.npmjs.com/package/@babel/plugin-transform-typeof-symbol
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-transform-typeof-symbol
