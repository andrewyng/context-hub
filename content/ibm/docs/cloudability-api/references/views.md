# Views Endpoint Reference

## GET /v3/views

Returns all configured cost views. No pagination.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique view identifier |
| `title` | string | View name |
| `description` | string | View description |
| `ownerId` | string | User ID of the owner |
| `ownerEmail` | string | Email of the owner |
| `sharedWithUsers` | array | User IDs this view is shared with |
| `derivedUserIds` | array | Derived user IDs |
| `derivedOrgUnitIDs` | array | Derived org unit IDs |
| `sharedWithOrganization` | boolean | Shared with entire organisation |
| `filters` | array | Filter rules applied to the view |
| `filters[].field` | string | Dimension or field name (e.g. `vendor_account_name`) |
| `filters[].comparator` | string | Comparison operator (e.g. `==`) |
| `filters[].value` | string | Value to match |
| `parentViewId` | string | Parent view ID (`-1` for root) |
| `viewSource` | string | Origin: `SYSTEM` or user-created |
| `defaultUserIds` | array | User IDs for whom this is the default view |

### Full Response Example

```json
{
  "result": [
    {
      "id": "131863",
      "title": "No Data Access",
      "description": "",
      "ownerId": "113155",
      "sharedWithUsers": [],
      "derivedUserIds": [],
      "derivedOrgUnitIDs": [],
      "sharedWithOrganization": true,
      "filters": [
        {
          "field": "vendor_account_name",
          "comparator": "==",
          "value": "123456"
        }
      ],
      "parentViewId": "-1",
      "viewSource": "SYSTEM",
      "ownerEmail": "admin@example.com",
      "defaultUserIds": [169765, 169949]
    }
  ]
}
```
