---
name: eslint-plugin-tailwindcss
description: "ESLint plugin for linting Tailwind CSS class usage, ordering, and conflicting utilities in JavaScript projects"
metadata:
  languages: "javascript"
  versions: "3.18.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,tailwindcss,linting,javascript,css,npm"
---

# eslint-plugin-tailwindcss JavaScript Guide

## Golden Rule

Install `eslint-plugin-tailwindcss` alongside `eslint` and your project's `tailwindcss` package, then wire it into your ESLint config. This package is lint configuration only: it does not use API keys, accounts, authentication, environment variables, or runtime client initialization.

For most projects, start from the plugin's recommended preset and then add shared `settings.tailwindcss` values for any custom class-building helpers or a non-default Tailwind config path.

## Install

For a modern flat-config setup:

```bash
npm install -D eslint @eslint/js tailwindcss eslint-plugin-tailwindcss
```

For a legacy `.eslintrc*` setup:

```bash
npm install -D eslint tailwindcss eslint-plugin-tailwindcss
```

## Flat Config (`eslint.config.js`)

`eslint-plugin-tailwindcss@3.18.2` exposes a flat recommended preset at `tailwind.configs['flat/recommended']`.

Use that first, then add project-specific settings and rule overrides:

```js
import js from '@eslint/js';
import tailwind from 'eslint-plugin-tailwindcss';

export default [
  js.configs.recommended,
  ...tailwind.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: {
      tailwindcss: {
        callees: ['clsx', 'cn'],
        config: 'tailwind.config.js',
      },
    },
    rules: {
      'tailwindcss/no-custom-classname': 'off',
    },
  },
];
```

Use `settings.tailwindcss.callees` when your codebase builds class lists through helpers such as `clsx`, `classnames`, or a local `cn()` wrapper.

If your Tailwind config is not in the project root, point the plugin at the real file:

```js
export default [
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: 'packages/web/tailwind.config.js',
      },
    },
  },
];
```

## Legacy Config (`.eslintrc.json`)

Use the legacy preset name when your repo still relies on `.eslintrc` files:

```json
{
  "extends": ["plugin:tailwindcss/recommended"],
  "settings": {
    "tailwindcss": {
      "callees": ["clsx", "cn"],
      "config": "tailwind.config.js"
    }
  }
}
```

If you extend `plugin:tailwindcss/recommended`, you do not need to repeat the plugin in a separate `plugins` array unless you are composing a fully manual config.

## Manual Rule Setup

Use a manual setup when you only want a small rule set instead of the full recommended preset:

```js
import tailwind from 'eslint-plugin-tailwindcss';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      tailwindcss: tailwind,
    },
    settings: {
      tailwindcss: {
        callees: ['clsx', 'cn'],
        config: 'tailwind.config.js',
      },
    },
    rules: {
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/no-custom-classname': 'off',
    },
  },
];
```

This keeps the two most common Tailwind-specific checks enabled:

- `tailwindcss/classnames-order` for canonical class ordering
- `tailwindcss/no-contradicting-classname` for conflicting utility combinations

## Common Workflows

### Lint the project

```bash
npx eslint .
```

Or scope linting to frontend source files:

```bash
npx eslint "src/**/*.{js,jsx,ts,tsx}"
```

### Apply autofixes for class ordering

```bash
npx eslint . --fix
```

Use this after enabling `tailwindcss/classnames-order` directly or via the recommended preset.

### Lint class helpers such as `clsx()` or `cn()`

If Tailwind class strings live inside helper calls, add those helper names under `settings.tailwindcss.callees`.

```js
settings: {
  tailwindcss: {
    callees: ['clsx', 'cn', 'classnames'],
  },
}
```

Without that setting, the plugin may miss class lists constructed through your wrapper functions.

### Mix Tailwind with custom CSS intentionally

If your app uses authored CSS class names alongside Tailwind utilities, `tailwindcss/no-custom-classname` may be too strict.

Disable it explicitly when that matches your codebase:

```js
rules: {
  'tailwindcss/no-custom-classname': 'off',
}
```

## Important Pitfalls

- `tailwind.configs['flat/recommended']` is a flat-config array. Spread it into `export default [...]` instead of nesting it as a single object.
- Install `tailwindcss` locally in the same project. The plugin needs your Tailwind package and configuration to lint accurately.
- Set `settings.tailwindcss.config` when the Tailwind config file is not at the project root.
- Add every class helper function you use to `settings.tailwindcss.callees`, or the plugin can miss class strings built outside raw `className="..."` attributes.
- Keep `tailwindcss/no-custom-classname` only if your project wants to reject non-Tailwind class names; otherwise disable it or replace it with a narrower custom policy.
