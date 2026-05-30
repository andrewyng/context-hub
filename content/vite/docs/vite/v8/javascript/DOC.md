---
name: vite
description: "Vite build tool for JavaScript projects, including local development, production builds, environment handling, configuration, and the Node.js API."
metadata:
  languages: "javascript"
  versions: "8.0.0"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "vite,javascript,build,dev-server,bundler,frontend"
---

# Vite JavaScript Guide

## Install

Vite is local build tooling for frontend apps and custom dev/build pipelines. It does not require API keys or service authentication.

`vite@8.0.0` requires Node.js `20.19+` or `22.12+`.

Install the package directly in an existing project:

```bash
npm install --save-dev vite@8.0.0
npx vite --version
```

Or scaffold a new app with the official starter:

```bash
npm create vite@8.0.0 my-app -- --template vanilla
cd my-app
npm install
```

Standard scripts:

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

Vite serves an HTML entry file in development and uses it as the default build entry.

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

app.textContent = "Hello from Vite 8";
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
    manifest: true,
  },
});
```

Start development:

```bash
npm run dev
```

## Environment Variables and Modes

Vite exposes client-safe variables on `import.meta.env`. By default, only variables whose names start with `VITE_` are exposed to browser code.

`.env`

```dotenv
VITE_API_BASE_URL=https://api.example.com
APP_PORT=5173
```

`src/api.js`

```js
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

If you need env values while computing config, use `loadEnv()`:

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

Build for production:

```bash
npm run build
```

Build with a non-root public base path:

```bash
npm run build -- --base=/my/public/path/
```

Preview the built output locally:

```bash
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

## Build Customization

For production builds, Vite 8 targets Baseline Widely Available browsers by default:

- Chrome `>=111`
- Edge `>=111`
- Firefox `>=114`
- Safari `>=16.4`

If you need different output assumptions, set `build.target`. For deeper bundler control in Vite 8, use `build.rolldownOptions`:

```js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      // Rolldown input/output options here
    },
  },
});
```

If you deploy under a nested or unknown base path, configure `base` explicitly. Use `base: "./"` or `base: ""` for relative asset URLs.

## Node.js API

Vite exposes a JavaScript API from the `vite` package.

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

- `vite@8.0.0` does not support older Node.js releases; verify the runtime before debugging startup failures.
- Values exposed through `import.meta.env` should be treated as public browser config. Keep secrets out of `VITE_*` variables.
- `server.host: "0.0.0.0"` listens on all addresses. Use it only when you intentionally want LAN or public reachability.
- `vite preview` and `preview()` are for local inspection of a production build, not for serving production traffic.
- If you use a non-root deployment path, set `base` explicitly so generated asset URLs match the deployed location.
- Vite 8 switches core bundling and optimization to Rolldown and Oxc. If your config or plugins rely on esbuild-specific behavior, review the migration guide before shipping.

## Version-Sensitive Notes

- This guide targets `vite@8.0.0`.
- Vite 8 uses Rolldown-based build and dependency optimization, Oxc for JavaScript transforms and JavaScript minification, and Lightning CSS for CSS minification.
- `optimizeDeps.esbuildOptions` and the top-level `esbuild` config are compatibility layers in this version. Prefer `optimizeDeps.rolldownOptions` and `oxc`.
- If a plugin still calls `transformWithEsbuild`, install `esbuild` as a `devDependency` and plan a migration to `transformWithOxc`.
- Review [references/migration-from-v7.md](references/migration-from-v7.md) before upgrading a Vite 7 project with custom optimizer, minifier, decorator, or CommonJS interop behavior.

## Official Sources

- https://vite.dev/guide/
- https://vite.dev/guide/build
- https://vite.dev/guide/cli
- https://vite.dev/guide/env-and-mode
- https://vite.dev/guide/api-javascript
- https://vite.dev/guide/migration
- https://vite.dev/config/
- https://vite.dev/config/shared-options
- https://vite.dev/config/dep-optimization-options
- https://vite.dev/releases
- https://www.npmjs.com/package/vite
