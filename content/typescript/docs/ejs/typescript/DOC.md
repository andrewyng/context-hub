---
name: ejs
description: "TypeScript declarations for EJS template rendering, compiled template functions, file-based rendering, and runtime options."
metadata:
  languages: "typescript"
  versions: "3.1.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,ejs,templates,node,html,views,types,definitelytyped"
---

# EJS TypeScript Guide

`@types/ejs` provides TypeScript declarations for the `ejs` runtime package. Install it when your TypeScript code renders `.ejs` templates, compiles reusable template functions, or calls file-based helpers such as `renderFile()`.

This package only ships declarations. Your application still installs and imports the real `ejs` runtime.

## Install

Install the runtime package first, then add the type package for TypeScript:

```bash
npm install ejs
npm install -D typescript @types/ejs
```

No environment variables, credentials, or client initialization are required.

If the same files also import Node built-ins such as `node:path`, install Node.js types too:

```bash
npm install -D @types/node
```

## Import `ejs`

`ejs` is published as a CommonJS module. The safest import form without interop flags is:

```typescript
import ejs = require("ejs");
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, you can use the more common default import:

```typescript
import ejs from "ejs";
```

Import from `ejs`, not from `@types/ejs`.

## Recommended `tsconfig.json`

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

## Common Workflows

### Render a template string with typed locals

EJS types the function signatures, but it does not infer required template locals from the EJS markup itself. In practice, define a TypeScript type for the data you pass to `render()`.

```typescript
import ejs from "ejs";

type WelcomeTemplateData = {
  productName: string;
  user: {
    name: string;
  };
};

const template = `
  <h1>Welcome to <%= productName %></h1>
  <p>Hello, <%= user.name %>.</p>
`;

const locals: WelcomeTemplateData = {
  productName: "Project Atlas",
  user: { name: "Ada" },
};

const html = ejs.render(template, locals);
```

This keeps the locals object checked in TypeScript while still using EJS's normal runtime API.

### Compile once and wrap the result with a typed helper

`compile()` is useful when the same template is rendered repeatedly.

```typescript
import ejs from "ejs";

type ReceiptLocals = {
  orderId: string;
  total: number;
};

const compiled = ejs.compile(`
  <h1>Receipt</h1>
  <p>Order: <%= orderId %></p>
  <p>Total: $<%= total.toFixed(2) %></p>
`);

export function renderReceipt(locals: ReceiptLocals): string {
  return compiled(locals);
}
```

Wrapping the compiled function is the simplest way to keep a stable, typed boundary in application code.

### Render a file and resolve includes

Use `renderFile()` when you want file-based templates and relative include resolution.

```typescript
import path from "node:path";
import ejs from "ejs";

type AccountPageLocals = {
  user: {
    name: string;
  };
};

async function renderAccountPage(locals: AccountPageLocals) {
  const viewsDir = path.join(process.cwd(), "views");
  const templatePath = path.join(viewsDir, "account.ejs");

  return await ejs.renderFile(templatePath, locals, {
    views: [viewsDir],
    rmWhitespace: true,
  });
}
```

This works cleanly with includes such as:

```ejs
<%- include("partials/header") %>
<h1><%= user.name %></h1>
```

### Use `filename` when rendering strings that include partials or use cache

When you call `render()` or `compile()` directly, EJS does not know the template path unless you provide one. That path is also required when `cache: true` is enabled.

```typescript
import path from "node:path";
import ejs from "ejs";

const template = `<%- include("partials/header") %><h1><%= title %></h1>`;

const html = ejs.render(
  template,
  { title: "Dashboard" },
  {
    filename: path.join(process.cwd(), "views", "dashboard.ejs"),
    cache: true,
    views: [path.join(process.cwd(), "views")],
  }
);
```

If you omit `filename`, includes and cache lookups do not have a stable file key.

### Render async templates

Set `async: true` when template code uses `await`. This changes the return type from `string` to `Promise<string>`.

```typescript
import ejs from "ejs";

type InvoiceLocals = {
  invoiceId: string;
  loadTotal: (invoiceId: string) => Promise<number>;
};

const renderInvoice = ejs.compile(
  `<p>Total: $<%= await loadTotal(invoiceId) %></p>`,
  { async: true }
);

const html = await renderInvoice({
  invoiceId: "inv_123",
  loadTotal: async () => 42,
});
```

Use this only in runtimes that support `async` and `await`.

### Use strict mode with an explicit locals object name

When `strict: true` is enabled, EJS also disables `with`, so template variables should be read from the locals object name you configure.

```typescript
import ejs from "ejs";

const html = ejs.render(
  `<h1><%= view.title %></h1><p><%= view.user.name %></p>`,
  {
    title: "Settings",
    user: { name: "Ada" },
  },
  {
    strict: true,
    localsName: "view",
  }
);
```

This avoids implicit variable lookup and makes the template's data boundary more explicit.

## Important Pitfalls

- Install `ejs` separately; `@types/ejs` does not include the runtime.
- Import from `ejs`, not from `@types/ejs`.
- `cache: true` requires a `filename` option.
- Includes need a resolvable file context: use `renderFile()`, or pass `filename` plus `views` or `root` when rendering strings.
- In EJS 3.x, the old preprocessor include syntax `<% include partial %>` is not supported; use `<%- include("partial") %>`.
- The one-object `render(dataAndOptions)` shortcut is documented but not recommended because option names can collide with template data keys.
- `strict: true` disables `with`, so bare identifiers in templates no longer work unless you expose them through `localsName` or `destructuredLocals`.
- `async: true` changes the render result to a promise-returning workflow.

## Version-Sensitive Notes

- This guide targets `@types/ejs==3.1.5`.
- The runtime behavior described here matches the EJS 3.x API documented by the maintainer project.
- Include preprocessor directives are unsupported in EJS 3.0 and later.

## Official Sources

- https://www.npmjs.com/package/@types/ejs
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ejs
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ejs/index.d.ts
- https://github.com/mde/ejs/blob/main/README.md
- https://github.com/mde/ejs/blob/main/docs/syntax.md
- https://github.com/mde/ejs/blob/main/lib/ejs.js
