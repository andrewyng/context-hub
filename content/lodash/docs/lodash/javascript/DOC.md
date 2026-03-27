---
name: lodash
description: "Lodash utility library for JavaScript with modular imports, deep object helpers, collection transforms, function wrappers, and templating"
metadata:
  languages: "javascript"
  versions: "4.17.23"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "lodash,javascript,utility,collections,objects,functions"
---

# Lodash JavaScript Package Guide

## What It Is

`lodash` is a general-purpose JavaScript utility library for working with arrays, objects, strings, and functions.

Use it when you need:

- safe deep property reads and writes with `_.get`, `_.has`, and `_.set`
- collection transforms such as `_.groupBy`, `_.map`, and `_.sortBy`
- function wrappers such as `_.debounce`, `_.throttle`, and `_.memoize`
- deep cloning and comparison with `_.cloneDeep` and `_.isEqual`
- simple string templating with `_.template`

## Install

```bash
npm install lodash@4.17.23
```

Common import patterns from the maintainer package README:

```javascript
const _ = require('lodash');
const core = require('lodash/core');
const fp = require('lodash/fp');

const get = require('lodash/get');
const debounce = require('lodash/debounce');
```

Use the full build when convenience matters most. Use `lodash/<method>` imports when you only need a few helpers and want smaller bundles.

## Setup Model

There is no client initialization, authentication flow, or required environment variable.

Pick the entrypoint that matches your app:

- `require('lodash')` for the full build
- `require('lodash/core')` for the core build
- `require('lodash/fp')` for immutable, auto-curried, iteratee-first, data-last helpers
- `require('lodash/<method>')` to load one method directly

## Core Usage

### Read nested data safely

```javascript
const _ = require('lodash');

const response = {
  data: [
    {
      profile: {
        email: 'ada@example.com',
      },
    },
  ],
};

const email = _.get(response, 'data[0].profile.email');
const city = _.get(response, 'data[0].profile.city', 'unknown');
const hasEmail = _.has(response, ['data', '0', 'profile', 'email']);

console.log({ email, city, hasEmail });
```

`_.get()` returns the fallback only when the resolved value is `undefined`.

### Build and patch nested config objects

```javascript
const _ = require('lodash');

const defaults = {
  http: { timeoutMs: 5000, retries: 1 },
  features: { search: false },
};

const envConfig = {
  http: { retries: 3 },
  features: { search: true },
};

const config = _.cloneDeep(defaults);

_.set(config, 'logging.level', 'debug');
_.merge(config, envConfig);

console.log(config);
// {
//   http: { timeoutMs: 5000, retries: 3 },
//   features: { search: true },
//   logging: { level: 'debug' }
// }
```

`_.set()` and `_.merge()` mutate the destination object. Clone first if you need to preserve the original.

### Group and reshape collections

```javascript
const _ = require('lodash');

const jobs = [
  { id: 1, state: 'queued', owner: 'api' },
  { id: 2, state: 'running', owner: 'worker' },
  { id: 3, state: 'queued', owner: 'worker' },
];

const byState = _.groupBy(jobs, 'state');
const queuedIds = _.map(byState.queued, 'id');

console.log(byState);
console.log(queuedIds);
```

`_.groupBy()` accepts a function iteratee or a property-name shorthand such as `'state'`.

### Debounce and throttle repeated calls

```javascript
const _ = require('lodash');

function saveDraft(body) {
  console.log('saving', body);
}

const debouncedSave = _.debounce(saveDraft, 300, {
  maxWait: 1000,
  trailing: true,
});

const throttledRefresh = _.throttle(() => {
  console.log('refreshing status');
}, 1000, {
  leading: true,
  trailing: true,
});

debouncedSave('draft-1');
debouncedSave('draft-2');
throttledRefresh();
throttledRefresh();

process.on('SIGTERM', () => {
  debouncedSave.flush();
  throttledRefresh.cancel();
});
```

Both wrappers return functions with `cancel()` and `flush()` helpers. Keep a reference to the wrapped function, not just the original callback.

### Memoize expensive pure functions

```javascript
const _ = require('lodash');

const buildPermissionList = _.memoize(
  (tenantId, role) => {
    console.log('cache miss');
    return [`${tenantId}:${role}:read`, `${tenantId}:${role}:write`];
  },
  (tenantId, role) => `${tenantId}:${role}`,
);

console.log(buildPermissionList('acme', 'admin'));
console.log(buildPermissionList('acme', 'admin'));
```

Without a resolver, `_.memoize()` uses only the first argument as the cache key.

### Deep-clone and compare structured values

```javascript
const _ = require('lodash');

const original = [{ id: 1, tags: ['a', 'b'] }];
const copy = _.cloneDeep(original);

copy[0].tags.push('c');

console.log(original[0].tags); // ['a', 'b']
console.log(copy[0].tags);     // ['a', 'b', 'c']
console.log(_.isEqual(original, copy)); // false
```

Use `_.cloneDeep()` before applying mutating helpers when you want a separate copy.

### Chain multi-step transforms

```javascript
const _ = require('lodash');

const users = [
  { user: 'barney', age: 36, active: true },
  { user: 'fred', age: 40, active: false },
  { user: 'pebbles', age: 1, active: true },
];

const youngestActiveUser = _.chain(users)
  .filter((user) => user.active)
  .sortBy('age')
  .map((user) => `${user.user}:${user.age}`)
  .head()
  .value();

console.log(youngestActiveUser); // pebbles:1
```

`_.chain()` enables explicit wrapper chains. Finish the sequence with `.value()`.

### Render small templates

```javascript
const _ = require('lodash');

const renderUser = _.template('<li><%- name %> (<%= role %>)</li>');

console.log(renderUser({ name: '<Admin>', role: 'owner' }));
// <li>&lt;Admin&gt; (owner)</li>
```

`<%- %>` HTML-escapes output. `<%= %>` interpolates values, and `<% %>` executes JavaScript inside the template.

## Important Pitfalls

- `_.set()` and `_.merge()` mutate the destination object. Clone first when you need immutable updates.
- `_.merge()` recursively merges arrays and plain objects. It does not concatenate arrays by default; use `_.mergeWith()` if you need custom array behavior.
- `_.memoize()` uses the first argument as its default cache key. Pass a resolver when the result depends on multiple arguments.
- `_.debounce()` and `_.throttle()` return wrapper functions. Hold onto those wrappers so you can call `cancel()` or `flush()` during cleanup.
- `_.template()` can execute JavaScript with `<% %>`. Only compile trusted template strings.
- If bundle size matters, prefer `lodash/<method>` or `lodash/core` instead of always importing the full build.

## Version Notes For 4.17.23

- This guide targets `lodash@4.17.23`.
- The maintainer docs URL is versioned as `4.17.21`, while the npm package README for `4.17.23` keeps the same documented entrypoints: `lodash`, `lodash/core`, `lodash/fp`, and `lodash/<method>`.

## Official Sources

- Maintainer docs: https://lodash.com/docs/4.17.21
- Package homepage: https://lodash.com/
- npm package: https://www.npmjs.com/package/lodash
- Package source tree: https://github.com/lodash/lodash/tree/4.17.23-npm
