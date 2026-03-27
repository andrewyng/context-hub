---
name: yargs
description: "yargs for JavaScript CLIs with options, subcommands, config files, and environment-variable parsing"
metadata:
  languages: "javascript"
  versions: "18.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "yargs,javascript,cli,nodejs,arguments,commands"
---

# yargs Guide (JavaScript)

`yargs` builds Node.js command-line interfaces by parsing arguments, generating help output, and organizing subcommands.

Use it for local CLIs, build tools, and automation scripts where you want explicit option definitions instead of reading `process.argv` by hand.

## Install

```bash
npm install yargs
```

No package-specific authentication or service initialization is required.

No package-specific environment variables are required unless you choose to map options from the environment with `.env(prefix)`.

## Initialize yargs

### ESM

```js
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const cli = yargs(hideBin(process.argv));
```

`hideBin(process.argv)` removes the Node executable and script path before parsing.

### CommonJS

```js
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const cli = yargs(hideBin(process.argv));
```

## Parse Options

Define each option explicitly, then parse once:

```js
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
    choices: ["json", "yaml"],
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

Use `.strict()` when you want unknown flags to fail instead of being ignored.

Use `.parseSync()` only when your builders, handlers, and middleware are synchronous.

## Add Commands And Positionals

For multi-command CLIs, register commands with their own positionals and options:

```js
#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

async function startServer(port) {
  console.log(`listening on ${port}`);
}

await yargs(hideBin(process.argv))
  .scriptName("devserver")
  .command(
    "serve [port]",
    "Start the server",
    (cli) =>
      cli
        .positional("port", {
          describe: "Port to bind on",
          default: 5000,
          type: "number",
        })
        .option("verbose", {
          alias: "v",
          type: "boolean",
          default: false,
          describe: "Enable verbose logging",
        }),
    async (argv) => {
      if (argv.verbose) {
        console.info(`starting on :${argv.port}`);
      }

      await startServer(argv.port);
    }
  )
  .demandCommand(1)
  .strictCommands()
  .strictOptions()
  .recommendCommands()
  .help()
  .parseAsync();
```

Use `.demandCommand(1)` when the CLI should require at least one subcommand.

Use `.recommendCommands()` if you want help output to suggest close matches for mistyped commands.

## Use Async Handlers Correctly

If any command handler, builder, or middleware is asynchronous, parse with `.parseAsync()`:

```js
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

async function deploy(target) {
  console.log(`deploying ${target}`);
}

await yargs(hideBin(process.argv))
  .command(
    "deploy <target>",
    "Deploy an environment",
    (cli) =>
      cli.positional("target", {
        type: "string",
        describe: "Environment name",
      }),
    async (argv) => {
      await deploy(argv.target);
    }
  )
  .help()
  .parseAsync();
```

`parseSync()` throws if you use it with asynchronous builders, handlers, or middleware.

## Load Values From A JSON Config File And Environment Variables

Use `.config()` for a JSON config file option and `.env()` for prefixed environment variables:

```js
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .option("region", {
    type: "string",
    describe: "Deployment region",
  })
  .option("profile", {
    type: "string",
    describe: "Named credentials profile",
  })
  .config("config")
  .env("DEPLOY")
  .strict()
  .help()
  .parseSync();

console.log(argv.region);
console.log(argv.profile);
```

Example JSON config file:

```json
{
  "region": "us-east-1",
  "profile": "prod"
}
```

Example shell invocation:

```bash
DEPLOY_PROFILE=staging node cli.js --config ./deploy.json
```

With `.env("DEPLOY")`, option names map to environment variables such as `DEPLOY_REGION` and `DEPLOY_PROFILE`.

## Validate And Normalize Input

Use yargs validation helpers instead of ad hoc checks after parsing:

```js
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .option("input", {
    type: "string",
    describe: "Input file",
  })
  .option("output", {
    type: "string",
    describe: "Output file",
  })
  .option("stdout", {
    type: "boolean",
    default: false,
    describe: "Write to standard output",
  })
  .option("retries", {
    type: "number",
    default: 3,
    describe: "Retry count",
  })
  .conflicts("stdout", "output")
  .implies("output", "input")
  .coerce("retries", (value) => {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("--retries must be a non-negative integer");
    }

    return value;
  })
  .check((parsedArgv) => {
    if (!parsedArgv.input && !parsedArgv.stdout) {
      return "Provide --input or set --stdout";
    }

    return true;
  })
  .strict()
  .help()
  .parseSync();

console.log(argv);
```

This keeps validation next to the option definitions, which is usually easier to maintain than validating after parsing.

## Common Pitfalls

- Pass `hideBin(process.argv)` to `yargs()` in Node CLI entrypoints instead of handing raw `process.argv` to the parser.
- Use `.parseAsync()` whenever any builder, handler, or middleware returns a promise.
- Add `.strict()`, `.strictCommands()`, or `.strictOptions()` when typos should fail fast.
- `.config("config")` is documented as a JSON config file option; use that default shape unless you deliberately add a custom parser.
- Prefer explicit `.parseSync()` or `.parseAsync()` in application code when you want a clear parse point, rather than relying on implicit parsing.

## Official Sources

- https://yargs.js.org/
- https://yargs.js.org/docs/
- https://www.npmjs.com/package/yargs
- https://github.com/yargs/yargs
