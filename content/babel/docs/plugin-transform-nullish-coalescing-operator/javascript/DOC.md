---
name: plugin-transform-nullish-coalescing-operator
description: "Babel plugin for compiling JavaScript nullish coalescing expressions to compatible output during builds"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,nullish-coalescing,javascript"
---

# @babel/plugin-transform-nullish-coalescing-operator

`@babel/plugin-transform-nullish-coalescing-operator` rewrites JavaScript nullish coalescing expressions such as `value ?? fallback` during Babel builds. It is a compile-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-nullish-coalescing-operator
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

The plugin declares `@babel/core` as a peer dependency, so installing the plugin alone is not enough.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-nullish-coalescing-operator"]
}
```

This transform enables Babel's `nullishCoalescingOperator` parser support internally, so you do not need to add `@babel/plugin-syntax-nullish-coalescing-operator` for the same files.

## Use it from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-nullish-coalescing-operator
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-nullish-coalescing-operator
```

## Transform code programmatically

```javascript
import { transformSync } from "@babel/core";

const source = `
const label = options.label ?? "untitled";
const timeout = getConfig().timeout ?? 5000;
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-nullish-coalescing-operator"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With the default configuration in Babel `7.28.6`, the emitted code uses explicit `null` / `undefined` checks plus temporary variables when needed so the left-hand side is not evaluated more than once.

## What the plugin rewrites

This plugin handles plain nullish coalescing expressions:

```javascript
const label = options.label ?? "untitled";
const timeout = getConfig().timeout ?? 5000;
```

The output is in this shape:

```javascript
var _options$label, _getConfig$timeout;

const label = (_options$label = options.label) !== null && _options$label !== void 0 ? _options$label : "untitled";
const timeout = (_getConfig$timeout = getConfig().timeout) !== null && _getConfig$timeout !== void 0 ? _getConfig$timeout : 5000;
```

That temporary variable behavior is important when the left-hand side is a property access or function call with possible side effects.

## Prefer `assumptions.noDocumentAll` over `loose`

By default, Babel emits separate checks for `null` and `undefined`.

When you want Babel to treat `document.all` as if it does not exist and emit the shorter `!= null` check form, set the top-level Babel assumption:

```json
{
  "assumptions": {
    "noDocumentAll": true
  },
  "plugins": ["@babel/plugin-transform-nullish-coalescing-operator"]
}
```

The plugin also still accepts `loose: true`:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-nullish-coalescing-operator",
      {
        "loose": true
      }
    ]
  ]
}
```

With either of those settings in `7.28.6`, Babel emits output in this shape:

```javascript
var _input;

const value = (_input = input) != null ? _input : fallback;
```

Prefer the top-level assumption when you want this behavior explicitly across a build. In the published `7.28.6` plugin source, `loose` acts as the fallback for `assumptions.noDocumentAll`.

## `??=` needs an additional transform

This plugin only rewrites the `??` operator. It does not transform the nullish assignment operator `??=` by itself.

If your source uses `??=`, also add `@babel/plugin-transform-logical-assignment-operators` or use `@babel/preset-env`:

```json
{
  "plugins": [
    "@babel/plugin-transform-logical-assignment-operators",
    "@babel/plugin-transform-nullish-coalescing-operator"
  ]
}
```

Use that combination for code like this:

```javascript
settings.theme ??= "dark";
```

## Use it through `@babel/preset-env`

If your real goal is target-based transpilation across multiple JavaScript features, prefer `@babel/preset-env` instead of listing this plugin manually.

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "12"
        }
      }
    ]
  ]
}
```

Use the standalone plugin when you want to force only nullish coalescing rewriting in an otherwise narrow Babel setup.

## Important pitfalls

- Install `@babel/core` alongside the plugin; the plugin alone does not run Babel.
- This transform changes compiled syntax only. It does not polyfill runtime APIs or add unrelated language features.
- Do not add `@babel/plugin-syntax-nullish-coalescing-operator` for the same files unless you have a very specific pipeline reason; the transform already enables parsing.
- If you already use `@babel/preset-env`, adding this plugin manually is usually redundant.
- `loose: true` or `assumptions.noDocumentAll: true` changes how Babel treats the `document.all` edge case; use that only when the looser nullish check semantics are acceptable.
- This plugin does not handle `??=` by itself; add `@babel/plugin-transform-logical-assignment-operators` when your code uses nullish assignment.
- No environment variables, authentication, or runtime client initialization are involved; all setup lives in Babel config or build scripts.

## Version-sensitive notes

- This guide targets `@babel/plugin-transform-nullish-coalescing-operator@7.28.6`.
- The published `7.28.6` package declares `@babel/core` peer compatibility as `^7.0.0-0`.
- In `7.28.6`, the plugin source enables Babel's `nullishCoalescingOperator` parser plugin internally, so the transform also covers syntax enablement.
- In `7.28.6`, `loose` defaults to `false` and acts as the fallback for the top-level Babel assumption `noDocumentAll`.
- In `7.28.6`, the plugin source also reads Babel's top-level `pureGetters` assumption, but that assumption remains separate from `loose`.

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-transform-nullish-coalescing-operator
- npm package page: https://www.npmjs.com/package/@babel/plugin-transform-nullish-coalescing-operator
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-transform-nullish-coalescing-operator
