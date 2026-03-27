---
name: plugin-transform-export-namespace-from
description: "Babel plugin for compiling export namespace re-exports during JavaScript builds"
metadata:
  languages: "javascript"
  versions: "7.27.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,transpile,esm,exports"
---

# @babel/plugin-transform-export-namespace-from

`@babel/plugin-transform-export-namespace-from` rewrites namespace re-exports such as `export * as utils from "./utils.js";` during Babel compilation. It is a build-time transform only: there are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-export-namespace-from
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli
```

The plugin declares `@babel/core` as a peer dependency, so install both packages.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-export-namespace-from"]
}
```

This enables parsing for `export * as name from "module"` and rewrites that syntax to standard `import` plus `export` statements.

## Run it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-export-namespace-from
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-export-namespace-from
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a script, build tool, or test helper:

```javascript
import { transformSync } from "@babel/core";

const source = `
export * as utils from "./utils.js";
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-export-namespace-from"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

The generated output looks like this:

```javascript
import * as _utils from "./utils.js";
export { _utils as utils };
```

## Common workflow: also convert ES modules

This plugin only rewrites export-namespace syntax. The output still uses ES module `import` and `export` statements.

If your build also needs CommonJS output, add a module transform such as `@babel/plugin-transform-modules-commonjs`:

```bash
npm install --save-dev @babel/plugin-transform-modules-commonjs
```

```json
{
  "plugins": [
    "@babel/plugin-transform-export-namespace-from",
    "@babel/plugin-transform-modules-commonjs"
  ]
}
```

Or let `@babel/preset-env` manage it for you:

```bash
npm install --save-dev @babel/preset-env
```

```json
{
  "presets": [["@babel/preset-env", { "modules": "commonjs" }]]
}
```

When `@babel/preset-env` is already selecting transforms for your targets, prefer the preset rather than adding this plugin separately unless you need to force the transform.

## Plugin options

`@babel/plugin-transform-export-namespace-from` does not expose plugin-specific configuration options in `7.27.1`. Configuration is just enabling the plugin.

## Important pitfalls

- Install `@babel/core` with the plugin; the plugin alone is not enough
- This plugin handles `export * as name from "module"`; it does not transform unrelated module syntax or built-in APIs
- The transformed output is still ESM, so add a module transform or `@babel/preset-env` if your target environment does not support ES modules
- If `@babel/preset-env` already covers your target environments, let the preset include this transform automatically instead of duplicating configuration
- This plugin is syntax-focused and build-time only; there are no runtime imports, environment variables, or initialization steps to wire up in application code
