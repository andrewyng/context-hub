---
name: plugin-proposal-decorators
description: "Configure Babel 7 decorators support with the current proposal or legacy mode"
metadata:
  languages: "javascript"
  versions: "7.29.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,javascript,decorators,classes,syntax,proposal"
---

# @babel/plugin-proposal-decorators

`@babel/plugin-proposal-decorators` adds Babel support for JavaScript decorators.

Configuration lives entirely in Babel. There are no environment variables, authentication steps, or runtime clients to initialize.

## Install

Install the plugin with Babel core. Add `@babel/cli` if you want to compile from the command line.

```bash
npm install --save-dev @babel/core @babel/plugin-proposal-decorators
```

Optional CLI dependency:

```bash
npm install --save-dev @babel/cli
```

## Enable the plugin in Babel config

Set the plugin explicitly and choose a decorators version. For new code on Babel `7.29.0`, use `"2023-11"`.

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-decorators",
      {
        "version": "2023-11"
      }
    ]
  ]
}
```

Use that for code shaped like this:

```javascript
function logged(value, context) {
  if (context.kind !== "method") return value;

  return function (...args) {
    console.log(`calling ${String(context.name)}`);
    return value.call(this, ...args);
  };
}

class Service {
  @logged
  run(task) {
    return task.toUpperCase();
  }
}
```

## Compile from the CLI

With a `babel.config.json` file in place:

```bash
npx babel src --out-dir lib
```

Or compile a single file:

```bash
npx babel input.js --out-file output.js
```

## Use it from JavaScript

```javascript
import { transformSync } from "@babel/core";

const source = `
function logged(value, context) {
  if (context.kind !== "method") return value;

  return function (...args) {
    console.log(\`calling \${String(context.name)}\`);
    return value.call(this, ...args);
  };
}

class Service {
  @logged
  run(task) {
    return task.toUpperCase();
  }
}
`;

const result = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: [["@babel/plugin-proposal-decorators", {
    version: "2023-11",
  }]],
});

if (!result?.code) {
  throw new Error("Transform failed");
}

console.log(result.code);
```

## Choose the right decorators version

In Babel `7.29.0`, the plugin supports multiple proposal snapshots plus `legacy` mode.

- Use `"2023-11"` for new code.
- Use `"legacy"` only when you are already committed to Babel's legacy decorators behavior.
- Use older proposal snapshots such as `"2023-05"`, `"2023-01"`, `"2022-03"`, `"2021-12"`, or `"2018-09"` only to match an existing codebase that already depends on that exact proposal version.

Legacy mode looks like this:

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-decorators",
      {
        "version": "legacy"
      }
    ]
  ]
}
```

For codebases that still rely on the older `2018-09` proposal shape, Babel also supports `decoratorsBeforeExport`:

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-decorators",
      {
        "version": "2018-09",
        "decoratorsBeforeExport": true
      }
    ]
  ]
}
```

Avoid `decoratorsBeforeExport` in new configs. Current decorators configs should set `version` directly.

## Common workflow: decorators with class fields

If the same build also transforms class fields, private methods, or related class features, load the decorators plugin first.

For legacy decorators with class fields, keep the decorators plugin before `@babel/plugin-transform-class-properties` and use `loose: true` for class properties:

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "version": "legacy" }],
    ["@babel/plugin-transform-class-properties", { "loose": true }]
  ]
}
```

This ordering matters because Babel needs to process decorators before rewriting the class elements they apply to.

## Important pitfalls

- Set `version` explicitly. New configs should not rely on old defaults.
- Do not mix up `"2023-11"` and `"legacy"`; they are different decorator models with different behavior.
- Keep the decorators plugin before class-element transforms such as `@babel/plugin-transform-class-properties`.
- Use `decoratorsBeforeExport` only for older proposal snapshots that need it, not for `"legacy"` or current proposal configs.
- Babel's maintainer docs note that Babel 8 will support only `"2023-11"` and `"legacy"`, so avoid older snapshot versions for new work.
