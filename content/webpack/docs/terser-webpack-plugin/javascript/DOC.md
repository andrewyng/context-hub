---
name: terser-webpack-plugin
description: "Webpack minimizer plugin for JavaScript bundles, with practical setup for webpack 5, source maps, comment extraction, parallel builds, and custom minifier backends."
metadata:
  languages: "javascript"
  versions: "5.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,minify,terser,javascript"
---

# terser-webpack-plugin

`terser-webpack-plugin` plugs into webpack's `optimization.minimizer` pipeline and minifies JavaScript assets.

For webpack 5, production mode already uses a Terser-based minimizer by default. Install `terser-webpack-plugin` when you need to customize minification behavior such as source maps, comment extraction, parallelism, or the minifier implementation.

This package has no auth flow, no package-specific environment variables, and no runtime client to initialize. The integration point is your webpack configuration.

## Install

Install the plugin alongside webpack:

```bash
npm install --save-dev webpack webpack-cli terser-webpack-plugin
```

If your project already has webpack 5, add only the plugin:

```bash
npm install --save-dev terser-webpack-plugin
```

`terser-webpack-plugin@5.x` is for webpack 5. The upstream docs note that webpack 4 projects should stay on `terser-webpack-plugin` v4.

## Basic setup

Add the plugin under `optimization.minimizer`.

`webpack.config.js`:

```javascript
const path = require("node:path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
```

Add a build script and run webpack normally:

```json
{
  "scripts": {
    "build": "webpack --mode production --config webpack.config.js"
  }
}
```

```bash
npm run build
```

## Use supported source maps

The plugin only supports these `devtool` values when you want source maps:

- `source-map`
- `inline-source-map`
- `hidden-source-map`
- `nosources-source-map`

The upstream docs explicitly call out `eval` and `cheap` variants as unsupported for useful minifier source maps.

```javascript
const path = require("node:path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
```

Use one of the supported `devtool` values before debugging minified bundles. If you use an `eval`-based or `cheap` source-map mode, the plugin cannot produce the expected mappings.

## Limit which assets are minified

Use `test`, `include`, and `exclude` when only part of your build should go through this minimizer.

```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        include: /src/,
        exclude: /vendor/,
      }),
    ],
  },
};
```

The documented default `test` value matches JavaScript assets: `/\.m?js(\?.*)?$/i`.

## Pass Terser options

`terserOptions` is forwarded to the default Terser minifier. This is the main place to adjust compression, mangling, and comment output.

```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {},
          mangle: true,
          format: {
            comments: false,
          },
          keep_fnames: false,
        },
      }),
    ],
  },
};
```

From the published docs:

- `mangle.properties` is `false` by default
- `format.comments` controls which comments stay in the output bundle
- `keep_fnames` defaults to `false`

If you need the full option surface, use the Terser minify options supported by the package's `terserOptions` field.

## Control license and comment extraction

`extractComments` defaults to `true`. By default, the plugin extracts legal comments matching `/^\**!|@preserve|@license|@cc_on/i` into a separate `*.LICENSE.txt` file and removes the remaining comments.

### Remove comments completely

Use this when you do not want preserved comments in the output bundle and do not want a separate license file.

```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};
```

### Preserve license comments in a separate file

Use `extractComments` as an object when you need to control the matching rule, output filename, or banner.

```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /@license/i,
          },
        },
        extractComments: {
          condition: /^\**!|@preserve|@license|@cc_on/i,
          filename: (fileData) => `${fileData.filename}.LICENSE.txt${fileData.query}`,
          banner: (licenseFile) => `License information can be found in ${licenseFile}`,
        },
      }),
    ],
  },
};
```

Important details from the maintainer docs:

- the default extracted filename pattern is `[file].LICENSE.txt[query]`
- `banner` defaults to `/*! For license information please see ${commentsFile} */`
- using `.txt` for extracted comments is recommended; `.js`, `.cjs`, and `.mjs` can conflict with emitted assets

## Tune parallelism for CI

`parallel` defaults to `true`, which means the plugin uses multiple worker processes and automatically chooses the available core count minus one.

In CI environments that report CPU availability incorrectly, the official docs recommend setting an explicit number to avoid `Error: Call retries were exceeded`.

```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: 2,
      }),
    ],
  },
};
```

Use `parallel: false` only if you need to disable worker processes entirely.

## Switch to another minifier backend

The package exposes built-in helper functions for alternative minifiers. Set `minify` to one of the exported helpers and pass that tool's options through `terserOptions`.

For example, to use `esbuild`:

```bash
npm install --save-dev terser-webpack-plugin esbuild
```

```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.esbuildMinify,
        terserOptions: {},
      }),
    ],
  },
};
```

The documented built-in helpers are:

- `TerserPlugin.terserMinify`
- `TerserPlugin.esbuildMinify`
- `TerserPlugin.swcMinify`
- `TerserPlugin.uglifyJsMinify`

Backend-specific caveats called out by the maintainer docs:

- `swcMinify` does not support `extractComments`, and comments are removed by default
- `esbuildMinify` does not support `extractComments`, and legal comments are preserved

## Practical notes

- If you are happy with webpack 5 production defaults, you do not need to configure this plugin explicitly.
- Add the plugin when you need custom `parallel`, `extractComments`, `terserOptions`, or `minify` behavior.
- When debugging source maps, start by checking `devtool` first; unsupported source-map modes are a common cause of confusing output.
