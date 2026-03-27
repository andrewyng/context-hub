---
name: eslint-plugin-jsx-a11y
description: "Accessibility-focused ESLint rules for JSX, including flat config setup, legacy config setup, custom component mapping, and common rule overrides."
metadata:
  languages: "javascript"
  versions: "6.10.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,accessibility,jsx,react,linting,javascript,npm"
---

# eslint-plugin-jsx-a11y JavaScript Guide

## Golden Rule

Install `eslint-plugin-jsx-a11y` as a local development dependency and wire it into your ESLint config.

`eslint-plugin-jsx-a11y` is configuration only. It does not use API keys, accounts, runtime clients, or environment variables.

Version `6.10.2` ships both legacy shareable configs (`plugin:jsx-a11y/recommended`, `plugin:jsx-a11y/strict`) and flat config exports (`flatConfigs.recommended`, `flatConfigs.strict`).

## Install

For a flat-config project:

```bash
npm install --save-dev eslint eslint-plugin-jsx-a11y globals
```

For a legacy `.eslintrc*` setup:

```bash
npm install --save-dev eslint eslint-plugin-jsx-a11y
```

The package declares `eslint` as a peer dependency and supports ESLint `^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9`.

## Flat Config (`eslint.config.js`)

The package default export is the plugin object. For most projects, start from `flatConfigs.recommended` and add your own `files` and globals.

### Recommended setup

```js
const jsxA11y = require('eslint-plugin-jsx-a11y');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...jsxA11y.flatConfigs.recommended,
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
  },
];
```

The plugin README is explicit that the flat shareable configs do not set `files` or `languageOptions.globals` for you.

### Stricter baseline

If you want the plugin's stricter preset, swap in `flatConfigs.strict`:

```js
const jsxA11y = require('eslint-plugin-jsx-a11y');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...jsxA11y.flatConfigs.strict,
    languageOptions: {
      ...jsxA11y.flatConfigs.strict.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
  },
];
```

### Manual flat config

Use the plugin object directly when you want to choose rules yourself instead of starting from a preset.

```js
const jsxA11y = require('eslint-plugin-jsx-a11y');

module.exports = [
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
    },
  },
];
```

## Legacy Config (`.eslintrc*`)

Use the legacy preset names if your project still runs ESLint with `.eslintrc.json`, `.eslintrc.cjs`, or similar config files.

### Recommended preset

```json
{
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

### Strict preset

```json
{
  "extends": ["plugin:jsx-a11y/strict"]
}
```

### Manual legacy setup

```json
{
  "plugins": ["jsx-a11y"],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/label-has-associated-control": "error"
  }
}
```

When you extend `plugin:jsx-a11y/recommended` or `plugin:jsx-a11y/strict`, you do not need to repeat `"plugins": ["jsx-a11y"]`.

## Shared Settings

The plugin reads shared settings from `settings['jsx-a11y']`.

Use these settings when your app wraps native elements in design-system components or uses polymorphic components.

```js
const jsxA11y = require('eslint-plugin-jsx-a11y');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      'jsx-a11y': {
        components: {
          CityInput: 'input',
          CustomButton: 'button',
          LinkText: 'a',
        },
        attributes: {
          for: ['htmlFor', 'for'],
        },
        polymorphicPropName: 'as',
        polymorphicAllowList: ['Box'],
      },
    },
  },
];
```

- `components` maps custom component names to DOM element types so rules can analyze them semantically.
- `attributes` maps DOM attribute names to JSX prop names to check.
- `polymorphicPropName` tells the plugin which prop determines the rendered element type.
- `polymorphicAllowList` limits polymorphic linting to specific components.

## Common Workflows

### Lint a JSX or TSX project

```bash
npx eslint .
```

Or scope linting to source files:

```bash
npx eslint "src/**/*.{js,jsx,ts,tsx}"
```

### Enforce accessible icon buttons

Both shipped presets keep `jsx-a11y/control-has-associated-label` disabled. If your app uses icon-only buttons or custom interactive controls, turn it on explicitly.

```js
const jsxA11y = require('eslint-plugin-jsx-a11y');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      'jsx-a11y/control-has-associated-label': 'error',
    },
  },
];
```

Use a visible label or an ARIA label in the component code:

```jsx
<button type="button" aria-label="Save" className="icon-save" />
```

### Configure custom labels and inputs

`label-has-associated-control` can be taught about custom label and input components.

```json
{
  "rules": {
    "jsx-a11y/label-has-associated-control": [
      "error",
      {
        "labelComponents": ["CustomInputLabel"],
        "labelAttributes": ["label"],
        "controlComponents": ["CustomInput"],
        "depth": 3
      }
    ]
  }
}
```

This matches component patterns like:

```jsx
<CustomInputLabel label="Surname">
  <CustomInput type="text" value={value} />
</CustomInputLabel>
```

### Keep links as links and actions as buttons

`anchor-is-valid` expects anchors to navigate. For click-only actions, use a button instead of `<a onClick={...}>`.

```jsx
<button type="button" onClick={openDialog}>
  Open settings
</button>
```

For custom link wrappers that render an anchor, configure the rule to inspect the wrapper component too:

```json
{
  "rules": {
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        "components": ["Link"],
        "aspects": ["noHref", "invalidHref", "preferButton"]
      }
    ]
  }
}
```

## Important Pitfalls

- `flatConfigs.recommended` and `flatConfigs.strict` already add the plugin and JSX parser options, but they do not set `files` or globals.
- When you customize `languageOptions`, merge `jsxA11y.flatConfigs.*.languageOptions` instead of replacing it, or you can drop the preset's JSX parser settings.
- `jsx-a11y/control-has-associated-label` is disabled in both shipped presets. Enable it yourself if you want linting for icon-only buttons and similar controls.
- `jsx-a11y/label-has-for` is disabled in the shipped presets; `jsx-a11y/label-has-associated-control` is the preset-enabled label rule.
- `jsx-a11y/anchor-is-valid` treats `<a>` as navigation only. If the element performs an action, use `<button>` and style it if needed.
- Polymorphic settings can help with design-system components, but the maintainer README explicitly warns to use them with caution.
