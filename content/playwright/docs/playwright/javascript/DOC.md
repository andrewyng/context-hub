---
name: playwright
description: "Playwright for JavaScript and Node.js: browser automation, locators, auth state reuse, and browser installation"
metadata:
  languages: "javascript"
  versions: "1.58.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "playwright,javascript,nodejs,browser,testing,e2e,automation"
---

# Playwright JavaScript Package Guide

## Golden Rule

Use the official `playwright` package for browser automation in JavaScript and Node.js, keep browser binaries aligned with the installed package version, prefer locator-based actions such as `getByRole()` over brittle CSS/XPath selectors, and use a fresh browser context per test or workflow. If you want the Playwright test runner, install `@playwright/test` separately.

## Install And Setup

Install the library package:

```bash
npm install -D playwright
```

Common package-manager variants:

```bash
pnpm add -D playwright
yarn add -D playwright
```

Provision browsers explicitly on fresh machines, CI, or container images:

```bash
npx playwright install
npx playwright install chromium
npx playwright install chromium firefox webkit
npx playwright install --with-deps chromium
```

Notes:

- `playwright` is the browser automation library plus CLI.
- `playwright-core` is the lower-level package when you do not want Playwright to manage browser downloads.
- `@playwright/test` is the Playwright test runner package; install it separately when you want fixtures, assertions, retries, projects, and reporter support.
- On Linux CI or brand-new containers, `npx playwright install --with-deps chromium` is the quickest path to a working Chromium setup.

## Useful Environment Variables

These environment variables matter most in CI, proxy, or enterprise setups:

```bash
PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"
HTTPS_PROXY="http://proxy.internal:8080"
NODE_EXTRA_CA_CERTS="/etc/ssl/certs/internal-root-ca.pem"
```

Typical commands:

```bash
PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright" npx playwright install chromium
PWDEBUG=1 node scripts/login.mjs
```

Important variables from the browser-install docs:

- `PLAYWRIGHT_BROWSERS_PATH`: store browser binaries in a shared location instead of the default cache.
- `PLAYWRIGHT_DOWNLOAD_HOST`: use a custom browser download mirror.
- `HTTPS_PROXY`: route browser downloads through a proxy.
- `NODE_EXTRA_CA_CERTS`: trust additional CA certificates when TLS interception is in place.
- `PWDEBUG=1`: launch headed debugging with Playwright Inspector.

If browser installation fails behind a proxy or custom certificate chain, fix the environment first instead of retrying tests with partially installed browsers.

## Initialize A Browser Session

Use the library directly in scripts, custom harnesses, crawlers, and smoke tests:

```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  baseURL: process.env.E2E_BASE_URL ?? 'https://playwright.dev',
  locale: 'en-US',
  viewport: { width: 1440, height: 900 },
});

const page = await context.newPage();
await page.goto('/');
await page.getByRole('link', { name: 'Docs' }).click();

console.log(await page.title());

await context.close();
await browser.close();
```

If your project uses CommonJS instead of ESM:

```javascript
const { chromium } = require('playwright');
```

## Core Usage Patterns

### Use browser contexts for isolation

Contexts isolate cookies, local storage, permissions, headers, locale, timezone, and viewport settings:

```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  baseURL: process.env.E2E_BASE_URL ?? 'https://example.com',
  locale: 'en-US',
  timezoneId: 'America/Los_Angeles',
  viewport: { width: 1440, height: 900 },
  extraHTTPHeaders: {
    'x-test-run': 'smoke',
  },
});

const page = await context.newPage();
await page.goto('/login');
await page.getByLabel('Email').fill(process.env.E2E_EMAIL ?? 'user@example.com');
await page.getByLabel('Password').fill(process.env.E2E_PASSWORD ?? 'correct-horse-battery-staple');
await page.getByRole('button', { name: 'Sign in' }).click();

await context.close();
await browser.close();
```

Use a new context per test or per authenticated role unless you intentionally want shared browser state.

### Prefer locators over manual waits

Playwright locators auto-wait for visibility, stability, and other actionability checks. Prefer:

- `page.getByRole(...)`
- `page.getByLabel(...)`
- `page.getByText(...)`
- `page.getByTestId(...)`
- `page.locator(...)` when you truly need a CSS or text-based locator chain

Avoid `page.waitForTimeout()` for readiness checks when a locator, navigation wait, or network wait expresses the condition directly.

### Persist and reuse authenticated state

Save storage state after an interactive login so later runs can start from an already-authenticated session:

```javascript
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const authFile = 'playwright/.auth/user.json';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${process.env.E2E_BASE_URL ?? 'https://example.com'}/login`);
await page.getByLabel('Email').fill(process.env.E2E_EMAIL ?? 'user@example.com');
await page.getByLabel('Password').fill(process.env.E2E_PASSWORD ?? 'correct-horse-battery-staple');
await page.getByRole('button', { name: 'Sign in' }).click();

