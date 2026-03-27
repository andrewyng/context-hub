---
name: stylus
description: "TypeScript declarations for the Stylus CSS preprocessor, including typed imports for the Node.js compile API and middleware helpers."
metadata:
  languages: "typescript"
  versions: "0.48.43"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,stylus,css,preprocessor,node,types,definitelytyped"
---

# Stylus TypeScript Guide

## Golden Rule

Install `@types/stylus` alongside the real `stylus` runtime package.

`@types/stylus` only provides TypeScript declarations. Your build script, server, or middleware still imports and runs `stylus`; the declaration package adds types for the CommonJS module export, the renderer chain, and helpers such as `stylus.middleware()`.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install stylus
npm install -D typescript @types/stylus @types/node
```

If your project already uses `stylus`, add only the missing declarations:

```bash
npm install -D @types/stylus @types/node
```

There are no package-specific environment variables, credentials, or client objects to configure.

## Initialization

The practical setup points are your import style, your TypeScript compiler options, and how you bridge Stylus's callback-based render API into the rest of your app.

### Import `stylus`

The declaration package models the CommonJS `stylus` export. The most portable import form is:

```typescript
import stylus = require("stylus");

const renderer = stylus("body\n  color: #333");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import stylus from "stylus";

const renderer = stylus("body\n  color: #333");
```

Import from `stylus`, never from `@types/stylus`.

### Recommended `tsconfig.json`

For Node-based compilation scripts, middleware, or server-side rendering, a Node-oriented config works well:

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

If you prefer `import stylus = require("stylus")`, you do not need `esModuleInterop` for this package.

## Common Workflows

### Compile a `.styl` entry file to CSS

Use the renderer chain when you want to control options such as `filename` and `compress` before rendering.

```typescript
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import stylus = require("stylus");

export async function compileStylus(entryFile: string): Promise<string> {
  const source = await readFile(entryFile, "utf8");

  return await new Promise<string>((resolve, reject) => {
    stylus(source)
      .set("filename", entryFile)
      .set("compress", process.env.NODE_ENV === "production")
      .render((error, css) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(css);
      });
  });
}

async function main() {
  const entryFile = join(process.cwd(), "styles", "main.styl");
  const css = await compileStylus(entryFile);
  console.log(css);
}

void main();
```

Setting `filename` is the important part when your Stylus source uses relative `@import`s.

### Resolve relative imports predictably

When you compile a string from memory instead of passing a real file path into a CLI, set `filename` to the source file you want Stylus to treat as the import base.

```typescript
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import stylus = require("stylus");

const entryFile = join(process.cwd(), "styles", "app.styl");
const source = await readFile(entryFile, "utf8");

stylus(source)
  .set("filename", entryFile)
  .render((error, css) => {
    if (error) {
      throw error;
    }

    console.log(css);
  });
```

Without `filename`, relative imports and error locations are harder to resolve.

### Wrap Stylus rendering for `async` / `await`

The render API is callback-based. In TypeScript applications, the simplest boundary is a small Promise wrapper that returns `Promise<string>`.

```typescript
import stylus = require("stylus");

export function renderStylus(source: string, filename = "inline.styl"): Promise<string> {
  return new Promise((resolve, reject) => {
    stylus(source)
      .set("filename", filename)
      .render((error, css) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(css);
      });
  });
}
```

This keeps the rest of your build code Promise-based without changing how Stylus itself is typed.

### Use Stylus middleware in an Express app

`stylus.middleware()` is useful when your server compiles Stylus from a source directory into a public CSS directory.

```typescript
import express from "express";
import { join } from "node:path";
import stylus = require("stylus");

const app = express();
const rootDir = process.cwd();

app.use(
  stylus.middleware({
    src: join(rootDir, "styles"),
    dest: join(rootDir, "public"),
    compile(source: string, filename: string) {
      return stylus(source)
        .set("filename", filename)
        .set("compress", app.get("env") === "production");
    },
  }),
);

app.use(express.static(join(rootDir, "public")));

app.listen(3000);
```

The middleware example still depends on the real `stylus` package at runtime; `@types/stylus` only makes the middleware and compile callback shapes available to the TypeScript compiler.

## Important Pitfalls

- Install `stylus` as well as `@types/stylus`; the declaration package does not compile anything by itself.
- Import from `stylus`, not from `@types/stylus`.
- If `import stylus from "stylus"` fails, enable `esModuleInterop` or switch to `import stylus = require("stylus")`.
- Set `filename` before calling `.render()` when your stylesheet uses relative `@import`s or when you want accurate error locations.
- Treat `.render()` as callback-based. Do not assume it returns a `Promise`.

## Version-Sensitive Notes

- This guide targets `@types/stylus==0.48.43`.
- The package is a DefinitelyTyped declaration package for the `stylus` runtime module.
- The declarations cover the Node-side JavaScript API surface and middleware helpers; they do not replace installation of the runtime compiler.

## Official Sources

- https://www.npmjs.com/package/@types/stylus
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/stylus
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/stylus/index.d.ts
- https://stylus-lang.com/docs/js.html
- https://stylus-lang.com/docs/middleware.html
