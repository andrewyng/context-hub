---
name: eslint-config-airbnb
description: "JavaScript guide for eslint-config-airbnb 19.0.4, covering installation, legacy ESLint configuration, React Hooks setup, and common usage pitfalls."
metadata:
  languages: "javascript"
  versions: "19.0.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,airbnb,react,javascript,linting,npm"
---

# eslint-config-airbnb JavaScript Guide

## Install

`eslint-config-airbnb` is a shareable ESLint config for JavaScript and React projects. It does not use API keys, environment variables, accounts, or runtime client initialization.

The maintainer setup installs the config together with its peer dependencies.

### Install from the maintainer workflow

```bash
npx install-peerdeps --dev eslint-config-airbnb
```

### Install explicitly

```bash
npm install --save-dev eslint eslint-config-airbnb eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks
```

If you want to inspect the current peer dependency ranges for this exact version before installing, query npm metadata directly:

```bash
npm info "eslint-config-airbnb@19.0.4" peerDependencies
```

## Configure ESLint

The maintainer documentation for `eslint-config-airbnb@19.0.4` uses legacy ESLint config files such as `.eslintrc.json` or `.eslintrc.cjs`.

In `extends`, use the shareable config name `airbnb`, not `eslint-config-airbnb`.

### Minimal React project

Create `.eslintrc.json`:

```json
{
  "extends": ["airbnb"]
}
```

### React project with Hooks rules

Add the separate Hooks preset after `airbnb` when your app uses React Hooks:

```json
{
  "extends": ["airbnb", "airbnb/hooks"]
}
```

### Typical `.eslintrc.cjs`

```js
module.exports = {
  extends: ['airbnb', 'airbnb/hooks'],
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
};
```

Use `.eslintrc.json` if you only need static JSON. Use `.eslintrc.cjs` when you want comments, conditionals, or shared config fragments.

## Common Workflows

### Add lint scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### Lint the whole project

```bash
npm run lint
```

### Apply autofixes

```bash
npm run lint:fix
```

### Lint only source files

```bash
npx eslint "src/**/*.{js,jsx}"
```

## What This Config Includes

Using `extends: ["airbnb"]` enables Airbnb's shared JavaScript and React lint rules on top of ESLint.

In practice, this setup depends on these plugin families:

- import rules from `eslint-plugin-import`
- React rules from `eslint-plugin-react`
- JSX accessibility rules from `eslint-plugin-jsx-a11y`
- React Hooks rules from `eslint-plugin-react-hooks` when you also extend `airbnb/hooks`

This package is configuration only. Do not import it from your application code.

## Important Pitfalls

- Install the peer packages with the config. If the plugins are missing, ESLint cannot resolve the shared config correctly.
- In `extends`, use `"airbnb"` and optionally `"airbnb/hooks"`, not `"eslint-config-airbnb"`.
- `airbnb/hooks` is a separate preset. Adding only `"airbnb"` does not enable the Hooks ruleset.
- This package is aimed at React projects. If you want Airbnb's base JavaScript rules without React or JSX accessibility rules, use `eslint-config-airbnb-base` instead.
- This package does not set up TypeScript parsing. If your project lints `.ts` or `.tsx` files, add the TypeScript parser and TypeScript-specific config separately.

## Version-Sensitive Notes

- This guide targets `eslint-config-airbnb@19.0.4`.
- The documented maintainer setup for this version is based on legacy `.eslintrc*` configuration.
- The package is a shareable config, not a standalone linter. Keep `eslint` installed alongside it.
- The React Hooks rules are exposed through the additional `airbnb/hooks` entry point.

## Official Sources

- Maintainer repository: https://github.com/airbnb/javascript
- Package docs directory: https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb
- npm package page: https://www.npmjs.com/package/eslint-config-airbnb
