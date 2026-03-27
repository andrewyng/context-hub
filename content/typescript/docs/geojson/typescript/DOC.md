---
name: geojson
description: "TypeScript declarations for RFC 7946 GeoJSON objects, geometries, features, and feature collections."
metadata:
  languages: "typescript"
  versions: "7946.0.16"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,geojson,spatial,types,definitelytyped,npm"
---

# GeoJSON TypeScript Guide

## Golden Rule

Install `@types/geojson` for compile-time declarations only, then import types from `"geojson"` in your TypeScript code.

`@types/geojson` does not ship a parser, serializer, validator, map renderer, or coordinate utilities. It describes RFC 7946 GeoJSON shapes such as `GeoJsonObject`, `Geometry`, `Feature<G, P>`, and `FeatureCollection<G, P>` so your code, JSON boundaries, and integration points stay typed.

## Install

Add the declaration package to your project:

```bash
npm install -D typescript @types/geojson@7946.0.16
```

If TypeScript is already installed, add only the GeoJSON declarations:

```bash
npm install -D @types/geojson@7946.0.16
```

There are no package-specific environment variables, credentials, authentication steps, or runtime clients to initialize.

The published package metadata declares `typeScriptVersion: "5.0"`, so use TypeScript 5.0 or newer.

## Initialization

The important setup is your compiler configuration and your import style.

### Use type-only imports

Import declarations from `"geojson"`, never from `"@types/geojson"`.

Prefer `import type` so the import is erased from emitted JavaScript:

```typescript
import type {
  Feature,
  FeatureCollection,
  GeoJsonObject,
  Geometry,
  Point,
  Polygon,
  Position,
} from "geojson";
```

This matters because `@types/geojson` is a declaration package only. A runtime import that survives compilation can fail if your app tries to load a `geojson` module at runtime.

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

If your project explicitly restricts ambient type packages with `compilerOptions.types`, include `"geojson"`:

```json
{
  "compilerOptions": {
    "types": ["node", "geojson"]
  }
}
```

`node` is only needed there if the same project also uses Node.js APIs.

## Common Workflows

### Type a feature collection with custom properties

Use the generic parameters on `FeatureCollection<G, P>` and `Feature<G, P>` to keep geometry and properties explicit.

```typescript
import type { FeatureCollection, Point } from "geojson";

type CityProperties = {
  id: string;
  name: string;
  population: number;
};

export const cities: FeatureCollection<Point, CityProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.4194, 37.7749],
      },
      properties: {
        id: "sf",
        name: "San Francisco",
        population: 808988,
      },
    },
  ],
};
```

This is the most common way to use the package in application code: type the GeoJSON value at the boundary where you construct or receive it.

### Type helper functions that produce GeoJSON

Keep function boundaries generic so downstream code preserves the exact geometry and properties types.

```typescript
import type { Feature, Geometry, GeoJsonProperties } from "geojson";

export function makeFeature<G extends Geometry, P extends GeoJsonProperties>(
  geometry: G,
  properties: P
): Feature<G, P> {
  return {
    type: "Feature",
    geometry,
    properties,
  };
}

const office = makeFeature(
  {
    type: "Point",
    coordinates: [-73.9851, 40.7589],
  },
  {
    name: "Midtown Office",
    open: true,
  }
);
```

This avoids falling back to `Feature<Geometry, GeoJsonProperties>` too early.

### Narrow a geometry union by `type`

The declaration package models GeoJSON geometries as a discriminated union. Check `geometry.type` before reading geometry-specific fields.

```typescript
import type { Feature, Geometry } from "geojson";

type PlaceProperties = {
  name: string;
};

export function summarize(feature: Feature<Geometry, PlaceProperties>): string {
  if (feature.geometry === null) {
    return `${feature.properties.name}: no geometry`;
  }

  switch (feature.geometry.type) {
    case "Point":
      return `${feature.properties.name}: point at ${feature.geometry.coordinates.join(", ")}`;
    case "Polygon":
      return `${feature.properties.name}: polygon with ${feature.geometry.coordinates.length} rings`;
    case "GeometryCollection":
      return `${feature.properties.name}: ${feature.geometry.geometries.length} geometries`;
    default:
      return `${feature.properties.name}: ${feature.geometry.type}`;
  }
}
```

This is the safe way to work with the `Geometry` union in reducers, validators, renderers, and API handlers.

### Validate external JSON at the boundary

These declarations do not validate unknown input at runtime. Guard the shape you need before asserting the type.

```typescript
import { readFileSync } from "node:fs";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

function isFeatureCollection(
  value: unknown
): value is FeatureCollection<Geometry, GeoJsonProperties> {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "FeatureCollection" &&
    Array.isArray((value as { features?: unknown }).features)
  );
}

const raw = JSON.parse(readFileSync("./data/cities.json", "utf8")) as unknown;

if (!isFeatureCollection(raw)) {
  throw new Error("Expected a GeoJSON FeatureCollection");
}

console.log(raw.features.length);
```

Use this pattern whenever GeoJSON comes from files, APIs, databases, or user input.

### Work with nullable geometry and properties

The declarations allow `Feature["geometry"]` to be `null`, and the default properties type can also be `null`. Handle both when your data source allows incomplete features.

```typescript
import type { Feature } from "geojson";

type ParcelProperties = {
  parcelId: string;
} | null;

const placeholder: Feature<null, ParcelProperties> = {
  type: "Feature",
  geometry: null,
  properties: null,
};
```

If your application requires non-null properties, provide a stricter properties type parameter instead of relying on the default.

## Important Pitfalls

- `@types/geojson` is types only. It does not load, validate, transform, or render GeoJSON.
- Import from `"geojson"`, not from `"@types/geojson"`.
- Prefer `import type` for type-only usage so emitted JavaScript does not keep a runtime import.
- `Feature["geometry"]` can be `null`, so guard it before reading `geometry.type` or `coordinates`.
- The default `GeoJsonProperties` type can be `null`. If your code assumes a fixed object shape, pass an explicit properties type parameter.
- `Position` and `bbox` are numeric arrays. The declarations do not enforce tuple length, longitude/latitude ordering, ring closure, or polygon validity.
- RFC 7946 uses longitude, latitude coordinate order in WGS 84. TypeScript types do not enforce that semantic rule for you.

## Version-Sensitive Notes

- This guide targets `@types/geojson==7946.0.16`.
- The package metadata declares `typeScriptVersion: "5.0"`.
- The declarations model the GeoJSON object system from RFC 7946; this package is typically used as a type-only dependency alongside your own JSON parsing or mapping runtime.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/geojson
- DefinitelyTyped source for `@types/geojson`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/geojson
- `@types/geojson` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/geojson/index.d.ts
- GeoJSON specification (RFC 7946): https://datatracker.ietf.org/doc/html/rfc7946
