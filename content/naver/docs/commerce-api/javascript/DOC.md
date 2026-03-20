---
name: commerce-api
description: "Naver Commerce API for Smart Store integration -- product management, order processing, and settlement with OAuth2 bcrypt-signature authentication"
metadata:
  languages: "javascript"
  versions: "v2"
  revision: 1
  updated-on: "2026-03-20"
  source: community
  tags: "naver,smartstore,commerce,ecommerce,korea,rest-api"
---

# Naver Commerce API (Node.js)

REST API for Naver Smart Store — Korea's largest e-commerce platform. Covers product registration, order management, settlement, and seller operations.

**Base URL:** `https://api.commerce.naver.com/external`

Official docs: https://apicenter.commerce.naver.com/docs/introduction
Tech support: https://github.com/commerce-api-naver/commerce-api

## Dependencies

```bash
npm install axios bcrypt
```

## Authentication

The Commerce API uses OAuth2 Client Credentials with a non-standard twist: instead of passing `client_secret` directly, you hash it with bcrypt and base64-encode the result.

You need `client_id` and `client_secret` from the Commerce API Center admin console.

### Generating the Signature

```javascript
const bcrypt = require("bcrypt");

function generateSignature(clientId, clientSecret) {
  const timestamp = Date.now();
  const password = `${clientId}_${timestamp}`;
  const hashed = bcrypt.hashSync(password, clientSecret);
  const signature = Buffer.from(hashed, "utf-8").toString("base64");
  return { signature, timestamp };
}
```

`clientSecret` must be a valid bcrypt salt (starts with `$2a$` or `$2b$`). If the format is wrong, `hashSync` throws.

### Requesting an Access Token

```javascript
const axios = require("axios");

const CLIENT_ID = "your_client_id";
const CLIENT_SECRET = "$2a$10$your_bcrypt_salt_here";

async function getAccessToken() {
  const { signature, timestamp } = generateSignature(CLIENT_ID, CLIENT_SECRET);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    timestamp: String(timestamp),
    client_secret_sign: signature,
    grant_type: "client_credentials",
    type: "SELF",
  });

  const resp = await axios.post(
    "https://api.commerce.naver.com/external/v1/oauth2/token",
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return resp.data.access_token;
}
```

Tokens last **3 hours** (10,800 seconds). Requesting a new token while the current one has over 30 minutes left returns the existing one unchanged.

### API Client with Auto-Retry

```javascript
class CommerceClient {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.token = null;
    this.base = "https://api.commerce.naver.com/external";
  }

  async ensureToken() {
    if (!this.token) {
      this.token = await getAccessToken();
    }
  }

  async request(method, path, options = {}) {
    await this.ensureToken();

    const config = {
      method,
      url: `${this.base}${path}`,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      ...options,
    };

    try {
      const resp = await axios(config);
      return resp.data;
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.code === "GW.AUTHN") {
        this.token = await getAccessToken();
        config.headers.Authorization = `Bearer ${this.token}`;
        const resp = await axios(config);
        return resp.data;
      }
      throw err;
    }
  }
}

const client = new CommerceClient(CLIENT_ID, CLIENT_SECRET);
```

The 401 `GW.AUTHN` check is essential — tokens can expire mid-session without warning.

## Product Registration

### Uploading Product Images

Image URLs in product data must come from the upload endpoint. Direct external URLs are rejected.

```javascript
const FormData = require("form-data");
const fs = require("fs");

async function uploadImages(client, imagePaths) {
  await client.ensureToken();
  const form = new FormData();
  for (const p of imagePaths) {
    form.append("imageFiles", fs.createReadStream(p));
  }

  const resp = await axios.post(
    `${client.base}/v1/product-images/upload`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${client.token}`,
      },
    }
  );
  return resp.data.images.map((img) => img.url);
}
```

### Creating a Product

```javascript
const productData = {
  originProduct: {
    statusType: "SALE",
    name: "핸드메이드 가죽 지갑",
    images: {
      representativeImage: { url: uploadedUrls[0] },
      optionalImages: uploadedUrls.slice(1).map((url) => ({ url })),
    },
    detailContent: "<p>본 제품은 수제 가죽 지갑입니다.</p>",
    salePrice: 45000,
    stockQuantity: 100,
    leafCategoryId: "50000803",
    deliveryInfo: {
      deliveryType: "DELIVERY",
      deliveryAttributeType: "NORMAL",
      deliveryFee: {
        deliveryFeeType: "FREE",
        baseFee: 0,
      },
      claimDeliveryInfo: {
        returnDeliveryFee: 3000,
        exchangeDeliveryFee: 3000,
      },
    },
    detailAttribute: {
      naverShoppingSearchInfo: {
        manufacturerName: "자체제작",
        brandName: "자체브랜드",
      },
    },
  },
  smartstoreChannelProduct: {
    channelProductName: "핸드메이드 가죽 지갑",
    storeKeepExclusiveProduct: false,
  },
};

