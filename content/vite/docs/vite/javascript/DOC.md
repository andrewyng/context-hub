---
name: vite
description: "Vite build tool for JavaScript projects, including local development, production builds, environment handling, configuration, and the Node.js API."
metadata:
  languages: "javascript"
  versions: "7.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "vite,javascript,build,dev-server,bundler,frontend"
---

# Vite JavaScript Guide

## Install

Vite is local build tooling for frontend apps and custom dev/build pipelines. It does not require API keys or service authentication.

`vite@7.3.1` requires Node.js `^20.19.0 || >=22.12.0`.

Install it as a development dependency:

```bash
npm install --save-dev vite
npx vite --version
```

Add the standard scripts to `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

If your package is not using ESM, keep the scripts the same and name the config file `vite.config.mjs` instead of `vite.config.js`.

## Minimal Project Setup

Vite serves an HTML entry file in development and uses it as the build entry by default.

`index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

`src/main.js`

```js
const app = document.querySelector("#app");

app.textContent = "Hello from Vite";
```

`vite.config.js`

```js
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

Start local development:

```bash
npm run dev
```

## Environment Variables and Config

Vite reads env files from `envDir`, which defaults to the project root. Variables whose names start with `envPrefix` are exposed to client code through `import.meta.env`; the default prefix is `VITE_`.

`.env`

```dotenv
VITE_API_BASE_URL=https://api.example.com
APP_PORT=5173
```

`src/api.js`

```js
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

If you need env values while generating the config, use `loadEnv()`:

```js
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: Number(env.APP_PORT || 5173),
      strictPort: true,
    },
    define: {
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL),
    },
  };
});
```

Use `loadEnv()` for config-time decisions. Use `import.meta.env` inside app code.

## Common CLI Workflows

Run the dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Expose the dev server on all interfaces only when you need LAN access:

```bash
npm run dev -- --host 0.0.0.0
```

Build for production with source maps and a manifest:

```bash
npm run build -- --sourcemap --manifest
```

Preview the built output locally:

```bash
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

The build manifest is written to `.vite/manifest.json` under the output directory when manifest mode is enabled. Use it when a backend or server-rendered app needs to map entry names to emitted asset files.

## Node.js API

Vite also exposes a programmatic API from the `vite` package.

### Start a dev server

```js
import { createServer } from "vite";

const server = await createServer({
  root: process.cwd(),
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
});

await server.listen();
server.printUrls();

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});
```

### Run a production build

```js
import { build } from "vite";

await build({
  root: process.cwd(),
  build: {
    outDir: "dist",
    sourcemap: true,
    manifest: true,
  },
});
```

### Preview the production build

```js
import { preview } from "vite";

const previewServer = await preview({
  root: process.cwd(),
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
});

previewServer.printUrls();
```

`preview()` starts a local server for an already-built app. Run `build()` first if `dist/` does not exist yet.

### Mount Vite in an existing Node server

Use middleware mode when another HTTP server owns the request lifecycle.

```js
import http from "node:http";
import { createServer as createViteServer } from "vite";

const app = http.createServer();

const vite = await createViteServer({
  appType: "custom",
  server: {
    middlewareMode: { server: app },
  },
});

app.on("request", vite.middlewares);

app.listen(3000, () => {
  console.log("Custom server listening on http://127.0.0.1:3000");
});
```

Set `appType: "custom"` when your host app, not Vite, is responsible for HTML routing and responses.

## Monorepos and Files Outside Root

`server.fs.allow` accepts absolute paths or paths relative to the project root. By default, Vite searches upward for the nearest workspace root.

When your app needs to serve files from sibling packages, make the allowed paths explicit:

```js
import { defineConfig, searchForWorkspaceRoot } from "vite";

export default defineConfig({
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), "../shared"],
    },
  },
});
```

## Important Pitfalls

- `vite@7.3.1` does not support older Node.js releases; check the engine requirement before debugging odd startup failures.
- Keep client-visible env values under the `VITE_` prefix by default. Values exposed through `import.meta.env` should be treated as public browser config.
- `server.host: "0.0.0.0"` listens on all addresses. Use it only when you intentionally want LAN or public reachability.
- Avoid `server.allowedHosts: true` unless you understand the DNS rebinding risk; Vite documents that setting as not recommended.
- `server.cors: true` allows all origins. Prefer a specific CORS configuration instead of a blanket enable.
- `vite preview` and `preview()` are for inspecting a production build locally. Your real deployment should serve the generated output directory with your production web server or hosting platform.
- If you use a non-root deployment path, set `base` explicitly so generated asset URLs match the deployed location.

## Version-Sensitive Notes

- This guide targets `vite@7.3.1`.
- The current package exports the main JavaScript helpers from `vite`, including `defineConfig`, `loadEnv`, `mergeConfig`, `createServer`, `build`, `preview`, `normalizePath`, and `searchForWorkspaceRoot`.
- The CLI for this version exposes `vite`, `vite build`, and `vite preview`, with `optimize` still present but marked deprecated because dependency pre-bundling now runs automatically.
- The default client env prefix in this version is `VITE_`.

## Official Sources

- https://vite.dev/guide/
- https://vite.dev/guide/api-javascript.html
- https://vite.dev/guide/cli
- https://vite.dev/guide/env-and-mode
- https://vite.dev/config/
- https://vite.dev/config/shared-options
- https://vite.dev/config/server-options
- https://vite.dev/config/build-options
- https://www.npmjs.com/package/vite
- https://github.com/vitejs/vite/tree/main/packages/vite
