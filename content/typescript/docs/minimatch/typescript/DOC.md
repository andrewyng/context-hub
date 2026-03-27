---
name: minimatch
description: "TypeScript guidance for `minimatch`, including the deprecated `@types/minimatch` stub, imports, typed glob matching, and common option pitfalls."
metadata:
  languages: "typescript"
  versions: "6.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,minimatch,glob,node,types,npm"
---

# Minimatch TypeScript Guide

## Golden Rule

`@types/minimatch` `6.0.0` is a deprecated stub package. The published package description says it is a stub entry for `minimatch`, and its deprecation notice says that `minimatch` provides its own type definitions.

In practice, install and import `minimatch`. Do not import anything from `@types/minimatch`.

## Install

Install the runtime package and your normal TypeScript toolchain:

```bash
npm install minimatch
npm install -D typescript @types/node
```

If your application already added `@types/minimatch` directly, remove it:

```bash
npm uninstall @types/minimatch
```

If a transitive dependency still pulls in `@types/minimatch`, you usually do not need to do anything. Import from `minimatch`, and let TypeScript read the declarations bundled with that runtime package.

## Initialization

There are no environment variables, credentials, client objects, or service initialization steps for this package.

The important setup points are:

- install `minimatch`
- import from `minimatch`
- use TypeScript module settings that match your Node.js runtime

### Recommended `tsconfig.json`

`minimatch` publishes typed ESM and CommonJS entry points. A practical Node.js setup is:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": false
  }
}
```

## Import Patterns

Use named imports from `minimatch` in TypeScript:

```ts
import {
  Minimatch,
  escape,
  filter,
  makeRe,
  match,
  minimatch,
  type MinimatchOptions,
} from "minimatch";
```

In CommonJS, require the runtime package:

```ts
const { minimatch, Minimatch } = require("minimatch");
```

## Common Workflows

### Match a path with typed options

`MinimatchOptions` is exported by the runtime package, so you can type reusable option objects directly.

```ts
import { minimatch, type MinimatchOptions } from "minimatch";

const options: MinimatchOptions = {
  dot: true,
  matchBase: true,
};

console.log(minimatch("src/index.ts", "*.ts", options));
console.log(minimatch("src/index.ts", "*.js", options));
```

`matchBase` only applies when the pattern does not contain a slash. In the example above, `*.ts` matches against the basename of `src/index.ts`.

### Filter or select from a list

The runtime package exports both `filter()` and `match()`.

```ts
import { filter, match } from "minimatch";

const files = [
  "src/index.ts",
  "src/index.test.ts",
  "README.md",
  ".eslintrc.cjs",
];

const tsFilter = filter("**/*.ts", { dot: true });

console.log(files.filter(tsFilter));
console.log(match(files, "**/*.test.ts", { dot: true }));
```

If you use `match()` with `nonull: true`, a no-match result returns the original pattern string instead of an empty array.

### Precompile a pattern with `Minimatch`

Use the class when you want to reuse a parsed pattern, inspect whether it contains glob magic, or generate a regular expression.

```ts
import { Minimatch } from "minimatch";

const mm = new Minimatch("src/**/*.{ts,tsx}", {
  dot: true,
  magicalBraces: true,
});

console.log(mm.hasMagic());
console.log(mm.match("src/components/Button.tsx"));

const regexp = mm.makeRe();

if (!regexp) {
  throw new Error("Invalid glob pattern");
}

console.log(regexp.test("src/index.ts"));
```

The type of `makeRe()` is `false | MMRegExp`, so handle the `false` case before using the returned value as a `RegExp`.

### Escape user input before building a glob

If part of a pattern comes from user input, escape it first so special glob characters are treated literally.

```ts
import { escape, minimatch, unescape } from "minimatch";

const literalSegment = "[draft]";
const pattern = `notes/${escape(literalSegment)}.md`;

console.log(pattern);
console.log(minimatch("notes/[draft].md", pattern));
console.log(unescape(escape(literalSegment)));
```

Slashes cannot be escaped or unescaped. In `windowsPathsNoEscape` mode, backslashes also act as path separators rather than escapes.

### Use `partial` during directory walking

`partial: true` is useful when you are traversing a tree and need to know whether a prefix could still become a match.

```ts
import { minimatch } from "minimatch";

console.log(minimatch("/a/b", "/a/*/c/d", { partial: true }));
console.log(minimatch("/a/b", "/**/d", { partial: true }));
console.log(minimatch("/x/y/z", "/a/**/z", { partial: true }));
```

## Important Pitfalls

### Use forward slashes in patterns

The `minimatch` README explicitly warns to use forward slashes in glob expressions, even on Windows. Backslashes in patterns are treated as escapes, not as path separators.

```ts
import { minimatch } from "minimatch";

minimatch("src\\index.ts", "src/*.ts");
```

If you need compatibility with patterns built by `path.join()` or `path.resolve()` on Windows, `windowsPathsNoEscape: true` changes backslashes into separators. Use it carefully: this mode makes it impossible to match literal glob metacharacters in a path.

### `makeRe()` and aggressive optimization are different APIs

`optimizationLevel: 2` is designed for file-walking scenarios. The README notes that `Minimatch.match()` optimizes file paths to stay aligned with that mode, but a raw regular expression from `makeRe()` may not match the unprocessed path string the same way.

If you only need a boolean path check, prefer `minimatch()` or `mm.match()` over building your own `RegExp` pipeline.

### `hasMagic()` does not mean the pattern is a literal path

`hasMagic()` returns `false` for fully escaped patterns such as `\\*` or `[*]`, because they match the literal `*` character. If you need the literal text back, use `unescape()`.

## Version Note

This guide is written for the `@types/minimatch` `6.0.0` package entry on npm.

For this version, the relevant practical behavior is simple:

- `@types/minimatch` is deprecated
- it exists as a stub package
- it depends on `minimatch`
- `minimatch` is the package that provides the usable TypeScript declarations
