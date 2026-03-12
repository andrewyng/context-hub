---
name: workers-runtime
description: "Cloudflare Workers runtime for building edge functions with D1 databases, R2 storage, KV key-value, Durable Objects, Queues, Workers AI, and Vectorize bindings"
metadata:
  languages: "javascript"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-11"
  source: community
  tags: "cloudflare,workers,edge,d1,r2,kv,durable-objects,queues,ai,vectorize,wrangler"
---

# Cloudflare Workers Runtime Coding Guidelines (JavaScript/TypeScript)

You are a Cloudflare Workers expert. Help write code that runs on the Cloudflare Workers edge runtime using Wrangler and the Workers Runtime APIs.

## Golden Rule: Use the Workers Runtime APIs with Wrangler

**Tooling:** `wrangler` CLI (npm) + `@cloudflare/workers-types` (TypeScript types)

**Installation:**
```bash
npm create cloudflare@latest        # New project scaffold
npm install -D wrangler              # Per-project install
npm install -D @cloudflare/workers-types  # TypeScript types
```

**CRITICAL:** Do NOT confuse these two packages:
- `wrangler` + Workers Runtime APIs = code that **runs on** the Cloudflare edge (this guide)
- `cloudflare` npm package = REST API SDK for **managing** Cloudflare resources (zones, DNS, etc.) — a different surface entirely

**IMPORTANT:** Do NOT use the deprecated `@cloudflare/wrangler` (v1 legacy) or third-party wrappers.

## Worker Entry Point

Workers use ES module syntax with a default export containing handler functions:

```typescript
export interface Env {
  MY_KV: KVNamespace;
  MY_DB: D1Database;
  MY_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/data") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
```

**Key concepts:**
- `request` — Standard Web API `Request` object
- `env` — Contains all bindings (D1, R2, KV, Durable Objects, Queues, AI, etc.)
- `ctx.waitUntil(promise)` — Keep the Worker alive for background work after sending a response
- `ctx.passThroughOnException()` — Fall through to origin on unhandled errors

## Configuration (wrangler.toml)

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[vars]
API_URL = "https://api.example.com"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "my-bucket"

[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[queues.producers]]
binding = "MY_QUEUE"
queue = "my-queue"

[[queues.consumers]]
queue = "my-queue"

[durable_objects]
bindings = [{ name = "COUNTER", class_name = "Counter" }]

[[migrations]]
tag = "v1"
new_classes = ["Counter"]
```

**Generate types from config:** `wrangler types` auto-generates the `Env` interface from your `wrangler.toml`.

## D1 Database Binding

D1 is Cloudflare's serverless SQLite database.

### Prepared Statements

```typescript
// Single row
const user = await env.DB
  .prepare("SELECT * FROM users WHERE id = ?")
  .bind(userId)
  .first();

// All rows
const { results } = await env.DB
  .prepare("SELECT * FROM users WHERE active = ?")
  .bind(1)
  .all();

// Write operations
const { meta } = await env.DB
  .prepare("INSERT INTO users (name, email) VALUES (?, ?)")
  .bind("Alice", "alice@example.com")
  .run();
console.log(meta.last_row_id, meta.changes);
```

### Batch Operations

Batch executes multiple statements in a single transaction:

```typescript
const results = await env.DB.batch([
  env.DB.prepare("INSERT INTO users (name) VALUES (?)").bind("Alice"),
  env.DB.prepare("INSERT INTO users (name) VALUES (?)").bind("Bob"),
  env.DB.prepare("SELECT COUNT(*) as count FROM users"),
]);
const count = results[2].results[0].count;
```

### Raw Queries

```typescript
// Execute raw SQL (no parameter binding — use for DDL only)
const result = await env.DB.exec(
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)"
);
```

**Result shape:** `{ results: Row[], success: boolean, meta: { changes, last_row_id, duration } }`

## R2 Object Storage Binding

R2 is S3-compatible object storage with zero egress fees.

### Basic Operations

```typescript
// Upload
await env.BUCKET.put("uploads/image.png", imageData, {
  httpMetadata: { contentType: "image/png" },
  customMetadata: { uploadedBy: "user-123" },
});

// Download
const object = await env.BUCKET.get("uploads/image.png");
if (object === null) {
  return new Response("Not Found", { status: 404 });
}
return new Response(object.body, {
  headers: { "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream" },
});

// Check existence (metadata only)
const head = await env.BUCKET.head("uploads/image.png");

// Delete
await env.BUCKET.delete("uploads/image.png");
// Bulk delete
await env.BUCKET.delete(["file1.txt", "file2.txt", "file3.txt"]);
```

### Listing Objects

```typescript
const listed = await env.BUCKET.list({ prefix: "uploads/", limit: 100 });
for (const obj of listed.objects) {
  console.log(obj.key, obj.size, obj.uploaded);
}

// Pagination
if (listed.truncated) {
  const next = await env.BUCKET.list({ prefix: "uploads/", cursor: listed.cursor });
}
```

### S3-Compatible Access (Outside Workers)

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

await s3.send(new PutObjectCommand({ Bucket: "my-bucket", Key: "file.txt", Body: "hello" }));
```

## KV Key-Value Store Binding

KV is a globally distributed, eventually-consistent key-value store.

```typescript
// Write
await env.KV.put("session:abc123", JSON.stringify({ userId: 1, role: "admin" }));
await env.KV.put("cache:page", htmlContent, { expirationTtl: 3600 }); // 1 hour TTL
await env.KV.put("user:1", "data", { metadata: { createdAt: Date.now() } });

// Read
const value = await env.KV.get("session:abc123");
const json = await env.KV.get("config:settings", { type: "json" });
const { value: val, metadata } = await env.KV.getWithMetadata("user:1");

// Delete
await env.KV.delete("session:abc123");

// List keys
const keys = await env.KV.list({ prefix: "session:", limit: 50 });
for (const key of keys.keys) {
  console.log(key.name, key.expiration, key.metadata);
}
```

