---
name: rest-api
description: "Delhivery - Indian E-commerce Logistics & Shipping API (Last-Mile Delivery)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "delhivery,logistics,shipping,ecommerce,india,courier,tracking,delivery,cod,prepaid,warehouse,pincode,api,integration"
---

# Delhivery API

> **Golden Rule:** Delhivery has no official Python SDK. Use `httpx` for direct REST access. Auth uses a static API Token passed as `Authorization: Token <your-token>`. Staging base URL is `https://staging-express.delhivery.com`; production is `https://track.delhivery.com`. The order creation endpoint requires `format=json&data=` body format. Warehouse must be pre-registered before creating shipments.

## Installation

```bash
pip install httpx
```

## Base URL

| Environment | URL |
|---|---|
| Staging/Testing | `https://staging-express.delhivery.com` |
| Production | `https://track.delhivery.com` |

Documentation: https://delhivery-express-api-doc.readme.io/reference/introduction-1

Developer Portal: https://one.delhivery.com/developer-portal/documents

## Authentication

**Type:** Static API Token

```python
import httpx

API_TOKEN = "your-delhivery-api-token"  # From Delhivery One dashboard or sales SPOC
BASE_URL = "https://staging-express.delhivery.com"  # Use track.delhivery.com for production

headers = {
    "Authorization": f"Token {API_TOKEN}",
    "Content-Type": "application/json"
}

client = httpx.AsyncClient(
    base_url=BASE_URL,
    headers=headers,
    timeout=30.0
)
```

**Getting credentials:**
- Staging token: Contact Delhivery sales representative
- Production token: Login to Delhivery One account > account header > API Key
- Staging and production tokens are different

## Rate Limiting

Not publicly documented. Implement reasonable rate limiting on your end. HTTP 429 returned when limits are exceeded.

## Methods

### `check_pincode_serviceability`

**Endpoint:** `GET /c/api/pin-codes/json/`

Check if Delhivery services a given pincode.

| Parameter | Type | Default |
|---|---|---|
| `filter_codes` | `int` | optional (specific pincode to check) |
| `dt` | `str` | optional (date `YYYY-MM-DD`, codes activated after) |
| `st` | `str` | optional (2-digit state code) |
| `token` | `str` | **required** (API token) |

```python
import httpx

async def check_pincode(pincode: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{BASE_URL}/c/api/pin-codes/json/",
            params={"filter_codes": pincode, "token": API_TOKEN}
        )
        response.raise_for_status()
        data = response.json()
        return data["delivery_codes"]
```

### `create_order`

**Endpoint:** `POST /api/cmu/create.json`

Create a new shipment order. Returns waybill (tracking number).

| Parameter | Type | Default |
|---|---|---|
| `pickup_location.name` | `str` | **required** (must match registered warehouse, case-sensitive) |
| `shipments[].order` | `str` | **required** (unique order ID) |
| `shipments[].name` | `str` | **required** (consignee name) |
| `shipments[].phone` | `str` | **required** (consignee phone) |
| `shipments[].add` | `str` | **required** (delivery address) |
| `shipments[].pin` | `str` | **required** (delivery pincode) |
| `shipments[].city` | `str` | **required** |
| `shipments[].state` | `str` | **required** |
| `shipments[].country` | `str` | **required** |
| `shipments[].payment_mode` | `str` | **required** (`COD`, `Prepaid`, or `Pickup`) |
| `shipments[].products_desc` | `str` | recommended |
| `shipments[].cod_amount` | `str` | required for COD |
| `shipments[].total_amount` | `str` | recommended |
| `shipments[].seller_gst_tin` | `str` | **required** (seller GST number) |
| `shipments[].hsn_code` | `str` | **required** (product HSN code) |

```python
import httpx
import json

async def create_order():
    payload = {
        "pickup_location": {
            "name": "MyWarehouse",
            "city": "Mumbai",
            "pin": "400001",
            "country": "India",
            "phone": "9876543210",
            "add": "123 MG Road, Fort"
        },
        "shipments": [
            {
                "order": "ORD-20260317-001",
                "name": "Rahul Sharma",
                "phone": "9876543211",
                "add": "456 Brigade Road",
                "pin": "560001",
                "city": "Bangalore",
                "state": "Karnataka",
                "country": "India",
                "payment_mode": "Prepaid",
                "products_desc": "Electronics - Headphones",
                "total_amount": "1999",
                "seller_gst_tin": "29ABCDE1234F1ZH",
                "hsn_code": "8518"
            }
        ]
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/cmu/create.json",
            headers={
                "Authorization": f"Token {API_TOKEN}",
                "Content-Type": "application/json"
            },
            content=f"format=json&data={json.dumps(payload)}"
        )
        response.raise_for_status()
        data = response.json()
        # data = {"success": true, "packages": [{"waybill": "123456789", "status": "Success", ...}]}
        return data
```

### `track_order`

**Endpoint:** `GET /api/v1/packages/json/`

Track a shipment by waybill number.

| Parameter | Type | Default |
|---|---|---|
| `waybill` | `str` | **required** (tracking number) |
| `token` | `str` | **required** (API token) |

```python
async def track_order(waybill: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{BASE_URL}/api/v1/packages/json/",
            params={"waybill": waybill, "token": API_TOKEN}
        )
        response.raise_for_status()
        data = response.json()
        shipment = data["ShipmentData"][0]["Shipment"]
        print(f"Status: {shipment['Status']['Status']}")
        print(f"Location: {shipment['Status'].get('StatusLocation', 'N/A')}")
        return shipment
```

### `calculate_shipping_charges`

**Endpoint:** `GET /api/kinko/v1/invoice/charges/.json`

Get estimated shipping cost for a shipment.

