---
name: jsdom
description: "TypeScript definitions for jsdom's JSDOM, DOMWindow, virtual console, and resource loading APIs"
metadata:
  languages: "typescript"
  versions: "28.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,jsdom,dom,node,testing,types"
---

# jsdom TypeScript Guide

`@types/jsdom` provides TypeScript declarations for the `jsdom` runtime package. Install it when your code imports `JSDOM`, `DOMWindow`, `VirtualConsole`, `ResourceLoader`, or `CookieJar` from `"jsdom"`.

This package only ships `.d.ts` files. It does not include the `jsdom` runtime.

## Install

Install the runtime package and the declarations together:

```bash
npm install jsdom
npm install --save-dev typescript @types/jsdom
```

`@types/jsdom` declares dependencies on `@types/node`, `@types/tough-cookie`, and `parse5`, so npm installs those automatically.

There are no required environment variables, credentials, or initialization steps.

## TypeScript Setup

Import from `"jsdom"`, not from `"@types/jsdom"`:

```typescript
import { JSDOM } from "jsdom";
import type { ConstructorOptions, DOMWindow } from "jsdom";
```

In a normal TypeScript project, installing the package is enough. If you explicitly replace `compilerOptions.lib`, keep DOM libraries available because the declarations reference `dom` and `dom.iterable`:

```json
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true
  }
}
```

`jsdom` is a Node-side library. Use it in Node.js tools, tests, scraping utilities, or server-side HTML processing code.

## Create A Typed DOM

Use `ConstructorOptions` and `DOMWindow` when you want reusable helpers around a `JSDOM` instance:

```typescript
import { JSDOM } from "jsdom";
import type { ConstructorOptions, DOMWindow } from "jsdom";

const options: ConstructorOptions = {
  url: "https://example.test/",
  contentType: "text/html",
  pretendToBeVisual: true,
};

const dom = new JSDOM(
  `<!doctype html><p class="greeting">Hello from jsdom</p>`,
  options,
);

function readGreeting(window: DOMWindow) {
  return window.document.querySelector(".greeting")?.textContent ?? "";
}

console.log(readGreeting(dom.window));

dom.window.close();
```

`window.close()` is useful in long-running test suites or scripts because jsdom timers keep the Node.js process alive until the window is closed.

## Parse Bytes And Read Node Locations

The constructor accepts HTML strings, `Buffer`s, and other binary data. When you already have bytes, passing them directly lets jsdom perform its own encoding sniffing.

`nodeLocation()` only works when `includeNodeLocations` is enabled.

```typescript
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const html = await readFile("fixtures/page.html");

const dom = new JSDOM(html, {
  includeNodeLocations: true,
});

const heading = dom.window.document.querySelector("h1");

if (heading) {
  const location = dom.nodeLocation(heading);
  console.log(location?.startLine, location?.startCol);
}
```

If you do not need source locations, leave `includeNodeLocations` unset for better performance.

## Use `fragment()` For Small HTML Snippets

When you only need a `DocumentFragment`, `JSDOM.fragment()` avoids creating a full window:

```typescript
import { JSDOM } from "jsdom";

const fragment = JSDOM.fragment(`
  <li data-id="1">First</li>
  <li data-id="2">Second</li>
`);

const items = [...fragment.querySelectorAll("li")].map((item) => ({
  id: item.getAttribute("data-id"),
  text: item.textContent,
}));

console.log(items);
```

`fragment()` does not create a browsing context. Its nodes do not have a live `window`, subresources do not load, and you cannot pass constructor options to it.

## Run Scripts Deliberately

The declarations expose the `runScripts` option as `"dangerously" | "outside-only"`.

Use `"outside-only"` when you want to evaluate code yourself against the jsdom window without executing inline `<script>` tags automatically:

```typescript
import { JSDOM } from "jsdom";

const dom = new JSDOM(`<div id="root"></div>`, {
  runScripts: "outside-only",
});

dom.window.eval(`
  document.getElementById("root").textContent = "ready";
`);

console.log(dom.window.document.getElementById("root")?.textContent);
dom.window.close();
```

Only use `runScripts: "dangerously"` with HTML you trust. jsdom documents that embedded scripts can escape the sandbox and reach the Node.js environment.

## Load Resources And Capture Console Output

By default, jsdom does not load subresources. For relative URLs to resolve, set `url` to something other than `"about:blank"`.

Use `ResourceLoader` and `VirtualConsole` when you need typed configuration around networked resources or jsdom's internal warnings:

```typescript
import { JSDOM, ResourceLoader, VirtualConsole } from "jsdom";

const proxy = process.env.HTTP_PROXY ?? undefined;

const virtualConsole = new VirtualConsole()
  .on("jsdomError", (error) => {
    console.error(error.message);
  })
  .forwardTo(console, {
    jsdomErrors: ["not-implemented", "unhandled-exception"],
  });

const resources = new ResourceLoader({
  proxy,
  userAgent: "my-app/1.0",
});

const dom = new JSDOM(`<!doctype html><img src="/logo.png">`, {
  url: "https://example.test/",
  resources,
  virtualConsole,
});

dom.window.close();
```

`HTTP_PROXY` in this example is optional application configuration, not a jsdom requirement.

## Use `fromFile()` And `fromURL()` When Input Already Has A Location

The declarations include these convenience factories:

```typescript
import { JSDOM } from "jsdom";

const fromDisk = await JSDOM.fromFile("templates/email.html", {
  includeNodeLocations: true,
});

const fromWeb = await JSDOM.fromURL("https://example.test/", {
  referrer: "https://app.example.test/",
});

console.log(fromDisk.serialize());
console.log(fromWeb.window.location.href);

fromDisk.window.close();
fromWeb.window.close();
```

For `fromURL()`, jsdom documents that the resulting DOM gets its URL, content type, referrer, and cookies from the HTTP response. For `fromFile()`, the default URL becomes a `file:` URL based on the filename.

## Practical Pitfalls

- `@types/jsdom` is declarations only. Install `jsdom` itself for runtime behavior.
- Import from `"jsdom"`; do not import from `"@types/jsdom"` in application code.
- `nodeLocation()` throws unless the instance was created with `includeNodeLocations: true`.
- Relative resources fail against the default `url: "about:blank"`.
- `fragment()` is intentionally limited: no options, no window, and no resource loading.
- Call `window.close()` when you are done with a window to stop timers and release listeners.