**IMPORTANT:** KV is eventually consistent. Writes may take up to 60 seconds to propagate globally. Use D1 or Durable Objects for strong consistency.

## Durable Objects Binding

Durable Objects provide strongly-consistent, single-instance coordination.

### Defining a Durable Object

```typescript
import { DurableObject } from "cloudflare:workers";

export class Counter extends DurableObject {
  async increment(): Promise<number> {
    let count = (await this.ctx.storage.get<number>("count")) ?? 0;
    count++;
    await this.ctx.storage.put("count", count);
    return count;
  }

  async getCount(): Promise<number> {
    return (await this.ctx.storage.get<number>("count")) ?? 0;
  }
}
```

### Accessing from a Worker

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.COUNTER.idFromName("global");
    const stub = env.COUNTER.get(id);

    const count = await stub.increment(); // RPC call
    return new Response(`Count: ${count}`);
  },
};
```

### Alarms (Scheduled Background Work)

```typescript
export class Scheduler extends DurableObject {
  async schedule(delayMs: number): Promise<void> {
    await this.ctx.storage.setAlarm(Date.now() + delayMs);
  }

  async alarm(): Promise<void> {
    // Runs at the scheduled time
    await this.processScheduledWork();
  }
}
```

### WebSocket Hibernation

```typescript
export class ChatRoom extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string): Promise<void> {
    // Broadcast to all connected clients
    for (const client of this.ctx.getWebSockets()) {
      client.send(message);
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    ws.close();
  }
}
```

## Queues Binding

Queues provide guaranteed at-least-once message delivery.

### Producer

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Single message
    await env.MY_QUEUE.send({ userId: 123, action: "signup" });

    // Batch send
    await env.MY_QUEUE.sendBatch([
      { body: { event: "page_view", page: "/home" } },
      { body: { event: "page_view", page: "/about" } },
    ]);

    return new Response("Queued");
  },
};
```

### Consumer

```typescript
export default {
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      try {
        await processEvent(msg.body);
        msg.ack();
      } catch (err) {
        msg.retry(); // Requeue for retry
      }
    }
  },
};
```

## Workers AI Binding

Workers AI runs AI models on Cloudflare's GPU network.

```typescript
// Text generation
const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain edge computing in one sentence." },
  ],
});
console.log(response.response);

// Text embeddings
const embeddings = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
  text: ["Document about edge computing", "Document about databases"],
});
console.log(embeddings.data); // Array of float arrays

// Image classification
const result = await env.AI.run("@cf/microsoft/resnet-50", {
  image: await request.arrayBuffer(),
});
```

## Vectorize Binding

Vectorize is Cloudflare's vector database for similarity search.

```typescript
// Insert vectors
await env.VECTORIZE_INDEX.insert([
  { id: "doc-1", values: embeddingArray, metadata: { title: "Edge Computing" } },
  { id: "doc-2", values: embeddingArray2, metadata: { title: "Databases" } },
]);

// Query (semantic search)
const results = await env.VECTORIZE_INDEX.query(queryVector, {
  topK: 10,
  returnValues: false,
  returnMetadata: "all",
  filter: { category: "tech" },
});
for (const match of results.matches) {
  console.log(match.id, match.score, match.metadata);
}

// Upsert (insert or update)
await env.VECTORIZE_INDEX.upsert([{ id: "doc-1", values: updatedEmbedding }]);

// Delete
await env.VECTORIZE_INDEX.deleteByIds(["doc-1", "doc-2"]);
```

## Error Handling

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const data = await env.DB.prepare("SELECT * FROM users").all();
      return Response.json(data.results);
    } catch (err) {
      // D1 errors include SQL constraint violations, type errors
      console.error("D1 error:", err);
      return new Response("Database error", { status: 500 });
    }
  },
};
```

**Common pitfalls:**

- **Error 1101 (floating promises):** Always `await` or use `ctx.waitUntil()` for async operations
- **CPU time limits:** Free plan = 10ms, Paid = 30s. Offload heavy work to Queues or Durable Objects
- **Worker size limit:** 10MB compressed after bundling (includes dependencies)
- **Subrequest limit:** 50 `fetch()` calls per invocation (1000 on paid plans)

```typescript
// BAD: floating promise causes Error 1101
fetch("https://analytics.example.com/track");

// GOOD: use ctx.waitUntil for fire-and-forget
ctx.waitUntil(fetch("https://analytics.example.com/track"));
```

## Testing

### Local Development

```bash
wrangler dev              # Start local dev server with Miniflare
wrangler dev --remote     # Run against real Cloudflare APIs
```

### Vitest Integration

```typescript
// vitest.config.ts
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: { poolOptions: { workers: { wrangler: { configPath: "./wrangler.toml" } } } },
});
```

```typescript
// test/index.test.ts
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import worker from "../src/index";

it("returns 200", async () => {
  const request = new Request("http://localhost/api/data");
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  expect(response.status).toBe(200);
});
```

## Useful Links

- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- Wrangler CLI reference: https://developers.cloudflare.com/workers/wrangler/
- D1 documentation: https://developers.cloudflare.com/d1/
- R2 documentation: https://developers.cloudflare.com/r2/
- KV documentation: https://developers.cloudflare.com/kv/
- Durable Objects: https://developers.cloudflare.com/durable-objects/
- Workers AI models: https://developers.cloudflare.com/workers-ai/models/
- Vectorize: https://developers.cloudflare.com/vectorize/
- Workers examples: https://developers.cloudflare.com/workers/examples/
