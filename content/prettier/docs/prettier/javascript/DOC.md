---
name: prettier
description: "Prettier 3 guide for JavaScript projects, including CLI usage, config files, ignore rules, and the async Node API."
metadata:
  languages: "javascript"
  versions: "3.8.3"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "javascript,prettier,formatting,code-style,cli"
---

# Prettier JavaScript Guide

## Golden Rule

Install `prettier` as a development dependency and use either:

- the CLI for project-wide formatting and CI checks
- the async `prettier` Node API for generators, codemods, and custom tooling

Prettier does not require authentication, API keys, service accounts, or package-specific environment variables.

```bash
npm install -D prettier
```

## Recommended Project Setup

### Add package scripts

```json
{
  "scripts": {
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

- `prettier . --write` rewrites matching files in place.
- `prettier . --check` is the safer CI command because it exits non-zero when formatting is needed.

### Add a Prettier config file

Create `.prettierrc.json` in your project root:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

Common options:

- `semi`: print semicolons at the end of statements (default `true`).
- `singleQuote`: use `'` instead of `"` for strings (default `false`).
- `tabWidth`: number of spaces per indent level (default `2`).
- `trailingComma`: `"all"`, `"es5"`, or `"none"` (default `"all"`).
- `printWidth`: line length the printer will wrap at (default `80`).

Prettier resolves config from the file path you format. It can also read `.editorconfig` unless you disable that behavior with `--no-editorconfig` in the CLI or `editorconfig: false` in the API.

### Ignore generated output and vendored files

Create `.prettierignore` in the project root:

```gitignore
dist
coverage
node_modules
*.min.js
```

## Common CLI Workflows

### Format the whole project

```bash
npx prettier . --write
```

`--write` edits matching files in place; use it for local formatting commands and pre-commit hooks.

### Check formatting in CI

```bash
npx prettier . --check
```

`--check` does not modify files. It logs files that are not formatted and exits non-zero, which is what you want in CI.

### List only files that need formatting

```bash
npx prettier . --list-different
```

### Format a single file

```bash
npx prettier src/index.js --write
```

### Format piped input and still infer the parser from a filename

```bash
cat src/index.js | npx prettier --stdin-filepath src/index.js
```

`--stdin-filepath` is the important flag when your code comes from stdin, because it lets Prettier infer the correct parser and apply the matching config.

### Find the config file Prettier will use

```bash
npx prettier --find-config-path src/index.js
```

## Use Prettier From Node.js

Prettier's Node API is async in Prettier 3. Use `await` with `format`, `check`, `resolveConfig`, `resolveConfigFile`, `getFileInfo`, and `getSupportInfo`.

### Format a file using the project's config

```javascript
const { readFile, writeFile } = require("node:fs/promises");
const prettier = require("prettier");

async function formatFile(filePath) {
  const input = await readFile(filePath, "utf8");
  const options = (await prettier.resolveConfig(filePath)) ?? {};

  const output = await prettier.format(input, {
    ...options,
    filepath: filePath,
  });

  if (output !== input) {
    await writeFile(filePath, output, "utf8");
  }
}
```

Passing `filepath` is the safest default for real files because Prettier uses it to infer the parser and discover the right config.

### Format generated JavaScript before writing it to disk

```javascript
const prettier = require("prettier");

async function formatGeneratedModule(source) {
  return prettier.format(source, {
    parser: "babel",
    singleQuote: true,
    trailingComma: "all",
  });
}
```

Use an explicit `parser` when you are formatting a snippet that does not already have a meaningful file path.

### Check whether source is already formatted

```javascript
const prettier = require("prettier");

async function isFormatted(source, filePath) {
  const options = (await prettier.resolveConfig(filePath)) ?? {};

  return prettier.check(source, {
    ...options,
    filepath: filePath,
  });
}
```

### Skip ignored or unsupported files in custom tooling

```javascript
const { readFile } = require("node:fs/promises");
const prettier = require("prettier");

async function formatIfSupported(filePath) {
  const info = await prettier.getFileInfo(filePath);

  if (info.ignored || !info.inferredParser) {
    return null;
  }

  const input = await readFile(filePath, "utf8");
  const options = (await prettier.resolveConfig(filePath)) ?? {};

  return prettier.format(input, {
    ...options,
    filepath: filePath,
  });
}
```

## Practical Notes

- Prettier already supports JavaScript, TypeScript, JSX, JSON, CSS, HTML, Markdown, YAML, GraphQL, and other common file types out of the box.
- For languages outside the built-in set, install the appropriate Prettier plugin and load it through the CLI `--plugin` flag or the API `plugins` option.
- The CLI ignores `node_modules` by default. Use `--with-node-modules` only when you explicitly want to format files there.
- If you are writing an editor or long-running tool that watches config files, call `await prettier.clearConfigCache()` after config changes.

### Using Prettier with ESLint

Install `eslint-config-prettier` and add it to your ESLint config to turn off ESLint rules that conflict with Prettier formatting:

```bash
npm install -D eslint-config-prettier
```

Run ESLint for code-quality rules and Prettier for formatting; let `eslint-config-prettier` disable the overlapping ESLint stylistic rules so the two tools do not fight each other.

### Format on save in your editor

Install the Prettier extension for your editor (for example "Prettier - Code formatter" in VS Code), set Prettier as the default formatter, and enable format-on-save. The editor will then run Prettier with the project's `.prettierrc` config every time you save a file.

## Important Pitfalls

- Do not treat the Node API as synchronous in Prettier 3; the core methods shown here return promises.
- Prefer `filepath` for files on disk instead of hard-coding `parser`, so Prettier can infer the parser and locate config automatically.
- Use `--check` or `--list-different` in CI, not `--write`.
- `--write` edits files in place. Keep it for local formatting commands and pre-commit hooks.
- If stdin formatting gives the wrong parser, add `--stdin-filepath`.

## Version Notes

- This guide targets `prettier` `3.8.3`.
- The API examples here follow the async Prettier 3 API shape documented for the current 3.x line.

## Official Sources

- https://www.npmjs.com/package/prettier
- https://prettier.io/docs/en/
- https://prettier.io/docs/en/install.html
- https://prettier.io/docs/en/options.html
- https://prettier.io/docs/en/cli.html
- https://prettier.io/docs/en/configuration.html
- https://prettier.io/docs/en/api.html
- https://prettier.io/docs/en/ignore.html
- https://prettier.io/docs/en/plugins.html
