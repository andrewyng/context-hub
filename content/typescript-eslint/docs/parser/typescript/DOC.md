---
name: parser
description: "ESLint parser for TypeScript with flat config setup, typed linting options, JSX support, and direct AST parsing APIs"
metadata:
  languages: "typescript"
  versions: "8.57.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,eslint,typescript-eslint,parser,linting"
---

# @typescript-eslint/parser

`@typescript-eslint/parser` lets ESLint parse TypeScript source files and, when you enable project-aware parsing, expose TypeScript program services to rules that need type information.

This package is only the parser. It does not include lint rules by itself. Pair it with ESLint core rules, `@typescript-eslint/eslint-plugin`, or the `typescript-eslint` meta package when you want recommended configs and TypeScript-specific rules.

## Install

Install the parser with ESLint and TypeScript:

```bash
npm install --save-dev eslint @eslint/js typescript @typescript-eslint/parser
```

If you also want the maintained TypeScript ESLint presets and plugin exports, install the meta package instead of wiring the plugin by hand:

```bash
npm install --save-dev eslint @eslint/js typescript typescript-eslint
```

There is no auth or required environment variable for normal ESLint usage.

## Minimal flat config

Use the parser directly in `eslint.config.mjs` or `eslint.config.js`:

```js
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
];
```

Set `sourceType: 'module'` explicitly for ESM code. The parser falls back to `'script'` when ESLint does not provide `sourceType`.

## Typed linting with project service

Use project-aware parsing when your rules need real TypeScript type information. The parser option types call out `projectService` as the preferred choice over `project`.

With the `typescript-eslint` meta package, a practical flat config looks like this:

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
];
```

Use `tsconfigRootDir` whenever your ESLint config is not guaranteed to run from the repository root.

## When to use `project`

Use `parserOptions.project` when you need to point the parser at specific `tsconfig.json` files, such as in a monorepo. The option accepts `true`, a single path, multiple paths, or globs.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tsParser from '@typescript-eslint/parser';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
  },
];
```

If you use wide globs, you can narrow what gets scanned:

```js
parserOptions: {
  project: ['./packages/*/tsconfig.json'],
  projectFolderIgnoreList: ['**/node_modules/**', '**/dist/**'],
  tsconfigRootDir: __dirname,
}
```

## Legacy `.eslintrc`

For legacy ESLint config, the parser is configured by package name:

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    projectService: true,
    tsconfigRootDir: __dirname,
  },
};
```

If you are not using type-aware rules, remove `projectService`.

## JSX and extra file extensions

For known TypeScript and JavaScript extensions such as `.tsx`, `.ts`, `.jsx`, and `.js`, TypeScript already understands the file type. `ecmaFeatures.jsx` matters most when ESLint parses JSX from a non-standard extension.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tsParser from '@typescript-eslint/parser';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.vue'],
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
];
```

When `extraFileExtensions` is combined with `projectService`, the parser option docs warn that full project reloads may occur.

## Programmatic parsing API

The package also exports parsing helpers for custom tooling:

```ts
import {
  parse,
  parseForESLint,
  createProgram,
  withoutProjectParserOptions,
} from '@typescript-eslint/parser';

const code = 'export const answer: number = 42;';

const ast = parse(code, {
  ecmaVersion: 'latest',
  sourceType: 'module',
});

const isolated = parseForESLint(
  code,
  withoutProjectParserOptions({
    filePath: 'src/example.ts',
    projectService: true,
    sourceType: 'module',
  }),
);

const program = createProgram('./tsconfig.json', process.cwd());

const typed = parseForESLint(code, {
  filePath: 'src/example.ts',
  programs: [program],
  sourceType: 'module',
});

console.log(ast.body.length);
console.log(isolated.scopeManager.scopes.length);
console.log(typed.services.program?.getTypeChecker());
```

`parseForESLint()` returns the AST, `scopeManager`, `visitorKeys`, and `services`. When type information is enabled, `services.program` exposes the backing `ts.Program`.

If you pass `project`, provide a matching `filePath`. The parser option types mark `filePath` as required for project-backed parsing because the file path is used to look up the file in the TypeScript compiler cache.

## Optional environment variable

If you embed the parser in custom tooling, `TSESTREE_SINGLE_RUN` can force the parser's single-run inference on or off:

```bash
TSESTREE_SINGLE_RUN=true eslint .
```

Leave it unset unless you have a reason to override the default heuristic. The parser option docs describe this as a performance control for one-shot CLI runs versus long-lived sessions.

## Common pitfalls

- The parser only parses; it does not enable rules by itself.
- Type-aware rules need `projectService`, `project`, or `programs`; otherwise `services.program` is `null`.
- Use `tsconfigRootDir` in monorepos and tool wrappers so relative `project` paths resolve predictably.
- Set `sourceType: 'module'` for ESM code instead of relying on the parser fallback.
- Use `withoutProjectParserOptions()` when parsing isolated snippets so custom tools do not accidentally pay for full project analysis.

## Useful exports

The package entry point exports these commonly used members:

- `parse`
- `parseForESLint`
- `createProgram`
- `clearCaches`
- `withoutProjectParserOptions`
- `version`
- `meta`
