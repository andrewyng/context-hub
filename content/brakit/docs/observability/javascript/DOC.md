---
name: observability
description: "Brakit Node.js SDK for zero-config API observability: live dashboard, security scanning, N+1 detection, and AI-native MCP integration"
metadata:
  languages: "javascript"
  versions: "0.8.7"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "brakit,observability,security,n+1,mcp,api-monitoring"
---

# Brakit — Node.js SDK

Zero-config observability for API backends. Brakit intercepts every request, query, fetch call, and error in your running app — surfaces security issues and performance problems as you develop.

## Golden Rule

Brakit is a **dev-only** tool. It never runs in production — 7 independent safety layers guarantee it (NODE_ENV check, localhost-only dashboard, circuit breaker, manual kill switch, and more). Brakit installs as a regular dependency (not devDependency) so that `import 'brakit'` never throws in production — it simply no-ops.

## Installation

```bash
npx brakit install
```

Then start your app however you normally do (e.g., `npm run dev`, `node server.js`, `next dev`, etc.).

`brakit install` does three things:

1. Adds `brakit` as a dependency
2. Creates an instrumentation file (`instrumentation.ts` or equivalent)
3. Configures the MCP server for Claude Code / Cursor

Dashboard is at `http://localhost:<port>/__brakit` on your existing dev server port.

## Framework Setup

Brakit auto-detects your framework. The instrumentation file created by `brakit install` handles everything. Here's what it generates for each framework:

### Next.js

```typescript
// instrumentation.ts (project root)
export async function register() {
  if (process.env.NODE_ENV === "development") {
    await import("brakit");
  }
}
```

### Express / Fastify / Other Node.js Servers

```typescript
// Add as the first import in your entry file
import "brakit";
import express from "express";

const app = express();
// ... your routes
```

### Remix / Nuxt / Vite / Astro

Brakit auto-detects these frameworks and hooks in via `instrumentation.ts` or equivalent entry point. `npx brakit install` creates the correct file for your project.

## What Gets Captured (Zero Code Changes)

| Category      | What's Traced                                                       |
| ------------- | ------------------------------------------------------------------- |
| HTTP Requests | Every incoming request/response with timing, status, headers, body  |
| Fetch Calls   | All outgoing `fetch()` calls with URL, timing, response             |
| DB Queries    | SQL queries via pg, mysql2, Prisma — with params, timing, row count |
| Console Logs  | `console.log/warn/error` output captured and linked to requests     |
| Errors        | Unhandled exceptions and rejections with stack traces               |

Everything is grouped into **actions** — "Sign Up", "Load Dashboard" — not raw HTTP noise.

## Dashboard

Access at `/__brakit` on your dev server. It shows:

- **Actions view** — endpoints grouped by the user action that triggered them
- **Request timeline** — scatter chart of all requests by latency
- **Health grades** — per-endpoint performance grades (A through F)
- **Security findings** — issues detected in live traffic
- **Performance insights** — N+1 queries, duplicates, slow endpoints, overfetch

## Security Rules

8 high-confidence rules scan your live traffic:

| Severity | Rule               | Detects                                                                     |
| -------- | ------------------ | --------------------------------------------------------------------------- |
| Critical | Exposed Secret     | `password`, `api_key`, `client_secret` fields with real values in responses |
| Critical | Token in URL       | Auth tokens in query parameters instead of headers                          |
| Critical | Stack Trace Leak   | Internal stack traces sent to the client                                    |
| Critical | Error Info Leak    | DB connection strings, SQL queries in error responses                       |
| Warning  | PII in Response    | Emails, full user records with internal IDs echoed back                     |
| Warning  | Insecure Cookie    | Missing `HttpOnly` or `SameSite` flags                                      |
| Warning  | Sensitive Logs     | Passwords, secrets, or tokens in console output                             |
| Warning  | CORS + Credentials | `credentials: true` with wildcard origin                                    |

