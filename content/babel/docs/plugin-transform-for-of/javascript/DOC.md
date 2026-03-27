---
name: plugin-transform-for-of
description: "Babel plugin for rewriting JavaScript for...of loops during builds"
metadata:
  languages: "javascript"
  versions: "7.27.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,for-of,iteration"
---

# @babel/plugin-transform-for-of

`@babel/plugin-transform-for-of` rewrites `for...of` loops during Babel compilation. It is a build-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-for-of
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-for-of"]
}
```

With the default configuration, Babel emits iterator-helper code and preserves iterator closing semantics with `try` / `catch` / `finally`.

## Use it from the CLI

Transform a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-for-of
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-for-of
```

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const input = `
for (const item of iterable) {
  console.log(item);
}
`;

const result = transformSync(input, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-for-of"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

The output is shaped like this:

```javascript
var _iterator = _createForOfIteratorHelper(iterable),
  _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    const item = _step.value;
    console.log(item);
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}
```

## Smaller output with `loose`

Use `loose: true` when you want shorter emitted code and do not need iterator closing behavior:

```json
{
  "plugins": [["@babel/plugin-transform-for-of", { "loose": true }]]
}
```

Programmatic usage:

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("for (const item of iterable) console.log(item);", {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-transform-for-of", { loose: true }]],
});
```

This switches Babel to the loose helper shape:

```javascript
for (var _iterator = _createForOfIteratorHelperLoose(iterable), _step; !(_step = _iterator()).done;) {
  const item = _step.value;
  console.log(item);
}
```

## Assume every iterable is an array

If every transformed `for...of` in a file iterates real arrays, `assumeArray: true` emits a simple index-based loop:

```json
{
  "plugins": [["@babel/plugin-transform-for-of", { "assumeArray": true }]]
}
```

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("for (const item of items) total += item;", {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-transform-for-of", { assumeArray: true }]],
});
```

Output shape:

```javascript
for (let _i = 0, _items = items; _i < _items.length; _i++) {
  const item = _items[_i];
  total += item;
}
```

Use this only when the right-hand side is always an actual array. Do not use it for `Set`, `Map`, generator results, strings, or custom iterables.

## Allow array-like values

Use `allowArrayLike: true` only when source code may iterate values with a numeric `length` but no iterator method.

```json
{
  "plugins": [["@babel/plugin-transform-for-of", { "allowArrayLike": true }]]
}
```

Programmatic usage:

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("for (const node of collection) use(node);", {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-transform-for-of", { allowArrayLike: true }]],
});
```

When this option is enabled, Babel passes `true` into the generated helper so array-like values can be consumed by index.

`allowArrayLike` requires `@babel/core` `^7.10.0` or newer.

## Use top-level Babel assumptions

This plugin also reads Babel assumptions. Configure them once at the top level instead of repeating per-plugin options.

`iterableIsArray` tells Babel to compile `for...of` as array iteration:

```json
{
  "assumptions": {
    "iterableIsArray": true
  },
  "plugins": ["@babel/plugin-transform-for-of"]
}
```

`skipForOfIteratorClosing` gives the same iterator-closing tradeoff as loose mode:

```json
{
  "assumptions": {
    "skipForOfIteratorClosing": true
  },
  "plugins": ["@babel/plugin-transform-for-of"]
}
```

`arrayLikeIsIterable` enables array-like fallback handling globally:

```json
{
  "assumptions": {
    "arrayLikeIsIterable": true
  },
  "plugins": ["@babel/plugin-transform-for-of"]
}
```

Do not combine `iterableIsArray` with `arrayLikeIsIterable`; the plugin rejects that configuration.

## What Babel already optimizes without extra options

Even with the default configuration, Babel already emits a simple indexed loop when it can statically see that the right-hand side is an array expression.

Input:

```javascript
for (const item of [1, 2, 3]) {
  console.log(item);
}
```

Output shape:

```javascript
for (var _i = 0, _arr = [1, 2, 3]; _i < _arr.length; _i++) {
  const item = _arr[_i];
  console.log(item);
}
```

That means you usually do not need `assumeArray` just for obvious array literals.

## Important pitfalls

- Install `@babel/core` alongside the plugin. `@babel/plugin-transform-for-of` declares Babel core as a peer dependency.
- Do not combine `loose: true` with `assumeArray: true`.
- Do not combine `assumeArray: true` with `allowArrayLike: true`.
- Do not enable both `iterableIsArray` and `arrayLikeIsIterable` assumptions.
- This plugin does not add global polyfills. If your target runtime lacks iterator support such as `Symbol.iterator`, add the required polyfills separately.
