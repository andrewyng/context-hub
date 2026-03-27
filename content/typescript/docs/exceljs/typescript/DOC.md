---
name: exceljs
description: "TypeScript setup for `exceljs`. `@types/exceljs@1.3.2` is a deprecated stub package, so install `exceljs` itself and use its bundled type definitions."
metadata:
  languages: "typescript"
  versions: "1.3.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,exceljs,xlsx,node,types,definitelytyped,npm"
---

# ExcelJS TypeScript Guide

## Golden Rule

`@types/exceljs@1.3.2` is not the package you should add to a modern TypeScript project.

The npm package page for `@types/exceljs` marks it as a stub package and says that `exceljs` provides its own type definitions. Install the real `exceljs` runtime package and import both runtime APIs and TypeScript types from `exceljs`.

If an older project still has `@types/exceljs` in its lockfile, remove it unless that project is intentionally pinned to a historical setup.

## Install

Install `exceljs` and the normal TypeScript toolchain for a Node.js application:

```bash
npm install exceljs
npm install -D typescript @types/node
```

If your project already added the old stub package directly, remove it:

```bash
npm uninstall @types/exceljs
```

## Initialization

There are no package-specific credentials, auth steps, environment variables, or client objects to configure.

The practical setup points are your TypeScript compiler options, your import style, and whether your runtime code reads or writes `.xlsx` files from Node.js.

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node"],
    "skipLibCheck": false
  }
}
```

`esModuleInterop` lets you use a default import. If your project does not enable it, use the CommonJS-style import form shown below.

### Import `exceljs`

With `esModuleInterop` enabled:

```typescript
import ExcelJS from "exceljs";

const excelFile = new ExcelJS.Workbook();
```

Without `esModuleInterop`, use:

```typescript
import ExcelJS = require("exceljs");

const excelFile = new ExcelJS.Workbook();
```

Import from `exceljs`, never from `@types/exceljs`.

## Common Workflows

### Create an `.xlsx` file from typed row data

Define the row shape in your own application code, then map those objects into sheet rows.

```typescript
import ExcelJS from "exceljs";

type UserRow = {
  id: number;
  name: string;
  email: string;
};

const rows: UserRow[] = [
  { id: 1, name: "Ada", email: "ada@example.com" },
  { id: 2, name: "Linus", email: "linus@example.com" },
];

const excelFile = new ExcelJS.Workbook();
const sheet = excelFile.addWorksheet("Users");

sheet.columns = [
  { header: "ID", key: "id", width: 10 },
  { header: "Name", key: "name", width: 24 },
  { header: "Email", key: "email", width: 32 },
];

rows.forEach((row) => {
  sheet.addRow(row);
});

await excelFile.xlsx.writeFile("users.xlsx");
```

The type safety comes from your `UserRow` interface and your own app logic. `exceljs` does not infer a strict row schema from `sheet.columns`.

### Read a file and narrow cell values before using them

Cell values are typed as a union, so narrow them before calling string, number, or date-specific APIs.

```typescript
import ExcelJS from "exceljs";

const excelFile = new ExcelJS.Workbook();
await excelFile.xlsx.readFile("users.xlsx");

const sheet = excelFile.getWorksheet("Users");

if (!sheet) {
  throw new Error("Users sheet not found");
}

sheet.eachRow((row, rowNumber) => {
  if (rowNumber === 1) {
    return;
  }

  const idValue = row.getCell(1).value;
  const nameValue = row.getCell(2).value;
  const emailValue = row.getCell(3).value;

  if (
    typeof idValue === "number" &&
    typeof nameValue === "string" &&
    typeof emailValue === "string"
  ) {
    console.log({ id: idValue, name: nameValue, email: emailValue });
  }
});
```

This is the main TypeScript boundary when reading cell data: treat `.value` as a union and narrow it deliberately.

### Use file paths from Node helpers

When your code loads or saves files from a script, CLI, or server process, resolve paths explicitly instead of relying on the current working directory.

```typescript
import ExcelJS from "exceljs";
import { join } from "node:path";

const excelFile = new ExcelJS.Workbook();
const outputPath = join(process.cwd(), "artifacts", "report.xlsx");

const sheet = excelFile.addWorksheet("Report");
sheet.addRow(["status", "ok"]);

await excelFile.xlsx.writeFile(outputPath);
```

This keeps Node-based file handling predictable in tests, CLIs, and monorepos.

## Important Pitfalls

- `@types/exceljs` is a deprecated stub package. Install `exceljs` instead.
- Import from `exceljs`, not from `@types/exceljs`.
- If `import ExcelJS from "exceljs"` fails in your project, enable `esModuleInterop` or switch to `import ExcelJS = require("exceljs")`.
- `getWorksheet()` can return `undefined`; guard that result before reading rows or cells.
- Cell `.value` is a union type. Narrow it before using string, number, or date-specific operations.
- Node file helpers such as `readFile()` and `writeFile()` assume filesystem access; use the runtime APIs that match your environment.

## Version-Sensitive Notes

- This guide targets `@types/exceljs==1.3.2`.
- The published `@types/exceljs` package is a stub entry, not the recommended installation path for new projects.
- For modern TypeScript code, depend on `exceljs` and use the declarations bundled with that runtime package.
- If you maintain an older lockfile that still contains `@types/exceljs`, remove the stub package before troubleshooting import or duplicate-type issues.

## Official Sources

- https://www.npmjs.com/package/@types/exceljs
- https://www.npmjs.com/package/exceljs
- https://github.com/exceljs/exceljs
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/exceljs
