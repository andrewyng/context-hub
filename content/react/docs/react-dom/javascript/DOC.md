---
name: react-dom
description: "React DOM runtime for browser roots, hydration, portals, synchronous DOM flushes, and server rendering in JavaScript apps."
metadata:
  languages: "javascript"
  versions: "19.2.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "react,react-dom,dom,hydration,ssr,portal"
---

# React DOM JavaScript Guide

## Golden Rule

Install matching `react` and `react-dom` versions, import browser root APIs from `react-dom/client`, import DOM helpers such as `createPortal` and `flushSync` from `react-dom`, and import server rendering APIs from `react-dom/server`.

## Install

```bash
npm install react react-dom
```

There are no environment variables, credentials, or client objects to configure.

The examples below use JSX, so your app needs a build setup that compiles JSX for the browser or server runtime you target.

## Mount a Browser Root

Use `createRoot` when the container is empty and React owns the full client-side render.

**`index.html`**

```html
<!doctype html>
<html lang="en">
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**`src/main.js`**

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root container");
}

createRoot(container, {
  onRecoverableError(error, errorInfo) {
    console.error("recoverable render error", error, errorInfo.componentStack);
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

If your app removes the host node outside React, keep the returned root and call `root.unmount()` before the container disappears.

## Hydrate Server-Rendered HTML

Use `hydrateRoot` when the server already rendered markup into the same container.

**`src/client.js`**

```javascript
import { hydrateRoot } from "react-dom/client";
import App from "./App.js";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root container");
}

hydrateRoot(container, <App />, {
  identifierPrefix: "app-",
  onRecoverableError(error, errorInfo) {
    console.error("recoverable hydration error", error, errorInfo.componentStack);
  },
});
```

When you use `hydrateRoot`, the server HTML should match the client render. If you use `useId`, pass the same `identifierPrefix` on the server and the client.

## Render a Portal Outside the Main Container

Use `createPortal` when a component should stay in the same React tree but render into a different DOM node, such as a modal or tooltip root.

**`index.html`**

```html
<!doctype html>
<html lang="en">
  <body>
    <div id="root"></div>
    <div id="modal-root"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**`src/Modal.js`**

```javascript
import { createPortal } from "react-dom";

export default function Modal({ children, open }) {
  const modalRoot = document.getElementById("modal-root");

  if (!open || !modalRoot) {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal">{children}</div>
    </div>,
    modalRoot,
  );
}
```

The portal changes where the DOM nodes live, but events and context still follow the React tree.

## Force a Synchronous DOM Update Only When Needed

`flushSync` is a last-resort escape hatch when later code in the same tick must observe the DOM after a React update.

```javascript
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

export default function TodoList() {
  const [items, setItems] = useState(["First item"]);
  const listRef = useRef(null);

  function addItem() {
    flushSync(() => {
      setItems((currentItems) => [
        ...currentItems,
        `Item ${currentItems.length + 1}`,
      ]);
    });

    listRef.current?.lastElementChild?.scrollIntoView({
      block: "nearest",
    });
  }

  return (
    <>
      <button onClick={addItem}>Add item</button>
      <ul ref={listRef}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}
```

Do not wrap normal app updates in `flushSync`. It can hurt performance and may force pending Suspense boundaries to show their fallback state.

## Stream HTML from a Node Server

Use `renderToPipeableStream` in Node runtimes that work with Node streams.

**`server.js`**

```javascript
import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import App from "./src/App.js";

const app = express();

app.use(express.static("public"));

app.get("/", (_req, res) => {
  let didError = false;

  const { pipe, abort } = renderToPipeableStream(<App />, {
    bootstrapScripts: ["/client.js"],
    identifierPrefix: "app-",
    onShellReady() {
      res.statusCode = didError ? 500 : 200;
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.write("<!doctype html>");
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

  setTimeout(() => abort(), 10000);
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
```

Hydrate the resulting HTML on the client with `hydrateRoot(...)` and use the same `identifierPrefix` if your tree uses `useId`.

## Stream HTML in Web Streams Runtimes

Use `renderToReadableStream` in runtimes that return a standard `Response`, such as edge or worker-style servers.

```javascript
import { renderToReadableStream } from "react-dom/server";
import App from "./App.js";

export default async function handleRequest() {
  const stream = await renderToReadableStream(<App />, {
    bootstrapScripts: ["/client.js"],
    identifierPrefix: "app-",
  });

  await stream.allReady;

  return new Response(stream, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
```

## Important Pitfalls

- Import `createRoot` and `hydrateRoot` from `react-dom/client`, not from the top-level `react-dom` entry point.
- Use `hydrateRoot` for server-rendered HTML. `createRoot` is for a fresh client mount.
- Keep the server render and the client render structurally identical during hydration.
- Match `react` and `react-dom` versions in the same app.
- Treat `flushSync` as an escape hatch, not a normal rendering pattern.

## Version Notes

This guide covers the stable `react-dom` npm package at `19.2.4`.

The stable React DOM reference groups the runtime APIs by entry point:

- `react-dom/client` for browser roots and hydration
- `react-dom` for helpers such as `createPortal` and `flushSync`
- `react-dom/server` for server rendering APIs such as `renderToPipeableStream` and `renderToReadableStream`
