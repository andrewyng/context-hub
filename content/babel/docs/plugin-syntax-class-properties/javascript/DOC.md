---
name: plugin-syntax-class-properties
description: "Enable Babel to parse public and private class field syntax without transforming the output"
metadata:
  languages: "javascript"
  versions: "7.12.13"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,class-fields,private-fields,private-methods,syntax"
---

# @babel/plugin-syntax-class-properties

`@babel/plugin-syntax-class-properties` is a syntax-only Babel plugin. In `7.12.13`, it lets Babel parse public class fields, private fields such as `#value`, and private methods such as `#inc()`.

It does **not** transform those class features for older runtimes. If your output must run where class fields or private methods are not supported natively, use the matching transform plugins instead.

## Install

Install the plugin with Babel core. Add `@babel/cli` if you want to invoke Babel from the command line.

```bash
npm install --save-dev @babel/core @babel/plugin-syntax-class-properties
```

```bash
yarn add --dev @babel/core @babel/plugin-syntax-class-properties
```

Optional CLI dependency:

```bash
npm install --save-dev @babel/cli
```

No environment variables, authentication, or runtime client setup are required.

## Enable the plugin in Babel config

Add the plugin name to `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-syntax-class-properties"]
}
```

In `7.12.13`, this package does not expose user-facing plugin options. Its implementation only enables Babel's `classProperties`, `classPrivateProperties`, and `classPrivateMethods` parser plugins.

## Parse class fields from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-syntax-class-properties
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-syntax-class-properties
```

This makes Babel accept the syntax, but the generated code still contains class fields and private members.

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const source = `
class Counter {
  static label = "counter";
  value = 0;
  #step = 1;

  #inc() {
    this.value += this.#step;
    return this.value;
  }

  next() {
    return this.#inc();
  }
}
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-syntax-class-properties"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With this plugin alone, Babel parses the file and preserves the class field and private member syntax in the emitted code.

## What syntax it enables

In `7.12.13`, the plugin covers these class features:

```javascript
class Example {
  static version = 1;
  name = "demo";
  #count = 0;

  #increment() {
    this.#count += 1;
    return this.#count;
  }
}
```

That includes:

- public instance fields
- public static fields
- private instance fields
- private methods

It does not enable every newer class-feature syntax. For example, `#field in obj` and `static {}` are handled by separate Babel plugins.

## When to use transform plugins instead

Use this syntax plugin when Babel only needs to parse class fields and private members, such as when:

- you ship modern JavaScript and want to keep class field syntax in the final output
- another build step performs the downlevel transform later
- you need Babel to parse these nodes before other plugins inspect or rewrite the AST

If you need Babel itself to rewrite the syntax, use the transform plugins instead:

```json
{
  "plugins": [
    "@babel/plugin-transform-class-properties",
    "@babel/plugin-transform-private-methods"
  ]
}
```

`@babel/plugin-transform-class-properties` handles public and private fields. `@babel/plugin-transform-private-methods` handles private methods.

## Common build setup

`package.json`:

```json
{
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.12.13",
    "@babel/core": "^7.12.13",
    "@babel/plugin-syntax-class-properties": "^7.12.13"
  }
}
```

`babel.config.json`:

```json
{
  "plugins": ["@babel/plugin-syntax-class-properties"]
}
```

## Important pitfalls

- This plugin affects parsing only. It does not transpile class fields or private methods and does not add runtime polyfills.
- A Babel build can succeed with this plugin while the output still fails in runtimes that do not support class fields or private members.
- Install `@babel/core` alongside the plugin; the published package declares Babel core as a peer dependency.
- There are no plugin-specific configuration options in `7.12.13`, so transform-style options such as `loose` do not apply here.
- This plugin enables `classProperties`, `classPrivateProperties`, and `classPrivateMethods` only. Add other Babel plugins separately for `#field in obj`, `static {}`, or additional proposal syntax.
- No environment variables or client initialization are involved; all setup happens in your Babel config.

## Version-sensitive notes

- This guide targets `@babel/plugin-syntax-class-properties@7.12.13`.
- The published `7.12.13` package description is `Allow parsing of class properties`.
- The published `7.12.13` package declares `@babel/core` peer compatibility as `^7.0.0-0`.
- In `7.12.13`, the plugin implementation asserts Babel 7 and adds `"classProperties"`, `"classPrivateProperties"`, and `"classPrivateMethods"` to Babel's parser plugins.

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-syntax-class-properties
- npm package page: https://www.npmjs.com/package/@babel/plugin-syntax-class-properties
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-syntax-class-properties
