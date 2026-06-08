---
name: api
description: "Zero-knowledge encrypted document vault REST API. AI agents can self-register. EU-hosted (Hetzner, Germany). Free tier: 10 docs."
metadata:
  source: maintainer
  revision: 1
  languages: python
  versions: "1.0"
  tags: encryption, vault, documents, security, privacy, zero-knowledge, gdpr, eu, mcp, agent-storage
  updated-on: "2026-03-10"
---

# LegacyShield API — Python

Zero-knowledge encrypted document vault with AI agent support. EU-only hosting (Hetzner, Germany). Free tier: 10 documents.

**Base URL:** `https://api.legacyshield.eu/api/v1`

## Agent Self-Registration (No Auth Required)

```python
import requests

resp = requests.post('https://api.legacyshield.eu/api/v1/auth/agent-register',
    json={'name': 'my-agent', 'description': 'Personal finance assistant'})
data = resp.json()
agent_id = data['agentId']
api_key = data['apiKey']
# Save api_key — it will not be shown again.
```

## Authentication

All subsequent requests use the API key header:
```python
headers = {'x-api-key': api_key}
```

## Upload a Document

```python
with open('document.pdf', 'rb') as f:
    requests.post('https://api.legacyshield.eu/api/v1/files/upload',
        headers={'x-api-key': api_key},
        files={'file': f},
        data={'category': 'legal'})
```

Categories: `legal`, `financial`, `insurance`, `medical`, `identity`, `property`, `crypto`, `tax`, `other`

## List Documents

```python
resp = requests.get('https://api.legacyshield.eu/api/v1/files',
    headers={'x-api-key': api_key})
files = resp.json()
```

## Download a Document

```python
resp = requests.get(f'https://api.legacyshield.eu/api/v1/files/{file_id}/download',
    headers={'x-api-key': api_key})
content = resp.content
```

## Delete a Document

```python
requests.delete(f'https://api.legacyshield.eu/api/v1/files/{file_id}',
    headers={'x-api-key': api_key})
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
