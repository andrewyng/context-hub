---
name: axios
description: "TypeScript setup for Axios. `@types/axios@0.14.4` is a stub package, so install `axios` itself and use its bundled type definitions."
metadata:
  languages: "typescript"
  versions: "0.14.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,axios,http,client,api,types,definitelytyped,npm"
---

# Axios TypeScript Guide

## Golden Rule

`@types/axios@0.14.4` is a stub package.

The npm package page for `@types/axios` says it is a stub entry for `axios`, which provides its own type definitions. For application code, install `axios`, import from `"axios"`, and remove `@types/axios` if you added it directly.

## Install

Install the runtime package and your normal TypeScript toolchain:

```bash
npm install axios
npm install -D typescript
```

If your project uses Node.js APIs such as `process.env`, streams, or the built-in `http`/`https` modules elsewhere in the app, add `@types/node` too:

```bash
npm install -D @types/node
```

If your project already depends on the old stub package directly, remove it:

```bash
npm uninstall @types/axios
```

There are no package-specific environment variables. For app configuration, define your API base URL and any auth token in your own environment:

```bash
export API_BASE_URL="https://api.example.com"
export API_TOKEN="replace-me"
```

## TypeScript Setup

Import both runtime APIs and types from `axios` itself:

```typescript
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
```

If you use the common default import style, enable `esModuleInterop` or `allowSyntheticDefaultImports` in your TypeScript config:

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

If your project restricts ambient packages with `compilerOptions.types`, you do not need to list `axios` there. Its declarations come from the runtime package import, not from a global ambient package.

## Initialization

Create a reusable client with `axios.create()` and keep environment-driven configuration at the app boundary:

```typescript
import axios, { AxiosInstance } from "axios";

const apiBaseUrl = process.env.API_BASE_URL ?? "https://api.example.com";
const apiToken = process.env.API_TOKEN;

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  headers: apiToken
    ? {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      },
});
```

There is no separate authentication setup in `@types/axios`. Auth configuration is part of the normal Axios request config you pass to the runtime client.

## Common Workflows

### Send a typed `GET` request

Pass the expected response body type as the generic argument to `get<T>()`. The typed payload is then available on `response.data`.

```typescript
import { apiClient } from "./client";

type User = {
  id: string;
  email: string;
  role: "admin" | "member";
};

export async function getUser(userId: string): Promise<User> {
  const response = await apiClient.get<User>(`/users/${userId}`);
  return response.data;
}
```

Use this pattern at the HTTP boundary so the rest of your application works with plain domain objects instead of raw Axios response wrappers.

### Send a typed `POST` request

Keep request and response types separate when your write operation accepts one shape and returns another.

```typescript
import { apiClient } from "./client";

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
  const response = await apiClient.post<CreateUserResponse>("/users", input);
  return response.data;
}
```

The response generic controls the type of `response.data`. Your request body type still comes from the `input` variable you pass to `post()`.

### Share request config with `AxiosRequestConfig`

Type reusable config fragments as `AxiosRequestConfig` when you want compile-time checks for headers, query parameters, timeouts, or other request options.

```typescript
import { apiClient } from "./client";
import type { AxiosRequestConfig } from "axios";

type SearchUsersResponse = {
  items: Array<{
    id: string;
    email: string;
  }>;
};

const searchConfig: AxiosRequestConfig = {
  params: {
    limit: 25,
    active: true,
  },
  timeout: 5_000,
};

export async function searchUsers(): Promise<SearchUsersResponse> {
  const response = await apiClient.get<SearchUsersResponse>("/users", searchConfig);
  return response.data;
}
```

This is the practical type boundary when you build wrappers around Axios instead of inlining every config object at the call site.

### Narrow HTTP errors with `axios.isAxiosError`

Use `axios.isAxiosError()` in `catch` blocks so you can safely inspect `response`, `request`, and Axios-specific metadata.

```typescript
import axios from "axios";
import { apiClient } from "./client";

type ApiErrorBody = {
  message: string;
  code?: string;
};

export async function deleteUser(userId: string): Promise<void> {
  try {
    await apiClient.delete(`/users/${userId}`);
  } catch (error) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message ?? error.message;
      throw new Error(`Delete failed (${status ?? "network"}): ${message}`);
    }

    throw error;
  }
}
```

`error.response` can still be `undefined` for network failures or timeouts, so keep those checks optional even after narrowing.

## Important Pitfalls

- Do not import from `@types/axios`; import from `axios`.
- Do not keep only `@types/axios` in `devDependencies`. `axios` is the runtime package your app actually executes.
- If an older lockfile still includes `@types/axios`, remove the stub package before troubleshooting duplicate or stale type behavior.
- `AxiosResponse<T>` is the full HTTP response wrapper; `response.data` is the typed payload your application usually wants.
- `axios.isAxiosError()` narrows Axios errors, but transport failures can still leave `error.response` undefined.
- There are no package-specific environment variables or initialization steps beyond normal Axios client configuration.

## Version-Sensitive Notes

- This guide targets `@types/axios==0.14.4`.
- For this package version, the npm package entry is a stub package that points TypeScript users to `axios`.
- Install and import `axios` itself for both runtime behavior and TypeScript declarations.

## Official Sources

- https://www.npmjs.com/package/@types/axios
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/axios
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/axios/index.d.ts
- https://www.npmjs.com/package/axios
- https://axios-http.com/docs/intro
- https://axios-http.com/docs/instance
- https://axios-http.com/docs/handling_errors
