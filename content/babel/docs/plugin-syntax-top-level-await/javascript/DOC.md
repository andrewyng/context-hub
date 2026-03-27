---
name: plugin-syntax-top-level-await
description: "Enable Babel to parse top-level await in ECMAScript modules without transforming the output"
metadata:
  languages: "javascript"
  versions: "7.14.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,esm,syntax,top-level-await"
---

# @babel/plugin-syntax-top-level-await

`@babel/plugin-syntax-top-level-await` is a syntax-only Babel plugin. It lets Babel parse top-level `await` in module code.

It does **not** transform top-level `await` into another pattern or make older runtimes support it. Use it when your output stays as modern ESM, or when another tool in your build pipeline handles later transforms.

No environment variables, authentication, or runtime client initialization are required.

## Install

Install the plugin with Babel core. Add `@babel/cli` if you run Babel from the command line.

```bash
npm install --save-dev @babel/core @babel/plugin-syntax-top-level-await
```

```bash
yarn add --dev @babel/core @babel/plugin-syntax-top-level-await
```

Optional CLI dependency:

```bash
npm install --save-dev @babel/cli
```

The published `7.14.5` package declares `@babel/core` as a peer dependency.

## Enable the plugin in Babel config

Add the plugin to your Babel config and keep the file in module mode when you use top-level `await`:

```json
{
  "sourceType": "module",
  "plugins": ["@babel/plugin-syntax-top-level-await"]
}
```

In `7.14.5`, this package does not expose user-facing plugin options. Its implementation only asserts Babel 7 and adds the `topLevelAwait` parser plugin.

## Parse a module that uses top-level `await`

Compile an ESM file from the CLI:

```bash
npx babel src/index.mjs --out-file dist/index.mjs --plugins @babel/plugin-syntax-top-level-await
```

Example input:

```javascript
const response = await fetch("https://example.com/data.json");
const payload = await response.json();

export default payload;
```

With this plugin alone, Babel accepts the syntax and emits code that still contains top-level `await`.

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const result = transformSync(
  `
const response = await fetch("https://example.com/data.json");
export const payload = await response.json();
`,
  {
    filename: "src/index.mjs",
    configFile: false,
    babelrc: false,
    sourceType: "module",
    plugins: ["@babel/plugin-syntax-top-level-await"],
  },
);

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

Expected output shape:

```javascript
const response = await fetch("https://example.com/data.json");
export const payload = await response.json();
```

The output stays effectively unchanged because this plugin only enables parsing.

## Common build setup

Use this plugin when your project already ships ESM and the runtime supports top-level `await`:

`package.json`:

```json
{
  "type": "module",
  "scripts": {
    "build": "babel src --out-dir dist"
  },
  "devDependencies": {
    "@babel/cli": "^7.14.5",
    "@babel/core": "^7.14.5",
    "@babel/plugin-syntax-top-level-await": "^7.14.5"
  }
}
```

`babel.config.json`:

```json
{
  "sourceType": "module",
  "plugins": ["@babel/plugin-syntax-top-level-await"]
}
```

## When this plugin is the right tool

Use `@babel/plugin-syntax-top-level-await` when:

- your final JavaScript stays as modern ESM
- another compiler or bundler step handles later transforms
- you need Babel to parse files with top-level `await` before your own Babel plugins run

If you need Babel to rewrite other modern syntax too, add the corresponding transform plugins or presets separately. This syntax plugin does not replace them.

## Important pitfalls

- This plugin only affects parsing. It does not convert top-level `await` into syntax that works in older runtimes.
- Top-level `await` is module syntax. Use module files such as `.mjs` or configure Babel with `"sourceType": "module"` for the files that need it.
- Install `@babel/core` alongside the plugin. The package is not a standalone compiler.
- There are no plugin-specific options in `7.14.5`, so configuration belongs in Babel's normal file-level settings such as `sourceType`.
- Successful Babel output does not guarantee runtime support. The generated code can still fail in environments that do not support top-level `await` in ESM.

## Version-sensitive notes

- This guide targets `@babel/plugin-syntax-top-level-await@7.14.5`.
- The published package description for `7.14.5` is `Allow parsing of top-level await in modules`.
- The published `7.14.5` package declares `@babel/core` peer compatibility as `^7.0.0-0`.
- In `7.14.5`, the plugin implementation asserts Babel 7 and adds `"topLevelAwait"` to Babel's parser plugins.

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-syntax-top-level-await
- npm package page: https://www.npmjs.com/package/@babel/plugin-syntax-top-level-await
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-syntax-top-level-await
