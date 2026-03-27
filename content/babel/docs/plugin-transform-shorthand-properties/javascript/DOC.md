---
name: plugin-transform-shorthand-properties
description: "Babel plugin for expanding ES2015 object literal shorthand properties and concise methods into explicit object properties during JavaScript builds"
metadata:
  languages: "javascript"
  versions: "7.27.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,transpile,object-literals,es2015"
---

# @babel/plugin-transform-shorthand-properties

`@babel/plugin-transform-shorthand-properties` rewrites ES2015 object literal shorthand into explicit object properties at build time. In `7.27.1`, it expands both shorthand properties such as `{ name }` and concise methods such as `{ greet() {} }`.

This is a compile-time Babel plugin. There are no environment variables, auth steps, or runtime clients to initialize.

## Install

Install the plugin with `@babel/core`:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-shorthand-properties
```

If you run Babel from the command line, install the CLI too:

```bash
npm install --save-dev @babel/cli @babel/core @babel/plugin-transform-shorthand-properties
```

The package declares `@babel/core` as a peer dependency, so install both packages.

## Add the plugin to Babel

Use `babel.config.json` or `.babelrc.json`:

```json
{
  "plugins": ["@babel/plugin-transform-shorthand-properties"]
}
```

In `7.27.1`, this plugin does not expose plugin-specific options. Adding it to `plugins` is enough.

## Run it from the CLI

Transform a source directory:

```bash
npx babel src --out-dir lib --plugins @babel/plugin-transform-shorthand-properties
```

Transform a single file:

```bash
npx babel input.js --out-file output.js --plugins @babel/plugin-transform-shorthand-properties
```

## Transform code programmatically

Use `@babel/core` directly when the transform is part of a script, build tool, or test helper:

```javascript
import { transformSync } from "@babel/core";

const source = `
const name = "Ada";
const obj = {
  name,
  greet() {
    return "Hello, " + name + "!";
  },
};
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: ["@babel/plugin-transform-shorthand-properties"],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

The emitted code has this shape:

```javascript
const name = "Ada";
const obj = {
  name: name,
  greet: function () {
    return "Hello, " + name + "!";
  },
};
```

Only the object literal syntax changes here. Other syntax in the file is left alone unless you add other Babel plugins or presets.

## What the plugin rewrites

This plugin handles two object literal forms:

```javascript
const count = 1;

const input = {
  count,
  increment(step) {
    return count + step;
  },
};
```

After the transform, Babel emits explicit properties:

```javascript
const count = 1;

const input = {
  count: count,
  increment: function (step) {
    return count + step;
  },
};
```

In the implementation for `7.27.1`, async methods and generator methods keep their `async` and `*` behavior when Babel converts them to function-valued properties.

## Important pitfalls

- This plugin only changes build output. It does not polyfill runtime APIs or add browser features.
- It only rewrites object literal shorthand properties and concise methods. If the same files use other newer syntax, add the matching Babel plugins or a preset that covers those features.
- If a file still contains shorthand properties after a build, confirm this plugin is loaded for that file through the active Babel config.
