---
name: plugin-syntax-typescript
description: "Babel plugin for parsing TypeScript syntax in JavaScript builds without transforming or stripping the types"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,typescript,parser,syntax,build"
---

# @babel/plugin-syntax-typescript

`@babel/plugin-syntax-typescript` lets Babel parse TypeScript syntax. It is a parser-only plugin: it does not strip types, convert TypeScript to runnable JavaScript, or add any runtime behavior.

Use it when you need Babel to accept `.ts`, `.tsx`, `.mts`, or `.cts` syntax so another Babel step or downstream tool can consume the file.

## Install

Install the plugin with Babel core:

```bash
npm install --save-dev @babel/core @babel/plugin-syntax-typescript
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli
```

## Initialization

There are no environment variables, credentials, or runtime clients to initialize.

The setup is only:

- install `@babel/core`
- add `@babel/plugin-syntax-typescript` to Babel config or a programmatic Babel call
- make sure your build step includes the TypeScript file extensions you want Babel to read

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-syntax-typescript"]
}
```

This enables TypeScript parsing for files that Babel loads with that config.

## Use it from the CLI

If your source tree includes TypeScript files, pass the extensions explicitly so the Babel CLI reads them:

```bash
npx babel src \
  --extensions ".js,.jsx,.ts,.tsx,.mts,.cts" \
  --out-dir lib \
  --plugins @babel/plugin-syntax-typescript
```

Important: this plugin only changes parsing. Output generated with only this plugin still contains TypeScript syntax.

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("const answer: number = 42;", {
  filename: "src/example.ts",
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-syntax-typescript"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
// const answer: number = 42;
```

That unchanged output is the key behavior: Babel accepts the syntax, but this plugin does not erase the type annotation.

## Parse TSX with `isTSX`

Set `isTSX: true` when the file contains JSX-style tags and you want Babel to parse them as TSX:

```json
{
  "plugins": [
    [
      "@babel/plugin-syntax-typescript",
      {
        "isTSX": true
      }
    ]
  ]
}
```

Programmatic example:

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("const element = <Button />;", {
  filename: "src/view.tsx",
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-syntax-typescript", { isTSX: true }]],
});

if (!result?.code) {
  throw new Error("Transform failed");
}
```

Without `isTSX: true`, Babel does not enable JSX parsing for this plugin and TSX input such as `<Button />` fails to parse.

## Reject ambiguous angle-bracket assertions with `disallowAmbiguousJSXLike`

Set `disallowAmbiguousJSXLike: true` if you want Babel to reject legacy angle-bracket assertions such as `<string>value`:

```json
{
  "plugins": [
    [
      "@babel/plugin-syntax-typescript",
      {
        "disallowAmbiguousJSXLike": true
      }
    ]
  ]
}
```

Use normal `as` assertions instead:

```typescript
const text = value as string;
```

This is useful when you want TypeScript parsing rules that avoid JSX-like ambiguity, especially in codebases that treat `.mts` and `.cts` style syntax strictly.

## Parse declaration-style files with `dts`

Set `dts: true` when you want the TypeScript parser to use ambient-context rules such as the ones used for declaration files and `declare module` blocks:

```json
{
  "plugins": [
    [
      "@babel/plugin-syntax-typescript",
      {
        "dts": true
      }
    ]
  ]
}
```

Programmatic example:

```javascript
import { parseSync } from "@babel/core";

const ast = parseSync('declare module "pkg" { export interface Config { mode: string } }', {
  filename: "src/types.d.ts",
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-syntax-typescript", { dts: true }]],
});

if (!ast) {
  throw new Error("Parse failed");
}
```

Use `dts` only for declaration-style input. Normal application source files usually should not parse in ambient mode.

## Important pitfalls

- This is not a TypeScript-to-JavaScript compiler. If you need plain JavaScript output, add a Babel TypeScript transform step instead of using this plugin alone.
- Install `@babel/core` alongside the plugin. Babel loads plugins through `@babel/core`; the plugin is not a standalone CLI.
- Do not expect Flow and TypeScript parsing to coexist in the same file with this plugin. Its implementation removes Babel's `flow` parser plugin before enabling TypeScript.
- `isTSX: true` controls parsing only. It does not transform JSX or strip TypeScript syntax by itself.
- `disallowAmbiguousJSXLike: true` blocks `<Type>value` style assertions. Switch those assertions to `value as Type` before enabling it broadly.
- `dts: true` changes parser rules for ambient contexts. Reserve it for declaration-style inputs such as `.d.ts` content.

## Version-sensitive notes

- This guide targets `@babel/plugin-syntax-typescript@7.28.6`.
- In the current Babel 7 implementation, the user-facing parser options on this plugin are `isTSX`, `disallowAmbiguousJSXLike`, and `dts`.

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-syntax-typescript
- npm package page: https://www.npmjs.com/package/@babel/plugin-syntax-typescript
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-syntax-typescript
