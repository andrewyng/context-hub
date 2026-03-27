---
name: eslint-config-prettier
description: "JavaScript guide for eslint-config-prettier 10.1.8, covering flat config, legacy config, conflict checks, and the rules it disables for Prettier-compatible linting."
metadata:
  languages: "javascript"
  versions: "10.1.8"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "javascript,eslint,prettier,linting,formatting,flat-config"
---

# eslint-config-prettier JavaScript Guide

## Golden Rule

Use `eslint-config-prettier` to turn off ESLint rules that conflict with Prettier, and place it last so it can override earlier configs.

This package does **not** run Prettier and it does **not** format files. Its job is only to disable conflicting lint rules.

## Install

Install the package alongside ESLint and Prettier as development dependencies:

```bash
npm install -D eslint prettier eslint-config-prettier
```

No authentication, API keys, service accounts, or runtime client initialization are required.

### Package-specific environment variable

Normal use does not require any environment variables.

If you use the package's CLI helper and need to force ESLint's config mode, set `ESLINT_USE_FLAT_CONFIG` before the command:

```bash
ESLINT_USE_FLAT_CONFIG=true npx eslint-config-prettier src/index.js
```

Use `true` when you want the helper to inspect flat config, or `false` when you want it to inspect legacy `.eslintrc` config.

## Flat Config (ESLint 9+)

For new projects, use ESLint flat config and import the package directly.

Create `eslint.config.mjs`:

```javascript
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  {
    files: ["**/*.js"],
    rules: {
      "no-unused-vars": "error",
      eqeqeq: "error",
    },
  },
  eslintConfigPrettier,
]);
```

Keep `eslintConfigPrettier` at the end of the config array. If another shared config or later config object turns formatting rules back on, Prettier conflicts can return.

## Legacy `.eslintrc` Config

If your project still uses legacy config files, add `"prettier"` to the end of `extends`.

Create `.eslintrc.json`:

```json
{
  "extends": ["eslint:recommended", "prettier"],
  "rules": {
    "no-unused-vars": "error",
    "eqeqeq": "error"
  }
}
```

In legacy config, the correct shareable-config name is `"prettier"`, not `"eslint-config-prettier"`.

## Recommended Project Scripts

Run ESLint and Prettier as separate tools:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

This is the simplest setup:

- ESLint reports code-quality issues
- Prettier owns formatting
- `eslint-config-prettier` removes overlapping formatting rules from ESLint

## Check For Conflicting Rules

The package includes a CLI helper that inspects your resolved ESLint config and reports rules that still conflict with Prettier.

Run it against a real file path from your project so ESLint loads the same overrides and config matches you use during linting:

```bash
npx eslint-config-prettier src/index.js
```

If your project is on flat config, force that mode explicitly when needed:

```bash
ESLINT_USE_FLAT_CONFIG=true npx eslint-config-prettier src/index.js
```

If your project still uses legacy config, force legacy mode explicitly when needed:

```bash
ESLINT_USE_FLAT_CONFIG=false npx eslint-config-prettier src/index.js
```

Use this helper after adding new shared configs, plugins, or hand-written rules that might reintroduce stylistic conflicts.

## Common Workflow

### 1. Add your normal ESLint rules

Keep code-quality rules such as `no-unused-vars`, `eqeqeq`, or `no-undef`.

### 2. Put `eslint-config-prettier` last

In flat config, place `eslintConfigPrettier` at the end of the exported array. In legacy config, place `"prettier"` at the end of `extends`.

### 3. Let Prettier handle formatting

Run Prettier separately:

```bash
npm run format
```

### 4. Keep ESLint focused on correctness

Run ESLint separately:

```bash
npm run lint
```

## Important Pitfalls

- `eslint-config-prettier` disables conflicting rules; it does not replace the Prettier CLI, editor integration, or the `prettier` package.
- Put the config last. If another config comes after it, that later config can re-enable formatting rules.
- Do not re-enable conflicting stylistic rules in your own config after applying `eslint-config-prettier`.
- In flat config, import the package. In legacy config, use `"prettier"` in `extends`.
- When using the CLI helper, pass a representative file path from the project instead of an arbitrary placeholder path.

## Version-Sensitive Notes

- This guide targets `eslint-config-prettier==10.1.8`.
- For new ESLint setups, prefer flat config and import `eslint-config-prettier/flat`.
- If you upgrade ESLint, shared configs, or `eslint-config-prettier`, rerun the CLI helper to check whether your resolved config still has Prettier conflicts.

## Official Sources

- Maintainer repository: https://github.com/prettier/eslint-config-prettier
- npm package page: https://www.npmjs.com/package/eslint-config-prettier
