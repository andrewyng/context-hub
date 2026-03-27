---
name: eslint-plugin-react
description: "React-specific ESLint rules with flat config and legacy config setup for JavaScript projects"
metadata:
  languages: "javascript"
  versions: "7.37.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,react,linting,javascript,npm"
---

# eslint-plugin-react JavaScript Guide

## Golden Rule

Install `eslint` and `eslint-plugin-react` locally, then configure the plugin in your ESLint config file.

For modern ESLint setups, prefer `eslint.config.js` and the plugin's flat config exports at `require("eslint-plugin-react").configs.flat`. Set `settings.react.version` to `"detect"` unless you need to pin a specific React version.

`eslint-plugin-react` is configuration only. It does not need API keys, environment variables, runtime initialization, or authentication.

## Install

For a flat config with browser globals:

```bash
npm install -D eslint eslint-plugin-react globals
```

For a legacy `.eslintrc*` setup:

```bash
npm install -D eslint eslint-plugin-react
```

The package README notes that a global ESLint install is possible, but plugins and shareable configs should still be installed locally.

## Flat Config (`eslint.config.js`)

`eslint-plugin-react@7.37.5` exports three flat configs:

- `reactPlugin.configs.flat.recommended`
- `reactPlugin.configs.flat.all`
- `reactPlugin.configs.flat['jsx-runtime']`

The flat configs enable JSX in `languageOptions.parserOptions`, but they do not set `files` or `languageOptions.globals` for you.

### Recommended React setup

Use this for a typical browser React app. Add the `jsx-runtime` config if you use the React 17+ automatic JSX transform.

```js
const reactPlugin = require('eslint-plugin-react');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ...reactPlugin.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ...reactPlugin.configs.flat['jsx-runtime'],
  },
];
```

`reactPlugin.configs.flat['jsx-runtime']` disables `react/react-in-jsx-scope` and `react/jsx-uses-react`.

### Configure the plugin manually

Use the plugin object directly when you want to choose rules yourself instead of starting from a shareable config.

```js
const react = require('eslint-plugin-react');

module.exports = [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-uses-vars': 'error',
    },
  },
];
```

### Override recommended rules

If you want the recommended baseline but need a few changes, spread the recommended rules and override the entries you want.

```js
const reactPlugin = require('eslint-plugin-react');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ...reactPlugin.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ...reactPlugin.configs.flat['jsx-runtime'],
  },
];
```

## Legacy Config (`.eslintrc*`)

If your project still uses the legacy ESLint config system, extend the plugin presets from `.eslintrc.json`, `.eslintrc.cjs`, or the equivalent legacy config file.

### Recommended preset

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime"
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

If you are not using the React 17+ automatic JSX transform, remove `plugin:react/jsx-runtime`.

### Manual legacy setup

If you do not want to use a preset, add the plugin, enable JSX parsing, and list the rules you want explicitly.

```json
{
  "plugins": ["react"],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error"
  }
}
```

## Shared Settings

The plugin reads shared settings from `settings`. The most important one is `settings.react.version`.

```js
settings: {
  react: {
    version: 'detect',
    pragma: 'React',
    fragment: 'Fragment',
  },
}
```

Set `defaultVersion` only when version detection cannot resolve the installed React package in your project.

Useful additional shared settings documented by the plugin include:

- `propWrapperFunctions`
- `componentWrapperFunctions`
- `formComponents`
- `linkComponents`

Use these when your codebase wraps components or uses custom link and form components that React rules should recognize.

## Common Workflows

### Lint your project

```bash
npx eslint .
```

Or limit linting to React source files:

```bash
npx eslint "src/**/*.{js,jsx}"
```

### Use the React 17+ automatic JSX runtime

If your project does not import `React` in every JSX file, add the `jsx-runtime` config:

- Legacy config: `plugin:react/jsx-runtime`
- Flat config: `reactPlugin.configs.flat['jsx-runtime']`

That config turns off the two rules that expect `React` to be in scope for JSX.

### Enable every React rule

The plugin also ships an `all` config:

- Legacy config: `plugin:react/all`
- Flat config: `reactPlugin.configs.flat.all`

Use it only when you intentionally want every non-deprecated rule enabled.

## Important Pitfalls

- `reactPlugin.configs.flat.recommended` and `reactPlugin.configs.flat['jsx-runtime']` are shareable config objects, not plugin objects. Use `plugins: { react: require('eslint-plugin-react') }` when you want to define rules manually.
- The flat configs do not set `files` or browser globals. Add both yourself in `eslint.config.js`.
- If `settings.react.version` cannot detect your installed React version, set `defaultVersion` or an explicit version string.
- The recommended config enables `react/prop-types`. If your components do not use PropTypes, disable that rule explicitly.
- Installing ESLint globally is not the recommended setup for plugin-based projects; keep the plugin installed locally in the project.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-react@7.37.5`.
- Package `7.37.5` declares a peer dependency on ESLint `^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7`.
- The package README documents flat config usage for ESLint `8.21.0+`, notes that the CLI starts looking up `eslint.config.js` from ESLint `8.23.0+`, and notes that ESLint `9` uses the new config system.
- In `7.37.5`, the plugin root export includes legacy presets in `configs` and flat presets in `configs.flat`.

## Official Sources

- GitHub repository: https://github.com/jsx-eslint/eslint-plugin-react
- npm package page: https://www.npmjs.com/package/eslint-plugin-react
- Package README: https://github.com/jsx-eslint/eslint-plugin-react/blob/master/README.md
- ESLint flat config docs: https://eslint.org/docs/latest/use/configure/configuration-files
- ESLint language options docs: https://eslint.org/docs/latest/use/configure/language-options
