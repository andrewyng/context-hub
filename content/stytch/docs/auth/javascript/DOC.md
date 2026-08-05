---
name: auth
description: "Stytch Node.js SDK authentication guide for passwordless and OTP-based authentication"
metadata:
  languages: "javascript"
  versions: "14.0.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "stytch,auth,authentication,passwordless,otp"
---

# Stytch Node.js SDK - Authentication Guide

## Golden Rule

**ALWAYS use the official `stytch` package from npm.**

```bash
npm install stytch
```

**Current version: 14.0.0**

**DO NOT use:**
- Deprecated `@stytch/stytch-js` (deprecated in favor of `@stytch/vanilla-js` for frontend)
- Any unofficial or outdated Stytch packages
- Frontend packages (`@stytch/vanilla-js`, `@stytch/react`, `@stytch/nextjs`) when building backend services

The `stytch` package is the official backend SDK for Node.js applications. It supports TypeScript and all current LTS versions of Node.js (18+).

---

## Installation

### Install the SDK

```bash
npm install stytch
```

or

```bash
yarn add stytch
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

```javascript
const stytch = require('stytch');

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
});
```

### ES6 Module Import

```javascript
import * as stytch from 'stytch';

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
});
```

### B2B Client (for organizations)

```javascript
const stytch = require('stytch');

const b2bClient = new stytch.B2BClient({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
});
```

### Client with Environment Override

```javascript
const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
  environment: 'test', // or 'live' (default)
});
```

### Full Configuration Options

```javascript
const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
  environment: 'live',
  timeout: 30000, // Request timeout in milliseconds
});
```

---

## Core API Surfaces

### 1. Magic Links

Magic links provide passwordless authentication via email.

#### Send Magic Link (Login or Create)

```javascript
// Minimal example
const response = await client.magicLinks.email.loginOrCreate({
  email: 'user@example.com',
});

console.log(response.user_id);
console.log(response.email_id);
```

#### Send Magic Link with Custom URLs

```javascript
const response = await client.magicLinks.email.loginOrCreate({
  email: 'user@example.com',
  login_magic_link_url: 'https://example.com/authenticate?token={{token}}',
  signup_magic_link_url: 'https://example.com/authenticate?token={{token}}',
  login_expiration_minutes: 15,
  signup_expiration_minutes: 60,
});
```

#### Advanced Magic Link with Options

```javascript
const response = await client.magicLinks.email.loginOrCreate({
  email: 'user@example.com',
  login_magic_link_url: 'https://example.com/authenticate',
  signup_magic_link_url: 'https://example.com/authenticate',
  login_expiration_minutes: 15,
  signup_expiration_minutes: 60,
  login_template_id: 'custom-login-template',
  signup_template_id: 'custom-signup-template',
  attributes: {
    ip_address: '192.168.1.1',
  },
  code_challenge: 'challenge_string', // For PKCE flow
  user_id: 'user-123', // Associate with existing user
  session_duration_minutes: 60,
});
```

#### Authenticate Magic Link

```javascript
// Minimal example
const response = await client.magicLinks.authenticate({
  token: 'DOYoip3rvIMMW5lgItikFK-Ak1CfMsgjuiCyI7uuU94=',
});

console.log(response.user);
console.log(response.session_token);
console.log(response.session_jwt);
```

#### Authenticate with Session Options

```javascript
const response = await client.magicLinks.authenticate({
  token: 'DOYoip3rvIMMW5lgItikFK-Ak1CfMsgjuiCyI7uuU94=',
  session_duration_minutes: 60,
  session_custom_claims: {
    custom_claim: 'value',
  },
  attributes: {
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0...',
  },
});
```

#### Send Magic Link Only (No Auto-Create)

```javascript
const response = await client.magicLinks.email.send({
  email: 'user@example.com',
  login_magic_link_url: 'https://example.com/authenticate',
  login_expiration_minutes: 15,
});
```

#### Create Embeddable Magic Link

```javascript
const response = await client.magicLinks.email.createEmbeddable({
  user_id: 'user-live-123',
  embeddable_magic_link_url: 'https://example.com/authenticate',
  expiration_minutes: 10,
});

