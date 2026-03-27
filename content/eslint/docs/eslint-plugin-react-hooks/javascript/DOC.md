---
name: eslint-plugin-react-hooks
description: "React Hooks lint rules and preset configs for ESLint flat config and legacy config"
metadata:
  languages: "javascript"
  versions: "7.0.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,react,hooks,linting,javascript,npm"
---

# eslint-plugin-react-hooks JavaScript Guide

## Golden Rule

Install `eslint-plugin-react-hooks` alongside `eslint`, then enable one of the plugin's exported presets in your ESLint config.

For ESLint 9+, prefer flat config and start with `reactHooks.configs.flat.recommended`. Use `recommended-latest` only if you want the package's newer experimental compiler checks.

This package is ESLint configuration only. It does not use API keys, environment variables, runtime initialization, or authentication.

## Install

The package declares `eslint` as a peer dependency and requires Node.js 18 or newer.

```bash
npm install -D eslint eslint-plugin-react-hooks
```

## Flat Config (`eslint.config.js`)

Use the exported flat preset for the default recommended rule set:

```js
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  reactHooks.configs.flat.recommended,
]);
```

The preset only adds the plugin and its rules. It does not add `files`, parser settings, JSX support, TypeScript parser configuration, or globals for you, so keep those in the rest of your ESLint config if your project needs them.

### Scope the preset to React source files

If you only want these rules on React components and hooks, wrap the preset in a config item with `files` and merge its rules.

```js
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: reactHooks.configs.flat.recommended.plugins,
    rules: reactHooks.configs.flat.recommended.rules,
  },
]);
```

### Try `recommended-latest`

Use this preset only if you want the plugin's newer experimental checks.

```js
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  reactHooks.configs.flat["recommended-latest"],
]);
```

## Legacy Config (`.eslintrc.cjs`)

If the project still uses legacy ESLint config, enable the legacy recommended preset:

```js
module.exports = {
  extends: ["plugin:react-hooks/recommended"],
};
```

The package README positions this legacy setup for ESLint below 9.0.0.

## Manual Rule Configuration

Use the plugin object directly if you want to choose rules yourself instead of using the preset.

```js
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
```

The maintainer docs recommend using the preset configs when possible so new recommended rules are picked up automatically in future releases.

## Common Workflows

### Lint the project

```bash
npx eslint .

# or lint only source files
npx eslint "src/**/*.{js,jsx,ts,tsx}"
```

### Apply autofixes

```bash
npx eslint . --fix
```

Some hook violations still require code changes even when you run ESLint with `--fix`.

### Configure `exhaustive-deps` for custom hooks

`react-hooks/exhaustive-deps` accepts an `additionalHooks` regex for custom hooks that expose a dependencies array.

```js
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          additionalHooks: "(useDebouncedEffect|useTrackedEffect)",
        },
      ],
    },
  },
];
```

The maintainer README recommends using `additionalHooks` sparingly and preferring custom hooks with higher-level APIs when possible.

## Important Pitfalls

- Use flat config presets in `eslint.config.js` and the legacy `plugin:react-hooks/recommended` preset only in `.eslintrc*` files.
- `eslint-plugin-react-hooks` does not configure JSX parsing, TypeScript parsing, or runtime globals. Add those separately in your ESLint setup.
- `recommended-latest` is explicitly for bleeding-edge experimental compiler rules; use `recommended` if you want the stable baseline.
- If you manually override preset rules, start from the preset's `rules` object so you do not accidentally drop newly recommended rules.
- Only use `additionalHooks` for custom hooks that really follow the same dependency-array pattern as built-in hooks.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-react-hooks@7.0.1`.
- The package declares `node >=18` in `engines`.
- The published package exports `configs.flat.recommended` and `configs.flat["recommended-latest"]` for flat config, plus a legacy `recommended` config for `.eslintrc*`.
- In `7.0.1`, `recommended-latest` adds `react-hooks/void-use-memo` on top of the `recommended` rule set.

## Official Sources

- https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
- https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/README.md
- https://react.dev/reference/eslint-plugin-react-hooks
- https://react.dev/reference/rules/rules-of-hooks
- https://www.npmjs.com/package/eslint-plugin-react-hooks
