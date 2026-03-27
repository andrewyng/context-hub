---
name: semver
description: "Semantic version parsing, comparison, range matching, and CLI utilities for JavaScript"
metadata:
  languages: "javascript"
  versions: "7.7.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "javascript,semver,versioning,npm,cli"
---

# semver for JavaScript

Use `semver` to validate version strings, compare releases, evaluate ranges, and increment versions in Node.js tools and release automation.

## Install

```bash
npm install semver
```

The package metadata for `7.7.4` declares `node: ">=10"`.

## Import and setup

`semver` does not require environment variables, authentication, or client initialization.

The maintainer README documents CommonJS usage:

```js
const semver = require("semver");
```

If you only need one helper or class, load a documented subpath directly:

```js
const Range = require("semver/classes/range");
const coerce = require("semver/functions/coerce");
```

## Validate and normalize versions

Use `clean()` when inputs may contain surrounding whitespace or compatibility prefixes such as `=` or `v`. Use `parse()` when you need the structured `SemVer` fields.

```js
const semver = require("semver");

function normalizeVersion(input) {
  const cleaned = semver.clean(input);
  if (!cleaned) {
    throw new Error(`Invalid semantic version: ${input}`);
  }

  const parsed = semver.parse(cleaned);
  if (!parsed) {
    throw new Error(`Could not parse semantic version: ${cleaned}`);
  }

  return {
    version: parsed.version,
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
    prerelease: parsed.prerelease,
    build: parsed.build,
  };
}

console.log(normalizeVersion(" =v1.2.3   "));
```

`semver` strips a leading `v` for compatibility, but the README says that form should not be used anymore. Prefer storing and emitting canonical versions such as `1.2.3`.

## Compare and sort versions

Use the boolean helpers for direct comparisons and `sort()` or `rsort()` for lists.

```js
const semver = require("semver");

const versions = ["1.2.4", "1.2.3", "1.2.3+build.2"];

console.log(semver.gt("1.2.4", "1.2.3"));
console.log(semver.sort(versions));
console.log(semver.rsort(versions));
```

When build metadata matters, use `compareBuild()` instead of `compare()`:

```js
const semver = require("semver");

console.log(semver.compare("1.2.3+build.1", "1.2.3+build.2"));
console.log(semver.compareBuild("1.2.3+build.1", "1.2.3+build.2"));
```

`compare()` follows normal semver precedence and treats those two versions as equal. `compareBuild()` also considers build metadata.

## Match version ranges

Use `satisfies()` for one-off checks and `maxSatisfying()` or `minVersion()` when selecting from an available set.

```js
const semver = require("semver");

const supportedRange = "^7.0.0";
const requestedVersion = "7.7.4";
const availableVersions = ["6.9.0", "7.5.4", "7.7.4", "8.0.0"];

if (!semver.satisfies(requestedVersion, supportedRange)) {
  throw new Error(`${requestedVersion} does not satisfy ${supportedRange}`);
}

console.log(semver.minVersion(supportedRange)?.version);
console.log(semver.maxSatisfying(availableVersions, supportedRange));

const range = new semver.Range("^7.0.0 || ^8.0.0");
console.log(range.test("7.7.4"));
console.log(range.test("9.0.0"));
```

### Prerelease range behavior

By default, prerelease versions are excluded from range matching unless the comparator set explicitly opts into the same `[major, minor, patch]` prerelease line, or you pass `includePrerelease: true`.

```js
const semver = require("semver");

console.log(semver.satisfies("1.2.4-beta.1", "^1.2.3"));
console.log(
  semver.satisfies("1.2.4-beta.1", "^1.2.3", { includePrerelease: true }),
);
```

If you are evaluating release candidates or beta builds, make that behavior explicit in code.

## Increment versions

Use `inc()` to bump stable releases and prerelease lines.

```js
const semver = require("semver");

console.log(semver.inc("1.2.3", "patch"));
console.log(semver.inc("1.2.3", "prerelease", "beta"));
console.log(semver.inc("1.2.3", "prerelease", "beta", "1"));
console.log(semver.inc("1.2.3", "prerelease", "beta", false));
console.log(semver.inc("1.2.4-beta.1", "release"));
```

Use `RELEASE_TYPES` to validate user input before passing it into `inc()`:

```js
const semver = require("semver");

function assertReleaseType(value) {
  if (!semver.RELEASE_TYPES.includes(value)) {
    throw new Error(`Unsupported release type: ${value}`);
  }
}
```

## Coerce non-standard input

`coerce()` is intentionally forgiving. Use it when a filename, tag, or label contains a version, not when you need strict validation.

```js
const semver = require("semver");

console.log(semver.coerce("release-7.7")?.version);
console.log(semver.coerce("1.2.3.4", { rtl: true })?.version);

const prerelease = semver.coerce("release-1.2.3-rc.1+rev.2", {
  includePrerelease: true,
});

console.log(prerelease?.version);
console.log(prerelease?.build);
```

Important behavior from the README:

- `coerce()` ignores surrounding text and looks for the first coercible version tuple.
- Extra numeric segments can be truncated rather than preserved.
- `rtl: true` searches from the right-most coercible tuple instead of the default left-to-right behavior.

For input that must already be valid semver, prefer `valid()`, `clean()`, or `parse()`.

## Use the CLI

The package installs a `semver` command. Use `npx` if you do not install it globally.

Filter versions by range:

```bash
npx semver -r "^7.0.0" 7.6.3 7.7.4 8.0.0
```

Increment prereleases:

```bash
npx semver 1.2.3 -i prerelease --preid beta
npx semver 1.2.4-beta.1 -i release
npx semver 1.2.3 -i prerelease --preid beta -n false
```

Coerce loose input:

```bash
npx semver "release-7.7" -c
```

The CLI exits successfully if any valid version satisfies all supplied ranges. If no satisfying version is found, it exits with failure, which makes it useful in shell scripts and CI checks.

## Practical notes

- Use `satisfies()` to answer yes or no questions. Range helpers such as `gtr()` and `ltr()` answer different questions and ranges can have gaps.
- Use `compareBuild()` when build metadata should affect ordering; use `compare()` for normal semver precedence.
- Use `coerce()` only at the boundary where input is messy. Do not treat it as strict validation.
- Keep prerelease handling explicit. The default range semantics intentionally exclude most prerelease versions.
