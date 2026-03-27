---
name: papaparse
description: "TypeScript declarations for Papa Parse CSV parsing and serialization workflows."
metadata:
  languages: "typescript"
  versions: "5.5.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,papaparse,csv,parsing,serialization,types,definitelytyped"
---

# Papa Parse TypeScript Guide

`@types/papaparse` adds TypeScript declarations for the `papaparse` runtime package. Install it when your project uses Papa Parse and your compiler does not already see bundled types.

This package only provides types. Your code imports and runs `papaparse`, not `@types/papaparse`.

## Install

Install the runtime package and the declaration package together:

```bash
npm install papaparse
npm install -D typescript @types/papaparse
```

No environment variables, credentials, or client initialization are required.

## TypeScript Setup

In most projects, installing `@types/papaparse` is enough.

If your project uses default imports, enable interop in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": false
  }
}
```

If you explicitly restrict ambient types with `compilerOptions.types`, include `papaparse`:

```json
{
  "compilerOptions": {
    "types": ["node", "papaparse"]
  }
}
```

## Import The Runtime Correctly

With `esModuleInterop` enabled, use a default import:

```ts
import Papa from "papaparse";
```

Without interop, use the CommonJS-compatible form:

```ts
import Papa = require("papaparse");
```

Do not import from `"@types/papaparse"` in application code.

## Common Workflows

### Parse A CSV String Into Typed Rows

When your CSV includes a header row, pass a row type to `Papa.parse<T>()` and set `header: true`.

```ts
import Papa from "papaparse";

type UserRow = {
  id: string;
  email: string;
  role: string;
};

const csv = `id,email,role
1,ada@example.com,admin
2,grace@example.com,editor`;

const result = Papa.parse<UserRow>(csv, {
  header: true,
  skipEmptyLines: true,
});

if (result.errors.length > 0) {
  console.error(result.errors);
}

for (const row of result.data) {
  console.log(row.email, row.role);
}
```

`result.data` is typed as `UserRow[]`, while parse problems are available on `result.errors`.

### Parse Headerless CSV As Arrays

If the input does not have headers, use an array row type instead of an object type.

```ts
import Papa from "papaparse";

const csv = `Ada,admin
Grace,editor`;

const result = Papa.parse<[string, string]>(csv, {
  header: false,
  skipEmptyLines: true,
});

for (const [name, role] of result.data) {
  console.log(name, role);
}
```

Use tuples when each column has a fixed position, or `string[]` when row length can vary.

### Parse A Browser `File`

Papa Parse can also parse a browser `File` object. The declaration package types the same `parse()` call so your callbacks stay typed.

```ts
import Papa from "papaparse";

type UploadRow = {
  name: string;
  email: string;
};

function parseUpload(file: File) {
  Papa.parse<UploadRow>(file, {
    header: true,
    skipEmptyLines: true,
    complete(results) {
      console.log(results.data);
      console.log(results.errors);
    },
  });
}
```

Use the `File` overload in browser code. On the server, the most portable path is usually to read CSV content into a string first and parse that string.

### Process Large Inputs Row By Row

For large inputs, use `step` so you can handle each row incrementally instead of waiting for the full result.

```ts
import Papa from "papaparse";

type AuditRow = {
  id: string;
  status: string;
};

Papa.parse<AuditRow>(`id,status
1,ok
2,failed`, {
  header: true,
  step(result, parser) {
    console.log(result.data.id, result.data.status);

    if (result.data.status === "failed") {
      parser.abort();
    }
  },
});
```

This pattern matters most when you want early termination or incremental validation.

### Generate CSV With `Papa.unparse`

The same package also types `Papa.unparse()` for turning arrays or object rows back into CSV.

```ts
import Papa from "papaparse";

const csv = Papa.unparse([
  { id: "1", email: "ada@example.com" },
  { id: "2", email: "grace@example.com" },
]);

console.log(csv);
```

When you pass object rows, Papa Parse derives the output columns from the object keys.

## Useful Type Imports

Import helper types from `papaparse` when you want explicit annotations around parse results or config objects.

```ts
import Papa from "papaparse";

type Row = {
  id: string;
  email: string;
};

const config: Papa.ParseConfig<Row> = {
  header: true,
  skipEmptyLines: true,
};

const result: Papa.ParseResult<Row> = Papa.parse<Row>(
  "id,email\n1,ada@example.com",
  config,
);
const errors: Papa.ParseError[] = result.errors;

console.log(errors.length);
```

These explicit imports are most useful in shared utilities and wrapper functions.

## Pitfalls

- Install `papaparse` as well as `@types/papaparse`; the declaration package does not include the runtime.
- Import from `papaparse`, never `@types/papaparse`.
- Match your generic row type to the actual CSV shape: object rows with `header: true`, array or tuple rows with `header: false`.
- Treat generics as compile-time help, not runtime validation. TypeScript will not verify that the CSV really contains the columns or value formats you declared.
- If you rely on numeric or boolean output, configure Papa Parse accordingly and keep your row type aligned with the runtime conversion you expect.

## Version Notes

This guide targets `@types/papaparse` version `5.5.2`. The package provides TypeScript declarations for Papa Parse's parsing and serialization APIs and is intended to be used alongside the `papaparse` runtime package.
