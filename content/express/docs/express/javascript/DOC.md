---
name: express
description: "Express 5 web framework for Node.js applications, APIs, routers, middleware, body parsing, static files, and error handling"
metadata:
  languages: "javascript"
  versions: "5.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "express,nodejs,web,framework,http,routing,middleware"
---

# Express 5 Guide for JavaScript Apps

## Golden Rule

Use the official `express` package to create the app, register middleware, define routes, and start the HTTP server.

Express does not require API credentials or client authentication. Initialization is just creating an application object with `express()` and mounting the middleware and routers your app needs.

For request parsing and static files, use the built-in exports on the `express` package:

- `express.json()`
- `express.urlencoded()`
- `express.static()`
- `express.Router()`

## Install

Express `5.2.1` requires Node.js `18` or newer.

```bash
npm install express@5.2.1
```

Typical environment variables:

```bash
export PORT=3000
export NODE_ENV=development
```

## Create and Start an App

`server.js`:

```js
const express = require('express');

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, env: app.get('env') });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status >= 500 ? 'Internal Server Error' : err.message,
  });
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
```

Run it:

```bash
PORT=3000 NODE_ENV=development node server.js
```

Notes:

- `app.listen(...)` creates an `http.Server` and returns it.
- `app.get('env')` comes from `NODE_ENV`, and defaults to `development`.
- Express enables the `X-Powered-By: Express` header by default; `app.disable('x-powered-by')` turns it off.

## Common Workflows

### Define routes

Use method-specific handlers like `app.get()` and `app.post()` for straightforward APIs.

```js
const express = require('express');

const app = express();
app.use(express.json());

app.get('/users/:userId', (req, res) => {
  res.json({
    userId: req.params.userId,
    expand: req.query.expand,
  });
});

app.post('/users', (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'email and name are required' });
  }

  res.status(201).json({ id: 'usr_123', email, name });
});
```

`req.params` contains path parameters, `req.query` contains parsed query-string values, and `req.body` is populated only after matching body-parsing middleware runs.

### Split routes into routers

Use `express.Router()` to keep feature-specific routes together.

```js
const express = require('express');

const users = express.Router();

users.get('/', (req, res) => {
  res.json([{ id: 'usr_123', name: 'Ada' }]);
});

users.get('/:userId', (req, res) => {
  res.json({ id: req.params.userId, name: 'Ada' });
});

module.exports = users;
```

Mount the router in your app:

```js
const express = require('express');
const users = require('./routes/users');

const app = express();

app.use('/users', users);
```

If a nested router needs access to params declared on the parent mount path, create it with `mergeParams: true`:

```js
const express = require('express');

const comments = express.Router({ mergeParams: true });

comments.get('/', (req, res) => {
  res.json({ postId: req.params.postId });
});

app.use('/posts/:postId/comments', comments);
```

### Parse JSON and form bodies

`express.json()` parses JSON requests whose `Content-Type` matches the configured `type` option. `express.urlencoded()` parses URL-encoded form bodies.

```js
const express = require('express');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.post('/session', (req, res) => {
  res.status(201).json({
    email: req.body.email,
    remember: req.body.remember,
  });
});
```

Important defaults and options:

- `express.json()` defaults to `type: 'application/json'` and `limit: '100kb'`.
- `express.urlencoded()` defaults to `extended: false`; set `extended: true` if you want rich objects and arrays parsed through `qs`.
- Both parsers populate `req.body` only when the incoming `Content-Type` matches.

### Serve static files

`express.static()` serves files from a directory and falls through to the next middleware when a file is not found.

```js
const express = require('express');
const path = require('node:path');

const app = express();

app.use(
  '/assets',
  express.static(path.join(process.cwd(), 'public'), {
    maxAge: '1d',
    immutable: true,
  })
);
```

If that mount should own 404s instead of falling through, set `fallthrough: false`.

### Handle async errors

The router used by Express 5 supports handlers and middleware that return promises. If an async handler rejects or throws, Express forwards the error to error-handling middleware.

```js
const express = require('express');

const app = express();

app.get('/orders/:orderId', async (req, res) => {
  const order = await loadOrder(req.params.orderId);

  if (!order) {
    return res.sendStatus(404);
  }

  res.json(order);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

async function loadOrder(orderId) {
  if (orderId === 'missing') {
    return null;
  }

  if (orderId === 'boom') {
    throw new Error('Database unavailable');
  }

  return { id: orderId, total: 42 };
}
```

Error handlers must have four parameters: `(err, req, res, next)`.

### Run behind a reverse proxy

`trust proxy` is disabled by default. If your app runs behind a load balancer or reverse proxy, enable it so `req.ip`, `req.ips`, `req.protocol`, `req.secure`, and `req.hostname` can use forwarded headers from trusted hops.

```js
const express = require('express');

const app = express();

app.set('trust proxy', 1);

app.get('/whoami', (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    protocol: req.protocol,
    secure: req.secure,
    hostname: req.hostname,
  });
});
```

Use `1` when exactly one proxy sits in front of the app. Keep the default `false` if the app receives direct client connections.

### Accept nested query strings

Express defaults the query parser to `'simple'`. If you want nested query-string parsing, switch it to `'extended'`.

```js
const express = require('express');

const app = express();

app.set('query parser', 'extended');

app.get('/search', (req, res) => {
  res.json(req.query);
});
```

With the default parser, treat query strings as flat key-value pairs.

## Common Pitfalls

- Validate `req.body` before using it. Express and the underlying body parser treat request bodies as user-controlled input.
- Do not expect `req.body` without a matching parser. Add `express.json()` for JSON and `express.urlencoded()` for HTML form posts.
- Increase body limits deliberately. The default JSON and URL-encoded body limit is `'100kb'`.
- Use `mergeParams: true` for nested routers that need parent path params.
- Set `trust proxy` correctly before relying on `req.ip`, `req.protocol`, `req.secure`, or `req.hostname` behind a proxy.
- Disable `x-powered-by` unless you intentionally want to send that header.
- Remember that `express.static()` falls through on misses by default; use `fallthrough: false` if the static mount should terminate the request.

## Version Notes

- This guide targets `express@5.2.1`.
- The published package metadata for this release requires Node.js `>= 18`.
- Express 5 exposes `express.json()`, `express.raw()`, `express.text()`, `express.urlencoded()`, and `express.static()` directly from the main package.
- Express initializes the app query parser to `'simple'` by default.
- The router used by Express 5 forwards rejected promises from middleware, route handlers, and `router.param()` callbacks into the error pipeline.

## Official Sources

- https://expressjs.com/en/5x/api.html
- https://expressjs.com/en/starter/installing.html
- https://expressjs.com/en/guide/migrating-5
- https://www.npmjs.com/package/express
