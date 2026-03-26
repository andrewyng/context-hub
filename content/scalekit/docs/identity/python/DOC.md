---
name: identity
description: "Scalekit Python SDK for enterprise SSO (SAML/OIDC), SCIM directory sync, and agent OAuth 2.1 in B2B applications"
metadata:
  languages: "python"
  versions: "2.7.0"
  updated-on: "2026-03-26"
  source: community
  tags: "scalekit,sso,saml,oidc,authentication,enterprise,b2b,mcp,agents"
---

# Scalekit Python SDK Coding Guidelines

You are a Scalekit API expert. Help me with writing code using the Scalekit SDK for Python applications, or directly via the REST API.

You can find the official SDK documentation here:
https://docs.scalekit.com

## Golden Rule: Use the Correct Scalekit SDK

Always use the official Scalekit Python SDK for server-side authentication and user management. This is the standard library for all Scalekit API interactions in Python.

- **Library Name:** Scalekit Python SDK
- **PyPI Package:** `scalekit-sdk-python`
- **Current Version:** 2.7.0
- **Minimum Python Version:** 3.9+

**Installation:**

```bash
pip install scalekit-sdk-python
```

**Correct Usage:**

```python
from scalekit import ScalekitClient
```

**Incorrect:**
- `pip install scalekit` (wrong package name — use `scalekit-sdk-python`)
- Using unofficial or community Scalekit packages
- Constructing raw HTTP requests instead of using the SDK

## Environment Variables

Set up your environment variables for Scalekit. Find these in the Scalekit Dashboard → Developers → API Credentials.

```
SCALEKIT_ENV_URL=https://your-subdomain.scalekit.com
SCALEKIT_CLIENT_ID=skc_your_client_id
SCALEKIT_CLIENT_SECRET=your_client_secret
```

For custom domains:
```
SCALEKIT_ENV_URL=https://auth.yourapp.com
```

## Installation and Setup

```bash
pip install scalekit-sdk-python==2.7.0
```

## Getting an Access Token (REST)

For direct REST API calls, obtain a bearer token using OAuth 2.0 client credentials:

```bash
curl -X POST "${SCALEKIT_ENV_URL}/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${SCALEKIT_CLIENT_ID}" \
  -d "client_secret=${SCALEKIT_CLIENT_SECRET}" \
  -d "grant_type=client_credentials"
```

Response:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 86399
}
```

Python equivalent:
```python
import os
import requests

response = requests.post(
    f"{os.environ['SCALEKIT_ENV_URL']}/oauth/token",
    data={
        "client_id": os.environ["SCALEKIT_CLIENT_ID"],
        "client_secret": os.environ["SCALEKIT_CLIENT_SECRET"],
        "grant_type": "client_credentials",
    },
)
access_token = response.json()["access_token"]
```

Tokens expire after ~24 hours. The SDK handles this automatically — no need to call this when using the SDK.

## Initialization

### SDK Client Initialization

```python
import os
from scalekit import ScalekitClient

scalekit_client = ScalekitClient(
    os.environ["SCALEKIT_ENV_URL"],
    os.environ["SCALEKIT_CLIENT_ID"],
    os.environ["SCALEKIT_CLIENT_SECRET"],
)
```

The client handles token refresh automatically. Create one instance and reuse it (e.g., as a module-level singleton or via dependency injection).

## SSO Authentication Flow

Scalekit uses OAuth 2.0 Authorization Code flow for SSO. The flow has two steps:
1. Generate an authorization URL and redirect the user
2. Handle the callback and exchange the code for tokens

### Step 1: Generate Authorization URL

Use one of four targeting options — by organization ID, email domain, specific connection ID, or social provider:

```python
import secrets
from scalekit import ScalekitClient, AuthorizationUrlOptions

REDIRECT_URI = "https://yourapp.com/auth/callback"

# Option A: by organization ID (most common for B2B apps)
options = AuthorizationUrlOptions()
options.organization_id = "org_123456"
options.state = secrets.token_urlsafe()
auth_url = scalekit_client.get_authorization_url(REDIRECT_URI, options)

# Option B: by email domain (auto-routes to the org's IdP)
options = AuthorizationUrlOptions()
options.domain_hint = "acmecorp.com"
auth_url = scalekit_client.get_authorization_url(REDIRECT_URI, options)

