---
name: cssnano
description: "TypeScript guidance for `cssnano` 5.1.x. The `@types/cssnano` 5.1.3 package entry is not the runtime integration boundary; current projects should install `cssnano`, rely on its bundled declarations, and use it through PostCSS or a build script."
metadata:
  languages: "typescript"
  versions: "5.1.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,cssnano,postcss,css,minification,types,definitelytyped,npm"
---

# cssnano TypeScript Guide

## Golden Rule

For current `cssnano` 5.1.x projects, install `cssnano` and `postcss`, then import from `"cssnano"`.

`@types/cssnano` `5.1.3` is not the package you should target in application code. The published `cssnano` runtime package includes its own `types/index.d.ts` in the `5.1.x` line, and that runtime export is the TypeScript surface you actually use.

In practice:

- install `cssnano`
- install `postcss`
- import from `cssnano`, never from `@types/cssnano`
- remove `@types/cssnano` if your project added it directly

## Install

Install the runtime package and its PostCSS peer dependency:

```bash
npm install cssnano postcss
npm install -D typescript
```

If your project already added the old declaration package directly, remove it:

```bash
npm uninstall @types/cssnano
```

No credentials, API keys, service accounts, or package-specific environment variables are required.

## Initialization

The important setup points are:

- import the runtime package directly
- keep `postcss` installed, because `cssnano` runs as a PostCSS processor/plugin creator
- decide whether you want inline options or a config file discovered from the current working directory

### Import from `cssnano`

The bundled declaration file uses `export =`, so the most portable TypeScript import is:

```typescript
import cssnano = require("cssnano");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import cssnano from "cssnano";
```

Do not import anything from `@types/cssnano`.

### Recommended `tsconfig.json`

If you prefer the default-import form, enable `esModuleInterop`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

You do not need to add `cssnano` to `compilerOptions.types`. Its declarations are loaded from the imported runtime package.

### Create a typed processor

The bundled declarations expose `cssnano.Options`, and calling `cssnano()` returns a `postcss.Processor`.

```typescript
import type { Processor } from "postcss";
import cssnano = require("cssnano");

const options: cssnano.Options = {
  preset: "default",
};

const processor: Processor = cssnano(options);
```

This is the most useful TypeScript boundary in real projects: treat `cssnano()` as something that builds a configured PostCSS processor.

## Common Workflows

### Minify CSS directly in a Node or build script

`cssnano()` returns a processor with the normal PostCSS `.process()` API.

```typescript
import cssnano = require("cssnano");

async function minifyCss(inputCss: string): Promise<string> {
  const processor = cssnano({ preset: "default" });

  const result = await processor.process(inputCss, {
    from: "src/app.css",
    to: "dist/app.css",
  });

  return result.css;
}
```

Passing `from` and `to` gives PostCSS the file paths it uses for source-map and warning context.

### Use `cssnano` inside a broader PostCSS pipeline

The PostCSS type definitions accept a `Processor` in the plugin list, so `cssnano({ ... })` can be composed into a normal pipeline.

```typescript
import postcss from "postcss";
import cssnano from "cssnano";

async function optimizeCss(inputCss: string): Promise<string> {
  const result = await postcss([
    cssnano({ preset: "default" }),
  ]).process(inputCss, {
    from: "src/app.css",
    to: "dist/app.css",
  });

  return result.css;
}
```

If your build already assembles a PostCSS plugin list, this is the cleanest integration point.

### Load configuration automatically from the current project

If you call `cssnano()` without a `preset`, the runtime searches the current working directory for one of these files:

- `package.json`
- `.cssnanorc`
- `.cssnanorc.json`
- `.cssnanorc.yaml`
- `.cssnanorc.yml`
- `.cssnanorc.js`
- `cssnano.config.js`

For a simple JSON config, create `.cssnanorc.json`:

```json
{
  "preset": "default"
}
```

Then let `cssnano` discover it:

```typescript
import cssnano = require("cssnano");

const processor = cssnano();
```

If no config file is found, `cssnano` falls back to the built-in `default` preset.

### Pin a specific config file

Use `configFile` when the config is not in the current working directory or when a monorepo package needs an explicit path.

```typescript
import cssnano = require("cssnano");

const processor = cssnano({
  configFile: "config/cssnano.config.js",
});
```

`configFile` is resolved relative to `process.cwd()`, so pass the path you want from the current process root.

### Reuse the option type in app code

Because the runtime package exports the namespace type, you can type reusable helpers without importing internal declaration files.

```typescript
import cssnano = require("cssnano");

export function createCssnanoOptions(prod: boolean): cssnano.Options {
  return {
    preset: "default",
    configFile: prod ? "config/cssnano.prod.js" : "config/cssnano.dev.js",
  };
}
```

This keeps your code aligned with the installed runtime package instead of duplicating option shapes manually.

## Important Pitfalls

- Install `postcss` as well as `cssnano`. The published `cssnano` package declares `postcss` as a peer dependency.
- Import from `cssnano`, not from `@types/cssnano`.
- If `import cssnano from "cssnano"` fails, enable `esModuleInterop` or switch to `import cssnano = require("cssnano")`.
- `cssnano()` without a `preset` reads config from `process.cwd()`, not from the source file that imports it.
- `configFile` is also resolved from `process.cwd()`, so a relative path can point at the wrong file in monorepos or custom build runners.
- The bundled `cssnano.Options` type is intentionally broad: `preset` is `any` and `plugins` is `any[]`, so TypeScript will not deeply validate every preset-specific option you write.
- The published `cssnano` `5.1.15` package metadata has no `bin` entry. Use `cssnano` from PostCSS or from a Node build script rather than expecting a standalone `cssnano` CLI command.

## Version-Sensitive Notes

- This guide targets the `@types/cssnano` package entry at version `5.1.3`.
- Cached official npm registry metadata for `cssnano` shows no `types` field in `5.0.x`, and `types: "types/index.d.ts"` starting in `5.1.0`.
- The `cssnano` `5.1.x` runtime line exposes a merged namespace type with `Options` and exports a function that returns a `postcss.Processor`.
- The published `cssnano` `5.1.15` package metadata declares `postcss@^8.2.15` as its peer dependency.

## Official Sources

- npm package page for `@types/cssnano`: https://www.npmjs.com/package/@types/cssnano
- npm package page for `cssnano`: https://www.npmjs.com/package/cssnano
- `cssnano` repository: https://github.com/cssnano/cssnano
- `cssnano` package metadata endpoint: https://registry.npmjs.org/cssnano
- Published `cssnano` `5.1.15` tarball: https://registry.npmjs.org/cssnano/-/cssnano-5.1.15.tgz
