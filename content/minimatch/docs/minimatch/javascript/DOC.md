---
name: minimatch
description: "Glob pattern matching and glob-to-RegExp utilities for JavaScript paths and filenames"
metadata:
  languages: "javascript"
  versions: "10.2.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "javascript,glob,pattern-matching,paths,regex"
---

# minimatch for JavaScript

Use `minimatch` to test strings or paths against Bash-style glob patterns, filter in-memory lists, expand braces, and compile glob patterns into reusable matchers or regular expressions.

## Install

```bash
npm install minimatch
```

The published `10.2.4` package declares these supported Node.js versions:

- `18`
- `20`
- `>=22`

## Import and setup

`minimatch` does not use environment variables, authentication, or client initialization.

The package supports both ESM and CommonJS:

```js
import { minimatch, Minimatch, braceExpand, makeRe, match, escape, unescape } from 'minimatch';
```

```js
const {
  minimatch,
  Minimatch,
  braceExpand,
  makeRe,
  match,
  escape,
  unescape,
} = require('minimatch');
```

## Match a path or filename

Use `minimatch(path, pattern, options)` for one-off checks.

```js
import { minimatch } from 'minimatch';

console.log(minimatch('src/app.js', 'src/*.js'));
// true

console.log(minimatch('src/app.ts', 'src/*.js'));
// false

console.log(minimatch('src/app.test.js', 'src/**/!(*.spec).js'));
// true
```

Supported pattern features in the maintainer README include:

- Brace expansion: `src/*.{js,ts}`
- Extglobs: `+(api|ui).js`, `!(*.test).js`
- Globstars: `src/**/*.js`
- POSIX character classes: `[[:alpha:]]`, `[[:digit:]]`

## Filter a list of paths

`minimatch` matches the strings you give it. It does not scan the filesystem.

Use `match()` to filter a list in one call, or `minimatch.filter()` when you need a predicate function.

```js
import { minimatch, match } from 'minimatch';

const files = [
  'src/index.js',
  'src/index.test.js',
  'src/utils/format.js',
  'README.md',
];

const jsFiles = match(files, 'src/**/*.js');
const nonTestFiles = files.filter(
  minimatch.filter('src/**/!(*.test).js')
);

console.log(jsFiles);
console.log(nonTestFiles);
```

If you want the original pattern back when nothing matches, pass `nonull: true`:

```js
import { match } from 'minimatch';

console.log(match(['README.md'], '**/*.ts', { nonull: true }));
// ['**/*.ts']
```

## Reuse a compiled matcher

Use `new Minimatch(pattern, options)` when you will test many paths against the same pattern.

```js
import { Minimatch } from 'minimatch';

const mm = new Minimatch('src/**/*.{js,ts}', {
  dot: false,
  nocase: false,
});

console.log(mm.hasMagic());
// true

for (const file of ['src/index.js', 'src/.hidden.js', 'test/index.js']) {
  if (mm.match(file)) {
    console.log(`matched: ${file}`);
  }
}
```

Use `makeRe()` when another API expects a `RegExp`:

```js
import { makeRe } from 'minimatch';

const regex = makeRe('src/*.{js,ts}');

if (!regex) {
  throw new Error('Invalid glob pattern');
}

console.log(regex.test('src/index.js'));
// true
```

## Expand braces or treat patterns literally

Use `braceExpand()` to inspect what a brace pattern becomes:

```js
import { braceExpand } from 'minimatch';

console.log(braceExpand('src/*.{js,ts,tsx}'));
// ['src/*.js', 'src/*.ts', 'src/*.tsx']
```

Use `escape()` before matching a user-controlled filename as a literal string rather than as a glob pattern.

```js
import { escape, minimatch, unescape } from 'minimatch';

const literalName = 'docs/[draft].md';
const safePattern = escape(literalName);

console.log(safePattern);
console.log(minimatch('docs/[draft].md', safePattern));
// true

console.log(unescape(safePattern));
// 'docs/[draft].md'
```

Slashes cannot be escaped or unescaped. In `windowsPathsNoEscape` mode, backslashes also cannot be escaped or unescaped.

## Important options

### Match dotfiles

Like Bash, filenames starting with `.` are not matched unless the pattern starts with `.` or you set `dot: true`.

