---
name: debug
description: "Namespaced debug logging for Node.js and browser JavaScript applications"
metadata:
  languages: "javascript"
  versions: "4.4.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "debug,logging,nodejs,browser,namespaces"
---

# debug for JavaScript

Use `debug` when you want log statements that stay silent until a namespace is enabled. In Node.js, `debug` writes to `stderr` by default. In browsers, the enabled namespace list is persisted in `localStorage`.

## Install

```bash
npm install debug
```

If you want a wider color palette in Node.js terminals, install `supports-color` alongside `debug`:

```bash
npm install debug supports-color
```

## Import and create loggers

CommonJS:

```js
const createDebug = require("debug");

const log = createDebug("myapp");
const httpLog = createDebug("myapp:http");
const dbLog = createDebug("myapp:db");

log("booting");
httpLog("GET /health");
dbLog("connected");
```

ESM:

```js
import createDebug from "debug";

const log = createDebug("myapp");
const httpLog = createDebug("myapp:http");
const dbLog = createDebug("myapp:db");

log("booting");
httpLog("GET /health");
dbLog("connected");
```

Use a stable root namespace for your app or library, then add `:`-separated sub-namespaces for features.

## Enable output

`debug` only prints output for namespaces enabled by `DEBUG`.

```bash
# Exact namespace
DEBUG=myapp node server.js

# Everything under a root namespace
DEBUG=myapp:* node server.js

# Multiple namespaces, comma-separated
DEBUG=myapp:http,myapp:db node server.js

# Exclude noisy namespaces
DEBUG=myapp:*,-myapp:sql node server.js

# Enable everything
DEBUG=* node server.js
```

`DEBUG` also accepts space-delimited names.

Windows examples:

```cmd
set DEBUG=myapp:* & node server.js
```

```powershell
$env:DEBUG = "myapp:*"
node server.js
```

## Organize namespaces with `extend()`

```js
const createDebug = require("debug");

const log = createDebug("myapp");
const authLog = log.extend("auth");
const loginLog = authLog.extend("login");

log("booting");
authLog("starting auth flow");
loginLog("accepted credentials");
```

This produces namespaces like `myapp:auth` and `myapp:auth:login`.

## Enable or disable at runtime

```js
const createDebug = require("debug");

console.log(createDebug.enabled("myapp:db"));

createDebug.enable("myapp:*,-myapp:sql");
console.log(createDebug.enabled("myapp:db"));

const previousNamespaces = createDebug.disable();
createDebug.enable(previousNamespaces);
```

`enable()` replaces the current `DEBUG` selection instead of appending to it. `disable()` returns the currently enabled and skipped namespace string so you can restore it later.

## Avoid expensive formatting when disabled

```js
const createDebug = require("debug");

const sqlLog = createDebug("myapp:sql");

if (sqlLog.enabled) {
  const plan = buildQueryPlan();
  sqlLog("query plan %O", plan);
}
```

Check `logger.enabled` before doing expensive work to build log arguments.

## Format values

`debug` supports printf-style format strings.

```js
const createDebug = require("debug");

const log = createDebug("myapp:worker");

log("job %s started", "sync-users");
log("processed %d records", 42);
log("payload %o", { compact: true });
log("payload %O", { nested: { keepMultiline: true } });
log("json %j", { ok: true });
log("literal %% sign");
```

Supported built-in formatters:

- `%O` pretty-prints objects with multiline output.
- `%o` pretty-prints objects on one line.
- `%s`, `%d`, `%j`, and `%%` behave like standard printf-style tokens.

### Add a custom formatter

```js
const createDebug = require("debug");

createDebug.formatters.h = (value) => value.toString("hex");

const log = createDebug("myapp:hex");
log("packet %h", Buffer.from("hello"));
```

## Browser usage

In browsers, enable namespaces through `localStorage`, then refresh the page.

```js
import createDebug from "debug";

localStorage.debug = "myapp:*";

const log = createDebug("myapp:ui");
log("rendered settings panel");
```

`debug` also checks `localStorage.DEBUG`. In Chromium-based devtools, messages from `debug` are usually visible only when the console's `Verbose` level is enabled.

## Node.js environment variables

Common environment variables:

```bash
DEBUG=myapp:* DEBUG_COLORS=1 node server.js
DEBUG=myapp:* DEBUG_HIDE_DATE=1 node server.js
DEBUG=myapp:* DEBUG_DEPTH=4 DEBUG_SHOW_HIDDEN=1 node server.js
```

- `DEBUG` enables or disables namespaces.
- `DEBUG_COLORS` forces color output on or off.
- `DEBUG_HIDE_DATE` removes the ISO timestamp from non-TTY output.
- `DEBUG_DEPTH` controls object inspection depth.
- `DEBUG_SHOW_HIDDEN` includes non-enumerable properties in inspected objects.

For `%o` and `%O`, `debug` maps `DEBUG_*` variables to Node.js `util.inspect()` options, so additional `DEBUG_...` keys can change object formatting as long as they match a supported inspect option.

## Send output somewhere else

In Node.js, `debug` writes to `stderr` by default. Override the log function per namespace or globally if you need stdout or a custom sink.

```js
const createDebug = require("debug");

const log = createDebug("myapp:stdout");
log.log = console.log.bind(console);
log("this goes to stdout");

createDebug.log = console.info.bind(console);

const anotherLog = createDebug("myapp:info");
anotherLog("this now goes through console.info");
```

Bind `console.log` or `console.info` so the console method keeps the correct receiver.

## Child processes

If a child process pipes `stderr`, colors are usually suppressed unless you force them on.

```js
const { fork } = require("node:child_process");

const worker = fork("./worker.js", [], {
  stdio: [0, "pipe", "pipe", "ipc"],
  env: {
    ...process.env,
    DEBUG: "myapp:*",
    DEBUG_COLORS: "1",
  },
});

worker.stderr.pipe(process.stderr, { end: false });
```

## Important notes

- Namespace matching is exact unless you use `*` wildcards or `-namespace` exclusions.
- In browsers, changing `localStorage.debug` does not affect the current page until reload.
- `debug.destroy()` is deprecated and currently does nothing.
- A namespace you create with a trailing `*` is always enabled, regardless of `DEBUG`.
