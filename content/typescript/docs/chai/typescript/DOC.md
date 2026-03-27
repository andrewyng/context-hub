---
name: chai
description: "TypeScript definitions for Chai's expect, assert, should, and plugin extension APIs"
metadata:
  languages: "typescript"
  versions: "5.2.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,chai,testing,assertions,types"
---

# Chai TypeScript Guide

`@types/chai` adds TypeScript declarations for the `chai` runtime package. Install it with `chai` when your tests or helper code import `expect`, `assert`, `should`, `use`, or other Chai APIs from `"chai"`.

This package only ships `.d.ts` files. It does not provide the runtime assertion library by itself.

## Install

Install the runtime library and the type package together:

```bash
npm install --save-dev chai @types/chai
```

`@types/chai` package metadata declares `typeScriptVersion: "5.2"`, so use TypeScript 5.2 or newer.

No environment variables, authentication, or client initialization are required.

## TypeScript Setup

In a normal TypeScript project, installing `@types/chai` is enough. The package points TypeScript at `index.d.ts` automatically.

Only add `chai` to `compilerOptions.types` when your project already restricts loaded type packages:

```json
{
  "compilerOptions": {
    "types": ["chai", "mocha"]
  }
}
```

If you do not restrict `compilerOptions.types`, you usually do not need this snippet.

## Import The Main Assertion Styles

Use named imports from `chai`:

```ts
import { assert, expect, should } from "chai";

expect([1, 2, 3]).to.have.length(3);
assert.strictEqual(2 + 2, 4);

should();
("chai" as string).should.be.a("string");
```

The type package exposes named exports such as `expect`, `assert`, `should`, `use`, `config`, `Assertion`, and `AssertionError`.

Do not use a default import such as `import chai from "chai"`; these typings do not declare a default export.

## Use `assert` For Type Narrowing

Several `assert` signatures are useful at the TypeScript boundary because they use `asserts ...` return types.

The top-level `assert()` call narrows truthy values:

```ts
import { assert } from "chai";

function normalizeName(input: string | undefined) {
  assert(input, "name is required");
  return input.trim().toLowerCase();
}
```

Specialized helpers can narrow more precisely:

```ts
import { assert } from "chai";

function readPort(port: number | null | undefined, enabled: boolean | undefined) {
  assert.exists(port, "PORT is required");
  assert.isTrue(enabled, "feature flag must be enabled");

  return port;
}
```

This is the main place where `@types/chai` affects application code beyond test ergonomics: the assertion signatures can improve type safety after runtime checks.

## Use `should` Style

For `should` style, either call `should()` yourself or import the side-effect helper that augments `Object` globally.

### Explicit setup

```ts
import { should } from "chai";

should();

const result = { ok: true };
result.should.have.property("ok", true);
```

### Bootstrap import

```ts
import "chai/register-should";

const values = [1, 2, 3];
values.should.have.length(3);
```

Use `should` carefully in shared code: it modifies `Object.prototype`, which is convenient in tests but broader in effect than `expect` or `assert` imports.

## Type A Custom Chai Plugin

The declarations expose the global `Chai` namespace and the `Chai.ChaiPlugin` type, which is the extension point for custom plugins.

```ts
import { expect, use } from "chai";

declare global {
  namespace Chai {
    interface Assertion {
      even: Assertion;
    }
  }
}

const evenPlugin: Chai.ChaiPlugin = (chai) => {
  chai.Assertion.addProperty("even", function (this: Chai.AssertionStatic) {
    const value = this._obj as number;

    this.assert(
      value % 2 === 0,
      "expected #{this} to be even",
      "expected #{this} not to be even",
    );
  });
};

use(evenPlugin);

expect(4).to.be.even;
```

This pattern matters when you maintain local test helpers or a reusable plugin package: extend `Chai.Assertion` with declaration merging, then register the plugin with `use()`.

## Common Pitfalls

- Install `chai` as well as `@types/chai`; the type package does not contain runtime JavaScript.
- Prefer named imports from `chai`; these typings do not declare a default export.
- If your `tsconfig.json` uses `compilerOptions.types`, include `chai` there or the declarations will not load.
- `@types/chai` includes `register-should.d.ts`, but it does not ship matching declaration files for `chai/register-assert` or `chai/register-expect`. For `assert` and `expect`, prefer direct named imports from `chai`.
- `should` style mutates `Object.prototype`; use it intentionally, especially in larger test suites.

## Official Sources

- https://www.npmjs.com/package/@types/chai
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/chai
- https://www.npmjs.com/package/chai
- http://chaijs.com/guide/styles/
