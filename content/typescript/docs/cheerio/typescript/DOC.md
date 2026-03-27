---
name: cheerio
description: "TypeScript guidance for using Cheerio in typed Node.js projects, including the runtime package's built-in declarations."
metadata:
  languages: "typescript"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,cheerio,html,xml,scraping,dom,types"
---

# Cheerio TypeScript Guide

## Golden Rule

Install and import the runtime package `cheerio`.

For TypeScript code, the practical integration boundary is still `"cheerio"`, not `"@types/cheerio"`. Current Cheerio releases publish declaration files through the package `types` field and `exports` map, so your application code imports runtime functions and type-only helpers from the runtime package.

`@types/cheerio` does not provide the parser or DOM traversal runtime by itself.

## Install

For a normal Node.js TypeScript project:

```bash
npm install cheerio
npm install -D typescript @types/node
```

If TypeScript is already present, add only the missing packages.

`cheerio`'s declarations reference Node types such as `Buffer` and `node:stream`, so `@types/node` is the practical companion package for most TypeScript setups.

There are no environment variables, credentials, or client initialization steps.

## TypeScript Setup

Use a standard Node-oriented compiler setup:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true
  }
}
```

If your project restricts ambient type packages with `compilerOptions.types`, include `node` so `Buffer` and other Node globals stay available:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

Import from `"cheerio"`, not from `"@types/cheerio"`:

```ts
import * as cheerio from "cheerio";
import type { CheerioAPI, CheerioOptions } from "cheerio";
```

Use a namespace import or named exports. Do not rely on a default import unless your toolchain explicitly synthesizes one.

## Common Workflows

### Load HTML and query the document

`cheerio.load()` returns the document-bound query function that you use for traversal and extraction.

```ts
import * as cheerio from "cheerio";

const html = `
  <article>
    <h1 class="title">Project Atlas</h1>
    <a href="/docs">Docs</a>
  </article>
`;

const $ = cheerio.load(html);

const title = $("h1.title").text().trim();
const href = $("a").attr("href");

console.log({ title, href });
```

### Reuse `CheerioOptions` and `CheerioAPI` in helpers

Use the exported types when you wrap document loading in shared utilities.

```ts
import * as cheerio from "cheerio";
import type { CheerioAPI, CheerioOptions } from "cheerio";

const defaultOptions: CheerioOptions = {
  baseURI: "https://example.com/",
};

export function loadDocument(
  markup: string,
  options: CheerioOptions = defaultOptions,
): CheerioAPI {
  return cheerio.load(markup, options);
}

const $ = loadDocument(`<a href="/guide">Guide</a>`);
const url = $("a").prop("href");

console.log(url);
```

`baseURI` matters when you read resolved properties such as `href` and `src`.

### Parse XML explicitly

When you need XML parsing behavior, set the `xml` option.

```ts
import * as cheerio from "cheerio";

const xml = `
  <feed>
    <item id="1">First</item>
  </feed>
`;

const $ = cheerio.load(xml, {
  xml: true,
});

const firstItem = $("item").text();

console.log(firstItem);
```

Prefer `xml` over `xmlMode`; the declarations mark `xmlMode` as deprecated.

### Convert a selection into a typed array result

Use Cheerio traversal methods for selection, then call `.get()` when you want a normal JavaScript array.

```ts
import * as cheerio from "cheerio";

const $ = cheerio.load(`
  <ul>
    <li data-id="a">Alpha</li>
    <li data-id="b">Beta</li>
  </ul>
`);

const items = $("li")
  .map((_, element) => ({
    id: $(element).attr("data-id") ?? "",
    label: $(element).text().trim(),
  }))
  .get();

console.log(items);
```

This is the simplest way to move from a Cheerio collection to a normal array that the rest of your TypeScript code can consume.

## Common Pitfalls

- Install `cheerio`; `@types/cheerio` does not provide the runtime JavaScript.
- Import from `cheerio`, not from `@types/cheerio`.
- If your `tsconfig.json` uses `compilerOptions.types`, include `node` or Cheerio's Node-related types can appear to be missing.
- Prefer `xml` over `xmlMode` for XML configuration.
- Avoid a default import such as `import cheerio from "cheerio"` unless your compiler or bundler is configured to synthesize default imports.
- Do not add a custom `declare module "cheerio"` shim in current projects; the runtime package already ships its own declarations.

## Version Notes

The important version boundary for TypeScript users is that the runtime package now publishes its own `.d.ts` files. In current projects, manage the runtime dependency as `cheerio` and keep your imports and type references on that package.

If a starter template or older lockfile still mentions `@types/cheerio`, verify whether your project already compiles with `cheerio` alone before keeping the extra type-package dependency.

## Official Sources

- https://www.npmjs.com/package/@types/cheerio
- https://www.npmjs.com/package/cheerio
- https://cheerio.js.org/
- https://github.com/cheeriojs/cheerio
