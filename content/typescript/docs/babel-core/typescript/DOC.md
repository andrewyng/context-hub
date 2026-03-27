---
name: babel-core
description: "TypeScript declarations for @babel/core transforms, parsing, plugins, config loading, and AST tooling."
metadata:
  languages: "typescript"
  versions: "7.20.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,babel,babel-core,compiler,ast,types,definitelytyped"
---

# Babel Core TypeScript Guide

`@types/babel__core` provides the TypeScript declarations for the `@babel/core` runtime package. Install it when you call Babel programmatically from TypeScript, inspect Babel ASTs, or author Babel plugins and config helpers in TypeScript.

This package only ships types. It does not compile code by itself, it does not install Babel presets or plugins, and it does not replace the `@babel/core` runtime package.

## Install

Install TypeScript, the Babel runtime, and the declaration package together:

```bash
npm install --save-dev typescript @babel/core @types/babel__core
```

If you want Babel to parse or transform TypeScript syntax, install the preset separately:

```bash
npm install --save-dev @babel/preset-typescript
```

Add any Babel plugins or presets you reference in `plugins` or `presets` as normal runtime dependencies. `@types/babel__core` only covers the type layer.

## Initialization

There are no package-specific environment variables, credentials, or client objects to initialize.

The practical setup is:

- install `@babel/core` for the runtime API
- install `@types/babel__core` for compile-time declarations
- configure Babel behavior with `TransformOptions` and separately installed presets or plugins

## TypeScript Setup

Use a normal strict TypeScript configuration for tooling code that calls Babel:

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

`@types/babel__core@7.20.5` declares `typeScriptVersion: "4.5"`, so use TypeScript 4.5 or newer.

Import from `@babel/core`, not from `@types/babel__core`:

```typescript
import * as babel from "@babel/core";
import type { TransformOptions } from "@babel/core";
```

Using a namespace import is a practical default because `@babel/core` is published as a CommonJS package and the declarations expose the runtime API off the same module.

## Common Workflows

### Transform source code with typed options

`TransformOptions` covers the options you pass into `transformSync`, `transformAsync`, `transformFileSync`, and related APIs.

```typescript
import * as babel from "@babel/core";
import type { TransformOptions } from "@babel/core";

const options: TransformOptions = {
  filename: "src/example.ts",
  presets: ["@babel/preset-typescript"],
  sourceMaps: true,
};

const result = babel.transformSync("const answer: number = 42;", options);

if (!result?.code) {
  throw new Error("Babel returned no compiled output");
}

console.log(result.code);
console.log(result.map);
```

Use this pattern when a build script, codemod, test helper, or custom compiler step needs a typed Babel call instead of a config file only.

### Parse, traverse, and reprint an AST

The declarations re-export `traverse`, `types`, `template`, `NodePath`, `Visitor`, `ParserOptions`, and `GeneratorOptions` from the Babel packages that `@babel/core` uses internally.

```typescript
import * as babel from "@babel/core";

const source = "const answer = 42;";

const ast = babel.parseSync(source, {
  filename: "src/example.js",
  sourceType: "module",
});

if (!ast) {
  throw new Error("Babel returned no AST");
}

babel.traverse(ast, {
  VariableDeclarator(path) {
    if (babel.types.isIdentifier(path.node.id) && path.node.id.name === "answer") {
      path.node.id = babel.types.identifier("result");
    }
  },
});

const output = babel.transformFromAstSync(ast, source, {});

if (!output?.code) {
  throw new Error("Babel returned no transformed code");
}

console.log(output.code);
```

This is the core pattern for codemods and custom source transforms.

### Type a Babel plugin

Use `PluginObj` and `PluginPass` to keep visitor code and plugin options typed.

```typescript
import * as babel from "@babel/core";

type RenameOptions = {
  from: string;
  to: string;
};

type RenamePass = babel.PluginPass & {
  opts: RenameOptions;
};

export function renameIdentifier(): babel.PluginObj<RenamePass> {
  return {
    name: "rename-identifier",
    visitor: {
      Identifier(path) {
        if (path.node.name === this.opts.from) {
          path.node.name = this.opts.to;
        }
      },
    },
  };
}

const result = babel.transformSync("const oldName = 1;", {
  plugins: [[renameIdentifier, { from: "oldName", to: "newName" }]],
});

console.log(result?.code);
```

The typed plugin shape helps when you publish internal Babel plugins or share them across multiple packages.

### Inspect resolved config or prebuild config items

`createConfigItem` and `loadPartialConfig` are useful in build tools that need Babel to resolve config exactly once and then reuse it.

```typescript
import * as babel from "@babel/core";

const typescriptPreset = babel.createConfigItem("@babel/preset-typescript", {
  type: "preset",
});

const partial = babel.loadPartialConfig({
  filename: "src/example.ts",
  presets: [typescriptPreset],
});

if (!partial) {
  throw new Error("Babel did not resolve a config");
}

console.log(partial.hasFilesystemConfig());
console.log(partial.options.presets?.length ?? 0);
```

Use `loadOptions()` instead when you need Babel to flatten presets and plugins into a fully resolved options object.

## Important Pitfalls

- Do not import from `@types/babel__core` in application or tooling code. Import from `@babel/core` and let TypeScript pick up the declarations automatically.
- `@types/babel__core` does not install the Babel CLI, presets, or plugins. If you reference `@babel/preset-typescript` or any plugin by name, install that package separately.
- The core transform and parse APIs are typed as nullable: `transformSync`, `transformAsync`, `transformFromAstSync`, `parseSync`, `loadOptions`, and `loadPartialConfig` can all return `null`. Check for `null` before reading `.code`, `.ast`, or `.options`.
- `DEFAULT_EXTENSIONS` only includes `.js`, `.jsx`, `.es6`, `.es`, and `.mjs`. TypeScript file handling comes from preset or plugin configuration, not from Babel core's default extension list.
- These definitions come from DefinitelyTyped rather than the `@babel/core` package itself. New Babel runtime options can appear before the corresponding declaration update is published.

## Version-Sensitive Notes

- This guide targets `@types/babel__core==7.20.5`.
- The package metadata lists `@babel/parser`, `@babel/types`, `@types/babel__generator`, `@types/babel__template`, and `@types/babel__traverse` as dependencies, so npm installs the related declaration packages automatically.
- Pair this package with the Babel 7 runtime family. If your `@babel/core` runtime is much newer than the declaration package, verify newer options against the current Babel docs before depending on them in TypeScript.

## Official Sources

- npm package page for `@types/babel__core`: https://www.npmjs.com/package/@types/babel__core
- DefinitelyTyped source for `@types/babel__core`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/babel__core
- npm package page for `@babel/core`: https://www.npmjs.com/package/@babel/core
- Babel core package docs: https://babeljs.io/docs/babel-core
- Babel options reference: https://babeljs.io/docs/options
- Babel config files and config function API: https://babeljs.io/docs/config-files
