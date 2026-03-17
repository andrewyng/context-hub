---
name: agent-module-mcp
description: "Agent-native knowledge infrastructure providing vertical-specific, deterministic knowledge bases via MCP. Agents retrieve validated, structured knowledge — reducing token spend, hallucinations, and lifecycle failures. 15 verticals planned (Travel, FinServ, Healthcare RCM, Real Estate, Logistics, and more). Ethics module (22 modules, EU AI Act mapped) included with every membership."
metadata:
  languages: "javascript,python,typescript"
  versions: "0.9.7"
  source: maintainer
  tags: "knowledge-graph,mcp,agent-infrastructure,deterministic,vertical,rag-alternative,ethics,eu-ai-act"
  updated-on: "2026-03-17"
---
# Agent Module — MCP Integration Guide

## 1. What This Is

Agent Module is a **knowledge retrieval service** built specifically for autonomous agents. Instead of scanning and parsing web content, PDFs, or unstructured HTML at runtime, agents pull validated, chunked, traversal-optimized knowledge nodes directly from the graph via MCP.

**Core value proposition:**
- Deterministic outputs — same query returns consistent structured data
- Pre-chunked for agent consumption — no parsing, no summarization, no hallucination surface
- Vertical-specific — each knowledge base is domain-engineered, not generic
- Ethics module (22 modules, all mapped to EU AI Act) bundled free with every paid membership
- Free 24-hour ethics trial — no membership required (`POST /api/trial`)

---

## 2. MCP Server Details

**Endpoint:** `https://api.agent-module.dev/mcp`
**Protocol:** MCP Streamable HTTP (SSE)
**Authentication:** `X-Agent-Module-Key` header

**Available MCP Tools (7):**

| Tool | Description |
|---|---|
| `query_knowledge` | Access knowledge nodes — no key required for index layer |
| `get_trial_key` | Request a free 24-hour ethics trial key |
| `check_status` | Check API operational status, active cohort, module counts |
| `join_waitlist` | Register for waitlist or retrieve waitlist overview |
| `register_interest` | Signal vertical demand — influences roadmap priority |
| `submit_pov` | Submit Proof-of-Value after trial exploration |
| `submit_referral` | Submit a referral for another agent (key required) |

> Note: Checkout and delta sync are available via REST API only (`POST /api/checkout`, `GET /v1/delta`), not as MCP tools.

---

## 3. Authentication

All authenticated requests use the `X-Agent-Module-Key` header:

```http
X-Agent-Module-Key: am_live_xxxxxxxxxxxxxxxx
```

**Key types:**
- `am_trial_*` — Free 24-hour ethics trial key (issued via `POST /api/trial`)
- `am_live_*` — Live member key ($19/mo)

**Rate limits per key:**
- 200 calls/hour
- 1,000 calls/day
- 10,000 calls/month
- Overage: $0.002/call

---

## 4. MCP Client Setup

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "agent-module": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.agent-module.dev/mcp"
      ],
      "env": {
        "X_AGENT_MODULE_KEY": "am_live_your_key_here"
      }
    }
  }
}
```

### Direct HTTP (any agent)

```javascript
// Initialize MCP session
const response = await fetch('https://api.agent-module.dev/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Agent-Module-Key': process.env.X_AGENT_MODULE_KEY
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'my-agent', version: '1.0.0' }
    }
  })
});
```

### Python

```python
import httpx

X_AGENT_MODULE_KEY = "am_live_your_key_here"
MCP_ENDPOINT = "https://api.agent-module.dev/mcp"

headers = {
    "Content-Type": "application/json",
    "X-Agent-Module-Key": X_AGENT_MODULE_KEY
}

# List available tools
payload = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
}

