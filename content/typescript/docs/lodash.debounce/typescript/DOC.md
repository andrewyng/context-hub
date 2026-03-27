---
name: lodash.debounce
description: "TypeScript guidance for `lodash.debounce`, including installation of the runtime package and `@types/lodash.debounce`, CommonJS-friendly imports, and practical debouncing workflows."
metadata:
  languages: "typescript"
  versions: "4.0.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,lodash,lodash.debounce,debounce,types,definitelytyped,npm"
---

# lodash.debounce TypeScript Guide

## Golden Rule

Install `lodash.debounce` for runtime behavior and `@types/lodash.debounce` for TypeScript declarations.

Import from `"lodash.debounce"` in application code. Do not import from `"@types/lodash.debounce"` directly.

There is no client initialization step, authentication flow, CLI setup, or package-specific environment variable.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install lodash.debounce
npm install -D typescript @types/lodash.debounce@4.0.9
```

If your project already uses TypeScript, add just the declarations:

```bash
npm install -D @types/lodash.debounce@4.0.9
```

If your codebase already depends on the full `lodash` package and calls `_.debounce()`, keep using `lodash` with `@types/lodash` instead of mixing full-package and standalone-module styles casually.

## Import Style And `tsconfig.json`

The published module uses CommonJS-style exports. The most direct TypeScript import form is:

```typescript
import debounce = require("lodash.debounce");
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
import debounce from "lodash.debounce";
```

Pick one import style and use it consistently.

Do not use a named import such as `import { debounce } from "lodash.debounce"`; this package exports a single debouncing function.

## Common Workflows

### Debounce a typed callback

`debounce()` is most useful when you want to wait for a pause in user or system activity while keeping the original callback parameter types.

```typescript
import debounce = require("lodash.debounce");

type SearchRequest = {
  query: string;
  limit: number;
};

async function fetchSuggestions(request: SearchRequest): Promise<void> {
  console.log(`Fetching suggestions for ${request.query} (limit ${request.limit})`);
}

const scheduleSuggestions = debounce(
  (request: SearchRequest) => {
    void fetchSuggestions(request);
  },
  250,
  {
    leading: false,
    trailing: true,
  },
);

scheduleSuggestions({ query: "lod", limit: 10 });
scheduleSuggestions({ query: "loda", limit: 10 });
scheduleSuggestions({ query: "lodash", limit: 10 });
```

The debounced function keeps the same parameter shape as the original callback and also exposes `cancel()` and `flush()`.

### Bound burst latency with `maxWait`

Use `maxWait` when frequent calls should still trigger periodic work during a long burst of activity.

```typescript
import debounce = require("lodash.debounce");

type PresenceUpdate = {
  userId: string;
  activeDocumentId: string;
};

const publishPresence = debounce(
  (update: PresenceUpdate) => {
    console.log(`Publishing presence for ${update.userId} in ${update.activeDocumentId}`);
  },
  300,
  {
    maxWait: 2000,
    trailing: true,
  },
);

publishPresence({ userId: "user_1", activeDocumentId: "doc_1" });
publishPresence({ userId: "user_1", activeDocumentId: "doc_1" });
publishPresence({ userId: "user_1", activeDocumentId: "doc_1" });
```

This matches the Lodash `debounce(func, wait?, options?)` behavior, where `maxWait` limits how long the callback can be deferred.

### Flush or cancel pending work during cleanup

The returned debounced function includes lifecycle helpers that matter in real applications.

```typescript
import debounce = require("lodash.debounce");

type Draft = {
  id: string;
  body: string;
};

const saveDraft = debounce(
  (draft: Draft) => {
    console.log(`Saving draft ${draft.id}: ${draft.body}`);
  },
  1000,
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

### Reuse one debounced function across calls

Create the debounced wrapper once, then reuse it. Re-wrapping the callback on every event defeats the debounce window.

```typescript
import debounce = require("lodash.debounce");

const sendSearchAnalytics = debounce((query: string) => {
  console.log(`Sending analytics for ${query}`);
}, 400);

function onSearchInput(query: string): void {
  sendSearchAnalytics(query);
}

onSearchInput("lod");
onSearchInput("loda");
onSearchInput("lodash");
```

## Minimal End-to-End Example

This example uses an app-defined environment variable to control the debounce window for search requests. The package itself does not require any environment variables.

```typescript
import debounce = require("lodash.debounce");

type SearchRequest = {
  query: string;
};

const searchDebounceMs = Number(process.env.SEARCH_DEBOUNCE_MS ?? "300");

async function requestSuggestions(request: SearchRequest): Promise<void> {
  console.log(`Requesting suggestions for ${request.query}`);
}

const scheduleSuggestions = debounce(
  (request: SearchRequest) => {
    void requestSuggestions(request);
  },
  searchDebounceMs,
  {
    leading: false,
    trailing: true,
    maxWait: 1500,
  },
);

export function onSearchInput(query: string): void {
  scheduleSuggestions({ query });
}

onSearchInput("lod");
onSearchInput("loda");
onSearchInput("lodash");

scheduleSuggestions.flush();
```

Run the compiled program with an app-specific debounce interval if you want a different window:

```bash
SEARCH_DEBOUNCE_MS=500 node dist/index.js
```

## Important Pitfalls

- `@types/lodash.debounce` is a declaration package only. Install `lodash.debounce` separately for the runtime.
- Do not import from `@types/lodash.debounce` in application code.
- `lodash.debounce` exports a single function. Use `import debounce = require("lodash.debounce")` or enable `esModuleInterop` and use a default import.
- Recreating the debounced wrapper on every call resets the timing window and defeats debouncing.
- If `leading` and `trailing` are both `true`, the trailing invocation runs only when the debounced function is called more than once during the wait window.
- If `wait` is `0` and `leading` is `false`, invocation is deferred to the next tick rather than running immediately.

## Version-Sensitive Notes

- This guide targets `@types/lodash.debounce==4.0.9`.
- The declarations describe the Lodash 4 `debounce()` API used by the standalone `lodash.debounce` runtime package.
- The practical options surface is `leading`, `trailing`, and `maxWait`, and the returned debounced function exposes `cancel()` and `flush()`.

## Official Sources

- https://www.npmjs.com/package/@types/lodash.debounce
- https://www.npmjs.com/package/lodash.debounce
- https://lodash.com/docs/4.17.21#debounce
