---
name: plugin-transform-exponentiation-operator
description: "Babel plugin for rewriting exponentiation operators into Math.pow-based JavaScript during builds"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,exponentiation,es2016"
---

# @babel/plugin-transform-exponentiation-operator

`@babel/plugin-transform-exponentiation-operator` rewrites exponentiation syntax at build time:

- `a ** b` → `Math.pow(a, b)`
- `a **= b` → `a = Math.pow(a, b)`

This is a compile-time Babel transform. There are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-exponentiation-operator
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

The plugin declares `@babel/core` as a peer dependency, so install both packages.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-exponentiation-operator"]
}
```

Use the plugin directly when you want to force exponentiation rewriting regardless of Babel targets.

## Use it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-exponentiation-operator
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-exponentiation-operator
```

## Transform code programmatically

Use `@babel/core` directly when this transform is part of a script, codemod, test helper, or custom build step:

```javascript
import { transformSync } from "@babel/core";

const source = `
const squared = value ** 2;

let total = 2;
total **= 3;
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-exponentiation-operator"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

That produces output in this shape:

```javascript
const squared = Math.pow(value, 2);

let total = 2;
total = Math.pow(total, 3);
```

## Complex assignment targets are evaluated once

For compound assignment on member expressions, Babel memoizes the object or computed property when needed so side effects are not repeated.

Example source:

```javascript
obj[getKey()] **= 2;
```

Transformed output:

```javascript
var _obj, _getKey;

(_obj = obj)[_getKey = getKey()] = Math.pow(_obj[_getKey], 2);
```

This matters when `obj` or `getKey()` does work you only want to run once.

## Use it with `@babel/preset-env`

`@babel/preset-env` includes this transform. Prefer the preset when your goal is target-based transpilation across multiple language features.

Example:

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "6"
        }
      }
    ]
  ]
}
```

With an older target such as Node 6, `@babel/preset-env` rewrites `**` to `Math.pow(...)`. With a target that already supports exponentiation syntax, Babel can leave the original operator in place.

Add this plugin directly when you want the transform even without `@babel/preset-env`, or when you want exponentiation rewritten regardless of targets.

## Important notes

- No environment variables are required; this plugin only changes compiled output
- `@babel/core` is required; the plugin is not useful by itself
- The plugin has no documented configuration options in `7.28.6`; setup is mainly choosing direct use versus `@babel/preset-env`
- The transform rewrites syntax to `Math.pow(...)`; it does not polyfill unrelated language features or built-in APIs
- If you already use `@babel/preset-env`, you usually do not need to list this plugin separately
- Compound assignments like `obj[key] **= value` may introduce temporary variables in emitted code so Babel can preserve evaluation order
