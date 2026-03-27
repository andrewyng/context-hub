---
name: socket.io
description: "TypeScript usage for Socket.IO. For application code, install and import `socket.io`; `@types/socket.io@3.0.2` is the package entry tied to this guide."
metadata:
  languages: "typescript"
  versions: "3.0.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,socket.io,websocket,realtime,node,events,types"
---

# Socket.IO TypeScript Guide

## Golden Rule

For TypeScript application code, install and import `socket.io`.

`@types/socket.io` is not a runtime package. Your server imports `Server` and related types from `"socket.io"`, while TypeScript reads the declarations that the runtime package publishes.

If an older project still lists `@types/socket.io` directly, treat it as packaging history rather than the place your code should import from.

## Install

Install the Socket.IO server package plus the normal Node.js TypeScript toolchain:

```bash
npm install socket.io
npm install -D typescript @types/node
```

If you also keep a Node-based client, tests, or integration scripts in the same repo, add the official client package separately:

```bash
npm install socket.io-client
```

If your project already added `@types/socket.io` directly, remove it before troubleshooting duplicate or stale type behavior:

```bash
npm uninstall @types/socket.io
```

There are no package-level credentials. In practice, Socket.IO auth is application-defined and usually sent as handshake `auth` data from the client.

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node"]
  }
}
```

If you use `compilerOptions.types`, include `node` there. Socket.IO's own types are loaded from the normal `import "socket.io"` boundary, not from a separate ambient package name.

## Initialize a Typed Server

This is the smallest practical setup for a typed Socket.IO server.

Use `PORT` for the HTTP listener and `CORS_ORIGIN` for browser clients during development:

```bash
export PORT=3000
export CORS_ORIGIN=http://localhost:5173
```

```ts
import { createServer } from "node:http";
import { Server } from "socket.io";

interface ClientToServerEvents {
  "room:join": (roomId: string, ack: (response: { joined: boolean }) => void) => void;
  "chat:send": (
    payload: { roomId: string; body: string },
    ack: (response: { ok: true }) => void,
  ) => void;
}

interface ServerToClientEvents {
  "room:joined": (roomId: string) => void;
  "chat:message": (payload: { roomId: string; body: string; from: string }) => void;
}

const port = Number(process.env.PORT ?? "3000");
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const httpServer = createServer();

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (typeof token !== "string" || token.length === 0) {
    return next(new Error("unauthorized"));
  }

  next();
});

io.on("connection", (socket) => {
  socket.on("room:join", async (roomId, ack) => {
    await socket.join(roomId);
    socket.emit("room:joined", roomId);
    ack({ joined: true });
  });

  socket.on("chat:send", async ({ roomId, body }, ack) => {
    const from = String(socket.handshake.auth.userId ?? "anonymous");

    await socket.join(roomId);

    io.to(roomId).emit("chat:message", {
      roomId,
      body,
      from,
    });

    ack({ ok: true });
  });
});

httpServer.listen(port, () => {
  console.log(`Socket.IO listening on http://localhost:${port}`);
});
```

The important type boundary is the `Server<ClientToServerEvents, ServerToClientEvents>` generic. Once you define the event maps there, `socket.on(...)`, `socket.emit(...)`, acknowledgement callbacks, and room broadcasts stay checked against those declarations.

## Common Workflows

### Define event contracts once and reuse them

Keep shared event contracts in a file that both server and client can import.

```ts
export interface ClientToServerEvents {
  "presence:ping": (ack: (response: { ok: true; at: string }) => void) => void;
}

export interface ServerToClientEvents {
  "presence:pong": (payload: { at: string }) => void;
}
```

Use those interfaces when you create the server:

```ts
import { createServer } from "node:http";
import { Server } from "socket.io";

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./socket-contracts";

const io = new Server<ClientToServerEvents, ServerToClientEvents>(createServer());

