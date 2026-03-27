---
name: debug
description: "TypeScript declarations for the debug runtime package, including typed loggers, namespace control, and formatter extension"
metadata:
  languages: "typescript"
  versions: "4.1.12"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,debug,logging,npm,types,definitelytyped"
---

# debug TypeScript Guide

`@types/debug` provides the TypeScript declarations for the `debug` runtime package. Use it when your project creates namespaced loggers with `debug("app:http")`, enables them through `DEBUG`, and wants typed access to helpers such as `enable()`, `disable()`, `extend()`, and `formatters`.

This package only ships `.d.ts` files. Install the `debug` runtime separately.

## Install

Install the runtime package and the declarations together:

```bash
npm install debug
npm install --save-dev @types/debug
```

`@types/debug@4.1.12` depends on `@types/ms` and declares `typeScriptVersion: "4.5"`, so use TypeScript 4.5 or newer.

No authentication or service initialization is required. In Node.js, logging is usually controlled with the `DEBUG` environment variable:

```bash
DEBUG=app:* node dist/server.js
DEBUG=app:*,-app:sql node dist/server.js
```

PowerShell uses different syntax:

```powershell
$env:DEBUG = "app:*,-app:sql"
node dist/server.js
```

## Import `debug` In TypeScript

The declaration file uses `export = debug`, so the configuration-independent import style is:

```ts
import debug = require("debug");
```

If your `tsconfig.json` enables `esModuleInterop`, a default import also works:

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

```ts
import debug from "debug";
```

Use the `import = require()` form when you want the same code to work without TypeScript interop flags.

## Create Namespaced Loggers

```ts
import debug = require("debug");

const httpLog = debug("app:http");
const workerLog = debug("app:worker");

httpLog("starting server on port %d", 3000);
workerLog("picked job %O", { id: "job_123", state: "queued" });
```

Calling `debug(namespace)` returns a `debug.Debugger`. The logger itself is a callable function, and the type surface also includes properties such as `enabled`, `namespace`, `color`, `log`, `extend()`, and `destroy()`.

## Pass Typed Loggers Through Your Code

```ts
import debug = require("debug");

type Logger = debug.Debugger;

export function runJob(log: Logger, jobId: string, payload: unknown) {
  if (!log.enabled) {
    return;
  }

  log("running %s with payload %O", jobId, payload);
}

const jobsLog = debug("app:jobs");
runJob(jobsLog, "job_123", { priority: "high" });
```

Checking `log.enabled` before building expensive debug data is the main typed integration boundary most applications need.

## Enable, Disable, And Restore Namespaces

```ts
import debug = require("debug");

const jobsLog = debug("app:jobs");
const sqlLog = debug("app:sql");

debug.enable("app:*,-app:sql");

jobsLog("visible");
sqlLog("hidden");

const previousNamespaces = debug.disable();

debug.enable(previousNamespaces);
jobsLog("visible again");
```

`debug.enable()` replaces the current namespace configuration; it does not merge with the existing `DEBUG` value. `debug.disable()` returns a namespace string that you can store and re-enable later.

## Extend A Namespace

```ts
import debug = require("debug");

const authLog = debug("app:auth");
const signLog = authLog.extend("sign");
const loginLog = authLog.extend("login");

authLog("starting auth flow");
signLog("signing token for %s", "user_123");
loginLog("login accepted for %s", "user_123");
```

`extend()` keeps the parent's output function and creates a child namespace such as `app:auth:sign`.

## Add Custom Formatters

```ts
import debug = require("debug");

debug.formatters.k = (value: { kind: string }) => value.kind;

const log = debug("app:cache");
log("event=%k", { kind: "miss" });
```

The type definition models `debug.formatters` as a string-keyed map of functions that return strings. Use this when you want a project-specific placeholder such as `%k`.

## Browser Usage

In browsers, `debug` persists the enabled namespaces in `localStorage`. Set `localStorage.debug` before reloading the page:

```ts
localStorage.debug = "app:*";
```

The factory and `Debugger` types are the same, but enabling output happens through browser storage instead of a shell environment variable.

## Common Pitfalls

- Install `debug` as well as `@types/debug`; the `@types` package does not include runtime JavaScript.
- Prefer `import debug = require("debug")` unless your compiler is explicitly configured for default-import interop.
- `debug.enable()` overwrites the current namespace list instead of adding to it.
- `debug.destroy()` is still present in the type surface, but the runtime marks it deprecated and it no longer does anything.
- Custom formatter functions must return strings.
- `DEBUG_COLORS`, `DEBUG_DEPTH`, `DEBUG_HIDE_DATE`, and `DEBUG_SHOW_HIDDEN` change Node.js formatting behavior.

## Official Sources

- https://www.npmjs.com/package/@types/debug
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/debug
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/debug/index.d.ts
- https://www.npmjs.com/package/debug
- https://github.com/debug-js/debug/blob/master/README.md
- https://github.com/debug-js/debug/blob/master/src/common.js
- https://github.com/debug-js/debug/blob/master/src/node.js
