---
name: got
description: "Got HTTP client for Node.js with promise and stream APIs, JSON helpers, retries, hooks, pagination, and optional HTTP/2 support"
metadata:
  languages: "javascript"
  versions: "14.6.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "got,http,http2,node,javascript,requests"
---

# Got Guide for Node.js HTTP Requests

## What It Is

`got` is an HTTP client for Node.js with:

- promise-based requests
- stream-based requests
- built-in retries and timeout controls
- hooks for request lifecycle changes
- pagination helpers
- optional HTTP/2 support

Use it when you want a Node-only HTTP client with more control than `fetch`, especially for retries, hooks, streaming, and per-request options.

## Install

`got` 14.x is native ESM and the published package metadata requires Node.js 20 or newer.

```bash
npm install got@14.6.6
```

If your app is not already using ESM, opt in with `"type": "module"` in `package.json` or use `.mjs` files.

```json
{
  "type": "module"
}
```

Import `got` with a default ESM import:

```javascript
import got from 'got';
```

`got` no longer provides a CommonJS export for `require()`.

## Environment and Initialization

For APIs that need a base URL and bearer token, keep those values in environment variables.

```bash
export API_BASE_URL="https://api.example.com/v1/"
export API_TOKEN="your-api-token"
export REQUEST_TIMEOUT_MS="10000"
```

Create a shared client with `got.extend()` so your app reuses defaults for headers, timeouts, and retries.

```javascript
import got from 'got';

export const api = got.extend({
  prefixUrl: process.env.API_BASE_URL,
  headers: {
    authorization: `Bearer ${process.env.API_TOKEN}`,
    accept: 'application/json',
  },
  timeout: {
    request: Number(process.env.REQUEST_TIMEOUT_MS ?? 10000),
  },
  retry: {
    limit: 2,
  },
});
```

Important detail: when you use `prefixUrl`, pass request paths like `'users/me'`, not `'/users/me'`.

## Common Workflows

### GET JSON with query parameters

Use `searchParams` for the query string and `.json()` to parse the response body as JSON.

```javascript
import { api } from './client.js';

const issues = await api.get('issues', {
  searchParams: {
    state: 'open',
    limit: 20,
  },
}).json();

console.log(issues);
```

`searchParams` replaces any query string already present in the URL.

### POST a JSON body

Use the `json` option to send JSON. If `content-type` is not set, `got` sets it to `application/json`.

```javascript
import { api } from './client.js';

const message = await api.post('messages', {
  json: {
    role: 'user',
    content: 'Hello from got',
  },
}).json();

console.log(message.id);
```

The `json` option only controls the outgoing request body. To parse a JSON response, call `.json()` or set `responseType: 'json'`.

### Send a form-encoded request

Use `form` for `application/x-www-form-urlencoded` requests such as OAuth token exchanges.

```javascript
import got from 'got';

const tokenResponse = await got.post('https://auth.example.com/oauth/token', {
  form: {
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  },
}).json();

console.log(tokenResponse.access_token);
```

### Inspect the full response

If you need status code, headers, or the raw text body, await the request directly instead of calling `.json()`.

```javascript
import got from 'got';

const response = await got('https://api.example.com/health');

console.log(response.statusCode);
console.log(response.headers['content-type']);
console.log(response.body);
```

### Handle non-2xx responses yourself

By default, `got` throws `HTTPError` for unsuccessful HTTP responses. Disable that with `throwHttpErrors: false` when your app expects statuses such as `404` or `409`.

```javascript
import { api } from './client.js';

const response = await api.get('users/missing', {
  throwHttpErrors: false,
});

if (response.statusCode === 404) {
  console.log('User not found');
} else {
  console.log(response.body);
}
```

### Set timeouts, retries, and cancellation

`got` supports a full request timeout or per-phase timeout values. Retries are enabled by default.

```javascript
import { api } from './client.js';

const abortController = new AbortController();

setTimeout(() => {
  abortController.abort();
}, 200);

try {
  const report = await api.get('reports/daily', {
    signal: abortController.signal,
    timeout: {
      request: 5000,
    },
    retry: {
      limit: 0,
    },
  }).json();

  console.log(report);
} catch (error) {
  console.error(error.name);
}
```

