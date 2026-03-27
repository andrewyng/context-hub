---
name: plugin-transform-class-properties
description: "Babel plugin for compiling public and private class fields during JavaScript builds"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,class-fields,javascript"
---

# @babel/plugin-transform-class-properties

`@babel/plugin-transform-class-properties` rewrites class field syntax during Babel compilation. In Babel `7.28.6`, that includes public instance fields, static fields, and private fields such as `#value`. It is a build-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-class-properties
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli
```

The plugin declares `@babel/core` as a peer dependency, so installing the plugin alone is not enough.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-class-properties"]
}
```

When this transform is active, Babel enables parsing for class field syntax automatically. You do not need separate syntax plugins for public or private class fields.

## Run it from the CLI

Compile a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-class-properties
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-class-properties
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a script, build tool, or test helper:

```javascript
import { transformSync } from "@babel/core";

const source = `
class Counter {
  static label = "counter";
  count = 0;
  #step = 1;

  next() {
    this.count += this.#step;
    return this.count;
  }
}
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-class-properties"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With the default configuration in Babel `7.28.6`, public fields are emitted with Babel's `defineProperty` helper and private fields are emitted with private-field helpers backed by a `WeakMap`.

## What the plugin rewrites

This plugin covers class field declarations and private field access:

```javascript
class Example {
  static version = 1;
  name = "demo";
  #count = 0;

  increment() {
    this.#count += 1;
    return this.#count;
  }
}
```

It does not enable private class methods such as `#inc() {}`. If your code uses private methods, add `@babel/plugin-transform-private-methods` too.

## Use assignment-style output for public fields

By default, Babel emits helper-based `defineProperty` code for public class fields. If you want direct assignment output instead, enable `loose: true`:

```json
{
  "plugins": [["@babel/plugin-transform-class-properties", { "loose": true }]]
}
```

For code like this:

```javascript
class Example {
  static version = 1;
  name = "demo";
}
```

the generated output is shaped like this in `loose` mode:

```javascript
class Example {
  constructor() {
    this.name = "demo";
  }
}

Example.version = 1;
```

You can also use the top-level Babel assumption instead of the plugin-local `loose` option:

```json
{
  "assumptions": {
    "setPublicClassFields": true
  },
  "plugins": ["@babel/plugin-transform-class-properties"]
}
```

In Babel `7.28.6`, `assumptions.setPublicClassFields: true` produces the same assignment-style public-field output as `loose: true`.

## Combine it with other class-features plugins

`@babel/plugin-transform-class-properties` handles fields, but other class features still need their own plugins:

- `@babel/plugin-transform-private-methods` for `#method()`
- `@babel/plugin-transform-private-property-in-object` for `#field in obj`
- `@babel/plugin-transform-class-static-block` for `static {}` blocks

Install the related plugins when your source uses those syntaxes:

```bash
npm install --save-dev @babel/plugin-transform-private-methods @babel/plugin-transform-private-property-in-object
```

Keep the `loose` setting the same across the class-features plugins when they are enabled together:

```json
{
  "plugins": [
    ["@babel/plugin-transform-class-properties", { "loose": true }],
    ["@babel/plugin-transform-private-methods", { "loose": true }],
    ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
  ]
}
```

Babel throws if these plugins are loaded with conflicting `loose` values.

## Common workflow: pair with decorators or `preset-env`

If the same build uses legacy decorators, put the decorators plugin before this one and enable `loose: true` for class properties:

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "version": "legacy" }],
    ["@babel/plugin-transform-class-properties", { "loose": true }]
  ]
}
```

If you already compile for target environments with `@babel/preset-env`, prefer letting the preset include class-features transforms automatically unless you need to force this plugin explicitly.

## Important pitfalls

- This plugin transforms class fields, including private fields like `#value`, but it does not transform private methods.
- Private fields in decorated classes are not supported and Babel throws during compilation.
- When Babel reports `Class fields are not enabled`, this plugin is missing from the loaded config for that file.
- When Babel reports a `loose` mode conflict, align `loose` across `@babel/plugin-transform-class-properties`, `@babel/plugin-transform-private-methods`, and `@babel/plugin-transform-private-property-in-object`.
- This plugin changes emitted JavaScript only; it does not polyfill runtime APIs or add browser support at runtime.
