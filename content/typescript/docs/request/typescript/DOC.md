---
name: request
description: "TypeScript guide for the `request` HTTP client declarations, including installation, CommonJS imports, typed callbacks, shared defaults, and JSON response handling."
metadata:
  languages: "typescript"
  versions: "2.48.13"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,request,http,nodejs,types,definitelytyped"
---

# request TypeScript Guide

## Golden Rule

Install `request` for runtime behavior and `@types/request` for TypeScript declarations.

`@types/request` only provides `.d.ts` files for the `request` module. Your code still imports and executes `request` itself.

## Install

Install the runtime package first, then the TypeScript declarations your Node.js app needs:

```bash
npm install request
npm install -D typescript @types/node @types/request
```

`request` does not require package-level initialization, credentials, or environment variables. Authentication is configured per request or through a shared `request.defaults(...)` wrapper.

## Initialize In TypeScript

`@types/request` uses CommonJS-style exports, so the most portable import form is:

```typescript
import request = require("request");
```

If your project enables `esModuleInterop` or `allowSyntheticDefaultImports`, a default import also works:

```typescript
import request from "request";
```

If you restrict loaded declaration packages with `compilerOptions.types`, keep the Node and request types available to the project:

```json
{
  "compilerOptions": {
    "strict": true,
    "module": "commonjs",
    "esModuleInterop": true,
    "types": ["node", "request"]
  }
}
```

## Common Workflows

### Fetch JSON And Narrow The Response Body

`json: true` tells `request` to parse JSON responses, but it does not prove that the remote API returned the shape your app expects. Validate or narrow the result before using it.

```typescript
import request = require("request");

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.userId === "number" &&
    typeof record.id === "number" &&
    typeof record.title === "string" &&
    typeof record.completed === "boolean"
  );
}

request.get(
  {
    url: "https://jsonplaceholder.typicode.com/todos/1",
    json: true,
    timeout: 10_000,
    headers: {
      "user-agent": "my-app/1.0",
    },
  },
  (error, response, body) => {
    if (error) {
      throw error;
    }

    if (response.statusCode !== 200) {
      throw new Error(`Unexpected status: ${response.statusCode}`);
    }

    if (!isTodo(body)) {
      throw new Error("Response body did not match Todo");
    }

    console.log(body.title);
  }
);
```

### Reuse Auth And Base Settings With `request.defaults`

For applications that talk to the same API repeatedly, create a preconfigured requester instead of copying headers and timeouts into every call.

```typescript
import request = require("request");

const { API_BASE_URL, API_TOKEN } = process.env;

if (!API_BASE_URL || !API_TOKEN) {
  throw new Error("Set API_BASE_URL and API_TOKEN before starting the app");
}

const api = request.defaults({
  baseUrl: API_BASE_URL,
  json: true,
  timeout: 10_000,
  headers: {
    authorization: `Bearer ${API_TOKEN}`,
    "user-agent": "my-app/1.0",
  },
});

api.get("/v1/users/me", (error, response, body) => {
  if (error) {
    throw error;
  }

  if (response.statusCode !== 200) {
    throw new Error(`Unexpected status: ${response.statusCode}`);
  }

  console.log(body);
});
```

This is the closest thing `request` has to client initialization. The runtime stays callback-based, but you can centralize auth headers, JSON mode, proxies, timeouts, and other shared options in one place.

### Send JSON In A POST Request

When you pass `json: true`, `request` will JSON-encode object request bodies and parse JSON responses.

```typescript
import request = require("request");

type CreateUserInput = {
  email: string;
  name: string;
};

const payload: CreateUserInput = {
  email: "alice@example.com",
  name: "Alice",
};

request.post(
  {
    url: `${process.env.API_BASE_URL}/v1/users`,
    json: true,
    body: payload,
    headers: {
      authorization: `Bearer ${process.env.API_TOKEN}`,
      "user-agent": "my-app/1.0",
    },
  },
  (error, response, body) => {
    if (error) {
      throw error;
    }

    if (response.statusCode !== 201) {
      throw new Error(`Unexpected status: ${response.statusCode}`);
    }

    console.log(body);
  }
);
```

If your environment variables are required, check them once during startup and fail early instead of relying on non-null assertions throughout the codebase.

### Keep Session Cookies In A Jar

Use `request.jar()` when you need a shared cookie store across multiple requests.

```typescript
import request = require("request");

const { APP_ORIGIN } = process.env;

if (!APP_ORIGIN) {
  throw new Error("Set APP_ORIGIN before starting the app");
}

const jar = request.jar();
jar.setCookie(request.cookie("session=abc123"), APP_ORIGIN);

request.get(
  {
    url: `${APP_ORIGIN}/account`,
    jar,
    followRedirect: true,
  },
  (error, response, body) => {
    if (error) {
      throw error;
    }

    console.log(response.statusCode, body);
  }
);
```

This pattern matters in TypeScript because the cookie jar comes from the `request` runtime surface, not from a separate client instance.

### Wrap `request` At The Promise Boundary

The declaration package types the callback-based API. If the rest of your app uses `async` and `await`, wrap `request` once and return typed promises from your own helper.

```typescript
import request = require("request");

async function getJson<T>(url: string): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    request.get({ url, json: true }, (error, response, body) => {
      if (error) {
        reject(error);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Unexpected status: ${response.statusCode}`));
        return;
      }

      resolve(body as T);
    });
  });
}

type HealthResponse = {
  status: string;
};

const health = await getJson<HealthResponse>("https://example.com/health");
console.log(health.status);
```

This keeps the untyped network boundary small. Your application code can then work with `Promise<T>` while still using the published `request` API surface underneath.

## Common Pitfalls

- Install `request` as well as `@types/request`; the type package does not include runtime code.
- Import from `"request"`, not from `"@types/request"`.
- Prefer `import request = require("request")` unless your project already enables TypeScript interop flags for default imports.
- `json: true` changes runtime parsing, but it does not validate third-party API responses against your TypeScript interfaces.
- If you use `compilerOptions.types`, include both `node` and `request` so the module and Node globals resolve correctly.
- `request` is callback-first. If your codebase is promise-first, wrap it at one boundary instead of mixing callback logic throughout the app.

## Official Sources

- https://www.npmjs.com/package/@types/request
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/request
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/request/index.d.ts
- https://www.npmjs.com/package/request
- https://github.com/request/request
