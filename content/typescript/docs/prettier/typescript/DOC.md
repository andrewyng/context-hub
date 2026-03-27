---
name: prettier
description: "TypeScript guide for Prettier 3, including built-in types, configuration, CLI usage, and programmatic formatting without `@types/prettier`."
metadata:
  languages: "typescript"
  versions: "3.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,prettier,formatting,code-style,types,definitelytyped"
---

# Prettier TypeScript Guide

## Golden Rule

For Prettier 3, install `prettier` and import from `"prettier"`.

`@types/prettier@3.0.0` is not a runtime package and is not the package you should target in application code. The npm package page for `@types/prettier` exists to point users at the real `prettier` package, which ships its own TypeScript declarations.

In practice:

- install `prettier`
- remove `@types/prettier` if it is still in your project
- import values and types from `prettier`, never from `@types/prettier`

## Install

Install Prettier as a development dependency:

```bash
npm install -D prettier typescript
```

If your project already has the deprecated stub package, remove it:

```bash
npm uninstall @types/prettier
```

No authentication, API keys, service accounts, or package-specific environment variables are required.

## Recommended Project Setup

### Add formatter scripts

```json
{
  "scripts": {
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

`prettier . --write` rewrites matching files in place. `prettier . --check` is the safer CI command because it exits non-zero when formatting is needed.

### Add a Prettier config file

Create `.prettierrc.json` in your project root:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
```

Prettier will load this config automatically from the current project.

### Use a normal TypeScript module setup

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

You do not need to add `prettier` to `compilerOptions.types`. That setting is for ambient type packages such as many `@types/*` packages. Prettier exposes its declarations through the `prettier` module itself.

## Import And Use Prettier In TypeScript

Use the real runtime package in your imports:

```typescript
import * as prettier from "prettier";
```

This gives you both the runtime API and the package's bundled TypeScript types.

### Format a TypeScript file with the project config

```typescript
import { readFile, writeFile } from "node:fs/promises";
import * as prettier from "prettier";

export async function formatFile(filePath: string): Promise<void> {
  const input = await readFile(filePath, "utf8");
  const options = (await prettier.resolveConfig(filePath)) ?? {};

  const output = await prettier.format(input, {
    ...options,
    filepath: filePath,
  });

  if (output !== input) {
    await writeFile(filePath, output, "utf8");
  }
}
```

Passing `filepath` lets Prettier infer the parser from the file name and extension, which is usually the safest choice for application code.

### Check whether code is already formatted

```typescript
import * as prettier from "prettier";

export async function isFormatted(source: string, filePath: string): Promise<boolean> {
  const options = (await prettier.resolveConfig(filePath)) ?? {};

  return prettier.check(source, {
    ...options,
    filepath: filePath,
  });
}
```

This is useful in pre-commit hooks, CI checks, and custom build tooling.

### Reuse Prettier's option types from the runtime package

```typescript
import * as prettier from "prettier";

type FormatOptions = Parameters<typeof prettier.format>[1];

const baseOptions: FormatOptions = {
  singleQuote: true,
  trailingComma: "all",
};

export async function formatSnippet(source: string): Promise<string> {
  return prettier.format(source, {
    ...baseOptions,
    parser: "typescript",
  });
}
```

This pattern is useful when you want local type safety without depending on a separate `@types` package.

## Common Workflows

### Run Prettier from the CLI

Format the whole project:

```bash
npx prettier . --write
```

Check formatting without rewriting files:

```bash
npx prettier . --check
```

Format one TypeScript file explicitly:

```bash
npx prettier src/index.ts --write
```

### Use Prettier in Node-based tooling

If your app generates source files, call Prettier before writing them to disk:

```typescript
import { writeFile } from "node:fs/promises";
import * as prettier from "prettier";

export async function writeGeneratedModule(filePath: string, source: string): Promise<void> {
  const output = await prettier.format(source, {
    filepath: filePath,
  });

  await writeFile(filePath, output, "utf8");
}
```

Using `filepath` keeps generated `.ts`, `.tsx`, `.json`, and other supported files aligned with Prettier's parser inference.

## Important Pitfalls

- Do not import from `@types/prettier`; import from `prettier`.
- Do not keep `@types/prettier` in `devDependencies` for a Prettier 3 setup unless you have a very specific legacy constraint.
- Use `await prettier.format(...)` and `await prettier.resolveConfig(...)` in Prettier 3 code.
- Prefer `filepath` when formatting files so Prettier can infer the correct parser from the extension.
- If your project restricts `compilerOptions.types`, that does not replace importing from `prettier`; the module's own declarations are still the source of truth.

## Version Notes

- This guide targets `@types/prettier==3.0.0`.
- For this version, the practical recommendation from the maintainer package page is to use `prettier`'s bundled type definitions instead of installing `@types/prettier`.

## Official Sources

- https://www.npmjs.com/package/@types/prettier
- https://www.npmjs.com/package/prettier
- https://prettier.io/docs/install.html
- https://prettier.io/docs/api/
- https://prettier.io/docs/configuration
