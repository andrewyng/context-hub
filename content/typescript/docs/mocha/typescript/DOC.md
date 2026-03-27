---
name: mocha
description: "TypeScript declarations for Mocha's test globals, hooks, async callbacks, and test context APIs"
metadata:
  languages: "typescript"
  versions: "10.0.10"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,mocha,testing,types,definitelytyped,ambient-types"
---

# Mocha TypeScript Guide

`@types/mocha` adds TypeScript declarations for the `mocha` test runner. Install it when your TypeScript tests use Mocha globals such as `describe`, `it`, `beforeEach`, and `after`, or when you import those helpers from the `mocha` runtime package.

This package only ships type declarations. It does not include the Mocha runtime.

## Install

Install the runtime package and the type package together:

```bash
npm install --save-dev mocha @types/mocha
```

If you run `.ts` test files directly with Mocha, also install TypeScript and a loader such as `ts-node`:

```bash
npm install --save-dev mocha @types/mocha typescript ts-node
```

No environment variables, authentication, or client initialization are required.

## TypeScript Setup

In many projects, installing `@types/mocha` is enough.

If your project restricts ambient type packages with `compilerOptions.types`, add `mocha` explicitly:

```json
{
  "compilerOptions": {
    "types": ["node", "mocha"]
  }
}
```

When your application code and test code use different ambient globals, keep a separate test config so Mocha types only load for tests:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["node", "mocha"]
  },
  "include": ["test/**/*.ts"]
}
```

If TypeScript reports `Cannot find name 'describe'` or `Cannot find name 'it'`, the usual fix is installing `@types/mocha` and ensuring the active `tsconfig` includes `mocha` in `compilerOptions.types` when that field is present.

## Run TypeScript Tests With Mocha

For a common `ts-node` setup, add a test script that registers the TypeScript loader before Mocha loads your test files:

```json
{
  "scripts": {
    "test": "mocha --require ts-node/register --extension ts \"test/**/*.spec.ts\""
  }
}
```

This runtime setup is separate from `@types/mocha`, but it is the practical boundary most TypeScript projects need: `mocha` runs the tests, `ts-node` transpiles them, and `@types/mocha` gives the compiler the test API types.

## Use Mocha Globals In Test Files

Once the declarations are loaded, Mocha's test globals are available in TypeScript test files.

```ts
import { strict as assert } from "node:assert";

describe("sum", () => {
  it("adds two numbers", () => {
    assert.equal(2 + 3, 5);
  });
});
```

This is the simplest setup when your test runner provides globals and your `tsconfig` loads the `mocha` type package.

## Import Test Helpers Explicitly

If you prefer module-local imports over ambient globals, import the helpers from the `mocha` runtime package.

```ts
import { beforeEach, describe, it } from "mocha";
import { strict as assert } from "node:assert";

describe("user service", () => {
  let userId = "";

  beforeEach(() => {
    userId = "user_123";
  });

  it("uses imported test helpers", () => {
    assert.equal(userId, "user_123");
  });
});
```

Use this pattern when you want the test file to declare its dependencies directly instead of relying on globally injected names.

## Use `function` Callbacks For Mocha Context

Mocha's context APIs such as `this.timeout()`, `this.retries()`, and `this.currentTest` depend on `function` callbacks. Arrow functions do not bind Mocha's `this` value.

```ts
import { beforeEach, it } from "mocha";
import { strict as assert } from "node:assert";

beforeEach(function () {
  this.timeout(2_000);
});

it("can access the current test", function () {
  assert.equal(this.test?.title, "can access the current test");
});
```

This is one of the most important TypeScript boundaries in Mocha tests: the declarations give `this` a useful type only when the callback shape matches Mocha's API.

## Use Callback-Style Async Tests With `Mocha.Done`

Mocha supports callback-style async tests. `@types/mocha` exposes the callback type through the `Mocha` namespace.

```ts
import { it } from "mocha";

it("waits for a callback", function (done: Mocha.Done) {
  setTimeout(() => {
    done();
  }, 10);
});
```

If the test is promise-based, return the promise or use `async` instead of mixing both patterns in the same test.

## Extend The Test Context Safely

When you store custom values on Mocha's test context, narrow `this` at the usage boundary.

```ts
import { beforeEach, it } from "mocha";
import { strict as assert } from "node:assert";

type TestContext = Mocha.Context & {
  requestId: string;
};

beforeEach(function () {
  (this as TestContext).requestId = "req_123";
});

it("reads custom context values", function () {
  const ctx = this as TestContext;
  assert.equal(ctx.requestId, "req_123");
});
```

This keeps the extension local and explicit. For larger suites, put the shared context type in a test helper module.

## Important Pitfalls

- `@types/mocha` does not install or run Mocha; install `mocha` separately.
- Do not import from `@types/mocha` in application code or tests. Import from `mocha`, or rely on the globals after TypeScript loads the declarations.
- If your project uses `compilerOptions.types`, omit `mocha` there and the globals will appear to vanish.
- Use `function () {}` rather than arrow functions whenever the test or hook uses Mocha's `this` context.
- Avoid loading multiple global test-runner type packages into the same compilation when possible. `@types/mocha`, `@types/jest`, and similar packages all declare globals such as `describe` and `it`, so a dedicated test `tsconfig` is the safest setup.
- Keep your test files inside the `include` patterns for the `tsconfig` that loads Mocha types, or TypeScript will not see the declarations for those files.

## Official Sources

- https://www.npmjs.com/package/@types/mocha
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/mocha
- https://mochajs.org/
