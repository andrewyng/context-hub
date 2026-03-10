---
name: api
description: "Zero-knowledge encrypted document vault REST API. AI agents can self-register. EU-hosted (Hetzner, Germany). Free tier: 10 docs."
metadata:
  source: maintainer
  languages: js, py
  versions: "1.0"
  tags: encryption, vault, documents, security, privacy, zero-knowledge, gdpr, eu, mcp, agent-storage
  updated-on: "2026-03-10"
---

# LegacyShield API

Zero-knowledge encrypted document vault with AI agent support. EU-only hosting (Hetzner, Germany). Free tier: 10 documents.

**Base URL:** `https://api.legacyshield.eu/api/v1`

## Agent Self-Registration (No Auth Required)

```bash
curl -X POST https://api.legacyshield.eu/api/v1/auth/agent-register \
  -H "Content-Type: application/json" \
  -d '{"name": "my-agent", "description": "Personal finance assistant"}'
```

Response:
```json
{
  "agentId": "a1b2c3d4-...",
  "apiKey": "ls_abc123...",
  "message": "Agent registered. Save this API key — it will not be shown again."
}
```

## Authentication

All subsequent requests use the API key header:
```
x-api-key: ls_abc123...
```

## Upload a Document

```bash
curl -X POST https://api.legacyshield.eu/api/v1/files/upload \
  -H "x-api-key: ls_abc123..." \
  -F "file=@document.pdf" \
  -F "category=legal"
```

Categories: `legal`, `financial`, `insurance`, `medical`, `identity`, `property`, `crypto`, `tax`, `other`

## List Documents

```bash
curl https://api.legacyshield.eu/api/v1/files \
  -H "x-api-key: ls_abc123..."
```

## Download a Document

```bash
curl https://api.legacyshield.eu/api/v1/files/:id/download \
  -H "x-api-key: ls_abc123..."
```

## Delete a Document

```bash
curl -X DELETE https://api.legacyshield.eu/api/v1/files/:id \
  -H "x-api-key: ls_abc123..."
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

## JavaScript Quick Start

```javascript
// Register
const res = await fetch('https://api.legacyshield.eu/api/v1/auth/agent-register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'my-agent' })
});
const { apiKey } = await res.json();

// Upload
const form = new FormData();
form.append('file', fileBlob, 'notes.txt');
form.append('category', 'other');
await fetch('https://api.legacyshield.eu/api/v1/files/upload', {
  method: 'POST',
  headers: { 'x-api-key': apiKey },
  body: form
});
```

## Python Quick Start

```python
import requests

# Register
resp = requests.post('https://api.legacyshield.eu/api/v1/auth/agent-register',
    json={'name': 'my-agent'})
api_key = resp.json()['apiKey']

# Upload
with open('notes.txt', 'rb') as f:
    requests.post('https://api.legacyshield.eu/api/v1/files/upload',
        headers={'x-api-key': api_key},
        files={'file': f},
        data={'category': 'other'})
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
