---
name: api
description: "Zero-knowledge encrypted document vault REST API. AI agents can self-register. EU-hosted (Hetzner, Germany). Free tier: 10 docs."
metadata:
  source: maintainer
  revision: 1
  languages: javascript
  versions: "1.0"
  tags: encryption, vault, documents, security, privacy, zero-knowledge, gdpr, eu, mcp, agent-storage
  updated-on: "2026-03-10"
---

# LegacyShield API — JavaScript

Zero-knowledge encrypted document vault with AI agent support. EU-only hosting (Hetzner, Germany). Free tier: 10 documents.

**Base URL:** `https://api.legacyshield.eu/api/v1`

## Agent Self-Registration (No Auth Required)

```javascript
const res = await fetch('https://api.legacyshield.eu/api/v1/auth/agent-register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'my-agent', description: 'Personal finance assistant' })
});
const { agentId, apiKey } = await res.json();
// Save apiKey — it will not be shown again.
```

## Authentication

All subsequent requests use the API key header:
```javascript
const headers = { 'x-api-key': apiKey };
```

## Upload a Document

```javascript
const form = new FormData();
form.append('file', fileBlob, 'document.pdf');
form.append('category', 'legal');

await fetch('https://api.legacyshield.eu/api/v1/files/upload', {
  method: 'POST',
  headers: { 'x-api-key': apiKey },
  body: form
});
```

Categories: `legal`, `financial`, `insurance`, `medical`, `identity`, `property`, `crypto`, `tax`, `other`

## List Documents

```javascript
const res = await fetch('https://api.legacyshield.eu/api/v1/files', {
  headers: { 'x-api-key': apiKey }
});
const files = await res.json();
```

## Download a Document

```javascript
const res = await fetch(`https://api.legacyshield.eu/api/v1/files/${fileId}/download`, {
  headers: { 'x-api-key': apiKey }
});
const blob = await res.blob();
```

## Delete a Document

```javascript
await fetch(`https://api.legacyshield.eu/api/v1/files/${fileId}`, {
  method: 'DELETE',
  headers: { 'x-api-key': apiKey }
});
```

## MCP Server Integration

For Claude Desktop, OpenClaw, or any MCP client:

```json
{
  "mcpServers": {
    "legacy-shield": {
      "command": "npx",
      "args": ["-y", "@legacy-shield/mcp-server"],
      "env": {
        "LEGACY_SHIELD_API_KEY": "YOUR_API_KEY",
        "LEGACY_SHIELD_API_URL": "https://api.legacyshield.eu/api/v1"
      }
    }
  }
}
```

## Key Features

- **Zero-Knowledge Encryption:** AES-256-GCM, client-side encryption. We never see your data.
- **Agent Isolation:** Agents cannot access each other's files.
- **EU-Only Hosting:** Hetzner, Germany. No US CLOUD Act exposure.
- **GDPR-Native:** Built for European data residency.
- **Emergency Access:** Human users can designate trusted contacts.
- **Free Tier:** 10 documents, 10MB per file. No credit card required.

## Links

- Website: https://legacyshield.eu
- Agent Docs: https://legacyshield.eu/agents
- LLM Instructions: https://legacyshield.eu/llms.txt
