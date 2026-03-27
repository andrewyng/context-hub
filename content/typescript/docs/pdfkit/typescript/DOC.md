---
name: pdfkit
description: "TypeScript declarations for the PDFKit runtime package, including imports, Node.js compiler setup, and typed document-generation workflows"
metadata:
  languages: "typescript"
  versions: "0.17.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,pdfkit,pdf,documents,npm,types,definitelytyped"
---

# pdfkit TypeScript Guide

`@types/pdfkit` provides the TypeScript declarations for the `pdfkit` runtime package. Use it when your project creates PDF documents in Node.js and you want typed access to the `PDFDocument` constructor, document options, stream integration, and common drawing methods such as `text()`, `image()`, `addPage()`, and `registerFont()`.

This package only ships `.d.ts` files. Install the `pdfkit` runtime separately.

## Install

Install the runtime package and the declarations together:

```bash
npm install pdfkit
npm install --save-dev typescript @types/node @types/pdfkit
```

No authentication or service initialization is required. PDF generation is local to your process.

## Recommended `tsconfig.json`

`pdfkit` is usually used from Node.js code that writes to files or HTTP responses, so a practical setup is:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "types": ["node"],
    "skipLibCheck": false
  }
}
```

If your project does not restrict `compilerOptions.types`, installing `@types/node` is usually enough.

## Import `pdfkit` In TypeScript

The declaration package is designed for the `pdfkit` runtime module, not for direct imports from `@types/pdfkit`.

Use the configuration-independent import style when you want code that works without interop flags:

```ts
import PDFDocument = require("pdfkit");
```

If your `tsconfig.json` enables `esModuleInterop`, a default import also works:

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

```ts
import PDFDocument from "pdfkit";
```

## Create A PDF And Write It To Disk

The main runtime workflow is: create a `PDFDocument`, pipe it to a writable stream, write content, then call `end()`.

```ts
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import PDFDocument = require("pdfkit");

type PDFDocumentOptions = ConstructorParameters<typeof PDFDocument>[0];

const outputPath = process.env.PDF_OUTPUT_PATH ?? "./output/hello.pdf";

await mkdir(dirname(outputPath), { recursive: true });

const options: PDFDocumentOptions = {
  size: "A4",
  margin: 50,
};

const doc = new PDFDocument(options);
const file = createWriteStream(outputPath);

await new Promise<void>((resolve, reject) => {
  file.on("finish", resolve);
  file.on("error", reject);
  doc.on("error", reject);

  doc.pipe(file);

  doc.fontSize(18).text("Hello from PDFKit");
  doc.moveDown();
  doc.text("This file was generated from TypeScript.");
  doc.addPage().fontSize(14).text("Second page");

  doc.end();
});
```

`PDF_OUTPUT_PATH` is only an application-level example. `pdfkit` itself does not require any environment variables.

## Common Workflows

### Reuse typed text options

When you want a reusable text-layout object, derive the type from the public method signature instead of reaching into internal declaration paths.

```ts
import PDFDocument = require("pdfkit");

type PdfDocument = InstanceType<typeof PDFDocument>;
type TextOptions = NonNullable<Parameters<PdfDocument["text"]>[2]>;

const bodyText: TextOptions = {
  width: 410,
  align: "left",
};

const doc = new PDFDocument();

doc.text(
  "PDFKit uses the current font, font size, and cursor position unless you override them.",
  72,
  72,
  bodyText,
);

doc.end();
```

This is useful when multiple helpers in your app share the same wrapping or alignment rules.

### Register a custom font before writing text

`registerFont()` lets you give a font file a stable name, then switch to it with `font()`.

```ts
import { createWriteStream } from "node:fs";
import PDFDocument = require("pdfkit");

const doc = new PDFDocument();
doc.pipe(createWriteStream("./output/invoice.pdf"));

doc.registerFont("body", "./fonts/Inter-Regular.ttf");

doc
  .font("body")
  .fontSize(12)
  .text("Invoice #1001", 72, 72);

doc.end();
```

Use this pattern when your application ships brand fonts or when a report generator needs consistent typography across pages.

### Place an image with typed options

You can also derive image-option types from the public `image()` signature.

```ts
import { createWriteStream } from "node:fs";
import PDFDocument = require("pdfkit");

type PdfDocument = InstanceType<typeof PDFDocument>;
type ImageOptions = NonNullable<Parameters<PdfDocument["image"]>[2]>;

const imageOptions: ImageOptions = {
  width: 120,
};

const doc = new PDFDocument();
doc.pipe(createWriteStream("./output/with-logo.pdf"));

doc.image("./assets/logo.png", 72, 72, imageOptions);
doc.text("Quarterly report", 72, 220);

doc.end();
```

This keeps helpers for logos, charts, or signatures tied to the public document API instead of to internal declaration names.

## Important Pitfalls

- Install `pdfkit` as well as `@types/pdfkit`; the `@types` package does not include the runtime JavaScript.
- Import from `"pdfkit"`, not from `"@types/pdfkit"`.
- If `compilerOptions.types` is set, keep `"node"` in the list or TypeScript may stop seeing the stream and buffer types that `pdfkit` uses.
- Pipe the document to a writable destination before writing content, and call `doc.end()` when you are done so the stream can finish.
- If you want a default import, enable `esModuleInterop`; otherwise `import PDFDocument = require("pdfkit")` is the no-surprises form.
- Keep the `pdfkit` runtime and `@types/pdfkit` on compatible releases so the declared API surface matches the runtime you execute.

## Version-Sensitive Notes

- This guide targets `@types/pdfkit==0.17.5`.
- The declaration package describes the `pdfkit` module surface published through DefinitelyTyped. If your project is pinned to a substantially older or newer runtime line, verify any method differences against the PDFKit runtime documentation.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/pdfkit
- DefinitelyTyped source for `@types/pdfkit`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/pdfkit
- `@types/pdfkit` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/pdfkit/index.d.ts
- PDFKit getting started guide: https://pdfkit.org/docs/getting_started.html
- PDFKit text guide: https://pdfkit.org/docs/text.html
- PDFKit images guide: https://pdfkit.org/docs/images.html
