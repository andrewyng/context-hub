---
name: raw-loader
description: "Webpack loader that imports matched files as raw source strings"
metadata:
  languages: "javascript"
  versions: "4.0.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,loader,assets,text"
---

# raw-loader

`raw-loader` imports a matched file as a JavaScript string, so `import template from "./template.html"` gives you the file contents instead of an emitted asset URL.

For webpack 5, the maintainer docs mark `raw-loader` as deprecated in favor of Asset Modules. Use `raw-loader` for legacy configs that still rely on loader-based string imports.

`raw-loader` has no auth flow, no runtime client to initialize, and no package-specific environment variables. All behavior is configured in your webpack rule.

## Install

Install webpack, the CLI, and `raw-loader` in the same project:

```bash
npm install --save-dev webpack webpack-cli raw-loader
```

Run webpack with:

```bash
npx webpack --config webpack.config.js
```

## Basic setup

Import the text-based file from your application code. The imported value is the full file contents as a string.

```javascript
import template from "./template.html";

const app = document.getElementById("app");

if (app) {
  app.innerHTML = template;
}
```

Configure webpack to use `raw-loader` for the file types you want to read as source text:

```javascript
const path = require("path");

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
        test: /\.(txt|html)$/i,
        use: [
          {
            loader: "raw-loader",
          },
        ],
      },
    ],
  },
};
```

Use this pattern for text-like inputs such as `.txt`, `.html`, `.svg`, `.graphql`, or shader source files when your application needs the literal file contents at runtime.

## Load SVG source as markup

`raw-loader` is useful when you need the SVG markup itself rather than a URL to an emitted file.

```javascript
import iconSvg from "./icons/check.svg";

const wrapper = document.createElement("div");
wrapper.innerHTML = iconSvg;

document.body.append(wrapper);
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/i,
        loader: "raw-loader",
      },
    ],
  },
};
```

If you want a URL for an image tag instead of inline markup, use webpack 5 Asset Modules or a file-emitting loader instead.

## CommonJS interop

By default, `raw-loader` exports ES module syntax. If another part of your build still expects CommonJS-style loader output, disable `esModule`.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(txt|html|svg)$/i,
        loader: "raw-loader",
        options: {
          esModule: false,
        },
      },
    ],
  },
};
```

Keep the default `esModule: true` unless you have a specific compatibility issue with older CommonJS-based templates or loaders.

## Migrate to webpack 5 Asset Modules

For new webpack 5 configs, prefer Asset Modules instead of `raw-loader`.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(txt|html|svg)$/i,
        type: "asset/source",
      },
    ],
  },
};
```

With `asset/source`, the application code stays the same:

```javascript
import template from "./template.html";
import iconSvg from "./icons/check.svg";
```

This covers the same common workflow without an extra loader dependency.

## Important option at a glance

- `esModule`: switch between ESM export syntax and CommonJS export syntax

## Pitfalls

- `raw-loader` is deprecated for webpack 5. Prefer `type: "asset/source"` for new work.
- The imported value is the full file contents, so large inputs increase your JavaScript bundle size.
- Use `raw-loader` for text-based assets. It is not the right tool when you need a public asset URL or emitted file on disk.
- `raw-loader` does not expose a runtime API or CLI; all behavior lives in webpack config.
