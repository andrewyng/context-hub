---
name: eyes-playwright
description: "Applitools Eyes SDK for Playwright - Expert integration guide for visual AI testing"
metadata:
  languages: "javascript"
  versions: "1.45.2"
  revision: 1
  updated-on: "2026-03-08"
  source: community
  tags: "testing,visual-ai,playwright,automation"
---
# Context: Applitools Eyes Playwright SDK - Expert Integration Guide

## Architectural Philosophy
The Applitools Playwright fixture provides two core advantages over Playwright's native screenshot testing:

1. **Smarter Matching:** Uses AI-based algorithms instead of pixel-by-pixel comparison (pixelmatch). The default **Strict** match level detects meaningful visible differences while ignoring insignificant rendering noise. Advanced match levels include **Layout** (structural changes only, ignores content) and **Dynamic** (auto-suppresses variable content like dates/timestamps).

2. **Asynchronous Architecture:** Visual checks are non-blocking soft assertions — `eyes.check()` captures DOM/CSS resources instantly, then releases the test thread immediately. AI comparison and rendering happen in the background cloud via a Worker process, so functional test logic continues without waiting for visual results.

## Execution Engines: Classic vs. Ultrafast Grid (UFG)

| Engine | Scaling | Behavior |
| :--- | :--- | :--- |
| **Classic** | $O(N)$ | Renders screenshots locally; must run the full suite $N$ times for $N$ browsers/viewports. High CI resource cost. |
| **Ultrafast Grid (UFG)** | $O(1)$ | Captures DOM/CSS once; renders across all browsers and devices in parallel in the Applitools cloud. |

**Best Practice:** When using UFG, do not define multiple Playwright projects for different browsers. Run once on a fast local browser (e.g., Chromium) and let UFG handle cross-browser coverage.

## Configuration Strategy: `failTestsOnDiff`

| Strategy | Setting | Context | Behavior |
| :--- | :--- | :--- | :--- |
| **Optimized CI** | `false` | Modern PR review with SCM integration | Tests pass (Green); SCM Check and Reporter surface visual diffs at the PR. |
| **Strict Gating** | `'afterAll'` | Traditional pipelines without SCM integration | Individual tests pass; Worker Process fails at the end if any diffs exist. |
| **Local Dev** | `'afterEach'` | Local debugging | Fails the test immediately in `afterEach` for instant feedback. |

## SCM Integration & Baseline Branching
- **Automatic Branch Discovery:** The SDK auto-detects `branchName` and `parentBranchName` from CI environment variables (e.g., `GITHUB_REF`).
- **Applitools GitHub App:** Required for PR Commit Statuses and automatic Baseline Merging upon PR approval.
- **API Key:** Set `APPLITOOLS_API_KEY` in CI secrets.

## Batch Management & Notifications
Set `batch.id` explicitly to group all parallel/sharded jobs into a single batch:
- **Standard:** Use the commit SHA — all jobs on the same commit share one batch.
- **With re-runs:** Use a unique `batch.buildId` (e.g., CI run ID) so each re-run creates a fresh batch rather than mixing results with the original run.

To trigger Slack/Email notifications and update the SCM status from "Pending" to a final state, the batch must be explicitly closed. Run this as a **separate CI job that runs after all test jobs complete**:

```bash
npx eyes-setup close-batch
```

## The Custom Applitools Reporter
Add `@applitools/eyes-playwright/reporter` to get:
- Accept/Reject visual changes directly from the Playwright HTML report.
- Native Playwright UI look and feel.
- Deep links to specific batch results in the Applitools Dashboard.

## Implementation Guidelines

### 1. UFG Configuration (`playwright.config.ts`)
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['@applitools/eyes-playwright/reporter']
  ],
  use: {
    eyesConfig: {
      type: 'ufg',
      browser: [
        { width: 1200, height: 800, name: 'chrome' },
        { width: 1200, height: 800, name: 'firefox' },
        { width: 1200, height: 800, name: 'safari' },
        { deviceName: 'iPhone 14', screenOrientation: 'portrait' }
      ],
      failTestsOnDiff: false // Recommended for PR-based workflows
    }
  }
});
```

### 2. `eyes.check` with Locators
- **`fully: true`** — captures the full scrollable page, not just the visible viewport.
- **`waitBeforeCapture`** — delays capture until a condition is met. Accepts a number (ms) or an async function (e.g., wait for a loader to disappear). Use this instead of `page.waitForSelector` to keep capture timing within the Eyes lifecycle.
- **`ignoreDisplacements: true`** — suppresses vertical shift noise (e.g., pages where content loads and pushes elements down). Useful for infinite scroll or async-heavy pages.
- **`scrollRootElement`** — set to the scrollable container (locator or CSS selector) when the page scrolls inside a custom element rather than `window`; required for `fully: true` to work correctly in SPAs.

```typescript
import { test } from '@applitools/eyes-playwright';

