---
name: eslint-plugin-promise
description: "Promise-focused ESLint rules for JavaScript projects, including flat config and legacy config setup."
metadata:
  languages: "javascript"
  versions: "7.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,javascript,linting,promises,async,npm"
---

# eslint-plugin-promise JavaScript Guide

## Golden Rule

Use `eslint-plugin-promise` only in ESLint configuration. It has no runtime client, no authentication, and no environment variables.

Install it alongside `eslint`, then either start from the recommended preset or enable the `promise/*` rules you want explicitly.

## Install

```bash
npm install -D eslint eslint-plugin-promise
npx eslint --version
```

If your repo is not already using ESM, prefer `eslint.config.mjs` for flat config. If `package.json` already sets `"type": "module"`, `eslint.config.js` also works.

## Flat Config (`eslint.config.mjs`)

For modern ESLint setup, use the plugin's flat-config recommended preset.

```javascript
import promise from "eslint-plugin-promise";

const promiseRecommended = promise.configs["flat/recommended"];

export default [
  {
    ...promiseRecommended,
    files: ["**/*.{js,mjs,cjs}"],
  },
];
```

That preset enables the plugin and applies its recommended `promise/*` rules.

### Add project-specific rules on top of the preset

Merge the preset rules before adding overrides so you keep the recommended baseline.

```javascript
import promise from "eslint-plugin-promise";

const promiseRecommended = promise.configs["flat/recommended"];

export default [
  {
    ...promiseRecommended,
    files: ["src/**/*.{js,mjs,cjs}"],
    rules: {
      ...promiseRecommended.rules,
      "promise/no-nesting": "warn",
      "promise/prefer-await-to-then": "warn",
      "promise/prefer-await-to-callbacks": "warn",
    },
  },
];
```

### Configure the plugin manually

If you do not want the shared preset, register the plugin yourself and pick the rules you need.

```javascript
import promise from "eslint-plugin-promise";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      promise,
    },
    rules: {
      "promise/always-return": "error",
      "promise/catch-or-return": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/no-nesting": "warn",
    },
  },
];
```

## Legacy Config (`.eslintrc.cjs`)

If the repo still uses the legacy ESLint config system, extend the package's recommended preset.

```javascript
module.exports = {
  extends: ["plugin:promise/recommended"],
};
```

### Manual legacy setup

```javascript
module.exports = {
  plugins: ["promise"],
  rules: {
    "promise/always-return": "error",
    "promise/catch-or-return": "error",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
  },
};
```

## Common Workflows

### Lint the project

```bash
npx eslint .

# or lint a specific folder
npx eslint "src/**/*.js"
```

Rule IDs from this plugin use the `promise/` prefix.

### Enforce cleaner Promise chains

Use the recommended preset, then turn on a few stricter rules for projects that still rely heavily on `.then()` chains.

```javascript
import promise from "eslint-plugin-promise";

const promiseRecommended = promise.configs["flat/recommended"];

export default [
  {
    ...promiseRecommended,
    files: ["**/*.{js,mjs,cjs}"],
    rules: {
      ...promiseRecommended.rules,
      "promise/always-return": "error",
      "promise/no-return-wrap": "error",
      "promise/no-nesting": "warn",
    },
  },
];
```

### Prefer `async`/`await` in application code

If your team wants to discourage `.then()` chains and callback-based Promise code, enable the opt-in preference rules.

```javascript
import promise from "eslint-plugin-promise";

export default [
  {
    files: ["src/**/*.{js,mjs,cjs}"],
    plugins: {
      promise,
    },
    rules: {
      "promise/prefer-await-to-then": "warn",
      "promise/prefer-await-to-callbacks": "warn",
    },
  },
];
```

### Scope the plugin in a monorepo

Apply Promise rules only to the packages or folders where you want them.

```javascript
import promise from "eslint-plugin-promise";

const promiseRecommended = promise.configs["flat/recommended"];

export default [
  {
    ...promiseRecommended,
    files: ["packages/web/**/*.{js,mjs,cjs}"],
  },
  {
    ...promiseRecommended,
    files: ["packages/api/**/*.{js,mjs,cjs}"],
    rules: {
      ...promiseRecommended.rules,
      "promise/no-nesting": "warn",
    },
  },
];
```

## Important Pitfalls

- `eslint-plugin-promise` is config-only. There is no runtime initialization step and no environment variable to set.
- Use `promise.configs["flat/recommended"]` only in flat config. Use `plugin:promise/recommended` only in legacy `.eslintrc*` config.
- If you override `rules` on top of the recommended preset, merge `...promiseRecommended.rules` first or you will replace the preset rules entirely.
- The `prefer-await-*` rules are a style choice, not a universal default. They can be noisy in codebases that intentionally use Promise chains.
- Add `files` globs yourself when using the flat preset so the plugin only applies where you want it.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-promise@7.2.1`.
- The package publishes a flat-config recommended export for `eslint.config.*` and a legacy `plugin:promise/recommended` preset for `.eslintrc*` config.
- Rule names from this package use the `promise/` prefix.

## Official Sources

- GitHub repository: https://github.com/eslint-community/eslint-plugin-promise
- GitHub README: https://github.com/eslint-community/eslint-plugin-promise#readme
- npm package page: https://www.npmjs.com/package/eslint-plugin-promise
- ESLint flat config docs: https://eslint.org/docs/latest/use/configure/configuration-files
