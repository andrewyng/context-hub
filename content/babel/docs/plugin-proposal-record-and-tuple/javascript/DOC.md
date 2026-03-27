---
name: plugin-proposal-record-and-tuple
description: "Enable Babel 7 to parse and emit the Record & Tuple proposal syntax with hash or bar delimiters"
metadata:
  languages: "javascript"
  versions: "7.27.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,record-and-tuple,syntax,proposal"
---

# @babel/plugin-proposal-record-and-tuple

`@babel/plugin-proposal-record-and-tuple` is a build-time Babel plugin for Babel 7 pipelines that need to accept the Record & Tuple proposal syntax.

Use it when your source contains either hash-style literals:

```javascript
const user = #{ id: 1, name: "Ada" };
const pair = #[1, 2];
```

or bar-style literals:

```javascript
const user = {| id: 1, name: "Ada" |};
const pair = [|1, 2|];
```

There are no environment variables, authentication steps, or runtime clients to initialize. Configuration lives entirely in Babel.

## Install

Install the plugin with Babel core. Add `@babel/cli` if you want to run Babel from the command line.

```bash
npm install --save-dev @babel/core @babel/plugin-proposal-record-and-tuple
```

Optional CLI dependency:

```bash
npm install --save-dev @babel/cli
```

## Enable the plugin in Babel config

Hash syntax is the practical default in Babel 7. Configure it explicitly so your parser and code generator stay aligned:

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-record-and-tuple",
      {
        "syntaxType": "hash"
      }
    ]
  ]
}
```

If your codebase uses bar delimiters instead, switch the option:

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-record-and-tuple",
      {
        "syntaxType": "bar"
      }
    ]
  ]
}
```

In current Babel 7 parser code, `syntaxType` must be either `"hash"` or `"bar"`.

## Compile from the CLI

With a `babel.config.json` file in place:

```bash
npx babel src --out-dir lib
```

Or compile a single file:

```bash
npx babel input.js --out-file output.js
```

This plugin makes Babel accept Record & Tuple syntax during compilation. Keep in mind that a successful Babel build does not guarantee the final runtime can execute that syntax.

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const source = `
const settings = #{ retries: 3, mode: "strict" };
const order = #["name", "createdAt"];
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-proposal-record-and-tuple", {
    syntaxType: "hash",
  }]],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

Bar-style input uses the same API with `syntaxType: "bar"`:

```javascript
import { transformSync } from "@babel/core";

const result = transformSync("const pair = [|1, 2|];", {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-proposal-record-and-tuple", {
    syntaxType: "bar",
  }]],
});

if (!result?.code) {
  throw new Error("Transform failed");
}
```

## Match parser syntax with generated output

If you also parse or print ASTs directly, keep the parser plugin option and generator option in sync. Babel's generator accepts `recordAndTupleSyntaxType`, and the current implementation defaults it to `"hash"`.

```javascript
import { parse } from "@babel/parser";
import generate from "@babel/generator";

const source = "const config = {| region: \"us-east-1\" |};";

const ast = parse(source, {
  sourceType: "module",
  plugins: [["recordAndTuple", { syntaxType: "bar" }]],
});

const output = generate(ast, {
  recordAndTupleSyntaxType: "bar",
});

console.log(output.code);
```

If those settings disagree, Babel can parse one delimiter style and print another, or throw when it encounters an unsupported generator value.

## Common build setup

`package.json`:

```json
{
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.27.1",
    "@babel/core": "^7.27.1",
    "@babel/plugin-proposal-record-and-tuple": "^7.27.1"
  }
}
```

`babel.config.json`:

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-record-and-tuple",
      {
        "syntaxType": "hash"
      }
    ]
  ]
}
```

## Important pitfalls

- `syntaxType` only accepts `"hash"` or `"bar"` in Babel 7.
- Hash-style Record & Tuple syntax conflicts with Babel's pipeline-operator parser in `proposal: "smart"` mode, and it also conflicts with hack pipes when `topicToken` is `"#"`.
- If your codebase uses bar delimiters, set both the plugin's `syntaxType` and the generator's `recordAndTupleSyntaxType` to `"bar"`.
- Record expressions reject `__proto__`.
- Treat this as Babel syntax support for a proposal, not as a compatibility layer for older runtimes. Your emitted code can still contain `#{}`, `#[]`, `{| |}`, or `[| |]`.

## Version-sensitive notes

- This guide targets `@babel/plugin-proposal-record-and-tuple@7.27.1`.
- Current Babel 7 parser validation removes `recordAndTuple` support in Babel 8 and throws if you keep that parser plugin enabled there.
- Current Babel 7 parser validation accepts only `syntaxType: "hash"` and `syntaxType: "bar"`.
- Current Babel generator logic defaults `recordAndTupleSyntaxType` to `"hash"` when you do not set it explicitly.

## Official sources

- npm package page: https://www.npmjs.com/package/@babel/plugin-proposal-record-and-tuple
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-proposal-record-and-tuple
- Babel parser source: https://github.com/babel/babel/tree/main/packages/babel-parser
- Babel generator source: https://github.com/babel/babel/tree/main/packages/babel-generator
