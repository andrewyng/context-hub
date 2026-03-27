---
name: jest
description: "TypeScript definitions for Jest's global test APIs, matchers, mocks, spies, and utility types"
metadata:
  languages: "typescript"
  versions: "30.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,jest,testing,mocks,types"
---

# Jest TypeScript Guide

`@types/jest` adds TypeScript declarations for Jest's global test APIs and helper types. Install it when your TypeScript tests use ambient names such as `describe`, `it`, `test`, `expect`, `beforeEach`, `afterEach`, or the `jest` namespace.

This package only ships `.d.ts` files. It does not provide the Jest runtime, it does not execute tests, and it does not transpile `.ts` files for Jest.

## Install

Install the runtime package and the type package together:

```bash
npm install --save-dev jest @types/jest
```

No environment variables, authentication, or client initialization are required.

If your test files are written in TypeScript, you also need a TypeScript-aware Jest execution setup such as a transform step or a compile step. `@types/jest` only affects the compiler and editor.

## TypeScript Setup

If your project does not restrict `compilerOptions.types`, installing `@types/jest` is usually enough.

If you already restrict loaded type packages, add `jest` explicitly so the ambient globals stay available in test files:

```json
{
  "compilerOptions": {
    "types": ["jest", "node"]
  }
}
```

In mixed projects, a test-only TypeScript config avoids leaking Jest globals into non-test code:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node"]
  },
  "include": ["src", "**/*.test.ts", "**/*.spec.ts"]
}
```

Do not import `@types/jest` in code. TypeScript loads the declarations automatically.

## Write Tests With Jest Globals

With Jest's default global injection, your test files can use the test API without imports:

```typescript
function sum(a: number, b: number) {
  return a + b;
}

describe("sum", () => {
  test("adds two numbers", () => {
    expect(sum(2, 3)).toBe(5);
  });
});
```

This is the simplest setup when you want `describe`, `test`, and `expect` available globally in test files.

## Use Explicit Imports When `injectGlobals` Is Disabled

If you set Jest's `injectGlobals` option to `false`, import the runtime APIs from `@jest/globals` instead of relying on ambient globals.

```typescript
import type { Config } from "jest";

const config: Config = {
  injectGlobals: false,
  testEnvironment: "node",
};

export default config;
```

Then write tests like this:

```typescript
import { describe, expect, test } from "@jest/globals";

describe("sum", () => {
  test("adds two numbers", () => {
    expect(2 + 3).toBe(5);
  });
});
```

This runtime choice does not change how `@types/jest` is installed, but it does change whether your tests depend on injected globals.

## Type Mock Functions And Mocked Objects

The `jest` namespace includes utility types that matter at the TypeScript boundary.

### Mock a function with the real parameter and return types

```typescript
type FetchUser = (id: string) => Promise<{ id: string; name: string }>;

const fetchUser = jest.fn<ReturnType<FetchUser>, Parameters<FetchUser>>();

fetchUser.mockResolvedValue({ id: "u_1", name: "Ada" });

test("loads a user", async () => {
  await expect(fetchUser("u_1")).resolves.toEqual({
    id: "u_1",
    name: "Ada",
  });
});
```

This keeps the mock aligned with the real function signature so `mockResolvedValue`, call arguments, and return values stay typed.

### Mock an object dependency with `jest.Mocked<T>`

```typescript
interface UserApi {
  getUser(id: string): Promise<{ id: string; name: string }>;
  deleteUser(id: string): Promise<void>;
}

const api: jest.Mocked<UserApi> = {
  getUser: jest.fn(),
  deleteUser: jest.fn(),
};

api.getUser.mockResolvedValue({ id: "u_1", name: "Ada" });
api.deleteUser.mockResolvedValue();
```

Use `jest.Mocked<T>` when you want an object-shaped mock where each function gains Jest mock methods.

### Spy on an existing method

```typescript
afterEach(() => {
  jest.restoreAllMocks();
});

test("warns for deprecated input", () => {
  const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

  console.warn("deprecated");

  expect(warnSpy).toHaveBeenCalledWith("deprecated");
});
```

`jest.spyOn()` preserves the target method's argument and return types, so the spy usually infers cleanly without extra annotations.

## Add Typed Custom Matchers

When you extend `expect`, also extend Jest's matcher interface so TypeScript recognizes the new assertion.

Register the matcher in a setup file:

```typescript
export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;

    return {
      pass,
      message: () => `expected ${received} to be within range ${floor}-${ceiling}`,
    };
  },
});
```

Load that file with `setupFilesAfterEnv`:

```typescript
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;
```

Now the matcher is typed in tests:

```typescript
test("range matcher", () => {
  expect(10).toBeWithinRange(8, 12);
});
```

## Important Pitfalls

- `@types/jest` is a declaration package only. Install `jest` separately for the runtime.
- Do not import `@types/jest` from application or test files.
- If `compilerOptions.types` is set, include `"jest"` there or TypeScript may stop seeing Jest globals.
- Keep Jest types out of non-test TypeScript configs when your project also uses other test runners or other global `expect` implementations.
- If you disable `injectGlobals`, import from `@jest/globals` because `describe`, `test`, and `expect` are no longer injected at runtime.
- Keep the `jest` runtime and `@types/jest` on the same major version so the declared API surface matches the runtime you execute.

## Version-Sensitive Notes

- This guide targets `@types/jest==30.0.0`.
- The package supplies type declarations for Jest's testing APIs; align it with the Jest major version used in the same project.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/jest
- DefinitelyTyped source for `@types/jest`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/jest
- `@types/jest` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jest/index.d.ts
- Jest TypeScript guide: https://jestjs.io/docs/getting-started#using-typescript
- Jest configuration reference (`injectGlobals`): https://jestjs.io/docs/configuration#injectglobals-boolean
- Jest mock function API: https://jestjs.io/docs/mock-function-api
- Jest `expect.extend` reference: https://jestjs.io/docs/expect#expectextendmatchers
