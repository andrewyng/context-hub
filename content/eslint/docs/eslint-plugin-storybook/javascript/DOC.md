---
name: eslint-plugin-storybook
description: "ESLint rules for Storybook story files, including flat config and legacy config setup for JavaScript projects."
metadata:
  languages: "javascript"
  versions: "10.2.17"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,storybook,javascript,linting,stories,ui,npm"
---

# eslint-plugin-storybook JavaScript Guide

## Golden Rule

Use `eslint-plugin-storybook` only in ESLint configuration. It has no runtime client, no authentication, and no environment variables.

Install it alongside `eslint`, then apply the Storybook preset to your story files or enable specific `storybook/*` rules yourself.

## Install

```bash
npm install -D eslint eslint-plugin-storybook
npx eslint --version
```

If the repo is not already using ESM, prefer `eslint.config.mjs` for flat config. If `package.json` already sets `"type": "module"`, `eslint.config.js` also works.

## Flat Config (`eslint.config.mjs`)

For modern ESLint setup, spread the plugin's flat recommended config into your exported config array.

```javascript
import storybook from "eslint-plugin-storybook";

export default [
  ...storybook.configs["flat/recommended"],
];
```

The shared preset is the simplest way to lint Storybook story files with the plugin's recommended `storybook/*` rules.

### Add project-specific Storybook rules

Add a later config block when you want stricter Storybook rules for your own stories.

```javascript
import storybook from "eslint-plugin-storybook";

export default [
  ...storybook.configs["flat/recommended"],
  {
    files: [
      "**/*.stories.{js,jsx,ts,tsx}",
      "**/*.story.{js,jsx,ts,tsx}",
    ],
    rules: {
      "storybook/default-exports": "error",
      "storybook/story-exports": "error",
      "storybook/no-redundant-story-name": "warn",
    },
  },
];
```

### Register the plugin manually

Use manual registration when you do not want the shared preset.

```javascript
import storybook from "eslint-plugin-storybook";

export default [
  {
    files: [
      "**/*.stories.{js,jsx,ts,tsx}",
      "**/*.story.{js,jsx,ts,tsx}",
    ],
    plugins: {
      storybook,
    },
    rules: {
      "storybook/default-exports": "error",
      "storybook/story-exports": "error",
      "storybook/no-redundant-story-name": "warn",
    },
  },
];
```

Use manual setup when you want to opt into only a small subset of Storybook rules instead of the full recommended preset.

## Legacy Config (`.eslintrc.cjs`)

If the repo still uses legacy ESLint config, extend the plugin's recommended preset.

```javascript
module.exports = {
  extends: ["plugin:storybook/recommended"],
};
```

### Manual legacy setup

```javascript
module.exports = {
  overrides: [
    {
      files: ["**/*.stories.{js,jsx,ts,tsx}", "**/*.story.{js,jsx,ts,tsx}"],
      plugins: ["storybook"],
      rules: {
        "storybook/default-exports": "error",
        "storybook/story-exports": "error",
      },
    },
  ],
};
```

## Common Workflows

### Lint all Storybook stories

```bash
npx eslint .
```

Or target story files directly:

```bash
npx eslint "src/**/*.stories.{js,jsx,ts,tsx}" "src/**/*.story.{js,jsx,ts,tsx}"
```

Rule IDs from this package use the `storybook/` prefix.

### Restrict Storybook linting to one package in a monorepo

The flat preset can live beside other ESLint config blocks. Add a follow-up block when only one workspace contains Storybook stories.

```javascript
import storybook from "eslint-plugin-storybook";

export default [
  ...storybook.configs["flat/recommended"],
  {
    files: ["packages/ui/**/*.stories.{js,jsx,ts,tsx}"],
    rules: {
      "storybook/no-redundant-story-name": "warn",
    },
  },
];
```

## Important Pitfalls

- `storybook.configs["flat/recommended"]` is meant to be spread into the top-level config array, not inserted as a nested object.
- Use `plugin:storybook/recommended` only in legacy `.eslintrc*` files. Use `storybook.configs["flat/recommended"]` only in flat config.
- Keep Storybook rules scoped to story files unless you intentionally want them on other files.
- This plugin is aimed at Storybook story source files. Keep separate linting or validation for non-story content.
- When you add manual rules, use the `storybook/` rule prefix.

## Version-Sensitive Notes

- This guide targets `eslint-plugin-storybook@10.2.17`.
- The current package documentation publishes a flat-config preset exposed as `storybook.configs["flat/recommended"]` and a legacy preset exposed as `plugin:storybook/recommended`.

## Official Sources

- GitHub repository: https://github.com/storybookjs/eslint-plugin-storybook
- GitHub README: https://github.com/storybookjs/eslint-plugin-storybook#readme
- npm package page: https://www.npmjs.com/package/eslint-plugin-storybook
