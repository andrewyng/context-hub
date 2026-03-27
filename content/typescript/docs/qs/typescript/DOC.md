---
name: qs
description: "TypeScript declarations for the qs querystring parser, including typed parse and stringify options, recursive ParsedQs results, and CommonJS import patterns."
metadata:
  languages: "typescript"
  versions: "6.15.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,qs,querystring,urlencoded,npm,types"
---

# qs TypeScript Guide

`@types/qs` provides the TypeScript declarations for the `qs` runtime package. Use it when your application needs to parse or build nested query strings such as `filter[status]=open`, repeated keys for arrays, or dot-notation query keys.

This package only ships `.d.ts` files. It does not install the `qs` runtime.

## Install

Install the runtime package and the declarations together:

```bash
npm install qs
npm install --save-dev typescript @types/qs
```

No environment variables, authentication, or client initialization are required.

## Import `qs` In TypeScript

The declaration file uses `export = QueryString`, so the configuration-independent import style is:

```ts
import qs = require("qs");
```

Import from `"qs"`, not from `"@types/qs"`.

## Parse Query Strings As `qs.ParsedQs`

The default `parse()` overload returns `qs.ParsedQs`, a recursive object shape where each property can be:

- `undefined`
- `string`
- another `qs.ParsedQs`
- an array of `string | qs.ParsedQs`

That means application code usually needs to narrow values before treating them as plain strings.

```ts
import qs = require("qs");

type ParsedValue = undefined | string | qs.ParsedQs | (string | qs.ParsedQs)[];

function readFirstString(value: ParsedValue): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }

  return undefined;
}

const query = qs.parse("?page=2&filter[status]=open&tag=typescript&tag=agents", {
  ignoreQueryPrefix: true,
  duplicates: "combine",
});

const page = Number(readFirstString(query.page) ?? "1");
const firstTag = readFirstString(query.tag);

const tags = Array.isArray(query.tag)
  ? query.tag.filter((item): item is string => typeof item === "string")
  : firstTag
    ? [firstTag]
    : [];

const filter = query.filter;
const status =
  filter
  && !Array.isArray(filter)
  && typeof filter !== "string"
  && typeof filter.status === "string"
    ? filter.status
    : "all";

console.log({ page, status, tags });
```

By default, `qs` does not coerce numbers, booleans, or `null`. Parsed values stay as strings unless you add your own conversion step.

## Use Bounded Parse Options For Untrusted Input

When you parse user-controlled query strings or `application/x-www-form-urlencoded` bodies, prefer explicit limits.

```ts
import qs = require("qs");

const parsed = qs.parse("filters[owner]=alice&filters[tag]=docs&ids[]=1&ids[]=2", {
  depth: 3,
  strictDepth: true,
  parameterLimit: 50,
  arrayLimit: 20,
  throwOnLimitExceeded: true,
  plainObjects: true,
});

console.log(parsed);
```

Practical notes:

- `depth`, `parameterLimit`, and `arrayLimit` help bound parser work on untrusted input.
- `throwOnLimitExceeded: true` turns silent truncation into a normal error path you can handle.
- `plainObjects: true` returns null-prototype objects, so methods such as `hasOwnProperty` are not present on parsed objects.
- `allowPrototypes` exists, but the runtime README warns that enabling it is generally a bad idea.

## Stringify Nested Objects For Requests

Use `stringify()` when you need stable query strings for fetch calls, SDK clients, or server-side redirects.

```ts
import qs = require("qs");

const queryString = qs.stringify(
  {
    filter: { status: "open", owner: "alice" },
    tag: ["typescript", "agents"],
    includeArchived: false,
  },
  {
    addQueryPrefix: true,
    allowDots: true,
    arrayFormat: "repeat",
    encodeValuesOnly: true,
  }
);

console.log(queryString);
// ?filter.status=open&filter.owner=alice&tag=typescript&tag=agents&includeArchived=false
```

The typed `arrayFormat` values are:

- `"indices"`
- `"brackets"`
- `"repeat"`
- `"comma"`

Use `allowDots: true` when the receiving API expects dotted keys such as `filter.status=open` instead of bracket syntax.

## Type Option Objects With `qs.IParseOptions` And `qs.IStringifyOptions`

If you keep parser settings in shared config, type them directly from the package.

```ts
import qs = require("qs");

const parseOptions = {
  allowDots: true,
  decodeDotInKeys: true,
  ignoreQueryPrefix: true,
  duplicates: "combine",
} satisfies qs.IParseOptions<true>;

const stringifyOptions = {
  allowDots: true,
  encodeDotInKeys: true,
  arrayFormat: "repeat",
  addQueryPrefix: true,
} satisfies qs.IStringifyOptions<true>;

const parsed = qs.parse("name%252Eobj.first=John", parseOptions);
const serialized = qs.stringify({ "name.obj": { first: "John" } }, stringifyOptions);

console.log(parsed, serialized);
```

The generic parameter matters when you use `decodeDotInKeys` or `encodeDotInKeys`. Those options are only enabled in the declaration types when `allowDots` is typed as `true`.

## Custom Decoders Widen The Return Type

If you pass a custom `decoder`, the return type widens from `qs.ParsedQs` to `{ [key: string]: unknown }` because your decoder can return any value.

```ts
import qs = require("qs");

const parsed = qs.parse("enabled=true&count=2", {
  decoder(str, defaultDecoder, charset, type) {
    const value = defaultDecoder(str, defaultDecoder, charset);

    if (type === "value" && value === "true") {
      return true;
    }

    if (type === "value" && value === "false") {
      return false;
    }

    return value;
  },
});

const enabled = parsed.enabled;

if (typeof enabled !== "boolean") {
  throw new Error("enabled must be a boolean");
}
```

This is the main type boundary in advanced `qs` usage: once you customize decoding, validate or narrow the result before using it as application data.

## Common Pitfalls

- Install `qs` as well as `@types/qs`; the type package does not include runtime code.
- Import from `"qs"`, not from `"@types/qs"`.
- The declaration file uses CommonJS `export =`; `import qs = require("qs")` works without TypeScript interop flags.
- `qs.parse()` keeps primitive-looking values as strings by default.
- `plainObjects: true` returns null-prototype objects, so instance methods are unavailable on parsed values.
- Using a custom `decoder` widens the parse result to `unknown` values that you must narrow yourself.

## Official Sources

- https://www.npmjs.com/package/@types/qs
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/qs
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/qs/index.d.ts
- https://www.npmjs.com/package/qs
- https://github.com/ljharb/qs
- https://github.com/ljharb/qs/blob/main/README.md
