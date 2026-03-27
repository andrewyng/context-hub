---
name: webpack-bundle-analyzer
description: "Analyze webpack bundle composition with the BundleAnalyzerPlugin or CLI, generate stats files, and export static reports"
metadata:
  languages: "javascript"
  versions: "5.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,webpack-bundle-analyzer,bundle-analysis,performance,build,javascript"
---

# webpack-bundle-analyzer for JavaScript

`webpack-bundle-analyzer` helps you inspect what is inside a webpack build. In practice you use it in one of two ways:

- add `BundleAnalyzerPlugin` to `webpack.config.js`
- run the `webpack-bundle-analyzer` CLI against a webpack stats file

There is no authentication step.

## Prerequisites

- a JavaScript project that already builds with webpack
- a local webpack config you can edit if you want to use `BundleAnalyzerPlugin`
- emitted bundle files on disk if you want the CLI report to calculate file-based size views from real assets

This guide targets `webpack-bundle-analyzer@5.2.0`. Examples use a CommonJS `webpack.config.js` in a webpack 5-style project.

## Install

```bash
npm install --save-dev webpack-bundle-analyzer
```

If webpack is not already installed in the project, install it too:

```bash
npm install --save-dev webpack webpack-cli
```

## Minimal plugin setup

Use the plugin when you want the report generated directly from your normal webpack build.

```javascript
const path = require("node:path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [new BundleAnalyzerPlugin()],
};
```

Run a production build:

```bash
npx webpack --mode production
```

That build runs the analyzer in its default interactive mode and serves a local report for the generated bundle.

## Enable analysis only when requested

In most projects you do not want the analyzer running on every build. Gate it behind an environment variable and use a static HTML report for CI or one-off checks.

```javascript
const path = require("node:path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const plugins = [];

if (process.env.ANALYZE === "true") {
  plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      reportFilename: path.resolve(__dirname, "dist/bundle-report.html"),
    })
  );
}

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins,
};
```

Run it only when needed:

```bash
ANALYZE=true npx webpack --mode production
```

This keeps regular builds unchanged and writes a reusable HTML report under `dist/bundle-report.html` when analysis is enabled.

## Generate `stats.json` during a build

If you want webpack stats without opening the analyzer UI, disable the analyzer UI and ask the plugin to emit a stats file.

```javascript
const path = require("node:path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "disabled",
      generateStatsFile: true,
      statsFilename: "stats.json",
    }),
  ],
};
```

Run the build normally:

```bash
npx webpack --mode production
```

Use this when another tool or a later step will inspect the stats file.

## Analyze an existing stats file from the CLI

Use the CLI when you already have webpack stats or when you do not want to modify the webpack config.

Generate a stats file from webpack:

```bash
npx webpack --profile --json > stats.json
```

Then analyze it:

```bash
npx webpack-bundle-analyzer stats.json dist/
```

The first argument is the webpack stats JSON file. The second argument is the directory containing the emitted bundle files.

Passing the bundle directory is important when you want the report to calculate file-based views from the built assets instead of relying only on the stats payload.

## Common options

These are the options you will use most often:

- `analyzerMode`: use `"server"` for a local interactive report, `"static"` for an HTML file, or `"disabled"` when you only want `stats.json`
- `openAnalyzer`: set `false` in CI or headless environments so the build does not try to open a browser
- `reportFilename`: path for the static HTML report
- `generateStatsFile`: write webpack stats to disk during the build
- `statsFilename`: output path for the generated stats file
- `defaultSizes`: pick the initial size view with `"stat"`, `"parsed"`, `"gzip"`, or `"brotli"`
- `excludeAssets`: hide assets you do not want in the report, such as source maps

Example excluding source maps from the report:

```javascript
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      excludeAssets: [/\.map$/],
    }),
  ],
};
```

## Practical workflow

For local investigation, this is usually enough:

1. build with `BundleAnalyzerPlugin` enabled
2. inspect the largest packages and duplicated dependencies in the treemap
3. switch the initial view with `defaultSizes` if you care about transfer size rather than raw bundle size
4. rerun the production build after changing imports, split points, or dependency choices

For CI or shareable output, prefer `analyzerMode: "static"` with `openAnalyzer: false` so the build leaves behind an HTML artifact.

## Important pitfalls

- analyze a production build if you care about shipped size; development builds can be much noisier and less representative
- the CLI expects webpack stats JSON, not a generated `bundle.js` file
- if you use the CLI without pointing it at the emitted bundle directory, some size views depend on what is available in the stats payload versus the built files on disk
- source maps and copied assets can dominate the visualization; filter them out with `excludeAssets` if they are not relevant to the question you are answering

## Version notes

- this doc covers `webpack-bundle-analyzer@5.2.0`
- examples use `require(...)` in `webpack.config.js`; if your webpack config is ESM, import `BundleAnalyzerPlugin` from `webpack-bundle-analyzer` and construct it the same way
