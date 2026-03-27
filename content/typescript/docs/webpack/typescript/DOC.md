---
name: webpack
description: "TypeScript guide for webpack configuration, CLI setup, and Node API usage, with practical guidance for webpack's built-in declarations instead of importing from `@types/webpack`."
metadata:
  languages: "typescript"
  versions: "5.28.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,webpack,webpack-cli,bundler,configuration,types,definitelytyped"
---

# webpack TypeScript Guide

## Golden Rule

For current webpack 5 projects, import values and types from `webpack`, not from `@types/webpack`.

The practical TypeScript boundary is the runtime `webpack` package itself: it publishes `types.d.ts`, exports types such as `Configuration`, `RuleSetRule`, `Compiler`, and `Stats`, and exposes the callable `webpack(...)` Node API from the same module.

In practice:

- install `webpack` and `webpack-cli`
- import from `webpack`
- use a TypeScript loader such as `ts-node` if your config file itself is `webpack.config.ts`

## Install

For a typical TypeScript + webpack project:

```bash
npm install -D webpack webpack-cli typescript ts-loader
```

If your webpack config file is also written in TypeScript, add `ts-node` so `webpack-cli` can load `webpack.config.ts`:

```bash
npm install -D ts-node
```

No authentication, API keys, service accounts, or package-specific environment variables are required.

The only environment variable that matters in the TypeScript-config path is `NODE_OPTIONS` when you load an ESM `.mts` config file:

```bash
NODE_OPTIONS="--loader ts-node/esm" npx webpack --config ./webpack.config.mts
```

## Recommended Project Setup

### Use a normal Node-oriented `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": false
  }
}
```

You do not need to add `webpack` to `compilerOptions.types`. That setting is for ambient packages; webpack's declarations come from the `webpack` module itself.

### Type a `webpack.config.ts`

```typescript
import path from "node:path";
import type { Configuration, RuleSetRule } from "webpack";

const rules: RuleSetRule[] = [
  {
    test: /\.ts$/,
    exclude: /node_modules/,
    use: "ts-loader",
  },
];

const config: Configuration = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(process.cwd(), "dist"),
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules,
  },
};

export default config;
```

This keeps your config aligned with the real webpack option surface instead of duplicating shapes by hand.

## CLI Workflow

Run a typed TypeScript config through `webpack-cli`:

```bash
npx webpack --config ./webpack.config.ts
```

`webpack-cli` loads config files through its `interpret` integration. For `.ts` and `.cts` configs, installing `ts-node` is the straightforward setup. For ESM `.mts`, use the explicit Node loader form:

```bash
NODE_OPTIONS="--loader ts-node/esm" npx webpack --config ./webpack.config.mts
```

If you do not want runtime TypeScript config loading, keep the webpack config in JavaScript and continue using webpack's types only in application or tooling code.

## Common Workflows

### Reuse webpack option types in helpers

Use the exported config types to keep shared helpers aligned with webpack's real option shapes.

```typescript
import type { Configuration, RuleSetRule } from "webpack";

export function makeTypescriptRules(): RuleSetRule[] {
  return [
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      use: "ts-loader",
    },
  ];
}

export function makeConfig(mode: Configuration["mode"]): Configuration {
  return {
    mode,
    entry: "./src/index.ts",
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: makeTypescriptRules(),
    },
  };
}
```

Using `Configuration["mode"]` and `RuleSetRule[]` avoids hand-written string unions and ad hoc rule shapes.

### Run webpack programmatically from Node

The `webpack` module exports the callable compiler factory and the related result types.

```typescript
import webpack, { type Configuration } from "webpack";

const config: Configuration = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
  },
};

const compiler = webpack(config);

compiler.run((error, stats) => {
  if (error) {
    throw error;
  }

  if (!stats) {
    return;
  }

  console.log(
    stats.toString({
      colors: true,
      modules: false,
    }),
  );

  compiler.close((closeError) => {
    if (closeError) {
      throw closeError;
    }
  });
});
```

For a single config object, `webpack(config)` returns a `Compiler`. If you pass an array of configs, the return type changes to `MultiCompiler`.

### Type plugin usage from the same module

Plugin classes and plugin instance types come from `webpack` too.

```typescript
import webpack, {
  type Configuration,
  type WebpackPluginInstance,
} from "webpack";

const plugins: WebpackPluginInstance[] = [
  new webpack.DefinePlugin({
    __BUILD_TARGET__: JSON.stringify("web"),
  }),
];

const config: Configuration = {
  mode: "development",
  entry: "./src/index.ts",
  plugins,
};

export default config;
```

This is the cleanest way to keep plugin arrays and plugin constructor calls typed from the same source.

## Important Pitfalls

- Do not import from `@types/webpack` in source files. Import from `webpack`.
- `webpack` provides the compiler and types, but normal CLI usage depends on `webpack-cli`.
- A `webpack.config.ts` file is not executed by Node by itself; `webpack-cli` relies on `interpret`, so you still need a supported loader such as `ts-node` for `.ts` and `.cts` configs.
- ESM `.mts` configs are a separate path: use `NODE_OPTIONS="--loader ts-node/esm"` when invoking `webpack-cli`.
- If your project sets `compilerOptions.types`, that does not replace normal module imports. Keep importing `Configuration`, `RuleSetRule`, and other types from `webpack`.
- `webpack(config)` has different return types for single and multi-config inputs. Helper code that accepts both should type that boundary deliberately.

## Version Notes

- This guide targets `@types/webpack==5.28.5`.
- Current webpack 5 publishes its own declarations through the `webpack` package's `types.d.ts` entry.
- `webpack-cli` currently supports TypeScript config loading through its `interpret` integration for `.ts` and `.cts` configs, with explicit `ts-node/esm` loader usage for `.mts` configs.

## Official Sources

- https://www.npmjs.com/package/@types/webpack
- https://www.npmjs.com/package/webpack
- https://www.npmjs.com/package/webpack-cli
- https://github.com/webpack/webpack
- https://github.com/webpack/webpack-cli
- https://webpack.js.org/api/node/
- https://webpack.js.org/configuration/configuration-languages/
