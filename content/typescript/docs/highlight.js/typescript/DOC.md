---
name: highlight.js
description: "TypeScript declarations for highlight.js syntax-highlighting APIs, language registration, and browser helpers"
metadata:
  languages: "typescript"
  versions: "10.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,highlight.js,syntax-highlighting,types,definitelytyped"
---

# highlight.js TypeScript Guide

`@types/highlight.js` provides TypeScript declarations for the `highlight.js` runtime package.

This package only adds `.d.ts` files. It does not include the highlighter runtime, language grammars, or CSS themes.

## Install

Install the runtime package and the declaration package together:

```bash
npm install highlight.js
npm install --save-dev typescript @types/highlight.js@10.1.0
```

No package-specific environment variables, credentials, or client initialization are required.

## TypeScript Setup

In most projects, installing `@types/highlight.js` is enough.

Only add `highlight.js` to `compilerOptions.types` if your project already restricts which declaration packages TypeScript loads:

```json
{
  "compilerOptions": {
    "types": ["node", "highlight.js"]
  }
}
```

## Import The Runtime Package, Not The Type Package

These declarations model `highlight.js` as a CommonJS `export =` module, so the most portable TypeScript import form is:

```ts
import hljs = require("highlight.js");
```

For the smaller core build:

```ts
import hljs = require("highlight.js/lib/core");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

```ts
import hljs from "highlight.js";
```

Do not import from `@types/highlight.js` directly in application code.

## Highlight Code With A Known Language

Use `highlight()` when you already know the language name. The returned object includes the generated HTML in `.value`.

```ts
import hljs = require("highlight.js");

const source = `const total = items.reduce((sum, item) => sum + item.price, 0);`;
const result = hljs.highlight(source, { language: "javascript" });

console.log(result.language);
console.log(result.value);
```

Use the `.value` field when you need the highlighted HTML string for server rendering or template output.

## Auto-Detect A Language

Use `highlightAuto()` when the input language is not known ahead of time.

```ts
import hljs = require("highlight.js");

const source = `SELECT id, email FROM users WHERE active = true;`;
const result = hljs.highlightAuto(source, ["sql", "javascript", "typescript"]);

console.log(result.language);
console.log(result.relevance);
console.log(result.value);
```

Passing a language subset is useful when you want more predictable detection results.

## Register Only The Languages You Need

For smaller bundles, import the core build and register specific languages explicitly.

```ts
import hljs = require("highlight.js/lib/core");
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("json", json);

const tsResult = hljs.highlight("const ready: boolean = true;", {
  language: "typescript",
});

console.log(tsResult.value);
console.log(hljs.listLanguages());
```

This is the main integration boundary that matters in TypeScript projects: the declaration package types the `registerLanguage()` call and the `highlight.js/lib/languages/*` modules, but the runtime package still provides the actual language implementations.

## Highlight Browser Code Blocks

For browser code, load a theme stylesheet from `highlight.js/styles/*`, register languages if you use the core build, then highlight DOM elements.

```ts
import hljs = require("highlight.js/lib/core");
import xml from "highlight.js/lib/languages/xml";
import "highlight.js/styles/github.css";

hljs.registerLanguage("xml", xml);

document.querySelectorAll<HTMLElement>("pre code").forEach((block) => {
  hljs.highlightElement(block);
});
```

If your page uses the standard `<pre><code>` structure and the full browser build, `hljs.highlightAll()` is the simplest entrypoint:

```ts
import hljs = require("highlight.js");

hljs.highlightAll();
```

## Configure Runtime Behavior

Use `configure()` to set options such as the CSS class prefix, tab replacement, and language subset.

```ts
import hljs = require("highlight.js");

hljs.configure({
  classPrefix: "hljs-",
  tabReplace: "  ",
  useBR: false,
  languages: ["typescript", "javascript", "json"],
});
```

These options affect the runtime highlighter. `@types/highlight.js` only makes those options type-safe.

## Common Pitfalls

- Install `highlight.js` as well as `@types/highlight.js`; the type package does not include runtime JavaScript.
- Import from `"highlight.js"` or `"highlight.js/lib/core"`, not from `"@types/highlight.js"`.
- If your project restricts `compilerOptions.types`, include `highlight.js` there or TypeScript will not load the declarations.
- These declarations use CommonJS `export =` semantics, so `import { highlight } from "highlight.js"` is not the right import form.
- When you use the core build, call `registerLanguage()` before `highlight()` or `highlightElement()` for those languages.
- Theme CSS comes from the runtime package, not from the type package.

## Version Notes

`@types/highlight.js` `10.1.0` is useful for projects that still rely on the DefinitelyTyped package for `highlight.js` typings.

Check your installed `highlight.js` version before adding it. The official `highlight.js` npm package for `10.7.3` publishes its own typings via a `types` entry in `package.json`, so newer runtime installs may not need `@types/highlight.js` at all.

If your runtime package already ships declarations, prefer the runtime package's built-in types and avoid installing both sets of typings together.

## Official Sources

- https://www.npmjs.com/package/@types/highlight.js
- https://www.npmjs.com/package/highlight.js
- https://github.com/highlightjs/highlight.js
- https://highlightjs.readthedocs.io/en/latest/api.html