io.on("connection", (socket) => {
  socket.on("presence:ping", (ack) => {
    const at = new Date().toISOString();

    socket.emit("presence:pong", { at });
    ack({ ok: true, at });
  });
});
```

This is the main TypeScript workflow that matters in practice: define the event names and payload shapes once, then let the compiler enforce them across handlers and emitters.

### Use handshake auth, but narrow the values yourself

Socket.IO exposes client-provided auth data on `socket.handshake.auth`.

```ts
io.use((socket, next) => {
  const projectId = socket.handshake.auth.projectId;

  if (typeof projectId !== "string") {
    return next(new Error("projectId is required"));
  }

  next();
});
```

The auth object is key-value data, not a strongly typed app-specific schema. Check types at runtime before using the values in authorization or room selection logic.

### Use namespaces when parts of the app have separate concerns

Namespaces let you split event handlers, middleware, and rooms over one shared connection.

```ts
import { createServer } from "node:http";
import { Server } from "socket.io";

interface AdminClientToServerEvents {
  "audit:request": () => void;
}

interface AdminServerToClientEvents {
  "audit:ready": (payload: { generatedAt: string }) => void;
}

const io = new Server(createServer());
const admin = io.of<AdminClientToServerEvents, AdminServerToClientEvents>("/admin");

admin.use((socket, next) => {
  if (socket.handshake.auth.role !== "admin") {
    return next(new Error("forbidden"));
  }

  next();
});

admin.on("connection", (socket) => {
  socket.on("audit:request", () => {
    socket.emit("audit:ready", {
      generatedAt: new Date().toISOString(),
    });
  });
});
```

Rooms are namespace-scoped. A room named `alerts` in `/admin` is separate from a room named `alerts` in `/`.

### Connect a typed client

If your TypeScript repo also contains a Node client, tests, or a shared integration example, type the client socket against the same event maps.

Use `SOCKET_URL` and `SOCKET_TOKEN` for local development:

```bash
export SOCKET_URL=http://localhost:3000
export SOCKET_TOKEN=dev-token
```

```ts
import { io, type Socket } from "socket.io-client";

interface ClientToServerEvents {
  "room:join": (roomId: string, ack: (response: { joined: boolean }) => void) => void;
}

interface ServerToClientEvents {
  "room:joined": (roomId: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.SOCKET_URL ?? "http://localhost:3000",
  {
    auth: {
      token: process.env.SOCKET_TOKEN ?? "",
    },
  },
);

socket.on("room:joined", (roomId) => {
  console.log(`joined ${roomId}`);
});

socket.emit("room:join", "room-1", ({ joined }) => {
  console.log({ joined });
});
```

The client generic order is the reverse of the server's mental model: the client listens for server-to-client events and emits client-to-server events.

## Important Pitfalls

- Install `socket.io` itself. `@types/socket.io` is not the runtime your application executes.
- Import from `"socket.io"` or `"socket.io-client"`, never from `"@types/socket.io"`.
- If you set `compilerOptions.types`, include `node`; do not expect bundled package types to appear there by package name.
- `socket.handshake.auth` is flexible key-value data. Narrow or validate values before using them.
- Rooms belong to a namespace. Reusing the same room name in two namespaces does not create one shared audience.
- Keep your server and client packages on compatible Socket.IO major versions when you wire them together.

## Version-Sensitive Notes

- This guide targets the `@types/socket.io` package entry at version `3.0.2`.
- For TypeScript application code, the practical package to install and import is `socket.io`.
- If an older dependency tree still includes `@types/socket.io`, prefer the runtime package's own declarations when updating or troubleshooting TypeScript behavior.

## Official Sources

- https://www.npmjs.com/package/@types/socket.io
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/socket.io
- https://www.npmjs.com/package/socket.io
- https://socket.io/docs/v4/server-initialization/
- https://socket.io/docs/v4/typescript/
- https://socket.io/docs/v4/middlewares/
- https://socket.io/docs/v4/namespaces/
- https://socket.io/docs/v4/rooms/
