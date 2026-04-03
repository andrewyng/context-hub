---
name: mercadolibre-api
description: "How to integrate and call MercadoLibre REST API endpoints from JavaScript and Node.js"
metadata:
  languages: "javascript,typescript"
  versions: "1.0"
  source: community
  tags: "api,rest,ecommerce,mercadolibre"
  updated-on: "2026-04-02"
---

# MercadoLibre API in JavaScript

You can consume the MercadoLibre API directly using standard HTTP clients like `fetch` (built-in to Node.js 18+ and browsers) or libraries like `axios`.

## Authentication

All private endpoints require an OAuth2 bearer token:

```javascript
const ACCESS_TOKEN = process.env.MELI_ACCESS_TOKEN;

const headers = {
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
};
```

## Get Item Details

Fetching an item is a simple `GET` request:

```javascript
async function getItem(itemId) {
  const url = `https://api.mercadolibre.com/items/${itemId}`;
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Example usage:
// const item = await getItem("MLA123456789");
// console.log(item.title, item.price);
```

## Multi-Item Batch Fetching

You can fetch up to 20 items in a single request:

```javascript
async function getItemsBatch(itemIds) {
  const url = new URL('https://api.mercadolibre.com/items');
  url.searchParams.append('ids', itemIds.join(','));
  url.searchParams.append('attributes', 'id,title,price,status');

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  
  return await response.json();
}
```

## Common Pitfalls
- Always use the `Bearer` prefix in the `Authorization` header.
- Token refresh must be handled manually when the `expires_in` timeframe passes (usually 6 hours).
- Limit batch queries via `/items` strictly to a maximum of 20 IDs.
