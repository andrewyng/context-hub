---
name: eslint-config-standard
description: "StandardJS shareable ESLint config for JavaScript projects, including installation, legacy `.eslintrc` setup, rule overrides, and common lint workflows."
metadata:
  languages: "javascript"
  versions: "17.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,standard,javascript,linting,npm"
---

# eslint-config-standard JavaScript Guide

## Install

`eslint-config-standard` is a shareable ESLint config. It does not use API keys, accounts, authentication, runtime imports, or environment variables.

Install ESLint, the config, and the peer plugins together:

```bash
npm install --save-dev eslint eslint-config-standard eslint-plugin-import eslint-plugin-n eslint-plugin-promise
npx eslint --version
```

This config layers rules from `eslint-plugin-import`, `eslint-plugin-n`, and `eslint-plugin-promise`.

## Configure ESLint

The maintainer setup for `eslint-config-standard@17.1.0` is the legacy ESLint config system. Extend `standard` from `.eslintrc.json`, `.eslintrc.cjs`, or another `.eslintrc*` file.

### Minimal `.eslintrc.json`

```json
{
  "extends": ["standard"]
}
```

### Typical Node.js project setup

```json
{
  "extends": ["standard"],
  "env": {
    "es2021": true,
    "node": true
  }
}
```

### Override a few rules

Use normal ESLint overrides on top of the shared config when your project needs exceptions.

```js
module.exports = {
  extends: ["standard"],
  env: {
    es2021: true,
    node: true,
  },
  rules: {
    "no-console": "off",
    "n/no-process-exit": "off",
  },
}
```

## Common Workflows

### Add project scripts

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

### Lint a specific folder

```bash
npx eslint "src/**/*.js"
```

## What This Config Covers

Using `extends: ["standard"]` enables StandardJS-oriented defaults across:

- ESLint core rules
- `import/*` rules from `eslint-plugin-import`
- `n/*` rules from `eslint-plugin-n`
- `promise/*` rules from `eslint-plugin-promise`

When you need more control, keep `standard` as the base and then override only the individual rules your project wants to change.

## Important Pitfalls

- Install the peer packages with the config. If `eslint-plugin-import`, `eslint-plugin-n`, or `eslint-plugin-promise` is missing, ESLint cannot fully resolve the shared config.
- In `extends`, use `"standard"`, not `"eslint-config-standard"`.
- This package configures ESLint only. Do not import it from application code.
- Rule IDs you override may come from ESLint core or from the bundled plugins, so use the full rule name when needed, such as `n/no-process-exit` or `promise/always-return`.
- The maintainer usage for `17.1.0` is centered on legacy `.eslintrc*` config files.

## Version-Sensitive Notes

- This guide targets `eslint-config-standard@17.1.0`.
- The package is a shareable config, not a standalone linter. Keep `eslint` installed alongside it.
- The package's documented setup uses `extends: ["standard"]` in `.eslintrc*` files and expects the peer plugins above to be available.

## Official Sources

- Maintainer repository: https://github.com/standard/eslint-config-standard
- GitHub README: https://github.com/standard/eslint-config-standard#readme
- npm package page: https://www.npmjs.com/package/eslint-config-standard
