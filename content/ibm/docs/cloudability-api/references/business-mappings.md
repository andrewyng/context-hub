# Business Mappings Endpoint Reference

## GET /v3/business-mappings

Returns all custom business dimension and metric mapping rules. No pagination.

## GET /v3/business-mappings/{index}

Returns a single mapping by its index number.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Mapping name |
| `index` | integer | Position index |
| `kind` | string | `BUSINESS_DIMENSION` or `BUSINESS_METRIC` |
| `defaultValue` | string | Default when no rule matches |
| `updatedAt` | string | ISO 8601 timestamp of last update |
| `statements` | array | Ordered list of match/value rules |
| `statements[].matchExpression` | string | Rule condition |
| `statements[].valueExpression` | string | Value to assign when matched |

### Expression Functions

| Function | Description | Example |
|----------|-------------|---------|
| `TAG['name']` | Cloud resource tag value | `TAG['Environment']` |
| `DIMENSION['name']` | Cost dimension value | `DIMENSION['vendor_account_name']` |
| `METRIC['name']` | Cost metric value | `METRIC['unblended_cost']` |

### Expression Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `CONTAINS 'val'` | Substring match | `TAG['Env'] CONTAINS 'prod'` |
| `== 'val'` | Exact match | `DIMENSION['vendor'] == 'Amazon'` |
| `\|\|` | Logical OR | `TAG['Env'] CONTAINS 'dev' \|\| TAG['Env'] CONTAINS 'test'` |
| `&&` | Logical AND | `TAG['Env'] == 'prod' && DIMENSION['vendor'] == 'Amazon'` |

### Value Expressions

- String literal: `'Production'`
- Empty string: `''`
- Metric calculation: `METRIC['list_cost'] - METRIC['unblended_cost']`
- For `BUSINESS_METRIC` kind, value expressions return numbers; default is typically `"0"`
- For `BUSINESS_DIMENSION` kind, value expressions return strings; default is typically `"not set"` or `"n/a"`

### Common Dimension Names

Observed in production:

| Name | Kind | Purpose |
|------|------|---------|
| `Environment` | BUSINESS_DIMENSION | Production vs Non-Production classification |
| `FO_Archetype` | BUSINESS_DIMENSION | Financial owner by account |
| `FO_Team` | BUSINESS_DIMENSION | Team ownership mapping |
| `FO_OpCo` | BUSINESS_DIMENSION | Operating company mapping |
| `FO_Product` | BUSINESS_DIMENSION | Product classification |
| `FO_Region` | BUSINESS_DIMENSION | Regional mapping |
| `Azure Tenant Id` | BUSINESS_DIMENSION | Azure tenant identification |
| `SP/RI/Spot Savings` | BUSINESS_METRIC | Savings plan/reserved instance savings |
| `FO_RightsizingSavings` | BUSINESS_METRIC | Rightsizing savings calculations |

### Full Response Example

```json
{
  "result": [
    {
      "name": "Environment",
      "index": 2,
      "kind": "BUSINESS_DIMENSION",
      "defaultValue": "Not Set",
      "updatedAt": "2021-07-14T11:57:33.686Z",
      "statements": [
        {
          "matchExpression": "TAG['Environment'] CONTAINS 'backup' || DIMENSION['vendor_account_name'] CONTAINS 'backup'",
          "valueExpression": "'Backup & Disaster Recovery'"
        },
        {
          "matchExpression": "TAG['Environment'] CONTAINS 'dev' || TAG['Environment'] CONTAINS 'test' || TAG['Environment'] CONTAINS 'poc' || TAG['Environment'] CONTAINS 'sand'",
          "valueExpression": "'Non-Production'"
        },
        {
          "matchExpression": "TAG['Environment'] CONTAINS 'prod'",
          "valueExpression": "'Production'"
        },
        {
          "matchExpression": "DIMENSION['vendor_account_name'] CONTAINS 'test' || DIMENSION['vendor_account_name'] CONTAINS 'dev'",
          "valueExpression": "'Non-Production'"
        },
        {
          "matchExpression": "DIMENSION['vendor_account_name'] CONTAINS 'prod' || DIMENSION['vendor_account_name'] CONTAINS 'prd'",
          "valueExpression": "'Production'"
        }
      ]
    },
    {
      "name": "SP/RI/Spot Savings",
      "index": 2,
      "kind": "BUSINESS_METRIC",
      "defaultValue": "0",
      "updatedAt": "2023-01-15T10:30:00.000Z",
      "statements": [
        {
          "matchExpression": "DIMENSION['vendor'] == 'Amazon'",
          "valueExpression": "METRIC['list_cost'] - METRIC['unblended_cost']"
        }
      ]
    }
  ]
}
```
