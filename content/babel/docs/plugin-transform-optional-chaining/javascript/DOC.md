---
name: plugin-transform-optional-chaining
description: "Babel plugin for compiling JavaScript optional chaining to compatible output during builds"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,optional-chaining,javascript"
---

# @babel/plugin-transform-optional-chaining

`@babel/plugin-transform-optional-chaining` rewrites optional chaining expressions such as `obj?.prop`, `obj?.[key]`, and `fn?.()` during Babel builds. It is a compile-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-optional-chaining
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

The plugin declares `@babel/core` as a peer dependency, so installing the plugin alone is not enough.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-optional-chaining"]
}
```

This transform already enables Babel's optional chaining parser support, so you do not need to add `@babel/plugin-syntax-optional-chaining` for the same files.

## Use it from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-optional-chaining
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-optional-chaining
```

## Transform code programmatically

```javascript
import { transformSync } from "@babel/core";

const source = `
const city = user?.address?.city;
const value = cache?.[key];
const result = onError?.(message);
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-optional-chaining"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With the default configuration in Babel `7.28.6`, the emitted code uses nullish checks plus temporary variables when needed so expressions are not evaluated more than once.

## What the plugin rewrites

This plugin handles the common optional chaining forms:

```javascript
const city = user?.address?.city;
const value = cache?.[key];
const output = formatter?.(input);
const name = profile.settings?.getName?.();
```

For property access and computed access, Babel rewrites the chain into explicit null/undefined checks. For optional calls on member expressions, Babel also preserves the original call receiver so method calls still get the correct `this` value.

## Transform `delete` with optional chaining

The plugin also supports optional chaining inside `delete` expressions:

```javascript
delete session?.user?.profile;
```

Add the same plugin configuration; no separate delete-specific plugin is required.

## Use it through `@babel/preset-env`

If your real goal is target-based transpilation across multiple JavaScript features, prefer `@babel/preset-env` instead of listing this plugin manually.

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "12"
        }
      }
    ]
  ]
}
```

Use the standalone plugin when you want to force only optional chaining rewriting in an otherwise narrow Babel setup.

## Prefer `assumptions.noDocumentAll` over `loose`

With the default settings, Babel emits strict checks against both `null` and `undefined`.

When you want Babel to treat `document.all` as if it does not exist and emit `== null` / `!= null` style checks, set the top-level Babel assumption:

```json
{
  "assumptions": {
    "noDocumentAll": true
  },
  "plugins": ["@babel/plugin-transform-optional-chaining"]
}
```

The plugin also still accepts `loose: true`:

```json
{
  "plugins": [
    ["@babel/plugin-transform-optional-chaining", { "loose": true }]
  ]
}
```

In Babel `7.28.6`, `loose: true` is broader than just `document.all` handling. In the published plugin source, `loose` is also the fallback for Babel's top-level `pureGetters` assumption. Prefer explicit assumptions when you only want the looser nullish check behavior.

## Important pitfalls

- Install `@babel/core` alongside the plugin; the plugin alone does not run Babel.
- This transform changes compiled syntax only. It does not polyfill runtime APIs or add unrelated language features.
- Do not combine this plugin with `@babel/plugin-syntax-optional-chaining` for the same files unless you have a very specific pipeline reason; the transform already enables parsing.
- If you already use `@babel/preset-env`, adding this plugin manually is usually redundant.
- `loose: true` changes emitted semantics. Use it only when its looser nullish and getter assumptions are acceptable for your build.
- No environment variables, authentication, or runtime client initialization are involved; all setup lives in Babel config.

## Version-sensitive notes

- This guide targets `@babel/plugin-transform-optional-chaining@7.28.6`.
- The published `7.28.6` package declares `@babel/core` peer compatibility as `^7.0.0-0`.
- In `7.28.6`, the plugin source enables Babel's `optionalChaining` parser plugin internally, so the transform plugin also covers syntax enablement.
- In `7.28.6`, `loose` defaults to `false` and acts as the fallback for the top-level Babel assumptions `noDocumentAll` and `pureGetters` when you do not set those assumptions explicitly.

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-transform-optional-chaining
- npm package page: https://www.npmjs.com/package/@babel/plugin-transform-optional-chaining
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-transform-optional-chaining
