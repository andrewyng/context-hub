---
name: axios
description: "Axios HTTP client for JavaScript in browsers and Node.js, including reusable instances, interceptors, cancellation, and error handling."
metadata:
  languages: "javascript"
  versions: "1.16.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "axios,http,client,requests,node,browser"
---

# Axios JavaScript Guide

## Golden Rule

Use `axios` itself as the HTTP client and create a reusable instance with `axios.create()` for app-wide defaults.

Axios works in browsers and Node.js, supports request/response interceptors, accepts `AbortController` signals for cancellation, and rejects responses outside the success range unless you change `validateStatus`.

## Install

Install the runtime package with your normal package manager:

```bash
npm install axios@1.16.1
```

```bash
pnpm add axios@1.16.1
```

```bash
yarn add axios@1.16.1
```

Axios does not require package-specific environment variables. Keep API URLs and credentials in your application config instead:

```bash
export API_BASE_URL="https://api.example.com"
export API_TOKEN="replace-me"
export API_USERNAME="replace-me"
export API_PASSWORD="replace-me"
```

## Default Export vs Instance

The default `axios` export is itself a callable client with its own defaults and interceptors. You can call `axios.get(...)` directly, or create an isolated instance with `axios.create()` so each service has its own base URL, timeout, headers, and interceptor chain.

```javascript
import axios from "axios";

// Mutating the default client affects every call that uses it.
axios.defaults.headers.common["X-App"] = "checkout-web";

// A dedicated instance keeps its own config and interceptors.
const api = axios.create({
  baseURL: process.env.API_BASE_URL ?? "https://api.example.com",
  timeout: 10_000,
  headers: {
    Accept: "application/json",
  },
});

const apiToken = process.env.API_TOKEN;

api.interceptors.request.use((config) => {
  if (apiToken) {
    config.headers.Authorization = `Bearer ${apiToken}`;
  }

  return config;
});

export default api;
```

If your project uses CommonJS, import Axios like this instead:

```javascript
const axios = require("axios");
```

## Common Workflows

### `GET` with query parameters

Pass query string values with `params`. Axios serializes them onto the request URL.

```javascript
import api from "./api.js";

export async function listUsers() {
  const response = await api.get("/users", {
    params: {
      page: 1,
      limit: 25,
      role: "admin",
    },
  });

  return response.data;
}
```

For arrays or nested objects, supply `paramsSerializer` to control encoding. By default, Axios uses URLSearchParams-style serialization.

### `POST`, `PUT`, `PATCH`, `DELETE` with a JSON body

Method shortcuts accept the body as the second argument and per-request config as the third. Axios serializes plain objects as JSON and sets `Content-Type: application/json` automatically.

```javascript
import api from "./api.js";

export async function createUser() {
  const response = await api.post("/users", {
    email: "alice@example.com",
    role: "admin",
  });

  return response.data;
}

export async function replaceUser(userId, user) {
  const response = await api.put(`/users/${userId}`, user);
  return response.data;
}

export async function updateUser(userId, patch) {
  const response = await api.patch(`/users/${userId}`, patch);
  return response.data;
}

export async function deleteUser(userId) {
  await api.delete(`/users/${userId}`);
}
```

`axios.delete()` accepts only a URL and a config object. If you need a request body on a DELETE, pass it under `data` in the config.

```javascript
await api.delete(`/users/${userId}`, { data: { reason: "duplicate" } });
```

### `params` vs `data`

`params` always goes on the query string. `data` is the request body for `POST`, `PUT`, `PATCH`, and (when explicitly set) `DELETE`. For `GET` and `HEAD`, the `data` field is ignored.

```javascript
await api.request({
  method: "post",
  url: "/orders",
  params: { dryRun: true },
  data: { items: [{ sku: "sku_1", qty: 2 }] },
});
```

### Headers

Default headers live on the instance. Per-request headers override defaults for that call only.

```javascript
const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    Accept: "application/json",
    "X-App": "checkout-web",
  },
});

await api.get("/users/me", {
  headers: {
    "If-None-Match": "\"etag-value\"",
  },
});
```

Inside an interceptor, mutate `config.headers` directly. In Axios 1.x, `config.headers` is an `AxiosHeaders` instance with `set`, `get`, `has`, and `delete` methods, but plain assignment still works.

```javascript
api.interceptors.request.use((config) => {
  config.headers.set("X-Request-Id", crypto.randomUUID());
  return config;
});
```

### Interceptors

Interceptors are the standard place to add auth headers, trace IDs, response transforms, or centralized retry/refresh handling.

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

const requestId = api.interceptors.request.use((config) => {
  config.headers.set("X-Request-Id", String(Date.now()));
  return config;
});

const responseId = api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh credentials or redirect to login here.
    }

    return Promise.reject(error);
  },
);

// Eject when you no longer want the interceptor active.
api.interceptors.request.eject(requestId);
api.interceptors.response.eject(responseId);
```

Keep interceptor logic focused. Avoid hiding large amounts of application behavior inside global request hooks.

### Cancel a request with `AbortController`

Pass `signal` in request config and abort through the platform `AbortController`. Aborted requests reject with a `CanceledError`.

```javascript
import axios from "axios";
import api from "./api.js";