Use `retry: {limit: 0}` when you need single-attempt behavior.

### Download a file with progress events

Use the stream API for large downloads.

```javascript
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import got from 'got';

const download = got.stream('https://downloads.example.com/archive.zip')
  .on('downloadProgress', ({ percent, transferred, total }) => {
    console.log({
      percent,
      transferred,
      total,
    });
  });

await pipeline(download, createWriteStream('archive.zip'));
```

If the server does not send `content-length`, the progress event has `total: undefined`.

### Paginate through an API

Use `got.paginate()` or `got.paginate.all()` when the API returns a collection across multiple pages.

```javascript
import got from 'got';

const items = await got.paginate.all('https://api.example.com/items', {
  searchParams: {
    limit: 100,
    offset: 0,
  },
  pagination: {
    transform: (response) => JSON.parse(response.body).items,
    paginate: ({ response, currentItems }) => {
      const previous = response.request.options.searchParams;
      const limit = Number(previous.get('limit') ?? 100);
      const offset = Number(previous.get('offset') ?? 0);

      if (currentItems.length < limit) {
        return false;
      }

      return {
        searchParams: {
          limit,
          offset: offset + limit,
        },
      };
    },
    countLimit: 500,
  },
});

console.log(items.length);
```

Use `got.paginate()` when you want an async iterator instead of collecting everything into one array.

### Add request hooks

Hooks run during the request lifecycle and are useful for auth, logging, and request shaping.

```javascript
import got from 'got';

const api = got.extend({
  prefixUrl: process.env.API_BASE_URL,
  hooks: {
    beforeRequest: [
      (options) => {
        options.headers.authorization = `Bearer ${process.env.API_TOKEN}`;
      },
    ],
  },
});

const response = await api.get('users/me');
console.log(response.statusCode);
```

Inside `beforeRequest`, changing `options.json` or `options.form` does not change the final request body. If you need to rewrite the payload there, update `options.body` and any related headers instead.

### Enable HTTP/2 when the server supports it

Set `http2: true` to allow `got` to negotiate HTTP/1.1 or HTTP/2 through ALPN.

```javascript
import got from 'got';

const response = await got('https://nghttp2.org/httpbin/anything', {
  http2: true,
}).json();

console.log(response.headers);
```

## Important Pitfalls

- `got` 14.x is ESM-only. `require('got')` is not supported.
- The published package metadata for the 14.x line requires Node.js 20 or newer.
- `json` serializes the request body only. It does not automatically parse the response.
- `prefixUrl` and leading slashes do not mix. Use `'users/me'`, not `'/users/me'`.
- `searchParams` overrides the query string already present in `url`.
- Retries are enabled by default. Turn them off explicitly when retrying would be unsafe.
- If you set `cookieJar`, `options.headers.cookie` is overridden.
- `dnsCache` is intended for many requests to public hostnames; the maintainer docs say to keep it disabled for internal names such as `localhost` or `database.local`.

## Version Notes

- This entry targets `got@14.6.6`.
- The maintainer docs for the current 14.x line document promise requests, streams, pagination, retries, hooks, and optional HTTP/2 support under the same package entrypoint: `import got from 'got'`.

## Official Sources

- Maintainer repository: https://github.com/sindresorhus/got
- Maintainer README: https://github.com/sindresorhus/got/blob/main/readme.md
- Options reference: https://github.com/sindresorhus/got/blob/main/documentation/2-options.md
- Streams reference: https://github.com/sindresorhus/got/blob/main/documentation/3-streams.md
- Pagination reference: https://github.com/sindresorhus/got/blob/main/documentation/4-pagination.md
- Timeout reference: https://github.com/sindresorhus/got/blob/main/documentation/6-timeout.md
- Retry reference: https://github.com/sindresorhus/got/blob/main/documentation/7-retry.md
- Hooks reference: https://github.com/sindresorhus/got/blob/main/documentation/9-hooks.md
- npm package: https://www.npmjs.com/package/got