await mkdir('playwright/.auth', { recursive: true });
await context.storageState({
  path: authFile,
  indexedDB: true,
});

await context.close();
await browser.close();
```

Reuse it later:

```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  storageState: 'playwright/.auth/user.json',
});

const page = await context.newPage();
await page.goto(`${process.env.E2E_BASE_URL ?? 'https://example.com'}/app`);

await context.close();
await browser.close();
```

Notes:

- Treat storage-state files like secrets because they can contain cookies, local storage, and IndexedDB-backed auth state.
- Add `playwright/.auth/` to `.gitignore`.
- `indexedDB: true` matters when the app stores authentication outside cookies or local storage.

### Intercept or stub network requests

Use routing when you need deterministic UI tests or want to decouple browser flows from unstable backends:

```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  baseURL: process.env.E2E_BASE_URL ?? 'https://example.com',
});
const page = await context.newPage();

await page.route('**/api/search**', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 1, title: 'stubbed result' }] }),
  });
});

await page.goto('/search');
await page.getByRole('textbox', { name: 'Search' }).fill('playwright');
await page.getByRole('button', { name: 'Submit' }).click();

await context.close();
await browser.close();
```

Use `route.continue()` when you want to modify or inspect the outgoing request and still hit the real backend.

### Bootstrap selectors with codegen

Use the code generator to explore a page and capture initial locator suggestions:

```bash
npx playwright codegen https://example.com
```

Treat generated selectors as a starting point. Simplify them into role, label, or test-id locators before committing test code.

### Capture a trace for debugging

Tracing is useful when a browser flow works locally but fails in CI:

```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext();

await context.tracing.start({
  screenshots: true,
  snapshots: true,
});

const page = await context.newPage();
await page.goto(process.env.E2E_BASE_URL ?? 'https://playwright.dev');

await context.tracing.stop({ path: 'playwright-trace.zip' });
await context.close();
await browser.close();
```

Open the trace locally:

```bash
npx playwright show-trace playwright-trace.zip
```

## Playwright Test Runner Workflow

The `playwright` package does not replace the test-runner package. When you want `test()`, `expect()`, fixtures, retries, and project configuration, install `@playwright/test` too:

```bash
npm install -D @playwright/test
npx playwright install
```

Minimal `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Minimal test:

```typescript
import { test, expect } from '@playwright/test';

test('homepage shows docs link', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Docs' })).toBeVisible();
});
```

Run it:

```bash
npx playwright test
npx playwright test --project=chromium --headed
```

## Common Pitfalls

### 1. Package installed, browsers missing or mismatched

If you see browser executable errors or version-mismatch errors, run:

```bash
npx playwright install
```

Re-run browser installation after upgrading Playwright to a version that expects newer browser builds.

### 2. Confusing `playwright`, `playwright-core`, and `@playwright/test`

- Use `playwright` for the automation library and CLI.
- Use `@playwright/test` for the test runner.
- Use `playwright-core` only when another tool or environment manages browsers for you.

### 3. Using brittle selectors

Prefer role, label, placeholder, text, and test-id locators. Older community snippets that depend on framework-specific selector engines or long CSS chains are usually harder to maintain.

### 4. Waiting with fixed sleeps

`page.waitForTimeout()` is fine for local debugging, but it is a poor readiness strategy in committed tests. Prefer locator actions, `waitForURL()`, `waitForResponse()`, or other waits that match the real condition.

### 5. Reusing one context across unrelated tests

A browser can host many contexts. Reusing one context across unrelated tests tends to leak cookies, permissions, and storage, which creates order-dependent failures.

### 6. Committing auth artifacts and traces

Storage-state files, screenshots, videos, and traces can contain secrets, account data, and internal URLs. Keep them out of version control unless they are sanitized fixtures created for testing.

## Version-Sensitive Notes For 1.58.2

- Playwright `1.58.x` includes the `1.58.0` breaking removals of `_react`, `_vue`, `:light`, and the Chromium `devtools` launch option.
- If you are copying older snippets, rewrite selector logic around role, label, text, or test-id locators instead of removed selector engines.
- If you relied on the old `devtools` launch flag, switch to Chromium launch arguments or Playwright Inspector-based debugging.
- Playwright `1.58` also dropped macOS 13 support for WebKit.

## Official Source URLs

- Intro: `https://playwright.dev/docs/intro`
- API reference: `https://playwright.dev/docs/api/class-playwright`
- Library guide: `https://playwright.dev/docs/library`
- Locators guide: `https://playwright.dev/docs/locators`
- Authentication guide: `https://playwright.dev/docs/auth`
- Network guide: `https://playwright.dev/docs/network`
- Codegen guide: `https://playwright.dev/docs/codegen`
- Browser install and environment variables: `https://playwright.dev/docs/browsers`
- Release notes: `https://playwright.dev/docs/release-notes`
- npm package: `https://www.npmjs.com/package/playwright`
