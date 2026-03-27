---
name: fork-ts-checker-webpack-plugin
description: "JavaScript guide for using fork-ts-checker-webpack-plugin 9.1.0 with webpack and TypeScript, including ts-loader, Babel, blocking CI checks, and common configuration pitfalls."
metadata:
  languages: "javascript"
  versions: "9.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,typescript,build,plugin,type-checking,javascript"
---

# fork-ts-checker-webpack-plugin

`fork-ts-checker-webpack-plugin` runs TypeScript type checking in a separate process during webpack builds. Use it with a transpiler such as `ts-loader` or `babel-loader`; the plugin reports type errors, but it does not replace your loader and it does not emit JavaScript by itself.

There are no API keys, runtime environment variables, or client objects to initialize. All setup happens in `webpack.config.js` and `tsconfig.json`.

## Golden Rule

If you use `ts-loader`, set `transpileOnly: true` and let `fork-ts-checker-webpack-plugin` handle type checking. Otherwise you pay for TypeScript checking twice and builds get slower with little benefit.

If you transpile TypeScript with Babel, keep a real `tsconfig.json` in the project anyway. The plugin reads TypeScript configuration from that file when it runs checks.

## Install

Typical `ts-loader` setup:

```bash
npm install --save-dev webpack webpack-cli typescript ts-loader fork-ts-checker-webpack-plugin
```

If you transpile TypeScript with Babel instead of `ts-loader`:

```bash
npm install --save-dev webpack webpack-cli typescript babel-loader @babel/core @babel/preset-env @babel/preset-typescript fork-ts-checker-webpack-plugin
```

## Minimal `tsconfig.json`

The plugin checks whatever TypeScript sees through `files`, `include`, `exclude`, and project references. Start with a normal project config:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

If a file is not included by TypeScript, the plugin will not check it.

## Basic Webpack Setup With `ts-loader`

`webpack.config.js`:

```js
const path = require("node:path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
};
```

Add a simple build script:

```json
{
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "watch": "webpack --watch --config webpack.config.js"
  }
}
```

Then run:

```bash
npm run build
```

## Use With Babel

When Babel handles transpilation, `fork-ts-checker-webpack-plugin` supplies type checking that Babel does not do.

`babel.config.json`:

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
    ],
    "@babel/preset-typescript"
  ]
}
```

`webpack.config.js`:

```js
const path = require("node:path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
};
```

This is a common pattern when webpack should emit code through Babel but TypeScript should still enforce types.

## Choose A Different TypeScript Config

If webpack should use a dedicated config file, point the plugin at it explicitly:

```js
const path = require("node:path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, "tsconfig.webpack.json"),
      },
    }),
  ],
};
```

Use this when your repo has multiple `tsconfig` files or when bundling needs different compiler options than tests or editor tooling.

## Block The Build On Type Errors

In watch mode and local development, teams often prefer faster feedback even if errors arrive asynchronously. In CI or production builds, set `async: false` so webpack waits for the checker result:

```js
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
  ],
};
```

Use this for release builds where a type error must fail the command before artifacts are considered done.

## Large Repos And Project References

For larger codebases, the plugin exposes TypeScript-specific options under `typescript`.

Raise the checker worker memory limit if large builds hit memory pressure:

```js
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        memoryLimit: 4096,
      },
    }),
  ],
};
```

If your repo uses TypeScript project references, enable build mode so the checker follows the referenced projects:

```js
const path = require("node:path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        build: true,
        configFile: path.resolve(__dirname, "tsconfig.json"),
      },
    }),
  ],
};
```

## Common Pitfalls

- Keep `ts-loader` in `transpileOnly: true` mode when the plugin is enabled, or TypeScript checking runs twice.
- Make sure every source file is covered by `tsconfig.json` `include`, `files`, or project references. Missing files produce missing diagnostics.
- If webpack uses path aliases, mirror them in TypeScript with `compilerOptions.baseUrl` and `compilerOptions.paths`. The checker follows TypeScript resolution, not webpack-only aliases.
- When Babel transpiles TypeScript, remember that Babel removes types but does not type-check them. The plugin still needs a valid local `typescript` dependency and `tsconfig.json`.
- This plugin reports problems during webpack builds; it is not a replacement for ESLint, unit tests, or declaration publishing workflows.

## Minimal Alias Example

If your webpack config resolves `@app/*`, mirror that in `tsconfig.json` so the checker agrees with webpack:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

Without matching TypeScript path mapping, webpack may bundle successfully while the checker still reports unresolved imports.

## Useful Links

- Maintainer docs: `https://github.com/TypeStrong/fork-ts-checker-webpack-plugin`
- npm package: `https://www.npmjs.com/package/fork-ts-checker-webpack-plugin`
