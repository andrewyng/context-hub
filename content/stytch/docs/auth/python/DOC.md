---
name: auth
description: "Stytch Python SDK authentication guide for passwordless and OTP-based authentication"
metadata:
  languages: "python"
  versions: "15.2.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "stytch,auth,authentication,passwordless,otp"
---

# Stytch Python SDK - Authentication Guide

## Golden Rule

**ALWAYS use the official `stytch` package from PyPI.**

```bash
pip install stytch
```

**Current version: 15.2.0**

**DO NOT use:**
- Any unofficial or outdated Stytch packages
- Frontend JavaScript packages when building backend services

The `stytch` package is the official backend SDK for Python applications. It supports Python 3.8+ and includes full async/await support.

---

## Installation

### Install the SDK

```bash
pip install stytch
```

or with poetry:

```bash
poetry add stytch
```

or with uv:

```bash
uv pip install stytch
```

### Environment Variables

Set up your Stytch credentials in your environment:

```bash
STYTCH_PROJECT_ID=project-live-your-project-id
STYTCH_SECRET=secret-live-your-secret-key
```

**Get credentials from:** [Stytch Dashboard](https://stytch.com/dashboard)

For testing, use test environment credentials:

```bash
STYTCH_PROJECT_ID=project-test-your-project-id
STYTCH_SECRET=secret-test-your-secret-key
```

### .env File Example

```env
STYTCH_PROJECT_ID=project-live-c60c0abe-c25a-4472-a9ed-320c6667d317
STYTCH_SECRET=secret-live-80JASucyk7z_G8Z-7dVwZVGXL5NT_qGAQ2I=
```

---

## Initialization

### Basic B2C Client

```python
import stytch
import os

client = stytch.Client(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
)
```

### Client with Environment Override

```python
client = stytch.Client(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
    environment="test",  # or "live" (default)
)
```

### B2B Client (for organizations)

```python
import stytch

b2b_client = stytch.B2BClient(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
)
```

### Client with Custom Base URL

```python
client = stytch.Client(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
    custom_base_url="https://api.custom-domain.com/",
)
```

### Async Client Usage

All methods have async versions by appending `_async`:

```python
import asyncio

async def main():
    client = stytch.Client(
        project_id=os.getenv("STYTCH_PROJECT_ID"),
        secret=os.getenv("STYTCH_SECRET"),
    )
    
    response = await client.magic_links.email.login_or_create_async(
        email="user@example.com"
    )
    print(response.user_id)

asyncio.run(main())
```

---

## Core API Surfaces

### 1. Magic Links

Magic links provide passwordless authentication via email.

#### Send Magic Link (Login or Create)

```python
# Minimal example
response = client.magic_links.email.login_or_create(
    email="user@example.com",
)

print(response.user_id)
print(response.email_id)
```

#### Send Magic Link with Custom URLs

```python
response = client.magic_links.email.login_or_create(
    email="user@example.com",
    login_magic_link_url="https://example.com/authenticate",
    signup_magic_link_url="https://example.com/authenticate",
    login_expiration_minutes=15,
    signup_expiration_minutes=60,
)
```

#### Advanced Magic Link with Options

```python
response = client.magic_links.email.login_or_create(
    email="user@example.com",
    login_magic_link_url="https://example.com/authenticate",
    signup_magic_link_url="https://example.com/authenticate",
    login_expiration_minutes=15,
    signup_expiration_minutes=60,
    login_template_id="custom-login-template",
    signup_template_id="custom-signup-template",
    attributes=stytch.Attributes(
        ip_address="192.168.1.1",
    ),
    code_challenge="challenge_string",  # For PKCE flow
    user_id="user-123",  # Associate with existing user
    session_duration_minutes=60,
)
```

#### Authenticate Magic Link

```python
# Minimal example
response = client.magic_links.authenticate(
    token="DOYoip3rvIMMW5lgItikFK-Ak1CfMsgjuiCyI7uuU94=",
)

print(response.user)
print(response.session_token)
print(response.session_jwt)
```

#### Authenticate with Session Options

```python
response = client.magic_links.authenticate(
    token="DOYoip3rvIMMW5lgItikFK-Ak1CfMsgjuiCyI7uuU94=",
    session_duration_minutes=60,
    session_custom_claims={"custom_claim": "value"},
    attributes=stytch.Attributes(
        ip_address="192.168.1.1",
        user_agent="Mozilla/5.0...",
    ),
)
```

#### Send Magic Link Only (No Auto-Create)

```python
response = client.magic_links.email.send(
    email="user@example.com",
    login_magic_link_url="https://example.com/authenticate",
    login_expiration_minutes=15,
)
```

#### Create Embeddable Magic Link

```python
response = client.magic_links.email.create_embeddable(
    user_id="user-live-123",
    embeddable_magic_link_url="https://example.com/authenticate",
    expiration_minutes=10,
)

print(response.token)  # Use in your own emails
```

#### Async Magic Link Example

```python
async def send_magic_link(email: str):
    response = await client.magic_links.email.login_or_create_async(
        email=email,
        login_magic_link_url="https://example.com/authenticate",
    )
    return response.user_id
```

---

### 2. One-Time Passcodes (OTP)

#### SMS OTP

**Send OTP via SMS:**

```python
# Minimal example
response = client.otps.sms.send(
    phone_number="+15555555555",
)

print(response.phone_id)
```

**Send OTP with Options:**

```python
response = client.otps.sms.send(
    phone_number="+15555555555",
    expiration_minutes=10,
    attributes=stytch.Attributes(ip_address="192.168.1.1"),
    user_id="user-123",  # Associate with existing user
)
```

**Authenticate SMS OTP:**

```python
# Minimal example
response = client.otps.authenticate(
    method_id="phone-id-123",
    code="123456",
)
```

**Authenticate with Session:**

```python
response = client.otps.authenticate(
    method_id="phone-id-123",
    code="123456",
    session_duration_minutes=60,
    attributes=stytch.Attributes(ip_address="192.168.1.1"),
)

print(response.user)
print(response.session_token)
```

#### Email OTP

**Send OTP via Email:**

```python
# Minimal example
response = client.otps.email.send(
    email="user@example.com",
)
```

**Send with Options:**

```python
response = client.otps.email.send(
    email="user@example.com",
    expiration_minutes=10,
    login_template_id="custom-template",
    user_id="user-123",
)
```

**Authenticate Email OTP:**

```python
response = client.otps.authenticate(
    method_id="email-id-123",
    code="123456",
    session_duration_minutes=60,
)
```

#### WhatsApp OTP

**Send OTP via WhatsApp:**

```python
response = client.otps.whatsapp.send(
    phone_number="+15555555555",
)
```

**Authenticate WhatsApp OTP:**

```python
response = client.otps.authenticate(
    method_id="phone-id-123",
    code="123456",
)
```

#### Login or Create User with SMS

```python
response = client.otps.sms.login_or_create(
    phone_number="+15555555555",
    expiration_minutes=10,
)
```

#### Login or Create User with Email

```python
response = client.otps.email.login_or_create(
    email="user@example.com",
    expiration_minutes=10,
)
```

---

### 3. OAuth

OAuth enables authentication via third-party providers.

#### Start OAuth Flow

```python
# Get OAuth authorization URL
response = client.oauth.start(
    provider="google",
    signup_redirect_url="https://example.com/authenticate",
    login_redirect_url="https://example.com/authenticate",
)

print(response.oauth_url)  # Redirect user here
```

#### Start OAuth with Options

```python
response = client.oauth.start(
    provider="google",
    signup_redirect_url="https://example.com/authenticate",
    login_redirect_url="https://example.com/authenticate",
    custom_scopes=["https://www.googleapis.com/auth/calendar.readonly"],
    provider_params={"access_type": "offline"},
    code_challenge="challenge_string",  # For PKCE
)
```

#### Authenticate OAuth

```python
# Minimal example
response = client.oauth.authenticate(
    token="oauth-token-from-callback",
)

print(response.user)
print(response.session_token)
```

#### Authenticate with Session Options

```python
response = client.oauth.authenticate(
    token="oauth-token-from-callback",
    session_duration_minutes=60,
    session_custom_claims={"custom_claim": "value"},
)
```

#### Supported OAuth Providers

- `google`
- `microsoft`
- `facebook`
- `github`
- `gitlab`
- `slack`
- `linkedin`
- `amazon`
- `bitbucket`
- `coinbase`
- `discord`
- `figma`
- `hubspot`
- `salesforce`
- `shopify`
- `snapchat`
- `tiktok`
- `twitch`
- `twitter`
- `yahoo`

---

### 4. Sessions

Sessions manage authenticated user state.

#### Authenticate Session

```python
# Minimal example
response = client.sessions.authenticate(
    session_token="session-token-here",
)

print(response.user)
print(response.session)  # Contains session data
```

#### Authenticate with JWT

```python
response = client.sessions.authenticate_jwt(
    session_jwt="jwt-token-here",
)
```

#### Authenticate Session with Refresh

```python
response = client.sessions.authenticate(
    session_token="session-token-here",
    session_duration_minutes=60,  # Extend session
)

# Store new token
new_session_token = response.session_token
```

#### Get Sessions

```python
response = client.sessions.get(
    user_id="user-123",
)

print(response.sessions)  # All active sessions
```

#### Revoke Session

```python
client.sessions.revoke(
    session_token="session-token-to-revoke",
)
```

#### Revoke Session by ID

```python
client.sessions.revoke(
    session_id="session-id-123",
)
```

#### Migrate Session

```python
response = client.sessions.migrate(
    session_token="old-session-token",
    session_duration_minutes=60,
)

print(response.session_token)  # New token
```

---

### 5. Users

Manage user accounts and data.

#### Get User

```python
response = client.users.get(
    user_id="user-123",
)

print(response.user)
print(response.user.emails)
print(response.user.phone_numbers)
```

#### Create User

```python
response = client.users.create(
    email="user@example.com",
    name={"first_name": "John", "last_name": "Doe"},
)
```

#### Create User with Multiple Methods

```python
response = client.users.create(
    email="user@example.com",
    phone_number="+15555555555",
    name={"first_name": "John", "last_name": "Doe"},
    attributes={"custom_attribute": "value"},
)
```

#### Update User

```python
response = client.users.update(
    user_id="user-123",
    name={"first_name": "Jane", "last_name": "Smith"},
    attributes={"custom_field": "new_value"},
)
```

#### Delete User

```python
client.users.delete(
    user_id="user-123",
)
```

#### Search Users

```python
# Basic search
response = client.users.search(
    query={
        "operator": "AND",
        "operands": [
            {
                "filter_name": "status",
                "filter_value": ["active"],
            },
        ],
    },
)

print(response.results)
```

#### Advanced User Search

```python
response = client.users.search(
    query={
        "operator": "AND",
        "operands": [
            {
                "filter_name": "email_verified",
                "filter_value": [True],
            },
            {
                "filter_name": "created_at",
                "filter_value": {
                    "greater_than": "2024-01-01T00:00:00Z",
                },
            },
        ],
    },
    limit=100,
    cursor="cursor-from-previous-request",
)
```

#### Delete Email

```python
client.users.delete_email(
    email_id="email-id-123",
)
```

#### Delete Phone Number

```python
client.users.delete_phone_number(
    phone_id="phone-id-123",
)
```

---

### 6. Passwords

Traditional password authentication.

#### Create Password

```python
response = client.passwords.create(
    email="user@example.com",
    password="SecurePassword123!",
    session_duration_minutes=60,
)

print(response.user)
print(response.session_token)
```

#### Authenticate Password

```python
# Minimal example
response = client.passwords.authenticate(
    email="user@example.com",
    password="SecurePassword123!",
)
```

#### Authenticate with Session

```python
response = client.passwords.authenticate(
    email="user@example.com",
    password="SecurePassword123!",
    session_duration_minutes=60,
    session_custom_claims={"custom_claim": "value"},
)

print(response.session_token)
```

#### Strength Check

```python
response = client.passwords.strength_check(
    email="user@example.com",
    password="password-to-check",
)

print(response.valid_password)
print(response.score)
print(response.breached_password)
print(response.strength_policy)
print(response.breach_detection_on_create)
```

#### Initiate Password Reset

```python
response = client.passwords.email.reset_start(
    email="user@example.com",
    reset_password_redirect_url="https://example.com/reset",
    reset_password_expiration_minutes=30,
)
```

#### Reset Password by Email

```python
response = client.passwords.email.reset(
    token="reset-token-from-email",
    password="NewSecurePassword123!",
    session_duration_minutes=60,
)

print(response.user)
print(response.session_token)
```

#### Reset Password by Session

```python
response = client.passwords.session.reset(
    session_token="active-session-token",
    password="NewSecurePassword123!",
)
```

#### Migrate Password (from existing system)

```python
response = client.passwords.migrate(
    email="user@example.com",
    hash="$2a$10$...",  # bcrypt hash
    hash_type="bcrypt",
    name={"first_name": "John", "last_name": "Doe"},
)
```

---

### 7. WebAuthn

Passwordless authentication using biometrics or security keys.

#### Register WebAuthn Start

```python
response = client.webauthn.register_start(
    user_id="user-123",
    domain="example.com",
    authenticator_type="platform",  # or "cross-platform"
)

print(response.public_key_credential_creation_options)
```

#### Register WebAuthn Finish

```python
response = client.webauthn.register(
    user_id="user-123",
    public_key_credential="credential-from-client",
    session_duration_minutes=60,
)

print(response.webauthn_registration_id)
print(response.session_token)
```

#### Authenticate WebAuthn Start

```python
response = client.webauthn.authenticate_start(
    domain="example.com",
    user_id="user-123",  # Optional
)

print(response.public_key_credential_request_options)
```

#### Authenticate WebAuthn Finish

```python
response = client.webauthn.authenticate(
    public_key_credential="credential-from-client",
    session_duration_minutes=60,
)

print(response.user)
print(response.session_token)
```

#### Update WebAuthn

```python
response = client.webauthn.update(
    webauthn_registration_id="webauthn-reg-id-123",
    name="My Fingerprint",
)
```

---

### 8. TOTP (Time-based One-Time Passwords)

#### Create TOTP

```python
response = client.totps.create(
    user_id="user-123",
    expiration_minutes=10,
)

print(response.secret)
print(response.qr_code)  # URL for QR code image
print(response.recovery_codes)
```

#### Authenticate TOTP

```python
response = client.totps.authenticate(
    user_id="user-123",
    totp_code="123456",
    session_duration_minutes=60,
)

print(response.session_token)
```

#### Get TOTPs

```python
response = client.totps.get(
    user_id="user-123",
)

print(response.totps)
```

#### Recover TOTP

```python
response = client.totps.recovery_codes(
    user_id="user-123",
    recovery_code="recovery-code-string",
    session_duration_minutes=60,
)

print(response.session_token)
```

---

### 9. Crypto Wallets (Web3)

#### Authenticate Wallet Start

```python
response = client.crypto_wallets.authenticate_start(
    crypto_wallet_address="0x1234...",
    crypto_wallet_type="ethereum",
)

print(response.challenge)
```

#### Authenticate Wallet Finish

```python
response = client.crypto_wallets.authenticate(
    crypto_wallet_address="0x1234...",
    crypto_wallet_type="ethereum",
    signature="signed-challenge",
    session_duration_minutes=60,
)

print(response.user)
print(response.session_token)
```

---

### 10. M2M (Machine-to-Machine)

#### Authenticate M2M Token

```python
response = client.m2m.authenticate_token(
    access_token="m2m-access-token",
)

print(response.member_id)
print(response.scopes)
```

#### Get M2M Client

```python
response = client.m2m.clients.get(
    client_id="client-id-123",
)

print(response.m2m_client)
```

---

## B2B API Surfaces

### 1. Organizations

#### Create Organization

```python
response = b2b_client.organizations.create(
    organization_name="Acme Corp",
    organization_slug="acme",
    email_allowed_domains=["acme.com"],
)

print(response.organization)
```

#### Get Organization

```python
response = b2b_client.organizations.get(
    organization_id="org-123",
)

print(response.organization)
```

#### Update Organization

```python
response = b2b_client.organizations.update(
    organization_id="org-123",
    organization_name="Acme Corporation",
)
```

#### Delete Organization

```python
b2b_client.organizations.delete(
    organization_id="org-123",
)
```

---

### 2. Members

#### Create Member

```python
response = b2b_client.organizations.members.create(
    organization_id="org-123",
    email_address="member@acme.com",
    name="John Doe",
    is_breakglass=False,
)

print(response.member)
```

#### Get Member

```python
response = b2b_client.organizations.members.get(
    organization_id="org-123",
    member_id="member-123",
)

print(response.member)
```

#### Update Member

```python
response = b2b_client.organizations.members.update(
    organization_id="org-123",
    member_id="member-123",
    name="Jane Doe",
)
```

#### Delete Member

```python
b2b_client.organizations.members.delete(
    organization_id="org-123",
    member_id="member-123",
)
```

---

### 3. B2B Magic Links

#### Send B2B Magic Link

```python
response = b2b_client.magic_links.email.login_or_signup(
    organization_id="org-123",
    email_address="member@acme.com",
    login_redirect_url="https://acme.com/authenticate",
    signup_redirect_url="https://acme.com/authenticate",
)
```

#### Authenticate B2B Magic Link

```python
response = b2b_client.magic_links.authenticate(
    magic_links_token="token-from-email",
    session_duration_minutes=60,
)

print(response.member)
print(response.organization)
print(response.session_token)
```

---

### 4. B2B Sessions

#### Authenticate B2B Session

```python
response = b2b_client.sessions.authenticate(
    session_token="session-token-here",
)

print(response.member)
print(response.organization)
print(response.session)
```

#### Authenticate B2B JWT

```python
response = b2b_client.sessions.authenticate_jwt(
    session_jwt="jwt-token-here",
)
```

#### Get B2B Sessions

```python
response = b2b_client.sessions.get(
    organization_id="org-123",
    member_id="member-123",
)

print(response.sessions)
```

#### Revoke B2B Session

```python
b2b_client.sessions.revoke(
    session_token="session-token-to-revoke",
)
```

---

### 5. B2B OAuth

#### Start B2B OAuth

```python
response = b2b_client.oauth.start(
    organization_id="org-123",
    provider="google",
    login_redirect_url="https://acme.com/authenticate",
    signup_redirect_url="https://acme.com/authenticate",
)

print(response.oauth_url)
```

#### Authenticate B2B OAuth

```python
response = b2b_client.oauth.authenticate(
    oauth_token="token-from-callback",
    session_duration_minutes=60,
)

print(response.member)
print(response.organization)
print(response.session_token)
```

---

### 6. B2B SMS OTP

#### Send B2B SMS OTP

```python
response = b2b_client.otps.sms.send(
    organization_id="org-123",
    member_id="member-123",
    phone_number="+15555555555",
)
```

#### Authenticate B2B SMS OTP

```python
response = b2b_client.otps.sms.authenticate(
    organization_id="org-123",
    member_id="member-123",
    code="123456",
    session_duration_minutes=60,
)

print(response.member)
print(response.session_token)
```

---

### 7. SSO (Single Sign-On)

#### Start SSO

```python
response = b2b_client.sso.start(
    connection_id="sso-connection-123",
    login_redirect_url="https://acme.com/authenticate",
    signup_redirect_url="https://acme.com/authenticate",
)

print(response.sso_url)
```

#### Authenticate SSO

```python
response = b2b_client.sso.authenticate(
    sso_token="token-from-sso-provider",
    session_duration_minutes=60,
)

print(response.member)
print(response.organization)
```

#### Get SSO Connections

```python
response = b2b_client.sso.get_connections(
    organization_id="org-123",
)

print(response.saml_connections)
print(response.oidc_connections)
```

#### Create SAML Connection

```python
response = b2b_client.sso.saml.create_connection(
    organization_id="org-123",
    display_name="Acme SAML",
)

print(response.connection)
```

#### Update SAML Connection

```python
response = b2b_client.sso.saml.update_connection(
    organization_id="org-123",
    connection_id="saml-connection-123",
    idp_entity_id="https://idp.acme.com/entity",
    idp_sso_url="https://idp.acme.com/sso",
    attribute_mapping={
        "email": "email",
        "first_name": "firstName",
        "last_name": "lastName",
    },
    x509_certificate="certificate-string",
)
```

#### Create OIDC Connection

```python
response = b2b_client.sso.oidc.create_connection(
    organization_id="org-123",
    display_name="Acme OIDC",
)

print(response.connection)
```

#### Update OIDC Connection

```python
response = b2b_client.sso.oidc.update_connection(
    organization_id="org-123",
    connection_id="oidc-connection-123",
    issuer="https://idp.acme.com",
    client_id="client-id",
    client_secret="client-secret",
    authorization_url="https://idp.acme.com/authorize",
    token_url="https://idp.acme.com/token",
    userinfo_url="https://idp.acme.com/userinfo",
)
```

---

### 8. Discovery

Discovery allows users to find and join organizations.

#### Create Organization via Discovery

```python
response = b2b_client.discovery.organizations.create(
    intermediate_session_token="token-from-discovery",
    organization_name="New Org",
    organization_slug="new-org",
    session_duration_minutes=60,
)

print(response.organization)
print(response.session_token)
```

#### List Discovered Organizations

```python
response = b2b_client.discovery.organizations.list(
    intermediate_session_token="token-from-discovery",
)

print(response.discovered_organizations)
```

---

### 9. RBAC (Role-Based Access Control)

#### Check Member Permissions

```python
response = b2b_client.rbac.policy(
    organization_id="org-123",
    member_id="member-123",
    resource_id="document-123",
    action="read",
)

print(response.authorized)
```

---

## Error Handling

### Basic Error Handling

```python
from stytch.core.response_base import StytchError

try:
    response = client.magic_links.email.login_or_create(
        email="user@example.com",
    )
    print(response.user_id)
except StytchError as error:
    print("Error:", error.details.error_type)
    print("Message:", error.details.error_message)
    print("URL:", error.details.error_url)
```

### Detailed Error Handling

```python
from stytch.core.response_base import StytchError

try:
    response = client.magic_links.authenticate(token=token)
except StytchError as error:
    if error.details.error_type == "unable_to_auth_magic_link":
        # Token invalid, expired, or already used
        print("Invalid or expired magic link")
    elif error.details.error_type == "invalid_token":
        # Malformed token
        print("Invalid token format")
    else:
        # Other errors
        print("Authentication failed")
```

### Common Error Types

- `unable_to_auth_magic_link` - Magic link token invalid, expired, or used
- `invalid_token` - Token format is invalid
- `session_not_found` - Session doesn't exist
- `user_not_found` - User doesn't exist
- `duplicate_email` - Email already exists
- `invalid_credentials` - Password authentication failed
- `rate_limit_exceeded` - Too many requests
- `unauthorized` - API credentials invalid

---

## Flask Integration Example

### Complete Auth Flow

```python
from flask import Flask, request, session, redirect, jsonify
from stytch import Client
from stytch.core.response_base import StytchError
import os

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")

stytch_client = Client(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
)

@app.route("/login", methods=["POST"])
def login():
    try:
        email = request.json.get("email")
        response = stytch_client.magic_links.email.login_or_create(
            email=email,
            login_magic_link_url=f"{os.getenv('BASE_URL')}/authenticate",
            signup_magic_link_url=f"{os.getenv('BASE_URL')}/authenticate",
        )
        return jsonify({"success": True, "user_id": response.user_id})
    except StytchError as error:
        return jsonify({"error": error.details.error_message}), 400

@app.route("/authenticate")
def authenticate():
    try:
        token = request.args.get("token")
        response = stytch_client.magic_links.authenticate(
            token=token,
            session_duration_minutes=60,
        )
        
        session["stytch_session_token"] = response.session_token
        session["user_id"] = response.user.user_id
        
        return redirect("/dashboard")
    except StytchError:
        return "Authentication failed", 400

def authenticate_session():
    """Middleware to authenticate session"""
    session_token = session.get("stytch_session_token")
    
    if not session_token:
        return None
    
    try:
        response = stytch_client.sessions.authenticate(
            session_token=session_token,
        )
        session["stytch_session_token"] = response.session_token
        return response.user
    except StytchError:
        session.clear()
        return None

@app.route("/dashboard")
def dashboard():
    user = authenticate_session()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify({"user": user})

@app.route("/logout", methods=["POST"])
def logout():
    try:
        stytch_client.sessions.revoke(
            session_token=session.get("stytch_session_token"),
        )
        session.clear()
        return jsonify({"success": True})
    except StytchError as error:
        return jsonify({"error": error.details.error_message}), 400

if __name__ == "__main__":
    app.run(port=3000)
```

---

## FastAPI Integration Example

### Complete Auth Flow with FastAPI

```python
from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import stytch
import os

app = FastAPI()

client = stytch.Client(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
)

class LoginRequest(BaseModel):
    email: str

@app.post("/login")
async def login(data: LoginRequest):
    try:
        response = client.magic_links.email.login_or_create(
            email=data.email,
            login_magic_link_url=f"{os.getenv('BASE_URL')}/authenticate",
        )
        return {"success": True, "user_id": response.user_id}
    except stytch.core.response_base.StytchError as error:
        raise HTTPException(
            status_code=400,
            detail=error.details.error_message
        )

@app.get("/authenticate")
async def authenticate(token: str, response: Response):
    try:
        auth_response = client.magic_links.authenticate(
            token=token,
            session_duration_minutes=60,
        )
        
        response.set_cookie(
            key="stytch_session",
            value=auth_response.session_token,
            httponly=True,
            secure=True,
            max_age=3600,
        )
        
        return RedirectResponse(url="/dashboard")
    except stytch.core.response_base.StytchError:
        raise HTTPException(status_code=400, detail="Authentication failed")

async def get_current_user(request: Request):
    session_token = request.cookies.get("stytch_session")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        response = client.sessions.authenticate(
            session_token=session_token,
        )
        return response.user
    except stytch.core.response_base.StytchError:
        raise HTTPException(status_code=401, detail="Invalid session")

@app.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    return {"user": user}

@app.post("/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("stytch_session")
    
    if session_token:
        try:
            client.sessions.revoke(session_token=session_token)
        except stytch.core.response_base.StytchError:
            pass
    
    response.delete_cookie("stytch_session")
    return {"success": True}
```

---

## Django Integration Example

### Django Middleware for Stytch

```python
# middleware.py
import stytch
import os
from django.utils.functional import SimpleLazyObject

client = stytch.Client(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
)

def get_user(request):
    session_token = request.session.get("stytch_session_token")
    
    if not session_token:
        return None
    
    try:
        response = client.sessions.authenticate(
            session_token=session_token,
        )
        request.session["stytch_session_token"] = response.session_token
        return response.user
    except stytch.core.response_base.StytchError:
        return None

class StytchAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.stytch_user = SimpleLazyObject(lambda: get_user(request))
        response = self.get_response(request)
        return response
```

### Django Views

```python
# views.py
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.http import require_http_methods
from stytch.core.response_base import StytchError
import json

@require_http_methods(["POST"])
def login(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        
        response = client.magic_links.email.login_or_create(
            email=email,
            login_magic_link_url=f"{os.getenv('BASE_URL')}/authenticate",
        )
        
        return JsonResponse({
            "success": True,
            "user_id": response.user_id
        })
    except StytchError as error:
        return JsonResponse({
            "error": error.details.error_message
        }, status=400)

def authenticate(request):
    try:
        token = request.GET.get("token")
        response = client.magic_links.authenticate(
            token=token,
            session_duration_minutes=60,
        )
        
        request.session["stytch_session_token"] = response.session_token
        request.session["user_id"] = response.user.user_id
        
        return HttpResponseRedirect("/dashboard")
    except StytchError:
        return JsonResponse({"error": "Authentication failed"}, status=400)

@require_http_methods(["POST"])
def logout(request):
    try:
        session_token = request.session.get("stytch_session_token")
        if session_token:
            client.sessions.revoke(session_token=session_token)
        request.session.flush()
        return JsonResponse({"success": True})
    except StytchError as error:
        return JsonResponse({
            "error": error.details.error_message
        }, status=400)
```

---

## Async/Await Support

All SDK methods support async by appending `_async`:

### Async Example with asyncio

```python
import asyncio
import stytch
import os

async def main():
    client = stytch.Client(
        project_id=os.getenv("STYTCH_PROJECT_ID"),
        secret=os.getenv("STYTCH_SECRET"),
    )
    
    # Send magic link
    response = await client.magic_links.email.login_or_create_async(
        email="user@example.com",
        login_magic_link_url="https://example.com/authenticate",
    )
    print(f"Magic link sent to user: {response.user_id}")
    
    # Authenticate (in a real app, this would happen after user clicks link)
    auth_response = await client.magic_links.authenticate_async(
        token="token-from-email",
    )
    print(f"User authenticated: {auth_response.user.user_id}")
    
    # Validate session
    session_response = await client.sessions.authenticate_async(
        session_token=auth_response.session_token,
    )
    print(f"Session valid for: {session_response.user.emails}")

asyncio.run(main())
```

### Async with FastAPI

```python
from fastapi import FastAPI
import stytch
import os

app = FastAPI()

client = stytch.Client(
    project_id=os.getenv("STYTCH_PROJECT_ID"),
    secret=os.getenv("STYTCH_SECRET"),
)

@app.post("/login")
async def login(email: str):
    response = await client.magic_links.email.login_or_create_async(
        email=email,
        login_magic_link_url="https://example.com/authenticate",
    )
    return {"user_id": response.user_id}

@app.get("/authenticate")
async def authenticate(token: str):
    response = await client.magic_links.authenticate_async(
        token=token,
        session_duration_minutes=60,
    )
    return {"session_token": response.session_token}
```

---

## Testing

### Using Test Environment

```python
client = stytch.Client(
    project_id=os.getenv("STYTCH_TEST_PROJECT_ID"),
    secret=os.getenv("STYTCH_TEST_SECRET"),
    environment="test",
)
```

### Test Mode Magic Links

In test mode, use these special test emails:
- `sandbox@stytch.com` - Always succeeds

### Mock Testing with pytest

```python
import pytest
from unittest.mock import Mock, patch
import stytch

@pytest.fixture
def mock_stytch_client():
    with patch('stytch.Client') as mock:
        client = mock.return_value
        
        # Mock magic links
        client.magic_links.email.login_or_create = Mock(
            return_value=Mock(
                user_id="user-test-123",
                email_id="email-test-123",
            )
        )
        
        client.magic_links.authenticate = Mock(
            return_value=Mock(
                user=Mock(
                    user_id="user-test-123",
                    emails=[{"email": "test@example.com"}],
                ),
                session_token="test-session-token",
            )
        )
        
        yield client

def test_login(mock_stytch_client):
    response = mock_stytch_client.magic_links.email.login_or_create(
        email="test@example.com"
    )
    assert response.user_id == "user-test-123"
```

---

## Webhooks

### Verify Webhook Signature

```python
import hmac
import hashlib

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected_signature = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return signature == expected_signature

# Flask webhook endpoint
@app.route("/webhooks/stytch", methods=["POST"])
def stytch_webhook():
    signature = request.headers.get("stytch-signature")
    payload = request.get_data()
    
    is_valid = verify_webhook_signature(
        payload,
        signature,
        os.getenv("STYTCH_WEBHOOK_SECRET")
    )
    
    if not is_valid:
        return "Invalid signature", 401
    
    event = request.json
    print(f"Webhook event: {event['event_type']}")
    
    return jsonify({"received": True})
```

### FastAPI Webhook Handler

```python
from fastapi import FastAPI, Request, HTTPException
import hmac
import hashlib

@app.post("/webhooks/stytch")
async def stytch_webhook(request: Request):
    signature = request.headers.get("stytch-signature")
    payload = await request.body()
    
    expected_signature = hmac.new(
        os.getenv("STYTCH_WEBHOOK_SECRET").encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected_signature:
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    event = await request.json()
    print(f"Webhook event: {event['event_type']}")
    
    return {"received": True}
```

### Webhook Event Types

- `user.created` - New user created
- `user.updated` - User data updated
- `user.deleted` - User deleted
- `session.created` - New session created
- `session.revoked` - Session revoked
- `magic_link.sent` - Magic link sent
- `otp.sent` - OTP sent
- `password.strength_check_failed` - Weak password detected

---

## Advanced Use Cases

### Multi-Factor Authentication Flow

```python
# Step 1: Primary authentication (password)
@app.post("/login")
def login():
    email = request.json.get("email")
    password = request.json.get("password")
    
    try:
        response = client.passwords.authenticate(
            email=email,
            password=password,
            session_duration_minutes=5,  # Short session for MFA
        )
        
        return jsonify({
            "requires_mfa": True,
            "intermediate_session_token": response.session_token,
            "user_id": response.user_id,
        })
    except StytchError:
        return jsonify({"error": "Invalid credentials"}), 401

# Step 2: MFA with TOTP
@app.post("/verify-totp")
def verify_totp():
    user_id = request.json.get("user_id")
    totp_code = request.json.get("totp_code")
    
    try:
        response = client.totps.authenticate(
            user_id=user_id,
            totp_code=totp_code,
            session_duration_minutes=60,  # Full session after MFA
        )
        
        return jsonify({
            "session_token": response.session_token,
            "user": response.user,
        })
    except StytchError:
        return jsonify({"error": "Invalid TOTP code"}), 401
```

### Custom Email Templates

```python
response = client.magic_links.email.login_or_create(
    email="user@example.com",
    login_magic_link_url="https://example.com/authenticate",
    login_template_id="custom-login-template-id",
    signup_template_id="custom-signup-template-id",
)
```

### IP and User Agent Matching

```python
response = client.magic_links.authenticate(
    token=token,
    attributes=stytch.Attributes(
        ip_address=request.remote_addr,
        user_agent=request.headers.get("User-Agent"),
    ),
)
```

---

## Rate Limiting

Stytch implements rate limiting on authentication endpoints. Handle rate limit errors:

```python
from stytch.core.response_base import StytchError

try:
    client.otps.sms.send(phone_number=phone_number)
except StytchError as error:
    if error.details.error_type == "rate_limit_exceeded":
        retry_after = error.details.retry_after  # seconds
        return jsonify({
            "error": "Too many requests",
            "retry_after": retry_after,
        }), 429
```

---

## Migration from Other Auth Systems

### Import Users with Passwords

```python
# Migrate user from bcrypt-based system
client.passwords.migrate(
    email="user@example.com",
    hash="$2a$10$existing_bcrypt_hash",
    hash_type="bcrypt",
    name={"first_name": "John", "last_name": "Doe"},
)
```

### Supported Hash Types

- `bcrypt`
- `md_5`
- `argon_2i`
- `argon_2id`
- `sha_1`
- `scrypt`
- `phpass`
- `pbkdf_2`

---

## Type Hints

The SDK includes comprehensive type hints for all methods:

```python
from typing import Optional
import stytch

def authenticate_user(token: str) -> stytch.User:
    client = stytch.Client(
        project_id=os.getenv("STYTCH_PROJECT_ID"),
        secret=os.getenv("STYTCH_SECRET"),
    )
    
    response = client.magic_links.authenticate(token=token)
    return response.user

def get_user_email(user: stytch.User) -> Optional[str]:
    if user.emails:
        return user.emails[0].email
    return None
```

---

## Resources

- **Documentation:** https://stytch.com/docs
- **API Reference:** https://stytch.com/docs/api
- **GitHub:** https://github.com/stytchauth/stytch-python
- **PyPI Package:** https://pypi.org/project/stytch/
- **Dashboard:** https://stytch.com/dashboard
- **Support:** support@stytch.com
