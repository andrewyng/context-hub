---
name: identity
description: "Auth0 JavaScript/Node.js SDK for OAuth, OIDC, and identity management in server-side applications"
metadata:
  languages: "javascript"
  versions: "5.11.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "auth0,identity,oauth,oidc,authentication"
---

# Auth0 JavaScript/Node.js SDK Coding Guidelines

You are an Auth0 API expert. Help me with writing code using the Auth0 SDK for JavaScript/Node.js applications.

You can find the official SDK documentation here:
https://auth0.github.io/node-auth0/

## Golden Rule: Use the Correct Auth0 SDK

Always use the official Auth0 Node.js SDK for server-side authentication and user management operations. This is the standard library for all Auth0 Management API and Authentication API interactions.

- **Library Name:** Auth0 Node.js SDK
- **NPM Package:** `auth0`
- **Current Version:** 5.11.0
- **Minimum Node.js Version:** 20.19.0+ or 22.12.0+ or 24.0.0+

**Installation:**

```bash
npm install auth0
```

**Correct Usage:**

```javascript
import { ManagementClient, AuthenticationClient } from 'auth0';
```

**Incorrect:**
- Using `auth0-js` for server-side operations (this is for browser-based apps)
- Using unofficial or deprecated Auth0 packages

## Environment Variables

Set up your environment variables for Auth0:

```
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_MANAGEMENT_API_TOKEN=your_management_api_token
```

## Installation and Setup

Install the Auth0 SDK:

```bash
npm install auth0
```

For TypeScript projects, types are included in the package.

## Initialization

### ManagementClient Initialization

The ManagementClient is used for administrative operations like user management, role assignment, and configuration.

**Basic initialization with API token:**

```javascript
import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  token: process.env.AUTH0_MANAGEMENT_API_TOKEN,
});
```

**Initialization with client credentials:**

```javascript
import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});
```

**Advanced configuration:**

```javascript
import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  timeout: 60000, // 60 seconds
  retry: {
    enabled: true,
    maxRetries: 2,
  },
});
```

### AuthenticationClient Initialization

The AuthenticationClient handles user authentication operations like login, password reset, and token management.

**Basic initialization:**

```javascript
import { AuthenticationClient } from 'auth0';

const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
});
```

**With client secret (for confidential clients):**

```javascript
import { AuthenticationClient } from 'auth0';

const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});
```

### UserInfoClient Initialization

For retrieving user profile information using access tokens:

```javascript
import { UserInfoClient } from 'auth0';

const userInfo = new UserInfoClient({
  domain: process.env.AUTH0_DOMAIN,
});
```

## User Management

### Creating Users

```javascript
import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

async function createUser() {
  const newUser = await management.users.create({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    connection: 'Username-Password-Authentication',
    email_verified: false,
    user_metadata: {
      plan: 'premium',
      preferences: { theme: 'dark' },
    },
    app_metadata: {
      role: 'user',
    },
  });

  console.log('User created:', newUser.user_id);
  return newUser;
}
```

### Getting User by ID

```javascript
async function getUser(userId) {
  const user = await management.users.get({ id: userId });
  console.log('User:', user);
  return user;
}
```

### Getting User by Email

```javascript
async function getUserByEmail(email) {
  const users = await management.usersByEmail.get({ email });

  if (users.length > 0) {
    console.log('User found:', users[0]);
    return users[0];
  }

  return null;
}
```

### Updating User

```javascript
async function updateUser(userId, updates) {
  const updatedUser = await management.users.update(
    { id: userId },
    {
      email: 'newemail@example.com',
      user_metadata: {
        plan: 'enterprise',
      },
    }
  );

  return updatedUser;
}
```

### Deleting User

```javascript
async function deleteUser(userId) {
  await management.users.delete({ id: userId });
  console.log('User deleted');
}
```

### Listing Users

```javascript
async function listUsers() {
  const users = await management.users.getAll({
    per_page: 50,
    page: 0,
  });

  return users;
}
```

### Searching Users

```javascript
async function searchUsers(query) {
  const users = await management.users.getAll({
    q: `email:"*@example.com"`,
    search_engine: 'v3',
  });

  return users;
}
```

## Authentication Operations

### Password Grant (Direct Login)

