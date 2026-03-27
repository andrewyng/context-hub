---
name: compression-webpack-plugin
description: "Webpack plugin that emits precompressed gzip or Brotli assets during builds"
metadata:
  languages: "javascript"
  versions: "12.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,compression,gzip,brotli,build"
---

# compression-webpack-plugin for JavaScript

`compression-webpack-plugin` runs during a webpack build and writes compressed copies of emitted assets. The common use case is generating `.gz` and `.br` files that your CDN or web server can serve directly.

There is no authentication flow, no runtime client to initialize, and no package-specific environment variables.

## Install

Install the plugin in the same project as webpack:

```bash
npm install --save-dev webpack webpack-cli compression-webpack-plugin
```

If webpack is already installed, add only the plugin:

```bash
npm install --save-dev compression-webpack-plugin
```

## Minimal setup

Add the plugin to your webpack config. This example generates gzip copies for text assets and keeps the original files.

```javascript
const path = require("node:path");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    clean: true,
  },
  plugins: [
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/i,
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
};
```

Build as usual:

```bash
npx webpack --mode production
```

That produces your normal emitted assets plus matching `.gz` files for assets that pass the filter and compression thresholds.

## Enable only for production

The plugin is usually only useful for production builds. A common pattern is to branch on `NODE_ENV` in the webpack config.

```javascript
const path = require("node:path");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = () => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    mode: isProd ? "production" : "development",
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "main.js",
      clean: true,
    },
    plugins: [
      ...(isProd
        ? [
            new CompressionPlugin({
              filename: "[path][base].gz",
              algorithm: "gzip",
              test: /\.(js|css|html|svg)$/i,
              threshold: 10240,
              minRatio: 0.8,
            }),
          ]
        : []),
    ],
  };
};
```

```bash
NODE_ENV=production npx webpack --mode production
```

`NODE_ENV` in this example is an application-level convention, not a requirement of `compression-webpack-plugin` itself.

## Generate Brotli assets

Use a second plugin instance when you want Brotli output alongside gzip output.

```javascript
const path = require("node:path");
const zlib = require("node:zlib");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    clean: true,
  },
  plugins: [
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/i,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress",
      test: /\.(js|css|html|svg)$/i,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
};
```

Use different `filename` patterns for each instance so the outputs do not collide.

## Control which assets are compressed

`test`, `include`, and `exclude` let you limit compression to the assets that benefit from it.

```javascript
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      include: /\.(js|css)$/i,
      exclude: /vendor\.[a-f0-9]+\.js$/i,
      threshold: 10240,
    }),
  ],
};
```

For most applications, compress only text-based assets such as JavaScript, CSS, HTML, SVG, or JSON. Binary formats such as JPEG, PNG, WebP, MP4, and ZIP usually do not benefit much from another compression pass.

## Delete original assets carefully

The plugin can remove the uncompressed files after writing compressed ones.

```javascript
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/i,
      deleteOriginalAssets: "keep-source-map",
    }),
  ],
};
```

Use this only when your deployment environment serves the compressed assets directly. Keeping source maps while deleting the original compiled assets is safer than removing everything blindly.

## Practical notes and pitfalls

- `compression-webpack-plugin` only generates compressed files. It does not configure your web server, CDN, or object storage to send `Content-Encoding: gzip` or `Content-Encoding: br`.
- Keep the original assets unless you are sure your host will always serve the compressed variants.
- Apply the plugin to production builds. Precompressing development output usually slows rebuilds without helping local iteration.
- If you use multiple plugin instances, give each one a unique `filename` pattern such as `.gz` and `.br`.
- `threshold` and `minRatio` help avoid generating compressed files for tiny assets or for files that do not compress enough to be worth shipping.
