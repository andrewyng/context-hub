---
name: d3
description: "TypeScript declarations for the D3 umbrella package, including installation with the `d3` runtime, DOM-aware compiler setup, typed selections, scales, and data parsing."
metadata:
  languages: "typescript"
  versions: "7.4.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,d3,visualization,svg,types,definitelytyped,npm"
---

# D3 TypeScript Guide

## Golden Rule

Install the real `d3` runtime package for code execution and `@types/d3` for TypeScript declarations.

Import from `"d3"` in application code. Do not import from `"@types/d3"` directly.

`@types/d3` is the umbrella declaration package for the `d3` bundle. It depends on the individual `@types/d3-*` packages that describe the modules re-exported by `d3` such as selections, scales, shapes, transitions, and time utilities.

## Install

Install the runtime package first, then add TypeScript and the declarations:

```bash
npm install d3
npm install -D typescript @types/d3@7.4.3
```

If your project already has `typescript`, add only the missing declarations:

```bash
npm install -D @types/d3@7.4.3
```

There is no package-specific environment variable, API key, or client initialization step.

## TypeScript Setup

TypeScript picks up `@types/d3` automatically after installation.

For browser or SVG work, include the DOM library so D3 selection types can refer to `Element`, `Document`, `Window`, `SVGSVGElement`, and related browser types:

```json
{
  "compilerOptions": {
    "strict": true,
    "lib": ["ES2022", "DOM"]
  }
}
```

Use normal module imports from the runtime package:

```typescript
import * as d3 from "d3";
```

If your project targets only specific D3 submodules such as `d3-selection` or `d3-scale`, keep the runtime import path aligned with the package you actually install.

## Common Workflows

### Start with the umbrella `d3` import

The `d3` runtime re-exports the common D3 modules, so one namespace import is enough for many apps.

```typescript
import * as d3 from "d3";

const values = [12, 28, 35, 44, 52];

const x = d3.scaleLinear([0, d3.max(values) ?? 0], [0, 480]);
const histogram = d3.bin().thresholds(5)(values);

console.log(x(20));
console.log(histogram.length);
```

This is the main workflow `@types/d3` is designed for: the umbrella runtime package plus typed access to the re-exported module APIs.

### Type SVG selections and bound data

D3 selections are heavily generic. Supply the selected element type and the datum type to keep callback parameters accurate.

```typescript
import * as d3 from "d3";

type Point = {
  x: number;
  y: number;
  r: number;
  label: string;
};

const points: Point[] = [
  { x: 40, y: 50, r: 6, label: "A" },
  { x: 120, y: 90, r: 8, label: "B" },
  { x: 220, y: 70, r: 5, label: "C" },
];

const svg = d3.select<SVGSVGElement, unknown>("#chart");

svg
  .selectAll<SVGCircleElement, Point>("circle")
  .data(points)
  .join("circle")
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .attr("r", (d) => d.r);

svg
  .selectAll<SVGTextElement, Point>("text")
  .data(points)
  .join("text")
  .attr("x", (d) => d.x + 10)
  .attr("y", (d) => d.y)
  .text((d) => d.label);
```

Without the generic arguments, element and datum types fall back to looser defaults and callback typing becomes less useful.

### Build typed scales and line generators

Scale factories and shape generators carry type information through accessors and outputs.

```typescript
import * as d3 from "d3";

type Sample = {
  at: Date;
  value: number;
};

const samples: Sample[] = [
  { at: new Date("2026-03-01"), value: 18 },
  { at: new Date("2026-03-02"), value: 25 },
  { at: new Date("2026-03-03"), value: 21 },
];

const width = 640;
const height = 240;

const x = d3.scaleTime(
  d3.extent(samples, (d) => d.at) as [Date, Date],
  [0, width],
);

const y = d3.scaleLinear([0, d3.max(samples, (d) => d.value) ?? 0], [height, 0]);

const line = d3
  .line<Sample>()
  .x((d) => x(d.at))
  .y((d) => y(d.value));

const pathData = line(samples);

console.log(pathData);
```

The explicit `line<Sample>()` call makes each accessor receive a strongly typed `Sample`.

### Parse CSV into a typed application shape

Use a row conversion function to move from string-based CSV input to a typed domain model.

```typescript
import * as d3 from "d3";

type RevenuePoint = {
  day: Date;
  revenue: number;
};

const csv = `day,revenue
2026-03-01,42
2026-03-02,48`;

const rows = d3.csvParse(csv, (row): RevenuePoint => ({
  day: new Date(row.day),
  revenue: Number(row.revenue),
}));

console.log(rows[0]?.revenue);
```

This is usually better than relying on untyped string fields throughout the rest of the visualization code.

## Important Pitfalls

- Install `d3` separately. `@types/d3` only provides declarations.
- Import from `"d3"`, not from `"@types/d3"`.
- Include `"DOM"` in `compilerOptions.lib` for browser and SVG projects, because D3 selection declarations depend on browser element types.
- The `d3` runtime package does not ship its own `.d.ts` files in the published package, so TypeScript projects still need `@types/d3` when importing the umbrella `d3` package.
- The umbrella package metadata declares TypeScript `4.5`, but the bundled `@types/d3-*` dependencies can require newer compiler baselines. If TypeScript reports parse or declaration errors inside `node_modules/@types/d3-*`, upgrade to a current TypeScript 5.x release.

## Official Sources

- https://www.npmjs.com/package/@types/d3
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/d3
- https://github.com/d3/d3/blob/main/package.json
- https://github.com/d3/d3/blob/main/src/index.js
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/d3-selection
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/d3-scale
