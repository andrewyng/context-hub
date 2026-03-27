---
name: less
description: "TypeScript declarations for the `less` compiler, covering installation with the runtime package, portable imports, typed `less.render()` usage, and plugin hooks."
metadata:
  languages: "typescript"
  versions: "3.0.8"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,less,css,stylesheets,build-tools,types,definitelytyped"
---

# less TypeScript Guide

`@types/less` adds TypeScript declarations for the `less` runtime package. Install it when your project compiles `.less` source and you want typed access to `less.render()`, `Less.Options`, `Less.RenderOutput`, `Less.RenderError`, and plugin-related interfaces.

This package only provides declarations. Import and execute code from `less`, not from `@types/less`.

## Golden Rule

Install `less` and `@types/less` together.

`@types/less` does not include the Less compiler, file loading, or the `lessc` executable. It only describes the API exposed by the real `less` package.

## Install

If Less is only part of your build pipeline, install the runtime compiler and typings as development dependencies:

```bash
npm install -D less @types/less typescript @types/node
```

If your application calls `less.render()` at runtime, keep `less` in regular dependencies and install the declarations separately:

```bash
npm install less
npm install -D @types/less typescript @types/node
```

`less` and `@types/less` do not require API keys, service credentials, or package-specific environment variables.

## TypeScript Setup

The declaration package uses `export =`, so the most portable import form is:

```typescript
import less = require("less");
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import less from "less";
```

Recommended `tsconfig.json` settings for a Node.js project that compiles Less:

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

You do not need to add `less` to `compilerOptions.types`. The package is resolved from the normal module import.

If you use the browser-facing `less` APIs such as `sheets`, `refresh()`, or `watch()`, keep the `DOM` library enabled in that TypeScript project.

## Initialization

There is no client object to configure and no authentication step.

The practical setup is:

- read Less source from disk or another input
- build a `Less.Options` object
- call `less.render()`

When your stylesheet uses relative `@import`s, set `filename` and usually `paths` so Less can resolve them correctly.

```typescript
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import less = require("less");

export async function compileLess(entryFile: string): Promise<Less.RenderOutput> {
  const absoluteEntry = resolve(entryFile);
  const source = await readFile(absoluteEntry, "utf8");

  const options: Less.Options = {
    filename: absoluteEntry,
    paths: [dirname(absoluteEntry)],
    sourceMap: {
      sourceMapFileInline: true,
    },
  };

  return less.render(source, options);
}

const output = await compileLess("src/styles/app.less");
console.log(output.css);
console.log(output.imports);
```

`less.render()` accepts Less source text, not a file path. Reading the file yourself and passing `filename` is the important integration boundary for Node.js code.

## Common Workflows

### Compile an inline Less string with typed options

Use `Less.Options` when you want the compiler options checked by TypeScript.

```typescript
import less = require("less");

const source = `
@brand: #2563eb;

.button {
  color: @brand;
}
`;

const options: Less.Options = {
  filename: "inline.less",
  math: "parens-division",
  rewriteUrls: "off",
  sourceMap: {
    sourceMapFileInline: true,
  },
};

const result = await less.render(source, options);

console.log(result.css);
console.log(result.map);
```

The typings model `sourceMap` as an object, and `rewriteUrls` as `"off"`, `"all"`, or `"local"`.

### Surface typed render errors

The callback overload exposes a typed `Less.RenderError` with line, column, and filename information.

```typescript
import less = require("less");

less.render(
  ".card { color: @missing; }",
  { filename: "broken.less" },
  (error, output) => {
    if (error) {
      console.error(`${error.filename}:${error.line}:${error.column}`);
      console.error(error.message);
      console.error(error.extract.join("\n"));
      return;
    }

    console.log(output!.css);
  },
);
```

This is the simplest way to keep error handling strongly typed without writing your own `unknown` narrowing around a rejected Promise.

### Register a typed plugin

The declarations include `Less.Plugin`, `Less.PluginManager`, and `Less.PreProcessor` for plugin authoring.

```typescript
import less = require("less");

const bannerPlugin: Less.Plugin = {
  install(_less, pluginManager) {
    pluginManager.addPreProcessor({
      process(src) {
        return `/* generated by less */\n${src}`;
      },
    });
  },
};

const result = await less.render(".box { color: red; }", {
  filename: "plugin-example.less",
  plugins: [bannerPlugin],
});

console.log(result.css);
```

If you need custom import resolution, the same package also types `Less.FileManager` and `Less.AbstractFileManager`.

## Important Pitfalls

- Install `less` as well as `@types/less`; the declaration package does not compile anything by itself.
- Import from `less`, not from `@types/less`.
- Prefer `import less = require("less")` unless your project already enables `esModuleInterop`.
- Pass source text into `less.render()`. If you start from a file on disk, read it first and set `filename` so relative `@import`s and diagnostics resolve correctly.
- Treat `sourceMap` as an options object, not a boolean flag.
- `compress`, `color`, `ieCompat`, and `javascriptEnabled` are marked deprecated in `Less.Options`.

## Version-Sensitive Notes

- This guide targets `@types/less==3.0.8`.
- The published declaration package sets `typeScriptVersion` to `5.0`.
- The `less` package metadata does not advertise bundled TypeScript declarations, so `@types/less` remains the package that supplies types for `import "less"`.

## Official Sources

- https://www.npmjs.com/package/@types/less
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/less
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/less/index.d.ts
- https://www.npmjs.com/package/less
