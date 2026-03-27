---
name: semver
description: "TypeScript declarations for the semver runtime package, including typed parsing, comparison, ranges, and SemVer classes"
metadata:
  languages: "typescript"
  versions: "7.7.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,semver,versioning,npm,types"
---

# semver TypeScript Guide

`@types/semver` provides the declaration files for the `semver` runtime package. Install it when your TypeScript project imports `semver` and you want typed access to helpers such as `valid`, `clean`, `compare`, `satisfies`, `coerce`, `inc`, `Range`, and `SemVer`.

This package only adds `.d.ts` files. It does not install the runtime library or the `semver` CLI by itself.

## Install

Install the runtime package and the declarations together:

```bash
npm install semver
npm install --save-dev @types/semver
```

The published `@types/semver` package declares `typeScriptVersion: "5.2"`, so use TypeScript 5.2 or newer.

No environment variables, authentication, or client initialization are required.

## Import `semver` In TypeScript

Use a namespace import for the top-level runtime package:

```ts
import * as semver from "semver";
import type { ReleaseType } from "semver";
```

The declaration package exports named symbols from `"semver"`, including `SemVer`, `Range`, `Comparator`, `RELEASE_TYPES`, `SEMVER_SPEC_VERSION`, and the standard comparison and range helpers.

Avoid relying on a default import if you want configuration-independent typings; the published declarations do not declare a default export.

## Validate And Parse Versions

Most application code starts by normalizing a user-provided version string, then working with the parsed `SemVer` object.

```ts
import * as semver from "semver";

export function parseVersion(input: string) {
  const cleaned = semver.clean(input);
  if (!cleaned) {
    throw new Error(`Invalid semantic version: ${input}`);
  }

  const parsed = semver.parse(cleaned);
  if (!parsed) {
    throw new Error(`Could not parse semantic version: ${cleaned}`);
  }

  return {
    normalized: parsed.version,
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
    prerelease: parsed.prerelease,
    build: parsed.build,
  };
}
```

The important typing detail is that `clean()` returns `string | null`, and `parse()` returns `SemVer | null` unless you use its throwing overload. Guard both results before reading `.version`, `.major`, or `.prerelease`.

## Compare And Sort Versions

The top-level helpers are typed for both string inputs and `SemVer` instances.

```ts
import * as semver from "semver";

const releases = ["7.6.3", "7.7.1", "7.7.1-beta.1", "7.7.0"];

const stable = releases.filter((version) => semver.prerelease(version) === null);
const newest = semver.rsort(stable)[0];

if (semver.gt(newest, "7.7.0")) {
  console.log(`${newest} is newer than 7.7.0`);
}
```

Use `compareBuild()` when build metadata must participate in the comparison. Use `compare()` when you want standard precedence without build metadata.

## Check Version Ranges

The declaration package includes both function helpers and the `Range` class.

```ts
import * as semver from "semver";

const supportedRange = "^7.0.0";
const requestedVersion = "7.7.1";

if (!semver.satisfies(requestedVersion, supportedRange)) {
  throw new Error(`Expected ${requestedVersion} to satisfy ${supportedRange}`);
}

const floor = semver.minVersion(supportedRange);
const newestSupported = semver.maxSatisfying(
  ["6.9.0", "7.5.4", "7.7.1", "8.0.0"],
  supportedRange,
);

console.log({
  floor: floor?.version ?? null,
  newestSupported,
});
```

When you want to reuse a parsed range, instantiate `Range` directly:

```ts
import * as semver from "semver";

const range = new semver.Range("^7.0.0 || ^8.0.0");

console.log(range.test("7.7.1"));
console.log(range.test("9.0.0"));
```

For prerelease-aware checks, pass `includePrerelease` in the options object:

```ts
import * as semver from "semver";

const allowed = semver.satisfies("7.8.0-rc.1", "^7.8.0-0", {
  includePrerelease: true,
});

console.log(allowed);
```

## Coerce Non-Standard Input

`coerce()` is useful at the boundary where tags, filenames, or release labels contain a version but are not already valid semver strings.

```ts
import * as semver from "semver";

const coerced = semver.coerce("release-7.7");

if (coerced) {
  console.log(coerced.version);
}

const withPrerelease = semver.coerce("1.2.3.4-rc.1+rev.2", {
  includePrerelease: true,
});

console.log(withPrerelease?.version ?? null);
```

The declarations type `coerce()` as returning `SemVer | null`, not a string. The `CoerceOptions` interface in `@types/semver` includes both `rtl` and `includePrerelease`.

## Use Typed Release Increments

The package exports the `ReleaseType` union and `RELEASE_TYPES` constant for safe increment logic.

```ts
import * as semver from "semver";
import type { ReleaseType } from "semver";

export function bump(version: string, release: ReleaseType) {
  return semver.inc(version, release);
}

const nextPatch = bump("7.7.1", "patch");
const nextBeta = semver.inc("7.7.1", "prerelease", "beta");

console.log({ nextPatch, nextBeta });
```

If you accept release types from user input, validate them before passing them to `inc()`:

```ts
import * as semver from "semver";
import type { ReleaseType } from "semver";

function isReleaseType(value: string): value is ReleaseType {
  return (semver.RELEASE_TYPES as readonly string[]).includes(value);
}
```

## Deep Imports For Narrower Usage

The `semver` README documents subpath entry points, and `@types/semver` ships matching declarations for them.

```ts
import Range = require("semver/classes/range");
import coerce = require("semver/functions/coerce");

const range = new Range("^7.0.0");
const version = coerce("v7");

console.log(range.test(version?.version ?? "0.0.0"));
```

Use the top-level `semver` import unless you have a specific reason to depend on a subpath.

## CLI Boundary

The `semver` command-line tool comes from the runtime package, not from `@types/semver`. After installing `semver`, you can run the CLI with `npx`:

```bash
npx semver -r "^7.0.0" 7.6.3 7.7.1 8.0.0
```

Keep this distinction in mind when a project needs both compile-time types and a local version-checking command in scripts.

## Practical Pitfalls

- Install `semver` as the runtime dependency; `@types/semver` only provides declarations.
- Use TypeScript 5.2 or newer, which is the minimum version declared by `@types/semver` 7.7.1.
- Guard `clean()`, `parse()`, `coerce()`, `validRange()`, `maxSatisfying()`, and other nullable results before using them.
- Prefer `import * as semver from "semver"` or explicit subpath imports instead of a default import.
