---
name: libsql
description: "Turso libSQL client for JavaScript/TypeScript with embedded replicas, batch queries, transactions, and ORM integration"
metadata:
  languages: "javascript"
  versions: "0.17.0"
  revision: 1
  updated-on: "2026-03-11"
  source: community
  tags: "turso,libsql,sqlite,database,embedded-replicas,edge"
---

# Turso libSQL Client Coding Guidelines (JavaScript/TypeScript)

You are a Turso database expert. Help write code using the official `@libsql/client` SDK for Turso and libSQL databases.

## Golden Rule: Use @libsql/client

**Package:** `@libsql/client` (npm)

**Installation:**
```bash
npm install @libsql/client
```

**CRITICAL:** Do NOT use these packages:
- `better-sqlite3` — No remote database or embedded replica support
- `sql.js` — No Turso integration, no sync capabilities
- `libsql-client` — Deprecated, old API surface

**What is libSQL:** An open-source fork of SQLite that extends it with remote database access, embedded replicas, and edge-native features while maintaining full backward compatibility with SQLite.

## Client Initialization

### Remote Database

```typescript
import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://my-database-username.turso.tech",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

### Local SQLite File

```typescript
const client = createClient({
  url: "file:local.db",
});
```

### Embedded Replica (Local + Remote Sync)

```typescript
const client = createClient({
  url: "file:local-replica.db",
  syncUrl: "libsql://my-database-username.turso.tech",
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60, // Auto-sync every 60 seconds
});

// Manual sync on demand
await client.sync();
```

### In-Memory Database

```typescript
const client = createClient({
  url: ":memory:",
});
```

### Configuration Options

```typescript
const client = createClient({
  url: "libsql://...",
  authToken: "...",
  concurrency: 20,       // Max concurrent requests (default: 20)
  intMode: "number",     // How to return integers: "number" | "bigint" | "string"
  encryptionKey: "...",   // Encrypt local database file
});
```

## Execute Queries

### Basic Queries

```typescript
// Simple query
const result = await client.execute("SELECT * FROM users");

// Positional parameters
const result = await client.execute({
  sql: "SELECT * FROM users WHERE id = ? AND active = ?",
  args: [1, true],
});

// Named parameters
const result = await client.execute({
  sql: "SELECT * FROM users WHERE name = :name AND role = :role",
  args: { name: "Alice", role: "admin" },
});
```

### Result Shape

```typescript
const result = await client.execute("INSERT INTO users (name, email) VALUES (?, ?)", ["Alice", "alice@example.com"]);

console.log(result.columns);         // ["id", "name", "email"]
console.log(result.rows);            // Array of row objects
console.log(result.rowsAffected);    // Number of rows changed (INSERT/UPDATE/DELETE)
console.log(result.lastInsertRowid); // bigint — last auto-increment ID

// Row access
const firstRow = result.rows[0];
console.log(firstRow[0]);            // By index
console.log(firstRow.name);          // By column name
```

### Write Operations

```typescript
// Insert
const { lastInsertRowid } = await client.execute({
  sql: "INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)",
  args: ["Hello World", "My first post", 1],
});

// Update
const { rowsAffected } = await client.execute({
  sql: "UPDATE posts SET title = ? WHERE id = ?",
  args: ["Updated Title", lastInsertRowid],
});

// Delete
await client.execute({
  sql: "DELETE FROM posts WHERE id = ?",
  args: [postId],
});
```

## Batch Operations

Batch executes multiple statements as an implicit transaction (all-or-nothing):

```typescript
const results = await client.batch(
  [
    {
      sql: "INSERT INTO users (name, email) VALUES (?, ?)",
      args: ["Alice", "alice@example.com"],
    },
    {
      sql: "INSERT INTO users (name, email) VALUES (?, ?)",
      args: ["Bob", "bob@example.com"],
    },
    {
      sql: "SELECT COUNT(*) as count FROM users",
      args: [],
    },
  ],
  "write"  // Transaction mode: "write" | "read" | "deferred"
);

// results is an array of ResultSet objects
const count = results[2].rows[0].count;
```

**Transaction modes:**
- `"write"` — Acquires a write lock immediately. Use for INSERT/UPDATE/DELETE.
- `"read"` — Read-only, concurrent safe. Use for SELECT-only batches.
- `"deferred"` — Acquires lock lazily on first write. Default if omitted.

**Performance:** Batching 1000 inserts completes in ~1.7s vs ~5.3s for sequential `execute()` calls.

## Interactive Transactions

Use when you need application logic between queries:

```typescript
const tx = await client.transaction("write");

