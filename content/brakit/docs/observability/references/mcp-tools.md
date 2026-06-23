# Brakit MCP Tools Reference

Brakit exposes 7 MCP tools for AI assistants (Claude Code, Cursor) to query findings, inspect endpoints, and verify fixes.

The MCP server is auto-configured during `npx brakit install`. It runs alongside the Brakit dashboard.

---

## get_findings

Get all security findings and performance insights from the running app. Returns enriched findings with actionable fix hints, endpoint context, and evidence.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `severity` | string | No | Filter by `"critical"` or `"warning"` |
| `state` | string | No | Filter by `"open"`, `"fixing"`, `"resolved"`, `"stale"`, or `"regressed"` |

**Example usage:**
```
get_findings({ severity: "critical" })
get_findings({ state: "open" })
get_findings({})  // all findings
```

**Response includes:** Finding ID, rule ID, severity, state, affected endpoint, evidence (query patterns, response excerpts), and actionable fix hint.

---

## get_endpoints

Get a summary of all observed API endpoints with performance stats.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sort_by` | string | No | Sort by `"p95"` (default), `"error_rate"`, `"query_count"`, or `"requests"` |

**Example usage:**
```
get_endpoints({ sort_by: "error_rate" })
get_endpoints({})  // sorted by p95 latency
```

**Response includes:** Endpoint (method + path), request count, p95 latency, error rate, average query count, time breakdown (DB / Fetch / App), health grade.

---

## get_request_detail

Get full details of a specific HTTP request including all DB queries, fetches, response, and a timeline of events.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `request_id` | string | No | The specific request ID to look up |
| `endpoint` | string | No | Get the latest request for an endpoint (e.g., `"GET /api/users"`) |

Must provide either `request_id` OR `endpoint`.

**Example usage:**
```
get_request_detail({ request_id: "abc-123" })
get_request_detail({ endpoint: "GET /api/users" })
```

**Response includes:** Full request/response (method, URL, status, headers, body), all DB queries fired (SQL, params, timing, row count), all outgoing fetch calls (URL, timing, status), console logs, errors, and an ordered timeline.

---

## verify_fix

Verify whether a previously found security or performance issue has been resolved. After fixing code, the user should trigger the endpoint again, then call this tool.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `finding_id` | string | No | The finding ID to verify |
| `endpoint` | string | No | Check if a specific endpoint still has issues (e.g., `"GET /api/users"`) |

Must provide either `finding_id` OR `endpoint`.

**Example usage:**
```
verify_fix({ finding_id: "exposed-secret-abc123" })
verify_fix({ endpoint: "GET /api/users" })
```

**Response includes:** Whether the issue is resolved, still present, or if more requests are needed to confirm.

---

## get_report

Generate a summary report of all findings. Returns a high-level overview of the application's health with critical issues listed first.

**Parameters:** None.

**Example usage:**
```
get_report({})
```

**Response includes:** Total findings found, open count, resolved count, critical vs warning breakdown, and a list of all findings sorted by severity.

---

## clear_findings

Reset finding history for a fresh session. Use when starting a new development session or after major refactoring.

**Parameters:** None.

**Example usage:**
```
clear_findings({})
```

---

## report_fix

Report the result of fixing a brakit finding. Call this after attempting to fix each finding to update the dashboard with the outcome.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `finding_id` | string | **Yes** | The finding ID to report on |
| `status` | string | **Yes** | `"fixed"` or `"wont_fix"` |
| `summary` | string | **Yes** | Brief description of what was done or why it can't be fixed |

**Example usage:**
```
report_fix({
  finding_id: "exposed-secret-abc123",
  status: "fixed",
  summary: "Stripped password field from user response DTO"
})

report_fix({
  finding_id: "pii-leak-def456",
  status: "wont_fix",
  summary: "Email is required in response for the user profile endpoint"
})
```

---

## Typical AI Workflow

1. **Discover issues:** `get_findings({})` or `get_report({})`
2. **Inspect details:** `get_request_detail({ endpoint: "GET /api/users" })`
3. **Fix the code** based on the hint and evidence
4. **User triggers the endpoint** (refreshes page, runs curl, etc.)
5. **Verify:** `verify_fix({ finding_id: "..." })`
6. **Report:** `report_fix({ finding_id: "...", status: "fixed", summary: "..." })`