console.log(response.token); // Use in your own emails
```

---

### 2. One-Time Passcodes (OTP)

#### SMS OTP

**Send OTP via SMS:**

```javascript
// Minimal example
const response = await client.otps.sms.send({
  phone_number: '+15555555555',
});

console.log(response.phone_id);
```

**Send OTP with Options:**

```javascript
const response = await client.otps.sms.send({
  phone_number: '+15555555555',
  expiration_minutes: 10,
  attributes: {
    ip_address: '192.168.1.1',
  },
  user_id: 'user-123', // Associate with existing user
});
```

**Authenticate SMS OTP:**

```javascript
// Minimal example
const response = await client.otps.authenticate({
  method_id: 'phone-id-123',
  code: '123456',
});
```

**Authenticate with Session:**

```javascript
const response = await client.otps.authenticate({
  method_id: 'phone-id-123',
  code: '123456',
  session_duration_minutes: 60,
  attributes: {
    ip_address: '192.168.1.1',
  },
});

console.log(response.user);
console.log(response.session_token);
```

#### Email OTP

**Send OTP via Email:**

```javascript
// Minimal example
const response = await client.otps.email.send({
  email: 'user@example.com',
});
```

**Send with Options:**

```javascript
const response = await client.otps.email.send({
  email: 'user@example.com',
  expiration_minutes: 10,
  login_template_id: 'custom-template',
  user_id: 'user-123',
});
```

**Authenticate Email OTP:**

```javascript
const response = await client.otps.authenticate({
  method_id: 'email-id-123',
  code: '123456',
  session_duration_minutes: 60,
});
```

#### WhatsApp OTP

**Send OTP via WhatsApp:**

```javascript
const response = await client.otps.whatsapp.send({
  phone_number: '+15555555555',
});
```

**Authenticate WhatsApp OTP:**

```javascript
const response = await client.otps.authenticate({
  method_id: 'phone-id-123',
  code: '123456',
});
```

#### Login or Create User with SMS

```javascript
const response = await client.otps.sms.loginOrCreate({
  phone_number: '+15555555555',
  expiration_minutes: 10,
});
```

#### Login or Create User with Email

```javascript
const response = await client.otps.email.loginOrCreate({
  email: 'user@example.com',
  expiration_minutes: 10,
});
```

---

### 3. OAuth

OAuth enables authentication via third-party providers.

#### Start OAuth Flow

```javascript
// Get OAuth authorization URL
const response = await client.oauth.start({
  provider: 'google',
  signup_redirect_url: 'https://example.com/authenticate',
  login_redirect_url: 'https://example.com/authenticate',
});

console.log(response.oauth_url); // Redirect user here
```

#### Start OAuth with Options

```javascript
const response = await client.oauth.start({
  provider: 'google',
  signup_redirect_url: 'https://example.com/authenticate',
  login_redirect_url: 'https://example.com/authenticate',
  custom_scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  provider_params: {
    access_type: 'offline',
  },
  code_challenge: 'challenge_string', // For PKCE
});
```

#### Authenticate OAuth

```javascript
// Minimal example
const response = await client.oauth.authenticate({
  token: 'oauth-token-from-callback',
});

console.log(response.user);
console.log(response.session_token);
```

#### Authenticate with Session Options

```javascript
const response = await client.oauth.authenticate({
  token: 'oauth-token-from-callback',
  session_duration_minutes: 60,
  session_custom_claims: {
    custom_claim: 'value',
  },
});
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

```javascript
// Minimal example
const response = await client.sessions.authenticate({
  session_token: 'session-token-here',
});

console.log(response.user);
console.log(response.session); // Contains session data
```

#### Authenticate with JWT

