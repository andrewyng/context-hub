---
name: eslint-plugin-prettier
description: "Run Prettier as an ESLint rule, with flat config and legacy config setup for JavaScript projects."
metadata:
  languages: "javascript"
  versions: "5.5.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,prettier,javascript,linting,formatting,npm"
---

# eslint-plugin-prettier JavaScript Guide

## Install

`eslint-plugin-prettier` runs Prettier inside ESLint. Install it together with `eslint`, `prettier`, and `eslint-config-prettier`.

```bash
npm install --save-dev eslint prettier eslint-plugin-prettier eslint-config-prettier
```

This package does not use API keys, accounts, or runtime environment variables.

## Flat config setup

For ESLint flat config, import `eslint-plugin-prettier/recommended` and place it last in the exported config array so Prettier-related conflict disabling happens after your other config entries.

```js
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    rules: {
      "no-unused-vars": "error",
    },
  },
  eslintPluginPrettierRecommended,
];
```

The recommended preset:

- enables the `prettier/prettier` rule
- enables `eslint-config-prettier`
- disables `arrow-body-style` and `prefer-arrow-callback`

Run ESLint normally after adding the config:

```bash
npx eslint .
npx eslint . --fix
```

## Legacy `.eslintrc` setup

If your project still uses legacy ESLint config files, extend `plugin:prettier/recommended` and keep it last in `extends`.

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ]
}
```

This legacy preset turns on the same `prettier/prettier` rule and pulls in `eslint-config-prettier` for you.

## Prettier configuration

Keep formatting options in a normal Prettier config so ESLint, Prettier CLI, and editor integrations all use the same settings.

`.prettierrc.json`:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all"
}
```

Then lint or autofix with ESLint:

```bash
npx eslint src --fix
```

## Configure the rule directly

If you do not want the full recommended preset, register the plugin and enable the rule yourself:

```js
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
];
```

When you configure the rule manually, also disable ESLint rules that conflict with Prettier. The simplest way is to use the recommended preset instead. If you need manual composition, add `eslint-config-prettier` at the end of your ESLint config.

## Common workflows

### Show formatting differences as lint errors

```bash
npx eslint .
```

Files that do not match Prettier formatting fail with the `prettier/prettier` rule.

### Apply formatting fixes with ESLint

```bash
npx eslint . --fix
```

Because `prettier/prettier` is fixable, ESLint writes the Prettier-formatted result back to disk.

### Add package scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## Important pitfalls

- Put `eslint-plugin-prettier/recommended` last in flat config arrays and `plugin:prettier/recommended` last in legacy `extends`.
- Install `prettier` itself. The plugin reports Prettier output through ESLint, but it does not replace the Prettier package.
- Prefer a `.prettierrc` file for formatting options. Editor extensions read Prettier config files, but rule-only options in ESLint config are easier to drift from editor behavior.
- If you are not using the recommended preset, disable conflicting formatting rules with `eslint-config-prettier` yourself.
- `arrow-body-style` and `prefer-arrow-callback` can interact badly with this plugin during autofix, which is why the recommended config disables them.

## Minimal commands

```bash
# install
npm install --save-dev eslint prettier eslint-plugin-prettier eslint-config-prettier

# lint
npx eslint .

# lint and apply Prettier fixes through ESLint
npx eslint . --fix
```
