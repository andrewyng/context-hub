---
name: yargs
description: "TypeScript definitions for yargs command parsers, option builders, and command modules"
metadata:
  languages: "typescript"
  versions: "17.0.35"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,yargs,cli,arguments,types"
---

# yargs TypeScript Guide

`@types/yargs` adds TypeScript declarations for the `yargs` runtime package. Install it when your application or CLI imports `yargs` or `yargs/helpers` and you want typed option builders, typed command handlers, and typed parsed arguments.

This package only provides `.d.ts` files. It does not include the `yargs` runtime.

## Install

Install the runtime package and the type package together:

```bash
npm install yargs
npm install --save-dev typescript @types/yargs @types/node
```

`@types/node` is usually needed in CLI projects because the common entrypoint pattern uses `process.argv`.

No package-specific environment variables, authentication, or service initialization are required.

## Import The Runtime Package, Not The Type Package

Import from `yargs` and `yargs/helpers`:

```ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
```

Do not import from `@types/yargs` directly. The type package is picked up automatically by TypeScript after installation.

`hideBin(process.argv)` is the documented helper for removing the Node executable and script path before parsing arguments.

## Parse Typed Options

Use `option()` calls to describe the CLI interface, then parse once and use the inferred result.

```ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .scriptName("imgtool")
  .usage("$0 --input <file> --format <json|yaml>")
  .option("input", {
    type: "string",
    demandOption: true,
    describe: "Path to the source file",
  })
  .option("format", {
    choices: ["json", "yaml"] as const,
    default: "json",
    describe: "Output format",
  })
  .option("watch", {
    type: "boolean",
    default: false,
    describe: "Rebuild when files change",
  })
  .strict()
  .help()
  .parseSync();

console.log(argv.input);
console.log(argv.format);
console.log(argv.watch);
```

This is the main day-to-day `@types/yargs` workflow: the declarations follow the builder chain so parsed values carry useful TypeScript types into the rest of your CLI code.

## Type Reusable Command Modules

For larger CLIs, model each subcommand as a `CommandModule`.

```ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { CommandModule } from "yargs";

type GlobalFlags = {
  cwd?: string;
};

type BuildFlags = GlobalFlags & {
  outDir: string;
  watch: boolean;
};

const buildCommand: CommandModule<GlobalFlags, BuildFlags> = {
  command: "build",
  describe: "Compile the project",
  builder: (cli) =>
    cli
      .option("cwd", {
        type: "string",
        describe: "Working directory",
      })
      .option("outDir", {
        type: "string",
        demandOption: true,
        describe: "Build output directory",
      })
      .option("watch", {
        type: "boolean",
        default: false,
        describe: "Rebuild on changes",
      }),
  handler: (argv) => {
    console.log(argv.cwd);
    console.log(argv.outDir);
    console.log(argv.watch);
  },
};

yargs(hideBin(process.argv))
  .command(buildCommand)
  .demandCommand(1)
  .strict()
  .help()
  .parseSync();
```

This matters when you split commands across files: `CommandModule` keeps the builder and handler in sync, so required options stay required inside the handler.

## Type Shared Builder Helpers

If you wrap common flags in helper functions, accept and return `Argv<T>` so the fluent builder keeps its generic state.

```ts
import type { Argv } from "yargs";

type CommonFlags = {
  config?: string;
};

function withCommonFlags<T>(cli: Argv<T>) {
  return cli.option("config", {
    type: "string",
    describe: "Path to a config file",
  });
}
```

Use this pattern for local helper modules that add the same options to multiple commands.

## Common Pitfalls

- Install `yargs` as well as `@types/yargs`; the type package does not provide executable code.
- Import from `yargs` and `yargs/helpers`, never from `@types/yargs`.
- Pass `hideBin(process.argv)` to `yargs()` in Node CLI entrypoints instead of parsing raw `process.argv` directly.
- If your project restricts `compilerOptions.types`, keep `node` in that list when your CLI code uses `process.argv` and other Node globals.
- Keep the runtime `yargs` package on the same major line as the type package; `@types/yargs@17.0.35` is written for yargs 17 APIs.

## Official Sources

- https://www.npmjs.com/package/@types/yargs
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/yargs
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/yargs/index.d.ts
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/yargs/helpers.d.ts
- https://www.npmjs.com/package/yargs
- https://yargs.js.org/
