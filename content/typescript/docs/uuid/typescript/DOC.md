---
name: uuid
description: "TypeScript setup for `uuid`. `@types/uuid@11.0.0` is a stub package, so install `uuid` itself and use its bundled type definitions."
metadata:
  languages: "typescript"
  versions: "11.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,uuid,types,definitelytyped,npm"
---

# UUID TypeScript Guide

## Golden Rule

`@types/uuid@11.0.0` is a stub package.

The npm package page for `@types/uuid` says that `uuid` provides its own type definitions. For modern TypeScript projects, install `uuid`, import from `"uuid"`, and remove `@types/uuid` if you added it directly.

## Install

Install the runtime package and your normal TypeScript toolchain:

```bash
npm install uuid
npm install -D typescript
```

If you are writing a Node.js app and need Node globals or built-in module types elsewhere in the project, add `@types/node` too:

```bash
npm install -D @types/node
```

If your project already depends on the stub package directly, remove it:

```bash
npm uninstall @types/uuid
```

## Initialization

There are no package-specific environment variables, auth steps, or client objects.

The important setup point is importing the runtime package directly so TypeScript reads the declarations bundled with `uuid`.

### Import from `uuid`

Use named imports from the runtime package:

```typescript
import { parse, stringify, v4 as uuidv4, validate, version } from "uuid";
```

In CommonJS, require the runtime package instead:

```typescript
const { v4: uuidv4, validate, version, parse, stringify } = require("uuid");
```

Do not import from `@types/uuid`.

## Common Workflows

### Generate random IDs for application records

Use `v4()` when you need a random UUID string for a database record, queue item, or request identifier.

```typescript
import { v4 as uuidv4 } from "uuid";

type User = {
  id: string;
  email: string;
};

export function createUser(email: string): User {
  return {
    id: uuidv4(),
    email,
  };
}
```

The return type is a normal string, so keep any stronger application-level ID rules in your own types and validation layer.

### Validate inbound UUID strings

Use `validate()` before trusting input from an API route, message payload, or CLI argument.

```typescript
import { validate, version } from "uuid";

export function assertUuidV4(value: string): void {
  if (!validate(value) || version(value) !== 4) {
    throw new Error("Expected a UUIDv4 string");
  }
}
```

`validate()` checks that the string is a UUID. If your application requires a specific UUID version, also check `version()`.

### Convert UUID strings to bytes and back

Use `parse()` and `stringify()` when you need to move between the string form and the 16-byte representation.

```typescript
import { parse, stringify, v4 as uuidv4 } from "uuid";

const id = uuidv4();
const bytes = parse(id);
const roundTrip = stringify(bytes);

console.log({ id, bytes, roundTrip });
```

This is the practical boundary when your app stores UUIDs in a binary field or passes them through a protocol that uses raw bytes.

## Important Pitfalls

- `@types/uuid` does not replace the `uuid` runtime package.
- For current projects, do not import anything from `@types/uuid`; import from `uuid`.
- Prefer named imports such as `import { v4 as uuidv4 } from "uuid"`; the documented API surface is exposed from the runtime package.
- `validate()` only tells you whether a string is a valid UUID. If your contract requires a specific UUID version, also check `version()`.
- If an older lockfile still includes `@types/uuid` transitively, your application code should still depend on `uuid` for both runtime behavior and declarations.

## Version-Sensitive Notes

- This guide targets the `@types/uuid` package entry at version `11.0.0`.
- For this version, the npm package entry is a stub package that points TypeScript users to `uuid`.
- For new work, the relevant package is `uuid`, because that package provides both the runtime helpers and the bundled TypeScript declarations.

## Official Sources

- npm package page for `@types/uuid`: https://www.npmjs.com/package/@types/uuid
- DefinitelyTyped source for `@types/uuid`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/uuid
- npm package page for `uuid`: https://www.npmjs.com/package/uuid
- `uuid` README and API reference: https://github.com/uuidjs/uuid/blob/main/README.md
