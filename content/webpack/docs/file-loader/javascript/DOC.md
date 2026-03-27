---
name: file-loader
description: "Webpack loader that emits imported files and returns their public URL"
metadata:
  languages: "javascript"
  versions: "6.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,assets,loader,files"
---

# file-loader

`file-loader` resolves a file import or `require()` call to a URL string and emits the referenced file into webpack's output directory.

For `file-loader@6.2.0`, the published package declares:

- Node.js `>= 10.13.0`
- `webpack` peer dependency `^4.0.0 || ^5.0.0`

`file-loader` has no auth flow, no runtime client to initialize, and no environment variables of its own. The only environment-variable example in this guide is an application-level pattern for choosing a runtime CDN prefix.

## Install

Install `file-loader` in the same project as webpack:

```bash
npm install --save-dev webpack webpack-cli file-loader
```

If webpack is already installed, add only the loader:

```bash
npm install --save-dev file-loader
```

## Basic setup

Import a file from your application code:

```javascript
import logoUrl from "./assets/logo.png";

const image = document.createElement("img");
image.src = logoUrl;
image.alt = "Logo";

document.body.append(image);
```

Add a webpack rule for the file types you want to emit:

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
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
};
```

With the default settings, `file-loader` emits the asset using `[contenthash].[ext]` and returns the public URL string for that emitted file.

## Keep source-relative names

Use the `name` option when you want filenames that are easier to inspect during development.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
          context: "src",
        },
      },
    ],
  },
};
```

This keeps the asset's relative path under `src/` in the emitted filename. The `context` option controls which part of the original path is considered the base.

## Separate output path from public URL

`outputPath` controls where webpack writes the file on disk. `publicPath` controls the URL string exported back into your bundle.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "file-loader",
        options: {
          name: "[name].[contenthash].[ext]",
          outputPath: "static/assets",
          publicPath: "/static/assets/",
        },
      },
    ],
  },
};
```

In that configuration:

- webpack writes files under `dist/static/assets/`
- imports receive URLs like `/static/assets/logo.abc123.png`

If you need per-file routing, both `outputPath` and `publicPath` also accept functions with the signature `(url, resourcePath, context) => string`.

## Preserve query strings for CDN-style URLs

If you import assets with query parameters and want those query parameters preserved in the exported URL, include `[query]` in `name`.

```javascript
import imageUrl from "./directory/image.png?width=300&height=300";

console.log(imageUrl);
```

```javascript
module.exports = {
  output: {
    publicPath: "https://cdn.example.com/",
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext][query]",
            },
          },
        ],
      },
    ],
  },
};
```

That pattern produces a URL like:

```text
https://cdn.example.com/directory/image.png?width=300&height=300
```

## Use a runtime-controlled public path

If the CDN host is only known when the app starts, set `__webpack_public_path__` in your entry code and use `postTransformPublicPath` in the loader options.

```javascript
const assetPrefixForNamespace = (namespace) => {
  switch (namespace) {
    case "prod":
      return "https://cache.myserver.net/web";
    case "uat":
      return "https://cache-uat.myserver.net/web";
    case "st":
      return "https://cache-st.myserver.net/web";
    case "dev":
      return "https://cache-dev.myserver.net/web";
    default:
      return "";
  }
};

const namespace = process.env.NAMESPACE;

__webpack_public_path__ = `${assetPrefixForNamespace(namespace)}/`;
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        loader: "file-loader",
        options: {
          name: "[name].[contenthash].[ext]",
          outputPath: "static/assets/",
          publicPath: "static/assets/",
          postTransformPublicPath: (publicPath) => `__webpack_public_path__ + ${publicPath}`,
        },
      },
    ],
  },
};
```

`file-loader` does not read `NAMESPACE` itself. Your application code chooses the runtime prefix, and `postTransformPublicPath` tells the loader to build the final exported URL from `__webpack_public_path__` plus the loader-generated path.

## Skip writing files in server builds

Set `emitFile: false` when you want the public URI string but do not want webpack to write the asset to disk. The maintainer docs call this out as useful for server-side packages.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "file-loader",
        options: {
          emitFile: false,
        },
      },
    ],
  },
};
```

## CommonJS interop

By default, `file-loader` exports ES modules syntax. If another part of your toolchain expects CommonJS output, disable `esModule`.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "file-loader",
        options: {
          esModule: false,
        },
      },
    ],
  },
};
```

Keep the default `esModule: true` unless you have a specific compatibility problem.

## Important options at a glance

- `name`: output filename template such as `[contenthash].[ext]` or `[path][name].[ext]`
- `outputPath`: filesystem directory for emitted files
- `publicPath`: URL prefix returned to application code
- `postTransformPublicPath`: last-step transform for runtime-generated public paths
- `context`: base directory used by path placeholders like `[path]`
- `emitFile`: disable writing files while still returning the URL
- `regExp`: capture path segments and reuse them with placeholders like `[1]`
- `esModule`: switch between ESM export syntax and CommonJS export syntax

## Pitfalls

- `outputPath` and `publicPath` are different: one changes the emitted file location, the other changes the URL your code receives.
- If you rely on asset query strings, include `[query]` in `name`; otherwise the emitted URL drops the original query portion.
- `postTransformPublicPath` is the option to use when the final asset prefix depends on a runtime global such as `__webpack_public_path__`.
- `file-loader` does not expose a CLI and does not initialize anything at runtime; all behavior is configured through webpack loader options.
