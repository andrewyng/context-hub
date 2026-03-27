---
name: plugin-transform-template-literals
description: "Babel plugin for rewriting ES2015 template literals into ES5-compatible string concatenation and tagged-template helper calls"
metadata:
  languages: "javascript"
  versions: "7.27.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,template-literals,es2015"
---

# @babel/plugin-transform-template-literals

`@babel/plugin-transform-template-literals` compiles ES2015 template literals for older JavaScript targets. It is a build-time Babel transform only: there are no environment variables, auth steps, or runtime clients to initialize.

Use it when your build needs to rewrite:

- untagged template literals such as `` `Hello ${name}` ``
- tagged template literals such as `` tag`a ${value} b` ``

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-template-literals
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli
```

The published package declares `@babel/core` as a peer dependency, so install both packages.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-template-literals"]
}
```

This is enough to rewrite template literals in the files Babel compiles.

## Run it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-template-literals
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-template-literals
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a script, test helper, or custom build step:

```javascript
import { transformSync } from "@babel/core";

const source = [
  "const greeting = `Hello ${name}`;",
  "const tagged = tag`a ${value} b`;",
].join("\n");

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-template-literals"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With the default configuration in `7.27.1`, Babel rewrites plain template literals to `.concat(...)` calls and rewrites tagged templates to helper-backed calls that cache the template object.

## Default output preserves template-literal coercion behavior

For ordinary template literals, the default transform emits string concatenation through `.concat(...)` rather than always using `+`.

For example, this input:

```javascript
const message = `Hello ${name}`;
```

is transformed into output in this shape:

```javascript
const message = "Hello ".concat(name);
```

In `7.27.1`, the plugin implementation uses `.concat(...)` so it can preserve template-literal primitive-conversion behavior more closely than a loose `+` rewrite.

## Use `loose` for `+` concatenation

Set `loose: true` when you want Babel to emit `+` expressions for untagged template literals:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-template-literals",
      {
        "loose": true
      }
    ]
  ]
}
```

With that option, code like this:

```javascript
const message = `Hello ${name}`;
```

is transformed into output in this shape:

```javascript
const message = "Hello " + name;
```

Use this only when `+` concatenation is acceptable for your code. In `7.27.1`, `loose` also enables the plugin's looser tagged-template helper behavior unless you override it with top-level Babel assumptions.

## Prefer Babel `assumptions` when you need precise control

In `7.27.1`, this plugin reads Babel's top-level `assumptions.ignoreToPrimitiveHint` and `assumptions.mutableTemplateObject` settings first, then falls back to the plugin's `loose` option.

Use assumptions when you want to control these behaviors explicitly:

```json
{
  "assumptions": {
    "ignoreToPrimitiveHint": true,
    "mutableTemplateObject": false
  },
  "plugins": ["@babel/plugin-transform-template-literals"]
}
```

- `ignoreToPrimitiveHint: true` tells the plugin to use `+` concatenation for untagged templates
- `mutableTemplateObject: true` tells the plugin to use Babel's loose tagged-template helper
- if an assumption is set, it takes precedence over `loose`

This matters when you want `+` concatenation without also opting into a mutable tagged-template object, or when you need the opposite combination.

## Control tagged template object mutability

For tagged template literals, Babel generates a cached template object and passes it to the tag function.

With the default behavior, Babel uses a helper in this shape:

```javascript
function _taggedTemplateLiteral(strings, raw) {
  if (!raw) raw = strings.slice(0);
  return Object.freeze(
    Object.defineProperties(strings, {
      raw: { value: Object.freeze(raw) }
    })
  );
}
```

That helper freezes both the template array and its `.raw` array.

If you set `assumptions.mutableTemplateObject: true`:

```json
{
  "assumptions": {
    "mutableTemplateObject": true
  },
  "plugins": ["@babel/plugin-transform-template-literals"]
}
```

the plugin switches to Babel's loose helper shape instead:

```javascript
function _taggedTemplateLiteralLoose(strings, raw) {
  if (!raw) raw = strings.slice(0);
  strings.raw = raw;
  return strings;
}
```

Use the default helper when your tag relies on spec-like frozen template objects. Use the mutable helper only when you explicitly want the looser behavior.

## Common build setup

```json
{
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.27.1",
    "@babel/core": "^7.27.1",
    "@babel/plugin-transform-template-literals": "^7.27.1"
  }
}
```

With `babel.config.json`:

```json
{
  "plugins": ["@babel/plugin-transform-template-literals"]
}
```

## Important pitfalls

- Install `@babel/core` with the plugin; the plugin alone is not enough
- No environment variables or runtime initialization are required; this package only changes compiled output
- `loose: true` affects both plain template literal concatenation and tagged-template helper selection unless top-level assumptions override it
- If your tag expects spec-like frozen template objects, do not enable `mutableTemplateObject: true`
- If coercion details matter for interpolated values, prefer the default transform instead of `ignoreToPrimitiveHint: true` or `loose: true`
- This plugin only rewrites template literal syntax; it does not polyfill missing built-in APIs or transpile unrelated syntax

## Version-sensitive notes

- This guide targets `@babel/plugin-transform-template-literals@7.27.1`
- The published package exposes a `loose` plugin option and reads the top-level Babel assumptions `ignoreToPrimitiveHint` and `mutableTemplateObject`
- In `7.27.1`, assumptions take precedence over `loose` in the plugin implementation
- The published package declares `@babel/core` peer compatibility as `^7.0.0-0`
- The published package declares `node >= 6.9.0` in `engines`, but your effective support matrix still depends on the rest of your Babel toolchain
