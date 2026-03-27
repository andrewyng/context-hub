---
name: picomatch
description: "picomatch guide for glob matching JavaScript paths, filenames, and custom tooling"
metadata:
  languages: "javascript"
  versions: "4.0.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "picomatch,glob,matching,paths,files,regex"
---

# picomatch for JavaScript

`picomatch` compiles glob patterns into matcher functions or regular expressions. It matches strings only. It does not walk the file system, and it does not do shell-style brace expansion.

## Install

```bash
npm install picomatch@4.0.3
```

`picomatch 4.0.3` declares `node >=12`.

## Import and initialize

There is no client object, auth flow, or environment-variable setup. Import the package, create a matcher, and reuse it.

```js
const picomatch = require('picomatch');

const isJavaScript = picomatch('*.js');

console.log(isJavaScript('index.js')); // true
console.log(isJavaScript('index.ts')); // false
console.log(isJavaScript('src/index.js')); // false
```

`*` matches within a single path segment. Use `**` when you want to match nested directories:

```js
const picomatch = require('picomatch');

const isNestedJavaScript = picomatch('**/*.js');

console.log(isNestedJavaScript('src/index.js')); // true
console.log(isNestedJavaScript('src/lib/util.ts')); // false
```

## Common workflows

### Reuse a compiled matcher

Compile once and call the returned function for repeated checks.

```js
const picomatch = require('picomatch');

const shouldWatch = picomatch(['src/**/*.js', 'scripts/**/*.mjs'], {
  ignore: ['**/*.test.js', '**/dist/**'],
});

for (const file of [
  'src/index.js',
  'src/index.test.js',
  'scripts/build.mjs',
  'src/dist/bundle.js',
]) {
  console.log(file, shouldWatch(file));
}

// src/index.js true
// src/index.test.js false
// scripts/build.mjs true
// src/dist/bundle.js false
```

When you pass an array of patterns, `picomatch()` returns a single matcher that succeeds when any pattern matches.

### Match a basename anywhere in a path

If the pattern has no slash, set `basename: true` to match against the last path segment.

```js
const picomatch = require('picomatch');

const isReadme = picomatch('README.md', { basename: true });

console.log(isReadme('README.md')); // true
console.log(isReadme('docs/README.md')); // true
console.log(isReadme('docs/README.txt')); // false
```

For a one-off basename check, use `picomatch.matchBase()`:

```js
const picomatch = require('picomatch');

console.log(picomatch.matchBase('docs/guide.md', '*.md')); // true
console.log(picomatch.matchBase('docs/guide.txt', '*.md')); // false
```

### Enable dotfiles, extglobs, and POSIX character classes

Dotfiles are skipped by default. POSIX bracket expressions are also disabled unless you opt in with `posix: true`.

```js
const picomatch = require('picomatch');

const isConfigFile = picomatch('*.@(js|json)', {
  dot: true,
});

console.log(isConfigFile('.eslintrc.js')); // true
console.log(isConfigFile('package.json')); // true

console.log(picomatch.isMatch('A', '[[:upper:]]', { posix: true })); // true
console.log(picomatch.isMatch('7', '[[:digit:]]', { posix: true })); // true
```

### Generate a `RegExp`

Use `makeRe()` when another API expects a regular expression instead of a matcher function.

```js
const picomatch = require('picomatch');

const sourceFileRe = picomatch.makeRe('src/**/*.js');

console.log(sourceFileRe.test('src/index.js')); // true
console.log(sourceFileRe.test('test/index.js')); // false
```

If you only need a one-off boolean check, `picomatch.isMatch()` is shorter:

```js
const picomatch = require('picomatch');

console.log(picomatch.isMatch('src/index.js', '**/*.js')); // true
console.log(picomatch.isMatch('src/index.ts', '**/*.js')); // false
```

### Inspect a pattern for custom tooling

`scan()` is useful when you need to separate a prefix, base path, and glob portion before matching.

```js
const picomatch = require('picomatch');

const result = picomatch.scan('!./src/**/*.js', { tokens: true });

console.log(result.prefix); // !./
console.log(result.base);   // src
console.log(result.glob);   // **/*.js
console.log(result.negated); // true
console.log(result.parts);   // ['src', '**/*.js']
```

## Path handling and cross-platform behavior

The main `picomatch` entry auto-detects the current OS and sets `windows` when you do not pass it yourself. That means the same pattern can behave differently on Windows and non-Windows hosts.

For predictable POSIX-style matching everywhere, use `picomatch/posix`:

```js
const picomatch = require('picomatch/posix');

const isMatch = picomatch('src/*');

console.log(isMatch('src/index.js')); // true
console.log(isMatch('src\\index.js')); // false
```

If you want to accept backslashes as path separators, set `windows: true`:

```js
const picomatch = require('picomatch');

const isMatch = picomatch('src/*', { windows: true });

console.log(isMatch('src/index.js')); // true
console.log(isMatch('src\\index.js')); // true
```

## Configuration

There are no package-wide config files or environment variables. Configure behavior per matcher with options.

Common options for application code:

- `dot: true` to include dotfiles
- `ignore` to exclude matches after a positive include match
- `basename: true` or `matchBase: true` to match the last path segment
- `nocase: true` for case-insensitive matching
- `windows: true` to accept backslashes as separators
- `posix: true` to enable POSIX bracket expressions such as `[[:digit:]]`
- `contains: true` when the glob should match any substring instead of the whole input

Example:

```js
const picomatch = require('picomatch');

const matchesArtifact = picomatch('build', {
  contains: true,
  nocase: true,
});

console.log(matchesArtifact('tmp/Build/output.txt')); // true
console.log(matchesArtifact('tmp/dist/output.txt')); // false
```

## Common pitfalls

- `*` does not match across `/`. Use `**` for nested directories.
- Dotfiles are ignored unless the pattern starts with `.` or you pass `dot: true`.
- POSIX bracket classes like `[[:word:]]` require `posix: true`.
- `picomatch` has basic brace support for matching, but it does not do brace expansion. If you need expansion semantics, use `micromatch` or expand patterns before calling `picomatch`.
- The main export auto-detects Windows path handling. Normalize input paths or choose `picomatch/posix` if your tooling needs identical results across platforms.
- If you need literal special characters such as `$`, `^`, `*`, `+`, `?`, `(`, `)`, or `[]` in a glob, escape them with backslashes or quotes.
- `picomatch` only matches strings. Pair it with your own directory traversal or file-list source when you need to discover files on disk.

## Version-sensitive notes

- This guide covers `picomatch 4.0.3`.
- `4.0.3` publishes a CommonJS entrypoint and declares `node >=12`.
- The root `picomatch` export auto-detects the host platform when `options.windows` is omitted; `picomatch/posix` avoids that auto-detection.

## Official sources

- Repository: https://github.com/micromatch/picomatch
- Maintainer README: https://github.com/micromatch/picomatch/blob/master/README.md
- Package source entrypoint: https://github.com/micromatch/picomatch/blob/master/index.js
- Package matcher implementation: https://github.com/micromatch/picomatch/blob/master/lib/picomatch.js
- npm package page: https://www.npmjs.com/package/picomatch
