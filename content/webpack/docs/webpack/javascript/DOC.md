---
name: webpack
description: "JavaScript guide for configuring and running webpack 5 builds, including local CLI setup, the Node API, watch mode, and common pitfalls."
metadata:
  languages: "javascript"
  versions: "5.105.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,webpack-cli,bundler,build,javascript,node-api"
---

# webpack for JavaScript

`webpack` is the core bundler package. For normal command-line use, install `webpack-cli` alongside it. The `webpack` package publishes the compiler, the Node API, built-in plugins such as `DefinePlugin`, and a `webpack` binary that hands off to `webpack-cli` when the CLI package is installed.

There is no authentication step and no package-specific environment variable to set.

## Prerequisites

- Node.js. The `webpack` package declares `>=10.13.0`, but use a current Node LTS for modern webpack tooling.
- `webpack@5.105.4`
- `webpack-cli` for command-line builds

## Install

Most projects should install both packages locally:

```bash
npm install --save-dev webpack webpack-cli
```

If you only run webpack through the Node API, `webpack` is the required package and `webpack-cli` is optional.

## Minimal project setup

Add build scripts in `package.json`:

```json
{
  "scripts": {
    "build": "webpack --config webpack.config.js --mode production",
    "watch": "webpack --config webpack.config.js --watch --mode development"
  }
}
```

Create `webpack.config.js`:

```javascript
const path = require("node:path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
```

`output.path` should be an absolute filesystem path, which is why the config uses `path.resolve(...)`.

Create a matching entry file:

```javascript
// src/index.js
console.log("webpack build is running");
```

Run the build:

```bash
npm run build
```

## Run from the CLI

With `webpack-cli` installed locally, these commands use your project config:

```bash
# Production build
npx webpack --config webpack.config.js --mode production

# Rebuild on file changes
npx webpack --config webpack.config.js --watch --mode development
```

The `webpack` package ships the `webpack` executable, but that executable delegates real CLI work to `webpack-cli`. If `webpack-cli` is missing, the binary prompts to install it.

## Use the Node API

The `webpack` module itself exports the compiler factory. Pass one config object to get a `Compiler`, then call `run` and `close`.

```javascript
const path = require("node:path");
const webpack = require("webpack");

const config = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};

const compiler = webpack(config);

compiler.run((error, stats) => {
  if (error) {
    console.error(error);
  } else if (stats) {
    console.log(
      stats.toString({
        colors: true,
        modules: false,
        chunks: false,
      }),
    );
  }

  compiler.close((closeError) => {
    if (closeError) {
      console.error(closeError);
      process.exitCode = 1;
    }
  });
});
```

If you pass an array of configs instead of one config object, `webpack(...)` returns a `MultiCompiler`.

## Watch from Node

Use `compiler.watch(...)` when your app or dev server should manage rebuilds directly.

```javascript
const path = require("node:path");
const webpack = require("webpack");

const config = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};

const compiler = webpack(config);

const watching = compiler.watch({ aggregateTimeout: 300 }, (error, stats) => {
  if (error) {
    console.error(error);
    return;
  }

  if (stats) {
    console.log(stats.toString({ colors: true, modules: false, chunks: false }));
  }
});

process.on("SIGINT", () => {
  watching.close((closeError) => {
    if (closeError) {
      console.error(closeError);
      process.exitCode = 1;
    }

    process.exit();
  });
});
```

The watch handle also exposes `invalidate()` if you need to trigger another rebuild programmatically.

## Use built-in plugins from `webpack`

Plugin constructors are exported from the same package. For example, use `DefinePlugin` to replace compile-time constants:

```javascript
const path = require("node:path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      __BUILD_TARGET__: JSON.stringify("web"),
      __FEATURE_FLAG__: JSON.stringify(process.env.FEATURE_FLAG ?? "off"),
    }),
  ],
};
```

This is ordinary Node configuration code. `FEATURE_FLAG` is an application environment variable in this example, not a webpack-specific one.

## Important pitfalls

- Install `webpack-cli` for CLI-driven builds. The `webpack` package's `webpack` binary forwards to it rather than replacing it.
- Use an absolute `output.path`.
- When you use the Node API, call `compiler.close(...)` after `run(...)` finishes.
- When you use watch mode from Node, keep the returned `Watching` handle and call `watching.close(...)` during shutdown.
- For browser targets that rely on `import()` or `require.ensure()` in older browsers, load a `Promise` polyfill before your bundle.

## Version notes

- This guide targets `webpack@5.105.4`.
- The webpack 5 package publishes its own Node API and built-in plugin constructors from the `webpack` module.
- Command-line workflows in current projects still pair `webpack` with `webpack-cli`.

## Official sources

- https://www.npmjs.com/package/webpack
- https://github.com/webpack/webpack
- https://webpack.js.org/guides/getting-started/
- https://webpack.js.org/concepts/
- https://webpack.js.org/api/node/
- https://webpack.js.org/configuration/output/
- https://webpack.js.org/plugins/define-plugin/
