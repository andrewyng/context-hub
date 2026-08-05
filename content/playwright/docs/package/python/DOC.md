---
name: package
description: "Playwright Python package guide for browser automation, end-to-end testing, and authenticated browser flows"
metadata:
  languages: "python"
  versions: "1.60.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "playwright,python,browser,testing,e2e,automation"
---

# Playwright Python Package Guide

## Golden Rule

Use the official `playwright` Python package, install the browser binaries after installing the wheel, and choose one API style per codepath: `playwright.sync_api` for sync code or `playwright.async_api` for async code. For resilient tests and automation, prefer locator-based actions such as `get_by_role()` over brittle CSS/XPath selectors.

## Install And Setup

Pin the package version your project expects:

```bash
python -m pip install "playwright==1.60.0"
```

Install browser binaries after the package install:

```bash
python -m playwright install
```

Common variants:

```bash
python -m playwright install chromium
python -m playwright install chromium firefox webkit
python -m playwright install --with-deps chromium
uv add "playwright==1.60.0"
poetry add "playwright==1.60.0"
```

Notes:

- `pip install playwright` does not download browser binaries.
- On Linux CI or fresh containers, `python -m playwright install --with-deps chromium` is the quickest path to a working Chromium setup.
- Use `pytest-playwright` when you want the pytest plugin and its browser fixtures; the core `playwright` package is enough for scripts, crawlers, smoke tests, and custom harnesses.

## Initialize A Browser Session

### Sync API

Use the sync API in scripts, CLIs, and regular synchronous test code:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://playwright.dev/")
    page.get_by_role("link", name="Docs").click()
    print(page.title())
    browser.close()
```

### Async API

Use the async API when your app already uses `asyncio`:

```python
import asyncio
from playwright.async_api import async_playwright

async def main() -> None:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://playwright.dev/")
        await page.get_by_role("link", name="Docs").click()
        print(await page.title())
        await browser.close()

asyncio.run(main())
```

## Core Usage Patterns

### Use browser contexts for isolation

Contexts isolate cookies, local storage, permissions, extra headers, locale, and viewport settings:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(
        base_url="https://example.com",
        locale="en-US",
        viewport={"width": 1440, "height": 900},
    )
    page = context.new_page()
    page.goto("/")
    page.get_by_label("Email").fill("user@example.com")
    page.get_by_label("Password").fill("correct-horse-battery-staple")
    page.get_by_role("button", name="Sign in").click()
    context.close()
    browser.close()
```

Use a new context per test or workflow unless you intentionally want shared browser state.

### Prefer locators over manual waits

Playwright's locator API auto-waits for actionability. Prefer:

- `page.get_by_role(...)`
- `page.get_by_label(...)`
- `page.get_by_text(...)`
- `page.get_by_placeholder(...)`
- `page.get_by_test_id(...)`
- `page.locator(...)` for CSS or chained queries when no semantic locator fits

```python
page.get_by_role("button", name="Sign in").click()
page.get_by_label("Email").fill("user@example.com")
page.get_by_test_id("user-menu").click()
page.locator("main").get_by_role("listitem").first.click()
```

Avoid writing code that depends on `time.sleep(...)` or fragile selectors when a semantic locator exists.

### Web-first assertions with `expect`

Playwright ships an `expect` helper that auto-retries until the assertion passes or the timeout elapses. Import it from the matching API module:

```python
from playwright.sync_api import expect, sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://playwright.dev/")

    docs_link = page.get_by_role("link", name="Docs")
    expect(docs_link).to_be_visible()
    expect(docs_link).to_have_attribute("href", "/docs/intro")
    expect(page).to_have_title("Fast and reliable end-to-end testing for modern web apps | Playwright")
    expect(page).to_have_url("https://playwright.dev/")
```

Common assertions: `to_be_visible`, `to_be_hidden`, `to_be_enabled`, `to_be_checked`, `to_have_text`, `to_contain_text`, `to_have_value`, `to_have_count`, `to_have_attribute`, `to_have_url`, `to_have_title`.

For the async API, import `expect` from `playwright.async_api` and `await` each call:

```python
from playwright.async_api import expect, async_playwright

async with async_playwright() as p:
    browser = await p.chromium.launch()
    page = await browser.new_page()
    await page.goto("https://playwright.dev/")
    await expect(page.get_by_role("link", name="Docs")).to_be_visible()
```

### Bootstrap selectors with codegen when needed

```bash
python -m playwright codegen https://example.com
```

Use generated selectors as a starting point, then simplify them into stable role, label, or test-id locators before committing test code.

## Pytest Plugin Workflow

Install the plugin separately:

```bash
python -m pip install pytest-playwright
```

The plugin provides ready-made fixtures: `browser`, `context`, `page`, `browser_name`, `browser_type`, `browser_channel`, `playwright`, plus `browser_context_args` and `browser_type_launch_args` for project-level overrides.

Minimal pytest usage:

```python
from playwright.sync_api import Page, expect

def test_homepage(page: Page):
    page.goto("https://playwright.dev/")
    expect(page.get_by_role("link", name="Docs")).to_be_visible()
```