```javascript
import { AuthenticationClient } from 'auth0';

const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

async function login(username, password) {
  const response = await auth0.oauth.passwordGrant({
    username,
    password,
    audience: 'https://api.example.com',
    scope: 'openid profile email',
  });

  console.log('Access Token:', response.access_token);
  console.log('ID Token:', response.id_token);
  return response;
}
```

### Client Credentials Grant

```javascript
async function getClientCredentialsToken() {
  const response = await auth0.oauth.clientCredentialsGrant({
    audience: 'https://api.example.com',
  });

  console.log('Access Token:', response.access_token);
  return response;
}
```

### Refresh Token

```javascript
async function refreshToken(refreshToken) {
  const response = await auth0.oauth.refreshTokenGrant({
    refresh_token: refreshToken,
  });

  console.log('New Access Token:', response.access_token);
  return response;
}
```

### Password Reset

```javascript
async function requestPasswordReset(email) {
  await auth0.database.changePassword({
    email,
    connection: 'Username-Password-Authentication',
  });

  console.log('Password reset email sent');
}
```

### User Signup

```javascript
async function signup(email, password) {
  const user = await auth0.database.signUp({
    email,
    password,
    connection: 'Username-Password-Authentication',
  });

  return user;
}
```

## Token Operations

### Getting User Info from Access Token

```javascript
import { UserInfoClient } from 'auth0';

const userInfo = new UserInfoClient({
  domain: process.env.AUTH0_DOMAIN,
});

async function getUserProfile(accessToken) {
  const profile = await userInfo.getUserInfo(accessToken);

  console.log('User Profile:', profile);
  return profile;
}
```

### Revoking Refresh Token

```javascript
async function revokeToken(token) {
  await auth0.oauth.revokeRefreshToken({
    token,
  });

  console.log('Token revoked');
}
```

## Role and Permission Management

### Assigning Roles to User

```javascript
async function assignRolesToUser(userId, roleIds) {
  await management.users.assignRoles(
    { id: userId },
    { roles: roleIds }
  );

  console.log('Roles assigned');
}
```

### Getting User Roles

```javascript
async function getUserRoles(userId) {
  const roles = await management.users.getRoles({ id: userId });

  console.log('User Roles:', roles);
  return roles;
}
```

### Removing Roles from User

```javascript
async function removeRolesFromUser(userId, roleIds) {
  await management.users.removeRoles(
    { id: userId },
    { roles: roleIds }
  );

  console.log('Roles removed');
}
```

### Getting User Permissions

```javascript
async function getUserPermissions(userId) {
  const permissions = await management.users.getPermissions({ id: userId });

  console.log('User Permissions:', permissions);
  return permissions;
}
```

### Assigning Permissions to User

```javascript
async function assignPermissionsToUser(userId, permissions) {
  await management.users.assignPermissions(
    { id: userId },
    {
      permissions: [
        { permission_name: 'read:messages', resource_server_identifier: 'https://api.example.com' },
        { permission_name: 'write:messages', resource_server_identifier: 'https://api.example.com' },
      ]
    }
  );

  console.log('Permissions assigned');
}
```

## Organization Management

### Creating an Organization

```javascript
async function createOrganization(name, displayName) {
  const org = await management.organizations.create({
    name,
    display_name: displayName,
  });

  return org;
}
```

### Adding Members to Organization

```javascript
async function addMemberToOrganization(orgId, userId) {
  await management.organizations.addMembers(
    { id: orgId },
    { members: [userId] }
  );

  console.log('Member added to organization');
}
```

### Getting Organization Members

```javascript
async function getOrganizationMembers(orgId) {
  const members = await management.organizations.getMembers({ id: orgId });

  return members;
}
```

### Assigning Roles to Organization Member

```javascript
async function assignOrgRoles(orgId, userId, roleIds) {
  await management.organizations.addMemberRoles(
    { id: orgId, user_id: userId },
    { roles: roleIds }
  );

  console.log('Organization roles assigned');
}
```

## Client Application Management

### Getting All Clients

```javascript
async function getAllClients() {
  const clients = await management.clients.getAll();

  return clients;
}
```

### Creating a Client

```javascript
async function createClient(name, type) {
  const client = await management.clients.create({
    name,
    app_type: type, // 'native', 'spa', 'regular_web', 'non_interactive'
    callbacks: ['http://localhost:3000/callback'],
    allowed_logout_urls: ['http://localhost:3000'],
  });

  return client;
}
```

### Updating a Client

