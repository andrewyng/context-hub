---
name: vitest
description: "Vitest 4 for JavaScript projects: install it, configure test environments, write tests, mock modules, and run coverage from the CLI"
metadata:
  languages: "javascript"
  versions: "4.0.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "vitest,testing,unit-test,mocking,vite"
---

# Vitest for JavaScript

Vitest is a test runner for JavaScript and TypeScript projects. In `4.0.18`, the package requires Node.js `^20.0.0 || ^22.0.0 || >=24.0.0`.

## Install

Install Vitest as a dev dependency:

```bash
npm install -D vitest
```

Optional packages you add only when you use those features:

```bash
npm install -D jsdom
npm install -D happy-dom
npm install -D @vitest/ui
```

- Install `jsdom` or `happy-dom` when you run DOM-style tests.
- Install `@vitest/ui` when you use `vitest --ui`.

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Basic configuration

Create `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./test/setup.js'],
    restoreMocks: true,
    unstubEnvs: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
```

Notes:

- The `test` block can live in `vitest.config.js` or in `vite.config.js`.
- The default environment is `node`.
- `globals` defaults to `false`, so import `describe`, `it`, `expect`, and `vi` from `vitest` unless you enable globals.
- The default coverage provider is `v8`.
- Vitest's default test file pattern is `**/*.{test,spec}.?(c|m)[jt]s?(x)`.

If you want global test APIs instead of explicit imports:

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
  },
})
```

## Write and run tests

Example source file:

```js
export function sum(a, b) {
  return a + b
}
```

Example test file `src/sum.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { sum } from './sum.js'

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5)
  })

  it('supports async assertions', async () => {
    await expect(Promise.resolve('ok')).resolves.toBe('ok')
  })
})
```

Run common workflows from the CLI:

```bash
npx vitest
npx vitest run
npx vitest run src/sum.test.js
npx vitest run -t "adds two numbers"
npx vitest related src/sum.js
npx vitest list
```

- `vitest` starts in watch/dev mode.
- `vitest run` disables watch mode.
- `-t` filters by test name.
- `related` runs tests related to changed source files.
- `list` is useful when Vitest is not picking up the files you expected.

## Setup files

Use `setupFiles` for test-wide initialization.

Example `test/setup.js`:

```js
import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})
```

If you already set `restoreMocks: true` and `unstubEnvs: true` in config, you do not need to repeat that cleanup manually.

## Mock functions, spies, and modules

Use `vi.fn()` for stand-alone mocks and `vi.spyOn()` for existing objects.

```js
import { expect, it, vi } from 'vitest'

it('spies on an existing method', () => {
  const math = {
    random() {
      return Math.random()
    },
  }

  const spy = vi.spyOn(math, 'random').mockReturnValue(0.5)

  expect(math.random()).toBe(0.5)
  expect(spy).toHaveBeenCalledTimes(1)
})
```

Mock an imported module with `vi.mock()`:

```js
import { beforeEach, expect, it, vi } from 'vitest'
import * as api from '../src/api.js'
import { loadUser } from '../src/load-user.js'

vi.mock('../src/api.js', () => ({
  fetchUser: vi.fn(),
}))

beforeEach(() => {
  vi.resetAllMocks()
})

it('uses the mocked module', async () => {
  vi.mocked(api.fetchUser).mockResolvedValue({ id: 'u_123', name: 'Ada' })

  await expect(loadUser('u_123')).resolves.toEqual({
    id: 'u_123',
    name: 'Ada',
  })
})
```

Important behavior:

- `vi.mock()` is hoisted to the top of the file.
- If the mock depends on runtime values, use `vi.doMock()` or `vi.hoisted()` instead of relying on later variables in module scope.
- `vi.clearAllMocks()`, `vi.resetAllMocks()`, and `vi.restoreAllMocks()` do different things; `restoreAllMocks()` is the safest default for spies between tests.

## Stub environment variables

Vitest exposes `vi.stubEnv()` and `vi.unstubAllEnvs()` for `process.env` and `import.meta.env` values.

```js
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
})

it('stubs an environment variable', () => {
  vi.stubEnv('API_BASE_URL', 'https://example.test')

  expect(process.env.API_BASE_URL).toBe('https://example.test')
})
```

For repeated use across the suite, set `unstubEnvs: true` in config.

## DOM tests

Vitest's default environment is `node`. For tests that touch `document`, `window`, or browser APIs, switch to a DOM environment and install the matching package.

Using `jsdom` in config:

```bash
npm install -D jsdom
```

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
```

Example DOM test:

```js
import { beforeEach, expect, it } from 'vitest'

function renderGreeting(name) {
  document.querySelector('#app').textContent = `Hello ${name}`
}

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>'
})

it('renders into the document', () => {
  renderGreeting('Ada')
  expect(document.querySelector('#app').textContent).toBe('Hello Ada')
})
```

For a quick DOM-style run with `happy-dom`, Vitest also supports:

```bash
npm install -D happy-dom
npx vitest --dom
```

## Snapshots and coverage

Snapshot example:

```js
import { expect, it } from 'vitest'

it('matches a snapshot', () => {
  expect({ status: 'ok', items: [1, 2, 3] }).toMatchSnapshot()
})
```

Update stored snapshots:

```bash
npx vitest run -u
```

Run coverage:

```bash
npx vitest run --coverage
```

Useful coverage flags:

```bash
npx vitest run --coverage.provider=v8
npx vitest run --coverage.reporter=text --coverage.reporter=html
npx vitest run --coverage.thresholds.lines=90
```

In `4.0.18`, the built-in coverage defaults are:

- `provider: 'v8'`
- `reportsDirectory: './coverage'`
- reporters: `text`, `html`, `clover`, and `json`

## Typecheck and UI workflows

Run tests with typechecking enabled:

```bash
npx vitest run --typecheck
```

Vitest's CLI exposes `tsc` and `vue-tsc` as built-in typechecker options:

```bash
npx vitest run --typecheck --typecheck.checker=tsc
```

Run the UI:

```bash
npm install -D @vitest/ui
npx vitest --ui
```

## High-value pitfalls

- Vitest `4.0.18` does not support Node 18; use Node 20, 22, or 24+.
- If your test files are not discovered, either match the default glob `**/*.{test,spec}.?(c|m)[jt]s?(x)` or set `test.include` explicitly.
- If `describe`, `it`, or `expect` are undefined, either import them from `vitest` or enable `test.globals`.
- If DOM globals like `document` are missing, install `jsdom` or `happy-dom` and set the environment.
- `vi.mock()` is hoisted, so runtime-dependent mocks should use `vi.doMock()` or `vi.hoisted()`.
- `vitest --ui` requires `@vitest/ui`; it is not bundled into the base `vitest` package.

## Official docs

- API reference: `https://vitest.dev/api/`
- Config reference: `https://vitest.dev/config/`
- Coverage guide: `https://vitest.dev/guide/coverage`
