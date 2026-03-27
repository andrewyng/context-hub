---
name: three
description: "TypeScript setup for the three runtime package, including the bundled declarations that replace direct @types/three installs in modern projects."
metadata:
  languages: "typescript"
  versions: "0.183.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,three,webgl,3d,browser,types,definitelytyped"
---

# Three TypeScript Guide

## Golden Rule

Use the `three` runtime package as both your JavaScript dependency and your TypeScript type source.

Modern `three` releases publish their own declarations. The `@types/three` package exists on npm, but for new projects you import from `"three"`, not from `"@types/three"`.

## Install

Install `three` and TypeScript:

```bash
npm install three
npm install -D typescript
```

If an older template or lockfile added `@types/three` directly, remove it and keep `three` as the single source of declarations:

```bash
npm uninstall @types/three
```

## Initialization

There are no environment variables, credentials, or client singletons to configure.

The practical setup is:

- a browser-oriented TypeScript configuration
- a canvas element in your page
- imports from `three`

### Recommended `tsconfig.json`

For a browser app, keep ES and DOM library types enabled:

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

If your app already has a working front-end TypeScript config, the important part is that the project resolves the `three` module normally and includes browser DOM types for canvas and renderer APIs.

### If you restrict `compilerOptions.types`

`three` is a normal module package, not an ambient `@types` package you load through `compilerOptions.types`.

If your project sets `compilerOptions.types`, keep the entries you need for your tooling, but continue importing `three` normally:

```typescript
import { Scene, WebGLRenderer } from "three";
```

## Create A Typed Scene

This is the smallest practical browser setup with typed scene, camera, geometry, material, mesh, and renderer objects.

```typescript
import {
  BoxGeometry,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

const canvas = document.querySelector<HTMLCanvasElement>("#app");

if (!canvas) {
  throw new Error("Missing #app canvas");
}

const scene = new Scene();

const camera = new PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000,
);
camera.position.z = 5;

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshNormalMaterial();
const cube = new Mesh(geometry, material);

scene.add(cube);

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

function frame() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.02;

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

frame();
```

All constructor arguments and instance methods in this example are typed from the `three` package itself.

## Use `import type` For Shared APIs

When a file only needs compile-time names, use type-only imports from `three`.

```typescript
import type { Camera, Object3D, Scene, WebGLRenderer } from "three";

export function addObject(scene: Scene, object: Object3D) {
  scene.add(object);
}

export function renderScene(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
) {
  renderer.render(scene, camera);
}
```

This keeps the runtime boundary explicit while still using the same exported declaration set.

## Type Browser Elements At The DOM Boundary

The most common typing issue in `three` apps is not the scene graph itself; it is the DOM element you pass into the renderer or use for sizing.

Use generic DOM queries so the compiler knows you are working with a canvas:

```typescript
const canvas = document.querySelector<HTMLCanvasElement>("#app");

if (!canvas) {
  throw new Error("Missing canvas");
}

const renderer = new WebGLRenderer({ canvas });
```

This is usually better than broad casts such as `document.getElementById("app") as HTMLCanvasElement` because the null check remains visible in the control flow.

## Keep Reusable Helpers Typed With `three` Exports

For library code inside your app, accept the types that `three` already exports instead of widening everything to plain objects.

```typescript
import { Vector3 } from "three";
import type { Object3D } from "three";

export function placeAt(object: Object3D, x: number, y: number, z: number) {
  object.position.copy(new Vector3(x, y, z));
}
```

That keeps helpers aligned with the runtime API surface you actually call.

## Common Pitfalls

- For new projects, install `three`, not `@types/three`.
- Import from `"three"`, never from `"@types/three"`.
- Keep `"DOM"` in `compilerOptions.lib` for browser renderer code; `WebGLRenderer` works with browser canvas and WebGL APIs.
- If your `tsconfig.json` restricts `compilerOptions.types`, remember that `three` still resolves through normal module imports, not through that ambient package list.
- Keep your code examples and runtime package version aligned with the `three` release you actually ship.

## Official Sources

- https://www.npmjs.com/package/@types/three
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/three
- https://www.npmjs.com/package/three
- https://threejs.org/manual/#en/installation
- https://threejs.org/manual/#en/creating-a-scene
- https://threejs.org/docs/#api/en/renderers/WebGLRenderer
- https://www.typescriptlang.org/tsconfig/#types
