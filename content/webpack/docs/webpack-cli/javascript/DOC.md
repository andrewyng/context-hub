---
name: webpack-cli
description: "webpack CLI for local builds, watch mode, dev-server workflows, and configuration management in JavaScript projects"
metadata:
  languages: "javascript"
  versions: "6.0.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,webpack-cli,build,bundler,javascript"
---

# webpack-cli for JavaScript

`webpack-cli` is the command-line interface for webpack. In normal projects you install it locally, add a `webpack.config.js`, and run it through `webpack` in package scripts or with `npx`.

There is no authentication step.

## Prerequisites

- Node.js `>=18.12.0`
- `webpack-cli@6.0.1`
- `webpack@^5.82.0` because `webpack-cli@6` declares webpack as a peer dependency
- `webpack-dev-server` if you want to use `webpack serve`

## Install

```bash
npm install --save-dev webpack webpack-cli

# Only if you use `webpack serve`
npm install --save-dev webpack-dev-server
```

Use a local install and call it through package scripts or `npx`. The CLI prefers a local project copy by default.

## Minimal project setup

Add scripts to `package.json`:

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development",
    "watch": "webpack watch --mode development",
    "check:webpack": "webpack configtest ./webpack.config.js",
    "webpack:info": "webpack info --output markdown"
  }
}
```

Create `webpack.config.js`:

```javascript
const path = require("node:path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
```

Run the build:

```bash
npm run build
```

If you do not pass `--config`, webpack-cli looks for default config files such as `webpack.config.*` first.

## Build from the CLI

The default command is `build`, so these are equivalent:

```bash
npx webpack
npx webpack build
```

Common build commands:

```bash
# Development build
npx webpack --mode development

# Production build
npx webpack --mode production

# Override the config file path
npx webpack --config ./config/webpack.prod.js --mode production

# Write output to an absolute directory path
npx webpack ./src/index.js --output-path /absolute/path/to/dist --mode production

# Emit stats JSON to stdout or a file
npx webpack --json
npx webpack --json ./build-stats.json
```

`--output-path` expects an absolute path.

## Config functions and `--env`

When your config exports a function, webpack-cli calls it with `(env, argv)`. Use `--env` for custom values and `--config-node-env` to set `process.env.NODE_ENV` before the config runs.

```javascript
const path = require("node:path");

module.exports = (env = {}, argv = {}) => {
  const isProd = argv.mode === "production";

  return {
    mode: argv.mode ?? "development",
    entry: env.entry ?? "./src/index.js",
    output: {
      filename: env.minify ? "main.min.js" : "main.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    devtool: isProd ? "source-map" : "eval-cheap-module-source-map",
  };
};
```

```bash
# Pass flags into the config function
npx webpack --env entry=./src/admin.js --env minify --mode production

# Set NODE_ENV for config code
npx webpack --config-node-env production --mode production
```

`--node-env` still exists, but the CLI marks it as deprecated in favor of `--config-node-env`.

## Named and merged configurations

Use `--config-name` when one config file exports multiple named configurations:

```javascript
const path = require("node:path");

module.exports = [
  {
    name: "client",
    entry: "./src/client.js",
    output: {
      filename: "client.js",
      path: path.resolve(__dirname, "dist"),
    },
  },
  {
    name: "server",
    target: "node",
    entry: "./src/server.js",
    output: {
      filename: "server.js",
      path: path.resolve(__dirname, "dist"),
    },
  },
];
```

```bash
npx webpack --config ./webpack.config.js --config-name client
npx webpack --config ./webpack.config.js --config-name client --config-name server
```

Use `--merge` to combine multiple config files with `webpack-merge`:

```bash
npx webpack \
  --config ./webpack.common.js \
  --config ./webpack.prod.js \
  --merge \
  --mode production
```

webpack-cli also supports an `extends` property inside a config, and a CLI-level `--extends` flag. CLI-provided `--extends` entries take priority over `extends` inside the config file.

## Watch mode and dev server

Use `watch` for rebuilds on file change:

```bash
npx webpack watch --mode development
```

Use `serve` to run `webpack-dev-server`:

```bash
npx webpack serve --mode development
```

You can branch config behavior by command. webpack-cli passes command flags in the `env` object for function-based configs:

```javascript
module.exports = (env = {}) => ({
  devServer: env.WEBPACK_SERVE
    ? {
        hot: true,
        port: 3000,
      }
    : undefined,
});
```

The CLI documents these command flags:

- `env.WEBPACK_BUILD` for `webpack build`
- `env.WEBPACK_WATCH` for `webpack watch`
- `env.WEBPACK_SERVE` for `webpack serve`

Do not combine `webpack watch` or `webpack serve` with `watch: true` in config or `--watch` on the CLI. webpack-cli warns that this combination does not make sense, and `serve` disables `watch` internally.

## Validate and inspect your setup

Validate a config file without running a build:

```bash
npx webpack configtest ./webpack.config.js
```

Show installed versions that matter to webpack:

```bash
npx webpack version
```

Collect environment details for issue reports:

```bash
npx webpack info
npx webpack info --output markdown
npx webpack info --output json --additional-package react
```

## Useful environment variables

webpack-cli documents these environment variables:

- `WEBPACK_CLI_SKIP_IMPORT_LOCAL=true` skips the normal behavior of reusing the local project installation of `webpack-cli`
- `WEBPACK_CLI_FORCE_LOAD_ESM_CONFIG=true` forces ESM config loading
- `WEBPACK_PACKAGE` points the CLI at a custom webpack package
- `WEBPACK_DEV_SERVER_PACKAGE` points `serve` at a custom `webpack-dev-server` package
- `WEBPACK_CLI_HELP_WIDTH` changes the help output width

Example:

```bash
WEBPACK_CLI_FORCE_LOAD_ESM_CONFIG=true npx webpack --config ./webpack.config.mjs
```

## Common pitfalls

- Install `webpack` and `webpack-cli` together. `webpack-cli` is not the bundler itself.
- Install `webpack-dev-server` before using `webpack serve`.
- Prefer `--config-node-env` over `--node-env`.
- Pass an absolute path to `--output-path`.
- If you use a non-JavaScript config format such as TypeScript, webpack-cli relies on loader resolution through `interpret` and `rechoir`; if the required loader is missing, config loading fails before compilation starts.

## Exit codes

- `0`: success
- `1`: webpack compilation errors
- `2`: configuration problems, option problems, or internal CLI errors
