---
name: sinon
description: "TypeScript definitions for Sinon spies, stubs, sandboxes, assertions, and fake timers"
metadata:
  languages: "typescript"
  versions: "21.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,sinon,testing,mocks,stubs,types"
---

# Sinon TypeScript Guide

`@types/sinon` adds TypeScript declarations for the `sinon` runtime package. Install it when your tests or helper code import `sinon` from TypeScript.

This package only ships type declarations. It does not include the Sinon runtime.

## Install

Install the runtime library and the type package together:

```bash
npm install --save-dev sinon @types/sinon
```

No environment variables, authentication, or client initialization are required.

## TypeScript Setup

In most projects, installing both packages is enough.

If your `tsconfig.json` already restricts loaded type packages with `compilerOptions.types`, add `sinon`:

```json
{
  "compilerOptions": {
    "types": ["node", "sinon"]
  }
}
```

Choose an import form that matches your compiler settings:

```ts
import sinon from "sinon";
```

If your project does not enable default CommonJS interop, use:

```ts
import sinon = require("sinon");
```

## Spy On Existing Methods

Use `spy()` when the real implementation should still run but the test also needs typed call assertions.

```ts
import sinon from "sinon";

const logger = {
  info(message: string) {
    console.log(message);
  },
};

const infoSpy = sinon.spy(logger, "info");

logger.info("saved");

sinon.assert.calledOnce(infoSpy);
sinon.assert.calledWithExactly(infoSpy, "saved");

infoSpy.restore();
```

## Stub Async Methods

`stub()` keeps the original method signature connected to the test double, so TypeScript still checks arguments and resolved values.

```ts
import sinon from "sinon";

const userService = {
  async fetchUser(id: string) {
    return { id, name: "real-user" };
  },
};

const fetchUser = sinon
  .stub(userService, "fetchUser")
  .resolves({ id: "u_123", name: "test-user" });

const user = await userService.fetchUser("u_123");

sinon.assert.calledOnce(fetchUser);
sinon.assert.calledWithExactly(fetchUser, "u_123");
console.log(user.name);

fetchUser.restore();
```

## Create A Sandbox Per Test

`createSandbox()` is the safest default for larger tests because one `restore()` call cleans up every stub, spy, and fake created through the sandbox.

```ts
import sinon from "sinon";
import { afterEach, test } from "node:test";

const sandbox = sinon.createSandbox();

afterEach(() => {
  sandbox.restore();
});

test("sends audit log entry", () => {
  const audit = {
    write(event: string) {
      console.log(event);
    },
  };

  const write = sandbox.spy(audit, "write");

  audit.write("user.created");

  sinon.assert.calledOnce(write);
});
```

## Stub Class Instances

Use `createStubInstance()` when production code depends on a class but a test only needs stubbed methods.

```ts
import sinon from "sinon";

class EmailClient {
  async send(to: string, subject: string) {
    return `sent:${to}:${subject}`;
  }
}

const emailClient = sinon.createStubInstance(EmailClient);
emailClient.send.resolves("sent:test@example.com:Welcome");

await emailClient.send("test@example.com", "Welcome");

sinon.assert.calledOnce(emailClient.send);
sinon.assert.calledWithExactly(emailClient.send, "test@example.com", "Welcome");
```

## Use Fake Timers

Fake timers let tests drive `setTimeout`, `setInterval`, and `Date` deterministically.

```ts
import sinon from "sinon";

const clock = sinon.useFakeTimers(Date.UTC(2026, 0, 1));
const job = {
  run() {
    console.log("ran");
  },
};
const run = sinon.spy(job, "run");

setTimeout(() => job.run(), 1_000);

clock.tick(1_000);

sinon.assert.calledOnce(run);

run.restore();
clock.restore();
```

## Common Pitfalls

- Install both `sinon` and `@types/sinon`. The type package does not include runtime code.
- Restore stubs, spies, sandboxes, and fake timers after each test so state does not leak between tests.
- If `import sinon from "sinon"` fails under your compiler settings, switch to `import sinon = require("sinon")` instead of forcing a cast.
- If `tsconfig.json` sets `compilerOptions.types`, the entry name is `"sinon"`, not `"@types/sinon"`.

## Version Notes For 21.0.0

- This guide targets `@types/sinon` version `21.0.0`.
- `@types/sinon` is a declaration-only companion to the `sinon` runtime package, so install it alongside the runtime package your test suite uses.
- Prefer stubbing or spying on real object methods instead of manually cast test doubles so the declaration package can keep argument and return types aligned with the runtime surface.

## Official Sources

- Package page: `https://www.npmjs.com/package/@types/sinon`
- Sinon documentation: `https://sinonjs.org/`
- Spies: `https://sinonjs.org/releases/latest/spies/`
- Stubs: `https://sinonjs.org/releases/latest/stubs/`
- Sandboxes: `https://sinonjs.org/releases/latest/sandbox/`
- Fake timers: `https://sinonjs.org/releases/latest/fake-timers/`
- DefinitelyTyped source tree: `https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/sinon`