```javascript
const response = await client.sessions.authenticateJwt({
  session_jwt: 'jwt-token-here',
});
```

#### Authenticate Session with Refresh

```javascript
const response = await client.sessions.authenticate({
  session_token: 'session-token-here',
  session_duration_minutes: 60, // Extend session
});

// Store new token
const newSessionToken = response.session_token;
```

#### Get Session

```javascript
const response = await client.sessions.get({
  user_id: 'user-123',
});

console.log(response.sessions); // All active sessions
```

#### Revoke Session

```javascript
await client.sessions.revoke({
  session_token: 'session-token-to-revoke',
});
```

#### Revoke Session by ID

```javascript
await client.sessions.revoke({
  session_id: 'session-id-123',
});
```

#### Migrate Session

```javascript
const response = await client.sessions.migrate({
  session_token: 'old-session-token',
  session_duration_minutes: 60,
});

console.log(response.session_token); // New token
```

---

### 5. Users

Manage user accounts and data.

#### Get User

```javascript
const response = await client.users.get({
  user_id: 'user-123',
});

console.log(response.user);
console.log(response.user.emails);
console.log(response.user.phone_numbers);
```

#### Create User

```javascript
const response = await client.users.create({
  email: 'user@example.com',
  name: {
    first_name: 'John',
    last_name: 'Doe',
  },
});
```

#### Create User with Multiple Methods

```javascript
const response = await client.users.create({
  email: 'user@example.com',
  phone_number: '+15555555555',
  name: {
    first_name: 'John',
    last_name: 'Doe',
  },
  attributes: {
    custom_attribute: 'value',
  },
});
```

#### Update User

```javascript
const response = await client.users.update({
  user_id: 'user-123',
  name: {
    first_name: 'Jane',
    last_name: 'Smith',
  },
  attributes: {
    custom_field: 'new_value',
  },
});
```

#### Delete User

```javascript
await client.users.delete({
  user_id: 'user-123',
});
```

#### Search Users

```javascript
// Basic search
const response = await client.users.search({
  query: {
    operator: 'AND',
    operands: [
      {
        filter_name: 'status',
        filter_value: ['active'],
      },
    ],
  },
});

console.log(response.results);
```

#### Advanced User Search

```javascript
const response = await client.users.search({
  query: {
    operator: 'AND',
    operands: [
      {
        filter_name: 'email_verified',
        filter_value: [true],
      },
      {
        filter_name: 'created_at',
        filter_value: {
          greater_than: '2024-01-01T00:00:00Z',
        },
      },
    ],
  },
  limit: 100,
  cursor: 'cursor-from-previous-request',
});
```

#### Delete Email

```javascript
await client.users.deleteEmail({
  email_id: 'email-id-123',
});
```

#### Delete Phone Number

```javascript
await client.users.deletePhoneNumber({
  phone_id: 'phone-id-123',
});
```

---

### 6. Passwords

Traditional password authentication.

#### Create Password

```javascript
const response = await client.passwords.create({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  session_duration_minutes: 60,
});

console.log(response.user);
console.log(response.session_token);
```

#### Authenticate Password

```javascript
// Minimal example
const response = await client.passwords.authenticate({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});
```

#### Authenticate with Session

```javascript
const response = await client.passwords.authenticate({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  session_duration_minutes: 60,
  session_custom_claims: {
    custom_claim: 'value',
  },
});

console.log(response.session_token);
```

#### Strength Check

```javascript
const response = await client.passwords.strengthCheck({
  email: 'user@example.com',
  password: 'password-to-check',
});

console.log(response.valid_password);
console.log(response.score);
console.log(response.breached_password);
console.log(response.strength_policy);
console.log(response.breach_detection_on_create);
```

#### Initiate Password Reset

```javascript
const response = await client.passwords.email.resetStart({
  email: 'user@example.com',
  reset_password_redirect_url: 'https://example.com/reset',
  reset_password_expiration_minutes: 30,
});
```

#### Reset Password by Email

