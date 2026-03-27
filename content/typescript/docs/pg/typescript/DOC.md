---
name: pg
description: "TypeScript declarations for node-postgres, covering Pool and Client configuration, typed queries, transactions, notifications, and database errors."
metadata:
  languages: "typescript"
  versions: "8.18.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,postgresql,pg,nodejs,sql,types,definitelytyped"
---

# pg TypeScript Guide

## Golden Rule

Install `@types/pg` for compile-time declarations only.

Your application still needs the real `pg` package at runtime. Import from `"pg"`, not from `"@types/pg"`.

The declarations cover the main `pg` APIs you use in app code: `Pool`, `Client`, `PoolClient`, `ClientConfig`, `PoolConfig`, `QueryConfig`, `QueryResult`, `QueryResultRow`, `Notification`, and `DatabaseError`.

## Install

Install the runtime client first, then add TypeScript and declaration packages:

```bash
npm install pg
npm install -D typescript @types/node @types/pg
```

If your project already uses `pg`, add only the missing declarations:

```bash
npm install -D @types/pg
```

The package metadata for current `8.x` releases points to the `DefinitelyTyped` `types/pg` definitions and depends on `@types/node`, `pg-types`, and `pg-protocol`.

## Initialization

`@types/pg` does not define environment variables or credentials.

In practice, applications read their own environment variables and map them into `ClientConfig` or `PoolConfig` fields such as `connectionString`, `host`, `port`, `user`, `password`, `database`, `ssl`, `max`, `idleTimeoutMillis`, and `connectionTimeoutMillis`.

### Recommended `tsconfig.json`

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

If your project restricts ambient types with `compilerOptions.types`, keep `node` available:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Define connection settings in the environment

These names are application-defined. They map cleanly to `PoolConfig` or `ClientConfig` fields.

```bash
export DATABASE_URL=postgres://app_user:secret@127.0.0.1:5432/app_db
export PGPOOL_MAX=10
export PGPOOL_IDLE_TIMEOUT_MS=30000
export PGCONNECT_TIMEOUT_MS=5000
```

### Import `pg` and create a pool

```typescript
import * as pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new pg.Pool({
  connectionString,
  max: Number(process.env.PGPOOL_MAX ?? "10"),
  idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_TIMEOUT_MS ?? "30000"),
  connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT_MS ?? "5000"),
});
```

### Use an async password callback

`ClientConfig.password` and `PoolConfig.password` accept either a string or a function that returns a string or `Promise<string>`. This is the typed integration point to use when your app fetches short-lived database credentials from another system.

```typescript
import * as pg from "pg";

async function getDatabasePassword(): Promise<string> {
  const password = process.env.PGPASSWORD;

  if (!password) {
    throw new Error("PGPASSWORD is required");
  }

  return password;
}

export const pool = new pg.Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? "5432"),
  user: process.env.PGUSER ?? "app_user",
  database: process.env.PGDATABASE ?? "app_db",
  password: getDatabasePassword,
});
```

## Common Workflows

### Run a typed query

Use the query generic for the row shape, and optionally a second generic for the parameter tuple.

```typescript
import * as pg from "pg";

type UserRow = {
  id: string;
  email: string;
  role: "admin" | "member";
};

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getUser(userId: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow, [string]>(
    `
      select id, email, role
      from app_user
      where id = $1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}
```

`QueryResultRow` itself is an index signature (`[column: string]: any`), so the useful TypeScript pattern is to define explicit row types at the application boundary.

### Run a transaction with `PoolClient`

`pool.connect()` resolves to a `PoolClient`, which adds `release()` on top of the base client query API.

```typescript
import * as pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function transferCredits(
  fromUserId: string,
  toUserId: string,
  amount: number,
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "update account set credits = credits - $1 where user_id = $2",
      [amount, fromUserId],
    );

    await client.query(
      "update account set credits = credits + $1 where user_id = $2",
      [amount, toUserId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

### Return tuple rows with `rowMode: "array"`

When you pass a `QueryArrayConfig`, the result rows are typed as arrays instead of object maps.

```typescript
import * as pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getUserTuple(userId: string): Promise<[string, string] | null> {
  const result = await pool.query<[string, string], [string]>({
    text: "select id, email from app_user where id = $1",
    values: [userId],
    rowMode: "array",
  });

  return result.rows[0] ?? null;
}
```

This is useful when you want positional tuples instead of column-name objects.

### Listen for PostgreSQL notifications

The client emits a typed `notification` event with `processId`, `channel`, and optional `payload`.

```typescript
import * as pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

export async function startNotificationListener(): Promise<void> {
  await client.connect();

  client.on("notification", (message) => {
    console.log("channel", message.channel);
    console.log("payload", message.payload ?? "");
    console.log("process", message.processId);
  });

  await client.query("LISTEN app_events");
}
```

### Narrow database errors

`pg` re-exports `DatabaseError` from `pg-protocol`, so you can narrow error handling without reaching into internal modules.

```typescript
import * as pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function createUser(email: string): Promise<void> {
  try {
    await pool.query("insert into app_user (email) values ($1)", [email]);
  } catch (error) {
    if (error instanceof pg.DatabaseError) {
      console.error("postgres error", {
        code: error.code,
        detail: error.detail,
        table: error.table,
        constraint: error.constraint,
      });
    }

    throw error;
  }
}
```

## Common Pitfalls

- Install `pg` for runtime behavior; `@types/pg` only provides declarations.
- Import from `"pg"`, never from `"@types/pg"`.
- Treat query generics as compile-time help only; they do not validate selected columns or runtime values.
- Prefer explicit row interfaces over raw `QueryResultRow`, which allows any column name and any value type.
- If you set `compilerOptions.types`, keep `@types/node` active so the Node-based declarations resolve cleanly.
- Do not import `index.d.ts`, `index.d.mts`, or other declaration files directly; let TypeScript resolve the package through `"pg"`.