try {
  const { rows } = await tx.execute("SELECT balance FROM accounts WHERE id = ?", [fromId]);
  const balance = rows[0].balance as number;

  if (balance < amount) {
    await tx.rollback();
    throw new Error("Insufficient funds");
  }

  await tx.execute({
    sql: "UPDATE accounts SET balance = balance - ? WHERE id = ?",
    args: [amount, fromId],
  });
  await tx.execute({
    sql: "UPDATE accounts SET balance = balance + ? WHERE id = ?",
    args: [amount, toId],
  });

  await tx.commit();
} catch (err) {
  await tx.rollback();
  throw err;
} finally {
  tx.close();
}
```

**IMPORTANT:** Always call `tx.close()` in a `finally` block to release the connection. Prefer `batch()` over `transaction()` when you don't need interleaved application logic — it has lower latency.

## Schema Management

```typescript
// Create table
await client.execute(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    author_id INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  )
`);

// Add index
await client.execute("CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)");

// Migrations via batch (atomic)
await client.batch([
  { sql: "ALTER TABLE posts ADD COLUMN slug TEXT", args: [] },
  { sql: "CREATE UNIQUE INDEX idx_posts_slug ON posts(slug)", args: [] },
], "write");
```

## Embedded Replicas

Embedded replicas store a local SQLite copy that syncs with the remote Turso database, providing zero-latency reads.

### Architecture

- **Reads:** Served from the local SQLite file (microsecond latency)
- **Writes:** Sent to the remote primary database
- **Sync:** Periodic or manual — pulls changes from remote to local

```typescript
const client = createClient({
  url: "file:./data/replica.db",
  syncUrl: "libsql://my-db-username.turso.tech",
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60, // Auto-sync every 60 seconds
});

// Initial sync on startup
await client.sync();

// Reads are instant (local file)
const users = await client.execute("SELECT * FROM users");

// Writes go to remote primary
await client.execute({
  sql: "INSERT INTO users (name) VALUES (?)",
  args: ["Alice"],
});

// Sync to pull latest changes
const syncResult = await client.sync();
```

**Use cases:** VPS/VM deployments, containerized apps, offline-capable applications, read-heavy workloads.

## ORM Integration

### Drizzle ORM

```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

// Schema
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").unique(),
});

// Queries
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.id, 1));
await db.insert(users).values({ name: "Alice", email: "alice@example.com" });
```

### Prisma

```bash
npm install @prisma/adapter-libsql @libsql/client
```

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const prisma = new PrismaClient({ adapter });

const users = await prisma.user.findMany();
```

## Error Handling

```typescript
import { LibsqlError } from "@libsql/client";

try {
  await client.execute({
    sql: "INSERT INTO users (email) VALUES (?)",
    args: ["duplicate@example.com"],
  });
} catch (err) {
  if (err instanceof LibsqlError) {
    switch (err.code) {
      case "SQLITE_CONSTRAINT":
        console.error("Constraint violation:", err.message);
        break;
      case "HRANA_WEBSOCKET_ERROR":
        console.error("Connection error — retrying...");
        break;
      case "URL_INVALID":
        console.error("Invalid database URL");
        break;
      case "AUTH_ERROR":
        console.error("Invalid or expired auth token");
        break;
      default:
        console.error("Database error:", err.code, err.message);
    }
  }
  throw err;
}
```

**Retry pattern for transient errors:**

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof LibsqlError && err.code === "HRANA_WEBSOCKET_ERROR" && attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}
```

## TypeScript Usage

```typescript
// Type-safe row results
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const result = await client.execute("SELECT * FROM users WHERE id = ?", [1]);
const user = result.rows[0] as unknown as User;
```

**Column type mapping:**

| SQLite Type | JavaScript Type | Notes |
|-------------|----------------|-------|
| INTEGER | `number` or `bigint` | Controlled by `intMode` option |
| REAL | `number` | |
| TEXT | `string` | |
| BLOB | `ArrayBuffer` | |
| NULL | `null` | |

## Useful Links

- Turso documentation: https://docs.turso.tech/
- @libsql/client on npm: https://www.npmjs.com/package/@libsql/client
- libSQL GitHub: https://github.com/tursodatabase/libsql
- Turso CLI reference: https://docs.turso.tech/cli/introduction
- Embedded replicas guide: https://docs.turso.tech/features/embedded-replicas/introduction
- Drizzle + Turso: https://orm.drizzle.team/docs/get-started/turso-existing
- Prisma + Turso: https://docs.turso.tech/sdk/ts/orm/prisma
