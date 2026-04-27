---
name: rest-api
description: "Open Food Facts API - Free food and nutrition database with allergen and ingredient data"
metadata:
  languages: "python"
  versions: "v2"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "openfoodfacts,food,nutrition,allergens,health,diet,open-data,api"
---

# Open Food Facts API - Python Reference (httpx)

## Golden Rule

Open Food Facts is a **free, open-source** food product database. Read operations require **no authentication** -- only a descriptive `User-Agent` header in the format `AppName/Version (contact@email.com)`. The production API is at `https://world.openfoodfacts.org` and the test/staging server is at `https://world.openfoodfacts.net`. Use the staging server for development and testing. Write operations (adding/editing products) require a free account. Always set a `User-Agent` -- requests without one may be blocked.

## Installation

```bash
pip install httpx
```

All examples use `httpx` with async/await. For scripts that need a synchronous entrypoint:

```python
import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/api/v2/product/3017624010701",
            headers=HEADERS,
            params={"fields": "product_name,nutrition_grades,allergens_tags"},
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://world.openfoodfacts.org
```

For testing and development:
```
https://world.openfoodfacts.net
```

Country-specific subdomains are available (e.g., `https://us.openfoodfacts.org`, `https://fr.openfoodfacts.org`).

```python
import os

BASE_URL = os.environ.get("OFF_BASE_URL", "https://world.openfoodfacts.org")
HEADERS = {
    "User-Agent": "MyFoodApp/1.0 (contact@example.com)",
}
```

## Authentication

- **Read operations:** No authentication required. Only the `User-Agent` header is needed.
- **Write operations:** Requires `user_id` and `password` parameters (free account at openfoodfacts.org).

```python
# For write operations only
OFF_USER = os.environ.get("OFF_USER_ID")
OFF_PASS = os.environ.get("OFF_PASSWORD")
```

## Rate Limiting

Open Food Facts does not publish strict rate limits, but as a community-run project with limited resources:
- Be respectful and keep request rates moderate
- Cache responses where possible
- Use the `fields` parameter to reduce bandwidth
- For bulk data needs, download the database dump instead of making thousands of API calls

## Methods

### Get Product by Barcode

Fetch a single product using its barcode (EAN-13, UPC-A, etc.).

**Parameters:**
- `fields` (str) -- Comma-separated list of fields to return (reduces response size)

```python
async def get_product(
    client: httpx.AsyncClient,
    barcode: str,
    fields: list[str] = None,
) -> dict:
    params = {}
    if fields:
        params["fields"] = ",".join(fields)
    resp = await client.get(
        f"{BASE_URL}/api/v2/product/{barcode}",
        headers=HEADERS,
        params=params,
    )
    resp.raise_for_status()
    data = resp.json()
    if data.get("status") == 0:
        return None  # Product not found
    return data["product"]

# Usage -- get allergen and nutrition info for Nutella
product = await get_product(client, "3017624010701", fields=[
    "product_name", "brands", "allergens_tags", "allergens",
    "nutrition_grades", "nutriscore_grade", "nutriments",
    "ingredients_text", "image_url",
])
if product:
    print(f"{product['product_name']} by {product.get('brands', 'unknown')}")
    print(f"Nutri-Score: {product.get('nutriscore_grade', 'N/A')}")
    print(f"Allergens: {product.get('allergens_tags', [])}")
```

### Search Products

Search for products by various criteria.

**Parameters:**
- `categories_tags_en` (str) -- Category filter (e.g., `"breakfast-cereals"`)
- `brands_tags` (str) -- Brand filter
- `nutrition_grades_tags` (str) -- Nutri-Score grade (`a`, `b`, `c`, `d`, `e`)
- `allergens_tags` (str) -- Filter by allergen (e.g., `"en:milk"`, `"en:gluten"`)
- `labels_tags` (str) -- Filter by label (e.g., `"en:organic"`, `"en:no-gluten"`)
- `countries_tags_en` (str) -- Filter by country
- `sort_by` (str) -- Sort field (e.g., `"last_modified_t"`, `"popularity_key"`)
- `fields` (str) -- Comma-separated fields to return
- `page` (int) -- Page number (default 1)
- `page_size` (int) -- Results per page (default 24, max 100)

```python
async def search_products(
    client: httpx.AsyncClient,
    fields: list[str] = None,
    page: int = 1,
    page_size: int = 24,
    **filters,
) -> dict:
    params = {"page": page, "page_size": page_size}
    if fields:
        params["fields"] = ",".join(fields)
    params.update(filters)
    resp = await client.get(
        f"{BASE_URL}/api/v2/search",
        headers=HEADERS,
        params=params,
    )
    resp.raise_for_status()
    return resp.json()

# Usage -- find gluten-free breakfast cereals
results = await search_products(
    client,
    fields=["product_name", "brands", "allergens_tags", "nutrition_grades"],
    categories_tags_en="breakfast-cereals",
    labels_tags="en:no-gluten",
    page_size=10,
)
print(f"Found {results['count']} products")
for p in results["products"]:
    print(f"  {p.get('product_name', 'unnamed')} -- {p.get('brands', 'unknown')}")
```

### Search by Text (Legacy v1 Endpoint)

Free-text search using the v1 search endpoint.

