---
name: eslint-config-next
description: "Flat-config setup for linting Next.js projects with ESLint 9, including the base config, Core Web Vitals rules, TypeScript rules, and ignore overrides."
metadata:
  languages: "javascript"
  versions: "16.1.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "nextjs,eslint,javascript,react,linting,flat-config"
---

# eslint-config-next JavaScript Guide

## Golden Rule

Use `eslint-config-next` as a flat ESLint config for a Next.js app, and spread its exported config arrays into `defineConfig()`.

For most apps, start with `eslint-config-next/core-web-vitals`. If the project also uses TypeScript and you want TypeScript-specific recommended rules, add `eslint-config-next/typescript` after it.

This package is local project configuration only. It does not use API keys, accounts, service credentials, or runtime environment variables.

## Install

Install it in an existing Next.js project with ESLint 9:

```bash
npm install -D eslint eslint-config-next
```

If you want the TypeScript rules export, keep a local `typescript` dependency too:

```bash
npm install -D typescript
```

`eslint-config-next@16.1.6` declares these peer dependencies:

- `eslint >=9.0.0`
- `typescript >=3.3.1` as an optional peer dependency

Keep `next` installed in the same app. The published parser export resolves `next/dist/compiled/babel/eslint-parser`, so this config is meant for Next.js projects, not generic React apps.

## Flat Config Setup

Current Next.js templates use `eslint.config.mjs` with ESLint flat config.

### Base Next.js config

Use the root export if you want the base Next.js recommended rules without the extra Core Web Vitals layer:

```js
import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([
  ...next,
]);
```

### Recommended Next.js config

This matches the current `create-next-app` JavaScript templates:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

`eslint-config-next/core-web-vitals` is the base config plus the Next plugin's `core-web-vitals` rules.

### TypeScript projects

This matches the current `create-next-app` TypeScript templates:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

The `typescript` export layers in `typescript-eslint` recommended rules and TypeScript parsing.

## Common Workflows

### Add project-specific rules

Append your own config object after the shared config arrays:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);
```

### Run lint from the CLI

The current Next.js templates use the ESLint CLI directly:

```json
{
  "scripts": {
    "lint": "eslint"
  }
}
```

Typical commands:

```bash
# Lint the project
npx eslint .

# Apply autofixes
npx eslint . --fix

# Lint specific files
npx eslint "app/**/*.{js,jsx,ts,tsx}" "pages/**/*.{js,jsx,ts,tsx}"
```

## What the Config Includes

The published base config already wires in the main Next.js linting pieces for you:

- `@next/eslint-plugin-next`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-import`
- `eslint-plugin-jsx-a11y`
- `eslint-import-resolver-node` and `eslint-import-resolver-typescript`

The base export also applies default global ignores for:

- `.next/**`
- `out/**`
- `build/**`
- `next-env.d.ts`

## Important Pitfalls

- Use flat config and import the package into `eslint.config.*`; the published exports are config arrays meant to be spread into `defineConfig()`.
- Keep `next` installed locally. The parser export comes from the `next` package.
- If you override ignores with `globalIgnores()`, include the defaults you still want to keep.
- Do not manually add React, React Hooks, import, JSX a11y, or Next plugins just to reproduce the default setup; `eslint-config-next` already includes them.
- Only add `eslint-config-next/typescript` when the project actually uses TypeScript and has `typescript` installed.

## Version-Sensitive Notes

- This guide targets `eslint-config-next@16.1.6`.
- The published package declares `eslint >=9.0.0` and exports flat-config entry points at `eslint-config-next`, `eslint-config-next/core-web-vitals`, and `eslint-config-next/typescript`.
- Current `create-next-app` templates for Next 16 use `eslint.config.mjs`, import `eslint/config`, and run linting with the ESLint CLI.

## Official Sources

- https://nextjs.org/docs/app/api-reference/config/eslint
- https://www.npmjs.com/package/eslint-config-next
- https://registry.npmjs.org/eslint-config-next/-/eslint-config-next-16.1.6.tgz
- https://registry.npmjs.org/next/-/next-16.1.6.tgz
- https://registry.npmjs.org/create-next-app/-/create-next-app-16.1.1.tgz
