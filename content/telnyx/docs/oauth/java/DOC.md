---
name: oauth
description: "Implement OAuth 2.0 authentication flows for Telnyx API access."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,oauth,authentication,api-access"
---

# Telnyx OAuth Java SDK Coding Guidelines

You are a Telnyx OAuth API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

## Golden Rule: Use the Official SDK

Always use the official `com.telnyx.sdk:telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import com.telnyx.sdk.client.TelnyxClient`
- **Incorrect:** unofficial Java clients or raw HTTP calls

## Installation

```text
<!-- Maven -->
<dependency>
    <groupId>com.telnyx.sdk</groupId>
    <artifactId>telnyx-java</artifactId>
    <version>6.26.0</version>
</dependency>

// Gradle
implementation("com.telnyx.sdk:telnyx-java:6.26.0")
```

## Setup

```java
import com.telnyx.sdk.client.TelnyxClient;
import com.telnyx.sdk.client.okhttp.TelnyxOkHttpClient;

TelnyxClient client = TelnyxOkHttpClient.fromEnv();
```

All examples below assume `client` is already initialized as shown above.

## Authorization server metadata

OAuth 2.0 Authorization Server Metadata (RFC 8414)

`GET /.well-known/oauth-authorization-server`

```java
import com.telnyx.sdk.models.wellknown.WellKnownRetrieveAuthorizationServerMetadataParams;
import com.telnyx.sdk.models.wellknown.WellKnownRetrieveAuthorizationServerMetadataResponse;

WellKnownRetrieveAuthorizationServerMetadataResponse response = client.wellKnown().retrieveAuthorizationServerMetadata();
```

Returns: `authorization_endpoint` (uri), `code_challenge_methods_supported` (array[string]), `grant_types_supported` (array[string]), `introspection_endpoint` (uri), `issuer` (uri), `jwks_uri` (uri), `registration_endpoint` (uri), `response_types_supported` (array[string]), `scopes_supported` (array[string]), `token_endpoint` (uri), `token_endpoint_auth_methods_supported` (array[string])

## Protected resource metadata

OAuth 2.0 Protected Resource Metadata for resource discovery

`GET /.well-known/oauth-protected-resource`

```java
import com.telnyx.sdk.models.wellknown.WellKnownRetrieveProtectedResourceMetadataParams;
import com.telnyx.sdk.models.wellknown.WellKnownRetrieveProtectedResourceMetadataResponse;

WellKnownRetrieveProtectedResourceMetadataResponse response = client.wellKnown().retrieveProtectedResourceMetadata();
```

Returns: `authorization_servers` (array[string]), `resource` (uri)

## OAuth authorization endpoint

OAuth 2.0 authorization endpoint for the authorization code flow

`GET /oauth/authorize`

```java
import com.telnyx.sdk.models.oauth.OAuthRetrieveAuthorizeParams;

OAuthRetrieveAuthorizeParams params = OAuthRetrieveAuthorizeParams.builder()
    .clientId("client_id")
    .redirectUri("https://example.com")
    .responseType(OAuthRetrieveAuthorizeParams.ResponseType.CODE)
    .build();
client.oauth().retrieveAuthorize(params);
```

## Get OAuth consent token

Retrieve details about an OAuth consent token

`GET /oauth/consent/{consent_token}`

```java
import com.telnyx.sdk.models.oauth.OAuthRetrieveParams;
import com.telnyx.sdk.models.oauth.OAuthRetrieveResponse;

OAuthRetrieveResponse oauth = client.oauth().retrieve("consent_token");
```

Returns: `client_id` (string), `logo_uri` (uri), `name` (string), `policy_uri` (uri), `redirect_uri` (uri), `requested_scopes` (array[object]), `tos_uri` (uri), `verified` (boolean)

## Create OAuth grant

Create an OAuth authorization grant

`POST /oauth/grants` — Required: `allowed`, `consent_token`

```java
import com.telnyx.sdk.models.oauth.OAuthGrantsParams;
import com.telnyx.sdk.models.oauth.OAuthGrantsResponse;

OAuthGrantsParams params = OAuthGrantsParams.builder()
    .allowed(true)
    .consentToken("consent_token")
    .build();
OAuthGrantsResponse response = client.oauth().grants(params);
```

Returns: `redirect_uri` (uri)

## Token introspection

Introspect an OAuth access token to check its validity and metadata

`POST /oauth/introspect` — Required: `token`

```java
import com.telnyx.sdk.models.oauth.OAuthIntrospectParams;
import com.telnyx.sdk.models.oauth.OAuthIntrospectResponse;

OAuthIntrospectParams params = OAuthIntrospectParams.builder()
    .token("token")
    .build();
OAuthIntrospectResponse response = client.oauth().introspect(params);
```

Returns: `active` (boolean), `aud` (string), `client_id` (string), `exp` (integer), `iat` (integer), `iss` (string), `scope` (string)

## JSON Web Key Set

Retrieve the JSON Web Key Set for token verification

`GET /oauth/jwks`

```java
import com.telnyx.sdk.models.oauth.OAuthRetrieveJwksParams;
import com.telnyx.sdk.models.oauth.OAuthRetrieveJwksResponse;

OAuthRetrieveJwksResponse response = client.oauth().retrieveJwks();
```

Returns: `keys` (array[object])

## Dynamic client registration

Register a new OAuth client dynamically (RFC 7591)

`POST /oauth/register`