```javascript
const response = await client.passwords.email.reset({
  token: 'reset-token-from-email',
  password: 'NewSecurePassword123!',
  session_duration_minutes: 60,
});

console.log(response.user);
console.log(response.session_token);
```

#### Reset Password by Session

```javascript
const response = await client.passwords.session.reset({
  session_token: 'active-session-token',
  password: 'NewSecurePassword123!',
});
```

#### Migrate Password (from existing system)

```javascript
const response = await client.passwords.migrate({
  email: 'user@example.com',
  hash: '$2a$10$...', // bcrypt hash
  hash_type: 'bcrypt',
  name: {
    first_name: 'John',
    last_name: 'Doe',
  },
});
```

---

### 7. WebAuthn

Passwordless authentication using biometrics or security keys.

#### Register WebAuthn Start

```javascript
const response = await client.webauthn.registerStart({
  user_id: 'user-123',
  domain: 'example.com',
  authenticator_type: 'platform', // or 'cross-platform'
});

console.log(response.public_key_credential_creation_options);
```

#### Register WebAuthn Finish

```javascript
const response = await client.webauthn.register({
  user_id: 'user-123',
  public_key_credential: 'credential-from-client',
  session_duration_minutes: 60,
});

console.log(response.webauthn_registration_id);
console.log(response.session_token);
```

#### Authenticate WebAuthn Start

```javascript
const response = await client.webauthn.authenticateStart({
  domain: 'example.com',
  user_id: 'user-123', // Optional
});

console.log(response.public_key_credential_request_options);
```

#### Authenticate WebAuthn Finish

```javascript
const response = await client.webauthn.authenticate({
  public_key_credential: 'credential-from-client',
  session_duration_minutes: 60,
});

console.log(response.user);
console.log(response.session_token);
```

#### Update WebAuthn

```javascript
const response = await client.webauthn.update({
  webauthn_registration_id: 'webauthn-reg-id-123',
  name: 'My Fingerprint',
});
```

---

### 8. TOTP (Time-based One-Time Passwords)

#### Create TOTP

```javascript
const response = await client.totps.create({
  user_id: 'user-123',
  expiration_minutes: 10,
});

console.log(response.secret);
console.log(response.qr_code); // URL for QR code image
console.log(response.recovery_codes);
```

#### Authenticate TOTP

```javascript
const response = await client.totps.authenticate({
  user_id: 'user-123',
  totp_code: '123456',
  session_duration_minutes: 60,
});

console.log(response.session_token);
```

#### Get TOTPs

```javascript
const response = await client.totps.get({
  user_id: 'user-123',
});

console.log(response.totps);
```

#### Recover TOTP

```javascript
const response = await client.totps.recoveryCodes({
  user_id: 'user-123',
  recovery_code: 'recovery-code-string',
  session_duration_minutes: 60,
});

console.log(response.session_token);
```

---

### 9. Crypto Wallets (Web3)

#### Authenticate Wallet Start

```javascript
const response = await client.cryptoWallets.authenticateStart({
  crypto_wallet_address: '0x1234...',
  crypto_wallet_type: 'ethereum',
});

console.log(response.challenge);
```

#### Authenticate Wallet Finish

```javascript
const response = await client.cryptoWallets.authenticate({
  crypto_wallet_address: '0x1234...',
  crypto_wallet_type: 'ethereum',
  signature: 'signed-challenge',
  session_duration_minutes: 60,
});

console.log(response.user);
console.log(response.session_token);
```

---

### 10. M2M (Machine-to-Machine)

#### Authenticate M2M Token

```javascript
const response = await client.m2m.authenticateToken({
  access_token: 'm2m-access-token',
});

console.log(response.member_id);
console.log(response.scopes);
```

#### Get M2M Client

```javascript
const response = await client.m2m.clients.get({
  client_id: 'client-id-123',
});

console.log(response.m2m_client);
```

---

## B2B API Surfaces

### 1. Organizations

