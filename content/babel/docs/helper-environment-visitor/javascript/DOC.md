---
name: helper-environment-visitor
description: "Babel helper for traversing only the current lexical environment when writing custom transforms and plugins"
metadata:
  languages: "javascript"
  versions: "7.24.7"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,ast,traverse,plugin"
---

# @babel/helper-environment-visitor

`@babel/helper-environment-visitor` is a small Babel helper for plugin authors. It gives you a prebuilt visitor that stays inside the current environment while traversing: nested non-arrow functions are skipped, arrow functions are still visited, and class members are skipped so Babel can handle computed keys correctly.

Use it when you need to find or rewrite nodes such as `this`, `super`, `arguments`, or `new.target` for the current environment only. It is not a runtime library, has no CLI, and does not use environment variables or credentials.

## Install

Install it alongside the Babel packages you already use for parsing or traversal:

```bash
npm install --save-dev @babel/core @babel/traverse @babel/helper-environment-visitor
```

If you want a standalone script example like the one below, add the parser too:

```bash
npm install --save-dev @babel/parser
```

Keep related Babel packages on the same version family when possible.

## What the helper does

The exported `environmentVisitor` is meant to be merged with your own visitor:

```javascript
import traverse from "@babel/traverse";
import environmentVisitor from "@babel/helper-environment-visitor";

const visitor = traverse.visitors.merge([
  environmentVisitor,
  {
    ThisExpression(path) {
      // handle `this` only in the current environment
    },
  },
]);
```

This matters because a naive traversal will walk into nested functions and may rewrite bindings that belong to a different environment.

From Babel's implementation, the helper:

- skips nested function parents except arrow functions
- keeps traversing arrow functions because they inherit the enclosing environment
- skips non-object `Property` paths such as class members
- lets Babel revisit computed keys when those members are skipped

## Common workflow: inspect `this` in one function environment

This standalone example collects `this` references for one function without walking into nested non-arrow functions:

```javascript
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import environmentVisitor from "@babel/helper-environment-visitor";

const source = `
function outer() {
  console.log(this);

  const arrow = () => this;

  function inner() {
    return this;
  }
}
`;

const ast = parse(source, {
  sourceType: "module",
});

const thisLocations = [];

traverse(ast, {
  FunctionDeclaration(path) {
    if (path.node.id?.name !== "outer") return;

    path.traverse(
      traverse.visitors.merge([
        environmentVisitor,
        {
          ThisExpression(thisPath) {
            thisLocations.push(thisPath.node.start);
          },
        },
      ]),
    );
  },
});

console.log(thisLocations);
```

In this example, the helper visits `this` in `outer` and in the nested arrow function, but it does not walk into `inner()` because `inner` has its own environment.

## Use it inside a Babel plugin

This is the usual pattern in plugin code: enter a scope boundary, then run a merged traversal underneath it.

```javascript
import { types as t } from "@babel/core";
import traverse from "@babel/traverse";
import environmentVisitor from "@babel/helper-environment-visitor";

export default function replaceTopLevelThis() {
  return {
    name: "replace-top-level-this",
    visitor: {
      Function(path) {
        path.traverse(
          traverse.visitors.merge([
            environmentVisitor,
            {
              ThisExpression(thisPath) {
                thisPath.replaceWith(t.identifier("globalThis"));
              },
            },
          ]),
        );
      },
    },
  };
}
```

Register the plugin with Babel as usual:

```json
{
  "plugins": ["./plugins/replace-top-level-this.js"]
}
```

## Be careful with class members and computed keys

From Babel's implementation, this helper skips class members and preserves traversal of computed keys when they are evaluated in the enclosing environment.

That means this pattern stays safe:

```javascript
const visitor = traverse.visitors.merge([
  environmentVisitor,
  {
    ThisExpression(path) {
      // your transform logic here
    },
  },
]);
```

But if you add your own `ClassMethod`, `ClassProperty`, or related member visitors that call `path.skip()`, make sure you do not accidentally suppress computed key traversal for code such as:

```javascript
class Example {
  [sideEffect()]() {}
}
```

In other words, let `environmentVisitor` own the environment-boundary behavior unless you have a specific reason to override it.

## Important notes

- This package is for Babel plugin and transform authors, not normal application runtime code.
- It does not replace `@babel/traverse`; it complements it.
- `environmentVisitor` is most useful when you would otherwise accidentally cross into a nested function environment.
- Be careful when overriding class-member visitors, because computed keys are evaluated outside the member body.
- Keep your Babel packages aligned. Mixing widely different Babel versions can produce missing helper APIs or traversal differences.

## Version notes

This guide targets `@babel/helper-environment-visitor` `7.24.7`.

Newer Babel packages also expose equivalent environment-aware traversal helpers from `@babel/traverse` under `traverse.visitors`. If your codebase already uses that newer API surface, prefer the API that matches the Babel version you have installed instead of mixing helper patterns from different releases.
