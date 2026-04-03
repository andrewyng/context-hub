---
name: mercadolibre-api
description: >
  Complete MercadoLibre REST API reference for building seller tools. Use when
  writing code that calls api.mercadolibre.com — items, orders, users, categories,
  shipping, questions, notifications, advertising, promotions, trends, reviews,
  claims, billing, and catalog competition endpoints. Triggers on MeLi API calls,
  MercadoLibre integration, or marketplace endpoint usage.
metadata:
  source: community
---

# MercadoLibre REST API — Complete Reference

Base URL: `https://api.mercadolibre.com`

## Authentication

All authenticated endpoints require: `Authorization: Bearer {ACCESS_TOKEN}`

### OAuth 2.0 Token Exchange

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
```

**Authorization Code Grant:**

| Field           | Value                   |
| --------------- | ----------------------- |
| `grant_type`    | `authorization_code`    |
| `client_id`     | App ID                  |
| `client_secret` | App secret              |
| `code`          | Auth code from redirect |
| `redirect_uri`  | Registered callback URI |

**Refresh Token Grant:**

| Field           | Value                |
| --------------- | -------------------- |
| `grant_type`    | `refresh_token`      |
| `client_id`     | App ID               |
| `client_secret` | App secret           |
| `refresh_token` | Stored refresh token |

**Response:**

```json
{
  "access_token": "APP_USR-...",
  "token_type": "Bearer",
  "expires_in": 21600,
  "scope": "offline_access read write",
  "user_id": 123456789,
  "refresh_token": "TG-..."
}
```

- Tokens expire in 6 hours (21600s)
- Always send access token via `Authorization` header, never as query parameter
- Refresh proactively before expiration

### Authorization URL

```
https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id={APP_ID}&redirect_uri={REDIRECT_URI}
```

Replace `.com.ar` with the appropriate country domain (`.com.mx`, `.com.co`, `.com.br`, `.cl`, `.com.uy`, `.com.pe`).

---

## 1. Users

### GET /users/me

Get authenticated user profile.

**Auth:** Bearer token

**Response fields:** `id`, `nickname`, `email`, `first_name`, `last_name`, `thumbnail.picture_url`, `site_id`, `country_id`, `seller_reputation.level_id`, `seller_reputation.power_seller_status`, `seller_reputation.transactions.completed`, `seller_reputation.transactions.total`, `seller_reputation.transactions.ratings.positive/negative/neutral`

### GET /users/{user_id}

Get user by ID. Same response structure.

**Auth:** Bearer token (for full profile) or public (limited fields)

### PUT /users/{user_id}

Update user information.

**Auth:** Bearer token (owner only)

---

## 2. Sites, Currencies & Locations

### GET /sites

List all MeLi marketplace sites.

**Auth:** Public

**Response:** Array of `{ id, name, default_currency_id, ... }`

**Key site IDs:**

| Site ID | Country   | Currency |
| ------- | --------- | -------- |
| `MLA`   | Argentina | ARS      |
| `MLB`   | Brazil    | BRL      |
| `MLM`   | Mexico    | MXN      |
| `MCO`   | Colombia  | COP      |
| `MLC`   | Chile     | CLP      |
| `MLU`   | Uruguay   | UYU      |
| `MPE`   | Peru      | PEN      |

### GET /sites/{site_id}

Get site details.

### GET /sites/{site_id}/listing_types

Available listing types for a site.

### GET /sites/{site_id}/listing_exposures

Exposure levels per listing type.

### GET /currencies

List all currencies.

### GET /currencies/{currency_id}

Currency details.

### GET /currency_conversions/search?from={FROM}&to={TO}

Currency conversion rate. Returns `{ "ratio": 0.0704988 }`.

### GET /countries

List all countries.

### GET /countries/{country_id}

Country details with states.

### GET /countries/{country_id}/states/{state_id}

State details with cities.

### GET /countries/{country_id}/zip_codes/{zip_code}

Location info for a postal code.

### GET /classified_locations/countries

List countries with locale and currency.

### GET /classified_locations/countries/{country_id}

Country with states, decimal/thousands separators, time zone.

### GET /classified_locations/states/{state_id}

State with cities list.

### GET /classified_locations/cities/{city_id}

City details with geo coordinates.

---

## 3. Categories

### GET /sites/{site_id}/categories

Top-level categories for a site.

**Auth:** Public

### GET /categories/{category_id}

Category details including `name`, `path_from_root[]`, `children_categories[]`, `settings.catalog_domain`.

**Auth:** Public

### GET /categories/{category_id}/attributes

All attributes for a category.

**Auth:** Public

**Response:** Array of attribute objects:

```json
{
  "id": "BRAND",
  "name": "Marca",
  "value_type": "string",
  "attribute_group_id": "MAIN",
  "tags": {
    "required": true,
    "catalog_required": true,
    "allow_variations": false,
    "variation_attribute": false,
    "hidden": false,
    "read_only": false,
    "multivalued": false
  },
  "values": [{ "id": "2503", "name": "Nike" }]
}
```

**Key `tags`:**

- `required` — mandatory for publishing
- `catalog_required` — mandatory for catalog
- `allow_variations` — can vary per SKU
- `variation_attribute` — pure variation (size, color)
- `hidden` — don't show to user
- `read_only` — system-set only

### GET /sites/{site_id}/domain_discovery/search?q={query}&limit={n}

Category prediction from text. Returns best matching categories.

**Auth:** Public

**Response:**

```json
[
  {
    "domain_id": "MLA-SNEAKERS",
    "domain_name": "Zapatillas",
    "category_id": "MLA109027",
    "category_name": "Zapatillas Urbanas"
  }
]
```

### GET /sites/{site_id}/categories/all

Download full category tree (large response, use for bulk sync).

### GET /sites/{site_id}/category_predictor/predict?title={title}

Predict category from item title. Returns `{ id, name, prediction_class, path_from_root[] }`. Auth: Public.

---

## 4. Items (Listings)

### POST /items

Create a new listing.

**Auth:** Bearer token

**Request body:**

```json
{
  "title": "string (max 60 chars)",
  "category_id": "MLA109027",
  "price": 45000,
  "currency_id": "ARS",
  "available_quantity": 10,
  "buying_mode": "buy_it_now",
  "condition": "new|used|refurbished",
  "listing_type_id": "free|gold_special|gold_pro",
  "pictures": [{ "source": "https://..." }],
  "attributes": [
    { "id": "BRAND", "value_name": "Nike" },
    { "id": "COLOR", "value_id": "52049", "value_name": "Negro" }
  ],
  "shipping": {
    "mode": "me2",
    "free_shipping": true,
    "local_pick_up": false
  },
  "sale_terms": [
    { "id": "WARRANTY_TYPE", "value_name": "Garantia del vendedor" },
    { "id": "WARRANTY_TIME", "value_name": "180 dias" }
  ],
  "variations": [
    {
      "attribute_combinations": [
        { "id": "SIZE", "value_name": "38" },
        { "id": "COLOR", "value_name": "Negro" }
      ],
      "available_quantity": 5,
      "price": 45000,
      "picture_ids": ["image1.webp"]
    }
  ],
  "seller_custom_field": "SKU-12345"
}
```

**Package dimension attributes (optional):**
`SELLER_PACKAGE_HEIGHT`, `SELLER_PACKAGE_WIDTH`, `SELLER_PACKAGE_LENGTH` (cm), `SELLER_PACKAGE_WEIGHT` (g)

**Response:** `{ id, permalink, status, sub_status[] }`

**Notes:**

- Description CANNOT be included — use `/items/{id}/description` separately
- Pictures are URLs; MeLi downloads and hosts them
- `value_id` resolved against category attribute values; fallback to `value_name` only

### GET /items/{item_id}

Get item details.

**Auth:** Public (basic) / Bearer (full details including seller data)

**Query:** `?attributes=field1,field2` to project specific fields

### PUT /items/{item_id}

Update item fields. Only send fields to change.

**Auth:** Bearer token (owner)

**Updatable fields:** `title`, `price`, `available_quantity`, `pictures`, `attributes`, `shipping`, `status` (`active`/`paused`/`closed`), `description`, `video_id`

### GET /items?ids={id1,id2,...}&attributes={fields}

Multi-item batch fetch. Max 20 IDs per call.

**Auth:** Bearer token

**Response:** Array of `{ code: 200|404, body: {...} }`

### POST /items/{item_id}/description

Add/set item description (separate from item creation).

**Auth:** Bearer token

**Body:** `{ "plain_text": "Description text..." }`

### PUT /items/{item_id}/description

Update existing description.

### GET /items/{item_id}/description

Get item description.

### POST /items/{item_id}/pictures

Add pictures to existing item.

**Body:** `{ "source": "https://url-to-image" }`

### DELETE /items/{item_id}/pictures/{picture_id}

Remove a picture.

### POST /pictures/items/upload

Upload picture via multipart/form-data (`file` field) or JSON `{ "source": "url" }`. Returns `{ id, url, secure_url, size, max_size }`. Min 500x500px, recommended 1200x1200px, max 10MB.

### GET /items/{item_id}/variations

List all variations for an item. Returns array with `id`, `price`, `available_quantity`, `sold_quantity`, `attribute_combinations[]`, `picture_ids[]`, `seller_custom_field`.

### GET /items/{item_id}/variations/{variation_id}

Get single variation details.

### POST /items/{item_id}/variations

Add variation to existing item. Body: `{ attribute_combinations, available_quantity, price, picture_ids, seller_custom_field }`.

### PUT /items/{item_id}/variations/{variation_id}

Update variation (price, stock, pictures).

### DELETE /items/{item_id}/variations/{variation_id}

Remove a variation.

### GET /items/{item_id}/health

Item quality/health score (0.0-1.0). Groups: `title`, `pictures`, `description`, `attributes`, `shipping`, `price`. Each group has `actions[]` with `status` (good/warning/error), `penalty`, and `message`. Calculated async after publication.

### GET /users/{user_id}/items/search

Search seller's items.

**Auth:** Bearer token

**Params:** `status` (active/paused/closed), `limit`, `offset`, `search_type`, `orders` (relevance/price_asc/price_desc), `sku` (seller_custom_field filter), `include_filters=true`

**Response:** `{ results: [item_ids], paging: { total, offset, limit } }`

### GET /marketplace/users/cap

Seller listing capacity/limits by reputation level.

---

## 5. Search

### GET /sites/{site_id}/search

Public marketplace search.

**Auth:** Public

**Params:**
| Param | Description |
|-------|-------------|
| `q` | Search query text |
| `category` | Category ID filter |
| `seller_id` | Filter by seller |
| `sort` | `relevance`, `price_asc`, `price_desc` |
| `limit` | Results per page (max 50) |
| `offset` | Pagination offset (max 1000) |
| `price` | Price range: `100-500`, `*-500`, `100-*` |
| `condition` | `new`, `used` |
| `shipping` | `mercadoenvios` |
| `shipping_cost` | `free` |
| `power_seller` | `yes` |
| `has_pictures` | `yes` |

**Response:** `{ results[], paging, filters[], available_filters[], available_sorts[], sort }`

### GET /sites/{site_id}/search?nickname={seller_nickname}

Search by seller nickname.

---

## 6. Orders

### GET /orders/search?seller={seller_id}

Search seller orders.

**Auth:** Bearer token — rate limit 100 req/min

**Filters:**
| Filter | Description |
|--------|-------------|
| `seller` | Seller ID (required) |
| `order.status` | `confirmed`, `payment_required`, `payment_in_process`, `partially_paid`, `paid`, `partially_refunded`, `pending_cancel`, `cancelled` |
| `order.date_created.from/to` | ISO 8601 timestamps |
| `order.date_closed.from/to` | Close date range |
| `order.date_last_updated.from/to` | Last update range |
| `q` | Search: order id, item id, title, nickname |
| `tags` / `tags.not` | Filter/exclude tags |
| `sort` | `date_asc` (default), `date_desc` |
| `limit` | Max 50 |
| `offset` | Pagination |

**Response fields per order:**

```json
{
  "id": 2032217210,
  "status": "paid",
  "date_created": "ISO8601",
  "date_closed": "ISO8601",
  "total_amount": 129.95,
  "paid_amount": 129.95,
  "shipping_cost": 0,
  "currency_id": "BRL",
  "taxes": { "amount": null, "currency_id": null },
  "coupon": { "amount": 0 },
  "order_items": [{
    "item": { "id", "title", "category_id", "seller_sku", "variation_id" },
    "quantity": 1,
    "unit_price": 129.95,
    "sale_fee": 14.29,
    "listing_type_id": "gold_special"
  }],
  "payments": [{
    "id": 4792155710,
    "status": "approved",
    "transaction_amount": 129.95,
    "total_paid_amount": 129.95,
    "marketplace_fee": 14.29,
    "shipping_cost": 0,
    "taxes_amount": 0,
    "installments": 1,
    "payment_method_id": "master",
    "payment_type": "credit_card"
  }],
  "shipping": { "id": 27968238880 },
  "buyer": { "id": 89660613 },
  "seller": { "id": 239432672 },
  "tags": ["delivered", "paid"],
  "pack_id": null
}
```

**Key financial fields:**

- `order_items[].sale_fee` — MeLi commission per item
- `payments[].marketplace_fee` — MeLi fee in payment
- `order_items[].unit_price` — actual sale price
- `order_items[].gross_price` — pre-discount price (null if no discounts)

**Notes:**

- HTTP 206 possible if data incomplete; check `X-Content-Missing` header
- If `pack_id` is not null, query `/marketplace/orders/pack/{pack_id}` for all orders in pack
- Orders stored up to 12 months

### GET /orders/{order_id}

Single order details. Same structure as search results item.

### GET /orders/{order_id}/discounts

Order discount breakdown.

**Response:** `{ details: [{ type, items[].amounts.total, items[].amounts.seller }] }`
Types: `coupon`, `discount`, `cashback`

### GET /marketplace/orders/pack/{pack_id}

Get all orders in a pack (multi-item purchase).

### GET /marketplace/orders/{order_id}/billing_info

Buyer fiscal/billing data for invoicing.

---

## 7. Shipping

### GET /shipments/{shipment_id}

Shipment details.

**Auth:** Bearer token

**Key statuses:** `pending`, `handling`, `ready_to_ship`, `shipped`, `delivered`, `not_delivered`, `cancelled`, `returned`

**Response fields:** `id`, `mode`, `order_id`, `order_cost`, `site_id`, `status`, `substatus`, `tracking_number`, `tracking_method`, `service_id`, `sender_id`, `receiver_id`, `sender_address`, `receiver_address`, `shipping_option.{list_cost, cost, currency_id, estimated_delivery_time}`, `shipping_items[]`, `logistic_type`, `cost_components.{special_discount, loyal_discount, compensation}`, `status_history.{date_handling, date_ready_to_ship, date_shipped, date_delivered, ...}`

### GET /shipments/{shipment_id}/costs

Real shipping costs breakdown (post-delivery). Returns `{ gross_amount, discount.{rate, type, promoted_amount}, receiver, sender, currency_id }`.

### GET /shipments/{shipment_id}/items

Items included in the shipment with quantities and dimensions.

### GET /shipments/{shipment_id}/lead_time

Delivery time estimates. Use header `x-format-new: true` for new cost format.

### GET /shipments/{shipment_id}/tracking

Tracking events timeline: `{ tracking_id, tracking_url, tracking_events[].{date, status, substatus, description} }`

### GET /shipments/{shipment_id}/labels

Shipping label as PDF. Use `Accept: application/pdf`. For thermal printers: `?response_type=zpl2`.

### POST /shipments/{shipment_id}/ready_to_ship

Mark as ready to ship (for Colecta/Flex logistic types).

### GET /users/{user_id}/shipping_options/free

Simulate shipping cost before publishing.

**Auth:** Bearer token

**Params:**
| Param | Format | Description |
|-------|--------|-------------|
| `dimensions` | `HxWxL,WEIGHT` | e.g., `10x20x15,500` (cm, grams) |
| `item_id` | string | Alternative to dimensions |
| `item_price` | number | Item price |
| `listing_type_id` | string | `gold_special`, `gold_pro`, etc. |
| `mode` | string | `me2` |
| `condition` | string | `new` or `used` |
| `free_shipping` | boolean | Free for buyer |

**Response:** `{ coverage.all_country: { list_cost, currency_id, billable_weight } }`

### GET /marketplace/items/{item_id}/shipping_options/cost

Shipping cost for marketplace item.

### GET /items/{item_id}/shipping_options?zip_code={zip}

All available shipping options for an item and destination zip code.

### GET /orders/{order_id}/shipments

All shipments associated with an order (useful for packs/multi-item orders).

### PUT /shipments/{shipment_id}

Update shipment (add tracking number).

**Body:** `{ "tracking_number": "XXX" }`

### GET /sites/{site_id}/shipping/methods

Available shipping methods for a site.

---

## 8. Listing Prices (Fees)

### GET /sites/{site_id}/listing_prices

Calculate MeLi commission fees.

**Auth:** Bearer token

**Params:**
| Param | Required | Description |
|-------|----------|-------------|
| `price` | Yes | Item price |
| `category_id` | Yes | Category ID |
| `listing_type_id` | No | Filter by type |
| `shipping_mode` | No | `me2`, `me1`, `custom` |
| `logistic_type` | No | e.g., `drop_off` |
| `billable_weight` | No | Weight in grams (required for MLA) |

**Response:** Array of fee objects per listing type:

```json
{
  "listing_type_id": "gold_pro",
  "listing_type_name": "Premium",
  "sale_fee_amount": 1250.0,
  "sale_fee_details": {
    "fixed_fee": 0,
    "gross_amount": 1250.0,
    "percentage_fee": 25.0,
    "meli_percentage_fee": 25.0,
    "financing_add_on_fee": 0
  },
  "listing_fee_amount": 0,
  "currency_id": "ARS"
}
```

---

## 9. Questions & Answers

### GET /questions/search?seller_id={id}&api_version=4

Search seller's received questions.

**Auth:** Bearer token

**Params:** `seller_id`, `item_id`, `status` (UNANSWERED/ANSWERED/CLOSED_UNANSWERED/UNDER_REVIEW), `sort_fields` (date_created), `sort_types` (ASC/DESC), `from`, `to`, `limit`, `offset`, `api_version=4`

### GET /questions/{question_id}

Get single question details.

### POST /answers

Answer a question.

**Auth:** Bearer token

**Body:** `{ "question_id": 3957150025, "text": "Answer text..." }`

**Note:** Use UTF-8 encoding. Unanswered questions older than 7 months are auto-deleted.

### GET /my/received_questions/search

Alternative endpoint for received questions with same filters.

### DELETE /questions/{question_id}

Delete/hide a question.

### POST /questions

Ask a question on an item (buyer). Body: `{ "item_id": "MLA123", "text": "question" }`.

### POST /users/{seller_id}/questions_blacklist

Block a buyer from asking questions. Body: `{ "user_id": buyer_id }`.

### GET /users/{seller_id}/questions_blacklist

List blocked buyers.

---

## 10. Notifications (Webhooks)

### Configuration

Register webhook URL in MeLi Developer Console or via API.

### POST /applications/{app_id}/webhooks

Register a webhook.

**Body:** `{ "topic": "items", "callback_url": "https://...", "user_id": 123 }`

### Available Topics

| Topic              | Triggers on                                  |
| ------------------ | -------------------------------------------- |
| `items`            | Listing changes (status, price, stock)       |
| `orders_v2`        | Order creation/changes                       |
| `questions`        | New questions or answers                     |
| `payments`         | Payment creation/status changes              |
| `shipments`        | Shipping status changes                      |
| `messages`         | New post-sale messages                       |
| `claims`           | Claim creation/changes                       |
| `item_competition` | Buy Box status changes (requires permission) |

### Webhook Payload

```json
{
  "resource": "/items/MLA123456",
  "user_id": 123456789,
  "topic": "items",
  "application_id": 987654321,
  "attempts": 1,
  "sent": "2026-03-29T10:00:00.000Z",
  "received": "2026-03-29T10:00:00.100Z"
}
```

**Requirements:**

- Respond HTTP 200 within 500ms
- MeLi retries with exponential backoff on failure (immediate, ~5min, ~45min, then hours)
- Payload only says WHAT changed — GET the resource for current state

### POST /myfeeds?app_id={app_id}

Retrieve missed/pending notifications for your app. Auth: Bearer token.

---

## 11. Visits & Metrics

### GET /visits/items?ids={item_id}

Item visit counts.

**Auth:** Bearer token

**Response:** `[{ item_id, total_visits, date_from, date_to }]`

### GET /item/{item_id}/performance

Item performance/quality score.

**Auth:** Bearer token

**Note:** URL uses `/item/` (singular), not `/items/` (plural).

---

## 12. Trends

### GET /trends/{site_id}

Top trending searches for a site.

**Auth:** Public

### GET /trends/{site_id}/{category_id}

Trending searches within a category.

**Auth:** Public

**Updated:** Weekly

### GET /sites/{site_id}/hot_items/search?category={cat_id}&limit={n}

Hot items from a category.

### GET /highlights/{site_id}/{category_id}

Highlighted/featured items.

---

## 13. Reviews

### GET /reviews/item/{item_id}

Product reviews for an item.

**Auth:** Public

**Params:** `limit` (default 5, max 10000), `offset` (default 0), `catalog_product_id` (for catalog reviews)

**Response:** Rating averages, distribution, individual reviews with text and dates.

---

## 14. Promotions

### GET /marketplace/seller-promotions/users/{user_id}

All promotions for a seller. Requires `v2` version header.

**Auth:** Bearer token

**Promotion types:** `DEAL` (sales events), `PRICE_DISCOUNT` (regular), `DOD` (deal of the day), `LIGHTNING`, `MARKETPLACE_CAMPAIGN` (co-funded), `PRE_NEGOTIATED`, `SELLER_CAMPAIGN`

### GET /marketplace/seller-promotions/promotions/{promotion_id}/items

Items in a specific promotion.

### POST /marketplace/seller-promotions/items/{item_id}

Add item to a seller campaign.

**Body:** `{ "promotion_id": "...", "promotion_type": "SELLER_CAMPAIGN", "deal_price": 35000 }`

### DELETE /marketplace/seller-promotions/items/massive/{item_id}

Remove all offers from an item.

---

## 15. Advertising (Product Ads)

### GET /marketplace/advertising/{site_id}/advertisers/{advertiser_id}/product_ads/campaigns/search

List campaigns. (Note: `/search` suffix is required since 2025)

**Auth:** Bearer token

### POST /marketplace/advertising/{site_id}/advertisers/{advertiser_id}/product_ads/campaigns

Create a campaign.

### PUT /marketplace/advertising/{site_id}/advertisers/{advertiser_id}/product_ads/campaigns/{campaign_id}

Update campaign (budget, status, strategy).

### GET /marketplace/advertising/{site_id}/advertisers/{advertiser_id}/product_ads/campaigns/{campaign_id}/ads

List ads in a campaign.

**Ad modes:**

- **Automatic:** MeLi selects listings based on sales performance
- **Customized:** Manual control over campaigns, budgets, and ad targeting

**Metrics available:** clicks, impressions, CPC, conversion rate, ROAS

---

## 16. Catalog Competition (Buy Box)

Requires `Item Competition` permission under `Catalog` scope.

### GET /items/{item_id}/price_to_win?siteId={site_id}&version=v2

Competition snapshot for a listing.

**Auth:** Bearer token

**Response:**

```json
{
  "item_id": "MCO1234567890",
  "catalog_product_id": "MCO7779948",
  "status": "winning|sharing_first_place|competing|listed",
  "current_price": { "amount": 150000, "usd_amount": 37.5 },
  "price_to_win": { "amount": 142000, "usd_amount": 35.5 },
  "visit_share": 0.12,
  "competitors_sharing_first_place": null,
  "winner": { "item_id": "...", "price": {...}, "boosts": [...] },
  "boosts": [
    { "type": "free_shipping", "status": "opportunity" },
    { "type": "free_installments", "status": "boosted" },
    { "type": "full", "status": "not_apply" }
  ]
}
```

**Statuses:** `winning` (highest visibility), `sharing_first_place`, `competing` (losing), `listed` (blocked)

**Boosts:** `full`, `free_shipping`, `same_day_shipping`, `free_installments`, `shipping_collect`

### GET /items/{item_id}/variations/catalog-competition

Competition per variation (size/color).

### GET /products/{catalog_product_id}

Product page with `buy_box_winner` field.

---

## 17. Billing

### GET /billing/integration/periods

Available billing periods (last 6-12 months).

**Auth:** Bearer token

### GET /billing/integration/periods/key/{key}/summary

Period summary.

**Params:** `document_type` (BILL/CREDIT_NOTE), `group` (ML/MP)

**For Mexico:** Use `/periods/{EXPIRATION_DATE}/summary`

### GET /billing/integration/periods/key/{key}/group/{group}/details

Billing charge details with pagination.

**Params:** `document_type`, `group` (ML/MP), `limit`, `offset`

**Charge types:** sale commissions, listing fees, fiscal documents, shipping costs, Mercado Shops, advertising campaigns

---

## 18. Payments / Collections

### GET /v1/payments/{payment_id}

Full payment details.

**Auth:** Bearer token

**Key response fields:** `id`, `status`, `status_detail`, `date_created`, `date_approved`, `money_release_date`, `money_release_status`, `collector_id`, `payer_id`, `order_id`, `transaction_amount`, `total_paid_amount`, `net_received_amount`, `marketplace_fee`, `shipping_amount`, `taxes_amount`, `coupon_amount`, `installments`, `installment_amount`, `currency_id`, `payment_method_id`, `payment_type_id`, `operation_type`, `fee_details[]`, `charges_details[]`, `refunds[]`, `available_actions`

**Payment statuses:** `pending`, `approved`, `authorized`, `in_process`, `in_mediation`, `rejected`, `cancelled`, `refunded`, `charged_back`

### GET /v1/payments/search?collector.id={seller_id}

Search seller payments.

**Params:** `status`, `begin_date`, `end_date`, `sort` (date_created/date_approved), `criteria` (asc/desc), `limit`, `offset`, `external_reference`

### POST /v1/payments/{payment_id}/refunds

Full or partial refund.

**Full refund:** No body needed.
**Partial refund:** `{ "amount": 1500.00 }`

**Response:** `{ id, payment_id, amount, status, date_created, source }`

---

## 19. Claims & Returns

### GET /v1/claims/search?seller_id={id}

Search claims.

**Auth:** Bearer token

**Params:** `seller_id`, `buyer_id`, `status` (opened/closed/closed_with_resolution), `type`, `resource_id` (order/shipment ID), `stage`, `limit`, `offset`

**Claim reason IDs:** `PRODUCT_NOT_AS_DESCRIBED`, `PRODUCT_NOT_RECEIVED`, `PRODUCT_DEFECTIVE`, `MISSING_PRODUCT`, `WRONG_PRODUCT`, `INCOMPLETE_PRODUCT`

### GET /v1/claims/{claim_id}

Claim details including messages, resolution, available actions.

**Key fields:** `id`, `resource_id`, `type`, `stage`, `status`, `reason_id`, `date_created`, `resolution.{reason, date, benefited}`, `players[]`, `actions[].{action, due_date}`

### GET /v1/claims/{claim_id}/messages

Conversation thread for a claim.

### POST /v1/claims/{claim_id}/messages

Send message on claim.

**Body:** `{ "message": "text", "role": "respondent" }`

### POST /v1/claims/{claim_id}/action

Seller action on claim.

**Body:** `{ "action": "refund|accept_return|reject_return|send_new_product|provide_tracking" }`

### GET /marketplace/returns/{return_id}

Return details. Returns linked to claims are treated as claims of type `returns`.

The order `order_request.return` field indicates if a return was initiated: `{ id, status, date_created }`.

---

## 20. Post-Sale Messaging

### GET /messages/packs/{pack_id}/sellers/{seller_id}

Messages for a pack/order.

**Auth:** Bearer token

**Params:** `limit`, `offset`, `mark_as_read` (boolean)

**Response fields per message:** `id`, `from.user_id`, `to.user_id`, `date_created`, `date_read`, `status`, `text`, `message_attachments[]`, `moderation.{status, reason}`

### POST /messages/packs/{pack_id}/sellers/{seller_id}

Send post-sale message.

**Body:** `{ "from": { "user_id": seller_id }, "to": { "user_id": buyer_id }, "text": "message" }`

For orders without packs, use `/messages/orders/{order_id}/sellers/{seller_id}`.

### POST /messages/attachments

Upload attachment (multipart/form-data). Returns attachment ID for use in messages.

### PUT /messages/{message_id}/read

Mark message as read.

### GET /messages/unread?seller={seller_id}

Unread message count. Response: `{ total, results[].{pack_id, unread_count} }`

### GET /marketplace/messages/pending

Pending messages count.

---

## 20. Products (Catalog)

### GET /products/{product_id}

Catalog product details.

### GET /products/search?q={query}&site_id={site_id}

Search catalog products.

---

## Rate Limits

- Default: ~100 requests/minute per access token (varies by endpoint)
- `/orders/search`: 100 req/min
- Batch endpoints (`/items?ids=...`): max 20 IDs per call
- Search: max offset 1000
- Use webhooks to avoid polling

## Pagination

Most list endpoints use `offset`/`limit`:

- Default: `offset=0`, `limit=50`
- Max limit varies (50 for orders, 50 for search)

## Error Codes

| HTTP | Meaning                                     |
| ---- | ------------------------------------------- |
| 200  | Success                                     |
| 206  | Partial content (check `X-Content-Missing`) |
| 400  | Bad request / missing params                |
| 401  | Token expired or invalid                    |
| 403  | Insufficient permissions                    |
| 404  | Resource not found                          |
| 429  | Rate limit exceeded                         |

## Profit Calculation Formula

```
Real profit:
  Revenue       = order_items[].unit_price * quantity
  MeLi fee      = order_items[].sale_fee
  Shipping      = order.shipping_cost (or shipments/{id}/costs)
  Taxes         = order.taxes.amount
  Seller disc.  = order_items[].discounts[].amounts.seller
  COGS          = seller-provided
  Net profit    = Revenue - Fee - Shipping - Taxes - Discounts - COGS

Projected profit:
  Revenue est.  = price * estimated_quantity
  Fee est.      = /sites/{s}/listing_prices -> sale_fee_amount
  Shipping est. = /users/{id}/shipping_options/free -> coverage.all_country.list_cost
  Net projected = Revenue - Fee - Shipping - COGS
```

## Country Domains

| Country   | Auth Domain              | Site ID |
| --------- | ------------------------ | ------- |
| Argentina | auth.mercadolibre.com.ar | MLA     |
| Brazil    | auth.mercadolivre.com.br | MLB     |
| Mexico    | auth.mercadolibre.com.mx | MLM     |
| Colombia  | auth.mercadolibre.com.co | MCO     |
| Chile     | auth.mercadolibre.cl     | MLC     |
| Uruguay   | auth.mercadolibre.com.uy | MLU     |
| Peru      | auth.mercadolibre.com.pe | MPE     |

## Official Documentation

- Main: https://developers.mercadolibre.com.ar/
- Global Selling: https://global-selling.mercadolibre.com/devsite/api-docs
- Brazil: https://developers.mercadolivre.com.br/
