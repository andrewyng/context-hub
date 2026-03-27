---
name: graphql
description: "TypeScript declarations for GraphQL.js schema construction, query execution, parsing, validation, and shared GraphQL types."
metadata:
  languages: "typescript"
  versions: "14.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,graphql,graphql-js,types,definitelytyped,schema,validation"
---

# GraphQL TypeScript Guide

## Golden Rule

Install `@types/graphql` alongside the real `graphql` runtime package.

`@types/graphql` only provides TypeScript declarations. Your application imports and executes code from `graphql`; the declaration package supplies the types for schema objects, execution results, parser utilities, validation helpers, errors, and resolver signatures.

## Install

For the version this guide targets, install matching `graphql` and `@types/graphql` packages:

```bash
npm install graphql@14.5.0
npm install -D typescript @types/graphql@14.5.0 @types/node
```

If your project already depends on `graphql`, add only the missing TypeScript packages:

```bash
npm install -D @types/graphql@14.5.0 @types/node
```

## Initialization

There are no package-specific environment variables, credentials, or client objects to configure.

The practical setup points are your TypeScript compiler settings, your import style, and the boundary between the declaration package and the runtime library.

### Recommended `tsconfig.json`

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

`@types/graphql` works best when `strict` mode is on, because GraphQL execution results can contain partial data and optional errors.

### Import from `graphql`, not `@types/graphql`

Use the runtime package name in both value imports and type-only imports:

```typescript
import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

import type { ExecutionResult, GraphQLError } from "graphql";
```

Do not write application imports like `import type { GraphQLSchema } from "@types/graphql"`.

## Common Workflows

### Define a schema with typed resolver context

```typescript
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

type Context = {
  requestId: string;
};

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      hello: {
        type: GraphQLString,
        resolve: (_source, _args, context: Context) => {
          return `hello ${context.requestId}`;
        },
      },
    },
  }),
});
```

This is the simplest way to keep your resolver context typed without introducing framework-specific abstractions.

### Execute a query and handle `ExecutionResult`

```typescript
import { graphql } from "graphql";
import type { ExecutionResult } from "graphql";

const result: ExecutionResult = await graphql({
  schema,
  source: "{ hello }",
  contextValue: { requestId: "req_123" },
});

if (result.errors) {
  for (const error of result.errors) {
    console.error(error.message);
  }
}

console.log(result.data);
```

Treat both `result.data` and `result.errors` as optional. GraphQL execution can return partial data with one or more errors.

### Parse and validate before execution

```typescript
import {
  buildSchema,
  parse,
  specifiedRules,
  validate,
} from "graphql";

const schema = buildSchema(`
  type Query {
    user(id: ID!): String
  }
`);

const document = parse(`
  query GetUser($id: ID!) {
    user(id: $id)
  }
`);

const errors = validate(schema, document, specifiedRules);

if (errors.length > 0) {
  throw new Error(errors.map((error) => error.message).join("\n"));
}
```

Use this split workflow when you need to reject invalid documents before they reach execution, or when you are building tooling around GraphQL documents.

### Build a schema from SDL

```typescript
import { buildSchema, graphql } from "graphql";

const schema = buildSchema(`
  type Query {
    greet(name: String): String!
  }
`);

const rootValue = {
  greet: ({ name }: { name?: string }) => `Hello ${name ?? "world"}`,
};

const result = await graphql({
  schema,
  source: '{ greet(name: "Ada") }',
  rootValue,
});

console.log(result.data);
```

This pattern is useful for small services, tests, and examples where SDL is easier to maintain than constructor-based type definitions.

### Reuse GraphQL types at application boundaries

```typescript
import type {
  DocumentNode,
  ExecutionResult,
  GraphQLError,
  GraphQLResolveInfo,
  GraphQLSchema,
} from "graphql";

type ResolverContext = {
  userId?: string;
};

export type CompiledOperation = {
  document: DocumentNode;
  schema: GraphQLSchema;
};

export function logErrors(result: ExecutionResult) {
  const errors: readonly GraphQLError[] = result.errors ?? [];

  for (const error of errors) {
    console.error(error.message);
  }
}

export function describeResolver(_info: GraphQLResolveInfo, context: ResolverContext) {
  return context.userId ?? "anonymous";
}
```

Use these exported types in service helpers, test utilities, and framework adapters instead of inventing your own parallel interfaces.

## Minimal End-to-End Example

This example builds a schema in code, reads an optional app-specific query string from the environment, and executes it through `graphql()`.

```typescript
import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      status: {
        type: GraphQLString,
        resolve: () => "ok",
      },
    },
  }),
});

const source = process.env.GRAPHQL_QUERY ?? "{ status }";

const result = await graphql({ schema, source });

console.log(JSON.stringify(result, null, 2));
```

Run the compiled file with an optional query override:

```bash
GRAPHQL_QUERY='{ status }' node dist/index.js
```

## Important Pitfalls

- `@types/graphql` is a declaration package only. Install `graphql` separately for runtime behavior.
- Import from `graphql`, not from `@types/graphql`.
- Keep the runtime package and declaration package on the same GraphQL 14 API surface.
- Prefer named imports from `graphql`; do not rely on a default import.
- Check both `result.data` and `result.errors` after execution, because GraphQL responses can contain partial success.
- Use explicit resolver functions when you need typed context, custom argument handling, or behavior that should not depend on the default field resolver.

## Version-Sensitive Notes

- This guide targets `@types/graphql==14.5.0`.
- The declarations are intended for GraphQL.js usage through the `graphql` package.
- If you upgrade the GraphQL runtime to a different major version, review the matching declarations and execution signatures together.
