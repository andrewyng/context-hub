---
name: selenium-webdriver
description: "TypeScript declarations for Selenium WebDriver sessions, locators, waits, and page-object-style helpers in Node.js automation code."
metadata:
  languages: "typescript"
  versions: "4.35.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,selenium,webdriver,browser-automation,testing,types,definitelytyped"
---

# Selenium WebDriver TypeScript Guide

## Golden Rule

Install `selenium-webdriver` for runtime behavior and `@types/selenium-webdriver` for compile-time declarations.

Your application imports from `"selenium-webdriver"`. The `@types/selenium-webdriver` package supplies TypeScript types for public APIs such as `Builder`, `By`, `Key`, `until`, `WebDriver`, `WebElement`, and `Condition`.

Do not import from `"@types/selenium-webdriver"` in application code.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install selenium-webdriver
npm install -D typescript @types/selenium-webdriver @types/node
```

If your project already has TypeScript and the runtime package, add only the missing declarations:

```bash
npm install -D @types/selenium-webdriver @types/node
```

`@types/selenium-webdriver` does not configure browsers, browser drivers, or a Selenium server. Those are runtime concerns handled by `selenium-webdriver` and your local or remote test environment.

## Initialization

There are no package-specific credentials, API keys, or required environment variables for `@types/selenium-webdriver` itself.

The practical setup points are:

- installing the real `selenium-webdriver` package
- using imports from `"selenium-webdriver"`
- writing your browser-session code with `async` and `await`

### Recommended `tsconfig.json`

No special Selenium-specific compiler options are required. A normal strict Node.js TypeScript setup works well:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": false
  }
}
```

### Import the public API from `selenium-webdriver`

Use named imports for the runtime helpers and `type` imports for annotation-only symbols:

```typescript
import {
  Builder,
  By,
  Key,
  until,
  type WebDriver,
  type WebElement,
} from "selenium-webdriver";
```

## Common Workflows

### Start a typed browser session

Create a `WebDriver` with `Builder`, navigate to a page, then always close the session in `finally`.

This example uses an app-defined `SELENIUM_BROWSER` variable so the same code can switch browsers without changing the source file:

```bash
export SELENIUM_BROWSER=chrome
```

```typescript
import { Builder, By, Key, until, type WebDriver } from "selenium-webdriver";

export async function createDriver(): Promise<WebDriver> {
  return new Builder()
    .forBrowser(process.env.SELENIUM_BROWSER ?? "chrome")
    .build();
}

async function main(): Promise<void> {
  const driver = await createDriver();

  try {
    await driver.get("https://www.selenium.dev/selenium/web/web-form.html");

    const textBox = await driver.findElement(By.name("my-text"));
    await textBox.sendKeys("context hub", Key.TAB);

    const button = await driver.findElement(By.css("button"));
    await button.click();

    await driver.wait(until.elementLocated(By.id("message")), 10_000);
  } finally {
    await driver.quit();
  }
}

void main();
```

### Wait for typed conditions

The `until` helpers are the usual way to model asynchronous page state. They work cleanly with TypeScript because the declaration package exposes condition types for common element and driver waits.

```typescript
import { By, until, type WebDriver, type WebElement } from "selenium-webdriver";

export async function waitForMessage(driver: WebDriver): Promise<WebElement> {
  const message = await driver.wait(
    until.elementLocated(By.id("message")),
    10_000,
  );

  await driver.wait(until.elementIsVisible(message), 10_000);

  return message;
}
```

Use `until.titleContains()`, `until.urlContains()`, `until.elementLocated()`, and `until.elementIsVisible()` when you want the return type to stay close to the runtime operation you are performing.

### Model helper functions with `WebDriver` and `WebElement`

For page-object-style code, keep the browser session typed as `WebDriver` and element handles typed as `WebElement`.

```typescript
import { By, until, type WebDriver } from "selenium-webdriver";

export class WebFormPage {
  constructor(private readonly driver: WebDriver) {}

  async open(): Promise<void> {
    await this.driver.get("https://www.selenium.dev/selenium/web/web-form.html");
  }

  async submitText(value: string): Promise<string> {
    const input = await this.driver.wait(
      until.elementLocated(By.name("my-text")),
      10_000,
    );

    await input.clear();
    await input.sendKeys(value);
    await this.driver.findElement(By.css("button")).click();

    const message = await this.driver.wait(
      until.elementLocated(By.id("message")),
      10_000,
    );

    return message.getText();
  }
}
```

This is the main type boundary most projects need: helpers accept a `WebDriver`, perform browser actions, and return plain application values such as strings or booleans.

### Connect to a remote Selenium server or Grid

When you run browsers on a remote Selenium server, configure the builder with `usingServer()` and keep the rest of the typing the same.

This example uses an app-defined `SELENIUM_REMOTE_URL` variable:

```bash
export SELENIUM_REMOTE_URL=http://127.0.0.1:4444/wd/hub
```

```typescript
import { Builder, type WebDriver } from "selenium-webdriver";

export async function createRemoteDriver(): Promise<WebDriver> {
  return new Builder()
    .usingServer(process.env.SELENIUM_REMOTE_URL ?? "http://127.0.0.1:4444/wd/hub")
    .forBrowser("firefox")
    .build();
}
```

If your project chooses the browser or remote URL through environment variables, keep those variables in your own app configuration. `@types/selenium-webdriver` does not define them.

## Important Pitfalls

- Install both `selenium-webdriver` and `@types/selenium-webdriver`; the declaration package does not include runtime JavaScript.
- Import from `"selenium-webdriver"`, not from `"@types/selenium-webdriver"`.
- Browser drivers, local browser binaries, and Selenium Grid setup are runtime concerns outside this type package.
- Keep session teardown explicit with `await driver.quit()` so your test process does not leave browser sessions open.
- `driver.wait()` is the typed boundary for asynchronous page state; prefer explicit `until.*` helpers over ad-hoc polling loops.

## Version Note For `@types/selenium-webdriver` 4.35.5

`@types/selenium-webdriver` is published independently from the `selenium-webdriver` runtime package, so the declaration version does not need to match the runtime version exactly.

For TypeScript application code, the stable rule is to keep imports pointed at `"selenium-webdriver"` and treat `@types/selenium-webdriver` as the declaration layer for the runtime package.

## Official Sources

- https://www.npmjs.com/package/@types/selenium-webdriver
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/selenium-webdriver
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/selenium-webdriver/index.d.ts
- https://www.npmjs.com/package/selenium-webdriver
- https://www.selenium.dev/selenium/docs/api/javascript/
