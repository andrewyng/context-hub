---
name: babel-generator
description: "TypeScript declarations for @babel/generator code printing, source maps, and generator options for Babel ASTs."
metadata:
  languages: "typescript"
  versions: "7.27.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,babel,babel-generator,ast,codegen,types,definitelytyped"
---

# babel-generator TypeScript Guide

`@types/babel__generator` provides the TypeScript declarations for the `@babel/generator` runtime package. Use it when your TypeScript code prints Babel ASTs back to JavaScript, configures output with `GeneratorOptions`, or reads the generated source map.

This package only ships declarations. Install `@babel/generator` for the runtime API.

## Install

Install TypeScript, the generator runtime, and the declaration package together:

```bash
npm install --save-dev typescript @babel/generator @types/babel__generator
```

If your code parses source text or builds AST nodes directly, add the adjacent Babel packages you import from:

```bash
npm install --save-dev @babel/parser @babel/types
```

`@types/babel__generator@7.27.0` declares `typeScriptVersion: "5.1"`, so use TypeScript 5.1 or newer.

## Initialization

There are no package-specific environment variables, credentials, or client objects to initialize.

The practical setup is:

- install `@babel/generator` for the runtime API
- install `@types/babel__generator` for compile-time declarations
- pass a Babel AST into `generate()` or `new CodeGenerator()`
- pass the original source string as the third argument when you need source maps tied to real input

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

Import from `@babel/generator`, never from `@types/babel__generator`:

```typescript
import { CodeGenerator, generate, type GeneratorOptions } from "@babel/generator";
```

The declarations also provide a default export, but the named `generate()` export is a clear default for TypeScript examples.

## Common Workflows

### Generate code from a parsed AST

`@babel/generator` prints the AST you give it. A common workflow is parse → edit AST → generate.

```typescript
import { parse } from "@babel/parser";
import { generate, type GeneratorOptions } from "@babel/generator";
import * as t from "@babel/types";

const source = "const answer = 41;";
const ast = parse(source, { sourceType: "module" });
const statement = ast.program.body[0];

if (statement?.type === "VariableDeclaration") {
  const declarator = statement.declarations[0];

  if (
    t.isVariableDeclarator(declarator) &&
    t.isIdentifier(declarator.id) &&
    t.isNumericLiteral(declarator.init)
  ) {
    declarator.id = t.identifier("result");
    declarator.init = t.numericLiteral(42);
  }
}

const options: GeneratorOptions = {
  comments: true,
  compact: false,
};

const output = generate(ast, options);

console.log(output.code);
```

Use this pattern in codemods, build scripts, and Babel plugins that need typed code generation after AST changes.

### Generate code and a source map

Set `sourceMaps: true` and pass the original source string as the third argument when you want a populated `map` result.

```typescript
import { parse } from "@babel/parser";
import { generate, type GeneratorOptions } from "@babel/generator";

const source = "export const answer = 42;\n";
const ast = parse(source, { sourceType: "module" });

const options: GeneratorOptions = {
  sourceMaps: true,
  sourceFileName: "src/answer.ts",
  sourceRoot: "/workspace",
};

const result = generate(ast, options, source);

console.log(result.code);
console.log(result.map?.sources);
```

The declaration signature also allows the third argument to be a filename-to-source map object when your generation step needs more than one source input.

### Build a small AST manually with `@babel/types`

If you already have Babel node objects, you can generate code without parsing text first.

```typescript
import { generate } from "@babel/generator";
import * as t from "@babel/types";

const ast = t.file(
  t.program([
    t.variableDeclaration("const", [
      t.variableDeclarator(t.identifier("answer"), t.numericLiteral(42)),
    ]),
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(t.identifier("console"), t.identifier("log")),
        [t.identifier("answer")],
      ),
    ),
  ]),
);

const result = generate(ast, { concise: true });

console.log(result.code);
```

This is the direct integration boundary when your tool creates Babel nodes programmatically.

### Use the `CodeGenerator` class directly

The function form is enough for most code, but the declarations also expose the class API.

```typescript
import { CodeGenerator } from "@babel/generator";
import * as t from "@babel/types";

const ast = t.file(t.program([
  t.expressionStatement(t.stringLiteral("©")),
]));

const generator = new CodeGenerator(ast, {
  jsonCompatibleStrings: true,
});

const result = generator.generate();

console.log(result.code);
```

Use `CodeGenerator` when a class instance fits your abstraction better than a single helper call.

## Important Pitfalls

- Install `@babel/generator` separately. `@types/babel__generator` does not include the runtime printer.
- Import from `@babel/generator`, not from `@types/babel__generator`.
- `generate()` prints the AST as-is. Parsing and generating alone does not transform code unless you change the AST first.
- `GeneratorResult.map` is `null` unless you enable `sourceMaps`.
- `sourceFileName` is only used when the third `code` argument is a string, so pass the original source text when you want meaningful source-map metadata.
- `comments: false` does not automatically remove `@license` or `@preserve` comments, because the default `shouldPrintComment()` behavior still keeps those markers in non-minified output.
- Runtime printer options can appear in `@babel/generator` before the corresponding DefinitelyTyped package adds them to `GeneratorOptions`.

## Version-Sensitive Notes

- This guide targets `@types/babel__generator==7.27.0`.
- The published package metadata depends on `@babel/types` and declares a minimum TypeScript version of `5.1`.
- The declarations expose `GeneratorOptions`, `CodeGenerator`, a named `generate()` export, and a default export.
- The published `@babel/generator@7.28.5` runtime normalizes options including `experimental_preserveFormat`, `topicToken`, and `recordAndTupleSyntaxType` in `lib/index.js`, but those fields are not declared in `@types/babel__generator@7.27.0`. If you need those newer options, augment the type locally or verify that a newer declaration publish includes them before relying on them in strict TypeScript code.

## Official Sources

- https://www.npmjs.com/package/@types/babel__generator
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/babel__generator
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/babel__generator/index.d.ts
- https://www.npmjs.com/package/@babel/generator
- https://babeljs.io/docs/babel-generator
