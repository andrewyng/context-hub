---
name: mocha
description: "Mocha 11 for JavaScript projects: install it, configure test files and hooks, write async tests, and run common CLI workflows"
metadata:
  languages: "javascript"
  versions: "11.7.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "mocha,testing,javascript,nodejs,test-runner,unit-test"
---

# Mocha for JavaScript

Mocha is a JavaScript test runner for Node.js projects. For end-user app code, treat it as a local dev dependency and configure the test file pattern explicitly so the suite stays predictable.

## Install

Install Mocha in the project that owns the tests:

```bash
npm install -D mocha@11.7.5
```

Mocha does not require API keys, service credentials, or client initialization. The only setup you usually need is a test script and an optional config file.

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "mocha",
    "test:watch": "mocha --watch",
    "test:grep": "mocha --grep auth"
  }
}
```

If you prefer explicit imports instead of relying on global test functions, import helpers from `mocha` in your test files.

## Basic Configuration

Create `.mocharc.cjs` in the project root:

```js
module.exports = {
  spec: ['test/**/*.spec.js'],
  recursive: true,
  reporter: 'spec',
  timeout: 2000,
}
```

This keeps file discovery and timeout behavior explicit instead of depending on defaults.

Common options you will use most often:

- `spec`: test file globs to run
- `require`: setup files or root hook plugins to load before tests
- `reporter`: terminal or machine-readable output format
- `timeout`: default timeout in milliseconds for tests and hooks
- `recursive`: include matching files in nested directories

Run the suite with either form:

```bash
npx mocha
npm test
```

## Write A Basic Test

Example source file `src/math.js`:

```js
export function sum(a, b) {
  return a + b
}
```

Example test file `test/math.spec.js`:

```js
import assert from 'node:assert/strict'
import { describe, it } from 'mocha'

import { sum } from '../src/math.js'

describe('sum', function () {
  it('adds two numbers', function () {
    assert.equal(sum(2, 3), 5)
  })
})
```

Run a single file directly when iterating:

```bash
npx mocha test/math.spec.js
```

## Async Tests

Mocha supports promise-returning tests, `async` functions, and callback-style tests. Pick one style per test.

Preferred modern pattern:

```js
import assert from 'node:assert/strict'
import { describe, it } from 'mocha'

async function fetchUser(userId) {
  return { id: userId, name: 'Ada' }
}

describe('fetchUser', function () {
  it('returns a user object', async function () {
    const user = await fetchUser(42)
    assert.deepEqual(user, { id: 42, name: 'Ada' })
  })
})
```

Callback-style tests still work when the code under test uses callbacks:

```js
import assert from 'node:assert/strict'
import { it } from 'mocha'

function loadConfig(callback) {
  setTimeout(() => callback(null, { mode: 'test' }), 10)
}

it('loads config', function (done) {
  loadConfig((error, config) => {
    if (error) {
      return done(error)
    }

    assert.equal(config.mode, 'test')
    done()
  })
})
```

Important rule: do not return a promise and call `done()` in the same test. Use either `async` / promise style or callback style, not both.

## Hooks And Shared Setup

Use hooks for per-suite setup and teardown:

```js
import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'mocha'

let db

describe('account service', function () {
  before(async function () {
    db = await createTestDatabase()
  })

  beforeEach(async function () {
    await db.reset()
  })

  after(async function () {
    await db.close()
  })

  it('creates an account', async function () {
    const account = await db.createAccount({ email: 'user@example.com' })
    assert.equal(account.email, 'user@example.com')
  })
})

async function createTestDatabase() {
  return {
    async reset() {},
    async close() {},
    async createAccount(input) {
      return { id: 1, ...input }
    },
  }
}
```

For shared process-level setup, load a root hook plugin with `require`.

`test/hooks.cjs`:

```js
exports.mochaHooks = {
  beforeAll() {
    process.env.NODE_ENV = 'test'
  },
}
```

`.mocharc.cjs`:

```js
module.exports = {
  spec: ['test/**/*.spec.js'],
  require: ['./test/hooks.cjs'],
}
```

Use this pattern for shared environment setup, database bootstrapping, or global cleanup that must run before any suite executes.

## ESM And CommonJS

Mocha works with both module systems. Match the test files to the way your application runs.

For ESM projects, set `"type": "module"` in `package.json` and use `import` syntax:

```json
{
  "type": "module"
}
```

```js
import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
```

For CommonJS projects, keep test files or setup files as `.cjs` and use `require()`:

```js
const assert = require('node:assert/strict')
const { describe, it } = require('mocha')
```

Using `.mocharc.cjs` is a simple way to keep the Mocha config file portable even when the app itself uses ESM.

## Useful CLI Workflows

Run only one matching suite or test title:

```bash
npx mocha --grep "account service"
```

Watch files and rerun on change:

```bash
npx mocha --watch
```

Switch reporters when CI or tooling needs a different output format:

```bash
npx mocha --reporter dot
npx mocha --reporter json
```

Load setup code before tests start:

```bash
npx mocha --require dotenv/config --require ./test/hooks.cjs
```

Increase the default timeout for slower integration tests:

```bash
npx mocha --timeout 10000
```

## Pitfalls

### Do not use arrow functions when you need Mocha context

Arrow functions do not bind Mocha's test context. If you need APIs such as `this.timeout(...)`, use `function () {}` instead.

```js
import { describe, it } from 'mocha'

describe('slow path', function () {
  it('finishes within 10 seconds', function () {
    this.timeout(10_000)
  })
})
```

### Close open resources in teardown

If the process does not exit after the suite finishes, the usual cause is an open server, timer, socket, or database handle. Close those resources in `after()` or `afterEach()` instead of masking the problem with ad hoc process-exit workarounds.

### Keep focused tests out of CI

`.only()` is useful locally but dangerous in committed code because it can silently skip most of the suite. If your team relies on CI, add checks that fail the run when focused or pending tests are left in place.

## Minimal Working Layout

```text
.
├── .mocharc.cjs
├── package.json
├── src/
│   └── math.js
└── test/
    ├── hooks.cjs
    └── math.spec.js
```

This layout is enough for most Node.js services and libraries: a local Mocha dependency, explicit test globs, optional root hooks, and one `npm test` entry point.
