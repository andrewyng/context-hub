---
name: eslint
description: "ESLint for JavaScript projects, including flat config setup, CLI usage, autofix, ignore patterns, and the Node.js API."
metadata:
  languages: "javascript"
  versions: "10.0.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "eslint,javascript,linting,node,cli,npm"
---

# ESLint JavaScript Guide

## Install

ESLint is a local development dependency. It does not use API keys, accounts, or runtime environment variables.

Use a supported Node.js release from the current ESLint prerequisites page, then install the package:

```bash
npm install --save-dev eslint
npx eslint --version
```

## Initialization and Config

The main setup step is creating a flat config file. If your project is not already using ESM, use `eslint.config.mjs`. If your package already sets `"type": "module"`, `eslint.config.js` works too.

```js
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**", "coverage/**"],
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    rules: {
      eqeqeq: "error",
      "no-console": "warn",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      semi: ["error", "always"],
    },
  },
]);
```

ESLint reads `eslint.config.*` automatically when you run the CLI from the project root.

## CLI Workflows

```bash
# Lint the whole project
npx eslint .

# Lint specific files or folders
npx eslint "src/**/*.js"

# Apply autofixes in place
npx eslint . --fix

# Use an explicit config path
npx eslint . --config eslint.config.mjs
```

ESLint exits with a non-zero status when it finds errors, so the same command works in local scripts and CI.

### `package.json` scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## Node.js API

Use the `ESLint` class from the `eslint` package when you need linting inside build tools, editor integrations, or custom scripts.

```js
import { ESLint } from "eslint";

const eslint = new ESLint({ fix: true });

const results = await eslint.lintFiles(["src/**/*.js"]);
await ESLint.outputFixes(results);

const formatter = await eslint.loadFormatter("stylish");
const output = await formatter.format(results);

if (output) {
  console.log(output);
}
```

### Lint text from a string

```js
import { ESLint } from "eslint";

const eslint = new ESLint();

const results = await eslint.lintText("console.log(answer == 42)\n", {
  filePath: "src/example.js",
});

const formatter = await eslint.loadFormatter("stylish");
console.log(await formatter.format(results));
```

Pass `filePath` when you call `lintText()` if your config uses `files` globs. That lets ESLint match the snippet against the same config rules as a real file.

## Important Pitfalls

- No auth or environment variables are required; setup is local to your project.
- Keep the main config in `eslint.config.*` and run the CLI from the project root, or pass `--config` explicitly.
- Keep ignore patterns in the flat config so the CLI and the Node.js API use the same exclusions.
- If you use ESM `import`/`export` syntax in the config, use `eslint.config.mjs` unless your package already enables ESM.
- The `eslint` package only covers core JavaScript linting. JSX, TypeScript, and framework-specific linting require additional parser and plugin packages.

## Version-Sensitive Notes

- This guide targets `eslint@10.0.3`.
- Current maintainer docs describe the flat config system and the `defineConfig()` helper from `eslint/config` for JavaScript projects.
- The `ESLint` class is the main programmatic entry point for linting files and strings from Node.js.

## Official Sources

- https://eslint.org/docs/latest/
- https://eslint.org/docs/latest/use/getting-started
- https://eslint.org/docs/latest/use/getting-started#prerequisites
- https://eslint.org/docs/latest/use/configure
- https://eslint.org/docs/latest/use/command-line-interface
- https://eslint.org/docs/latest/integrate/nodejs-api
- https://www.npmjs.com/package/eslint
- https://github.com/eslint/eslint