const result = await client.request("POST", "/v2/products", { data: productData });
const productNo = result.smartstoreChannelProduct.channelProductNo;
```

The body is deeply nested — `originProduct` holds core info while `smartstoreChannelProduct` controls Smart Store display. `leafCategoryId` must be a valid Naver Shopping category.

## Product Search

Product lookups use **POST**, not GET.

```javascript
async function searchProducts(client, { productNos, keyword, page = 1, size = 50 } = {}) {
  const body = { page, size };

  if (productNos) {
    body.searchKeywordType = "CHANNEL_PRODUCT_NO";
    body.channelProductNos = productNos;
  } else if (keyword) {
    body.searchKeywordType = "PRODUCT_NAME";
    body.keyword = keyword;
  }

  return client.request("POST", "/v1/products/search", { data: body });
}

const products = await searchProducts(client, { productNos: [1234567890] });
```

## Product Update and Delete

```javascript
await client.request("PUT", `/v2/products/origin-products/${originProductNo}`, {
  data: { originProduct: { salePrice: 39000 } },
});

await client.request("DELETE", `/v2/products/origin-products/${originProductNo}`);
```

## Order Management

### Fetching Changed Orders

Poll for status changes since a given time. Results are sorted ascending by change time, capped at 300 per request.

```javascript
function formatKST(date) {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${M}-${d}T${h}:${m}:${s}.000+09:00`;
}

async function getChangedOrders(client, sinceHours = 24) {
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
  return client.request("GET", "/v1/pay-order/seller/product-orders/last-changed-statuses", {
    params: {
      lastChangedFrom: formatKST(since),
      lastChangedType: "PAYED",
    },
  });
}
```

If over 300 results exist, paginate using the `more` object:

```javascript
let result = await getChangedOrders(client);
while (result.more) {
  result = await client.request(
    "GET",
    "/v1/pay-order/seller/product-orders/last-changed-statuses",
    {
      params: {
        lastChangedFrom: result.more.moreFrom,
        moreSequence: result.more.moreSequence,
        lastChangedType: "PAYED",
      },
    }
  );
}
```

### Order Detail Query

```javascript
async function getOrderDetails(client, productOrderIds) {
  return client.request("POST", "/v1/pay-order/seller/product-orders/query", {
    data: { productOrderIds },
  });
}

const details = await getOrderDetails(client, ["2026032012345601", "2026032012345602"]);
for (const order of details.data) {
  console.log(order.productOrder.productOrderStatus);
}
```

### Dispatching Orders

```javascript
async function dispatchOrders(client, productOrderIds, deliveryCompany, trackingNumber) {
  return client.request("POST", "/v1/pay-order/seller/product-orders/dispatch", {
    data: {
      dispatchProductOrders: productOrderIds.map((id) => ({
        productOrderId: id,
        deliveryMethod: "DELIVERY",
        deliveryCompanyCode: deliveryCompany,
        trackingNumber,
      })),
    },
  });
}

await dispatchOrders(client, ["2026032012345601"], "CJGLS", "6012345678901");
```

Common carrier codes: `CJGLS` (CJ대한통운), `EPOST` (우체국), `HANJIN` (한진택배), `LOTTE` (롯데택배), `LOGEN` (로젠택배).

## Error Handling

Error responses follow this shape:

```json
{
    "code": "GW.AUTHN",
    "message": "요청을 보낼 권한이 없습니다.",
    "timestamp": "2026-03-20T14:30:00.000+09:00",
    "traceId": "cr3-000000-aaaaaa^1730711073284^6745261"
}
```

Always log `traceId` — Naver support needs it for issue investigation.

### Retry with Backoff

```javascript
async function withRetry(fn, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        const wait = parseInt(err.response.headers["retry-after"] || "5", 10);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      if (status === 401 && attempt < maxRetries) {
        continue;
      }
      throw err;
    }
  }
}
```

### Key Error Codes

| HTTP Status | Code | Cause |
|-------------|------|-------|
| 401 | `GW.AUTHN` | Token expired or invalid — re-request token |
| 403 | `GW.AUTHZ` | No permission for this API scope |
| 400 | `InvalidInput` | Bad request — check `message` field (`invalidInputs` is often insufficient) |
| 429 | — | Rate limit exceeded — back off and retry |
| 500 | — | Server error — retry with exponential backoff |

## Date and Time Formatting

All dates must be **ISO 8601 with KST offset** (`+09:00`). Sending UTC (`Z`) or omitting the offset causes silent query window shifts.

```javascript
function toKSTString(date) {
  const offset = "+09:00";
  const d = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return d.toISOString().replace("Z", "").split(".")[0] + ".000" + offset;
}
```

## Response Headers

Every response includes:

- `GNCP-GW-Trace-ID` — unique request trace ID (include in bug reports)
- `GNCP-GW-HttpClient-ResponseTime` — processing time in milliseconds

## Links

- API Reference: https://apicenter.commerce.naver.com/docs/commerce-api/current
- Auth Guide: https://apicenter.commerce.naver.com/docs/auth
- REST API Spec: https://apicenter.commerce.naver.com/docs/restful-api
- GitHub Tech Support: https://github.com/commerce-api-naver/commerce-api
