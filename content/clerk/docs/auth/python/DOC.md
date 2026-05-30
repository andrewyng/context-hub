---
name: auth
description: "Clerk Backend API Python SDK for server-side authentication and user management operations"
metadata:
  languages: "python"
  versions: "5.0.7"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "clerk,auth,authentication,user-management,backend"
---

# Clerk Backend API Python SDK Coding Guidelines

You are a Clerk Backend API Python SDK expert. Help me with writing code using the Clerk Backend API Python SDK for authentication and user management operations.

Please follow the following guidelines when generating code.

## Golden Rule: Use the Correct and Current SDK

Always use the official Clerk Backend API Python SDK, which is automatically generated from the Clerk Backend API OpenAPI specification using Speakeasy. 

- **Library Name:** Clerk Backend API Python SDK
- **Python Package:** `clerk-backend-api`
- **Main Class:** `Clerk` 

**Installation:**

```bash
pip install clerk-backend-api
```

**Basic Import:**

```python
from clerk_backend_api import Clerk
```

## Initialization and API Key

The Clerk SDK requires a secret key for authentication. Always initialize the client with your Clerk secret key:

```python
from clerk_backend_api import Clerk

# Initialize with secret key
clerk = Clerk(bearer_auth="sk_test_your_secret_key_here")
```

Set your `CLERK_SECRET_KEY` environment variable for production use.

## Core SDK Structure

The SDK is organized into logical modules for different Clerk resources: 

- **Users:** User management operations
- **Organizations:** Organization and membership management  
- **Sessions:** Session management and verification
- **Email Addresses:** Email address operations
- **Phone Numbers:** Phone number operations
- **Invitations:** Organization invitations
- **JWT Templates:** Custom JWT configuration
- **OAuth Applications:** OAuth app management
- **Webhooks:** Webhook management

## Basic User Operations

### Create a User

```python
from clerk_backend_api import Clerk

clerk = Clerk(bearer_auth="sk_test_your_secret_key_here")

# Create a new user
response = clerk.users.create_user(
    request_body={
        "email_address": ["user@example.com"],
        "password": "secure_password123",
        "first_name": "John",
        "last_name": "Doe"
    }
)

user = response.object
print(f"Created user: {user.id}")
```

### Get a User

```python
# Get user by ID
response = clerk.users.get_user(user_id="user_123456789")
user = response.object
print(f"User email: {user.email_addresses[0].email_address}")
```

### List Users

```python
# List all users with pagination
response = clerk.users.get_user_list(
    limit=10,
    offset=0,
    order_by="-created_at"
)

for user in response.object:
    print(f"User: {user.id} - {user.first_name} {user.last_name}")
```

### Update a User

```python
# Update user information
response = clerk.users.update_user(
    user_id="user_123456789",
    request_body={
        "first_name": "Jane",
        "last_name": "Smith"
    }
)
```

## Session Management

### Verify a Session

```python
# Verify a session token
response = clerk.sessions.verify_session(
    session_id="sess_123456789",
    request_body={
        "token": "session_token_here"
    }
)

session = response.object
print(f"Session status: {session.status}")
```

### Get Session List

```python
# Get all sessions for a client
response = clerk.sessions.get_session_list(
    client_id="client_123456789",
    user_id="user_123456789"
)
```

## Organization Management

### Create an Organization

```python
# Create a new organization
response = clerk.organizations.create_organization(
    request_body={
        "name": "Acme Corp",
        "slug": "acme-corp",
        "created_by": "user_123456789"
    }
)

org = response.object
print(f"Created organization: {org.id}")
```

### Add Organization Member

```python
# Add a user to an organization
response = clerk.organization_memberships.create_organization_membership(
    organization_id="org_123456789",
    request_body={
        "user_id": "user_123456789",
        "role": "basic_member"
    }
)
```

## Email and Phone Number Management

### Add Email Address

```python
# Add email address to user
response = clerk.email_addresses.create_email_address(
    request_body={
        "user_id": "user_123456789",
        "email_address": "new@example.com",
        "verified": False,
        "primary": False
    }
)
```

### Add Phone Number

```python
# Add phone number to user
response = clerk.phone_numbers.create_phone_number(
    request_body={
        "user_id": "user_123456789",
        "phone_number": "+1234567890",
        "verified": False,
        "primary": False
    }
)
```

## JWT Templates

### Create JWT Template

```python
# Create custom JWT template
response = clerk.jwt_templates.create_jwt_template(
    request_body={
        "name": "custom_template",
        "claims": {
            "custom_claim": "{{user.id}}"
        },
        "lifetime": 3600,
        "allowed_clock_skew": 5
    }
)
```

## Webhook Management

### Create Webhook Endpoint

```python
# Create webhook endpoint
response = clerk.webhooks.create_webhook(
    request_body={
        "url": "https://your-app.com/webhooks/clerk",
        "events": ["user.created", "user.updated", "session.created"]
    }
)
```

## Error Handling

The SDK uses structured error responses. Always handle potential errors:

```python
from clerk_backend_api import Clerk
from clerk_backend_api.models import ClerkErrors

clerk = Clerk(bearer_auth="sk_test_your_secret_key_here")

try:
    response = clerk.users.get_user(user_id="invalid_user_id")
    user = response.object
except Exception as e:
    if hasattr(e, 'errors'):
        for error in e.errors:
            print(f"Error: {error.message} (Code: {error.code})")
    else:
        print(f"Unexpected error: {e}")
```

## Dependencies and Requirements

The SDK includes the following key dependencies: 

- `cryptography ^43.0.1` - For cryptographic operations
- `pyjwt ^2.9.0` - For JWT token handling

## SDK Configuration

The SDK is automatically generated and maintained using Speakeasy configuration. The current version is `5.0.7` and includes comprehensive type hints and documentation.

## Session Token / JWT Verification

For verifying Clerk-issued session JWTs in your own request middleware, use the SDK's `authenticate_request` helper alongside the secret key. The helper validates the token's signature against Clerk's JWKS, checks the issuer, and returns the request state.

### Authenticate a Request

```python
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import AuthenticateRequestOptions
import httpx

clerk = Clerk(bearer_auth="sk_test_your_secret_key_here")

def verify(request_headers: dict) -> dict | None:
    httpx_request = httpx.Request(
        method="GET",
        url="https://your-app.example.com/api/protected",
        headers=request_headers,
    )
    state = clerk.authenticate_request(
        httpx_request,
        AuthenticateRequestOptions(
            authorized_parties=["https://your-app.example.com"],
        ),
    )
    if not state.is_signed_in:
        return None
    return state.payload  # JWT claims (sub, sid, etc.)
```

### FastAPI Dependency Example

```python
from fastapi import Depends, FastAPI, HTTPException, Request
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import AuthenticateRequestOptions
import httpx
import os

app = FastAPI()
clerk = Clerk(bearer_auth=os.environ["CLERK_SECRET_KEY"])

async def current_user(request: Request):
    httpx_req = httpx.Request(
        method=request.method,
        url=str(request.url),
        headers=dict(request.headers),
    )
    state = clerk.authenticate_request(
        httpx_req,
        AuthenticateRequestOptions(),
    )
    if not state.is_signed_in:
        raise HTTPException(status_code=401, detail=state.reason)
    return state.payload

@app.get("/me")
async def me(claims = Depends(current_user)):
    return {"user_id": claims["sub"], "session_id": claims["sid"]}
```

### Environment Variables

```
CLERK_SECRET_KEY=sk_live_your_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key
```

Never check secret keys into source control; load them from environment variables and never expose them to client code.
