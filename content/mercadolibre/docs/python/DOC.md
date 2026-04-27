---
name: mercadolibre-api
description: "How to integrate and call MercadoLibre REST API endpoints from Python"
metadata:
  languages: "python"
  versions: "1.0"
  source: community
  tags: "api,rest,ecommerce,mercadolibre"
  updated-on: "2026-04-02"
---

# MercadoLibre API in Python

Python integrates easily with the MercadoLibre API via the standard `requests` library or asynchronous alternatives like `aiohttp` or `httpx`.

## Authentication

Set up your headers with your OAuth access token:

```python
import os
import requests

ACCESS_TOKEN = os.getenv("MELI_ACCESS_TOKEN")
BASE_URL = "https://api.mercadolibre.com"

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}
```

## Get Item Details

Fetching item data is quick and straightforward with `requests`:

```python
def get_item(item_id: str) -> dict:
    url = f"{BASE_URL}/items/{item_id}"
    response = requests.get(url, headers=headers)
    
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    # item = get_item("MLA123456789")
    # print(item["title"], item["price"])
    pass
```

## Multi-Item Batch Fetching

Fetching multiple items simultaneously using IDs is optimal for minimizing HTTP roundtrips (max 20 at a time):

```python
def get_items_batch(item_ids: list) -> list:
    url = f"{BASE_URL}/items"
    params = {
        "ids": ",".join(item_ids),
        "attributes": "id,title,price,status"
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()
```

## Searching Orders

Searching seller orders requires providing your seller ID and checking multiple pages using offsets:

```python
def get_seller_orders(seller_id: str):
    url = f"{BASE_URL}/orders/search"
    params = {
        "seller": seller_id,
        "order.status": "paid",
        "sort": "date_desc",
        "limit": 50,
        "offset": 0
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()
```