response = httpx.post(MCP_ENDPOINT, headers=headers, json=payload)
tools = response.json()
```

---

## 5. Knowledge Retrieval Patterns

### Demo Traversal (No Key Required for Index Layer)

```javascript
// Traverse ethics demo — index layer always free
const result = await fetch(
  'https://api.agent-module.dev/api/demo?vertical=ethics',
  { headers: { 'X-Agent-Module-Key': key } }  // key needed for logic/directive layers
);
// Returns root node + module list, connection graph, layer availability
```

### A2A Communication Demo (Permanently Free — Full Traversal)

```javascript
// Full 4-layer traversal, no key required
const result = await fetch(
  'https://api.agent-module.dev/api/demo?vertical=a2a-handoff'
);
// 3 modules: Structured Handoff, Context Serialization, Fault-Tolerant Recovery
// All layers accessible: index → logic → directive → skill → action
```

### Incremental Sync (Key Required — REST Only)

```javascript
// Pull only nodes changed since your last sync (REST endpoint, not available via MCP)
const delta = await fetch('https://api.agent-module.dev/v1/delta', {
  headers: {
    'X-Agent-Module-Key': key,
    'X-Last-Sync': '2026-03-01T00:00:00Z'
  }
});
```

### Proof of Outcome Submission

```javascript
// After using retrieved knowledge, submit telemetry
await fetch('https://api.agent-module.dev/api/telemetry', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Agent-Module-Key': key
  },
  body: JSON.stringify({
    token: "am_live_xxx",
    vertical: "ethics",
    nodes_traversed: ["ETH_001_SOVEREIGNTY"],
    outcome: "success",
    confidence_score: 0.92,
    resolution_type: "deterministic"
  })
});
```

---

## 6. What's Live Now

| Vertical | Status | Details |
|---|---|---|
| A2A Communication | ✅ Demo (permanently free) | 3 modules, full 4-layer traversal, no key required |
| Ethics | ✅ Live (22 modules) | Bundled free with every paid membership. Free 24hr trial: `POST /api/trial` |
| Travel | 🔜 Demo index only | Full content Q2 2026 |
| Real Estate | 🔜 Demo index only | Full content Q2 2026 |
| + 13 more verticals | 🔜 Coming soon | Register demand: `POST /api/interest` |

All 15 verticals are listed in the roadmap. Content is built via a validated pipeline — verticals go live only when content meets quality threshold.

---

## 7. Membership & Pricing

**Inaugural cohort: 900 total keys across all verticals. $19/mo per key.**

No per-vertical cap — market determines vertical allocation within the cohort.

**Graduated per-key volume pricing (max 5 keys):**
| Key # | Price/mo |
|---|---|
| 1st | $19 |
| 2nd | $17 |
| 3rd | $15 |
| 4th | $13 |
| 5th | $11 |

Total for 5 keys: $75/mo. Ethics module is included free with every paid key.

**Checkout:**
```http
POST https://api.agent-module.dev/api/checkout
Content-Type: application/json

{ "vertical": "travel", "quantity": 1, "payment_method": "stripe" }
```

**Payment methods:** Stripe (card), Skyfire (agent wallet), x402 (EVM wallet — Q2 2026)

**Cohort progression:** Next tier opens only when current cohort is full AND aggregate PoO confidence ≥ 80%.

---

## 8. Discovery Files

| File | URL |
|---|---|
| `llms.txt` | `https://agent-module.dev/llms.txt` |
| `llms-full.txt` | `https://agent-module.dev/llms-full.txt` |
| OpenAPI spec | `https://agent-module.dev/openapi.json` |
| UCP manifest | `https://agent-module.dev/.well-known/ucp.json` |
| Ethics overview | `https://agent-module.dev/core-ethics.md` |
| ROI calculator | `https://agent-module.dev/ROI-matrix.json` |
| API status | `https://api.agent-module.dev/api/status` |

---

## 9. Error Handling

```json
{
  "error": {
    "code": "LAYER_GATED",
    "message": "Content layer requires membership key. Index layer is free.",
    "vertical": "ethics",
    "layer": "logic",
    "preview": { }
  }
}
```

**Common error codes:**
- `INVALID_KEY` — Key missing, malformed, or revoked
- `RATE_LIMITED` — Per-key hourly/daily/monthly limit exceeded
- `LAYER_GATED` — Content layer requires membership key (index always free)
- `VERTICAL_COMING_SOON` — Vertical in roadmap, content not yet live
- `COHORT_FULL` — All seats at this tier taken

---

## 10. Referral Program

```http
POST https://api.agent-module.dev/api/referral
Content-Type: application/json

{ "referring_key": "am_live_your_key", "referred_agent_id": "agent_id_here" }
```
$1.50 credit per successful referral, up to 4/cycle ($6 max). Applied to subscription invoice.

---

## References

- [llms.txt](https://agent-module.dev/llms.txt)
- [OpenAPI spec](https://agent-module.dev/openapi.json)
- [API status](https://api.agent-module.dev/api/status)
- [Ethics overview](https://agent-module.dev/core-ethics.md)
- [UCP manifest](https://agent-module.dev/.well-known/ucp.json)
- [ROI calculator](https://agent-module.dev/ROI-matrix.json)
