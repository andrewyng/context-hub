---
name: plugin-transform-private-methods
description: "Babel plugin for compiling JavaScript private class methods to compatible output during builds"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,classes,private-methods"
---

# @babel/plugin-transform-private-methods

`@babel/plugin-transform-private-methods` compiles private class methods such as `#run()` and calls like `this.#run()` during Babel builds. It is a compile-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-private-methods
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-private-methods"]
}
```

This is enough when your source only uses private class methods.

## Transform private methods from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-private-methods
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-private-methods
```

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const source = `
class Counter {
  constructor() {
    this.value = 0;
  }

  #inc(step) {
    this.value += step;
    return this.value;
  }

  next() {
    return this.#inc(1);
  }
}
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-private-methods"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With the default configuration in Babel 7.28.6, the emitted code uses helper functions plus a `WeakSet` brand check for the private method.

## Use `loose` mode

Set `loose: true` when you want Babel to emit simpler property-based helpers instead of the default brand-check helpers:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-private-methods",
      {
        "loose": true
      }
    ]
  ]
}
```

In `loose` mode, Babel emits generated property keys and uses `Object.defineProperty(...)` on the instance instead of the default `WeakSet`-based private method tracking.

## Keep class-feature settings aligned

If the same build also uses `@babel/plugin-transform-class-properties` or `@babel/plugin-transform-private-property-in-object`, keep the `loose` setting the same across those plugins. Babel's class-features helpers require consistent settings.

```json
{
  "plugins": [
    ["@babel/plugin-transform-class-properties", { "loose": true }],
    ["@babel/plugin-transform-private-methods", { "loose": true }],
    ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
  ]
}
```

You only need the other plugins if your code uses those syntaxes too:

- `@babel/plugin-transform-class-properties` for public class fields
- `@babel/plugin-transform-private-property-in-object` for `#field in obj`

## Use top-level assumptions for class features

Babel also supports top-level class-features assumptions. In Babel 7.28.6, `setPublicClassFields: true` plus `privateFieldsAsProperties: true` produces property-style output for class fields and private methods.

```json
{
  "assumptions": {
    "setPublicClassFields": true,
    "privateFieldsAsProperties": true
  },
  "plugins": [
    "@babel/plugin-transform-class-properties",
    "@babel/plugin-transform-private-methods"
  ]
}
```

Use this only when you want the looser class-features output across the whole build.

## Important pitfalls

- Private methods in decorated classes are not supported by Babel's class-features transform and will throw during compilation.
- This plugin is only for private class methods. If the same files also use public fields, private fields, or `#field in obj`, add the matching class-features plugins.
- If Babel says `Class private methods are not enabled`, this plugin is missing from the loaded config for that file.
- This plugin changes build output only; it does not polyfill runtime APIs or add browser features at runtime.
