---
name: odm-customer
description: "Operational Data Model Customer entity — canonical customer schema for CRM, CDP, and data platform integrations covering identity, contact, lifecycle, and segmentation"
metadata:
  languages: "json"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-05-29"
  source: community
  tags: "odm,customer,crm,cdp,identity,schema,data-model"
---

# Operational Data Model: Customer Entity

A canonical, integration-ready JSON schema for the Customer entity — suitable for CRM, CDP, data warehouse, and API development. Designed to be source-system-agnostic: maps cleanly to Salesforce, HubSpot, SAP, Dynamics 365, and homegrown systems.

## Core Customer Object

```json
{
  "customer": {
    "id": "cust_01HZ3X9KMPNQR",
    "type": "individual",
    "status": "active",
    "createdAt": "2024-03-15T10:30:00Z",
    "updatedAt": "2026-01-20T14:22:00Z",
    "externalIds": {
      "crmId": "0031a00000AbCdEfAA1",
      "erpId": "C-100042",
      "loyaltyNumber": "LYL-88821"
    }
  },
  "identity": {
    "firstName": "Alex",
    "lastName": "Rivera",
    "fullName": "Alex Rivera",
    "preferredName": "Alex",
    "salutation": "Mx.",
    "gender": "non-binary",
    "dateOfBirth": "1990-07-14",
    "language": "en-US",
    "timezone": "America/Chicago",
    "nationalId": {
      "type": "ssn",
      "value": "***-**-9999",
      "masked": true
    }
  },
  "contact": {
    "email": {
      "primary": "alex.rivera@example.com",
      "secondary": "alex.work@company.com",
      "verified": true,
      "verifiedAt": "2024-03-15T10:35:00Z",
      "optOut": false
    },
    "phone": {
      "mobile": "+1-312-555-0147",
      "home": null,
      "work": "+1-312-555-0200",
      "preferredChannel": "mobile",
      "smsOptIn": true
    },
    "address": {
      "billing": {
        "line1": "742 Evergreen Terrace",
        "line2": "Apt 3",
        "city": "Chicago",
        "state": "IL",
        "postalCode": "60601",
        "country": "US",
        "verified": true
      },
      "shipping": {
        "sameAsBilling": true
      }
    }
  },
  "lifecycle": {
    "stage": "loyal",
    "acquisitionDate": "2024-03-15",
    "acquisitionChannel": "organic-search",
    "acquisitionCampaign": null,
    "firstPurchaseDate": "2024-03-20",
    "lastActivityDate": "2026-01-15",
    "churnRisk": "low",
    "churnScore": 0.07
  },
  "commerce": {
    "totalOrders": 24,
    "totalRevenue": 3842.50,
    "averageOrderValue": 160.10,
    "currency": "USD",
    "lastOrderDate": "2026-01-10",
    "lastOrderAmount": 219.95,
    "loyaltyPoints": 3842,
    "loyaltyTier": "gold",
    "paymentMethods": [
      { "type": "card", "brand": "visa", "last4": "4242", "isDefault": true }
    ]
  },
  "preferences": {
    "marketing": {
      "emailOptIn": true,
      "smsOptIn": true,
      "pushOptIn": false,
      "postalOptIn": false,
      "updatedAt": "2025-11-01T00:00:00Z"
    },
    "communication": {
      "preferredChannel": "email",
      "preferredTime": "morning",
      "frequency": "weekly"
    },
    "interests": ["electronics", "home-garden", "cooking"]
  },
  "segments": [
    { "id": "seg_high_value", "name": "High Value Customer", "addedAt": "2025-06-01" },
    { "id": "seg_loyal_gold", "name": "Gold Loyalty Member", "addedAt": "2025-01-01" }
  ],
  "metadata": {
    "source": "web",
    "dataQualityScore": 0.94,
    "tags": ["vip", "early-adopter"],
    "customAttributes": {
      "referredBy": "cust_01AB2CD",
      "companySize": null
    }
  }
}
```

## B2B Extension: Account / Company

For B2B customers, add the `account` block:

```json
{
  "customer": {
    "id": "cust_01HZ4B2CORP",
    "type": "business"
  },
  "account": {
    "companyName": "Acme Corp",
    "legalName": "Acme Corporation Inc.",
    "industry": "manufacturing",
    "companySize": "mid-market",
    "employeeCount": 500,
    "annualRevenue": 25000000,
    "website": "https://acme.example.com",
    "taxId": "XX-XXXXXXX",
    "billingCurrency": "USD",
    "parentAccountId": null,
    "accountOwner": {
      "userId": "usr_sales_042",
      "name": "Morgan Lee"
    },
    "addresses": {
      "headquarters": {
        "line1": "1 Corporate Plaza",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "US"
      }
    }
  },
  "contacts": [
    {
      "contactId": "cont_001",
      "role": "billing",
      "isPrimary": true,
      "identity": { "firstName": "Jordan", "lastName": "Kim" },
      "contact": { "email": { "primary": "jordan@acme.example.com" } }
    }
  ]
}
```

## Field Reference

### `customer` (root)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Unique customer identifier (ULID or UUID recommended) |
| `type` | enum | Yes | `individual`, `business`, `household` |
| `status` | enum | Yes | `active`, `inactive`, `suspended`, `deleted` |
| `createdAt` | datetime | Yes | ISO 8601, UTC |
| `updatedAt` | datetime | Yes | ISO 8601, UTC |
| `externalIds` | object | No | System-specific IDs (CRM, ERP, loyalty) |

### `identity`

