---
name: plugin-transform-object-rest-spread
description: "Babel plugin for compiling object rest destructuring and object spread literals to older JavaScript output"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,object-rest-spread,javascript"
---

# @babel/plugin-transform-object-rest-spread

`@babel/plugin-transform-object-rest-spread` rewrites object rest destructuring and object spread literals during Babel compilation. It is a build-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-object-rest-spread
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
  "plugins": ["@babel/plugin-transform-object-rest-spread"]
}
```

This is enough to compile both object-rest destructuring and object spread in object literals.

## Use it from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-object-rest-spread
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-object-rest-spread
```

## Transform code programmatically

```javascript
import { transformSync } from "@babel/core";

const source = `
const { id, ...rest } = record;
const payload = { type: "user", ...rest };
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-object-rest-spread"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

The transform enables the `objectRestSpread` parser feature internally, so you do not need a separate syntax plugin when this transform is active.

## What the plugin rewrites

This plugin handles both halves of the feature:

```javascript
const { id, ...rest } = record;

function stripId({ id, ...rest }) {
  return rest;
}

const payload = {
  type: "user",
  ...rest,
};
```

With the default configuration, Babel emits helper-based code for rest extraction and spread merging.

## Control assignment-style output with `useBuiltIns`

When you want assignment-style copies, set `assumptions.setSpreadProperties: true`. Pair it with `useBuiltIns: true` to emit `Object.assign(...)` instead of Babel's `_extends` helper.

```json
{
  "assumptions": {
    "setSpreadProperties": true
  },
  "plugins": [
    ["@babel/plugin-transform-object-rest-spread", { "useBuiltIns": true }]
  ]
}
```

For code like this:

```javascript
const copy = { a: 1, ...input };
```

the emitted code is in this shape:

```javascript
const copy = Object.assign({
  a: 1,
}, input);
```

Only enable `useBuiltIns: true` when `Object.assign` is available in your target runtime or provided separately.

In Babel `7.28.6`, the plugin's `useBuiltIns` default depends on the configured Babel targets: it defaults to `true` when the targets already support `Object.assign`, otherwise `false`.

## Prefer top-level assumptions over `loose`

This plugin still accepts `loose: true`, but in `7.28.6` it is only the fallback for four top-level assumptions:

- `setSpreadProperties`
- `objectRestNoSymbols`
- `pureGetters`
- `ignoreFunctionLength`

Configure the assumptions explicitly when you want the same tradeoff across your build:

```json
{
  "assumptions": {
    "setSpreadProperties": true,
    "objectRestNoSymbols": true,
    "pureGetters": true,
    "ignoreFunctionLength": true
  },
  "plugins": ["@babel/plugin-transform-object-rest-spread"]
}
```

This configuration matches the plugin's `loose: true` fallback behavior. If you set an assumption explicitly, it takes precedence over `loose`.

## When to keep the default helper behavior

Leave `setSpreadProperties` disabled when you want Babel's spread helper rather than assignment-style output.

With the default configuration, object spread emits helper code in this shape:

```javascript
var copy = _objectSpread2({
  a: 1,
}, input);
```

That helper copies enumerable symbol keys and uses property-definition-style output, which is closer to object spread semantics than `Object.assign(...)`.

## Important pitfalls

- Install `@babel/core` alongside the plugin; the plugin alone does not run Babel.
- `useBuiltIns: true` makes emitted code depend on `Object.assign`.
- `setSpreadProperties: true` and `loose: true` switch object spread to assignment-style copying, which can behave differently from the default helper around setters and property definition.
- `objectRestNoSymbols: true` and `loose: true` make object-rest copies ignore symbol keys.
- Top-level assumptions override this plugin's `loose` fallback, so keep those settings aligned.
- This plugin changes build output only; it does not polyfill missing runtime features.
