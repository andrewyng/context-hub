---
name: plugin-proposal-pipeline-operator
description: "Configure Babel 7 to compile the pipeline operator proposal with minimal, F#, or Hack-style syntax"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,pipeline-operator,syntax,proposal"
---

# @babel/plugin-proposal-pipeline-operator

`@babel/plugin-proposal-pipeline-operator` is a build-time Babel plugin for code that uses the pipeline operator proposal (`|>`).

Configuration lives entirely in Babel. There are no environment variables, authentication steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core. Add `@babel/cli` if you want to run Babel from the command line.

```bash
npm install --save-dev @babel/core @babel/plugin-proposal-pipeline-operator
```

Optional CLI dependency:

```bash
npm install --save-dev @babel/cli
```

## Enable the plugin in Babel config

This plugin requires a `proposal` option. Current Babel parser validation accepts `"minimal"`, `"fsharp"`, `"hack"`, and `"smart"`.

For a simple pipeline style, configure `minimal`:

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-pipeline-operator",
      {
        "proposal": "minimal"
      }
    ]
  ]
}
```

Use that for code shaped like this:

```javascript
const result = value |> double |> increment;
```

For Hack-style pipes, set both `proposal` and `topicToken`:

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-pipeline-operator",
      {
        "proposal": "hack",
        "topicToken": "^^"
      }
    ]
  ]
}
```

Use that for code shaped like this:

```javascript
const label = input
  |> ^^.trim()
  |> ^^.toUpperCase();
```

In Hack mode, current Babel parser validation only accepts these topic tokens: `"^^"`, `"@@"`, `"^"`, `"%"`, and `"#"`.

## Compile from the CLI

With a `babel.config.json` file in place:

```bash
npx babel src --out-dir lib
```

Or compile a single file:

```bash
npx babel input.js --out-file output.js
```

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const source = `
const result = value |> double |> increment;
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-proposal-pipeline-operator", {
    proposal: "minimal",
  }]],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

Hack-style pipes use the same API, but they must include `topicToken`:

```javascript
import { transformSync } from "@babel/core";

const source = `
const message = input
  |> ^^.trim()
  |> ^^.toLowerCase();
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-proposal-pipeline-operator", {
    proposal: "hack",
    topicToken: "^^",
  }]],
});

if (!result?.code) {
  throw new Error("Transform failed");
}
```

## Match parser and generator settings in AST tools

If you parse or print Babel ASTs directly, configure the parser plugin and generator options to match the pipeline style you use in source files.

```javascript
import { parse } from "@babel/parser";
import generate from "@babel/generator";

const source = `
const message = input |> ^^.trim();
`;

const ast = parse(source, {
  sourceType: "module",
  plugins: [["pipelineOperator", {
    proposal: "hack",
    topicToken: "^^",
  }]],
});

const output = generate(ast, {
  topicToken: "^^",
});

console.log(output.code);
```

If you print Hack-style pipeline ASTs without a matching generator `topicToken`, Babel's generator throws because it only accepts `"%"`, `"#"`, `"@@"`, `"^^"`, and `"^"`.

## Common build setup

`package.json`:

```json
{
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.28.6",
    "@babel/core": "^7.28.6",
    "@babel/plugin-proposal-pipeline-operator": "^7.28.6"
  }
}
```

`babel.config.json`:

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-pipeline-operator",
      {
        "proposal": "hack",
        "topicToken": "^^"
      }
    ]
  ]
}
```

## Important pitfalls

- This plugin requires a `proposal` option. Babel throws if you omit it or set an unsupported value.
- Hack-style pipes also require `topicToken`, and the token must be one of `"^^"`, `"@@"`, `"^"`, `"%"`, or `"#"`.
- In Hack mode, each pipe body must reference the topic token at least once.
- In Hack mode, arrow functions, assignment expressions, conditional expressions, and `yield` expressions must be parenthesized when they appear as a pipe body.
- If you also use `@babel/parser` or `@babel/generator` directly, keep the parser's `pipelineOperator` settings and the generator's `topicToken` aligned.
- `proposal: "smart"` conflicts with Record & Tuple hash syntax, and Hack pipes with `topicToken: "#"` also conflict with Record & Tuple hash syntax.

## Version-sensitive notes

- This guide targets `@babel/plugin-proposal-pipeline-operator@7.28.6`.
- Current Babel 7 parser validation accepts `proposal: "minimal"`, `"fsharp"`, `"hack"`, and `"smart"`.
- Current Babel 7 parser validation requires `topicToken` only for `proposal: "hack"`.
- Current Babel generator validation only accepts these `topicToken` values: `"%"`, `"#"`, `"@@"`, `"^^"`, and `"^"`.

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-plugin-proposal-pipeline-operator
- npm package page: https://www.npmjs.com/package/@babel/plugin-proposal-pipeline-operator
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-plugin-proposal-pipeline-operator
- Babel parser source: https://github.com/babel/babel/tree/main/packages/babel-parser
- Babel generator source: https://github.com/babel/babel/tree/main/packages/babel-generator
