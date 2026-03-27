---
name: ws
description: "TypeScript declarations for the ws Node.js WebSocket runtime, including WebSocket, WebSocketServer, message payload types, and stream interop."
metadata:
  languages: "typescript"
  versions: "8.18.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,ws,websocket,node,types,definitelytyped"
---

# ws TypeScript Guide

## Golden Rule

Install `ws` for the runtime and `@types/ws` for compile-time declarations.

Import from `ws`, not from `@types/ws`:

```typescript
import WebSocket, { WebSocketServer, createWebSocketStream } from "ws";
```

`@types/ws` supplies the TypeScript declarations for the Node.js `ws` client and server APIs. It does not install the `ws` runtime, and it is not the browser `WebSocket` API.

## Install

Add the runtime package, TypeScript, and the declaration package:

```bash
npm install ws
npm install -D typescript @types/ws @types/node
```

If TypeScript is already configured in the project, add only the missing declarations:

```bash
npm install -D @types/ws @types/node
```

`@types/ws@8.18.1` depends on `@types/node` and declares `typeScriptVersion: "5.1"`, so use TypeScript 5.1 or newer.

## Initialization

There is no package-specific auth flow, API key, or client initialization for `@types/ws` itself.

The practical setup is:

- install the `ws` runtime package
- let TypeScript load `@types/ws`
- initialize `WebSocket` or `WebSocketServer` from `ws`

### Recommended `tsconfig.json`

For Node.js applications, use Node-style module settings so the ESM import examples line up with the package exports:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "types": ["node"],
    "skipLibCheck": false
  }
}
```

If you emit CommonJS or use older import rules, use the CommonJS-style TypeScript import instead:

```typescript
import WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
```

### Optional runtime environment variables

`@types/ws` has no package-specific environment variables.

The `ws` runtime documentation does define two optional environment variables for disabling native addons when those addons are installed in the environment:

```bash
WS_NO_BUFFER_UTIL=1
WS_NO_UTF_8_VALIDATE=1
```

`WS_NO_UTF_8_VALIDATE` is part of the legacy addon path that `ws` documents for older Node.js releases.

## Common Workflows

### Create a typed WebSocket client

Use the runtime client from `ws`, and type message payloads with `WebSocket.RawData`.

```typescript
import WebSocket from "ws";

const socketUrl = process.env.WS_URL ?? "ws://127.0.0.1:8080";

function rawDataToBuffer(data: WebSocket.RawData): Buffer {
  if (Array.isArray(data)) {
    return Buffer.concat(data);
  }

  return data instanceof ArrayBuffer ? Buffer.from(data) : data;
}

const ws = new WebSocket(socketUrl, {
  headers: process.env.WS_TOKEN
    ? { authorization: `Bearer ${process.env.WS_TOKEN}` }
    : undefined,
  perMessageDeflate: false,
});

ws.on("error", (error) => {
  console.error(error);
});

ws.on("open", () => {
  ws.send(JSON.stringify({ type: "ping" }));
});

ws.on("message", (data, isBinary) => {
  const body = rawDataToBuffer(data);
  console.log(isBinary ? body : body.toString("utf8"));
});
```

Application auth is server-specific. When a server expects headers during the HTTP upgrade request, pass them through `ClientOptions.headers`.

### Create a typed WebSocket server

`WebSocketServer` is the named server export from `ws`. Its options include values such as `port`, `server`, `path`, `noServer`, `perMessageDeflate`, and `maxPayload`.

```typescript
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

const server = createServer();

const wss = new WebSocketServer({
  server,
  path: "/socket",
  perMessageDeflate: false,
  maxPayload: 64 * 1024,
});

wss.on("connection", (ws, request) => {
  const ip = request.socket.remoteAddress;

  ws.on("error", console.error);

  ws.on("message", (data) => {
    const text = Array.isArray(data)
      ? Buffer.concat(data).toString("utf8")
      : data instanceof ArrayBuffer
        ? Buffer.from(data).toString("utf8")
        : data.toString("utf8");

    ws.send(JSON.stringify({ ip, echo: text }));
  });
});

server.listen(8080);
```

### Add custom socket state for heartbeat logic

The `ws` README heartbeat example stores `isAlive` directly on each socket. That property is not part of the published `WebSocket` type, so model it explicitly in your app.

```typescript
import { WebSocketServer, WebSocket } from "ws";

type HeartbeatSocket = WebSocket & {
  isAlive: boolean;
};

const wss = new WebSocketServer({ port: 8080 });

function heartbeat(this: HeartbeatSocket) {
  this.isAlive = true;
}

wss.on("connection", (socket) => {
  const ws = socket as HeartbeatSocket;
  ws.isAlive = true;

  ws.on("pong", heartbeat);
});

const interval = setInterval(() => {
  wss.clients.forEach((socket) => {
    const ws = socket as HeartbeatSocket;

    if (!ws.isAlive) {
      ws.terminate();
      return;
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30_000);

wss.on("close", () => {
  clearInterval(interval);
});
```

This pattern keeps the runtime example from `ws` and makes the extra property visible to TypeScript.

### Use the Node.js streams API

`@types/ws` also covers `createWebSocketStream()`, which returns a Node `Duplex`.

```typescript
import WebSocket, { createWebSocketStream } from "ws";

const ws = new WebSocket("ws://127.0.0.1:8080");
const duplex = createWebSocketStream(ws, { encoding: "utf8" });

duplex.on("error", console.error);
duplex.write("hello from a stream\n");
duplex.pipe(process.stdout);
```

## Important Pitfalls

- `@types/ws` only provides declarations. Install `ws` separately for runtime behavior.
- Import from `ws`, not from `@types/ws`.
- `ws` is a Node.js library. The upstream README explicitly says it does not work in the browser; browser clients should use the native `WebSocket` object or a wrapper designed for both environments.
- The event-emitter `"message"` callback uses `WebSocket.RawData`, so decode `Buffer`, `ArrayBuffer`, and `Buffer[]` values explicitly instead of assuming `string`.
- If you copy the upstream heartbeat example, add a local extended type or cast for `isAlive`; that property is not declared on `WebSocket`.
- If ESM default and named imports do not resolve in your compiler setup, switch to `module: "NodeNext"` and `moduleResolution: "NodeNext"`, or use `import WebSocket = require("ws")` in CommonJS-oriented code.

## Official Sources

- https://www.npmjs.com/package/@types/ws
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ws
- https://www.npmjs.com/package/ws
- https://github.com/websockets/ws
