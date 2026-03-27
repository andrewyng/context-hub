---
name: plugin-transform-spread
description: "Babel plugin for compiling array, call, and constructor spread syntax to older JavaScript output"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,spread,javascript"
---

# @babel/plugin-transform-spread

`@babel/plugin-transform-spread` rewrites JavaScript spread syntax during Babel compilation. It covers array literals like `[...items]`, spread arguments in calls like `fn(...args)`, and constructor calls like `new Map(...entries)`.

This is a build-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-spread
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli
```

`@babel/plugin-transform-spread` declares `@babel/core` as a peer dependency, so installing the plugin alone is not enough.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-spread"]
}
```

Use this when your build needs to compile spread syntax regardless of whether you also use a preset.

## Use it from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-spread
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-spread
```

## Transform code programmatically

```javascript
import { transformSync } from "@babel/core";

const source = `
const out = [head, ...items, tail];
obj.method(...args);
new Map(...ctorArgs);
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-spread"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With the default configuration, Babel rewrites those expressions to helper-based or `apply`/`concat`-based output.

## What the plugin rewrites

### Array literals

Input:

```javascript
const out = [head, ...items, tail];
```

Output shape:

```javascript
const out = [head].concat(_toConsumableArray(items), [tail]);
```

For `const copy = [...items];`, Babel emits `_toConsumableArray(items)`.

When the source is `arguments`, Babel uses `Array.prototype.slice.call(arguments)` instead of the helper.

### Function and method calls

Input:

```javascript
fn(...args);
obj.method(...args);
```

Output shape:

```javascript
fn.apply(void 0, _toConsumableArray(args));
obj.method.apply(obj, _toConsumableArray(args));
```

For member calls, the transform preserves the call receiver so `this` keeps working.

### Constructor calls

Input:

```javascript
new Map(...ctorArgs);
```

Output shape:

```javascript
_construct(Map, _toConsumableArray(ctorArgs));
```

That helper delegates to `Reflect.construct(...)` when available and falls back to bind/apply-style construction otherwise.

## Allow array-like values with `allowArrayLike`

By default, Babel treats spread operands as arrays or iterables. If your source may spread array-like values that have a numeric `length` but no iterator, enable `allowArrayLike`:

```json
{
  "plugins": [["@babel/plugin-transform-spread", { "allowArrayLike": true }]]
}
```

Programmatic usage:

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("const copy = [...listLike];", {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-transform-spread", { allowArrayLike: true }]],
});
```

With this option, Babel uses a helper in the shape of `_maybeArrayLike(_toConsumableArray, listLike)` so numeric-length values can be copied by index.

Enable this only when you intentionally want non-iterable array-like values to be accepted by your compiled output. Native JavaScript spread syntax still requires an iterable.

## Prefer top-level assumptions over `loose`

This plugin still accepts `loose: true`, but in `7.28.6` it is only the fallback for Babel's top-level `iterableIsArray` assumption.

```json
{
  "assumptions": {
    "iterableIsArray": true
  },
  "plugins": ["@babel/plugin-transform-spread"]
}
```

When `iterableIsArray` is enabled, Babel skips iterator conversion and treats spread operands as arrays. For example, `const copy = [...items];` compiles in the shape of `[].concat(items)` instead of `_toConsumableArray(items)`.

If you want array-like fallback behavior across your build, use Babel's top-level `arrayLikeIsIterable` assumption:

```json
{
  "assumptions": {
    "arrayLikeIsIterable": true
  },
  "plugins": ["@babel/plugin-transform-spread"]
}
```

`allowArrayLike` is the plugin-local version of that behavior. If you set `allowArrayLike` directly on this plugin, it takes precedence for this transform.

Use `loose` or `iterableIsArray` only when every non-`arguments` spread operand is already a real array. Do not use it for general iterables such as `Set`, `Map`, generator results, or custom iterator objects.

## Use with `@babel/preset-env`

If you already use `@babel/preset-env`, this transform is part of Babel's preset-env plugin set. Add `@babel/plugin-transform-spread` directly when you need to force this transform or configure plugin-specific behavior such as `allowArrayLike` or `loose`.

## Important pitfalls

- Install `@babel/core` alongside the plugin.
- This plugin rewrites syntax only; it does not polyfill missing runtime features for older environments.
- `super(...args)` cannot be compiled by this plugin alone. Babel requires `@babel/plugin-transform-classes` in the same build when spread appears inside `super()`.
- `allowArrayLike: true` changes semantics by accepting numeric-length values that native spread syntax would reject.
- `loose: true` and `assumptions.iterableIsArray: true` are only safe when spread operands are actual arrays.
- Method-call spreads are rewritten with `.apply(...)` to preserve `this`, so avoid post-processing that assumes the original call shape is still present.