#### Create Organization

```javascript
const response = await b2bClient.organizations.create({
  organization_name: 'Acme Corp',
  organization_slug: 'acme',
  email_allowed_domains: ['acme.com'],
});

console.log(response.organization);
```

#### Get Organization

```javascript
const response = await b2bClient.organizations.get({
  organization_id: 'org-123',
});

console.log(response.organization);
```

#### Update Organization

```javascript
const response = await b2bClient.organizations.update({
  organization_id: 'org-123',
  organization_name: 'Acme Corporation',
});
```

#### Delete Organization

```javascript
await b2bClient.organizations.delete({
  organization_id: 'org-123',
});
```

---

### 2. Members

#### Create Member

```javascript
const response = await b2bClient.organizations.members.create({
  organization_id: 'org-123',
  email_address: 'member@acme.com',
  name: 'John Doe',
  is_breakglass: false,
});

console.log(response.member);
```

#### Get Member

```javascript
const response = await b2bClient.organizations.members.get({
  organization_id: 'org-123',
  member_id: 'member-123',
});

console.log(response.member);
```

#### Update Member

```javascript
const response = await b2bClient.organizations.members.update({
  organization_id: 'org-123',
  member_id: 'member-123',
  name: 'Jane Doe',
});
```

#### Delete Member

```javascript
await b2bClient.organizations.members.delete({
  organization_id: 'org-123',
  member_id: 'member-123',
});
```

---

### 3. B2B Magic Links

#### Send B2B Magic Link

```javascript
const response = await b2bClient.magicLinks.email.loginOrSignup({
  organization_id: 'org-123',
  email_address: 'member@acme.com',
  login_redirect_url: 'https://acme.com/authenticate',
  signup_redirect_url: 'https://acme.com/authenticate',
});
```

#### Authenticate B2B Magic Link

```javascript
const response = await b2bClient.magicLinks.authenticate({
  magic_links_token: 'token-from-email',
  session_duration_minutes: 60,
});

console.log(response.member);
console.log(response.organization);
console.log(response.session_token);
```

---

### 4. B2B Sessions

#### Authenticate B2B Session

```javascript
const response = await b2bClient.sessions.authenticate({
  session_token: 'session-token-here',
});

console.log(response.member);
console.log(response.organization);
console.log(response.session);
```

#### Authenticate B2B JWT

```javascript
const response = await b2bClient.sessions.authenticateJwt({
  session_jwt: 'jwt-token-here',
});
```

#### Get B2B Session

```javascript
const response = await b2bClient.sessions.get({
  organization_id: 'org-123',
  member_id: 'member-123',
});

console.log(response.sessions);
```

#### Revoke B2B Session

```javascript
await b2bClient.sessions.revoke({
  session_token: 'session-token-to-revoke',
});
```

---

### 5. B2B OAuth

#### Start B2B OAuth

```javascript
const response = await b2bClient.oauth.start({
  organization_id: 'org-123',
  provider: 'google',
  login_redirect_url: 'https://acme.com/authenticate',
  signup_redirect_url: 'https://acme.com/authenticate',
});

console.log(response.oauth_url);
```

#### Authenticate B2B OAuth

```javascript
const response = await b2bClient.oauth.authenticate({
  oauth_token: 'token-from-callback',
  session_duration_minutes: 60,
});

console.log(response.member);
console.log(response.organization);
console.log(response.session_token);
```

---

### 6. B2B SMS OTP

#### Send B2B SMS OTP

```javascript
const response = await b2bClient.otps.sms.send({
  organization_id: 'org-123',
  member_id: 'member-123',
  phone_number: '+15555555555',
});
```

#### Authenticate B2B SMS OTP

```javascript
const response = await b2bClient.otps.sms.authenticate({
  organization_id: 'org-123',
  member_id: 'member-123',
  code: '123456',
  session_duration_minutes: 60,
});

console.log(response.member);
console.log(response.session_token);
```

---

