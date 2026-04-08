---
name: rates
description: "Banco Central do Brasil (BACEN) open data API - SELIC rate, exchange rates, IPCA inflation"
metadata:
  languages: "javascript"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-04-08"
  source: community
  tags: "bacen,brazil,selic,exchange-rate,inflation,central-bank"
---

# BACEN - Banco Central do Brasil Open Data API (JavaScript)

## Golden Rule

BACEN's open data API is **free, no auth required**. Base URL: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados`

Data is identified by **series codes** (SGS). Key codes:

| Code | Series |
|------|--------|
| 432 | SELIC rate (daily) |
| 1 | USD/BRL exchange rate (buy) |
| 10813 | USD/BRL exchange rate (sell) |
| 433 | IPCA inflation (monthly) |
| 4390 | CDI rate (daily) |
| 226 | TR rate |
| 25434 | EUR/BRL exchange rate |

---

## Fetch SELIC Rate

```javascript
async function getSELIC(last = 10) {
  const response = await fetch(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/${last}?formato=json`
  );
  return response.json();
}

// Usage
const selic = await getSELIC(5);
// [{ "data": "02/04/2026", "valor": "0.053846" }, ...]
// valor = daily rate as string (annualized SELIC / 252 business days)
```

## Fetch Exchange Rate (USD/BRL)

```javascript
async function getUSDtoBRL(last = 10) {
  const response = await fetch(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/${last}?formato=json`
  );
  return response.json();
}

// Usage
const rates = await getUSDtoBRL(1);
// [{ "data": "07/04/2026", "valor": "5.6723" }]
```

## Fetch by Date Range

```javascript
async function getSeriesByDateRange(code, startDate, endDate) {
  // Dates in DD/MM/YYYY format
  const response = await fetch(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=${startDate}&dataFinal=${endDate}`
  );
  return response.json();
}

// IPCA inflation Jan-Dec 2025
const ipca = await getSeriesByDateRange(433, '01/01/2025', '31/12/2025');
// [{ "data": "01/01/2025", "valor": "0.16" }, ...]
// valor = monthly % change
```

## PTAX Exchange Rate (official)

PTAX is the official exchange rate published daily by BACEN. Used for contracts and tax calculations.

```javascript
async function getPTAX(date) {
  // date format: MM-DD-YYYY
  const response = await fetch(
    `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${date}'&$format=json`
  );
  const data = await response.json();
  return data.value;
}

// Usage
const ptax = await getPTAX('04-07-2026');
// [{ "cotacaoCompra": 5.6712, "cotacaoVenda": 5.6718,
//    "dataHoraCotacao": "2026-04-07 13:09:15.147" }]
```

## Response Shape (SGS API)

```javascript
[
  {
    "data": "DD/MM/YYYY",  // Brazilian date format
    "valor": "0.053846"     // Value as string
  }
]
```

**Always** parse `valor` as float: `parseFloat(item.valor)`.

**Always** parse `data` as Brazilian format (DD/MM/YYYY):

```javascript
function parseBACENDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
}
```

## Useful Calculations

### Annualized SELIC from daily rate

```javascript
function annualizedSELIC(dailyRate) {
  return (Math.pow(1 + parseFloat(dailyRate), 252) - 1) * 100;
}
```

### Accumulated IPCA over period

```javascript
function accumulatedIPCA(monthlyRates) {
  return monthlyRates.reduce((acc, r) => {
    return acc * (1 + parseFloat(r.valor) / 100);
  }, 1) - 1;
}
```

## Error Handling

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success (may return empty array if no data for range) |
| 404 | Invalid series code |
| 500 | BACEN service unavailable (retry later) |

## Important Notes

- BACEN API returns dates in `DD/MM/YYYY` format (Brazilian standard).
- Values are always strings. Parse with `parseFloat()`.
- Exchange rates are only published on business days (no weekends/holidays).
- SELIC daily rate = annual rate / 252 (business days in a year).
- The PTAX endpoint uses a different base URL (`olinda.bcb.gov.br`).
- No rate limiting documented, but add 500ms delay for bulk queries.
- Data is typically available by 8 PM BRT for the current business day.