```js
import { minimatch } from 'minimatch';

console.log(minimatch('.eslintrc.js', '*.js'));
// false

console.log(minimatch('.eslintrc.js', '*.js', { dot: true }));
// true
```

### Match the basename when the pattern has no slash

By default, `*.js` does not match `src/app.js`. Set `matchBase: true` to match against the last path segment.

```js
import { minimatch } from 'minimatch';

console.log(minimatch('src/app.js', '*.js'));
// false

console.log(minimatch('src/app.js', '*.js', { matchBase: true }));
// true
```

### Allow case-insensitive matching

Use `nocase: true` when your application should treat path case as equivalent.

```js
import { minimatch } from 'minimatch';

console.log(minimatch('SRC/App.JS', 'src/*.js'));
// false

console.log(minimatch('SRC/App.JS', 'src/*.js', { nocase: true }));
// true
```

### Match partial paths during directory walking

Use `partial: true` when you are traversing directories and want to keep paths that could still become a full match later.

```js
import { minimatch } from 'minimatch';

console.log(minimatch('/a/b', '/a/*/c/d', { partial: true }));
// true

console.log(minimatch('/a/b', '/**/d', { partial: true }));
// true

console.log(minimatch('/x/y/z', '/a/**/z', { partial: true }));
// false
```

### Disable specific glob syntax

Use these options when you need more literal or restricted pattern behavior:

- `nobrace`: disable brace expansion
- `noglobstar`: treat `**` like `*`
- `noext`: disable extglobs such as `+(a|b)`
- `nonegate`: treat a leading `!` as a literal character
- `nocomment`: treat a leading `#` as a normal pattern

## Windows and path separators

Write glob patterns with forward slashes only.

```js
import { minimatch } from 'minimatch';
import path from 'node:path';

const filePath = path.join('src', 'app.js');

console.log(filePath);
// 'src\\app.js' on Windows

console.log(minimatch(filePath, 'src/*.js'));
// true on Windows and POSIX
```

Do not build glob patterns with `path.join()` on Windows, because backslashes in patterns are treated as escape characters by default.

```js
import { minimatch } from 'minimatch';
import path from 'node:path';

const badPattern = path.join('src', '*.js');

console.log(badPattern);
// 'src\\*.js' on Windows

console.log(minimatch('src/app.js', badPattern));
// not the same as matching against 'src/*.js'
```

If you intentionally need Windows-style separators in the pattern, use `windowsPathsNoEscape: true`.

```js
import { minimatch } from 'minimatch';

console.log(
  minimatch('src\\app.js', 'src\\*.js', {
    windowsPathsNoEscape: true,
    platform: 'win32',
  })
);
// true
```

`platform: 'win32'` enables Windows-specific behavior such as UNC path handling and treating `\\` as a separator in file paths.

## Security and correctness pitfalls

- Do not treat untrusted user input as a safe glob pattern. The maintainer explicitly warns that JavaScript glob matchers built on regular expressions are vulnerable to ReDoS when attackers control the pattern.
- `minimatch` matches strings you pass in; use another library such as `glob` if you need filesystem traversal.
- Patterns starting with `#` are comments unless you set `nocomment: true`.
- Patterns starting with `!` are negated unless you set `nonegate: true`.
- If you raise `optimizationLevel` to `2` or higher, `Minimatch.match()` keeps path optimization aligned with the pattern, but testing raw paths directly against the `RegExp` returned by `makeRe()` can differ unless the path is optimized in the same way.
- Defaults like `maxGlobstarRecursion` and `maxExtglobRecursion` exist for performance and safety. Extremely deep or malicious patterns may intentionally produce false negatives instead of exhaustive matching.

## Minimal example

```js
import { match, minimatch } from 'minimatch';

const changedFiles = [
  'src/index.js',
  'src/index.test.js',
  'src/components/button.ts',
  '.github/workflows/ci.yml',
];

const buildInputs = match(changedFiles, 'src/**/*.{js,ts}');
const shouldRunUnitTests = changedFiles.some((file) =>
  minimatch(file, 'src/**/!(*.test).{js,ts}')
);

console.log({ buildInputs, shouldRunUnitTests });
```
