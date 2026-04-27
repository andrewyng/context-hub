name: intelligence-api
description: "Wolfpack Intelligence — on-chain token security, risk analysis, and market intelligence API for Base chain. 15 services via x402 micropayments."
metadata:
  versions: "2.5.0"
  revision: 2
  updated-on: "2026-03-29"
  source: maintainer
  tags: "crypto,security,base,defi,token,risk,attestation,erc-8183,x402,mcp,a2a,agents,micropayments,model-context-protocol"
---

# Wolfpack Intelligence API

On-chain security and market intelligence for AI agents on Base. 15 services via x402 micropayments (USDC on Base), MCP, and Google A2A.

Base URL: `https://api.wolfpack.roklabs.dev`

## Quick Start — Token Security Check
```bash
curl -X POST https://api.wolfpack.roklabs.dev/api/v1/intelligence/security-check \
  -H "Content-Type: application/json" \
  -d '{"token_address": "0x4ed4E862860BeD51a9570b96d89aF5E1B0Efefed"}'
```

Response (nested `checks` object with 13 boolean fields):
```json
{
  "token_address": "0x4ed4E862860BeD51a9570b96d89aF5E1B0Efefed",
  "chain": "base",
  "safe": true,
  "checks": {
    "is_honeypot": false,
    "verified_source": true,
    "hidden_owner": false,
    "can_take_back_ownership": false,
    "is_proxy": false,
    "is_mintable": false,
    "selfdestruct": false,
    "owner_change_balance": false,
    "is_blacklisted": false,
    "is_open_source": true,
    "external_call": false,
    "transfer_pausable": false,
    "trading_cooldown": false
  },
  "holder_count": 45000,
  "top10_holder_percent": 32.5,
  "creator_percent": 0.0,
  "risk_flags": [],
  "holder_concentration_status": { "available": true },
  "raw_available": true,
  "analysis_timestamp": "2026-03-29T09:00:00.000Z",
  "powered_by": "Wolfpack Intelligence v2"
}
```

## Quick Start — Token Risk Analysis
```bash
curl -X POST https://api.wolfpack.roklabs.dev/api/v1/intelligence/token-risk \
  -H "Content-Type: application/json" \
  -d '{"token_address": "0x4ed4E862860BeD51a9570b96d89aF5E1B0Efefed", "chain": "base"}'
```

Returns a 360° risk audit: honeypot detection, liquidity analysis, holder concentration, smart money activity, social signals, and an overall risk score with nested `checks` sub-objects.

## Services

| Endpoint | Service | Price | Latency |
|----------|---------|-------|---------|
| `POST /api/v1/intelligence/security-check` | GoPlus honeypot, contract verification, ownership | $0.01 | <1s |
| `POST /api/v1/intelligence/token-risk` | Multi-source risk audit (GoPlus + DexScreener + Dune + social) | $0.02 | 3-5s |
| `POST /api/v1/intelligence/narrative-score` | Social momentum scoring (Twitter/X sentiment, KOL ratio) | $0.05 | 2-4s |
| `POST /api/v1/intelligence/token-market-snapshot` | DexScreener price, volume, liquidity, buy/sell ratio | $0.25 | <1s |
| `POST /api/v1/intelligence/agent-trust` | Agent reliability rating (ACP performance, sybil detection) | $0.50 | 2-3s |
| `POST /api/v1/intelligence/il-calculator` | Impermanent loss for AMM and concentrated V3 positions | $0.50 | <1s |
| `POST /api/v1/intelligence/smart-money-signals` | Smart money wallet activity on Base (Nansen + Dune) | $1.00 | 2-3s |
| `POST /api/v1/intelligence/prediction-market` | Polymarket crypto odds and volume | $1.00 | 1-2s |
| `POST /api/v1/intelligence/yield-scanner` | IL-adjusted Base yield opportunities (DefiLlama) | $1.00 | 2-3s |
| `POST /api/v1/intelligence/technical-analysis` | RSI, SMA, Bollinger, support/resistance (GeckoTerminal OHLCV) | $1.00 | 2-3s |
| `POST /api/v1/intelligence/agent-credit-risk` | Financial credit risk scoring for ACP agents | $1.00 | 2-3s |
| `POST /api/v1/intelligence/trade-signals` | Execution-ready signals with TP/SL from 5 upstream sources | $2.00 | 3-5s |
| `POST /api/v1/intelligence/mega-report` | Cross-service synthesis with overall signal | $5.00 | 5-8s |
| `POST /api/v1/intelligence/graduation-readiness-check` | Live graduation readiness audit with test fires | $5.00 | 3-5s |
| `POST /api/v1/intelligence/query` | Unified router — pass `service_type` in body (includes `agent_audit` at $15.00) | varies | varies |

