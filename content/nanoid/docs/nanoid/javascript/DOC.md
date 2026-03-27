---
name: nanoid
description: "Nano ID for generating short, secure, URL-safe unique IDs in JavaScript and TypeScript"
metadata:
  languages: "javascript"
  versions: "5.1.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "nanoid,ids,uuid,random,javascript,typescript"
---

# Nano ID for JavaScript

Use `nanoid` to generate short, URL-safe IDs without any service setup. Version `5.1.6` is a published ESM package for Node.js 18+ and also provides browser and React Native builds.

There are no environment variables, API keys, or client objects to configure. Import the functions you need and call them directly.

## Install

```bash
npm install nanoid@5.1.6
```

To generate IDs from the command line, use the package binary through `npx`:

```bash
npx nanoid
npx nanoid --size 15
npx nanoid --size 10 --alphabet abc
```

## Imports and runtime requirements

### ECMAScript modules

`nanoid@5.1.6` publishes an ESM entrypoint. In Node.js, use `import`:

```js
import {
  nanoid,
  customAlphabet,
  customRandom,
  random,
  urlAlphabet,
} from 'nanoid';
```

### CommonJS

The published `5.1.6` package does not expose a CommonJS `require()` entry. If your app still runs in CommonJS, load it with dynamic `import()`:

```js
async function createId() {
  const { nanoid } = await import('nanoid');
  return nanoid();
}
```

### Browser and React Native

Use the same import path in bundler-based browser apps and React Native apps:

```js
import { nanoid } from 'nanoid';

const id = nanoid();
```

## Common workflows

### Generate a default ID

The default size is `21`, which Nano ID documents as having collision probability similar to UUID v4.

```js
import { nanoid } from 'nanoid';

const user = {
  id: nanoid(),
  email: 'alice@example.com',
};

console.log(user.id);
```

### Generate shorter or longer IDs

Pass a size when you need a different length.

```js
import { nanoid } from 'nanoid';

const shortId = nanoid(10);
const longId = nanoid(32);

console.log({ shortId, longId });
```

### Use a custom alphabet

Use `customAlphabet()` when IDs must match an allowed character set, such as uppercase letters and digits for public order numbers.

```js
import { customAlphabet } from 'nanoid';

const orderId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);

const id = orderId();
console.log(id);
```

Nano ID requires custom alphabets to contain `256` symbols or fewer.

### Reuse the built-in URL-safe alphabet with a custom length

If you want the default URL-safe character set but a shorter ID, combine `urlAlphabet` with `customAlphabet()`.

```js
import { customAlphabet, urlAlphabet } from 'nanoid';

const publicId = customAlphabet(urlAlphabet, 8);

console.log(publicId());
```

### Use a custom random byte source

Use `customRandom()` only when you already have a byte generator and need Nano ID to format the result with a specific alphabet.

```js
import { customRandom } from 'nanoid';

const hexId = customRandom('0123456789abcdef', 16, (bytes) => {
  return globalThis.crypto.getRandomValues(new Uint8Array(bytes));
});

console.log(hexId());
```

If you want Nano ID's built-in secure randomness, use `nanoid()` or `customAlphabet()` instead.

### Use the non-secure variant

`nanoid/non-secure` uses a predictable random generator with a higher collision probability. Use it only when cryptographic randomness is not required.

```js
import { nanoid, customAlphabet } from 'nanoid/non-secure';

const tempId = nanoid();

const cssScopeId = customAlphabet('abcdef0123456789', 6);

console.log({ tempId, cssScope: cssScopeId() });
```

## TypeScript usage

The type definitions support a string subtype generic, which is useful if you brand IDs in your application types.

```ts
import { nanoid } from 'nanoid';

type UserId = string & { readonly __brand: 'UserId' };

const id = nanoid<UserId>();
```

## CLI usage

The package ships a `nanoid` binary.

```bash
npx nanoid --help
```

Common examples:

```bash
npx nanoid
npx nanoid -s 15
npx nanoid --size 10 --alphabet abc
```

## Important pitfalls

- `nanoid@5.1.6` requires Node.js `^18 || >=20` in Node environments.
- The package is ESM-first. Prefer `import`; in CommonJS, use dynamic `import()`.
- `customAlphabet()` and `customRandom()` require alphabets with `256` symbols or fewer.
- `nanoid/non-secure` is intentionally less safe and more collision-prone than the default secure generator.
- Older examples may reference subpaths such as `nanoid/async`; the published `5.1.6` package exports `nanoid` and `nanoid/non-secure`.
