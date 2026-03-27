---
name: less-loader
description: "Webpack loader that compiles Less files to CSS"
metadata:
  languages: "javascript"
  versions: "12.3.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,less,css,loader"
---

# less-loader

`less-loader` compiles `.less` files during a webpack build.

This package is build-time only: there is no runtime client to initialize, no auth flow, and no package-specific environment variables. You install it alongside webpack and the `less` compiler, import `.less` from your application code, and configure webpack to run `less-loader` before `css-loader` and `style-loader` or `mini-css-extract-plugin`.

This guide targets `less-loader@12.3.2`.

## Install

Install webpack, `less-loader`, the Less compiler, and the CSS loaders you want to use:

```bash
npm install --save-dev webpack webpack-cli less-loader less css-loader style-loader
```

If you want emitted `.css` files in production builds instead of runtime style injection, also install `mini-css-extract-plugin`:

```bash
npm install --save-dev mini-css-extract-plugin
```

`less-loader` does not bundle the Less compiler. If `less` is missing, webpack cannot compile `.less` files.

## Basic setup

Import a Less entry file from your application code:

```javascript
import "./styles/app.less";
```

Create a stylesheet:

```less
@brand-color: #2563eb;

body {
  color: @brand-color;
}
```

Configure webpack so `less-loader` runs first, then `css-loader`, then `style-loader`:

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
        test: /\.less$/i,
        use: [
          "style-loader",
          "css-loader",
          "less-loader",
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

## Extract CSS in production

Use `style-loader` in development and `mini-css-extract-plugin` in production.

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          process.env.NODE_ENV !== "production"
            ? "style-loader"
            : MiniCssExtractPlugin.loader,
          "css-loader",
          "less-loader",
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

`NODE_ENV` here is an application-level convention for choosing webpack behavior. `less-loader` does not read its own environment variables.

## Pass Less compiler options with `lessOptions`

Use `lessOptions` for compiler-specific settings that should be forwarded to Less.

This example adds an extra import search path so Less can resolve shared files without long relative paths:

```javascript
const path = require("node:path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                paths: [path.resolve(__dirname, "src/styles")],
              },
            },
          },
        ],
      },
    ],
  },
};
```

Then a Less file can import from that directory:

```less
@import "theme/variables.less";

.button {
  color: @brand-color;
}
```

Keep Less compiler settings under `lessOptions`; top-level loader options such as `sourceMap` stay at the loader level.

## Inject shared variables with `additionalData`

Use `additionalData` to prepend shared Less before each entry file. This is the usual pattern for build-specific variables that you do not want to duplicate across many stylesheets.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "less-loader",
            options: {
              additionalData: `@build-env: "${process.env.NODE_ENV || "development"}";`,
            },
          },
        ],
      },
    ],
  },
};
```

Reference the injected variable from Less:

```less
.build-banner::before {
  content: "@{build-env}";
}
```

## Enable source maps

When you need browser devtools to map compiled CSS back to `.less` sources, enable source maps in webpack and in both CSS-related loaders.

```javascript
module.exports = {
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "less-loader",
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

## Important pitfalls

- Install `less` as well as `less-loader`; the loader delegates compilation to the Less package.
- Keep `less-loader` last in the webpack `use` array so it runs first.
- Use `lessOptions` for Less compiler settings such as import paths, not top-level loader options.
- Use `MiniCssExtractPlugin.loader` instead of `style-loader` when you need emitted CSS files for production.
- `additionalData` is prepended to every compiled Less module, so keep it limited to shared variables, mixins, or imports that should apply everywhere.

## Official Sources

- https://webpack.js.org/loaders/less-loader/
- https://www.npmjs.com/package/less-loader
