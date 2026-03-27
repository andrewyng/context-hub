---
name: clean-css
description: "TypeScript declarations for the CommonJS `clean-css` CSS minifier. Install the runtime package too, import from `clean-css`, and use the typed constructor and `minify()` results for CSS strings, file inputs, and source-map workflows."
metadata:
  languages: "typescript"
  versions: "4.2.11"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,clean-css,css,minification,types,definitelytyped,npm"
---

# clean-css TypeScript Guide

## Golden Rule

Install `clean-css` and `@types/clean-css`, but import and execute the runtime package from `"clean-css"`.

`@types/clean-css` only provides TypeScript declarations. The runtime entry point is CommonJS (`module.exports = require('./lib/clean')`), so the safest TypeScript import form is `import CleanCSS = require("clean-css");`.

## Install

Install the runtime package first, then the declaration package:

```bash
npm install clean-css
npm install -D typescript @types/clean-css
```

No package-specific environment variables, credentials, or authentication steps are required.

If your project already uses Node.js globals or built-in modules elsewhere, keep your usual `@types/node` setup. You do not need to add `clean-css` to `compilerOptions.types`.

## Initialization

A minimal strict `tsconfig.json` for Node-based build scripts works well:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "skipLibCheck": false
  }
}
```

This keeps the `import = require()` form working without turning on `esModuleInterop`.

### Create a typed minifier

```typescript
import CleanCSS = require("clean-css");

const minifier = new CleanCSS({
  level: 1,
});

const output = minifier.minify(`
  a {
    color: blue;
  }
  div {
    margin: 5px;
  }
`);

console.log(output.styles);
console.log(output.errors);
console.log(output.warnings);
console.log(output.stats.originalSize);
console.log(output.stats.minifiedSize);
```

The main typed integration boundary is the constructor options object and the `minify()` result, which exposes `styles`, `errors`, `warnings`, `inlinedStylesheets`, and `stats`.

## Common Workflows

### Format CSS instead of fully minifying it

The README documents `format: "beautify"` and `format: "keep-breaks"`. Use `level: 0` when you want formatting, import inlining, or URL rebasing without optimization passes.

```typescript
import CleanCSS = require("clean-css");

const source = `
  .card {
    padding: 16px;
    color: rgb(0, 0, 255);
  }
`;

const output = new CleanCSS({
  format: "beautify",
  level: 0,
}).minify(source);

console.log(output.styles);
```

### Use fine-grained optimization settings

The `level` option can be `0`, `1`, `2`, or a nested configuration object.

```typescript
import CleanCSS = require("clean-css");

const output = new CleanCSS({
  level: {
    1: {
      specialComments: 0,
      tidySelectors: true,
    },
    2: {
      mergeAdjacentRules: true,
      removeDuplicateFontRules: true,
    },
  },
}).minify(`
  .button {
    margin: 0px 0px 0px 0px;
  }
  .button {
    color: #0000ff;
  }
`);

console.log(output.styles);
```

Use this shape when you want type-checked control over a few optimizations instead of relying on the default presets.

### Minify a CSS file by path

`minify()` can read files directly when you pass an array of file paths.

```typescript
import CleanCSS = require("clean-css");

const output = new CleanCSS({
  rebaseTo: "dist",
}).minify(["src/styles/app.css"]);

console.log(output.styles);
console.log(output.inlinedStylesheets);
console.log(output.warnings);
```

Set `rebaseTo` to the directory where the optimized file will live when your stylesheet contains relative URLs.

### Generate a source map

Enable `sourceMap: true` and use the callback form when you want `output.sourceMap`.

```typescript
import CleanCSS = require("clean-css");

const source = `
  .hero {
    background-image: url("../images/hero.png");
  }
`;

new CleanCSS({
  sourceMap: true,
  rebaseTo: "dist",
}).minify(source, (error, output) => {
  if (error) {
    console.error(error);
    return;
  }

  console.log(output.styles);
  console.log(output.sourceMap && output.sourceMap.toString());
});
```

The runtime README documents `output.sourceMap` as a `SourceMapGenerator` object when source maps are enabled.

### Inline remote `@import` rules

Remote `@import` inlining is asynchronous. Pass a callback when `inline` includes remote URLs.

```typescript
import CleanCSS = require("clean-css");

const source = '@import url("https://example.com/base.css");';

new CleanCSS({
  inline: ["remote"],
}).minify(source, (error, output) => {
  if (error) {
    console.error(error);
    return;
  }

  console.log(output.styles);
});
```

If you do not provide a callback, remote `@import` rules are left as-is.

## Important Pitfalls

- Install `clean-css` itself. `@types/clean-css` is declarations only.
- Import from `"clean-css"`, not from `"@types/clean-css"`.
- The runtime export is CommonJS, so `import CleanCSS = require("clean-css")` is the most predictable TypeScript import form.
- `minify()` can return warnings and still produce valid `styles`; always inspect both `output.errors` and `output.warnings` when minifying user or generated CSS.
- If you set `rebase: true` without also setting `rebaseTo`, the runtime adds a warning because URL rebasing then defaults to the current working directory.
- Remote `@import` processing requires the callback form of `minify()`.

## Version-Sensitive Notes

- This guide targets `@types/clean-css==4.2.11`.
- The `clean-css` README documents these 4.2 additions: `CleanCSS.process()` compatibility for `optimize-css-assets-webpack-plugin`, `/* clean-css ignore:start */` and `/* clean-css ignore:end */` preservation, selector-aware `transform` filtering, and `format: { breakWith: "lf" }`.
- The same upstream README also documents later 5.x changes, including additional features and changed defaults. Verify your installed `clean-css` runtime version before relying on 5.x-only behavior in a project pinned to these 4.2.11 declarations.
- Optimization level `1` is the documented default, and turning on level `2` applies level `1` optimizations as well unless you disable them explicitly in the nested config.

## Official Sources

- https://www.npmjs.com/package/@types/clean-css
- https://www.npmjs.com/package/clean-css
- https://github.com/clean-css/clean-css
- https://github.com/clean-css/clean-css/blob/master/README.md
- https://github.com/clean-css/clean-css/blob/master/lib/clean.js
