---
name: identity
description: "Scalekit Node.js SDK for enterprise SSO (SAML/OIDC), SCIM directory sync, and agent OAuth 2.1 in B2B applications"
metadata:
  languages: "javascript"
  versions: "2.5.0"
  updated-on: "2026-03-26"
  source: community
  tags: "scalekit,sso,saml,oidc,authentication,enterprise,b2b,mcp,agents"
---

# Scalekit Node.js SDK Coding Guidelines

You are a Scalekit API expert. Help me with writing code using the Scalekit SDK for Node.js/TypeScript applications, or directly via the REST API.

You can find the official SDK documentation here:
https://docs.scalekit.com

## Golden Rule: Use the Correct Scalekit SDK

Always use the official Scalekit Node.js SDK for server-side authentication and user management. This is the standard library for all Scalekit API interactions.

- **Library Name:** Scalekit Node.js SDK
- **NPM Package:** `@scalekit-sdk/node`
- **Current Version:** 2.5.0
- **Minimum Node.js Version:** 18.14.1+

**Installation:**

```bash
npm install @scalekit-sdk/node
```

**Correct Usage:**

```javascript
import { ScalekitClient } from '@scalekit-sdk/node';
```

**Incorrect:**
- Using `scalekit` as the npm package name (wrong — that is the Python package name)
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

Install the Scalekit Node.js SDK:

```bash
npm install @scalekit-sdk/node
```

For TypeScript projects, types are bundled in the package.

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

Tokens expire after ~24 hours. The SDK handles token acquisition and refresh automatically — you never need to call this manually when using the SDK.

## Initialization

### SDK Client Initialization

```javascript
import { ScalekitClient } from '@scalekit-sdk/node';

const scalekitClient = new ScalekitClient(
  process.env.SCALEKIT_ENV_URL,
  process.env.SCALEKIT_CLIENT_ID,
  process.env.SCALEKIT_CLIENT_SECRET
);
```

The client handles token refresh automatically. Create one instance and reuse it across your application.

## SSO Authentication Flow

Scalekit uses OAuth 2.0 Authorization Code flow for SSO. The flow has two steps:
1. Generate an authorization URL and redirect the user
2. Handle the callback and exchange the code for tokens

### Step 1: Generate Authorization URL

Use one of four targeting options — by organization ID, email domain, specific connection ID, or social provider:

```javascript
import { ScalekitClient } from '@scalekit-sdk/node';
import crypto from 'crypto';

const REDIRECT_URI = 'https://yourapp.com/auth/callback';

// Option A: by organization ID (most common for B2B apps)
const authUrl = scalekitClient.getAuthorizationUrl(REDIRECT_URI, {
  organizationId: 'org_123456',
  state: crypto.randomUUID(),
});

// Option B: by email domain (auto-routes to the org's IdP)
const authUrl = scalekitClient.getAuthorizationUrl(REDIRECT_URI, {
  domainHint: 'acmecorp.com',
  state: crypto.randomUUID(),
});

// Option C: by specific SSO connection ID (most precise)
const authUrl = scalekitClient.getAuthorizationUrl(REDIRECT_URI, {
  connectionId: 'conn_789',
  state: crypto.randomUUID(),
});

// Option D: social login provider
const authUrl = scalekitClient.getAuthorizationUrl(REDIRECT_URI, {
  provider: 'google',  // 'github', 'microsoft', 'gitlab', 'linkedin'
  state: crypto.randomUUID(),
});

// Redirect the user
res.redirect(authUrl);
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

```javascript
app.get('/auth/callback', async (req, res) => {
  const { code, state, error, idp_initiated_login } = req.query;

  if (error) return res.status(400).send(`SSO error: ${error}`);

  // Validate state to prevent CSRF
  if (state !== req.session.oauthState) {
    return res.status(400).send('Invalid state');
  }

  const result = await scalekitClient.authenticateWithCode(
    code,
    'https://yourapp.com/auth/callback'
  );

  // result.user contains: id, email, name, givenName, familyName,
  //                        username, picture, groups, organizationId
  req.session.user = result.user;
  req.session.accessToken = result.accessToken;

  res.redirect('/dashboard');
});
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

