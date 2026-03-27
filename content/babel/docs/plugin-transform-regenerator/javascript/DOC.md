---
name: plugin-transform-regenerator
description: "Babel plugin for rewriting async functions and generator functions into regenerator-based state-machine code during JavaScript builds"
metadata:
  languages: "javascript"
  versions: "7.29.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,async,generators,regenerator"
---

# @babel/plugin-transform-regenerator

`@babel/plugin-transform-regenerator` rewrites generator functions, async functions, and async generators into regenerator-based state-machine code during compilation. It is a Babel build-time transform: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-regenerator
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-regenerator"]
}
```

This is enough to transform `function*`, `async function`, and `async function*` in files Babel compiles.

## Use it from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-regenerator
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-regenerator
```

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const source = `
async function loadUser(id) {
  await fetchUser(id);
  return id;
}

function* ids(items) {
  for (const item of items) {
    yield item.id;
  }
}

async function* streamUsers(ids) {
  for (const id of ids) {
    yield await fetchUser(id);
  }
}
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-regenerator"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With the default configuration in Babel 7.29.0, Babel converts those functions into state-machine code and routes the output through Babel's regenerator helper/runtime path.

## Control which function kinds are transformed

This plugin accepts three boolean options. All are enabled by default.

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-regenerator",
      {
        "async": true,
        "generators": true,
        "asyncGenerators": true
      }
    ]
  ]
}
```

- Set `async: false` to leave plain `async function` declarations untouched.
- Set `generators: false` to leave plain generator functions like `function* run()` untouched.
- Set `asyncGenerators: false` to leave `async function*` untouched.

For example, this config transforms generators but leaves plain async functions alone:

```json
{
  "plugins": [["@babel/plugin-transform-regenerator", { "async": false }]]
}
```

Use this when another part of your Babel pipeline already handles plain `async` functions and you only want regenerator's generator transforms here.

## Use it with `@babel/preset-env`

If you already use `@babel/preset-env`, prefer configuring `targets` there instead of adding this plugin manually for standard browser or Node compatibility builds.

```json
{
  "presets": [["@babel/preset-env", { "targets": "> 0.25%, not dead" }]]
}
```

In Babel 7.29.0, `@babel/preset-env` includes `transform-regenerator` in its available plugin set. Add `@babel/plugin-transform-regenerator` directly when you need to force this transform or control its `async`, `generators`, or `asyncGenerators` options explicitly.

## Common build setup

```json
{
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.29.0",
    "@babel/core": "^7.29.0",
    "@babel/plugin-transform-regenerator": "^7.29.0"
  }
}
```

With `babel.config.json`:

```json
{
  "plugins": ["@babel/plugin-transform-regenerator"]
}
```

## Important notes

- No environment variables are required. This plugin only changes compiled code.
- `@babel/core` is required; the plugin is not useful by itself.
- This plugin does not expose a runtime API for application code. You configure it in Babel and run Babel over source files.
- The generated output depends on Babel's regenerator helper/runtime path. If your build output fails because that helper is missing, fix that through your existing Babel runtime or polyfill strategy.
- If you only need plain `async` / `await` rewriting with a custom wrapper such as `bluebird.coroutine`, use `@babel/plugin-transform-async-to-generator` instead.
- If your real goal is target-based transpilation across many language features, prefer `@babel/preset-env`.
