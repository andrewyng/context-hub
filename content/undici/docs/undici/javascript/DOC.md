---
name: undici
description: "Node.js HTTP client with fetch, request, connection pooling, proxy support, and request mocking"
metadata:
  languages: "javascript"
  versions: "7.22.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "undici,http,fetch,nodejs"
---

# Undici HTTP Client for Node.js

Use `undici` when you want Node-focused HTTP client features beyond the built-in `fetch`, including `request()`, custom dispatchers, proxy agents, and test mocks.

## Installation and version choice

`undici@7.22.0` requires Node.js `>=20.18.1`.

```bash
npm install undici
```

Node.js already ships a built-in `fetch()` powered by a bundled version of Undici. Install the package when you need a newer Undici release or APIs that are not exposed through the built-in runtime fetch.

```js
console.log(process.versions.undici)
```

Use built-in `fetch` when you want zero dependencies and only need standard Web API behavior. Install `undici` when you need package-level version control, `request()`, `Agent`, `ProxyAgent`, `EnvHttpProxyAgent`, or `MockAgent`.

## Environment variables

Undici does not handle application auth for you. Set headers yourself for the upstream API you are calling.

```bash
API_BASE_URL=https://api.example.com
API_TOKEN=replace-me

# Optional: only used with EnvHttpProxyAgent
HTTP_PROXY=http://proxy.internal:8080
HTTPS_PROXY=http://proxy.internal:8443
NO_PROXY=localhost,127.0.0.1
```

## Initialize a reusable client

For most apps, create one dispatcher and reuse it across requests.

```js
import { Agent, fetch, setGlobalDispatcher } from 'undici'

const baseUrl = process.env.API_BASE_URL ?? 'https://api.example.com'
const token = process.env.API_TOKEN

const dispatcher = new Agent({
  keepAliveTimeout: 10_000,
  keepAliveMaxTimeout: 10_000,
  autoSelectFamily: true
})

setGlobalDispatcher(dispatcher)

const response = await fetch(`${baseUrl}/v1/items`, {
  headers: token
    ? { authorization: `Bearer ${token}` }
    : undefined
})

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${await response.text()}`)
}

const items = await response.json()
console.log(items)

await dispatcher.close()
```

`autoSelectFamily: true` can help when a host resolves to IPv6 first and you see `UND_ERR_CONNECT_TIMEOUT` on networks with broken IPv6 connectivity.

## Make JSON requests with `fetch()`

Use `fetch()` when you want the familiar WHATWG API.

```js
import { fetch } from 'undici'

const baseUrl = process.env.API_BASE_URL ?? 'https://api.example.com'
const token = process.env.API_TOKEN

const response = await fetch(`${baseUrl}/v1/items`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    ...(token ? { authorization: `Bearer ${token}` } : {})
  },
  body: JSON.stringify({
    name: 'example',
    enabled: true
  })
})

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${await response.text()}`)
}

const item = await response.json()
console.log(item)
```

You can also pass a dispatcher per request instead of setting it globally:

```js
import { Agent, fetch } from 'undici'

const dispatcher = new Agent({
  keepAliveTimeout: 10_000,
  keepAliveMaxTimeout: 10_000
})

const response = await fetch('https://api.example.com/health', {
  dispatcher
})

console.log(response.status)

await dispatcher.close()
```

## Use `request()` for lower-overhead calls

`request()` is the fastest common Undici API and returns a Node-style readable body.

```js
import { request } from 'undici'

const baseUrl = process.env.API_BASE_URL ?? 'https://api.example.com'
const token = process.env.API_TOKEN

const { statusCode, body } = await request(`${baseUrl}/v1/items`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    ...(token ? { authorization: `Bearer ${token}` } : {})
  },
  body: JSON.stringify({
    name: 'example',
    enabled: true
  })
})

if (statusCode !== 201) {
  throw new Error(`HTTP ${statusCode}: ${await body.text()}`)
}

const item = await body.json()
console.log(item)
```

`request().body` supports body mixins such as `.json()` and `.text()`, but each body can only be consumed once.

## Stream downloads and uploads

`fetch().body` is a web stream. Convert it to a Node stream when you need filesystem or stream pipeline APIs.

