---
name: topojson-specification
description: "TypeScript declarations for TopoJSON topology documents, including installation, type-only imports, compiler setup, and working with named objects, arcs, and transforms."
metadata:
  languages: "typescript"
  versions: "1.0.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,topojson,geojson,cartography,types,definitelytyped,npm"
---

# TopoJSON Specification TypeScript Guide

## Golden Rule

Install `@types/topojson-specification` for type checking, then import types from `"topojson-specification"` in your code.

`@types/topojson-specification` is a declaration package only. It describes the shape of TopoJSON topology documents such as `Topology`, named objects under `topology.objects`, the shared `arcs` array, and optional fields like `transform` and `bbox`. It does not parse files, convert TopoJSON to GeoJSON, or provide a runtime client.

## Install

Add the declaration package to your TypeScript project:

```bash
npm install -D typescript @types/topojson-specification@1.0.5
```

If your project already has TypeScript, add only the declarations:

```bash
npm install -D @types/topojson-specification@1.0.5
```

There are no package-specific environment variables, credentials, or authentication steps.

## Initialization

The important setup is your compiler configuration and your import style.

### Use type-only imports

Import from `"topojson-specification"`, never from `"@types/topojson-specification"`.

Prefer `import type` so TypeScript erases the import in emitted JavaScript when you only need declarations:

```typescript
import type { Topology } from "topojson-specification";
```

This is the safest default for application code that only needs static types.

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "resolveJsonModule": true,
    "skipLibCheck": false
  }
}
```

If you explicitly restrict ambient packages with `compilerOptions.types`, include `"topojson-specification"` in the project that compiles your TopoJSON-related code:

```json
{
  "compilerOptions": {
    "types": ["node", "topojson-specification"]
  }
}
```

`node` is only needed there if the same project also uses Node.js APIs such as `fs`.

## Common Workflows

### Parse and type a TopoJSON file

Use the declarations to annotate parsed JSON before the rest of your code touches `objects`, `arcs`, or `transform`.

```typescript
import { readFileSync } from "node:fs";
import type { Topology } from "topojson-specification";

function parseTopologyFile(path: string): Topology {
  const value = JSON.parse(readFileSync(path, "utf8")) as Partial<Topology>;

  if (value.type !== "Topology" || value.objects === undefined || value.arcs === undefined) {
    throw new Error("Expected a Topology document");
  }

  return value as Topology;
}

const topology = parseTopologyFile("./data/world.topojson");

console.log(topology.type);
console.log(Object.keys(topology.objects));
console.log(topology.arcs.length);
```

This keeps the JSON boundary explicit and makes it easier to guard malformed input before it spreads through the rest of your app.

### Access named objects safely

`topology.objects` is a map of named TopoJSON objects. Pull the object out once, guard that it exists, then narrow by `type` before using geometry-specific fields.

```typescript
import type { Topology } from "topojson-specification";

type NamedObject = Topology["objects"][string];

function requireObject(topology: Topology, name: string): NamedObject {
  const object = topology.objects[name];

  if (!object) {
    throw new Error(`Missing topology object: ${name}`);
  }

  return object;
}

const counties = requireObject(topology, "counties");

if (counties.type === "GeometryCollection") {
  console.log(counties.geometries.length);
} else if ("arcs" in counties) {
  console.log(counties.arcs);
}
```

This pattern works well when a single topology file contains multiple named layers such as counties, states, or land boundaries.

### Guard optional transforms

The TopoJSON `transform` member is optional. Check for it before reading `scale` or `translate`.

```typescript
import type { Topology } from "topojson-specification";

function hasTransform(
  topology: Topology,
): topology is Topology & { transform: NonNullable<Topology["transform"]> } {
  return topology.transform !== undefined;
}

if (hasTransform(topology)) {
  const [scaleX, scaleY] = topology.transform.scale;
  const [translateX, translateY] = topology.transform.translate;

  console.log(scaleX, scaleY, translateX, translateY);
}
```

Apply the same pattern to other optional fields such as `bbox`, `id`, or `properties` when your code depends on them.

### Keep function boundaries typed with `Topology`

When you pass topology data between parsing, validation, and rendering code, keep the boundary typed so downstream code does not fall back to `any`.

```typescript
import type { Topology } from "topojson-specification";

export function listObjectNames(topology: Topology): string[] {
  return Object.keys(topology.objects);
}

export function hasObject(topology: Topology, name: string): boolean {
  return topology.objects[name] !== undefined;
}
```

This is especially useful when your runtime code later hands the topology to another package for conversion or rendering. The declaration package covers the TopoJSON document shape up to that boundary.

## Important Pitfalls

- `@types/topojson-specification` contains declarations only. It does not provide a parser, a converter, or rendering utilities.
- Import from `"topojson-specification"`, not from `"@types/topojson-specification"`.
- Prefer `import type` for type-only usage so your emitted JavaScript does not keep an unnecessary runtime import.
- `topology.transform`, `bbox`, `id`, and `properties` can be absent. Guard optional fields before reading them.
- TopoJSON line and polygon objects use `arcs`, not GeoJSON `coordinates`. Do not treat a TopoJSON geometry object as if it were already plain GeoJSON.
- If you set `compilerOptions.types`, include `"topojson-specification"` or TypeScript may stop discovering the declarations in that project.

## Version-Sensitive Notes

- This guide targets `@types/topojson-specification==1.0.5`.
- The package models the TopoJSON specification as TypeScript declarations and is typically used as a type-only dependency in projects that read or exchange TopoJSON documents.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/topojson-specification
- DefinitelyTyped source for `@types/topojson-specification`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/topojson-specification
- `@types/topojson-specification` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/topojson-specification/index.d.ts
- TopoJSON specification: https://github.com/topojson/topojson-specification
