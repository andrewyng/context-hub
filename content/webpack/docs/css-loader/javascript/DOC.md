---
name: css-loader
description: "Webpack loader for importing CSS, resolving url() and @import, and enabling CSS Modules"
metadata:
  languages: "javascript"
  versions: "7.1.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,css,loader,build,css-modules"
---

# css-loader

`css-loader` lets webpack load CSS from JavaScript, resolves CSS `@import` rules and `url()` references, and can compile CSS Modules or ICSS.

It is a build-time tool only: there is no client to initialize, no auth flow, and no package-specific environment variables. In practice, the only environment variable most projects use here is `NODE_ENV` to switch between development and production loader stacks.

The maintainer docs for the current 7.x line require webpack 5.

## Install

For a typical webpack app that injects styles into the page during development:

```bash
npm install --save-dev webpack webpack-cli css-loader style-loader
```

If you want extracted `.css` files in production builds, also install:

```bash
npm install --save-dev mini-css-extract-plugin
```

If you want PostCSS transforms such as autoprefixing, also install:

```bash
npm install --save-dev postcss postcss-loader postcss-preset-env
```

## Basic setup

Import CSS from your application entry:

```javascript
import "./styles.css";
```

`webpack.config.js`:

```javascript
const path = require("node:path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        type: "asset",
      },
    ],
  },
};
```

`src/styles.css`:

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.hero {
  background: url("./logo.svg") no-repeat left center;
  padding-left: 56px;
}
```

`css-loader` resolves both of these CSS features through webpack:

- `@import "./other.css"`
- `url("./logo.svg")`

Run webpack with:

```bash
npx webpack --mode development
```

## Development vs production

The maintainer docs recommend `style-loader` for development and `mini-css-extract-plugin` for production so CSS can be loaded as separate files.

Do not use `style-loader` and `mini-css-extract-plugin` together on the same rule.

`webpack.config.js`:

```javascript
const path = require("node:path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  mode: devMode ? "development" : "production",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [devMode ? "style-loader" : MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: devMode ? [] : [new MiniCssExtractPlugin()],
};
```

```bash
NODE_ENV=production npx webpack --mode production
```

## CSS Modules

If you want `.module.css` files to be locally scoped while keeping plain `.css` files global, enable module auto-detection and set the export style explicitly.

`webpack.config.js`:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                auto: true,
                namedExport: false,
                exportLocalsConvention: "camel-case-only",
                localIdentName: "[name]__[local]--[hash:base64:5]",
              },
            },
          },
        ],
      },
    ],
  },
};
```

With `modules.auto: true`, the maintainer docs enable CSS Modules for files matching `.module.*` and ICSS for files matching `.icss.*`. Plain `.css` files stay global.

`src/Button.module.css`:

```css
.primary-button {
  background: #2563eb;
  color: white;
  border: 0;
  border-radius: 6px;
}
```

`src/index.js`:

```javascript
import styles from "./Button.module.css";

const button = document.createElement("button");
button.className = styles.primaryButton;
button.textContent = "Save";

document.body.append(button);
```

If you prefer named exports instead of a default mapping object, set `modules.namedExport: true` and import with `import * as styles from "./Button.module.css"`.

## PostCSS and imported CSS

When loaders run before `css-loader`, set `importLoaders` so those loaders also run for CSS pulled in through `@import`, CSS Modules, and ICSS imports.

For a CSS + PostCSS stack:

`postcss.config.js`:

```javascript
module.exports = {
  plugins: [require("postcss-preset-env")()],
};
```

`webpack.config.js`:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          "postcss-loader",
        ],
      },
    ],
  },
};
```

Use these values as the rule of thumb:

- `importLoaders: 0` if nothing should run before `css-loader`
- `importLoaders: 1` if `postcss-loader` should also process imported CSS
- `importLoaders: 2` if both `postcss-loader` and `sass-loader` should process imported CSS

Without `importLoaders`, an `@import`ed stylesheet does not automatically go through the loaders that appear before `css-loader` in the current rule.

## Leave `url()` or `@import` untouched

By default, `css-loader` resolves CSS `url()` and `@import`. If your CSS already points at a CDN, a server-managed static path, or another pipeline, disable that behavior explicitly.

Disable URL handling:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          url: false,
        },
      },
    ],
  },
};
```

Disable `@import` handling:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          import: false,
        },
      },
    ],
  },
};
```

The maintainer docs also support filter objects for `url` and `import` when you only want to skip some paths instead of all of them.

## Server-rendered CSS Modules

If a server bundle only needs the generated class-name mapping and should not emit or inject CSS, use `exportOnlyLocals`.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            exportOnlyLocals: true,
            namedExport: false,
          },
        },
      },
    ],
  },
};
```

This is the documented option for pre-rendering or SSR bundles that need CSS Module identifiers but not browser-side style injection.

## Common pitfalls

- `css-loader` only resolves CSS dependencies; you still need matching webpack rules for images, fonts, and other files referenced from CSS.
- Use `style-loader` for development and `mini-css-extract-plugin` for production; do not stack both in one `use` array.
- Set `importLoaders` whenever `postcss-loader`, `sass-loader`, or other loaders should also process CSS that comes from `@import`.
- `esModule` defaults to `true`; if another part of your toolchain expects CommonJS exports, set `esModule: false` explicitly.
- If you turn on CSS Modules named exports, a CSS class literally named `.default` is exported as `_default` because `default` is a reserved ESM export name.

## Official docs

- Maintainer docs: `https://webpack.js.org/loaders/css-loader/`
- Package page: `https://www.npmjs.com/package/css-loader`
