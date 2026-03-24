---
name: intelligence-api
description: "Wolfpack Intelligence — on-chain token security, risk analysis, and market intelligence API for Base chain. 14 services via x402 micropayments."
metadata:
  versions: "2.4.0"
  revision: 1
  updated-on: "2026-03-23"
  source: maintainer
  tags: "crypto,security,base,defi,token,risk,attestation,erc-8183,x402,mcp,a2a,agents"
---

# Wolfpack Intelligence API

On-chain security and market intelligence for AI agents on Base. 14 services via x402 micropayments (USDC on Base), MCP, and Google A2A.

Base URL: `https://api.wolfpack.roklabs.dev`

## Quick Start — Token Security Check
```bash
curl -X POST https://api.wolfpack.roklabs.dev/api/v1/intelligence/security-check \
  -H "Content-Type: application/json" \
  -d '{"token_address": "0x4ed4E862860BeD51a9570b96d89aF5E1B0Efefed"}'
```

Response:
```json
{
  "safe": true,
  "honeypot": false,
  "verified_source": true,
  "hidden_owner": false,
  "holder_count": 45000,
  "top10_holder_percent": 32.5,
  "risk_flags": []
}
```

## Quick Start — Token Risk Analysis
```bash
curl -X POST https://api.wolfpack.roklabs.dev/api/v1/intelligence/token-risk \
  -H "Content-Type: application/json" \
  -d '{"token_address": "0x4ed4E862860BeD51a9570b96d89aF5E1B0Efefed", "chain": "base"}'
```

Returns a 360° risk audit: honeypot detection, liquidity analysis, holder concentration, smart money activity, social signals, and an overall risk score.

## Services

| Endpoint | Service | Price | Latency |
|----------|---------|-------|---------|
| `POST /api/v1/intelligence/security-check` | GoPlus honeypot, contract verification, ownership | $0.01 | <1s |
| `POST /api/v1/intelligence/token-risk` | Multi-source risk audit (GoPlus + DexScreener + Dune + social) | $0.02 | 3-5s |
| `POST /api/v1/intelligence/narrative-score` | Social momentum scoring (Twitter/X sentiment, KOL ratio) | $0.05 | 2-4s |
| `POST /api/v1/intelligence/agent-trust` | Agent reliability rating (ACP performance, sybil detection) | $0.50 | 2-3s |
| `POST /api/v1/intelligence/smart-money` | Smart money wallet activity on Base (Nansen + Dune) | $1.00 | 2-3s |
| `POST /api/v1/intelligence/market-snapshot` | DexScreener price, volume, liquidity, buy/sell ratio | $0.25 | <1s |
| `POST /api/v1/intelligence/mega-report` | Cross-service synthesis with overall signal | $5.00 | 8-12s |
| `POST /api/v1/intelligence/technical-analysis` | RSI, SMA, Bollinger, support/resistance (GeckoTerminal OHLCV) | $1.00 | 2-3s |
| `POST /api/v1/intelligence/trade-signals` | Execution-ready signals with TP/SL from 5 upstream sources | $2.00 | 5-8s |
| `POST /api/v1/intelligence/prediction-market` | Polymarket crypto odds and volume | $1.00 | 1-2s |
| `POST /api/v1/intelligence/il-calculator` | Impermanent loss for AMM and concentrated V3 positions | $0.50 | <1s |
| `POST /api/v1/intelligence/yield-scanner` | IL-adjusted Base yield opportunities (DefiLlama) | $1.00 | 2-3s |
| `POST /api/v1/intelligence/agent-credit-risk` | Financial credit risk scoring for ACP agents | $1.00 | 2-3s |
| `POST /api/v1/intelligence/graduation-check` | Live graduation readiness audit with test fires | $5.00 | 15-30s |
| `POST /api/v1/intelligence/query` | Unified router — pass `service_type` in body | varies | varies |

All endpoints accept JSON POST. Payment is via x402 (USDC on Base), processed automatically per-call.

## Signed Attestations (EIP-712)

Three services return cryptographically signed attestations for on-chain verification. Add `"attestation": true` to the request body:
```bash
curl -X POST https://api.wolfpack.roklabs.dev/api/v1/intelligence/security-check \
  -H "Content-Type: application/json" \
  -d '{"token_address": "0x4ed4E862860BeD51a9570b96d89aF5E1B0Efefed", "attestation": true}'
```

Supported services: `security-check`, `token-risk`, `agent-trust`.

Response includes the service result plus an EIP-712 signed envelope with `signature`, `signer`, `domain`, `types`, and `message`. Any smart contract can verify the signature on-chain using standard EIP-712 recovery.

This enables Wolfpack to serve as an ERC-8183 evaluator — signed verification that downstream contracts can trust.

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

- SDK: https://github.com/rok-labs/wolfpack-sdk
- Health: https://api.wolfpack.roklabs.dev/api/health
- MCP Registry: https://registry.modelcontextprotocol.io
- Virtuals ACP: https://app.virtuals.io/acp/agent/1888
