---
name: plugin-transform-classes
description: "Babel plugin for compiling ES2015 classes to ES5-compatible constructor and prototype code"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,classes,inheritance"
---

# @babel/plugin-transform-classes

`@babel/plugin-transform-classes` compiles ES2015 class syntax into constructor functions and helper-based prototype code during Babel builds. In Babel `7.28.6`, it covers class declarations, class expressions, inheritance, `super(...)`, instance methods, static methods, getters, and setters. It is a build-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-classes
```

If you run Babel from the command line, add the CLI too:

```bash
npm install --save-dev @babel/cli
```

The plugin declares `@babel/core` as a peer dependency, so installing the plugin by itself is not enough.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-classes"]
}
```

With the default configuration, Babel emits helper-based class code such as `_classCallCheck`, `_inherits`, and `_createClass` when the source needs them.

## Run it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-classes
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-classes
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a script, build step, or test helper:

```javascript
import { transformSync } from "@babel/core";

const source = `
class Counter {
  increment(step) {
    return step + 1;
  }
}
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-classes"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

In Babel `7.28.6`, the generated output is shaped like this:

```javascript
let Counter = /*#__PURE__*/function () {
  function Counter() {
    _classCallCheck(this, Counter);
  }
  return _createClass(Counter, [{
    key: "increment",
    value: function increment(step) {
      return step + 1;
    }
  }]);
}();
```

## Use `loose` for simpler method output

By default, Babel defines class methods through the `_createClass` helper. Set `loose: true` when you want assignment-style output instead:

```json
{
  "plugins": [["@babel/plugin-transform-classes", { "loose": true }]]
}
```

Programmatic usage:

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("class Counter { increment(step) { return step + 1; } }", {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-transform-classes", { loose: true }]],
});
```

In Babel `7.28.6`, `loose: true` changes the emitted shape to direct assignments:

```javascript
let Counter = /*#__PURE__*/function () {
  function Counter() {}
  var _proto = Counter.prototype;
  _proto.increment = function increment(step) {
    return step + 1;
  };
  return Counter;
}();
```

This also changes other class-related assumptions Babel falls back to in this plugin, including skipping `classCallCheck` and using looser `super` handling.

## Prefer top-level Babel assumptions for whole-build behavior

In Babel `7.28.6`, this plugin reads four top-level assumptions:

- `setClassMethods`
- `constantSuper`
- `superIsCallableConstructor`
- `noClassCalls`

Configure them once at the top level when you want class transforms across the build to share the same behavior:

```json
{
  "assumptions": {
    "setClassMethods": true,
    "constantSuper": true,
    "superIsCallableConstructor": true,
    "noClassCalls": true
  },
  "plugins": ["@babel/plugin-transform-classes"]
}
```

These assumptions map directly to the code generation paths in `@babel/plugin-transform-classes`:

- `setClassMethods` emits direct method assignments such as `Ctor.prototype.run = function run() {}`
- `noClassCalls` skips Babel's generated `classCallCheck(this, Ctor)` guard
- `superIsCallableConstructor` emits `Super.call(...)` / `Super.apply(...)` style constructor calls instead of the `_callSuper(...)` helper path
- `constantSuper` tells Babel's `super` replacement logic to treat the superclass reference as stable

Use either top-level assumptions or `loose: true` deliberately. They change generated behavior, not just formatting.

## Subclass built-ins like `Error`

When a class extends an unshadowed global built-in such as `Error`, `Array`, or `HTMLElement`, Babel wraps the superclass with `wrapNativeSuper(...)` and emits helper-based constructor code.

Source:

```javascript
class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = "AppError";
  }
}
```

Output shape in Babel `7.28.6`:

```javascript
let AppError = /*#__PURE__*/function (_Error) {
  function AppError(message) {
    var _this;
    _classCallCheck(this, AppError);
    _this = _callSuper(this, AppError, [message]);
    _this.name = "AppError";
    return _this;
  }
  _inherits(AppError, _Error);
  return _createClass(AppError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
```

This plugin only rewrites syntax. It does not add global polyfills. If your runtime lacks the features Babel's helpers rely on, such as correct `Reflect.construct` behavior for native subclassing, handle that at the runtime or polyfill layer.

## Use `@babel/preset-env` for target-based builds

If your goal is general environment compatibility, prefer `@babel/preset-env` and set targets there instead of listing this plugin manually:

```bash
npm install --save-dev @babel/core @babel/preset-env
```

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "18"
        }
      }
    ]
  ]
}
```

In the Babel `7.28.6` package set, `@babel/preset-env` includes `transform-classes` in its available plugin set. Add `@babel/plugin-transform-classes` directly when you need to force class rewriting or control class-specific options such as `loose`.

## Important pitfalls

- This plugin does not transform class fields or private class properties. If Babel throws `Missing class properties transform.`, add the relevant class-features transform for those files.
- If methods use decorators, load the decorator plugin before `@babel/plugin-transform-classes`; otherwise Babel throws during compilation.
- `loose: true` and the equivalent top-level assumptions change emitted semantics. Use them only when you want looser class output across the build.
- This plugin changes syntax only. It does not inject polyfills for runtime APIs or browser features.
- If you already use `@babel/preset-env`, adding this plugin manually is usually redundant unless you need its explicit options.