export async function searchUsers(query) {
  const controller = new AbortController();

  const request = api.get("/users/search", {
    params: { q: query },
    signal: controller.signal,
  });

  setTimeout(() => controller.abort(), 250);

  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      return null;
    }
    throw error;
  }
}
```

Use `signal` for new code. `CancelToken` still exists but is documented as deprecated.

### Response shape

A resolved response is always shaped the same way regardless of HTTP method.

```javascript
const response = await api.get("/users/usr_123");

response.data;       // parsed body (JSON by default)
response.status;     // HTTP status code, e.g. 200
response.statusText; // e.g. "OK"
response.headers;    // AxiosHeaders instance
response.config;     // the resolved request config
response.request;    // underlying request (ClientRequest in Node, XHR in browsers)
```

### Errors and `isAxiosError`

Axios rejects with an `AxiosError` for non-2xx responses, network failures, timeouts, and cancellations. Use `axios.isAxiosError(error)` to narrow the type before reading Axios-specific fields.

```javascript
import axios from "axios";
import api from "./api.js";

export async function fetchUser(userId) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server replied with a non-2xx status.
        throw new Error(
          `Request failed with ${error.response.status}: ${JSON.stringify(error.response.data)}`,
        );
      }

      if (error.request) {
        // Request went out but no response was received.
        throw new Error("Request sent but no response was received");
      }

      // Setup error before the request was sent.
      throw new Error(error.message);
    }

    throw error;
  }
}
```

Useful fields on an `AxiosError`:

- `error.code` — strings like `ECONNABORTED`, `ETIMEDOUT`, `ERR_CANCELED`, `ERR_NETWORK`, `ERR_BAD_REQUEST`, `ERR_BAD_RESPONSE`.
- `error.config` — the resolved request config.
- `error.response` — present only when the server replied.
- `error.toJSON()` — returns a plain object suitable for logging.

To accept some non-2xx statuses as successful, override `validateStatus` for the call or instance.

```javascript
await api.get("/health", {
  timeout: 2_000,
  validateStatus: (status) => status < 500,
});
```

### Timeouts

`timeout` is the number of milliseconds before Axios aborts the request. The default `0` means no timeout. A timed-out request rejects with an `AxiosError` whose `code` is `ECONNABORTED`.

```javascript
const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 5_000,
});

try {
  await api.get("/slow");
} catch (error) {
  if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
    // Handle timeout.
  }
  throw error;
}
```

### HTTP Basic auth

Use the `auth` option when the server expects HTTP Basic auth. Axios builds the `Authorization: Basic <base64>` header for you.

```javascript
import api from "./api.js";

export async function getAccount() {
  const response = await api.get("/account", {
    auth: {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD,
    },
  });

  return response.data;
}
```

### File upload with `FormData`

In browsers, build a `FormData` instance and pass it as the request body. Axios sets the correct multipart `Content-Type` (including the boundary). Do not set `Content-Type` yourself.

```javascript
import api from "./api.js";

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file, file.name);
  form.append("visibility", "private");

  const response = await api.post("/profile/avatar", form);
  return response.data;
}
```

In Node.js, the global `FormData` (Node 18+) works the same way. If you prefer the `form-data` package, you can pass it directly:

```javascript
import FormData from "form-data";
import fs from "node:fs";
import api from "./api.js";

export async function uploadReport(path) {
  const form = new FormData();
  form.append("file", fs.createReadStream(path));

  const response = await api.post("/reports", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
  });
  return response.data;
}
```

`maxBodyLength` and `maxContentLength` default to limits that may reject large uploads or responses. Set them to `Infinity` (or a larger number) when needed.

### Download a file in Node.js

When you need a Node.js stream instead of parsed JSON, set `responseType: "stream"`.

```javascript
import fs from "node:fs";
import api from "./api.js";

export async function downloadReport() {
  const response = await api.get("/reports/daily.csv", {
    responseType: "stream",
  });

  const writer = fs.createWriteStream("daily.csv");
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
```

## Important Pitfalls

- `axios.create()` gives you an isolated client with its own defaults and interceptors; changing one instance does not update another.
- `auth` is for HTTP Basic auth. It sets the `Authorization` header and overrides any custom `Authorization` header you set on the same request.
- Axios rejects responses outside the default 2xx range. If you expect `404`, `409`, or similar statuses in normal control flow, set `validateStatus`.
- `axios.isAxiosError(error)` narrows the error type, but `error.response` is still undefined for network failures, timeouts, and cancellations.
- Prefer `signal` with `AbortController` for cancellation. `CancelToken` is deprecated.
- For `FormData` uploads, let Axios set `Content-Type`. Setting it manually drops the multipart boundary and breaks the upload.
- In Node.js, raise `maxBodyLength` and `maxContentLength` when uploading or downloading large payloads.
- `axios.delete()` does not take a body as a positional argument; pass `{ data }` in the config object.

## Version-Sensitive Notes

- This guide targets `axios@1.16.1`.
- The documented patterns use current Axios 1.x APIs: `axios.create()`, the `AxiosHeaders` interface on `config.headers`, interceptor hooks, `validateStatus`, and `AbortController`-based cancellation.
- For TypeScript projects, install only `axios`; its type definitions are bundled with the runtime package.

## Official Sources

- https://axios-http.com/docs/intro
- https://axios-http.com/docs/instance
- https://axios-http.com/docs/req_config
- https://axios-http.com/docs/res_schema
- https://axios-http.com/docs/interceptors
- https://axios-http.com/docs/handling_errors
- https://axios-http.com/docs/cancellation
- https://www.npmjs.com/package/axios
