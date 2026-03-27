---
name: superagent
description: "TypeScript declarations for SuperAgent, including installation with the runtime package, CommonJS-friendly imports, request/auth patterns, multipart uploads, and the JSON typing boundary."
metadata:
  languages: "typescript"
  versions: "8.1.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,superagent,http,api,requests,node,browser,npm,types,definitelytyped"
---

# superagent TypeScript Guide

`@types/superagent` provides the TypeScript declarations for the `superagent` runtime package. Install it when your project uses `superagent` from TypeScript, and import from `"superagent"`, not from `"@types/superagent"`.

This package only ships declaration files. It does not install the HTTP client runtime.

## Install

Install the runtime package and the declarations together:

```bash
npm install superagent
npm install --save-dev typescript @types/superagent
```

If your Node.js code uses `process.env`, `fs`, streams, or other built-in modules in the same codepath, add Node's declarations too:

```bash
npm install --save-dev @types/node
```

There are no package-specific environment variables. For application configuration, define your own API base URL and token:

```bash
export API_BASE_URL="https://api.example.com"
export API_TOKEN="replace-me"
```

## Choose An Import Style

The declarations target the `superagent` module itself. The configuration-independent TypeScript import style is:

```typescript
import request = require("superagent");
```

If you prefer default imports, enable `esModuleInterop` or `allowSyntheticDefaultImports` in `tsconfig.json` and then import `superagent` normally.

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

If your project uses `compilerOptions.types`, you usually only need `"node"` for Node.js APIs. You do not import or list `"@types/superagent"` directly in application code.

## Initialization And Auth

SuperAgent does not require a separate client constructor. In most TypeScript apps, keep configuration at the application boundary and build requests from environment-driven values.

```typescript
import request = require("superagent");

const apiBaseUrl = process.env.API_BASE_URL ?? "https://api.example.com";
const apiToken = process.env.API_TOKEN;

function apiUrl(path: string): string {
  return new URL(path, apiBaseUrl).toString();
}

export async function getCurrentUser() {
  if (!apiToken) {
    throw new Error("API_TOKEN is required");
  }

  const response = await request
    .get(apiUrl("/me"))
    .auth(apiToken, { type: "bearer" })
    .accept("json");

  return response.body;
}
```

For services that expect an explicit header instead of bearer auth, use `.set("Authorization", "Bearer ...")`.

## Common Workflows

### Send A JSON `GET` Request

Use `.query()` for URL parameters, `.set()` for headers, and `.accept("json")` when you expect JSON back.

```typescript
import request = require("superagent");

const apiBaseUrl = process.env.API_BASE_URL ?? "https://api.example.com";

async function listUsers() {
  const response = await request
    .get(new URL("/users", apiBaseUrl).toString())
    .query({ role: "admin", limit: 20 })
    .set("x-request-id", "req_123")
    .accept("json");

  return response.body;
}
```

### Post A JSON Body

Use `.send()` with a plain object for JSON request bodies.

```typescript
import request = require("superagent");

type CreateUserInput = {
  email: string;
  name: string;
};

async function createUser(input: CreateUserInput) {
  const response = await request
    .post("https://api.example.com/users")
    .send(input)
    .accept("json");

  return response.body;
}
```

### Upload Files With Multipart Form Data

For file uploads in Node.js, combine `.field()` and `.attach()`.

```typescript
import fs from "node:fs";
import request = require("superagent");

async function uploadAvatar(filePath: string) {
  const response = await request
    .post("https://api.example.com/uploads")
    .field("folder", "avatars")
    .attach("file", fs.createReadStream(filePath), "avatar.png")
    .accept("json");

  return response.body;
}
```

### Reuse Cookies With `request.agent()`

Use an agent when a workflow depends on cookies or other request state shared across multiple calls.

```typescript
import request = require("superagent");

const apiBaseUrl = process.env.API_BASE_URL ?? "https://api.example.com";

async function readProfileAfterLogin(email: string, password: string) {
  const agent = request.agent();

  await agent
    .post(new URL("/login", apiBaseUrl).toString())
    .send({ email, password });

  const response = await agent
    .get(new URL("/me", apiBaseUrl).toString())
    .accept("json");

  return response.body;
}
```

Create a fresh agent per login flow or per test when you need isolation.

### Accept Expected Non-2xx Responses

By default, SuperAgent treats non-2xx responses as errors. Use `.ok()` when your application expects statuses such as `404` or `409` in a normal control flow.

```typescript
import request = require("superagent");

async function findUser(userId: string) {
  const response = await request
    .get(`https://api.example.com/users/${userId}`)
    .ok((res) => res.status < 500)
    .accept("json");

  if (response.status === 404) {
    return null;
  }

  return response.body;
}
```

## Type The JSON Boundary Explicitly

`@types/superagent` describes the request and response APIs, but your application's JSON schema still needs its own types. Narrow `response.body` at the boundary where HTTP data enters your app.

```typescript
import request = require("superagent");

type User = {
  id: string;
  email: string;
  role: "admin" | "member";
};

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id: unknown }).id === "string" &&
    "email" in value &&
    typeof (value as { email: unknown }).email === "string" &&
    "role" in value &&
    ((value as { role: unknown }).role === "admin" ||
      (value as { role: unknown }).role === "member")
  );
}

async function getUser(userId: string): Promise<User> {
  const response = await request
    .get(`https://api.example.com/users/${userId}`)
    .accept("json");

  const body: unknown = response.body;

  if (!isUser(body)) {
    throw new Error("Unexpected response body");
  }

  return body;
}
```

This keeps transport concerns in SuperAgent and schema validation in your application code.

## Common Pitfalls

- Install both `superagent` and `@types/superagent`; the type package does not include runtime code.
- Import from `"superagent"`, not from `"@types/superagent"`.
- Prefer `import request = require("superagent")` unless your `tsconfig` enables interop for default imports.
- `response.body` is not a substitute for your application's own response types; narrow or validate it before use.
- Use `request.agent()` only when you need shared cookies or state across multiple requests.
- Use `.ok()` when non-2xx statuses belong in a normal code path instead of being treated as failures.

## Official Sources

- https://www.npmjs.com/package/@types/superagent
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/superagent
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/superagent/index.d.ts
- https://www.npmjs.com/package/superagent
- https://github.com/ladjs/superagent
- https://github.com/ladjs/superagent/blob/master/README.md
