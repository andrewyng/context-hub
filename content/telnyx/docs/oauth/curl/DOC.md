---
name: oauth
description: "Implement OAuth 2.0 authentication flows for Telnyx API access."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,oauth,authentication,api-access"
---

# Telnyx OAuth REST API Coding Guidelines

You are a Telnyx OAuth API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

## Golden Rule: Use the Correct API Endpoints

Always use the documented Telnyx API v2 endpoints at `https://api.telnyx.com/v2/`. Do not fabricate API endpoints or request parameters.

- **Correct:** `curl` with `Authorization: Bearer $TELNYX_API_KEY` header
- **Incorrect:** fabricated endpoints or incorrect authentication headers

## Installation

```text
# curl is pre-installed on macOS, Linux, and Windows 10+
```

## Setup

```bash
export TELNYX_API_KEY="YOUR_API_KEY_HERE"
```

All examples below use `$TELNYX_API_KEY` for authentication.

## Authorization server metadata

OAuth 2.0 Authorization Server Metadata (RFC 8414)

`GET /.well-known/oauth-authorization-server`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/.well-known/oauth-authorization-server"
```

Returns: `authorization_endpoint` (uri), `code_challenge_methods_supported` (array[string]), `grant_types_supported` (array[string]), `introspection_endpoint` (uri), `issuer` (uri), `jwks_uri` (uri), `registration_endpoint` (uri), `response_types_supported` (array[string]), `scopes_supported` (array[string]), `token_endpoint` (uri), `token_endpoint_auth_methods_supported` (array[string])

## Protected resource metadata

OAuth 2.0 Protected Resource Metadata for resource discovery

`GET /.well-known/oauth-protected-resource`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/.well-known/oauth-protected-resource"
```

Returns: `authorization_servers` (array[string]), `resource` (uri)

## OAuth authorization endpoint

OAuth 2.0 authorization endpoint for the authorization code flow

`GET /oauth/authorize`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/oauth/authorize?scope=admin"
```

## Get OAuth consent token

Retrieve details about an OAuth consent token

`GET /oauth/consent/{consent_token}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/oauth/consent/{consent_token}"
```

Returns: `client_id` (string), `logo_uri` (uri), `name` (string), `policy_uri` (uri), `redirect_uri` (uri), `requested_scopes` (array[object]), `tos_uri` (uri), `verified` (boolean)

## Create OAuth grant

Create an OAuth authorization grant

`POST /oauth/grants` — Required: `allowed`, `consent_token`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "allowed": true,
  "consent_token": "string"
}' \
  "https://api.telnyx.com/v2/oauth/grants"
```

Returns: `redirect_uri` (uri)

## Token introspection

Introspect an OAuth access token to check its validity and metadata

`POST /oauth/introspect` — Required: `token`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "token": "string"
}' \
  "https://api.telnyx.com/v2/oauth/introspect"
```

Returns: `active` (boolean), `aud` (string), `client_id` (string), `exp` (integer), `iat` (integer), `iss` (string), `scope` (string)

## JSON Web Key Set

Retrieve the JSON Web Key Set for token verification

`GET /oauth/jwks`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/oauth/jwks"
```

Returns: `keys` (array[object])

## Dynamic client registration

Register a new OAuth client dynamically (RFC 7591)

`POST /oauth/register`

Optional: `client_name` (string), `grant_types` (array[string]), `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `response_types` (array[string]), `scope` (string), `token_endpoint_auth_method` (enum: none, client_secret_basic, client_secret_post), `tos_uri` (uri)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "redirect_uris": [
    "https://example.com/callback"
  ],
  "client_name": "My OAuth Application",
  "scope": "admin"
}' \
  "https://api.telnyx.com/v2/oauth/register"
```

Returns: `client_id` (string), `client_id_issued_at` (integer), `client_name` (string), `client_secret` (string), `grant_types` (array[string]), `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `response_types` (array[string]), `scope` (string), `token_endpoint_auth_method` (string), `tos_uri` (uri)

## OAuth token endpoint

Exchange authorization code, client credentials, or refresh token for access token

`POST /oauth/token` — Required: `grant_type`

Optional: `client_id` (string), `client_secret` (string), `code` (string), `code_verifier` (string), `redirect_uri` (uri), `refresh_token` (string), `scope` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "grant_type": "client_credentials",
  "scope": "admin"
}' \
  "https://api.telnyx.com/v2/oauth/token"
```

Returns: `access_token` (string), `expires_in` (integer), `refresh_token` (string), `scope` (string), `token_type` (enum: Bearer)

## List OAuth clients

Retrieve a paginated list of OAuth clients for the authenticated user

`GET /oauth_clients`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/oauth_clients"
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Create OAuth client

Create a new OAuth client

`POST /oauth_clients` — Required: `name`, `allowed_scopes`, `client_type`, `allowed_grant_types`

Optional: `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "My OAuth client",
  "allowed_scopes": [
    "admin"
  ],
  "client_type": "public",
  "allowed_grant_types": [
    "client_credentials"
  ]
}' \
  "https://api.telnyx.com/v2/oauth_clients"
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Get OAuth client

Retrieve a single OAuth client by ID

`GET /oauth_clients/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/oauth_clients/{id}"
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Update OAuth client

Update an existing OAuth client

`PUT /oauth_clients/{id}`

Optional: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `logo_uri` (uri), `name` (string), `policy_uri` (uri), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri)

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "allowed_scopes": [
    "admin"
  ]
}' \
  "https://api.telnyx.com/v2/oauth_clients/{id}"
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Delete OAuth client

Delete an OAuth client

`DELETE /oauth_clients/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/oauth_clients/{id}"
```

## List OAuth grants

Retrieve a paginated list of OAuth grants for the authenticated user

`GET /oauth_grants`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/oauth_grants"
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])

## Get OAuth grant

Retrieve a single OAuth grant by ID

`GET /oauth_grants/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/oauth_grants/{id}"
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])

## Revoke OAuth grant

Revoke an OAuth grant

`DELETE /oauth_grants/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/oauth_grants/{id}"
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])
