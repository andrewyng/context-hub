---
name: eslint-plugin-unused-imports
description: "ESLint plugin that removes unused imports and reports unused variables through ESLint rules"
metadata:
  languages: "javascript"
  versions: "4.4.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,linting,imports,javascript,typescript"
---

# eslint-plugin-unused-imports

`eslint-plugin-unused-imports` adds two ESLint rules:

- `unused-imports/no-unused-imports` removes unused imports when you run ESLint with `--fix`
- `unused-imports/no-unused-vars` reports unused variables and arguments without re-flagging imports

This package has no runtime client, no environment variables, and no authentication step. The only setup is in your ESLint config.

## Install

For a JavaScript project using ESLint flat config:

```bash
npm install --save-dev eslint @eslint/js eslint-plugin-unused-imports
```

For TypeScript, install the TypeScript ESLint parser and plugin too:

```bash
npm install --save-dev eslint @eslint/js typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-unused-imports
```

## Flat config (`eslint.config.js`)

### JavaScript

Disable ESLint's built-in `no-unused-vars` rule and replace it with the plugin rules.

```js
import js from '@eslint/js';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];
```

### TypeScript

If you already use `@typescript-eslint/no-unused-vars`, turn it off before enabling the `unused-imports` replacement rule.

```js
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];
```

## Legacy config (`.eslintrc.cjs`)

If your project still uses legacy ESLint config files, register the plugin in `plugins` and enable the rules manually.

### JavaScript

```js
module.exports = {
  extends: ['eslint:recommended'],
  plugins: ['unused-imports'],
  rules: {
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
```

### TypeScript

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'unused-imports'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
```

## Common workflows

### Remove unused imports automatically

Run ESLint with `--fix` to delete unused import lines and unused import specifiers.

```bash
npx eslint . --fix
```

To limit fixes to source files only:

```bash
npx eslint "src/**/*.{js,jsx,ts,tsx}" --fix
```

### Keep underscore-prefixed variables or parameters

The common `varsIgnorePattern` and `argsIgnorePattern` settings let you intentionally keep placeholders such as `_event` or `_unused`.

```js
'unused-imports/no-unused-vars': [
  'warn',
  {
    vars: 'all',
    varsIgnorePattern: '^_',
    args: 'after-used',
    argsIgnorePattern: '^_',
  },
],
```

### Fail CI on leftover warnings

If your CI should fail when unused variables remain after linting, run ESLint without `--fix` and promote warnings to a failing exit code.

```bash
npx eslint . --max-warnings 0
```

## Practical notes

### Turn off the original `no-unused-vars` rule

Do not run `unused-imports/no-unused-vars` alongside the core `no-unused-vars` rule or `@typescript-eslint/no-unused-vars`. Leave the original rule disabled or you will get duplicate reports.

### Use both rules together

`unused-imports/no-unused-imports` handles imports. `unused-imports/no-unused-vars` handles local variables and function parameters. In most projects you want both rules enabled.

### Keep side-effect imports as bare imports

If a module is imported only for side effects, write it as a bare import:

```js
import './polyfills';
```

That keeps the import intentional and avoids introducing an unused binding.

## Version notes

This guide targets `eslint-plugin-unused-imports` `4.4.1`. If your project is pinned to an older ESLint major, check the maintainer README before upgrading the plugin because older plugin majors are published for older ESLint and TypeScript ESLint combinations.
