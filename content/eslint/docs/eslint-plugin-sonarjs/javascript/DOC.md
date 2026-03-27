---
name: eslint-plugin-sonarjs
description: "ESLint plugin for SonarJS rules, including flat config setup, legacy config, targeted rule overrides, and common lint workflows."
metadata:
  languages: "javascript"
  versions: "4.0.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,sonarjs,linting,javascript,node,npm"
---

# eslint-plugin-sonarjs

`eslint-plugin-sonarjs` adds SonarJS rules to ESLint for maintainability and bug-prone code patterns. It has no runtime client, no authentication step, and no environment variables. Install it as a local development dependency and enable it in your ESLint config.

## Install

Install ESLint, the core flat-config package, and the plugin in `devDependencies`:

```bash
npm install --save-dev eslint @eslint/js eslint-plugin-sonarjs
npx eslint --version
```

No environment variables or API keys are required.

## Flat config (`eslint.config.mjs`)

If your project is not already using ESM, prefer `eslint.config.mjs` for `import` syntax. Enable the plugin's recommended config alongside ESLint's core recommended rules:

```js
import js from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...sonarjs.configs.recommended,
  },
];
```

If you want the recommended baseline but need a local override, merge the exported rules and change only the rules you need:

```js
import js from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...sonarjs.configs.recommended,
    rules: {
      ...sonarjs.configs.recommended.rules,
      "sonarjs/no-nested-conditional": "warn",
    },
  },
];
```

## Legacy config (`.eslintrc.json`)

If your repo still uses legacy ESLint config files, extend the legacy preset:

```json
{
  "extends": ["plugin:sonarjs/recommended-legacy"]
}
```

Or register the plugin and enable only the rules you want:

```json
{
  "plugins": ["sonarjs"],
  "rules": {
    "sonarjs/no-nested-conditional": "warn"
  }
}
```

## Common Workflows

### Lint the project

```bash
npx eslint .
```

Or lint only JavaScript sources:

```bash
npx eslint "src/**/*.{js,mjs,cjs}"
```

### Add package scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

`--fix` is still useful for the rest of your ESLint stack, but SonarJS rules are primarily diagnostic checks rather than large-scale code rewriters.

### Scope SonarJS rules to application code

If test fixtures, generated files, or scripts are noisier than the main source tree, keep the recommended preset on application code and add targeted overrides for the rest:

```js
import js from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,mjs,cjs}"],
    ...sonarjs.configs.recommended,
  },
  {
    files: ["test/**", "fixtures/**", "scripts/**"],
    rules: {
      "sonarjs/no-nested-conditional": "off",
    },
  },
];
```

### Start with a manual rule subset

If you do not want the whole recommended preset, register the plugin directly and enable only the rules you are ready to enforce:

```js
import js from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      sonarjs,
    },
    rules: {
      "sonarjs/no-nested-conditional": "warn",
    },
  },
];
```

## Important Pitfalls

- No tokens, environment variables, or runtime initialization are required; all setup happens in ESLint config.
- Keep `eslint`, `@eslint/js`, and `eslint-plugin-sonarjs` installed locally in the project so ESLint resolves the plugin consistently.
- For modern ESLint, use the exported flat config from `sonarjs.configs.recommended`. If your repo still uses `.eslintrc*`, use the legacy preset string instead.
- Prefer targeted rule overrides for tests, fixtures, and generated files instead of removing SonarJS checks from the entire project.
- SonarJS runs as lint-time analysis only. It does not replace your test suite, type checks, or framework-specific validation.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-sonarjs@4.0.2`.
- For new projects, prefer flat config in `eslint.config.js` or `eslint.config.mjs`.
- Keep the legacy preset only for repositories that still rely on `.eslintrc*` files.

## Official Sources

- GitHub repository: https://github.com/SonarSource/eslint-plugin-sonarjs
- Package README: https://github.com/SonarSource/eslint-plugin-sonarjs#readme
- npm package page: https://www.npmjs.com/package/eslint-plugin-sonarjs
- ESLint flat config docs: https://eslint.org/docs/latest/use/configure/configuration-files
