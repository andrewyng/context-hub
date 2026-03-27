---
name: axios
description: "Axios HTTP client for JavaScript in browsers and Node.js, including reusable instances, interceptors, cancellation, and error handling."
metadata:
  languages: "javascript"
  versions: "1.13.6"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "axios,http,client,requests,node,browser"
---

# Axios JavaScript Guide

## Golden Rule

Use `axios` itself as the HTTP client and create a reusable instance with `axios.create()` for app-wide defaults.

Axios works in browsers and Node.js, supports request/response interceptors, accepts `AbortController` signals for cancellation, and rejects requests outside the success range unless you change `validateStatus`.

## Install

Install the runtime package with your normal package manager:

```bash
npm install axios
```

```bash
pnpm add axios
```

```bash
yarn add axios
```

Axios does not require package-specific environment variables. Keep API URLs and credentials in your application config instead:

```bash
export API_BASE_URL="https://api.example.com"
export API_TOKEN="replace-me"
export API_USERNAME="replace-me"
export API_PASSWORD="replace-me"
```

## Import and Initialize

Use a shared client instance so base URL, timeout, and default headers live in one place.

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_BASE_URL ?? "https://api.example.com",
  timeout: 10_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
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

### Send a `GET` request with query parameters

Pass query string values with the `params` option. Axios serializes them onto the request URL.

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

### Send JSON with `POST`

Pass a plain object as the second argument to `post()`. Axios serializes the body as JSON by default.

```javascript
import api from "./api.js";

export async function createUser() {
  const response = await api.post("/users", {
    email: "alice@example.com",
    role: "admin",
  });

  return response.data;
}
```

### Use per-request configuration

Request config can override timeout, headers, auth, and status handling for a single call.

```javascript
import api from "./api.js";

export async function fetchHealthcheck() {
  const response = await api.get("/health", {
    timeout: 2_000,
    validateStatus: (status) => status < 500,
  });

  return {
    status: response.status,
    data: response.data,
  };
}
```

Use `validateStatus` when you want some non-2xx responses to resolve normally instead of throwing.

### Send HTTP Basic auth

Use the `auth` option when the server expects HTTP Basic auth.

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

### Handle errors with `axios.isAxiosError`

Axios errors can include a server response, a sent request with no response, or a setup failure before the request was sent.

```javascript
import axios from "axios";
import api from "./api.js";

export async function deleteUser(userId) {
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `Request failed with ${error.response.status}: ${JSON.stringify(error.response.data)}`,
        );
      }

      if (error.request) {
        throw new Error("Request sent but no response was received");
      }

      throw new Error(error.message);
    }

    throw error;
  }
}
```

If you need a plain object for logging, call `error.toJSON()` on an Axios error.

### Cancel a request with `AbortController`

Pass `signal` in request config and abort through the platform `AbortController`.

```javascript
import api from "./api.js";

export async function searchUsers(query) {
  const controller = new AbortController();

  const request = api.get("/users/search", {
    params: { q: query },
    signal: controller.signal,
  });

  setTimeout(() => controller.abort(), 250);

  return request;
}
```

Use `signal` for new code. Axios documents `CancelToken` as deprecated.

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

## Interceptors

Interceptors are the standard place to add auth headers, trace IDs, response transforms, or centralized retry/refresh handling.

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["X-Request-Id"] = String(Date.now());
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh credentials or redirect to login here.
    }

    return Promise.reject(error);
  },
);
```

Keep interceptor logic focused. Avoid hiding large amounts of application behavior inside global request hooks.

## Important Pitfalls

- `axios.create()` gives you an isolated client with its own defaults and interceptors; changing one instance does not update another.
- `auth` is for HTTP Basic auth. It sets the `Authorization` header and can overwrite a custom `Authorization` header you set manually.
- Axios rejects responses outside the default success range. If you expect `404`, `409`, or similar statuses in normal control flow, set `validateStatus` for that request or instance.
- `axios.isAxiosError()` narrows the error type, but `error.response` is still undefined for network failures, timeouts, and cancellations.
- Prefer `signal` with `AbortController` for cancellation. `CancelToken` is deprecated.
- In Node.js, use `responseType: "stream"` when you want a readable stream instead of buffered response data.

## Version-Sensitive Notes

- This guide targets `axios@1.13.6`.
- The documented request patterns here use the current Axios 1.x APIs: `axios.create()`, interceptor hooks, request config objects, `validateStatus`, and `AbortController`-based cancellation.
- For TypeScript projects, install only `axios`; its type definitions are bundled with the runtime package.

## Official Sources

- https://axios-http.com/docs/intro
- https://axios-http.com/docs/instance
- https://axios-http.com/docs/req_config
- https://axios-http.com/docs/interceptors
- https://axios-http.com/docs/handling_errors
- https://axios-http.com/docs/cancellation
- https://www.npmjs.com/package/axios