### 7. SSO (Single Sign-On)

#### Start SSO

```javascript
const response = await b2bClient.sso.start({
  connection_id: 'sso-connection-123',
  login_redirect_url: 'https://acme.com/authenticate',
  signup_redirect_url: 'https://acme.com/authenticate',
});

console.log(response.sso_url);
```

#### Authenticate SSO

```javascript
const response = await b2bClient.sso.authenticate({
  sso_token: 'token-from-sso-provider',
  session_duration_minutes: 60,
});

console.log(response.member);
console.log(response.organization);
```

#### Get SSO Connections

```javascript
const response = await b2bClient.sso.getConnections({
  organization_id: 'org-123',
});

console.log(response.saml_connections);
console.log(response.oidc_connections);
```

#### Create SAML Connection

```javascript
const response = await b2bClient.sso.saml.createConnection({
  organization_id: 'org-123',
  display_name: 'Acme SAML',
});

console.log(response.connection);
```

#### Update SAML Connection

```javascript
const response = await b2bClient.sso.saml.updateConnection({
  organization_id: 'org-123',
  connection_id: 'saml-connection-123',
  idp_entity_id: 'https://idp.acme.com/entity',
  idp_sso_url: 'https://idp.acme.com/sso',
  attribute_mapping: {
    email: 'email',
    first_name: 'firstName',
    last_name: 'lastName',
  },
  x509_certificate: 'certificate-string',
});
```

#### Create OIDC Connection

```javascript
const response = await b2bClient.sso.oidc.createConnection({
  organization_id: 'org-123',
  display_name: 'Acme OIDC',
});

console.log(response.connection);
```

#### Update OIDC Connection

```javascript
const response = await b2bClient.sso.oidc.updateConnection({
  organization_id: 'org-123',
  connection_id: 'oidc-connection-123',
  issuer: 'https://idp.acme.com',
  client_id: 'client-id',
  client_secret: 'client-secret',
  authorization_url: 'https://idp.acme.com/authorize',
  token_url: 'https://idp.acme.com/token',
  userinfo_url: 'https://idp.acme.com/userinfo',
});
```

---

### 8. Discovery

Discovery allows users to find and join organizations.

#### Create Organization via Discovery

```javascript
const response = await b2bClient.discovery.organizations.create({
  intermediate_session_token: 'token-from-discovery',
  organization_name: 'New Org',
  organization_slug: 'new-org',
  session_duration_minutes: 60,
});

console.log(response.organization);
console.log(response.session_token);
```

#### List Discovered Organizations

```javascript
const response = await b2bClient.discovery.organizations.list({
  intermediate_session_token: 'token-from-discovery',
});

console.log(response.discovered_organizations);
```

---

### 9. RBAC (Role-Based Access Control)

#### Check Member Permissions

```javascript
const response = await b2bClient.rbac.policy({
  organization_id: 'org-123',
  member_id: 'member-123',
  resource_id: 'document-123',
  action: 'read',
});

console.log(response.authorized);
```

---

## Error Handling

### Basic Error Handling

```javascript
try {
  const response = await client.magicLinks.email.loginOrCreate({
    email: 'user@example.com',
  });
  console.log(response.user_id);
} catch (error) {
  console.error('Error:', error.error_type);
  console.error('Message:', error.error_message);
  console.error('URL:', error.error_url);
}
```

### Detailed Error Handling

```javascript
const response = await client.magicLinks.authenticate({
  token: token,
}).catch((error) => {
  if (error.error_type === 'unable_to_auth_magic_link') {
    // Token invalid, expired, or already used
    return { error: 'Invalid or expired magic link' };
  } else if (error.error_type === 'invalid_token') {
    // Malformed token
    return { error: 'Invalid token format' };
  } else {
    // Other errors
    return { error: 'Authentication failed' };
  }
});
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

## Express.js Integration Example

### Complete Auth Flow

```javascript
const express = require('express');
const stytch = require('stytch');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
}));

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const response = await client.magicLinks.email.loginOrCreate({
      email,
      login_magic_link_url: `${process.env.BASE_URL}/authenticate`,
      signup_magic_link_url: `${process.env.BASE_URL}/authenticate`,
    });
    res.json({ success: true, user_id: response.user_id });
  } catch (error) {
    res.status(400).json({ error: error.error_message });
  }
});