When users click "Login" from their IdP's portal (not your app), Scalekit sends an `idp_initiated_login` token. Handle it by extracting claims and restarting SP-initiated flow:

```javascript
app.get('/auth/callback', async (req, res) => {
  const { idp_initiated_login, code, state } = req.query;

  if (idp_initiated_login) {
    const claims = await scalekitClient.getIdpInitiatedLoginClaims(idp_initiated_login);

    const authUrl = scalekitClient.getAuthorizationUrl(
      'https://yourapp.com/auth/callback',
      {
        connectionId: claims.connection_id,
        organizationId: claims.organization_id,
        loginHint: claims.login_hint,
        ...(claims.relay_state && { state: claims.relay_state }),
      }
    );
    return res.redirect(authUrl);
  }

  // Normal SP-initiated flow continues here...
  const result = await scalekitClient.authenticateWithCode(code, REDIRECT_URI);
  req.session.user = result.user;
  res.redirect('/dashboard');
});
```

### Token Validation and Refresh

```javascript
// Validate an access token (checks signature + expiry against Scalekit public keys)
const isValid = await scalekitClient.validateAccessToken(accessToken);

// Decode and validate, get payload
const payload = await scalekitClient.validateToken(accessToken);
console.log(payload.sub, payload.org_id, payload.email);

// Check required scopes
const hasScopes = scalekitClient.verifyScopes(accessToken, ['read:user', 'write:org']);

// Refresh an expired token
const refreshed = await scalekitClient.refreshAccessToken(refreshToken);
// Store refreshed.accessToken and refreshed.refreshToken
```

### Logout

```javascript
const logoutUrl = scalekitClient.getLogoutUrl({
  postLogoutRedirectUri: 'https://yourapp.com/logged-out',
  idTokenHint: req.session.idToken,
  state: 'some-state',
});

req.session.destroy();
res.redirect(logoutUrl);
```

## Organization Management

Organizations represent your B2B customers (tenants). Each can have SSO connections, SCIM directories, users, and independent settings.

### Creating an Organization

```javascript
const org = await scalekitClient.organization.createOrganization(
  'Acme Corporation',
  { externalId: 'customer_12345' }  // optional: your internal ID for this tenant
);
console.log('Organization ID:', org.organization.id);
```

**REST equivalent:**
```bash
curl -X POST "${SCALEKIT_ENV_URL}/api/v1/organizations" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Acme Corporation", "external_id": "customer_12345"}'
```

### Listing Organizations

```javascript
const response = await scalekitClient.organization.listOrganization({
  pageSize: 20,
  // pageToken: '...'  // for next page
});
const orgs = response.organizations;
const nextPageToken = response.nextPageToken;
```

**REST equivalent:**
```bash
curl -X GET "${SCALEKIT_ENV_URL}/api/v1/organizations?page_size=20" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Getting an Organization

```javascript
// By Scalekit org ID
const org = await scalekitClient.organization.getOrganization('org_123456');

// By your external ID
const org = await scalekitClient.organization.getOrganizationByExternalId('customer_12345');
```

**REST equivalent:**
```bash
curl -X GET "${SCALEKIT_ENV_URL}/api/v1/organizations/org_123456" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Updating an Organization

```javascript
const updated = await scalekitClient.organization.updateOrganization('org_123456', {
  displayName: 'Acme Corp (Renamed)',
  externalId: 'customer_12345',
});
```

**REST equivalent:**
```bash
curl -X PATCH "${SCALEKIT_ENV_URL}/api/v1/organizations/org_123456" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Acme Corp (Renamed)"}'
```

### Deleting an Organization

```javascript
await scalekitClient.organization.deleteOrganization('org_123456');
```

**REST equivalent:**
```bash
curl -X DELETE "${SCALEKIT_ENV_URL}/api/v1/organizations/org_123456" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Admin Portal Link

Generate a short-lived link so your customer's admin can self-configure their SSO connection or SCIM directory without your involvement:

```javascript
const link = await scalekitClient.organization.generatePortalLink('org_123456');
console.log('Portal URL:', link.location);  // Send this URL to the customer admin
// Link expires after a short duration
```

**REST equivalent:**
```bash
curl -X PUT "${SCALEKIT_ENV_URL}/api/v1/organizations/org_123456/portal_links" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