Optional: `client_name` (string), `grant_types` (array[string]), `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `response_types` (array[string]), `scope` (string), `token_endpoint_auth_method` (enum: none, client_secret_basic, client_secret_post), `tos_uri` (uri)

```java
import com.telnyx.sdk.models.oauth.OAuthRegisterParams;
import com.telnyx.sdk.models.oauth.OAuthRegisterResponse;

OAuthRegisterResponse response = client.oauth().register();
```

Returns: `client_id` (string), `client_id_issued_at` (integer), `client_name` (string), `client_secret` (string), `grant_types` (array[string]), `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `response_types` (array[string]), `scope` (string), `token_endpoint_auth_method` (string), `tos_uri` (uri)

## OAuth token endpoint

Exchange authorization code, client credentials, or refresh token for access token

`POST /oauth/token` — Required: `grant_type`

Optional: `client_id` (string), `client_secret` (string), `code` (string), `code_verifier` (string), `redirect_uri` (uri), `refresh_token` (string), `scope` (string)

```java
import com.telnyx.sdk.models.oauth.OAuthTokenParams;
import com.telnyx.sdk.models.oauth.OAuthTokenResponse;

OAuthTokenParams params = OAuthTokenParams.builder()
    .grantType(OAuthTokenParams.GrantType.CLIENT_CREDENTIALS)
    .build();
OAuthTokenResponse response = client.oauth().token(params);
```

Returns: `access_token` (string), `expires_in` (integer), `refresh_token` (string), `scope` (string), `token_type` (enum: Bearer)

## List OAuth clients

Retrieve a paginated list of OAuth clients for the authenticated user

`GET /oauth_clients`

```java
import com.telnyx.sdk.models.oauthclients.OAuthClientListPage;
import com.telnyx.sdk.models.oauthclients.OAuthClientListParams;

OAuthClientListPage page = client.oauthClients().list();
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Create OAuth client

Create a new OAuth client

`POST /oauth_clients` — Required: `name`, `allowed_scopes`, `client_type`, `allowed_grant_types`

Optional: `logo_uri` (uri), `policy_uri` (uri), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri)

```java
import com.telnyx.sdk.models.oauthclients.OAuthClientCreateParams;
import com.telnyx.sdk.models.oauthclients.OAuthClientCreateResponse;

OAuthClientCreateParams params = OAuthClientCreateParams.builder()
    .addAllowedGrantType(OAuthClientCreateParams.AllowedGrantType.CLIENT_CREDENTIALS)
    .addAllowedScope("admin")
    .clientType(OAuthClientCreateParams.ClientType.PUBLIC)
    .name("My OAuth client")
    .build();
OAuthClientCreateResponse oauthClient = client.oauthClients().create(params);
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Get OAuth client

Retrieve a single OAuth client by ID

`GET /oauth_clients/{id}`

```java
import com.telnyx.sdk.models.oauthclients.OAuthClientRetrieveParams;
import com.telnyx.sdk.models.oauthclients.OAuthClientRetrieveResponse;

OAuthClientRetrieveResponse oauthClient = client.oauthClients().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Update OAuth client

Update an existing OAuth client

`PUT /oauth_clients/{id}`

Optional: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `logo_uri` (uri), `name` (string), `policy_uri` (uri), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri)

```java
import com.telnyx.sdk.models.oauthclients.OAuthClientUpdateParams;
import com.telnyx.sdk.models.oauthclients.OAuthClientUpdateResponse;

OAuthClientUpdateResponse oauthClient = client.oauthClients().update("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `allowed_grant_types` (array[string]), `allowed_scopes` (array[string]), `client_id` (string), `client_secret` (string | null), `client_type` (enum: public, confidential), `created_at` (date-time), `logo_uri` (uri), `name` (string), `org_id` (string), `policy_uri` (uri), `record_type` (enum: oauth_client), `redirect_uris` (array[string]), `require_pkce` (boolean), `tos_uri` (uri), `updated_at` (date-time), `user_id` (string)

## Delete OAuth client

Delete an OAuth client

`DELETE /oauth_clients/{id}`

```java
import com.telnyx.sdk.models.oauthclients.OAuthClientDeleteParams;

client.oauthClients().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

## List OAuth grants

Retrieve a paginated list of OAuth grants for the authenticated user

`GET /oauth_grants`

```java
import com.telnyx.sdk.models.oauthgrants.OAuthGrantListPage;
import com.telnyx.sdk.models.oauthgrants.OAuthGrantListParams;

OAuthGrantListPage page = client.oauthGrants().list();
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])

## Get OAuth grant

Retrieve a single OAuth grant by ID

`GET /oauth_grants/{id}`

```java
import com.telnyx.sdk.models.oauthgrants.OAuthGrantRetrieveParams;
import com.telnyx.sdk.models.oauthgrants.OAuthGrantRetrieveResponse;

OAuthGrantRetrieveResponse oauthGrant = client.oauthGrants().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])

## Revoke OAuth grant

Revoke an OAuth grant

`DELETE /oauth_grants/{id}`

```java
import com.telnyx.sdk.models.oauthgrants.OAuthGrantDeleteParams;
import com.telnyx.sdk.models.oauthgrants.OAuthGrantDeleteResponse;

OAuthGrantDeleteResponse oauthGrant = client.oauthGrants().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `client_id` (string), `created_at` (date-time), `id` (uuid), `last_used_at` (date-time), `record_type` (enum: oauth_grant), `scopes` (array[string])
