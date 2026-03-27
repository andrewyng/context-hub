---
name: eslint-plugin-import
description: "ESLint plugin for validating import/export syntax, module resolution, dependency declarations, and import ordering"
metadata:
  languages: "javascript"
  versions: "2.32.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,imports,linting,javascript,typescript"
---

# eslint-plugin-import

`eslint-plugin-import` adds import/export-specific lint rules to ESLint. It does not have a runtime client, environment variables, or initialization step beyond your ESLint config.

All rules are off by default. In most projects, start from the plugin's `recommended` preset and then add a small number of explicit rules.

## Install

For a JavaScript project using ESLint flat config:

```bash
npm install --save-dev eslint eslint-plugin-import @eslint/js
```

If you lint TypeScript imports, also install the packages called out in the maintainer README:

```bash
npm install --save-dev @typescript-eslint/parser eslint-import-resolver-typescript
```

## Flat config (`eslint.config.js`)

Use this with modern ESLint setups:

```js
import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'off',
      'import/no-dynamic-require': 'warn',
      'import/no-nodejs-modules': 'warn',
    },
  },
];
```

The package also exports other flat presets, including `importPlugin.flatConfigs.errors`, `importPlugin.flatConfigs.warnings`, and `importPlugin.flatConfigs.typescript`.

## Legacy config (`.eslintrc`)

Use this if your repo still relies on `.eslintrc`:

```jsonc
{
  "extends": [
    "eslint:recommended",
    "plugin:import/recommended"
  ]
}
```

If you prefer to enable rules manually instead of extending a preset:

```jsonc
{
  "rules": {
    "import/no-unresolved": ["error", { "commonjs": true, "amd": true }],
    "import/named": "error",
    "import/namespace": "error",
    "import/default": "error",
    "import/export": "error"
  }
}
```

## TypeScript

For legacy config, the maintainer README recommends extending both the base preset and the TypeScript preset, then enabling the TypeScript resolver:

```jsonc
{
  "extends": [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "settings": {
    "import/resolver": {
      "typescript": true,
      "node": true
    }
  }
}
```

For flat config with `typescript-eslint`'s `config()` helper, include the plugin's flat TypeScript preset inside `extends`:

```js
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';

export default tseslint.config(
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
  }
);
```

The shipped TypeScript preset adds TypeScript-related extensions, maps `@typescript-eslint/parser` for TypeScript files, and disables `import/named` because TypeScript already checks named imports during compilation.

## Common workflows

### Enforce import ordering and autofix it

`import/order` is fixable with ESLint's `--fix` flag:

```js
export default [
  {
    rules: {
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
    },
  },
];
```

```bash
npx eslint . --fix
```

### Check `require()` and AMD imports too

`import/no-unresolved` only checks ES module imports by default. If you still use CommonJS or AMD, opt in explicitly:

```jsonc
{
  "rules": {
    "import/no-unresolved": ["error", {
      "commonjs": true,
      "amd": true
    }]
  }
}
```

Useful options from the rule docs:

- `ignore`: suppress known non-code imports that your resolver will not handle
- `caseSensitive: false`: disable path-case checks on case-insensitive filesystems
- `caseSensitiveStrict: true`: also check case in `cwd` and absolute paths

### Prevent undeclared dependencies

`import/no-extraneous-dependencies` checks the closest parent `package.json` by default. In monorepos or nested packages, set `packageDir` so the rule reads the right manifest:

```js
const config = {
  rules: {
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: ['**/*.test.js', '**/*.spec.js'],
      packageDir: ['./packages/app', './packages/config', './'],
    }],
  },
};

export default [config];
```

You can also enable `includeInternal` to check local imports and `includeTypes` to check TypeScript type-only imports.

## Resolver pitfalls

`import/no-unresolved` follows standard Node resolution unless you configure a resolver. If your project relies on TypeScript path aliases, webpack aliases, or another non-Node resolution strategy, add an appropriate `settings['import/resolver']` entry or expect false positives.

The upstream docs call out three important cases:

- Node resolution is the default behavior
- webpack resolution is supported through `eslint-import-resolver-webpack`
- TypeScript projects commonly need `eslint-import-resolver-typescript`

If you are using a module bundler other than Node or webpack, `import/no-unresolved` can still produce false positives.

## Minimal commands

```bash
# lint
npx eslint .

# lint and autofix fixable rules such as import/order
npx eslint . --fix
```

## What to enable first

If you want a small, low-noise setup, start with:

- `plugin:import/recommended` or `importPlugin.flatConfigs.recommended`
- `import/order` for consistent import blocks
- `import/no-extraneous-dependencies` for package boundary mistakes
- TypeScript resolver settings if your repo uses TypeScript or path aliases