```javascript
async function updateClient(clientId, updates) {
  const client = await management.clients.update(
    { client_id: clientId },
    updates
  );

  return client;
}
```

## Connection Management

### Getting All Connections

```javascript
async function getAllConnections() {
  const connections = await management.connections.getAll();

  return connections;
}
```

### Creating a Database Connection

```javascript
async function createDatabaseConnection(name) {
  const connection = await management.connections.create({
    name,
    strategy: 'auth0',
    enabled_clients: [process.env.AUTH0_CLIENT_ID],
  });

  return connection;
}
```

### Getting Connection by ID

```javascript
async function getConnection(connectionId) {
  const connection = await management.connections.get({ id: connectionId });

  return connection;
}
```

## Email Templates and Verification

### Sending Email Verification

```javascript
async function sendVerificationEmail(userId) {
  await management.jobs.verifyEmail({
    user_id: userId,
  });

  console.log('Verification email sent');
}
```

### Creating Email Verification Ticket

```javascript
async function createEmailVerificationTicket(userId) {
  const ticket = await management.tickets.verifyEmail({
    user_id: userId,
    result_url: 'https://example.com/verified',
  });

  console.log('Verification URL:', ticket.ticket);
  return ticket;
}
```

### Creating Password Change Ticket

```javascript
async function createPasswordChangeTicket(userId) {
  const ticket = await management.tickets.changePassword({
    user_id: userId,
    result_url: 'https://example.com/password-changed',
  });

  console.log('Password change URL:', ticket.ticket);
  return ticket;
}
```

## Pagination

### Manual Pagination

```javascript
async function getAllUsersPaginated() {
  let page = 0;
  const perPage = 50;
  let allUsers = [];
  let hasMore = true;

  while (hasMore) {
    const users = await management.users.getAll({
      page,
      per_page: perPage,
    });

    allUsers = allUsers.concat(users);
    hasMore = users.length === perPage;
    page++;
  }

  return allUsers;
}
```

### Using Pagination Iterator

```javascript
async function iterateAllUsers() {
  const users = [];

  for await (const user of management.users.getAll()) {
    users.push(user);
  }

  return users;
}
```

## Error Handling

The SDK provides comprehensive error handling with ManagementError and AuthenticationError types.

```javascript
import { ManagementClient, ManagementError } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

async function handleErrors() {
  try {
    const user = await management.users.get({ id: 'invalid-id' });
  } catch (err) {
    if (err instanceof ManagementError) {
      console.log('Status Code:', err.statusCode); // 404
      console.log('Error Message:', err.message);
      console.log('Error Body:', err.body);
      console.log('Raw Response:', err.rawResponse);
    } else {
      throw err;
    }
  }
}
```

### Common Error Status Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Advanced Configuration

### Custom Timeout

```javascript
const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  token: process.env.AUTH0_MANAGEMENT_API_TOKEN,
  timeout: 30000, // 30 seconds
});
```

### Retry Configuration

```javascript
const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  token: process.env.AUTH0_MANAGEMENT_API_TOKEN,
  retry: {
    enabled: true,
    maxRetries: 3,
  },
});
```

### Custom Headers

```javascript
async function makeRequestWithCustomHeaders() {
  const users = await management.users.getAll({}, {
    headers: {
      'X-Custom-Header': 'custom-value',
    },
  });

  return users;
}
```

### Abort Signal (Request Cancellation)

```javascript
async function cancelableRequest() {
  const controller = new AbortController();

  // Cancel after 5 seconds
  setTimeout(() => controller.abort(), 5000);

  try {
    const users = await management.users.getAll({}, {
      signal: controller.signal,
    });

    return users;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Request was cancelled');
    }
    throw err;
  }
}
```

## Logs and Monitoring

### Getting Logs

```javascript
async function getLogs() {
  const logs = await management.logs.getAll({
    per_page: 100,
    page: 0,
  });

  return logs;
}
```

### Filtering Logs by Type

```javascript
async function getLoginLogs() {
  const logs = await management.logs.getAll({
    q: 'type:s', // 's' = successful login
    per_page: 100,
  });

  return logs;
}
```

### Getting Log by ID

```javascript
async function getLogById(logId) {
  const log = await management.logs.get({ id: logId });

  return log;
}
```

## Guardian (MFA) Management

### Getting Guardian Enrollments

