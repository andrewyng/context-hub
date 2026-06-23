---
name: api
description: "API marketplace for AI agents — discover services by intent, call them through a proxy, and pay per use with pre-funded credits. Two endpoints: discover and proxy."
metadata:
  languages: "javascript,python"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-15"
  source: maintainer
  tags: "agentclear,api,marketplace,agents,discovery,proxy,microservices"
---
# AgentClear API

AgentClear is commerce infrastructure for AI agents. Agents discover services by intent (semantic search), call them through a secure proxy, and pay per use from a pre-funded balance.

**Base URL:** `https://agentclear.dev/api`

**Auth:** All requests require an API key in the `x-api-key` header:
```
x-api-key: axk_your_api_key
```

Get a key at [agentclear.dev](https://agentclear.dev). New accounts get $5 free credits.

## Two Endpoints

The entire API is two calls: **discover** (find a service) and **proxy** (call it).

### 1. Discover Services

Search by intent. Returns ranked matches with pricing, trust scores, and service IDs.

**POST** `/api/discover`

```json
{
  "query": "extract tables from a PDF",
  "max_results": 5,
  "min_trust_tier": "verified"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Natural language description of what you need |
| `max_results` | number | No | Max results to return (default: 5, max: 20) |
| `min_trust_tier` | string | No | Minimum trust level: `basic`, `verified`, or `premium` |

**Response:**

```json
{
  "results": [
    {
      "id": "1787babc-264b-40bf-8a5e-28e1dbf77810",
      "name": "pdf-table-extractor",
      "description": "Extracts structured tables from PDF documents",
      "price_per_call": "$0.003",
      "trust_tier": "verified",
      "relevance_score": 0.94,
      "provider": "acme-ai"
    }
  ]
}
```

### 2. Call a Service (Proxy)

Call any discovered service through the AgentClear proxy. Auth and billing are handled automatically.

**POST** `/api/proxy/{service_id}`

The request body is passed directly to the upstream service. Shape depends on the service.

```json
{
  "pdf_url": "https://example.com/document.pdf"
}
```

**Response:** Whatever the upstream service returns, passed through directly.

**Billing:** The per-call price is deducted from your balance automatically. If insufficient balance, you get a `402` error.

## JavaScript Examples

### Discover + Call

```javascript
const API_KEY = process.env.AGENTCLEAR_API_KEY; // axk_...
const BASE = "https://agentclear.dev/api";

// Step 1: Discover
const discovery = await fetch(`${BASE}/discover`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
  body: JSON.stringify({
    query: "get real-time stock quote",
    max_results: 3,
  }),
});

const { results } = await discovery.json();
const best = results[0];
console.log(`Using: ${best.name} ($${best.price_per_call}/call)`);

// Step 2: Call via proxy
const result = await fetch(`${BASE}/proxy/${best.id}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
  body: JSON.stringify({ symbol: "AAPL" }),
});

const data = await result.json();
console.log(data);
```

### With Error Handling

```javascript
async function agentClearCall(query, payload, options = {}) {
  const { maxResults = 3, minTrust = "basic" } = options;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.AGENTCLEAR_API_KEY,
  };

  // Discover
  const disco = await fetch("https://agentclear.dev/api/discover", {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      max_results: maxResults,
      min_trust_tier: minTrust,
    }),
  });

  if (!disco.ok) {
    throw new Error(`Discovery failed: ${disco.status} ${await disco.text()}`);
  }

  const { results } = await disco.json();
  if (!results.length) {
    throw new Error(`No services found for: "${query}"`);
  }

  // Call best match
  const service = results[0];
  const res = await fetch(
    `https://agentclear.dev/api/proxy/${service.id}`,
    { method: "POST", headers, body: JSON.stringify(payload) }
  );

  if (res.status === 402) {
    throw new Error("Insufficient AgentClear balance");
  }
  if (!res.ok) {
    throw new Error(`Proxy call failed: ${res.status} ${await res.text()}`);
  }

  return { service: service.name, data: await res.json() };
}

// Usage
const quote = await agentClearCall(
  "real-time stock quote",
  { symbol: "TSLA" },
  { minTrust: "verified" }
);
```

## Python Examples

### Discover + Call

```python
import httpx
import os

API_KEY = os.environ["AGENTCLEAR_API_KEY"]  # axk_...
BASE = "https://agentclear.dev/api"
HEADERS = {"Content-Type": "application/json", "x-api-key": API_KEY}

# Step 1: Discover
disco = httpx.post(f"{BASE}/discover", headers=HEADERS, json={
    "query": "get real-time stock quote",
    "max_results": 3,
})
disco.raise_for_status()
results = disco.json()["results"]
best = results[0]
print(f"Using: {best['name']} ({best['price_per_call']}/call)")

# Step 2: Call via proxy
resp = httpx.post(
    f"{BASE}/proxy/{best['id']}",
    headers=HEADERS,
    json={"symbol": "AAPL"},
)
resp.raise_for_status()
print(resp.json())
```

### With Error Handling

```python
import httpx
import os

class AgentClearError(Exception):
    pass

class InsufficientBalance(AgentClearError):
    pass

class NoServicesFound(AgentClearError):
    pass

def agentclear_call(query: str, payload: dict, max_results: int = 3, min_trust: str = "basic") -> dict:
    headers = {
        "Content-Type": "application/json",
        "x-api-key": os.environ["AGENTCLEAR_API_KEY"],
    }
    base = "https://agentclear.dev/api"

    # Discover
    disco = httpx.post(f"{base}/discover", headers=headers, json={
        "query": query,
        "max_results": max_results,
        "min_trust_tier": min_trust,
    })
    disco.raise_for_status()
    results = disco.json()["results"]

    if not results:
        raise NoServicesFound(f'No services found for: "{query}"')

    # Call best match
    service = results[0]
    resp = httpx.post(f"{base}/proxy/{service['id']}", headers=headers, json=payload)

    if resp.status_code == 402:
        raise InsufficientBalance("Insufficient AgentClear balance")
    resp.raise_for_status()

    return {"service": service["name"], "data": resp.json()}

# Usage
quote = agentclear_call("real-time stock quote", {"symbol": "TSLA"}, min_trust="verified")
```

## MCP Server

AgentClear also has an MCP server for Claude, Cursor, and other MCP-compatible agents:

```
https://agentclear-mcp-server.onrender.com/sse
```

Add to your MCP config and agents get `discover` and `proxy` as native tools.

## Error Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `400` | Bad request (missing/invalid params) |
| `401` | Invalid or missing API key |
| `402` | Insufficient balance |
| `404` | Service ID not found |
| `429` | Rate limited |
| `500` | Upstream service error |
| `502` | Upstream service unreachable |

## Key Concepts

- **Discovery is semantic** — describe what you need in plain English, not keywords. Vector similarity finds the best match.
- **Pricing is per-call** — each service sets its own price (typically $0.002–$0.01). Deducted from your pre-funded balance.
- **Trust tiers** — `basic` (registered), `verified` (security scanned), `premium` (sandboxed + audited). Higher trust = ranked higher in discovery.
- **Auto-bounties** — if no service matches your query, a bounty is automatically created signaling demand to providers.
- **Proxy is transparent** — request body goes to the upstream service as-is. Response comes back as-is. AgentClear handles auth and billing in between.
