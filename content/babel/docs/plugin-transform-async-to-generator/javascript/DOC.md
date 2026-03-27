---
name: plugin-transform-async-to-generator
description: "Babel plugin for rewriting async functions into generator-based code during JavaScript builds"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,async,generators"
---

# @babel/plugin-transform-async-to-generator

`@babel/plugin-transform-async-to-generator` rewrites `async` / `await` functions into generator-based code. It is a Babel compile-time transform: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-async-to-generator
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-async-to-generator"]
}
```

This is enough to transform async functions in files Babel compiles.

## Use it from the CLI

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-async-to-generator
```

For a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-async-to-generator
```

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const input = `
async function fetchUser(id) {
  await loadUser(id);
  return id;
}
`;

const result = transformSync(input, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-async-to-generator"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With the default configuration, Babel injects its `asyncToGenerator` helper and rewrites `await` expressions to `yield` inside a generator wrapper.

## Use a custom wrapper with `module` and `method`

This plugin also supports a custom wrapper function. Set both `module` and `method` together:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-async-to-generator",
      {
        "module": "bluebird",
        "method": "coroutine"
      }
    ]
  ]
}
```

If you use that example, install the runtime dependency too:

```bash
npm install bluebird
```

Programmatic usage:

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("async function run() { await task(); }", {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-transform-async-to-generator", {
    module: "bluebird",
    method: "coroutine",
  }]],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

That produces code in this shape:

```javascript
import { coroutine as _coroutine } from "bluebird";

function run() {
  return _run.apply(this, arguments);
}

function _run() {
  _run = _coroutine(function* () {
    yield task();
  });
  return _run.apply(this, arguments);
}
```

## Common build setup

```json
{
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.28.6",
    "@babel/core": "^7.28.6",
    "@babel/plugin-transform-async-to-generator": "^7.28.6"
  }
}
```

With `babel.config.json`:

```json
{
  "plugins": ["@babel/plugin-transform-async-to-generator"]
}
```

## Important notes

- No environment variables are required. This plugin only changes compiled code.
- `@babel/core` is required; the plugin is not useful by itself.
- This transform still emits generator functions and uses `Promise` in the generated helper. If your target environment lacks generators or `Promise`, use `@babel/preset-env` or add the other transforms/polyfills your runtime needs.
- If you set only `module` or only `method`, Babel does not use a custom wrapper. Set both options together.
- If you already use `@babel/preset-env`, this transform is part of Babel's preset-env plugin set. Add the plugin directly when you need to force this transform or pass `module` / `method` options.
- A custom wrapper controls runtime behavior for yielded values. This plugin only rewrites `async` functions to generator-based code and delegates execution to the wrapper you configure.
