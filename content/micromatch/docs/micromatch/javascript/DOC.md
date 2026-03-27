---
name: micromatch
description: "Micromatch for filtering strings, paths, and object keys with Bash-style glob patterns in JavaScript and Node.js."
metadata:
  languages: "javascript"
  versions: "4.0.8"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "micromatch,glob,matching,paths,nodejs,javascript"
---

# Micromatch Guide for JavaScript

## Golden Rule

Use `micromatch` to match strings you already have against glob patterns. It does not walk directories or expand files from disk by itself. First collect candidate paths or keys, then pass that list to `micromatch`.

`micromatch` does not need environment variables, authentication, or client initialization. Import it and call the exported functions directly.

## Install

```bash
npm install micromatch@4.0.8
```

The published `4.0.8` package metadata declares `node >=8.6`.

## Imports

Micromatch 4.0.8 publishes CommonJS. Use `require()` in CommonJS, or a default import in ESM.

```js
// CommonJS
const micromatch = require('micromatch');
```

```js
// ESM
import micromatch from 'micromatch';
```

Helpers are methods on the default export, such as `micromatch.isMatch()`, `micromatch.matcher()`, `micromatch.makeRe()`, and `micromatch.matchKeys()`.

## Common Workflows

### Filter a list of paths

Pass an array of candidate strings and one or more glob patterns. Negated patterns are supported in the pattern list.

```js
import micromatch from 'micromatch';

const files = [
  'src/index.js',
  'src/app.test.js',
  'src/lib/util.js',
  'README.md',
];

const matches = micromatch(files, [
  'src/**/*.js',
  '!src/**/*.test.js',
]);

console.log(matches);
// ['src/index.js', 'src/lib/util.js']
```

Use `ignore` when you want exclusions to live in options instead of the main pattern list:

```js
const matches = micromatch(files, 'src/**/*.js', {
  ignore: ['**/*.test.js'],
});
```

### Check one string or path

Use `isMatch()` when you want a boolean for a single string.

```js
import micromatch from 'micromatch';

console.log(micromatch.isMatch('src/index.js', '**/*.js'));
// true

console.log(micromatch.isMatch('src/index.css', '**/*.js'));
// false
```

Use `contains()` when the pattern may match only part of the string instead of the whole value:

```js
console.log(micromatch.contains('src/components/button.js', 'components/*'));
// true
```

### Reuse a compiled matcher

`matcher()` compiles a glob once and returns a predicate function. Use it when you will test many strings against the same pattern.

```js
import micromatch from 'micromatch';

const isSourceFile = micromatch.matcher('src/**/*.{js,ts}', {
  dot: true,
});

const selected = [
  'src/index.js',
  'src/.generated/types.ts',
  'test/index.test.js',
].filter(isSourceFile);

console.log(selected);
// ['src/index.js', 'src/.generated/types.ts']
```

### Match object keys

`matchKeys()` filters only the top-level keys of an object.

```js
import micromatch from 'micromatch';

const commands = {
  'build:app': './scripts/build-app.js',
  'build:docs': './scripts/build-docs.js',
  'test:unit': './scripts/test-unit.js',
};

const buildCommands = micromatch.matchKeys(commands, 'build:*');

console.log(buildCommands);
// { 'build:app': './scripts/build-app.js', 'build:docs': './scripts/build-docs.js' }
```

### Create a regular expression or capture segments

Use `makeRe()` when you need a regular expression, and `capture()` when you need the wildcard captures from a matching path.

```js
import micromatch from 'micromatch';

const regex = micromatch.makeRe('src/*.js');
console.log(regex.test('src/index.js'));
// true

console.log(micromatch.capture('src/*/index.js', 'src/utils/index.js'));
// ['utils']
```

## Pattern Features

Micromatch supports the usual Bash-style glob features and several extended forms:

- Wildcards: `*.js`, `file-?.txt`
- Globstars: `src/**/*.js`
- Negation: `!**/*.test.js`
- Extglobs: `src/**/!(*.test).js`, `@(api|ui)/**/*.ts`
- Braces: `src/*.{js,ts}`, `docs/{guide,api}.md`
- POSIX bracket expressions: `[[:alpha:]][[:digit:]].txt`
- Regex-style groups: `(foo|bar).js`

```js
import micromatch from 'micromatch';

const entries = [
  'src/api/index.ts',
  'src/api/index.test.ts',
  'src/ui/button.ts',
];

const result = micromatch(entries, 'src/**/!(*.test).ts');

console.log(result);
// ['src/api/index.ts', 'src/ui/button.ts']
```

## Important Options

### Match basenames instead of full paths

By default, `*.js` does not match `src/app.js` because the pattern has no slash. Set `basename: true` (or the alias `matchBase: true`) to match against the final path segment.

```js
import micromatch from 'micromatch';

const files = ['src/app.js', 'src/app.css'];

console.log(micromatch(files, '*.js'));
// []

console.log(micromatch(files, '*.js', { basename: true }));
// ['src/app.js']
```

### Include dotfiles

Dotfiles are ignored unless the pattern explicitly starts with `.` or you set `dot: true`.

```js
import micromatch from 'micromatch';

const files = ['.config.js', 'index.js'];

console.log(micromatch(files, '*.js'));
// ['index.js']

console.log(micromatch(files, '*.js', { dot: true }));
// ['.config.js', 'index.js']
```

### Normalize or preserve Windows separators

On Windows, `posixSlashes` defaults to `true`, so returned matches are normalized to `/`. Set `posixSlashes: false` if your application must keep backslashes in returned values.

### Disable specific glob syntax

Use these options when you need more literal matching behavior:

- `nonegate`: treat a leading `!` as a literal character
- `noextglob`: disable extglobs like `!(foo)`
- `noglobstar`: disable `**`
- `nobrace`: disable brace expansion like `{js,ts}`
- `nocase`: perform case-insensitive matching

### Control no-match behavior

By default, no matches returns an empty array. Two options change that behavior:

- `failglob: true` throws when nothing matches
- `nonull: true` or `nullglob: true` returns the original pattern or patterns when nothing matches

```js
import micromatch from 'micromatch';

try {
  micromatch(['README.md'], '**/*.js', { failglob: true });
} catch (err) {
  console.error(err.message);
}
```

## Pitfalls

- Do not use `path.join()` to build glob patterns on Windows. Micromatch reserves backslashes for escaping, so `path.join('foo', '*')` becomes `foo\\*`, which matches a literal `*`. Write glob patterns with forward slashes instead.
- `micromatch()` matches the list you provide; it does not scan the filesystem.
- `contains()` is looser than `isMatch()`. Use `isMatch()` when the whole string or path should satisfy the glob.
- `matchKeys()` does not recurse into nested objects.
- If you need callbacks during matching, `onMatch`, `onIgnore`, and `onResult` are available in options.

## Minimal Example

```js
import micromatch from 'micromatch';

const changedFiles = [
  'src/index.js',
  'src/index.test.js',
  'scripts/release.mjs',
  '.github/workflows/ci.yml',
];

const filesToLint = micromatch(changedFiles, ['**/*.{js,mjs}', '!**/*.test.js'], {
  dot: true,
  ignore: ['**/node_modules/**'],
});

if (filesToLint.length > 0) {
  console.log('Lint these files:', filesToLint);
}
```
