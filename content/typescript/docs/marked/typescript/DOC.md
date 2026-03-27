---
name: marked
description: "TypeScript setup for `marked`. `@types/marked@6.0.0` is a stub package, so install `marked` itself and use its bundled type definitions."
metadata:
  languages: "typescript"
  versions: "6.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,marked,markdown,html,types,definitelytyped"
---

# Marked TypeScript Guide

## Golden Rule

`@types/marked@6.0.0` is a stub package.

The npm package page for `@types/marked` says it is a stub entry for `marked`, and the published `marked` runtime package includes its own `types` entry. In practice, install `marked`, import from `"marked"`, and remove `@types/marked` if you added it directly.

## Install

Install the runtime package and your normal TypeScript toolchain:

```bash
npm install marked
npm install -D typescript
```

If your project also needs Node.js globals or built-in module types, add `@types/node`:

```bash
npm install -D @types/node
```

If you previously installed the stub package directly, remove it:

```bash
npm uninstall @types/marked
```

## Initialization

There are no package-specific environment variables, auth steps, or client objects.

The important setup is importing the runtime package directly so TypeScript reads the declarations bundled with `marked`:

```ts
import { Marked, marked, type MarkedOptions } from "marked";
```

For a Node.js TypeScript project, a practical compiler setup is:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": false
  }
}
```

## Common Workflows

### Parse Markdown to HTML

Use `marked.parse()` for the standard markdown-to-HTML flow.

```ts
import { marked } from "marked";

const markdown = `# Release notes

- Added typed markdown parsing
- Kept custom rendering support`;

const html = marked.parse(markdown);

console.log(html);
```

### Keep Parser Configuration in an Isolated Instance

The runtime package exports a `Marked` class, so you can create a configured parser instance instead of relying only on module-level helpers.

```ts
import { Marked } from "marked";

const parser = new Marked({
  gfm: true,
  breaks: true,
});

const html = parser.parse("first line\nsecond line");

console.log(html);
```

The declarations document that `breaks` only works when `gfm` is `true`.

### Reuse Typed Option Objects

Use `MarkedOptions` when you want shared parser settings to stay type-safe.

```ts
import { marked, type MarkedOptions } from "marked";

const options: MarkedOptions = {
  gfm: true,
  breaks: true,
  pedantic: false,
  silent: false,
};

const html = marked.parse("## Hello\n\nThis is **typed**.", options);

console.log(html);
```

### Customize HTML Output With a Typed Renderer

Pass a `renderer` object when you need to override how specific markdown constructs become HTML.

```ts
import { marked } from "marked";

const html = marked.parse("# API Reference", {
  renderer: {
    heading(text, level) {
      const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h${level} id="${slug}">${text}</h${level}>`;
    },
  },
});

console.log(html);
```

This is the practical TypeScript boundary for custom rendering: the runtime package exports the renderer API, and the bundled declarations type each override signature.

### Inspect and Rewrite Tokens With `walkTokens`

`Token` is a discriminated union. Checking `token.type` lets TypeScript narrow to the correct token shape.

```ts
import { marked } from "marked";

const headings: string[] = [];

const html = marked.parse("# Docs\n\n[Guide](/docs/guide)", {
  walkTokens(token) {
    if (token.type === "heading") {
      headings.push(token.text);
    }

    if (token.type === "link" && token.href.startsWith("/")) {
      token.href = new URL(token.href, "https://example.com").toString();
    }
  },
});

console.log(headings);
console.log(html);
```

The `walkTokens` option receives tokens by reference, so changes such as rewriting `href` values are preserved when the parser renders the final HTML.

If you want explicit token annotations in helper functions, the runtime package also exports the `Token` union and the `Tokens` namespace.

### Parse Inline Markdown Fragments

Use `marked.parseInline()` when the input is a short fragment instead of a full markdown document.

```ts
import { marked } from "marked";

const html = marked.parseInline("Use **bold** inside a sentence.");

console.log(html);
```

### Sanitize Untrusted Output Before Inserting It Into the DOM

The `marked` README explicitly warns that the package does not sanitize the generated HTML.

```bash
npm install marked dompurify
```

```ts
import DOMPurify from "dompurify";
import { marked } from "marked";

const source = `<img src="x" onerror="alert('xss')">`;
const unsafeHtml = marked.parse(source);
const safeHtml = DOMPurify.sanitize(unsafeHtml);

document.querySelector("#preview")!.innerHTML = safeHtml;
```

If you render user-supplied markdown in a browser, sanitize the HTML output before assigning it to `innerHTML`.

### Use the CLI From the Runtime Package

The usable CLI comes from `marked`, not from `@types/marked`.

```bash
npx marked -i README.md -o README.html --gfm
npx marked --help
```

## Important Pitfalls

- `@types/marked` is a stub package; it does not give you a separate runtime or a package you should import from.
- Import from `marked`, never from `@types/marked`.
- `marked` does not sanitize output HTML. Sanitize untrusted output before inserting it into a page.
- `breaks` only takes effect when `gfm` is enabled.
- If you set `async: true` or add async extensions, `marked.parse()` and `marked.parseInline()` can return `Promise<string>` instead of `string`.
- The CLI examples and programmatic APIs both come from the `marked` runtime package.

## Version-Sensitive Notes

- This guide targets the `@types/marked` package entry at version `6.0.0`.
- For this version, the important practical behavior is that `@types/marked` exists as a stub package that points TypeScript users to `marked`.
- The API surface you actually program against comes from the installed `marked` runtime and its bundled declarations.

## Official Sources

- npm package page for `@types/marked`: https://www.npmjs.com/package/@types/marked
- DefinitelyTyped source for `@types/marked`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/marked
- npm package page for `marked`: https://www.npmjs.com/package/marked
- `marked` homepage and documentation: https://marked.js.org/
- `marked` README and package metadata: https://github.com/markedjs/marked
