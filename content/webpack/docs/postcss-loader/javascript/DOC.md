---
name: postcss-loader
description: "Webpack loader that runs PostCSS plugins over CSS and preprocessor output"
metadata:
  languages: "javascript"
  versions: "8.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,postcss,css,loader,build"
---

# postcss-loader for JavaScript

`postcss-loader` runs [PostCSS](https://postcss.org/) as part of a webpack CSS pipeline.

There is no authentication step and no package-specific environment variable. Install it in the same project as `webpack` and `postcss`, then add it to the `module.rules` chain for your CSS files.

## Prerequisites

- `webpack` 5. The maintainer docs say the current loader line requires webpack 5; if you are on webpack 4, use `postcss-loader` v4 instead.
- `postcss` installed in the same project.
- At least one PostCSS plugin if you want transforms beyond plain parsing, such as `postcss-preset-env`.

## Install

For a typical CSS pipeline, install webpack, the CSS loaders, PostCSS, and a plugin preset:

```bash
npm install --save-dev webpack webpack-cli style-loader css-loader postcss-loader postcss postcss-preset-env
```

If webpack is already set up, add the missing CSS and PostCSS packages only.

## Minimal setup

Import a stylesheet from your application entry:

```javascript
import "./styles.css";
```

Add `postcss-loader` to the webpack rule. Because webpack evaluates loaders right to left, list the loaders in this order:

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
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [["postcss-preset-env", {}]],
              },
            },
          },
        ],
      },
    ],
  },
};
```

`importLoaders: 1` on `css-loader` is important here: it makes sure CSS loaded through `@import` also runs through `postcss-loader`.

Run webpack with your normal build command:

```bash
npx webpack --mode development
```

## Use a `postcss.config.js` file

`postcss-loader` automatically searches for a PostCSS config file starting from the CSS file's directory and walking upward.

Create `postcss.config.js`:

```javascript
module.exports = {
  plugins: [["postcss-preset-env", {}]],
};
```

Then keep the webpack rule minimal:

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

Use this pattern when you want one PostCSS config shared across webpack and other tools.

## Inline config and disable config lookup

If you already know all of your PostCSS plugins in webpack config, you can skip filesystem config lookup and keep everything inline.

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
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: false,
                plugins: [["postcss-preset-env", {}]],
              },
            },
          },
        ],
      },
    ],
  },
};
```

The maintainer docs recommend this pattern for larger projects because it avoids repeated config-file lookups during compilation.

If you need a non-default config location, point `postcssOptions.config` at a specific file path:

```javascript
const path = require("node:path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "postcss-loader",
        options: {
          postcssOptions: {
            config: path.resolve(__dirname, "config/postcss.config.js"),
          },
        },
      },
    ],
  },
};
```

## Use with Sass or other preprocessors

`postcss-loader` should run after preprocessors such as `sass-loader`, `less-loader`, or `stylus-loader`, but before `css-loader` and `style-loader` in execution order. In a webpack `use` array, that means the preprocessor goes last:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              sourceMap: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              postcssOptions: {
                plugins: [["postcss-preset-env", {}]],
              },
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
};
```

Use `importLoaders: 2` because imported Sass should pass through both `postcss-loader` and `sass-loader`.

## CSS Modules

`postcss-loader` does not need special options for CSS Modules. Configure modules on `css-loader` and keep `importLoaders` aligned with the number of loaders that should run before `css-loader` finishes.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
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

## Source maps

`postcss-loader` has its own `sourceMap` option. By default it follows webpack's `devtool` behavior; the maintainer docs say source maps are enabled for all `devtool` values except `eval` and `false`.

If you are chaining a preprocessor, enable source maps consistently across each loader in the chain:

```javascript
module.exports = {
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          "style-loader",
          { loader: "css-loader", options: { sourceMap: true } },
          { loader: "postcss-loader", options: { sourceMap: true } },
          { loader: "sass-loader", options: { sourceMap: true } },
        ],
      },
    ],
  },
};
```

Do not set PostCSS `from`, `to`, or `map` inside `postcssOptions` unless you have a specific reason. The maintainer docs recommend using the loader's `sourceMap` handling instead so source-map paths stay correct.

## CSS-in-JS with `postcss-js`

If your styles are written in JavaScript, enable execution and switch the parser to `postcss-js`:

```bash
npm install --save-dev postcss-js babel-loader
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.style\.js$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              execute: true,
              postcssOptions: {
                parser: "postcss-js",
              },
            },
          },
          "babel-loader",
        ],
      },
    ],
  },
};
```

Use `execute: true` only for CSS-in-JS inputs. It is not needed for normal `.css`, `.scss`, or `.less` files.

## Common pitfalls

- `postcss-loader` does not bundle plugins. Install each plugin explicitly, for example `postcss-preset-env` or `autoprefixer`.
- Use the array form for `plugins`, such as `[["postcss-preset-env", {}]]`. The object form is documented as deprecated.
- Keep `importLoaders` in sync with the number of loaders that should also process `@import`ed CSS.
- `implementation` exists, but the maintainer docs describe it as mainly useful for downstream tooling authors. Most applications should use the default `postcss` implementation.
