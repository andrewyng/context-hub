---
name: plugin-transform-destructuring
description: "Babel plugin for compiling JavaScript destructuring syntax to ES5-compatible output"
metadata:
  languages: "javascript"
  versions: "7.28.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,destructuring,javascript"
---

# @babel/plugin-transform-destructuring

`@babel/plugin-transform-destructuring` rewrites array and object destructuring during Babel compilation. It is a build-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-destructuring
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
  "plugins": ["@babel/plugin-transform-destructuring"]
}
```

This is enough to transform destructuring patterns in files Babel compiles.

## Use it from the CLI

Transform a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-destructuring
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-destructuring
```

## Transform code programmatically

```javascript
import { transformSync } from "@babel/core";

const source = `
const [first, second] = list;
const { id, ...rest } = record;
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-destructuring"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With the default configuration, Babel emits helper-based code for iterable destructuring and object-rest copies.

## What the plugin rewrites

The plugin handles destructuring patterns in more than plain variable declarations. The same transform also applies to assignment expressions, loop bindings, and `catch` parameters:

```javascript
({ a, b } = value);

for (const [key, entry] of entries) {
  console.log(key, entry);
}

try {
  throw err;
} catch ({ message, code }) {
  console.log(message, code);
}
```

No extra plugin configuration is required for those forms.

## Use `loose` for simpler emitted code

Set `loose: true` when destructured iterables can be treated like arrays and object-rest copies do not need symbol support:

```json
{
  "plugins": [["@babel/plugin-transform-destructuring", { "loose": true }]]
}
```

Programmatic usage:

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("const [first, second] = list;", {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-transform-destructuring", { loose: true }]],
});
```

For array destructuring, the output becomes a direct index lookup:

```javascript
const _list = list,
  first = _list[0],
  second = _list[1];
```

In Babel 7.28.5, `loose: true` feeds the same behavior as enabling the top-level `iterableIsArray` and `objectRestNoSymbols` assumptions for this plugin.

## Allow array-like values with `allowArrayLike`

By default, array destructuring expects an actual array or another iterable value. Set `allowArrayLike: true` only when source code may destructure values with a numeric `length` but no iterator method.

```json
{
  "plugins": [["@babel/plugin-transform-destructuring", { "allowArrayLike": true }]]
}
```

Programmatic usage:

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("const [first, second] = collection;", {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-transform-destructuring", { allowArrayLike: true }]],
});
```

When this option is enabled, Babel emits an extra fallback helper so array-like values can be copied by index.

## Use `useBuiltIns` when copying the whole object

Set `useBuiltIns: true` when you want Babel to call `Object.assign(...)` instead of emitting its own `_extends` helper for whole-object rest copies.

```json
{
  "plugins": [["@babel/plugin-transform-destructuring", { "useBuiltIns": true }]]
}
```

This matters for patterns such as:

```javascript
const { ...copy } = input;
```

With `useBuiltIns: true`, Babel emits code in this shape:

```javascript
const _input = input,
  copy = Object.assign({}, (_objectDestructuringEmpty(_input), _input));
```

Only enable this when `Object.assign` is available in your target runtime or polyfilled separately.

## Use top-level assumptions instead of repeating options

Babel also accepts assumptions at the top level. Use them when the same tradeoff should apply across your build.

This configuration matches the loose-mode behavior for this plugin:

```json
{
  "assumptions": {
    "iterableIsArray": true,
    "objectRestNoSymbols": true
  },
  "plugins": ["@babel/plugin-transform-destructuring"]
}
```

This configuration matches `allowArrayLike: true`:

```json
{
  "assumptions": {
    "arrayLikeIsIterable": true
  },
  "plugins": ["@babel/plugin-transform-destructuring"]
}
```

Only enable assumptions that are true for the code being compiled. They change emitted semantics, not just performance.

## Important pitfalls

- Install `@babel/core` alongside the plugin; the plugin alone does not run Babel.
- This plugin rewrites destructuring syntax only. It does not transform object spread expressions like `const copy = { ...input }`.
- `loose: true` and `iterableIsArray: true` are only safe when the destructured values can be treated as arrays. Do not use them for general iterables such as `Set`, `Map`, generator results, or custom iterables.
- `allowArrayLike: true` and `arrayLikeIsIterable: true` should only be enabled when code intentionally destructures array-like non-iterables.
- `useBuiltIns: true` makes the emitted code depend on `Object.assign` for whole-object rest copies.
- This plugin changes build output only; it does not add polyfills for missing runtime features such as iterators.