All endpoints accept JSON POST. Payment is via x402 (USDC on Base), processed automatically per-call.

## Signed Attestations (EIP-712)

Three services return cryptographically signed attestations for on-chain verification. Add `"attestation": true` to the request body:
```bash
curl -X POST https://api.wolfpack.roklabs.dev/api/v1/intelligence/security-check \
  -H "Content-Type: application/json" \
  -d '{"token_address": "0x4ed4E862860BeD51a9570b96d89aF5E1B0Efefed", "attestation": true}'
```

Supported services: `security-check`, `token-risk`, `agent-trust`.

Response includes the service result plus an EIP-712 signed envelope:
```json
{
  "result": { "safe": true, "checks": { "..." }, "risk_flags": [] },
  "attestation": {
    "evaluation": {
      "subject": "0x4ed4...",
      "service": "security_check",
      "verdict": "PASS",
      "score": 10000,
      "timestamp": 1711234567,
      "nonce": 42
    },
    "signature": "0x...",
    "messageHash": "0x...",
    "signer": "0x6887...1AEA",
    "domain": { "name": "WolfpackIntelligence", "version": "1", "chainId": 8453 }
  }
}
```

Any smart contract can verify the signature on-chain using standard EIP-712 recovery. This enables Wolfpack to serve as an ERC-8183 evaluator — signed verification that downstream contracts can trust.

## MCP Server

Connect any MCP-compatible client (Claude Desktop, Cursor) to Wolfpack:
```json
{
  "mcpServers": {
    "wolfpack-intelligence": {
      "transport": "streamable-http",
      "url": "https://api.wolfpack.roklabs.dev/api/v1/mcp"
    }
  }
}
```

10 tools available. Server card: `https://api.wolfpack.roklabs.dev/.well-known/mcp/server-card.json`

## Google A2A

JSON-RPC 2.0 endpoint: `POST https://api.wolfpack.roklabs.dev/api/v1/a2a`
Agent card: `https://api.wolfpack.roklabs.dev/.well-known/agent.json`
14 skills available.

## Free Resources (no payment required)

| Endpoint | Returns |
|----------|---------|
| `GET /api/v1/resources/latest-narrative-signals` | Top narratives ranked by momentum |
| `GET /api/v1/resources/token-safety-quick-list` | Recent GoPlus scans with safety scores |
| `GET /api/v1/resources/whale-watch-summary` | 24h smart money summary on Base |

## Common Input Patterns

Most token services accept:
```json
{
  "token_address": "0x...",
  "chain": "base"
}
```

The `agent_trust_score` service accepts:
```json
{
  "agent_address": "0x...",
  "agent_id": 1888
}
```

The `smart_money_signals` service accepts (all optional):
```json
{
  "token_address": "0x...",
  "limit": 10,
  "timeframe": "24h"
}
```

## Links

- npm: https://www.npmjs.com/package/wolfpack-intelligence
- SDK: https://github.com/rok-labs/wolfpack-sdk
- Health: https://api.wolfpack.roklabs.dev/api/health
- MCP Registry: https://registry.modelcontextprotocol.io
- Virtuals ACP: https://app.virtuals.io/acp/agent/1888
```
