---
name: commerce-api
description: "Naver Commerce API for Smart Store integration -- product management, order processing, and settlement with OAuth2 bcrypt-signature authentication"
metadata:
  languages: "python"
  versions: "v2"
  revision: 1
  updated-on: "2026-03-20"
  source: community
  tags: "naver,smartstore,commerce,ecommerce,korea,rest-api"
---

# Naver Commerce API (Python)

REST API for Naver Smart Store — Korea's largest e-commerce platform. Covers product registration, order management, settlement, and seller operations.

**Base URL:** `https://api.commerce.naver.com/external`

Official docs: https://apicenter.commerce.naver.com/docs/introduction
Tech support: https://github.com/commerce-api-naver/commerce-api

## Dependencies

```bash
pip install requests bcrypt pybase64
```

## Authentication

The Commerce API uses OAuth2 Client Credentials, but with a twist: instead of sending `client_secret` directly, you sign it with bcrypt and base64-encode the result. This prevents secret interception in transit.

You need a `client_id` and `client_secret` from the Commerce API Center admin console after registering your application.

### Generating the Signature

The signature is built from `{client_id}_{timestamp}` hashed with bcrypt using `client_secret` as the salt, then base64-encoded.

```python
import time
import bcrypt
import pybase64

def generate_signature(client_id: str, client_secret: str) -> tuple[str, int]:
    timestamp = int(time.time() * 1000)
    password = f"{client_id}_{timestamp}"
    hashed = bcrypt.hashpw(password.encode("utf-8"), client_secret.encode("utf-8"))
    signature = pybase64.standard_b64encode(hashed).decode("utf-8")
    return signature, timestamp
```

`client_secret` must be a valid bcrypt salt (starts with `$2a$` or `$2b$`). If it's not in that format, the hash will fail.

### Requesting an Access Token

```python
import requests

CLIENT_ID = "your_client_id"
CLIENT_SECRET = "$2a$10$your_bcrypt_salt_here"

def get_access_token() -> str:
    signature, timestamp = generate_signature(CLIENT_ID, CLIENT_SECRET)

    resp = requests.post(
        "https://api.commerce.naver.com/external/v1/oauth2/token",
        data={
            "client_id": CLIENT_ID,
            "timestamp": timestamp,
            "client_secret_sign": signature,
            "grant_type": "client_credentials",
            "type": "SELF",
        },
    )
    resp.raise_for_status()
    return resp.json()["access_token"]
```

Tokens are valid for **3 hours** (10,800 seconds). If you request a new token while the current one has more than 30 minutes remaining, the API returns the existing token instead of issuing a new one.

### Making Authenticated Requests

```python
class CommerceClient:
    BASE = "https://api.commerce.naver.com/external"

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None

    def _ensure_token(self):
        if self.token is None:
            self.token = get_access_token()

    def _headers(self):
        self._ensure_token()
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def request(self, method: str, path: str, **kwargs):
        url = f"{self.BASE}{path}"
        resp = requests.request(method, url, headers=self._headers(), **kwargs)

        if resp.status_code == 401:
            body = resp.json()
            if body.get("code") == "GW.AUTHN":
                self.token = get_access_token()
                resp = requests.request(method, url, headers=self._headers(), **kwargs)

        resp.raise_for_status()
        return resp.json() if resp.content else None
```

The 401 retry is important — tokens can expire mid-session and the gateway returns error code `GW.AUTHN` when that happens.

## Product Registration

Register a new product on Smart Store. Image URLs must come from the image upload endpoint first.

### Uploading Product Images

```python
def upload_images(client: CommerceClient, image_paths: list[str]) -> list[str]:
    files = [("imageFiles", open(p, "rb")) for p in image_paths]
    resp = requests.post(
        f"{client.BASE}/v1/product-images/upload",
        headers={"Authorization": f"Bearer {client.token}"},
        files=files,
    )
    resp.raise_for_status()
    return [img["url"] for img in resp.json()["images"]]
```

### Creating a Product

```python
product_data = {
    "originProduct": {
        "statusType": "SALE",
        "name": "핸드메이드 가죽 지갑",
        "images": {
            "representativeImage": {"url": uploaded_urls[0]},
            "optionalImages": [{"url": u} for u in uploaded_urls[1:]],
        },
        "detailContent": "<p>본 제품은 수제 가죽 지갑입니다.</p>",
        "salePrice": 45000,
        "stockQuantity": 100,
        "leafCategoryId": "50000803",
        "deliveryInfo": {
            "deliveryType": "DELIVERY",
            "deliveryAttributeType": "NORMAL",
            "deliveryFee": {
                "deliveryFeeType": "FREE",
                "baseFee": 0,
            },
            "claimDeliveryInfo": {
                "returnDeliveryFee": 3000,
                "exchangeDeliveryFee": 3000,
            },
        },
        "detailAttribute": {
            "naverShoppingSearchInfo": {
                "manufacturerName": "자체제작",
                "brandName": "자체브랜드",
            },
        },
    },
    "smartstoreChannelProduct": {
        "channelProductName": "핸드메이드 가죽 지갑",
        "storeKeepExclusiveProduct": False,
    },
}

result = client.request("POST", "/v2/products", json=product_data)
product_no = result["smartstoreChannelProduct"]["channelProductNo"]
```

The request body is deeply nested — `originProduct` holds the core product info while `smartstoreChannelProduct` controls Smart Store-specific settings. The `leafCategoryId` must be a valid Naver Shopping category; you can look these up from the category API or the seller center.

## Product Search