# Option C: by specific SSO connection ID (most precise)
options = AuthorizationUrlOptions()
options.connection_id = "conn_789"
auth_url = scalekit_client.get_authorization_url(REDIRECT_URI, options)

# Option D: social login provider
options = AuthorizationUrlOptions()
options.provider = "google"  # 'github', 'microsoft', 'gitlab', 'linkedin'
auth_url = scalekit_client.get_authorization_url(REDIRECT_URI, options)

# Redirect the user to auth_url
```

**REST equivalent** — construct the URL directly:
```
GET ${SCALEKIT_ENV_URL}/oauth/authorize
  ?response_type=code
  &client_id=${SCALEKIT_CLIENT_ID}
  &redirect_uri=${REDIRECT_URI}
  &scope=openid%20profile%20email
  &organization_id=org_123456
  &state=random-state
```

### Step 2: Handle the Callback

```python
# FastAPI example
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from scalekit import ScalekitClient

app = FastAPI()

@app.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    error = request.query_params.get("error")

    if error:
        return {"error": error}, 400

    # Validate state to prevent CSRF
    if state != request.session.get("oauth_state"):
        return {"error": "Invalid state"}, 400

    result = scalekit_client.authenticate_with_code(
        code,
        "https://yourapp.com/auth/callback"
    )

    # result is a dict with keys: access_token, id_token, user
    # user contains: id, email, name, given_name, family_name,
    #                username, picture, groups, organization_id
    request.session["user"] = result["user"]
    request.session["access_token"] = result["access_token"]

    return RedirectResponse("/dashboard")
```

**REST equivalent:**
```bash
curl -X POST "${SCALEKIT_ENV_URL}/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=${CODE}" \
  -d "redirect_uri=${REDIRECT_URI}" \
  -d "client_id=${SCALEKIT_CLIENT_ID}" \
  -d "client_secret=${SCALEKIT_CLIENT_SECRET}"
```

### IdP-Initiated Login

When users click "Login" from their IdP portal (not your app), Scalekit sends an `idp_initiated_login` token. Handle it by extracting claims and restarting SP-initiated flow:

```python
@app.get("/auth/callback")
async def auth_callback(request: Request):
    idp_initiated_login = request.query_params.get("idp_initiated_login")
    code = request.query_params.get("code")

    if idp_initiated_login:
        claims = scalekit_client.get_idp_initiated_login_claims(idp_initiated_login)

        options = AuthorizationUrlOptions()
        options.connection_id = claims["connection_id"]
        options.organization_id = claims["organization_id"]
        options.login_hint = claims.get("login_hint")
        if claims.get("relay_state"):
            options.state = claims["relay_state"]

        auth_url = scalekit_client.get_authorization_url(
            "https://yourapp.com/auth/callback",
            options
        )
        return RedirectResponse(auth_url)

    # Normal SP-initiated flow continues here...
    result = scalekit_client.authenticate_with_code(code, REDIRECT_URI)
    request.session["user"] = result["user"]
    return RedirectResponse("/dashboard")
```

### Token Validation and Logout

```python
# Validate an access token (checks signature + expiry against Scalekit public keys)
is_valid = scalekit_client.validate_access_token(access_token)

# Generate logout URL
from scalekit import LogoutUrlOptions

options = LogoutUrlOptions()
options.post_logout_redirect_uri = "https://yourapp.com/logged-out"
options.state = "some-state"
logout_url = scalekit_client.get_logout_url(options)
```

## Organization Management

Organizations represent your B2B customers (tenants). Each can have SSO connections, SCIM directories, users, and independent settings.

### Creating an Organization

```python
from scalekit import CreateOrganizationOptions

options = CreateOrganizationOptions()
options.external_id = "customer_12345"  # optional: your internal ID for this tenant

org = scalekit_client.organization.create_organization(
    "Acme Corporation",
    options=options
)
print("Organization ID:", org.organization.id)
```

**REST equivalent:**
```bash
curl -X POST "${SCALEKIT_ENV_URL}/api/v1/organizations" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Acme Corporation", "external_id": "customer_12345"}'
```

### Listing Organizations

```python
from scalekit import ListOrganizationOptions

options = ListOrganizationOptions()
options.page_size = 20

response = scalekit_client.organization.list_organizations(options=options)
orgs = response.organizations
next_page_token = response.next_page_token
```

**REST equivalent:**
```bash
curl -X GET "${SCALEKIT_ENV_URL}/api/v1/organizations?page_size=20" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Getting an Organization

