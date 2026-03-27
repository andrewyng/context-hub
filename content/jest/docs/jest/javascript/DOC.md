---
name: jest
description: "Jest test runner for JavaScript projects, including configuration, async tests, mocks, snapshots, and CLI usage"
metadata:
  languages: "javascript"
  versions: "30.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "jest,testing,javascript,unit-testing,mocking,snapshots"
---

# Jest for JavaScript

Jest runs JavaScript tests, provides `expect` assertions, includes mock helpers such as `jest.fn()` and `jest.spyOn()`, and supports snapshots and watch mode from the CLI.

This guide covers the common Node.js setup for `jest@30.3.0` and the extra step required for browser-like DOM tests.

## Requirements

- Node.js must satisfy Jest 30's engine range: `^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0`.
- Install Jest as a development dependency.
- No environment variables are required for normal local runs.
- In CI, providers usually set `CI=true` automatically. Jest treats that as CI mode, so snapshot files are not written unless you also pass `-u` or `--updateSnapshot`.

## Install and add a test script

```bash
npm install --save-dev jest
```

Add a `test` script in `package.json`:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

Check the installed version:

```bash
npx jest --version
```

## Write a first test

Jest finds tests in files such as `*.test.js`, `*.spec.js`, and files under `__tests__/`.

`sum.js`

```javascript
function sum(a, b) {
  return a + b;
}

module.exports = { sum };
```

`sum.test.js`

```javascript
const { sum } = require('./sum');

test('adds two numbers', () => {
  expect(sum(1, 2)).toBe(3);
});
```

Run all tests:

```bash
npm test
```

When passing extra flags through `npm test`, include `--` before the Jest flags:

```bash
npm test -- --watch
```

## Add a config file

Jest supports config files such as `jest.config.js`, `jest.config.ts`, `jest.config.mjs`, `jest.config.cjs`, `jest.config.cts`, and `jest.config.json`.

Use `jest.config.cjs` for a CommonJS config that still works when your `package.json` sets `"type": "module"`:

```javascript
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
};
```

`test/setup.js`

```javascript
afterEach(() => {
  jest.restoreAllMocks();
});
```

Notes:

- The default test environment in Jest 30 is Node (`jest-environment-node`).
- `clearMocks: true` clears mock call state before each test.
- `setupFilesAfterEnv` runs after the test framework is installed, so global helpers such as `afterEach` and `jest` are available there.
- The examples in this guide use CommonJS test files and a CommonJS config. If your project uses ESM, switch the config to `jest.config.mjs` or keep the config in `jest.config.cjs` and update your test and module syntax accordingly.

## Async tests

Use `async` / `await`, or return a promise directly.

`user-service.js`

```javascript
async function loadUser(getUserById, id) {
  return getUserById(id);
}

module.exports = { loadUser };
```

`user-service.test.js`

```javascript
const { loadUser } = require('./user-service');

test('loads a user', async () => {
  const getUserById = jest.fn().mockResolvedValue({
    id: 42,
    name: 'Ada',
  });

  await expect(loadUser(getUserById, 42)).resolves.toEqual({
    id: 42,
    name: 'Ada',
  });

  expect(getUserById).toHaveBeenCalledWith(42);
});
```

For rejected promises:

```javascript
test('handles failures', async () => {
  const getUserById = jest.fn().mockRejectedValue(new Error('timeout'));

  await expect(loadUser(getUserById, 42)).rejects.toThrow('timeout');
});
```

## Mocks and spies

Use `jest.fn()` for stand-alone mocks and `jest.spyOn()` when you want to replace an existing method temporarily.

```javascript
test('spies on Date.now', () => {
  const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

  expect(Date.now()).toBe(1700000000000);

  nowSpy.mockRestore();
});
```

If you use `jest.spyOn()`, restore the original implementation in the test itself or from a shared `afterEach` hook.

## Snapshot tests

Snapshots are useful for stable serialized output.

```javascript
test('matches the saved order snapshot', () => {
  expect({
    id: 'ord_123',
    total: 4200,
    items: ['keyboard', 'cable'],
  }).toMatchSnapshot();
});
```

Create or update snapshots:

```bash
npm test -- -u
```

In CI mode, Jest does not write snapshot files unless you explicitly pass `-u` or `--updateSnapshot`.

## DOM tests with jsdom

Jest 30 defaults to the Node environment. If your tests use `window`, `document`, or other browser APIs, install the jsdom environment package and switch the environment.

```bash
npm install --save-dev jest jest-environment-jsdom
```

`jest.config.cjs`

```javascript
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
};
```

`dom.test.js`

```javascript
test('renders a button label', () => {
  document.body.innerHTML = '<button>Save</button>';

  expect(document.querySelector('button').textContent).toBe('Save');
});
```

## Useful CLI commands

Run a single test file:

```bash
npx jest sum.test.js
```

Run tests whose names match a pattern:

```bash
npx jest -t "adds two numbers"
```

Run in watch mode:

```bash
npx jest --watch
```

Run all tests and collect coverage:

```bash
npx jest --coverage
```

Run tests serially in one process:

```bash
npx jest --runInBand
```

Update snapshots:

```bash
npx jest --updateSnapshot
```

Run tests related to changed source files:

```bash
npx jest --findRelatedTests src/sum.js
```

Show the resolved version:

```bash
npx jest --version
```

## Common pitfalls

- Jest does not require environment variables for basic usage, but `CI=true` changes behavior by disabling interactive watch mode and preventing snapshot writes unless you pass `-u`.
- `jest` includes the test runner and CLI, but DOM testing requires `jest-environment-jsdom` as a separate development dependency.
- Keep your config file format aligned with your module system. `module.exports` configs belong in `jest.config.cjs`; ESM configs belong in `jest.config.mjs`.
- `clearMocks` only clears mock usage data. If you replace real implementations with `jest.spyOn()` or manual mocks, restore them between tests.
- If your project relies on TypeScript, JSX, or other non-Node syntax, add the matching transform toolchain for that syntax instead of assuming Jest will compile it automatically.

## Official sources

- Jest docs: https://jestjs.io/docs/api
- Jest CLI docs: https://jestjs.io/docs/cli
- Jest configuration docs: https://jestjs.io/docs/configuration
- Jest async docs: https://jestjs.io/docs/asynchronous
- Jest mock functions docs: https://jestjs.io/docs/mock-functions
- Jest snapshot docs: https://jestjs.io/docs/snapshot-testing
- npm package: https://www.npmjs.com/package/jest
