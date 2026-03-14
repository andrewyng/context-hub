---
name: scm
description: "Oracle Fusion Cloud SCM REST API guide for creating multi-role Inventory Items enabled for Sales Orders and Purchasing on release 26A"
metadata:
  languages: "python"
  versions: "26A"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "oracle,fusion,scm,inventory,items,supply-chain"
---
# Oracle Fusion Cloud SCM — Inventory Item REST API Guide

## 1. Golden Rules

- **Base URL pattern:** `https://{host}/fscmRestApi/resources/11.13.18.05/`
- **Auth:** Basic auth over HTTPS.
- **Resolve the Item Master Organization dynamically** — never hardcode Organization IDs.
- **Query-before-create** to prevent duplicate items.
- **30-second sync delay** after every `POST` before reading or validating.

## 2. Discover Item Master Organization

```
GET /inventoryOrganizations
```

Parse the response and find the organization where `OrganizationId == MasterOrganizationId`. This is the root Item Master. Halt if no match exists.

## 3. Query-First Check

```
GET /itemsV2?q=ItemNumber='{ItemNumber}'
```

If found, capture the existing item and skip creation.

## 4. Create Inventory Item

```
POST /itemsV2
```

```json
{
    "OrganizationId": 300000001234567,
    "ItemNumber": "ACME-INV-1234",
    "ItemDescription": "Standard Widget",
    "ItemType": "FINISHED_GOOD",
    "CustomerOrderFlag": true,
    "CustomerOrderEnabledFlag": true,
    "PurchasingFlag": true,
    "PurchasableFlag": true
}
```

### Critical Boolean Flags

By default, items are **not** available for Sales Orders or Purchase Orders. To create a multi-role item, you **must** explicitly set:

| Flag | Purpose |
|------|---------|
| `CustomerOrderFlag` | Makes item available on Sales Orders |
| `CustomerOrderEnabledFlag` | Enables item for customer ordering |
| `PurchasingFlag` | Makes item available for Procurement |
| `PurchasableFlag` | Enables item for purchasing transactions |

**Exact attribute names are mandatory.** Oracle will silently drop or reject aliases:
- `Purchased` — wrong
- `PurchasingItem` — wrong
- `PurchasableFlag` — correct

## 5. Validation Protocol

After a successful `201` response:

1. **Wait 30 seconds** for Oracle to index the new item.
2. **GET the created item** using the returned `itemsV2UniqID`.
3. **Assert** that all four boolean flags return `true`.
4. **Halt** if any assertion fails — dependent objects (PR lines, Sales Orders) will break with a misconfigured item.

## 6. Reference Documentation

- **SCM User Guide:** https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/use.html
- **SCM REST API:** https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fasrp/index.html
- **Item Creation:** https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fapim/create-item.html
