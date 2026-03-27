---
name: plugin-transform-json-strings
description: "Babel plugin for escaping U+2028 and U+2029 inside JavaScript string literals during builds"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,strings,json,transpile"
---

# @babel/plugin-transform-json-strings

`@babel/plugin-transform-json-strings` escapes raw `U+2028` LINE SEPARATOR and `U+2029` PARAGRAPH SEPARATOR characters in compiled JavaScript string literals. Use it when source files may contain those characters and you want Babel to emit `\u2028` and `\u2029` escape sequences instead of raw separators.

This is a compile-time Babel plugin. There are no package-specific environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-json-strings
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli @babel/core @babel/plugin-transform-json-strings
```

The published package declares `@babel/core` as a peer dependency, so install both packages.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-json-strings"]
}
```

In `7.28.6`, the published package does not expose plugin-specific options. Adding it to `plugins` is enough.

## Run it from the CLI

Compile a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-json-strings
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-json-strings
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a build script, test helper, or custom compiler step:

```javascript
import { transformSync } from "@babel/core";

const lineSeparator = String.fromCharCode(0x2028);
const paragraphSeparator = String.fromCharCode(0x2029);

const input = `const text = "before${lineSeparator}middle${paragraphSeparator}after";`;

const result = transformSync(input, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-json-strings"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

The emitted code is in this shape:

```javascript
const text = "before\u2028middle\u2029after";
```

## What the plugin changes

In `7.28.6`, the implementation does three relevant things:

- It rewrites raw `U+2028` and `U+2029` characters in `StringLiteral` and `DirectiveLiteral` nodes.
- It leaves already-escaped sequences alone, so existing `\u2028` and `\u2029` escapes are not rewritten again.
- It enables Babel's `jsonStrings` parser plugin while parsing, so the file can be parsed before Babel rewrites the literals.

The runtime string value does not change. Only the emitted source text changes from raw separator characters to Unicode escape sequences.

## Common setup

Use a normal Babel build script:

```json
{
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.28.6",
    "@babel/core": "^7.28.6",
    "@babel/plugin-transform-json-strings": "^7.28.6"
  }
}
```

With `babel.config.json`:

```json
{
  "plugins": ["@babel/plugin-transform-json-strings"]
}
```

## Important pitfalls

- This plugin only affects Babel output. It does not polyfill runtime features or change how strings behave at runtime.
- It only visits string literals and directive literals. It is not a general-purpose JSON-file transformer.
- The published package for `7.28.6` does not define any plugin options, so array-style plugin configuration is unnecessary unless you are following a shared config format.
- If you still see raw separator characters in emitted code, confirm that this plugin is active for the files being compiled.
- Install `@babel/core` alongside the plugin; the package declares Babel core as a peer dependency.

## Version-sensitive notes

- This guide targets `@babel/plugin-transform-json-strings@7.28.6`.
- The published package describes the plugin as escaping `U+2028` and `U+2029` in JavaScript strings.
- The published package declares `@babel/core` peer compatibility as `^7.0.0-0`.
- The published package declares `node >= 6.9.0` in `engines`.
- In `7.28.6`, the implementation rewrites only `StringLiteral` and `DirectiveLiteral` raw text and skips separator characters that are already escaped.

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-transform-json-strings
- npm package page: https://www.npmjs.com/package/@babel/plugin-transform-json-strings
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-transform-json-strings