```python
async def text_search(
    client: httpx.AsyncClient,
    query: str,
    page: int = 1,
    page_size: int = 24,
    fields: list[str] = None,
) -> dict:
    params = {
        "search_terms": query,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page": page,
        "page_size": page_size,
    }
    if fields:
        params["fields"] = ",".join(fields)
    resp = await client.get(
        f"{BASE_URL}/cgi/search.pl",
        headers=HEADERS,
        params=params,
    )
    resp.raise_for_status()
    return resp.json()

# Usage
results = await text_search(client, "organic peanut butter", page_size=5)
```

### Check Allergens for a Product

Helper that extracts allergen data from a product.

```python
async def check_allergens(client: httpx.AsyncClient, barcode: str) -> dict:
    product = await get_product(client, barcode, fields=[
        "product_name", "allergens_tags", "traces_tags",
        "allergens", "traces",
    ])
    if not product:
        return {"found": False}
    return {
        "found": True,
        "product_name": product.get("product_name", "Unknown"),
        "allergens": product.get("allergens_tags", []),
        "traces": product.get("traces_tags", []),  # "may contain" warnings
        "allergens_text": product.get("allergens", ""),
        "traces_text": product.get("traces", ""),
    }

# Usage -- check if product is safe for someone with milk allergy
info = await check_allergens(client, "3017624010701")
if info["found"]:
    has_milk = any("milk" in a for a in info["allergens"])
    may_contain_milk = any("milk" in t for t in info["traces"])
    print(f"Contains milk: {has_milk}, May contain milk: {may_contain_milk}")
```

### Get Nutrition Data

```python
async def get_nutrition(client: httpx.AsyncClient, barcode: str) -> dict | None:
    product = await get_product(client, barcode, fields=[
        "product_name", "nutriments", "nutrition_grades",
        "nutriscore_grade", "nutriscore_score",
        "serving_size", "serving_quantity",
    ])
    if not product:
        return None
    return {
        "product_name": product.get("product_name"),
        "nutriscore": product.get("nutriscore_grade"),
        "serving_size": product.get("serving_size"),
        "nutrients": {
            "energy_kcal_100g": product.get("nutriments", {}).get("energy-kcal_100g"),
            "fat_100g": product.get("nutriments", {}).get("fat_100g"),
            "saturated_fat_100g": product.get("nutriments", {}).get("saturated-fat_100g"),
            "sugars_100g": product.get("nutriments", {}).get("sugars_100g"),
            "salt_100g": product.get("nutriments", {}).get("salt_100g"),
            "fiber_100g": product.get("nutriments", {}).get("fiber_100g"),
            "proteins_100g": product.get("nutriments", {}).get("proteins_100g"),
        },
    }
```

### Add or Edit a Product (Write Operation)

```python
async def add_product(
    client: httpx.AsyncClient,
    barcode: str,
    product_name: str = None,
    brands: str = None,
    categories: str = None,
    labels: str = None,
    **kwargs,
) -> dict:
    data = {
        "code": barcode,
        "user_id": OFF_USER,
        "password": OFF_PASS,
    }
    if product_name:
        data["product_name"] = product_name
    if brands:
        data["brands"] = brands
    if categories:
        data["categories"] = categories
    if labels:
        data["labels"] = labels
    data.update(kwargs)
    resp = await client.post(
        f"{BASE_URL}/cgi/product_jqm2.pl",
        headers=HEADERS,
        data=data,
    )
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

| Code | Meaning |
|---|---|
| 200 | Success |
| 404 | Product not found (also check `status` field in response) |
| 500 | Internal Server Error |

The API often returns 200 even when a product is not found. Check the `status` field:
- `status: 1` -- product found
- `status: 0` -- product not found

```python
class OFFError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def safe_off_request(
    client: httpx.AsyncClient,
    url: str,
    params: dict = None,
) -> dict:
    try:
        resp = await client.get(url, headers=HEADERS, params=params)
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        raise OFFError(e.response.status_code, str(e)) from e
```

## Common Pitfalls

1. **Always set a User-Agent header.** Requests without a descriptive User-Agent may be blocked. Use the format `AppName/Version (contact@email.com)`.

2. **Use the `fields` parameter.** Product responses can be very large (hundreds of fields). Always request only the fields you need to reduce bandwidth and response time.

3. **Check `status` field, not just HTTP status.** A 200 response with `status: 0` means the product was not found. Always check `data["status"]`.

4. **Allergen tags use language prefixes.** Allergen values are like `"en:milk"`, `"en:gluten"`, `"en:nuts"`. Always parse with the prefix or strip it when displaying.

5. **Data quality varies.** Open Food Facts is crowdsourced. Fields may be missing, incomplete, or in different languages. Always handle missing keys gracefully.

6. **Use the test server for development.** `https://world.openfoodfacts.net` is the staging environment. Do not test write operations against the production database.

7. **Nutri-Score is not available for all products.** Many products lack sufficient data for Nutri-Score calculation. Check for `None`/missing values.

8. **Nutriment keys use hyphens.** Keys in the `nutriments` object use hyphens like `"energy-kcal_100g"`, `"saturated-fat_100g"`. Do not assume underscores.

9. **Bulk data is available as dumps.** For large-scale analysis, download the CSV or MongoDB dump from `https://world.openfoodfacts.org/data` instead of making thousands of API calls.

10. **Barcodes are strings.** Leading zeros matter in barcodes (e.g., EAN-13). Always store and pass barcodes as strings, never as integers.