```javascript
async function getUserMFAEnrollments(userId) {
  const enrollments = await management.users.getGuardianEnrollments({ id: userId });

  return enrollments;
}
```

### Deleting Guardian Enrollment

```javascript
async function deleteMFAEnrollment(userId, enrollmentId) {
  await management.guardian.deleteEnrollment({ id: enrollmentId });

  console.log('MFA enrollment deleted');
}
```

## Runtime Compatibility

The Auth0 Node.js SDK v5 is compatible with:

- Node.js 20.19.0+
- Node.js 22.12.0+
- Node.js 24.0.0+
- Vercel Edge Functions
- Cloudflare Workers
- Deno
- Bun
- React Native

## Legacy Support

If you're migrating from v4.x, use the legacy exports:

```javascript
import { ManagementClient } from 'auth0/legacy';

// Old v4.x configuration format
const management = new ManagementClient({
  domain: 'tenant.auth0.com',
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
});
```

## Complete Example: User Registration and Login Flow

```javascript
import { ManagementClient, AuthenticationClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

async function registerAndLogin() {
  // 1. Create a new user
  const newUser = await management.users.create({
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    connection: 'Username-Password-Authentication',
    user_metadata: {
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  console.log('User created:', newUser.user_id);

  // 2. Send verification email
  await management.jobs.verifyEmail({
    user_id: newUser.user_id,
  });

  console.log('Verification email sent');

  // 3. Login user (after email verification)
  const loginResponse = await auth0.oauth.passwordGrant({
    username: 'john.doe@example.com',
    password: 'SecurePassword123!',
    audience: 'https://api.example.com',
    scope: 'openid profile email',
  });

  console.log('Access Token:', loginResponse.access_token);

  // 4. Get user profile
  const userInfo = new UserInfoClient({
    domain: process.env.AUTH0_DOMAIN,
  });

  const profile = await userInfo.getUserInfo(loginResponse.access_token);
  console.log('User Profile:', profile);

  return {
    user: newUser,
    tokens: loginResponse,
    profile,
  };
}
```

## Important Notes

### Security Best Practices

1. **Never expose client secrets** - Keep client secrets secure on the server side only
2. **Use environment variables** - Store credentials in environment variables, not in code
3. **Validate tokens** - Always validate tokens on the server side
4. **Use HTTPS** - Always use HTTPS in production
5. **Implement rate limiting** - Protect against brute force attacks
6. **Rotate credentials** - Regularly rotate API tokens and client secrets

### Management API Token

- Management API tokens expire after 24 hours
- Use client credentials grant for long-running applications
- Cache tokens and refresh before expiration

### Rate Limits

Auth0 enforces rate limits on API requests. Handle 429 errors gracefully:

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.statusCode === 429 && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw err;
    }
  }
}
```

### User Search Syntax

Use Lucene query syntax for user searches:

```javascript
// Search by email domain
q: 'email:"*@example.com"'

// Search by metadata
q: 'user_metadata.plan:"premium"'

// Search by multiple fields
q: 'email:"*@example.com" AND user_metadata.plan:"premium"'

// Search by created date
q: 'created_at:[2024-01-01 TO 2024-12-31]'
```

## JWT and Token Verification

The Node.js SDK focuses on Management/Authentication API access. For verifying inbound access tokens (RS256 from Auth0), pair it with `jose` or `jsonwebtoken` plus `jwks-rsa`.

### Verify Access Token with `jose` (Recommended)

```javascript
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
);

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_AUDIENCE,
  });
  return payload;
}
```

### Express Bearer-Token Middleware

```javascript
import { verifyAccessToken } from './auth.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_token' });
  }
  try {
    req.auth = await verifyAccessToken(header.slice(7));
    next();
  } catch (err) {
    res.status(401).json({ error: 'invalid_token', detail: err.message });
  }
}
```

### Fetch UserInfo from Access Token

```javascript
import { UserInfoClient } from 'auth0';

const userInfoClient = new UserInfoClient({
  domain: process.env.AUTH0_DOMAIN,
});

const profile = await userInfoClient.getUserInfo(accessToken);
```

## Useful Links

- Official Documentation: https://auth0.com/docs
- SDK Reference: https://auth0.github.io/node-auth0/
- GitHub Repository: https://github.com/auth0/node-auth0
- Community Forum: https://community.auth0.com/
- Auth0 Dashboard: https://manage.auth0.com/
- API Rate Limits: https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy
