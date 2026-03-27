---
name: prismjs
description: "TypeScript declarations for PrismJS syntax-highlighting APIs, grammars, hooks, and browser integration"
metadata:
  languages: "typescript"
  versions: "1.26.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,prismjs,syntax-highlighting,types,definitelytyped"
---

# PrismJS TypeScript Guide

`@types/prismjs` provides TypeScript declarations for the `prismjs` runtime package.

This package only adds `.d.ts` files. Install `prismjs` separately for the actual syntax-highlighting runtime, language components, plugins, and theme CSS.

## Install

Install the runtime package and the declaration package together:

```bash
npm install prismjs
npm install --save-dev typescript @types/prismjs@1.26.6
```

No package-specific environment variables, credentials, or client initialization are required.

## TypeScript Setup

In most projects, installing `@types/prismjs` is enough.

Only add `prismjs` to `compilerOptions.types` if your project already restricts which declaration packages TypeScript loads:

```json
{
  "compilerOptions": {
    "types": ["node", "prismjs"]
  }
}
```

These declarations model PrismJS as a CommonJS `export =` module, so the most portable import form is:

```ts
import Prism = require("prismjs");
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
import Prism from "prismjs";
```

Do not import from `@types/prismjs` directly in application code.

## Highlight A String

Use `Prism.highlight()` when you already know which grammar to apply.

The default `prismjs` entry includes the core bundle plus the default grammars listed in the runtime component manifest: `markup`, `css`, `clike`, and `javascript`.

```ts
import Prism = require("prismjs");

const source = `const total = items.reduce((sum, item) => sum + item.price, 0);`;
const html = Prism.highlight(source, Prism.languages.javascript, "javascript");

console.log(html);
```

`Prism.highlight()` returns the highlighted HTML string. Use it for server rendering, template output, or static-site generation.

## Load Additional Languages

Languages outside the default bundle come from PrismJS runtime components. For example, TypeScript is provided by the `prism-typescript` component, not by the main `prismjs` entry.

Use the runtime loader to add the extra grammars you need before calling `highlight()` or `highlightElement()`:

```ts
import Prism = require("prismjs");
import loadLanguages = require("prismjs/components/");

loadLanguages(["typescript"]);

const source = `const ready: boolean = true;`;
const html = Prism.highlight(source, Prism.languages.typescript, "typescript");

console.log(html);
```

The loader accepts a single language id, an array of ids, or no argument to load all available languages.

## Highlight Browser Code Blocks

For browser use, load a theme stylesheet from the runtime package, load any non-default languages you need, then highlight the matching elements.

```ts
import Prism = require("prismjs");
import loadLanguages = require("prismjs/components/");
import "prismjs/themes/prism.css";

loadLanguages(["typescript"]);

document
  .querySelectorAll<HTMLElement>("pre code.language-typescript")
  .forEach((element) => {
    Prism.highlightElement(element);
  });
```

Your HTML needs a Prism language class on the `<code>` element, for example:

```html
<pre><code class="language-typescript">const ready: boolean = true;</code></pre>
```

If you want Prism to scan the whole document, call `Prism.highlightAll()` instead:

```ts
import Prism = require("prismjs");

Prism.highlightAll();
```

## Tokenize Code And Inspect Tokens

Use `Prism.tokenize()` when you need the parsed token stream instead of the final HTML string.

```ts
import Prism = require("prismjs");

const tokens = Prism.tokenize(
  "const answer = 42;",
  Prism.languages.javascript,
);

for (const token of tokens) {
  if (token instanceof Prism.Token && token.type === "number") {
    console.log(token.content);
  }
}
```

This is the most useful low-level API when you want to inspect or transform highlighted output before rendering it.

## Extend Or Patch A Grammar

Use `Prism.languages.extend()` to clone an existing grammar and add new tokens, or `Prism.languages.insertBefore()` to control token order in an existing grammar.

```ts
import Prism = require("prismjs");

Prism.languages.todoJavascript = Prism.languages.extend("javascript", {
  "todo-comment": /\/\/\s*TODO:.*/,
});

Prism.languages.insertBefore("javascript", "keyword", {
  decorator: {
    pattern: /@\w+/,
    alias: "function",
  },
});
```

`insertBefore()` returns the new grammar object after the insertion, which is useful when you want to keep a reference to the updated grammar.

## Customize Output With Hooks

Use `Prism.hooks.add()` to modify tokens or generated markup during highlighting.

```ts
import Prism = require("prismjs");

Prism.hooks.add("wrap", (env) => {
  if (env.type === "keyword") {
    env.classes.push("token-keyword-emphasis");
  }
});

const html = Prism.highlight(
  "return true;",
  Prism.languages.javascript,
  "javascript",
);

console.log(html);
```

Hooks run synchronously in registration order.

## Important Pitfalls

- `@types/prismjs` is a declaration package only. Install `prismjs` separately for the runtime.
- Import from `"prismjs"`, not from `"@types/prismjs"`.
- If your project restricts `compilerOptions.types`, include `"prismjs"` there or TypeScript will not load the declarations.
- The main `prismjs` entry does not include every grammar. Load non-default languages such as `typescript` before using `Prism.languages.typescript` or `Prism.highlight(..., ..., "typescript")`.
- `Prism.highlight()` throws when the requested language has no loaded grammar.
- Browser styling comes from the runtime package's theme CSS, not from `@types/prismjs`.
- `Prism.manual` has to be set before Prism executes if you want to disable the automatic browser highlighting pass.

## Version Notes

- This guide targets `@types/prismjs==1.26.6`.
- The declaration package tracks the PrismJS 1.x runtime API surface. Keep `prismjs` and `@types/prismjs` aligned closely enough that the declarations match the runtime features you call.
- The PrismJS runtime package version `1.30.0` still publishes `main: "prism.js"` without a `types` field in `package.json`, so TypeScript projects still rely on `@types/prismjs` for static typing.

## Official Sources

- https://www.npmjs.com/package/@types/prismjs
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/prismjs
- https://www.npmjs.com/package/prismjs
- https://github.com/PrismJS/prism
- https://prismjs.com/docs/prism
