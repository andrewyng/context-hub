---
name: eslint-plugin-vitest
description: "ESLint plugin for Vitest test files with a recommended preset and Vitest-specific rule IDs."
metadata:
  languages: "javascript"
  versions: "0.5.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,vitest,testing,javascript,linting,npm"
---

# eslint-plugin-vitest JavaScript Guide

## Golden Rule

Apply `eslint-plugin-vitest` only to files that actually run under Vitest. Start from `plugin:vitest/recommended`, then add or override individual `vitest/*` rules for your test suite.

This package is lint configuration only. It does not use API keys, accounts, runtime environment variables, or client initialization.

## Install

Install the plugin alongside ESLint, and install `vitest` if your project does not already have it:

```bash
npm install -D eslint eslint-plugin-vitest vitest
```

If your tests are TypeScript or JSX/TSX, keep your existing parser setup as well. This plugin adds Vitest-specific rules, but it does not replace `@typescript-eslint/parser` or other syntax-related ESLint configuration.

## Legacy ESLint Config (`.eslintrc.cjs`)

For `eslint-plugin-vitest@0.5.4`, the maintainer examples use the classic ESLint config format. The safest setup is an override scoped to test files.

### Recommended preset

```javascript
module.exports = {
  overrides: [
    {
      files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
      extends: ["plugin:vitest/recommended"],
      env: {
        "vitest-globals/env": true,
      },
    },
  ],
};
```

Use the Vitest globals environment when your tests rely on global APIs such as `describe`, `it`, `test`, `expect`, and `vi`.

### Manual rule selection

If you do not want the full preset, register the plugin and choose the rules explicitly:

```javascript
module.exports = {
  overrides: [
    {
      files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
      plugins: ["vitest"],
      env: {
        "vitest-globals/env": true,
      },
      rules: {
        "vitest/expect-expect": "error",
        "vitest/no-disabled-tests": "warn",
        "vitest/no-focused-tests": "error",
      },
    },
  ],
};
```

Rule IDs from this package always use the `vitest/` prefix.

## Test File Style

If your test files import Vitest APIs directly, ESLint already sees those bindings from the import. In that case, the globals environment is usually only needed for files that rely on global test functions.

```javascript
import { describe, expect, it } from "vitest";

describe("sum", () => {
  it("adds two numbers", () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Common Workflows

### Lint the whole project

```bash
npx eslint .
```

### Lint only Vitest files

```bash
npx eslint "src/**/*.{test,spec}.{js,jsx,ts,tsx}"
```

### Add package scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:tests": "eslint \"src/**/*.{test,spec}.{js,jsx,ts,tsx}\""
  }
}
```

### Override a few recommended rules

Keep the recommended preset as the baseline and then add per-project rule changes inside the same override.

```javascript
module.exports = {
  overrides: [
    {
      files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
      extends: ["plugin:vitest/recommended"],
      env: {
        "vitest-globals/env": true,
      },
      rules: {
        "vitest/no-disabled-tests": "error",
        "vitest/no-focused-tests": "error",
      },
    },
  ],
};
```

## Important Pitfalls

- Scope the config to test files. Applying the Vitest environment to application code can accidentally allow test globals outside your test suite.
- Keep `"vitest-globals/env": true` only when your tests use global Vitest APIs. If your project imports everything from `vitest`, you may not need the globals environment in every override.
- This plugin adds test-specific lint rules, not parsing support. For TypeScript, JSX, or TSX test files, keep the parser and parser options required by the rest of your ESLint setup.
- Use `plugin:vitest/recommended` or explicit `vitest/*` rules with the package you actually installed. Do not mix this package with docs for other Vitest ESLint packages unless you intentionally migrate.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-vitest@0.5.4`.
- The documented preset name is `plugin:vitest/recommended`.
- Rule names from this package use the `vitest/` namespace, such as `vitest/expect-expect` and `vitest/no-focused-tests`.
- The package is designed for ESLint configuration, so the main integration surface is your ESLint config file plus the standard `eslint` CLI.

## Official Sources

- https://github.com/veritem/eslint-plugin-vitest
- https://github.com/veritem/eslint-plugin-vitest#readme
- https://www.npmjs.com/package/eslint-plugin-vitest
