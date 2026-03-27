---
name: typescript
description: "Install, configure, type-check, compile, and automate TypeScript projects with the official compiler and compiler API."
metadata:
  languages: "typescript"
  versions: "5.9.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,tsc,compiler,tsconfig,language,javascript"
---

# TypeScript Compiler Guide

## Golden Rule

Install `typescript` when you need the TypeScript compiler, the `tsc` CLI, or the compiler API from `"typescript"`.

The package type-checks and compiles your code. It does not run the emitted JavaScript, install runtime libraries, or provide environment-specific globals on its own.

## Install

Add TypeScript as a development dependency:

```bash
npm install -D typescript
```

Check the installed compiler version:

```bash
npx tsc --version
```

`typescript@5.9.3` declares `node >=14.17` in its package metadata.

## Initialization

There are no package-specific environment variables, credentials, or client objects to configure.

Start by generating a `tsconfig.json` file:

```bash
npx tsc --init
```

For a Node-based application, this is a practical minimal starting point:

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "outDir": "dist",
    "sourceMap": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

Adjust the config for your runtime boundary:

- Use `"lib"` to describe the runtime environment, for example browser code usually needs `"dom"` in addition to an ECMAScript library.
- Use `"jsx"` when compiling `.tsx` files.
- Use `"types"` only when you want to explicitly control which ambient type packages are included.

To inspect the fully resolved compiler configuration:

```bash
npx tsc --showConfig -p tsconfig.json
```

## Common Workflows

### Type-check a project without emitting JavaScript

Use this in CI or before a production build when another tool handles the final bundle:

```bash
npx tsc -p tsconfig.json --noEmit
```

`--noEmit` disables output generation and keeps the compiler focused on diagnostics.

### Compile a project and watch for changes

Compile once:

```bash
npx tsc -p tsconfig.json
```

Recompile on file changes:

```bash
npx tsc -p tsconfig.json --watch
```

If you omit `-p`, `tsc` uses the `tsconfig.json` in the working directory.

### Emit declaration files for a library package

When you are publishing a library, declaration output is usually the important artifact for downstream TypeScript users:

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "es2022",
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist/types"
  },
  "include": ["src/**/*.ts"]
}
```

Then build with:

```bash
npx tsc -p tsconfig.json
```

### Type-check JavaScript files with JSDoc annotations

TypeScript can check `.js` files when you enable `allowJs` and `checkJs`:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noEmit": true
  },
  "include": ["src/**/*.js"]
}
```

Example JavaScript file:

```javascript
/** @param {string} name */
export function greet(name) {
  return name.toUpperCase();
}

greet(42);
```

Running `npx tsc -p tsconfig.json` reports the incorrect call without requiring a `.ts` conversion first.

### Transpile one in-memory source string

For tooling, generators, or quick transforms, use `transpileModule` from the compiler API:

```typescript
import * as ts from "typescript";

const source = `export const answer: number = 42;`;

const result = ts.transpileModule(source, {
  fileName: "example.ts",
  reportDiagnostics: true,
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    sourceMap: true,
  },
});

if (result.diagnostics?.length) {
  console.error(result.diagnostics.map((diagnostic) => diagnostic.messageText));
}

console.log(result.outputText);
```

`transpileModule` is useful for single-file transforms. It does not replace a full project build when you need cross-file type-checking.

### Build from `tsconfig.json` programmatically

If you are writing custom tooling, read the config and create a `Program` explicitly:

```typescript
import { dirname } from "node:path";
import * as ts from "typescript";

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => process.cwd(),
  getNewLine: () => ts.sys.newLine,
};

const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, "tsconfig.json");

if (!configPath) {
  throw new Error("Could not find tsconfig.json");
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

if (configFile.error) {
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext([configFile.error], formatHost),
  );
}

const parsed = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  dirname(configPath),
  undefined,
  configPath,
);

const program = ts.createProgram({
  rootNames: parsed.fileNames,
  options: parsed.options,
});

const emitResult = program.emit();
const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

if (diagnostics.length > 0) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
}

process.exitCode = emitResult.emitSkipped ? 1 : 0;
```

This is the right boundary when you need compiler diagnostics or output inside a build tool, code generator, or framework integration.

## Important Pitfalls

- `tsc app.ts` and other explicit file arguments ignore your `tsconfig.json` and compile those files with default compiler options. Use bare `tsc` or `tsc -p ...` for project builds.
- `typescript` does not install runtime-specific type packages such as Node, Jest, or browser framework types. Add the relevant packages separately when your runtime does not ship its own declarations.
- If you set `compilerOptions.types`, TypeScript only includes the listed type packages automatically.
- Keep `module`, `moduleResolution`, and your runtime or bundler aligned. For modern Node projects, `nodenext` is usually the safest starting point.
- `emitDeclarationOnly` writes `.d.ts` output but skips JavaScript output; `noEmit` skips both. Pick one deliberately.
- `tsc --build` is for composite and project-reference builds. Use normal project compilation unless you actually maintain referenced subprojects.

## Version-Sensitive Notes

- This guide targets `typescript==5.9.3`.
- `typescript@5.9.3` exposes the `tsc` and `tsserver` binaries and the compiler API from the `typescript` package entry point.
- The package metadata requires Node `>=14.17`.
- The CLI in 5.9.3 supports the workflows used here, including `--init`, `--showConfig`, `--watch`, `--build`, `--noEmit`, `--declaration`, and `--emitDeclarationOnly`.

## Official Sources

- https://www.npmjs.com/package/typescript
- https://www.typescriptlang.org/docs/
- https://aka.ms/tsc
- https://aka.ms/tsconfig
- https://www.typescriptlang.org/tsconfig/
- https://github.com/microsoft/TypeScript/blob/v5.9.3/README.md
- https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
