---
name: plugin-transform-logical-assignment-operators
description: "Babel plugin for rewriting logical assignment operators into short-circuited JavaScript assignments during builds"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,logical-assignment,es2021"
---

# @babel/plugin-transform-logical-assignment-operators

`@babel/plugin-transform-logical-assignment-operators` rewrites logical assignment operators at build time:

- `a ||= b` → `a || (a = b)`
- `a &&= b` → `a && (a = b)`
- `a ??= b` → `a ?? (a = b)`

This is a compile-time Babel transform. There are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-logical-assignment-operators
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
  "plugins": ["@babel/plugin-transform-logical-assignment-operators"]
}
```

When you use the transform directly, Babel also enables parsing for logical assignment syntax, so you do not need a separate syntax plugin.

## Use it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-logical-assignment-operators
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-logical-assignment-operators
```

## Transform code programmatically

Use `@babel/core` directly when this transform is part of a script, codemod, test helper, or custom build step:

```javascript
import { transformSync } from "@babel/core";

const source = `
let ready = false;
ready ||= true;

const session = { active: true };
session.active &&= isStillActive();
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-logical-assignment-operators"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

That produces output in this shape:

```javascript
let ready = false;
ready || (ready = true);

const session = {
  active: true
};
session.active && (session.active = isStillActive());
```

## Complex left-hand sides are only evaluated once

For member expressions, Babel memoizes the object or computed property when needed so the left-hand side is not re-evaluated.

Example source:

```javascript
obj[getKey()] &&= value;
```

Transformed output:

```javascript
var _obj, _getKey;

(_obj = obj)[_getKey = getKey()] && (_obj[_getKey] = value);
```

This matters when the object expression or property lookup has side effects.

## `??=` may need an additional transform

This plugin rewrites `??=` to `??` plus an assignment. It does not remove the nullish coalescing operator by itself.

Example source:

```javascript
user.settings.theme ??= "dark";
```

With only this plugin, Babel emits:

```javascript
var _user$settings;

(_user$settings = user.settings).theme ?? (_user$settings.theme = "dark");
```

If your target runtime does not support `??`, also use `@babel/plugin-transform-nullish-coalescing-operator` or `@babel/preset-env`:

```json
{
  "plugins": [
    "@babel/plugin-transform-logical-assignment-operators",
    "@babel/plugin-transform-nullish-coalescing-operator"
  ]
}
```

## Use it with `@babel/preset-env`

`@babel/preset-env` includes this transform. Prefer the preset when your real goal is target-based transpilation across multiple language features.

Example:

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "14"
        }
      }
    ]
  ]
}
```

Add this plugin directly when you want to force only logical assignment rewriting in an otherwise narrow Babel setup.

## Important notes

- No environment variables are required; this plugin only changes compiled output
- `@babel/core` is required; the plugin is not useful by itself
- The plugin has no documented configuration options in `7.28.6`; the main setup choice is whether to use it directly or via `@babel/preset-env`
- `??=` rewrites to `??`, not to ES5-only code; add `@babel/plugin-transform-nullish-coalescing-operator` or use `@babel/preset-env` when older runtimes must not receive `??`
- The transform preserves short-circuiting and avoids re-evaluating complex member expressions by introducing temporary variables when needed
- This plugin only handles logical assignment operators; it does not polyfill built-in APIs or replace unrelated syntax transforms
