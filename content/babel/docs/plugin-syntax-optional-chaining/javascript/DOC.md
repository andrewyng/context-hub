---
name: plugin-syntax-optional-chaining
description: "Enable Babel to parse optional chaining syntax without transforming the output"
metadata:
  languages: "javascript"
  versions: "7.8.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,optional-chaining,syntax"
---

# @babel/plugin-syntax-optional-chaining

`@babel/plugin-syntax-optional-chaining` is a syntax-only Babel plugin. It lets Babel parse optional chaining expressions such as `obj?.prop`, `obj?.[key]`, and `fn?.()`.

It does **not** transform that syntax for older runtimes. If your output must run in environments that do not support optional chaining, use `@babel/plugin-transform-optional-chaining` instead.

## Install

Install the plugin with Babel core. Add `@babel/cli` if you want to run Babel from the command line.

```bash
npm install --save-dev @babel/core @babel/plugin-syntax-optional-chaining
```

```bash
yarn add --dev @babel/core @babel/plugin-syntax-optional-chaining
```

Optional CLI dependency:

```bash
npm install --save-dev @babel/cli
```

No environment variables, authentication, or runtime client setup are required.

## Enable the plugin in Babel config

Add the plugin name to your Babel config:

```json
{
  "plugins": ["@babel/plugin-syntax-optional-chaining"]
}
```

In `7.8.3`, this package does not expose user-facing plugin options. Its implementation only enables Babel's `optionalChaining` parser plugin.

## Parse optional chaining from the CLI

Compile a directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-syntax-optional-chaining
```

Compile a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-syntax-optional-chaining
```

This makes Babel accept the syntax, but the emitted code still contains `?.`.

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const source = `
const city = user?.address?.city;
const displayName = getProfile?.().name;
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-syntax-optional-chaining"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

With this plugin alone, Babel parses the file and preserves the optional chaining syntax in the generated code.

## When to use the transform plugin instead

Use `@babel/plugin-syntax-optional-chaining` when you only need Babel to accept the syntax, for example when:

- you ship modern JavaScript and want to keep `?.` in the final output
- another compiler step handles the downlevel transform later
- you are writing a Babel pipeline that needs to parse optional chaining before other plugins run

If you need Babel to rewrite optional chaining into older JavaScript, switch to `@babel/plugin-transform-optional-chaining`:

```json
{
  "plugins": ["@babel/plugin-transform-optional-chaining"]
}
```

You do not need to combine both plugins for the same files. The transform plugin already enables optional chaining parsing.

## Common build setup

`package.json`:

```json
{
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.8.3",
    "@babel/core": "^7.8.3",
    "@babel/plugin-syntax-optional-chaining": "^7.8.3"
  }
}
```

`babel.config.json`:

```json
{
  "plugins": ["@babel/plugin-syntax-optional-chaining"]
}
```

## Important pitfalls

- This plugin only affects parsing. It does not polyfill runtime behavior and does not transpile `?.` away.
- A Babel build can succeed with this plugin while the output still breaks in older Node.js or browsers that do not support optional chaining.
- Install `@babel/core` alongside the plugin; the published package declares Babel core as a peer dependency.
- There are no plugin-specific configuration options in `7.8.3`, so any attempt to tune transform behavior on this plugin has no effect.
- No environment variables or client initialization are involved; all setup happens in your Babel config.

## Version-sensitive notes

- This guide targets `@babel/plugin-syntax-optional-chaining@7.8.3`.
- The published `7.8.3` package declares `@babel/core` peer compatibility as `^7.0.0-0`.
- In `7.8.3`, the plugin implementation asserts Babel 7 and adds `"optionalChaining"` to Babel's parser plugins.
- The published package description for `7.8.3` is `Allow parsing of optional properties`.

## Official sources

- Babel docs: https://babeljs.io/docs/en/next/babel-plugin-syntax-optional-chaining.html
- npm package page: https://www.npmjs.com/package/@babel/plugin-syntax-optional-chaining
- Babel source package: https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-optional-chaining