// Authentication callback
app.get('/authenticate', async (req, res) => {
  try {
    const { token } = req.query;
    const response = await client.magicLinks.authenticate({
      token,
      session_duration_minutes: 60,
    });

    req.session.stytchSessionToken = response.session_token;
    req.session.userId = response.user.user_id;

    res.redirect('/dashboard');
  } catch (error) {
    res.status(400).send('Authentication failed');
  }
});

// Protected route middleware
async function authenticateSession(req, res, next) {
  const sessionToken = req.session.stytchSessionToken;

  if (!sessionToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await client.sessions.authenticate({
      session_token: sessionToken,
    });

    req.session.stytchSessionToken = response.session_token;
    req.user = response.user;
    next();
  } catch (error) {
    req.session.destroy();
    res.status(401).json({ error: 'Session expired' });
  }
}

// Protected route
app.get('/dashboard', authenticateSession, (req, res) => {
  res.json({ user: req.user });
});

// Logout
app.post('/logout', async (req, res) => {
  try {
    await client.sessions.revoke({
      session_token: req.session.stytchSessionToken,
    });
    req.session.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.error_message });
  }
});

app.listen(3000);
```

---

## TypeScript Support

The SDK includes full TypeScript definitions.

### TypeScript Example

```typescript
import * as stytch from 'stytch';

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID!,
  secret: process.env.STYTCH_SECRET!,
});

async function loginUser(email: string): Promise<string> {
  const response = await client.magicLinks.email.loginOrCreate({
    email,
  });
  return response.user_id;
}

async function authenticateToken(token: string): Promise<stytch.User> {
  const response = await client.magicLinks.authenticate({
    token,
  });
  return response.user;
}
```

### Request/Response Types

Types follow the pattern: `$Vertical$Product$Method(Request|Response)`

```typescript
import type {
  MagicLinksEmailLoginOrCreateRequest,
  MagicLinksEmailLoginOrCreateResponse,
  MagicLinksAuthenticateRequest,
  MagicLinksAuthenticateResponse,
} from 'stytch';

const request: MagicLinksEmailLoginOrCreateRequest = {
  email: 'user@example.com',
  login_magic_link_url: 'https://example.com/authenticate',
};

const response: MagicLinksEmailLoginOrCreateResponse =
  await client.magicLinks.email.loginOrCreate(request);
