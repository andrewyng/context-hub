---
name: plugin-transform-block-scoping
description: "Babel plugin for compiling let and const to ES5-compatible output while preserving block-scoping behavior where possible"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,transpile,let,const"
---

# @babel/plugin-transform-block-scoping

`@babel/plugin-transform-block-scoping` compiles ES2015 block-scoped declarations (`let` and `const`) to ES5-style output. Use it when you need this transform explicitly in a Babel build.

This is a compile-time plugin. There are no environment variables, auth steps, or runtime clients to initialize.

If you already use `@babel/preset-env`, prefer setting `targets` there instead of adding this plugin manually. Babel includes this transform when your target environments need it.

## Install

Install the plugin with `@babel/core`:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-block-scoping
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli @babel/core @babel/plugin-transform-block-scoping
```

The plugin declares `@babel/core` as a peer dependency, so install both packages.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-block-scoping"]
}
```

This is enough to rewrite `let` and `const` in files Babel compiles.

## Run it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-block-scoping
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-block-scoping
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a script, test helper, or custom build step:

```javascript
import { transformSync } from "@babel/core";

const source = `
for (let i = 0; i < 2; i++) {
  console.log(i);
}

const answer = 42;
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-block-scoping"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

The generated output rewrites block-scoped declarations to ES5-compatible code and adds extra machinery when needed to preserve loop semantics.

## Fail fast when a loop transform would need a closure

Some `let` bindings inside loops must be wrapped in a generated closure to preserve per-iteration values captured by nested functions.

Set `throwIfClosureRequired: true` when you want Babel to stop instead of emitting that extra closure code:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-block-scoping",
      {
        "throwIfClosureRequired": true
      }
    ]
  ]
}
```

This matters for code like:

```javascript
const callbacks = [];

for (let i = 0; i < 3; i++) {
  callbacks.push(() => i);
}
```

With `throwIfClosureRequired: true`, Babel throws instead of compiling that pattern with an added closure. Use this when you want to catch potentially expensive transforms during builds.

## Enable temporal dead zone checks

Set `tdz: true` when you want Babel to inject runtime checks for references that happen before a `let` or `const` declaration is initialized:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-block-scoping",
      {
        "tdz": true
      }
    ]
  ]
}
```

Example source:

```javascript
console.log(count);
let count = 1;
```

With `tdz: true`, Babel injects helper-based checks for temporal dead zone access. This is useful when you need closer ES2015 behavior in transformed output.

## Important pitfalls

- Install `@babel/core` with the plugin; the plugin alone is not enough
- Prefer `@babel/preset-env` when your real goal is target-based transpilation across multiple ES features
- `throwIfClosureRequired` is a build guardrail, not a compatibility fix; it intentionally fails valid code that depends on per-iteration closure semantics
- `tdz: true` adds helper-based runtime checks; treat it as transformed compatibility behavior rather than a replacement for native engine semantics
- The plugin only handles block scoping; it does not polyfill unrelated syntax transforms or built-in APIs
- Reassigning a transformed `const` binding still triggers Babel's generated read-only error helper rather than silently becoming mutable output