Product lookups use **POST**, not GET. This trips people up.

```python
def search_products(client: CommerceClient, product_nos: list[int] = None,
                    keyword: str = None, page: int = 1, size: int = 50):
    body = {"page": page, "size": size}

    if product_nos:
        body["searchKeywordType"] = "CHANNEL_PRODUCT_NO"
        body["channelProductNos"] = product_nos
    elif keyword:
        body["searchKeywordType"] = "PRODUCT_NAME"
        body["keyword"] = keyword

    return client.request("POST", "/v1/products/search", json=body)

products = search_products(client, product_nos=[1234567890])
```

## Product Update and Delete

```python
client.request("PUT", f"/v2/products/origin-products/{origin_product_no}",
               json={"originProduct": {"salePrice": 39000}})

client.request("DELETE", f"/v2/products/origin-products/{origin_product_no}")
```

## Order Management

### Fetching Changed Orders

Poll for status changes since a given timestamp. Results are sorted by change time ascending, capped at 300 per request.

```python
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))

def get_changed_orders(client: CommerceClient, since_hours: int = 24):
    since = datetime.now(KST) - timedelta(hours=since_hours)
    params = {
        "lastChangedFrom": since.strftime("%Y-%m-%dT%H:%M:%S.000+09:00"),
        "lastChangedType": "PAYED",
    }
    return client.request(
        "GET",
        "/v1/pay-order/seller/product-orders/last-changed-statuses",
        params=params,
    )
```

If more than 300 results exist, the response includes a `more` object with `moreFrom` and `moreSequence` values to paginate:

```python
result = get_changed_orders(client)
while result.get("more"):
    more = result["more"]
    result = client.request(
        "GET",
        "/v1/pay-order/seller/product-orders/last-changed-statuses",
        params={
            "lastChangedFrom": more["moreFrom"],
            "moreSequence": more["moreSequence"],
            "lastChangedType": "PAYED",
        },
    )
```

### Order Detail Query

Fetch full details for specific product order IDs:

```python
def get_order_details(client: CommerceClient, product_order_ids: list[str]):
    return client.request(
        "POST",
        "/v1/pay-order/seller/product-orders/query",
        json={"productOrderIds": product_order_ids},
    )

details = get_order_details(client, ["2026032012345601", "2026032012345602"])
for order in details["data"]:
    print(order["productOrder"]["productOrderStatus"])
```

### Dispatching Orders

Mark orders as shipped:

```python
def dispatch_orders(client: CommerceClient, product_order_ids: list[str],
                    delivery_company: str, tracking_number: str):
    body = {
        "dispatchProductOrders": [
            {
                "productOrderId": oid,
                "deliveryMethod": "DELIVERY",
                "deliveryCompanyCode": delivery_company,
                "trackingNumber": tracking_number,
            }
            for oid in product_order_ids
        ]
    }
    return client.request(
        "POST",
        "/v1/pay-order/seller/product-orders/dispatch",
        json=body,
    )

dispatch_orders(client, ["2026032012345601"], "CJGLS", "6012345678901")
```

Common carrier codes: `CJGLS` (CJ대한통운), `EPOST` (우체국), `HANJIN` (한진택배), `LOTTE` (롯데택배), `LOGEN` (로젠택배).

## Error Handling

All errors follow this structure:

```json
{
    "code": "GW.AUTHN",
    "message": "요청을 보낼 권한이 없습니다.",
    "timestamp": "2026-03-20T14:30:00.000+09:00",
    "traceId": "cr3-000000-aaaaaa^1730711073284^6745261"
}
```

The `traceId` is useful when reporting issues to Naver tech support. Always log it.

### Retry Pattern for Token Expiry

```python
import time

def api_call_with_retry(client: CommerceClient, method: str, path: str,
                        max_retries: int = 2, **kwargs):
    for attempt in range(max_retries + 1):
        try:
            return client.request(method, path, **kwargs)
        except requests.HTTPError as e:
            if e.response.status_code == 401 and attempt < max_retries:
                client.token = None
                time.sleep(1)
                continue
            if e.response.status_code == 429:
                retry_after = int(e.response.headers.get("Retry-After", 5))
                time.sleep(retry_after)
                continue
            raise
```

### Key Error Codes

| HTTP Status | Code | Cause |
|-------------|------|-------|
| 401 | `GW.AUTHN` | Token expired or invalid — re-request token |
| 403 | `GW.AUTHZ` | No permission for this API scope |
| 400 | `InvalidInput` | Bad request body — check `message` for details (the `invalidInputs` field alone is often insufficient) |
| 429 | — | Rate limit exceeded — back off and retry |
| 500 | — | Server error — retry with exponential backoff |

## Date and Time Formatting

The API requires **ISO 8601 with KST offset** (`+09:00`). Getting the offset wrong silently shifts your query window.

```python
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))

now = datetime.now(KST)
formatted = now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+09:00"
# "2026-03-20T15:30:00.000+09:00"
```

Do not use `Z` (UTC) or naive datetimes — the API interprets them incorrectly.

## Response Headers

Every response includes debugging headers:

- `GNCP-GW-Trace-ID` — unique request trace ID (include this in bug reports)
- `GNCP-GW-HttpClient-ResponseTime` — processing time in milliseconds

## Links

- API Reference: https://apicenter.commerce.naver.com/docs/commerce-api/current
- Auth Guide: https://apicenter.commerce.naver.com/docs/auth
- REST API Spec: https://apicenter.commerce.naver.com/docs/restful-api
- GitHub Tech Support: https://github.com/commerce-api-naver/commerce-api
