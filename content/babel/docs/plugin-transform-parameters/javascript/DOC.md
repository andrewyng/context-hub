---
name: plugin-transform-parameters
description: "Babel plugin for rewriting JavaScript default and rest parameters during builds"
metadata:
  languages: "javascript"
  versions: "7.27.7"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,parameters,default-parameters,rest-parameters"
---

# @babel/plugin-transform-parameters

`@babel/plugin-transform-parameters` rewrites default parameters and rest parameters during Babel builds. It is a compile-time transform only: there are no package-specific environment variables, auth steps, or runtime clients to initialize.

In `7.27.7`, the published package describes this plugin as compiling ES2015 default and rest parameters to ES5. In practice, it rewrites parameter handling itself; if your code also uses parameter destructuring or other newer syntax, add the corresponding Babel transforms as well.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-parameters
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli
```

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-parameters"]
}
```

This is enough when you specifically want Babel to rewrite default and rest parameters in the files it compiles.

## Use it from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-parameters
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-parameters
```

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const input = `
function join(label = "item", ...values) {
  return values.map(function (value) {
    return label + ":" + value;
  });
}
`;

const result = transformSync(input, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-parameters"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

## What the plugin rewrites

For default parameters, Babel moves the default-value logic into the function body.

With input like this:

```javascript
function greet(name = "world") {
  return "Hello, " + name;
}
```

the generated code is in this shape:

```javascript
function greet() {
  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "world";
  return "Hello, " + name;
}
```

For rest parameters, Babel rewrites the rest argument into array-building logic based on `arguments`.

With input like this:

```javascript
function list(head, ...tail) {
  return tail;
}
```

the generated code is in this shape:

```javascript
function list(head) {
  for (var _len = arguments.length, tail = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    tail[_key - 1] = arguments[_key];
  }

  return tail;
}
```

Generated variable names can differ, but the transform follows these patterns in `7.27.7`.

## Use `loose` for simpler default-parameter output

Set `loose: true` when you want Babel to keep parameters in the function signature and emit simpler `=== undefined` guards for default values:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-parameters",
      {
        "loose": true
      }
    ]
  ]
}
```

For example, code like this:

```javascript
function greet(name = "world", punctuation) {
  return name + punctuation;
}
```

is transformed into code in this shape:

```javascript
function greet(name, punctuation) {
  if (name === undefined) {
    name = "world";
  }

  return name + punctuation;
}
```

Use this when smaller, simpler output matters more than preserving the original `function.length` behavior.

## Prefer Babel `assumptions.ignoreFunctionLength` over `loose`

In `7.27.7`, this plugin checks Babel's top-level `assumptions.ignoreFunctionLength` setting first and only falls back to `loose` if the assumption is not set.

Use the assumption when you want the same tradeoff across your Babel config:

```json
{
  "assumptions": {
    "ignoreFunctionLength": true
  },
  "plugins": ["@babel/plugin-transform-parameters"]
}
```

With this assumption enabled, default-parameter transforms use the simpler guard-based form and do not preserve spec-like `function.length` values.

## When you still need other transforms

This plugin focuses on parameter handling. Add other Babel transforms when the rest of your syntax also needs to be lowered.

- Parameter destructuring is moved into the function body, but destructuring syntax itself is not removed; add `@babel/plugin-transform-destructuring` if older runtimes must not receive destructuring.
- Plain arrow functions without default or rest parameters are not handled by this plugin; add `@babel/plugin-transform-arrow-functions` if you need those rewritten too.
- If you need target-based transpilation across many language features, use the appropriate Babel preset or additional plugins instead of relying on this plugin alone.

## Important pitfalls

- Install `@babel/core` alongside the plugin; the published package declares it as a peer dependency.
- `loose: true` and `assumptions.ignoreFunctionLength: true` change `function.length` behavior for functions with default parameters.
- This plugin changes compiled output only; it does not add polyfills or runtime helpers.
- There are no package-specific environment variables for this plugin.
- If your parameter list includes destructuring and you need fully older JavaScript output, pair this plugin with the destructuring transform as well.

## Version-sensitive notes

- This guide targets `@babel/plugin-transform-parameters@7.27.7`.
- The published package declares `@babel/core` peer compatibility as `^7.0.0-0`.
- The published package declares `node >= 6.9.0` in `engines`.
- In `7.27.7`, the implementation reads `assumptions.ignoreFunctionLength` before the plugin's `loose` option.
- In `7.27.7`, when an arrow function uses a default parameter or rest parameter, the implementation converts that arrow to a function expression before rewriting the parameters.

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-transform-parameters
- npm package page: https://www.npmjs.com/package/@babel/plugin-transform-parameters
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-transform-parameters