```python
# By Scalekit org ID
org = scalekit_client.organization.get_organization("org_123456")

# By your external ID
org = scalekit_client.organization.get_organization_by_external_id("customer_12345")
```

**REST equivalent:**
```bash
curl -X GET "${SCALEKIT_ENV_URL}/api/v1/organizations/org_123456" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Updating an Organization

```python
org = scalekit_client.organization.update_organization(
    "org_123456",
    {
        "display_name": "Acme Corp (Renamed)",
        "external_id": "customer_12345",
    }
)
```

**REST equivalent:**
```bash
curl -X PATCH "${SCALEKIT_ENV_URL}/api/v1/organizations/org_123456" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Acme Corp (Renamed)"}'
```

### Deleting an Organization

```python
scalekit_client.organization.delete_organization("org_123456")
```

**REST equivalent:**
```bash
curl -X DELETE "${SCALEKIT_ENV_URL}/api/v1/organizations/org_123456" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Admin Portal Link

Generate a short-lived link so your customer's admin can self-configure their SSO connection or SCIM directory:

```python
link = scalekit_client.organization.generate_portal_link("org_123456")
print("Portal URL:", link.location)  # Send this URL to the customer admin
```

**REST equivalent:**
```bash
curl -X PUT "${SCALEKIT_ENV_URL}/api/v1/organizations/org_123456/portal_links" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

## Connection Management

Connections represent the actual SSO links between an organization and their identity provider (Okta, Azure AD, Google Workspace, Ping, etc.).

### Listing Connections

```python
# All connections in the environment
response = scalekit_client.connection.list_connections()

# Connections by email domain
connections = scalekit_client.connection.list_connections_by_domain("acmecorp.com")
```

**REST equivalent:**
```bash
curl -X GET "${SCALEKIT_ENV_URL}/api/v1/connections?organization_id=org_123456" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Getting a Connection

```python
connection = scalekit_client.connection.get_connection("conn_789")
print("Provider:", connection.provider)  # 'OKTA', 'AZURE_AD', 'GOOGLE', etc.
print("Status:", connection.status)      # 'ACTIVE', 'INACTIVE', 'DRAFT'
```

**REST equivalent:**
```bash
curl -X GET "${SCALEKIT_ENV_URL}/api/v1/connections/conn_789" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Enable / Disable a Connection

```python
scalekit_client.connection.enable_connection("conn_789")
scalekit_client.connection.disable_connection("conn_789")
```

**REST equivalent:**
```bash
curl -X PUT "${SCALEKIT_ENV_URL}/api/v1/connections/conn_789/enable" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

curl -X PUT "${SCALEKIT_ENV_URL}/api/v1/connections/conn_789/disable" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

## Webhook Verification

Scalekit sends HMAC-signed webhooks for events like `user.created`, `connection.enabled`, `directory.synced`. Verify the signature before processing:

```python
@app.post("/webhooks/scalekit")
async def handle_webhook(request: Request):
    body = await request.body()

    is_valid = scalekit_client.verify_webhook_payload(
        os.environ["SCALEKIT_WEBHOOK_SECRET"],  # 'whsec_...' from Scalekit Dashboard
        dict(request.headers),
        body.decode()
    )

    if not is_valid:
        return {"error": "Invalid signature"}, 401

    event = await request.json()

    if event["type"] == "user.created":
        print("New user:", event["data"])
    elif event["type"] == "connection.enabled":
        print("SSO enabled for org:", event["data"]["organization_id"])
    elif event["type"] == "directory.synced":
        print("Directory synced:", event["data"])

    return {"received": True}
```

## Error Handling

The SDK raises `ScalekitException` subclasses for API errors:

```python
from scalekit.core.exceptions import ScalekitException

try:
    org = scalekit_client.organization.get_organization("invalid_id")
except ScalekitException as e:
    print("Status:", e.http_status)   # e.g., 404
    print("Code:", e.error_code)      # Scalekit-specific error code
    print("Message:", e.message)
except Exception as e:
    print("Unexpected error:", e)
```

**Common HTTP status codes:**

| Status | Meaning |
|--------|--------|
| 400 | Bad Request — invalid parameters |
| 401 | Unauthorized — invalid credentials or expired token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource does not exist |
| 409 | Conflict — resource already exists |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |

### Retry with Backoff

