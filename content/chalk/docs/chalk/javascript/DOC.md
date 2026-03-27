---
name: chalk
description: "Chalk for styling terminal output in JavaScript CLIs with ANSI colors, modifiers, color detection, and stderr-aware output."
metadata:
  languages: "javascript"
  versions: "5.6.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "chalk,cli,terminal,ansi,node,javascript"
---

# Chalk Guide for JavaScript CLIs

## Golden Rule

Use `chalk` to format terminal strings, then pass the returned string to `console.log`, `console.error`, `process.stdout.write`, or your logger.

Chalk does not need API credentials or service configuration. It auto-detects terminal color support from the current environment.

Chalk `5.6.2` is ESM-only. Use `import chalk from 'chalk'` in an ESM package or an `.mjs` file.

## Install

Chalk `5.6.2` declares these supported Node.js versions:

- `^12.17.0 || ^14.13 || >=16.0.0`

Install the package:

```bash
npm install chalk@5.6.2
```

If your project is not already ESM, set `"type": "module"` in `package.json`:

```json
{
  "type": "module",
  "dependencies": {
    "chalk": "5.6.2"
  }
}
```

Minimal usage:

```js
import chalk from 'chalk';

console.log(chalk.green('ready'));
```

## Imports and Initialization

Default import:

```js
import chalk from 'chalk';
```

Named exports you will commonly use:

```js
import chalk, {
  Chalk,
  chalkStderr,
  supportsColor,
  supportsColorStderr,
  modifierNames,
  foregroundColorNames,
} from 'chalk';
```

There is no client initialization step unless you want a separate Chalk instance with its own color level:

```js
import {Chalk} from 'chalk';

const noColor = new Chalk({level: 0});
const basicColor = new Chalk({level: 1});
const fullColor = new Chalk({level: 3});

console.log(noColor.red('plain text output'));
console.log(fullColor.hex('#FF8800')('accent color'));
```

Prefer a new `Chalk` instance inside reusable libraries instead of mutating `chalk.level` globally.

## Color Control

Chalk reads color support automatically, but users can override it with flags or environment variables.

Supported overrides:

- `--color`
- `--no-color`
- `--color=256`
- `--color=16m`
- `FORCE_COLOR=0`
- `FORCE_COLOR=1`
- `FORCE_COLOR=2`
- `FORCE_COLOR=3`

Examples:

```bash
FORCE_COLOR=0 node cli.js
FORCE_COLOR=3 node cli.js
node cli.js --no-color
node cli.js --color=256
node cli.js --color=16m
```

`FORCE_COLOR` overrides Chalk's normal color detection.

## Common Workflows

### Style terminal output

Chain styles and call the last one with a string. Multiple arguments are joined with spaces.

```js
import chalk from 'chalk';

console.log(chalk.blue('Hello world!'));
console.log(chalk.blue.bgRed.bold('Build failed'));
console.log(chalk.red('Error:', 'missing config file'));
```

Style order does not matter, and later conflicting styles win:

```js
import chalk from 'chalk';

console.log(chalk.red.yellow.green('final color is green'));
```

### Compose reusable styles

```js
import chalk from 'chalk';

const error = chalk.bold.red;
const warning = chalk.hex('#FFA500');
const success = chalk.green;

console.log(error('Error: invalid token'));
console.log(warning('Warning: using fallback config'));
console.log(success('Done'));
```

### Nest styles

Nested substrings are re-opened correctly, so you can mix accent text inside a broader style.

```js
import chalk from 'chalk';

console.log(
  chalk.green(
    'Deploying ' + chalk.blue.underline('api-service') + ' to production'
  )
);
```

### Use RGB, hex, and 256-color values

Use color-model helpers when named colors are not enough.

```js
import chalk from 'chalk';

console.log(chalk.rgb(123, 45, 67).underline('custom RGB'));
console.log(chalk.hex('#DEADED').bold('custom hex'));
console.log(chalk.ansi256(201)('palette index 201'));

console.log(chalk.bgRgb(20, 20, 20).white('dark background'));
console.log(chalk.bgHex('#222222').cyan('hex background'));
console.log(chalk.bgAnsi256(236).white('256-color background'));
```

Chalk downsamples RGB and hex colors to the best format supported by the current terminal, or by the `level` you set on a custom instance.

### Branch on terminal color support

`supportsColor` is exposed for convenience. It is either `false` or an object with `level`, `hasBasic`, `has256`, and `has16m`.

```js
import chalk, {supportsColor} from 'chalk';

const accent = supportsColor?.has16m
  ? chalk.hex('#FF8800')
  : chalk.yellow;

console.log(accent('Deploying application'));
```

### Use a stderr-specific Chalk instance

If you write directly to `stderr`, use `chalkStderr` so detection is based on the `stderr` stream.

```js
import {chalkStderr, supportsColorStderr} from 'chalk';

if (supportsColorStderr) {
  process.stderr.write(chalkStderr.red('fatal: build failed\n'));
} else {
  process.stderr.write('fatal: build failed\n');
}
```

### Show cosmetic output only when color is enabled

`visible` returns an empty string when Chalk's color level is `0`.

```js
import chalk from 'chalk';

console.log(`${chalk.visible('✔')} build finished`);
```

### Validate user-provided style names

Use the exported style-name arrays when you accept style names from config or CLI flags.

```js
import chalk, {foregroundColorNames, modifierNames} from 'chalk';

function paint(text, colorName, modifierName) {
  if (!foregroundColorNames.includes(colorName)) {
    throw new Error(`Unsupported foreground color: ${colorName}`);
  }

  if (!modifierNames.includes(modifierName)) {
    throw new Error(`Unsupported modifier: ${modifierName}`);
  }

  return chalk[modifierName][colorName](text);
}

console.log(paint('release', 'green', 'bold'));
```

## Important Behavior and Pitfalls

- Chalk `5` is ESM-only. Do not use `require('chalk')` for this version.
- Upstream notes that if you need Chalk in TypeScript or a build-tool setup that cannot consume the ESM package cleanly, you will probably want Chalk `4` instead.
- `chalk.level` on the default export affects all Chalk consumers in the current process. Prefer `new Chalk({level})` in shared libraries.
- Some modifiers are not widely supported across terminals: `italic`, `underline`, `overline`, and `strikethrough`.
- `chalkStderr` and `supportsColorStderr` can differ from `chalk` and `supportsColor` because `stdout` and `stderr` are detected separately.
- On Windows, the upstream README recommends Windows Terminal instead of `cmd.exe`.

## Reference Pattern

This is a practical starting point for a Node.js CLI that respects the user's terminal settings:

```js
#!/usr/bin/env node
import chalk, {Chalk, supportsColor} from 'chalk';

const plain = new Chalk({level: 0});

function info(message) {
  console.log(chalk.blue(message));
}

function warn(message) {
  console.warn(chalk.hex('#FFA500')(message));
}

function fail(message) {
  console.error(chalk.bold.red(message));
}

info('Starting deploy');

if (supportsColor?.has16m) {
  console.log(chalk.hex('#7C3AED')('Truecolor output enabled'));
} else {
  console.log(plain('Limited terminal color support'));
}

warn('Using default region');
fail('Deployment failed');
```