Override context defaults at the project level in `conftest.py`:

```python
import pytest

@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "base_url": "https://example.com",
        "locale": "en-US",
        "viewport": {"width": 1440, "height": 900},
    }
```

Common CLI flags:

```bash
pytest --browser chromium
pytest --browser firefox --headed
pytest --device "iPhone 13"
pytest --tracing retain-on-failure
pytest --screenshot only-on-failure
pytest --video retain-on-failure
pytest --output test-results
pytest --slowmo 250
```

Important plugin behavior:

- Plugin CLI arguments only apply to the default `browser`, `context`, and `page` fixtures.
- If you call `browser.new_context()` yourself, pass the options explicitly or override fixtures such as `browser_context_args`.
- For async pytest fixtures and tests, use `pytest-playwright-asyncio` together with a compatible `pytest-asyncio` release instead of mixing sync fixtures into async code.

## Authentication And State Reuse

Persist authenticated state with `storage_state()` so login happens once and later runs reuse the session:

```python
from pathlib import Path
from playwright.sync_api import sync_playwright

AUTH_FILE = Path("playwright/.auth/user.json")

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

    page.goto("https://example.com/login")
    page.get_by_label("Email").fill("user@example.com")
    page.get_by_label("Password").fill("correct-horse-battery-staple")
    page.get_by_role("button", name="Sign in").click()

    AUTH_FILE.parent.mkdir(parents=True, exist_ok=True)
    context.storage_state(path=str(AUTH_FILE), indexed_db=True)

    context.close()
    browser.close()
```

Reuse it later:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(storage_state="playwright/.auth/user.json")
    page = context.new_page()
    page.goto("https://example.com/app")
    browser.close()
```

Notes:

- Treat storage-state files like secrets; they can contain session cookies and local storage.
- Add `playwright/.auth/` to `.gitignore`.
- `indexed_db=True` matters for apps that keep auth in IndexedDB instead of only cookies or local storage.

## Browser And Network Configuration

Useful launch and install controls:

```python
browser = p.chromium.launch(
    headless=False,
    slow_mo=250,
    channel="chrome",
)
```

Environment variables that matter in enterprise and CI setups:

- `PLAYWRIGHT_BROWSERS_PATH`: share browser binaries across projects or CI jobs
- `PLAYWRIGHT_DOWNLOAD_HOST`: use a custom download mirror
- `PLAYWRIGHT_NODEJS_PATH`: point Playwright at a custom Node.js binary for browser installs
- `HTTPS_PROXY`: proxy for browser downloads
- `NODE_EXTRA_CA_CERTS`: extra trusted CAs for TLS interception environments

If browser downloads fail behind a corporate proxy or custom CA, fix the environment first instead of retrying tests with partially installed browsers.

## Common Pitfalls

### 1. Package installed, browsers missing

If you see executable-not-found errors after `pip install`, run:

```bash
python -m playwright install
```

Re-run it after upgrading Playwright to a version that expects newer browser builds.

### 2. Mixing sync and async APIs

Do not call sync Playwright APIs inside an `asyncio` event loop, and do not forget `await` on async Playwright calls. Pick one import style and keep the whole stack consistent.

### 3. Using brittle selectors

The deprecated React and Vue locator engines (`_react=`, `_vue=`) and the `:light` CSS extension were removed in `1.58` and remain gone in `1.60`. Prefer accessibility-first locators and test IDs.

### 4. Assuming old launch options still exist

The `devtools` launch option was removed in `1.58` and is not coming back. Pass Chromium args directly when you need equivalent behavior.

### 5. Leaking state between tests

A `browser` can host many contexts. Reusing one context across unrelated tests usually creates order-dependent failures. Prefer a fresh context per test or per authenticated role.

### 6. Committing auth artifacts

Storage-state files and screenshots can contain secrets, account data, or internal URLs. Keep them out of version control unless they are sanitized fixtures created for testing only.

## Version-Sensitive Notes For 1.60.0

- The `1.58` removals of `_react`, `_vue`, `:light`, and the `devtools` launch option still apply through `1.60`.
- macOS 13 is no longer a supported target for WebKit.
- If you are copying older community snippets, expect selector and launch-option drift around these removed features.
- `storage_state(indexed_db=True)` captures IndexedDB-backed auth state; use it when cookie-only snapshots are not enough.
- Re-run `python -m playwright install` after upgrading to `1.60.0`; the bundled browser binaries change between minor releases.

## Official Source URLs

- Docs intro: `https://playwright.dev/python/docs/intro`
- API reference: `https://playwright.dev/python/docs/api/class-playwright`
- Library guide: `https://playwright.dev/python/docs/library`
- Locators guide: `https://playwright.dev/python/docs/locators`
- Authentication guide: `https://playwright.dev/python/docs/auth`
- Test runners guide: `https://playwright.dev/python/docs/test-runners`
- Browsers and install env vars: `https://playwright.dev/python/docs/browsers`
- Release notes: `https://playwright.dev/python/docs/release-notes`
- PyPI package: `https://pypi.org/project/playwright/`
