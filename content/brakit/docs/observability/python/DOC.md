---
name: observability
description: "Brakit Python SDK for zero-config API observability with FastAPI and Flask, forwarding telemetry to the Node.js dashboard"
metadata:
  languages: "python"
  versions: "0.1.2"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "brakit,observability,security,fastapi,flask,api-monitoring"
---

# Brakit — Python SDK

Zero-config observability for Python API backends. The Python SDK captures every request, query, fetch call, and error in your FastAPI or Flask app and forwards telemetry to the Brakit Node.js dashboard.

## Golden Rule

`import brakit` must be the **very first import** in your application — before any framework or library imports. This is required because brakit patches framework constructors and library entry points at import time.

```python
import brakit          # MUST be first
from fastapi import FastAPI  # framework import after brakit
```

## Prerequisites

Brakit is a full-stack observability tool. The Python SDK forwards telemetry to the **Node.js Brakit dashboard**. You need:

1. Node.js Brakit installed in your project: `npx brakit install`
2. The Node.js app running (provides the dashboard at `/__brakit`)
3. Python >= 3.9

The Python SDK auto-discovers the Node.js dashboard port — no manual configuration needed.

## Installation

```bash
pip install brakit              # core only
pip install brakit[fastapi]     # with FastAPI extras
pip install brakit[flask]       # with Flask extras
pip install brakit[dev]         # development extras
```

## FastAPI Setup

```python
import brakit                   # must be first import
from fastapi import FastAPI

app = FastAPI()

@app.get("/users")
async def get_users():
    return [{"id": 1, "name": "Alice"}]
```

Brakit auto-detects FastAPI and injects ASGI middleware. No other configuration needed.

## Flask Setup

```python
import brakit                   # must be first import
from flask import Flask

app = Flask(__name__)

@app.route("/users")
def get_users():
    return [{"id": 1, "name": "Alice"}]
```

Brakit auto-detects Flask and injects before/after request hooks.

## What Gets Captured (Zero Code Changes)

| Category | What's Traced | Library |
|----------|--------------|---------|
| HTTP Requests | Every incoming request/response with timing, status, headers | FastAPI, Flask |
| DB Queries | SQL queries with params, timing, row count | SQLAlchemy, asyncpg |
| Fetch Calls | All outgoing HTTP calls with URL, timing, response | httpx, aiohttp, requests/urllib3 |
| Logs | All Python logging output linked to requests | stdlib `logging` |
| Errors | Unhandled exceptions with stack traces | Global exception hooks |

## Cross-Service Tracing

When your Node.js frontend calls your Python API, brakit automatically nests the Python telemetry under the originating fetch call in the dashboard.

```
Next.js frontend (Node.js brakit)
  └── fetch POST /api/signup
        └── FastAPI backend (Python brakit)
              ├── INSERT INTO users ...
              ├── SELECT FROM plans ...
              └── fetch POST https://api.stripe.com/charges
```

This works via request ID propagation through HTTP headers (`x-brakit-request-id`, `x-brakit-fetch-id`). No configuration needed.

## Supported Frameworks

| Framework | Status |
|-----------|--------|
| FastAPI | Full support (auto-detect) |
| Flask | Full support (auto-detect) |
| Django | Planned |

## Supported Databases

| Driver | Status |
|--------|--------|
| SQLAlchemy | Supported (sync and async) |
| asyncpg | Supported |
| psycopg | Planned |

## Supported HTTP Clients

| Library | Status |
|---------|--------|
| httpx | Supported (sync and async) |
| aiohttp | Supported |
| requests / urllib3 | Supported |

## How It Works Internally

1. **Import-time patching** — `import brakit` patches framework constructors (FastAPI, Flask) and library entry points (httpx, SQLAlchemy, etc.)
2. **Request context** — Uses `contextvars.ContextVar` for async-safe request ID propagation
3. **Event bus** — Decoupled pub/sub system connects adapters to stores
4. **Ring buffer stores** — Bounded in-memory storage with FIFO eviction (configurable max entries)
5. **Forwarder thread** — Background thread sends telemetry to Node.js dashboard via localhost HTTP
6. **Circuit breaker** — 10 errors = brakit self-disables to never affect your app
7. **Port discovery** — Auto-discovers Node.js dashboard port via port file negotiation

## Production Safety

Brakit never runs in production. Safety layers include:

- `should_activate()` checks `NODE_ENV` and 15+ cloud/CI env vars
- Framework-level guards with additional `NODE_ENV` checks
- `try/except` on import — missing dependency = silent no-op
- Circuit breaker — 10 errors = auto-disable
- `BRAKIT_DISABLE=true` manual kill switch

## Troubleshooting

### Import order issues

`import brakit` must be the first import. If you see "Framework not detected", check that brakit is imported before FastAPI/Flask.

```python
# WRONG — brakit can't patch FastAPI if it's already imported
from fastapi import FastAPI
import brakit

# CORRECT
import brakit
from fastapi import FastAPI
```

### SDK not connecting to Node.js dashboard

1. Ensure the Node.js app is running (start it however you normally do)
2. Check that `npx brakit install` was run in the Node.js project
3. Verify the port file exists at `.brakit/port` in the Node.js project
4. Set `BRAKIT_PORT=<port>` if auto-discovery fails

### Framework not detected

Brakit patches framework constructors at import time. If you create the app before importing brakit, it won't be instrumented. Always import brakit first.

## Useful Links

- [GitHub](https://github.com/brakit-ai/brakit)
- [Contributing](https://github.com/brakit-ai/brakit/blob/main/CONTRIBUTING.md)
- [Website](https://brakit.ai)
