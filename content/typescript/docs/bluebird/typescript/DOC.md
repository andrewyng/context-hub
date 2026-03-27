---
name: bluebird
description: "TypeScript declarations for the Bluebird runtime package, including Bluebird-specific promise methods, collection helpers, promisification, and inspection APIs."
metadata:
  languages: "typescript"
  versions: "3.5.42"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,bluebird,promises,async,types,definitelytyped"
---

# Bluebird TypeScript Guide

`@types/bluebird` provides the TypeScript declarations for the `bluebird` runtime package. Use it when your project depends on Bluebird-specific promise APIs such as `map()`, `props()`, `delay()`, `timeout()`, `reflect()`, `promisify()`, and `asCallback()`.

This package only ships `.d.ts` files. Install the `bluebird` runtime separately.

## Install

Install the runtime package and the declarations together:

```bash
npm install bluebird
npm install --save-dev typescript @types/bluebird @types/node
```

If your project already depends on `bluebird`, add only the missing declarations:

```bash
npm install --save-dev @types/bluebird
```

`@types/node` is only needed when your TypeScript code uses Node.js APIs such as `fs`, `process.env`, or callback-based core modules.

## Initialization

There is no authentication, service client, or package-specific account setup.

The practical setup is your import style, TypeScript compiler configuration, and any optional Bluebird runtime debugging flags.

### Import Bluebird in TypeScript

The declaration package targets the CommonJS `bluebird` module. The safest import form is:

```ts
import Bluebird = require("bluebird");
```

If your compiler enables `esModuleInterop`, a default import also works:

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

```ts
import Bluebird from "bluebird";
```

Use `import Bluebird = require("bluebird")` when you want an import form that does not depend on TypeScript interop flags.

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node", "bluebird"]
  }
}
```

If you do not restrict `compilerOptions.types`, TypeScript usually discovers `@types/bluebird` automatically. If you do restrict `types`, include `bluebird` in the project that compiles Bluebird-based code.

### Optional runtime debugging and warnings

Bluebird does not require environment variables for normal usage, but it reads several optional runtime flags:

```bash
BLUEBIRD_DEBUG=1 BLUEBIRD_WARNINGS=1 node dist/server.js
BLUEBIRD_LONG_STACK_TRACES=1 node dist/server.js
BLUEBIRD_W_FORGOTTEN_RETURN=1 node dist/server.js
```

You can also configure the same behaviors in code:

```ts
import Bluebird = require("bluebird");

Bluebird.config({
  warnings: { wForgottenReturn: true },
  longStackTraces: process.env.NODE_ENV !== "production",
  cancellation: true,
});
```

Enable `cancellation: true` before Bluebird promises are already in use. The runtime throws if you try to turn cancellation on after promises have been created.

## Common Workflows

### Return `Bluebird<T>` when you need Bluebird instance methods

Keep the return type as `Bluebird<T>` when callers will use methods such as `delay()` or `timeout()`.

```ts
import Bluebird = require("bluebird");

function fetchLabel(id: string): Bluebird<string> {
  return Bluebird.resolve(`item-${id}`)
    .delay(50)
    .timeout(1000)
    .then((value) => value.toUpperCase());
}

const label = await fetchLabel("42");
```

If you annotate the function as plain `Promise<string>`, TypeScript hides Bluebird-only instance methods from downstream code.

### Resolve object-shaped work with `Bluebird.props`

`Bluebird.props()` resolves every value in an object and preserves the original keys in the resolved result.

```ts
import Bluebird = require("bluebird");

type User = {
  id: string;
  name: string;
};

type Stats = {
  uploads: number;
  downloads: number;
};

function loadUser(id: string): Bluebird<User> {
  return Bluebird.resolve({ id, name: "Ada" });
}

function loadStats(_id: string): Bluebird<Stats> {
  return Bluebird.resolve({ uploads: 12, downloads: 3 });
}