```python
import time
from scalekit.core.exceptions import ScalekitException

def with_retry(fn, max_retries=3):
    for attempt in range(max_retries):
        try:
            return fn()
        except ScalekitException as e:
            if e.http_status == 429 and attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise

# Usage
org = with_retry(lambda: scalekit_client.organization.get_organization("org_123"))
```

## Complete Example: FastAPI SSO Login

```python
import os
import secrets
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from scalekit import ScalekitClient, AuthorizationUrlOptions, LogoutUrlOptions
from scalekit.core.exceptions import ScalekitException

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.environ["SESSION_SECRET"])

scalekit = ScalekitClient(
    os.environ["SCALEKIT_ENV_URL"],
    os.environ["SCALEKIT_CLIENT_ID"],
    os.environ["SCALEKIT_CLIENT_SECRET"],
)

REDIRECT_URI = "https://yourapp.com/auth/callback"


# Step 1: Initiate SSO login (org_id passed as query param from your login page)
@app.get("/auth/login")
async def login(request: Request, org_id: str):
    state = secrets.token_urlsafe()
    request.session["oauth_state"] = state

    options = AuthorizationUrlOptions()
    options.organization_id = org_id
    options.state = state

    auth_url = scalekit.get_authorization_url(REDIRECT_URI, options)
    return RedirectResponse(auth_url)


# Step 2: Handle SSO callback
@app.get("/auth/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    error = request.query_params.get("error")
    idp_initiated_login = request.query_params.get("idp_initiated_login")

    if error:
        return {"error": error}

    # Handle IdP-initiated login
    if idp_initiated_login:
        claims = scalekit.get_idp_initiated_login_claims(idp_initiated_login)
        options = AuthorizationUrlOptions()
        options.connection_id = claims["connection_id"]
        options.organization_id = claims["organization_id"]
        options.login_hint = claims.get("login_hint")
        auth_url = scalekit.get_authorization_url(REDIRECT_URI, options)
        return RedirectResponse(auth_url)

    # Validate state (CSRF protection)
    if state != request.session.get("oauth_state"):
        return {"error": "Invalid state"}

    try:
        result = scalekit.authenticate_with_code(code, REDIRECT_URI)
        request.session["user"] = {
            "id": result["user"]["id"],
            "email": result["user"]["email"],
            "name": result["user"].get("name"),
            "organization_id": result["user"].get("organizationId"),
        }
        request.session["access_token"] = result["access_token"]
        return RedirectResponse("/dashboard")
    except ScalekitException as e:
        return {"error": e.message}, 500


# Protected route
@app.get("/dashboard")
async def dashboard(request: Request):
    user = request.session.get("user")
    if not user:
        return RedirectResponse("/auth/login")

    access_token = request.session.get("access_token")
    if not scalekit.validate_access_token(access_token):
        return RedirectResponse("/auth/login")

    return {"user": user}


# Logout
@app.get("/auth/logout")
async def logout(request: Request):
    options = LogoutUrlOptions()
    options.post_logout_redirect_uri = "https://yourapp.com"
    logout_url = scalekit.get_logout_url(options)
    request.session.clear()
    return RedirectResponse(logout_url)
```

## Important Notes

### Security Best Practices

1. **Never expose client secrets** — keep `SCALEKIT_CLIENT_SECRET` server-side only
2. **Validate state parameter** — always check state in the OAuth callback to prevent CSRF
3. **Validate tokens** — call `validate_access_token()` on every protected server route
4. **Use HTTPS** — all redirect URIs must use HTTPS in production
5. **Rotate secrets** — rotate client secrets regularly from the Scalekit Dashboard

### Organization vs Connection vs Domain

- An **Organization** is a tenant (your customer). One org can have multiple connections.
- A **Connection** is the actual SSO link to a specific IdP (e.g., their Okta tenant). Use `connection_id` for the most precise routing.
- A **Domain** links an email suffix to an org, enabling routing via `domain_hint`.

### Redirect URIs

All redirect URIs must be pre-registered in the Scalekit Dashboard. The URI passed to `get_authorization_url()` and `authenticate_with_code()` must match exactly — including protocol, path, and trailing slashes.

## Useful Links

- Documentation: https://docs.scalekit.com
- SSO Quickstart: https://docs.scalekit.com/sso/quickstart/
- API Reference: https://docs.scalekit.com/apis
- GitHub: https://github.com/scalekit-inc/scalekit-sdk-python
- Dashboard: https://app.scalekit.com
