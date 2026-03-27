---
name: chalk
description: "TypeScript declarations for Chalk's CommonJS terminal styling API"
metadata:
  languages: "typescript"
  versions: "2.2.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,chalk,terminal,cli,ansi,types"
---

# Chalk TypeScript Guide

`@types/chalk` adds TypeScript declarations for the `chalk` runtime package so TypeScript can understand Chalk's chainable color and style APIs.

This package only ships `.d.ts` files. It does not provide the Chalk runtime itself.

## Install

Install Chalk and the matching type package together:

```bash
npm install chalk
npm install --save-dev @types/chalk@2.2.4
```

If you are maintaining an older Chalk 2.x codebase, keeping the runtime and declaration majors aligned avoids the most common type mismatches.

No authentication, environment variables, or client initialization are required to use the type package.

## TypeScript Setup

In a normal TypeScript project, installing `@types/chalk` is enough.

Only add `chalk` to `compilerOptions.types` if your project already restricts which declaration packages TypeScript loads:

```json
{
  "compilerOptions": {
    "types": ["node", "chalk"]
  }
}
```

If you do not restrict `compilerOptions.types`, you usually do not need this snippet.

## Import Chalk Correctly

These declarations model Chalk as a CommonJS `export =` module.

Use `import = require()` when you want the import form that matches the declarations directly:

```ts
import chalk = require("chalk");

console.log(chalk.green("ready"));
console.log(chalk.bold.red("failed"));
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

```ts
import chalk from "chalk";

console.log(chalk.blue("hello"));
```

Do not import from `"@types/chalk"` in application code.

## Style Text With Chainable APIs

The declarations type Chalk's fluent style builder, so chained modifiers and color functions stay available as you compose output.

```ts
import chalk = require("chalk");

const title = chalk.bold.underline("Project Atlas");
const ok = chalk.green("ok");
const warning = chalk.bgYellow.black(" warning ");
const error = chalk.redBright.bold("error");

console.log(title);
console.log(ok, warning, error);
```

Order does not matter for compatible chained styles, and later conflicting color choices take precedence.

## Use RGB, Hex, And Background Helpers

The package also types Chalk's color helper methods for 24-bit and palette-based formatting:

```ts
import chalk = require("chalk");

const accent = chalk.hex("#2563eb")("info");
const badge = chalk.bgHex("#1f2937").white(" build ");
const metric = chalk.rgb(255, 131, 0)("73%");

console.log(accent, badge, metric);
```

Use these helpers when fixed named colors are not enough for your CLI or log output.

## Reuse Styled Formatters

Because styled chains are callable, a common pattern is to build a formatter once and reuse it across your app.

```ts
import chalk = require("chalk");

const info = chalk.cyan;
const success = chalk.green.bold;
const failure = chalk.white.bgRed.bold;

export function logResult(name: string, passed: boolean) {
  if (passed) {
    console.log(success("PASS"), info(name));
    return;
  }

  console.error(failure("FAIL"), info(name));
}
```

This keeps formatting consistent without losing type information.

## Use Chalk As A Tagged Template

Chalk can also format tagged template literals:

```ts
import chalk = require("chalk");

const percent = 82;

console.log(chalk`CPU: {green ${percent}%}`);
console.log(chalk.red.bgBlack`status: {bold degraded}`);
```

This is convenient when a single log line mixes plain text and multiple styles.

## Control Color Output Deliberately

At runtime, Chalk detects terminal color support automatically. You can still branch on support in application code:

```ts
import chalk = require("chalk");

if (chalk.supportsColor) {
  console.log(chalk.green("color output enabled"));
} else {
  console.log("color output disabled");
}
```

For command-line runs, `FORCE_COLOR` is the main environment override:

```bash
FORCE_COLOR=0 node dist/cli.js
FORCE_COLOR=3 node dist/cli.js
```

This affects Chalk's runtime behavior; `@types/chalk` only provides the TypeScript declarations.

## Common Pitfalls

- Install `chalk` as well as `@types/chalk`; the type package does not contain runtime JavaScript.
- Import from `"chalk"`, not from `"@types/chalk"`.
- If your `tsconfig.json` uses `compilerOptions.types`, include `chalk` there or the declarations will not load.
- These declarations use CommonJS `export =` semantics, so `import { red } from "chalk"` is not the right import form.
- Newer Chalk releases ship their own declarations. If your installed `chalk` package already includes a `types` entry, you usually should not install `@types/chalk` alongside it.

## Official Sources

- https://www.npmjs.com/package/@types/chalk
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/chalk
- https://www.npmjs.com/package/chalk
- https://github.com/chalk/chalk
