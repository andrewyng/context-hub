---
name: helper-plugin-utils
description: "Wrap Babel plugins and presets with a stable builder API, version checks, and normalized options handling"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,plugin,preset,ast,javascript"
---

# @babel/helper-plugin-utils

`@babel/helper-plugin-utils` is a small package for Babel plugin and preset authors. It exports `declare` and `declarePreset`, which wrap your builder function so Babel passes a consistent `api`, a defaulted `options` object, and the current `dirname`.

Use it when you are publishing a custom Babel plugin or preset. It has no CLI, no environment variables, and no authentication setup.

## Install

Install the helper alongside `@babel/core`.

```bash
npm install --save-dev @babel/core @babel/helper-plugin-utils
```

If you are authoring a preset that re-exports Babel plugins, install those packages too:

```bash
npm install --save-dev @babel/core @babel/helper-plugin-utils @babel/plugin-transform-arrow-functions
```

Keep `@babel/core` and Babel helper packages on the same version family when possible.

## Create a plugin with `declare`

This is the common pattern for Babel plugins:

```javascript
import { declare } from "@babel/helper-plugin-utils";

export default declare((api, options, dirname) => {
  api.assertVersion(7);

  const { replace = "production" } = options;

  return {
    name: "replace-dev-constant",
    visitor: {
      Identifier(path) {
        if (path.node.name !== "__BUILD_TARGET__") return;
        path.replaceWithSourceString(JSON.stringify(replace));
      },
    },
  };
});
```

What the wrapper gives you:

- `api.assertVersion(...)` for an explicit `@babel/core` compatibility check
- `options` defaulted to `{}` when Babel does not pass plugin options
- `dirname` as the third argument when you need to resolve local files

## Use the plugin from Babel

Pass the wrapped plugin function to Babel like any other plugin:

```javascript
import { transformSync } from "@babel/core";
import replaceDevConstant from "./replace-dev-constant.js";

const result = transformSync("const target = __BUILD_TARGET__;", {
  configFile: false,
  babelrc: false,
  plugins: [[replaceDevConstant, { replace: "staging" }]],
});

console.log(result.code);
```

You can also reference it from a Babel config file:

```javascript
module.exports = {
  plugins: [["./replace-dev-constant.js", { replace: "staging" }]],
};
```

## Create a preset with `declarePreset`

`declarePreset` is the same wrapper, but it is intended for presets that return a Babel preset object.

```javascript
import { declarePreset } from "@babel/helper-plugin-utils";
import transformArrowFunctions from "@babel/plugin-transform-arrow-functions";

export default declarePreset((api, options) => {
  api.assertVersion(7);

  const { enableArrowTransform = true } = options;

  return {
    plugins: [enableArrowTransform && transformArrowFunctions].filter(Boolean),
  };
});
```

If your preset needs to resolve files relative to itself, use the third `dirname` argument:

```javascript
import path from "node:path";
import { declarePreset } from "@babel/helper-plugin-utils";

export default declarePreset((api, options, dirname) => {
  api.assertVersion(7);

  return {
    plugins: [path.resolve(dirname, "./plugins/my-plugin.js")],
  };
});
```

## Common API patterns

### Require a specific Babel major

`assertVersion` accepts an integer or a semver range string.

```javascript
import { declare } from "@babel/helper-plugin-utils";

export default declare((api) => {
  api.assertVersion("^7.0.0-0 || ^8.0.0-0");

  return {
    name: "my-plugin",
    visitor: {},
  };
});
```

Use an integer when you only need a major check:

```javascript
api.assertVersion(7);
```

### Read options safely

The helper passes `options || {}` to your builder, so destructuring is safe even when the plugin is used without options.

```javascript
import { declare } from "@babel/helper-plugin-utils";

export default declare((api, options) => {
  api.assertVersion(7);

  const { loose = false } = options;

  return {
    name: "my-plugin",
    visitor: {},
  };
});
```

## Important notes

- Use this package for authoring Babel plugins and presets, not for transforming code by itself.
- Call `api.assertVersion(...)` near the top of your builder so version mismatches fail early and clearly.
- `declarePreset` is an alias of `declare`; use it when exporting a preset because the intent is clearer.
- The helper normalizes several Babel API methods when an older `@babel/core` instance does not provide them. In that fallback path, `targets()` returns `{}`, `assumption()` returns `undefined`, and `addExternalDependency()` is a no-op.
- If Babel loads an unsupported core version, the helper throws an error with code `BABEL_VERSION_UNSUPPORTED`.
- There are no package-specific environment variables, credentials, or runtime initialization steps.
