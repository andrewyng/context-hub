---
name: lodash.throttle
description: "TypeScript guidance for `lodash.throttle`, including installation of the runtime package and `@types/lodash.throttle`, CommonJS-friendly imports, and practical throttling workflows."
metadata:
  languages: "typescript"
  versions: "4.1.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,lodash,lodash.throttle,throttle,types,definitelytyped,npm"
---

# lodash.throttle TypeScript Guide

## Golden Rule

Install `lodash.throttle` for runtime behavior and `@types/lodash.throttle` for TypeScript declarations.

Import from `"lodash.throttle"` in application code. Do not import from `"@types/lodash.throttle"` directly.

There is no client initialization step, authentication flow, CLI setup, or package-specific environment variable.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install lodash.throttle
npm install -D typescript @types/lodash.throttle@4.1.9
```

If your project already uses TypeScript, add just the declarations:

```bash
npm install -D @types/lodash.throttle@4.1.9
```

If your codebase already depends on the full `lodash` package and calls `_.throttle()`, keep using `lodash` with `@types/lodash` instead of mixing full-package and standalone-module styles casually.

## Import Style And `tsconfig.json`

The published module uses CommonJS-style exports. The most direct TypeScript import form is:

```typescript
import throttle = require("lodash.throttle");
```

If your project already enables default-import interop, this also works:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true
  }
}
```

```typescript
import throttle from "lodash.throttle";
```

Pick one import style and use it consistently.

Do not use a named import such as `import { throttle } from "lodash.throttle"`; this package exports a single throttling function.

## Common Workflows

### Throttle a typed callback

`throttle()` is most useful when you want a function to run at most once per time window while keeping the original parameter types.

```typescript
import throttle = require("lodash.throttle");

type MetricsEvent = {
  route: string;
  durationMs: number;
};

const publishMetrics = throttle(
  (event: MetricsEvent) => {
    console.log(`Publishing metrics for ${event.route}: ${event.durationMs}ms`);
  },
  1000,
  {
    leading: true,
    trailing: true,
  },
);

publishMetrics({ route: "/search", durationMs: 42 });
publishMetrics({ route: "/search", durationMs: 45 });
```

The throttled function keeps the same parameter shape as the original callback and also exposes `cancel()` and `flush()`.

### Flush or cancel trailing work during cleanup

The returned throttled function includes lifecycle helpers that matter in real applications.

```typescript
import throttle = require("lodash.throttle");

type Draft = {
  id: string;
  body: string;
};

const saveDraft = throttle(
  (draft: Draft) => {
    console.log(`Saving draft ${draft.id}: ${draft.body}`);
  },
  1500,
  {
    leading: false,
    trailing: true,
  },
);

saveDraft({ id: "draft_1", body: "first edit" });
saveDraft({ id: "draft_1", body: "final edit" });

saveDraft.flush();
saveDraft.cancel();
```

Call `flush()` when pending trailing work must run before shutdown or teardown. Call `cancel()` when queued work must be dropped.

### Reuse one throttled function across calls

Create the throttled wrapper once, then reuse it. Re-wrapping the callback on every event defeats the throttle window.

```typescript
import throttle = require("lodash.throttle");

type SearchPayload = {
  query: string;
};

const sendSearchAnalytics = throttle((payload: SearchPayload) => {
  console.log(`Sending analytics for ${payload.query}`);
}, 500);

function onSearchInput(query: string): void {
  sendSearchAnalytics({ query });
}

onSearchInput("lod");
onSearchInput("loda");
onSearchInput("lodash");
```

## Minimal End-to-End Example

This example uses an app-defined environment variable to control the throttle window for draft persistence. The package itself does not require any environment variables.

```typescript
import throttle = require("lodash.throttle");

type Draft = {
  id: string;
  body: string;
  updatedAt: string;
};

const draftSaveThrottleMs = Number(process.env.DRAFT_SAVE_THROTTLE_MS ?? "1000");

async function persistDraft(draft: Draft): Promise<void> {
  console.log(`Persisting ${draft.id} at ${draft.updatedAt}`);
}

const scheduleDraftSave = throttle(
  (draft: Draft) => {
    void persistDraft(draft);
  },
  draftSaveThrottleMs,
  {
    leading: false,
    trailing: true,
  },
);

scheduleDraftSave({
  id: "draft_1",
  body: "hello",
  updatedAt: "2026-03-13T00:00:00Z",
});

scheduleDraftSave({
  id: "draft_1",
  body: "hello world",
  updatedAt: "2026-03-13T00:00:01Z",
});

scheduleDraftSave.flush();
```

Run the compiled program with an app-specific throttle interval if you want a different window:

```bash
DRAFT_SAVE_THROTTLE_MS=1500 node dist/index.js
```

## Important Pitfalls

- `@types/lodash.throttle` is a declaration package only. Install `lodash.throttle` separately for the runtime.
- Do not import from `@types/lodash.throttle` in application code.
- `lodash.throttle` exports a single function. Use `import throttle = require("lodash.throttle")` or enable `esModuleInterop` and use a default import.
- Recreating the throttled wrapper on every call resets the timing window and defeats throttling.
- Use `flush()` before teardown when trailing work must run, or `cancel()` when it must not.
- If your project already uses the full `lodash` package, keep imports consistent across the codebase instead of mixing `_.throttle()` and `lodash.throttle` without a reason.

## Version-Sensitive Notes

- This guide targets `@types/lodash.throttle==4.1.9`.
- The declarations describe the Lodash 4 `throttle()` API used by the standalone `lodash.throttle` runtime package.
- The practical options surface is the standard Lodash `leading` and `trailing` configuration, and the returned throttled function exposes `cancel()` and `flush()`.

## Official Sources

- https://www.npmjs.com/package/@types/lodash.throttle
- https://www.npmjs.com/package/lodash.throttle
- https://lodash.com/docs/4.17.21#throttle
