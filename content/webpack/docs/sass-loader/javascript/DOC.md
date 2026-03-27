---
name: sass-loader
description: "Webpack loader that compiles Sass and SCSS files to CSS"
metadata:
  languages: "javascript"
  versions: "16.0.7"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,sass,scss,loader,css"
---

# sass-loader

`sass-loader` compiles `.scss`, `.sass`, and `.css` files during a webpack build.

It has no runtime client, auth flow, or package-specific environment variables. Usage is entirely build-time: import your stylesheet from application code, then configure webpack to run `sass-loader` together with `css-loader` and either `style-loader` or `mini-css-extract-plugin`.

## Install

Install webpack, the loader, and a Sass implementation. The documented default implementation is `sass` (Dart Sass).

```bash
npm install --save-dev webpack webpack-cli sass-loader sass css-loader style-loader
```

If you want extracted CSS files in production, also install `mini-css-extract-plugin`:

```bash
npm install --save-dev mini-css-extract-plugin
```

If you want the faster embedded compiler, add `sass-embedded` as well:

```bash
npm install --save-dev sass-embedded
```

When multiple Sass implementations are installed, `sass-loader` resolves them in this order:

1. `sass-embedded`
2. `sass`
3. `node-sass`

Important constraints from the maintainer docs:

- `node-sass` does not support the Sass `@use` rule
- `node-sass` does not work with Yarn PnP
- `~` imports are still supported for historical reasons, but they are deprecated

## Basic setup

Import your Sass entry from application code:

```javascript
import "./styles/app.scss";
```

Create a stylesheet:

```scss
$brand-color: #2563eb;

body {
  color: $brand-color;
}
```

Configure webpack. Keep `sass-loader` last in the `use` array so it runs first and compiles Sass to CSS before `css-loader` and `style-loader` handle the result.

```javascript
const path = require("node:path");

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
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
};
```

Build with webpack:

```bash
npx webpack --mode development
```

## Pin the Sass implementation

If you install both `sass` and `sass-embedded`, `sass-loader` prefers `sass-embedded` automatically. If you want to pin a specific implementation, use the `implementation` option.

This example always uses Dart Sass even if `sass-embedded` is installed:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      },
    ],
  },
};
```

For `sass-loader` 16, the default API is:

- `modern` for `sass` and `sass-embedded`
- `legacy` for `node-sass`

If you use `sass-embedded`, you can opt into the modern compiler API explicitly:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              api: "modern-compiler",
            },
          },
        ],
      },
    ],
  },
};
```

The maintainer docs recommend `sass-embedded` or Dart Sass, and note that `modern-compiler` with `sass-embedded` improves performance.

## Extract CSS in production

Use `style-loader` in development and `mini-css-extract-plugin` in production.

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          process.env.NODE_ENV !== "production"
            ? "style-loader"
            : MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
};
```

Example production build:

```bash
NODE_ENV=production npx webpack --mode production
```

For version 16, the maintainer docs note that Sass `style` (new API) and `outputStyle` (old API) default to `compressed` in production unless you override them in `sassOptions`.

## Inject shared variables with `additionalData`

Use `additionalData` to prepend Sass before each entry file. This is the usual way to inject environment-specific variables without editing every stylesheet.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              additionalData: `$build-env: ${JSON.stringify(process.env.NODE_ENV || "development")};`,
            },
          },
        ],
      },
    ],
  },
};
```

Then reference the variable from Sass:

```scss
.build-banner::before {
  content: $build-env;
}
```

`additionalData` can also be a function when you need different values per file:

```javascript
const path = require("node:path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              additionalData: (content, loaderContext) => {
                const relativePath = path.relative(loaderContext.rootContext, loaderContext.resourcePath);

                if (relativePath === "src/styles/admin.scss") {
                  return `$panel-padding: 24px;\n${content}`;
                }

                return `$panel-padding: 16px;\n${content}`;
              },
            },
          },
        ],
      },
    ],
  },
};
```

## Configure include paths and source maps

Use `sassOptions` for Sass-specific configuration such as `loadPaths`. Use the loader `sourceMap` option rather than setting Sass source-map fields manually.

```javascript
const path = require("node:path");

module.exports = {
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
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
              sassOptions: {
                loadPaths: [path.resolve(__dirname, "src/styles")],
              },
            },
          },
        ],
      },
    ],
  },
};
```

Notes from the maintainer docs:

- Source-map generation defaults from webpack `devtool`; all values except `eval` and `false` enable it
- When `sourceMap: true`, `sass-loader` manages Sass source-map fields automatically
- The default `syntax` is chosen from the file extension: `scss`, `sass`, or `css`
- The `charset` option defaults to `true` for Dart Sass and is discouraged to disable because webpack expects UTF-8

## Resolve package imports and asset URLs

You can import Sass packages directly from `node_modules` without `~`:

```scss
@use "bootstrap";
```

The maintainer docs recommend removing `~bootstrap`-style imports. `sass-loader` first tries a relative path, then falls back to webpack module resolution.

Sass itself does not rewrite `url(...)` references. If relative asset URLs break after compilation, add `resolve-url-loader` before `sass-loader`:

```bash
npm install --save-dev resolve-url-loader
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          "resolve-url-loader",
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
};
```

## Warnings, debug output, and importer behavior

`@warn` becomes a webpack warning by default. If a dependency is noisy, filter it with webpack's `ignoreWarnings` option.

```javascript
module.exports = {
  ignoreWarnings: [/Unknown prefix/],
};
```

To see Sass `@debug` output, enable debug logging for the loader:

```javascript
module.exports = {
  stats: {
    loggingDebug: ["sass-loader"],
  },
};
```

`webpackImporter` defaults to `true`. Setting it to `false` can improve performance, but webpack aliases and `~` imports stop working unless you provide your own importer.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              webpackImporter: false,
            },
          },
        ],
      },
    ],
  },
};
```
