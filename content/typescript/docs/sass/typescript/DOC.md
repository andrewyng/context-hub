---
name: sass
description: "TypeScript guidance for Sass projects that encounter the @types/sass 1.45.0 package, covering built-in types, CLI setup, and programmatic compilation from TypeScript."
metadata:
  languages: "typescript"
  versions: "1.45.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,sass,scss,css,build-tools,types"
---

# Sass TypeScript Guide

## Golden Rule

For application code, install `sass` and import from `"sass"`.

`@types/sass@1.45.0` is not a runtime package. The practical TypeScript workflow is centered on the real `sass` package, which is the package your build scripts and application code should use.

In practice:

- install `sass`
- remove `@types/sass` if it is still listed in your project
- import values and types from `sass`, never from `@types/sass`

## Install

Install Sass with TypeScript as a development dependency:

```bash
npm install -D sass typescript
```

If your project already includes `@types/sass`, remove it:

```bash
npm uninstall @types/sass
```

Sass does not require credentials, API keys, service accounts, or package-specific environment variables.

## Recommended Project Setup

### Add Sass build scripts

Add scripts to `package.json` so local development and CI use the same commands:

```json
{
  "scripts": {
    "build:css": "sass src/styles/app.scss public/app.css",
    "watch:css": "sass --watch src/styles:public/styles"
  }
}
```

`build:css` compiles one entry file to one output file. `watch:css` watches a source directory and writes compiled CSS files into a destination directory.

### Use a normal TypeScript module setup

You do not need any Sass-specific `tsconfig.json` settings.

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

You also do not need to add `sass` to `compilerOptions.types`. The package exposes module declarations through `"sass"` itself.

## Import And Use Sass In TypeScript

Use the runtime package directly:

```typescript
import * as sass from "sass";
```

That import gives you the runtime compiler API and the package's bundled TypeScript declarations.

### Compile an SCSS entry file

Use `sass.compile()` when you have a file on disk and want a typed result object back.

```typescript
import * as sass from "sass";

export function compileAppStyles(entryFile: string): sass.CompileResult {
  return sass.compile(entryFile, {
    loadPaths: ["src/styles"],
    style: "expanded",
    sourceMap: true,
  });
}

const result = compileAppStyles("src/styles/app.scss");

console.log(result.css);
console.log(result.loadedUrls);
```

`loadPaths` lets Sass resolve `@use` and `@forward` from additional directories. `result.css` contains the compiled stylesheet string.

### Compile a generated SCSS string

Use `sass.compileString()` when your application builds SCSS dynamically.

```typescript
import * as sass from "sass";

type Theme = "light" | "dark";

export function compileTheme(theme: Theme): string {
  const result = sass.compileString(
    `$theme: ${theme};

    .card {
      color: if($theme == light, #111827, #f9fafb);
      background: if($theme == light, #ffffff, #111827);
    }
    `,
    {
      syntax: "scss",
      style: "compressed",
    },
  );

  return result.css;
}
```

This is the main TypeScript boundary for generated styles: your app controls the input string and configuration, while Sass returns compiled CSS.

### Write compiled CSS from a TypeScript build script

This example reads app-specific environment variables, compiles one entry file, and writes both CSS and the source map.

```typescript
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import * as sass from "sass";

const entryFile = process.env.SASS_ENTRY ?? "src/styles/app.scss";
const outFile = process.env.SASS_OUT ?? "public/app.css";
const style: "expanded" | "compressed" =
  process.env.SASS_STYLE === "compressed" ? "compressed" : "expanded";

export async function buildStyles(): Promise<void> {
  const result = sass.compile(entryFile, {
    loadPaths: ["src/styles"],
    style,
    sourceMap: true,
  });

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, result.css, "utf8");

  if (result.sourceMap) {
    await writeFile(`${outFile}.map`, JSON.stringify(result.sourceMap), "utf8");
  }
}
```

Run the build with app-defined environment variables if you want a different output path or CSS style:

```bash
SASS_ENTRY=src/styles/admin.scss SASS_OUT=public/admin.css SASS_STYLE=compressed node dist/build-styles.js
```

These variables are your own build-script inputs, not settings required by Sass itself.

## Common TypeScript Patterns

### Type a helper around the compile result

If you wrap Sass in your own build utilities, return `sass.CompileResult` from the wrapper instead of reaching into internal declaration details.

```typescript
import * as sass from "sass";

export function compileFile(entryFile: string, compressed = false): sass.CompileResult {
  return sass.compile(entryFile, {
    style: compressed ? "compressed" : "expanded",
  });
}
```

This keeps the application boundary small and makes later Sass upgrades easier to localize.

### Keep imports pointed at the runtime package

Even for type-only imports, use `sass` as the module specifier.

```typescript
import * as sass from "sass";
import type { CompileResult } from "sass";

export function readCss(result: CompileResult): string {
  return result.css;
}

export function compileAndRead(entryFile: string): string {
  const result: sass.CompileResult = sass.compile(entryFile);
  return readCss(result);
}
```

## Important Pitfalls

- `@types/sass` is not the package your application should import.
- Install `sass` for both the compiler runtime and the bundled TypeScript declarations.
- Import from `"sass"`, never from `"@types/sass"`.
- You do not need to add `sass` to `compilerOptions.types`.
- If your project shells out to the Sass CLI instead of importing the module, keep the typing boundary in your own Node or TypeScript wrapper code.
- `loadPaths` affects how Sass resolves imports during compilation; if your stylesheet graph depends on extra lookup directories, define them explicitly.

## Version-Sensitive Notes

- This guide targets the `@types/sass` package entry at version `1.45.0`.
- For this package version, the practical TypeScript workflow is centered on the `sass` runtime package rather than on a standalone declaration package import path.

## Official Sources

- npm package page for `@types/sass`: https://www.npmjs.com/package/@types/sass
- DefinitelyTyped source for `@types/sass`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/sass
- npm package page for `sass`: https://www.npmjs.com/package/sass
- Sass JavaScript API reference: https://sass-lang.com/documentation/js-api/
- Sass JavaScript API for compiling files and strings: https://sass-lang.com/documentation/js-api/modules/
