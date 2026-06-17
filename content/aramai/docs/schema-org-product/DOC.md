---
name: schema-org-product
description: "Schema.org Product structured data markup — JSON-LD patterns for e-commerce, SEO, and rich search results covering offers, reviews, variants, and availability"
metadata:
  languages: "json"
  versions: "22.0"
  revision: 1
  updated-on: "2026-05-29"
  source: community
  tags: "schema.org,structured-data,seo,json-ld,product,ecommerce,rich-results"
---

# Schema.org Product Structured Data

Schema.org Product markup enables rich search results (price, availability, rating, breadcrumbs) in Google, Bing, and other search engines. The recommended encoding is JSON-LD, injected as a `<script type="application/ld+json">` block.

**Schema.org version:** 22.0 | **Format:** JSON-LD | **Google Rich Results Test:** [rich results test](https://search.google.com/test/rich-results)

## Minimal Valid Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Acme Pro Widget",
  "offers": {
    "@type": "Offer",
    "price": "49.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

## Full Product with All Key Properties

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Acme Pro Widget XL",
  "alternateName": "Widget XL",
  "description": "The Acme Pro Widget XL delivers industry-leading performance in a compact form factor. Ideal for high-throughput environments.",
  "sku": "WIDGET-XL-001",
  "mpn": "AXL-2024-001",
  "gtin14": "01234567890128",
  "brand": {
    "@type": "Brand",
    "name": "Acme"
  },
  "manufacturer": {
    "@type": "Organization",
    "name": "Acme Manufacturing Co.",
    "url": "https://acme.example.com"
  },
  "model": "XL-2024",
  "color": "Midnight Black",
  "material": "Aluminum",
  "weight": {
    "@type": "QuantitativeValue",
    "value": 1.2,
    "unitCode": "KGM"
  },
  "width": {
    "@type": "QuantitativeValue",
    "value": 150,
    "unitCode": "MMT"
  },
  "height": {
    "@type": "QuantitativeValue",
    "value": 80,
    "unitCode": "MMT"
  },
  "image": [
    "https://acme.example.com/images/widget-xl-front.jpg",
    "https://acme.example.com/images/widget-xl-side.jpg"
  ],
  "url": "https://acme.example.com/products/widget-xl",
  "category": "Electronics > Gadgets > Widgets",
  "keywords": "widget, pro, xl, acme, gadget",
  "offers": {
    "@type": "Offer",
    "url": "https://acme.example.com/products/widget-xl",
    "priceCurrency": "USD",
    "price": "149.99",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "Acme Store"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "0",
        "currency": "USD"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "US"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 1,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 3,
          "maxValue": 5,
          "unitCode": "DAY"
        }
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "US",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "342",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": { "@type": "Person", "name": "Jane M." },
      "datePublished": "2026-01-15",
      "reviewBody": "Excellent build quality. Shipped fast and works perfectly."
    }
  ]
}
```

## Multiple Offers (Variants / Sellers)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Acme Widget",
  "offers": [
    {
      "@type": "Offer",
      "name": "Black",
      "sku": "WIDGET-BLK",
      "price": "49.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    {
      "@type": "Offer",
      "name": "White",
      "sku": "WIDGET-WHT",
      "price": "49.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    {
      "@type": "Offer",
      "name": "Refurbished",
      "sku": "WIDGET-REFURB",
      "price": "29.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/RefurbishedCondition"
    }
  ]
}
```

## Product Variants with ItemList

For product pages with size/color selectors, use `ProductGroup` (new in schema.org 16.0):

```json
{
  "@context": "https://schema.org",
  "@type": "ProductGroup",
  "name": "Acme Widget",
  "description": "Available in three sizes",
  "productGroupID": "widget-group-001",
  "variesBy": ["https://schema.org/size", "https://schema.org/color"],
  "hasVariant": [
    {
      "@type": "Product",
      "name": "Acme Widget — Small Black",
      "sku": "WIDGET-S-BLK",
      "size": "S",
      "color": "Black",
      "offers": {
        "@type": "Offer",
        "price": "39.99",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "Product",
      "name": "Acme Widget — Large White",
      "sku": "WIDGET-L-WHT",
      "size": "L",
      "color": "White",
      "offers": {
        "@type": "Offer",
        "price": "59.99",
        "priceCurrency": "USD",
        "availability": "https://schema.org/LimitedAvailability"
      }
    }
  ]
}
```

## Key Field Reference

### Product

