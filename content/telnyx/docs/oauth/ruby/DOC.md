---
name: oauth
description: "Implement OAuth 2.0 authentication flows for Telnyx API access."
metadata:
  languages: "ruby"
  versions: "5.52.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,oauth,authentication,api-access"
---

# Telnyx OAuth Ruby SDK Coding Guidelines

You are a Telnyx OAuth API expert. Help the user write correct, production-ready code using the official Telnyx Ruby SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `require "telnyx"`
- **Incorrect:** unofficial gems or raw HTTP calls

## Installation

```bash
gem install telnyx
```

## Setup

```ruby
require "telnyx"

client = Telnyx::Client.new(
  api_key: ENV["TELNYX_API_KEY"], # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## Authorization server metadata

OAuth 2.0 Authorization Server Metadata (RFC 8414)

`GET /.well-known/oauth-authorization-server`

```ruby
response = client.well_known.retrieve_authorization_server_metadata

puts(response)
```

Returns: `authorization_endpoint` (uri), `code_challenge_methods_supported` (array[string]), `grant_types_supported` (array[string]), `introspection_endpoint` (uri), `issuer` (uri), `jwks_uri` (uri), `registration_endpoint` (uri), `response_types_supported` (array[string]), `scopes_supported` (array[string]), `token_endpoint` (uri), `token_endpoint_auth_methods_supported` (array[string])

## Protected resource metadata

OAuth 2.0 Protected Resource Metadata for resource discovery

`GET /.well-known/oauth-protected-resource`

```ruby
response = client.well_known.retrieve_protected_resource_metadata

puts(response)
```

Returns: `authorization_servers` (array[string]), `resource` (uri)

## OAuth authorization endpoint

OAuth 2.0 authorization endpoint for the authorization code flow

`GET /oauth/authorize`

```ruby
result = client.oauth.retrieve_authorize(
  client_id: "client_id",
  redirect_uri: "https://example.com",
  response_type: :code
)

puts(result)
```

## Get OAuth consent token

Retrieve details about an OAuth consent token

`GET /oauth/consent/{consent_token}`

```ruby
oauth = client.oauth.retrieve("consent_token")

puts(oauth)
```

Returns: `client_id` (string), `logo_uri` (uri), `name` (string), `policy_uri` (uri), `redirect_uri` (uri), `requested_scopes` (array[object]), `tos_uri` (uri), `verified` (boolean)

## Create OAuth grant

Create an OAuth authorization grant

`POST /oauth/grants` — Required: `allowed`, `consent_token`

```ruby
response = client.oauth.grants(allowed: true, consent_token: "consent_token")

puts(response)
```

Returns: `redirect_uri` (uri)

## Token introspection

Introspect an OAuth access token to check its validity and metadata

`POST /oauth/introspect` — Required: `token`

```ruby
response = client.oauth.introspect(token: "token")

puts(response)
```

Returns: `active` (boolean), `aud` (string), `client_id` (string), `exp` (integer), `iat` (integer), `iss` (string), `scope` (string)

## JSON Web Key Set

Retrieve the JSON Web Key Set for token verification

`GET /oauth/jwks`

```ruby
response = client.oauth.retrieve_jwks

puts(response)
```

Returns: `keys` (array[object])

## Dynamic client registration

Register a new OAuth client dynamically (RFC 7591)

`POST /oauth/register`

Optional: `client_name` (string), `grant_types` (array[string]), `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `response_types` (array[string]), `scope` (string), `token_endpoint_auth_method` (enum: none, client_secret_basic, client_secret_post), `tos_uri` (uri)

```ruby
response = client.oauth.register

puts(response)
```

Returns: `client_id` (string), `client_id_issued_at` (integer), `client_name` (string), `client_secret` (string), `grant_types` (array[string]), `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `response_types` (array[string]), `scope` (string), `token_endpoint_auth_method` (string), `tos_uri` (uri)

## OAuth token endpoint

Exchange authorization code, client credentials, or refresh token for access token

`POST /oauth/token` — Required: `grant_type`

Optional: `client_id` (string), `client_secret` (string), `code` (string), `code_verifier` (string), `redirect_uri` (uri), `refresh_token` (string), `scope` (string)

```ruby
response = client.oauth.token(grant_type: :client_credentials)

puts(response)
```

Returns: `access_token` (string), `expires_in` (integer), `refresh_token` (string), `scope` (string), `token_type` (enum: Bearer)

## List OAuth clients

Retrieve a paginated list of OAuth clients for the authenticated user

`GET /oauth_clients`

```ruby
page = client.oauth_clients.list

puts(page)
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Create OAuth client

Create a new OAuth client

`POST /oauth_clients` — Required: `name`, `allowed_scopes`, `client_type`, `allowed_grant_types`

Optional: `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri)

```ruby
oauth_client = client.oauth_clients.create(
  allowed_grant_types: [:client_credentials],
  allowed_scopes: ["admin"],
  client_type: :public,
  name: "My OAuth client"
)

puts(oauth_client)
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Get OAuth client

Retrieve a single OAuth client by ID

`GET /oauth_clients/{id}`

```ruby
oauth_client = client.oauth_clients.retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")

puts(oauth_client)
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Update OAuth client

Update an existing OAuth client

`PUT /oauth_clients/{id}`

Optional: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `logo_uri` (uri), `name` (string), `policy_uri` (uri), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri)

```ruby
oauth_client = client.oauth_clients.update("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")

puts(oauth_client)
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Delete OAuth client

Delete an OAuth client

`DELETE /oauth_clients/{id}`

```ruby
result = client.oauth_clients.delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")

puts(result)
```

## List OAuth grants

Retrieve a paginated list of OAuth grants for the authenticated user

`GET /oauth_grants`

```ruby
page = client.oauth_grants.list

puts(page)
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])

## Get OAuth grant

Retrieve a single OAuth grant by ID

`GET /oauth_grants/{id}`

```ruby
oauth_grant = client.oauth_grants.retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")

puts(oauth_grant)
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])

## Revoke OAuth grant

Revoke an OAuth grant

`DELETE /oauth_grants/{id}`

```ruby
oauth_grant = client.oauth_grants.delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")

puts(oauth_grant)
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])
