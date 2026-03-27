---
name: leaflet
description: "TypeScript declarations for Leaflet maps, tile layers, markers, events, bounds, and browser-based map initialization."
metadata:
  languages: "typescript"
  versions: "1.9.21"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,leaflet,maps,browser,geojson,types,definitelytyped"
---

# Leaflet TypeScript Guide

## Golden Rule

Install `@types/leaflet` alongside the real `leaflet` runtime package.

`@types/leaflet` only provides TypeScript declarations. Your application imports and runs `leaflet`; the declaration package supplies types for `L.map()`, `L.tileLayer()`, `L.marker()`, `MapOptions`, `LatLngExpression`, `LeafletMouseEvent`, and the rest of the Leaflet 1.9 API surface.

## Install

Install the Leaflet runtime first, then add TypeScript and the declaration package:

```bash
npm install leaflet
npm install -D typescript @types/leaflet
```

If your project already depends on `leaflet`, add only the missing declarations:

```bash
npm install -D @types/leaflet
```

Import from `leaflet`, never from `@types/leaflet`.

## Initialization

There are no credentials or package-specific environment variables.

The practical setup points are your browser-oriented TypeScript configuration, the Leaflet CSS import, and creating the map after the container element exists.

### Recommended `tsconfig.json`

Leaflet targets the browser, so keep DOM library types enabled in the project that compiles your map code.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "skipLibCheck": false
  }
}
```

If your app has separate server and browser builds, keep Leaflet code in the browser/client build that includes `"DOM"`.

### Import `leaflet` and its CSS

In TypeScript module code, import from `leaflet` itself:

```typescript
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
```

### Provide a map container

Leaflet needs a real DOM element with a non-zero height.

```html
<div id="map"></div>
```

```css
#map {
  height: 320px;
}
```

## Common Workflows

### Create a typed map and add a tile layer

This is the smallest practical browser setup.

```typescript
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

const container = document.getElementById("map");

if (!container) {
  throw new Error("Missing #map container");
}

const map = L.map(container, {
  center: [51.505, -0.09],
  zoom: 13,
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
```

This gives you a typed `L.Map` instance with methods such as `setView()`, `fitBounds()`, `on()`, `off()`, and `remove()`.

### Add a marker and handle click events with typed coordinates

Use `LatLngExpression` for coordinate inputs and `LeafletMouseEvent` for map click handlers.

```typescript
import * as L from "leaflet";

const map = L.map("map", {
  center: [51.505, -0.09],
  zoom: 13,
});

const office: L.LatLngExpression = [51.5, -0.09];

const marker = L.marker(office)
  .addTo(map)
  .bindPopup("Office");

map.on("click", (event: L.LeafletMouseEvent) => {
  marker
    .setLatLng(event.latlng)
    .setPopupContent(
      `Selected ${event.latlng.lat.toFixed(5)}, ${event.latlng.lng.toFixed(5)}`,
    )
    .openPopup();
});
```

`LatLngExpression` is useful when your coordinates may be a tuple, an `L.LatLng` instance, or another supported Leaflet coordinate shape.

### Fit the viewport to typed route points

Annotate coordinate collections with `L.LatLngExpression[]` and let Leaflet compute bounds from runtime layer objects.

```typescript
import * as L from "leaflet";

const map = L.map("map", {
  center: [51.505, -0.09],
  zoom: 13,
});

const route: L.LatLngExpression[] = [
  [51.509, -0.08],
  [51.503, -0.06],
  [51.51, -0.047],
];

const polyline = L.polyline(route, {
  color: "#2563eb",
  weight: 4,
}).addTo(map);

map.fitBounds(polyline.getBounds(), {
  padding: [24, 24],
});
```

This is a common TypeScript boundary in Leaflet apps: provide flexible coordinate inputs up front, then use concrete Leaflet objects such as `L.Polyline` and `L.LatLngBounds` afterward.

### Clean up a map instance in client-side app code

If a framework mounts and unmounts the same view repeatedly, keep the map instance typed and call `remove()` during cleanup.

```typescript
import * as L from "leaflet";

let map: L.Map | undefined;

export function mountMap(container: HTMLElement) {
  map = L.map(container, {
    center: [51.505, -0.09],
    zoom: 13,
  });

  return map;
}

export function unmountMap() {
  map?.remove();
  map = undefined;
}
```

## Important Pitfalls

- `@types/leaflet` does not include the Leaflet runtime or CSS. Install `leaflet` separately.
- Import from `leaflet`, not from `@types/leaflet`.
- Create the map only after the container exists in the DOM. Leaflet is a browser library, not a server-side renderer.
- Give the container an explicit height. A zero-height element produces an empty map area.
- Keep the runtime package and the declaration package aligned around the same Leaflet API generation. This guide targets `@types/leaflet` `1.9.21`.

## Official Sources

- https://www.npmjs.com/package/@types/leaflet
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/leaflet
- https://leafletjs.com/examples/quick-start/
- https://leafletjs.com/reference.html