| Field | Type | Notes |
|-------|------|-------|
| `firstName` / `lastName` | string | Split name for personalization |
| `fullName` | string | Denormalized for display |
| `preferredName` | string | What the customer wants to be called |
| `gender` | string | Free-form; avoid enums for inclusivity |
| `dateOfBirth` | date | YYYY-MM-DD; age-gate and targeting |
| `language` | string | BCP 47 locale code (`en-US`, `es-MX`) |
| `timezone` | string | IANA timezone (`America/Chicago`) |

### `lifecycle.stage` Values

| Stage | Description |
|-------|-------------|
| `prospect` | Has not yet purchased |
| `new` | First purchase within 90 days |
| `active` | Regular purchaser |
| `loyal` | High-frequency, high-LTV |
| `at-risk` | Declining engagement |
| `churned` | No activity in 180+ days |
| `win-back` | Re-engaged after churn |
| `vip` | Top-tier by revenue or manual designation |

### `commerce`

| Field | Type | Notes |
|-------|------|-------|
| `totalOrders` | integer | Count across all time |
| `totalRevenue` | decimal | All-time gross revenue |
| `averageOrderValue` | decimal | `totalRevenue / totalOrders` |
| `currency` | string | ISO 4217 (USD, EUR, GBP) |
| `loyaltyTier` | string | `bronze`, `silver`, `gold`, `platinum` |

## Consent Model

Consent must be tracked per channel with timestamps for GDPR / CCPA compliance:

```json
{
  "consent": {
    "gdprApplicable": true,
    "ccpaApplicable": false,
    "records": [
      {
        "channel": "email-marketing",
        "status": "opt-in",
        "capturedAt": "2024-03-15T10:32:00Z",
        "captureMethod": "signup-form",
        "policyVersion": "2024-01-01",
        "ipAddress": "203.0.113.42"
      },
      {
        "channel": "sms-marketing",
        "status": "opt-out",
        "capturedAt": "2025-11-01T09:00:00Z",
        "captureMethod": "preference-center"
      }
    ],
    "dataRetentionExpiry": "2031-03-15",
    "rightToErasureRequested": false
  }
}
```

## Customer Events Schema

Track behavioral history alongside the entity:

```json
{
  "events": [
    {
      "eventId": "evt_01HZ9K",
      "customerId": "cust_01HZ3X9KMPNQR",
      "eventType": "purchase",
      "occurredAt": "2026-01-10T15:22:00Z",
      "channel": "web",
      "properties": {
        "orderId": "ord_123",
        "amount": 219.95,
        "items": 3
      }
    },
    {
      "eventId": "evt_01HZ8M",
      "customerId": "cust_01HZ3X9KMPNQR",
      "eventType": "email_open",
      "occurredAt": "2026-01-08T09:11:00Z",
      "channel": "email",
      "properties": {
        "campaignId": "camp_winter_promo"
      }
    }
  ]
}
```

Common `eventType` values: `signup`, `login`, `purchase`, `return`, `email_open`, `email_click`, `push_open`, `support_ticket`, `churn`, `win_back`.

## CRM Field Mappings

| ODM Field | Salesforce | HubSpot | Dynamics 365 |
|-----------|------------|---------|--------------|
| `identity.firstName` | `FirstName` | `firstname` | `firstname` |
| `identity.lastName` | `LastName` | `lastname` | `lastname` |
| `contact.email.primary` | `Email` | `email` | `emailaddress1` |
| `contact.phone.mobile` | `MobilePhone` | `mobilephone` | `mobilephone` |
| `lifecycle.stage` | `Lead.Status` / `Opportunity.Stage` | `lifecyclestage` | `statuscode` |
| `commerce.totalRevenue` | `Account.AnnualRevenue` | `total_revenue` | `revenue` |
| `externalIds.crmId` | `Id` | `hs_object_id` | `contactid` |

## API Design Patterns

### Upsert by External ID

```
PUT /customers?externalId=crmId:0031a00000AbCdEfAA1
Content-Type: application/json

{ "identity": { "firstName": "Alex" }, ... }
```

### Partial Update (PATCH)

Only send changed fields. Use JSON Merge Patch (RFC 7396):

```
PATCH /customers/cust_01HZ3X9KMPNQR
Content-Type: application/merge-patch+json

{ "lifecycle": { "stage": "loyal" }, "commerce": { "loyaltyTier": "gold" } }
```

### Search / Filter

```
GET /customers?status=active&lifecycle.stage=at-risk&_sort=-lifecycle.lastActivityDate&_limit=100
```

### Bulk Ingest (NDJSON)

```
POST /customers/bulk
Content-Type: application/x-ndjson

{"id":"cust_001","identity":{"firstName":"Alice",...}}
{"id":"cust_002","identity":{"firstName":"Bob",...}}
```

## Common Pitfalls

- **Single email field**: Marketing, transactional, and billing emails often differ. Model `email` as an object with roles, not a scalar string.
- **Phone normalization**: Store in E.164 format (`+1-312-555-0147`). Do not store raw user input.
- **Consent timestamps**: Log `capturedAt` and `policyVersion` — regulators require proof of when and how consent was given.
- **Currency as string**: Never store money as a float. Use integer cents + currency code, or Decimal/string.
- **Merging duplicates**: Keep a `mergedInto` / `mergedFrom` pointer so audit trails survive identity resolution.
- **Soft delete**: Set `status: "deleted"` rather than physically removing rows. Hard deletes break foreign keys and audit logs.

## See Also

- [References: Consent deep-dive, Identity Resolution, and Segment Sync patterns](references/advanced.md)
