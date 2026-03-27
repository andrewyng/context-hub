---
name: plugin-syntax-dynamic-import
description: "Enable Babel to parse import() syntax without transforming or polyfilling it"
metadata:
  languages: "javascript"
  versions: "7.8.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,dynamic-import,syntax"
---

# @babel/plugin-syntax-dynamic-import

`@babel/plugin-syntax-dynamic-import` is a syntax-only Babel plugin. It lets Babel parse `import()` expressions and leaves them unchanged in the generated output.

Use it when your bundler or runtime should handle dynamic imports at runtime. It does **not** rewrite `import()` to `require()`, load split chunks by itself, or add any polyfills.

For projects already on `@babel/core@7.8.0` or newer, Babel enables dynamic import parsing by default. In that setup, this plugin is usually unnecessary unless you keep it for an explicit, self-documenting plugin list.

## Install

Install the plugin with Babel core. Add `@babel/cli` if you run Babel from the command line.

```bash
npm install --save-dev @babel/core @babel/plugin-syntax-dynamic-import
```

```bash
npm install --save-dev @babel/cli
```

No environment variables, credentials, or runtime client initialization are required.

## Enable the plugin in Babel config

Add the plugin name to `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-syntax-dynamic-import"]
}
```

The published docs for this package do not document any plugin-specific options for `7.8.3`.

If your project uses `@babel/core@7.8.0` or newer, Babel's own docs say you can safely remove this plugin because dynamic import parsing is built in.

## Parse `import()` from the CLI

Compile a single file:

```bash
npx babel src/load-widget.js --out-file lib/load-widget.js --plugins @babel/plugin-syntax-dynamic-import
```

Compile a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-syntax-dynamic-import
```

Example input:

```javascript
export async function loadWidget() {
  const widget = await import("./widget.js");
  return widget.default;
}
```

With this plugin alone, Babel accepts the file and keeps the `import()` call in the emitted code.

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const source = `
async function loadWidget() {
  const widget = await import("./widget.js");
  return widget.default;
}
`;

const result = transformSync(source, {
  filename: "src/load-widget.js",
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-syntax-dynamic-import"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

Expected output shape:

```javascript
async function loadWidget() {
  const widget = await import("./widget.js");
  return widget.default;
}
```

The important behavior is that Babel parses the syntax but does not transform it.

## Common bundler setup

This plugin is the right Babel-side setup when a bundler such as Webpack is responsible for code splitting and chunk loading.

`package.json`:

```json
{
  "scripts": {
    "build": "babel src --out-dir dist"
  },
  "devDependencies": {
    "@babel/cli": "^7.8.3",
    "@babel/core": "^7.8.3",
    "@babel/plugin-syntax-dynamic-import": "^7.8.3"
  }
}
```

`babel.config.json`:

```json
{
  "plugins": ["@babel/plugin-syntax-dynamic-import"]
}
```

If Babel must convert `import()` for non-bundler module targets such as CommonJS, AMD, or SystemJS, use `@babel/plugin-transform-dynamic-import` with the matching modules transform instead of this syntax plugin.

## Polyfills for older browser targets

Babel's docs note that bundlers such as Webpack rely on `Promise` internally for `import()`. If you target browsers that do not provide `Promise` and iterator support, add those polyfills explicitly.

One option is to import them before your app entry code:

```javascript
import "core-js/modules/es.promise";
import "core-js/modules/es.array.iterator";

document.querySelector("#load")?.addEventListener("click", async () => {
  const { default: renderWidget } = await import("./widget.js");
  renderWidget();
});
```

With Webpack, you can also add them in `entry`:

```javascript
module.exports = {
  entry: [
    "core-js/modules/es.promise",
    "core-js/modules/es.array.iterator",
    "./src/main.js",
  ],
};
```

This requirement is separate from Babel parsing. The syntax plugin does not add these polyfills automatically.

## Important pitfalls

- This plugin only enables parsing. It does not transform `import()` for older runtimes or module systems.
- Successful Babel output does not guarantee runtime support. Your final environment still needs native dynamic import support or a bundler/runtime that handles it.
- Install `@babel/core` alongside the plugin; the package is not a standalone compiler.
- If you use `@babel/core@7.8.0` or newer, this plugin is usually redundant.
- `@babel/preset-env` does not infer the `Promise` and iterator polyfills needed by bundler-based dynamic imports just because `import()` appears in your code.

## Version-sensitive notes

- This guide targets `@babel/plugin-syntax-dynamic-import@7.8.3`.
- Babel's docs for this package say it can be removed when you use `@babel/core@7.8.0` or later.
- Babel's docs also list this syntax under `@babel/preset-env` as part of ES2020 support.

## Official sources

- Babel docs: https://babel.dev/docs/babel-plugin-syntax-dynamic-import
- npm package page: https://www.npmjs.com/package/@babel/plugin-syntax-dynamic-import
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-syntax-dynamic-import
