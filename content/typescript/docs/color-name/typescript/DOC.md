---
name: color-name
description: "TypeScript declarations for the `color-name` package, which exports CSS named colors as RGB tuples."
metadata:
  languages: "typescript"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,color-name,css,colors,types,definitelytyped"
---

# Color Name TypeScript Guide

## Golden Rule

Install `@types/color-name` for compile-time declarations only.

Your application code reads from the `color-name` runtime package, which exports a single object whose keys are CSS color keywords and whose values are RGB arrays such as `red: [255, 0, 0]`.

`@types/color-name` adds TypeScript coverage for that module. It does not install the runtime package.

## Install

Install the runtime package and the declaration package together:

```bash
npm install color-name
npm install -D typescript @types/color-name
```

If TypeScript is already present in your project, add just the missing declarations:

```bash
npm install -D @types/color-name
```

## Initialization

There are no environment variables, credentials, or client objects to initialize.

The `color-name` package is a plain data module. The runtime package uses CommonJS and exports the color table directly.

## Common Workflows

### Import the color table and read RGB values

The package API is a single object. Read named colors from that object and destructure the RGB tuple when needed.

```typescript
import colorName = require("color-name");

const tomato = colorName.tomato;
const [red, green, blue] = colorName.rebeccapurple;

console.log(tomato); // [255, 99, 71]
console.log({ red, green, blue });
```

This mirrors the runtime package's documented usage, which is a direct module import followed by property access such as `colors.red`.

### Restrict your API to supported color names

When you accept a named color from the rest of your app, derive the allowed names from the imported module instead of maintaining your own string union.

```typescript
import colorName = require("color-name");

type NamedColor = keyof typeof colorName;

export function rgbFromNamedColor(name: NamedColor) {
  const [red, green, blue] = colorName[name];

  return { red, green, blue };
}

rgbFromNamedColor("aliceblue");
rgbFromNamedColor("tomato");
```

This keeps your accepted values aligned with the package data.

### Narrow untyped input at the boundary

If input starts as an arbitrary string, narrow it before indexing into the color table.

```typescript
import colorName = require("color-name");

type NamedColor = keyof typeof colorName;

export function isNamedColor(value: string): value is NamedColor {
  return value in colorName;
}

export function parseNamedColor(value: string) {
  if (!isNamedColor(value)) {
    throw new Error(`Unsupported CSS named color: ${value}`);
  }

  return colorName[value];
}
```

This is the safest pattern when names come from HTTP input, CLI flags, or config files.

### Iterate all available color names

Use `Object.keys()` when you need to build a picker, autocomplete list, or validation set.

```typescript
import colorName = require("color-name");

type NamedColor = keyof typeof colorName;

const allColorNames = Object.keys(colorName) as NamedColor[];

for (const name of allColorNames) {
  const [red, green, blue] = colorName[name];
  console.log(name, red, green, blue);
}
```

## Important Pitfalls

- Install `color-name` as well as `@types/color-name`; the type package does not provide runtime code.
- The package exports a static lookup table, not a color parser or format-conversion API.
- The runtime package is CommonJS, so ESM-only projects may need their normal CommonJS interop boundary.
- If you index with a plain `string`, TypeScript cannot guarantee the key exists; narrow to `keyof typeof colorName` first.
- The values are RGB tuples. If your app needs hex, HSL, ANSI, or other color spaces, convert the tuple yourself or hand it to a dedicated color-conversion library.

## Official Sources

- https://www.npmjs.com/package/@types/color-name
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/color-name
- https://www.npmjs.com/package/color-name
- https://github.com/colorjs/color-name
