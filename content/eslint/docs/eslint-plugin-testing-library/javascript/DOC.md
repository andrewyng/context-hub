---
name: eslint-plugin-testing-library
description: "ESLint plugin for Testing Library that enforces recommended query, async, and DOM-testing patterns across DOM, React, Angular, Vue, Svelte, and Marko tests."
metadata:
  languages: "javascript"
  versions: "7.16.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,testing-library,linting,javascript,testing,react,dom"
---

# eslint-plugin-testing-library JavaScript Guide

## Golden Rule

Apply `eslint-plugin-testing-library` only to test files and choose the preset that matches the Testing Library package you actually use.

For ESLint 9 flat config, use `testingLibrary.configs["flat/<framework>"]`. For legacy `.eslintrc*` config, use `plugin:testing-library/<framework>`.

## Install

Install the plugin alongside ESLint and the Testing Library package your tests use:

```bash
npm install -D eslint eslint-plugin-testing-library @testing-library/react
```

For DOM-only tests, install `@testing-library/dom` instead:

```bash
npm install -D eslint eslint-plugin-testing-library @testing-library/dom
```

This plugin does not require environment variables, credentials, or runtime client initialization.

## Flat Config (`eslint.config.js`)

Use the `flat/*` preset that matches your framework. Scope it to test files so application code is not linted as Testing Library code.

### React Testing Library

```javascript
import testingLibrary from "eslint-plugin-testing-library";

export default [
  {
    files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    ...testingLibrary.configs["flat/react"],
  },
];
```

### DOM Testing Library

```javascript
import testingLibrary from "eslint-plugin-testing-library";

export default [
  {
    files: ["**/*.{test,spec}.{js,ts}"],
    ...testingLibrary.configs["flat/dom"],
  },
];
```

Framework-specific flat presets are published for `dom`, `react`, `angular`, `vue`, `svelte`, and `marko`.

## Legacy Config (`.eslintrc.cjs`)

If the repo still uses legacy ESLint config, use the `plugin:testing-library/<framework>` preset inside an override for tests.

```javascript
module.exports = {
  overrides: [
    {
      files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
      extends: ["plugin:testing-library/react"],
    },
  ],
};
```

## Common Workflows

### Run ESLint against tests

```bash
npx eslint .

# or target a specific test file
npx eslint src/components/LoginForm.test.jsx
```

Rule IDs from this plugin use the `testing-library/` prefix.

### Add project-specific rules on top of the shared preset

Use the shared preset as the base, then merge in rule overrides.

```javascript
import testingLibrary from "eslint-plugin-testing-library";

const reactTestingLibrary = testingLibrary.configs["flat/react"];

export default [
  {
    files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    ...reactTestingLibrary,
    rules: {
      ...reactTestingLibrary.rules,
      "testing-library/no-debugging-utils": "warn",
      "testing-library/prefer-screen-queries": "error",
      "testing-library/await-async-queries": "error",
    },
  },
];
```

### Lint tests that use a local `test-utils` module

If your project re-exports `render` and helpers from a local module, configure Testing Library shared settings so the plugin still recognizes those utilities.

```javascript
import testingLibrary from "eslint-plugin-testing-library";

export default [
  {
    files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    ...testingLibrary.configs["flat/react"],
    settings: {
      "testing-library/utils-module": "test-utils",
      "testing-library/custom-renders": ["renderWithProviders"],
    },
  },
];
```

That setup is useful for test helpers like this:

```javascript
// test-utils.js
import { render, screen } from "@testing-library/react";

export { render, screen };

export function renderWithProviders(ui, options) {
  return render(ui, options);
}
```

### Use different presets in a monorepo

If different packages use different Testing Library integrations, configure each test tree separately.

```javascript
import testingLibrary from "eslint-plugin-testing-library";

export default [
  {
    files: ["packages/web/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    ...testingLibrary.configs["flat/react"],
  },
  {
    files: ["packages/dom-tests/**/*.{test,spec}.{js,ts}"],
    ...testingLibrary.configs["flat/dom"],
  },
];
```

## Important Pitfalls

- Do not apply the plugin globally to all source files. Restrict it to tests and test utility modules.
- Match the preset to the Testing Library package in use. A React repo should usually use `react`, not plain `dom`.
- Use `flat/*` presets only in `eslint.config.js` flat config. Use `plugin:testing-library/*` only in legacy `.eslintrc*` files.
- If you re-export Testing Library helpers from a local module, configure `settings["testing-library/utils-module"]` and any custom render names, or the plugin may miss those helpers.
- Async Testing Library APIs should generally be awaited, while sync queries and sync events should not be awaited. The plugin includes rules for both sides of that mistake.
- If you tune rules manually, keep the shared preset rules and merge your overrides on top instead of replacing the whole `rules` object.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-testing-library@7.16.0`.
- The package publishes both flat-config presets (`flat/react`, `flat/dom`, and the other framework variants) and legacy shareable configs (`plugin:testing-library/react`, `plugin:testing-library/dom`, and the other framework variants).
- Framework presets are available for `dom`, `react`, `angular`, `vue`, `svelte`, and `marko`.

## Official Sources

- GitHub repository: https://github.com/testing-library/eslint-plugin-testing-library
- GitHub README: https://github.com/testing-library/eslint-plugin-testing-library#readme
- npm package page: https://www.npmjs.com/package/eslint-plugin-testing-library
