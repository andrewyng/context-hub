---
name: eslint-plugin
description: "TypeScript-specific ESLint rules and preset configs for flat config and legacy ESLint setups, including typed linting"
metadata:
  languages: "typescript"
  versions: "8.57.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,eslint,typescript-eslint,linting,plugin"
---

# @typescript-eslint/eslint-plugin

`@typescript-eslint/eslint-plugin` adds TypeScript-specific rules and shareable configs for ESLint.

Install it with `@typescript-eslint/parser`. There is no runtime client, no API key, no environment variable, and no authentication step. All setup happens in your ESLint config.

## Install

For a TypeScript project using ESLint flat config:

```bash
npm install --save-dev eslint @eslint/js typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Keep `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` on matching versions.

## Flat config (`eslint.config.mjs`)

The package exports flat presets under `configs['flat/...']`.

### Recommended preset

Use this for a TypeScript-first repo that wants the maintained baseline rules.

```js
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
];
```

`flat/recommended` already registers the TypeScript parser and the `@typescript-eslint` plugin for you.

### Typed linting

Use a `*-type-checked` preset when you want rules that need real TypeScript type information, such as `@typescript-eslint/no-floating-promises`.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,
  ...tseslint.configs['flat/recommended-type-checked'],
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
];
```

The preset alone is not enough for typed rules. Add `parserOptions.projectService: true` or `parserOptions.project` so the parser can build TypeScript program services.

### Manual rule setup

Use the plugin object directly when you want a small custom rule set instead of a preset.

```js
import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
];
```

When you enable a TypeScript extension rule such as `@typescript-eslint/no-unused-vars` or `@typescript-eslint/no-shadow`, turn off the overlapping core rule first.

## Legacy config (`.eslintrc.cjs`)

Use the legacy `plugin:@typescript-eslint/...` presets only in `.eslintrc*` files.

### Recommended preset

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
};
```

### Typed linting in legacy config

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
  ],
  parserOptions: {
    projectService: true,
    tsconfigRootDir: __dirname,
  },
};
```

The package also exports the legacy config name `recommended-requiring-type-checking`.

## Preset families

Use these preset groups depending on how opinionated and type-aware you want linting to be:

- `recommended`, `strict`, `stylistic`, and `all`
- `recommended-type-checked`, `strict-type-checked`, and `stylistic-type-checked`
- `recommended-type-checked-only`, `strict-type-checked-only`, and `stylistic-type-checked-only`
- `disable-type-checked` when you need to turn type-aware rules back off for a file set

Flat config uses `configs['flat/...']`. Legacy config uses `plugin:@typescript-eslint/...`.

## Common workflows

### Enable typed linting only for TypeScript files

If a repo contains both JavaScript and TypeScript, enable typed presets for TypeScript and disable them for JavaScript overrides.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,
  ...tseslint.configs['flat/recommended-type-checked'],
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    ...tseslint.configs['flat/disable-type-checked'],
    files: ['**/*.{js,mjs,cjs}'],
  },
];
```

### Use `project` for monorepos

Use `project` when you need to point linting at specific `tsconfig.json` files.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from '@typescript-eslint/eslint-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  ...tseslint.configs['flat/recommended-type-checked'],
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
];
```

### Run ESLint

Lint the whole repo:

```bash
npx eslint .
```

Or lint only TypeScript source files:

```bash
npx eslint "src/**/*.{ts,tsx,mts,cts}"
```

## Important pitfalls

- Install `@typescript-eslint/parser` alongside the plugin. The plugin package does not parse TypeScript by itself.
- Use `configs['flat/...']` only in flat config and `plugin:@typescript-eslint/...` only in legacy config.
- Typed presets need `projectService` or `project`; otherwise type-aware rules cannot get TypeScript program information.
- Turn off overlapping core rules such as `no-unused-vars`, `no-shadow`, `dot-notation`, or `require-await` when you replace them with `@typescript-eslint/*` extension rules.
- `disable-type-checked` is useful when a typed preset is enabled broadly but some file groups should lint without type information.

## Version-sensitive notes

- This guide targets `@typescript-eslint/eslint-plugin@8.57.0`.
- The package exports classic presets in `configs` and flat-config presets in `configs['flat/...']`.
- The package exports the legacy alias `recommended-requiring-type-checking` alongside `recommended-type-checked`.

## Official sources

- https://typescript-eslint.io/packages/eslint-plugin/
- https://typescript-eslint.io/getting-started
- https://typescript-eslint.io/users/configs
- https://typescript-eslint.io/getting-started/typed-linting
- https://www.npmjs.com/package/@typescript-eslint/eslint-plugin
