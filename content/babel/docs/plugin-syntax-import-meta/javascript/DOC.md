---
name: plugin-syntax-import-meta
description: "Enable Babel to parse import.meta syntax without transforming the output"
metadata:
  languages: "javascript"
  versions: "7.10.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,import-meta,syntax"
---

# @babel/plugin-syntax-import-meta

`@babel/plugin-syntax-import-meta` is a syntax-only Babel plugin. It lets Babel parse `import.meta` in ES module code.

It does **not** rewrite `import.meta`, inject runtime helpers, or make CommonJS output understand the feature. Use it when Babel itself needs to read files that contain `import.meta` and you want that syntax preserved for a later runtime or build step.

## Install

Install the plugin with Babel core. Add `@babel/cli` if you run Babel from the command line.

```bash
npm install --save-dev @babel/core @babel/plugin-syntax-import-meta
```

```bash
yarn add --dev @babel/core @babel/plugin-syntax-import-meta
```

Optional CLI dependency:

```bash
npm install --save-dev @babel/cli
```

No environment variables, credentials, or runtime client setup are required.

## Enable the plugin in Babel config

Add the plugin name to your Babel config:

```json
{
  "plugins": ["@babel/plugin-syntax-import-meta"]
}
```

In `7.10.4`, this package does not expose user-facing plugin options. Its implementation only enables Babel's `importMeta` parser plugin.

## Parse `import.meta` from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-syntax-import-meta
```

Compile a single module file:

```bash
npx babel src/main.js --out-file lib/main.js --plugins @babel/plugin-syntax-import-meta
```

This makes Babel accept `import.meta`, but the emitted code still contains `import.meta`.

## Use it from JavaScript

`import.meta` is an ES module feature, so set `sourceType: "module"` when you transform source strings programmatically.

```javascript
import { transformSync } from "@babel/core";

const source = `
console.log(import.meta.url);
const workerUrl = new URL("./worker.js", import.meta.url);
`;

const result = transformSync(source, {
  filename: "src/main.js",
  sourceType: "module",
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-syntax-import-meta"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With this plugin alone, Babel parses the file and preserves the `import.meta` expressions in the generated code.

## Common build setup

`package.json`:

```json
{
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.10.4",
    "@babel/core": "^7.10.4",
    "@babel/plugin-syntax-import-meta": "^7.10.4"
  }
}
```

`babel.config.json`:

```json
{
  "plugins": ["@babel/plugin-syntax-import-meta"]
}
```

## Important pitfalls

- This plugin only changes parsing. It does not transform `import.meta` for older runtimes.
- Keep the file in ES module mode. `import.meta` is not valid in script-mode input.
- A Babel build can succeed with this plugin while the output still fails in environments that do not support `import.meta`.
- Install `@babel/core` alongside the plugin; the published package declares Babel core as a peer dependency.
- There are no plugin-specific options in `7.10.4`, so transform behavior must come from the rest of your toolchain.

## Version-sensitive notes

- This guide targets `@babel/plugin-syntax-import-meta@7.10.4`.
- The published `7.10.4` package declares `@babel/core` peer compatibility as `^7.0.0-0`.
- In `7.10.4`, the plugin implementation asserts Babel 7 and adds `"importMeta"` to Babel's parser plugins.
- The published package description for `7.10.4` is `Allow parsing of import.meta`.

## Official sources

- Babel docs: https://babeljs.io/docs/en/next/babel-plugin-syntax-import-meta.html
- npm package page: https://www.npmjs.com/package/@babel/plugin-syntax-import-meta
- Babel source package: https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-import-meta
