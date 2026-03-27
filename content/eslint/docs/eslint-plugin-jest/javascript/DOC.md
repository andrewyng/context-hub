---
name: eslint-plugin-jest
description: "ESLint plugin for Jest that adds shared configs and rules for common test-file patterns, assertion usage, deprecated APIs, and Jest-specific globals."
metadata:
  languages: "javascript"
  versions: "29.15.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,jest,linting,javascript,testing"
---

# eslint-plugin-jest JavaScript Guide

## Install

Install the plugin as a development dependency alongside ESLint and Jest:

```bash
npm install -D eslint eslint-plugin-jest jest
```

This package does not use API keys, accounts, runtime clients, or environment variables.

## Flat Config (`eslint.config.cjs`)

Scope the plugin to test files only. The maintainer docs recommend applying Jest rules with `files` globs instead of at the top level.

```javascript
const jest = require("eslint-plugin-jest");

module.exports = [
  {
    files: [
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],
    ...jest.configs["flat/recommended"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
      "jest/prefer-expect-assertions": "off",
    },
  },
];
```

Use `jest.configs["flat/style"]` if you also want stylistic Jest rules such as `prefer-to-be-null`.

## Legacy Config (`.eslintrc.cjs`)

If the project still uses legacy ESLint config, add the preset inside an override so application code is not treated as Jest test code.

```javascript
module.exports = {
  overrides: [
    {
      files: [
        "**/__tests__/**/*.{js,jsx,ts,tsx}",
        "**/*.{test,spec}.{js,jsx,ts,tsx}",
      ],
      extends: ["plugin:jest/recommended"],
      rules: {
        "jest/prefer-expect-assertions": "off",
      },
    },
  ],
};
```

For a stylistic preset, use `plugin:jest/style` instead.

## Build a Custom Rule Set

If you do not want a shared preset, register the plugin directly and add the Jest globals yourself.

```javascript
const pluginJest = require("eslint-plugin-jest");

module.exports = [
  {
    files: ["**/*.{test,spec}.js"],
    plugins: {
      jest: pluginJest,
    },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
];
```

If you use one of the shared Jest presets, you do not need to add the globals separately.

## Common Workflows

### Run ESLint on tests

```bash
npx eslint .

# or lint only test files
npx eslint "test/**/*.test.js"

# autofix rules that support it
npx eslint . --fix
```

Rule IDs from this plugin use the `jest/` prefix.

### Pin the Jest version in a monorepo

Some rules, including `jest/no-deprecated-functions`, change behavior based on the Jest version. By default the plugin resolves Jest from the nearest `node_modules`, caches that result, and reuses it.

If different packages in the repo use different Jest versions, set `settings.jest.version` in the config that applies to that package.

```javascript
module.exports = {
  overrides: [
    {
      files: ["packages/web/**/*.test.js"],
      extends: ["plugin:jest/recommended"],
      settings: {
        jest: {
          version: require("jest/package.json").version,
        },
      },
    },
  ],
};
```

If you prefer a fixed value, use `version: 29` instead.

### Support aliased Jest globals

If your test suite aliases globals such as `describe` to `context`, add the aliases so rules still detect those calls correctly.

```javascript
module.exports = {
  settings: {
    jest: {
      globalAliases: {
        describe: ["context"],
        fdescribe: ["fcontext"],
        xdescribe: ["xcontext"],
      },
    },
  },
};
```

## Important Pitfalls

- Apply this plugin only to test-related files. The maintainer docs explicitly warn against enabling Jest rules for every file in the project.
- If you build a custom flat config instead of using `plugin:jest/*` or `jest.configs["flat/*"]`, add Jest globals yourself with `pluginJest.environments.globals.globals`.
- `plugin:jest/all` and `jest.configs["flat/all"]` enable every rule and may change in any release, so they are a poor fit for long-term stable lint baselines.
- The `globalPackage` setting can point the plugin at another source of test globals such as `bun:test`, but the maintainer docs do not guarantee Jest rule semantics outside Jest itself.
- If different subfolders resolve different Jest versions, set `settings.jest.version` explicitly in nested configs to avoid stale version detection.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-jest@29.15.0`.
- The maintainer README documents both legacy shared configs such as `plugin:jest/recommended` and flat-config exports such as `jest.configs["flat/recommended"]`.
- Some rules are version-aware and use the configured or auto-detected Jest version when linting.

## Official Sources

- https://github.com/jest-community/eslint-plugin-jest
- https://github.com/jest-community/eslint-plugin-jest/blob/main/README.md
- https://www.npmjs.com/package/eslint-plugin-jest
