---
name: eslint-plugin-unicorn
description: "ESLint plugin with Unicorn rules for safer, more consistent JavaScript code in flat-config projects"
metadata:
  languages: "javascript"
  versions: "63.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,unicorn,javascript,linting,node,npm"
---

# eslint-plugin-unicorn JavaScript Guide

## Golden Rule

Install `eslint-plugin-unicorn` locally and configure it through your ESLint flat config. This package is lint configuration only: it does not need API keys, authentication, accounts, or runtime environment variables.

In most projects, start from the plugin's recommended config and then turn off the rules that do not fit your codebase.

## Install

For a typical JavaScript project using ESLint flat config:

```bash
npm install -D eslint @eslint/js eslint-plugin-unicorn globals
npx eslint --version
```

If your project is not already using ESM for config files, use `eslint.config.mjs` for `import`-based examples.

## Flat Config (`eslint.config.js`)

### Start from the recommended preset

Use the plugin's recommended config, then merge in the globals for your runtime and override the rules you do not want.

```js
import js from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...unicorn.configs.recommended,
    languageOptions: {
      ...unicorn.configs.recommended.languageOptions,
      globals: {
        ...globals.builtin,
        ...globals.node,
      },
    },
    rules: {
      ...unicorn.configs.recommended.rules,
      "unicorn/no-null": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
];
```

For browser code, swap `globals.node` for `globals.browser`:

```js
globals: {
  ...globals.builtin,
  ...globals.browser,
}
```

The important distinction is that `unicorn.configs.recommended` is a shareable config object. Use the plugin object directly only when you want to choose rules yourself.

### Configure the plugin manually

Use this pattern when you want a small custom Unicorn rule set instead of the full preset:

```js
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      unicorn,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.builtin,
        ...globals.node,
      },
    },
    rules: {
      "unicorn/better-regex": "error",
      "unicorn/error-message": "error",
      "unicorn/prefer-node-protocol": "error",
    },
  },
];
```

Use `sourceType: "commonjs"` in a separate config block if part of the repo still runs as CommonJS.

## Common Workflows

### Lint the project

```bash
npx eslint .
```

Or lint only JavaScript source files:

```bash
npx eslint "src/**/*.{js,mjs,cjs}"
```

### Autofix Unicorn rules that support fixes

Many Unicorn rules are fixable. Run ESLint with `--fix` to apply those changes in place:

```bash
npx eslint . --fix
```

Add the usual scripts to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### Override opinionated rules by file pattern

Some Unicorn rules are useful for application code but noisy in test files, scripts, or migration folders. Use flat-config overrides to narrow them:

```js
import js from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,mjs,cjs}"],
    ...unicorn.configs.recommended,
    languageOptions: {
      ...unicorn.configs.recommended.languageOptions,
      globals: {
        ...globals.builtin,
        ...globals.node,
      },
    },
  },
  {
    files: ["test/**", "scripts/**"],
    rules: {
      "unicorn/no-process-exit": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
];
```

## Important Pitfalls

- Keep the plugin installed locally in the project. Plugin-based ESLint setups are not a good fit for global-only installs.
- Add the right runtime globals yourself. If you omit `globals.node` or `globals.browser`, rules can report false positives for the environment your code actually runs in.
- Treat `unicorn.configs.recommended` as a config object, not as `plugins: { unicorn }`.
- Start with a small number of overrides instead of disabling the plugin wholesale. `unicorn/prevent-abbreviations`, `unicorn/no-null`, and `unicorn/no-array-for-each` are common first candidates when adopting the recommended preset.
- If your repo mixes ESM and CommonJS, use separate `files` blocks so `sourceType` and any module-specific rules match the code they lint.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-unicorn@63.0.0`.
- Use the modern ESLint flat-config flow for new setups, with the project config in `eslint.config.js` or `eslint.config.mjs`.

## Official Sources

- GitHub repository: https://github.com/sindresorhus/eslint-plugin-unicorn
- Package README: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/readme.md
- Rule documentation: https://github.com/sindresorhus/eslint-plugin-unicorn/tree/main/docs/rules
- npm package page: https://www.npmjs.com/package/eslint-plugin-unicorn
- ESLint flat config docs: https://eslint.org/docs/latest/use/configure/configuration-files