## Connection Management

Connections represent the actual SSO links between an organization and their identity provider (Okta, Azure AD, Google Workspace, Ping, etc.).

### Listing Connections

```javascript
// All connections in the environment
const response = await scalekitClient.connection.listConnections({ pageSize: 20 });

// Connections for a specific organization
const response = await scalekitClient.connection.listConnections({
  organizationId: 'org_123456',
});

// Connections by email domain
const response = await scalekitClient.connection.listConnectionsByDomain('acmecorp.com');
```

**REST equivalent:**
```bash
curl -X GET "${SCALEKIT_ENV_URL}/api/v1/connections?organization_id=org_123456" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Getting a Connection

```javascript
const connection = await scalekitClient.connection.getConnection('conn_789');
console.log('Provider:', connection.provider);  // 'OKTA', 'AZURE_AD', 'GOOGLE', etc.
console.log('Status:', connection.status);       // 'ACTIVE', 'INACTIVE', 'DRAFT'
```

**REST equivalent:**
```bash
curl -X GET "${SCALEKIT_ENV_URL}/api/v1/connections/conn_789" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Enable / Disable a Connection

```javascript
await scalekitClient.connection.enableConnection('conn_789');
await scalekitClient.connection.disableConnection('conn_789');
```

**REST equivalent:**
```bash
curl -X PUT "${SCALEKIT_ENV_URL}/api/v1/connections/conn_789/enable" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

curl -X PUT "${SCALEKIT_ENV_URL}/api/v1/connections/conn_789/disable" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

## Domain Management

Domains link email address suffixes to organizations, enabling automatic SSO routing by `domainHint`.

```javascript
// Register a domain for an organization
const domain = await scalekitClient.domain.createDomain('acmecorp.com');

// List all domains
const domains = await scalekitClient.domain.listDomains({ pageSize: 20 });

// Get a specific domain
const domain = await scalekitClient.domain.getDomain('acmecorp.com');

// Delete a domain
await scalekitClient.domain.deleteDomain('acmecorp.com');
```

**REST equivalent:**
```bash
curl -X GET "${SCALEKIT_ENV_URL}/api/v1/domains" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

## Webhook Verification

Scalekit sends HMAC-signed webhooks for events like `user.created`, `connection.enabled`, `directory.synced`. Verify the signature before processing to prevent replay attacks:

```javascript
app.post('/webhooks/scalekit', express.raw({ type: 'application/json' }), (req, res) => {
  const isValid = scalekitClient.verifyWebhookPayload(
    process.env.SCALEKIT_WEBHOOK_SECRET,  // 'whsec_...' from Scalekit Dashboard
    req.headers,
    req.body.toString()
  );

  if (!isValid) return res.status(401).send('Invalid signature');

  const event = JSON.parse(req.body.toString());

  switch (event.type) {
    case 'user.created':
      console.log('New user:', event.data);
      break;
    case 'connection.enabled':
      console.log('SSO enabled for org:', event.data.organization_id);
      break;
    case 'directory.synced':
      console.log('Directory synced:', event.data);
      break;
  }

  res.status(200).json({ received: true });
});
```

## Error Handling

The SDK throws typed exceptions from a `ScalekitException` hierarchy:

```javascript
import { ScalekitServerException } from '@scalekit-sdk/node';

try {
  const org = await scalekitClient.organization.getOrganization('invalid_id');
} catch (err) {
  if (err instanceof ScalekitServerException) {
    console.log('HTTP Status:', err.httpStatus);  // e.g., 404
    console.log('Error Code:', err.errorCode);    // Scalekit-specific code
    console.log('Message:', err.message);
  }
}
```

**Exception types:**
- `ScalekitServerException` — HTTP errors (400–599); has `httpStatus`, `errorCode`, `message`
- `ScalekitValidateTokenFailureException` — token validation failures
- `WebhookVerificationError` — webhook signature verification failures

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

