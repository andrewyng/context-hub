---
name: color-convert
description: "TypeScript declarations for the `color-convert` CommonJS API for converting between RGB, HSL, HSV, HWB, CMYK, hex, ANSI, keywords, and related color models."
metadata:
  languages: "typescript"
  versions: "2.0.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,color,color-convert,conversion,colors,commonjs,definitelytyped,npm"
---

# color-convert TypeScript Guide

`@types/color-convert` adds TypeScript declarations for the `color-convert` runtime package.

Install the runtime package separately. Application code imports from `"color-convert"`, not from `"@types/color-convert"`.

This guide covers the 2.x CommonJS API surface used by `color-convert` and typed by `@types/color-convert@2.0.4`.

## Install

Install the runtime package, TypeScript, and the declaration package together:

```bash
npm install color-convert
npm install -D typescript @types/color-convert@2.0.4
```

If your project already uses TypeScript, add only the missing declarations:

```bash
npm install -D @types/color-convert@2.0.4
```

The `color-convert` 2.x package metadata declares `node >= 7.0.0`.

There are no package-specific environment variables, auth steps, or client objects to initialize.

## Import The Runtime Package

The maintainer README documents `color-convert` as a CommonJS package:

```js
var convert = require("color-convert");
```

In TypeScript, the matching import form is the safest default:

```ts
import convert = require("color-convert");
```

Use that form unless your project already has a deliberate CommonJS/ESM interop setup.

## Common Workflows

### Convert between common color models

Read the API as `convert.<fromModel>.<toModel>(...)`.

```ts
import convert = require("color-convert");

const rgbToHsl = convert.rgb.hsl(140, 200, 100);
const keywordToRgb = convert.keyword.rgb("blue");
const hexToLab = convert.hex.lab("DEADBF");
const rgbToCmyk = convert.rgb.cmyk(167, 255, 4);

console.log({ rgbToHsl, keywordToRgb, hexToLab, rgbToCmyk });
```

The runtime supports conversions across `rgb`, `hsl`, `hsv`, `hwb`, `cmyk`, `xyz`, `lab`, `lch`, `hex`, `keyword`, `ansi16`, `ansi256`, `hcg`, `apple`, and `gray`.

### Get unrounded values with `.raw`

Rounded results are the default. Add `.raw` when you need the unrounded channel values.

```ts
import convert = require("color-convert");

const roundedLab = convert.hex.lab("DEADBF");
const rawLab = convert.hex.lab.raw("DEADBF");

const roundedCmyk = convert.rgb.cmyk(167, 255, 4);
const rawCmyk = convert.rgb.cmyk.raw(167, 255, 4);

console.log({ roundedLab, rawLab, roundedCmyk, rawCmyk });
```

Use `.raw` when you need the full float output for later calculations instead of presentation-ready rounded values.

### Pass arrays for multi-channel inputs

Conversions that normally take multiple channel arguments also accept an array.

```ts
import convert = require("color-convert");

const rgb: [number, number, number] = [123, 45, 67];

const hex = convert.rgb.hex(rgb);
const hsl = convert.rgb.hsl(rgb);

console.log({ hex, hsl });
```

This array shortcut does not apply to one-value source models such as `hex`, `keyword`, or `ansi256`.

### Inspect expected channel counts

Each source model exposes a `.channels` property so you can build validators or generic wrappers around the runtime API.

```ts
import convert = require("color-convert");

console.log(convert.rgb.channels);     // 3
console.log(convert.cmyk.channels);    // 4
console.log(convert.ansi16.channels);  // 1
```

This is useful when your app accepts dynamic model names from configuration or user input.

### Add your own typed boundary around conversions

The runtime works with numbers and arrays. In application code, define tuple-shaped inputs at your own boundary and pass them through the library.

```ts
import convert = require("color-convert");

type RGB = [red: number, green: number, blue: number];

export function rgbToHex(rgb: RGB) {
  return convert.rgb.hex(rgb);
}

export function rgbToHslObject(rgb: RGB) {
  const [hue, saturation, lightness] = convert.rgb.hsl(rgb);

  return { hue, saturation, lightness };
}
```

This keeps the rest of your codebase explicit about what each numeric position means without changing how `color-convert` itself works.

## Important Pitfalls

- Install `color-convert` as well as `@types/color-convert`; the type package does not ship runtime code.
- Import from `"color-convert"`, not from `"@types/color-convert"`.
- The documented runtime API is CommonJS. In TypeScript, `import convert = require("color-convert")` is the least surprising option.
- Default conversion methods round numeric array results; use `.raw` when precision matters.
- Array arguments work for multi-channel source models only. Single-value inputs such as `hex`, `keyword`, and `ansi256` should stay single values.
- Some conversions are routed through intermediate color models when there is no direct implementation, which can introduce precision loss.

## Official Sources

- https://www.npmjs.com/package/@types/color-convert
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/color-convert
- https://www.npmjs.com/package/color-convert
- https://github.com/Qix-/color-convert
