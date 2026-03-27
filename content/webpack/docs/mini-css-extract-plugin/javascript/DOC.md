---
name: mini-css-extract-plugin
description: "Webpack plugin that extracts imported CSS into separate emitted stylesheet files"
metadata:
  languages: "javascript"
  versions: "2.10.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,css,build,plugin,assets"
---

# mini-css-extract-plugin for JavaScript

`mini-css-extract-plugin` extracts CSS that your bundle imports and writes it as real `.css` assets instead of injecting styles into JavaScript at runtime.

There is no authentication flow, no runtime client to initialize, and no package-specific environment variable. The examples below only use `NODE_ENV` as an application-level switch between development and production behavior.

## Install

Install the plugin with webpack and `css-loader` in the same project:

```bash
npm install --save-dev webpack webpack-cli mini-css-extract-plugin css-loader
```

If your webpack project already exists, add only the missing dependencies:

```bash
npm install --save-dev mini-css-extract-plugin css-loader
```

## Minimal setup

Import a stylesheet from your application entry:

```javascript
import "./styles.css";
```

Configure webpack to use `MiniCssExtractPlugin.loader` before `css-loader`, then add the plugin instance:

```javascript
const path = require("node:path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css",
    }),
  ],
};
```

Build with webpack as usual:

```bash
npx webpack --mode production
```

That produces JavaScript in `dist/` plus one or more extracted CSS files.

## Use `style-loader` in development and extract in production

The maintainer docs recommend using `style-loader` for development and `mini-css-extract-plugin` for production. Do not use both loaders in the same rule at the same time.

```bash
npm install --save-dev style-loader
```

```javascript
const path = require("node:path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [isProduction ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"],
      },
    ],
  },
  plugins: isProduction
    ? [
        new MiniCssExtractPlugin({
          filename: "[name].[contenthash].css",
          chunkFilename: "[id].[contenthash].css",
        }),
      ]
    : [],
};
```

Example scripts:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development webpack --mode development",
    "build": "NODE_ENV=production webpack --mode production"
  }
}
```

If you do not want to depend on `NODE_ENV` in npm scripts, you can rely on the CLI `--mode` flag alone and keep the same loader split.

## Extract CSS from Sass

To extract Sass or SCSS, keep `MiniCssExtractPlugin.loader` first and add the preprocessor after `css-loader`.

```bash
npm install --save-dev sass sass-loader
```

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin()],
};
```

The maintainer docs call out CSS source map support for webpack `devtool` values that emit full source maps, including `source-map`, `nosources-source-map`, `hidden-source-map`, and `hidden-nosources-source-map`.

## Extract shared CSS into a dedicated chunk

When multiple entrypoints or lazy chunks share CSS, use webpack `splitChunks` with the plugin's CSS chunk type:

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          type: "css/mini-extract",
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
};
```

Use this when you want one extracted stylesheet for shared CSS instead of separate CSS files per chunk.

## Adjust asset URLs with loader `publicPath`

If your extracted CSS is emitted into a different directory depth than the assets it references with `url()`, set `publicPath` on the loader.

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
            },
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin({ filename: "css/[name].css" })],
};
```

That pattern is useful when CSS lands in `dist/css/` but images or fonts are emitted relative to `dist/`.

## Important pitfalls

- `mini-css-extract-plugin` extracts files; it does not replace the need for `css-loader`.
- Do not combine `style-loader` and `MiniCssExtractPlugin.loader` in the same loader chain. Pick one for a given build.
- The plugin handles runtime loading for non-initial CSS chunks, but CSS from initial entry chunks still needs to be linked from HTML. In practice, use `html-webpack-plugin` or add the emitted stylesheet to your HTML template yourself.
- `ignoreOrder: true` only suppresses CSS order warnings. Use it only when stylesheet order does not affect the rendered result.
- If order warnings appear, fix inconsistent import order across entries before silencing them.

## Practical default

For most webpack apps, start with this rule and plugin pair:

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css",
    }),
  ],
};
```

Add preprocessors, `splitChunks`, or loader `publicPath` only when your build needs them.
