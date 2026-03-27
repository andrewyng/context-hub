---
name: handlebars
description: "TypeScript declarations for Handlebars template compilation, helpers, partials, runtime-only rendering, and CommonJS import patterns"
metadata:
  languages: "typescript"
  versions: "4.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,handlebars,templates,html,views,types,definitelytyped"
---

# Handlebars TypeScript Guide

`@types/handlebars` adds TypeScript declarations for the `handlebars` runtime package. Use it in projects that still rely on the separate declaration package and want typed access to `compile()`, `template()`, `precompile()`, `registerHelper()`, `registerPartial()`, and `SafeString`.

This package only provides `.d.ts` files. Your application imports and executes `handlebars`, not `@types/handlebars`.

## Golden Rule

Install `@types/handlebars` alongside the real `handlebars` runtime package.

If you are starting a new project on current Handlebars releases, check whether the runtime package already provides the declarations you need. The published `handlebars` package includes a `types/index.d.ts` entrypoint, so many current projects do not need a separate `@types/handlebars` dependency.

## Install

For a project pinned to the separate declaration package:

```bash
npm install handlebars
npm install -D typescript @types/handlebars
```

If your app already depends on `handlebars`, add only the missing declaration package:

```bash
npm install -D @types/handlebars
```

There are no package-defined environment variables, credentials, or service initialization steps.

## TypeScript Setup

The declaration entrypoint uses `export =`, so the most portable import form is:

```typescript
import Handlebars = require("handlebars");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import Handlebars from "handlebars";
```

Recommended `tsconfig.json` settings for a Node.js project that renders templates:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

If you explicitly restrict ambient types with `compilerOptions.types`, keep the packages that your template-rendering project actually needs available there.

## Common Workflows

### Compile a template with a typed context

`compile<T>()` returns a template function whose first argument is typed as your context object.

```typescript
import Handlebars from "handlebars";

type InvoiceContext = {
  customerName: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
  }>;
};

const source = `
  <h1>{{customerName}}</h1>
  <ul>
    {{#items}}
      <li>{{name}} × {{quantity}}</li>
    {{/items}}
  </ul>
  <p>Total: {{total}}</p>
`;

const renderInvoice = Handlebars.compile<InvoiceContext>(source);

const html = renderInvoice({
  customerName: "Ada Lovelace",
  total: 42,
  items: [
    { name: "Notebook", quantity: 2 },
    { name: "Pen", quantity: 4 },
  ],
});

console.log(html);
```

The generic type protects the data you pass into the compiled template function. It does not statically validate placeholder names inside the template string.

### Register a helper and guard inputs

The published helper typings are intentionally broad. Treat helper arguments as runtime input and validate them before using them.

```typescript
import Handlebars from "handlebars";

Handlebars.registerHelper("currency", (value) => {
  if (typeof value !== "number") {
    return "";
  }

  return new Handlebars.SafeString(`$${value.toFixed(2)}`);
});

const template = Handlebars.compile(`Price: {{{currency amount}}}`);

console.log(template({ amount: 12.5 }));
```

Use triple-stash output only when the helper returns content you intend to render without escaping.

### Register and use partials

Partials can be registered from strings or from compiled template delegates.

```typescript
import Handlebars from "handlebars";

Handlebars.registerPartial("lineItem", "<li>{{name}} × {{quantity}}</li>");

const renderList = Handlebars.compile<{
  items: Array<{ name: string; quantity: number }>;
}>(`
  <ul>
    {{#items}}
      {{> lineItem}}
    {{/items}}
  </ul>
`);

console.log(
  renderList({
    items: [
      { name: "Notebook", quantity: 2 },
      { name: "Pen", quantity: 4 },
    ],
  }),
);
```

If you want isolated helper and partial registries, create a fresh instance with `Handlebars.create()` instead of mutating the shared top-level registry.

### Precompile templates and render with the runtime build

The declarations expose both `precompile()` and the `handlebars/runtime` module for runtime-only rendering.

```typescript
import HandlebarsRuntime = require("handlebars/runtime");

declare const precompiledInvoice: TemplateSpecification;

type InvoiceContext = {
  customerName: string;
  total: number;
};

const renderInvoice = HandlebarsRuntime.template<InvoiceContext>(
  precompiledInvoice,
);

console.log(
  renderInvoice({
    customerName: "Ada Lovelace",
    total: 42,
  }),
);
```

Use the full `handlebars` package when you need to compile templates at runtime. Use `handlebars/runtime` when templates were precompiled earlier in your build pipeline.

### Parse a template to an AST

The declarations include typed `parse()` and `parseWithoutProcessing()` entrypoints that return `hbs.AST.Program`.

```typescript
import Handlebars from "handlebars";

const ast = Handlebars.parse("{{#if user}}Hello, {{user.name}}{{/if}}");

console.log(ast.type);
console.log(ast.body.length);
```

This is useful when you need to inspect templates in custom tooling instead of rendering them immediately.

## Important Pitfalls

- `@types/handlebars` only adds declarations. Install `handlebars` itself for runtime behavior.
- Import from `handlebars` or `handlebars/runtime`, never from `@types/handlebars` in application code.
- The declaration entrypoint uses `export =`, so your import style depends on your TypeScript interop settings.
- The generic on `compile<T>()` types the context object you pass at render time, but it does not type-check the Handlebars template string itself.
- Helper arguments and `options.hash` are broadly typed, so validate values inside helpers before assuming a shape.
- `SafeString` bypasses escaping for the returned content. Use it only for content you trust.

## Version-Sensitive Notes

- This guide targets `@types/handlebars==4.1.0`.
- The separate declaration package is for the `handlebars` runtime package and models the CommonJS module shape with `export = Handlebars`.
- The declarations cover the main runtime workflow: `compile`, `template`, `precompile`, helper registration, partial registration, and `handlebars/runtime`.
- Current published `handlebars` releases include their own `types/index.d.ts`, so fresh projects often rely on the runtime package's bundled declarations instead of adding `@types/handlebars` separately.

## Official Sources

- https://www.npmjs.com/package/@types/handlebars
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/handlebars
- https://www.npmjs.com/package/handlebars
- https://github.com/handlebars-lang/handlebars.js
- https://github.com/handlebars-lang/handlebars.js/blob/master/types/index.d.ts
- https://handlebarsjs.com/
