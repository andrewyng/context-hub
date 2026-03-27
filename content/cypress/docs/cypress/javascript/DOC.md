---
name: cypress
description: "Cypress browser testing for JavaScript applications, including installation, project configuration, environment variables, and common end-to-end workflows"
metadata:
  languages: "javascript"
  versions: "15.11.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "cypress,testing,e2e,browser,automation,javascript"
---

# Cypress JavaScript Guide

`cypress` is a browser test runner for end-to-end and component tests. This guide focuses on the common JavaScript end-to-end setup: installing Cypress, configuring a project, passing secrets safely, stubbing network traffic, and moving Node-side work into tasks.

## Install

Install Cypress as a development dependency:

```bash
npm install --save-dev cypress
```

Open the interactive app for local development:

```bash
npx cypress open
```

Run tests headlessly:

```bash
npx cypress run
```

Useful variants:

```bash
npx cypress open --e2e
npx cypress run --browser chrome
npx cypress run --spec "cypress/e2e/login.cy.js"
```

Cypress downloads its test runner binary as part of installation/setup. Check Cypress's current install requirements before pinning Node.js, OS, or browser versions in CI.

There is no package-level authentication step. Put application credentials in Cypress environment variables instead of hard-coding them in specs.

## Create The Base Configuration

Use a root `cypress.config.js` file and wrap the config with `defineConfig()`.

```javascript
const { defineConfig } = require("cypress");
const fs = require("node:fs");
const path = require("node:path");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://127.0.0.1:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents(on, config) {
      on("task", {
        readFileIfExists(relativePath) {
          const filePath = path.join(config.projectRoot, relativePath);

          if (!fs.existsSync(filePath)) {
            return null;
          }

          return fs.readFileSync(filePath, "utf8");
        },
      });

      return config;
    },
  },

  env: {
    apiUrl: "http://127.0.0.1:4000",
  },

  video: true,
  screenshotOnRunFailure: true,
});
```

With `baseUrl` set, `cy.visit("/login")` resolves against your app automatically.

## Pass Secrets And Runtime Settings

Use `cypress.env.json` for local-only secrets and keep it out of version control.

```json
{
  "E2E_EMAIL": "user@example.com",
  "E2E_PASSWORD": "replace-me",
  "apiUrl": "http://127.0.0.1:4000"
}
```

```gitignore
cypress.env.json
```

You can also pass values from the shell. `CYPRESS_*` variables can override Cypress config values and populate `Cypress.env()`.

```bash
CYPRESS_baseUrl=https://staging.example.com \
CYPRESS_E2E_EMAIL=user@example.com \
CYPRESS_E2E_PASSWORD=secret \
npx cypress run
```

Read env values inside tests with `Cypress.env()`:

```javascript
const email = Cypress.env("E2E_EMAIL");
const password = Cypress.env("E2E_PASSWORD");
const apiUrl = Cypress.env("apiUrl");
```

## Write A Basic End-To-End Test

Prefer stable selectors such as `data-cy` attributes and wait on meaningful conditions instead of fixed delays.

```javascript
describe("checkout", () => {
  it("creates an order", () => {
    cy.intercept("GET", "/api/cart", {
      statusCode: 200,
      body: {
        items: [{ id: 1, name: "T-shirt", quantity: 1 }],
      },
    }).as("getCart");

    cy.intercept("POST", "/api/orders").as("createOrder");

    cy.visit("/checkout");
    cy.wait("@getCart");

    cy.get("[data-cy=email]").type("buyer@example.com");
    cy.get("[data-cy=place-order]").click();

    cy.wait("@createOrder")
      .its("response.statusCode")
      .should("eq", 201);

    cy.contains("Order confirmed").should("be.visible");
  });
});
```

Common command patterns:

```javascript
cy.visit("/dashboard");
cy.get("[data-cy=save]").click();
cy.contains("Saved").should("be.visible");
cy.url().should("include", "/dashboard");
cy.request("GET", "/api/health").its("status").should("eq", 200);
```

## Reuse Login With Custom Commands And `cy.session()`

