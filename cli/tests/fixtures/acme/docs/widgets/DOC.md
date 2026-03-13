---
name: widgets
description: "Acme widget API for creating and managing widgets"
metadata:
  languages: "javascript"
  versions: "2.0.0"
  updated-on: "2026-01-01"
  source: maintainer
  tags: "acme,widgets,api"
---

# Acme Widgets API

Create and manage widgets with the Acme SDK.

## Installation

```bash
npm install @acme/widgets
```

## Quick Start

```javascript
import { Acme } from '@acme/widgets';
const client = new Acme({ apiKey: process.env.ACME_KEY });
const widget = await client.widgets.create({ name: 'My Widget' });
```

## See Also

- [Advanced usage](references/advanced.md)
