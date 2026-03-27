---
name: dotenv-webpack
description: "JavaScript guide for using dotenv-webpack 9.0.0 to inject `.env` variables into webpack builds with safe mode, custom paths, and common pitfalls."
metadata:
  languages: "javascript"
  versions: "9.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,env,dotenv,defineplugin,javascript"
---

# dotenv-webpack

`dotenv-webpack` loads variables from a `.env` file and wires them into webpack through `DefinePlugin`, so matching references in your bundled source are replaced at build time.

There is no auth flow, runtime client, or separate CLI. All setup happens in your webpack config, and the values you reference are compiled into the bundle.

## Install

Install the plugin alongside webpack:

```bash
npm install --save-dev webpack webpack-cli dotenv-webpack
```

## Basic setup

Create a `.env` file at the project root:

```dotenv
API_BASE_URL=https://api.example.com/
FEATURE_FLAG=true
```

Add the plugin to `webpack.config.js`:

```js
const path = require("node:path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [new Dotenv()],
};
```

Use the variables in application code through direct property access:

```js
const apiBaseUrl = process.env.API_BASE_URL;
const featureEnabled = process.env.FEATURE_FLAG === "true";

console.log("API base URL:", apiBaseUrl);
console.log("Feature enabled:", featureEnabled);
```

Build with webpack:

```bash
npx webpack --config webpack.config.js --mode production
```

The plugin only exposes variables that are actually referenced in the compiled source.

## Load a different env file

Use `path` when your project keeps env files outside the default `./.env` location:

```js
const Dotenv = require("dotenv-webpack");

module.exports = {
  plugins: [
    new Dotenv({
      path: "./config/.env.production",
    }),
  ],
};
```

This is useful when your build selects a specific env file per environment.

## Fail the build when required keys are missing

Use `safe: true` to compare your real `.env` file against `.env.example`:

`.env.example`:

```dotenv
API_BASE_URL=
FEATURE_FLAG=
```

`webpack.config.js`:

```js
const Dotenv = require("dotenv-webpack");

module.exports = {
  plugins: [
    new Dotenv({
      safe: true,
      allowEmptyValues: false,
    }),
  ],
};
```

With that configuration, the build fails if a key listed in `.env.example` is missing from the loaded environment.

## Read values from the shell or CI

Use `systemvars: true` when CI or your shell exports variables directly into `process.env`:

```js
const Dotenv = require("dotenv-webpack");

module.exports = {
  plugins: [
    new Dotenv({
      systemvars: true,
    }),
  ],
};
```

Example build:

```bash
API_BASE_URL=https://staging.example.com/ npx webpack --mode production
```

This pattern is common when secrets or deployment-specific values should come from the environment instead of a committed `.env` file.

## Use a different prefix

By default, the plugin targets `process.env.` references. Use `prefix` if your codebase reads env values from a different namespace:

```js
const Dotenv = require("dotenv-webpack");

module.exports = {
  plugins: [
    new Dotenv({
      prefix: "import.meta.env.",
    }),
  ],
};
```

Then reference the variables with the same prefix in your source:

```js
const apiBaseUrl = import.meta.env.API_BASE_URL;
```

Keep the prefix and the source code aligned. `dotenv-webpack` only replaces references that match the configured prefix exactly.

## Important pitfalls

### Use direct property access

`dotenv-webpack` relies on webpack constant replacement. Write:

```js
const apiBaseUrl = process.env.API_BASE_URL;
```

Do not destructure from `process.env`:

```js
const { API_BASE_URL } = process.env;
```

That pattern does not give webpack a direct expression to replace.

### Values are baked in at build time

Changing `.env` does not update a bundle that was already built. Restart or rebuild webpack after editing env files.

### Do not expose secrets to browser code

If browser-targeted code references a variable, that value becomes part of the built assets. Only expose values that are safe to ship to the client.

### Be careful with leftover `process.env` usage on webpack 5+

Webpack 5 no longer polyfills Node's `process` object for browser bundles. `dotenv-webpack` documents an automatic stub for remaining `process.env` references, and exposes `ignoreStub` for cases where that behavior gets in the way.

If your application still crashes on `process is not defined`, audit the bundle for code that reads `process` in a way the plugin cannot replace, and prefer explicit variable references such as `process.env.API_BASE_URL` or a custom `prefix`.

## Minimal production pattern

This is a compact setup that checks required keys and still allows CI-provided overrides:

```js
const path = require("node:path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new Dotenv({
      safe: true,
      systemvars: true,
    }),
  ],
};
```

Use this when your project keeps local defaults in `.env`, tracks required keys in `.env.example`, and lets deployment infrastructure supply the final values.
