---
name: procurement
description: "Oracle Fusion Cloud Procurement REST API guide for automating Suppliers, Addresses, Sites, Site Assignments, Contacts, and Purchase Requisitions on release 26A"
metadata:
  languages: "python"
  versions: "26A"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "oracle,fusion,procurement,suppliers,purchase-requisitions,erp,p2p"
---
# Oracle Fusion Cloud Procurement — REST API Coding Guide

## 1. Golden Rules

- **Base URL pattern:** `https://{host}/fscmRestApi/resources/11.13.18.05/`
- **Auth:** Basic auth over HTTPS. Every request must include credentials.
- **Never hardcode IDs.** Always resolve Business Units, Organizations, and Preparer IDs dynamically via `GET` before creating objects.
- **Query-before-create.** Always `GET` to check if the object exists before `POST`ing to prevent duplicates.
- **30-second sync delay.** Oracle indexes new objects asynchronously. Wait 30 seconds after every `POST` before attempting to read or extend the created object.

## 2. Supplier Provisioning (End-to-End)

Creating a usable Supplier requires five sequential steps. Each step depends on the previous one.

### 2.1 Discover Procurement Business Unit

```
GET /procurementBusinessUnitsLOV
```

Parse the response to extract a valid `ProcurementBUId`. Halt if zero or ambiguous results.

### 2.2 Query-First Check

```
GET /suppliers?q=Supplier='{SupplierName}'
```

If found, capture the existing `SupplierId` and skip creation.

### 2.3 Create Supplier

```
POST /suppliers
```

```json
{
    "Supplier": "ACME Corp",
    "TaxOrganizationType": "Corporation",
    "BusinessRelationship": "Spend Authorized"
}
```

**Wait 30 seconds** after a successful `201` response.

### 2.4 Create Address

```
POST /suppliers/{SupplierId}/child/addresses
```

```json
{
    "AddressName": "HQ_ADDRESS",
    "Country": "United States",
    "AddressLine1": "100 System Way",
    "City": "Austin",
    "State": "TX",
    "PostalCode": "78741",
    "AddressPurposeOrderingFlag": true,
    "AddressPurposeRemitToFlag": true
}
```

**Wait 30 seconds.**

### 2.5 Create Site

```
POST /suppliers/{SupplierId}/child/sites
```

```json
{
    "SupplierSite": "MAIN_PROC_SITE",
    "ProcurementBUId": 300000001234567,
    "SupplierAddressName": "HQ_ADDRESS",
    "SitePurposePurchasingFlag": true,
    "SitePurposePayFlag": true
}
```

**Wait 30 seconds.** Sites may take extra time to index — implement a polling loop (up to 6 retries at 15-second intervals) for `404` responses before proceeding.

### 2.6 Create Site Assignment (CRITICAL)

A Site is **invisible to Procurement** until assigned to a Business Unit.

```
POST /suppliers/{SupplierId}/child/sites/{SiteId}/child/assignments
```

```json
{
    "ClientBUId": 300000001234567,
    "BillToBUId": 300000001234567
}
```

- `BillToBUId` is **required**. Omitting it throws error `POZ-2130496`.
- Site Assignments face race conditions — poll for the Site to be queryable before posting.

### 2.7 Create Contact

```
POST /suppliers/{SupplierId}/child/contacts
```

```json
{
    "FirstName": "Alex",
    "LastName": "Vance",
    "Email": "admin@acme.test",
    "PhoneAreaCode": "555",
    "PhoneNumber": "0199",
    "AdministrativeContactFlag": true
}
```

**Known 26A bugs:**
- `RequestUserAccountFlag` **cannot** be set via REST API — any attempt returns `400`.
- The email field is `Email`, **not** `EmailAddress`.

## 3. Purchase Requisition Provisioning

### 3.1 API Structure

- **Header:** `POST /purchaseRequisitions`
- **Lines:** Nested under `/child/lines`
- **Distributions:** Nested under `/child/lines/{LineId}/child/distributions`
- **Submit:** `POST /purchaseRequisitions/{RequisitionId}/action/submitRequisition`

### 3.2 Header Payload

```json
{
    "PreparerId": 300000001234567,
    "RequisitioningBUId": 300000001234567,
    "Description": "Office Supplies Q1",
    "ExternallyManagedFlag": false
}
```

### 3.3 Line Payload

```json
{
    "LineTypeId": 1,
    "DestinationTypeCode": "EXPENSE",
    "DestinationOrganizationId": 300000001234567,
    "DeliverToLocationId": 300000001234567,
    "RequesterId": 300000001234567,
    "ItemDescription": "Printer Paper A4",
    "Supplier": "ACME Corp",
    "SupplierSite": "MAIN_PROC_SITE",
    "UOM": "Each",
    "Quantity": 100,
    "Price": 5.99,
    "CurrencyCode": "USD",
    "RequestedDeliveryDate": "2026-04-01"
}
```

**Critical field rules:**
- `Supplier` must be the **string name**, not the numeric ID. Otherwise: `POR-2010896`.
- `SupplierSite` must be the **string name**, not the numeric ID.
- `UOM` must be the **full name** (e.g., `"Each"`), not shorthand (`"Ea"`). Otherwise: `POR-2010266`.

### 3.4 Distribution Payload

```json
{
    "Quantity": 100,
    "DistributionNumber": 1,
    "ChargeAccountId": 300000001234567
}
```

### 3.5 Template-Based Provisioning

For reliable payloads, clone architectural IDs from an existing user PR:

1. Fetch the user's latest approved PR via `GET /purchaseRequisitions?q=PreparerId={id}&orderBy=CreationDate:desc&limit=1`
2. Extract `RequisitioningBUId`, `PreparerId`, `DestinationOrganizationId`, `DeliverToLocationId`, `ChargeAccountId`
3. Use these values as the structural backbone for new PRs

### 3.6 Submitting

```
POST /purchaseRequisitions/{RequisitionId}/action/submitRequisition
```

If the PR remains in `INCOMPLETE` status after submission, escalate — this indicates a workflow configuration issue.

## 4. Common Error Codes

| Error | Cause | Fix |
|-------|-------|-----|
| `POZ-2130496` | Missing `BillToBUId` on Site Assignment | Always include `BillToBUId` |
| `POR-2010896` | Supplier passed as ID instead of name | Use string name for `Supplier` field |
| `POR-2010266` | UOM shorthand used instead of full name | Use `"Each"` not `"Ea"` |
| `400` on Contact | `RequestUserAccountFlag` set | Remove flag — not supported in 26A REST |

## 5. Reference Documentation

- **Procurement User Guide:** https://docs.oracle.com/en/cloud/saas/procurement/26a/use.html
- **Procurement REST API:** https://docs.oracle.com/en/cloud/saas/procurement/26a/fapra/index.html
