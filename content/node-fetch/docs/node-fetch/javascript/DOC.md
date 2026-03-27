---
name: node-fetch
description: "Fetch API implementation for Node.js with ESM imports, streaming bodies, multipart uploads, abort support, and Node-specific request options"
metadata:
  languages: "javascript"
  versions: "3.3.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "node-fetch,fetch,http-client,http,nodejs"
---

# node-fetch (JavaScript)

`node-fetch` brings the Fetch API to Node.js and also exports `Headers`, `Request`, `Response`, `FormData`, `File`, `FetchError`, and `AbortError`.

## Install and import

`node-fetch` `3.x` requires Node.js `>=12.20.0` and is ESM-only.

```bash
npm install node-fetch
```

Use the default export for requests:

```js
import fetch from 'node-fetch';
```

Import the extra classes and helpers when you need them:

```js
import fetch, {
  AbortError,
  FetchError,
  FormData,
  Headers,
  Request,
  Response,
  fileFrom,
  fileFromSync,
} from 'node-fetch';
```

If your app is still CommonJS, load `node-fetch` with dynamic `import()`:

```js
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
```

If older code expects a global `fetch`, you can patch it explicitly:

```js
import fetch, { Headers, Request, Response } from 'node-fetch';

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}
```

## Configuration and auth

`node-fetch` does not create a client object and does not manage authentication for you. Store API settings in environment variables and send headers on each request.

```bash
export API_BASE_URL="https://api.example.com"
export API_TOKEN="your-token"
```

```js
function apiUrl(path) {
  return new URL(path, process.env.API_BASE_URL);
}

function authHeaders(extra = {}) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    ...extra,
  };
}
```

Use absolute URLs. `node-fetch` rejects path-relative and protocol-relative URLs.

## Make a JSON request

`fetch()` resolves for HTTP error statuses too. Check `response.ok` or `response.status` yourself.

```js
import fetch from 'node-fetch';

class HTTPResponseError extends Error {
  constructor(response, body) {
    super(`HTTP ${response.status} ${response.statusText}`);
    this.response = response;
    this.body = body;
  }
}

async function getUser(userId) {
  const response = await fetch(apiUrl(`/users/${userId}`), {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new HTTPResponseError(response, await response.text());
  }

  return response.json();
}

const user = await getUser('123');
console.log(user.email);
```

## Send JSON

Serialize the payload yourself and set `Content-Type: application/json`.

```js
import fetch from 'node-fetch';

const response = await fetch(apiUrl('/users'), {
  method: 'POST',
  headers: authHeaders({
    'Content-Type': 'application/json',
  }),
  body: JSON.stringify({
    name: 'Ada Lovelace',
    role: 'admin',
  }),
});

if (!response.ok) {
  throw new Error(await response.text());
}

const createdUser = await response.json();
console.log(createdUser.id);
```

For form-style bodies, pass `URLSearchParams` directly. `node-fetch` automatically sets `application/x-www-form-urlencoded` for a `URLSearchParams` body.

```js
import fetch from 'node-fetch';

const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');
params.append('scope', 'read:users');

const response = await fetch(apiUrl('/oauth/token'), {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
  body: params,
});
```

## Upload files with multipart form data

Use the built-in `FormData` and `fileFrom()` helpers.

```js
import fetch, { FormData, fileFrom } from 'node-fetch';

const form = new FormData();
form.set('title', 'Quarterly report');
form.set('file', await fileFrom('./report.csv', 'text/csv'));

const response = await fetch(apiUrl('/uploads'), {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
  body: form,
});

if (!response.ok) {
  throw new Error(await response.text());
}
```

You can also create a `File` or `Blob` yourself, or use `fileFromSync()` when synchronous file setup is simpler.

## Stream a response to disk

`response.body` is a Node.js `Readable` stream, not a WHATWG `ReadableStream`. Pipe it with `stream.pipeline()`.

```js
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import fetch from 'node-fetch';

const streamPipeline = promisify(pipeline);

const response = await fetch(apiUrl('/exports/latest.csv'), {
  headers: authHeaders(),
});

if (!response.ok) {
  throw new Error(`Download failed: ${response.status} ${response.statusText}`);
}

await streamPipeline(response.body, createWriteStream('./latest.csv'));
```

## Cancel a request with `AbortController`

Pass `signal` in the request options. When the request is aborted, `node-fetch` throws `AbortError`.

```js
import fetch, { AbortError } from 'node-fetch';

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 1_500);

try {
  const response = await fetch(apiUrl('/reports/slow'), {
    headers: authHeaders(),
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  console.log(await response.json());
} catch (error) {
  if (error instanceof AbortError) {
    console.error('Request timed out');
  } else {
    throw error;
  }
} finally {
  clearTimeout(timeout);
}
```

On Node.js `>=14.17.0`, `AbortController` is available globally. On older supported runtimes, add a compatible `AbortController` implementation yourself.

## Node-specific request options

`node-fetch` adds a few options beyond the standard Fetch API:

- `follow`: maximum redirect count, default `20`
- `compress`: enable gzip/deflate/brotli decoding, default `true`
- `size`: maximum response body size in bytes, default `0` for no limit
- `agent`: custom `http.Agent` or `https.Agent`, or a function returning one
- `highWaterMark`: internal stream buffer size, default `16384`
- `insecureHTTPParser`: pass through Node's lenient HTTP parser option

Example with keep-alive agents and a response size limit:

```js
import http from 'node:http';
import https from 'node:https';
import fetch from 'node-fetch';

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const response = await fetch('https://api.example.com/data', {
  agent(parsedUrl) {
    return parsedUrl.protocol === 'http:' ? httpAgent : httpsAgent;
  },
  follow: 5,
  size: 10 * 1024 * 1024,
});
```

If you run on Node.js `19+`, the default Node agent already enables keep-alive.

## Cookies and response headers

`node-fetch` does not store cookies automatically. Read `Set-Cookie` headers yourself and send `Cookie` headers explicitly on later requests.

```js
import fetch from 'node-fetch';

const response = await fetch('https://example.com/login');
const setCookies = response.headers.raw()['set-cookie'] ?? [];

console.log(setCookies);
```

`Headers.raw()` is a `node-fetch` extension and returns header values as arrays.

## Important behavior and pitfalls

- `3.x` is ESM-only. Use dynamic `import()` from CommonJS, or stay on `node-fetch@2` if the app cannot move off `require()`.
- `fetch()` only throws for network failures, aborted requests, and operational errors. `4xx` and `5xx` responses still resolve normally.
- `GET` and `HEAD` requests cannot include a body.
- URLs with embedded credentials such as `https://user:pass@example.com/` are rejected.
- `redirect: 'manual'` does not behave like browser fetch. `node-fetch` returns a basic filtered response so you can inspect the `Location` header and follow redirects yourself.
- When a response is large and you call `response.clone()`, resolve both bodies in parallel or increase `highWaterMark` if needed.
