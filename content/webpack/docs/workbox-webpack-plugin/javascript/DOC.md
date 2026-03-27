---
name: workbox-webpack-plugin
description: "Webpack plugin for generating or injecting a Workbox service worker and precache manifest"
metadata:
  languages: "javascript"
  versions: "7.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "webpack,workbox,service-worker,pwa,build"
---

# workbox-webpack-plugin

`workbox-webpack-plugin` integrates Workbox into a webpack build. Use it to either:

- generate a ready-to-use service worker with `GenerateSW`, or
- compile your own service worker source and inject a precache manifest with `InjectManifest`.

For `workbox-webpack-plugin@7.4.0`, the published package declares:

- Node.js `>= 20.0.0`
- webpack peer dependency `^4.4.0 || ^5.91.0`

This package has no auth flow, no package-specific environment variables, and no runtime client to initialize. It runs inside your webpack build, and you register the emitted service worker from your web app separately.

## Install

Install webpack and the plugin in the same project:

```bash
npm install --save-dev webpack webpack-cli workbox-webpack-plugin
```

If you are using `InjectManifest` and your custom service worker imports Workbox runtime modules, add those packages explicitly as well:

```bash
npm install --save-dev \
  workbox-webpack-plugin \
  workbox-core \
  workbox-precaching \
  workbox-routing \
  workbox-strategies
```

## Choose the plugin mode

### `GenerateSW`

Use `GenerateSW` when you want the plugin to create the service worker file for you.

This is the simpler option when you only need:

- precaching for webpack assets
- SPA navigation fallback
- runtime caching rules for images, API responses, or similar requests

### `InjectManifest`

Use `InjectManifest` when you need to write the service worker yourself.

This is the better fit when you need custom event handlers, custom routing logic, push handlers, sync handlers, or other service worker code that should live in your own `swSrc` file.

## Generate a service worker with `GenerateSW`

`webpack.config.js`:

```javascript
const path = require("node:path");
const { GenerateSW } = require("workbox-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.[contenthash].js",
    clean: true,
  },
  plugins: [
    new GenerateSW({
      swDest: "service-worker.js",
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: false,
      navigateFallback: "/index.html",
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === "image",
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "images",
            expiration: {
              maxEntries: 60,
            },
          },
        },
        {
          urlPattern: ({ url }) => url.origin === "https://api.example.com",
          handler: "NetworkFirst",
          options: {
            cacheName: "api",
            networkTimeoutSeconds: 3,
          },
        },
      ],
    }),
  ],
};
```

Build with webpack:

```bash
npx webpack --config webpack.config.js
```

Important details in that configuration:

- `swDest` is the emitted service worker asset name. For `GenerateSW`, the default is `service-worker.js`.
- `navigateFallback` should point at an HTML document that is also present in the precache manifest.
- `skipWaiting: false` keeps the generated message listener so a waiting worker can be activated via `postMessage({ type: "SKIP_WAITING" })`.
- `clientsClaim: true` lets the new worker start controlling already-open pages after activation.

## Register the emitted service worker

The plugin writes the service worker file during the webpack build. Your application still needs to register that file in the browser:

```javascript
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/service-worker.js");
    } catch (error) {
      console.error("Service worker registration failed", error);
    }
  });
}
```

Register the URL that matches where webpack publishes `swDest`.

If you keep `skipWaiting: false` and want to activate an update immediately, post the generated message type to the waiting worker:

```javascript
async function activateWaitingWorker() {
  const registration = await navigator.serviceWorker.getRegistration();

  if (registration?.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}
```

## Use `InjectManifest` for a custom service worker

With `InjectManifest`, webpack compiles your `swSrc` file and replaces `self.__WB_MANIFEST` with the generated precache manifest.

`webpack.config.js`:

```javascript
const path = require("node:path");
const { InjectManifest } = require("workbox-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.[contenthash].js",
    clean: true,
  },
  plugins: [
    new InjectManifest({
      swSrc: "./src/sw.js",
      swDest: "service-worker.js",
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    }),
  ],
};
```

`src/sw.js`:

```javascript
import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "images",
  }),
);
```

Key `InjectManifest` behavior:

- `swSrc` is required.
- `compileSrc` defaults to `true`, so the source service worker is compiled by webpack.
- `swDest` is optional, but setting it explicitly keeps the emitted filename predictable.
- If you set `compileSrc: false`, `webpackCompilationPlugins` cannot be used.

## Common options that matter in real projects

### Control which assets are precached

Use `include`, `exclude`, `chunks`, and `excludeChunks` to control which webpack assets make it into the precache manifest.

```javascript
new GenerateSW({
  include: [/\.html$/, /\.js$/, /\.css$/],
  exclude: [/\.map$/, /^server\//],
  excludeChunks: ["admin"],
});
```

The webpack-specific `exclude` default omits source maps and assets matching `manifest.*.js`.

### Raise the precache size limit when needed

By default, files over `2097152` bytes are not precached.

```javascript
new GenerateSW({
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
});
```

Only raise this when you intentionally want larger assets in precache storage.

### Avoid extra cache-busting for already-hashed filenames

If your emitted assets already contain stable hashes in their filenames, set `dontCacheBustURLsMatching` so Workbox can treat those URLs as versioned:

```javascript
new GenerateSW({
  dontCacheBustURLsMatching: /\.[0-9a-f]{8,}\./,
});
```

### Rewrite manifest URLs when deploy paths differ

Use `modifyURLPrefix` when your build output path and public asset path do not match exactly:

```javascript
new GenerateSW({
  modifyURLPrefix: {
    "": "/static",
  },
});
```

### Add extra URLs to the precache manifest

Use `additionalManifestEntries` for URLs that are not emitted by webpack but should still be precached.

```javascript
new GenerateSW({
  additionalManifestEntries: [
    "/offline.html",
    { url: "/app-shell", revision: "2026-03-13" },
  ],
});
```

## SPA fallback and navigation preload

For a single-page app, use `navigateFallback` for navigation requests that are not already precached. Restrict it if parts of the site should never resolve to the app shell:

```javascript
new GenerateSW({
  navigateFallback: "/index.html",
  navigateFallbackAllowlist: [/^\/app/],
  navigateFallbackDenylist: [/^\/api\//, /^\/admin\//],
});
```

If you enable `navigationPreload`, also add a runtime caching route that handles navigation requests.

## Important pitfalls

- Choose exactly one plugin instance for the service worker file you want to emit: `GenerateSW` or `InjectManifest`.
- `InjectManifest` expects the `injectionPoint` placeholder to exist in `swSrc`; the default placeholder is `self.__WB_MANIFEST`.
- Keep the placeholder in `swSrc` only where you want the manifest inserted.
- `navigateFallback` only works for routes where returning the same HTML document is valid.
- The package generates service worker assets during the build, but it does not register them for you in the browser.

## Minimal decision guide

- Use `GenerateSW` when you want webpack to emit a ready-made service worker from configuration.
- Use `InjectManifest` when you need custom service worker source code and still want webpack assets precached automatically.
