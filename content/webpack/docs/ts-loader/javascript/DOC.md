---
name: ts-loader
description: "Webpack loader that compiles TypeScript with your project's tsconfig.json"
metadata:
  languages: "javascript"
  versions: "9.5.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,typescript,loader,build,javascript"
---

# ts-loader

`ts-loader` runs the TypeScript compiler inside webpack. It uses your local `typescript` installation and the project's `tsconfig.json`, then hands the transpiled output back to webpack for bundling.

`ts-loader@9.5.4` is build-time configuration only: there is no auth flow, no runtime client to initialize, and no package-specific environment variables.

## Install

Install `ts-loader` in the same project as webpack and TypeScript:

```bash
npm install --save-dev webpack webpack-cli typescript ts-loader
```

Typical scripts:

```json
{
  "scripts": {
    "build": "webpack",
    "watch": "webpack --watch"
  }
}
```

## Minimal setup

`ts-loader` looks for `tsconfig.json` by default.

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "strict": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

`src/index.ts`:

```typescript
const message: string = "Hello from ts-loader";

document.body.textContent = message;
```

`webpack.config.js`:

```javascript
const path = require("node:path");

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
        use: "ts-loader",
      },
    ],
  },
  devtool: "inline-source-map",
};
```

Build the bundle:

```bash
npm run build
npm run watch
```

## Use a different `tsconfig`

Point the loader at a dedicated build config when webpack should not use the default `tsconfig.json`.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.webpack.json",
          },
        },
      },
    ],
  },
};
```

Use this when your repo has separate configs for tests, editors, and bundling.

## Faster builds with `transpileOnly`

`transpileOnly: true` skips full type checking inside the loader and only transpiles each file. Pair it with `fork-ts-checker-webpack-plugin` if you still want TypeScript diagnostics during webpack builds.

```bash
npm install --save-dev fork-ts-checker-webpack-plugin
```

```javascript
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
};
```

Keep `transpileOnly` off when the webpack build itself must perform normal TypeScript checking and declaration-file emission.

## Source maps

Enable source maps in both TypeScript and webpack:

```json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

```javascript
module.exports = {
  devtool: "inline-source-map",
};
```

`compilerOptions.sourceMap` controls TypeScript emit. webpack's `devtool` controls how the final bundle exposes those maps.

## TypeScript path aliases

webpack does not automatically read `compilerOptions.paths`. If your `tsconfig.json` uses path aliases, add `tsconfig-paths-webpack-plugin` to webpack resolution.

```bash
npm install --save-dev tsconfig-paths-webpack-plugin
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"]
    }
  }
}
```

`webpack.config.js`:

```javascript
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    plugins: [new TsconfigPathsPlugin()],
  },
};
```

## ESM-style import specifiers

If your TypeScript source uses fully qualified `.js`, `.mjs`, or `.cjs` import specifiers, map them back to TypeScript source files with webpack's `resolve.extensionAlias`.

```javascript
module.exports = {
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".mts", ".cts"],
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".mjs": [".mjs", ".mts"],
      ".cjs": [".cjs", ".cts"],
    },
  },
};
```

This is useful for projects that keep ESM-compatible import specifiers in source code while authoring in TypeScript.

## Declaration files

If the webpack build should also emit `.d.ts` files, enable declaration output in `tsconfig.json` and keep `transpileOnly` disabled.

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

## Common pitfalls

- Install `typescript` locally. `ts-loader` relies on your project's TypeScript compiler.
- Keep `resolve.extensions` aligned with the file types you compile, especially when mixing `.ts`, `.tsx`, `.mts`, or `.cts` files.
- `transpileOnly: true` improves build speed, but it skips loader-level type checking and declaration-file generation.
- If TypeScript path aliases work in your editor but fail in webpack, add `TsconfigPathsPlugin`.
- Source maps need both `compilerOptions.sourceMap` and a webpack `devtool` setting.
