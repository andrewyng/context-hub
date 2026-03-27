---
name: eslint-plugin-security
description: "ESLint security-focused rules for JavaScript projects, including flat config setup, legacy config, targeted rule overrides, and common lint workflows."
metadata:
  languages: "javascript"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,security,linting,javascript,node,npm"
---

# eslint-plugin-security

`eslint-plugin-security` adds security-oriented lint rules to ESLint. It has no runtime client, API keys, or environment variables. Install it as a local development dependency and enable it through your ESLint config.

## Install

`eslint-plugin-security` runs inside ESLint, so keep both packages in `devDependencies`:

```bash
npm install --save-dev eslint eslint-plugin-security @eslint/js
npx eslint --version
```

No authentication or environment variables are required.

## Flat config (`eslint.config.js`)

For modern ESLint setups, import the plugin and spread its recommended flat config into a file-matched block:

```js
import js from "@eslint/js";
import security from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...security.configs.recommended,
  },
];
```

If you need to tune the preset, merge the exported rules and override specific ones:

```js
import js from "@eslint/js";
import security from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...security.configs.recommended,
    rules: {
      ...security.configs.recommended.rules,
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "warn",
    },
  },
];
```

## Legacy config (`.eslintrc.json`)

If your repo still uses legacy config files, extend the legacy preset:

```json
{
  "extends": ["plugin:security/recommended-legacy"]
}
```

Or enable the plugin and choose rules manually:

```json
{
  "plugins": ["security"],
  "rules": {
    "security/detect-eval-with-expression": "error",
    "security/detect-non-literal-require": "warn",
    "security/detect-object-injection": "warn"
  }
}
```

## Common Workflows

### Lint the project

```bash
npx eslint .
```

Or focus on JavaScript files:

```bash
npx eslint "src/**/*.{js,mjs,cjs}"
```

### Add project scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

`eslint-plugin-security` mostly reports suspicious code patterns instead of rewriting them, so `--fix` is useful for your broader ESLint setup but usually does not resolve these findings on its own.

### Relax noisy rules by folder

Security rules are often useful in application code but noisy in test fixtures, migration scripts, or generated code. Use overrides instead of removing the whole preset:

```js
import js from "@eslint/js";
import security from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,mjs,cjs}"],
    ...security.configs.recommended,
  },
  {
    files: ["test/**", "scripts/**", "fixtures/**"],
    rules: {
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-non-literal-require": "off",
    },
  },
];
```

### Start with a small manual rule set

If the full preset is too noisy for an existing codebase, enable a few rules first and expand later:

```js
import js from "@eslint/js";
import security from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      security,
    },
    rules: {
      "security/detect-eval-with-expression": "error",
      "security/detect-child-process": "warn",
      "security/detect-non-literal-fs-filename": "warn",
    },
  },
];
```

## Important Pitfalls

- No environment variables, tokens, or runtime initialization are required; all setup happens in ESLint config.
- Keep the plugin installed locally in the project. ESLint plugin resolution is most reliable when `eslint` and `eslint-plugin-security` are both local `devDependencies`.
- The recommended preset is a config object. In flat config, use `security.configs.recommended`; in legacy config, extend `plugin:security/recommended-legacy`.
- Many rules are heuristic checks for suspicious patterns. Review findings before treating them as confirmed vulnerabilities, and use targeted overrides for folders where dynamic access patterns are expected.
- This plugin adds security-focused lint checks; it does not replace dependency scanning, code review, or framework-specific security guidance.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-security@4.0.0`.
- Version `4.0.0` documents both a flat-config preset exposed from the package export and a legacy preset string for `.eslintrc` users.
- For new projects, prefer ESLint flat config in `eslint.config.js` or `eslint.config.mjs`.

## Official Sources

- GitHub repository: https://github.com/eslint-community/eslint-plugin-security
- Package README: https://github.com/eslint-community/eslint-plugin-security/blob/main/README.md
- npm package page: https://www.npmjs.com/package/eslint-plugin-security
- ESLint flat config docs: https://eslint.org/docs/latest/use/configure/configuration-files
