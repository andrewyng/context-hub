---
name: pug
description: "TypeScript declarations for the `pug` template engine, including typed imports for template compilation and rendering helpers."
metadata:
  languages: "typescript"
  versions: "2.0.10"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,pug,templates,node,types,definitelytyped"
---

# Pug TypeScript Guide

## Golden Rule

Install `@types/pug` alongside the real `pug` runtime package.

`@types/pug` only provides TypeScript declarations. Your application imports and runs `pug`; the declaration package adds types for the module import and the main template compilation and rendering helpers.

## Install

Install the runtime package first, then add the declaration package and Node.js types for file-path helpers and Node-based template rendering code.

```bash
npm install pug
npm install -D typescript @types/pug @types/node
```

If your project already depends on `pug`, add only the missing declarations:

```bash
npm install -D @types/pug @types/node
```

## Initialization

There are no environment variables, credentials, or client objects to configure.

The practical setup points are your import style, your TypeScript compiler options, and how you type the locals objects you pass into templates.

### Import `pug`

The declaration package models the CommonJS `pug` module export. The safest import form is:

```typescript
import pug = require("pug");

const html = pug.render("p Hello #{name}", { name: "Ada" });
```

With `esModuleInterop` or `allowSyntheticDefaultImports`, you can use a default import:

```typescript
import pug from "pug";

const html = pug.render("p Hello #{name}", { name: "Ada" });
```

Import from `pug`, not from `@types/pug`.

### Recommended `tsconfig.json`

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

If you prefer `import pug = require("pug")`, you do not need `esModuleInterop` for this package.

## Common Workflows

### Render a small inline template

Use `render()` when the template source is already in memory.

```typescript
import pug from "pug";

const html = pug.render("h1= title\np Welcome, #{userName}", {
  title: "Dashboard",
  userName: "Ada",
});

console.log(html);
```

### Compile once and wrap with app-specific locals types

The declaration package does not infer your template locals from the `.pug` file. Define the locals shape in your application code and wrap the compiled template with that type.

```typescript
import pug from "pug";
import { join } from "node:path";

type ProfileLocals = {
  title: string;
  user: {
    name: string;
    email: string;
  };
};

const template = pug.compileFile(join(process.cwd(), "views", "profile.pug"));

export function renderProfile(locals: ProfileLocals) {
  return template(locals);
}
```

### Pass `filename` when a string template uses `include` or `extends`

Relative template references are resolved from `filename`. When you render or compile a template string that uses `include` or `extends`, pass a real filename.

```typescript
import pug from "pug";
import { join } from "node:path";

const filename = join(process.cwd(), "views", "page.pug");

const html = pug.render(
  `extends ./layout.pug
block content
  p Hello`,
  { filename },
);
```

### Render a file directly

Use `renderFile()` when you already have a `.pug` file path and want the final HTML string in one call.

```typescript
import pug from "pug";
import { join } from "node:path";

const html = pug.renderFile(join(process.cwd(), "views", "email.pug"), {
  subject: "Password reset",
  resetUrl: "https://example.com/reset/abc123",
});
```

### Use Pug with Express

Express uses the runtime `pug` package as the view engine. `@types/pug` matters when your code imports `pug` directly or your toolchain resolves the module's TypeScript declarations.

```typescript
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", "views");

app.get("/", (_req, res) => {
  res.render("index", { title: "Home" });
});
```

## Common Pitfalls

- Install `pug`; `@types/pug` does not include the template engine runtime.
- Import from `pug`, never from `@types/pug`.
- If `import pug from "pug"` fails, enable `esModuleInterop` or switch to `import pug = require("pug")`.
- When a string template uses `include` or `extends`, pass `filename` or the relative lookup base is missing.
- Define your own locals type in app code. The declarations do not infer the variable names used inside a `.pug` template.
- Resolve template file paths explicitly with `node:path` in CLIs, tests, and monorepos instead of assuming the current working directory is always correct.

## Official Sources

- https://www.npmjs.com/package/@types/pug
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/pug
- https://pugjs.org/api/getting-started.html
- https://pugjs.org/api/reference.html
