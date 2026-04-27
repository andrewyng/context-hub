---
name: rest-api
description: "Shiprocket - Indian E-commerce Shipping & Logistics API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "shiprocket,shipping,logistics,ecommerce,india,courier,tracking,orders,delivery,cod,api,integration"
---

# Shiprocket API

> **Golden Rule:** Shiprocket has no official Python SDK. Use `httpx` for direct REST access. Auth requires a login call (email/password) that returns a Bearer token valid for 10 days. All endpoints are under `https://apiv2.shiprocket.in/v1/external`. Package dimensions (`length`, `breadth`, `height`, `weight`) are required for order creation.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://apiv2.shiprocket.in/v1/external
```

## Authentication

**Type:** Email/Password login to get Bearer token (valid 10 days)

```python
import httpx

BASE_URL = "https://apiv2.shiprocket.in/v1/external"

# Step 1: Login to get token
login_response = await httpx.AsyncClient().post(
    f"{BASE_URL}/auth/login",
    json={"email": "your-api-email@example.com", "password": "your-api-password"}
)
login_response.raise_for_status()
token = login_response.json()["token"]

# Step 2: Use token for all subsequent requests
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
client = httpx.AsyncClient(headers=headers, timeout=30.0)
```

**Important:** API credentials must be created separately from your main Shiprocket account login (Dashboard > Settings > API).

## Rate Limiting

Not publicly documented. HTTP 429 returned when exceeded. Contact Shiprocket support for plan-specific limits.

## Methods

### `create_order`

**Endpoint:** `POST /orders/create/adhoc`

Create a new shipping order. Returns Shiprocket order ID and shipment ID.

| Parameter | Type | Default |
|---|---|---|
| `order_id` | `str` | **required** (your unique reference) |
| `order_date` | `str` | **required** (`YYYY-MM-DD HH:mm`) |
| `pickup_location` | `str` | **required** (e.g., `"Primary"`) |
| `billing_customer_name` | `str` | **required** |
| `billing_address` | `str` | **required** |
| `billing_city` | `str` | **required** |
| `billing_pincode` | `str` | **required** |
| `billing_state` | `str` | **required** |
| `billing_country` | `str` | **required** |
| `billing_phone` | `str` | **required** |
| `shipping_is_billing` | `bool` | **required** |
| `order_items` | `list` | **required** (array of product objects) |
| `payment_method` | `str` | **required** (`COD` or `Prepaid`) |
| `sub_total` | `float` | **required** |
| `length` | `float` | **required** (cm) |
| `breadth` | `float` | **required** (cm) |
| `height` | `float` | **required** (cm) |
| `weight` | `float` | **required** (kg) |

**Returns:** JSON with `order_id`, `shipment_id`, `status`

```python
payload = {
    "order_id": "ORD-12345",
    "order_date": "2026-03-13 10:00",
    "pickup_location": "Primary",
    "billing_customer_name": "Jane",
    "billing_last_name": "Doe",
    "billing_address": "123 MG Road",
    "billing_city": "Mumbai",
    "billing_pincode": "400001",
    "billing_state": "Maharashtra",
    "billing_country": "India",
    "billing_email": "jane@example.com",
    "billing_phone": "9876543210",
    "shipping_is_billing": True,
    "order_items": [
        {
            "name": "Wireless Headphones",
            "sku": "SKU-001",
            "units": 1,
            "selling_price": 1999.00,
            "discount": 0,
            "tax": 0
        }
    ],
    "payment_method": "Prepaid",
    "sub_total": 1999.00,
    "length": 15,
    "breadth": 10,
    "height": 8,
    "weight": 0.3
}
response = await client.post(f"{BASE_URL}/orders/create/adhoc", json=payload)
response.raise_for_status()
order = response.json()
shipment_id = order["shipment_id"]
```

### `get_order`

**Endpoint:** `GET /orders/{order_id}`

Retrieve order details.

```python
order_id = "12345"
response = await client.get(f"{BASE_URL}/orders/{order_id}")
response.raise_for_status()
order = response.json()
```

### `list_orders`

**Endpoint:** `GET /orders/list`

List all orders with pagination.

```python
response = await client.get(f"{BASE_URL}/orders/list")
response.raise_for_status()
orders = response.json()
```

### `cancel_orders`

**Endpoint:** `POST /orders/cancel/`

Cancel one or more orders by ID.

```python
payload = {"ids": [12345, 12346]}
response = await client.post(f"{BASE_URL}/orders/cancel/", json=payload)
response.raise_for_status()
```

### `check_serviceability`

**Endpoint:** `GET /courier/serviceability/`

Check which couriers can service a route and get shipping rates.

| Parameter | Type | Default |
|---|---|---|
| `pickup_postcode` | `str` | **required** |
| `delivery_postcode` | `str` | **required** |
| `weight` | `float` | **required** (kg) |
| `cod` | `int` | **required** (`1` for COD, `0` for prepaid) |

```python
params = {
    "pickup_postcode": "400001",
    "delivery_postcode": "560001",
    "weight": 0.5,
    "cod": 0
}
response = await client.get(f"{BASE_URL}/courier/serviceability/", params=params)
response.raise_for_status()
couriers = response.json()
```

### `assign_awb`

**Endpoint:** `POST /courier/assign/awb/`

Generate Air Waybill (AWB) number for a shipment.

**Returns:** JSON with `awb_code` and `courier_name`

```python
payload = {"shipment_id": [shipment_id], "courier_id": courier_id}
response = await client.post(f"{BASE_URL}/courier/assign/awb/", json=payload)
response.raise_for_status()
awb = response.json()
awb_code = awb["response"]["data"]["awb_code"]
```

### `track_shipment`

**Endpoint:** `GET /courier/track/awb/{awb_code}`

Track a shipment by AWB number.

```python
awb_code = "123456789"
response = await client.get(f"{BASE_URL}/courier/track/awb/{awb_code}")
response.raise_for_status()
tracking = response.json()
```

### `generate_label`

**Endpoint:** `POST /courier/generate/label`

Generate a shipping label PDF.

```python
payload = {"shipment_id": [shipment_id]}
response = await client.post(f"{BASE_URL}/courier/generate/label", json=payload)
response.raise_for_status()
label_url = response.json()["label_url"]
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/orders/create/adhoc", json=payload)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Auth failed -- token expired (valid 10 days), re-login")
    elif e.response.status_code == 422:
        print(f"Validation error: {e.response.json()}")
    elif e.response.status_code == 429:
        print("Rate limited -- slow down requests")
    else:
        print(f"Shiprocket error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Auth token is valid for **10 days (240 hours)** -- must re-login after expiry
- API email/password must be **separate from your main Shiprocket account** login
- Package dimensions (`length`, `breadth`, `height` in cm, `weight` in kg) are **required** for order creation
- `payment_method` must be `"COD"` or `"Prepaid"` (case-sensitive)
- `order_date` format is `"YYYY-MM-DD HH:mm"` (not ISO 8601)
- `order_items` is an array of objects with `name`, `sku`, `units`, `selling_price`
- Tracking is available by AWB (`/courier/track/awb/{awb}`), shipment ID (`/tracking/shipment/{id}`), or order ID (`/tracking/order/{id}`)
- Covers 26,000+ PIN codes across India with 25+ courier partners (FedEx, DHL, Delhivery, Blue Dart, etc.)
- Supports both domestic and international shipping
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
