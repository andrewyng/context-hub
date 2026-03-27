---
name: webpack-dev-middleware
description: "Use webpack-dev-middleware to compile with webpack in watch mode and serve emitted assets from memory in a Node development server"
metadata:
  languages: "javascript"
  versions: "7.4.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,middleware,development,express,koa,hono"
---

# webpack-dev-middleware JavaScript Guide

Use `webpack-dev-middleware` when you want your own Node server to run webpack in development and serve the emitted files directly from an in-memory filesystem.

## Prerequisites

- Node.js `>=18.12.0`
- `webpack-dev-middleware@7.4.5`
- `webpack@^5.0.0`
- No authentication or environment variables are required

Install the middleware, webpack, and your server framework:

```bash
npm install --save-dev webpack webpack-dev-middleware
npm install express
```

## Minimal webpack config

`webpack-dev-middleware` serves files from memory, but your webpack config still needs a real `output.path` and a stable `output.publicPath`.

`webpack.config.js`

```js
const path = require("node:path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/assets/",
    clean: true,
  },
};
```

## Express setup

The maintainer README shows `webpack-dev-middleware` as connect-style middleware. Create a webpack compiler, pass it to `devMiddleware()`, and mount the returned middleware on your app.

`server.js`

```js
const express = require("express");
const webpack = require("webpack");
const devMiddleware = require("webpack-dev-middleware");
const webpackConfig = require("./webpack.config.js");

const compiler = webpack(webpackConfig);
const app = express();

const middleware = devMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: "minimal",
});

app.use(middleware);

app.get("/", (req, res) => {
  res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>webpack-dev-middleware</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="${webpackConfig.output.publicPath}main.js"></script>
  </body>
</html>`);
});

const server = app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});

process.on("SIGINT", () => {
  middleware.close(() => {
    server.close(() => process.exit(0));
  });
});
```

Important behavior:

- The browser still reads bundle files from memory, not from `dist/`
- `publicPath` should normally match `output.publicPath`
- The middleware accepts `GET` and `HEAD` requests by default

## Common options

Use the middleware options for caching, response headers, and disk writes.

```js
const middleware = devMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: "minimal",
  headers: {
    "X-Dev-Server": "webpack-dev-middleware",
  },
  etag: "weak",
  lastModified: true,
  cacheControl: false,
  writeToDisk: (filePath) => filePath.endsWith(".css"),
});
```

Notes:

- `writeToDisk` defaults to `false`
- `writeToDisk: true` writes emitted files to disk, but requests are still served from memory
- `writeToDisk` can be a predicate function to select which files are written
- `index: false` disables automatic responses for the root URL
- `cacheImmutable: true` prefers immutable cache headers for hashed assets
- `outputFileSystem` defaults to `memfs`; only override it if you need webpack to emit to a different filesystem object

## Runtime API

The middleware instance is also an API object with helper methods.

```js
const middleware = devMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
});

app.use(middleware);

middleware.waitUntilValid((stats) => {
  if (stats) {
    console.log("Bundle is valid");
  }
});

app.post("/__rebuild", (req, res) => {
  middleware.invalidate(() => {
    res.status(202).send("Rebuild started");
  });
});

app.get("/__asset-path", (req, res) => {
  const filename = middleware.getFilenameFromUrl("/assets/main.js");

  if (!filename) {
    res.status(404).send("Asset not ready");
    return;
  }

  res.send(filename);
});
```

Use these methods when you need to coordinate your own server with webpack state:

- `waitUntilValid(callback)` runs after the current build becomes valid and runs immediately if the bundle is already valid
- `invalidate(callback)` tells webpack to rebuild, which is useful after changing compiler configuration or plugins at runtime
- `getFilenameFromUrl(url)` resolves a served asset URL to the underlying emitted filename
- `close(callback)` stops file watching

## Server-side rendering

`serverSideRender: true` is documented as experimental. When enabled, the middleware adds webpack build data to `res.locals.webpack.devMiddleware` before calling the next middleware.

```js
const path = require("node:path");

function normalizeAssets(assets) {
  if (assets && !Array.isArray(assets) && typeof assets === "object") {
    return Object.values(assets);
  }

  return Array.isArray(assets) ? assets : [assets];
}

app.use(
  devMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    serverSideRender: true,
  }),
);

app.get("/", (req, res) => {
  const { devMiddleware } = res.locals.webpack;
  const jsonWebpackStats = devMiddleware.stats.toJson();
  const mainAssets = normalizeAssets(jsonWebpackStats.assetsByChunkName.main).filter(Boolean);

  const styles = mainAssets
    .filter((asset) => asset.endsWith(".css"))
    .map((asset) =>
      devMiddleware.outputFileSystem.readFileSync(
        path.join(jsonWebpackStats.outputPath, asset),
      ),
    )
    .join("\n");

  const scripts = mainAssets
    .filter((asset) => asset.endsWith(".js"))
    .map((asset) => `<script src="${webpackConfig.output.publicPath}${asset}"></script>`)
    .join("\n");

  res.send(`<!doctype html>
<html>
  <head>${styles}</head>
  <body>
    <div id="app"></div>
    ${scripts}
  </body>
</html>`);
});
```

Use this mode only when you need webpack stats and the in-memory output filesystem inside your own render pipeline.

## Other supported servers

The package also documents wrappers for several non-Express servers.

### Koa

```js
const Koa = require("koa");
const webpack = require("webpack");
const devMiddleware = require("webpack-dev-middleware");
const webpackConfig = require("./webpack.config.js");

const compiler = webpack(webpackConfig);
const app = new Koa();

app.use(
  devMiddleware.koaWrapper(compiler, {
    publicPath: webpackConfig.output.publicPath,
  }),
);

app.listen(3000);
```

### Hono

```js
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import webpack from "webpack";
import devMiddleware from "webpack-dev-middleware";
import webpackConfig from "./webpack.config.js";

const compiler = webpack(webpackConfig);
const app = new Hono();

app.use(
  devMiddleware.honoWrapper(compiler, {
    publicPath: webpackConfig.output.publicPath,
  }),
);

serve(app);
```

### Fastify

Fastify integration in the maintainer README requires `@fastify/express` and is described as a stopgap while full Fastify support is worked on.

```js
const fastify = require("fastify")();
const webpack = require("webpack");
const devMiddleware = require("webpack-dev-middleware");
const webpackConfig = require("./webpack.config.js");

const compiler = webpack(webpackConfig);

async function start() {
  await fastify.register(require("@fastify/express"));
  await fastify.use(
    devMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
    }),
  );
  await fastify.listen({ port: 3000 });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

## Pitfalls

- If unrelated requests hang while webpack is compiling, do not mount the middleware broadly at the app root; use a dedicated route for webpack assets and make sure your webpack `publicPath` matches the URLs you expect to serve
- Do not assume emitted files exist on disk unless you explicitly enable `writeToDisk`
- Do not call `res.end()` or `res.send()` inside `modifyResponseData`; return `{ data, byteLength }` instead
- `serverSideRender` is experimental and may change
