---
name: got
description: "TypeScript declarations for `got` 9.x, including CommonJS imports, typed JSON responses, reusable instances, and HTTP error handling."
metadata:
  languages: "typescript"
  versions: "9.6.12"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,got,http,request,types,definitelytyped"
---

# got TypeScript Guide

## Golden Rule

Install `got` for runtime behavior and `@types/got` for compile-time declarations.

`@types/got@9.6.12` is the DefinitelyTyped declaration package for the `got` 9.x runtime module. Your application imports and executes `got`; the `@types` package supplies the TypeScript surface for the request function, HTTP method helpers, reusable instances from `got.extend()`, `Response<T>`, and `got.HTTPError`.

Import from `"got"`, never from `"@types/got"`.

## Install

Install the runtime package, TypeScript, and Node.js types:

```bash
npm install got@^9
npm install -D typescript @types/got@9.6.12 @types/node
```

There are no package-specific environment variables, credentials, or auth steps for `@types/got` itself.

### Recommended `tsconfig.json`

The published declarations use CommonJS export syntax, so the most convenient setup is enabling interop:

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

If you prefer not to enable `esModuleInterop`, use the `import = require()` form shown below.

## Initialization

The important setup points are your import style and how you share a configured `got` instance.

### Import `got`

The most portable import form is:

```typescript
import got = require("got");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import got from "got";
```

### Create a reusable client

`got` does not have a separate authentication client. Read your own application settings from environment variables and pass them through request options.

```bash
export API_BASE_URL=https://api.example.com
export API_TOKEN=your-token
```

```typescript
import got = require("got");

const apiBaseUrl = process.env.API_BASE_URL;
const apiToken = process.env.API_TOKEN;

if (!apiBaseUrl) {
  throw new Error("API_BASE_URL is required");
}

if (!apiToken) {
  throw new Error("API_TOKEN is required");
}

export const api = got.extend({
  headers: {
    authorization: `Bearer ${apiToken}`,
    accept: "application/json",
    "user-agent": "my-app/1.0",
  },
  timeout: 5_000,
});

export { apiBaseUrl };
```

`API_BASE_URL` and `API_TOKEN` are ordinary application settings, not something required by the type package.

## Common Workflows

### Make a typed JSON `GET` request

Pass the expected response body type as the generic argument and enable JSON parsing with `json: true`.

```typescript
import got = require("got");
import { api, apiBaseUrl } from "./client";

type User = {
  id: string;
  email: string;
  role: "admin" | "member";
};

export async function getUser(userId: string): Promise<User> {
  const response: got.Response<User> = await api.get<User>(`${apiBaseUrl}/users/${userId}`, {
    json: true,
  });

  return response.body;
}
```

With `json: true`, the response body is parsed as JSON. If you omit that option, `response.body` is typed as a string.

### Send query parameters in a typed request

Use the `query` option when the upstream API expects URL query parameters.

```typescript
import { api, apiBaseUrl } from "./client";

type SearchUsersResponse = {
  items: Array<{
    id: string;
    email: string;
  }>;
  nextCursor?: string;
};

export async function searchUsers(role: "admin" | "member"): Promise<SearchUsersResponse> {
  const response = await api.get<SearchUsersResponse>(`${apiBaseUrl}/users`, {
    json: true,
    query: {
      limit: 25,
      role,
    },
  });

  return response.body;
}
```

This keeps the HTTP boundary typed while still using normal query-string parameters.

### Post JSON and type the response body

TypeScript can describe both the request input you send and the response shape you expect back.

```typescript
import { api, apiBaseUrl } from "./client";

type CreateUserInput = {
  email: string;
  role: "admin" | "member";
};

type CreateUserResponse = {
  id: string;
  email: string;
  role: "admin" | "member";
  createdAt: string;
};

export async function createUser(input: CreateUserInput): Promise<CreateUserResponse> {
  const response = await api.post<CreateUserResponse>(`${apiBaseUrl}/users`, {
    body: JSON.stringify(input),
    headers: {
      "content-type": "application/json",
    },
    json: true,
  });

  return response.body;
}
```

The generic argument controls the response type. Your request body type still comes from the `input` variable you pass into the function.

### Narrow `HTTPError` in a `catch` block

`got` throws `got.HTTPError` for HTTP status failures by default, so use that class when you need status-aware error handling.

```typescript
import got = require("got");
import { api, apiBaseUrl } from "./client";

export async function deleteUser(userId: string): Promise<void> {
  try {
    await api.delete(`${apiBaseUrl}/users/${userId}`);
  } catch (error) {
    if (error instanceof got.HTTPError) {
      throw new Error(
        `Delete failed (${error.response.statusCode}): ${error.response.body}`
      );
    }

    throw error;
  }
}
```

If your application wants to inspect non-2xx responses without throwing, set `throwHttpErrors: false` on that request and branch on `response.statusCode` yourself.

## Important Pitfalls

- `@types/got` is declarations only. Install `got` itself for runtime behavior.
- Import from `got`, not from `@types/got`.
- These declarations target the `got` 9.x API surface. Do not assume they match newer `got` majors.
- Without `json: true`, `response.body` is a string.
- `got` throws `got.HTTPError` on HTTP status failures by default. Use `throwHttpErrors: false` only when your code is prepared to handle status codes manually.
- Response generics help at compile time, but they do not validate JSON payloads at runtime.

## Version-Sensitive Notes

- This guide targets `@types/got==9.6.12`.
- The package is maintained in DefinitelyTyped for the `got` runtime module.
- The published declarations use CommonJS export syntax (`export = got`), which is why import style depends on your TypeScript interop settings.
- Current `got` releases publish their own type definitions, so `@types/got@9.6.12` is the guide to follow when your project is intentionally using the older 9.x runtime line.

## Official Sources

- https://www.npmjs.com/package/@types/got
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/got
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/got/index.d.ts
- https://www.npmjs.com/package/got