Put repeated UI actions in support commands:

`cypress/support/commands.js`

```javascript
Cypress.Commands.add("login", () => {
  cy.visit("/login");
  cy.get("[data-cy=email]").type(Cypress.env("E2E_EMAIL"));
  cy.get("[data-cy=password]").type(Cypress.env("E2E_PASSWORD"), {
    log: false,
  });
  cy.contains("button", "Sign in").click();
  cy.url().should("include", "/dashboard");
});
```

`cypress/support/e2e.js`

```javascript
import "./commands";
```

Cache the authenticated browser state with `cy.session()` so you do not repeat the full login flow for every test:

```javascript
describe("dashboard", () => {
  beforeEach(() => {
    cy.session("standard-user", () => {
      cy.login();
    });
  });

  it("shows account details", () => {
    cy.visit("/dashboard");
    cy.contains("Account").should("be.visible");
  });
});
```

If your app redirects to a different origin for sign-in, use `cy.origin()` for the steps that run on that other origin.

## Move Node-Side Work Into `cy.task()`

Browser-side Cypress commands cannot directly use Node APIs such as `fs`. Put that work in `setupNodeEvents()` and call it with `cy.task()`.

```javascript
cy.task("readFileIfExists", "tmp/otp.txt").then((otp) => {
  expect(otp).to.be.a("string");
  cy.get("[data-cy=otp]").type(otp.trim());
});
```

Use this pattern for local file access, database helpers, or one-off setup/teardown hooks that belong on the Node side.

## Use API Calls For Setup When UI Setup Is Slow

`cy.request()` is useful for seeding data, checking service health, or creating test fixtures before you visit the page under test.

```javascript
describe("profile", () => {
  beforeEach(() => {
    cy.request("POST", `${Cypress.env("apiUrl")}/test/reset`);
    cy.request("POST", `${Cypress.env("apiUrl")}/test/users`, {
      email: Cypress.env("E2E_EMAIL"),
      plan: "pro",
    });
  });

  it("shows the seeded user", () => {
    cy.visit("/profile");
    cy.contains(Cypress.env("E2E_EMAIL")).should("be.visible");
  });
});
```

Use UI steps for the behavior you actually want to verify, and use API setup for the state that only makes the test possible.

## CI And Repeatable Runs

Run Cypress headlessly in CI and set the app URL through environment variables:

```bash
export CYPRESS_baseUrl=http://127.0.0.1:3000
export CYPRESS_E2E_EMAIL=ci-user@example.com
export CYPRESS_E2E_PASSWORD=ci-secret

npx cypress run --browser chrome
```

Keep the application server startup outside Cypress itself unless you deliberately wire a separate process manager around your test command.

## Common Pitfalls

- Do not assign Cypress command results to plain variables and expect synchronous behavior; chain commands or use `.then()`.
- Avoid `cy.wait(5000)` for routine synchronization; prefer route aliases, URL assertions, or DOM assertions.
- Use stable selectors such as `data-cy` instead of brittle CSS paths or presentation text.
- Put secrets in `cypress.env.json` or `CYPRESS_*` environment variables, not directly in spec files.
- Use `cy.task()` for Node-only work and `cy.origin()` when a test continues on a different origin.

## Useful Links

- Cypress docs table of contents: `https://docs.cypress.io/api/table-of-contents`
- Install Cypress: `https://docs.cypress.io/app/get-started/install-cypress`
- Open mode and run mode: `https://docs.cypress.io/app/get-started/open-the-app`
- Configuration: `https://docs.cypress.io/app/references/configuration`
- Environment variables: `https://docs.cypress.io/app/references/environment-variables`
- `cy.intercept()`: `https://docs.cypress.io/api/commands/intercept`
- `cy.request()`: `https://docs.cypress.io/api/commands/request`
- `cy.session()`: `https://docs.cypress.io/api/commands/session`
- `cy.task()`: `https://docs.cypress.io/api/commands/task`
- Custom commands: `https://docs.cypress.io/api/cypress-api/custom-commands`
- Best practices: `https://docs.cypress.io/app/core-concepts/best-practices`
