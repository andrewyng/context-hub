---
name: prop-types
description: "TypeScript declarations for the prop-types runtime package, including validators, inferred prop shapes, and manual runtime checks"
metadata:
  languages: "typescript"
  versions: "15.7.15"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,prop-types,react,validation,types,definitelytyped"
---

# prop-types TypeScript Guide

`@types/prop-types` provides the TypeScript declarations for the `prop-types` runtime package. Use it when your project defines `propTypes` on React components or calls `PropTypes.checkPropTypes()` for runtime validation outside React.

This package only ships `.d.ts` files. Install the `prop-types` runtime separately.

## Install

Install the runtime package and the declarations together:

```bash
npm install prop-types
npm install --save-dev typescript @types/prop-types
```

`@types/prop-types@15.7.15` declares `typeScriptVersion: "5.1"`, so use TypeScript 5.1 or newer.

No environment variables, credentials, or client initialization are required.

## Import `prop-types` In TypeScript

The declaration file uses `export = PropTypes`, so the configuration-independent import form is:

```ts
import PropTypes = require("prop-types");
```

If your `tsconfig.json` enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

```ts
import PropTypes from "prop-types";
```

If your project restricts `compilerOptions.types`, include `prop-types` explicitly:

```json
{
  "compilerOptions": {
    "types": ["prop-types"]
  }
}
```

## Define `propTypes` For A Typed Component

Use `PropTypes.ValidationMap<Props>` to keep your runtime validators aligned with your TypeScript props type.

```tsx
import PropTypes = require("prop-types");

type BannerProps = {
  title: string;
  tone?: "info" | "warning";
  dismissible?: boolean;
};

export function Banner({
  title,
  tone = "info",
  dismissible = false,
}: BannerProps) {
  return (
    <section data-tone={tone} data-dismissible={dismissible}>
      {title}
    </section>
  );
}

Banner.propTypes = {
  title: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(["info", "warning"] as const),
  dismissible: PropTypes.bool,
} satisfies PropTypes.ValidationMap<BannerProps>;
```

This is the most practical integration boundary for mixed TypeScript and PropTypes codebases: TypeScript checks the static `BannerProps` shape, while `prop-types` still validates values at runtime in development.

## Infer A Props Type From A Validator Map

The type package exposes `PropTypes.InferProps<T>` so you can derive a TypeScript type from a validator object.

```ts
import PropTypes = require("prop-types");

const cardPropTypes = {
  id: PropTypes.string.isRequired,
  count: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  owner: PropTypes.exact({
    name: PropTypes.string.isRequired,
    active: PropTypes.bool,
  }).isRequired,
};

type CardProps = PropTypes.InferProps<typeof cardPropTypes>;

const exampleCard: CardProps = {
  id: "card_123",
  tags: ["featured", "pinned"],
  owner: {
    name: "Ada",
    active: true,
  },
};
```

`InferProps` treats validators with `.isRequired` as required properties and other validators as optional properties.

## Use Nested Validators

The declarations cover the standard validator helpers exported by the runtime package, including `arrayOf`, `objectOf`, `oneOf`, `oneOfType`, `shape`, `exact`, `element`, `elementType`, `instanceOf`, and `node`.

```tsx
import PropTypes = require("prop-types");

class Message {
  constructor(public text: string) {}
}

const feedPropTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.instanceOf(Message).isRequired,
    }).isRequired,
  ).isRequired,
  layout: PropTypes.oneOf(["grid", "list"] as const),
  footer: PropTypes.node,
  as: PropTypes.elementType,
};

type FeedProps = PropTypes.InferProps<typeof feedPropTypes>;
```

Use `shape()` when extra object properties are acceptable, and `exact()` when you want runtime warnings for extra properties.

## Validate Plain Objects Outside React

The runtime package documents `PropTypes.checkPropTypes()` for manual validation. The type declarations include that API too.

```ts
import PropTypes = require("prop-types");

const searchOptionsPropTypes = {
  query: PropTypes.string.isRequired,
  page: PropTypes.number,
  mode: PropTypes.oneOf(["all", "open"] as const),
};

const input = {
  query: "status:active",
  page: "1",
  mode: "all",
};

PropTypes.checkPropTypes(
  searchOptionsPropTypes,
  input,
  "prop",
  "SearchOptions",
);
```

Do not call validator functions directly such as `PropTypes.string(...)`. The runtime package documents that direct validator calls are not supported; use `checkPropTypes()` for manual checks.

## Reset Cached Warnings In Tests

`PropTypes.checkPropTypes()` only reports a given warning once. In tests, reset that cache between cases when you need to assert repeated failures.

```ts
import PropTypes = require("prop-types");

beforeEach(() => {
  PropTypes.resetWarningCache();
});
```

## React 19 Migration Helper Types

The declarations expose both `ValidationMap<T>` and `WeakValidationMap<T>`. The package comments describe `WeakValidationMap<T>` as a migration path because React 19 removed that type from React itself.

```ts
import PropTypes = require("prop-types");

type LegacyProps = {
  title?: string | null;
  count: number;
};

const legacyPropTypes: PropTypes.WeakValidationMap<LegacyProps> = {
  title: PropTypes.string,
  count: PropTypes.number.isRequired,
};
```

Use `ValidationMap<T>` for new component props. Reach for `WeakValidationMap<T>` when you are matching older React prop-type patterns where `null`, `undefined`, and optional properties are intentionally treated the same.

## Common Pitfalls

- Install `prop-types` as well as `@types/prop-types`; the `@types` package has no runtime JavaScript.
- Prefer `import PropTypes = require("prop-types")` unless your compiler is already configured for default-import interop.
- If your `tsconfig.json` uses `compilerOptions.types`, include `prop-types` there or the declarations will not load.
- `@types/prop-types@15.7.15` does not declare `PropTypes.bigint`, even though newer `prop-types` runtime documentation includes that validator.
- Do not call validators directly. Use `propTypes` on a component or `PropTypes.checkPropTypes()` for manual validation.

## Official Sources

- https://www.npmjs.com/package/@types/prop-types
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/prop-types
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/prop-types/index.d.ts
- https://www.npmjs.com/package/prop-types
- https://github.com/facebook/prop-types/blob/main/README.md
