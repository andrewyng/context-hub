---
name: sharp
description: "TypeScript guide for using the `sharp` image-processing package with its bundled declarations in Node.js projects."
metadata:
  languages: "typescript"
  versions: "0.32.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,sharp,images,node,image-processing,types"
---

# sharp TypeScript Guide

## Golden Rule

Use `sharp` as the runtime package and import application code from `"sharp"`.

In practice, the TypeScript boundary that matters is the maintained `sharp` package itself. Its published package metadata includes a `types` entry pointing at bundled declarations, so new TypeScript projects should center their setup around `sharp`, not around imports from `@types/sharp`.

## Install

Install the runtime package plus your project's TypeScript and Node.js declarations:

```bash
npm install sharp
npm install -D typescript @types/node
```

If an older project still has a direct dependency on `@types/sharp`, keep application imports pointed at `sharp`. When your installed `sharp` package already publishes its own declarations, you can remove the extra type package:

```bash
npm uninstall @types/sharp
```

There are no API keys, credentials, or package-specific environment variables to configure.

Most modern macOS, Windows, and Linux systems do not require extra runtime dependencies, but `sharp` installation can still be platform-specific. If `npm install sharp` needs additional setup, follow the official install guide instead of treating it like a pure `.d.ts` package.

## TypeScript Setup

### Recommended `tsconfig.json`

For Node.js applications, a Node-oriented compiler setup keeps the runtime boundary clear:

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

If your project restricts ambient packages with `compilerOptions.types`, include `node` because `sharp`'s declarations use Node types such as `Buffer` and `stream.Duplex`:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Import `sharp` correctly

The published declarations use CommonJS `export = sharp` semantics.

Use `import = require()` when you want the import form that matches the declarations directly:

```ts
import sharp = require("sharp");
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
import sharp from "sharp";
```

Do not import values from `"@types/sharp"` in application code.

## Common Workflows

### Resize an image and write it to disk

`toFile()` returns a typed `sharp.OutputInfo` object with the output format, size, dimensions, and channel count.

```ts
import sharp = require("sharp");

const info = await sharp("input.jpg")
  .rotate()
  .resize(320, 240)
  .webp()
  .toFile("output.webp");

console.log({
  format: info.format,
  width: info.width,
  height: info.height,
  size: info.size,
  channels: info.channels,
});
```

This is the most common integration point for web upload pipelines, image preprocessing jobs, and server-side thumbnail generation.

### Read typed image metadata before processing

`metadata()` resolves to `sharp.Metadata`, which lets you branch on image format, dimensions, alpha support, and animation details without falling back to `any`.

```ts
import sharp = require("sharp");

const metadata: sharp.Metadata = await sharp("input.png").metadata();

if (metadata.hasAlpha) {
  console.log("image contains transparency");
}

console.log({
  format: metadata.format,
  width: metadata.width,
  height: metadata.height,
  pages: metadata.pages,
});
```

Use this when your resize logic, encoder choice, or validation rules depend on the input image shape.

### Get a buffer and output info together

When you need the transformed bytes in memory and also want the output metadata, call `toBuffer({ resolveWithObject: true })`.

```ts
import { writeFile } from "node:fs/promises";
import sharp = require("sharp");

const resizeOptions: sharp.ResizeOptions = {
  width: 800,
  height: 800,
  fit: "inside",
  withoutEnlargement: true,
};

const { data, info } = await sharp("input.jpg")
  .resize(resizeOptions)
  .png()
  .toBuffer({ resolveWithObject: true });

await writeFile("output.png", data);

console.log({
  width: info.width,
  height: info.height,
  size: info.size,
  format: info.format,
});
```

This is the right shape for HTTP handlers, queue workers, and storage adapters that upload buffers instead of writing local files.

### Create an image and composite overlays

The `sharp` namespace also exports the option types you need for composing helper functions.

```ts
import sharp = require("sharp");

const overlays: sharp.OverlayOptions[] = [
  {
    input: {
      create: {
        width: 180,
        height: 180,
        channels: 4,
        background: { r: 37, g: 99, b: 235, alpha: 1 },
      },
    },
    top: 24,
    left: 24,
    blend: "over",
  },
];

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: { r: 17, g: 24, b: 39, alpha: 1 },
  },
})
  .composite(overlays)
  .png()
  .toFile("card.png");
```

This pattern is useful when you build typed helpers for social cards, badges, watermarking, or image assembly pipelines.

## Important Pitfalls

- Install `sharp`; `@types/sharp` does not provide the image-processing runtime.
- Import from `"sharp"`, not from `"@types/sharp"`.
- If you restrict `compilerOptions.types`, include `node` or TypeScript will miss the Node declarations that `sharp` references.
- The declaration package uses CommonJS `export =` semantics, so `import sharp = require("sharp")` is the no-surprises form.
- If installation fails on a specific platform, use the official `sharp` install guide rather than guessing at native build flags or system packages.

## Official Sources

- https://www.npmjs.com/package/@types/sharp
- https://www.npmjs.com/package/sharp
- https://sharp.pixelplumbing.com/install
- https://sharp.pixelplumbing.com/api-constructor
- https://github.com/lovell/sharp
