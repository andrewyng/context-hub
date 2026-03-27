---
name: lru-cache
description: "lru-cache JavaScript package guide for bounded in-memory caching, TTLs, async cache loading, and size-based eviction"
metadata:
  languages: "javascript"
  versions: "11.2.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "lru-cache,javascript,nodejs,caching,memoization,ttl"
---

# lru-cache JavaScript Package Guide

## Golden Rule

Use `lru-cache` for in-process hot data, not as a shared or durable cache. Always give the cache a real bound with `max`, `maxSize`, or `ttl`, and prefer setting `max` even when you also use TTL or size tracking.

## Install

Pin the package version your app expects:

```bash
npm install lru-cache@11.2.6
```

`lru-cache@11.2.6` declares Node `20 || >=22` in its published package metadata.

Use the named export:

```js
import { LRUCache } from 'lru-cache'
```

CommonJS also works:

```js
const { LRUCache } = require('lru-cache')
```

## Setup And Configuration

`lru-cache` is an in-memory library. There is no auth flow, no service endpoint, and no required environment variables.

The important configuration choices are:

- Which bound you want: `max`, `maxSize`, or `ttl`
- Whether TTL should be lazy or proactively purged
- Whether entries need size accounting with `sizeCalculation`
- Whether values need cleanup on eviction with `dispose` or `disposeAfter`
- Whether cache misses should load values through `fetchMethod` or `memoMethod`

Constructor safety rules to keep in mind:

- At least one of `max`, `maxSize`, or `ttl` is required.
- `max` is the fastest and safest default because storage is pre-allocated.
- If you use `maxSize`, every entry must provide size information through `sizeCalculation` or `cache.set(key, value, { size })`.
- If you use `ttl` without `max` or `maxSize`, stale entries are still removed lazily unless you also enable `ttlAutopurge`.

## Core Usage

### Start with a bounded cache

```js
import { LRUCache } from 'lru-cache'

const userCache = new LRUCache({
  max: 500,
  ttl: 5 * 60 * 1000,
})

export async function getUser(userId) {
  const key = `user:${userId}`
  const cachedUser = userCache.get(key)

  if (cachedUser !== undefined) {
    return cachedUser
  }

  const response = await fetch(`https://example.com/api/users/${userId}`)
  if (!response.ok) {
    throw new Error(`Failed to load user ${userId}: ${response.status}`)
  }

  const user = await response.json()
  userCache.set(key, user)
  return user
}

export function invalidateUser(userId) {
  userCache.delete(`user:${userId}`)
}
```

`get()` returns the cached value and updates recency. If you need to inspect a value without affecting LRU order, use `peek()` instead.

### Add TTL-based expiration

```js
import { LRUCache } from 'lru-cache'

const sessionCache = new LRUCache({
  max: 10_000,
  ttl: 15 * 60 * 1000,
  updateAgeOnGet: true,
})

export function storeSession(sessionId, session) {
  sessionCache.set(sessionId, session)
}

export function getSession(sessionId) {
  return sessionCache.get(sessionId)
}

setInterval(() => {
  sessionCache.purgeStale()
}, 60_000).unref()
```

With `updateAgeOnGet: true`, reads reset the entry age and make TTL behave like sliding expiration. By default, stale entries are treated as missing when accessed and removed lazily. If you need proactive cleanup, enable `ttlAutopurge`, but the maintainer docs warn that it can significantly reduce performance.

### Limit by payload size

```js
import { LRUCache } from 'lru-cache'

const responseCache = new LRUCache({
  max: 500,
  maxSize: 5 * 1024 * 1024,
  maxEntrySize: 256 * 1024,
  sizeCalculation: value => Buffer.byteLength(JSON.stringify(value), 'utf8'),
})

export function cacheResponse(key, value) {
  responseCache.set(key, value)
}

export function getResponse(key) {
  return responseCache.get(key)
}
```

Use this when entries vary widely in size. `maxSize` bounds total cache weight, and `maxEntrySize` prevents one oversized value from crowding out the rest of the cache.

### Load missing values with `fetch()`

```js
import { LRUCache } from 'lru-cache'

async function loadProduct(productId, signal) {
  const response = await fetch(`https://example.com/api/products/${productId}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to load product ${productId}: ${response.status}`)
  }

  return response.json()
}

const productCache = new LRUCache({
  max: 1000,
  ttl: 60_000,
  allowStale: true,
  fetchMethod: async (key, staleValue, { signal }) => {
    const productId = key.slice('product:'.length)
    return loadProduct(productId, signal)
  },
})

export function getProduct(productId) {
  return productCache.fetch(`product:${productId}`)
}
```

`fetch()` is useful when many callers may ask for the same missing key at once. Concurrent `fetch()` calls for the same key are coalesced into one underlying `fetchMethod` call. If you do not provide `fetchMethod`, `cache.fetch(key)` is effectively `Promise.resolve(cache.get(key))`.

If you need a timeout, pass a signal when calling `fetch()`:

```js
const product = await productCache.fetch('product:42', {
  signal: AbortSignal.timeout(250),
})
```

### Memoize synchronous computation with `memo()`

```js
import { readFileSync } from 'node:fs'
import { LRUCache } from 'lru-cache'

const configCache = new LRUCache({
  max: 50,
  ttl: 60_000,
  memoMethod: filePath => JSON.parse(readFileSync(filePath, 'utf8')),
})

export function loadConfig(filePath) {
  return configCache.memo(filePath)
}
```

Use `memo()` when the value can be computed synchronously from the key. For async work, use `fetch()` instead.

### Snapshot and restore cache contents

```js
import { LRUCache } from 'lru-cache'

const cache = new LRUCache({
  max: 100,
  ttl: 60_000,
})

const snapshot = JSON.stringify(cache.dump())

const restoredCache = new LRUCache({
  max: 100,
  ttl: 60_000,
})

restoredCache.load(JSON.parse(snapshot))
```

`dump()` and `load()` are useful for warm starts inside the same application architecture. Use the same cache options on restore, and remember that `dump()` includes stale entries as well.

## Common Pitfalls

- `ttl` is lazy expiration, not exact eviction timing. Without `ttlAutopurge`, stale entries remain until access, `purgeStale()`, or normal eviction.
- `cache.set(key, undefined)` behaves like `cache.delete(key)`. `undefined` is never stored in the cache.
- The public API expects keys and values to be non-null. Prefer explicit sentinel objects or symbols instead of `null` or `undefined` cache values.
- `get()` updates recency, while `peek()` does not. `has()` does not update recency unless `updateAgeOnHas` is enabled, and stale entries return `false` from `has()`.
- Object keys are matched by identity, not deep equality. Two distinct objects with the same shape are different keys.
- With `maxSize`, every entry must have size information. If an entry is larger than `maxEntrySize`, it is not cached.
- `fetch()` coalesces concurrent loads for the same key. The first in-flight call controls options such as abort and stale-on-rejection handling for the group.

## Version-Sensitive Notes For 11.2.6

- `11.2.6` declares Node `20 || >=22`.
- The package export is named-only. Use `import { LRUCache } from 'lru-cache'` rather than a default import.
- The published package also exports `lru-cache/raw` when you need the raw build instead of the standard `lru-cache` entrypoint.

## Official Sources Used

- Maintainer repository: https://github.com/isaacs/node-lru-cache
- Maintainer README: https://github.com/isaacs/node-lru-cache#readme
- Maintainer API docs: https://isaacs.github.io/node-lru-cache/
- npm package metadata: https://www.npmjs.com/package/lru-cache
