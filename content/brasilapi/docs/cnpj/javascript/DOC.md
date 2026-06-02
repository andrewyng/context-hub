---
name: cnpj
description: "BrasilAPI CNPJ lookup - free Brazilian company registry data (Receita Federal)"
metadata:
  languages: "javascript"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-04-08"
  source: community
  tags: "brasilapi,cnpj,brazil,company,receita-federal"
---

# BrasilAPI - CNPJ Lookup (JavaScript)

## Golden Rule

BrasilAPI is a **free, open-source** REST API. No API key needed. Base URL: `https://brasilapi.com.br/api`

Rate limit: be respectful, no official limit but add delays for bulk queries.

---

## CNPJ Lookup

Fetches company data from Receita Federal (Brazilian IRS).

```javascript
async function lookupCNPJ(cnpj) {
  // Remove formatting (dots, slashes, dashes)
  const cleanCnpj = cnpj.replace(/\D/g, '');

  const response = await fetch(
    `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`
  );

  if (!response.ok) {
    if (response.status === 404) throw new Error('CNPJ not found');
    throw new Error(`BrasilAPI error: ${response.status}`);
  }

  return response.json();
}

// Usage
const company = await lookupCNPJ('19.131.243/0001-97');
```

## Response Shape

```javascript
{
  "cnpj": "19131243000197",
  "razao_social": "OPEN KNOWLEDGE BRASIL",
  "nome_fantasia": "REDE PELO CONHECIMENTO LIVRE",
  "descricao_situacao_cadastral": "ATIVA",
  "data_situacao_cadastral": "2013-10-03",
  "cnae_fiscal": 9430800,
  "cnae_fiscal_descricao": "Atividades de associações de defesa de direitos sociais",
  "cnaes_secundarios": [
    {
      "codigo": 9493600,
      "descricao": "Atividades de organizações associativas ligadas à cultura e à arte"
    }
  ],
  "natureza_juridica": "Associação Privada",
  "logradouro": "HADDOCK LOBO",
  "numero": "595",
  "complemento": "CONJ 7",
  "bairro": "CERQUEIRA CESAR",
  "cep": "01414001",
  "uf": "SP",
  "municipio": "SAO PAULO",
  "porte": "DEMAIS",
  "data_inicio_atividade": "2013-10-03",
  "capital_social": 0,
  "qsa": [
    {
      "identificador_de_socio": 2,
      "nome_socio": "FERNANDA CAMPAGNUCCI PEREIRA",
      "cnpj_cpf_do_socio": "",
      "qualificacao_socio": "Presidente",
      "data_entrada_sociedade": "2021-08-19"
    }
  ]
}
```

## Key Fields

| Field | Description |
|-------|-------------|
| `razao_social` | Legal company name |
| `nome_fantasia` | Trade name (DBA) |
| `descricao_situacao_cadastral` | Status: ATIVA, BAIXADA, INAPTA, SUSPENSA |
| `cnae_fiscal` | Primary activity code (CNAE) |
| `cnae_fiscal_descricao` | Primary activity description |
| `cnaes_secundarios` | Secondary activity codes |
| `qsa` | Partners/shareholders list |
| `capital_social` | Registered capital (BRL) |
| `porte` | Size: ME, EPP, DEMAIS |
| `natureza_juridica` | Legal entity type |

## CNPJ Validation (client-side)

```javascript
function isValidCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const calcDigit = (slice, weights) => {
    const sum = slice.split('').reduce((acc, d, i) => acc + d * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calcDigit(cnpj.slice(0, 12), weights1);
  const d2 = calcDigit(cnpj.slice(0, 13), weights2);

  return cnpj[12] == d1 && cnpj[13] == d2;
}
```

## Error Handling

```javascript
// BrasilAPI returns structured errors
{
  "name": "CnpjPromiseError",
  "message": "CNPJ 00000000000000 não encontrado",
  "type": "CNPJ_NOT_FOUND"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 404 | CNPJ not found in Receita Federal |
| 500 | Upstream provider error (retry later) |

## Important Notes

- CNPJ is always 14 digits. Format: `XX.XXX.XXX/XXXX-XX`.
- Data comes from Receita Federal's public database. Updates can lag days/weeks.
- `qsa` (Quadro de Sócios e Administradores) may be empty for some entity types.
- For bulk lookups, add a 1-second delay between requests.
