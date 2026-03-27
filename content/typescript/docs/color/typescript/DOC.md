---
name: color
description: "TypeScript declarations for the `color` CommonJS API for parsing, converting, and manipulating CSS colors."
metadata:
  languages: "typescript"
  versions: "4.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,color,css,colors,conversion,accessibility,types,definitelytyped,npm"
---

# color TypeScript Guide

`@types/color` adds TypeScript declarations for the `color` runtime package.

Install the runtime package separately. Application code imports from `"color"`, not from `"@types/color"`.

## Install

Install `color`, TypeScript, and the declaration package together:

```bash
npm install color
npm install -D typescript @types/color@4.2.0
```

The `color` runtime package metadata for the current 4.x line declares `node >= 12.5.0`.

There are no package-specific environment variables, auth steps, or client objects.

## Import The Runtime Package

The maintainer README documents `color` as a CommonJS package:

```js
const Color = require("color");
```

For TypeScript, the safest import is the matching CommonJS form:

```ts
import Color = require("color");
```

Do not import from `@types/color` in application code.

## Create Color Values

The package accepts CSS color strings, channel objects, and static constructors such as `Color.rgb()`:

```ts
import Color = require("color");

const fromCss = Color("#7743CE");
const fromRgbObject = Color({ r: 255, g: 255, b: 255 });
const fromStaticRgb = Color.rgb(255, 255, 255);
const fromStaticRgbArray = Color.rgb([255, 255, 255]);
```

String parsing is handled by `color-string`, so CSS-style inputs such as hex, `rgb(...)`, and named colors are accepted when the runtime can parse them.

## Convert And Serialize Colors

Use conversion helpers such as `.rgb()`, `.hsl()`, or `.cmyk()`, then serialize with `.string()`, `.array()`, `.object()`, `.hex()`, or `.hexa()`.

```ts
import Color = require("color");

const accent = Color("#7743CE").alpha(0.5);

const hslCss = accent.hsl().string();
const rgbArray = accent.rgb().array();
const rgbObject = accent.rgb().object();
const cmykRounded = accent.cmyk().round().array();
const hex = accent.hex();
const hexWithAlpha = accent.hexa();
const rgbNumber = accent.rgbNumber();

console.log({ hslCss, rgbArray, rgbObject, cmykRounded, hex, hexWithAlpha, rgbNumber });
```

Use `.hex()` when you only need RGB output. Use `.hexa()` or `.string()` when the alpha channel must be preserved.

## Manipulate Colors Immutably

The runtime is documented as immutable. Each manipulation returns a new color value instead of mutating the existing one.

```ts
import Color = require("color");

const base = Color("rgb(32, 99, 244)");

const lighter = base.lighten(0.2);
const darker = base.darken(0.2);
const lessSaturated = base.desaturate(0.3);
const rotated = base.rotate(180);
const blended = base.mix(Color("yellow"), 0.3);

console.log(base.hex());
console.log(lighter.hex());
console.log(darker.hex());
console.log(lessSaturated.hex());
console.log(rotated.hex());
console.log(blended.hex());
```

Keep the returned value when chaining operations:

```ts
import Color = require("color");

const badge = Color("#2563eb")
  .alpha(0.85)
  .lighten(0.1)
  .rotate(-10);

console.log(badge.hsl().string());
```

## Read And Update Individual Channels

Channel helpers act as getters when you call them without an argument and setters when you pass a value.

```ts
import Color = require("color");

const base = Color("#2563eb");

const redChannel = base.red();
const transparent = base.alpha(0.7);
const greener = base.green(140);

console.log(redChannel);
console.log(transparent.rgb().string());
console.log(greener.rgb().string());
```

## Check Contrast And Brightness

`color` includes helpers for brightness checks and WCAG-style contrast math.

```ts
import Color = require("color");

const background = Color("white");
const foreground = Color("#1f2937");

const contrast = foreground.contrast(background);
const foregroundLuminosity = foreground.luminosity();
const useDarkText = background.isLight();

console.log({ contrast, foregroundLuminosity, useDarkText });
```

These helpers are useful when you need to choose text colors or verify theme combinations before rendering them.

## Important Pitfalls

- Install `color` separately. `@types/color` only provides declarations.
- Import from `"color"`, never from `"@types/color"`.
- The documented module form is CommonJS `require("color")`, so `import Color = require("color")` is the least surprising TypeScript import.
- Color operations return new values. Reassign or capture the result of `.alpha()`, `.lighten()`, `.mix()`, and similar methods.
- `.hex()` drops alpha information. Use `.hexa()` or `.string()` when transparency matters.
- `.mix()` expects another `Color(...)` value, not a plain string or raw object.

## Version-Sensitive Notes

- This guide targets `@types/color==4.2.0`.
- The examples follow the `color` 4.x API documented by the maintainer README and package metadata.
- If your project is pinned to an older or patched `color` runtime, verify that the installed declaration package still matches the methods you call.

## Official Sources

- npm package page for `@types/color`: https://www.npmjs.com/package/@types/color
- DefinitelyTyped source for `@types/color`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/color
- `@types/color` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/color/index.d.ts
- npm package page for `color`: https://www.npmjs.com/package/color
- `color` source repository: https://github.com/Qix-/color
