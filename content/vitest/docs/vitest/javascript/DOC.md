---
name: vitest
description: "Vitest 4 for JavaScript projects: install it, configure test environments, write tests, mock modules, and run coverage from the CLI"
metadata:
  languages: "javascript"
  versions: "4.1.7"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "vitest,testing,unit-test,mocking,vite"
---

# Vitest for JavaScript

Vitest is a test runner for JavaScript and TypeScript projects. In `4.1.7`, the package requires Node.js `^20.0.0 || ^22.0.0 || >=24.0.0`.

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

## Setup and teardown

Vitest exposes `beforeAll`, `beforeEach`, `afterEach`, and `afterAll` for shared setup. They scope to the surrounding `describe` block or to the whole file.

```js
import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from 'vitest'

describe('checkout', () => {
  let server

  beforeAll(async () => {
    server = await startTestServer()
  })

  afterAll(async () => {
    await server.close()
  })

  beforeEach(() => {
    server.reset()
  })

  afterEach(() => {
    // per-test cleanup
  })

  it('runs', () => {})
})
```

Use `setupFiles` for project-wide initialization that should apply to every test file.

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

## In-source testing

Vitest can run tests that live alongside production code, behind an `import.meta.vitest` guard, so the test bundle is stripped from production builds.

`src/math.js`

```js
export function add(a, b) {
  return a + b
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest
  describe('add', () => {
    it('adds two numbers', () => {
      expect(add(1, 2)).toBe(3)
    })
  })
}
```

Enable in `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}'],
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
```

## Watch mode and UI mode

By default, `vitest` (no `run`) starts in watch mode: it re-runs only the tests affected by file changes, and the CLI accepts interactive commands such as `a` (run all), `f` (only failed), `t` (filter by name), and `q` (quit).

```bash
npx vitest                  # watch mode (default in TTY)
npx vitest run              # one-shot, no watch
npx vitest --ui             # open the @vitest/ui dashboard in the browser
npx vitest run --reporter=verbose
```

The UI requires `@vitest/ui` installed as a dev dependency.

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

In `4.1.7`, the built-in coverage defaults are:

- `provider: 'v8'`
- `reportsDirectory: './coverage'`
- reporters: `text`, `html`, `clover`, and `json`

Vitest supports two coverage providers:

- `v8` (default): uses Node's built-in V8 coverage. Fast, no source transform, but coverage maps back to source via source maps and can show slightly different branch coverage than instrumented runs.
- `istanbul`: instruments source through Babel. Slower, but matches the long-standing Istanbul reports and works well when you need precise branch coverage.

Install the matching package for the provider you choose:

```bash
npm install -D @vitest/coverage-v8
npm install -D @vitest/coverage-istanbul
```

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,ts}'],
      thresholds: { lines: 90, functions: 90, branches: 80, statements: 90 },
    },
  },
})
```

## Browser mode

Vitest can run the same tests inside a real browser (Chromium, Firefox, WebKit) via Playwright or WebDriverIO. Install `@vitest/browser` plus the matching provider, then configure:

```bash
npm install -D @vitest/browser playwright
```

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
})
```

Run it with `npx vitest --browser` or `npx vitest run --browser`. Browser mode is useful when DOM-only emulation via `jsdom` or `happy-dom` is not faithful enough.

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

- Vitest `4.1.7` does not support Node 18; use Node 20, 22, or 24+.
- If your test files are not discovered, either match the default glob `**/*.{test,spec}.?(c|m)[jt]s?(x)` or set `test.include` explicitly.
- If `describe`, `it`, or `expect` are undefined, either import them from `vitest` or enable `test.globals`.
- If DOM globals like `document` are missing, install `jsdom` or `happy-dom` and set the environment.
- `vi.mock()` is hoisted, so runtime-dependent mocks should use `vi.doMock()` or `vi.hoisted()`.
- `vitest --ui` requires `@vitest/ui`; it is not bundled into the base `vitest` package.

## Official docs

- API reference: `https://vitest.dev/api/`
- Config reference: `https://vitest.dev/config/`
- Coverage guide: `https://vitest.dev/guide/coverage`
