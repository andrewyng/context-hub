---
name: node-fetch
description: "TypeScript declarations for `node-fetch` 2.x, including CommonJS imports, typed requests and responses, and Node-specific fetch extensions."
metadata:
  languages: "typescript"
  versions: "2.6.13"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,node-fetch,fetch,http,types,definitelytyped"
---

# node-fetch TypeScript Guide

## Golden Rule

Install `node-fetch` for runtime behavior and `@types/node-fetch` for compile-time declarations.

This package describes the `node-fetch` 2.x API. It exports a CommonJS `fetch` function plus typed classes and helpers such as `Request`, `Response`, `Headers`, `FetchError`, and `fetch.isRedirect()`.

Import from `"node-fetch"` in application code. Do not import from `"@types/node-fetch"` directly.

## Install

Install the runtime package and the matching declaration package:

```bash
npm install node-fetch@^2
npm install -D typescript @types/node-fetch@2.6.13
```

There are no package-specific environment variables, credentials, or client objects to initialize.

`@types/node-fetch@2.6.13` depends on `@types/node` and `form-data`, and its published metadata declares `typeScriptVersion: "5.1"`.

If your project is pinned to an older TypeScript compiler, use the matching npm dist-tagged release instead of `2.6.13`. The npm registry maps `ts4.9` and `ts5.0` to `@types/node-fetch@2.6.12`.

## Imports And Type Usage

The published declarations use `export = fetch`, so `import = require()` is the most direct TypeScript import form:

```typescript
import fetch = require("node-fetch");
```

Use the namespace to reference exported types:

```typescript
import fetch = require("node-fetch");

const init: fetch.RequestInit = {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ hello: "world" }),
  compress: true,
  follow: 5,
  timeout: 5_000,
};
```

`@types/node-fetch` references Node types directly and defines its own `AbortSignal` interface in `externals.d.ts`, so you do not need the DOM library just to type the `signal` option.

## Common Workflows

### Make A Typed JSON Request

Check `response.ok` yourself. `node-fetch` documents that `3xx`-`5xx` responses do not throw automatically.

```typescript
import fetch = require("node-fetch");

type GitHubUser = {
  id: number;
  login: string;
};

export async function getGitHubUser(login: string): Promise<GitHubUser> {
  const response = await fetch(`https://api.github.com/users/${login}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as GitHubUser;
}
```

### Pass Authentication Headers From Environment Variables

There is no built-in auth layer. If the upstream HTTP service expects a token, read it from your own environment variable and send it through `headers`.

```bash
export API_TOKEN=your-token
```

```typescript
import fetch = require("node-fetch");

const token = process.env.API_TOKEN;

if (!token) {
  throw new Error("API_TOKEN is required");
}

const response = await fetch("https://api.example.com/me", {
  headers: {
    authorization: `Bearer ${token}`,
    accept: "application/json",
  },
});
```

### Post JSON Or URL-Encoded Data

`RequestInit.body` accepts strings, `ArrayBuffer`, `ArrayBufferView`, Node readable streams, `URLSearchParams`, and `FormData`.

```typescript
import fetch = require("node-fetch");
import { URLSearchParams } from "node:url";

async function createJson() {
  const response = await fetch("https://httpbin.org/post", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ a: 1 }),
  });

  return response.json();
}

async function createForm() {
  const params = new URLSearchParams();
  params.append("a", "1");

  const response = await fetch("https://httpbin.org/post", {
    method: "POST",
    body: params,
  });

  return response.json();
}
```

The `node-fetch` README notes that `Content-Type: application/x-www-form-urlencoded` is set automatically only when the body is an actual `URLSearchParams` instance.

### Cancel A Request With `AbortSignal`

`node-fetch` 2.x supports request cancellation with an `AbortSignal`. The v2 README suggests the `abort-controller` package when you need a controller implementation.

```bash
npm install abort-controller
```

```typescript
import fetch = require("node-fetch");

const AbortController = require("abort-controller");

const controller = new AbortController();
const timeout = setTimeout(() => {
  controller.abort();
}, 150);

try {
  const response = await fetch("https://api.example.com/slow", {
    signal: controller.signal,
  });

  console.log(response.status);
} catch (error) {
  if (error instanceof Error && error.name === "AbortError") {
    console.error("request aborted");
  } else {
    throw error;
  }
} finally {
  clearTimeout(timeout);
}
```

### Use The Node-Specific Extensions

`node-fetch` 2.x adds request options and response helpers that are not part of the browser Fetch API.

```typescript
import http = require("node:http");
import https = require("node:https");
import fetch = require("node-fetch");

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const response = await fetch("https://example.com/download", {
  agent: (parsedUrl) => {
    return parsedUrl.protocol === "http:" ? httpAgent : httpsAgent;
  },
  follow: 10,
  compress: true,
  size: 2 * 1024 * 1024,
  timeout: 5_000,
});

if (fetch.isRedirect(response.status)) {
  console.log("redirect response");
}

const bytes = await response.buffer();
const setCookies = response.headers.raw()["set-cookie"];

console.log(bytes.length, setCookies);
```

`response.body` is typed as a Node.js `Readable` stream, not a WHATWG `ReadableStream`.

## Practical Pitfalls

- `@types/node-fetch` is declarations only. Install `node-fetch` itself for runtime behavior.
- These declarations target `node-fetch` 2.x. Do not pair them with `node-fetch` 3.x, which is ESM-only and already ships its own `types` entry.
- The v2 types expose Node-specific extensions such as `agent`, `compress`, `follow`, `timeout`, `size`, `Headers.raw()`, `Body.buffer()`, and `Body.textConverted()`.
- The README documents `mode`, `credentials`, and `cache` as unsupported request features in `node-fetch` 2.x.
- The README also documents `body.formData()` as not implemented in `node-fetch` 2.x.
- `Body.textConverted()` requires the optional `encoding` package to be installed manually.
- Do not rely on `Response.error()` or `Response.redirect()` in `node-fetch` 2.x. The v2 README lists both as not implemented.
