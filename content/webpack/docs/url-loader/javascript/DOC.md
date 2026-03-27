---
name: url-loader
description: "Webpack loader that inlines imported files as data URLs and falls back to emitted files above a size limit"
metadata:
  languages: "javascript"
  versions: "4.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,assets,loader,data-url"
---

# url-loader

`url-loader` transforms imported files into `data:` URLs. When you set a `limit`, files smaller than that threshold stay inline and larger files are handed off to a fallback loader, which is typically `file-loader`.

For webpack 5, the maintainer docs mark `url-loader` as deprecated in favor of Asset Modules. Use `url-loader` for legacy configs that still depend on loader-based asset handling.

`url-loader` has no auth flow, no runtime client to initialize, and no package-specific environment variables. All behavior is configured in your webpack rule.

## Install

Install webpack, the CLI, `url-loader`, and `file-loader` if you want the usual "inline small files, emit larger ones" behavior:

```bash
npm install --save-dev webpack webpack-cli url-loader file-loader
```

Run webpack with:

```bash
npx webpack --config webpack.config.js
```

## Basic setup

Import the asset from your application code. The imported value is always a string:

- a `data:` URL when the file stays inline
- a public asset URL when the rule falls back to `file-loader`

```javascript
import logoUrl from "./assets/logo.png";

const image = document.createElement("img");
image.src = logoUrl;
image.alt = "Logo";

document.body.append(image);
```

Configure webpack to inline files under `8 KB` and emit larger files through `file-loader`:

```javascript
const path = require("path");

const inlineLimit = Number(process.env.ASSET_INLINE_LIMIT || 8192);

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: inlineLimit,
              fallback: "file-loader",
              name: "static/media/[name].[contenthash].[ext]",
            },
          },
        ],
      },
    ],
  },
};
```

Notes:

- `url-loader` does not read `ASSET_INLINE_LIMIT` itself; that environment variable is just an application-level way to tune the webpack config
- files with size equal to or greater than `limit` use the fallback loader
- if you omit `limit`, `url-loader` keeps matched files inline instead of emitting them

## Inline everything

If you want every matched import turned into a `data:` URL, omit `limit` and use `url-loader` directly:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "url-loader",
      },
    ],
  },
};
```

This is most useful for very small assets. Inlining large files increases bundle size and moves the asset bytes into your JavaScript payload.

## Configure fallback output separately

Use an object form for `fallback` when you want different settings for the emitted-file path or filename:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "url-loader",
        options: {
          limit: 4096,
          fallback: {
            loader: "file-loader",
            options: {
              name: "static/assets/[name].[contenthash].[ext]",
              publicPath: "/assets/",
            },
          },
        },
      },
    ],
  },
};
```

That keeps small files inline and gives large files a predictable emitted URL like `/assets/logo.a1b2c3.png`.

## Optimize SVG data URLs

For SVG, a custom generator can produce smaller data URLs than default base64 encoding. A common pattern is to use `mini-svg-data-uri`.

```bash
npm install --save-dev mini-svg-data-uri
```

```javascript
const svgToMiniDataURI = require("mini-svg-data-uri");

module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/i,
        loader: "url-loader",
        options: {
          limit: 4096,
          generator: (content) => svgToMiniDataURI(content.toString()),
        },
      },
    ],
  },
};
```

Use this only for assets that should stay inline. Larger SVG files still work better as emitted files or webpack 5 Asset Modules.

## CommonJS interop

By default, `url-loader` exports ES module syntax. If another part of your build still expects CommonJS-style loader output, disable `esModule`.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "url-loader",
        options: {
          limit: 8192,
          esModule: false,
        },
      },
    ],
  },
};
```

Keep the default `esModule: true` unless you have a specific compatibility issue with older templates or loaders.

## Migrate to webpack 5 Asset Modules

For new webpack 5 configs, prefer Asset Modules instead of `url-loader`.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
        generator: {
          filename: "static/media/[name].[contenthash][ext]",
        },
      },
    ],
  },
};
```

That webpack 5 rule covers the same common workflow: small files become inline data URLs and larger files are emitted automatically.

## Important options at a glance

- `limit`: maximum file size in bytes before the loader switches to the fallback
- `fallback`: loader used when a file is too large to inline; often `file-loader`
- `mimetype`: override the MIME type used in the generated `data:` URL
- `encoding`: override the data URL encoding; default output is base64 for normal cases
- `generator`: build a custom data URL string, which is useful for SVG optimization
- `esModule`: switch between ESM export syntax and CommonJS-style export syntax

## Pitfalls

- `url-loader` is deprecated for webpack 5. Prefer Asset Modules for new work.
- `limit` is checked against file size before fallback. Files at or above the threshold are not inlined.
- If you inline everything, your JavaScript bundle carries the full asset payload.
- The imported value is always a string URL, but the format changes: `data:` URL for inline assets, normal asset URL for fallback output.
- `url-loader` does not provide a runtime API or CLI; all behavior lives in webpack config.
