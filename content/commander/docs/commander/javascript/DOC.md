---
name: commander
description: "Commander.js for building Node.js command-line interfaces with options, arguments, subcommands, help, and executable subcommands."
metadata:
  languages: "javascript"
  versions: "14.0.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "commander,cli,node,javascript,arguments,options"
---

# Commander.js Guide for JavaScript CLIs

## Golden Rule

Use the official `commander` package to define your CLI surface: command name, arguments, options, help text, and subcommands.

Commander does not need API credentials or client setup. Your app creates a `Command`, declares the interface, and calls `.parse()` or `.parseAsync()`.

For small scripts, `program` is fine. For reusable modules, tests, or larger CLIs, prefer `new Command()` so you do not share global state.

## Install

Commander 14 is intended for current Node.js releases. The published package metadata for the 14.x line requires Node.js 20 or newer.

```bash
npm install commander@14.0.3
```

If you are publishing a CLI, expose an executable through `package.json` and add a Node shebang to the entry file.

```json
{
  "name": "acme-cli",
  "type": "module",
  "bin": {
    "acme": "./bin/acme.js"
  }
}
```

```js
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program.name('acme').version('1.0.0');
program.parse();
```

Make the file executable before publishing:

```bash
chmod +x bin/acme.js
```

## Imports and Initialization

### ECMAScript modules

```js
import { Command, InvalidArgumentError, Option } from 'commander';

const program = new Command();
```

### CommonJS

```js
const { Command, InvalidArgumentError, Option } = require('commander');

const program = new Command();
```

### Quick single-file program

For short scripts, Commander also exports a shared `program` object.

```js
import { program } from 'commander';

program
  .name('hello')
  .argument('<name>')
  .action((name) => {
    console.log(`hello ${name}`);
  });

program.parse();
```

## Common Workflows

### Parse arguments and options

Use `.argument()` for positional arguments and `.option()` or `.requiredOption()` for flags. Read parsed values with `.opts()` or from the action handler.

```js
#!/usr/bin/env node
import { Command, InvalidArgumentError, Option } from 'commander';

function parseInteger(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new InvalidArgumentError('Expected an integer.');
  }
  return parsed;
}

const program = new Command();

program
  .name('bundle')
  .description('Bundle a project for deployment')
  .version('1.0.0')
  .argument('<entry>', 'entry file to bundle')
  .requiredOption('-c, --config <path>', 'path to config file')
  .option('-w, --watch', 'rebuild when files change')
  .option('--no-color', 'disable ANSI colors')
  .addOption(
    new Option('-p, --port <number>', 'preview server port')
      .env('PORT')
      .argParser(parseInteger)
      .default(3000)
  )
  .showHelpAfterError()
  .action((entry, options, command) => {
    if (options.watch) {
      console.error(`watch mode enabled for ${command.name()}`);
    }

    console.log({
      entry,
      config: options.config,
      port: options.port,
      watch: options.watch,
      color: options.color,
    });
  });

program.parse();
```

Example invocations:

```bash
PORT=8080 node bin/bundle.js src/index.js --config bundler.config.json
node bin/bundle.js src/index.js --config bundler.config.json --watch --no-color
```

Notes:

- `--no-color` creates `options.color` and sets it to `false` when present.
- Multi-word flags like `--template-engine` become camel-cased keys such as `options.templateEngine`.
- `.parse()` with no arguments defaults to `process.argv`.

### Define subcommands in one process

Use `.command()` with `.action()` when all commands live in the same file or module tree.

```js
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('acme')
  .description('Project automation CLI')
  .version('1.0.0');

program
  .command('build')
  .description('build the current project')
  .option('--watch', 'rebuild on changes')
  .action((options) => {
    console.log('build', { watch: options.watch });
  });

program
  .command('deploy')
  .description('deploy the current project')
  .argument('<environment>', 'target environment')
  .option('--tag <name>', 'release tag')
  .action((environment, options, command) => {
    console.log(command.name(), { environment, tag: options.tag });
  });

program.parse();
```

