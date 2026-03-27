---
name: jimp
description: "TypeScript declarations for the classic Jimp image-processing API, including `Jimp.read()`, chainable transforms, MIME constants, and callback-based output helpers."
metadata:
  languages: "typescript"
  versions: "0.2.28"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,jimp,images,nodejs,types,definitelytyped"
---

# Jimp TypeScript Guide

## Golden Rule

Install `jimp` for the runtime image-processing implementation and `@types/jimp` for compile-time declarations.

`@types/jimp` does not process images by itself. Import from `jimp`, not from `@types/jimp`.

These declarations target the older CommonJS Jimp API shape centered on `Jimp.read()`, chainable image methods, and callback-based helpers such as `getBuffer()` and `getBase64()`.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install jimp
npm install -D typescript @types/jimp @types/node
```

If your project already has TypeScript and Node.js types, add only the Jimp declarations:

```bash
npm install -D @types/jimp
```

Import the runtime package in your application code:

```typescript
import Jimp = require("jimp");
```

## Initialization

There is no client object, authentication flow, or package-specific environment variable.

The practical setup is your TypeScript compiler configuration plus the CommonJS-style import that matches these declarations.

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "types": ["node"],
    "skipLibCheck": false
  }
}
```

If your project uses `compilerOptions.types`, keep `"node"` there so `Buffer` and filesystem types remain available to Jimp-based code.

## Common Workflows

### Read an image from a file path, URL, or `Buffer`

`Jimp.read()` is the main entry point for loading image data.

```typescript
import { readFile } from "node:fs/promises";
import Jimp = require("jimp");

const fromDisk = await Jimp.read("./input.jpg");
const fromUrl = await Jimp.read("https://example.com/image.jpg");

const bytes = await readFile("./input.jpg");
const fromBuffer = await Jimp.read(bytes);

console.log(fromDisk.getWidth(), fromDisk.getHeight());
console.log(fromUrl.getWidth(), fromUrl.getHeight());
console.log(fromBuffer.getWidth(), fromBuffer.getHeight());
```

### Resize and apply common transforms

Most image operations mutate the current image and return the same `Jimp` instance, so chaining is the common pattern.

```typescript
import Jimp = require("jimp");

const image = await Jimp.read("./input.jpg");

image
  .resize(256, 256)
  .quality(80)
  .greyscale();

image.write("./output.jpg");
```

### Convert the image to a `Buffer`

The old Jimp API exposes buffer conversion through a callback. Wrap it in a `Promise` when you want to use `await`.

```typescript
import { writeFile } from "node:fs/promises";
import Jimp = require("jimp");

const image = await Jimp.read("./input.jpg");
image.resize(512, 512);

const pngBuffer = await new Promise<Buffer>((resolve, reject) => {
  image.getBuffer(Jimp.MIME_PNG, (error, buffer) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(buffer);
  });
});

await writeFile("./output.png", pngBuffer);
```

Use `Jimp.MIME_PNG` or `Jimp.MIME_JPEG` so the buffer format matches the file or upload target you need.

### Generate a base64 data URL

`getBase64()` follows the same callback pattern and is useful when you need to embed image output into an HTML response or JSON payload.

```typescript
import Jimp = require("jimp");

const image = await Jimp.read("./input.jpg");

const dataUrl = await new Promise<string>((resolve, reject) => {
  image.getBase64(Jimp.MIME_PNG, (error, value) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(value);
  });
});

console.log(dataUrl.slice(0, 64));
```

## Minimal End-to-End Example

This script reads an image path from the environment, resizes it, and writes a PNG file using Node's filesystem APIs.

```typescript
import { writeFile } from "node:fs/promises";
import Jimp = require("jimp");

const inputPath = process.env.INPUT_IMAGE ?? "./input.jpg";
const outputPath = process.env.OUTPUT_IMAGE ?? "./output.png";

const image = await Jimp.read(inputPath);

image
  .resize(320, 320)
  .quality(80);

const output = await new Promise<Buffer>((resolve, reject) => {
  image.getBuffer(Jimp.MIME_PNG, (error, buffer) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(buffer);
  });
});

await writeFile(outputPath, output);
```

Run it with app-specific environment variables if you want configurable paths:

```bash
INPUT_IMAGE=./photo.jpg OUTPUT_IMAGE=./photo-small.png node dist/index.js
```

## Important Pitfalls

- `@types/jimp` is a declaration package only. Install `jimp` separately for the runtime.
- Do not import from `@types/jimp` in application code.
- Prefer `import Jimp = require("jimp")` with these older CommonJS declarations.
- `Jimp.read()` is promise-based, but `getBuffer()` and `getBase64()` use callbacks; wrap them when you need `await`.
- Chainable image methods mutate the loaded image instance. If you need both the original and a transformed copy, duplicate the image before applying changes.
- If you restrict ambient types with `compilerOptions.types`, keep `"node"` available so `Buffer` and Node filesystem helpers stay typed.

## Version-Sensitive Notes

- This guide targets `@types/jimp==0.2.28`.
- Keep the `jimp` runtime aligned with the API surface exposed by these declarations.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/jimp
- DefinitelyTyped source for `@types/jimp`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/jimp
- `@types/jimp` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jimp/index.d.ts
- Jimp README: https://github.com/oliver-moran/jimp#readme
