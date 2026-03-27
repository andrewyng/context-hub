---
name: html-minifier-terser
description: "TypeScript guidance for `html-minifier-terser`, including installation of `@types/html-minifier-terser`, the typed `minify()` API, and practical HTML minification workflows."
metadata:
  languages: "typescript"
  versions: "7.0.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,html-minifier-terser,html,minify,build,types,definitelytyped"
---

# html-minifier-terser TypeScript Guide

## Golden Rule

Install `html-minifier-terser` for the runtime and `@types/html-minifier-terser` for compile-time types.

`@types/html-minifier-terser` only provides TypeScript declarations. Your application imports and executes `html-minifier-terser`; the declaration package adds the `minify()` signature and the `Options` interface.

## Install

For programmatic TypeScript use, install the runtime package first and then the declarations.

```bash
npm install html-minifier-terser
npm install -D typescript @types/html-minifier-terser @types/node
```

If your project already has TypeScript and Node types, add only the missing declaration package:

```bash
npm install -D @types/html-minifier-terser
```

If you also want the command-line tool globally, the runtime README documents:

```bash
npm install -g html-minifier-terser
```

`html-minifier-terser` does not require credentials, API keys, package-specific environment variables, or client initialization.

## Initialization

The practical setup is your import style and the options object you pass to `minify()`.

### Import the runtime package

The declaration package exposes a small surface: `minify(value: string, options?: Options): Promise<string>` and the `Options` interface.

This namespace import is a practical TypeScript default for the CommonJS runtime package:

```typescript
import * as htmlMinifierTerser from "html-minifier-terser";
```

Import from `html-minifier-terser`, never from `@types/html-minifier-terser`.

### `tsconfig.json`

No package-specific compiler setting is required. A normal TypeScript project setup is enough because the declaration package publishes its module entrypoint through the package `types` field.

If you use Node APIs such as `fs/promises` in your build scripts, keep `@types/node` installed for those imports.

## Common Workflows

### Minify an HTML string with typed options

Use the exported `Options` interface to make your build settings explicit and catch misspelled option names at compile time.

```typescript
import * as htmlMinifierTerser from "html-minifier-terser";

const options: htmlMinifierTerser.Options = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
};

export async function minifyMarkup(input: string): Promise<string> {
  return htmlMinifierTerser.minify(input, options);
}
```

The upstream README notes that almost all options are disabled by default, so set the behaviors you actually want instead of assuming an aggressive preset.

### Minify HTML files in a build step

This package is commonly used at the output boundary of a static-site or server-rendered build. The environment variables here are optional application settings, not package requirements.

```typescript
import { readFile, writeFile } from "node:fs/promises";
import * as htmlMinifierTerser from "html-minifier-terser";

const inputPath = process.env.HTML_INPUT_PATH ?? "./dist/index.html";
const outputPath = process.env.HTML_OUTPUT_PATH ?? inputPath;

const options: htmlMinifierTerser.Options = {
  collapseWhitespace: true,
  removeComments: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
};

export async function minifyHtmlFile(): Promise<void> {
  const html = await readFile(inputPath, "utf8");
  const minified = await htmlMinifierTerser.minify(html, options);

  await writeFile(outputPath, minified, "utf8");
}
```

### Preserve template fragments and custom script blocks

The declarations include regex-based escape hatches for templating systems and nonstandard script blocks. Use them when your HTML contains server-side or client-side template syntax that should survive minification.

```typescript
import * as htmlMinifierTerser from "html-minifier-terser";

const options: htmlMinifierTerser.Options = {
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
  ignoreCustomFragments: [
    /<%[\s\S]*?%>/,
    /\{\{[\s\S]*?\}\}/,
  ],
  processScripts: ["text/x-handlebars-template", "text/ng-template"],
};

const template = `
  <div class="card">
    {{ title }}
  </div>
  <script type="text/x-handlebars-template">
    <span>{{ value }}</span>
  </script>
`;

const result = await htmlMinifierTerser.minify(template, options);
console.log(result);
```

The type comments document `ignoreCustomFragments` for fragments such as `<% ... %>` and `<? ... ?>`, and `processScripts` for script types such as `text/ng-template`.

### Run the CLI with the same minification choices

The CLI comes from the `html-minifier-terser` runtime package, not from the `@types` package. The runtime README's sample command line is:

```bash
html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true
```

Use the typed `Options` object in application code and the CLI flags in scripts when you need the same behavior in both places.

## Important Pitfalls

- Install `html-minifier-terser` separately; `@types/html-minifier-terser` does not ship executable JavaScript.
- Import from `html-minifier-terser`, not from `@types/html-minifier-terser`.
- Almost all minifier options are disabled by default.
- `collapseInlineTagWhitespace`, `conservativeCollapse`, and `preserveLineBreaks` are documented as options that must be used together with `collapseWhitespace: true`.
- `removeTagWhitespace` is explicitly documented as producing invalid HTML.
- Use `ignoreCustomFragments`, `customAttrAssign`, `customAttrSurround`, and `processScripts` when your markup includes template syntax or custom script content.
- The CLI binary is installed by `html-minifier-terser`; the declaration package has no effect on command-line behavior.

## Version Note

This guide targets the `@types/html-minifier-terser` `7.0.2` package entry on npm.

The public type surface you use in real projects is small: an async `minify()` function plus the `Options` interface that describes the runtime minifier configuration.

## Official Sources

- https://www.npmjs.com/package/@types/html-minifier-terser
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/html-minifier-terser
- https://www.npmjs.com/package/html-minifier-terser
- https://github.com/terser/html-minifier-terser#readme
- https://terser.org/html-minifier-terser/