Action handlers receive declared command arguments first, then the parsed options object, and then the command object itself.

### Use async actions

If any action handler is async, call `.parseAsync()` instead of `.parse()`.

```js
#!/usr/bin/env node
import { Command } from 'commander';

async function deploy(environment, options) {
  await Promise.resolve();
  console.log(`deploying to ${environment}`, { tag: options.tag });
}

async function main() {
  const program = new Command();

  program
    .name('acme')
    .command('deploy')
    .argument('<environment>')
    .option('--tag <name>')
    .action(deploy);

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### Use stand-alone executable subcommands

If you pass a description as the second argument to `.command()`, Commander treats the subcommand as a separate executable.

Top-level CLI:

```js
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('pm')
  .version('1.0.0')
  .executableDir('commands')
  .command('install [packageNames...]', 'install one or more packages')
  .command('search [query]', 'search packages');

program.parse(process.argv);
```

`commands/pm-install.js`:

```js
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .argument('[packageNames...]')
  .option('--save-dev', 'install as a development dependency')
  .action((packageNames, options) => {
    console.log('install', { packageNames, saveDev: options.saveDev });
  });

program.parse(process.argv);
```

Commander looks for files named from the command and subcommand, such as `pm-install` and `pm-search`, and also tries common file extensions like `.js`.

### Customize help and error output

Commander generates help automatically from your command definitions. Add examples or follow-up instructions with `.addHelpText()` and show extra guidance after usage errors with `.showHelpAfterError()`.

```js
import { Command } from 'commander';

const program = new Command();

program
  .name('acme')
  .option('-f, --force', 'skip confirmation')
  .showHelpAfterError('(run with --help for usage details)')
  .addHelpText(
    'after',
    `
Examples:
  $ acme deploy production --tag 2026.03.13
  $ acme build --watch
`
  );

program.parse();
```

If you need Commander-style failures from your own validation, call `.error()`.

```js
import { Command } from 'commander';

const program = new Command();

program
  .requiredOption('--config <path>')
  .action((options, command) => {
    if (!options.config.endsWith('.json')) {
      command.error('Config file must end with .json');
    }
  });

program.parse();
```

### Control parsing rules for wrapper CLIs

Commander is strict by default: unknown options, missing arguments, and excess arguments produce errors.

Use these methods when you are building a wrapper around another tool:

- `.enablePositionalOptions()` to stop looking for parent-command options after a subcommand starts.
- `.passThroughOptions()` to leave later options for the wrapped command instead of consuming them.
- `.allowUnknownOption()` when unknown flags should be treated as normal arguments.
- `.allowExcessArguments()` when the wrapped command accepts more arguments than Commander knows about.

## Common Pitfalls

- Use `await program.parseAsync(...)` if any action handler is async. `program.parse()` does not wait for async handlers.
- Prefer `program.opts()` or the `options` parameter passed to `.action()`. Storing parsed options as direct properties on the command is legacy behavior.
- If you use `.passThroughOptions()` on a subcommand, enable positional options on the parent command too.
- When invoking a CLI through `npm run`, use `--` so npm stops parsing flags before they reach Commander: `npm run cli -- --help`.
- Stand-alone executable subcommands need executable files with the expected names and a Node shebang.
- Options with required values are greedy. If you want a flag that may be present with or without a value, declare it with square brackets such as `--cache [path]`.

## Version Notes

- This guide targets `commander@14.0.3`.
- Commander 14 uses `.opts()` as the normal way to read parsed option values.
- The official package metadata for the 14.x line publishes both CommonJS and ESM entry points, as well as bundled TypeScript declaration files.
- For rare option and argument cases, use explicit `Option` and `Argument` objects instead of only the shortcut string forms.

## Official Sources

- https://github.com/tj/commander.js#readme
- https://github.com/tj/commander.js/tree/master/examples
- https://github.com/tj/commander.js/tree/master/docs
- https://www.npmjs.com/package/commander
