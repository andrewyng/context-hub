---
name: plugin-transform-unicode-regex
description: "Babel plugin for rewriting ES2015 Unicode regex literals with the `u` flag to ES5-compatible patterns"
metadata:
  languages: "javascript"
  versions: "7.27.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,regex,unicode,transpile"
---

# @babel/plugin-transform-unicode-regex

`@babel/plugin-transform-unicode-regex` compiles ES2015 regular expression literals that use the Unicode `u` flag into ES5-compatible regex patterns.

This is a compile-time Babel plugin. There are no environment variables, auth steps, or runtime clients to initialize.

Use it when your source code contains regex literals such as `/^\u{1F600}$/u` and you need Babel to emit output for environments that do not support Unicode regexes with the `u` flag.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-unicode-regex
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli @babel/core @babel/plugin-transform-unicode-regex
```

The plugin declares `@babel/core` as a peer dependency, so install both packages.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-unicode-regex"]
}
```

With that config, Babel rewrites regex literals that use the `u` flag when it compiles your files.

## Run it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-unicode-regex
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-unicode-regex
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a script, test helper, or custom build step:

```javascript
import { transformSync } from "@babel/core";

const source = `
const singleEmoji = /^\\u{1F600}$/u;
const lettersOrEmoji = /^[a-z\\u{1F600}-\\u{1F64F}]+$/u;
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-unicode-regex"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

The generated output expands Unicode-aware regex syntax into ES5-compatible pattern text and removes the `u` flag from the final literal.

## Use it with `@babel/preset-env`

If you already use `@babel/preset-env`, prefer setting `targets` there instead of forcing this plugin separately for normal compatibility builds.

```json
{
  "presets": [["@babel/preset-env", { "targets": "> 0.25%, not dead" }]]
}
```

Add `@babel/plugin-transform-unicode-regex` directly when you need to force this transform as part of a narrow Babel pipeline or you are building a custom plugin list by hand.

## What this plugin does not cover

This plugin only targets regex literals that use the Unicode `u` flag.

- It does not rewrite `new RegExp("\\u{1F600}", "u")` or other runtime-created regexes.
- It does not add support for Unicode property escapes like `\\p{Letter}` by itself.
- It does not add support for newer Unicode sets regex syntax that uses the `v` flag.
- It does not polyfill any JavaScript built-ins or unrelated syntax features.

Use the dedicated Babel regex transforms or `@babel/preset-env` when your codebase also relies on those other regex features.

## Important pitfalls

- Install `@babel/core` with the plugin; the plugin alone is not enough.
- This is a build-time transform only; your application code does not import anything from this package at runtime.
- Only regex literals parsed by Babel are transformed. Patterns assembled dynamically with strings stay unchanged.
- If your regex uses `\\p{...}` property escapes or `v`-flag Unicode sets, this plugin alone is not sufficient.
- Prefer `@babel/preset-env` when your real goal is target-based transpilation across many language features, not only Unicode regex literals.
