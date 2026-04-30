---
name: public-api
description: "Bitwarden Public API for managing organization members, collections, groups, event logs, and policies"
metadata:
  languages: "rest"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-20"
  source: community
  tags: "bitwarden,api,rest,password-manager,organization,security"
---

# Bitwarden Public API

RESTful API for managing Bitwarden organizations: members, collections, groups, event logs, and policies. Requires a Teams or Enterprise plan.

> This API does not manage individual vault items. Use the Vault Management API for that.

## Authentication

Uses OAuth2 Client Credentials flow. Get your organization API key from **Admin Console → Settings → Organization info → API key**.

The `client_id` format is `"organization.ClientId"` (not the same as a personal API key which uses `"user.clientId"`).

> **Warning:** Your organization API key enables full access to your organization. If compromised, rotate it immediately via **Settings → Organization info → Rotate API key**. All existing implementations will need the new key. To share the key with other admins, use [Bitwarden Send](https://bitwarden.com/help/about-send/).

### Get a bearer token

```bash
curl -X POST \
  https://identity.bitwarden.com/connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&scope=api.organization&client_id=<ID>&client_secret=<SECRET>'
```

Response:

```json
{
  "access_token": "<TOKEN>",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

Token expires in 3600 seconds (60 minutes). Expired tokens return `401 Unauthorized`.

## Base URLs

| Environment | API Base | Auth Endpoint |
|---|---|---|
| US Cloud | `https://api.bitwarden.com` | `https://identity.bitwarden.com/connect/token` |
| EU Cloud | `https://api.bitwarden.eu` | `https://identity.bitwarden.eu/connect/token` |
| Self-hosted | `https://your.domain.com/api` | `https://your.domain.com/identity/connect/token` |

## Making requests

All requests use `Authorization: Bearer <TOKEN>` header and return `application/json`. The only exception is the auth endpoint, which expects `application/x-www-form-urlencoded` requests (but still returns JSON).

```bash
curl -X GET \
  https://api.bitwarden.com/public/collections \
  -H 'Authorization: Bearer <TOKEN>'
```

## Key endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/public/members` | List organization members |
| GET | `/public/members/{id}` | Get a member |
| POST | `/public/members` | Invite a member |
| PUT | `/public/members/{id}` | Update a member |
| DELETE | `/public/members/{id}` | Remove a member |
| GET | `/public/collections` | List collections |
| GET | `/public/collections/{id}` | Get a collection |
| POST | `/public/collections` | Create a collection |
| PUT | `/public/collections/{id}` | Update a collection |
| DELETE | `/public/collections/{id}` | Delete a collection |
| GET | `/public/groups` | List groups |
| POST | `/public/groups` | Create a group |
| PUT | `/public/groups/{id}` | Update a group |
| DELETE | `/public/groups/{id}` | Delete a group |
| GET | `/public/events` | List event logs |
| GET | `/public/policies` | List policies |
| PUT | `/public/policies/{type}` | Update a policy |

## Pagination

Queries returning over 50 results include a `continuationToken` in the response:

```json
{
  "object": "list",
  "data": [...],
  "continuationToken": "token_value"
}
```

Append it as a query parameter to get the next page:

```
https://api.bitwarden.com/public/events?continuationToken=<token_value>
```

Paginated endpoints: `/public/collections`, `/public/events`, `/public/groups`, `/public/members`, `/public/policies`.

## Response codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request (missing/malformed parameters) |
| `401` | Unauthorized (missing/invalid/expired token) |
| `404` | Resource not found |
| `429` | Rate limited |
| `500/502/503/504` | Server error |

## OpenAPI spec

The API is compatible with OpenAPI Specification (OAS3) and publishes a compliant `swagger.json`. Explore via Swagger UI:
- Cloud: `https://bitwarden.com/help/api/`
- Self-hosted: `https://your.domain.com/api/docs/`

## Status

Service health: [https://status.bitwarden.com](https://status.bitwarden.com)

## Further reading

- [Bitwarden Public API docs](https://bitwarden.com/help/public-api/)
- [API Specification (Swagger UI)](https://bitwarden.com/help/api/)
- [Event logs](https://bitwarden.com/help/event-logs/)
