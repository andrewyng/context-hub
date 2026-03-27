---
name: style-loader
description: "Webpack loader that injects imported CSS into the browser DOM"
metadata:
  languages: "javascript"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,css,loader,styles"
---

# style-loader

`style-loader` injects imported CSS into the DOM at runtime from your webpack bundle.

For `style-loader@4.0.0`, the published package declares:

- Node.js `>= 18.12.0`
- `webpack` peer dependency `^5.27.0`

`style-loader` has no auth flow, no runtime client to initialize, and no package-specific environment variables. The only environment variable in this guide is `NODE_ENV`, which is used in the official recommended pattern for switching between development-time style injection and production CSS extraction.

## Install

Install webpack, the loader, and `css-loader` in the same project:

```bash
npm install --save-dev webpack webpack-cli style-loader css-loader
```

If webpack is already installed, add only the loaders:

```bash
npm install --save-dev style-loader css-loader
```

## Basic setup

Import a stylesheet from application code:

```js
import "./styles.css";
```

Configure webpack to run `css-loader` first and `style-loader` second:

```js
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
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

With the default `injectType: "styleTag"`, each imported stylesheet is injected into the page using one or more `<style>` tags.

Build the bundle with webpack:

```bash
npx webpack --mode development
```

## Use `style-loader` in development, extract CSS in production

The maintainer docs warn that the default settings are not safe for production environments. The recommended pattern is:

- use `style-loader` in development, including `webpack-dev-server`
- use `mini-css-extract-plugin` in production so CSS is emitted as separate files

Install the extraction plugin if you want this production pattern:

```bash
npm install --save-dev mini-css-extract-plugin
```

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
    ],
  },
  plugins: devMode ? [] : [new MiniCssExtractPlugin()],
};
```

```bash
npx webpack --mode development
NODE_ENV=production npx webpack --mode production
```

Do not apply `style-loader` and `MiniCssExtractPlugin.loader` at the same time in the same loader chain.

## CSS Modules

`style-loader` works with CSS Modules through `css-loader`. For named exports, enable `modules.namedExport` on `css-loader`.

```js
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
                namedExport: true,
              },
            },
          },
        ],
      },
    ],
  },
};
```

```js
import * as styles from "./button.css";

const button = document.createElement("button");
button.className = styles.primary;
button.textContent = "Save";

document.body.append(button);
```

When you use named exports, avoid JavaScript reserved words in CSS class names.

## Load styles on demand

Use `injectType: "lazyStyleTag"` when a stylesheet should be enabled and disabled from code.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.lazy\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "lazyStyleTag",
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

```js
import panelStyles from "./panel.lazy.css";

document.querySelector("#open-panel").addEventListener("click", () => {
  panelStyles.use();
});

document.querySelector("#close-panel").addEventListener("click", () => {
  panelStyles.unuse();
});
```

Notes:

- The docs recommend a `.lazy.css` naming convention for lazy-injected styles
- Do not call `unuse()` more times than `use()`
- For custom elements and Shadow DOM, the maintainer docs show `lazyStyleTag` together with a custom `insert` function and `styles.use({ target: shadowRoot })`

## Control insertion order and tag attributes

By default, `style-loader` appends injected `<style>` or `<link>` elements to the end of the style target, which is the document `<head>` unless you override it. That means injected CSS takes priority over CSS already present in that target.

Use `attributes` to add HTML attributes to the generated tag:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              attributes: {
                id: "app-theme",
              },
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

Use `insert` when styles need to go somewhere other than the default end of `<head>`:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              insert: "body",
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

For custom placement logic, pass `insert: require.resolve("./insert-function.js")`. That function runs in the browser; the maintainer docs recommend ES5-compatible syntax if you need support for older browsers.

## Source maps and CSP nonces

`style-loader` injects source maps automatically when the previous loader emits them. Enable `sourceMap: true` on `css-loader` or another earlier loader:

```js
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
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
};
```

If you use `injectType: "singletonStyleTag"`, the docs warn that source maps do not work.

If your application uses a CSP nonce, set it either through loader attributes or through `__webpack_nonce__` before importing CSS:

```js
__webpack_nonce__ = "12345678";

require("./styles.css");
```

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "style-loader",
            options: {
              attributes: {
                nonce: "12345678",
              },
            },
          },
          "css-loader",
        ],
      },
    ],
  },
};
```

When both are present, `attributes.nonce` takes precedence over `__webpack_nonce__`. The maintainer docs also note that using a nonce weakens CSP protection and recommend avoiding this loader in production when possible.

## Less-common options

- `esModule` defaults to `true`; set `esModule: false` only if you need CommonJS output
- `base` is mainly a workaround for CSS module ID clashes in `DllPlugin`-based builds
- `linkTag` injects runtime `<link rel="stylesheet">` tags, but the docs point to `mini-css-extract-plugin` when you want static stylesheet links in production