| Property | Type | Google Required | Notes |
|----------|------|----------------|-------|
| `name` | Text | Yes | Product title |
| `image` | URL\|ImageObject | Yes (for rich results) | Min 160x90px; multiple angles recommended |
| `description` | Text | Recommended | Up to 5000 chars |
| `sku` | Text | Recommended | Your internal SKU |
| `mpn` | Text | Recommended | Manufacturer part number |
| `gtin14` / `gtin13` / `gtin8` / `isbn` | Text | Recommended | Global trade identifier |
| `brand` | Brand | Recommended | Required for Merchant Center |
| `offers` | Offer\|array | Yes (for price rich result) | — |
| `aggregateRating` | AggregateRating | Recommended | Enables star display |
| `review` | Review\|array | Recommended | — |

### Offer

| Property | Type | Notes |
|----------|------|-------|
| `price` | Text | Use string, not number: `"49.99"` |
| `priceCurrency` | Text | ISO 4217 (`USD`, `EUR`) |
| `availability` | URL | See availability values below |
| `itemCondition` | URL | See condition values below |
| `priceValidUntil` | Date | YYYY-MM-DD; required if price fluctuates |
| `url` | URL | Deep link to the offer page |
| `seller` | Organization | Recommended for multi-seller |

### `availability` Values

| Value | Meaning |
|-------|---------|
| `https://schema.org/InStock` | Available now |
| `https://schema.org/OutOfStock` | Temporarily unavailable |
| `https://schema.org/PreOrder` | Available for pre-order |
| `https://schema.org/BackOrder` | On back order |
| `https://schema.org/LimitedAvailability` | Low stock |
| `https://schema.org/Discontinued` | No longer sold |
| `https://schema.org/SoldOut` | Permanently out of stock |

### `itemCondition` Values

| Value | Meaning |
|-------|---------|
| `https://schema.org/NewCondition` | Brand new |
| `https://schema.org/RefurbishedCondition` | Refurbished/renewed |
| `https://schema.org/UsedCondition` | Pre-owned / second-hand |
| `https://schema.org/DamagedCondition` | Damaged / as-is |

## Breadcrumb + Product Combined

```json
[
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://acme.example.com" },
      { "@type": "ListItem", "position": 2, "name": "Electronics", "item": "https://acme.example.com/electronics" },
      { "@type": "ListItem", "position": 3, "name": "Acme Pro Widget XL" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Acme Pro Widget XL",
    "offers": { "@type": "Offer", "price": "149.99", "priceCurrency": "USD", "availability": "https://schema.org/InStock" }
  }
]
```

## HTML Injection Pattern

```html
<!-- Place before </body> or in <head> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Acme Pro Widget XL",
  "offers": {
    "@type": "Offer",
    "price": "149.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "342"
  }
}
</script>
```

## Dynamic Rendering (Next.js / React)

```tsx
// components/ProductSchema.tsx
export function ProductSchema({ product }: { product: Product }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      price: product.price.toString(),
      priceCurrency: product.currency,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: product.priceValidUntil,
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating.average.toString(),
          reviewCount: product.rating.count.toString(),
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

## Google Merchant Center (Free Listings)

For Merchant Center integration, these additional fields are required/recommended:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Acme Pro Widget XL",
  "brand": { "@type": "Brand", "name": "Acme" },
  "gtin14": "01234567890128",
  "mpn": "AXL-2024-001",
  "offers": {
    "@type": "Offer",
    "price": "149.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "priceValidUntil": "2026-12-31",
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "0",
        "currency": "USD"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "US"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 5, "unitCode": "DAY" }
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "US",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    }
  }
}
```

## Common Pitfalls

- **Price as number**: Always use `"price": "49.99"` (string), not `"price": 49.99`. Schema.org spec says Text, and Google's validator flags numbers.
- **Missing `priceValidUntil`**: Google may suppress rich results or show warnings for offers without an expiry date in markets where prices fluctuate frequently.
- **`availability` as text**: Use the full schema.org URL (`"https://schema.org/InStock"`), not `"InStock"` — validators accept both but the URL form is canonical.
- **Rating without reviews**: `aggregateRating` should have `reviewCount` > 0. An aggregate rating with zero reviews triggers a Google Search Console warning.
- **Duplicate `@context`**: In a multi-block JSON-LD array, each object gets its own `@context`. In a single object, set it once at the root.
- **Images**: Google requires at least one image for product rich results. Minimum size: 160x90px. Aspect ratios 4:3 or 16:9 recommended.
- **`@id` for deduplication**: Add `"@id": "https://acme.example.com/products/widget-xl"` when the same product appears on multiple pages to prevent duplicate entries in the knowledge graph.

## See Also

- [References: SoftwareApplication, Book, Recipe, Event, and other product-adjacent types](references/advanced.md)