async function loadDashboard(id: string) {
  const result = await Bluebird.props({
    user: loadUser(id),
    stats: loadStats(id),
    loadedAt: Bluebird.resolve(new Date().toISOString()),
  });

  return result;
}
```

This is the most practical typed pattern when your async work naturally produces a named object instead of an array.

### Process arrays with `Bluebird.map` and bounded concurrency

`Bluebird.map()` accepts an optional `{ concurrency: number }` option for controlled parallelism.

```ts
import Bluebird = require("bluebird");

type Row = {
  id: string;
  text: string;
};

async function hydrateRows(ids: string[]): Promise<Row[]> {
  return Bluebird.map(
    ids,
    async (id, index, length) => ({
      id,
      text: `${index + 1}/${length}: ${id}`,
    }),
    { concurrency: 5 },
  );
}
```

Use this when you want typed results from many async tasks without launching the entire batch at once.

### Wrap Node-style callbacks with `Bluebird.fromCallback`

`Bluebird.fromCallback()` is the most direct bridge when you already have a callback-based API and want a typed `Bluebird<T>` result.

```ts
import Bluebird = require("bluebird");
import { readFile } from "node:fs";

function readTextFile(path: string): Bluebird<string> {
  return Bluebird.fromCallback<string>((callback) => {
    readFile(path, "utf8", callback);
  });
}

async function loadConfig(path: string) {
  const raw = await readTextFile(path);
  return JSON.parse(raw) as { enabled: boolean };
}
```

When you need a reusable wrapper for a callback-style function, `Bluebird.promisify()` and `Bluebird.promisifyAll()` expose the same runtime family of conversions.

### Bridge a promise back to a callback API with `asCallback`

`asCallback()` and `nodeify()` let you keep Bluebird internally while still supporting Node-style callbacks at your integration boundary.

```ts
import Bluebird = require("bluebird");

function loadUserName(id: string): Bluebird<string> {
  return Bluebird.resolve(`user-${id}`);
}

function getUserName(
  id: string,
  callback: (error: Error | null, value?: string) => void,
) {
  loadUserName(id).asCallback(callback);
}
```

This is useful when you are gradually migrating an older callback-based codebase to promise-based internals.

### Inspect mixed outcomes with `reflect`

Use `reflect()` when you want every operation to finish and then inspect which ones fulfilled or rejected.

```ts
import Bluebird = require("bluebird");

function maybeFetch(id: string): Bluebird<string> {
  return id === "bad"
    ? Bluebird.reject(new Error("missing"))
    : Bluebird.resolve(`value:${id}`);
}

async function loadMany(ids: string[]) {
  const inspections = await Bluebird.map(ids, (id) => maybeFetch(id).reflect());

  return inspections.map((inspection) => {
    if (inspection.isFulfilled()) {
      return { ok: true as const, value: inspection.value() };
    }

    return { ok: false as const, reason: inspection.reason() };
  });
}
```

Prefer `reflect()` for this pattern. The Bluebird runtime still exposes `Promise.settle()`, but marks it deprecated in favor of `reflect()`.

## Common Pitfalls

- Install `bluebird` as well as `@types/bluebird`; the `@types` package does not include the runtime.
- Prefer `import Bluebird = require("bluebird")` unless your TypeScript configuration explicitly supports default-import interop.
- If you restrict `compilerOptions.types`, include `bluebird` or TypeScript will not load these declarations for the project.
- Keep functions typed as `Bluebird<T>` until the point where you intentionally want the narrower native `Promise<T>` surface.
- Call `Bluebird.config({ cancellation: true })` before Bluebird promises are already in use.
- Use `reflect()` instead of `Promise.settle()` for new code.
- `BLUEBIRD_DEBUG`, `BLUEBIRD_WARNINGS`, `BLUEBIRD_LONG_STACK_TRACES`, and `BLUEBIRD_W_FORGOTTEN_RETURN` change runtime diagnostics only; they do not affect the type system.

## Official Sources

- https://www.npmjs.com/package/@types/bluebird
- https://www.npmjs.com/package/bluebird
- https://github.com/petkaantonov/bluebird
