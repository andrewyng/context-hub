---
name: react-dom
description: "TypeScript declarations for React DOM client, server, static, and test-utils entry points."
metadata:
  languages: "typescript"
  versions: "19.2.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,react,react-dom,dom,ssr,types,definitelytyped"
---

# React DOM TypeScript Guide

## Golden Rule

Install `@types/react-dom` alongside the real `react-dom` runtime package. This package only provides TypeScript declarations; it does not include the React DOM runtime.

For `19.2.3`, the package metadata declares:

- a peer dependency on `@types/react@^19.2.0`
- a minimum TypeScript version of `5.2`
- type entry points for `react-dom`, `react-dom/client`, `react-dom/server`, `react-dom/static`, `react-dom/test-utils`, `react-dom/canary`, and `react-dom/experimental`

## Install

Install the runtime packages in your app, then add the type packages to the same TypeScript project:

```bash
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
```

If your app already depends on `react` and `react-dom`, add only the missing types:

```bash
npm install -D @types/react @types/react-dom
```

Keep `@types/react` and `@types/react-dom` on the same React 19 line so the client, server, and form-related types stay compatible.

## Initialization

There are no environment variables, credentials, or client objects to configure.

The main setup points are your import paths and your TypeScript compiler configuration.

In a normal TypeScript project, installing the package is usually enough. The package metadata points TypeScript at `index.d.ts` automatically, and the `exports` map provides typed subpaths such as `react-dom/client` and `react-dom/server`.

### If you restrict `compilerOptions.types`

If your project restricts ambient type packages with `compilerOptions.types`, include `react` and `react-dom`:

```json
{
  "compilerOptions": {
    "types": ["react", "react-dom"]
  }
}
```

### Opt into `canary` or `experimental` declarations

`@types/react-dom` ships optional declaration entry points for React canary and experimental builds.

If you already use a `types` array, add the entry point explicitly:

```json
{
  "compilerOptions": {
    "types": ["react", "react-dom", "react-dom/canary"]
  }
}
```

Or load the declarations once from a TypeScript file:

```ts
import {} from "react-dom/canary";
```

Use `react-dom/experimental` the same way when your project is on an experimental React build.

Only opt into these declarations when your runtime React channel matches them.

## Common Workflows

### Mount a browser root with `react-dom/client`

`createRoot` and `hydrateRoot` are declared in `react-dom/client`, not the top-level `react-dom` entry point.

```tsx
import { StrictMode } from "react";
import {
  createRoot,
  hydrateRoot,
  type RootOptions,
} from "react-dom/client";
import { App } from "./App";

const rootOptions: RootOptions = {
  identifierPrefix: "app-",
  onRecoverableError(error, errorInfo) {
    console.error("recoverable render error", error, errorInfo.componentStack);
  },
};

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root container");
}

createRoot(container, rootOptions).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// For SSR hydration instead of a fresh client mount:
hydrateRoot(container, <App />, { identifierPrefix: "app-" });
```

The client declarations also expose the `Root`, `RootOptions`, `HydrationOptions`, and `ErrorInfo` types when you want explicit annotations in framework code.

### Use top-level DOM helpers from `react-dom`

The top-level entry point declares APIs such as `createPortal`, `flushSync`, resource hints, and form helpers.

```tsx
import { createPortal } from "react-dom";

type ModalProps = {
  children: React.ReactNode;
  open: boolean;
};

export function Modal({ children, open }: ModalProps) {
  if (!open) {
    return null;
  }

  return createPortal(children, document.body);
}
```

In `19.2.3`, the top-level declarations also include `flushSync`, resource hint APIs such as `preconnect` and `preload`, plus form-related APIs such as `useFormStatus`, `useFormState`, and `requestFormReset`.

### Server-render HTML in Node with `react-dom/server.node`

Use the Node-specific server entry point when you want the stream APIs typed around `NodeJS.WritableStream`.

