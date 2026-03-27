---
name: middleware-stack
description: "AWS SDK for JavaScript v3 middleware stack utilities for composing, ordering, and debugging low-level client middleware."
metadata:
  languages: "javascript"
  versions: "3.374.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,javascript,aws-sdk,middleware,smithy,client"
---

# `@aws-sdk/middleware-stack`

Use this package when you need to build or manipulate the middleware pipeline used by AWS SDK for JavaScript v3 clients and commands.

Most application code does not need to install it directly. Generated `@aws-sdk/client-*` packages already expose `client.middlewareStack` and `command.middlewareStack`, and that is usually where you add custom behavior. Reach for `@aws-sdk/middleware-stack` when you need `constructStack()` itself or when you are composing low-level SDK plumbing.

## Install

Install the package directly when you are creating or composing a stack yourself:

```bash
npm install @aws-sdk/middleware-stack@3.374.0
```

If you are customizing an existing AWS client, install the service client you actually use. The client already carries a middleware stack:

```bash
npm install @aws-sdk/client-s3
```

## Environment and prerequisites

This package does not load credentials, resolve region, sign requests, or send HTTP traffic by itself.

You do not need any environment variables just to create or mutate a stack. If the surrounding client also signs and sends AWS requests, configure region and credentials the same way you would for other AWS SDK v3 code:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
AWS_PROFILE=default
```

## Middleware lifecycle

The stack executes middleware in five ordered steps:

- `initialize` - prepare or normalize input before request creation
- `serialize` - turn input into a request object
- `build` - modify retry-stable request parts such as headers or checksums
- `finalizeRequest` - do final transport-specific work such as signing
- `deserialize` - turn the raw response into structured output

Use the right step for the job. A header that must survive retries belongs in `build`, while signing belongs in `finalizeRequest`.

## Create and resolve a standalone stack

`constructStack()` creates an empty middleware stack. You add middleware with `add()` or `addRelativeTo()`, then turn the stack into a handler with `resolve()`.

```javascript
import { constructStack } from "@aws-sdk/middleware-stack";

const stack = constructStack();

stack.add(
  (next) => async (args) => {
    return next({
      ...args,
      input: {
        ...args.input,
        requestId: args.input.requestId ?? "req-123",
      },
    });
  },
  {
    step: "initialize",
    name: "defaultRequestId",
  }
);

stack.add(
  (next) => async (args) => {
    return next({
      ...args,
      request: {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(args.input),
      },
    });
  },
  {
    step: "serialize",
    name: "serializeJsonBody",
  }
);

stack.add(
  (next) => async (args) => {
    return next({
      ...args,
      request: {
        ...args.request,
        headers: {
          ...args.request.headers,
          "x-request-id": args.input.requestId,
        },
      },
    });
  },
  {
    step: "build",
    name: "addRequestIdHeader",
  }
);

stack.add(
  (next) => async (args) => {
    const result = await next(args);

    return {
      ...result,
      output: {
        statusCode: result.response.statusCode,
        body: JSON.parse(result.response.body),
      },
    };
  },
  {
    step: "deserialize",
    name: "parseJsonResponse",
  }
);

const handler = stack.resolve(
  async (args) => {
    return {
      response: {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          sentHeaders: args.request.headers,
        }),
      },
      output: undefined,
    };
  },
  {
    logger: console,
  }
);

const result = await handler({
  input: {
    message: "hello",
  },
});

console.log(result.output);
```

## Add middleware at a specific location

Use `add()` when you know the lifecycle step and optional priority.

```javascript
import { constructStack } from "@aws-sdk/middleware-stack";

const stack = constructStack();

stack.add(
  (next) => async (args) => next(args),
  {
    step: "finalizeRequest",
    priority: "high",
    name: "signingPreparation",
    tags: ["auth"],
  }
);
```

Valid priorities are `high`, `normal`, and `low`. Within the same step and priority, execution order follows insertion order.

## Add middleware relative to another middleware

Use `addRelativeTo()` when you need to run before or after a named middleware.

```javascript
import { constructStack } from "@aws-sdk/middleware-stack";

const stack = constructStack();

stack.add(
  (next) => async (args) => {
    return next({
      ...args,
      request: {
        ...args.request,
        headers: {
          ...args.request.headers,
          "x-base-header": "base",
        },
      },
    });
  },
  {
    step: "build",
    name: "baseHeaders",
  }
);

