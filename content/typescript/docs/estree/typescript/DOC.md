---
name: estree
description: "TypeScript declarations for ESTree AST nodes, including how to import the `estree` module, type AST traversal code, and handle parser-specific extensions."
metadata:
  languages: "typescript"
  versions: "1.0.8"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,estree,ast,types,definitelytyped,npm"
---

# ESTree TypeScript Guide

## What This Package Provides

`@types/estree` is the DefinitelyTyped declaration package for the `estree` module. It gives you TypeScript interfaces and unions for ESTree-compatible abstract syntax trees, including `Program`, `Node`, `Statement`, `Expression`, `Identifier`, `Literal`, `Comment`, and `SourceLocation`.

This package is declarations only:

- It does not parse source code.
- It does not walk or transform ASTs.
- It does not require environment variables, credentials, or runtime initialization.

Install a parser or traversal library separately when you need runtime behavior.

## Install

Install the declarations as a development dependency:

```bash
npm install -D typescript @types/estree
```

The published package metadata declares a minimum TypeScript version of `5.1`, so use TypeScript 5.1 or newer.

When you use the package in source code, import from `"estree"`:

```typescript
import type { Expression, Node, Program } from "estree";
```

Do not try to import from `"@types/estree"` in application code.

## TypeScript Setup

No package-specific compiler configuration is required beyond normal `node_modules` resolution. A minimal strict setup looks like this:

```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": false
  }
}
```

Use `import type` for AST-only dependencies so the declarations stay on the type side of your program.

## Common Workflows

### Narrow node unions with `type`

The definitions are built around discriminated unions, so checking `node.type` narrows to the matching ESTree interface.

```typescript
import type { Expression } from "estree";

export function describeExpression(expression: Expression): string {
  switch (expression.type) {
    case "Identifier":
      return `identifier:${expression.name}`;
    case "Literal":
      return `literal:${String(expression.value)}`;
    case "CallExpression":
      return `call:${expression.callee.type}`;
    default:
      return expression.type;
  }
}
```

This is the main reason to use the package directly instead of treating AST values as loose objects.

### Type AST traversal code

Libraries that consume ESTree nodes commonly type against the `estree` module. For example, `estree-walker`'s published types use `import("estree").Node`.

```typescript
import { walk } from "estree-walker";
import type { Program } from "estree";

export function collectIdentifiers(program: Program): string[] {
  const names: string[] = [];

  walk(program, {
    enter(node) {
      if (node.type === "Identifier") {
        names.push(node.name);
      }
    },
  });

  return names;
}
```

If your parser returns an ESTree-compatible AST, typing the boundary as `Program` or `Node` makes walker callbacks narrow correctly.

### Type AST fixtures and test data

Use `satisfies` or an explicit annotation when building AST fixtures by hand.

```typescript
import type { Program } from "estree";

export const emptyModule = {
  type: "Program",
  sourceType: "module",
  body: [],
} satisfies Program;
```

This catches misspelled node kinds and missing required fields without widening everything to `any`.

### Add parser-specific fields at the integration boundary

`@types/estree` models the shared ESTree node surface. If your parser or tool attaches extra metadata, extend the base types locally.

```typescript
import type { Program } from "estree";

type ParsedProgram = Program & {
  tokens?: unknown[];
};

export function getTokenCount(program: ParsedProgram): number {
  return program.tokens?.length ?? 0;
}
```

Keep the core AST typed as ESTree, then layer tool-specific fields on top instead of rewriting the whole node model.

## Common Pitfalls

- `@types/estree` does not ship a runtime parser. Pair it with a parser or AST tool when you need to create or traverse nodes.
- Import types from `"estree"`, not from the `@types` package name.
- `Program.body` is not only statements. In the published definitions it is `Array<Directive | Statement | ModuleDeclaration>`, so module code can contain imports and exports at the top level.
- The base node types include optional location and comment data such as `loc`, `range`, `leadingComments`, `trailingComments`, and `Program.comments`, but parser-specific fields outside that surface are not guaranteed.
- `1.0.8` includes newer ESTree shapes such as `ChainExpression`, `ImportExpression`, `PrivateIdentifier`, `PropertyDefinition`, `StaticBlock`, and `VariableDeclaration.kind` values `"using"` and `"await using"`. Your parser or downstream tooling may support a narrower syntax set even though the type package includes them.

## Official Sources

- https://www.npmjs.com/package/@types/estree
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/estree
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/estree/index.d.ts
- https://github.com/Rich-Harris/estree-walker#readme
