---
name: eslint
description: "TypeScript setup for ESLint, including when to use the built-in `eslint` types instead of `@types/eslint`, typed config files, Node API usage, and custom rule typing."
metadata:
  languages: "typescript"
  versions: "9.6.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,eslint,linting,types,definitelytyped,node,npm"
---

# ESLint TypeScript Guide

## Golden Rule

This entry tracks `@types/eslint@9.6.1`, but current ESLint 9 releases already publish their own declaration files from the `eslint` runtime package.

In practice, that means most TypeScript projects should install `eslint` and import types from `"eslint"`, not from `"@types/eslint"`. The separate `@types/eslint` package is the DefinitelyTyped declaration package for the `eslint` module, but it does not cover newer runtime subpath entry points such as `"eslint/config"`.

If your project already depends on `@types/eslint`, keep imports pointed at `"eslint"` while you migrate. Do not write `import ... from "@types/eslint"`.

## Install

For a current project using ESLint 9, install the runtime package and TypeScript:

```bash
npm install -D eslint typescript
```

If your repo is already pinned to the separate declaration package, add it as a dev dependency:

```bash
npm install -D eslint @types/eslint typescript
```

`@types/eslint` also pulls in `@types/estree` and `@types/json-schema` automatically. No environment variables, credentials, or service initialization steps are required.

## TypeScript Setup

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

`@types/eslint@9.6.1` declares a minimum TypeScript version of 4.8. Use TypeScript 4.8 or newer when this package is in your dependency graph.

### Import Types From `eslint`

Use the runtime module name as the TypeScript import boundary:

```typescript
import { ESLint } from "eslint";
import type { Linter, Rule } from "eslint";
```

If you only need types, use `import type`. Do not import from `@types/eslint` in source files.

## Common Workflows

### Type a flat config file

For ESLint 9 flat config files, type config objects from the `eslint` module and use the runtime helper from `eslint/config`:

```typescript
import { defineConfig } from "eslint/config";
import type { Linter } from "eslint";

const appConfig: Linter.Config = {
  files: ["src/**/*.js"],
  rules: {
    eqeqeq: "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};

export default defineConfig([appConfig]);
```

This is the safest setup for modern ESLint because the `eslint` runtime package publishes types for both `"eslint"` and `"eslint/config"`.

### Run ESLint programmatically

```typescript
import { ESLint } from "eslint";

const eslint = new ESLint({
  overrideConfig: [
    {
      files: ["src/**/*.js"],
      rules: {
        eqeqeq: "error",
        "no-console": "warn",
      },
    },
  ],
});

const results = await eslint.lintText("console.log(answer == 42)\n", {
  filePath: "src/example.js",
});

const formatter = await eslint.loadFormatter("stylish");
console.log(await formatter.format(results));
```

`ESLint.Options`, `ESLint.LintResult`, and related types are available from the same module when you need reusable annotations in tooling code.

### Reuse the built-in core rule option types

The `eslint/rules` subpath exports typed rule entries for ESLint core rules.

```typescript
import type { Linter } from "eslint";
import type { ESLintRules } from "eslint/rules";

type NoConsoleRule = ESLintRules["no-console"];

const noConsole: NoConsoleRule = ["error", { allow: ["warn", "error"] }];

const rules: Linter.RulesRecord = {
  "no-console": noConsole,
};
```

This is useful when you want reusable, precisely typed rule tuples instead of anonymous arrays.

### Type a custom rule module

```typescript
import type { Rule } from "eslint";

export const noFoo: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow foo identifiers",
    },
    schema: [],
    messages: {
      unexpected: "Unexpected foo identifier.",
    },
  },
  create(context) {
    return {
      Identifier(node) {
        if (node.name === "foo") {
          context.report({ node, messageId: "unexpected" });
        }
      },
    };
  },
};
```

`Rule.RuleModule`, `Rule.RuleListener`, and `Rule.RuleMetaData` are the key types when authoring plugins or internal rule packs.

## Important Pitfalls

- Current ESLint 9 releases already publish their own declaration files. For most ESLint 9 projects, installing `eslint` is enough.
- Do not import from `@types/eslint` in code. Even when you install the declaration package, your imports should still target `"eslint"` or the documented `eslint` subpath.
- `@types/eslint@9.6.1` exports types for `"eslint"`, `"eslint/rules"`, and `"eslint/use-at-your-own-risk"`. It does not export the newer `"eslint/config"` or `"eslint/universal"` entry points that the current runtime package types provide.
- The `eslint/use-at-your-own-risk` types include deprecated APIs such as `FlatESLint`, `LegacyESLint`, `builtinRules`, and `shouldUseFlatConfig()`. Prefer the stable `ESLint` class and the flat config API.
- `@types/eslint` is types only. It does not install the ESLint CLI or runtime.
- `@types/eslint@9.6.1` requires TypeScript 4.8 or newer.

## Version-Sensitive Notes

- This guide targets `@types/eslint==9.6.1`.
- The package metadata lists `@types/estree` and `@types/json-schema` as dependencies, so you usually do not add them manually.
- Current ESLint 9 runtime packages ship their own types; if you are starting fresh, prefer the runtime package's declarations.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/eslint
- DefinitelyTyped source for `@types/eslint`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/eslint
- ESLint npm package page: https://www.npmjs.com/package/eslint
- ESLint repository: https://github.com/eslint/eslint
- ESLint configuration docs: https://eslint.org/docs/latest/use/configure
- ESLint getting started guide: https://eslint.org/docs/latest/use/getting-started#prerequisites
- ESLint `no-console` rule reference: https://eslint.org/docs/latest/rules/no-console
