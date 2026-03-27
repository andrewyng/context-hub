---
name: html-webpack-plugin
description: "Generate HTML files for webpack bundles with html-webpack-plugin, including templates, multi-page output, head tags, and plugin hooks."
metadata:
  languages: "javascript"
  versions: "5.6.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,html,plugin,templates"
---

# html-webpack-plugin

`html-webpack-plugin` generates HTML files that reference the JavaScript and CSS files emitted by webpack. Use it when you want webpack to own the final `<script>` and `<link>` tags instead of hard-coding bundle filenames.

For `html-webpack-plugin@5.6.6`, the published package declares:

- Node.js `>=10.13.0`
- `webpack` peer dependency `^5.20.0`

There is no authentication flow, runtime client, or package-specific environment variable. All setup happens in `webpack.config.js`. If you need build-time values in the generated HTML, pass them through `templateParameters`.

## Install

Install the plugin alongside webpack:

```bash
npm install --save-dev webpack webpack-cli html-webpack-plugin
```

If your build extracts CSS into separate files, install that plugin separately. `html-webpack-plugin` injects emitted CSS files automatically when they exist in the webpack output.

## Minimal setup

`html-webpack-plugin` works without extra configuration. Add it to `plugins` and run webpack normally.

`webpack.config.js`

```javascript
const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/[name].[contenthash].js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "My App",
    }),
  ],
};
```

`src/index.js`

```javascript
import "./styles.css";

document.body.innerHTML = '<div id="app">Hello from webpack</div>';
```

Build the project:

```bash
npx webpack --mode development
npx webpack --mode production
```

This writes `dist/index.html`. By default the plugin injects scripts into the document and uses `defer` script loading. If webpack emits CSS files, those are added as `<link>` tags in the HTML head.

If another plugin integrates with `html-webpack-plugin` through its hooks, put `new HtmlWebpackPlugin(...)` before that plugin in the `plugins` array.

## Use a template file

Use `template` when you want a real file in your source tree. The default templating syntax is lodash-style interpolation.

`webpack.config.js`

```javascript
const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/[name].[contenthash].js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Dashboard",
      template: "./src/index.ejs",
    }),
  ],
};
```

`src/index.ejs`

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

In templates, the plugin makes these values available by default:

- `htmlWebpackPlugin.options` for the options you passed to the plugin
- `htmlWebpackPlugin.tags.headTags` and `htmlWebpackPlugin.tags.bodyTags` for prepared HTML tags
- `htmlWebpackPlugin.files` for emitted asset lists such as `js`, `css`, `favicon`, and `publicPath`
- `webpackConfig` for the webpack config used in the current compilation
- `compilation` for direct access to webpack compilation data

## Control tag placement and pass template data

When you want full control over where tags are rendered, set `inject: false` and print the prepared tags yourself.

`webpack.config.js`

```javascript
const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/[name].[contenthash].js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: "./src/index.ejs",
      templateParameters: {
        apiBase: process.env.APP_API_BASE ?? "/api",
      },
    }),
  ],
};
```

`src/index.ejs`

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="api-base" content="<%= apiBase %>" />
    <%= htmlWebpackPlugin.tags.headTags %>
  </head>
  <body>
    <div id="app"></div>
    <%= htmlWebpackPlugin.tags.bodyTags %>
  </body>
</html>
```

`templateParameters` can be an object, `false`, or a function that receives the current compilation, assets, prepared tag groups, and resolved plugin options.

## Generate multiple HTML files

Create one plugin instance per page. Use `chunks` when each HTML file should include only specific entry bundles.

`webpack.config.js`

```javascript
const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    app: "./src/app.js",
    admin: "./src/admin.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/[name].[contenthash].js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      chunks: ["app"],
      title: "App",
    }),
    new HtmlWebpackPlugin({
      filename: "admin/index.html",
      chunks: ["admin"],
      title: "Admin",
    }),
  ],
};
```

Use `excludeChunks` when you want to start from all entry chunks and remove a few helper bundles instead.

## Configure metadata, base URL, and production output

The plugin can generate common head tags directly from options.

`webpack.config.js`

```javascript
new HtmlWebpackPlugin({
  filename: "index.[contenthash].html",
  favicon: "./src/favicon.ico",
  scriptLoading: "module",
  meta: {
    viewport: "width=device-width, initial-scale=1",
    "theme-color": "#111827",
    "Content-Security-Policy": {
      "http-equiv": "Content-Security-Policy",
      content: "default-src 'self'",
    },
  },
  base: {
    href: "/",
    target: "_self",
  },
  minify: {
    collapseWhitespace: true,
    keepClosingSlash: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
  },
});
```

Notes for production builds:

- `filename: "index.[contenthash].html"` hashes the final HTML output
- `scriptLoading: "module"` adds `type="module"` and implies deferred loading
- `minify` defaults to production-only behavior when left as `"auto"`
- A custom `minify` object replaces the default production minifier settings; it is not merged with them

## Hook into HTML generation

Plugins can extend `html-webpack-plugin` through compilation hooks. Use `HtmlWebpackPlugin.getCompilationHooks(compilation)` inside your own webpack plugin.

`add-build-hash-plugin.js`

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin");

class AddBuildHashPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap("AddBuildHashPlugin", (compilation) => {
      HtmlWebpackPlugin.getCompilationHooks(compilation).beforeEmit.tapAsync(
        "AddBuildHashPlugin",
        (data, cb) => {
          data.html = data.html.replace(
            "</head>",
            `<meta name="build-hash" content="${compilation.hash}"></head>`,
          );
          cb(null, data);
        },
      );
    });
  }
}

module.exports = AddBuildHashPlugin;
```

`webpack.config.js`

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin");
const AddBuildHashPlugin = require("./add-build-hash-plugin");

module.exports = {
  plugins: [new HtmlWebpackPlugin(), new AddBuildHashPlugin()],
};
```

The documented hook names are:

- `beforeAssetTagGeneration`
- `alterAssetTags`
- `alterAssetTagGroups`
- `afterTemplateExecution`
- `beforeEmit`
- `afterEmit`

## Pitfalls

- Put `HtmlWebpackPlugin` before plugins that expect to tap its hooks
- Use `template` for normal source files; `templateContent` does not use webpack loaders and does not watch for template file changes
- If your assets are served from a CDN or from a different URL root, set `publicPath` explicitly instead of relying on `"auto"`
- Use `chunks` or `excludeChunks` per plugin instance in multi-page builds so each HTML file gets the right entry bundles
- If you render `htmlWebpackPlugin.tags.headTags` and `bodyTags` yourself, keep `inject: false` so placement stays under your control