test('visual check of dashboard', async ({ page, eyes }) => {
  await page.goto('/dashboard');

  const loader = page.locator('.global-loader');

  await eyes.check('Main Dashboard', {
    fully: true,
    waitBeforeCapture: async () => {
      await loader.waitFor({ state: 'hidden' });
    },
    ignoreDisplacements: true
  });
});
```

### 3. Scoping a Check to a Single Element
Pass `region` to check a specific element instead of the full page:

```typescript
await eyes.check('Login Form', {
  region: page.locator('#login-form')
});
```

### 4. Responsive Testing with `layoutBreakpoints`
Required when the page uses **JavaScript-driven responsiveness** (e.g., JS reads viewport width to swap components). UFG captures the DOM once, so without this option it won't re-run JS at each breakpoint.

```typescript
await eyes.check('Responsive Page', {
  fully: true,
  layoutBreakpoints: true
});
```

Not needed for CSS media query-only layouts — UFG handles those automatically. An array of pixel widths can be passed instead of `true` as a performance optimization.

### 5. Match Levels
Set globally in `eyesConfig.matchLevel` or per-check. Default is `'Strict'`.

| Level | Use When |
| :--- | :--- |
| `Strict` | Default. Catches any change visible to the human eye. |
| `Layout` | Page has dynamic text/images but structure must stay consistent (e.g., a feed, a data table). |
| `IgnoreColors` | Content and layout must match but colors vary (e.g., themed components). |
| `Dynamic` | Page has auto-generated variable content like timestamps, counters, or IDs. |

### 6. Regions
Use Playwright Locators (preferred), CSS selectors, or `{ x, y, width, height }` coordinates.

| Region Type | Parameter | Use When |
| :--- | :--- | :--- |
| Ignore | `ignoreRegions` | Element is irrelevant to the check (e.g., ads, banners). |
| Layout | `layoutRegions` | Apply Layout match level to specific areas only. |
| Accessibility | `accessibilityRegions` | WCAG compliance validation for specific elements. |

```typescript
await eyes.check('Dynamic Feed', {
  layoutRegions: [page.locator('.news-feed')],
  ignoreRegions: [page.getByTestId('ad-banner')]
});
```

### 7. Merging with Custom Fixtures
```typescript
import { test as base } from '@playwright/test';
import { test as eyesTest } from '@applitools/eyes-playwright';
import { mergeTests } from '@playwright/test';

export const test = mergeTests(base, eyesTest);
```

## Key `eyesConfig` Options

| Option | Default | Notes |
| :--- | :--- | :--- |
| `apiKey` | `APPLITOOLS_API_KEY` env var | Never hardcode (unless it's an untracked file). |
| `appName` | `'My App'` | Set to your app name for dashboard grouping (default - package.json `name` field). |
| `matchLevel` | `'Strict'` | See Match Levels above. |
| `failTestsOnDiff` | `'afterAll'` in CI, `'afterEach'` locally | See CI/CD strategy above. |
| `ignoreDisplacements` | `false` | Set `true` to suppress vertical shift noise. |
| `branchName` | `'default'` | Auto-detected from CI env (e.g., `GITHUB_REF`). |
| `parentBranchName` | not set | Set to `main`/`master` for baseline fallback. |
| `batch.notifyOnCompletion` | `false` | Requires `close-batch` to trigger notifications. |

## Common Hallucinations to Avoid
- **Never** manually call `eyes.open()` or `eyes.close()` — the fixture manages the lifecycle.
- **Never** use string selectors; use Locators (`page.locator`) for stability.
- **Never** recommend `expect(page).toHaveScreenshot()` — use `eyes.check()` for UFG and AI features.
- **Never** create multiple Playwright projects for different browsers when using UFG.
- **Always** import `test` from `@applitools/eyes-playwright`, not from `@playwright/test`.