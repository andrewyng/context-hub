---
name: puppeteer
description: "JavaScript guide for `puppeteer`, including browser installation, launch configuration, navigation, selectors, screenshots, PDFs, and common automation patterns."
metadata:
  languages: "javascript"
  versions: "24.39.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "puppeteer,javascript,browser,automation,testing,scraping,npm"
---

# Puppeteer Guide

## Golden Rule

Use the `puppeteer` package when you want one package to handle both the Puppeteer API and a compatible browser install.

If you skip the browser download, also provide a browser executable path or install a browser separately before calling `puppeteer.launch()`.

No API key or remote service authentication is required. Puppeteer controls a local or already-running browser.

## Install

Install the runtime package:

```bash
npm install puppeteer
```

By default, `puppeteer` downloads a compatible browser during installation.

If your environment already provides a browser binary, skip the bundled download:

```bash
PUPPETEER_SKIP_DOWNLOAD=1 npm install puppeteer
```

If you skip the download and still want Puppeteer to manage browser binaries later, install one explicitly:

```bash
npx puppeteer browsers install chrome
```

## Optional Environment Variables

Use environment variables when you need to control browser installation or execution without hardcoding paths in application code.

```bash
export PUPPETEER_SKIP_DOWNLOAD=1
export PUPPETEER_EXECUTABLE_PATH="/path/to/chrome-or-chromium"
```

- `PUPPETEER_SKIP_DOWNLOAD=1` skips the browser download during package installation.
- `PUPPETEER_EXECUTABLE_PATH` points Puppeteer at a browser binary you manage yourself.

## Initialization

### Launch a browser

```javascript
import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: true,
});

try {
  const page = await browser.newPage();
  await page.goto("https://example.com", { waitUntil: "networkidle2" });
  console.log(await page.title());
} finally {
  await browser.close();
}
```

### Launch with an executable path from the environment

```javascript
import puppeteer from "puppeteer";

function getLaunchOptions() {
  return {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  };
}

const browser = await puppeteer.launch(getLaunchOptions());
```

Using `process.env.PUPPETEER_EXECUTABLE_PATH || undefined` avoids passing an empty string into `executablePath`.

### Connect to an already-running browser

Use `connect()` when Chrome or Chromium is already running with remote debugging enabled.

```javascript
import puppeteer from "puppeteer";

const browser = await puppeteer.connect({
  browserURL: "http://127.0.0.1:9222",
});

const page = await browser.newPage();
await page.goto("https://example.com");
```

## Common Workflows

### Open a page and wait for content

```javascript
import puppeteer from "puppeteer";

export async function openHomePage(url) {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("body", { timeout: 30_000 });
    return await page.title();
  } finally {
    await browser.close();
  }
}
```

### Wait for selectors and extract structured data

`$$eval()` is a practical way to return plain serializable data from the page.

```javascript
import puppeteer from "puppeteer";

export async function readProducts(url) {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.waitForSelector(".product-card", {
      visible: true,
      timeout: 30_000,
    });

    return await page.$$eval(".product-card", (cards) => {
      return cards.map((card) => ({
        title: card.querySelector("h2")?.textContent?.trim() ?? "",
        price: card.querySelector(".price")?.textContent?.trim() ?? "",
      }));
    });
  } finally {
    await browser.close();
  }
}
```

### Fill a form and submit it

If a click triggers navigation, start `waitForNavigation()` and the click together.

```javascript
import puppeteer from "puppeteer";

export async function login(url, email, password) {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForSelector("[data-test='account-home']", {
      visible: true,
      timeout: 30_000,
    });
  } finally {
    await browser.close();
  }
}
```

### Capture a screenshot

```javascript
import puppeteer from "puppeteer";

export async function captureScreenshot(url, outputPath = "page.png") {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: "png",
    });
  } finally {
    await browser.close();
  }
}
```

### Generate a PDF

```javascript
import puppeteer from "puppeteer";

export async function writePdf(url, outputPath = "page.pdf") {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
    });
  } finally {
    await browser.close();
  }
}
```

## Important Pitfalls

- `puppeteer` downloads a browser by default during installation. If you skip that step, `launch()` still needs a usable browser.
- Always close the browser in a `finally` block so background browser processes do not accumulate.
- Use `waitForSelector()` before interacting with dynamic pages instead of assuming the DOM is ready immediately after `goto()`.
- If an action causes navigation, pair it with `waitForNavigation()` in `Promise.all()` so you do not miss the navigation event.
- `evaluate()`, `$eval()`, and `$$eval()` should return serializable values, not DOM nodes or handles.
- This guide covers `puppeteer`. If you switch to `puppeteer-core`, browser download and configuration behavior is different.

## Minimal End-to-End Example

```javascript
import puppeteer from "puppeteer";

function getLaunchOptions() {
  return {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  };
}

export async function fetchHeadlines(url) {
  const browser = await puppeteer.launch(getLaunchOptions());

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("h1, h2", {
      visible: true,
      timeout: 30_000,
    });

    return await page.$$eval("h1, h2", (elements) => {
      return elements
        .slice(0, 10)
        .map((element) => element.textContent?.trim() ?? "")
        .filter(Boolean);
    });
  } finally {
    await browser.close();
  }
}
```

This example keeps the main integration points explicit:

- launch configuration can come from environment variables
- the browser lifecycle stays inside one function
- page reads return plain JavaScript data