```javascript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof ScalekitServerException && err.httpStatus === 429 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }
      throw err;
    }
  }
}

// Usage
const org = await withRetry(() => scalekitClient.organization.getOrganization('org_123'));
```

## Complete Example: Express SSO Login

```javascript
import express from 'express';
import session from 'express-session';
import { ScalekitClient, ScalekitServerException } from '@scalekit-sdk/node';
import crypto from 'crypto';

const app = express();
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));

const scalekit = new ScalekitClient(
  process.env.SCALEKIT_ENV_URL,
  process.env.SCALEKIT_CLIENT_ID,
  process.env.SCALEKIT_CLIENT_SECRET
);

const REDIRECT_URI = 'https://yourapp.com/auth/callback';

// Step 1: Initiate SSO login (org_id passed as query param from your login page)
app.get('/auth/login', (req, res) => {
  const state = crypto.randomUUID();
  req.session.oauthState = state;

  const authUrl = scalekit.getAuthorizationUrl(REDIRECT_URI, {
    organizationId: req.query.org_id,
    state,
  });

  res.redirect(authUrl);
});

// Step 2: Handle SSO callback
app.get('/auth/callback', async (req, res) => {
  const { code, state, error, idp_initiated_login } = req.query;

  if (error) return res.status(400).send(`SSO error: ${error}`);

  // Handle IdP-initiated login
  if (idp_initiated_login) {
    const claims = await scalekit.getIdpInitiatedLoginClaims(idp_initiated_login);
    const authUrl = scalekit.getAuthorizationUrl(REDIRECT_URI, {
      connectionId: claims.connection_id,
      organizationId: claims.organization_id,
      loginHint: claims.login_hint,
    });
    return res.redirect(authUrl);
  }

  // Validate state (CSRF protection)
  if (state !== req.session.oauthState) return res.status(400).send('Invalid state');

  try {
    const result = await scalekit.authenticateWithCode(code, REDIRECT_URI);

    req.session.user = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      organizationId: result.user.organizationId,
    };
    req.session.accessToken = result.accessToken;

    res.redirect('/dashboard');
  } catch (err) {
    if (err instanceof ScalekitServerException) {
      res.status(500).send(`Auth failed: ${err.message}`);
    } else {
      throw err;
    }
  }
});

// Protected route
app.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');

  const isValid = await scalekit.validateAccessToken(req.session.accessToken);
  if (!isValid) return res.redirect('/auth/login');

  res.json({ user: req.session.user });
});

// Logout
app.get('/auth/logout', (req, res) => {
  const logoutUrl = scalekit.getLogoutUrl({
    postLogoutRedirectUri: 'https://yourapp.com',
  });
  req.session.destroy();
  res.redirect(logoutUrl);
});

app.listen(3000);
```

## Important Notes

### Security Best Practices

1. **Never expose client secrets** — keep `SCALEKIT_CLIENT_SECRET` server-side only
2. **Validate state parameter** — always check state in the OAuth callback to prevent CSRF
3. **Validate tokens** — call `validateAccessToken()` on every protected server route
4. **Use HTTPS** — all redirect URIs must use HTTPS in production
5. **Rotate secrets** — rotate client secrets regularly from the Scalekit Dashboard

### Organization vs Connection vs Domain

- An **Organization** is a tenant (your customer). One org can have multiple connections.
- A **Connection** is the actual SSO link to a specific IdP (e.g., their Okta tenant). Use `connectionId` for the most precise routing.
- A **Domain** links an email suffix to an org, enabling routing via `domainHint`.

### Redirect URIs

All redirect URIs must be pre-registered in the Scalekit Dashboard. The URI passed to `getAuthorizationUrl()` and `authenticateWithCode()` must match exactly — including protocol, path, and trailing slashes.

## Useful Links

- Documentation: https://docs.scalekit.com
- SSO Quickstart: https://docs.scalekit.com/sso/quickstart/
- API Reference: https://docs.scalekit.com/apis
- GitHub: https://github.com/scalekit-inc/scalekit-sdk-node
- Dashboard: https://app.scalekit.com