stack.addRelativeTo(
  (next) => async (args) => {
    return next({
      ...args,
      request: {
        ...args.request,
        headers: {
          ...args.request.headers,
          "x-trace-id": "trace-123",
        },
      },
    });
  },
  {
    relation: "after",
    toMiddleware: "baseHeaders",
    name: "traceHeaders",
  }
);
```

Relative middleware must target an existing named middleware. If `toMiddleware` cannot be found, the stack throws when it is resolved.

## Package reusable behavior as a plugin

Any object with `applyToStack(stack)` can be applied with `use()`.

```javascript
import { constructStack } from "@aws-sdk/middleware-stack";

const timingPlugin = {
  applyToStack(stack) {
    stack.add(
      (next, context) => async (args) => {
        const startedAt = Date.now();
        const result = await next(args);

        context.logger?.info?.(`middleware duration=${Date.now() - startedAt}ms`);
        return result;
      },
      {
        step: "finalizeRequest",
        name: "timingMiddleware",
        tags: ["timing"],
      }
    );
  },
};

const stack = constructStack();
stack.use(timingPlugin);
```

This pattern is useful when one customization needs to add or remove multiple middleware entries together.

## Customize an existing AWS client stack

For normal application code, this is the most common pattern. Generated AWS SDK v3 clients already have a stack, so add middleware there instead of creating a new one from scratch.

```javascript
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

client.middlewareStack.add(
  (next, context) => async (args) => {
    context.logger?.debug?.(`sending ${context.clientName}.${context.commandName}`);
    return next(args);
  },
  {
    step: "initialize",
    name: "logCommandName",
  }
);

await client.send(new ListBucketsCommand({}));
```

You can also attach middleware to a single command instance through `command.middlewareStack` when you want the customization to apply only to one operation.

## Inspect, clone, combine, and remove middleware

The stack exposes utilities that are useful when you need to debug or safely compose middleware sets.

```javascript
import { constructStack } from "@aws-sdk/middleware-stack";

const baseStack = constructStack();
baseStack.add(
  (next) => async (args) => next(args),
  {
    step: "build",
    name: "baseHeaders",
    tags: ["headers"],
  }
);

const extraStack = constructStack();
extraStack.add(
  (next) => async (args) => next(args),
  {
    step: "finalizeRequest",
    name: "requestLogger",
    tags: ["logging"],
  }
);

const combined = baseStack.concat(extraStack);
const cloned = combined.clone();

console.log(combined.identify());

cloned.remove("requestLogger");
cloned.removeByTag("headers");
cloned.identifyOnResolve(true);
```

- `concat()` returns a new stack and does not mutate either source stack.
- `clone()` preserves names, tags, steps, priorities, and relative bindings.
- `identify()` returns the current middleware order as strings.
- `identifyOnResolve(true)` logs that order to the console whenever `resolve()` is used.

## Important pitfalls

- Give middleware a stable `name` when other code may need to remove it, replace it, or attach relative middleware around it.
- Names must be unique unless you deliberately replace an entry with `override: true`.
- `override: true` is not a free move. Replacements added with `add()` must keep the same step and priority, and replacements added with `addRelativeTo()` must keep the same relation and `toMiddleware` target.
- `removeByTag()` removes matching middleware from both absolute and relative entries.
- Relative middleware chains must still be anchored to middleware that was added with `add()`.
- `identifyOnResolve(true)` is useful for debugging, but it writes to `console` during handler resolution.
- Import from `@aws-sdk/middleware-stack`, not internal `dist-*` paths.

## Version notes

- This guide covers `@aws-sdk/middleware-stack` version `3.374.0`.
- The public API used here is `constructStack()` plus stack methods such as `add()`, `addRelativeTo()`, `use()`, `clone()`, `concat()`, `remove()`, `removeByTag()`, `identify()`, `identifyOnResolve()`, and `resolve()`.
- For most end-user code, you customize `client.middlewareStack` or `command.middlewareStack` on a generated AWS SDK v3 client instead of building a standalone stack.

## Official sources

- AWS SDK for JavaScript v3 package docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-middleware-stack/
- npm package page: https://www.npmjs.com/package/@aws-sdk/middleware-stack
