---
name: mongoose
description: "TypeScript setup for Mongoose. `@types/mongoose@5.11.97` is a stub package; install `mongoose` itself because it ships its own type definitions."
metadata:
  languages: "typescript"
  versions: "5.11.97"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,mongoose,mongodb,types,definitelytyped,schemas"
---

# Mongoose TypeScript Guide

## Golden Rule

`@types/mongoose@5.11.97` is not the package you should use for new Mongoose applications.

The npm page for `@types/mongoose` marks it as a stub package and says that `mongoose` provides its own type definitions. Install the runtime `mongoose` package and import both runtime APIs and TypeScript types from `mongoose`.

If an older project still has `@types/mongoose` in its lockfile, remove it unless that project is pinned to a historical Mongoose setup that still depended on DefinitelyTyped declarations.

## Install

Install Mongoose itself plus the normal TypeScript toolchain for a Node.js app:

```bash
npm install mongoose
npm install -D typescript @types/node
```

If your project already added the old stub package, remove it:

```bash
npm uninstall @types/mongoose
```

There are no package-specific credentials or auth steps. The practical setup is your MongoDB connection string and your TypeScript compiler.

## Initialization

Use your application's MongoDB connection string, commonly provided through `MONGODB_URI`, and connect with `mongoose.connect()`.

```ts
import { connect } from "mongoose";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("Set MONGODB_URI before starting the app");
}

await connect(mongoUri, {
  dbName: "app",
});
```

If your `tsconfig.json` uses `compilerOptions.types`, include `node` so `process.env` is typed:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

## Common Workflows

### Define a schema and infer the document type

For straightforward schemas, define the schema inline and let Mongoose infer the TypeScript shape from it.

```ts
import {
  InferSchemaType,
  Schema,
  model,
  type HydratedDocument,
} from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

type User = InferSchemaType<typeof userSchema>;
type UserDocument = HydratedDocument<User>;

const UserModel = model("User", userSchema);

const created: UserDocument = await UserModel.create({
  email: "ada@example.com",
  displayName: "Ada",
  tags: ["admin"],
});

const loaded = await UserModel.findOne({ email: "ada@example.com" });
```

`InferSchemaType<typeof userSchema>` gives you the plain document shape, and `HydratedDocument<T>` represents the document instance you get back from Mongoose model operations.

### Use an explicit interface when inference is not enough

Mongoose's TypeScript guide recommends automatic inference for the common case, but an explicit interface is safer when your schema definition is built separately, changed after construction, or otherwise stops matching what Mongoose can infer cleanly.

```ts
import { Schema, model } from "mongoose";

interface InventoryItem {
  sku: string;
  quantity: number;
  archived?: boolean;
}

const inventorySchema = new Schema<InventoryItem>({
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  archived: { type: Boolean, default: false },
});

const InventoryModel = model<InventoryItem>("InventoryItem", inventorySchema);

await InventoryModel.updateOne(
  { sku: "A-100" },
  { $inc: { quantity: 1 } },
  { upsert: true },
);
```

Keep the interface aligned with the real schema. Mongoose does not automatically verify that your interface exactly matches every later schema change.

### Type `ObjectId` correctly

Use `Types.ObjectId` in your TypeScript document interface, and `Schema.Types.ObjectId` in the schema definition.

```ts
import { Schema, Types, model } from "mongoose";

interface Post {
  title: string;
  author: Types.ObjectId;
}

const postSchema = new Schema<Post>({
  title: { type: String, required: true },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const PostModel = model<Post>("Post", postSchema);

await PostModel.create({
  title: "Hello",
  author: new Types.ObjectId(),
});
```

This split is important because `Types.ObjectId` is the TypeScript type for values in your documents, while `Schema.Types.ObjectId` is the schema-path constructor Mongoose expects in the schema definition.

## Pitfalls

- Do not import from `@types/mongoose`; import from `mongoose`.
- Do not keep both `mongoose` and `@types/mongoose` installed in a modern project unless you are intentionally maintaining an old setup.
- Prefer inline schema definitions when you want the cleanest automatic inference.
- When you use a manual interface, keep it synchronized with the schema because Mongoose cannot guarantee they stay consistent.
- Use `Types.ObjectId` for TypeScript fields and `Schema.Types.ObjectId` for schema paths.

## Minimal End-to-End Example

```ts
import {
  Schema,
  connect,
  disconnect,
  model,
  type InferSchemaType,
} from "mongoose";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("Set MONGODB_URI before running this script");
}

await connect(mongoUri, { dbName: "app" });

const todoSchema = new Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
});

type Todo = InferSchemaType<typeof todoSchema>;

const TodoModel = model<Todo>("Todo", todoSchema);

const created = await TodoModel.create({ title: "write docs" });
const todos = await TodoModel.find({ done: false }).lean();

console.log(created.title);
console.log(todos.map((todo) => todo.title));

await disconnect();
```

This is the practical boundary for `@types/mongoose`: install `mongoose`, connect with `connect()`, define schemas with `Schema`, and import the TypeScript helpers you need from the same package.
