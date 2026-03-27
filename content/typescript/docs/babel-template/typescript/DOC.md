---
name: babel-template
description: "TypeScript declarations for @babel/template AST builders, placeholders, and parser options when generating Babel nodes from code snippets."
metadata:
  languages: "typescript"
  versions: "7.4.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,babel,babel-template,ast,codegen,types,definitelytyped"
---

# babel-template TypeScript Guide

`@types/babel__template` provides the TypeScript declarations for the `@babel/template` runtime package. Use it when your TypeScript code builds Babel AST nodes from code snippets, placeholder substitutions, or parser-enabled templates inside codemods, Babel plugins, and compiler tooling.

This package only ships declarations. Install `@babel/template` for the runtime API.

## Install

Install TypeScript, the Babel template runtime, and the declaration package together:

```bash
npm install --save-dev typescript @babel/template @types/babel__template
```

Most real usage also imports Babel node builders or prints generated ASTs back to code, so add the adjacent Babel packages you use directly:

```bash
npm install --save-dev @babel/types @babel/generator
```

If you parse or template syntax that needs extra parser plugins, keep the related Babel packages on the same Babel 7 line as the rest of your toolchain.

## Initialization

There are no package-specific environment variables, credentials, or client objects to initialize.

The practical setup is:

- install `@babel/template` for the runtime builder API
- install `@types/babel__template` for compile-time declarations
- import `template` from `@babel/template`
- pass Babel AST nodes from `@babel/types` as placeholder replacements
- enable parser plugins in template options when the snippet includes TypeScript, JSX, or other non-default syntax

## TypeScript Setup

No package-specific compiler flags are required beyond normal TypeScript module resolution. A minimal strict setup looks like this:

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

Import from `@babel/template`, never from `@types/babel__template`:

```typescript
import template from "@babel/template";
import * as t from "@babel/types";
```

In TypeScript, prefer the shape-specific builders such as `template.statement(...)`, `template.statements(...)`, `template.expression(...)`, and `template.program(...)`. They produce narrower result types than the generic builder APIs and usually avoid extra casts.

## Common Workflows

### Build one statement with identifier and literal placeholders

`template.statement(...)` is the practical default when your snippet should produce exactly one Babel `Statement`.

```typescript
import template from "@babel/template";
import * as t from "@babel/types";

const buildRequire = template.statement(`const IMPORT_NAME = require(SOURCE);`);

const declaration = buildRequire({
  IMPORT_NAME: t.identifier("fs"),
  SOURCE: t.stringLiteral("node:fs"),
});

console.log(declaration.type);
```

Use this pattern when a codemod or plugin needs to inject a declaration without manually assembling every AST node by hand.

### Build an expression and embed it elsewhere

`template.expression(...)` is the narrowest choice when you need a single Babel `Expression`.

```typescript
import template from "@babel/template";
import * as t from "@babel/types";

const buildCall = template.expression(`console.log(MESSAGE)`);

const expression = buildCall({
  MESSAGE: t.stringLiteral("ready"),
});

const statement = t.expressionStatement(expression);

console.log(statement.type);
```

This keeps the builder result precise, which is useful when the next API expects an `Expression` instead of a generic node union.

### Generate multiple statements or a full program

When a snippet expands to more than one statement, use `template.statements(...)` or `template.program(...)` instead of casting the result from a looser builder.

```typescript
import template from "@babel/template";
import { generate } from "@babel/generator";

const buildProgram = template.program(
  `
  const answer: number = 42;
  export default answer;
`,
  {
    plugins: ["typescript"],
  },
);

const program = buildProgram();

console.log(generate(program).code);
```

Pass parser plugins whenever the template string contains syntax such as TypeScript annotations or JSX that the default parser configuration would reject.

### Use syntactic placeholders for clearer replacements

Syntactic placeholders are useful when you want placeholder names that are visually distinct from the code around them.

```typescript
import template from "@babel/template";
import * as t from "@babel/types";

const buildExport = template.statement(
  `export const %%name%% = %%value%%;`,
  {
    syntacticPlaceholders: true,
  },
);

const declaration = buildExport({
  name: t.identifier("answer"),
  value: t.numericLiteral(42),
});

console.log(declaration.type);
```

This is often easier to read than relying on all-caps identifier placeholders inside larger templates.

### Parse a one-off AST fragment directly

Use `template.ast(...)` when you want the parsed AST result immediately and do not need a reusable builder function.

```typescript
import template from "@babel/template";

const fileAst = template.ast(`export default 42;`);

console.log(fileAst.type);
```

This is convenient in tests and small tooling helpers where you only need to parse one snippet once.

## Important Pitfalls

- Install `@babel/template` separately. `@types/babel__template` does not include runtime JavaScript.
- Import from `@babel/template`, not from `@types/babel__template`.
- Placeholder replacements are Babel AST nodes, not raw JavaScript values. Use builders such as `t.identifier(...)`, `t.stringLiteral(...)`, and `t.numericLiteral(...)` from `@babel/types`.
- If the template string includes TypeScript, JSX, decorators, or other non-default syntax, pass the required parser plugins in the template options.
- Prefer `template.statement(...)`, `template.statements(...)`, `template.expression(...)`, and `template.program(...)` in TypeScript. They give you narrower result types than the generic builder forms.
- `@babel/template` creates AST nodes. It does not traverse, transform, or print code by itself; pair it with `@babel/traverse`, `@babel/core`, or `@babel/generator` when you need those steps.
- The runtime package can add new parser or template options before the separate DefinitelyTyped package reflects them. In strict TypeScript code, verify option names against the published declaration package for the version you install.

## Version-Sensitive Notes

- This guide targets `@types/babel__template==7.4.4`.
- The published package metadata for `@types/babel__template@7.4.4` depends on `@babel/parser` `^7.1.0` and `@babel/types` `^7.0.0`.
- The current `@babel/template` npm package metadata does not declare bundled `types` or `typings`, which is why the separate `@types/babel__template` package remains relevant for Babel 7 TypeScript projects.

## Official Sources

- https://www.npmjs.com/package/@types/babel__template
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/babel__template
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/babel__template/index.d.ts
- https://www.npmjs.com/package/@babel/template
- https://babeljs.io/docs/babel-template
- https://www.npmjs.com/package/@babel/types
- https://www.npmjs.com/package/@babel/generator
