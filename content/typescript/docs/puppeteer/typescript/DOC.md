---
name: puppeteer
description: "TypeScript guidance for `puppeteer`, including how to handle `@types/puppeteer@7.0.4` in legacy projects, import the runtime package correctly, and use typed browser and page workflows."
metadata:
  languages: "typescript"
  versions: "7.0.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,puppeteer,browser,automation,types,definitelytyped,npm"
---

# Puppeteer TypeScript Guide

## Golden Rule

Application code imports from `puppeteer`, not from `@types/puppeteer`.

`@types/puppeteer` is only a declaration package. The runtime integration boundary is the `puppeteer` package that you actually install and execute. Current Puppeteer package metadata also publishes a `types` entry, so new projects should start from `puppeteer` itself and only keep `@types/puppeteer@7.0.4` when you are maintaining an older dependency tree that still expects it.

In practice:

- install `puppeteer`
- import from `"puppeteer"`
- add `typescript` and `@types/node` for a normal Node.js TypeScript app
- if a legacy project already pins `@types/puppeteer@7.0.4`, leave your imports unchanged and keep using `puppeteer` as the runtime package

## Install

For a current TypeScript project, install the runtime package and your TypeScript toolchain:

```bash
npm install puppeteer
npm install -D typescript @types/node
```

The Puppeteer README notes that `puppeteer` downloads a compatible Chrome during installation.

If you must keep the legacy declaration package in an older codebase, add it as a development dependency:

```bash
npm install -D @types/puppeteer@7.0.4
```

If your environment provides its own browser binary, skip the bundled browser download during install:

```bash
PUPPETEER_SKIP_DOWNLOAD=1 npm install puppeteer
```

No API keys or service credentials are required.

## Initialization

The important setup points are:

- import from `puppeteer`
- keep Node.js types available if you use `process.env`
- choose whether Puppeteer should use its downloaded browser or a browser executable you provide

### Import from `puppeteer`

Use the runtime package for both values and type-only imports:

```typescript
import puppeteer, {
  type Browser,
  type LaunchOptions,
  type Page,
} from "puppeteer";
```

Do not import anything from `@types/puppeteer`.

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "types": ["node"]
  }
}
```

You do not need to add `puppeteer` to `compilerOptions.types`. TypeScript reads its declarations from the imported runtime package.

### Optional environment variables

Puppeteer supports environment-based browser configuration.

```bash
export PUPPETEER_EXECUTABLE_PATH="/path/to/chrome-or-chromium"
export PUPPETEER_SKIP_DOWNLOAD=1
```

`PUPPETEER_EXECUTABLE_PATH` points Puppeteer at a browser binary you manage yourself. In current Puppeteer configuration, setting `PUPPETEER_EXECUTABLE_PATH` also causes download skipping unless you override it.

## Common Workflows

### Launch a browser with typed `Browser` and `Page` handles

Use `puppeteer.launch()` to create a browser, then open pages from that browser instance.

```typescript
import puppeteer, { type Browser, type Page } from "puppeteer";

export async function openHomePage(url: string): Promise<string> {
  const browser: Browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page: Page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    return await page.title();
  } finally {
    await browser.close();
  }
}
```

This is the normal TypeScript boundary: `Browser` owns lifecycle, and `Page` exposes navigation, DOM interaction, screenshots, PDF generation, and evaluation APIs.

### Centralize launch configuration with `LaunchOptions`

Type reusable launch settings with `LaunchOptions`, especially when your app optionally uses a system browser.

```typescript
import puppeteer, {
  type Browser,
  type LaunchOptions,
} from "puppeteer";

function createLaunchOptions(): LaunchOptions {
  return {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  };
}

export async function createBrowser(): Promise<Browser> {
  return await puppeteer.launch(createLaunchOptions());
}
```

Using `process.env.PUPPETEER_EXECUTABLE_PATH || undefined` avoids passing an empty string into `executablePath`.

### Wait for elements and extract typed page data

The most common scraping or automation flow is: navigate, wait for a selector, then read structured data from the DOM.

```typescript
import puppeteer, { type Page } from "puppeteer";

type ProductCard = {
  title: string;
  price: string;
};

export async function readProducts(page: Page): Promise<ProductCard[]> {
  await page.waitForSelector(".product-card", {
    visible: true,
    timeout: 30_000,
  });

  return await page.$$eval(".product-card", (cards) => {
    return cards.map((card) => {
      const title = card.querySelector("h2")?.textContent?.trim() ?? "";
      const price = card.querySelector(".price")?.textContent?.trim() ?? "";

      return { title, price };
    });
  });
}
```

`waitForSelector()` is the right place to express visibility and timeout rules. `$$eval()` is a practical way to return plain serializable data instead of leaking DOM types back into Node.js code.

### Reuse a typed page helper in test or worker code

Accept `Page` as an argument when you want helper functions that work in scripts, jobs, or test runners.

```typescript
import { type Page } from "puppeteer";

export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("https://example.com/login", { waitUntil: "networkidle2" });
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector("[data-test='account-home']", {
    visible: true,
  });
}
```

This keeps your automation helpers easy to compose without hiding the real Puppeteer page object behind an untyped wrapper.

## Important Pitfalls

- Do not import from `@types/puppeteer`; import from `puppeteer`.
- Treat `@types/puppeteer@7.0.4` as a compile-time package only. It does not provide browser automation at runtime.
- For new projects, check the `puppeteer` package you actually install before keeping an extra `@types/puppeteer` dependency; current Puppeteer releases publish their own `types` entry.
- `puppeteer` downloads a browser by default during installation. If you skip the download, also provide a usable browser executable.
- `waitForSelector()` can time out or resolve only after the element becomes available. Keep explicit timeout and visibility settings in code that depends on DOM readiness.
- If your project restricts ambient type packages with `compilerOptions.types`, include `node` when you reference `process.env` in launch configuration.

## Minimal End-to-End Example

```typescript
import puppeteer, {
  type Browser,
  type LaunchOptions,
  type Page,
} from "puppeteer";

type SearchResult = {
  title: string;
  href: string;
};

function getLaunchOptions(): LaunchOptions {
  return {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  };
}

export async function fetchFirstResults(url: string): Promise<SearchResult[]> {
  const browser: Browser = await puppeteer.launch(getLaunchOptions());

  try {
    const page: Page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("a", { visible: true, timeout: 30_000 });

    return await page.$$eval("a", (anchors) => {
      return anchors.slice(0, 5).map((anchor) => ({
        title: anchor.textContent?.trim() ?? "",
        href: anchor.getAttribute("href") ?? "",
      }));
    });
  } finally {
    await browser.close();
  }
}
```

This example shows the practical TypeScript boundary for Puppeteer projects:

- environment-aware launch options
- `Browser` and `Page` type imports from the runtime package
- explicit DOM waiting
- returning plain JSON-safe data from page evaluation

## Version Note

This guide is written for the `@types/puppeteer` `7.0.4` package entry on npm.

For that package entry, the practical rules are:

- your code still imports from `puppeteer`
- the declaration package is only for compile-time typing
- current Puppeteer releases publish their own `types` entry, so avoid duplicate type-package installs in new projects unless you are intentionally maintaining a legacy dependency set
