---
name: esbuild
description: "JavaScript bundler and minifier with practical setup for CLI builds, the JavaScript API, watch mode, code splitting, asset loaders, plugins, and bundle analysis."
metadata:
  languages: "javascript"
  versions: "0.27.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "esbuild,build,bundler,minifier,typescript,javascript"
---

# esbuild

`esbuild` is a JavaScript and CSS bundler/minifier for build-time use. Use the CLI for simple project scripts or the JavaScript API when a tool needs to run builds programmatically.

This package has no auth flow, no package-specific environment variables, and no runtime client to initialize for normal Node.js usage.

## Install

`esbuild@0.27.3` requires Node.js 18 or newer.

Install it as a development dependency:

```bash
npm install --save-dev esbuild
```

Typical `package.json` scripts:

```json
{
  "scripts": {
    "build": "esbuild src/index.ts --bundle --outdir=dist",
    "dev": "esbuild src/index.ts --bundle --outdir=dist --watch"
  }
}
```

## Imports

ES modules:

```javascript
import * as esbuild from "esbuild";
```

CommonJS:

```javascript
const esbuild = require("esbuild");
```

## Environment variables

`esbuild` does not require any package-specific environment variables.

If your app uses environment-based configuration, load it yourself and inject constants with `define` during the build:

```bash
npm install --save-dev dotenv
```

```javascript
import * as esbuild from "esbuild";
import dotenv from "dotenv";

dotenv.config();

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/app.js",
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
    "__API_BASE_URL__": JSON.stringify(process.env.API_BASE_URL ?? "http://localhost:3000"),
  },
});
```

`define` substitutes source code while parsing, so use `JSON.stringify(...)` when you want to inject string literals.

## CLI builds

### Bundle a browser app

```bash
npx esbuild src/main.ts \
  --bundle \
  --platform=browser \
  --format=esm \
  --target=es2020 \
  --sourcemap \
  --outdir=dist
```

### Bundle a Node.js entry point

Use `--packages=external` when package dependencies should stay as runtime imports instead of being bundled into the output.

```bash
npx esbuild src/cli.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --packages=external \
  --outfile=dist/cli.mjs
```

### Watch and serve during development

```bash
npx esbuild src/main.ts \
  --bundle \
  --outdir=www/assets \
  --servedir=www \
  --sourcemap \
  --watch
```

By default, CLI watch mode stops when stdin closes. Use `--watch=forever` if you need watch mode to ignore stdin.

## JavaScript API: basic build

```javascript
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  platform: "browser",
  format: "esm",
  target: ["es2020"],
  sourcemap: true,
  logLevel: "info",
});
```

Important build options used most often:

- `entryPoints`: one or more entry files
- `bundle`: include dependencies in the output
- `outfile`: one output file
- `outdir`: output directory for multiple files
- `platform`: `browser`, `node`, or `neutral`
- `format`: `iife`, `cjs`, or `esm`
- `target`: JavaScript environment target such as `es2020` or `node18`
- `sourcemap`: `true`, `inline`, `external`, `linked`, or `both`

When bundling, the CLI defaults to `iife` for `browser` and `cjs` for `node`. If you need a specific module format, set `format` explicitly.

## Keep output in memory

Set `write: false` when another tool needs the generated files instead of writing them to disk.

```javascript
import * as esbuild from "esbuild";

const result = await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
});

for (const file of result.outputFiles) {
  console.log(file.path);
  console.log(file.text);
}
```

`outputFiles` is only populated when `write: false`.

## Load CSS and static assets

Use `loader` to tell esbuild how to handle non-JavaScript file types.

```javascript
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  outdir: "dist",
  loader: {
    ".css": "css",
    ".png": "file",
    ".svg": "file",
    ".txt": "text",
  },
  assetNames: "assets/[name]-[hash]",
  publicPath: "/static",
});
```

Common loader values include `js`, `jsx`, `ts`, `tsx`, `json`, `css`, `text`, `file`, `dataurl`, and `binary`.

## Code splitting

Use multiple entry points with `splitting: true` to share chunks between outputs.

```javascript
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/home.ts", "src/admin.ts"],
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: "dist",
});
```

Code splitting currently only works with `format: "esm"`.

## Watch mode and local dev server

For long-running builds, create a context and then call `watch()` or `serve()` on that context.

```javascript
import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outdir: "www/assets",
  sourcemap: true,
});

await ctx.watch();

const server = await ctx.serve({
  servedir: "www",
  host: "127.0.0.1",
  port: 3000,
});

console.log(`http://${server.hosts[0]}:${server.port}`);
```

Shut the context down when your process exits:

```javascript
process.on("SIGINT", async () => {
  await ctx.dispose();
  process.exit(0);
});
```

Use `ctx.rebuild()` when you want an explicit rebuild, `ctx.cancel()` to stop an in-flight build, and `ctx.dispose()` for cleanup.

## Transform source without bundling

Use `transform()` when you have source code in memory and only need transpilation or minification.

```javascript
import * as esbuild from "esbuild";

const source = `
  export const answer: number = 42;
  console.log(answer);
`;

const result = await esbuild.transform(source, {
  loader: "ts",
  target: "es2020",
  minify: true,
  sourcemap: "inline",
  sourcefile: "inline.ts",
});

console.log(result.code);
```

Use `transform()` for one-file transforms. Use `build()` when you need module resolution, bundling, loaders, plugins, or output path control.

## Plugins

Plugins are passed with `plugins` on `build()` or `context()` and register hooks in `setup(build)`.

This example provides a virtual module named `env`:

```javascript
import * as esbuild from "esbuild";

const envPlugin = {
  name: "env-plugin",
  setup(build) {
    build.onResolve({ filter: /^env$/ }, () => ({
      path: "env",
      namespace: "env-ns",
    }));

    build.onLoad({ filter: /.*/, namespace: "env-ns" }, () => ({
      contents: `export const NODE_ENV = ${JSON.stringify(process.env.NODE_ENV ?? "development")};`,
      loader: "js",
    }));
  },
};

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/app.js",
  plugins: [envPlugin],
});
```

The plugin API exposes these hook families:

- `onStart()` and `onEnd()` for build lifecycle work
- `onResolve()` for import path resolution
- `onLoad()` for providing file contents
- `onDispose()` for cleanup

## Analyze bundle contents

Use `metafile: true` to get structured output, then pass it to `analyzeMetafile()` for a readable report.

```javascript
import * as esbuild from "esbuild";

const result = await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/app.js",
  metafile: true,
});

const report = await esbuild.analyzeMetafile(result.metafile, {
  verbose: true,
});

console.log(report);
```

CLI equivalent:

```bash
npx esbuild src/index.ts --bundle --outfile=dist/app.js --metafile=meta.json --analyze
```

## Common pitfalls

- `outfile` is for one output file; use `outdir` when you have multiple entry points or multiple generated files.
- `splitting` requires `format: "esm"`.
- `outputFiles` is only returned when `write: false`.
- `watch()` and `serve()` are methods on a build context created with `esbuild.context(...)`, not on `build()`.
- `packages: "external"` keeps package imports out of the bundle. Use it for many Node.js CLIs and libraries where dependencies should still be installed at runtime.
- `define` values are parsed as code fragments. Wrap string values with `JSON.stringify(...)` so the emitted code contains quoted JavaScript strings.
- `esbuild` does not read `.env` files on its own.

## Official references

- API documentation: `https://esbuild.github.io/api/`
- Plugin documentation: `https://esbuild.github.io/plugins/`
- Metafile analysis: `https://esbuild.github.io/analyze/`
