---
name: mapbox-gl
description: "TypeScript declarations for Mapbox GL JS maps, layers, sources, events, and typed GeoJSON integration."
metadata:
  languages: "typescript"
  versions: "3.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,mapbox,mapbox-gl,maps,geojson,browser,types,definitelytyped"
---

# Mapbox GL JS TypeScript Guide

Install `@types/mapbox-gl` alongside the real `mapbox-gl` runtime package.

`@types/mapbox-gl` provides TypeScript declarations only. Your application imports and runs `mapbox-gl`; the declaration package supplies types for `Map`, `MapboxOptions`, `Marker`, `Popup`, `LngLatLike`, GeoJSON sources, layer definitions, and map event handlers.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install mapbox-gl
npm install -D typescript @types/mapbox-gl
```

If your project already depends on `mapbox-gl`, add only the missing declarations:

```bash
npm install -D @types/mapbox-gl
```

## Credentials And Environment Variables

`@types/mapbox-gl` does not read environment variables itself.

If your app uses Mapbox-hosted styles such as `mapbox://styles/...`, expose your token through your app build tool and assign it to `mapboxgl.accessToken` before creating a map.

Example `.env` for a Vite app:

```bash
VITE_MAPBOX_ACCESS_TOKEN=pk.your-public-token
```

Optional `src/vite-env.d.ts` if you want the variable to be strongly typed:

```typescript
interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## TypeScript Setup

The declarations are for the `mapbox-gl` module itself. Import from `"mapbox-gl"`, never from `"@types/mapbox-gl"`.

### Import `mapbox-gl`

With `esModuleInterop` or a bundler-oriented TypeScript setup, use the default import form:

```typescript
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
```

If your project keeps CommonJS-style imports, use `import = require()`:

```typescript
import mapboxgl = require("mapbox-gl");
```

### Recommended `tsconfig.json`

Mapbox GL JS runs in the browser, so keep DOM library types enabled.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

If your app already has a working front-end `tsconfig.json`, the important part is that the project includes browser DOM libs and resolves the `mapbox-gl` module normally.

## Create A Map

This is the smallest practical setup for a typed map instance.

```typescript
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const container = document.getElementById("map");

if (!container) {
  throw new Error("Missing #map container");
}

const map = new mapboxgl.Map({
  container,
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-74.5, 40],
  zoom: 9,
  attributionControl: true,
});

map.addControl(new mapboxgl.NavigationControl(), "top-right");
```

This pattern gives you a typed `mapboxgl.Map` instance that exposes the overloaded `on()`, `addSource()`, `addLayer()`, `flyTo()`, `queryRenderedFeatures()`, and cleanup APIs.

## Add Markers And Popups

`Marker` and `Popup` are part of the runtime API and fully typed by the declaration package.

```typescript
const popup = new mapboxgl.Popup({ offset: 24 }).setHTML(`
  <strong>Lower Manhattan</strong><br />New York City
`);

new mapboxgl.Marker({ color: "#2563eb" })
  .setLngLat([-74.006, 40.7128])
  .setPopup(popup)
  .addTo(map);
```

## Add A Typed GeoJSON Source And Layer

For application data, type the GeoJSON payload at the boundary where your code constructs it.

```typescript
import type { FeatureCollection, Point } from "geojson";
import mapboxgl from "mapbox-gl";

type StoreProperties = {
  id: string;
  name: string;
  sales: number;
};

const stores: FeatureCollection<Point, StoreProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-73.9851, 40.7589],
      },
      properties: {
        id: "store-1",
        name: "Times Square",
        sales: 125000,
      },
    },
  ],
};

map.on("load", () => {
  map.addSource("stores", {
    type: "geojson",
    data: stores,
  });

  map.addLayer({
    id: "stores-circle",
    type: "circle",
    source: "stores",
    paint: {
      "circle-radius": 8,
      "circle-color": "#2563eb",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
});
```

When you know a source ID refers to a GeoJSON source, assert that type before calling `setData()`:

```typescript
const storesSource = map.getSource("stores") as mapboxgl.GeoJSONSource | undefined;

storesSource?.setData(stores);
```

## Use Typed Event Handlers

The `map.on()` overloads type event callbacks from the event name and, for layer-bound handlers, the layer ID you pass.

```typescript
map.on("click", "stores-circle", (event) => {
  const feature = event.features?.[0];

  if (!feature || feature.geometry.type !== "Point") {
    return;
  }

  const [lng, lat] = feature.geometry.coordinates;

  new mapboxgl.Popup()
    .setLngLat([lng, lat])
    .setHTML(`<strong>${feature.properties?.name ?? "Store"}</strong>`)
    .addTo(map);
});

map.on("mouseenter", "stores-circle", () => {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "stores-circle", () => {
  map.getCanvas().style.cursor = "";
});
```

For generic coordinate inputs, use the `LngLatLike` type instead of manually accepting multiple shapes.

```typescript
function focusMap(target: mapboxgl.LngLatLike) {
  map.flyTo({
    center: target,
    zoom: 12,
  });
}

focusMap([-73.9851, 40.7589]);
focusMap({ lng: -122.4194, lat: 37.7749 });
```

## Clean Up The Map Instance

When a view unmounts or a page-level controller is torn down, call `remove()`.

```typescript
map.remove();
```

This releases event listeners, DOM bindings, and WebGL resources associated with the map instance.

## Common Pitfalls

- Install `mapbox-gl` as well as `@types/mapbox-gl`; the declaration package does not include runtime JavaScript.
- Import from `"mapbox-gl"`, not from `"@types/mapbox-gl"`.
- Keep browser DOM libs enabled in `tsconfig.json`; Mapbox GL JS uses browser types such as `HTMLElement` and canvas-related APIs.
- Set `mapboxgl.accessToken` before using Mapbox-hosted styles; the library does not load your token from `.env` automatically.
- Import `"mapbox-gl/dist/mapbox-gl.css"` or built-in controls, popups, and default marker styling will be missing.
- Call `map.remove()` when tearing down a map view so the WebGL context and listeners are released cleanly.

## Version Notes For `@types/mapbox-gl` 3.5.0

This guide targets `@types/mapbox-gl==3.5.0`.

The practical integration boundary is the `mapbox-gl` runtime module. Keep application imports, access-token setup, map construction, source and layer registration, and event handling centered on `mapbox-gl`, and use `@types/mapbox-gl` to supply TypeScript declarations for that runtime API.

## Official Sources

- https://www.npmjs.com/package/@types/mapbox-gl
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/mapbox-gl
- https://www.npmjs.com/package/mapbox-gl
- https://docs.mapbox.com/mapbox-gl-js/api/
- https://docs.mapbox.com/mapbox-gl-js/example/simple-map/
- https://docs.mapbox.com/help/glossary/access-token/
