---
name: lodash.flatten
description: "TypeScript guidance for `lodash.flatten`, including installation of the standalone runtime package and `@types/lodash.flatten`, CommonJS-friendly imports, and practical shallow `flatten()` workflows."
metadata:
  languages: "typescript"
  versions: "4.4.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,lodash,lodash.flatten,flatten,arrays,types,definitelytyped,npm"
---

# lodash.flatten TypeScript Guide

## Golden Rule

Install `lodash.flatten` for runtime behavior and `@types/lodash.flatten` for TypeScript declarations.

Import from `"lodash.flatten"` in application code. Do not import from `"@types/lodash.flatten"` directly.

There is no client initialization step, authentication flow, CLI setup, or package-specific environment variable.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install lodash.flatten
npm install -D typescript @types/lodash.flatten@4.4.9
```

If your project already uses TypeScript, add just the declarations:

```bash
npm install -D @types/lodash.flatten@4.4.9
```

If your codebase already depends on the full `lodash` package and calls `_.flatten()`, keep using `lodash` with `@types/lodash` instead of mixing full-package and standalone-module imports casually.

## Import Style And `tsconfig.json`

The published module uses CommonJS-style exports. The most direct TypeScript import form is:

```typescript
import flatten = require("lodash.flatten");
```

If your project already enables default-import interop, this also works:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true
  }
}
```

```typescript
import flatten from "lodash.flatten";
```

Pick one import style and use it consistently.

Do not use a named import such as `import { flatten } from "lodash.flatten"`; this package exports a single function.

## Common Workflows

### Flatten arrays returned from `map()`

`flatten()` is most useful when one step of your pipeline produces a `T[][]` shape and the next step wants a simple `T[]`.

```typescript
import flatten = require("lodash.flatten");

type Route = {
  method: "GET" | "POST";
  path: string;
};

type Service = {
  name: string;
  routes: Route[];
};

const services: Service[] = [
  {
    name: "billing",
    routes: [
      { method: "GET", path: "/invoices" },
      { method: "POST", path: "/invoices" },
    ],
  },
  {
    name: "identity",
    routes: [{ method: "GET", path: "/users" }],
  },
];

const routes = flatten(services.map((service) => service.routes));

console.log(routes);
```

Here, TypeScript infers `routes` as `Route[]`.

### Normalize values that may be single items or arrays

This package works well when your application accepts `T | T[]` and you want to normalize that input once.

```typescript
import flatten = require("lodash.flatten");

type HeaderRule = {
  key: string;
  value: string;
};

type HeaderRuleInput = HeaderRule | HeaderRule[];

const ruleInputs: HeaderRuleInput[] = [
  { key: "x-request-id", value: "req_123" },
  [
    { key: "x-region", value: "us-east-1" },
    { key: "x-service", value: "billing" },
  ],
];

const rules = flatten(ruleInputs);

console.log(rules);
```

This keeps the runtime normalization simple while giving the rest of your code a stable `HeaderRule[]` shape.

### Flatten exactly one level

`flatten()` is shallow. It removes only one nesting level.

```typescript
import flatten = require("lodash.flatten");

const nested: Array<number | number[] | number[][]> = [
  1,
  [2, 3],
  [[4, 5]],
];

const flattenedOnce = flatten(nested);

console.log(flattenedOnce);
```

The result is `[1, 2, 3, [4, 5]]`, not `[1, 2, 3, 4, 5]`. If your data is nested more deeply than one level, you need a different flattening strategy.

### Flatten filtered groups into a single work list

The package does not define environment variables, but it is common to flatten application data that has already been filtered using `process.env`.

```typescript
import flatten = require("lodash.flatten");

type Task = {
  id: string;
  internal: boolean;
};

type TaskGroup = {
  name: string;
  tasks: Task[];
};

const includeInternalTasks = process.env.INCLUDE_INTERNAL_TASKS === "1";

const groups: TaskGroup[] = [
  {
    name: "default",
    tasks: [
      { id: "task_public_1", internal: false },
      { id: "task_internal_1", internal: true },
    ],
  },
  {
    name: "reports",
    tasks: [{ id: "task_public_2", internal: false }],
  },
];

const visibleTasks = flatten(
  groups.map((group) =>
    group.tasks.filter((task) => includeInternalTasks || !task.internal),
  ),
);

console.log(visibleTasks.map((task) => task.id));
```

## Minimal End-to-End Example

This example builds a list of tags from grouped records, filters by an app-defined environment variable, and flattens the remaining arrays into one typed result.

```typescript
import flatten = require("lodash.flatten");

type Article = {
  slug: string;
  tags: string[];
  archived: boolean;
};

type Category = {
  name: string;
  articles: Article[];
};

const includeArchived = process.env.INCLUDE_ARCHIVED_ARTICLES === "1";

const categories: Category[] = [
  {
    name: "typescript",
    articles: [
      { slug: "flatten-arrays", tags: ["typescript", "arrays"], archived: false },
      { slug: "legacy-imports", tags: ["typescript", "commonjs"], archived: true },
    ],
  },
  {
    name: "runtime",
    articles: [
      { slug: "lodash-workflows", tags: ["lodash", "utility"], archived: false },
    ],
  },
];

const tags = flatten(
  categories.map((category) =>
    category.articles
      .filter((article) => includeArchived || !article.archived)
      .map((article) => article.tags),
  ),
);

console.log(tags);
```

Run the compiled program with an app-specific flag if you want archived articles included:

```bash
INCLUDE_ARCHIVED_ARTICLES=1 node dist/index.js
```

## Important Pitfalls

- `@types/lodash.flatten` is a declaration package only. Keep `lodash.flatten` in your runtime dependencies.
- Do not import from `@types/lodash.flatten`; import from `lodash.flatten`.
- `lodash.flatten` exports a single function. Use `import flatten = require("lodash.flatten")` or enable `esModuleInterop` and use a default import.
- `flatten()` removes only one array nesting level. It does not recursively flatten arbitrarily deep structures.
- If your data comes from untyped JSON or another untrusted source, validate it before relying on the inferred `flatten()` result type.
- If your project already uses the full `lodash` package, keep import style consistent across the codebase instead of mixing per-method modules and full-package imports casually.

## Version-Sensitive Notes

- This guide targets `@types/lodash.flatten==4.4.9`.
- The declarations are maintained in DefinitelyTyped and are intended for the standalone `lodash.flatten` npm module.
- The documented runtime behavior is the Lodash 4 shallow `flatten(array)` helper: one level only.

## Official Sources

- https://www.npmjs.com/package/@types/lodash.flatten
- https://www.npmjs.com/package/lodash.flatten
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/lodash.flatten
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/lodash.flatten/index.d.ts
- https://lodash.com/docs/#flatten
- https://www.typescriptlang.org/tsconfig#esModuleInterop