See **[references/security-rules.md](references/security-rules.md)** for detailed detection logic and fix examples.

## Performance Insights

| Severity | Insight              | Detects                                                              |
| -------- | -------------------- | -------------------------------------------------------------------- |
| Critical | N+1 Query            | Same query pattern 5+ times in one request                           |
| Critical | Error Hotspot        | Endpoint error rate >= 20%                                           |
| Critical | Unhandled Error      | Uncaught exceptions in request handlers                              |
| Warning  | Slow Endpoint        | Average latency >= 1000ms with time breakdown                        |
| Warning  | Query-Heavy          | More than 5 queries per request on average                           |
| Warning  | Duplicate API Call   | Same endpoint called multiple times across actions                   |
| Warning  | Regression           | p95 latency increase >= 200ms / 50%, or query count increase >= 1.5x |
| Warning  | Cross-Endpoint Query | Same query runs on 3+ endpoints (50%+ of all endpoints)              |
| Warning  | Redundant Query      | Exact same SQL + params runs 2+ times in one request                 |
| Warning  | SELECT \*            | `SELECT *` query executed 2+ times                                   |
| Info     | Response Overfetch   | Large response with 8+ fields, many nulls, or internal IDs           |
| Info     | Large Response       | Average response > 50KB                                              |

See **[references/insight-rules.md](references/insight-rules.md)** for thresholds and fix examples.

## MCP Integration

Brakit includes an MCP server so AI assistants (Claude Code, Cursor) can query findings and verify fixes directly.

`npx brakit install` auto-configures MCP. Available tools:

| Tool                 | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `get_findings`       | Get all security and performance findings with fix hints |
| `get_endpoints`      | Endpoint summary with p95, error rate, query count       |
| `get_request_detail` | Full request detail: queries, fetches, timeline          |
| `verify_fix`         | Check if a previously found issue is resolved            |
| `get_report`         | Summary report of all findings and app health            |
| `report_fix`         | Report fix outcome (fixed / won't fix) to dashboard      |
| `clear_findings`     | Reset finding history for a fresh session                |

See **[references/mcp-tools.md](references/mcp-tools.md)** for full parameter schemas and examples.

## Supported Frameworks

| Framework | Status                     |
| --------- | -------------------------- |
| Next.js   | Full support (auto-detect) |
| Remix     | Auto-detect                |
| Nuxt      | Auto-detect                |
| Vite      | Auto-detect                |
| Astro     | Auto-detect                |
| Express   | Auto-detect                |
| Fastify   | Auto-detect                |

## Supported Databases

| Driver  | Status    |
| ------- | --------- |
| pg      | Supported |
| mysql2  | Supported |
| Prisma  | Supported |
| SQLite  | Planned   |
| MongoDB | Planned   |
| Drizzle | Planned   |

## Production Safety

Multiple independent layers prevent brakit from ever running in production:

| #   | Layer                        | How It Blocks                             |
| --- | ---------------------------- | ----------------------------------------- |
| 1   | `shouldActivate()`           | Checks `NODE_ENV` + 15 cloud/CI env vars  |
| 2   | `instrumentation.ts` guard   | Its own `NODE_ENV !== 'production'` check |
| 3   | Safe no-op in production     | Import succeeds but does nothing          |
| 4   | Localhost-only dashboard     | Non-local IPs get 404 on `/__brakit`      |
| 5   | `safeWrap` + circuit breaker | 10 errors = brakit self-disables          |
| 6   | `BRAKIT_DISABLE=true`        | Manual kill switch                        |

## Uninstall

```bash
npx brakit uninstall
```

Removes the instrumentation file, MCP configuration, `.brakit` data directory, `.gitignore` entry, and the dependency. Your app is unchanged.

## Useful Links

- [Architecture](https://github.com/brakit-ai/brakit/blob/main/docs/design/architecture.md)
- [Contributing](https://github.com/brakit-ai/brakit/blob/main/CONTRIBUTING.md)
- [Website](https://brakit.ai)
