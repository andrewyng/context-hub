---
name: webpack-env
description: "TypeScript definitions for webpack-specific runtime APIs such as HMR, require.context, and webpack module variables"
metadata:
  languages: "typescript"
  versions: "1.18.8"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,webpack,hmr,hot-module-replacement,types"
---

# webpack-env TypeScript Guide

`@types/webpack-env` adds ambient TypeScript declarations for webpack-only runtime features such as `module.hot`, `import.meta.webpackHot`, `require.context()`, and globals like `__webpack_public_path__`.

This package only provides `.d.ts` files. It does not install webpack, it does not turn on hot reloading, and it does not provide a runtime by itself.

## Install

If your project already uses webpack, install the declaration package as a development dependency:

```bash
npm install --save-dev @types/webpack-env
```

If you are setting up a minimal TypeScript + webpack development stack for the examples in this guide, install the runtime tooling alongside it:

```bash
npm install --save-dev webpack webpack-cli webpack-dev-server typescript ts-loader @types/webpack-env
```

No environment variables, authentication, or client initialization are required for this package.

## TypeScript Setup

Do not import `@types/webpack-env` in application code. TypeScript loads the declarations automatically after installation.

If your project restricts loaded ambient packages with `compilerOptions.types`, add `webpack-env` explicitly. Most webpack projects that also use Node-style globals keep `node` there too:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "types": ["webpack-env", "node"]
  }
}
```

If you use `import.meta.webpackHot`, keep a module target that preserves `import.meta` for webpack to handle, such as `ES2020` or `ESNext`.

## Enable HMR In Webpack

The typings make HMR APIs available to TypeScript, but webpack still has to enable hot updates at runtime.

```typescript
import webpack from "webpack";
import type { Configuration } from "webpack";

const config: Configuration = {
  mode: "development",
  entry: "./src/index.ts",
  devtool: "inline-source-map",
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  devServer: {
    hot: true,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};

export default config;
```

Without webpack HMR enabled, the types still exist in the compiler, but `module.hot` or `import.meta.webpackHot` will be absent at runtime.

## Accept Updates With `module.hot`

`module.hot` is the common webpack HMR entry point in codebases that compile to webpack-managed modules.

```typescript
import { renderApp } from "./render-app";

renderApp();

if (module.hot) {
  module.hot.accept("./render-app", async () => {
    const next = await import("./render-app");
    next.renderApp();
  });

  module.hot.dispose(() => {
    document.body.replaceChildren();
  });
}
```

Guard the HMR block with `if (module.hot)` so production builds and non-HMR runs do not assume the runtime hook exists.

## Accept Updates With `import.meta.webpackHot`

In ESM-oriented webpack code, use `import.meta.webpackHot` instead of `module.hot`.

```typescript
import { renderApp } from "./render-app";

renderApp();

import.meta.webpackHot?.accept("./render-app", async () => {
  const next = await import("./render-app");
  next.renderApp();
});
```

This pattern is useful when your app already uses `import.meta` and you want to avoid relying on CommonJS-style module state.

## Load Groups Of Modules With `require.context()`

`require.context()` lets webpack build a module context from a directory, a recursion flag, and a file-matching expression.

```typescript
const context = require.context("./features", false, /\.ts$/);

const features = context.keys().map((key) => {
  const featureModule = context<{ default: string }>(key);
  return featureModule.default;
});

console.log(features);
```

This is useful for plugin registration, file-based routing, and test harnesses that need webpack to include a known set of files at build time.

## Set `__webpack_public_path__` Before App Startup

Use `__webpack_public_path__` when your app needs webpack to resolve assets from a runtime-defined base URL.

Create a small bootstrap module that runs first:

```typescript
const runtimeConfig = globalThis as typeof globalThis & {
  __ASSET_BASE_URL__?: string;
};

__webpack_public_path__ = runtimeConfig.__ASSET_BASE_URL__ ?? "/assets/";
```

Then import that module before the rest of your app:

```typescript
import "./set-public-path";
import "./app";
```

This ordering matters because webpack resolves later asset URLs relative to the public path.

## Important Pitfalls

- `@types/webpack-env` only adds TypeScript declarations. Install and configure `webpack` separately.
- Do not import from `@types/webpack-env`; the package is meant to be loaded ambiently by the compiler.
- If `compilerOptions.types` is present and omits `webpack-env`, names like `module.hot` and `require.context()` will appear to be missing.
- `module.hot` and `import.meta.webpackHot` are runtime-optional. Guard them so non-HMR builds still run.
- `require.context()` is webpack-specific. Code that depends on it is not portable to non-webpack bundlers unless they provide a compatible feature.
- `__webpack_public_path__` must be set before modules that rely on webpack-generated asset URLs run.

## Version-Sensitive Notes

- This guide targets `@types/webpack-env==1.18.8`.
- The declarations cover webpack runtime APIs and globals; they do not guarantee a matching webpack configuration.
- `require.ensure()` remains part of webpack's older module-loading surface, but modern webpack guidance prefers standard `import()` for code splitting in new code.
- `import.meta.webpackHot` is the ESM-facing HMR hook; use `module.hot` in older CommonJS-oriented patterns.

## Official Sources

- https://www.npmjs.com/package/@types/webpack-env
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/webpack-env
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/webpack-env/index.d.ts
- https://webpack.js.org/api/hot-module-replacement/
- https://webpack.js.org/guides/dependency-management/#requirecontext
- https://webpack.js.org/guides/public-path/