| Parameter | Type | Default |
|---|---|---|
| `md` | `str` | **required** (`E` = Express, `S` = Surface) |
| `cgm` | `int` | **required** (weight in grams) |
| `o_pin` | `str` | **required** (origin pincode) |
| `d_pin` | `str` | **required** (destination pincode) |
| `ss` | `str` | **required** (`Delivered`, `RTO`, `DTO`) |
| `token` | `str` | **required** |

```python
async def get_shipping_cost(origin_pin: str, dest_pin: str, weight_grams: int):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{BASE_URL}/api/kinko/v1/invoice/charges/.json",
            params={
                "md": "E",
                "cgm": weight_grams,
                "o_pin": origin_pin,
                "d_pin": dest_pin,
                "ss": "Delivered",
                "token": API_TOKEN
            }
        )
        response.raise_for_status()
        data = response.json()
        # Contains: freight_charge, cod_charge, fuel_surcharge, total_amount, tax
        return data
```

### `cancel_order`

**Endpoint:** `POST /api/p/edit`

Cancel an existing shipment.

```python
async def cancel_order(waybill: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/p/edit",
            headers={
                "Authorization": f"Token {API_TOKEN}",
                "Content-Type": "application/json"
            },
            json={"waybill": waybill, "cancellation": "true"}
        )
        response.raise_for_status()
        return response.json()
```

### `fetch_waybills`

**Endpoint:** `GET /waybill/api/bulk/json/`

Get pre-generated waybill numbers for shipments.

| Parameter | Type | Default |
|---|---|---|
| `token` | `str` | **required** |
| `client_name` | `str` | **required** (your Delhivery client name) |
| `count` | `int` | **required** (number of waybills) |

```python
async def fetch_waybills(client_name: str, count: int = 10):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{BASE_URL}/waybill/api/bulk/json/",
            params={
                "token": API_TOKEN,
                "client_name": client_name,
                "count": count
            }
        )
        response.raise_for_status()
        return response.json()
```

### `register_warehouse`

**Endpoint:** `POST /api/backend/clientwarehouse/create/`

Register a pickup warehouse (required before creating orders).

```python
async def register_warehouse():
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/backend/clientwarehouse/create/",
            headers={
                "Authorization": f"Token {API_TOKEN}",
                "Content-Type": "application/json"
            },
            json={
                "name": "MyWarehouse",
                "phone": "9876543210",
                "city": "Mumbai",
                "pin": "400001",
                "address": "123 MG Road, Fort, Mumbai",
                "country": "India",
                "email": "warehouse@example.com",
                "registered_name": "My Company Pvt Ltd",
                "return_address": "123 MG Road, Fort, Mumbai",
                "return_pin": "400001",
                "return_city": "Mumbai",
                "return_state": "Maharashtra",
                "return_country": "India"
            }
        )
        response.raise_for_status()
        return response.json()
```

### `schedule_pickup`

**Endpoint:** `POST /fm/request/new/`

Schedule a pickup from your warehouse.

```python
async def schedule_pickup(warehouse_name: str, package_count: int):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/fm/request/new/",
            headers={
                "Authorization": f"Token {API_TOKEN}",
                "Content-Type": "application/json"
            },
            json={
                "pickup_date": "2026-03-18",
                "pickup_time": "14:00:00",
                "pickup_location": warehouse_name,
                "expected_package_count": package_count
            }
        )
        response.raise_for_status()
        return response.json()
```

## Error Handling

```python
import httpx

try:
    response = await client.post(
        f"{BASE_URL}/api/cmu/create.json",
        headers=headers,
        content=f"format=json&data={json.dumps(payload)}"
    )
    response.raise_for_status()
    data = response.json()
    # Check per-package status even on 200
    for pkg in data.get("packages", []):
        if pkg["status"] != "Success":
            print(f"Package failed: {pkg.get('remarks', 'Unknown error')}")
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check API token")
    elif e.response.status_code == 400:
        print(f"Bad request: {e.response.text}")
    elif e.response.status_code == 415:
        print("Unsupported media type -- check Content-Type header")
    elif e.response.status_code == 429:
        print("Rate limited -- back off and retry")
    else:
        print(f"Delhivery API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- **Order creation body format**: The POST body must be `format=json&data=<json_string>`, NOT a direct JSON body. This is a critical difference from standard REST APIs
- **Warehouse name is case-sensitive**: The `pickup_location.name` in order creation must exactly match the registered warehouse name
- **Staging vs Production tokens are different**: Do not use staging tokens in production or vice versa
- **Replace `staging-express` with `track`** in the URL when switching from staging to production
- **Special characters break orders**: Characters like `&`, `#`, `%`, `;`, `\` in address fields must be JSON-encoded
- **E-waybill required for high-value shipments**: If shipment value exceeds INR 50,000, an e-waybill number is mandatory
- **GST TIN and HSN code are mandatory**: `seller_gst_tin` and `hsn_code` are required for all orders
- **COD amount vs Total amount**: For COD orders, `cod_amount` is the amount to collect; `total_amount` is the declared shipment value
- **Check per-package status**: Even with HTTP 200, individual packages in the response can have `"status": "Failure"` with error remarks
- **Waybill pre-generation**: For bulk operations, pre-fetch waybills via the bulk waybill API to avoid rate issues
- **Token passed differently per endpoint**: Some endpoints use `Authorization: Token <key>` header; others accept `token` as a query parameter (e.g., tracking, pincode check)
- **Payment mode values**: `COD` (Cash on Delivery), `Prepaid` (forward shipment), `Pickup` (reverse pickup)
- **Bangladesh shipments**: Use `"country": "BD"` with valid BD pincode for cross-border