```tsx
import express from "express";
import { renderToPipeableStream } from "react-dom/server.node";
import { App } from "./App";

const app = express();

app.get("/", (_req, res) => {
  let didError = false;

  const { pipe, abort } = renderToPipeableStream(<App />, {
    bootstrapScripts: ["/client.js"],
    onShellReady() {
      res.statusCode = didError ? 500 : 200;
      res.setHeader("content-type", "text/html; charset=utf-8");
      pipe(res);
    },
    onShellError(error) {
      console.error(error);
      res.statusCode = 500;
      res.end("<!doctype html><h1>Server render failed</h1>");
    },
    onError(error) {
      didError = true;
      console.error(error);
    },
  });

  setTimeout(() => abort(), 10_000);
});
```

`react-dom/server` also declares `renderToString`, `renderToStaticMarkup`, `renderToReadableStream`, `resume`, and `resumeToPipeableStream`. The environment-specific subpaths narrow that surface:

- `react-dom/server.node` exports `renderToPipeableStream`, `renderToReadableStream`, `renderToString`, `renderToStaticMarkup`, `resume`, and `resumeToPipeableStream`
- `react-dom/server.browser` exports `renderToReadableStream`, `renderToString`, and `renderToStaticMarkup`
- `react-dom/server.edge` exports `renderToReadableStream`, `renderToString`, `renderToStaticMarkup`, and `resume`
- `react-dom/server.bun` exports `renderToReadableStream`, `renderToString`, and `renderToStaticMarkup`

### Render HTML streams in edge runtimes with `react-dom/server.edge`

Use the edge or browser server entry points when your runtime works with Web Streams instead of Node streams.

```tsx
import { renderToReadableStream } from "react-dom/server.edge";
import { App } from "./App";

export default async function handleRequest() {
  const stream = await renderToReadableStream(<App />, {
    bootstrapScripts: ["/client.js"],
  });

  await stream.allReady;

  return new Response(stream, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
```

### Use the static prerender APIs from `react-dom/static`

The `19.2.3` declarations include the newer static entry points for pre-render and resume workflows.

```tsx
import { prerender } from "react-dom/static.browser";
import { App } from "./App";

const { prelude, postponed } = await prerender(<App />, {
  bootstrapScripts: ["/client.js"],
});

console.log(postponed);

return new Response(prelude, {
  headers: {
    "content-type": "text/html; charset=utf-8",
  },
});
```

The static subpaths are also environment-sensitive:

- `react-dom/static.node` exports `prerender`, `prerenderToNodeStream`, `resumeAndPrerender`, and `resumeAndPrerenderToNodeStream`
- `react-dom/static.edge` exports `prerender` and `resumeAndPrerender`
- `react-dom/static.browser` exports `prerender`

### Prefer `act` from `react` in tests

`react-dom/test-utils` is still typed, but the declaration marks its `act` export as deprecated and re-exports `act` from `react`.

```tsx
import { act } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.createElement("div");
const root = createRoot(container);

await act(async () => {
  root.render(<App />);
});
```

## Important Pitfalls

- Do not install `@types/react-dom` by itself and expect a working renderer. You still need `react-dom`.
- Import client rendering APIs from `react-dom/client`, not from `react-dom`.
- Keep `@types/react` compatible with the React 19 declarations expected by this package.
- Use the environment-specific server or static subpath when you want the narrowest type surface for Node, edge, browser, or Bun code.
- If you restrict `compilerOptions.types`, add `react-dom/canary` or `react-dom/experimental` explicitly before using those release-channel-only declarations.

## Version Notes

This guide is for `@types/react-dom` `19.2.3`.

At this version, the declarations include:

- React 19 form-related top-level APIs such as `useFormStatus`, `useFormState`, and `requestFormReset`
- server resume APIs such as `resume` and `resumeToPipeableStream`
- static pre-render APIs such as `prerender`, `resumeAndPrerender`, and their Node-specific variants

If your installed `react-dom` runtime is older than the API surface described here, align the runtime package and the type packages before relying on these declarations.
