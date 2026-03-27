---
name: source-map-loader
description: "Webpack loader that extracts existing JavaScript source maps before other loaders run"
metadata:
  languages: "javascript"
  versions: "5.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,build,loader,source-maps,debugging"
---

# source-map-loader

`source-map-loader` reads existing `sourceMappingURL` comments from JavaScript files and passes that map data into webpack. Use it when your app depends on libraries that already ship source maps and you want webpack's final bundle to keep accurate debugging information.

For `source-map-loader@5.0.0`, the published package declares:

- Node.js `>= 18.12.0`
- `webpack` peer dependency `^5.72.1`

`source-map-loader` has no auth flow, no runtime client to initialize, and no package-specific environment variables. You do not import it in application code; you reference it by loader name in `webpack.config.js`.

## Install

Install the loader alongside webpack:

```bash
npm install --save-dev webpack webpack-cli source-map-loader
```

If webpack is already present, add only the loader:

```bash
npm install --save-dev source-map-loader
```

## Basic setup

Set webpack to emit source maps, then run `source-map-loader` as a pre-loader for JavaScript files:

```javascript
const path = require("node:path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
};
```

Add a build script and run webpack:

```json
{
  "scripts": {
    "build": "webpack --config webpack.config.js"
  }
}
```

```bash
npm run build
```

`source-map-loader` extracts both inline source maps and maps linked by URL. webpack then decides how those maps appear in the final build through `devtool`.

## Limit which files are scanned

The loader can read source maps from any matching JavaScript file, including files under `node_modules`. Narrow the rule when you only want specific directories or when vendor packages ship broken maps.

Process only your application source:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /src/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
};
```

Exclude a package that produces unusable source-map references:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        exclude: /node_modules\/broken-package/,
        use: ["source-map-loader"],
      },
    ],
  },
};
```

Use `include` and `exclude` deliberately. The maintainer README notes that this helps keep bundling performance predictable.

## Control `sourceMappingURL` handling

`source-map-loader` exposes one loader option, `filterSourceMappingUrl`, for deciding what to do with each `sourceMappingURL` comment.

The callback receives `(url, resourcePath)` and can return:

- `true` or `"consume"` to consume the source map and remove the comment
- `false` or `"remove"` to ignore the source map and remove the comment
- `"skip"` to ignore the source map and keep the comment in the file

Example:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: [
          {
            loader: "source-map-loader",
            options: {
              filterSourceMappingUrl: (url, resourcePath) => {
                if (/broker-source-map-url\.js$/i.test(url)) {
                  return false;
                }

                if (/keep-source-mapping-url\.js$/i.test(resourcePath)) {
                  return "skip";
                }

                return true;
              },
            },
          },
        ],
      },
    ],
  },
};
```

Use this when one dependency has bad source-map URLs but the rest of your dependency graph should still be processed normally.

## Ignore known bad source-map warnings

Some third-party packages publish `.js` files with missing or malformed source maps. webpack can still build, but it may warn with messages such as `Failed to parse source map`.

If you have already decided those warnings are safe to ignore, suppress them at the webpack level:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
  ignoreWarnings: [/Failed to parse source map/],
};
```

Prefer narrowing the rule with `include`, `exclude`, or `filterSourceMappingUrl` first. Use `ignoreWarnings` when you want a quieter build log but do not want to stop processing the rest of your maps.

## Common pitfalls

- Keep `enforce: "pre"` on the rule so the loader runs before normal transforms.
- Set webpack `devtool` explicitly. `source-map-loader` reads existing maps; it does not choose your final source-map output format.
- Match JavaScript files. The maintainer docs describe this loader as extracting maps from JavaScript entries and JavaScript files.
- Expect `node_modules` to be included unless you scope the rule more narrowly.
- Do not import `source-map-loader` from app code. Configure it in webpack only.

## Version notes for 5.0.0

- The npm metadata for `5.0.0` declares Node.js `>= 18.12.0`.
- The npm metadata for `5.0.0` declares a `webpack` peer dependency of `^5.72.1`.
- The public maintainer README for the latest release documents a single loader option: `filterSourceMappingUrl`.
