---
name: webpack-dev-server
description: "Run webpack in development with a local HTTP server, automatic rebuilds, HMR, static file serving, and browser-side error reporting"
metadata:
  languages: "javascript"
  versions: "5.2.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,dev-server,hmr,proxy,development"
---

# webpack-dev-server JavaScript Guide

`webpack-dev-server` starts a local development server for a webpack build, serves emitted assets, watches files, and refreshes or hot-updates the browser while you work.

For `webpack-dev-server@5.2.3`, the published package declares:

- Node.js `>=18.12.0`
- `webpack` peer dependency `^5.0.0`
- No authentication flow and no required package-specific environment variables

The package README recommends installing it locally in your project and using it through `webpack serve`.

## Install

Install webpack, the CLI, and the dev server together:

```bash
npm install --save-dev webpack webpack-cli webpack-dev-server
```

Add a development script:

```json
{
  "scripts": {
    "dev": "webpack serve --config ./webpack.config.js --mode development"
  }
}
```

Run it with:

```bash
npm run dev
```

If you do not set `host` or `port`, the maintainer README says the server listens on `localhost:8080`.

## Minimal webpack config

`webpack-dev-server` is configured through the `devServer` section of your webpack config.

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
  devtool: "eval-source-map",
  devServer: {
    host: "localhost",
    port: 3000,
    hot: true,
    open: true,
    static: {
      directory: path.resolve(__dirname, "public"),
      publicPath: "/",
    },
    client: {
      overlay: true,
      logging: "info",
    },
  },
};
```

Important details:

- `output.publicPath` controls where the compiled bundle is served in the browser
- `devServer.static` serves extra files such as `index.html`, icons, or mock JSON from disk
- You do not import a separate browser client in application code; the dev server manages its own client unless you disable it with `client: false`

With the config above, `public/index.html` can reference the bundle like this:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>webpack-dev-server</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="/assets/main.js"></script>
  </body>
</html>
```

## Single-page app routing

If your application uses client-side routing, enable the history API fallback so deep links resolve to your app entry page instead of returning 404s.

```js
module.exports = {
  devServer: {
    historyApiFallback: true,
  },
};
```

Use this for routers that expect `/users/42` or `/settings/profile` to be handled by the browser app, not by static file lookup.

## Proxy a separate backend

Use `proxy` when your frontend runs on webpack-dev-server but your API runs on another local process.

```js
module.exports = {
  devServer: {
    proxy: [
      {
        context: ["/api", "/auth"],
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    ],
  },
};
```

This keeps frontend requests on the same origin during development while forwarding matching paths to the backend server.

## Static files and extra watched files

If you do not configure `devServer.static`, `5.2.3` normalizes it to `process.cwd()/public` and serves that directory at `/`.

You can watch additional files outside the webpack module graph and trigger a reload when they change:

```js
const path = require("node:path");

module.exports = {
  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"),
      watch: true,
    },
    watchFiles: ["src/**/*.html", "templates/**/*.njk"],
  },
};
```

Use `watchFiles` for templates, CMS-generated files, or other assets that webpack itself does not import.

## HTTPS development server

The server type can be `http`, `https`, `spdy`, or `http2`. For local HTTPS, pass certificate files through `devServer.server.options`.

`webpack.config.js`

```js
const fs = require("node:fs");

module.exports = {
  devServer: {
    server: {
      type: "https",
      options: {
        key: fs.readFileSync("./certs/localhost-key.pem"),
        cert: fs.readFileSync("./certs/localhost.pem"),
      },
    },
  },
};
```

This is the right place to configure local TLS when your app needs secure cookies, service workers, or browser APIs that require HTTPS.

## Reverse proxy or container networking

When the browser cannot infer the websocket endpoint correctly, set `client.webSocketURL` explicitly.

```js
module.exports = {
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    client: {
      webSocketURL: {
        protocol: "ws",
        hostname: "localhost",
        port: 3000,
        pathname: "/ws",
      },
    },
    webSocketServer: "ws",
  },
};
```

This is useful when you run through Docker, a local reverse proxy, or a forwarded development hostname and the HMR client would otherwise connect to the wrong origin.

## Start the server from Node

The README recommends the CLI first, but the package also exports a `Server` class. Construct it with a dev-server options object and a webpack compiler, then call `start()`.

`dev-server.js`

```js
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config.js");

async function main() {
  const compiler = webpack(webpackConfig);
  const server = new WebpackDevServer(
    {
      host: "localhost",
      port: 3000,
      hot: true,
    },
    compiler,
  );

  await server.start();

  const close = async () => {
    await server.stop();
    process.exit(0);
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Use the API when you need to embed the dev server in a larger Node process instead of delegating to `webpack serve`.

## TypeScript webpack config typing

If you write `webpack.config.ts`, type `devServer` explicitly so TypeScript accepts the `Configuration.devServer` property.

```ts
import type { Configuration } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

const devServer: DevServerConfiguration = {
  port: 3000,
  hot: true,
};

const config: Configuration = {
  mode: "development",
  devServer,
};

export default config;
```

## Common pitfalls

- Install `webpack-cli` if you want to use `webpack serve`; `webpack-dev-server` alone is not the CLI entry point
- Keep the package local to the project. The maintainer README recommends local installation over global installation
- Do not add `HotModuleReplacementPlugin` manually just because you set `devServer.hot`; `webpack-dev-server@5.2.3` applies it automatically when HMR is enabled
- Set `historyApiFallback: true` for browser-router SPAs or deep links will 404
- Be explicit about `output.publicPath` and `devServer.static.publicPath` so your HTML, emitted bundles, and extra static assets line up
- Prefer a specific `allowedHosts` list when exposing the dev server through another hostname; `all` is broad and should be used intentionally
