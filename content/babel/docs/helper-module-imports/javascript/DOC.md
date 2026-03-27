---
name: helper-module-imports
description: "Babel helper for inserting import and require statements in custom transforms and plugins"
metadata:
  languages: "javascript"
  versions: "7.28.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,ast,plugin,imports"
---

# @babel/helper-module-imports

`@babel/helper-module-imports` is a Babel plugin-authoring helper for adding module loads to the file you are transforming. It can insert default, named, namespace, and side-effect imports, and it returns the AST expression you can reuse in your transform.

Use it inside Babel plugins or codemods when you need Babel to generate the right `import` or `require(...)` form for the current file. The package does not have a CLI, client object, auth flow, or environment variables.

## Install

For local plugin or transform work:

```bash
npm install --save-dev @babel/core @babel/helper-module-imports
```

If you are publishing a Babel plugin that imports this package at runtime, keep it in that plugin's regular dependencies.

## What it exports

The package exports these helpers:

```javascript
import {
  addDefault,
  addNamed,
  addNamespace,
  addSideEffect,
  ImportInjector,
  isModule,
} from "@babel/helper-module-imports";
```

The top-level helpers are usually enough:

- `addDefault(path, source, opts)`
- `addNamed(path, importName, source, opts)`
- `addNamespace(path, source, opts)`
- `addSideEffect(path, source, opts)`

You can call them from any visitor path. The helper walks up to the enclosing `Program` and inserts statements there.

## Common workflow: add one import and reuse it

This example rewrites `console.log(...)` to a named import from a local logger module:

```javascript
import { transformSync, types as t } from "@babel/core";
import { addNamed } from "@babel/helper-module-imports";

function rewriteConsoleLog() {
  return {
    name: "rewrite-console-log",
    visitor: {
      Program(path, state) {
        state.logId = null;
      },

      CallExpression(path, state) {
        if (!path.get("callee").matchesPattern("console.log")) return;

        if (!state.logId) {
          state.logId = addNamed(path, "log", "./logger.js", {
            nameHint: "log",
          });
        }

        path.node.callee = t.cloneNode(state.logId);
      },
    },
  };
}

const result = transformSync('console.log("hello")', {
  configFile: false,
  babelrc: false,
  plugins: [rewriteConsoleLog],
});

console.log(result.code);
```

In an ES module input file, Babel inserts an `import { log as _log } from "./logger.js";`-style declaration near the top of the program. In a non-module file, it uses a `require(...)`-based form instead.

## Add the other import forms

```javascript
import {
  addDefault,
  addNamed,
  addNamespace,
  addSideEffect,
} from "@babel/helper-module-imports";

export default function examplePlugin() {
  return {
    name: "example-plugin",
    visitor: {
      Program(path) {
        const lodashId = addDefault(path, "lodash", {
          nameHint: "lodash",
        });

        const readFileId = addNamed(path, "readFile", "node:fs/promises", {
          nameHint: "readFile",
          importedType: "es6",
        });

        const helpersId = addNamespace(path, "./helpers.js", {
          importedType: "es6",
          nameHint: "helpers",
        });

        addSideEffect(path, "./register-globals.js");

        void lodashId;
        void readFileId;
        void helpersId;
      },
    },
  };
}
```

Use these forms when you need Babel to manage unique local identifiers and place imports consistently with the rest of the file.

## Options that change generated code

These options are supported by the package source in `7.28.6`:

```javascript
const helperId = addDefault(path, "./legacy-helper.cjs", {
  nameHint: "legacyHelper",
  importedType: "commonjs",
  importedInterop: "babel",
  importingInterop: "babel",
  ensureLiveReference: false,
  ensureNoContext: false,
  importPosition: "before",
});
```

- `nameHint`: prefixes the generated local variable name.
- `importedType`: use `"commonjs"` (default) or `"es6"`.
- `importedInterop`: for CommonJS imports, the implementation handles `"babel"` (default), `"compiled"`, and `"uncompiled"`.
- `importingInterop`: set how the generated output will be interpreted, either `"babel"` (default) or `"node"`.
- `ensureLiveReference`: for default or named imports, prefer a live property access instead of copying the current value.
- `ensureNoContext`: if the generated result is a property access, wrap it as `(0, expr)` so you can call it without preserving object context.
- `importPosition`: `"before"` by default; `"after"` appends after existing value imports in ES modules.

## Check whether the file is a module

The exported `isModule` helper is a small convenience for branching on `sourceType`:

```javascript
import { addSideEffect, isModule } from "@babel/helper-module-imports";

export default function conditionalImportPlugin() {
  return {
    name: "conditional-import-plugin",
    visitor: {
      Program(path) {
        if (!isModule(path)) return;

        addSideEffect(path, "./instrumentation.js", {
          importPosition: "after",
        });
      },
    },
  };
}
```

`isModule(path)` returns `true` when `path.node.sourceType === "module"`.

## Important notes

- The helper chooses between `import` and `require(...)` based on the transformed file's `Program.sourceType`.
- `importPosition: "after"` only works in modules. In CommonJS or script files, the package throws an error.
- `importedType: "es6"` only works when the file is a module. Importing an ES module from CommonJS throws.
- `addDefault()` and `addNamed()` do not always return a plain identifier. With options such as `ensureLiveReference` or `ensureNoContext`, the result can be a `MemberExpression` or `SequenceExpression`.
- If you reuse the returned node in more than one replacement, clone it with `t.cloneNode(...)` before inserting it multiple times. Babel's own plugins use this pattern.
- When adding compatible imports from the same source, the helper can append specifiers to an existing value import instead of emitting a duplicate declaration.
- Only use `importedInterop: "compiled"` when the imported CommonJS module is known to come from ES module compilation. Only use `"uncompiled"` when it is plain CommonJS. The wrong choice produces the wrong property access pattern.
