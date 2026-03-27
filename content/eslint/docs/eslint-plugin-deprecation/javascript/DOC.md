---
name: eslint-plugin-deprecation
description: "ESLint plugin for reporting uses of TypeScript symbols marked `@deprecated`, including the required type-aware parser setup and common lint workflows."
metadata:
  languages: "javascript"
  versions: "3.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,deprecation,typescript,javascript,linting,npm"
---

# eslint-plugin-deprecation

`eslint-plugin-deprecation` adds a single ESLint rule, `deprecation/deprecation`, that reports usages of symbols whose TypeScript declarations are marked `@deprecated`.

This package is lint configuration only. It does not use API keys, accounts, runtime clients, or environment variables.

## Install

The rule depends on TypeScript type information, so install ESLint, TypeScript, and the TypeScript parser alongside the plugin:

```bash
npm install --save-dev eslint eslint-plugin-deprecation typescript @typescript-eslint/parser
```

## TypeScript Project Setup

The rule only works when ESLint can build a TypeScript program for the files being linted. Point ESLint at a `tsconfig.json` that includes those files.

If your main `tsconfig.json` excludes tests, scripts, or config files that you still want to lint, create a dedicated ESLint project file:

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts", "src/**/*.tsx", "test/**/*.ts", "test/**/*.tsx"]
}
```

Save that as `tsconfig.eslint.json`, then reference it from ESLint.

## ESLint Config (`.eslintrc.cjs`)

The maintainer setup for this package uses `@typescript-eslint/parser` with `parserOptions.project` so the rule can read deprecation metadata from TypeScript declarations.

```js
module.exports = {
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
        sourceType: "module",
        ecmaVersion: "latest",
      },
      plugins: ["deprecation"],
      rules: {
        "deprecation/deprecation": "warn",
      },
    },
  ],
};
```

If your repo only lints source files and your main `tsconfig.json` already includes them, you can reference that file directly instead of `tsconfig.eslint.json`.

To fail CI on deprecated API usage, change the rule from `"warn"` to `"error"`.

## Common Workflows

### Lint for deprecated API usage

Run ESLint normally after adding the rule:

```bash
npx eslint "src/**/*.{ts,tsx}"
```

Typical `package.json` scripts:

```json
{
  "scripts": {
    "lint": "eslint \"src/**/*.{ts,tsx}\"",
    "lint:ci": "eslint \"src/**/*.{ts,tsx}\" --max-warnings 0"
  }
}
```

Use `--max-warnings 0` when the rule is still configured as a warning locally but should fail in CI.

### Flag usages of your own deprecated exports

The rule reads `@deprecated` tags from TypeScript declarations or JSDoc.

```ts
// api.ts
/** @deprecated Use createClient instead. */
export function createLegacyClient() {
  return {};
}
```

```ts
// app.ts
import { createLegacyClient } from "./api";

createLegacyClient();
```

With the rule enabled, ESLint reports the usage in `app.ts`.

### Roll out gradually in an existing codebase

Start with a warning while you clean up existing deprecated calls:

```js
module.exports = {
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
      },
      plugins: ["deprecation"],
      rules: {
        "deprecation/deprecation": "warn",
      },
    },
  ],
};
```

After the codebase is clean, change the rule to `"error"` so new deprecated usages fail linting immediately.

## Important Pitfalls

- `deprecation/deprecation` needs type information. If `parserOptions.project` is missing or points at the wrong `tsconfig`, the rule cannot evaluate deprecations correctly.
- The `tsconfig` used for linting must include every file you run ESLint against. If ESLint targets a file outside that project, type-aware linting will fail before this rule runs.
- Configure the rule only for files parsed by `@typescript-eslint/parser`. In mixed JS and TS repos, scope it with `overrides` instead of enabling it globally.
- The rule reports usages of declarations marked `@deprecated`; it does not read npm package deprecation notices from the registry.
- This plugin reports problems but does not choose replacement APIs for you. Keep the deprecation message on the declaration clear so developers know what to migrate to.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-deprecation@3.0.0`.
- The package centers on the `deprecation/deprecation` rule and the type-aware ESLint setup required for that rule.
- The maintainer documentation for this release family is based on `.eslintrc`-style ESLint configuration with `@typescript-eslint/parser`.

## Official Sources

- GitHub repository: https://github.com/gund/eslint-plugin-deprecation
- GitHub README: https://github.com/gund/eslint-plugin-deprecation#readme
- npm package page: https://www.npmjs.com/package/eslint-plugin-deprecation
