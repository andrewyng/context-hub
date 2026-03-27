---
name: picocolors
description: "Minimal ANSI color formatting helpers for Node.js CLIs and browser-safe string formatting"
metadata:
  languages: "javascript"
  versions: "1.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "picocolors,cli,terminal,ansi,colors"
---

# picocolors for JavaScript

`picocolors` is a tiny formatting library for terminal output. It does not create a client, open a connection, or require authentication — you import it and call formatter functions directly.

## Install

```bash
npm install picocolors
```

The published package includes CommonJS entrypoints, TypeScript declarations, and a browser build.

## Import and basic usage

ESM:

```javascript
import pc from "picocolors";

console.log(pc.green("Build succeeded"));
console.log(pc.bold(pc.blue("server started")));
console.log(pc.yellow(`warning: ${pc.underline("check config")}`));
```

CommonJS:

```javascript
const pc = require("picocolors");

console.log(pc.red("Build failed"));
```

Nested formatting is supported:

```javascript
import pc from "picocolors";

console.log(pc.green(`How are ${pc.italic("you")} doing?`));
```

## Initialization and color control

The default export includes two things you will use most often:

- `pc.isColorSupported` — boolean flag computed when the module loads
- `pc.createColors(enabled?)` — returns a formatter set with colors enabled or disabled

If you want explicit control instead of environment-based auto-detection, create your own formatter set:

```javascript
import pc from "picocolors";

const colors = pc.createColors(process.stdout.isTTY);

console.log(colors.cyan("Starting CLI"));
console.log(colors.bold("Ready"));
```

Disable colors completely:

```javascript
import pc from "picocolors";

const colors = pc.createColors(false);

console.log(colors.red("This stays plain text"));
```

Force colors on:

```javascript
import pc from "picocolors";

const colors = pc.createColors(true);

console.log(colors.green("Always emit ANSI colors"));
```

## Environment variables and CLI flags

The default `pc.isColorSupported` value is controlled by process state at import time.

Colors are disabled when either of these is true:

- `NO_COLOR` is set
- `--no-color` appears in `process.argv`

Colors are enabled when colors are not disabled and any of these is true:

- `FORCE_COLOR` is set
- `--color` appears in `process.argv`
- `process.platform === "win32"`
- `process.stdout.isTTY` is truthy and `TERM !== "dumb"`
- `CI` is set

Examples for a Node CLI:

```bash
NO_COLOR=1 node cli.js
FORCE_COLOR=1 node cli.js
node cli.js --no-color
node cli.js --color
```

If your program changes environment variables after import, the default formatter object does not re-evaluate support automatically. In that case, call `pc.createColors(true)` or `pc.createColors(false)` yourself.

## Common CLI patterns

Create shared log helpers once and reuse them across your CLI:

```javascript
import pc from "picocolors";

const colors = pc.createColors();

export function info(message) {
  console.log(`${colors.cyan("info")} ${message}`);
}

export function warn(message) {
  console.warn(`${colors.yellow("warn")} ${message}`);
}

export function fail(message) {
  console.error(`${colors.red(colors.bold("error"))} ${message}`);
}
```

Format values inline without changing surrounding text:

```javascript
import pc from "picocolors";

function renderSummary(fileCount, outDir) {
  return [
    `${pc.green("done")}: processed ${pc.bold(fileCount)} files`,
    `output: ${pc.underline(outDir)}`,
  ].join("\n");
}
```

## Available formatter methods

Text styles:

- `reset`
- `bold`
- `dim`
- `italic`
- `underline`
- `inverse`
- `hidden`
- `strikethrough`

Foreground colors:

- `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`
- `blackBright`, `redBright`, `greenBright`, `yellowBright`, `blueBright`, `magentaBright`, `cyanBright`, `whiteBright`

Background colors:

- `bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`, `bgMagenta`, `bgCyan`, `bgWhite`
- `bgBlackBright`, `bgRedBright`, `bgGreenBright`, `bgYellowBright`, `bgBlueBright`, `bgMagentaBright`, `bgCyanBright`, `bgWhiteBright`

Each formatter accepts `string | number | null | undefined` and returns a string.

## Browser behavior

The published package declares a browser-specific build. In browser bundles, `picocolors` reports `isColorSupported: false`, and formatter functions return plain strings instead of ANSI escape sequences.

That makes it safe to share formatting helpers between Node and browser code when you only need readable text in the browser:

```javascript
import pc from "picocolors";

const label = pc.bold("Status");
const value = pc.green("ok");

console.log(`${label}: ${value}`);
```

## Practical pitfalls

- `picocolors` is only for ANSI styling; it does not provide prompts, spinners, tables, or logging transports.
- Auto-detection happens when the module is loaded, so set `NO_COLOR`, `FORCE_COLOR`, or CLI flags before importing it.
- Use `pc.createColors(false)` for deterministic snapshot tests or machine-readable output.
- Use `pc.createColors(true)` only when you know the output target should receive ANSI escape codes.