```

---

## Testing

### Using Test Environment

```javascript
const client = new stytch.Client({
  project_id: process.env.STYTCH_TEST_PROJECT_ID,
  secret: process.env.STYTCH_TEST_SECRET,
  environment: 'test',
});
```

### Test Mode Magic Links

In test mode, use these special test emails:
- `sandbox@stytch.com` - Always succeeds

### Mock Testing

```javascript
const mockClient = {
  magicLinks: {
    email: {
      loginOrCreate: jest.fn().mockResolvedValue({
        user_id: 'user-test-123',
        email_id: 'email-test-123',
      }),
    },
    authenticate: jest.fn().mockResolvedValue({
      user: {
        user_id: 'user-test-123',
        emails: [{ email: 'test@example.com' }],
      },
      session_token: 'test-session-token',
    }),
  },
};
```

---

## Webhooks

### Verify Webhook Signature

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

// Express webhook endpoint
app.post('/webhooks/stytch', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['stytch-signature'];
  const isValid = verifyWebhookSignature(
    req.body,
    signature,
    process.env.STYTCH_WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body);
  console.log('Webhook event:', event.event_type);

  res.json({ received: true });
});
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

## Session Management Patterns

### Session Token in Cookie

```javascript
app.get('/authenticate', async (req, res) => {
  const { token } = req.query;
  const response = await client.magicLinks.authenticate({
    token,
    session_duration_minutes: 60,
  });

  res.cookie('stytch_session', response.session_token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.redirect('/dashboard');
});

// Middleware
async function authenticate(req, res, next) {
  const sessionToken = req.cookies.stytch_session;
  if (!sessionToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await client.sessions.authenticate({
      session_token: sessionToken,
    });
    req.user = response.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid session' });
  }
}
```

### Session Token in Authorization Header

```javascript
// Middleware
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const sessionToken = authHeader.replace('Bearer ', '');

  try {
    const response = await client.sessions.authenticate({
      session_token: sessionToken,
    });
    req.user = response.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## Advanced Use Cases

### Multi-Factor Authentication Flow

```javascript
// Step 1: Primary authentication (password)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await client.passwords.authenticate({
      email,
      password,
      session_duration_minutes: 5, // Short session for MFA
    });

    // Return intermediate session
    res.json({
      requires_mfa: true,
      intermediate_session_token: response.session_token,
      user_id: response.user_id,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Step 2: MFA with TOTP
app.post('/verify-totp', async (req, res) => {
  const { user_id, totp_code } = req.body;

  try {
    const response = await client.totps.authenticate({
      user_id,
      totp_code,
      session_duration_minutes: 60, // Full session after MFA
    });

    res.json({
      session_token: response.session_token,
      user: response.user,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid TOTP code' });
  }
});
```

### Account Linking

```javascript
// Link OAuth account to existing user
app.post('/link-oauth', authenticateSession, async (req, res) => {
  const { oauth_token } = req.body;

  try {
    const response = await client.oauth.authenticate({
      token: oauth_token,
      session_token: req.session.stytchSessionToken,
    });

    res.json({ success: true, user: response.user });
  } catch (error) {
    res.status(400).json({ error: error.error_message });
  }
});
```

### Custom Email Templates

```javascript
const response = await client.magicLinks.email.loginOrCreate({
  email: 'user@example.com',
  login_magic_link_url: 'https://example.com/authenticate',
  login_template_id: 'custom-login-template-id',
  signup_template_id: 'custom-signup-template-id',
});
```

### IP and User Agent Matching

```javascript
const response = await client.magicLinks.authenticate({
  token,
  attributes: {
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  },
});
```

---

## Rate Limiting

Stytch implements rate limiting on authentication endpoints. Handle rate limit errors:

```javascript
try {
  await client.otps.sms.send({ phone_number });
} catch (error) {
  if (error.error_type === 'rate_limit_exceeded') {
    const retryAfter = error.retry_after; // seconds
    res.status(429).json({
      error: 'Too many requests',
      retry_after: retryAfter,
    });
  }
}
```

---

## Migration from Other Auth Systems

### Import Users with Passwords

```javascript
// Migrate user from bcrypt-based system
await client.passwords.migrate({
  email: 'user@example.com',
  hash: '$2a$10$existing_bcrypt_hash',
  hash_type: 'bcrypt',
  name: {
    first_name: 'John',
    last_name: 'Doe',
  },
});
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

## Async/Await vs Promises

All SDK methods support both patterns:

### Async/Await

```javascript
async function authenticateUser(token) {
  const response = await client.magicLinks.authenticate({ token });
  return response.user;
}
```

### Promises

```javascript
function authenticateUser(token) {
  return client.magicLinks.authenticate({ token })
    .then(response => response.user)
    .catch(error => {
      console.error(error);
      throw error;
    });
}
```

---

## Resources

- **Documentation:** https://stytch.com/docs
- **API Reference:** https://stytch.com/docs/api
- **GitHub:** https://github.com/stytchauth/stytch-node
- **npm Package:** https://www.npmjs.com/package/stytch
- **Dashboard:** https://stytch.com/dashboard
- **Support:** support@stytch.com
