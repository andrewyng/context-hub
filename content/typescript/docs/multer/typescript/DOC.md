---
name: multer
description: "TypeScript declarations for Multer's Express multipart middleware, including request augmentation, storage options, and typed upload handlers."
metadata:
  languages: "typescript"
  versions: "2.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,multer,express,file-upload,multipart,types,definitelytyped"
---

# Multer TypeScript Guide

## Golden Rule

Install `@types/multer` alongside the real `multer` runtime package. The type package only provides declarations for TypeScript; your application still imports and runs `multer`.

These declarations matter most in three places:

- creating a typed `multer()` instance with `storage`, `limits`, and `fileFilter`
- reading `req.file` or `req.files` in Express handlers
- referring to uploaded files with `Express.Multer.File`

## Install

Install the runtime package as a production dependency and the declarations in the same project as TypeScript and Express.

```bash
npm install express multer
npm install -D typescript @types/express @types/multer @types/node
```

If your project already has `multer`, add only the missing declaration package:

```bash
npm install -D @types/multer
```

Keep the declarations in the same environment as the TypeScript compiler or language server that checks your Express app.

## Initialization

There are no environment variables, credentials, or client objects to configure.

The main setup points are your import style and your TypeScript compiler options.

### Import `multer`

With `esModuleInterop` or `allowSyntheticDefaultImports`, use a default import:

```typescript
import multer from "multer";
```

Without interop, use the CommonJS import form:

```typescript
import multer = require("multer");
```

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

If you explicitly restrict ambient type packages with `compilerOptions.types`, include `multer` so the Express request augmentation stays visible:

```json
{
  "compilerOptions": {
    "types": ["node", "express", "multer"]
  }
}
```

## Common Workflows

### Single-file upload with `req.file`

`upload.single("field")` adds one optional file to `req.file`.

```typescript
import express from "express";
import multer from "multer";

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "avatar is required" });
    return;
  }

  res.json({
    field: req.file.fieldname,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    storedPath: req.file.path,
  });
});
```

Use `Express.Multer.File` when you want a standalone file type:

```typescript
function summarizeUpload(file: Express.Multer.File) {
  return {
    name: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
  };
}
```

### Multiple files from one field with `req.files`

`upload.array("photos", maxCount)` produces an array on `req.files`.

```typescript
import express from "express";
import multer from "multer";

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/photos", upload.array("photos", 8), (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (files.length === 0) {
    res.status(400).json({ error: "at least one photo is required" });
    return;
  }

  res.json({
    count: files.length,
    first: files[0].originalname,
  });
});
```

### Multiple named fields with typed field access

`upload.fields()` changes `req.files` to an object keyed by field name. Guard the union before reading named properties.

```typescript
import express from "express";
import multer from "multer";

const app = express();
const upload = multer({ dest: "uploads/" });

const profileUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "gallery", maxCount: 8 },
]);

app.post("/profile", profileUpload, (req, res) => {
  const files = req.files;

  if (!files || Array.isArray(files)) {
    res.status(400).json({ error: "expected named upload fields" });
    return;
  }

  const avatar = files.avatar?.[0];
  const gallery = files.gallery ?? [];

  res.json({
    avatar: avatar?.originalname ?? null,
    galleryCount: gallery.length,
  });
});
```

### Typed storage, limits, and `fileFilter`

Use `multer.diskStorage()` or `multer.memoryStorage()` from the runtime package, and type custom options from the declaration package.

```typescript
import express from "express";
import multer from "multer";

const app = express();

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, "uploads/avatars");
  },
  filename(_req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const imageOnly: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image uploads are allowed"));
    return;
  }

  cb(null, true);
};

const uploadAvatar = multer({
  storage,
  fileFilter: imageOnly,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

app.post("/avatars", uploadAvatar.single("avatar"), (req, res) => {
  res.status(204).end();
});
```

### Memory storage when another SDK needs a `Buffer`

For integrations that upload the received file somewhere else, `memoryStorage()` keeps the file in memory so your handler can read `buffer`.

```typescript
import express from "express";
import multer from "multer";

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post("/attachments", upload.single("attachment"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "attachment is required" });
    return;
  }

  const bytes = req.file.buffer.length;
  res.json({ receivedBytes: bytes, mimeType: req.file.mimetype });
});
```

### Narrow `req.file` after middleware

The Express request augmentation keeps `file` optional, so reusable helpers often need a narrow type.

```typescript
import type { Request } from "express";

type RequestWithFile = Request & {
  file: Express.Multer.File;
};

function requireFile(req: Request): asserts req is RequestWithFile {
  if (!req.file) {
    throw new Error("Expected a file upload");
  }
}
```

This pattern is useful when you want a helper function to work with `req.file.buffer`, `req.file.path`, or other file properties without repeating null checks everywhere.

## Important Pitfalls

- `@types/multer` is a declaration package only. Import `multer`, not `@types/multer`.
- Multer handles `multipart/form-data`; `express.json()` and `express.urlencoded()` do not parse file uploads.
- `req.file` and `req.files` are optional in the types because the middleware can reject a file, skip a field, or not run on a route.
- The shape of uploaded data depends on the middleware you choose: `single()` uses `req.file`, `array()` uses `req.files` as an array, and `fields()` uses `req.files` as a field-name map.
- `memoryStorage()` and `diskStorage()` expose different runtime properties in practice. Use `buffer` for in-memory uploads and `path`/`filename` for disk-backed uploads.
- If you set `compilerOptions.types`, make sure `multer` is still included or the Express request augmentation may appear to disappear.

## Version-Sensitive Notes

- This guide targets `@types/multer==2.1.0`.
- The package supplies TypeScript declarations for the `multer` runtime package; keep your declaration package aligned with the runtime API surface you use in the same project.
- The import style depends on your TypeScript compiler settings because the declarations are consumed as a CommonJS-style module.

## Official Sources

- npm package page: https://www.npmjs.com/package/@types/multer
- DefinitelyTyped source for `@types/multer`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/multer
- `@types/multer` declaration file: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/multer/index.d.ts
- Multer runtime documentation: https://github.com/expressjs/multer#readme
