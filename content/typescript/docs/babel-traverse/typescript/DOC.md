---
name: babel-traverse
description: "TypeScript declarations for @babel/traverse AST visitors, NodePath helpers, scope APIs, and traversal utilities."
metadata:
  languages: "typescript"
  versions: "7.28.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,babel,babel-traverse,ast,codemod,compiler,types,definitelytyped"
---

# Babel Traverse TypeScript Guide

`@types/babel__traverse` provides TypeScript declarations for the `@babel/traverse` runtime package.

Install it when you write Babel transforms, codemods, lint-style AST checks, or build tooling in TypeScript and want typed access to `traverse(...)`, `Visitor`, `NodePath`, `Scope`, and the related traversal helpers.

This package only ships declarations. Your code still imports and runs `@babel/traverse`.

## Install

Install the runtime package together with the declaration package. If you parse source text yourself or build replacement nodes, install the parser and types packages you use in code:

```bash
npm install --save-dev typescript @babel/traverse @babel/parser @babel/types
npm install --save-dev @types/babel__traverse@7.28.0
```

If your project already receives ASTs from `@babel/core` or another Babel tool, you may not need `@babel/parser` directly.

There are no package-specific environment variables, credentials, tokens, or client objects to configure.

## TypeScript Setup

`@types/babel__traverse@7.28.0` declares `typeScriptVersion: "5.1"`, so use TypeScript 5.1 or newer.

Import runtime values and types from `@babel/traverse`, not from `@types/babel__traverse`:

```ts
import traverse, { type NodePath, type Visitor } from "@babel/traverse";
import { parse } from "@babel/parser";
import * as t from "@babel/types";
```

If your project restricts global type loading with `compilerOptions.types`, include `babel__traverse` explicitly:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node", "babel__traverse"]
  }
}
```

If you do not restrict `compilerOptions.types`, TypeScript usually discovers the declarations automatically.

## Common Workflows

### Traverse a parsed AST with typed visitors

The main API is the default `traverse(...)` function. It accepts a Babel AST node and a `Visitor` object whose keys are node types or aliases.

```ts
import traverse, { type Visitor } from "@babel/traverse";
import { parse } from "@babel/parser";
import * as t from "@babel/types";

const source = `
  const answer = count + 1;
  console.log(answer);
`;

const ast = parse(source, {
  sourceType: "module",
});

const visitor: Visitor = {
  Identifier(path) {
    if (path.node.name === "answer") {
      path.node.name = "total";
    }
  },
  BinaryExpression(path) {
    if (t.isIdentifier(path.node.left, { name: "count" })) {
      console.log(path.get("right").isNumericLiteral());
    }
  },
};

traverse(ast, visitor);
```

Use this pattern for codemods, custom lint rules, and build-time analysis.

### Carry typed traversal state with `Visitor<S>`

The declarations type visitor state as a generic, so your traversal callbacks can share a structured accumulator without falling back to `any`.

```ts
import traverse, { type Visitor } from "@babel/traverse";
import { parse } from "@babel/parser";

type IdentifierStats = {
  counts: Map<string, number>;
};

const ast = parse("const a = b + c; console.log(a);", {
  sourceType: "module",
});

const state: IdentifierStats = {
  counts: new Map(),
};

const visitor: Visitor<IdentifierStats> = {
  Identifier(path, currentState) {
    const nextCount = (currentState.counts.get(path.node.name) ?? 0) + 1;
    currentState.counts.set(path.node.name, nextCount);
  },
};

traverse(ast, visitor, undefined, state);

console.log(state.counts);
```

This is the practical way to collect names, references, or findings across one traversal pass.

### Rename bindings with `Scope`

`NodePath#scope` gives you the typed Babel scope API, including binding lookups and safe renaming.

```ts
import traverse from "@babel/traverse";
import { parse } from "@babel/parser";

const ast = parse(
  `
  function compute(input) {
    const answer = input + 1;
    return answer * 2;
  }
`,
  { sourceType: "module" },
);

traverse(ast, {
  FunctionDeclaration(path) {
    if (path.node.id?.name !== "compute") {
      return;
    }

    if (path.scope.hasBinding("answer")) {
      path.scope.rename("answer", "result");
    }
  },
});
```

Prefer `scope.rename(...)` over manual string replacement when a transform changes identifiers across references in the same scope.

### Evaluate and replace nodes through `NodePath`

The declarations cover common `NodePath` helpers such as `evaluate()`, `replaceWith(...)`, `remove()`, `skip()`, `stop()`, and `get(...)`.

```ts
import traverse from "@babel/traverse";
import { parse } from "@babel/parser";
import * as t from "@babel/types";

const ast = parse("const value = 2 + 3; const keep = input + 1;", {
  sourceType: "module",
});

traverse(ast, {
  BinaryExpression(path) {
    const evaluated = path.evaluate();

    if (evaluated.confident && typeof evaluated.value === "number") {
      path.replaceWith(t.numericLiteral(evaluated.value));
    }
  },
});
```

This is useful when you want a conservative constant-folding step before a later transform or analysis pass.

### Check AST structure with top-level helpers

The default export also exposes traversal utilities such as `hasType(...)`, `removeProperties(...)`, `clearNode(...)`, `visitors.verify(...)`, and `visitors.explode(...)`.

```ts
import traverse from "@babel/traverse";
import { parse } from "@babel/parser";

const ast = parse("await fetch(url)", {
  sourceType: "module",
  plugins: ["topLevelAwait"],
});

if (traverse.hasType(ast, "AwaitExpression")) {
  console.log("The file contains an await expression.");
}
```

Use these helpers for quick preflight checks before you commit to a full visitor.

## Important Pitfalls

- Install `@babel/traverse` as well as `@types/babel__traverse`; the type package does not include runtime JavaScript.
- Import from `@babel/traverse`, not from `@types/babel__traverse`.
- If your code imports `@babel/types` directly for builders or guards such as `t.numericLiteral(...)` or `t.isIdentifier(...)`, list `@babel/types` as a direct dependency in your project.
- `@babel/traverse` traverses an existing AST. It does not parse source text; use `@babel/parser` or `@babel/core` when you need to create the AST first.
- The runtime throws when you traverse a node other than `Program` or `File` without passing both `scope` and `parentPath`. For partial-node traversal, either keep the original `NodePath` context or use `noScope: true` only when scope data is not needed.
- If `compilerOptions.types` is restricted and `babel__traverse` is missing from the list, the declarations will not load even if the package is installed.

## Version-Sensitive Notes

- This guide targets `@types/babel__traverse==7.28.0`.
- The package metadata declares `typeScriptVersion: "5.1"`.
- The declaration package depends on `@babel/types` with range `^7.28.2`.
- The Babel 7.28.x `@babel/traverse` package is published as CommonJS and its package metadata does not declare bundled TypeScript types, which is why the separate `@types/babel__traverse` package is relevant for this version line.

## Official Sources

- https://www.npmjs.com/package/@types/babel__traverse
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/babel__traverse
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/babel__traverse/index.d.ts
- https://www.npmjs.com/package/@babel/traverse
- https://babel.dev/docs/babel-traverse
- https://www.npmjs.com/package/@babel/parser
- https://babel.dev/docs/babel-parser
- https://www.npmjs.com/package/@babel/types
