---
name: shelljs
description: "TypeScript declarations for ShellJS's portable Unix-like file, process, environment, and configuration APIs."
metadata:
  languages: "typescript"
  versions: "0.10.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,shelljs,nodejs,build-scripts,shell,types,definitelytyped"
---

# shelljs TypeScript Guide

`@types/shelljs` adds TypeScript declarations for the `shelljs` runtime package.

Use it in Node.js scripts, CLIs, and build tooling that call ShellJS helpers such as `cp`, `exec`, `grep`, `mkdir`, `rm`, `sed`, and `which` from TypeScript.

This package only provides `.d.ts` files. Your code still runs the real `shelljs` package.

## Install

Install the runtime package and the declaration package together:

```bash
npm install shelljs
npm install -D typescript @types/shelljs @types/node
```

If your project already has `shelljs` and TypeScript, add only the missing declarations:

```bash
npm install -D @types/shelljs @types/node
```

Import runtime code from `"shelljs"`, not from `"@types/shelljs"`.

## Initialization

There are no package-specific environment variables, credentials, or client objects to initialize.

The practical setup is your import style and your TypeScript compiler options.

### Import `shelljs`

The maintainer README uses CommonJS `require("shelljs")`. In TypeScript, the lowest-friction typed import form is:

```typescript
import shell = require("shelljs");
```

If your project enables interop for CommonJS default imports, this is also convenient:

```typescript
import shell from "shelljs";
```

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node"],
    "skipLibCheck": false
  }
}
```

If you prefer `import shell = require("shelljs")`, `esModuleInterop` is not required for this package.

## Common Workflows

### Run file and directory commands from a build script

ShellJS exposes synchronous Unix-like helpers as regular Node.js functions.

```typescript
import shell = require("shelljs");

shell.set("-e");

if (!shell.which("git")) {
  shell.echo("This script requires git");
  shell.exit(1);
}

shell.rm("-rf", "dist");
shell.mkdir("-p", "dist/assets");
shell.cp("-R", "public/.", "dist");
shell.cd("dist");

for (const file of shell.ls("*.html")) {
  shell.sed("-i", /BUILD_VERSION/g, process.env.APP_VERSION ?? "dev", file);
}
```

Per the maintainer README, commands run synchronously unless the command documentation says otherwise.

### Run external processes and capture typed output

`exec()` is synchronous by default and returns a `ShellString`-compatible result with `code`, `stdout`, and `stderr`.

```typescript
import shell = require("shelljs");

const result = shell.exec("node --version", { silent: true });

if (result.code !== 0) {
  throw new Error(result.stderr);
}

console.log(result.stdout.trim());
```

For long-running processes, opt in to async mode:

```typescript
import shell = require("shelljs");

const child = shell.exec("npm run watch", {
  async: true,
  silent: true,
});

child.stdout?.on("data", (chunk) => {
  process.stdout.write(chunk);
});
```

The maintainer docs also note that `exec()` runs through `sh` by default, or `cmd.exe` on Windows. If you need Bash-specific behavior, pass the `shell` option explicitly.

### Write files with `ShellString` results

ShellJS commands such as `cat`, `echo`, and `grep` return `ShellString` objects that support `.to()` and `.toEnd()`.

```typescript
import shell = require("shelljs");

shell.cat("README.md").to("dist/README.txt");
shell.echo(`APP_VERSION=${process.env.APP_VERSION ?? "dev"}`).toEnd("dist/.env");
```

Use `.to()` when you want overwrite behavior similar to `>`, and `.toEnd()` when you want append behavior similar to `>>`.

### Control shell configuration and environment variables

ShellJS exposes configuration through `shell.config` and environment variables through `shell.env`, which the README documents as a shortcut to `process.env`.

```typescript
import shell = require("shelljs");

const oldSilent = shell.config.silent;

shell.config.silent = true;
shell.env["NODE_ENV"] = "production";

try {
  shell.exec("node scripts/build.js");
} finally {
  shell.config.silent = oldSilent;
  shell.config.reset();
}
```

This is the main initialization boundary for most TypeScript projects using ShellJS: configure failure or logging behavior once, then run the commands you need.

## Common Pitfalls

- Install `shelljs` as well as `@types/shelljs`; the declaration package does not include the runtime implementation.
- Import from `"shelljs"`, not from `"@types/shelljs"`.
- If you use `import shell from "shelljs"`, enable `esModuleInterop` or `allowSyntheticDefaultImports`; otherwise use `import shell = require("shelljs")`.
- The maintainer README no longer recommends `require("shelljs/global")`; prefer a local import so your TypeScript module scope stays explicit.
- `exec()` is synchronous unless you pass `{ async: true }` or use the callback form.
- `exec()` does not imply Bash semantics; by default it runs through `sh` or `cmd.exe`, so Bash-only syntax should use the `shell` option explicitly.
- If your `tsconfig.json` restricts ambient type packages with `compilerOptions.types`, include `node` there or `process`, `require`, and child-process-related types can appear to disappear.
- If you only need cross-platform shell commands in `package.json` scripts, the ShellJS README points to `shx`; `@types/shelljs` is for the programmatic Node API.

## Official Sources

- https://www.npmjs.com/package/@types/shelljs
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/shelljs
- https://www.npmjs.com/package/shelljs
- https://github.com/shelljs/shelljs
