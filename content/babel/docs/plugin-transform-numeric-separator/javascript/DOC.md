---
name: plugin-transform-numeric-separator
description: "Babel plugin for removing numeric separators from JavaScript number and BigInt literals during builds"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,numeric-separator,bigint"
---

# @babel/plugin-transform-numeric-separator

`@babel/plugin-transform-numeric-separator` removes `_` separators from numeric literals in compiled output. It handles decimal, binary, octal, hexadecimal, and BigInt literals.

This is a compile-time Babel transform only. There are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install Babel core and the plugin together:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-numeric-separator
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

`@babel/core` is a peer dependency, so installing the plugin by itself is not enough.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-numeric-separator"]
}
```

When you use this transform directly, Babel also enables parsing for numeric separators, so you do not need to add `@babel/plugin-syntax-numeric-separator` separately.

## Use it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-numeric-separator
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-numeric-separator
```

## Transform code programmatically

```javascript
import { transformSync } from "@babel/core";

const source = `
const budget = 1_000_000;
const mask = 0b1010_0001;
const timeout = 0x0A_FF;
const orderId = 12_345n;
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-numeric-separator"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

Output has the same literals with separators removed:

```javascript
const budget = 1000000;
const mask = 0b10100001;
const timeout = 0x0AFF;
const orderId = 12345n;
```

## BigInt literals are not downleveled

This plugin removes separators from `BigInt` literals, but it still leaves them as `...n` literals.

Example source:

```javascript
const maxId = 9_007_199_254_740_993n;
```

Transformed output:

```javascript
const maxId = 9007199254740993n;
```

If your runtime does not support `BigInt` literals, this plugin does not make that code compatible by itself.

## Prefer `@babel/preset-env` for target-based builds

`@babel/preset-env` includes this transform. Use the preset when your real goal is to support older runtimes instead of forcing only this one syntax rewrite.

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "10"
        }
      }
    ]
  ]
}
```

In Babel's compatibility data, numeric separators are supported starting at Node `12.5`, Chrome `75`, Firefox `70`, and Safari `13`. If you still target older runtimes, `@babel/preset-env` can add this transform automatically.

## Important notes

- No environment variables are required.
- The plugin has no documented configuration options in `7.28.6`.
- The transform only removes `_` from numeric literal source text; it does not polyfill language features or built-in APIs.
- When you already use `@babel/preset-env`, you usually do not need to list this plugin manually.
- When you use the transform directly, you do not need a separate numeric-separator syntax plugin.
