---
name: commander
description: "TypeScript declarations for legacy Commander.js CLIs, including CommonJS imports, option parsing, subcommands, and practical typing boundaries."
metadata:
  languages: "typescript"
  versions: "2.12.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,commander,cli,node,types,definitelytyped"
---

# Commander TypeScript Guide

## Golden Rule

Install `@types/commander` only for legacy `commander` runtimes that do not already ship their own TypeScript declarations.

`@types/commander@2.12.5` is a declaration-only package. Your app still imports and runs the real `commander` package at runtime. The type package gives TypeScript definitions for the legacy CommonJS API shape exported by `commander`.

If your installed `commander` package already publishes its own `types` or `typings`, prefer the bundled declarations from the runtime package instead of adding `@types/commander`.

## Install

For a legacy Commander 2.x CLI, install the runtime package, TypeScript, Node.js types, and this declaration package together.

```bash
npm install commander@2
npm install -D typescript @types/commander@2.12.5 @types/node
```

If `commander` is already in the project, add only the missing declaration packages:

```bash
npm install -D @types/commander@2.12.5 @types/node
```

There are no environment variables, credentials, or client objects to configure.

## Initialization

### Use the `export =` import form

These declarations export the module with `export = commander`, so the most portable TypeScript import is:

```ts
import commander = require("commander");

const program = commander;
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import may also work:

```ts
import commander from "commander";

const program = commander;
```

For legacy CLI code that must compile across different compiler settings, prefer `import commander = require("commander")`.

### Recommended `tsconfig.json`

Use CommonJS module output unless you already have a different Node.js build setup.

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": false,
    "skipLibCheck": false
  }
}
```

If your project restricts ambient types with `compilerOptions.types`, include both `node` and `commander`:

```json
{
  "compilerOptions": {
    "types": ["node", "commander"]
  }
}
```

## Common Workflows

### Parse top-level options

The legacy declarations model Commander as a mutable command object. After `.parse(process.argv)`, option values are available as properties on `program`.

```ts
import commander = require("commander");

const program = commander;

program
  .version("1.0.0")
  .option("-c, --config <path>", "path to config file")
  .option("-d, --debug", "enable debug logging")
  .option("--dry-run", "print work without changing anything")
  .option("--no-color", "disable ANSI colors")
  .parse(process.argv);

const configPath = program.config as string | undefined;
const debug = Boolean(program.debug);
const dryRun = Boolean(program.dryRun);
const colorEnabled = Boolean(program.color);

console.log({ configPath, debug, dryRun, colorEnabled, args: program.args });
```

Flag names from long options become properties on the command object. For example:

- `--dry-run` becomes `program.dryRun`
- `--no-color` controls `program.color`

### Define subcommands

Subcommands return another `Command` instance, so you can attach command-specific options and an action handler.

```ts
import commander = require("commander");

const program = commander;

program.version("1.0.0");

program
  .command("deploy <env>")
  .description("deploy the current build")
  .option("-t, --tag <name>", "release tag")
  .option("--force", "skip confirmation")
  .action((env: string, cmd: commander.Command) => {
    const tag = cmd.tag as string | undefined;
    const force = Boolean(cmd.force);

    console.log(`deploying to ${env}`, { tag, force });
  });

program.parse(process.argv);
```

In this API family, the action handler receives declared command arguments first, followed by the command object for command-specific options.

### Create an isolated `Command` instance

Use `commander.Command` when you want to build a CLI in a separate module instead of mutating the shared default export.

```ts
import commander = require("commander");

const cli = new commander.Command("acme");

cli
  .version("1.0.0")
  .usage("[options] <file>")
  .option("-o, --output <path>", "write output to a file")
  .action((file: string) => {
    console.log("processing", file);
  });

cli.parse(process.argv);
```

This pattern is useful when you export a configured CLI from a library module or when you want to avoid sharing global state between tests.

### Read parsed options through your own interface

The legacy declarations intentionally allow dynamic properties with `[key: string]: any`. That matches how Commander 2.x stores option values, but it does not give strong inference for specific flags.

Define your own interface at the boundary where you read parsed options:

```ts
import commander = require("commander");

type CliOptions = {
  config?: string;
  debug?: boolean;
  dryRun?: boolean;
};

const program = commander;

program
  .option("-c, --config <path>", "path to config file")
  .option("-d, --debug", "enable debug logging")
  .option("--dry-run", "print work without changing anything")
  .parse(process.argv);

const options = program.opts() as CliOptions;

if (options.debug) {
  console.log("debug mode enabled");
}
```

Use the same approach for subcommands if you want a small, explicit typed surface in the rest of your code.

### Show help when no arguments were passed

The legacy API exposes `.outputHelp()` to print usage without exiting and `.help()` to print usage and exit immediately.

```ts
import commander = require("commander");

const program = commander;

program
  .version("1.0.0")
  .option("-f, --force", "skip confirmation")
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
```

You can also customize help output with the built-in `--help` event:

```ts
program.on("--help", () => {
  console.log("");
  console.log("Examples:");
  console.log("  $ acme deploy production --tag 2026.03.13");
});
```

## Common Pitfalls

- Install `commander` as well as `@types/commander`; the `@types` package does not include runtime JavaScript.
- Prefer `import commander = require("commander")` unless your compiler is explicitly configured for synthetic default imports.
- Add `@types/node` because the declarations depend on Node.js types such as `NodeJS.EventEmitter`.
- If `tsconfig.json` sets `compilerOptions.types`, include `commander` there or TypeScript will not load the package declarations.
- Expect weak option inference: these declarations expose dynamic option properties and `opts(): { [key: string]: any }`, so define your own interface when you cross from CLI parsing into application logic.
- Check the runtime package before adding this dependency. Current Commander releases publish declaration files in the runtime package metadata, so `@types/commander` is mainly for older projects.

## Version Notes

- This guide covers `@types/commander@2.12.5`, which matches the older CommonJS-style Commander API family used with legacy CLI code.
- The legacy declaration shape exports a singleton command object plus constructors such as `commander.Command` and `commander.Option`.
- Newer Commander releases have evolved beyond this older typing model and may expose different import styles and stronger built-in typings.

## Official Sources

- https://www.npmjs.com/package/@types/commander
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/commander
- https://www.npmjs.com/package/commander
- https://github.com/tj/commander.js
