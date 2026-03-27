---
name: unzipper
description: "TypeScript declarations for the Node.js unzipper runtime, including archive extraction, entry parsing, and archive inspection workflows."
metadata:
  languages: "typescript"
  versions: "0.10.11"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,unzipper,zip,archive,node,streams,types,definitelytyped"
---

# unzipper TypeScript Guide

## Golden Rule

Install `unzipper` for the runtime and `@types/unzipper` for compile-time declarations.

Import from `unzipper`, not from `@types/unzipper`:

```typescript
import unzipper from "unzipper";
```

`@types/unzipper` only supplies TypeScript declarations for the `unzipper` package. It does not install the runtime, and it is meant for Node.js code that works with streams and the filesystem.

## Install

Add the runtime package and the TypeScript declarations:

```bash
npm install unzipper
npm install -D typescript @types/unzipper @types/node
```

If TypeScript is already configured in the project, add only the missing declarations:

```bash
npm install -D @types/unzipper @types/node
```

## Initialization

There is no package-specific auth flow, API key, or client object for `@types/unzipper`.

The practical setup is:

- install the `unzipper` runtime package
- let TypeScript load `@types/unzipper`
- use Node.js stream and filesystem APIs alongside `unzipper`

### Recommended `tsconfig.json`

If you want `import unzipper from "unzipper";`, enable interop for the CommonJS runtime package:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "types": ["node"],
    "skipLibCheck": false
  }
}
```

If you do not enable `esModuleInterop`, use the CommonJS-compatible import form instead:

```typescript
import unzipper = require("unzipper");
```

### Optional environment variables for app code

`@types/unzipper` has no package-defined environment variables. For scripts and services, it is common to make the archive path and output path configurable:

```bash
ZIP_FILE=./fixtures/archive.zip
UNZIP_OUTPUT_DIR=./tmp/unpacked
```

## Common Workflows

### Extract a whole archive to disk

Use `Extract({ path })` when you want to unpack the entire archive into a directory.

```typescript
import { createReadStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import unzipper from "unzipper";

async function extractArchive(): Promise<void> {
  const zipFile = process.env.ZIP_FILE ?? "./fixtures/archive.zip";
  const outputDir = process.env.UNZIP_OUTPUT_DIR ?? "./tmp/unpacked";

  await mkdir(outputDir, { recursive: true });

  await createReadStream(zipFile)
    .pipe(unzipper.Extract({ path: outputDir }))
    .promise();
}

await extractArchive();
```

This is the simplest path when you do not need to inspect entries individually.

### Parse entries and keep only selected files

Use `Parse()` when you need to inspect each entry, route files to different destinations, or skip unwanted members.

```typescript
import { createReadStream, createWriteStream } from "node:fs";
import unzipper from "unzipper";

async function extractReadme(zipFile: string, outputFile: string): Promise<boolean> {
  return await new Promise<boolean>((resolve, reject) => {
    let matched = false;

    const parser = unzipper.Parse();

    parser.on("entry", (entry) => {
      if (entry.type === "File" && entry.path === "README.md") {
        matched = true;

        entry
          .pipe(createWriteStream(outputFile))
          .on("finish", () => resolve(true))
          .on("error", reject);

        return;
      }

      entry.autodrain();
    });

    parser.on("close", () => {
      if (!matched) {
        resolve(false);
      }
    });

    parser.on("error", reject);

    createReadStream(zipFile)
      .on("error", reject)
      .pipe(parser);
  });
}

const found = await extractReadme("./fixtures/archive.zip", "./tmp/README.md");

if (!found) {
  console.error("README.md was not present in the archive");
}
```

When you skip an entry, call `entry.autodrain()` so the archive stream can continue.

### Inspect archive contents before extracting

Use `Open.file()` when you want to inspect the central directory first and then read a specific member.

```typescript
import unzipper from "unzipper";

type PackageJson = {
  name: string;
  version: string;
};

async function readPackagedManifest(zipFile: string): Promise<PackageJson> {
  const directory = await unzipper.Open.file(zipFile);
  const manifest = directory.files.find((entry) => entry.path === "package.json");

  if (!manifest) {
    throw new Error("package.json was not found in the archive");
  }

  const raw = await manifest.buffer();
  return JSON.parse(raw.toString("utf8")) as PackageJson;
}

const packageJson = await readPackagedManifest("./fixtures/archive.zip");
console.log(packageJson.name, packageJson.version);
```

For large members, prefer `entry.stream()` over `buffer()` so you do not load the whole file into memory at once.

## Important Pitfalls

- `@types/unzipper` does not include the `unzipper` runtime; keep `unzipper` in regular dependencies.
- `unzipper` is a Node.js package built around streams and filesystem access, not a browser package.
- If you process entries manually with `Parse()`, drain every entry you do not consume.
- `entry.buffer()` is convenient for small files; use streaming for large archive members.
- Choose the import form that matches your compiler settings: default import with `esModuleInterop`, or `import unzipper = require("unzipper")` without it.

## Version Notes

This guide covers the declaration package version `@types/unzipper@0.10.11`.

The examples focus on the typed `unzipper` APIs that matter most in application code: `Extract()`, `Parse()`, and `Open.file()`.
