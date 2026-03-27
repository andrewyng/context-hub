---
name: copy-webpack-plugin
description: "Copy existing files and directories into webpack output with glob patterns, transforms, and overwrite controls"
metadata:
  languages: "javascript"
  versions: "14.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,assets,copy,plugin"
---

# copy-webpack-plugin

`copy-webpack-plugin` copies files and directories that already exist in your source tree into webpack's output directory.

There are no API keys, runtime environment variables, or client objects to initialize. All setup happens in `webpack.config.js`.

## Install

If webpack is not installed yet:

```bash
npm install --save-dev webpack webpack-cli copy-webpack-plugin
```

If your project already uses webpack:

```bash
npm install --save-dev copy-webpack-plugin
```

## What it is for

Use this plugin for static assets that are already on disk before the build starts, such as:

- HTML templates
- icons and images outside your import graph
- public files like `robots.txt` or `manifest.webmanifest`
- vendor assets you want copied without bundling

Do not use it to copy files generated during the same webpack build.

## Minimal setup

`webpack.config.js`

```js
const path = require("node:path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "public",
          to: "public",
        },
        {
          from: "src/index.html",
          to: "index.html",
        },
      ],
    }),
  ],
};
```

`patterns` is the required top-level option. Each pattern can be a string shorthand or an object, but the object form is easier to maintain because it makes `from`, `to`, and related options explicit.

## `from`: file, directory, or glob

The `from` field accepts a file path, a directory path, or a glob string.

```js
const path = require("node:path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public/favicon.ico", to: "favicon.ico" },
        { from: "public/images", to: "images" },
        { from: "public/**/*.txt", to: "docs/[name][ext]" },
        {
          from: path.posix.join(
            path.resolve(__dirname, "public").replaceAll("\\", "/"),
            "**/*",
          ),
          to: "assets",
        },
      ],
    }),
  ],
};
```

Important rules from the maintainer docs:

- Glob patterns must be strings
- Use forward slashes in glob patterns, even on Windows
- If you build an absolute glob on Windows, normalize it to forward slashes first

## `context` and preserving relative paths

`context` defines the base directory that webpack prepends to `from`, and then removes again when it calculates the emitted relative path.

Use it when you want a stable base path for a glob or when you want to move a tree under a new destination root.

```js
const path = require("node:path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "**/*",
          context: path.resolve(__dirname, "public"),
          to({ context, absoluteFilename }) {
            const relativePath = path
              .relative(context, absoluteFilename)
              .replaceAll("\\", "/");

            return `static/${relativePath}`;
          },
        },
      ],
    }),
  ],
};
```

The `to` option can be either:

- a string destination
- a function `({ context, absoluteFilename }) => string | Promise<string>`

When `to` is a function, return forward-slash paths, not backslash-separated Windows paths.

## Ignore files and use `filter` only for content-aware decisions

For path-based exclusions, prefer `globOptions.ignore`.

```js
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "public/**/*",
          globOptions: {
            ignore: [
              "**/*.map",
              "**/.DS_Store",
            ],
          },
        },
      ],
    }),
  ],
};
```

Use `filter` when the decision depends on the file contents or some other runtime check:

```js
const fs = require("node:fs/promises");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "public/**/*",
          async filter(resourcePath) {
            const content = await fs.readFile(resourcePath, "utf8");

            return !content.includes("DO_NOT_COPY");
          },
        },
      ],
    }),
  ],
};
```

If some files are optional, set `noErrorOnMissing: true` for that pattern:

```js
const path = require("node:path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "branding", "favicon.ico"),
          to: "favicon.ico",
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
};
```

## Transform copied files

Use `transform` when you need to rewrite the copied file contents before they are emitted.

```js
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "public/app-config.js",
          to: "app-config.js",
          transform: {
            transformer(content) {
              return content
                .toString()
                .replaceAll("__APP_VERSION__", process.env.npm_package_version || "dev");
            },
            cache: true,
          },
        },
      ],
    }),
  ],
};
```

Notes:

- The `content` argument is a Node `Buffer`
- `transform` can be a function or an object with `transformer` and `cache`
- `cache: true` enables cached transform results between builds

## Combine multiple files into one output

Use `transformAll` when several matched files should produce a single emitted file.

```js
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "licenses/**/*.txt",
          to: "THIRD_PARTY_LICENSES.txt",
          transformAll(assets) {
            return assets
              .map((asset) => `## ${asset.sourceFilename}\n${asset.data.toString()}`)
              .join("\n\n");
          },
        },
      ],
    }),
  ],
};
```

For `transformAll`, the maintainer docs call out one important restriction: `to` must point to a file, and only `[contenthash]` and `[fullhash]` placeholders are allowed in that filename.

## Resolve destination conflicts with `force` and `priority`

If two patterns emit the same destination filename, use `force: true` plus `priority` to control which one wins.

```js
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "branding/default/logo.svg",
          to: "logo.svg",
          priority: 5,
        },
        {
          from: "branding/customer/logo.svg",
          to: "logo.svg",
          force: true,
          priority: 10,
        },
      ],
    }),
  ],
};
```

Higher-priority patterns are copied later. Without `force: true`, the plugin does not overwrite an existing asset in `compilation.assets`.

## Destination type and filename templates

In most cases the plugin can infer whether `to` is a directory, a file, or a template. Set `toType` manually when the destination is ambiguous.

```js
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "config/default.json",
          to: "config.prod",
          toType: "file",
        },
        {
          from: "images/**/*",
          to: "[path][name].[contenthash][ext]",
          toType: "template",
        },
      ],
    }),
  ],
};
```

Use `toType: "file"` or `toType: "dir"` when a destination looks ambiguous, such as a directory name with an extension-like suffix or a dotfile-style filename.

## Asset metadata

Use `info` to add webpack asset info to copied files.

```js
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "vendor/**/*.js",
          info: { minimized: true },
        },
      ],
    }),
  ],
};
```

The maintainer docs call out `info: { minimized: true }` as the way to mark copied JavaScript files so a minimizer can skip processing them again.

## Monorepos and hoisted dependencies

In workspaces and monorepos, relative paths under `node_modules` can break when packages are hoisted. Resolve the package root explicitly with `require.resolve()`.

```js
const path = require("node:path");
const CopyPlugin = require("copy-webpack-plugin");

const packageRoot = path.dirname(require.resolve("some-package/package.json"));

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: `${packageRoot}/assets`,
          to: "vendor/some-package",
        },
      ],
    }),
  ],
};
```

## Common pitfalls

- `copy-webpack-plugin` copies files that already exist; it is not for copying assets generated during the same compilation
- Glob paths should use `/`, not `\`
- Prefer `globOptions.ignore` for path-based exclusions; reserve `filter` for content-aware checks
- Flattening with `to: "[name][ext]"` can create filename collisions when different directories contain the same basename
- If you expect copied files on disk while using `webpack-dev-server`, remember that development middleware often serves from memory; writing to disk is a separate setting on the dev middleware side
- If a destination is ambiguous, set `toType` explicitly rather than relying on inference

## Performance knob

The plugin also accepts `options.concurrency` to limit simultaneous filesystem work. The maintainer docs show a default of `100`.

```js
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public", to: "public" },
      ],
      options: {
        concurrency: 50,
      },
    }),
  ],
};
```
