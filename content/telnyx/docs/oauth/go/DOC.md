---
name: oauth
description: "Implement OAuth 2.0 authentication flows for Telnyx API access."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,oauth,authentication,api-access"
---

# Telnyx OAuth Go SDK Coding Guidelines

You are a Telnyx OAuth API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

## Golden Rule: Use the Official SDK

Always use the official `github.com/team-telnyx/telnyx-go` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import "github.com/team-telnyx/telnyx-go"`
- **Incorrect:** unofficial Go clients or raw HTTP calls

## Installation

```bash
go get github.com/team-telnyx/telnyx-go
```

## Setup

```go
import (
  "context"
  "fmt"
  "os"

  "github.com/team-telnyx/telnyx-go"
  "github.com/team-telnyx/telnyx-go/option"
)

client := telnyx.NewClient(
  option.WithAPIKey(os.Getenv("TELNYX_API_KEY")),
)
```

All examples below assume `client` is already initialized as shown above.

## Authorization server metadata

OAuth 2.0 Authorization Server Metadata (RFC 8414)

`GET /.well-known/oauth-authorization-server`

```go
	response, err := client.WellKnown.GetAuthorizationServerMetadata(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.AuthorizationEndpoint)
```

Returns: `authorization_endpoint` (uri), `code_challenge_methods_supported` (array[string]), `grant_types_supported` (array[string]), `introspection_endpoint` (uri), `issuer` (uri), `jwks_uri` (uri), `registration_endpoint` (uri), `response_types_supported` (array[string]), `scopes_supported` (array[string]), `token_endpoint` (uri), `token_endpoint_auth_methods_supported` (array[string])

## Protected resource metadata

OAuth 2.0 Protected Resource Metadata for resource discovery

`GET /.well-known/oauth-protected-resource`

```go
	response, err := client.WellKnown.GetProtectedResourceMetadata(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.AuthorizationServers)
```

Returns: `authorization_servers` (array[string]), `resource` (uri)

## OAuth authorization endpoint

OAuth 2.0 authorization endpoint for the authorization code flow

`GET /oauth/authorize`

```go
	err := client.OAuth.GetAuthorize(context.TODO(), telnyx.OAuthGetAuthorizeParams{
		ClientID:     "client_id",
		RedirectUri:  "https://example.com",
		ResponseType: telnyx.OAuthGetAuthorizeParamsResponseTypeCode,
	})
	if err != nil {
		panic(err.Error())
	}
```

## Get OAuth consent token

Retrieve details about an OAuth consent token

`GET /oauth/consent/{consent_token}`

```go
	oauth, err := client.OAuth.Get(context.TODO(), "consent_token")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", oauth.Data)
```

Returns: `client_id` (string), `logo_uri` (uri), `name` (string), `policy_uri` (uri), `redirect_uri` (uri), `requested_scopes` (array[object]), `tos_uri` (uri), `verified` (boolean)

## Create OAuth grant

Create an OAuth authorization grant

`POST /oauth/grants` — Required: `allowed`, `consent_token`

```go
	response, err := client.OAuth.Grants(context.TODO(), telnyx.OAuthGrantsParams{
		Allowed:      true,
		ConsentToken: "consent_token",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.RedirectUri)
```

Returns: `redirect_uri` (uri)

## Token introspection

Introspect an OAuth access token to check its validity and metadata

`POST /oauth/introspect` — Required: `token`

```go
	response, err := client.OAuth.Introspect(context.TODO(), telnyx.OAuthIntrospectParams{
		Token: "token",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.ClientID)
```

Returns: `active` (boolean), `aud` (string), `client_id` (string), `exp` (integer), `iat` (integer), `iss` (string), `scope` (string)

## JSON Web Key Set

Retrieve the JSON Web Key Set for token verification

`GET /oauth/jwks`

```go
	response, err := client.OAuth.GetJwks(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Keys)
```

Returns: `keys` (array[object])

## Dynamic client registration

Register a new OAuth client dynamically (RFC 7591)

`POST /oauth/register`

Optional: `client_name` (string), `grant_types` (array[string]), `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `response_types` (array[string]), `scope` (string), `token_endpoint_auth_method` (enum: none, client_secret_basic, client_secret_post), `tos_uri` (uri)

```go
	response, err := client.OAuth.Register(context.TODO(), telnyx.OAuthRegisterParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.ClientID)
```

Returns: `client_id` (string), `client_id_issued_at` (integer), `client_name` (string), `client_secret` (string), `grant_types` (array[string]), `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `response_types` (array[string]), `scope` (string), `token_endpoint_auth_method` (string), `tos_uri` (uri)

## OAuth token endpoint

Exchange authorization code, client credentials, or refresh token for access token

`POST /oauth/token` — Required: `grant_type`

Optional: `client_id` (string), `client_secret` (string), `code` (string), `code_verifier` (string), `redirect_uri` (uri), `refresh_token` (string), `scope` (string)

```go
	response, err := client.OAuth.Token(context.TODO(), telnyx.OAuthTokenParams{
		GrantType: telnyx.OAuthTokenParamsGrantTypeClientCredentials,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.AccessToken)
```

Returns: `access_token` (string), `expires_in` (integer), `refresh_token` (string), `scope` (string), `token_type` (enum: Bearer)

## List OAuth clients

Retrieve a paginated list of OAuth clients for the authenticated user

`GET /oauth_clients`

```go
	page, err := client.OAuthClients.List(context.TODO(), telnyx.OAuthClientListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Create OAuth client

Create a new OAuth client

`POST /oauth_clients` — Required: `name`, `allowed_scopes`, `client_type`, `allowed_grant_types`

Optional: `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri)

```go
	oauthClient, err := client.OAuthClients.New(context.TODO(), telnyx.OAuthClientNewParams{
		AllowedGrantTypes: []string{"client_credentials"},
		AllowedScopes:     []string{"admin"},
		ClientType:        telnyx.OAuthClientNewParamsClientTypePublic,
		Name:              "My OAuth client",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", oauthClient.Data)
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Get OAuth client

Retrieve a single OAuth client by ID

`GET /oauth_clients/{id}`

```go
	oauthClient, err := client.OAuthClients.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", oauthClient.Data)
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Update OAuth client

Update an existing OAuth client

`PUT /oauth_clients/{id}`

Optional: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `logo_uri` (uri), `name` (string), `policy_uri` (uri), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri)

```go
	oauthClient, err := client.OAuthClients.Update(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.OAuthClientUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", oauthClient.Data)
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Delete OAuth client

Delete an OAuth client

`DELETE /oauth_clients/{id}`

```go
	err := client.OAuthClients.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
```

## List OAuth grants

Retrieve a paginated list of OAuth grants for the authenticated user

`GET /oauth_grants`

```go
	page, err := client.OAuthGrants.List(context.TODO(), telnyx.OAuthGrantListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])

## Get OAuth grant

Retrieve a single OAuth grant by ID

`GET /oauth_grants/{id}`

```go
	oauthGrant, err := client.OAuthGrants.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", oauthGrant.Data)
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])

## Revoke OAuth grant

Revoke an OAuth grant

`DELETE /oauth_grants/{id}`

```go
	oauthGrant, err := client.OAuthGrants.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", oauthGrant.Data)
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])
