---
name: cep
description: "BrasilAPI CEP lookup - free Brazilian postal code to address resolution"
metadata:
  languages: "javascript"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-04-08"
  source: community
  tags: "brasilapi,cep,brazil,address,postal,zipcode"
---

# BrasilAPI - CEP Lookup (JavaScript)

## Golden Rule

BrasilAPI CEP uses **multiple providers** (Correios, ViaCEP, WideNet) with automatic fallback. No API key needed.

Use **v2** endpoint for better reliability (multi-provider).

---

## CEP Lookup (v2 - recommended)

```javascript
async function lookupCEP(cep) {
  const cleanCep = cep.replace(/\D/g, '');

  const response = await fetch(
    `https://brasilapi.com.br/api/cep/v2/${cleanCep}`
  );

  if (!response.ok) {
    if (response.status === 404) throw new Error('CEP not found');
    throw new Error(`BrasilAPI error: ${response.status}`);
  }

  return response.json();
}

// Usage
const address = await lookupCEP('01310-100');
```

## Response Shape

```javascript
{
  "cep": "01310100",
  "state": "SP",
  "city": "São Paulo",
  "neighborhood": "Bela Vista",
  "street": "Avenida Paulista",
  "service": "correios",
  "location": {
    "type": "Point",
    "coordinates": {
      "longitude": "-46.6533521",
      "latitude": "-23.5632025"
    }
  }
}
```

## Key Fields

| Field | Description |
|-------|-------------|
| `cep` | 8-digit postal code (no dash) |
| `state` | 2-letter state abbreviation (UF) |
| `city` | City name |
| `neighborhood` | Neighborhood (bairro) |
| `street` | Street name (may be empty for range CEPs) |
| `service` | Provider that resolved: `correios`, `viacep`, `widenet` |
| `location` | GeoJSON point with lat/lng (v2 only, may be null) |

## v1 vs v2

| Feature | v1 | v2 |
|---------|----|----|
| Endpoint | `/api/cep/v1/{cep}` | `/api/cep/v2/{cep}` |
| Providers | Single | Multi-provider fallback |
| Coordinates | No | Yes (when available) |
| Reliability | Lower | Higher |

## Address Autocomplete Pattern

```javascript
// Auto-fill address form when user types CEP
async function onCepInput(cepInput) {
  const cep = cepInput.replace(/\D/g, '');
  if (cep.length !== 8) return;

  try {
    const addr = await lookupCEP(cep);
    document.getElementById('state').value = addr.state;
    document.getElementById('city').value = addr.city;
    document.getElementById('neighborhood').value = addr.neighborhood;
    document.getElementById('street').value = addr.street || '';
  } catch (e) {
    console.warn('CEP not found:', cep);
  }
}
```

## CEP Format Validation

```javascript
function isValidCEPFormat(cep) {
  return /^\d{5}-?\d{3}$/.test(cep);
}

function formatCEP(cep) {
  const clean = cep.replace(/\D/g, '');
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}
```

## Error Handling

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 404 | CEP not found across all providers |
| 500 | All upstream providers failed |

## Important Notes

- CEP is always 8 digits. Format: `XXXXX-XXX`.
- Range CEPs (e.g., `01000-000`) return city/state but no street.
- Coordinates are not available for all CEPs (mainly urban areas).
- New streets/neighborhoods may take weeks to appear in providers.
- For bulk lookups, add a 500ms delay between requests.

## Brazilian States (UF Reference)

```
AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO
```