```js
import { fetch } from 'undici'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const response = await fetch('https://example.com/archive.tar.gz')

if (!response.ok || !response.body) {
  throw new Error(`Download failed: ${response.status}`)
}

await pipeline(
  Readable.fromWeb(response.body),
  createWriteStream('./archive.tar.gz')
)
```

If you send an `AsyncIterable` or `ReadableStream` body with `fetch()`, set `duplex: 'half'`.

```js
import { fetch } from 'undici'

const body = {
  async *[Symbol.asyncIterator] () {
    yield '{"chunk":1}\n'
    yield '{"chunk":2}\n'
  }
}

const response = await fetch('https://api.example.com/import', {
  method: 'POST',
  headers: {
    'content-type': 'application/x-ndjson'
  },
  body,
  duplex: 'half'
})

console.log(response.status)
```

## Upload files with `FormData`

```js
import { fetch, FormData } from 'undici'
import { openAsBlob } from 'node:fs'

const file = await openAsBlob('./big.csv')
const form = new FormData()

form.set('file', file, 'big.csv')
form.set('purpose', 'import')

const response = await fetch('https://api.example.com/uploads', {
  method: 'POST',
  body: form
})

if (!response.ok) {
  throw new Error(`Upload failed: ${response.status}`)
}
```

## Configure proxies

Use `EnvHttpProxyAgent` when you want proxy settings from environment variables.

```js
import { EnvHttpProxyAgent, fetch } from 'undici'

const dispatcher = new EnvHttpProxyAgent()

const response = await fetch('https://example.com/data', {
  dispatcher
})

console.log(response.status)

await dispatcher.close()
```

`EnvHttpProxyAgent` reads `http_proxy`, `https_proxy`, and `no_proxy`. Uppercase variants are also supported, but if both lowercase and uppercase versions are set, the lowercase values win.

Use `ProxyAgent` when you want to set the proxy explicitly in code, including proxy authentication.

```js
import { ProxyAgent, request } from 'undici'

const dispatcher = new ProxyAgent({
  uri: 'http://proxy.internal:8080',
  token: `Basic ${Buffer.from('username:password').toString('base64')}`
})

const { statusCode, body } = await request('http://example.com', {
  dispatcher
})

console.log(statusCode)
console.log(await body.text())

await dispatcher.close()
```

## Mock HTTP calls in tests

Use `MockAgent` to intercept requests without opening real network connections.

```js
import { MockAgent, fetch, setGlobalDispatcher } from 'undici'

const mockAgent = new MockAgent()
mockAgent.disableNetConnect()

const mockPool = mockAgent.get('https://api.example.com')
mockPool
  .intercept({
    path: '/v1/items',
    method: 'GET'
  })
  .reply(200, {
    items: [{ id: 'item_123', name: 'example' }]
  })

setGlobalDispatcher(mockAgent)

const response = await fetch('https://api.example.com/v1/items')
const json = await response.json()

console.log(json.items[0].id)

mockAgent.assertNoPendingInterceptors()
await mockAgent.close()
```

`disableNetConnect()` is useful in tests because unmatched requests fail immediately instead of silently making real HTTP calls.

## Install Undici globals

If you want Undici's WHATWG classes on `globalThis`, call `install()` once at process startup.

```js
import { install } from 'undici'

install()

const response = await fetch('https://example.com')
const text = await response.text()
console.log(text)
```

This installs `fetch`, `Headers`, `Response`, `Request`, `FormData`, `WebSocket`, and `EventSource` globally.

## Important notes and pitfalls

- Undici does not perform browser-style CORS checks. Server-side requests are allowed unless your own code blocks them.
- Always consume or cancel response bodies. Do not rely on garbage collection to free connections.
- If you only need headers, prefer `HEAD` instead of issuing a `GET` and ignoring the body.
- `fetch().body` is a web stream; convert it with `Readable.fromWeb()` if you need a Node stream.
- `request().body` does not implement `.formData()`.
- Once you call a body mixin such as `.json()` or `.text()`, you cannot reuse that same body again.

## Official references

- Main docs: `https://undici.nodejs.org/`
- Package README: `https://github.com/nodejs/undici/blob/v7.22.0/README.md`
- API docs in the package: `https://github.com/nodejs/undici/tree/v7.22.0/docs/docs/api`
